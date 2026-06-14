# PRD — Planly Web Application
**Version:** 1.0.0  
**Status:** Approved / Completed  
**Last Updated:** June 2026  
**Platform Target:** Web (Desktop-first, Responsive)

---

## 1. Executive Summary

Planly adalah aplikasi manajemen akademik mahasiswa yang saat ini tersedia di platform mobile (iOS & Android) via Flutter. Dokumen ini mendefinisikan persyaratan produk untuk versi **web** dari Planly — sebuah aplikasi berbasis web (Single Page Application) yang memiliki paritas fitur penuh dengan versi mobile, dioptimalkan untuk penggunaan di desktop, tablet, dan mobile browser. Seluruh antarmuka web Planly disajikan dalam **Bahasa Indonesia** dan menggunakan basis data akademik Teknik Informatika.

Versi web ditargetkan untuk mahasiswa yang mengakses dari laptop/PC kampus, lab komputer, atau perangkat apa pun yang tidak menjalankan aplikasi mobile.

---

## 2. Background & Motivation

### 2.1 Problem Statement
Versi mobile Planly membutuhkan instalasi aplikasi dan bergantung pada ketersediaan smartphone. Banyak mahasiswa menggunakan laptop saat di kampus dan lebih produktif mengelola jadwal/tugas di layar besar. Tidak adanya versi web menciptakan hambatan akses.

### 2.2 Opportunity
- Jangkauan yang lebih luas tanpa memerlukan instalasi
- Produktivitas lebih tinggi di layar besar (sidebar nav, multi-panel view)
- SEO & discoverability melalui browser
- Onboarding lebih mudah bagi pengguna baru

### 2.3 Goals
| Goal | Metric Sukses |
|---|---|
| Paritas fitur dengan mobile | 100% fitur mobile tersedia di web |
| Waktu load pertama | < 3 detik (LCP) |
| Responsif di semua layar | Berfungsi di lebar 375px – 1920px+ |
| Retensi pengguna web | 40% monthly active users dari total user base |

---

## 3. Target Users

### 3.1 Primary User
**Mahasiswa aktif** yang:
- Mengikuti perkuliahan reguler dengan jadwal tetap per semester
- Perlu melacak tugas/deadline dari berbagai mata kuliah
- Membuat catatan kuliah yang terorganisir per mata kuliah
- Mengakses dari laptop di kampus, kos, atau rumah

### 3.2 User Persona
**Rafi, Mahasiswa Informatika Semester 6**
- Selalu membawa laptop ke kampus
- Menggunakan laptop untuk mencatat dan mengerjakan tugas
- Frustrasi harus membuka ponsel untuk cek jadwal saat sedang di laptop
- Ingin satu platform yang bisa diakses dari mana saja

---

## 4. Scope

### 4.1 In Scope (v1.0 — Paritas Mobile & Enhancements)
Semua fitur berikut telah diimplementasikan di versi web v1.0:

- Autentikasi (Login, Register, Logout) dengan pre-fill data pengguna dummy
- Dashboard / Hari Ini (Jadwal Hari Ini) dengan Header Live Status & Timeline Interaktif
- Kalender Jadwal Mingguan (Schedule)
- Manajemen Tugas (Tugas) — CRUD lengkap dengan prioritas & tenggat waktu relatif beserta lampiran file (Base64)
- Keamanan & Privasi Gemini API Key — Masking bullet points, visibility toggle, dan browser fingerprint encryption
- Asisten Kuliah AI (AI Companion) — Ekstraksi audio WAV client, transkrip bertimestamp, chatbot materi (RAG), dan pengayaan akademik Google Search
- Manajemen Mata Kuliah (Mata Kuliah) — CRUD lengkap dengan kode warna & perhitungan total SKS
- Manajemen Catatan (Catatan) — CRUD + Search (mendukung deteksi tipe to-do list, visualisasi KaTeX LaTeX, bold/italic, dan direct-to-link)
- Verifikasi Kehadiran Cerdas — Kamera depan Face Recognition (descriptor distance matching) & GPS radius proximity check
- Mode Gelap & Mode Terang (Dark/Light Mode) adaptif tema visual se-aplikasi
- Ekspor & Impor Data — Backup dan recovery data lokal (.json)
- Ekspor Kalender Eksternal — Dokumen .ics iCalendar dan Subscription link feed
- Global Pomodoro Focus Timer Widget di Sidebar & Tab Hari Ini
- Dukungan Dual-Mode API (Mock Mode via LocalStorage dan Live API Mode via Laravel Backend)
- Antarmuka seluruhnya dilokalkan ke **Bahasa Indonesia**

### 4.2 Out of Scope (v1.0)
- Push notification browser/mobile push notifications (v2.0)
- Kolaborasi / berbagi catatan *realtime* (v3.0)
- Offline mode / PWA (v2.0)

---

## 5. Feature Requirements

### 5.1 Autentikasi

#### FR-AUTH-01: Login
**Priority:** P0 (Blocker)

**Deskripsi:** Pengguna dapat masuk menggunakan email dan password.

