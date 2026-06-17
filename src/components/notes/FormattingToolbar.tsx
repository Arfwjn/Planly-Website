/**
 * =============================================================================
 * Planly — FormattingToolbar.tsx
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


import { CheckSquare, List, ListOrdered, Bold, Italic, Heading1, Heading2, Link2, Sigma } from 'lucide-react';

interface FormattingToolbarProps {
  textareaId: string;
  value: string;
  onChange: (val: string) => void;
}

/**
 * Komponen FormattingToolbar
 * 
 * Bilah tombol kecil buat memformat tulisan ala Markdown di textarea.
 * Isinya ada tombol Checklist, Bullet List, Numbered List, Bold, Italic, H1, dan H2.
 * Logika insertTextAtCursor diselipin langsung di sini biar bersih dan reusable.
 */
export default function FormattingToolbar({
  textareaId,
  value,
  onChange
}: FormattingToolbarProps) {
  
  // Fungsi penolong buat nyisipin teks format di posisi kursor ketikan saat ini
  const insertTextAtCursor = (textToInsert: string) => {
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement | null;
    if (!textarea) {
      onChange(value + textToInsert);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = value.substring(0, start);
    const after = value.substring(end, value.length);

    onChange(before + textToInsert + after);

    // Otomatis fokusin balik kursor ke textarea setelah disisipkan
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + textToInsert.length;
    }, 0);
  };

  return (
    <div className="flex items-center gap-0.5 bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/50 dark:border-slate-700/60 px-1.5 py-0.5 rounded-xl shadow-xs self-start sm:self-auto">
      <button
        type="button"
        title="Tambah Checkpoint (Todo)"
        onClick={() => insertTextAtCursor('\n- [ ] ')}
        className="p-1 hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-primary rounded-lg transition-colors cursor-pointer"
      >
        <CheckSquare className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        title="Daftar Bullet"
        onClick={() => insertTextAtCursor('\n- ')}
        className="p-1 hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-primary rounded-lg transition-colors cursor-pointer"
      >
        <List className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        title="Daftar Angka"
        onClick={() => insertTextAtCursor('\n1. ')}
        className="p-1 hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-primary rounded-lg transition-colors cursor-pointer"
      >
        <ListOrdered className="w-3.5 h-3.5" />
      </button>
      <span className="w-px h-3.5 bg-slate-200 dark:bg-slate-700 mx-0.5" />
      <button
        type="button"
        title="Teks Tebal"
        onClick={() => insertTextAtCursor('**Tebal**')}
        className="p-1 hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-primary rounded-lg transition-colors cursor-pointer"
      >
        <Bold className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        title="Teks Miring"
        onClick={() => insertTextAtCursor('*Miring*')}
        className="p-1 hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-primary rounded-lg transition-colors cursor-pointer"
      >
        <Italic className="w-3.5 h-3.5" />
      </button>
      <span className="w-px h-3.5 bg-slate-200 dark:bg-slate-700 mx-0.5" />
      <button
        type="button"
        title="Heading 1"
        onClick={() => insertTextAtCursor('\n# ')}
        className="p-1 hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-primary rounded-lg transition-colors cursor-pointer"
      >
        <Heading1 className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        title="Heading 2"
        onClick={() => insertTextAtCursor('\n## ')}
        className="p-1 hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-primary rounded-lg transition-colors cursor-pointer"
      >
        <Heading2 className="w-3.5 h-3.5" />
      </button>
      <span className="w-px h-3.5 bg-slate-200 dark:bg-slate-700 mx-0.5" />
      <button
        type="button"
        title="Tambah Link"
        onClick={() => insertTextAtCursor('[Nama Link](https://example.com)')}
        className="p-1 hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-primary rounded-lg transition-colors cursor-pointer"
      >
        <Link2 className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        title="Tambah Rumus LaTeX"
        onClick={() => insertTextAtCursor('$$Rumus$$')}
        className="p-1 hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-primary rounded-lg transition-colors cursor-pointer"
      >
        <Sigma className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
