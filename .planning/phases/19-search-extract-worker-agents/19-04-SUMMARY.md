---
phase: 19-search-extract-worker-agents
plan: 04
subsystem: testing
tags: [eval, ks-enrichment, url-date-extraction, two-strata, buried, evidence-absent, voter-dispatch, workflow, scoring-reconciliation, no-abstention, haiku-vs-sonnet, gating-read, node-test, resumable, pre-registration]

# Dependency graph
requires:
  - phase: 19-01
    provides: "the search-and-stop spine (searchAndStop, staticKsAdapter, dateFilter, parseAvtDate, safeParse, SEARCH_DEFAULTS) -- FROZEN, consumed not rewritten"
  - phase: 19-03
    provides: "the trap recipe machinery (mutateOverreach, classifySeed, validityGate, writeTrap, loadDevSeedsAndKs, BURIED_RANK_FLOOR) + the re-registered lock rule + manifest"
  - phase: 18-03
    provides: "the frozen off-model engine (countFalseUpholds, delta, clopperPearsonUpper, passAtK, passHatK, lockRuleVerdict, EVAL_THRESHOLDS)"
  - phase: 19-04 (Task 1, prior commit)
    provides: "the offline-read decision driver (calibratorGate, readDelta, resolveOutcome, persistVote, votePath, STOP_REASONS) -- already built, consumed not rebuilt"
provides:
  - "eval/lz-eval-trap-assembler.mjs -- the net-new KS-ENRICHMENT layer (extractUrlDate, normalizeClaimDate, enrichKsForClaim, URL_DATE_RULE) + the 2-strata Stage-1 assembler (assembleStage1Traps; buried + evidence-absent; strict cutoff; >=5-survivor + >=3/stratum floors; validityGate + blind content-grounding probe; writeTrap cache-only)"
  - "eval/lz-eval-trap-assembler.test.mjs -- FILE-form deterministic coverage (21 discriminating tests, no network / no model calls)"
  - "eval/lz-eval-voter-dispatch.workflow.mjs -- the net-new D-08 dynamic Workflow (parameterized seat, scoring reconciliation, no-abstention re-cast, skip-already-done, k>=MIN_K floor, pace-able; orchestrator-owns-persistence)"
  - "eval/lz-eval-voter-dispatch.workflow.harness.test.mjs -- FILE-form harness-slice test (16 tests; scoring reconciliation / no-abstention / skip-already-done / k-floor / trace shape / readDelta resumability)"
  - "eval/__fixtures__/lz-eval-manifest.json + eval/lz-eval-lock-rule.md -- pre-registered (zero-votes window): 2 offline strata, byte-locked URL_DATE_RULE, scoring reconciliation, no-abstention, >=5-survivor, strict-cutoff/no-date-shift; date-sensitive example rows removed + stratum-def deferred"
affects: [phase-19-04-task-4-calibrator, phase-19-05-stage2-haiku, phase-20-orchestrator, phase-20-shadow-canary, voter-tier-default]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Assembly-layer enrichment over FROZEN primitives: extractUrlDate/normalizeClaimDate/enrichKsForClaim IMPORT + COMPOSE parseAvtDate/safeParse/dateFilter/staticKsAdapter/searchAndStop and the built recipe machinery -- never rewrite them (the single-digit-day fix is a NEW normalizer, the parser stays frozen)"
    - "doc.date is the DD-MM-YYYY STRING (not a Date object) so the frozen safeParse/dateFilter consume it -- a Date object would be String-coerced and silently dropped"
    - "Dynamic Workflow structured per lz-review-gate.workflow.mjs: export const meta + marker-delimited SHARED control-logic block + injected agent()/log()/pipeline() globals (no static/dynamic import); the harness slices the marker block to unit-test the real helpers and wraps the body in an async IIFE with MOCK globals"
    - "SCORING RECONCILIATION: the scored quantity is the MODEL voter free-text verdict; searchAndStop's mechanical flag-enum is trace + minimums only (harness-test-guarded)"
    - "NO-ABSTENTION re-cast: a null/abstain vote is not persisted and is re-cast until a definite verdict lands (persistVote rejects non-{unrefuted,refuted}); skip-already-done makes the run resumable + pace-able"

