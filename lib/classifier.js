import { callOllama } from "@/lib/ollama";

const SUPPORTED_INTENTS = ["complaint", "question", "refund"];

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

export async function classifyEmail(email) {
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

  let raw;

  try {
    raw = await callOllama(prompt, {
      temperature: 0,
      timeoutMs: 30000
    });
  } catch (error) {
    if (error.code === "OLLAMA_TIMEOUT") {
      return fallbackClassifyEmail(email);
    }

    throw error;
  }

  const result = raw.trim().toLowerCase().split(/\s+/)[0];

  if (!SUPPORTED_INTENTS.includes(result)) {
    return fallbackClassifyEmail(email);
  }

  return result;
}
