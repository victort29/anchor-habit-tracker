# ⚓ Anchor — Habit Tracker

**Anchor** is a simple habit tracker web app. Create an account, add the habits you want to build, and tap each day you complete one. Anchor keeps track of your streaks and your progress toward a weekly goal so small habits stay steady.

Built for **Engineering Design 2 — Build Software with AI**. Nearly all of the code was written with AI tools (Claude Code) by describing what I wanted, testing the result, and asking for improvements.

- 🌐 **Live app:** https://habit-anchor.netlify.app/
- 🎥 **Demo video:** _https://youtu.be/YOUR-VIDEO_ ← replace after uploading (unlisted)

---

## What the app does

| Feature | Details |
| --- | --- |
| **Register / Log in / Log out** | Email + password accounts with Supabase Auth. You must be logged in to see or change any data. |
| **Create** a habit | Name, optional "why it matters" note, a weekly goal (1–7 days), and a color. |
| **Read** your habits | Dashboard shows every habit with the last 7 days, today's progress, current streak and best streak. |
| **Update** a habit | Edit any field with the ✎ button. Tap a day circle to check in (or tap again to undo). |
| **Streak calendar** | 📅 opens a GitHub-style yearly heatmap. "All habits" shades each day by how many habits you completed; pick one habit to see just its streak. Shows current streak, longest streak, active days and total check-ins. |
| **Delete** a habit | 🗑 button removes the habit and all its check-in history (with a confirmation). |
| **Private data** | Row-Level Security in the database means each user can only ever see and edit their own habits. |

## Technologies used

- **React 19** + **Vite** — frontend UI and build tool
- **Supabase** — hosted PostgreSQL database and user authentication (free tier)
- **@supabase/supabase-js** — client library the frontend uses to talk to Supabase
- **Netlify** — hosting for the deployed site (free tier)
- **Claude Code** — AI coding assistant used to generate the code
- **Git & GitHub** — version control

## Project structure

```
anchor/
├── index.html                  # HTML shell (fonts, favicon, title)
├── netlify.toml                # Netlify build settings
├── .env.example                # Template for the Supabase keys
├── supabase/migrations/        # SQL that creates the tables + security policies
└── src/
    ├── main.jsx                # React entry point
    ├── App.jsx                 # Shows login screen or dashboard based on the session
    ├── index.css               # All styling (light + dark mode)
    ├── lib/
    │   ├── supabase.js         # Creates the Supabase client from env variables
    │   └── dates.js            # Local-date helpers and streak calculations
    ├── hooks/
    │   └── useHabits.js        # All database CRUD calls in one place
    └── components/
        ├── AuthForm.jsx        # Register / log-in form
        ├── Dashboard.jsx       # Main page: header, summary, list of habits
        ├── HabitCard.jsx       # One habit: 7-day check-in strip, streaks, progress
        ├── HabitForm.jsx       # Pop-up form for creating and editing habits
        ├── StreakCalendar.jsx  # GitHub-style yearly streak heatmap
        └── AnchorMark.jsx      # Anchor logo icon
```

### Database design

Two tables in Supabase (PostgreSQL):

- **`habits`** — `id`, `user_id`, `name`, `description`, `color`, `target_per_week`, `archived`, `created_at`
- **`habit_checkins`** — `id`, `habit_id`, `user_id`, `day` (one row per habit per completed day; unique on `habit_id + day`)

Every table has **Row-Level Security** policies so that `auth.uid()` must match `user_id` for any select, insert, update or delete. Deleting a habit automatically deletes its check-ins (`ON DELETE CASCADE`).

**Design decision:** instead of storing a "streak" number that could get out of sync, the app stores one row per completed day and *calculates* streaks from those rows. Dates are stored as the user's local calendar day, so "today" matches the user's clock.

## Setup instructions (run it locally)

**Requirements:** [Node.js](https://nodejs.org) 20+ and a free [Supabase](https://supabase.com) account.

1. **Clone the repo and install dependencies**
   ```bash
   git clone https://github.com/victort29/anchor-habit-tracker.git
   cd anchor-habit-tracker
   npm install
   ```
2. **Create the database**
   - Create a new project at [supabase.com](https://supabase.com).
   - Open **SQL Editor**, paste in the contents of `supabase/migrations/20260927160500_create_habits_and_checkins.sql`, and run it.
3. **Add your keys**
   - Copy `.env.example` to `.env`.
   - In Supabase go to **Project Settings → API Keys** and paste your Project URL and publishable key into `.env`.
4. **Start the app**
   ```bash
   npm run dev
   ```
   Open http://localhost:5173, register an account, and start adding habits.

> **Email confirmation:** by default Supabase asks new users to confirm their email. For quick testing you can turn this off under **Authentication → Sign In / Providers → Email → Confirm email**.

## Deploying to Netlify

1. Push the repo to GitHub.
2. In Netlify: **Add new site → Import an existing project → GitHub** and pick this repo. The build settings are read from `netlify.toml` (`npm run build`, publish `dist`).
3. Under **Site configuration → Environment variables** add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (same values as your `.env`), then deploy.
4. In Supabase, go to **Authentication → URL Configuration** and set the **Site URL** to your Netlify URL so confirmation emails link to the live site.

## Available scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the local dev server |
| `npm run build` | Build the production site into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Lint the code with oxlint |
