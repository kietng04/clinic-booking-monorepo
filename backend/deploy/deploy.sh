#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ENV_FILE:-$ROOT_DIR/deploy/.env.deploy}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing deployment environment file: $ENV_FILE" >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required on the deployment target" >&2
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "docker compose is required on the deployment target" >&2
  exit 1
fi

set -a
source "$ENV_FILE"
set +a

: "${GHCR_USERNAME:?GHCR_USERNAME is required}"
: "${GHCR_TOKEN:?GHCR_TOKEN is required}"
: "${GHCR_NAMESPACE:?GHCR_NAMESPACE is required}"
: "${IMAGE_PREFIX:?IMAGE_PREFIX is required}"
: "${IMAGE_TAG:?IMAGE_TAG is required}"

echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin

docker compose \
  --env-file "$ENV_FILE" \
  -f "$ROOT_DIR/docker-compose.yml" \
  -f "$ROOT_DIR/deploy/docker-compose.deploy.yml" \
  pull

docker compose \
  --env-file "$ENV_FILE" \
  -f "$ROOT_DIR/docker-compose.yml" \
  -f "$ROOT_DIR/deploy/docker-compose.deploy.yml" \
  up -d --remove-orphans --no-build

docker compose \
  --env-file "$ENV_FILE" \
  -f "$ROOT_DIR/docker-compose.yml" \
  -f "$ROOT_DIR/deploy/docker-compose.deploy.yml" \
  ps

"$ROOT_DIR/deploy/healthcheck.sh" "$ENV_FILE"
