package app

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"rocket-backend/internal/config"
	"rocket-backend/internal/database"
	"rocket-backend/internal/modules/auth"
	"rocket-backend/internal/modules/friend"
	"rocket-backend/internal/modules/home"
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
	if err := database.Migrate(ctx, pgPool); err != nil {
		return nil, fmt.Errorf("migrate: %w", err)
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
	authService := auth.NewService(authRepo, rd, cfg.JWTSecret, defaultTokenTTL, cfg.AppEnv == "development")
	authHandler := auth.NewHandler(authService)

	media := mediaBaseURL(cfg)

	homeRepo := home.NewRepository(pgPool)
	homeService := home.NewService(homeRepo, media)
	homeHandler := home.NewHandler(homeService)

	friendRepo := friend.NewRepository(pgPool)
	friendService := friend.NewService(friendRepo, media)
	friendHandler := friend.NewHandler(friendService)

	router := server.NewHTTPServer(server.Handlers{
		Health: server.HealthHandler(server.HealthDependencies{Postgres: pgPool, Redis: rd}),
		Ping:   server.PingHandler,
		WS:     server.WebSocketHandler,
		Me:     server.DefaultMeHandler,
		Auth:   authHandler,
		Home:   homeHandler,
		Friend: friendHandler,
		IsDev:  cfg.AppEnv == "development",
	}, cfg.JWTSecret, authService)

	srv := &http.Server{
		Addr:    cfg.HTTPAddr,
		Handler: router,
	}

	return &App{cfg: cfg, server: srv}, nil
}

// mediaBaseURL derives the public base for object storage (path-style:
// <endpoint>/<bucket>) used to turn stored s3 keys into URLs. Empty when S3
// is not configured, in which case keys are returned as-is.
func mediaBaseURL(cfg config.Config) string {
	if cfg.S3Endpoint == "" || cfg.S3Bucket == "" {
		return ""
	}
	return strings.TrimRight(cfg.S3Endpoint, "/") + "/" + cfg.S3Bucket
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
