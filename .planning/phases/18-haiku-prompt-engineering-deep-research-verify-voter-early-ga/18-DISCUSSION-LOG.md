# Phase 18: Haiku prompt-engineering deep research + verify-voter + early gating eval - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md -- this log preserves the alternatives considered and the
> verification trail that overturned several intermediate decisions.

**Date:** 2026-06-16
**Phase:** 18-haiku-prompt-engineering-deep-research-verify-voter-early-ga
**Areas discussed:** Eval dataset + labeling, Eval execution + cost
**Mode:** `--auto --analyze --chain` (ultracode). Two trap-quadrant gray areas escalated, then delegated
to research-backed judgment, then adversarially verified.

---

## How this discussion ran

Most scope is locked by the ROADMAP Success Criteria + 9 requirements + the Phase-17 frozen vote schema.
Two HIGH-IMPACT / NOT-HIGH-CONFIDENCE areas were escalated to the user via AskUserQuestion three times.
The user declined to hand-decide and set direction across several messages:
1. "Base approach on web research."
2. "I will not handcode anything. Use your best judgment, backed by research. Use advisors (Opus);
   escalate out-of-family (Copilot) only if absolutely needed."
3. Pointers: the skill-creator plugin, mgechev/skillgrade, the Anthropic *Demystifying Evals* + OpenAI
   *eval-skills* primary articles, the SkillsBench paper (`2602.12670`).
4. "I will not hand-write these. Find EXISTING datasets if you need to."
5. "Comply with licensing or keep them local-only (Git-ignored) while running evals."
6. "Set effort to ultracode."

So both areas were decided by Claude from: a multi-source research pass; an Opus advisor consult; and a
6-agent ADVERSARIAL VERIFICATION workflow. Two methodology evolutions happened mid-discussion: the dataset
plan went build-by-mutation -> reuse-existing-datasets (msg 4), and the dataset CHOICE went VitaminC ->
WiCE (verification). "No hand-writing" removed every construction/authoring-dependent option.

---

## Eval dataset + labeling

| Option | Description | Disposition |
|--------|-------------|-------------|
| Hand-author / user-labeled | User crafts/verifies labels | Removed ("I will not hand-write these") |
| Pure synthetic generation | LLM generates claims+labels | Rejected (synthetic-for-eval inflation on the SUBTLE stratum) |
| Build-by-mutation of real excerpts | FEVER-style label-by-construction | Superseded by "find EXISTING datasets" |
| VitaminC (closed-book SUBTLE) + AVeriTeC (open-book) | Reuse existing human-labeled corpora | OVERTURNED by verification (VitaminC off-phenomenon) |
| WiCE spine + LLM-AggreFact stress + AVeriTeC open-book/leakage arm | Existing human labels; WiCE partially-supported = overreach | SELECTED |

**Decision:** WiCE (`jon-tow/wice`) as the SUBTLE-overreach spine (partially-supported + non-supported-token
labels ARE the phenomenon, human-labeled, open-book, vendorable ODC-BY/MIT); LLM-AggreFact held-out stress
(verbatim-only, CC-BY-ND); AVeriTeC open-book + leakage-test arm (fetch-only, CC-BY-NC), excluding its
Conflicting/Cherry-picking class from the hard gate; ExpertQA secondary seed. VitaminC/SciFact/Climate-FEVER/
HoVer/FEVEROUS rejected. Programmatic sample+stratify to EVAL-01; no hand-authoring. (CONTEXT D-02..D-04.)
**Notes:** WiCE's existing gold labels are used directly. A conditional, programmatic, mechanically-validated
trap-augmentation (from WiCE seeds, never LLM-AggreFact/AVeriTeC, never hand-written) fires only if a
saturation check shows the natural set doesn't discriminate (D-03).

## Eval execution + cost

| Option | Description | Disposition |
|--------|-------------|-------------|
| Full run one pass, budgeted | closed+open together at k>=5 | No (peak spend / out_of_credits) |
| Build + pre-register only, defer run | no credits spent | No (under-delivers SC-4/SC-5) |
| Validate -> SUBTLE first -> staged, abort-on-FAIL, escalate to 15 | cheap-first, shared-pool, DELTA gate | SELECTED |

**Decision:** Pre-register the lock rule -> `--validate` oracle pre-flight -> SUBTLE stratum first ->
shared-pool pass@k -> abort-early only on FAIL -> escalate SUBTLE to reliable=15 before PASS -> temp 0 ->
staged across reset windows. Gate = Haiku-MINUS-Sonnet false-uphold DELTA per stratum (Sonnet on identical
strata), upper-bound of an EXACT-BINOMIAL interval (Clopper-Pearson / Wilson / Beta-Bernoulli -- NOT
Wald, NOT bootstrap), plus a closed-book control arm for parametric leakage. (CONTEXT D-05..D-07.)

---

## Adversarial verification (6-agent workflow) -- overturned premises

The verification re-fetched primary sources and OVERTURNED four load-bearing premises that the initial
auto-decisions + the first advisor consult had partly wrong:

1. **VitaminC fits the SUBTLE stratum -> OVERTURNED.** ~57% of VitaminC edits are numeric/date flips +
   entity swaps (paper Table A.1 / Sec 3.3) = the easy polarity-flip axis, not overreach. Replaced with
   WiCE `partially-supported`.
2. **AVeriTeC subset is commit-safe -> OVERTURNED.** CC-BY-NC-4.0 (confirmed 3 ways); fetch-only; the
   knowledge store layers unresolved third-party copyright = hard no-vendor.
3. **A Wald/normal (or bootstrap) 95% CI is the right error bar -> OVERTURNED.** arXiv 2503.01747 (ICML
   2025) refutes CLT/Wald at n<few-hundred and near rate=0; Miller 2411.00640 (the source justifying a CI)
   is itself CLT-based. Switched to Clopper-Pearson / Wilson / Beta-Bernoulli, report the upper bound.
4. **Provided AVeriTeC KS / live search is leak-safe -> OVERTURNED.** Even the provided KS leaks; mandate
   the REVISED 2.0 KS + per-claim date cutoff + a closed-book control arm.

Confirmed GO (re-fetched): deterministic verdict-vs-gold gate (LLM-judge only as fallback for qualitative
checks); grade outcomes not steps; pass^k for the consistency-critical gate; temp 0 / k>=5 (k value earns
its keep on the non-deterministic open-book arm). Two UNCERTAIN items left unsettled: AVeriTeC KS separate
redistributability (treated as a BLOCKER), ExpertQA as a turnkey stratum (secondary seed only).

Opus advisor additions folded in: the gate must be a Haiku-minus-Sonnet DELTA (not absolute); exclude
AVeriTeC Conflicting/Cherry-picking from the gate (kappa=0.619 label noise); knowledge-store over live web.

---

## Claude's Discretion
- WiCE sampling/stratification recipe; the interval estimator (Clopper-Pearson / Wilson / Beta-Bernoulli);
  whether the saturation check triggers trap-augmentation; agreement statistic; `--validate` seed count;
  manifest/cache paths; Haiku-prompt artifact structure.

## Deferred Ideas
- Larger-N / ecosystem dataset (v2); Phase-19 Haiku search-worker tier (follows this eval); Phase-20
  production false-uphold monitoring; ExpertQA/AVeriTeC-Cherry-picking trap seeds (only if SUBTLE stratum
  saturates); RTK command-suitability research (backlog, not folded).
