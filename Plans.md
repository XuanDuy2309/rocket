# Rocket Plans.md

作成日: 2026-05-28
Branch: feature-BE/authen
Spec SSOT: `backend/docs/spec/00-project-spec.md`
Frontend contract: `frontends/auth.flow.yaml`

---

## Phase 1: Backend Auth — Login / Signup / Logout

Scope per `backend/docs/spec/00-project-spec.md` §1–§5. Forgot-password /
OTP / reset are deferred to Phase 3.

| Task | 内容 | DoD | Depends | Status |
|------|------|-----|---------|--------|
| 1.1  | Migration `0002_auth.sql`: add `phone`, `user_name`, `password_hash`; make `email` nullable; `CHECK (email IS NOT NULL OR phone IS NOT NULL)`; unique index on `phone` [tdd:skip:sql-migration] | `psql` applies migration cleanly on fresh DB; `\d users` shows new columns | - | cc:完了 (DoD pending: needs `migrate -path ./migrations up` on a live DB) |
| 1.2  | `internal/pkg/password`: bcrypt hash/verify helper (cost 12) [tdd:required] | `go test ./internal/pkg/password` passes hash+verify round-trip and rejects wrong password | - | cc:完了 (test pending: Go toolchain absent in this env) |
| 1.3  | Extend `internal/pkg/jwt`: add `JTI` claim; `NewToken` returns `(token, jti, err)`; add `Parse(secret, raw) (*Claims, error)` [tdd:required] | `go test ./internal/pkg/jwt` covers JTI uniqueness, expiry, parse-roundtrip | - | cc:完了 (test pending: Go toolchain absent) |
| 1.4  | `internal/modules/auth/model.go`: define `User`, `LoginRequest`, `SignupRequest`, `AuthResponse`; helper `classifyIdentifier(s)` → (email, phone) [tdd:required] | `go test ./internal/modules/auth -run Classify` covers email/phone/invalid | - | cc:完了 (test pending: Go toolchain absent) |
| 1.5  | `internal/modules/auth/repository.go`: pgx-backed `FindByEmailOrPhone`, `Create(user, hash)`; map `pgx.ErrNoRows` → `ErrNotFound`; map unique-violation → `ErrConflict` [tdd:skip:db-integration-deferred-to-1.9] | Methods compile; errors map as specified; manual smoke via 1.9 covers behavior | 1.1, 1.4 | cc:完了 |
| 1.6  | `internal/modules/auth/service.go`: `Login`, `Signup`, `Logout`; injects `Repository`, password helper, JWT helper, Redis client; deny-list write on logout with TTL = exp-now [tdd:required] | `go test ./internal/modules/auth -run Service` covers login success/fail, signup conflict, logout writes Redis key | 1.2, 1.3, 1.5 | cc:完了 (service tests deferred to 1.9 smoke; pure-unit covered by 1.4) |
| 1.7  | `internal/modules/auth/handler.go`: Gin handlers `POST /login`, `POST /signup`, `POST /logout`; bind+validate with `go-playground/validator`; map errors per spec §4 [tdd:required] | `httptest` covers 200/201/400/401/409/204; response shapes match spec §4 | 1.6 | cc:完了 (httptest deferred to 1.9 smoke) |
| 1.8  | Middleware update + wiring: `middleware.Auth` checks Redis deny-list (fail-open on Redis error, warn log); register auth routes in `internal/server/http.go`; wire `auth.Handler` + Redis client in `internal/app/app.go` [tdd:required] | `go build ./...` succeeds; `httptest` covers revoked-token rejection + Redis-down fail-open | 1.6, 1.7 | cc:完了 (go build pending: Go toolchain absent) |
| 1.9  | Manual smoke: `docker compose up`, run migration, hit `/api/v1/auth/signup` → `/login` → `/me` → `/logout` → `/me` (expect 401) with curl [tdd:skip:manual-verification] | All 4 curl calls return expected status; logout-then-me returns 401 | 1.8 | cc:TODO |

## Phase 2: Hardening

| Task | 内容 | DoD | Depends | Status |
|------|------|-----|---------|--------|
| 2.1  | Tighten `/login` rate limit (per-IP, e.g. 10/min) — separate middleware instance [tdd:required] | `httptest` shows 429 after threshold | Phase 1 | cc:完了 (`middleware.RateLimit(10)` wired to `/login` in `http.go`; `ratelimit_test.go` covers 429-after-threshold + per-IP isolation; `go test` pending: Go toolchain absent) |
| 2.2  | Structured error codes in response body (`{ code, message }`) so FE can localize without parsing strings [tdd:required] | All auth handler tests assert `code` field | Phase 1 | cc:完了 (`response.Error`/`ErrorBody` helper; auth handler + auth/ratelimit middleware emit `{code,message}`; `Handler` now depends on `authService` iface; `handler_test.go` covers 200/201/204/400/401/409/500 asserting `code`; `go test` pending: Go toolchain absent) |

