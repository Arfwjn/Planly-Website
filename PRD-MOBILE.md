# PRD & Spesifikasi Integrasi API — Planly Mobile App (Flutter)

**Versi:** 1.0.0  
**Target Platform:** Mobile (Android & iOS)  
**Versi Flutter:** 3.41.7  
**Backend API:** Laravel Sanctum (Stateful / Token Bearer)  
**Bahasa Aplikasi:** Bahasa Indonesia  

---

## 1. Pendahuluan & Ringkasan Eksekutif

Dokumen ini mendefinisikan persyaratan produk (PRD) dan spesifikasi integrasi teknis untuk pengembangan aplikasi mobile **Planly** menggunakan framework **Flutter (v3.41.7)**. Aplikasi mobile ini akan bertindak sebagai klien frontend yang terhubung ke server backend **Laravel** yang sama dengan versi web.

Aplikasi mobile dirancang untuk memberikan pengalaman performa tinggi (native feel), kemudahan akses jadwal kuliah di mana saja, serta memanfaatkan perangkat keras smartphone secara maksimal untuk verifikasi presensi kehadiran berbasis **GPS Radius Check** dan **Face Biometrics (Kamera Depan)**.

---

## 2. Flutter Technical Stack & Dependensi Utama

Untuk menyelaraskan fitur, paritas keamanan, dan integrasi dengan backend Laravel, proyek Flutter diwajibkan menggunakan pustaka-pustaka berikut:

| Kategori | Nama Package | Versi Rekomendasi | Kegunaan Utama |
|---|---|---|---|
| **HTTP Client** | `dio` | `^5.4.0` | Menangani REST API request dengan interceptor Bearer Token & global error handling |
| **State Management**| `flutter_bloc` | `^8.1.3` | Memisahkan logika bisnis (BLoC) dari antarmuka visual (Clean UI) |
| **Secure Storage** | `flutter_secure_storage` | `^9.0.0` | Menyimpan Bearer Token dan Gemini API Key kustom secara aman (Keychain/Keystore) |
| **Local Cache** | `shared_preferences` | `^2.2.0` | Menyimpan flag non-sensitif (preferensi tema gelap/terang, tutorial state, dll.) |
| **Face Biometrics** | `camera` & `google_mlkit_face_detection` | Terbaru | Inisialisasi kamera depan dan deteksi bounding box serta landmark wajah secara real-time |
| **Biometric Matcher**| `tflite_flutter` | `^0.10.0` | Interpreter model FaceNet (TFLite) untuk menghasilkan 128-float descriptor wajah di klien |
| **Location / GPS** | `geolocator` | `^11.0.0` | Mengambil titik koordinat presisi (latitude, longitude) mahasiswa untuk presensi |
| **Math Renderer** | `flutter_math_fork` | `^0.7.2` | Merender ekspresi matematika LaTeX asli (KaTeX) di halaman Catatan Belajar |
| **Audio Processing** | `ffmpeg_kit_flutter` | `^6.0.3` | Mengekstrak trek audio dari video MP4 dan melakukan *down-sampling* ke WAV 16kHz mono |
| **Gemini AI SDK** | `google_generative_ai` | `^0.2.0` | Dart SDK resmi untuk memanggil API Gemini 2.5 Flash secara langsung dari klien |
| **Typography** | `google_fonts` | `^6.1.0` | Pemuatan font Outfit dan Inter secara dinamis untuk konsistensi visual |

---

## 3. Fitur Utama & Spesifikasi UI/UX Mobile

Aplikasi mobile harus mengunci orientasi layar ke **Portrait** (Layar Tegak) demi kestabilan antarmuka kamera dan timeline.

### 3.1. Autentikasi & Rute Terproteksi
- **Form Login & Register**: Field Email, Password, Nama Lengkap, dan NIM. Kolom input NIM harus menggunakan validasi teks berupa angka murni.
- **Token Persistence**: Bearer Token hasil login disimpan di `flutter_secure_storage`. Jika token terdeteksi saat *cold start*, aplikasi langsung masuk ke Dashboard tanpa melewati Splash/Login Screen.
- **Sanctum Interceptor**: Setiap request API menyertakan header `Authorization: Bearer <token>`. Jika server membalas dengan status HTTP 401 (Unauthorized), aplikasi otomatis menghapus token lokal dan melakukan *forced redirect* ke Login Screen.

