#!/usr/bin/env bash
# Smoke test for Finding D (security-reviewer side):
#   security-reviewer Output Constraint sub-caps -- each Findings entry <=80w,
#   ### Threat Patterns <=160w, ### Missed surfaces (if present) <=30w,
#   total <=300w aggregate.
# Empirical baseline: observed 412 words on plugin 0.8.9, 438 words on plugin 0.9.0
# (46% over 300w cap) -- WORST regression among the 3 agents and the strongest
# reinforcement reason.
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
SCRATCH="$(to_native "$(mktemp -d -t lz-advisor-d-security-reviewer-XXXX)")"
trap 'rm -rf "$SCRATCH"' EXIT

cd "$SCRATCH"
git init -q
git commit -q --allow-empty -m "seed"

# Seed scratch repo with representative source files for security-reviewer to scan.
# Pattern mirrors DEF-response-structure.sh Finding F block (lines 82-87).
mkdir -p review-src
printf 'export function handle(req) {\n  if (req.body) return process(req.body);\n  return null;\n}\n\nfunction process(data) {\n  return JSON.parse(data);\n}\n' > review-src/handler.ts
printf 'export function validate(x) { return x != null; }\n' > review-src/validate.ts
git add review-src/handler.ts review-src/validate.ts
git commit -q -m "add unvalidated handler with JSON.parse for security-reviewer scenario"

OUT="$SCRATCH/D-security-reviewer-output.txt"
claude --model sonnet --effort medium --plugin-dir "$PLUGIN_DIR" \
  --dangerously-skip-permissions \
  -p "/lz-advisor.security-review Review the last commit." \
  --verbose > "$OUT" 2>&1 || true

FAIL=0

# Section presence check (preserves DEF-response-structure.sh G+H slot pattern)
HAS_FINDINGS=0
HAS_TP=0
if rg -q "^### Findings" "$OUT"; then HAS_FINDINGS=1; fi
if rg -q "^### Threat Patterns" "$OUT"; then HAS_TP=1; fi
if [ "$HAS_FINDINGS" -ne 1 ] || [ "$HAS_TP" -ne 1 ]; then
  echo "[ERROR] Security-reviewer output missing required sections: Findings=$HAS_FINDINGS TP=$HAS_TP"
  FAIL=1
fi

# Extract Findings section body (between '### Findings' and '### Threat Patterns')
FINDINGS_BODY="$SCRATCH/findings-body.txt"
awk '/^### Findings/,/^### Threat Patterns/' "$OUT" | sed '1d;$d' > "$FINDINGS_BODY" || true

# Per-entry Findings word count: split by numbered entry pattern (e.g., "1. ", "2. ") at column 0
# and assert each entry <=80w. Use Node ESM script for robust parsing.
ENTRY_CHECK_SCRIPT="$SCRATCH/check-entries.mjs"
cat > "$ENTRY_CHECK_SCRIPT" << 'EOF'
import { readFileSync } from 'node:fs';
const body = readFileSync(process.argv[2], 'utf8');
const entries = body.split(/^\d+\.\s/m).slice(1);
let bad = 0;
entries.forEach((entry, idx) => {
  const wc = entry.trim().split(/\s+/).filter(Boolean).length;
  if (wc > 80) {
    console.log(`[ERROR] Findings entry ${idx + 1}: ${wc} words (>80 cap)`);
    bad++;
  } else {
    console.log(`[OK] Findings entry ${idx + 1}: ${wc} words (<=80)`);
  }
});
process.exit(bad === 0 ? 0 : 1);
EOF

if ! node "$ENTRY_CHECK_SCRIPT" "$FINDINGS_BODY"; then
  FAIL=1
fi

# Threat Patterns word count <=160w
TP_BODY="$SCRATCH/tp-body.txt"
awk '/^### Threat Patterns/,/^### Missed surfaces|^---|^$/' "$OUT" | sed '1d' > "$TP_BODY" || true
TP_WC=$(wc -w < "$TP_BODY" | tr -d ' ')
if [ "$TP_WC" -le 160 ]; then
  echo "[OK] Threat Patterns: $TP_WC words (<=160 cap)"
else
  echo "[ERROR] Threat Patterns: $TP_WC words (>160 cap)"
  FAIL=1
fi

# Missed surfaces (optional) word count <=30w if present
if rg -q "^### Missed surfaces" "$OUT"; then
  MS_BODY="$SCRATCH/ms-body.txt"
  awk '/^### Missed surfaces/,/^---|^$/' "$OUT" | sed '1d' > "$MS_BODY" || true
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

# Aggregate <=300w total across all security-reviewer-emitted sections
AGG_BODY="$SCRATCH/aggregate-body.txt"
awk '/^### Findings/,/^---|^$/' "$OUT" | sed '/^---/,$d' > "$AGG_BODY" || true
AGG_WC=$(wc -w < "$AGG_BODY" | tr -d ' ')
if [ "$AGG_WC" -le 300 ]; then
  echo "[OK] Aggregate: $AGG_WC words (<=300 cap)"
else
  echo "[ERROR] Aggregate: $AGG_WC words (>300 cap; regression)"
  FAIL=1
fi

if [ "$FAIL" -ne 0 ]; then
  echo "--- security-reviewer output (last 200 lines) ---"
  tail -n 200 "$OUT"
  exit 1
fi

echo "[SUCCESS] D-security-reviewer-budget.sh: all sub-caps enforced (entries <=80w, Threat Patterns <=160w, Missed surfaces <=30w, total <=300w)"
