# ExecuteIt — Turn Intentions into Execution

ExecuteIt is a focused productivity and personal growth management SaaS platform that helps users turn long-term goals, ideas, and tasks into actionable steps, track execution momentum, develop disciplined execution habits, and measure tangible growth.

---

## 🌟 Key Features

1. **Executive Dashboard**
   - Time-aware personalized greetings (`"Good morning / afternoon / evening, Alex"`).
   - Core KPI metrics: Tasks due today, completed units, active roadmaps, overall progress.
   - **Today's Focus**: Prioritized tasks due before end of day with interactive completion toggles.
   - Weekly execution velocity sparkline chart and real-time activity feed.

2. **Smart Task Management**
   - Filter tabs: **All Tasks**, **Due Today**, **Upcoming**, **Overdue**, and **Completed**.
   - Dual view modes: **Responsive List View** and **Compact Kanban Board**.
   - Search by title, description, or tag `#Backend`, `#API`, `#Database`.
   - Multi-field sorting by Due Date, Priority, or Creation Date.
   - Comprehensive task modals with Zod schema validation.

3. **AI-Powered Task Breakdown (Differentiating Feature)**
   - Decomposes complex or ambiguous tasks into sequential milestones with duration estimates.
   - Interactive proposal interface: edit milestone titles, customize descriptions, reorder steps, add custom milestones, or regenerate.
   - Batch acceptance into task execution plans.

4. **Milestone Management & Progress Tracking**
   - Precise mathematical progress formulas: $\text{Progress} = \frac{\text{Completed Milestones}}{\text{Total Milestones}} \times 100\%$.
   - Check off milestones in real-time with automatic parent task progress updates.

5. **Personal Growth Roadmaps**
   - Group high-level ambitions into phased curricula (e.g. *Backend Developer Roadmap*, *Robotics Learning Roadmap*, *Internship Preparation Roadmap*).
   - Categorization by Career, Technical Mastery, Personal Growth, Health, Education, and Projects.
   - Dedicated roadmap detail view with stage breakdowns and associated task creation.

6. **Distraction-Free Notes & Knowledge Capture**
   - Markdown writing interface with live preview.
   - **Debounced autosave** (800ms) with visual status indicators (`Saved`, `Saving...`).
   - Associate notes directly with specific tasks and roadmaps.

7. **Reminders & Google Calendar Integration**
   - Segregated into *Due Today*, *Upcoming*, and *Completed*.
   - Honest Google Calendar integration status card with backend OAuth integration boundaries documented.

8. **Progress & Analytics**
   - Area and Bar charts powered by **Recharts**: Execution trends over time, tasks created vs completed.
   - Time range filter: **7 Days**, **30 Days**, **90 Days**.
   - Accessible screen-reader friendly summary text.

9. **Global Command Palette (`Ctrl+K` / `Cmd+K`)**
   - Instant search across tasks, roadmaps, and notes.
   - Direct execution triggers for creating tasks, roadmaps, or notes from anywhere in the application.

10. **Design System & Theme Engine**
    - Tailored navy blue palette: Deep navy (`#0F172A`), royal blue (`#2563EB`), pale blue surfaces (`#EFF6FF`).
    - High-contrast, sleek dark mode (`#0B1120` base, `#0F172A` cards, `#F1F5F9` text).
    - Fully responsive across desktop (persistent collapsible sidebar) and mobile (bottom navigation bar + slide-out drawer).

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom brand design tokens
- **Routing**: React Router v7
- **Charts**: Recharts
- **Icons**: Lucide React
- **Forms & Validation**: React Hook Form + Zod
- **API Client**: Centralized Fetch client with automatic mock fallback

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js `v18+` or `v20+` (tested on Node v22.14)
- npm `10+`

### 2. Installation
```bash
git clone <repo-url> executeit
cd executeit
npm install
```

### 3. Running Locally in Development Mode
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Running Production Build
```bash
npm run build
npm run preview
```

---

## ⚙️ Environment Variables & Switching Modes

