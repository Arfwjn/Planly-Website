# Prompt: Implementasi Backend Laravel — Planly Web API

---

## Konteks & Tujuan

Kamu adalah expert Laravel developer. Tugasmu adalah membangun **REST API backend** menggunakan **Laravel 11** untuk aplikasi web **Planly** — platform manajemen akademik mahasiswa.

Backend ini harus **100% kompatibel** dengan aplikasi mobile Flutter yang sudah ada. Artinya, seluruh nama field request, nama field response, struktur JSON, dan endpoint URL **harus identik** dengan yang sudah dipakai di mobile, sehingga mobile app dan web app dapat menggunakan API yang sama tanpa perubahan apapun.

Kamu akan membangun dari nol. Ikuti setiap instruksi secara berurutan dan jangan melewati langkah apapun.

---

## Stack & Versi

- **PHP:** 8.2+
- **Framework:** Laravel 11
- **Autentikasi:** Laravel Sanctum (Bearer Token)
- **Database:** MySQL 8.0+ (atau PostgreSQL 15+)
- **API Style:** RESTful JSON API
- **Response format:** JSON murni (bukan Inertia, bukan Livewire, bukan Blade)

---

## Langkah 1 — Inisialisasi Proyek

```bash
composer create-project laravel/laravel planly-api
cd planly-api
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

Tambahkan di `bootstrap/app.php` (Laravel 11 menggunakan file ini, bukan `Kernel.php`):

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->statefulApi();
})
```

Pastikan `config/sanctum.php` sudah terpublish.

Buat file `.env` berisi:

```env
APP_NAME=PlanlyAPI
APP_ENV=local
APP_KEY=  # generate dengan: php artisan key:generate
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=planly
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000
```

---

## Langkah 2 — Konfigurasi CORS

Edit `config/cors.php`:

```php
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3000',   // Next.js dev
        'http://127.0.0.1:3000',
        // tambahkan domain produksi nanti
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,
];
```

---

## Langkah 3 — Database Migrations

Buat semua migration berikut **dalam urutan ini** (urutan penting karena foreign key).

### 3.1 Modifikasi tabel `users` (sudah ada, modify saja)

```bash
php artisan make:migration add_fields_to_users_table --table=users
```

Isi migration:

```php
public function up(): void
{
    Schema::table('users', function (Blueprint $table) {
        $table->string('nim')->nullable()->after('email');
        $table->string('major')->nullable()->after('nim');
        $table->integer('semester')->nullable()->after('major');
        $table->string('profile_photo_url')->nullable()->after('semester');
    });
}

public function down(): void
{
    Schema::table('users', function (Blueprint $table) {
        $table->dropColumn(['nim', 'major', 'semester', 'profile_photo_url']);
    });
}
```

### 3.2 Tabel `courses`

```bash
php artisan make:migration create_courses_table
```

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
        $table->string('day_of_week'); // 'Monday', 'Tuesday', dst
        $table->string('start_time');  // format: "HH:MM"
        $table->string('end_time');    // format: "HH:MM"
        $table->string('color_hex')->default('#3498db');
        $table->timestamps();
    });
}

public function down(): void
{
    Schema::dropIfExists('courses');
}
```

### 3.3 Tabel `tasks`

```bash
php artisan make:migration create_tasks_table
```

```php
public function up(): void
{
    Schema::create('tasks', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->foreignId('course_id')->nullable()->constrained()->onDelete('set null');
        $table->string('task_title');
        $table->text('description')->nullable();
        $table->dateTime('deadline'); // format: "YYYY-MM-DD HH:MM:SS"
        $table->boolean('is_finished')->default(false);
        $table->boolean('is_priority')->default(false);
        $table->timestamps();
    });
}

