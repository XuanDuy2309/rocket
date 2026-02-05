#!/usr/bin/env sh
set -e

DB_URL=${POSTGRES_URL:-"postgres://postgres:postgres@localhost:5432/rocket?sslmode=disable"}

if ! command -v migrate >/dev/null 2>&1; then
  echo "migrate binary not found. Install: https://github.com/golang-migrate/migrate"
  exit 1
fi

migrate -database "$DB_URL" -path ./migrations up
