# Panduan Integrasi Backend Laravel — Planly Web API

Dokumen ini berisi panduan lengkap bagi pengembang backend untuk mengimplementasikan **REST API** menggunakan **Laravel 11** dan **Laravel Sanctum**. Seluruh endpoint, penamaan field database (`snake_case`), validasi, dan struktur respons JSON disesuaikan agar **100% kompatibel** dengan aplikasi frontend **Planly** yang saat ini berjalan.

---

## 1. Stack & Persyaratan Sistem

* **PHP**: 8.2 ke atas
* **Framework**: Laravel 11
* **Autentikasi**: Laravel Sanctum (Bearer Token)
* **Database**: MySQL 8.0+ atau PostgreSQL 15+
* **Format Respons**: JSON murni (`application/json`)

---

## 2. Inisialisasi Proyek & Setelan Awal

### 2.1 Pemasangan Awal

Jalankan perintah berikut untuk menginisialisasi proyek Laravel API baru:

```bash
composer create-project laravel/laravel planly-api
cd planly-api
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

### 2.2 Aktifkan Sanctum Middleware

Pada Laravel 11, buka file `bootstrap/app.php` dan daftarkan middleware Sanctum agar API mendukung otentikasi berbasis token (stateful):

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->statefulApi();
})
```

### 2.3 Setelan CORS (`config/cors.php`)

Pastikan frontend dapat mengakses API tanpa terblokir masalah keamanan CORS:

