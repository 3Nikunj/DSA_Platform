# Development Setup

## Prerequisites
- Node.js 18+
- npm 9+
- Docker (optional but recommended for Postgres/Redis)

## Environment Variables
- Copy examples and edit values:
  - `apps/backend/.env.example` → `apps/backend/.env`
- Important backend keys:
  - `DATABASE_URL` (example points to Postgres)
  - `REDIS_URL`
  - `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`
  - `FRONTEND_URL` (default CORS origin is `http://localhost:5173`)

## Services (Docker Compose)
- File: `docker-compose.dev.yml`
- Starts `postgres` and `redis` for local dev:
  - Ensure ports do not clash; update `.env` and compose file if needed.

## Install & Run
- Install all workspaces: `npm run install:all`
- Start dev servers: `npm run dev`
  - Frontend: Vite at `http://localhost:5173`
  - Backend: Express at `http://localhost:5000`
- Frontend API base override (optional): set `VITE_API_URL` in `apps/frontend/.env` to `http://localhost:5000/api`

## Backend Tooling
- Prisma:
  - Generate client: `npm run db:generate --workspace=apps/backend`
  - Migrate (SQLite): `npm run db:migrate --workspace=apps/backend`
  - Seed: `npm run db:seed --workspace=apps/backend`
  - Studio: `npm run db:studio --workspace=apps/backend`
- Logging:
  - Winston logs: `error.log`, `combined.log` under backend
  - HTTP logs via Morgan

## Database Provider Alignment
- Current Prisma provider is `sqlite` (`apps/backend/prisma/schema.prisma:8-11`).
- `.env.example` targets Postgres. To adopt Postgres safely:
  1. Change `datasource db { provider = "postgresql" }` in `schema.prisma`.
  2. Update `DATABASE_URL` to a Postgres DSN (as in `.env.example`).
  3. Run `npm run db:generate` and `npm run db:migrate` in backend.
  4. Review Prisma model mapping and migration output carefully.
  5. Update any SQL assumptions (e.g., `init.sql`) to match Postgres.
- Note: switching providers requires a clean migration plan; ensure existing SQLite data is either migrated or discarded.

## Common Troubleshooting
- CORS errors: verify `FRONTEND_URL` matches the running frontend (`apps/backend/src/app.ts:61-66`, `apps/backend/src/index.ts:52-55`).
- 401s loop: check token refresh path and headers; see `apps/frontend/src/services/api.ts:54-73` and `apps/frontend/src/stores/authStore.ts:148-171`.
- Redis connection: confirm `REDIS_URL`; backend pings Redis in health check (`apps/backend/src/app.ts:95-105`).