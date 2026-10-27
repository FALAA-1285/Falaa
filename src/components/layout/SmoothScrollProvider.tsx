"use client";

import React, { useEffect } from "react";
import Lenis from "lenis";
import { setLenisInstance, scrollToTarget, scrollToTop } from "@/lib/scroll";

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.6, // Slower, relaxed scroll duration
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.75, // Gentle wheel scroll distance (prevents fast jumps)
      touchMultiplier: 1.2,
      infinite: false,
      autoRaf: true,
    });

    setLenisInstance(lenis);

    // Global interceptor for in-page anchor links (href="#projects", href="#experience", etc.)
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (href === "#" || href === "#top") {
        e.preventDefault();
        scrollToTop();
        return;
      }
      if (href && href.startsWith("#") && href.length > 1) {
        const element = document.querySelector(href);
        if (element) {
          e.preventDefault();
          scrollToTarget(href, { offset: -80 });
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);

    return () => {
      document.removeEventListener("click", handleAnchorClick);
      lenis.destroy();
      setLenisInstance(null);
    };
  }, []);

  return <>{children}</>;
}
