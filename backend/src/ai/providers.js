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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parseRetryAfterMs = (retryAfterHeader) => {
  if (!retryAfterHeader) {
    return null;
  }

  const numericValue = Number(retryAfterHeader);
  if (!Number.isNaN(numericValue) && numericValue >= 0) {
    return Math.round(numericValue * 1000);
  }

  const retryAt = Date.parse(retryAfterHeader);
  if (Number.isNaN(retryAt)) {
    return null;
  }

  return Math.max(0, retryAt - Date.now());
};

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

// Mengubah format messages internal menjadi isi prompt Gemini.
const toGeminiContents = (messages = []) =>
  messages
    .filter((message) => message && message.role && message.role !== "system")
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: typeof message.content === "string" ? message.content : String(message.content || "") }],
    }));

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

// Memanggil Gemini REST API native dari AI Studio.
const callGeminiProvider = async ({
  provider,
  baseUrl,
  apiKey,
  model,
  messages,
  temperature,
  responseMimeType,
}) => {
  const resolvedBaseUrl = (baseUrl || "https://generativelanguage.googleapis.com/v1beta").trim().replace(/\/$/, "");

  if (!resolvedBaseUrl) {
    throw new AiProviderError(`Provider ${provider} is not configured`, {
      provider,
      statusCode: 500,
      retryable: false,
    });
  }

  if (!apiKey) {
    throw new AiProviderError(`Provider ${provider} requires GEMINI_API_KEY`, {
      provider,
      statusCode: 500,
      retryable: false,
    });
  }

  const systemMessage = messages?.find((message) => message?.role === "system")?.content || "";
  const contents = toGeminiContents(messages);
  const maxRetries = Number.parseInt(process.env.GEMINI_MAX_RETRIES || "2", 10);
  const retryBaseMs = Number.parseInt(process.env.GEMINI_RETRY_BASE_MS || "700", 10);
  const requestUrl = `${resolvedBaseUrl}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  let response;
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    response = await fetch(requestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: systemMessage
          ? {
              parts: [{ text: systemMessage }],
            }
          : undefined,
        contents,
        generationConfig: {
          temperature,
          responseMimeType: responseMimeType || "application/json",
        },
      }),
    });

    if (response.ok) {
      break;
    }

    const canRetry = response.status === 429 || response.status >= 500;
    if (!canRetry || attempt === maxRetries) {
      await throwProviderError(provider, response);
    }

    const retryAfterMs = parseRetryAfterMs(response.headers.get("retry-after"));
    const exponentialBackoffMs = retryBaseMs * (2 ** attempt);
    const jitterMs = Math.floor(Math.random() * 200);
    const waitMs = Math.max(retryAfterMs ?? 0, exponentialBackoffMs + jitterMs);

    console.warn(
      `[GEMINI RETRY] attempt ${attempt + 1}/${maxRetries + 1}, status=${response.status}, wait=${waitMs}ms`
    );
    await sleep(waitMs);
  }

  const data = await response.json();
  console.log("\n[GEMINI RAW RESPONSE]", JSON.stringify(data, null, 2));
  const content = data?.candidates?.[0]?.content?.parts
    ?.map((part) => (typeof part?.text === "string" ? part.text : ""))
    .join("");

  return {
    provider,
    model: data?.modelVersion || data?.model || model,
    content,
    raw: data,
  };
};

// Mengembalikan runner sesuai provider agar engine tetap netral terhadap provider.
const createProviderRunner = (providerName, config) => {
  if (providerName === "gemini") {
    return async (input) => callGeminiProvider({ provider: providerName, ...config, ...input });
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
