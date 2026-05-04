#!/usr/bin/env bash
# Smoke test for Finding D (advisor side):
#   advisor Strategic Direction <=100 words on the canonical Compodoc+Storybook scenario
# Empirical baseline (plugin 0.9.0): observed 109-121 words, 9-21% over cap.
# This fixture catches regressions when descriptive sub-cap prose slips.
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
SCRATCH="$(to_native "$(mktemp -d -t lz-advisor-d-advisor-XXXX)")"
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
EXTRACTOR="$REPO_ROOT/.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/extract-advisor-sd.mjs"
SD_FILE="$SCRATCH/advisor-sd.txt"
node "$EXTRACTOR" "$OUT_JSONL" > "$SD_FILE" 2>/dev/null || true

if [ ! -s "$SD_FILE" ]; then
  echo "[ERROR] Could not extract advisor Strategic Direction from JSONL trace"
  echo "--- trace tail (last 50 lines) ---"
  tail -n 50 "$OUT_JSONL"
  exit 1
fi

FAIL=0

# Strip **Critical:** block (it is uncounted per advisor.md ## Output Constraint rule).
# Resulting body should be the numbered Strategic Direction list ONLY.
SD_BODY="$SCRATCH/advisor-sd-body.txt"
sed '/^\*\*Critical:\*\*/,$d' "$SD_FILE" > "$SD_BODY"

# Plan 07-10 fragment-grammar shape: each numbered item emits as
#   `<N>. <verb-led action>. <concrete object or path>. <one-clause rationale or Assuming-frame if needed>.`
# Per-item word target: <=15 words (verb + object + clause; excludes the leading "N.").
# Items using the literal Assuming-frame are accepted up to 22w because the frame substitutes
# verbatim phrases that do not compress (Plan 07-02 verify-skip discipline grep contract).
# Aggregate cap: <=100 words across all numbered items combined.

ITEM_CHECK_SCRIPT="$SCRATCH/check-advisor-items.mjs"
cat > "$ITEM_CHECK_SCRIPT" << 'EOF'
import { readFileSync } from 'node:fs';
const body = readFileSync(process.argv[2], 'utf8');

// Per-item shape: numbered list, body ends at first sentence-final period followed by line end
//   `^\d+\.\s+(.+?)\.\s*$`
// Captures the body of each numbered item (without the leading "N." or trailing period).
// Multiline mode: each item is a single line in the canonical shape.
const ADVISOR_FRAGMENT_RE = /^\d+\.\s+(.+?)\.\s*$/gm;

// Items using the literal Assuming-frame are inherently longer (verbatim phrase preservation).
// Frame contract: `Assuming X (unverified), do Y. Verify X before acting.`
// The frame consumes 7+ words alone (Assuming, (unverified), do, Verify, before, acting); X+Y add the rest.
// Note: ADVISOR_FRAGMENT_RE consumes the line-final period; the captured itemBody therefore
// lacks the trailing `.` of `before acting.` -- frame detection accepts both forms.
const ASSUMING_FRAME_RE = /Assuming\s+.+?\s+\(unverified\),\s+do\s+.+?\.\s+Verify\s+.+?\s+before\s+acting\b/;

const matches = [...body.matchAll(ADVISOR_FRAGMENT_RE)];

if (matches.length === 0) {
  console.log('[WARN] Fragment-grammar shape NOT detected; falling back to Plan 07-04 legacy whole-body word count. New fragment-grammar shape is preferred per Plan 07-10.');
  // Signal fallback path; the bash caller will use the legacy aggregate-only assertion.
  process.exit(2);
}

console.log(`[INFO] Fragment-grammar shape detected: ${matches.length} numbered item(s)`);

let bad = 0;
let total = 0;
let aggregateWc = 0;

matches.forEach((m, idx) => {
  const itemBody = m[1].trim();
  const wc = itemBody.split(/\s+/).filter(Boolean).length;
  const isFrame = ASSUMING_FRAME_RE.test(itemBody);
  total++;
  aggregateWc += wc;

  if (isFrame) {
    if (wc > 22) {
      console.log(`[ERROR] Item ${idx + 1} (Assuming-frame): ${wc} words (>22 outlier soft cap)`);
      bad++;
    } else if (wc > 18) {
      console.log(`[INFO] Item ${idx + 1} (Assuming-frame): ${wc} words (>18 but <=22 outlier; acceptable for frame items)`);
    } else {
      console.log(`[OK] Item ${idx + 1} (Assuming-frame): ${wc} words`);
    }
  } else {
    if (wc > 18) {
      console.log(`[ERROR] Item ${idx + 1}: ${wc} words (>18 outlier; target <=15w)`);
      bad++;
    } else if (wc > 15) {
      console.log(`[INFO] Item ${idx + 1}: ${wc} words (>15 target but <=18 outlier; acceptable)`);
    } else {
      console.log(`[OK] Item ${idx + 1}: ${wc} words (<=15 target)`);
    }
  }
});

console.log(`[INFO] Per-item check: ${total} items; ${bad} over-cap; aggregate ${aggregateWc} words`);
process.exit(bad === 0 ? 0 : 1);
EOF

# Run the per-item check; exit codes:
#   0 -- fragment-grammar detected AND all items within per-item target/outlier
#   1 -- fragment-grammar detected BUT one or more items over per-item outlier limit
#   2 -- fragment-grammar NOT detected (legacy prose shape; fall back to whole-body wc)
ITEM_RC=0
node "$ITEM_CHECK_SCRIPT" "$SD_BODY" || ITEM_RC=$?

case "$ITEM_RC" in
  0)
    echo "[OK] Finding D (advisor) per-item check: all items within target"
    ;;
  1)
    echo "[ERROR] Finding D (advisor) per-item check: one or more items over per-item outlier limit"
    FAIL=1
    ;;
  2)
    echo "[INFO] Finding D (advisor): legacy prose shape detected; aggregate-only assertion applies"
    ;;
  *)
    echo "[ERROR] Finding D (advisor) per-item parser: unexpected exit code $ITEM_RC"
    FAIL=1
    ;;
esac

# Aggregate <=100w assertion (preserved from prior fixture; applies in BOTH fragment-grammar and legacy paths).
LEGACY_WC=$(wc -w < "$SD_BODY" | tr -d ' ')
WC="$LEGACY_WC"
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
