/**
 * Utilitas Warna untuk Planly
 * 
 * Berisi fungsi bantuan untuk konversi warna kustom HEX ke format RGB
 * untuk digunakan dalam variabel CSS Glow Shadow (Glassmorphism).
 */

export function hexToRgb(hex: string): string {
  const cleaned = hex.replace(/^#/, '');
  
  let r = 0, g = 0, b = 0;
  if (cleaned.length === 3) {
    r = parseInt(cleaned[0] + cleaned[0], 16);
    g = parseInt(cleaned[1] + cleaned[1], 16);
    b = parseInt(cleaned[2] + cleaned[2], 16);
  } else if (cleaned.length === 6) {
    r = parseInt(cleaned.substring(0, 2), 16);
    g = parseInt(cleaned.substring(2, 4), 16);
    b = parseInt(cleaned.substring(4, 6), 16);
  }
  
  return `${r},${g},${b}`;
}
