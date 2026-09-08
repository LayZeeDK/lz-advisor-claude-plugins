---
phase: 21-live-web-open-book-over-refusal-gold-and-arm-b-re-run
plan: 03
subsystem: testing
tags: [eval, open-book-gold, oof-adjudication, frozen-oof-pair, averitec-binary, residue-routing, lz-sample-cap, lz-spend-gate, no-spend, node-test, zero-dep, gitignored]

# Dependency graph
requires:
  - phase: 21-live-web-open-book-over-refusal-gold-and-arm-b-re-run
    plan: 01
    provides: "openbook-lib.mjs -- mapAveritecToBinary (4-way -> frozen binary), cohenKappa, evidenceJaccard (D-06/D-08 reported-only diagnostics)"
  - phase: 21-live-web-open-book-over-refusal-gold-and-arm-b-re-run
    plan: 02
    provides: "openbook-evidence.json SHAPE contract -- the uid-keyed sorted-key OBJECT { uid, claim, evidence:[{url,quote,excerpt_id,fetched_at,sentence}], retrieval_gap } the gold driver consumes BY UID"
  - phase: 20-orchestrator-skill-headless-scale-confirmation
    provides: "FROZEN seams consumed byte-identical: FROZEN_OOF_PAIR / makeCopilotCallModel / requireSpend / classifyAdjudicationResidue (lz-eval-live-cert.mjs); adjudicateNativeRefutedGold expectedEntailment:'true' (lz-eval-armA-native.mjs); EXCERPT_CHAR_CAP (lz-eval-evidence-join.mjs); COPILOT_CMD / makeWinRunner / buildCreditsRecord / isCliEntry (oof-transport-lib.mjs); the armB-oof-gold.mjs structure mirrored; LZ_SAMPLE cap pattern from armA-retest.mjs"
provides:
  - "openbook-oof-gold.mjs: the NO-SPEND open-book OOF gold driver -- loadOpenbookEvidence (fail-closed uid-keyed-object reader, uid-sorted), selectCandidates (the LZ_SAMPLE cap applied BEFORE dispatch), recordToCandidate (snapshot -> {uid,claim,evidence:[{sentence}]} via the frozen join shape), buildOpenbookResult PURE (two-field groundedness+validity record, AVeriTeC-4-way->binary, oof_per_model, kappa, evidence_jaccard, residue routing), LZ_SPEND-gated + isCliEntry-guarded main with the LZ_SAMPLE cap"
  - "FILE-form, mutation-verified node:test suite (13/13 green) over tmp snapshot fixtures + stub callModel"
affects: [21-04, 21-05, openbook-rescore]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Mirror the p20 armB-oof-gold.mjs driver structure (buildArmBResult pure + LZ_SPEND-gated main + isCliEntry guard, expectedEntailment 'true'); swap ONLY the evidence source (voter packets -> the logged open-book snapshot)"
    - "Consume the Plan 02 openbook-evidence.json BY UID as a uid-keyed sorted-key OBJECT; fail closed on an array / non-object container (the producer/consumer shape contract)"
    - "The LZ_SAMPLE control-count cap (parseInt(process.env.LZ_SAMPLE); default all 30) applied in selectCandidates BEFORE any callModel construction / dispatch -- so the Plan 05 1-2 item pre-flight spike is bounded BY CONSTRUCTION (the HALT+RAISE cost guard is enforceable; mirrors armA-retest.mjs)"
    - "TWO-FIELD gold record: a groundedness field (logged urls + quotes + fetched_at + excerpt_ids) separated from a validity field (averitec_label + binary via mapAveritecToBinary + oof_per_model); kappa + evidence_jaccard reported SEPARATELY, never gated (D-06/D-08)"
    - "OOF non-unanimity -> RESIDUE: the AVeriTeC label 'conflicting' -> mapAveritecToBinary -> RESIDUE -> the control is EXCLUDED from the binary denominator + recorded for human routing (Guerdan), NEVER coerced into SUPPORTED/NOT-SUPPORTED (D-08)"

