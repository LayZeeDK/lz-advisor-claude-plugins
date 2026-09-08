---
phase: 21-live-web-open-book-over-refusal-gold-and-arm-b-re-run
plan: 02
subsystem: testing
tags: [eval, open-book-gold, retrieval-log, meta-source-blocklist, bounded-leakage, safeId, node-test, zero-dep, gitignored]

# Dependency graph
requires:
  - phase: 21-live-web-open-book-over-refusal-gold-and-arm-b-re-run
    plan: 01
    provides: "openbook-lib.mjs -- filterMetaSources / isMetaSource (the D-07 meta-source blocklist enforcement gate)"
  - phase: 19-search-extract-worker-agents
    provides: "the SHIPPED aggregator safeId / ContractError (lz-deep-research-aggregate.mjs) -- the one-directional eval->runtime path-safety import"
  - phase: 20-orchestrator-skill-headless-scale-confirmation
    provides: "oof-transport-lib.mjs (isCliEntry); lz-eval-evidence-join.mjs (run-dir layout + EXCERPT_CHAR_CAP shape parity); armB-oof-gold-result.json (the frozen 30 confirmed_uids)"
provides:
  - "openbook-retrieval-log.mjs: the NO-SPEND, NO-NETWORK deterministic retrieval-log builder -- readControlBundle (fail-closed run-dir reader, safeId on every uid/excerpt_id), applyBlocklist (the D-07 enforcement gate over logged URLs), buildEvidenceSnapshot (uid-keyed SORTED-KEY object, byte-stable), isCliEntry-guarded freeze to openbook-evidence.json"
  - "FILE-form, mutation-verified node:test suite (11/11 green) over a tmp-fixture run dir"
affects: [21-03, 21-04, openbook-oof-gold]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Percent-encode a '::'-bearing confirmed_uid to a WINDOWS-SAFE claims-file basename (':' is the reserved NTFS ADS separator); keep the RAW uid as the snapshot KEY -- the same recipe the extract worker uses for sources/ filenames"
    - "safeId-CHECK the RAW uid (traversal gate) BEFORE percent-encoding + safeId-CHECK the encoded basename (defense-in-depth) -- a '../' uid throws before any path is built"
    - "Meta-source blocklist (filterMetaSources, imported from Plan 01) as the LOAD-BEARING D-07 enforcement gate run BEFORE the snapshot is frozen -- prompt avoidance (Plan 04) is best-effort only"
    - "sortKeysDeep over the whole container so the uid-keyed snapshot is byte-stable across builds regardless of input uid order (the frozen producer/consumer contract Plans 03/04 depend on)"
    - "A zero-non-blocklisted-evidence control is recorded with empty evidence[] + retrieval_gap:true -- attributable to a retrieval gap, NEVER coerced into a fabricated verdict"

key-files:
  created:
    - "eval/.cache/p21-live/openbook-retrieval-log.mjs (gitignored)"
    - "eval/.cache/p21-live/openbook-retrieval-log.test.mjs (gitignored)"
  modified: []

key-decisions:
  - "Percent-encode the confirmed_uid to form the claims-file basename ('::' -> '%3A%3A') because a ':' cannot be a raw filename character on Windows/NTFS (ADS separator -> ENOENT on write). safeId alone is insufficient -- it accepts ':' (not a path separator). The RAW uid stays the snapshot key; the encoded form is only the on-disk filename. (Rule 3 deviation -- blocking on this host.)"
  - "The traversal gate runs on the RAW uid FIRST (safeId(uid) throws on '/'/'\\'/'.'/'..'), THEN the encoded basename is re-checked through safeId -- so a crafted uid never reaches the encode/read step and can never read outside the run dir."
  - "Snapshot evidence record carries the same { url, quote, excerpt_id, fetched_at, sentence } two-field-ready shape + the EXCERPT_CHAR_CAP(1200) cap as lz-eval-evidence-join.mjs, so the gold driver (Plan 03) consumes shape-parity evidence."

