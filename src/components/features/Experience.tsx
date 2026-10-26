"use client";

import React, { useRef, useEffect } from "react";
import { ExperienceItem } from "@/types/portfolio";

export default function Experience({
  initialExperiences = [],
}: {
  initialExperiences?: ExperienceItem[];
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const fillLineRef = useRef<HTMLDivElement>(null);

  // References for buttery-smooth lerp (Linear Interpolation) loop
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);

  const experiences = initialExperiences;

  useEffect(() => {
    let rafId: number;

    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowH = window.innerHeight;
      const sectionH = sectionRef.current.offsetHeight;

      // Start filling line smoothly when section enters 75% of viewport
      const startTrigger = windowH * 0.75;
      const scrolled = startTrigger - rect.top;
      const maxScrollable = sectionH * 0.88;
      const progress = Math.min(Math.max(scrolled / maxScrollable, 0), 1);
      targetProgressRef.current = progress;
    };

    // Smooth physics-based interpolation loop (60/120 FPS without React re-render lag)
    const animateLine = () => {
      const diff = targetProgressRef.current - currentProgressRef.current;
      if (Math.abs(diff) > 0.0003) {
        currentProgressRef.current += diff * 0.12; // Smooth damped easing
      } else {
        currentProgressRef.current = targetProgressRef.current;
      }

      if (fillLineRef.current) {
        fillLineRef.current.style.transform = `scaleY(${currentProgressRef.current})`;
      }

      rafId = requestAnimationFrame(animateLine);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    rafId = requestAnimationFrame(animateLine);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="experience"
      className="relative w-full bg-white text-black sm:py-20 py-8 overflow-hidden scroll-mt-24"
    >
      <div className="max-w-4xl mx-auto px-6">
        <div className="relative">
          {/* Base Background Line */}
          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-black/15" />

          {/* Dynamic Interactive Fill Line: GPU-accelerated smooth scaleY with physics easing */}
          <div
            ref={fillLineRef}
            className="absolute left-0 top-0 w-[2px] h-full bg-black origin-top will-change-transform"
            style={{
              transform: "scaleY(0)",
            }}
          />

          {/* Experience Items matching previous design */}
          <div className="space-y-16 sm:space-y-20">
            {experiences.map((item, index) => (
              <div
                key={item.id ?? index}
                className="relative pl-10 sm:pl-12 pb-2 group transition-all duration-300"
              >
                {/* Circle indicator node: enlarges & fills black on hover */}
                <div className="absolute left-[-6.5px] top-1.5 w-[15px] h-[15px] bg-black rounded-full border-2 border-white transition-transform duration-300 group-hover:scale-125 shadow-xs" />

                <span className="text-sm font-semibold text-black/60 group-hover:text-black mb-1 block transition-colors duration-200">
                  {item.period}
                </span>

                <h3 className="text-xl sm:text-2xl font-bold text-black group-hover:translate-x-1 transition-transform duration-200">
                  {item.role}
                </h3>

                <h4 className="text-base sm:text-lg text-black/70 mb-3 font-normal">
                  {item.organization}
                  {item.location && (
                    <span className="text-sm text-black/50 ml-2">
                      ({item.location})
                    </span>
                  )}
                </h4>

                {item.description && (
                  <p className="text-black/60 group-hover:text-black/80 max-w-2xl leading-relaxed text-sm sm:text-base transition-colors duration-200 mb-3">
                    {item.description}
                  </p>
                )}

                {item.highlights && item.highlights.length > 0 && (
                  <ul className="mt-2 space-y-1.5 text-sm text-black/65 list-disc list-inside max-w-2xl">
                    {item.highlights.map((h, i) => (
                      <li key={i} className="leading-relaxed">
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
