/**
 * =============================================================================
 * Planly — NoteContentPreview.tsx
 * 
 * Kegunaan:
 * Komponen modul pencatatan kuliah (catatan belajar) dengan editor Markdown & pratinjau live.
 * 
 * Relasi & Dependency:
 * - Berelasi dengan NotesView.tsx (orkestrator) dan menggunakan notesService untuk sinkronisasi catatan.
 * 
 * Aliran Data / State:
 * - Melakukan CRUD data catatan, parsing format teks Markdown, dan checklist interaktif langsung dari kartu.
 * =============================================================================
 */

import React from 'react';
import { Note } from '../../types';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Helper Parser Teks Kaya (Rich Text)
 * Mengonversi LaTeX (inline $...$ & block $$...$$), link markdown [label](url),
 * serta format tebal (HTML <b> & md **) / miring (md *) menjadi komponen React yang sesuai.
 */
function parseInlineContent(text: string): React.ReactNode {
  if (!text) return '';

  const blockMathRegex = /\$\$(.*?)\$\$/g;
  const inlineMathRegex = /\$([^\$]+)\$/g;
  const inlineMathRegex2 = /\\\((.*?)\\\)/g;
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const boldHtmlRegex = /<b>(.*?)<\/b>/g;
  const boldMdRegex = /\*\*(.*?)\*\*/g;
  const italicMdRegex = /\*([^*]+)\*/g;

  const regexes = [
    { type: 'blockMath', regex: blockMathRegex },
    { type: 'inlineMath', regex: inlineMathRegex },
    { type: 'inlineMath', regex: inlineMathRegex2 },
    { type: 'link', regex: linkRegex },
    { type: 'boldHtml', regex: boldHtmlRegex },
    { type: 'boldMd', regex: boldMdRegex },
    { type: 'italicMd', regex: italicMdRegex }
  ] as const;

  let earliestIndex = Infinity;
  let bestMatch: RegExpExecArray | null = null;
  let bestType: typeof regexes[number]['type'] | null = null;

  for (const { type: rType, regex } of regexes) {
    regex.lastIndex = 0; // reset
    const m = regex.exec(text);
    if (m && m.index < earliestIndex) {
      earliestIndex = m.index;
      bestMatch = m;
      bestType = rType;
    }
  }

  if (!bestMatch || bestType === null) {
    return text;
  }

  const prefix = text.substring(0, earliestIndex);
  const matchedText = bestMatch[0];
  const suffix = text.substring(earliestIndex + matchedText.length);

  let matchedNode: React.ReactNode = null;

  if (bestType === 'blockMath') {
    const formula = bestMatch[1];
    try {
      const html = katex.renderToString(formula, { displayMode: true, throwOnError: false });
      matchedNode = (
        <span 
          dangerouslySetInnerHTML={{ __html: html }} 
          className="block my-2 max-w-full overflow-x-auto py-1 text-center font-sans align-middle" 
        />
      );
    } catch {
      matchedNode = matchedText;
    }
  } else if (bestType === 'inlineMath') {
    const formula = bestMatch[1];
    try {
      const html = katex.renderToString(formula, { displayMode: false, throwOnError: false });
      matchedNode = (
        <span 
          dangerouslySetInnerHTML={{ __html: html }} 
          className="inline-block px-1 align-middle" 
        />
      );
    } catch {
      matchedNode = matchedText;
    }
  } else if (bestType === 'link') {
    const label = bestMatch[1];
    const url = bestMatch[2];
    matchedNode = (
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold transition-all text-[11px] border border-primary/20 hover:scale-102 mx-0.5 select-none no-animate cursor-pointer align-middle"
        onClick={(e) => e.stopPropagation()}
      >
        <span>{label}</span>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    );
  } else if (bestType === 'boldHtml' || bestType === 'boldMd') {
    const content = bestMatch[1];
    matchedNode = <strong className="font-extrabold text-on-surface">{parseInlineContent(content)}</strong>;
  } else if (bestType === 'italicMd') {
    const content = bestMatch[1];
    matchedNode = <em className="italic text-on-surface-variant/90">{parseInlineContent(content)}</em>;
  }

  return (
    <>
      {prefix}
      {matchedNode}
      {parseInlineContent(suffix)}
    </>
  );
}

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

  const renderedElements: React.ReactNode[] = [];
  let mathBuffer: string[] = [];
  let inMathBlock = false;
  let mathStartIdx = -1;

  for (let idx = 0; idx < displayLines.length; idx++) {
    const line = displayLines[idx];
    const trimmed = line.trim();

    if (inMathBlock) {
      if (trimmed.endsWith('$$') || trimmed.includes('$$')) {
        // Close math block
        const formulaLine = trimmed.replace(/\$\$/g, '');
        if (formulaLine) {
          mathBuffer.push(formulaLine);
        }
        inMathBlock = false;
        const formula = mathBuffer.join('\n').trim();
        
        try {
          const html = katex.renderToString(formula, { displayMode: true, throwOnError: false });
          renderedElements.push(
            <div 
              key={`math-${mathStartIdx}`} 
              dangerouslySetInnerHTML={{ __html: html }} 
              className="my-2 max-w-full overflow-x-auto py-1 text-center font-sans align-middle" 
            />
          );
        } catch {
          renderedElements.push(
            <div key={`math-${mathStartIdx}`} className="text-red-500 font-mono my-2 break-words">
              $${formula}$$
            </div>
          );
        }
        mathBuffer = [];
      } else {
        mathBuffer.push(line);
      }
      continue;
    }

    // Check if line starts a math block
    if (trimmed === '$$') {
      inMathBlock = true;
      mathStartIdx = idx;
      continue;
    } else if (trimmed.startsWith('$$') && !trimmed.endsWith('$$', 2) && trimmed.indexOf('$$', 2) === -1) {
      inMathBlock = true;
      mathStartIdx = idx;
      mathBuffer.push(line.substring(2));
      continue;
    } else if (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 2) {
      // Single line block math, e.g. $$formula$$
      const formula = trimmed.substring(2, trimmed.length - 2).trim();
      try {
        const html = katex.renderToString(formula, { displayMode: true, throwOnError: false });
        renderedElements.push(
          <div 
            key={`math-${idx}`} 
            dangerouslySetInnerHTML={{ __html: html }} 
            className="my-2 max-w-full overflow-x-auto py-1 text-center font-sans align-middle" 
          />
        );
      } catch {
        renderedElements.push(
          <div key={`math-${idx}`} className="text-red-500 font-mono my-2 break-words">
            {line}
          </div>
        );
      }
      continue;
    }

    const isChecklist = line.includes('[ ]') || line.includes('[x]');
    
    // 1. Render Checklist Item
    if (isChecklist) {
      const isChecked = line.includes('[x]');
      const label = line
        .replace(/\[\s*\]/, '')
        .replace(/\[\s*x\s*\]/i, '')
        .replace(/^-?\s*/, '')
        .trim();
        
      renderedElements.push(
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
            {parseInlineContent(label) || <span className="text-slate-350 italic">Checkpoint kosong</span>}
          </span>
        </div>
      );
    }
    // 2. Render Bullet Point
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const label = line.trim().substring(2);
      renderedElements.push(
        <div key={idx} className="flex items-start gap-1.5 py-0.5 pl-1">
          <span className="text-primary mt-1 text-[8px] flex-shrink-0">&bull;</span>
          <span className="flex-1 break-words leading-tight text-on-surface-variant">{parseInlineContent(label)}</span>
        </div>
      );
    }
    // 3. Render Numbered Point
    else {
      const numMatch = line.trim().match(/^(\d+)\.\s(.*)/);
      if (numMatch) {
        renderedElements.push(
          <div key={idx} className="flex items-start gap-1.5 py-0.5 pl-1">
            <span className="text-primary font-bold flex-shrink-0">{numMatch[1]}.</span>
            <span className="flex-1 break-words leading-tight text-on-surface-variant">{parseInlineContent(numMatch[2])}</span>
          </div>
        );
      }
      // 4. Render Headers (#, ##, ###)
      else if (trimmed.startsWith('### ')) {
        renderedElements.push(
          <h4 key={idx} className="text-[11px] font-extrabold text-on-surface uppercase tracking-wider pt-2 pb-0.5 border-b border-slate-100 dark:border-slate-800">
            {parseInlineContent(line.trim().substring(4))}
          </h4>
        );
      }
      else if (trimmed.startsWith('## ')) {
        renderedElements.push(
          <h3 key={idx} className="text-xs font-black text-on-surface pt-2 pb-0.5">
            {parseInlineContent(line.trim().substring(3))}
          </h3>
        );
      }
      else if (trimmed.startsWith('# ')) {
        renderedElements.push(
          <h2 key={idx} className="text-sm font-black text-on-surface pt-3 pb-0.5">
            {parseInlineContent(line.trim().substring(2))}
          </h2>
        );
      }
      // 5. Render Baris Kosong (Spasi pemisah paragraf)
      else if (!trimmed) {
        renderedElements.push(<div key={idx} className="h-1.5" />);
      }
      // 6. Render Paragraf Biasa
      else {
        renderedElements.push(
          <p key={idx} className="leading-relaxed text-on-surface-variant break-words py-0.5 pl-0.5">
            {parseInlineContent(line)}
          </p>
        );
      }
    }
  }

  // Handle case where math block was opened but never closed at the end of displayLines
  if (inMathBlock && mathBuffer.length > 0) {
    const formula = mathBuffer.join('\n').trim();
    try {
      const html = katex.renderToString(formula, { displayMode: true, throwOnError: false });
      renderedElements.push(
        <div 
          key={`math-unfinished`} 
          dangerouslySetInnerHTML={{ __html: html }} 
          className="my-2 max-w-full overflow-x-auto py-1 text-center font-sans align-middle" 
        />
      );
    } catch {
      renderedElements.push(
        <div key={`math-unfinished`} className="text-red-500 font-mono my-2 break-words">
          $${formula}
        </div>
      );
    }
  }

  return (
    <div className="space-y-1 text-xs text-on-surface-variant font-medium text-left">
      {renderedElements}
      
      {/* Kasih tanda kalau catatan masih panjang di bawahnya */}
      {isCard && lines.length > 6 && (
        <p className="text-[10px] text-[#94A3B8] italic font-semibold pt-1 pl-1">
          + {lines.length - 6} baris lagi...
        </p>
      )}
    </div>
  );
}
