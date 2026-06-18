---
phase: 19-search-extract-worker-agents
plan: 04
subsystem: testing
tags: [eval, ks-enrichment, url-date-extraction, single-stratum, evidence-absent, positive-controls, multi-probe-consensus, all-agree-retain, out-of-family-probe, gold-blind-entailment-probe, resist-uphold-on-absence, voter-dispatch, workflow, closed-book, judge-only, searchAndStop-prepass, scoring-reconciliation, no-abstention, k-to-1-reduction, any-uphold, k9-seat-diversity, attack-modes, non-zero-decision-rule, classify-calibration, cp-0-n, count-vs-rank-correction, construct-scope-boundary, haiku-vs-sonnet, gating-read, node-test, resumable, pre-registration, re-plan-4, re-plan-5]

# Dependency graph
requires:
  - phase: 19-01
    provides: "the search-and-stop spine (searchAndStop, staticKsAdapter, dateFilter, parseAvtDate, safeParse, SEARCH_DEFAULTS) -- FROZEN, consumed not rewritten"
  - phase: 19-03
    provides: "the trap recipe machinery (mutateOverreach, classifySeed, validityGate, writeTrap, loadDevSeedsAndKs, BURIED_RANK_FLOOR) + the re-registered lock rule + manifest (classifySeed + BURIED_RANK_FLOOR are no longer consumed by the assembler -- buried dropped)"
  - phase: 18-03
    provides: "the frozen off-model engine (countFalseUpholds, delta, clopperPearsonUpper, passAtK, passHatK, lockRuleVerdict, EVAL_THRESHOLDS)"
  - phase: 19-04 (Task 1, prior commit)
    provides: "the offline-read decision driver (calibratorGate, readDelta, resolveOutcome, persistVote, votePath, STOP_REASONS) -- already built, consumed not rebuilt"
provides:
  - "eval/lz-eval-trap-assembler.mjs -- the KS-ENRICHMENT date layer (extractUrlDate, normalizeClaimDate, enrichKsForClaim, toDocDateString, URL_DATE_RULE -- byte-unchanged) + the SINGLE-STRATUM Stage-1 assembler (assembleStage1Traps; evidence-absent ONLY; strict cutoff; >=5-survivor inclusive + the SINGLE evidence-absent >=3 floor; validityGate + the GOLD-BLIND entailment probe screening; writeTrap cache-only). RE-PLAN-4: the isBuried/deepest-survivor-index policy + the buried stratum + the buried-auto-drop block are REMOVED; ALL qualifying seeds become evidence-absent (decisiveRank=-1, disconfirmerRank=-1; packet = date-filtered original supporting docs); the returned strata = { 'evidence-absent':[row] } (no buried key); attrition adds a dedicated probeDropped counter + retainedBelowFloor/voidReason (the documented VOID signal); the buriedAutoDropped/.buriedAutoDropReason fields are dropped"
  - "eval/lz-eval-trap-assembler.test.mjs -- FILE-form deterministic coverage (24 discriminating tests). RE-PLAN-4: DROPPED the buried-classification + buried-auto-drop + I3-removed tests; KEPT the >=5-survivor inclusive KEEP + recipe-not-text + validityGate/probe screening tests (re-pointed to evidence-absent + the entailment rubric); ADDED a single-stratum test (res.strata has EXACTLY the evidence-absent key, no buried) + a DISCRIMINATING below-floor-VOID test (the gold-blind probe drops enough packets that the RETAINED set < floor -> THROW /perStratumFloor/ with probeDropped recorded on the thrown attrition) + a gold-blind-entailment-probe gating test"
  - "eval/lz-eval-voter-dispatch.workflow.mjs + .prepass.mjs -- the D-08 closed-book 3-part dispatch (searchAndStop pre-pass -> Workflow judge-only over INLINED evidence with a TEXT return -> reducePooledVerdict any-uphold k->1). CARRIED UNCHANGED in RE-PLAN-4 (stratum-agnostic; consumes claimUids + packets, never a stratum name)"
  - "eval/lz-eval-voter-dispatch.workflow.harness.test.mjs -- FILE-form harness-slice test (23 tests; real string agent() return, integration smoke over the real searchAndStopPrePass, scoring reconciliation / no-abstention / skip-already-done / k-floor / trace-shape / readDelta-resumability / reducePooledVerdict / maxInFlight). CARRIED UNCHANGED in RE-PLAN-4 (re-run green as a sanity check; no edit)"
  - "eval/__fixtures__/lz-eval-manifest.json + eval/lz-eval-lock-rule.md -- pre-registered (zero-votes window): ONE offline CLOSED-BOOK JUDGMENT-difficulty stratum (evidence-absent), byte-locked URL_DATE_RULE, scoring reconciliation, no-abstention, >=5-survivor, strict-cutoff/no-date-shift, the k->1 any-uphold reduction, the construct-scope boundary, the no-MCP-build decision, the Haiku-ON preconditions. RE-PLAN-4 ADDED/CHANGED: the strata collapse to {evidence-absent} (buried DROPPED -- construct-invalid offline; date-sensitive DEFERRED); the GOLD-BLIND entailment validity-probe rubric + the retained floor (>= 3) + the VOID-on-below-floor condition; the count-vs-rank predicate correction (D-RP4-2) + the synthetic-disconfirmer-flag finding (D-RP4-1); the buried-auto-drop rule rewritten as buried-DROPPED"
