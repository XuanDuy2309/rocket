package friend

import (
	"context"
	"testing"
	"time"
)

var fixedNow = time.Date(2024, 10, 17, 12, 0, 0, 0, time.UTC)

type fakeRepo struct {
	statusBetween string
	created       bool
	acceptFound   bool
	deleteFound   bool
	pulseRows     []pulseRow
	suggestRows   []suggestionRow
	searchRows    []searchRow
	removed       bool
}

func (f *fakeRepo) Search(context.Context, string, string, int) ([]searchRow, error) {
	return f.searchRows, nil
}
func (f *fakeRepo) Suggestions(context.Context, string, int) ([]suggestionRow, error) {
	return f.suggestRows, nil
}
func (f *fakeRepo) Pulse(context.Context, string) ([]pulseRow, error) { return f.pulseRows, nil }
func (f *fakeRepo) StatusBetween(context.Context, string, string) (string, error) {
	if f.statusBetween == "" {
		return StatusNone, nil
	}
	return f.statusBetween, nil
}
func (f *fakeRepo) CreateRequest(context.Context, string, string) error { f.created = true; return nil }
func (f *fakeRepo) AcceptRequest(context.Context, string, string) (bool, error) {
	return f.acceptFound, nil
}
func (f *fakeRepo) DeletePending(context.Context, string, string) (bool, error) {
	return f.deleteFound, nil
}
func (f *fakeRepo) Remove(context.Context, string, string) error { f.removed = true; return nil }

func newSvc(repo repository) *Service {
	return &Service{repo: repo, mediaBaseURL: "https://cdn/b", now: func() time.Time { return fixedNow }}
}

func sp(s string) *string  { return &s }
func tp(t time.Time) *time.Time { return &t }

func TestClassifyPresence(t *testing.T) {
	cases := []struct {
		name string
		last *time.Time
		want string
	}{
		{"nil offline", nil, PresenceOffline},
		{"2 min active", tp(fixedNow.Add(-2 * time.Minute)), PresenceActiveNow},
		{"2 hours recent", tp(fixedNow.Add(-2 * time.Hour)), PresenceRecent},
		{"2 days offline", tp(fixedNow.Add(-48 * time.Hour)), PresenceOffline},
		{"future skew", tp(fixedNow.Add(time.Minute)), PresenceActiveNow},
	}
	for _, tc := range cases {
		if got := classifyPresence(tc.last, fixedNow); got != tc.want {
			t.Errorf("%s: got %q want %q", tc.name, got, tc.want)
		}
	}
}

func TestPresenceLabel(t *testing.T) {
	if got := presenceLabel(sp("Sharing a moment…"), tp(fixedNow.Add(-3*time.Hour)), fixedNow); *got != "Sharing a moment…" {
		t.Errorf("custom should win, got %q", *got)
	}
	if got := presenceLabel(nil, tp(fixedNow.Add(-2*time.Minute)), fixedNow); *got != "Active now" {
		t.Errorf("active label = %q", *got)
	}
	if got := presenceLabel(nil, tp(fixedNow.Add(-2*time.Hour)), fixedNow); *got != "2H ago" {
		t.Errorf("hours label = %q", *got)
	}
	if got := presenceLabel(nil, tp(fixedNow.Add(-30*time.Minute)), fixedNow); *got != "30M ago" {
		t.Errorf("minutes label = %q", *got)
	}
	if got := presenceLabel(nil, tp(fixedNow.Add(-48*time.Hour)), fixedNow); got != nil {
		t.Errorf("stale should be nil, got %q", *got)
	}
	if got := presenceLabel(nil, nil, fixedNow); got != nil {
		t.Errorf("nil last should be nil")
	}
}

func TestPulse(t *testing.T) {
	repo := &fakeRepo{pulseRows: []pulseRow{
		{ID: "a", UserName: sp("A"), LastActiveAt: tp(fixedNow.Add(-2 * time.Minute))},
		{ID: "b", UserName: sp("B"), LastActiveAt: tp(fixedNow.Add(-2 * time.Hour))},
		{ID: "c", UserName: sp("C"), StatusText: sp("Sharing a moment…"), LastActiveAt: tp(fixedNow.Add(-1 * time.Minute))},
		{ID: "d", UserName: sp("D")},
	}}
	res, err := newSvc(repo).Pulse(context.Background(), "me")
	if err != nil {
		t.Fatal(err)
	}
	if res.OnlineCount != 2 {
		t.Errorf("online_count = %d, want 2", res.OnlineCount)
	}
	if res.Items[0].Presence != PresenceActiveNow || *res.Items[0].StatusText != "Active now" {
		t.Errorf("item a = %+v", res.Items[0])
	}
	if res.Items[1].Presence != PresenceRecent || *res.Items[1].StatusText != "2H ago" {
		t.Errorf("item b = %+v", res.Items[1])
	}
	if *res.Items[2].StatusText != "Sharing a moment…" {
		t.Errorf("item c status = %v", res.Items[2].StatusText)
	}
	if res.Items[3].Presence != PresenceOffline || res.Items[3].StatusText != nil {
		t.Errorf("item d = %+v", res.Items[3])
	}
}

