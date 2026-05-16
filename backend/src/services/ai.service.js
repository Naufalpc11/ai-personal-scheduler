const AppError = require("../utils/appError");
const { generateAiPlan } = require("../ai/ai-engine");
const { supabaseAdmin } = require("../supabase/client");
const { normalizeSchedulePlan } = require("../utils/validators");

const SCHEDULING_KEYWORDS = /\b(jadwal|jadwalkan|schedule|atur|susun|buat(?:kan|in)?|rencana|agenda|meeting|kelas|belajar|ujian|reminder|review|rapat|appointment|reschedule|pindah|tugas)\b/i;
const MEDICAL_KEYWORDS = /\b(obat|medis|medication|minum obat|cek obat|vitamin|tablet|kapsul|sirup)\b/i;
const GREETING_ONLY = /^(?:halo|hai|hi|hey|p|ass?alam(?:ualaikum|ualaikum wr wb)?)(?:\s*!?\s*)?$/i;

const extractTimeHint = (text) => {
  const input = text.toLowerCase();
  const timeMatch = input.match(/\b(?:jam|pukul)\s*(\d{1,2})(?:[:.](\d{2}))?\b/);
  const compactMatch = input.match(/\b(\d{1,2})(?:[:.](\d{2}))\b/);

  const periodMatch = input.match(/\b(pagi|siang|sore|malam)\b/);

  let hour = 9;
  let minute = 0;

  if (timeMatch) {
    hour = Number(timeMatch[1]);
    minute = Number(timeMatch[2] || 0);
  } else if (compactMatch) {
    hour = Number(compactMatch[1]);
    minute = Number(compactMatch[2] || 0);
  } else if (periodMatch) {
    const period = periodMatch[1];
    if (period === "pagi") hour = 8;
    if (period === "siang") hour = 13;
    if (period === "sore") hour = 16;
    if (period === "malam") hour = 19;
  }

  if (Number.isNaN(hour) || hour < 0 || hour > 23) {
    hour = 9;
  }

  if (Number.isNaN(minute) || minute < 0 || minute > 59) {
    minute = 0;
  }

  return { hour, minute };
};

const buildRescuedScheduleOutput = (requestText) => {
  const now = new Date();
  const normalized = requestText.trim();
  const lowered = normalized.toLowerCase();
  const date = new Date(now);

  if (/\bbesok\b/.test(lowered)) {
    date.setDate(date.getDate() + 1);
  }

  const { hour, minute } = extractTimeHint(lowered);
  const start = new Date(date);
  start.setHours(hour, minute, 0, 0);

  const durationMinutes = /\b(\d+)\s*jam\b/.test(lowered)
    ? Math.max(60, Number(lowered.match(/\b(\d+)\s*jam\b/)?.[1] || 1) * 60)
    : 60;

  const end = new Date(start);
  end.setMinutes(end.getMinutes() + durationMinutes);

  const title = normalized.length > 80 ? `${normalized.slice(0, 77)}...` : normalized;

  return {
    version: "1.0",
    intent: "create_task",
    userRequest: normalized,
    locale: "id-ID",
    timezone: "Asia/Jakarta",
    mainTask: {
      title,
      description: `Jadwal otomatis dibuat dari request: ${normalized}`,
      priority: "medium",
      status: "pending",
    },
    subtasks: [
      {
        title,
        notes: null,
        order: 1,
        estimatedMinutes: durationMinutes,
        isFlexible: false,
      },
    ],
    schedulingConstraints: {
      deadline: null,
      preferredTimeWindows: [],
      fixedEvents: [],
      maxDailyFocusMinutes: 240,
      allowWeekend: true,
    },
    schedulePlan: [
      {
        subtaskTitle: title,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        date: start.toISOString(),
        reason: "Rescue fallback dibuat karena model mengembalikan out_of_scope untuk request jadwal yang valid.",
      },
    ],
    recommendations: [],
    meta: {
      model: "heuristic-rescue",
      generatedAt: now.toISOString(),
      confidence: 0.55,
      needsUserConfirmation: true,
      assumptions: ["Request pengguna jelas berkaitan dengan penjadwalan, tetapi model salah klasifikasi."],
      humanMessage: "Aku sempat ragu dengan request ini, jadi aku buat jadwal awal dulu. Silakan cek dan sesuaikan kalau perlu.",
    },
  };
};

const buildClarificationOutput = (requestText, reason) => {
  const nowIso = new Date().toISOString();

  return {
    version: "1.0",
    intent: "recommend",
    userRequest: requestText.trim(),
    locale: "id-ID",
    timezone: "Asia/Jakarta",
    mainTask: {
      title: "Bantu susun jadwal",
      description: "AI menunggu detail tambahan agar jadwal bisa dibuat lebih tepat.",
      priority: "medium",
      status: "pending",
    },
    subtasks: [],
    estimatedDurationPerSubtask: [],
    schedulingConstraints: {
      deadline: null,
      preferredTimeWindows: [],
      fixedEvents: [],
      maxDailyFocusMinutes: 240,
      allowWeekend: true,
    },
    schedulePlan: [],
    recommendations: [
      {
        type: "next_action",
        message:
          reason === "greeting"
            ? "Ceritakan rencana yang ingin dijadwalkan, misalnya belajar, meeting, atau minum obat."
            : "Tambahkan jam, durasi, atau hari agar aku bisa bikin jadwal yang pas.",
        priority: "medium",
      },
    ],
    meta: {
      model: "heuristic-clarifier",
      generatedAt: nowIso,
      confidence: 0.6,
      needsUserConfirmation: true,
      assumptions: ["Request masih terlalu singkat untuk disusun menjadi jadwal final."],
      humanMessage:
        reason === "greeting"
          ? "Halo juga. Sebutkan rencana yang mau dijadwalkan, nanti aku bantu susun."
          : "Bisa. Kasih tahu jam atau hari yang kamu mau, nanti aku bantu buat jadwalnya.",
    },
  };
};

