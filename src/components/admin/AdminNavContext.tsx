"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface AdminNavContextType {
  isMobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
}

const AdminNavContext = createContext<AdminNavContextType | undefined>(undefined);

export function AdminNavProvider({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (!isMobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = originalOverflow;
    };
  }, [isMobileOpen]);

  return (
    <AdminNavContext.Provider
      value={{
        isMobileOpen,
        openMobile: () => setIsMobileOpen(true),
        closeMobile: () => setIsMobileOpen(false),
      }}
    >
      {children}
    </AdminNavContext.Provider>
  );
}

export function useAdminNav() {
  const context = useContext(AdminNavContext);
  if (!context) {
    throw new Error("useAdminNav must be used within an AdminNavProvider");
  }
  return context;
}
