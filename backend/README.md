# TaskFlow Backend (Week 4)

Authenticated REST API built with Node.js, Express, MongoDB Atlas, Mongoose, `bcryptjs`, and JSON Web Tokens (JWT).

## Key Features
- Password hashing with `bcryptjs` (salt rounds: 12)
- JWT authentication with `HttpOnly` cookie and `Authorization: Bearer` support
- CSRF verification for cookie-authenticated mutations
- Strict owner-level data isolation across all task endpoints
- Input validation and centralized error handling

## Running Locally
```bash
cd backend
cp .env.example .env
npm install
npm run dev
npm test
```
