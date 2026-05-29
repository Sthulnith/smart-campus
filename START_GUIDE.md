# Smart Campus Platform — Quick Start Guide

**SLIIT PAF Assignment 2026**

This guide provides the minimum steps to run the Smart Campus application locally. For full documentation, architecture, API reference, and team contributions, see [README.md](README.md).

---

## Prerequisites

| Tool | Version |
|------|---------|
| Java | 21 |
| Node.js & npm | LTS recommended |
| PostgreSQL | 14+ |
| Google OAuth 2.0 credentials | Required for Google sign-in |

---

## 1. Clone the Repository

```bash
git clone https://github.com/Sthulnith/smart-campus.git
cd smart-campus
```

---

## 2. Configure Environment

Create a `.env` file in the project root:

```env
DB_URL=jdbc:postgresql://localhost:5432/smart_campus_db
DB_USERNAME=smartcampus
DB_PASSWORD=your_password

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8080
APP_FRONTEND_URL=http://localhost:3000
OAUTH2_REDIRECT_URL=http://localhost:3000/auth/callback

AUTH_RESET_DEMO_LINK=true
APP_SEED_DEMO_USERS=true
```

Create `frontend/.env`:

```env
REACT_APP_API_BASE_URL=http://localhost:8080/api
REACT_APP_BACKEND_BASE_URL=http://localhost:8080
```

---

## 3. Create PostgreSQL Database

```sql
CREATE DATABASE smart_campus_db;
CREATE USER smartcampus WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE smart_campus_db TO smartcampus;
```

---

## 4. Google OAuth Setup

In [Google Cloud Console](https://console.cloud.google.com/):

| Setting | Value |
|---------|-------|
| Authorized JavaScript origins | `http://localhost:3000`, `http://localhost:8080` |
| Authorized redirect URI | `http://localhost:8080/login/oauth2/code/google` |

---

## 5. Start the Backend

```bash
cd backend
./mvnw spring-boot:run
```

Backend: **http://localhost:8080**

---

## 6. Start the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

Frontend: **http://localhost:3000**

---

## 7. Sign In (Demo Accounts)

When `APP_SEED_DEMO_USERS=true`:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@test.com` | `Admin@123` |
| User | `user@test.com` | `User@123` |

Alternatively, use **Sign in with Google** on the login page.

---

## 8. Verify Core Features

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login as admin | Dashboard loads with admin navigation |
| 2 | Open **Facilities** | Resource list displayed |
| 3 | Create a booking (user) | Booking status = `PENDING` |
| 4 | Approve booking (admin) | Status changes to `APPROVED` |
| 5 | Create a support ticket | Ticket status = `OPEN` |
| 6 | View **Notifications** | Role-filtered announcements shown |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Database connection failed | Verify PostgreSQL is running and `DB_URL` credentials are correct |
| Google login redirect error | Confirm OAuth redirect URI matches exactly |
| 401 on API calls | Ensure frontend uses `withCredentials: true` (configured in `api.js`) |
| CORS errors | Check `FRONTEND_URL` matches the React dev server port |

---

## Project Links

| Resource | Location |
|----------|----------|
| Full documentation | [README.md](README.md) |
| License | [LICENSE](LICENSE) |
| Repository | https://github.com/Sthulnith/smart-campus |

---

**Smart Campus Platform — SLIIT PAF 2026**
