import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/features/Hero";
import About from "@/components/features/About";
import MarqueeBanner from "@/components/ui/MarqueeBanner";
import Projects from "@/components/features/Projects";
import Experience from "@/components/features/Experience";
import Skills from "@/components/features/Skills";
import Contact from "@/components/features/Contact";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* 1. Header Navigation */}
      <Navbar />

      {/* 2. Hero Section (Portrait Card with Scroll-Shrink & 3D Layered Marquee) */}
      <div id="hero">
        <Hero />
      </div>

      {/* 3. About Section */}
      <About />

      {/* 4. Sticky Scroll-Scaling Transition: My Works (Center zooms 1.0 -> 1.5) */}
      <MarqueeBanner text="My Works" />

      {/* 5. Projects Section */}
      <Projects />

      {/* 6. Sticky Scroll-Scaling Transition: Experience (Center zooms 1.0 -> 1.5) */}
      <MarqueeBanner text="Experience" isExperience />

      {/* 7. Experience Section (Dynamic Timeline Fill & Item Reveal) */}
      <Experience />

      {/* 8. Skills Section (Floating Parallax Watermark + Monochrome to Brand Colors) */}
      <Skills />

      {/* 9. Contact Section */}
      <Contact />

      {/* 10. Footer */}
      <Footer />
    </main>
  );
}
