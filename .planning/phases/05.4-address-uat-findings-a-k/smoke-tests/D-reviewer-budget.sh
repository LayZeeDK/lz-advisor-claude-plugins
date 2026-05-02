#!/usr/bin/env bash
# Smoke test for Finding D (reviewer side):
#   reviewer Output Constraint sub-caps -- each Findings entry <=80w,
#   ### Cross-Cutting Patterns <=160w, ### Missed surfaces (if present) <=30w,
#   total <=300w aggregate.
# Empirical baseline (plugin 0.9.0): observed 411 words total, 37% over 300w cap.
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

PLUGIN_DIR="$(to_native "$(git rev-parse --show-toplevel)/plugins/lz-advisor")"
SCRATCH="$(to_native "$(mktemp -d -t lz-advisor-d-reviewer-XXXX)")"
trap 'rm -rf "$SCRATCH"' EXIT

cd "$SCRATCH"
git init -q
git commit -q --allow-empty -m "seed"

# Seed scratch repo with representative source files for reviewer to scan.
# Pattern mirrors DEF-response-structure.sh Finding F block (lines 82-87).
mkdir -p review-src
printf 'export function handle(req) {\n  if (req.body) return process(req.body);\n  return null;\n}\n\nfunction process(data) {\n  return JSON.parse(data);\n}\n' > review-src/handler.ts
printf 'export function validate(x) { return x != null; }\n' > review-src/validate.ts
git add review-src/handler.ts review-src/validate.ts
git commit -q -m "add unvalidated handler with JSON.parse for reviewer scenario"

OUT="$SCRATCH/D-reviewer-output.txt"
claude --model sonnet --effort medium --plugin-dir "$PLUGIN_DIR" \
  --dangerously-skip-permissions \
  -p "/lz-advisor.review Review the last commit." \
  --verbose > "$OUT" 2>&1 || true

FAIL=0

# Section presence check (preserves DEF-response-structure.sh F slot pattern)
HAS_FINDINGS=0
HAS_CCP=0
if rg -q "^### Findings" "$OUT"; then HAS_FINDINGS=1; fi
if rg -q "^### Cross-Cutting Patterns" "$OUT"; then HAS_CCP=1; fi
if [ "$HAS_FINDINGS" -ne 1 ] || [ "$HAS_CCP" -ne 1 ]; then
  echo "[ERROR] Reviewer output missing required sections: Findings=$HAS_FINDINGS CCP=$HAS_CCP"
  FAIL=1
else
  echo "[OK] Reviewer output sections present: Findings=1 CCP=1"
fi

# Extract Findings section body (between '### Findings' and '### Cross-Cutting Patterns')
FINDINGS_BODY="$SCRATCH/findings-body.txt"
awk '/^### Findings/,/^### Cross-Cutting Patterns/' "$OUT" | sed '1d;$d' > "$FINDINGS_BODY" || true

# Per-entry Findings word count: split by numbered entry pattern (e.g., "1. ", "2. ") at column 0
# and assert each entry <=80w. Use Node ESM script for robust parsing.
ENTRY_CHECK_SCRIPT="$SCRATCH/check-entries.mjs"
cat > "$ENTRY_CHECK_SCRIPT" << 'EOF'
import { readFileSync } from 'node:fs';
const body = readFileSync(process.argv[2], 'utf8');

// Plan 07-09 fragment-grammar shape: each finding emits as a single line
//   `<file>:<line>: <severity>: <problem>. <fix>.` (or `<file>:<start>-<end>: ...`)
// Severity prefixes: crit | imp | sug | q
// Per-finding-line word target: <=20 words for problem + fix combined (excludes
// the file:line: severity: prefix). Soft target; occasional 25w outliers OK.
const FRAGMENT_RE = /^[^:\s]+:\d+(?:-\d+)?:\s+(?:crit|imp|sug|q):\s+(.+)$/gm;

// Backward-compat: Plan 07-04 numbered-section shape (1. ..., **Finding 1:**)
const LEGACY_RE = /^(?:\d+\.\s+|\*\*Finding\s+\d+:?\s*\*?\*?\s*)/m;

const fragmentMatches = [...body.matchAll(FRAGMENT_RE)];
let bad = 0;
let total = 0;

