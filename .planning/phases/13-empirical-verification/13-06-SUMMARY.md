---
phase: 13-empirical-verification
plan: 06
subsystem: review-agents
tags: [concision, budget-gate, gap-closure, reviewer, security-reviewer, GATE-02, SC-4]
requires:
  - "13-04 (FIX-1..4 iteration-1 concision discipline on both agents)"
  - "13-05 / GAP-13-BUDGET-R2 (the 3/10 residual over-cap diagnosis: r2-review-4 45w Question, r2-security-1 4x 30-33w fix prose, r2-review-3 29w deref-chain)"
  - "13-GAP-RESEARCH.md (Q3 option (b) for FIX-R2-A; CAP VERDICT CONFIRMED; FIX-R2-D framing)"
provides:
  - "Reviewer contract with FIX-R2-A (context-heavy Question -> existing 60w ### Per-finding validation, NO new carve-out) + FIX-R2-C (causal-chain terseness nudge -> ### Cross-Cutting Patterns)"
  - "Security-reviewer contract with FIX-R2-B (fix-clause reference-by-shape -- name the safe API in backticks, no full call expression, no second clause)"
  - "WR-05 atomicity-completeness verdict (all-green) for Plan 13-07 to re-measure SC-4 a third time on live emission"
affects:
  - "Plan 13-07 (SC-4 third live re-measure to close GATE-02)"
tech-stack:
  added: []
  patterns:
    - "Route verbose FIX/Question/causal-chain tails into the contract's existing escape valves (60w Per-finding validation; Cross-Cutting Patterns) instead of inflating the <=28w finding body -- genuine concision, no cap change"
key-files:
  created:
    - ".planning/phases/13-empirical-verification/13-06-SUMMARY.md"
  modified:
    - "plugins/lz-advisor/agents/reviewer.md (FIX-R2-A + FIX-R2-C: rules, Questions severity def, two WRONG->RIGHT worked examples, two do_not_include items)"
    - "plugins/lz-advisor/agents/security-reviewer.md (FIX-R2-B: rule, one WRONG->RIGHT worked example, one do_not_include item)"
decisions:
  - "FIX-R2-A uses the EXISTING 60w ### Per-finding validation valve -- NO new 75w reviewer carve-out (13-GAP-RESEARCH Q3 option (b)); PFV entries do not match the fixture FINDING_RE so routing words there genuinely shrinks the counted body"
  - "CAP VERDICT honored (CONFIRMED): no cap recalibrated in agents (22/28/75/60) or fixtures (28/5/75); the two tests/D-*-budget.sh fixtures are UNMODIFIED -- the close is genuine concision, the gate is not gamed"
  - "FIX-R2-D (gate tolerance band) is OUT OF SCOPE here -- recorded as a flagged, evidence-backed DEFERRED product-contract decision for the user to settle deliberately (a gate-design correction, not gaming the gate)"
metrics:
  tasks_completed: 3
  files_modified: 2
  commits: 3
  completed: 2026-06-08
---

# Phase 13 Plan 06: Iteration-2 Concision Fix (FIX-R2-A/B/C) Summary

Atomically applied the second concision iteration to both review agents -- routing the residual over-cap tails (a 45w reviewer Question, four 30-33w security fix-clauses, a 29w reviewer causal-chain) into the contract's existing escape valves so finding bodies stay within the UNCHANGED 28w outlier soft cap, closing GAP-13-BUDGET-R2 by genuine concision without touching a single cap or fixture.

## What Was Built

Three fixes, applied as one atomic unit (WR-05 guard) across both agents:

