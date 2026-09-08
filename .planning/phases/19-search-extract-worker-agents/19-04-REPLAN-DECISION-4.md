# 19-04 RE-PLAN-DECISION-4 -- the calibrator-run construct blocker + the cross-family board verdict

Status: DECISION RECORD (board-converged). Captures a construct-validity blocker found at the Task-4
calibrator boundary (zero model votes cast) and the unanimous cross-family board consensus on the fix.
Supersedes the stratum-assignment design in 19-04-REPLAN-DECISION-3 / 19-04-PLAN.md (the closed-book
realization + frozen primitives + pre-registration mechanics STAND; only the trap-strata definition + the
validity-probe contract change).

## What triggered this (the blocker)

Resuming `/gsd-execute-phase 19`, RE-PLAN-3 Tasks 1-3 were executed + committed (d9a9205 / e25f7ef /
a3f6029; 294 tests green). At the Task-4 calibrator boundary, a FREE enumeration pass (no model spend)
over the real assembler surfaced a construct-validity blocker:

- The assembler assigns the stratum deterministically by `isBuried = (INDEX of the deepest surviving doc
  in the 0..99 KS list >= BURIED_RANK_FLOOR=20)` (`eval/lz-eval-trap-assembler.mjs:404-414`).
- Measured (sizing.mjs + the real assembleStage1Traps throw): 62/122 Supported seeds have >=5
  strictly-pre-cutoff survivors (matches the prior ground truth), BUT because the ~8.6% dated survivors
  scatter across positions 0..99, the DEEPEST survivor index is almost always >= 20 (measured examples:
  97, 97, 96, 80, 76). So ALL 62 qualifying seeds classify as `buried` and ZERO as `evidence-absent`.
- The assembler then HARD-THROWS on the PRIMARY floor: `the PRIMARY evidence-absent stratum has fewer
  than perStratumFloor (3) ... got 0 (degenerate corpus -- no honest PRIMARY stratum)`. The calibrator
  cannot run.
- The committed pre-registration (a3f6029) asserts "rank-20 burial is impossible at median-5, so buried
  auto-drops and evidence-absent is PRIMARY." This conflated survivor COUNT (5) with survivor
  RANK/position (0..99). It is empirically FALSE.

This is the SECOND construct defect on this offline instrument (C1 -- the dispatch object/text return --
was the first, fixed by RE-PLAN-3).

## The board

Per a HIGH-impact-decision consult (user-authorized the AI-Credits spend), a cross-family advisory board
ran ONE parallel round on a self-contained packet (eval/.cache/board2/r1-packet.md), all reasoning
independently and blind to each other:

- In-family: a 3-advisor Opus panel (blind, diverse lenses -- measurement-validity / pragmatic-ROI /
  experiment-design) + an adversarial Opus synthesis (Workflow run wf_c4d0a6a2-ed7).
- Out-of-family (Copilot CLI): GPT-5.5 (eval/.cache/board2/r1-gpt55.txt) + Gemini-3.1-pro-preview
  (r1-gemini.txt). AI Credits this round ~21.6 (+ ~15 smoke).

## Consensus (UNANIMOUS, 5/5, no split)

OPTION A -- redefine the offline trap-strata to a SINGLE `evidence-absent` stratum (resist-uphold-on-
absence) and DROP `buried` entirely. Then re-pre-register and run the Sonnet calibrator. Let the result
drive VOID (the dominant likely terminal outcome) or a real follow-up.

Per the six pre-registered questions, all five advisors agreed:

1. WHOLE APPROACH: Option A (evidence-absent-only). Option C (probe-verified genuine deep refuters)
   collapses into A because such docs are likely few/zero. Option D (VOID-by-decision) is the wrong
   immediate move -- it discards the one untested arm for near-zero saved spend.
2. BURIED VALIDITY: buried is NOT validly + leak-safely constructible offline. The synthetic
   `disconfirmer=true` flag on an arbitrary deep surviving doc is text-unverified; the doc's text almost
   never refutes the specific mutated overreach. A blind probe would reject most synthetic-buried. Buried
   measures "is the voter fooled by a label with no real refuting evidence" -- a FAKE construct.
3. DROPPING BURIED: does NOT materially weaken the gate. Deep-refuter detection is a retrieval-adjacent /
   context-attention property, already deferred to the Phase-20 live shadow by the prior board. The
   offline gate's legitimate job is JUDGMENT; evidence-absent IS the judgment arm and the one genuinely-
   new arm (SUBTLE saturated 0/30==0/30; resist-uphold-on-absence was never tested).
4. RE-PRE-REGISTRATION: SOUND in the zero-votes window. No votes -> no result to shop. The amendment
   corrects a provably-false, capability-irrelevant predicate (count-vs-rank) and is motivated by corpus
   structure, not vote outcomes. Anti-result-shopping guardrail: lock the corrected spec BEFORE any vote.
5. WORTH IT vs VOID: FIX-AND-RUN. The fix is cheap (assembler stratum layer + pre-registration text only;
   frozen primitives untouched; dev tree; one bounded Sonnet calibrator). It delivers the single missing
   measurement: either it CONFIRMS saturation (justifying VOID WITH EVIDENCE instead of by fiat) or it
   finds Sonnet upholding-on-absence (a real Sonnet-below-ceiling finding). VOID is the dominant likely
   terminal outcome regardless.
