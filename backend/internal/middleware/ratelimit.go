package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
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
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{"error": "rate limit exceeded"})
			return
		}

		entry.count++
		mu.Unlock()
		c.Next()
	}
}
