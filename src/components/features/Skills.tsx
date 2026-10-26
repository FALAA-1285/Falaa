"use client";

import React, { useState } from "react";
import { SkillCategoryGroup } from "@/types/skills";

function SkillCard({ name, icon }: { name: string; icon: string }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      className="flex flex-col items-center gap-3 group cursor-pointer select-none"
    >
      <div className="relative w-12 h-12 md:w-14 md:h-14 flex items-center justify-center pointer-events-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/icons/${icon}`}
          alt={name}
          className="w-full h-full object-contain transition-all duration-300 ease-out"
          style={{
            filter: isHovered
              ? "grayscale(0%) contrast(100%) brightness(100%)"
              : "grayscale(100%) contrast(125%) brightness(95%)",
            opacity: isHovered ? 1 : 0.7,
            transform: "none",
          }}
        />
      </div>
      <span
        className="text-sm font-medium transition-colors duration-200 text-center"
        style={{
          color: isHovered ? "#000000" : "#6b7280",
        }}
      >
        {name}
      </span>
    </div>
  );
}

function getCategoryPriority(category: string): number {
  const norm = (category || "").toLowerCase().trim();
  // 1. Bahasa Pemrograman / Programming Languages
  if (
    norm.includes("bahasa") ||
    norm.includes("programming") ||
    norm.includes("language")
  ) {
    return 1;
  }
  // 2. Frontend
  if (
    norm.includes("frontend") ||
    norm.includes("front-end") ||
    norm.includes("front end")
  ) {
    return 2;
  }
  // 3. Backend
  if (
    norm.includes("backend") ||
    norm.includes("back-end") ||
    norm.includes("back end") ||
    norm.includes("beckend")
  ) {
    return 3;
  }
  // 4. Databases
  if (
    norm.includes("database") ||
    norm.includes("basis data") ||
    norm.includes("sql") ||
    norm.includes("db")
  ) {
    return 4;
  }
  // 5. Tools & Machine Learning / Tools
  if (
    norm.includes("tool") ||
    norm.includes("machine learning") ||
    norm.includes("alat") ||
    norm.includes("devops")
  ) {
    return 5;
  }
  return 10;
}

export default function Skills({
  initialSkillGroups,
}: {
  initialSkillGroups?: SkillCategoryGroup[];
}) {
  const skillGroups = [...(initialSkillGroups || [])].sort((a, b) => {
    const pA = getCategoryPriority(a.category);
    const pB = getCategoryPriority(b.category);
    if (pA !== pB) return pA - pB;
    return a.category.localeCompare(b.category);
  });

  return (
    <section
      id="skills"
      className="relative py-28 bg-white text-black overflow-hidden min-h-screen scroll-mt-24"
    >
      <div className="relative z-10 container mx-auto px-4">
        {/* Harmonized Section Header with Perfectly Centered Watermark */}
        <div className="relative flex items-center justify-center mb-16 sm:mb-20 select-none py-4">
          {/* Subtle Watermark Background - Centered Behind Title */}
          <span
            aria-hidden="true"
            className="absolute text-6xl sm:text-8xl md:text-[10rem] lg:text-[13rem] font-extrabold text-black/[0.05] uppercase tracking-widest pointer-events-none select-none whitespace-nowrap leading-none"
          >
            SKILLS
          </span>

          {/* Foreground Title */}
          <h3 className="relative z-10 text-3xl sm:text-4xl md:text-5xl font-bold text-center text-black tracking-tight">
            My Technical Skills
          </h3>
        </div>

        {/* Categories */}
        <div className="space-y-20 max-w-6xl mx-auto">
          {skillGroups.map((group) => (
            <div key={group.category} className="space-y-8">
              <h4 className="text-2xl font-bold text-black">
                {group.category}
              </h4>

              {/* Grid: Monochromatic by default, reveals official colors on cursor hover */}
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-12">
                {group.skills.map((skill) => (
                  <SkillCard
                    key={skill.id ? `${skill.id}-${skill.name}` : skill.name}
                    name={skill.name}
                    icon={skill.icon}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
