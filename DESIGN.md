# DESIGN.md — Planly Web Application
**Version:** 1.0.0  
**Platform:** Web (Desktop-first, Responsive)  
**Reference:** Planly Mobile App (Flutter)

---

## 1. Design Philosophy

### Prinsip Utama
1. **Familiar** — Pengguna mobile yang beralih ke web tidak merasakan perbedaan konsep, hanya adaptasi layout.
2. **Efisien** — Di layar besar, tampilkan lebih banyak informasi tanpa scrolling berlebihan.
3. **Konsisten** — Design token (warna, tipografi, spacing) identik dengan versi mobile.
4. **Bersih** — Tetap minimalis: konten > dekorasi.

---

## 2. Design System

### 2.1 Color Palette

Identik dengan `app_colors.dart` di codebase mobile.

```css
/* === CORE COLORS === */
--color-primary:            #4F46E5;   /* Indigo — tombol utama, aksen aktif */
--color-primary-container:  #E0E7FF;   /* Background chip/badge primary */
--color-secondary:          #64748B;   /* Teks sekunder, ikon redup */
--color-secondary-container:#F1F5F9;   /* Background item/break */

/* === SURFACE COLORS === */
--color-surface:            #F8FAFC;   /* Background halaman utama */
--color-surface-white:      #FFFFFF;   /* Background kartu, modal */
--color-surface-low:        #F1F5F9;   /* Background item tersier */
--color-surface-high:       #E2E8F0;   /* Background bento card, divider tebal */
--color-surface-bright:     #F8FAFC;   /* Background input field */

/* === TEXT COLORS === */
--color-on-surface:         #1E293B;   /* Teks utama (heading, body) */
--color-on-surface-variant: #64748B;   /* Teks sekunder (label, hint) */
--color-on-primary:         #FFFFFF;   /* Teks di atas warna primary */

/* === BORDER & OUTLINE === */
--color-outline:            #94A3B8;   /* Placeholder, ikon redup */
--color-outline-variant:    #E2E8F0;   /* Border kartu, garis pemisah */

/* === SEMANTIC === */
--color-error:              #BA1A1A;   /* Hapus, error, overdue */
--color-error-container:    #FFDADC;   /* Background badge error */
--color-success:            #16A34A;   /* Task selesai */
--color-success-container:  #DCFCE7;   /* Background badge sukses */
--color-warning:            #D97706;   /* Peringatan */
```

### 2.2 Typography

Font: **Inter** (Google Fonts) — sama dengan versi mobile.

```css
/* Import */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');

/* Scale */
--text-xs:   0.75rem;   /* 12px — badge label, caption */
--text-sm:   0.875rem;  /* 14px — body kecil, label form */
--text-base: 1rem;      /* 16px — body utama */
--text-lg:   1.125rem;  /* 18px — judul item kartu */
--text-xl:   1.25rem;   /* 20px — section heading */
--text-2xl:  1.5rem;    /* 24px — page subtitle */
--text-3xl:  1.875rem;  /* 30px — page title utama */
--text-4xl:  2.25rem;   /* 36px — logo / branding */

/* Weight */
--font-normal:    400;
--font-medium:    500;
--font-semibold:  600;
--font-bold:      700;
--font-extrabold: 900;
```

### 2.3 Spacing Scale (8px base)

```css
--space-1:  0.25rem;   /*  4px */
--space-2:  0.5rem;    /*  8px */
--space-3:  0.75rem;   /* 12px */
--space-4:  1rem;      /* 16px */
--space-5:  1.25rem;   /* 20px */
--space-6:  1.5rem;    /* 24px */
--space-8:  2rem;      /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
--space-24: 6rem;      /* 96px */
```

### 2.4 Border Radius

```css
--radius-sm:   0.5rem;    /*  8px — input, tombol kecil */
--radius-md:   0.75rem;   /* 12px — kartu compact */
--radius-lg:   1rem;      /* 16px — kartu utama */
--radius-xl:   1.5rem;    /* 24px — modal, sidebar rounded */
--radius-full: 9999px;    /* Pill — badge, avatar */
```

### 2.5 Shadow Scale

