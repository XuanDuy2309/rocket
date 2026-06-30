package auth

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/gin-gonic/gin"

	"rocket-backend/internal/pkg/response"
)

// fakeService implements authService so the handlers can be exercised with
// httptest, without a live DB or Redis.
type fakeService struct {
	loginTok   string
	loginUser  *User
	loginErr   error
	signupTok  string
	signupUser *User
	signupErr  error
	logoutErr  error
	sendOTPErr error
	verifyErr  error
	resetErr   error
}

func (f *fakeService) Login(_ context.Context, _ LoginRequest) (string, *User, error) {
	return f.loginTok, f.loginUser, f.loginErr
}

func (f *fakeService) Signup(_ context.Context, _ SignupRequest) (string, *User, error) {
	return f.signupTok, f.signupUser, f.signupErr
}

func (f *fakeService) Logout(_ context.Context, _ string, _ time.Time) error {
	return f.logoutErr
}

func (f *fakeService) SendForgotPasswordOTP(_ context.Context, _ ForgotPasswordSendOTPRequest) error {
	return f.sendOTPErr
}

func (f *fakeService) ResendForgotPasswordOTP(_ context.Context, req ForgotPasswordSendOTPRequest) error {
	return f.SendForgotPasswordOTP(context.Background(), req)
}

func (f *fakeService) VerifyForgotPasswordOTP(_ context.Context, _ ForgotPasswordVerifyOTPRequest) error {
	return f.verifyErr
}

func (f *fakeService) ResetForgotPassword(_ context.Context, _ ForgotPasswordResetRequest) error {
	return f.resetErr
}

func setupRouter(svc authService) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	h := &Handler{service: svc}
	public := r.Group("/api/v1")
	protected := r.Group("/api/v1")
	protected.Use(func(c *gin.Context) {
		// Stand in for middleware.Auth, which stamps these on logout.
		c.Set("jti", "test-jti")
		c.Set("exp", time.Now().Add(time.Hour).Unix())
		c.Next()
	})
	h.RegisterRoutes(public, protected, nil)
	return r
}

func do(r *gin.Engine, method, path, body string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(method, path, strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

func decodeErr(t *testing.T, w *httptest.ResponseRecorder) response.ErrorBody {
	t.Helper()
	var body response.ErrorBody
	if err := json.Unmarshal(w.Body.Bytes(), &body); err != nil {
		t.Fatalf("decode error body %q: %v", w.Body.String(), err)
	}
	return body
}

func ptr(s string) *string { return &s }

func TestLoginHandler(t *testing.T) {
	cases := []struct {
		name     string
		body     string
		svc      *fakeService
		wantCode int
		wantErr  string // expected `code` field; "" means success (no error body)
	}{
		{"bad json", `{`, &fakeService{}, http.StatusBadRequest, codeInvalidRequest},
		{"missing password", `{"email_or_phone":"a@b.com"}`, &fakeService{}, http.StatusBadRequest, codeInvalidRequest},
		{"invalid credentials", `{"email_or_phone":"a@b.com","password":"secret1"}`,
			&fakeService{loginErr: ErrInvalidCredentials}, http.StatusUnauthorized, codeInvalidCredentials},
		{"internal error", `{"email_or_phone":"a@b.com","password":"secret1"}`,
			&fakeService{loginErr: context.DeadlineExceeded}, http.StatusInternalServerError, codeInternal},
		{"success", `{"email_or_phone":"a@b.com","password":"secret1"}`,
			&fakeService{loginTok: "tok123", loginUser: &User{ID: "u1", Email: ptr("a@b.com")}}, http.StatusOK, ""},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			w := do(setupRouter(tc.svc), http.MethodPost, "/api/v1/auth/login", tc.body)
			if w.Code != tc.wantCode {
				t.Fatalf("status = %d, want %d (body %q)", w.Code, tc.wantCode, w.Body.String())
			}
			if tc.wantErr == "" {
				return
			}
			if got := decodeErr(t, w).Code; got != tc.wantErr {
				t.Errorf("error code = %q, want %q", got, tc.wantErr)
			}
		})
	}
}

