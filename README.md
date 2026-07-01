My Website/
├── backend/            # FastAPI (Python)
│   ├── app/
│   │   ├── api/        # Routes/Endpoints
│   │   ├── core/       # Config & Security
│   │   ├── models/     # Pydantic schemas (OOD)
│   │   └── main.py     # Entry point
│   ├── tests/          # Pytest (Crucial for recruiters)
│   └── pyproject.toml  # Managed by Poetry
├── frontend/           # React (TypeScript)
│   ├── src/
│   │   ├── components/ # Reusable UI
│   │   ├── hooks/      # Custom React hooks
│   │   └── services/   # API calls (Axios/Fetch)
│   └── vite.config.ts  # Modern bundler
└── docker-compose.yml  # To run everything together