**Acceptance Criteria:**
- [ ] Form memiliki field Email dan Password
- [ ] Validasi: field tidak boleh kosong sebelum submit
- [ ] Tombol "Login" disabled saat request sedang berjalan, dengan label "Logging in..."
- [ ] Jika berhasil → redirect ke halaman Dashboard
- [ ] Jika gagal → tampilkan pesan error "Invalid email or password"
- [ ] Terdapat link "Forgot password?" (placeholder, belum fungsional di v1.0)
- [ ] Terdapat link ke halaman Register
- [ ] Token JWT disimpan di localStorage / httpOnly cookie
- [ ] API: `POST /auth/login` dengan body `{email, password}`

#### FR-AUTH-02: Register
**Priority:** P0 (Blocker)

**Acceptance Criteria:**
- [ ] Form memiliki field: Full Name, NIM, Email, Password, Confirm Password
- [ ] Validasi client-side: semua field wajib diisi, password minimal 6 karakter, password dan konfirmasi harus sama
- [ ] Tombol disabled saat loading
- [ ] Jika berhasil → tampilkan notifikasi sukses → redirect ke Login
- [ ] Jika gagal → tampilkan pesan error dari API
- [ ] API: `POST /auth/register` dengan body `{name, email, password, password_confirmation, nim}`

#### FR-AUTH-03: Logout
**Priority:** P0 (Blocker)

**Acceptance Criteria:**
- [ ] Tombol logout tersedia di sidebar (navigasi utama) dan halaman Profil
- [ ] Muncul dialog konfirmasi sebelum logout
- [ ] Jika konfirmasi → hapus token dari storage → redirect ke halaman Login
- [ ] API: `POST /logout` dengan Authorization header

#### FR-AUTH-04: Proteksi Rute
**Priority:** P0 (Blocker)

**Acceptance Criteria:**
- [ ] Seluruh halaman di dalam app (Dashboard, Tasks, dll.) tidak dapat diakses tanpa token valid
- [ ] Jika token tidak ada atau expired → redirect ke halaman Login
- [ ] Token dikirim sebagai `Authorization: Bearer <token>` di setiap request

---

### 5.2 Dashboard / Hari Ini (Jadwal Hari Ini)

#### FR-HOME-01: Header Tanggal & Status Live
**Priority:** P0

**Acceptance Criteria:**
- [ ] Menampilkan teks "Jadwal Hari Ini"
- [ ] Menampilkan tanggal saat ini menggunakan locale Indonesia `'id-ID'` dalam format: `[DayName], [Date] [MonthName] [Year]` (contoh: "Rabu, 4 Jun 2026")
- [ ] Menampilkan waktu lokal sistem real-time (jam:menit:detik) yang terupdate dinamis setiap detik
- [ ] Menampilkan bar status kelas yang sedang aktif saat ini ("Sedang Kuliah: [Nama Kelas]" atau "Tidak ada kuliah aktif saat ini")

#### FR-HOME-02: Timeline Jadwal Hari Ini dengan Indikator Status Aktif
**Priority:** P0

**Acceptance Criteria:**
- [ ] Mengambil daftar mata kuliah via `GET /courses` dan memfilter berdasarkan `day_of_week` yang sesuai hari ini
- [ ] Jika tidak ada jadwal hari ini → tampilkan state kosong "Tidak ada kelas untuk hari ini"
- [ ] Jadwal diurutkan berdasarkan waktu mulai (ascending)
- [ ] Setiap item timeline menampilkan:
  - Waktu (start_time – end_time)
  - Nama mata kuliah
  - Ruangan
  - Nama dosen
- [ ] Kelas yang sedang berlangsung (waktu sistem saat ini berada di antara start_time dan end_time) ditandai dengan:
  - Border berbayang dan efek berdenyut (pulsing light primary shadow)
  - Badge glowing status "Sedang Berlangsung"
- [ ] Kelas yang sudah selesai (waktu sistem melewati end_time) tampil lebih redup (opacity 60%), nama dicoret, dan dot timeline terisi penuh abu-abu
- [ ] Kelas mendatang (waktu sistem belum mencapai start_time) ditandai dengan dot outline kosong
- [ ] Koneksi vertikal antar item dalam bentuk track timeline berurutan

#### FR-HOME-03: Quick Stats Bento Cards & Focus Mode
**Priority:** P1

**Acceptance Criteria:**
- [ ] Mengambil data tugas via `GET /tasks`
- [ ] Card "Tugas Tertunda": menampilkan jumlah tugas dengan `is_finished = false`
- [ ] Card "Fokus Saat Ini": menampilkan timer Pomodoro yang sedang berjalan dan nama tugas yang sedang difokuskan
- [ ] Kedua card tampil berdampingan secara responsif

#### FR-HOME-04: Refresh Data
**Priority:** P1

**Acceptance Criteria:**
- [ ] Data otomatis di-refetch ketika halaman di-mount
- [ ] Indikator loading yang rapi saat data sedang diambil dari API / Mock Storage

#### FR-HOME-05: Global Pomodoro Focus Timer
**Priority:** P0

