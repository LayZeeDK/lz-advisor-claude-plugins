# Certified-WORKS methodology -- cross-family board DECISION (unanimous)

**Status:** DECIDED. Cross-family board, 3 rounds, de-identified + fact-only, UNANIMOUS across all points.
**Date:** 2026-06-20.
**Board:** 2 in-family Opus lenses (Agent tool) + GPT-5.5 + Gemini-3.1-pro-preview (Copilot CLI, `--effort high`).
R1 independent (a genuine 2-2 split on the WORKS-vs-scoped crux) -> R2 de-identified convergence (the split
resolved; most points settled) -> R3 closed the two narrow residuals (both unanimous). ~43.5 Copilot AI
Credits + 6 Opus Agent subagents. Transcripts gitignored under `eval/.cache/p20-live/board-r{1,2,3}-*`.
**Authority for:** the certified-WORKS RE-PLAN of the live verify-voter certification (supersedes the
20-05 "harvest from own output" positives source, which is empirically infeasible -- ~0.33 dense-SUPPORTED
per run, `merged:0` / corroboration stuck at 1).

## THE CONVERGED METHODOLOGY

### 1. Two arms, split-source, both certifying

- **ESTIMAND B (over-refusal):** LIVE-harvested SUPPORTED positives (feasible: ~2.3/run, ~13 runs). N >= 30.
  Gate: `clopperPearsonUpperOneSided(over-refusals, nCtrl) <= TAU_OR (0.15)`.
- **ESTIMAND A (false-uphold):** MANUALLY-CONSTRUCTED contrastive minimal-pairs, each a minimal edit of a
  REAL live dense evidence bundle from the SAME class as the over-refusal positives (flip only the
  truth-value; preserve density / length / style). N >= 30. Gate:
  `clopperPearsonUpperOneSided(false-upholds, nTrap) <= TAU_FU (0.10)`.
- The existing 12-item trap set is UNDERPOWERED for TAU_FU 0.10 (CP-upper(0/12) ~ 0.22-0.27 > 0.10) ->
  EXPAND to N >= 30 (0 false-upholds in 30 clears 0.10). Reuse the 12 as seed material only.

### 2. The WORKS verdict (the resolved crux)

A split-source design (live over-refusal + manual-from-real-bundles false-uphold) is a **valid WORKS**, NOT
merely a scoped certificate, **if and only if**:
(i) it is pre-registered before any scored vote; (ii) every false-uphold item is a minimal edit of a real
live dense bundle of the same class as the over-refusal positives; and (iii) the construct-validity check
(section 3) passes. **Shared pipeline / stimulus origin is NOT required** -- SDT estimates sensitivity
(over-refusal) and specificity (false-uphold) on separate trial pools regardless of origin; what confers
validity is that each arm is in-distribution for the cases its gate bounds. **WORKS = both CP gates pass.**
If the construct-validity check fails -> **scoped certificate**, scoped exactly to the unverified
distribution claim. Sonnet-default ships regardless.

### 3. Construct-validity gate

- **(d) MANDATORY construction rule:** every trap is a minimal edit of a real live dense bundle (no
  synthetic-from-scratch).
- **(a) PRIMARY empirical gate:** a pre-registered, zero-dependency lexical-overlap baseline must NOT
  separate the SUPPORTED/REFUTED members of a pair. PASS iff AUC <= the pre-registered ceiling (0.60-0.65).
  (Truth-value must not be lexically readable; this kills the artifact a minimal-pair edit most plausibly
  injects.)
- **(b) difficulty-proxy = ONE-SIDED DIRECTIONAL GUARD:** compute the proxy (corroboration distribution +
  claim length + paraphrase spread) and report it descriptively. FAIL the certificate ONLY if the
  constructed cell is detectably EASIER than the harvested dense-SUPPORTED cell beyond a pre-registered
  margin (easier-direction SMD > 0.5 at the pre-registered one-sided alpha). PASS if harder or
  statistically indistinguishable. (Rationale: a symmetric equivalence/TOST test is underpowered at N~30
  and defends a harder-cell deviation that cannot harm the claim; the threat is strictly one-tailed
  -- only an EASIER cell fakes specificity.)
