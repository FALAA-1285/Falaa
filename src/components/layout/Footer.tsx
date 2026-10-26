"use client";

import React from "react";
import { GithubIcon, LinkedinIcon, GmailIcon } from "@/components/ui/SocialIcons";
import { PERSONAL_INFO } from "@/data/portfolio";

export default function Footer() {
  return (
    <footer className="py-12 sm:px-0 px-4 bg-[#151414] text-white border-t border-black/10">
      <div className="container mx-auto overflow-hidden px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-light">
          {/* Identity & Socials */}
          <div>
            <h3 className="text-xl mb-4 text-white font-normal">
              FALAH
            </h3>
            <div className="flex space-x-4">
              <a
                href={PERSONAL_INFO.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300/70 transition-colors"
                aria-label="GitHub"
              >
                <GithubIcon className="h-5 w-5" />
              </a>
              <a
                href={PERSONAL_INFO.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300/70 transition-colors"
                aria-label="LinkedIn"
              >
                <LinkedinIcon className="h-5 w-5" />
              </a>
              <a
                href={`mailto:${PERSONAL_INFO.email}`}
                className="text-white hover:text-gray-300/70 transition-colors"
                aria-label="Email"
              >
                <GmailIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-2 text-xl font-light">
            <h3 className="mb-4 text-xl text-white font-normal">Navigation</h3>
            <a
              className="block hover:text-gray-300 transition-colors w-fit text-white/90"
              href="#hero"
            >
              Home
            </a>
            <a
              className="block hover:text-gray-300 transition-colors w-fit text-white/90"
              href="#about"
            >
              About
            </a>
            <a
              className="block hover:text-gray-300 transition-colors w-fit text-white/90"
              href="#projects"
            >
              Projects
            </a>
            <a
              className="block hover:text-gray-300 transition-colors w-fit text-white/90"
              href="#experience"
            >
              Experience
            </a>
            <a
              className="block hover:text-gray-300 transition-colors w-fit text-white/90"
              href="#skills"
            >
              Skills
            </a>
            <a
              className="block hover:text-gray-300 transition-colors w-fit text-white/90"
              href="#contact"
            >
              Contact
            </a>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="border-t border-white/20 mt-12 pt-8 font-light text-neutral-400 text-sm">
          <p className="mt-4">
            Designed and developed by FALAH. © 2026 All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
