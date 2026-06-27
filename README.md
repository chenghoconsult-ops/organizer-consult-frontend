# organizer-consult-frontend

整理師業務後台系統 — 顧問後台前端 (React + Vite + TypeScript).

**Phase 1 (current)**: 案件列表（依 指派給我 → 未指派 → 指派給他人 分組、搜尋、認領）、
案件詳情（客戶/諮詢內容 + 狀態時間軸 + 推進/認領/指派）、顧問代填預約諮詢表單、
經理的顧問帳號管理頁。Talks to `organizer-consult-backend` over REST. 響應式（桌機 + iPad）。

Phase 0 基礎：登入頁 + 受保護路由 + 登出。

## Related repositories
- **Backend**: [`organizer-consult-backend`](../organizer-consult-backend) — NestJS API
  (auth, cases) this UI talks to. Run it first; the roadmap (`project.md`) lives there.
- Both deploy to **Zeabur** (frontend static service + backend + managed PostgreSQL).

## Stack
- React 19 + Vite + TypeScript
- Tailwind CSS v4 (`@tailwindcss/vite`)
- TanStack Query (data fetching), React Router (routing)
- JWT stored in `localStorage`; bearer token attached by `src/lib/api.ts`

## Local development

Requires Node 22+ and the backend running (default `http://127.0.0.1:3000` — start it
first; see its README).

First-time setup:

```bash
npm ci
cp .env.example .env     # set VITE_API_BASE_URL if the backend isn't on :3000
```

### Run the dev server (day to day)

```bash
npm run dev              # http://localhost:5173
```

Open http://localhost:5173 and log in with the backend's seeded manager account
(`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`). Add consultants from 顧問管理 (manager only).
Stop with `Ctrl+C`. Hot-reload is on, so edits show up without a restart. The page won't
load data unless the backend is running — if requests fail, check it's up on the URL in
`VITE_API_BASE_URL`.

## Routes
- `/booking` — **public** customer self-service consultation form (no login; posts to
  `POST /intake/web`). Reuses the same form as the consultant intake, without the backend
  toolbar.
- `/login` — login
- `/cases` — case list (grouped mine → unassigned → others, search, claim)
- `/cases/:id` — case detail: customer + consultation content, status timeline,
  advance/claim/assign actions (gated by role + assignee)
- `/consultation/new` — consultant proxy intake form
- `/consultants` — consultant account management (**manager only**; others redirect to `/cases`)

## Structure
- `src/lib/api.ts` — fetch wrapper + token storage + typed endpoints
- `src/lib/labels.ts` — `CaseStatus` ordering + zh-TW labels for consultation enums
- `src/lib/auth.tsx` — `AuthProvider` / `useAuth` (login, logout, session restore)
- `src/components/ProtectedRoute.tsx` — redirects to `/login` when unauthenticated
- `src/components/PageShell.tsx` — shared header/nav; `StatusBadge.tsx` — status pill
- `src/pages/` — `LoginPage`, `CasesPage`, `CaseDetailPage`, `ConsultationFormPage`,
  `ConsultantsPage`

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
