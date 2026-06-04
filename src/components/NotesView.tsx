import React, { useState } from 'react';
import { Notebook, Search, Plus, X, MessageSquare, BookOpen, AlertCircle, Trash2, Edit2 } from 'lucide-react';
import { Note, Course } from '../types';

interface NotesViewProps {
  notes: Note[];
  courses: Course[];
  onAddNote: (note: Omit<Note, 'id'>) => void;
  onEditNote: (noteId: number, updatedNote: Note) => void;
  onDeleteNote: (noteId: number) => void;
  searchQuery: string;
}

export default function NotesView({
  notes,
  courses,
  onAddNote,
  onEditNote,
  onDeleteNote,
  searchQuery
}: NotesViewProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [courseId, setCourseId] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState('');

  // Detailed view & edit states
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Edit Note fields
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCourseId, setEditCourseId] = useState<string>('');
  const [editErrorMsg, setEditErrorMsg] = useState('');

  const handleInspectNote = (note: Note) => {
    setSelectedNote(note);
    setIsEditing(false);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditCourseId(note.course_id !== null ? String(note.course_id) : '');
    setEditErrorMsg('');
  };

  const handleCreateNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim() || !content.trim()) {
      setErrorMsg('Harap isi judul catatan dan isi materi.');
      return;
    }

    onAddNote({
      title,
      content,
      course_id: courseId === '' ? null : Number(courseId),
      user_id: 1
    });

    setTitle('');
    setContent('');
    setCourseId('');
    setIsAdding(false);
  };

  const handleEditNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditErrorMsg('');

    if (!editTitle.trim() || !editContent.trim()) {
      setEditErrorMsg('Harap isi judul catatan dan isi materi.');
      return;
    }

    onEditNote(selectedNote!.id, {
      ...selectedNote!,
      title: editTitle,
      content: editContent,
      course_id: editCourseId === '' ? null : Number(editCourseId),
      user_id: 1
    });

    setSelectedNote(null);
    setIsEditing(false);
  };

  const handleDeleteClick = (e: React.MouseEvent, noteId: number) => {
    e.stopPropagation();
    onDeleteNote(noteId);
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
      setIsEditing(false);
    }
  };

  const getCourseTagName = (cid: number | null) => {
    if (cid === null) return 'General';
    const c = courses.find((item) => item.id === cid);
    return c ? c.course_code : 'Academic';
  };

  // Filter notes based on real-time search terms
  const filteredNotes = notes.filter((note) => {
    return (
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="max-w-[1000px] mx-auto w-full space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-on-surface">Notes</h2>
          <p className="text-sm text-on-surface-variant font-medium mt-1">
            Capture ideas, summarize lectures, and organize research.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-primary hover:bg-[#4F46E5] text-white px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Adding Mode Form Sheet inline */}
      {isAdding && (
        <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl shadow-sm relative animate-fade-in space-y-4">
          <button
            onClick={() => setIsAdding(false)}
            className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1 rounded-full bg-white border border-[#E2E8F0] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          
          <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">Create New Lecture Note</h3>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleCreateNoteSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                  Note Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="Cognitive Psychology Lecture 4"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                  Tag Course (Optional)
                </label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#E2E8F0] rounded-lg text-sm text-on-surface"
                >
                  <option value="">General Notes</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.course_code} - {c.course_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                Content / Markdown Notes (Min. 15 lines suggested)
              </label>
              <textarea
                required
                rows={10}
                placeholder="Start typing your notes here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-4 bg-white border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-sans leading-relaxed"
              ></textarea>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 border border-[#E2E8F0] bg-white rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-[#4F46E5] cursor-pointer"
              >
                Save Note
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notes Masonry layout */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
        {filteredNotes.length === 0 ? (
          <div className="break-inside-avoid bg-white border border-[#E2E8F0] rounded-2xl p-6 text-center shadow-sm w-full">
            <Notebook className="w-12 h-12 text-[#94A3B8] mx-auto mb-3 opacity-60" />
            <p className="text-sm font-semibold text-on-surface">No notes match your query</p>
            <p className="text-xs text-on-surface-variant mt-1">Try searching with other tags.</p>
          </div>
        ) : (
          filteredNotes.map((note) => {
            const isTodoNote = note.title.toLowerCase().includes('to-do list');
            
            return (
              <div
                key={note.id}
                onClick={() => handleInspectNote(note)}
                className="break-inside-avoid bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-300 cursor-pointer group flex flex-col gap-3 relative overflow-hidden"
              >
                {/* Accent indicator for to-dos */}
                {isTodoNote && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                )}

                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-bold leading-snug group-hover:text-primary transition-colors cursor-pointer text-on-surface">
                    {note.title}
                  </h3>
                  
                  <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleDeleteClick(e, note.id)}
                      className="text-red-500 hover:text-red-700 bg-transparent border-none p-0 cursor-pointer"
                      title="Delete note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content Parsing & Formatting */}
                {isTodoNote ? (
                  <ul className="text-xs space-y-1 text-on-surface-variant font-medium">
                    {note.content.split('\n').map((item, id) => {
                      const isChecked = item.includes('[x]');
                      const label = item.replace('[ ]', '').replace('[x]', '').trim();
                      return (
                        <li key={id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            readOnly
                            className="rounded border-[#C7C4D8] text-primary focus:ring-primary grayscale scale-95 opacity-60 pointer-events-none"
                          />
                          <span className={isChecked ? 'line-through text-[#94A3B8]' : ''}>
                            {label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-xs leading-relaxed line-clamp-6 text-on-surface-variant">
                    {note.content}
                  </p>
                )}

                {/* Accent Notebook Drawing Graphic inside architecture notes */}
                {note.title.includes('Architecture') && (
                  <div className="w-full h-28 bg-slate-100 rounded-lg overflow-hidden relative border border-[#E2E8F0] mt-1">
                    <img
                      src="https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=600"
                      alt="Geometric Notebook drawings"
                      className="w-full h-full object-cover grayscale opacity-80"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-2 pt-3 border-t border-[#F1F5F9]">
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#F1F5F9] text-on-surface-variant border border-[#E2E8F0]">
                    {getCourseTagName(note.course_id)}
                  </span>
                  <span className="text-[10px] font-medium ml-auto text-[#94A3B8]">
                    Recently updated
                  </span>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Note Inspection Modal Sheet */}
      {selectedNote && (
        <div className="fixed inset-0 bg-[#1b1b24]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={() => setSelectedNote(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[640px] max-h-[85vh] flex flex-col overflow-hidden border border-[#E2E8F0] animate-zoom-in" onClick={(e) => e.stopPropagation()}>
            
            {/* Header Controls */}
            <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#F1F5F9] text-on-surface-variant border border-[#E2E8F0]">
                  {getCourseTagName(selectedNote.course_id)}
                </span>
                <span className="text-[10px] text-[#94A3B8] ml-2 font-medium">Recently updated</span>
              </div>
              <div className="flex items-center gap-1.5">
                {!isEditing && (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-[#F1F5F9] rounded-lg transition-colors cursor-pointer"
                      title="Edit note"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(e, selectedNote.id)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedNote(null)}
                  className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-full cursor-pointer hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Note Content / Editing Form */}
            {isEditing ? (
              <form onSubmit={handleEditNoteSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                {editErrorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span>{editErrorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                      Note Title
                    </label>
                    <input
                      type="text"
                      required
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                      Course Tag
                    </label>
                    <select
                      value={editCourseId}
                      onChange={(e) => setEditCourseId(e.target.value)}
                      className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface"
                    >
                      <option value="">General Notes</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.course_code} - {c.course_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                    Content Notes
                  </label>
                  <textarea
                    required
                    rows={12}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-sans leading-relaxed"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-[#E2E8F0] rounded-lg text-xs font-semibold hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-[#4F46E5] cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <h3 className="text-2xl font-bold text-on-surface leading-tight">
                  {selectedNote.title}
                </h3>
                
                {/* Scrollable Note Body */}
                <div className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap pt-2 font-medium">
                  {selectedNote.content}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
