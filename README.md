# Planly — Ruang Kerja Akademik Mahasiswa (Web & Mobile Backend)

**Planly** adalah platform web perencana akademik premium yang dirancang khusus untuk meningkatkan produktivitas belajar mahasiswa. Aplikasi ini menggabungkan pengelolaan jadwal kuliah otomatis, manajemen tugas kuliah, catatan materi berformat Markdown, verifikasi presensi kehadiran menggunakan kamera (Face Biometrics), asisten kuliah pintar menggunakan Gemini AI, hingga ekspor jadwal ke Google Calendar secara instan.

Platform ini mendukung **Dual-Mode API** (Simulasi Lokal / Mock vs Koneksi Laravel Backend) untuk kemudahan pengembangan dan paritas penuh dengan target pengembangan aplikasi mobile Flutter.

---

## 🚀 Fitur Utama

* **Dasbor "Hari Ini" (Today Dashboard)**: Halaman pemantau agenda harian yang merangkum jadwal kuliah aktif, status kuliah realtime (*pulsing indicator*), daftar tugas terdekat, dan widget pengontrol fokus Pomodoro.
* **Timeline Jadwal & Kalender Dinamis**: Kalender interaktif bulanan dan mingguan yang terintegrasi dengan status kelas normal, pergeseran jadwal kelas kuliah (*reschedules*), serta pembatalan kelas (*canceled*).
* **Verifikasi Kehadiran Cerdas (Class Attendance & Biometrics)**:
  * Sistem absensi masuk kelas menggunakan live camera depan.
  * **Face Recognition**: Deteksi struktur wajah dan pencocokan descriptor wajah real-time menggunakan pustaka `@vladmandic/face-api` (membandingkan live webcam descriptor dengan descriptor wajah terdaftar di profil mahasiswa dengan threshold Euclidean Distance <= 0.6).
  * **GPS Radius**: Pengukuran kesesuaian koordinat GPS posisi mahasiswa dengan koordinat kelas.
  * Statistik kehadiran interaktif dengan grafik syarat minimum 75% kehadiran kuliah.
* **Asisten Kuliah AI (AI Companion & Chatbot)**:
  * **Ekstraktor Audio**: Mengompres dan mengekstrak audio biner (WAV format 16000Hz mono) dari rekaman video kuliah langsung di sisi client (hemat bandwidth hingga 50x).
  * **Gemini AI Analysis**: Menghasilkan transkrip bertimestamp otomatis, daftar ringkasan topik (chapters), poin penting (takeaways), dan kartu pengayaan Google Search.
  * **RAG Chatbot**: Chatbot interaktif untuk tanya jawab materi berbasis konteks transkrip kuliah dengan pembatasan domain (menolak pertanyaan di luar materi kuliah).
  * **Status & Keamanan API Key**: Konfigurasi API Key Gemini mandiri dengan enkripsi lokal (`localStorage`) berbasis browser fingerprint (mengacak kunci agar aman dari XSS/credential scrapers), penyamaran karakter masukan (bullet points), serta penanganan variabel lingkungan `.env`.
* **Manajemen Tugas & Catatan Belajar**:
  * **Format LaTeX KaTeX**: Pratinjau catatan yang mendukung penulisan rumus matematika block (`$$formula$$` dengan stateful multiline parser) dan inline (`$formula$`) secara asli menggunakan KaTeX.
  * **Markdown Parser & Direct-to-Link**: Mengonversi penanda tebal (`**`) dan miring (`*`) asterisk ke elemen visual HTML asli serta mengubah link markdown `[Label](URL)` menjadi tombol pill interaktif ("Direct-to-Link").
  * **Lampiran Berkas**: Pengunggahan lampiran pendukung tugas/catatan kuliah (Base64 file reader dengan batas file 1.5MB).
  * **Checkpoint Catatan**: Editor checklist materi kuliah yang dapat dicentang langsung pada masonry grid dasbor utama.
* **Ekspor & Sinkronisasi Kalender**:
  * Unduh dokumen iCalendar (`.ics` file) yang kompatibel dengan Google Calendar atau Outlook.
  * Salin link feed langganan kalender dinamis (ICS Subscription Feed Link) untuk sync otomatis di latar belakang.
* **Interactive Empty States**:
  * Visualisasi data kosong yang seragam dengan animasi hover 3D multi-ikon (icon float & rotate) serta tombol Call-to-Action (CTA) interaktif.

---

## 🛠️ Stack Teknologi

