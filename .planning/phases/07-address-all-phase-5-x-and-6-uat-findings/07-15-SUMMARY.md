---
phase: 07
plan: 15
subsystem: plugins/lz-advisor (smoke fixtures binding the per-section contract)
tags: [smoke-fixture, parser-update, per-section-budgets, gap-closure-3]
requires:
  - 07-14 (per-section <output_constraints> XML contract on agents/{reviewer,security-reviewer}.md; the new contract this plan binds the fixtures to; landed in commits 76ac386 + bb455e0 + 20325c8)
  - 07-RESEARCH-GAP-3-per-section-budgets.md (Q3 Code Examples Example 2 = canonical PFV parser shape; Pitfall 2 = awk range hardening)
  - User directive 2026-05-06 (per-finding entry thresholds 22w target / 28w outlier soft cap; replaces 20w/25w on reviewer side)
  - 07-UAT-REGRESSION-0.12.2.md (n=4 D-security-reviewer-budget mean 354.25w / 4-of-4 FAIL on aggregate cap = empirical falsification of the aggregate-300w assertion)
provides:
  - FIND-D structural fixture surface: D-reviewer-budget.sh enforces per-section budgets via 5 distinct sub-checks (Findings entries 22w/28w outlier + Per-finding validation 60w + CCP 160w + Missed surfaces 30w + section presence); the legacy aggregate <=300w assertion is REMOVED.
  - GAP-D-budget-empirical structural fixture surface: D-security-reviewer-budget.sh mirrors D-reviewer-budget.sh per-section enforcement with the security-variant section names (Threat Patterns vs Cross-Cutting Patterns).
  - Per-finding-validation parser surface (PFV_BODY + PFV_CHECK_SCRIPT + PFV_RE) byte-identical across both fixtures: extracts the optional `### Per-finding validation` section, matches `Validation of Finding N: <body>` entries via gm regex with lookahead, asserts <=60w per entry, treats absent section as OK path (optional per Plan 07-14 contract).
  - Findings extraction awk hardened against future section additions: terminates on ANY subsequent `### ` heading (vs hard-coded `### Cross-Cutting Patterns` / `### Threat Patterns`), so insertion of `### Per-finding validation` between Findings and CCP/TP does NOT contaminate the per-finding entry parser.
affects:
  - Plan 07-17 live empirical gate: 3x re-run of both fixtures against plugin 0.13.0; the structural rebind in this plan is the precondition for that gate (without it, the fixtures would FAIL on any output emitting the new authorized `### Per-finding validation` surface).
  - No behavioral change to plugin agents (only fixture parsers updated); plugin 0.12.2 byte-identical pre/post this plan.
tech-stack:
  added: []
  patterns:
    - "PFV parser as a Node ESM script generated via heredoc (mirrors existing ENTRY_CHECK_SCRIPT pattern); single-pass regex with multi-line + global flags + negative lookahead for paragraph boundary detection"
    - "Awk range hardening: terminate on `^### ` (any subsequent ### heading) rather than hard-coded section name; defends against Pitfall 2 (silent contamination by inserted sections)"
    - "Cross-file structural symmetry: PFV parser blocks byte-identical across reviewer + security-reviewer fixtures (verified via diff after both edits land); the symmetry is enforced by a single atomic plan touching both files"
    - "Per-finding entry threshold update applied to D-reviewer-budget.sh only (20w/25w -> 22w/28w); D-security-reviewer-budget.sh thresholds preserved at 22w/28w (already aligned since Plan 07-09)"
    - "Aggregate cap pattern empirically falsified across n=4 D-security-reviewer-budget runs on plugin 0.12.2 (mean 354.25w / 4-of-4 FAIL); per-section budgets are the 2026-standard pattern (AgentIF + Anthropic Apr 2026 postmortem)"