key-files:
  created:
    - "eval/lz-eval-trap-assembler.mjs"
    - "eval/lz-eval-trap-assembler.test.mjs"
    - "eval/lz-eval-voter-dispatch.workflow.mjs"
    - "eval/lz-eval-voter-dispatch.workflow.harness.test.mjs"
  modified:
    - "eval/__fixtures__/lz-eval-manifest.json"
    - "eval/lz-eval-lock-rule.md"
    - "eval/lz-eval-aggregate.test.mjs"
    - "eval/lz-eval-dataset.test.mjs"

key-decisions:
  - "doc.date is attached as a DD-MM-YYYY STRING (via toDocDateString) so the FROZEN dateFilter/safeParse can consume it -- extractUrlDate still returns a Date for direct testing, but the enriched doc field is the string the spine reads (Rule 3 blocking-issue fix discovered during Task 1)"
  - "The buried/evidence-absent split is decided deterministically by the deepest strictly-pre-cutoff surviving doc index (>= BURIED_RANK_FLOOR=20 -> buried), then re-enriched WITH the disconfirmer/decisive flags at that rank, and classifySeed is asserted to agree (fail closed on a mismatch)"
  - "The no-import structural assertion in the Task-2 harness is scoped to comment-stripped CODE so the header comment that DOCUMENTS the no-import constraint (it literally writes 'dynamic import()') does not false-trip the regex"
  - "EVAL_THRESHOLDS numbers are byte-UNCHANGED; the re-plan touches the manifest + lock rule only as pre-registration in the zero-votes window"

patterns-established:
  - "Pre-registration anti-drift: the manifest's byte-locked URL_DATE_RULE string == the assembler RegExp .source (aggregate.test asserts it); a drifted rule cannot silently re-populate the strata after the zero-votes window"
  - "Fail-closed floors: a seed with <5 strictly-pre-cutoff survivors is excluded; a stratum with <3 distinct claims throws -- so min-not-met cannot silently change the trap and nPooled >= reliableTrials=15 at k=5"

requirements-completed: [EVAL-01, EVAL-02, EVAL-04]

# Metrics
duration: ~45min (Tasks 1-3; Task 4 calibrator NOT run -- blocking human checkpoint)
completed: 2026-06-17
---

# Phase 19 Plan 04: Offline gating-read Stage-1 instrument (KS-enrichment + 2-strata assembler + D-08 voter-dispatch Workflow) Summary

