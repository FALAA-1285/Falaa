import React, { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/features/Hero";
import About from "@/components/features/About";
import MarqueeBanner from "@/components/ui/MarqueeBanner";
import Projects from "@/components/features/Projects";
import Experience from "@/components/features/Experience";
import Skills from "@/components/features/Skills";
import Contact from "@/components/features/Contact";
import Footer from "@/components/layout/Footer";
import SmoothScrollProvider from "@/components/layout/SmoothScrollProvider";
import LoadingScreen from "@/components/ui/LoadingScreen";
import {
  getCachedProjects,
  getCachedExperiences,
  getCachedSkillsGrouped,
  getCachedProfileInfo,
} from "@/lib/cached-data";

async function PortfolioDynamicContent() {
  const [projects, experiences, skillGroups, profile] = await Promise.all([
    getCachedProjects(),
    getCachedExperiences(),
    getCachedSkillsGrouped(),
    getCachedProfileInfo(),
  ]);

  return (
    <>
      <Navbar profile={profile} />

      <div id="hero">
        <Hero profile={profile} />
      </div>

      <About profile={profile} />

      <MarqueeBanner text="My Works" />

      <Projects initialProjects={projects} />

      <MarqueeBanner text="Experience" isExperience />

      <Experience initialExperiences={experiences} />

      <Skills initialSkillGroups={skillGroups} />

      <Contact profile={profile} />

      <Footer profile={profile} />
    </>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Cinematic preloader & loading screen for first-time / page visitors */}
      <LoadingScreen />

      <SmoothScrollProvider>
        <Suspense fallback={null}>
          <PortfolioDynamicContent />
        </Suspense>
      </SmoothScrollProvider>
    </main>
  );
}
