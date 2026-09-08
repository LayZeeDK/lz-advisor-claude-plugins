# Phase 23: Judge-free confidence and operating envelope for lz-deep-research - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md -- this log preserves the alternatives considered.

**Date:** 2026-09-06
**Phase:** 23-judge-free-confidence-and-operating-envelope-for-lz-deep-res
**Invocation:** `/gsd-discuss-phase 23 --analyze --auto`
**Areas discussed:** Capture budget + ENV-04 contamination route, ENV-05 spike clearing bar, Slice-A draw size, plus four auto-locked areas

---

## Mode note -- why three areas were NOT auto-locked

`--auto` auto-picks the recommended option for every gray area with no human checkpoint. The GSD
house rule carves out one quadrant: HIGH IMPACT (hard to reverse -- freezes a contract, consumes
spend, or is inherited downstream) combined with NOT-HIGH CONFIDENCE (the recommendation is a bare
default, or contradicts the phase's own text). Three areas landed there and were escalated to the
maintainer instead.

The capture-budget question in particular could not be auto-locked: doing so would have reproduced
blocking anti-pattern #3 -- "agent-side scope reduction carried forward as settled design", the exact
failure that produced Phase 22's un-ratified n=1 -- in the very phase written to prevent it.

---

## Capture budget + ENV-04 contamination route

Trade-off analysis presented (`--analyze`):

| Option | Fresh captures | ENV-04 route | Cost signal from the record |
|---|---|---|---|
| Zero fresh | none | (b) disclose contamination | ~$0 capture; n=1, no per-question generalisation |
| One pair (q2) | 1 built-in + 1 lz | (a) freeze bar on fresh q2 | ~1.4 pool windows built-in side |
| Full n=3 | 2 built-in + 2 lz | (a) freeze bar on fresh q2/q3 | ~2.8 windows, multi-day paced |

| Option | Description | Selected |
|--------|-------------|----------|
| One fresh pair, q2 | Capture q2 on both systems, gated behind the ENV-05 spike. Uncontaminated pair to freeze the ENV-04 bar on (route (a)); q1 retained as a disclosed second data point. n=2. The deviation note's option 2, done properly -- an explicit smaller freeze in Phase 23's own pre-registration, ratified at discuss time. | YES |
| Zero fresh -- disclose only | Read only the existing q1 pair after ENV-02 makes it admissible; ENV-04 takes route (b). Cheapest and fully honest, but the bar would be set by a session that had already seen the pair, and n=1 forecloses per-question generalisation entirely. | |
| Full n=3 -- honour the frozen set | Capture q2 and q3, honouring Phase 22's frozen n=3. Best coverage; ~2.8 pool windows on the built-in side, multi-day, and front-loads that spend before the spike has said whether a capture completes at all. | |

**User's choice:** One fresh pair, q2 (the recommended option).
**Notes:** Settles both the capture count and the ENV-04 route in one decision, since route (a)
requires a pair no session has read. Recorded as CONTEXT.md D-01/D-02/D-03/D-04. The n<=5 significance
ceiling is unaffected -- n=2 buys coverage and an uncontaminated bar, never significance.

---

## ENV-05 spike clearing bar

Trade-off analysis presented (`--analyze`): ENV-05's literal text says a capture must complete "inside
one 5-hour pool window", but the Phase-22 q1 capture needed three resume cycles across two windows. A
strict reading fails by construction on evidence already in hand.

| Option | Description | Selected |
|--------|-------------|----------|
| Bounded resumes | Clears if a verification-complete report is reached within a ceiling frozen before the spike runs -- at most 3 resume cycles across at most 2 reset windows, the two-window protocol validated in Phase 22. The ceiling itself becomes an envelope finding. | YES |
| Strict one window | Clears only on a single uninterrupted window. Most faithful to ENV-05's wording and cheapest, but a near-certain fail on the record -- ENV-06 never fires and the source terminates on branch (b) for an already-documented reason. Legitimate, but uninformative. | |
| Completes at all | Clears whenever a complete report is eventually obtained, resumes unbounded. Maximises the chance ENV-06 runs but strips the budget bound from the envelope finding and leaves the spike with no natural stopping point. | |

**User's choice:** Bounded resumes (the recommended option).
**Notes:** Recorded as CONTEXT.md D-05/D-06/D-07. The pre-registration must state explicitly that this
is a deliberate, ratified reading of ENV-05 rather than drift, and must state why -- so a later reader
does not mistake it for the requirement quietly loosening.

---

## Slice-A draw size

Trade-off analysis presented (`--analyze`): Slice A is descriptive-only and never a pass/fail, so n
gates nothing; it only sets how coarse the per-direction read is. The pool was re-verified at zero
spend during this discussion: 83 unrefuted / 181 refuted.

| Option | Description | Selected |
|--------|-------------|----------|
| Balanced 40 (20/20) | Well clear of the >=8/>=8 gate, balanced so neither confusion-matrix direction dominates the per-direction read, bounded voter spend on the shared session pool. | YES |
| Minimum 16 (8/8) | Exactly clears the frozen gate; cheapest, maximum pool left for captures. But one verdict swings a direction by 12.5pp, making the read very coarse. | |
| Large 100 (50/50) | Richest description within the balanced pool (capped by 83 unrefuted). ~2.5x the voter spend, competing with the captures for the same pool, and buys description rather than inference. | |

**User's choice:** Balanced 40 (20/20) (the recommended option).
**Notes:** Recorded as CONTEXT.md D-08/D-09. Balance is load-bearing because ENV-03 mandates
per-direction, never-pooled reporting.

---

## Auto-locked areas (outside the trap quadrant)

| Area | Locked choice | Impact | Confidence | Basis |
|---|---|---|---|---|
| ENV-02 fix shape | Read `claude_code_version`, keep `version` as fallback | Low | HIGH | Empirically verified this session against the real `system/init` event |
| Citation-audit evidence source | Quote-match against stored excerpts; live re-fetch only for resolvability | Medium | HIGH | ENV-04 requires a DETERMINISTIC audit; network-dependent matching is not reproducible |
| Citation-format normalization | Normalize to a system-agnostic identifier set, frozen before any rate | High | HIGH | Requirement text + the advisory anti-pattern already fix the direction, so not trap-quadrant |
| Seed disposition | SEED-005 transfers; SEED-002/003/004 dormant, not-consumed-because-no-gate | Low | HIGH | The no-third-judge constraint is already locked in ROADMAP |
| ENV-07 artifact | Committed `23-ENVELOPE.md` in the phase dir | Low | -- | Conventional |

---

## Zero-spend findings produced during the discussion

Both were verified in-session rather than assumed, and both correct the standing record:

1. **`extractSystemInit` reads the wrong field.** The real `system/init` event carries
   `claude_code_version: "2.1.186"`; `event.version` is `undefined`. `lz-eval-baseline-manifest.mjs:91`
   reads `event.version`, so the ContractError at :94 fires on every real capture. Mechanical cause of
   security T-22-06 / validation gap B1; the fix is one field.
2. **The Slice-A yield does not reproduce the frozen record.** `filterSliceA` over the on-disk 500-row
   AVeriTeC dev cache yields 83 unrefuted / 181 refuted, against the pre-registration's recorded 95/216
   from 2026-06-22. The gate still clears with wide margin, but planning must use 83/181 and the
   discrepancy must be recorded in the ENV-01 pre-registration rather than silently reconciled.

---

## Claude's Discretion

- Plan/wave decomposition of ENV-01..ENV-08 and which plans pair.
- The deterministic sampling seed and selection routine for the 20/20 draw (value is Claude's; it must
  be pre-registered).
- The q2 question text, within the bounded single-facet shape that made captures feasible at all.
- The internal structure of `23-ENVELOPE.md`.

## Deferred Ideas

- Reviving a calibrated judge gate, and with it SEED-002/003/004 -- forbidden in this phase by the
  ROADMAP constraint.
- q3 / the full frozen n=3 campaign -- considered and declined on cost at discuss time. Recorded as a
  ratified scope choice, NOT an agent-side reduction. A later phase may capture it under its own
  pre-registration.
- The lz-deep-research workflow re-architecture -- deferred to a later milestone.
- Release/publication -- handled at `/gsd-complete-milestone`.
