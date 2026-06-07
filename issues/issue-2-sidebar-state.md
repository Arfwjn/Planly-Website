# Issue 2: Navigasi Sidebar & Sinkronisasi State Core Aplikasi

Issue ini berfokus pada integrasi navigasi menu "Absensi" pada sidebar kiri aplikasi Planly serta penyediaan state global untuk riwayat absensi mahasiswa di file core aplikasi.

## Deskripsi Tugas

### 1. Pembaruan file `src/App.tsx`
*   Tambahkan state global untuk menampung riwayat absensi:
    ```typescript
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    ```
*   Di dalam effect inisialisasi data aplikasi (di mana data courses, tasks, notes dimuat dari API), tambahkan pemanggilan `api.attendance.getAll()` untuk memuat riwayat absensi dan mempopulasikan state `attendanceRecords`.
*   Tambahkan fungsi handler `handleCreateAttendance` untuk menyimpan absensi baru:
    ```typescript
    const handleCreateAttendance = async (payload: AttendanceSubmitPayload) => {
      try {
        const newRecord = await api.attendance.submit(payload);
        setAttendanceRecords((prev) => [newRecord, ...prev]);
        return newRecord;
      } catch (err: any) {
        throw new Error(err.message || 'Gagal menyimpan absensi.');
      }
    };
    ```
*   **Menu Sidebar**:
    *   Tambahkan item menu navigasi baru dengan label **"Absensi"** pada komponen Sidebar.
    *   Gunakan ikon SVG/Lucide `UserCheck` (atau sejenisnya yang representatif) sebagai penanda menu Absensi.
    *   Tautkan navigasi klik ke tab `'attendance'`.
*   **Routing Tampilan Halaman**:
    *   Pada fungsi render `renderActiveTab`, tambahkan penanganan case `'attendance'`.
    *   Tampilkan komponen placeholder `<AttendanceView />` (yang akan kita bangun di Issue 3) dengan properti:
        ```tsx
        <AttendanceView
          courses={courses}
          rescheduledSessions={rescheduledSessions}
          attendanceRecords={attendanceRecords}
          onSubmitAttendance={handleCreateAttendance}
        />
        ```

## Langkah Verifikasi
1. Pastikan menu sidebar baru "Absensi" muncul dengan ikon yang rapi di sebelah kiri aplikasi.
2. Ketika diklik, tab aktif berubah ke "Absensi" dan halaman menampilkan konten kosong/placeholder.
3. Aplikasi terkompilasi dengan sukses (`npm run build`).
