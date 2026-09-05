---
seed_id: SEED-003
trigger_when: Phase 23 (the successor judge-calibration / parity phase) -- before freezing any Stage-2 calibration set
planted_during: v2.1.0 Phase 22 close (measured-parity track halted at the Stage-2 gate)
planted_date: 2026-09-06
status: dormant
scope: medium
area: eval-judge-calibration
---

# SEED-003: The subtle subset is single-pole by construction -- an instrument defect, not a judge failure

## Idea

All 17 WiCE `partially_supported` items collapse to gold `refuted` under the frozen collapse map. That
subset therefore has **zero true-positive upside by construction**: `tp` and `fn` are structurally zero,
so the subset can only ever depress a pooled MCC, never lift it. Decide, in the successor phase's own
pre-registration, whether a set with this property is the right Stage-2 instrument at all.

## Why This Matters

This is the **headline construct question** deferred out of Phase 22, and it is a property of the
MEASUREMENT INSTRUMENT rather than of any model under test.

The realized numbers make it concrete. From the Opus 4.x zero-spend decomposition:

```
ALL              n=60  tp=18 fp=7 tn=27 fn= 8  acc=0.750  mcc=0.4889
subtle only      n=17  tp= 0 fp=4 tn=13 fn= 0  acc=0.765  mcc=0.0000  <- SINGLE-POLE
clear-cut only   n=43  tp=18 fp=3 tn=14 fn= 8  acc=0.744  mcc=0.5045
```

`mcc=0.0000` on the subtle subset is not the judge scoring at chance -- it is MCC being **undefined and
conventionally returned as 0** when a whole class is absent. A 17-item block that can contribute at most
false positives is pulling a pooled statistic that the gate then reads as a judge-quality signal.

Two instruments failed this gate (0.4889 and 0.4531 against a 0.5 bar) under an unchanged bar, unchanged
items and an unchanged prompt. Before a third instrument is ever tried, the honest question is whether the
set is measuring what the gate claims to measure.

## The Trap This Seed Must NOT Become

**The clear-cut subset (n=43, mcc=0.5045) satisfies the ENTIRE gate predicate.** Selecting it after seeing
a pooled failure is textbook post-hoc subgroup selection and is forbidden by PAR-02's "NEVER relax the
bar" -- it was a `blocking` anti-pattern throughout Phase 22 and remains one.

The Opus 5 record deliberately contains **no subgroup MCC at all** -- not merely unreported, *not
computed* -- precisely so no number exists that could authorize Stage-3 spend. This seed exists to
re-examine the CONSTRUCT in a fresh pre-registration, **not** to license reading the favourable subgroup
out of the Phase-22 data. Any successor design must be frozen BEFORE it sees a score.

## When to Surface

Phase 23, at calibration-set design time -- **before** the set is frozen and before any verdict lands.

## Candidate Directions (none pre-selected; all need pre-registration)

> **NARROWED 2026-09-06 by the `/gsd-explore` research pass** -- the first direction below is REFUTED by
> primary sources; see "Research disposition" at the end of this file. The collapse map is the benchmark
> standard and must NOT be changed. The seed's arithmetic is untouched: under that standard collapse, a
> subtle probe drawn only from `partially_supported` is single-pole **by definition**, so the surviving
> fix is the two-poled draw, not a different map.

- ~~Revisit the collapse map: is `partially_supported -> refuted` right for a *subtle-overreach* probe, or
  should those items be held out / scored on a separate axis?~~ **REFUTED -- do not pursue as a remap.**
  (Holding them out onto a separate descriptive axis is still open; that is the third direction below.)
- Source genuine subtle-overreach items that populate BOTH poles, so the subset is two-sided.
  **<- the surviving primary direction.**
- Keep the subtle items but report them as a separate descriptive axis, never pooled into the gate MCC
  (mirrors the Slice-A "never pooled, per-direction" discipline already in this repo).
- Reconsider whether MCC over a collapsed binary is the right statistic for this comparison at all.

