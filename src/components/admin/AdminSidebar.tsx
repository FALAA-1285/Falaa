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
} from "lucide-react";

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

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-neutral-50 border-r border-neutral-200 text-neutral-900 flex flex-col h-screen sticky top-0 z-40 select-none shadow-xs">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-neutral-200 bg-white">
        <Link href="/admin" className="flex items-center gap-2.5 group">
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
        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-black text-white px-2 py-0.5 rounded-full tracking-wide">
          PRO
        </span>
      </div>

      {/* Quick Action Button */}
      <div className="p-4 bg-white/50 border-b border-neutral-200/60">
        <Link
          href="/admin/projects/new"
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
      <div className="p-4 border-t border-neutral-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold shadow-xs">
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
    </aside>
  );
}
