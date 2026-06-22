# lz-deep-research vs built-in /deep-research parity eval -- pre-registered lock rule (Phase 22, PAR-01 / D-20)

This is the single source of truth for the PARITY / SCOPED-PARITY-OR-NAMED-GAP / NAMED-GAP verdict of
the measured parity eval of lz-deep-research against the built-in `/deep-research`, plus the frozen
judge-calibration bar, the frozen Slice-A feasibility gate, and the frozen question lists. It is
PRE-REGISTERED: it is written and committed (with a timestamp) BEFORE any report is captured or graded,
so the parity verdict and the calibration bar cannot be rationalized post-hoc (D-04 / D-05 / D-07 /
D-09 / D-13 / D-14 / D-19 / D-20).

The authority is `22-CONTEXT.md` (D-01..D-20) + `22-RESEARCH.md` (section 5 "Pre-registration mechanics
(D-20)", section 3 "The Opus judge harness", section 4 "The MCC judge-calibration gate", and the
"D-14 RESOLUTION" feasibility block). It mirrors the `eval/lz-eval-live-lock-rule.md` discipline (the
Phase-20 pre-registered lock rule).

## Frozen NUMBERS match the module constants byte-for-byte (anti-drift, D-20)

Every frozen NUMBER below is a module-level `Object.freeze`d LITERAL in the Plan 22-01 / 22-02 eval
modules, chosen and committed BEFORE any grading. They are NOT computed from any grade -- they are the
load-bearing anti-result-shopping anchor. The anti-drift co-test `eval/lz-eval-parity-prereg.test.mjs`
asserts the prose numbers below equal those constants byte-for-byte (mirroring the
`eval/lz-eval-lock-rule.md` <-> `eval/lz-eval-aggregate.mjs` `EVAL_THRESHOLDS` idiom). The code is
authoritative; if a number here ever disagrees, the code wins and this document is wrong and must be
corrected to match. Do NOT change a number in one place without changing it in the other.

| Constant | Value | Source module |
|----------|-------|---------------|
| `PARITY_BAR.PASS_THRESHOLD` | 0.7 | `eval/lz-eval-parity-verdict.mjs` |
| `PARITY_BAR.MAX_LOSS_FLOOR_DIMS` | 0 | `eval/lz-eval-parity-verdict.mjs` |
| `PARITY_BAR.MAX_LOSS_OTHER_DIMS` | 1 | `eval/lz-eval-parity-verdict.mjs` |
| `JUDGE_MCC_BAR.POINT` | 0.5 | `eval/lz-eval-judge-calibration.mjs` |
| `JUDGE_MCC_BAR.LOWER_FLOOR` | 0 | `eval/lz-eval-judge-calibration.mjs` |
| `SLICE_A_GATE.N_SUP_MIN` | 8 | `eval/lz-eval-sliceA-gold.mjs` |
| `SLICE_A_GATE.N_REF_MIN` | 8 | `eval/lz-eval-sliceA-gold.mjs` |
| `PARITY_K_RANGE.MIN` | 3 | `eval/lz-eval-parity-judge.mjs` |
| `PARITY_K_RANGE.MAX` | 5 | `eval/lz-eval-parity-judge.mjs` |

## Section (i) -- The 5-dimension rubric (verbatim) + the per-dimension scoring rule (D-04)

The rubric is Anthropic's FIVE dimensions, verbatim (from the multi-agent-research-system +
demystifying-evals-for-ai-agents posts). Each report is graded PER-DIMENSION-ISOLATED (one dimension
per judge call -> no halo effect).

1. factual / groundedness accuracy
2. citation accuracy
3. completeness / coverage
4. source quality
5. tool / process efficiency

The frozen machine dimension keys (the `lossByDimension` / `ALL_DIMS` keys the verdict validates
against) are: `factual`, `citation`, `completeness`, `source_quality`, `tool_process_efficiency`.

Per-dimension scoring rule (D-04):

