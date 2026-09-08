---
phase: 20-orchestrator-skill-headless-scale-confirmation
plan: 01
subsystem: testing
tags: [aggregator, escalate, load_bearing, anti-drift-lockstep, fnv-1a, node-test, verif-05]

# Dependency graph
requires:
  - phase: 16-deterministic-off-model-aggregator
    provides: the frozen aggregator (mergeClusters / tally / aggregate / CEILINGS) + the node:test fixture
  - phase: 17-json-schema-verification-contract
    provides: the frozen survivor-record shape + the anti-drift discipline (code authoritative; doc copies byte-for-byte)
  - phase: 19-search-extract-worker-agents
    provides: the research-extract-worker prompt + the SSOT worker-contract test that reads the schema
provides:
  - additive load_bearing carry through mergeClusters (OR-fold over members, fail-open)
  - a deterministic per-claim escalate flag on the survivor record (UNION of Contested OR load_bearing OR a stable-hash audit sample)
  - a pure exported stableHashFraction (FNV-1a [0,1)) + a frozen AUDIT_SAMPLE_RATE {value:0.15}
  - the schema doc + extract-worker prompt lockstep-mirrored to the new fields
affects: [20-02-aggregator-wiring, 20-03-orchestrator-skill, 20-04-sc5-headless-scale-spike, 20-05-live-cert]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Additive frozen-shape extension under the anti-drift lockstep (code + tests + schema + worker prompt in ONE wave)"
    - "Deterministic audit sample via a stable FNV-1a hash of the aggregator-generated cluster id (never a PRNG)"
    - "Discriminating in/out-of-sample test pair constructed from the exported hash, not hardcoded magic"

key-files:
  created: []
  modified:
    - plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs
    - plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs
    - plugins/lz-advisor/references/lz-deep-research-schema.md
    - plugins/lz-advisor/agents/research-extract-worker.md

key-decisions:
  - "AUDIT_SAMPLE_RATE pinned to a frozen { value: 0.15 } sibling object (15-20% band, D-12c / RESEARCH A1)"
  - "escalate appended AFTER confidence as the survivor record's last key; the frozen field set is byte-unchanged"
  - "load_bearing is fail-OPEN (judgment, only literal true counts); id/text/quote/source stay fail-closed"
  - "the escalate audit-sample comments avoid the literal Math.random token so the grep gate is provably empty"

patterns-established:
  - "Anti-drift lockstep landing: aggregator (authoritative) + byte-identity test + schema doc + extract-worker prompt in one atomic wave"
  - "Discriminating-pair fixture uses disjoint vocabulary (coprime rotation over a word pool) so 21 clusters do not merge"

requirements-completed: [VERIF-05]

# Metrics
duration: 15min
completed: 2026-06-19
---

# Phase 20 Plan 01: load_bearing / escalate aggregator extension Summary

**Additive, deterministic per-claim `escalate` flag on the frozen survivor record -- the UNION of Contested OR an OR-folded `load_bearing` worker flag OR a stable-FNV-1a audit sample of unanimous upholds -- mirrored byte-for-byte into the schema doc and the extract-worker prompt under the anti-drift lockstep.**

## Performance

- **Duration:** 15 min
- **Started:** 2026-06-19T20:06:38Z
- **Completed:** 2026-06-19T20:21:45Z
- **Tasks:** 3 (TDD: RED -> GREEN, then lockstep mirror)
- **Files modified:** 4

## Accomplishments

- The off-model aggregator now emits a per-claim `escalate` flag (VERIF-05) computed DETERMINISTICALLY (never model discretion) as the union of (a) `confidence === 'Contested'`, (b) the OR-folded `load_bearing === true`, and (c) a `stableHashFraction(cluster id) < 0.15` audit sample of unanimous (3/3 `High`) upholds.
- `load_bearing` carries from the extract worker's claim entry through `mergeClusters` as an OR-fold over members (a cluster is `load_bearing` if ANY member is), analogous to the existing `sources` Set accumulation -- fail-open, additive.
- A tiny pure exported `stableHashFraction` (FNV-1a 32-bit, mirroring the eval `hash32` style) + a frozen `AUDIT_SAMPLE_RATE = Object.freeze({ value: 0.15 })`; no `Math.random` anywhere -- reproducible from the run dir.
- The frozen survivor record shape is byte-unchanged: `escalate` appends after `confidence` as the last key (locked by a `Object.keys` order assertion).
- The schema doc and the extract-worker prompt are lockstep-mirrored to the new fields (claim-record table, survivor-record table, named-ceilings block quoting `0.15` byte-for-byte, anti-drift note, stage-ownership rows, run-dir layout); the SSOT worker-contract test still passes.

## Task Commits

