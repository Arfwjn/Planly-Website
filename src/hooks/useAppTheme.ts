// =============================================================================
// Planly — useAppTheme Custom Hook (Pengaturan Tema Global)
//
// Hook ini khusus buat ngurusin pergantian tema terang (light) / gelap (dark)
// pada aplikasi. Tema yang dipilih bakal disimpen ke localStorage biar pas
// dibuka lagi tampilannya tetep konsisten.
// =============================================================================

import { useState, useEffect } from 'react';

export default function useAppTheme() {
  // Ambil tema awal dari localStorage. Kalau kosong, default-nya 'light'.
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('planly_theme') as 'light' | 'dark' | null;
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    // Jika belum ada tema yang disimpan, sesuaikan dengan preferensi sistem bawaan
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  // Setiap kali tema berubah, kita update class 'dark' di root HTML element (document.documentElement).
  // Serta simpen settingan tema terbaru ke localStorage.
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('planly_theme', theme);
  }, [theme]);

  return { theme, setTheme };
}
