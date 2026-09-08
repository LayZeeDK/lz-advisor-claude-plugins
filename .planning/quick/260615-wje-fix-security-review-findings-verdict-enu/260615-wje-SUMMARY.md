---
phase: quick-260615-wje
plan: "01"
subsystem: lz-deep-research aggregator
tags: [security, fail-closed, validation, schema-doc]
dependency_graph:
  requires: []
  provides:
    - verdict enum guard in tally() (H-1)
    - Windows device-name guard in safeId() (L-1)
    - per-worker claims ceiling in mergeClusters() (L-2)
    - Phase-19 filename-safety rule in lz-deep-research-schema.md (M-4)
  affects:
    - plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs
    - plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs
    - plugins/lz-advisor/references/lz-deep-research-schema.md
tech_stack:
  added: []
  patterns:
    - fail-closed ContractError discipline extended to verdict enum and device-name guards
key_files:
  modified:
    - plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs
    - plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs
    - plugins/lz-advisor/references/lz-deep-research-schema.md
decisions:
  - "H-1 guard fires before seats.push() so an invalid verdict never enters the seats array"
  - "L-1 regex uses (.|$) anchor to prevent prefix false-positives on 'context', 'console', etc."
  - "L-2 CLAIMS_CEILING is a local constant per worker iteration (CEILINGS is frozen, multiplication is trivial)"
  - "M-4 paragraph added immediately after the Canonical-URL key rule closing sentence, before the next section heading"
metrics:
  duration: "~10 minutes"
  completed: "2026-06-15T21:33:57Z"
  tasks_completed: 4
  files_changed: 3
---

# Quick 260615-wje: Fix Security Review Findings - Summary

**One-liner:** Four fail-closed discipline gaps closed: verdict enum guard in tally(), Windows device-name guard in safeId(), per-worker claims ceiling before the O(n^2) merge loop, and Phase-19 filename-safety rule in the schema.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | H-1 verdict enum guard in tally() | a14fc76 | aggregate.mjs, aggregate.test.mjs |
| 2 | L-1 Windows device names in safeId() | 94ef106 | aggregate.mjs, aggregate.test.mjs |
| 3 | L-2 per-worker claims ceiling | 9a0cf51 | aggregate.mjs, aggregate.test.mjs |
| 4 | M-4 schema filename-safety rule | e207f0e | lz-deep-research-schema.md |

## Changes Made

### Task 1 (H-1 HIGH): Verdict enum guard in tally()

**Problem:** In `tally()`, `rec.verdict` was pushed to seats unconditionally for any non-null value. A wrong-case string like `"Refuted"` or `"refuted "` (trailing space) incremented `readableSeats` but matched neither `'unrefuted'` nor `'refuted'` in the counting filters, silently treating a refutation as an abstention.

**Fix:** Added a guard between `const verdict = rec.verdict` and `seats.push(...)`:
```js
if (verdict != null && verdict !== 'unrefuted' && verdict !== 'refuted') {
  throw new ContractError('invalid verdict (expected "unrefuted" or "refuted"): ' + JSON.stringify(verdict), f);
}
```

**Regression tests added:** 2 tests (wrong-case `"Refuted"`, trailing-space `"refuted "`) both asserting `/invalid verdict/`.

### Task 2 (L-1 LOW): Windows reserved device names in safeId()

**Problem:** `safeId()` rejected path traversal but not Windows reserved device names (CON, NUL, COM1-9, LPT1-9). Writing a worker file with `id: "CON"` could silently produce a `CON.json` that opens the device handle on Windows instead of a file.

**Fix:** Added guard after the path-traversal check, before `return id`:
```js
if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\.|$)/i.test(id)) {
  throw new ContractError('unsafe id (Windows reserved device name): ' + JSON.stringify(id), file);
}
```

**Also:** Added `safeId` to the test file's named import for direct testing.

**Regression tests added:** 2 tests -- reserved names (CON, NUL, COM1, LPT9, CON.json) throw `/unsafe id \(Windows reserved/`; non-reserved names (context, c1, console, nul1) do not throw.

### Task 3 (L-2 LOW): Per-worker claims ceiling before O(n^2) merge loop

**Problem:** `mergeClusters()` had no ceiling on the number of claims in a single worker file. A malicious or oversized worker file could submit an unbounded claims array into the O(n^2) Jaccard merge loop (comparing each new claim against all existing clusters).

**Fix:** Added ceiling check after the `w.source` guard, before the `for (const c of w.claims)` loop:
```js
const CLAIMS_CEILING = CEILINGS.MAX_VERIFY_CLAIMS * CEILINGS.ANGLES;
if (w.claims.length > CLAIMS_CEILING) {
  throw new ContractError(
    'worker claims[] exceeds ceiling (' + w.claims.length + '>' + CLAIMS_CEILING + ')',
    path.join(claimsDir, f),
  );
}
```
Ceiling = 24 * 5 = 120 claims per worker.

**Regression tests added:** 2 tests -- 121 claims throws `/exceeds ceiling/`; exactly 120 claims does not throw the ceiling error.

### Task 4 (M-4 DOC): Schema filename-safety rule

**Problem:** The schema's Canonical-URL key rule explained how to compute the canonical key but did not document that raw canonical URLs (which contain `/` path separators) cannot be used verbatim as `sources/<id>.json` filenames.

**Fix:** Added the Phase-19 filename-safety rule paragraph immediately after the Canonical-URL key rule closing sentence in `lz-deep-research-schema.md`. Documents that percent-encoding or SHA-256 hash are acceptable approaches, that the raw key is still carried inside the JSON `id` field, and that the encoding is required of Phase 19 workers and Phase 20 synthesis (the aggregator is exempt because it never reads `sources/`).

## Test Results

```
node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs

tests 38
pass  38
fail  0
```

Baseline was 32 tests. Added 6 new regression tests (2 for H-1, 2 for L-1, 2 for L-2).

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None - this task closes existing threat register entries (T-wje-01, T-wje-02, T-wje-03); no new security surface introduced.

## Self-Check: PASSED

- [x] a14fc76 exists: `git log --oneline | rg a14fc76` -- found
- [x] 94ef106 exists: `git log --oneline | rg 94ef106` -- found
- [x] 9a0cf51 exists: `git log --oneline | rg 9a0cf51` -- found
- [x] e207f0e exists: `git log --oneline | rg e207f0e` -- found
- [x] aggregate.mjs contains `invalid verdict` guard
- [x] aggregate.mjs contains `Windows reserved device name` guard
- [x] aggregate.mjs contains `exceeds ceiling` guard
- [x] lz-deep-research-schema.md contains `Phase 19 filename-safety rule` (git grep -c returns 1)
- [x] node --test exits 0 with 38 pass, 0 fail
