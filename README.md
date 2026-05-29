# NoteBase — Full-Stack Notes Application

A full-stack web application for creating, managing, and organizing personal notes. Built with the MERN stack, featuring user authentication, rich text editing, email verification, and code quality tooling.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Redux Toolkit, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT (Access + Refresh Tokens), Google OAuth |
| Logging | Pino Logger |
| Testing | Mocha/Chai (backend), Vitest (frontend) |
| Code Quality | SonarQube (local via Docker) |

---

## Features

- **Authentication** — Sign up, login, logout, Google OAuth, JWT refresh tokens, remember me
- **Email Verification** — Verification email on signup, resend option
- **Password Reset** — Forgot/reset password via email link
- **Note Management** — Create, edit, delete notes with rich text editor (ReactQuill)
- **Tags** — Add and filter notes by tags
- **Search & Sort** — Search notes by title/content, sort by date or title
- **Trash** — Soft delete, restore, or permanently delete notes
- **Export** — Export individual notes as PDF; export all notes as CSV or JSON
- **Import** — Import notes in bulk from CSV or JSON files
- **Dark Mode** — Full light/dark theme support
- **Logging** — HTTP requests, auth events, and errors logged via Pino

---

## Project Structure

```
mern-notes-app/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── utils/
│   │   └── server.js
│   ├── test/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── setup.js
│   └── sonar-project.properties
└── frontend/
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   ├── features/
    │   ├── services/
    │   └── api/
    ├── src/features/__tests__/
    ├── src/components/__tests__/
    ├── src/services/__tests__/
    └── sonar-project.properties
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/your-username/mern-notes-app.git
cd mern-notes-app
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/notebase
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend setup
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` folder:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

App runs at **http://localhost:5173**

---

## Running Tests

### Backend tests (Mocha/Chai)
```bash
cd backend
npm test
```

### Backend tests with coverage
```bash
cd backend
npm run test:coverage
```

### Frontend tests (Vitest)
```bash
cd frontend
npm test
```

### Frontend tests with coverage
```bash
cd frontend
npm run test:coverage
```

---

## SonarQube (Code Quality)

### Start SonarQube with Docker
```bash
docker run -d --name sonarqube -p 9000:9000 sonarqube:community
```

Open **http://localhost:9000** — login with `admin / admin`, change the password when prompted.

Create two projects in the UI with keys `notebase-backend` and `notebase-frontend`, generate a token, and add it to both `sonar-project.properties` files.

### Run analysis
```bash
# Backend
cd backend && npm run test:coverage && sonar

# Frontend
cd frontend && npm run test:coverage && sonar
```

View results at **http://localhost:9000**

---

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/signup` | Register new user |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/logout` | Logout |
| GET | `/api/v1/auth/verify-email` | Verify email |
| POST | `/api/v1/auth/forgot-password` | Request password reset |
| POST | `/api/v1/auth/reset-password` | Reset password |
| GET | `/api/v1/notes` | Get all notes |
| POST | `/api/v1/notes` | Create a note |
| PUT | `/api/v1/notes/:id` | Update a note |
| DELETE | `/api/v1/notes/:id` | Trash a note |
| GET | `/api/v1/notes/trash` | Get trashed notes |
| PUT | `/api/v1/notes/restore/:id` | Restore a note |
| DELETE | `/api/v1/notes/permanent/:id` | Permanently delete |
| POST | `/api/v1/notes/import`	| Import notes from CSV/JSON |
| GET | `/api/v1/notes/export`	| Export all notes |

---
