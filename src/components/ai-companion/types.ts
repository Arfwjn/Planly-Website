export type ProcessingStage = 'idle' | 'extracting' | 'transcribing' | 'summarizing' | 'enriching' | 'completed';
export type ActiveTab = 'transcript' | 'summary' | 'chat';

export interface ProcessedVideoMetadata {
  name: string;
  size: string;
  duration?: string;
  isDemo?: boolean;
}

export interface TranscriptLine {
  time: number; // detik
  speaker: string;
  text: string;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  isSearchGrounded?: boolean;
}

export interface ProcessedSession {
  id: string;
  name: string;
  size: string;
  dateStr: string;
  isDemo: boolean;
}

export interface AcademicEnrichmentCard {
  title: string;
  formula?: string;
  description: string;
}

export interface AcademicEnrichmentSource {
  label: string;
  url: string;
}

export interface AcademicEnrichment {
  explanation: string;
  cards: AcademicEnrichmentCard[];
  sources: AcademicEnrichmentSource[];
}

export interface LectureChapter {
  time: number;
  title: string;
  desc: string;
}

