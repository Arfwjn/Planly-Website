/**
 * =============================================================================
 * Planly — constants.ts
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

import { TranscriptLine } from './types';
import { LectureAnalysisResult } from '../../services/ai/aiCompanionService';

export const DEMO_TRANSCRIPT: TranscriptLine[] = [
  { time: 0, speaker: "Dosen", text: "Selamat pagi rekan-rekan mahasiswa. Hari ini kita akan membahas bab penting tentang Kecerdasan Buatan, khususnya Jaringan Saraf Tiruan." },
  { time: 14, speaker: "Dosen", text: "Sebelum masuk to topik JST, kita harus paham dasarnya. Artificial Intelligence adalah upaya membuat mesin meniru kecerdasan manusia." },
  { time: 31, speaker: "Dosen", text: "Salah satu pilar utamanya adalah Machine Learning, di mana sistem dilatih menggunakan contoh data untuk membentuk pola otomatis." },
  { time: 47, speaker: "Dosen", text: "Dan yang lebih mendalam adalah Deep Learning, yang meniru cara kerja neuron di otak kita. Inilah yang kita sebut Jaringan Saraf Tiruan." },
  { time: 64, speaker: "Dosen", text: "JST memiliki tiga komponen lapisan penyusun utama, yaitu input layer, hidden layer atau lapisan tersembunyi, dan output layer." },
  { time: 82, speaker: "Dosen", text: "Tiap koneksi antar neuron memiliki nilai bobot atau weight, serta bias, dan diproses melalui sesuatu yang dinamakan fungsi aktivasi." },
  { time: 99, speaker: "Dosen", text: "Fungsi aktivasi ini penting untuk memberikan sifat non-linear. Contohnya fungsi Sigmoid yang memetakan output antara rentang 0 hingga 1." },
  { time: 118, speaker: "Dosen", text: "Kemudian ada fungsi ReLU atau Rectified Linear Unit yang sangat populer. ReLU memetakan semua nilai negatif menjadi 0, dan membiarkan nilai positif tetap." },
  { time: 135, speaker: "Dosen", text: "Fungsi ReLU disukai karena menghemat daya komputasi dan menghindari masalah hilangnya gradien saat pelatihan jaringan yang sangat dalam." },
  { time: 151, speaker: "Mahasiswa", text: "Mohon izin bertanya Pak Dosen, apakah ReLU ini selalu lebih unggul dibandingkan dengan Sigmoid di seluruh kondisi arsitektur?" },
  { time: 164, speaker: "Dosen", text: "Pertanyaan yang sangat bagus. ReLU unggul di lapisan tersembunyi, tetapi untuk lapisan klasifikasi biner akhir, Sigmoid tetap menjadi pilihan utama." }
];

export const DEMO_ANALYSIS_RESULT: LectureAnalysisResult = {
  transcript: DEMO_TRANSCRIPT,
  chapters: [
    { time: 0, title: "Bab 1: Pendahuluan & Definisi AI", desc: "Penjelasan umum mengenai konsep dasar Artificial Intelligence." },
    { time: 31, title: "Bab 2: Machine Learning vs Deep Learning", desc: "Perbedaan pembelajaran mesin klasik dengan jaringan saraf mendalam." },
    { time: 64, title: "Bab 3: Arsitektur Jaringan Saraf Tiruan (JST)", desc: "Mengenal susunan Input, Hidden, dan Output layer pada neuron tiruan." },
    { time: 99, title: "Bab 4: Fungsi Aktivasi (Sigmoid & ReLU)", desc: "Bagaimana fungsi aktivasi memberikan sifat non-linear pada pemrosesan JST." },
    { time: 151, title: "Bab 5: Sesi Diskusi: ReLU vs Sigmoid", desc: "Tanya jawab mengenai kelebihan ReLU dan posisi penggunaan Sigmoid." }
  ],
  takeaways: [
    "<b>Artificial Intelligence (AI)</b> mencakup seluruh teknologi yang berupaya mereplikasi kecerdasan manusia ke dalam sistem komputasi.",
    "<b>Machine Learning (ML)</b> berfokus pada pelatihan model komputer menggunakan data untuk mempelajari pola secara mandiri tanpa pengkodean aturan statis.",
    "<b>Deep Learning (DL)</b> menggunakan susunan saraf bertingkat (JST) yang terinspirasi dari struktur neuron otak biologis manusia.",
    "<b>Lapisan JST</b> terdiri atas: *Input Layer* (menerima fitur data), *Hidden Layer* (melakukan ekstraksi fitur), dan *Output Layer* (menghasilkan keputusan akhir).",
    "<b>Fungsi Aktivasi</b> mengubah representasi linier menjadi non-linier agar jaringan saraf dapat memecahkan masalah pola yang kompleks."
  ],
  enrichment: {
    explanation: "Berikut adalah informasi akademik tambahan dari internet terkait fungsi aktivasi yang dibahas dosen dalam rekaman:",
    cards: [
      {
        title: "Fungsi Sigmoid",
        formula: "f(x) = 1 / (1 + e^-x)",
        description: "Memetakan nilai ke rentang (0, 1). Sangat cocok untuk probabilitas, namun rentan terhadap vanishing gradient pada model yang sangat dalam karena nilai turunan maksimalnya hanya 0.25."
      },
      {
        title: "Fungsi ReLU",
        formula: "f(x) = max(0, x)",
        description: "Menghilangkan nilai negatif menjadi 0. Menghindari kejenuhan gradien positif karena turunannya konstan = 1, sehingga melatih model jauh lebih cepat secara komputasi."
      }
    ],
    sources: [
      { label: "Stanford CS231n", url: "https://cs231n.github.io/neural-networks-1/" },
      { label: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/activation-functions-neural-networks/" }
    ]
  }
};

export const DEMO_VIDEO_URL = "https://assets.mixkit.co/videos/preview/mixkit-keyboard-typing-hands-close-up-1002-large.mp4";
