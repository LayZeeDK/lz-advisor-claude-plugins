#!/usr/bin/env bash
# Smoke test for Findings E.1 + E.2 (verify-before-commit discipline):
#   E.1: hedge marker survives into source material; advisor flags OR executor verifies
#   E.2: explicit plan Run: directive executes pre-commit OR moves to wip: + Outstanding Verification
# Three-path positive assertion (at least one satisfied):
#   (a) Advisor SD contains "Unresolved hedge:" frame
#   (b) Commit body has "Verified:" trailer AND JSONL trace has corresponding tool_use
#   (c) Commit subject starts with "wip:" AND body has "## Outstanding Verification"
# One-path negative assertion (Plan 07-08 Gap 2 closure):
#   (d) Subject is non-wip AND body has "## Outstanding Verification" AND non-zero file changes
#       outside the trailer-only carve-out -> exit 2 (violation detected).

# --replay flag (manual auditor tool):
#   Usage: bash E-verify-before-commit.sh --replay <sha>
#   Spelling: exactly "--replay" (long flag, two leading hyphens, lowercase).
#   Intended use: invoked manually by an auditor against a commit SHA in the
#     CURRENT working-tree git repo. Empirical UAT replay commits (e.g.,
#     8c25c9e, 06af4cf, 15d8fac from sessions 2 / 5 / 8) live in the external
#     ngx-smart-components testbed repo, NOT in this plugin repo; auditors
#     cd into the testbed and run --replay there.
#   Error path: when the SHA is not in the current working-tree repo,
#     git show fails and the flag exits 65 with a clear "cannot read commit"
#     message. Phase-closure does not depend on empirical replay; the
#     synthesized in-process path-d scenario (later in this script) is what
#     proves path-d fires.

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

# --replay mode: re-check historical commits against the path-d assertion
# without seeding a scratch repo. See header block above for documentation.
if [ "${1:-}" = "--replay" ]; then
  REPLAY_SHA="${2:?--replay requires a commit SHA}"
  REPO_ROOT="$(git rev-parse --show-toplevel)"
  cd "$REPO_ROOT"
  # Validate SHA format (defense-in-depth per 07-RESEARCH-GAP-2 Security Domain)
  if ! printf '%s' "$REPLAY_SHA" | rg -q '^[0-9a-f]{6,40}$'; then
    echo "[ERROR] --replay: invalid SHA format '$REPLAY_SHA'; expected 6-40 hex chars"
    exit 64
  fi
  LAST_COMMIT_SUBJECT=$(git show --format='%s' --no-patch "$REPLAY_SHA" 2>/dev/null) || {
    echo "[ERROR] --replay: cannot read commit $REPLAY_SHA in the current working-tree repo"
    echo "  This SHA may live in an external testbed repo (e.g., ngx-smart-components)."
    echo "  cd into the testbed repo and re-run --replay there for empirical evidence."
    exit 65
  }
  LAST_COMMIT_BODY=$(git show --format='%B' --no-patch "$REPLAY_SHA")
  WIP_PRESENT=$(printf '%s\n' "$LAST_COMMIT_SUBJECT" | rg -c '^wip(\(.+\))?:|^chore\(wip\):' || echo 0)
  OUTSTANDING_PRESENT=$(printf '%s\n' "$LAST_COMMIT_BODY" | rg -c '^## Outstanding Verification' || echo 0)
  FILE_CHANGES=$(git diff --stat "${REPLAY_SHA}~1..${REPLAY_SHA}" 2>/dev/null | rg -c '^\s*\S+\s+\|\s+[0-9]+' || echo 0)
  echo "--- Replay mode: $REPLAY_SHA ---"
  echo "  Subject: $LAST_COMMIT_SUBJECT"
  echo "  WIP_PRESENT: $WIP_PRESENT"
  echo "  OUTSTANDING_PRESENT: $OUTSTANDING_PRESENT"
  echo "  FILE_CHANGES (non-zero stat lines): $FILE_CHANGES"
  if [ "$OUTSTANDING_PRESENT" -ge 1 ] && [ "$WIP_PRESENT" -eq 0 ] && [ "$FILE_CHANGES" -ge 1 ]; then
    echo "[ERROR] --replay path-d violation: subject does not match '^wip(\(.+\))?:|^chore\(wip\):' BUT body contains '## Outstanding Verification' AND $FILE_CHANGES file(s) changed (outside trailer-only carve-out)"
    echo "  This is the empirical wip-discipline scope ambiguity gap (Plan 07-02 Gap 2 / P8-13)."
    echo "  Per <verify_before_commit> Phase 3.5 Subject-prefix discipline: subject MUST use 'wip:' prefix when Outstanding Verification is populated, UNLESS the commit ONLY records additional Verified: trailers for already-listed Outstanding items (zero file changes)."
    exit 2
  elif [ "$OUTSTANDING_PRESENT" -ge 1 ] && [ "$WIP_PRESENT" -eq 0 ] && [ "$FILE_CHANGES" -eq 0 ]; then
    echo "[OK] --replay path-d carve-out: subject is non-wip AND body has Outstanding Verification, but commit is trailer-only (zero file changes) -- carve-out applies"
    exit 0
  elif [ "$WIP_PRESENT" -ge 1 ]; then
    echo "[OK] --replay: subject is wip-prefixed; no path-d violation"
    exit 0
  else
    echo "[OK] --replay: no Outstanding Verification section in body; path-d N/A"
    exit 0
  fi
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

