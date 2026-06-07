# Phase 11: Fixture baseline - Pattern Map

**Mapped:** 2026-06-07
**Files analyzed:** 2 (both NEW; no modifications)
**Analogs found:** 2 / 2 (style analog) + 2 parse-target sources

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `tests/D-reviewer-budget.sh` (NEW) | test (bash smoke fixture) | file-I/O + transform (read agent markdown -> parse -> assert) | `tests/validate-phase-03.sh` (style) + `plugins/lz-advisor/agents/reviewer.md` (parse target) | role-match (style); exact (parse target) |
| `tests/D-security-reviewer-budget.sh` (NEW) | test (bash smoke fixture) | file-I/O + transform (read agent markdown -> parse -> assert) | `tests/validate-phase-04.sh` (style) + `plugins/lz-advisor/agents/security-reviewer.md` (parse target) | role-match (style); exact (parse target) |

**Why role-match, not exact, for the style analog:** the existing `validate-phase-0{3,4}.sh` are *structural* validators (`git grep` content assertions against a fixed file). The new fixtures are *parsers* (self-extract a block, regex-match findings, `wc -w` per-section budgets). Same house STYLE (header comment, `set -euo pipefail`, `pass()`/`fail()` + counters, summary + exit), different core logic. Copy the style skeleton; the parse logic is new.

**CAUTION (stale paths in the style analogs):** both analogs reference top-level paths that NO LONGER EXIST after the Phase 9 reorg -- `validate-phase-03.sh:9` uses `skills/lz-advisor-execute/SKILL.md`; `validate-phase-04.sh:12-13` uses `agents/reviewer.md` / `agents/security-reviewer.md`. The live files are under `plugins/lz-advisor/`. Do NOT copy the path variables. See "Shared Patterns -> Path correctness."

## Pattern Assignments

### `tests/D-reviewer-budget.sh` (test, file-I/O + transform)

**Style analog:** `tests/validate-phase-03.sh`
**Parse-target source:** `plugins/lz-advisor/agents/reviewer.md`

**House-style header + helpers** (copy STYLE from `validate-phase-03.sh:1-22`, fix the path):
```bash
#!/usr/bin/env bash
# <one-line purpose>
# Framework: bash assertions (no external dependencies).
# Run from the repository root: bash tests/D-reviewer-budget.sh
set -euo pipefail

# CORRECT path (NOT the stale top-level agents/ path the analog uses):
REVIEWER_AGENT="plugins/lz-advisor/agents/reviewer.md"
PASS_COUNT=0
FAIL_COUNT=0

pass() {
  echo "[PASS] $1"
  PASS_COUNT=$((PASS_COUNT + 1))
}

fail() {
  echo "[FAIL] $1"
  echo "       $2"
  FAIL_COUNT=$((FAIL_COUNT + 1))
}
```

**Summary + exit** (copy STYLE verbatim from `validate-phase-03.sh:144-158`):
```bash
TOTAL=$((PASS_COUNT + FAIL_COUNT))
echo ""
echo "Results: $PASS_COUNT/$TOTAL passed"

if [ "$FAIL_COUNT" -gt 0 ]; then
  echo "Status: [FAIL] -- $FAIL_COUNT assertion(s) failed"
  exit 1
else
  echo "Status: [PASS] -- all assertions passed"
  exit 0
fi
```

**File-existence guard** (STYLE from `validate-phase-04.sh:33-35`, adapted to fail loudly per RESEARCH Pitfall 1):
```bash
[ -f "$REVIEWER_AGENT" ] || { fail "agent file missing at $REVIEWER_AGENT" "self-extract source not found"; exit 1; }
```

**Parse target -- 3-slot Format line** (`reviewer.md:59`):
```
Format: `<file>:<line>: <severity>: <problem>. <fix>.`
```
Severity legend (`reviewer.md:64-67`): `crit:` / `imp:` / `sug:` / `q:`. Per-finding budget EXCLUDES the `<file>:<line>: <severity>:` prefix (`reviewer.md:69`).

