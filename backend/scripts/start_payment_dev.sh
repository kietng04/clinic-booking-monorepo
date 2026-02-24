#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKSPACE_DIR="$(cd "$ROOT_DIR/.." && pwd)"
FRONTEND_DIR="$WORKSPACE_DIR/frontend"
NGROK_HOME="$ROOT_DIR/.ngrok"
NGROK_BIN="$NGROK_HOME/bin/ngrok"
NGROK_CONFIG="$NGROK_HOME/ngrok.yml"
NGROK_LOG="$NGROK_HOME/ngrok.log"
NGROK_PID_FILE="$NGROK_HOME/ngrok.pid"
NGROK_API_URL="http://127.0.0.1:4041/api/tunnels"
BACKEND_ENV_FILE="$ROOT_DIR/.env"
FRONTEND_LOG="$FRONTEND_DIR/.payment-dev-frontend.log"
FRONTEND_PID_FILE="$FRONTEND_DIR/.payment-dev-frontend.pid"
NGROK_DOWNLOAD_URL="https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz"

usage() {
  cat <<'USAGE'
Usage: backend/scripts/start_payment_dev.sh [--help]

Starts the local payment development flow for MoMo sandbox:
  - ensures ngrok is available locally
  - starts or reuses the frontend dev server on port 3000
  - starts or reuses an ngrok tunnel to the API gateway on port 8080
  - writes sandbox MoMo + ngrok URLs into backend/.env
  - rebuilds the gateway/payment stack with the latest callback URL

Expected local entry points after the script succeeds:
  - Frontend: http://localhost:3000
  - API Gateway: http://localhost:8080
  - MoMo redirect URL: http://localhost:3000/payment/result
  - MoMo IPN URL: https://<ngrok-domain>/api/payments/momo/callback

Required env:
  NGROK_AUTHTOKEN   ngrok agent authtoken

Optional env overrides:
  MOMO_PARTNER_CODE (default: MOMOBKUN20180529)
  MOMO_ACCESS_KEY   (default: klm05TvNBzhg7h7j)
  MOMO_SECRET_KEY   (default: at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa)
  MOMO_ENDPOINT     (default: https://test-payment.momo.vn)
USAGE
}

for arg in "$@"; do
  case "$arg" in
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $arg" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -f "$BACKEND_ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$BACKEND_ENV_FILE"
  set +a
fi

NGROK_AUTHTOKEN="${NGROK_AUTHTOKEN:-}"
MOMO_PARTNER_CODE="${MOMO_PARTNER_CODE:-MOMOBKUN20180529}"
MOMO_ACCESS_KEY="${MOMO_ACCESS_KEY:-klm05TvNBzhg7h7j}"
MOMO_SECRET_KEY="${MOMO_SECRET_KEY:-at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa}"
MOMO_ENDPOINT="${MOMO_ENDPOINT:-https://test-payment.momo.vn}"
PAYMENT_REDIRECT_URL="${PAYMENT_REDIRECT_URL:-http://localhost:3000/payment/result}"

if [[ -z "$NGROK_AUTHTOKEN" ]]; then
  echo "Missing NGROK_AUTHTOKEN. Put it in backend/.env or export it before running." >&2
  exit 1
fi

mkdir -p "$NGROK_HOME/bin"

ensure_ngrok() {
  if [[ -x "$NGROK_BIN" ]]; then
    return
  fi

  echo "==> Downloading ngrok locally"
  local archive
  archive="$(mktemp /tmp/ngrok.XXXXXX.tgz)"
  curl -fsSL "$NGROK_DOWNLOAD_URL" -o "$archive"
  tar -xzf "$archive" -C "$NGROK_HOME/bin"
  rm -f "$archive"
  chmod +x "$NGROK_BIN"
}

write_ngrok_config() {
  cat > "$NGROK_CONFIG" <<EOF
version: 2
web_addr: 127.0.0.1:4041
authtoken: $NGROK_AUTHTOKEN
tunnels:
  gateway:
    proto: http
    addr: 8080
EOF
}

is_frontend_running() {
  curl -sf "http://127.0.0.1:3000" >/dev/null 2>&1
}

start_frontend_if_needed() {
  if is_frontend_running; then
    echo "==> Reusing frontend dev server on :3000"
    return
  fi

  echo "==> Starting frontend dev server on :3000"
  (
    cd "$FRONTEND_DIR"
    nohup npm run dev -- --host 0.0.0.0 --port 3000 > "$FRONTEND_LOG" 2>&1 &
    echo $! > "$FRONTEND_PID_FILE"
  )

  local attempts=0
  until is_frontend_running; do
    attempts=$((attempts + 1))
    if [[ $attempts -ge 60 ]]; then
      echo "Frontend dev server did not become ready on :3000" >&2
      exit 1
    fi
    sleep 1
  done
}

is_ngrok_running() {
  curl -sf "$NGROK_API_URL" >/dev/null 2>&1
}

start_ngrok_if_needed() {
  if is_ngrok_running; then
    echo "==> Reusing ngrok agent"
    return
  fi

  echo "==> Starting ngrok tunnel to API gateway"
  nohup "$NGROK_BIN" start --all --config "$NGROK_CONFIG" --log "$NGROK_LOG" --log-format json >/dev/null 2>&1 &
  echo $! > "$NGROK_PID_FILE"

  local attempts=0
  until is_ngrok_running; do
    attempts=$((attempts + 1))
    if [[ $attempts -ge 30 ]]; then
      echo "ngrok agent did not become ready" >&2
      exit 1
    fi
    sleep 1
  done
}

fetch_gateway_public_url() {
  python3 - <<'PY'
import json
import urllib.request

with urllib.request.urlopen("http://127.0.0.1:4041/api/tunnels", timeout=10) as response:
    payload = json.load(response)

for tunnel in payload.get("tunnels", []):
    if tunnel.get("config", {}).get("addr") == "http://localhost:8080" or tunnel.get("config", {}).get("addr") == "8080":
        print(tunnel["public_url"])
        break
else:
    raise SystemExit("Could not find ngrok public URL for port 8080")
PY
}

upsert_env_key() {
  local file="$1"
  local key="$2"
  local value="$3"

  python3 - "$file" "$key" "$value" <<'PY'
import pathlib
import sys

path = pathlib.Path(sys.argv[1])
key = sys.argv[2]
value = sys.argv[3]

lines = path.read_text().splitlines() if path.exists() else []
updated = False
for index, line in enumerate(lines):
    if line.startswith(f"{key}="):
        lines[index] = f"{key}={value}"
        updated = True
        break

if not updated:
    if lines and lines[-1] != "":
        lines.append("")
    lines.append(f"{key}={value}")

path.write_text("\n".join(lines) + "\n")
PY
}

restart_payment_stack() {
  echo "==> Rebuilding payment dependencies"
  (
    cd "$ROOT_DIR"
    docker compose up -d --build user-service appointment-service payment-service
  )
}

wait_for_service_health() {
  local service_url="$1"
  local service_name="$2"
  local attempts=0

  until curl -sf "$service_url" >/dev/null 2>&1; do
    attempts=$((attempts + 1))
    if [[ $attempts -ge 60 ]]; then
      echo "$service_name did not become healthy in time" >&2
      exit 1
    fi
    sleep 2
  done
}

restart_gateway_after_dependencies() {
  echo "==> Waiting for payment-service health before recreating api-gateway"
  wait_for_service_health "http://localhost:8084/actuator/health" "payment-service"
  echo "==> Recreating api-gateway after payment-service registration"
  (
    cd "$ROOT_DIR"
    docker compose up -d --build --force-recreate api-gateway
  )
  wait_for_service_health "http://localhost:8080/actuator/health" "api-gateway"
}

ensure_ngrok
write_ngrok_config
start_frontend_if_needed
start_ngrok_if_needed

GATEWAY_PUBLIC_URL="$(fetch_gateway_public_url)"
PAYMENT_IPN_URL="$GATEWAY_PUBLIC_URL/api/payments/momo/callback"

echo "==> Writing MoMo sandbox + ngrok URLs to backend/.env"
upsert_env_key "$BACKEND_ENV_FILE" "NGROK_AUTHTOKEN" "$NGROK_AUTHTOKEN"
upsert_env_key "$BACKEND_ENV_FILE" "NGROK_GATEWAY_URL" "$GATEWAY_PUBLIC_URL"
upsert_env_key "$BACKEND_ENV_FILE" "MOMO_PARTNER_CODE" "$MOMO_PARTNER_CODE"
upsert_env_key "$BACKEND_ENV_FILE" "MOMO_ACCESS_KEY" "$MOMO_ACCESS_KEY"
upsert_env_key "$BACKEND_ENV_FILE" "MOMO_SECRET_KEY" "$MOMO_SECRET_KEY"
upsert_env_key "$BACKEND_ENV_FILE" "MOMO_ENDPOINT" "$MOMO_ENDPOINT"
upsert_env_key "$BACKEND_ENV_FILE" "PAYMENT_REDIRECT_URL" "$PAYMENT_REDIRECT_URL"
upsert_env_key "$BACKEND_ENV_FILE" "PAYMENT_IPN_URL" "$PAYMENT_IPN_URL"

restart_payment_stack
restart_gateway_after_dependencies

cat <<EOF

Payment dev environment is ready.
  Frontend local URL : http://localhost:3000
  Gateway local URL  : http://localhost:8080
  Gateway ngrok URL  : $GATEWAY_PUBLIC_URL
  MoMo redirect URL  : $PAYMENT_REDIRECT_URL
  MoMo IPN URL       : $PAYMENT_IPN_URL

Use the frontend at http://localhost:3000 and click Thanh toan to verify MoMo redirect.
EOF