### 3.2. Dashboard "Hari Ini"
- **Header Status Kuliah**: Menampilkan status real-time ("Sedang Kuliah: [Nama Kelas]" atau "Tidak Ada Kuliah Aktif") dengan membandingkan jam lokal smartphone dengan jam mulai/selesai kelas.
- **Timeline Interaktif**: Daftar kelas khusus hari ini (diambil dari `/courses` difilter sesuai hari berjalan).
  - Kelas masa lalu: Opacity diturunkan (60%), teks dicoret (*strike-through*).
  - Kelas aktif saat ini: Diberi efek bayangan glowing (*pulse indicator*) dan tanda penanda khusus.
  - Kelas mendatang: Menampilkan dot timeline kosong.
- **Global Pomodoro Widget**: Timer countdown Pomodoro (25 menit kerja, 5 menit istirahat) yang tetap berjalan meski pengguna berpindah tab navigasi utama.

### 3.3. Kalender Jadwal (Schedule)
- Strip tanggal 7 hari horizontal (horizontal date strip) yang dapat di-scroll secara menyamping.
- Menampilkan daftar jadwal kuliah dari hari terpilih.
- Opsi untuk menambahkan kelas baru, serta penanda visual khusus untuk kelas yang dibatalkan (*Canceled*) atau dipindahkan (*Rescheduled*).

### 3.4. Manajemen Tugas (Tasks)
- Menampilkan daftar tugas dengan filter kategori mata kuliah dan pengurutan berdasarkan tenggat waktu (*deadline*).
- Form CRUD Tugas mendukung penambahan lampiran berkas (file picker) yang diconvert ke Base64 (Maksimal 1.5MB per berkas).
- Tombol checklist instan untuk merubah tugas menjadi selesai (`PATCH /tasks/{id}/finish`).

### 3.5. Catatan Belajar (Notes)
- Grid layout atau list layout untuk catatan.
- **Editor & Formatting**: Dukungan untuk teks tebal (`**teks**`), miring (`*teks*`), tautan markdown (`[Label](URL)`), dan block LaTeX matematika (`$$rumus$$`).
- **LaTeX Math Renderer**: Rumus LaTeX multiline maupun inline wajib dirender secara rapi menggunakan library `flutter_math_fork` agar terbaca seperti rumus matematika asli pada tab Pratinjau.
- **Direct-to-Link**: Tautan markdown harus dirender sebagai tombol pill yang dapat diklik langsung untuk membuka browser eksternal menggunakan `url_launcher`.

### 3.6. Asisten Kuliah AI (AI Companion)
- **Kompresi WAV di Klien**: Pengguna mengunggah rekaman video kuliah (MP4). Aplikasi menggunakan `ffmpeg_kit_flutter` untuk mengekstrak audio ke berkas WAV mono 16kHz lokal.
- **Pipeline Gemini 2.5 Flash**: Mengunggah WAV Base64 ke API Gemini dengan instruksi prompt terstruktur (RAG) untuk mendapatkan hasil transkrip bertimestamp, bab perkuliahan, dan ringkasan pengayaan materi akademik.
- **Reset Chat**: Opsi menghapus riwayat obrolan asisten AI.
- **Simpan ke Catatan**: Pengecekan hasil kompresi AI dan penyimpanannya ke dalam Catatan Belajar secara otomatis dengan struktur penulisan markdown bersih.

---

## 4. Spesifikasi Integrasi REST API (Laravel Backend)

Seluruh endpoint REST API di bawah ini harus dikonsumsi oleh aplikasi mobile Flutter.

### 4.1. Kategori: Autentikasi (Authentication)

#### 1. Register Akun Baru
- **Endpoint:** `POST /auth/register`
- **Request Body:**
  ```json
  {
    "name": "Nama Lengkap Mahasiswa",
    "email": "mahasiswa@domain.com",
    "password": "securepassword123",
    "password_confirmation": "securepassword123",
    "nim": "STI2023XXXX"
  }
  ```
- **Response (Success 201):**
  ```json
  {
    "message": "Pendaftaran berhasil",
    "user": {
      "id": 1,
      "name": "Nama Lengkap Mahasiswa",
      "email": "mahasiswa@domain.com",
      "nim": "STI2023XXXX",
      "major": null,
      "semester": null,
      "profile_photo_url": null
    }
  }
  ```

#### 2. Login User
- **Endpoint:** `POST /auth/login`
- **Request Body:**
  ```json
  {
    "email": "mahasiswa@domain.com",
    "password": "securepassword123"
  }
  ```