const buildFallbackOutput = (requestText) => {
  const nowIso = new Date().toISOString();
  const normalized = requestText.trim();

  // If the user greets another person (e.g., "halo rafi"), return identity clarification.
  const isGreetingToOther = /^(?:hi|halo|hai|hey)\s+\p{L}+$/iu.test(normalized) || /^(?:hi|halo|hai|hey)\b.*\b(to|untuk)\b.*\p{L}+$/iu.test(normalized);

  const refusalMessage = isGreetingToOther
    ? "Aku AI Scheduler, bukan nama lain yang kamu sebut. Ada yang mau kamu atur jadwalnya?"
    : "Mohon maaf, aku tidak dapat merespon pertanyaan di luar konteks penjadwalan. Aku adalah AI khusus untuk mengatur jadwal harianmu.";

  return {
    version: "1.0",
    intent: "out_of_scope",
    userRequest: normalized,
    locale: "id-ID",
    timezone: "Asia/Jakarta",
    mainTask: null,
    subtasks: [],
    estimatedDurationPerSubtask: [],
    schedulingConstraints: null,
    schedulePlan: [],
    recommendations: [],
    meta: {
      model: "fallback-local",
      generatedAt: nowIso,
      confidence: 0.0,
      needsUserConfirmation: false,
      assumptions: ["LLM fallback digunakan karena respons model tidak valid"],
      refusalMessage,
    },
  };
};

const logAiInteraction = async ({ taskId, actionType, inputPrompt, aiResponse, modelUsed }) => {
  try {
    const payload = {
      task_id: taskId ?? null,
      action_type: actionType || "ai_generate",
      input_prompt: inputPrompt,
      ai_response: aiResponse,
      model_used: modelUsed || null,
    };

    const { error } = await supabaseAdmin.from("ai_logs").insert(payload);
    if (error) {
      console.error("Failed to insert ai_logs:", error.message);
    }
  } catch (error) {
    console.error("Unexpected ai_logs insert error:", error.message);
  }
};

const generateAiResult = async (userRequest, userId, options = {}) => {
  if (!userRequest || userRequest.trim().length === 0) {
    throw new AppError("User request cannot be empty", 400);
  }

  const requestText = userRequest.trim();

  if (GREETING_ONLY.test(requestText)) {
    const clarified = buildClarificationOutput(requestText, "greeting");

    await logAiInteraction({
      taskId: options.taskId,
      actionType: "recommend",
      inputPrompt: requestText,
      aiResponse: JSON.stringify(clarified),
      modelUsed: clarified.meta.model,
    });

    return {
      output: clarified,
      provider: "heuristic-clarifier",
      model: clarified.meta.model,
    };
  }

  if (MEDICAL_KEYWORDS.test(requestText) && !SCHEDULING_KEYWORDS.test(requestText)) {
    const clarified = buildClarificationOutput(requestText, "medical");
    clarified.intent = "recommend";
    clarified.recommendations = [
      {
        type: "next_action",
        message: "Sebutkan jam minum obat atau frekuensi harian, nanti aku bantu buat jadwal pengingatnya.",
        priority: "medium",
      },
    ];
    clarified.meta.humanMessage = "Bisa. Sebutkan jam minum obat atau frekuensinya, nanti aku bantu jadwalkan.";

    await logAiInteraction({
      taskId: options.taskId,
      actionType: "recommend",
      inputPrompt: requestText,
      aiResponse: JSON.stringify(clarified),
      modelUsed: clarified.meta.model,
    });

    return {
      output: clarified,
      provider: "heuristic-clarifier",
      model: clarified.meta.model,
    };
  }

  try {
    const result = await generateAiPlan({
      userRequest: requestText,
      provider: "gemini",
      temperature: Number(process.env.AI_TEMPERATURE || 0.2),
    });

    if (!result.success) {
      throw new AppError("AI generation failed", 502);
    }

    if (result.data?.schedulePlan) {
      result.data.schedulePlan = normalizeSchedulePlan(result.data.schedulePlan);
    }

    if (result.data?.intent === "out_of_scope" && SCHEDULING_KEYWORDS.test(requestText)) {
      const rescued = buildRescuedScheduleOutput(requestText);
      rescued.schedulePlan = normalizeSchedulePlan(rescued.schedulePlan);

      result.output = rescued;
      result.data = rescued;
      result.provider = "heuristic-rescue";
      result.model = rescued.meta.model;
    }

    const responsePayload = {
      output: result.data,
      provider: result.provider,
      model: result.model,
    };

    await logAiInteraction({
      taskId: options.taskId,
      actionType: result.data?.intent || "ai_generate",
      inputPrompt: requestText,
      aiResponse: JSON.stringify(result.data),
      modelUsed: result.model,
    });

    return responsePayload;
  } catch (error) {
    const fallback = buildFallbackOutput(requestText);

    await logAiInteraction({
      taskId: options.taskId,
      actionType: fallback.intent,
      inputPrompt: requestText,
      aiResponse: JSON.stringify(fallback),
      modelUsed: fallback.meta.model,
    });

    return {
      output: fallback,
      provider: "fallback",
      model: fallback.meta.model,
      warning: error?.message || "LLM output fallback applied",
    };
  }
};

module.exports = {
  generateAiResult,
};
