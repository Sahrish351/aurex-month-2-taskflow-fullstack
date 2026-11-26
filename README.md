# TaskFlow — AUREX Month 2 Full-Stack Engineering Internship

A production-structured, full-stack personal productivity and task management application built with **React, Vite, Node.js, Express, MongoDB/Mongoose, bcrypt, and JWT authentication**.

---

## Repository Structure

```text
.
├── server.ts                         # Integrated full-stack server (Express API + Vite/dist on port 3000)
├── src/                              # Root TaskFlow React application (Warm Ivory & Forest Green SaaS UI)
├── backend/                          # Standalone Week 4 Express + Mongoose API (Render/Railway ready)
│   ├── src/
│   │   ├── config/db.js              # MongoDB Atlas / mongodb-memory-server connection
│   │   ├── models/                   # User.js, Task.js (owner-indexed)
│   │   ├── controllers/              # authController.js, taskController.js
│   │   ├── middleware/               # authMiddleware.js, errorHandler.js, rateLimit.js
│   │   ├── routes/                   # authRoutes.js, taskRoutes.js
│   │   └── utils/validators.js
│   └── tests/api.test.js             # Automated API & User Isolation test suite (8 tests)
├── frontend/                         # Standalone Week 4 React + Vite JS package (Vercel ready)
├── week-1-react-task-manager/        # Week 1: Standalone React Task Manager (useState, CRUD, localStorage)
├── week-2-api-dashboard/             # Week 2: Standalone Public REST API Dashboard (JSONPlaceholder)
├── week-3-crud-api/                  # Week 3: Standalone Express + Mongoose CRUD API (/api/items, 7 tests)
├── docs/                             # API.md, DATABASE.md, TESTING.md, BUILD_PROGRESS.md, SUBMISSION_REPORT.md
├── postman/                          # TaskFlow.postman_collection.json
├── screenshots/                      # Genuine Playwright-captured desktop & mobile screenshots
├── scripts/                          # verify-and-capture.mjs & generate-report-pdf.mjs
└── TaskFlow_AUREX_Month2_Submission_Report.pdf
```

---

## Internship Deliverables Summary

| Deliverable | Folder | Key Concepts Demonstrated |
| :--- | :--- | :--- |
| **Week 1** | `week-1-react-task-manager/` | React components (`Header`, `TaskForm`, `TaskList`, `TaskItem`), `useState`, controlled inputs, validation, add/complete/delete |
| **Week 2** | `week-2-api-dashboard/` | `useEffect`, `fetch` integration with JSONPlaceholder (`/todos`, `/users`), search, filters, detail modal, loading/error/empty states |
| **Week 3** | `week-3-crud-api/` | Express + Mongoose REST CRUD (`POST`, `GET`, `PUT`, `DELETE` `/api/items`), health endpoint, automated integration tests (`7/7` pass) |
| **Week 4** | `backend/` + `src/` + `frontend/` | Full-stack TaskFlow with bcrypt password hashing, JWT `HttpOnly` cookie + `Bearer` auth, protected routes, strict owner data isolation, 7-view SaaS workspace, responsive mobile UI |

---

## Core Features (Final Application)

- **Extensive SaaS Homepage (`/`)**: Responsive navigation bar with mobile drawer, interactive dashboard preview hero, 11-card capabilities grid, tabbed showcase (`Overview Analytics`, `Today Focus`, `Monthly Calendar`), 4-step workflow, benefits, and footer.
- **Standalone Auth Pages (`/login`, `/register`)**: Clean centered cards with email remember option, password visibility controls, client & server validation, and loading states.
- **Expanded Protected Workspace**:
  - **Overview (`/dashboard`)**: 5 real-time KPI cards (`Total Tasks`, `Completed`, `Pending`, `Overdue`, `Completion Rate %`), quick filter chips (`All`, `Active`, `Completed`, `High Priority`, `Overdue`), search, sorting, Due Today & Overdue focus card, and Completion Overview ring.
  - **My Tasks (`/tasks`)**: Switchable List and Two-Column Board views with URL `?search=` integration.
  - **Today (`/today`)**: Groups Overdue, Due Today, and Unscheduled active tasks with one-click `+ Add Task for Today`.
  - **Upcoming (`/upcoming`)**: Chronological task breakdown (`Overdue`, `Today & Next 7 Days`, `Later Horizon`, `No Due Date`).
  - **Completed (`/completed`)**: Finished tasks archive with one-click **Reopen**, Edit, and Delete.
  - **Calendar (`/calendar`)**: Interactive monthly calendar grid (and mobile day indicators + agenda) where selecting any date displays its tasks and lets you schedule directly onto that date.
  - **Settings (`/settings`)**: Profile update, bcrypt-verified password change, persisted Workspace Preferences (default layout, default sort, compact density), and Log Out.
- **Live Schedule Reminders**: Header notification bell dynamically lists real overdue and due-today tasks.
- **Strict User Data Isolation**: Every task query and mutation on the backend scopes strictly to `req.user._id` from the verified JWT. User A cannot view, edit, toggle, or delete User B's tasks.

---

## Local Setup & Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` (never commit `.env`):
```env
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/taskflow
JWT_SECRET=replace-with-a-strong-random-secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```
*(In local development without `MONGODB_URI`, the server falls back automatically to `mongodb-memory-server` unless `NODE_ENV=production` without `ALLOW_MEMORY_DB=true`.)*

### 3. Run the Full-Stack App
```bash
npm run dev
```
Open `http://localhost:3000`.

### 4. Run Automated Tests & Verification
```bash
# Backend unit & integration tests (15 tests total)
NODE_PATH=./node_modules node --test week-3-crud-api/tests/items.test.js backend/tests/api.test.js

# Build production bundle
npm run build

# Full end-to-end Playwright verification across Week 1, Week 2, Week 3 & Week 4
node scripts/verify-and-capture.mjs
```

### 5. Run Standalone Week 1–3 Deliverables
- **Week 1:** `npx vite week-1-react-task-manager --config week-1-react-task-manager/vite.config.js`
- **Week 2:** `npx vite week-2-api-dashboard --config week-2-api-dashboard/vite.config.js`
- **Week 3:** `NODE_PATH=./node_modules node week-3-crud-api/src/server.js`

---

## Documentation & Evaluation Artifacts
- [API Documentation](docs/API.md)
- [Database Schema & Indexing](docs/DATABASE.md)
- [Testing & Security Verification](docs/TESTING.md)
- [Build Progress Tracker](docs/BUILD_PROGRESS.md)
- [Submission Report (Markdown)](docs/SUBMISSION_REPORT.md)
- [Submission Report (PDF)](TaskFlow_AUREX_Month2_Submission_Report.pdf)
- [Postman Collection](postman/TaskFlow.postman_collection.json)
- [Screenshot Gallery](screenshots/README.md)
