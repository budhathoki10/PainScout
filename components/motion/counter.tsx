"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion, registerGsapPlugins } from "@/lib/motion";
import { cn } from "@/lib/utils";

registerGsapPlugins();

interface CounterProps {
  to: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  duration?: number;
}

/** Count-up number that plays once when it scrolls into view. */
export function Counter({ to, prefix = "", suffix = "", decimals = 0, className, duration = 1.4 }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.textContent = `${prefix}${to.toFixed(decimals)}${suffix}`;
      return;
    }

    const proxy = { val: 0 };
    gsap.to(proxy, {
      val: to,
      duration,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 90%", once: true },
      onUpdate: () => {
        el.textContent = `${prefix}${proxy.val.toFixed(decimals)}${suffix}`;
      },
    });
  }, [to]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}0{suffix}
    </span>
  );
}
