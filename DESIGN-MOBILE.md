# Panduan Desain Antarmuka & UX Mobile — Planly (Flutter)

**Versi:** 1.0.0  
**Target Platform:** Mobile (Android & iOS)  
**Versi Flutter:** 3.41.7  
**Tema Utama:** Sleek Modern, Glassmorphism-inspired, Rich Aesthetics (Light & Dark Mode)  
**Bahasa Aplikasi:** Bahasa Indonesia  

---

## 1. Filosofi Desain & Grid System

Aplikasi mobile **Planly** mengadopsi prinsip desain yang bersih (*clean*), berestetika premium (*rich aesthetics*), dan konsisten dengan antarmuka web. 

### Prinsip Utama
1. **8px Grid System** — Semua dimensi komponen, margin, padding, dan jarak vertikal/horizontal harus mematuhi kelipatan 8px (4px, 8px, 16px, 24px, 32px) untuk menjamin kerapian layout di berbagai kepadatan layar (DPI).
2. **Glassmorphism & Soft Gradients** — Memanfaatkan efek transparansi blur (*backdrop filter*) dan gradasi warna yang halus untuk memberikan kesan aplikasi modern dan premium.
3. **Micro-Interactions & Reaktif** — Setiap tombol dan interaksi input wajib memberikan respons visual (seperti perubahan skala ukuran atau translasi mikro) demi meningkatkan kenyamanan pengguna.
4. **Portrait Lock** — Seluruh tampilan dikunci secara ketat pada orientasi tegak (*portrait*) untuk menjaga konsistensi area bidik kamera absensi biometrik.

---

## 2. Design System di Flutter

Guna mempermudah pengembangan di Flutter, seluruh nilai token visual di bawah ini harus dipetakan ke dalam kelas utilitas Dart.

### 2.1. Skema Warna (Color Palette)
Gunakan pemetaan warna berikut di dalam berkas kelas Dart `AppColors` atau diintegrasikan ke dalam `ThemeData` Flutter:

```dart
import 'package:flutter/material.dart';

class AppColors {
  // === Warna Inti (Core Colors) ===
  static const Color primary = Color(0xFF4F46E5);          // Indigo — warna tombol utama, aksen aktif
  static const Color primaryContainer = Color(0xFFE0E7FF); // Background chip/badge primary
  static const Color secondary = Color(0xFF64748B);        // Teks sekunder, ikon redup
  static const Color secondaryContainer = Color(0xFFF1F5F9); // Background item abu-abu terang

  // === Warna Latar (Light Mode Surface) ===
  static const Color bgLight = Color(0xFFF8FAFC);          // Latar belakang halaman utama
  static const Color surfaceLight = Color(0xFFFFFFFF);     // Kartu utama, dialog modal
  static const Color surfaceLowLight = Color(0xFFF1F5F9);  // Item tersier
  static const Color outlineLight = Color(0xFFE2E8F0);     // Border kartu, pembatas tipis

  // === Warna Latar (Dark Mode Surface) ===
  static const Color bgDark = Color(0xFF0F172A);           // Latar belakang halaman utama (Slate 900)
  static const Color surfaceDark = Color(0xFF1E293B);      // Kartu utama, dialog modal (Slate 800)
  static const Color surfaceLowDark = Color(0xFF334155);   // Item tersier (Slate 700)
  static const Color outlineDark = Color(0xFF1E293B);      // Border kartu (Slate 800)

  // === Teks ===
  static const Color textLightPrimary = Color(0xFF1E293B);  // Teks utama light mode
  static const Color textLightSecondary = Color(0xFF64748B);// Teks pembantu light mode
  static const Color textDarkPrimary = Color(0xFFF1F5F9);   // Teks utama dark mode
  static const Color textDarkSecondary = Color(0xFF94A3B8);  // Teks pembantu dark mode

  // === Warna Semantik (Semantic Colors) ===
  static const Color error = Color(0xFFBA1A1A);            // Merah — error, overdue, tombol hapus
  static const Color errorContainer = Color(0xFFFFDADC);   // Background badge error
  static const Color success = Color(0xFF16A34A);          // Hijau — presensi hadir, tugas selesai
  static const Color successContainer = Color(0xFFDCFCE7);  // Background badge sukses
  static const Color warning = Color(0xFFD97706);          // Jingga — kelas dipindahkan, belum presensi
  static const Color warningContainer = Color(0xFFFEF3C7);  // Background badge warning
}
```

### 2.2. Tipografi (Typography)
Tipografi mobile Planly wajib menggunakan **Google Fonts** dengan dua jenis font utama:
1. **Outfit** — Digunakan khusus untuk Judul Halaman Utama, Header Tab, Angka Kalender, dan Teks Besar (Bold/Black).
2. **Inter** — Digunakan untuk Teks Body, Form Label, Deskripsi Tugas/Catatan, Chatbot AI, dan Teks Menu.

