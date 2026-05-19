# 08-MEASUREMENT.md: P2-ADVISOR fixture-grade measurement

**Plan:** 08-03 (advisor-fragment-grammar-measurement)
**Gate:** D-02 compound OR-gate (08-CONTEXT.md)
**Sample size:** n=3
**Generated:** 2026-05-19T06:34:04.583Z

## Scenarios

| # | Scenario | Prompt | Trace path |
| --- | --- | --- | --- |
| 1 | Compodoc | Set up Compodoc with Storybook in this Nx Angular library. Add a sample input and a sample output to our component using the input() and output() signal functions. The Docs tab should render JSDoc descriptions for the component, the input, and the output. | uat-replay-0.14.x/scenario-1-plan.jsonl |
| 2 | Feature implementation | Add a debounced search input component to my Angular library. It should use the signal-based control flow, accept placeholder text, and emit search events after 300ms debounce. | uat-replay-0.14.x/scenario-2-plan.jsonl |
| 3 | Refactor | Extract a shared validation utility from these 3 components: UserForm, AddressForm, PaymentForm. Each currently has duplicate email + phone + zipcode validators. Place the shared utility in libs/shared-validators. | uat-replay-0.14.x/scenario-3-plan.jsonl |

## Per-run results

| Run | Scenario | Aggregate (w) | Total items | Per-item words (csv) | Code-block flag (csv) | Assuming-frame flag (csv) | Per-item over-cap (csv) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Compodoc | 80 | 7 | 18,9,8,13,12,12,8 | 1,1,1,1,1,1,1 | 0,0,0,0,0,0,0 | 1,0,0,0,0,0,0 |
| 2 | Feature implementation | 85 | 7 | 13,12,11,14,12,8,15 | 1,1,1,1,1,1,1 | 0,0,0,0,0,0,1 | 0,0,0,0,0,0,0 |
| 3 | Refactor | 107 | 9 | 18,13,13,8,19,11,10,9,6 | 1,1,0,0,1,0,1,1,0 | 1,0,0,0,1,0,0,0,0 | 0,0,0,0,0,0,0,0,0 |

## Gate decision

- **D1 (code-block disjunct):** PASS -- 1/3 runs have >=1 code-block item over per-item cap (>15w fragment / >22w Assuming-frame). Threshold: >=2/3 for FAIL.
- **D2 (aggregate disjunct):** PASS -- mean aggregate = 90.7w; 0/3 per-run aggregate >110w. Threshold: mean>100 AND >=2/3 runs >110w for FAIL; mean in [98,105] AND non-decisive per-run for INCONCLUSIVE.
- **Compound verdict:** PASS
- **Disposition:** N/A (P2 closes structurally; no Plan 4)

## Recommendation

- **Plan 4 ships:** NO
- **P2 residual closes structurally:** advisor budget contract holds on n=3 evidence. Plan 4 does NOT ship.

## Raw evidence (per-item flag matrix)

### Run 1 (Compodoc)

- Parser log: `.planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/uat-replay-0.14.x/scenario-1-parser.log`
- Trace: `uat-replay-0.14.x/scenario-1-plan.jsonl`
- Aggregate: 80w
- Total items: 7

| Item | Words | Frame? | Code-block? | Over per-item cap? |
| --- | --- | --- | --- | --- |
| 1 | 18 | no | yes | YES |
| 2 | 9 | no | yes | no |
| 3 | 8 | no | yes | no |
| 4 | 13 | no | yes | no |
| 5 | 12 | no | yes | no |
| 6 | 12 | no | yes | no |
| 7 | 8 | no | yes | no |

### Run 2 (Feature implementation)

- Parser log: `.planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/uat-replay-0.14.x/scenario-2-parser.log`
- Trace: `uat-replay-0.14.x/scenario-2-plan.jsonl`
- Aggregate: 85w
- Total items: 7

| Item | Words | Frame? | Code-block? | Over per-item cap? |
| --- | --- | --- | --- | --- |
| 1 | 13 | no | yes | no |
| 2 | 12 | no | yes | no |
| 3 | 11 | no | yes | no |
| 4 | 14 | no | yes | no |
| 5 | 12 | no | yes | no |
| 6 | 8 | no | yes | no |
| 7 | 15 | yes | yes | no |

### Run 3 (Refactor)

- Parser log: `.planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/uat-replay-0.14.x/scenario-3-parser.log`
- Trace: `uat-replay-0.14.x/scenario-3-plan.jsonl`
- Aggregate: 107w
- Total items: 9

| Item | Words | Frame? | Code-block? | Over per-item cap? |
| --- | --- | --- | --- | --- |
| 1 | 18 | yes | yes | no |
| 2 | 13 | no | yes | no |
| 3 | 13 | no | no | no |
| 4 | 8 | no | no | no |
| 5 | 19 | yes | yes | no |
| 6 | 11 | no | no | no |
| 7 | 10 | no | yes | no |
| 8 | 9 | no | yes | no |
| 9 | 6 | no | no | no |

