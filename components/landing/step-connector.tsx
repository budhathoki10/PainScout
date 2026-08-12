"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion, registerGsapPlugins } from "@/lib/motion";

registerGsapPlugins();

/** Horizontal line that draws itself in as the steps section scrolls into view. */
export function StepConnector() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!lineRef.current || prefersReducedMotion()) return;
      gsap.fromTo(
        lineRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          transformOrigin: "left center",
          scrollTrigger: {
            trigger: wrapRef.current,
            start: "top 75%",
            end: "bottom 60%",
            scrub: 0.5,
          },
        },
      );
    },
    { scope: wrapRef },
  );

  return (
    <div ref={wrapRef} aria-hidden className="absolute top-6 right-[16.6%] left-[16.6%] hidden h-px sm:block">
      <div className="absolute inset-0 bg-border" />
      <div ref={lineRef} className="absolute inset-0 bg-primary" />
    </div>
  );
}
