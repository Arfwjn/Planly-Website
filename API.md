# Dokumentasi REST API — Planly

Dokumentasi ini menjelaskan endpoint-endpoint REST API yang digunakan oleh aplikasi **Planly** untuk sinkronisasi data dengan server backend Laravel.

## Deskripsi Umum

* **Base URL**: `http://localhost:8000/api`
* **Format Request/Response**: `application/json`
* **Autentikasi**: Menggunakan Laravel Sanctum. Bearer Token harus disertakan pada Header untuk mengakses semua endpoint privat (selain Register dan Login).

```txt
Authorization: Bearer <your_access_token>
```

---

## Ringkasan Endpoint

| No | Kategori | Method | Endpoint | Keterangan |
|---|---|---|---|---|
| **1** | **Auth** | `POST` | `/auth/register` | Pendaftaran akun baru |
| **2** | **Auth** | `POST` | `/auth/login` | Masuk ke sistem & mendapatkan token |
| **3** | **Auth** | `POST` | `/logout` | Keluar dari sistem & menghapus token |
| **4** | **Profile** | `GET` | `/profile` | Mengambil data profil user aktif |
| **5** | **Profile** | `POST` | `/profile/update` | Memperbarui data profil akademik user |
| **6** | **Courses** | `GET` | `/courses` | Mengambil seluruh mata kuliah |
| **7** | **Courses** | `POST` | `/courses` | Mendaftarkan mata kuliah baru |
| **8** | **Courses** | `GET` | `/courses/{id}` | Mengambil detail mata kuliah |
| **9** | **Courses** | `PUT` | `/courses/{id}` | Memperbarui data mata kuliah |
| **10** | **Courses** | `DELETE` | `/courses/{id}` | Menghapus mata kuliah (Cascade delete) |
| **11** | **Tasks** | `GET` | `/tasks` | Mengambil semua tugas kuliah |
| **12** | **Tasks** | `POST` | `/tasks` | Menambahkan tugas baru (Mendukung lampiran) |
| **13** | **Tasks** | `GET` | `/tasks/{id}` | Mengambil detail tugas tertentu |
| **14** | **Tasks** | `PUT` | `/tasks/{id}` | Memperbarui data/lampiran tugas |
| **15** | **Tasks** | `PATCH` | `/tasks/{id}/finish` | Mengubah status checklist selesai tugas |
| **16** | **Tasks** | `DELETE` | `/tasks/{id}` | Menghapus tugas |
| **17** | **Notes** | `GET` | `/notes` | Mengambil semua catatan materi |
| **18** | **Notes** | `POST` | `/notes` | Menulis catatan baru (Mendukung lampiran) |
| **19** | **Notes** | `GET` | `/notes/{id}` | Mengambil detail catatan tertentu |
| **20** | **Notes** | `PUT` | `/notes/{id}` | Memperbarui data/lampiran catatan |
| **21** | **Notes** | `DELETE` | `/notes/{id}` | Menghapus catatan |
| **22** | **Events** | `GET` | `/events` | Mengambil seluruh event kampus |
| **23** | **Events** | `POST` | `/events` | Menambahkan event baru |
| **24** | **Events** | `PUT` | `/events/{id}` | Memperbarui data event |
| **25** | **Events** | `DELETE` | `/events/{id}` | Menghapus event |
| **26** | **Reschedules** | `GET` | `/reschedules` | Mengambil seluruh jadwal pindahan/batal |
| **27** | **Reschedules** | `POST` | `/reschedules` | Membuat jadwal pindah/batal kelas |
| **28** | **Reschedules** | `DELETE` | `/reschedules/{course_id}/{original_date}` | Mengembalikan jadwal kelas ke normal |
| **29** | **Attendance** | `GET` | `/attendance` | Mengambil seluruh riwayat absensi masuk |
| **30** | **Attendance** | `POST` | `/attendance` | Mengirim presensi wajah (Base64) & GPS |
| **31** | **Attendance** | `DELETE` | `/attendance/{id}` | Menghapus riwayat absensi |

---

# 1. Authentication API

## Register User
Mendaftarkan akun baru mahasiswa ke dalam sistem.

