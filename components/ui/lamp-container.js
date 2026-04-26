"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function LampContainer({ children, className }) {
  return (
    <section
      className={cn(
        "relative flex w-full flex-col items-center justify-center overflow-hidden pb-24 pt-16 sm:pt-24",
        className
      )}
    >
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-cyan-500/12 to-transparent" />
      <motion.div
        initial={{ opacity: 0.3, scaleX: 0.6 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
        className="absolute top-10 h-40 w-[36rem] rounded-full bg-cyan-300/20 blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0.2, scaleX: 0.4 }}
        animate={{ opacity: 0.95, scaleX: 1 }}
        transition={{ duration: 1.1, delay: 0.1, ease: "easeOut" }}
        className="absolute top-8 h-56 w-[12rem] rounded-full bg-cyan-200/25 blur-[72px]"
      />
      <div className="relative z-10 w-full">{children}</div>
    </section>
  );
}
