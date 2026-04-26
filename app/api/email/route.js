import { NextResponse } from "next/server";
import { applyGuardrails } from "@/lib/guardrails";
import { createRequestLogger } from "@/lib/logger";
import { getRequestContext } from "@/lib/request";

export const runtime = "nodejs";

const BASE_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

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

function json(data, init = {}) {
  const headers = new Headers(init.headers);

  if (data?.id) {
    headers.set("x-request-id", data.id);
  }

  return NextResponse.json(data, {
    ...init,
    headers
  });
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 20000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
      cache: "no-store"
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function callBackendGenerate({ email, requestId }) {
  let lastError;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const response = await fetchWithTimeout(
        `${BASE_URL}/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-request-id": requestId
          },
          body: JSON.stringify({ email })
        },
        25000
      );

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "AI backend returned an error.");
      }

      return payload;
    } catch (error) {
      lastError = error;

      if (attempt === 1) {
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
    }
  }

  throw lastError;
}

function buildFallbackResult(email, error) {
  const intent = fallbackClassifyEmail(email);

  return {
    intent,
    response: fallbackResponse(intent),
    source: "fallback",
    warning: error?.message || "AI backend unavailable"
  };
}

export async function POST(request) {
  const context = getRequestContext(request);
  const logger = createRequestLogger({
    requestId: context.id,
    route: "/api/email",
    ipAddress: context.ipAddress
  });

  logger.info("request.received", {
    method: request.method
  });

  let body;

  try {
    body = await request.json();
  } catch {
    logger.warn("request.invalid_json");

    return json(
      {
        id: context.id,
        error: "Request body must be valid JSON."
      },
      { status: 400 }
    );
  }

  const email = typeof body?.email === "string" ? body.email.trim() : "";

  if (!email) {
    logger.warn("request.validation_failed", {
      reason: "missing_email"
    });

    return json(
      {
        id: context.id,
        error: "Field `email` is required."
      },
      { status: 400 }
    );
  }

  if (email.length > 5000) {
    logger.warn("request.validation_failed", {
      reason: "email_too_long",
      length: email.length
    });

    return json(
      {
        id: context.id,
        error: "Email content exceeds the 5000 character limit."
      },
      { status: 400 }
    );
  }

  try {
    const safety = await applyGuardrails(email);

    if (!safety.allowed) {
      logger.warn("guardrails.blocked", {
        reason: safety.reason
      });

      return json(
        {
          id: context.id,
          error: safety.message
        },
        { status: 400 }
      );
    }

    let backendResult;

    try {
      backendResult = await callBackendGenerate({
        email: safety.email,
        requestId: context.id
      });
    } catch (error) {
      logger.warn("request.backend_fallback", {
        message: error.message
      });

      backendResult = buildFallbackResult(safety.email, error);
    }

    logger.info("request.completed", {
      intent: backendResult.intent,
      source: backendResult.source || "backend"
    });

    return json(
      {
        id: context.id,
        intent: backendResult.intent,
        response: backendResult.response,
        source: backendResult.source || "backend"
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("request.failed", {
      message: error.message
    });

    return json(
      {
        id: context.id,
        ...buildFallbackResult(email, error)
      },
      { status: 200 }
    );
  }
}