* **URL**: `/auth/register`
* **Method**: `POST`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "name": "Arief Sidik Wijayanto",
    "email": "arfwjn@gmail.com",
    "password": "ariefsidikpassword",
    "password_confirmation": "ariefsidikpassword",
    "nim": "STI202303494"
  }
  ```
* **Response (Success 201)**:
  ```json
  {
    "message": "Pendaftaran berhasil",
    "user": {
      "id": 1,
      "name": "Arief Sidik Wijayanto",
      "email": "arfwjn@gmail.com",
      "nim": "STI202303494",
      "major": null,
      "semester": null,
      "profile_photo_url": "https://lh3.googleusercontent.com/aida-public/..."
    }
  }
  ```

---

## Login User
Melakukan proses masuk akun dan mengambil token akses Sanctum.

* **URL**: `/auth/login`
* **Method**: `POST`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "email": "arfwjn@gmail.com",
    "password": "ariefsidikpassword"
  }
  ```
* **Response (Success 200)**:
  ```json
  {
    "token": "1|laravel_sanctum_token_hash_here",
    "user": {
      "id": 1,
      "name": "Arief Sidik Wijayanto",
      "email": "arfwjn@gmail.com",
      "nim": "STI202303494",
      "semester": 4,
      "major": "Teknik Informatika",
      "profile_photo_url": "https://lh3.googleusercontent.com/aida-public/...",
      "gpa_current": 3.75,
      "gpa_target": 3.85,
      "target_study_hours": 3,
      "address": "Purwokerto, Jawa Tengah"
    }
  }
  ```

---

## Logout User
Mengakhiri sesi token aktif di server.

* **URL**: `/logout`
* **Method**: `POST`
* **Headers**: 
  * `Content-Type: application/json`
  * `Authorization: Bearer <token>`
* **Response (Success 200)**:
  ```json
  {
    "message": "Berhasil logout"
  }
  ```

---

# 2. Profile API

## Get Profile
Mengambil data profil mahasiswa yang sedang masuk sesi.

* **URL**: `/profile`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>`
* **Response (Success 200)**:
  ```json
  {
    "id": 1,
    "name": "Arief Sidik Wijayanto",
    "email": "arfwjn@gmail.com",
    "nim": "STI202303494",
    "semester": 6,
    "major": "Teknik Informatika",
    "profile_photo_url": "https://lh3.googleusercontent.com/aida-public/...",
    "gpa_current": 3.60,
    "gpa_target": 3.80,
    "target_study_hours": 2,
    "address": "Purwokerto, Jawa Tengah"
  }
  ```

---

## Update Profile
Memperbarui data diri mahasiswa dan target belajarnya.

* **URL**: `/profile/update`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
  ```json
  {
    "name": "Arief Sidik Wijayanto",
    "nim": "STI202303494",
    "semester": 6,
    "major": "Teknik Informatika",
    "gpa_current": 3.60,
    "gpa_target": 3.80,
    "target_study_hours": 2,
    "address": "Purwokerto, Jawa Tengah"
  }
  ```
* **Response (Success 200)**:
  ```json
  {
    "id": 1,
    "name": "Arief Sidik Wijayanto",
    "email": "arfwjn@gmail.com",
    "nim": "STI202303494",
    "semester": 6,
    "major": "Teknik Informatika",
    "profile_photo_url": "https://lh3.googleusercontent.com/aida-public/...",
    "gpa_current": 3.60,
    "gpa_target": 3.80,
    "target_study_hours": 2,
    "address": "Purwokerto, Jawa Tengah"
  }
  ```

---

# 3. Courses API

## Get All Courses
Mengambil daftar seluruh mata kuliah mahasiswa terdaftar.

* **URL**: `/courses`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>`
* **Response (Success 200)**:
  ```json
  [
    {
      "id": 1,
      "user_id": 1,
      "course_code": "SWU001",
      "course_name": "Website Programming Lanjut",
      "sks": 4,
      "lecturer_name": "Sunaryono M.Kom",
      "room": "KB. Ruang 2.3",
      "day_of_week": "Wednesday",
      "start_time": "17:00",
      "end_time": "18:00",
      "color_hex": "#3525cd"
    },
    {
      "id": 2,
      "user_id": 1,
      "course_code": "SWU002",
      "course_name": "Metodologi Penelitian",
      "sks": 4,
      "lecturer_name": "Singgih Briandoko S.Pd., M.Kom",
      "room": "KB. Ruang 2.1",
      "day_of_week": "Tuesday",
      "start_time": "17:00",
      "end_time": "18:00",
      "color_hex": "#7e3000"
    },
    {
      "id": 3,
      "user_id": 1,
      "course_code": "SWU003",
      "course_name": "Mobile Programming Lanjut",
      "sks": 4,
      "lecturer_name": "Nicolaus Euclides Wahyu S.Kom., M.Cs.,",
      "room": "KB. Lab 2",
      "day_of_week": "Tuesday",
      "start_time": "19:50",
      "end_time": "21:10",
      "color_hex": "#505f76"
    },
    {
      "id": 4,
      "user_id": 1,
      "course_code": "SWU004",
      "course_name": "Rekayasa Perangkat Lunak",
      "sks": 2,
      "lecturer_name": "Tarwoto S.Kom., M.Msi.",
      "room": "KS. Ruang 1.1",
      "day_of_week": "Friday",
      "start_time": "17:00",
      "end_time": "18:00",
      "color_hex": "#4f46e5"
    },
    {
      "id": 5,
      "user_id": 1,
      "course_code": "SWU005",
      "course_name": "Komputasi Awan",
      "sks": 2,
      "lecturer_name": "Aulia Desy Nur Utomo M.Cs.",
      "room": "KB. Ruang 2.3",
      "day_of_week": "Friday",
      "start_time": "18:30",
      "end_time": "19:30",
      "color_hex": "#ba1a1a"
    }
  ]
  ```