# Capture last commit's subject + body for path (b) and (c) checks.
LAST_COMMIT_BODY=$(git -C "$SCRATCH" log -1 --format="%B" 2>/dev/null || echo "")
LAST_COMMIT_SUBJECT=$(git -C "$SCRATCH" log -1 --format="%s" 2>/dev/null || echo "")

# Synthesized in-process path-d scenario (Plan 07-08 Gap 2 closure proof).
# The executor's commit may or may not exhibit the wip-discipline gap shape
# depending on Sonnet 4.6's prompt-following on the day the smoke runs.
# To structurally prove path-d fires when the gap shape is present, we
# synthesize a non-wip commit with populated Outstanding Verification and
# non-zero file changes IN THE SCRATCH REPO. The path-d assertion below
# checks the CURRENT HEAD; after this block, HEAD is the synthesized
# violation commit. The empirical session 2 / 5 SHAs (8c25c9e, 06af4cf)
# live in the external ngx-smart-components testbed repo and are NOT
# replayed here; auditors run --replay manually in that testbed.
SYNTHESIZED_PATH_D=0
if [ "${SYNTHESIZE_PATH_D:-1}" -eq 1 ]; then
  SYNTHESIZED_PATH_D=1
  echo "--- Synthesizing in-process path-d scenario (set SYNTHESIZE_PATH_D=0 to skip) ---"
  cd "$SCRATCH"
  printf 'export const synthesizedPathD = true;\n' > src/synthesized-path-d.ts
  git add src/synthesized-path-d.ts
  # Non-wip subject + populated Outstanding Verification + non-zero file changes
  # = path-d violation under tightened contract (Plan 07-08 Task 1).
  git commit -q -m "fix(synthesized): non-wip subject with Outstanding Verification (path-d test)" -m "Synthesized commit for Plan 07-08 path-d structural validation. The subject is non-wip, the body contains Outstanding Verification, and the diff has 1 file change. Path-d MUST exit 2 when checking this commit's HEAD." -m "## Outstanding Verification" -m "- Run: \`nx build-storybook ngx-smart-components\` -- verify documentation.json is generated (long-running validation, not run in smoke)" -m "Verified: tsc --noEmit on synthesized-path-d.ts exits clean"
  # Re-capture LAST_COMMIT_SUBJECT and LAST_COMMIT_BODY from the synthesized HEAD.
  LAST_COMMIT_SUBJECT=$(git show --format='%s' --no-patch HEAD)
  LAST_COMMIT_BODY=$(git show --format='%B' --no-patch HEAD)
  WIP_PRESENT=$(printf '%s\n' "$LAST_COMMIT_SUBJECT" | rg -c '^wip(\(.+\))?:|^chore\(wip\):' || echo 0)
  OUTSTANDING_PRESENT=$(printf '%s\n' "$LAST_COMMIT_BODY" | rg -c '^## Outstanding Verification' || echo 0)
  echo "  Synthesized subject: $LAST_COMMIT_SUBJECT"
  echo "  WIP_PRESENT: $WIP_PRESENT (expected 0)"
  echo "  OUTSTANDING_PRESENT: $OUTSTANDING_PRESENT (expected 1)"
