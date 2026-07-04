# Full-Stack Engineering Portfolio

This repository contains a high-performance, asynchronous web application designed to showcase software engineering projects, real-time system activity, and administrative content management.

## System Architecture

The application is built using a decoupled architecture, separating the client-side interface from the server-side logic and data persistence layers.

### Backend (API Layer)
*   **Framework:** FastAPI (Python 3.12+)
*   **ORM:** SQLModel (SQLAlchemy-based)
*   **Database:** PostgreSQL (Cloud-hosted via Supabase)
*   **Production Server:** Gunicorn with Uvicorn workers
*   **Security:** JWT (JSON Web Tokens) for stateless authentication and Bcrypt for one-way password hashing
*   **Environment Management:** Poetry

### Frontend (Client Layer)
*   **Library:** React.js 18+ with TypeScript
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS (v4) with custom SVG grain filters and CSS animations
*   **Routing:** React Router DOM with Hash Link for cross-page anchor navigation
*   **Icons:** Lucide React

## Core Features

### 1. Dynamic Status Monitoring
The application integrates with external REST APIs to provide "Proof of Life" metrics:
*   **GitHub Integration:** Asynchronous polling of the GitHub Events API to retrieve and display the most recent commit message and repository activity.
*   **Spotify Integration:** Implementation of the OAuth2 Authorization Code Grant flow with refresh tokens. The system retrieves real-time playback state or recently played tracks via the Spotify Web API.

### 2. Administrative Content Management System (CMS)
A protected dashboard accessible via `/login` allows for complete site management:
*   **Identity Management:** PUT endpoints to modify professional biographies and technical skill arrays.
*   **Project CRUD:** Full Create, Read, Update, and Delete capabilities for the project portfolio.
*   **Binary Asset Handling:** Integration with Cloudinary API for managed image uploads. Files are transmitted via multipart/form-data, processed by the backend, and stored in a cloud-based CDN.

### 3. Contact and Communication
*   **Server-Side Mailer:** Form submissions trigger an asynchronous request to the Resend API, which handles SMTP delivery to a specified administrative email address.
*   **Input Validation:** Pydantic models enforce strict data validation for all incoming POST requests, including EmailStr validation.

## Database Schema

The relational schema is defined through SQLModel classes, supporting automated migrations and type-safe queries:
*   **User:** Stores administrative credentials (Username, Hashed Password).
*   **About:** Contains professional metadata and JSON-serialized skill arrays.
*   **Project:** Details technical projects, including tech stack, difficulty ratings, and repository links.
*   **CreativeItem:** Managed entries for high-impact graphics and rendering showcases.
*   **LifePost:** Gallery entries with timestamped metadata and CDN-hosted image URLs.

## Deployment and Infrastructure

*   **Frontend Hosting:** Vercel (Edge-optimized distribution).
*   **Backend Hosting:** Render (PaaS) utilizing horizontal scaling capabilities.
*   **Data Persistence:** Managed PostgreSQL instance with SSL-encrypted connections.
*   **Asset Delivery:** Cloudinary managed CDN for high-availability image and video serving.
*   **CORS Policy:** Strict origin validation to permit communication only between verified frontend and backend domains.

## Local Development Requirements

1. Python 3.12+ and Poetry.
2. Node.js and npm.
3. PostgreSQL environment or SQLite fallback.
4. Environment variables for API keys (Spotify, GitHub, Cloudinary, Resend).