patterns-established:
  - "Pattern 1: a content-derived id used as a filename on this host must be percent-encoded for Windows safety AND safeId-checked for traversal -- the two are complementary, not redundant (safeId does not reject ':')."
  - "Pattern 2: the no-network source guard is a source-scan test asserting NO literal fetch/WebFetch/WebSearch/child_process/LZ_SPEND token -- so module prose must avoid those literal tokens (the guard is load-bearing, not cosmetic)."

requirements-completed: [OBG-01, OBG-03, OBG-09]

# Metrics
duration: 40min
completed: 2026-06-22
---

# Phase 21 Plan 02: Open-book retrieval-log builder Summary

**The NO-SPEND, NO-NETWORK deterministic retrieval-log builder (`openbook-retrieval-log.mjs`): it reads the session-dispatched live-web retrieval bundles for the frozen 30 controls from a `.lz-research`-shaped run dir, applies the D-07 meta-source blocklist as the load-bearing enforcement gate BEFORE freeze, pins `fetched_at`, and freezes a byte-stable uid-keyed sorted-key snapshot to `openbook-evidence.json` -- FILE-form test-locked at 11/11 with mutation-verified discrimination on both the blocklist drop and the sorted-key byte-stability.**

## Performance

- **Duration:** ~40 min
- **Completed:** 2026-06-22
- **Tasks:** 1 (TDD: test RED -> impl GREEN)
- **Files modified:** 2 created (both gitignored under eval/.cache/p21-live/)

## Accomplishments

- `openbook-retrieval-log.mjs` exports the three builder units the open-book gold's evidence pipeline needs:
  - `readControlBundle(runDir, uid)` -- safeId-checks the RAW uid (traversal gate) BEFORE any path use, percent-encodes it to a Windows-safe claims-file basename, re-checks the encoded form through safeId, then reads `claims/<encoded-uid>.json` + each claim's `sources/<percent-encoded-key>.json` (canonical URL + `fetched_at`) + `excerpts/<safeId(excerpt_id)>.txt` passage, fail-closed: a claim missing its `excerpt_id`/`source`, or whose source record is absent, is DROPPED (never fabricated); a crafted uid/excerpt_id throws `ContractError`.
  - `applyBlocklist(bundle)` -- runs `filterMetaSources` (imported from Plan 01's `openbook-lib.mjs`) over the logged canonical URLs and DROPS every meta source (the claim's own fact-check / leaderboard / dataset-benchmark page) BEFORE freeze; preserves order + `fetched_at` on survivors. This is the LOAD-BEARING D-07 enforcement gate.
  - `buildEvidenceSnapshot(runDir, confirmedUids)` -- assembles the two-field-ready record per control into the PINNED container shape: a UID-KEYED OBJECT with SORTED keys, byte-stable across builds (sortKeysDeep at every level, uids sorted + de-duped); a control with ZERO surviving evidence gets `evidence:[]` + `retrieval_gap:true`.
- The CLI freeze (`node openbook-retrieval-log.mjs <runDir> <confirmedUidsJsonPath> [outPath]`) is `isCliEntry`-guarded so IMPORTING the module triggers no read + no write; the freeze is idempotent + byte-stable (smoke-tested: two CLI runs over the same fixture produced byte-identical `openbook-evidence.json`).
- The FILE-form `node:test` suite passes 11/11 and is empirically proven discriminating (D-13): (1) removing the `applyBlocklist` call left the injected leaderboard URL in the snapshot AND collapsed the fact-check-only control's retrieval gap -> 2 RED; (2) removing the uid `.sort()` made the snapshot input-order-dependent -> the sorted-key + byte-stability tests went 2 RED. Both restored GREEN.
- Zero spend, zero network: no `fetch`/`WebFetch`/`WebSearch`/`child_process`/`LZ_SPEND`/`copilot`/`spawnSync`/`http`/`net`/`https` primitive anywhere in the module (source-scanned); importing wrote no `openbook-evidence.json`. Both files strictly ASCII, no BOM.
- Frozen seams byte-identical: `lz-eval-evidence-join.mjs` (empty `git diff`), the SHIPPED aggregator `lz-deep-research-aggregate.mjs` (empty `git diff` -- imported, not edited), `oof-transport-lib.mjs` + `openbook-lib.mjs` (gitignored; untouched, mtimes predate this session).

