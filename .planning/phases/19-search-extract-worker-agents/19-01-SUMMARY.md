---
phase: 19-search-extract-worker-agents
plan: 01
subsystem: eval-deterministic-spine
tags: [eval, search-and-stop, retrieval-adapter, url-canonicalization, date-leakage-guard, loader-fix, mc-dc]
requires:
  - plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs (frozen: ContractError/stripBom/safeId cross-tree import)
  - eval/lz-eval-dataset.mjs (the D-12 loader, surgically edited here)
provides:
  - eval/lz-eval-search-loop.mjs (searchAndStop core + staticKsAdapter + liveWebSearchAdapter stub + dateFilter + parseAvtDate + canonicalizeUrl + sourceFilename + frozen SEARCH_DEFAULTS/TRACKING_PARAMS)
  - eval/lz-eval-dataset.mjs::fetchDataset (now per-source repoType-parameterized, D-12)
affects:
  - Plan 02 (workers invoke canonicalizeUrl/sourceFilename + the receipt contract)
  - Plan 03 (trap builder consumes dateFilter + the static-KS retrieval seam)
  - Plan 04 (the offline read drives searchAndStop via the static-KS adapter)
tech-stack:
  added: []
  patterns:
    - one-directional eval -> runtime cross-tree primitive import
    - Object.freeze frozen constants (SEARCH_DEFAULTS, TRACKING_PARAMS) anti-drift
    - injectable retrieval-adapter seam (the ONLY swappable line; D-09)
    - fail-closed date-cutoff leakage guard (strict <, undated dropped; D-05/D-07)
    - SHA-256-hex filename (path-separator-free by construction; T-19-01)
    - guarded import-safe CLI tail (node:coverage disable)
    - node:test FILE-form gate (host quirk) + discriminating MC/DC assertions
key-files:
  created:
    - eval/lz-eval-search-loop.mjs
    - eval/lz-eval-search-loop.test.mjs
  modified:
    - eval/lz-eval-dataset.mjs
    - eval/lz-eval-dataset.test.mjs
decisions:
  - "searchAndStop counts CUMULATIVE docs explored (docsSeen += results.length per the RESEARCH draft), not distinct URLs -- aligns the minDocs floor with retrieval-effort semantics and the test fixtures"
  - "liveWebSearchAdapter is a protocol-shape stub that FAILS LOUD if a caller fetches through it without binding an executor (never a silent []), documenting that the production binding is agent-side and the eval drives the static-KS adapter only (D-05/D-07)"
metrics:
  tasks_completed: 3
  files_created: 2
  files_modified: 2
  tests_added: 32
  completed: 2026-06-16
---

# Phase 19 Plan 01: Deterministic search-and-stop spine + D-12 loader fix Summary

The genuinely-new deterministic spine of Phase 19: one shared autonomous search-and-stop core with a load-bearing mechanical-minimum guard, two pluggable retrieval adapters (a pure static-AVeriTeC-KS function + a live-WebSearch protocol-shape stub), the per-claim date-cutoff leakage guard (D-07), and the URL-canonicalization + SHA-256 filename rule (D-13) the extract worker invokes -- plus the surgical D-12 per-source `--repo-type` loader fix. Every function is a pure, MC/DC-tested deterministic seam; 32 new discriminating tests, all green via the FILE-form `node:test` gate.

## What Was Built

### Task 1 -- `eval/lz-eval-search-loop.mjs` deterministic pure functions (commit 80f9e2d)
- `canonicalizeUrl(raw)`: the D-13 recipe -- lowercase scheme+host, strip default ports 80/443, strip the frozen `TRACKING_PARAMS` denylist + any `utm_` prefix, strip the URL fragment, strip a single trailing slash. `new URL(raw)` throws on malformed (fail-closed upstream). Two tracking-only variants of one source collapse to one canonical key (the dedup invariant).
- `sourceFilename(canonicalKey)`: `sha256-hex + '.json'` -- collision-safe, fixed-length, path-separator-free by construction (T-19-01: eliminates the traversal vector; the raw key stays only in the JSON `id`).
- `parseAvtDate(ddmmyyyy)`: `DD-MM-YYYY -> UTC Date`; a non-matching string throws `ContractError('unparseable claim_date ...', 'date')`.
- `dateFilter(docs, claimDate)`: the D-05/D-07 leakage guard -- keeps ONLY docs with a parseable date strictly `< claimDate`; any undated OR `>= claimDate` doc is dropped (the boundary `== claimDate` is excluded by strict `<`).
- Cross-tree `ContractError/stripBom/safeId` import (one-directional eval -> runtime), fail-closed `readJson`, frozen `TRACKING_PARAMS`, guarded import-safe CLI tail. Strictly ASCII.

### Task 2 -- searchAndStop core + adapters + the MC/DC test (commit b6229f2)
- `searchAndStop({claim, attackMode, adapter, minQueries, minDocs, maxQueries})`: the ONE shared spine (D-09/D-10/D-11, built once, no throwaway). The retrieval adapter is the ONLY swappable line. The mechanical-minimum guard is load-bearing: it CANNOT return an uphold-equivalent verdict before BOTH `minQueries` and `minDocs` are met.
  - minimums unmet at exhaustion -> `{ verdict: 'insufficient', stop_reason: 'min-not-met' }`
  - minimums met + decisive -> `{ verdict: judge(results), stop_reason: 'decisive-evidence' }`
  - minimums met, exhausted, none decisive -> `{ verdict: 'refuted-default', stop_reason: 'exhausted' }`
  - per-vote trace `{ queries:[], depth, stop_reason }` makes a null delta diagnosable as genuine-parity vs both-stopped-early.
