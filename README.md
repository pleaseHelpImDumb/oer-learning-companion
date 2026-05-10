# [Achievo.Academy](https://achievo.academy/)

A gamified study session tracker with AI-powered learning assistance, wellness check-ins, and progress analytics.

## Features

- **Study Sessions** — Start, pause, resume, cancel, and complete timed study sessions
- **AI Chat Assistant** — Ask questions during sessions with configurable support levels (hint, guided, or full scaffolding)
- **Wellness Check-ins** — Periodic check-ins to monitor how you're feeling during study
- **Tokens & Rewards** — Earn tokens for studying, spend them on mini-games during breaks
- **Stats & Streaks** — Track total study time, session history, streaks, and weekly progress
- **Badges** — Unlock achievements based on milestones

---

## Tech Stack

#### Back-end:
> _Node.js/Express.js, PostgreSQL_

---

## Getting Started

### Prerequisites

- Node.js
- npm or yarn
- PostgreSQL (or SQLite to run fully local)

### Installation

This is a mono-repo. Clone the repository, then install dependencies separately in `backend` and `frontend`.

```bash
git clone https://github.com/pleaseHelpImDumb/oer-learning-companion.git
cd oer-learning-companion
```

---

### Environment Variables

Before running either service, copy the example env file and fill in your values.

#### Backend (`/backend/.env`)

> Only `DATABASE_URL`, `JWT_SECRET`, and `FRONTEND_URL` are required for a basic install.

| Variable          | Required | Description                                                  |
| ----------------- | -------- | ------------------------------------------------------------ |
| `DATABASE_URL`    | ✅       | PostgreSQL connection string                                 |
| `JWT_SECRET`      | ✅       | Secret used for session cookie signing                       |
| `FRONTEND_URL`    | ✅       | URL of the frontend (e.g. `http://localhost:3000`)           |
| `PORT`            |          | Port to run the server on (default: `3001`)                  |
| `GEMINI_API_KEY`  |          | API key for AI chat features                                 |
| `GEMINI_AI_MODEL` |          | Gemini model name to use (e.g. `gemini-pro`)                 |
| `SMTP_HOST`       |          | SMTP server host (e.g. `smtp.gmail.com`)                     |
| `SMTP_PORT`       |          | SMTP server port (e.g. `587` or `465`)                       |
| `SMTP_USER`       |          | SMTP username / login                                        |
| `SMTP_PASS`       |          | SMTP password or app-specific password                       |
| `EMAIL_FROM`      |          | Default "from" address (e.g. `no-reply@yourapp.com`)         |

#### Frontend (`/frontend/.env`)

| Variable                 | Description                                     |
| ------------------------ | ----------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | Public API URL used by the browser (e.g. `http://localhost:3001`) |
| `API_BASE_URL`           | API URL used by Next.js server-side (e.g. `http://localhost:3001`) |

---

### Running Locally

#### Backend

```bash
cd backend
npm install
npx prisma generate
npm run dev
```

The API will be available at `http://localhost:3001`.

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## API

Full API documentation is available in [`api_doc.html`](https://pleasehelpimdumb.github.io/oer-learning-companion/api_doc.html).

Base URL: `https://api.achievo.academy`

Authentication is cookie-based. Log in via `POST /login` to receive a session cookie.
