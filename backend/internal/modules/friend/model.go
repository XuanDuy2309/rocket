package friend

import (
	"errors"
	"fmt"
	"strings"
	"time"
)

// Sentinels surfaced to the handler, which maps them to HTTP status codes.
var (
	ErrCannotFriendSelf  = errors.New("friend: cannot friend self")
	ErrAlreadyFriends    = errors.New("friend: already friends")
	ErrNoPendingRequest  = errors.New("friend: no pending request")
	ErrInvalidIdentifier = errors.New("friend: invalid email or phone")
	ErrInvalidAction     = errors.New("friend: invalid action")
)

// Friendship status as stored / surfaced.
const (
	StatusNone     = "none"
	StatusPending  = "pending"
	StatusAccepted = "accepted"
	StatusBlocked  = "blocked"
)

// Presence buckets (Screen 1 "My Pulse").
const (
	PresenceActiveNow = "active_now"
	PresenceRecent    = "recent"
	PresenceOffline   = "offline"

	activeWindow = 5 * time.Minute
	recentWindow = 24 * time.Hour
)

// --- Public user shapes ---

type PublicUser struct {
	ID        string  `json:"id"`
	UserName  *string `json:"user_name"`
	AvatarURL *string `json:"avatar_url"`
}

// --- Search (§5.1) ---

type SearchResult struct {
	ID               string  `json:"id"`
	UserName         *string `json:"user_name"`
	AvatarURL        *string `json:"avatar_url"`
	Handle           *string `json:"handle"`
	FriendshipStatus string  `json:"friendship_status"`
}

type SearchList struct {
	Items      []SearchResult `json:"items"`
	NextCursor *string        `json:"next_cursor"`
}

// --- Suggestions (§5.2) ---

type SuggestionReason struct {
	Type  string `json:"type"`            // "mutual" | "suggested"
	Count int    `json:"count,omitempty"` // mutual friend count when Type == "mutual"
}

type Suggestion struct {
	ID        string           `json:"id"`
	UserName  *string          `json:"user_name"`
	AvatarURL *string          `json:"avatar_url"`
	Reason    SuggestionReason `json:"reason"`
}

type SuggestionList struct {
	Items []Suggestion `json:"items"`
}

// --- Pulse (§5.7) ---

type PulseItem struct {
	User         PublicUser `json:"user"`
	Presence     string     `json:"presence"`
	StatusText   *string    `json:"status_text"`
	LastActiveAt *time.Time `json:"last_active_at"`
}

type PulseResponse struct {
	OnlineCount int         `json:"online_count"`
	Items       []PulseItem `json:"items"`
}

// --- Mutating requests ---

type RespondRequest struct {
	Action string `json:"action" binding:"required"` // "accept" | "decline"
}

type InviteRequest struct {
	EmailOrPhone string `json:"email_or_phone" binding:"required"`
}

type StatusResponse struct {
	FriendshipStatus string `json:"friendship_status"`
}

// classifyPresence buckets a last-active time relative to now.
func classifyPresence(lastActive *time.Time, now time.Time) string {
	if lastActive == nil {
		return PresenceOffline
	}
	age := now.Sub(*lastActive)
	switch {
	case age < 0:
		return PresenceActiveNow // clock skew: treat future as now
	case age <= activeWindow:
		return PresenceActiveNow
	case age <= recentWindow:
		return PresenceRecent
	default:
		return PresenceOffline
	}
}

// presenceLabel builds the display string for a pulse row: an explicit custom
// status wins; otherwise a short relative label is derived.
func presenceLabel(custom *string, lastActive *time.Time, now time.Time) *string {
	if custom != nil && strings.TrimSpace(*custom) != "" {
		return custom
	}
	if lastActive == nil {
		return nil
	}
	age := now.Sub(*lastActive)
	var s string
	switch {
	case age <= activeWindow:
		s = "Active now"
	case age < time.Hour:
		s = fmt.Sprintf("%dM ago", int(age.Minutes()))
	case age < recentWindow:
		s = fmt.Sprintf("%dH ago", int(age.Hours()))
	default:
		return nil
	}
	return &s
}

// coerceStatus collapses 'blocked' to 'none' for display (search/suggestions
// only surface none|pending|accepted).
func coerceStatus(s string) string {
	if s == StatusAccepted || s == StatusPending {
		return s
	}
	return StatusNone
}

// validIdentifier mirrors the auth identifier rules (email with a dotted
// domain, or 8–15 digit phone with optional leading '+') for the invite flow.
func validIdentifier(raw string) bool {
	s := strings.TrimSpace(raw)
	if s == "" {
		return false
	}
	if strings.Contains(s, "@") {
		at := strings.IndexByte(s, '@')
		if at <= 0 || at != strings.LastIndexByte(s, '@') {
			return false
		}
		domain := s[at+1:]
		return strings.Contains(domain, ".") && !strings.HasPrefix(domain, ".") && !strings.HasSuffix(domain, ".")
	}
	rest := strings.TrimPrefix(s, "+")
	if len(rest) < 8 || len(rest) > 15 {
		return false
	}
	for _, r := range rest {
		if r < '0' || r > '9' {
			return false
		}
	}
	return true
}