Configuration is managed in `.env` (derived from `.env.example`):

```bash
# Backend Express Base URL
VITE_API_BASE_URL=http://localhost:3000/api

# Mock Mode Toggle:
# - 'true': Always use local mock services and sample data (Default for testing)
# - 'false': Send actual HTTP requests to Express backend with graceful fallback if unreachable
VITE_USE_MOCK=true
```

### Switching to Live Backend Mode
1. Change `VITE_USE_MOCK=false` in `.env`.
2. Start your Express/Node.js backend at `http://localhost:3000`.
3. If the backend is unreachable or undergoing maintenance, ExecuteIt will log a clear notice to the console and gracefully fallback to the mock store without breaking the user experience.

---

## 📂 Project Architecture

```
src/
├── assets/                  # Brand SVG icons and visual assets
├── components/
│   ├── feedback/            # ConfirmModal, alert components
│   ├── layout/              # AppLayout (Sidebar + Header + MobileNav), AuthLayout
│   ├── navigation/          # Sidebar, Header, MobileNav, CommandPalette (Ctrl+K)
│   └── ui/                  # Button, Input, Textarea, Select, Checkbox, Badge, Card, Modal, ProgressBar, Skeleton, EmptyState, Tabs
├── context/
│   ├── AuthContext.tsx      # User authentication session and state
│   ├── ThemeContext.tsx     # Light/Dark mode state and DOM sync
│   └── ToastContext.tsx     # Accessible toast notification system
├── features/
│   ├── ai/                  # AiTaskBreakdownModal (Step-by-step milestone decomposition)
│   ├── analytics/           # ProgressPage (Recharts analytics & trends)
│   ├── auth/                # SignIn, SignUp, ForgotPassword pages
│   ├── dashboard/           # Executive Dashboard, KPI cards, Today's focus
│   ├── landing/             # Public landing page with hero and features
│   ├── notes/               # NotesPage, NoteCard, NoteEditorModal
│   ├── reminders/           # RemindersPage & Google Calendar card
│   ├── roadmaps/            # RoadmapsPage, RoadmapCard, RoadmapDetailsPage, RoadmapFormModal
│   ├── settings/            # SettingsPage (Profile, theme, notifications, demo reset)
│   └── tasks/               # TasksPage, TaskCard, TaskDetailsModal, TaskFormModal
├── lib/
│   ├── progress.ts          # Central progress calculation formulas
│   └── utils.ts             # cn, date formatters, priority styles
├── routes/
│   └── index.tsx            # Client-side router declarations
├── services/
│   ├── api.ts               # Centralized API client & HTTP interceptor
│   ├── auth.service.ts      # Authentication service layer
│   ├── ai.service.ts        # AI task breakdown service layer
│   ├── mock-data.ts         # Alex Johnson initial demonstration datasets
│   ├── storage.ts           # LocalStorage persistence manager
│   ├── tasks.service.ts     # Task CRUD service
│   ├── milestones.service.ts# Milestones CRUD & reordering service
│   ├── roadmaps.service.ts  # Roadmaps service
│   ├── notes.service.ts     # Notes & autosave service
│   └── reminders.service.ts # Reminders service
├── types/
│   └── index.ts             # TypeScript interfaces for all data models
├── App.tsx                  # Root application wrapper with context providers
└── main.tsx                 # React entrypoint
```

---

## 🔒 Security & Backend Boundary Guarantees

- **No Stored Passwords**: Passwords are never placed into `localStorage` or `sessionStorage`.
- **Backend Cookie Session Alignment**: The frontend API client includes `credentials: 'include'` for secure, HttpOnly signed cookie management.
- **Honest AI & Calendar Integration Points**: The UI clearly displays simulated indicators during mock mode and provides technical documentation on the required `POST /api/ai/task-breakdown` and Google OAuth redirect flows.
- **Contract Reference**: Complete endpoint contracts are documented in [`docs/api-contracts.md`](./docs/api-contracts.md).
