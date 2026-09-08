# 19-04 artifact review (pre-calibrator, "walk the artifacts first") -- 2026-06-18

Scope: a full review of the four net-new 19-04 deliverables BEFORE authorizing the Task-4 Sonnet
calibrator spend. Requested by the user at the Task-4 blocking checkpoint. Method: orchestrator review +
two independent adversarial reviewer agents (Opus), every load-bearing claim re-verified against source
by the orchestrator (file:line cited). NO fix applied; NO calibrator run. This is a findings report; the
fix/re-plan decision is deferred to the user.

Artifacts reviewed:
- eval/lz-eval-trap-assembler.mjs + .test.mjs (Task 1, KS-enrichment + 2-strata assembler)
- eval/lz-eval-voter-dispatch.workflow.mjs + .workflow.harness.test.mjs (Task 2, D-08 dispatch)
- eval/__fixtures__/lz-eval-manifest.json + eval/lz-eval-lock-rule.md (Task 3, pre-registration)
- eval/lz-eval-aggregate.test.mjs + eval/lz-eval-dataset.test.mjs (Task 3 anti-drift + drift-gate diffs)

## VERDICT

The KS-enrichment layer, the assembler, and the pre-registration (manifest + lock-rule + anti-drift
tests) are SOUND and well-tested. The dispatch Workflow's control-logic HELPERS are correct and
discriminatingly tested. BUT the Task-4 calibrator CANNOT run validly as built: the dispatch
Workflow's orchestration body is built around a model-interaction mechanic that is infeasible for real
subagents, and a second orchestrator mechanic (k votes/claim -> one pooled per-claim verdict) is
unimplemented. The calibrator spend is BLOCKED until these are reworked + re-proven.

Severity legend: CRITICAL (blocks a valid Task-4 run) / IMPORTANT (correctness or construct-validity
gap, not a hard blocker) / MINOR (cleanliness, reproducibility, false-assurance).

---

## CRITICAL

### C1 -- The dispatch Workflow cannot drive a construct-valid Task-4 run as built

A live voter subagent dispatched by the committed code gets no evidence, cannot run the JS search
spine, and cannot produce the trace the pipeline requires -> every vote drops -> the pool never fills
-> readDelta throws forever. Verified against source:

1. No evidence reaches the subagent. `lz-eval-voter-dispatch.workflow.mjs:222-225` passes `agent()`
   only `{model, effort, phase, label}` + `voterPrompt`. The prompt (`:171-176`) names the trap by id
   and asserts the cutoff is "ENFORCED by the harness adapter" -- but no claim text, no date-filtered
   docs, and no adapter reach the subagent.
2. A Claude subagent cannot run the JS spine. `lz-eval-search-loop.mjs:224-232`: `staticKsAdapter`
   retrieval is deterministic JS over `dateFilter(ksByClaim[claimId], claimDate)`, and `fetchResults`
   IGNORES the query (signature parity only). There is no way for a subagent to "run searchAndStop over
   the static-KS adapter."
3. `agent()` returns a STRING, not `{vote, trace}`. The proven contract: `lz-review-gate.workflow.mjs`
   treats every return as text (`:284` `parseReviewerSentinel(reviewed)` with `typeof text==='string'`;
   `:293` `String(packaged).slice(...)`). The dispatch (`:239-242`) expects `raw.vote`/`raw.trace`; with
   a string return, `trace` is null, and `toScoredVote` (`:89-104`) returns null -> the vote is dropped
   and re-cast. It passes NO `schema`; even a schema cannot make a subagent emit a genuine searchAndStop
   trace (queries/depth/stop_reason).
4. The shipped voter confirms the intended-but-absent mechanic. `research-verify-voter-sonnet.md:48`
   grants `["WebSearch","WebFetch","Write"]` (no `Read`); its design has the harness PACKAGE the
   claim+evidence into the prompt and the voter WRITE a vote file. In offline mode its WebSearch would
   hit the LIVE web = the D-05/D-07 leakage the eval forbids.
5. The lock-rule pre-registers the same infeasible arm. `lz-eval-lock-rule.md:98-99` pre-registers
   "Run Sonnet ... over the autonomous-search loop (NOT supplied evidence)." Because `staticKsAdapter`
   ignores the query (item 2), the model's query-formulation / stopping is NOT exercised in this seam at
   all -- so even the buried-stratum premature-stop failure mode the eval targets is not reached by a
   model-driven search.

Construct-valid realization (implied by the static adapter + the voter design, NOT in committed code):
the ORCHESTRATOR runs the frozen `searchAndStop` in JS per claim (deterministic retrieval + the real
{queries,depth,stop_reason} trace), inlines the date-filtered docs into the voter prompt (closed-book
style), and the voter does JUDGE-ONLY; the orchestrator assembles `{vote, trace}` and persists. None of
that is wired. (The "NOT supplied evidence" phrasing in the lock-rule is about the closed-book CONTROL
arm; inlining the deterministically-retrieved docs is the correct realization of the open-book arm here,
since the adapter ignores the query -- but this needs to be made explicit, as the buried-vs-evidence-
absent difficulty must still reach the model somehow.)

