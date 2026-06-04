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
  name: 'Alex Mercer',
  email: 'alex.mercer@university.edu',
  nim: '202303392',
  semester: 6,
  major: 'Computer Science',
  profile_photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFoYkxvSC3Tl7Lha5JHOML3Cc2hYx5Hhoh_yA__QxGX6rbapw7zZtOvOWuvFsVnxR6nNGtzUzrFVJFfu_G8hudADmzAZDH1shSH7Mr3tS3ufjyGaU-d9hD3ArSwarBm1TR6cXqN2MiMoTBst4W8NxtPjM2uwHLLKhojSWGvUBep5mGtAO3VbZakDBXlptVD5J5wPcgTnWXzbc81YIbapCO5hSMDAgnhL_lL7dx-K2jpfWn0MgiODu-J2up9aV3_2Kd9JpojgjSs9g4'
};

export const initialCourses: Course[] = [
  {
    id: 1,
    user_id: 1,
    course_code: 'CS301',
    course_name: 'CS301 Algorithm Analysis',
    sks: 3,
    lecturer_name: 'Dr. Alan Turing',
    room: 'Science Hall, Room 304',
    day_of_week: 'Wednesday',
    start_time: '11:30',
    end_time: '13:00',
    color_hex: '#3525cd'
  },
  {
    id: 2,
    user_id: 1,
    course_code: 'MATH205',
    course_name: 'Linear Algebra',
    sks: 3,
    lecturer_name: 'Prof. Emmy Noether',
    room: 'Science Bldg, Room 105',
    day_of_week: 'Tuesday',
    start_time: '13:00',
    end_time: '14:30',
    color_hex: '#7e3000'
  },
  {
    id: 3,
    user_id: 1,
    course_code: 'PHYS102',
    course_name: 'Quantum Mechanics I',
    sks: 4,
    lecturer_name: 'Dr. Richard Feynman',
    room: 'Lab Complex, Room 03',
    day_of_week: 'Friday',
    start_time: '09:00',
    end_time: '12:00',
    color_hex: '#505f76'
  },
  {
    id: 4,
    user_id: 1,
    course_code: 'CS350',
    course_name: 'Operating Systems',
    sks: 3,
    lecturer_name: 'Prof. Grace Hopper',
    room: 'Turing Hall, Room 210',
    day_of_week: 'Monday',
    start_time: '14:00',
    end_time: '15:30',
    color_hex: '#4f46e5'
  },
  {
    id: 5,
    user_id: 1,
    course_code: 'PHYS202',
    course_name: 'Physics 202 Lecture',
    sks: 3,
    lecturer_name: 'Dr. James Maxwell',
    room: 'Science Hall, Room 304',
    day_of_week: 'Wednesday',
    start_time: '09:00',
    end_time: '10:30',
    color_hex: '#ba1a1a'
  }
];

export const initialTasks: Task[] = [
  {
    id: 1,
    user_id: 1,
    course_id: 1,
    task_title: 'Complete Literature Review Draft',
    description: 'Literature review on dynamic scheduling algorithms and heuristic task allocation bounds.',
    deadline: getOffsetDatetime(1, '23:59:00'),
    is_finished: false,
    is_priority: true,
  },
  {
    id: 2,
    user_id: 1,
    course_id: 4,
    task_title: 'Read Chapters 4-6',
    description: 'Review sections on memory hierarchy, block placement policies, and caching structures.',
    deadline: getOffsetDatetime(2, '17:00:00'),
    is_finished: false,
    is_priority: false,
  },
  {
    id: 3,
    user_id: 1,
    course_id: null,
    task_title: 'Submit Peer Feedback Form',
    description: 'Evaluate midterm presentations of group members and write construction analysis reports.',
    deadline: getOffsetDatetime(4, '12:00:00'),
    is_finished: false,
    is_priority: false,
  },
  {
    id: 4,
    user_id: 1,
    course_id: 2,
    task_title: 'Review Syllabus for Midterm',
    description: 'Solve system matrix conversions, eigenvectors, and nullity proofs from sections 1 to 4.',
    deadline: getOffsetDatetime(6, '09:00:00'),
    is_finished: false,
    is_priority: false,
  },
  {
    id: 5,
    user_id: 1,
    course_id: null,
    task_title: 'Study Group Review for Calculus',
    description: 'Join Calculus peer review group at the Main Library Cafe to discuss homework solutions.',
    deadline: getOffsetDatetime(0, '14:00:00'),
    is_finished: false,
    is_priority: false,
  }
];

export const initialNotes: Note[] = [
  {
    id: 1,
    user_id: 1,
    course_id: null,
    title: 'Cognitive Psychology Lecture 4',
    content: 'Information processing theory compares the human brain to a computer. Key components include sensory memory (brief hold of environmental info), short-term/working memory (active processing, limited capacity), and long-term memory (permanent storage). Encoding strategies like chunking and mnemonics improve transfer to LTM.',
  },
  {
    id: 2,
    user_id: 1,
    course_id: null,
    title: 'Project Brainstorm: UI Patterns',
    content: 'Need to explore more asymmetrical layouts for the dashboard. Standard grids feel too rigid. Consider introducing bento-box style widgets that adapt to content length. Also, evaluate glassmorphism for sticky navs to maintain context during scroll.',
  },
  {
    id: 3,
    user_id: 1,
    course_id: null,
    title: 'Architecture Studio Notes',
    content: 'Sketches from the site visit. Pay attention to the cantilever stress points. Beautiful geometric layout, minimalist clean materials.',
  },
  {
    id: 4,
    user_id: 1,
    course_id: null,
    title: 'Literature Review Matrix',
    content: '- Smith (2022): Focuses on macro-economic trends. Misses local impact.\n- Doe & Lee (2023): Strong quantitative model, but small sample size.\n- Johnson (2021): Good historical context. Use for intro.',
  },
  {
    id: 5,
    user_id: 1,
    course_id: 1,
    title: 'To-Do List: Midterms',
    content: '[ ] Finish CS301 practice exam\n[x] Review History chapter 4-6\n[ ] Print study guides',
  },
  {
    id: 6,
    user_id: 1,
    course_id: null,
    title: 'Quick Thought',
    content: 'The intersection of minimalist design and high data density is where true productivity tools shine.',
  }
];