```php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'logout'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'http://localhost:5173', // Vite default port
        'http://127.0.0.1:5173',
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

---

## 3. Database Migrations

Berikut adalah skema tabel database yang harus dibangun. Silakan buat migrasi satu per satu sesuai dengan urutan di bawah ini untuk menghindari konflik *foreign key constraint*.

### 3.1 Tabel `users` (Menambah kolom akademik & profil)

Jalankan: `php artisan make:migration add_academic_fields_to_users_table --table=users`

```php
public function up(): void
{
    Schema::table('users', function (Blueprint $table) {
        $table->string('nim')->nullable()->after('email');
        $table->string('major')->nullable()->after('nim');
        $table->integer('semester')->nullable()->after('major');
        $table->longText('profile_photo_url')->nullable()->after('semester');
        $table->decimal('gpa_current', 3, 2)->nullable()->after('profile_photo_url');
        $table->decimal('gpa_target', 3, 2)->nullable()->after('gpa_current');
        $table->integer('target_study_hours')->nullable()->after('gpa_target');
        $table->string('address')->nullable()->after('target_study_hours');
    });
}
```

### 3.2 Tabel `courses` (Jadwal mata kuliah rutin)

Jalankan: `php artisan make:migration create_courses_table`

```php
public function up(): void
{
    Schema::create('courses', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->string('course_code');
        $table->string('course_name');
        $table->integer('sks');
        $table->string('lecturer_name');
        $table->string('room');
        $table->string('day_of_week'); // 'Monday', 'Tuesday', dll.
        $table->string('start_time');  // format "HH:MM"
        $table->string('end_time');    // format "HH:MM"
        $table->string('color_hex')->default('#6366F1');
        $table->timestamps();
    });
}
```

### 3.3 Tabel `tasks` (Tugas akademik dengan kolom lampiran JSON)

Jalankan: `php artisan make:migration create_tasks_table`

```php
public function up(): void
{
    Schema::create('tasks', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->foreignId('course_id')->nullable()->constrained()->onDelete('set null');
        $table->string('task_title');
        $table->text('description')->nullable();
        $table->dateTime('deadline'); // format "YYYY-MM-DD HH:MM:SS"
        $table->boolean('is_finished')->default(false);
        $table->boolean('is_priority')->default(false);
        $table->json('attachments')->nullable(); // Menampung array berkas Base64
        $table->timestamps();
    });
}
```

### 3.4 Tabel `notes` (Catatan materi kuliah dengan kolom lampiran JSON)

Jalankan: `php artisan make:migration create_notes_table`

```php
public function up(): void
{
    Schema::create('notes', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->foreignId('course_id')->nullable()->constrained()->onDelete('set null');
        $table->string('title');
        $table->longText('content');
        $table->json('attachments')->nullable(); // Menampung array berkas Base64
        $table->timestamps();
    });
}
```

### 3.5 Tabel `campus_events` (Event non-kuliah)

Jalankan: `php artisan make:migration create_campus_events_table`

```php
public function up(): void
{
    Schema::create('campus_events', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->string('event_name');
        $table->string('category'); // 'seminar', 'workshop', 'ukm', dll.
        $table->text('description')->nullable();
        $table->date('event_date'); // format "YYYY-MM-DD"
        $table->string('start_time'); // format "HH:MM"
        $table->string('end_time');   // format "HH:MM"
        $table->string('location');
        $table->string('organizer');
        $table->string('color_hex')->default('#6B7280');
        $table->boolean('is_important')->default(false);
        $table->timestamps();
    });
}
```

### 3.6 Tabel `rescheduled_sessions` (Jadwal pindahan/batal kelas)

Jalankan: `php artisan make:migration create_rescheduled_sessions_table`

```php
public function up(): void
{
    Schema::create('rescheduled_sessions', function (Blueprint $table) {
        $table->id();
        $table->foreignId('course_id')->constrained()->onDelete('cascade');
        $table->date('original_date'); // format "YYYY-MM-DD"
        $table->date('new_date')->nullable(); // null jika dibatalkan sepenuhnya
        $table->string('new_start_time')->nullable(); // format "HH:MM"
        $table->string('new_end_time')->nullable();   // format "HH:MM"
        $table->boolean('is_canceled')->default(false);
        $table->text('note')->nullable(); // Alasan reschedule/pembatalan
        $table->timestamps();
    });
}
```

### 3.7 Tabel `attendance_records` (Kehadiran dengan foto Base64 & GPS)

Jalankan: `php artisan make:migration create_attendance_records_table`

```php
public function up(): void
{
    Schema::create('attendance_records', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->foreignId('course_id')->constrained()->onDelete('cascade');
        $table->string('course_code');
        $table->string('course_name');
        $table->date('date'); // format "YYYY-MM-DD"
        $table->time('time'); // format "HH:MM:SS"
        $table->string('status'); // 'Hadir', 'Sakit', 'Izin', 'Alpha'
        $table->decimal('latitude', 10, 8)->nullable();
        $table->decimal('longitude', 11, 8)->nullable();
        $table->longText('image_base64')->nullable(); // Foto jepretan webcam
        $table->boolean('verified_face')->default(true);
        $table->timestamps();
    });
}
```

---

## 4. Eloquent Models

Sesuaikan penulisan properti dan casting JSON pada model berikut:

### 4.1 Model `User` (`app/Models/User.php`)

```php
protected $fillable = [
    'name', 'email', 'password', 'nim', 'major', 'semester', 
    'profile_photo_url', 'gpa_current', 'gpa_target', 
    'target_study_hours', 'address'
];

protected $casts = [
    'email_verified_at' => 'datetime',
    'password' => 'hashed',
    'semester' => 'integer',
    'gpa_current' => 'float',
    'gpa_target' => 'float',
    'target_study_hours' => 'integer',
];
```

### 4.2 Model `Course` (`app/Models/Course.php`)

```php
class Course extends Model
{
    protected $fillable = [
        'user_id', 'course_code', 'course_name', 'sks', 
        'lecturer_name', 'room', 'day_of_week', 'start_time', 
        'end_time', 'color_hex'
    ];
}
```

### 4.3 Model `Task` (`app/Models/Task.php`)

```php
class Task extends Model
{
    protected $fillable = [
        'user_id', 'course_id', 'task_title', 'description', 
        'deadline', 'is_finished', 'is_priority', 'attachments'
    ];

