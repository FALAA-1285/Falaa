# FALAH · Full-Stack Developer Portfolio & CMS

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19.3.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=for-the-badge&logo=postgresql)](https://supabase.com)
[![Tests Passing](https://img.shields.io/badge/Tests-130%20Passed-brightgreen?style=for-the-badge&logo=node.js)](tests/)

Website portofolio developer modern dengan identitas visual **monokrom minimalis** dan sistem manajemen konten (**Content Management System / CMS**) terintegrasi. Dibangun menggunakan arsitektur **Next.js 16 App Router**, **React 19 Server Actions**, **PostgreSQL (Supabase)**, dan **Tailwind CSS v4**.

---

## 🌟 Fitur Utama

- **Identitas Visual Monokrom Minimalis**: Desain elegan kontras tinggi (*high-contrast black & white*) dengan efek running text 3D marquee, watermark tipografi terpusat, dan reveal warna asli ikon teknologi saat kursor diarahkan (*CSS hover transition*).
- **Dasbor Admin & CMS Responsif**: Panel kontrol terproteksi penuh untuk mengelola karya project, riwayat karir/akademik, daftar technical skill, biodata profil, dan kotak masuk pertanyaan (*inquiries*). Dilengkapi slide-over drawer responsif untuk perangkat mobile dan tablet.
- **Mekanisme Reordering Interaktif**: Pengubahan urutan project, experience, dan skill secara langsung melalui tombol *Move Up* / *Move Down* / *Move Left* / *Move Right* dengan persistensi transaksional atomik di database PostgreSQL dan *instant public page revalidation*.
- **Keamanan Berlapis (Defense-in-Depth)**:
  - Proteksi penuh terhadap **Stored XSS** pada semua input URL via allowlist protokol dan sanitasi domain.
  - Enkripsi sesi admin berbasis **HTTP-only cookie** bertanda tangan digital HS256 (`jose`).
  - Proteksi brute-force login dan anti-spam form kontak dengan **Sliding Window Rate Limiter**.
  - **HTTP Security Headers** lengkap (CSP, HSTS, X-Frame-Options, X-Content-Type-Options nosniff).
- **Arsitektur Database & Migrasi Mandiri**: Runner migrasi SQL berversi (*versioned idempotent runner*) dengan secondary indexes untuk optimasi query pembacaan dan Row-Level Security (RLS) policies.
- **Penyimpanan Objek Persisten**: Abstraksi storage cerdas yang otomatis mengunggah media ke Supabase Object Storage bucket dengan fallback penyimpanan lokal saat development offline.
- **Performa Teroptimasi (Zero Render-Blocking)**:
  - Font Google (`Outfit`, `Plus Jakarta Sans`, `Fira Code`) di-host secara lokal via `next/font/google` dengan `display: "swap"` (Zero CLS).
  - Favicon vector SVG berukuran < 1 KB (mengeliminasi beban download foto uncompressed 2.77 MB).
  - Komponen `Skills` dirender murni di server (*React Server Component*) untuk meminimalkan client JavaScript bundle.
- **Automated Testing Suite (130 Tests)**: Pengujian otomatis menyeluruh untuk autentikasi, otorisasi RBAC, validasi schema Zod, sanitasi URL, operasi CRUD, dan integritas data cadangan.

---

## 📁 Struktur Direktori

```
falaa/
├── docs/                       # Dokumentasi arsitektur, migrasi, variabel, dan deployment
├── migrations/                 # Skrip migrasi SQL berversi (001 - 004)
├── public/                     # Aset statis (icon SVG, favicon, cover project, avatar)
├── scripts/                    # Skrip inisialisasi & migrasi database PostgreSQL
├── src/
│   ├── actions/                # React Server Actions (Admin CRUD & Public Contact)
│   ├── app/                    # Next.js App Router (Halaman publik & Panel Admin)
│   ├── components/             # Komponen UI modular (Admin, Features, Layout, UI)
│   ├── lib/                    # Core utilities (Auth, DB, Schemas, Security, Storage)
│   └── types/                  # Kontrak tipe data TypeScript
└── tests/                      # Suite pengujian otomatis (130 tests across 33 suites)
```

---

## 🚀 Panduan Memulai Cepat

### Prasyarat
- Node.js versi 20.x atau 22.x LTS (disarankan >= 20.10.0)
- npm, pnpm, atau yarn
- PostgreSQL (dapat menggunakan instance lokal Laragon atau akun cloud gratis di [Supabase](https://supabase.com))

### 1. Kloning Repositori & Instal Dependensi
```bash
git clone https://github.com/FALAA-1285/falaa.git
cd falaa
npm install
```

### 2. Konfigurasi Variabel Lingkungan
Salin berkas template `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
Buka `.env.local` dan sesuaikan nilainya:
```ini
ADMIN_EMAIL=admin@falah.dev
ADMIN_PASSWORD=PasswordAdminSangatKuat_2026!
ADMIN_JWT_SECRET=production_jwt_secret_must_be_at_least_32_characters_long_2026
DATABASE_URL=postgresql://postgres@localhost:5432/falaa
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
> Baca panduan lengkap variabel lingkungan di [`docs/ENVIRONMENT_VARIABLES.md`](docs/ENVIRONMENT_VARIABLES.md).

### 3. Eksekusi Migrasi Database
Jalankan skrip migrasi untuk membuat tabel, indexes, dan RLS policies di database:
```bash
npm run db:migrate
```

### 4. Jalankan Development Server
```bash
npm run dev
```
Buka browser pada:
- **Portofolio Publik**: [http://localhost:3000](http://localhost:3000)
- **Panel Admin CMS**: [http://localhost:3000/admin](http://localhost:3000/admin) (Login menggunakan email & password yang disetel di `.env.local`)

---

## 🧪 Pengujian & Verifikasi Kualitas

Proyek ini dilengkapi suite pengujian otomatis mandiri yang kompatibel dengan Next.js 16:

```bash
# Menjalankan seluruh test suite otomatis (130 tests)
npm test

# Menjalankan pemeriksaan type safety TypeScript
npx tsc --noEmit

# Menjalankan linter kode ESLint
npm run lint

# Menjalankan production build Next.js (Turbopack)
npm run build
```

---

## 📚 Dokumentasi Terperinci

Pelajari arsitektur dan operasional sistem secara mendalam pada folder `docs/`:

- [**Arsitektur & Desain Sistem**](docs/ARCHITECTURE.md)
- [**Panduan Migrasi Database & Schema**](docs/DATABASE_MIGRATION.md)
- [**Spesifikasi Variabel Lingkungan**](docs/ENVIRONMENT_VARIABLES.md)
- [**Panduan Deployment Produksi**](docs/DEPLOYMENT.md)

---

## 📄 Lisensi & Kontributor

- **Pengembang**: Muhammad Falah Nur Hidayat ([@FALAA-1285](https://github.com/FALAA-1285))
- **Institusi**: Teknologi Informasi, Politeknik Negeri Malang
- **Lisensi**: MIT License
