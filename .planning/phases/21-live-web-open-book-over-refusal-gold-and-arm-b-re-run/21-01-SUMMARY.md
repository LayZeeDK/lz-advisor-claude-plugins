---
phase: 21-live-web-open-book-over-refusal-gold-and-arm-b-re-run
plan: 01
subsystem: testing
tags: [eval, certification, clopper-pearson, over-refusal, averitec, two-sided-reclassify, node-test, zero-dep]

# Dependency graph
requires:
  - phase: 20-orchestrator-skill-headless-scale-confirmation
    provides: "rejudication-lib.mjs (reclassify + decideScopedSensitivity + consensusLabel), oof-transport-lib.mjs (isCliEntry), lz-eval-aggregate.mjs (clopperPearsonUpperOneSided + EVAL_THRESHOLDS), the frozen 30 confirmed_uids + the frozen Sonnet votes/sonnet/ctrl/"
provides:
  - "openbook-lib.mjs: pure no-I/O units -- mapAveritecToBinary (4-way AVeriTeC -> frozen binary), isMetaSource/filterMetaSources (D-07 meta-source blocklist enforcement gate), cohenKappa + evidenceJaccard (D-08 separate reporting)"
  - "openbook-rescore.mjs: the NO-SPEND two-sided re-score driver -- loadFrozenVotes (fail-closed, keyed by canonical trace.uid), buildVoterRefutedSet, rescore (frozen-N fail-closed), composeVerdict (frozen CP gate -> SCOPED/DOES-NOT-WORK/VOID-on-power-RAISE)"
  - "FILE-form, mutation-verified node:test suites for both scripts (35/35 green)"
affects: [21-02, 21-03, 21-04, 21-05, openbook-retrieval-log, openbook-oof-gold]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Reuse the frozen rejudication pipeline (reclassify + decideScopedSensitivity) BYTE-IDENTICAL by import; only compose the Phase-21 disposition on top"
    - "Off-model deterministic 4-way -> binary collapse (the model emits a 4-way AVeriTeC label; the binary is ours, FILE-form tested)"
    - "Meta-source blocklist as a documented reviewed denylist (host substrings + path patterns) -- an enforcement gate, not a model judgment"
    - "Frozen-N anti-optional-stopping: rescore fails closed on a grown/shrunk denominator or a missing vote"

key-files:
  created:
    - "eval/.cache/p21-live/openbook-lib.mjs (gitignored)"
    - "eval/.cache/p21-live/openbook-lib.test.mjs (gitignored)"
    - "eval/.cache/p21-live/openbook-rescore.mjs (gitignored)"
    - "eval/.cache/p21-live/openbook-rescore.test.mjs (gitignored)"
  modified: []

key-decisions:
  - "Rescore keys the frozen votes by the canonical trace.uid ('::'-joined, matches confirmed_uids + the gold), not the '__'-joined filename id field -- so the join to the frozen denominator + the open-book gold is exact (Rule 3 deviation)"
  - "Tested CP anchors against the ACTUAL frozen values: CP(0,30)=0.095 PASS, CP(1,30)=0.1486 PASS, CP(2,30)=0.1953 BREACH (the plan's ~0.117 for 0/30 was an approximation; PASS/PASS/BREACH pattern holds byte-identical)"
  - "composeVerdict maps to SCOPED-sensitivity-only / DOES-NOT-WORK / VOID-on-power-RAISE; full WORKS is never emitted (arm A structurally void, D-11)"

patterns-established:
  - "Pattern 1: compose the Phase-21 verdict from the frozen decideScopedSensitivity power-band + passCp, never re-derive the CP math"
  - "Pattern 2: two-sided denominator recompute -- a NOT-SUPPORTED gold label drops the control from validN (the construct-mismatch rescue), surfaced via the imported reclassify"

requirements-completed: [OBG-02, OBG-05, OBG-07, OBG-09]

# Metrics
duration: 35min
completed: 2026-06-22
---

# Phase 21 Plan 01: Deterministic open-book over-refusal certification core Summary

**The NO-SPEND certification arithmetic for the open-book over-refusal re-run: `openbook-lib.mjs` (4-way->binary map + meta-source blocklist + kappa/Jaccard) and `openbook-rescore.mjs` (two-sided re-score of the frozen 30 + the frozen Clopper-Pearson gate), both FILE-form test-locked at 35/35 with mutation-verified discrimination on the over-refusal numerator AND the two-sided denominator recompute.**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-06-22T00:44:00Z (approx)
- **Completed:** 2026-06-22T00:55:00Z (approx)
- **Tasks:** 2 (both TDD)
- **Files modified:** 4 created (all gitignored under eval/.cache/p21-live/)

