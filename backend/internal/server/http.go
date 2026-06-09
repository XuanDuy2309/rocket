package server

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"rocket-backend/internal/middleware"
	"rocket-backend/internal/modules/auth"
	"rocket-backend/internal/modules/friend"
	"rocket-backend/internal/modules/home"
)

type Handlers struct {
	Health func(*gin.Context)
	Ping   func(*gin.Context)
	WS     func(*gin.Context)
	Me     func(*gin.Context)
	Auth   *auth.Handler
	Home   *home.Handler
	Friend *friend.Handler
}

func NewHTTPServer(handlers Handlers, jwtSecret string, revoker middleware.RevocationChecker) *gin.Engine {
	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery())
	r.Use(middleware.CORS())
	r.Use(middleware.RateLimit(120))

	r.GET("/health", handlers.Health)
	r.GET("/ws", handlers.WS)

	api := r.Group("/api/v1")
	api.GET("/ping", handlers.Ping)

	protected := api.Group("")
	protected.Use(middleware.Auth(jwtSecret, revoker))
	protected.GET("/me", handlers.Me)

	if handlers.Home != nil {
		handlers.Home.RegisterRoutes(protected)
	}

	if handlers.Friend != nil {
		handlers.Friend.RegisterRoutes(protected)
	}

	if handlers.Auth != nil {
		// /login gets a stricter per-IP limit (10/min) than the global
		// limiter — Plans.md task 2.1. This is a separate middleware
		// instance with its own counter store.
		handlers.Auth.RegisterRoutes(api, protected, middleware.RateLimit(10))
	}

	return r
}

func DefaultMeHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"user_id": c.GetString("user_id")})
}