---

## Create Course
Mendaftarkan jadwal mata kuliah baru.

* **URL**: `/courses`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
  ```json
  {
    "course_code": "SWU001",
    "course_name": "Website Programming Lanjut",
    "sks": 4,
    "lecturer_name": "Sunaryono M.Kom",
    "room": "KB. Ruang 2.3",
    "day_of_week": "Wednesday",
    "start_time": "17:00",
    "end_time": "18:00",
    "color_hex": "#3525cd"
  }
  ```
* **Response (Success 201)**:
  ```json
  {
    "id": 1,
    "user_id": 1,
    "course_code": "SWU001",
    "course_name": "Website Programming Lanjut",
    "sks": 4,
    "lecturer_name": "Sunaryono M.Kom",
    "room": "KB. Ruang 2.3",
    "day_of_week": "Wednesday",
    "start_time": "17:00",
    "end_time": "18:00",
    "color_hex": "#3525cd"
  }
  ```

---

## Get Course Detail
Melihat info lengkap satu mata kuliah.

* **URL**: `/courses/{id}`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>`
* **Response (Success 200)**:
  ```json
  {
    "id": 1,
    "user_id": 1,
    "course_code": "SWU001",
    "course_name": "Website Programming Lanjut",
    "sks": 4,
    "lecturer_name": "Sunaryono M.Kom",
    "room": "KB. Ruang 2.3",
    "day_of_week": "Wednesday",
    "start_time": "17:00",
    "end_time": "18:00",
    "color_hex": "#3525cd"
  }
  ```

---

## Update Course
Mengubah info mata kuliah yang terdaftar.

* **URL**: `/courses/{id}`
* **Method**: `PUT`
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
  ```json
  {
    "room": "KB. Ruang 2.5",
    "start_time": "16:30",
    "end_time": "18:00"
  }
  ```
* **Response (Success 200)**:
  ```json
  {
    "id": 1,
    "user_id": 1,
    "course_code": "SWU001",
    "course_name": "Website Programming Lanjut",
    "sks": 4,
    "lecturer_name": "Sunaryono M.Kom",
    "room": "KB. Ruang 2.5",
    "day_of_week": "Wednesday",
    "start_time": "16:30",
    "end_time": "18:00",
    "color_hex": "#3525cd"
  }
  ```

---

## Delete Course
Menghapus mata kuliah. 

> [!WARNING]
> Menghapus Course akan memicu cascade di sisi backend: relasi `course_id` pada tabel `tasks` dan `notes` harus diset menjadi `NULL`, sedangkan record absensi (`attendance`) dan reschedule terkait mata kuliah ini harus ikut terhapus secara permanen.

* **URL**: `/courses/{id}`
* **Method**: `DELETE`
* **Headers**: `Authorization: Bearer <token>`
* **Response (Success 200)**:
  ```json
  {
    "message": "Mata kuliah berhasil dihapus"
  }
  ```

---

# 4. Task API

## Get All Tasks
Mengambil daftar tugas kuliah. Dapat disaring berdasarkan ID mata kuliah.

* **URL**: `/tasks`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>`
* **Query Parameters**:
  * `course_id` (integer, optional) - Saring berdasarkan mata kuliah tertentu.
