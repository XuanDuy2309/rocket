package middleware

import (
	"context"
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"rocket-backend/internal/pkg/jwt"
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
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing authorization"})
			return
		}

		parts := strings.SplitN(auth, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid authorization"})
			return
		}

		claims, err := jwt.Parse(parts[1], secret)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}

		if revoker != nil && claims.ID != "" {
			revoked, err := revoker.IsRevoked(c.Request.Context(), claims.ID)
			switch {
			case err != nil:
				log.Printf("auth: revocation check failed, fail-open: %v", err)
			case revoked:
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "token revoked"})
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