**Parse target -- holistic worked example, the self-extract baseline input** (`reviewer.md:125-142`). Each finding line is `> `-blockquote-prefixed and backtick-wrapped. The 7 fragment-grammar finding lines are at 127-132 and 134; the `<verify_request>` line is at 133 (skip it, do not count it):
```
> ### Findings
>
> `src/auth.ts:42: crit: user can be null after .find(). Add guard before .email.`
> `src/auth.ts:88: crit: password compared with == (timing attack). Replace with bcrypt.compare.`
> `src/api.ts:88-140: sug: 50-line fn does 4 things. Extract validate / normalize / persist.`
> `src/client.ts:23: imp: no retry on 429. Wrap in withBackoff(3).`
> `src/migration.ts:7: crit: relies on unverified Nx 19+ minor version. Unresolved hedge: Nx 19+ minimum. Verify Nx 19+ before committing.`
> `src/storybook.config.ts:14: imp: docs.autodocs flag may not exist on Storybook 10. Verify before relying on it.`
> `<verify_request question="..." class="2" anchor_target="pv-storybook-10-autodocs" severity="important"/>`
> `src/utils.ts:55: q: regex /[a-z]+@[a-z]+/i -- intended as email validator or token splitter? Author intent unclear; tighten or comment.`
>
> ### Cross-Cutting Patterns
>
> Findings 1, 2, and 4 share a root cause: ...
>
> ### Missed surfaces (optional)
>
> Adjacent: `src/api/v2/*.ts` mirrors the v1 pattern flagged in finding 3; ...
```
**Finding count = 7** (verify_request line excluded). MIN_FINDINGS=5 leaves headroom of 2.

**Parse target -- `<output_constraints>` block** (`reviewer.md:160-187`) -- the budgets the parser asserts (canonical values; parser-layer tolerance per D-07/D-08 applied on top):
```xml
<output_constraints>
  <section name="findings" type="repeating" required="true">
    <heading>### Findings</heading>
    <per_entry max_words="22" outlier_soft_cap="28"/>
    <max_count>15</max_count>
  </section>
  <section name="per_finding_validation" type="repeating" optional="true">
    <heading>### Per-finding validation</heading>
    <per_entry max_words="60"/>
  </section>
  <section name="cross_cutting_patterns" max_words="160" required="true">
    <heading>### Cross-Cutting Patterns</heading>
  </section>
  <section name="missed_surfaces" max_words="30" optional="true">
    <heading>### Missed surfaces (optional)</heading>
  </section>
  <aggregate_cap>none</aggregate_cap>
</output_constraints>
```

**Section headings the parser ranges between** (reviewer): `### Findings` (`reviewer.md:125` in example), `### Cross-Cutting Patterns` (`reviewer.md:136`), `### Missed surfaces (optional)` (`reviewer.md:140`).

---

### `tests/D-security-reviewer-budget.sh` (test, file-I/O + transform)

**Style analog:** `tests/validate-phase-04.sh`
**Parse-target source:** `plugins/lz-advisor/agents/security-reviewer.md`

**Header / helpers / summary / exit:** identical STYLE to the reviewer fixture above (D-10: standalone duplicate, no shared lib). Only the path variable differs:
```bash
SECURITY_AGENT="plugins/lz-advisor/agents/security-reviewer.md"   # NOT the stale top-level agents/ path
```

**Parse target -- 4-slot Format line** (`security-reviewer.md:60`) -- adds the OWASP `[<tag>]` slot between severity and threat:
```
Format: `<file>:<line>: <severity>: [<OWASP-tag>] <threat>. <fix>.`
```
OWASP tag legend (`security-reviewer.md:70`): `[A01]`..`[A10]`; `[Uncategorized]` is a valid slot value (D-12). Per-finding budget EXCLUDES the `<file>:<line>: <severity>: [<tag>]` prefix (`security-reviewer.md:72`). Patterns heading is `### Threat Patterns` (NOT `### Cross-Cutting Patterns`).

**Parse target -- auto-clarity CVE carve-out** (`security-reviewer.md:125-129`, example at `:127`) -- the prose explanation of the full-prose finding that must NOT be flagged at the 28w per-entry cap:
```
Auto-clarity (Class 2-S security carve-out): drop fragment grammar for findings
that involve a CVE-class bug, a published security advisory, or a CWE-tagged
design weakness ... emit the threat in plain English first sentence (with the
CVE / GHSA / CWE reference), then resume fragment grammar ...
```

**Parse target -- holistic worked example, the self-extract baseline input** (`security-reviewer.md:133-149`). Finding lines at 135-139 and 141; `<verify_request>` at 140 (skip). The CVE auto-clarity finding is line 141:
```
> ### Findings
>
> `src/handler.ts:42: imp: [A04] JSON.parse on raw req.body crashes on malformed input. Wrap in try / catch + reject with 400.`
> `src/auth.ts:88: crit: [A02] password compared with == (timing attack). Replace with bcrypt.compare.`
> `src/api.ts:14: imp: [A05] CORS allows any origin in dev. Unresolved hedge: dev-only config (unverified). Verify dev-only before committing.`
> `src/admin.ts:201: crit: [A01] /admin endpoint missing role-check middleware. Add requireRole("admin") before handler.`
> `package.json:24: q: [A06] @compodoc/compodoc 1.1.0 -- check GHSA / npm audit for known advisories before relying.`
> `<verify_request question="..." class="2-S" anchor_target="pv-compodoc-1-1-0-cves" severity="important"/>`
> `node_modules/some-pkg:0: crit: [A06] [CVE-2025-1234] some-pkg@<2.4.1 contains a prototype-pollution sink ... Upgrade some-pkg to >=2.4.1; if upgrade is blocked, pin Object.prototype.hasOwnProperty as a non-writable shim.`
>
> ### Threat Patterns
>
> Findings 1 (A04 input handling) and 4 (A01 access control) chain: ...
>
> ### Missed surfaces (optional)
>
> Adjacent: `src/admin/*.ts` mirrors finding 4; ...
```
**Finding count = 6** fragment-grammar lines (5 normal + 1 CVE auto-clarity), verify_request excluded. The agent prose explicitly says "6 findings" (`security-reviewer.md:131`) and labels the CVE line "Finding 7" only when counting the verify_request line (`security-reviewer.md:151`). **MIN_FINDINGS=5 leaves headroom of 1** for the security fixture (see "Correction to upstream input" below). The CVE finding at `:141` is the carve-out: its body is 35w (RESEARCH measured) -> must apply the 75w cap, not 28w.

**Parse target -- `<output_constraints>` block** (`security-reviewer.md:165-192`) -- structurally identical to reviewer but `cross_cutting_patterns` replaced by `threat_patterns`:
```xml
<output_constraints>
  <section name="findings" type="repeating" required="true">
    <heading>### Findings</heading>
    <per_entry max_words="22" outlier_soft_cap="28"/>
    <max_count>15</max_count>
  </section>
  <section name="per_finding_validation" type="repeating" optional="true">
    <heading>### Per-finding validation</heading>
    <per_entry max_words="60"/>
  </section>
  <section name="threat_patterns" max_words="160" required="true">
    <heading>### Threat Patterns</heading>
  </section>
  <section name="missed_surfaces" max_words="30" optional="true">
    <heading>### Missed surfaces (optional)</heading>
  </section>
  <aggregate_cap>none</aggregate_cap>
</output_constraints>
```

**Security-only parser deltas (per D-12 + RESEARCH):**
1. FRAGMENT_RE adds `\[[^]]+\]` (OWASP slot) after the severity; the prefix-strip also removes `[<tag>] ` before `wc -w`.
2. Patterns heading is `### Threat Patterns`, not `### Cross-Cutting Patterns`.
3. Auto-clarity carve-out: a finding line containing `[CVE-...]`, `[GHSA-...]`, or `[CWE-...]` gets the 75w cap (RES-PFV-OUTLIER-CAP, D-08), not 28w.

**Section headings the parser ranges between** (security): `### Findings` (`security-reviewer.md:133`), `### Threat Patterns` (`security-reviewer.md:143`), `### Missed surfaces (optional)` (`security-reviewer.md:147`).

---

## Shared Patterns

### House style (PASS/FAIL counters + strict mode + summary)
**Source:** `tests/validate-phase-03.sh:7,13-22,144-158`
**Apply to:** both new fixtures (D-11)
```bash
set -euo pipefail
PASS_COUNT=0
FAIL_COUNT=0
pass() { echo "[PASS] $1"; PASS_COUNT=$((PASS_COUNT + 1)); }
fail() { echo "[FAIL] $1"; echo "       $2"; FAIL_COUNT=$((FAIL_COUNT + 1)); }
# ... assertions ...
TOTAL=$((PASS_COUNT + FAIL_COUNT))
echo ""
echo "Results: $PASS_COUNT/$TOTAL passed"
[ "$FAIL_COUNT" -gt 0 ] && { echo "Status: [FAIL] -- $FAIL_COUNT assertion(s) failed"; exit 1; } || { echo "Status: [PASS] -- all assertions passed"; exit 0; }
```
ASCII-only `[PASS]`/`[FAIL]` markers, paths relative to repo root, exit non-zero on any fail.

### Path correctness (CRITICAL -- do NOT copy from analogs)
**Stale source to AVOID:** `validate-phase-03.sh:9` (`skills/lz-advisor-execute/SKILL.md`), `validate-phase-04.sh:12-13` (`agents/reviewer.md`, `agents/security-reviewer.md`)
**Correct paths for the new fixtures:**
```bash
REVIEWER_AGENT="plugins/lz-advisor/agents/reviewer.md"
SECURITY_AGENT="plugins/lz-advisor/agents/security-reviewer.md"
```
Add an explicit `[ -f "$AGENT" ]` guard that calls `fail` + `exit 1` so a future path move fails loudly instead of self-extracting from an empty file (silent vacuous pass).

### File-existence guard (loud-fail STYLE)
**Source:** `validate-phase-04.sh:33-35` (the `if [ ! -f "$FILE" ]; then fail ...` idiom)
**Apply to:** the agent-file existence check at the top of both fixtures. Adapt to hard-`exit 1` (the analog continues; the new fixtures must abort -- a missing self-extract source is a fatal vacuous-pass risk per RESEARCH Pitfall 1).

### git grep for structural assertions (optional, in-house-style)
**Source:** `validate-phase-04.sh:107-128` (e.g. `git grep -q "^model: opus" "$AGENT"`)
**Apply to:** any optional structural sanity check (e.g. confirm the `### Findings` heading still exists in the agent file). The core finding-parse uses self-extracted in-memory text + `[[ =~ ]]`/`wc -w`, NOT `git grep`. Per CLAUDE.md: never the `grep` command; `git grep` or `rg` only.

## No Analog Found

No new file lacks an analog. Both fixtures have a strong STYLE analog (`validate-phase-0{3,4}.sh`) and an exact parse-target source (the two agent files). The genuinely NEW logic (no in-repo analog -- reconstruct from RESEARCH.md Code Examples + the Recovered Phase 08 Contract) is:

| Logic block | Why no analog | Source to reconstruct from |
|-------------|---------------|----------------------------|
| Mode dispatch (`--from-trace` / `--self-test` / default) | No existing fixture has modes | RESEARCH.md "Mode dispatch" example (D-01/D-02/D-05) |
| Self-extract + blockquote/backtick normalize | No existing fixture self-extracts | RESEARCH.md "Self-extract + normalize" (D-01, D-08) |
| FRAGMENT_RE finding parse + verify_request skip | No existing fixture parses fragment grammar | RESEARCH.md "FRAGMENT_RE parse" + agent Format lines |
| Anti-vacuous `matched_count >= 5` guard | New regression-gate primitive | RESEARCH.md "Anti-vacuous guard" (D-04/D-06) |
| Per-section `wc -w` budget loop + 75w auto-clarity carve-out | No existing fixture word-counts | RESEARCH.md "Per-entry budget loop" (D-08/D-09, Pitfall 3) |

## Correction to upstream input (planner: note this)

RESEARCH.md and CONTEXT.md (D-04) state both holistic examples "contain 7 findings ... leaving headroom of 2." Verified against the live agent file: the **security** holistic example contains **6 fragment-grammar finding lines** (5 normal at `security-reviewer.md:135-139` + 1 CVE auto-clarity at `:141`), not 7. The agent's own prose says "6 findings" (`:131`). With MIN_FINDINGS=5, the security fixture has headroom of **1**, not 2. The reviewer example does have 7 findings (headroom 2). MIN_FINDINGS=5 still passes both -- no change to D-04 -- but the planner should write the security fixture's expectation comment as "6 findings, min 5" to avoid an off-by-one assertion that would falsely require 7.

(RESEARCH.md is internally consistent with this in two places -- its System Architecture diagram and Pitfall 3 both enumerate "5 non-CVE security findings ... only the CVE finding needs the carve-out" = 6 total -- but its prose summary and the Pattern 1 anchor say "7 findings." The 6-finding count is the verified-correct value.)

## Metadata

**Analog search scope:** `tests/` (committed bash scripts), `plugins/lz-advisor/agents/` (parse-target grammar sources). Confirmed via the upstream RESEARCH.md empirical commands (`git ls-files "*budget*"` = 0; the fixtures exist nowhere on disk; this phase authors them fresh).
**Files scanned:** 4 (2 style analogs read in full + 2 agent parse-target files read in full).
**Pattern extraction date:** 2026-06-07
