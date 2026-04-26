"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      richColors
      theme="dark"
      position="top-right"
      toastOptions={{
        className:
          "!border !border-white/10 !bg-slate-950/90 !text-slate-100 !shadow-[0_20px_60px_rgba(15,23,42,0.55)]"
      }}
      className="toaster group"
      icons={{
        success: <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(74,222,128,0.9)]" />,
        error: <span className="h-2.5 w-2.5 rounded-full bg-rose-400 shadow-[0_0_18px_rgba(251,113,133,0.9)]" />
      }}
    />
  );
}
