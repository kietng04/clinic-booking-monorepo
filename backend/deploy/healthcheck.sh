#!/usr/bin/env bash

set -euo pipefail

ENV_FILE="${1:-}"
if [[ -n "$ENV_FILE" && -f "$ENV_FILE" ]]; then
  set -a
  source "$ENV_FILE"
  set +a
fi

check_http() {
  local url="$1"
  local label="$2"
  local retries="${3:-30}"
  local sleep_seconds="${4:-5}"

  for ((attempt=1; attempt<=retries; attempt++)); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      echo "$label is healthy: $url"
      return 0
    fi
    sleep "$sleep_seconds"
  done

  echo "$label failed health check: $url" >&2
  return 1
}

check_http "http://localhost:8761/actuator/health" "eureka-server"
check_http "http://localhost:8080/actuator/health" "api-gateway"
check_http "http://localhost:8086/actuator/health" "chatbot-service"