func TestSignupHandler(t *testing.T) {
	cases := []struct {
		name     string
		body     string
		svc      *fakeService
		wantCode int
		wantErr  string
	}{
		{"bad json", `{`, &fakeService{}, http.StatusBadRequest, codeInvalidRequest},
		{"conflict", `{"user_name":"al","email_or_phone":"a@b.com","password":"secret1"}`,
			&fakeService{signupErr: ErrAlreadyExists}, http.StatusConflict, codeAccountExists},
		{"invalid identifier", `{"user_name":"al","email_or_phone":"nope","password":"secret1"}`,
			&fakeService{signupErr: ErrInvalidIdentifier}, http.StatusBadRequest, codeInvalidIdentifier},
		{"internal error", `{"user_name":"al","email_or_phone":"a@b.com","password":"secret1"}`,
			&fakeService{signupErr: context.DeadlineExceeded}, http.StatusInternalServerError, codeInternal},
		{"success", `{"user_name":"al","email_or_phone":"a@b.com","password":"secret1"}`,
			&fakeService{signupTok: "tok123", signupUser: &User{ID: "u1", UserName: ptr("al")}}, http.StatusCreated, ""},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			w := do(setupRouter(tc.svc), http.MethodPost, "/api/v1/auth/signup", tc.body)
			if w.Code != tc.wantCode {
				t.Fatalf("status = %d, want %d (body %q)", w.Code, tc.wantCode, w.Body.String())
			}
			if tc.wantErr == "" {
				return
			}
			if got := decodeErr(t, w).Code; got != tc.wantErr {
				t.Errorf("error code = %q, want %q", got, tc.wantErr)
			}
		})
	}
}

func TestLogoutHandler(t *testing.T) {
	t.Run("success returns 204", func(t *testing.T) {
		w := do(setupRouter(&fakeService{}), http.MethodPost, "/api/v1/auth/logout", "")
		if w.Code != http.StatusNoContent {
			t.Fatalf("status = %d, want 204 (body %q)", w.Code, w.Body.String())
		}
	})
	t.Run("service error returns structured 500", func(t *testing.T) {
		w := do(setupRouter(&fakeService{logoutErr: context.DeadlineExceeded}), http.MethodPost, "/api/v1/auth/logout", "")
		if w.Code != http.StatusInternalServerError {
			t.Fatalf("status = %d, want 500", w.Code)
		}
		if got := decodeErr(t, w).Code; got != codeInternal {
			t.Errorf("error code = %q, want %q", got, codeInternal)
		}
	})
}

func TestForgotPasswordHandlers(t *testing.T) {
	t.Run("send otp success", func(t *testing.T) {
		w := do(setupRouter(&fakeService{}), http.MethodPost, "/api/v1/auth/forgot-password/send-otp",
			`{"email_or_phone":"a@b.com"}`)
		if w.Code != http.StatusOK {
			t.Fatalf("status = %d, want 200 (body %q)", w.Code, w.Body.String())
		}
	})
	t.Run("send otp invalid identifier", func(t *testing.T) {
		w := do(setupRouter(&fakeService{sendOTPErr: ErrInvalidIdentifier}), http.MethodPost,
			"/api/v1/auth/forgot-password/send-otp", `{"email_or_phone":"bad"}`)
		if w.Code != http.StatusBadRequest {
			t.Fatalf("status = %d, want 400", w.Code)
		}
		if got := decodeErr(t, w).Code; got != codeInvalidIdentifier {
			t.Errorf("error code = %q, want %q", got, codeInvalidIdentifier)
		}
	})
	t.Run("verify otp invalid", func(t *testing.T) {
		w := do(setupRouter(&fakeService{verifyErr: ErrInvalidOTP}), http.MethodPost,
			"/api/v1/auth/forgot-password/verify-otp",
			`{"email_or_phone":"a@b.com","otp":"123456"}`)
		if w.Code != http.StatusUnauthorized {
			t.Fatalf("status = %d, want 401", w.Code)
		}
		if got := decodeErr(t, w).Code; got != codeInvalidOTP {
			t.Errorf("error code = %q, want %q", got, codeInvalidOTP)
		}
	})
	t.Run("reset password success", func(t *testing.T) {
		w := do(setupRouter(&fakeService{}), http.MethodPost, "/api/v1/auth/forgot-password/reset",
			`{"email_or_phone":"a@b.com","otp":"123456","new_password":"secret1"}`)
		if w.Code != http.StatusOK {
			t.Fatalf("status = %d, want 200 (body %q)", w.Code, w.Body.String())
		}
	})
}