key-files:
  created:
    - .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-15-SUMMARY.md
  modified:
    - .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-reviewer-budget.sh (Task 1; +72 / -32 lines; 6 surgical edits A-F per plan)
    - .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-security-reviewer-budget.sh (Task 2; +64 / -27 lines; symmetric edits A + C-F; Edit B skipped per plan -- thresholds already aligned)
decisions:
  - "PFV parser block byte-identical across both fixtures. The Plan 07-14 XML <output_constraints> contract specifies the same `### Per-finding validation` section + `Validation of Finding N:` per-entry prefix + 60w cap on both reviewer agents. A single regex + Node ESM script binds the contract; cross-file diff confirms 0 bytes of difference between the two PFV blocks. Pitfall 3 mitigation (atomic plan) carried forward from Plan 07-14."
  - "Aggregate-cap removal as deletion (not stub-then-replace). The legacy block (AGG_BODY + AGG_WC + 300-cap if-test) is removed in its entirety, including the comment block explaining the previously-buggy ^$ terminator. The empirical falsification rationale lives in the new header comment + the new [SUCCESS] message + the SUMMARY.md decisions; no placeholder echo of the old assertion remains."
  - "Per-finding entry threshold update on D-reviewer-budget.sh ONLY (20w/25w -> 22w/28w). D-security-reviewer-budget.sh already had 22w/28w in place since Plan 07-09 (the user directive 2026-05-06 table values were anticipated empirically by the existing security-reviewer prompt-line word target). Asymmetric update is intentional and aligns both fixtures with the new agent contract."
  - "Findings extraction awk hardening (terminate on ANY ### heading) chosen over a more permissive regex like `^(### |---|\\*\\*Verdict scope)`. The plan's interfaces section explicitly cites Pitfall 2 as the load-bearing reference. The simpler `^### / {flag=0}` matches markdown heading semantics and defends against future section insertions without coupling the parser to the specific set of currently-known sibling sections."
metrics:
  duration: ~3min
  completed: 2026-05-06
  tasks: 2
  files_modified: 2
---

# Phase 07 Plan 15: Smoke-Fixture Rebind to Per-Section Budget Contract Summary

Updates `D-reviewer-budget.sh` and `D-security-reviewer-budget.sh` to bind the new per-section `<output_constraints>` contract from Plan 07-14. Removes the aggregate-300w assertion (empirically falsified across n=4 D-security-reviewer-budget runs on plugin 0.12.2). Adds a per-finding-validation parser that extracts the optional `### Per-finding validation` section and asserts each `Validation of Finding N: <body>` entry <=60w. Updates D-reviewer-budget per-finding entry thresholds 20w/25w -> 22w/28w. Hardens Findings extraction awk to terminate on ANY subsequent `### ` heading (Pitfall 2 mitigation against silent contamination by inserted sections).

This is the Wave 2 fixture-side counterpart to Plan 07-14's Wave 1 prompt redesign. Without this plan, the fixtures would FAIL on any output emitting the new authorized `### Per-finding validation` surface (the awk range would silently include those entries in the per-finding entry parser, triggering false outlier alerts). Live 3x re-run gate against plugin 0.13.0 deferred to Plan 07-17.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Update D-reviewer-budget.sh -- remove aggregate cap, add per-finding-validation parser, harden Findings extraction, update per-finding thresholds | 7f332f0 | .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-reviewer-budget.sh |
| 2 | Update D-security-reviewer-budget.sh -- remove aggregate cap, add per-finding-validation parser, harden Findings extraction | d6a5997 | .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-security-reviewer-budget.sh |

## What Shipped

### Task 1: D-reviewer-budget.sh (commit 7f332f0)

Six surgical edits per the plan's `<action>` block (Edits A-F). File grew 189 -> 229 lines (+40 net). Diff stat: 72 insertions, 32 deletions.

**Edit A (lines 56-58, hardened Findings extraction):**

Replaced the legacy 2-line awk range:

```bash
awk '/^### Findings/,/^### Cross-Cutting Patterns/' "$OUT" | sed '1d;$d' > "$FINDINGS_BODY" || true
```

