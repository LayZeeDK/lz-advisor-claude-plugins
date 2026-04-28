#!/usr/bin/env bash
# UAT runner for one session -- Phase 6 Pattern D replay
# Args: $1 = session number (1..6), $2 = prompt file (absolute), $3 = trace output (absolute)
# Run from ngx-smart-components working tree so Claude project logs land at the user's expected path.
set -eu

N="$1"
PROMPT_FILE="$2"
TRACE_OUT="$3"
PLUGIN_DIR="D:/projects/github/LayZeeDK/lz-advisor-claude-plugins/plugins/lz-advisor"
NGX_DIR="D:/projects/github/LayZeeDK/ngx-smart-components"

# Pre-flight T-05.5-15: prompt must start with /lz-advisor.
HEAD3=$(head -3 "$PROMPT_FILE")
if ! echo "$HEAD3" | rg -q '^[/]lz-advisor\.'; then
  echo "[FAIL S$N] prompt missing /lz-advisor. prefix: $PROMPT_FILE" >&2
  exit 1
fi

# Read prompt content
PROMPT=$(cat "$PROMPT_FILE")

cd "$NGX_DIR"
echo "[START S$N] cwd=$(pwd) plugin-dir=$PLUGIN_DIR prompt=$PROMPT_FILE trace=$TRACE_OUT"

# Run claude -p with stream-json output
claude --model sonnet --effort medium \
  --plugin-dir "$PLUGIN_DIR" \
  --dangerously-skip-permissions \
  -p "$PROMPT" \
  --verbose --output-format stream-json > "$TRACE_OUT" 2>&1

EXIT=$?
SIZE=$(wc -c < "$TRACE_OUT" 2>/dev/null || echo 0)
echo "[END S$N] exit=$EXIT trace-size=$SIZE bytes"
exit $EXIT
