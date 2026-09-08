# 21 open-book over-refusal re-run -- CERTIFICATE RESULT (the construct-matched verdict)

**Date:** 2026-06-22.
**Verdict:** **VOID-on-power -> RAISE** (`validN = 10 < N_CTRL_FLOOR 24`). This is one of the three
pre-registered outcomes; accepted as-output under the one-pass anti-result-shopping discipline.
**Authority:** the pre-registration `21-OPENBOOK-LOCK-RULE.md` (committed `59f8d4b`, BEFORE any scored vote or
metered OOF call), which pins the snapshot sha256 (`9faee64a...`), the frozen N (30), the two-sided re-score
rule, `TAU_OR` 0.15, the `clopperPearsonUpperOneSided` estimator, the AVeriTeC-4-way -> binary rule, and the
OOF gold-decider identity (`gpt-5.5` + `gemini-3.1-pro-preview`, `--effort high`). Frozen primitives consumed
byte-identical (`git diff --quiet eval/lz-eval-*.mjs` CLEAN); the two arms are NEVER pooled.

## One-line outcome
The construct-matched open-book gold the Phase-20 RAISE asked for was BUILT and JUDGED -- and it is
**under-powered**: judging independently-retrieved broader-literature evidence, the frozen OOF pair could
reach an all-agree SUPPORTED consensus on only **10 of the 30** controls (20 oof-splits, 0 unanimous
not-entail), so `validN = 10` falls far below the 24-control floor. Sensitivity can be neither cleanly
certified NOR cleanly refuted from this control set + this gold-decider. RAISE.

## The metered result (the ONLY Copilot spend of the phase)
**Open-book OOF gold** (`openbook-gold-result.json`; the frozen pair judged gold-blind over the pinned
`openbook-evidence.json`, `expectedEntailment: 'true'`):
- nConfirmed (all-agree-ENTAIL -> SUPPORTED) = **10**
- nResidue = **20**, of which oof-split = **20**, all-agree-not-entail = **0**
- `oof_agreement` = `{ nAllAgreeEntail: 10, nSplit: 20, nAllAgreeNotEntail: 0 }`
- `kappa` = null, `evidence_jaccard` = null (NOT computable from the frozen inputs -- D-08 reported-only,
  never gated; see `diagnostics_note`).

**Two-sided re-score** (`openbook-rescore-result.json`; no further spend; the FROZEN Sonnet votes re-scored,
NOT re-cast -- D-04; `reclassify` byte-identical; `sampleUids` = all 30 so `nUnReadjudicated` collapses to 0):
- overRefusals = **1**  validN = **10**  (supported = 10, notSupported = 0, residue = 20)
- missed_false_upholds_two_sided = **0** (the two-sided guard was operative; it found 0 false-upholds)
- `cpUpper = clopperPearsonUpperOneSided(1, 10) = 0.3942` vs `TAU_OR 0.15` -> `passCp = false`
- `power = VOID-on-power` -> `disposition = VOID-on-power-RAISE`

The realized N (10) and the power band are reported honestly; **TAU is NOT relaxed**, the denominator was NOT
grown or shrunk to manufacture a pass (the rescore fails closed on a grown/shrunk arm), and the run was ONE
pass (no optional stopping).

## The decisive finding: the construct-matched gold is under-powered (not a clean DOES-NOT-WORK)
In Phase 20 the CLOSED-book gold confirmed all 30 controls (the OOF pair judged a FIXED excerpt + training
knowledge). With the construct-matched OPEN-book evidence -- each control's claim judged against
INDEPENDENTLY-retrieved broader-literature primary sources -- the same frozen pair **splits on 20/30**. The
broader literature is more nuanced and heterogeneous than the voter's fixed excerpt, so two strong models
legitimately disagree on entailment for two-thirds of the controls; those split into RESIDUE (Guerdan
rating-indeterminacy -- excluded from the binary denominator + routed to the human, never coerced). The
construct fix therefore did NOT yield a clean sensitivity verdict; it revealed that a construct-matched
open-book gold cannot confidently confirm enough of these closed-book-SELECTED controls to power the gate.

The 4 frozen voter-`refuted` controls dispose as:
- `crispr-cas9-gene-editing::cluster47` -> gold SUPPORTED -> **genuine-over-refusal** (the lone numerator; 1/10).
- `montreal-protocol-ozone::cluster40` -> RESIDUE (oof-split) -> excluded.
- `transformer-self-attention-scaling::cluster38` -> RESIDUE (oof-split) -> excluded.
- `antibiotic-resistance-mechanisms::cluster24` -> RESIDUE (oof-split) -> excluded.

(`cpUpper 0.3942` is reported for transparency but is NOT load-bearing: VOID-on-power dominates -- the gate is
not powered at validN = 10.)