public function down(): void
{
    Schema::dropIfExists('tasks');
}
```

### 3.4 Tabel `notes`

```bash
php artisan make:migration create_notes_table
```

```php
public function up(): void
{
    Schema::create('notes', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->foreignId('course_id')->nullable()->constrained()->onDelete('set null');
        $table->string('title');
        $table->longText('content');
        $table->timestamps();
    });
}

public function down(): void
{
    Schema::dropIfExists('notes');
}
```

Jalankan semua migration:

```bash
php artisan migrate
```

---

## Langkah 4 — Models

### 4.1 `app/Models/User.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'nim',
        'major',
        'semester',
        'profile_photo_url',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'semester'          => 'integer',
        ];
    }

    public function courses()
    {
        return $this->hasMany(Course::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function notes()
    {
        return $this->hasMany(Note::class);
    }
}
```

### 4.2 `app/Models/Course.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'course_code',
        'course_name',
        'sks',
        'lecturer_name',
        'room',
        'day_of_week',
        'start_time',
        'end_time',
        'color_hex',
    ];

    protected function casts(): array
    {
        return [
            'sks' => 'integer',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function notes()
    {
        return $this->hasMany(Note::class);
    }
}
```

### 4.3 `app/Models/Task.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'course_id',
        'task_title',
        'description',
        'deadline',
        'is_finished',
        'is_priority',
    ];

    protected function casts(): array
    {
        return [
            'deadline'    => 'datetime',
            'is_finished' => 'boolean',
            'is_priority' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}
```

### 4.4 `app/Models/Note.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'course_id',
        'title',
        'content',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}
```

---

## Langkah 5 — API Resources

Resources memastikan format response JSON **selalu konsisten** dengan yang diharapkan mobile app.

```bash
php artisan make:resource UserResource
php artisan make:resource CourseResource
php artisan make:resource TaskResource
php artisan make:resource NoteResource
```

### 5.1 `app/Http/Resources/UserResource.php`

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'name'              => $this->name,
            'email'             => $this->email,
            'nim'               => $this->nim,
            'major'             => $this->major,
            'semester'          => $this->semester,
            'profile_photo_url' => $this->profile_photo_url,
        ];
    }
}
```

### 5.2 `app/Http/Resources/CourseResource.php`

> **Penting:** Nama field output harus persis sama dengan yang dibaca Flutter.
> Flutter membaca: `id`, `user_id`, `course_code`, `course_name`, `sks`,
> `lecturer_name`, `room`, `day_of_week`, `start_time`, `end_time`, `color_hex`.

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'user_id'       => $this->user_id,
            'course_code'   => $this->course_code,
            'course_name'   => $this->course_name,
            'sks'           => (int) $this->sks,
            'lecturer_name' => $this->lecturer_name,
            'room'          => $this->room,
            'day_of_week'   => $this->day_of_week,
            'start_time'    => $this->start_time,
            'end_time'      => $this->end_time,
            'color_hex'     => $this->color_hex,
        ];
    }
}
```

### 5.3 `app/Http/Resources/TaskResource.php`

> **Penting:** Flutter membaca field `deadline` sebagai string "YYYY-MM-DD HH:MM:SS"
> lalu split dengan spasi untuk memisahkan tanggal dan waktu.
> Field nama: `id`, `user_id`, `course_id`, `task_title`, `description`,
> `deadline`, `is_finished`, `is_priority`.

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'user_id'     => $this->user_id,
            'course_id'   => $this->course_id,
            'task_title'  => $this->task_title,
            'description' => $this->description,
            'deadline'    => $this->deadline
                                ? $this->deadline->format('Y-m-d H:i:s')
                                : null,
            'is_finished' => (bool) $this->is_finished,
            'is_priority' => (bool) $this->is_priority,
        ];
    }
}
```

