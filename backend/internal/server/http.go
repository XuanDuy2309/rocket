package server

import (
	"net/http"

	"github.com/gin-gonic/gin"
	swag "github.com/swaggo/swag"

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
	IsDev  bool
}

func NewHTTPServer(handlers Handlers, jwtSecret string, revoker middleware.RevocationChecker) *gin.Engine {
	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery())
	r.Use(middleware.CORS())
	r.Use(middleware.RateLimit(120))

	r.GET("/health", handlers.Health)
	r.GET("/ws", handlers.WS)

	if handlers.IsDev {
		r.GET("/docs/openapi.json", func(c *gin.Context) {
			doc, err := swag.ReadDoc("swagger")
			if err != nil {
				c.String(http.StatusNotFound, "not found")
				return
			}
			c.Data(http.StatusOK, "application/json", []byte(doc))
		})
		r.GET("/docs", func(c *gin.Context) {
			c.Header("Content-Type", "text/html; charset=utf-8")
			c.String(200, scalarPage)
		})
	}

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

// DefaultMeHandler returns the authenticated user's ID from JWT.
// @Summary      Current user
// @Description  Returns the user_id extracted from the JWT token
// @Tags         system
// @Security     BearerAuth
// @Success      200 {object} map[string]interface{}
// @Router       /api/v1/me [get]
func DefaultMeHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"user_id": c.GetString("user_id")})
}

const scalarPage = `<!doctype html>
<html>
<head>
  <title>Rocket API Docs</title>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { margin: 0; }
  </style>
</head>
<body>
  <script id="api-reference" data-url="/docs/openapi.json" data-configuration='{"showSidebar":true}'></script>
  <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
</body>
</html>`
