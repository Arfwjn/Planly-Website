# Issue 1: Konfigurasi Lingkungan & Pembuatan Service Ekstraksi Audio

## Deskripsi
Mempersiapkan infrastruktur dasar untuk Asisten Kuliah AI, termasuk konfigurasi Vite agar dapat membaca kunci API Gemini dari *environment variables*, serta membuat *helper service* di sisi klien untuk mengekstrak trek audio dari video MP4 secara efisien.

## Aspek Standarisasi
*   **Separation of Concerns (SoC)**: Logika pengkodean WAV biner dan decoding audio dipisahkan dari React UI ke dalam `src/services/ai/aiCompanionService.ts`.
*   **Performance Optimization**: Melakukan down-sampling audio ke 16000Hz mono demi memperkecil ukuran payload API hingga 50x dibanding file video MP4 asli.

## Rencana Perubahan

### 1. [Vite Config] [vite.config.ts](file:///c:/Users/ACER/Downloads/Planly%20Website/vite.config.ts)
*   Tambahkan opsi `envPrefix: ['VITE_', 'GEMINI_']` agar variabel `GEMINI_API_KEY` dari file `.env` dapat dibaca melalui `import.meta.env.GEMINI_API_KEY`.

### 2. [Service Layer] [aiCompanionService.ts](file:///c:/Users/ACER/Downloads/Planly%20Website/src/services/ai/aiCompanionService.ts)
*   Buat berkas service baru untuk menampung fungsi `extractAudioAsWav` menggunakan `OfflineAudioContext`.
*   Terapkan *down-sampling* frekuensi sampel ke 16000Hz mono.
*   Implementasikan kompresi dan encoding PCM ke format WAV.

## Rencana Verifikasi
*   Uji kompilasi dengan `npm run build`.
*   Lakukan pengujian fungsi ekstraksi audio dengan mengumpankan file MP4 kecil di browser dan verifikasi bahwa berkas WAV biner berhasil terbentuk.
