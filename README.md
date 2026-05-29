# Smart Campus Platform — Facility Booking & Campus Operations

**SLIIT | Programming Application Framework (PAF) — Assignment 2026**  
**Repository:** [https://github.com/Sthulnith/smart-campus](https://github.com/Sthulnith/smart-campus)

---

## Table of Contents

1. [Project Description](#project-description)
2. [Business Scenario](#business-scenario)
3. [Features Implemented](#features-implemented)
4. [Technologies Used](#technologies-used)
5. [System Architecture Overview](#system-architecture-overview)
6. [Project Structure](#project-structure)
7. [Setup Instructions](#setup-instructions)
8. [Database Configuration](#database-configuration)
9. [API Endpoint Summary](#api-endpoint-summary)
10. [OAuth Authentication Flow](#oauth-authentication-flow)
11. [GitHub Actions / CI Workflow](#github-actions--ci-workflow)
12. [Team Members and Contributions](#team-members-and-contributions)
13. [Project Demonstration](#project-demonstration)
    - [Web Application Screenshots](#web-application-screenshots)
    - [API Testing Evidence](#api-testing-evidence)
    - [Database Validation Evidence](#database-validation-evidence)
    - [System Demonstration Summary](#system-demonstration-summary)
14. [Documentation](#documentation)
15. [Future Improvements](#future-improvements)
16. [References](#references)
17. [License](#license)

---

## Project Description

**Smart Campus** (frontend brand: **EduNexus**) is a full-stack web application designed to digitize core campus operations at a higher-education institution. The system centralizes **facility/resource management**, **room and equipment booking**, **IT/maintenance support ticketing**, and **role-targeted campus notifications** behind a single secure portal.

The solution follows a **monorepo architecture** with a **Spring Boot REST API** (`backend/`) and a **React single-page application** (`frontend/`). Authentication supports **Google OAuth 2.0** and **local email/password** accounts with **session-based security**, **role-based access control (RBAC)**, and **password reset** via email (or demo-mode console link).

---

## Business Scenario

Universities manage shared facilities (lecture halls, labs, meeting rooms, equipment) and receive maintenance requests from students and staff daily. Manual booking spreadsheets and informal ticket channels lead to **double bookings**, **delayed approvals**, and **poor visibility** for administrators and technicians.

**Smart Campus** addresses this by providing:

| Stakeholder | Problem | System Solution |
|-------------|---------|-----------------|
| **Student / Staff** | Difficulty reserving facilities | Self-service booking with conflict detection and status tracking |
| **Administrator** | No central view of bookings and users | Admin dashboards, booking approval/rejection, facility CRUD, user/role management |
| **Technician** | Unclear work assignments | Assigned ticket queue with status updates and resolution notes |
| **Campus Admin** | Broadcast announcements | Role-targeted notifications with per-user category preferences |

---

## Features Implemented

### Authentication & Security
- Google OAuth 2.0 sign-in (`/oauth2/authorization/google`)
- Local registration (`/api/auth/signup`, `/api/auth/register`)
- Email/password sign-in with session persistence (`/api/auth/signin`)
- Current user profile endpoint (`GET /api/auth/me`)
- Profile update for eligible roles (`PUT /api/auth/me`)
- Password reset request and token-based reset (`/api/auth/forgot-password`, `/api/auth/reset-password`)
- Sign-in and forgot-password **rate throttling**
- Session logout (`POST /api/auth/logout`)
- Optional demo user seeding (`APP_SEED_DEMO_USERS=true`)

### Facility (Resource) Management
- List and view campus facilities/resources
- Admin-only create, update, and delete resources

### Booking Management
- Users create bookings linked to resources with date/time, purpose, attendees, campus, category, and floor
- Automatic **time-slot conflict detection** on create
- Booking statuses: `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`
- Admin approve/reject bookings; users/admins cancel bookings
- Admin views all bookings; users view own bookings
- Booking analysis page (frontend route `/booking-analysis`)

### Support Ticketing
- Users create support tickets (category, priority, description, location, optional images)
- Ticket statuses with validated transitions: `OPEN` → `IN_PROGRESS` → `RESOLVED` → `CLOSED`, or `REJECTED`
- Admin assigns technicians; assignment moves ticket to `IN_PROGRESS`
- Technicians view assigned tickets and update status with resolution notes
- Ticket comments (list, add, edit own, delete own or admin)
- Image upload on tickets (max 3 files; JPG/JPEG/PNG)

### Notifications
- Admin creates/updates/deletes campus notifications by target role
- Categories: `BOOKING`, `MAINTENANCE`, `ANNOUNCEMENT`, `RESOURCE`, `GENERAL`
- Users view notifications filtered by role and **personal category preferences**
- Users update notification preference toggles per category

### Administration
- Admin lists all users and assignable technicians
- Admin updates user roles (`ROLE_USER`, `ROLE_ADMIN`, `ROLE_STUDENT`, `ROLE_STAFF`, `ROLE_TECHNICIAN`)
- Admin creates additional admin accounts (`POST /api/admin/users`)

### Frontend (React)
- Role-aware navigation sidebar (EduNexus branding)
- Protected routes and admin-only routes
- Dashboard with live stats and recent activity feed
- Dedicated pages for facilities, bookings, tickets, notifications, and profile

---

## Technologies Used

| Layer | Technology | Version / Notes |
|-------|------------|-----------------|
| **Backend runtime** | Java | 21 |
| **Backend framework** | Spring Boot | 4.0.4 |
| **Security** | Spring Security, OAuth2 Client | Google login, session cookies |
| **Persistence** | Spring Data JPA, Hibernate | `ddl-auto=update` |
| **Database** | PostgreSQL | Runtime driver in `pom.xml` |
| **Migrations** | Flyway | SQL scripts in `db/migration/` |
| **Validation** | Jakarta Bean Validation | DTO request validation |
| **Mail** | Spring Mail | Password reset emails |
| **Utilities** | Lombok, dotenv-java | Config loading |
| **Frontend** | React | 19.x |
| **Routing** | React Router DOM | 7.x |
| **HTTP client** | Axios | Session cookies (`withCredentials: true`) |
| **Styling** | Tailwind CSS | 3.x |
| **Icons** | Lucide React | UI icons |
| **Build (FE)** | Create React App (`react-scripts`) | 5.0.1 |
| **Container (optional)** | Docker Compose | MySQL 8.4 service (see database note) |

---

## System Architecture Overview

### High-Level Architecture

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                         Client Browser (React SPA)                       │
│  Pages • Components • AuthContext • Axios (withCredentials)              │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ HTTP/REST (JSON)
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    Spring Boot Backend (Port 8080)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │ Controllers │→ │  Services   │→ │ Repositories │→ │ JPA Entities    │ │
│  └─────────────┘  └─────────────┘  └──────────────┘  └─────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ Security: OAuth2 • Session • RBAC • Throttling • Exception Handler   │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ JDBC
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         PostgreSQL Database                              │
│  Flyway migrations • app_users • bookings • tickets • notifications     │
└─────────────────────────────────────────────────────────────────────────┘

External: Google OAuth 2.0  |  SMTP (password reset emails)
```

### Spring Boot Layered Design

| Layer | Package / Location | Responsibility |
|-------|-------------------|----------------|
| **Controller** | `com.smartcampus.backend.controller` | REST endpoints, HTTP status, request mapping |
| **Service** | `com.smartcampus.backend.service` | Business logic (bookings, users, password reset, file storage) |
| **Repository** | `com.smartcampus.backend.repository` | Spring Data JPA data access |
| **Entity (Model)** | `com.smartcampus.backend.model` | JPA entities mapped to database tables |
| **DTO** | `com.smartcampus.backend.dto` | Validated request/response payloads |
| **Security** | `com.smartcampus.backend.security` | OAuth2 user service, login handlers, `AppUserDetails`, throttling |
| **Config** | `com.smartcampus.backend.config` | Security filter chain, CORS, web/static uploads, dev seeder |
| **Exception** | `com.smartcampus.backend.exception` | Global API error handling (`GlobalExceptionHandler`) |

### React Frontend Structure

| Folder | Purpose |
|--------|---------|
| `pages/` | Route-level screens (dashboard, bookings, tickets, auth, etc.) |
| `components/` | Reusable UI (`Sidebar`, `Header`, `ProtectedRoute`, `AdminRoute`, `AuthShell`) |
| `contexts/` | `AuthContext` — session user state and auth actions |
| `services/` | Axios API client (`api.js`) |
| `utils/` | Auth helper utilities (`authApi.js`) |

### Role-Based Access Control (RBAC)

| Role | Key Permissions |
|------|-----------------|
| `ROLE_USER` | Book facilities, create/view own tickets, view notifications |
| `ROLE_STUDENT` | Same API access group as user; profile edit allowed |
| `ROLE_STAFF` | Authenticated booking/ticket/notification access |
| `ROLE_TECHNICIAN` | View/update assigned tickets and comments |
| `ROLE_ADMIN` | Full booking approval, facility CRUD, ticket assignment, notification management, user/role admin |

> Enforcement is implemented in `SecurityConfig.java` and additional checks inside controllers (e.g., ticket status transitions, profile edit rules).

---

## Project Structure

```text
smart-campus/
├── backend/
│   ├── src/main/java/com/smartcampus/backend/
│   │   ├── controller/       # REST API controllers
│   │   ├── service/          # Business services
│   │   ├── repository/       # JPA repositories
│   │   ├── model/            # Entities
│   │   ├── dto/              # Request DTOs
│   │   ├── security/         # OAuth2 & auth helpers
│   │   ├── config/           # Security, Web, Seeder
│   │   └── exception/        # Exception handling
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── db/migration/     # Flyway SQL scripts
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
├── docs/                       # Documentation & screenshots
│   ├── screenshots/
│   │   ├── api-testing/
│   │   ├── database-validation/
│   │   └── web-application/
│   ├── architecture/
│   ├── diagrams/
│   └── reports/
├── docker-compose.yml
├── START_GUIDE.md
├── LICENSE
└── README.md
```

---

## Setup Instructions

### Prerequisites

- **Java 21**
- **Node.js** and **npm**
- **PostgreSQL** (recommended — matches `application.properties`)
- **Google Cloud OAuth 2.0 credentials** (for Google sign-in)
- **SMTP credentials** (optional; required for live password-reset emails)

### Quick Start

For a condensed setup guide, see **[START_GUIDE.md](START_GUIDE.md)**.

### 1. Clone the Repository

```bash
git clone https://github.com/Sthulnith/smart-campus.git
cd smart-campus
```

### 2. Environment Variables

Create a `.env` file in the project root (or configure environment variables directly). Minimum required variables:

```env
# Database (PostgreSQL)
DB_URL=jdbc:postgresql://localhost:5432/smart_campus_db
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password

# Google OAuth2
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Application URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8080
APP_FRONTEND_URL=http://localhost:3000
OAUTH2_REDIRECT_URL=http://localhost:3000/auth/callback

# Frontend (create frontend/.env)
REACT_APP_API_BASE_URL=http://localhost:8080/api
REACT_APP_BACKEND_BASE_URL=http://localhost:8080

# Optional: demo password reset link in backend console
AUTH_RESET_DEMO_LINK=true

# Optional: seed demo admin/user on startup
APP_SEED_DEMO_USERS=true

# Optional: mail for password reset
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=your-email@example.com
MAIL_PASSWORD=your-email-password
MAIL_FROM=noreply@example.com
```

### 3. Google Cloud Console Configuration

Create **OAuth 2.0 Client ID** credentials:

| Setting | Value |
|---------|-------|
| Authorized JavaScript origins | `http://localhost:3000`, `http://localhost:8080` |
| Authorized redirect URI | `http://localhost:8080/login/oauth2/code/google` |

### 4. Database Setup (PostgreSQL)

```sql
CREATE DATABASE smart_campus_db;
CREATE USER smartcampus WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE smart_campus_db TO smartcampus;
```

Flyway migrations run automatically on backend startup.

### 5. Run the Backend

```bash
cd backend
./mvnw spring-boot:run
```

Backend URL: **http://localhost:8080**

### 6. Run the Frontend

```bash
cd frontend
npm install
npm start
```

Frontend URL: **http://localhost:3000**

### 7. Optional: Docker Compose (MySQL)

> **Note:** `docker-compose.yml` provisions **MySQL 8.4**, while `backend/src/main/resources/application.properties` is configured for **PostgreSQL**. Use Docker MySQL only if you update `DB_URL`, driver, and dialect accordingly. For the current codebase, **PostgreSQL is the supported configuration**.

```bash
docker compose up -d
```

### 8. Demo Accounts (when `APP_SEED_DEMO_USERS=true`)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@test.com` | `Admin@123` |
| User | `user@test.com` | `User@123` |

---

## Database Configuration

### Primary Configuration (`application.properties`)

| Property | Description |
|----------|-------------|
| `spring.datasource.url` | `${DB_URL}` — JDBC connection string |
| `spring.datasource.username` | `${DB_USERNAME}` |
| `spring.datasource.password` | `${DB_PASSWORD}` |
| `spring.datasource.driver-class-name` | `org.postgresql.Driver` |
| `spring.jpa.hibernate.ddl-auto` | `update` |
| `spring.jpa.properties.hibernate.dialect` | `PostgreSQLDialect` |
| `spring.flyway.enabled` | `true` |
| `file.upload-dir` | `${UPLOAD_DIR:./uploads}` — ticket image storage |

### Flyway Migrations

| Script | Purpose |
|--------|---------|
| `V1__auth_local_and_password_reset.sql` | Local auth support; `password_reset_tokens` table |
| `V3__app_users_role_to_varchar.sql` | Role column type adjustment |
| `V4__normalize_app_users_role_column_postgres.sql` | PostgreSQL role column normalization |
| `V5__notifications_category_and_preferences.sql` | Notification categories and user preferences |

### Core Entities

| Entity | Table / Description |
|--------|---------------------|
| `AppUser` | `app_users` — accounts, roles, providers |
| `Resource` | Facilities/rooms/equipment |
| `Booking` | Facility reservations with status workflow |
| `Ticket` | Support/maintenance requests |
| `TicketComment` | Ticket discussion threads |
| `Notification` | Admin broadcasts by target role |
| `UserNotificationPreference` | Per-user category toggles |
| `PasswordResetToken` | Hashed reset tokens |

---

## API Endpoint Summary

> Base URL: `http://localhost:8080`  
> API prefix: `/api`  
> Auth: Session cookie (send credentials from frontend via `withCredentials: true`)

### Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/auth/login` | Public | Returns Google OAuth login URL |
| `POST` | `/api/auth/signup` | Public | Register local user (`SignupRequest`) |
| `POST` | `/api/auth/register` | Public | Register user (`UserRegisterRequest`) |
| `POST` | `/api/auth/signin` | Public | Email/password login; creates session |
| `GET` | `/api/auth/me` | Authenticated | Current user profile and role |
| `PUT` | `/api/auth/me` | Authenticated | Update profile (`USER`/`STUDENT` only) |
| `POST` | `/api/auth/logout` | Public | Destroy session |
| `POST` | `/api/auth/forgot-password` | Public | Request password reset email/link |
| `POST` | `/api/auth/reset-password` | Public | Reset password with valid token |

### Admin Users (`/api/admin/users`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/admin/users` | Admin | List all users |
| `GET` | `/api/admin/users/technicians` | Admin | List technicians for ticket assignment |
| `PUT` | `/api/admin/users/{id}/role` | Admin | Update user role |
| `POST` | `/api/admin/users` | Admin | Create admin account |

### Resources / Facilities (`/api/resources`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/resources` | User, Admin | List all resources |
| `GET` | `/api/resources/{id}` | User, Admin | Get resource by ID |
| `POST` | `/api/resources` | Admin | Create resource |
| `PUT` | `/api/resources/{id}` | Admin | Update resource |
| `DELETE` | `/api/resources/{id}` | Admin | Delete resource |

### Bookings (`/api/bookings`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/bookings` | Authenticated | List all bookings |
| `GET` | `/api/bookings/user` | Authenticated | List current user's bookings |
| `POST` | `/api/bookings` | Authenticated | Create booking (conflict check) |
| `PUT` | `/api/bookings/{id}` | Authenticated | Update booking fields |
| `PUT` | `/api/bookings/{id}/approve` | Admin | Approve booking |
| `PUT` | `/api/bookings/{id}/reject` | Admin | Reject booking |
| `PUT` | `/api/bookings/{id}/cancel` | User (owner) / Admin | Cancel booking |
| `DELETE` | `/api/bookings/{id}` | Admin | Delete booking |

### Tickets (`/api/tickets`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/tickets` | User, Admin, Technician | List all tickets |
| `GET` | `/api/tickets/my` | User, Admin | List tickets created by current user |
| `GET` | `/api/tickets/assigned` | Technician | List tickets assigned to technician |
| `POST` | `/api/tickets` | User, Admin | Create ticket |
| `PUT` | `/api/tickets/{id}` | User, Admin, Technician | Update ticket fields |
| `PUT` | `/api/tickets/{id}/status` | Admin, Technician | Update ticket status (validated transitions) |
| `PUT` | `/api/tickets/{id}/assign` | Admin | Assign technician (`technicianId` query param) |
| `POST` | `/api/tickets/{id}/upload` | Authenticated | Upload up to 3 ticket images |
| `DELETE` | `/api/tickets/{id}` | User, Admin | Delete ticket |

### Ticket Comments (`/api/tickets/{ticketId}/comments`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/tickets/{ticketId}/comments` | User, Admin, Technician | List comments |
| `POST` | `/api/tickets/{ticketId}/comments` | User, Admin, Technician | Add comment |
| `PUT` | `/api/tickets/{ticketId}/comments/{commentId}` | Owner | Edit own comment |
| `DELETE` | `/api/tickets/{ticketId}/comments/{commentId}` | Owner, Admin | Delete comment |

### Notifications (`/api/notifications`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/notifications` | Authenticated | Role-filtered notifications (respects preferences) |
| `GET` | `/api/notifications/preferences` | Authenticated | Get category preference map |
| `PUT` | `/api/notifications/preferences` | Authenticated | Update category preferences |
| `POST` | `/api/notifications` | Admin | Create notification |
| `PUT` | `/api/notifications/{id}` | Admin | Update notification |
| `DELETE` | `/api/notifications/{id}` | Admin | Delete notification |

### Static Files

| Path | Description |
|------|-------------|
| `GET /uploads/**` | Public access to uploaded ticket images |

---

## OAuth Authentication Flow

```text
1. User opens React app → /login
2. User clicks "Sign in with Google"
3. Frontend calls GET /api/auth/login → receives loginUrl
4. Browser redirects to backend /oauth2/authorization/google
5. User authenticates with Google
6. Google redirects to /login/oauth2/code/google
7. GoogleOAuth2UserService loads profile (email, name, sub)
   → creates or updates AppUser in database
8. OAuth2LoginSuccessHandler redirects to frontend /auth/callback
9. AuthCallbackPage loads; AuthContext calls GET /api/auth/me
10. Session cookie issued; user enters protected application routes
```

### Local Authentication Flow

```text
1. User registers via /signup or /register
2. User signs in via POST /api/auth/signin
3. Spring Security AuthenticationManager validates credentials
4. Security context saved to HTTP session
5. Frontend fetches GET /api/auth/me and stores user in AuthContext
```

### Password Reset Flow

```text
1. POST /api/auth/forgot-password with email
2. Backend creates hashed token; sends email (or logs demo link if AUTH_RESET_DEMO_LINK=true)
3. User opens /reset-password/:token in frontend
4. POST /api/auth/reset-password with token and new password
5. User signs in with new credentials
```

---

## GitHub Actions / CI Workflow

### Current Status

**No GitHub Actions workflow is configured** in this repository at the time of documentation (no `.github/workflows/*.yml` files were found). Builds and tests are executed locally.

### Recommended CI Pipeline (for PAF submission enhancement)

A typical workflow for this project would include:

```yaml
# Suggested: .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
      - name: Build backend
        working-directory: backend
        run: ./mvnw -B verify

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install and test frontend
        working-directory: frontend
        run: |
          npm ci
          npm test -- --watchAll=false
```

| Job | Purpose |
|-----|---------|
| **backend** | Compile Java 21 code and run Maven tests |
| **frontend** | Install npm dependencies and run React tests |

---

## Team Members and Contributions

**Group:** Smart Campus Platform (PAF Assignment 2026)  
**Institution:** Sri Lanka Institute of Information Technology (SLIIT)

> **Attribution note:** Local Git history contains consolidated repository commits only and does not record per-member author metadata. The individual contribution mapping below is derived from **implemented modules**, **REST endpoints**, and **React components** in the current codebase. Each member should verify and adjust their row before the viva.

### Team Members

| # | Student ID | Student Name | Role (Project) |
|---|------------|--------------|----------------|
| 1 | IT23426580 | Thisayuru E.L.H. | Authentication, Security & Integration Lead |
| 2 | IT23333802 | Samarasinghe S.I. | Facility & Booking Module Lead |
| 3 | IT23366404 | Hasapathirathna M.M.D.S.T. | Support Ticketing & Technician Workflow Lead |
| 4 | IT23426344 | Dissanayake H.M.S.U. | Notifications, Admin Management & UI Lead |

### Individual Contributions

| Student ID | Name | Primary Modules | Backend (Spring Boot) | Frontend (React) | Database / Other |
|------------|------|-----------------|----------------------|------------------|------------------|
| **IT23426580** | Thisayuru E.L.H. | Authentication & Security | `AuthController`, `AuthPasswordResetController`, `SecurityConfig`, `GoogleOAuth2UserService`, `OAuth2LoginSuccessHandler`, `OAuth2LoginFailureHandler`, `AppUserDetailsService`, `RequestThrottleService`, `PasswordResetService`, `PasswordResetMailService` | `LoginPage`, `SignupPage`, `RegisterPage`, `ForgotPasswordPage`, `ResetPasswordPage`, `AuthCallbackPage`, `AuthContext`, `ProtectedRoute`, `authApi.js` | Flyway `V1__auth_local_and_password_reset.sql`; OAuth2 & session configuration |
| **IT23333802** | Samarasinghe S.I. | Facilities & Bookings | `ResourceController`, `BookingController`, `BookingService`, `Resource` / `Booking` entities, `ResourceRepository`, `BookingRepository` | `ResourcePage`, `UserBookingPage`, `AdminBookingPage`, `BookingAnalysisPage`, `DashboardPage` (stats integration) | Booking conflict logic; facility CRUD; booking status workflow (`PENDING` / `APPROVED` / `REJECTED` / `CANCELLED`) |
| **IT23366404** | Hasapathirathna M.M.D.S.T. | Support Ticketing | `TicketController`, `TicketCommentController`, `FileStorageService`, `Ticket` / `TicketComment` entities, `TicketRepository`, `TicketCommentRepository`, `WebConfig` (uploads) | `TicketPage`, `AdminTicketPage`, `TechnicianTicketPage` | Ticket status transitions; technician assignment; image upload (`POST /api/tickets/{id}/upload`); comment CRUD |
| **IT23426344** | Dissanayake H.M.S.U. | Notifications & Administration | `NotificationController`, `AdminUserController`, `UserService`, `Notification` / `UserNotificationPreference` entities, `DevUserSeeder` | `NotificationsPage`, `ProfilePage`, `AdminCreateAdminPage`, `Sidebar`, `Header`, `AdminRoute`, `AuthShell` | Flyway `V3`, `V4`, `V5` migrations; RBAC roles (`ADMIN`, `TECHNICIAN`, `STUDENT`, `STAFF`); admin user & notification preferences |

### REST Endpoints by Member (Probable Mapping)

| Module Owner | Endpoints |
|--------------|-----------|
| **IT23426580** | `GET/POST /api/auth/*` (login, signup, register, signin, me, logout, forgot-password, reset-password) |
| **IT23333802** | `GET/POST/PUT/DELETE /api/resources/**`, `GET/POST/PUT /api/bookings/**`, `PUT /api/bookings/{id}/approve|reject|cancel` |
| **IT23366404** | `GET/POST/PUT/DELETE /api/tickets/**`, `PUT /api/tickets/{id}/status|assign`, `POST /api/tickets/{id}/upload`, `/api/tickets/{ticketId}/comments/**` |
| **IT23426344** | `GET/POST/PUT/DELETE /api/notifications/**`, `GET/PUT /api/notifications/preferences`, `GET/POST/PUT /api/admin/users/**` |

### Shared / Group Deliverables

| Deliverable | Contributors |
|-------------|--------------|
| Project README & `START_GUIDE.md` | All members |
| `docker-compose.yml`, environment configuration | All members |
| `GlobalExceptionHandler`, integration testing | All members |
| GitHub repository maintenance | All members |

### Git Commit History (Repository)

| Commit | Author | Summary |
|--------|--------|---------|
| `f27106f` | Sthulnith | Initial monorepo push (`backend/`, `frontend/`) |
| `9947dc4` | Sthulnith | `.gitignore` updates for env files and logs |

> **For examiners:** Per-member commit attribution was not available in the published Git history. Module-level mapping above reflects the implemented system architecture and should be confirmed by the group during the viva.

---

## Project Demonstration

This section provides visual evidence of the Smart Campus Platform for SLIIT PAF Assignment 2026. All images are stored under [`docs/screenshots/`](docs/screenshots/) using a consistent naming convention.

| Folder | Prefix | Count |
|--------|--------|-------|
| [`web-application/`](docs/screenshots/web-application/) | `web-###.png` | 33 |
| [`api-testing/`](docs/screenshots/api-testing/) | `api-###.png` | 39 |
| [`database-validation/`](docs/screenshots/database-validation/) | `db-###.png` | 6 |

### Web Application Screenshots

<details>
<summary><strong>View all web application screenshots (gallery)</strong></summary>

#### Email Reset Mail

![Email Reset Mail](docs/screenshots/web-application/web-001.png)

*Figure: Email Reset Mail — EduNexus web interface.*

#### Forgot Password

![Forgot Password](docs/screenshots/web-application/web-002.png)

*Figure: Forgot Password — EduNexus web interface.*

#### Password Update

![Password Update](docs/screenshots/web-application/web-003.png)

*Figure: Password Update — EduNexus web interface.*

#### Sign in - Google Auth

![Sign in - Google Auth](docs/screenshots/web-application/web-004.png)

*Figure: Sign in - Google Auth — EduNexus web interface.*

#### Sign in - normal

![Sign in - normal](docs/screenshots/web-application/web-005.png)

*Figure: Sign in - normal — EduNexus web interface.*

#### Sign up

![Sign up](docs/screenshots/web-application/web-006.png)

*Figure: Sign up — EduNexus web interface.*

#### Admin dashboard

![Admin dashboard](docs/screenshots/web-application/web-007.png)

*Figure: Admin dashboard — EduNexus web interface.*

#### User Dashboard

![User Dashboard](docs/screenshots/web-application/web-008.png)

*Figure: User Dashboard — EduNexus web interface.*

#### Facilities Create

![Facilities Create](docs/screenshots/web-application/web-009.png)

*Figure: Facilities Create — EduNexus web interface.*

#### Facilities Delete

![Facilities Delete](docs/screenshots/web-application/web-010.png)

*Figure: Facilities Delete — EduNexus web interface.*

#### Facilities Read

![Facilities Read](docs/screenshots/web-application/web-011.png)

*Figure: Facilities Read — EduNexus web interface.*

#### Facilities Update

![Facilities Update](docs/screenshots/web-application/web-012.png)

*Figure: Facilities Update — EduNexus web interface.*

#### Booking Page

![Booking Page](docs/screenshots/web-application/web-013.png)

*Figure: Booking Page — EduNexus web interface.*

#### Create Booking 1

![Create Booking 1](docs/screenshots/web-application/web-014.png)

*Figure: Create Booking 1 — EduNexus web interface.*

#### Create Booking 2

![Create Booking 2](docs/screenshots/web-application/web-015.png)

*Figure: Create Booking 2 — EduNexus web interface.*

#### Delete Booking

![Delete Booking](docs/screenshots/web-application/web-016.png)

*Figure: Delete Booking — EduNexus web interface.*

#### Read Booking

![Read Booking](docs/screenshots/web-application/web-017.png)

*Figure: Read Booking — EduNexus web interface.*

#### Booking Analysis

![Booking Analysis](docs/screenshots/web-application/web-018.png)

*Figure: Booking Analysis — EduNexus web interface.*

#### Add Technician

![Add Technician](docs/screenshots/web-application/web-019.png)

*Figure: Add Technician — EduNexus web interface.*

#### Create Notification

![Create Notification](docs/screenshots/web-application/web-020.png)

*Figure: Create Notification — EduNexus web interface.*

#### Notification Delete

![Notification Delete](docs/screenshots/web-application/web-021.png)

*Figure: Notification Delete — EduNexus web interface.*

#### Read Notification

![Read Notification](docs/screenshots/web-application/web-022.png)

*Figure: Read Notification — EduNexus web interface.*

#### User Profile Read

![User Profile Read](docs/screenshots/web-application/web-023.png)

*Figure: User Profile Read — EduNexus web interface.*

#### User Profile Update

![User Profile Update](docs/screenshots/web-application/web-024.png)

*Figure: User Profile Update — EduNexus web interface.*

#### User Management

![User Management](docs/screenshots/web-application/web-025.png)

*Figure: User Management — EduNexus web interface.*

#### Campus operations UI demonstration

![Campus operations UI demonstration](docs/screenshots/web-application/web-026.png)

*Figure: Campus operations UI demonstration — EduNexus web interface.*

#### Campus operations UI demonstration

![Campus operations UI demonstration](docs/screenshots/web-application/web-027.png)

*Figure: Campus operations UI demonstration — EduNexus web interface.*

#### Campus operations UI demonstration

![Campus operations UI demonstration](docs/screenshots/web-application/web-028.png)

*Figure: Campus operations UI demonstration — EduNexus web interface.*

#### Campus operations UI demonstration

![Campus operations UI demonstration](docs/screenshots/web-application/web-029.png)

*Figure: Campus operations UI demonstration — EduNexus web interface.*

#### Support ticket management UI

![Support ticket management UI](docs/screenshots/web-application/web-030.png)

*Figure: Support ticket management UI — EduNexus web interface.*

#### Support ticket management UI

![Support ticket management UI](docs/screenshots/web-application/web-031.png)

*Figure: Support ticket management UI — EduNexus web interface.*

#### Tickect Create 1

![Tickect Create 1](docs/screenshots/web-application/web-032.png)

*Figure: Tickect Create 1 — EduNexus web interface.*

#### Tickect Create 2

![Tickect Create 2](docs/screenshots/web-application/web-033.png)

*Figure: Tickect Create 2 — EduNexus web interface.*

</details>

### API Testing Evidence

Postman was used to validate REST endpoints against the Spring Boot backend. Screenshots confirm request/response behavior, HTTP status codes, and RBAC enforcement.

<details>
<summary><strong>View all API testing screenshots (gallery)</strong></summary>

#### /api/auth/forgot-password

![/api/auth/forgot-password](docs/screenshots/api-testing/api-001.png)

*Figure: /api/auth/forgot-password — POST — Request password reset link for a registered email.*

#### /api/auth/login

![/api/auth/login](docs/screenshots/api-testing/api-002.png)

*Figure: /api/auth/login — GET — Retrieve Google OAuth2 authorization URL.*

#### /api/auth/logout

![/api/auth/logout](docs/screenshots/api-testing/api-003.png)

*Figure: /api/auth/logout — POST — End the current HTTP session.*

#### /api/auth/me

![/api/auth/me](docs/screenshots/api-testing/api-004.png)

*Figure: /api/auth/me — GET — Return authenticated user profile and role.*

#### /api/auth/reset-password

![/api/auth/reset-password](docs/screenshots/api-testing/api-005.png)

*Figure: /api/auth/reset-password — POST — Set a new password using a valid reset token.*

#### /api/auth/signin

![/api/auth/signin](docs/screenshots/api-testing/api-006.png)

*Figure: /api/auth/signin — POST — Authenticate with email and password; creates session.*

#### /api/auth/signup

![/api/auth/signup](docs/screenshots/api-testing/api-007.png)

*Figure: /api/auth/signup — POST — Register a new local user account.*

#### /api/bookings/Get

![/api/bookings/Get](docs/screenshots/api-testing/api-008.png)

*Figure: /api/bookings/Get — Booking module — list, create, update, cancel, approve, or reject reservations.*

#### /api/bookings/post

![/api/bookings/post](docs/screenshots/api-testing/api-009.png)

*Figure: /api/bookings/post — Booking module — list, create, update, cancel, approve, or reject reservations.*

#### /api/bookings/{id}//put/cancel

![/api/bookings/{id}//put/cancel](docs/screenshots/api-testing/api-010.png)

*Figure: /api/bookings/{id}//put/cancel — Booking module — list, create, update, cancel, approve, or reject reservations.*

#### /api/bookings/{id}/put

![/api/bookings/{id}/put](docs/screenshots/api-testing/api-011.png)

*Figure: /api/bookings/{id}/put — Booking module — list, create, update, cancel, approve, or reject reservations.*

#### Booking end point delete confirmation

![Booking end point delete confirmation](docs/screenshots/api-testing/api-012.png)

*Figure: Booking end point delete confirmation — DELETE `/api/bookings/{id}` — Admin booking removal.*

#### Booking endpoint deleted

![Booking endpoint deleted](docs/screenshots/api-testing/api-013.png)

*Figure: Booking endpoint deleted — DELETE `/api/bookings/{id}` — Admin booking removal.*

#### /api/admin/users/post

![/api/admin/users/post](docs/screenshots/api-testing/api-014.png)

*Figure: /api/admin/users/post — POST — Admin-only creation of administrator accounts.*

#### /api/notifications/Get

![/api/notifications/Get](docs/screenshots/api-testing/api-015.png)

*Figure: /api/notifications/Get — GET — Role-filtered campus notifications.*

#### 1 - Sign in

![1 - Sign in](docs/screenshots/api-testing/api-016.png)

*Figure: 1 - Sign in — POST — Authenticate with email and password; creates session.*

#### 2 - Check logged user

![2 - Check logged user](docs/screenshots/api-testing/api-017.png)

*Figure: 2 - Check logged user — GET `/api/auth/me` — Verify active session.*

#### 1 - Create resource

![1 - Create resource](docs/screenshots/api-testing/api-018.png)

*Figure: 1 - Create resource — POST `/api/resources` — Create a campus facility.*

#### 2 - Get all resources

![2 - Get all resources](docs/screenshots/api-testing/api-019.png)

*Figure: 2 - Get all resources — Resource module — facility CRUD operations.*

#### 3 - Update resource

![3 - Update resource](docs/screenshots/api-testing/api-020.png)

*Figure: 3 - Update resource — PUT `/api/resources/{id}` — Update facility details.*

#### 4 - Delete resource

![4 - Delete resource](docs/screenshots/api-testing/api-021.png)

*Figure: 4 - Delete resource — DELETE `/api/resources/{id}` — Remove a facility.*

#### 1 - Create notification (ADMIN only)

![1 - Create notification (ADMIN only)](docs/screenshots/api-testing/api-022.png)

*Figure: 1 - Create notification (ADMIN only) — POST `/api/notifications` — Admin broadcast (role-targeted).*

#### 2 - Get notifications (for current logged role)

![2 - Get notifications (for current logged role)](docs/screenshots/api-testing/api-023.png)

*Figure: 2 - Get notifications (for current logged role) — GET — Role-filtered campus notifications.*

#### 1 - Get current preferences

![1 - Get current preferences](docs/screenshots/api-testing/api-024.png)

*Figure: 1 - Get current preferences — Notification preference APIs — GET/PUT `/api/notifications/preferences`.*

#### 2 - Update preferences

![2 - Update preferences](docs/screenshots/api-testing/api-025.png)

*Figure: 2 - Update preferences — Notification preference APIs — GET/PUT `/api/notifications/preferences`.*

#### 3 - Re-check notifications after disabling category

![3 - Re-check notifications after disabling category](docs/screenshots/api-testing/api-026.png)

*Figure: 3 - Re-check notifications after disabling category — GET — Role-filtered campus notifications.*

#### 1 - without login

![1 - without login](docs/screenshots/api-testing/api-027.png)

*Figure: 1 - without login — GET — Retrieve Google OAuth2 authorization URL.*

#### Non-admin trying admin notification create

![Non-admin trying admin notification create](docs/screenshots/api-testing/api-028.png)

*Figure: Non-admin trying admin notification create — RBAC test — non-admin blocked from admin-only notification creation.*

#### /api/resources/Get

![/api/resources/Get](docs/screenshots/api-testing/api-029.png)

*Figure: /api/resources/Get — Resource module — facility CRUD operations.*

#### /api/resources/Post

![/api/resources/Post](docs/screenshots/api-testing/api-030.png)

*Figure: /api/resources/Post — Resource module — facility CRUD operations.*

#### /api/resources/{id}/Delete

![/api/resources/{id}/Delete](docs/screenshots/api-testing/api-031.png)

*Figure: /api/resources/{id}/Delete — Resource module — facility CRUD operations.*

#### /api/resources/{id}/GET

![/api/resources/{id}/GET](docs/screenshots/api-testing/api-032.png)

*Figure: /api/resources/{id}/GET — Resource module — facility CRUD operations.*

#### /api/resources/{id}/put

![/api/resources/{id}/put](docs/screenshots/api-testing/api-033.png)

*Figure: /api/resources/{id}/put — Resource module — facility CRUD operations.*

#### /api/tickets/get

![/api/tickets/get](docs/screenshots/api-testing/api-034.png)

*Figure: /api/tickets/get — Ticket module — support request lifecycle and file upload.*

#### /api/tickets/post

![/api/tickets/post](docs/screenshots/api-testing/api-035.png)

*Figure: /api/tickets/post — Ticket module — support request lifecycle and file upload.*

#### /api/tickets/{id}/assign

![/api/tickets/{id}/assign](docs/screenshots/api-testing/api-036.png)

*Figure: /api/tickets/{id}/assign — Ticket module — support request lifecycle and file upload.*

#### /api/tickets/{id}/Delete

![/api/tickets/{id}/Delete](docs/screenshots/api-testing/api-037.png)

*Figure: /api/tickets/{id}/Delete — Ticket module — support request lifecycle and file upload.*

#### /api/tickets/{id}/put

![/api/tickets/{id}/put](docs/screenshots/api-testing/api-038.png)

*Figure: /api/tickets/{id}/put — Ticket module — support request lifecycle and file upload.*

#### /api/tickets/{id}/upload

![/api/tickets/{id}/upload](docs/screenshots/api-testing/api-039.png)

*Figure: /api/tickets/{id}/upload — Ticket module — support request lifecycle and file upload.*

</details>

### Database Validation Evidence

PostgreSQL was inspected after key workflows to confirm schema integrity, persisted entities, and role assignments.

#### Check user notification preferences

![Check user notification preferences](docs/screenshots/database-validation/db-001.png)

*Figure: Check user notification preferences — Verifies `user_notification_preferences` records per category toggle.*

#### Check users:roles (for role-test clarity)

![Check users:roles (for role-test clarity)](docs/screenshots/database-validation/db-002.png)

*Figure: Check users:roles (for role-test clarity) — Confirms `app_users.role` values for RBAC testing across accounts.*

#### Check users_roles (for role-test clarity)

![Check users_roles (for role-test clarity)](docs/screenshots/database-validation/db-003.png)

*Figure: Check users_roles (for role-test clarity) — Duplicate role verification query for assignment clarity.*

#### Resources Table

![Resources Table](docs/screenshots/database-validation/db-004.png)

*Figure: Resources Table — Validates persisted facility/resource records after CRUD operations.*

#### Schema

![Schema](docs/screenshots/database-validation/db-005.png)

*Figure: Schema — PostgreSQL schema overview — tables, keys, and relationships.*

#### Screenshot 2026-04-28 at 00.47.48

![Screenshot 2026-04-28 at 00.47.48](docs/screenshots/database-validation/db-006.png)

*Figure: Screenshot 2026-04-28 at 00.47.48 — Additional database state verification after integration testing.*

### System Demonstration Summary

The following summary maps demonstrated capabilities to implemented modules in the codebase.

#### User Authentication
The platform supports **Google OAuth 2.0** and **local email/password** authentication with HTTP session cookies. Users can register, sign in, reset passwords, and retrieve their profile via `/api/auth/*`. The React frontend (`LoginPage`, `SignupPage`, `AuthCallbackPage`, `AuthContext`) integrates with `SecurityConfig` and `GoogleOAuth2UserService` for secure access.

#### Resource Management
Administrators manage campus facilities through `/api/resources` (CRUD). The `Resource` entity stores name, type, capacity, location, and status. The `ResourcePage` component provides the web UI for listing, creating, updating, and deleting resources.

#### Booking Management
Authenticated users create bookings via `POST /api/bookings` with **time-slot conflict detection** in `BookingController`. Admins approve or reject via `/approve` and `/reject` endpoints. Statuses include `PENDING`, `APPROVED`, `REJECTED`, and `CANCELLED`. Frontend pages: `UserBookingPage`, `AdminBookingPage`, and `BookingAnalysisPage`.

#### Incident Ticket Management
Users raise support tickets with category, priority, description, and optional images (`POST /api/tickets/{id}/upload`). Admins assign technicians; technicians update status through validated transitions (`OPEN` → `IN_PROGRESS` → `RESOLVED` → `CLOSED`). `TicketCommentController` supports collaborative resolution threads.

#### Notifications
Admins publish role-targeted announcements (`POST /api/notifications`) in categories such as `BOOKING`, `MAINTENANCE`, `ANNOUNCEMENT`, `RESOURCE`, and `GENERAL`. Users filter content via `/api/notifications/preferences`. The `NotificationsPage` displays filtered results per user settings.

#### Admin Operations
Administrators manage users and roles through `/api/admin/users`, create additional admins, list technicians for ticket assignment, and oversee bookings, facilities, and notifications from role-specific dashboards (`AdminBookingPage`, `AdminTicketPage`, `AdminCreateAdminPage`).

---

## Documentation

| Resource | Location |
|----------|----------|
| Documentation index | [`docs/README.md`](docs/README.md) |
| Screenshot manifest | [`docs/screenshots/manifest.json`](docs/screenshots/manifest.json) |
| Quick start | [`START_GUIDE.md`](START_GUIDE.md) |
| Architecture notes | [`docs/architecture/`](docs/architecture/) |
| Diagrams | [`docs/diagrams/`](docs/diagrams/) |
| Reports | [`docs/reports/`](docs/reports/) |


---

## Future Improvements

- Add `.env.example` and environment validation on startup
- Align `docker-compose.yml` with PostgreSQL (or support profiles for MySQL/PostgreSQL)
- Implement GitHub Actions CI/CD pipeline (build, test, deploy)
- Add Swagger/OpenAPI documentation (`springdoc-openapi`)
- Introduce unit and integration tests for booking conflict and ticket transitions
- Email notifications for booking approval/rejection events
- Calendar view for facility availability
- Audit logging for admin actions
- Route unused pages (`AdminPage.jsx`, `BookingPreview.jsx`) or remove dead code
- Production hardening: enable CSRF for state-changing API calls where applicable

---

## References

1. SLIIT — Programming Application Framework (PAF) Module Guidelines, 2026.
2. Spring Boot Documentation — https://docs.spring.io/spring-boot/
3. Spring Security OAuth2 Client — https://docs.spring.io/spring-security/reference/servlet/oauth2/client/index.html
4. React Documentation — https://react.dev/
5. React Router — https://reactrouter.com/
6. PostgreSQL Documentation — https://www.postgresql.org/docs/
7. Flyway Migrations — https://flywaydb.org/documentation/
8. Google Identity — OAuth 2.0 Setup — https://developers.google.com/identity/protocols/oauth2
9. Tailwind CSS — https://tailwindcss.com/docs
10. Axios HTTP Client — https://axios-http.com/docs/intro
11. Project Repository — https://github.com/Sthulnith/smart-campus
12. Quick Start Guide — [START_GUIDE.md](START_GUIDE.md)

---

## License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

**Developed for SLIIT PAF Assignment 2026 — Smart Campus Platform**
