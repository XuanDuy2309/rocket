package friend

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"

	"rocket-backend/internal/pkg/response"
)

type fakeSvc struct {
	searchRes *SearchList
	suggRes   *SuggestionList
	pulseRes  *PulseResponse
	statusRes *StatusResponse
	err       error
}

func (f *fakeSvc) Search(context.Context, string, string, int) (*SearchList, error) {
	return f.searchRes, f.err
}
func (f *fakeSvc) Suggestions(context.Context, string, int) (*SuggestionList, error) {
	return f.suggRes, f.err
}
func (f *fakeSvc) Pulse(context.Context, string) (*PulseResponse, error) { return f.pulseRes, f.err }
func (f *fakeSvc) Request(context.Context, string, string) (*StatusResponse, error) {
	return f.statusRes, f.err
}
func (f *fakeSvc) Respond(context.Context, string, string, string) (*StatusResponse, error) {
	return f.statusRes, f.err
}
func (f *fakeSvc) Remove(context.Context, string, string) error { return f.err }
func (f *fakeSvc) Invite(context.Context, string, string) error { return f.err }

func setupRouter(svc friendService, userID string) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	h := &Handler{service: svc}
	g := r.Group("/api/v1")
	g.Use(func(c *gin.Context) {
		if userID != "" {
			c.Set("user_id", userID)
		}
		c.Next()
	})
	h.RegisterRoutes(g)
	return r
}

func req(r *gin.Engine, method, path, body string) *httptest.ResponseRecorder {
	var rdr *strings.Reader
	if body != "" {
		rdr = strings.NewReader(body)
	} else {
		rdr = strings.NewReader("")
	}
	rq := httptest.NewRequest(method, path, rdr)
	rq.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, rq)
	return w
}

func errCode(t *testing.T, w *httptest.ResponseRecorder) string {
	t.Helper()
	var b response.ErrorBody
	if err := json.Unmarshal(w.Body.Bytes(), &b); err != nil {
		t.Fatalf("decode %q: %v", w.Body.String(), err)
	}
	return b.Code
}

func TestReadEndpointsSuccess(t *testing.T) {
	svc := &fakeSvc{
		searchRes: &SearchList{Items: []SearchResult{{ID: "x"}}},
		suggRes:   &SuggestionList{Items: []Suggestion{{ID: "y"}}},
		pulseRes:  &PulseResponse{OnlineCount: 3},
	}
	r := setupRouter(svc, "me")
	for _, path := range []string{"/api/v1/friends/search?q=a", "/api/v1/friends/suggestions", "/api/v1/friends/pulse"} {
		if w := req(r, http.MethodGet, path, ""); w.Code != http.StatusOK {
			t.Errorf("%s: status %d", path, w.Code)
		}
	}
}

func TestUnauthorized(t *testing.T) {
	w := req(setupRouter(&fakeSvc{}, ""), http.MethodGet, "/api/v1/friends/pulse", "")
	if w.Code != http.StatusUnauthorized || errCode(t, w) != "UNAUTHORIZED" {
		t.Errorf("status %d code %q", w.Code, errCode(t, w))
	}
}

func TestRequestEndpoint(t *testing.T) {
	cases := []struct {
		name     string
		svc      *fakeSvc
		wantCode int
		wantErr  string
	}{
		{"ok", &fakeSvc{statusRes: &StatusResponse{FriendshipStatus: "pending"}}, http.StatusOK, ""},
		{"self", &fakeSvc{err: ErrCannotFriendSelf}, http.StatusBadRequest, "CANNOT_FRIEND_SELF"},
		{"already", &fakeSvc{err: ErrAlreadyFriends}, http.StatusConflict, "ALREADY_FRIENDS"},
		{"internal", &fakeSvc{err: context.DeadlineExceeded}, http.StatusInternalServerError, "INTERNAL_ERROR"},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			w := req(setupRouter(tc.svc, "me"), http.MethodPost, "/api/v1/friends/u2/request", "")
			if w.Code != tc.wantCode {
				t.Fatalf("status %d want %d", w.Code, tc.wantCode)
			}
			if tc.wantErr != "" && errCode(t, w) != tc.wantErr {
				t.Errorf("code %q want %q", errCode(t, w), tc.wantErr)
			}
		})
	}
}

func TestRespondEndpoint(t *testing.T) {
	// invalid body (missing action)
	if w := req(setupRouter(&fakeSvc{}, "me"), http.MethodPost, "/api/v1/friends/u2/respond", `{}`); w.Code != http.StatusBadRequest || errCode(t, w) != "INVALID_REQUEST" {
		t.Errorf("bad body: status %d code %q", w.Code, errCode(t, w))
	}
	// no pending
	if w := req(setupRouter(&fakeSvc{err: ErrNoPendingRequest}, "me"), http.MethodPost, "/api/v1/friends/u2/respond", `{"action":"accept"}`); w.Code != http.StatusNotFound || errCode(t, w) != "NO_PENDING_REQUEST" {
		t.Errorf("no pending: status %d code %q", w.Code, errCode(t, w))
	}
	// invalid action
	if w := req(setupRouter(&fakeSvc{err: ErrInvalidAction}, "me"), http.MethodPost, "/api/v1/friends/u2/respond", `{"action":"x"}`); w.Code != http.StatusBadRequest || errCode(t, w) != "INVALID_ACTION" {
		t.Errorf("bad action: status %d code %q", w.Code, errCode(t, w))
	}
	// success
	if w := req(setupRouter(&fakeSvc{statusRes: &StatusResponse{FriendshipStatus: "accepted"}}, "me"), http.MethodPost, "/api/v1/friends/u2/respond", `{"action":"accept"}`); w.Code != http.StatusOK {
		t.Errorf("ok: status %d", w.Code)
	}
}

func TestRemoveEndpoint(t *testing.T) {
	if w := req(setupRouter(&fakeSvc{}, "me"), http.MethodDelete, "/api/v1/friends/u2", ""); w.Code != http.StatusNoContent {
		t.Errorf("status %d want 204", w.Code)
	}
}

func TestInviteEndpoint(t *testing.T) {
	if w := req(setupRouter(&fakeSvc{}, "me"), http.MethodPost, "/api/v1/friends/invite", `{"email_or_phone":"a@b.com"}`); w.Code != http.StatusOK {
		t.Errorf("ok: status %d", w.Code)
	}
	if w := req(setupRouter(&fakeSvc{err: ErrInvalidIdentifier}, "me"), http.MethodPost, "/api/v1/friends/invite", `{"email_or_phone":"x"}`); w.Code != http.StatusBadRequest || errCode(t, w) != "INVALID_IDENTIFIER" {
		t.Errorf("invalid: status %d code %q", w.Code, errCode(t, w))
	}
	if w := req(setupRouter(&fakeSvc{}, "me"), http.MethodPost, "/api/v1/friends/invite", `{}`); w.Code != http.StatusBadRequest || errCode(t, w) != "INVALID_REQUEST" {
		t.Errorf("bad body: status %d code %q", w.Code, errCode(t, w))
	}
}
