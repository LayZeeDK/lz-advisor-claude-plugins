#!/usr/bin/env bash
# Smoke test for Finding J (D-04/D-05/D-06): Review scope derives from git,
# not conversation narrative. Creates a scratch git repo with one diff across
# two files and a plan file that claims file B is "unchanged."  Asserts the
# review skill scans both files anyway.
set -eu

PLUGIN_DIR="$(git rev-parse --show-toplevel)/plugins/lz-advisor"
SCRATCH="$(mktemp -d -t lz-advisor-j-XXXX)"
trap 'rm -rf "$SCRATCH"' EXIT

cd "$SCRATCH"
git init -q
git commit -q --allow-empty -m "seed"
mkdir -p src/auth
printf 'export const loginHandler = (u) => { return u };\n' > src/auth/login.ts
printf 'export const sessionStore = new Map();\n' > src/auth/session.ts
git add src/auth/login.ts src/auth/session.ts
git commit -q -m "add auth scaffolding"

# Introduce a subtle bug in session.ts (narrative will claim session.ts unchanged)
printf 'export const sessionStore = new Map();\nexport const getSession = (id) => sessionStore.get(id); // missing null check\n' > src/auth/session.ts
printf 'export const loginHandler = (u) => { if (!u) return null; return u; };\n' > src/auth/login.ts

# Write a plan file that narratively excludes session.ts from review
mkdir -p plans
printf '# Plan: Auth fix\n\n## Strategic Direction\n\nFix login null handling. session.ts is unchanged.\n\n## Steps\n\n1. Update login.ts null check.\n' > plans/auth-fix.plan.md

# Invoke review (non-interactive)
OUT="$SCRATCH/review-output.txt"
claude --model sonnet --effort medium --plugin-dir "$PLUGIN_DIR" \
  --dangerously-skip-permissions \
  -p "/lz-advisor.review Review the recent changes in src/auth. See @plans/auth-fix.plan.md for context." \
  --verbose > "$OUT" 2>&1 || true

# Assert session.ts appears in the review output (scan did not skip it)
if grep -q "session.ts" "$OUT"; then
  echo "[OK] Finding J smoke test passed: session.ts was scanned despite plan narrative."
else
  echo "[ERROR] Finding J smoke test FAILED: session.ts absent from review output."
  echo "--- review output ---"
  cat "$OUT"
  exit 1
fi
