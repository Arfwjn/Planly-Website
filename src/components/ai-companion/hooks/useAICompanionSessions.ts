/**
 * =============================================================================
 * Planly — useAICompanionSessions.ts
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
import { ProcessedSession } from '../types';
import { useToast } from '../../ui/Toast';

export function useAICompanionSessions() {
  const toast = useToast();

  const [sessions, setSessions] = useState<ProcessedSession[]>(() => {
    const saved = localStorage.getItem('planly_ai_sessions');
    return saved ? JSON.parse(saved) : [];
  });

  const addSession = (newSession: ProcessedSession) => {
    setSessions(prev => {
      const updated = [newSession, ...prev.filter(s => s.id !== newSession.id)];
      localStorage.setItem('planly_ai_sessions', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteSession = (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    localStorage.setItem('planly_ai_sessions', JSON.stringify(updated));
    localStorage.removeItem(`planly_session_data_${id}`);
    toast.success('Riwayat sesi kuliah berhasil dihapus.');
  };

  return {
    sessions,
    addSession,
    deleteSession,
  };
}
