# Issue 4: Integrasi Pemindai Wajah (Webcam), Koordinat Lokasi (GPS), & Rekap Riwayat Presensi

Issue ini berfokus pada integrasi sensor kamera web (webcam) browser, implementasi visualisasi pemindaian wajah premium, deteksi lokasi GPS mahasiswa, serta visualisasi rekap persentase kehadiran per mata kuliah.

## Deskripsi Tugas

### 1. Antarmuka Pemindai Wajah (HTML5 Camera Capture)
*   Ketika tombol "Mulai Presensi Wajah" diklik, buka kamera menggunakan:
    ```typescript
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
    ```
*   Tampilkan streaming video pada elemen `<video>`.
*   Tumpuk video dengan overlay CSS yang menampilkan:
    *   Cincin target bundar di tengah layar (tempat memposisikan wajah).
    *   Animasi scan bar berputar/glowing warna biru.
*   **Mekanisme Deteksi Wajah Tiruan**:
    *   Tampilkan status pemindaian *"Memindai Wajah..."* dengan progress bar.
    *   Setelah 2 detik pemindaian stabil, ubah cincin target menjadi hijau terang.
    *   Tangkap frame video menggunakan elemen `<canvas>` tersembunyi, lalu konversi ke string Base64 (`canvas.toDataURL('image/png')`).
    *   Hentikan seluruh track kamera secara aman (`stream.getTracks().forEach(t => t.stop())`).

### 2. Deteksi Koordinat Lokasi (Geolocation API)
*   Sebelum absensi disubmit, panggil:
    ```typescript
    navigator.geolocation.getCurrentPosition(...)
    ```
*   Dapatkan nilai `latitude` dan `longitude` dari koordinat browser mahasiswa.
*   Kirim koordinat ini beserta string Base64 gambar wajah ke fungsi `onSubmitAttendance`.

### 3. Rekap & Riwayat Presensi
*   **Tab Rekap Kehadiran**:
    *   Tampilkan daftar seluruh mata kuliah mahasiswa.
    *   Asumsikan 14 pertemuan target perkuliahan.
    *   Tampilkan jumlah pertemuan yang dihadiri (berdasarkan filter status `Hadir` di riwayat absensi mata kuliah tersebut).
    *   Gunakan radial progress ring untuk menggambarkan persentase kehadiran.
    *   Jika persentase kehadiran di bawah **75%** (kurang dari 11 kali hadir), tampilkan badge peringatan berwarna merah: `⚠️ Kehadiran < 75%. Terancam tidak memenuhi syarat ujian!`
*   **Tabel Riwayat Presensi**:
    *   Tampilkan tabel kronologis dari semua record kehadiran yang berhasil dicatat.
    *   Kolom yang disediakan: Nama Mata Kuliah, Waktu & Tanggal Absen, Koordinat Lokasi (GPS), Foto Snapshot Wajah (thumbnail bulat kecil), dan Status Kehadiran (`Hadir`).

## Langkah Verifikasi
1. Klik absen, verifikasi lampu kamera aktif dan menampilkan feed wajah Anda.
2. Pastikan progress bar pemindaian memproses selama 2 detik sebelum mengambil snapshot.
3. Izinkan lokasi GPS, verifikasi koordinat terisi.
4. Klik submit, pastikan data tersimpan di tabel riwayat lengkap dengan foto wajah Anda.
5. Verifikasi persentase kehadiran terhitung dengan benar pada tab Rekap.
6. Pastikan proyek sukses dikompilasi dengan `npm run build`.