```css
--shadow-xs:  0 1px 2px rgba(0,0,0,0.04);
--shadow-sm:  0 2px 8px rgba(0,0,0,0.06);
--shadow-md:  0 4px 12px rgba(0,0,0,0.08);
--shadow-lg:  0 8px 24px rgba(0,0,0,0.10);
--shadow-xl:  0 16px 48px rgba(0,0,0,0.14);
```

---

## 3. Layout Architecture

### 3.1 Global Layout Structure

```
┌─────────────────────────────────────────────────────┐
│                    TOP BAR (64px)                   │
│  [Logo]  [Page Title]           [Notif] [Avatar]   │
├──────────────┬──────────────────────────────────────┤
│              │                                      │
│   SIDEBAR    │         CONTENT AREA                 │
│   (240px)    │    (flex-1, max-width varies)        │
│              │                                      │
│  Navigation  │    Page-specific content             │
│  Items       │    with internal padding             │
│              │    24px all sides (desktop)          │
│              │                                      │
│  [User info] │                                      │
│  [Logout]    │                                      │
│              │                                      │
└──────────────┴──────────────────────────────────────┘
```

### 3.2 Sidebar Specification

**Lebar:** 240px (fixed di desktop), slide-over di mobile

**Struktur:**
```
┌────────────────────────────┐
│  🗓  Planly                │  ← Logo + nama app (20px bold, primary)
├────────────────────────────┤
│  ○  TODAY                  │  ← Nav item (active: bg primary-container)
│  ○  CALENDAR               │
│  ○  TASKS                  │
│  ○  COURSES                │
│  ○  NOTES                  │
├────────────────────────────┤
│  [Avatar 32px] Nama User   │  ← User info di bawah
│  PROFILE                   │
│  ────────────────          │
│  🚪 Logout                 │
└────────────────────────────┘
```

**Nav Item States:**
- Default: `color-on-surface-variant`, ikon abu-abu
- Hover: background `color-surface-low`
- Active: background `color-primary-container` (opacity 20%), ikon + teks `color-primary`, font-weight semibold
- Semua item memiliki border-radius-md

**Nav Item Anatomy:**
```
[Ikon 20px]  [Label teks 11px uppercase tracking-wider]
```

### 3.3 Top Bar Specification

**Tinggi:** 64px  
**Background:** `rgba(255,255,255,0.9)` + `backdrop-filter: blur(8px)`  
**Border bottom:** 1px solid `color-outline-variant` opacity 0.3

**Konten:**
- Kiri: Logo ikon (24px) + "Planly" (font 18px, bold, primary)
- Kanan: Ikon notifikasi (24px, primary) + Avatar user (32px circle)

**Catatan Desktop:** Top bar hanya menampilkan nama halaman aktif sebagai breadcrumb.

### 3.4 Content Area

```
padding: 24px (desktop)
padding: 16px (tablet)
padding: 16px 12px (mobile)
max-width: 1200px (centered di viewport sangat lebar)
```

### 3.5 Responsive Layout Adaptation

| Breakpoint | Sidebar | Top Bar | Navigation |
|---|---|---|---|
| Desktop (≥1024px) | Sidebar fixed 240px | Selalu tampil | Sidebar |
| Tablet (768-1023px) | Sidebar collapsible (overlay) | Tampil + hamburger | Sidebar overlay |
| Mobile (<768px) | Disembunyikan | Tampil + hamburger | Bottom navigation bar |

**Mobile Bottom Navigation (≤767px):**
```
┌────────┬────────┬────────┬────────┬────────┬────────┐
│ TODAY  │  CAL   │ TASKS  │COURSES │ NOTES  │PROFILE │
│  ikon  │  ikon  │  ikon  │  ikon  │  ikon  │  ikon  │
└────────┴────────┴────────┴────────┴────────┴────────┘
```
Tinggi: 70px, background putih, shadow ke atas.

---

## 4. Component Library

### 4.1 Button

**Primary Button:**
```
background:    color-primary
color:         white
padding:       14px 20px
border-radius: radius-sm
font-size:     14px
font-weight:   medium
width:         100% (dalam form) / auto (standalone)
hover:         opacity 0.9, transform translateY(-1px)
disabled:      opacity 0.5, cursor not-allowed
loading state: spinner + teks "..."
```

