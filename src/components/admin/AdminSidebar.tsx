"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Briefcase,
  Layers,
  UserCheck,
  Mail,
  ExternalLink,
  PlusCircle,
  X,
} from "lucide-react";
import { useAdminNav } from "./AdminNavContext";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Projects",
    href: "/admin/projects",
    icon: FolderKanban,
    exact: false,
  },
  {
    label: "Experiences",
    href: "/admin/experiences",
    icon: Briefcase,
    exact: false,
  },
  {
    label: "Skills",
    href: "/admin/skills",
    icon: Layers,
    exact: false,
  },
  {
    label: "Profile & Bio",
    href: "/admin/profile",
    icon: UserCheck,
    exact: false,
  },
  {
    label: "Messages Inbox",
    href: "/admin/messages",
    icon: Mail,
    exact: false,
  },
];

interface SidebarContentProps {
  onClose?: () => void;
  isMobile?: boolean;
}

function SidebarContent({ onClose, isMobile = false }: SidebarContentProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-neutral-200 bg-white shrink-0">
        <Link
          href="/admin"
          onClick={onClose}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-8 h-8 rounded-lg bg-black text-white font-black flex items-center justify-center text-sm tracking-wider shadow-sm transition-transform group-hover:scale-105">
            F
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-black tracking-tight text-sm">
              FALAH CMS
            </span>
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">
              Monochrome Admin
            </span>
          </div>
        </Link>

        {isMobile && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-500 hover:text-black hover:bg-neutral-100 transition focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
            aria-label="Tutup navigasi admin"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Quick Action Button */}
      <div className="p-4 bg-white/50 border-b border-neutral-200/60 shrink-0">
        <Link
          href="/admin/projects/new"
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 bg-black text-white font-medium px-3.5 py-2.5 rounded-xl hover:bg-neutral-800 transition-all text-xs tracking-wide shadow-sm active:scale-[0.99]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Tambah Project Baru</span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
          Menu Manajemen
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-black text-white shadow-sm"
                  : "text-neutral-600 hover:text-black hover:bg-neutral-200/70"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? "text-white" : "text-neutral-700"
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </Link>
          );
        })}

        <div className="pt-6 px-3 pb-2 text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
          Tautan Publik
        </div>
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-neutral-600 hover:text-black hover:bg-neutral-200/70 transition-all"
        >
          <div className="flex items-center gap-3">
            <ExternalLink className="w-4 h-4 text-neutral-600" />
            <span>Lihat Website Publik</span>
          </div>
          <span className="text-[10px] bg-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded font-mono">
            Live
          </span>
        </Link>
      </nav>

      {/* User Info Footer */}
      <div className="p-4 border-t border-neutral-200 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold shadow-xs shrink-0">
            AD
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-neutral-900 truncate">
              Administrator
            </span>
            <span className="text-[10px] text-neutral-500 truncate">
              Role: SUPERADMIN
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminSidebar() {
  const { isMobileOpen, closeMobile } = useAdminNav();

  return (
    <>
      {/* Desktop Sticky Sidebar (Visible only on lg and above) */}
      <aside className="hidden lg:flex w-64 bg-neutral-50 border-r border-neutral-200 text-neutral-900 flex-col h-screen sticky top-0 z-40 select-none shadow-xs shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile & Tablet Slide-over Drawer (Visible on screens < lg when opened) */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu Navigasi Admin"
        >
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={closeMobile}
            aria-hidden="true"
          />

          {/* Off-canvas Drawer Panel */}
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-neutral-50 border-r border-neutral-200 z-50 flex flex-col shadow-2xl">
            <SidebarContent onClose={closeMobile} isMobile />
          </aside>
        </div>
      )}
    </>
  );
}
