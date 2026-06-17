/**
 * =============================================================================
 * Planly — helpers.ts
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

import { LectureChapter, AcademicEnrichment } from './types';

/**
 * Membangun konten Markdown terstruktur dari hasil analisis video kuliah.
 */
export const generateLectureNotesMarkdown = (
  videoName: string,
  takeaways: string[],
  chapters: LectureChapter[],
  enrichment?: AcademicEnrichment
): string => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const todayStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let markdownContent = `# Ringkasan Analisis AI\n`;
  markdownContent += `Sesi Kuliah: ${videoName}\n`;
  markdownContent += `Tanggal Analisis: ${todayStr}\n\n`;

  if (takeaways && takeaways.length > 0) {
    markdownContent += `## 💡 Poin Rangkuman AI (Key Takeaways)\n`;
    takeaways.forEach((t) => {
      markdownContent += `- ${t}\n`;
    });
    markdownContent += `\n`;
  }

  if (chapters && chapters.length > 0) {
    markdownContent += `## 📚 Daftar Pembahasan Kuliah (Chapters)\n`;
    chapters.forEach((c) => {
      markdownContent += `- [${formatTime(c.time)}] ${c.title}: ${c.desc}\n`;
    });
    markdownContent += `\n`;
  }

  if (enrichment) {
    markdownContent += `## 🌐 Pengayaan Akademik (Sumber Internet & Google Search)\n`;
    if (enrichment.explanation) {
      markdownContent += `${enrichment.explanation}\n\n`;
    }
    if (enrichment.cards && enrichment.cards.length > 0) {
      enrichment.cards.forEach((card) => {
        markdownContent += `### 📌 ${card.title}\n`;
        markdownContent += `${card.description}\n`;
        if (card.formula) {
          markdownContent += `\nFormula / Rumus:\n$$${card.formula}$$\n`;
        }
        markdownContent += `\n`;
      });
    }
    if (enrichment.sources && enrichment.sources.length > 0) {
      markdownContent += `### 🔗 Referensi Sumber:\n`;
      enrichment.sources.forEach((src) => {
        markdownContent += `- [${src.label}](${src.url})\n`;
      });
      markdownContent += `\n`;
    }
  }

  return markdownContent;
};

/**
 * Menghasilkan respon tanya jawab offline simulasi (RAG offline) untuk demo static.
 */
export const getOfflineAIResponse = (userQuery: string): { text: string; isSearchGrounded: boolean } => {
  const lowerQuery = userQuery.toLowerCase();
  let responseText = '';
  let isGrounded = false;

  if (lowerQuery.includes('relu') || lowerQuery.includes('sigmoid') || lowerQuery.includes('aktivasi')) {
    responseText = "Dosen menjelaskan tentang pentingnya fungsi aktivasi pada menit [01:39]. Beliau membandingkan fungsi Sigmoid (yang memetakan output ke rentang 0-1) pada menit [01:47] dengan fungsi ReLU yang sangat populer pada menit [01:58]. Mahasiswa sempat menyela dan menanyakan perbandingannya pada menit [02:31]. Dosen menyimpulkan bahwa ReLU sangat ideal untuk hidden layers, sedangkan Sigmoid tetap terbaik untuk klasifikasi biner di output layer pada menit [02:44].";
  } else if (lowerQuery.includes('jst') || lowerQuery.includes('jaringan saraf') || lowerQuery.includes('arsitektur') || lowerQuery.includes('layer')) {
    responseText = "Materi arsitektur Jaringan Saraf Tiruan (JST) dibahas oleh dosen mulai menit [01:04]. Dosen menjelaskan susunan 3 lapisan utama JST, yaitu Input Layer, Hidden Layer, dan Output Layer pada menit [01:10]. Beliau juga menjelaskan konsep bobot (weight) dan bias yang memproses input antar neuron pada menit [01:22].";
  } else if (lowerQuery.includes('machine learning') || lowerQuery.includes('deep learning') || lowerQuery.includes('pembelajaran') || lowerQuery.includes('kecerdasan buatan') || lowerQuery.includes('definisi')) {
    responseText = "Perkuliahan ini diawali dengan penjelasan definisi AI oleh dosen pada menit [00:14]. Dosen menjelaskan tentang Machine Learning (pembelajaran otomatis dari pola data) pada menit [00:31]. Perbedaan mendasar dengan Deep Learning (meniru neuron biologis otak manusia) dipaparkan mulai menit [00:47].";
  } else if (lowerQuery.includes('dosen') || lowerQuery.includes('siapa') || lowerQuery.includes('pengajar')) {
    responseText = "Kuliah ini dibawakan oleh Dosen Pengampu kelas Jaringan Saraf Tiruan. Beliau menyapa mahasiswa di awal rekaman pada menit [00:00] dan menyampaikan topik bahasan hari ini.";
  } else if (lowerQuery.includes('vanishing gradient') || lowerQuery.includes('turunan') || lowerQuery.includes('gradien')) {
    responseText = "Masalah vanishing gradient disinggung dosen pada menit [02:15] saat menjelaskan kelemahan fungsi Sigmoid. Beliau menerangkan bahwa fungsi ReLU dapat mengatasi vanishing gradient karena memiliki nilai turunan konstan = 1 untuk input positif pada menit [02:22].";
  } else {
    isGrounded = true;
    responseText = `Pertanyaan Anda mengenai "${userQuery}" tidak dibahas secara spesifik oleh dosen dalam rekaman kuliah ini. Namun, berdasarkan pencarian Google Search Grounding:

Konsep yang Anda tanyakan berkaitan dengan bidang Machine Learning/AI. [Query] umumnya dipahami sebagai metode atau konsep akademis di mana sistem mengoptimalkan bobot (weights) menggunakan algoritma seperti Backpropagation dan optimizer (seperti Adam atau SGD) untuk meminimalkan error rate pada loss function.

Jika Anda ingin kembali membahas isi video, Anda bisa bertanya tentang: "Jelaskan tentang fungsi aktivasi" atau "Kapan dosen membahas JST?".`;
    responseText = responseText.replace('[Query]', userQuery);
  }

  return { text: responseText, isSearchGrounded: isGrounded };
};
