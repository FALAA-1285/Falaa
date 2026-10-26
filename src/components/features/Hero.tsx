"use client";

import React from "react";
import Image from "next/image";
import { PERSONAL_INFO } from "@/data/portfolio";

export default function Hero() {
  return (
    <section className="relative h-screen sm:mt-24 mt-0 flex items-center justify-center overflow-hidden scroll-mt-24 bg-white">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex items-center justify-center">
        {/* Central portrait frame matching reference site */}
        <div className="relative w-[80%] max-w-md aspect-[3/4] z-20">
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