**Acceptance Criteria:**
- [ ] Focus timer dapat diaktifkan dari widget "Fokus Hari Ini" maupun widget sidebar
- [ ] Interval default adalah 25 menit (dapat di-reset)
- [ ] State timer (waktu tersisa, status berjalan/jeda) disinkronkan secara global di seluruh aplikasi melalui state root tingkat tinggi (`App.tsx`)

---

### 5.3 Kalender Jadwal (Jadwal)

#### FR-SCHEDULE-01: Navigasi Tanggal
**Priority:** P0

**Acceptance Criteria:**
- [ ] Menampilkan nama bulan saat ini sebagai header (dalam Bahasa Indonesia)
- [ ] Strip tanggal horizontal menampilkan 7 hari dimulai dari hari ini
- [ ] Setiap item tanggal menampilkan nama hari singkat bahasa Indonesia (Sen, Sel, Rab, Kam, Jum, Sab, Min) dan angka tanggal
- [ ] Tanggal aktif memiliki visual terpilih (background primary color)
- [ ] Klik tanggal → memperbarui daftar jadwal kuliah di bawahnya sesuai hari tersebut
- [ ] Tombol "Hari Ini" untuk kembali ke tanggal hari ini

#### FR-SCHEDULE-02: Daftar Jadwal per Hari
**Priority:** P0

**Acceptance Criteria:**
- [ ] Memfilter `GET /courses` berdasarkan `day_of_week` dari tanggal yang terpilih
- [ ] Setiap card jadwal menampilkan:
  - Tag kode mata kuliah dengan warna aksen
  - Waktu mulai dan selesai (kanan atas)
  - Nama mata kuliah
  - Nama dosen
  - Ruangan dengan ikon lokasi
  - Aksen warna vertikal di sebelah kiri dari `color_hex` mata kuliah
- [ ] Jika tidak ada jadwal → state kosong "Tidak ada kelas untuk hari ini"

---

### 5.4 Manajemen Tugas (Tugas)

#### FR-TASK-01: Daftar Tugas (Tab Belum Selesai & Selesai)
**Priority:** P0

**Acceptance Criteria:**
- [ ] Data diambil via `GET /tasks`
- [ ] Dua tab filter: "Belum Selesai" (`is_finished=false`) dan "Selesai" (`is_finished=true`)
- [ ] Setiap kartu tugas menampilkan:
  - Checkbox untuk mengubah status tugas secara instan
  - Nama / Judul tugas (dicoret jika selesai)
  - Nama mata kuliah (jika terikat `course_id`) atau "Umum / Pribadi"
  - Batas waktu (deadline) dalam format relatif (*Hari ini*, *Besok*, *Kemarin (Terlambat!)*, atau format tanggal biasa jika lebih dari 2 hari)
  - Badge "Terlambat!" (merah) jika melewati deadline dan belum selesai
  - Badge "Tinggi" (merah) jika `is_priority=true` (prioritas tinggi) atau "Sedang" (biasa)
- [ ] Klik checkbox → memicu update status tugas (`PATCH /tasks/{id}/finish` atau toggle status) → memperbarui daftar
- [ ] Jika daftar kosong → menampilkan state kosong "Tidak ada tugas ditemukan" (dengan keterangan disesuaikan hasil pencarian/status)

#### FR-TASK-02: Tambah Tugas
**Priority:** P0

**Acceptance Criteria:**
- [ ] Formulir tersedia di panel slide-over drawer kanan (Tugas Baru)
- [ ] Field wajib: Nama / Judul Tugas, Tanggal Batas Waktu, Waktu
- [ ] Field opsional: Mata Kuliah Terkait (dropdown dari `GET /courses`, opsi default "Tugas Umum / Pribadi"), Catatan / Deskripsi
- [ ] Toggle "Tugas Prioritas Tinggi" (tombol switch ON/OFF)
- [ ] Segmented button Status Awal: Belum Selesai / Selesai
- [ ] Validasi client-side: judul tugas dan tanggal batas waktu tidak boleh kosong
- [ ] Submit → `POST /tasks` → menutup drawer dan memperbarui daftar tugas
- [ ] API body: `{user_id, course_id, task_title, description, deadline: "YYYY-MM-DD HH:MM:SS", is_finished, is_priority}`

#### FR-TASK-03: Edit Tugas
**Priority:** P0

**Acceptance Criteria:**
- [ ] Diakses dari panel slide-over detail tugas (tombol ikon edit)
- [ ] Formulir terisi otomatis (pre-filled) dengan data tugas saat ini
- [ ] Submit → `PUT /tasks/{id}` → memperbarui data tugas dan menutup drawer
- [ ] Tombol Batal untuk keluar dari mode edit

#### FR-TASK-04: Detail Tugas
**Priority:** P1

**Acceptance Criteria:**
- [ ] Klik kartu tugas → membuka slide-over drawer detail di sisi kanan
- [ ] Menampilkan: status badge (Belum Selesai / Selesai / Terlambat!), judul, mata kuliah terkait, batas waktu relatif, deskripsi lengkap
- [ ] Tombol utama toggle status: "Tandai Selesai" / "Tandai Belum Selesai"
- [ ] Tombol Edit dan Hapus di header panel
- [ ] Tombol Hapus memicu penghapusan langsung

