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

- Revisit the collapse map: is `partially_supported -> refuted` right for a *subtle-overreach* probe, or
  should those items be held out / scored on a separate axis?
- Source genuine subtle-overreach items that populate BOTH poles, so the subset is two-sided.
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
