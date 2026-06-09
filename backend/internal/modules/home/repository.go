package home

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Row types carry raw s3 keys; the service turns keys into URLs so the SQL
// layer stays storage-agnostic.
type userHeaderRow struct {
	ID        string
	UserName  *string
	AvatarKey *string
}

type calendarRow struct {
	Day      string // "2006-01-02"
	Count    int
	CoverKey *string
}

type flashbackRow struct {
	ID       string
	YearsAgo int
	Title    *string
	PhotoKey *string
	TakenAt  time.Time
}

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) UserHeader(ctx context.Context, userID string) (userHeaderRow, error) {
	var row userHeaderRow
	err := r.pool.QueryRow(ctx,
		`SELECT id, user_name, avatar_url FROM users WHERE id = $1`, userID,
	).Scan(&row.ID, &row.UserName, &row.AvatarKey)
	return row, err
}

const calendarQuery = `
SELECT t.day::text, t.memory_count, t.cover_key
FROM (
  SELECT (m.taken_at AT TIME ZONE $4)::date AS day,
         count(*) OVER (PARTITION BY (m.taken_at AT TIME ZONE $4)::date) AS memory_count,
         p.s3_key AS cover_key,
         row_number() OVER (
           PARTITION BY (m.taken_at AT TIME ZONE $4)::date
           ORDER BY m.taken_at DESC, m.id
         ) AS rn
  FROM memories m
  LEFT JOIN photos p ON p.id = m.cover_photo_id
  WHERE m.user_id = $1 AND m.taken_at >= $2 AND m.taken_at < $3
) t
WHERE t.rn = 1
ORDER BY t.day`

// CalendarDays returns one entry per day (in tz) that has memories, with the
// cover of that day's most recent memory.
func (r *Repository) CalendarDays(ctx context.Context, userID string, from, to time.Time, tz string) ([]calendarRow, error) {
	rows, err := r.pool.Query(ctx, calendarQuery, userID, from, to, tz)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []calendarRow
	for rows.Next() {
		var c calendarRow
		if err := rows.Scan(&c.Day, &c.Count, &c.CoverKey); err != nil {
			return nil, err
		}
		out = append(out, c)
	}
	return out, rows.Err()
}

const statsQuery = `
SELECT
  (SELECT count(*) FROM memories WHERE user_id = $1 AND taken_at >= $2 AND taken_at < $3),
  (SELECT count(*) FROM photos   WHERE user_id = $1)`

func (r *Repository) Stats(ctx context.Context, userID string, from, to time.Time) (Stats, error) {
	var s Stats
	err := r.pool.QueryRow(ctx, statsQuery, userID, from, to).
		Scan(&s.MonthMemories, &s.TotalKeepsakes)
	return s, err
}

const flashbackQuery = `
SELECT m.id, m.title, p.s3_key, m.taken_at,
       (EXTRACT(YEAR FROM (now() AT TIME ZONE $2)) - EXTRACT(YEAR FROM (m.taken_at AT TIME ZONE $2)))::int AS years_ago
FROM memories m
LEFT JOIN photos p ON p.id = m.cover_photo_id
WHERE m.user_id = $1
  AND EXTRACT(MONTH FROM (m.taken_at AT TIME ZONE $2)) = EXTRACT(MONTH FROM (now() AT TIME ZONE $2))
  AND EXTRACT(DAY   FROM (m.taken_at AT TIME ZONE $2)) = EXTRACT(DAY   FROM (now() AT TIME ZONE $2))
  AND (m.taken_at AT TIME ZONE $2)::date < (now() AT TIME ZONE $2)::date
ORDER BY m.taken_at DESC
LIMIT 1`

// Flashback returns the most recent prior-year memory falling on today's
// calendar day (in tz), or (nil, nil) when there is none.
func (r *Repository) Flashback(ctx context.Context, userID, tz string) (*flashbackRow, error) {
	var f flashbackRow
	err := r.pool.QueryRow(ctx, flashbackQuery, userID, tz).
		Scan(&f.ID, &f.Title, &f.PhotoKey, &f.TakenAt, &f.YearsAgo)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &f, nil
}
