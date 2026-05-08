#!/usr/bin/env bash
# E.4 capture driver: invoke /lz-advisor.{review,security-review} against a
# representative multi-file Angular library scratch (138 lines across 6 files)
# instead of the canonical 7-line scratch in D-{reviewer,security-reviewer}-budget.sh.
#
# Goal: test whether the n=10 gate's poor pass rate (5/10 D-reviewer + 3/10
# D-security-reviewer on canonical scratch) is fixture-design-driven (model
# under-determined) or architecture-driven (prompt-binding leaks).
#
# Usage:
#   e4-capture.sh <skill> <trace_out>
#
#   skill         "review" or "security-review"
#   trace_out     absolute or relative path to write the agent text output
#
# Example:
#   e4-capture.sh review traces/D-reviewer-budget-run-1.txt
set -eu

SKILL="${1:?skill required (review or security-review)}"
TRACE_OUT="${2:?trace_out required}"

case "$SKILL" in
  review|security-review)
    ;;
  *)
    echo "[ERROR] skill must be 'review' or 'security-review'; got: $SKILL" >&2
    exit 64
    ;;
esac

# Windows Git Bash compat: suppress argv path translation for native binaries
# (claude.exe, rg.exe, node.exe) and convert POSIX paths to Windows form.
if command -v cygpath >/dev/null 2>&1; then
  export MSYS_NO_PATHCONV=1
  export MSYS2_ARG_CONV_EXCL='*'
  to_native() { cygpath -w "$1"; }
else
  to_native() { printf '%s' "$1"; }
fi

REPO_ROOT="$(git rev-parse --show-toplevel)"
PLUGIN_DIR="$(to_native "$REPO_ROOT/plugins/lz-advisor")"
SEED_DIR="$REPO_ROOT/.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/regression-gate-0.13.1-tolerance-n10-rep/seeds"
SCRATCH="$(to_native "$(mktemp -d -t lz-advisor-e4-XXXX)")"
trap 'rm -rf "$SCRATCH"' EXIT

# Resolve TRACE_OUT to absolute BEFORE cd (so the path survives the directory
# change). Use realpath -m so non-existent destination paths resolve.
TRACE_OUT_ABS="$(realpath -m "$TRACE_OUT")"

cd "$SCRATCH"
git init -q
git config user.email "smoke@test.local"
git config user.name "Smoke Test"
git commit -q --allow-empty -m "seed"

# Copy representative seed files. Use cp -r (no `git add .` per CLAUDE.md;
# files staged explicitly by name below).
cp -r "$SEED_DIR/src" .

# Stage the 6 representative files explicitly (no git add . / -A per CLAUDE.md).
git add \
  src/services/data.service.ts \
  src/services/cache.service.ts \
  src/components/user-list.component.ts \
  src/components/user-item.component.ts \
  src/utils/validators.ts \
  src/types/api.ts

git commit -q -m "seed representative Angular library scenario (6 files, ~125 LoC)"

# Invoke /lz-advisor.<skill> Review the last commit. -- mirrors canonical
# fixture's prompt shape exactly so only the input richness varies.
claude --model sonnet --effort medium --plugin-dir "$PLUGIN_DIR" \
  --dangerously-skip-permissions \
  -p "/lz-advisor.${SKILL} Review the last commit." \
  --verbose > "$TRACE_OUT_ABS" 2>&1 || true

echo "[OK] captured -> $TRACE_OUT_ABS ($(wc -l < "$TRACE_OUT_ABS") lines)"
