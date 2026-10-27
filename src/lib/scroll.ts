"use client";

import Lenis from "lenis";

let lenisInstance: Lenis | null = null;

export function setLenisInstance(instance: Lenis | null) {
  lenisInstance = instance;
}

export function getLenisInstance(): Lenis | null {
  return lenisInstance;
}

/**
 * Smooth cubic-bezier curve (easeInOutCubic):
 * Starts gently without any sudden rocket launch, glides at a calm comfortable speed,
 * and decelerates softly into the destination.
 */
export const smoothEaseInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * Dynamically computes a calm, natural duration based on distance traveled:
 * - Short distance (< 700px): ~2.0s
 * - Medium distance (700px - 1800px): ~2.3s
 * - Long distance (> 1800px, e.g. footer to top): ~2.6s
 */
export function getRecommendedDuration(targetY: number): number {
  if (typeof window === "undefined") return 2.4;
  const currentY = window.scrollY;
  const distance = Math.abs(targetY - currentY);
  if (distance < 700) return 2.0;
  if (distance < 1800) return 2.3;
  return 2.6;
}

export function scrollToTarget(
  target: string | HTMLElement | number,
  options?: { offset?: number; duration?: number }
) {
  let targetPosition = 0;
  if (typeof target === "number") {
    targetPosition = target;
  } else if (typeof target === "string") {
    const el = document.querySelector(target) as HTMLElement;
    if (el) {
      targetPosition =
        el.getBoundingClientRect().top + window.scrollY + (options?.offset ?? -80);
    }
  } else if (target instanceof HTMLElement) {
    targetPosition =
      target.getBoundingClientRect().top + window.scrollY + (options?.offset ?? -80);
  }

  const duration = options?.duration ?? getRecommendedDuration(targetPosition);

  if (lenisInstance) {
    lenisInstance.scrollTo(target, {
      offset: options?.offset ?? (typeof target === "number" ? 0 : -80),
      duration,
      easing: smoothEaseInOut,
    });
  } else {
    if (typeof target === "number") {
      window.scrollTo({
        top: target,
        behavior: "smooth",
      });
    } else {
      const el =
        typeof target === "string" ? document.querySelector(target) : target;
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }
}

export function scrollToTop(options?: { duration?: number }) {
  const duration = options?.duration ?? getRecommendedDuration(0);
  scrollToTarget(0, { offset: 0, duration });
}
