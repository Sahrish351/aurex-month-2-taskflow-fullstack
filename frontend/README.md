# TaskFlow Frontend (Week 4)

Standalone React + Vite + React Router client for TaskFlow.

## Environment Variables
Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` to your Express backend URL (e.g. `http://localhost:5000` locally or your Render/Railway deployment URL).

## Running Locally
```bash
cd frontend
npm install
npm run dev
```

## Deploying to Vercel
- Framework preset: `Vite`
- Root directory: `frontend`
- Environment variable: `VITE_API_BASE_URL=https://your-backend-url`
- `vercel.json` handles SPA rewrites so direct refreshes on `/dashboard` or `/login` resolve cleanly.
