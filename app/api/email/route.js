import { NextResponse } from "next/server";
import { classifyEmail } from "@/lib/classifier";
import { applyGuardrails } from "@/lib/guardrails";
import { createRequestLogger } from "@/lib/logger";
import { getRequestContext } from "@/lib/request";
import { generateResponse } from "@/lib/responder";

export const runtime = "nodejs";

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

    const intent = await classifyEmail(safety.email);
    const response = await generateResponse({
      email: safety.email,
      intent
    });

    logger.info("request.completed", {
      intent
    });

    return json(
      {
        id: context.id,
        intent,
        response
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("request.failed", {
      message: error.message,
      code: error.code
    });

    const isOllamaError = error.code?.startsWith("OLLAMA_");

    return json(
      {
        id: context.id,
        error: isOllamaError
          ? error.message
          : "Unable to process the email right now."
      },
      { status: isOllamaError ? 503 : 500 }
    );
  }
}
