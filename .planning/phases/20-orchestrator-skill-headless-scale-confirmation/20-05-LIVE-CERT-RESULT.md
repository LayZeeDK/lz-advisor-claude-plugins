# 20-05 LIVE certified-WORKS result -- FINAL (the verify-voter certification outcome)

**Date:** 2026-06-21 (supersedes the Stage-0 RAISE record below: after that halt, the budget reset, the
harvest succeeded across 8 canonical run dirs, and the cert ran end-to-end to the verdict here).
**Verdict:** NOT WORKS -> RAISE (settle-OR-raise, D-01). The Sonnet-default verify-voter SHIPS regardless;
the Haiku-first flip stays DEFERRED (D-06). Neither error-rate arm validly certifies on-distribution.
**Authority:** the pre-registered lock rule (`eval/lz-eval-live-lock-rule.md`), the board decision
(`20-05-PROVE-DISPROVE-BOARD-DECISION.md`), the re-adjudication pre-registration
(`20-05-REJUDICATION-PREREGISTRATION.md`), the research (`20-05-PROVE-DISPROVE-RESEARCH.md`). Frozen
primitives consumed byte-identical; the two arms never pooled.

## One-line outcome
WORKS could be neither cleanly certified NOR cleanly refuted on the maintainer-curated production
distribution: the FALSE-UPHOLD (specificity) arm is VOID-on-power, and the OVER-REFUSAL (sensitivity) arm is
VOID-on-CONSTRUCT (the gold construct does not match the open-book live-web production construct). RAISE.

## ESTIMAND B -- over-refusal (sensitivity): VOID-on-construct
- Arm B harvested 40 SUPPORTED controls; 30 OOF-confirmed (closed-book excerpt-entailment), 10 oof-split.
- The shipping Sonnet voter (OPEN-BOOK, live web -- the production construct) voted over the 30 controls:
  4 `refuted` / 30 -> raw CP1s-upper = 0.2796 > TAU_OR 0.15 (a nominal over-refusal gate breach).
- INSPECTION: all 4 refutes are the voter, via live-web disconfirming search, finding the claims overreach or
  contradict the broader literature (transformer/cluster38: the claim says a scaling law "underestimates"
  while the voter found the cited paper says "OVERestimates" -- the claim contradicts its own source;
  crispr/cluster47: the claim conflates a gene with its erythroid-specific enhancer).
- BOARD RULING (unanimous Q1): the controls' gold was built CLOSED-BOOK (does the excerpt entail the claim?),
  but the voter runs OPEN-BOOK (is the claim true given the live-web literature?). DIFFERENT CONSTRUCTS; the
  closed-book gold systematically mismeasures the voter, so 4/30 is confounded with CORRECT refutes of
  overclaimed controls (control label-noise).
- PRE-REGISTERED TWO-SIDED RE-ADJUDICATION (Bundle 2; `20-05-REJUDICATION-PREREGISTRATION.md`): the 4 disputed
  + a seed-pinned blind sample of 6 agreed controls (10 shuffled, gold-blind + verdict-blind) were
  re-adjudicated via the FROZEN OOF pair (gpt-5.5 + gemini-3.1-pro-preview, --effort high), asking the
  open-book "is the claim ACCURATELY SUPPORTED -- not overclaimed/contradicted?" question; two-sided (an
  agreed/upheld control judged NOT-SUPPORTED would CONVICT the voter as a false-uphold). RESULT: both OOF
  models judged ALL 10 SUPPORTED -> the 4 stand as over-refusals (NOT gold errors); 0 false-upholds;
  decontaminated CP1s-upper = 0.2796 at validN = 30. (2 OOF calls, 7.09 AI Credits; `rejudication-result.json`.)
- WHY VOID-ON-CONSTRUCT (not a clean DOES-NOT-WORK): the re-adjudication OOF pair judged from EVIDENCE +
  TRAINING KNOWLEDGE via the Copilot CLI -- it did NOT live-web-search, the construct the voter uses. By the
  board's OWN unanimous Q1 principle, a non-live-web gold is STILL construct-mismatched for an open-book
  live-web voter, so the OOF's "supported" cannot authoritatively override the voter's live-web "refuted"
  (the voter found a specific web contradiction a knowledge-based judge would not surface). The re-adjudication
  therefore did NOT achieve a construct-matched gold; it cannot validly establish that the voter over-refuses.
  (Secondary: the OOF returned a constant SUPPORTED with no reasoning [JSON-only prompt], so per-item
  discrimination on this set is unvalidated -- though the same pair discriminated 10/40 oof-split in the gold,
  so it is not a blanket always-uphold adjudicator.)
