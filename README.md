# C-Bon by LamP - Track Hutang Piutang

Aplikasi web sederhana untuk mencatat dan melacak hutang piutang pribadi. Catat siapa yang hutang ke kamu, atau kamu hutang ke siapa. Tandai sebagai "lunas" setelah dibayar dan lihat ringkasan total.

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL) + Auth
- **Icons**: Lucide React
- **Utilities**: date-fns (untuk format tanggal relatif)

## 📦 Alasan Library Tambahan

Di luar stack wajib dari task, project ini memakai library berikut karena kebutuhan implementasi:

- **date-fns**: dipakai untuk format tanggal relatif Bahasa Indonesia seperti "kemarin" dan "3 hari lalu" dengan API yang ringan dan predictable.
- **@supabase/auth-helpers-nextjs**: membantu integrasi session/cookies Supabase dengan Next.js App Router, jadi proteksi route dan akses user di server/client lebih rapi dan minim boilerplate.

## 📋 Setup

### 1. Clone & Install Dependencies

```bash
cd utang-kontencom
npm install
```

### 2. Setup Supabase

1. Buat project baru di [Supabase Dashboard](https://app.supabase.com)
2. Ambil `Project URL` dan `Anon Key` dari Settings > API
3. Buat file `.env.local`:

Isi dengan:
```
NEXT_PUBLIC_SUPABASE_URL=<project_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
```

### 3. Database Setup

1. Buka Supabase Dashboard > SQL Editor
2. Copy-paste isi file [supabase/migrations/20260624000000_create_debts_table.sql](supabase/migrations/20260624000000_create_debts_table.sql)
3. Jalankan query (tabel + RLS policies akan dibuat otomatis)

**Atau** (alternatif): Gunakan Supabase CLI:
```bash
supabase link --project-ref <project-ref>
supabase db push
```

### 4. Enable Email Auth

1. Supabase Dashboard > Authentication > Providers
2. Pastikan "Email" sudah enabled
3. (Opsional) Setup SMTP untuk email konfirmasi, atau gunakan default Supabase

### 5. Jalankan Local

```bash
npm run dev
```

Buka http://localhost:3000

## 📱 Penggunaan

1. **Daftar/Login**: Masukkan email + password di halaman awal
2. **Catat Hutang**: Klik "+ Catat Baru"
   - Pilih tipe: "Saya dihutang" atau "Saya hutang"
   - Isi nama orang, jumlah hutang, tanggal hutang, tanggal jatuh tempo (opsional), catatan (opsional)
3. **Lihat Summary**: 3 card di atas menunjukkan total dihutang, total hutang, dan net
4. **Filter**: Gunakan dropdown untuk filter data
5. **Aksi Entry**:
   - **Tandai Lunas**: Ubah status menjadi lunas
   - **Edit**: Ubah data entry
   - **Hapus**: Hapus entry
6. **Logout**: Tombol di kanan atas

## 🚢 Demo App

**Demo live**: https://kasbon-demo.vercel.app

## 🎯 Technical Decisions (yang saya banggakan)

Dalam implementasi ini, saya menekankan tiga hal utama yang jadi kekuatan teknis sekaligus nilai tambah. Pertama, pendekatan type‑first API memastikan semua endpoint dan fungsi client ditulis dengan TypeScript yang ketat tanpa ada any, sehingga integritas data dan kejelasan kontrak selalu terjaga. Kedua, saya memanfaatkan kolom due_date dengan menghadirkan komponen visual jatuh tempo, meskipun tidak secara eksplisit disebut di dokumen soal, agar pengguna bisa melihat kapan utang/piutang seharusnya dibayar. Ketiga, saya menambahkan fitur name grouping yang digabung dengan pencarian, sehingga entri dari orang yang sama bisa ditampilkan lebih ringkas dengan visual independen khusus untuk hutang aktif. Pendekatan ini bukan hanya memenuhi requirement, tapi juga memberi rasa “taste” tambahan pada UX aplikasi.

## 📅 Trade-off (Kalau Ada 1 Hari Lagi)

- [ ] Bar chart - visualisasi dihutang vs hutang
- [ ] Better empty states - placeholder graphics yang lebih menarik
- [ ] Animasi - Simple animation untuk interaktivitas

## ⏱️ Time Spent
- 30 menit | Mock Up Design
- 7 jam | Coding, Debugging, n Pecut Copilot
- 15 menit | Setup Deployment
Estimasi waktu implementasi total ~7-8 jam.

## 📄 License

MIT - Bebas pakai, fork, modify sesuai kebutuhan.

---

Made with 🔥 untuk tes recruitment Konten.com

