# lz-advisor LIVE certified-WORKS verify-voter certification -- pre-registered lock rule (Phase 20, certified-WORKS RE-PLAN, two-arm split-source)

> **AMENDMENT 2026-06-20 (RATIFIED -- original cross-family board, UNANIMOUS 4/4; see `CERTIFY-WORKS-RATIFICATION.md`).**
> ARM A is no longer authored minimal-edit contrastive pairs. ARM A is now the skill's OWN naturally-occurring
> Contested/Unsupported claims, RETAINED as refuted-gold ONLY by the frozen OOF all-agree gold-blind pair
> ("evidence does not entail"; gold = the OOF read, NEVER the skill self-tag), difficulty-matched to the ARM-B
> SUPPORTED controls STATISTICALLY (covariate-overlap + subject-difficulty + cluster guards), NOT by minimal-pair
> construction. Construct-validity gate (d) minimal-edit/source_uid is DROPPED; gates (a) lexical-AUC <= 0.65 and
> (b) one-sided not-easier are RE-RUN ON THE POST-OOF RETAINED SET before vote 1, jointly with the N-freeze; fail
> either -> VOID-on-validity -> SCOPED external arm + RAISE. This is FULL-WORKS-eligible (C is on-distribution; the
> off-distribution external benchmark stays SCOPED-only). The six pre-spend locks are ratified in
> `CERTIFY-WORKS-RATIFICATION.md`. The sections below that still describe the minimal-edit ARM A are SUPERSEDED for
> ARM A by this amendment; everything about ARM B, the CP gates, EVAL_THRESHOLDS, the OOF gold pair, and the
> anti-result-shopping discipline stands byte-identical. The FULL re-freeze (this doc + the realized N_trap + the
> realized retained set + a new freeze timestamp) is COMMITTED AT STAGE 1 [HUMAN BLOCK], before any scored vote.

This is the single source of truth for the WORKS / SCOPED / DOES-NOT-WORK / VOID thresholds of the LIVE
certification of the lz-deep-research verify-voter. It is PRE-REGISTERED: it is written and committed
BEFORE any scored vote and BEFORE any false-uphold pair is authored or scored, so the live verdict and the
construct-validity bar cannot be rationalized post-hoc (D-01 / D-02 / D-07 / D-19 / D-20 / D-21).

The authority for the certified-WORKS methodology is `CERTIFY-WORKS-BOARD-DECISION.md` (a 3-round UNANIMOUS
cross-family board) + `20-CONTEXT.md` D-21 (the board re-plan directive). It SUPERSEDES the prior D-02
false-uphold positives source ("harvest dense-SUPPORTED from the skill's own output"), which the Stage-0
harvest RAISE proved empirically INFEASIBLE (~0.33 dense-SUPPORTED/run; lexical dedup under-merges so
corroboration sticks at 1; the dense-trap arm would need ~90 runs -- `20-05-LIVE-CERT-RESULT.md`). The
frozen `EVAL_THRESHOLDS` (TAU_FU / TAU_OR / N_CTRL_FLOOR) + the verdict engine (`certifyModel` /
`decisionMatrix` / `clopperPearsonUpperOneSided`) carry BYTE-IDENTICAL; the over-refusal CP gate stays on
the live arm.

## The certified-WORKS methodology: TWO arms, split-source, both certifying (D-21)

WORKS is certified over TWO SEPARATE arms that are NEVER pooled into one N. Each arm is in-distribution for
the cases its gate bounds; Signal-Detection Theory estimates sensitivity (over-refusal) and specificity
(false-uphold) on separate trial pools regardless of stimulus origin, so a shared pipeline / origin is NOT
required.

- **ESTIMAND B (over-refusal) -- arm B, LIVE-HARVESTED.** The over-refusal control arm STAYS live-harvested
  from the shipping skill's OWN output (D-02 remains valid for arm B; ~2.3 SUPPORTED/run feasible, ~13
  runs). The harvested adjudicated SUPPORTED positives the voter SHOULD uphold; an over-refusal is a wrong
  refute on one of these. N >= 30. Gate: `clopperPearsonUpperOneSided(overRefusals, nCtrl) <= TAU_OR (0.15)`.
  Source: `eval/lz-eval-harvest.mjs` (`harvest` -> `overRefusalControls`).
