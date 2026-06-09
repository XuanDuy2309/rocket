package friend

import (
	"context"
	"crypto/rand"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Row types carry raw avatar keys; the service turns keys into URLs.
type searchRow struct {
	ID        string
	UserName  *string
	AvatarURL *string
	Handle    *string
	Status    string
}

type suggestionRow struct {
	ID        string
	UserName  *string
	AvatarURL *string
	Mutual    int
}

type pulseRow struct {
	ID           string
	UserName     *string
	AvatarURL    *string
	StatusText   *string
	LastActiveAt *time.Time
}

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

const searchQuery = `
SELECT u.id, u.user_name, u.avatar_url, u.handle,
  COALESCE((
    SELECT f.status FROM friendships f
    WHERE (f.user_id = $1 AND f.friend_id = u.id) OR (f.user_id = u.id AND f.friend_id = $1)
    ORDER BY (f.status = 'accepted') DESC
    LIMIT 1
  ), 'none') AS friendship_status
FROM users u
WHERE u.id <> $1 AND (u.user_name ILIKE $2 OR u.handle ILIKE $2)
ORDER BY u.user_name NULLS LAST, u.id
LIMIT $3`

func (r *Repository) Search(ctx context.Context, userID, pattern string, limit int) ([]searchRow, error) {
	rows, err := r.pool.Query(ctx, searchQuery, userID, pattern, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []searchRow
	for rows.Next() {
		var s searchRow
		if err := rows.Scan(&s.ID, &s.UserName, &s.AvatarURL, &s.Handle, &s.Status); err != nil {
			return nil, err
		}
		out = append(out, s)
	}
	return out, rows.Err()
}

const suggestionsQuery = `
WITH my_friends AS (
  SELECT CASE WHEN user_id = $1 THEN friend_id ELSE user_id END AS fid
  FROM friendships
  WHERE status = 'accepted' AND $1 IN (user_id, friend_id)
)
SELECT u.id, u.user_name, u.avatar_url, count(*) AS mutual
FROM my_friends mf
JOIN friendships f2
  ON f2.status = 'accepted' AND mf.fid IN (f2.user_id, f2.friend_id)
JOIN users u
  ON u.id = CASE WHEN f2.user_id = mf.fid THEN f2.friend_id ELSE f2.user_id END
WHERE u.id <> $1
  AND u.id NOT IN (SELECT fid FROM my_friends)
  AND NOT EXISTS (
    SELECT 1 FROM friendships fx
    WHERE (fx.user_id = $1 AND fx.friend_id = u.id) OR (fx.user_id = u.id AND fx.friend_id = $1)
  )
GROUP BY u.id, u.user_name, u.avatar_url
ORDER BY mutual DESC, u.id
LIMIT $2`

func (r *Repository) Suggestions(ctx context.Context, userID string, limit int) ([]suggestionRow, error) {
	rows, err := r.pool.Query(ctx, suggestionsQuery, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []suggestionRow
	for rows.Next() {
		var s suggestionRow
		if err := rows.Scan(&s.ID, &s.UserName, &s.AvatarURL, &s.Mutual); err != nil {
			return nil, err
		}
		out = append(out, s)
	}
	return out, rows.Err()
}

const pulseQuery = `
SELECT u.id, u.user_name, u.avatar_url, p.status_text, p.last_active_at
FROM friendships f
JOIN users u ON u.id = CASE WHEN f.user_id = $1 THEN f.friend_id ELSE f.user_id END
LEFT JOIN user_presence p ON p.user_id = u.id
WHERE f.status = 'accepted' AND $1 IN (f.user_id, f.friend_id)
ORDER BY p.last_active_at DESC NULLS LAST, u.id`

func (r *Repository) Pulse(ctx context.Context, userID string) ([]pulseRow, error) {
	rows, err := r.pool.Query(ctx, pulseQuery, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []pulseRow
	for rows.Next() {
		var p pulseRow
		if err := rows.Scan(&p.ID, &p.UserName, &p.AvatarURL, &p.StatusText, &p.LastActiveAt); err != nil {
			return nil, err
		}
		out = append(out, p)
	}
	return out, rows.Err()
}

// StatusBetween returns the friendship status between two users (either
// direction), or StatusNone when there is no row.
func (r *Repository) StatusBetween(ctx context.Context, a, b string) (string, error) {
	var status string
	err := r.pool.QueryRow(ctx,
		`SELECT f.status FROM friendships f
		 WHERE (f.user_id = $1 AND f.friend_id = $2) OR (f.user_id = $2 AND f.friend_id = $1)
		 ORDER BY (f.status = 'accepted') DESC
		 LIMIT 1`, a, b).Scan(&status)
	if errors.Is(err, pgx.ErrNoRows) {
		return StatusNone, nil
	}
	if err != nil {
		return "", err
	}
	return status, nil
}

// CreateRequest inserts a pending request; a duplicate (user_id, friend_id)
// is a no-op so the call is idempotent.
func (r *Repository) CreateRequest(ctx context.Context, requester, target string) error {
	id, err := newUUIDv4()
	if err != nil {
		return err
	}
	_, err = r.pool.Exec(ctx,
		`INSERT INTO friendships (id, user_id, friend_id, status)
		 VALUES ($1, $2, $3, 'pending')
		 ON CONFLICT (user_id, friend_id) DO NOTHING`,
		id, requester, target)
	return err
}

// AcceptRequest flips a pending incoming request (requester → target) to
// accepted. Returns false when there was no matching pending row.
func (r *Repository) AcceptRequest(ctx context.Context, requester, target string) (bool, error) {
	tag, err := r.pool.Exec(ctx,
		`UPDATE friendships SET status = 'accepted'
		 WHERE user_id = $1 AND friend_id = $2 AND status = 'pending'`,
		requester, target)
	if err != nil {
		return false, err
	}
	return tag.RowsAffected() > 0, nil
}

// DeletePending removes a pending incoming request (requester → target).
// Returns false when there was no matching pending row.
func (r *Repository) DeletePending(ctx context.Context, requester, target string) (bool, error) {
	tag, err := r.pool.Exec(ctx,
		`DELETE FROM friendships
		 WHERE user_id = $1 AND friend_id = $2 AND status = 'pending'`,
		requester, target)
	if err != nil {
		return false, err
	}
	return tag.RowsAffected() > 0, nil
}

// Remove deletes any friendship row between two users (either direction).
func (r *Repository) Remove(ctx context.Context, a, b string) error {
	_, err := r.pool.Exec(ctx,
		`DELETE FROM friendships
		 WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)`,
		a, b)
	return err
}

// newUUIDv4 mirrors the auth module's generator (UUID column, canonical form).
func newUUIDv4() (string, error) {
	var b [16]byte
	if _, err := rand.Read(b[:]); err != nil {
		return "", err
	}
	b[6] = (b[6] & 0x0f) | 0x40
	b[8] = (b[8] & 0x3f) | 0x80
	return fmt.Sprintf("%08x-%04x-%04x-%04x-%012x",
		b[0:4], b[4:6], b[6:8], b[8:10], b[10:16]), nil
}
