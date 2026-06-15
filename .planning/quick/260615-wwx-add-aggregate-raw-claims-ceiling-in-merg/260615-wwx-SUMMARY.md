---
phase: quick
plan: 260615-wwx
subsystem: lz-deep-research-aggregator
tags: [security, ceiling-enforcement, dos-mitigation, mergeClusters]
dependency_graph:
  requires: []
  provides: [aggregate-raw-claims-ceiling]
  affects: [lz-deep-research-aggregate.mjs, lz-deep-research-schema.md]
tech_stack:
  added: []
  patterns: [fail-closed ContractError, aggregate ceiling = MAX_FETCH * MAX_VERIFY_CLAIMS]
key_files:
  modified:
    - plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs
    - plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs
    - plugins/lz-advisor/references/lz-deep-research-schema.md
decisions:
  - "OQ-1: enforce MAX_FETCH * MAX_VERIFY_CLAIMS = 360 as the aggregate raw-claims ceiling in mergeClusters to close split-worker DoS bypass"
metrics:
  duration: ~3 minutes
  completed: 2026-06-15
---

# Quick Task 260615-wwx: Add Aggregate Raw-Claims Ceiling in mergeClusters (OQ-1) Summary

**One-liner:** Aggregate raw-claims ceiling (`MAX_FETCH * MAX_VERIFY_CLAIMS = 360`) added to `mergeClusters` to close cross-file claims DoS bypass (OQ-1).

## What Was Done

Added an aggregate ceiling check in `mergeClusters()` that fires AFTER the full
`for (const f of files)` read loop builds the `raw[]` array and BEFORE the
`const clusters = []` dedup loop. The ceiling is `CEILINGS.MAX_FETCH *
CEILINGS.MAX_VERIFY_CLAIMS = 15 * 24 = 360`. If `raw.length > 360`, a
`ContractError` is thrown with `claimsDir` as the `.file` annotation.

This closes OQ-1 from the security re-review: a compromised actor splitting a
large claim set across many small worker files (each under the per-file ceiling
of 120) could previously exhaust the O(n^2) merge loop. The new aggregate guard
catches the total and aborts before the loop runs.

## Changes

### Code (lz-deep-research-aggregate.mjs)

Inserted after the `for (const f of files)` loop, before `const clusters = []`:

```javascript
const TOTAL_RAW_CEILING = CEILINGS.MAX_FETCH * CEILINGS.MAX_VERIFY_CLAIMS;

if (raw.length > TOTAL_RAW_CEILING) {
  throw new ContractError(
    'total pre-merge claims exceed ceiling (' + raw.length + '>' + TOTAL_RAW_CEILING + ')',
    claimsDir,
  );
}
```

### Test (lz-deep-research-aggregate.test.mjs)

Added test `OQ-1 aggregate raw-claims ceiling: 4 workers x 100 claims (400 total > 360) throws ContractError`.

- 4 worker files x 100 claims each = 400 total raw claims
- Per-file ceiling (120) does NOT fire for 100-claim files
- Aggregate ceiling fires and throws ContractError matching `/exceed.*ceiling|total pre-merge/`

### Schema doc (lz-deep-research-schema.md)

Updated the `MAX_FETCH` row in the named-ceilings enforcement table to document
that `MAX_FETCH` is now ALSO enforced by the aggregator as the aggregate
raw-claims ceiling (`MAX_FETCH * MAX_VERIFY_CLAIMS = 360 total pre-merge claims
across all worker files`).

## Test Results

All 39 tests pass (was 38 before this task):

```
tests 39
pass  39
fail  0
```

## Deviations from Plan

None - plan executed exactly as written.

## Commits

| Hash | Message |
|------|---------|
| 0706bd0 | fix(aggregate): add aggregate raw-claims ceiling to close cross-file DoS (OQ-1) |

## Self-Check: PASSED

- `lz-deep-research-aggregate.mjs` modified with ceiling check: confirmed
- `lz-deep-research-aggregate.test.mjs` modified with OQ-1 test: confirmed
- `lz-deep-research-schema.md` modified with updated MAX_FETCH row: confirmed
- Commit 0706bd0 exists: confirmed
- All 39 tests pass: confirmed
