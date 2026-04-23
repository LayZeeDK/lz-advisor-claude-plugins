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

# -------- Word-budget: advisor Strategic Direction <=100 words --------
# Reuse OUT_E output (advisor response from the thin-context plan call in Finding E).
# Strip any **Critical:** block (line-anchored, extends to EOF) before counting --
# the Critical block is budget-excluded per Phase 5.4 D-15. The sed pattern anchors
# at column 0 (^\*\*Critical:\*\*) so indented matches inside code fences do not
# false-positive-strip.
WC=$(sed '/^\*\*Critical:\*\*/,$d' "$OUT_E" | wc -w | tr -d ' ')
if [ "$WC" -le 100 ]; then
  echo "[OK] Word-budget: advisor Strategic Direction $WC words (<=100)"
else
  echo "[ERROR] Word-budget: advisor Strategic Direction $WC words (>100 cap)"
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

# -------- Findings G + H: security-reviewer on same commit produces two slots -----
# D-06: security-reviewer has its own ### Findings + ### Threat Patterns contract
# (security-flavored analogue of reviewer's ### Findings + ### Cross-Cutting Patterns).
# D-07: reuse the F-block review-src/handler.ts + review-src/validate.ts commit
# fixture (already in git at this point); no new commits needed.
# Use a SEPARATE claude -p invocation -- /lz-advisor.security-review is a different
# skill with different scan logic; re-using F's OUT_F would test reviewer output
# against a security-reviewer expected shape, which would always fail structurally.
OUT_GH="$SCRATCH/GH-output.txt"
claude --model sonnet --effort medium --plugin-dir "$PLUGIN_DIR" \
  --dangerously-skip-permissions \
  -p "/lz-advisor.security-review Review the last commit." \
  --verbose > "$OUT_GH" 2>&1 || true

HAS_SEC_FINDINGS=0
HAS_TP=0
if rg -q "^### Findings" "$OUT_GH"; then HAS_SEC_FINDINGS=1; fi
if rg -q "^### Threat Patterns" "$OUT_GH"; then HAS_TP=1; fi

if [ "$HAS_SEC_FINDINGS" -eq 1 ] && [ "$HAS_TP" -eq 1 ]; then
  echo "[OK] Findings G+H: security-reviewer response has both ### Findings and ### Threat Patterns slots"
else
  echo "[ERROR] Findings G+H: missing named slot(s): Findings=$HAS_SEC_FINDINGS TP=$HAS_TP"
  FAIL=1
fi

if [ "$FAIL" -ne 0 ]; then
  echo "--- D trace tail ---"; tail -n 80 "$OUT_D" || true
  echo "--- E trace tail ---"; tail -n 80 "$OUT_E" || true
  echo "--- F trace tail ---"; tail -n 80 "$OUT_F" || true
  echo "--- G+H trace tail ---"; tail -n 80 "$OUT_GH" || true
  exit 1
fi

echo "[SUCCESS] Smoke tests D + E + F + G + H + word-budget passed (or warned with manual-review note)"