- **Response (Success 200):**
  ```json
  {
    "token": "1|sanctum_token_hash_value_here",
    "user": {
      "id": 1,
      "name": "Nama Lengkap Mahasiswa",
      "email": "mahasiswa@domain.com",
      "nim": "STI2023XXXX",
      "semester": 4,
      "major": "Teknik Informatika",
      "profile_photo_url": null,
      "gpa_current": 3.75,
      "gpa_target": 3.85,
      "target_study_hours": 3,
      "address": "Alamat Mahasiswa"
    }
  }
  ```

#### 3. Logout
- **Endpoint:** `POST /logout`
- **Headers:** `Authorization: Bearer <token>`
- **Response (Success 200):**
  ```json
  {
    "message": "Berhasil logout"
  }
  ```

---

### 4.2. Kategori: Profil Pengguna (Profile)

#### 1. Ambil Profil Aktif
- **Endpoint:** `GET /profile`
- **Headers:** `Authorization: Bearer <token>`
- **Response (Success 200):**
  ```json
  {
    "id": 1,
    "name": "Nama Lengkap Mahasiswa",
    "email": "mahasiswa@domain.com",
    "nim": "STI2023XXXX",
    "semester": 4,
    "major": "Teknik Informatika",
    "profile_photo_url": "data:image/jpeg;base64,...",
    "gpa_current": 3.75,
    "gpa_target": 3.85,
    "target_study_hours": 3,
    "address": "Alamat Lengkap"
  }
  ```

#### 2. Update Profil
- **Endpoint:** `POST /profile/update`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body (Partial support):**
  ```json
  {
    "name": "Nama Baru",
    "nim": "NIM_BARU",
    "major": "Teknik Informatika",
    "semester": 4,
    "gpa_current": 3.75,
    "gpa_target": 3.90,
    "target_study_hours": 4,
    "address": "Alamat Baru",
    "profile_photo_url": "data:image/jpeg;base64,..."
  }
  ```
- **Response (Success 200):** Mengembalikan data `User` yang diperbarui.

---

### 4.3. Kategori: Mata Kuliah (Courses)

#### 1. Ambil Daftar Mata Kuliah
- **Endpoint:** `GET /courses`
- **Headers:** `Authorization: Bearer <token>`
- **Response (Success 200):**
  ```json
  [
    {
      "id": 1,
      "user_id": 1,
      "course_code": "STI2026",
      "course_name": "Kecerdasan Buatan",
      "sks": 3,
      "lecturer_name": "Dosen Informatika M.T.",
      "room": "Lantai 3 Lab B",
      "day_of_week": "Monday",
      "start_time": "08:00",
      "end_time": "10:30",
      "color_hex": "#6366F1"
    }
  ]
  ```

#### 2. Tambah Mata Kuliah
- **Endpoint:** `POST /courses`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "course_code": "STI2026",
    "course_name": "Kecerdasan Buatan",
    "sks": 3,
    "lecturer_name": "Dosen Informatika M.T.",
    "room": "Lantai 3 Lab B",
    "day_of_week": "Monday",
    "start_time": "08:00",
    "end_time": "10:30",
    "color_hex": "#6366F1"
  }
  ```
- **Response (Success 201):** Mengembalikan objek `Course` yang baru dibuat.

#### 3. Update & Delete Mata Kuliah
- **Update:** `PUT /courses/{id}` (Body sama seperti request POST)
- **Delete:** `DELETE /courses/{id}`
  - *Catatan:* Endpoint delete ini akan secara cascade menghapus seluruh Tugas, Catatan, Absensi, dan Reschedules yang berelasi dengan mata kuliah tersebut di database.

---

### 4.4. Kategori: Tugas Kuliah (Tasks)

#### 1. Ambil Semua Tugas
- **Endpoint:** `GET /tasks`
- **Headers:** `Authorization: Bearer <token>`
- **Response (Success 200):**
  ```json
  [
    {
      "id": 12,
      "user_id": 1,
      "course_id": 1,
      "course_code": "STI2026",
      "course_name": "Kecerdasan Buatan",
      "task_title": "Implementasi BFS & DFS",
      "description": "Tulis kode dalam bahasa Dart/Python...",
      "deadline_date": "2026-06-20",
      "deadline_time": "23:59:00",
      "priority": "high",
      "is_finished": false,
      "attachments": [
        {
          "name": "tugas_1.pdf",
          "type": "application/pdf",
          "size": 14520,
          "data_url": "data:application/pdf;base64,..."
        }
      ]
    }
  ]
  ```

#### 2. Tambah Tugas Baru
- **Endpoint:** `POST /tasks`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "course_id": 1,
    "task_title": "Implementasi BFS & DFS",
    "description": "Penjelasan tugas...",
    "deadline_date": "2026-06-20",
    "deadline_time": "23:59:00",
    "priority": "high",
    "attachments": []
  }
  ```
