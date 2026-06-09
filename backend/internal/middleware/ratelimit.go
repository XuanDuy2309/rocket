package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"

	"rocket-backend/internal/pkg/response"
)

type rateLimitEntry struct {
	count     int
	lastReset time.Time
}

func RateLimit(maxPerMinute int) gin.HandlerFunc {
	var mu sync.Mutex
	store := map[string]*rateLimitEntry{}

	return func(c *gin.Context) {
		key := c.ClientIP()
		now := time.Now()

		mu.Lock()
		entry, ok := store[key]
		if !ok || now.Sub(entry.lastReset) > time.Minute {
			store[key] = &rateLimitEntry{count: 1, lastReset: now}
			mu.Unlock()
			c.Next()
			return
		}

		if entry.count >= maxPerMinute {
			mu.Unlock()
			response.Error(c, http.StatusTooManyRequests, "RATE_LIMITED", "Quá nhiều yêu cầu, vui lòng thử lại sau")
			return
		}

		entry.count++
		mu.Unlock()
		c.Next()
	}
}
