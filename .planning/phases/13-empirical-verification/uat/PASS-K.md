# Phase 13 Plan 02 -- Pass@k / Pass^k

Reliability aggregation over the live `claude -p` UAT captures (see `GRADE-LOG.md`
for the per-run data). n=3 per skill (the floor; not escalated to n=5 -- the
combined-metric signal is already unambiguous and the over-cap pattern is
consistent, so further sampling would not change the disposition).

## "Fully passes" definition

A run **fully passes** iff:
- SHAPE grade is clean: `### Critical` present AND (review) `### Cross-Cutting
  Patterns` / (security) `### Threat Patterns` present AND zero severity-shorthand
  tokens (word-boundary anchored `\b(crit|imp|sug|q):`, see GRADE-LOG `q:`
  disposition) AND (security) OWASP `[Axx]` preserved; AND
- BUDGET fixture exits 0: `bash tests/D-*-budget.sh --from-trace <skill>-N.agent.md`.

## Formulas (per CLAUDE.md skill-creator convention)

- **Pass@k** (optimistic; at least 1 of k samples fully passes) = `1 - C(n-c, k) / C(n, k)`
- **Pass^k** (conservative; all k samples fully pass) = `C(c, k) / C(n, k)`

where n = total runs, c = fully-passing runs. Computed as exact fractions, then
rounded to 4 dp.

## Per-run classification (from GRADE-LOG.md)

| Run | SHAPE | BUDGET exit | Fully passes |
|-----|-------|-------------|--------------|
| review-1 | clean | 0 | YES |
| review-2 | clean | 1 (Finding 1 = 46w > 28) | NO |
| review-3 | clean | 0 | YES |
| security-1 | clean | 1 (Finding 4 = 35w > 28) | NO |
| security-2 | clean | 1 (Finding 3 = 31w > 28) | NO |
| security-3 | clean | 1 (Findings 2/8 = 34w/36w > 28) | NO |

Reviewer: c=2 of n=3. Security-reviewer: c=0 of n=3. Overall: c=2 of n=6.

## Combined metric ("fully passes" = SHAPE clean AND BUDGET exit 0)

| Scope | n | c | Pass@1 | Pass@3 | Pass^1 | Pass^3 |
|-------|---|---|--------|--------|--------|--------|
| Reviewer (`/lz-advisor:review`) | 3 | 2 | 0.6667 | 1.0000 | 0.6667 | 0.0000 |
| Security-reviewer (`/lz-advisor:security-review`) | 3 | 0 | 0.0000 | 0.0000 | 0.0000 | 0.0000 |
| Overall | 6 | 2 | 0.3333 | 0.8000 | 0.3333 | 0.0000 |

Exact fractions: Reviewer Pass@1 = 2/3, Pass@3 = 1/1, Pass^1 = 2/3, Pass^3 = 0/1.
Security Pass@k/Pass^k all 0 (c=0; no fully-passing run exists). Overall Pass@1 =
1/3, Pass@3 = 4/5, Pass^1 = 1/3, Pass^3 = 0/1.

## SHAPE-only sub-metric (SC-1 / SC-2 grammar reaches the rendered report)

This isolates the grouped-grammar render-verbatim outcome from the budget gate.
"Passes" here = SHAPE clean only.

| Scope | n | c (SHAPE clean) | Pass@1 | Pass@3 | Pass^1 | Pass^3 |
|-------|---|-----------------|--------|--------|--------|--------|
| Reviewer SHAPE | 3 | 3 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |
| Security SHAPE | 3 | 3 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |
| Overall SHAPE | 6 | 6 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |

**SATURATED / non-discriminating** (Pass^k = 1.0 everywhere): the grouped
spelled-out grammar reaches the rendered user-facing report on 6/6 runs with zero
shorthand. SC-1 and SC-2 are EMPIRICALLY PROVEN at the render layer. The Phase 12
grammar landed exactly as intended.

## Flagged (non-saturated) rows

- **Security combined Pass^1 = 0.0000 (c=0/3):** every security-review run exceeded
  the per-finding 28-word budget on at least one finding. The grammar is correct,
  but the budget gate fails uniformly. Strongest signal in the table.
- **Reviewer combined Pass^3 = 0.0000 (c=2/3):** one of three reviewer runs
  (review-2) over-shot the per-finding cap (46w Finding 1).
- **Overall combined Pass^3 = 0.0000:** because c=2 < 3, "all 3 sampled runs pass"
  is impossible at the combined metric.

## Headline

- **SHAPE (SC-1 + SC-2):** SATURATED PASS -- 6/6 runs render the grouped spelled-out
  grammar with zero shorthand; security preserves OWASP `[Axx]` on all 3. The
  Phase 12 grammar reaches rendered output. (Pass^1 = Pass^3 = 1.0 both skills.)
- **BUDGET (SC-4):** FAIL on live emission -- combined fully-passing c=2/6
  (reviewer 2/3, security 0/3). The per-finding 28-word cap is exceeded in 4/6 runs.
  This is the SC-4 "measured, not reasoned" budget-neutrality regression that this
  phase exists to catch. Routed to a Phase 12.x gap-closure REPLAN (D-10), not
  patched in this verify phase. See GRADE-LOG.md "SC-4 cross-skill summary" and
  13-02-SUMMARY.md "Gap" section.
