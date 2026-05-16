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
    keepAlive: process.env.OLLAMA_KEEP_ALIVE || "30m",
    numCtx: Number(process.env.OLLAMA_NUM_CTX || 2048),
    numPredict: Number(process.env.OLLAMA_NUM_PREDICT || 256),
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
  const now = new Date();

  // Ambil tanggal dengan format rapi (YYYY-MM-DD)
  const formatDate = (date) => {
    const d = new Date(date.toLocaleString("en-US", { timeZone: timezone || "Asia/Makassar" }));
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const todayStr = formatDate(now); // <-- KITA BIKIN CONTOH TANGGAL REAL BUAT AI
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  
  // BIKIN KALENDER 7 HARI KE DEPAN BUAT CONTEKAN AI
  const next7Days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    let label = dayNames[d.getDay()];
    if (i === 0) label += " (HARI INI)";
    if (i === 1) label += " (BESOK)";
    next7Days.push(`- ${label}: ${formatDate(d)}`);
  }
  const calendarContext = next7Days.join('\n  ');

  const currentTime = now.toLocaleTimeString(locale || "id-ID", { timeZone: timezone || "Asia/Makassar", hour: '2-digit', minute:'2-digit' });

  return `${contractPrompt.trim()}

  Provider: ${providerName}

  INFORMASI WAKTU PENTING (JANGAN SAMPAI SALAH):
  - Jam Sekarang: ${currentTime}

  KALENDER 7 HARI KE DEPAN:
  ${calendarContext}

  CRITICAL RULES:
  1. Output WAJIB berupa JSON object murni. JANGAN tambahkan teks penjelasan apapun di luar JSON.
  2. 'schedulingConstraints' MUST NOT be null.
  3. 'subtasks' array MUST NOT BE EMPTY. Buat minimal 1 subtask.
  4. Keep 'fixedEvents' empty [] unless conflicting events are mentioned.
  5. Gunakan format "YYYY-MM-DD" untuk tanggal berdasarkan KALENDER 7 HARI KE DEPAN.
  6. Gunakan format "HH:mm:ss+08:00" untuk waktu.
  7. FIELD 'estimatedMinutes' WAJIB diisi persis dengan DURASI dalam perintah. JANGAN ASAL MENGKOPY DARI TEMPLATE!
  8. WAJIB ISI array 'schedulePlan' dengan jadwal yang diminta.

  EXPECTED JSON TEMPLATE (AI WAJIB MENIRU STRUKTUR INI):
  {
    "version": "1.0",
    "intent": "${intent || 'create_task'}",
    "mainTask": { "title": "Aktivitas", "description": "Deskripsi", "priority": "medium", "status": "pending" },
    "subtasks": [ { "title": "Aktivitas", "notes": null, "order": 1, "estimatedMinutes": 60, "isFlexible": false } ],
    "schedulingConstraints": { "deadline": null, "preferredTimeWindows": [], "fixedEvents": [], "maxDailyFocusMinutes": 240, "allowWeekend": true },
    "schedulePlan": [ { "subtaskTitle": "Aktivitas", "startTime": "${todayStr}T09:00:00+08:00", "endTime": "${todayStr}T10:00:00+08:00", "date": "${todayStr}T09:00:00+08:00", "reason": "Sesuai permintaan" } ],
    "recommendations": [],
    "meta": { "model": "${providerName}", "generatedAt": "${now.toISOString()}", "confidence": 0.9, "needsUserConfirmation": false, "assumptions": [] }
  }`;
};

