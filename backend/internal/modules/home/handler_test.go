package home

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"

	"rocket-backend/internal/pkg/response"
)

type fakeService struct {
	res *HomeResponse
	err error
}

func (f *fakeService) Home(_ context.Context, _, _, _ string) (*HomeResponse, error) {
	return f.res, f.err
}

// setupRouter mounts the home route behind a stub auth middleware that sets
// user_id, mirroring middleware.Auth.
func setupRouter(svc homeService, userID string) *gin.Engine {
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

func get(r *gin.Engine, path string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(http.MethodGet, path, nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

func TestHomeHandlerSuccess(t *testing.T) {
	svc := &fakeService{res: &HomeResponse{Month: "2024-10", Stats: Stats{MonthMemories: 12, TotalKeepsakes: 248}}}
	w := get(setupRouter(svc, "u1"), "/api/v1/home?month=2024-10&tz=UTC")
	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200 (body %q)", w.Code, w.Body.String())
	}
	var body HomeResponse
	if err := json.Unmarshal(w.Body.Bytes(), &body); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if body.Month != "2024-10" || body.Stats.TotalKeepsakes != 248 {
		t.Errorf("body = %+v", body)
	}
}

func TestHomeHandlerErrors(t *testing.T) {
	cases := []struct {
		name     string
		svc      *fakeService
		userID   string
		wantCode int
		wantErr  string
	}{
		{"missing user", &fakeService{}, "", http.StatusUnauthorized, "UNAUTHORIZED"},
		{"invalid month", &fakeService{err: ErrInvalidMonth}, "u1", http.StatusBadRequest, "INVALID_MONTH"},
		{"invalid tz", &fakeService{err: ErrInvalidTimezone}, "u1", http.StatusBadRequest, "INVALID_TIMEZONE"},
		{"internal", &fakeService{err: context.DeadlineExceeded}, "u1", http.StatusInternalServerError, "INTERNAL_ERROR"},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			w := get(setupRouter(tc.svc, tc.userID), "/api/v1/home")
			if w.Code != tc.wantCode {
				t.Fatalf("status = %d, want %d", w.Code, tc.wantCode)
			}
			var body response.ErrorBody
			if err := json.Unmarshal(w.Body.Bytes(), &body); err != nil {
				t.Fatalf("decode err body %q: %v", w.Body.String(), err)
			}
			if body.Code != tc.wantErr {
				t.Errorf("code = %q, want %q", body.Code, tc.wantErr)
			}
		})
	}
}