**Secondary Button (outlined):**
```
background:    transparent
border:        1px solid color-outline-variant
color:         color-on-surface-variant
padding:       12px 24px
border-radius: radius-sm
hover:         background color-surface-low
```

**Danger Button:**
```
background:    transparent
color:         color-error
padding:       12px 24px
hover:         background color-error-container
```

**Icon Button:**
```
background:    transparent
padding:       8px
border-radius: radius-sm
hover:         background color-surface-low
color:         color-secondary (default) / color-primary (active)
```

### 4.2 Input Field

**Anatomy:**
```
[Label 12px semibold, on-surface-variant]
[Optional: trailing element (e.g. "Forgot password?")]
[Input field]
```

**Input States:**
```
Default (enabled):
  background:    color-surface-bright
  border:        1px solid color-outline-variant
  border-radius: radius-sm
  padding:       14px 16px
  font-size:     14px
  color:         color-on-surface

Focus:
  border:        1.5px solid color-primary
  outline:       none

Disabled:
  opacity: 0.6
  cursor: not-allowed

Error:
  border:        1.5px solid color-error
  + helper text merah di bawah
```

**Placeholder:** `color-outline` (abu-abu terang)

### 4.3 Card

**Standard Card:**
```
background:    white
border:        1px solid color-outline-variant opacity 0.5
border-radius: radius-lg
padding:       16px (compact) / 24px (spacious)
box-shadow:    shadow-sm
```

**Course Card (dengan accent strip):**
```
Standard Card +
border-radius: radius-lg
IntrinsicHeight Row:
  Left strip:  width 6px, background course.color_hex, radius kiri
  Content:     padding 16px
```

**Bento Card:**
```
border-radius: 20px
padding:       16px
background:    variable (sesuai konten)
no-border:     true
```

### 4.4 Badge / Chip

**Status Badge:**
```
padding:       2px 8px
border-radius: radius-full
font-size:     10px
font-weight:   bold
```

Variasi warna:
- Pending: `color-primary-container` bg, `color-primary` text
- Overdue: `color-error-container` bg, `color-error` text
- Completed: `color-success-container` bg, `color-success` text
- High Priority: `color-primary-container` bg, `color-primary` text
- In Progress: `color-primary` bg, white text

**Info Chip (course detail):**
```
background:    color-surface-low
border:        1px solid color-outline-variant opacity 0.3
border-radius: 12px
padding:       8px 12px
font-size:     12px
```

### 4.5 Dialog / Modal

```
backdrop:      rgba(0,0,0,0.4) blur(2px)
container:     white, radius-xl, shadow-xl
min-width:     400px (desktop)
max-width:     560px
padding:       24px
```

**Confirm Dialog Structure:**
```
[Title 18px bold]
[Description 14px secondary]
[Gap]
[Cancel btn] [Confirm btn (danger atau primary)]
```

### 4.6 Tab Bar

```
border-bottom: 1px solid color-outline-variant

Tab item:
  padding:       12px 16px
  font-size:     14px
  font-weight:   medium
  color:         color-secondary (default)
  border-bottom: 3px solid transparent (default)

Active tab:
  color:         color-primary
  border-bottom: 3px solid color-primary
  font-weight:   bold
```

### 4.7 Segmented Control (Status Selector)

```
container:     background color-surface-low, border color-outline-variant 0.6, radius 12px, padding 4px
segment:       flex: 1, padding 12px, text-align center, radius 8px
active:        background white, border color-outline-variant 0.3, shadow-xs, color primary, font-semibold
inactive:      transparent, color on-surface-variant
```

### 4.8 Dropdown / Select

Menggunakan native `<select>` yang di-style custom atau headless UI component:
```
same border/padding as Input Field
suffix: chevron-down icon (color-outline)
```

### 4.9 Loading States

**Spinner:** 20×20px circular, `border-color: color-primary`, `border-top-color: transparent`

**Skeleton Loader** (untuk list items):
```
background: linear-gradient(90deg, color-surface-high 25%, color-surface-low 50%, color-surface-high 75%)
background-size: 200% 100%
animation: shimmer 1.5s infinite
border-radius: radius-sm
```

