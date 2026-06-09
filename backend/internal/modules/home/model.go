package home

import (
	"errors"
	"time"
)

// Sentinels surfaced to the handler, which maps them to HTTP status codes.
var (
	ErrInvalidMonth    = errors.New("home: invalid month")
	ErrInvalidTimezone = errors.New("home: invalid timezone")
)

// HomeResponse is the aggregate payload for the Memory Journal home screen
// (Screen 2) — see backend/docs/spec/02-screens-api.md §2.1.
type HomeResponse struct {
	User      UserHeader    `json:"user"`
	Month     string        `json:"month"` // "2006-01"
	Calendar  []CalendarDay `json:"calendar"`
	Stats     Stats         `json:"stats"`
	Flashback *Flashback    `json:"flashback"`
}

// UserHeader is the small profile chip in the top-left of the home screen.
type UserHeader struct {
	ID        string  `json:"id"`
	UserName  *string `json:"user_name"`
	AvatarURL *string `json:"avatar_url"`
}

// CalendarDay is one dot/thumbnail on the month grid. Only days that have at
// least one memory are returned.
type CalendarDay struct {
	Date          string  `json:"date"` // "2006-01-02"
	MemoryCount   int     `json:"memory_count"`
	CoverPhotoURL *string `json:"cover_photo_url"`
}

// Stats drives the two counters ("OCT Memories" / "Total Keepsakes").
type Stats struct {
	MonthMemories  int `json:"month_memories"`
	TotalKeepsakes int `json:"total_keepsakes"`
}

// Flashback is the "N years ago today" card; nil when there is no memory on
// this calendar day in a prior year.
type Flashback struct {
	MemoryID string    `json:"memory_id"`
	YearsAgo int       `json:"years_ago"`
	Title    *string   `json:"title"`
	PhotoURL *string   `json:"photo_url"`
	TakenAt  time.Time `json:"taken_at"`
}

// monthRange resolves a "2006-01" string (empty = current month in loc) into
// a half-open [from, to) range and the canonical month label.
func monthRange(monthStr string, loc *time.Location, now time.Time) (from, to time.Time, label string, err error) {
	var (
		y int
		m time.Month
	)
	if monthStr == "" {
		t := now.In(loc)
		y, m = t.Year(), t.Month()
	} else {
		t, e := time.ParseInLocation("2006-01", monthStr, loc)
		if e != nil {
			return time.Time{}, time.Time{}, "", ErrInvalidMonth
		}
		y, m = t.Year(), t.Month()
	}
	from = time.Date(y, m, 1, 0, 0, 0, 0, loc)
	to = from.AddDate(0, 1, 0)
	return from, to, from.Format("2006-01"), nil
}
