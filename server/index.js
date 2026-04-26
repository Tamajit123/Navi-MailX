const express = require("express");

const app = express();
const PORT = Number(process.env.PORT || 5000);
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3";
const OLLAMA_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS || 45000);

app.use(express.json({ limit: "1mb" }));

function fallbackClassifyEmail(email) {
  const normalized = email.toLowerCase();

  if (
    /(refund|charged twice|double charged|money back|billing issue|duplicate charge)/.test(
      normalized
    )
  ) {
    return "refund";
  }

  if (/(why|how|what|when|where|\?)/.test(normalized)) {
    return "question";
  }

  return "complaint";
}

function fallbackResponse(intent) {
  if (intent === "refund") {
    return "Thanks for reaching out. I understand the duplicate billing concern. We are reviewing the charge with our billing team and will follow up with the next steps as soon as the review is complete. If you have any transaction details to share, please reply and we will include them in the review.";
  }

  if (intent === "question") {
    return "Thanks for your message. We are happy to help with your question and will make sure you get the information you need. If there is any additional context or account detail you would like us to review, please reply and we can assist further.";
  }

  return "Thanks for reaching out, and I am sorry for the frustration. We have flagged your message for review and our support team will take a closer look so we can help resolve the issue as quickly as possible.";
}

async function fetchWithTimeout(url, options = {}, timeoutMs = OLLAMA_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function callOllama(prompt, temperature = 0.2, timeoutMs = OLLAMA_TIMEOUT_MS) {
  try {
    const response = await fetchWithTimeout(
      `${OLLAMA_BASE_URL}/api/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          prompt,
          stream: false,
          options: {
            temperature
          }
        })
      },
      timeoutMs
    );

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`OLLAMA_HTTP_ERROR: ${response.status} ${detail}`);
    }

    const data = await response.json();

    if (!data?.response) {
      throw new Error("OLLAMA_EMPTY_RESPONSE");
    }

    return data.response.trim();
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("OLLAMA_TIMEOUT");
    }

    throw error;
  }
}

async function classifyEmail(email) {
  const prompt = `
Classify into one word: complaint, question, refund.

Rules:
- Return exactly one word.
- If the email asks for money back, choose refund.
- If the email shows dissatisfaction or frustration, choose complaint.
- If the email asks for information, help, or clarification, choose question.

Email:
"""${email}"""
`;

  try {
    const raw = await callOllama(prompt, 0, 30000);
    const result = raw.trim().toLowerCase().split(/\s+/)[0];

    if (["complaint", "question", "refund"].includes(result)) {
      return result;
    }
  } catch {
    return fallbackClassifyEmail(email);
  }

  return fallbackClassifyEmail(email);
}

async function generateResponse(email, intent) {
  const styles = {
    complaint:
      "Use an empathetic tone, acknowledge the frustration, and mention that the issue will be reviewed promptly.",
    question:
      "Use a helpful tone, answer clearly, and invite the customer to reply if they need more help.",
    refund:
      "Use a calm policy-based tone, mention that billing review is in progress, and avoid promising an immediate refund."
  };

  const prompt = `
You are an AI support assistant for a modern SaaS company.
Generate a polished customer response based on the detected intent.

Intent: ${intent}
Style guidance: ${styles[intent]}

Rules:
- Keep the response under 150 words.
- Be professional and concise.
- Return plain text only.
- Do not mention internal routing or classification.

Customer email:
"""${email}"""
`;

  try {
    return {
      response: await callOllama(prompt, 0.35, 45000),
      source: "ollama"
    };
  } catch {
    return {
      response: fallbackResponse(intent),
      source: "fallback"
    };
  }
}

app.get("/health", async (_request, response) => {
  try {
    const healthResponse = await fetchWithTimeout(
      `${OLLAMA_BASE_URL}/api/tags`,
      {
        method: "GET"
      },
      5000
    );

    if (!healthResponse.ok) {
      throw new Error("OLLAMA_UNHEALTHY");
    }

    return response.status(200).json({
      status: "ok",
      ollama: "up"
    });
  } catch {
    return response.status(200).json({
      status: "degraded",
      ollama: "down"
    });
  }
});

app.post("/generate", async (request, response) => {
  const email = typeof request.body?.email === "string" ? request.body.email.trim() : "";

  if (!email) {
    return response.status(400).json({
      error: "Field `email` is required."
    });
  }

  try {
    const intent = await classifyEmail(email);
    const result = await generateResponse(email, intent);

    return response.status(200).json({
      intent,
      response: result.response,
      source: result.source
    });
  } catch (error) {
    const intent = fallbackClassifyEmail(email);

    return response.status(200).json({
      intent,
      response: fallbackResponse(intent),
      source: "fallback",
      warning: error.message
    });
  }
});

app.listen(PORT, () => {
  console.info(`NaviMailX backend listening on port ${PORT}`);
});