1. **Task 1 (TDD RED): failing tests for load_bearing/escalate** - `32c6f96` (test)
2. **Task 1 (TDD GREEN) + Task 2: aggregator implementation + full discriminating test suite** - `aeeb734` (feat)
3. **Task 3: lockstep-mirror into schema doc + extract-worker prompt** - `ec61972` (docs)

_TDD task: test (RED) -> feat (GREEN). The discriminating-pair fixture refinement (disjoint vocabulary) landed with the GREEN commit because it is coupled to making the test both pass and discriminate._

## Files Created/Modified

- `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs` - exported `stableHashFraction` + frozen `AUDIT_SAMPLE_RATE`; `mergeClusters` OR-folds `load_bearing`; `aggregate()` emits `escalate` after `confidence`.
- `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs` - +8 tests: stableHashFraction determinism/range, frozen-object value-pin, Contested->escalate, load_bearing->escalate (+ OR-fold), the in/out discriminating pair, escalate byte-identity determinism, additive field-order guard.
- `plugins/lz-advisor/references/lz-deep-research-schema.md` - additive `load_bearing` + `escalate` rows, the anti-drift extension note, the `AUDIT_SAMPLE_RATE` byte-for-byte quote, stage-ownership + run-dir layout updates.
- `plugins/lz-advisor/agents/research-extract-worker.md` - optional `load_bearing` in the inlined `claims[]` shape + a WHEN-to-set instruction; `tools`/`model` unchanged.

## Decisions Made

- **AUDIT_SAMPLE_RATE = 0.15** within the locked 15-20% band (D-12c / RESEARCH A1) -- a frozen `{ value: 0.15 }` sibling object so the schema doc quotes it byte-for-byte and the test pins `Object.isFrozen` + `=== 0.15` (mirrors the SC5-5 `CEILINGS` assertion).
- **`escalate` is an additive last key** -- appended after `confidence`; the frozen survivor field set (`id`, `claim`, `sources`, `corroboration_lower_bound`, `quote_fidelity`, `confidence`) is byte-unchanged.
- **`load_bearing` is fail-OPEN** (only the literal boolean `true` counts; a missing flag never aborts) because it is the extract worker's judgment, not a load-bearing read like `id`/`text`/`quote`/`source` (those stay fail-closed).
- **No `Math.random` literal anywhere** -- the explanatory comments were reworded ("never a PRNG") so the `git grep "Math.random"` acceptance gate is provably empty in both the index and the working tree.

## Deviations from Plan

None - plan executed exactly as written. No deviation rules (1-4) were triggered: the change touched only the frozen aggregator's additive surface, all guards held, no new dependencies, no architectural change.

## Issues Encountered

- The first draft of the branch-(c) discriminating fixture used near-identical claim texts ("claim number NN middle body text"), which merged at Jaccard >= 0.6 into 3 clusters instead of 21 -- so the in-sample `cluster20` never formed. Resolved by giving each claim a disjoint token set drawn from a coprime rotation over a 21-word pool (max pairwise Jaccard 0.143), plus a per-claim rank-control prefix (`aaa` for the in-sample cluster, `zzz` for the single SYNTH_CAP drop) so the asserted clusters survive the top-20 cut. Verified the rank/survival by simulation before locking the test.

## Verification

- `node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs` -> 49/49 pass, exit 0 (FILE form; the dir form spuriously exits 1 on this host).
- `node --test eval/lz-eval-worker-contract.test.mjs` -> 15/15 pass (the SSOT drift gate that reads the schema + both worker prompts).
- Mutation check (Task 2 acceptance): removing branch (c) from `escalate` fails ONLY the discriminating in/out pair (the in-sample cluster stops escalating) -> the test is genuinely discriminating, not vacuous.
- `git grep "Math.random"` over the aggregator -> NONE; `rg` over the working tree -> NONE.
- CLI byte-identity: two `aggregate()` calls over a committed fixture produce byte-identical `escalate` flags.
- Frozen invariants intact: confidence enum, the Option I tally branch order, and the survivor field set are byte-unchanged.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- The `survivors.json` `escalate` flag is the contract Plan 20-03's orchestrator reads to dispatch the VERIF-05 Sonnet re-vote wave (per the plan's key_links).
- Plans 20-02 (aggregator wiring), 20-03 (orchestrator SKILL.md), 20-04 (SC-5 headless spike), and 20-05 (live-cert) build on this additive surface; the frozen contract did NOT reopen.
- No blockers.

## Self-Check: PASSED

- All 4 modified files exist on disk; the SUMMARY exists.
- All 3 task commits (`32c6f96`, `aeeb734`, `ec61972`) exist in git history.
- Both test suites green via FILE form (aggregator 49/49, worker-contract 15/15).

---
*Phase: 20-orchestrator-skill-headless-scale-confirmation*
*Completed: 2026-06-19*
