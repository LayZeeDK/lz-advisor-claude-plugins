# Certified-WORKS re-plan -- cross-family board brief (de-identified, fact-only)

**Purpose:** converge on the methodology decisions that a re-plan needs to reach a CERTIFIED WORKS verdict
for the deep-research verify-voter at BOTH tiers. De-identified + fact-only; the board converges (it is NOT
handed a pre-chosen answer). 2026-06-20.

## The goal (fixed)

Certify the verify-voter "WORKS" at the STRONG tier first (baseline) and then the CHEAP tier, where
**WORKS = both pre-registered Clopper-Pearson gates pass**, honoring the Signal-Detection-Theory
positive-trials constraint (a valid WORKS REQUIRES positive trials -- a trap-only arm cannot certify):

- ESTIMAND B (over-refusal): CP-upper of the over-refusal rate <= TAU_OR (0.15), over adjudicated SUPPORTED
  positives, N_ctrl >= 24.
- ESTIMAND A (false-uphold): CP-upper of the false-uphold rate <= TAU_FU (0.10), over dense/contested traps.

## The blocker (empirical, this session)

The planned positives source -- harvest SUPPORTED claims from the tool's OWN output on real questions
("run the skill on itself") -- does NOT yield enough difficulty-matched positives:

- Across 3 completed real runs: 19 SUPPORTED claims total, **1 dense-SUPPORTED** (~0.33/run).
- Root cause: the deterministic aggregator dedups LEXICALLY, which under-merges fine-grained paraphrased
  claims, so `corroboration_lower_bound` stays 1 for almost all claims (one run: `merged: 0`).
- `dense-SUPPORTED = confidence in {High,Medium} AND corroboration >= 2`. The dense-trap arm needs ~30 ->
  ~90 runs (~$2,500) at the observed rate. Infeasible. This is the literature-unsolved "difficulty-matched
  positives from dense multi-doc evidence" gap, now observed directly.

## Frozen constraints (cannot be changed; result-shopping forbidden)

- `EVAL_THRESHOLDS` byte-identical: TAU_OR 0.15 / TAU_FU 0.10 / N_CTRL_FLOOR 24.
- `certifyModel` / `decisionMatrix` / `clopperPearsonUpperOneSided` / the OOF all-agree gold-decider
  identity -- consumed byte-identical.
- ZERO runtime dependencies in the shipped tree -> NO embeddings -> semantic dedup is NOT an option.
- The aggregator is frozen (additive-only, anti-drift lockstep). N targets are pre-registered BEFORE any
  scored vote; never relax a TAU to fit a realized N; the two arms are never pooled.

## What already exists (assets the board can build on)

- An OFFLINE dense-trap FALSE-UPHOLD arm already cleared **12/12** via MANUAL contrastive minimal-pairs
  (difficulty-matched BY CONSTRUCTION; the edit is on the evidence, label-flipping). Reported as a SCOPED
  certification, explicitly NOT "WORKS".
- The over-refusal CONTROL arm (SUPPORTED positives, dense-or-sparse) IS feasible: ~2.3 SUPPORTED/run ->
  ~13 runs to a floor of 30.
- A verify-cost optimization: only `corroboration >= 2` claims can ever be dense-SUPPORTED, and
  corroboration is fixed at aggregate stage-1 (pre-vote) -- so a harvest can verify ONLY dense candidates,
  slashing the verify wave (the dominant per-run cost). It does NOT change the run COUNT (dense candidates
  are ~1/run).

## THE DECISION the board must converge on

Given the empirical infeasibility of harvesting dense-SUPPORTED positives via the tool's own output, and
the frozen constraints + the SDT positive-trials requirement: **what positives-source / gate-construction
methodology makes a CERTIFIED WORKS reachable for the strong tier (baseline) and then the cheap tier?**

### Neutral option space (weigh, extend, or reject -- NOT pre-decided)

- **A. Hybrid anchor:** lean ESTIMAND A (false-uphold) on the already-cleared offline manual-contrastive
  arm; harvest ONLY the over-refusal control arm live (feasible ~13 runs). Open: does the SDT constraint +
  the frozen gate design permit a "live over-refusal + offline-anchored false-uphold" WORKS, or does WORKS
  require BOTH arms to be live?
- **B. Manual live positives:** construct dense-SUPPORTED positives manually (contrastive, on real evidence
  bundles) to fill the trap/positive arm. Open: at what N; and does manual construction count as
  "production-distribution / live"?
- **C. External benchmark as calibration:** an external entailment benchmark as a difficulty-calibration
  cross-check (NOT the certifying set) alongside harvested positives. Open: does it add admissible validity?
- **D. Accept the ceiling -> scoped certificate:** full two-gate WORKS is not reachable under current
  constraints; certify a SCOPED claim (over-refusal-only live, plus the offline false-uphold screen) and
  RAISE. Sonnet-default ships regardless.
- **E. Other** -- the board proposes a path not listed.

### Cross-tier question

Whatever the source, the methodology must certify BOTH the strong tier (baseline) and the cheap tier
(which additionally needs tier-appropriate prompt engineering + a task-fit determination). Does the chosen
path support a fair both-tier certification, or only the strong tier first?

## Also in the re-plan (context, NOT board decisions)

- Cross-session resumability of the live run (disk/blackboard state; the runtime's own resume is
  within-session only). Already scoped (state-machine design + completion sentinels).
- The corrob>=2-only verify optimization (above).
- The workflow re-architecture is DEFERRED to a later milestone (not in scope here).

## Board protocol

De-identified, fact-only. Round 1: each lens analyzes independently. Round 2: lenses see the de-identified
positions and converge to an explicit consensus (no imposed synthesis; the board converges itself).
Advisors may request a cheap probe. Record the transcript (gitignored).