* **Response (Success 200)**:
  ```json
  [
    {
      "id": 1,
      "user_id": 1,
      "course_id": 1,
      "task_title": "Membuat UI Login & Register di Flutter",
      "description": "Implementasi halaman login dan register menggunakan Flutter dengan validasi form, integrasi API, dan state management Provider.",
      "deadline": "2026-06-10 23:59:00",
      "is_finished": false,
      "is_priority": true,
      "attachments": []
    },
    {
      "id": 2,
      "user_id": 1,
      "course_id": 4,
      "task_title": "Menyusun Dokumen SRS",
      "description": "Menyusun dokumen Software Requirement Specification (SRS) untuk proyek akhir semester, termasuk use case diagram, activity diagram, dan class diagram.",
      "deadline": "2026-06-11 17:00:00",
      "is_finished": false,
      "is_priority": false,
      "attachments": []
    },
    {
      "id": 3,
      "user_id": 1,
      "course_id": null,
      "task_title": "Mengisi Formulir KRS Semester Depan",
      "description": "Memilih dan mengisi mata kuliah semester depan melalui portal akademik mahasiswa sebelum batas waktu pengisian KRS.",
      "deadline": "2026-06-13 12:00:00",
      "is_finished": false,
      "is_priority": false,
      "attachments": []
    }
  ]
  ```

---

## Create Task
Membuat tugas kuliah baru beserta lampiran dokumennya (jika ada).

* **URL**: `/tasks`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
  ```json
  {
    "course_id": 1,
    "task_title": "Membuat UI Login & Register di Flutter",
    "description": "Implementasi halaman login dan register menggunakan Flutter dengan validasi form, integrasi API, dan state management Provider.",
    "deadline": "2026-06-10 23:59:00",
    "is_priority": true,
    "attachments": [
      {
        "name": "mock_flutter_guidelines.pdf",
        "type": "application/pdf",
        "size": 14520,
        "data_url": "data:application/pdf;base64,JVBERi..."
      }
    ]
  }
  ```
* **Response (Success 201)**:
  ```json
  {
    "id": 1,
    "user_id": 1,
    "course_id": 1,
    "task_title": "Membuat UI Login & Register di Flutter",
    "description": "Implementasi halaman login dan register menggunakan Flutter dengan validasi form, integrasi API, dan state management Provider.",
    "deadline": "2026-06-10 23:59:00",
    "is_finished": false,
    "is_priority": true,
    "attachments": [
      {
        "name": "mock_flutter_guidelines.pdf",
        "type": "application/pdf",
        "size": 14520,
        "data_url": "data:application/pdf;base64,JVBERi..."
      }
    ]
  }
  ```

---

## Get Task Detail
Mengambil detail tugas tertentu.

