"use client";

import Lenis from "lenis";

let lenisInstance: Lenis | null = null;

export function setLenisInstance(instance: Lenis | null) {
  lenisInstance = instance;
}

export function getLenisInstance(): Lenis | null {
  return lenisInstance;
}

export function scrollToTarget(
  target: string | HTMLElement,
  options?: { offset?: number; duration?: number }
) {
  if (lenisInstance) {
    lenisInstance.scrollTo(target, {
      offset: options?.offset ?? -80,
      duration: options?.duration ?? 1.8, // Calm, smooth gliding duration
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
  } else {
    const el =
      typeof target === "string" ? document.querySelector(target) : target;
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }
}
