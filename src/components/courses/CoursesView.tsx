import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Course, Task } from '../../types';
import Skeleton from '../ui/Skeleton';
import CourseCard from './CourseCard';
import CourseDetailPanel from './CourseDetailPanel';
import CourseEnrollModal from './CourseEnrollModal';
import CourseEditModal from './CourseEditModal';

interface CoursesViewProps {
  courses: Course[];
  onAddCourse: (course: Course) => void;
  onEditCourse: (courseId: number, updatedCourse: Course) => void;
  onDeleteCourse: (courseId: number) => void;
  onToggleTaskState?: (taskId: number) => void;
  tasks: Task[];
  isEnrollModalOpen: boolean;
  onSetEnrollModalOpen: (open: boolean) => void;
  searchQuery: string;
  loading?: boolean;
}

/**
 * Komponen CoursesView (Orkestrator)
 * 
 * Halaman utama pendaftaran dan pengelolaan Mata Kuliah (Courses).
 * Tanggung jawab:
 * - Menampilkan skeleton loader saat data loading.
 * - Menghitung total SKS terdaftar.
 * - Mengelola pembukaan panel detail/inspeksi mata kuliah (`selectedCourse`).
 * - Mengelola status edit mode (`isEditing`).
 * - Menyaring list mata kuliah berdasarkan pencarian.
 * - Merakit seluruh sub-komponen mata kuliah ke layout halaman.
 */
export default function CoursesView({
  courses,
  onAddCourse,
  onEditCourse,
  onDeleteCourse,
  onToggleTaskState,
  tasks,
  isEnrollModalOpen,
  onSetEnrollModalOpen,
  searchQuery,
  loading = false
}: CoursesViewProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="w-56 h-8 rounded-lg" />
            <Skeleton className="w-64 h-4 rounded-md" />
          </div>
          <Skeleton className="w-40 h-10 rounded-lg" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-xl p-6 flex flex-col gap-4 relative overflow-hidden shadow-sm h-[250px]">
              <Skeleton className="absolute left-0 top-0 bottom-0 w-1.5" />
              <div className="flex justify-between items-start">
                <Skeleton className="w-16 h-5 rounded-md animate-pulse" />
                <Skeleton className="w-24 h-4 rounded-full animate-pulse" />
              </div>
              <div className="space-y-2">
                <Skeleton className="w-3/4 h-5 rounded-md animate-pulse" />
                <Skeleton className="w-1/2 h-4 rounded-md animate-pulse" />
              </div>
              <div className="mt-auto pt-4 border-t border-[#F1F5F9] dark:border-slate-800/60 flex flex-col gap-2">
                <Skeleton className="w-2/3 h-4 rounded-md animate-pulse" />
                <Skeleton className="w-3/4 h-4 rounded-md animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Hitung total SKS
  const totalSks = courses.reduce((sum, item) => sum + item.sks, 0);

  // Saring mata kuliah
  const filteredCourses = courses.filter((c) => {
    return (
      c.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.course_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lecturer_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="max-w-[1000px] mx-auto w-full space-y-6">
      
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-on-surface">Semester Ganjil 2026</h2>
          <p className="text-sm text-on-surface-variant font-medium mt-1">
            {courses.length} Mata Kuliah Aktif Terdaftar • {totalSks} SKS Terdaftar
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onSetEnrollModalOpen(true)}
            className="px-4 py-2 bg-primary hover:bg-[#4F46E5] text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Mata Kuliah</span>
          </button>
        </div>
      </div>

      {/* Panel Detail Mata Kuliah */}
      {selectedCourse && (
        <CourseDetailPanel
          selectedCourse={selectedCourse}
          tasks={tasks}
          onToggleTaskState={onToggleTaskState}
          onClose={() => setSelectedCourse(null)}
          onEditClick={() => setIsEditing(true)}
          onDeleteClick={() => {
            onDeleteCourse(selectedCourse.id);
            setSelectedCourse(null);
            setIsEditing(false);
          }}
        />
      )}

      {/* Grid Mata Kuliah */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length === 0 ? (
          /* Tampilan Kosong */
          <div className="col-span-full text-center py-12 bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-6">
            <div className="relative w-24 h-24 mb-4 flex items-center justify-center text-primary/30">
              <svg className="w-20 h-20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 19.5C4 18.6716 4.67157 18 5.5 18H20V22H5.5C4.67157 22 4 21.3284 4 19.5Z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M4 19.5C4 18.6716 4.67157 18 5.5 18H20V4H5.5C4.67157 4 4 4.67157 4 5.5V19.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M6 8H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M6 12H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <div className="absolute top-2 right-2 animate-bounce">
                <svg className="w-6 h-6 text-indigo-500/60" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3L1 9L12 15L21 10.09V17H23V9L12 3Z" fill="currentColor" />
                </svg>
              </div>
            </div>
            <p className="text-sm font-bold text-on-surface">Belum ada mata kuliah terdaftar</p>
            <p className="text-xs text-on-surface-variant mt-1 max-w-sm font-medium">
              {searchQuery ? 'Tidak ada mata kuliah yang cocok dengan pencarian Anda.' : 'Anda belum mendaftarkan mata kuliah apa pun untuk semester ini.'}
            </p>
          </div>
        ) : (
          /* Iterasi list matakuliah */
          filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              tasks={tasks}
              onClick={() => setSelectedCourse(course)}
            />
          ))
        )}
      </div>

      {/* Modal Pendaftaran Baru */}
      <CourseEnrollModal
        isOpen={isEnrollModalOpen}
        onClose={() => onSetEnrollModalOpen(false)}
        onAddCourse={onAddCourse}
      />

      {/* Modal Penyuntingan */}
      {isEditing && selectedCourse && (
        <CourseEditModal
          selectedCourse={selectedCourse}
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          onEditCourse={(cid, updated) => {
            onEditCourse(cid, updated);
            setSelectedCourse(updated);
          }}
        />
      )}

    </div>
  );
}
