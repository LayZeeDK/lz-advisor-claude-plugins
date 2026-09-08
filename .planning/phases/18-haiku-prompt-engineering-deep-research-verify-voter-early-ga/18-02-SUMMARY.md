---
phase: 18-haiku-prompt-engineering-deep-research-verify-voter-early-ga
plan: 02
subsystem: infra
tags: [eval, jstat, npm, supply-chain, packaging-boundary, ci, github-actions, act, node-test]

# Dependency graph
requires:
  - phase: 16
    provides: the runtime aggregator + its SC-2 zero-dependency test (re-scoped here)
  - phase: 17
    provides: the frozen vote/survivor schema the eval aggregator will score against
provides:
  - "Repo-level eval/ install surface (first install surface in the repo's history): eval/package.json (private lz-eval, type:module, devDependency jstat@1.9.6 exact) + a committed eval/package-lock.json"
  - "Human-verified, supply-chain-gated jstat@1.9.6 pin (MIT, zero runtime deps, no install/native scripts, anchors verified) -- the library every later eval plan computes its CI/interval/combinatorics with"
  - "D-11 packaging boundary enforced from BOTH sides: the re-scoped plugin-tree SC-2 test + the new eval/lz-eval-packaging-boundary.test.mjs"
  - "Both CI workflows gate the three eval-tree tests on every push/PR (ci.yml eval step in the existing test job + test-act.yml extended paths)"
affects: [18-03, 18-04, 18-05, phase-19, phase-20]

# Tech tracking
tech-stack:
  added: [jstat@1.9.6 (eval/ devDependency, exact-pinned, lockfiled, gitignored node_modules)]
  patterns:
    - "Tree boundary: plugin tree (plugins/lz-advisor/) strictly zero-dep; repo-level eval/ is the ONLY install surface"
    - "Eval-tree CI gate as steps in the existing single ci.yml test job (so test-act act -j test mirrors the whole gate with no act-command change)"
    - "Supply-chain checkpoint: first npm install of an external package gated blocking-human before the lockfile is committed"

key-files:
  created:
    - eval/package.json
    - eval/package-lock.json
    - eval/lz-eval-packaging-boundary.test.mjs
  modified:
    - plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs
    - .gitignore
    - .github/workflows/ci.yml
    - .github/workflows/test-act.yml

key-decisions:
  - "jstat@1.9.6 selected + human-verified (MIT LICENSE file, zero runtime deps, no install/native-build scripts, all four numeric anchors match) as the eval-only statistics library; exact-pinned, lockfiled, node_modules gitignored"
  - "SC-2 zero-dependency test RE-SCOPED in place from a repo-root package.json walk to a plugin-tree-only assertion (the repo now has an install surface under eval/); import-spec assertion kept verbatim"
  - "Eval-tree CI gate added as steps in the EXISTING ci.yml test job (one job kept) so test-act needs only a paths-filter extension, no act-command change"
  - "ci.yml eval step lists all three eval-tree tests by explicit file path now (two are authored in 18-03/18-04); forward reference is intentional per the plan"

patterns-established:
  - "Packaging boundary (D-11): no package.json/node_modules under the plugin tree; no shipped runtime artifact imports any eval/ script -- enforced from both the plugin side (re-scoped SC-2) and the eval side (new boundary test)"
  - "Eval scripts use the explicit .test.mjs FILE-form node:test gate (host quirk); eval-tree tests require eval/node_modules restored first"

requirements-completed: [COST-02, EVAL-04]

# Metrics
duration: 7min
completed: 2026-06-16
---

# Phase 18 Plan 02: eval/ install surface + jstat supply-chain gate + D-11 boundary + CI backstop Summary

**Stood up the repo's first install surface (eval/ with an exact-pinned, human-verified jstat@1.9.6 lockfile), enforced the D-11 packaging boundary from both sides, and backstopped the three eval-tree tests in both CI workflows -- while the distributed plugin tree stays strictly zero-dep.**

## Performance

- **Duration:** ~7 min
- **Started:** 2026-06-16T09:40:52Z (first task commit)
- **Completed:** 2026-06-16T09:48:19Z
- **Tasks:** 4 (1 of which was a blocking human-verify supply-chain checkpoint)
- **Files modified:** 7

