# Frontend Overview

## Stack
- React + Vite + TypeScript
- React Router for navigation
- `@tanstack/react-query` for data fetching/caching
- Zustand for auth state (persisted to `localStorage`)
- Tailwind CSS for styling
- Monaco Editor for code playground
- `@react-three/fiber` + `drei` for 3D visualizations

## Entry & Routing
- Entry: `apps/frontend/src/main.tsx` → `apps/frontend/src/App.tsx`
- Routes (`apps/frontend/src/App.tsx:38-132`):
  - `/` → `HomePage` (public)
  - `/login` → `LoginPage` (wrapped by `PublicRoute`)
  - `/register` → `RegisterPage` (wrapped by `PublicRoute`)
  - `/dashboard` → `DashboardPage` (wrapped by `ProtectedRoute` + `Layout`)
  - `/algorithms` → `AlgorithmsPage` (protected)
  - `/algorithms/:id/visualize` → `VisualizationPage` (protected)
  - `/challenges` → `ChallengesPage` (protected)
  - `/playground` → `PlaygroundPage` (protected)
  - `/leaderboard` → `LeaderboardPage` (protected)
  - `/profile` → `ProfilePage` (protected)
  - `*` → redirect to `/`
- Protection wrappers: `apps/frontend/src/components/ProtectedRoute.tsx`
  - `ProtectedRoute`: checks `isAuthenticated`; shows `LoadingSpinner` while loading; redirects to `/login`
  - `PublicRoute`: blocks access if authenticated; redirects to `/dashboard`

## API Client
- Base URL: `apps/frontend/src/services/api.ts:6` (`VITE_API_URL` or `http://localhost:5000/api`)
- Axios interceptors:
  - Request: timestamp cache-busting; Authorization from persisted auth store (`apps/frontend/src/services/api.ts:17-45`)
  - Response: token refresh on `401`; global toast errors (`apps/frontend/src/services/api.ts:49-90`)
- Services (`apps/frontend/src/services/api.ts`):
  - `AuthService`: `/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/me`, `/auth/forgot-password`, `/auth/reset-password`
  - `UserService`: `/users/profile`, `/users/stats`, `/users/leaderboard`, avatar upload
  - `AlgorithmService`: `/algorithms`, `/algorithms/:id`, `/algorithms/categories`, `/algorithms/:algorithmId/complete`, `/algorithms/:algorithmId/submit`
  - `ChallengeService`: `/challenges`, `/challenges/:id`, `/challenges/:challengeId/submit`, `/challenges/:challengeId/submissions`
  - Extended progress: `apps/frontend/src/services/progressService.ts` for insights and time-tracking

## State Management
- Auth store: `apps/frontend/src/stores/authStore.ts`
  - Persists `user`, `token`, `isAuthenticated` under `localStorage` key `auth-storage`
  - Sets/removes `Authorization` header on login/register/logout (`apps/frontend/src/stores/authStore.ts:74-76`, `135-146`)
  - Refreshes token and retries `401` (`apps/frontend/src/stores/authStore.ts:148-171`)
  - Initial `checkAuth` on boot (`apps/frontend/src/stores/authStore.ts:251-254`)

## Key UI Modules
- Layout: `apps/frontend/src/components/Layout.tsx`
- Loading: `apps/frontend/src/components/ui/LoadingSpinner.tsx`
- Code Playground: `apps/frontend/src/components/playground/CodePlayground.tsx`
- 3D Visualization: `apps/frontend/src/components/visualization/ThreeVisualization.tsx`

## Styling & Config
- Tailwind config: `apps/frontend/tailwind.config.js`
- Global styles: `apps/frontend/src/index.css`, `apps/frontend/src/App.css`
- Vite config: `apps/frontend/vite.config.ts`