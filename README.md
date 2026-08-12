# stock-frontend

Client-side UI for the Stock/HPP business-finance app — a small internal
tool that replaces an Excel-based tracker for a bags/accessories business.
It lets the owner and staff log sales, record stock in/out movements, track
operational expenses, and view a computed profit &amp; loss (Laba Rugi)
report for any period, from a phone on the warehouse floor or a laptop for
reporting.

Part of the `stock-*` multi-repo project. See `CLAUDE.md` for scope and
sibling-repo relationships, and
`stock-business-analyst/docs/superpowers/specs/2026-08-12-stack-architecture-design.md`
for the full architecture/UI-UX design this app implements.

## Tech stack

- **React 18 + TypeScript**, built with **Vite**
- **Tailwind CSS** for styling — a shared component library (Button, Card,
  FormField, NumberField, Modal, ConfirmDialog, PageHeader, ResponsiveTable)
  built on a "Ledger & Hangtag" design system: brass/moss/rust/canvas/ink
  color tokens and a three-face type system (Barlow Semi Condensed for
  headings/labels, Inter for body/forms, IBM Plex Mono with tabular figures
  for every money/quantity value) — see `tailwind.config.js` for the token
  definitions.
- **TanStack Query** for API data fetching/caching (no optimistic UI, per
  the spec — simple loading/error states)
- **React Router** for navigation, with a login-gated route wrapper
- **Vitest + Testing Library** for component tests
- Talks to `stock-backend` (a separate FastAPI service, built independently)
  over `/api/v1/...` REST endpoints, authenticated with a JWT bearer token

This repo has **no shared code or path dependency** on `stock-backend` —
it only depends on the documented REST contract, configured via an env var.

### UI patterns worth knowing

- **Add/Edit/Delete**: Products, Sales, and Expenses show a table/list as
  the primary view, with a `+ Add/Log ___` button that opens the form in a
  popup (`Modal`) rather than an always-visible inline form. Each row has
  Edit (reopens the popup pre-filled, submits as an update) and Delete
  (always routes through `ConfirmDialog` first — never fires immediately).
  The Stock page's table is the one exception: it shows aggregate current
  stock per product, and the inventory ledger itself has no edit/delete by
  design (see `stock-backend`'s README).
- **Number inputs** (`NumberField`) live-format with thousand separators
  while typing (e.g. `1.500.000`), matching `formatCurrency`'s id-ID
  grouping. Whole numbers only, deliberately — see the comment at the top
  of `src/components/NumberField.tsx` for why.
- **Toast notifications** appear at the top of the viewport (not the
  bottom), on both mobile and desktop.

## Running locally

### 1. Start stock-backend separately

This repo's `docker-compose.yml` only runs the frontend. Start
`stock-backend` using its own `docker-compose.yml` in the `stock-backend`
repo, per that repo's own README. Note the URL it listens on (commonly
`http://localhost:8000`).

### 2. Point the frontend at it

`.env.local` already exists in this repo (gitignored, never committed —
there is no separate `.env.example` to copy from). Edit it and set
`VITE_API_BASE_URL` to wherever stock-backend is listening, e.g.:

```
VITE_API_BASE_URL=http://localhost:8000
```

`.env.local` is gitignored and already present in this repo — leave its
existing contents alone unless you're intentionally changing the backend
target.

### 3. Run via Docker (recommended)

```bash
docker compose up --build
```

This builds the Vite app and serves the static output via nginx. Because
Vite env vars are baked in at **build time**, pass the backend URL as a
build arg if it differs from the default:

```bash
VITE_API_BASE_URL=http://localhost:8000 docker compose up --build
```

The app is served at **http://localhost:8080**.

### 3b. Or run without Docker, for faster iteration

```bash
npm install
npm run dev
```

This starts the Vite dev server (with hot reload) at
**http://localhost:5173**, reading `VITE_API_BASE_URL` from `.env.local` at
request time via Vite's dev server.

## Running tests

```bash
npm install
npm run test
```

Runs the Vitest suite once (component tests for the data-entry forms, the
shared `ResponsiveTable`/`FormField` components, and client-side derived
values like current-stock and net-profit calculations). Use
`npm run test:watch` for watch mode during development.

## Building

```bash
npm run build
```

Type-checks with `tsc` and produces a production build in `dist/`.

## Project structure

```
src/
  api/          typed fetch client + per-resource API functions
  auth/         JWT auth context + ProtectedRoute route guard
  components/   shared UI: Button, FormField, NumberField, Card, Modal, ConfirmDialog,
                PageHeader, ResponsiveTable, AppLayout, ToastProvider
  hooks/        TanStack Query hooks per resource (useSales, useProducts, usePnL, ...)
  lib/          formatting / derived-value helpers
  pages/        one file per screen (Login, Dashboard, Products, Sales, Stock, Expenses, Reports)
  types/        TypeScript types mirroring the backend's data model
```
