# TaskFlow Testing Plan & Verification Commands

## 1. Automated Backend Suites (Node.js Test Runner + Mongoose)
Run Week 3 and Week 4 API tests:
```bash
# Week 3 CRUD API tests (7 tests)
node --test week-3-crud-api/tests/items.test.js

# Week 4 Auth, Task CRUD, Validation & User Isolation tests (8 tests)
node --test backend/tests/api.test.js
```

## 2. Coverage Matrix
| Area | Test Case | Expected Status |
| --- | --- | --- |
| Health | `GET /api/health` | `200 OK`, `database: "connected"` |
| Registration | Valid signup hashes password & hides `passwordHash` | `201 Created` |
| Registration | Duplicate normalized email | `409 Conflict` |
| Registration | Weak/short password or invalid input | `400 Bad Request` |
| Login | Valid credentials issue JWT | `200 OK` |
| Login | Incorrect password | `401 Unauthorized` |
| Auth Guard | Missing or tampered JWT on `/api/auth/me` & `/api/tasks` | `401 Unauthorized` |
| Tasks CRUD | Create, read, search, filter, update, toggle, delete | `201` / `200` |
| Data Isolation | User A reads/edits/toggles/deletes User B task ID | `404 Not Found`, User B intact |
| Week 3 CRUD | Create, validate empty payload, list, get by ID, bad ID, missing ID, update, delete | `201` / `200` / `400` / `404` |

## 3. End-to-End Browser Verification (Playwright Chromium)
End-to-end tests verify:
- Landing page desktop (1440x900) and mobile (390x844) rendering
- Registration flow, login flow, logout, and protected-route redirect
- Creating, editing, completing, searching, filtering, and deleting tasks in the live UI
- Empty state & validation error rendering
- Week 1 standalone Task Manager (`week-1-react-task-manager`)
- Week 2 standalone API Dashboard (`week-2-api-dashboard`)