// Menyerialkan konteks request pengguna ke JSON agar prompt konsisten.
const buildUserPrompt = ({ userRequest, intent, locale, timezone, context }) => {
  const now = new Date();
  const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  
  let targetDate = "";
  const text = userRequest.toLowerCase();
  
  if (/\b(hari|pagi|siang|sore|malam)\s*ini\b/.test(text) || /\bsekarang\b/.test(text)) {
    targetDate = fmt(now);
  } else if (/\bbesok\b/.test(text)) {
    const d = new Date(now); d.setDate(d.getDate() + 1); targetDate = fmt(d);
  } else if (/\blusa\b/.test(text)) {
    const d = new Date(now); d.setDate(d.getDate() + 2); targetDate = fmt(d);
  } else {
    const days = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
    for (let i = 0; i < days.length; i++) {
      const regex = new RegExp(`\\b${days[i]}\\b`, 'i');
      if (regex.test(text)) {
        const d = new Date(now);
        let diff = i - d.getDay();
        if (diff <= 0) diff += 7;
        d.setDate(d.getDate() + diff);
        targetDate = fmt(d);
        break;
      }
    }
  }

  // --- JURUS MERINGANKAN BEBAN AI (KALKULATOR NODE.JS) ---
  
  // 1. Ubah Desimal (1.5 jam) langsung jadi Menit (90 menit)
  let finalRequest = userRequest.replace(/(\d+(?:[.,]\d+)?)\s*jam/ig, (match, angka) => {
    const totalJam = parseFloat(angka.replace(',', '.'));
    return `${Math.round(totalJam * 60)} menit`;
  });

  // 2. Translet "Sore/Malam/Siang jam X" langsung jadi "jam 24-format" (cth: jam 4 jadi jam 16:00)
  if (text.includes('sore') || text.includes('malam')) {
      finalRequest = finalRequest.replace(/jam\s*(\d+)/ig, (match, jam) => {
          let num = parseInt(jam);
          if (num >= 1 && num <= 11) return `jam ${num + 12}:00`;
          return match;
      });
  } else if (text.includes('siang')) {
      finalRequest = finalRequest.replace(/jam\s*(\d+)/ig, (match, jam) => {
          let num = parseInt(jam);
          if (num >= 1 && num <= 5) return `jam ${num + 12}:00`;
          return match;
      });
  }

  // --- JURUS AUTO-COMMAND PINTAR ---
  // Deteksi apakah ada unsur waktu di chat user
  const isTimeMentioned = /(jam|pagi|siang|sore|malam|besok|lusa|hari ini|menit|sekarang)/i.test(text);
  // Deteksi apakah user sudah pakai kata perintah
  const isCommandMentioned = /(buat|jadwal|atur|susun|tambah)/i.test(text);

  // Kalau user nyebut waktu TAPI males ngetik perintah, baru kita suapin!
  if (isTimeMentioned && !isCommandMentioned) {
      finalRequest = "Tolong jadwalkan aktivitas ini: " + finalRequest;
  }

  // --- JURUS BISIKAN LEMBUT TERAKHIR ---
  finalRequest = `Permintaan User:\n"${finalRequest}"`;

  if (targetDate) {
    finalRequest += `\n\n(Catatan Sistem: WAJIB gunakan tanggal ${targetDate} pada semua field waktu. PENTING: array 'schedulePlan' TIDAK BOLEH KOSONG!)`;
  }

  return JSON.stringify(
    {
      userRequest: finalRequest,
      intent,
      locale,
      timezone,
      context: context || {},
    },
    null,
    2
  );
};

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
    keepAlive: config.keepAlive,
    numCtx: config.numCtx,
    numPredict: config.numPredict,
  };
};

