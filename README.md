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
- `APP_FRONTEND_URL` (recommended, defaults to `FRONTEND_URL`)
- `FRONTEND_URL` (default `http://localhost:3000`)
- `BACKEND_URL` (default `http://localhost:8080`)
- `OAUTH2_REDIRECT_URL` (default `http://localhost:3000/auth/callback`)

### Database

- `DB_URL` (default `jdbc:mysql://localhost:3306/smart_campus_db`)
- `DB_USERNAME`
- `DB_PASSWORD`
- `HIBERNATE_DIALECT` (optional)
- `JPA_SHOW_SQL` (optional, default `false`)
- `UPLOAD_DIR` (optional)

### Frontend env

- `REACT_APP_API_BASE_URL` (default `http://localhost:8080/api`)
- `REACT_APP_BACKEND_BASE_URL` (default `http://localhost:8080`)

### Mail / Password Reset

- `AUTH_RESET_DEMO_LINK` (`true` logs reset link in backend output for demo mode)
- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`
- `MAIL_FROM`

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
- `POST /api/auth/register` -> normal user registration
- `POST /api/admin/users` -> admin-only admin account creation
- `POST /api/auth/forgot-password` -> password reset request
- `POST /api/auth/reset-password` -> set new password from valid token

## RBAC Overview

- `ROLE_USER` and `ROLE_ADMIN` are supported.
- API protection is enforced in `SecurityConfig`.
- Resource write operations are admin-only.
- Bookings and ticket creation/read are available to authenticated users.
- `POST /api/admin/users` is restricted to `ROLE_ADMIN`.

## Quick Flow Testing

1. **Normal registration**: create account via `/register` and verify login.
2. **Admin creation**: sign in as admin, open `/admin/create-admin`, create admin.
3. **Password reset**:
   - request reset from `/forgot-password`
   - use demo-mode backend log link when `AUTH_RESET_DEMO_LINK=true`
   - reset via `/reset-password` and sign in with new password.

