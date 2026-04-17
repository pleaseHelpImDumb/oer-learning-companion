# API Documentation
(Generated with Claude Sonnet 4.6)
> All routes require JWT authentication via `httpOnly` cookie unless marked **Public**.
> Protected routes also require a valid CSRF token in the request header.

---

## Auth / Users — `/api/users`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | Public | Register a new user. Returns JWT cookie + CSRF token. |
| POST | `/login` | Public | Login with email/username + password. Returns JWT cookie + CSRF token. |
| POST | `/logout` | Protected | Clears the JWT cookie. |
| POST | `/forgot-password` | Public | Sends a password reset email if the account exists. |
| POST | `/reset-password` | Public | Resets password using a valid reset token. |
| POST | `/onboard` | Protected | Completes onboarding (avatar, quote, year, major, track, etc.). |
| GET | `/me` | Protected | Returns current user profile, badges, and settings. |
| POST | `/break` | Protected | Increments the user's break count in stats. |
| GET | `/stats` | Protected | Returns weekly and lifetime study stats. |

### Request Bodies

**POST /register**
```json
{ "username": "string", "email": "string", "password": "string" }
```

**POST /login**
```json
{ "identity": "email or username", "password": "string" }
```

**POST /forgot-password**
```json
{ "email": "string" }
```

**POST /reset-password**
```json
{ "token": "string", "newPassword": "string" }
```

**POST /onboard**
```json
{
  "favoriteQuote": "string",
  "avatarUrl": "string",
  "checkInIntervalMinutes": "number",
  "trackId": "number",
  "nickname": "string",
  "yearLevel": "1–4",
  "major": "string"
}
```

---

## Study Sessions — `/api/sessions`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | Protected | Start a new study session. Fails if one is already active. |
| GET | `/active` | Protected | Get the current active/paused session with live time and token calculations. Auto-cancels sessions older than 12 hours. |
| POST | `/:id/pause` | Protected | Pause an active session. |
| POST | `/:id/resume` | Protected | Resume a paused session; accumulates paused time. |
| POST | `/:id/complete` | Protected | End a session, calculate duration, update stats, and award badges. |
| POST | `/:id/cancel` | Protected | Cancel a session; records study time but skips badge logic. |
| GET | `/:id/notes` | Protected | Get notes for a session. |
| PATCH | `/:id/notes` | Protected | Set/update notes for a session. |
| POST | `/:id/wellness` | Protected | Log a wellness check-in for a session. |
| POST | `/token/spend` | Protected | Spend 1 token (earned per 5 study minutes) to unlock a mini-game. |

### Session Statuses
`ACTIVE` → `PAUSED` → `ACTIVE` → `COMPLETED` or `CANCELLED`

### Token System
- Tokens are earned at **1 token per 5 minutes** of study time.
- Tokens are calculated live from `startTime` minus paused time.
- Spending a token costs **1 token** and is used for mini-games.

### Request Bodies

**POST /sessions** — no body required.

**POST /:id/wellness**
```json
{ "feelingGood": "boolean", "helpChosen": "boolean" }
```

**PATCH /:id/notes**
```json
{ "sessionNotes": "string" }
```

---

## AI Chat — `/api/ai`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/chat` | Protected | Send a message to the AI tutor. Requires an active or paused session. |

### Request Body

**POST /chat**
```json
{
  "message": "string",
  "supportLevel": "1 | 2 | 3"
}
```

### Support Levels
| Level | Name | Description |
|-------|------|-------------|
| 1 | Light Hint | 3-line response: concept, formula, and a guiding hint. |
| 2 | Guided Explanation | 4-line response: concept, formula, hint, and a field-relevant example. |
| 3 | Full Scaffolding | Full step-by-step teaching response with analogy and comprehension check. |

### Notes
- The AI only responds to course-related (OER/Lumen OHM) content.
- Conversation history is scoped to the current session (last 10 messages).
- Each chat call increments the session's `numAiInteractions` counter.

---

## Error Responses

All errors return JSON in the format:
```json
{ "error": "description of the error" }
```

Common status codes: `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`, `500 Internal Server Error`.
