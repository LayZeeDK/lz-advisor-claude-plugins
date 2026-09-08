# 19-04 RE-PLAN-DECISION-5 -- the calibrator-read validity blockers + the cross-family board verdict

Status: DECISION RECORD (board-converged). Captures two construct/measurement-validity blockers found at
the Task-4 calibrator boundary AFTER a generate+probe PILOT (still ZERO Sonnet votes cast), and the
cross-family board consensus on the fix. AMENDS the read design in 19-04-REPLAN-DECISION-4 / 19-04-PLAN.md.
The closed-book realization, the frozen primitives, the single `evidence-absent` stratum, the gold-blind
entailment probe, and the pre-registration MECHANICS all STAND. RE-PLAN-5 ADDS: interleaved positive
controls, a mandatory out-of-family probe consensus, k=9 attack-mode-diverse seats, and a pre-registered
non-zero decision rule + probe-strictness rubric + reporting discipline.

## What triggered this

Resuming `/gsd-execute-phase 19`, RE-PLAN-4 Tasks 1-3 were executed + review-cleared (943ee2b / 65b13d3 /
1378314 / ee45e9e; 294 tests green). At the Task-4 boundary, BEFORE the Sonnet spend, the no-spend
enumerate confirmed 62 qualifying evidence-absent seeds (single stratum, 0 buried), and a transform-diverse
PILOT was run: 8 seeds (2 per transform class), each Opus-GENERATE (one-step overreach) -> in-family Opus
GOLD-BLIND PROBE. Result: 8/8 entails=false -> 8/8 RETAINED, 0 dropped. The generate outputs inspected as
genuine one-step overreaches.

The ~0 probe drop-rate is itself the trigger: it moved the likely-VOID path from "floor-drop" (probe drops
below the floor of 3) to "saturation" (Sonnet aces resist-uphold-on-absence). Saturation is an
ACCEPT-THE-NULL outcome -- and a null is only as strong as the read's power and the validity of its gold.
That prompted a max-quality board (operator directive: end-result quality is primary, token/credit budget
is not a concern).

## The board

A cross-family advisory board ran ONE parallel round on a self-contained packet (eval/.cache/board3/
r1-packet.md), all reasoning independently and blind to each other:

- In-family: a 3-advisor Opus panel (blind lenses -- measurement-validity / experiment-design-statistics /
  adversarial-skeptic). Workflow run wf_851775f1-aff.
- Out-of-family (Copilot CLI): GPT-5.5 (eval/.cache/board3/r1-gpt55.txt) + Gemini-3.1-pro-preview
  (r1-gemini.txt). AI Credits this round ~21 (+ ~15 slug-confirm smoke).

Full synthesis: eval/.cache/board3/r1-synthesis.md.

## Consensus

### UNANIMOUS (5/5) on the read mechanics
1. READ SCOPE / N: vote the FULL retained set (~55-62), NOT a sub-threshold pilot-stop. RELIABLE_TRIALS=15
   is a reportability FLOOR, not a stopping target; the pilot-of-8 is ONLY the first resumable batch
   (CP(0,8)~=0.31-0.37, in the FAIL region). Full N gives CP(0,62)~=0.047-0.058 vs CP(0,15)~=0.218 -- a
   ~4.6x tighter ceiling for free under budget-no-object. A sub-full cap is a pure validity loss.
