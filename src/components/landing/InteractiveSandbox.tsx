/**
 * =============================================================================
 * Planly — InteractiveSandbox.tsx
 * 
 * Kegunaan:
 * Berkas kode dalam proyek Planly.
 * 
 * Relasi & Dependency:
 * - Berhubungan dengan modul utama aplikasi.
 * 
 * Aliran Data / State:
 * - Mengikuti alur data terpadu (REST API / local mock storage).
 * =============================================================================
 */

import { useState, useEffect } from 'react';
import { Zap, Play, Pause, RotateCcw, Check } from 'lucide-react';

export default function InteractiveSandbox() {
  // --- STATE INTERACTIVE PLAYGROUND ---
  const [playSeconds, setPlaySeconds] = useState(1500); // 25 menit default
  const [isPlayRunning, setIsPlayRunning] = useState(false);
  const [playStage, setPlayStage] = useState<'work' | 'break'>('work');
  const [playTasks, setPlayTasks] = useState([
    { id: 1, title: 'Menyusun dokumen SRS RPL', done: false, course: 'Rekayasa Perangkat Lunak' },
    { id: 2, title: 'Mempelajari subnetting IPv4', done: true, course: 'Komputasi Awan' },
    { id: 3, title: 'Membuat halaman register Flutter', done: false, course: 'Website Programming Lanjut' },
  ]);

  // Pomodoro countdown simulation
  useEffect(() => {
    let timer: any = null;
    if (isPlayRunning) {
      timer = setInterval(() => {
        setPlaySeconds((prev) => {
          if (prev <= 1) {
            setIsPlayRunning(false);
            if (playStage === 'work') {
              setPlayStage('break');
              return 300; // Istirahat 5 menit
            } else {
              setPlayStage('work');
              return 1500; // Fokus 25 menit
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlayRunning, playStage]);

  const toggleTask = (id: number) => {
    setPlayTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const formatPlayTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <section id="playground" className="relative z-10 py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-900 scroll-mt-20">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-4 shadow-sm select-none">
          <Zap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Interactive Sandbox</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          Coba Demo Sandbox Planly
        </h2>
        <p className="text-slate-600 dark:text-slate-400 font-medium text-sm sm:text-base">
          Cobalah interaksi timer fokus dan penandaan checklist tugas di bawah ini secara langsung untuk merasakan fungsionalitas workspace kami.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* Playground Left: Interactive Pomodoro Timer widget */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1322] p-6 sm:p-8 flex flex-col justify-between min-h-[360px] shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Modul Timer Pomodoro</span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              playStage === 'work' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20' : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
            }`}>
              {playStage === 'work' ? 'Sesi Belajar' : 'Sesi Istirahat'}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center my-6">
            <div className="text-6xl font-black text-slate-900 dark:text-white tracking-tight select-none font-mono">
              {formatPlayTime(playSeconds)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-2">
              {isPlayRunning ? 'Timer sedang berjalan...' : 'Timer dihentikan sementara'}
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setIsPlayRunning(!isPlayRunning)}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-150 ${
                isPlayRunning 
                  ? 'bg-red-500 hover:bg-red-650 active:bg-red-750 text-white' 
                  : 'bg-indigo-600 hover:bg-indigo-600 active:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20'
              }`}
            >
              {isPlayRunning ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white" />}
              <span>{isPlayRunning ? 'Jeda Timer' : 'Mulai Fokus'}</span>
            </button>
            <button
              onClick={() => {
                setIsPlayRunning(false);
                setPlaySeconds(playStage === 'work' ? 1500 : 300);
              }}
              className="px-4 py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl cursor-pointer transition-colors"
              aria-label="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Playground Right: Interactive Checklist Tasks */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1322] p-6 sm:p-8 flex flex-col justify-between min-h-[360px] shadow-sm">
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Modul Checklist Tugas Kuliah</span>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">Centang Instan</span>
            </div>

            <div className="space-y-3">
              {playTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`p-3.5 rounded-xl border transition-all duration-150 flex items-start gap-3 cursor-pointer ${
                    task.done 
                      ? 'border-indigo-200 dark:border-indigo-600/40 bg-indigo-50/20 dark:bg-indigo-600/5 text-slate-400 opacity-75' 
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                    task.done 
                      ? 'bg-indigo-600 border-indigo-650 text-white' 
                      : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 text-transparent'
                  }`}>
                    <Check className="w-3 h-3 stroke-[3px] text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className={`text-xs font-bold ${task.done ? 'line-through text-slate-500' : ''}`}>
                      {task.title}
                    </h4>
                    <p className="text-[9px] text-slate-500 dark:text-slate-500 font-semibold mt-0.5">{task.course}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[10px] text-slate-500 dark:text-slate-500 font-semibold text-center border-t border-slate-100 dark:border-slate-900 pt-4 mt-4 select-none">
            Centang tugas di atas untuk mensimulasikan sinkronisasi tugas selesai secara dinamis.
          </div>
        </div>

      </div>
    </section>
  );
}