With the Pitfall-2-hardened multi-line awk that terminates on ANY subsequent `### ` heading:

```bash
awk '
  /^### Findings/ {flag=1; next}
  flag && /^### / {flag=0}
  flag {print}
' "$OUT" > "$FINDINGS_BODY" || true
```

**Edit B (ENTRY_CHECK_SCRIPT thresholds, lines 88-95 area):**

Updated the FRAGMENT_RE per-finding word-count thresholds:

- `>25 outlier soft cap; target <=20w` -> `>28 outlier soft cap; target <=22w`
- `>20 target but <=25 outlier; acceptable` -> `>22 target but <=28 outlier; acceptable`
- `<=20 target` -> `<=22 target`

Plus the docstring comment update from `<=20 words for problem + fix combined ... 25w outliers OK` to `<=22 words target / <=28 words outlier soft cap (per user directive 2026-05-06 + Plan 07-14 contract)`.

**Edit C (NEW per-finding-validation parser block, inserted between line 123 and prior line 125):**

Added the verbatim parser block (used in both fixtures byte-identically):

```bash

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
```

Placement is load-bearing: AFTER the existing per-finding entry check (which dispatches ENTRY_CHECK_SCRIPT) and BEFORE the Cross-Cutting Patterns word-count check. The Findings extraction (which feeds ENTRY_CHECK_SCRIPT) terminates before the optional `### Per-finding validation` section per Edit A's awk hardening, so the per-finding word counts cannot be contaminated by PFV entries.

**Edit D (was at lines 165-181, aggregate-cap block): REMOVED**

The full block (AGG_BODY + AGG_WC + 300-cap if-test + comment about the previously-buggy ^$ terminator) deleted in its entirety. The empirical falsification rationale is captured in the updated header comment (Edit F) + the updated [SUCCESS] message (Edit E) + this SUMMARY.md.

**Edit E (line 189, [SUCCESS] message):**

Replaced:
```bash
echo "[SUCCESS] D-reviewer-budget.sh: all sub-caps enforced (entries <=80w, CCP <=160w, Missed surfaces <=30w, total <=300w)"
```

With:
```bash
echo "[SUCCESS] D-reviewer-budget.sh: per-section budgets enforced (entries <=22w/28w outlier, Per-finding validation <=60w, CCP <=160w, Missed surfaces <=30w; aggregate cap dropped per Plan 07-14)"
```

**Edit F (header comment, lines 1-7):**

Replaced the legacy 5-line comment header (citing the 411w/300w 0.9.0 baseline + total <=300w aggregate claim) with a 10-line header reflecting the new per-section contract + the empirical falsification rationale (S3 UAT 520w, n=4 mean 354.25w on D-security-reviewer-budget; AgentIF + cloud-authority XML 15-20% better binding).

### Task 2: D-security-reviewer-budget.sh (commit d6a5997)

Symmetric edits to Task 1 with TWO differences:

1. **Edit B SKIPPED.** D-security-reviewer-budget.sh per-finding entry thresholds were ALREADY at 22w target / 28w outlier soft cap (lines 90-95 in pre-edit state). The user directive 2026-05-06 table values were anticipated empirically by the existing security-reviewer prompt-line word target (Plan 07-09 ship). No threshold change needed.
2. **Section names diverge.** Edit A awk pattern terminates the SAME way (`^### `) but the surrounding comments reference `### Threat Patterns` (vs `### Cross-Cutting Patterns`). Edit C PFV block is byte-identical across both fixtures. Edit D removes the same shape of aggregate-cap block. Edit E [SUCCESS] message references `Threat Patterns` instead of `CCP`. Edit F header comment references the n=4 D-security-reviewer-budget empirical baseline (mean 354.25w / 4-of-4 FAIL) directly.

File grew 191 -> 228 lines (+37 net). Diff stat: 64 insertions, 27 deletions.

