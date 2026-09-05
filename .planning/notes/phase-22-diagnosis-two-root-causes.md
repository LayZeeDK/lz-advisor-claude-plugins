---
title: "Phase 22 diagnosis -- two root causes, not three; and the n=60 gate was a coin flip"
date: 2026-09-06
context: "/gsd-explore session mapping the option space for Phase 23, after Phases 19/20/21/22 all failed to establish lz-deep-research's research quality. Research-first: three parallel gsd-phase-researcher passes (open-book agent validation; LLM-judge calibration practice; WiCE/LLM-AggreFact difficulty), then synthesis. This note records the DIAGNOSIS; the Phase-23 design it motivates lives in ROADMAP.md + REQUIREMENTS.md (ENV-*)."
---

# Phase 22 diagnosis: two root causes, not three

## The correction to the standing reading

The working premise entering this exploration was "0-for-3, each for a DIFFERENT reason -- so the
solution space is unmapped." The evidence does not support that. There are **two** failure modes across
the four phases, and Phase 22 hit **both simultaneously**.

| Phase | Stated cause | Actual root |
|---|---|---|
| 19/20 | construct mismatch | **construct** -- closed-book gold, open-book live-web system |
| 21 | validN 10 < floor of 24 | **power** |
| 22 | judge missed MCC 0.50 twice | **both** (below) |

This matters for planning: an unmapped space argues for exploring more designs, but a **named, recurring
pair of root causes** argues for selecting designs that are structurally immune to those two -- which is
what the Phase-23 ENV-* family does.

## Root cause 1 (construct): Phase 22's judge track had no successful branch

D-13 calibrated the judge on CLOSED-BOOK sentence-level entailment (WiCE) in order to grade OPEN-BOOK
long-form cited reports. That hop is documented to fail:

DATA_q7v3m2xk_START
Source: https://arxiv.org/html/2606.23915
"an off-the-shelf NLI scorer that is best on short-claim AttributedQA (AUROC 0.90) collapses to
AUROC 0.53 (chance) on long-form LFQA"; per-dataset rankings invert (Kendall tau = -0.64);
"metric choice must be validated on the target dataset rather than learned from others."
DATA_q7v3m2xk_END

**Consequence: even a PASS at MCC 0.6 would have carried no evidence forward to report grading.** The
Phase-22 measured track was void on both branches before the first verdict landed. Moving the closed-book
gold from the grader to the grader's CALIBRATOR did not escape the Phase-19/20 mismatch -- it relocated it
one layer up, where it was harder to see.

## Root cause 2 (power): the n=60 point-estimate gate was a coin flip

Verified in-session by simulation (200k draws, n=60, the realized 26 unrefuted / 34 refuted balance,
symmetric per-class error; script was a scratch file, reproducible from the parameters here):

```
symmetric per-class accuracy giving expected MCC 0.50: 75.2%
TRUE MCC == 0.50 exactly, 200k draws of n=60:
  median          0.5093
  95% interval    [0.2843, 0.7277]
  P(observed < bar) = 47.1%    <-- false-fail rate of a point-estimate gate
  n=100  [0.341, 0.674]  P(false fail)=48.8%
  n=200  [0.388, 0.633]  P(false fail)=46.9%
  n=400  [0.432, 0.591]  P(false fail)=47.1%
```

Two readings follow, and the second is the one that is easy to miss:

1. A judge whose TRUE MCC sits exactly at the bar fails a point-estimate gate ~47% of the time. The
   realized 0.4889 and 0.4531 are two draws from a distribution spanning [0.28, 0.73]. **They are not
   evidence the judge is inadequate. They are not evidence it is adequate either.**