## Verdict frame (applied; frozen D-09 / D-11)
- `validN (10) < N_CTRL_FLOOR (24)` -> **VOID-on-power -> RAISE** (the pre-registered branch; the SCOPED
  sensitivity-only and clean DOES-NOT-WORK branches both require `validN >= 24`).
- Full WORKS is OUT (arm A / specificity is structurally VOID on-distribution -- not certified here).
- The Phase-19 MCC SCREEN-PASS remains an off-distribution NON-certifying diagnostic, not the specificity half.
- `decisionMatrix.raiseToUser` stays true (settle-OR-raise).
- The **Sonnet-default verify-voter SHIPS regardless** (D-01).
- The **Haiku-first flip stays DEFERRED** (Phase-20 D-06): a cheap-vs-strong McNemar / non-inferiority
  comparison is only meaningful on a construct-matched over-refusal metric that is POWERED -- this one is not.

## PROVISIONAL limits + scope (named, not hidden)
- **Power, not construct, is the binding limit here.** Unlike Phase 20 (VOID-on-construct), the construct WAS
  matched this time (open-book live-web retrieval). The limit is that the construct-matched gold-decider
  reaches consensus on too few controls (10) to clear the 24 floor.
- **Evidence is WebFetch-rendered + OA-preference retrieval** (D-07): bot-blocking publishers (NEJM, Nature,
  Science, FDA, sciencedirect, ash) were avoided in favor of openly-fetchable PRIMARY sources (arXiv, PMC,
  europePMC, ACP/Copernicus, NOAA, bioRxiv) plus reliable secondaries where needed. Construct-matched (the
  voter also retrieves via WebFetch). Any residual snapshot/time drift is a named PROVISIONAL limit.
- **Scope limit (D-05):** the 30 were CLOSED-BOOK-SELECTED; the certificate is scoped to that 30. The 20
  open-book oof-splits are NOT re-includable, and the set is NOT re-harvested (that would break the
  pre-registration). A larger, open-book-NATIVE control set is the construct-aligned way to recover power --
  future work, not this milestone.
- One source-provenance record (`photosynthesis-mechanisms::cluster21`) was completed by hand at freeze time
  (no evidence fabricated -- excerpt + quotes were retrieved this run); recorded in the lock-rule.

## RAISE -- the construct-aligned next step (headline; future work, NOT this milestone)
The construct mismatch that VOIDed Phase 20 is FIXED, but the construct-matched gold is under-powered on the
closed-book-selected 30. To validly resolve sensitivity (a SCOPED sensitivity-only certificate or a clean
DOES-NOT-WORK) the over-refusal arm needs a control set that yields `>= 24` open-book all-agree-SUPPORTED
controls -- i.e. controls SELECTED open-book-native (so the gold-decider's open-book consensus is high by
construction), not closed-book-selected then re-judged open-book. The false-uphold arm remains structurally
VOID on-distribution. Sonnet-default ships throughout; the Haiku flip is gated on a POWERED construct-matched
over-refusal metric.

## Spend (honest; verify exact on the Copilot dashboard -- M-1)
The metered Copilot OOF was the ONLY spend; captured 10/10 calls (ANSI-strip `parseCredits`; per-call values
are non-monotonic -> genuinely per-call, summed, NOT a cumulative running total -- the M-1 trap does not apply):
- Pre-flight cost spike (LZ_SAMPLE=2; 2 controls): **15.72 AI Credits** (2 calls; perCall [11.3, 4.42]).
- Full-N OOF gold (28 new controls; the 2 spike controls were cache-reused, NOT re-billed): **59.58 AI
  Credits** (8 calls; perCall [16.4, 8.05, 18.5, 6, 5.45, 2.05, 1.87, 1.26]).
- **TOTAL metered Copilot spend: 75.30 AI Credits.** Well under the ~100-350 estimate -- the spike's
  7.86/control was dominated by per-call fixed overhead; the full 8-control batches amortized it to
  ~2.1/control. The staged spike + the second human GO/NO-GO were the cost guard (D-12 / D-14); the spike
  cleared (per-item not materially over estimate) so the full N proceeded.

## Artifacts / audit trail (all gitignored except this doc + the lock-rule)
- `eval/.cache/p21-live/openbook-gold-result.json` -- the two-field gold (groundedness + validity; 10
  SUPPORTED / 20 RESIDUE / 0 NOT-SUPPORTED).
- `eval/.cache/p21-live/openbook-gold-credits.json` -- the full-N credit record (59.58, 8/8 captured).
- `eval/.cache/p21-live/openbook-rescore-result.json` -- the two-sided counts + itemized dispositions + the
  frozen CP verdict (VOID-on-power-RAISE).
- `eval/.cache/p21-live/openbook-gold-fulln.log` -- the full-N run console capture.
- `.planning/phases/21-.../21-OPENBOOK-LOCK-RULE.md` -- the pre-registration this run honored exactly.
- FILE-form test suite green (no spend on the test path): `node --test eval/.cache/p21-live/*.test.mjs` 67/67.
