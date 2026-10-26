"use client";

import React from "react";
import { EXPERIENCE_DATA } from "@/data/portfolio";

export default function Experience() {
  return (
    <section
      id="experience"
      className="relative w-full bg-white text-black sm:py-20 py-8 overflow-hidden scroll-mt-24"
    >
      <div className="max-w-4xl mx-auto px-6">
        <div className="relative">
          {/* Vertical Timeline Line */}
          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-black/20" />

          {/* Experience Items matching reference */}
          <div className="space-y-20">
            {EXPERIENCE_DATA.map((item, index) => (
              <div key={index} className="relative pl-12 pb-2">
                {/* Circle indicator node */}
                <div className="absolute left-[-6.5px] top-0 w-[15px] h-[15px] bg-black rounded-full border-2 border-white" />

                <span className="text-sm font-medium text-black/60 mb-1 block">
                  {item.period}
                </span>

                <h3 className="text-xl font-bold text-black">
                  {item.role}
                </h3>

                <h4 className="text-lg text-black/70 mb-2">
                  {item.organization}
                </h4>

                <p className="text-black/60 max-w-2xl leading-relaxed text-base">
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
