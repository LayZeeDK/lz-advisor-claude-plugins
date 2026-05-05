#!/usr/bin/env bash
# UAT runner for one session -- Phase 7 plugin 0.12.2 regression-gate replay
# Args: $1 = session number, $2 = prompt file (absolute), $3 = trace output (absolute)
set -eu

N="$1"
PROMPT_FILE="$2"
TRACE_OUT="$3"
PLUGIN_DIR="D:/projects/github/LayZeeDK/lz-advisor-claude-plugins/plugins/lz-advisor"
NGX_DIR="D:/projects/github/LayZeeDK/ngx-smart-components"

# Windows Git Bash compat: suppress argv path translation
if command -v cygpath >/dev/null 2>&1; then
  export MSYS_NO_PATHCONV=1
  export MSYS2_ARG_CONV_EXCL='*'
fi

# Pre-flight: prompt must start with /lz-advisor.
HEAD3=$(head -3 "$PROMPT_FILE")
if ! echo "$HEAD3" | rg -q '^[/]lz-advisor\.'; then
  echo "[FAIL S$N] prompt missing /lz-advisor. prefix: $PROMPT_FILE" >&2
  exit 1
fi

PROMPT=$(cat "$PROMPT_FILE")

cd "$NGX_DIR"
echo "[START S$N] cwd=$(pwd) plugin-dir=$PLUGIN_DIR prompt=$PROMPT_FILE trace=$TRACE_OUT"

claude --model sonnet --effort medium \
  --plugin-dir "$PLUGIN_DIR" \
  --dangerously-skip-permissions \
  -p "$PROMPT" \
  --verbose --output-format stream-json > "$TRACE_OUT" 2>&1

EXIT=$?
SIZE=$(wc -c < "$TRACE_OUT" 2>/dev/null || echo 0)
echo "[END S$N] exit=$EXIT trace-size=$SIZE bytes"
exit $EXIT
