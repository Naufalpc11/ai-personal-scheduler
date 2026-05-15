class AiProviderError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "AiProviderError";
    this.provider = options.provider || "unknown";
    this.statusCode = options.statusCode || 500;
    this.retryable = Boolean(options.retryable);
    this.quotaExceeded = Boolean(options.quotaExceeded);
    this.raw = options.raw;
  }
}

// Menormalkan base URL dan menambahkan suffix bila diperlukan (contoh: /v1).
const normalizeBaseUrl = (value, suffix) => {
  const baseUrl = (value || "").trim().replace(/\/$/, "");

  if (!baseUrl) {
    return "";
  }

  if (baseUrl.endsWith(suffix)) {
    return baseUrl;
  }

  return `${baseUrl}${suffix}`;
};

// Mendeteksi pola pesan error kuota atau rate-limit dari provider.
const isQuotaLikeMessage = (text) => /quota|billing|limit|rate\s*limit|insufficient|exceeded|token/i.test(text);

// Membaca body error provider sebagai JSON jika memungkinkan, jika tidak sebagai teks.
const readErrorText = async (response) => {
  const text = await response.text();

  try {
    const data = JSON.parse(text);
    return {
      data,
      message: data?.error?.message || data?.message || text,
    };
  } catch (_error) {
    return {
      data: text,
      message: text,
    };
  }
};

// Mengubah respons non-2xx provider menjadi error domain yang seragam.
const throwProviderError = async (provider, response) => {
  const { data, message } = await readErrorText(response);
  const quotaExceeded = response.status === 402 || response.status === 429 || isQuotaLikeMessage(message);
  const retryable = quotaExceeded || response.status >= 500;

  throw new AiProviderError(`Provider ${provider} failed with status ${response.status}`, {
    provider,
    statusCode: response.status,
    retryable,
    quotaExceeded,
    raw: data,
  });
};

// Memanggil endpoint chat completion yang kompatibel dengan OpenAI.
const callOpenAiCompatibleProvider = async ({
  provider,
  baseUrl,
  apiKey,
  model,
  messages,
  temperature,
  keepAlive,
  numCtx,
  numPredict,
}) => {
  const resolvedBaseUrl = normalizeBaseUrl(baseUrl, "/v1");
  if (!resolvedBaseUrl) {
    throw new AiProviderError(`Provider ${provider} is not configured`, {
      provider,
      statusCode: 500,
      retryable: false,
    });
  }

  const response = await fetch(`${resolvedBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      keep_alive: keepAlive || "30m",
      options: {
        num_ctx: numCtx || Number(process.env.OLLAMA_NUM_CTX || 2048),
        num_predict: numPredict || Number(process.env.OLLAMA_NUM_PREDICT || 256),
      },
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    await throwProviderError(provider, response);
  }

  const data = await response.json();
  console.log("\n[OLLAMA RAW RESPONSE]", JSON.stringify(data, null, 2)); // buat ngecek respons dari Ollama, karena kadang errornya ada di format respons yang gak sesuai ekspektasi.
  const content = data?.choices?.[0]?.message?.content;

  return {
    provider,
    model: data?.model || model,
    content,
    raw: data,
  };
};

// Mengembalikan runner sesuai provider agar engine tetap netral terhadap provider.
const createProviderRunner = (providerName, config) => {
  if (providerName === "ollama") {
    return async (input) => callOpenAiCompatibleProvider({ provider: providerName, ...config, ...input });
  }

  throw new AiProviderError(`Unknown provider: ${providerName}`, {
    provider: providerName,
    statusCode: 500,
    retryable: false,
  });
};

module.exports = {
  AiProviderError,
  createProviderRunner,
  normalizeBaseUrl,
};