## Accomplishments

- Re-scoped the Phase-16 SC-2 zero-dependency test to a plugin-tree-only assertion and added a new eval-side packaging-boundary test, so D-11 is enforced from both directions (no package.json/node_modules under plugins/lz-advisor/; no plugin-tree .mjs imports any eval/ script).
- Authored the repo-level eval/ install surface: eval/package.json (private lz-eval, type:module, devDependency jstat@1.9.6 exact-pinned) and gitignored eval/node_modules/ + eval/.cache/.
- Cleared the FIRST npm install of an external package in this repo's history behind a blocking-human supply-chain checkpoint (all 6 verification checks PASS), then committed the verified eval/package-lock.json.
- Extended BOTH CI workflows to gate the three eval-tree tests on every push/PR: ci.yml gained an eval-tree step in the existing single test job (restore deps -> run the three tests by explicit file path, no plugin-tree coverage thresholds), and test-act.yml's push + pull_request paths now watch the eval tree.

## Task Commits

Each task was committed atomically:

1. **Task 1: Re-scope SC-2 to plugin tree + add eval packaging-boundary test** - `eb67ebd` (test)
2. **Task 2: Add eval/ install-surface manifest + .gitignore entries (no install yet)** - `abd4ee5` (chore)
3. **Task 3: Gate the first npm install jstat@1.9.6 + commit the lockfile (supply-chain checkpoint)** - `f918e66` (chore) -- lockfile committed only after the blocking-human checkpoint cleared all 6 checks
4. **Task 4: Extend BOTH CI workflows to gate the eval-tree tests** - `05dab95` (ci)

_(Plan metadata commit follows this SUMMARY.)_

## Files Created/Modified

