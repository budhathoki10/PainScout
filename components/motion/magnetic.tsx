"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";
import { gsap, prefersReducedMotion } from "@/lib/motion";

interface MagneticProps {
  children: ReactNode;
  strength?: number;
  className?: string;
}

/**
 * Cursor-follow pull, per Hover Micro-interaction / Complex preset.
 * Reserved for a single focal element (the hero CTA) — not for repeated use.
 */
export function Magnetic({ children, strength = 0.3, className }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const xTo = useRef<gsap.QuickToFunc | null>(null);
  const yTo = useRef<gsap.QuickToFunc | null>(null);

  function ensureQuickTo() {
    if (!ref.current) return;
    if (!xTo.current) {
      xTo.current = gsap.quickTo(ref.current, "x", { duration: 0.4, ease: "elastic.out(1,0.4)" });
      yTo.current = gsap.quickTo(ref.current, "y", { duration: 0.4, ease: "elastic.out(1,0.4)" });
    }
  }

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (prefersReducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;
    ensureQuickTo();
    const rect = e.currentTarget.getBoundingClientRect();
    xTo.current?.((e.clientX - rect.left - rect.width / 2) * strength);
    yTo.current?.((e.clientY - rect.top - rect.height / 2) * strength);
  }

  function handleMouseLeave() {
    ensureQuickTo();
    xTo.current?.(0);
    yTo.current?.(0);
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </div>
  );
}
