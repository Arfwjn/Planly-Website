// =============================================================================
// Planly — API Service Layer Entry Point (Gerbang Utama API)
//
// File ini disederhanakan sebagai entry point tunggal (Separation of Concerns).
// Kita ngimpor semua modul servis mandiri yang udah dipecah-pecah, terus ngumpulin
// mereka ke dalam satu objek 'api' terpadu. Cara panggilnya tetep sama persis,
// jadi komponen-komponen UI React gak ada yang perlu diubah.
// =============================================================================

import { authService } from './auth/authService';
import { profileService } from './profile/profileService';
import { coursesService } from './courses/coursesService';
import { tasksService } from './tasks/tasksService';
import { notesService } from './notes/notesService';
import { eventsService } from './events/eventsService';
import { reschedulesService } from './reschedules/reschedulesService';
import { attendanceService } from './attendance/attendanceService';

export const api = {
  auth: authService,
  profile: profileService,
  courses: coursesService,
  tasks: tasksService,
  notes: notesService,
  events: eventsService,
  reschedules: reschedulesService,
  attendance: attendanceService,
};
