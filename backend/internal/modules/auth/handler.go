package auth

import (
	"context"
	"errors"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"rocket-backend/internal/pkg/response"
)

// Stable error codes returned in the `code` field so the frontend can
// localize without parsing messages — see Plans.md Phase 2 task 2.2.
const (
	codeInvalidRequest     = "INVALID_REQUEST"
	codeInvalidCredentials = "INVALID_CREDENTIALS"
	codeInvalidIdentifier  = "INVALID_IDENTIFIER"
	codeAccountExists      = "ACCOUNT_EXISTS"
	codeInternal           = "INTERNAL_ERROR"
)

// authService is the slice of *Service the handlers depend on. Depending on
// an interface (rather than the concrete type) lets httptest inject a fake
// without a live DB/Redis — *Service satisfies it.
type authService interface {
	Login(ctx context.Context, req LoginRequest) (string, *User, error)
	Signup(ctx context.Context, req SignupRequest) (string, *User, error)
	Logout(ctx context.Context, jti string, expiresAt time.Time) error
}

type Handler struct {
	service authService
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// RegisterRoutes attaches /login, /signup, and /logout. The caller is
// expected to mount this under `/api/v1/auth`. /logout is protected by
// the JWT middleware, which sets `user_id`, `jti`, and `exp` on the
// gin.Context. loginLimiter, when non-nil, is applied only to /login
// (a stricter per-IP limit than the global one) — Plans.md task 2.1.
func (h *Handler) RegisterRoutes(public *gin.RouterGroup, protected *gin.RouterGroup, loginLimiter gin.HandlerFunc) {
	if loginLimiter != nil {
		public.POST("/auth/login", loginLimiter, h.login)
	} else {
		public.POST("/auth/login", h.login)
	}
	public.POST("/auth/signup", h.signup)
	protected.POST("/auth/logout", h.logout)
}

// @Summary      Login
// @Description  Authenticate with email/phone and password
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        body body auth.LoginRequest true "Login credentials"
// @Success      200 {object} auth.AuthResponse
// @Failure      400 {object} response.ErrorBody
// @Failure      401 {object} response.ErrorBody
// @Router       /api/v1/auth/login [post]
func (h *Handler) login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, codeInvalidRequest, "Dữ liệu không hợp lệ")
		return
	}
	tok, user, err := h.service.Login(c.Request.Context(), req)
	if errors.Is(err, ErrInvalidCredentials) {
		response.Error(c, http.StatusUnauthorized, codeInvalidCredentials, "Email/số điện thoại hoặc mật khẩu không đúng")
		return
	}
	if err != nil {
		response.Error(c, http.StatusInternalServerError, codeInternal, "Đã có lỗi xảy ra")
		return
	}
	c.JSON(http.StatusOK, AuthResponse{Token: tok, User: ToPublic(user)})
}

// @Summary      Signup
// @Description  Create a new account
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        body body auth.SignupRequest true "Signup info"
// @Success      201 {object} auth.AuthResponse
// @Failure      400 {object} response.ErrorBody
// @Failure      409 {object} response.ErrorBody
// @Router       /api/v1/auth/signup [post]
func (h *Handler) signup(c *gin.Context) {
	var req SignupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, codeInvalidRequest, "Dữ liệu không hợp lệ")
		return
	}
	tok, user, err := h.service.Signup(c.Request.Context(), req)
	switch {
	case errors.Is(err, ErrAlreadyExists):
		response.Error(c, http.StatusConflict, codeAccountExists, "Tài khoản đã tồn tại")
		return
	case errors.Is(err, ErrInvalidIdentifier):
		response.Error(c, http.StatusBadRequest, codeInvalidIdentifier, "Email hoặc số điện thoại không hợp lệ")
		return
	case err != nil:
		response.Error(c, http.StatusInternalServerError, codeInternal, "Đã có lỗi xảy ra")
		return
	}
	c.JSON(http.StatusCreated, AuthResponse{Token: tok, User: ToPublic(user)})
}

// @Summary      Logout
// @Description  Invalidate the current JWT token
// @Tags         auth
// @Security     BearerAuth
// @Success      204 "no content"
// @Failure      500 {object} response.ErrorBody
// @Router       /api/v1/auth/logout [post]
func (h *Handler) logout(c *gin.Context) {
	jti := c.GetString("jti")
	expUnix := c.GetInt64("exp")
	exp := time.Unix(expUnix, 0)
	if err := h.service.Logout(c.Request.Context(), jti, exp); err != nil {
		response.Error(c, http.StatusInternalServerError, codeInternal, "Đã có lỗi xảy ra")
		return
	}
	c.Status(http.StatusNoContent)
}
