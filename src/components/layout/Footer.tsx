import React from "react";
import { GithubIcon, LinkedinIcon, GmailIcon } from "@/components/ui/SocialIcons";
import { DEFAULT_PERSONAL_INFO } from "@/lib/constants";
import { PersonalInfo } from "@/types/portfolio";
import { isSafeUrl, createSafeMailtoUrl } from "@/lib/security";

export default function Footer({ profile }: { profile?: PersonalInfo }) {
  const activeProfile = profile || DEFAULT_PERSONAL_INFO;
  const displayName = "AHMAD • FALAHI";

  const safeGithub = isSafeUrl(activeProfile.github) ? activeProfile.github : null;
  const safeLinkedin = isSafeUrl(activeProfile.linkedin) ? activeProfile.linkedin : null;
  const safeMailto = createSafeMailtoUrl(activeProfile.email);

  return (
    <footer className="py-12 sm:px-0 px-4 bg-[#151414] text-white border-t border-black/10">
      <div className="container mx-auto overflow-hidden px-4 md:px-8">
        {/* 1. Seamless Marquee Ticker Matching Reference (zurihaqi.github.io) */}
        <div className="overflow-hidden mb-12 select-none pointer-events-none">
          <div className="animate-marquee-left flex whitespace-nowrap">
            <div className="flex shrink-0 items-center text-3xl sm:text-4xl font-light text-white">
              <span className="mr-24 sm:mr-40">THANKS FOR VISITING</span>
              <span className="mr-24 sm:mr-40">LET&apos;S CONNECT</span>
              <span className="mr-24 sm:mr-40">CHECK OUT MY GITHUB</span>
              <span className="mr-24 sm:mr-40">AHMAD • FALAHI</span>
            </div>
            <div className="flex shrink-0 items-center text-3xl sm:text-4xl font-light text-white">
              <span className="mr-24 sm:mr-40">THANKS FOR VISITING</span>
              <span className="mr-24 sm:mr-40">LET&apos;S CONNECT</span>
              <span className="mr-24 sm:mr-40">CHECK OUT MY GITHUB</span>
              <span className="mr-24 sm:mr-40">AHMAD • FALAHI</span>
            </div>
          </div>
        </div>

        {/* 2. Main Footer Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-light">
          {/* Identity & Socials */}
          <div>
            <h3 className="text-xl mb-4 text-white font-normal">
              {displayName}
            </h3>
            <div className="flex space-x-4">
              {safeGithub && (
                <a
                  href={safeGithub}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-gray-300/70 transition-colors"
                  aria-label="GitHub"
                >
                  <GithubIcon className="h-5 w-5" />
                </a>
              )}
              {safeLinkedin && (
                <a
                  href={safeLinkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-gray-300/70 transition-colors"
                  aria-label="LinkedIn"
                >
                  <LinkedinIcon className="h-5 w-5" />
                </a>
              )}
              {safeMailto !== "#" && (
                <a
                  href={safeMailto}
                  className="text-white hover:text-gray-300/70 transition-colors"
                  aria-label="Email"
                >
                  <GmailIcon className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Navigation Links & Copyright */}
          <div className="flex flex-col md:items-end justify-between">
            <div className="flex flex-wrap gap-4 md:gap-6 mb-4 text-sm font-normal text-white">
              <a
                href="#about"
                className="hover:text-gray-300 transition-colors"
              >
                About
              </a>
              <a
                href="#projects"
                className="hover:text-gray-300 transition-colors"
              >
                Projects
              </a>
              <a
                href="#experience"
                className="hover:text-gray-300 transition-colors"
              >
                Experience
              </a>
              <a
                href="#skills"
                className="hover:text-gray-300 transition-colors"
              >
                Skills
              </a>
              <a
                href="#contact"
                className="hover:text-gray-300 transition-colors"
              >
                Contact
              </a>
            </div>

            <p className="text-xs text-neutral-400 font-light mt-6 md:mt-0">
              Designed and developed by Ahmad Falahi. &copy; 2026 All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
