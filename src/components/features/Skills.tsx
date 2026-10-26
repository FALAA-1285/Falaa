"use client";

import React, { useState, useEffect, useRef } from "react";
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

export default function Skills({
  initialSkillGroups,
}: {
  initialSkillGroups?: SkillCategoryGroup[];
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [parallaxOffset, setParallaxOffset] = useState(0);

  const skillGroups = initialSkillGroups || [];

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      // Parallax translation as user scrolls through Skills section
      const offset = (window.innerHeight / 2 - rect.top) * 0.12;
      setParallaxOffset(offset);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="relative py-28 bg-white text-black overflow-hidden min-h-screen scroll-mt-24"
    >
      {/* Giant Interactive Parallax Watermark Background */}
      <h2
        aria-hidden="true"
        style={{
          transform: `translateY(${parallaxOffset}px)`,
        }}
        className="absolute inset-0 md:-top-30 text-[6.5rem] md:text-[15rem] font-extrabold text-black/10 uppercase tracking-widest text-center pointer-events-none select-none -z-10 transition-transform duration-75 ease-out"
      >
        Skills
      </h2>

      <div className="relative z-10 container mx-auto px-4">
        {/* Title */}
        <h3 className="text-4xl md:text-5xl font-bold text-center mb-20 text-black">
          My Technical Skills
        </h3>

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
