# PRD — Planly Web Application
**Version:** 1.0.0  
**Status:** Draft  
**Last Updated:** June 2026  
**Platform Target:** Web (Desktop-first, Responsive)

---

## 1. Executive Summary

Planly adalah aplikasi manajemen akademik mahasiswa yang saat ini tersedia di platform mobile (iOS & Android) via Flutter. Dokumen ini mendefinisikan persyaratan produk untuk versi **web** dari Planly — sebuah aplikasi berbasis browser yang memiliki paritas fitur penuh dengan versi mobile, dioptimalkan untuk penggunaan di desktop, tablet, dan mobile browser.

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

### 4.1 In Scope (v1.0 — Paritas Mobile)
Semua fitur berikut **wajib** ada di versi web v1.0:

- Autentikasi (Login, Register, Logout)
- Dashboard / Hari Ini (Today's Schedule)
- Kalender Jadwal Mingguan
- Manajemen Tugas (Tasks) — CRUD lengkap
- Manajemen Mata Kuliah (Courses) — CRUD lengkap
- Manajemen Catatan (Notes) — CRUD + Search
- Profil Pengguna

### 4.2 Out of Scope (v1.0)
- Push notification browser (v2.0)
- Upload foto profil (v2.0)
- Mode gelap (v2.0)
- Kolaborasi / berbagi catatan (v3.0)
- Import/export data (v2.0)
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

### 5.2 Dashboard (Today's Schedule)

#### FR-HOME-01: Header Tanggal
**Priority:** P0

**Acceptance Criteria:**
- [ ] Menampilkan teks "Today's Schedule"
- [ ] Menampilkan tanggal saat ini dalam format: `[DayName], [MonthName] [Date]` (contoh: "Wednesday, Jun 4")

#### FR-HOME-02: Timeline Jadwal Hari Ini
**Priority:** P0

**Acceptance Criteria:**
- [ ] Mengambil daftar mata kuliah via `GET /courses` dan memfilter berdasarkan `day_of_week` yang sesuai hari ini
- [ ] Jika tidak ada jadwal hari ini → tampilkan state kosong "No classes for today"
- [ ] Jadwal diurutkan berdasarkan waktu mulai (ascending)
- [ ] Setiap item timeline menampilkan:
  - Waktu (start_time – end_time)
  - Nama mata kuliah
  - Ruangan
  - Nama dosen
- [ ] Kelas yang sedang berlangsung (current time antara start–end) ditandai dengan badge "In Progress" dan indikator visual berwarna primary
- [ ] Kelas yang sudah selesai tampil dengan opacity berkurang, nama dicoret, badge "Completed"
- [ ] Koneksi vertikal antar item (timeline line)

#### FR-HOME-03: Quick Stats Bento Cards
**Priority:** P1

**Acceptance Criteria:**
- [ ] Mengambil data tugas via `GET /tasks`
- [ ] Card "Pending Task": menampilkan jumlah tugas dengan `is_finished = false`
- [ ] Card "Current Focus": menampilkan judul tugas pending pertama (jika ada)
- [ ] Kedua card tampil side-by-side

#### FR-HOME-04: Refresh Data
**Priority:** P1

**Acceptance Criteria:**
- [ ] Terdapat tombol refresh atau data otomatis di-refetch saat halaman di-mount
- [ ] Indikator loading saat data sedang diambil

---

### 5.3 Kalender Jadwal (Schedule)

#### FR-SCHEDULE-01: Navigasi Tanggal
**Priority:** P0

**Acceptance Criteria:**
- [ ] Menampilkan nama bulan saat ini sebagai header
- [ ] Strip tanggal horizontal menampilkan 7 hari dimulai dari hari ini
- [ ] Setiap item tanggal menampilkan nama hari singkat (Mon, Tue, ...) dan angka tanggal
- [ ] Tanggal aktif memiliki visual terpilih (background primary color)
- [ ] Klik tanggal → update daftar jadwal di bawah
- [ ] Tombol "Today" untuk kembali ke hari ini

#### FR-SCHEDULE-02: Daftar Jadwal per Hari
**Priority:** P0

**Acceptance Criteria:**
- [ ] Memfilter `GET /courses` berdasarkan `day_of_week` dari tanggal yang dipilih
- [ ] Setiap card jadwal menampilkan:
  - Tag "Course" dengan warna
  - Waktu (kanan atas)
  - Nama mata kuliah
  - Nama dosen
  - Ruangan dengan ikon lokasi
  - Aksen warna kiri dari `color_hex` mata kuliah
- [ ] Jika tidak ada jadwal → state kosong "No classes for this day"

---

### 5.4 Manajemen Tugas (Tasks)

#### FR-TASK-01: Daftar Tugas (Tabs Pending & Done)
**Priority:** P0

**Acceptance Criteria:**
- [ ] Data diambil via `GET /tasks`
- [ ] Dua tab: "Pending" (is_finished=false) dan "Done" (is_finished=true)
- [ ] Setiap kartu tugas menampilkan:
  - Checkbox untuk toggle status selesai
  - Judul tugas (dicoret jika selesai)
  - Nama mata kuliah (resolved dari course_id)
  - Deadline dalam format relatif (Today, Tomorrow, Yesterday, atau "Mon, Jun 4")
  - Badge "Overdue" (merah) jika melewati deadline dan belum selesai
  - Badge "High Priority" (biru) jika is_priority=true dan belum selesai
- [ ] Klik checkbox → `PATCH /tasks/{id}/finish` → refresh data
- [ ] Jika tab kosong → tampilkan "No tasks found"

#### FR-TASK-02: Tambah Tugas
**Priority:** P0

**Acceptance Criteria:**
- [ ] Form tersedia di modal/panel samping (slide-over) atau halaman terpisah
- [ ] Field wajib: Task Title, Deadline (tanggal + waktu)
- [ ] Field opsional: Subject/Course (dropdown dari GET /courses, termasuk opsi "General / Personal"), Description
- [ ] Toggle "High Priority Task"
- [ ] Segmented button Initial Status: Pending / Done
- [ ] Validasi: title, tanggal, dan waktu tidak boleh kosong
- [ ] Submit → `POST /tasks` → redirect/refresh ke daftar
- [ ] API body: `{user_id, course_id, task_title, description, deadline: "YYYY-MM-DD HH:MM:SS", is_finished, is_priority}`

#### FR-TASK-03: Edit Tugas
**Priority:** P0

**Acceptance Criteria:**
- [ ] Diakses dari halaman detail tugas (tombol edit)
- [ ] Form pre-filled dengan data tugas yang ada
- [ ] Dropdown course menampilkan loading state saat mengambil data
- [ ] Submit → `PUT /tasks/{id}` → kembali ke daftar
- [ ] Tombol Cancel

#### FR-TASK-04: Detail Tugas
**Priority:** P1

**Acceptance Criteria:**
- [ ] Klik kartu tugas → buka halaman/panel detail
- [ ] Menampilkan: status badge (Pending/Overdue/Completed/High Priority), judul, course, deadline, deskripsi
- [ ] Tombol "Complete Task" (disabled jika sudah selesai)
- [ ] Tombol Edit dan Delete di header
- [ ] Delete memerlukan konfirmasi dialog

#### FR-TASK-05: Hapus Tugas
**Priority:** P0

**Acceptance Criteria:**
- [ ] Dialog konfirmasi sebelum hapus
- [ ] `DELETE /tasks/{id}` → refresh daftar

---

### 5.5 Manajemen Mata Kuliah (Courses)

#### FR-COURSE-01: Daftar Mata Kuliah
**Priority:** P0

**Acceptance Criteria:**
- [ ] Data diambil via `GET /courses`
- [ ] Header menampilkan total SKS enrolled dan jumlah mata kuliah
- [ ] Setiap kartu mata kuliah menampilkan:
  - Kode mata kuliah dan badge SKS
  - Aksen warna kiri dari `color_hex`
  - Nama mata kuliah
  - Nama dosen (ikon person)
  - Jadwal: hari, jam mulai – jam selesai (ikon waktu)
  - Ruangan (ikon lokasi)
- [ ] Klik kartu → halaman detail
- [ ] State kosong jika tidak ada mata kuliah

#### FR-COURSE-02: Tambah Mata Kuliah
**Priority:** P0

**Acceptance Criteria:**
- [ ] Form memiliki field:
  - Course Code (teks pendek)
  - Course Name
  - Credits/SKS (angka)
  - Room/Location
  - Lecturer Name
  - Date picker (digunakan untuk menentukan day_of_week)
  - Start Time picker (format 24 jam)
  - End Time picker (format 24 jam)
- [ ] Semua field wajib diisi
- [ ] Validasi sebelum submit
- [ ] Submit → `POST /courses` dengan body sesuai API
- [ ] `color_hex` default: `#3498db`
- [ ] `day_of_week` diturunkan dari tanggal yang dipilih

#### FR-COURSE-03: Edit Mata Kuliah
**Priority:** P0

**Acceptance Criteria:**
- [ ] Form pre-filled dengan data existing
- [ ] Date picker pre-filled ke hari terdekat sesuai `day_of_week` yang tersimpan
- [ ] Submit → `PUT /courses/{id}` → kembali ke detail atau daftar

#### FR-COURSE-04: Detail Mata Kuliah
**Priority:** P1

**Acceptance Criteria:**
- [ ] Menampilkan: badge "Active Course", nama mata kuliah, chips SKS/dosen/ruangan
- [ ] Seksi "Upcoming Schedule": menampilkan tanggal kuliah berikutnya dan jam
- [ ] Seksi "Recent Tasks": daftar tugas yang terkait course ini (dari `GET /tasks?course_id=X`, difilter client-side)
- [ ] Tombol Edit dan Delete di header

#### FR-COURSE-05: Hapus Mata Kuliah
**Priority:** P0

**Acceptance Criteria:**
- [ ] Dialog konfirmasi
- [ ] `DELETE /courses/{id}` → kembali ke daftar

---

### 5.6 Manajemen Catatan (Notes)

#### FR-NOTE-01: Daftar Catatan + Pencarian
**Priority:** P0

**Acceptance Criteria:**
- [ ] Data diambil via `GET /notes`
- [ ] Search bar di bagian atas: filter real-time berdasarkan judul dan konten (case-insensitive)
- [ ] Setiap kartu catatan menampilkan:
  - Tag mata kuliah atau "General"
  - Label tanggal "Recent"
  - Judul catatan
  - Preview konten (4 baris, overflow ellipsis)
- [ ] State kosong dengan pesan yang sesuai (tidak ada catatan / tidak ada hasil pencarian)

#### FR-NOTE-02: Tambah Catatan
**Priority:** P0

**Acceptance Criteria:**
- [ ] Form memiliki:
  - Dropdown mata kuliah (opsional, dari `GET /courses`)
  - Field judul
  - Textarea konten (multi-line, min 15 baris)
- [ ] Judul dan konten tidak boleh kosong
- [ ] Submit → `POST /notes` → kembali ke daftar

#### FR-NOTE-03: Detail Catatan
**Priority:** P1

**Acceptance Criteria:**
- [ ] Menampilkan: tag course/General, judul, konten lengkap
- [ ] Tombol Edit dan Delete di header

#### FR-NOTE-04: Edit Catatan
**Priority:** P0

**Acceptance Criteria:**
- [ ] Form pre-filled dengan data existing termasuk dropdown course
- [ ] Submit → `PUT /notes/{id}` → kembali ke daftar

#### FR-NOTE-05: Hapus Catatan
**Priority:** P0

**Acceptance Criteria:**
- [ ] Dialog konfirmasi
- [ ] `DELETE /notes/{id}` → kembali ke daftar

---

### 5.7 Profil Pengguna

#### FR-PROFILE-01: Tampilan Profil
**Priority:** P0

**Acceptance Criteria:**
- [ ] Data diambil via `GET /profile`
- [ ] Menampilkan: foto profil (avatar generatif jika tidak ada foto), nama, email
- [ ] Info card: NIM, Semester, Program/Major
- [ ] Menampilkan loading state saat mengambil data
- [ ] Menampilkan error state dengan tombol Retry jika gagal

#### FR-PROFILE-02: Menu Navigasi Profil
**Priority:** P1

**Acceptance Criteria:**
- [ ] Menu item: Edit Profile (placeholder "coming soon"), Settings (placeholder), Notifications (dengan badge)
- [ ] Menu Logout (merah) dengan konfirmasi

#### FR-PROFILE-03: Logout dari Profil
**Priority:** P0

**Acceptance Criteria:**
- [ ] Sama dengan FR-AUTH-03

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

## 8. Tech Stack Recommendation

### 8.1 Backend (New — Web-specific)

| Layer | Teknologi | Alasan |
|---|---|---|
| Language | PHP 8.2+ | Stabilitas, ekosistem mature |
| Framework | Laravel 11 | Routing, ORM, auth, middleware sudah built-in |
| API Style | RESTful JSON API | Konsisten dengan kontrak API yang sudah ada (mobile) |
| Autentikasi | Laravel Sanctum | Token-based auth (Bearer token), cocok untuk SPA + mobile API |
| ORM | Eloquent (built-in Laravel) | Relasi antar model mudah, expressive |
| Database | MySQL / PostgreSQL | Relasional, sesuai struktur data yang ada |
| Validation | Laravel Form Request | Validasi server-side terpusat dan bersih |
| Response Format | Laravel API Resource | Transformasi response JSON yang konsisten |
| CORS | `fruitcake/laravel-cors` (built-in Laravel 11) | Izinkan request dari domain frontend |
| Environment | `.env` via `vlucas/phpdotenv` (built-in) | Konfigurasi per environment |
| Testing | PHPUnit + Pest | Unit & feature testing endpoint |
| Deployment | Laravel Forge / Shared Hosting / VPS | Fleksibel sesuai ketersediaan server |

**Catatan Penting:**
- Backend Laravel web **berbagi database yang sama** dengan backend mobile (atau dapat di-deploy sebagai satu instance Laravel yang melayani keduanya).
- Semua endpoint yang sudah terdefinisi di seksi 7 (API Contracts) diimplementasikan di Laravel menggunakan `routes/api.php`.
- Autentikasi menggunakan **Laravel Sanctum** — token yang dihasilkan kompatibel dengan header `Authorization: Bearer <token>` yang sudah dipakai di mobile app.
- Response envelope harus konsisten: sukses mengembalikan data langsung atau dibungkus key tertentu, error mengembalikan `{ message: "..." }`.

**Contoh Struktur Laravel:**
```
planly-backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   ├── AuthController.php
│   │   │   ├── CourseController.php
│   │   │   ├── TaskController.php
│   │   │   └── NoteController.php
│   │   ├── Requests/
│   │   │   ├── StoreCourseRequest.php
│   │   │   └── StoreTaskRequest.php
│   │   └── Resources/
│   │       ├── CourseResource.php
│   │       ├── TaskResource.php
│   │       └── NoteResource.php
│   └── Models/
│       ├── User.php
│       ├── Course.php
│       ├── Task.php
│       └── Note.php
├── database/migrations/
├── routes/
│   └── api.php
└── config/
    ├── cors.php
    └── sanctum.php
```

---

### 8.2 Frontend (Web App)

| Layer | Teknologi | Alasan |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR/SSG untuk performa, routing built-in |
| Language | TypeScript | Type safety, maintainability |
| Styling | Tailwind CSS + shadcn/ui | Konsisten dengan design system, rapid development |
| State Management | Zustand | Ringan, simple, cocok untuk skala ini |
| Data Fetching | TanStack Query (React Query) | Caching, loading/error states, refetch otomatis |
| Form Handling | React Hook Form + Zod | Validasi, performance |
| HTTP Client | Axios | Interceptors untuk token, error handling |
| Icons | Lucide React | Konsisten, tree-shakeable |
| Font | Inter (Google Fonts) | Sama dengan versi mobile |
| Date Library | date-fns | Ringan, fungsional |
| Deployment | Vercel | CI/CD built-in untuk Next.js |

### 8.3 Konfigurasi Environment Frontend

```env
# .env.local (Next.js)
NEXT_PUBLIC_API_BASE_URL=https://api.planly.com/api
```

Semua request dari frontend diarahkan ke base URL ini, dengan header:
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer <token_dari_sanctum>
```

---

## 9. User Flow Diagram

```
Landing / Splash
    │
    ├── [Punya akun] → Login Page
    │       │
    │       ├── [Sukses] ────────────────────────────────────┐
    │       └── [Gagal] → Error message (tetap di Login)     │
    │                                                         │
    └── [Belum punya akun] → Register Page                   │
            │                                                  │
            ├── [Sukses] → Login Page                         │
            └── [Gagal] → Error message                       │
                                                              ▼
                                                    Main Layout (Authenticated)
                                                    ├── Sidebar Navigation
                                                    │   ├── TODAY (Dashboard)
                                                    │   ├── CALENDAR (Schedule)
                                                    │   ├── TASKS
                                                    │   ├── COURSES
                                                    │   ├── NOTES
                                                    │   └── PROFILE
                                                    │
                                                    └── Content Area
                                                        (halaman aktif sesuai nav)
```

---

## 10. Milestones & Prioritas Pengembangan

### Phase 0 — Backend Setup (Laravel)
1. Inisialisasi proyek Laravel 11
2. Konfigurasi database (migrasi tabel: users, courses, tasks, notes)
3. Setup Laravel Sanctum untuk autentikasi token
4. Implementasi semua endpoint di `routes/api.php`
5. Konfigurasi CORS (`config/cors.php`) untuk domain frontend
6. Testing endpoint dengan Postman / Pest

### Phase 1 — Frontend Core (P0)
7. Setup proyek Next.js + TypeScript + Tailwind + shadcn/ui
8. Konfigurasi Axios (base URL, interceptor token), TanStack Query, Zustand
9. Halaman Login & Register
10. Layout utama (sidebar + topbar + bottom nav mobile)
11. Dashboard (Today's Schedule)
12. CRUD Tasks (lengkap)
13. CRUD Courses (lengkap)

### Phase 2 — Frontend Complete (P1)
14. CRUD Notes + Search
15. Halaman Schedule/Calendar
16. Halaman Profile + Logout
17. Course Detail dengan related tasks

### Phase 3 — Polish (P2)
18. Loading skeletons di semua halaman
19. Error boundaries & 404 page
20. Responsif mobile browser (375px)
21. Animasi transisi halaman
22. Empty states dengan ilustrasi

---

## 11. Open Questions

| # | Pertanyaan | Owner | Status |
|---|---|---|---|
| 1 | Apakah backend Laravel web akan di-deploy sebagai instance terpisah dari backend mobile, atau satu instance yang sama? | Backend Team | Open |
| 2 | Apakah database web dan mobile berbagi instance yang sama? | Backend Team | Open |
| 3 | Apakah ada rencana filter tugas by course dari server (bukan client-side)? | Backend Team | Open |
| 4 | Format penyimpanan token di frontend: httpOnly cookie atau localStorage? | Security Lead | Open |
| 5 | Apakah fitur notifikasi browser akan masuk v1.0 atau v2.0? | Product | Decided: v2.0 |
| 6 | Siapa yang meng-host backend Laravel (shared hosting, VPS, atau Forge)? | DevOps | Open |
| 7 | Versi PHP minimum yang tersedia di server hosting? | DevOps | Open |
