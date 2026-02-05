# Locket BE (Monolith Clean)

Structure is monolith but split by domain modules for easy future microservice extraction.

## Structure overview

- `cmd/api/main.go`: Application entry point.
- `internal/app`: Wire dependencies and start the HTTP server.
- `internal/config`: Load environment variables and config.
- `internal/server`: Gin server setup and WebSocket handler.
- `internal/middleware`: Auth, CORS, and rate limiting.
- `internal/modules`: Feature modules (auth, user, friend, photo, feed, notification).
- `internal/pkg`: Shared utilities (logger, jwt, redis, s3, response).
- `internal/database`: Database clients (Postgres, Redis).
- `migrations`: SQL migrations.
- `docker`: Dockerfile and compose for backend-only.
- `scripts`: Helper scripts (migrate).

## Why this structure works

- Easy to learn: clear flow from HTTP -> module handler -> service -> repository.
- Easy to scale: modules are isolated and can be split to microservices later.
- Easy to extend: add a new feature by creating a new module with handler/service/repository.

## Add a new module (quick guide)

1. Create folder under `internal/modules/<module>`.
2. Add `handler.go`, `service.go`, `repository.go`.
3. Register routes in `internal/server/http.go`.
4. Wire dependencies in `internal/app/app.go`.

## Run local

```bash
  cd backend
  export $(cat .env.template | xargs)
  go run ./cmd/api
```

```bash
  docker exec -it postgres_db psql -U postgres -d rocket
```

## Run with Docker

```bash
docker compose up --build
```

## Request flow

HTTP Request -> Middleware -> Handler -> Service -> Repository -> Response
