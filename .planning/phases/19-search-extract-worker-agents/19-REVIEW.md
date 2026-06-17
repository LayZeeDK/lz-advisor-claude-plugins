# Phase 19 -- Code Review (REVIEW.md)

Post-execution code-quality review of the Phase-19 eval modules via the hardened **review gate**
(Design-B Workflow: Sonnet executor packages verbatim excerpts -> `lz-advisor:reviewer` on Opus/high
classifies + reports coverage -> loops until no missed surfaces -> Opus/high synth consolidates).
Run PACED, one coupling group per dispatch.

> METHODOLOGY NOTE: the review-gate reviewer reasons from the executor's PACKAGED EXCERPTS (it does
> NOT re-read source). Every finding below was independently TRIAGED against the actual source file by
> the orchestrator; misreads are dismissed with written reasoning. Triage verdicts (CONFIRMED /
> OVERSTATED / DISMISSED) are the orchestrator's, not the gate's.

## Coverage status

| Group | Coupling chain | Files | Status |
|-------|----------------|-------|--------|
| A | search-loop API surface | `lz-eval-search-loop.mjs` + `lz-eval-offline-read.mjs` + `lz-eval-traps.mjs` | REVIEWED (this doc) |
| B | safeId guard + aggregate->offline-read | `lz-eval-aggregate.mjs` + `lz-eval-offline-read.mjs` + `lz-eval-dataset.mjs` | PENDING (next paced run) |

`assertManifestCoverage` over the full partition [A, B] = ok (every coupling chain co-located in one
group; `offline-read` is the hub, reviewed in both).

---

## Group A -- search-loop API surface (19-01 anchored)

