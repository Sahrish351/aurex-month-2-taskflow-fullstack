# Week 1 — React Task Manager

Standalone React + Vite deliverable demonstrating component hierarchy, props, `useState`, controlled form inputs, validation, list rendering, conditional rendering, and `localStorage` persistence.

## Component Structure
- `src/App.jsx` — Holds top-level `tasks` and `filter` state, syncs to `localStorage`.
- `src/components/Header.jsx` — Displays title and derived summary counters (`Total`, `Active`, `Completed`).
- `src/components/TaskForm.jsx` — Controlled inputs for title, optional notes, and priority with inline validation.
- `src/components/TaskList.jsx` — Conditional empty-state rendering and mapped list of tasks with stable keys.
- `src/components/TaskItem.jsx` — Toggle completion and delete handlers for a single task.

## Running Locally
```bash
cd week-1-react-task-manager
npm install
npm run dev
```