    protected $casts = [
        'is_finished' => 'boolean',
        'is_priority' => 'boolean',
        'attachments' => 'array', // Otomatis cast JSON ke array asosiatif PHP
    ];
}
```

### 4.4 Model `Note` (`app/Models/Note.php`)

```php
class Note extends Model
{
    protected $fillable = [
        'user_id', 'course_id', 'title', 'content', 'attachments'
    ];

    protected $casts = [
        'attachments' => 'array',
    ];
}
```

### 4.5 Model `CampusEvent` (`app/Models/CampusEvent.php`)

```php
class CampusEvent extends Model
{
    protected $fillable = [
        'user_id', 'event_name', 'category', 'description', 
        'event_date', 'start_time', 'end_time', 'location', 
        'organizer', 'color_hex', 'is_important'
    ];

    protected $casts = [
        'is_important' => 'boolean',
    ];
}
```

### 4.6 Model `RescheduledSession` (`app/Models/RescheduledSession.php`)

```php
class RescheduledSession extends Model
{
    protected $fillable = [
        'course_id', 'original_date', 'new_date', 
        'new_start_time', 'new_end_time', 'is_canceled', 'note'
    ];

    protected $casts = [
        'is_canceled' => 'boolean',
    ];
}
```

### 4.7 Model `AttendanceRecord` (`app/Models/AttendanceRecord.php`)

```php
class AttendanceRecord extends Model
{
    protected $fillable = [
        'user_id', 'course_id', 'course_code', 'course_name', 
        'date', 'time', 'status', 'latitude', 'longitude', 
        'image_base64', 'verified_face'
    ];

    protected $casts = [
        'verified_face' => 'boolean',
        'latitude' => 'float',
        'longitude' => 'float',
    ];
}
```

---

## 5. API Controllers & Routing

Berikut adalah konfigurasi routing dan contoh logika controller untuk meng-handle integrasi secara presisi.

### 5.1 Routing File (`routes/api.php`)

```php
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\NoteController;
use App\Http\Controllers\Api\CampusEventController;
use App\Http\Controllers\Api\RescheduleController;
use App\Http\Controllers\Api\AttendanceController;

// Endpoint Terbuka
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Endpoint Privat (Butuh Otorisasi Token)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Profil
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::post('/profile/update', [ProfileController::class, 'update']);
    
    // Mata Kuliah (CRUD)
    Route::apiResource('courses', CourseController::class);
    
    // Tugas (CRUD & Finish)
    Route::apiResource('tasks', TaskController::class);
    Route::patch('/tasks/{id}/finish', [TaskController::class, 'finish']);
    
    // Catatan (CRUD)
    Route::apiResource('notes', NoteController::class);
    
    // Event Kampus (CRUD)
    Route::apiResource('events', CampusEventController::class);
    
    // Reschedule Kuliah (List, Simpan, Hapus Override)
    Route::get('/reschedules', [RescheduleController::class, 'index']);
    Route::post('/reschedules', [RescheduleController::class, 'store']);
    Route::delete('/reschedules/{courseId}/{originalDate}', [RescheduleController::class, 'destroy']);
    
    // Presensi Kehadiran (List, Submit, Hapus Riwayat)
    Route::get('/attendance', [AttendanceController::class, 'index']);
    Route::post('/attendance', [AttendanceController::class, 'store']);
    Route::delete('/attendance/{id}', [AttendanceController::class, 'destroy']);
});
```

---

### 5.2 Implementasi Controller Utama

#### A. AuthController (`app/Http/Controllers/Api/AuthController.php`)

```php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'nim' => 'nullable|string',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'nim' => $request->nim,
        ]);

        return response()->json([
            'message' => 'Pendaftaran berhasil',
            'user' => $user
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Kredensial yang diberikan salah.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user
        ], 200);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Berhasil logout'
        ], 200);
    }
}
```

#### B. RescheduleController (`app/Http/Controllers/Api/RescheduleController.php`)

```php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RescheduledSession;
use Illuminate\Http\Request;

