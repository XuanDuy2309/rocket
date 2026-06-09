package friend

import (
	"context"
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"rocket-backend/internal/pkg/response"
)

const (
	defaultLimit = 20
	maxLimit     = 100
)

// friendService is the slice of *Service the handler depends on, so httptest
// can inject a fake without a DB.
type friendService interface {
	Search(ctx context.Context, userID, q string, limit int) (*SearchList, error)
	Suggestions(ctx context.Context, userID string, limit int) (*SuggestionList, error)
	Pulse(ctx context.Context, userID string) (*PulseResponse, error)
	Request(ctx context.Context, userID, targetID string) (*StatusResponse, error)
	Respond(ctx context.Context, userID, requesterID, action string) (*StatusResponse, error)
	Remove(ctx context.Context, userID, targetID string) error
	Invite(ctx context.Context, userID, emailOrPhone string) error
}

type Handler struct {
	service friendService
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// RegisterRoutes mounts the friend endpoints under the JWT-protected group.
func (h *Handler) RegisterRoutes(r *gin.RouterGroup) {
	g := r.Group("/friends")
	g.GET("/search", h.search)
	g.GET("/suggestions", h.suggestions)
	g.GET("/pulse", h.pulse)
	g.POST("/invite", h.invite)
	g.POST("/:id/request", h.request)
	g.POST("/:id/respond", h.respond)
	g.DELETE("/:id", h.remove)
}

func (h *Handler) search(c *gin.Context) {
	uid, ok := authed(c)
	if !ok {
		return
	}
	res, err := h.service.Search(c.Request.Context(), uid, c.Query("q"), parseLimit(c))
	if err != nil {
		internal(c)
		return
	}
	c.JSON(http.StatusOK, res)
}

func (h *Handler) suggestions(c *gin.Context) {
	uid, ok := authed(c)
	if !ok {
		return
	}
	res, err := h.service.Suggestions(c.Request.Context(), uid, parseLimit(c))
	if err != nil {
		internal(c)
		return
	}
	c.JSON(http.StatusOK, res)
}

func (h *Handler) pulse(c *gin.Context) {
	uid, ok := authed(c)
	if !ok {
		return
	}
	res, err := h.service.Pulse(c.Request.Context(), uid)
	if err != nil {
		internal(c)
		return
	}
	c.JSON(http.StatusOK, res)
}

func (h *Handler) request(c *gin.Context) {
	uid, ok := authed(c)
	if !ok {
		return
	}
	res, err := h.service.Request(c.Request.Context(), uid, c.Param("id"))
	switch {
	case errors.Is(err, ErrCannotFriendSelf):
		response.Error(c, http.StatusBadRequest, "CANNOT_FRIEND_SELF", "Không thể kết bạn với chính mình")
		return
	case errors.Is(err, ErrAlreadyFriends):
		response.Error(c, http.StatusConflict, "ALREADY_FRIENDS", "Hai người đã là bạn bè")
		return
	case err != nil:
		internal(c)
		return
	}
	c.JSON(http.StatusOK, res)
}

func (h *Handler) respond(c *gin.Context) {
	uid, ok := authed(c)
	if !ok {
		return
	}
	var req RespondRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "INVALID_REQUEST", "Dữ liệu không hợp lệ")
		return
	}
	res, err := h.service.Respond(c.Request.Context(), uid, c.Param("id"), req.Action)
	switch {
	case errors.Is(err, ErrInvalidAction):
		response.Error(c, http.StatusBadRequest, "INVALID_ACTION", "Hành động không hợp lệ (accept|decline)")
		return
	case errors.Is(err, ErrNoPendingRequest):
		response.Error(c, http.StatusNotFound, "NO_PENDING_REQUEST", "Không có lời mời kết bạn đang chờ")
		return
	case err != nil:
		internal(c)
		return
	}
	c.JSON(http.StatusOK, res)
}

func (h *Handler) remove(c *gin.Context) {
	uid, ok := authed(c)
	if !ok {
		return
	}
	if err := h.service.Remove(c.Request.Context(), uid, c.Param("id")); err != nil {
		internal(c)
		return
	}
	c.Status(http.StatusNoContent)
}

func (h *Handler) invite(c *gin.Context) {
	uid, ok := authed(c)
	if !ok {
		return
	}
	var req InviteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "INVALID_REQUEST", "Dữ liệu không hợp lệ")
		return
	}
	err := h.service.Invite(c.Request.Context(), uid, req.EmailOrPhone)
	switch {
	case errors.Is(err, ErrInvalidIdentifier):
		response.Error(c, http.StatusBadRequest, "INVALID_IDENTIFIER", "Email hoặc số điện thoại không hợp lệ")
		return
	case err != nil:
		internal(c)
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "sent"})
}

// authed returns the JWT user id, or writes a 401 and reports false.
func authed(c *gin.Context) (string, bool) {
	uid := c.GetString("user_id")
	if uid == "" {
		response.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", "Yêu cầu xác thực")
		return "", false
	}
	return uid, true
}

func internal(c *gin.Context) {
	response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Đã có lỗi xảy ra")
}

// parseLimit reads ?limit, clamped to [1, maxLimit] with a default.
func parseLimit(c *gin.Context) int {
	n, err := strconv.Atoi(c.Query("limit"))
	if err != nil || n <= 0 {
		return defaultLimit
	}
	if n > maxLimit {
		return maxLimit
	}
	return n
}
