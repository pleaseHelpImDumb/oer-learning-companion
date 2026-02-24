
# OER Learning Companion - API Documentation

## Base URL

- **Development:** `http://localhost:3000`
- **Production:** `https://api.oer-companion.com` (TBD)

## Authentication

This API uses **JWT tokens stored in httpOnly cookies** with **CSRF protection**.

### How Authentication Works:

1. **Register or Login** → Receive JWT cookie (automatic) + CSRF token (in response body)
2. **Store CSRF token** in localStorage/memory
3. **For protected routes** → Include `X-CSRF-TOKEN` header with all POST/PUT/DELETE/PATCH requests

### Headers for Protected Routes:

```
Content-Type: application/json
X-CSRF-TOKEN: <your_csrf_token>
```

**Note:** The JWT cookie is sent automatically by the browser. You don't need to manually include it.

---

## Endpoints

### Health Check

Check if the API server is running.

**Endpoint:** `GET /health`

**Authentication Required:** No

**Request Body:** None

**Success Response (200 OK):**

```json
{
  "status": "ok"
}
```

**Example Request:**

```bash
curl http://localhost:3000/health
```

---

### 1. Register

Creates a new user account.

**Endpoint:** `POST /users/register`

**Authentication Required:** No

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Validation Rules:**
- `name`: String, 2-50 characters, required
- `email`: Valid email format, required, must be unique
- `password`: String, minimum 6 characters, required

**Success Response (201 Created):**

```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "csrfToken": "abc123xyz...",
  "message": "Welcome, John Doe! Your account has been registered."
}
```

**Side Effect:** Sets `jwt` cookie (httpOnly, 3 hours expiration)

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | `"name" is required` | Missing or invalid name |
| 400 | `"email" must be a valid email` | Invalid email format |
| 400 | `"password" length must be at least 6 characters` | Password too short |
| 409 | `User already exists!` | Email already registered |

**Example Request:**

```bash
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

---

### 2. Login

Authenticates a user and creates a session.

**Endpoint:** `POST /users/login`

**Authentication Required:** No

**Request Body:**

```json
{
  "identity": "john@example.com",
  "password": "password123"
}
```

**Field Details:**
- `identity`: Can be either **email** OR **username** (string, required)
- `password`: User's password (string, required)

**Success Response (200 OK):**

```json
{
  "message": "Log-in success!",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe"
  },
  "csrfToken": "xyz789abc..."
}
```

**Side Effect:** Sets `jwt` cookie (httpOnly, 3 hours expiration)

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | `"identity" is required` | Missing identity field |
| 400 | `"password" is required` | Missing password field |
| 401 | `Invalid credentials` | User not found or password incorrect |
| 401 | `Invalid password` | Password doesn't match |

**Example Request:**

```bash
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "identity": "john@example.com",
    "password": "password123"
  }'
```

---

### 3. Logout

Logs out the current user by clearing the session cookie.

**Endpoint:** `POST /users/logout`

**Authentication Required:** Yes (JWT cookie + CSRF token)

**Request Headers:**

```
X-CSRF-TOKEN: <your_csrf_token>
```

**Request Body:** None

**Success Response (200 OK):**

```json
{
  "message": "Logged out"
}
```

**Side Effect:** Clears `jwt` cookie

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | `Authentication required` | No JWT cookie present |
| 401 | `Invalid or expired token` | JWT verification failed |

**Example Request:**

```bash
curl -X POST http://localhost:3000/users/logout \
  -H "X-CSRF-TOKEN: your_csrf_token_here" \
  --cookie "jwt=your_jwt_token_here"
