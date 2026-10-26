"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { name: "About", href: "#about" },
  { name: "Projects", href: "#projects" },
  { name: "Experience", href: "#experience" },
  { name: "Skills", href: "#skills" },
  { name: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/90 backdrop-blur-md py-4" : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-12 flex justify-between items-center">
        {/* Brand */}
        <Link
          href="/"
          className="text-2xl font-medium tracking-tight text-black hover:text-black/70 transition-colors"
        >
          FALAH · Portfolio
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8 text-xl lg:text-2xl">
          {NAV_LINKS.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-black hover:text-black/70 transition-colors"
            >
              {item.name}
            </a>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-black p-2"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg border-b border-black/10 px-6 py-6 shadow-lg">
          <div className="flex flex-col space-y-4 text-xl">
            {NAV_LINKS.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-black hover:text-black/70 py-2 border-b border-black/5"
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