- **ESTIMAND A (false-uphold) -- arm A, MANUALLY-CONSTRUCTED contrastive minimal-pairs.** The false-uphold
  arm is now MANUALLY-CONSTRUCTED contrastive minimal-pairs, each a MINIMAL EDIT of a REAL live dense
  evidence bundle of the SAME class as the over-refusal positives (flip ONLY the truth-value; preserve
  density / length / style). A false-uphold is a wrong uphold of an unsupported overreach. N >= 30 (the
  12-trap seed is UNDERPOWERED for TAU_FU 0.10 -- CP-upper(0/12) ~ 0.22-0.27 > 0.10 -- so it is EXPANDED to
  >= 30; the 12 are reused as seed material). Gate:
  `clopperPearsonUpperOneSided(falseUpholds, nTrap) <= TAU_FU (0.10)`.
  Source: `eval/lz-eval-contrastive-authoring.mjs` (`authorContrastivePair` / `adjudicateContrastivePairs`).

The two arms are frozen as SEPARATE counts BEFORE any scored vote (the N-freeze guard `freezeArms` in
`eval/lz-eval-live-cert.mjs` enforces at-or-above-floor + disjoint arms + a frozen snapshot). A function or
return shape that pools the two arms into one N is a DEFECT. The arm-A authoring harness owns ONLY arm A and
NEVER sees arm B's over-refusal controls.

## The WORKS verdict (the resolved crux, D-21)

A split-source design (live over-refusal + manual-from-real-bundles false-uphold) is a **valid WORKS**, NOT
merely a scoped certificate, **IF AND ONLY IF**:

1. it is **pre-registered** before any scored vote (this document, committed with a timestamp -- below);
2. every false-uphold item is a **minimal edit of a real live dense bundle** of the same class as the
   over-refusal positives (construct-validity gate (d), MANDATORY);
3. the **construct-validity check** (below) passes;
4. **BOTH CP gates pass** (ESTIMAND A false-uphold CP-upper `<= TAU_FU` 0.10 AND ESTIMAND B over-refusal
   CP-upper `<= TAU_OR` 0.15), the N floors met.

If the construct-validity check FAILS -> a **SCOPED certificate**, scoped exactly to the unverified
distribution claim (NOT a WORKS). If a CP gate is breached -> DOES-NOT-WORK. If an arm is below floor / a
floor flag fails -> VOID. In EVERY case the Sonnet-default voter SHIPS regardless (settle-OR-raise, D-01);
`decisionMatrix.raiseToUser` is true always.

## The construct-validity gate (D-21; board section 3)

Three gates fold into the construct-validity verdict (`constructValidityVerdict` in
`eval/lz-eval-contrastive-authoring.mjs`); `constructValid = (d) AND (a) AND (b)`:

- **(d) MANDATORY construction rule:** every arm-A trap is a minimal edit of a real live dense bundle (the
  pair carries `source_uid`; no synthetic-from-scratch). A pair missing `source_uid` fails (d) CLOSED.
- **(a) PRIMARY empirical gate -- the zero-dep lexical-overlap AUC:** a pre-registered, ZERO-DEPENDENCY
  lexical-overlap baseline must NOT separate the SUPPORTED/REFUTED members of a pair above the ceiling.
  PASS iff `lexicalOverlapAuc(pairs).auc <= LEXICAL_AUC_CEILING`. (The truth-value must not be lexically
  readable; this kills the artifact a minimal-pair edit most plausibly injects.) The AUC is hand-rolled
  Mann-Whitney rank/counting math (the lexical baseline stays ZERO-DEP -- NOT a stats lib), in
  `eval/lz-eval-baseline-guard.mjs` (`lexicalOverlapAuc`).
- **(b) ONE-SIDED difficulty-proxy guard:** compute the proxy (corroboration distribution + claim length +
  paraphrase spread) and report it descriptively. FAIL the certificate ONLY if the constructed cell is
  detectably EASIER than the harvested dense-SUPPORTED cell beyond the pre-registered margin
  (easier-direction SMD > `EASIER_DIRECTION_SMD_MARGIN` at the one-sided `DIFFICULTY_GUARD_ALPHA`). PASS if
  HARDER or statistically indistinguishable. A symmetric equivalence/TOST test is EXPLICITLY REJECTED
  (underpowered at N~30; the threat is strictly one-tailed -- only an EASIER cell fakes specificity), in
  `eval/lz-eval-difficulty-proxy.mjs` (`oneSidedNotEasierGuard`).
- **(c) blind distinguishability audit:** secondary / optional corroboration only; never the sole gate.

## The 10-pair pre-scale probe (D-21; board section 4)

Before spending the full N on arm A, run a 10-pair probe (`runPrescaleProbe` in
`eval/lz-eval-prescale-probe.mjs`). Both gates must pass:

