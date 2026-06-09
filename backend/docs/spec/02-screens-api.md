# Rocket Backend — Screens API Spec

Status: draft (initial)
Scope: HTTP API for the 5 LivingChronology app screens extracted from Figma
(`docs/figma-refs/`). Builds on the auth contract in
[`00-project-spec.md`](00-project-spec.md).

This spec is the product contract for the non-auth modules
(`feed`, `friend`, `photo`/memory, `user`, `notification`), which today are
empty stubs. Screen references:

| Screen | File | Title | Primary module(s) |
|--------|------|-------|-------------------|
| 1 | `screen1-7-2.png` | Friends / Discovery / **My Pulse** | `friend`, `user`, `notification` |
| 2 | `screen2-7-140.png` | **Memory Journal** (Home) | `photo`/memory, `user` |
| 3 | `screen3-7-303.png` | Memory detail / single keepsake | `photo`/memory, `friend` |
| 4 | `screen4-8-411.png` | Camera / capture & upload | `photo`, `s3` |
| 5 | `screen5-9-464.png` | Profile & Settings | `user`, `auth` |

---

## 0. Conventions

- Base path: `/api/v1`. All endpoints below require
  `Authorization: Bearer <jwt>` unless marked **public**.
- Errors use the structured body from `internal/pkg/response`:
  `{ "code": "UPPER_SNAKE", "message": "<localized vi>" }` (Plans.md task 2.2).
- Pagination: cursor-based. List endpoints accept `?limit` (default 20,
  max 100) and `?cursor` (opaque), and return
  `{ "items": [...], "next_cursor": "<opaque|null>" }`.
- Timestamps: RFC 3339 UTC (`2024-10-17T08:30:00Z`).
- IDs: UUID v4 strings.
- The `me` shorthand resolves to the authenticated user (from the JWT
  `user_id`), so the client never sends its own id.

---

## 1. Data model delta

New migrations (proposed `0003_memories.sql` … `0006_settings.sql`). One
table block per concern; FKs reference `users(id)`.

### 1.1 `memories` — a dated journal entry (Screen 2/3)

| column        | type        | notes                                            |
|---------------|-------------|--------------------------------------------------|
| id            | UUID PK     |                                                  |
| user_id       | UUID FK     | owner                                            |
| title         | TEXT        | caption, e.g. "Memory at work"; nullable         |
| taken_at      | TIMESTAMPTZ | the day the memory belongs to (drives calendar)  |
| cover_photo_id| UUID FK     | nullable; the thumbnail shown on the calendar    |
| location      | TEXT        | nullable                                         |
| created_at    | TIMESTAMPTZ | default now()                                    |

Index: `(user_id, taken_at)` for month range scans.

### 1.2 `photos` — keepsakes attached to a memory (Screen 3/4)

| column     | type        | notes                                        |
|------------|-------------|----------------------------------------------|
| id         | UUID PK     |                                              |
| memory_id  | UUID FK     | nullable until attached                      |
| user_id    | UUID FK     | uploader                                     |
| s3_key     | TEXT        | object key in the bucket                     |
| width      | INT         | nullable                                     |
| height     | INT         | nullable                                     |
| created_at | TIMESTAMPTZ | default now()                                |

"Total Keepsakes" (Screen 2 stat) = count of `photos` for the user.

### 1.3 `friendships` — directed request → accepted (Screen 1)

| column     | type        | notes                                                   |
|------------|-------------|---------------------------------------------------------|
| id         | UUID PK     |                                                         |
| user_id    | UUID FK     | requester                                               |
| friend_id  | UUID FK     | target                                                  |
| status     | TEXT        | `pending` \| `accepted` \| `blocked`                    |
| created_at | TIMESTAMPTZ | default now()                                           |

Unique: `(user_id, friend_id)`. A friendship is mutual once `accepted`.

### 1.4 `user_presence` — "My Pulse" online state (Screen 1)