#### FR-TASK-05: Hapus Tugas
**Priority:** P0

**Acceptance Criteria:**
- [ ] Menghapus data tugas via `DELETE /tasks/{id}` → menutup panel detail dan memperbarui daftar tugas

---

### 5.5 Manajemen Mata Kuliah (Mata Kuliah)

#### FR-COURSE-01: Daftar Mata Kuliah
**Priority:** P0

**Acceptance Criteria:**
- [ ] Data diambil via `GET /courses`
- [ ] Header menampilkan informasi semester aktif, jumlah mata kuliah terdaftar (*Mata Kuliah Aktif Terdaftar*), dan akumulasi SKS (*SKS Terdaftar*)
- [ ] Setiap kartu mata kuliah menampilkan:
  - Kode mata kuliah dan badge SKS
  - Aksen warna kiri dari `color_hex`
  - Nama mata kuliah
  - Nama dosen (ikon user)
  - Jadwal kuliah: nama hari dalam bahasa Indonesia, jam mulai – jam selesai (ikon clock)
  - Ruang kelas (ikon map-pin)
  - Badge jumlah tugas tertunda (*X Pending*) jika ada tugas belum selesai yang terikat mata kuliah ini
- [ ] Klik kartu → membuka panel detail informasi mata kuliah di bagian atas halaman
- [ ] State kosong jika belum ada mata kuliah: menampilkan "Belum ada mata kuliah terdaftar"

#### FR-COURSE-02: Tambah Mata Kuliah
**Priority:** P0

**Acceptance Criteria:**
- [ ] Form tersedia di modal popup (Tambah Mata Kuliah Baru)
- [ ] Field input:
  - Kode Mata Kuliah (teks pendek, contoh: "CS301")
  - Nama Mata Kuliah
  - SKS (Kredit) (input angka)
  - Ruangan / Lokasi
  - Nama Dosen
  - Hari Kuliah (dropdown select dengan opsi hari Senin s.d Minggu)
  - Jam Mulai & Jam Selesai (input time)
  - Pilihan Warna Tema (color dot palette: Indigo, Rust, Slate grey, Violaceous, Crimson red, Emerald green)
- [ ] Field wajib diisi dan divalidasi client-side sebelum dikirim
- [ ] Submit → `POST /courses` → menutup modal dan memperbarui daftar mata kuliah
- [ ] API body: `{course_code, course_name, sks, room, lecturer_name, day_of_week, start_time, end_time, color_hex, user_id}`

#### FR-COURSE-03: Edit Mata Kuliah
**Priority:** P0

**Acceptance Criteria:**
- [ ] Diakses dari tombol ikon edit pada panel detail mata kuliah (Edit Informasi Mata Kuliah)
- [ ] Form terisi otomatis (pre-filled) dengan data mata kuliah terpilih
- [ ] Hari Kuliah (dropdown select) terisi sesuai data `day_of_week` yang disimpan (misal: "Monday" akan terpilih sebagai "Senin")
- [ ] Submit → `PUT /courses/{id}` → memperbarui data mata kuliah di halaman dan database

#### FR-COURSE-04: Detail Mata Kuliah
**Priority:** P1

**Acceptance Criteria:**
- [ ] Ditampilkan sebagai panel terpadu di bagian atas daftar mata kuliah saat sebuah kartu diklik
- [ ] Menampilkan: badge "Mata Kuliah Aktif", kode mata kuliah, nama mata kuliah, serta bilah informasi dosen, waktu kuliah (hari + jam), ruangan, dan SKS
- [ ] Seksi "Jadwal Mendatang" (Upcoming Schedule): menampilkan tanggal kelas berikutnya menggunakan format lokal Indonesia (contoh: "Next Class: Rab, 10 Jun 2026")
- [ ] Seksi "Daftar Tugas Terbaru" (Recent Tasks Checklist): menampilkan daftar checkbox tugas yang terikat mata kuliah ini (tugas selesai dicoret, dapat di-check secara langsung)
- [ ] Tombol Edit dan Hapus (Unenroll) tersedia di sudut kanan atas panel detail

#### FR-COURSE-05: Hapus Mata Kuliah (Batal Daftar)
**Priority:** P0

**Acceptance Criteria:**
- [ ] `DELETE /courses/{id}` → menghapus pendaftaran mata kuliah tersebut, menutup panel detail, dan memperbarui daftar mata kuliah di UI

---

### 5.6 Manajemen Catatan (Catatan)

#### FR-NOTE-01: Daftar Catatan + Pencarian & Visualisasi Masonry
**Priority:** P0

