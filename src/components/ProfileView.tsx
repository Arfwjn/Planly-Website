import React, { useState } from 'react';
import { User as UserIcon, Badge, MapPin, Bell, Palette, LogOut, ArrowRight, Save, X, Info } from 'lucide-react';
import { User } from '../types';

interface ProfileViewProps {
  user: User;
  onUserUpdate: (updatedUser: User) => void;
  onSignOut: () => void;
}

export default function ProfileView({ user, onUserUpdate, onSignOut }: ProfileViewProps) {
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editNim, setEditNim] = useState(user.nim);
  const [editMajor, setEditMajor] = useState(user.major);

  // Notifications toggle settings
  const [reminders, setReminders] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(false);

  // Appearance toggle settings
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  const handleAccountUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUserUpdate({
      ...user,
      name: editName,
      nim: editNim,
      major: editMajor
    });
    setIsEditingAccount(false);
    alert('Informasi profil berhasil disimpan.');
  };

  return (
    <div className="max-w-[1000px] mx-auto w-full space-y-8 pb-12">
      {/* Profile Header Block */}
      <section className="flex flex-col items-center text-center bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-sm">
        <div className="relative w-32 h-32 md:w-36 md:h-36 rounded-full mb-4 group">
          <div className="absolute inset-0 rounded-full border-4 border-white shadow-md z-15"></div>
          <img
            src={user.photoUrl}
            alt="Large User Avatar"
            className="w-full h-full object-cover rounded-full z-10"
            referrerPolicy="no-referrer"
          />
          <button
            onClick={() => alert('Photo upload: integrated with default university registration')}
            className="absolute bottom-1 right-1 z-20 w-8 h-8 rounded-full bg-primary hover:bg-[#4F46E5] text-white flex items-center justify-center shadow-md hover:scale-105 transition-transform cursor-pointer border border-white"
            aria-label="Edit Profile Avatar"
          >
            <UserIcon className="w-4.5 h-4.5" />
          </button>
        </div>

        <h1 className="text-2xl font-bold text-on-surface">{user.name}</h1>
        <p className="text-xs text-[#94A3B8] font-bold mt-1 tracking-wider uppercase">{user.email}</p>
        <p className="text-sm font-semibold text-on-surface-variant mt-2 max-w-md mx-auto">
          {user.major} • NIM {user.nim} • Semester {user.semester}
        </p>

        <div className="flex items-center gap-2 mt-4">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs">
            {user.classification}
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-on-surface-variant font-semibold text-xs flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {user.location}
          </span>
        </div>
      </section>

      {/* Settings Grid (Bento Style Layout) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Account Details Setting */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-[#F5F2FF] flex items-center justify-center text-primary">
                <UserIcon className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-base font-bold text-on-surface">Account Overview</h3>
            </div>

            {isEditingAccount ? (
              <form onSubmit={handleAccountUpdateSubmit} className="space-y-3 mb-4">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface uppercase mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full h-8 px-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-xs text-on-surface focus:outline-none"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface uppercase mb-1">
                      NIM ID
                    </label>
                    <input
                      type="text"
                      value={editNim}
                      onChange={(e) => setEditNim(e.target.value)}
                      className="w-full h-8 px-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-xs text-on-surface focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface uppercase mb-1">
                      Major Code
                    </label>
                    <input
                      type="text"
                      value={editMajor}
                      onChange={(e) => setEditMajor(e.target.value)}
                      className="w-full h-8 px-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-xs text-on-surface focus:outline-none"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-primary hover:bg-[#4F46E5] text-white font-semibold rounded text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Save className="w-3 h-3" /> Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingAccount(false)}
                    className="px-3 py-1.5 border border-[#E2E8F0] hover:bg-slate-50 text-on-surface-variant font-semibold rounded text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" /> Cancel
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-xs leading-relaxed text-on-surface-variant mb-6">
                Manage your profile information, academic records registration id, university communication emails, and secure credentials.
              </p>
            )}
          </div>

          {!isEditingAccount && (
            <button
              onClick={() => setIsEditingAccount(true)}
              className="self-start text-primary font-bold text-xs flex items-center gap-1 hover:underline group cursor-pointer bg-transparent border-none p-0"
            >
              <span>Update credentials</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>

        {/* Action Notifications toggle settings */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-[#F5F2FF] flex items-center justify-center text-primary">
                <Bell className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-base font-bold text-on-surface">Notifications</h3>
            </div>
            
            <div className="space-y-4 mb-4">
              <div className="flex justify-between items-center text-xs font-semibold text-on-surface">
                <span>Assignment Reminders (SKS & Schedulers)</span>
                <button
                  type="button"
                  onClick={() => setReminders(!reminders)}
                  className={`w-10 h-6 rounded-full relative cursor-pointer block transition-colors ${
                    reminders ? 'bg-primary' : 'bg-[#E2E8F0]'
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    reminders ? 'right-1' : 'left-1'
                  }`} />
                </button>
              </div>

              <div className="flex justify-between items-center text-xs font-semibold text-on-surface">
                <span>Daily Task Digest Email</span>
                <button
                  type="button"
                  onClick={() => setDailyDigest(!dailyDigest)}
                  className={`w-10 h-6 rounded-full relative cursor-pointer block transition-colors ${
                    dailyDigest ? 'bg-primary' : 'bg-[#E2E8F0]'
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    dailyDigest ? 'right-1' : 'left-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>
          
          <p className="text-[10px] text-on-surface-variant font-medium">
            Active alerts dispatched across registered channels.
          </p>
        </div>

        {/* Color Palette theme settings */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-[#F5F2FF] flex items-center justify-center text-primary">
              <Palette className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-base font-bold text-on-surface">Appearance Settings</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-2">
            <div
              onClick={() => setThemeMode('light')}
              className={`border-2 rounded-xl p-3 flex flex-col items-center gap-2 cursor-pointer transition-all ${
                themeMode === 'light'
                  ? 'border-primary bg-primary/5'
                  : 'border-[#E2E8F0] bg-white hover:bg-slate-50'
              }`}
            >
              <Palette className="w-6 h-6 text-primary" />
              <span className="text-xs font-bold text-primary">Light Mode</span>
            </div>
            
            <div
              onClick={() => {
                setThemeMode('dark');
                alert('Planly Dark Space theme: scheduled for implementation in upcoming v2.0 update.');
                setThemeMode('light');
              }}
              className="border border-[#E2E8F0] bg-white hover:bg-slate-50 rounded-xl p-3 flex flex-col items-center gap-2 cursor-pointer transition-all"
            >
              <Palette className="w-6 h-6 text-on-surface-variant" />
              <span className="text-xs font-semibold text-on-surface-variant">Dark Mode</span>
            </div>
          </div>
        </div>

        {/* Sign Out Warning Box */}
        <div className="bg-red-50/50 border border-red-200 rounded-2xl p-6 text-center flex flex-col justify-center items-center">
          <LogOut className="w-8 h-8 text-red-600 mb-2" />
          <h3 className="text-base font-bold text-red-600 mb-1">Sign Out Securely</h3>
          <p className="text-xs text-on-surface-variant max-w-[280px] mb-4">
            Terminate your current Planly academic session on this browser device safely.
          </p>
          <button
            onClick={onSignOut}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-full shadow-sm transition-colors cursor-pointer"
          >
            Log Out Now
          </button>
        </div>

      </section>

    </div>
  );
}
