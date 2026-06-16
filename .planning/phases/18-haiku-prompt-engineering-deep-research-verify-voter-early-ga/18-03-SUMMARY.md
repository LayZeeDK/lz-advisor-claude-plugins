---
phase: 18-haiku-prompt-engineering-deep-research-verify-voter-early-ga
plan: 03
subsystem: testing
tags: [jstat, clopper-pearson, pass-at-k, false-uphold, eval, node-test, lock-rule]

# Dependency graph
requires:
  - phase: 18-02
    provides: "eval/ install surface (eval/package.json + committed eval/package-lock.json pinning jstat@1.9.6; eval/node_modules gitignored) + D-11 packaging-boundary tests + eval-tree CI gate"
  - phase: 16
    provides: "the SHIPPED runtime aggregator lz-deep-research-aggregate.mjs exporting ContractError/stripBom/safeId/listJson (imported cross-tree, one-directional)"
  - phase: 17
    provides: "the frozen vote-record verdict enum (unrefuted|refuted) the false-uphold counter scores against gold"
provides:
  - "eval/lz-eval-aggregate.mjs: the deterministic off-model gate engine -- Pass@1/Pass^k (jStat.combination), per-stratum false-uphold (verdict-vs-gold, off-model), Haiku-minus-Sonnet DELTA, Clopper-Pearson/Wilson upper bound (jStat.beta.inv/normal.inv), frozen EVAL_THRESHOLDS, mechanical lockRuleVerdict"
  - "eval/lz-eval-lock-rule.md: the pre-registered EVAL-04 lock rule whose thresholds match EVAL_THRESHOLDS byte-for-byte"
  - "eval/__fixtures__/agg-cases/: discriminating (mutation-verified) committed vote-dir fixtures"
affects: [18-05, phase-18-staged-eval-run, phase-19-search-worker-tier-decision]

# Tech tracking
tech-stack:
  added: []  # jstat@1.9.6 was added in 18-02; consumed here, not newly added
  patterns:
    - "Library-computed statistics via the pinned jstat (NEVER hand-rolled): jStat.beta.inv (Clopper-Pearson upper), jStat.normal.inv (Wilson), jStat.combination (Pass@k)"
    - "Cross-tree one-directional import (eval -> runtime) of the shipped aggregator's hardening primitives; readJson copied (module-private) using the imported ContractError + stripBom"
    - "Frozen Object.freeze eval-thresholds object; the pre-registered lock-rule doc mirrors it byte-for-byte (anti-drift)"
    - "Discriminating present/absent sibling fixtures for the false-uphold counter; a non-zero-Sonnet DELTA fixture forcing the subtraction (Phase-17 CR-01 discipline)"

key-files:
  created:
    - "eval/lz-eval-aggregate.mjs"
    - "eval/lz-eval-aggregate.test.mjs"
    - "eval/lz-eval-lock-rule.md"
    - "eval/__fixtures__/agg-cases/false-uphold-present/ (gold.json + votes/)"
    - "eval/__fixtures__/agg-cases/false-uphold-absent/ (gold.json + votes/)"
    - "eval/__fixtures__/agg-cases/delta-two-tier/ (gold.json + haiku/ + sonnet/)"
  modified: []

key-decisions:
  - "comb(a,k) applies the C(a,k)=0 for a<k combinatorial identity BEFORE calling jStat.combination (the library returns NaN there, which would poison Pass@1 when n-c<k, e.g. all trials correct). This is a documented combinatorial fact, not a hand-rolled special function -- every actual combination value still comes from jstat (D-07)."
  - "DELTA_UPPER_MAX = 0.25 encodes the '~0' false-uphold DELTA gate: it sits between CP(0,15)~=0.218 (zero excess at reliable=15, PASS) and CP(1,15)~=0.319 (one excess, FAIL), so a clean Haiku clears and any non-zero excess fails."
  - "Lock-rule PASS requires all three gates (false-uphold DELTA upper <= 0.25 AND escalation < 0.50 AND reliableTrials >= 15); any failure -> FAIL-RAISE (raise to user, EVAL-03; Sonnet-default ships in the interim, COST-02)."
  - "Cost-gate kill threshold enforced at ESCALATION_KILL_HIGH (0.50, the conservative edge of the 0.40-0.50 band)."