### 5.4 `app/Http/Resources/NoteResource.php`

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NoteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'        => $this->id,
            'user_id'   => $this->user_id,
            'course_id' => $this->course_id,
            'title'     => $this->title,
            'content'   => $this->content,
        ];
    }
}
```

---

## Langkah 6 — Form Requests (Validasi)

```bash
php artisan make:request Auth/RegisterRequest
php artisan make:request Auth/LoginRequest
php artisan make:request StoreCourseRequest
php artisan make:request UpdateCourseRequest
php artisan make:request StoreTaskRequest
php artisan make:request UpdateTaskRequest
php artisan make:request StoreNoteRequest
php artisan make:request UpdateNoteRequest
php artisan make:request UpdateProfileRequest
```

### 6.1 `RegisterRequest.php`

```php
<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'                  => ['required', 'string', 'max:255'],
            'email'                 => ['required', 'email', 'unique:users,email'],
            'password'              => ['required', 'string', 'min:6', 'confirmed'],
            'nim'                   => ['nullable', 'string', 'max:50'],
        ];
    }
}
```

### 6.2 `LoginRequest.php`

```php
<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ];
    }
}
```

### 6.3 `StoreCourseRequest.php`

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCourseRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'course_code'   => ['required', 'string', 'max:50'],
            'course_name'   => ['required', 'string', 'max:255'],
            'sks'           => ['required', 'integer', 'min:1'],
            'lecturer_name' => ['required', 'string', 'max:255'],
            'room'          => ['required', 'string', 'max:100'],
            'day_of_week'   => ['required', 'string', 'in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday'],
            'start_time'    => ['required', 'date_format:H:i'],
            'end_time'      => ['required', 'date_format:H:i', 'after:start_time'],
            'color_hex'     => ['nullable', 'string', 'max:10'],
        ];
    }
}
```

### 6.4 `UpdateCourseRequest.php`

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCourseRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'course_code'   => ['sometimes', 'required', 'string', 'max:50'],
            'course_name'   => ['sometimes', 'required', 'string', 'max:255'],
            'sks'           => ['sometimes', 'required', 'integer', 'min:1'],
            'lecturer_name' => ['sometimes', 'required', 'string', 'max:255'],
            'room'          => ['sometimes', 'required', 'string', 'max:100'],
            'day_of_week'   => ['sometimes', 'required', 'string', 'in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday'],
            'start_time'    => ['sometimes', 'required', 'date_format:H:i'],
            'end_time'      => ['sometimes', 'required', 'date_format:H:i'],
            'color_hex'     => ['nullable', 'string', 'max:10'],
        ];
    }
}
```

### 6.5 `StoreTaskRequest.php`

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'course_id'   => ['nullable', 'integer', 'exists:courses,id'],
            'task_title'  => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'deadline'    => ['required', 'date_format:Y-m-d H:i:s'],
            'is_finished' => ['sometimes', 'boolean'],
            'is_priority' => ['sometimes', 'boolean'],
        ];
    }
}
```

### 6.6 `UpdateTaskRequest.php`

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'course_id'   => ['nullable', 'integer', 'exists:courses,id'],
            'task_title'  => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'deadline'    => ['sometimes', 'required', 'date_format:Y-m-d H:i:s'],
            'is_finished' => ['sometimes', 'boolean'],
            'is_priority' => ['sometimes', 'boolean'],
        ];
    }
}
```

### 6.7 `StoreNoteRequest.php`

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreNoteRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'course_id' => ['nullable', 'integer', 'exists:courses,id'],
            'title'     => ['required', 'string', 'max:255'],
            'content'   => ['required', 'string'],
        ];
    }
}
```

### 6.8 `UpdateNoteRequest.php`

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNoteRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'course_id' => ['nullable', 'integer', 'exists:courses,id'],
            'title'     => ['sometimes', 'required', 'string', 'max:255'],
            'content'   => ['sometimes', 'required', 'string'],
        ];
    }
}
```

### 6.9 `UpdateProfileRequest.php`

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'     => ['sometimes', 'required', 'string', 'max:255'],
            'email'    => ['sometimes', 'required', 'email', Rule::unique('users')->ignore($this->user()->id)],
            'nim'      => ['nullable', 'string', 'max:50'],
            'major'    => ['nullable', 'string', 'max:100'],
            'semester' => ['nullable', 'integer', 'min:1', 'max:14'],
        ];
    }
}
```

