"use client";

import React, { useTransition } from "react";
import { LogOut, Loader2, User } from "lucide-react";
import { logoutAction } from "@/actions/admin/auth";

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function AdminHeader({
  title = "Panel Kontrol",
  subtitle = "Kelola data portofolio dan konten internal",
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
    <header className="h-16 bg-white border-b border-neutral-200 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h1 className="text-base sm:text-lg font-semibold text-neutral-900 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-neutral-500 hidden sm:block">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-neutral-100 text-neutral-700 text-xs font-medium border border-neutral-200">
          <User className="w-3.5 h-3.5 text-neutral-500" />
          <span>admin@falah.dev</span>
        </div>

        <button
          onClick={handleLogout}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50 cursor-pointer"
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