| column         | type        | notes                                  |
|----------------|-------------|----------------------------------------|
| user_id        | UUID PK FK  |                                        |
| last_active_at | TIMESTAMPTZ | updated on activity / WS heartbeat     |
| status_text    | TEXT        | nullable, e.g. "Sharing a moment…"     |

"Active now" = `last_active_at` within 5 min. "24 online" = count of
friends active now. Presence may be served from Redis (hot) with this table
as cold fallback; see §0 of `00-project-spec.md` for the Redis pattern.

### 1.5 `user_settings` — Screen 5 preferences

| column                | type    | notes                          |
|-----------------------|---------|--------------------------------|
| user_id               | UUID PK |                                |
| widget_settings       | JSONB   | opaque to BE, owned by FE      |
| notifications_enabled | BOOLEAN | default true                   |
| privacy               | JSONB   | e.g. `{ "profile": "friends" }`|

Profile fields (`user_name`, `email`, `phone`) already live on `users`
(see `0002_auth.sql`); Screen 5 adds `avatar_url` and `handle`:

`ALTER TABLE users ADD COLUMN avatar_url TEXT, ADD COLUMN handle TEXT UNIQUE;`

---

## 2. Screen 2 — Memory Journal (Home) · **primary for this branch**

The home screen is data-dense (calendar + stats + flashback). To keep mobile
round-trips low, expose one aggregate (BFF) endpoint plus granular ones.

### 2.1 GET /home  ·  aggregate for the home screen

Query: `?month=2024-10` (defaults to current month, user's tz via
`?tz=Asia/Ho_Chi_Minh`).

`200`:
```json
{
  "user": { "id": "...", "user_name": "Alex", "avatar_url": "https://..." },
  "month": "2024-10",
  "calendar": [
    { "date": "2024-10-01", "memory_count": 1, "cover_photo_url": "https://.../thumb.jpg" },
    { "date": "2024-10-05", "memory_count": 3, "cover_photo_url": "https://.../thumb.jpg" }
  ],
  "stats": { "month_memories": 12, "total_keepsakes": 248 },
  "flashback": {
    "memory_id": "...",
    "years_ago": 1,
    "title": "The city felt so alive that night.",
    "photo_url": "https://.../flashback.jpg",
    "taken_at": "2023-10-08T21:00:00Z"
  }
}
```
`flashback` is `null` when there is no memory on this day in prior years.

### 2.2 GET /memories  ·  list (calendar drill-down / month grid)

Query: `?month=2024-10` or `?from=...&to=...`, plus pagination.

`200`: `{ "items": [Memory], "next_cursor": null }` where `Memory` is:
```json
{
  "id": "...", "title": "Memory at work", "taken_at": "2024-10-17T08:30:00Z",
  "cover_photo_url": "https://.../thumb.jpg", "photo_count": 4, "location": null
}
```

### 2.3 GET /memories/stats

`200`: `{ "total_keepsakes": 248, "total_memories": 57 }` — drives the
header counters independent of the selected month.

---

## 3. Screen 3 — Memory detail (single keepsake)

### 3.1 GET /memories/{id}

`200`:
```json
{
  "id": "...", "title": "Memory at work", "taken_at": "2024-10-17T08:30:00Z",
  "location": null,
  "owner": { "id": "...", "user_name": "Alex" },
  "photos": [
    { "id": "...", "url": "https://.../full.jpg", "width": 1200, "height": 1600 }
  ],
  "shared_with": [ { "id": "...", "user_name": "Sasha" } ]
}
```
`404 MEMORY_NOT_FOUND` if missing or not visible to the caller.

### 3.2 PATCH /memories/{id}  ·  edit caption / cover

Request (partial): `{ "title": "...", "cover_photo_id": "...", "location": "..." }`
`200`: updated `Memory`. `403 FORBIDDEN` if not owner.

### 3.3 DELETE /memories/{id}

`204`. Cascades to its `photos` rows (and queues S3 object cleanup).

### 3.4 POST /memories/{id}/share  ·  "Invite Friends" to a memory

