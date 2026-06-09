import React from 'react';
import { Globe } from 'lucide-react';

interface CompanionSummaryTabProps {
  handleSeek: (timeInSeconds: number) => void;
}

/**
 * Komponen CompanionSummaryTab
 * 
 * Menampilkan ringkasan otomatis kecerdasan buatan (AI) yang mencakup bab pembahasan (Chapters),
 * poin rangkuman penting (Key Takeaways), serta pengayaan akademis eksternal (Google Grounding).
 */
export default function CompanionSummaryTab({ handleSeek }: CompanionSummaryTabProps) {

  // Format detik menjadi MM:SS
  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin text-left">
      
      {/* Bagian 1: Daftar Bab Kuliah (Chapters) */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-slate-150 dark:border-slate-800 pb-1">
          📚 Daftar Pembahasan Kuliah (Chapters)
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {[
            { time: 0, title: "Bab 1: Pendahuluan & Definisi AI", desc: "Penjelasan umum mengenai konsep dasar Artificial Intelligence." },
            { time: 31, title: "Bab 2: Machine Learning vs Deep Learning", desc: "Perbedaan pembelajaran mesin klasik dengan jaringan saraf mendalam." },
            { time: 64, title: "Bab 3: Arsitektur Jaringan Saraf Tiruan (JST)", desc: "Mengenal susunan Input, Hidden, dan Output layer pada neuron tiruan." },
            { time: 99, title: "Bab 4: Fungsi Aktivasi (Sigmoid & ReLU)", desc: "Bagaimana fungsi aktivasi memberikan sifat non-linear pada pemrosesan JST." },
            { time: 151, title: "Bab 5: Sesi Diskusi: ReLU vs Sigmoid", desc: "Tanya jawab mengenai kelebihan ReLU dan posisi penggunaan Sigmoid." }
          ].map((chapter, index) => (
            <div 
              key={index}
              onClick={() => handleSeek(chapter.time)}
              className="flex items-start gap-3 p-3 bg-slate-50/50 dark:bg-slate-850/25 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-primary/40 transition-colors cursor-pointer"
            >
              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-mono font-bold mt-0.5">
                {formatTimestamp(chapter.time)}
              </span>
              <div>
                <span className="text-xs font-extrabold text-on-surface block leading-tight">{chapter.title}</span>
                <span className="text-[10px] text-on-surface-variant font-medium mt-0.5 block">{chapter.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bagian 2: Ringkasan Inti (Key Takeaways) */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-slate-150 dark:border-slate-800 pb-1">
          💡 Poin Rangkuman AI (Key Takeaways)
        </h4>
        <ul className="space-y-2.5 text-xs text-on-surface-variant font-medium pl-1">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1 flex-shrink-0">•</span>
            <span><strong>Artificial Intelligence (AI)</strong> mencakup seluruh teknologi yang berupaya mereplikasi kecerdasan manusia ke dalam sistem komputasi.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1 flex-shrink-0">•</span>
            <span><strong>Machine Learning (ML)</strong> berfokus pada pelatihan model komputer menggunakan data untuk mempelajari pola secara mandiri tanpa pengkodean aturan statis.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1 flex-shrink-0">•</span>
            <span><strong>Deep Learning (DL)</strong> menggunakan susunan saraf bertingkat (JST) yang terinspirasi dari struktur neuron otak biologis manusia.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1 flex-shrink-0">•</span>
            <span><strong>Lapisan JST</strong> terdiri atas: <em>Input Layer</em> (menerima fitur data), <em>Hidden Layer</em> (melakukan ekstraksi fitur), dan <em>Output Layer</em> (menghasilkan keputusan akhir).</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1 flex-shrink-0">•</span>
            <span><strong>Fungsi Aktivasi</strong> mengubah representasi linier menjadi non-linier agar jaringan saraf dapat memecahkan masalah pola yang kompleks.</span>
          </li>
        </ul>
      </div>

      {/* Bagian 3: AI Academic Enrichment (Wawasan Tambahan dari Internet) */}
      <div className="p-4 bg-[#F5F2FF] dark:bg-indigo-950/20 border border-primary/20 rounded-2xl space-y-3">
        <div className="flex items-center gap-2 text-primary">
          <Globe className="w-4.5 h-4.5 stroke-[2.5px]" />
          <span className="text-xs font-extrabold uppercase tracking-wider">
            Pengayaan AI Terintegrasi Internet (Google Search)
          </span>
        </div>
        <p className="text-[11px] text-on-surface-variant leading-relaxed font-medium">
          Berikut adalah informasi akademik tambahan dari internet terkait fungsi aktivasi yang dibahas dosen dalam rekaman:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-xl space-y-1.5">
            <span className="text-[10px] font-bold text-primary block uppercase tracking-wider">Fungsi Sigmoid</span>
            <div className="bg-slate-50 dark:bg-slate-850 p-1.5 rounded font-mono text-[10px] text-center text-on-surface">
              f(x) = 1 / (1 + e^-x)
            </div>
            <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed">
              Memetakan nilai ke rentang (0, 1). Sangat cocok untuk probabilitas, namun rentan terhadap <em>vanishing gradient</em> pada model yang sangat dalam karena nilai turunan maksimalnya hanya 0.25.
            </p>
          </div>
          
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-xl space-y-1.5">
            <span className="text-[10px] font-bold text-primary block uppercase tracking-wider">Fungsi ReLU</span>
            <div className="bg-slate-50 dark:bg-slate-850 p-1.5 rounded font-mono text-[10px] text-center text-on-surface">
              f(x) = max(0, x)
            </div>
            <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed">
              Menghilangkan nilai negatif menjadi 0. Menghindari kejenuhan gradien positif karena turunannya konstan = 1, sehingga melatih model jauh lebih cepat secara komputasi.
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-primary/10 flex items-center justify-between flex-wrap gap-2 text-[10px] font-bold text-primary">
          <span>Sumber Tambahan Terkait:</span>
          <div className="flex gap-2">
            <a href="https://cs231n.github.io/neural-networks-1/" target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-0.5">
              Stanford CS231n ↗
            </a>
            <a href="https://www.geeksforgeeks.org/activation-functions-neural-networks/" target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-0.5">
              GeeksforGeeks ↗
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}