2. **Raising n does not fix the false-fail rate** -- it narrows the interval but leaves the median on the
   bar, so P(false fail) stays ~47% at every n tested. The fix is to gate on a lower-bound CI (the
   prereg's SECOND condition, which both instruments PASSED) or to set the point bar meaningfully below
   the target -- not to collect more items.

The assumption is symmetric per-class error; the realized Opus 5 matrix was asymmetric (TPR 17/26 = 0.654,
TNR 27/34 = 0.794). Sampling-noise magnitude at n=60 is driven by n, so the conclusion holds, but the
figures above are a derivation under a stated assumption, not a measurement of the realized instrument.

## What this says about the standing hypotheses for the 0.45-0.49 result

- **"The collapse map is wrong" -- REFUTED by primary sources.** WiCE's own authors binarize exactly this
  way, and LLM-AggreFact does the same. See the SEED-003 update; the surviving fix is a two-poled subtle
  draw, not a different collapse.
- **"WiCE is genuinely harder than the bar assumes" -- NO.** WiCE is mid-pack, 6th-hardest of 11
  LLM-AggreFact subsets by mean leaderboard balanced accuracy (https://llm-aggrefact.github.io/). At the
  realized 26/34 balance, MCC 0.50 corresponds to ~75.2% balanced accuracy, which sits in the
  Claude-3-Opus (75.0) to Claude-3.5-Sonnet (77.7) leaderboard band on the WiCE column. The bar is a
  defensible TARGET with headroom above it.
- **"The two-token contract is lossy" -- REAL BUT SECOND-ORDER.** 3/60 (5%) verdicts carry reasoning
  contradicting their own token, against a 0.047 miss. Worth fixing at capture time (SEED-004), but small
  next to a +/-0.22 sampling interval.
- **The actual answer is root cause 2:** the bar was not unreachable, it was **unmeasurable at n=60**.

## What this says about D-13's disqualifier rule

A hard pre-use calibration gate is **not** standard practice, and D-13 was stricter than the reference it
was validating against -- which is the exact failure D-01 was written to avoid.

DATA_b4n8w1pd_START
Source: https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents
"Model grading often takes careful iteration to validate accuracy. LLM-as-judge graders should be
closely calibrated with human experts..." (a loop, no threshold)
"We recommend choosing deterministic graders where possible, LLM graders where necessary."
DATA_b4n8w1pd_END

Supporting: AHELM's GPT-4o critic scored 50.8% exact agreement over 197 human-scored instances and was
deployed anyway (https://arxiv.org/html/2508.21376v2). And a bare numeric bar is under-specified without a
fixed protocol -- protocol choice alone moved reported accuracy from 0.551 to 0.899 on a rubric benchmark
**without altering a single verdict** (https://arxiv.org/abs/2606.00093).

## The reframe that unlocks Phase 23

**The gold requirement was always downstream of the judge requirement.** Remove the judge and D-18's
"gold must come from free expert-labeled public datasets" constraint stops binding, because there is
nothing left to anchor.

And a model-authored reference baseline is the field norm for deep-research evaluation, not a compromise:

- DeepResearch Bench's RACE reference reports are "selected from deep research articles generated by the
  Gemini-2.5-pro-based Deep Research"; the score is S(tgt)/(S(tgt)+S(ref)), so 0.5 means
  parity-with-a-model (https://arxiv.org/abs/2506.11763).
- DeepConsult is reference-free pairwise win-rate against OpenAI Deep Research's own output, judged
  per-dimension and run twice with order flipped for position bias
  (https://github.com/Su-Sea/ydc-deep-research-evals).

That second one is Phase 22's Slice B almost exactly -- blind, position-swapped, per-dimension, model
baseline. **The comparative half of the design was already standard practice.** The non-standard additions
were D-13 (the disqualifier) and the gold anchoring, and those are the two that killed it.

## The ceiling that must be stated up front, never discovered

At n <= 5 paired questions no statistical superiority claim is reachable: the two-sided sign-test minimum
is 2 x 0.5^5 = 0.0625, and a perfect 5-for-5 sweep yields only a 95% Clopper-Pearson lower bound of
0.05^(1/5) = 0.549 -- "beats a coin flip." The frozen Slice-B set is n=3. D-07 was therefore right to
forbid CIs and use a count rule; Phase 23 must carry that ceiling in its pre-registration so a phase
ending without significance is not read as falling short.

Related and worth carrying: pairwise preference is held valid at SYSTEM level, but metric-level assessment
is said to require expert metric-wise annotation (https://arxiv.org/abs/2603.06942). Phase 22's
per-dimension LOSS counting is metric-level, so that read is weaker than an aggregate one.

## Contamination disclosure (binds Phase 23)

While checking whether a judge-free citation audit was even feasible, this session read the head and both
tails of the captured q1 report pair (`eval/.cache/p22-baseline/{builtin,lz}/qB1-run1.report.md`).
Observed: both completed, ~15 KB each, both citation-bearing but in DIFFERENT formats -- the built-in uses
numbered references to arXiv IDs in prose (0 inline URLs, 26 numbered ref markers, 10-item source list),
lz uses full inline URLs (32 occurrences, 12 unique) plus an explicit "fetched but produced no surviving
claims" section.

**Therefore any Phase-23 citation-audit metric has been proposed with partial sight of the q1 pair.**
Phase 23 must either freeze that metric's bar on q2/q3 (fresh captures) or state this contamination in its
own pre-registration. It must not pass silently. The format asymmetry matters independently: a
format-sensitive metric would silently favour lz, so normalization must be frozen before any rate is
computed.

## Two operational facts the record under-reports

- The built-in `/deep-research` q1 capture required **three resume cycles** (`resume`/`resume2`/`resume3`
  streams on disk), and its own report states an earlier attempt "hit a billing limit." The ~$66 figure is
  therefore retry-inflated: the ~3.6x cost headline is **confounded**, not merely n=1.
- **Zero MANIFEST files exist** under `eval/.cache/p22-baseline/`. Neither q1 capture is currently
  admissible as a validated capture under PAR-03/D-15, whatever grades it. `extractSystemInit` cannot pin
  a CC version from a real `system/init` event (security T-22-06 / validation B1). This is Stage-0 work
  for Phase 23 regardless of which measurement track runs.

## Unresolved ledger (never promote these to settled prose)

- *Binarizing a graded label RAISES rather than depresses agreement* (IR relevance assessment, Cohen's
  kappa 0.246-0.421 binary vs 0.107-0.215 graded) -- **abstain: non-authoritative source** (adjacent
  domain; IR relevance, not entailment). Moot for this design anyway, since the collapse is settled as the
  benchmark standard by WiCE's own authors.
- *BAcc -> MCC mapping (BAcc 75.0 -> MCC 0.471, 77.7 -> 0.524, ...)* -- **abstain: derived arithmetic, not
  measurement**; no source reports MCC on WiCE at all. This session substituted its own computation at the
  realized 26/34 prior (75.2% <-> 0.50); both are derivations under assumptions.
- *CoT vs direct-label effect on judge agreement* -- **abstain: unverifiable** (attributed to Judge-Bench
  by search summaries; the fetched abstract contains no mention of chain-of-thought).
- *No deep-research Elo/arena leaderboard exists* -- **abstain: unverifiable** (absence of search hits is
  not absence of the thing).
- *Tier-floor residual* -- `gsd_run query resolve-model gsd-phase-researcher` returned **empty** for both
  `--pick tier` and `--pick model`, which by the explore workflow's tier-floor rule would present every
  admit as an abstain. All three researchers were dispatched explicitly at `model: opus`, the admitted
  findings carry verbatim quotes plus primary URLs, and the decisive one (the n=60 power result) was
  independently re-derived in-session. Recorded as a disclosed deviation from the floor, not a silent one.
