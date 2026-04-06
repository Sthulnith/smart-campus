# Smart Campus

Smart Campus includes:

- `src/` backend (Spring Boot + Spring Security + OAuth2 Google login)
- `frontend/` frontend (React)

## Prerequisites

- Java 21
- Node.js + npm
- MySQL 8+ (or Docker Desktop with `docker compose`)

## Required Environment Variables

Use `.env.example` as reference.

### OAuth2 / App URLs

- `GOOGLE_CLIENT_ID` (required)
- `GOOGLE_CLIENT_SECRET` (required)
- `FRONTEND_URL` (default `http://localhost:3000`)
- `BACKEND_URL` (default `http://localhost:8080`)
- `OAUTH2_REDIRECT_URL` (default `http://localhost:3000/auth/callback`)

### Database

- `DB_URL` (default `jdbc:mysql://localhost:3306/smart_campus_db`)
- `DB_USERNAME`
- `DB_PASSWORD`
- `HIBERNATE_DIALECT` (optional)
- `UPLOAD_DIR` (optional)

### Frontend env

- `REACT_APP_API_BASE_URL` (default `http://localhost:8080/api`)
- `REACT_APP_BACKEND_BASE_URL` (default `http://localhost:8080`)

## Google Console Setup

Create OAuth 2.0 credentials and configure:

- **Authorized JavaScript origins**
  - `http://localhost:3000`
  - `http://localhost:8080`
- **Authorized redirect URI**
  - `http://localhost:8080/login/oauth2/code/google`

## Run Locally

### 1) Start MySQL

If Docker is available:

```bash
docker compose up -d
```

### 2) Start backend

From project root:

```bash
./mvnw spring-boot:run
```

Backend: `http://localhost:8080`

### 3) Start frontend

```bash
cd frontend
npm install
npm start
```

Frontend: `http://localhost:3000`

## Authentication Flow

1. Open frontend and navigate to login.
2. Click **Sign in with Google**.
3. Browser is redirected to Google via Spring Security OAuth2.
4. On success, backend creates/updates local user, assigns default role `ROLE_USER`, and redirects to frontend callback.
5. Frontend fetches current user from `GET /api/auth/me`.

## Key Auth Endpoints

- `GET /api/auth/login` -> returns Google login URL
- `GET /api/auth/me` -> current authenticated user
- `POST /api/auth/logout` -> logout session

## RBAC Overview

- `ROLE_USER` and `ROLE_ADMIN` are supported.
- API protection is enforced in `SecurityConfig`.
- Resource write operations are admin-only.
- Bookings and ticket creation/read are available to authenticated users.

