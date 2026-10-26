"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  ExternalLink,
  ShieldCheck,
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
    label: "Projects (CRUD)",
    href: "/admin/projects",
    icon: FolderKanban,
    exact: false,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-neutral-950 text-neutral-200 border-r border-neutral-800 flex flex-col h-screen sticky top-0 z-40 select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-neutral-800">
        <Link href="/admin" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded bg-white text-black font-bold flex items-center justify-center text-sm tracking-wider">
            F
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white tracking-tight text-sm">
              FALAH CMS
            </span>
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest">
              Internal Admin
            </span>
          </div>
        </Link>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded-full">
          <ShieldCheck className="w-3 h-3" />
          ADMIN
        </span>
      </div>

      {/* Quick Action Button */}
      <div className="p-4">
        <Link
          href="/admin/projects/new"
          className="w-full flex items-center justify-center gap-2 bg-white text-black font-medium px-3 py-2 rounded-md hover:bg-neutral-200 transition-colors text-sm shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Project</span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-neutral-300 uppercase">
          Menu Utama
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                isActive
                  ? "bg-neutral-800 text-white shadow-sm"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive ? "text-white" : "text-neutral-500"
                }`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div className="pt-6 px-3 pb-2 text-[11px] font-semibold tracking-wider text-neutral-300 uppercase">
          Tautan Eksternal
        </div>
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all"
        >
          <div className="flex items-center gap-3">
            <ExternalLink className="w-4 h-4 text-neutral-500" />
            <span>Lihat Website Publik</span>
          </div>
          <span className="text-[10px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded">
            Live
          </span>
        </Link>
      </nav>

      {/* Admin User Footer */}
      <div className="p-4 border-t border-neutral-800 bg-neutral-950/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-semibold text-neutral-300 border border-neutral-700">
            AD
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium text-white truncate">
              Administrator
            </span>
            <span className="text-[11px] text-neutral-400 truncate">
              Role: ADMIN
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