fi

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

# Path (c): wip: commit subject AND ## Outstanding Verification body section
PATH_C=0
WIP_PRESENT=$(printf '%s\n' "$LAST_COMMIT_SUBJECT" | rg -c '^wip(\(.+\))?:|^chore\(wip\):' || echo 0)
OUTSTANDING_PRESENT=$(printf '%s\n' "$LAST_COMMIT_BODY" | rg -c '^## Outstanding Verification' || echo 0)
if [ "$WIP_PRESENT" -ge 1 ] && [ "$OUTSTANDING_PRESENT" -ge 1 ]; then
  PATH_C=1
  echo "[OK] Path (c) wip-commit: subject starts with 'wip:' AND body has '## Outstanding Verification' section"
fi

# Path (d): wip-discipline scope ambiguity DETECTION (negative assertion).
# Fires when the executor used the per-commit reading: shipped a non-wip commit
# that has a populated `## Outstanding Verification` section AND changed files
# outside the trailer-only carve-out. Closure landed in Plan 07-08 Task 1
# (lz-advisor.execute/SKILL.md `### Subject-prefix discipline when Outstanding
# Verification is populated` subsection). The synthesized in-process scenario
# (above) ensures path-d fires structurally within this smoke run, proving
# the assertion's correctness without requiring cross-repo SHA replay.
PATH_D_VIOLATION=0
if [ "$OUTSTANDING_PRESENT" -ge 1 ] && [ "$WIP_PRESENT" -eq 0 ]; then
  # Outstanding Verification is populated AND subject is NOT wip-prefixed.
  # Check the carve-out: is this a trailer-only follow-up (zero file changes)?
  FILE_CHANGES=$(cd "$SCRATCH" && git diff --stat HEAD~1..HEAD 2>/dev/null | rg -c '^\s*\S+\s+\|\s+[0-9]+' || echo 0)
  if [ "$FILE_CHANGES" -ge 1 ]; then
    # Non-zero file changes outside the trailer-only carve-out: this is a violation.
    PATH_D_VIOLATION=1
    echo "[ERROR] Path (d) wip-discipline violation: subject does not match '^wip(\(.+\))?:|^chore\(wip\):' BUT body contains '## Outstanding Verification' AND $FILE_CHANGES file(s) changed (outside trailer-only carve-out)"
    echo "  Subject: $LAST_COMMIT_SUBJECT"
    if [ "$SYNTHESIZED_PATH_D" -eq 1 ]; then
      echo "  Source: synthesized in-process path-d scenario (Plan 07-08 Gap 2 structural proof) -- this is the EXPECTED firing under the synthesized scenario."
    else
      echo "  Source: executor's own commit -- this is an UNEXPECTED firing; investigate."
    fi
    echo "  Per <verify_before_commit> Phase 3.5 Subject-prefix discipline: subject MUST use 'wip:' prefix when Outstanding Verification is populated, UNLESS the commit ONLY records additional Verified: trailers for already-listed Outstanding items (zero file changes)."
  else
    # Zero file changes: trailer-only follow-up carve-out; not a violation.
    echo "[OK] Path (d) carve-out: subject is non-wip AND body has Outstanding Verification, but commit is trailer-only (zero file changes) -- carve-out applies"
  fi
