"use client";

import React, { useRef, useState, useEffect } from "react";
import { EXPERIENCE_DATA } from "@/data/portfolio";

export default function Experience() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [lineHeightPercent, setLineHeightPercent] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowH = window.innerHeight;
      const sectionH = sectionRef.current.offsetHeight;

      // When section top is at 70% of viewport, start filling line
      // When section bottom is near bottom of viewport, line reaches 100%
      const startTrigger = windowH * 0.7;
      const scrolled = startTrigger - rect.top;
      const progress = Math.min(Math.max(scrolled / (sectionH * 0.9), 0), 1);
      setLineHeightPercent(progress * 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
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
          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-black/20" />

          {/* Dynamic Interactive Fill Line matching Reference: scales down smoothly as you scroll */}
          <div
            className="absolute left-0 top-0 w-[2px] bg-black origin-top transition-all duration-100 ease-out"
            style={{
              height: `${lineHeightPercent}%`,
            }}
          />

          {/* Experience Items matching reference */}
          <div className="space-y-20">
            {EXPERIENCE_DATA.map((item, index) => (
              <div
                key={index}
                className="relative pl-12 pb-2 group transition-all duration-300"
              >
                {/* Circle indicator node: enlarges & fills black on hover */}
                <div className="absolute left-[-6.5px] top-1.5 w-[15px] h-[15px] bg-black rounded-full border-2 border-white transition-transform duration-300 group-hover:scale-125 shadow-xs" />

                <span className="text-sm font-medium text-black/60 group-hover:text-black mb-1 block transition-colors duration-200">
                  {item.period}
                </span>

                <h3 className="text-xl font-bold text-black group-hover:translate-x-1 transition-transform duration-200">
                  {item.role}
                </h3>

                <h4 className="text-lg text-black/70 mb-2 font-normal">
                  {item.organization}
                </h4>

                <p className="text-black/60 group-hover:text-black/80 max-w-2xl leading-relaxed text-base transition-colors duration-200">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