**Acceptance Criteria:**
- [ ] Data diambil via `GET /notes`
- [ ] Filter pencarian dinamis (real-time) melalui search bar di bagian atas (menyaring berdasarkan judul dan konten secara case-insensitive)
- [ ] Tampilan daftar disusun dalam layout kolom responsif (masonry columns)
- [ ] Setiap kartu catatan menampilkan:
  - Tag kode mata kuliah terkait atau "Umum"
  - Judul catatan
  - Cuplikan/preview isi catatan (otomatis dipotong hingga 6 baris dengan elipsis)
  - Label pembaruan ("Baru diperbarui")
- [ ] Mendeteksi catatan to-do list (judul mengandung kata "to-do list") dan merendernya dalam bentuk daftar checkbox interaktif
- [ ] Mendeteksi catatan bertema "Architecture" dan menampilkan aksen gambar ilustrasi khusus pada kartu catatan tersebut
- [ ] State kosong dengan pesan yang sesuai: "Tidak ada catatan yang cocok" (dengan tombol atau instruksi pencarian ulang)

#### FR-NOTE-02: Tambah Catatan
**Priority:** P0

**Acceptance Criteria:**
- [ ] Form penginputan inline (dapat dibuka dengan tombol "Catatan Baru")
- [ ] Input field:
  - Judul Catatan
  - Kaitkan Mata Kuliah (dropdown select dari `GET /courses`, opsi default "Catatan Umum")
  - Isi / Catatan Materi (textarea)
- [ ] Judul dan isi catatan tidak boleh kosong
- [ ] Submit → `POST /notes` → memperbarui daftar catatan dan menyembunyikan formulir

#### FR-NOTE-03: Detail Catatan (Inspeksi & Dialog)
**Priority:** P1

**Acceptance Criteria:**
- [ ] Klik kartu catatan → membuka modal popup detail catatan
- [ ] Menampilkan: tag mata kuliah, label pembaruan tanggal, judul catatan, dan konten lengkap yang mendukung format baris baru (whitespace-pre-wrap)
- [ ] Tombol Edit dan Hapus di bagian atas modal

#### FR-NOTE-04: Edit Catatan
**Priority:** P0

**Acceptance Criteria:**
- [ ] Mengaktifkan mode edit di dalam modal detail catatan yang sama
- [ ] Form terisi otomatis dengan data judul, isi, dan mata kuliah terasosiasi
- [ ] Submit → `PUT /notes/{id}` → memperbarui catatan di UI dan menutup modal detail

#### FR-NOTE-05: Hapus Catatan
**Priority:** P0

**Acceptance Criteria:**
- [ ] Klik ikon hapus (trash) pada kartu catatan atau di dalam modal detail → memicu `DELETE /notes/{id}` → menghapus catatan dan memperbarui daftar catatan di UI

---

### 5.7 Profil Pengguna

#### FR-PROFILE-01: Tampilan Profil & Akun Dummy Otomatis
**Priority:** P0

**Acceptance Criteria:**
- [ ] Data profil pengguna diambil via `GET /profile` (atau state mock data)
- [ ] Secara default, untuk data dummy pertama langsung memuat identitas pengguna:
  - **Nama Lengkap**: "Arief Sidik Wijayanto"
  - **Email**: "arfwjn@gmail.com"
  - **NIM**: "STI202303494"
  - **Program Studi / Jurusan**: "Teknik Informatika"
  - **Semester**: "4"
- [ ] Menampilkan avatar profil berukuran besar beserta inisial nama
- [ ] Panel kartu informasi menampilkan detail akademik (NIM, Semester, Program Studi) secara rapi

#### FR-PROFILE-02: Menu Aksi Profil
**Priority:** P1

**Acceptance Criteria:**
- [ ] Tombol Edit Profil dan Pengaturan Akun
- [ ] Tombol Keluar (Logout) berwarna merah yang memicu dialog konfirmasi keluar dari aplikasi

---

## 6. Non-Functional Requirements

### 6.1 Performance
| Requirement | Target |
|---|---|
| First Contentful Paint (FCP) | < 1.5 detik |
| Largest Contentful Paint (LCP) | < 3 detik |
| Time to Interactive (TTI) | < 3.5 detik |
| API response handling | Timeout 30 detik, tampilkan error jika melewati |
| Bundle size (initial JS) | < 500 KB gzipped |

### 6.2 Responsiveness
| Breakpoint | Target Perangkat |
|---|---|
| Mobile: 375px – 767px | Ponsel (browser) |
| Tablet: 768px – 1023px | iPad, tablet |
| Desktop: 1024px – 1439px | Laptop standard |
| Wide: 1440px+ | Monitor besar |

### 6.3 Browser Support
- Chrome 100+
- Firefox 100+
- Safari 15+
- Edge 100+

### 6.4 Aksesibilitas
- Semua elemen interaktif memiliki label ARIA
- Kontras warna minimum WCAG AA (4.5:1 untuk teks normal)
- Navigasi keyboard penuh
- Fokus visible

### 6.5 Keamanan
- Token JWT disimpan di httpOnly cookie (preferred) atau localStorage
- Semua request API menggunakan HTTPS
- Sanitasi input pengguna (XSS prevention)
- CORS hanya dari domain yang diizinkan

---

## 7. API Contracts