2. k (votes per claim): RAISE above the MIN_K=5 floor to k=9 (zone 9-11). Under ANY-UPHOLD each extra vote
   is one more independent opportunity to expose a false-uphold -> strictly more conservative for a
   saturation/accept-the-null gate. Spend the higher k on SEAT DIVERSITY across distinct attack-modes
   (factual-contradiction / scope-causality-overclaim / source-provenance), not identical re-draws.
   Diminishing returns past ~11. k is at-or-above the frozen MIN_K floor (not a threshold change). Pick k
   ONCE here (re-choosing k after seeing Stage-1 would be a result-shopping vector that also pre-loads the
   Stage-2 Haiku delta's conservatism).
3. STATISTICS: the gate statistic is CP(0, N_claims) two-sided upper bound on the POOLED per-claim rate
   (matches the frozen engine -- calibratorGate.trials = N pooled claims). Do NOT report CP over N*k as if
   independent: the k votes share one packet/claim/prompt (positively correlated; the engine already
   treats every CP value as a LABEL, never a clustered CI). Per-vote 0/(N*k) is a LABELED SECONDARY
   diagnostic only. Report the PER-CLASS breakdown (~15/class) so a globally-clean pooled rate cannot mask
   a single weak transform class.

### TWO DECISIVE FINDINGS (convergent across families -- the read as specified is NOT yet trustworthy)

FINDING 1 -- NO CONTROL => a 0-false-uphold result is CONFOUNDED (Gemini + Opus measurement-validity +
Opus experiment-design, independently). Every retained seed is gold=refuted, so "Sonnet saturates" is
observationally identical to a DEGENERATE ALWAYS-REFUTE prior (a voter that refutes everything when
evidence is thin scores a perfect 0 for the WRONG reason and measures nothing). The design as written
defends against neither. MANDATORY: interleave gold=unrefuted POSITIVE CONTROLS -- native (unmutated)
AVeriTeC-Supported seeds whose date-filtered survivors genuinely entail the claim -- indistinguishable to
the voter. The voter SHOULD vote unrefuted on these. If Sonnet refutes the positive controls too, the
0-false-uphold result is an always-refute artifact and the saturation read is VOID/uninterpretable, not
PASS. This is a power/plumbing check that the gate can register a non-zero AND that the voter can uphold
when warranted.

FINDING 2 -- the in-family gold-blind PROBE is the SOLE gate on gold validity, is SAME-FAMILY with the
voter, and is DEMONSTRABLY TOO LENIENT -- proven on the committed pilot (all 5; the adversarial Opus lens
cited the file). Pilot seed 75: overreach "income has DOUBLED"; survivor #3 = "for decades >$200,000
annually ... in recent years ... millions in yearly income" -- $200K -> millions EXCEEDS 2x, so the
survivors plausibly ENTAIL "doubled" (the overreach is arguably an UNDERSTATEMENT of the evidence). The
in-family probe RETAINED it (entails=false) ONLY by a strict-literal "no explicit 2x ratio stated"
reading. A Sonnet voter reading the same packet loosely would CORRECTLY vote unrefuted -> scored as a FAKE
false-uphold against gold=refuted (the exact T-19-17 defect the probe exists to prevent). Because Opus
GENERATEd, Opus PROBEd, and Sonnet VOTES, all three may share the same strict-vs-loose entailment instinct,
so the probe's strictness is both unvalidated and same-family-correlated. MANDATORY: a SECOND, OUT-OF-FAMILY
gold-blind probe pass (GPT-5.5 + Gemini); a packet is RETAINED only if ALL probes agree entails=false; any
split DISQUALIFIES (drop, report the count). Pre-register the probe-strictness rubric in writing (e.g. is
"doubled" refuted when survivors support "more than doubled"?) BEFORE any vote.

## Required guardrails (union of all advisors; ADD to the RE-PLAN-4 guardrails, which all STAND)
1. PRE-REGISTER BEFORE ANY VOTE (zero-votes window; principled, anti-result-shopping -- no Sonnet votes
   exist): the positive-control construct + count + interleaving, the out-of-family probe-consensus rule
   (all-agree-retain), k=9 + the seat attack-mode assignment, the NON-ZERO DECISION RULE (what 1+ Sonnet
   false-upholds over N means: genuine below-ceiling PROCEED vs artifact-to-investigate, decided up front),
   the probe-strictness rubric, the CP(0,N) gate statistic + the per-vote-as-secondary rule + the per-class
   reporting, and FREEZE N_retained (the post-probe-consensus denominator) before vote 1.
2. OUT-OF-FAMILY PROBE is mandatory and all-agree-retain (Finding 2). It is the single highest-leverage
   de-confounder; the ~0 in-family drop-rate is precisely the signal that needs an independent check.
3. POSITIVE CONTROLS are mandatory and interleaved indistinguishably (Finding 1). Without them a saturated
   read is uninterpretable. Report the voter's positive-control accuracy alongside the false-uphold rate;
   a voter that refutes the positive controls VOIDS the saturation read (always-refute artifact).
4. min-not-met TRACE AUDIT on EVERY uphold (and ideally every clean vote): a verdict on a min-not-met /
   truncated / quota-killed trace is an artifact, not resistance -- it is a void/redo, never a below-ceiling
   PROCEED. Guard the no-abstention/quota re-cast against survivorship bias toward easy claims.
5. THE FLOOR IS STILL LOAD-BEARING: retained set (after the OUT-OF-FAMILY consensus probe) < floor 3 =
   documented VOID; never tune probe strictness toward a desired N (result-shopping). The OOF probe may
   drop more than the in-family pilot's ~0 (e.g. seed-75-class); if retained approaches the floor, that is
   VOID-on-floor (a categorically different outcome from saturation -- distinguish them in the artifact).
6. FREEZE PRIMITIVES: parseAvtDate / safeParse / dateFilter / staticKsAdapter / searchAndStop / the engine
   (EVAL_THRESHOLDS) / the driver / URL_DATE_RULE stay BYTE-IDENTICAL. In scope: the assembler (positive
   controls + multi-probe consumption), the dispatch (k=9 + seat diversity + positive-control handling +
   the no-confound voter prompt), the offline-read (positive-control scoring + the non-zero decision rule),
   the manifest + lock-rule + the assembler/aggregate/dataset tests (lockstep, anti-drift green).
7. GENERATE may stay in-family (Opus gold-aware generation is the lower-risk role); if a single role moves
   out-of-family, it MUST be the PROBE. Out-of-family GENERATE is a SECONDARY nice-to-have (removes the
   too-easy-trap risk) -- the planner may include it or defer it with a recorded rationale.
8. SCOPE OF A SATURATED READ (record explicitly): a clean 0 licenses ONLY "on AVeriTeC-derived
   single-dimension overreaches, with date-filtered packets an out-of-family probe confirms do not entail
   the claim, and with positive controls proving the voter CAN uphold when warranted, the Sonnet pooled
   false-uphold rate has a two-sided upper bound ~0.06 over N~=60." It does NOT generalize to buried-refuter
   / retrieval (Phase-20). Saturation correctly resolves to VOID (Haiku-first defers); a closed-book PASS
   never flips Haiku ON.

## What this means for the plan (RE-PLAN-5 scope)
- CARRY (no change): the single evidence-absent stratum + the gold-blind entailment probe rubric
  (RE-PLAN-4), the closed-book 3-part dispatch, the frozen primitives, the KS-enrichment date layer, the
  any-uphold k->1 reduction, the >=5-survivor + >=3-floor rules, the construct-scope boundary.
- ADD (the assembler + dispatch + driver + pre-registration): (a) interleaved gold=unrefuted POSITIVE
  CONTROLS from native Supported seeds (entailing packets; the voter should uphold); (b) the OUT-OF-FAMILY
  probe-consensus screen (all-agree-retain) layered with the in-family probe; (c) k=9 with attack-mode-
  diverse seats; (d) the NON-ZERO decision rule + probe-strictness rubric + CP(0,N)/per-class/min-not-met
  reporting discipline + frozen-N_retained.
- RE-PRE-REGISTER (lock-rule + manifest, zero-votes window): all of the ADD items above; EVAL_THRESHOLDS +
  URL_DATE_RULE byte-identical; anti-drift assertions updated in lockstep.
- RE-PROVE: the assembler/aggregate/dataset tests (positive-control construct + multi-probe consumption +
  the new pre-registration prose) FILE-form green BEFORE any vote.
- THEN RUN: generate (Opus) -> in-family + out-of-family gold-blind probes (all-agree retain; drop the rest)
  -> freeze N_retained -> pre-pass -> Sonnet calibrator k=9 diverse seats over the retained traps AND the
  interleaved positive controls -> reduce k->1 (any-uphold) -> calibratorGate over pooled refuted-trap
  verdicts + the positive-control accuracy + the min-not-met trace audit -> settle VOID vs PROCEED at the
  blocking human checkpoint (per the pre-registered non-zero decision rule).

## Two unmeasured numbers that still decide the outcome (now three)
- N_retained after the OUT-OF-FAMILY consensus probe (expected lower than the in-family ~0-drop pilot; if
  < 3 -> documented VOID-on-floor).
- Sonnet's resist-uphold-on-absence rate over the retained refuted traps (~0 -> saturated -> VOID).
- Sonnet's positive-control accuracy (if it refutes the controls too -> always-refute artifact -> VOID/
  uninterpretable, NOT a clean saturation).

## Impact framing (bounded, unchanged)
A perfect offline gate cannot change the ship decision: Sonnet-default ships; a closed-book PASS does NOT
flip Haiku ON (Phase-20 live shadow/canary is the named precondition); VOID is first-class. The gate's
maximum value is an EVIDENCE-JUSTIFIED, UN-CONFOUNDED VOID or a genuine Sonnet-below-ceiling finding.
