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
      email: "",
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
    <div className="min-h-screen bg-neutral-100 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative select-none overflow-hidden">
      {/* Decorative Monochrome Silhouette Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-neutral-200/50 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative Vector Silhouette grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Top back button */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-black bg-white px-3.5 py-2 rounded-xl border border-neutral-200 shadow-xs transition"
        >
          <ArrowLeft className="w-4 h-4 text-black" />
          <span>Kembali ke Portofolio</span>
        </Link>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Card Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-black text-white font-black text-2xl tracking-tighter shadow-md mb-4 border border-black">
            F
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">
            FALAH CMS
          </h1>
          <p className="text-xs text-neutral-500 mt-1 uppercase tracking-widest font-semibold flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-black" />
            <span>Monochrome Control Center</span>
          </p>
        </div>

        {/* Login Form Box */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          {/* Subtle silhouette corner accent */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-neutral-100 rounded-full pointer-events-none" />

          {errorMessage && (
            <div className="mb-6 p-3.5 bg-neutral-900 text-white rounded-xl text-xs flex items-center gap-2.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 relative z-10">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                Email Administrator
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  {...register("email")}
                  placeholder="admin@email.com"
                  autoComplete="username"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600 mt-1.5 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  {...register("password")}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 mt-1.5 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-black hover:bg-neutral-800 text-white font-bold py-3 px-4 rounded-xl text-sm transition shadow-sm active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  <span>Masuk ke Admin Panel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-neutral-500 mt-6 font-medium">
          &copy; 2026 FALAH · Protected Admin Panel
        </p>
      </div>
    </div>
  );
}