key-files:
  created:
    - "eval/.cache/p21-live/openbook-oof-gold.mjs (gitignored)"
    - "eval/.cache/p21-live/openbook-oof-gold.test.mjs (gitignored)"
  modified: []

key-decisions:
  - "averitecLabelFor maps a CONFIRMED control (OOF pair all-agree DOES entail) -> 'supported', an OOF SPLIT -> 'conflicting' (-> RESIDUE), and a not-confirmed (all-agree does-NOT-entail) -> 'refuted' (the voter's refute would have been CORRECT). mapAveritecToBinary then collapses to SUPPORTED / RESIDUE / NOT-SUPPORTED -- so the SUPPORTS-vs-NEI boundary where the over-refusals live is representable + a split is never coerced into the binary."
  - "recordToCandidate reads the snapshot's per-evidence `sentence` (Plan 02 already packaged it through joinClusterEvidence/EXCERPT_CHAR_CAP) into the [{sentence}] enrichedKs shape, re-applying EXCERPT_CHAR_CAP defensively + de-duping + dropping empties -- NEVER a URL (the join's contract). The snapshot is the shape-parity bridge, so the driver does not re-run joinClusterEvidence over a run dir."
  - "main() scopes the groundedness map to the SELECTED (LZ_SAMPLE-capped) controls so the gold record covers exactly the adjudicated set -- the cap bounds both the dispatch AND the record by construction."
  - "evidence_jaccard is computed per-uid over the logged URL set and averaged (a single aggregate diagnostic); it is a reported D-08 datum, never a gate. kappa is cohenKappa over the two per-model OOF label series."

patterns-established:
  - "Pattern 1: the snapshot SHAPE is the cross-plan contract -- Plan 02 freezes the uid-keyed sorted-key object, Plan 03 reads it BY UID + fails closed on a wrong container; neither re-derives the other's evidence join."
  - "Pattern 2: the metered spend boundary stays requireSpend('callOof') INSIDE the frozen makeCopilotCallModel -- the driver only WIRES the real winRunner behind isCliEntry; importing the driver OR running the test (injected stub callModel) triggers ZERO spend, proven by a spawn-watching import probe."

requirements-completed: [OBG-04, OBG-08, OBG-09]

# Metrics
duration: 45min
completed: 2026-06-22
---

# Phase 21 Plan 03: Open-book OOF gold driver (no-spend build) Summary

**The NO-SPEND open-book over-refusal OOF gold driver (`openbook-oof-gold.mjs`): it feeds the FROZEN open-book evidence snapshot (Plan 02 uid-keyed object) through the frozen `joinClusterEvidence` packaging into the FROZEN OOF all-agree pair (gpt-5.5 + gemini-3.1-pro-preview, `expectedEntailment:'true'`) for gold-blind JUDGMENT ONLY, produces the TWO-FIELD gold record (groundedness + validity; AVeriTeC-4-way mapped to the frozen binary; per-model labels + kappa + Jaccard), routes OOF non-unanimity to RESIDUE (Guerdan), honors an `LZ_SAMPLE` cap applied BEFORE dispatch, and keeps the metered dispatch hard-gated behind `LZ_SPEND` + `isCliEntry` -- FILE-form test-locked at 13/13 with mutation-verified discrimination on the residue routing, the cap, and the snapshot shape, and an empirically proven zero-spend-on-import.**

## Performance

- **Duration:** ~45 min
- **Completed:** 2026-06-22
- **Tasks:** 1 (TDD: test RED -> impl GREEN)
- **Files modified:** 2 created (both gitignored under eval/.cache/p21-live/)

## Accomplishments

