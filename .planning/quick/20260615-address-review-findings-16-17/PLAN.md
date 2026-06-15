---
quick_id: 20260615-address-review-findings-16-17
slug: address-review-findings-16-17
status: planned
created: 2026-06-15
---

# Address lz-review findings for Phases 16/17/17.1/17.2

Address all Important (I-1 through I-6) and Suggestion (S-1, S-2, S-4, S-5/S-6) findings from
the 4-pass comprehensive review. Full report at:
.planning/phases/17.2-address-lz-review-findings-for-lz-deep-research-aggregator-r/17.2-COMPREHENSIVE-REVIEW.md

## Files to modify

- plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs
- plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs
- plugins/lz-advisor/references/lz-deep-research-schema.md
- plugins/lz-advisor/skills/lz-deep-research/scripts/__fixtures__/ (add/modify fixtures)

## Tasks

### Task 1: Fix schema drift -- corroboration_lower_bound post-recheck semantics (I-1) + worker field (S-1)
File: lz-deep-research-schema.md
- Add note to corroboration_lower_bound row: value is the POST-recheckClusters distinct-source Set
  size (sources whose only member was quote-dropped no longer count)
- Change worker field Required column from "yes" to "informational (not enforced by aggregator)"

### Task 2: Add partial-drop fixture (I-1)
New fixture: __fixtures__/partial-drop-corroboration-narrowed/
- 3 workers (w1/w2/w3), 3 distinct sources (s1/s2/s3), same claim text (Jaccard >= 0.6)
- excerpts/e1.txt: contains the quote (s1's member is verified)
- w1: source s1, excerpt_id e1, quote matches e1 -> verified
- w2: source s2, excerpt_id e2, quote does not match any excerpt -> dropped (fabricated)
- w3: source s3, excerpt_id e2, same as w2 -> dropped
- Result: cluster has 3-source merge-time corroboration, post-recheck sources = {s1} only
- votes/cluster0-{0,1,2}.json: all unrefuted (High)
- Test assertion: r.survivors[0].corroboration_lower_bound === 1

### Task 3: Add zero-claim test (I-2)
File: lz-deep-research-aggregate.test.mjs
- tmpdir test with no claims/ directory at all
- Assert r.survivors.length === 0, r.dropped.length === 0, summary matches /^raw: 0 /m

### Task 4: Add rank-order assertions to SC5-5 (I-3)
File: lz-deep-research-aggregate.test.mjs:524-542
- assert.equal(r.survivors[0].id, 'cluster0')
- assert.equal(r.survivors[1].id, 'cluster1')

### Task 5: Modify ceilings-enforced fixture for multi-source ranking (I-4)
Fixture: __fixtures__/ceilings-enforced/
- Add a 32nd worker (w32.json) with source 's-multi-a' and same claim text as w01
- Add a 33rd worker (w33.json) with source 's-multi-b' and same claim text as w01
- Both cite excerpt e01 (existing), quote matches -> verified
- Result: cluster with 2-source corroboration (s-multi-a, s-multi-b) ranks first (before all singletons)
- Update test SC5-5: assert r.survivors[0].corroboration_lower_bound >= 2
- Update claim counts (was 31, now 32 distinct claims + the 2 extra workers that MERGE with w01)
  Actually: w01 text + w32/w33 text (same) -> 1 cluster (corroboration 3) + 30 singleton clusters = 31 clusters
  -> MAX_VERIFY_CLAIMS=24 still fires (31 > 24)
  -> But now the multi-source cluster ranks first (corroboration 3 > 1)

### Task 6: Add downgrade-then-cap fixture (I-5)
New fixture: __fixtures__/partial-drop-rank-competition/
- Multiple clusters competing for the 24/20 cap slots
- One cluster starts with 3-source corroboration, 2 sources' members are dropped (fabricated quotes)
  -> post-recheck corroboration 1
- Other clusters have 1-source corroboration (identical to the downgraded one)
- The cluster that was reduced should end up at the same rank level as singletons
- Total: enough clusters so caps fire

### Task 7: Add tally-before-SYNTH comment (I-6)
File: lz-deep-research-aggregate.mjs near line 621
- One-line comment: intentionally runs tally on all capped clusters before SYNTH_CAP;
  votes_ignored may include counts from SYNTH_CAP-discarded clusters

### Task 8: Add extra-seat loop comment (S-2)
File: lz-deep-research-aggregate.mjs:558-572
- Comment explaining the loop has no upper bound and stops at the first gap

### Task 9: Add quote_fidelity rank exclusion comment (S-4)
File: lz-deep-research-aggregate.mjs in rankClusters
- One-line comment: quote_fidelity excluded from ranking; it is output annotation, not priority

### Task 10: Add 22-cluster synth-only fixture + test (S-5/S-6)
New fixture: __fixtures__/synth-only-cap/
- 22 distinct non-mergeable claims (22 workers with distinct sources, distinct claim texts)
- All quotes verified (matching excerpts)
- No votes files (or minimal votes) -> result: some Unsupported, does not matter
- Total clusters: 22
- MAX_VERIFY_CLAIMS=24: 22 <= 24, so claims cap does NOT fire
- SYNTH_CAP=20: 22 > 20, so synth cap fires
- Test assertions:
  - r.survivors.length === 20
  - !r.summary.includes('claims') (no claims cap)
  - r.summary matches /^capped: synth \d+->20$/m

## Gate
After all changes: node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs
All tests must pass (suite exits 0).