1. the OUT-OF-FAMILY all-agree gold panel unanimously admits `>= PROBE_UNANIMITY_FLOOR (9)` of
   `PROBE_PAIR_COUNT (10)` pairs (a pair is admitted iff BOTH its members are retained by the strict
   all-agree gold-blind consensus);
2. the lexical-overlap AUC over the 10 pairs is `<= LEXICAL_AUC_CEILING`.

Pass BOTH -> scale to the full N. Any fail -> reconstruct + re-probe; do NOT scale.

**The scored voter is RUN-but-DO-NOT-GATE.** It runs over the 10 pairs (`callVoter`, persisted via
`persistDualRunVote`) for pipeline/telemetry validation + a PRE-REGISTERED VOLUNTARY early-stop signal
(`>= 1` scored false-uphold on the probe jeopardizes clearing TAU_FU at N=30 -> the operator INVESTIGATES
the pipeline / re-pre-registers, NEVER edits items until the probe is clean). It is EXCLUDED from
`decidePrescale` (a scored pass on 10 pairs has negligible power vs TAU_FU 0.10, and gating on it would
tune the corpus against the certified system).

## Strong-first, then cheap-separate (D-21; board section 5)

- Certify the **STRONG tier (Sonnet) FIRST** against the frozen corpus / gold / gates.
- The **CHEAP tier (Haiku) is a SEPARATE certification** over the SAME frozen corpus / gold / gates, with
  Haiku-specific prompts frozen BEFORE its scored vote (the EVAL-05 research-grounded
  `lz-haiku-prompt-engineering.md` prompt) + an explicit task-fit pre-gate (if it cannot clear the
  over-refusal gate even on sparse positives, it is task-unfit -> certify strong-only + RAISE; do NOT spend
  the dense wave on it). No tier inherits another's verdict; no TAU is loosened per tier. The Haiku-first
  flip is DEFERRED regardless (D-06) -- the flip is a future human checkpoint after a live WORKS pass + a
  clean unanimous-uphold audit + a real cost win. Sonnet-default ships regardless.

## The NEW frozen bar constants (PRE-REGISTERED; recorded WITH A TIMESTAMP before any pair is scored)

The bar for the construct-validity gate + the probe is literature-unspecified, so the
pre-register -> author -> score ORDERING is the ONLY defense against result-shopping. These are
module-level LITERALS, FROZEN BEFORE any arm-A pair is authored or scored. They are NOT computed from the
corpus. The code is authoritative; if a number here ever disagrees, the code wins and this document is
wrong and must be corrected to match.

