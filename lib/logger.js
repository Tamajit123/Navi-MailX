function emitLog(level, event, payload = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...payload
  };

  const message = JSON.stringify(entry);

  if (level === "error") {
    console.error(message);
    return;
  }

  if (level === "warn") {
    console.warn(message);
    return;
  }

  console.info(message);
}

export function createRequestLogger({ requestId, route, ipAddress }) {
  const basePayload = {
    requestId,
    route,
    ipAddress
  };

  return {
    info(event, detail = {}) {
      emitLog("info", event, {
        ...basePayload,
        detail
      });
    },
    warn(event, detail = {}) {
      emitLog("warn", event, {
        ...basePayload,
        detail
      });
    },
    error(event, detail = {}) {
      emitLog("error", event, {
        ...basePayload,
        detail
      });
    }
  };
}
