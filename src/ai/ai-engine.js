const fs = require("fs");
const path = require("path");
const AppError = require("../utils/appError");
const { parseLlmJson, validateLlmOutput } = require("./llm-contract");
const { AiProviderError, createProviderRunner } = require("./providers");

const contractPromptPath = path.join(__dirname, "prompts", "ollama-system-contract.txt");
const contractPrompt = fs.readFileSync(contractPromptPath, "utf8");

const providerConfigs = {
  openai: {
    baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || "gpt-5.4-mini",
  },
  gemini: {
    baseUrl: process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta",
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  },
};

const defaultProviderOrder = (preferredProvider) => {
  const configuredOrder = (process.env.AI_PROVIDER_ORDER || "openai,gemini")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const uniqueOrder = [];

  for (const provider of [preferredProvider, ...configuredOrder]) {
    if (!provider || uniqueOrder.includes(provider)) {
      continue;
    }

    if (providerConfigs[provider]) {
      uniqueOrder.push(provider);
    }
  }

  return uniqueOrder;
};

const inferIntentFromRequest = (userRequest) => {
  const normalized = userRequest.toLowerCase();

  if (/(jadwal ulang|reschedule|bentrok|konflik|tabrakan)/i.test(normalized)) {
    return "reschedule";
  }

  if (/(saran|rekomendasi|tips|recommend)/i.test(normalized)) {
    return "recommend";
  }

  if (/(pecah|breakdown|subtask|langkah|step)/i.test(normalized)) {
    return "add_subtasks";
  }

  if (/(atur jadwal|jadwalkan|schedule|slot waktu|kalender)/i.test(normalized)) {
    return "auto_schedule";
  }

  return "create_task";
};

const resolveIntent = (userRequest, explicitIntent) => explicitIntent || inferIntentFromRequest(userRequest);

const resolveProviderOrder = ({ provider, intent, userRequest }) => {
  const orderedCandidates =
    provider && provider !== "auto"
      ? [provider, ...defaultProviderOrder(provider)]
      : (() => {
          const requestLength = userRequest.length;
          const qualityFirst = intent === "reschedule" || requestLength > 180;
          return qualityFirst ? ["openai", "gemini"] : ["gemini", "openai"];
        })();

  const uniqueProviders = [];

  for (const candidate of orderedCandidates) {
    if (!candidate || uniqueProviders.includes(candidate) || !providerConfigs[candidate]) {
      continue;
    }

    uniqueProviders.push(candidate);
  }

  return uniqueProviders;
};

const buildSystemPrompt = ({ providerName, intent, locale, timezone, context }) => {
  const contextBlock = JSON.stringify(
    {
      intent,
      locale,
      timezone,
      context: context || {},
      outputRules: [
        "Return a single valid JSON object only.",
        "Do not include markdown, code fences, or explanations.",
        "Follow the scheduler contract exactly.",
        "Use ISO 8601 date-time strings with timezone offsets.",
      ],
      providerHint: providerName,
    },
    null,
    2
  );

  return `${contractPrompt.trim()}\n\nProvider: ${providerName}\n\nContract context:\n${contextBlock}`;
};

const buildUserPrompt = ({ userRequest, intent, locale, timezone, context }) =>
  JSON.stringify(
    {
      userRequest,
      intent,
      locale,
      timezone,
      context: context || {},
    },
    null,
    2
  );

const createMessages = (payload, providerName, intent) => {
  const systemPrompt = buildSystemPrompt({
    providerName,
    intent,
    locale: payload.locale,
    timezone: payload.timezone,
    context: payload.context,
  });

  const userPrompt = buildUserPrompt({
    userRequest: payload.userRequest,
    intent,
    locale: payload.locale,
    timezone: payload.timezone,
    context: payload.context,
  });

  return {
    systemPrompt,
    userPrompt,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  };
};

const shouldFallback = (error) => {
  if (error instanceof AiProviderError) {
    return error.retryable;
  }

  if (error && typeof error === "object") {
    const statusCode = error.statusCode || error.status;
    return [401, 402, 403, 408, 429].includes(statusCode) || statusCode >= 500;
  }

  return false;
};

const buildProviderConfig = (providerName, payload) => {
  const config = providerConfigs[providerName];

  if (!config) {
    throw new AppError(`Unknown AI provider: ${providerName}`, 400);
  }

  return {
    provider: providerName,
    baseUrl: config.baseUrl,
    apiKey: config.apiKey,
    model: config.model,
    temperature: payload.temperature ?? Number(process.env.AI_TEMPERATURE || 0.2),
  };
};

const normalizeOutput = (output, providerName, intent, fallbackUserRequest) => {
  if (!output.meta) {
    output.meta = {};
  }

  output.version = output.version || "1.0";
  output.intent = output.intent || intent;
  output.userRequest = output.userRequest || fallbackUserRequest || "";
  output.locale = output.locale || "id-ID";
  output.timezone = output.timezone || "Asia/Jakarta";
  output.meta.model = output.meta.model || providerName;
  output.meta.generatedAt = output.meta.generatedAt || new Date().toISOString();
  output.meta.confidence = typeof output.meta.confidence === "number" ? output.meta.confidence : 0.7;
  output.meta.needsUserConfirmation = Boolean(output.meta.needsUserConfirmation);
  output.meta.assumptions = Array.isArray(output.meta.assumptions) ? output.meta.assumptions : [];
  output.subtasks = Array.isArray(output.subtasks) ? output.subtasks : [];
  output.estimatedDurationPerSubtask = Array.isArray(output.estimatedDurationPerSubtask)
    ? output.estimatedDurationPerSubtask
    : [];
  output.schedulePlan = Array.isArray(output.schedulePlan) ? output.schedulePlan : [];
  output.recommendations = Array.isArray(output.recommendations) ? output.recommendations : [];

  return output;
};

const generateAiPlan = async (payload) => {
  const intent = resolveIntent(payload.userRequest, payload.intent);
  const providerOrder = resolveProviderOrder({ provider: payload.provider, intent, userRequest: payload.userRequest });
  const errors = [];

  for (const providerName of providerOrder) {
    const runner = createProviderRunner(providerName, buildProviderConfig(providerName, payload));
    const { messages, systemPrompt, userPrompt } = createMessages(payload, providerName, intent);

    try {
      const response = await runner({
        messages,
        systemPrompt,
        userPrompt,
        temperature: payload.temperature ?? Number(process.env.AI_TEMPERATURE || 0.2),
      });

      const parsed = parseLlmJson(response.content || response.raw);
      const validated = validateLlmOutput(
        normalizeOutput(parsed, response.model || providerName, intent, payload.userRequest)
      );

      return {
        success: true,
        provider: providerName,
        model: response.model || providerName,
        data: validated,
      };
    } catch (error) {
      errors.push({
        provider: providerName,
        message: error.message,
        retryable: shouldFallback(error),
      });

      if (!shouldFallback(error)) {
        throw error;
      }
    }
  }

  throw new AppError(
    `All AI providers failed: ${errors.map((item) => `${item.provider} (${item.message})`).join(" | ")}`,
    502
  );
};

module.exports = {
  generateAiPlan,
  resolveIntent,
  resolveProviderOrder,
};
