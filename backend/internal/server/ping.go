package server

import "github.com/gin-gonic/gin"

// PingHandler replies with "pong".
// @Summary      Ping
// @Description  Simple connectivity check
// @Tags         system
// @Success      200 {object} map[string]interface{}
// @Router       /api/v1/ping [get]
func PingHandler(c *gin.Context) {
	c.JSON(200, gin.H{"message": "pong"})
}
