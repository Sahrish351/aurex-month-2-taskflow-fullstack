# TaskFlow — AUREX Month 2 Build Progress

## Phase Plan & Checklist

### Phase 1: Workspace Inspection, Design System & Assets
- [x] Inspect initial workspace, Node/Git/Playwright tooling, and PRD requirements
- [x] Install core dependencies (`react-router-dom`, `mongoose`, `bcryptjs`, `jsonwebtoken`, `cookie-parser`, `cors`, `mongodb-memory-server`, `playwright-core`)
- [x] Generate editorial visual assets and configure Warm Ivory (`#FAF8F3`), White (`#FFFFFF`), Deep Forest (`#183C32`), Forest Green (`#2F6B52`), and Soft Sage (`#E6EFE8`) palette
- [x] Configure `metadata.json`, `index.html`, `.env.example`, and Git repository

### Phase 2: Week 1 Deliverable (`week-1-react-task-manager/`)
- [x] Build standalone React + Vite JS Task Manager (`Header`, `TaskForm`, `TaskList`, `TaskItem`)
- [x] Implement `useState`, controlled inputs, validation, add/complete/delete, and `localStorage` persistence
- [x] Document Week 1 setup and verify build + Playwright UI verification

### Phase 3: Week 2 Deliverable (`week-2-api-dashboard/`)
- [x] Build standalone React + Vite JS API Dashboard using JSONPlaceholder (`/todos`, `/users`)
- [x] Implement `useEffect`, `fetch`, search, status/user filters, detail modal, add/toggle/delete, loading/error/empty states
- [x] Document JSONPlaceholder simulated mutation behavior and verify build + Playwright UI verification

### Phase 4: Week 3 Deliverable (`week-3-crud-api/`)
- [x] Build standalone Express + Mongoose CRUD API (`POST/GET/PUT/DELETE /api/items`, `GET /api/health`)
- [x] Organize `config/`, `models/`, `controllers/`, `routes/`, `middleware/`
- [x] Add automated CRUD & validation tests (`7/7` passing) and verify live endpoints

### Phase 5: Week 4 Backend & Security (`backend/` & root `server.ts`)
- [x] Implement `User` and `Task` Mongoose models (`passwordHash`, unique normalized email, `owner` ObjectId ref, compound owner index)
- [x] Implement `bcryptjs` hashing (12 rounds), JWT signing/verification, `HttpOnly` cookie + `Bearer` header support, CSRF header/origin guard, auth rate limiter, input validation
- [x] Implement auth endpoints (`/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`, `/api/auth/profile`)
- [x] Implement owner-scoped task CRUD endpoints (`/api/tasks`, `/api/tasks/:id`, `/api/tasks/:id/status`) including `?overdue=true` filtering
- [x] Write and run automated tests (`8/8` passing) covering auth, validation, overdue filters, persistence, and User A vs User B data isolation

### Phase 6: Week 4 Frontend (`src/` & `frontend/`)
- [x] Redesign SaaS Homepage (`/`) with responsive navbar + mobile menu, interactive Hero dashboard preview, 11-card Features grid, Showcase tabs, How It Works (4 steps), Benefits, CTA banner, and Footer
- [x] Redesign standalone centered Login (`/login`) and Register (`/register`) pages with password visibility controls, email remember option, validation, and loading states
- [x] Expand authenticated workspace across 7 dedicated views: Overview (`/dashboard`), My Tasks (`/tasks` List & Board), Today (`/today`), Upcoming (`/upcoming`), Completed (`/completed` with Reopen), Calendar (`/calendar` interactive month grid + mobile agenda), and Settings (`/settings` with Account, Security, Workspace Preferences, and Log Out)
- [x] Add live Schedule Reminders bell popover, 5 derived KPI cards, quick filter chips (`All`, `Active`, `Completed`, `High Priority`, `Overdue`), confirmation dialogs, toasts, and responsive mobile drawer
- [x] Sync standalone `frontend/` JavaScript package with full feature parity

### Phase 7: Documentation, Postman, Screenshots & Submission PDF
- [x] Create `README.md`, `docs/API.md`, `docs/DATABASE.md`, `docs/TESTING.md`, `docs/SUBMISSION_REPORT.md`
- [x] Create `postman/TaskFlow.postman_collection.json`
- [x] Run Playwright end-to-end verification and capture 22 genuine screenshots across all deliverables & viewports in `screenshots/`
- [x] Generate `TaskFlow_AUREX_Month2_Submission_Report.pdf`
- [x] Audit `.gitignore`, verify zero secrets staged, and prepare clean Git history
