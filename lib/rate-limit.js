const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 12;

const store = globalThis.__navimailxRateLimitStore || new Map();

if (!globalThis.__navimailxRateLimitStore) {
    globalThis.__navimailxRateLimitStore = store;
}

export function takeRateLimitToken(key) {
    const now = Date.now();
    const current = store.get(key);

    if (!current || now >= current.resetAt) {
        const next = {
            count: 1,
            resetAt: now + WINDOW_MS
        };

        store.set(key, next);

        return {
            allowed: true,
            limit: MAX_REQUESTS,
            remaining: MAX_REQUESTS - next.count,
            resetAt: next.resetAt,
            retryAfterSeconds: 0
        };
    }

    if (current.count >= MAX_REQUESTS) {
        return {
            allowed: false,
            limit: MAX_REQUESTS,
            remaining: 0,
            resetAt: current.resetAt,
            retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000)
        };
    }

    current.count += 1;

    return {
        allowed: true,
        limit: MAX_REQUESTS,
        remaining: MAX_REQUESTS - current.count,
        resetAt: current.resetAt,
        retryAfterSeconds: 0
    };
}