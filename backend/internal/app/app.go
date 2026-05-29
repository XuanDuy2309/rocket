package app

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"rocket-backend/internal/config"
	"rocket-backend/internal/database"
	"rocket-backend/internal/modules/auth"
	"rocket-backend/internal/pkg/s3"
	"rocket-backend/internal/server"
)

// defaultTokenTTL is used when AUTH_TOKEN_TTL is unset. Spec §5: 7 days.
const defaultTokenTTL = 7 * 24 * time.Hour

type App struct {
	cfg    config.Config
	server *http.Server
}

func New(cfg config.Config) (*App, error) {
	if cfg.AppEnv == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pgPool, err := database.NewPool(ctx, cfg.PostgresURL)
	if err != nil {
		return nil, err
	}

	rd := database.NewRedisClient(cfg.RedisAddr)
	if err := database.PingRedis(ctx, rd); err != nil {
		return nil, err
	}

	_, err = s3.NewClient(context.Background(), s3.Config{
		Endpoint:  cfg.S3Endpoint,
		Region:    cfg.S3Region,
		AccessKey: cfg.S3AccessKey,
		SecretKey: cfg.S3SecretKey,
	})
	if err != nil {
		return nil, err
	}

	authRepo := auth.NewRepository(pgPool)
	authService := auth.NewService(authRepo, rd, cfg.JWTSecret, defaultTokenTTL)
	authHandler := auth.NewHandler(authService)

	router := server.NewHTTPServer(server.Handlers{
		Health: server.HealthHandler(server.HealthDependencies{Postgres: pgPool, Redis: rd}),
		Ping:   server.PingHandler,
		WS:     server.WebSocketHandler,
		Me:     server.DefaultMeHandler,
		Auth:   authHandler,
	}, cfg.JWTSecret, authService)

	srv := &http.Server{
		Addr:    cfg.HTTPAddr,
		Handler: router,
	}

	return &App{cfg: cfg, server: srv}, nil
}

func (a *App) Run() error {
	log.Printf("server listening on %s", a.cfg.HTTPAddr)
	if err := a.server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		return err
	}
	return nil
}

func (a *App) Shutdown(ctx context.Context) error {
	return a.server.Shutdown(ctx)
}
