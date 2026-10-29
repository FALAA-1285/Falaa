"use client";

import React, { useState, useEffect, useRef, useCallback, useSyncExternalStore } from "react";
import { getLenisInstance } from "@/lib/scroll";

interface LoadingScreenProps {
  sessionOnly?: boolean;
  onComplete?: () => void;
}

// Curated high-diversity world greetings from user prompt, timed evenly (~200ms each)
// with Indonesian ("Halo") decisively concluding at 100%
const GREETINGS = [
  "Hello", // English
  "Bonjour", // French
  "Hola", // Spanish
  "Ciao", // Italian
  "Hallo", // German
  "Olá", // Portuguese
  "Привет", // Russian
  "Γεια σου", // Greek
  "שלום", // Hebrew (RTL)
  "مرحباً", // Arabic (RTL)
  "नमस्ते", // Hindi
  "สวัสดี", // Thai
  "Xin chào", // Vietnamese
  "你好", // Chinese
  "こんにちは", // Japanese
  "안녕하세요", // Korean
  "Habari", // Swahili
  "Sawubona", // Zulu
  "Aloha", // Hawaiian
  "Salam", // Persian / Malay
  "Halo", // Bahasa Indonesia di paling akhir (100%)
];

const emptySubscribe = () => () => {};

export default function LoadingScreen({
  sessionOnly = false,
  onComplete,
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Synchronously detect if session has already loaded
  const isAlreadyLoaded = useSyncExternalStore(
    emptySubscribe,
    () => {
      if (!sessionOnly) return false;
      try {
        return Boolean(sessionStorage.getItem("portfolio_has_loaded"));
      } catch {
        return false;
      }
    },
    () => false
  );

  // Lock body scroll and pause Lenis smooth scroll during preloader
  useEffect(() => {
    if (isFinished || isAlreadyLoaded) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const lenis = getLenisInstance();
    if (lenis) {
      lenis.stop();
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      const activeLenis = getLenisInstance();
      if (activeLenis) {
        activeLenis.start();
      }
    };
  }, [isFinished, isAlreadyLoaded]);

  const handleExitComplete = useCallback(() => {
    setIsFinished(true);
    if (sessionOnly && typeof window !== "undefined") {
      try {
        sessionStorage.setItem("portfolio_has_loaded", "true");
      } catch {
        // Safe fallback if storage unavailable
      }
    }
    const lenis = getLenisInstance();
    if (lenis) {
      lenis.start();
    }
    document.body.style.overflow = "";
    if (onCompleteRef.current) {
      onCompleteRef.current();
    }
  }, [sessionOnly]);

  const handleSkip = useCallback(() => {
    if (isExiting || isFinished || isAlreadyLoaded) return;
    setProgress(100);
    setGreetingIndex(GREETINGS.length - 1);
    setIsExiting(true);
    setTimeout(handleExitComplete, 700);
  }, [isExiting, isFinished, isAlreadyLoaded, handleExitComplete]);

  // Quick skip on click or key press
  useEffect(() => {
    if (isFinished || isAlreadyLoaded || isExiting) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter" || e.key === "Escape") {
        e.preventDefault();
        handleSkip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFinished, isAlreadyLoaded, isExiting, handleSkip]);

  // Well-paced progress animation (~4.2s) giving each script comfortable viewing time (~200ms)
  useEffect(() => {
    if (isFinished || isAlreadyLoaded) return;

    const DURATION = 4200; // 4.2 seconds total

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const rawProgress = Math.min(elapsed / DURATION, 1);

      // Smooth custom ease-out curve for numeric counter
      const easeProgress = Math.round(
        (1 - Math.pow(1 - rawProgress, 2.2)) * 100
      );

      setProgress(easeProgress);

      // Steady, rhythmic cadence for greetings so every script is comfortably readable (~200ms)
      const nextIndex = Math.min(
        Math.floor(rawProgress * GREETINGS.length),
        GREETINGS.length - 1
      );
      setGreetingIndex(nextIndex);

      if (rawProgress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setProgress(100);
        setGreetingIndex(GREETINGS.length - 1);
        setTimeout(() => {
          setIsExiting(true);
          setTimeout(handleExitComplete, 750);
        }, 400); // Savor "Halo" (Indonesian) at 100%
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isFinished, isAlreadyLoaded, handleExitComplete]);

  if (isFinished || isAlreadyLoaded) return null;

  const currentGreeting = GREETINGS[greetingIndex];
  const isRtl = /[\u0600-\u06FF\u0590-\u05FF]/.test(currentGreeting);
  const isComplexScript = /[^\u0000-\u024F\u1E00-\u1EFF]/.test(currentGreeting);

  return (
    <aside
      role="status"
      aria-label="Loading"
      onClick={handleSkip}
      className={`fixed inset-0 z-[99999] flex flex-col justify-between bg-[#0e0e10] text-white cursor-pointer select-none transition-transform duration-[750ms] ${
        isExiting
          ? "-translate-y-full ease-[cubic-bezier(0.76,0,0.24,1)]"
          : "translate-y-0"
      }`}
      style={{ willChange: "transform" }}
    >
      {/* Top Bar: Editorial Minimalist Metadata */}
      <div
        className={`flex items-center justify-between p-6 sm:p-10 text-xs uppercase tracking-[0.25em] text-neutral-400 font-mono transition-opacity duration-300 ${
          isExiting ? "opacity-0" : "opacity-100"
        }`}
      >
        <span>FALAH</span>
        <span>© 2026</span>
      </div>

      {/* Center Stage: Light, Elegant Multilingual Greetings */}
      <div
        className={`flex flex-col items-center justify-center px-6 transition-all duration-300 ${
          isExiting ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        {/* Fixed height container to prevent layout jump as words switch */}
        <div className="h-24 sm:h-32 flex items-center justify-center mb-6 overflow-hidden">
          <h1
            key={currentGreeting}
            dir={isRtl ? "rtl" : "ltr"}
            className={`text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-white text-center transition-all duration-150 transform animate-in fade-in ${
              isRtl ? "font-sans" : ""
            } ${isComplexScript ? "tracking-normal" : "tracking-wide"}`}
          >
            {currentGreeting}
          </h1>
        </div>

        {/* Minimal 1px hairline progress track */}
        <div className="w-48 sm:w-64 h-[1px] bg-neutral-800 overflow-hidden relative">
          <div
            className="h-full bg-white transition-all duration-75 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Bottom Bar: Location & Clean Corner Counter */}
      <div
        className={`flex items-end justify-between p-6 sm:p-10 transition-opacity duration-300 ${
          isExiting ? "opacity-0" : "opacity-100"
        }`}
      >
        <span className="text-xs uppercase tracking-[0.25em] text-neutral-400 font-mono">
          MALANG, ID
        </span>

        <span className="font-mono text-3xl sm:text-5xl font-light tracking-tighter text-white tabular-nums">
          {progress}%
        </span>
      </div>
    </aside>
  );
}
