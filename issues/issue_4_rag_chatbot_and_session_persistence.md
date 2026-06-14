# Issue 4: Chatbot RAG Cerdas & Penyimpanan Sesi di LocalStorage

## Deskripsi
Merealisasikan chatbot tanya jawab interaktif di bawah tab "Tanya AI" yang responsif terhadap konteks transkrip materi video kuliah. Chatbot ini akan otomatis menyisipkan tombol bertimestamp jika merujuk bagian video tertentu. Selain itu, issue ini juga menangani penyimpanan sesi analisis secara lokal ke `localStorage` agar sesi yang telah dianalisis dapat dibuka kembali secara instan.

## Aspek Standarisasi
*   **Separation of Concerns (SoC)**: Logika multi-turn chat dan RAG chatbot dipisahkan ke dalam service layer, sementara UI tab (`CompanionChatTab.tsx`) fokus pada visualisasi gelembung pesan.
*   **Security & Error Handling**: Menyediakan Warning Banner dan kotak input Kunci API Gemini manual jika kunci API di `.env` belum diatur, menjaga agar aplikasi tetap ramah pengguna.

## Rencana Perubahan

### 1. [Service Layer] [aiCompanionService.ts](file:///c:/Users/ACER/Downloads/Planly%20Website/src/services/ai/aiCompanionService.ts)
*   Tambahkan fungsi `chatWithLectureContext` yang mengirimkan pesan pengguna, riwayat percakapan, dan transkrip kuliah lengkap sebagai instruksi sistem dasar ke Gemini API.
*   Atur agar AI menyisipkan referensi timestamp dalam format `[MM:SS]`.

### 2. [Orchestrator View] [AICompanionView.tsx](file:///c:/Users/ACER/Downloads/Planly%20Website/src/components/ai-companion/AICompanionView.tsx)
*   Hubungkan alur pengunggahan video dengan *progress stages* (Audio -> Transkrip -> Ringkasan -> Grounding -> Completed).
*   Gunakan data riwayat API Key lokal jika `.env` tidak terkonfigurasi.
*   Simpan seluruh data analisis video (transkrip, bab, dll.) ke `localStorage` dengan kunci ID sesi terkait.
*   Integrasikan fungsi klik riwayat sesi kuliah di landing page agar memuat kembali data transkrip dan ringkasan dari `localStorage` secara instan tanpa perlu re-analisis.

## Rencana Verifikasi
*   Uji kompilasi dengan `npm run build`.
*   Unggah file mp4 kecil, verifikasi pendaftaran sesi ke riwayat, muat kembali sesi tersebut dari daftar riwayat, dan pastikan seluruh workspace pulih.
*   Lakukan tanya jawab di chatbot dan pastikan AI merespon sesuai isi kuliah Anda dengan timestamp tombol yang berfungsi.
