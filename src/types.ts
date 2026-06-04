// =============================================================================
// Planly — TypeScript Types (aligned with Laravel REST API contract)
// Field names match Laravel API JSON response keys exactly (snake_case).
// =============================================================================

export interface User {
  id: number;
  name: string;
  email: string;
  nim: string | null;
  major: string | null;
  semester: number | null;
  profile_photo_url: string | null;
}

export interface Course {
  id: number;
  user_id: number;
  course_code: string;
  course_name: string;
  sks: number;
  lecturer_name: string;
  room: string;
  day_of_week: string;  // 'Monday', 'Tuesday', etc.
  start_time: string;   // "HH:MM" format
  end_time: string;     // "HH:MM" format
  color_hex: string;
}

export interface Task {
  id: number;
  user_id: number;
  course_id: number | null;
  task_title: string;
  description: string | null;
  deadline: string;     // "YYYY-MM-DD HH:MM:SS" format
  is_finished: boolean;
  is_priority: boolean;
}

export interface Note {
  id: number;
  user_id: number;
  course_id: number | null;
  title: string;
  content: string;
}

// --- Auth DTOs (matching Laravel request/response shapes) ---

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  nim?: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

// --- CRUD DTOs ---

export type CourseCreatePayload = Omit<Course, 'id' | 'user_id'>;
export type CourseUpdatePayload = Partial<CourseCreatePayload>;

export type TaskCreatePayload = Omit<Task, 'id' | 'user_id'>;
export type TaskUpdatePayload = Partial<TaskCreatePayload>;

export type NoteCreatePayload = Omit<Note, 'id' | 'user_id'>;
export type NoteUpdatePayload = Partial<NoteCreatePayload>;

export interface ProfileUpdatePayload {
  name?: string;
  email?: string;
  nim?: string | null;
  major?: string | null;
  semester?: number | null;
}

// --- App Navigation ---

export type SidebarTab = 'today' | 'calendar' | 'tasks' | 'courses' | 'notes' | 'profile';
