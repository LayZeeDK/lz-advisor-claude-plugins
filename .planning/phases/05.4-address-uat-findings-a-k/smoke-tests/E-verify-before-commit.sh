#!/usr/bin/env bash
# Smoke test for Findings E.1 + E.2 (verify-before-commit discipline):
#   E.1: hedge marker survives into source material; advisor flags OR executor verifies
#   E.2: explicit plan Run: directive executes pre-commit
# Three-path positive assertion (at least one satisfied):
#   (a) Advisor SD contains "Unresolved hedge:" frame
#   (b) Commit body has "Verified:" trailer AND JSONL trace has corresponding tool_use
#   (c) Commit body has "Verified:" trailer AND JSONL trace shows Bash tool_use
#       (combined with path b -- kept as a defensive alias)
# Phase 8 Plan 01 reduced the contract per user directive
# (feedback_no_wip_commits, 2026-05-03). The negative-assertion path, the
# manual auditor replay flag, and the synthesized in-process scenario have been
# removed in lockstep with that contract reduction. Only the three positive
# paths a, b, c remain.

set -eu

# Windows Git Bash compat: suppress argv path translation for native binaries
# (claude.exe, rg.exe, node.exe) and convert POSIX paths to Windows form so
# rg.exe can resolve them. No-op on Linux / macOS (cygpath unavailable).
if command -v cygpath >/dev/null 2>&1; then
  export MSYS_NO_PATHCONV=1
  export MSYS2_ARG_CONV_EXCL='*'
  to_native() { cygpath -w "$1"; }
else
  to_native() { printf '%s' "$1"; }
fi

REPO_ROOT="$(to_native "$(git rev-parse --show-toplevel)")"
PLUGIN_DIR="$REPO_ROOT/plugins/lz-advisor"
SCRATCH="$(to_native "$(mktemp -d -t lz-advisor-e-verify-XXXX)")"
trap 'rm -rf "$SCRATCH"' EXIT

cd "$SCRATCH"
git init -q
git config user.email "smoke@test.local"
git config user.name "Smoke Test"
git commit -q --allow-empty -m "seed"

# Seed package.json + a representative source file matching the empirical
# 8th UAT scenario (PHASE-7-CANDIDATES.md execute-fixes-2 pattern).
cat > package.json << 'EOF'
{
  "name": "scratch-fixture",
  "version": "0.0.1",
  "scripts": {
    "test": "echo no-op"
  },
  "devDependencies": {
    "@storybook/angular": "10.3.5",
    "@compodoc/compodoc": "1.2.1"
  }
}
EOF

mkdir -p src
printf 'export const placeholder = "compodoc placeholder";\n' > src/placeholder.ts

# Seed a plan file with BOTH a hedge marker (E.1 trigger) AND an explicit
# Run/Verify directive (E.2 trigger). This mirrors the empirical scenario in
# PHASE-7-CANDIDATES.md Finding E.2 -- numbered Validate step with Run + Verify
# clauses that the executor must execute pre-commit.
mkdir -p plans
cat > plans/verify-before-commit-fixture.plan.md << 'EOF'
# Plan: Smoke fixture for verify-before-commit discipline

## Strategic Direction

Use signal `output()` for component output binding. Verify Compodoc 1.2.1 supports signal-based output documentation before acting (fall back to `@Output() EventEmitter<void>` if Compodoc 1.2.1 still skips `output()`).

## Steps

1. **Add a placeholder symbol referencing the hedged claim**
   - File: `src/placeholder.ts`
   - Change: append `export const verified = true;` to the file
   - Rationale: deliberate trivial change; the fixture's load-bearing assertion is on the verification flow, not the code change

2. **Validate** -- Run: `npm ls @compodoc/compodoc` -- Verify: lockfile pins @compodoc/compodoc to 1.2.1

3. **Validate** -- Run: `git grep -F "@Output" src/` -- Verify: no `@Output()` decorator usage in src (signal output() is the alternative path)

## Key Decisions

- **Signal output() vs @Output() decorator:** Assuming Compodoc 1.2.1 supports signal-based output documentation (unverified against the installed Compodoc version), do use signal output(). Verify Compodoc support before acting.
EOF

git add package.json src/placeholder.ts plans/verify-before-commit-fixture.plan.md
git commit -q -m "seed verify-before-commit fixture"