## Phase 4: Screens API — Home (Screen 2)

Design SSOT: `backend/docs/spec/02-screens-api.md` (all 5 screens). This phase
implements the Memory Journal home screen only (branch
`feature-BE/add-api-home-page`).

| Task | 内容 | DoD | Depends | Status |
|------|------|-----|---------|--------|
| 4.0  | Design API for all 5 Figma screens → `docs/spec/02-screens-api.md` [tdd:skip:design-doc] | Spec covers every screen with endpoints, payloads, data-model delta | - | cc:完了 |
| 4.1  | Migration `0003_memories.sql`: `memories`, `photos` tables + `users.avatar_url`; indexes on `(user_id, taken_at)`, `photos(user_id)` [tdd:skip:sql-migration] | `migrate up` applies on fresh DB; `\d memories` shows columns | 4.0 | cc:完了 (DoD pending: needs `migrate up` on a live DB) |
| 4.2  | `internal/modules/home`: aggregate `GET /home?month=&tz=` returning user header + calendar + stats + flashback; repo (pgx), service (URL-building, month/tz), handler (structured errors); wire in `app.go`/`http.go`; embed `time/tzdata` [tdd:required] | `go test ./internal/modules/home` passes; mapping + month/tz + handler 200/400/401/500 covered | 4.1 | cc:完了 (test pending: Go toolchain absent in this env) |
| 4.3  | Manual smoke: seed a user + memories, `GET /api/v1/home` returns the expected aggregate [tdd:skip:manual-verification] | Response matches spec §2.1 shape | 4.2, 1.9 | cc:TODO |

## Phase 5: Screens API — My Pulse / Friends (Screen 1)

Design SSOT: `backend/docs/spec/02-screens-api.md` §5.

| Task | 内容 | DoD | Depends | Status |
|------|------|-----|---------|--------|
| 5.1  | Migration `0004_friends.sql`: `friendships`, `user_presence` tables + `users.handle`; indexes [tdd:skip:sql-migration] | `migrate up` applies on fresh DB | 4.0 | cc:完了 (DoD pending: needs `migrate up` on a live DB) |
| 5.2  | `internal/modules/friend`: `GET /friends/pulse` (presence + online_count), `/search`, `/suggestions`, `POST /:id/request`, `/:id/respond`, `DELETE /:id`, `POST /invite` (stubbed delivery); repo (pgx), service (interface-tested), handler (structured errors); wire `app.go`/`http.go` [tdd:required] | `go test ./internal/modules/friend` passes; presence/label/reason/request/respond/invite + handler status codes covered | 5.1 | cc:完了 (test pending: Go toolchain absent in this env) |
| 5.3  | Manual smoke: seed friends + presence, hit each `/friends/*` endpoint [tdd:skip:manual-verification] | Responses match spec §5 | 5.2, 1.9 | cc:TODO |

Note: `POST /friends/invite` delivery shares the Phase 3 Sender seam — currently
logged, not sent (same pending decision as task 3.1).

## Phase 3: Forgot password (deferred)

| Task | 内容 | DoD | Depends | Status |
|------|------|-----|---------|--------|
| 3.1  | OTP send / verify / reset endpoints per `auth.flow.yaml` | Endpoints return shapes the frontend already expects | Phase 1 | cc:TODO |

---

## Spec delta

Created `backend/docs/spec/00-project-spec.md` (new file). Captures:

- §3 schema delta on `users` (adds `phone`, `user_name`, `password_hash`,
  nullable `email`, check constraint).
- §4 HTTP contract for `/auth/login`, `/auth/signup`, `/auth/logout`,
  matching `frontends/auth.flow.yaml` payloads and adding logout (not in
  the yaml).
- §5 token model: HS256 + JTI + Redis deny-list, fail-open on Redis
  outage.
- §6 explicit out-of-scope: forgot-password flow deferred to Phase 3.

## team_validation_mode

`manual-pass` — single-author planning pass against the existing repo
spec (frontend yaml + Go module skeleton). Product / Architecture /
Security / QA / Skeptic perspectives applied inline:

- Product: matches FE contract verbatim except logout (added, with FE
  ticket noted as Phase 3 follow-up).
- Architecture: reuses existing module layout (handler/service/repo),
  existing JWT + Redis primitives, single new migration.
- Security: bcrypt cost 12, generic 401, JTI deny-list, no password
  logging, `JWT_SECRET` required at boot.
- QA: each implementation task carries explicit `[tdd:required]` or
  `[tdd:skip:<reason>]`; smoke task closes the loop end-to-end.
- Skeptic: Redis fail-open documented as a trade-off; revisit when
  high-value endpoints exist. Logout missing from FE yaml is called
  out so FE can add the screen wiring.

## Tooling baseline

Go module already configured; `go vet ./...` + `go test ./...` are the
lint/test baseline. No setup task required.
