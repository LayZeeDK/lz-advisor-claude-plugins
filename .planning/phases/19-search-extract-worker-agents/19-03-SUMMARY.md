---
phase: 19-search-extract-worker-agents
plan: 03
subsystem: testing
tags: [eval, averitec, clopper-pearson, trap-set, leakage-probe, pre-registration, retrieval-difficulty, node-test]

# Dependency graph
requires:
  - phase: 19-01
    provides: lz-eval-search-loop.mjs (parseAvtDate, dateFilter, SEARCH_DEFAULTS) reused by the trap recipe + leakage probe
  - phase: 18
    provides: the frozen eval engine (lz-eval-aggregate.mjs EVAL_THRESHOLDS/clopperPearsonUpper/lockRuleVerdict), the dataset loader (lz-eval-dataset.mjs), the pre-registered lock-rule prose, the 70-row manifest, the cross-tree hardening primitives (ContractError/stripBom/safeId)
provides:
  - "lz-eval-traps.mjs: the offline known-gold trap-construction recipe (mutateOverreach), the OQ-3 buried/evidence-absent classifier, the deliberately-weak-verifier validity gate, the GATING OQ-1 leakageProbe, the license-safe writeTrap, and verifySha256"
  - "the committed manifest's AVeriTeC open-book strata rows (2 buried / 2 evidence-absent / 2 date-sensitive) + the corrected averitec source entry (gated:false, repoType:model, pinned revision + per-file sha256)"
  - "the extended dataset drift gate covering the AVeriTeC rows (coverage + no-text + gated:false + single-source guards)"
  - "the re-registered EVAL-04 lock rule: pooled-n CP(1,N) formula ceiling + D-06 saturation pre-condition + VOID outcome + trap rules + PINNED mechanical minimums (minQueries=3/minDocs=5), with an anti-drift test"
affects: [19-04, phase-20-shadow-canary, eval-offline-read]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "screen-then-check leakage probe (exclude the seed's own declared leak URLs, then check the residue for a post-cutoff dated leak) -- a GATING pre-condition that blocks the manifest lock and escalates on a leak"
    - "recipe-not-text manifest rows (uid + remapped label + mutation recipe/seed + sha256, NEVER NC text) for CC-BY-NC corpora"
    - "pre-registration in the zero-votes window: pooled-n CP(1,N) formula ceiling reconciled with the per-claim DELTA_UPPER_MAX scalar (code wins, byte-for-byte anti-drift)"

key-files:
  created:
    - eval/lz-eval-traps.mjs
    - eval/lz-eval-traps.test.mjs
  modified:
    - eval/__fixtures__/lz-eval-manifest.json
    - eval/lz-eval-dataset.test.mjs
    - eval/lz-eval-lock-rule.md
    - eval/lz-eval-aggregate.test.mjs

key-decisions:
  - "OQ-1 probe semantics resolved as SCREEN-THEN-CHECK (Reading A): the screen REMOVES the seed's own fact_checking_article/cached_original_claim_url URLs; a leak is only flagged if it SURVIVES the screen (a post-cutoff DATED doc). The fact-checking GENRE is not flagged (an unrelated fact-check site in the dense web crawl is ordinary evidence, not a verdict leak) -- flagging it would falsely escalate 9/10 dev seeds."
  - "The real-seed OQ-1 probe returned CLEAN on the 10 Supported dev seeds (exit 0), so the manifest lock proceeded (no escalation)."
  - "AVeriTeC files[] pins the data/dev.json + data_store/dev_top_k_sentences.json sha256 (integrity guard) but NO corpus text -- mutated NC text stays gitignored in eval/.cache/."
  - "The DELTA_UPPER_MAX=0.25 scalar stays the per-claim-reliability anchor the engine enforces; the pooled-n CP(1,N) FORMULA (~0.0894/0.0677/0.0545 at N=60/80/100) is the recorded run-artifact ceiling. Both coexist; the code wins."

patterns-established:
  - "GATING pre-condition probe: a real task step (not prose) that blocks a downstream artifact lock and escalates to the user on failure"
  - "byte-for-byte anti-drift test that reads the pre-registered prose and cross-checks it against the frozen engine constants + a recomputed formula"

