"use client";

import { cn } from "@/lib/utils";

export function BackgroundBeams({ className }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    >
      <div className="absolute left-1/2 top-0 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute right-[-10%] top-[20%] h-[26rem] w-[26rem] rounded-full bg-fuchsia-500/15 blur-3xl" />
      <div className="absolute left-[-8%] top-[45%] h-[24rem] w-[24rem] rounded-full bg-blue-500/15 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
    </div>
  );
}