## Task Commits

This plan's deliverables live under gitignored `eval/.cache/p21-live/` (the Phase-20 live-cert pattern), so there are NO per-task tracked commits -- the two scripts persist on the working tree on disk and are intentionally NOT committed (the sequential-execution contract). The only tracked artifact for this plan is this SUMMARY (plus STATE.md + ROADMAP.md).

1. **Task 1: openbook-retrieval-log.mjs + .test.mjs** - TDD (test RED -> impl GREEN); gitignored, not committed. 11/11 FILE-form green; mutation-verified discriminating on the blocklist drop (2 RED) and the sorted-key byte-stability (2 RED).

**Plan metadata:** the docs commit captures this SUMMARY + STATE.md + ROADMAP.md.

## Files Created/Modified

- `eval/.cache/p21-live/openbook-retrieval-log.mjs` (gitignored) - the deterministic run-dir reader + meta-source blocklist post-filter + byte-stable uid-keyed sorted-key snapshot freeze; `isCliEntry`-guarded dispatch; imports `filterMetaSources` (Plan 01), `safeId`/`ContractError` (the SHIPPED aggregator, one-directional eval->runtime), `isCliEntry` (p20 transport). ASCII-only, no BOM, zero-dep node stdlib.
- `eval/.cache/p21-live/openbook-retrieval-log.test.mjs` (gitignored) - 11 FILE-form discriminating tests over a tmp-fixture run dir (assemble + fail-closed + uid traversal + excerpt traversal + blocklist drop + sorted-key object + byte-stability + retrieval_gap + no-network source-scan + ASCII/BOM).

## Decisions Made

