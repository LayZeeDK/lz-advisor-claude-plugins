---
quick_id: 20260615-address-review-findings-16-17
slug: address-review-findings-16-17
status: complete
completed: 2026-06-15
---

# Summary: Address lz-review findings for Phases 16/17/17.1/17.2

All 10 Important and Suggestion findings from the 4-pass comprehensive review addressed.
32 tests pass (was 25 before). 7 atomic commits.

## Commits

- 2947383 docs(aggregate): add explanatory comments for tally-before-SYNTH, extra-seat loop, and rank fidelity exclusion (I-6/S-2/S-4)
- 1228c68 docs(schema): fix worker field enforcement note (S-1) and document post-recheck corroboration narrowing (I-1)
- a6bbd3f test(aggregate): add partial-drop fixture asserting post-recheck corroboration narrowing (I-1)
- ddb4df3 test(aggregate): add partial-drop-rank-competition fixture for post-recheck rank ordering (I-5)
- 4307da0 test(aggregate): add multi-source cluster to ceilings fixture and pin rank-order + corroboration-DESC (I-3/I-4)
- 69492bb test(aggregate): add zero-claim baseline test (I-2)
- d2f6b31 test(aggregate): add synth-only-cap fixture for 21-24 band coverage (S-5/S-6)

## Gate

node --test .../lz-deep-research-aggregate.test.mjs: 32 pass, 0 fail, exit 0
