# Rocket Backend — Auth Module Spec

Status: draft (initial)
Scope: `backend/internal/modules/auth` + supporting migration, middleware, JWT.

This spec is the product contract for backend auth. The frontend contract is
fixed in `frontends/auth.flow.yaml` (LivingChronology v1.0) — backend must
satisfy those endpoint shapes. Logout is added here (not present in the
frontend yaml yet).

---

## 1. Goals

Provide HTTP endpoints under `/api/v1/auth/*` to support the frontend flows:

- `login` — exchange credentials for a JWT access token.
- `signup` — create a new user, return a JWT.
- `logout` — invalidate the current session/token (server-side blacklist).
- `me` — already exists under `auth.GET("/me")`, returns the authenticated
  user.
- `forgot-password / verify-otp / reset` — out of scope for the first slice;
  endpoints reserved but implemented later.

## 2. Identity model

The frontend uses a single field `email_or_phone` for login + signup. The
backend must accept either an email address or a phone number in that field
and resolve to a single user.

Field rules (server-side):

- `email_or_phone`: required, trimmed; if it contains `@` treat as email
  (lowercase before compare), otherwise treat as phone (digits + optional
  leading `+`, length 8–15).
- `password`: required, min length 6 (matches frontend `min_length: 6`).
- `user_name` (signup only): required, 1–64 chars, trimmed.

## 3. Data model delta

Extend `users` table (migration `0002_auth.sql`):

| column          | type        | notes                                     |
|-----------------|-------------|-------------------------------------------|
| id              | UUID PK     | existing                                  |
| email           | TEXT UNIQUE | existing, nullable now (one of email/phone required) |
| phone           | TEXT UNIQUE | new, nullable                             |
| user_name       | TEXT        | new, nullable initially, set on signup    |
| password_hash   | TEXT        | new, bcrypt                               |
| created_at      | TIMESTAMP   | existing                                  |

Constraint: `CHECK (email IS NOT NULL OR phone IS NOT NULL)`.

A token-blacklist table is **not** introduced in this slice. Logout uses a
Redis-backed deny-list keyed by JTI (see §5).

## 4. HTTP contract

All paths are under `/api/v1/auth`.

### 4.1 POST /login

Request:
```json
{ "email_or_phone": "user@example.com", "password": "secret123" }
```

Responses:

- `200`:
  ```json
  { "token": "<jwt>", "user": { "id": "...", "user_name": "...", "email": "...", "phone": "..." } }
  ```
- `400`: validation error `{ "message": "..." }`.
- `401`: invalid credentials `{ "message": "Email/số điện thoại hoặc mật khẩu không đúng" }`.

### 4.2 POST /signup

Request:
```json
{ "user_name": "alice", "email_or_phone": "alice@example.com", "password": "secret123" }
```

Responses:

- `201`: same shape as login `200`.
- `400`: validation error.
- `409`: `{ "message": "Tài khoản đã tồn tại" }` when email/phone in use.

### 4.3 POST /logout

Auth: `Authorization: Bearer <jwt>` required.

Responses:

- `204`: token's JTI added to Redis deny-list with TTL = remaining token
  lifetime.
- `401`: missing/invalid token (handled by middleware).

### 4.4 Existing GET /me

No contract change. Middleware must reject tokens whose JTI is in the
deny-list (added by this slice).

## 5. Token & session

- Algorithm: HS256, secret = `JWT_SECRET` env.
- Claims: `{ user_id, jti, exp, iat }`. `jti` is a new UUID per token.
- Default TTL: 7 days (configurable via `AUTH_TOKEN_TTL`, default
  `168h`).
- Deny-list: Redis key `auth:revoked:<jti>` with TTL = `exp - now`. The
  middleware checks Redis on every authenticated request; lookup miss = not
  revoked. On Redis outage, request proceeds (fail-open) and a warn log is
  emitted — documented trade-off; revisit if we add high-value endpoints.

## 6. Out of scope (this slice)

- Forgot password / OTP / reset endpoints (frontend yaml has them; backend
  ticket deferred to Phase 3).
- Refresh tokens / rotation.
- Email/SMS verification at signup.
- Rate-limit tuning for `/login` (default `RateLimit(120)` applies).

## 7. Security notes

- Password storage: bcrypt cost 12.
- `password` never logged; bind via Gin then zero-copy into hasher.
- Generic 401 message on login (no enumeration of email vs password
  mismatch).
- All endpoints rate-limited by existing `RateLimit` middleware.
- `JWT_SECRET` required at boot; `cmd/api` already loads it via config.
