package response

import "github.com/gin-gonic/gin"

func JSON(c *gin.Context, status int, data any) {
	c.JSON(status, data)
}
