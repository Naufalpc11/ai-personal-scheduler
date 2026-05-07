const prisma = require("../prisma/client");
const AppError = require("../utils/appError");
const { generateAiPlan } = require("../ai/ai-engine");
const {
  clearPendingInteraction,
  getPendingInteraction,
  savePendingInteraction,
} = require("../ai/conversation-store");

// Normalizes a date-time string to a UTC date-only value.
const toDateOnly = (value) => {
  const date = new Date(value);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

// Persists task graph (task, subtasks, schedule) in a single transaction.
const handleAiResult = async (userId, payload) => {
  return prisma.$transaction(async (tx) => {
    const task = await tx.task.create({
      data: {
        userId,
        title: payload.title,
        description: payload.description || null,
        status: payload.status || "pending",
      },
    });

    if (payload.subtasks && payload.subtasks.length > 0) {
      await tx.subtask.createMany({
        data: payload.subtasks.map((title) => ({
          taskId: task.id,
          title,
          isCompleted: false,
        })),
      });
    }

    if (payload.schedule && payload.schedule.length > 0) {
      await tx.schedule.createMany({
        data: payload.schedule.map((item) => ({
          taskId: task.id,
          startTime: new Date(item.startTime),
          endTime: new Date(item.endTime),
          date: item.date ? new Date(item.date) : toDateOnly(item.startTime),
        })),
      });
    }

    const fullTask = await tx.task.findUnique({
      where: { id: task.id },
      include: {
        subtasks: true,
        schedules: true,
      },
    });

    return fullTask;
  });
};

// Delegates to AI engine to produce validated planning output.
const generateAiResult = async (userId, payload) => {
  return runAiConversation(userId, payload, { autoSaveOnConfirmation: false });
};

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const isConfirmationText = (value) => /^(iya|ya|ok|oke|siap|lanjut|boleh|gas|yes|confirm|konfirmasi)$/i.test(normalizeText(value));

const isNegativeText = (value) => /^(tidak|nggak|gak|batal|cancel|jangan)$/i.test(normalizeText(value));

const hasTimeMention = (value) => /(\b\d{1,2}(:\d{2})?\s*(pagi|siang|sore|malam|am|pm)?\b)|\bjam\b|\bpukul\b|\bsubuh\b|\bsiang\b|\bsore\b|\bmalam\b/i.test(value);

const isSchedulingRequest = (value) => /(kerja|meeting|kelas|belajar|rapat|review|tugas|task|jadwal|schedule|atur|buat)/i.test(value);

const extractActivity = (value) => {
  const cleaned = normalizeText(value)
    .replace(/\b(hari ini|besok|nanti|minggu ini|minggu depan|senin|selasa|rabu|kamis|jumat|sabtu|minggu)\b/gi, "")
    .replace(/\b(aku mau|saya mau|mau|ingin|pengin|rencana|akan)\b/gi, "")
    .replace(/\b(jam|pukul)\s*\d{1,2}(:\d{2})?\s*(pagi|siang|sore|malam|am|pm)?\b/gi, "")
    .replace(/\b\d{1,2}(:\d{2})?\s*(pagi|siang|sore|malam|am|pm)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned || "kegiatan ini";
};

const buildClarificationQuestion = (requestText) => {
  const activity = extractActivity(requestText);
  return `Di jam berapa kamu mau ${activity} hari ini?`;
};

const buildClarificationPayload = (requestText, question) => ({
  phase: "clarify",
  nextQuestion: question,
  userRequest: requestText,
  meta: {
    model: "heuristic-clarifier",
    generatedAt: new Date().toISOString(),
    confidence: 0.92,
    needsUserConfirmation: false,
    assumptions: ["Request butuh jam spesifik sebelum jadwal bisa dibuat"],
  },
});

const buildConfirmationPayload = (generated, question, pendingDraftId) => ({
  phase: "confirm",
  nextQuestion: question,
  pendingDraftId,
  provider: generated.provider,
  model: generated.model,
  output: generated.data,
});

const getCurrentPending = (userId) => getPendingInteraction(userId);

const createPendingDraft = ({ generated, persistablePayload, userRequest }) => ({
  id: `draft_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  userRequest,
  provider: generated.provider,
  model: generated.model,
  generated,
  persistablePayload,
});

const createPendingClarification = ({ userRequest, nextQuestion }) => ({
  id: `clarify_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  originalRequest: userRequest,
  nextQuestion,
});

const shouldAskClarification = (payload) => {
  const userRequest = payload.userRequest || "";
  const intent = payload.intent || "create_task";

  if (!(intent === "create_task" || intent === "auto_schedule")) {
    return false;
  }

  if (!isSchedulingRequest(userRequest)) {
    return false;
  }

  const hasTime = hasTimeMention(userRequest);
  return !hasTime;
};

const runAiConversation = async (userId, payload, { autoSaveOnConfirmation } = { autoSaveOnConfirmation: false }) => {
  const userRequest = payload.userRequest || "";
  const normalizedRequest = normalizeText(userRequest);
  const pending = getCurrentPending(userId);

  if (pending?.pendingDraft && isConfirmationText(normalizedRequest)) {
    if (autoSaveOnConfirmation) {
      const savedTask = await handleAiResult(userId, pending.pendingDraft.persistablePayload);
      clearPendingInteraction(userId);

      return {
        phase: "saved",
        message: "Jadwal berhasil disimpan",
        task: savedTask,
        pendingDraftId: pending.pendingDraft.id,
      };
    }

    return {
      phase: "confirm",
      nextQuestion: "Jadwal sudah aku susun. Apakah kamu ingin aku simpan ke task dan jadwal sekarang?",
      pendingDraftId: pending.pendingDraft.id,
      provider: pending.pendingDraft.provider,
      model: pending.pendingDraft.model,
      output: pending.pendingDraft.generated?.data || pending.pendingDraft.persistablePayload,
    };
  }

  if (pending?.pendingDraft && isNegativeText(normalizedRequest)) {
    clearPendingInteraction(userId);

    return {
      phase: "cancelled",
      message: "Oke, jadwal tidak disimpan.",
      pendingDraftId: pending.pendingDraft.id,
    };
  }

  if (pending?.pendingClarification && !isConfirmationText(normalizedRequest)) {
    const combinedRequest = `${pending.pendingClarification.originalRequest}. ${userRequest}`;
    const generated = await generateAiPlan({ ...payload, userRequest: combinedRequest });
    const persistablePayload = transformGeneratedPlanToPayload(generated.data);
    const pendingDraft = createPendingDraft({ generated, persistablePayload, userRequest: combinedRequest });

    savePendingInteraction(userId, {
      pendingClarification: null,
      pendingDraft,
    });

    return {
      phase: "confirm",
      nextQuestion: "Jadwal sudah aku susun. Apakah kamu ingin aku simpan ke task dan jadwal sekarang?",
      pendingDraftId: pendingDraft.id,
      provider: generated.provider,
      model: generated.model,
      output: generated.data,
    };
  }

  if (shouldAskClarification(payload)) {
    const nextQuestion = buildClarificationQuestion(userRequest);
    const pendingClarification = createPendingClarification({ userRequest, nextQuestion });

    savePendingInteraction(userId, {
      pendingClarification,
      pendingDraft: null,
    });

    return buildClarificationPayload(userRequest, nextQuestion);
  }

  const generated = await generateAiPlan(payload);
  const persistablePayload = transformGeneratedPlanToPayload(generated.data);
  const pendingDraft = createPendingDraft({ generated, persistablePayload, userRequest });

  savePendingInteraction(userId, {
    pendingClarification: null,
    pendingDraft,
  });

  return buildConfirmationPayload(
    generated,
    "Jadwal sudah aku buat. Apakah kamu ingin aku simpan ke task dan jadwal sekarang?",
    pendingDraft.id
  );
};

// Maps LLM contract output into the persistence payload shape.
const transformGeneratedPlanToPayload = (plan) => {
  const title = plan?.mainTask?.title || plan?.userRequest;

  if (!title) {
    throw new AppError("Generated plan is missing a task title", 400);
  }

  return {
    title,
    description: plan?.mainTask?.description || null,
    status: plan?.mainTask?.status || "pending",
    subtasks: Array.isArray(plan?.subtasks) ? plan.subtasks.map((item) => item.title) : [],
    schedule: Array.isArray(plan?.schedulePlan)
      ? plan.schedulePlan.map((item) => ({
          startTime: item.startTime,
          endTime: item.endTime,
          date: item.date,
        }))
      : [],
  };
};

// Executes generate + transform + persist in one service call.
const generateAndSaveAiResult = async (userId, payload) => {
  const result = await runAiConversation(userId, payload, { autoSaveOnConfirmation: true });

  if (result.phase === "confirm") {
    return {
      ...result,
      message: result.nextQuestion,
    };
  }

  return result;
};

module.exports = {
  handleAiResult,
  generateAiResult,
  generateAndSaveAiResult,
  transformGeneratedPlanToPayload,
};
