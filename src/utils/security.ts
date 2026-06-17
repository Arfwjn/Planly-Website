/**
 * =============================================================================
 * Planly — security.ts
 * 
 * Kegunaan:
 * Fungsi helper utility kustom (pemformatan iCalendar .ics, enkripsi API key browser fingerprint, konversi warna, dll.).
 * 
 * Relasi & Dependency:
 * - Dipanggil oleh berbagai modul servis/UI untuk tugas-tugas utilitas independen.
 * 
 * Aliran Data / State:
 * - Mengolah parameter masukan mentah (raw input) dan mengembalikan format keluaran terproses secara instan.
 * =============================================================================
 */

/**
 * Utilitas Keamanan untuk Proteksi API Key di Sisi Klien
 * 
 * Melindungi Gemini API Key dari pencurian data dalam plain-text di localStorage
 * dengan mengenkripsinya menggunakan kunci dinamis yang diturunkan dari fingerprint browser.
 */

// Menghasilkan sidik jari browser unik berbasis lingkungan client yang stabil
const getBrowserFingerprint = (): string => {
  if (typeof window === 'undefined') return 'planly_default_fallback_salt_321';
  
  // Gabungkan userAgent dan bahasa peramban (abaikan dimensi layar karena tidak stabil akibat zoom/resize)
  const components = [
    window.navigator?.userAgent || 'unknown_agent',
    window.navigator?.language || 'id-ID',
    'PlanlySecureSalt_1928374' // Kunci garam statis tambahan
  ];
  
  return components.join('##');
};

// Fungsi hashing sederhana untuk mengubah fingerprint menjadi larik byte kunci
const deriveKeyBytes = (fingerprint: string): number[] => {
  let hash = 5381;
  const keyBytes: number[] = [];
  
  for (let i = 0; i < fingerprint.length; i++) {
    hash = ((hash << 5) + hash) + fingerprint.charCodeAt(i);
  }
  
  // Ambil byte dari hash berputar
  for (let i = 0; i < 32; i++) {
    const byte = (hash >> (i % 4 * 8)) & 0xFF;
    // Lakukan pencampuran tambahan dan batasi ke 8-bit (0-255) agar tidak terjadi overflow bit tinggi
    keyBytes.push((byte ^ (i * 17)) & 0xFF);
  }
  
  return keyBytes;
};

/**
 * Mengenkripsi API Key sebelum disimpan ke localStorage
 * @param key Kunci API dalam plain-text
 * @returns Kunci terenkripsi dalam format Base64
 */
export const encryptApiKey = (key: string): string => {
  if (!key) return '';
  try {
    const fingerprint = getBrowserFingerprint();
    const keyBytes = deriveKeyBytes(fingerprint);
    
    const encryptedBytes: number[] = [];
    for (let i = 0; i < key.length; i++) {
      const charCode = key.charCodeAt(i);
      const keyByte = keyBytes[i % keyBytes.length];
      
      // Enkripsi multi-pass XOR dan penambahan offset
      const encryptedByte = ((charCode ^ keyByte) + 42) % 256;
      encryptedBytes.push(encryptedByte);
    }
    
    // Konversi byte array ke string biner lalu ke Base64
    const binaryStr = String.fromCharCode(...encryptedBytes);
    return btoa(binaryStr);
  } catch (err) {
    console.error('API Key encryption failed:', err);
    // Fallback obfuscation dasar jika gagal total agar tidak plain-text
    try {
      return btoa(key);
    } catch {
      return '';
    }
  }
};

/**
 * Mendekripsi API Key yang dibaca dari localStorage
 * @param encrypted Kunci terenkripsi dalam format Base64
 * @returns Kunci API dalam plain-text (atau string kosong jika gagal/sidik jari tidak cocok)
 */
export const decryptApiKey = (encrypted: string): string => {
  if (!encrypted) return '';
  try {
    const fingerprint = getBrowserFingerprint();
    const keyBytes = deriveKeyBytes(fingerprint);
    
    const binaryStr = atob(encrypted);
    const decryptedChars: string[] = [];
    
    for (let i = 0; i < binaryStr.length; i++) {
      const encryptedByte = binaryStr.charCodeAt(i);
      const keyByte = keyBytes[i % keyBytes.length];
      
      // Lakukan proses balik dari enkripsi
      let charCode = (encryptedByte - 42) % 256;
      if (charCode < 0) charCode += 256;
      
      charCode = charCode ^ keyByte;
      decryptedChars.push(String.fromCharCode(charCode));
    }
    
    const decrypted = decryptedChars.join('');
    
    // Validasi apakah hasil dekripsi hanya berisi karakter ASCII tercetak (printable ASCII)
    // Jika sidik jari berubah/salah, proses XOR akan menghasilkan karakter biner acak/non-ASCII
    const isPrintableAscii = /^[\x20-\x7E]+$/.test(decrypted);
    if (!isPrintableAscii) {
      console.warn('Decrypted API Key contains invalid characters. The browser fingerprint may have changed.');
      return '';
    }
    
    return decrypted;
  } catch (err) {
    console.error('API Key decryption failed:', err);
    try {
      // Fallback base64 dasar
      const decoded = atob(encrypted);
      if (/^[\x20-\x7E]+$/.test(decoded)) {
        return decoded;
      }
      return '';
    } catch {
      return '';
    }
  }
};
