# Phase 13 Plan 07 -- Pass@k / Pass^k (SC-4 THIRD RE-MEASURE R3)

Recomputed Pass@k / Pass^k on the LIVE budget THIRD RE-MEASURE captures AFTER the
13-06 iteration-2 concision fix (FIX-R2-A/B/C, commits `bfb8003` + `91ee635`).
n=3 per skill (6 captures total). All 6 fully pass -> c=n on every scope, so all
Pass@k AND the conservative Pass^k saturate at 1.0.

- **"Fully passes"** = SHAPE grade clean (four grouped `### ` severity headers +
  `(none)` markers + analytical section [`### Cross-Cutting Patterns` review /
  `### Threat Patterns` security] + zero word-boundary-anchored `\b(crit|imp|sug|q):`
  shorthand + (security) OWASP `[Axx]` preserved) **AND** the binding budget
  fixture `--from-trace` exits 0 (every per-finding body <=28w; CVE/GHSA/CWE
  auto-clarity <=75w; >=5 findings parsed).
- **Pass@k** = `1 - C(n-c, k) / C(n, k)` (optimistic: >=1 of k samples fully passes).
- **Pass^k** = `C(c, k) / C(n, k)` (conservative: ALL k samples fully pass).

## Per-run fully-passing tally

| Skill | run-1 | run-2 | run-3 | c / n |
|-------|-------|-------|-------|-------|
| Reviewer (`/lz-advisor:review`) | PASS | PASS | PASS | 3 / 3 |
| Security (`/lz-advisor:security-review`) | PASS | PASS | PASS | 3 / 3 |

Combined c = 6 / 6. SHAPE-only c = 6 / 6.

## Combined metric (SHAPE clean AND BUDGET exit 0)

| Scope | n | c | Pass@1 | Pass@3 | Pass^1 | Pass^3 |
|-------|---|---|--------|--------|--------|--------|
| Reviewer (`/lz-advisor:review`) | 3 | 3 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |
| Security-reviewer (`/lz-advisor:security-review`) | 3 | 3 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |
| Overall | 6 | 6 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |

(Overall additional k: Pass@5 = Pass@6 = 1.0000; Pass^5 = Pass^6 = 1.0000.)

Pass^k = 1.0 at EVERY k is the strongest possible statistical outcome: not just
"at least one of k samples passes" (Pass@k) but "ALL k samples pass" (Pass^k) is
certain across the measured set. This contrasts sharply with R2, where Pass^3
was 0.10 (reviewer) / 0.40 (security) -- a clean sample was likely but not
guaranteed. At R3 a clean sample is the only observed outcome.

## SHAPE-only sub-metric (SC-1 / SC-2 -- the grammar reaches the rendered report)

| Scope | n | c (SHAPE clean) | Pass@1 | Pass@3 | Pass^1 | Pass^3 |
|-------|---|-----------------|--------|--------|--------|--------|
| Reviewer SHAPE | 3 | 3 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |
| Security SHAPE | 3 | 3 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |
| Overall SHAPE | 6 | 6 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |

SHAPE-only remains SATURATED (Pass^k = 1.0 everywhere, as it was in R2): the
grouped spelled-out grammar reaches the rendered user-facing report on 6/6 runs
with zero shorthand and OWASP `[Axx]` byte-intact. At R3 the COMBINED metric
catches up to the SHAPE metric -- the per-finding BUDGET gate (SC-4), which was
the sole R2 discriminator, is now also fully green.

## Baseline comparison (pre-fix -> post-13-04 R2 -> post-13-06 R3)

| Metric | Pre-fix (n=6) | R2 post-13-04 (n=10) | R3 post-13-06 (n=6) | R2->R3 delta |
|--------|---------------|----------------------|---------------------|--------------|
| Combined c / n | 2 / 6 (0.333) | 7 / 10 (0.700) | 6 / 6 (1.000) | +0.300 Pass@1 |
| Reviewer c / n | 2 / 3 | 3 / 5 | 3 / 3 | every run green |
| Security c / n | 0 / 3 | 4 / 5 | 3 / 3 | every run green |
| Worst finding-body overshoot | 46w / 36w | 33w (security) / 29w-45w (reviewer) | 27w (security) / 22w (reviewer) | within cap |
| Combined Pass^3 | 0.000 | 0.2917 | 1.0000 | +0.7083 |
| SHAPE-only Pass^k | 1.0 | 1.0 | 1.0 | held (saturated) |

The 13-04 fix moved combined Pass@1 0.333 -> 0.700 (a large improvement) but left
3/10 residuals. The 13-06 iteration-2 fix (FIX-R2-A/B/C) closed those residuals:
the third live re-measure is 6/6 with Pass^k = 1.0 at every k, under the UNCHANGED
hard gate.

## Honest verdict (D-10)

The 13-06 fix FULLY LANDED. Combined Pass@1 0.700 -> 1.000; Pass^3 0.2917 -> 1.000;
worst finding-body overshoot collapsed below the 28w cap on every run. No capture
was re-worded to pass, no cap was lowered, no agent was patched mid-measure, no
fixture was edited (`git status --porcelain tests/` empty throughout). SC-4
measures GREEN on the third live re-measure -> GATE-02's budget half is CLOSED.
The deferred FIX-R2-D gate-tolerance-band decision is NOT needed to close SC-4 (it
remains a flagged product-contract decision the user may settle independently per
13-06-SUMMARY, but a lone stochastic stray -- the evidence that would have forced
it -- did not occur).
