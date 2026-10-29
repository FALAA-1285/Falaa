"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { GithubIcon, LinkedinIcon, GmailIcon } from "@/components/ui/SocialIcons";
import { DEFAULT_PERSONAL_INFO } from "@/lib/constants";
import { PersonalInfo } from "@/types/portfolio";
import { isSafeUrl, createSafeMailtoUrl } from "@/lib/security";
import { getLenisInstance, smoothEaseInOut } from "@/lib/scroll";

export default function Footer({ profile }: { profile?: PersonalInfo }) {
  const activeProfile = profile || DEFAULT_PERSONAL_INFO;
  const displayName = "AHMAD • FALAHI";

  const safeGithub = isSafeUrl(activeProfile.github) ? activeProfile.github : null;
  const safeLinkedin = isSafeUrl(activeProfile.linkedin) ? activeProfile.linkedin : null;
  const safeMailto = createSafeMailtoUrl(activeProfile.email);

  // NestJS-style Easter Egg state
  const EASTER_EGG_GIFS = [
    "/assets/1-BNBWLvLj.gif",
    "/assets/2-CcbPJLpa.gif",
    "/assets/3-jipPUaqJ.gif",
  ];

  const [isEasterEggRevealed, setIsEasterEggRevealed] = useState(false);
  const [activeGifIndex, setActiveGifIndex] = useState(0);
  const footerRef = useRef<HTMLElement>(null);
  const easterEggRef = useRef<HTMLDivElement>(null);
  const isRevealedRef = useRef(false);

  // Pick initial random index on client mount to avoid hydration mismatch
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveGifIndex(Math.floor(Math.random() * EASTER_EGG_GIFS.length));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Tracking state for strictly holding at footer before allowing force scroll
  const isSettledAtBottomRef = useRef(false);
  const settleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartedAtBottomRef = useRef(false);

  const revealEasterEgg = useCallback(() => {
    if (isRevealedRef.current) return;
    isRevealedRef.current = true;
    setIsEasterEggRevealed(true);

    // Give DOM time to update height, then notify Lenis to resize and scroll down
    setTimeout(() => {
      const lenis = getLenisInstance();
      if (lenis) {
        lenis.resize();
        lenis.scrollTo(document.documentElement.scrollHeight, {
          duration: 1.8,
          easing: smoothEaseInOut,
        });
      } else {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 120);
  }, []);

  useEffect(() => {
    const checkIsAtBottom = () => {
      const lenis = getLenisInstance();
      if (lenis) {
        return lenis.scroll >= lenis.limit - 5;
      }
      const scrollY = window.scrollY;
      const innerHeight = window.innerHeight;
      const scrollHeight = document.documentElement.scrollHeight;
      return scrollY + innerHeight >= scrollHeight - 5;
    };

    // 1. Scroll listener ONLY tracks position and requires settling at the footer
    // It NEVER automatically reveals the easter egg on normal scroll!
    const handleScroll = () => {
      // If user scrolls back up significantly towards top (< 400px), reset revealed state
      if (window.scrollY < 400 && isRevealedRef.current) {
        isRevealedRef.current = false;
        setIsEasterEggRevealed(false);
        isSettledAtBottomRef.current = false;
        if (settleTimeoutRef.current) {
          clearTimeout(settleTimeoutRef.current);
          settleTimeoutRef.current = null;
        }
        const lenis = getLenisInstance();
        if (lenis) lenis.resize();
        return;
      }

      if (isRevealedRef.current) return;

      const atBottom = checkIsAtBottom();

      if (atBottom) {
        // User has reached the footer.
        // We reset any pending settle timer so ongoing scroll momentum doesn't prematurely settle.
        if (settleTimeoutRef.current) {
          clearTimeout(settleTimeoutRef.current);
        }
        // User must pause/settle at footer for 350ms before force-scroll is enabled
        settleTimeoutRef.current = setTimeout(() => {
          if (checkIsAtBottom() && !isRevealedRef.current) {
            isSettledAtBottomRef.current = true;
          }
        }, 350);
      } else {
        // User is not at the footer
        isSettledAtBottomRef.current = false;
        if (settleTimeoutRef.current) {
          clearTimeout(settleTimeoutRef.current);
          settleTimeoutRef.current = null;
        }
      }
    };

    // 2. Wheel event: user MUST ALREADY BE SETTLED at bottom, and THEN rolls wheel downwards again
    const handleWheel = (e: WheelEvent) => {
      if (isRevealedRef.current) return;

      const atBottom = checkIsAtBottom();

      if (!atBottom) {
        isSettledAtBottomRef.current = false;
        if (settleTimeoutRef.current) {
          clearTimeout(settleTimeoutRef.current);
          settleTimeoutRef.current = null;
        }
        return;
      }

      if (e.deltaY > 0) {
        // Downward wheel stroke
        if (isSettledAtBottomRef.current) {
          // The user was already stopped/held at the footer and has now deliberately forced another scroll down!
          revealEasterEgg();
        } else {
          // Still scrolling down into footer (momentum). Restart the settle timer.
          if (settleTimeoutRef.current) {
            clearTimeout(settleTimeoutRef.current);
          }
          settleTimeoutRef.current = setTimeout(() => {
            if (checkIsAtBottom() && !isRevealedRef.current) {
              isSettledAtBottomRef.current = true;
            }
          }, 350);
        }
      } else if (e.deltaY < 0) {
        // Scrolling back up cancels settled state
        isSettledAtBottomRef.current = false;
        if (settleTimeoutRef.current) {
          clearTimeout(settleTimeoutRef.current);
          settleTimeoutRef.current = null;
        }
      }
    };

    // 3. Touch event for mobile (overscroll pull gesture when at bottom)
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      // Only permit force-scroll if the touch gesture BEGAN while already at the footer!
      touchStartedAtBottomRef.current = checkIsAtBottom();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isRevealedRef.current) return;
      if (!touchStartedAtBottomRef.current) return;
      if (!checkIsAtBottom()) return;

      const touchCurrentY = e.touches[0].clientY;
      const deltaY = touchStartY - touchCurrentY; // Positive when pulling/swiping up past footer
      if (deltaY > 50) {
        revealEasterEgg();
      }
    };

    // 4. Keyboard ArrowDown / PageDown at the bottom
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isRevealedRef.current) return;
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
        if (checkIsAtBottom() && isSettledAtBottomRef.current) {
          revealEasterEgg();
        }
      }
    };

    const lenis = getLenisInstance();
    if (lenis) {
      lenis.on("scroll", handleScroll);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      if (settleTimeoutRef.current) {
        clearTimeout(settleTimeoutRef.current);
      }
      if (lenis) {
        lenis.off("scroll", handleScroll);
      }
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [revealEasterEgg]);

  return (
    <footer
      ref={footerRef}
      className="pt-12 pb-0 sm:px-0 px-4 bg-[#151414] text-white border-t border-black/10 relative overflow-hidden"
    >
      <div className="container mx-auto overflow-hidden px-4 md:px-8 pb-12">
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

      {/* 3. NestJS-style Easter Egg (reveals on force scroll past footer) */}
      <div
        ref={easterEggRef}
        className={`z-10 relative flex justify-center items-center w-full overflow-hidden transition-all duration-1000 ease-out ${
          isEasterEggRevealed
            ? "h-[220px] opacity-100 border-t border-white/[0.06]"
            : "h-0 opacity-0 border-none pointer-events-none"
        }`}
        aria-hidden={!isEasterEggRevealed}
      >
        <div className="py-12 pb-8 flex flex-col items-center justify-center select-none pointer-events-none">
          {EASTER_EGG_GIFS.map((gifSrc, idx) => (
            <img
              key={gifSrc}
              src={gifSrc}
              alt="Easter Egg"
              className={`w-24 h-24 object-contain filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)] ${
                idx === activeGifIndex ? "block" : "hidden"
              }`}
              loading="eager"
              onError={(e) => {
                const target = e.currentTarget;
                const fallbackUrl = `https://nestjs.com${gifSrc}`;
                if (target.src !== fallbackUrl) {
                  target.src = fallbackUrl;
                }
              }}
            />
          ))}
        </div>
      </div>
    </footer>
  );
}