requirements-completed: [EVAL-01, EVAL-04]

# Metrics
duration: ~75min
completed: 2026-06-16
---

# Phase 19 Plan 03: Offline known-gold trap set + re-registered gate Summary

**The offline trap-construction recipe (one-step-overreach mutation + buried/evidence-absent/date-sensitive classifier + deliberately-weak-verifier validity gate + GATING OQ-1 leakage probe), the AVeriTeC open-book manifest lock (passed the real-seed leakage screen CLEAN), and the lock rule re-registered to the pooled-n CP(1,N) formula + D-06 saturation/VOID + pinned minimums minQueries=3/minDocs=5 -- all in the zero-votes window.**

## Performance

- **Duration:** ~75 min
- **Started:** 2026-06-16T18:30Z (approx, worktree spawn)
- **Completed:** 2026-06-16T19:45Z
- **Tasks:** 3
- **Files modified:** 6 (2 created, 4 modified)

## Accomplishments
- Authored `eval/lz-eval-traps.mjs` + FILE-form test (14/14): the one-step-overreach recipe flips a Supported seed gold to refuted (recipe-not-text); the OQ-3 classifier discriminates buried (pre-cutoff in-corpus disconfirmer ranked deep) vs evidence-absent; the validity gate accepts a weak-verifier flip and rejects a weak-verifier catch; the GATING OQ-1 `leakageProbe` discriminates leaky-vs-clean and gates the manifest lock; `writeTrap` emits NO text field and writes mutated text only under the gitignored cache; `verifySha256` fails closed.
- Ran the OQ-1 real-seed probe on the 10 Supported dev seeds: **CLEAN (exit 0)** -> the manifest lock proceeded (no escalation needed).
- Locked the AVeriTeC manifest: corrected the existing `averitec` source IN PLACE (gated:false + repoType:model per D-12, pinned revision `2ca9dee` + per-file sha256), added 6 open-book strata rows (2 buried / 2 evidence-absent / 2 date-sensitive) carrying uids + recipe with NO text; extended the dataset drift gate (24/24) for coverage + no-text + gated:false + single-source guards, WiCE assertions untouched.
- Re-registered the EVAL-04 lock rule in the zero-votes window: the pooled-n `clopperPearsonUpper(1,N_pooled,ALPHA)` formula ceiling, the D-06 saturation pre-condition + VOID third outcome, the trap-construction rules, and the PINNED mechanical minimums (minQueries=3 / minDocs=5, calibrator-tighten-only); added the byte-for-byte anti-drift test (aggregate 20/20).

## Task Commits

Each task was committed atomically:

1. **Task 1: Author lz-eval-traps.mjs trap recipe + OQ-1 leakage probe (TDD)** - `55a06a8` (feat)
2. **Task 2: Lock AVeriTeC manifest open-book strata + extend drift gate** - `22c1ba2` (feat)
3. **Task 3: Re-register the lock rule to pooled-n CP(1,N) + trap rules + minimums** - `181c557` (feat)

_Task 1 used TDD (RED: failing import; GREEN: implementation) in one feat commit after the cycle._

## Files Created/Modified
- `eval/lz-eval-traps.mjs` - trap-construction recipe (mutateOverreach, classifySeed/OQ-3, validityGate), the GATING OQ-1 leakageProbe (screen-then-check), writeTrap (recipe-not-text + cache-only), verifySha256, loadDevSeedsAndKs + a guarded `--probe` CLI (exit 2 on leak)
- `eval/lz-eval-traps.test.mjs` - 14 discriminating FILE-form tests (recipe flip, OQ-3 discriminate, validity gate accept/reject, leakage probe leaky/clean discrimination, no-text writer, tampered-buffer fail-closed)
- `eval/__fixtures__/lz-eval-manifest.json` - corrected the `averitec` source entry (gated:false/repoType:model/revision/sha256); added 6 open-book strata rows + the buried/evidence-absent/date-sensitive strata definitions
- `eval/lz-eval-dataset.test.mjs` - extended the drift gate with 4 AVeriTeC-coverage/no-text/gated:false/single-source/WiCE-unchanged tests
- `eval/lz-eval-lock-rule.md` - re-registered (zero-votes window): pooled-n CP(1,N) formula ceiling + DELTA_UPPER_MAX reconciliation + clustering caveat + D-06 saturation/VOID + trap rules + pinned minimums
- `eval/lz-eval-aggregate.test.mjs` - 5 anti-drift tests (prose vs EVAL_THRESHOLDS byte-for-byte; CP(1,N) ceiling table; zero-votes/VOID/minimums documented; ASCII-clean)

