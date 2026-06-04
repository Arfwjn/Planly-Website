import { User, Course, Task, Note } from './types';

// Dynamic date helper — keeps dummy data relative to today
const getOffsetDatetime = (days: number, time: string = '23:59:00'): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${time}`;
};

export const initialUser: User = {
  id: 1,
  name: 'Arief Sidik Wijayanto',
  email: 'arfwjn@gmail.com',
  nim: 'STI202303494',
  semester: 4,
  major: 'Teknik Informatika',
  profile_photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFoYkxvSC3Tl7Lha5JHOML3Cc2hYx5Hhoh_yA__QxGX6rbapw7zZtOvOWuvFsVnxR6nNGtzUzrFVJFfu_G8hudADmzAZDH1shSH7Mr3tS3ufjyGaU-d9hD3ArSwarBm1TR6cXqN2MiMoTBst4W8NxtPjM2uwHLLKhojSWGvUBep5mGtAO3VbZakDBXlptVD5J5wPcgTnWXzbc81YIbapCO5hSMDAgnhL_lL7dx-K2jpfWn0MgiODu-J2up9aV3_2Kd9JpojgjSs9g4'
};

export const initialCourses: Course[] = [
  {
    id: 1,
    user_id: 1,
    course_code: 'SWU001',
    course_name: 'Website Programming Lanjut',
    sks: 4,
    lecturer_name: 'Sunaryono M.Kom',
    room: 'KB. Ruang 2.3',
    day_of_week: 'Wednesday',
    start_time: '17:00',
    end_time: '18:00',
    color_hex: '#3525cd'
  },
  {
    id: 2,
    user_id: 1,
    course_code: 'SWU002',
    course_name: 'Metodologi Penelitian',
    sks: 4,
    lecturer_name: 'Singgih Briandoko S.Pd., M.Kom',
    room: 'KB. Ruang 2.1',
    day_of_week: 'Tuesday',
    start_time: '17:00',
    end_time: '18:00',
    color_hex: '#7e3000'
  },
  {
    id: 3,
    user_id: 1,
    course_code: 'SWU003',
    course_name: 'Mobile Programming Lanjut',
    sks: 4,
    lecturer_name: 'Nicolaus Euclides Wahyu S.Kom., M.Cs.,',
    room: 'KB. Lab 2',
    day_of_week: 'Tuesday',
    start_time: '19:50',
    end_time: '21:10',
    color_hex: '#505f76'
  },
  {
    id: 4,
    user_id: 1,
    course_code: 'SWU004',
    course_name: 'Rekayasa Perangkat Lunak',
    sks: 2,
    lecturer_name: 'Tarwoto S.Kom., M.Msi.',
    room: 'KS. Ruang 1.1',
    day_of_week: 'Friday',
    start_time: '17:00',
    end_time: '18:00',
    color_hex: '#4f46e5'
  },
  {
    id: 5,
    user_id: 1,
    course_code: 'SWU005',
    course_name: 'Komputasi Awan',
    sks: 2,
    lecturer_name: 'Aulia Desy Nur Utomo M.Cs.',
    room: 'KB. Ruang 2.3',
    day_of_week: 'Friday',
    start_time: '18:30',
    end_time: '19:30',
    color_hex: '#ba1a1a'
  }
];

export const initialTasks: Task[] = [
  {
    id: 1,
    user_id: 1,
    course_id: 1,
    task_title: 'Membuat UI Login & Register di Flutter',
    description: 'Implementasi halaman login dan register menggunakan Flutter dengan validasi form, integrasi API, dan state management Provider.',
    deadline: getOffsetDatetime(1, '23:59:00'),
    is_finished: false,
    is_priority: true,
  },
  {
    id: 2,
    user_id: 1,
    course_id: 4,
    task_title: 'Menyusun Dokumen SRS',
    description: 'Menyusun dokumen Software Requirement Specification (SRS) untuk proyek akhir semester, termasuk use case diagram, activity diagram, dan class diagram.',
    deadline: getOffsetDatetime(2, '17:00:00'),
    is_finished: false,
    is_priority: false,
  },
  {
    id: 3,
    user_id: 1,
    course_id: null,
    task_title: 'Mengisi Formulir KRS Semester Depan',
    description: 'Memilih dan mengisi mata kuliah semester depan melalui portal akademik mahasiswa sebelum batas waktu pengisian KRS.',
    deadline: getOffsetDatetime(4, '12:00:00'),
    is_finished: false,
    is_priority: false,
  },
  {
    id: 4,
    user_id: 1,
    course_id: 2,
    task_title: 'Praktikum Query SQL Lanjut',
    description: 'Mengerjakan latihan soal query SQL meliputi subquery, JOIN, stored procedure, dan trigger pada database MySQL.',
    deadline: getOffsetDatetime(6, '09:00:00'),
    is_finished: false,
    is_priority: false,
  },
  {
    id: 5,
    user_id: 1,
    course_id: 3,
    task_title: 'Laporan Implementasi Algoritma A*',
    description: 'Membuat laporan implementasi algoritma pencarian A* (A-Star) untuk menyelesaikan persoalan pathfinding pada peta grid.',
    deadline: getOffsetDatetime(0, '14:00:00'),
    is_finished: false,
    is_priority: true,
  }
];

export const initialNotes: Note[] = [
  {
    id: 1,
    user_id: 1,
    course_id: 3,
    title: 'Catatan Materi AI - Pertemuan 4',
    content: 'Algoritma pencarian: BFS (Breadth-First Search) dan DFS (Depth-First Search) adalah dasar dari algoritma pencarian pada graf. BFS mengeksplorasi level per level sedangkan DFS mengeksplorasi sedalam mungkin terlebih dahulu. Heuristik digunakan pada informed search seperti A* dan Greedy Best-First Search untuk meningkatkan efisiensi pencarian.',
  },
  {
    id: 2,
    user_id: 1,
    course_id: 1,
    title: 'Ide Proyek: Planly Mobile App',
    content: 'Konsep aplikasi manajemen akademik mahasiswa berbasis Flutter. Fitur utama: jadwal kuliah otomatis, pengingat tugas, catatan per mata kuliah, dan sinkronisasi data via REST API Laravel. Desain UI menggunakan Material Design 3 dengan tema warna Indigo.',
  },
  {
    id: 3,
    user_id: 1,
    course_id: 2,
    title: 'Ringkasan Normalisasi Database',
    content: '1NF: Setiap kolom hanya berisi nilai atomik (tidak ada array).\n2NF: Memenuhi 1NF + setiap atribut non-key bergantung penuh pada primary key.\n3NF: Memenuhi 2NF + tidak ada ketergantungan transitif.\nBCNF: Setiap determinan adalah candidate key.',
  },
  {
    id: 4,
    user_id: 1,
    course_id: 4,
    title: 'Checklist Proyek RPL',
    content: '[ ] Menyelesaikan dokumen SRS\n[ ] Membuat wireframe UI/UX\n[x] Menentukan tech stack (Laravel + Flutter)\n[ ] Menyiapkan repository GitHub\n[ ] Membuat ERD dan skema database',
  },
  {
    id: 5,
    user_id: 1,
    course_id: 5,
    title: 'Catatan Jaringan - Subnetting',
    content: 'Subnetting IPv4:\n- Kelas A: /8 default, 255.0.0.0\n- Kelas B: /16 default, 255.255.0.0\n- Kelas C: /24 default, 255.255.255.0\n\nContoh: 192.168.1.0/26 → 64 host per subnet, 4 subnet.\nRumus jumlah host = 2^(32-prefix) - 2',
  },
  {
    id: 6,
    user_id: 1,
    course_id: null,
    title: 'Tips Belajar Efektif',
    content: 'Teknik Pomodoro: belajar 25 menit, istirahat 5 menit. Setelah 4 siklus, istirahat panjang 15-30 menit. Gunakan active recall (mengingat tanpa melihat catatan) dan spaced repetition untuk memaksimalkan retensi jangka panjang.',
  }
];
