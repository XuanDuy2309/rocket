package server

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// WebSocketHandler upgrades to a WebSocket connection.
// @Summary      WebSocket echo
// @Description  Upgrades to a WebSocket connection and echoes messages back
// @Tags         system
// @Success      101 "switching protocols"
// @Router       /ws [get]
func WebSocketHandler(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}
	defer conn.Close()

	for {
		mt, message, err := conn.ReadMessage()
		if err != nil {
			return
		}
		if err := conn.WriteMessage(mt, message); err != nil {
			return
		}
	}
}