class RescheduleController extends Controller
{
    public function index(Request $request)
    {
        // Ambil pemindahan jadwal yang dimiliki oleh user (melalui relasi course)
        return RescheduledSession::whereHas('course', function($query) use ($request) {
            $query->where('user_id', $request->user()->id);
        })->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'original_date' => 'required|date_format:Y-m-d',
            'new_date' => 'nullable|date_format:Y-m-d',
            'new_start_time' => 'nullable|string',
            'new_end_time' => 'nullable|string',
            'is_canceled' => 'required|boolean',
            'note' => 'nullable|string',
        ]);

        $reschedule = RescheduledSession::create($validated);

        return response()->json($reschedule, 201);
    }

    public function destroy($courseId, $originalDate)
    {
        RescheduledSession::where('course_id', $courseId)
            ->where('original_date', $originalDate)
            ->delete();

        return response()->json([
            'message' => 'Jadwal kuliah berhasil dikembalikan ke normal'
        ], 200);
    }
}
```

#### C. AttendanceController (`app/Http/Controllers/Api/AttendanceController.php`)

```php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttendanceRecord;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        return AttendanceRecord::where('user_id', $request->user()->id)
            ->orderBy('date', 'desc')
            ->orderBy('time', 'desc')
            ->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'course_code' => 'required|string',
            'course_name' => 'required|string',
            'date' => 'required|date_format:Y-m-d',
            'time' => 'required|string',
            'status' => 'required|string|in:Hadir,Sakit,Izin,Alpha',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'image_base64' => 'nullable|string',
        ]);

        $validated['user_id'] = $request->user()->id;
        $validated['verified_face'] = true; // Skenario verifikasi wajah sukses bawaan

        $record = AttendanceRecord::create($validated);

        return response()->json($record, 201);
    }

    public function destroy(Request $request, $id)
    {
        AttendanceRecord::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->delete();

        return response()->json([
            'message' => 'Riwayat presensi berhasil dihapus.'
        ], 200);
    }
}
```

---

## 6. Cascade Delete & Clean Up Data

Di sisi server Laravel, pastikan aturan integritas data (*database integrity*) berjalan otomatis saat data utama dihapus:

1. **Hapus Mata Kuliah (`courses`)**:
   * Menghapus baris di tabel `courses` otomatis menghapus semua record pada `attendance_records` dan `rescheduled_sessions` terkait (terbantu oleh `onDelete('cascade')`).
   * Field `course_id` pada tabel `tasks` dan `notes` terkait harus diset menjadi `NULL` (terbantu oleh `onDelete('set null')`).
2. **Hapus Akun Pengguna (`users`)**:
   * Menghapus baris `users` akan menghapus seluruh data mata kuliah, tugas, catatan, event, dan riwayat absensi miliknya secara permanen (`onDelete('cascade')`).

---

## 7. Catatan Tambahan Skema Database (Revisi & Base64)

### 7.1 Tipe Data Foto Profil (`profile_photo_url`)
Pada migrasi awal, kolom `profile_photo_url` bertipe `string` (yang dibatasi 255 karakter). Karena Planly mendukung penyimpanan foto registrasi wajah / avatar klien dalam bentuk Base64 Data URI yang panjang, buatlah migrasi revisi untuk mengubah tipe kolom tersebut menjadi `longText`:

Jalankan: `php artisan make:migration change_profile_photo_url_to_long_text_in_users_table --table=users`
```php
public function up(): void
{
    Schema::table('users', function (Blueprint $table) {
        $table->longText('profile_photo_url')->nullable()->change();
    });
}
```

### 7.2 Struktur JSON Cast di PHP
Untuk `attachments` pada model `Task` dan `Note` serta koordinat GPS pada `AttendanceRecord`, pastikan cast tipe data bawaan dideklarasikan dengan benar pada Eloquent model agar PHP otomatis men-serialize dan de-serialize JSON string dari MySQL tanpa perlu memanggil `json_encode` atau `json_decode` secara manual di controller.

