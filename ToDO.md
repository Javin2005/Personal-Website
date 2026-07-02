
## Phase 1: Architecture & Navigation
- [x] **Install React Router**: `npm install react-router-dom` in the frontend.
- [x] **Define Routes**:
    - `/` -> Main Portfolio (The "Professional" side).
    - `/archive` -> Full list of all projects (The "Code" side).
    - `/life` -> Scrapbook/Gallery (The "Human" side).
    - `/login` -> Admin Entry.
- [x] **Refactor App.tsx**: Move current content into a `pages/Home.tsx` component and setup `<Routes>`.

## Phase 2: Backend Evolution (JSON to SQL)
- [x] **Install SQLModel**: `pip install sqlmodel` (A better way to use SQLAlchemy with FastAPI).
- [x] **Define Models**: Create DB tables for `Project`, `About`, `CreativeItem`, and `LifePost`.
- [x] **Migration Script**: Write a small Python script to read `data.json` and seed the SQLite database.
- [ ] **Update Endpoints**: Switch the FastAPI routes to query the database instead of reading the JSON file.

## Phase 3: Security & Admin Dashboard
- [ ] **Authentication**: Implement JWT (JSON Web Tokens) in FastAPI.
- [ ] **Admin Page**: Create a simple dashboard at `/admin` (protected by login).
- [ ] **CRUD Operations**: Build forms to:
    - Add/Edit/Delete projects.
    - Upload "Life" photos (using FastAPI `UploadFile`).
- [ ] **Storage**: Configure a folder or a service (like Cloudinary) to store uploaded images.

## Phase 4: The "Proof of Life" Status Bar
- [ ] **GitHub Integration**:
    - Backend: Fetch latest events from `api.github.com/users/Javin2005/events`.
    - Frontend: Add a "Last pushed to..." ticker in the Navbar.
- [ ] **Spotify Integration**:
    - Backend: Register Spotify App, handle OAuth `refresh_token`.
    - Frontend: "Now Playing" or "Last Listened" status.
- [ ] **Email System**: Integrate [Resend](https://resend.com/) in the backend for the Contact Form `POST` request.

## Phase 5: Visual Polish (The Anti-AI Look)
- [ ] **Bespoke Layouts**: Design the `/life` page as a "Bento Grid" (irregular sizes).
- [ ] **Texture Overlay**: Add a global SVG "noise/grain" filter to the background.
- [ ] **Framer Motion**: Add "AnimatePresence" for smooth transitions between pages.
- [ ] **Custom Cursor**: Build a custom React cursor that changes color based on the section.

---