"use client";

import { useRef, type MouseEvent } from "react";
import { Mail } from "lucide-react";
import { gsap, prefersReducedMotion } from "@/lib/motion";

const PREVIEW_LEADS = [
  { sub: "r/SaaS", score: 94, title: "Google Analytics is so bloated I've started tracking events in a spreadsheet" },
  { sub: "r/freelance", score: 96, title: "Chasing a client for payment for the 4th time this month" },
  { sub: "r/sysadmin", score: 92, title: "Found out about downtime from a customer email, not our monitoring" },
];

export function HeroPreviewCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const rotateX = useRef<gsap.QuickToFunc | null>(null);
  const rotateY = useRef<gsap.QuickToFunc | null>(null);

  function ensureQuickTo() {
    if (!cardRef.current) return;
    if (!rotateX.current) {
      rotateX.current = gsap.quickTo(cardRef.current, "rotateX", { duration: 0.4, ease: "power2.out" });
      rotateY.current = gsap.quickTo(cardRef.current, "rotateY", { duration: 0.4, ease: "power2.out" });
    }
  }

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (prefersReducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;
    ensureQuickTo();
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateX.current?.(py * -6);
    rotateY.current?.(px * 6);
  }

  function handleMouseLeave() {
    ensureQuickTo();
    rotateX.current?.(0);
    rotateY.current?.(0);
  }

  return (
    <div className="relative lg:justify-self-end" style={{ perspective: 1000 }}>
      <div
        aria-hidden
        className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-primary/10 to-transparent blur-2xl motion-safe:animate-[spin_16s_linear_infinite] motion-reduce:animate-none"
      />
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full max-w-md rounded-2xl border border-border bg-card shadow-xl shadow-black/5 transition-shadow duration-300 hover:shadow-2xl hover:shadow-primary/10"
        style={{ transformStyle: "preserve-3d", willChange: "transform" }}
      >
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">Today&apos;s digest</p>
            <p className="text-xs text-muted-foreground">3 new qualified leads</p>
          </div>
        </div>
        <ul className="divide-y divide-border">
          {PREVIEW_LEADS.map((lead) => (
            <li key={lead.title} className="px-5 py-4">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-medium text-primary">{lead.sub}</span>
                <span className="text-muted-foreground">{lead.score}% match</span>
              </div>
              <p className="text-sm leading-snug font-medium text-pretty">{lead.title}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
