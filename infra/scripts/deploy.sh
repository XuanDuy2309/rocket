#!/bin/bash
set -euo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
PROJECT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

echo "=== Rocket Production Deploy ==="
echo "Project: $PROJECT_DIR"
echo "Compose: $COMPOSE_FILE"
echo ""

cd "$PROJECT_DIR"

echo "[1/3] Building backend image..."
docker compose -f "$COMPOSE_FILE" build backend

echo "[2/3] Deploying stack..."
docker compose -f "$COMPOSE_FILE" up -d --force-recreate backend

echo "[3/3] Health check..."
sleep 5
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health || echo "000")

if [ "$HEALTH" = "200" ]; then
    echo "✅ Deploy successful! Backend healthy (HTTP 200)"
else
    echo "❌ Health check failed (HTTP $HEALTH)"
    exit 1
fi
