# Frontend

The React and TypeScript part of the site. See the README in the repository root for how the whole project fits together, and `docs/FRONTEND_GUIDE.md` for how this code works.

```bash
npm install
npm run dev      # development server on http://localhost:5173
npm run build    # type-check and build into dist/
npm run lint     # oxlint
```

It needs `VITE_API_URL` in `frontend/.env`, the address of the backend (for example `http://localhost:8000`).

## Where things are

```
src/
  main.tsx              starts React
  App.tsx               which page to show for which URL
  auth.ts               talking to the backend, login token helpers
  types.ts              the shape of the data from the backend
  index.css             theme variables and a few shared styles
  site/                 loads the site data and applies the theme
  components/           pieces of the public pages
  components/sections/  one component per homepage section
  pages/                Home, Projects, Tools, Login, Admin
  admin/                the editors used on the admin page
  tools/                the tools page; registry.ts lists the tools
public/assets/          the background video, its poster image, profile photo
```