---

## Langkah 7 — Controllers

```bash
php artisan make:controller Api/AuthController
php artisan make:controller Api/ProfileController
php artisan make:controller Api/CourseController --api
php artisan make:controller Api/TaskController --api
php artisan make:controller Api/NoteController --api
```

### 7.1 `app/Http/Controllers/Api/AuthController.php`

> **Catatan field:** Login mengembalikan key `token` (bukan `access_token`).
> Flutter membaca: `data['token'] ?? data['access_token']` — keduanya valid.
> Gunakan key `token` untuk konsistensi.

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * POST /api/auth/register
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'nim'      => $request->nim,
        ]);

        return response()->json([
            'message' => 'Registration successful',
            'user'    => new UserResource($user),
        ], 201);
    }

    /**
     * POST /api/auth/login
     */
    public function login(LoginRequest $request): JsonResponse
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid email or password',
            ], 401);
        }

        /** @var User $user */
        $user  = Auth::user();
        $token = $user->createToken('planly-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => new UserResource($user),
        ], 200);
    }

    /**
     * POST /api/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ], 200);
    }
}
```

### 7.2 `app/Http/Controllers/Api/ProfileController.php`

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    /**
     * GET /api/profile
     */
    public function show(Request $request): JsonResponse
    {
        return response()->json(
            new UserResource($request->user())
        );
    }

    /**
     * PUT /api/profile
     */
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $request->user()->update($request->validated());

        return response()->json(
            new UserResource($request->user()->fresh())
        );
    }
}
```

### 7.3 `app/Http/Controllers/Api/CourseController.php`

> Semua operasi **scoped ke user yang sedang login** — user hanya bisa melihat
> dan mengubah data miliknya sendiri.

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCourseRequest;
use App\Http\Requests\UpdateCourseRequest;
use App\Http\Resources\CourseResource;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    /**
     * GET /api/courses
     * Mengembalikan semua mata kuliah milik user yang login.
     */
    public function index(Request $request): JsonResponse
    {
        $courses = Course::where('user_id', $request->user()->id)
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();

        return response()->json(
            CourseResource::collection($courses)
        );
    }

    /**
     * POST /api/courses
     */
    public function store(StoreCourseRequest $request): JsonResponse
    {
        $course = Course::create([
            ...$request->validated(),
            'user_id'   => $request->user()->id,
            'color_hex' => $request->color_hex ?? '#3498db',
        ]);

        return response()->json(
            new CourseResource($course),
            201
        );
    }

    /**
     * GET /api/courses/{id}
     */
    public function show(Request $request, Course $course): JsonResponse
    {
        $this->authorizeOwnership($request, $course->user_id);

        return response()->json(new CourseResource($course));
    }

    /**
     * PUT /api/courses/{id}
     */
    public function update(UpdateCourseRequest $request, Course $course): JsonResponse
    {
        $this->authorizeOwnership($request, $course->user_id);

        $course->update($request->validated());

        return response()->json(new CourseResource($course->fresh()));
    }

    /**
     * DELETE /api/courses/{id}
     */
    public function destroy(Request $request, Course $course): JsonResponse
    {
        $this->authorizeOwnership($request, $course->user_id);

        $course->delete();

        return response()->json(['message' => 'Course deleted successfully'], 200);
    }

    private function authorizeOwnership(Request $request, int $ownerId): void
    {
        if ($request->user()->id !== $ownerId) {
            abort(403, 'Forbidden');
        }
    }
}
```

### 7.4 `app/Http/Controllers/Api/TaskController.php`

