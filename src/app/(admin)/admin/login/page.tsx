"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail, Loader2, ArrowRight, ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { loginSchema, LoginFormData } from "@/lib/schemas/auth";
import { loginAction } from "@/actions/admin/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@falah.dev",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMessage(null);
    try {
      const res = await loginAction(data);
      if (res.success) {
        router.push("/admin");
        router.refresh();
      } else {
        setErrorMessage(res.error || "Gagal masuk. Periksa kembali email dan password.");
      }
    } catch {
      setErrorMessage("Terjadi kesalahan tak terduga saat menghubungi server.");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative select-none">
      {/* Background glow effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-neutral-800/30 rounded-full blur-3xl pointer-events-none" />

      {/* Top back button */}
      <div className="absolute top-6 left-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-neutral-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Portofolio</span>
        </Link>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Card Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white text-black font-black text-2xl tracking-tighter shadow-lg mb-4">
            F
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            FALAH CMS
          </h1>
          <p className="text-xs text-neutral-400 mt-1 uppercase tracking-widest flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Admin Authentication</span>
          </p>
        </div>

        {/* Login Form Box */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          {errorMessage && (
            <div className="mb-6 p-3 bg-red-950/60 border border-red-800/80 rounded-md text-red-300 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Email Administrator
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  {...register("email")}
                  placeholder="admin@falah.dev"
                  className="w-full pl-9 pr-3 py-2.5 bg-neutral-950 border border-neutral-800 text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400 mt-1.5">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  {...register("password")}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-neutral-950 border border-neutral-800 text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 mt-1.5">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-white hover:bg-neutral-200 text-black font-semibold py-2.5 px-4 rounded-md text-sm transition shadow-md disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin text-black" />
              ) : (
                <>
                  <span>Masuk ke Admin Panel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Reminder */}
          <div className="mt-6 pt-5 border-t border-neutral-800 text-[11px] text-neutral-500 space-y-1">
            <p className="text-neutral-400 font-medium">Akun Demo Standar:</p>
            <div className="flex justify-between font-mono text-neutral-400 bg-neutral-950/80 px-2.5 py-1.5 rounded border border-neutral-800/80">
              <span>Email: admin@falah.dev</span>
              <span>Pass: admin123</span>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-neutral-400 mt-6">
          &copy; 2026 FALAH · Protected Internal Route
        </p>
      </div>
    </div>
  );
}
