import type { Metadata, Viewport } from "next";
import { Outfit, Plus_Jakarta_Sans, Fira_Code } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://github.com/FALAA-1285"),
  title: "FALAH · Portfolio",
  description:
    "Portfolio of FALAH, IT Undergraduate at Politeknik Negeri Malang & Web Developer. Building clean, responsive, and user-friendly web experiences.",
  keywords: [
    "FALAH",
    "Ahmad Falahi",
    "FALAA-1285",
    "Web Developer",
    "Fullstack Developer",
    "Politeknik Negeri Malang",
    "Polinema",
    "Laravel",
    "Next.js",
    "React",
    "Tailwind CSS",
  ],
  authors: [{ name: "FALAH" }],
  openGraph: {
    title: "FALAH · Portfolio",
    description:
      "Web Developer & IT Student at Politeknik Negeri Malang. Crafting clean, responsive, and impactful digital experiences.",
    url: "https://github.com/FALAA-1285",
    siteName: "FALAH Portfolio",
    images: [
      {
        url: "/foto.jpg",
        width: 800,
        height: 800,
        alt: "FALAH",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${plusJakartaSans.variable} ${firaCode.variable}`}
    >
      <body className="min-h-screen bg-white text-neutral-900 antialiased selection:bg-black selection:text-white font-sans">
        {children}
      </body>
    </html>
  );
}
