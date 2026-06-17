/**
 * =============================================================================
 * Planly — useGeminiApiKey.ts
 * 
 * Kegunaan:
 * Komponen asisten kuliah AI interaktif (RAG chatbot, pemutar video, sinkronisasi transkrip kuliah, & key takeaways).
 * 
 * Relasi & Dependency:
 * - Berelasi dengan AICompanionView.tsx (orkestrator) dan menggunakan layanan Gemini AI di aiCompanionService.ts.
 * 
 * Aliran Data / State:
 * - Mengunggah video kuliah (.mp4), memutar transkrip seekable timestamp [MM:SS], merender rumus LaTeX KaTeX, & chat RAG.
 * =============================================================================
 */

import { useState } from 'react';
import { encryptApiKey, decryptApiKey } from '../../../utils/security';
import { useToast } from '../../ui/Toast';

export function useGeminiApiKey() {
  const toast = useToast();

  const [localApiKey, setLocalApiKey] = useState(() => {
    const saved = localStorage.getItem('planly_gemini_api_key');
    if (!saved) return '';
    try {
      return decryptApiKey(saved);
    } catch (e) {
      console.error('Failed to decrypt API Key:', e);
      return '';
    }
  });

  const [useSystemKey, setUseSystemKey] = useState(() => {
    return localStorage.getItem('planly_use_system_key') === 'true';
  });

  const envApiKey = import.meta.env.GEMINI_API_KEY;
  const isEnvKeyValid = envApiKey && envApiKey !== 'MY_GEMINI_API_KEY' && envApiKey !== '';
  
  // Prioritaskan kunci kustom lokal, fallback ke kunci sistem environment (.env) jika diizinkan oleh user
  const activeApiKey = localApiKey || (isEnvKeyValid && useSystemKey ? envApiKey : '');

  const saveApiKey = (newKey: string) => {
    setLocalApiKey(newKey);
    const encrypted = encryptApiKey(newKey);
    localStorage.setItem('planly_gemini_api_key', encrypted);
    toast.success('Kunci API Gemini berhasil disimpan secara terenkripsi.');
  };

  const deleteApiKey = () => {
    setLocalApiKey('');
    localStorage.removeItem('planly_gemini_api_key');
    toast.info('Kunci API Gemini telah dihapus.');
  };

  const toggleSystemKey = (newVal: boolean) => {
    setUseSystemKey(newVal);
    localStorage.setItem('planly_use_system_key', String(newVal));
    toast.success(newVal ? 'Berhasil mengaktifkan API Key sistem bawaan.' : 'API Key sistem bawaan dinonaktifkan.');
  };

  return {
    localApiKey,
    useSystemKey,
    activeApiKey,
    isEnvKeyValid,
    saveApiKey,
    deleteApiKey,
    toggleSystemKey,
  };
}
