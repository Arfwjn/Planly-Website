import { useState } from 'react';
import { CalendarDays, Clock, MapPin, User, Sliders } from 'lucide-react';
import { Course } from '../types';

interface CalendarViewProps {
  courses: Course[];
  onOpenAddNewCourseModal: () => void;
}

export default function CalendarView({ courses, onOpenAddNewCourseModal }: CalendarViewProps) {
  // Let's create an interactive 7-day strip dynamically starting from today.
  const getDynamicDays = () => {
    const daysList = [];
    const daysNameShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daysFullName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      daysList.push({
        dayName: daysNameShort[d.getDay()],
        fullName: daysFullName[d.getDay()],
        dateNum: d.getDate(),
        dateObject: d
      });
    }
    return daysList;
  };

  const [daysInWeek] = useState(() => getDynamicDays());
  const [selectedDayObj, setSelectedDayObj] = useState(daysInWeek[0]);

  // Filter courses active for the selected Day
  const dayCourses = courses.filter((c) => c.day_of_week === selectedDayObj.fullName);

  const getSelectedMonthName = () => {
    return selectedDayObj.dateObject.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="max-w-[1000px] mx-auto w-full space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">Schedule</h1>
          <p className="text-sm text-on-surface-variant font-semibold mt-1">
            {getSelectedMonthName()}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setSelectedDayObj(daysInWeek[0])}
            className="px-3 py-2 border border-[#E2E8F0] hover:bg-slate-50 text-on-surface-variant text-xs font-semibold rounded-lg hover:text-on-surface transition-colors cursor-pointer"
          >
            Today
          </button>
          <button
            onClick={onOpenAddNewCourseModal}
            className="px-4 py-2 bg-primary hover:bg-[#4F46E5] text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm cursor-pointer transition-colors"
          >
            Enroll/Add Course
          </button>
        </div>
      </div>

      {/* Horizontal Date Selector */}
      <div className="w-full bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {daysInWeek.map((day) => {
            const isSelected = selectedDayObj.fullName === day.fullName;
            return (
              <button
                key={day.fullName}
                onClick={() => setSelectedDayObj(day)}
                className={`flex-shrink-0 flex flex-col items-center justify-center w-[64px] h-[78px] rounded-xl transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-white shadow-md ring-2 ring-primary ring-offset-2'
                    : 'border border-[#E2E8F0] bg-white text-on-surface-variant hover:bg-slate-50'
                }`}
              >
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'opacity-90' : 'text-[#94A3B8]'}`}>
                  {day.dayName}
                </span>
                <span className="text-lg font-bold mt-1">
                  {day.dateNum}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline view for the selected weekday */}
      <div className="relative pt-2">
        
        {/* Red Live Time Indicator on current day */}
        {selectedDayObj.fullName === daysInWeek[0].fullName && (
          <div className="absolute top-[35%] left-[60px] lg:left-[80px] right-0 h-[2px] bg-red-600 z-20 opacity-80 pointer-events-none flex items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-red-600 absolute -left-1 shadow-sm animate-pulse"></div>
          </div>
        )}

        <div className="space-y-4 relative">
          
          {dayCourses.length === 0 ? (
            /* Pristine empty state fallback with call to action */
            <div className="text-center py-12 bg-white border border-dashed border-[#C7C4D8] rounded-xl">
              <CalendarDays className="w-12 h-12 text-[#94A3B8] mx-auto mb-3 opacity-60" />
              <h3 className="text-sm font-semibold text-on-surface">No Classes Programmed</h3>
              <p className="text-xs text-on-surface-variant mt-1 mb-4">
                You have no coursework scheduled for {selectedDayObj.fullName}.
              </p>
              <button
                onClick={onOpenAddNewCourseModal}
                className="px-4 py-2 border border-[#E2E8F0] bg-white text-on-surface text-xs font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Enroll New Course Card
              </button>
            </div>
          ) : (
            dayCourses.map((course) => (
              <div key={course.id} className="flex gap-4 lg:gap-6 relative group">
                {/* Time Indicator column */}
                <div className="w-[50px] lg:w-[60px] flex-shrink-0 text-right pt-4 relative">
                  <span className="text-xs font-bold text-on-surface-variant block">
                    {course.start_time}
                  </span>
                  <span className="text-[9px] text-[#94A3B8] font-bold uppercase tracking-widest block">
                    {parseInt(course.start_time) >= 12 ? 'PM' : 'AM'}
                  </span>
                </div>

                {/* Course Details Card */}
                <div className="flex-1 bg-white rounded-2xl border border-[#E2E8F0] hover:border-primary/50 shadow-sm p-5 relative overflow-hidden transition-all hover:shadow-md cursor-pointer">
                  {/* Subject Theme Indicator Strip */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5"
                    style={{ backgroundColor: course.color_hex }}
                  ></div>

                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-base font-bold text-on-surface pl-2">
                      {course.course_name}
                    </h3>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded border shadow-2xs"
                      style={{
                        color: course.color_hex,
                        backgroundColor: `${course.color_hex}10`,
                        borderColor: `${course.color_hex}25`
                      }}
                    >
                      {course.course_code}
                    </span>
                  </div>

                  <div className="pl-2 space-y-2 text-xs text-on-surface-variant">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {course.start_time} - {course.end_time} ({course.sks} hours)
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-2 mt-1">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        <span>{course.lecturer_name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{course.room}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

        </div>
      </div>

    </div>
  );
}
