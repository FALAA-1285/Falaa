"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { PERSONAL_INFO } from "@/data/portfolio";

const ABOUT_TAGS = [
  "Web Development",
  "Mobile App Development",
  "API Development",
  "UI/UX Design",
];

export default function About() {
  const handleScrollDown = () => {
    const el = document.getElementById("projects");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="about" className="bg-white sm:my-20 mb-12 sm:mb-0 scroll-mt-24 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-medium mb-8 text-black">
            Hey! I&apos;m FALAH, a fullstack developer based in Indonesia.
          </h2>

          <p className="md:text-2xl text-lg text-black/70 mb-8 font-normal leading-relaxed">
            {PERSONAL_INFO.about}
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {ABOUT_TAGS.map((tag) => (
              <span
                key={tag}
                className="px-4 py-2 border border-black/10 rounded-full bg-white shadow-sm cursor-default text-black text-sm md:text-base font-normal"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll Down */}
        <div
          onClick={handleScrollDown}
          className="flex flex-col items-center justify-center mt-8 mb-4 cursor-pointer text-black/50 hover:text-black transition-colors"
        >
          <span className="text-sm text-black/50 mb-2">Scroll Down</span>
          <div className="bg-white rounded-full p-2 shadow-md border border-black/5">
            <ChevronDown className="h-5 w-5 text-black/70" />
          </div>
        </div>
      </div>
    </section>
  );
}