- **FIX-R2-A (reviewer.md)** -- a context-heavy `### Questions` finding (one that states an observation, poses the binary the author must answer, AND supplies the evidence) now keeps its BODY terse (`<=28w`: the binary question itself) and routes the observation + evidence into the EXISTING 60w `### Per-finding validation` entry (prefixed `Validation of Finding N:`). This mirrors the security-reviewer FIX-4 split-to-PFV path. The rule explicitly states the reviewer gets **NO 75w auto-clarity carve-out** (that escape is security-only, bracket-gated on `[CVE]`/`[GHSA]`/`[CWE]`); the 60w PFV valve is the reviewer's sanctioned escape. Edits: the concision-discipline prose rule (now "four rules"), the `### Questions` severity definition, a WRONG->RIGHT worked example modeled on the r2-review-4 45w Question (WRONG body 45w -> RIGHT terse body 24w + 45w PFV entry), and a `do_not_include` item.
- **FIX-R2-C (reviewer.md)** -- a finding body must not bundle a multi-link causal chain (deref -> TypeError -> swallowed-catch -> both-return-null) into one `>28w` span. The body names the defect + fix (`<=28w`); the downstream consequence (the swallowed-catch / both-paths-return-null compounding) routes to `### Cross-Cutting Patterns`. Edits: the concision-discipline prose rule, a WRONG->RIGHT worked example modeled on the r2-review-3 29w deref-chain (WRONG body 29w -> RIGHT terse body 15w + consequence moved to Cross-Cutting Patterns), and a `do_not_include` item.
- **FIX-R2-B (security-reviewer.md)** -- extends the FIX-3 reference-by-shape discipline from the `<threat>` clause to the `<fix>`/remediation clause: NAME the safe API in backticks + POINT at the pattern; do NOT paste a full remediation call expression (the `('du', ['-sh', path])` argument shape) and do NOT bundle a second remediation clause. Edits: the concision-discipline prose rule (now "five rules"), a WRONG->RIGHT worked example modeled on the r2-security-1 command-injection fix (WRONG body 33w -> RIGHT body 27w, dropping the call expression and the second clause), and a `do_not_include` item.

## How It Works (the mechanism behind FIX-R2-A)

The reviewer budget fixture counts only lines matching `FINDING_RE` (`N. <file>:<line>: ...`). `### Per-finding validation` entries (prefixed `Validation of Finding N:`) do NOT match `FINDING_RE`, so the per-finding budget loop NEVER counts them. Routing a Question's observation + evidence into a PFV entry removes those words from the counted per-finding span entirely -- this is precisely why FIX-R2-A reuses the existing 60w PFV valve rather than inventing a new 75w reviewer carve-out. The 60w PFV cap is a CONTRACT cap (`<per_entry max_words="60"/>`), verified by manual word count when authoring the worked example (the example's PFV entry is 45w), not by the fixture.

## CAP VERDICT Honored (the close is genuine, the gate is not gamed)

- No cap recalibrated. Agents still carry `max_words="22"` + `outlier_soft_cap="28"` (both), `auto_clarity_cap="75"` + `<auto_clarity_carve_out cap="75">` (security only), `max_words="60"` PFV (both). Reviewer has NO `auto_clarity_cap="75"` / `auto_clarity_carve_out` token (0 matches -- FIX-R2-A reused the existing 60w PFV).
- The two `tests/D-*-budget.sh` fixtures are UNMODIFIED. `git status --porcelain tests/` is empty. Fixture constants `PER_ENTRY_CAP=28` / `MIN_FINDINGS=5` / `AUTO_CLARITY_CAP=75` unchanged.
- The close is achieved by the agents genuinely producing `<=28w` finding bodies (the verbose tails moved to the PFV / Cross-Cutting valves), not by relaxing the binding regression gate. This is the explicit guard against the D-10 "gaming the gate" failure mode.

## WR-05 Atomicity-Completeness Verdict (Task 3 gate)

All checks GREEN -- the atomic unit landed with no mixed few-shot state:

