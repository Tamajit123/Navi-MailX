"use client";

import { motion } from "framer-motion";

export function LoadingOrb() {
  return (
    <div className="relative flex h-12 w-12 items-center justify-center">
      <motion.span
        animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute h-12 w-12 rounded-full bg-cyan-400/20 blur-md"
      />
      <motion.span
        animate={{ rotate: 360 }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
        className="h-7 w-7 rounded-full border border-cyan-300/80 border-t-transparent"
      />
    </div>
  );
}
