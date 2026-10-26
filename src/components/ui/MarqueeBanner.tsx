"use client";

import React, { useRef, useState, useEffect } from "react";

interface StickyScaleBannerProps {
  text: string;
  isExperience?: boolean;
}

export default function MarqueeBanner({
  text,
  isExperience = false,
}: StickyScaleBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalScrollable =
        containerRef.current.offsetHeight - window.innerHeight;
      if (totalScrollable <= 0) return;
      const scrolled = -rect.top;
      const p = Math.min(Math.max(scrolled / totalScrollable, 0), 1);
      setProgress(p);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Center text scales up from 1.0 to 1.5 as you scroll through the sticky 150vh
  const centerScale = 1 + progress * 0.5;
  // Side texts scale down from 1.0 to 0.5 and fade out
  const sideScale = Math.max(1 - progress * 0.5, 0.4);
  const sideOpacity = Math.max(1 - progress * 0.6, 0.2);

  const widthClass = isExperience ? "w-[200%] right-1/2" : "w-[150%] right-1/4";

  return (
    <section
      ref={containerRef}
      className={`bg-white relative ${
        isExperience ? "mt-20" : "sm:my-20 my-0"
      }`}
    >
      <div
        style={{
          justifyContent: "center",
          alignItems: "flex-start",
          height: "140vh",
          display: "flex",
          position: "relative",
        }}
      >
        <div
          style={{
            width: "100%",
            position: "sticky",
            top: "38vh",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              textAlign: "center",
              display: "block",
              position: "relative",
            }}
            className={`pb-10 ${widthClass}`}
          >
            {/* Left Word: Shrinks & Fades */}
            <div
              style={{
                transform: `scale(${sideScale})`,
                opacity: sideOpacity,
              }}
              className="inline-block transition-transform duration-75 ease-out select-none"
            >
              <span className="text-4xl sm:text-6xl lg:text-8xl font-medium text-black tracking-tight">
                {text}
              </span>
            </div>

            {/* Center Word: Magnifies Dynamically (Scale 1.0 -> 1.5) */}
            <div
              style={{
                transform: `scale(${centerScale})`,
              }}
              className="inline-block transition-transform duration-75 ease-out select-none"
            >
              <span className="text-4xl sm:text-6xl lg:text-8xl font-medium mx-4 sm:mx-6 lg:mx-10 text-black tracking-tight">
                {text}
              </span>
            </div>

            {/* Right Word: Shrinks & Fades */}
            <div
              style={{
                transform: `scale(${sideScale})`,
                opacity: sideOpacity,
              }}
              className="inline-block transition-transform duration-75 ease-out select-none"
            >
              <span className="text-4xl sm:text-6xl lg:text-8xl font-medium text-black tracking-tight">
                {text}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
