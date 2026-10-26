import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin CMS · FALAH",
  description: "Internal Admin Management Panel",
  robots: "noindex, nofollow",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 font-sans antialiased">
      {children}
    </div>
  );
}
