import React, { useState } from 'react';
import { Calendar, Clock, MapPin, User, GraduationCap, X, Plus, AlertCircle, BookOpen, Edit2, Trash2, CheckSquare } from 'lucide-react';
import { Course, Task } from '../types';

interface CoursesViewProps {
  courses: Course[];
  onAddCourse: (course: Course) => void;
  onEditCourse: (courseId: number, updatedCourse: Course) => void;
  onDeleteCourse: (courseId: number) => void;
  onToggleTaskState?: (taskId: number) => void; // Optional to prevent breaking check-in
  tasks: Task[];
  isEnrollModalOpen: boolean;
  onSetEnrollModalOpen: (open: boolean) => void;
  searchQuery: string;
}

export default function CoursesView({
  courses,
  onAddCourse,
  onEditCourse,
  onDeleteCourse,
  onToggleTaskState,
  tasks,
  isEnrollModalOpen,
  onSetEnrollModalOpen,
  searchQuery
}: CoursesViewProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);

  // Form fields (used for both Add and Edit)
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [sks, setSks] = useState(3);
  const [room, setRoom] = useState('');
  const [lecturerName, setLecturerName] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [colorHex, setColorHex] = useState('#3525cd');
  const [errorMsg, setErrorMsg] = useState('');

  const colorsOption = [
    { label: 'Indigo', value: '#3525cd' },
    { label: 'Rust', value: '#7e3000' },
    { label: 'Slate grey', value: '#505f76' },
    { label: 'Violaceous', value: '#4f46e5' },
    { label: 'Crimson red', value: '#ba1a1a' },
    { label: 'Emerald green', value: '#16a34a' }
  ];

  const getNextClassDate = (dayName: string): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDayIndex = days.indexOf(dayName);
    if (targetDayIndex === -1) return '';

    const d = new Date();
    const currentDayIndex = d.getDay();
    
    let daysUntil = targetDayIndex - currentDayIndex;
    if (daysUntil <= 0) {
      daysUntil += 7; // If today is Monday or past, find next Monday
    }
    
    d.setDate(d.getDate() + daysUntil);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!courseCode || !courseName || !room || !lecturerName) {
      setErrorMsg('Harap isi semua kolom pendaftaran.');
      return;
    }

    onAddCourse({
      id: 0,
      course_code: courseCode.trim().toUpperCase(),
      course_name: courseName,
      sks,
      room,
      lecturer_name: lecturerName,
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
      color_hex: colorHex,
      user_id: 1
    });

    // Reset fields
    setCourseCode('');
    setCourseName('');
    setSks(3);
    setRoom('');
    setLecturerName('');
    setDayOfWeek('Monday');
    setStartTime('09:00');
    setEndTime('10:30');
    onSetEnrollModalOpen(false);
  };

  const handleInspectEditClick = (course: Course) => {
    setIsEditing(true);
    setCourseCode(course.course_code);
    setCourseName(course.course_name);
    setSks(course.sks);
    setRoom(course.room);
    setLecturerName(course.lecturer_name);
    setDayOfWeek(course.day_of_week);
    setStartTime(course.start_time);
    setEndTime(course.end_time);
    setColorHex(course.color_hex);
    setErrorMsg('');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!courseCode || !courseName || !room || !lecturerName) {
      setErrorMsg('Harap lengkapi semua data mata kuliah.');
      return;
    }

    const updated: Course = {
      id: selectedCourse!.id,
      course_code: courseCode.trim().toUpperCase(),
      course_name: courseName,
      sks,
      room,
      lecturer_name: lecturerName,
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
      color_hex: colorHex,
      user_id: 1
    };

    onEditCourse(selectedCourse!.id, updated);
    setSelectedCourse(updated);
    setIsEditing(false);
  };

  const handleDeleteClick = (courseId: number) => {
    onDeleteCourse(courseId);
    setSelectedCourse(null);
    setIsEditing(false);
  };

  // Compute stats
  const totalSks = courses.reduce((sum, item) => sum + item.sks, 0);

  // Filter courses based on search queries
  const filteredCourses = courses.filter((c) => {
    return (
      c.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.course_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lecturer_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="max-w-[1000px] mx-auto w-full space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-on-surface">Fall Semester 2026</h2>
          <p className="text-sm text-on-surface-variant font-medium mt-1">
            {courses.length} Active Courses Enrolled • {totalSks} SKS Credits Checked
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onSetEnrollModalOpen(true)}
            className="px-4 py-2 bg-primary hover:bg-[#4F46E5] text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll Course</span>
          </button>
        </div>
      </div>

      {/* Course Detail Panel if a course is inspected */}
      {selectedCourse && (
        <div className="p-6 bg-primary/[0.02] border-2 border-primary/20 rounded-2xl relative shadow-xs animate-fade-in">
          
          {/* Controls: Edit, Delete, Close */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => handleInspectEditClick(selectedCourse)}
              className="text-on-surface-variant hover:text-primary p-2 bg-white border border-[#E2E8F0] hover:bg-[#F1F5F9] rounded-lg transition-colors cursor-pointer flex items-center justify-center"
              title="Edit course information"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleDeleteClick(selectedCourse.id)}
              className="text-red-500 hover:text-red-700 p-2 bg-white border border-red-100 hover:bg-red-50 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
              title="Unenroll course"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setSelectedCourse(null)}
              className="text-on-surface-variant hover:text-on-surface p-2 rounded-lg cursor-pointer bg-white border border-[#E2E8F0]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="text-xs font-extrabold px-3 py-1 rounded text-white shadow-xs"
              style={{ backgroundColor: selectedCourse.color_hex }}
            >
              {selectedCourse.course_code}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/15">
              Active Course
            </span>
          </div>

          <h3 className="text-xl font-bold text-on-surface mt-3">{selectedCourse.course_name}</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-xs font-semibold text-on-surface-variant pb-4 border-b border-dashed border-[#C7C4D8]">
            <span className="flex items-center gap-1.5 bg-white p-2.5 rounded-lg border border-[#E2E8F0] shadow-2xs">
              <User className="w-3.5 h-3.5 text-primary" />
              {selectedCourse.lecturer_name}
            </span>
            <span className="flex items-center gap-1.5 bg-white p-2.5 rounded-lg border border-[#E2E8F0] shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-primary" />
              {selectedCourse.day_of_week}, {selectedCourse.start_time} - {selectedCourse.end_time}
            </span>
            <span className="flex items-center gap-1.5 bg-white p-2.5 rounded-lg border border-[#E2E8F0] shadow-2xs">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              {selectedCourse.room}
            </span>
            <span className="flex items-center gap-1.5 bg-white p-2.5 rounded-lg border border-[#E2E8F0] shadow-2xs">
              <GraduationCap className="w-3.5 h-3.5 text-primary" />
              {selectedCourse.sks} Credits / SKS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Upcoming Schedule */}
            <div>
              <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" />
                Upcoming Schedule
              </h4>
              <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-2xs">
                <p className="text-sm font-bold text-on-surface">
                  Lecture Series Occurrence
                </p>
                <p className="text-xs text-on-surface-variant mt-1.5 font-medium">
                  Next Class: <span className="text-primary font-bold">{getNextClassDate(selectedCourse.day_of_week)}</span>
                </p>
                <p className="text-[10px] text-[#94A3B8] font-bold mt-1 uppercase">
                  Time: {selectedCourse.start_time} - {selectedCourse.end_time} ({selectedCourse.room})
                </p>
              </div>
            </div>

            {/* Related Tasks checklist */}
            <div>
              <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-primary" />
                Recent Tasks Checklist
              </h4>
              {tasks.filter((t) => t.course_id === selectedCourse.id).length === 0 ? (
                <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-2xs">
                  <p className="text-xs text-on-surface-variant italic font-medium">No pending assignments linked to this course.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {tasks
                    .filter((t) => t.course_id === selectedCourse.id)
                    .map((task) => (
                      <div 
                        key={task.id} 
                        className="flex items-center gap-2 bg-white p-2.5 rounded-lg text-xs font-bold border border-slate-100 shadow-3xs cursor-pointer select-none"
                        onClick={() => onToggleTaskState && onToggleTaskState(task.id)}
                      >
                        <input
                          type="checkbox"
                          checked={task.is_finished}
                          onChange={() => onToggleTaskState && onToggleTaskState(task.id)}
                          className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
                        />
                        <span className={`truncate ${task.is_finished ? 'line-through text-[#94A3B8]' : 'text-on-surface'}`}>
                          {task.task_title}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white border border-[#E2E8F0] rounded-2xl">
            <BookOpen className="w-12 h-12 text-[#94A3B8] mx-auto mb-3 opacity-60" />
            <p className="text-sm font-semibold text-on-surface">No courses enrolled</p>
            <p className="text-xs text-on-surface-variant mt-1">Try adding the class metadata manually.</p>
          </div>
        ) : (
          filteredCourses.map((course) => {
            const courseTasksCount = tasks.filter((t) => t.course_id === course.id && !t.is_finished).length;
            return (
              <article
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                className="bg-white border border-[#E2E8F0] rounded-xl p-6 flex flex-col gap-4 relative overflow-hidden shadow-sm hover:shadow-md hover:border-primary/30 transition-all group cursor-pointer h-full"
              >
                {/* Horizontal left primary side strip */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5 transition-all group-hover:w-2"
                  style={{ backgroundColor: course.color_hex }}
                ></div>

                <div className="flex justify-between items-start">
                  <span
                    className="text-[10px] font-bold px-2.5 py-1 rounded-md border"
                    style={{
                      color: course.color_hex,
                      backgroundColor: `${course.color_hex}10`,
                      borderColor: `${course.color_hex}25`
                    }}
                  >
                    {course.course_code}
                  </span>
                  
                  {courseTasksCount > 0 && (
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded-full">
                      {courseTasksCount} Pending
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-[16px] font-bold text-on-surface leading-tight mb-2 group-hover:text-primary transition-colors">
                    {course.course_name}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-semibold">
                    Lecture series with {course.sks} SKS credits.
                  </p>
                </div>

                <div className="mt-auto pt-4 border-t border-[#F1F5F9] flex flex-col gap-2 text-xs font-semibold text-on-surface-variant">
                  <div className="flex items-center gap-2.5">
                    <User className="text-[#94A3B8] w-3.5 h-3.5" />
                    <span>{course.lecturer_name}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock className="text-[#94A3B8] w-3.5 h-3.5" />
                    <span>
                      {course.day_of_week}s, {course.start_time} - {course.end_time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin className="text-[#94A3B8] w-3.5 h-3.5" />
                    <span>{course.room}</span>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Enroll Course Modal */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 bg-[#1b1b24]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[560px] overflow-hidden border border-[#E2E8F0] animate-zoom-in">
            {/* Header */}
            <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-on-surface text-lg">Enroll New Course</h3>
                <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                  Input detail for your upcoming academic schedule
                </p>
              </div>
              <button
                onClick={() => onSetEnrollModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-full cursor-pointer hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEnrollSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-2 animate-pulse">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    Course Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CS301"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-bold"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    Course Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Algorithm Analysis"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    Credits / SKS
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    required
                    value={sks}
                    onChange={(e) => setSks(parseInt(e.target.value))}
                    className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    Room / Location
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Science Hall, Room 304"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                  Lecturer Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Dr. Alan Turing"
                  value={lecturerName}
                  onChange={(e) => setLecturerName(e.target.value)}
                  className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    Class Day
                  </label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value)}
                    className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface font-semibold"
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                  Theme Palette Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorsOption.map((c) => {
                    const isSelected = colorHex === c.value;
                    return (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setColorHex(c.value)}
                        className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer hover:scale-110 ${
                          isSelected ? 'border-primary scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c.value }}
                        title={c.label}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-[#E2E8F0] flex justify-end gap-3 font-sans">
                <button
                  type="button"
                  onClick={() => onSetEnrollModalOpen(false)}
                  className="px-4 py-2 border border-[#E2E8F0] rounded-lg text-xs font-semibold hover:bg-[#F1F5F9] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-[#4F46E5] text-white font-semibold rounded-lg text-xs shadow-sm cursor-pointer"
                >
                  Enroll Course
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {isEditing && selectedCourse && (
        <div className="fixed inset-0 bg-[#1b1b24]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[560px] overflow-hidden border border-[#E2E8F0] animate-zoom-in">
            {/* Header */}
            <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-on-surface text-lg">Edit Course Info</h3>
                <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                  Update class metadata records for {selectedCourse.course_code}
                </p>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-full cursor-pointer hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    Course Code
                  </label>
                  <input
                    type="text"
                    required
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-bold"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    Course Name
                  </label>
                  <input
                    type="text"
                    required
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    Credits / SKS
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    required
                    value={sks}
                    onChange={(e) => setSks(parseInt(e.target.value))}
                    className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    Room / Location
                  </label>
                  <input
                    type="text"
                    required
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                  Lecturer Name
                </label>
                <input
                  type="text"
                  required
                  value={lecturerName}
                  onChange={(e) => setLecturerName(e.target.value)}
                  className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    Class Day
                  </label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value)}
                    className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface font-semibold"
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                  Theme Palette Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorsOption.map((c) => {
                    const isSelected = colorHex === c.value;
                    return (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setColorHex(c.value)}
                        className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer hover:scale-110 ${
                          isSelected ? 'border-primary scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c.value }}
                        title={c.label}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-[#E2E8F0] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-[#E2E8F0] rounded-lg text-xs font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-[#4F46E5] text-white font-semibold rounded-lg text-xs shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
