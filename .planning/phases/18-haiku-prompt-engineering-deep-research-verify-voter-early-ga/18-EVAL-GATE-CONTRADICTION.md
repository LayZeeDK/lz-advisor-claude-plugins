---
status: open-blocker
phase: 18-haiku-prompt-engineering-deep-research-verify-voter-early-ga
kind: locked-decision-contradiction
discovered: 2026-06-16
discovered_during: /gsd-execute-phase 18 (Plan 18-05 Task 2 pre-flight)
votes_cast: 0
decision: formally re-open via /gsd-discuss-phase + targeted replan (user, 2026-06-16)
affects_plans: [18-03, 18-04, 18-05]
sources:
  - eval/lz-eval-lock-rule.md
  - eval/lz-eval-aggregate.mjs
  - eval/lz-eval-dataset.mjs
  - eval/__fixtures__/lz-eval-manifest.json
  - 18-CONTEXT.md (D-02, D-02c, D-02d, D-05, D-06, D-07)
---

# Phase 18 eval gate contradiction: the SUBTLE open-book hard gate has no satisfiable data

## Summary

The pre-registered lock rule (Plan 18-03) names a single hard gate -- the SUBTLE-stratum,
**open-book**, Haiku-MINUS-Sonnet false-uphold DELTA -- but the committed dataset (Plan 18-04)
contains **zero examples that are both `stratum: subtle` AND `book: open`**. The two attributes are
disjoint by construction, so the gate as written is **unsatisfiable**: the false-uphold count is
computed over an empty sample, `clopperPearsonUpper(0, 0)` returns `1`, and `lockRuleVerdict`
returns `FAIL-RAISE` automatically.

This was discovered during `/gsd-execute-phase 18` at the Plan 18-05 Task 2 pre-flight, BEFORE any
model call (zero votes cast). Plans 18-01..18-04 are complete and 18-05 Task 1 (both voter agents)
is committed; only the live gating eval (18-05 Tasks 2/3) is blocked.

## Root cause: a contradiction among the locked decisions, not a build bug

The defect is upstream of the build, in the 18-CONTEXT.md locked decisions themselves:

- **D-02 / D-02d** -- the SUBTLE-overreach spine is **WiCE** (`partially_supported` -> `subtle`).
  WiCE is inherently **closed-book**: each record carries its own excerpt, has no knowledge store,
  and has no annotated publication date.
- **D-05** -- open-book retrieval is structurally exclusive to **AVeriTeC's revised KS**
  ("the SOLE retrieval source"), with a per-claim publication-date cutoff. WiCE claims have no KS
  entry and no annotated date, so they **cannot be voted in true open-book mode** -- there is
  nothing to retrieve and no cutoff to enforce.
- **D-02c** -- AVeriTeC is the open-book + leakage-test arm "only"; its most overreach-adjacent
  class (Conflicting / Cherry-picking) is **excluded from the hard-gate stratum**.
- **D-07 / lock rule** -- the sole hard gate is the SUBTLE **open-book** false-uphold DELTA.

"Subtle AND open-book" therefore requires claims that are simultaneously subtle (only WiCE supplies
these) and open-book (only AVeriTeC supports this) -- and D-02c removes AVeriTeC's subtle-adjacent
class. The intersection is empty by design.

## Evidence (verified in the working tree, not just quoted)

- `eval/__fixtures__/lz-eval-manifest.json`: 70 examples. By `source|stratum|book`:
  26 `wice|supported|closed`, 17 `wice|subtle|closed`, 17 `wice|not-supported|closed`,
  6 `averitec|open-book|open`, 4 `llm-aggrefact|stress|closed`.
  **`stratum=subtle AND book=open` = 0 rows.**
- `eval/lz-eval-aggregate.mjs`: the frozen gate quantity is `subtleOpenBookDeltaUpper` (subtle AND
  open-book jointly); `clopperPearsonUpper(0, 0) === 1`; `lockRuleVerdict({subtleOpenBookDeltaUpper:
  1, ...}) === 'FAIL-RAISE'`. The gate auto-fails on an empty sample.
- `eval/lz-eval-dataset.mjs`: `stratify()` hard-codes `source: 'wice', book: 'closed'` for every
  emitted row and has no AVeriTeC branch. AVeriTeC enters only via `fetchDataset()` (a bare hf-CLI
  download wrapper that assigns no stratum/book) and the hand-placed manifest rows. The loader
  **cannot synthesize a subtle+open row**.
- 18-04-SUMMARY silently renames the gate to the "closed-book SUBTLE gate," contradicting 18-03's
  "SUBTLE open-book" wording, without flagging the discrepancy. Neither plan/summary recorded the
  mismatch as an intentional decision or a risk.

## Why downloading more of the AVeriTeC knowledge store does NOT fix it

