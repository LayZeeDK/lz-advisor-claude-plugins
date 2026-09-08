---
seed_id: SEED-004
trigger_when: Phase 23 (the successor judge-calibration / parity phase) -- before freezing the judge output contract
planted_during: v2.1.0 Phase 22 close (measured-parity track halted at the Stage-2 gate)
planted_date: 2026-09-06
status: dormant
scope: small
area: eval-judge-output-contract
---

# SEED-004: The two-token verdict contract scores the token, not the argument

## Idea

Three of sixty Opus 5 calibration verdicts carry **reasoning that contradicts their own verdict token**.
`readVerdict` scores only the token, so the judge was measured on a word while its stated argument said
the opposite. Decide, in the successor phase's pre-registration, whether a two-token output contract is
adequate -- and what to do when the two halves disagree.

## Why This Matters

The affected items are `dev00016-1`, `dev00219-1`, `dev00429-0` -- **3/60, i.e. 5% of the calibration
set**, in a gate that missed its bar by 0.047 MCC. That proximity is the point: at this margin a
systematic 5% measurement artifact is not obviously ignorable.

It is *deliberately* not offered as an explanation for the failure, and this seed must not be used to
argue the Phase-22 set up or down. Phase 22 recorded it as descriptive, changed no verdict, and persisted
all three **verbatim** -- correctly, because each verdict is parseable and in-enum, so the write-once
clause does not permit discarding it. The defect is in the CONTRACT, which offers no way to detect or
adjudicate the disagreement.

The deeper issue is what "measured" means. A judge whose reasoning argues one way and whose token says the
other has not really been scored on its judgement. Whether the token or the argument is the better signal
is an open empirical question this repo has never tested.

## When to Surface

Phase 23, when the judge output contract is designed -- **before** any verdict is captured. A contract
change after verdicts land is uninterpretable.

## Candidate Directions (none pre-selected; all need pre-registration)

- Require the verdict token to be **derivable from** the reasoning, and add a mechanical consistency check
  that flags a mismatch at capture time rather than at post-hoc read time.
- Pre-register the disagreement policy explicitly: token wins / reasoning wins / item is excluded and
  reported. Whatever is chosen must be frozen up front -- picking after seeing which choice helps is
  result-shopping.
- Structured output (a schema with separate `verdict` and `rationale` fields plus a self-consistency
  assertion) rather than two free tokens.
- Measure it directly: re-score the three items both ways as a descriptive side-analysis in the successor
  phase, on ITS OWN pre-registered set -- never retro-fitted onto the Phase-22 numbers.

## Constraint

Whatever the successor phase adopts, the write-once discipline stays: a parseable, in-enum verdict is
immutable once landed. The fix belongs at **capture** time (contract + validation), never at scoring time.

## Breadcrumbs

- `eval/lz-eval-parity-calibration-harness.mjs` -- `readVerdict`, which scores the token only
- `eval/lz-eval-parity-calibration-prompt.md` -- the frozen two-token output contract (sha256-pinned
  `cb3d567a...`; do NOT edit it -- a successor phase authors its own)
- `eval/lz-eval-parity-calibration-opus5-record.md` -- run property 5, and the 60 per-item rows
- `.planning/phases/22-.../22-05-SUMMARY.md` -- the verbatim-persistence decision and its reasoning

## Scope Estimate

**Small** -- a contract plus a validation check and its co-test. The judgement call about the
disagreement policy is the part that needs care, not the code.