* **Frontend Framework**: React 19 (TypeScript)
* **Build Tool**: Vite 6
* **Styling**: TailwindCSS v4 & Vanilla CSS
* **Ikonografi**: Lucide React
* **Math Rendering**: KaTeX 0.17
* **Face Biometrics**: Face-api.js (`@vladmandic/face-api`)
* **AI Client SDK**: Google Gen AI SDK (`@google/genai`)
* **Animasi**: Framer Motion / Motion
* **HTTP Client**: Axios (untuk integrasi server)
* **Backend API**: Laravel 11 & Sanctum (Bearer Token) di direktori `/planly-api`

---

## 📦 Panduan Instalasi & Kloning

Ikuti langkah-langkah di bawah ini untuk menjalankan Planly di komputer lokal Anda:

### 1. Kloning Repositori
```bash
git clone https://github.com/username/planly-website.git
cd planly-website
```

### 2. Pemasangan Dependencies
Instal semua paket dependensi Node.js frontend:
```bash
npm install
```

### 3. Konfigurasi Environment Variables (`.env`)
Salin file `.env.example` menjadi `.env` di root directory:
```bash
cp .env.example .env
```
Isi konfigurasi berikut:
```env
# Mode Sinkronisasi Data:
# - Set 'true' untuk menggunakan database simulasi lokal (localStorage / mockData)
# - Set 'false' untuk menghubungkan frontend langsung dengan REST API Laravel
VITE_USE_MOCK=false

# URL API Server Laravel (Dipakai saat VITE_USE_MOCK=false)
VITE_API_BASE_URL=http://localhost:8000/api

# Gemini API Key Opsional (Alternatif jika tidak diatur di UI)
GEMINI_API_KEY=MY_GEMINI_API_KEY
```

### 4. Menjalankan Server Pengembangan (Local Dev Server)
Jalankan perintah berikut untuk memulai server lokal Planly:
```bash
npm run dev
```
Aplikasi akan berjalan di alamat **`http://localhost:3000`**.

### 5. Kompilasi Produksi (Production Build)
Untuk mengompilasi dan mengoptimalkan kode program agar siap di-deploy, jalankan:
```bash
npm run build
```
Hasil kompilasi akan tersimpan di dalam folder `/dist`.

---

## 📂 Struktur Folder Proyek

```txt
planly-website/
├── planly-api/                # Backend API Laravel 11 & DB Migrations
├── src/
│   ├── components/            # Komponen visual modular per-fitur
│   │   ├── attendance/        # Verifikasi wajah & riwayat absen
│   │   ├── auth/              # Halaman masuk/daftar
│   │   ├── calendar/          # Timeline jadwal & grid bulanan
│   │   ├── courses/           # Pendaftaran mata kuliah & input SKS kustom
│   │   ├── events/            # Agenda non-kuliah kampus
│   │   ├── notes/             # Catatan materi & editor Markdown (LaTeX & Link)
│   │   ├── profile/           # Bento settings layout & ekspor kalender
│   │   ├── tasks/             # Pengelola tugas & file uploader
│   │   ├── today/             # Dasbor ringkasan hari ini & Pomodoro timer
│   │   └── ui/                # Reusable UI (InteractiveEmptyState, ApiKeyModal, dll.)
│   ├── hooks/                 # Custom Hooks (useFaceScanner, useAcademicData, useAppAuth)
│   ├── services/              # Modul REST API Laravel & Helper HTTP
│   │   ├── core/              # Axios instance & localstorage helper
│   │   ├── biometrics/        # Layanan lokal deteksi/penyelarasan wajah face-api
│   │   ├── ai/                # Layanan pemrosesan audio & Gemini RAG
│   │   └── ...                # Servis data akademik terintegrasi
│   ├── utils/                 # Utility helpers
│   │   ├── security.ts        # Enkripsi & Dekripsi API Key berbasis browser fingerprint
│   │   └── ...                # Helper iCal, formatting, dll.
│   ├── types.ts               # Interface Types TypeScript (snake_case)
│   ├── mockData.ts            # Dummy Data Awal Mahasiswa (Arief Sidik W.)
│   ├── App.tsx                # Entry point UI & Router Navigasi (Tab persistence)
│   └── main.tsx               # Bootstrapper React utama
├── API.md                     # Panduan endpoint REST API Laravel (Sumber data Flutter)
├── BACKEND_INTEGRATION.md     # Panduan migrasi database & controller backend
└── PRD.md                     # Product Requirement Document (Paritas Fitur Mobile Flutter)
```