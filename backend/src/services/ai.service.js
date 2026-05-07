const AppError = require("../utils/appError");
const { generateAiPlan } = require("../ai/ai-engine");

const isGreeting = (text) => /^(halo|hai|hi|hello|pagi|siang|sore|malam)\b/i.test(text.trim());

const isOutOfScopeQuestion = (text) =>
  /(siapa\s+presiden|harga\s+saham|skor\s+bola|berita\s+hari\s+ini|cuaca\s+hari\s+ini)/i.test(text);

const buildFallbackOutput = (requestText) => {
  const nowIso = new Date().toISOString();

  if (isOutOfScopeQuestion(requestText)) {
    return {
      version: "1.0",
      intent: "out_of_scope",
      userRequest: requestText,
      locale: "id-ID",
      timezone: "Asia/Jakarta",
      subtasks: [],
      estimatedDurationPerSubtask: [],
      schedulePlan: [],
      recommendations: [],
      meta: {
        model: "fallback-local",
        generatedAt: nowIso,
        confidence: 0.45,
        needsUserConfirmation: false,
        assumptions: ["User meminta topik di luar domain penjadwalan"],
        refusalMessage:
          "Maaf, saya fokus pada penjadwalan tugas. Saya bisa bantu membuat atau mengatur ulang jadwalmu.",
      },
    };
  }

  const greetingMessage = isGreeting(requestText)
    ? "Halo! Saya siap bantu urusan jadwal. Coba tulis rencanamu beserta jam/durasi, misalnya: Besok jam 9 belajar AI 2 jam."
    : "Saya bisa bantu menyusun jadwal. Jelaskan aktivitasmu beserta waktu/durasinya agar saya buatkan rencana yang pas.";

  return {
    version: "1.0",
    intent: "create_task",
    userRequest: requestText,
    locale: "id-ID",
    timezone: "Asia/Jakarta",
    subtasks: [],
    estimatedDurationPerSubtask: [],
    schedulePlan: [],
    recommendations: [],
    meta: {
      model: "fallback-local",
      generatedAt: nowIso,
      confidence: 0.55,
      needsUserConfirmation: true,
      assumptions: ["Butuh detail tambahan sebelum membuat jadwal final"],
      humanMessage: greetingMessage,
    },
  };
};

const generateAiResult = async (userRequest, userId) => {
  if (!userRequest || userRequest.trim().length === 0) {
    throw new AppError("User request cannot be empty", 400);
  }

  const requestText = userRequest.trim();

  try {
    const result = await generateAiPlan({
      userRequest: requestText,
      provider: "ollama",
      temperature: Number(process.env.AI_TEMPERATURE || 0.2),
    });

    if (!result.success) {
      throw new AppError("AI generation failed", 502);
    }

    return {
      output: result.data,
      provider: result.provider,
      model: result.model,
    };
  } catch (error) {
    // Fallback agar UI tetap mendapat respons user-facing saat model gagal parse/validasi.
    const fallback = buildFallbackOutput(requestText);

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
