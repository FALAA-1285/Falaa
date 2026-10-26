"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to telemetry / console in production
    console.error("Unhandled runtime error captured by root ErrorBoundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="max-w-md w-full bg-neutral-50 border border-black/10 rounded-3xl p-8 sm:p-10 shadow-sm flex flex-col items-center">
        <div className="w-14 h-14 rounded-full bg-neutral-100 border border-black/10 flex items-center justify-center text-black mb-6">
          <AlertCircle className="w-7 h-7" />
        </div>

        <span className="text-xs font-semibold tracking-wider uppercase text-neutral-400 mb-2">
          Terjadi Kesalahan
        </span>

        <h1 className="text-2xl sm:text-3xl font-bold text-black mb-3">
          Sesuatu Tidak Berjalan Sesuai Rencana
        </h1>

        <p className="text-sm text-neutral-600 mb-8 leading-relaxed">
          Sistem mengalami kendala saat memuat data atau merender tampilan. Silakan coba lagi atau kembali ke beranda.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <button
            onClick={() => reset()}
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-black hover:bg-neutral-800 text-white text-xs font-semibold tracking-wide transition active:scale-95 cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Coba Lagi</span>
          </button>

          <Link
            href="/"
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-neutral-100 border border-black/10 text-black text-xs font-semibold tracking-wide transition active:scale-95"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Beranda</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
