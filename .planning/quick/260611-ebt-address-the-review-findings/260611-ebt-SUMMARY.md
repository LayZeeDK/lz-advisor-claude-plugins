---
phase: quick-260611-ebt
plan: 01
subsystem: review-budget-fixtures + security-reviewer-agent
tags: [code-review-followup, budget-fixtures, hedge-marker-discipline, pfv-accumulation, sev-headers-anchor]
requires:
  - 260611-c5l fixes (this task corrects imperfections in those)
provides:
  - internally-consistent security-reviewer holistic teaching example (confirmed-under-Important)
  - PFV multi-line accumulation + present-but-unparsed loud-fail in both budget fixtures
  - closed-vocabulary SEV_HEADERS anchor in both fixtures
  - corrected singular severity-LEVEL prose in context-packaging.md
affects:
  - plugins/lz-advisor/agents/security-reviewer.md
  - plugins/lz-advisor/references/context-packaging.md
  - tests/D-reviewer-budget.sh
  - tests/D-security-reviewer-budget.sh
tech-stack:
  added: none
  patterns:
    - multi-line paragraph accumulation in a bash line-reader (boundary = next entry / blank line / "### " heading)
    - present-but-unparsed loud-fail (anti-vacuous guard for an optional-when-emitted section)
    - closed-vocabulary anchored regex with trailing-whitespace tolerance ([[:space:]]*$)
key-files:
  created: []
  modified:
    - plugins/lz-advisor/agents/security-reviewer.md
    - plugins/lz-advisor/references/context-packaging.md
    - tests/D-reviewer-budget.sh
    - tests/D-security-reviewer-budget.sh
decisions:
  - "FIX #1 used the PREFERRED deeper fix (reword Finding 3 to a CONFIRMED A05 finding), not another reconciliation note -- the prior pass already tried a note and it was insufficient."
  - "Both fixtures kept STANDALONE (Phase 11 D-10): only the PFV-loop SHAPE was aligned (a tiny local finalize_pfv_entry helper per fixture), no shared helper lib, no dedup."
  - "No cap constant changed (28/22/75/60/160/30/15) and no severity-header spelling changed (render-verbatim contract). No version bump."
metrics:
  duration: ~25min
  tasks: 3
  files: 4
  completed: 2026-06-11
---

# Quick Task 260611-ebt: Address the review findings (2nd /code-review pass) Summary

Corrected the five 2nd-pass `/code-review medium` findings on PR #1: reworded the self-contradicting security-reviewer holistic Finding 3 to a genuinely CONFIRMED A05 finding, hardened the Per-finding-validation (PFV) budget assertion in both budget fixtures (multi-line paragraph accumulation + present-but-unparsed loud-fail), removed a dead reviewer-fixture variable, restored a closed-vocabulary SEV_HEADERS anchor in both fixtures, and reverted a plural/singular severity-LEVEL regression in context-packaging.md.

## What Changed

### Task 1 -- FIX #1: holistic Finding 3 made genuinely CONFIRMED (commit 0f60ba1)

`plugins/lz-advisor/agents/security-reviewer.md`

- Reworded the blockquoted Finding 3 (line 232, inside the self-extract holistic blockquote, under `### Important`) from the unconfirmed-hedge frame `CORS allows any origin in dev. Unresolved hedge: dev-only config (unverified). Verify dev-only before committing.` to a confirmed finding: `CORS reflects any Origin in the prod config. Restrict to an allowlist.` Body is 12 words (<= 28w cap).
- Aligned the `Word count breakdown:` note (~:251): replaced the false "post-verification (confirmed) placement ... the same hedge" framing with an accurate description -- Finding 3 illustrates a CONFIRMED finding under `### Important`; the standalone teaching example below stays the pre-verification UNCONFIRMED CORS hedge under `### Suggestions`.
- Example + `### Important` placement + note now agree on ONE lifecycle state (confirmed). The standalone teaching example near :158 (its `Unresolved hedge:` frame under `### Suggestions`) and the Finding 5 @compodoc path (:241) were NOT touched -- the literal hedge frame retains full teaching coverage. `Unresolved hedge:` count dropped 8 -> 7 (exactly the one instance on Finding 3 removed).

### Task 2 -- FIX #2 + FIX #4 + FIX #5: harden both budget fixtures (commit 34159b6)

`tests/D-reviewer-budget.sh`, `tests/D-security-reviewer-budget.sh`

