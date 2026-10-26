import type { Metadata, Viewport } from "next";
import "./globals.css";

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
        url: "/avatar.png",
        width: 800,
        height: 800,
        alt: "FALAH",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: "/avatar.png",
    apple: "/avatar.png",
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
    <html lang="en">
      <body className="min-h-screen bg-white text-neutral-900 antialiased selection:bg-black selection:text-white">
        {children}
      </body>
    </html>
  );
}
