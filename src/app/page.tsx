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

      {/* 2. Hero Section (Portrait Card) */}
      <div id="hero">
        <Hero />
      </div>

      {/* 3. About Section */}
      <About />

      {/* 4. Sticky / Marquee Transition: My Works */}
      <MarqueeBanner text="My Works" />

      {/* 5. Projects Section */}
      <Projects />

      {/* 6. Sticky / Marquee Transition: Experience */}
      <MarqueeBanner text="Experience" />

      {/* 7. Experience Section */}
      <Experience />

      {/* 8. Skills Section (Watermark + Categorized Monochrome Icon Grid) */}
      <Skills />

      {/* 9. Contact Section */}
      <Contact />

      {/* 10. Footer */}
      <Footer />
    </main>
  );
}