| Check | Result |
| ----- | ------ |
| Reviewer fixture self-extract (`bash tests/D-reviewer-budget.sh`) | exit 0 (10/10) |
| Security fixture self-extract (`bash tests/D-security-reviewer-budget.sh`) | exit 0 (9/9) |
| Reviewer fixture self-test (`--self-test`) | exit 1 (anti-vacuous guard fires by design) |
| Security fixture self-test (`--self-test`) | exit 1 (anti-vacuous guard fires by design) |
| Residue sweep `crit:\|imp:\|sug:\|q:` over `plugins/lz-advisor/` (unanchored) | exit 1 (clean) |
| Residue sweep `\b(crit\|imp\|sug\|q):` (anchored) | exit 1 (clean) |
| Residue sweep `formerly High\|formerly Medium` | exit 1 (clean) |
| SHAPE: four severity headers in both agents | present (4 + 4) |
| SHAPE: `### Cross-Cutting Patterns` (reviewer) / `### Threat Patterns` (security) | present |
| SHAPE: `### Per-finding validation` in both | present |
| SHAPE: OWASP `[Axx]` in security holistic example | present (25 hits) |
| AGNT-03: Class-2 Escalation Hook + Hedge Marker Discipline + lowercase `severity=` attrs | present in both |
| CAP/GATE: `git status --porcelain tests/` | empty (fixtures untouched) |
| Aggregated one-liner | prints `ATOMICITY GATE GREEN` |

## Deviations from Plan

None - plan executed exactly as written. No bugs, missing functionality, blocking issues, or architectural changes encountered. No package installs (markdown-only edits). No authentication gates.

## Deferred Ideas

**FIX-R2-D (gate tolerance band) -- DEFERRED, NOT implemented here.**

13-GAP-RESEARCH.md (Q1, HIGH confidence) recommends replacing the zero-tolerance hard per-finding cap with a two-tier tolerance band (a hard ceiling ~40-45w + at most one soft-outlier in the 29-ceiling band per run), on the grounds that (a) a zero-tolerance hard cap on a stochastic LLM generator is a documented anti-pattern, and (b) the gate contradicts its own vocabulary -- the contracts label 28w an `outlier_soft_cap` while the fixtures enforce it as a hard zero-tolerance ceiling.

This is recorded as a flagged, evidence-backed deferred PRODUCT-CONTRACT decision for the user to settle deliberately. It is OUT OF SCOPE for this close (orchestrator decision, for integrity): editing it would change a binding regression gate. If implemented, it MUST be framed (in the plan and the fixture comments) as a gate-design CORRECTION aligning enforcement with the contract's own "soft cap" semantics + the stochastic-output literature, NOT as loosening the gate to force green (the distinction from the D-10 "gaming the gate" failure mode is load-bearing). If the user's intent is that the budget is a HARD deterministic Layer-1 product contract (every finding is a one-liner, full stop), FIX-R2-D stays dropped and SC-4 gates on a clean RUN (raise per-skill n) rather than a clean SAMPLE. The honest measured progress (combined 2/6 -> 7/10; worst overshoot 46w -> 33w) is on record so the choice is auditable either way.

## Commits

| Task | Commit | Description |
| ---- | ------ | ----------- |
| 1 (FIX-R2-A + FIX-R2-C) | `bfb8003` | `fix(13-06): apply FIX-R2-A + FIX-R2-C concision rules to reviewer.md` |
| 2 (FIX-R2-B) | `91ee635` | `fix(13-06): apply FIX-R2-B fix-clause reference-by-shape to security-reviewer.md` |
| 3 (atomicity gate + this SUMMARY/state) | (metadata commit) | `docs(13-06): complete iteration-2 concision-fix plan` |

## Input for Plan 13-07

The fixed agents are ready for the THIRD SC-4 live re-measure. Re-provision the deterministic UAT substrate per `uat/WORKTREE-PROVENANCE-R2.md` (base `019a26a`; seeds recoverable byte-identical from dangling seed commit `4fa7fd7`), re-run the `n>=3` headless `claude -p` captures per skill, re-run the `--from-trace` budget gate. SC-4 closes when every run exits 0 under the UNCHANGED gate.

## Self-Check: PASSED
