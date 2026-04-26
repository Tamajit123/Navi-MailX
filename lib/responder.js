import { callOllama } from "@/lib/ollama";

const RESPONSE_STYLES = {
  complaint:
    "Use an empathetic tone, acknowledge the frustration, and mention that the issue will be reviewed promptly.",
  question:
    "Use a helpful tone, answer clearly, and invite the customer to reply if they need more help.",
  refund:
    "Use a calm policy-based tone, mention that billing review is in progress, and avoid promising an immediate refund."
};

function fallbackResponse(intent) {
  if (intent === "refund") {
    return "Thanks for reaching out. I understand the duplicate billing concern. We are reviewing the charge with our billing team and will follow up with the next steps as soon as the review is complete. If you have any transaction details to share, please reply and we will include them in the review.";
  }

  if (intent === "question") {
    return "Thanks for your message. We are happy to help with your question and will make sure you get the information you need. If there is any additional context or account detail you would like us to review, please reply and we can assist further.";
  }

  return "Thanks for reaching out, and I am sorry for the frustration. We have flagged your message for review and our support team will take a closer look so we can help resolve the issue as quickly as possible.";
}

export async function generateResponse({ email, intent }) {
  const prompt = `
You are an AI support assistant for a modern SaaS company.
Generate a polished customer response based on the detected intent.

Intent: ${intent}
Style guidance: ${RESPONSE_STYLES[intent]}

Rules:
- Keep the response under 150 words.
- Be professional and concise.
- Return plain text only.
- Do not mention internal routing or classification.

Customer email:
"""${email}"""
`;

  try {
    return await callOllama(prompt, {
      temperature: 0.35,
      timeoutMs: 45000
    });
  } catch (error) {
    if (error.code === "OLLAMA_TIMEOUT") {
      return fallbackResponse(intent);
    }

    throw error;
  }
}
