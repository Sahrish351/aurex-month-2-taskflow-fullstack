# TaskFlow API Documentation

## Base URLs
- **Local Full-Stack Server:** `http://localhost:3000/api`
- **Standalone Week 4 Backend:** `http://localhost:5000/api`
- **Standalone Week 3 CRUD API:** `http://localhost:4003/api`

---

## Authentication Strategy
TaskFlow supports both:
1. **`HttpOnly` Cookie (`taskflow_token`)** — Automatically set on `POST /api/auth/register` and `POST /api/auth/login`, allowing browser sessions to survive page refreshes without exposing tokens to `localStorage` XSS vectors. Cookie-authenticated state-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`) verify the `X-Requested-With: TaskFlow` header or request `Origin`.
2. **`Authorization: Bearer <token>` Header** — Supported for API clients, Postman, and automated integration tests.

---

## General Endpoints

### `GET /api/health`
Returns service and MongoDB connection readiness.
- **200 OK:**
```json
{
  "status": "ok",
  "service": "taskflow-api",
  "database": "connected"
}
```

---

## Auth Endpoints

### `POST /api/auth/register`
Creates a new user account, hashes the password with `bcryptjs` (12 salt rounds), and returns a JWT.
- **Body:**
```json
{
  "name": "Ayesha Khan",
  "email": "ayesha@example.com",
  "password": "StrongPassword123"
}
```
- **201 Created:** `{ "user": { "id": "...", "name": "Ayesha Khan", "email": "ayesha@example.com" }, "token": "<jwt>" }`
- **400 Bad Request:** Missing/invalid fields or password under 8 characters.
- **409 Conflict:** Duplicate email address.

### `POST /api/auth/login`
Verifies email and password hash and issues a 7-day JWT.
- **Body:** `{ "email": "ayesha@example.com", "password": "StrongPassword123" }`
- **200 OK:** `{ "user": { ... }, "token": "<jwt>" }`
- **401 Unauthorized:** `{ "message": "Invalid email or password." }`

### `POST /api/auth/logout`
Clears the `taskflow_token` cookie.
- **200 OK:** `{ "message": "Logged out successfully." }`

### `GET /api/auth/me` *(Protected)*
Returns the currently authenticated user's profile (`passwordHash` excluded).
- **200 OK:** `{ "user": { "id": "...", "name": "...", "email": "...", "createdAt": "..." } }`
- **401 Unauthorized:** Missing, expired, or invalid token.

### `PUT /api/auth/profile` *(Protected)*
Updates the authenticated user's `name` and/or rotates password after verifying `currentPassword`.
- **Body:** `{ "name": "Ayesha K." }` or `{ "currentPassword": "...", "newPassword": "..." }`
- **200 OK:** `{ "user": { ... } }`

---

## Task Endpoints *(All Protected & Owner-Scoped)*

Every endpoint below derives `owner` strictly from `req.user._id`. Supplying another user's ID in request bodies has no effect, and accessing another user's task ID returns `404 Task not found.`

### `GET /api/tasks`
Lists tasks belonging to the authenticated user along with derived workspace statistics.
- **Query Params:**
  - `status`: `active` | `completed`
  - `priority`: `low` | `medium` | `high`
  - `overdue`: `true` (returns active tasks whose `dueDate` is strictly before UTC start-of-today)
  - `search`: case-insensitive substring match against `title` or `description`
  - `sort`: `newest` (default) | `oldest` | `dueDate` | `priority`
- **200 OK:**
```json
{
  "tasks": [ ... ],
  "stats": {
    "total": 4,
    "active": 3,
    "completed": 1,
    "overdue": 0,
    "completionRate": 25
  }
}
```

### `POST /api/tasks`
Creates a task owned by `req.user._id`.
- **Body:**
```json
{
  "title": "Finalize MongoDB Atlas indexes",
  "description": "Add compound index on owner and createdAt",
  "priority": "high",
  "status": "active",
  "dueDate": "2026-12-05"
}
```
- **201 Created:** `{ "task": { ... } }`

### `GET /api/tasks/:id`
Fetches a single task owned by the authenticated user.
- **400 Bad Request:** Malformed ObjectId.
- **404 Not Found:** Task does not exist or belongs to a different user.

### `PUT /api/tasks/:id`
Updates `title`, `description`, `status`, `priority`, or `dueDate` for an owner task.
- **200 OK:** `{ "task": { ... } }`

### `PATCH /api/tasks/:id/status`
Toggles task `status` between `active` and `completed` and sets/clears `completedAt`.
- **200 OK:** `{ "task": { ... } }`

### `DELETE /api/tasks/:id`
Permanently deletes an owner task.
- **200 OK:** `{ "message": "Task deleted successfully.", "id": "..." }`

---

## Week 3 Standalone CRUD API (`/api/items`)
- `POST /api/items` — Create item (`201`)
- `GET /api/items` — List all items (`200`)
- `GET /api/items/:id` — Read one item (`200`, `400`, `404`)
- `PUT /api/items/:id` — Update item (`200`, `400`, `404`)
- `DELETE /api/items/:id` — Delete item (`200`, `400`, `404`)
