const fs = require("fs");
const path = require("path");
const AppError = require("../utils/appError");
const { parseLlmJson, validateLlmOutput } = require("./llm-contract");
const { AiProviderError, createProviderRunner, normalizeBaseUrl } = require("./providers");

// Memuat prompt kontrak sebagai instruksi dasar untuk seluruh provider.
const contractPromptPath = path.join(__dirname, "prompts", "ollama-system-contract.txt");
const contractPrompt = fs.readFileSync(contractPromptPath, "utf8");

// Konfigurasi provider cloud yang aktif untuk proses generate AI.
const providerConfigs = {
  ollama: {
    // Endpoint Ollama lokal (OpenAI-compatible) untuk model yang dijalankan di mesin sendiri.
    baseUrl: normalizeBaseUrl(process.env.OLLAMA_BASE_URL || "http://localhost:11434", "/v1"),
    apiKey: process.env.OLLAMA_API_KEY,
    model: process.env.OLLAMA_MODEL || "qwen2.5:1.5b",
  },
};

// Menyusun urutan provider dari ENV dan menghapus duplikasi.
const defaultProviderOrder = (preferredProvider) => {
  // Urutan default fallback bisa diatur lewat ENV.
  const configuredOrder = (process.env.AI_PROVIDER_ORDER || "ollama")
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

// Menebak intent scheduler dari teks pengguna saat intent tidak dikirim.
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

// Memprioritaskan intent eksplisit, jika kosong pakai hasil inferensi.
const resolveIntent = (userRequest, explicitIntent) => explicitIntent || inferIntentFromRequest(userRequest);

// Menentukan urutan percobaan provider berdasarkan request dan kompleksitas.
const resolveProviderOrder = ({ provider, intent, userRequest }) => {
  // Jika user memilih provider spesifik, provider itu dicoba lebih dulu.
  const orderedCandidates =
    provider && provider !== "auto"
      ? [provider, ...defaultProviderOrder(provider)]
      : (() => {
          // Mode auto di project ini dipaksa hanya lewat Ollama.
          return ["ollama"];
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

// Menambahkan kontrak dan konteks runtime ke system prompt.
const buildSystemPrompt = ({ providerName, intent, locale, timezone, context }) => {
  // Context block ini membantu model tetap patuh kontrak tanpa output naratif tambahan.
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

// Menyerialkan konteks request pengguna ke JSON agar prompt konsisten.
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

// Membuat payload prompt netral provider (messages + teks prompt mentah).
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
    // systemPrompt/userPrompt disertakan agar provider tertentu bisa pakai format non-chat jika perlu.
    systemPrompt,
    userPrompt,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  };
};

// Menentukan apakah error perlu memicu fallback ke provider lain.
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

// Menggabungkan konfigurasi provider statis dan opsi generate dari request.
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

// Melengkapi field opsional yang kosong sebelum validasi schema.
const normalizeOutput = (output, providerName, intent, fallbackUserRequest) => {
  if (!output.meta) {
    output.meta = {};
  }

  // Melengkapi field penting agar validasi kontrak tetap konsisten antar provider.
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

// Orkestrasi utama: pilih provider, panggil model, parse JSON, validasi, lalu fallback jika perlu.
const generateAiPlan = async (payload) => {
  const intent = resolveIntent(payload.userRequest, payload.intent);
  const providerOrder = resolveProviderOrder({ provider: payload.provider, intent, userRequest: payload.userRequest });
  const errors = [];

  // Coba provider satu per satu sampai ada output valid atau semua gagal.
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
      // Simpan jejak error agar mudah ditelusuri saat semua provider gagal.
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

// Mengekspor fungsi utama dan helper yang dipakai service/tes.
module.exports = {
  generateAiPlan,
  resolveIntent,
  resolveProviderOrder,
};
