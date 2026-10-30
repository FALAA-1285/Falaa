import React, { Suspense } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { AdminNavProvider } from "@/components/admin/AdminNavContext";
import { getAdminSession } from "@/lib/auth";
import { countUnreadMessages } from "@/lib/db";

async function UnreadCount() {
  if (!(await getAdminSession())) return null;
  const unread = await countUnreadMessages();
  return unread > 0 ? (
    <span className="adm-count" aria-label={`${unread} belum dibaca`}>
      {unread}
    </span>
  ) : null;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminNavProvider>
      <div className="lg:flex min-h-screen">
        <Suspense fallback={<aside className="hidden lg:block w-56 shrink-0" />}>
          <AdminSidebar
            unreadSlot={
              <Suspense fallback={null}>
                <UnreadCount />
              </Suspense>
            }
          />
        </Suspense>
        <main className="flex-1 min-w-0 px-4 py-6 sm:px-8 lg:px-10 lg:py-10">
          <div className="max-w-5xl">{children}</div>
        </main>
      </div>
    </AdminNavProvider>
  );
}
