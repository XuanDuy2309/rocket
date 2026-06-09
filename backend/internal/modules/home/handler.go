package home

import (
	"context"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	"rocket-backend/internal/pkg/response"
)

// homeService is the slice of *Service the handler depends on, so httptest
// can inject a fake without a DB.
type homeService interface {
	Home(ctx context.Context, userID, month, tz string) (*HomeResponse, error)
}

type Handler struct {
	service homeService
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// RegisterRoutes mounts the home endpoints. The caller mounts this under the
// JWT-protected `/api/v1` group, so `user_id` is set on the context.
func (h *Handler) RegisterRoutes(r *gin.RouterGroup) {
	r.GET("/home", h.home)
}

// home serves GET /home?month=2006-01&tz=Asia/Ho_Chi_Minh — the aggregate
// for the Memory Journal screen (spec §2.1).
func (h *Handler) home(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		response.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", "Yêu cầu xác thực")
		return
	}

	res, err := h.service.Home(c.Request.Context(), userID, c.Query("month"), c.Query("tz"))
	switch {
	case errors.Is(err, ErrInvalidMonth):
		response.Error(c, http.StatusBadRequest, "INVALID_MONTH", "Tháng không hợp lệ (định dạng YYYY-MM)")
		return
	case errors.Is(err, ErrInvalidTimezone):
		response.Error(c, http.StatusBadRequest, "INVALID_TIMEZONE", "Múi giờ không hợp lệ")
		return
	case err != nil:
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Đã có lỗi xảy ra")
		return
	}

	c.JSON(http.StatusOK, res)
}