* **URL**: `/tasks/{id}`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>`
* **Response (Success 200)**:
  ```json
  {
    "id": 1,
    "user_id": 1,
    "course_id": 1,
    "task_title": "Membuat UI Login & Register di Flutter",
    "description": "Implementasi halaman login dan register menggunakan Flutter dengan validasi form, integrasi API, dan state management Provider.",
    "deadline": "2026-06-10 23:59:00",
    "is_finished": false,
    "is_priority": true,
    "attachments": []
  }
  ```

---

## Update Task
Mengubah info tugas dan daftar berkas lampirannya.

* **URL**: `/tasks/{id}`
* **Method**: `PUT`
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
  ```json
  {
    "task_title": "Membuat UI Login & Register di Flutter (REVISI)",
    "is_priority": false
  }
  ```
* **Response (Success 200)**:
  ```json
  {
    "id": 1,
    "user_id": 1,
    "course_id": 1,
    "task_title": "Membuat UI Login & Register di Flutter (REVISI)",
    "description": "Implementasi halaman login dan register menggunakan Flutter dengan validasi form, integrasi API, dan state management Provider.",
    "deadline": "2026-06-10 23:59:00",
    "is_finished": false,
    "is_priority": false,
    "attachments": []
  }
  ```

---

## Finish Task (Checklist Status)
Mengubah status penyelesaian tugas (Toggle status `is_finished`).

* **URL**: `/tasks/{id}/finish`
* **Method**: `PATCH`
* **Headers**: `Authorization: Bearer <token>`
* **Response (Success 200)**:
  ```json
  {
    "id": 1,
    "user_id": 1,
    "course_id": 1,
    "task_title": "Membuat UI Login & Register di Flutter",
    "description": "Implementasi halaman login dan register menggunakan Flutter dengan validasi form, integrasi API, dan state management Provider.",
    "deadline": "2026-06-10 23:59:00",
    "is_finished": true,
    "is_priority": true,
    "attachments": []
  }
  ```

---

## Delete Task
Menghapus data tugas kuliah.

* **URL**: `/tasks/{id}`
* **Method**: `DELETE`
* **Headers**: `Authorization: Bearer <token>`
* **Response (Success 200)**:
  ```json
  {
    "message": "Tugas berhasil dihapus"
  }
  ```

---

# 5. Note API

## Get Notes
Mengambil seluruh daftar catatan materi milik mahasiswa.

* **URL**: `/notes`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>`
* **Response (Success 200)**:
  ```json
  [
    {
      "id": 1,
      "user_id": 1,
      "course_id": 3,
      "title": "Catatan Materi AI - Pertemuan 4",
      "content": "Algoritma pencarian: BFS (Breadth-First Search) dan DFS (Depth-First Search) adalah dasar dari algoritma pencarian pada graf. BFS mengeksplorasi level per level sedangkan DFS mengeksplorasi sedalam mungkin terlebih dahulu. Heuristik digunakan pada informed search seperti A* dan Greedy Best-First Search untuk meningkatkan efisiensi pencarian.",
      "attachments": []
    },
    {
      "id": 4,
      "user_id": 1,
      "course_id": 4,
      "title": "Checklist Proyek RPL",
      "content": "[ ] Menyelesaikan dokumen SRS\n[ ] Membuat wireframe UI/UX\n[x] Menentukan tech stack (Laravel + Flutter)\n[ ] Menyiapkan repository GitHub\n[ ] Membuat ERD dan skema database",
      "attachments": []
    }
  ]
  ```

---

## Create Note
Menambahkan catatan materi kuliah baru (mendukung lampiran berkas).

* **URL**: `/notes`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
  ```json
  {
    "course_id": 3,
    "title": "Catatan Materi AI - Pertemuan 4",
    "content": "Algoritma pencarian: BFS (Breadth-First Search) dan DFS (Depth-First Search) adalah dasar dari algoritma pencarian pada graf."
  }
  ```
* **Response (Success 201)**:
  ```json
  {
    "id": 1,
    "user_id": 1,
    "course_id": 3,
    "title": "Catatan Materi AI - Pertemuan 4",
    "content": "Algoritma pencarian: BFS (Breadth-First Search) dan DFS (Depth-First Search) adalah dasar dari algoritma pencarian pada graf.",
    "attachments": [],
    "created_at": "2026-06-09 09:30:00",
    "updated_at": "2026-06-09 09:30:00"
  }
  ```

---

## Get Note Detail
Mengambil isi lengkap suatu catatan.

* **URL**: `/notes/{id}`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>`
* **Response (Success 200)**:
  ```json
  {
    "id": 1,
    "user_id": 1,
    "course_id": 3,
    "title": "Catatan Materi AI - Pertemuan 4",
    "content": "Algoritma pencarian: BFS (Breadth-First Search) dan DFS (Depth-First Search) adalah dasar dari algoritma pencarian pada graf.",
    "attachments": [],
    "created_at": "2026-06-09 09:30:00",
    "updated_at": "2026-06-09 09:30:00"
  }
  ```

---

## Update Note
Memperbarui isi catatan belajar.

* **URL**: `/notes/{id}`
* **Method**: `PUT`
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
  ```json
  {
    "content": "Algoritma pencarian: BFS (Breadth-First Search) dan DFS (Depth-First Search) revisi."
  }
  ```
* **Response (Success 200)**:
  ```json
  {
    "id": 1,
    "user_id": 1,
    "course_id": 3,
    "title": "Catatan Materi AI - Pertemuan 4",
    "content": "Algoritma pencarian: BFS (Breadth-First Search) dan DFS (Depth-First Search) revisi.",
    "attachments": [],
    "created_at": "2026-06-09 09:30:00",
    "updated_at": "2026-06-09 09:40:00"
  }
  ```

---

## Delete Note
Menghapus catatan materi kuliah.

* **URL**: `/notes/{id}`
* **Method**: `DELETE`
* **Headers**: `Authorization: Bearer <token>`
* **Response (Success 200)**:
  ```json
  {
    "message": "Catatan berhasil dihapus"
  }
  ```

---

# 6. Events API

## Get All Events
Mengambil seluruh jadwal agenda non-kuliah kampus.

* **URL**: `/events`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>`
* **Response (Success 200)**:
  ```json
  [
    {
      "id": 1,
      "user_id": 1,
      "event_name": "Seminar Nasional AI & Web Development",
      "category": "seminar",
      "description": "Seminar nasional mengenai masa depan Web Development di era kecerdasan buatan.",
      "event_date": "2026-06-09",
      "start_time": "09:00",
      "end_time": "12:00",
      "location": "Auditorium SWU Lantai 3",
      "organizer": "Himpunan Mahasiswa Informatika",
      "color_hex": "#6366F1",
      "is_important": true
    },
    {
      "id": 2,
      "user_id": 1,
      "event_name": "Workshop Flutter Advanced",
      "category": "workshop",
      "description": "Belajar State Management Bloc dan Clean Architecture di Flutter.",
      "event_date": "2026-06-11",
      "start_time": "13:00",
      "end_time": "16:00",
      "location": "Lab Komputer 3",
      "organizer": "Google Developer Student Clubs SWU",
      "color_hex": "#F59E0B",
      "is_important": false
    }
  ]
  ```

