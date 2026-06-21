# Plan 20-05 SUMMARY -- the LIVE certified-WORKS verify-voter certification

**Outcome:** NOT WORKS -> RAISE (settle-OR-raise, D-01). The Sonnet-default verify-voter SHIPS regardless as
the orchestrator's verify stage; the Haiku-first flip stays DEFERRED (D-06). The shippable milestone outcome
(the `lz-deep-research` skill) NEVER depended on the cert verdict.
**Full verdict + math:** `20-05-LIVE-CERT-RESULT.md`. **Date:** 2026-06-21.

## What 20-05 set out to do
Run the staged, pre-registered, human-authorized live two-arm certification of the verify-voter: ESTIMAND B
over-refusal (sensitivity, CP-upper <= TAU_OR 0.15) + ESTIMAND A false-uphold (specificity, CP-upper <= TAU_FU
0.10), never pooled; WORKS iff BOTH pass; settle the Sonnet-default + the Haiku flip.

## What happened (the journey)
1. NO-SPEND gates (this session): keep-superset-only evidence packaging (15b811b); B-1 evidenceSha cache
   fingerprint (598e39e); the rest-of-Phase-20 test+review gate (req #6) -- full eval suite 540/540, drivers
   guarded+tested, independent review CLEAN.
2. ARM A (false-uphold) -- VOID-on-power: the clean-evidence arm-A re-test (user-approved, LZ_SPEND) returned
   1/16 retained -> CONFIRMS arm A is structurally VOID on-distribution (the pipeline extracts each claim FROM
   its evidence, claim ~= evidence -> the corpus under-produces traps). Manual minimal-edit construction had
   already failed its lexical-AUC gate (D-22). Off-distribution Phase-19 MCC SCREEN-PASS is the only (NON
   -certifying) specificity evidence.
3. ARM B (over-refusal) -- harvest + gold: 40 controls harvested, 30 OOF-confirmed (closed-book excerpt
   -entailment), 10 oof-split. M-1 credit-capture fixed (the copilot CLI interleaves ANSI in the AI-Credits
   line). Arm-B OOF gold spend ~79 AI Credits (3x my disclosed estimate -- surfaced + the per-call ~8 calibration
   recorded in memory).
4. ARM B -- voting: the shipping Sonnet voter (OPEN-BOOK, live web) voted the 30 via dedicated
   `claude -p --plugin-dir` voter sessions (lz-advisor is project-disabled, so --plugin-dir is the load path;
   a while-read piped-stdin DRAIN bug was found + fixed). Result: 4/30 refuted -> CP 0.28 > 0.15 (nominal
   breach). Inspection: the 4 are the voter correctly refuting overclaimed/contradicted controls.
5. RESEARCH + CROSS-FAMILY BOARD (user-directed, for the un-recipe'd call): a research pass
   (`20-05-PROVE-DISPROVE-RESEARCH.md`) + a 4-member board (2 Opus lenses + GPT-5.5 + Gemini;
   `20-05-PROVE-DISPROVE-BOARD-DECISION.md`; ~20.3 credits) CONVERGED UNANIMOUSLY: the breakdown is a
   WRONG-CONSTRUCT problem (closed-book gold vs open-book voter); do a PRE-REGISTERED TWO-SIDED re-adjudication
   -> a SCOPED sensitivity-only certificate, NOT full WORKS (sunk-cost); guards: two-sided (must be able to
   convict), N-floor never-pass-at-reduced-N, don't-launder-into-WORKS, defer the Haiku flip.
6. RE-ADJUDICATION (Bundle 2, pre-registered `20-05-REJUDICATION-PREREGISTRATION.md`, 7.09 credits): both OOF
   models judged all 4 disputed + 6 blind agreed as SUPPORTED -> the 4 stand as over-refusals (NOT gold
   errors); 0 false-upholds (the two-sided guard was operative). BUT the OOF re-adjudication judged from
   evidence + training knowledge (no live web), so by the board's own unanimous Q1 it is STILL construct
   -mismatched for an open-book live-web voter -> it cannot validly establish the voter over-refuses ->
   VOID-on-construct (NOT a clean DOES-NOT-WORK; the raw 4/30 reported transparently, not laundered).

## The verdict
- Sensitivity (over-refusal): VOID-on-construct. Specificity (false-uphold): VOID-on-power. -> NOT WORKS -> RAISE.
- Sonnet-default ships (D-01). Haiku flip DEFERRED (D-06). Anti-result-shopping intact (frozen primitives
  byte-identical; two arms never pooled; the pre-registered re-adjudication output reported as-is).

## RAISED (future work, the construct-aligned path; NOT this milestone)
The shared root of both arms is the construct mismatch (closed-book/knowledge gold vs open-book live-web
voter). To validly resolve sensitivity: build an OPEN-BOOK over-refusal gold whose adjudicators perform the
SAME live-web search the voter does (with per-item reasoning + bounded leakage), then re-run arm B against it;
only then is a SCOPED sensitivity-only certificate (or a clean DOES-NOT-WORK) valid. The false-uphold arm
remains structurally VOID on-distribution.

## Pointers
- `20-05-LIVE-CERT-RESULT.md` (FINAL verdict + the per-estimand math + spend; Stage-0 RAISE retained below as
  historical). `20-05-PROVE-DISPROVE-RESEARCH.md` + `20-05-PROVE-DISPROVE-BOARD-DECISION.md` (the research +
  board). `20-05-REJUDICATION-PREREGISTRATION.md` (the frozen re-adjudication contract).
- Sub-summaries: `20-05-ARMA-BUILD-SUMMARY.md`, `20-05-EVIDENCE-JOIN-SUMMARY.md`, `20-05-OOF-PREP-SUMMARY.md`,
  `20-05-PACKAGING-SUMMARY.md`, `20-05-PACKAGING-FIX2-SUMMARY.md`.
- Gitignored audit (eval/.cache/p20-live/): the drivers + the result JSONs + the board/research briefs.
