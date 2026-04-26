"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { IntentBadge } from "@/components/email/intent-badge";
import { LoadingOrb } from "@/components/email/loading-orb";
import { ResultCard } from "@/components/email/result-card";
import { TypingResponse } from "@/components/email/typing-response";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { LampContainer } from "@/components/ui/lamp-container";

const sampleEmail = `Hello support,

I was billed twice for my Pro plan this month. Can you help review the charge and let me know how the refund process works?

Thanks,
Jordan`;

const containerMotion = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: "easeOut"
    }
  }
};

const responseMotion = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: "easeOut"
    }
  }
};

export default function HomePage() {
  const [email, setEmail] = useState(sampleEmail);
  const [result, setResult] = useState(null);
  const [displayedResponse, setDisplayedResponse] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!result?.response) {
      setDisplayedResponse("");
      return;
    }

    setDisplayedResponse("");
  }, [result]);

  const stats = useMemo(
    () => [
      {
        label: "Intent Classes",
        value: "3",
        detail: "complaint / question / refund"
      },
      {
        label: "Guardrails",
        value: "Active",
        detail: "unsafe prompts filtered before routing"
      },
      {
        label: "Routing",
        value: "Live",
        detail: "response drafted with Ollama in real time"
      }
    ],
    []
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to route email right now.");
      }

      setResult(payload);
      toast.success("AI response generated", {
        description: `Intent detected: ${payload.intent}`
      });
    } catch (submitError) {
      const message = submitError.message || "Something went wrong.";
      setResult(null);
      setError(message);
      toast.error("Routing failed", {
        description: message
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <BackgroundBeams className="opacity-70" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.24),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(59,130,246,0.20),transparent_22%),radial-gradient(circle_at_12%_74%,rgba(168,85,247,0.14),transparent_24%),linear-gradient(180deg,#020617_0%,#020617_38%,#020617_100%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <LampContainer>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerMotion}
            className="mx-auto max-w-4xl text-center"
          >
            <div className="mb-6 inline-flex items-center rounded-full border border-cyan-300/20 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.32em] text-cyan-200 shadow-[0_0_40px_rgba(56,189,248,0.12)] backdrop-blur-xl">
              SaaS AI Email Router
            </div>

            <h1 className="bg-gradient-to-b from-white via-cyan-100 to-slate-400 bg-clip-text text-5xl font-semibold tracking-tight text-transparent sm:text-6xl lg:text-7xl">
              Route inbound support emails with reliable Ollama workflows.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              A production-style Next.js router that validates input, tracks
              requests, applies guardrails, classifies customer intent, and
              drafts polished support responses with local AI.
            </p>
          </motion.div>
        </LampContainer>

        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerMotion}
          className="-mt-12 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]"
        >
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-1 shadow-[0_25px_120px_rgba(15,23,42,0.75)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(34,211,238,0.18)] [transform-style:preserve-3d] [perspective:1600px] hover:[transform:rotateX(3deg)_rotateY(-4deg)]">
            <div className="rounded-[1.7rem] border border-white/10 bg-slate-950/70 p-6 sm:p-8">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">
                    Email Playground
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    Draft, classify, and route in one API call
                  </h2>
                </div>

                {result?.intent ? <IntentBadge intent={result.intent} /> : null}
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium text-slate-300"
                    htmlFor="email"
                  >
                    Incoming customer email
                  </label>

                  <textarea
                    id="email"
                    name="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Paste a customer email..."
                    rows={12}
                    className="min-h-[320px] w-full rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-5 py-4 text-sm leading-7 text-slate-100 outline-none ring-0 transition-all duration-300 placeholder:text-slate-500 focus:border-cyan-400/50 focus:bg-white/[0.06] focus:shadow-[0_0_0_4px_rgba(34,211,238,0.12)]"
                    required
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <p className="min-w-0 max-w-xl flex-1 text-sm text-slate-400">
                    The API validates payloads, rate limits requests, tracks a
                    UUID per request, and falls back with clean JSON errors if
                    Ollama is unavailable.
                  </p>

                  <HoverBorderGradient
                    as="button"
                    type="submit"
                    disabled={isLoading}
                    className="w-full min-w-[180px] rounded-full px-6 py-3.5 text-sm font-semibold text-white sm:w-auto sm:min-w-[220px]"
                    containerClassName="w-full sm:w-auto rounded-full"
                  >
                    {isLoading ? "Routing..." : "Route Email"}
                  </HoverBorderGradient>
                </div>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <motion.div
              variants={containerMotion}
              className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1"
            >
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[1.6rem] border border-white/10 bg-white/[0.06] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_20px_40px_rgba(15,23,42,0.28)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(34,211,238,0.18)] [transform-style:preserve-3d] [perspective:1400px] hover:[transform:rotateX(4deg)_rotateY(4deg)_translateY(-8px)]"
                >
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                    {stat.label}
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {stat.detail}
                  </p>
                </div>
              ))}
            </motion.div>

            <div className="rounded-[1.8rem] border border-cyan-400/15 bg-gradient-to-b from-cyan-400/10 via-slate-900/80 to-slate-950/90 p-6 shadow-[0_25px_80px_rgba(6,182,212,0.12)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(34,211,238,0.22)] [transform-style:preserve-3d] [perspective:1400px] hover:[transform:rotateX(3deg)_rotateY(-3deg)_translateY(-8px)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">
                    AI Thinking
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-white">
                    Live output stream
                  </h3>
                </div>

                {isLoading ? <LoadingOrb /> : null}
              </div>

              <div className="mt-5 rounded-[1.4rem] border border-white/10 bg-slate-950/80 p-5">
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-3"
                    >
                      <p className="text-sm text-slate-300">
                        Classifying request, checking guardrails, and drafting a
                        customer-safe response...
                      </p>
                      <div className="space-y-2">
                        <div className="h-3 w-4/5 animate-pulse rounded-full bg-white/10" />
                        <div className="h-3 w-3/5 animate-pulse rounded-full bg-white/10" />
                        <div className="h-3 w-2/3 animate-pulse rounded-full bg-white/10" />
                      </div>
                    </motion.div>
                  ) : result ? (
                    <motion.div
                      key="result"
                      variants={responseMotion}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <IntentBadge intent={result.intent} />
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                          Request ID: {result.id}
                        </span>
                      </div>

                      <TypingResponse
                        text={result.response}
                        onFrame={setDisplayedResponse}
                      />
                    </motion.div>
                  ) : (
                    <motion.p
                      key="placeholder"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-sm leading-7 text-slate-400"
                    >
                      Your AI-generated reply will appear here with a typing
                      animation after the email is processed.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.section>

        <ResultCard
          className="mt-6"
          error={error}
          isLoading={isLoading}
          result={result}
          displayedResponse={displayedResponse}
        />
      </div>
    </main>
  );
}
