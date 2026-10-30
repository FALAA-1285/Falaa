"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { logoutAction } from "@/actions/admin/auth";
import { useAdminNav } from "./AdminNavContext";

const NAV_ITEMS = [
  { label: "Ringkasan", href: "/admin", exact: true },
  { label: "Pesan", href: "/admin/messages", showsUnread: true },
  { label: "Project", href: "/admin/projects" },
  { label: "Pengalaman", href: "/admin/experiences" },
  { label: "Skill", href: "/admin/skills" },
  { label: "Profil", href: "/admin/profile" },
];

interface AdminSidebarProps {
  /** Server-rendered unread message count, streamed in separately. */
  unreadSlot?: React.ReactNode;
}

function NavBody({ unreadSlot, onNavigate }: AdminSidebarProps & { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [isLoggingOut, startLogout] = useTransition();

  return (
    <div className="flex flex-col h-full">
      <Link
        href="/admin"
        onClick={onNavigate}
        className="block px-5 pt-6 pb-5 text-[15px] font-semibold tracking-tight"
      >
        Falah
        <span className="block text-xs font-normal" style={{ color: "var(--muted)" }}>
          Pengelola portofolio
        </span>
      </Link>

      <nav className="flex-1 px-3" aria-label="Navigasi admin">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={isActive ? "page" : undefined}
                  className="adm-nav-link"
                >
                  <span>{item.label}</span>
                  {item.showsUnread && unreadSlot}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-3 pb-5 pt-4 space-y-0.5" style={{ borderTop: "1px solid var(--line)" }}>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="adm-nav-link"
        >
          Buka situs publik
        </a>
        <button
          type="button"
          disabled={isLoggingOut}
          onClick={() => startLogout(() => logoutAction())}
          className="adm-nav-link disabled:opacity-50"
        >
          {isLoggingOut ? "Keluar…" : "Keluar"}
        </button>
      </div>
    </div>
  );
}

export default function AdminSidebar({ unreadSlot }: AdminSidebarProps) {
  const { isMobileOpen, openMobile, closeMobile } = useAdminNav();

  return (
    <>
      <aside
        className="hidden lg:block w-56 shrink-0 h-screen sticky top-0"
        style={{ background: "var(--surface)", borderRight: "1px solid var(--line)" }}
      >
        <NavBody unreadSlot={unreadSlot} />
      </aside>

      {/* Mobile top bar */}
      <div
        className="lg:hidden sticky top-0 z-30 flex items-center justify-between h-12 px-4"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--line)" }}
      >
        <span className="text-[15px] font-semibold">Falah</span>
        <button type="button" onClick={openMobile} className="adm-icon-btn" aria-label="Buka menu">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Menu admin">
          <div className="absolute inset-0" style={{ background: "rgba(24,34,46,.45)" }} onClick={closeMobile} />
          <aside
            className="absolute inset-y-0 left-0 w-64 max-w-[85vw]"
            style={{ background: "var(--surface)" }}
          >
            <button
              type="button"
              onClick={closeMobile}
              className="adm-icon-btn absolute top-5 right-3"
              aria-label="Tutup menu"
            >
              <X className="w-4 h-4" />
            </button>
            <NavBody unreadSlot={unreadSlot} onNavigate={closeMobile} />
          </aside>
        </div>
      )}
    </>
  );
}