Provenance: independent reviewer afecb76 (PRIMARY VERDICT: not turn-key) + orchestrator source re-verify.

---

## IMPORTANT

### I1 -- The harness gives false confidence (16/16 green cannot catch C1)

Every mock `agent()` in `lz-eval-voter-dispatch.workflow.harness.test.mjs` returns a `{vote, trace}`
OBJECT (`:177,188,198,208,220,235,251,265,300`); it never feeds the real string return, so the test
structurally cannot detect C1. The harness's own COVERAGE BOUNDARY note (`:16-22`) concedes it proves
"ONLY the deterministic CONTROL LOGIC" and defers the KS-binding to "the Task-4 per-vote-trace
inspection on the real run" -- but you cannot inspect a trace that cannot be produced. This is the
Generator-self-evaluation blind spot (the same class the execute-phase post-merge gate warns about).

### I2 -- The k-votes/claim -> one pooled per-claim verdict reduction is unimplemented (+ the false-uphold-over-k rule is undefined)

`readDelta` (`lz-eval-offline-read.mjs:174-203`) reads ONE pooled record per claim per seat dir (nPooled
= claim count; the realized-count guard wants exactly nPooled records keyed by claim uid;
`countFalseUpholds` reads `rec.verdict` keyed by safeId(claim id)). The dispatch persists k votes per
claim keyed `seat-uid-k` (`voter-dispatch.workflow.mjs:122-124,207`). The reduction from k votes/claim
to the single pooled per-claim verdict readDelta consumes is NOT in committed code -- the harness test
HAND-ROLLS it (`harness.test:306-317`: "persist the k0 vote per claim, re-keyed to uid"). The semantics
that matter for the measurement -- is a claim a false-uphold if ANY of its k votes upholds, or the
MAJORITY? -- are undefined in code and (notably) NOT in the lock-rule. This is a load-bearing
measurement-definition gap, coupled to C1.

### I3 -- The assembler's classifySeed agreement guard is a tautology (dead code; false assurance)

`assembler.mjs:385-393` re-classifies the enriched KS via `classifySeed` and throws on a stratum
mismatch. But `classifySeed` (`traps.mjs:171-175`) returns 'buried' iff a surviving disconfirmer-flagged
doc exists, and the assembler attaches that flag at `deepestSurvivor` EXACTLY when `isBuried`
(`assembler.mjs:372-380`) and never otherwise. So `classified.stratum` always equals the assembler's own
decision -- the ContractError can never fire. It reads as a cross-check but verifies nothing (Phase-17
"fixture must discriminate" lesson, applied to a runtime guard). Real-corpus stratification correctness
is therefore unguarded by code; it rests on the BLIND validityProbe + the pre-registered manifest ranks.
Provenance: independent reviewer a42f488 + orchestrator source re-verify.

### I4 -- The >=5-survivor floor test is WEAK (boundary untested)

`trap-assembler.test.mjs:361-396` tests only a 4-survivor seed (one below the floor of 5). There is no
exactly-5 KEPT case proving the inclusive boundary, so an off-by-one regression (`<` -> `<=`) would still
pass. The floor is load-bearing (it guarantees nPooled >= reliableTrials=15 at k=5). Contrast: the
strict-`<` cutoff IS discriminatingly exercised (same-day doc dropped). Provenance: reviewer a42f488.

---

## MINOR

### M1 -- decisiveRank == disconfirmerRank == deepestSurvivor collapses two concepts onto one doc
`assembler.mjs:378-380` always sets both ranks to the same index. classifySeed reads only `disconfirmer`;
searchAndStop reads only `decisive`+`verdict`. Harmless functionally, but the manifest's "separately
recorded decisive/disconfirmer ranks" (Task 3) will record identical values -- thinner than the design
vocabulary implies.

### M2 -- recipeSeed/transform advances before screening
`assembler.mjs:355-357` advances `recipeSeed` before validityGate/validityProbe, so a screened-out seed
consumes a transform slot; the transform-to-claim mapping shifts under corpus changes. Deterministic, but
worth noting for pre-registration reproducibility.

### M3 -- maxInFlight documented but never honored
`voter-dispatch.workflow.mjs:187` documents `maxInFlight` in args; `pipeline(todo, stage)` (`:212`) never
reads it. Pacing relies on the platform pipeline cap + the orchestrator passing claimUid subsets, not on
the documented knob. The T-19-16 "pace-able" claim is unfulfilled at the arg level (not a correctness
bug; the orchestrator can still pace by batching claimUids).

---

## SOUND / VERIFIED (no action needed)

- KS-enrichment layer (`extractUrlDate`/`normalizeClaimDate`/`enrichKsForClaim`): frozen-primitive-safe
  (imports + composes; `parseAvtDate` still throws on '9-10-2020', test-asserted), fail-closed +
  future-guard, archive-inner, shared-mutation guard (NEW objects), flags non-text-derivable. No leak
  path: a wrong/out-of-range/future date returns null -> dropped, never survives the cutoff.
- The 2-strata assembler floors: `<5` survivors excludes a seed; `<3`/stratum throws (the per-stratum
  floor is discriminatingly tested at `trap-assembler.test:398-431`); date-sensitive never assembled
  (asserted).