---

## Create Event
Menambahkan agenda/kegiatan non-kuliah kampus baru.

* **URL**: `/events`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
  ```json
  {
    "event_name": "Seminar Nasional AI & Web Development",
    "category": "seminar",
    "description": "Seminar nasional mengenai masa depan Web Development di era kecerdasan buatan.",
    "event_date": "2026-06-09",
    "start_time": "09:00",
    "end_time": "12:00",
    "location": "Auditorium SWU Lantai 3",
    "organizer": "Himpunan Mahasiswa Informatika",
    "color_hex": "#6366F1",
    "is_important": true
  }
  ```
* **Response (Success 201)**:
  ```json
  {
    "id": 1,
    "user_id": 1,
    "event_name": "Seminar Nasional AI & Web Development",
    "category": "seminar",
    "description": "Seminar nasional mengenai masa depan Web Development di era kecerdasan buatan.",
    "event_date": "2026-06-09",
    "start_time": "09:00",
    "end_time": "12:00",
    "location": "Auditorium SWU Lantai 3",
    "organizer": "Himpunan Mahasiswa Informatika",
    "color_hex": "#6366F1",
    "is_important": true
  }
  ```

---

## Update Event
Memperbarui informasi event.

* **URL**: `/events/{id}`
* **Method**: `PUT`
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
  ```json
  {
    "location": "Auditorium Gedung Utama Lantai 2",
    "is_important": false
  }
  ```
* **Response (Success 200)**:
  ```json
  {
    "id": 1,
    "user_id": 1,
    "event_name": "Seminar Nasional AI & Web Development",
    "category": "seminar",
    "description": "Seminar nasional mengenai masa depan Web Development di era kecerdasan buatan.",
    "event_date": "2026-06-09",
    "start_time": "09:00",
    "end_time": "12:00",
    "location": "Auditorium Gedung Utama Lantai 2",
    "organizer": "Himpunan Mahasiswa Informatika",
    "color_hex": "#6366F1",
    "is_important": false
  }
  ```

---

## Delete Event
Menghapus event kampus.

* **URL**: `/events/{id}`
* **Method**: `DELETE`
* **Headers**: `Authorization: Bearer <token>`
* **Response (Success 200)**:
  ```json
  {
    "message": "Event berhasil dihapus"
  }
  ```

---

# 7. Reschedules API

## Get All Reschedules
Mengambil daftar pemindahan jadwal atau pembatalan sesi kelas kuliah rutin di tanggal tertentu.

