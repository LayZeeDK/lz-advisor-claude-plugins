---
status: advisory-input
phase: 18-haiku-prompt-engineering-deep-research-verify-voter-early-ga
date: 2026-06-16
premise: owner decision -- pursue Haiku-first; reject ONLY on clear evidence; willing to invest in piloting/implementing
advisors: [fresh-opus, gpt-5.5, gemini-3.1-pro (neutral premise-fixed brief)]
---

# How to invest in piloting/implementing Haiku-first -- 3-family convergence

Owner posture (fixed): do NOT reject Haiku on the current (non-rejecting, saturated) evidence; invest
in piloting/implementing it; abandon only on a CLEAR rejection. The consult advised HOW (not whether).

## Strong convergence (all three)

1. **Test the REAL untested axis, not another supplied-evidence test.** The prior pilots saturated
   precisely because they handed the voter the disconfirming evidence. The decisive test is
   AUTONOMOUS multi-step search where the voter decides WHAT to search and WHEN TO STOP, with per-claim
   DATE-CUTOFF enforced, over the raw knowledge store. A "cheaper" supplied-evidence variant just
   re-saturates.
2. **Design to DISCRIMINATE (avoid re-saturation):** stress retrieval difficulty, not claim subtlety.
   Strata: (a) disconfirming evidence BURIED deep below obvious hits; (b) evidence-ABSENT (overreach
   with no in-corpus refutation -- the premature-stop / default-uphold case); (c) DATE-SENSITIVE
   (refuting evidence exists but post-cutoff and must be excluded; or pre-cutoff but easily missed).
   CALIBRATE: if Sonnet also scores near-ceiling, the stratum is non-discriminating and VOID -- harden
   it before reading any Haiku-vs-Sonnet delta (treat Sonnet as the difficulty calibrator).
3. **Treat cheap-voter UNANIMITY as NOT independent.** Correlated Haiku errors produce unanimous
   upholds -> no contested split -> the flat ~15-20% random audit is a weak net. This is the blind spot
   every guardrail must target.
4. **Statistics:** measure false-uphold RATE on refuted/overreach traps + the Haiku-minus-Sonnet delta
   with Clopper-Pearson/Wilson CIs; size n for dozens per stratum (10 is far too few to move a binomial
   CI off the floor). Log a per-vote search trace (queries issued, depth, stop reason) so a null delta
   can be diagnosed as "genuinely equal" vs "both stopped early identically" (a saturation artifact).

## Pre-registered CLEAR-REJECTION gate (converged)

Abandon Haiku if EITHER fires (pre-register before the run; severity-weighted):
- On a hardened DISCRIMINATING set (Sonnet demonstrably below ceiling): Haiku false-uphold rate
  exceeds Sonnet's with a CI lower bound > 0 (significantly positive delta), AND the absolute Haiku
  rate exceeds the audit-tolerable budget. Concrete signals offered: >=3 Haiku-only silent
  false-upholds in 50-100 discriminating cases, or >=2x Sonnet's rate, or >=2 date-cutoff-critical
  misses, or (operationally) >=3 material false-upholds per 100 audited unanimous upholds, or the CI
  upper bound stays above the project budget after the planned sample.
- Severity override: one catastrophic/domain-critical false-uphold can stop Haiku for that claim class
  even at a low aggregate rate.
- Derive the tolerable Haiku false-uphold rate from the audit math: with audit rate a (~0.15-0.20) and
  unanimous (uncaught-by-split) failures, escaped-error rate ~= (1-a) x false-uphold rate; set an owner
  escaped-error budget (e.g. "<= X escaped false-upholds / 1000 claims") and back out the max tolerable
  rate. Subtle case (Opus): if NO hardened stratum can put Sonnet below ceiling, the offline test is
  INCONCLUSIVE (cannot license Haiku either) -> defer to the shadow stage; do NOT read a tie as "Haiku
  fine" (the saturation fallacy).

## Operational guardrails for the unanimity blind spot (converged)

- **Stage it: shadow -> canary -> Tier-1.** Shadow = Haiku votes but does not decide (zero production
  risk; gives an operational false-uphold estimate vs audited ground truth). Canary = small traffic
  slice, elevated audit. Never straight to sole Tier-1 on a flat audit budget.
- **Elevated/100% audit of Haiku UNANIMOUS upholds during the pilot** (plugs the blind spot while data
  accrues), then RISK-WEIGHTED ongoing audit that oversamples shallow-search / low-citation /
  near-cutoff / weak-support claims (observable per-vote features).
- **Mixed-tier seating / Sonnet shadow:** seat >=1 Sonnet voter alongside Haiku on a sampled fraction;
  a Sonnet dissent from a Haiku-unanimous uphold is a free, non-audit contested split that directly
  attacks the correlation assumption.
- **Mechanical search minimums:** a claim cannot be upheld until the voter executed >= N distinct
  queries / explored >= M docs (forces past lazy-stopping).
- **Heterogeneous Haiku seats** (one hyper-skeptical prompt / different temperature) to induce splits
  on hard claims and break correlated unanimity.
- **Trend alarms + pre-committed kill switch:** control-chart bounds on audited false-uphold rate,
  Sonnet-dissent rate, and search-depth drift; breaching the pre-registered budget auto-rolls back to
  the safe Tier-1 model (per claim-class first). Every audited claim + every Sonnet dissent becomes a
  labeled example fed back into the trap set, so the gate can re-fire on accumulating real data.

## The one sequencing divergence

- Gemini: build the ACTUAL production autonomous-search loop and deploy Haiku OPERATIONALLY now, with
  100% Sonnet-audit on its unanimous upholds during the pilot (the harness IS the production loop;
  avoids a synthetic harness that might re-saturate).
- GPT-5.5 + Opus: build a small OFFLINE discriminating harness on the autonomous-search axis FIRST
  (zero production risk, cheapest first read), gate operational rollout on it, then shadow -> canary ->
  Tier-1. Opus reconciles Gemini's saturation worry via the difficulty-calibration + the
  "inconclusive-offline -> defer-to-shadow" fallback.

Shared end-state regardless: staged shadow -> canary -> Tier-1, one shared trap set + one tolerance
number, the unanimity blind spot plugged by elevated/targeted audit + mixed-tier seating, gated by the
pre-registered statistical rejection criterion + a pre-committed rollback.

## Roadmap implication

This converts the Haiku-first decision from a STANDALONE Phase-18 gating eval into a STAGED PILOT that
necessarily threads through the real search loop (Phase 19 search/extract workers) and the audit /
escalation instrumentation (Phase 20 orchestrator). Phase 18's deliverables stand (EVAL-05 reference,
eval install surface + aggregator + dataset loader, both voter agents). Phase 18 concludes as:
Haiku-first PURSUED (not rejected); the decisive test is the staged autonomous-search pilot carried
into Phase 19/20 with the pre-registered rejection gate + the unanimity-blind-spot guardrails above.