- Validity screening is load-bearing in the unit suite: validityGate rejection (`test:433-455`) and the
  BLIND validityProbe rejection (`test:457-478`) each fail the whole set closed (discriminating).
- The dispatch SHARED helpers (`parseVoteVerdict`/`toScoredVote`/`voteId`/`remainingVotes`/
  `kFloorAtLeast`): correct; the scoring-reconciliation mapping is DISCRIMINATING at the helper level
  (`harness.test:130-144` -- model verdict wins over a differing searchAndStop trace enum); no-abstention
  re-cast, skip-already-done, k>=5 floor all discriminating.
- The F3/F4 resumability guard + the real persistVote no-abstention backstop: genuinely exercised against
  real driver code (`harness.test:280-371`).
- Pre-registration (manifest + lock-rule): consistent and complete -- date-sensitive EXAMPLE rows
  (0031/0032) removed, stratum DEFINITION kept + annotated DEFERRED-to-Phase-20; byte-locked URL_DATE_RULE
  (non-vacuous, verified); scoring reconciliation + no-abstention + strict-cutoff/>=5-survivor +
  deterministic seed selection all recorded; EVAL_THRESHOLDS byte-unchanged.
- Task-3 anti-drift tests are DISCRIMINATING: EVAL_THRESHOLDS-vs-prose byte-for-byte WITH an explicit
  negative ("a drifted ALPHA 0.10 must NOT be present", `aggregate.test:334-340`); CP(1,N) ceiling
  recomputed from the engine (`:342-357`); URL_DATE_RULE byte-lock with a verbatim-rule assertion
  (`:396-414`). Dataset W4 drift gate asserts EXACTLY two offline strata + date-sensitive absent, keeps
  the uid-coverage/no-text/recipe guards (`dataset.test:471-520`).

## ANTI-DRIFT REFACTOR (user note: "replace remaining anti-drift tests with the module-wrapped workflow test style")

No remaining lib-copy anti-drift tests exist to convert. Both workflow harnesses
(`lz-review-gate.workflow.harness.test.mjs:4`, `lz-eval-voter-dispatch.workflow.harness.test.mjs:4`)
ALREADY use the module-wrapped slice style ("no separate lib and no anti-drift proxy"); review-gate even
notes a former anti-drift test was already "folded in" (`:295`). The remaining "anti-drift" tests are
PROSE/MANIFEST <-> CODE byte-for-byte pre-registration checks (EVAL_THRESHOLDS-vs-lock-rule;
manifest-URL_DATE_RULE-vs-RegExp.source) -- a different, correct pattern that the workflow-slice style
does not fit (there is no workflow body to slice; the invariant is doc/JSON == code constant). Recommend
LEAVING them as-is. (If a specific test was meant, point at it.)

## UNPROVEN UNTIL THE REAL RUN (compounds C1 -- not separately fixable in code now)

- Genuine refutation of the depth-selected "decisive refuter": the assembler picks the buried refuter by
  surviving INDEX, not text; the BLIND validityProbe (stubbed-accept in every unit test) is the SOLE
  guarantor that the flagged doc actually refutes the mutated trap -- exercised only at the real run.
- Whether the `buried` stratum reaches >=3 screened claims under HONEST blind probing on the real corpus
  (62/122 seeds have >=5 strictly-pre-cutoff docs, median 5, p25 2; the `deepestSurvivor>=20` gate may
  starve buried). If not, `assembleStage1Traps` fails closed (correct) but blocks the run.
- Whether the assembler's dynamic depth-policy ranks agree with the manifest's pre-registered per-seed
  ranks (the agreement guard is a tautology, so this is unguarded -- I3).

## WHAT A FIX WOULD ENTAIL (for the deferred decision -- NOT executed)

1. Rework the dispatch so the ORCHESTRATOR runs the frozen `searchAndStop` in JS per claim (real
   retrieval + trace), inlines the date-filtered docs into the voter prompt (judge-only), assembles
   `{vote, trace}`, and persists -- OR redefine the dispatch around a judge-only `agent()` whose return
   is parsed as TEXT (no `{vote,trace}` object assumption) with the trace attached orchestrator-side.
2. Define + pre-register the k-votes/claim -> one pooled per-claim verdict reduction AND the
   false-uphold-over-k rule (any-uphold vs majority) in the lock-rule (I2).
3. Extend the harness to exercise the REAL string `agent()` return contract + an integration smoke over
   the real searchAndStop/staticKsAdapter (so I1 cannot recur), and convert the I3 tautological guard into
   a discriminating check (or remove it and rely on the probe + manifest ranks explicitly).
4. Strengthen the >=5-survivor boundary test (I4); optionally address M1-M3.
5. Re-prove green, re-confirm pre-registration unchanged, THEN run the Task-4 calibrator.

This is a gap in a committed deliverable; the GSD-canonical path is a gap-closure plan
(`/gsd:plan-phase 19 --gaps`) scoping 1-4 once, then execute, then resume Task 4. Sonnet-default ships
regardless of the eventual VOID/PASS outcome.
