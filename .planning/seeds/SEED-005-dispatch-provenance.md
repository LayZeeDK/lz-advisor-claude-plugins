---
seed_id: SEED-005
trigger_when: Phase 23 (the successor judge-calibration / parity phase) -- before the first metered dispatch of any run
planted_during: v2.1.0 Phase 22 close (measured-parity track halted at the Stage-2 gate)
planted_date: 2026-09-06
status: dormant
scope: small
area: eval-harness-provenance
---

# SEED-005: The harness records no copy of the string actually sent to each judge

## Idea

Make the harness **persist the exact dispatched string per item**, at dispatch time, as a first-class run
artifact. Without it, "what the instrument actually was" is unrecoverable after the fact.

## Why This Matters

This is the **weakest link in the entire Phase-22 record**, by the record's own assessment.

AMENDMENT RECORD 3 requires the payload INLINED in the agent prompt and forbids the judge reading the
dispatch file (both anti-leak measures). That contract forced the orchestrating session to
**hand-transcribe ~520 KB of evidence across 60 dispatches**. Transcription drift would silently alter the
instrument -- and nothing would show it.

An independent check WAS written (`eval/.cache/p22-baseline/verify-transcription.mjs`) and run over all 63
task transcript files. It came back **INCONCLUSIVE, not passing**: it recovered ZERO payloads, because 62
of the 63 transcript files are 0 bytes and the transport retains no readable copy of the outbound prompt.
So transcription fidelity is an **UNVERIFIED assumption** of the 2026-09-05 run, reported as such rather
than upgraded to a pass.

The consequence reaches further than transcription. The mechanical anti-leak guards
(`UID_PATTERN`, `GOLD_MARKERS`, unsubstituted-placeholder detection) scan the **materialized
`item-NN.txt` files** -- not what each judge actually received. The security audit records this as flag
F5 against T-22-05a: the guards are real and they passed, but they attest to the artifact on disk, not to
the wire.

Mitigation applied at the time was partial and worth keeping: the 60 items share only 29 unique evidence
documents, each read immediately before dispatch and reused verbatim within its group. That reduces
exposure; it does not close it.

## When to Surface

Phase 23, **before verdict #1** of any metered run. Retrofitting provenance after a one-shot,
write-once run is impossible by construction -- this has to be in place first.

## Candidate Directions (none pre-selected)

- Harness writes `dispatch/<uid>.sent.txt` (or a sha256 of the exact string) at the moment of dispatch,
  alongside the verdict file, as part of the same write-once discipline.
- Assert at score time that every verdict has a matching dispatch record, and that the record's sha256
  matches the materialized item -- a fail-closed check, not an advisory one.
- Prefer a transport that carries the payload without hand-transcription, if one exists that still
  satisfies the anti-leak contract. If it does not, say so explicitly in the pre-registration rather than
  leaving the tension implicit.
- Note the interaction with [[SEED-004]]: a dispatch record plus a structured verdict makes the whole
  instrument reconstructible, which is what a replicator actually needs.

## Related Defect in the Same Area

`eval/lz-eval-parity-calibration-dispatch.mjs:54-57` builds dispatch text with
`String.prototype.replace`, so `$&`, `` $` ``, `$'` and `$$` in dataset content are interpreted rather
than inserted literally (escalated as proposed **T-22-15** in `22-SECURITY.md`). Measured: 27 of 60
records contain a `$`, **0 contain a hazardous sequence**, so the 2026-09-05 run was not corrupted. Traced
failure mode is a silently mangled instrument, not an answer leak -- a `` $` `` in the evidence injects
preceding prompt text carrying no uid and no gold marker, so neither existing guard fires. One-line fix
per call site (a replacer function: `.replace(needle, () => value)`). It belongs with this seed because
both are "the string that reached the judge is not the string we think it was".

## Breadcrumbs

- `eval/lz-eval-parity-calibration-dispatch.mjs` -- `renderDispatch`, the guards, and the T-22-15 defect
- `eval/lz-eval-parity-calibration-harness.mjs` -- the per-item dispatch/verdict lifecycle
- `eval/lz-eval-parity-calibration-opus5-record.md` -- run property 6 (the INCONCLUSIVE check)
- `.planning/phases/22-.../22-SECURITY.md` -- flag F5, and the escalated T-22-15
- `eval/lz-eval-parity-prereg.md` -- AMENDMENT RECORD 3's inline-payload / no-file-reads contract, the
  constraint that created the problem

## Scope Estimate

**Small** -- persistence plus a fail-closed cross-check and its co-test. High value per line: it converts
the run's single unverifiable assumption into a checkable one.
