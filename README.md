# Root — a personal growth workspace

Root combines a journal, a habit tracker, and a small project/task board into
one place, with the pieces linked together: journal entries can reference the
habits and tasks you completed that day.

This is a **frontend-only** React app. There is no backend — everything is
stored in the browser's `localStorage`. That was a deliberate choice for this
build (see "Known limitations" below for what that trades away).

## Tech stack

- React 19 + Vite
- React Router (client-side routing)
- Recharts (Insights charts)
- jsPDF (journal entry → PDF export)
- Plain CSS with design tokens (no UI framework) — the palette and type system
  extend the original auth-form design (`Fraunces` + `Work Sans`, forest green
  + gold on a warm paper background)

## Running locally

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build → dist/
npm run preview   # preview the production build locally
```

## Deploying to Netlify

1. Push this folder to a Git repo (GitHub/GitLab/Bitbucket), or drag-and-drop
   the `dist/` folder after `npm run build` into Netlify's "Deploys" page.
2. If connecting a repo: build command `npm run build`, publish directory
   `dist`. `netlify.toml` already sets this.
3. The SPA redirect (`/* → /index.html`) is already configured in
   `netlify.toml` and `public/_redirects`, so refreshing on a route like
   `/journal` won't 404.

## Feature map

**Auth**
- Sign up / log in / log out
- Forgot password → reset password (see limitation below — there's no real
  email delivery, so this is simulated)
- Change password, from Profile settings

**Dashboard**
- Greeting, today's stats, today's habit checklist, upcoming tasks, latest
  journal entry preview

**Journal**
- List view (search + filter by mood/tag) and month calendar view
- Rich text editor (bold/italic/underline/heading/lists/quote)
- Mood tag, free-form tags
- Link an entry to the habits/tasks you completed that same day
- Export a single entry as Markdown or PDF
- Autosave

**Habits**
- Create/edit/archive/delete, icon + color
- 7-day check-in strip, current streak, best streak
- Dashboard checklist shares the same toggle logic

**Projects / Tasks**
- Projects with color, description, and (label-only) collaborators
- Kanban board per project: To do / In progress / Done
- Drag-and-drop, or move buttons for touch/mobile
- Task due dates

**Insights**
- Mood over the last 30 days (line chart)
- Habit consistency, last 30 days (bar per habit)
- Journal entries per week, last 6 weeks
- Project progress (tasks done / total)

**Profile**
- Name, avatar color, short bio
- Change password
- Dark mode toggle
- Export all data as a JSON file
- Delete account (wipes everything for that account from this browser)

**Cross-cutting**
- Global search across journal, habits, projects and tasks
- In-app notifications (streak milestones, new habit added, etc.)
- Dark mode
- Fully responsive: sidebar nav on desktop, bottom tab bar on mobile

## Known limitations (by design, since there's no backend)

- **Password reset doesn't send real email.** There's no server to send
  mail from. The "forgot password" flow generates a reset link and shows it
  to you directly in the UI instead of emailing it — clearly labeled as a
  demo stand-in. To send real email you'd need a backend or a service like
  a serverless function + an email API (Resend, SendGrid, etc.), or a
  client-side-only service like EmailJS (still requires a third-party API
  key).
- **Password storage isn't production-grade.** Passwords are hashed with
  SHA-256 in the browser before being stored, so they're not saved in plain
  text — but there's no salt, no server-side verification, and anyone with
  access to the browser's localStorage can see the user list. Don't reuse a
  real/important password when trying this out.
- **"Collaborators" on a project are just labels**, not real invited users —
  there's no multi-user sync between browsers/devices.
- **Notifications are in-app only** (the bell icon), not email or push —
  again, no server to deliver them from.
- **Data lives in one browser.** Clearing site data/localStorage, or opening
  the app in a different browser or device, means a fresh (empty) account.
  Use Profile → "Export data" to back up a copy as JSON.

If a real multi-user version is wanted later, the natural next step is a
small backend (e.g. Supabase, Firebase, or a custom API) — the code is
already organized so the `lib/db.js` layer (the only place that talks to
localStorage) could be swapped for real API calls without touching the page
components much.

## Project structure

```
src/
  components/     shared UI: nav, modals, icons, search, form widgets
  context/        Auth, Theme (dark mode), Toast, Data (all app CRUD)
  lib/            localStorage layer, id/date helpers, streak math, export
  pages/          route-level screens (auth/, journal/, habits/, projects/, ...)
  styles/         tokens.css (design system) + one stylesheet per area
```
