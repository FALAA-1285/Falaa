"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { PERSONAL_INFO } from "@/data/portfolio";

export default function Hero() {
  const [scale, setScale] = useState(1);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const height = sectionRef.current.offsetHeight || window.innerHeight;
      const scrolled = -rect.top;
      const progress = Math.min(Math.max(scrolled / height, 0), 1);
      // Smoothly scale from 1 down to 0.5 as user scrolls down
      const newScale = 1 - progress * 0.5;
      setScale(newScale);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const textRepetition = " • FALAH • FALAH • FALAH • FALAH • FALAH • FALAH • FALAH • FALAH";

  return (
    <section
      ref={sectionRef}
      className="relative h-screen sm:mt-24 mt-0 items-center justify-center overflow-hidden scroll-mt-24 bg-white"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full">
        {/* Angled Running Text Behind & Over the Picture */}
        <div className="relative h-32 md:h-48 flex items-center justify-center">
          {/* 1. Foreground Marquee: Rotated +10deg, outlined hollow text, z-30 (in front of image) */}
          <div className="rotate-[10deg] absolute w-[130%] -left-[15%] whitespace-nowrap text-[65px] sm:text-[90px] md:text-[130px] xl:text-[180px] font-bold text-outline z-30 pointer-events-none select-none overflow-hidden">
            <div className="animate-marquee-right">
              <span className="shrink-0">{textRepetition}</span>
              <span className="shrink-0">{textRepetition}</span>
            </div>
          </div>

          {/* 2. Background Marquee: Rotated -10deg, solid black text, z-10 (behind image) */}
          <div className="-rotate-[10deg] absolute w-[130%] -left-[15%] whitespace-nowrap text-[65px] sm:text-[90px] md:text-[130px] xl:text-[180px] font-bold text-black z-10 pointer-events-none select-none overflow-hidden">
            <div className="animate-marquee-left">
              <span className="shrink-0">{textRepetition}</span>
              <span className="shrink-0">{textRepetition}</span>
            </div>
          </div>
        </div>

        {/* 3. Center Portrait Image: Scales down as user scrolls down, z-20 (between back & front text) */}
        <div
          style={{
            transform: `translate(-50%, -50%) scale(${scale})`,
          }}
          className="absolute top-1/2 left-1/2 w-[80%] max-w-md aspect-[3/4] z-20 origin-center transition-transform duration-75 ease-out"
        >
          <Image
            src="/avatar.png"
            alt={PERSONAL_INFO.name}
            fill
            priority
            sizes="(max-width: 768px) 80vw, 448px"
            className="object-cover shadow-xl rounded-b-md"
          />
        </div>
      </div>
    </section>
  );
}