* **URL**: `/reschedules`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>`
* **Response (Success 200)**:
  ```json
  [
    {
      "id": 1,
      "course_id": 1,
      "original_date": "2026-06-09",
      "new_date": null,
      "new_start_time": null,
      "new_end_time": null,
      "is_canceled": true,
      "note": "Pertemuan perdana dibatalkan karena dosen rapat rektorat"
    }
  ]
  ```

---

## Create Reschedule
Membuat data pemindahan sesi kuliah atau pembatalan kelas di tanggal tertentu.

* **URL**: `/reschedules`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
  ```json
  {
    "course_id": 1,
    "original_date": "2026-06-09",
    "new_date": null,
    "new_start_time": null,
    "new_end_time": null,
    "is_canceled": true,
    "note": "Pertemuan perdana dibatalkan karena dosen rapat rektorat"
  }
  ```
* **Response (Success 201)**:
  ```json
  {
    "id": 1,
    "course_id": 1,
    "original_date": "2026-06-09",
    "new_date": null,
    "new_start_time": null,
    "new_end_time": null,
    "is_canceled": true,
    "note": "Pertemuan perdana dibatalkan karena dosen rapat rektorat"
  }
  ```

---

## Delete Reschedule (Restore Normal)
Menghapus status reschedule atau penandaan kelas batal, agar sesi kuliah pada tanggal tersebut dikembalikan ke jadwal normal.

* **URL**: `/reschedules/{course_id}/{original_date}`
* **Method**: `DELETE`
* **Headers**: `Authorization: Bearer <token>`
* **Parameters**:
  * `course_id` (integer) - ID mata kuliah
  * `original_date` (string) - Tanggal original sesi kelas rutin (Format: `YYYY-MM-DD`)
* **Response (Success 200)**:
  ```json
  {
    "message": "Jadwal kuliah berhasil dikembalikan ke normal"
  }
  ```

---

# 8. Attendance API

## Get All Attendance
Mengambil seluruh riwayat absensi masuk kelas.

* **URL**: `/attendance`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>`
* **Response (Success 200)**:
  ```json
  [
    {
      "id": 1,
      "user_id": 1,
      "course_id": 1,
      "course_code": "SWU001",
      "course_name": "Website Programming Lanjut",
      "date": "2026-06-09",
      "time": "17:05:12",
      "status": "Hadir",
      "latitude": -6.9825,
      "longitude": 110.4091,
      "image_base64": "data:image/jpeg;base64,...",
      "verified_face": true
    }
  ]
  ```

---

## Submit Attendance
Melakukan presensi masuk kelas kuliah yang sedang berlangsung dengan menyertakan koordinat GPS lokasi mahasiswa dan snapshot verifikasi wajah (Base64).

* **URL**: `/attendance`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
  ```json
  {
    "course_id": 1,
    "course_code": "SWU001",
    "course_name": "Website Programming Lanjut",
    "date": "2026-06-09",
    "time": "17:05:12",
    "status": "Hadir",
    "latitude": -6.9825,
    "longitude": 110.4091,
    "image_base64": "data:image/jpeg;base64,..."
  }
  ```
* **Response (Success 201)**:
  ```json
  {
    "id": 1,
    "user_id": 1,
    "course_id": 1,
    "course_code": "SWU001",
    "course_name": "Website Programming Lanjut",
    "date": "2026-06-09",
    "time": "17:05:12",
    "status": "Hadir",
    "latitude": -6.9825,
    "longitude": 110.4091,
    "image_base64": "data:image/jpeg;base64,...",
    "verified_face": true
  }
  ```

---

## Delete Attendance
Menghapus riwayat absensi masuk (jika terjadi kesalahan pemrosesan wajah atau untuk keperluan presensi ulang).

* **URL**: `/attendance/{id}`
* **Method**: `DELETE`
* **Headers**: `Authorization: Bearer <token>`
* **Response (Success 200)**:
  ```json
  {
    "message": "Riwayat absensi berhasil dihapus"
  }
  ```

---

# 9. Gemini AI Integration (Client-Side Direct API)

Fitur **Asisten Kuliah AI (AI Companion)** pada aplikasi Planly dirancang menggunakan model **Gemini 2.5 Flash** (`gemini-2.5-flash`) yang diakses langsung dari aplikasi klien (frontend) tanpa perantara server backend (API Laravel).

### 9.1 Alur Deteksi & Keamanan API Key (Mobile Parity)
1. **Penyimpanan Lokal**: Kunci API Gemini disimpan di penyimpanan lokal peramban (`localStorage`) dengan enkripsi custom XOR + Sidik Jari (Fingerprint) Browser unik untuk menghindari pembajakan credential dalam bentuk plain-text oleh ekstensi berbahaya.
2. **Implementasi Mobile (Flutter)**: Developer Flutter **wajib** menyimpan Kunci API Gemini menggunakan **Flutter Secure Storage** (`flutter_secure_storage` yang menggunakan Keychain pada iOS dan AES/EncryptedSharedPreferences pada Android) alih-alih menggunakan `shared_preferences` biasa.
3. **Injeksi Langsung**: Kunci API tersebut di-inject secara dinamis ke instance Client Google Gen AI saat inisialisasi fitur Asisten AI.

