"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";
import { gsap } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
}

/** Cursor-follow radial highlight, quickSet for compositor-only updates (no layout writes). */
export function SpotlightCard({ children, className }: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const setX = useRef<ReturnType<typeof gsap.quickSetter> | null>(null);
  const setY = useRef<ReturnType<typeof gsap.quickSetter> | null>(null);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    if (!setX.current) setX.current = gsap.quickSetter(el, "--spot-x", "px");
    if (!setY.current) setY.current = gsap.quickSetter(el, "--spot-y", "px");
    const rect = el.getBoundingClientRect();
    setX.current(e.clientX - rect.left);
    setY.current(e.clientY - rect.top);
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={cn("group relative", className)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(320px circle at var(--spot-x, 50%) var(--spot-y, 50%), color-mix(in oklch, var(--primary) 15%, transparent), transparent 70%)",
        }}
      />
      {children}
    </div>
  );
}
