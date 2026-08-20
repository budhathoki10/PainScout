"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion, registerGsapPlugins } from "@/lib/motion";

registerGsapPlugins();

/** A soft ambient cloud that drifts slowly from bottom-left to top-right. */
export function AppGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!glowRef.current || prefersReducedMotion()) return;

      gsap.fromTo(
        glowRef.current,
        { x: 0, y: 0 },
        {
          x: () => window.innerWidth * 0.78,
          y: () => -window.innerHeight * 0.76,
          ease: "none",
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: () => {
              const availableScroll = document.documentElement.scrollHeight - window.innerHeight;
              return `+=${Math.min(2200, Math.max(1, availableScroll))}`;
            },
            scrub: 2.4,
            invalidateOnRefresh: true,
          },
        },
      );
    },
    { scope: glowRef },
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        ref={glowRef}
        className="absolute -bottom-48 -left-40 h-[32rem] w-[38rem] max-w-[90vw] will-change-transform"
      >
        <div className="absolute inset-0 rounded-[48%] bg-primary/[0.08] blur-[100px] dark:bg-primary/[0.06]" />
        <div className="absolute top-16 right-4 h-72 w-80 rounded-[52%] bg-primary/[0.05] blur-[80px] dark:bg-primary/[0.04]" />
      </div>
    </div>
  );
}
