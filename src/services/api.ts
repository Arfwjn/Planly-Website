// =============================================================================
// Planly — API Service Layer Entry Point (Gerbang Utama API)
//
// File ini disederhanakan sebagai entry point tunggal (Separation of Concerns).
// Kita ngimpor semua modul servis mandiri yang udah dipecah-pecah, terus ngumpulin
// mereka ke dalam satu objek 'api' terpadu. Cara panggilnya tetep sama persis,
// jadi komponen-komponen UI React gak ada yang perlu diubah.
// =============================================================================

import { authService } from './authService';
import { profileService } from './profileService';
import { coursesService } from './coursesService';
import { tasksService } from './tasksService';
import { notesService } from './notesService';
import { eventsService } from './eventsService';
import { reschedulesService } from './reschedulesService';
import { attendanceService } from './attendanceService';

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
