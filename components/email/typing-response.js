"use client";

import { useEffect, useState } from "react";

export function TypingResponse({ text, onFrame }) {
  const [visibleText, setVisibleText] = useState("");

  useEffect(() => {
    setVisibleText("");

    if (!text) {
      onFrame?.("");
      return undefined;
    }

    let index = 0;
    const intervalId = window.setInterval(() => {
      index += 1;
      const next = text.slice(0, index);
      setVisibleText(next);
      onFrame?.(next);

      if (index >= text.length) {
        window.clearInterval(intervalId);
      }
    }, 16);

    return () => window.clearInterval(intervalId);
  }, [onFrame, text]);

  return (
    <p className="min-h-[144px] text-sm leading-7 text-slate-200">
      {visibleText}
      <span className="ml-1 inline-block h-5 w-[2px] animate-pulse bg-cyan-300 align-middle" />
    </p>
  );
}