patterns-established:
  - "The eval aggregator is the SOLE HARD GATE engine: deterministic verdict-vs-gold (no LLM-as-judge in the gate), library-computed CI, pre-registered lock rule."

requirements-completed: [EVAL-02, EVAL-04, COST-02]

# Metrics
duration: 18min
completed: 2026-06-16
---

# Phase 18 Plan 03: Deterministic off-model eval aggregator + pre-registered lock rule Summary

**The SOLE HARD GATE engine: Pass@1/Pass^k + per-stratum false-uphold + Haiku-minus-Sonnet DELTA + library-computed (jstat) Clopper-Pearson upper bound + a mechanical, pre-registered lock-rule verdict, all deterministic and off-model.**

## Performance

- **Duration:** ~18 min
- **Started:** 2026-06-16T11:45:00Z (approx)
- **Completed:** 2026-06-16T12:03:00Z (approx)
- **Tasks:** 1 (TDD)
- **Files modified:** 16 created (3 source/doc + 13 fixture files)

## Accomplishments
- `eval/lz-eval-aggregate.mjs` -- exports `clopperPearsonUpper`, `wilsonUpper`, `passAtK`, `passHatK`, `EVAL_THRESHOLDS` (frozen), `countFalseUpholds`, `delta`, `lockRuleVerdict`. All CI/Pass@k math routes through the pinned `jstat` (`jStat.beta.inv` / `jStat.normal.inv` / `jStat.combination`); NO hand-rolled `logGamma`/`incbeta`/`betaInv`/comb. Imports the runtime aggregator's `ContractError`/`stripBom`/`safeId`/`listJson` cross-tree (one-directional).
- `eval/lz-eval-aggregate.test.mjs` -- 15 tests, exits 0 via the explicit FILE-form gate. Pins ONLY the verified library anchors (0.218 / 0.327 / 0.082 / CP(n,n)=1 / combination(15,3)=455); proves the false-uphold counter flips between present (count 1) and absent (count 0) siblings; proves the DELTA subtracts (Haiku 2 - Sonnet 1 -> 1); proves the four lock-rule verdict paths; fail-closed parse + path-traversal hardening.
- `eval/lz-eval-lock-rule.md` -- the pre-registered EVAL-04 lock rule. States it is written before any model call; names the SUBTLE open-book DELTA upper-CI ~0 hard gate, the 0.40-0.50 escalation kill band, reliable=15, and raise-to-user-on-FAIL (Sonnet-default ships in the interim). Its thresholds match `EVAL_THRESHOLDS` byte-for-byte (verified programmatically).
- `eval/__fixtures__/agg-cases/` -- discriminating, mutation-verified committed vote-dir fixtures.

## Task Commits

Each task was committed atomically:

1. **Task 1: Build the eval aggregator (TDD: RED test confirmed module-not-found, then GREEN)** - `f497c5a` (feat)

_The single TDD task produced the failing test, the aggregator, the lock-rule doc, and the fixtures together; committed as one atomic feat commit after GREEN._

**Plan metadata:** (this SUMMARY + STATE/ROADMAP/REQUIREMENTS) committed separately as `docs(18-03): ...`.

## Files Created/Modified
- `eval/lz-eval-aggregate.mjs` - the deterministic off-model gate engine (library-wired CI + Pass@k + false-uphold + DELTA + lock-rule verdict)
- `eval/lz-eval-aggregate.test.mjs` - 15-test node:test fixture (FILE-form gate)
- `eval/lz-eval-lock-rule.md` - pre-registered EVAL-04 lock rule (byte-for-byte threshold parity with EVAL_THRESHOLDS)
- `eval/__fixtures__/agg-cases/false-uphold-present/` - refuted-gold claim voted unrefuted (counted) + a correct-unrefuted control
- `eval/__fixtures__/agg-cases/false-uphold-absent/` - sibling where the same gold-bad claim is voted refuted (not counted)
- `eval/__fixtures__/agg-cases/delta-two-tier/` - shared SUBTLE gold pool; Haiku false-upholds 2, Sonnet 1 (DELTA 1)

