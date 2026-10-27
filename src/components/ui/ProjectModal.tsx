"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { X, ExternalLink, CheckCircle2 } from "lucide-react";
import { GithubIcon } from "@/components/ui/SocialIcons";
import { Project } from "@/types/portfolio";
import { getLenisInstance } from "@/lib/scroll";
import { isSafeUrl, sanitizeImageUrl } from "@/lib/security";

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (project) {
      document.body.style.overflow = "hidden";
      const lenis = getLenisInstance();
      if (lenis) {
        lenis.stop();
      }
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      const lenis = getLenisInstance();
      if (lenis) {
        lenis.start();
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  const safeGithubUrl = isSafeUrl(project.githubUrl) ? project.githubUrl : null;
  const safeLiveUrl = isSafeUrl(project.liveUrl) ? project.liveUrl : null;
  const safeImage = sanitizeImageUrl(project.image);

  return (
    <div
      data-lenis-prevent
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs overscroll-contain"
    >
      <div className="fixed inset-0" onClick={onClose} />

      <div
        data-lenis-prevent
        className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-y-auto overscroll-contain border border-black/10 z-10 flex flex-col"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm px-6 py-4 border-b border-black/10 flex justify-between items-center z-20">
          <div>
            <span className="text-xs uppercase tracking-wider text-black/60 font-medium">
              {project.category}
            </span>
            <h3 className="text-xl font-medium text-black">
              {project.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 text-black/70 hover:text-black transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-neutral-900 border border-neutral-200">
            <Image
              src={safeImage}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, 672px"
              className="object-contain"
              unoptimized={safeImage.endsWith(".svg")}
            />
          </div>

          <div className="space-y-2">
            <h4 className="text-base font-medium text-black">{project.tagline}</h4>
            <p className="text-black/70 text-sm leading-relaxed">{project.description}</p>
          </div>

          {/* Key Features */}
          <div className="space-y-2 pt-1">
            <h5 className="text-xs uppercase tracking-wider font-semibold text-black/80">
              Key Architecture &amp; Features
            </h5>
            <div className="space-y-2">
              {project.features.map((feat, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 text-xs text-black/80 font-normal"
                >
                  <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-black/10">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-mono px-2.5 py-1 border border-neutral-200 rounded-full text-neutral-700 font-medium bg-neutral-50 tracking-tight"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-black/10">
            {safeGithubUrl && (
              <a
                href={safeGithubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-xs font-medium hover:bg-black/80 transition-colors active:scale-95 cursor-pointer"
              >
                <GithubIcon className="w-4 h-4" />
                <span>Repository</span>
              </a>
            )}
            {safeLiveUrl && (
              <a
                href={safeLiveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-black/20 text-black text-xs font-medium hover:bg-neutral-50 transition-colors active:scale-95 cursor-pointer"
              >
                <span>Preview</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