Request: `{ "friend_ids": ["...", "..."] }`
`200`: `{ "shared_with": [PublicUser] }`. Emits a `notification` to each
invited friend (§6).

---

## 4. Screen 4 — Camera (capture & upload)

Direct-to-S3 with a presigned URL keeps large image bytes off the API.

### 4.1 POST /photos/upload-url  ·  request a presigned PUT

Request: `{ "content_type": "image/jpeg", "byte_size": 1048576 }`
`200`:
```json
{ "photo_id": "...", "upload_url": "https://s3...&X-Amz-Signature=...", "s3_key": "u/<uid>/<photo_id>.jpg", "expires_in": 900 }
```
`400 FILE_TOO_LARGE` over the size cap; `400 UNSUPPORTED_MEDIA_TYPE` for
non-image content types. Creates a `photos` row in `pending` state.

### 4.2 POST /photos/{id}/commit  ·  finalize after the client PUTs to S3

Request (optional): `{ "width": 1200, "height": 1600 }`
`200`: `{ "id": "...", "url": "https://.../full.jpg" }`. Server HEADs the
object to confirm the upload before marking the row `ready`.

### 4.3 POST /memories  ·  create a memory from uploaded photos

Request:
```json
{ "title": "Memory at work", "taken_at": "2024-10-17T08:30:00Z",
  "photo_ids": ["...", "..."], "cover_photo_id": "...", "location": null }
```
`201`: the created `Memory` (§3.1 shape). `taken_at` defaults to now if
omitted. Attaches the given photos (`memory_id` set) and validates they
belong to the caller and are `ready`.

---

## 5. Screen 1 — Friends / Discovery / My Pulse

### 5.1 GET /friends/search  ·  top search bar

Query: `?q=elena` (min 1 char) + pagination.
`200`: `{ "items": [ { "id", "user_name", "avatar_url", "handle", "friendship_status": "none|pending|accepted" } ], "next_cursor": null }`

### 5.2 GET /friends/suggestions  ·  "Suggested Friends"

`200`:
```json
{ "items": [
  { "id": "...", "user_name": "Julian V.", "avatar_url": "https://...",
    "reason": { "type": "mutual", "count": 12 } },
  { "id": "...", "user_name": "Sasha R.", "avatar_url": "https://...",
    "reason": { "type": "followed_by_friends" } }
] }
```
`reason.type` is one of `mutual` (with `count`) | `followed_by_friends`,
matching the two subtitles in the design.

### 5.3 POST /friends/{id}/request  ·  "Add" button

`200`: `{ "friendship_status": "pending" }`.
`409 ALREADY_FRIENDS` if already accepted; `400 CANNOT_FRIEND_SELF`.

### 5.4 POST /friends/{id}/respond  ·  accept / decline an incoming request

Request: `{ "action": "accept" }` | `{ "action": "decline" }`
`200`: `{ "friendship_status": "accepted" | "none" }`.

### 5.5 DELETE /friends/{id}  ·  remove / cancel

`204`.

### 5.6 POST /friends/invite  ·  "Sync Your World" / "Invite Friends" CTA

Request: `{ "email_or_phone": "..." }` (reuses the auth identifier rules).
`200`: `{ "status": "sent" }`. Sends an out-of-band invite (email/SMS via the
same Sender seam reserved in Phase 3) and is idempotent per identifier.

### 5.7 GET /friends/pulse  ·  "My Pulse" activity list

`200`:
```json
{
  "online_count": 24,
  "items": [
    { "user": { "id": "...", "user_name": "Elena Gil", "avatar_url": "https://..." },
      "presence": "active_now", "status_text": "Active now", "last_active_at": "2024-10-17T08:31:00Z" },
    { "user": { "id": "...", "user_name": "Maya Brooks", "avatar_url": "https://..." },
      "presence": "recent", "status_text": "2H ago", "last_active_at": "2024-10-17T06:30:00Z" },
    { "user": { "id": "...", "user_name": "Chloe Sterling", "avatar_url": "https://..." },
      "presence": "active_now", "status_text": "Sharing a moment…", "last_active_at": "2024-10-17T08:30:00Z" }
  ]
}
```
`presence`: `active_now` (≤5 min) | `recent` (≤24 h) | `offline`. Live
updates ride the existing `/ws` channel; this endpoint is the initial load.

