package server

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"rocket-backend/internal/middleware"
)

type Handlers struct {
	Health func(*gin.Context)
	Ping   func(*gin.Context)
	WS     func(*gin.Context)
	Me     func(*gin.Context)
}

func NewHTTPServer(handlers Handlers, jwtSecret string) *gin.Engine {
	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery())
	r.Use(middleware.CORS())
	r.Use(middleware.RateLimit(120))

	r.GET("/health", handlers.Health)
	r.GET("/ws", handlers.WS)

	api := r.Group("/api/v1")
	api.GET("/ping", handlers.Ping)

	auth := api.Group("")
	auth.Use(middleware.Auth(jwtSecret))
	auth.GET("/me", handlers.Me)

	return r
}

func DefaultMeHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"user_id": c.GetString("user_id")})
}