if (fragmentMatches.length > 0) {
  // Fragment-grammar shape detected (Plan 07-09 contract).
  console.log(`[INFO] Fragment-grammar shape detected: ${fragmentMatches.length} finding line(s)`);
  fragmentMatches.forEach((m, idx) => {
    const fixClause = m[1].trim();
    const wc = fixClause.split(/\s+/).filter(Boolean).length;
    total++;
    if (wc > 25) {
      console.log(`[ERROR] Finding line ${idx + 1}: ${wc} words (>25 outlier soft cap; target <=20w)`);
      bad++;
    } else if (wc > 20) {
      console.log(`[WARN] Finding line ${idx + 1}: ${wc} words (>20 target but <=25 outlier; acceptable)`);
    } else {
      console.log(`[OK] Finding line ${idx + 1}: ${wc} words (<=20 target)`);
    }
  });
} else {
  // Fallback: Plan 07-04 numbered-section legacy shape.
  console.log('[WARN] Fragment-grammar shape NOT detected; falling back to Plan 07-04 numbered-section parser. New fragment-grammar shape is preferred per Plan 07-09.');
  const entries = body.split(LEGACY_RE).slice(1);
  if (entries.length === 0) {
    console.log('[ERROR] No Findings entries detected (neither fragment-grammar nor Plan 07-04 numbered shape matched)');
    process.exit(1);
  }
  entries.forEach((entry, idx) => {
    const wc = entry.trim().split(/\s+/).filter(Boolean).length;
    total++;
    if (wc > 80) {
      console.log(`[ERROR] Findings entry ${idx + 1}: ${wc} words (>80 legacy cap)`);
      bad++;
    } else {
      console.log(`[OK] Findings entry ${idx + 1}: ${wc} words (<=80 legacy)`);
    }
  });
}

console.log(`[INFO] Total findings: ${total}; bad: ${bad}`);
process.exit(bad === 0 ? 0 : 1);
EOF

if ! node "$ENTRY_CHECK_SCRIPT" "$FINDINGS_BODY"; then
  FAIL=1
fi

# Cross-Cutting Patterns word count <=160w.
# Awk pattern terminates on real section boundaries: next ### heading, ---,
# **Missed surface: inline marker, **Verdict scope: inline marker. Markdown
# blank line (^$) is NOT a terminator since it appears immediately after every
# ### heading per markdown idiom.
CCP_BODY="$SCRATCH/ccp-body.txt"
awk '
  /^### Cross-Cutting Patterns/ {flag=1; next}
  flag && /^\*\*Missed surface|^\*\*Verdict scope|^### |^---/ {flag=0}
  flag {print}
' "$OUT" > "$CCP_BODY" || true
CCP_WC=$(wc -w < "$CCP_BODY" | tr -d ' ')
if [ "$CCP_WC" -le 160 ]; then
  echo "[OK] Cross-Cutting Patterns: $CCP_WC words (<=160 cap)"
else
  echo "[ERROR] Cross-Cutting Patterns: $CCP_WC words (>160 cap)"
  FAIL=1
fi

# Missed surfaces (optional) word count <=30w if present.
# Support both shapes: '### Missed surfaces' heading OR '**Missed surface:' inline bold marker.
if rg -q '^### Missed surfaces|^\*\*Missed surface:' "$OUT"; then
  MS_BODY="$SCRATCH/ms-body.txt"
  awk '
    /^### Missed surfaces/ {flag=1; next}
    /^\*\*Missed surface:/ {flag=1}
    flag && /^\*\*Verdict scope|^### |^---/ {flag=0}
    flag {print}
  ' "$OUT" > "$MS_BODY" || true
  MS_WC=$(wc -w < "$MS_BODY" | tr -d ' ')
  if [ "$MS_WC" -le 30 ]; then
    echo "[OK] Missed surfaces: $MS_WC words (<=30 cap)"
  else
    echo "[ERROR] Missed surfaces: $MS_WC words (>30 cap)"
    FAIL=1
  fi
else
  echo "[OK] Missed surfaces: section absent (optional)"
fi

# Aggregate <=300w total across all reviewer-emitted sections (Findings + CCP +
# optional Missed surfaces). Terminates on **Verdict scope: inline marker or ---.
# The ^$ terminator was previously buggy because markdown convention puts a blank
# line right after every ### heading, prematurely ending the range.
AGG_BODY="$SCRATCH/aggregate-body.txt"
awk '
  /^### Findings/ {flag=1}
  flag && /^\*\*Verdict scope|^---/ {flag=0}
  flag {print}
' "$OUT" > "$AGG_BODY" || true
AGG_WC=$(wc -w < "$AGG_BODY" | tr -d ' ')
if [ "$AGG_WC" -le 300 ]; then
  echo "[OK] Aggregate: $AGG_WC words (<=300 cap)"
else
  echo "[ERROR] Aggregate: $AGG_WC words (>300 cap; regression)"
  FAIL=1
fi

if [ "$FAIL" -ne 0 ]; then
  echo "--- reviewer output (last 200 lines) ---"
  tail -n 200 "$OUT"
  exit 1
fi

echo "[SUCCESS] D-reviewer-budget.sh: all sub-caps enforced (entries <=80w, CCP <=160w, Missed surfaces <=30w, total <=300w)"
