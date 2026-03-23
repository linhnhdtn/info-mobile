# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Cá nhân" (Personal) is a Vietnamese-language personal information management mobile app built with React + TypeScript + Vite, packaged as an Android app via Capacitor. App ID: `com.canhan.info`.

## Common Commands

- `npm run dev` — Start Vite dev server with HMR
- `npm run build` — TypeScript check + Vite production build (`tsc -b && vite build`)
- `npm run lint` — Run ESLint
- `npm run preview` — Preview production build
- `npx cap sync android` — Sync web build to Android project
- `npx cap open android` — Open in Android Studio

## Architecture

### Dual Storage Layer

The app runs on both web (browser) and native (Android). Data persistence is split:

- **Native (Android):** Uses `@capacitor-community/sqlite` via `src/db/database.ts`. SQLite database named `info_app`. Schema defined in `src/db/schema.sql.ts`.
- **Web (browser):** Uses `localStorage` via `src/db/web-storage.ts` as a simple fallback for development/testing.

Every repository in `src/db/repositories/` checks `IS_NATIVE` to branch between SQLite queries and `webDb` calls. When adding a new repository or modifying data access, both paths must be implemented.

### Repository Pattern

Each domain entity has a repository file in `src/db/repositories/` (e.g., `expense-repo.ts`, `event-repo.ts`). Repositories export an object with async CRUD methods and handle the native/web branching internally. They convert between snake_case DB columns and camelCase TypeScript interfaces.

### Routing & Pages

React Router v7 with `BrowserRouter`. Routes defined in `src/App.tsx`, all nested under `AppLayout`. Pages live in `src/pages/` with feature-specific sub-components in `src/components/<feature>/`.

### UI Components

Uses shadcn/ui components in `src/components/ui/` with Radix UI primitives, styled with Tailwind CSS v4. Path alias `@` maps to `src/`.

### Key Features

- **Dashboard** — Overview/home page
- **Schedule** — Calendar events with FullCalendar, supports recurring events via `rrule`
- **Notes** — Color-coded, pinnable notes with tags
- **Expenses** — Daily expense tracking with monthly budgets and category breakdowns
- **Gold** — Gold holdings tracker with live price data (`src/lib/gold.ts`)
- **Weather** — Weather info using Vietnam cities data (`src/data/vietnam-cities.ts`)
- **Profile** — Personal and work info management
- **Notifications** — Local notifications via `@capacitor/local-notifications` (`src/lib/notifications.ts`)

### Data Types

All shared TypeScript interfaces and constants (colors, expense categories) are in `src/types/index.ts`. Default user ID is `'default-user'` (single-user app).

### Lunar Calendar

Vietnamese lunar calendar support via the `amlich` package, used in `src/lib/lunar.ts`.