> `GET /tasks` mendukung query param `?course_id=X` untuk filter opsional.
> `PATCH /tasks/{id}/finish` adalah endpoint khusus untuk toggle selesai.

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    /**
     * GET /api/tasks
     * Optional query: ?course_id=1
     */
    public function index(Request $request): JsonResponse
    {
        $query = Task::where('user_id', $request->user()->id)
            ->orderBy('deadline');

        if ($request->has('course_id') && $request->course_id !== null) {
            $query->where('course_id', $request->course_id);
        }

        return response()->json(
            TaskResource::collection($query->get())
        );
    }

    /**
     * POST /api/tasks
     */
    public function store(StoreTaskRequest $request): JsonResponse
    {
        $task = Task::create([
            ...$request->validated(),
            'user_id'     => $request->user()->id,
            'is_finished' => $request->is_finished ?? false,
            'is_priority' => $request->is_priority ?? false,
        ]);

        return response()->json(new TaskResource($task), 201);
    }

    /**
     * GET /api/tasks/{id}
     */
    public function show(Request $request, Task $task): JsonResponse
    {
        $this->authorizeOwnership($request, $task->user_id);

        return response()->json(new TaskResource($task));
    }

    /**
     * PUT /api/tasks/{id}
     */
    public function update(UpdateTaskRequest $request, Task $task): JsonResponse
    {
        $this->authorizeOwnership($request, $task->user_id);

        $task->update($request->validated());

        return response()->json(new TaskResource($task->fresh()));
    }

    /**
     * PATCH /api/tasks/{id}/finish
     * Toggle is_finished ke true.
     */
    public function finish(Request $request, Task $task): JsonResponse
    {
        $this->authorizeOwnership($request, $task->user_id);

        $task->update(['is_finished' => true]);

        return response()->json(new TaskResource($task->fresh()));
    }

    /**
     * DELETE /api/tasks/{id}
     */
    public function destroy(Request $request, Task $task): JsonResponse
    {
        $this->authorizeOwnership($request, $task->user_id);

        $task->delete();

        return response()->json(['message' => 'Task deleted successfully'], 200);
    }

    private function authorizeOwnership(Request $request, int $ownerId): void
    {
        if ($request->user()->id !== $ownerId) {
            abort(403, 'Forbidden');
        }
    }
}
```

### 7.5 `app/Http/Controllers/Api/NoteController.php`

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreNoteRequest;
use App\Http\Requests\UpdateNoteRequest;
use App\Http\Resources\NoteResource;
use App\Models\Note;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    /**
     * GET /api/notes
     */
    public function index(Request $request): JsonResponse
    {
        $notes = Note::where('user_id', $request->user()->id)
            ->orderByDesc('updated_at')
            ->get();

        return response()->json(NoteResource::collection($notes));
    }

    /**
     * POST /api/notes
     */
    public function store(StoreNoteRequest $request): JsonResponse
    {
        $note = Note::create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
        ]);

        return response()->json(new NoteResource($note), 201);
    }

    /**
     * GET /api/notes/{id}
     */
    public function show(Request $request, Note $note): JsonResponse
    {
        $this->authorizeOwnership($request, $note->user_id);

        return response()->json(new NoteResource($note));
    }

    /**
     * PUT /api/notes/{id}
     */
    public function update(UpdateNoteRequest $request, Note $note): JsonResponse
    {
        $this->authorizeOwnership($request, $note->user_id);

        $note->update($request->validated());

        return response()->json(new NoteResource($note->fresh()));
    }

    /**
     * DELETE /api/notes/{id}
     */
    public function destroy(Request $request, Note $note): JsonResponse
    {
        $this->authorizeOwnership($request, $note->user_id);

        $note->delete();

        return response()->json(['message' => 'Note deleted successfully'], 200);
    }

    private function authorizeOwnership(Request $request, int $ownerId): void
    {
        if ($request->user()->id !== $ownerId) {
            abort(403, 'Forbidden');
        }
    }
}
```

---

## Langkah 8 — Routes

