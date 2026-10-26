"use client";

import React from "react";

interface MarqueeBannerProps {
  text: string;
}

export default function MarqueeBanner({ text }: MarqueeBannerProps) {
  return (
    <section className="bg-white relative sm:my-20 my-0 select-none overflow-hidden">
      <div className="flex justify-center items-center py-16 md:py-24">
        <div className="w-full overflow-hidden text-center">
          <div className="flex items-center justify-center space-x-6 md:space-x-12 whitespace-nowrap">
            <span className="text-4xl sm:text-6xl lg:text-8xl font-medium text-black tracking-tight">
              {text}
            </span>
            <span className="text-4xl sm:text-6xl lg:text-8xl font-medium text-black tracking-tight">
              {text}
            </span>
            <span className="text-4xl sm:text-6xl lg:text-8xl font-medium text-black tracking-tight">
              {text}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
