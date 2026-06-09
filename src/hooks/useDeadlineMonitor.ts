// =============================================================================
// Planly — useDeadlineMonitor Custom Hook (Pemantau Deadline & Jadwal Kuliah)
//
// Hook ini dipake buat mantau deadline tugas-tugas kuliah yang belum selesai
// dan jadwal kuliah harian secara real-time di background (latar belakang).
// Setiap 60 detik, dia bakal ngecek sisa waktu tugas dan jadwal masuk kelas,
// terus ngirim notifikasi browser (push notification) biar user gak kelewatan.
// =============================================================================

import { useEffect } from 'react';
import { Task, Course, SidebarTab } from '../types';

interface UseDeadlineMonitorProps {
  tasks: Task[];
  courses: Course[];
  setActiveTab: (tab: SidebarTab) => void;
  setAutoInspectTaskId: (id: number | null) => void;
}

export default function useDeadlineMonitor({
  tasks,
  courses,
  setActiveTab,
  setAutoInspectTaskId,
}: UseDeadlineMonitorProps) {
  useEffect(() => {
    // Kalo browser jadul atau emang gak support notifikasi, langsung skip aja biar gak error
    if (!('Notification' in window)) return;

    const checkDeadlinesAndSchedules = () => {
      // 1. Cek dulu, user nyalain fitur notifikasi gak di pengaturan profilnya
      const isEnabled = localStorage.getItem('planly_notifications_enabled') !== 'false';
      if (!isEnabled) return;

      // 2. Cek juga apakah browser udah dapet izin (permission) buat nampilin notifikasi
      if (Notification.permission !== 'granted') return;

      // Ambil daftar tugas & jadwal yang udah pernah dinotifikasi biar gak spamming
      const notifiedRecords = getNotifiedRecords();
      const notifiedSchedules = getNotifiedSchedules();

      // --- 1. MONITOR TUGAS KULIAH ---
      tasks.forEach((task) => {
        // Kalo tugasnya udah selesai/dikumpul, ya gak usah dipantau lagi dong
        if (task.is_finished) return;

        // Ubah format string deadline biar bisa dibaca sama objek Date Javascript
        const deadlineDate = new Date(task.deadline.replace(' ', 'T'));
        const diffMs = deadlineDate.getTime() - Date.now();
        const diffMins = Math.round(diffMs / 60000); // Ubah selisih milidetik jadi menit

        // Kalo deadlinenya udah kelewat (minus), gak usah kirim notifikasi telat
        if (diffMins < 0) return;

        let intervalType = '';
        let message = '';

        // Tentukan jenis peringatan berdasarkan sisa waktu (24 jam, 1 jam, atau 15 menit)
        if (diffMins > 1430 && diffMins <= 1450) {
          // Sekitar 24 jam sebelum deadline
          intervalType = '24h';
          message = 'Batas waktu tugas tersisa 24 jam lagi. Jangan lupa dikerjakan ya!';
        } else if (diffMins > 50 && diffMins <= 70) {
          // Sekitar 1 jam sebelum deadline
          intervalType = '1h';
          message = 'Tugas ini harus dikumpulkan dalam waktu 1 jam lagi! Yuk selesaikan.';
        } else if (diffMins > 5 && diffMins <= 20) {
          // Sekitar 15 menit sebelum deadline (Udah gawat!)
          intervalType = '15m';
          message = '⚠️ Darurat! Waktu pengerjaan tugas tersisa 15 menit lagi. Segera serahkan!';
        }

        // Kalo sisa waktunya pas masuk salah satu kategori di atas, kita proses notifikasinya
        if (intervalType && message) {
          const taskNotifiedIntervals = notifiedRecords[task.id] || [];

          // Kirim notifikasi HANYA jika rentang waktu ini belum pernah dikirimin notifikasinya
          if (!taskNotifiedIntervals.includes(intervalType)) {
            const course = courses.find((c) => c.id === task.course_id);
            const courseLabel = course ? `[${course.course_name}]` : '[Tugas Umum / Pribadi]';

            // Kirim notifikasi sistem ke OS
            const notification = new Notification(`Planly: ${task.task_title}`, {
              body: `${courseLabel} ${message}`,
              icon: '/assets/logo.png', // Logo aplikasi Planly
              tag: `task-deadline-${task.id}-${intervalType}`, // Tag unik biar gak numpuk
              requireInteraction: intervalType === '15m' || intervalType === '1h', // Kalo mepet, notifikasi stay di layar
            });

            // Pas notifikasinya diklik sama user
            notification.onclick = (e) => {
              e.preventDefault();
              window.focus(); // Fokusin tab browser ke Planly
              setActiveTab('tasks'); // Pindahin view ke halaman Tugas
              setAutoInspectTaskId(task.id); // Auto buka modal/detail tugas yang dimaksud
              notification.close();
            };

            // Simpen riwayat biar gak ngirim notifikasi yang sama berulang kali
            markAsNotified(task.id, intervalType, notifiedRecords);
          }
        }
      });

      // --- 2. MONITOR JADWAL KULIAH HARIAN ---
      const today = new Date();
      const ENGLISH_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const todayEnglishDay = ENGLISH_DAYS[today.getDay()];
      // Cari kuliah apa aja yang terjadwal buat hari ini
      const todayCourses = courses.filter((c) => c.day_of_week === todayEnglishDay);

      todayCourses.forEach((course) => {
        // Pecah jam & menit mulai kelas (contoh: "08:00" -> hours=8, minutes=0)
        const [hours, minutes] = course.start_time.split(':').map(Number);
        const startTime = new Date();
        startTime.setHours(hours, minutes, 0, 0);

        const diffMs = startTime.getTime() - Date.now();
        const diffMins = Math.round(diffMs / 60000);

        // Kalo kuliah bakal mulai dalam 10 sampai 15 menit ke depan, ingatkan user!
        if (diffMins > 0 && diffMins <= 15) {
          const dateStr = today.toISOString().split('T')[0];
          const scheduleKey = `${course.id}-${dateStr}`; // Kunci unik per mata kuliah per tanggal hari ini

          // Kirim notifikasi kalo belum pernah diingetin hari ini
          if (!notifiedSchedules.includes(scheduleKey)) {
            const notification = new Notification(`Planly: Kuliah Akan Dimulai`, {
              body: `Mata kuliah "${course.course_name}" akan dimulai pada pukul ${course.start_time} di Ruang ${course.room}. Jangan terlambat!`,
              icon: '/assets/logo.png',
              tag: `course-schedule-${scheduleKey}`,
            });

            notification.onclick = (e) => {
              e.preventDefault();
              window.focus();
              setActiveTab('courses'); // Pindahin ke tab Mata Kuliah
              notification.close();
            };

            // Tandai jadwal hari ini udah dinotifikasi biar gak spam tiap menit
            markScheduleAsNotified(scheduleKey, notifiedSchedules);
          }
        }
      });
    };

    // Panggil pertama kali pas hook dipasang (mount)
    checkDeadlinesAndSchedules();

    // Set interval biar dicek otomatis tiap 60 detik (1 menit)
    const interval = setInterval(checkDeadlinesAndSchedules, 60000);

    // Bersihin interval pas komponen dibongkar (unmount) biar gak memory leak
    return () => clearInterval(interval);
  }, [tasks, courses, setActiveTab, setAutoInspectTaskId]);
}

/**
 * Fungsi pembantu buat ngambil data riwayat notifikasi deadline tugas dari localStorage
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
 * Fungsi pembantu buat nyatet kalo notifikasi deadline tugas X tipe Y udah terkirim
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
 * Fungsi pembantu buat ngambil data riwayat notifikasi jadwal kuliah dari localStorage
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
 * Fungsi pembantu buat nyatet kalo jadwal kelas X hari ini udah diingetin biar gak spam
 */
function markScheduleAsNotified(scheduleKey: string, currentRecords: string[]) {
  if (!currentRecords.includes(scheduleKey)) {
    currentRecords.push(scheduleKey);
    // Batasi biar isi array gak kepenuhan di local storage, simpen 100 terakhir aja udah cukup
    if (currentRecords.length > 100) {
      currentRecords.shift();
    }
    localStorage.setItem('planly_notified_schedules', JSON.stringify(currentRecords));
  }
}