## Decisions Made
- **OQ-1 probe semantics (load-bearing, resolved without the advisor tool -- it was unavailable in this context).** The plan's literal wording ("after applying dateFilter + EXCLUDING fact_checking_article / cached_original_claim_url URLs from the KS ...") is Reading A (SCREEN-THEN-CHECK): the screen REMOVES the seed's own declared leak URLs; a leak is flagged only if it SURVIVES the screen (a post-cutoff DATED doc). An initial detect-presence implementation over-flagged: the dense AVeriTeC web crawl carries unrelated fact-check sites (e.g. a 2016 article on a different topic) that are ordinary evidence, not THIS claim's verdict; flagging the genre falsely escalated 9/10 dev seeds. Verified empirically: across all 122 Supported seeds, the only leak vectors are the seeds' OWN declared URLs (10 exact-match survivals, all removed by the screen) and ZERO dated KS docs -> the dev KS screens CLEAN under Reading A. The `cached_original_claim_url` is the archived CLAIM SOURCE (dated at the claim), not a verdict; it is excluded as conservative defense-in-depth, not because it is a leak.
- **The residual-fact-check host heuristic was REMOVED** (it conflated the fact-checking genre with a verdict leak). The genuine surviving-leak vector is the date arm (a dated post-cutoff doc); the synthetic discriminating tests use that.
- **DELTA_UPPER_MAX=0.25 reconciliation:** kept as the per-claim anchor the engine enforces; the pooled-n CP(1,N) formula is the recorded run-artifact label. Both coexist (State-of-the-Art note); the code wins.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Corrected the OQ-1 leakage-probe semantics to SCREEN-THEN-CHECK**
- **Found during:** Task 1 (running the real-seed probe)
- **Issue:** The first implementation flagged the mere PRESENCE of the seed's own fact_checking_article / cached_original_claim_url in the KS as a leak (detect-presence), which would escalate every seed whose source is archived in the KS, and a follow-on residual-fact-check heuristic over-flagged the fact-checking genre (9/10 dev seeds). This contradicts the plan's literal wording ("EXCLUDING ... URLs from the KS" = the screen) and the fact that cached_original_claim_url is the claim source, not a verdict.
- **Fix:** Reworked `leakageProbe` to remove the seed's own declared URLs (the screen) and report a leak only if a post-cutoff DATED doc survives; removed the genre heuristic; updated the synthetic discriminating tests to use the date arm.
- **Files modified:** eval/lz-eval-traps.mjs, eval/lz-eval-traps.test.mjs
- **Verification:** 14/14 trap tests green (probe discriminates leaky-vs-clean); the real-seed 10-seed probe returns CLEAN (exit 0).
- **Committed in:** 55a06a8 (Task 1 commit)

**2. [Rule 2 - Missing Critical] Pinned the AVeriTeC revision from the cached HF download metadata**
- **Found during:** Task 2 (manifest lock)
- **Issue:** The existing averitec source carried `revision: PENDING_ENUMERATE_AT_EVAL_TIME`; locking the manifest requires the real cached revision + per-file sha256 (the integrity guard) per the plan.
- **Fix:** Read the HF download metadata (`.cache/.../download/*.metadata`) for the commit revision `2ca9dee23a2a6fa64c5bd918e0cd28ed0aa09031`; computed sha256 of `data/dev.json` + `data_store/dev_top_k_sentences.json` (both verified to match the cached bytes); pinned them in the source `files[]`.
- **Files modified:** eval/__fixtures__/lz-eval-manifest.json
- **Verification:** A round-trip sha256 recompute against the cached bytes MATCHES both files; the drift gate (24/24) asserts gated:false + valid 64-hex sha256.
- **Committed in:** 22c1ba2 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 missing-critical)
**Impact on plan:** Both essential. Deviation 1 is the load-bearing correctness fix for the OQ-1 gate (a wrong reading would have falsely escalated and blocked the lock); deviation 2 supplies the manifest's required pinned integrity metadata. No scope creep.

