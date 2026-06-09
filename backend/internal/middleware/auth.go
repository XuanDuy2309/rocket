package middleware

import (
	"context"
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"rocket-backend/internal/pkg/jwt"
	"rocket-backend/internal/pkg/response"
)

// RevocationChecker reports whether a JTI has been added to the deny-list.
// The middleware calls it on every authenticated request. Errors are
// logged but treated as "not revoked" — spec §5 documents this fail-open
// behavior so a transient Redis outage cannot lock everyone out.
type RevocationChecker interface {
	IsRevoked(ctx context.Context, jti string) (bool, error)
}

// Auth verifies the Bearer JWT, enforces the deny-list when revoker is
// non-nil, and stamps `user_id`, `jti`, and `exp` on the context for
// downstream handlers (e.g. /auth/logout reads `jti` + `exp`).
func Auth(secret string, revoker RevocationChecker) gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.GetHeader("Authorization")
		if auth == "" {
			response.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", "Thiếu thông tin xác thực")
			return
		}

		parts := strings.SplitN(auth, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			response.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", "Thông tin xác thực không hợp lệ")
			return
		}

		claims, err := jwt.Parse(parts[1], secret)
		if err != nil {
			response.Error(c, http.StatusUnauthorized, "INVALID_TOKEN", "Token không hợp lệ")
			return
		}

		if revoker != nil && claims.ID != "" {
			revoked, err := revoker.IsRevoked(c.Request.Context(), claims.ID)
			switch {
			case err != nil:
				log.Printf("auth: revocation check failed, fail-open: %v", err)
			case revoked:
				response.Error(c, http.StatusUnauthorized, "TOKEN_REVOKED", "Token đã bị thu hồi")
				return
			}
		}

		c.Set("user_id", claims.UserID)
		c.Set("jti", claims.ID)
		if claims.ExpiresAt != nil {
			c.Set("exp", claims.ExpiresAt.Unix())
		}
		c.Next()
	}
}