**The construct-validity-corrected Stage-1 instrument: a KS-enrichment layer that attaches real dates (byte-locked strict path-only URL rule, archive-inner, fail-closed) + flags-at-pre-registered-ranks to the otherwise-degenerate dev KS, a 2-strata (buried + evidence-absent) assembler with strict cutoff + fail-closed floors, and a D-08 voter-dispatch Workflow whose SCORED quantity is the MODEL verdict (not searchAndStop's flag-enum) under a no-abstention re-cast -- all deterministic, pre-registered, and test-green. Task 4 (the live Sonnet calibrator) is PENDING its blocking human-verify checkpoint and was NOT run (zero usage-pool spend).**

## Performance

- **Duration:** ~45 min (Tasks 1-3 only)
- **Started:** 2026-06-17 (sequential executor, main working tree, branch feat/deep-research)
- **Completed (Tasks 1-3):** 2026-06-17T21:36Z
- **Tasks:** 3 of 4 (Task 4 is a blocking human-verify checkpoint -- NOT run)
- **Files created:** 4
- **Files modified:** 4

## Accomplishments
- **Task 1 (EVAL-01) -- KS-enrichment layer + 2-strata assembler.** `extractUrlDate` applies the byte-locked strict path-only `URL_DATE_RULE`, grabs the archive INNER publication date, and fails closed (no-match / out-of-range / implausibly-future -> null, DROP only never leak); `normalizeClaimDate` zero-pads a single-digit day at the assembly layer while the FROZEN `parseAvtDate` still throws on the raw `9-10-2020`; `enrichKsForClaim` returns NEW objects (shared-mutation guard) with a DD-MM-YYYY date string on every doc + flags only at the pre-registered ranks (never text-leaked); `assembleStage1Traps` builds buried + evidence-absent ONLY (no date-sensitive), enforces the strict cutoff (no date-shift), the >=5-survivor + >=3/stratum fail-closed floors, and screens each trap via `validityGate` + the injected blind content-grounding probe before it counts, emitting recipe-not-text rows cache-only. FILE-form test: 21 discriminating assertions green.
- **Task 2 (EVAL-02, T-19-19) -- D-08 voter-dispatch Workflow.** Structured per `lz-review-gate.workflow.mjs` (meta + marker-delimited `LZ-EVAL-VOTER-DISPATCH-SHARED` block + injected globals, no import). `toScoredVote` takes the verdict from the MODEL vote, NEVER from `searchAndStop`'s mechanical flag-enum; `parseVoteVerdict` null -> not persisted -> re-cast (no-abstention); parameterized seat (Sonnet Stage-1 / Haiku Stage-2 reuse); k>=MIN_K floor (tighten-only); `remainingVotes` skip-already-done; pace-able pipeline fan-out; orchestrator owns persistence. Harness-slice test: 16 tests green, including the readDelta F3/F4 realized-count resumability guard end-to-end against the real `persistVote` + `readDelta`.
- **Task 3 (EVAL-04, T-19-15) -- pre-registration in the zero-votes window.** Removed the date-sensitive example rows (uid_seed 31 + 32); annotated the date-sensitive stratum DEFINITION as DEFERRED-to-Phase-20-live; reconciled the open-book note to two offline strata; added the `stage1_pre_registration` block (byte-locked URL_DATE_RULE, deterministic ascending-claim_id seed selection, scoring reconciliation, no-abstention, >=5-survivor, strict-cutoff/no-date-shift). The lock rule gained the two-offline-strata rule, a SCORING RECONCILIATION section, the NO-ABSTENTION rule, the byte-locked URL_DATE_RULE, and the strict-cutoff/no-date-shift/>=5-survivor rules; `EVAL_THRESHOLDS` numbers byte-unchanged. `aggregate.test` asserts the manifest URL_DATE_RULE == the assembler RegExp source byte-for-byte; `dataset.test` W4 drift gate now asserts EXACTLY two offline strata while keeping the uid-coverage/no-text/recipe guards.

## Task Commits

Each task was committed atomically:

1. **Task 1: KS-enrichment layer + 2-strata Stage-1 assembler** - `c253431` (feat)
2. **Task 2: D-08 voter-dispatch Workflow + harness-slice test** - `e5fa8d6` (feat)
3. **Task 3: pre-register 2 offline strata + scoring reconciliation + URL_DATE_RULE byte-lock** - `5f05121` (docs)

**Task 4 (the live Sonnet calibrator):** NOT run -- it is a `type="checkpoint:human-verify" gate="blocking"` step. It SPENDS the capped usage pool and must be settled WITH the human in the loop (settle-OR-raise; the D-06 saturation pre-condition). The orchestrator drives it separately.

_Note: Task 1 was specified TDD but was authored as a single discriminating FILE-form test alongside the implementation in one commit (the test file and the module were committed together; both green at commit time)._

## Files Created/Modified
- `eval/lz-eval-trap-assembler.mjs` - The net-new KS-enrichment layer + the 2-strata Stage-1 assembler. Composes the frozen spine + built recipe machinery; never rewrites them.
- `eval/lz-eval-trap-assembler.test.mjs` - 21 discriminating FILE-form tests (tmpdir cache, injected generate/validityProbe/weakVerifier stubs, no network / no model calls).
- `eval/lz-eval-voter-dispatch.workflow.mjs` - The net-new D-08 dynamic Workflow (parameterized seat, scoring reconciliation, no-abstention, skip-already-done, k-floor, pace-able).
- `eval/lz-eval-voter-dispatch.workflow.harness.test.mjs` - 16 harness-slice tests (mocked agents; readDelta resumability proven against the real persistVote + readDelta).
- `eval/__fixtures__/lz-eval-manifest.json` - Pre-registered: date-sensitive rows removed, stratum-def deferred, open-book note reconciled, stage1_pre_registration block added.
- `eval/lz-eval-lock-rule.md` - Pre-registered: two offline strata, SCORING RECONCILIATION + NO-ABSTENTION sections, byte-locked URL_DATE_RULE, strict-cutoff/no-date-shift/>=5-survivor; EVAL_THRESHOLDS byte-unchanged.
- `eval/lz-eval-aggregate.test.mjs` - Added the URL_DATE_RULE byte-lock + EVAL_THRESHOLDS-byte-unchanged + lock-rule re-plan-prose anti-drift tests.
- `eval/lz-eval-dataset.test.mjs` - W4 drift gate updated to EXACTLY two offline strata {buried, evidence-absent}; uid-coverage/no-text/recipe guards kept.

## Decisions Made
- **doc.date as a DD-MM-YYYY STRING (not a Date).** The frozen `dateFilter` calls `safeParse(doc.date)`, which parses ONLY the DD-MM-YYYY string shape. Attaching a `Date` object would have it `String`-coerced to an ISO-ish form `safeParse` rejects -- silently dropping EVERY enriched doc. `enrichKsForClaim` attaches the DD-MM-YYYY string via a `toDocDateString` helper; `extractUrlDate` still returns a `Date` for direct testing. (Caught during Task 1 -- see Deviations Rule 3.)
- **Deterministic buried/evidence-absent split.** The stratum is decided by the deepest strictly-pre-cutoff surviving doc index (`>= BURIED_RANK_FLOOR = 20` -> buried), then the KS is re-enriched WITH the disconfirmer/decisive flags at that rank, and `classifySeed` (the built classifier) is asserted to agree -- fail closed on a mismatch. The EXACT per-seed ranks are logged in the gitignored run artifact (recipe-not-text), never the committed manifest.
- **No-import assertion scoped to comment-stripped code.** The Task-2 header comment documents the no-import constraint and literally writes `dynamic import()`; the structural test strips `//` lines before the regex so the documentation does not false-trip the no-`import(` check.
- **EVAL_THRESHOLDS byte-unchanged.** The re-plan touches the manifest + lock rule only as pre-registration; the frozen engine thresholds are byte-identical (asserted).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Enriched doc.date must be a DD-MM-YYYY string, not a Date object, for the frozen dateFilter to consume it**
- **Found during:** Task 1 (the assembler's >=5-survivor / buried-stratum tests all reported 0 survivors)
- **Issue:** `enrichKsForClaim` initially set `doc.date = extractUrlDate(url)` (a `Date`). The FROZEN `dateFilter` calls `safeParse(doc.date)`, and `safeParse` parses ONLY a DD-MM-YYYY string -- a `Date` is `String`-coerced to an ISO form it rejects, so every enriched doc was silently dropped and both strata fell below the floor.
- **Fix:** Added a module-private `toDocDateString(date)` helper and set `doc.date` to the DD-MM-YYYY string (`extractUrlDate` still returns a `Date` for direct testing). The frozen `safeParse`/`dateFilter`/`parseAvtDate` were NOT touched. Added a test that PROVES the enriched date string is consumable by the frozen `dateFilter`.
- **Files modified:** eval/lz-eval-trap-assembler.mjs, eval/lz-eval-trap-assembler.test.mjs
- **Verification:** `node --test eval/lz-eval-trap-assembler.test.mjs` -> 21/21 green; the full eval-tree suite confirms the frozen primitives are byte-unchanged.
- **Committed in:** c253431 (Task 1 commit)

**2. [Rule 1 - Bug] The Task-2 no-import structural assertion false-tripped on the header comment**
- **Found during:** Task 2 (the structural-contract test failed on the first run)
- **Issue:** The no-`import(` regex matched the header comment text that DOCUMENTS the no-import constraint (it writes `dynamic import()`), not actual code.
- **Fix:** The structural test strips `//`-prefixed comment lines before applying the no-import regex (the workflow body has no block comments), so it checks CODE only.
- **Files modified:** eval/lz-eval-voter-dispatch.workflow.harness.test.mjs
- **Verification:** `node --test eval/lz-eval-voter-dispatch.workflow.harness.test.mjs` -> 16/16 green.
- **Committed in:** e5fa8d6 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug). Both are test/assembly-layer fixes; NO frozen primitive was edited and no plan contract was weakened.
**Impact on plan:** Both auto-fixes were necessary for correctness (the date-string seam is load-bearing for the whole offline read; the comment-scoping fix makes the structural guard sound). No scope creep.

## Issues Encountered
- The single self-discovered correctness seam (Date-vs-string for the enriched doc.date) is documented above as Rule 3. It is the construct-validity crux of the whole re-plan: without it the offline read is degenerate (the original gap the re-plan corrects).

## Full Suite Verification (before the calibrator run)

Run by explicit FILE path (the host's `node --test <dir>` quirk):

- Full eval-tree suite (11 files): **243 tests, 243 pass, 0 fail** (exit 0).
- Plugin-tree aggregator (`lz-deep-research-aggregate.test.mjs`): **41 tests, 41 pass, 0 fail** (exit 0).
- Combined: **284 tests, 0 failures.**
- `git status` shows NO committed AVeriTeC/NC corpus text; `eval/.cache/chenxwh__AVeriTeC` is gitignored; mutated trap prose + enriched KS + votes stay under `eval/.cache/`.
- The FROZEN primitives (parseAvtDate, safeParse, dateFilter, staticKsAdapter, searchAndStop in lz-eval-search-loop.mjs; the engine lz-eval-aggregate.mjs; the driver lz-eval-offline-read.mjs; the recipe machinery lz-eval-traps.mjs) are byte-unchanged (no modification in any commit; verified via `git status`).

## Next Phase Readiness -- Task 4 PENDING (blocking human-verify checkpoint)

Tasks 1-3 build the CONSTRUCT-VALID instrument (real dates + flags, two observable strata, the scored quantity pinned to the model verdict, pre-registered). **Task 4 is NOT run** -- it is the LIVE Sonnet calibrator that SPENDS the capped usage pool and must be settled WITH the human in the loop (settle-OR-raise; never auto-resolve). It will:
1. Assemble the Stage-1 trap set (Opus-subagent generator) over all qualifying Supported seeds, enriching each KS, enforcing the strict cutoff + the >=5-survivor + >=3/stratum floors, building buried + evidence-absent only.
2. Dispatch the SONNET calibrator at k>=5 over the enriched static-KS adapter via the D-08 Workflow (votes persist to gitignored eval/.cache/; resumable skip-already-done; no-abstention re-cast).
3. Feed per-stratum sonnetFalseUpholds into `calibratorGate`; inspect per-vote traces to confirm a below-ceiling stratum is GENUINE (minimums met, stop_reason exhausted/decisive-evidence, not min-not-met).
4. Settle the D-06 saturation pre-condition: BOTH strata saturate after one hardening pass -> VOID -> raise (Sonnet-default ships, 19-05 skipped); a below-ceiling stratum -> PROCEED to 19-05.

Plan 19-04 is therefore NOT complete and phase 19 is NOT complete. STATE/ROADMAP are not marked complete for 19-04 (Task 4 checkpoint pending).

---
*Phase: 19-search-extract-worker-agents*
*Completed (Tasks 1-3): 2026-06-17 -- Task 4 PENDING the blocking human-verify checkpoint*
