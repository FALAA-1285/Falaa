"use client";

import React, { useTransition } from "react";
import { LogOut, Loader2, User, Menu } from "lucide-react";
import { logoutAction } from "@/actions/admin/auth";
import { useAdminNav } from "./AdminNavContext";

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function AdminHeader({
  title = "Panel Kontrol",
  subtitle = "Kelola konten portofolio Anda secara real-time",
}: AdminHeaderProps) {
  const [isPending, startTransition] = useTransition();
  const { openMobile } = useAdminNav();

  const handleLogout = () => {
    if (confirm("Apakah Anda yakin ingin keluar dari Admin Panel?")) {
      startTransition(async () => {
        await logoutAction();
      });
    }
  };

  return (
    <header className="h-16 bg-white border-b border-neutral-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Mobile Hamburger & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={openMobile}
          className="lg:hidden p-2 -ml-1 rounded-xl text-neutral-700 hover:text-black hover:bg-neutral-100 transition focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
          aria-label="Buka menu navigasi admin"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-sm sm:text-base lg:text-lg font-bold text-neutral-900 tracking-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-neutral-500 hidden sm:block font-normal truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: User Email badge & Logout button */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* User Badge (hidden on mobile, visible on sm and above) */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-800 text-xs font-semibold border border-neutral-200">
          <User className="w-3.5 h-3.5 text-neutral-600" />
          <span className="truncate max-w-[140px]">admin@falah.dev</span>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-black hover:text-white border border-neutral-300 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
          title="Keluar dari sesi admin"
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <LogOut className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
}