## Accomplishments
- `openbook-lib.mjs` exports the four pure, side-effect-free units the open-book gold + rescore share: `mapAveritecToBinary` (supported->SUPPORTED, refuted->NOT-SUPPORTED, NEI/conflicting/unknown->RESIDUE fail-safe), `isMetaSource`/`filterMetaSources` (D-07 reviewed denylist of host substrings + path patterns; drops own fact-check / leaderboard / dataset-benchmark pages, preserves order + fetched_at on survivors), `cohenKappa` and `evidenceJaccard` (D-08 separate reporting, never gated).
- `openbook-rescore.mjs` implements the two-sided re-score over the FROZEN 30: `loadFrozenVotes` (fail-closed; keyed by the canonical `trace.uid`; a non-{unrefuted,refuted} verdict or missing uid throws), `buildVoterRefutedSet`, `rescore` (frozen-N fail-closed against a grown/shrunk arm or a missing vote; wires the imported byte-identical `reclassify` with `sampleUids = all 30` so `nUnReadjudicated` collapses to 0 and `validN = supportedInSample`), and `composeVerdict` (the frozen CP gate via `decideScopedSensitivity` -> the Phase-21 disposition, no WORKS).
- Both FILE-form `node:test` suites pass (19 + 16 = 35/35) and are empirically proven discriminating: 4 distinct mutations (flip the 4-way mapping row, flip the blocklist disposition, flip the pass/breach verdict, collapse NOT-SUPPORTED->SUPPORTED) each turned the suite RED, then were restored to GREEN.
- Zero spend, zero network: importing either script triggers no dispatch (`isCliEntry` guard verified -- the import wrote no result file); no `LZ_SPEND` / `copilot` / `child_process` / `WebSearch` / `WebFetch` / `fetch(` primitive in either new script. Frozen tracked seam `lz-eval-aggregate.mjs` byte-identical (empty `git diff`); the imported gitignored seams `rejudication-lib.mjs` + `oof-transport-lib.mjs` untouched (mtimes predate this session).

## Task Commits

This plan's deliverables live under gitignored `eval/.cache/p21-live/` (the Phase-20 live-cert pattern), so there are NO per-task tracked commits -- the four scripts persist on the working tree on disk and are intentionally NOT committed (the sequential-execution contract). The only tracked artifact for this plan is this SUMMARY.

1. **Task 1: openbook-lib.mjs -- pure deterministic units** - TDD (test RED -> impl GREEN); gitignored, not committed. 19/19 FILE-form green; mutation-verified (refuted->SUPPORTED flip -> RED; filter-disposition flip -> 3 RED).
2. **Task 2: openbook-rescore.mjs -- two-sided re-score + frozen CP gate** - TDD (test RED -> impl GREEN); gitignored, not committed. 16/16 FILE-form green; mutation-verified (pass/breach disposition flip -> 2 RED; NOT-SUPPORTED->SUPPORTED collapse -> 2 RED).

**Plan metadata:** the docs commit captures this SUMMARY + STATE.md + ROADMAP.md.

## Files Created/Modified
- `eval/.cache/p21-live/openbook-lib.mjs` (gitignored) - the four pure units (4-way->binary, meta-source blocklist, kappa, Jaccard); no fs/network/random; ASCII-only, no BOM.
- `eval/.cache/p21-live/openbook-lib.test.mjs` (gitignored) - 19 FILE-form discriminating tests for the pure units.
- `eval/.cache/p21-live/openbook-rescore.mjs` (gitignored) - the no-spend two-sided re-score driver + frozen CP gate; `isCliEntry`-guarded dispatch; imports `reclassify`/`decideScopedSensitivity` byte-identical.
- `eval/.cache/p21-live/openbook-rescore.test.mjs` (gitignored) - 16 FILE-form discriminating tests for the two-sided recompute + CP anchors + frozen-N fail-closed.