func TestSuggestionsReason(t *testing.T) {
	repo := &fakeRepo{suggestRows: []suggestionRow{
		{ID: "x", Mutual: 5},
		{ID: "y", Mutual: 0},
	}}
	res, err := newSvc(repo).Suggestions(context.Background(), "me", 10)
	if err != nil {
		t.Fatal(err)
	}
	if res.Items[0].Reason.Type != "mutual" || res.Items[0].Reason.Count != 5 {
		t.Errorf("reason[0] = %+v", res.Items[0].Reason)
	}
	if res.Items[1].Reason.Type != "suggested" || res.Items[1].Reason.Count != 0 {
		t.Errorf("reason[1] = %+v", res.Items[1].Reason)
	}
}

func TestSearch(t *testing.T) {
	empty, _ := newSvc(&fakeRepo{}).Search(context.Background(), "me", "   ", 10)
	if len(empty.Items) != 0 {
		t.Errorf("blank query should yield no items")
	}

	repo := &fakeRepo{searchRows: []searchRow{
		{ID: "x", UserName: sp("X"), AvatarURL: sp("u/x.jpg"), Status: StatusBlocked},
		{ID: "y", UserName: sp("Y"), Status: StatusPending},
	}}
	res, _ := newSvc(repo).Search(context.Background(), "me", "x", 10)
	if res.Items[0].FriendshipStatus != StatusNone {
		t.Errorf("blocked should coerce to none, got %q", res.Items[0].FriendshipStatus)
	}
	if *res.Items[0].AvatarURL != "https://cdn/b/u/x.jpg" {
		t.Errorf("avatar url = %q", *res.Items[0].AvatarURL)
	}
	if res.Items[1].FriendshipStatus != StatusPending {
		t.Errorf("status[1] = %q", res.Items[1].FriendshipStatus)
	}
}

func TestRequest(t *testing.T) {
	if _, err := newSvc(&fakeRepo{}).Request(context.Background(), "u1", "u1"); err != ErrCannotFriendSelf {
		t.Errorf("self err = %v", err)
	}
	if _, err := newSvc(&fakeRepo{statusBetween: StatusAccepted}).Request(context.Background(), "u1", "u2"); err != ErrAlreadyFriends {
		t.Errorf("accepted err = %v", err)
	}

	pendingRepo := &fakeRepo{statusBetween: StatusPending}
	res, _ := newSvc(pendingRepo).Request(context.Background(), "u1", "u2")
	if res.FriendshipStatus != StatusPending || pendingRepo.created {
		t.Errorf("pending should be idempotent (no create), res=%+v created=%v", res, pendingRepo.created)
	}

	newRepo := &fakeRepo{statusBetween: StatusNone}
	res, _ = newSvc(newRepo).Request(context.Background(), "u1", "u2")
	if res.FriendshipStatus != StatusPending || !newRepo.created {
		t.Errorf("new request should create, res=%+v created=%v", res, newRepo.created)
	}
}

func TestRespond(t *testing.T) {
	if res, _ := newSvc(&fakeRepo{acceptFound: true}).Respond(context.Background(), "me", "req", "accept"); res.FriendshipStatus != StatusAccepted {
		t.Errorf("accept res = %+v", res)
	}
	if _, err := newSvc(&fakeRepo{acceptFound: false}).Respond(context.Background(), "me", "req", "accept"); err != ErrNoPendingRequest {
		t.Errorf("accept-none err = %v", err)
	}
	if res, _ := newSvc(&fakeRepo{deleteFound: true}).Respond(context.Background(), "me", "req", "decline"); res.FriendshipStatus != StatusNone {
		t.Errorf("decline res = %+v", res)
	}
	if _, err := newSvc(&fakeRepo{deleteFound: false}).Respond(context.Background(), "me", "req", "decline"); err != ErrNoPendingRequest {
		t.Errorf("decline-none err = %v", err)
	}
	if _, err := newSvc(&fakeRepo{}).Respond(context.Background(), "me", "req", "bogus"); err != ErrInvalidAction {
		t.Errorf("bad action err = %v", err)
	}
}

func TestInviteValidation(t *testing.T) {
	if err := newSvc(&fakeRepo{}).Invite(context.Background(), "me", "alice@example.com"); err != nil {
		t.Errorf("valid email err = %v", err)
	}
	if err := newSvc(&fakeRepo{}).Invite(context.Background(), "me", "nope"); err != ErrInvalidIdentifier {
		t.Errorf("invalid err = %v", err)
	}
}

func TestValidIdentifier(t *testing.T) {
	good := []string{"a@b.com", "Alice@Example.com", "+84901234567", "0123456789"}
	bad := []string{"", "  ", "x@localhost", "a@b@c.com", "123", "0123abcd45", "@b.com"}
	for _, s := range good {
		if !validIdentifier(s) {
			t.Errorf("want valid: %q", s)
		}
	}
	for _, s := range bad {
		if validIdentifier(s) {
			t.Errorf("want invalid: %q", s)
		}
	}
}
