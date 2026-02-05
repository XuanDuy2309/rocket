package server

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

type HealthDependencies struct {
	Postgres *pgxpool.Pool
	Redis    *redis.Client
}

func HealthHandler(deps HealthDependencies) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := context.Background()

		pgOK := deps.Postgres != nil && deps.Postgres.Ping(ctx) == nil
		rdOK := deps.Redis != nil && deps.Redis.Ping(ctx).Err() == nil

		status := http.StatusOK
		if !pgOK || !rdOK {
			status = http.StatusServiceUnavailable
		}

		c.JSON(status, gin.H{
			"postgres": pgOK,
			"redis":    rdOK,
		})
	}
}