Edit `routes/api.php` — **ini adalah satu-satunya file routes yang perlu diubah**.

```php
<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\NoteController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\TaskController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes (tidak butuh token)
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

/*
|--------------------------------------------------------------------------
| Protected Routes (butuh Bearer token dari Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // Logout
    Route::post('/logout', [AuthController::class, 'logout']);

    // Profile
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);

    // Courses — CRUD
    Route::apiResource('courses', CourseController::class);

    // Tasks — CRUD + custom finish endpoint
    Route::patch('/tasks/{task}/finish', [TaskController::class, 'finish']);
    Route::apiResource('tasks', TaskController::class);

    // Notes — CRUD
    Route::apiResource('notes', NoteController::class);
});
```

---

## Langkah 9 — Exception Handler (Error Response Konsisten)

Edit `bootstrap/app.php`, tambahkan di dalam `->withExceptions()`:

```php
->withExceptions(function (Exceptions $exceptions) {

    // Validasi gagal → 422 dengan format field errors
    $exceptions->render(function (
        \Illuminate\Validation\ValidationException $e,
        \Illuminate\Http\Request $request
    ) {
        if ($request->expectsJson() || $request->is('api/*')) {
            return response()->json([
                'message' => $e->getMessage(),
                'errors'  => $e->errors(),
            ], 422);
        }
    });

    // Unauthenticated → 401
    $exceptions->render(function (
        \Illuminate\Auth\AuthenticationException $e,
        \Illuminate\Http\Request $request
    ) {
        if ($request->expectsJson() || $request->is('api/*')) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }
    });

    // Model not found → 404
    $exceptions->render(function (
        \Illuminate\Database\Eloquent\ModelNotFoundException $e,
        \Illuminate\Http\Request $request
    ) {
        if ($request->expectsJson() || $request->is('api/*')) {
            return response()->json([
                'message' => 'Resource not found.',
            ], 404);
        }
    });
})
```

---

## Langkah 10 — Jalankan & Verifikasi

```bash
php artisan migrate:fresh
php artisan serve
```

Verifikasi setiap endpoint dengan curl atau Postman menggunakan kontrak berikut.

---

## Kontrak API Lengkap (Referensi Testing)

### Auth

**Register**
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "Budi Santoso",
  "email": "budi@example.com",
  "password": "rahasia123",
  "password_confirmation": "rahasia123",
  "nim": "202303001"
}

→ 201
{
  "message": "Registration successful",
  "user": { "id": 1, "name": "Budi Santoso", "email": "budi@example.com",
             "nim": "202303001", "major": null, "semester": null, "profile_photo_url": null }
}
```

**Login**
```
POST /api/auth/login
Content-Type: application/json

{ "email": "budi@example.com", "password": "rahasia123" }

→ 200
{ "token": "1|abc123xyz...", "user": { ... } }
```

**Logout**
```
POST /api/logout
Authorization: Bearer 1|abc123xyz...

→ 200
{ "message": "Logged out successfully" }
```

### Profile

```
GET /api/profile
Authorization: Bearer <token>

→ 200
{ "id": 1, "name": "Budi Santoso", "email": "...", "nim": "...",
  "major": null, "semester": null, "profile_photo_url": null }
```

### Courses

**List**
```
GET /api/courses
Authorization: Bearer <token>

→ 200
[
  { "id": 1, "user_id": 1, "course_code": "CS101", "course_name": "Algoritma",
    "sks": 3, "lecturer_name": "Dr. Slamet", "room": "Ruang 301",
    "day_of_week": "Monday", "start_time": "08:00", "end_time": "10:00",
    "color_hex": "#3498db" }
]
```

**Create**
```
POST /api/courses
Authorization: Bearer <token>
Content-Type: application/json

{
  "course_code": "CS101",
  "course_name": "Algoritma & Pemrograman",
  "sks": 3,
  "lecturer_name": "Dr. Slamet",
  "room": "Ruang 301",
  "day_of_week": "Monday",
  "start_time": "08:00",
  "end_time": "10:00",
  "color_hex": "#3498db"
}