Note the constraint interaction: `judgeCalibrationGate` currently *requires* subtle count >= 1, and
AMENDMENT RECORD 2 leaned on WiCE's 17 subtle items to satisfy exactly that. Changing the treatment of
subtle items touches that predicate -- do it deliberately, in code and prose together, with the
anti-drift co-test updated in the same change.

## Breadcrumbs

- `eval/lz-eval-judge-calibration.mjs` -- `judgeCalibrationGate`, `goldFromWiceLabel`, `remapLabel`, and
  the subtle-count `ContractError`
- `eval/lz-eval-parity-prereg.md` -- Section (iii) collapse map; Section (iv) the MCC bar
- `eval/lz-eval-parity-calibration-opus4x-record.md` -- the decomposition quoted above
- `eval/lz-eval-parity-calibration-opus5-record.md` -- deliberately carries NO subgroup figure
- `eval/lz-eval-mcc.mjs` -- the degenerate-denominator return-0 convention that produces the 0.0000

## Scope Estimate

**Medium** -- this is a design question with a fresh pre-registration attached, not a code change. It is
the reason Phase 22's measured track needs a successor phase rather than a gap plan.

## Research disposition (added 2026-09-06, `/gsd-explore` -> Phase 23)

**ADMITTED -- the collapse map is the benchmark standard, not a defect.** WiCE's own authors binarize
exactly as this repo does: "To evaluate models trained on these datasets on WiCE, we consider a binary
classification task: SUPPORTED or not" -- `partially_supported` and `not_supported` both become negative
(https://ar5iv.labs.arxiv.org/html/2303.01432 section 3.1). LLM-AggreFact does the same: "we map
supported, fully attributable, completely support, and complete to supported, and unsupported otherwise"
(https://arxiv.org/html/2404.10774v2 App. C.2), giving a WiCE split that is 67-69% negative. Changing the
collapse would move this repo OFF the standard, not onto it.

**ADMITTED -- WiCE is not unusually hard, so "the task ceiling" does not explain the miss.** Mean balanced
accuracy across 39 leaderboard models ranks WiCE 6th-hardest of 11 subsets -- mid-pack
(https://llm-aggrefact.github.io/). At the realized 26/34 balance, MCC 0.50 corresponds to ~75.2% balanced
accuracy, inside the Claude-3-Opus (75.0) to Claude-3.5-Sonnet (77.7) band on the WiCE column. There is
headroom above the bar.

**THE SEED'S PREMISE IS NARROWED BY A LARGER FINDING.** This seed reads the pooled 0.4889 as having been
"depressed" by the 17-item single-pole block. The published decomposition puts that effect at ~0.016 MCC
(pooled 0.4889 vs clear-cut 0.5045). An in-session simulation (200k draws, n=60, the realized 26/34
balance, symmetric per-class error) found that a judge whose TRUE MCC is exactly 0.50 lands below the bar
on **47.1%** of draws, with a 95% sampling interval of **[0.2843, 0.7277]** -- and that raising n does NOT
reduce the false-fail rate, because the median stays on the bar. So the dominant defect is that **the gate
was unmeasurable at n=60**, not that the subtle block dragged it down. The single-pole property is real
and still worth fixing; it is not the reason two instruments "failed."

**Design consequence for Phase 23:** fixing the subtle draw alone would not have rescued the gate. If a
calibration gate is used at all, it must gate on a **lower-bound CI** (the prereg's second condition, which
both instruments PASSED) rather than a point estimate. Note separately that the whole calibrate-then-grade
inference is independently defeated by construct transfer (short-claim AUROC 0.90 -> long-form 0.53,
https://arxiv.org/html/2606.23915), which is why the Phase-23 ENV-* design does not depend on a judge at
all. See `.planning/notes/phase-22-diagnosis-two-root-causes.md`.

**Still forbidden, unchanged:** none of the above licenses reading the favourable clear-cut subgroup out of
the Phase-22 data. Any successor design is frozen BEFORE it sees a score.