- **Percent-encode the uid for the claims-file basename (Windows/NTFS safety):** a confirmed_uid is `<topic-run>::<cluster>` -- it carries `::`. `safeId` accepts `:` (it only rejects path separators `/`/`\\`, `.`, `..`, and Windows reserved device names), but a `:`-bearing filename CANNOT be written on Windows/NTFS (`:` is the alternate-data-stream separator -> `ENOENT` on write, verified empirically). So the run-dir layout (and this builder) percent-encode the uid to a safe basename (`::` -> `%3A%3A`) -- the SAME recipe the extract worker uses for `sources/<percent-encoded-canonical-key>.json` filenames -- while the RAW uid stays the snapshot KEY (so Plan 03 reads by canonical uid + Plan 04 counts the canonical keys). The plan's behavior text said "Read `claims/<safeId(uid)>.json`"; on this host that is insufficient, so the read is `claims/<safeId(percentEncodeKey(uid))>.json` with the RAW uid safeId-checked FIRST as the traversal gate. Resolved as a Rule 3 (blocking-issue) fix.
- **Two-stage path safety:** the RAW uid is `safeId`-checked first (a `../`/`/`/`\\` uid throws `ContractError` before any encoding), then the percent-encoded basename is `safeId`-checked again (defense-in-depth). The encoded form has no path separators by construction, but the second check rejects any crafted key that somehow retained one.
- **Evidence-record shape parity with the frozen join:** the snapshot's per-claim evidence is `{ url, quote, excerpt_id, fetched_at, sentence }` with the excerpt `sentence` ASCII-cleaned + capped at `EXCERPT_CHAR_CAP`(1200) -- the same cap `lz-eval-evidence-join.mjs` uses -- so the gold driver (Plan 03) consumes shape- and size-parity evidence.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Percent-encode the confirmed_uid for the Windows-safe claims-file basename**
- **Found during:** Task 1 (GREEN phase -- the first test run failed with `ENOENT` on every `claims/<uid>.json` read).
- **Issue:** The plan's behavior block says "Read `claims/<safeId(uid)>.json`". A confirmed_uid carries `::` (e.g. `wasm-vs-native-cpu::cluster11`). `safeId` accepts `:` (not a path separator), so `safeId(uid)` returns the uid unchanged -- but a `:`-bearing filename is illegal on Windows/NTFS (`:` is the ADS separator), so `fs.writeFileSync`/`fs.readFileSync` both `ENOENT`. The builder could never read a run-dir claims file keyed by a raw `::` uid on this host.
- **Fix:** Percent-encode the uid to a Windows-safe basename before the path is built (`::` -> `%3A%3A`, the extract worker's `sources/` recipe), with the RAW uid `safeId`-checked FIRST (traversal gate) and the encoded basename `safeId`-checked again (defense-in-depth). The RAW uid remains the snapshot KEY. The test fixture writes the SAME percent-encoded basename so it round-trips.
- **Files modified:** `eval/.cache/p21-live/openbook-retrieval-log.mjs` (+ its test fixture, which percent-encodes the uid basename to match).
- **Verification:** all 4 `readControlBundle` tests + the snapshot tests pass; the CLI smoke test froze a byte-identical snapshot keyed by the raw `::` uid over a percent-encoded on-disk filename.
- **Committed in:** N/A (gitignored; persists on disk).

---

**Total deviations:** 1 auto-fixed (1 blocking).
**Impact on plan:** the fix is required for correctness on this Windows host -- it is the only way a `::`-bearing confirmed_uid can be a run-dir claims-file basename. No scope creep; the two-field-ready evidence shape, the D-07 blocklist enforcement, the safeId traversal gate, the sorted-key byte-stable container, and the no-network/no-spend contract are all preserved exactly as the plan specifies. The percent-encode recipe is the extract worker's own `sources/` recipe, so the run-dir layout stays consistent.

## Issues Encountered

- The no-network source-scan test initially went RED because the module's own header prose contained the literal tokens `WebFetch`/`WebSearch`/`fetch(` (in the spend-boundary documentation). The scan is a load-bearing guard (it must catch an accidental network call), so the fix was to rephrase the prose to avoid the literal primitive names rather than weaken the scan. This matches the openbook-rescore.mjs (Plan 01) convention of source-scanning for forbidden primitives.

## Known Stubs

None. The builder is a complete deterministic implementation. `openbook-evidence.json` is produced by the CLI entry over the p21 run dir written by the SESSION retrieval in Plan 04 -- that is the intended cross-plan boundary, not a stub. The `main()` dispatch is `isCliEntry`-guarded so importing the builder (the only thing this plan exercises) never reads a not-yet-produced run dir.

## User Setup Required

None - no external service configuration required (this plan is pure no-spend deterministic code + tests).

## Next Phase Readiness

- The open-book evidence pipeline's NO-SPEND deterministic half is built and test-locked BEFORE any retrieval or metered spend, as the construct-fix discipline (D-10/D-13) requires.
- The `openbook-evidence.json` container shape (uid-keyed sorted-key object, byte-stable) is pinned + tested -- the producer/consumer contract Plans 03 (the OOF gold driver reads it by uid) + 04 (the session retrieval populates the run dir; counts the keys) depend on.
- The D-07 bounded-leakage gate (the meta-source blocklist drop) is enforced in CODE (the node post-filter), not just prompted -- mutation-verified discriminating.
- No blockers. Frozen seams verified byte-identical; the imported aggregator is unedited; the eval tree never ships.

## Self-Check: PASSED

- Both gitignored scripts present on disk + this SUMMARY present (3/3 FOUND).
- FILE-form suite green: 11/11 (`node --test eval/.cache/p21-live/openbook-retrieval-log.test.mjs` exit 0).
- Mutation discrimination demonstrated on both fronts: blocklist-drop removed -> 2 RED; uid-sort removed -> 2 RED; both restored GREEN.
- Importing the module wrote no `openbook-evidence.json` (no-write-on-import verified); CLI freeze byte-identical across two runs (idempotent).
- Frozen tracked seams `lz-eval-evidence-join.mjs` + the SHIPPED aggregator byte-identical (empty git diff); imported gitignored seams untouched.
- No tracked code commit for the scripts (gitignored, intended); this SUMMARY is the tracked artifact.

---
*Phase: 21-live-web-open-book-over-refusal-gold-and-arm-b-re-run*
*Completed: 2026-06-22*