- **FIX #2 (multi-line PFV accumulation):** the PFV present-branch now accumulates `wc -w` across each entry's PARAGRAPH (from a `Validation of Finding N:` line up to the next such line / blank line / `### ` boundary) and asserts the running TOTAL <= 60w. A single-line count under-counted a >60w multi-line entry. Implemented via a small per-fixture `finalize_pfv_entry` helper + a boundary-aware line reader.
- **FIX #2 (present-but-unparsed loud-fail):** a parsed-entries counter; when `### Per-finding validation` is PRESENT but ZERO entries match the `Validation of Finding ` prefix, the fixture now `fail()`s loudly instead of a vacuous pass. The absent-branch ("optional section absent -- skipped") is unchanged.
- **FIX #4 (reviewer only):** removed the dead `pfv_entry_failed` variable and its no-op `if`; `fail()` already drives `FAIL_COUNT` / the exit code. The reviewer PFV loop shape now matches the security fixture.
- **FIX #5 (both):** restored the closed-vocabulary anchor `SEV_HEADERS='^### (Critical|Important|Suggestions|Questions)[[:space:]]*$'` -- the 4 exact headers with optional trailing whitespace. This keeps the CR/trailing-space tolerance the prior #4 fix intended while preventing the over-broad bare-prefix match (a foreign `### Critical findings` heading would otherwise spoof a severity section and mis-count foreign numbered lines). Adjacent comments updated to state the closed-vocabulary rationale.

### Task 3 -- FIX #3: revert plural Suggestions regression (commit 56e8172)

`plugins/lz-advisor/references/context-packaging.md`

- Line 390: reverted `Critical / Important / Suggestions --` to singular `Critical / Important / Suggestion --`. The `severity=` verify_request attribute carries a lowercase singular severity LEVEL (worked example uses `severity="important"`), not the plural section-header name; the prior #11 fix over-corrected. Lines 290-291 were already correct singular `Suggestion` and were left untouched. Single-token edit.

## Verification

HARD GATE re-run after every fixture/agent edit and as the final check -- all four invocations exact exit codes throughout:

```
bash tests/D-reviewer-budget.sh           -> 0
bash tests/D-reviewer-budget.sh --self-test -> 1
bash tests/D-security-reviewer-budget.sh           -> 0
bash tests/D-security-reviewer-budget.sh --self-test -> 1
```

FIX #2 PFV logic proven with crafted `--from-trace` inputs (per fixture), then the temp trace files were deleted:
- Multi-line PFV entry totalling 76w across its lines -> both fixtures exit 1 ("per-finding validation budget exceeded: 76 > 60"). A single-line count would have seen ~12w and silently passed -- this proves multi-line accumulation catches the overshoot.
- `### Per-finding validation` header present with ZERO `Validation of Finding ` lines -> both fixtures exit 1 ("header present but ZERO entries parsed"). Proves the present-but-unparsed loud-fail. Both crafted inputs parsed 5 findings correctly and failed with exactly 1 assertion (the PFV assertion).

Residue / scope checks (all via `git grep`):
- `post-verification (confirmed) placement` -> no match (FIX #1 false framing gone).
- Reworded Finding 3 body = 12w (<= 28w).
- `pfv_entry_failed` in reviewer fixture -> no match (FIX #4 dead var gone).
- `^### (Critical|Important|Suggestions|Questions)[[:space:]]*$` -> present in BOTH fixtures (FIX #5).
- context-packaging.md:390 -> singular `Suggestion`; lines 290-291 unchanged; no plural `Suggestions --` remains.
- Exactly the four `files_modified` files changed across the 3 task commits; no edits outside `plugins/lz-advisor/` + `tests/`.
- Version unchanged at `1.0.1` (plugin.json); no SKILL.md version touched.
- `<max_count>15</max_count>` untouched in both agents.
- Render-verbatim header set byte-identical: the security-reviewer diff touches only the Finding 3 line and the note sentence; no `### ` header line changed.

## Deviations from Plan

None of the auto-fix deviation rules (1-4) were triggered. One micro-adjustment within scope:

- During the FIX #4 verification, `git grep -c "pfv_entry_failed"` returned 1 because a NEW comment I wrote (describing the FIX #4 removal) named the variable verbatim. The actual variable, its assignments, and the no-op `if` were already fully removed. To honor the plan's "`pfv_entry_failed` count == 0" verification contract cleanly, I reworded that comment to "the prior dead per-entry-failed flag variable" so the grep returns 0 / no match. No behavior change; the comment still documents the removal.

## Known Minor Items (out of scope -- not fixed here)

- **`<max_count>15</max_count>` free-floating placement** in the `<output_constraints>` block of both agents (`security-reviewer.md:290`, `reviewer.md:274`): it sits between the per-section `<section>` elements rather than alongside the aggregate constraints, which reads as if it scopes a single section. This is PRE-EXISTING from the v1.0.1 section restructure (NOT introduced by the 260611-c5l fixes nor by this task), and the prose at `reviewer.md:98` disambiguates it as an aggregate ("Up to 15 findings per response"). Per the task constraints it was deliberately NOT touched. Track for a future cleanup pass if the structural placement is ever revisited.

## Self-Check: PASSED

- SUMMARY.md created at `.planning/quick/260611-ebt-address-the-review-findings/260611-ebt-SUMMARY.md`.
- Commit 0f60ba1 (Task 1), 34159b6 (Task 2), 56e8172 (Task 3) all present in `git log`.
- All four files in `files_modified` modified and committed; all four fixture invocations 0/1/0/1.
