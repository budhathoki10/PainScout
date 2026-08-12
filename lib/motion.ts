import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

/** Registers GSAP plugins exactly once, client-side only. */
export function registerGsapPlugins() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Shared timing tokens so every animation in the app shares the same rhythm. */
export const MOTION = {
  ease: {
    out: "power2.out",
    inOut: "power2.inOut",
    subtle: "power1.out",
    back: "back.out(1.4)",
  },
  duration: {
    micro: 0.2,
    reveal: 0.5,
    complex: 0.6,
  },
  stagger: {
    tight: 0.03,
    list: 0.06,
    loose: 0.08,
  },
} as const;

export { gsap, ScrollTrigger };
