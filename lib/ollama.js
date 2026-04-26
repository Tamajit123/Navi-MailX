const DEFAULT_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || "llama3";
const DEFAULT_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS || 45000);

export class OllamaError extends Error {
  constructor(message, code, meta = {}) {
    super(message);
    this.name = "OllamaError";
    this.code = code;
    this.meta = meta;
  }
}

function buildUrl(pathname) {
  return new URL(pathname, DEFAULT_BASE_URL).toString();
}

export async function callOllama(prompt, options = {}) {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(buildUrl("/api/generate"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: options.model || DEFAULT_MODEL,
        prompt,
        stream: false,
        options: {
          temperature: options.temperature ?? 0.2
        }
      }),
      signal: controller.signal,
      cache: "no-store"
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new OllamaError(
        response.status === 404
          ? `Ollama model "${options.model || DEFAULT_MODEL}" is not available. Pull it first with "ollama pull ${options.model || DEFAULT_MODEL}".`
          : "Ollama returned an unexpected error.",
        response.status === 404 ? "OLLAMA_MODEL_NOT_FOUND" : "OLLAMA_HTTP_ERROR",
        {
          status: response.status,
          detail: errorText
        }
      );
    }

    const data = await response.json();

    if (!data?.response || typeof data.response !== "string") {
      throw new OllamaError(
        "Ollama returned an empty response.",
        "OLLAMA_EMPTY_RESPONSE"
      );
    }

    return data.response.trim();
  } catch (error) {
    if (error instanceof OllamaError) {
      throw error;
    }

    if (error.name === "AbortError") {
      throw new OllamaError(
        `Ollama timed out after ${timeoutMs}ms.`,
        "OLLAMA_TIMEOUT"
      );
    }

    throw new OllamaError(
      "Ollama is unavailable. Start the Ollama server and ensure the configured model is installed.",
      "OLLAMA_UNAVAILABLE",
      {
        cause: error.message
      }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
