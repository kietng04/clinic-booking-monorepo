#!/usr/bin/env bash
set -euo pipefail

FRONTEND_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_ROOT="${BACKEND_ROOT:-$FRONTEND_ROOT/../clinic-booking-system}"
SEED_PROFILE="${E2E_SEED_PROFILE:-small}"

RESET_SCRIPT="$BACKEND_ROOT/scripts/reset_and_seed_all_dbs.sh"
SEED_E2E_SCRIPT="$BACKEND_ROOT/scripts/seed_e2e_accounts.sh"

if [[ ! -x "$RESET_SCRIPT" ]]; then
  echo "Missing executable: $RESET_SCRIPT" >&2
  exit 1
fi

if [[ ! -x "$SEED_E2E_SCRIPT" ]]; then
  echo "Missing executable: $SEED_E2E_SCRIPT" >&2
  exit 1
fi

if [[ "${E2E_SKIP_DOCKER_START:-false}" != "true" ]]; then
  echo "==> Starting backend stack (docker compose up -d)"
  (cd "$BACKEND_ROOT" && docker compose up -d)
fi

echo "==> Resetting and seeding all databases (${SEED_PROFILE})"
(cd "$BACKEND_ROOT" && "$RESET_SCRIPT" "--${SEED_PROFILE}")

echo "==> Seeding deterministic E2E accounts"
(cd "$BACKEND_ROOT" && "$SEED_E2E_SCRIPT")

echo "==> Running gateway/auth preflight"
(cd "$FRONTEND_ROOT" && node ./scripts/e2e-preflight.mjs)

echo "E2E environment is ready"
