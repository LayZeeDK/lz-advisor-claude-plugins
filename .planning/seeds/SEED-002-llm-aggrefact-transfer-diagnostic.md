---
seed_id: SEED-002
trigger_when: Phase 23 (the successor judge-calibration / parity phase) -- pre-register its Stage-2 design
planted_during: v2.1.0 Phase 22 close (measured-parity track halted at the Stage-2 gate)
planted_date: 2026-09-06
status: dormant
scope: medium
area: eval-judge-calibration
---

# SEED-002: LLM-AggreFact open-book construct-transfer diagnostic (relocated from the Phase-22 gate)

## Idea

Carry D-13's "+ LLM-AggreFact" intent forward as a **separate, NON-gating, DESCRIPTIVE-ONLY**
construct-transfer diagnostic with its OWN MCC -- reported alongside the Stage-2 gate but NEVER feeding
the gate predicate. Open-book construct PREFERRED.

## Why This Matters

This is a **pre-registered relocation, not a deferral of convenience.** AMENDMENT RECORD 2
(`eval/lz-eval-parity-prereg.md`, 2026-06-23) materialized the Stage-2 calibration set as WiCE-only and
states in its own words that the LLM-AggreFact items are *"RELOCATED (NOT dropped) -- carried forward as a
pre-registered SEED for a future phase"*, preserving "the two-source intent ... across the phase
boundary". Not planting it would silently convert a documented relocation into an abandonment.

It also matters more now than when it was written. Phase 22's gate failed twice on WiCE alone (Opus 4.x
mcc=0.4889, Opus 5 mcc=0.4531, bar 0.5), and the open construct question is whether a WiCE-collapsed MCC
is the right instrument at all (see [[SEED-003]]). A cross-dataset transfer signal is exactly the evidence
that question needs -- so this seed is now diagnostic input to the successor phase's design, not an
optional extra.

## Why It Was Relocated (2026-06-23)

The 4 LLM-AggreFact items existed in the committed manifest only as PLACEHOLDER uids
(`llm-aggrefact-test-0000..0003`, source_label 1/1/0/0, `revision: PENDING_ENUMERATE_AT_EVAL_TIME`,
`files: []`, no corpus text, no uid->row mapping). The gated fetch itself SUCCEEDED at eval time
(authenticated; revision `981dfd0bd8e58e7238a9ab92b2e6ea44bce918e4`;
`data/test-00000-of-00001.parquet` sha256
`ba6976c3da990a9d7b11670efaf4e3c93c1bd0530061ec742afd6b2d5bce698c`, 29320 rows) -- but the placeholder
labels `[1,1,0,0]` map to NO recoverable rows (the first 4 test rows are all label 1), and **no
deterministic row-selection rule was ever frozen for this ministratum**. Materializing the 4 would have
required authoring a NEW post-freeze selection rule -- methodology the pre-registration never contained.
So the relocation was a feasibility call at a zero-grades window, not a methodology preference.

## When to Surface

Phase 23, at Stage-2 design time -- **before** any calibration verdict is captured.

## Constraints That Travel With It (binding, from AMENDMENT RECORD 2)

1. **Descriptive-only, and pre-registered as such.** It MUST be frozen as non-gating so a future phase
   "cannot quietly promote it into a soft gate". No threshold. Its own MCC, reported beside the gate.
2. **Never feeds the gate predicate.** Importing LLM-AggreFact (or any out-of-distribution corpus) INTO
   the gate was EXCLUDED in AMENDMENT RECORD 2 and re-excluded in 3. That exclusion survives this seed.
3. **Open-book construct preferred** -- ideally real production positives (the Phase-20 live arm's), which
   "may make a gated LLM-AggreFact re-fetch unnecessary even then".
4. **Freeze a deterministic row-selection rule first.** The absence of one is precisely why this could not
   be materialized in Phase 22. Use the Slice-A rule shape: stable-key ascending sort, head-slice, no
   hand-picking.
5. Licence: LLM-AggreFact is CC-BY-ND, **verbatim-only** -- fetch to the gitignored cache, never commit
   corpus text. (See [[project_phase18_eval_dataset_methodology]].)

## Breadcrumbs

- `eval/lz-eval-parity-prereg.md` -- AMENDMENT RECORD 2, and the "RELOCATED, not dropped" clause
- `eval/lz-eval-judge-calibration.mjs` -- `judgeCalibrationGate`, the gate this must NOT feed
- `eval/lz-eval-dataset.mjs` -- `fetchDataset` / `verifySha256`, the pinned-fetch path
- `.planning/phases/22-.../22-05-SUMMARY.md` -- the halt this diagnostic would help explain

## Scope Estimate

**Medium** -- one module plus a co-test is small, and there is no gate wiring by construction; what pushes
it to medium is the pre-registration language that must keep it permanently non-gating, plus freezing the
deterministic row-selection rule whose absence blocked it in Phase 22.
