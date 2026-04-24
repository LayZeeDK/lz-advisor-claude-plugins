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
# Shape 3 redesign (Phase 5.6 Plan 02): assert on stream-json JSONL instead of
# `-p` stdout. Sonnet's verbatim SD echo lands on an intermediate assistant
# turn, which `-p` stdout does not surface (only final-turn text reaches stdout).
# The JSONL trace preserves all turns, so we parse the advisor's tool_result
# directly via extract-advisor-sd.mjs, which matches the Agent tool_use_id with
# subagent_type "lz-advisor:advisor". See 05.6-02-inspection.md for the Shape 3
# root cause analysis.
#
# Contamination fix: remove any stale plans/ directory from a prior D-invocation
# before the E run so the advisor sees a clean fixture state rather than a
# second-invocation re-entry.
rm -rf "$SCRATCH/plans"

OUT_E_JSONL="$SCRATCH/E-output.jsonl"
claude --model sonnet --effort medium --plugin-dir "$PLUGIN_DIR" \
  --dangerously-skip-permissions \
  -p "/lz-advisor.plan Add auth to this API. The frontend uses cookies." \
  --verbose --output-format stream-json > "$OUT_E_JSONL" 2>&1 || true

EXTRACTOR="$(git -C "$PLUGIN_DIR" rev-parse --show-toplevel)/.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/extract-advisor-sd.mjs"
SD_E_FILE="$SCRATCH/E-sd.txt"
node "$EXTRACTOR" "$OUT_E_JSONL" > "$SD_E_FILE" 2>/dev/null || true

if rg -q '^[0-9]+\. Assuming .+ \(unverified\), do .+\. Verify .+ before acting\.' "$SD_E_FILE"; then
  echo "[OK] Finding E: advisor used literal Assuming (unverified) frame for thin-context task"
else
  echo "[ERROR] Finding E: no literal-frame Assuming X (unverified), do Y. Verify X before acting. in advisor response"
  FAIL=1
fi

# -------- Word-budget: advisor Strategic Direction <=100 words --------
# Operates on the extracted advisor SD (from tool_result content), not stdout.
# The tool_result content starts at the advisor's first numbered item and ends
# at the last paragraph of the advisor response; any **Critical:** block is
# part of that response and must still be stripped for budget accounting per
# Phase 5.4 D-15. The sed pattern anchors at column 0 (^\*\*Critical:\*\*) so
# indented matches inside code fences do not false-positive-strip.
WC=$(sed '/^\*\*Critical:\*\*/,$d' "$SD_E_FILE" | wc -w | tr -d ' ')
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

# -------- Finding I: under-supply protection (thin-context fixtures MUST produce >=2 framed items) --------
# Letter continues Phase 5.4 A-K convention; tightened E catches paraphrase drift,
# Finding I catches under-supply (regression mode where advisor uses frame in 0-1 items when 4+ items genuinely need it).
# Shape 3 redesign: operates on the JSONL-extracted advisor SD ($SD_E_FILE), not stdout.
ASSUM_COUNT=$(rg -c '^[0-9]+\. Assuming ' "$SD_E_FILE" || echo 0)
if [ "$ASSUM_COUNT" -ge 2 ]; then
  echo "[OK] Finding I: advisor emitted $ASSUM_COUNT Assuming-framed items (>=2)"
else
  echo "[ERROR] Finding I: only $ASSUM_COUNT Assuming-framed item(s) (need >=2 for thin-context calibration)"
  FAIL=1
fi

# Print the extracted advisor SD for debugging -- this is the authoritative content
# that Findings E, I, and Word-budget are asserting against.
echo "--- E advisor Strategic Direction (extracted from JSONL tool_result) ---"
cat "$SD_E_FILE" 2>/dev/null || echo "(empty or unreadable)"
echo "--- End E advisor Strategic Direction ---"

if [ "$FAIL" -ne 0 ]; then
  echo "--- D trace tail (raw stdout) ---"; tail -n 80 "$OUT_D" || true
  echo "--- E JSONL tail (last 20 lines) ---"; tail -n 20 "$OUT_E_JSONL" || true
  echo "--- F trace tail ---"; tail -n 80 "$OUT_F" || true
  echo "--- G+H trace tail ---"; tail -n 80 "$OUT_GH" || true
  exit 1
fi

echo "[SUCCESS] Smoke tests D + E + F + G + H + I + word-budget passed (or warned with manual-review note)"
