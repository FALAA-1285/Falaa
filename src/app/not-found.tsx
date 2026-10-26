import React from "react";
import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="max-w-md w-full bg-neutral-50 border border-black/10 rounded-3xl p-8 sm:p-10 shadow-sm flex flex-col items-center relative overflow-hidden">
        {/* Subtle Watermark */}
        <span className="absolute -bottom-8 -right-6 text-9xl font-black text-black/[0.03] pointer-events-none select-none">
          404
        </span>

        <div className="w-14 h-14 rounded-full bg-neutral-100 border border-black/10 flex items-center justify-center text-black mb-6">
          <Compass className="w-7 h-7" />
        </div>

        <span className="text-xs font-semibold tracking-wider uppercase text-neutral-400 mb-2">
          Halaman Tidak Ditemukan
        </span>

        <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tight mb-3">
          404
        </h1>

        <p className="text-sm text-neutral-600 mb-8 leading-relaxed">
          Halaman yang Anda tuju tidak tersedia, telah dipindahkan, atau tautan yang Anda ikuti sudah kedaluwarsa.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-black hover:bg-neutral-800 text-white text-xs font-semibold tracking-wide transition active:scale-95 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    </main>
  );
}
