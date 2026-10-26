"use client";

import React from "react";
import { Mail } from "lucide-react";
import { LinkedinIcon, GithubIcon } from "@/components/ui/SocialIcons";
import { PERSONAL_INFO } from "@/data/portfolio";

export default function Contact() {
  return (
    <section id="contact" className="my-28 sm:my-36 mb-[12rem] sm:mb-[15rem] bg-white text-black scroll-mt-24">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Heading matching Reference */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 text-black">
            Let&apos;s work together.
          </h2>
          <p className="text-lg md:text-xl text-gray-600 font-normal">
            I&apos;m open to internships, freelance projects, and collaboration opportunities.
          </p>
        </div>

        {/* Contact Links matching Reference */}
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Email */}
          <div className="flex items-center gap-3 text-lg md:text-xl text-gray-800">
            <Mail className="w-5 h-5 md:w-6 md:h-6 text-black shrink-0" />
            <a
              href={`mailto:${PERSONAL_INFO.email}`}
              className="underline hover:text-black transition-colors"
            >
              {PERSONAL_INFO.email}
            </a>
          </div>

          {/* LinkedIn */}
          <div className="flex items-center gap-3 text-lg md:text-xl text-gray-800">
            <LinkedinIcon className="w-5 h-5 md:w-6 md:h-6 text-black shrink-0" />
            <a
              href={PERSONAL_INFO.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-black transition-colors"
            >
              linkedin.com/in/ahmad-falahi-8507a4313
            </a>
          </div>

          {/* GitHub */}
          <div className="flex items-center gap-3 text-lg md:text-xl text-gray-800">
            <GithubIcon className="w-5 h-5 md:w-6 md:h-6 text-black shrink-0" />
            <a
              href={PERSONAL_INFO.github}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-black transition-colors"
            >
              github.com/FALAA-1285
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