Versi web menggunakan API backend yang sama dengan aplikasi mobile. Base URL dikonfigurasi via environment variable `VITE_API_BASE_URL` atau `NEXT_PUBLIC_API_BASE_URL`.

### Endpoints yang Digunakan

| Method | Endpoint | Fitur |
|---|---|---|
| POST | /auth/login | Login |
| POST | /auth/register | Register |
| POST | /logout | Logout |
| GET | /profile | Profil user |
| PUT | /profile | Update profil |
| GET | /courses | Daftar mata kuliah |
| POST | /courses | Tambah mata kuliah |
| GET | /courses/{id} | Detail mata kuliah |
| PUT | /courses/{id} | Edit mata kuliah |
| DELETE | /courses/{id} | Hapus mata kuliah |
| GET | /tasks | Daftar tugas |
| POST | /tasks | Tambah tugas |
| PUT | /tasks/{id} | Edit tugas |
| PATCH | /tasks/{id}/finish | Selesaikan tugas |
| DELETE | /tasks/{id} | Hapus tugas |
| GET | /notes | Daftar catatan |
| POST | /notes | Tambah catatan |
| PUT | /notes/{id} | Edit catatan |
| DELETE | /notes/{id} | Hapus catatan |

---

## 8. Tech Stack & Implementation Details

### 8.1 Backend (Laravel API + MySQL)

| Layer | Teknologi | Deskripsi / Alasan |
|---|---|---|
| Language | PHP 8.2+ | Platform runtime backend yang matang |
| Framework | Laravel 11 | Menyediakan REST API endpoints, routing terstruktur, middleware, dan ORM |
| API Style | RESTful JSON API | Berkomunikasi dengan format JSON snake_case standar |
| Autentikasi | Laravel Sanctum | Token-based auth (`Authorization: Bearer <token>`) untuk keamanan SPA |
| ORM | Eloquent ORM | Menyederhanakan query database dengan relasi antartabel yang kuat |
| Database | MySQL | Database relasional untuk menyimpan data pengguna, mata kuliah, tugas, dan catatan |
| Validation | Laravel Form Request | Validasi data masukan dari klien di sisi server secara konsisten |
| Response | Laravel API Resource | Standardisasi struktur JSON response untuk mempermudah konsumsi data |
| CORS Config | Laravel CORS Middleware | Mengizinkan request lintas domain dari aplikasi React frontend |