### 9.2 Pipeline Analisis Rekaman Kuliah
1. **Kompresi Audio (Client-side extraction)**: Berkas video MP4 didecode oleh peramban, diturunkan frekuensinya (*down-sampled*) ke format **16000Hz mono WAV** menggunakan Web Audio API, kemudian dikirimkan sebagai payload Base64 (mimeType: `audio/wav`). Hal ini menghemat bandwidth hingga 50x.
   *(Di Flutter, gunakan plugin `ffmpeg_kit_flutter` atau library audio decoding serupa untuk mengekstrak trek audio WAV 16kHz sebelum mengirimkannya ke Gemini)*.
2. **Kueri Gemini**: Mengirimkan audio WAV beserta prompt instruksi terstruktur untuk menghasilkan JSON response yang mematuhi `responseSchema`.
3. **Format Markdown & Bold HTML**: Gemini diinstruksikan untuk menggunakan penanda `<b>teks</b>` HTML untuk cetak tebal (bold) alih-alih asterisk `**` guna menyederhanakan parser UI, serta mendukung LaTeX untuk formula matematika.

### 9.3 Kontrak Skema Respons Analisis Gemini
Respons dari model Gemini API bertipe `application/json` dan mematuhi skema berikut:
```json
{
  "transcript": [
    {
      "time": 0,
      "speaker": "Dosen",
      "text": "Kalimat verbatim transkrip di sini..."
    }
  ],
  "chapters": [
    {
      "time": 0,
      "title": "Judul Bab Pembahasan",
      "desc": "Ringkasan penjelasan materi pada bab ini."
    }
  ],
  "takeaways": [
    "Poin penting 1 dalam teks",
    "Poin penting 2 dalam teks"
  ],
  "enrichment": {
    "explanation": "Penjelasan pengayaan akademik terkait topik dari internet...",
    "cards": [
      {
        "title": "Nama Konsep Pengayaan",
        "description": "Penjelasan cara kerja konsep...",
        "formula": "f(x) = \\max(0, x)"
      }
    ],
    "sources": [
      {
        "label": "Nama Situs Referensi",
        "url": "https://example.com/source"
      }
    ]
  }
}
```
*Catatan: Properti `formula` bersifat opsional (`formula?: string`) pada kartu konsep (`cards`). Jika kartu konsep tidak memiliki rumus matematika pendukung, properti `formula` harus dihilangkan dari objek JSON.*

---

# 10. Spesifikasi Payload Lampiran & Biometrik Wajah

### 10.1 Format Struktur Lampiran Berkas (`AttachmentFile`)
Kolom `attachments` pada API Tugas (`/tasks`) dan Catatan (`/notes`) menyimpan array data berkas yang dikompresi ke format Base64 Data URI di sisi klien:
```json
{
  "name": "nama_berkas_tugas.pdf",
  "type": "application/pdf",
  "size": 14520,
  "data_url": "data:application/pdf;base64,JVBERi..."
}
```
*   **Batas Ukuran**: Klien web membatasi ukuran berkas maksimal **1.5MB** per berkas untuk efisiensi penyimpanan DB/localStorage.

### 10.2 Format Penyimpanan Biometrik Wajah (Local & API)
Data verifikasi wajah presensi diproses 100% di sisi klien menggunakan pustaka pengenalan wajah:
1. **Descriptor Wajah (Pendaftaran Wajah)**:
   - Wajah dipindai menggunakan kamera depan.
   - Pustaka mendeteksi landmark wajah dan mengekstrak **128-float array descriptor**.
   - Array ini di-string-kan (JSON format) dan disimpan di perangkat lokal klien.
2. **Payload Presensi Kehadiran (`POST /attendance`)**:
   - Saat mahasiswa melakukan check-in, descriptor wajah dihitung ulang secara real-time dan dicocokkan dengan descriptor terdaftar (Euclidean Distance <= 0.6 dianggap sukses).
   - Snapshot wajah saat itu diambil sebagai berkas JPG Base64 dan dikirimkan ke server API:
     - `image_base64`: `"data:image/jpeg;base64,/9j/4AAQSkZJRg..."`
     - Koordinat GPS (`latitude` dan `longitude`) divalidasi dengan radius lokasi kelas di sisi klien sebelum/saat pengiriman.