- CHARACTERIZATION: VOID-on-construct -- the measurement neither certifies nor refutes sensitivity; the raw
  4/30 is reported transparently and is NOT laundered into a pass. The two-sided guard was operative (it could
  have convicted; it found 0 false-upholds among the blind agreed controls).

## ESTIMAND A -- false-uphold (specificity): VOID-on-power
- Difficulty-matched dense-evidence false-uphold traps are structurally infeasible ON-DISTRIBUTION at N>=30
  (the pipeline EXTRACTS each claim FROM its evidence, claim ~= evidence). The native refuted-gold re-test
  (D-22) gave 10/98 retained (old evidence); the clean-evidence re-test (1/16) CONFIRMED VOID (~16 << the 36
  floor). The OFFLINE Phase-19 MCC SCREEN-PASS over vetted EXTERNAL datasets is reported AS a NON-CERTIFYING,
  OFF-DISTRIBUTION diagnostic -- NOT the specificity half of a two-arm result. CHARACTERIZATION: VOID-on-power.

## The decisionMatrix verdict
- WORKS requires BOTH gates on-distribution. Specificity VOID-on-power; sensitivity VOID-on-construct. WORKS is
  NOT certified, and DOES-NOT-WORK is NOT established (neither arm is a valid refutation). Net: VOID -> RAISE.
- The SHIPPABLE outcome never depended on this (D-01): the Sonnet-default verify-voter SHIPS regardless. The
  Haiku-first flip is DEFERRED (D-06) -- a cheap-vs-strong McNemar + non-inferiority comparison is only
  meaningful on a construct-matched over-refusal metric (the tier-flip artifact: a stronger open-book judge
  correctly refutes contaminated controls and scores WORSE on a confounded metric, so a cheap "tie" is
  spurious). The flip waits for the live-web gold below.

## The DISTRIBUTION-SCOPE LIMIT (D-05; named, not faked)
No production traffic; the verdict is on the MAINTAINER-CURATED distribution (arm B from the skill's own runs;
arm A its own refuted-gold). A staged operational shadow/canary/Tier-1 is NOT literally applicable.

