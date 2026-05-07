#!/usr/bin/env bash
# Run a smoke fixture N times sequentially; emit a log matching the
# regression-gate-*/  structure. Generalization of run-3x.sh.
#
# Usage: run-nx.sh <fixture_name> <plugin_version> <plan_attribution> <out_log> <n_runs> [trace_dir]
#
# Args:
#   fixture_name       e.g. D-reviewer-budget.sh
#   plugin_version     e.g. 0.13.1 (informational; written into log header)
#   plan_attribution   short phrase for log header line "Plan: ..."
#   out_log            path for the gate log
#   n_runs             integer >= 1 (number of sequential runs)
#   trace_dir          OPTIONAL: directory to preserve per-run agent text
#                      output via --capture-trace. Each run writes to
#                      <trace_dir>/<fixture_base>-run-<N>.txt for future
#                      --from-trace replay.
#
# Example:
#   run-nx.sh D-reviewer-budget.sh 0.13.1 "n=10 capture pass" out.log 10 traces/
set -eu

FIXTURE_NAME="${1:?fixture name required (e.g. D-reviewer-budget.sh)}"
PLUGIN_VERSION="${2:?plugin version required (e.g. 0.13.1)}"
PLAN_ATTRIB="${3:?plan attribution required}"
OUT_LOG="${4:?out log path required}"
N_RUNS="${5:?n_runs required (integer >= 1)}"
TRACE_DIR="${6:-}"

if ! [[ "$N_RUNS" =~ ^[1-9][0-9]*$ ]]; then
  echo "[ERROR] n_runs must be a positive integer; got: $N_RUNS" >&2
  exit 64
fi

if [ -n "$TRACE_DIR" ]; then
  mkdir -p "$TRACE_DIR"
fi

FIXTURE_BASE="$(basename "$FIXTURE_NAME" .sh)"

REPO_ROOT="$(git rev-parse --show-toplevel)"
FIXTURE_PATH="$REPO_ROOT/.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/$FIXTURE_NAME"

if [ ! -f "$FIXTURE_PATH" ]; then
  echo "[ERROR] fixture not found: $FIXTURE_PATH" >&2
  exit 1
fi

GENERATED_ISO="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

{
  echo "# $FIXTURE_NAME ${N_RUNS}x re-run on plugin $PLUGIN_VERSION"
  echo "# Plan: $PLAN_ATTRIB"
  echo "# Generated: $GENERATED_ISO"
  echo "# Plugin version: $PLUGIN_VERSION"
  echo "# Contract: per-section budgets per Plan 07-14 <output_constraints> XML; aggregate cap dropped; smoke +10% gate tolerance applied"
  echo "# Fixture: .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/$FIXTURE_NAME"
  if [ -n "$TRACE_DIR" ]; then
    echo "# Trace cache: $TRACE_DIR (per-run agent text preserved for --from-trace replay)"
  fi
  echo ""
} > "$OUT_LOG"

PASS_COUNT=0
FAIL_COUNT=0
PER_RUN_VERDICTS=()

for ((N=1; N<=N_RUNS; N++)); do
  {
    echo "=== Run $N ==="
  } >> "$OUT_LOG"

  RUN_OUT="$(mktemp -t lz-advisor-nx-run-XXXX)"

  CAPTURE_ARGS=()
  if [ -n "$TRACE_DIR" ]; then
    TRACE_PATH="$TRACE_DIR/${FIXTURE_BASE}-run-${N}.txt"
    CAPTURE_ARGS=(--capture-trace "$TRACE_PATH")
  fi

  set +e
  bash "$FIXTURE_PATH" "${CAPTURE_ARGS[@]}" > "$RUN_OUT" 2>&1
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
  echo "Pass count: $PASS_COUNT / $N_RUNS"
  echo "Fail count: $FAIL_COUNT / $N_RUNS"
  for V in "${PER_RUN_VERDICTS[@]}"; do
    echo "  $V"
  done
  echo ""
  if [ $FAIL_COUNT -eq 0 ]; then
    echo "verdict: PASS_${N_RUNS}_of_${N_RUNS}"
  elif [ $PASS_COUNT -eq 0 ]; then
    echo "verdict: FAIL_${N_RUNS}_of_${N_RUNS}"
  else
    echo "verdict: PASS_${PASS_COUNT}_of_${N_RUNS} (FAIL_${FAIL_COUNT}_of_${N_RUNS})"
  fi
} >> "$OUT_LOG"

echo "wrote $OUT_LOG (pass=$PASS_COUNT fail=$FAIL_COUNT n=$N_RUNS)"
