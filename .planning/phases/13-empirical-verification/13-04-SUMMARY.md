---
phase: 13-empirical-verification
plan: 04
subsystem: agent-contracts
tags: [gap-closure, concision-discipline, GAP-13-BUDGET, WR-05, GATE-02]
requires:
  - "13-VERIFICATION.md GAP-13-BUDGET refined root-cause diagnosis (FIX-1..4 + CAP VERDICT + ATOMICITY)"
provides:
  - "reviewer.md + security-reviewer.md per-finding concision discipline (FIX-1..4) routing verbose tails into existing 60w/75w escape valves"
  - "input for Plan 13-05 to re-measure SC-4 GREEN on live agent emission and close GATE-02"
affects:
  - "plugins/lz-advisor/agents/reviewer.md"
  - "plugins/lz-advisor/agents/security-reviewer.md"
tech-stack:
  added: []
  patterns:
    - "Escape-valve routing: severity-divergence rationale -> ### Per-finding validation (60w); CVE/GHSA/CWE prose -> auto-clarity carve-out (75w); bracket-less Questions stay terse (<=28w)"
key-files:
  created:
    - ".planning/phases/13-empirical-verification/13-04-SUMMARY.md"
  modified:
    - "plugins/lz-advisor/agents/reviewer.md"
    - "plugins/lz-advisor/agents/security-reviewer.md"
decisions:
  - "CAP VERDICT honored: PER_ENTRY_CAP=28 / 22w target / 75w auto-clarity cap UNCHANGED in both agents AND both fixtures -- this is concision discipline, not recalibration"
  - "FIX-4 LOCKED to terse: bracket-less multi-clause Questions / architectural disagreements do NOT get the 75w escape; the <auto_clarity_carve_out> element stays the single source of truth and the prose was corrected to match it (element NOT extended, fixture NOT modified)"
  - "WR-05 atomicity: FIX-1..4 landed in ONE plan across both agents' rules + every affected worked example + both do_not_include lists -- no mixed few-shot state"
metrics:
  duration: 18min
  completed: 2026-06-08
  tasks: 3
  files: 2
---

# Phase 13 Plan 04: Atomic agent-contract concision fix (GAP-13-BUDGET / FIX-1..4) Summary

Applied FIX-1..4 from 13-VERIFICATION.md as one atomic concision-discipline edit to both review agents, routing the four over-cap roots (review-2 46w; security-1 35w; security-2 31w; security-3 34w+36w) into the contract's existing 60w Per-finding-validation and 75w CVE auto-clarity escape valves instead of recalibrating any cap.

## What was done

### FIX-1 (severity-divergence rationale routing) -- BOTH agents

- Added a concision-discipline rule in each agent's per-finding instruction prose: when the agent's severity differs from the executor's, the divergence rationale goes in a `### Per-finding validation` entry (`Validation of Finding N:`, <=60w); the finding BODY stays terse (<=28w). NEVER inline a `Severity: Critical (executor said Important; ...)` clause into the finding line.
- Added a WRONG->RIGHT worked example in each agent modeled on the review-2 / security-1 pattern: a WRONG finding line bundling the divergence rationale into the body, then the RIGHT form -- terse finding body PLUS a separate `### Per-finding validation` entry carrying the rationale.
- Reinforced the existing do_not_include anti-pattern in each `<output_constraints>` block to explicitly name "a severity-divergence rationale inlined into the finding body" as the FIX-1 violation.

### FIX-2 (one issue per finding -- split, never merge) -- security-reviewer.md

- Added a split-findings rule: one issue per finding; split distinct vulnerabilities into separate numbered findings rather than merging two sinks.
- Added a WRONG->RIGHT worked example modeled on security-1: WRONG = one `[A02]` finding merging the `http://` plaintext-token leak AND the shell `curl` injection (the 35w shape); RIGHT = two numbered findings (`[A02]` for the http leak, `[A03]` for the curl shell injection), each <=28w, continuous numbering preserved.
- Added a do_not_include item naming "two distinct vulnerabilities (two sinks) merged into one numbered finding" as the FIX-2 violation.

### FIX-3 (reference code by location) -- BOTH agents

- Added a rule in each agent: reference code by `path:line` (already in the finding prefix); do NOT reproduce code snippets inline in the finding body. Keep exact symbol names in backticks (the existing Keep rule), but prohibit multi-token inline code reproductions.
- Added a WRONG->RIGHT worked example in each agent (reviewer: `exec('curl '+url+...)` command-injection; security: second-order-injection `db.query(... + row.userId)`): WRONG pastes the full expression; RIGHT names the symbol in backticks and points at the line.
- Added a do_not_include item naming "a multi-token inline code reproduction in the finding body" as the FIX-3 violation.

### FIX-4 (auto-clarity escape is bracket-gated -- LOCKED to terse) -- security-reviewer.md