```

---

### 4. Forgot Password

Initiates password reset process by sending a reset link to the user's email.

**Endpoint:** `POST /users/forgot-password`

**Authentication Required:** No

**Request Body:**

```json
{
  "email": "john@example.com"
}
```

**Success Response (200 OK):**

```json
{
  "message": "If that email exists, a reset link has been sent"
}
```

**Note:** For security reasons, this endpoint always returns the same success message, regardless of whether the email exists in the database. This prevents email enumeration attacks.

**Side Effect:** 
- If email exists: Sends password reset email with token link
- Token expires in 30 minutes
- Updates `resetPasswordToken` and `resetPasswordExpires` in database

**Email Contains:**
- Reset link: `${FRONTEND_URL}/reset-password?token=<reset_token>`

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | `"email" is required` | Missing email field |
| 400 | `"email" must be a valid email` | Invalid email format |

**Example Request:**

```bash
curl -X POST http://localhost:3000/users/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

---

## Response Format Standards

### Success Response Structure:

```json
{
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response Structure:

```json
{
  "error": "Error message describing what went wrong"
}
```

---

## Common HTTP Status Codes

| Code | Meaning | When It's Used |
|------|---------|----------------|
| 200 | OK | Successful GET, PUT, PATCH, DELETE |
| 201 | Created | Successful POST that creates a resource |
| 400 | Bad Request | Validation error or malformed request |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but not allowed |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists (e.g., duplicate email) |
| 500 | Internal Server Error | Server error |

---

## Cookie Details

### JWT Cookie:

- **Name:** `jwt`
- **Type:** httpOnly (cannot be accessed by JavaScript)
- **Expiration:** 3 hours
- **SameSite:** strict
- **Secure:** true (production only, HTTPS required)

### Contents (encrypted):

```json
{
  "userId": 1,
  "email": "john@example.com",
  "csrfToken": "xyz789...",
  "iat": 1645564800,
  "exp": 1645575600
}
```

---

## CSRF Token Usage

### When to Include CSRF Token:

**Required for these HTTP methods:**
- POST
- PUT
- PATCH
- DELETE

**NOT required for:**
- GET requests
- Public endpoints (register, login, forgot-password)

### How to Use:

1. After login/register, save the `csrfToken` from response:
   ```javascript
   localStorage.setItem('csrfToken', response.csrfToken);
   ```

2. Include in protected requests:
   ```javascript
   fetch('/api/auth/logout', {
     method: 'POST',
     headers: {
       'X-CSRF-TOKEN': localStorage.getItem('csrfToken')
     },
     credentials: 'include' // Important! Sends cookies
   });
   ```

---

## Environment Variables

Backend requires these environment variables:

```bash
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="your_secret_key_here"

# Email (for password reset)
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your_app_password"
FRONTEND_URL="http://localhost:5173"

# AI
GEMINI_API_KEY="your_gemini_key"

# Server
PORT=3000
NODE_ENV=development
```

---

## Testing with Postman

### Setup:

1. **Create Environment** with variables:
   - `baseUrl`: `http://localhost:3000`
   - `csrfToken`: (will be set automatically)

2. **Auto-save CSRF token** after login/register:
   - Go to login request → Tests tab
   - Add script:
     ```javascript
     pm.environment.set("csrfToken", pm.response.json().csrfToken);
     ```

3. **Use CSRF token** in protected routes:
   - Headers tab → Add: `X-CSRF-TOKEN: {{csrfToken}}`

### Test Flow:

```
1. GET /health → Check server is running
2. POST /users/register → Get csrfToken
3. POST /users/logout (with CSRF header) → Success
4. POST /users/login → Get new csrfToken
5. POST /users/forgot-password → Check email
```

---

## Future Endpoints (Coming Soon)

### Chat with AI
- `POST /api/chat` - Send message to AI tutor

### Study Goals
- `POST /api/goals` - Create study goal
- `GET /api/goals` - Get user's study goals
- `PUT /api/goals/:id` - Update study goal
- `DELETE /api/goals/:id` - Delete study goal

### Study Sessions
- `POST /api/sessions` - Start study session
- `POST /api/sessions/:id/break` - Take a break
- `POST /api/sessions/:id/end` - End session

---

## Support

For questions or issues:
- Backend Developer: [Your Name]
- Repository: https://github.com/pleaseHelpImDumb/oer-learning-companion

Last Updated: February 18, 2025