## Acceptance Criteria Pass Evidence

### Task 1 -- D-reviewer-budget.sh

| Criterion | Command | Result |
|-----------|---------|--------|
| `bash -n` syntax PASS | `bash -n .../D-reviewer-budget.sh` | exit 0 |
| Aggregate-cap REMOVED | `git grep -F "AGG_BODY" .../D-reviewer-budget.sh` | 0 matches (exit 1) |
| PFV_BODY declaration + use + dispatch | `git grep -nF "PFV_BODY" .../D-reviewer-budget.sh` | 3 matches (lines 141, 146, 179) |
| PFV_CHECK_SCRIPT declaration + dispatch | `git grep -nF "PFV_CHECK_SCRIPT" .../D-reviewer-budget.sh` | 2 matches (lines 152, 179) |
| PFV_RE regex | `git grep -nF "PFV_RE" .../D-reviewer-budget.sh` | 1 match (line 157) |
| 60w PFV cap message | `git grep -nF ">60 cap" .../D-reviewer-budget.sh` | 1 match (line 170) |
| Per-finding validation surface | `git grep -nF "Per-finding validation" .../D-reviewer-budget.sh` | 8 matches (header + comment + awk + 4 log strings + [SUCCESS]) |
| Validation of Finding regex hook | `git grep -nF "Validation of Finding" .../D-reviewer-budget.sh` | 3 matches (comment + JS comment + regex) |
| New >28 outlier soft cap threshold | `git grep -nF ">28 outlier soft cap" .../D-reviewer-budget.sh` | 1 match (line 102) |
| Old >25 outlier soft cap REMOVED | `git grep -F ">25 outlier soft cap" .../D-reviewer-budget.sh` | 0 matches (exit 1) |
| Updated [SUCCESS] message | `git grep -nF "per-section budgets enforced" .../D-reviewer-budget.sh` | 1 match (line 229) |
| Legacy "total <=300w" claim REMOVED | `git grep -F "total <=300w" .../D-reviewer-budget.sh` | 0 matches (exit 1) |
| Windows compat shim preserved | `git grep -cF "MSYS_NO_PATHCONV" .../D-reviewer-budget.sh` | 1 match |
| cygpath shim preserved | `git grep -cF "cygpath -w" .../D-reviewer-budget.sh` | 1 match |
| FRAGMENT_RE parser preserved | `git grep -cF "FRAGMENT_RE" .../D-reviewer-budget.sh` | 1 match |

### Task 2 -- D-security-reviewer-budget.sh

| Criterion | Command | Result |
|-----------|---------|--------|
| `bash -n` syntax PASS | `bash -n .../D-security-reviewer-budget.sh` | exit 0 |
| Aggregate-cap REMOVED | `git grep -F "AGG_BODY" .../D-security-reviewer-budget.sh` | 0 matches (exit 1) |
| PFV_BODY declaration + use + dispatch | `git grep -nF "PFV_BODY" .../D-security-reviewer-budget.sh` | 3 matches (lines 139, 144, 177) |
| Per-finding validation surface | `git grep -nF "Per-finding validation" .../D-security-reviewer-budget.sh` | 8 matches |
| Validation of Finding regex hook | `git grep -nF "Validation of Finding" .../D-security-reviewer-budget.sh` | 3 matches |
| Per-finding 28w outlier preserved | `git grep -nF ">28 outlier soft cap" .../D-security-reviewer-budget.sh` | 1 match (line 101) |
| Threat Patterns references preserved | `git grep -cF "Threat Patterns" .../D-security-reviewer-budget.sh` | 8 matches |
| OWASP tag shape preserved | `git grep -cF "OWASP" .../D-security-reviewer-budget.sh` | 3 matches |
| Windows compat shim preserved | `git grep -cF "MSYS_NO_PATHCONV" .../D-security-reviewer-budget.sh` | 1 match |
| Security-review skill invocation preserved | `git grep -nF "lz-advisor.security-review" .../D-security-reviewer-budget.sh` | 1 match (line 44) |
| Updated [SUCCESS] message | `git grep -nF "per-section budgets enforced" .../D-security-reviewer-budget.sh` | 1 match (line 227) |
| Legacy "total <=300w" claim REMOVED | `git grep -F "total <=300w" .../D-security-reviewer-budget.sh` | 0 matches (exit 1) |