- Corrected the Auto-clarity prose so it AGREES with the formal `<auto_clarity_carve_out cap="75">` element: ONLY findings carrying a `[CVE-...]` / `[GHSA-...]` / `[CWE-...]` bracket get the 75w escape. Genuine multi-clause Questions and architectural-threat disagreements that do NOT carry such a bracket MUST be terse (<=28w) -- split the question into its core finding + a `### Per-finding validation` entry for the elaboration if it cannot fit.
- The contradictory prior claim (carve-out "covers question-classes / architectural threat disagreements") is GONE; the corrected prose states the `<auto_clarity_carve_out>` element is the single source of truth and mirrors it exactly.
- Added a WRONG->RIGHT worked example modeled on security-3 F8: WRONG = a bracket-less multi-clause SSRF Question body (36w); RIGHT = a terse <=28w core Question.
- Added a do_not_include item naming "a bracket-less multi-clause Question or architectural-threat disagreement claiming the 75w auto-clarity escape" as the FIX-4 violation.
- The `<auto_clarity_carve_out cap="75">` element was NOT extended; the fixture was NOT modified. The element + fixture stay the gate; the prose was corrected to match.

## CAP VERDICT honored (no recalibration)

PER_ENTRY_CAP=28, the 22w target, and the 75w auto-clarity cap are UNCHANGED in both agents AND both fixtures. This plan is concision discipline using the contract's existing escape valves, not a cap change. The `<auto_clarity_carve_out cap="75">` element is byte-intact; `git status --porcelain tests/` is empty.

## WR-05 Atomicity-Completeness Verdict (Task 3)

All six gate checks GREEN -- the FIX-1..4 unit landed atomically with no mixed few-shot state:

| Check | Result |
| ----- | ------ |
| 1. Both budget fixtures self-extract | reviewer exit 0; security exit 0 |
| 2. Both fixtures self-test (anti-vacuous fires) | reviewer exit 1; security exit 1 |
| 3. Residue sweeps over plugins/lz-advisor/ | `crit:\|imp:\|sug:\|q:` exit 1; `\b(crit\|imp\|sug\|q):` exit 1; `formerly High\|formerly Medium` exit 1 |
| 4. SHAPE intact (both agents) | four severity headers in both; Cross-Cutting Patterns (reviewer); Threat Patterns + OWASP `[Axx]` (security) all present |
| 5. AGNT-03 intact (both agents) | Class-2 Escalation Hook, Hedge Marker Discipline, lowercase `severity=` machine attrs present in both |
| 6. Fixtures unmodified | `git status --porcelain tests/` empty |

Aggregated `<verify>` one-liner printed: `ATOMICITY GATE GREEN`.

## Self-extract sentinel guard honored

Every new worked example (FIX-1/FIX-2/FIX-3/FIX-4 WRONG->RIGHT) uses bare blockquoted finding LINES following the existing single-line `INCORRECT (...):` / `CORRECT (...):` convention. No new example opens with a blockquoted `> ### Critical` header above the holistic example, so the fixtures' `^> ### Critical$` self-extract sentinel still locks onto the holistic block (verified: both fixtures parse the holistic example -- reviewer 7 findings, security 6 findings -- and stay GREEN).

## Deviations from Plan

None - plan executed exactly as written. All FIX-1..4 edits, worked examples, and do_not_include reinforcements landed as specified; no bugs, missing functionality, or blocking issues encountered.

## SHAPE / AGNT-03 confirmation

SHAPE byte-intact (four `### Critical/Important/Suggestions/Questions` headers, `(none)` markers, continuous numbering, OWASP `[Axx]` placement, `### Cross-Cutting Patterns` / `### Threat Patterns`) and AGNT-03 protected behaviors (Class-2 Escalation Hook, Hedge Marker Discipline, lowercase `<verify_request severity=>` machine attrs) survived in both agents.

## Input for Plan 13-05

Both agents now carry the FIX-1..4 concision discipline. Plan 13-05 should re-provision the deterministic UAT substrate per `uat/WORKTREE-PROVENANCE.md` (base 019a26a, seeded `review-src/handler.ts` + `review-src/disk-info.ts`), re-run the n>=3 headless `claude -p` captures per skill, and re-run the `--from-trace` budget gate to confirm SC-4 GREEN on LIVE emission, then close GATE-02.

## Verification

- `bash tests/D-reviewer-budget.sh` -> exit 0 (7 findings parsed; every body <=28w; Cross-Cutting Patterns present)
- `bash tests/D-security-reviewer-budget.sh` -> exit 0 (6 findings parsed; bodies <=28w, CVE finding 36 <=75; Threat Patterns + `[Axx]` present)
- `bash tests/D-reviewer-budget.sh --self-test` -> exit 1; `bash tests/D-security-reviewer-budget.sh --self-test` -> exit 1
- `git grep -nE 'crit:\|imp:\|sug:\|q:' -- plugins/lz-advisor/` -> exit 1; `git grep -nE 'formerly High\|formerly Medium' -- plugins/lz-advisor/` -> exit 1
- `git status --porcelain tests/` -> empty (fixtures unmodified)

## Self-Check: PASSED

- FOUND: `.planning/phases/13-empirical-verification/13-04-SUMMARY.md`
- FOUND: `plugins/lz-advisor/agents/reviewer.md`
- FOUND: `plugins/lz-advisor/agents/security-reviewer.md`
- FOUND: commit `5085bca` (fix(13-04): apply FIX-1..4 concision discipline to both review agents)
