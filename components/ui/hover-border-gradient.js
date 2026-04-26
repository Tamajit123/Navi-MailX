"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const HoverBorderGradient = forwardRef(function HoverBorderGradient(
  {
    as: Component = "button",
    className,
    containerClassName,
    children,
    ...props
  },
  ref
) {
  return (
    <motion.div
      whileHover={{
        scale: props.disabled ? 1 : 1.05,
        y: props.disabled ? 0 : -2
      }}
      whileTap={{ scale: props.disabled ? 1 : 0.98 }}
      className={cn(
        "relative inline-flex overflow-hidden rounded-full p-[1px] shadow-[0_0_24px_rgba(34,211,238,0.22)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]",
        "bg-[linear-gradient(135deg,rgba(103,232,249,0.95),rgba(59,130,246,0.92),rgba(14,165,233,0.92))]",
        containerClassName
      )}
    >
      <Component
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center rounded-full border border-white/10 bg-[linear-gradient(135deg,#22d3ee_0%,#2563eb_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_18px_45px_rgba(37,99,235,0.35)] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:scale-[0.98]",
          className
        )}
        {...props}
      >
        {children}
      </Component>
    </motion.div>
  );
});