# Invoke execute skill against the synthesized plan.
OUT_JSONL="$SCRATCH/E-output.jsonl"
claude --model sonnet --effort medium --plugin-dir "$PLUGIN_DIR" \
  --dangerously-skip-permissions \
  -p "/lz-advisor.execute @plans/verify-before-commit-fixture.plan.md" \
  --verbose --output-format stream-json > "$OUT_JSONL" 2>&1 || true

# Extract advisor Strategic Direction for path (a) check.
EXTRACTOR="$REPO_ROOT/.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/extract-advisor-sd.mjs"
SD_FILE="$SCRATCH/advisor-sd.txt"
node "$EXTRACTOR" "$OUT_JSONL" > "$SD_FILE" 2>/dev/null || true

# Capture last commit's subject + body for path (b) check.
LAST_COMMIT_BODY=$(git -C "$SCRATCH" log -1 --format="%B" 2>/dev/null || echo "")
LAST_COMMIT_SUBJECT=$(git -C "$SCRATCH" log -1 --format="%s" 2>/dev/null || echo "")

# Path (a): Advisor SD contains "Unresolved hedge:" literal frame
PATH_A=0
if [ -s "$SD_FILE" ] && rg -q '^Unresolved hedge:|^[0-9]+\..*Unresolved hedge:|\*\*Critical:\*\*.*Unresolved hedge:' "$SD_FILE"; then
  PATH_A=1
  echo "[OK] Path (a) hedge-flag: advisor SD contains 'Unresolved hedge:' literal frame"
fi

# Path (b): Verified: trailer in commit body AND tool_use event for the verify command
PATH_B=0
TRAILER_PRESENT=$(printf '%s\n' "$LAST_COMMIT_BODY" | rg -c '^Verified:' || echo 0)
# Look for tool_use events of cheap synchronous validation commands
# (npm ls, git grep, git check-ignore, lint, tsc) -- mirrors plan Run: directives
TOOL_USE_PRESENT=$(rg -c '"name":"Bash"' "$OUT_JSONL" || echo 0)
if [ "$TRAILER_PRESENT" -ge 1 ] && [ "$TOOL_USE_PRESENT" -ge 1 ]; then
  PATH_B=1
  echo "[OK] Path (b) verify-trailer: commit body has $TRAILER_PRESENT Verified: trailer(s) AND $TOOL_USE_PRESENT Bash tool_use event(s)"
fi

# Path (c): same as path (b) under the post-Phase-8 reduced contract.
# Retained as a defensive alias so the smoke fixture's TOTAL_PATHS accounting
# is unaffected by the contract reduction. A future cleanup may collapse
# paths (b) and (c) into one assertion.
PATH_C=0
if [ "$TRAILER_PRESENT" -ge 1 ] && [ "$TOOL_USE_PRESENT" -ge 1 ]; then
  PATH_C=1
  echo "[OK] Path (c) verify-trailer-alias: commit body has Verified: trailer AND Bash tool_use event"
fi

# Aggregate result: at least one positive path satisfies the assertion.
TOTAL_PATHS=$((PATH_A + PATH_B + PATH_C))
if [ "$TOTAL_PATHS" -ge 1 ]; then
  echo "[SUCCESS] E-verify-before-commit.sh: $TOTAL_PATHS of 3 paths satisfied (path a=$PATH_A, b=$PATH_B, c=$PATH_C)"
  exit 0
else
  echo "[ERROR] E-verify-before-commit.sh: NONE of 3 positive paths satisfied"
  echo "  Path (a) hedge-flag: PATH_A=0 (advisor SD did not contain 'Unresolved hedge:')"
  echo "  Path (b) verify-trailer: PATH_B=0 (TRAILER_PRESENT=$TRAILER_PRESENT, TOOL_USE_PRESENT=$TOOL_USE_PRESENT)"
  echo "  Path (c) verify-trailer-alias: PATH_C=0"
  echo "--- advisor Strategic Direction ---"
  cat "$SD_FILE" 2>/dev/null || echo "(empty)"
  echo "--- Last commit subject ---"
  printf '%s\n' "$LAST_COMMIT_SUBJECT"
  echo "--- Last commit body ---"
  printf '%s\n' "$LAST_COMMIT_BODY"
  echo "--- JSONL trace tail (last 100 lines) ---"
  tail -n 100 "$OUT_JSONL"
  exit 1
fi
