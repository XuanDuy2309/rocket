package friend

import (
	"context"
	"log"
	"strings"
	"time"
)

// repository is the data slice the service needs; *Repository satisfies it
// and tests inject a fake.
type repository interface {
	Search(ctx context.Context, userID, pattern string, limit int) ([]searchRow, error)
	Suggestions(ctx context.Context, userID string, limit int) ([]suggestionRow, error)
	Pulse(ctx context.Context, userID string) ([]pulseRow, error)
	StatusBetween(ctx context.Context, a, b string) (string, error)
	CreateRequest(ctx context.Context, requester, target string) error
	AcceptRequest(ctx context.Context, requester, target string) (bool, error)
	DeletePending(ctx context.Context, requester, target string) (bool, error)
	Remove(ctx context.Context, a, b string) error
}

type Service struct {
	repo         repository
	mediaBaseURL string
	now          func() time.Time
}

func NewService(repo *Repository, mediaBaseURL string) *Service {
	return &Service{repo: repo, mediaBaseURL: mediaBaseURL, now: time.Now}
}

// Search finds users by name/handle, annotated with the caller's friendship
// status. An empty query returns no results.
func (s *Service) Search(ctx context.Context, userID, q string, limit int) (*SearchList, error) {
	q = strings.TrimSpace(q)
	if q == "" {
		return &SearchList{Items: []SearchResult{}}, nil
	}
	pattern := "%" + escapeLike(q) + "%"
	rows, err := s.repo.Search(ctx, userID, pattern, limit)
	if err != nil {
		return nil, err
	}
	items := make([]SearchResult, 0, len(rows))
	for _, r := range rows {
		items = append(items, SearchResult{
			ID:               r.ID,
			UserName:         r.UserName,
			AvatarURL:        s.mediaURL(r.AvatarURL),
			Handle:           r.Handle,
			FriendshipStatus: coerceStatus(r.Status),
		})
	}
	return &SearchList{Items: items}, nil
}

// Suggestions returns friend-of-friend candidates ranked by mutual count.
func (s *Service) Suggestions(ctx context.Context, userID string, limit int) (*SuggestionList, error) {
	rows, err := s.repo.Suggestions(ctx, userID, limit)
	if err != nil {
		return nil, err
	}
	items := make([]Suggestion, 0, len(rows))
	for _, r := range rows {
		reason := SuggestionReason{Type: "suggested"}
		if r.Mutual > 0 {
			reason = SuggestionReason{Type: "mutual", Count: r.Mutual}
		}
		items = append(items, Suggestion{
			ID:        r.ID,
			UserName:  r.UserName,
			AvatarURL: s.mediaURL(r.AvatarURL),
			Reason:    reason,
		})
	}
	return &SuggestionList{Items: items}, nil
}

// Pulse returns accepted friends with derived presence + online count.
func (s *Service) Pulse(ctx context.Context, userID string) (*PulseResponse, error) {
	rows, err := s.repo.Pulse(ctx, userID)
	if err != nil {
		return nil, err
	}
	now := s.now()
	items := make([]PulseItem, 0, len(rows))
	online := 0
	for _, r := range rows {
		presence := classifyPresence(r.LastActiveAt, now)
		if presence == PresenceActiveNow {
			online++
		}
		items = append(items, PulseItem{
			User:         PublicUser{ID: r.ID, UserName: r.UserName, AvatarURL: s.mediaURL(r.AvatarURL)},
			Presence:     presence,
			StatusText:   presenceLabel(r.StatusText, r.LastActiveAt, now),
			LastActiveAt: r.LastActiveAt,
		})
	}
	return &PulseResponse{OnlineCount: online, Items: items}, nil
}

// Request sends (or re-confirms) a friend request from userID to targetID.
func (s *Service) Request(ctx context.Context, userID, targetID string) (*StatusResponse, error) {
	if userID == targetID {
		return nil, ErrCannotFriendSelf
	}
	status, err := s.repo.StatusBetween(ctx, userID, targetID)
	if err != nil {
		return nil, err
	}
	switch status {
	case StatusAccepted:
		return nil, ErrAlreadyFriends
	case StatusPending:
		return &StatusResponse{FriendshipStatus: StatusPending}, nil // idempotent
	}
	if err := s.repo.CreateRequest(ctx, userID, targetID); err != nil {
		return nil, err
	}
	return &StatusResponse{FriendshipStatus: StatusPending}, nil
}

// Respond accepts or declines an incoming request from requesterID to userID.
func (s *Service) Respond(ctx context.Context, userID, requesterID, action string) (*StatusResponse, error) {
	switch action {
	case "accept":
		found, err := s.repo.AcceptRequest(ctx, requesterID, userID)
		if err != nil {
			return nil, err
		}
		if !found {
			return nil, ErrNoPendingRequest
		}
		return &StatusResponse{FriendshipStatus: StatusAccepted}, nil
	case "decline":
		found, err := s.repo.DeletePending(ctx, requesterID, userID)
		if err != nil {
			return nil, err
		}
		if !found {
			return nil, ErrNoPendingRequest
		}
		return &StatusResponse{FriendshipStatus: StatusNone}, nil
	default:
		return nil, ErrInvalidAction
	}
}

// Remove deletes any friendship/request between userID and targetID.
func (s *Service) Remove(ctx context.Context, userID, targetID string) error {
	return s.repo.Remove(ctx, userID, targetID)
}

// Invite sends an out-of-band invite ("Sync Your World"). Delivery shares the
// Phase 3 Sender seam and is stubbed (logged) until a provider is wired.
func (s *Service) Invite(ctx context.Context, userID, emailOrPhone string) error {
	if !validIdentifier(emailOrPhone) {
		return ErrInvalidIdentifier
	}
	// TODO(phase3): route through the email/SMS Sender once configured.
	log.Printf("friend: invite queued by %s to %q (delivery stubbed)", userID, emailOrPhone)
	return nil
}

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

// escapeLike neutralizes LIKE wildcards in user input so a search for "50%"
// matches literally rather than as a pattern.
func escapeLike(s string) string {
	r := strings.NewReplacer(`\`, `\\`, `%`, `\%`, `_`, `\_`)
	return r.Replace(s)
}