→ 201 { "id": 1, "user_id": 1, ... }
```

### Tasks

**List (all)**
```
GET /api/tasks
Authorization: Bearer <token>

→ 200 [ { "id": 1, "user_id": 1, "course_id": 1, "task_title": "Laporan Akhir",
           "description": "...", "deadline": "2026-06-10 23:59:00",
           "is_finished": false, "is_priority": true } ]
```

**List (filtered by course)**
```
GET /api/tasks?course_id=1
Authorization: Bearer <token>
→ 200 [ ... hanya task milik course_id=1 ... ]
```

**Create**
```
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "course_id": 1,
  "task_title": "Laporan Akhir",
  "description": "Buat laporan proyek akhir",
  "deadline": "2026-06-10 23:59:00",
  "is_finished": 0,
  "is_priority": 1
}

→ 201 { "id": 1, ... }
```

**Finish (toggle selesai)**
```
PATCH /api/tasks/1/finish
Authorization: Bearer <token>

→ 200 { "id": 1, ..., "is_finished": true }
```

### Notes

**List**
```
GET /api/notes
Authorization: Bearer <token>

→ 200 [ { "id": 1, "user_id": 1, "course_id": 1,
           "title": "Catatan Pertemuan 1", "content": "Isi catatan..." } ]
```

**Create**
```
POST /api/notes
Authorization: Bearer <token>
Content-Type: application/json

{
  "course_id": 1,
  "title": "Catatan Pertemuan 1",
  "content": "Isi catatan lengkap di sini..."
}

→ 201 { "id": 1, ... }
```

---

## Checklist Validasi Akhir

Sebelum dinyatakan selesai, pastikan seluruh checklist ini terpenuhi:

- [ ] `POST /api/auth/register` → 201, response berisi `user` object
- [ ] `POST /api/auth/login` → 200, response berisi `token` (bukan `access_token`)
- [ ] `POST /api/logout` dengan token valid → 200
- [ ] `POST /api/logout` tanpa token → 401
- [ ] `GET /api/profile` dengan token valid → 200, berisi semua field user
- [ ] `GET /api/courses` hanya mengembalikan data user yang sedang login
- [ ] `POST /api/courses` menyimpan `user_id` dari token (bukan dari body request)
- [ ] `PUT /api/courses/{id}` oleh user lain → 403
- [ ] `DELETE /api/courses/{id}` → 200 (bukan 204, karena Flutter mengecek status 200)
- [ ] `GET /api/tasks` mengembalikan `deadline` dalam format `"YYYY-MM-DD HH:MM:SS"` (string dengan spasi, bukan `T`)
- [ ] `GET /api/tasks?course_id=1` mengembalikan hanya task dengan course_id=1
- [ ] `PATCH /api/tasks/{id}/finish` → 200, `is_finished` berubah ke `true`
- [ ] `GET /api/tasks` — field `is_finished` dan `is_priority` bertipe **boolean** (`true`/`false`), bukan integer
- [ ] `DELETE /api/tasks/{id}` → 200
- [ ] `GET /api/notes` mengembalikan semua catatan user, diurutkan dari terbaru
- [ ] `POST /api/notes` dengan `course_id: null` → berhasil (opsional)
- [ ] `PUT /api/notes/{id}` oleh user lain → 403
- [ ] `DELETE /api/notes/{id}` → 200
- [ ] Request tanpa token ke endpoint protected → 401 dengan `{ "message": "Unauthenticated." }`
- [ ] Request dengan body invalid → 422 dengan `{ "message": "...", "errors": { ... } }`
- [ ] CORS header `Access-Control-Allow-Origin` tersedia di semua response untuk domain frontend
- [ ] Semua nama field response **identik** dengan yang terdaftar di API Contracts di atas
