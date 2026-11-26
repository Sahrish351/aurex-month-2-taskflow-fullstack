# Week 3 — Express & Mongoose CRUD API

Standalone REST API built with Node.js, Express, and Mongoose for the `/api/items` resource.

## Endpoints
- `GET /api/health` — Database & service health check
- `POST /api/items` — Create item
- `GET /api/items` — List all items (supports `?status=active|completed`)
- `GET /api/items/:id` — Fetch single item by ObjectId
- `PUT /api/items/:id` — Update item fields with Mongoose validation
- `DELETE /api/items/:id` — Delete item

## Running Locally
```bash
cd week-3-crud-api
cp .env.example .env
# Set MONGODB_URI in .env for MongoDB Atlas (optional in local dev)
npm install
npm run dev
npm test
```