Gate run: `wf_35de4770-bd1`; converged in **1 round**; 3 agents; ~158.6k subagent tokens; 5 tool uses.
`severityDropDiff(roundLogs, report)`: reviewerHighCount=2 (block-coalesced; the reviewer listed
findings without blank-line separators so the diff treats each `###` section as one block),
droppedCount=0, **dropDetected=false** -- the Opus-high synth preserved all findings verbatim
(orchestrator-verified: synth findings 1-14 are byte-identical to the reviewer's).

### Triaged findings

| # | Gate severity | Triage | Adjusted | Location | Finding (triaged) |
|---|---------------|--------|----------|----------|-------------------|
| F1 | Critical | CONFIRMED (latent today / live defect) | Critical | `lz-eval-search-loop.mjs:286-301` | `searchAndStop` evaluates `hasDecisiveEvidence`/`judge` on the CURRENT batch only. Under `staticKsAdapter` every batch is identical so it never bites today, but the line-253 comment commits this core to the Phase-20 `liveWebSearchAdapter` (per-query variance), where an early decisive doc found before the minimums are met is lost -> wrong verdict. Fix: accumulate a running doc pool and judge over the pool, OR contractually constrain the live adapter to stable cumulative returns. F14 resolves in favor of this being a real live-path defect. |
| F2 | Important | OVERSTATED | Suggestion | `lz-eval-search-loop.mjs:244-248` | `judge`'s `'refuted-default'` fallback is UNREACHABLE: it is only called behind `hasDecisiveEvidence`, whose predicate is identical to `judge`'s `.find`. A dead defensive branch with a confusing value choice (collides with the exhausted-loop verdict for a fixture author). Reviewer self-downgraded. Optional: throw `ContractError` instead of the dead fallback. |
| F3 | Important | CONFIRMED (= probe-bug #2) | Important | `lz-eval-search-loop.mjs:83-87` | `TRACKING_PARAMS.has(k)` is case-sensitive while the `utm_` arm is case-insensitive; `?FBCLID=`/`?Ref=` survive canonicalization -> divergent SHA-256 dedup keys (breaks the dedup invariant). Fix: `TRACKING_PARAMS.has(k.toLowerCase())`. |
| F4 | Important | CONFIRMED guard-gap (fix debatable) | Important | `lz-eval-offline-read.mjs:199-201` | `reliableTrials===0` passes the `< 0` guard and feeds a degenerate `clopperPearsonUpper(x,0,alpha)` -> a garbage `subtleOpenBookDeltaUpper` LABEL in the artifact. Weaker than `calibratorGate`'s `>= MIN_K` guard. CANNOT cause a false PASS (`lockRuleVerdict` requires `reliableTrials >= 15`). Minimal fix: reject `< 1`; the reviewer's `< RELIABLE_TRIALS` over-constrains (would block legitimate partial-run reads). |
| F5 | Important | DISMISSED (misread) | -- | `lz-eval-search-loop.mjs:191-207` | `staticKsAdapter` is a PER-CLAIM factory: `claimId`/`claimDate` are bound at construction by design and `fetchResults(query)` has no claim parameter, so there is no accidental cross-claim "stale cutoff" path. The proposed "bind + verify on fetchResults" fix has nothing to verify against. Optional: a one-line comment stating single-claim lifetime. No code change. |
| F6 | Important | CONFIRMED (forward-looking) | Important | `lz-eval-offline-read.mjs:356-360` vs `search-loop.mjs:304-314` | Verdict-vocabulary mismatch: `searchAndStop` emits `refuted-default`/`insufficient`/doc-verdict while `persistVote` accepts only `{refuted,unrefuted}`. The normalization is AGENT-SIDE (the D-08 Workflow, not yet written), so no present code does the throwing hand-off -- but it is a real contract to document + enforce at the boundary before the Phase-20/19-04 wiring. |
| F7 | Important | CONFIRMED | Important | `lz-eval-traps.mjs:230-241` | `normalizeUrlForCompare` (host+path, www/trailing-slash/case) does NOT unwrap an archive-wrapper prefix, so the comment's claim that an "archive-wrapper variant of the SAME URL is matched" is false on the LOAD-BEARING `leakageProbe` screen. An undated archive-wrapped own-fact-check could slip the exact-URL screen (date arm is inert on undated dev KS). Fix the comment (accurate scope) and/or unwrap known archive prefixes. |
| F8 | Important | OVERSTATED | Suggestion | `lz-eval-traps.mjs:88-121` | `mutateOverreach` validates everything except `seed.claim_id`, so `uid_seed: undefined` can be produced. But it does NOT silently corrupt the manifest -- `writeTrap` fails CLOSED on a non-string `uid` (`typeof trap.uid !== 'string'` throws before `safeId`). Cheap consistency fix: add a `claim_id` presence guard at the source for a clearer error. |
| F9 | Suggestion | LOW (fix needs adjustment) | Suggestion | `lz-eval-traps.mjs:158-165` | `classifySeed` calls `dateFilter([d], cd)` per doc (singleton allocations + unit-array coupling). The proposed `safeParse(d.date) < cd` inline is not directly available: `safeParse` is module-private to `search-loop.mjs` (only `parseAvtDate`/`dateFilter` are exported). Low priority. |
| F10 | Suggestion | CONFIRMED | Suggestion | `lz-eval-offline-read.mjs:209-231` | No assertion `sonnetFalseUpholds <= nPooled`; a superset vote dir drives `sonnetCorrect` negative into `passAtK`. Add a post-count `ContractError`. |
| F11 | Suggestion | DISMISSED | -- | `lz-eval-search-loop.mjs:320-325` | `formulateDisconfirmingQuery` builds a `:`-delimited label, but the query string is stored VERBATIM in the JSON trace and nothing parses it back by `:`/newline. No "trace parsing" corruption exists. Non-issue. |
| F12 | Suggestion | CONFIRMED | Suggestion | `search-loop.mjs:333-347` (+`offline-read:75-89`, `traps:386-400`) | `readJson` is triplicated (each a deliberate copy of the runtime aggregator shape). DRY: export once from the spine and import in the two consumers. Minor drift risk. |
| F13 | Suggestion | NON-FINDING | -- | `lz-eval-search-loop.mjs:104-111` | Reviewer confirms `sourceFilename` guard is correct as-is. No action. |
| F14 | Question | ANSWERED | -- | `lz-eval-search-loop.mjs:253` | Is the live adapter constrained to the static adapter's fixed-return property? NO -- the Phase-20 `liveWebSearchAdapter` returns varying per-query results, so F1 IS a live-path defect (not theoretical). |

### Cross-cutting (reviewer, retained)

Findings 6/7 (and the dismissed-or-downgraded 5/8) cluster as unfenced module-boundary contracts
(verdict vocabulary, URL-equivalence claim, output-shape promotion). The genuinely actionable core of
that cluster is F6 (verdict vocab) + F7 (URL-equivalence comment). F1/F2 are the same
accumulate-vs-slice / verdict-collision theme inside `searchAndStop`.

---

## Known probe-bugs (prior-session analysis) -- gate independent-coverage map

The handoff carried 4 suspected bugs to confirm during the `gsd-code-review` pass. The review gate was
NOT primed with them (independent discovery preserved). Coverage:

| Probe-bug | Gate surfaced it? | Orchestrator source-check | Disposition |
|-----------|-------------------|---------------------------|-------------|
| Case-sensitive tracking-param denylist | YES (F3) | CONFIRMED real | Fix in task 2 (`has(k.toLowerCase())`). |
| `searchAndStop {minQueries:0,minDocs:0}` floor bypass | NO | CONFIRMED real -- nothing enforces params meet the frozen `SEARCH_DEFAULTS` floor; `q+1>=0 && docsSeen>=0` always true -> mechanical-minimum guard bypassed | Add to task-2 scope: clamp/validate `minQueries`/`minDocs` to the frozen floor (the "tighten-only, never loosen" contract is currently a comment, not enforced). |
| `parseAvtDate` no value-range check | NO | CONFIRMED real -- `/^\d{2}-\d{2}-\d{4}$/` then `Date.UTC(...)`; `"99-99-2020"` rolls over instead of throwing | Add to task-2 scope: range-check month 1-12 / day 1-31 (and reject `Number.isNaN(getTime())`). |
| `canonicalizeUrl` trailing-slash strip on the SERIALIZED url | NO | Subtler -- strip runs on `u.toString()` after the root slash is re-added; needs a targeted dedup-key probe | Verify in task 2. |

The gate's value here was the NEW findings outside the probe list (F1 live-path pool defect, F6/F7
boundary-contract gaps), complementary to the `gsd-code-review` probe pass.

---

## Recommended fix scope (feeds task 2 / the fixer)

CONFIRMED, fix:
- F3 (case-insensitive tracking match) -- also probe-bug #2.
- F1 (pool accumulation OR live-adapter return contract) -- highest-value; protects the Phase-20 reuse.
- F7 (correct the `normalizeUrlForCompare` comment; consider archive unwrap on the leak screen).
- F4 (reject `reliableTrials < 1`).
- F10 (`sonnetFalseUpholds <= nPooled` assertion), F12 (de-duplicate `readJson`).
- Probe-bugs #3 (floor enforcement) + #4 (date range check) -- confirmed real this session.

OPTIONAL / low:
- F2 (replace dead `'refuted-default'` fallback with a throw), F8 (source-side `claim_id` guard),
  F9 (micro-perf), F5 (single-claim lifetime comment only).

DISMISSED (no change): F5 (core claim), F11, F13.

---

## Group A -- fix status (landed)

Confirmed Group-A fixes landed on `feat/deep-research` (eval-tree only; shipped plugin tree untouched;
144 eval tests green, 0 fail; all changed sources strictly ASCII):

| Commit | Findings fixed |
|--------|----------------|
| `9827417` fix(19): harden search-loop spine | **F1** decisive-doc pool (judge over accumulated docs, not the batch); **F3** case-insensitive tracking-param match; **probe #3** positive-integer guard on minQueries/minDocs/maxQueries (closes the `{0,0}` bypass without enforcing the frozen floor, which tests legitimately drive below); **probe #4** UTC round-trip range-check in `parseAvtDate`+`safeParse`. +4 tests. |
| `d532a81` fix(19): harden offline-read guards | **F4** `reliableTrials < 1` guard (degenerate `clopperPearsonUpper(_,0,_)`); **F10** false-uphold-count `> nPooled` fail-closed. +2 tests. |
| `715528c` fix(19): correct normalizeUrlForCompare comment | **F7** comment corrected to its real scope + named the archive-wrapper limitation (load-bearing `leakageProbe` screen). Comment-only. |

Triage refinements proven against the tests (why source-triage is mandatory):
- **F4** -- the reviewer's proposed `< RELIABLE_TRIALS` guard would break `offline-read.test.mjs:234` (a deliberate `reliableTrials:10` partial-run read). Implemented `< 1` instead.
- **Probe #3** -- strict frozen-floor enforcement would break `search-loop.test.mjs` (a deliberate `{minQueries:2,minDocs:3}` sub-floor test). Implemented positive-integer validation; the "tighten-only" floor stays a production-binding contract.

NOT fixed this pass (with rationale):
- **F12** (readJson de-dup) -- DEFERRED to after Group B. The duplication actually spans 5 modules
  (incl. the Group-B files `aggregate`+`dataset`), not the 3 the reviewer saw; a partial 3-file de-dup
  would add coupling without resolving it. De-dup all 5 into a shared eval helper once Group B is in
  scope.
- **F2, F8** (OVERSTATED) -- optional consistency tweaks (dead-fallback throw; source-side `claim_id`
  guard). Not bugs; `writeTrap`/the guard already fail closed. Left as-is.
- **F9** (LOW) -- micro-perf; the proposed `safeParse` inline isn't importable. Left as-is.
- **F5, F11, F13** (DISMISSED) -- no change.
- **F6** (forward-looking) -- verdict-vocabulary boundary; enforce when the agent-side Phase-20/19-04
  wiring is written (no present code does the throwing hand-off).
- **Probe #1** (canonicalizeUrl serialized-URL trailing-slash) -- on source inspection this is correct,
  intended trailing-slash-insensitive dedup behavior (the strip only ever removes a path trailing slash;
  query/fragment cannot follow). NOT a confirmed defect; no fix.

Remaining Step-1 work: **Group B** review (aggregate + offline-read + dataset), then `gsd-code-review 19`
as the complementary cheap probe pass, then the 19-04 gating read.
