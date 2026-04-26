import { IntentBadge } from "@/components/email/intent-badge";
import { cn } from "@/lib/utils";

export function ResultCard({
  className,
  error,
  isLoading,
  result,
  displayedResponse
}) {
  return (
    <section
      className={cn(
        "glass-panel rounded-[2rem] border border-white/10 p-6 shadow-[0_20px_90px_rgba(15,23,42,0.45)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)] [transform-style:preserve-3d] [perspective:1400px] hover:[transform:rotateX(3deg)_rotateY(2deg)_translateY(-8px)] sm:p-8",
        className
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
            Response Console
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Structured API output
          </h2>
        </div>

        {result?.intent ? <IntentBadge intent={result.intent} /> : null}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[0.45fr_0.55fr]">
        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
          <p className="text-sm font-medium text-slate-300">Payload preview</p>
          <pre className="mt-4 overflow-x-auto whitespace-pre-wrap break-words text-sm leading-7 text-slate-400">
            {JSON.stringify(
              result
                ? result
                : error
                  ? { error }
                  : { id: "uuid", intent: "complaint | question | refund", response: "AI response will appear here." },
              null,
              2
            )}
          </pre>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm font-medium text-slate-300">Operator notes</p>
          <div className="mt-4 space-y-3 text-sm leading-7 text-slate-400">
            <p>
              Rate limiting and request tracking are handled in middleware
              before the route executes.
            </p>
            <p>
              Guardrails screen unsafe input before classification and response
              generation.
            </p>
            <p>
              {isLoading
                ? "The AI is currently processing this request."
                : displayedResponse
                  ? "The typing preview mirrors the generated customer response."
                  : "Submit an email to see the live routing workflow."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
