#!/usr/bin/env bash
# Phase 13 Plan 07 -- R3 live capture driver.
# Runs n>=3 headless `claude -p` captures per review skill against the 13-06
# FIXED agents, from CWD = the R3 ngx worktree. Captures stdout (stream-json) +
# stderr per run. Durability: each run is captured to its own file immediately.
set -uo pipefail

WT=/d/projects/github/LayZeeDK/ngx-smart-components-uat-13-r3
UAT=/d/projects/github/LayZeeDK/lz-advisor-claude-plugins/.planning/phases/13-empirical-verification/uat
PLUGDIR="D:/projects/github/LayZeeDK/lz-advisor-claude-plugins/plugins/lz-advisor"
N="${1:-3}"

cd "$WT" || exit 2

run_capture() {
  local skill="$1" target="$2" prompt="$3" idx="$4"
  local out="$UAT/r3-${skill}-${idx}.streamjson"
  local err="$UAT/r3-${skill}-${idx}.err"
  echo "=== r3-${skill}-${idx} START $(date -u +%H:%M:%S) ==="
  claude --model sonnet --permission-mode auto --plugin-dir "$PLUGDIR" \
    -p "$prompt" --verbose --output-format stream-json \
    > "$out" 2> "$err"
  local rc=$?
  echo "=== r3-${skill}-${idx} DONE rc=$rc bytes=$(wc -c < "$out") $(date -u +%H:%M:%S) ==="
  return 0
}

for i in $(seq 1 "$N"); do
  run_capture review handler.ts \
    "/lz-advisor:review review the handler module review-src/handler.ts for correctness and style issues" \
    "$i"
done

for i in $(seq 1 "$N"); do
  run_capture security disk-info.ts \
    "/lz-advisor:security-review audit review-src/disk-info.ts for security vulnerabilities" \
    "$i"
done

echo "=== ALL CAPTURES DONE ==="
