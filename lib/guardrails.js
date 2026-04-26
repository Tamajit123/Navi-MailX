const HARD_BLOCK_PATTERNS = [
  /ignore\s+previous\s+instructions/i,
  /reveal\s+(the\s+)?system\s+prompt/i,
  /delete\s+database/i,
  /shutdown\s+server/i,
  /drop\s+table/i,
  /bypass\s+security/i
];

export async function applyGuardrails(email) {
  const normalizedEmail = email.replace(/\0/g, "").trim();

  if (normalizedEmail.length < 5) {
    return {
      allowed: false,
      reason: "too_short",
      message: "Email content is too short to process."
    };
  }

  const hardBlocked = HARD_BLOCK_PATTERNS.some((pattern) =>
    pattern.test(normalizedEmail)
  );

  if (hardBlocked) {
    return {
      allowed: false,
      reason: "prompt_injection_detected",
      message: "Unsafe input detected by guardrails."
    };
  }

  return {
    allowed: true,
    email: normalizedEmail
  };
}
