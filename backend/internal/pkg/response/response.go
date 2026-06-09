package response

import "github.com/gin-gonic/gin"

func JSON(c *gin.Context, status int, data any) {
	c.JSON(status, data)
}

// ErrorBody is the structured error shape returned to clients. The frontend
// branches on the stable `code` instead of parsing localized `message`
// strings — see Plans.md Phase 2 task 2.2.
type ErrorBody struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

// Error writes a `{ code, message }` body with the given status and aborts
// the handler chain so no further handlers run.
func Error(c *gin.Context, status int, code, message string) {
	c.AbortWithStatusJSON(status, ErrorBody{Code: code, Message: message})
}
