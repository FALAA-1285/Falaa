"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Project } from "@/types/portfolio";
import { PROJECTS_DATA } from "@/data/portfolio";
import ProjectModal from "@/components/ui/ProjectModal";

export default function Projects() {
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  return (
    <section id="projects" className="bg-white min-h-[100vh] px-4 sm:px-8 scroll-mt-24 relative">
      <div className="container mx-auto">
        {/* Projects Grid matching reference: grid-cols-1 md:grid-cols-2 gap-8 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {PROJECTS_DATA.map((project) => (
            <div
              key={project.id}
              onClick={() => setActiveProject(project)}
              className="group relative cursor-pointer"
            >
              <div className="block">
                {/* Media Container with aspect-[4/3] */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 rounded-md">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Title & Arrow */}
                <div className="mt-4 flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-xl font-medium text-black">
                      {project.title}
                    </h3>
                    <p className="text-black/60 text-base">
                      {project.category}
                    </p>
                  </div>
                  <div>
                    <ArrowUpRight className="h-5 w-5 text-black transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>

                {/* Tech Pills */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-sm px-3 py-1 border border-black/10 rounded-full text-black/80 font-normal bg-white"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Case Study Modal */}
      <ProjectModal
        project={activeProject}
        onClose={() => setActiveProject(null)}
      />
    </section>
  );
}
