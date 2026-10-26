"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Marquee from "react-fast-marquee";
import { Inter } from "next/font/google";
import { DEFAULT_PERSONAL_INFO } from "@/lib/constants";
import { PersonalInfo } from "@/types/portfolio";

const inter = Inter({ subsets: ["latin"], weight: ["700", "800"] });

export default function Hero({ profile }: { profile?: PersonalInfo }) {
  const [scale, setScale] = useState(1);
  const sectionRef = useRef<HTMLElement>(null);

  const activeProfile = profile || DEFAULT_PERSONAL_INFO;
  const name = activeProfile.name || "FALAH";

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

  return (
    <section
      ref={sectionRef}
      className="relative h-screen sm:mt-24 mt-0 items-center justify-center overflow-hidden scroll-mt-24 bg-white"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full">
        {/* Angled Running Text Behind & Over the Picture Matching Reference */}
        <div className="relative">
          {/* 1. Foreground Marquee: Rotated +10deg, outlined crisp text, z-30 (in front of avatar) */}
          <Marquee
            speed={50}
            style={{ position: "absolute" }}
            direction="right"
            className={`${inter.className} rotate-[10deg] w-full whitespace-nowrap text-[70px] text-center xl:text-[180px] text-black text-outline font-bold z-30 pointer-events-none select-none`}
          >
            <span> • AHMAD • FALAHI</span>
          </Marquee>

          {/* 2. Background Marquee: Rotated -10deg, solid black text, z-10 (behind avatar) */}
          <Marquee
            speed={50}
            className={`${inter.className} -rotate-[10deg] absolute top-0 left-0 w-full whitespace-nowrap text-[70px] text-center xl:text-[180px] font-bold text-black z-10 pointer-events-none select-none`}
          >
            <span> • AHMAD • FALAHI</span>
          </Marquee>
        </div>

        {/* 3. Center Portrait Image: Scales down as user scrolls down, z-20 (between back & front text) */}
        <div
          style={{
            transform: `translate(-50%, -50%) scale(${scale})`,
          }}
          className="absolute top-1/2 left-1/2 w-[80%] max-w-md aspect-[3/4] z-20 origin-center transition-transform duration-75 ease-out"
        >
          <Image
            src="/foto.jpg"
            alt={name}
            fill
            priority
            fetchPriority="high"
            sizes="(max-width: 768px) 80vw, 448px"
            className="object-cover shadow-xl rounded-b-md"
          />
        </div>
      </div>
    </section>
  );
}