- **(c) blind distinguishability audit:** secondary / optional corroboration only; never the sole gate.

### 4. Pre-scale probe (before spending the full N)

- **Size: 10 pairs.**
- **Gates (both must pass):** (1) the out-of-family all-agree gold panel unanimously admits >= 9/10 items;
  (2) the lexical-overlap AUC is <= the pre-registered ceiling.
- **Scored voter: RUN-but-DO-NOT-GATE.** Run it for pipeline/telemetry validation + as a pre-registered
  VOLUNTARY early-stop signal (>= 1 false-uphold on the probe jeopardizes clearing TAU_FU at N=30 -> the
  operator investigates the pipeline / re-pre-registers, NEVER edits items until the probe is clean). It is
  EXCLUDED from the certification pass/fail (a scored pass on 10 pairs has negligible power vs TAU_FU 0.10,
  and gating on it would tune the corpus against the certified system).
- Pass all gates -> scale to full N. Any fail -> reconstruct + re-probe; do not scale.

### 5. Both tiers (strong baseline first, then cheap)

- Certify the **STRONG tier (Sonnet) FIRST** against the frozen corpus/gold/gates.
- The **CHEAP tier (Haiku) is a SEPARATE certification** over the SAME frozen corpus/gold/gates, with
  Haiku-specific prompts frozen BEFORE its scored vote (the EVAL-05 research-grounded prompt) + an explicit
  task-fit determination (a cheap pre-gate: if it cannot clear the over-refusal gate even on sparse
  positives, it is task-unfit -> certify strong-only + RAISE; do not spend the dense wave on it). No tier
  inherits another's verdict; no TAU is loosened per tier.

### 6. Frozen primitives (unchanged; consumed byte-identical)

`EVAL_THRESHOLDS` (TAU_OR 0.15 / TAU_FU 0.10 / N_CTRL_FLOOR 24); `certifyModel` / `decisionMatrix` /
`clopperPearsonUpperOneSided`; the OOF all-agree gold-decider identity (gpt-5.5 + gemini-3.1-pro-preview,
`--effort high`, gold-blind). Zero runtime dependencies (the lexical baseline is zero-dep). N frozen before
scoring; no optional stopping; the two arms never pooled. SDT positive-trials constraint satisfied (both
arms carry positive trials).

## RE-PLAN implications (for the planner)

- The 20-05 live-cert positives source changes from "harvest dense-SUPPORTED from own output" (infeasible)
  to: **live-harvest the over-refusal arm + manually construct the false-uphold arm as minimal-edit
  contrastive pairs on real live dense bundles**, N>=30 each, with the construct-validity gate (3) + the
  10-pair probe (4), strong-tier first then cheap (5).
- NEW build work: a contrastive minimal-pair authoring + adjudication harness; the zero-dep lexical-overlap
  AUC check; the one-sided difficulty-proxy guard; the 10-pair probe driver. The frozen seams (6) are reused
  byte-identical.
- FOLD IN: cross-session resumability (disk/blackboard state; the workflow runtime resumes only
  within-session) -- already scoped (see `20-RESUMABILITY-SCOPING.md`); and the corrob>=2-only verify
  optimization for any harvest measurement.
- DEFERRED to a later milestone: the workflow re-architecture of lz-deep-research (see
  [[reference_claude_code_workflows_shippable]]; a marketplace plugin cannot ship a native workflows/
  component, but can bundle a workflow script + drive it via Workflow scriptPath).
- This remains an honest settle-OR-raise: if construct validity fails or a gate is breached, RAISE; the
  Sonnet-default voter ships regardless (D-01).
