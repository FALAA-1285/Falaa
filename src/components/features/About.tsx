import React from "react";
import { ChevronDown } from "lucide-react";
import { DEFAULT_PERSONAL_INFO } from "@/lib/constants";
import { PersonalInfo } from "@/types/portfolio";

const DEFAULT_ABOUT_TAGS = [
  "Web Development",
  "Mobile App Development",
  "API Development",
  "UI/UX Design",
];

export default function About({ profile }: { profile?: PersonalInfo }) {
  const activeProfile = profile || DEFAULT_PERSONAL_INFO;

  const headline =
    activeProfile.aboutHeadline ||
    `Hey! I'm ${activeProfile.name || "FALAH"}, a ${activeProfile.title || "Web Developer"} based in ${activeProfile.location || "Malang, Indonesia"}.`;

  const tags =
    activeProfile.aboutTags && activeProfile.aboutTags.length > 0
      ? activeProfile.aboutTags
      : DEFAULT_ABOUT_TAGS;

  return (
    <section id="about" className="bg-white sm:my-20 mb-12 sm:mb-0 scroll-mt-24 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* 1. Dynamic Headline (Modifiable via CMS Profile) */}
          <h2 className="text-3xl md:text-5xl font-medium mb-8 text-black leading-tight">
            {headline}
          </h2>

          {/* 2. About Bio Description */}
          <p className="md:text-2xl text-lg text-black/70 mb-8 font-normal leading-relaxed">
            {activeProfile.about}
          </p>

          {/* 3. Dynamic Specialty Tags (Modifiable via CMS Profile) */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-16">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-4 py-2 border border-black/10 rounded-full bg-white shadow-sm cursor-default text-black text-sm md:text-base font-normal hover:border-black/30 transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll Down */}
        <a
          href="#projects"
          className="flex flex-col items-center justify-center mt-8 mb-4 cursor-pointer text-black/50 hover:text-black transition-colors"
          aria-label="Scroll down to projects"
        >
          <span className="text-sm text-black/50 mb-2">Scroll Down</span>
          <div className="bg-white rounded-full p-2 shadow-md border border-black/5 hover:scale-105 transition-transform">
            <ChevronDown className="h-5 w-5 text-black/70" />
          </div>
        </a>
      </div>
    </section>
  );
}