- `openbook-oof-gold.mjs` exports the four units the open-book gold pipeline needs, mirroring the frozen armB gold driver with ONLY the evidence source swapped:
  - `loadOpenbookEvidence(path)` -- reads the Plan 02 `openbook-evidence.json` as the PINNED uid-keyed sorted-key OBJECT and returns the per-uid records in deterministic uid-sorted order (`Object.keys(...).sort()`); a non-object / ARRAY container FAILS CLOSED (the producer/consumer shape contract is enforced).
  - `selectCandidates(records, sample)` -- caps the candidate list to the first `sample` controls (uid-sorted, stable) when an LZ_SAMPLE cap is provided, else returns all; the cap is applied BEFORE any callModel construction / before any dispatch, so the Plan 05 pre-flight spike is bounded BY CONSTRUCTION.
  - `recordToCandidate(record)` -- packages a snapshot record into `{ uid, claim, evidence:[{sentence}] }` (the OOF probe's enrichedKs shape), reading the snapshot's joined `sentence` per evidence item, re-applying `EXCERPT_CHAR_CAP`, de-duping, dropping empties -- NEVER a URL.
  - `buildOpenbookResult({ runDir, openbookEvidence, result })` -- PURE; produces the TWO-FIELD gold record: a `groundedness` field (logged urls + quotes + fetched_at + excerpt_ids) and a `validity` field (`averitec_label`, `binary` via `mapAveritecToBinary`, `oof_per_model:{gpt-5.5, gemini-3.1-pro-preview}`) per uid, plus `nConfirmed` (the SUPPORTED count = the over-refusal denominator), `nResidue`, `confirmed_uids[]`, `residue[]` (each with reason), `kappa`, and `evidence_jaccard` (reported, never gated).
- The OOF judges gold-blind over the OPEN-BOOK evidence, `expectedEntailment:'true'` (retain = the FROZEN pair all-agree the open-book evidence supports the SUPPORTED claim); OOF non-unanimity -> RESIDUE -> the control is EXCLUDED from the binary denominator (`averitec_label` 'conflicting' -> `mapAveritecToBinary` -> RESIDUE) + recorded for human routing, NEVER coerced (D-08).
- `main()` is reached ONLY via `isCliEntry`; it reads `LZ_SAMPLE` (caps the candidate set BEFORE dispatch), constructs the `FROZEN_OOF_PAIR` callModels via `makeCopilotCallModel` + the real `makeWinRunner` (the metered path), runs `adjudicateNativeRefutedGold` with `expectedEntailment:'true'` over a resumable `cacheDir` (`oof-verdicts-openbook`) + `seed:'p21-openbook-oof-gold'`, and writes `openbook-gold-result.json` + an honest credits record. This path is NOT exercised by the test.
- The FILE-form `node:test` suite passes 13/13 (`node --test eval/.cache/p21-live/openbook-oof-gold.test.mjs` exit 0) and is empirically proven discriminating (D-13) on THREE load-bearing fronts:
  - residue coercion (make a split -> 'supported') -> 2 RED (the MUTATION CHECK + the two-field shape test);
  - remove the LZ_SAMPLE cap (selectCandidates always returns all) -> 2 RED (both cap tests, including the cap-bounds-dispatch test);
  - accept an array container (drop the `Array.isArray` rejection) -> 1 RED (the FAILS CLOSED shape test).
  All restored GREEN.
- ZERO spend at import + test: the injected stub callModel runs `adjudicateNativeRefutedGold` with NO Copilot subprocess; a spawn-watching import probe confirmed `spawned_on_import = 0`, no result file written, `LZ_SPEND` unset, and all six expected exports present. `requireSpend('callOof')` throws when `LZ_SPEND` is unset (asserted).
- Frozen seams byte-identical: empty `git diff` on `lz-eval-live-cert.mjs` / `lz-eval-armA-native.mjs` / `lz-eval-evidence-join.mjs`; the gitignored `oof-transport-lib.mjs` + `openbook-lib.mjs` untouched. Both p21-03 files strictly ASCII, no BOM.
- No regression across the sibling p21-live suites: openbook-lib 19/19, openbook-rescore 16/16, openbook-retrieval-log 11/11, openbook-oof-gold 13/13.

## Task Commits

This plan's deliverables live under gitignored `eval/.cache/p21-live/` (the Phase-20 / Plan 21-01/02 live-cert pattern), so there are NO per-task tracked commits -- the two scripts persist on the working tree on disk and are intentionally NOT committed (the sequential-execution contract). The only tracked artifact for this plan is this SUMMARY (plus STATE.md + ROADMAP.md).

1. **Task 1: openbook-oof-gold.mjs + .test.mjs** - TDD (test RED -> impl GREEN); gitignored, not committed. 13/13 FILE-form green; mutation-verified discriminating on the residue routing (2 RED), the LZ_SAMPLE cap (2 RED), and the snapshot shape (1 RED). Zero-spend-on-import proven by a spawn-watching probe.

**Plan metadata:** the docs commit captures this SUMMARY + STATE.md + ROADMAP.md.

## Files Created/Modified

- `eval/.cache/p21-live/openbook-oof-gold.mjs` (gitignored) - the open-book OOF gold driver (no-spend build): `loadOpenbookEvidence` + `selectCandidates` + `recordToCandidate` + `buildOpenbookResult` (pure, exported) + an `LZ_SPEND`-gated, `isCliEntry`-guarded, `LZ_SAMPLE`-capped `main`. Imports `makeCopilotCallModel`/`FROZEN_OOF_PAIR`/`requireSpend`/`classifyAdjudicationResidue` (lz-eval-live-cert.mjs), `adjudicateNativeRefutedGold` (lz-eval-armA-native.mjs), `EXCERPT_CHAR_CAP` (lz-eval-evidence-join.mjs), `mapAveritecToBinary`/`cohenKappa`/`evidenceJaccard` (openbook-lib.mjs), `COPILOT_CMD`/`makeWinRunner`/`buildCreditsRecord`/`isCliEntry` (oof-transport-lib.mjs). ASCII-only, no BOM, zero-dep node stdlib + frozen seams.
- `eval/.cache/p21-live/openbook-oof-gold.test.mjs` (gitignored) - 13 FILE-form discriminating tests over tmp snapshot fixtures + a gold-blind semantic OOF stub: uid-sorted-object load + fail-closed-on-array, LZ_SAMPLE cap + cap-bounds-dispatch, recordToCandidate shape + cap, FROZEN_OOF_PAIR identity, confirm-only-all-agree-entail + ZERO spend, split-to-RESIDUE, two-field record shape, MUTATION CHECK (coerce-split-fails), requireSpend guard, isCliEntry no-write-on-import, ASCII/no-BOM.

## Decisions Made

- **AVeriTeC-4-way disposition mapping (`averitecLabelFor`):** CONFIRMED (OOF all-agree DOES entail) -> 'supported'; OOF SPLIT -> 'conflicting' (-> RESIDUE via the Plan-01 `mapAveritecToBinary`); not-confirmed (all-agree does-NOT-entail) -> 'refuted'. This keeps the SUPPORTS-vs-NEI boundary (where the over-refusals live) representable and routes a split to RESIDUE without ever coercing it into the binary.
- **The snapshot is the shape-parity bridge:** because Plan 02 already packaged each evidence item's joined `sentence` through `joinClusterEvidence`/`EXCERPT_CHAR_CAP`, the gold driver reads that `sentence` directly into the OOF candidate (re-applying the cap defensively) rather than re-running the join over a run dir. The driver therefore consumes `openbook-evidence.json` BY UID and builds NO filesystem path from a content-derived uid (so `safeId` is correctly not needed here -- the snapshot uids were already safeId-normalized by Plan 02).
- **main() scopes groundedness to the SELECTED set:** the LZ_SAMPLE cap bounds both the dispatched candidates AND the per-uid groundedness map, so the gold record covers exactly the adjudicated controls -- the pre-flight spike is bounded by construction on both surfaces.

## Deviations from Plan

None - plan executed exactly as written. The driver mirrors the frozen armB gold structure with the open-book evidence source, consumes the Plan 02 uid-keyed snapshot, honors the LZ_SAMPLE cap before dispatch, produces the two-field gold record, routes non-unanimity to RESIDUE, and is fully no-spend at import/test (LZ_SPEND-gated, isCliEntry-guarded, stub-injected test).

## Issues Encountered

- The zero-spend-on-import probe initially mis-resolved the relative import when written to the OS temp dir (the module's `EVIDENCE_PATH`/`RESULT` constants are relative to cwd). Resolved by placing the probe INSIDE the repo (a dotfile) and running it with cwd at the repo root, then deleting it -- no tracked artifact. The probe confirmed `spawned_on_import = 0` and no result write.

## Known Stubs

None. The driver is a complete deterministic no-spend build. `openbook-evidence.json` is produced by Plan 04's session retrieval (the intended cross-plan boundary, not a stub) and `openbook-gold-result.json` is produced by the Plan 05 metered OOF run -- both are downstream-by-design; `main()` is `isCliEntry`-guarded so importing the driver (the only thing this plan exercises) reads neither. The OOF judge is injected (a stub in the test, the frozen Copilot transport in Plan 05) -- the metered path is wired but deliberately not run here.

## User Setup Required

None - no external service configuration required (this plan is a pure no-spend deterministic build + tests). The metered OOF spend is the human-authorized Plan 05.

## Next Phase Readiness

- The open-book OOF gold driver is built no-spend and test-locked BEFORE any retrieval or metered spend, as the construct-fix discipline (D-10/D-13) requires.
- The metered dispatch is fully gated (LZ_SPEND + isCliEntry) and the LZ_SAMPLE cap bounds the Plan 05 1-2 item pre-flight spike BY CONSTRUCTION (the HALT+RAISE cost guard is enforceable) -- exactly the seam Plan 05 will run under `LZ_SAMPLE=1 LZ_SPEND=1`.
- The two-field gold record shape (`groundedness` + `validity` keyed by uid; `validity[uid].binary` is SUPPORTED / NOT-SUPPORTED / RESIDUE) is the contract `openbook-rescore.mjs` (Plan 01) already consumes via `readGoldValidity` -- the producer/consumer join is exact.
- No blockers. Frozen seams verified byte-identical; the eval tree never ships; zero new deps.

## Self-Check: PASSED

- Both gitignored scripts present on disk + this SUMMARY present (3/3 FOUND): `openbook-oof-gold.mjs`, `openbook-oof-gold.test.mjs`, `21-03-SUMMARY.md`.
- FILE-form suite green: 13/13 (`node --test eval/.cache/p21-live/openbook-oof-gold.test.mjs` exit 0).
- Mutation discrimination demonstrated on all three fronts: residue coercion -> 2 RED; no LZ_SAMPLE cap -> 2 RED; accept array container -> 1 RED; all restored GREEN.
- Zero-spend-on-import proven: spawn-watching probe reported `spawned_on_import = 0`, no result file written, `LZ_SPEND` unset; `requireSpend('callOof')` asserted to throw when `LZ_SPEND` unset.
- Frozen tracked seams `lz-eval-live-cert.mjs` / `lz-eval-armA-native.mjs` / `lz-eval-evidence-join.mjs` byte-identical (empty git diff); imported gitignored seams untouched.
- Both p21-03 files strictly ASCII, no BOM. No tracked code commit for the scripts (gitignored, intended); this SUMMARY is the tracked artifact.

---
*Phase: 21-live-web-open-book-over-refusal-gold-and-arm-b-re-run*
*Completed: 2026-06-22*
