import { cn } from "@/lib/utils";

const intentStyles = {
  complaint: "border-amber-400/30 bg-amber-400/15 text-amber-200",
  question: "border-cyan-400/30 bg-cyan-400/15 text-cyan-200",
  refund: "border-emerald-400/30 bg-emerald-400/15 text-emerald-200"
};

export function IntentBadge({ intent }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.25em]",
        intentStyles[intent] || "border-white/15 bg-white/5 text-slate-200"
      )}
    >
      {intent}
    </span>
  );
}