## Decisions Made
- See key-decisions in frontmatter. The load-bearing one: `comb(a,k)` applies the `C(a,k)=0` for `a<k` identity before `jStat.combination` because the library returns NaN there (this is a documented combinatorial fact, not hand-rolling; jstat still computes every real combination value). `DELTA_UPPER_MAX=0.25` cleanly separates the 0/15 CP ceiling (0.218, PASS) from 1/15 (0.319, FAIL).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] jStat.combination returns NaN for n<k, poisoning Pass@1**
- **Found during:** Task 1 (GREEN step -- `passAtK(15,15,5)` returned NaN, failing the EVAL-02 test)
- **Issue:** The Pattern-2 reference wrapper `1 - jStat.combination(n-c,k)/jStat.combination(n,k)` returns NaN whenever `n-c < k` (e.g. all trials correct -> `combination(0,5)` is NaN), because jstat's combination is undefined for `n<k`. Mathematically `C(n,k)=0` for `n<k`.
- **Fix:** Added an internal `comb(a,k)` that returns `0` when `a<k` (the standard HumanEval Pass@k combinatorial identity -- "ways to pick k from the failures" is zero when there are fewer than k failures), else delegates to `jStat.combination`. Both `passAtK` and `passHatK` route through it. This is NOT hand-rolling a special function: every real combination value still comes from the library; only the degenerate `a<k` identity (a documented fact) is applied. D-07 honored.
- **Files modified:** eval/lz-eval-aggregate.mjs (within the Task 1 commit)
- **Verification:** All 15 tests green after the fix; mutation spot-checks confirmed the fixtures discriminate.
- **Committed in:** f497c5a (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** The fix is required for correctness of the Pass@k math; it preserves the D-07 "library, never hand-rolled" constraint (the identity is combinatorial, not a special-function reimplementation). No scope creep.

## Issues Encountered
- Two transient ASCII-cleanliness slips while authoring the aggregator header comment (a literal U+FEFF byte typed into a comment about the BOM). Resolved by removing the BOM reference entirely; final scan confirms all three files are ASCII-clean.
- `git grep` cannot search untracked files (they are not in the index); switched the wiring/parity verification to `rg` and a `node` parity check per the host search-tool rules.

## User Setup Required
None - no external service configuration required. (The eval/ tree's `jstat` is already installed from the 18-02 committed lockfile; if a module-resolution error ever occurs, run `cd eval && npm ci`.)

## Next Phase Readiness
- The gate engine is ready for the Plan 18-05 staged eval run: it consumes a vote dir + gold labels and produces a deterministic false-uphold count, DELTA, Clopper-Pearson upper bound, and PASS/FAIL-RAISE verdict.
- Plan 18-04 (dataset loader) authors the third eval-tree test the CI step already references by path; the eval-tree CI gate goes fully green end-to-end once 18-04 lands.
- No blockers.

## Self-Check: PASSED

- eval/lz-eval-aggregate.mjs: FOUND
- eval/lz-eval-aggregate.test.mjs: FOUND (15 tests, exits 0 via FILE-form gate)
- eval/lz-eval-lock-rule.md: FOUND (thresholds match EVAL_THRESHOLDS byte-for-byte)
- eval/__fixtures__/agg-cases/ (3 cases, 13 files): FOUND, discriminating (mutation-verified)
- Commit f497c5a: FOUND

---
*Phase: 18-haiku-prompt-engineering-deep-research-verify-voter-early-ga*
*Completed: 2026-06-16*
