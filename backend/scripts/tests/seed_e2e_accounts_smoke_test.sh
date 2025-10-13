#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SCRIPT="$ROOT_DIR/scripts/seed_e2e_accounts.sh"

if [[ ! -f "$SCRIPT" ]]; then
  echo "FAIL: missing script $SCRIPT"
  exit 1
fi

if ! bash "$SCRIPT" --help >/tmp/seed_e2e_help.txt 2>&1; then
  echo "FAIL: --help command failed"
  cat /tmp/seed_e2e_help.txt
  exit 1
fi

if ! rg -q "Usage:" /tmp/seed_e2e_help.txt; then
  echo "FAIL: help output must contain Usage"
  cat /tmp/seed_e2e_help.txt
  exit 1
fi

echo "PASS: seed_e2e_accounts.sh help contract works"
