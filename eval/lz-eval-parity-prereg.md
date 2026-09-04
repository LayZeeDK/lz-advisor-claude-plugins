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
| `JUDGE_MCC_BAR.ALPHA` | 0.05 | `eval/lz-eval-judge-calibration.mjs` |
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

### Slice-B natural research question set (head-to-head, judge-graded; D-16) [RE-FROZEN 2026-06-23 -- see AMENDMENT RECORD]

The Slice-B set is n=3 GENERAL research questions (NOT fact-check claims, NOT date-locked to <= 2020):
bounded, single-facet research prompts on which BOTH the built-in `/deep-research` and lz-deep-research
can find live, current sources AND that COMPLETE within one 5-hour pool window. The original broad,
multi-facet set (preserved in the AMENDMENT RECORD) was empirically INFEASIBLE: a single built-in
`/deep-research` run on a broad question did not finish inside a 5-hour window (two runs cost ~25.46 /
~47.08 USD notional and were rate-limited before producing any report). The narrower set below is the
feasibility amendment; the questions remain GENERAL and were NOT chosen against any grade (zero reports
captured at amendment time). Each is captured headless k=1 run per system, paired in the same reset
window (D-16).

1. What techniques do large language models use to extend their context window beyond 100K tokens?
2. How does a solid-state battery differ from a conventional lithium-ion battery?
3. What does recent research say about time-restricted eating and weight loss in adults?

These are FROZEN (as re-frozen per the AMENDMENT RECORD). The realized questions cannot be swapped after
capture begins (anti-result-shopping).

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

## AMENDMENT RECORD -- Slice-B feasibility re-freeze (2026-06-23)

WHAT CHANGED: the Slice-B question set (Section (ii)) was narrowed from 3 broad, multi-facet questions
to 3 bounded, single-facet questions, and the per-system capture count was reduced from k=2 to k=1.
NOTHING ELSE changed: the 5-dimension rubric, the frozen NUMBERS (PARITY_BAR / JUDGE_MCC_BAR /
SLICE_A_GATE / PARITY_K_RANGE), the verdict-collapse map, the MCC bar, the Slice-A seed rule + feasibility
gate, the two-layer parity bar, and the grading k (3..5, `PARITY_K_RANGE`) are ALL UNCHANGED and the
anti-drift co-test still passes byte-for-byte.