| Constant | Value | Source module | Meaning |
|----------|-------|---------------|---------|
| `LEXICAL_AUC_CEILING` | 0.65 | `eval/lz-eval-baseline-guard.mjs` | Gate (a): the lexical-overlap AUC must be `<= 0.65` (the permissive end of the board's [0.60, 0.65] band -- conservative against false-failing a clean corpus). |
| `EASIER_DIRECTION_SMD_MARGIN` | 0.5 | `eval/lz-eval-difficulty-proxy.mjs` | Gate (b): FAIL only when the constructed cell is detectably EASIER beyond an SMD of 0.5 (a medium effect). |
| `DIFFICULTY_GUARD_ALPHA` | 0.05 | `eval/lz-eval-difficulty-proxy.mjs` | Gate (b): the one-sided alpha (mirrors `MCC_CI_ALPHA`). |
| `PROBE_PAIR_COUNT` | 10 | `eval/lz-eval-prescale-probe.mjs` | The pre-scale probe size (10 pairs). |
| `PROBE_UNANIMITY_FLOOR` | 9 | `eval/lz-eval-prescale-probe.mjs` | The probe gate: the OOF panel must unanimously admit `>= 9` of 10 pairs. |
| `MIN_TRAP_PAIRS` | 30 | `eval/lz-eval-contrastive-authoring.mjs` | The arm-A floor: fewer than 30 pairs is UNDERPOWERED for TAU_FU 0.10 (CP-upper(0/12) ~ 0.22-0.27 > 0.10); 0/30 clears 0.10. |

**FREEZE RECORD (pre-registration timestamp):** the constants above were frozen as module literals and
recorded in this lock rule on **2026-06-20T14:39:54Z** (Plan 20-06, Task 3), BEFORE any arm-A pair is
authored or scored. No optional stopping; N is frozen in advance; the two arms are never pooled. The
zero-votes window is genuinely open at this freeze (no scored vote exists), so re-pre-registration is clean,
not result-shopping.

## The frozen thresholds (BYTE-IDENTICAL to EVAL_THRESHOLDS -- references, NOT new numbers, D-03)

The live N TARGETS sit ABOVE the frozen floor. They are run-config N TARGETS, NOT threshold changes: the
frozen `EVAL_THRESHOLDS` numbers stay BYTE-IDENTICAL. This document references them; it never introduces a
new threshold. The code (`eval/lz-eval-aggregate.mjs` `EVAL_THRESHOLDS`, `Object.freeze({...})`) is
authoritative; if a number here ever disagrees, the code wins.

| Threshold | Value | Meaning |
|-----------|-------|---------|
| `TAU_FU` | 0.10 | The false-uphold bar (ESTIMAND A, arm A). PASS_A iff `clopperPearsonUpperOneSided(falseUpholds, nTrap) <= TAU_FU`. The catastrophic arm: silently shipped bad research. Byte-identical to `EVAL_THRESHOLDS.TAU_FU`. |
| `TAU_OR` | 0.15 | The over-refusal bar (ESTIMAND B, arm B). PASS_B iff `clopperPearsonUpperOneSided(overRefusals, nCtrl) <= TAU_OR`. The over-refusal CP gate is on this live arm. Byte-identical to `EVAL_THRESHOLDS.TAU_OR`. |
| `N_CTRL_FLOOR` | 24 | The F1-corrected control-arm power floor under the one-sided CP -- byte-identical to `EVAL_THRESHOLDS.N_CTRL_FLOOR`. The live N targets sit ABOVE this floor (40, run-config floor 30). NOT a new number. |

The CP estimator is the FROZEN `clopperPearsonUpperOneSided` (the F2-pinned one-sided 95% upper) --
jstat-backed, NEVER hand-rolled and NEVER Wald / bootstrap (D-07). NEVER relax a TAU to fit a realized N.

### The N=24-knife-edge arithmetic (the decisive reason the targets sit ABOVE the frozen floor)

N=24 is a knife-edge, NOT a target. At the one-sided 95% Clopper-Pearson:

- `CP1s(0,24) = ~0.117` clears `TAU_OR` (0.15) ONLY at exactly zero over-refusals -- and `~0.117` can FAIL
  the separate `TAU_FU` (0.10) gate;
- `CP1s(1,24) = ~0.183` FAILS `TAU_OR` (0.15) -- a SINGLE over-refusal at N=24 breaches the bar;
- `CP1s(1,30) = ~0.149` clears `TAU_OR` (0.15) -- so the floor-30 arm absorbs one adjudication artifact;
- `CP1s(2,40)` is comfortably below `TAU_OR` -- so the target-40 arm absorbs two;
- for arm A: `CP-upper(0/12) ~ 0.22-0.27 > TAU_FU 0.10` is UNDERPOWERED; `CP-upper(0/30)` clears 0.10 ->
  arm A is EXPANDED to N >= 30 (`MIN_TRAP_PAIRS`).

This is why the targets sit ABOVE the frozen floor (N_ctrl 40 / N_trap >= 30), never the bare 24 knife-edge.
Raising the N TARGET above `N_CTRL_FLOOR=24` keeps `EVAL_THRESHOLDS` byte-identical (D-03); it is
frozen-floor headroom, not a threshold change. NEVER relax a TAU to fit a realized N.

## The acceptance rule (WORKS = construct-validity passes AND BOTH live gates pass, N floors met)

`certifyModel` (`eval/lz-eval-offline-read.mjs`, CONSUMED byte-identical) returns the per-model verdict:

> WORKS = the construct-validity check passes (minimal-edit + lexical-AUC + one-sided not-easier) AND
> ESTIMAND A (CP1s false-uphold `<= TAU_FU` 0.10 over the arm-A contrastive monitor) AND ESTIMAND B (CP1s
> over-refusal `<= TAU_OR` 0.15 over the arm-B harvested control), with the N floors met.

- `SCOPED` if the construct-validity check fails (scoped to the unverified distribution claim; NOT WORKS).
- `DOES-NOT-WORK` if either CI exceeds its TAU.
- `VOID-on-power` if an arm is below its floor (the read lacks power).
- `VOID-difficulty` / `VOID-covariate` from the F5 floors; `VOID-artifact` on an always-refute / bad-trace
  collapse (carried from the frozen `certifyModel`).

The two arms are passed SEPARATELY to `certifyModel` (`overRefusals, nCtrl` is ESTIMAND B; `falseUpholds,
nTrap` is ESTIMAND A) -- NEVER pooled into one N. The Haiku-first flip is DEFERRED (`decisionMatrix`
`raiseToUser: true` ALWAYS).

## The adjudicator (D-04; HYBRID -- frozen OOF all-agree PRIMARY + maintainer-resolved residue)

The gold is the FROZEN OUT-OF-FAMILY all-agree gold-decider pair (carried byte-identical):
gpt-5.5 + gemini-3.1-pro-preview, `--effort high`, all-agree, gold-blind. The adjudicator stays
OUT-OF-FAMILY from any tier under test. The arm-A authoring harness AND the 10-pair probe consume THIS
exact pair as the gold adjudicator -- no new gold identity. The solo maintainer resolves ONLY the RESIDUE
(`oof-split` / `response-set-indeterminate` -- Guerdan response-set exclusion / `cheap-vs-unanimous-oof`),
via the deterministic `classifyAdjudicationResidue`.

## The DISTRIBUTION-SCOPE LIMIT (D-05; "no theatre" -- name the limit in the report)

There is NO production traffic, so a staged operational shadow -> canary -> Tier-1 is NOT literally
applicable and MUST NOT be faked. The verdict certifies on the MAINTAINER-CURATED DISTRIBUTION (arm B from
the skill's own runs; arm A minimal-edited from real dense bundles), NOT "all production." This limit is
NAMED in the run artifact / report -- a WORKS verdict over-generalizes if the report omits it.

## The staging (D-07; staged, pre-registered, human-authorized BLOCKING spend)

The certification SPEND is a STAGED, PRE-REGISTERED, human-authorized BLOCKING spend. Every model-spend
stage is hard-guarded behind `LZ_SPEND=1` (the dry-run + the entire test suite run STUBS only).

- **Stage 0 (D-19 harvest feasibility probe + arm-A authoring; NO SPEND):** confirm arm B can harvest
  `>= 30` difficulty-representative SUPPORTED claims; AUTHOR arm A as `>= 30` manual contrastive
  minimal-pairs from real dense bundles; run the construct-validity gate + the 10-pair probe. If arm B is
  infeasible OR construct validity fails OR the probe says reconstruct -> RAISE; Sonnet-default ships.
- **Stage 1 [HUMAN BLOCK]:** FREEZE the two arms (`freezeArms`) + the acceptance rule (the N targets, the
  0.15/0.10 ceilings, the CP estimator, the NEW bar constants) + COMMIT this lock rule BEFORE any scored
  vote.
- **Stage 2:** dual-run STRONG-first then CHEAP-separate over the FROZEN artifacts; compute CP via
  `certifyModel` per model, per arm.
- **Stage 3:** the unanimous-uphold audit / load-bearing census folded in.

## NO optional stopping (the anti-result-shopping discipline)

NO optional-stopping / add-until-pass: N is FROZEN in advance (the N-freeze guard freezes the two arms at
Stage 1, before any scored vote; the NEW bar constants are frozen at this lock rule's commit, before any
arm-A pair is authored or scored). The two arms are NEVER pooled into one N. The prose threshold numbers
MATCH `EVAL_THRESHOLDS` byte-for-byte. N does NOT grow after the first CP read; a TAU is NEVER relaxed to
fit a realized N. The 10-pair probe gates on the OOF unanimity + the AUC, never edits items until clean.

## On WORKS / on SCOPED / on DOES-NOT-WORK / on VOID / on RAISE

- **WORKS** -- the construct-validity check passes AND BOTH live gates pass (ESTIMAND A `<= TAU_FU` AND
  ESTIMAND B `<= TAU_OR`), the N floors met. The verdict certifies on the maintainer-curated distribution
  (named in the report), NOT "all production." It does NOT auto-flip Haiku ON (the flip is DEFERRED, D-06).
- **SCOPED** -- the construct-validity check fails (a lexical/difficulty artifact, or a non-minimal-edit).
  A scoped certificate, scoped exactly to the unverified distribution claim. RAISE; Sonnet-default ships.
- **DOES-NOT-WORK** -- a CI exceeds its TAU. RAISE; Sonnet-default ships; the Haiku-first flag stays OFF.
- **VOID** -- the read lacks power / fails a floor (an arm below floor, the D-19 feasibility shortfall, an
  always-refute or bad-trace artifact). RAISE; Sonnet-default ships.
- **RAISE** -- `raiseToUser` is true in EVERY case (settle-OR-raise). The Sonnet-default voter SHIPS
  regardless of the live-cert outcome.
