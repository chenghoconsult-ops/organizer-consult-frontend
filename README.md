# organizer-consult-frontend

整理師業務後台系統 — 顧問後台前端 (React + Vite + TypeScript).

Phase 0 scope: login page + a protected, empty case-list page with logout. Talks to
`organizer-consult-backend` over REST. Responsive for desktop and iPad.

## Stack
- React 19 + Vite + TypeScript
- Tailwind CSS v4 (`@tailwindcss/vite`)
- TanStack Query (data fetching), React Router (routing)
- JWT stored in `localStorage`; bearer token attached by `src/lib/api.ts`

## Local development

Requires Node 22+ and the backend running (default `http://127.0.0.1:3000`).

```bash
npm ci
cp .env.example .env     # set VITE_API_BASE_URL if the backend isn't on :3000
npm run dev              # http://localhost:5173
```

Log in with the backend's seeded manager account (`SEED_ADMIN_*`).

## Structure
- `src/lib/api.ts` — fetch wrapper + token storage + typed endpoints
- `src/lib/auth.tsx` — `AuthProvider` / `useAuth` (login, logout, session restore)
- `src/components/ProtectedRoute.tsx` — redirects to `/login` when unauthenticated
- `src/pages/LoginPage.tsx`, `src/pages/CasesPage.tsx`

## Environment variables
- `VITE_API_BASE_URL` — backend base URL (no trailing slash). Set per-environment in
  Zeabur. See `.env.example`.

## Deploy (Zeabur)
Build with `npm run build` (outputs `dist/`); serve as a static service with SPA
fallback so client-side routes resolve. Set `VITE_API_BASE_URL` to the backend service
URL.

## Scripts
- `npm run dev` / `npm run build` / `npm run preview`
- `npm run lint`