**Struktur Proyek API Backend (planly-api):**
Aplikasi backend diletakkan di sub-direktori [planly-api](file:///c:/Users/ACER/Downloads/Planly%20Website/planly-api) dengan arsitektur standar Laravel 11.

---

### 8.2 Frontend (React TypeScript + Vite)

| Layer | Teknologi | Alasan / Deskripsi |
|---|---|---|
| Build Tool | Vite 6 | Development server instan dengan hot-reload sangat cepat |
| Library | React 19 | Library utama penyusun komponen antarmuka modular |
| Language | TypeScript | Menjamin type-safety dan meminimalisir error logika di frontend |
| Styling | Tailwind CSS v4 + Vanilla CSS | Mengakomodasi dynamic design system, layout bento grid, serta transisi HSL |
| State Management | React Hooks & Context | Manajemen state global terpusat di `App.tsx` (seperti Pomodoro Focus Timer) |
| HTTP Client | Axios | Mengirim request HTTP dengan interceptor token autentikasi otomatis |
| Icons | Lucide React | Ikon modern, seragam, dan ringan |
| Font | Outfit / Inter (Google Fonts) | Memberikan tipografi yang bersih, modern, dan premium |
| Date Handling | Native JS Date (`id-ID`) | Menggunakan objek Date bawaan JavaScript yang diformat dengan locale Indonesia |

### 8.3 Konfigurasi Environment Frontend

Aplikasi frontend mendukung **Dual-Mode API** yang diatur melalui variabel lingkungan dalam berkas [`.env`](file:///c:/Users/ACER/Downloads/Planly%20Website/.env):

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_USE_MOCK=true
```

* **Mock Mode (`VITE_USE_MOCK=true`)**: Menggunakan simulasi API lokal berbasis `localStorage` sehingga aplikasi web dapat berjalan penuh tanpa perlu koneksi database live. Dilengkapi fitur *Auto-Clear Caching* jika format data model lawas terdeteksi.
* **Live API Mode (`VITE_USE_MOCK=false`)**: Mengarahkan seluruh request HTTP menggunakan Axios ke endpoint server backend Laravel live di `VITE_API_BASE_URL`.

Header request yang dikirimkan ke backend:
```json
{
  "Content-Type": "application/json",
  "Accept": "application/json",
  "Authorization": "Bearer <token_dari_sanctum>"
}
```
---

---

## 9. User Flow Diagram

```
Pendaratan / Landing (Splash)
    │
    ├── [Sudah Registrasi] → Halaman Login (Auto-fill Arief Sidik)
    │       │
    │       ├── [Sukses Autentikasi] ─────────────────────────┐
    │       └── [Gagal Autentikasi] → Pesan Error             │
    │                                                         │
    └── [Belum Registrasi] → Halaman Register                 │
            │                                                 │
            ├── [Sukses] → Dialihkan ke Login                 │
            └── [Gagal] → Pesan Validasi / Error              │
                                                              ▼
                                                   Tata Letak Utama (Main Layout)
                                                   ├── Sidebar Kiri
                                                   │   ├── Navigasi Menu:
                                                   │   │   ├── Hari Ini (Hari Ini & Fokus Pomodoro)
                                                   │   │   ├── Jadwal (Kalender Mingguan)
                                                   │   │   ├── Tugas (Filter Belum Selesai & Selesai)
                                                   │   │   ├── Mata Kuliah (Daftar & Detail SKS)
                                                   │   │   ├── Catatan (Catatan Kuliah Masonry Grid)
                                                   │   │   └── Profil (Informasi Akun)
                                                   │   │
                                                   │   └── Widget Global Pomodoro Timer (25 menit)
                                                   │
                                                   └── Area Konten Aktif
                                                       (Menyajikan panel aktif & drawer interaktif)
```

---

## 10. Milestones & Prioritas Pengembangan

### Phase 0 — Setup Backend & Seeder (Laravel) [COMPLETED]
1. Inisialisasi struktur proyek Laravel 11 di sub-folder `planly-api`
2. Konfigurasi migrasi skema tabel database (users, courses, tasks, notes) di MySQL
3. Setup modul Laravel Sanctum untuk token-based authentication
4. Implementasi controller, request validation, resource mapping, dan routing di `api.php`
5. Menyiapkan database seeder dengan data Teknik Informatika realistis untuk pengguna dummy
6. Konfigurasi CORS agar kompatibel dengan port frontend `http://localhost:3000`

### Phase 1 — Frontend Core & Lokalisasi (P0) [COMPLETED]
7. Setup proyek web React 19 menggunakan build tool Vite 6
8. Mengonfigurasi client Axios dengan interceptor token serta setup dual-mode API (Mock vs Live)
9. Pembuatan halaman Autentikasi (Login pre-fill & Register) dalam Bahasa Indonesia
10. Implementasi Main Layout dengan navigasi sidebar dan widget global Pomodoro Focus Timer
11. Halaman "Hari Ini" dengan panel status live dan bento cards
12. Modul CRUD Tugas terintegrasi dengan filter status tugas
13. Modul CRUD Mata Kuliah via modal popup

### Phase 2 — Integrasi Detail & Polish (P1) [COMPLETED]
14. Pembuatan modul Catatan dengan layout masonry, deteksi to-do list, dan ilustrasi dinamis
15. Halaman Jadwal (Kalender Mingguan) dengan filter berdasarkan hari kuliah
16. Halaman Profil Mahasiswa terintegrasi data Teknik Informatika dan tombol logout
17. Refaktorisasi indikator live kelas di Hari Ini dengan Live Status Header Bar (menghapus garis merah)
18. Penerjemahan menyeluruh (100% Indonesian localization) untuk semua sub-formulir dan pesan error

### Phase 3 — Refinement & Polish (P2) [COMPLETED]
19. Menambahkan loading skeleton di semua halaman sebelum data selesai dimuat dari API
20. Implementasi Error Boundary global dan kustomisasi halaman Error 404
21. Optimalisasi responsivitas penuh untuk browser seluler/mobile (lebar 375px)
22. Penambahan animasi transisi halaman yang lebih halus
23. Menyediakan ilustrasi visual kustom untuk kondisi data kosong (empty states)

---

## 11. Status & Open Questions

| # | Pertanyaan / Isu | Penanggung Jawab | Status | Catatan / Resolusi |
|---|---|---|---|---|
| 1 | Apakah backend Laravel web berbagi instance dengan mobile? | Backend Team | **Resolved** | Berbagi database MySQL dan endpoint API terintegrasi yang sama. |
| 2 | Apakah database web dan mobile berbagi instance yang sama? | Database Admin | **Resolved** | Ya, menggunakan database MySQL tunggal yang sama. |
| 3 | Penyimpanan token di frontend menggunakan metode apa? | Security Lead | **Resolved** | Disimpan secara aman di `localStorage` pada browser klien. |
| 4 | Fitur notifikasi browser/mobile realtime. | Product Owner | **Decided** | Ditunda ke rilis v2.0 (Fokus v1.0 adalah fungsionalitas inti). |
| 5 | Server hosting untuk server live API. | DevOps Team | **Resolved** | Dihost menggunakan web server lokal (XAMPP/MySQL & Artisan Serve) untuk fase pengembangan saat ini. |

---

## 12. Panduan Paritas Pengembangan Aplikasi Mobile Flutter

Dokumen ini menjadi acuan utama bagi pengembang aplikasi mobile Flutter untuk menyejajarkan fitur (*feature parity*) dengan versi Web Planly.

### 12.1 Keamanan & Kunci API Gemini (Direct Client-side)
*   **Keamanan Penyimpanan**: Berbeda dengan browser yang menggunakan sidik jari peramban untuk mengenkripsi kunci di `localStorage`, aplikasi Flutter **wajib** menggunakan **`flutter_secure_storage`** untuk menyimpan API Key Gemini yang dimasukkan pengguna secara aman (berbasis Keychain di iOS dan Keystore/EncryptedSharedPreferences di Android). Jangan pernah menyimpannya di `shared_preferences` dalam bentuk plain-text.
*   **Masking Tampilan**: Form input API Key di halaman profil/asisten mobile wajib menggunakan parameter `obscureText: true` (tipe kata sandi) dengan tombol visibilitas (mata coret) untuk menjaga privasi.
*   **Integrasi SDK**: Gunakan paket resmi **`google_generative_ai`** di Dart untuk membuat koneksi langsung dari perangkat klien ke API Gemini Flash 2.5.

### 12.2 Analisis Kuliah AI & Pemrosesan Audio
*   **Ekstraksi Audio Lokal**: Pada versi Web, biner audio WAV 16kHz diekstrak dari video MP4 langsung di browser untuk menghemat data. Di Flutter, gunakan plugin **`ffmpeg_kit_flutter`** untuk mengekstrak audio dari video lokal sebelum diunggah ke Gemini:
    ```bash
    -i input.mp4 -vn -acodec pcm_s16le -ar 16000 -ac 1 output.wav
    ```
*   **Grounding & RAG Chatbot**: Chatbot asisten kuliah di Flutter harus menyertakan isi transkrip sebagai sistem instruksi awal di riwayat percakapan chat. Batasi domain agar chatbot menolak menjawab pertanyaan di luar materi transkrip.
*   **Opsi Formula**: Selaras dengan Web, parsing kartu pengayaan akademik di Flutter harus memeriksa eksistensi bidang `formula` (`formula?`). Jika data formula kosong/null, sembunyikan kolom visual render rumus LaTeX dan hanya tampilkan teks penjelasan saja.

### 12.3 Verifikasi Kehadiran Wajah & GPS (Biometrics)
*   **Deteksi Wajah Lokal**: Di Flutter, gunakan plugin **`google_ml_kit`** (untuk pendeteksian wajah di kamera depan) atau interpreter **`tflite_flutter`** dengan model FaceNet untuk menghasilkan array descriptor wajah 128-float.
*   **Pencocokan Presensi**: Simpan descriptor wajah terdaftar di secure storage lokal. Saat mahasiswa check-in absensi, ambil descriptor live dan hitung jarak Euclidean terhadap descriptor terdaftar. Kunci tombol absensi jika nilai jarak di atas `0.6` (tidak cocok).
*   **Kamera Stream Lifecycle**: Pastikan kamera ditutup secara eksplisit saat halaman absensi/pendaftaran wajah di-dispose agar lampu kamera ponsel mati sepenuhnya.
*   **GPS Radius**: Gunakan paket **`geolocator`** untuk mengambil koordinat presisi tinggi dan hitung jarak meter terhadap koordinat ruangan kelas kuliah.

### 12.4 Render Rumus Matematika LaTeX & Tautan Catatan
*   **Render KaTeX**: Catatan belajar di Flutter yang mengandung rumus matematika block (`$$...$$`) atau inline (`$...$`) harus dirender secara visual. Rekomendasi paket: **`flutter_math_fork`** untuk render ekspresi matematika murni, atau menggunakan widget mini webview lokal untuk memuat pustaka KaTeX asli agar output LaTeX terlihat rapi.
*   **Parsing Baris LaTeX Multiline**: Parser catatan di Flutter harus mendukung pendeteksian rumus multiline (dimulai dari baris `$$` hingga ditemukan baris penutup `$$`) agar baris-baris tersebut digabungkan ke dalam display render mode tunggal sebelum dilewatkan ke mesin LaTeX.
*   **Pill Link (Direct-to-Link)**: Ubah pola tautan markdown `[Label](URL)` di dalam teks catatan menjadi komponen tombol visual khusus (seperti widget Chip atau Card mini) berikon tautan eksternal yang jika diklik akan memicu **`url_launcher`** untuk membuka web browser eksternal.
*   **Pemberantasan Asterisk**: Terjemahkan format asterisk bold `**teks**` dan italic `*teks*` ke visual styling `FontWeight.bold` dan `FontStyle.italic` di Flutter TextSpan, alih-alih merender karakter asterisk mentah.

### 12.5 Tampilan Skeleton & Status Halaman
*   **Theme-Adaptive Skeleton**: Sediakan loading placeholder menggunakan plugin **`shimmer`** dengan warna gradien yang menyesuaikan tema aktif (gelap/terang).
*   **Persistence Tab**: Simpan index tab/halaman terakhir yang dibuka menggunakan `shared_preferences` agar aplikasi mobile tidak kembali ke halaman awal (Today) saat dibuka ulang atau berpindah fokus.
*   **Interactive Empty States**: Standardisasikan widget `EmptyState` di Flutter yang mendukung input list widget ikon melayang (floating animation), deskripsi, serta tombol aksi (CTA) yang memicu bottom sheet/drawer form data baru.

