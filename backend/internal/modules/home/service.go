package home

import (
	"context"
	"strings"
	"time"
)

// repository is the data slice the service needs; *Repository satisfies it
// and tests inject a fake.
type repository interface {
	UserHeader(ctx context.Context, userID string) (userHeaderRow, error)
	CalendarDays(ctx context.Context, userID string, from, to time.Time, tz string) ([]calendarRow, error)
	Stats(ctx context.Context, userID string, from, to time.Time) (Stats, error)
	Flashback(ctx context.Context, userID, tz string) (*flashbackRow, error)
}

// Service builds the home aggregate. mediaBaseURL is prepended to stored s3
// keys to form public URLs; when empty, keys are returned as-is.
type Service struct {
	repo         repository
	mediaBaseURL string
	now          func() time.Time
}

func NewService(repo *Repository, mediaBaseURL string) *Service {
	return &Service{repo: repo, mediaBaseURL: mediaBaseURL, now: time.Now}
}

// Home assembles the calendar, stats, and flashback for the given month
// ("2006-01"; empty = current month) interpreted in tz (IANA name; empty =
// UTC).
func (s *Service) Home(ctx context.Context, userID, monthStr, tz string) (*HomeResponse, error) {
	if tz == "" {
		tz = "UTC"
	}
	loc, err := time.LoadLocation(tz)
	if err != nil {
		return nil, ErrInvalidTimezone
	}
	from, to, label, err := monthRange(monthStr, loc, s.now())
	if err != nil {
		return nil, err
	}

	header, err := s.repo.UserHeader(ctx, userID)
	if err != nil {
		return nil, err
	}

	days, err := s.repo.CalendarDays(ctx, userID, from, to, tz)
	if err != nil {
		return nil, err
	}
	calendar := make([]CalendarDay, 0, len(days))
	for _, d := range days {
		calendar = append(calendar, CalendarDay{
			Date:          d.Day,
			MemoryCount:   d.Count,
			CoverPhotoURL: s.mediaURL(d.CoverKey),
		})
	}

	stats, err := s.repo.Stats(ctx, userID, from, to)
	if err != nil {
		return nil, err
	}

	fb, err := s.repo.Flashback(ctx, userID, tz)
	if err != nil {
		return nil, err
	}
	var flashback *Flashback
	if fb != nil {
		flashback = &Flashback{
			MemoryID: fb.ID,
			YearsAgo: fb.YearsAgo,
			Title:    fb.Title,
			PhotoURL: s.mediaURL(fb.PhotoKey),
			TakenAt:  fb.TakenAt,
		}
	}

	return &HomeResponse{
		User: UserHeader{
			ID:        header.ID,
			UserName:  header.UserName,
			AvatarURL: s.mediaURL(header.AvatarKey),
		},
		Month:     label,
		Calendar:  calendar,
		Stats:     stats,
		Flashback: flashback,
	}, nil
}

// mediaURL turns a stored object key into a public URL. nil/empty keys stay
// nil so the field serializes as JSON null.
func (s *Service) mediaURL(key *string) *string {
	if key == nil || *key == "" {
		return nil
	}
	if s.mediaBaseURL == "" {
		v := *key
		return &v
	}
	u := strings.TrimRight(s.mediaBaseURL, "/") + "/" + strings.TrimLeft(*key, "/")
	return &u
}
