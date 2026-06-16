// @title           Rocket API
// @version         1.0
// @description     Rocket backend API — social memory journal
// @host            localhost:8080
package main

import (
	"context"
	_ "rocket-backend/docs"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	// Embed the IANA tz database so time.LoadLocation works regardless of
	// the container base image (the home module resolves user timezones).
	_ "time/tzdata"

	"rocket-backend/internal/app"
	"rocket-backend/internal/config"
)

func main() {
	cfg := config.Load()

	application, err := app.New(cfg)
	if err != nil {
		log.Fatalf("app init failed: %v", err)
	}

	go func() {
		if err := application.Run(); err != nil {
			log.Fatalf("server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := application.Shutdown(shutdownCtx); err != nil {
		log.Printf("shutdown error: %v", err)
	}
}
