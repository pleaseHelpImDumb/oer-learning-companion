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

This is a mono-repo. As such, to install, clone the repo and then run `npm install` in both `\backend` and `\frontend`. 

#### Backend:
```bash
git clone https://github.com/pleaseHelpImDumb/oer-learning-companion
cd oer-learning-companion\backend
npm install
```

### Environment Variables

Copy the example env file and fill in your values:

#### Backend:

| Variable          | Description                                                 |
| ----------------- | ----------------------------------------------------------- |
| `DATABASE_URL`    | PostgreSQL connection string                                |
| `JWT_SECRET`      | Secret for session cookie signing                           |
| `PORT`            | Port to run the server on (default: 3001)                   |
| `GEMINI_API_KEY`  | API key for AI chat features                                |
| `GEMINI_AI_MODEL` | Gemini model name to use (e.g., `gemini-pro`)               |
| `SMTP_HOST`       | SMTP server host (e.g., `smtp.gmail.com`)                   |
| `SMTP_PORT`       | SMTP server port (e.g., `587` or `465`)                     |
| `SMTP_USER`       | SMTP username/login                                         |
| `SMTP_PASS`       | SMTP password or app-specific password                      |
| `EMAIL_FROM`      | Default “from” email address (e.g., `no-reply@yourapp.com`) |


### Running Locally

```bash
# Generate prisma client
npx prisma generate

# Start the dev server
npm run dev
```

The API will be available at `http://localhost:3001`.

---

## API

Full API documentation is available in [`api_doc.html`](https://pleasehelpimdumb.github.io/oer-learning-companion/api_doc.html).

Base URL: `https://api.achievo.academy`

Authentication is cookie-based. Log in via `POST /login` to receive a session cookie.
