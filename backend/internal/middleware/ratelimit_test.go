package middleware

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"

	"rocket-backend/internal/pkg/response"
)

func TestRateLimit(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.Use(RateLimit(2))
	r.POST("/login", func(c *gin.Context) { c.Status(http.StatusOK) })

	send := func(ip string) *httptest.ResponseRecorder {
		req := httptest.NewRequest(http.MethodPost, "/login", nil)
		req.RemoteAddr = ip + ":12345"
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)
		return w
	}

	// First two requests from the same IP pass.
	for i := 1; i <= 2; i++ {
		if w := send("1.2.3.4"); w.Code != http.StatusOK {
			t.Fatalf("request %d: status = %d, want 200", i, w.Code)
		}
	}

	// Third trips the limit with a structured 429.
	w := send("1.2.3.4")
	if w.Code != http.StatusTooManyRequests {
		t.Fatalf("status = %d, want 429", w.Code)
	}
	var body response.ErrorBody
	if err := json.Unmarshal(w.Body.Bytes(), &body); err != nil {
		t.Fatalf("decode body %q: %v", w.Body.String(), err)
	}
	if body.Code != "RATE_LIMITED" {
		t.Errorf("code = %q, want RATE_LIMITED", body.Code)
	}

	// A different IP has its own counter and is not affected.
	if w := send("5.6.7.8"); w.Code != http.StatusOK {
		t.Errorf("other IP: status = %d, want 200", w.Code)
	}
}
