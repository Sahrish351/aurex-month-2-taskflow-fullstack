# TaskFlow — AUREX Month 2 Full-Stack Engineering Submission Report

## 1. Executive Summary
**TaskFlow** is a full-stack task and deadline management SaaS platform built for the AUREX Month 2 Full-Stack Engineering Internship. The project spans four progressive deliverables—from foundational React state management (Week 1) and public REST API integration (Week 2) to a standalone Express + Mongoose CRUD service (Week 3) and a complete authenticated, user-isolated full-stack web application (Week 4).

Following the functional build, the user interface was elevated into a cohesive, warm-ivory and forest-green SaaS product with an extensive landing page, distraction-free standalone authentication cards, a seven-view authenticated workspace (`Overview`, `My Tasks`, `Today`, `Upcoming`, `Completed`, `Calendar`, `Settings`), and full mobile responsiveness across `375px` and desktop `1440px` viewports.

---

## 2. System Architecture

```text
+-------------------------------------------------------------------+
|                   React 19 + Vite SPA (src/ / frontend/)          |
|  - Public: Landing (/), Login (/login), Register (/register)      |
|  - Protected: Overview (/dashboard), My Tasks (/tasks),           |
|    Today (/today), Upcoming (/upcoming), Completed (/completed),  |
|    Calendar (/calendar), Settings (/settings)                     |
+---------------------------------+---------------------------------+
                                  | Fetch API (credentials: 'include'
                                  | + X-Requested-With + Bearer JWT)
                                  v
+-------------------------------------------------------------------+
|                 Express.js API Server (server.ts / backend/)      |
|  - Auth Middleware: verifies JWT from HttpOnly cookie OR Bearer   |
|  - CSRF Guard + Auth Rate Limiter + Centralized Error Handler     |
|  - Controllers: authController (bcrypt 12 rounds), taskController |
+---------------------------------+---------------------------------+
                                  | Mongoose ODM
                                  v
+-------------------------------------------------------------------+
|               MongoDB Atlas / In-Memory MongoDB (dev/test)        |
|  - users: { name, email (unique), passwordHash }                  |
|  - tasks: { title, description, status, priority, dueDate,        |
|             completedAt, owner (ObjectId ref User, indexed) }     |
+-------------------------------------------------------------------+
```

---

## 3. Deliverable Breakdown

### Week 1 — React Task Manager (`week-1-react-task-manager/`)
- Modular component hierarchy: `Header`, `TaskForm`, `TaskList`, `TaskItem`.
- Controlled inputs, validation, priority tagging, complete toggle, delete, and `localStorage` persistence.

### Week 2 — Public REST API Dashboard (`week-2-api-dashboard/`)
- Live `useEffect` + `fetch` integration with JSONPlaceholder (`/todos`, `/users`).
- Search, status/user filters, `TodoDetailModal`, explicit loading/error/empty states, and simulated mutations.

### Week 3 — Express + Mongoose CRUD API (`week-3-crud-api/`)
- Clean `config/`, `models/`, `controllers/`, `routes/`, `middleware/` architecture.
- Full `POST / GET / PUT / DELETE` endpoints on `/api/items` plus `/api/health`.
- Automated test suite: **7/7 passing**.

### Week 4 — Authenticated Full-Stack TaskFlow (`backend/` + `src/` + `frontend/`)
- **Security**: `bcryptjs` password hashing (12 rounds), JWT verification, `HttpOnly` session cookie + in-memory `Authorization: Bearer` header, CSRF origin/header checks, auth rate limiting, and zero password exposure (`passwordHash` omitted in serialization).
- **Strict User Data Isolation**: Every task read, create, update, toggle, and delete query filters by `owner: req.user._id`. Client-supplied `owner` fields are ignored, and cross-user access returns `404`.
- **Workspace Features**: 5 derived KPIs (`Total`, `Completed`, `Pending`, `Overdue`, `Completion Rate %`), quick filters (`All`, `Active`, `Completed`, `High Priority`, `Overdue`), live search, sorting, Reopen completed tasks, Schedule Reminders popover, interactive monthly Calendar, and Settings with persisted preferences.

---

## 4. Verification Summary

| Check | Scope | Result |
| :--- | :--- | :--- |
| TypeScript Check (`npm run lint`) | Root frontend & server types | Passed (`0` errors) |
| Production Build (`npm run build` + Week 1/2/4 standalone builds) | All Vite bundles | Passed |
| Week 3 API Suite (`week-3-crud-api/tests/items.test.js`) | CRUD, validation, 400/404 handling | **7 / 7 passed** |
| Week 4 API Suite (`backend/tests/api.test.js`) | Register, login, JWT guards, CRUD, `?overdue=true`, User A vs B isolation | **8 / 8 passed** |
| Playwright End-to-End Browser Verification | Landing desktop/mobile, standalone Register/Login, Overview, My Tasks List/Board, Today, Upcoming, Completed + Reopen, Calendar desktop/mobile, Settings, Reload persistence, User B isolation | **All checks & zero-overflow assertions passed** |
