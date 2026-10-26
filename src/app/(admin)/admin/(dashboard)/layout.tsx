import React, { Suspense } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-neutral-100 font-sans">
      {/* Fixed/Sticky Admin Sidebar wrapped in Suspense for usePathname client hook */}
      <Suspense
        fallback={
          <aside className="w-64 bg-neutral-950 text-neutral-200 border-r border-neutral-800 h-screen sticky top-0" />
        }
      >
        <AdminSidebar />
      </Suspense>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Suspense
          fallback={
            <header className="h-16 bg-white border-b border-neutral-200" />
          }
        >
          <AdminHeader />
        </Suspense>
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
