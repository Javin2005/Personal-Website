# My Portfolio System

A full-stack application featuring a FastAPI backend and a React (TypeScript) frontend.
try
## Project Structure

```text
.
├── backend/                # Python FastAPI source code
│   ├── app/
│   │   ├── api/            # API Route handlers (endpoints)
│   │   ├── core/           # Configuration (env vars, constants)
│   │   ├── models/         # Pydantic schemas (Data validation)
│   │   ├── services/       # Business logic (DB queries, external APIs)
│   │   └── main.py         # Entry point: initializes FastAPI app
│   ├── tests/              # Pytest suite
│   ├── pyproject.toml      # Poetry dependency management
│   └── .env                # Private environment variables
├── frontend/               # Vite + React + TypeScript
│   ├── src/
│   │   ├── assets/         # Static images/fonts
│   │   ├── components/     # Reusable UI components (Buttons, Cards)
│   │   ├── hooks/          # Custom React hooks (Data fetching)
│   │   ├── types/          # TypeScript interfaces/types
│   │   ├── App.tsx         # Main component
│   │   └── main.tsx        # React DOM entry point
│   ├── index.html          # HTML template
│   ├── package.json        # JS dependencies
│   └── tsconfig.json       # TypeScript configuration
└── docker-compose.yml      # Orchestration for local development
