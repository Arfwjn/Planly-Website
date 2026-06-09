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
    return (localStorage.getItem('planly_theme') as 'light' | 'dark') || 'light';
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
