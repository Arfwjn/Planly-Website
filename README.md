# Planly — Ruang Kerja Akademik Mahasiswa

**Planly** adalah platform web perencana akademik premium yang dirancang khusus untuk meningkatkan produktivitas belajar mahasiswa. Aplikasi ini menggabungkan pengelolaan jadwal kuliah otomatis, manajemen tugas kuliah, catatan materi berformat Markdown, verifikasi presensi kehadiran menggunakan kamera, hingga ekspor jadwal ke Google Calendar secara instan.

---

## 🚀 Fitur Utama

* **Dasbor "Hari Ini" (Today Dashboard)**: Halaman pemantau agenda harian yang merangkum jadwal kuliah aktif, daftar tugas terdekat, dan widget pengontrol fokus Pomodoro.
* **Timeline Jadwal & Kalender Dinamis**: Kalender interaktif bulanan dan mingguan yang terintegrasi dengan status kelas normal, pergeseran jadwal kelas kuliah (*reschedules*), serta pembatalan kelas (*canceled*).
* **Verifikasi Kehadiran (Class Attendance)**: Sistem absensi masuk kelas menggunakan kamera (scan wajah depan Base64 snapshot) dan verifikasi jarak radius koordinat lokasi GPS mahasiswa. Menampilkan grafik pencapaian batas 75% kehadiran syarat kelulusan.
* **Manajemen Tugas & Catatan (Tugas & Notes)**:
  * Pengunggahan berkas lampiran pendukung tugas/catatan kuliah (Base64 file reader dengan batasan ukuran 1.5MB).
  * Editor catatan terintegrasi Formatting Toolbar Markdown (checkpoint, list bullet, headings, miring/tebal).
  * Pratinjau langsung (*Live Preview*) dan templat instan catatan siap pakai.
  * Checkpoint interaktif yang dapat dicentang langsung pada kartu masonry dasbor utama.
* **Ekspor & Sinkronisasi Kalender**:
  * Unduh dokumen iCalendar (`.ics` file) yang kompatibel dengan Google Calendar atau Outlook.
  * Salin link feed langganan kalender dinamis (ICS Subscription Feed Link).
* **Analisis & Portabilitas Data**:
  * Bar visualisasi progres pencapaian target IPK semester.
  * Surel simulator rangkuman harian dikirimkan ke email mahasiswa.
  * Ekspor & Impor berkas cadangan cadangan data lokal (`.json`).

---

## 🛠️ Stack Teknologi

* **Frontend Framework**: React 19 (TypeScript)
* **Build Tool**: Vite 6
* **Styling**: TailwindCSS v4 & Vanilla CSS
* **Ikonografi**: Lucide React
* **Animasi**: Motion
* **HTTP Client**: Axios (untuk integrasi server)

---

## 📦 Panduan Instalasi & Kloning

Ikuti langkah-langkah di bawah ini untuk menjalankan Planly di komputer lokal Anda:

### 1. Kloning Repositori GitHub

Buka terminal Anda dan jalankan perintah berikut untuk mengunduh kode program dari GitHub:

```bash
# Ganti url di bawah dengan url repositori asli Anda
git clone https://github.com/username/planly-website.git
cd planly-website
```

### 2. Pemasangan Dependencies

Instal semua paket dependensi Node.js yang dibutuhkan aplikasi menggunakan npm:

```bash
npm install
```

### 3. Konfigurasi Environment Variables (`.env`)

Salin file contoh konfigurasi lingkungan `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Buka file `.env` di text editor Anda, lalu atur variabel berikut sesuai dengan mode pengembangan Anda:

```env
# Mode Sinkronisasi Data:
# - Set 'true' untuk menggunakan database simulasi lokal (localStorage / mockData)
# - Set 'false' untuk menghubungkan frontend langsung dengan REST API Laravel
VITE_USE_MOCK=true

# URL API Server Laravel Teman Anda (Dipakai saat VITE_USE_MOCK=false)
VITE_API_BASE_URL=http://localhost:8000/api
```

### 4. Menjalankan Server Pengembangan (Local Dev Server)

Jalankan perintah berikut untuk memulai server lokal Planly:

```bash
npm run dev
```

Aplikasi akan berjalan di alamat **`http://localhost:3000`** (Silakan buka di browser Anda).

### 5. Kompilasi Produksi (Production Build)

Untuk mengompilasi dan mengoptimalkan kode program agar siap di-deploy ke server staging/produksi, jalankan:

```bash
npm run build
```

Hasil kompilasi akan tersimpan di dalam folder `/dist` dalam bentuk HTML, CSS, dan JS statik.

---

## 📂 Struktur Folder Proyek

```txt
planly-website/
├── src/
│   ├── components/            # Komponen visual modular per-fitur
│   │   ├── attendance/        # Sub-komponen verifikasi wajah & riwayat absen
│   │   ├── auth/              # Komponen halaman masuk/daftar
│   │   ├── calendar/          # Komponen timeline jadwal & grid bulanan
│   │   ├── courses/           # Komponen pendaftaran mata kuliah
│   │   ├── events/            # Komponen agenda non-kuliah kampus
│   │   ├── notes/             # Catatan materi & editor Markdown
│   │   ├── profile/           # Bento settings layout & ekspor kalender
│   │   ├── tasks/             # Pengelola tugas & file uploader
│   │   ├── today/             # Dasbor ringkasan hari ini
│   │   └── workspace/         # Pomodoro timer & ambient sound selector
│   ├── hooks/                 # Custom Hooks (useAcademicData, useAppAuth, dll.)
│   ├── services/              # Modul REST API Laravel & Helper HTTP
│   │   ├── core/              # Axios instance & localstorage helper
│   │   ├── auth/              # Servis masuk, daftar, & keluar akun
│   │   └── ...                # Servis data akademik terintegrasi
│   ├── types.ts               # Interface Types TypeScript (snake_case)
│   ├── mockData.ts            # Dummy Data Awal Mahasiswa (Arief Sidik W.)
│   ├── App.tsx                # Entry point UI & Router Navigasi
│   └── main.tsx               # Bootstrapper React utama
├── API.md                     # Panduan endpoint REST API Laravel
├── BACKEND_INTEGRATION.md     # Panduan migrasi database & controller backend
└── package.json               # Konfigurasi npm script & dependencies
```