(Operator hypothesis 2026-06-16: "we downloaded specific KS paths; maybe include more.")

Correct that the AVeriTeC arm is under-populated (6 rows; KS unenumerated; fetch bounded to one
~2.7GB zip) and that more KS is needed to run the open-book AVeriTeC arm AT ALL. But more KS yields
more **non-subtle** fact-check claims, not subtle-overreach ones:

- D-02c **excludes** AVeriTeC's overreach-adjacent class from the hard-gate stratum.
- D-03 says the programmatic subtle-trap seeds come from **WiCE / ExpertQA, never AVeriTeC**.
- AVeriTeC's native labels (Supported / Refuted / NEI / Conflicting) have no
  `partially_supported` / subtle-overreach analogue, and the loader has no code to mint one.

So the gap is structural (subtle and open-book never meet in this design), not a download-size
problem. Voting the WiCE subtle claims against general web search is also **leakage-invalid** under
D-05 (the model would retrieve the WiCE source / published verdict).

## Reconciliation options (for discuss-phase deliberation)

| Option | Requires | Honors / bends | Leakage posture | Effort | Legit flip-on? |
|--------|----------|----------------|-----------------|--------|----------------|
| (a) Build subtle open-book from AVeriTeC | New loader AVeriTeC->subtle branch + label-map ruling + more KS + amend D-02c/D-03 + discrimination re-check | Honors D-05/D-07 literally; bends D-02, collides with D-02c/D-03 | Valid IF KS cutoff enforced; signal weak/contested (AVeriTeC kappa ~0.619) | HIGH | Yes, but low-confidence on a contested substratum |
| (b) Amend gate to closed-book SUBTLE | Pre-run edit of lock rule + gate semantics to subtle CLOSED-book DELTA (17 WiCE rows) | Honors D-02/D-02d/D-06; bends the word "open-book" in D-07 | Best (excerpt-only, no retrieval surface) | LOW | Yes -- strongest legit PASS |
| (c) Closed-book control only + raise-to-user | Run closed-book arms, declare nothing, raise the contradiction | Honors EVAL-03; defers D-05/D-07 | N/A | LOWEST | No |
| (d) (b) + keep AVeriTeC open-book as the leakage cross-check | (b)'s edit now; fetch the 6 AVeriTeC rows at eval time as the parametric-memorization diagnostic D-05 describes (not the gate) | Honors D-02/D-02d/D-06 AND D-05's stated PURPOSE for AVeriTeC; bends only the word "open-book" in D-07 | Cleanest | LOW-MED | Yes -- clean populated gate + leakage check |

## Recommendation carried into discuss-phase

Option (d): amend the sole hard gate to the SUBTLE **closed-book** WiCE false-uphold DELTA and retain
the AVeriTeC open-book rows as the leakage / parametric-memorization cross-check that D-05 always
specified. It is the only option that is both satisfiable today and high-confidence, and it honors
the spirit of every locked decision; the only thing bent is the literal "open-book" word in D-07,
which was never satisfiable for the WiCE spine.

## Reversibility window (load-bearing)

Amending a pre-registered lock rule is legitimate ONLY before the first model call (EVAL-04). Zero
votes have been cast (the run is paused), so re-deliberating and re-registering the gate NOW is a
normal pre-registration revision. After any vote, changing the gate to make a result pass is
post-hoc p-hacking and voids the pre-registration (T-18-POSTHOC). The window to choose is exactly
now.

## What stands regardless of the resolution

- 18-01 (EVAL-05 reference doc), 18-02 (eval/ install surface + jstat pin + CI gate), 18-03
  (aggregator engine + lock-rule prose), 18-04 (dataset loader + manifest + vendored WiCE) are
  complete and committed.
- 18-05 Task 1 (both voter agents, commit 459b4fd) is committed; the voters target the frozen vote
  schema and are unaffected by the gate-definition choice.
- What a replan touches: 18-03's lock-rule gate clause + `EVAL_THRESHOLDS`/`lockRuleVerdict`
  semantics, 18-05's eval-run gate consumption, and possibly 18-04's manifest/strata (only if
  Option (a) is chosen).

## Harness architecture note (decided during this session)

The gating eval will be run as a **dynamic Workflow driving nested voter subagents** (`agent({model,
schema})` per vote), NOT `claude -p` -- the existing pilot harnesses
(`plans/lz-research-verifier-*.wf.js`) prove the mechanism (lower overhead, built-in concurrency,
structured-output validation). Resumability must be added (filesystem vote persistence under the
gitignored `eval/.cache/` + skip-already-done on re-run, so an account switch + re-run continues).
The deterministic driver functions are to be unit-tested with branch/MC-DC + nullish/optional-chain
expression coverage and agent-reviewed before any full run. None of this is built yet (paused
pending the gate-definition decision).