**Page-level loading:** centered spinner dengan padding 48px.

### 4.10 Empty State

```
Container: center, padding 48px vertikal
Ikon: 64px, color-outline opacity 0.5
Judul: 16px, color-secondary
Subjudul: 14px, color-outline (opsional)
CTA Button: (opsional) primary button
```

### 4.11 Toast / Snackbar

```
position:      fixed, bottom-right (desktop) / bottom-center (mobile)
background:    color-on-surface
color:         white
padding:       12px 16px
border-radius: radius-md
font-size:     14px
animation:     slide-up fade-in
auto-dismiss:  4 detik
```

---

## 5. Page-by-Page Design Spec

### 5.1 Halaman Auth (Login & Register)

**Layout:** Centered, single-column, tidak menggunakan sidebar/top bar.

```
┌──────────────────────────────────────────┐
│                                          │
│         🗓  Planly  (36px bold)          │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  Welcome back                      │  │
│  │  Sign in to manage your schedule   │  │
│  │                                    │  │
│  │  [Email field]                     │  │
│  │  [Password field]   Forgot pass?   │  │
│  │                                    │  │
│  │  [Login Button]                    │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Don't have an account? [Register]       │
│                                          │
└──────────────────────────────────────────┘
```

- Container kartu: `max-width: 400px`, centered secara horizontal dan vertikal (min-height: 100vh)
- Background: `color-surface`
- Kartu: white, border, shadow-sm, radius-lg, padding 24px

---

### 5.2 Dashboard — Today's Schedule

```
┌─────────────────────────────────────────────────────────────┐
│  Today's Schedule                           [⟳ Refresh]     │
│  Wednesday, Jun 4                                           │
│─────────────────────────────────────────────────────────────│
│                                                             │
│  ● 07:00 - 09:00    ← timeline dot + line                  │
│  │  ┌─────────────────────────────────────────────────┐   │
│  │  │  Matematika Diskrit              [In Progress]  │   │
│  │  │  📍 Ruang 201                                   │   │
│  │  │  👤 Dr. Slamet                                  │   │
│  │  └─────────────────────────────────────────────────┘   │
│  │                                                          │
│  ● 10:00 - 12:00    ← dot redup (passed)                   │
│  │  ┌─────────────────────────────────────────────────┐   │
│  │  │  ~~Basis Data~~              [Completed]         │   │  ← opacity 0.5
│  │  └─────────────────────────────────────────────────┘   │
│  │                                                          │
│  ────────────────────────────────────────────────────────  │
│                                                             │
│  Quick Tasks                                                │
│  ┌─────────────────────┐  ┌─────────────────────┐         │
│  │ 📋  Pending Task    │  │ 📖  Current Focus   │         │
│  │                     │  │                     │         │
│  │        3            │  │  Final project      │         │
│  │   Pending Task      │  │  Current Focus      │         │
│  └─────────────────────┘  └─────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

**Layout desktop:** Single column, max-width 720px, centered.

**Timeline item:**
- Kiri: kolom 30px (line + dot)
- Kanan: teks waktu (12px bold, primary jika aktif), kartu jadwal

**Bento cards:** Side-by-side, height sama (`align-stretch`)

---

### 5.3 Kalender Jadwal

```
┌─────────────────────────────────────────────────────────────┐
│  June                                           [Today]     │
│─────────────────────────────────────────────────────────────│
│  [Wed 4] [Thu 5] [Fri 6] [Sat 7] [Sun 8] [Mon 9] [Tue 10]  │
│   ↑ active (indigo bg, white text)                          │
│─────────────────────────────────────────────────────────────│
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Course tag]                           09:00 - 11:00│   │
│  │ Pemrograman Web                                     │   │
│  │ Dr. Ahmad                                           │   │
│  │ 📍 Lab Komputer A                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [kartu berikutnya...]                                      │
└─────────────────────────────────────────────────────────────┘
```

**Date strip:** Horizontal scroll di mobile, semuanya tampil di desktop (7 item × 56px + gap).

---

### 5.4 Halaman Tasks

```
┌─────────────────────────────────────────────────────────────┐
│  My Tasks                               [+ Add Task]        │
│─────────────────────────────────────────────────────────────│
│  [Pending tab]  [Done tab]                                  │
│─────────────────────────────────────────────────────────────│
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │ ☐  Final Project Report       [High Priority]      │    │
│  │    Pemrograman Web                                  │    │
│  │    🕐 Tomorrow, 11:59 PM                            │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │ ☐  Kuis Basis Data             [Overdue]           │    │
│  │    Basis Data                                       │    │
│  │    🕐 Yesterday, 9:00 AM                            │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

