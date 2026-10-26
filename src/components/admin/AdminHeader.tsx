"use client";

import React, { useTransition } from "react";
import { LogOut, Loader2, User, Database } from "lucide-react";
import { logoutAction } from "@/actions/admin/auth";

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function AdminHeader({
  title = "Panel Kontrol",
  subtitle = "Kelola database dan konten portofolio Anda secara real-time",
}: AdminHeaderProps) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    if (confirm("Apakah Anda yakin ingin keluar dari Admin Panel?")) {
      startTransition(async () => {
        await logoutAction();
      });
    }
  };

  return (
    <header className="h-16 bg-white border-b border-neutral-200 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div>
        <h1 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight flex items-center gap-2">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-neutral-500 hidden sm:block font-normal">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* PostgreSQL Active Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-800 text-[11px] font-semibold border border-neutral-200">
          <Database className="w-3 h-3 text-black" />
          <span>PostgreSQL Active</span>
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-800 text-xs font-semibold border border-neutral-200">
          <User className="w-3.5 h-3.5 text-neutral-600" />
          <span>admin@falah.dev</span>
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
          <span>Keluar</span>
        </button>
      </div>
    </header>
  );
}