## Decisions Made
- **uid key choice (canonical `trace.uid`):** the frozen vote files carry two id forms -- a `'__'`-joined `id` (the safeName filename stem) and the canonical `'::'`-joined `trace.uid` that matches `armB-oof-gold-result.json` `confirmed_uids` AND the open-book gold. `loadFrozenVotes` keys by `trace.uid` so the join to the frozen denominator + the gold is exact; the `'__'` id is filesystem-only. The plan's behavior text said "read the uid from the JSON record's `id` field" -- but the `id` field is `'__'`-joined and would NOT match the `'::'`-joined gold/confirmed keys, which would break the join. Resolved as a Rule 3 (blocking-issue) fix: use the field that actually keys to the gold. The vote dir remains a FIXED constant path and the uid is consumed as an opaque Map key only (no filesystem path is built from a content-derived uid, so `safeId` is correctly not imported -- consistent with T-21-02).
- **CP anchors tested against the real frozen values:** the plan referenced CP(0,30)~=0.117, but the frozen `clopperPearsonUpperOneSided(0,30)` is 0.095. Both are well under TAU_OR 0.15, so the required PASS/PASS/BREACH pattern (0/30 PASS, 1/30 PASS, 2/30 BREACH) holds byte-identical; the test asserts equality against the live frozen primitive rather than a hard-coded approximation.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Vote uid keyed by canonical `trace.uid`, not the `id` field**
- **Found during:** Task 2 (openbook-rescore loadFrozenVotes)
- **Issue:** The plan's behavior block says each uid is "read from the JSON record's `id` field." On disk, the frozen vote records carry `id` in the `'__'`-joined safeName form (e.g. `montreal-protocol-ozone__cluster40`), but `confirmed_uids` and the open-book gold use the `'::'`-joined canonical form (e.g. `montreal-protocol-ozone::cluster40`). Keying the rescore Map by the `'__'` `id` would make every uid miss the frozen denominator + the gold, silently producing an empty/zero join.
- **Fix:** `loadFrozenVotes` keys by `rec.trace.uid` (the canonical `'::'` form), fail-closed if `trace.uid` is absent. The vote dir is still a fixed constant path and the uid is an opaque Map key only (no path built from a content-derived uid).
- **Files modified:** eval/.cache/p21-live/openbook-rescore.mjs (+ its test, which writes both id forms in the fixture and asserts the canonical key).
- **Verification:** `loadFrozenVotes reads each record keyed by the canonical :: uid (trace.uid)` test passes; the frozen-N join tests pass.
- **Committed in:** N/A (gitignored; persists on disk).

---

**Total deviations:** 1 auto-fixed (1 blocking).
**Impact on plan:** The fix is required for correctness -- it is the only way the re-score joins to the frozen denominator + the open-book gold. No scope creep; the vote dir + opaque-key + fail-closed contract is preserved.

## Issues Encountered
- None beyond the uid-key deviation above. Inline `node -e` mutation scripting hit the documented Git-Bash quote/`$()` expansion hazard (CLAUDE.md); switched to Edit-tool-driven mutations for the discrimination proofs, which is cleaner and leaves no temp-file residue.

## Known Stubs
None. Both scripts are complete pure-logic implementations; the metered open-book gold (`openbook-gold-result.json`) that `openbook-rescore.main()` reads is produced by a LATER plan (21-03/21-05) -- this is the intended cross-plan boundary, not a stub. The `main()` dispatch is correctly guarded so importing the rescore (the only thing this plan exercises) never reads a not-yet-produced gold.

## User Setup Required
None - no external service configuration required (this plan is pure no-spend deterministic code + tests).

## Next Phase Readiness
- The deterministic certification core is built and test-locked BEFORE any retrieval or metered spend, exactly as the construct-fix discipline (D-10/D-13) requires: the verdict will be computed against a frozen gold with no result-shopping latitude.
- Ready for: the open-book retrieval-log builder (`openbook-retrieval-log.mjs`) + the metered OOF gold driver (`openbook-oof-gold.mjs`) in subsequent plans, which produce the `openbook-gold-result.json` that `openbook-rescore.main()` consumes.
- No blockers. Frozen seams verified byte-identical; arms never pooled; the frozen N is enforced fail-closed.

## Self-Check: PASSED

- All 4 gitignored scripts present on disk + this SUMMARY present (5/5 FOUND).
- Both FILE-form suites green together: 35/35 (openbook-lib 19 + openbook-rescore 16).
- Mutation discrimination demonstrated on all 4 fronts (mapping flip, blocklist disposition flip, CP pass/breach flip, NOT-SUPPORTED->SUPPORTED collapse) -> RED, then restored GREEN.
- Frozen tracked seam `lz-eval-aggregate.mjs` byte-identical (empty git diff); imported gitignored seams untouched.
- No tracked code commit for the scripts (gitignored, intended); the SUMMARY is the tracked artifact.

---
*Phase: 21-live-web-open-book-over-refusal-gold-and-arm-b-re-run*
*Completed: 2026-06-22*