**Desktop enhancement:** Opsi dua kolom grid untuk list tugas di layar ≥1280px.

**Add Task — Slide-over Panel (desktop):**
```
┌────────────────────────────────┐
│                                │
│  New Task                   ✕  │
│  ─────────────────────────    │
│  [Task Title field]            │
│  [Subject dropdown]            │
│  [Description textarea]        │
│  [Date input] [Time input]     │
│  High Priority  [toggle]       │
│  Status: [Pending] [Done]      │
│                                │
│  [Cancel]        [Save Task]   │
└────────────────────────────────┘
```

Panel slide dari kanan (width: 480px), overlay backdrop.  
Di mobile: fullscreen bottom sheet atau halaman penuh.

---

### 5.5 Halaman Courses

```
┌─────────────────────────────────────────────────────────────┐
│  Semester 6 - 2026                      [+ Add Course]      │
│  18 SKS Enrolled • 6 Courses                                │
│─────────────────────────────────────────────────────────────│
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │█ CS101               │  │█ CS202               │        │  ← 2-col grid (desktop)
│  │  Algoritma & Pemrog  │  │  Basis Data          │        │
│  │  3 SKS               │  │  3 SKS               │        │
│  │  👤 Dr. Slamet       │  │  👤 Dr. Rini         │        │
│  │  🕐 Mon, 08:00-10:00 │  │  🕐 Tue, 10:00-12:00│        │
│  │  📍 Ruang 301        │  │  📍 Lab DB           │        │
│  └──────────────────────┘  └──────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

**Desktop layout:** 2-column grid (`grid-cols-2`, max-width 900px).  
**Tablet:** 1-column.  
**Mobile:** 1-column.

**Add/Edit Course — Modal (desktop):**
```
┌──────────────────────────────────────────────────┐
│  New Course                                    ✕  │
│  Add details for your upcoming class schedule.    │
│  ─────────────────────────────────────────────── │
│  [Code] [Course Name]                            │
│  [Credits/SKS]  [Room/Location]                  │
│  [Lecturer Name]                                 │
│  ─── Date & Time ───────────────────────────────  │
│  [Date picker]                                   │
│  [Start Time]  [End Time]                        │
│  ─────────────────────────────────────────────── │
│  [Cancel]                      [Save Course]     │
└──────────────────────────────────────────────────┘
```

Modal width: 560px, centered, dengan backdrop.

**Course Detail — Halaman Penuh:**
```
┌─────────────────────────────────────────────────────────────┐
│  ← Course Detail               [Edit ✏️]  [Delete 🗑️]     │
│─────────────────────────────────────────────────────────────│
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Active Course]                                    │   │
│  │  Pemrograman Web                                    │   │
│  │  [3 SKS] [Dr. Ahmad] [Lab Komputer A]              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  📅 Upcoming Schedule                                       │
│  ┌──────────────────────────────────────────────────┐      │
│  │  [JUN]  Lecture                                  │      │
│  │  [ 11]  🕐 09:00 - 11:00                        │      │
│  └──────────────────────────────────────────────────┘      │
│                                                             │
│  📋 Recent Tasks                           [View All]      │
│  ┌──────────────────────────────────────────────────┐      │
│  │  ▌ [Due Tomorrow]                               │      │
│  │    Final Project                                 │      │
│  │    Buat laporan akhir...                        │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

### 5.6 Halaman Notes

