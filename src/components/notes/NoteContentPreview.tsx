import React from 'react';
import { Note } from '../../types';

interface NoteContentPreviewProps {
  note: Note;
  isCard?: boolean;
  onToggleTodo?: (note: Note, lineIndex: number, e: React.MouseEvent) => void;
}

/**
 * Komponen NoteContentPreview
 * 
 * Nah, file ini khusus buat nge-render isi dari catatan kita (notes).
 * Dia bertindak sebagai parser markdown sederhana yang bisa ngerti:
 * - Checklist ([ ] dan [x]) biar bisa diklik langsung.
 * - Bullet list (- atau *)
 * - Numbered list (1. 2. dst)
 * - Heading (# untuk H2, ## untuk H3, ### untuk H4 di CSS kita)
 * - Baris kosong & paragraf biasa.
 * 
 * Kita pisah ke sini biar gak usah copas-copas logika render ini di kartu, form, sama modal detail!
 */
export default function NoteContentPreview({
  note,
  isCard = false,
  onToggleTodo
}: NoteContentPreviewProps) {
  const lines = note.content.split('\n');
  
  // Kalau di kartu catatan, kita batesin maks 6 baris biar gak kepanjangan ke bawah (over-height)
  const displayLines = isCard ? lines.slice(0, 6) : lines;

  // Handler buat checklist biar pas diklik bisa ngubah data to-do nya
  const handleCheckboxClick = (idx: number, e: React.MouseEvent) => {
    if (onToggleTodo) {
      onToggleTodo(note, idx, e);
    }
  };

  return (
    <div className="space-y-1 text-xs text-on-surface-variant font-medium text-left">
      {displayLines.map((line, idx) => {
        const isChecklist = line.includes('[ ]') || line.includes('[x]');
        
        // 1. Render Checklist Item
        if (isChecklist) {
          const isChecked = line.includes('[x]');
          const label = line
            .replace(/\[\s*\]/, '')
            .replace(/\[\s*x\s*\]/i, '')
            .replace(/^-?\s*/, '')
            .trim();
            
          return (
            <div
              key={idx}
              className="flex items-start gap-2 py-0.5 cursor-pointer select-none group/todo"
              onClick={(e) => handleCheckboxClick(idx, e)}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => {}} // Sengaja dikosongin karena dikontrol lewat onClick div di atas
                className="w-3.5 h-3.5 mt-0.5 rounded border-[#C7C4D8] text-primary focus:ring-primary cursor-pointer accent-primary flex-shrink-0"
              />
              <span className={`flex-1 break-words leading-tight transition-colors ${isChecked ? 'line-through text-[#94A3B8]' : 'text-on-surface group-hover/todo:text-primary'}`}>
                {label || <span className="text-slate-350 italic">Checkpoint kosong</span>}
              </span>
            </div>
          );
        }

        // 2. Render Bullet Point
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          const label = line.trim().substring(2);
          return (
            <div key={idx} className="flex items-start gap-1.5 py-0.5 pl-1">
              <span className="text-primary mt-1 text-[8px] flex-shrink-0">&bull;</span>
              <span className="flex-1 break-words leading-tight text-on-surface-variant">{label}</span>
            </div>
          );
        }

        // 3. Render Numbered Point
        const numMatch = line.trim().match(/^(\d+)\.\s(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-1.5 py-0.5 pl-1">
              <span className="text-primary font-bold flex-shrink-0">{numMatch[1]}.</span>
              <span className="flex-1 break-words leading-tight text-on-surface-variant">{numMatch[2]}</span>
            </div>
          );
        }

        // 4. Render Headers (#, ##, ###)
        if (line.trim().startsWith('### ')) {
          return (
            <h4 key={idx} className="text-[11px] font-extrabold text-on-surface uppercase tracking-wider pt-2 pb-0.5 border-b border-slate-100 dark:border-slate-800">
              {line.trim().substring(4)}
            </h4>
          );
        }
        if (line.trim().startsWith('## ')) {
          return (
            <h3 key={idx} className="text-xs font-black text-on-surface pt-2 pb-0.5">
              {line.trim().substring(3)}
            </h3>
          );
        }
        if (line.trim().startsWith('# ')) {
          return (
            <h2 key={idx} className="text-sm font-black text-on-surface pt-3 pb-0.5">
              {line.trim().substring(2)}
            </h2>
          );
        }

        // 5. Render Baris Kosong (Spasi pemisah paragraf)
        if (!line.trim()) {
          return <div key={idx} className="h-1.5" />;
        }

        // 6. Render Paragraf Biasa
        return (
          <p key={idx} className="leading-relaxed text-on-surface-variant break-words py-0.5 pl-0.5">
            {line}
          </p>
        );
      })}
      
      {/* Kasih tanda kalau catatan masih panjang di bawahnya */}
      {isCard && lines.length > 6 && (
        <p className="text-[10px] text-[#94A3B8] italic font-semibold pt-1 pl-1">
          + {lines.length - 6} baris lagi...
        </p>
      )}
    </div>
  );
}