WHY (feasibility, NOT result-shopping): the original broad set was empirically infeasible to capture. Two
built-in `/deep-research` smoke runs on the original question 1 ("leading approaches to long-context RAG +
trade-offs") did NOT complete inside a 5-hour pool window -- they cost ~25.46 and ~47.08 USD notional
(retry-inflated) and were rate-limited before emitting any report. A single broad built-in run exceeds a
5-hour budget; the built-in is closed-source (its fan-out cannot be slimmed) and emits its report only on
completion. The narrower questions let a run COMPLETE in-budget.

WHY IT IS STILL CLEAN PRE-REGISTRATION: the amendment was made at a genuinely OPEN zero-grades window --
ZERO reports have been captured or graded (both smoke runs produced no report). The new questions remain
GENERAL research questions (not fact-check claims, not date-locked, not cherry-picked toward either
system). This is a feasibility-driven re-freeze decided BEFORE any grade exists, maintainer-ratified,
analogous to the D-14 resolved-conditional discipline -- not optional stopping or result tuning. The
original broad set is preserved here for the record:

  ORIGINAL (superseded, infeasible):
  1. What are the leading approaches to long-context retrieval-augmented generation for large language
     models, and what trade-offs do they make between retrieval quality, latency, and cost?
  2. How do modern battery-electric vehicles and hydrogen fuel-cell vehicles compare on lifecycle carbon
     emissions, refueling infrastructure, and total cost of ownership?
  3. What does the current research say about the effectiveness and risks of intermittent fasting for
     metabolic health in adults?

This amendment is committed in its OWN timestamped commit (the re-freeze timestamp of record), BEFORE any
report is captured or graded under the amended set. See `eval/lz-eval-parity-driver.md` "Resumability +
pacing" for the capture-resume protocol the feasibility constraint also motivated.

## AMENDMENT RECORD 2 -- judge-calibration set: WiCE-only materialization (LLM-AggreFact RELOCATED, not dropped) (2026-06-23)

WHAT CHANGED: the Stage-2 judge-calibration set is MATERIALIZED as WiCE-only (the 60 vendored WiCE
items, including all 17 `partially_supported` subtle-overreach items). The 4 LLM-AggreFact items named
in Section (iv) and in the committed manifest are RELOCATED (NOT dropped) -- carried forward as a
pre-registered SEED for a future phase (see "RELOCATED, not dropped" below). NOTHING ELSE changed: the
5-dimension rubric, the frozen NUMBERS (PARITY_BAR / JUDGE_MCC_BAR / SLICE_A_GATE / PARITY_K_RANGE), the
verdict-collapse map, the MCC bar predicate, the Slice-A seed rule + feasibility gate, the two-layer
parity bar, and the grading k are ALL UNCHANGED and the anti-drift co-test still passes byte-for-byte.
There is NO frozen calibration-set N -- the MCC bar is N-agnostic (it requires only the point estimate
>= `JUDGE_MCC_BAR.POINT` and a one-sided lower CI strictly > `JUDGE_MCC_BAR.LOWER_FLOOR`); the mandatory
subtle-item requirement (`judgeCalibrationGate` enforces subtle count >= 1) is satisfied by WiCE's 17
subtle items.

WHY (feasibility, NOT result-shopping): the 4 LLM-AggreFact items existed in the committed manifest ONLY
as placeholder uids (`llm-aggrefact-test-0000..0003`, source_label 1/1/0/0,
`revision: PENDING_ENUMERATE_AT_EVAL_TIME`, `files: []`, no corpus text, no uid->row mapping). At
eval-time enumeration the gated fetch SUCCEEDED (authenticated; revision
`981dfd0bd8e58e7238a9ab92b2e6ea44bce918e4`; `data/test-00000-of-00001.parquet` sha256
`ba6976c3da990a9d7b11670efaf4e3c93c1bd0530061ec742afd6b2d5bce698c`, 29320 rows), but the committed
placeholder labels `[1,1,0,0]` map to NO recoverable rows (the first 4 test rows are all label 1), and
NO deterministic row-selection rule was ever frozen for this calibration ministratum (Section (ii)'s
Slice-A list HAS a frozen deterministic rule; this ministratum does NOT). Materializing the 4 would
therefore require AUTHORING a NEW post-freeze selection rule -- methodology the pre-registration never
contained. WiCE is vendored and self-contained, so the WiCE-only set is materializable as frozen with
zero new selection decision.

WHY IT IS STILL CLEAN PRE-REGISTRATION: the amendment was made at a genuinely OPEN zero-grades window --
ZERO calibration verdicts and ZERO report grades exist at amendment time. No frozen NUMBER changes
(above). The decision was reached by a 5-lens advisory panel (pre-registration integrity, statistical
validity, planning fidelity, construct validity, pragmatic cost/reproducibility) that UNANIMOUSLY
converged on this resolution, and is maintainer-ratified. It is committed in its OWN timestamped commit
BEFORE any calibration spend -- the calibration-amendment timestamp of record. This mirrors the Slice-B
feasibility re-freeze discipline above (a resolved feasibility amendment at an open window, not optional
stopping or result tuning).

RELOCATED, not dropped (the two-source intent is preserved across the phase boundary): D-13's
"+ LLM-AggreFact" is NOT abandoned. The cross-dataset transfer signal is carried forward as a
pre-registered SEED for a future phase: a SEPARATE, NON-gating, DESCRIPTIVE-ONLY (NO threshold)
construct-transfer diagnostic with its OWN MCC, reported alongside but NEVER feeding the gate predicate,
with an OPEN-BOOK construct PREFERRED (ideally the Phase-20 live arm's real production positives, which
may make a gated LLM-AggreFact re-fetch unnecessary even then). It MUST be pre-registered as
descriptive-only so a future phase cannot quietly promote it into a soft gate. The WiCE-only gate shipped
by THIS phase is by feasibility, not by a methodology preference.

THE FROZEN UNDER-POWER CONDITIONAL (resolved pre-grade; the ONLY remedy; Option B EXCLUDED): IF the
informational pre-spend power probe (below) OR a mid-run read indicates the gate is near-bar
under-powered for the realized judge (point estimate >= `JUDGE_MCC_BAR.POINT` but the one-sided lower CI
straddling / near `JUDGE_MCC_BAR.LOWER_FLOOR`), the ONLY sanctioned remedy is to WIDEN the WiCE
calibration draw -- additional rows from the UNGATED `jon-tow/wice` at the pinned revision
`54f7976b8ce4fe0a9bfd35a4dd30af9d5b45d8a6`, SAME-distribution, selected by the SAME deterministic rule
shape the Slice-A list uses (stable-key ascending sort by uid, head-slice, NO hand-picking), PRESERVING
the supported/refuted balance and the subtle proportion, vendored so the set stays reproducible.
Importing LLM-AggreFact (or any out-of-distribution corpus) into the GATE is EXCLUDED. This conditional,
its trigger, and its selection rule are frozen HERE, before grading (a resolved pre-registered
conditional, not a discretionary mid-run decision = not optional stopping).

THE INFORMATIONAL POWER PROBE (NOT a gate; pre-registered here BEFORE running): a NO-SPEND synthetic
sensitivity sweep over the already-frozen `mccFromPairs` + `bcaBootstrapLowerCI` engine. Grid (frozen
here): true-MCC in {0.4, 0.5, 0.6, 0.7, 0.8, 0.9} x error-asymmetry FP:FN in {1:1, 2:1, 1:2, 3:1, 1:3},
class balance 26 unrefuted / 34 refuted, BCa seed pinned. For each cell, compute the gate result for
N=60 vs the four N=64 variants (the 4 hypothetical added items judged all-correct / all-wrong / 1-wrong
/ 2-wrong) and report (a) the band of true-MCC over which the gate agrees for N=60 and ALL FOUR N=64
variants, (b) the MINIMUM lower-CI margin to `JUDGE_MCC_BAR.LOWER_FLOOR` across the grid, and (c) the
breakeven true-MCC where they diverge. The probe is INFORMATIONAL ONLY -- it NEVER gates or authorizes
spend (the real gate runs on the real Stage-2 judge verdicts via `judgeCalibrationGate`). Its output is
LABELED "simulated within-construct power/pivotality -- real-judge behavior and WiCE->live transfer NOT
addressed" and must NEVER be cited as a real calibration result.

This amendment is committed in its OWN timestamped commit BEFORE any calibration verdict is captured or
graded. Provenance: maintainer-ratified 2026-06-23 on a unanimous 5-lens Opus advisory-panel convergence.

## AMENDMENT RECORD 3 -- forced judge-instrument replacement after the Opus 4.x gate DISQUALIFIED (2026-09-04)

WHAT CHANGED: the Stage-2 judge INSTRUMENT, and nothing else. The pre-registered judge was an Opus
4.x-generation Agent sub-agent; that generation is no longer addressable (the Agent tool accepts model
ALIASES, not pinned versions, so `model: opus` now resolves to Opus 5). The re-calibration therefore runs
on Opus 5. UNCHANGED: the 60 vendored WiCE items (byte-identical), the verdict-collapse map, the
calibration prompt (`eval/lz-eval-parity-calibration-prompt.md`, byte-identical), the frozen NUMBERS
(PARITY_BAR / JUDGE_MCC_BAR / SLICE_A_GATE / PARITY_K_RANGE), the `judgeCalibrationGate` predicate, the
Slice-A seed rule + feasibility gate, the two-layer parity bar, and the grading k. THE BAR IS NOT
LOWERED, and the anti-drift co-test passes (it pins `PARITY_BAR`, `JUDGE_MCC_BAR.POINT` /
`.LOWER_FLOOR` / `.ALPHA`, `SLICE_A_GATE` and `PARITY_K_RANGE`; `ALPHA` was added to its coverage by
this amendment).

"UNCHANGED" IS PINNED, NOT ASSERTED (matching AMENDMENT RECORD 2's sha256 discipline, which this
amendment initially failed to carry): the frozen calibration prompt
`eval/lz-eval-parity-calibration-prompt.md` is sha256
`cb3d567a7ac099099453834f06db89f84c7b063c0eda317fd541e707747247e6`, and the 60 vendored WiCE records
under `eval/__fixtures__/wice-vendored/records/` digest to
`2353066d70c5a4b421bc9294a620ac98f42cd3566ec705d524961c6da7e82e6b`
(`find ... -name '*.json' | sort | xargs sha256sum | sha256sum`). Both MUST be re-verified immediately
before the Opus 5 run; a mismatch means "unchanged" is false and the run does NOT start.

THE BCa KNOBS ARE PRE-REGISTERED HERE (they were previously code defaults only, which left the
lower-CI reproducible only by accident): `alpha = 0.05`, `resamples = 2000`, `seed = 'bca'`, as
implemented in `bcaBootstrapLowerCI` (`eval/lz-eval-mcc.mjs`). Measured jitter across plausible
alternative seed/resample choices spans lowerCI 0.2580-0.2843 -- immaterial at the realized 0.2722,
but decisive in exactly the near-bar band, which is why it is pinned before the run rather than after.

THE PRIOR RESULT STANDS IN THE RECORD (not discarded): the Opus 4.x calibration ran to completion over
all 60 items and FAILED -- `mcc=0.4889 lowerCI=0.2722 cleared=false n=60`. Per PAR-02 that was a
DISQUALIFIER and NO report was graded. Those 60 verdicts are preserved at
`eval/.cache/p22-baseline/calibration-opus4x/` -- but `eval/.cache/` is GITIGNORED, so that copy dies
with one `git clean -xdf`. The durable record is therefore COMMITTED at
`eval/lz-eval-parity-calibration-opus4x-record.md`: the gate result, the decomposition, and all 60
`{uid, verdict, gold, subtle, outcome}` rows (45 hit / 7 FP / 8 FN). "Published, not buried" means
reproducible from a fresh clone, not merely a headline number in prose.

THE PRE-COMMITTED STOPPING RULE (what makes this a forced replacement rather than a second roll of the
dice): this amendment authorizes EXACTLY ONE re-calibration, on the forced-replacement instrument, with
the prompt and the item set unchanged. If that single run yields `cleared === false`, the phase HALTS --
no third instrument, no prompt revision, no widening of the WiCE draw, no subgroup read. The remaining
construct question is then deferred to a NEW phase under its OWN fresh pre-registration. This rule is
frozen HERE, before the Opus 5 run.

WRITE-ONCE, AND WHEN THE ATTEMPT IS CONSUMED (this closes the hole that "one run" alone does not):
`pendingItems` treats any existing `<uid>.verdict.json` as DONE, so deleting a handful of verdict files
and re-dispatching those items is INDISTINGUISHABLE from a legitimate resume -- and because
`eval/.cache/` is gitignored, such a deletion would leave no trace at all. Therefore: a landed verdict
file is IMMUTABLE. Deleting or overwriting one is FORBIDDEN. Resumption may only ADD files for uids that
have none. **The single authorized attempt is CONSUMED WHEN THE FIRST VERDICT FILE LANDS**, not when the
run is declared finished -- so a run abandoned at item 12 has spent the attempt, and its 12 verdicts
stand as part of the one authorized set. If a verdict must be discarded as malformed (unparseable JSON,
out-of-enum), the uid and the reason MUST be recorded in the phase record before it is rewritten; a
silent redo is the exact move this clause exists to prevent.

THE SET MUST BE ONE INSTRUMENT: every verdict file carries a `model` pin, and `assembleGateInput` fails
closed if the 60 do not share ONE identical model string. A per-file pin proves each verdict names A
judge; it does not prove the set shares one, and an MCC over a set straddling two generations measures
nothing. The realized instrument string is recorded in the result artifact as the instrument of record.

CONDITIONAL C IS RETIRED FOR THIS PHASE, PROSPECTIVELY AS WELL AS RETROSPECTIVELY: the paragraph below
disposes of C for the 4.x numbers, but that leaves the Opus 5 case open -- a result at, say, mcc 0.52
with lowerCI 0.03 would CLEAR while sitting squarely on C's trigger shape, and a reader could argue the
widening either way. Resolving that after seeing the number is precisely the post-hoc choice
pre-registration exists to remove. So it is resolved NOW: **Conditional C is unavailable for the Opus 5
result, whatever its shape.** A near-bar clear is reported as a near-bar clear, with the lower CI stated
and the D-09 instrument-strength disclosure carried; the near-bar power question goes to the new phase
along with the construct question.

WHY RE-CALIBRATE AT ALL, GIVEN PAR-02's DEFAULT WAS STOP: because the DISQUALIFIER is a verdict about
the INSTRUMENT, not about the systems under comparison, and the instrument it disqualified no longer
exists. Accepting the halt would publish "no parity verdict" on the strength of a judge that cannot be
run again by anyone, including a replicator -- an unfalsifiable null. One replication on the only
addressable instrument, under an unchanged bar and a consumed-on-first-write cap, is the narrower claim.
If it also fails, the null is then reported on a judge a replicator CAN re-run, which is a materially
better result than the one available today.

HONEST THREAT TO VALIDITY -- THIS AMENDMENT IS WEAKER THAN AMENDMENT RECORD 2 AND MUST BE REPORTED AS
SUCH: AMENDMENT RECORD 2 was made at a genuinely OPEN window -- zero calibration verdicts existed, so no
result could have influenced it. This one is NOT. A failed gate is visible at amendment time, so that
defence is unavailable. What carries it instead is narrower, and `22-PARITY-RESULT.md` MUST state all
four points rather than argue them away: (a) the instrument change is FORCED, not chosen -- the
pre-registered judge cannot be invoked at all; (b) nothing is relaxed -- items, prompt, collapse map and
bar predicate are byte-identical; (c) the single-attempt stopping rule above caps the instruments at two,
pre-committed; (d) the 4.x failure is published, not buried. A reader may still discount the Opus 5
result on these grounds.

CONDITIONAL C IS NOT TRIGGERED (recorded so it cannot be invoked later): the frozen under-power
conditional above triggers on a point estimate >= `JUDGE_MCC_BAR.POINT` with the one-sided lower CI
straddling / near `JUDGE_MCC_BAR.LOWER_FLOOR`. The realized 4.x result is the OPPOSITE shape -- point
BELOW the bar (0.4889) with the lower CI at 0.2722, far ABOVE the floor. N=60 was therefore adequate to
establish the failure; this was NOT an under-powered near-miss. Widening the WiCE draw is NOT sanctioned
here, and Option B (importing LLM-AggreFact into the gate) remains EXCLUDED.

THE CLEAR-CUT SUBGROUP READ IS FORBIDDEN AS A PASS: a zero-spend diagnosis of the 60 stored 4.x verdicts
shows the pooled failure decomposes as -- clear-cut items (n=43) mcc=0.5045 with lowerCI=0.2804; subtle
items (n=17) mcc=0.0000 with tp=0 / fp=4 / tn=13 / fn=0. State the temptation at full strength rather
than understating it: the clear-cut subset does not merely clear the point bar, it satisfies the ENTIRE
predicate -- `cleared === true`. It MUST NOT be reported or used as a cleared gate. Selecting it after
seeing the pooled failure is post-hoc subgroup selection, which PAR-02's "NEVER relax the bar" forbids.
The operative ban: **NO subgroup figure -- this one or any other -- may authorize Stage-3 grading
spend.** The code already refuses the read independently: the clear-cut subset contains zero subtle
items, so `judgeCalibrationGate`'s D-13 shape check throws a `ContractError` demanding at least one
WiCE `partially_supported` subtle item. The figure is admissible ONLY as descriptive diagnosis, and the
same ban applies to any subgroup of the forthcoming Opus 5 set.

NOTED INSTRUMENT DEFECT -- DESCRIPTIVE ONLY, DEFERRED, DOES NOT ALTER THIS GATE: the same diagnosis shows
all 17 `partially_supported` subtle items collapse to gold `refuted`, so the subtle subset is
SINGLE-POLE -- tp and fn are zero by construction, and it can contribute false-positive risk with no
true-positive upside, systematically depressing any POOLED MCC. Whether the Stage-2 gate should instead
be specified per-subset, or the subtle subset re-drawn two-poled, is a CONSTRUCT question. It is recorded
here as a pre-registered SEED for a future phase (descriptive-only, NO threshold, exactly as the
LLM-AggreFact relocation above); a future phase MUST NOT quietly promote it into a soft gate. It does NOT
change the gate this phase runs.

REQUIRED BEFORE THE RUN (provenance fix): the 4.x verdict files record `{uid, verdict, reasoning}` only
-- no model pin -- so the disqualified instrument had to be identified from session context rather than
from the artifact itself. From this amendment forward the SESSION persists `{verdict, reasoning, model}`
per item (the harness never writes verdicts; it reads them), and `readVerdict` FAILS CLOSED on a missing
or empty `model` while `assembleGateInput` fails closed on a set spanning more than one -- mirroring the
D-15 fail-closed model pin the baseline-capture arm already enforces. The recorded string MUST be the
RESOLVED model id, never the alias and never the judge's self-report.

PROVENANCE ROUTE FOR THE PIN, PRE-REGISTERED BECAUSE IT IS IMPERFECT: the Agent tool exposes no
per-subagent `system`/init event, so the resolved id of an individual judge sub-agent is NOT directly
observable the way a headless `claude -p` capture's is (that arm reads it from the stream, which is why
D-15 could be strict there). The pin is therefore taken from the ORCHESTRATING session's own model
identity at dispatch time -- the generation the `opus` alias resolves to for this account in this
session -- and recorded as `claude-opus-5`. This is weaker than the capture arm's stream-read pin and
MUST be disclosed as such in the result artifact: it establishes the GENERATION, not a per-call
attestation. The single-instrument check in `assembleGateInput` then guarantees the whole set carries
that one string, and the write-once clause guarantees no verdict was produced under a different one and
relabelled. If a future runtime exposes a per-subagent resolved id, it supersedes this route.