- `staticKsAdapter(ksByClaim, claimId, claimDate)`: a pure function whose `fetchResults(query)` returns only this claim's KS docs, date-filtered via `dateFilter` (the leakage seam). Empty/absent KS -> `[]`.
- `liveWebSearchAdapter(executor)`: the production protocol-shape stub; exposes the identical `fetchResults` signature so the core is adapter-agnostic; fails loud (never a silent `[]`) if a caller fetches through it without binding an executor.
- Frozen `SEARCH_DEFAULTS` (`minQueries=3, minDocs=5, maxQueries=8`) -- the OQ-2 pre-registered floor; the Plan-04 calibrator may only tighten, never loosen.
- `eval/lz-eval-search-loop.test.mjs`: 27 MC/DC tests, every assertion discriminating; the mechanical-minimum guard is proven to block an early uphold even when minDocs is met on query 1 (it still issues >= minQueries queries).

### Task 3 -- surgical D-12 loader fix (commit 2de7bb1)
- `fetchDataset` now threads a per-source `repoType` option (default `'dataset'`) and emits it as the `--repo-type` arg in place of the hardcoded `'dataset'`. WiCE stays `dataset`+ungated; `chenxwh/AVeriTeC` passes `model`+ungated. NOT a blanket flip (Pitfall 6: a blanket `--repo-type model` would 404 WiCE). The `gated` flag, revision guard, `cacheSlug` safeId, and fail-closed error handling are byte-intact.
- 5 new discriminating tests in `eval/lz-eval-dataset.test.mjs`: `--repo-type` flips `model` (AVeriTeC) vs `dataset` (WiCE) via a capturing `runner`; defaults to `dataset` when omitted; an ungated repo with no token does not throw.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] searchAndStop minDocs counting: distinct-URL -> cumulative**
- **Found during:** Task 2 (first GREEN run failed one test)
- **Issue:** The initial implementation counted DISTINCT in-window URLs for the `minDocs` floor. The "minimums met by exhaustion" test fixture returns the same 2 URLs each query (2 docs x 4 queries), which never reaches 5 distinct URLs, so the loop returned `insufficient` instead of `refuted-default`.
- **Fix:** Aligned with the RESEARCH-drafted protocol (`docsSeen += results.length`, lines 245-268) -- `minDocs` is "at least M docs EXPLORED" (retrieval effort), not "M distinct URLs". The empty-adapter `min-not-met` path is unaffected (cumulative stays 0 < 5).
- **Files modified:** eval/lz-eval-search-loop.mjs (searchAndStop body)
- **Commit:** b6229f2 (fixed before the Task 2 commit)

No architectural deviations (no Rule 4). No authentication gates.

## Threat Model Adherence
- T-19-01 (Tampering, sourceFilename): the SHA-256 hex filename has no path separators by construction. Verified by the `sourceFilename` test asserting no path separators / no `..` and an exact `^[0-9a-f]{64}\.json$` shape.
- T-19-02 (Information Disclosure, dateFilter/parseAvtDate): fail-closed -- undated OR `>= claimDate` dropped, boundary excluded. Verified by the dateFilter boundary + undated-drop tests.
- T-19-03 (Tampering, readJson): fail-closed `readJson` copied (ContractError, never bare JSON.parse).
- T-19-04 (EoP, cross-tree import direction): strictly eval -> runtime; verified by `git grep` (no plugin-tree file references `lz-eval`) and the existing packaging-boundary test (2/2 green).
- T-19-SC: no new packages this plan (zero installs).

## Verification Results
- `node --test eval/lz-eval-search-loop.test.mjs` -> 27/27 pass, exit 0.
- `node --test eval/lz-eval-dataset.test.mjs` -> 20/20 pass (15 existing + 5 new D-12), exit 0.
- No `package.json` / `node_modules` under `plugins/lz-advisor/`; no plugin-tree file imports an eval module.
- Source files strictly ASCII (per-file byte scan, no codepoint > 0x7f).
- No regression: `eval/lz-eval-packaging-boundary.test.mjs` 2/2; `lz-deep-research-aggregate.test.mjs` 39/39.

## Known Stubs
- `liveWebSearchAdapter` is an INTENTIONAL protocol-shape stub (documented in code, RESEARCH A4): the production WebSearch binding is realized agent-side in Plan 02. It is never executed in the eval (D-05/D-07 forbid live web for the eval) and fails loud rather than returning empty, so it cannot silently mask missing behavior. Not a data-stub that blocks the plan's goal.

## Self-Check: PASSED
- FOUND: eval/lz-eval-search-loop.mjs
- FOUND: eval/lz-eval-search-loop.test.mjs
- FOUND: eval/lz-eval-dataset.mjs (modified)
- FOUND: eval/lz-eval-dataset.test.mjs (modified)
- FOUND commit: 80f9e2d (Task 1)
- FOUND commit: b6229f2 (Task 2)
- FOUND commit: 2de7bb1 (Task 3)
