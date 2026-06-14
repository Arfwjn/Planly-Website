# Issue 3: Dinamisasi Tab Ringkasan Materi & Pengayaan Akademik

## Deskripsi
Mengubah tab ringkasan (`CompanionSummaryTab.tsx`) dari yang sebelumnya berisi data statis (hardcoded bertema JST) menjadi komponen presentasional dinamis yang siap menerima dan merender data bab kuliah, poin penting, dan kartu pengayaan Google Search Grounding dari hasil pemrosesan Gemini.

## Aspek Standarisasi
*   **Decomposition & Presentation Pattern**: Komponen `CompanionSummaryTab` dibuat murni presentasional (tidak memikirkan cara data didapatkan, hanya bertugas merender properti masukan secara dinamis).
*   **Aesthetics & Usability**: Mempertahankan gaya visual glassmorphism, lencana timestamp interaktif (sekali klik melompat ke pemutar video), serta tampilan kartu pengayaan akademik yang premium.

## Rencana Perubahan

### 1. [UI Tab] [CompanionSummaryTab.tsx](file:///c:/Users/ACER/Downloads/Planly%20Website/src/components/ai-companion/CompanionSummaryTab.tsx)
*   Ubah definisi properti `CompanionSummaryTabProps` untuk menerima data dinamis: `chapters`, `takeaways`, dan `enrichment`.
*   Render daftar bab kuliah secara dinamis sesuai data properti `chapters`.
*   Render poin rangkuman secara dinamis dari `takeaways`.
*   Render topik pengayaan tambahan dan referensi tautan Google Search Grounding secara dinamis dari `enrichment`.

## Rencana Verifikasi
*   Uji kompilasi dengan `npm run build`.
*   Verifikasi bahwa jika data properti diubah, tab ringkasan secara reaktif menampilkan data yang baru.
