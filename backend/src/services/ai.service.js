const AppError = require("../utils/appError");
const { generateAiPlan } = require("../ai/ai-engine");
const { supabaseAdmin } = require("../supabase/client");
const { normalizeSchedulePlan } = require("../utils/validators");

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

  try {
    const result = await generateAiPlan({
      userRequest: requestText,
      provider: "ollama",
      temperature: Number(process.env.AI_TEMPERATURE || 0.2),
    });

    if (!result.success) {
      throw new AppError("AI generation failed", 502);
    }

    if (result.data?.schedulePlan) {
      result.data.schedulePlan = normalizeSchedulePlan(result.data.schedulePlan);
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
