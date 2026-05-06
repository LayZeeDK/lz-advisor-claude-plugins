#!/usr/bin/env bash
# Smoke test for Finding D (security-reviewer side):
#   security-reviewer Output Constraint per-section budgets per Plan 07-14 <output_constraints>:
#   each Findings entry <=22w target / <=28w outlier soft cap,
#   ### Per-finding validation entries <=60w (optional surface),
#   ### Threat Patterns <=160w,
#   ### Missed surfaces (if present) <=30w.
#   No aggregate cap (dropped per user directive 2026-05-06 + Anthropic Apr 2026 postmortem).
# Empirical context: aggregate-cap pattern empirically falsified on plugin 0.12.2
# (n=4 mean 354.25w / 18% over; ALL 4 RUNS FAILED; Severity revisions vs. {initial,executor}:
# emergent surface drove ~50-100w of overshoot; not stochastic outlier per Plan 07-12 protocol).
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
else
  echo "[OK] Security-reviewer output sections present: Findings=1 TP=1"
fi

# Extract Findings section body (between '### Findings' and the next ### heading).
# Hardened per Plan 07-14 + 07-15: terminates on ANY subsequent `### ` heading
# so the new optional `### Per-finding validation` section between Findings and
# `### Threat Patterns` does NOT contaminate the per-finding entry parser.
FINDINGS_BODY="$SCRATCH/findings-body.txt"
awk '
  /^### Findings/ {flag=1; next}
  flag && /^### / {flag=0}
  flag {print}
' "$OUT" > "$FINDINGS_BODY" || true

# Per-entry Findings word count: split by numbered entry pattern (e.g., "1. ", "2. ") at column 0
# and assert each entry <=80w. Use Node ESM script for robust parsing.
ENTRY_CHECK_SCRIPT="$SCRATCH/check-entries.mjs"
cat > "$ENTRY_CHECK_SCRIPT" << 'EOF'
import { readFileSync } from 'node:fs';
const body = readFileSync(process.argv[2], 'utf8');

// Plan 07-09 fragment-grammar shape (security-reviewer): each finding emits as
//   `<file>:<line>: <severity>: [<OWASP-tag>] <threat>. <fix>.`
// Severity prefixes: crit | imp | sug | q
// OWASP tag: [A0N], [A10], [Uncategorized], [CVE-YYYY-NNNN], [GHSA-...], [CWE-NNN]
// Per-finding-line word target: <=22 words for threat + fix (excludes prefix).
// Soft target; occasional 28w outliers OK due to OWASP tag length variance.
const FRAGMENT_RE = /^[^:\s]+:\d+(?:-\d+)?:\s+(?:crit|imp|sug|q):\s+\[[A-Za-z0-9\-]+\]\s+(.+)$/gm;

// Backward-compat: Plan 07-04 numbered-section shape (1. ..., **Finding 1:**)
const LEGACY_RE = /^(?:\d+\.\s+|\*\*Finding\s+\d+:?\s*\*?\*?\s*)/m;

const fragmentMatches = [...body.matchAll(FRAGMENT_RE)];
let bad = 0;
let total = 0;

if (fragmentMatches.length > 0) {
  console.log(`[INFO] Fragment-grammar shape detected (security): ${fragmentMatches.length} finding line(s)`);
  fragmentMatches.forEach((m, idx) => {
    const tail = m[1].trim();
    const wc = tail.split(/\s+/).filter(Boolean).length;
    total++;
    if (wc > 28) {
      console.log(`[ERROR] Finding line ${idx + 1}: ${wc} words (>28 outlier soft cap; target <=22w)`);
      bad++;
    } else if (wc > 22) {
      console.log(`[WARN] Finding line ${idx + 1}: ${wc} words (>22 target but <=28 outlier; acceptable)`);
    } else {
      console.log(`[OK] Finding line ${idx + 1}: ${wc} words (<=22 target)`);
    }
  });
} else {
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

# Per-finding-validation block extraction (Plan 07-14 + 07-15: optional surface per
# the new <output_constraints> contract; absent on routine confirmations, present
# when severity differs or rationale is non-obvious; <=60w per entry).
PFV_BODY="$SCRATCH/pfv-body.txt"
awk '
  /^### Per-finding validation/ {flag=1; next}
  flag && /^### |^---|^\*\*Verdict scope/ {flag=0}
  flag {print}
' "$OUT" > "$PFV_BODY" || true

# Per-entry word count via Node ESM (mirrors check-entries.mjs pattern).
# Each entry is one paragraph keyed by the literal `Validation of Finding N:` prefix.
PFV_CHECK_SCRIPT="$SCRATCH/check-pfv-entries.mjs"
cat > "$PFV_CHECK_SCRIPT" << 'EOF'
import { readFileSync } from 'node:fs';
const body = readFileSync(process.argv[2], 'utf8');

// Match `Validation of Finding N: <body>` entries.
// Each entry is one paragraph (terminated by blank line then next entry, or end).
const PFV_RE = /^Validation of Finding \d+:\s+([\s\S]+?)(?=\n\nValidation of Finding|\n*$)/gm;
const matches = [...body.matchAll(PFV_RE)];

if (matches.length === 0) {
  console.log('[OK] Per-finding validation: section absent (optional)');
  process.exit(0);
}

console.log(`[INFO] Per-finding validation: ${matches.length} entries`);
let bad = 0;
matches.forEach((m, idx) => {
  const wc = m[1].trim().split(/\s+/).filter(Boolean).length;
  if (wc > 60) {
    console.log(`[ERROR] Per-finding validation entry ${idx + 1}: ${wc} words (>60 cap)`);
    bad++;
  } else {
    console.log(`[OK] Per-finding validation entry ${idx + 1}: ${wc} words (<=60 cap)`);
  }
});
process.exit(bad === 0 ? 0 : 1);
EOF

if ! node "$PFV_CHECK_SCRIPT" "$PFV_BODY"; then
  FAIL=1
fi

# Threat Patterns word count <=160w.
# Awk pattern terminates on real section boundaries: next ### heading, ---,
# **Missed surface: inline marker, **Verdict scope: inline marker. Markdown
# blank line (^$) is NOT a terminator since it appears immediately after every
# ### heading per markdown idiom.
TP_BODY="$SCRATCH/tp-body.txt"
awk '
  /^### Threat Patterns/ {flag=1; next}
  flag && /^\*\*Missed surface|^\*\*Verdict scope|^### |^---/ {flag=0}
  flag {print}
' "$OUT" > "$TP_BODY" || true
TP_WC=$(wc -w < "$TP_BODY" | tr -d ' ')
if [ "$TP_WC" -le 160 ]; then
  echo "[OK] Threat Patterns: $TP_WC words (<=160 cap)"
else
  echo "[ERROR] Threat Patterns: $TP_WC words (>160 cap)"
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

if [ "$FAIL" -ne 0 ]; then
  echo "--- security-reviewer output (last 200 lines) ---"
  tail -n 200 "$OUT"
  exit 1
fi

echo "[SUCCESS] D-security-reviewer-budget.sh: per-section budgets enforced (entries <=22w/28w outlier, Per-finding validation <=60w, Threat Patterns <=160w, Missed surfaces <=30w; aggregate cap dropped per Plan 07-14)"
