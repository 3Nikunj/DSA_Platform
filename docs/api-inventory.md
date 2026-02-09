# Backend API Inventory

## Base
- `GET /health` — health check (`apps/backend/src/app.ts:89-112`, `apps/backend/src/index.ts:64-71`)
- `GET /api` — API info (`apps/backend/src/app.ts:121-136`)
- Rate limit applied to `'/api/'` (`apps/backend/src/app.ts:75-87`, `apps/backend/src/index.ts:41-61`)

## Auth (`/api/auth`) — `apps/backend/src/routes/auth.ts`
- `POST /register` — create user (validations) → `apps/backend/src/controllers/authController.ts`
- `POST /login` — issue access + refresh tokens → `apps/backend/src/controllers/authController.ts`
- `POST /refresh` — refresh access token using session record → `apps/backend/src/controllers/authController.ts`
- `POST /forgot-password` — request reset → `apps/backend/src/controllers/authController.ts`
- `POST /reset-password` — set new password → `apps/backend/src/controllers/authController.ts`
- `GET /verify-email/:token` — email verification (Redis) → `apps/backend/src/controllers/authController.ts`
- `GET /me` — current user, `authenticateToken` → `apps/backend/src/middleware/auth.ts`

## Users (`/api/users`) — `apps/backend/src/routes/user.ts`
- Global `authenticateToken` on router `USE`
- `GET /profile` — current profile → `apps/backend/src/controllers/userController.ts`
- `PUT /profile` — update profile (validation) → `apps/backend/src/controllers/userController.ts`
- `DELETE /profile` — delete account → `apps/backend/src/controllers/userController.ts`
- `GET /search` — query users (pagination) → `apps/backend/src/controllers/userController.ts`
- `GET /:userId` — public profile → `apps/backend/src/controllers/userController.ts`
- `GET /:userId/progress` — user progress → `apps/backend/src/controllers/userController.ts`
- `GET /:userId/achievements` — user achievements → `apps/backend/src/controllers/userController.ts`
- `GET /:userId/statistics` — user stats → `apps/backend/src/controllers/userController.ts`
- `GET /leaderboard/xp` — XP leaderboard → `apps/backend/src/controllers/userController.ts`
- `GET /leaderboard/level` — level leaderboard → `apps/backend/src/controllers/userController.ts`
- `POST /avatar` / `DELETE /avatar` — upload/remove avatar → `apps/backend/src/controllers/userController.ts`
- `GET /preferences` / `PUT /preferences` — user preferences → `apps/backend/src/controllers/userController.ts`

## Algorithms (`/api/algorithms`) — `apps/backend/src/routes/algorithm.ts`
- Public:
  - `GET /` — list algorithms (filters) → `apps/backend/src/controllers/algorithmController-simple.ts`
  - `GET /categories` — categories → `apps/backend/src/controllers/algorithmController-simple.ts`
  - `GET /slug/:slug` — by slug → `apps/backend/src/controllers/algorithmController-simple.ts`
  - `GET /:algorithmId` — by id → `apps/backend/src/controllers/algorithmController-simple.ts`
- Protected (after `authenticateToken`):
  - `POST /:algorithmId/start` — start tracking
  - `POST /:algorithmId/complete` — mark complete
  - `POST /:algorithmId/submit` — submit code
  - `GET /:algorithmId/submissions` — list submissions
  - `GET /:algorithmId/progress` — progress details
  - `POST /:algorithmId/rate` — rate algorithm
  - `GET /recommended` — personalized recommendations

## Challenges (`/api/challenges`) — `apps/backend/src/routes/challenge.ts`
- Public:
  - `GET /` — list challenges (filters)
  - `GET /featured` — featured picks
  - `GET /daily` — daily challenge
  - `GET /:challengeId` — by id
  - `GET /competitions/active` / `upcoming`
  - `GET /competitions/:competitionId` / `leaderboard`
- Protected:
  - `POST /:challengeId/submit` — submit solution
  - `GET /:challengeId/attempts` / `submissions` / `hints` / `progress`
  - `POST /:challengeId/start` / `complete`
  - `GET /user/history` / `statistics` / `achievements`
  - `POST /:challengeId/bookmark` / `DELETE /:challengeId/bookmark`
  - `GET /bookmarks` — bookmarks
  - `GET /recommendations/personalized`
  - `GET /recommendations/similar/:challengeId`
  - Competitions (verified users): `POST /competitions/:competitionId/join` / `leave` / `GET /my-submissions`
  - Authoring: `POST /create`, `PUT /:challengeId`, `DELETE /:challengeId`
  - Validation/test: `POST /:challengeId/test` / `validate`
  - Analytics/solutions: `GET /:challengeId/analytics` / `solutions`

## Progress (`/api/progress`) — `apps/backend/src/routes/progress.ts`
- Global `authenticateToken` on router `USE`
- `GET /overview`, `GET /algorithm/:algorithmId`, `GET /category/:categoryId`
- `GET /categories`, `GET /insights`, `GET /level`

## Global Middleware
- 404: `apps/backend/src/middleware/notFound.ts`
- Error: `apps/backend/src/middleware/errorHandler.ts`
- Auth: `apps/backend/src/middleware/auth.ts` (`authenticateToken`, `optionalAuth`)

## Real-Time (Socket.IO)
- Initialization: `apps/backend/src/index.ts:30-36`
- Events: join rooms, algorithm-step, challenge-attempt, join-competition (`apps/backend/src/index.ts:81-109`)