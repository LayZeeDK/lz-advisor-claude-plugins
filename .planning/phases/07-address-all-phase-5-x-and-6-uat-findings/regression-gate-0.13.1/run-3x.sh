#!/usr/bin/env bash
# Run a smoke fixture 3 times sequentially; emit a log matching the
# regression-gate-0.13.0/ structure produced by Plan 07-17.
#
# Usage: run-3x.sh <fixture_name> <plugin_version> <plan_attribution> <out_log>
#
# Example:
#   run-3x.sh D-reviewer-budget.sh 0.13.1 "Phase 8 step 1 mech fix gate" out.log
set -eu

FIXTURE_NAME="${1:?fixture name required (e.g. D-reviewer-budget.sh)}"
PLUGIN_VERSION="${2:?plugin version required (e.g. 0.13.1)}"
PLAN_ATTRIB="${3:?plan attribution required}"
OUT_LOG="${4:?out log path required}"

REPO_ROOT="$(git rev-parse --show-toplevel)"
FIXTURE_PATH="$REPO_ROOT/.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/$FIXTURE_NAME"

if [ ! -f "$FIXTURE_PATH" ]; then
  echo "[ERROR] fixture not found: $FIXTURE_PATH" >&2
  exit 1
fi

GENERATED_ISO="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

{
  echo "# $FIXTURE_NAME 3x re-run on plugin $PLUGIN_VERSION"
  echo "# Plan: $PLAN_ATTRIB"
  echo "# Generated: $GENERATED_ISO"
  echo "# Plugin version: $PLUGIN_VERSION"
  echo "# Contract: per-section budgets per Plan 07-14 <output_constraints> XML; aggregate cap dropped; WR-01/02/03 [GAPS-3] mech fix landed"
  echo "# Fixture: .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/$FIXTURE_NAME"
  echo ""
} > "$OUT_LOG"

PASS_COUNT=0
FAIL_COUNT=0
PER_RUN_VERDICTS=()

for N in 1 2 3; do
  {
    echo "=== Run $N ==="
  } >> "$OUT_LOG"

  RUN_OUT="$(mktemp -t lz-advisor-3x-run-XXXX)"

  set +e
  bash "$FIXTURE_PATH" > "$RUN_OUT" 2>&1
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
  echo "Pass count: $PASS_COUNT / 3"
  echo "Fail count: $FAIL_COUNT / 3"
  for V in "${PER_RUN_VERDICTS[@]}"; do
    echo "  $V"
  done
  echo ""
  if [ $FAIL_COUNT -eq 0 ]; then
    echo "verdict: PASS_3_of_3"
  elif [ $PASS_COUNT -eq 0 ]; then
    echo "verdict: FAIL_3_of_3"
  else
    echo "verdict: PASS_${PASS_COUNT}_of_3 (FAIL_${FAIL_COUNT}_of_3)"
  fi
} >> "$OUT_LOG"

echo "wrote $OUT_LOG (pass=$PASS_COUNT fail=$FAIL_COUNT)"
