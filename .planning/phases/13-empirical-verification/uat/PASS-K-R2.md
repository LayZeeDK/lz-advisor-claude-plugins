# Phase 13 Plan 05 -- Pass@k / Pass^k (SC-4 RE-MEASURE R2)

Recomputed Pass@k / Pass^k on the LIVE budget RE-MEASURE captures AFTER the 13-04
concision fix (commit `5085bca`). Escalated to **n=5 per skill** (10 captures
total) from the n=3 floor because a residual over-cap appeared on both skills and
the session pool had headroom.

- **"Fully passes"** = SHAPE grade clean (four grouped `### ` severity headers +
  `(none)` markers + analytical section [`### Cross-Cutting Patterns` review /
  `### Threat Patterns` security] + zero word-boundary-anchored `\b(crit|imp|sug|q):`
  shorthand + (security) OWASP `[Axx]` preserved) **AND** the binding budget
  fixture `--from-trace` exits 0 (every per-finding body <=28w; CVE/GHSA/CWE
  auto-clarity <=75w; >=5 findings parsed).
- **Pass@k** = `1 - C(n-c, k) / C(n, k)` (optimistic: >=1 of k samples fully passes).
- **Pass^k** = `C(c, k) / C(n, k)` (conservative: ALL k samples fully pass).

## Per-run fully-passing tally

| Skill | run-1 | run-2 | run-3 | run-4 | run-5 | c / n |
|-------|-------|-------|-------|-------|-------|-------|
| Reviewer (`/lz-advisor:review`) | PASS | PASS | FAIL (29w) | FAIL (45w Q) | PASS | 3 / 5 |
| Security (`/lz-advisor:security-review`) | FAIL (4x 30-33w) | PASS | PASS | PASS | PASS | 4 / 5 |

Combined c = 7 / 10. SHAPE-only c = 10 / 10.

## Combined metric (SHAPE clean AND BUDGET exit 0)

| Scope | n | c | Pass@1 | Pass@3 | Pass@5 | Pass^1 | Pass^3 | Pass^5 |
|-------|---|---|--------|--------|--------|--------|--------|--------|
| Reviewer (`/lz-advisor:review`) | 5 | 3 | 0.6000 | 1.0000 | 1.0000 | 0.6000 | 0.1000 | 0.0000 |
| Security-reviewer (`/lz-advisor:security-review`) | 5 | 4 | 0.8000 | 1.0000 | 1.0000 | 0.8000 | 0.4000 | 0.0000 |
| Overall | 10 | 7 | 0.7000 | 0.9917 | 1.0000 | 0.7000 | 0.2917 | 0.0833 |

(Overall additional k: Pass@7 = 1.0000, Pass@10 = 1.0000; Pass^7 = 0.0083, Pass^10 = 0.0000.)

## SHAPE-only sub-metric (SC-1 / SC-2 -- the grammar reaches the rendered report)

| Scope | n | c (SHAPE clean) | Pass@1 | Pass@3 | Pass@5 | Pass^1 | Pass^3 | Pass^5 |
|-------|---|-----------------|--------|--------|--------|--------|--------|--------|
| Reviewer SHAPE | 5 | 5 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |
| Security SHAPE | 5 | 5 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |
| Overall SHAPE | 10 | 10 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |

SHAPE-only is SATURATED (Pass^k = 1.0 everywhere): the grouped spelled-out grammar
reaches the rendered user-facing report on 10/10 runs with zero shorthand and OWASP
`[Axx]` byte-intact. The combined-metric shortfall is driven SOLELY by the
per-finding BUDGET gate (SC-4).

## Baseline comparison (pre-fix vs post-13-04-fix)

| Metric | Pre-fix (GRADE-LOG.md, n=6) | Post-fix R2 (n=10) | Delta |
|--------|------------------------------|--------------------|-------|
| Combined c / n | 2 / 6 (0.333) | 7 / 10 (0.700) | +0.367 Pass@1 |
| Reviewer c / n | 2 / 3 | 3 / 5 | held ratio; worst overshoot 46w -> 29w finding / 45w Question |
| Security c / n | 0 / 3 | 4 / 5 | 0.000 -> 0.800 Pass@1 (large) |
| Worst finding-body overshoot | 46w (review-2), 36w (security-3) | 33w (security-1), 29w (review-3) | collapsed |
| SHAPE-only Pass^k | 1.0 | 1.0 | held (saturated) |

The 13-04 fix produced a LARGE measured improvement, especially on the security
half (0/3 -> 4/5). But SC-4 PASS requires every run exit 0, and 3/10 runs retain a
residual over-cap (1 verbose-fix-prose security run + 1 marginal-deref + 1
uncarved-Question reviewer run). **SC-4 is NOT yet fully GREEN** -> GAP-13-BUDGET-R2
(a second concision iteration); see GRADE-LOG-R2.md "Residual gap" section.

## Honest verdict (D-10)

The fix WORKED in the direction intended (worst overshoot collapsed, security half
went 0/3 -> 4/5, combined Pass@1 0.333 -> 0.700) but did NOT fully land: a second
concision iteration is required before SC-4 measures GREEN on every run. This is
recorded faithfully -- no capture was re-worded to pass, no cap was lowered, no
agent was patched mid-measure.