- Each dimension is scored on a continuous 0.0..1.0 scale, with partial credit on atomic sub-claims
  (the factual + citation dimensions decompose the report into discrete claims + their inline citations
  via the claim-extraction bridge, D-12, and score each against the report's OWN cited evidence).
- A derived per-dimension pass/fail is computed at the pre-registered threshold:
  `PASS_THRESHOLD` = `0.7`. A dimension passes iff its score `>= 0.7`.
- An "Unknown" escape hatch is available per dimension when the judge cannot ground a verdict. Unknown
  is NOT a pass (an Unknown dimension does not satisfy the floor and does not count as a win).
- Judging is at temperature 0.

## Section (ii) -- The two frozen question lists (Slice-A seed list + Slice-B natural set)

### Slice-A AVeriTeC seed list (deterministic, judge-free, descriptive; D-11)

Slice A passes the verify-voter ONLY the claim text + the `claim_date` cutoff (every leaky gold field
stripped, T-22-05) and scores the voter's verdict against the held-back collapsed gold label,
DESCRIPTIVELY, per-confusion-matrix-direction, never pooled. The seed list is the DETERMINISTICALLY
selected claim_ids from the cached AVeriTeC dev set (`eval/.cache/chenxwh__AVeriTeC/data/dev.json`),
after the collapse map + the report-shaped + non-leaking filter, SORTED BY `claim_id`, taking a small
balanced descriptive sample of approximately 8-12 PER DIRECTION (within the feasibility gate, section
(v)). The selection rule is frozen here; the realized claim_id list is materialized deterministically
at capture time by `filterSliceA` + an ascending-`claim_id` sort + the per-direction head slice (NO
hand-picking -- anti-result-shopping). Both directions are populated.

- `unrefuted` direction (Supported -> unrefuted; the TP/FN axis): the first ~8-12 surviving Supported
  claim_ids sorted ascending.
- `refuted` direction (Refuted -> refuted; the TN/FP axis): the first ~8-12 surviving Refuted claim_ids
  sorted ascending.

### Slice-B natural research question set (head-to-head, judge-graded; D-16)

The Slice-B set is n=3 GENERAL research questions (NOT fact-check claims, NOT date-locked to <= 2020):
broad, open-ended research prompts on which BOTH the built-in `/deep-research` and lz-deep-research can
find live, current sources, so the head-to-head judge-graded parity read is on natural research breadth.
Each is captured headless k=2 runs per system, paired in the same reset window (D-16).

1. What are the leading approaches to long-context retrieval-augmented generation for large language
   models, and what trade-offs do they make between retrieval quality, latency, and cost?
2. How do modern battery-electric vehicles and hydrogen fuel-cell vehicles compare on lifecycle carbon
   emissions, refueling infrastructure, and total cost of ownership?
3. What does the current research say about the effectiveness and risks of intermittent fasting for
   metabolic health in adults?

These are FROZEN. The realized questions cannot be swapped after capture begins (anti-result-shopping).

## Section (iii) -- The verdict-collapse map (D-11)

The AVeriTeC 4-way label collapses to the binary verify-voter enum:

- Supported -> `unrefuted`
- Refuted -> `refuted`
- Conflicting Evidence/Cherrypicking -> EXCLUDED (kappa noise; dropped from the denominator)
- Not Enough Evidence (NEI) -> HELD OUT (collapses to null; not scored)

Conflicting and NEI both collapse to null. This map is frozen in `eval/lz-eval-sliceA-gold.mjs`
(`collapseAvtLabel`).

## Section (iv) -- The judge-calibration MCC bar (D-13)

Before the Opus judge may grade ANY report, it is calibrated through the existing MCC machinery over the
CLOSED-BOOK calibration set (WiCE, MUST include `partially_supported` subtle-overreach items, +
LLM-AggreFact de-duped against WiCE -- LLM-AggreFact embeds WiCE). The judge clears the bar iff:

- the MCC point estimate is `>= JUDGE_MCC_BAR.POINT` = `0.5`, AND
- the one-sided lower-CI bound (alpha `0.05`) is STRICTLY `> JUDGE_MCC_BAR.LOWER_FLOOR` = `0` (the MCC
  chance value).

An uncalibrated judge (the bar not cleared) is a DISQUALIFIER (PAR-02): the caller STOPS and does NOT
grade -- never a silent grade, never a relaxed bar. The bar is frozen in
`eval/lz-eval-judge-calibration.mjs` (`JUDGE_MCC_BAR`, re-exporting the frozen `lz-eval-mcc.mjs`
constants). The ROLE SEPARATION is load-bearing: the CLOSED-book gold calibrates the JUDGE only -- it
NEVER directly grades an open-book report (that construct mismatch is the Phase 18-21 VOID).

## Section (v) -- The Slice-A feasibility gate (D-14, RESOLVED FEASIBLE) + the fallback + PROVISIONAL limits

The Slice-A feasibility gate is RESOLVED and FROZEN. Slice A RUNS as a deterministic, judge-free,
descriptive slice IFF, from the cached AVeriTeC dev set, after the collapse map + the report-shaped +
non-leaking filter:

- clean unrefuted (Supported) items `>= SLICE_A_GATE.N_SUP_MIN` = `8`, AND
- clean refuted (Refuted) items `>= SLICE_A_GATE.N_REF_MIN` = `8`, AND
- BOTH directions populated (so the confusion matrix is two-sided, not falsehood-only).

RESOLVED FEASIBLE (by in-repo cache inspection 2026-06-22): clean Supported = 95 (`>= 8` OK), clean
Refuted = 216 (`>= 8` OK), both directions populated -> GATE CLEARS. The D-14 conditional branch is
RESOLVED PRE-GRADE; this resolved pre-registered conditional is valid pre-registration, not
result-shopping (D-14 explicit). The gate is frozen in `eval/lz-eval-sliceA-gold.mjs` (`SLICE_A_GATE` +
`sliceAFeasibilityGate`).

THE D-14 FALLBACK RULE (frozen, pre-registered): IF the gate had NOT cleared (insufficient yield /
representativeness), Slice A degrades to a judge-calibration probe ("Slice B + Slice-A-as-calibration-
probe"), NOT a bare lean. Because the gate CLEARS, the fallback is NOT triggered. It is recorded here so
the conditional branch is frozen before grading.

PROVISIONAL LIMITS (recorded with EVERY Slice-A run; they SCOPE the read, they do NOT block):

- uniform 2020 claim_date (out-of-cutoff for a 2026 voter; the voter judges the claim as-of 2020).
- topical narrowness (the AVeriTeC dev set is ~34% US-2020-politics, ~21% COVID -- NOT a representative
  cross-section of general research questions; Slice A speaks to fact-check-style claims, not Slice B's
  natural breadth).

## Section (vi) -- The two-layer parity bar + k + the D-09 disclosure + the D-19 threat-to-validity

### The two-layer mechanical parity verdict (D-05 / D-06 / D-07)

The verdict is a COUNT comparison, NEVER a statistic (D-07 forbids confidence intervals /
non-inferiority margins at n=2-3; there is no jstat in the verdict path). The verdict is NEVER a ship
gate (D-03): the Sonnet-default skill ships regardless; the output is confidence / an operating envelope
/ an honest named gap.

- LAYER 1 -- the absolute quality FLOOR (D-05): the Sonnet lz skill must pass BOTH floor dimensions
  (`factual` AND `citation`, the `PARITY_BAR.FLOOR_DIMS`) on EVERY frozen question. A floor failure on
  ANY question -> NAMED-GAP (the floor is load-bearing).
- LAYER 2 -- the comparative PARITY bar (D-06 / D-07): a per-cell win/tie/loss is recorded PER
  (question x dimension) ONLY when BOTH position-swap orderings agree, else TIE (D-06; `cellVerdict`).
  PARITY iff (a) the floor passes on all frozen questions AND (b) zero clear LOSS on factual OR citation
  (`MAX_LOSS_FLOOR_DIMS` = `0` -- a single floor-dim loss breaks parity) AND (c) at most one clear LOSS
  total across the other 3 dimensions (`MAX_LOSS_OTHER_DIMS` = `1`).

Outcomes (frozen in `eval/lz-eval-parity-verdict.mjs` `parityVerdict`):

- `PARITY` iff the floor passes AND floor-dim losses `== MAX_LOSS_FLOOR_DIMS` (0) AND other-dim losses
  `<= MAX_LOSS_OTHER_DIMS` (1).
- `NAMED-GAP` iff the floor fails on any question (load-bearing; takes precedence).
- `SCOPED-PARITY-OR-NAMED-GAP` otherwise (the floor passes but the parity bar (b)/(c) is breached).

Raw per-cell verdicts are reported per-direction, never only the aggregate (D-07).

### k -- the per-cell multi-sample count

Each (question x dimension x ordering) cell is sampled k times for SEM REPORTING (the SEM is a pure
arithmetic descriptor, NOT a CI gate -- D-07). k MUST sit within `PARITY_K_RANGE`: `MIN` = `3` ..
`MAX` = `5`, inclusive. The realized run uses k = 3 (within the locked range); a k outside [3..5] is a
ContractError in `eval/lz-eval-parity-judge.mjs` (`scoreJudgeCells`).

### The D-09 instrument-strength disclosure (frozen)

The eval instrument (the Opus judge) is DELIBERATELY STRONGER than and INDEPENDENT of the product's
runtime cost profile. The advisor strategy (Sonnet-mostly / Opus-minimal) is a property of the SHIPPED
SKILL AT RUNTIME, NOT a constraint on the eval or dev tooling. An Opus judge does not weaken the
"near-Opus at Sonnet cost" runtime claim -- measuring the product with a strong, independent instrument
is the correct methodology, not a contradiction of the runtime cost story (D-09 / D-08: no in-family
panel partner but Sonnet, and Sonnet-judging-Sonnet is the near-lineage self-preference worst case AND
biases toward our own Sonnet-driven candidate).

### The D-19 self-preference symmetric-cancellation threat-to-validity (frozen)

Self-preference symmetric-cancellation is DEFENSIBLE-BUT-NOT-PROVEN. "Claude grading Claude at n=2-3" is
conceded as a DEFENSIBLE PARITY SCREEN, NEVER A PROOF. The backstops -- the single Opus judge (not a
self-preferring Sonnet), blinding + position-swap (a win only when both orderings agree, which cancels a
symmetric ordering bias), reference-gold-anchoring on the factual dimension, and the judge-free Slice A
-- mitigate but do not eliminate the self-preference threat. This threat is recorded here as an explicit
limit on the parity read; it is NEVER claimed away.

## Anti-result-shopping discipline (the freeze)

- This pre-registration is COMMITTED in its OWN timestamped commit BEFORE the first grading spend (Plan
  22-05). The committed, timestamped pre-registration is the precondition gate for ALL grading spend.
- The frozen NUMBERS match the `Object.freeze`d module constants byte-for-byte (the anti-drift co-test
  enforces it). A bar is NEVER re-tuned after seeing a grade. The Slice-A feasibility branch is RESOLVED
  pre-grade (a resolved pre-registered conditional is valid pre-registration; no new branch may be added
  at grade time).
- Both question lists, the collapse map, the MCC bar, the feasibility gate + fallback, and the parity
  bar + k are all FROZEN here, before any capture or grade. The realized Slice-A claim_id list is
  materialized deterministically (sorted by claim_id) from the frozen selection rule -- not hand-picked.

## FREEZE RECORD (pre-registration timestamp)

The frozen NUMBERS above were recorded as module-level `Object.freeze`d literals (Plans 22-01 + 22-02)
and frozen in this lock rule at the timestamp of THIS lock rule's own commit (Plan 22-04), BEFORE any
report is captured or graded. The commit ref + the freeze timestamp are the pre-registration timestamp
of record. No optional stopping; the bars are frozen in advance; the Slice-A branch is resolved
pre-grade. The zero-grades window is genuinely open at this freeze (no report is captured or graded yet),
so the pre-registration is clean, not result-shopping.

## Cross-reference

- `eval/lz-eval-parity-verdict.mjs` -- the frozen `PARITY_BAR` + the two-layer `parityVerdict`.
- `eval/lz-eval-parity-judge.mjs` -- the frozen `PARITY_K_RANGE` + the position-swap `cellVerdict` /
  `scoreJudgeCells`.
- `eval/lz-eval-judge-calibration.mjs` -- the frozen `JUDGE_MCC_BAR` + the `judgeCalibrationGate`.
- `eval/lz-eval-sliceA-gold.mjs` -- the frozen `SLICE_A_GATE` + `collapseAvtLabel` + `filterSliceA` +
  `sliceAFeasibilityGate` + the PROVISIONAL limits.
- `eval/lz-eval-parity-driver.md` -- the session-driven capture + calibrate + grade protocol (the
  transport split; OOF FORBIDDEN here, D-18).
- `eval/lz-eval-parity-prereg.test.mjs` -- the anti-drift co-test (the prose NUMBERS == the frozen
  module constants byte-for-byte).
- `22-CONTEXT.md` D-04/D-05/D-06/D-07 (rubric + verdict), D-08/D-09 (judge tier + disclosure), D-11/D-12
  (gold anchoring + claim-extraction bridge), D-13 (MCC calibration), D-14 (feasibility gate +
  fallback), D-18 (no OOF spend), D-19 (self-preference threat), D-20 (pre-registration discipline).
