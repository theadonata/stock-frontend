# stock-frontend

> The web app people actually use to run a small business's sales & stock tracking.

## About the project

A small bags & accessories business used to track everything — sales,
stock, expenses, and cost of goods sold — in a single Excel file. **Stock/HPP**
("HPP" is Indonesian for *Harga Pokok Penjualan*, i.e. Cost of Goods Sold)
replaces that spreadsheet with a proper web app.

**This repo is that web app.** It lets the owner and staff log sales,
record stock moving in and out, track expenses, and see a computed profit
& loss report for any period — usable from a phone on the warehouse floor
just as well as a laptop back at the office. It talks to a separate API
service ([stock-backend](https://github.com/theadonata/stock-backend))
over the network and shares no code with it.

### Part of a bigger project

Stock/HPP is split into six repos, each one buildable and deployable on
its own:

| Repo | What it does |
|---|---|
| **stock-frontend** (this repo) | The web app people use day to day |
| [stock-backend](https://github.com/theadonata/stock-backend) | The API and database — stores data, does the math |
| [stock-infrastructure](https://github.com/theadonata/stock-infrastructure) | Deploys and runs everything on a server |
| [stock-qa](https://github.com/theadonata/stock-qa) | Automated tests that check everything works |
| [stock-business-analyst](https://github.com/theadonata/stock-business-analyst) | The original business requirements this is built from |
| [stock-platform](https://github.com/theadonata/stock-platform) | An internal dashboard for the team building this project |

## What you can do

- Log a sale, or edit/delete an existing one
- Record stock coming in or going out (this one's history-only — no
  editing past entries, so the record always matches reality)
- Track an operational expense
- See current stock per product at a glance
- Pull up a profit & loss report for any month

## Built with

- [React](https://react.dev/) + TypeScript, built with [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/) for styling, with a small shared
  component library (buttons, forms, modals, tables) built on a custom
  "Ledger & Hangtag" look — warm paper tones and a tabular-figures font for
  every money value, so columns of numbers actually line up
- [TanStack Query](https://tanstack.com/query) for talking to the API
- React Router for navigation
- [Vitest](https://vitest.dev/) + Testing Library for tests

## Getting started

### Prerequisites

- [Docker](https://www.docker.com/) (recommended), or Node.js 18+ for
  running without Docker
- A running [stock-backend](https://github.com/theadonata/stock-backend)
  instance — start that repo first (see its own README)

### Point this app at your backend

`.env.local` already exists in this repo (gitignored — edit it directly,
there's no separate example file). Set it to wherever your backend is
running:

```
VITE_API_BASE_URL=http://localhost:8000
```

### Run it, with Docker

```bash
docker compose up --build
```

The app is served at **http://localhost:8080**. Since the backend URL is
baked in at build time, pass it as a build arg if it's not the default:

```bash
VITE_API_BASE_URL=http://localhost:8000 docker compose up --build
```

### Or run it without Docker, for faster iteration

```bash
npm install
npm run dev
```

Starts a dev server with hot reload at **http://localhost:5173**.

## Running tests

```bash
npm install
npm run test
```

## Building for production

```bash
npm run build
```

Type-checks the code and produces a production build in `dist/`.

## Project structure

```
src/
  api/          talks to the backend over HTTP
  auth/         login state + a route guard for logged-in-only pages
  components/   shared UI pieces (buttons, forms, modals, tables, layout)
  hooks/        one hook per kind of data (sales, products, profit & loss, ...)
  lib/          formatting and calculation helpers
  pages/        one file per screen (Login, Dashboard, Products, Sales, ...)
  types/        TypeScript types matching the backend's data
```
