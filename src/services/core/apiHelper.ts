// SAKELAR UTAMA: Set langsung ke false agar aplikasi murni menembak API Laravel
export const USE_MOCK = false;

export const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const getStored = <T>(key: string, fallback: T): T => {
  if (key === 'planly_courses') {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as any[];
        const hasOldCodes = parsed.some((c) => c.course_code && (c.course_code.startsWith('TIF') || c.course_code.startsWith('CS')));
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
        console.error('Gagal melakukan verifikasi data localStorage:', e);
      }
    }
  }
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : fallback;
};

export const setStored = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

let mockIdCounter = 100;

export const getNextMockId = (): number => {
  return ++mockIdCounter;
};
