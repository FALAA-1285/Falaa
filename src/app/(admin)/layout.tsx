import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import "./admin.css";

const adminFont = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-admin",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Admin FALAH",
  description: "Panel pengelolaan konten portofolio",
  robots: "noindex, nofollow",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={`adm ${adminFont.variable}`}>{children}</div>;
}
