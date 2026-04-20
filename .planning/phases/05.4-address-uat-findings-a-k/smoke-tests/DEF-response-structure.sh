#!/usr/bin/env bash
# Smoke test for Findings D + E + F:
#   D: advisor surfaces **Critical:** only when silence would cause regret
#      (innocuous task should NOT produce a Critical block)
#   E: inline Assuming X (unverified) framing appears when advice depends
#      on unpackaged context
#   F: reviewer response has ### Findings + ### Cross-Cutting Patterns
#      named slots with distinct budgets
set -eu

PLUGIN_DIR="$(git rev-parse --show-toplevel)/plugins/lz-advisor"
SCRATCH="$(mktemp -d -t lz-advisor-def-XXXX)"
trap 'rm -rf "$SCRATCH"' EXIT

cd "$SCRATCH"
git init -q
git commit -q --allow-empty -m "seed"

FAIL=0

# -------- Finding D: innocuous plan task should NOT produce Critical --------
OUT_D="$SCRATCH/D-output.txt"
claude --model sonnet --effort medium --plugin-dir "$PLUGIN_DIR" \
  --dangerously-skip-permissions \
  -p "/lz-advisor.plan Set up a CI pipeline for a fresh Node.js project using GitHub Actions. Run tests and lint on push." \
  --verbose > "$OUT_D" 2>&1 || true

if rg -q '\*\*Critical:\*\*' "$OUT_D"; then
  echo "[WARN] Finding D: advisor emitted \`**Critical:**\` for an innocuous task. Inspect manually to judge inflation."
  echo "       If the Critical content is genuinely correctness/security/data-loss risking, this is OK."
  echo "       If it is triage bonus content (helpful-but-unasked), fall back to R-03 conservative phrasing."
else
  echo "[OK] Finding D: advisor did NOT emit Critical for innocuous task (Position B calibration landed)"
fi

# -------- Finding E: thin-context prompt should produce Assuming X ----------
OUT_E="$SCRATCH/E-output.txt"
claude --model sonnet --effort medium --plugin-dir "$PLUGIN_DIR" \
  --dangerously-skip-permissions \
  -p "/lz-advisor.plan Add auth to this API. The frontend uses cookies." \
  --verbose > "$OUT_E" 2>&1 || true

if rg -iq "Assuming .*\(unverified\)|unverified" "$OUT_E"; then
  echo "[OK] Finding E: advisor used Assuming X (unverified) framing for thin-context task"
else
  echo "[ERROR] Finding E: no unverified-framing phrase in advisor response"
  FAIL=1
fi

# -------- Finding F: reviewer on a real commit should produce two slots -----
mkdir -p review-src
printf 'export function handle(req) {\n  if (req.body) return process(req.body);\n  return null;\n}\n\nfunction process(data) {\n  return JSON.parse(data);\n}\n' > review-src/handler.ts
printf 'export function validate(x) { return x != null; }\n' > review-src/validate.ts
git add review-src/handler.ts review-src/validate.ts
git commit -q -m "add unvalidated handler with JSON.parse"

OUT_F="$SCRATCH/F-output.txt"
claude --model sonnet --effort medium --plugin-dir "$PLUGIN_DIR" \
  --dangerously-skip-permissions \
  -p "/lz-advisor.review Review the last commit." \
  --verbose > "$OUT_F" 2>&1 || true

HAS_FINDINGS=0
HAS_CCP=0
if rg -q "^### Findings" "$OUT_F"; then HAS_FINDINGS=1; fi
if rg -q "^### Cross-Cutting Patterns" "$OUT_F"; then HAS_CCP=1; fi

if [ "$HAS_FINDINGS" -eq 1 ] && [ "$HAS_CCP" -eq 1 ]; then
  echo "[OK] Finding F: reviewer response has both ### Findings and ### Cross-Cutting Patterns slots"
else
  echo "[ERROR] Finding F: missing named slot(s): Findings=$HAS_FINDINGS CCP=$HAS_CCP"
  FAIL=1
fi

if [ "$FAIL" -ne 0 ]; then
  echo "--- D trace tail ---"; tail -n 80 "$OUT_D" || true
  echo "--- E trace tail ---"; tail -n 80 "$OUT_E" || true
  echo "--- F trace tail ---"; tail -n 80 "$OUT_F" || true
  exit 1
fi

echo "[SUCCESS] Smoke tests D + E + F passed (or warned with manual-review note)"