## Issues Encountered
- **Worktree gitignored-state gaps.** The AVeriTeC `eval/.cache/` and `eval/node_modules/` are gitignored and absent in a fresh worktree. Resolved: ran `cd eval && npm ci` (restored jstat@1.9.6 from the committed lockfile); pointed the OQ-1 probe + sha256 computation at the MAIN worktree's cache (`D:/.../lz-advisor-claude-plugins/eval/.cache/chenxwh__AVeriTeC`), which is the dev-only, never-committed corpus the eval reads at construction time.
- **Single-digit-day claim_date.** The frozen `parseAvtDate` (DD-MM-YYYY, two-digit day) throws on a seed with `"9-10-2020"`. This does NOT affect the load-bearing 10-seed OQ-1 screen (those 10 parse cleanly). Flagged for Plan 04 (the calibrator builds the full N=60-100 set) -- the frozen parser was not modified.

## OQ Resolutions (settled + documented)
- **OQ-1 (leakage cleanliness):** RESOLVED via the GATING probe. Real-seed screen CLEAN (10 Supported dev seeds, exit 0) -> manifest locked. Semantics: SCREEN-THEN-CHECK (exclude the seed's own leak URLs, flag only a surviving post-cutoff dated doc). No escalation needed.
- **OQ-2 (mechanical minimums):** RESOLVED. minQueries=3 / minDocs=5 PINNED in the re-registered lock rule (zero-votes window); calibrator may only TIGHTEN, never loosen. They are search-loop params (SEARCH_DEFAULTS), NOT EVAL_THRESHOLDS keys.
- **OQ-3 (in-corpus disconfirmer classification):** RESOLVED. `classifySeed` mechanically classifies buried (a pre-cutoff in-corpus disconfirmer ranked deep) vs evidence-absent (none); a post-cutoff disconfirmer is excluded and cannot make a seed buried. The classifier discriminates (proven by the test).

## Known Stubs
None that block the plan goal. The `liveWebSearchAdapter` (Plan 19-01) is a documented protocol-shape stub (the agent realizes WebSearch at runtime) -- out of scope here. The 6 manifest open-book rows carry the mutation recipe/seed; the actual mutated PROSE is generated out-of-family at construction time (Plan 04) into the gitignored cache -- by design (recipe-not-text, D-07), not a stub.

## Next Phase Readiness
- The trap recipe + classifier + validity gate + GATING leakage probe are ready for Plan 04 (the Sonnet-as-calibrator step + the offline read). The lock rule is pre-registered (zero-votes window) so any Plan-04 vote is governed by a genuine pre-registration.
- Plan 04 must build the full N=60-100 trap set (handle single-digit-day claim_dates), run the D-06 Sonnet-below-ceiling saturation pre-condition per stratum, and produce PASS / FAIL-RAISE / VOID (settle-OR-raise).

## Self-Check: PASSED

- Created files exist: eval/lz-eval-traps.mjs, eval/lz-eval-traps.test.mjs, 19-03-SUMMARY.md (all FOUND)
- Modified files exist: lz-eval-manifest.json, lz-eval-dataset.test.mjs, lz-eval-lock-rule.md, lz-eval-aggregate.test.mjs (all FOUND)
- Commits exist: 55a06a8, 22c1ba2, 181c557, 3fe65af (all FOUND)
- Full eval suite green: 87 tests (traps 14, dataset 24, aggregate 20, search-loop, packaging-boundary), plugin-tree aggregator 39
- OQ-1 real-seed probe CLEAN (exit 0); no NC text committed; all committed bytes ASCII

---
*Phase: 19-search-extract-worker-agents*
*Completed: 2026-06-16*