```
┌─────────────────────────────────────────────────────────────┐
│  [🔍 Search notes...]                  [+ New Note]         │
│─────────────────────────────────────────────────────────────│
│  ┌────────────────────────┐  ┌────────────────────────┐    │
│  │ [Course Tag]  Recent   │  │ [General]     Recent   │    │ ← 2-col masonry
│  │                        │  │                        │    │   atau grid
│  │ Judul Catatan          │  │ Judul Catatan 2        │    │
│  │                        │  │                        │    │
│  │ Isi catatan preview    │  │ Isi catatan preview    │    │
│  │ sampai 4 baris...      │  │ sampai 4 baris...      │    │
│  └────────────────────────┘  └────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

**Desktop:** 2–3 column grid (auto-fill, min 280px).  
**Tablet:** 2 kolom.  
**Mobile:** 1 kolom.

**Add/Edit Note — Halaman Penuh (bukan modal):**

Karena konten catatan panjang, gunakan halaman tersendiri:
```
┌─────────────────────────────────────────────────────────────┐
│  ← New Note                         [Save / Save Changes]  │
│─────────────────────────────────────────────────────────────│
│  [Subject dropdown (optional)]                              │
│─────────────────────────────────────────────────────────────│
│  Note Title                                                 │  ← h2 style, borderless
│  ─────────────────────────────────────────────────────────  │
│  Start typing your notes here...                            │  ← textarea expand
│                                                             │
│  [large text area]                                          │
└─────────────────────────────────────────────────────────────┘
```

**Note Detail — Halaman Penuh:**
```
┌─────────────────────────────────────────────────────────────┐
│  ← Back                         [Edit ✏️]  [Delete 🗑️]   │
│─────────────────────────────────────────────────────────────│
│  [Course/General tag]                                       │
│                                                             │
│  Judul Catatan                                              │  ← 28px bold
│                                                             │
│  Isi catatan lengkap dengan line height 1.6...             │
└─────────────────────────────────────────────────────────────┘
```

---

### 5.7 Halaman Profile

```
┌─────────────────────────────────────────────────────────────┐
│  ┌───────────────────────────────────────────────────────┐  │
│  │       [Avatar 96px]  [Edit ✏️ button]                 │  │
│  │       Nama Lengkap User                               │  │
│  │       email@example.com                               │  │
│  │                                                       │  │
│  │  [NIM: 202303392] [Semester: 6] [Program: Informatika]│  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  👤  Edit Profile                              ›       │  │
│  │  ⚙️  Settings                                  ›       │  │
│  │  🔔  Notifications                       [●]  ›       │  │
│  │  ────────────────────────────────────────────        │  │
│  │  🚪  Logout                                   (red)   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  App Version 2.1.0 (Build 402)                             │
└─────────────────────────────────────────────────────────────┘
```

**Desktop layout:** max-width 560px, centered.

---

## 6. Navigation & Routing

### 6.1 Route Map

```
/                    → Redirect ke /dashboard atau /login
/login               → Halaman Login
/register            → Halaman Register

/dashboard           → Today's Schedule
/schedule            → Kalender Jadwal
/tasks               → Daftar Tugas
/tasks/new           → Form Tambah Tugas (atau slide-over)
/tasks/:id           → Detail Tugas
/tasks/:id/edit      → Edit Tugas

/courses             → Daftar Mata Kuliah
/courses/new         → Form Tambah Mata Kuliah (atau modal)
/courses/:id         → Detail Mata Kuliah
/courses/:id/edit    → Edit Mata Kuliah

/notes               → Daftar & Search Catatan
/notes/new           → Form Tulis Catatan
/notes/:id           → Detail Catatan
/notes/:id/edit      → Edit Catatan

