# Week 2 — Public REST API Dashboard

Standalone React + Vite deliverable consuming the public JSONPlaceholder API (`https://jsonplaceholder.typicode.com`) with `useEffect`, `fetch`, search, user/status filtering, detail view, loading skeletons, error retry, and empty state handling.

## API Used & Limitations
- **Endpoints**: `GET /todos?_limit=24`, `GET /users`, `POST /todos`, `PATCH /todos/:id`, `DELETE /todos/:id`
- **Important Note**: JSONPlaceholder is a public read-only mock REST service. `POST`, `PATCH`, and `DELETE` requests return valid HTTP 200/201 responses, but mutations are **simulated** and are not persisted on JSONPlaceholder's backend across full page reloads.

## Running Locally
```bash
cd week-2-api-dashboard
npm install
npm run dev
```
