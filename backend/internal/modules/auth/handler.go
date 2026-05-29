package auth

import (
	"errors"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// RegisterRoutes attaches /login, /signup, and /logout. The caller is
// expected to mount this under `/api/v1/auth`. /logout is protected by
// the JWT middleware, which sets `user_id`, `jti`, and `exp` on the
// gin.Context.
func (h *Handler) RegisterRoutes(public *gin.RouterGroup, protected *gin.RouterGroup) {
	public.POST("/auth/login", h.login)
	public.POST("/auth/signup", h.signup)
	protected.POST("/auth/logout", h.logout)
}

func (h *Handler) login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Dữ liệu không hợp lệ"})
		return
	}
	tok, user, err := h.service.Login(c.Request.Context(), req)
	if errors.Is(err, ErrInvalidCredentials) {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Email/số điện thoại hoặc mật khẩu không đúng"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Đã có lỗi xảy ra"})
		return
	}
	c.JSON(http.StatusOK, AuthResponse{Token: tok, User: ToPublic(user)})
}

func (h *Handler) signup(c *gin.Context) {
	var req SignupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Dữ liệu không hợp lệ"})
		return
	}
	tok, user, err := h.service.Signup(c.Request.Context(), req)
	switch {
	case errors.Is(err, ErrAlreadyExists):
		c.JSON(http.StatusConflict, gin.H{"message": "Tài khoản đã tồn tại"})
		return
	case errors.Is(err, ErrInvalidIdentifier):
		c.JSON(http.StatusBadRequest, gin.H{"message": "Email hoặc số điện thoại không hợp lệ"})
		return
	case err != nil:
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Đã có lỗi xảy ra"})
		return
	}
	c.JSON(http.StatusCreated, AuthResponse{Token: tok, User: ToPublic(user)})
}

func (h *Handler) logout(c *gin.Context) {
	jti := c.GetString("jti")
	expUnix := c.GetInt64("exp")
	exp := time.Unix(expUnix, 0)
	if err := h.service.Logout(c.Request.Context(), jti, exp); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Đã có lỗi xảy ra"})
		return
	}
	c.Status(http.StatusNoContent)
}