TRANSPORT FIDELITY LIMIT ON TOOL ACCESS (recorded before the run, alongside the prompt file's existing
temperature caveat, because it is the same class of honest deviation): the frozen prompt specifies that
the judge sub-agent "has no file tools (read-only persona)". The Agent tool does not let a caller
restrict a spawned agent's tools -- tools come from the agent definition -- so the judge runs on a
general-purpose persona that DOES possess file tools. This matters because the WiCE gold labels are on
disk at `eval/__fixtures__/wice-vendored/records/<uid>.json`; a tool-using judge could in principle read
the held-back answer, which is precisely what the anti-leak presentation contract exists to prevent.
Two mitigations are applied and pre-registered here: (a) each dispatch carries an explicit, emphatic
instruction to use NO tools -- no file reads, no search -- and to answer solely from the supplied text;
and (b) the dispatch OMITS the uid, so the judge is not handed the key that locates its own gold record.
This is a mitigation, not a guarantee. It is a stated limit on the calibration's closed-book claim and
MUST be carried into the result artifact rather than left implicit; if a future runtime allows a
tool-restricted sub-agent, it supersedes this.

PROVENANCE: maintainer-directed 2026-09-04, selecting Option 3 from five options presented alongside the
zero-spend failure diagnosis. Reviewed pre-spend by an independent integrity reviewer, which returned
APPROVE-WITH-CHANGES and re-derived every figure above from disk; all ten of its edits are folded in --
the write-once clause, the prospective retirement of Conditional C, the single-instrument check, the
sha256 pins, the committed 4.x record, the sharpened subgroup ban, the BCa knobs, and the answer to "why
not simply accept the disqualification" -- none of which touched a bar, an item, or the prompt.
Committed BEFORE any Opus 5 calibration verdict is captured.

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