6. EVIDENCE-ABSENT VALIDITY TRAP -- MANAGEABLE, but ONLY with a mandatory mitigation (else FATAL): a
   voter could LEGITIMATELY read the surviving supporting docs as upholding the overreach. Then
   "unrefuted" is the CORRECT read, NOT a false-uphold -- the GOLD label would be wrong, manufacturing a
   fake false-uphold that invalidates the gate (the same defect that killed buried).

## The mandatory mitigation -- a gold-blind validity probe (NEW, load-bearing)

Before any verify-vote, screen every candidate evidence-absent packet with a PRE-REGISTERED, GOLD-BLIND
model judge (no access to the AVeriTeC label, no knowledge of the mutation). It reads ONLY the
date-filtered surviving supporting docs + the mutated overreach claim and answers:

  "Do these docs, on their own, explicitly state OR directly entail the one-step OVERREACH (the stronger
   claim), or only the weaker ORIGINAL Supported claim?"

- DISQUALIFY (drop) any packet where the survivors plausibly entail/license the overreach -- there
  "unrefuted" is a legitimate read and gold=refuted is not defensible.
- RETAIN as valid gold=refuted ONLY packets whose survivors support the original claim but do NOT entail
  the overreach (the overreach is unsupported-by-the-packet, not contradicted) -- which is exactly the
  resist-uphold-on-absence behavior under test.

## Required guardrails (union of all advisors)

1. PRE-REGISTER BEFORE ANY VOTE: the corrected single-stratum policy, the gold-blind validity-probe
   prompt/rubric, the entailment-disqualification rule, the rejection threshold, the minimum retained-
   gold floor (>= 3, matching the assembler floor), and the VOID condition (retained set < floor).
2. PROBE RUNS BEFORE ANY VERIFY-VOTE and must be GOLD-BLIND (no AVeriTeC label, no mutation knowledge) --
   else it bootstraps the gold it is meant to validate and breaks closed-book.
3. DOCUMENT THE PREDICATE ERROR: the count-vs-rank conflation (deepest-survivor indices 97/96/80/76) +
   the synthetic-disconfirmer-flag finding, as the principled basis for the amendment (this file).
4. REPORT, do not silently absorb, the probe's dropped-packet count.
5. THE FLOOR IS LOAD-BEARING, NOT A KNOB: retained set < floor (3) = documented VOID; never tune the
   probe threshold toward a desired N (that is result-shopping).
6. FREEZE PRIMITIVES: only the assembler stratum-assignment layer + the pre-registration text are in
   scope. parseAvtDate / safeParse / dateFilter / staticKsAdapter / searchAndStop / the engine
   (EVAL_THRESHOLDS) / the driver / URL_DATE_RULE stay byte-identical.
7. The calibrator runs ONCE against the frozen spec; verify the mutation is a genuine one-step over-reach
   (unsupported by the seed's own KS), not still-entailed.
8. If the evidence-absent arm ALSO saturates (Sonnet near-ceiling on resist-uphold-on-absence) -> the
   documented terminal VOID; Sonnet-default ships.

## Two unmeasured numbers that decide the outcome

- N_retained: how many of the 62 qualifying seeds survive the gold-blind probe. If < 3 -> documented VOID
  (the corpus cannot honestly build the PRIMARY arm). UNMEASURED until the probe runs.
- Sonnet's resist-uphold-on-absence rate over the retained set. If ~0 (saturated) -> VOID. UNMEASURED.

## Impact framing (bounded)

A perfect offline gate cannot change the ship decision: Sonnet-default ships; a closed-book PASS does NOT
flip Haiku ON (the Phase-20 live shadow/canary is the named precondition); VOID is first-class. The gate's
maximum value is an EVIDENCE-JUSTIFIED VOID or a genuine Sonnet-below-ceiling finding.

## What this means for the plan (RE-PLAN-4 scope, if pursued)

- CHANGE: the assembler stratum-assignment layer -> evidence-absent-only (no synthetic disconfirmer; the
  packet = the date-filtered original supporting docs). Drop the `isBuried` deepest-survivor-index policy.
- ADD: the gold-blind entailment validity probe as a load-bearing pre-vote screen (a new model-judge role
  with a pre-registered rubric), replacing/sharpening the prior `validityProbe`.
- RE-PRE-REGISTER: lock-rule + manifest -> single stratum, the probe rubric + threshold + floor + VOID
  condition, the count-vs-rank correction; EVAL_THRESHOLDS + URL_DATE_RULE byte-identical; W-1-style
  anti-drift assertions updated in lockstep.
- RE-PROVE: the assembler tests (single-stratum; drop the buried-auto-drop/throw tests or re-point them)
  + the anti-drift tests, all FILE-form green, BEFORE any vote.
- THEN RUN: generate (Opus) -> gold-blind probe (drop invalid packets) -> pre-pass -> Sonnet calibrator
  (k>=5) -> reduce k->1 -> calibratorGate -> settle VOID vs PROCEED at the blocking human checkpoint.

Frozen primitives byte-unchanged throughout; the calibrator vote remains the only model-spend gate;
pre-registration commits before any vote.
