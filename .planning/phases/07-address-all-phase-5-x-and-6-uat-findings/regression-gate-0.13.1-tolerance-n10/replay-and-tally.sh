#!/usr/bin/env bash
# Replay parsers against the n=10 captured traces and produce a unified Nx.log
# matching the existing regression-gate-*/  log structure.
#
# Usage: replay-and-tally.sh <fixture_name> <plugin_version> <trace_dir> <out_log>
set -eu

FIXTURE_NAME="${1:?fixture name required}"
PLUGIN_VERSION="${2:?plugin version required}"
TRACE_DIR="${3:?trace dir required}"
OUT_LOG="${4:?out log path required}"

REPO_ROOT="$(git rev-parse --show-toplevel)"
FIXTURE_PATH="$REPO_ROOT/.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/$FIXTURE_NAME"
FIXTURE_BASE="$(basename "$FIXTURE_NAME" .sh)"

GENERATED_ISO="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

{
  echo "# $FIXTURE_NAME 10x re-run on plugin $PLUGIN_VERSION (assembled via parser replay against captured traces)"
  echo "# Generated: $GENERATED_ISO"
  echo "# Plugin version: $PLUGIN_VERSION"
  echo "# Contract: per-section budgets per Plan 07-14 <output_constraints> XML; aggregate cap dropped; smoke +10% gate tolerance applied"
  echo "# Fixture: .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/$FIXTURE_NAME"
  echo "# Trace cache: $TRACE_DIR (10 runs preserved for future --from-trace replay)"
  echo ""
} > "$OUT_LOG"

PASS_COUNT=0
FAIL_COUNT=0
PER_RUN_VERDICTS=()

for N in 1 2 3 4 5 6 7 8 9 10; do
  TRACE_PATH="$TRACE_DIR/${FIXTURE_BASE}-run-${N}.txt"

  if [ ! -f "$TRACE_PATH" ]; then
    echo "[ERROR] trace not found: $TRACE_PATH" >&2
    exit 1
  fi

  {
    echo "=== Run $N ==="
  } >> "$OUT_LOG"

  RUN_OUT="$(mktemp -t lz-advisor-replay-XXXX)"

  set +e
  bash "$FIXTURE_PATH" --from-trace "$TRACE_PATH" > "$RUN_OUT" 2>&1
  RUN_EC=$?
  set -e

  if [ $RUN_EC -eq 0 ]; then
    {
      echo "Run $N: EXIT 0 (PASS)"
    } >> "$OUT_LOG"
    PASS_COUNT=$((PASS_COUNT + 1))
    PER_RUN_VERDICTS+=("Run $N: PASS")
  else
    {
      echo "Run $N: EXIT $RUN_EC (FAIL)"
    } >> "$OUT_LOG"
    FAIL_COUNT=$((FAIL_COUNT + 1))
    PER_RUN_VERDICTS+=("Run $N: FAIL (exit $RUN_EC)")
  fi

  {
    echo ""
    echo "--- Run $N output (full) ---"
    cat "$RUN_OUT"
    echo "--- end Run $N output ---"
    echo ""
  } >> "$OUT_LOG"

  rm -f "$RUN_OUT"
done

{
  echo "=== Summary ==="
  echo "Pass count: $PASS_COUNT / 10"
  echo "Fail count: $FAIL_COUNT / 10"
  for V in "${PER_RUN_VERDICTS[@]}"; do
    echo "  $V"
  done
  echo ""
  if [ $FAIL_COUNT -eq 0 ]; then
    echo "verdict: PASS_10_of_10"
  elif [ $PASS_COUNT -eq 0 ]; then
    echo "verdict: FAIL_10_of_10"
  else
    echo "verdict: PASS_${PASS_COUNT}_of_10 (FAIL_${FAIL_COUNT}_of_10)"
  fi
} >> "$OUT_LOG"

echo "wrote $OUT_LOG (pass=$PASS_COUNT fail=$FAIL_COUNT)"
