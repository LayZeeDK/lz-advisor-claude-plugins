---
phase: 19-search-extract-worker-agents
plan: 04
subsystem: testing
tags: [eval, ks-enrichment, url-date-extraction, two-strata, buried, evidence-absent, voter-dispatch, workflow, closed-book, judge-only, searchAndStop-prepass, scoring-reconciliation, no-abstention, k-to-1-reduction, any-uphold, buried-auto-drop, construct-scope-boundary, haiku-vs-sonnet, gating-read, node-test, resumable, pre-registration, re-plan-3]

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
  - "eval/lz-eval-trap-assembler.mjs -- the KS-ENRICHMENT layer (extractUrlDate, normalizeClaimDate, enrichKsForClaim, URL_DATE_RULE) + the 2-strata Stage-1 assembler (assembleStage1Traps; evidence-absent PRIMARY + buried AUTO-GATED; strict cutoff; >=5-survivor inclusive + evidence-absent >=3/stratum FAIL-CLOSED + buried-AUTO-DROP; validityGate + blind content-grounding probe; writeTrap cache-only). RE-PLAN-3: the I3 tautological classifySeed guard REMOVED (probe + manifest ranks are the guarantor); buried AUTO-DROP made explicit + logged (attrition.buriedAutoDropped + .buriedAutoDropReason)"
  - "eval/lz-eval-trap-assembler.test.mjs -- FILE-form deterministic coverage (24 discriminating tests; +I4 exactly-5 KEEP, +buried AUTO-DROP, +I3 removed-with-rationale; the >=3/stratum THROW re-pointed to an evidence-absent-short corpus -- W-2)"
  - "eval/lz-eval-voter-dispatch.workflow.mjs -- the D-08 dynamic Workflow REWORKED to the CLOSED-BOOK realization: dispatches the parameterized voter seat as a JUDGE over the INLINED date-filtered evidence packet, parses the agent return as a TEXT string (the {vote,trace}-object assumption REMOVED), attaches the JS-produced trace, no-abstention re-cast, skip-already-done, k>=MIN_K floor, maxInFlight HONORED (W-3); + reducePooledVerdict (any-uphold k->1) in the SHARED block (orchestrator-owns-persistence)"
  - "eval/lz-eval-voter-dispatch.prepass.mjs -- NET-NEW sibling importable module (PART 1): searchAndStopPrePass runs the FROZEN searchAndStop over staticKsAdapter in JS to produce the {queries,depth,stop_reason} trace + the date-filtered evidence packet the Workflow inlines (the Workflow body is import-sealed -- the C1 root cause); renderEvidenceText renders the packet for the prompt"
  - "eval/lz-eval-voter-dispatch.workflow.harness.test.mjs -- FILE-form harness-slice test (23 tests; the REAL string agent() return -- I1 fix; + reducePooledVerdict any-uphold, + maxInFlight concurrency-cap, + INTEGRATION SMOKE over the real searchAndStopPrePass; the scoring reconciliation / no-abstention / skip-already-done / k-floor / trace shape / readDelta resumability guards STAND)"
  - "eval/__fixtures__/lz-eval-manifest.json + eval/lz-eval-lock-rule.md -- pre-registered (zero-votes window): 2 offline CLOSED-BOOK JUDGMENT-difficulty strata, byte-locked URL_DATE_RULE, scoring reconciliation, no-abstention, >=5-survivor, strict-cutoff/no-date-shift; RE-PLAN-3 ADDED: the k->1 any-uphold reduction, the construct-scope boundary (closed-book judgment NOT retrieval; Phase-20 = operational shadow), the buried-auto-drop rule, the no-MCP-build decision, the Haiku-ON preconditions; stale retrieval-orchestration prose corrected to closed-book JUDGMENT-difficulty (W-1)"
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
    - "eval/lz-eval-voter-dispatch.prepass.mjs (RE-PLAN-3: the PART-1 searchAndStop pre-pass sibling)"
  modified:
    - "eval/lz-eval-trap-assembler.mjs (RE-PLAN-3: I3 removed, buried AUTO-DROP, run config)"
    - "eval/lz-eval-trap-assembler.test.mjs (RE-PLAN-3: +I4 KEEP, +buried AUTO-DROP, +I3, re-pointed THROW)"
    - "eval/lz-eval-voter-dispatch.workflow.mjs (RE-PLAN-3: 3-part closed-book rework, TEXT return, reducePooledVerdict, maxInFlight)"
    - "eval/lz-eval-voter-dispatch.workflow.harness.test.mjs (RE-PLAN-3: real string return, integration smoke, reducePooledVerdict, maxInFlight)"
    - "eval/__fixtures__/lz-eval-manifest.json (RE-PLAN-3: W-1 prose + ADDED pre-registration)"
    - "eval/lz-eval-lock-rule.md (RE-PLAN-3: W-1 prose + ADDED pre-registration)"
    - "eval/lz-eval-aggregate.test.mjs (RE-PLAN-3: W-1 anti-drift assertion in lockstep)"
    - "eval/lz-eval-dataset.test.mjs (RE-PLAN-3: W-1 wording in lockstep)"

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
duration: ~90min cumulative (RE-PLAN-2 Tasks 1-3 ~45min + RE-PLAN-3 Tasks 1-3 ~45min; Task 4 calibrator NOT run -- blocking human checkpoint)
completed: 2026-06-18 (RE-PLAN-3 Tasks 1-3)
---