- **Response (Success 201):** Mengembalikan objek `Task` baru.

#### 3. Ubah Status Tugas (Finish)
- **Endpoint:** `PATCH /tasks/{id}/finish`
- **Headers:** `Authorization: Bearer <token>`
- **Response (Success 200):**
  ```json
  {
    "id": 12,
    "is_finished": true
  }
  ```

---

### 4.5. Kategori: Catatan Belajar (Notes)

#### 1. Ambil Semua Catatan
- **Endpoint:** `GET /notes`
- **Headers:** `Authorization: Bearer <token>`
- **Response (Success 200):**
  ```json
  [
    {
      "id": 5,
      "user_id": 1,
      "course_id": 1,
      "course_name": "Kecerdasan Buatan",
      "title": "Ringkasan Pertemuan 1 - Pengenalan AI",
      "content": "Isi catatan bertipe Markdown...",
      "attachments": []
    }
  ]
  ```

#### 2. Tambah Catatan Baru
- **Endpoint:** `POST /notes`
- **Request Body:**
  ```json
  {
    "course_id": 1,
    "title": "Ringkasan Pertemuan 1",
    "content": "Isi Catatan...",
    "attachments": []
  }
  ```

---

### 4.6. Kategori: Jadwal Ulang (Reschedules)

#### 1. Buat Batal / Pindah Kelas
- **Endpoint:** `POST /reschedules`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "course_id": 1,
    "original_date": "2026-06-15",
    "is_canceled": false,
    "new_date": "2026-06-16",
    "new_start_time": "13:00",
    "new_end_time": "15:30",
    "note": "Kelas digeser ke hari Selasa siang karena dosen dinas luar kota"
  }
  ```
  *(Jika kelas dibatalkan total tanpa ganti hari, set "is_canceled" ke `true`, serta set "new_date", "new_start_time", dan "new_end_time" ke `null`)*.

#### 2. Kembalikan Jadwal ke Normal (Delete Reschedule)
- **Endpoint:** `DELETE /reschedules/{course_id}/{original_date}`
- **Headers:** `Authorization: Bearer <token>`
- **Response (Success 200):**
  ```json
  {
    "message": "Jadwal kuliah berhasil dikembalikan ke normal"
  }
  ```

---

### 4.7. Kategori: Presensi & Absensi (Attendance)

#### 1. Mengirim Data Presensi (Check-in)
- **Endpoint:** `POST /attendance`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "course_id": 1,
    "course_code": "STI2026",
    "course_name": "Kecerdasan Buatan",
    "date": "2026-06-15",
    "time": "08:05:12",
    "status": "Hadir",
    "latitude": -7.4244,
    "longitude": 109.2301,
    "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  }
  ```
- **Response (Success 201):**
  ```json
  {
    "id": 8,
    "user_id": 1,
    "course_id": 1,
    "course_code": "STI2026",
    "course_name": "Kecerdasan Buatan",
    "date": "2026-06-15",
    "time": "08:05:12",
    "status": "Hadir",
    "latitude": -7.4244,
    "longitude": 109.2301,
    "image_base64": "data:image/jpeg;base64,...",
    "verified_face": true
  }
  ```

---

## 5. Implementasi Protokol Pemindaian Wajah & Validasi GPS Mobile

Verifikasi kehadiran pada aplikasi Flutter berjalan dengan alur presisi berikut:

### 5.1. Pendaftaran Wajah (Face Enrollment)
1. Mahasiswa masuk ke halaman **Profil** -> **Daftarkan Wajah**.
2. Aplikasi meminta izin akses Kamera.
3. Kamera depan diinisialisasi dalam format lingkaran (*circular preview*).
4. Aplikasi menggunakan `google_mlkit_face_detection` untuk mendeteksi keberadaan wajah di frame kamera secara real-time.
5. Jika wajah terdeteksi tegak lurus dan stabil:
   - Aplikasi memotong gambar wajah (*cropped face image*) ke resolusi 112x112 piksel.
   - Pustaka `tflite_flutter` dengan model **FaceNet.tflite** memproses gambar tersebut untuk mengekstrak array berisi **128-float values (face descriptor)**.
   - String JSON hasil *stringified* array descriptor disimpan ke `flutter_secure_storage` dengan kunci `planly_registered_face`.
   - Foto thumbnail Base64 disimpan dengan kunci `planly_registered_face_photo`.

