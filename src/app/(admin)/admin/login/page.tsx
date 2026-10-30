"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "@/lib/schemas/auth";
import { loginAction } from "@/actions/admin/auth";
import Field from "@/components/admin/Field";

/** Only allow redirects back into the admin area (prevents open redirects). */
function safeCallback(raw: string | null): string {
  if (raw && raw.startsWith("/admin") && !raw.startsWith("//") && !raw.includes(":")) {
    return raw;
  }
  return "/admin";
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMessage(null);
    try {
      const res = await loginAction(data);
      if (res.success) {
        router.push(safeCallback(new URLSearchParams(window.location.search).get("callbackUrl")));
        router.refresh();
      } else {
        setErrorMessage(res.error || "Email atau password salah.");
      }
    } catch {
      setErrorMessage("Server tidak bisa dihubungi. Coba lagi sebentar lagi.");
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[360px]">
        <h1 className="adm-h1">Masuk ke panel admin</h1>
        <p className="adm-lede mb-6">Kelola isi portofolio Falah.</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="adm-panel p-5 space-y-4">
          {errorMessage && (
            <div role="alert" className="adm-notice adm-notice-error">
              {errorMessage}
            </div>
          )}

          <Field label="Email" htmlFor="email" error={errors.email?.message}>
            <input
              id="email"
              type="email"
              autoComplete="username"
              className="adm-input"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
          </Field>

          <Field label="Password" htmlFor="password" error={errors.password?.message}>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="adm-input"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
          </Field>

          <button type="submit" disabled={isSubmitting} className="adm-btn adm-btn-primary w-full h-9">
            {isSubmitting ? "Memeriksa…" : "Masuk"}
          </button>
        </form>

        <Link href="/" className="adm-faint inline-block mt-4 hover:underline">
          Kembali ke situs
        </Link>
      </div>
    </main>
  );
}