# Phase 19 Plan 04: Offline gating-read Stage-1 instrument (KS-enrichment + 2-strata assembler + CLOSED-BOOK D-08 voter-dispatch) Summary

**The construct-validity-corrected CLOSED-BOOK Stage-1 instrument (RE-PLAN-3): a KS-enrichment layer that attaches real dates (byte-locked strict path-only URL rule, archive-inner, fail-closed) + flags-at-pre-registered-ranks to the otherwise-degenerate dev KS; an evidence-absent-PRIMARY + buried-AUTO-GATED 2-strata assembler (strict cutoff; >=5-survivor inclusive; evidence-absent FAIL-CLOSED, buried AUTO-DROP); and a D-08 voter-dispatch reworked to the 3-PART CLOSED-BOOK realization -- a Node searchAndStop PRE-PASS (in a sibling importable module) produces the trace + the date-filtered packet, the Workflow dispatches a JUDGE over the INLINED evidence and returns a TEXT string, and the orchestrator attaches the JS trace + reduces k votes/claim -> ONE pooled per-claim verdict (any-uphold). The SCORED quantity is the MODEL verdict (never searchAndStop's flag-enum) under a no-abstention re-cast. All deterministic, pre-registered, and test-green (294 tests, 0 failures). Task 4 (the live Sonnet calibrator) is PENDING its blocking human-verify checkpoint and was NOT run (zero usage-pool spend -- it SPENDS the capped pool).**

## Performance

- **Cumulative duration:** ~90 min (RE-PLAN-2 Tasks 1-3 ~45 min + RE-PLAN-3 Tasks 1-3 ~45 min)
- **Started (RE-PLAN-3):** 2026-06-18 (sequential executor, main working tree, branch feat/deep-research; NO worktree)
- **Completed (RE-PLAN-3 Tasks 1-3):** 2026-06-18
- **Tasks:** 3 of 4 (Task 4 is a blocking human-verify checkpoint -- NOT run; it spends the capped usage pool)
- **Files created:** 5 (4 from RE-PLAN-2 + the RE-PLAN-3 prepass sibling)
- **Files modified:** 8 (4 RE-PLAN-2 + 4 RE-PLAN-3 surgical re-touches across both task + test trees)

## Accomplishments (RE-PLAN-2, carried as DONE)
- **Task 1 (EVAL-01) -- KS-enrichment layer + 2-strata assembler (carried).** `extractUrlDate` applies the byte-locked strict path-only `URL_DATE_RULE`, grabs the archive INNER publication date, fails closed; `normalizeClaimDate` zero-pads a single-digit day while the FROZEN `parseAvtDate` still throws on the raw `9-10-2020`; `enrichKsForClaim` returns NEW objects with a DD-MM-YYYY date string + flags only at pre-registered ranks; `assembleStage1Traps` builds buried + evidence-absent only, strict cutoff, fail-closed floors, validityGate + blind probe screening, recipe-not-text rows cache-only.
- **Task 2 (EVAL-02, T-19-19) -- D-08 voter-dispatch SHARED helpers (carried).** The control-logic helpers `parseVoteVerdict` / `toScoredVote` / `voteId` / `remainingVotes` / `kFloorAtLeast` -- structured per `lz-review-gate.workflow.mjs`.
- **Task 3 (EVAL-04, T-19-15) -- pre-registration in the zero-votes window (carried).** Date-sensitive example rows removed + stratum-def deferred; the `stage1_pre_registration` block (byte-locked URL_DATE_RULE, deterministic seed selection, scoring reconciliation, no-abstention, >=5-survivor, strict-cutoff/no-date-shift); EVAL_THRESHOLDS byte-unchanged.

## Accomplishments (RE-PLAN-3 -- the construct-validity correction; THIS session)

The pre-calibrator artifact review (`19-04-ARTIFACT-REVIEW.md`) found, BEFORE the calibrator spend, that the committed dispatch could NOT drive a valid run (C1: a Workflow subagent is filesystem-blind + import-sealed and `agent()` returns a TEXT string, so it cannot run `searchAndStop` nor emit a `{vote,trace}` object), plus I1-I4. Three independent consult rounds converged on the CLOSED-BOOK design (`19-04-REPLAN-DECISION-3`). RE-PLAN-3 makes SURGICAL changes (no rebuild):

- **Task 1 (EVAL-01) -- the I3/I4/buried-auto-drop folds + the re-pointed throw test.** REMOVED the I3 tautological `classifySeed` agreement guard (it was dead code: `isBuried` set both the disconfirmer-flag rank AND the stratum, so `classifySeed` could never disagree) -- stratification correctness now rests EXPLICITLY on the BLIND content-grounding `validityProbe` + the manifest ranks (documented in the header; the Phase-17 fixture-must-discriminate lesson applied to a runtime guard), and `classifySeed` is dropped from this module's import. Made the buried AUTO-DROP explicit + logged: `evidence-absent` is the PRIMARY arm (FAILS CLOSED below `perStratumFloor`), `buried` is AUTO-GATED -- it AUTO-DROPS to evidence-absent-only (pruning its gold labels, emptying its stratum, recording `attrition.buriedAutoDropped` + `.buriedAutoDropReason`) below the floor instead of aborting the whole run. Added the I4 exactly-5-survivor inclusive-boundary KEEP test (proves the floor is `<5`, not `<=5`), the buried AUTO-DROP test, and the I3 removed-with-rationale test (the blind probe is the discriminating guard). W-2: re-pointed the `>=3/stratum` THROW test to an evidence-absent-short (PRIMARY) corpus so the throw path stays covered. FILE-form test: 24 discriminating assertions green.
- **Task 2 (EVAL-02, T-19-19) -- the 3-PART CLOSED-BOOK dispatch rework.** PART 1: a NET-NEW sibling importable module `eval/lz-eval-voter-dispatch.prepass.mjs` (`searchAndStopPrePass`) runs the FROZEN `searchAndStop` over `staticKsAdapter` in JS to produce the real `{queries, depth, stop_reason}` trace + the date-filtered evidence packet (the Workflow body is import-sealed and cannot run the spine -- the C1 root cause). PART 2: the Workflow dispatches the parameterized voter seat as a JUDGE over the INLINED date-filtered evidence packet (NO self-search, NO live web) and parses the agent return as a TEXT string (the `{vote,trace}`-object destructuring REMOVED); the trace handed to `toScoredVote` is the JS-PRODUCED trace, never a model-returned one. PART 3: `reducePooledVerdict` (SHARED block) applies the pre-registered ANY-UPHOLD k->1 reduction (a single uphold among k flips the pooled per-claim verdict). W-3: `maxInFlight` is HONORED by chunking the fan-out into `MAX_IN_FLIGHT`-sized pipelined chunks (the pace-able claim is real, not a phantom arg). Harness rework (I1 fix): mock agents return the REAL TEXT string contract (never a `{vote,trace}` object); supply per-claim evidence packets; ADDED the `reducePooledVerdict` any-uphold test, the `maxInFlight` concurrency-cap assertion, and an INTEGRATION SMOKE over the REAL `searchAndStopPrePass`; the scoring-reconciliation / no-abstention / skip-already-done / k-floor / trace-shape / readDelta-resumability guards STAND. Harness-slice test: 23 tests green.
- **Task 3 (EVAL-04, T-19-15) -- the W-1 prose correction + the ADDED pre-registration.** Corrected the stale "retrieval-difficulty / RETRIEVAL ORCHESTRATION" prose to closed-book JUDGMENT-difficulty wording IN LOCKSTEP across the lock-rule, the manifest, the `aggregate.test` anti-drift assertion (~line 433, with a new anti-self-contradiction guard), and the `dataset.test` comments (the stratum NAMES `{buried, evidence-absent}` unchanged, so the membership/uid-coverage/no-text/recipe guards are intact). ADDED to the lock-rule + manifest pre-registration (zero-votes window): the k->1 reduction + the explicit ANY-UPHOLD false-uphold rule, the construct-scope boundary (closed-book judgment NOT retrieval; Phase-20 = operational shadow), the buried-auto-drop rule, the no-MCP-build decision + rationale, and the Haiku-ON preconditions (a closed-book PASS does NOT certify retrieval -- Haiku OFF pending a live shadow/canary read). The byte-locked URL_DATE_RULE (manifest == assembler.source) + EVAL_THRESHOLDS numbers stay byte-identical; no CC-BY-NC text. `aggregate.test` + `dataset.test`: 61 tests green.

## Task Commits

Each task was committed atomically.

**RE-PLAN-2 (the initial build, carried as DONE):**

1. **Task 1: KS-enrichment layer + 2-strata Stage-1 assembler** - `c253431` (feat)
2. **Task 2: D-08 voter-dispatch Workflow SHARED helpers + harness-slice test** - `e5fa8d6` (feat)
3. **Task 3: pre-register 2 offline strata + scoring reconciliation + URL_DATE_RULE byte-lock** - `5f05121` (docs)

**RE-PLAN-3 (the construct-validity correction, THIS session):**

1. **Task 1: fold I3/I4/buried-auto-drop into the 2-strata assembler; re-point the throw test** - `d9a9205` (fix)
2. **Task 2: rework the D-08 dispatch to the 3-part closed-book realization** - `e25f7ef` (feat)
3. **Task 3: correct stale retrieval-orchestration prose + ADD closed-book pre-registration** - `a3f6029` (docs)

**Task 4 (the live Sonnet calibrator):** NOT run -- it is a `type="checkpoint:human-verify" gate="blocking"` step. It SPENDS the capped usage pool (it runs the Sonnet closed-book calibrator) and must be settled WITH the human in the loop (settle-OR-raise; the D-06 saturation pre-condition; VOID is first-class). The orchestrator presents it to the human separately.

_Note: RE-PLAN-3 Task 1 is specified TDD but was authored as discriminating FILE-form tests alongside the surgical implementation in one commit (both green at commit time); Tasks 2 + 3 are `type="auto"`._

## Files Created/Modified (RE-PLAN-3 surgical re-touches noted)
- `eval/lz-eval-trap-assembler.mjs` - KS-enrichment layer + 2-strata assembler. RE-PLAN-3: I3 tautological guard REMOVED (classifySeed dropped from the import), buried AUTO-DROP made explicit + logged (`attrition.buriedAutoDropped` / `.buriedAutoDropReason`), header documents the construct-scope boundary. Composes the frozen spine + recipe machinery; never rewrites them.
- `eval/lz-eval-trap-assembler.test.mjs` - 24 discriminating FILE-form tests (was 21). RE-PLAN-3: +I4 exactly-5 KEEP, +buried AUTO-DROP, +I3 removed-with-rationale; the `>=3/stratum` THROW re-pointed to an evidence-absent-short corpus (W-2).
- `eval/lz-eval-voter-dispatch.workflow.mjs` - D-08 dynamic Workflow REWORKED to the 3-part closed-book realization (judge-only over INLINED evidence, TEXT-string return, JS-produced trace attached, `reducePooledVerdict` any-uphold k->1 in the SHARED block, `maxInFlight` honored via chunked fan-out). The SHARED control-logic helpers STAND.
- `eval/lz-eval-voter-dispatch.prepass.mjs` - NET-NEW (RE-PLAN-3) sibling importable PART-1 module: `searchAndStopPrePass` runs the FROZEN `searchAndStop` over `staticKsAdapter` in JS to produce the trace + the date-filtered packet the Workflow inlines; `renderEvidenceText` renders it for the prompt. Composes the frozen spine; never rewrites it.
- `eval/lz-eval-voter-dispatch.workflow.harness.test.mjs` - 23 harness-slice tests (was 16). RE-PLAN-3: the REAL string `agent()` return (I1 fix), per-claim evidence packets, the `reducePooledVerdict` any-uphold test, the `maxInFlight` concurrency-cap assertion, and an INTEGRATION SMOKE over the real `searchAndStopPrePass`; the scoring-reconciliation / no-abstention / skip-already-done / k-floor / trace-shape / readDelta-resumability guards STAND.
- `eval/__fixtures__/lz-eval-manifest.json` - Pre-registered. RE-PLAN-3: W-1 prose corrected to closed-book JUDGMENT-difficulty; ADDED `k_to_1_reduction_rule`, `construct_scope_boundary`, `buried_auto_drop_rule`, `no_mcp_build_decision`, `scope_limit_haiku_on`. Byte-locked URL_DATE_RULE unchanged.
- `eval/lz-eval-lock-rule.md` - Pre-registered. RE-PLAN-3: W-1 prose corrected; ADDED the k->1 any-uphold rule, the construct-scope boundary, the buried-auto-drop rule, the no-MCP-build decision, the Haiku-ON preconditions. EVAL_THRESHOLDS byte-unchanged.
- `eval/lz-eval-aggregate.test.mjs` - RE-PLAN-3: the lock-rule anti-drift assertion updated in lockstep with the W-1 prose (`Two offline CLOSED-BOOK JUDGMENT-difficulty strata`) + a new anti-self-contradiction guard (the stale `difficulty lives in RETRIEVAL ORCHESTRATION` is gone); the URL_DATE_RULE byte-lock + EVAL_THRESHOLDS byte-identity assertions intact.
- `eval/lz-eval-dataset.test.mjs` - RE-PLAN-3: the `retrieval-difficulty` wording in the comments corrected to closed-book JUDGMENT-difficulty in lockstep; the strata-membership/uid-coverage/no-text/recipe guards intact.

## Decisions Made
- **doc.date as a DD-MM-YYYY STRING (not a Date).** (RE-PLAN-2) The frozen `dateFilter` calls `safeParse(doc.date)`, which parses ONLY the DD-MM-YYYY string shape; a `Date` object would be `String`-coerced to a form `safeParse` rejects. `enrichKsForClaim` attaches the DD-MM-YYYY string via `toDocDateString`.
- **I3: REMOVE the tautological classifySeed guard (RE-PLAN-3, removed-with-recorded-rationale).** The prior guard re-classified the enriched KS via `classifySeed` and threw on a stratum mismatch, but `isBuried` set BOTH the disconfirmer-flag rank `classifySeed` reads AND the stratum -- so it could never disagree (dead code that read as assurance). REMOVED in favour of the BLIND content-grounding `validityProbe` (which fails closed on a mis-grounded construction) + the pre-registered manifest ranks as the recorded stratification guarantor, documented in the header (the Phase-17 fixture-must-discriminate lesson applied to a runtime guard). `classifySeed` is unchanged in `lz-eval-traps.mjs`; only the dead in-assembler assertion + its import are gone.
- **buried is AUTO-GATED; evidence-absent is the PRIMARY arm (RE-PLAN-3).** At median-5 docs the deepest survivor rarely reaches `BURIED_RANK_FLOOR`, so buried AUTO-DROPS to evidence-absent-only (logged) below the floor instead of aborting the whole run; the PRIMARY evidence-absent stratum FAILS CLOSED below the floor (a degenerate corpus). buried offline is a context-attention / refuter-detection JUDGMENT test, NOT retrieval.
- **The dispatch is realized as a 3-part dance with the trace produced in JS (RE-PLAN-3, the C1 fix).** A Workflow subagent is filesystem-blind + import-sealed and `agent()` returns a TEXT string, so it cannot run `searchAndStop` nor emit a `{vote,trace}` object. The ORCHESTRATOR runs `searchAndStop` in JS (PART 1, sibling `prepass.mjs`), the Workflow JUDGES the inlined evidence + returns TEXT (PART 2), and the orchestrator attaches the JS trace + reduces k->1 (PART 3). The prepass lives in a sibling importable module because the Workflow body cannot import the frozen spine.
- **k->1 is ANY-UPHOLD, not majority (RE-PLAN-3, I2).** `reducePooledVerdict` -- a claim is a pooled false-uphold if ANY of its k votes upholds (the conservative rule mirroring the shipped tally's downgrade-not-delete posture; a single silent uphold-on-absence is the failure the gate hunts). Pre-registered before any vote.
- **maxInFlight HONORED, not removed (RE-PLAN-3, W-3).** The phantom knob is resolved by chunking the fan-out into `MAX_IN_FLIGHT`-sized pipelined chunks; a harness assertion proves a `maxInFlight` of N never runs more than N agents concurrently.
- **Closed-book gate measures JUDGMENT, NOT retrieval (RE-PLAN-3, the construct-scope boundary).** Retrieval orchestration is not cleanly + leak-safely measurable offline (the frozen `staticKsAdapter` ignores the query) and defers to the Phase-20 live operational shadow; a closed-book PASS never certifies retrieval, and Haiku stays OFF pending live evidence. The dev MCP + ranked-retrieval index (Option B) is NOT built (poor ROI; three consult rounds converged).
- **EVAL_THRESHOLDS + URL_DATE_RULE byte-unchanged.** Both re-plans touch the manifest + lock rule only as pre-registration; the frozen engine thresholds + the byte-locked rule are byte-identical (asserted: manifest == assembler.source).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Enriched doc.date must be a DD-MM-YYYY string, not a Date object, for the frozen dateFilter to consume it**
- **Found during:** Task 1 (the assembler's >=5-survivor / buried-stratum tests all reported 0 survivors)
- **Issue:** `enrichKsForClaim` initially set `doc.date = extractUrlDate(url)` (a `Date`). The FROZEN `dateFilter` calls `safeParse(doc.date)`, and `safeParse` parses ONLY a DD-MM-YYYY string -- a `Date` is `String`-coerced to an ISO form it rejects, so every enriched doc was silently dropped and both strata fell below the floor.
- **Fix:** Added a module-private `toDocDateString(date)` helper and set `doc.date` to the DD-MM-YYYY string (`extractUrlDate` still returns a `Date` for direct testing). The frozen `safeParse`/`dateFilter`/`parseAvtDate` were NOT touched. Added a test that PROVES the enriched date string is consumable by the frozen `dateFilter`.
- **Files modified:** eval/lz-eval-trap-assembler.mjs, eval/lz-eval-trap-assembler.test.mjs
- **Verification:** `node --test eval/lz-eval-trap-assembler.test.mjs` -> 21/21 green; the full eval-tree suite confirms the frozen primitives are byte-unchanged.
- **Committed in:** c253431 (Task 1 commit)

**2. [Rule 1 - Bug] The Task-2 no-import structural assertion false-tripped on the header comment** (RE-PLAN-2)
- **Found during:** Task 2 (the structural-contract test failed on the first run)
- **Issue:** The no-`import(` regex matched the header comment text that DOCUMENTS the no-import constraint, not actual code.
- **Fix:** The structural test strips `//`-prefixed comment lines before the regex (CODE only).
- **Committed in:** e5fa8d6 (RE-PLAN-2 Task 2)

### RE-PLAN-3 Deviations

**3. [Plan-structure / authorized] The PART-1 pre-pass lives in a NET-NEW sibling module not in the plan frontmatter `files_modified`**
- **Found during:** RE-PLAN-3 Task 2
- **Issue:** The 3-part realization needs `searchAndStopPrePass` to import the frozen spine, but a Workflow body is import-sealed (it cannot `import`), and the harness's `new Function` runner cannot host an `export function`. So the pre-pass cannot live in the Workflow file.
- **Resolution:** Created `eval/lz-eval-voter-dispatch.prepass.mjs` (a sibling importable module). This is EXPLICITLY authorized by the Task-2 body ("this pre-pass helper either lives in the dispatch module's importable surface ... or in a small sibling orchestration script"); it is NOT in the frontmatter `files_modified` list. The harness's prepass-structural test + integration smoke cover it.
- **Committed in:** e25f7ef (RE-PLAN-3 Task 2)

**4. [Plan-structure / authorized] `eval/lz-eval-aggregate.test.mjs` is in Task 3's `<files>` but not the frontmatter `files_modified`**
- **Found during:** RE-PLAN-3 Task 3
- **Issue:** The W-1 prose correction must update the `aggregate.test` anti-drift assertion (`~line 433`) in LOCKSTEP or the suite goes red, but the frontmatter `files_modified` omits `aggregate.test.mjs` (a known plan inconsistency the prompt flagged).
- **Resolution:** The task body is authoritative -- updated the assertion to match the corrected prose (`Two offline CLOSED-BOOK JUDGMENT-difficulty strata`) + added an anti-self-contradiction guard. The URL_DATE_RULE byte-lock + EVAL_THRESHOLDS byte-identity assertions are intact.
- **Committed in:** a3f6029 (RE-PLAN-3 Task 3)

---

**Total deviations:** 4 (RE-PLAN-2: 1 blocking + 1 bug; RE-PLAN-3: 2 authorized plan-structure notes). NO frozen primitive was edited and no plan contract was weakened. The two RE-PLAN-3 notes are authorized by the task bodies; both surfaces are test-covered.
**Impact on plan:** No scope creep. The RE-PLAN-3 changes are surgical (no rebuild of the enrichment layer, the assembler floors, the SHARED dispatch helpers, or the carried pre-registration).

## Issues Encountered
- RE-PLAN-2's Date-vs-string seam (Rule 3) was the construct-validity crux of the enrichment layer. RE-PLAN-3's crux was C1: the committed dispatch could not drive a valid run (a Workflow subagent cannot run `searchAndStop` nor emit a `{vote,trace}` object) -- resolved by the 3-part closed-book dance with the trace produced in JS.

## Full Suite Verification (RE-PLAN-3, before the calibrator run)

Run by explicit FILE path (the host's `node --test <dir>` quirk):

- Full eval-tree suite (11 files): **253 tests, 253 pass, 0 fail** (exit 0; was 243 -- +10 net: +3 assembler, +7 harness).
- Plugin-tree aggregator (`lz-deep-research-aggregate.test.mjs`): **41 tests, 41 pass, 0 fail** (exit 0).
- Combined: **294 tests, 0 failures.**
- Anti-drift invariants re-confirmed: the manifest `url_date_rule` == `URL_DATE_RULE.source` byte-for-byte (verified `true`); `EVAL_THRESHOLDS` numbers byte-identical (ALPHA 0.05, RELIABLE_TRIALS 15, MIN_K 5, DELTA_UPPER_MAX 0.25, ESCALATION_KILL_HIGH 0.50).
- `git status` shows NO committed AVeriTeC/NC corpus text; `eval/.cache/chenxwh__AVeriTeC` is gitignored; mutated trap prose + enriched KS + votes stay under `eval/.cache/`.
- The FROZEN primitives (parseAvtDate, safeParse, dateFilter, staticKsAdapter, searchAndStop in lz-eval-search-loop.mjs; the engine lz-eval-aggregate.mjs; the driver lz-eval-offline-read.mjs; the recipe machinery lz-eval-traps.mjs) are byte-unchanged (no modification in any commit; verified via `git diff --name-only`).

## Next Phase Readiness -- Task 4 PENDING (blocking human-verify checkpoint; SPENDS the capped pool)

RE-PLAN-3 Tasks 1-3 deliver the CONSTRUCT-VALID CLOSED-BOOK instrument (real dates + flags; evidence-absent PRIMARY + buried AUTO-GATED; the scored quantity pinned to the model judge-only verdict; the trace produced in JS; the k->1 any-uphold reduction; the pre-registration ADDED + the stale prose corrected). **Task 4 is NOT run** -- it is a `type="checkpoint:human-verify" gate="blocking"` step that SPENDS the capped usage pool (it runs the Sonnet closed-book calibrator) and must be settled WITH the human in the loop (settle-OR-raise; never auto-resolve; VOID is first-class). The orchestrator presents it to the human. It will:
1. Assemble the Stage-1 trap set (Opus-subagent generator) over all qualifying Supported seeds, enriching each KS, enforcing the strict cutoff + the >=5-survivor (exactly-5 KEEPS) + the evidence-absent perStratumFloor; buried AUTO-GATED (record whether it built >=3 distinct claims at rank >=20 or AUTO-DROPPED).
2. Run the Node `searchAndStopPrePass` per claim in JS to produce the trace + the date-filtered packet (gitignored `eval/.cache/`).
3. Dispatch the SONNET calibrator at k>=5 via the reworked Workflow -- the voter JUDGES the INLINED packet (closed-book; no WebSearch, no self-search) and returns a definite TEXT verdict; the orchestrator persists the MODEL verdict + the JS trace (skip-already-done resumable; no-abstention re-cast), then reduces k->1 (any-uphold).
4. Feed per-stratum pooled sonnetFalseUpholds into `calibratorGate`; inspect the JS traces to confirm a below-ceiling stratum is GENUINE (minimums met, stop_reason exhausted/decisive-evidence, not min-not-met).
5. Settle the D-06 saturation pre-condition: evidence-absent saturates after one hardening pass + buried auto-dropped/saturated -> VOID -> raise (Sonnet-default ships, 19-05 skipped, Haiku-first deferred to the Phase-20 operational shadow); a below-ceiling stratum -> PROCEED to 19-05. A closed-book outcome tests JUDGMENT, NOT retrieval (recorded as the construct-scope boundary).

Plan 19-04 is therefore NOT complete and phase 19 is NOT complete. STATE/ROADMAP are not marked complete for 19-04 (Task 4 checkpoint pending; the orchestrator owns those writes).

---
*Phase: 19-search-extract-worker-agents*
*RE-PLAN-3 Tasks 1-3 completed: 2026-06-18 (commits d9a9205 / e25f7ef / a3f6029; carrying RE-PLAN-2 c253431 / e5fa8d6 / 5f05121) -- Task 4 PENDING the blocking human-verify checkpoint (it SPENDS the capped usage pool)*

## Self-Check: PASSED

- All RE-PLAN-3 files exist on disk: `eval/lz-eval-trap-assembler.mjs` + `.test.mjs`, `eval/lz-eval-voter-dispatch.workflow.mjs` + `.prepass.mjs` + `.workflow.harness.test.mjs`, `eval/__fixtures__/lz-eval-manifest.json`, `eval/lz-eval-lock-rule.md`, `eval/lz-eval-aggregate.test.mjs`, `eval/lz-eval-dataset.test.mjs` (all FOUND).
- All three RE-PLAN-3 commit hashes reachable in git: `d9a9205` (Task 1), `e25f7ef` (Task 2), `a3f6029` (Task 3) (all FOUND).
- Full eval-tree suite + plugin-tree aggregator: 294 tests, 0 failures (re-run by explicit FILE path).
- Anti-drift invariants hold: manifest `url_date_rule` == `URL_DATE_RULE.source`; EVAL_THRESHOLDS byte-unchanged; frozen primitives byte-unchanged.