### 5.2. Pemindaian Presensi (Attendance Check-in)
1. Saat absensi dibuka di dasbor:
   - Aplikasi melakukan pengecekan apakah data `planly_registered_face` tersedia di `flutter_secure_storage`. Jika tidak ada, mahasiswa diblokir dan diarahkan untuk melakukan pendaftaran wajah terlebih dahulu.
2. Kamera depan menyala. Mahasiswa melakukan pemindaian wajah.
3. Model ML Kit mendeteksi keselarasan wajah. TensorFlow Lite mengekstrak 128-float descriptor wajah saat ini.
4. **Euclidean Distance Math Check**:
   Aplikasi menghitung jarak matematis Euclidean antara descriptor wajah saat ini ($A$) dengan descriptor wajah terdaftar ($B$):
   
   $$d(A, B) = \sqrt{\sum_{i=1}^{128} (A_i - B_i)^2}$$
   
   - Jika nilai $d \le 0.6$ -> Wajah diverifikasi **Cocok (verified_face = true)**.
   - Jika nilai $d > 0.6$ -> Wajah **Tidak Cocok**, pemindaian gagal dan absensi diblokir.
5. **GPS Geofencing Proximity Check**:
   - Pustaka `geolocator` mengambil koordinat GPS mahasiswa.
   - Sistem membandingkannya dengan koordinat target gedung kelas (dikirimkan dari metadata kuliah).
   - Jarak dihitung menggunakan rumus *Haversine* di sisi klien. Jika mahasiswa berada di luar radius toleransi aman (misal: lebih dari 50 meter dari koordinat kelas), absensi dilarang.
6. Jika Wajah Cocok dan GPS berada dalam radius, tombol **"Kirim Presensi Kehadiran"** diaktifkan, dan mengirimkan payload absensi ke `POST /attendance`.

---

## 6. Integrasi Gemini AI & Downsampling Audio di Mobile

Fitur **Asisten Kuliah AI (AI Companion)** memproses rekaman kuliah langsung di smartphone:

### 6.1. Ekstraksi Trek Audio (FFmpeg)
1. Pengguna memilih rekaman kuliah format MP4 dari media storage.
2. Aplikasi memicu `ffmpeg_kit_flutter` untuk mengekstrak audio menggunakan command:
   ```bash
   -i input.mp4 -vn -ar 16000 -ac 1 -c:a pcm_s16le output.wav
   ```
   *Penjelasan:* Mengonversi video ke format audio WAV mono berfrekuensi 16000Hz dengan encoding PCM 16-bit. Langkah kompresi ini memangkas ukuran biner file secara ekstrem agar hemat kuota internet mahasiswa.

### 6.2. Komunikasi ke API Gemini
1. Berkas WAV dikonversi ke format Base64.
2. Menggunakan pustaka `google_generative_ai` (atau HTTP post langsung ke `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_KEY`), mengirimkan payload audio beserta instruksi context system.
3. Kunci API Gemini menggunakan `planly_gemini_api_key` dari `flutter_secure_storage` jika diatur kustom oleh user. Jika saklar toggle "Kunci Bawaan" aktif, aplikasi boleh menggunakan fallback key sistem.
4. Gemini mengembalikan format JSON terstruktur (Bab, Rangkuman, Transkrip bertimestamp) sesuai format di bagian **9.3 API.md**.
5. Klien Flutter membaca JSON tersebut dan menyimpannya secara lokal ke database SQLite (atau Hive) di bawah model `planly_ai_sessions`.

### 6.3. Sinkronisasi Penyimpanan Catatan
Saat tombol **"Simpan ke Catatan"** diklik:
1. Flutter menyusun teks catatan markdown yang menggabungkan judul kuliah, bab pembahasan, key takeaways, dan pengayaan materi.
2. Rumus matematika LaTeX dibungkus rapi dalam tag `$$` satu baris agar parser `flutter_math_fork` dapat merendernya dengan mulus tanpa merusak spasi.
3. Tautan markdown dibungkus dalam format `[Nama Referensi](URL)`.
4. Mengirimkan payload JSON tersebut via `POST /notes` untuk disinkronkan ke server API Laravel secara persisten.

---
