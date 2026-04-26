import { v4 as uuidv4 } from "uuid";

export function getRequestContext(request) {
  const id = request.headers.get("x-request-id") || uuidv4();
  const ipAddress =
    request.headers.get("x-client-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  return {
    id,
    ipAddress
  };
}
