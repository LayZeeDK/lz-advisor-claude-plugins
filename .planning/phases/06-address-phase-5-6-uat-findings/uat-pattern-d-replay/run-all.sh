#!/usr/bin/env bash
# Sequential UAT runner -- Phase 6 Pattern D replay
# Runs sessions 1..6 against ngx-smart-components on uat/phase-6-pattern-d-replay branch.
# Sessions are dependency-chained: S1 produces plan -> S2 executes; S4 produces plan -> S5 executes.
set -u  # not -e: a single session failure should not abort the whole UAT

RUN_DIR="D:/projects/github/LayZeeDK/lz-advisor-claude-plugins/.planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay"
PLUGIN_DIR="D:/projects/github/LayZeeDK/lz-advisor-claude-plugins/plugins/lz-advisor"
NGX_DIR="D:/projects/github/LayZeeDK/ngx-smart-components"
STATUS="$RUN_DIR/run-status.txt"
LOG="$RUN_DIR/run-all.log"

mkdir -p "$RUN_DIR/traces"
echo "RUN_START $(date --iso-8601=seconds)" > "$STATUS"
echo "RUN_START $(date --iso-8601=seconds)" > "$LOG"

cd "$NGX_DIR"

for N in 1 2 3 4 5 6; do
  case "$N" in
    1) PROMPT="$RUN_DIR/prompts/session-1-plan.txt" ;;
    2) PROMPT="$RUN_DIR/prompts/session-2-execute.txt" ;;
    3) PROMPT="$RUN_DIR/prompts/session-3-review.txt" ;;
    4) PROMPT="$RUN_DIR/prompts/session-4-plan.txt" ;;
    5) PROMPT="$RUN_DIR/prompts/session-5-execute.txt" ;;
    6) PROMPT="$RUN_DIR/prompts/session-6-security-review.txt" ;;
  esac
  TRACE="$RUN_DIR/traces/session-$N.jsonl"

  if [ ! -f "$PROMPT" ]; then
    echo "[SKIP S$N] missing prompt file: $PROMPT" >> "$LOG"
    echo "S$N SKIP missing-prompt" >> "$STATUS"
    continue
  fi

  HEAD3=$(head -3 "$PROMPT")
  if ! echo "$HEAD3" | rg -q '^[/]lz-advisor\.'; then
    echo "[FAIL S$N] prompt missing /lz-advisor. prefix" >> "$LOG"
    echo "S$N FAIL preflight-prefix" >> "$STATUS"
    continue
  fi

  echo "[START S$N] $(date --iso-8601=seconds) prompt=$PROMPT trace=$TRACE" >> "$LOG"
  echo "S$N START $(date --iso-8601=seconds)" >> "$STATUS"

  PROMPT_BODY=$(cat "$PROMPT")
  claude --model sonnet --effort medium \
    --plugin-dir "$PLUGIN_DIR" \
    --dangerously-skip-permissions \
    -p "$PROMPT_BODY" \
    --verbose --output-format stream-json > "$TRACE" 2>>"$LOG"
  EXIT=$?
  SIZE=$(wc -c < "$TRACE" 2>/dev/null || echo 0)

  echo "[END S$N] $(date --iso-8601=seconds) exit=$EXIT trace-size=$SIZE bytes" >> "$LOG"
  echo "S$N END exit=$EXIT size=$SIZE" >> "$STATUS"
done

echo "RUN_END $(date --iso-8601=seconds)" >> "$STATUS"
echo "RUN_END $(date --iso-8601=seconds)" >> "$LOG"
