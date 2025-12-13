#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SCRIPT="$ROOT_DIR/scripts/reset_and_seed_all_dbs.sh"

if [[ ! -f "$SCRIPT" ]]; then
  echo "FAIL: missing script $SCRIPT"
  exit 1
fi

if ! bash "$SCRIPT" --help >/tmp/reset_seed_help.txt 2>&1; then
  echo "FAIL: --help command failed"
  cat /tmp/reset_seed_help.txt
  exit 1
fi

if command -v rg >/dev/null 2>&1; then
  has_usage="$(rg -q "Usage:" /tmp/reset_seed_help.txt && echo yes || echo no)"
else
  has_usage="$(grep -q "Usage:" /tmp/reset_seed_help.txt && echo yes || echo no)"
fi

if [[ "$has_usage" != "yes" ]]; then
  echo "FAIL: help output must contain Usage"
  cat /tmp/reset_seed_help.txt
  exit 1
fi

echo "PASS: script exists and help contract works"
