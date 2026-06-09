package home

import (
	"context"
	"testing"
	"time"
)

type fakeRepo struct {
	header   userHeaderRow
	days     []calendarRow
	stats    Stats
	flash    *flashbackRow
	gotFrom  time.Time
	gotTo    time.Time
	gotTZ    string
}

func (f *fakeRepo) UserHeader(_ context.Context, _ string) (userHeaderRow, error) {
	return f.header, nil
}

func (f *fakeRepo) CalendarDays(_ context.Context, _ string, from, to time.Time, tz string) ([]calendarRow, error) {
	f.gotFrom, f.gotTo, f.gotTZ = from, to, tz
	return f.days, nil
}

func (f *fakeRepo) Stats(_ context.Context, _ string, _, _ time.Time) (Stats, error) {
	return f.stats, nil
}

func (f *fakeRepo) Flashback(_ context.Context, _, _ string) (*flashbackRow, error) {
	return f.flash, nil
}

func strptr(s string) *string { return &s }

func newService(repo repository, base string) *Service {
	return &Service{
		repo:         repo,
		mediaBaseURL: base,
		now:          func() time.Time { return time.Date(2024, 10, 17, 12, 0, 0, 0, time.UTC) },
	}
}

func TestHomeBuildsURLsAndShape(t *testing.T) {
	repo := &fakeRepo{
		header: userHeaderRow{ID: "u1", UserName: strptr("Alex"), AvatarKey: strptr("u/u1/avatar.jpg")},
		days: []calendarRow{
			{Day: "2024-10-05", Count: 3, CoverKey: strptr("u/u1/c.jpg")},
			{Day: "2024-10-17", Count: 1, CoverKey: nil},
		},
		stats: Stats{MonthMemories: 12, TotalKeepsakes: 248},
		flash: &flashbackRow{ID: "m9", YearsAgo: 1, Title: strptr("alive"), PhotoKey: strptr("u/u1/f.jpg"),
			TakenAt: time.Date(2023, 10, 17, 21, 0, 0, 0, time.UTC)},
	}
	res, err := newService(repo, "https://cdn.example.com/bucket").Home(context.Background(), "u1", "2024-10", "UTC")
	if err != nil {
		t.Fatalf("Home: %v", err)
	}

	if res.Month != "2024-10" {
		t.Errorf("month = %q, want 2024-10", res.Month)
	}
	if got := derefURL(res.User.AvatarURL); got != "https://cdn.example.com/bucket/u/u1/avatar.jpg" {
		t.Errorf("avatar url = %q", got)
	}
	if len(res.Calendar) != 2 {
		t.Fatalf("calendar len = %d, want 2", len(res.Calendar))
	}
	if got := derefURL(res.Calendar[0].CoverPhotoURL); got != "https://cdn.example.com/bucket/u/u1/c.jpg" {
		t.Errorf("cover[0] url = %q", got)
	}
	if res.Calendar[1].CoverPhotoURL != nil {
		t.Errorf("cover[1] should be nil, got %q", *res.Calendar[1].CoverPhotoURL)
	}
	if res.Stats.MonthMemories != 12 || res.Stats.TotalKeepsakes != 248 {
		t.Errorf("stats = %+v", res.Stats)
	}
	if res.Flashback == nil || res.Flashback.YearsAgo != 1 {
		t.Fatalf("flashback = %+v", res.Flashback)
	}
	if got := derefURL(res.Flashback.PhotoURL); got != "https://cdn.example.com/bucket/u/u1/f.jpg" {
		t.Errorf("flashback url = %q", got)
	}

	// October 2024 in UTC -> [2024-10-01, 2024-11-01)
	if !repo.gotFrom.Equal(time.Date(2024, 10, 1, 0, 0, 0, 0, time.UTC)) {
		t.Errorf("from = %v", repo.gotFrom)
	}
	if !repo.gotTo.Equal(time.Date(2024, 11, 1, 0, 0, 0, 0, time.UTC)) {
		t.Errorf("to = %v", repo.gotTo)
	}
}

func TestHomeNilFlashbackAndNoMediaBase(t *testing.T) {
	repo := &fakeRepo{
		header: userHeaderRow{ID: "u1", AvatarKey: nil},
		days:   nil,
		stats:  Stats{},
		flash:  nil,
	}
	res, err := newService(repo, "").Home(context.Background(), "u1", "", "UTC")
	if err != nil {
		t.Fatalf("Home: %v", err)
	}
	if res.Flashback != nil {
		t.Errorf("flashback should be nil")
	}
	if res.User.AvatarURL != nil {
		t.Errorf("avatar should be nil")
	}
	if res.Calendar == nil || len(res.Calendar) != 0 {
		t.Errorf("calendar should be empty non-nil slice, got %#v", res.Calendar)
	}
	// Empty month defaults to the mocked now (Oct 2024).
	if res.Month != "2024-10" {
		t.Errorf("default month = %q, want 2024-10", res.Month)
	}
}

func TestHomeInvalidInputs(t *testing.T) {
	svc := newService(&fakeRepo{}, "")
	if _, err := svc.Home(context.Background(), "u1", "2024-13", "UTC"); err != ErrInvalidMonth {
		t.Errorf("bad month err = %v, want ErrInvalidMonth", err)
	}
	if _, err := svc.Home(context.Background(), "u1", "2024-10", "Mars/Phobos"); err != ErrInvalidTimezone {
		t.Errorf("bad tz err = %v, want ErrInvalidTimezone", err)
	}
}

func TestMediaURL(t *testing.T) {
	svc := &Service{mediaBaseURL: "https://b.co/bkt/"}
	if got := derefURL(svc.mediaURL(strptr("/x/y.jpg"))); got != "https://b.co/bkt/x/y.jpg" {
		t.Errorf("mediaURL = %q", got)
	}
	if svc.mediaURL(nil) != nil {
		t.Errorf("nil key should map to nil")
	}
	if svc.mediaURL(strptr("")) != nil {
		t.Errorf("empty key should map to nil")
	}
	bare := &Service{mediaBaseURL: ""}
	if got := derefURL(bare.mediaURL(strptr("x/y.jpg"))); got != "x/y.jpg" {
		t.Errorf("no-base mediaURL = %q", got)
	}
}

func derefURL(p *string) string {
	if p == nil {
		return "<nil>"
	}
	return *p
}
