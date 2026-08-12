"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, MOTION, prefersReducedMotion, registerGsapPlugins } from "@/lib/motion";

registerGsapPlugins();

interface RevealProps {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** Animates direct children with a stagger instead of the container as one block. */
  stagger?: number;
  /** Vertical offset in px the content travels while fading in. */
  y?: number;
  /** "scroll" reveals when the section enters the viewport; "load" runs once on mount (above-the-fold). */
  trigger?: "scroll" | "load";
  delay?: number;
}

/**
 * Fade + rise reveal, per the reference motion presets:
 * Scroll Reveal / Standard (300deg travel, power2.out, 24px, 0.08 stagger).
 * Skips entirely when the user prefers reduced motion — content is simply visible.
 */
export function Reveal({
  as: Tag = "div",
  children,
  className,
  stagger = MOTION.stagger.loose,
  y = 24,
  trigger = "scroll",
  delay = 0,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!ref.current || prefersReducedMotion()) return;
      const targets = ref.current.children.length > 0 ? ref.current.children : ref.current;

      const tween = {
        opacity: 0,
        y,
        duration: MOTION.duration.reveal,
        stagger,
        delay,
        ease: MOTION.ease.out,
      };

      if (trigger === "load") {
        gsap.from(targets, tween);
      } else {
        gsap.from(targets, {
          ...tween,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      }
    },
    { scope: ref },
  );

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={className}>
      {children}
    </Tag>
  );
}

export { ScrollTrigger };
