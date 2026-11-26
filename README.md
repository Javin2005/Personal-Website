# Personal website

This is the code for my personal website, [javincarlson.com](https://www.javincarlson.com). It started as a portfolio, but I want it to become a project of its own: a place for my projects, my CV and, over time, small tools I build and use myself.

The black hole in the background is a video from another of my projects, a real-time renderer that traces light around a Schwarzschild black hole ([BlackHole-Render](https://github.com/Javin2005/BlackHole-Render)).

## What it does

- A homepage with my background, experience, education and projects.
- A projects page with everything I've built, searchable by name or language.
- A tools page where calculators and other utilities will go. Some of them will only be visible to me.
- A contact form that sends the message to my email.
- A footer line with my latest GitHub commit and the song I'm listening to on Spotify.
- An admin page where I can edit all of it without touching the code: every piece of text, the sections and their order, projects, colors, fonts and the background video.


## How it's built

The site is split into two programs that talk to each other over HTTP.

The **frontend** (`frontend/`) is React with TypeScript, built with Vite and styled with Tailwind CSS. Vercel hosts the built files. All the code runs in the visitor's browser.

The **backend** (`backend/`) is Python with FastAPI. It runs on Render and is the only part that talks to the database and to outside services. It keeps all the secret keys, so the browser never sees them.

The **database** is Postgres on Supabase. Images and videos uploaded from the admin page go to Cloudinary, and contact form messages are sent through Resend.

All of these are on free plans.

For a clickable map of how the parts connect, open `docs/architecture-map.html` in a browser. `docs/FRONTEND_GUIDE.md` explains how the frontend code works and what changed in the redesign.

### Backend files

| File | What it does |
| --- | --- |
| `app/main.py` | Creates the app and holds the login, contact form, about and media upload endpoints |
| `app/content.py` | Settings, plus the editable lists (projects, experience, education, skills, interests) |
| `app/status.py` | The GitHub and Spotify status line |
| `app/auth.py` | Password hashing, login tokens (JWT) and API keys |
| `app/apikeys.py` | Creating and revoking API keys |
| `app/models.py` | The database tables |
| `app/schemas.py` | Checks the data the admin sends before it reaches the database |
| `app/default_content.py` | The starting content, taken from my CV |
| `app/seed.py` | Fills a database with the starting content |
| `migrations/` | Alembic migrations, which change the database structure without losing data |
| `tests/` | The test suite (`poetry run pytest`) |

### How the editing works

Nothing on the public pages is hard-coded. The colors, fonts, hero text, section order, menu, page title and every small label (buttons, form fields, messages) are one row of settings in the database. Projects, experience, education, skills and interests are separate tables. The frontend loads all of it with one request to `/api/site` and builds the pages from it.

The colors and fonts become CSS variables, so when I change the accent color in the admin page the whole site changes with it. Every save goes through the checks in `schemas.py`, so a broken color or a `javascript:` link can't get into the database.

## Running it locally

You need Python 3.12+, [Poetry](https://python-poetry.org/) and Node.js.

Backend:

```bash
cd backend
poetry install
cp .env.example .env              # then fill in the values
poetry run python -m app.seed     # creates the admin user and the starting content
poetry run uvicorn app.main:app --reload
```

Without `DATABASE_URL` in `.env`, the backend uses a local SQLite file (`backend/database.db`).

Frontend:

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev
```

Then open http://localhost:5173. The admin page is at `/admin`, and you log in at `/login`.

## Running the tests

```bash
cd backend
poetry run pytest
```

The tests use their own temporary database, so they never touch your real data. They check the login lock on every admin endpoint, the input checks, the lists, settings, API keys, the contact form and the migrations.

## Security

- The admin endpoints all require either a login token or an API key. Without one they answer 401; the tests check this for every endpoint.
- Passwords are stored as bcrypt hashes. Login is limited to 5 tries per minute, and a wrong username takes as long to reject as a wrong password, so usernames can't be guessed by timing.
- Login tokens expire after 24 hours. API keys are stored only as hashes, can't create or revoke other keys, and can be revoked from the admin page.
- Everything the admin saves is checked first: colors must be hex values, fonts must come from a fixed list, and links must be http(s), so nothing can inject code into the page.
- The frontend is served with a Content Security Policy (in `frontend/vercel.json`) that only allows scripts from the site itself.

## Environment variables

These go in `backend/.env` locally and in Render's environment settings in production.

| Name | What it's for |
| --- | --- |
| `SECRET_KEY` | Signs login tokens. Required; use a long random string. |
| `DATABASE_URL` | The Postgres connection string from Supabase |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | Only used by `app.seed` to create the admin user |
| `RESEND_API_KEY` | Sending contact form emails |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Image and video uploads |
| `GITHUB_TOKEN` | Optional; raises GitHub's rate limit for the status line |
| `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN` | The "listening to" line |

The frontend only needs `VITE_API_URL`, the address of the backend.

## Deploying

**Frontend:** Vercel builds the `frontend` folder with `npm run build`. `frontend/vercel.json` sends every URL to `index.html`, so links like `/projects` work when opened directly.

**Backend:** on Render, with the `backend` folder as the root. The start command should be:

```bash
gunicorn -w 2 -k uvicorn.workers.UvicornWorker app.main:app
```

Each Gunicorn worker is a full copy of the app in memory. The free plan has 512 MB, and four workers was enough to run out of it, so keep it at two (or one).

## Changing the database

The backend runs `alembic upgrade head` by itself every time it starts, so deploying a new migration is enough to update the live database.

To change the structure:

1. Edit the table in `app/models.py`.
2. Create a migration with `poetry run alembic revision -m "what changed"` and write the change in the new file in `migrations/versions/` (look at `0002_editable_content.py` for an example).
3. Run `poetry run alembic upgrade head` locally to try it.

Settings are stored as JSON, so adding a new setting only needs a change in `schemas.py`, `default_content.py` and the frontend, not a migration.

### Loading the starting content into the live database

The first time after this version is deployed, the live database has the new tables but they're empty. To fill them, point `DATABASE_URL` in your local `backend/.env` at the Supabase database and run:

```bash
poetry run python -m app.seed
```

It only adds what is missing and never deletes anything. Projects that already exist (matched by their GitHub link) are left alone. To also overwrite the about text and project descriptions with the versions in `default_content.py`, add `--refresh`.

## Adding a tool

Tools live in `frontend/src/tools/`. Each tool is a React component in its own folder, listed in `frontend/src/tools/registry.ts`. The registry explains the steps. A tool's code is only downloaded when someone opens it, so a large one doesn't slow down the rest of the site.

Marking a tool `adminOnly` hides it from visitors, but frontend code is always public. Anything secret, or anything that uses a private API key, has to run on the backend behind a login check.
