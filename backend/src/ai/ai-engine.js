const fs = require("fs");
const path = require("path");
const AppError = require("../utils/appError");
const { parseLlmJson, validateLlmOutput } = require("./llm-contract");
const { AiProviderError, createProviderRunner } = require("./providers");

// Memuat prompt kontrak sebagai instruksi dasar untuk seluruh provider.
const contractPromptPath = path.join(__dirname, "prompts", "gemini-system-contract.txt");
const contractPrompt = fs.readFileSync(contractPromptPath, "utf8");

// Konfigurasi provider cloud yang aktif untuk proses generate AI.
const providerConfigs = {
  gemini: {
    // Gemini API dari AI Studio untuk model cloud yang langsung siap pakai.
    baseUrl: (process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta").trim().replace(/\/$/, ""),
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
    responseMimeType: process.env.GEMINI_RESPONSE_MIME_TYPE || "application/json",
  },
};

// Menyusun urutan provider dari ENV dan menghapus duplikasi.
const defaultProviderOrder = (preferredProvider) => {
  // Urutan default fallback bisa diatur lewat ENV.
  const configuredOrder = (process.env.AI_PROVIDER_ORDER || "gemini")
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
          // Mode auto di project ini dipaksa hanya lewat Gemini.
          return ["gemini"];
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
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Ambil tanggal dengan format rapi (YYYY-MM-DD)
  const formatDate = (date) => {
    const d = new Date(date.toLocaleString("en-US", { timeZone: timezone || "Asia/Makassar" }));
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const todayStr = formatDate(now);
  const tomorrowStr = formatDate(tomorrow);
  const currentTime = now.toLocaleTimeString(locale || "id-ID", { timeZone: timezone || "Asia/Makassar", hour: '2-digit', minute:'2-digit' });

  return `${contractPrompt.trim()}

  Provider: ${providerName}

  INFORMASI WAKTU PENTING (JANGAN SAMPAI SALAH):
  - Jam Sekarang: ${currentTime}
  - Tanggal HARI INI: ${todayStr}
  - Tanggal BESOK: ${tomorrowStr}

  CRITICAL RULES:
  1. Return ONLY a single valid JSON object. DO NOT wrap it in markdown json blocks.
  2. Decide the intent by meaning, not by keyword matching. Read the user's request semantically.
  3. If the request is about scheduling, planning, time management, task breakdown, rescheduling, or recommendations, keep it IN SCOPE.
  4. If the request is not about scheduling/planning, set intent to out_of_scope and use a short refusal inside meta.refusalMessage.
  5. Questions that are personal, religious, political, general knowledge, coding, or unrelated to scheduling are OUT OF SCOPE.
  6. Ambiguous or very short requests that could still relate to planning should stay IN SCOPE and set meta.needsUserConfirmation=true with a clear meta.humanMessage.
  7. Keep fixedEvents empty [] unless conflicting events are mentioned.
  8. Use the correct date for today or tomorrow when the user explicitly mentions them.
  9. Use 24-hour time and valid ISO 8601 with timezone offset. Never output invalid times like 24:00.

  EXPECTED JSON TEMPLATE (Copy this exact structure but FILL in the correct values):
  {
    "version": "1.0",
    "intent": "${intent || 'create_task'}",
    "mainTask": { "title": "...", "description": "...", "priority": "medium", "status": "pending" },
    "subtasks": [ { "title": "...", "notes": null, "order": 1, "estimatedMinutes": 60, "isFlexible": false } ],
    "schedulingConstraints": { "deadline": null, "preferredTimeWindows": [], "fixedEvents": [], "maxDailyFocusMinutes": 240, "allowWeekend": true },
    "schedulePlan": [ { "subtaskTitle": "...", "startTime": "YYYY-MM-DDTHH:mm:ss+08:00", "endTime": "YYYY-MM-DDTHH:mm:ss+08:00", "date": "YYYY-MM-DDTHH:mm:ss+08:00", "reason": "..." } ],
    "recommendations": [],
    "meta": { "model": "${providerName}", "generatedAt": "${now.toISOString()}", "confidence": 0.9, "needsUserConfirmation": false, "assumptions": [] }
  }`;
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
    responseMimeType: config.responseMimeType,
    temperature: payload.temperature ?? Number(process.env.AI_TEMPERATURE || 0.2),
  };
};

// Melengkapi field opsional yang kosong sebelum validasi schema.
const normalizeOutput = (output, providerName, intent, fallbackUserRequest) => {
  if (!output.meta) {
    output.meta = {};
  }

  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const getWeekday = (isoString) => {
    try {
      const date = new Date(isoString);
      if (Number.isNaN(date.getTime())) {
        return "monday";
      }

      return dayNames[date.getDay()] || "monday";
    } catch {
      return "monday";
    }
  };

  const extractTimeOnly = (isoString) => {
    try {
      const date = new Date(isoString);
      if (Number.isNaN(date.getTime())) {
        return isoString;
      }

      return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    } catch {
      return isoString;
    }
  };

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

  if (output.intent === "out_of_scope") {
    output.mainTask = null;
    output.subtasks = [];
    output.estimatedDurationPerSubtask = Array.isArray(output.estimatedDurationPerSubtask) ? output.estimatedDurationPerSubtask : [];
    output.schedulingConstraints = null;
    output.schedulePlan = [];
    output.recommendations = Array.isArray(output.recommendations) ? output.recommendations : [];
    return output;
  }

  // Pastikan output in-scope tetap valid tanpa mengubah makna jawaban model.
  if (output.subtasks.length === 0) {
    output.subtasks.push({
      title: output.mainTask?.title || "Aktivitas Utama",
      notes: null,
      order: 1,
      estimatedMinutes: 60,
      isFlexible: false,
    });
  }

  output.subtasks.forEach((st) => {
    if (typeof st.estimatedMinutes !== "number" || st.estimatedMinutes < 5) {
      st.estimatedMinutes = 30;
    }
  });

  // 2. Convert offset waktu (+08:00) ke format UTC "Z" murni biar Zod nggak nolak!
  const forceUTC = (iso) => {
    try { return iso ? new Date(iso).toISOString() : iso; } 
    catch(e) { return iso; }
  };

  if (Array.isArray(output.schedulePlan)) {
    output.schedulePlan.forEach(item => {
      item.startTime = forceUTC(item.startTime);
      item.endTime = forceUTC(item.endTime);
      item.date = forceUTC(item.date);
    });
  }

  if (output.schedulingConstraints && Array.isArray(output.schedulingConstraints.preferredTimeWindows)) {
    output.schedulingConstraints.preferredTimeWindows = output.schedulingConstraints.preferredTimeWindows
      .map((windowItem) => {
        if (windowItem && typeof windowItem === "object" && windowItem.day && windowItem.start && windowItem.end) {
          return windowItem;
        }

        const sourceIso = output.schedulePlan?.[0]?.date || output.schedulePlan?.[0]?.startTime || output.meta.generatedAt;
        return {
          day: getWeekday(sourceIso),
          start: extractTimeOnly(windowItem?.start || windowItem?.from || windowItem?.begin || "09:00"),
          end: extractTimeOnly(windowItem?.end || windowItem?.to || windowItem?.finish || "11:00"),
        };
      })
      .filter((windowItem) => windowItem && windowItem.day && windowItem.start && windowItem.end);
  }

  // 3. Jaga-jaga kalau AI nulis timezone +08:00 di constraint
  if (output.schedulingConstraints && Array.isArray(output.schedulingConstraints.preferredTimeWindows)) {
    output.schedulingConstraints.preferredTimeWindows.forEach(tw => {
      tw.start = forceUTC(tw.start);
      tw.end = forceUTC(tw.end);
    });
  }

  if (Array.isArray(output.schedulePlan)) {
    output.schedulePlan.forEach(item => {
      item.startTime = forceUTC(item.startTime);
      item.endTime = forceUTC(item.endTime);
      item.date = forceUTC(item.date);
    });
  }

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

      console.log("\n[LLM CONTENT STRING BEFORE PARSING]", response.content);
      const parsed = parseLlmJson(response.content || response.raw);
      console.log("\n[LLM PARSED JSON]", JSON.stringify(parsed, null, 2));
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