affects: [phase-19-04-task-4-calibrator, phase-19-05-stage2-haiku, phase-20-orchestrator, phase-20-shadow-canary, voter-tier-default]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Assembly-layer enrichment over FROZEN primitives: extractUrlDate/normalizeClaimDate/enrichKsForClaim IMPORT + COMPOSE parseAvtDate/safeParse/dateFilter/staticKsAdapter/searchAndStop and the built recipe machinery -- never rewrite them (the date layer is byte-unchanged in RE-PLAN-4; only the assembler's stratum-assignment layer changed)"
    - "doc.date is the DD-MM-YYYY STRING (not a Date object) so the frozen safeParse/dateFilter consume it -- a Date object would be String-coerced and silently dropped"
    - "Single-stratum closed-book gate (RE-PLAN-4): one evidence-absent arm (resist-uphold-on-absence) screened by a GOLD-BLIND entailment validity probe BEFORE any vote; the floor is load-bearing (a below-floor retained set = documented VOID, never a tunable knob)"
    - "Gold-blind probe contract: the injected validityProbe reads ONLY the date-filtered survivors + the mutated overreach claim (NO AVeriTeC label, NO mutation knowledge); DISQUALIFY if the survivors entail the overreach, RETAIN only support-original-but-not-overreach -- so it does not bootstrap the gold it validates"
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
    - "eval/lz-eval-trap-assembler.mjs (RE-PLAN-4: evidence-absent-ONLY -- isBuried/buried/buried-auto-drop removed; probeDropped + below-floor VOID; gold-blind entailment probe contract)"
    - "eval/lz-eval-trap-assembler.test.mjs (RE-PLAN-4: dropped buried tests; +single-stratum, +below-floor-VOID, +gold-blind-entailment-probe gating; re-pointed I4 KEEP + screening tests)"
    - "eval/__fixtures__/lz-eval-manifest.json (RE-PLAN-4: strata -> {evidence-absent}; buried rows/def DROPPED; +gold_blind_validity_probe +count_vs_rank_correction; buried_dropped_rule)"
    - "eval/lz-eval-lock-rule.md (RE-PLAN-4: ONE offline stratum; buried-DROPPED section; +gold-blind probe section +count-vs-rank record D-RP4-2/D-RP4-1)"
    - "eval/lz-eval-aggregate.test.mjs (RE-PLAN-4: anti-drift phrase 'Two ... strata' -> 'ONE ... stratum'; +gold-blind-probe +count-vs-rank assertions; URL_DATE_RULE byte-lock + EVAL_THRESHOLDS byte-identity intact)"
    - "eval/lz-eval-dataset.test.mjs (RE-PLAN-4: membership guard flipped to EXACTLY {evidence-absent} size 1; buried + date-sensitive asserted absent)"

key-decisions:
  - "doc.date is attached as a DD-MM-YYYY STRING (via toDocDateString) so the FROZEN dateFilter/safeParse can consume it (Rule 3 blocking-issue fix from RE-PLAN-2 Task 1; STANDS byte-unchanged)"
  - "RE-PLAN-4 OPTION A (UNANIMOUS cross-family board, 5/5): the offline trap-strata collapse to a SINGLE evidence-absent stratum; buried is DROPPED ENTIRELY (construct-invalid offline). Resist-uphold-on-absence is the one genuinely-new arm vs the saturated Phase-18 subtle arm"
  - "D-RP4-1 (WHY buried is dropped): the synthetic disconfirmer=true flag on an arbitrary deep surviving doc is TEXT-UNVERIFIED -- a blind probe would reject most synthetic-buried; it measures a FAKE construct. Deep-refuter detection is retrieval-adjacent / context-attention, deferred to the Phase-20 live shadow"
  - "D-RP4-2 (the count-vs-rank predicate error): the RE-PLAN-3 isBuried=(deepest-survivor-INDEX >= 20) policy conflated survivor COUNT (median 5) with survivor RANK/position (0..99); the ~8.6% dated survivors scatter so the deepest index is almost always >= 20 (measured 97/97/96/80/76), classifying ALL 62 seeds as buried and ZERO as evidence-absent -> the assembler hard-threw and the calibrator could not run. The prior 'rank-20 burial impossible at median-5' claim is empirically FALSE"
  - "The GOLD-BLIND entailment validity probe is the load-bearing mandatory mitigation (FATAL if omitted): a gold-blind judge reads ONLY the date-filtered survivors + the mutated overreach claim and DISQUALIFIES any packet whose survivors entail the overreach, RETAINING only survivors-support-original-but-not-overreach. The dropped count is REPORTED in attrition.probeDropped (board guardrail 4)"
  - "D-RP4-3 (the floor is LOAD-BEARING, NOT a knob): the retained-gold floor is >= 3 (matching the assembler perStratumFloor); a retained set < floor AFTER the gold-blind probe drops is a documented VOID (the corpus cannot honestly build the PRIMARY arm) -- the probe threshold is NEVER tuned toward a desired N (result-shopping). The two unmeasured numbers (N_retained; Sonnet's resist-uphold-on-absence rate) are UNMEASURED until Task 4"
  - "Task 2 (the closed-book 3-part dispatch) is CARRIED UNCHANGED (stratum-agnostic -- it consumes claimUids + packets, never a stratum name); the single-stratum amendment changes WHICH packets are assembled, not how the dispatch judges them"
  - "EVAL_THRESHOLDS + URL_DATE_RULE byte-unchanged; the re-pre-registration touches the strata definition + the validity-probe contract only (prose + manifest keys), never a threshold"

patterns-established:
  - "Pre-registration anti-drift: the manifest's byte-locked URL_DATE_RULE string == the assembler RegExp .source (aggregate.test asserts it); a drifted rule cannot silently re-populate the stratum after the zero-votes window"
  - "Fail-closed single floor: a seed with <5 strictly-pre-cutoff survivors is excluded; the SOLE evidence-absent stratum with <3 RETAINED claims (after the gold-blind probe drops) throws -- the below-floor retained set is the documented VOID condition, not a silent pass"
  - "Construct-correction in the zero-votes window: a provably-false, capability-irrelevant predicate (count-vs-rank) is corrected + re-pre-registered BEFORE any vote, so there is no result to shop (anti result-shopping, T-19-15)"

requirements-completed: [EVAL-01, EVAL-02, EVAL-04]

# Metrics
duration: ~135min cumulative (RE-PLAN-2 ~45min + RE-PLAN-3 ~45min + RE-PLAN-4 ~20min + RE-PLAN-5 ~25min; Task 4 calibrator NOT run -- blocking human checkpoint, NO spend)
completed: 2026-06-18 (RE-PLAN-5 Tasks 1-3; Task 4 PENDING the blocking spend boundary)
---

# Phase 19 Plan 04: Offline gating-read Stage-1 instrument (KS-enrichment + evidence-absent + interleaved positive controls + multi-probe consensus + k=9 diverse seats + the NON-ZERO decision rule + CLOSED-BOOK D-08 voter-dispatch) Summary

**RE-PLAN-5 (board-converged measurement-validity upgrade, ZERO-VOTES window): the construct-valid CLOSED-BOOK Stage-1 instrument now carries a refuted-trap arm (evidence-absent) AND an interleaved gold=unrefuted POSITIVE-CONTROL arm (Finding 1 -- de-confounds the always-refute prior), both screened by a MULTI-PROBE ALL-AGREE-RETAIN consensus (Finding 2 -- the mandatory OUT-OF-FAMILY GPT-5.5 + Gemini probe de-confounds the same-family in-family probe leniency proven on pilot seed 75), with k=9 attack-mode-diverse voter seats (UNANIMOUS-2), and the offline-read driver gains `scorePositiveControls` (control accuracy + the always-refute-artifact flag) + `classifyCalibration` (the pre-registered NON-ZERO decision rule as four terminal labels, wrapping `calibratorGate` byte-identical, with `anyUpholdOnMinNotMet` DERIVED MECHANICALLY from the pooled traces). RE-PRE-REGISTERED in lockstep (lock-rule + manifest): the positive controls, the OOF probe consensus + the copilot CLI, k=9 + the ATTACK_MODES rotation, the NON-ZERO decision rule (exact wording + four labels), the probe-strictness rubric (seed-75 DISQUALIFY), and the CP(0,N) gate statistic + per-vote-secondary + per-class + frozen N_retained + the partition checksum. The CARRIED RE-PLAN-4 mechanics (the single evidence-absent trap stratum, the in-family gold-blind probe, the closed-book 3-part dispatch, the frozen primitives, the KS-enrichment date layer, the any-uphold k->1 reduction, the >=5-survivor + >=3-floor rules, the construct-scope boundary, EVAL_THRESHOLDS, URL_DATE_RULE) all STAND BYTE-IDENTICAL. All deterministic, pre-registered, FILE-form test-green (271 eval-tree tests, 0 failures). Task 4 (the live Sonnet calibrator over the FULL retained set at k=9 AFTER the all-probes-agree consensus) is PENDING its blocking human-verify checkpoint and was NOT run (ZERO usage-pool + ZERO Copilot-AI-Credits spend -- it spends BOTH capped pools).**

---

> **Historical record below: RE-PLAN-4 (the prior re-plan) is preserved verbatim.** RE-PLAN-5 AMENDS the RE-PLAN-4 build (committed 943ee2b / 65b13d3 / 1378314 / ee45e9e); the RE-PLAN-4 narrative, commits, and self-check remain as the RE-PLAN-4 record. The RE-PLAN-5 additions are the new section at the END (Accomplishments (RE-PLAN-5), the RE-PLAN-5 Task Commits, the RE-PLAN-5 Full Suite Verification, and the updated Next-Phase Readiness).

## Performance

- **Cumulative duration:** ~110 min (RE-PLAN-2 Tasks 1-3 ~45 min + RE-PLAN-3 Tasks 1-3 ~45 min + RE-PLAN-4 Tasks 1-3 ~20 min)
- **Started (RE-PLAN-4):** 2026-06-18 (sequential executor, main working tree, branch feat/deep-research; NO worktree)
- **Completed (RE-PLAN-4 Tasks 1-3):** 2026-06-18
- **Tasks:** 3 of 4 (Task 4 is a blocking human-verify checkpoint -- NOT run; it spends the capped usage pool)
- **Files created:** 5 (4 from RE-PLAN-2 + the RE-PLAN-3 prepass sibling)
- **Files modified (RE-PLAN-4):** 6 (assembler + assembler test + manifest + lock-rule + aggregate.test + dataset.test)

## Accomplishments (RE-PLAN-2 + RE-PLAN-3, carried as DONE)

- **RE-PLAN-2 (initial build).** The KS-enrichment layer (extractUrlDate, normalizeClaimDate, enrichKsForClaim, the byte-locked URL_DATE_RULE) + the Stage-1 assembler + the D-08 voter-dispatch SHARED helpers + the pre-registration in the zero-votes window.
- **RE-PLAN-3 (the first construct-validity correction, C1).** The pre-calibrator artifact review found the committed dispatch could NOT drive a valid run (a Workflow subagent is filesystem-blind + import-sealed and agent() returns a TEXT string). Resolved by the 3-PART CLOSED-BOOK dispatch: a NET-NEW sibling prepass.mjs runs searchAndStop in JS to produce the trace + date-filtered packet; the Workflow JUDGES the inlined evidence + returns TEXT; the orchestrator attaches the JS trace + reduces k->1 (any-uphold). The pre-registration was ADDED + the stale retrieval-orchestration prose corrected to closed-book JUDGMENT-difficulty.

## Accomplishments (RE-PLAN-4 -- the second construct-validity correction; THIS session)

At the Task-4 calibrator boundary, a FREE enumeration pass (no model spend) over the real assembler surfaced the SECOND construct defect on this instrument (`19-04-REPLAN-DECISION-4`): the RE-PLAN-3 `isBuried = (deepest-survivor-INDEX >= 20)` policy conflated survivor COUNT (median 5) with survivor RANK/position (0..99), so ALL 62 qualifying seeds classified as buried and ZERO as evidence-absent -> the assembler hard-threw and the calibrator could not run. A cross-family advisory board (3 blind Opus lenses + Copilot GPT-5.5 + Gemini-3.1-pro-preview, one parallel round, all blind) reached UNANIMOUS consensus (5/5, no split) on OPTION A: redefine the offline trap-strata to a SINGLE evidence-absent stratum, DROP buried entirely, and add a load-bearing GOLD-BLIND entailment validity probe as the mandatory mitigation. RE-PLAN-4 makes SURGICAL changes (no rebuild):

- **Task 1 (EVAL-01) -- the assembler amended to evidence-absent-ONLY.** REMOVED the `isBuried`/deepest-survivor-index policy + the `buried` stratum + the buried-auto-drop block entirely. ALL qualifying Supported seeds become `evidence-absent` (enrichKsForClaim with decisiveRank=-1, disconfirmerRank=-1 -- the packet is the date-filtered ORIGINAL supporting docs; NO refuter flag). The returned strata is `{ 'evidence-absent':[row] }` (no buried key). The SINGLE evidence-absent floor (>= perStratumFloor) is the only per-stratum floor; the RETAINED count is the POST-PROBE survivor count, so a below-floor retained set after the gold-blind probe drops THROWS /perStratumFloor/ naming evidence-absent + records the realized `probeDropped` count + sets `attrition.retainedBelowFloor` + `attrition.voidReason` on the thrown attrition (the documented VOID signal; board guardrails 4 + 5). Added a dedicated `attrition.probeDropped` counter (the gold-blind-probe drops, distinct from the aggregate `screenedOut`); dropped the `buriedAutoDropped`/`.buriedAutoDropReason` fields + the `perStratumCount.buried` field. SHARPENED the injected validityProbe contract to the GOLD-BLIND entailment rubric (reads ONLY the date-filtered survivors + the mutated overreach claim; DISQUALIFY if the survivors entail the overreach, RETAIN only support-original-but-not-overreach -- resist-uphold-on-absence). Tests: DROPPED the buried-classification + buried-auto-drop + I3-removed tests; KEPT the >=5-survivor inclusive KEEP + recipe-not-text + validityGate/probe screening tests (re-pointed to evidence-absent + the entailment rubric); ADDED the single-stratum test (res.strata has EXACTLY the evidence-absent key, no buried), a DISCRIMINATING below-floor-VOID test (the gold-blind probe drops 3 of 5 packets -> the retained set 2 < floor 3 -> THROW /perStratumFloor/ with `probeDropped=3` in the message + on the thrown attrition + `retainedBelowFloor=true` + a voidReason), and a gold-blind-entailment-probe gating test. FILE-form test: 24 discriminating assertions green.
- **Task 2 (EVAL-02, D-08, T-19-19) -- the closed-book 3-part dispatch CARRIED UNCHANGED.** NO-OP (no edits). The dispatch (prepass + Workflow + reducePooledVerdict + the SHARED helpers + maxInFlight + the harness) is STRATUM-AGNOSTIC -- it consumes claimUids + date-filtered evidence packets, never a stratum name. The single-stratum amendment (Task 1) changes WHICH packets are assembled, NOT how the dispatch judges them. The carried harness was re-run green by explicit FILE path (`node --test eval/lz-eval-voter-dispatch.workflow.harness.test.mjs` -> 23/23) as a sanity check; no change expected and none made. The dispatch + prepass + harness files are NOT in this plan's `files_modified` (no edits).
- **Task 3 (EVAL-04, T-19-15) -- the single-stratum re-pre-registration.** COLLAPSED the strata to {evidence-absent} IN LOCKSTEP across the lock-rule, the manifest, the aggregate.test anti-drift assertion, and the dataset.test membership guard (so the artifact is internally consistent + the anti-drift suite stays green). lock-rule: `Two offline ... strata` -> `ONE offline ... stratum`; the buried-auto-drop section -> a buried-DROPPED section (construct-invalid offline, D-RP4-1); ADDED the gold-blind entailment validity-probe section (rubric + disqualification + threshold + retained floor >= 3 + VOID-on-below-floor) + the count-vs-rank predicate-error record (D-RP4-2) + the synthetic-disconfirmer-flag finding (D-RP4-1) + the re-pre-registration timing guardrail (zero-votes window). manifest: the note -> single stratum; the open-book note corrected; the buried stratum-def marked DROPPED/Phase-20-deferred (not an offline gate stratum); the two buried example rows (averitec-dev-0013 + averitec-dev-0025) REMOVED; `buried_auto_drop_rule` -> `buried_dropped_rule` + ADDED `gold_blind_validity_probe` + `count_vs_rank_correction`; `buried_ranks` -> `no_refuter_ranks`. aggregate.test: the anti-drift phrase flipped to `ONE offline ... stratum` + ADDED assertions that the gold-blind probe + the count-vs-rank correction are recorded; the URL_DATE_RULE byte-lock + EVAL_THRESHOLDS byte-identity assertions STAY intact. dataset.test: the membership guard flipped to EXACTLY {evidence-absent} (size 1; buried + date-sensitive asserted absent). The byte-locked URL_DATE_RULE (manifest == assembler.source) + EVAL_THRESHOLDS numbers stay byte-identical; no CC-BY-NC text. aggregate.test + dataset.test: 61 tests green.

## Task Commits

Each task was committed atomically.

**RE-PLAN-2 (the initial build, carried as DONE):**

1. **Task 1: KS-enrichment layer + 2-strata Stage-1 assembler** - `c253431` (feat)
2. **Task 2: D-08 voter-dispatch Workflow SHARED helpers + harness-slice test** - `e5fa8d6` (feat)
3. **Task 3: pre-register 2 offline strata + scoring reconciliation + URL_DATE_RULE byte-lock** - `5f05121` (docs)

**RE-PLAN-3 (the first construct-validity correction, C1; carried as DONE):**

1. **Task 1: fold I3/I4/buried-auto-drop into the 2-strata assembler; re-point the throw test** - `d9a9205` (fix)
2. **Task 2: rework the D-08 dispatch to the 3-part closed-book realization** - `e25f7ef` (feat)
3. **Task 3: correct stale retrieval-orchestration prose + ADD closed-book pre-registration** - `a3f6029` (docs)

**RE-PLAN-4 (the second construct-validity correction -- evidence-absent-only + gold-blind probe; THIS session):**

1. **Task 1: amend the assembler to evidence-absent-ONLY (buried dropped; gold-blind entailment probe; single floor + below-floor VOID; probeDropped)** - `943ee2b` (fix)
2. **Task 2: CARRIED -- no edits (the closed-book 3-part dispatch is stratum-agnostic); harness re-run green by FILE path as a sanity check** - (no commit)
3. **Task 3: re-pre-register the SINGLE evidence-absent stratum + the gold-blind probe rubric + the count-vs-rank correction; flip the anti-drift {buried,evidence-absent}->{evidence-absent} in lockstep; remove the buried manifest rows** - `65b13d3` (docs)

**Task 4 (the live Sonnet calibrator):** NOT run -- it is a `type="checkpoint:human-verify" gate="blocking"` step. It SPENDS the capped usage pool (it runs the Sonnet closed-book calibrator over the SINGLE evidence-absent stratum AFTER the gold-blind probe screen) and must be settled WITH the human in the loop (settle-OR-raise; the D-06 saturation pre-condition; VOID is first-class -- the dominant likely terminal outcome). The orchestrator presents it to the human separately.

_Note: RE-PLAN-4 Task 1 is specified TDD but was authored as discriminating FILE-form tests alongside the surgical implementation in one commit (both green at commit time -- the existing RED suite passed against the new GREEN implementation); Task 2 is a carried no-op; Task 3 is `type="auto"`._

## Deviations from Plan

### Auto-fixed Issues

None for RE-PLAN-4 -- the plan executed exactly as written. The earlier-plan deviations (RE-PLAN-2 Date-vs-string seam Rule 3; the no-import structural assertion Rule 1; the RE-PLAN-3 authorized plan-structure notes) are documented in the git history of commits `c253431` / `e5fa8d6` / `d9a9205` / `e25f7ef` / `a3f6029` and are unchanged by RE-PLAN-4.

### Note (plan-structure, authorized)

`eval/lz-eval-aggregate.test.mjs` is in Task 3's `<files>` but not the frontmatter `files_modified`. The task body is authoritative -- the W-RP4 single-stratum anti-drift assertion flip + the new gold-blind-probe/count-vs-rank assertions are required to keep the suite green in lockstep with the lock-rule prose; the URL_DATE_RULE byte-lock + EVAL_THRESHOLDS byte-identity assertions are intact. Committed in `65b13d3` (RE-PLAN-4 Task 3).

## Issues Encountered

- RE-PLAN-4's crux was a FREE-enumeration finding at the Task-4 boundary (no model spend): the count-vs-rank predicate error (D-RP4-2) + the synthetic-disconfirmer-flag finding (D-RP4-1). Resolved by the board-converged construct correction -- evidence-absent-only + the gold-blind entailment validity probe -- a SURGICAL amendment to the assembler's stratum-assignment layer + the validity-probe contract + the re-pre-registration text. The frozen primitives, the KS-enrichment date layer, the closed-book 3-part dispatch, and the pre-registration MECHANICS all STAND byte-unchanged.

## Full Suite Verification (RE-PLAN-4, before the calibrator run)

Run by explicit FILE path (the host's `node --test <dir>` quirk):

- Full eval-tree suite (11 files): **253 tests, 253 pass, 0 fail** (exit 0; unchanged net count vs RE-PLAN-3 -- assembler tests stay at 24, harness at 23, aggregate+dataset at 61).
- Plugin-tree aggregator (`lz-deep-research-aggregate.test.mjs`): **41 tests, 41 pass, 0 fail** (exit 0).
- Combined: **294 tests, 0 failures.**
- Anti-drift invariants re-confirmed: the manifest `url_date_rule` == `URL_DATE_RULE.source` byte-for-byte (verified `true`); `EVAL_THRESHOLDS` numbers byte-identical (ALPHA 0.05, RELIABLE_TRIALS 15, MIN_K 5, DELTA_UPPER_MAX 0.25, ESCALATION_KILL_HIGH 0.50).
- The AVeriTeC example strata in the manifest is EXACTLY `{evidence-absent}` (2 rows: averitec-dev-0006/0007); 0 buried rows; buried + date-sensitive asserted absent.
- `git status` shows NO committed AVeriTeC/NC corpus text; `eval/.cache/chenxwh__AVeriTeC` is gitignored; mutated trap prose + enriched KS + votes stay under `eval/.cache/`.
- The FROZEN primitives (parseAvtDate, safeParse, dateFilter, staticKsAdapter, searchAndStop in lz-eval-search-loop.mjs; the engine lz-eval-aggregate.mjs; the driver lz-eval-offline-read.mjs; the recipe machinery lz-eval-traps.mjs) are byte-unchanged (no modification in any RE-PLAN-4 commit; verified via `git diff --name-only`). The KS-enrichment date layer (extractUrlDate / normalizeClaimDate / enrichKsForClaim / toDocDateString) is byte-unchanged (only comments + the assembler's call sites changed).

## Accomplishments (RE-PLAN-5 -- the measurement-validity upgrade; THIS session)

At the Task-4 calibrator boundary (still ZERO Sonnet votes), a generate+probe PILOT (8 seeds, 8/8 retained in-family, 0 probe-drops) moved the likely-VOID path from floor-drop to SATURATION (an accept-the-null outcome whose strength depends on the read's POWER + the VALIDITY of its gold). A max-quality cross-family advisory board (3 blind Opus lenses + Copilot GPT-5.5 + Gemini-3.1-pro-preview, ONE parallel round, all blind; `eval/.cache/board3/r1-synthesis.md`) reached UNANIMOUS 5/5 on the read mechanics AND surfaced TWO DECISIVE construct/measurement-validity findings (`19-04-REPLAN-DECISION-5`). RE-PLAN-5 makes a SURGICAL READ-DESIGN amendment (no rebuild) in the principled ZERO-VOTES window (anti result-shopping, mirroring RE-PLAN-3/4):

- **Task 1 (EVAL-01) -- the assembler: multi-probe ALL-AGREE-RETAIN consensus + interleaved positive controls.** `assembleStage1Traps` now consumes an injected `probes` ARRAY of gold-blind judges (in-family Opus + GPT-5.5 + Gemini); a packet is RETAINED only if EVERY probe agrees the entailment matches `expectedEntailment` ('false' for a refuted-gold TRAP, 'true' for an unrefuted-gold POSITIVE CONTROL); ANY split (a probe that accepted overall but disagreed on entailment -- e.g. seed-75-class) DISQUALIFIES (drop) and is counted in `attrition.probeDropped` + the NET-NEW `attrition.probeSplitDropped` (Finding 2). The CARRIED single `validityProbe` path is wrapped as a one-element consensus (consensus-over-one == that judge -- back-compat; every RE-PLAN-4 test passes unchanged). The assembler ALSO interleaves gold=unrefuted POSITIVE CONTROLS (Finding 1): native UNMUTATED Supported seeds (NO `mutateOverreach`; the original Supported claim) whose date-filtered survivors GENUINELY ENTAIL the claim (ALL probes agree entails=true) -- returned under a SEPARATE `positive-control` strata key, `goldLabels[uid]='unrefuted'`, NO overreach recipe; the seeds are PARTITIONED (the trailing `nControls` qualifying seeds become controls -- a seed used as a trap is never reused). TWO INDEPENDENT floors: the evidence-absent trap floor (>=3, CARRIED) THROWS /perStratumFloor/ naming evidence-absent; the positive-control floor (>=3) THROWS /positiveControlFloor/ naming positive-control (the documented VOID-on-control-floor -- the read cannot prove the voter CAN uphold). Each probe sees ONLY the date-filtered survivors (closed-book mirroring, C-RP4-1 -- asserted by the multi-probe test's dateFilter-idempotence check). FILE-form gate: **29 tests green** (24 carried + 6 new - 1 rewrite).
- **Task 2 (EVAL-02, D-08, T-19-19) -- the dispatch: k=9 attack-mode-diverse seats + indistinguishable positive-control handling.** Added a pre-registered `ATTACK_MODES` rotation (7 distinct modes -- factual-contradiction / scope-causality-overclaim / source-provenance / absence-of-evidence / quantifier-scope / causality-certainty / contradiction-vs-support) + an `attackModeForSeat(k)=ATTACK_MODES[k%len]` helper INSIDE the SHARED block; the `voterPrompt` STATES the per-seat attack-mode so "all k resisted" means a BATTERY of distinct attacks, not k identical re-draws (UNANIMOUS-2). The harness `getHelpers()` exportTail allow-list ADDS `ATTACK_MODES` + `attackModeForSeat` (W-1) so the seat-diversity test is concretely realizable. The DISPATCH DEFAULT k is RAISED to 9 (an UNSET k -> 9; an explicit k>=MIN_K honored verbatim; the frozen MIN_K=5 floor in `kFloorAtLeast` is UNCHANGED -- a DEFAULT change, NOT a threshold change); k picked ONCE here. The positive controls flow through the SAME closed-book prompt indistinguishably (the dispatch is stratum-agnostic; the gold is never in the prompt). The closed-book 3-part realization + the scored-quantity=MODEL-verdict reconciliation + no-abstention + skip-already-done + `reducePooledVerdict` any-uphold + `maxInFlight` + the integration smoke all STAND. FILE-form gate: **26 tests green** (23 carried + 3 new).
- **Task 3 (EVAL-04, T-19-15) -- the offline-read: positive-control accuracy + the NON-ZERO decision rule + the RE-PRE-REGISTRATION.** Added `scorePositiveControls({voteDir, positiveControlGold, nControls})` -> `{upheld, refuted, accuracy, alwaysRefuteArtifact}` -- reads ONLY 'unrefuted'-gold records; FAILS CLOSED on a realized-count mismatch AND on a 'refuted'-gold record leaked into the control voteDir (W-2); tolerance ZERO (ANY control refute -> `alwaysRefuteArtifact=true`, the saturation read is VOID/uninterpretable). Added `classifyCalibration({sonnetFalseUpholds, trials, positiveControl, traceAudit})` -- WRAPS `calibratorGate` BYTE-IDENTICAL and encodes the pre-registered NON-ZERO decision rule as FOUR terminal labels: `SATURATED-VOID` (0 false-upholds + controls upheld + clean), `ALWAYS-REFUTE-ARTIFACT-VOID` (controls refuted, decided FIRST), `BELOW-CEILING-PROCEED` (>=1 on a clean min-met trace + controls upheld), `ARTIFACT-VOID-REDO` (>=1 on a min-not-met/truncated/quota-killed trace); `anyUpholdOnMinNotMet` is DERIVED MECHANICALLY from the upheld pooled traces' `stop_reason` (only truncated/quota-killed stays caller-supplied human-inspection -- W-3). RE-PRE-REGISTERED in the zero-votes window (lock-rule + manifest): the positive controls, the OOF probe consensus (all-agree-retain + the `cat <prompt> | copilot --model {gpt-5.5|gemini-3.1-pro-preview} --effort high` invocation + the OOF-generate deferral), the probe-strictness rubric (seed-75 DISQUALIFY), k=9 + the ATTACK_MODES rotation, the NON-ZERO decision rule (exact wording + four labels + the W-3 mechanical-derivation note), and the CP(0,N) pooled gate statistic + per-vote-secondary + per-class + frozen N_retained + the partition checksum (`calibratorGate.trials(traps) + nControls == frozen N_retained(total)`). W-1 anti-drift lockstep: `aggregate.test` records the new sections (+ EVAL_THRESHOLDS + URL_DATE_RULE byte-identity re-pinned); `dataset.test` membership flips {evidence-absent} -> EXACTLY {evidence-absent, positive-control} (size 2; buried + date-sensitive still absent); the EVAL-01 license-clean recipe assertion is SCOPED to non-positive-control averitec rows (B-1) with the no-NC-`text` assertion over ALL rows + a discriminating control-rows-carry-no-recipe + unrefuted-gold assertion. `calibratorGate` is consumed UNCHANGED; EVAL_THRESHOLDS + URL_DATE_RULE byte-identical; no CC-BY-NC text. FILE-form gate (offline-read + aggregate + dataset): **104 tests green** (94 carried + 10 new).

## Task Commits (RE-PLAN-5 -- THIS session)

Each task was committed atomically (files staged by name; sequential executor on the main working tree, branch `feat/deep-research`; hooks ran; NO `git add .`):

1. **Task 1: assembler -- multi-probe ALL-AGREE-RETAIN consensus + interleaved positive controls (Findings 1+2)** - `a3c3507` (feat) -- `eval/lz-eval-trap-assembler.mjs` + `.test.mjs`
2. **Task 2: dispatch -- k=9 attack-mode-diverse seats + indistinguishable positive-control handling (UNANIMOUS-2)** - `7cf2d4d` (feat) -- `eval/lz-eval-voter-dispatch.workflow.mjs` + `.workflow.harness.test.mjs`
3. **Task 3: offline-read scorePositiveControls + classifyCalibration + RE-PRE-REGISTER (Finding 3 + UNANIMOUS-3)** - `edf6bf2` (feat) -- `eval/lz-eval-offline-read.mjs` + `.test.mjs` + `eval/__fixtures__/lz-eval-manifest.json` + `eval/lz-eval-lock-rule.md` + `eval/lz-eval-aggregate.test.mjs` + `eval/lz-eval-dataset.test.mjs`

**Task 4 (the live Sonnet calibrator at k=9 over the FULL retained set):** NOT run -- it is a `type="checkpoint:human-verify" gate="blocking"` step that spends BOTH the capped Claude usage pool AND a SEPARATE Copilot AI-Credits pool (the OOF probe consensus over ~55-62 packets x 2 OOF models). It must be settled to ONE of the four pre-registered terminal labels (`classifyCalibration`) and RAISED to the user -- never auto-resolved. VOID is first-class (the dominant likely terminal outcome -- four flavors).

## Full Suite Verification (RE-PLAN-5, before the calibrator run)

Run by explicit FILE path (the host's `node --test <dir>` quirk):

- Full eval-tree suite (11 files): **271 tests, 271 pass, 0 fail** (exit 0; +18 net vs the RE-PLAN-4 253 -- assembler 24->29, dispatch 23->26, offline-read 33->42, aggregate +1; the dataset/assembler test rewrites are net-neutral on count).
- Per-task gates green: `eval/lz-eval-trap-assembler.test.mjs` (29), `eval/lz-eval-voter-dispatch.workflow.harness.test.mjs` (26), `eval/lz-eval-offline-read.test.mjs eval/lz-eval-aggregate.test.mjs eval/lz-eval-dataset.test.mjs` (104).
- **Frozen invariants byte-identical:** `EVAL_THRESHOLDS` (ALPHA 0.05, RELIABLE_TRIALS 15, MIN_K 5, DELTA_UPPER_MAX 0.25, ESCALATION_KILL_HIGH 0.5) -- the frozen engine `lz-eval-aggregate.mjs` is NOT in the changed-file set; `URL_DATE_RULE.source` unchanged; the frozen primitives (`parseAvtDate`/`safeParse`/`dateFilter`/`staticKsAdapter`/`searchAndStop` in `lz-eval-search-loop.mjs`, the recipe machinery `lz-eval-traps.mjs`, the KS-enrichment date layer in the assembler) byte-unchanged; `calibratorGate` consumed unchanged (`classifyCalibration` wraps it).
- **Strata membership == EXACTLY {evidence-absent, positive-control}**; NO `buried`, NO `date-sensitive` (both still deferred to Phase-20); closed-book mirroring (`enrichedKs = survivors`) intact in BOTH the trap loop and the control loop.
- All 6 changed files strictly ASCII (no BOM); manifest is valid JSON; no committed CC-BY-NC corpus text (controls + traps carry NO `text` field; the native control claim text + mutated trap prose stay under gitignored `eval/.cache/`).
- ZERO SPEND: no `copilot` CLI / WebSearch / WebFetch / Workflow / subagent / vote run; `.claude/settings.json` (the pre-existing unrelated `M`) left untouched + unstaged; STATE.md / ROADMAP.md untouched (orchestrator-owned).

## Next Phase Readiness -- Task 4 PENDING (blocking human-verify checkpoint; SPENDS BOTH the capped Claude pool AND Copilot AI Credits)

RE-PLAN-5 Tasks 1-3 deliver the UPGRADED CONSTRUCT-VALID instrument: a refuted-trap arm + an interleaved gold=unrefuted positive-control arm (both screened by the multi-probe ALL-AGREE-RETAIN consensus), k=9 attack-mode-diverse voter seats, `scorePositiveControls` + the NON-ZERO decision rule (`classifyCalibration`, four terminal labels), and the re-pre-registration of all RE-PLAN-5 guardrails -- all in the ZERO-VOTES window. **Task 4 is NOT run** -- it is a `type="checkpoint:human-verify" gate="blocking"` step that SPENDS the capped Claude usage pool AND a SEPARATE Copilot AI-Credits pool (the OOF probe consensus over ~55-62 packets x 2 OOF models) and must be settled WITH the human in the loop (settle-OR-raise; never auto-resolve; VOID is first-class, the dominant likely terminal outcome -- four flavors). The orchestrator presents it to the human. It will:
1. Assemble the refuted-trap set AND the interleaved positive controls (Opus-subagent generator acceptable for the traps -- OOF generate DEFERRED), enriching each KS (dates only -- NO refuter flag), enforcing the strict cutoff + the >=5-survivor (exactly-5 KEEPS).
2. SCREEN every candidate packet with the ALL-PROBES-AGREE consensus (in-family Opus + GPT-5.5 + Gemini via the copilot CLI) -- RETAIN a TRAP only if ALL agree entails=false; RETAIN a CONTROL only if ALL agree entails=true; DROP split packets + REPORT `probeDropped` + `probeSplitDropped`; FREEZE N_retained; if retained traps < 3 -> VOID-on-trap-floor, if retained controls < 3 -> VOID-on-control-floor -> STOP and RAISE.
3. Run the Node `searchAndStopPrePass` per RETAINED claim in JS to produce the trace + the date-filtered packet (gitignored `eval/.cache/`).
4. Dispatch the SONNET calibrator at k=9 diverse seats via the carried Workflow over BOTH arms indistinguishably -- the voter JUDGES the INLINED packet (closed-book; no WebSearch, no self-search) and returns a definite TEXT verdict; the orchestrator persists the MODEL verdict + the JS trace (skip-already-done resumable; no-abstention re-cast), then reduces k->1 (any-uphold).
5. Score the positive-control accuracy (`scorePositiveControls`), feed pooled trap `sonnetFalseUpholds` into `calibratorGate`, audit the min-not-met traces, and settle the terminal label via `classifyCalibration` (the pre-registered NON-ZERO decision rule): `SATURATED-VOID` / `ALWAYS-REFUTE-ARTIFACT-VOID` / `BELOW-CEILING-PROCEED` / `ARTIFACT-VOID-REDO`.
6. Report CP(0, N_claims) pooled (per-vote 0/(N*k) a labeled secondary), the per-class breakdown, the partition checksum, and the realized N_retained; settle to ONE terminal label + RAISE to the user (Sonnet-default ships in EVERY VOID case; a closed-book PASS alone keeps Haiku-first OFF -- the Phase-20 live shadow is the named precondition; PROCEED to 19-05 ONLY on `BELOW-CEILING-PROCEED`).

---

## Next Phase Readiness -- RE-PLAN-4 historical record (superseded by RE-PLAN-5 above)

_The RE-PLAN-4 Task 4 runbook below is preserved as the historical record; RE-PLAN-5's upgraded runbook (above) supersedes it (it adds the positive-control arm + the OOF probe consensus + k=9 + the four-label classifier)._

RE-PLAN-4 Tasks 1-3 deliver the CONSTRUCT-VALID CLOSED-BOOK instrument as a SINGLE evidence-absent arm (buried dropped; date-sensitive deferred) screened by a load-bearing gold-blind entailment validity probe BEFORE any vote; the scored quantity pinned to the model judge-only verdict; the trace produced in JS; the k->1 any-uphold reduction; the re-pre-registration ADDED + the strata collapsed in lockstep. **Task 4 is NOT run** -- it is a `type="checkpoint:human-verify" gate="blocking"` step that SPENDS the capped usage pool (it runs the Sonnet closed-book calibrator) and must be settled WITH the human in the loop (settle-OR-raise; never auto-resolve; VOID is first-class, the dominant likely terminal outcome). The orchestrator presents it to the human. It will:
1. Assemble the Stage-1 trap set (Opus-subagent generator) over all qualifying Supported seeds, enriching each KS (dates only -- NO refuter flag), enforcing the strict cutoff + the >=5-survivor (exactly-5 KEEPS); every seed is evidence-absent (there is NO buried stratum).
2. SCREEN every candidate evidence-absent packet with the GOLD-BLIND entailment probe (NO AVeriTeC label, NO mutation knowledge) -- DISQUALIFY any packet whose survivors entail the overreach; REPORT the dropped count (`attrition.probeDropped`); if the RETAINED set < 3 (the floor) -> emit the documented VOID -> STOP and RAISE.
3. Run the Node `searchAndStopPrePass` per RETAINED claim in JS to produce the trace + the date-filtered packet (gitignored `eval/.cache/`).
4. Dispatch the SONNET calibrator at k>=5 via the carried Workflow -- the voter JUDGES the INLINED packet (closed-book; no WebSearch, no self-search) and returns a definite TEXT verdict; the orchestrator persists the MODEL verdict + the JS trace (skip-already-done resumable; no-abstention re-cast), then reduces k->1 (any-uphold).
5. Feed pooled sonnetFalseUpholds into `calibratorGate`; inspect the JS traces to confirm a below-ceiling read is GENUINE (minimums met, stop_reason exhausted/decisive-evidence, not min-not-met).
6. Settle the D-06 saturation pre-condition: RETAINED < 3 after the gold-blind probe OR evidence-absent saturates after one hardening pass -> VOID -> raise (Sonnet-default ships, 19-05 skipped, Haiku-first deferred to the Phase-20 operational shadow); a below-ceiling stratum -> PROCEED to 19-05. A closed-book outcome tests JUDGMENT, NOT retrieval (recorded as the construct-scope boundary).

Plan 19-04 is therefore NOT complete and phase 19 is NOT complete. STATE/ROADMAP are not marked complete for 19-04 (Task 4 checkpoint pending; the orchestrator owns those writes).

---
*Phase: 19-search-extract-worker-agents*
*RE-PLAN-5 Tasks 1-3 completed: 2026-06-18 (commits a3c3507 / 7cf2d4d / edf6bf2; amending RE-PLAN-4 943ee2b / 65b13d3 / 1378314 / ee45e9e; carrying RE-PLAN-3 d9a9205 / e25f7ef / a3f6029 + RE-PLAN-2 c253431 / e5fa8d6 / 5f05121) -- Task 4 PENDING the blocking human-verify checkpoint (it SPENDS the capped Claude usage pool AND a separate Copilot AI-Credits pool)*

## Self-Check: PASSED (RE-PLAN-5)

- All RE-PLAN-5-touched files exist on disk: `eval/lz-eval-trap-assembler.mjs` + `.test.mjs`, `eval/lz-eval-voter-dispatch.workflow.mjs` + `.workflow.harness.test.mjs`, `eval/lz-eval-offline-read.mjs` + `.test.mjs`, `eval/__fixtures__/lz-eval-manifest.json`, `eval/lz-eval-lock-rule.md`, `eval/lz-eval-aggregate.test.mjs`, `eval/lz-eval-dataset.test.mjs` (all FOUND).
- All three RE-PLAN-5 commit hashes reachable in git: `a3c3507` (Task 1), `7cf2d4d` (Task 2), `edf6bf2` (Task 3) (all FOUND).
- Full eval-tree suite (11 files): 271 tests, 0 failures (re-run by explicit FILE path); per-task gates green (assembler 29, dispatch 26, offline-read+aggregate+dataset 104).
- Anti-drift invariants hold: manifest `url_date_rule` == `URL_DATE_RULE.source` (verified true); `EVAL_THRESHOLDS` byte-unchanged (the frozen engine not in the changed-file set); the frozen primitives + the KS-enrichment date layer + `calibratorGate` byte-unchanged; strata membership is EXACTLY {evidence-absent, positive-control} (no buried, no date-sensitive); closed-book mirroring (`enrichedKs = survivors`) intact in both arms.
- Task 4 NOT started: no `copilot`/WebSearch/WebFetch/Workflow/subagent/vote run; ZERO Claude usage-pool + ZERO Copilot AI-Credits spend; `.claude/settings.json` / STATE.md / ROADMAP.md untouched (left to the orchestrator).

### Self-Check: PASSED (RE-PLAN-4, historical -- preserved)

- All RE-PLAN-4-touched files exist on disk: `eval/lz-eval-trap-assembler.mjs` + `.test.mjs`, `eval/__fixtures__/lz-eval-manifest.json`, `eval/lz-eval-lock-rule.md`, `eval/lz-eval-aggregate.test.mjs`, `eval/lz-eval-dataset.test.mjs` (all FOUND).
- Both RE-PLAN-4 commit hashes reachable in git: `943ee2b` (Task 1), `65b13d3` (Task 3) (all FOUND); Task 2 is a carried no-op (no commit).
- Full eval-tree suite + plugin-tree aggregator: 294 tests, 0 failures (re-run by explicit FILE path at RE-PLAN-4 close).
- Anti-drift invariants held: manifest `url_date_rule` == `URL_DATE_RULE.source` (verified true); EVAL_THRESHOLDS byte-unchanged; frozen primitives + the KS-enrichment date layer byte-unchanged; the AVeriTeC example strata was EXACTLY {evidence-absent} with 0 buried rows.
