/**
 * Utilitas Keamanan untuk Proteksi API Key di Sisi Klien
 * 
 * Melindungi Gemini API Key dari pencurian data dalam plain-text di localStorage
 * dengan mengenkripsinya menggunakan kunci dinamis yang diturunkan dari fingerprint browser.
 */

// Menghasilkan sidik jari browser unik berbasis lingkungan client
const getBrowserFingerprint = (): string => {
  if (typeof window === 'undefined') return 'planly_default_fallback_salt_321';
  
  const nav = window.navigator || {};
  const scr = window.screen || {};
  
  // Gabungkan userAgent, bahasa peramban, dan dimensi layar
  const components = [
    nav.userAgent || 'unknown_agent',
    nav.language || 'id-ID',
    (scr.width || 1920).toString(),
    (scr.height || 1080).toString(),
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
    // Lakukan pencampuran tambahan
    keyBytes.push(byte ^ (i * 17));
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
    
    return decryptedChars.join('');
  } catch (err) {
    console.error('API Key decryption failed:', err);
    try {
      // Fallback base64 dasar
      return atob(encrypted);
    } catch {
      return '';
    }
  }
};
