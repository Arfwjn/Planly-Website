<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Course;
use App\Models\Task;
use App\Models\Note;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed database dengan data riil mata kuliah Teknik Informatika
     * khusus milik pengguna Arief Sidik Wijayanto.
     */
    public function run(): void
    {
        // 1. Buat atau perbarui Akun Pengguna Default (Arief Sidik Wijayanto)
        $user = User::updateOrCreate(
            ['email' => 'arfwjn@gmail.com'],
            [
                'name'              => 'Arief Sidik Wijayanto',
                'password'          => Hash::make('ariefsidik'),
                'nim'               => 'STI202303494',
                'major'             => 'Teknik Informatika',
                'semester'          => 4,
                'profile_photo_url' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFoYkxvSC3Tl7Lha5JHOML3Cc2hYx5Hhoh_yA__QxGX6rbapw7zZtOvOWuvFsVnxR6nNGtzUzrFVJFfu_G8hudADmzAZDH1shSH7Mr3tS3ufjyGaU-d9hD3ArSwarBm1TR6cXqN2MiMoTBst4W8NxtPjM2uwHLLKhojSWGvUBep5mGtAO3VbZakDBXlptVD5J5wPcgTnWXzbc81YIbapCO5hSMDAgnhL_lL7dx-K2jpfWn0MgiODu-J2up9aV3_2Kd9JpojgjSs9g4'
            ]
        );

        // Bersihkan data lama agar tidak duplikat saat seeding diulang
        Course::where('user_id', $user->id)->delete();
        Task::where('user_id', $user->id)->delete();
        Note::where('user_id', $user->id)->delete();

        // 2. Tambahkan 5 Mata Kuliah Baru (SWU001 - SWU005)
        $c1 = Course::create([
            'user_id'       => $user->id,
            'course_code'   => 'SWU001',
            'course_name'   => 'Website Programming Lanjut',
            'sks'           => 4,
            'lecturer_name' => 'Sunaryono M.Kom',
            'room'          => 'KB. Ruang 2.3',
            'day_of_week'   => 'Wednesday',
            'start_time'    => '17:00',
            'end_time'      => '18:00',
            'color_hex'     => '#3525cd'
        ]);

        $c2 = Course::create([
            'user_id'       => $user->id,
            'course_code'   => 'SWU002',
            'course_name'   => 'Metodologi Penelitian',
            'sks'           => 4,
            'lecturer_name' => 'Singgih Briandoko S.Pd., M.Kom',
            'room'          => 'KB. Ruang 2.1',
            'day_of_week'   => 'Tuesday',
            'start_time'    => '17:00',
            'end_time'      => '18:00',
            'color_hex'     => '#7e3000'
        ]);

        $c3 = Course::create([
            'user_id'       => $user->id,
            'course_code'   => 'SWU003',
            'course_name'   => 'Mobile Programming Lanjut',
            'sks'           => 4,
            'lecturer_name' => 'Nicolaus Euclides Wahyu S.Kom., M.Cs.',
            'room'          => 'KB. Lab 2',
            'day_of_week'   => 'Tuesday',
            'start_time'    => '19:50',
            'end_time'      => '21:10',
            'color_hex'     => '#505f76'
        ]);

        $c4 = Course::create([
            'user_id'       => $user->id,
            'course_code'   => 'SWU004',
            'course_name'   => 'Rekayasa Perangkat Lunak',
            'sks'           => 2,
            'lecturer_name' => 'Tarwoto S.Kom., M.Msi.',
            'room'          => 'KS. Ruang 1.1',
            'day_of_week'   => 'Friday',
            'start_time'    => '17:00',
            'end_time'      => '18:00',
            'color_hex'     => '#4f46e5'
        ]);

        $c5 = Course::create([
            'user_id'       => $user->id,
            'course_code'   => 'SWU005',
            'course_name'   => 'Komputasi Awan',
            'sks'           => 2,
            'lecturer_name' => 'Aulia Desy Nur Utomo M.Cs.',
            'room'          => 'KB. Ruang 2.3',
            'day_of_week'   => 'Friday',
            'start_time'    => '18:30',
            'end_time'      => '19:30',
            'color_hex'     => '#ba1a1a'
        ]);

        // 3. Tambahkan Data Tugas Terkait (Tasks)
        Task::create([
            'user_id'     => $user->id,
            'course_id'   => $c3->id,
            'task_title'  => 'Membuat UI Login & Register di Flutter',
            'description' => 'Implementasi halaman login dan register menggunakan Flutter dengan validasi form, integrasi API, dan state management Provider.',
            'deadline'    => now()->addDays(1)->format('Y-m-d') . ' 23:59:00',
            'is_finished' => false,
            'is_priority' => true,
        ]);

        Task::create([
            'user_id'     => $user->id,
            'course_id'   => $c4->id,
            'task_title'  => 'Menyusun Dokumen SRS',
            'description' => 'Menyusun dokumen Software Requirement Specification (SRS) untuk proyek akhir semester, termasuk use case diagram dan activity diagram.',
            'deadline'    => now()->addDays(2)->format('Y-m-d') . ' 17:00:00',
            'is_finished' => false,
            'is_priority' => false,
        ]);

        Task::create([
            'user_id'     => $user->id,
            'course_id'   => $c2->id,
            'task_title'  => 'Praktikum Query SQL Lanjut',
            'description' => 'Mengerjakan latihan soal query SQL meliputi subquery, JOIN, stored procedure, dan trigger pada database MySQL.',
            'deadline'    => now()->addDays(6)->format('Y-m-d') . ' 09:00:00',
            'is_finished' => false,
            'is_priority' => false,
        ]);

        // 4. Tambahkan Data Catatan Kuliah Terkait (Notes)
        Note::create([
            'user_id'   => $user->id,
            'course_id' => $c1->id,
            'title'     => 'Ringkasan Pertemuan 1 - Arsitektur Web',
            'content'   => 'Konsep Client-Server, HTTP Request/Response cycle, REST API, JSON data format, dan setup Laravel controller routes.',
        ]);

        Note::create([
            'user_id'   => $user->id,
            'course_id' => $c3->id,
            'title'     => 'Catatan State Management Flutter',
            'content'   => 'Perbedaan setState, Provider, Bloc, dan Riverpod. Provider sangat cocok untuk proyek skala menengah karena mudah dipelajari.',
        ]);
    }
}
