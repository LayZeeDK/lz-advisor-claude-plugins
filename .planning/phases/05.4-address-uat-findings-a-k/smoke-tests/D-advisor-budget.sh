#!/usr/bin/env bash
# Smoke test for Finding D (advisor side):
#   advisor Strategic Direction <=100 words on the canonical Compodoc+Storybook scenario
# Empirical baseline (plugin 0.9.0): observed 109-121 words, 9-21% over cap.
# This fixture catches regressions when descriptive sub-cap prose slips.
set -eu

PLUGIN_DIR="$(git rev-parse --show-toplevel)/plugins/lz-advisor"
SCRATCH="$(mktemp -d -t lz-advisor-d-advisor-XXXX)"
trap 'rm -rf "$SCRATCH"' EXIT

cd "$SCRATCH"
git init -q
git commit -q --allow-empty -m "seed"

# Seed package.json declaring representative Storybook + Compodoc + Angular versions
# (matching ngx-smart-components testbed shape so the advisor's scenario aligns
# with the empirical UAT chain that surfaced Finding D)
cat > package.json << 'EOF'
{
  "name": "scratch-fixture",
  "version": "0.0.1",
  "devDependencies": {
    "@storybook/angular": "10.3.5",
    "@compodoc/compodoc": "1.2.1",
    "@angular/core": "18.2.0",
    "nx": "19.0.0"
  }
}
EOF
git add package.json
git commit -q -m "seed package.json with representative versions"

# Invoke plan skill on canonical Compodoc + Storybook scenario.
# This matches the prompt shape used in 06-UAT.md Test 8 (advisor SD = 120w on plugin 0.9.0).
OUT_JSONL="$SCRATCH/D-advisor-output.jsonl"
claude --model sonnet --effort medium --plugin-dir "$PLUGIN_DIR" \
  --dangerously-skip-permissions \
  -p "/lz-advisor.plan Set up Compodoc with Storybook in this Nx Angular library so the Docs tab renders descriptions for component inputs and outputs." \
  --verbose --output-format stream-json > "$OUT_JSONL" 2>&1 || true

# Extract advisor Strategic Direction from JSONL using existing extractor.
EXTRACTOR="$(git -C "$PLUGIN_DIR" rev-parse --show-toplevel)/.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/extract-advisor-sd.mjs"
SD_FILE="$SCRATCH/advisor-sd.txt"
node "$EXTRACTOR" "$OUT_JSONL" > "$SD_FILE" 2>/dev/null || true

if [ ! -s "$SD_FILE" ]; then
  echo "[ERROR] Could not extract advisor Strategic Direction from JSONL trace"
  echo "--- trace tail (last 50 lines) ---"
  tail -n 50 "$OUT_JSONL"
  exit 1
fi

FAIL=0

# Word-budget assertion: strip **Critical:** block (per DEF-response-structure.sh line 73-74)
# then count words in the remaining SD body.
WC=$(sed '/^\*\*Critical:\*\*/,$d' "$SD_FILE" | wc -w | tr -d ' ')
if [ "$WC" -le 100 ]; then
  echo "[OK] Finding D (advisor): Strategic Direction $WC words (<=100 cap)"
else
  echo "[ERROR] Finding D (advisor): Strategic Direction $WC words (>100 cap; regression)"
  FAIL=1
fi

# Print extracted SD for debugging.
echo "--- advisor Strategic Direction (extracted from JSONL) ---"
cat "$SD_FILE"
echo "--- End advisor Strategic Direction ---"

if [ "$FAIL" -ne 0 ]; then
  echo "--- trace tail (last 100 lines) ---"
  tail -n 100 "$OUT_JSONL"
  exit 1
fi

echo "[SUCCESS] D-advisor-budget.sh: advisor 100w cap enforced ($WC words)"