/profile             → Profil Pengguna
```

### 6.2 Navigation Labels (sesuai mobile)

| Route | Label | Ikon |
|---|---|---|
| /dashboard | TODAY | `LayoutDashboard` |
| /schedule | CALENDAR | `CalendarDays` |
| /tasks | TASKS | `CheckSquare` |
| /courses | COURSES | `BookOpen` |
| /notes | NOTES | `FileText` |
| /profile | PROFILE | `User` |

---

## 7. Interaction Patterns

### 7.1 Form Submission Flow
1. User mengisi form
2. Klik submit → validasi client-side
3. Jika invalid → highlight field + tampilkan pesan error inline
4. Jika valid → tombol loading state (disabled + spinner)
5. API request
6. Sukses → toast sukses → navigasi atau tutup modal
7. Error → toast error dengan pesan dari API → form tetap terbuka

### 7.2 Delete Confirmation
1. Klik tombol Delete (merah)
2. Muncul dialog modal: "[Entity] akan dihapus secara permanen. Lanjutkan?"
3. [Cancel] (abu-abu) / [Delete] (merah)
4. Klik Delete → loading state di tombol
5. Sukses → dialog tutup → navigasi ke daftar atau toast sukses

### 7.3 Task Completion via Checkbox
1. Klik checkbox
2. Optimistic UI: checkbox langsung berubah visual (centang)
3. API `PATCH /tasks/{id}/finish` di background
4. Error → rollback visual + toast error

### 7.4 Search Notes (Real-time)
1. User mengetik di search bar
2. Filter list langsung (debounce 300ms)
3. Tidak ada API call, filtering client-side
4. Jika kosong → tampilkan "No notes match your search"

### 7.5 Refresh Data
- Dashboard: tombol refresh di kanan header + auto-refetch saat window focus
- Semua list page: pull-to-refresh di mobile, tombol refresh atau manual via refetch

---

## 8. Responsive Design Breakpoints

```css
/* Mobile first */
@media (min-width: 768px)  { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1280px) { /* Wide desktop */ }
@media (min-width: 1440px) { /* Ultra wide */ }
```

### Adaptasi per Breakpoint

| Komponen | Mobile | Tablet | Desktop |
|---|---|---|---|
| Navigation | Bottom bar | Sidebar overlay | Sidebar fixed |
| Courses grid | 1 col | 1 col | 2 col |
| Notes grid | 1 col | 2 col | 2–3 col |
| Add Task | Fullscreen | Bottom sheet | Slide-over panel |
| Add Course | Fullscreen | Modal | Modal |
| Content padding | 16px | 20px | 24px |
| Card padding | 16px | 16px | 24px |

---

## 9. Animation & Transition

```css
/* Durasi standar */
--duration-fast:   150ms;
--duration-normal: 200ms;
--duration-slow:   300ms;

/* Easing standar */
--ease-default:    ease-in-out;
--ease-spring:     cubic-bezier(0.34, 1.56, 0.64, 1);  /* Bounce ringan */
--ease-out:        cubic-bezier(0, 0, 0.2, 1);
```

| Elemen | Animasi |
|---|---|
| Sidebar slide-over | Slide dari kiri, duration 300ms ease-out |
| Modal | Fade + scale 0.95 → 1, duration 200ms |
| Slide-over panel (tasks) | Slide dari kanan, duration 300ms ease-out |
| Toast | Slide dari bawah, duration 200ms |
| Tab switch | Content fade, duration 150ms |
| Page transition | Fade, duration 200ms |
| Button hover | transform translateY(-1px), duration 150ms |
| Card hover | shadow bertambah, duration 150ms |

---

## 10. Accessibility

### 10.1 Keyboard Navigation
- `Tab` / `Shift+Tab`: navigasi antar elemen interaktif
- `Enter` / `Space`: aktivasi tombol, checkbox
- `Escape`: tutup modal, dialog, slide-over
- `Arrow keys`: navigasi dalam dropdown, date picker

### 10.2 ARIA Labels
```html
<!-- Sidebar nav -->
<nav aria-label="Main navigation">
  <a aria-current="page">TODAY</a>

<!-- Modal -->
<dialog aria-labelledby="modal-title" aria-modal="true">

<!-- Form fields -->
<input aria-label="Email address" aria-required="true">
<input aria-invalid="true" aria-describedby="email-error">

<!-- Loading state -->
<button aria-busy="true" aria-label="Saving task...">

