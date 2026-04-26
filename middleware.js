import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { takeRateLimitToken } from "@/lib/rate-limit";

export function middleware(request) {
  if (request.nextUrl.pathname !== "/api/email") {
    return NextResponse.next();
  }

  const requestId = request.headers.get("x-request-id") || uuidv4();
  const ipAddress =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const result = takeRateLimitToken(ipAddress);

  if (!result.allowed) {
    const blockedResponse = NextResponse.json(
      {
        id: requestId,
        error: "Rate limit exceeded. Please try again shortly."
      },
      { status: 429 }
    );

    blockedResponse.headers.set("x-request-id", requestId);
    blockedResponse.headers.set("retry-after", String(result.retryAfterSeconds));
    blockedResponse.headers.set("x-rate-limit-limit", String(result.limit));
    blockedResponse.headers.set(
      "x-rate-limit-remaining",
      String(result.remaining)
    );

    return blockedResponse;
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);
  requestHeaders.set("x-client-ip", ipAddress);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });

  response.headers.set("x-request-id", requestId);
  response.headers.set("x-rate-limit-limit", String(result.limit));
  response.headers.set("x-rate-limit-remaining", String(result.remaining));

  return response;
}

export const config = {
  matcher: ["/api/email"]
};