---

## 6. Screen 5 — Profile & Settings

### 6.1 GET /me  ·  profile header (extends existing /me)

`200`:
```json
{ "id": "...", "user_name": "Alex Rivera", "handle": "arivera",
  "email": "...", "phone": null, "avatar_url": "https://..." }
```

### 6.2 PATCH /me  ·  edit profile (the pencil on the avatar)

Request (partial): `{ "user_name": "...", "handle": "...", "avatar_url": "..." }`
`200`: updated profile. `409 HANDLE_TAKEN` on handle collision.
Avatar upload reuses the §4.1/4.2 presigned flow, then sends the resulting
`url` here.

### 6.3 GET /me/share  ·  "Share Profile" (QR)

`200`: `{ "handle": "arivera", "profile_url": "https://app.../u/arivera", "qr_svg": "<svg...>" }`
(QR may be rendered client-side from `profile_url`; `qr_svg` optional.)

### 6.4 GET /me/settings  ·  Preferences section

`200`:
```json
{ "widget_settings": { ... }, "notifications_enabled": true,
  "privacy": { "profile": "friends" } }
```

### 6.5 PATCH /me/settings  ·  Widget / Notifications / Privacy toggles

Request (partial): any subset of the §6.4 fields. `200`: updated settings.

### 6.6 POST /auth/logout  ·  "Log Out"

Already specified — `00-project-spec.md` §4.3. `204`.

### 6.7 DELETE /me  ·  "Delete Account"

Request: `{ "confirm": true }` (guard against accidental taps).
`204`. Soft-deletes the user, revokes active tokens (Redis deny-list by
`user_id`), and queues async purge of memories/photos/friendships.

---

## 7. Notifications (cross-screen support)

Backing the friend requests (§5.3), memory shares (§3.4), and the bell on
Screen 5. The `notification` module already has a `consumer` + `service`.

- `GET /notifications` — list `{ id, type, actor, target, read, created_at }`.
- `POST /notifications/read` — `{ "ids": [...] }` → `204`.
- Push delivery rides `/ws`; this REST surface is the initial load + mark-read.

---

## 8. Route registration map

Each module's `RegisterRoutes(r *gin.RouterGroup)` is mounted under the
`protected` group in `internal/server/http.go` (JWT required):

```
protected.Group("")  →
  /home, /memories*           (photo/memory module)
  /photos*                    (photo module)
  /friends*                   (friend module)
  /notifications*             (notification module)
  /me*                        (user module)
```
`/auth/*` stays in the auth module (public + protected split as today).

---

## 9. Out of scope (this slice)

- Comments / reactions on memories (chat icons on Screens 1–3 imply a
  messaging module — separate spec).
- Video capture (Screen 4 PHOTO/VIDEO toggle) — photo-only first.
- Real-time presence fan-out internals (WS protocol) — separate spec; this
  doc only fixes the REST initial-load shapes.
- The "Sync Your World" external invite transport (email/SMS) shares the
  Phase 3 Sender seam and is stubbed until a provider is chosen.

## 10. Suggested task breakdown (for Plans.md)

1. `photo`/memory module: migrations `0003`, repo, service, handlers for
   §2–§4 (home aggregate first — this branch).
2. `friend` module: migrations `0004`+`0005` (friendships, presence),
   handlers §5.
3. `user` module: migration `0006` (settings) + `users` avatar/handle
   columns, handlers §6.
4. `notification` REST surface §7 on top of the existing consumer.
5. Wire all `RegisterRoutes` in `internal/app/app.go` + `http.go`.
```