// Melengkapi field opsional yang kosong sebelum validasi schema.
const normalizeOutput = (output, providerName, intent, fallbackUserRequest) => {
  if (!output.meta) {
    output.meta = {};
  }

  // 1. Pindahin forceUTC ke paling atas biar bisa dipake dimana aja
  const forceUTC = (iso) => {
    try { return iso ? new Date(iso).toISOString() : iso; } 
    catch(e) { return iso; }
  };

  // 2. Melengkapi field penting & JURUS SAPU JAGAT ANTI-ZOD
  output.version = output.version || "1.0";
  output.intent = output.intent || intent;
  output.userRequest = output.userRequest || fallbackUserRequest || "";
  output.locale = output.locale || "id-ID";
  output.timezone = output.timezone || "Asia/Jakarta";
  output.meta.model = output.meta.model || providerName;
  
  // Paksa generatedAt jadi UTC murni biar Zod nggak nolak
  output.meta.generatedAt = forceUTC(output.meta.generatedAt || new Date().toISOString());
  
  output.meta.confidence = typeof output.meta.confidence === "number" ? output.meta.confidence : 0.7;
  output.meta.needsUserConfirmation = Boolean(output.meta.needsUserConfirmation);
  output.meta.assumptions = Array.isArray(output.meta.assumptions) ? output.meta.assumptions : [];
  output.subtasks = Array.isArray(output.subtasks) ? output.subtasks : [];

  // Zod alergi sama nilai "null", jadi kita hapus paksa biar nggak kena Validation Error
  if (output.meta.refusalMessage === null) delete output.meta.refusalMessage;

  // --- JURUS TEBAK DURASI ---
  let guessedMinutes = 0; 
  const reqText = (output.userRequest || fallbackUserRequest || "").toLowerCase();
  
  const minMatch = reqText.match(/(\d+)\s*menit/);
  if (minMatch) guessedMinutes = parseInt(minMatch[1], 10);
  else {
    const jamMatch = reqText.match(/(\d+(?:[.,]\d+)?)\s*jam/);
    if (jamMatch) guessedMinutes = Math.round(parseFloat(jamMatch[1].replace(',', '.')) * 60);
  }

  // 3. Kalau subtasks kosong (Zod butuh minimal 1), kita buatin otomatis!
  if (output.subtasks.length === 0) {
    output.subtasks.push({
      title: output.mainTask?.title || "Aktivitas Utama",
      order: 1,
      estimatedMinutes: guessedMinutes || 60, // Pake hasil tebakan
      isFlexible: false
    });
  }

  // 4. Bersihin notes null & RAZIA HASIL NYONTEK TEMPLATE
  output.subtasks.forEach(st => {
    if (st.notes === null) delete st.notes;
    
    if (guessedMinutes > 0 && st.estimatedMinutes === 60) {
      st.estimatedMinutes = guessedMinutes; 
    }

    if (typeof st.estimatedMinutes !== 'number' || st.estimatedMinutes < 5) {
      st.estimatedMinutes = guessedMinutes || 30; 
    } else {
      st.estimatedMinutes = Math.round(st.estimatedMinutes); 
    }
  });

  // 5. Jaga-jaga kalau AI nulis timezone +08:00 di constraint
  if (output.schedulingConstraints && Array.isArray(output.schedulingConstraints.preferredTimeWindows)) {
    output.schedulingConstraints.preferredTimeWindows.forEach(tw => {
      tw.start = forceUTC(tw.start);
      tw.end = forceUTC(tw.end);
    });
  }

  // --- LOOPING SCHEDULE PLAN (Jadikan satu di sini semua) ---
  if (Array.isArray(output.schedulePlan)) {
    output.schedulePlan.forEach(item => {
      item.startTime = forceUTC(item.startTime);
      item.date = forceUTC(item.date || item.startTime); 

      // --- JURUS TIME LORD (NODE.JS YANG NGITUNG END TIME) ---
      if (item.startTime) {
        try {
          const relatedSubtask = output.subtasks.find(st => st.title === item.subtaskTitle) || output.subtasks[0];
          const durationMins = (relatedSubtask && typeof relatedSubtask.estimatedMinutes === 'number') 
            ? relatedSubtask.estimatedMinutes 
            : 60;
          
          const startObj = new Date(item.startTime);
          startObj.setMinutes(startObj.getMinutes() + durationMins);
          item.endTime = forceUTC(startObj.toISOString());
        } catch (e) {
          item.endTime = forceUTC(item.endTime);
        }
      } else {
        item.endTime = forceUTC(item.endTime);
      }
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
