# Zot Water 💧

**Find, rate, and collect every water fountain at UC Irvine.**

Zot Water is an interactive map of the bottle-filling stations and water fountains on the UCI campus. Log a refill, review a fountain, and collect Petr stickers as you hydrate your way around Aldrich Park and beyond.

Built at **ZotHacks 2026** by Team 6: Mentor Mason Drake · Daniel Canon · Joanne Huang · Emily Luo · Jason Nguyen

## Features

- **Live campus map** – every fountain is a pin, colored from light to dark blue by its average star rating. Hover a pin for its name and rating, click it for details.
- **See where's popular** – the highest-rated fountains, with their stars, a short blurb, and a one-tap refill button.
- **Reviews and ratings** – leave 1–5 stars and a written review (one per fountain). Edit or delete yours anywhere it shows up: the fountain pop-up or your profile.
- **Refill tracking** – tap "I used this fountain" to log a refill (3-minute cooldown per fountain). Posting a review counts as a refill too.
- **Collectibles** – reviewing a fountain unlocks its Petr sticker. Stickers come in four rarities: common, rare (shiny red), epic (sparkly gold) and legendary (purple).
- **Milestones** – First Sip (1 refill), Hydrated (5), Quenched (10) and Water Poisoned (25).
- **Profile** – your stats, milestones, stickers (rarest first), the fountains you've reviewed, and the fountains you use most.
- **Accounts** – sign up and log in with a username and password.

## Tech stack

| Layer    | Tools                                                                |
| -------- | -------------------------------------------------------------------- |
| Frontend | Next.js 16 (App Router), React 19, Leaflet / react-leaflet           |
| Backend  | FastAPI, SQLAlchemy, Pydantic, session cookies (hashed passwords)    |
| Database | Supabase (PostgreSQL)                                                |
| Hosting  | Vercel (frontend and backend deployed together, see `vercel.json`)   |

## Getting started

### Prerequisites

- Node.js 20+
- Python 3.10+
- A Supabase (Postgres) project to connect to

### 1. Install

```bash
# backend
python -m venv .venv
.venv/Scripts/activate          # Windows PowerShell: .venv\Scripts\Activate.ps1 · macOS/Linux: source .venv/bin/activate
pip install -r backend/requirements.txt

# frontend
cd frontend
npm install
```

### 2. Environment variables

**`backend/.env`** (required; this file is git-ignored, never commit it):

```
ZOTWATER_POSTGRES_URL=postgres://...      # Supabase connection string
SESSION_SECRET=any-long-random-string     # signs the login cookie
```

**`frontend/.env.local`** (optional; copy from `frontend/.env.example`):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
API_URL=http://127.0.0.1:8000             # where the FastAPI backend runs (this is the default)
```

Without the Supabase keys, the homepage falls back to the bundled UCI fountain list (`frontend/lib/uci-fountains.json`) so it still renders.

### 3. Set up the database

The schema and starter data are in `supabase/`:

1. Run the files in `supabase/migrations/` in order (they create the tables for fountains, ratings, reviews, visits, collectibles and users).
2. Run `supabase/seed.sql` to load the fountains and stickers.

You can paste them into the Supabase SQL editor or use the Supabase CLI.

### 4. Run it

Start both servers (two terminals):

```bash
# terminal 1 – backend on http://127.0.0.1:8000
cd backend
uvicorn main:app --reload

# terminal 2 – frontend on http://localhost:3000
cd frontend
npm run dev
```

On Windows with GNU make installed (`winget install ezwinports.make`), `make install` and then `make dev` do the same thing.

The browser only ever talks to Next.js. It forwards anything under `/backend/*` to the FastAPI server, so login cookies work without any CORS setup.

## API

Interactive docs (Swagger UI), where you can try GET/POST requests:

- Deployed: `/backend/docs`
- Local, straight to the backend: `http://127.0.0.1:8000/api/docs`

Log in first (`POST /api/login`) to use the routes that need an account.

| Area        | Routes                                                                                                         |
| ----------- | -------------------------------------------------------------------------------------------------------------- |
| Auth        | `POST /api/register` · `POST /api/login` · `POST /api/logout` · `GET /api/me`                                   |
| Fountains   | `GET /api/fountains` · `GET /api/fountains/{id}`                                                               |
| Ratings     | `GET /api/fountains/{id}/rating` · `PUT` / `DELETE` the same path                                              |
| Reviews     | `GET` / `POST /api/fountains/{id}/reviews` · `PUT` / `DELETE /api/reviews/{review_id}` · `GET /api/me/reviews` |
| Refills     | `POST /api/fountains/{id}/visit` · `GET /api/me/visits`                                                        |
| Collectibles| `GET /api/me/collectibles`                                                                                     |

## Project structure

```
backend/
  main.py            FastAPI app, sessions, API docs
  db.py, models.py   database connection and table definitions
  routers/           auth, fountains, ratings, reviews, visits, collection
frontend/
  app/(pages)/       homepage, map, profile, login, signup
  app/api/           Next.js routes (fountain list, popular, map snapshots)
  components/        map, fountain pop-up, reviews, stars, header
  lib/               API helpers and shared utilities
supabase/            migrations and seed data
vercel.json          deploys the Next.js app and the FastAPI service together
```

## Deploying

The repo deploys to Vercel as two services (see `vercel.json`): the Next.js frontend, and the FastAPI backend, which receives everything under `/backend/*`. Set `ZOTWATER_POSTGRES_URL` and `SESSION_SECRET` in the Vercel project's environment variables.

## Credits

Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.
