"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion, registerGsapPlugins } from "@/lib/motion";

registerGsapPlugins();

/**
 * Ambient glow, fixed to the viewport so it's visible behind every page.
 * Drifts along a gentle arc from bottom-left to top-right as the page
 * scrolls, with a scrub lag so it keeps gliding after scrolling stops —
 * that lazy catch-up is what reads as "cloud" instead of "slider".
 * Positions stay within 0–100%; going past that edge causes a hard
 * clipping seam where the gradient box cuts off.
 */
export function AppGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!glowRef.current || prefersReducedMotion()) return;
      gsap.set(glowRef.current, { "--gx": "0%", "--gy": "100%" });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "+=800",
            scrub: 1.2,
          },
        })
        .to(glowRef.current, { "--gx": "25%", "--gy": "70%", ease: "sine.inOut" })
        .to(glowRef.current, { "--gx": "50%", "--gy": "45%", ease: "sine.inOut" })
        .to(glowRef.current, { "--gx": "75%", "--gy": "25%", ease: "sine.inOut" })
        .to(glowRef.current, { "--gx": "100%", "--gy": "0%", ease: "sine.inOut" });
    },
    { scope: glowRef },
  );

  return (
    <div
      ref={glowRef}
      aria-hidden
      style={{ "--gx": "0%", "--gy": "100%" } as React.CSSProperties}
      className="pointer-events-none fixed inset-0 -z-10 blur-[70px] bg-[radial-gradient(circle_420px_at_var(--gx)_var(--gy),color-mix(in_oklch,var(--primary)_20%,transparent),transparent)]"
    />
  );
}
