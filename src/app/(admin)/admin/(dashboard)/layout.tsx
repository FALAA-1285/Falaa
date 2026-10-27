import React, { Suspense } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { AdminNavProvider } from "@/components/admin/AdminNavContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminNavProvider>
      <div className="flex min-h-screen bg-neutral-100 font-sans">
        {/* Responsive Admin Sidebar (Desktop sticky sidebar + Mobile slide-over drawer) */}
        <Suspense
          fallback={
            <aside className="hidden lg:flex w-64 bg-neutral-50 text-neutral-900 border-r border-neutral-200 h-screen sticky top-0 shrink-0" />
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
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0">
            {children}
          </main>
        </div>
      </div>
    </AdminNavProvider>
  );
}
