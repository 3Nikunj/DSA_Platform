# DS Monorepo Context Guide

## Repository Overview
- Monorepo with npm workspaces under `apps/*`
- Primary apps:
  - `apps/frontend` — React + Vite + TypeScript UI
  - `apps/backend` — Express + TypeScript API
- Supporting services used in development: `Postgres` and `Redis` via `docker-compose.dev.yml`

## Tech Stack
- Frontend: React, Vite, TypeScript, React Router, `@tanstack/react-query`, Zustand, Tailwind CSS, Monaco Editor, `@react-three/fiber` + `drei`
- Backend: Express, TypeScript, Prisma (provider `sqlite`), Redis client, JWT auth, Helmet, CORS, Compression, Express Rate Limit, Winston + Morgan logging
- Real-time: Socket.IO initialized in `apps/backend/src/index.ts`

## Top-Level Structure
- `package.json` — workspaces and root scripts
- `docker-compose.dev.yml` — local `postgres` and `redis`
- `README.md` — project overview and quickstart
- `apps/frontend` — Vite app, routes in `src/App.tsx`
- `apps/backend` — Express app

## Backend Runtime Topology
- Main dev entry: `apps/backend/src/server.ts` (nodemon)
  - Starts HTTP server with Express app from `apps/backend/src/app.ts`
  - Connects Prisma and optional Redis
  - Exposes health `GET /health` and API info `GET /api`
- Alternative entry with Socket.IO: `apps/backend/src/index.ts`
  - Attaches Socket.IO to `http` server and wires event handlers

## Key Backend Components
- App setup: `apps/backend/src/app.ts`
  - Security: Helmet, CORS, Compression, Rate Limit
  - Health endpoint at `apps/backend/src/app.ts:89-112`
  - API mounts at `apps/backend/src/app.ts:115-119`
  - 404 + error handlers at `apps/backend/src/app.ts:139-142`
- Real-time server: `apps/backend/src/index.ts`
  - Socket.IO init at `apps/backend/src/index.ts:30-36`
  - Event handlers at `apps/backend/src/index.ts:81-109`
- Error handling: `apps/backend/src/middleware/errorHandler.ts`, `apps/backend/src/middleware/notFound.ts`
- Logging: `apps/backend/src/utils/logger.ts`
- Auth flow: controllers in `apps/backend/src/controllers/authController.ts`; middleware in `apps/backend/src/middleware/auth.ts`
- Routes: `auth`, `users`, `algorithms`, `progress`, `challenges` under `apps/backend/src/routes/*`
- Prisma schema: `apps/backend/prisma/schema.prisma` (provider `sqlite` at `apps/backend/prisma/schema.prisma:8-11`)

## Frontend Runtime Topology
- Entry points: `apps/frontend/src/main.tsx` renders `apps/frontend/src/App.tsx`
- Routing: React Router in `apps/frontend/src/App.tsx:38-132`
  - Public: `/`, `/login`, `/register`
  - Protected with `ProtectedRoute`: `/dashboard`, `/algorithms`, `/algorithms/:id/visualize`, `/challenges`, `/playground`, `/leaderboard`, `/profile`
- API client: `apps/frontend/src/services/api.ts`
  - Base URL at `apps/frontend/src/services/api.ts:6`
  - Interceptors at `apps/frontend/src/services/api.ts:17-90`
- State: persisted auth store in `apps/frontend/src/stores/authStore.ts`
- Visualization: `apps/frontend/src/components/visualization/ThreeVisualization.tsx`
- Code Playground: `apps/frontend/src/components/playground/CodePlayground.tsx`

## Environment & Services
- Backend `.env.example` at `apps/backend/.env.example`
  - `DATABASE_URL` points to Postgres, while Prisma is currently configured for `sqlite`
  - `REDIS_URL` for Redis cache
  - JWT secrets and expiration settings
- Dev services via `docker-compose.dev.yml` (Postgres, Redis)

## Commands
- Root:
  - `npm run dev` — concurrently runs backend (`nodemon src/server.ts`) and frontend (`vite`)
  - `npm run build` — builds all workspaces
  - `npm run test`, `npm run lint`, `npm run clean`
- Backend:
  - `npm run dev` — `nodemon src/server.ts`
  - `npm run db:migrate` / `db:generate` / `db:seed` / `db:studio`
- Frontend:
  - `npm run dev` — launches Vite (default `http://localhost:5173`)

## Notable Alignment Notes
- Database provider mismatch: `.env` targets Postgres, Prisma schema uses `sqlite`. See `docs/dev-setup.md` for guidance.
- Frontend CORS origin defaults to `http://localhost:5173`; can be overridden via `FRONTEND_URL` env.