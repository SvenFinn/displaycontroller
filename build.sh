#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="docker-compose.yml"

echo "🔍 Resolving services from Docker Compose config..."
SERVICES=$(docker compose -f "$COMPOSE_FILE" config --services)

if [[ -z "$SERVICES" ]]; then
  echo "❌ No services found in $COMPOSE_FILE"
  exit 1
fi

echo "📦 Services to build:"
echo "$SERVICES"
echo

for service in $SERVICES; do
  echo "=============================================="
  echo "🚧 Building service: $service"
  echo "=============================================="

  docker compose -f "$COMPOSE_FILE" build "$service"

  echo "✅ Finished building: $service"
  echo
done

echo "🎉 All services built successfully (sequentially)."
