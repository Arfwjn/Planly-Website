// =============================================================================
// Planly — useFocusTimer Custom Hook (Manajemen Sesi Fokus & Kuliah Live)
//
// Hook ini dipake buat ngelola sistem timer fokus (Pomodoro) dan tracker durasi
// perkuliahan live (Lecture timer), lengkap dengan bunyi chime/beep ketika timer habis.
// =============================================================================

import { useState, useEffect } from 'react';
import { useToast } from '../components/ui/Toast';

export default function useFocusTimer() {
  const toast = useToast();

  // --- STATE POMODORO ---
  const [focusTimeLeft, setFocusTimeLeft] = useState(1500); // 25 menit default
  const [isFocusTimerRunning, setIsFocusTimerRunning] = useState(false);
  const [pomodoroStage, setPomodoroStage] = useState<'work' | 'short-break' | 'long-break'>('work');
  const [pomodoroTaskId, setPomodoroTaskId] = useState<number | null>(null);
  const [completedPomodoroCount, setCompletedPomodoroCount] = useState(0);

  // --- STATE RUANG BELAJAR LAINNYA ---
  const [workspaceMode, setWorkspaceMode] = useState<'pomodoro' | 'lecture'>('pomodoro');
  const [lectureTime, setLectureTime] = useState(0);
  const [isLectureRunning, setIsLectureRunning] = useState(false);
  const [activeLectureCourseId, setActiveLectureCourseId] = useState<number | null>(null);
  const [lectureNoteContent, setLectureNoteContent] = useState('');

  // Fungsi buat bunyikan chime/beep via Web Audio API pas waktu fokus/istirahat habis.
  const playChimeSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // Nada D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // Nada A5
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn("Autoplay audio terblokir oleh browser atau tidak didukung", e);
    }
  };

  // Effect buat ngejalanin hitung mundur (countdown) timer Pomodoro setiap detik.
  useEffect(() => {
    let interval: any = null;
    if (isFocusTimerRunning) {
      if (focusTimeLeft > 0) {
        interval = setInterval(() => {
          setFocusTimeLeft((prev) => prev - 1);
        }, 1000);
      } else {
        // Sesi selesai (waktu mencapai 0)
        setIsFocusTimerRunning(false);
        playChimeSound();

        if (pomodoroStage === 'work') {
          const nextCount = completedPomodoroCount + 1;
          setCompletedPomodoroCount(nextCount);
          if (nextCount > 0 && nextCount % 4 === 0) {
            setPomodoroStage('long-break');
            setFocusTimeLeft(900); // Istirahat panjang 15 menit
            toast.success('Luar biasa! 4 sesi fokus selesai. Nikmati istirahat panjang (15 menit) Anda!');
          } else {
            setPomodoroStage('short-break');
            setFocusTimeLeft(300); // Istirahat pendek 5 menit
            toast.info('Sesi fokus selesai! Ambil napas dan istirahat pendek (5 menit).');
          }
        } else {
          // Dari break kembali ke work
          setPomodoroStage('work');
          setFocusTimeLeft(1500); // 25 menit
          toast.info('Istirahat selesai! Mari kembali fokus.');
        }
      }
    }
    return () => clearInterval(interval);
  }, [isFocusTimerRunning, focusTimeLeft, pomodoroStage, completedPomodoroCount]);

  // Effect buat ngitung durasi kuliah (live lecture timer) yang berjalan setiap detik.
  useEffect(() => {
    let interval: any = null;
    if (isLectureRunning) {
      interval = setInterval(() => {
        setLectureTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLectureRunning]);

  // Reset timer Pomodoro ke durasi awal sesuai stage aktif.
  const handleResetFocusTimer = () => {
    setFocusTimeLeft(pomodoroStage === 'work' ? 1500 : pomodoroStage === 'short-break' ? 300 : 900);
    setIsFocusTimerRunning(false);
  };

  return {
    focusTimeLeft,
    setFocusTimeLeft,
    isFocusTimerRunning,
    setIsFocusTimerRunning,
    pomodoroStage,
    setPomodoroStage,
    pomodoroTaskId,
    setPomodoroTaskId,
    completedPomodoroCount,
    setCompletedPomodoroCount,
    workspaceMode,
    setWorkspaceMode,
    lectureTime,
    setLectureTime,
    isLectureRunning,
    setIsLectureRunning,
    activeLectureCourseId,
    setActiveLectureCourseId,
    lectureNoteContent,
    setLectureNoteContent,
    handleResetFocusTimer,
  };
}
