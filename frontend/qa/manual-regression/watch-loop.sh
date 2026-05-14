#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUNS_DIR="$ROOT_DIR/runs"
INTERVAL_SECONDS="${WATCH_INTERVAL_SECONDS:-15}"
FOLLOW_MODE="false"
RUN_DIR_ARG=""

usage() {
  cat <<'EOF'
Usage:
  qa/manual-regression/watch-loop.sh [--follow] [--interval SECONDS] [RUN_DIR]

Examples:
  qa/manual-regression/watch-loop.sh
  qa/manual-regression/watch-loop.sh --follow
  qa/manual-regression/watch-loop.sh --interval 5
  qa/manual-regression/watch-loop.sh /abs/path/to/run-dir

Behavior:
  - If RUN_DIR is omitted, the latest directory under qa/manual-regression/runs is used.
  - Shows the current loop status, PID, thread_id, recent state, and recent log lines.
  - With --follow, refreshes until the runner process exits.
EOF
}

resolve_run_dir() {
  if [[ -n "$RUN_DIR_ARG" ]]; then
    printf '%s\n' "$RUN_DIR_ARG"
    return 0
  fi

  if [[ ! -d "$RUNS_DIR" ]]; then
    echo "Missing runs directory: $RUNS_DIR" >&2
    return 1
  fi

  local latest
  latest="$(find "$RUNS_DIR" -mindepth 1 -maxdepth 1 -type d | sort | tail -n 1)"
  if [[ -z "$latest" ]]; then
    echo "No run directories found in $RUNS_DIR" >&2
    return 1
  fi

  printf '%s\n' "$latest"
}

find_runner_pid() {
  local run_dir="$1"
  pgrep -f "iteration_time_loop_runner.py.*$run_dir" | head -n 1 || true
}

latest_state_file() {
  local run_dir="$1"
  find "$run_dir/state" -maxdepth 1 -type f -name 'loop-*.json' 2>/dev/null | sort -V | tail -n 1
}

print_status_once() {
  local run_dir="$1"
  local pid
  local state_file
  local log_file="$run_dir/launcher.log"
  local thread_file="$run_dir/thread_id.txt"

  pid="$(find_runner_pid "$run_dir")"
  state_file="$(latest_state_file "$run_dir")"

  printf 'UTC time: %s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
  printf 'Run dir: %s\n' "$run_dir"

  if [[ -n "$pid" ]] && ps -p "$pid" > /dev/null 2>&1; then
    printf 'Runner: RUNNING (pid=%s)\n' "$pid"
  else
    printf 'Runner: STOPPED\n'
  fi

  if [[ -f "$thread_file" ]]; then
    printf 'Thread ID: %s\n' "$(tr -d '\n' < "$thread_file")"
  else
    printf 'Thread ID: not captured yet\n'
  fi

  if [[ -n "$state_file" ]] && [[ -f "$state_file" ]]; then
    printf 'Latest state file: %s\n' "$state_file"
    python3 - "$state_file" <<'PY'
import json
import sys
from pathlib import Path

path = Path(sys.argv[1])
data = json.loads(path.read_text(encoding="utf-8"))
print(f"State summary: status={data.get('status')} done={data.get('done')} blocked={data.get('blocked')}")
print(f"Summary: {data.get('summary')}")
print(f"Next step: {data.get('next_step')}")
PY
  else
    printf 'Latest state file: not available yet\n'
  fi

  if [[ -f "$log_file" ]]; then
    printf 'Recent log:\n'
    tail -n 10 "$log_file"
  else
    printf 'Recent log: missing log file\n'
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --follow)
      FOLLOW_MODE="true"
      shift
      ;;
    --interval)
      INTERVAL_SECONDS="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      RUN_DIR_ARG="$1"
      shift
      ;;
  esac
done

RUN_DIR="$(resolve_run_dir)"

if [[ "$FOLLOW_MODE" != "true" ]]; then
  print_status_once "$RUN_DIR"
  exit 0
fi

while true; do
  clear
  print_status_once "$RUN_DIR"
  PID_VALUE="$(find_runner_pid "$RUN_DIR")"
  if [[ -z "$PID_VALUE" ]] || ! ps -p "$PID_VALUE" > /dev/null 2>&1; then
    printf '\nLoop finished.\n'
    exit 0
  fi
  sleep "$INTERVAL_SECONDS"
done