- `eval/package.json` (new) - private lz-eval manifest, type:module, devDependency jstat@1.9.6 exact (no caret/tilde), license UNLICENSED, description marks it dev-only-never-ships (D-11).
- `eval/package-lock.json` (new) - committed reproducible pin of jstat@1.9.6 (lockfileVersion 3, integrity sha512-rPBkJbK2TnA8pzs..., resolved from registry.npmjs.org).
- `eval/lz-eval-packaging-boundary.test.mjs` (new) - stdlib-only (no jstat) D-11 boundary check: no package.json/node_modules under the plugin tree; no plugin-tree .mjs imports any eval/ script; each assertion has a non-vacuous inspected-count self-check; file-relative path resolution.
- `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs` (modified) - SC-2 test re-scoped: kept the import-spec assertion verbatim; replaced the repo-root package.json walk with a recursive plugin-tree assertion (no package.json/node_modules under plugins/lz-advisor/) resolved file-relative (three levels up from scripts/) with a non-vacuous inspected-count guard.
- `.gitignore` (modified) - added /eval/.cache/ and /eval/node_modules/ in the comment-then-glob house style; the manifest + lockfile + vendored data remain committed (not ignored).
- `.github/workflows/ci.yml` (modified) - eval-tree gate added in the existing test job (restore eval/ deps via cd eval && (npm ci || npm install); run the three eval-tree tests by explicit file path with NO --test-coverage-* flags); the plugin-tree coverage step kept verbatim; ci.yml still has exactly one job.
- `.github/workflows/test-act.yml` (modified) - both on.push.paths and on.pull_request.paths extended with eval/**/*.test.mjs, eval/*.mjs, eval/package.json, eval/package-lock.json; no existing path removed; no act-command change; ACT_VERSION/ACT_IMAGE + .actrc pin unchanged.

## Decisions Made

- **jstat@1.9.6 supply-chain verification (all 6 checks PASS).** Exact pin in manifest + lockfile; verbatim MIT LICENSE (Copyright (c) 2013 jStat); no install/preinstall/postinstall scripts and no native build (gypfile unset, zero runtime deps -- the only script key is a dev `test` vows runner, not an install hook); numeric anchors match exactly (jStat.beta.inv(0.975,1,15)=0.21801936, jStat.beta.inv(0.2,3,3)=0.32659794, jStat.beta.inv(0.4,1,6)=0.08161410, jStat.combination(15,3)=455); eval/node_modules/ gitignored, eval/package-lock.json stageable. The manifest `license` field is undefined (the known jstat packaging gap, RESEARCH A7) -- the LICENSE file is the authoritative MIT proof.
- **SC-2 re-scope is a deliberate in-scope edit** (Pitfall 1): the repo now legitimately has an install surface (under eval/), so the old "no package.json anywhere up to the repo root" contract is false; the contract is now plugin-tree-only.
- **Single-job ci.yml design** keeps test-act a faithful mirror with no act-command change (the eval step lives in the existing test job already simulated by act -j test push + pull_request).

## Deviations from Plan

None - plan executed exactly as written. (All four tasks ran in order; the supply-chain checkpoint was approved by the human after all 6 evidence checks passed.)

## Issues Encountered

- **SC-2 plugin-root level miscount (self-corrected during Task 1, pre-commit).** The first SC-2 edit resolved the plugin root four levels up (`../../../..` -> `plugins`) instead of three (`../../..` -> `plugins/lz-advisor`); the test's own drift-guard assertion caught it immediately (it asserts the resolved path ends with `plugins/lz-advisor`). Fixed to three levels and re-ran green (39/39, exit 0) before committing. No bad state was committed.
- **Task 4 verify-command job-count false positive (not a defect).** The plan's verify regex `^  [A-Za-z0-9_-]+:\s*$` counts the `on.push` and `on.pull_request` keys (same 2-space indent) as if they were jobs, so it reported `found: push:, pull_request:, test:` -- this false positive would also have fired against the ORIGINAL ci.yml. The single-job invariant the assertion intends is satisfied: ci.yml has exactly ONE job (`test`) under `jobs:`. Re-ran the full assertion with the job-count correctly scoped under `jobs:` and all checks pass (including eval entries present in BOTH push + pull_request paths).

## Known Stubs / Forward References

- `ci.yml`'s eval step lists `eval/lz-eval-aggregate.test.mjs` and `eval/lz-eval-dataset.test.mjs` by explicit file path; those two test files are authored in later plans (18-03 aggregator, 18-04 loader). This is an INTENTIONAL forward reference exactly as the plan's Task 4 action specifies (the CI step names all three eval-tree tests now). `eval/lz-eval-packaging-boundary.test.mjs` exists and passes today. This is NOT a stub blocking this plan's goal -- the install surface, the supply-chain gate, and the D-11 boundary are all fully realized and verified this plan; the two referenced tests will exist before CI runs against the later state. The repo-level `npm ci || npm install` fallback in the restore step tolerates the lockfile being absent on a future shallow state, and CI will resolve all three by the time 18-04 lands.

## Threat Flags

None - no security-relevant surface beyond the plan's `<threat_model>` was introduced. The supply-chain checkpoint (T-18-SC) and the D-11 deps-leak boundary (T-18-DEPLEAK) are exactly the mitigations the threat register assigned, and both are now in place (human-verified pin + lockfile; boundary enforced both sides + backstopped in CI).

## Next Phase Readiness

- Plan 18-02 stops at this infrastructure milestone (per the plan's checkpoint structure). The eval/ install surface + a restorable jstat@1.9.6 now exist for every later eval plan: 18-03 (eval aggregator: Pass@1/Pass^k/false-uphold/Clopper-Pearson via jstat), 18-04 (dataset loader), 18-05 (voter agents + live gating eval).
- COST-02 (Sonnet-default / Haiku-flag voters) and EVAL-04 (the lock rule, computed by this pinned library) are unblocked at the infrastructure level.

## Self-Check: PASSED

- Created files exist: eval/package.json, eval/package-lock.json, eval/lz-eval-packaging-boundary.test.mjs, 18-02-SUMMARY.md.
- Modified files exist: the re-scoped aggregator test, .gitignore, ci.yml, test-act.yml.
- Task commits exist: eb67ebd (Task 1), abd4ee5 (Task 2), f918e66 (Task 3 lockfile), 05dab95 (Task 4).
- All deliverables ASCII-only.

---
*Phase: 18-haiku-prompt-engineering-deep-research-verify-voter-early-ga*
*Completed: 2026-06-16*