<!-- Status badge -->
<span role="status" aria-label="Task overdue">Overdue</span>
```

### 10.3 Color Contrast
Semua teks memenuhi WCAG AA:
- Teks normal (14-16px): rasio minimum 4.5:1
- Teks besar (18px+ atau 14px bold): minimum 3:1
- Primary (#4F46E5) di atas putih: 7.59:1 ✓
- Secondary (#64748B) di atas putih: 4.63:1 ✓

### 10.4 Focus Visible
```css
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
```

---

## 11. Error States

| Skenario | Visual |
|---|---|
| API gagal (list) | Error state: ikon ⚠️, pesan error, tombol "Retry" |
| Form submit gagal | Toast merah + field highlight jika error spesifik |
| 401 Unauthorized | Redirect ke login + toast "Session expired" |
| 404 Not Found | Halaman "Data tidak ditemukan" dengan tombol kembali |
| Network offline | Banner di atas: "No internet connection" (sticky) |
| Gambar profil gagal | Fallback ke avatar generatif (UI Avatars API) |

---

## 12. File & Folder Structure (Next.js)

```
planly-web/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx          ← Main layout (sidebar + topbar)
│   │   ├── dashboard/page.tsx
│   │   ├── schedule/page.tsx
│   │   ├── tasks/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── edit/page.tsx
│   │   ├── courses/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── edit/page.tsx
│   │   ├── notes/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── edit/page.tsx
│   │   └── profile/page.tsx
│   └── layout.tsx              ← Root layout
│
├── components/
│   ├── ui/                     ← Base components (Button, Input, Card, Dialog, etc.)
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   └── BottomNav.tsx
│   ├── dashboard/
│   │   ├── TimelineItem.tsx
│   │   └── BentoCard.tsx
│   ├── tasks/
│   │   ├── TaskCard.tsx
│   │   └── TaskSlideOver.tsx
│   ├── courses/
│   │   └── CourseCard.tsx
│   └── notes/
│       └── NoteCard.tsx
│
├── lib/
│   ├── api/
│   │   ├── auth.ts
│   │   ├── courses.ts
│   │   ├── tasks.ts
│   │   └── notes.ts
│   ├── hooks/
│   │   ├── useCourses.ts
│   │   ├── useTasks.ts
│   │   └── useNotes.ts
│   ├── utils/
│   │   ├── date.ts
│   │   └── color.ts
│   └── constants/
│       └── routes.ts
│
├── stores/
│   └── authStore.ts            ← Zustand store untuk auth
│
├── types/
│   ├── user.ts
│   ├── course.ts
│   ├── task.ts
│   └── note.ts
│
├── styles/
│   └── globals.css             ← CSS variables + Tailwind base
│
└── middleware.ts               ← Auth route protection
```

---

## 13. Design Checklist per Halaman

### Setiap halaman baru harus memiliki:
- [ ] Loading state (skeleton atau spinner)
- [ ] Error state (dengan pesan dan retry)
- [ ] Empty state (dengan ilustrasi/ikon + call-to-action)
- [ ] Responsive di 375px, 768px, 1024px, 1440px
- [ ] Semua elemen interaktif memiliki hover state
- [ ] Focus state keyboard visible
- [ ] Semua teks memiliki kontras yang memadai
- [ ] Konfirmasi sebelum aksi destruktif (delete)
- [ ] Feedback visual setelah setiap aksi (toast)

---

## 14. Asset Requirements

### Ilustrasi Empty States
Ikon-ikon dari Lucide React sudah cukup untuk v1.0. Pertimbangkan ilustrasi SVG custom untuk v2.0.

| Halaman | Ikon Empty State |
|---|---|
| Tasks (empty) | `CheckSquare` |
| Courses (empty) | `BookOpen` |
| Notes (empty) | `FileText` |
| Schedule (no class) | `CalendarX` |
| Today (no class) | `Sun` |

### Favicon & Icons
- Favicon: Kalender dengan warna primary indigo (#4F46E5)
- Apple touch icon: 180×180px
- OG image: 1200×630px (untuk share preview)

---

## 15. Design Review Checklist

Sebelum development dimulai, pastikan:

- [ ] Semua halaman sudah memiliki desain di atas
- [ ] Design token sudah didefinisikan dalam `globals.css`
- [ ] Komponen base UI sudah dibuat (Button, Input, Card, Dialog)
- [ ] Layout responsif sudah diuji di device simulator
- [ ] Prototype interaksi kritis sudah divalidasi (task flow, auth flow)
- [ ] Aksesibilitas dasar sudah dipertimbangkan di setiap komponen
- [ ] Naming convention komponen konsisten dengan codebase