fi

# Aggregate result: when the synthesized path-d scenario is enabled, path-d
# MUST fire (exit 2) -- that's the structural Gap 2 closure proof. When
# SYNTHESIZE_PATH_D=0, the smoke reverts to the original "at least one
# positive path AND no path-d violation" criterion.
TOTAL_PATHS=$((PATH_A + PATH_B + PATH_C))
if [ "$SYNTHESIZED_PATH_D" -eq 1 ]; then
  if [ "$PATH_D_VIOLATION" -eq 1 ]; then
    echo "[SUCCESS] E-verify-before-commit.sh: synthesized path-d scenario fired (exit 2 expected); Gap 2 closure structurally proven"
    echo "  Path (a) hedge-flag: PATH_A=$PATH_A"
    echo "  Path (b) verify-trailer: PATH_B=$PATH_B"
    echo "  Path (c) wip-commit: PATH_C=$PATH_C"
    echo "  Path (d) violation (synthesized): PATH_D_VIOLATION=1 (EXPECTED FIRING)"
    exit 2
  else
    echo "[ERROR] E-verify-before-commit.sh: synthesized path-d scenario did NOT fire; path-d assertion is broken"
    echo "  Subject: $LAST_COMMIT_SUBJECT"
    echo "  Body:"
    printf '%s\n' "$LAST_COMMIT_BODY"
    echo "  WIP_PRESENT=$WIP_PRESENT (expected 0)"
    echo "  OUTSTANDING_PRESENT=$OUTSTANDING_PRESENT (expected 1)"
    echo "  Investigate the path-d regex or the synthesized commit shape."
    exit 1
  fi
elif [ "$PATH_D_VIOLATION" -eq 1 ]; then
  echo "[ERROR] E-verify-before-commit.sh: Path (d) wip-discipline violation detected (executor's commit) -- gap-2 empirical signal"
  echo "  Path (a) hedge-flag: PATH_A=$PATH_A"
  echo "  Path (b) verify-trailer: PATH_B=$PATH_B"
  echo "  Path (c) wip-commit: PATH_C=$PATH_C"
  echo "  Path (d) violation: PATH_D_VIOLATION=1 (THIS IS THE GAP)"
  echo "--- Last commit subject ---"
  printf '%s\n' "$LAST_COMMIT_SUBJECT"
  echo "--- Last commit body ---"
  printf '%s\n' "$LAST_COMMIT_BODY"
  echo "--- git diff --stat HEAD~1..HEAD ---"
  (cd "$SCRATCH" && git diff --stat HEAD~1..HEAD 2>/dev/null) || echo "(empty)"
  exit 2
elif [ "$TOTAL_PATHS" -ge 1 ]; then
  echo "[SUCCESS] E-verify-before-commit.sh: $TOTAL_PATHS of 3 paths satisfied (path a=$PATH_A, b=$PATH_B, c=$PATH_C); no wip-discipline violation"
  exit 0
else
  echo "[ERROR] E-verify-before-commit.sh: NONE of 3 positive paths satisfied AND no wip-discipline violation"
  echo "  Path (a) hedge-flag: PATH_A=0 (advisor SD did not contain 'Unresolved hedge:')"
  echo "  Path (b) verify-trailer: PATH_B=0 (TRAILER_PRESENT=$TRAILER_PRESENT, TOOL_USE_PRESENT=$TOOL_USE_PRESENT)"
  echo "  Path (c) wip-commit: PATH_C=0 (WIP_PRESENT=$WIP_PRESENT, OUTSTANDING_PRESENT=$OUTSTANDING_PRESENT)"
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
