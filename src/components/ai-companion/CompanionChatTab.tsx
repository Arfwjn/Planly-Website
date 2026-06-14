import React, { useEffect, useRef } from 'react';
import { Brain, Globe, Play, User as UserIcon, RotateCcw } from 'lucide-react';
import { ChatMessage } from './types';

interface CompanionChatTabProps {
  messages: ChatMessage[];
  chatInput: string;
  setChatInput: (val: string) => void;
  isTyping: boolean;
  onSendMessage: (e: React.FormEvent) => void;
  handleSeek: (timeInSeconds: number) => void;
  onResetChat?: () => void;
}

/**
 * Komponen CompanionChatTab
 * 
 * Antarmuka interaktif tanya jawab dengan asisten AI (RAG).
 * Mendukung pencarian eksternal (Google Search Grounding) dan pengenalan otomatis penanda waktu video [MM:SS].
 */
export default function CompanionChatTab({
  messages,
  chatInput,
  setChatInput,
  isTyping,
  onSendMessage,
  handleSeek,
  onResetChat,
}: CompanionChatTabProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Efek gulir otomatis ke pesan terbawah saat terdapat pesan baru
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Parser teks untuk mendeteksi penanda waktu [MM:SS] dan tag bold <b> / **
  const renderMessageText = (text: string) => {
    // 1. Pecah teks berdasarkan tag <b>...</b> atau markdown **...**
    const htmlParts = text.split(/(<b>.*?<\/b>|\*\*.*?\*\*)/g);
    
    return htmlParts.map((part, partIdx) => {
      // Jika bagian tersebut adalah tag bold HTML
      if (part.startsWith('<b>') && part.endsWith('</b>')) {
        const boldText = part.slice(3, -4);
        return <b key={`b-${partIdx}`} className="font-bold">{boldText}</b>;
      }
      // Jika bagian tersebut adalah markdown bold
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return <b key={`md-${partIdx}`} className="font-bold">{boldText}</b>;
      }
      
      // 2. Jika teks biasa, deteksi penanda waktu [MM:SS]
      const regex = /\[(\d{2}):(\d{2})\]/g;
      const subParts = [];
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(part)) !== null) {
        const matchIndex = match.index;
        if (matchIndex > lastIndex) {
          subParts.push(part.substring(lastIndex, matchIndex));
        }
        
        const mins = parseInt(match[1]);
        const secs = parseInt(match[2]);
        const totalSeconds = mins * 60 + secs;
        const timestampText = match[0]; 

        subParts.push(
          <button
            key={`ts-${partIdx}-${matchIndex}`}
            type="button"
            onClick={() => handleSeek(totalSeconds)}
            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 mx-0.5 bg-primary/10 hover:bg-primary text-primary hover:text-white font-mono font-bold text-[10px] rounded transition-colors cursor-pointer border-none"
          >
            <Play className="w-2.5 h-2.5 stroke-[3px]" />
            <span>{timestampText}</span>
          </button>
        );

        lastIndex = regex.lastIndex;
      }

      if (lastIndex < part.length) {
        subParts.push(part.substring(lastIndex));
      }

      return subParts.length > 0 ? subParts : part;
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/30 dark:bg-slate-950/20 text-left">
      
      {/* Kontainer Aliran Pesan (Message Feed) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.map((msg, idx) => (
          <div 
            key={idx}
            className={`flex gap-3 max-w-[85%] ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-2xs ${
              msg.sender === 'user' 
                ? 'bg-primary text-white' 
                : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-primary'
            }`}>
              {msg.sender === 'user' ? (
                <UserIcon className="w-4 h-4" />
              ) : (
                <Brain className="w-4 h-4" />
              )}
            </div>

            <div className="space-y-1">
              <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-primary text-white rounded-tr-none font-medium'
                  : 'bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-tl-none text-on-surface font-medium shadow-2xs'
              }`}>
                {msg.sender === 'user' ? msg.text : renderMessageText(msg.text)}
              </div>

              {msg.isSearchGrounded && (
                <div className="flex items-center gap-1 text-[9px] font-bold text-primary px-1">
                  <Globe className="w-3.5 h-3.5 text-primary animate-pulse" />
                  <span>Diperkaya dari Google Search</span>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-3 max-w-[85%] mr-auto">
            <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-primary flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Brain className="w-4 h-4 animate-pulse" />
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-3 rounded-2xl rounded-tl-none shadow-2xs flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Bagian Input Pesan */}
      <form 
        onSubmit={onSendMessage}
        className="p-3 border-t border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2 items-center flex-shrink-0 border-none"
      >
        {onResetChat && (
          <button
            type="button"
            onClick={onResetChat}
            title="Reset Percakapan"
            className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Tanyakan materi kuliah ini ke AI..."
          className="flex-1 h-9 px-3 bg-[#F8FAFC] dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
        />
        <button
          type="submit"
          disabled={!chatInput.trim() || isTyping}
          className="w-9 h-9 rounded-lg bg-primary hover:bg-[#4F46E5] disabled:bg-slate-100 disabled:dark:bg-slate-855 text-white disabled:text-slate-400 flex items-center justify-center flex-shrink-0 cursor-pointer shadow-xs transition-colors border-none"
        >
          <svg className="w-4 h-4 rotate-45 mr-0.5 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>

    </div>
  );
}