Penerapan skala teks di Flutter `TextTheme`:
- **Display Large**: `Outfit`, size 30px, Bold (Judul Halaman Utama)
- **Title Large**: `Outfit`, size 20px, SemiBold (Judul Kartu, Header Section)
- **Body Large**: `Inter`, size 16px, Regular/Medium (Teks Utama, Konten Catatan)
- **Body Medium**: `Inter`, size 14px, Regular (Deskripsi Tugas, Teks Sub-Header)
- **Label Small**: `Inter`, size 12px, SemiBold/Bold (Chip Badge, Caption, Status Waktu)

### 2.3. Radius Sudut (Border Radius Presets)
Guna mencerminkan kesan rounded-fluid yang premium di smartphone, gunakan presets berikut:
- `radiusSm` = `BorderRadius.circular(8.0)` — Digunakan untuk input text field, preset tombol warna.
- `radiusMd` = `BorderRadius.circular(12.0)` — Digunakan untuk tombol utama, chip badge, checklist kotak.
- `radiusLg` = `BorderRadius.circular(16.0)` — Digunakan untuk kartu tugas, kartu kelas, timeline item.
- `radiusXl` = `BorderRadius.circular(24.0)` — Digunakan untuk Modal Bottom Sheet (slide-up dialog), kartu dialog profil.

---

## 3. Navigasi & Tata Letak (Layout) Mobile

Aplikasi Flutter Planly menerapkan struktur navigasi bertipe **Bottom Navigation Bar** yang terintegrasi dengan state router.

### 3.1. Bottom Navigation Bar Structure
Menampilkan 5 menu utama dengan susunan:
```
┌───────────────────────────────────────────────┐
│  [○]        [○]        [○]        [○]     [○]  │
│ Today    Calendar     Tasks      Notes   Profile│
└───────────────────────────────────────────────┘
```
- **Aesthetic Specs**:
  - Tinggi bar: 66px.
  - Background: Blur akrilik semi transparan (`ClipRect` + `BackdropFilter` filter blur 10.0) dengan opacity background 90% (`white.withOpacity(0.9)` atau `bgDark.withOpacity(0.9)`).
  - Indikator Aktif: Ikon membesar (`scale: 1.15`), berubah warna menjadi `AppColors.primary`, dan memunculkan garis pill tipis (3px) berwarna primary di bagian bawah ikon yang aktif.

### 3.2. Modal Bottom Sheet (Slide-Up Panel)
Setiap kali ada aksi penambahan data (Tambah Kelas, Tambah Tugas, Konfigurasi API Key), gunakan **Modal Bottom Sheet** yang meluncur dari bawah layar:
- Sudut atas dibulatkan secara ekstrem (`radiusXl` -> 24px).
- Disediakan bilah pegangan abu-abu (*drag handle*) berukuran 40px x 4px di bagian atas modal.
- Latar belakang tertutup oleh scrim hitam transparan (opacity 40%).

---

## 4. Spesifikasi Desain Layar & Komponen

### 4.1. Dashboard "Hari Ini" (TodayScreen)
- **Header Section**:
  - Menampilkan waktu lokal jam aktif yang berjalan dinamis (detik ter-update).
  - Teks sapaan interaktif, contoh: "Halo, Arief Sidik 👋".
- **Bento Stats Card Grid**:
  - Grid 2 kolom berisi kartu kecil berdesain minimalis.
  - Kartu Kiri: "Tugas Tertunda" menampilkan angka besar tebal warna merah `AppColors.error`.
  - Kartu Kanan: "Fokus Pomodoro" menampilkan countdown menit saat ini beserta tombol play/pause mini.
- **Timeline Kelas**:
  - Kelas didesain berjejer vertikal dihubungkan oleh garis vertikal 2px berwarna `AppColors.outlineLight`.
  - Kartu kelas aktif harus diberi **glowing shadow**:
    ```dart
    BoxShadow(
      color: AppColors.primary.withOpacity(0.15),
      blurRadius: 16,
      spreadRadius: 2,
      offset: Offset(0, 4),
    )
    ```

### 4.2. Kalender Jadwal (ScheduleScreen)
- **Horizontal Date Strip**:
  - Container berisi 7 hari yang dapat di-slide menyamping.
  - Hari terpilih memiliki background `AppColors.primary` dengan teks putih. Hari lainnya berwarna abu-abu dengan deteksi hari kuliah aktif ditandai dot kecil di bawah angka tanggal.
- **Alert Reschedule & Canceled**:
  - Kelas dibatalkan: Diberi badge merah tipis "Batal" dan garis coret pada nama mata kuliah.
  - Kelas dipindahkan: Diberi badge kuning "Pindah Jadwal" dan menampilkan informasi tanggal/jam pengganti dengan ikon `InfoOutline`.