## RAISE -- the construct-aligned next step (headline; future work, NOT this milestone)
The root cause of BOTH arms is the construct mismatch (closed-book/knowledge gold vs open-book live-web voter).
The construct-aligned path to validly resolve sensitivity (the board's A2 / research Target D), DEFERRED:
1. Build an OPEN-BOOK over-refusal gold MATCHING the production construct -- the adjudicators perform the SAME
   live-web search the voter does (not judge from training knowledge), with per-item reasoning so the gold's
   discrimination is auditable and leakage is bounded (Target D: separate retrieval-reachability from judgment).
2. Re-run the over-refusal arm against that construct-matched gold; only then is a SCOPED sensitivity-only
   certificate (or a clean DOES-NOT-WORK) valid.
3. The false-uphold arm remains structurally VOID on-distribution; an off-distribution external screen is the
   only available specificity evidence (SCOPED, non-certifying).
Sonnet-default ships throughout; the Haiku flip is gated on the above.

## Spend (honest; verify exact on the Copilot dashboard)
- arm-B OOF gold: 10 Copilot calls, ~79 AI Credits (per-call ~8; M-1 ANSI-strip fix landed mid-stream; 3/10
  captured 13.8/4.51/5.45).
- arm-B over-refusal voting: 30 Sonnet verify-voter votes (session pool, dedicated --plugin-dir sessions).
- re-adjudication: 2 OOF calls, 7.09 AI Credits.
- board: ~20.3 AI Credits (GPT-5.5 13.9 + Gemini 6.42); Opus lenses + research on the session pool.
- TOTAL metered Copilot: ~106 AI Credits across 20-05.

---

# [HISTORICAL -- SUPERSEDED by the FINAL verdict above] 20-05 LIVE-cert result -- Stage 0 (D-19 harvest feasibility): RAISE + external budget halt

**Status:** RAISE (settle-OR-raise, D-01). Stage 1 [HUMAN BLOCK] NOT entered; no scored vote cast; no
Stage-2/3 spend. The live-cert WORKS certification did NOT proceed.
**Outcome for the milestone:** Sonnet-default voter SHIPS regardless (D-01); the Haiku-first flip stays
DEFERRED (D-06); WORKS remains UNCERTIFIED (honestly settle-OR-raise, not DOES-NOT-WORK).
**Date:** 2026-06-20 (autonomous overnight run; user standing direct authorization "Approve spend and OOF
as planned" + "Go. You are now running overnight").

## Summary

The Stage-0 harvest feasibility probe (D-19) was run overnight and STOPPED on two independent grounds,
either of which alone halts the spend:

1. **Feasibility (D-19 / A4 -- the board's #1 named uncertainty): the two arms are not constructible at
   the target N.** The skill does not emit dense-SUPPORTED positives on the curated corpus.
2. **External budget (hard stop): the org MONTHLY spend limit was exhausted mid-probe (HTTP 429).** No
   further Claude spend -- harvest runs OR Stage-2/3 Agent voters (same org budget) -- is possible until
   the limit is raised/reset.

This is the pre-sanctioned settle-OR-raise path. Per the Plan 20-05 Task-1 acceptance ("If the floor (30)
is not reached, the doc records a RAISE ... and Stage 1 is NOT entered").

## Stage 0 -- the D-19 harvest feasibility probe

### Curated question set (D-02; Claude's Discretion -- settled-fact / multi-source-agreement topics)

Chosen to MAXIMIZE the chance of dense-SUPPORTED (High/Medium with corroboration >= 2) positives -- the
sweet spot the cert needs -- spanning four domains so the yield read is not domain-skewed:

1. Titanium -- documented physical/mechanical properties + principal industrial uses (materials science).
2. Photosynthesis -- mechanisms + stages (light-dependent reactions + Calvin cycle) (textbook-corroborated).
3. Montreal Protocol -- history + measured effect on stratospheric ozone recovery (settled environmental science).
4. HTTP/3 (QUIC) vs HTTP/2 -- architectural differences + documented performance (settled-ish technical).

Driven via `claude -p` (the dev/UAT harness -- harvest ONLY, NEVER voters per D-20); script
`eval/.cache/p20-live/run-harvest-probe.sh`; captures `eval/.cache/p20-live/harvest/`; run dirs in
gitignored `.lz-research/`.

### Run outcomes (the budget cap truncated the probe to 2 completed runs)

| # | Question | Result | Cost | Run dir / survivors |
|---|----------|--------|------|---------------------|
| 1 | titanium | exit 0 (full run, ~51 min) | (session pool) | `20260620-022550-titanium-properties-uses` -- 20 survivors (1 High, 11 Low, 8 Contested) |
| 2 | photosynthesis | exit 1 (partial, ~10 min) | $5.53 | `20260620-031709-photosynthesis-mechanisms` -- NO survivors.json (died before aggregate stage-1; hit the limit mid-run) |
| 3 | Montreal Protocol | exit 1 (HTTP 429, ~1 s) | $0 | no run dir -- "You've hit your org's monthly spend limit" |
| 4 | HTTP/3 vs HTTP/2 | exit 1 (HTTP 429, ~1 s) | $0 | no run dir -- monthly spend limit |
| (prior) | wasm-vs-native (SC-5 spike) | exit 0 | $29.07 | `20260619-232106-wasm-vs-native-cpu` -- 20 survivors (3 High, 1 Low, 16 Contested) |

### Canonical two-arm harvest receipt (no spend; on-disk; the two arms NEVER pooled)

`node eval/lz-eval-harvest.mjs --harvest .lz-research/`:

```
harvest: nCtrl=4 (target 40, floor 30, BELOW-FLOOR) nTrap=0 (target 40, floor 30, BELOW-FLOOR)
         over 2 run dirs (4 supported, 0 dense) -- two arms, never pooled
```

(Two run dirs = wasm + titanium, the only ones carrying a `survivors.json`; photosynthesis is skipped --
no survivors.json. The two arms are recorded as SEPARATE counts, never one pooled N -- D-03.)

- **Over-refusal control arm:** nCtrl = **4** (floor 30) -- BELOW FLOOR.
- **Dense-trap false-uphold monitor arm:** nTrap = **0** (floor 30) -- BELOW FLOOR (EMPTY).
- SUPPORTED (High/Medium) total: 4 across 2 runs (~2/run). Dense-SUPPORTED (corroboration >= 2): **0**.

### Feasibility verdict: RAISE

The dense-trap monitor arm is EMPTY and the control arm is at 4 of a floor of 30. Even the run curated
specifically for dense-SUPPORTED yield (titanium, a settled materials-science question) produced 1 High /
11 Low / 8 Contested and **0** dense-SUPPORTED. Per D-19: the over-refusal arm is not constructible at the
target N -> CHEAP is not certifiable under current constraints -> keep STRONG indefinitely, RAISE to the
user; Sonnet-default ships regardless.

### Why the yield is ~0 dense-SUPPORTED (the analytical finding)

This is the A4/D-19 #1 uncertainty and the literature-unsolved "difficulty-matched positives from DENSE
multi-doc evidence" gap (19-04-CERTIFY-WORKS-RESEARCH.md:65), now observed directly on the shipping skill:

- DENSE claims (>= 2 corroborating sources) tend to surface cross-source dissent under the adversarial
  3-isolated-voter verification -> they resolve **Contested**, not SUPPORTED.
- SUPPORTED claims that survive tend to be thin (single readable seat) -> **Low** or a single-source High,
  i.e. NOT dense.
- So the band the cert most needs -- dense AND SUPPORTED -- is exactly the band the pipeline structurally
  under-produces. This held across a contested topic (wasm) AND a settled-fact topic (titanium).

This is a property of the skill's output distribution, not a defect: the verify-voter is doing its job
(surfacing dissent on multi-source claims). It just means the over-refusal/false-uphold live cert cannot
be built from the skill's own positives at the required difficulty + N.

## External budget halt (the hard stop, independent of feasibility)

Runs 2-4 hit **HTTP 429 -- "You've hit your org's monthly spend limit -- run /usage-credits to ask your
admin for a higher limit"** (captured in `eval/.cache/p20-live/harvest/harvest-{3,4}.stream.json`,
`api_error_status: 429`). This is the org MONTHLY spend ceiling, not the 5-hour rolling pool. Consequences:

- No further harvest runs are possible until the limit is raised/reset.
- The Stage-2/3 voter spend (Agent sub-agents, session pool) draws the SAME org budget -> also blocked.
- Only the OOF transport (Copilot AI Credits, a separate pool) is unaffected -- but OOF alone is useless
  without a harvest + votes.

So the live-cert is HALTED end-to-end regardless of the feasibility verdict.

## Decision (settle-OR-raise; nothing auto-resolved)

- **Sonnet-default voter ships regardless (D-01).** The milestone's shippable outcome (the Sonnet-default
  `lz-deep-research` skill) is DONE and does not depend on the live-cert verdict.
- **The Haiku-first flip stays DEFERRED (D-06).** Phase 20 ships only the gated mechanism + guardrails +
  the pre-committed rollback ("the flag stays OFF"); the flip was never going to flip ON in this phase.
- **WORKS is UNCERTIFIED.** This is settle-OR-raise, NOT DOES-NOT-WORK -- the cert did not run; the live
  arm (the only stage that can certify WORKS, the SDT positive-trials constraint) was not exercised.
- No N frozen, no lock rule committed, no scored vote -- the anti-result-shopping discipline is intact
  (nothing to result-shop; we never entered Stage 1).

## RAISED TO THE USER -- two decisions

1. **Budget:** raise/reset the org monthly spend limit if the live-cert is to be attempted at all. (As of
   this run it is exhausted; even a re-attempt cannot start without it.)
2. **Worth it, given the 0-dense-SUPPORTED signal?** Even with budget restored, the two completed runs
   (incl. a curated settled-fact run) yielded 0 dense-SUPPORTED positives. The honest options:
   a. **Accept the RAISE / descope the live cert** -- keep STRONG, ship Sonnet-default, close the milestone
      on a settle-OR-raise for SC-6 (the cheapest, most-defensible path; the cert was always optional to
      the shippable outcome).
   b. **Re-run a fuller probe** (budget restored, more curated questions) to confirm the 0-dense signal is
      not an artifact of only 2 completed runs -- but the early evidence is not encouraging.
   c. **Re-think the positives source** -- the harvest-from-own-output approach (D-02) may be structurally
      unable to yield dense-SUPPORTED; an alternative positives source would be a methodology change (a
      cross-family board moment, per the project pattern -- this is the kind of post-probe ambiguity a
      board is reserved for).

My recommendation: **(a) accept the RAISE for now** -- it is the cheapest and most defensible, the cert is
optional to the shipped skill, and the 0-dense signal is consistent across a contested and a settled run.
Revisit (b)/(c) only if certifying the Haiku flip becomes a priority worth a fresh budget + a board.

## Artifacts / audit trail (all gitignored except this doc)

- `eval/.cache/p20-live/run-harvest-probe.sh` -- the probe script.
- `eval/.cache/p20-live/harvest/harvest-{1..4}.stream.json` -- the four run captures (1 full, 1 partial,
  2x 429).
- `.lz-research/20260620-022550-titanium-properties-uses/` -- the one full new run dir (retained, AGG-05).
- `.lz-research/20260620-031709-photosynthesis-mechanisms/` -- the partial run dir (no survivors.json).
- Harvest stub tests stay green (no spend on the test path): `node --test eval/lz-eval-harvest.test.mjs`
  13/13, `node --test eval/lz-eval-live-cert.test.mjs` 16/16.
