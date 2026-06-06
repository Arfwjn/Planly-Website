import { useEffect } from 'react';
import { Task, Course, SidebarTab } from '../types';

interface UseDeadlineMonitorProps {
  tasks: Task[];
  courses: Course[];
  setActiveTab: (tab: SidebarTab) => void;
  setAutoInspectTaskId: (id: number | null) => void;
}

/**
 * Custom Hook: useDeadlineMonitor
 * 
 * Hook ini memantau deadline tugas-tugas kuliah yang belum selesai serta jadwal kuliah harian
 * dalam latar belakang (background process).
 * Setiap 60 detik, hook akan memeriksa sisa waktu pengerjaan tugas dan waktu mulai kuliah,
 * lalu menembakkan notifikasi browser sistem jika mendekati batas waktu.
 */
export default function useDeadlineMonitor({
  tasks,
  courses,
  setActiveTab,
  setAutoInspectTaskId,
}: UseDeadlineMonitorProps) {
  useEffect(() => {
    // Pastikan browser mendukung notifikasi
    if (!('Notification' in window)) return;

    const checkDeadlinesAndSchedules = () => {
      // 1. Periksa apakah notifikasi aktif di setelan profil user
      const isEnabled = localStorage.getItem('planly_notifications_enabled') !== 'false';
      if (!isEnabled) return;

      // 2. Periksa izin notifikasi dari browser
      if (Notification.permission !== 'granted') return;

      const notifiedRecords = getNotifiedRecords();
      const notifiedSchedules = getNotifiedSchedules();

      // --- MONITOR TUGAS ---
      tasks.forEach((task) => {
        // Hanya pantau tugas yang belum selesai
        if (task.is_finished) return;

        // Parse deadline tanggal
        const deadlineDate = new Date(task.deadline.replace(' ', 'T'));
        const diffMs = deadlineDate.getTime() - Date.now();
        const diffMins = Math.round(diffMs / 60000);

        // Abaikan tugas yang sudah lewat deadline jauh (terlambat)
        if (diffMins < 0) return;

        let intervalType = '';
        let message = '';

        if (diffMins > 1430 && diffMins <= 1450) {
          // ~24 jam sebelum tenggat waktu
          intervalType = '24h';
          message = 'Batas waktu tugas tersisa 24 jam lagi. Jangan lupa dikerjakan ya!';
        } else if (diffMins > 50 && diffMins <= 70) {
          // ~1 jam sebelum tenggat waktu
          intervalType = '1h';
          message = 'Tugas ini harus dikumpulkan dalam waktu 1 jam lagi! Yuk selesaikan.';
        } else if (diffMins > 5 && diffMins <= 20) {
          // ~15 menit sebelum tenggat waktu
          intervalType = '15m';
          message = '⚠️ Darurat! Waktu pengerjaan tugas tersisa 15 menit lagi. Segera serahkan!';
        }

        // Jika terdeteksi masuk salah satu rentang peringatan
        if (intervalType && message) {
          const taskNotifiedIntervals = notifiedRecords[task.id] || [];

          // Kirim notifikasi jika belum pernah dilaporkan di rentang waktu ini
          if (!taskNotifiedIntervals.includes(intervalType)) {
            const course = courses.find((c) => c.id === task.course_id);
            const courseLabel = course ? `[${course.course_name}]` : '[Tugas Umum / Pribadi]';

            const notification = new Notification(`Planly: ${task.task_title}`, {
              body: `${courseLabel} ${message}`,
              icon: '/assets/logo.png', // Fallback icon jika ada
              tag: `task-deadline-${task.id}-${intervalType}`,
              requireInteraction: intervalType === '15m' || intervalType === '1h', // Tetap tampil di layar jika darurat
            });

            notification.onclick = (e) => {
              e.preventDefault();
              window.focus();
              setActiveTab('tasks');
              setAutoInspectTaskId(task.id);
              notification.close();
            };

            // Simpan riwayat notifikasi agar tidak terkirim ganda
            markAsNotified(task.id, intervalType, notifiedRecords);
          }
        }
      });

      // --- MONITOR JADWAL KULIAH ---
      const today = new Date();
      const ENGLISH_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const todayEnglishDay = ENGLISH_DAYS[today.getDay()];
      const todayCourses = courses.filter((c) => c.day_of_week === todayEnglishDay);

      todayCourses.forEach((course) => {
        const [hours, minutes] = course.start_time.split(':').map(Number);
        const startTime = new Date();
        startTime.setHours(hours, minutes, 0, 0);

        const diffMs = startTime.getTime() - Date.now();
        const diffMins = Math.round(diffMs / 60000);

        // Jika kuliah akan dimulai dalam waktu 10 hingga 15 menit ke depan
        if (diffMins > 0 && diffMins <= 15) {
          const dateStr = today.toISOString().split('T')[0];
          const scheduleKey = `${course.id}-${dateStr}`;

          if (!notifiedSchedules.includes(scheduleKey)) {
            const notification = new Notification(`Planly: Kuliah Akan Dimulai`, {
              body: `Mata kuliah "${course.course_name}" akan dimulai pada pukul ${course.start_time} di Ruang ${course.room}. Jangan terlambat!`,
              icon: '/assets/logo.png',
              tag: `course-schedule-${scheduleKey}`,
            });

            notification.onclick = (e) => {
              e.preventDefault();
              window.focus();
              setActiveTab('courses');
              notification.close();
            };

            markScheduleAsNotified(scheduleKey, notifiedSchedules);
          }
        }
      });
    };

    // Jalankan cek pertama saat mount
    checkDeadlinesAndSchedules();

    // Jalankan cek berkala setiap 60 detik
    const interval = setInterval(checkDeadlinesAndSchedules, 60000);

    return () => clearInterval(interval);
  }, [tasks, courses, setActiveTab, setAutoInspectTaskId]);
}

/**
 * Mengambil rekam data notifikasi deadline dari localStorage
 */
function getNotifiedRecords(): Record<number, string[]> {
  try {
    const saved = localStorage.getItem('planly_notified_deadlines');
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    return {};
  }
}

/**
 * Menyimpan tanda bahwa tugas X pada interval Y telah dikirimkan notifikasi
 */
function markAsNotified(taskId: number, intervalType: string, currentRecords: Record<number, string[]>) {
  if (!currentRecords[taskId]) {
    currentRecords[taskId] = [];
  }
  if (!currentRecords[taskId].includes(intervalType)) {
    currentRecords[taskId].push(intervalType);
  }
  localStorage.setItem('planly_notified_deadlines', JSON.stringify(currentRecords));
}

/**
 * Mengambil rekam data notifikasi jadwal kuliah dari localStorage
 */
function getNotifiedSchedules(): string[] {
  try {
    const saved = localStorage.getItem('planly_notified_schedules');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Menyimpan tanda bahwa jadwal kuliah telah dikirimkan notifikasi hari ini
 */
function markScheduleAsNotified(scheduleKey: string, currentRecords: string[]) {
  if (!currentRecords.includes(scheduleKey)) {
    currentRecords.push(scheduleKey);
    // Batasi histori simpanan agar tidak membesar tanpa batas (simpan 100 item terakhir)
    if (currentRecords.length > 100) {
      currentRecords.shift();
    }
    localStorage.setItem('planly_notified_schedules', JSON.stringify(currentRecords));
  }
}