### 4.3. Catatan Belajar (NotesScreen)
- **Masonry Layout**: Menyajikan daftar catatan dalam 2 kolom staggered grid (tinggi kartu dinamis mengikuti panjang judul/konten) untuk menghindari kekosongan ruang.
- **Visualisasi Formula LaTeX**:
  - Pustaka `flutter_math_fork` merender baris `$$` ke bentuk ekspresi visual terpusat (display mode) dengan format background kartu rumus abu-abu soft (`AppColors.surfaceLowLight`).
- **Pill Direct-to-Link**:
  - Tautan URL markdown dikonversi menjadi tombol berbentuk kapsul (pill button) dengan warna background indigo lembut, teks label tebal, dan ikon panah miring `launch` di sebelah kanan teks.

### 4.4. Area Pendaftaran Wajah (Face Enrollment UI)
Tampilan saat mendaftarkan descriptor wajah di smartphone wajib mematuhi panduan visual berikut:

```
┌──────────────────────────────────────────┐
│              [ X ] Batal                 │
├──────────────────────────────────────────┤
│                                          │
│                .------.                  │
│               /        \                 │
│              |  Kamera  |                │
│              |  Depan   |                │
│               \        /                 │
│                '------'                  │
│             [=== Laser ===]              │
│                                          │
├──────────────────────────────────────────┤
│      Posisikan wajah Anda di tengah      │
│      [====================] 75%          │
└──────────────────────────────────────────┘
```
- **Circular Camera Frame**: Video feed dari kamera depan dibungkus dalam lingkaran sirkular (diameter 260px) di tengah layar dengan efek border neon tipis `AppColors.primary`.
- **Corner Brackets**: Gambar 4 sudut siku-siku (L-shape brackets) presisi mengelilingi lingkaran kamera, memberikan panduan letak wajah yang ideal bagi mahasiswa.
- **Laser Scanning Animation**: Garis laser hijau semi-transparan horizontal meluncur naik-turun secara berulang (*looping*) melewati area lingkaran kamera selama status pemindaian aktif.
- **Progress Ring / Bar**: Linear progress bar di bagian bawah kamera menampilkan persentase keselarasan wajah (ML Kit output) dari 0% hingga 100%.

### 4.5. Asisten AI & Tanya Jawab (AI Companion UI)
- **Video Player Panel**: Player video di sepertiga atas layar (aspek rasio 16:9) dengan bar kontrol waktu (*seek bar*) yang sinkron dengan timestamps transkrip.
- **RAG Chat Bubble**:
  - Pesan Mahasiswa: Dikirim ke kanan, gelembung berwarna `AppColors.primary`, teks putih, dengan sudut kanan atas runcing (radius 16px kecuali kanan atas 4px).
  - Pesan Asisten AI: Berada di kiri, gelembung berwarna putih (atau slate 800 pada mode gelap), teks utama hitam/putih, dengan sudut kiri atas runcing.
- **Reset Chat Button**: Tombol melingkar `RotateCcw` mini berwarna redup diletakkan di sisi kiri text input bar untuk memberikan opsi pembersihan obrolan yang cepat.

---

## 5. Animasi & Transisi Mikro (Micro-Interactions)

### 5.1. Animasi Tekan Tombol (Bounce & Scale Feedback)
Setiap tombol interaktif di Flutter wajib dibungkus dengan widget detektor gestur kustom yang menghasilkan animasi membal (*bounce*) saat disentuh:
- Ketika ditekan (*onTapDown*) -> Skala tombol mengecil secara halus ke `0.96`.
- Ketika dilepas (*onTapUp/onTapCancel*) -> Skala kembali ke `1.0`.
- Durasi transisi: 120ms menggunakan kurva `Curves.easeInOut`.

### 5.2. Animasi Empty State (Icon Float & Translation)
Saat data kosong dan komponen `InteractiveEmptyState` dipanggil:
- Ikon utama di tengah melakukan animasi mengambang naik-turun perlahan secara otomatis (*continuous floating animation*) sejauh 6px menggunakan `AnimationController` berulang.
- Tombol aksi (CTA) di dalam empty state memicu rotasi ikon di dalamnya (misal ikon `Plus` berputar 90 derajat) secara mulus saat tombol tersebut disentuh atau ditekan oleh mahasiswa.

### 5.3. Transisi Antar Layar (Page Transitions)
Navigasi antar halaman utama bottom bar menggunakan transisi **Fade-in** yang instan tanpa slide untuk menjaga kecepatan perpindahan tab. Navigasi menuju halaman detail (Detail Tugas, Detail Catatan, Pendaftaran Wajah) menggunakan transisi **Slide-Left** (meluncur dari sisi kanan ke kiri) dengan kurva interpolasi gerak cepat `Curves.fastOutSlowIn`.

---
