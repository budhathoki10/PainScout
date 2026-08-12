"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion, registerGsapPlugins } from "@/lib/motion";
import { cn } from "@/lib/utils";

registerGsapPlugins();

interface MarqueeProps {
  items: string[];
  className?: string;
  speed?: number;
}

/** Infinite horizontal ticker. Duplicates the list once for a seamless loop, pauses on hover. */
export function Marquee({ items, className, speed = 40 }: MarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useGSAP(() => {
    const track = trackRef.current;
    if (!track || prefersReducedMotion()) return;

    const distance = track.scrollWidth / 2;
    tweenRef.current = gsap.to(track, {
      x: -distance,
      duration: distance / speed,
      ease: "none",
      repeat: -1,
    });
  }, [items, speed]);

  return (
    <div
      className={cn("group relative overflow-hidden", className)}
      style={{
        maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
      }}
      onMouseEnter={() => tweenRef.current?.pause()}
      onMouseLeave={() => tweenRef.current?.resume()}
    >
      <div ref={trackRef} className="flex w-max items-center gap-3 will-change-transform">
        {[...items, ...items].map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="shrink-0 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground"
          >
            r/{item}
          </span>
        ))}
      </div>
    </div>
  );
}
