# AGENTS.md — organizer-consult-frontend

整理師業務後台系統 **frontend** — React 19 + Vite + TypeScript + Tailwind v4 +
TanStack Query + React Router. Consultant web UI **and** the public customer booking page.

- **Sister repo (backend)**: `../organizer-consult-backend` — NestJS API + the phased
  roadmap (`project.md`) and phase docs. Read its `AGENTS.md` for the data model, permission
  model, and API contract. **The roadmap/decisions live in the backend repo, not here.**
- Deploys to **Zeabur** as a static service. `VITE_API_BASE_URL` → backend URL.

## Structure (`src/`)
- `lib/api.ts` — **the single API client.** `apiFetch` auto-attaches the JWT from
  `localStorage` and normalizes errors into `ApiError`. All types (`Case*`, `ConsultationInput`,
  …) + every endpoint fn live here. **Change the API contract here first.**
- `lib/auth.tsx` — `AuthProvider` / `useAuth` (login, current user, logout). Renders children
  unconditionally (public pages work without a user).
- `lib/labels.ts` — enum→中文 maps + `STATUS_ORDER`/`nextStatus`. Reuse these; don't hardcode.
- `components/`
  - `PageShell.tsx` — the **logged-in** chrome: header toolbar "整理師業務後台" + nav + logout.
    Uses `useAuth`. **Do NOT use on public pages.**
  - `ConsultationForm.tsx` — the shared ~20-field intake form (state + validation + field
    widgets). Consumed by both the consultant page and the public page via `onSubmit` props.
  - `ProtectedRoute.tsx` — redirects to `/login` when unauthenticated.
  - `StatusBadge.tsx`.
- `pages/` — `LoginPage`, `CasesPage`, `CaseDetailPage`, `ConsultationFormPage` (consultant
  proxy, wrapped in `PageShell`), `ConsultantsPage` (manager-only), `PublicConsultationPage`
  (public `/booking`, **no** `PageShell`, posts to `/intake/web`).
- `App.tsx` — routes. Public routes (`/login`, `/booking`) are **outside** `ProtectedRoute`;
  catch-all `*` → `/cases`, so add new public routes before it.

## Commands
```bash
npm run dev      # vite dev server (config hardcodes port 5173)
npm run build    # tsc -b && vite build  ← run this to typecheck before finishing
npm run lint     # oxlint
```
There's no test setup; **`npm run build` (tsc) is the verification gate.**

## Preview port
`vite.config.ts` reads `port: Number(process.env.PORT) || 5173` (`strictPort: false`), so the
preview/launch tooling can place Vite on the port it expects via the `PORT` env — no more
proxy/port mismatch.
- **Fallback if you still see `chrome-error://…`:** Vite may have drifted to a free port. Read
  `preview_logs` for `Local: http://localhost:<PORT>/` and navigate the browser to **that** port.
- A logged-in page needs a token in `localStorage`; the public `/booking` page renders with no
  auth — easiest thing to eyeball.

## Conventions
- TS strict; functional components + hooks. Data fetching via TanStack Query
  (`useQuery`/`useMutation`, invalidate `['cases']`/`['case', id]` on success).
- Tailwind utility classes inline; match the existing slate-based palette.
- **Reuse, don't fork**: the intake form is shared (`ConsultationForm`). If you need another
  variant, parameterize that component rather than copy-pasting the ~400 lines.
- Responsive matters (desktop + iPad). Quick check: `preview_resize` tablet, assert no
  horizontal overflow (`scrollWidth <= innerWidth`).

## Token-efficient working here
- Edits usually start in `lib/api.ts` (contract) → the relevant `pages/` file → maybe a shared
  `components/` piece. You rarely need to read more than those.
- Don't re-read the backend to learn the API shape — it's mirrored in `lib/api.ts` types.
- Verify with `npm run build` (one shot) instead of starting the preview, unless the change is
  visual. When it is visual, mind the preview-port gotcha above to avoid blind retries.
