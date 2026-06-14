# Issue 2: Pemrosesan Audio Multimodal dengan Gemini AI

## Deskripsi
Menghubungkan audio biner WAV yang dihasilkan dari Issue 1 ke model `gemini-2.5-flash` menggunakan SDK `@google/genai`. Model akan menganalisis konten audio dan mengembalikan data analisis terstruktur berformat JSON yang berisi transkrip bertimestamp, daftar bab bahasan, ringkasan poin penting, serta pengayaan topik akademis.

## Aspek Standarisasi
*   **Separation of Concerns (SoC)**: Logika API SDK Gemini dibungkus di dalam `src/services/ai/aiCompanionService.ts`.
*   **Structured Output (Schema-driven)**: Menggunakan fitur `responseSchema` dari Gemini SDK untuk memastikan format JSON yang diterima dari AI 100% konsisten dan aman untuk dibaca oleh kode frontend TypeScript.

## Rencana Perubahan

### 1. [Service Layer] [aiCompanionService.ts](file:///c:/Users/ACER/Downloads/Planly%20Website/src/services/ai/aiCompanionService.ts)
*   Tambahkan fungsi `analyzeLectureAudio` yang menginisialisasi client `GoogleGenAI` dengan kunci API.
*   Konversi audio WAV blob menjadi string Base64 inline-data.
*   Kirim permintaan analisis ke model `gemini-2.5-flash` dengan prompt sistem instruksi khusus bahasa Indonesia dan skema respon JSON lengkap (berisi `transcript`, `chapters`, `takeaways`, dan `enrichment`).

## Rencana Verifikasi
*   Uji kompilasi dengan `npm run build`.
*   Verifikasi respon API Gemini mengembalikan struktur JSON yang tepat dan lengkap.