### Cross-File Structural Symmetry (load-bearing)

PFV parser blocks byte-identical between the two fixtures. Verification command:

```bash
diff \
  <(awk '/Per-finding-validation block extraction/,/if ! node "\$PFV_CHECK_SCRIPT" "\$PFV_BODY"; then/' \
       .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-reviewer-budget.sh) \
  <(awk '/Per-finding-validation block extraction/,/if ! node "\$PFV_CHECK_SCRIPT" "\$PFV_BODY"; then/' \
       .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-security-reviewer-budget.sh)
```

Output: empty diff (exit 0). PFV block at lines 137-179 in D-reviewer-budget.sh and lines 135-177 in D-security-reviewer-budget.sh are byte-identical. The 2-line offset is from the differing context above each block (D-reviewer has the legacy 2-line FRAGMENT_RE outlier comment vs D-security's 4-line OWASP-tag comment), not from any drift in the PFV block itself.

## Deviations from Plan

None -- plan executed exactly as written. All 6 edits per Task 1 (Edits A-F) applied; symmetric edits per Task 2 with the prescribed Edit B skip (thresholds already aligned). No deviation rules triggered.

## Empirical Validation Deferred

This plan ships the structural fixture binding correctly on disk. Empirical confirmation requires:

1. **Plan 07-17 plugin version bump + 3x re-run gate** -- live `bash D-reviewer-budget.sh` + `bash D-security-reviewer-budget.sh` against plugin 0.13.0 (which ships the Plan 07-14 XML contract). Each run costs ~$0.10; 3x per fixture = ~$0.60 total empirical gate cost. Confirms the new per-section budgets close the 5/5 over-cap regression observed on plugin 0.12.2 + that the new authorized `### Per-finding validation` surface emits cleanly without contaminating the per-finding entry parser.

This plan's structural verification (`bash -n` PASS + 23 `git grep` acceptance criteria + cross-file PFV diff) is sufficient as a Wave 2 deliverable; Plan 07-17 closes the empirical loop.

## Threat Model

| Threat ID | Disposition | Status |
|-----------|-------------|--------|
| T-07-15-01 (Tampering: awk range termination) | mitigate | Closed -- awk range now terminates on ANY `### ` heading; verified by reading the post-edit awk pattern in both fixtures (line 76-79 in D-reviewer / line 74-77 in D-security) |
| T-07-15-02 (Spoofing: Per-finding-validation regex matches arbitrary text) | mitigate | Closed -- awk extraction first scopes to `### Per-finding validation` body before PFV_RE runs; the regex cannot match outside the scoped body |
| T-07-15-03 (DoS: live claude -p costs $0.10) | accept | Confirmed -- this plan ran zero live invocations; Plan 07-17 owns the empirical gate (3x ~$0.30) |

## Self-Check: PASSED

- File `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-reviewer-budget.sh` exists with new content (verified via `git diff --stat` showing +72/-32 lines)
- File `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-security-reviewer-budget.sh` exists with new content (verified via `git diff --stat` showing +64/-27 lines)
- Commit `7f332f0` exists (Task 1; verified via `git rev-parse --short HEAD` after commit)
- Commit `d6a5997` exists (Task 2; verified via `git rev-parse --short HEAD` after commit)
- All 15 + 12 = 27 acceptance criteria pass via `git grep` + `bash -n` verification commands
- Cross-file PFV-block diff = 0 bytes (byte-identical PFV parser across both fixtures)
- `bash -n` PASS on both fixtures
