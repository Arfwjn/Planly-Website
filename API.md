# Dokumentasi REST API

## Deskripsi Umum

REST API ini digunakan untuk mendukung sistem manajemen pembelajaran dan produktivitas akademik. API menyediakan fitur autentikasi pengguna, pengelolaan course, jadwal, tugas, catatan, dan profil pengguna.

Base URL:

```txt
http://localhost:8000/api
```

---

# 1. Authentication API

## Register User

Digunakan untuk melakukan registrasi akun baru ke dalam sistem.

### Request

```http
POST /api/auth/register
```

### Deskripsi

Pengguna mengirimkan data registrasi seperti nama, email, dan password untuk membuat akun baru.

---

## Login User

Digunakan untuk proses autentikasi pengguna.

### Request

```http
POST /api/auth/login
```

### Deskripsi

Jika login berhasil, sistem akan mengembalikan token autentikasi yang digunakan untuk mengakses endpoint privat.

---

## Get Current User

Digunakan untuk mengambil data pengguna yang sedang login.

### Request

```http
GET /api/me
```

### Deskripsi

Mengembalikan informasi akun pengguna berdasarkan token autentikasi aktif.

---

## Logout User

Digunakan untuk mengakhiri sesi login pengguna.

### Request

```http
POST /api/logout
```

### Deskripsi

Token autentikasi akan dinonaktifkan sehingga pengguna keluar dari sistem.

---

# 2. Course API

## Get All Courses

Digunakan untuk mengambil seluruh data course.

### Request

```http
GET /api/courses
```

### Deskripsi

Mengembalikan daftar seluruh course yang tersedia.

---

## Create Course

Digunakan untuk menambahkan course baru.

### Request

```http
POST /api/courses
```

### Deskripsi

Menyimpan data course baru ke dalam database.

---

## Get Course Detail

Digunakan untuk mengambil detail course berdasarkan ID.

### Request

```http
GET /api/courses/{id}
```

### Parameter

| Parameter | Tipe | Deskripsi |
|---|---|---|
| id | integer | ID course |

### Deskripsi

Mengembalikan detail lengkap course tertentu.

---

## Update Course

Digunakan untuk memperbarui data course.

### Request

```http
PUT /api/courses/{id}
```

### Parameter

| Parameter | Tipe | Deskripsi |
|---|---|---|
| id | integer | ID course |

### Deskripsi

Memperbarui informasi course berdasarkan ID yang dipilih.

---

## Delete Course

Digunakan untuk menghapus course.

### Request

```http
DELETE /api/courses/{id}
```

### Parameter

| Parameter | Tipe | Deskripsi |
|---|---|---|
| id | integer | ID course |

### Deskripsi

Menghapus data course secara permanen dari database.

---

# 3. Schedule API

## Get Schedule

Digunakan untuk mengambil seluruh jadwal pengguna.

### Request

```http
GET /api/schedule
```

### Deskripsi

Mengembalikan daftar seluruh jadwal yang dimiliki pengguna.

---

## Create Schedule

Digunakan untuk menambahkan jadwal baru.

### Request

```http
POST /api/schedule
```

### Deskripsi

Menyimpan jadwal baru seperti jadwal kuliah atau kegiatan lainnya.

---

## Get Today Schedule

Digunakan untuk mengambil jadwal hari ini.

### Request

```http
GET /api/schedule/today
```

### Deskripsi

Mengembalikan jadwal yang sesuai dengan tanggal saat ini.

---

# 4. Task API

## Get All Tasks

Digunakan untuk mengambil seluruh daftar tugas.

### Request

```http
GET /api/tasks
```

### Deskripsi

Mengembalikan seluruh data tugas pengguna.

---

## Create Task

Digunakan untuk menambahkan tugas baru.

### Request

```http
POST /api/tasks
```

### Deskripsi

Menyimpan data tugas beserta deadline dan detail lainnya.

---

## Finish Task

Digunakan untuk mengubah status tugas menjadi selesai.

### Request

```http
PATCH /api/tasks/{id}/finish
```

### Parameter

| Parameter | Tipe | Deskripsi |
|---|---|---|
| id | integer | ID tugas |

### Deskripsi

Mengubah status tugas menjadi completed atau finished.

---

# 5. Note API

## Get Notes

Digunakan untuk mengambil seluruh catatan pengguna.

### Request

```http
GET /api/notes
```

### Deskripsi

Mengembalikan daftar catatan yang tersimpan.

---

## Create Note

Digunakan untuk menambahkan catatan baru.

### Request

```http
POST /api/notes
```

### Deskripsi

Menyimpan catatan baru ke dalam database.

---

# 6. Profile API

## Get Profile

Digunakan untuk mengambil informasi profil pengguna.

### Request

```http
GET /api/profile
```

### Deskripsi

Mengembalikan data profil pengguna yang sedang login.

---

## Update Profile

Digunakan untuk memperbarui data profil pengguna.

### Request

```http
POST /api/profile/update
```

### Deskripsi

Memperbarui informasi pengguna seperti nama, password, atau foto profil.

---

# Ringkasan Endpoint

| Category | Method | Endpoint |
|---|---|---|
| Auth | POST | `/api/auth/register` |
| Auth | POST | `/api/auth/login` |
| Auth | GET | `/api/me` |
| Auth | POST | `/api/logout` |
| Course | GET | `/api/courses` |
| Course | POST | `/api/courses` |
| Course | GET | `/api/courses/{id}` |
| Course | PUT | `/api/courses/{id}` |
| Course | DELETE | `/api/courses/{id}` |
| Schedule | GET | `/api/schedule` |
| Schedule | POST | `/api/schedule` |
| Schedule | GET | `/api/schedule/today` |
| Task | GET | `/api/tasks` |
| Task | POST | `/api/tasks` |
| Task | PATCH | `/api/tasks/{id}/finish` |
| Note | GET | `/api/notes` |
| Note | POST | `/api/notes` |
| Profile | GET | `/api/profile` |
| Profile | POST | `/api/profile/update` |