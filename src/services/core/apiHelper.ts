// =============================================================================
// Planly — API Service Helpers & Enkapsulasi Mock
//
// File ini isinya helper utility yang dipake rame-rame sama semua modul servis.
// Di sini kita enkapsulasi variabel state 'mockIdCounter' dan nyediain fungsi
// getNextMockId() biar modul-modul servis gak bisa ngubah state ID secara langsung.
// =============================================================================



// Cek status mode mock berdasarkan VITE_USE_MOCK.
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// Helper buat nahan response pas mode mock biar ada loading delay.
export const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper buat ngambil data ter-update dari localStorage dengan fallback data awal.
export const getStored = <T>(key: string, fallback: T): T => {
  if (key === 'planly_courses') {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as any[];
        const hasOldCodes = parsed.some(c => c.course_code && (c.course_code.startsWith('TIF') || c.course_code.startsWith('CS')));
        if (hasOldCodes) {
          localStorage.removeItem('planly_courses');
          localStorage.removeItem('planly_tasks');
          localStorage.removeItem('planly_notes');
          localStorage.removeItem('planly_user');
          localStorage.removeItem('planly_token');
          localStorage.removeItem('planly_auth');
          setTimeout(() => window.location.reload(), 100);
          return fallback;
        }
      } catch (e) {
        console.error("Gagal melakukan verifikasi data localStorage:", e);
      }
    }
  }
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : fallback;
};

// Helper buat nyimpen data ke localStorage browser.
export const setStored = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// State ID counter yang di-enkapsulasi. Hanya bisa diakses/ditambah lewat getNextMockId()
let mockIdCounter = 100;

export const getNextMockId = (): number => {
  return ++mockIdCounter;
};
