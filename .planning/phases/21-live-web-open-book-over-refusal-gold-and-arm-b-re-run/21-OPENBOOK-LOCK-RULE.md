# Phase 21 open-book over-refusal re-run -- PRE-REGISTRATION / LOCK RULE (frozen BEFORE any scored vote or metered OOF spend)

**Frozen:** 2026-06-22, BEFORE any Plan-05 metered OOF call runs and BEFORE the two-sided re-score is computed.
This document is committed BEFORE the metered run (git-history ordering is the anti-result-shopping anchor); the
result is whatever the rule below outputs, accepted even if it leaves the arm failing or under-powered (no second
pass, no prompt edits mid-flight, no item added/removed after scoring begins). Mirrors
`20-05-REJUDICATION-PREREGISTRATION.md` + `eval/lz-eval-live-lock-rule.md`. Authoritative decisions: 21-CONTEXT.md
D-01, D-04, D-06, D-07, D-08, D-09, D-10, D-11, D-12.

## Why (the construct this fixes)
The 30 over-refusal controls were confirmed CLOSED-BOOK and the over-refusal certification was VOIDed because a
CLOSED / training-knowledge gold (the OOF pair judged a fixed excerpt + training knowledge, NO live-web search) was
used to grade an OPEN-BOOK live-web voter. The voter's CORRECT refutes of overclaimed controls (e.g.
transformer/cluster38: claim says scaling laws "underestimate" while the literature says "overestimate";
crispr/cluster47: claim says "downregulate BCL11A" while the mechanism is editing the BCL11A erythroid-specific
enhancer) were mis-scored as over-refusals (4/30, CP-upper 0.28 > TAU_OR 0.15). This phase rebuilds the gold so its
evidence comes from the SAME class of independent live-web search the voter does, then re-adjudicates + re-scores.

## Frozen inputs (committed; immutable after this point)
- **The over-refusal control set (the candidate N):** the 30 OOF-confirmed controls in
  `eval/.cache/p20-live/armB-oof-gold-result.json` -> `confirmed_uids` (frozen, byte-identical; never grown/shrunk).
- **The frozen Sonnet voter verdicts:** `eval/.cache/p20-live/votes/sonnet/ctrl/` (re-scored, NOT re-cast -- D-04).
  The 4 voter-`refuted` uids: `montreal-protocol-ozone::cluster40`, `crispr-cas9-gene-editing::cluster47`,
  `transformer-self-attention-scaling::cluster38`, `antibiotic-resistance-mechanisms::cluster24`.
- **The frozen open-book evidence snapshot:** `eval/.cache/p21-live/openbook-evidence.json`
  - **sha256 = `9faee64aa93e8c21bbe198924e20494a6e5fc284b7558a0ae4b34863ff912de0`**
  - a uid-keyed SORTED-KEY OBJECT; 30 controls; 30/30 carry the control claim + independently-retrieved live-web
    evidence (groundedness: canonical URL + verbatim quote + fetched_at + excerpt_id); 0 retrieval gaps; 159 evidence
    items; meta-source blocklist enforced (0 blocklisted URLs present).
- **Frozen primitives (consumed byte-identical; NOT re-implemented):** `EVAL_THRESHOLDS` (`TAU_OR` 0.15,
  `N_CTRL_FLOOR` 24), `clopperPearsonUpperOneSided` (`eval/lz-eval-aggregate.mjs`); `reclassify` /
  `decideScopedSensitivity` (the two-sided dispositions + CP gate, `eval/.cache/p20-live/rejudication-lib.mjs`); the
  OOF gold-decider identity `FROZEN_OOF_PAIR` = `gpt-5.5` + `gemini-3.1-pro-preview`, `--effort high`
  (`eval/lz-eval-live-cert.mjs`); `joinClusterEvidence` / `EXCERPT_CHAR_CAP` (`eval/lz-eval-evidence-join.mjs`).

## How the open-book gold is built (D-01 / D-06 / D-08; frozen procedure)
1. **Retrieval (DONE, no Copilot spend, Claude session pool -- Plan 04):** for each of the 30 controls an INDEPENDENT
   live-web search (`research-search-worker`, disconfirming query + >=3-query floor + source-independence dedup) found
   candidates, and `research-extract-worker` fetched a primary source and stored its verbatim excerpt + quotes +
   canonical URL + fetched_at. The retrieval surfaced the BROADER literature the voter could reach (NOT a replay of the
   voter's `armB-control-packets.json` excerpt). `openbook-retrieval-log.mjs` applied the D-07 meta-source blocklist as
   the load-bearing gate and froze the snapshot above.
2. **Adjudication (Plan 05, the ONLY metered Copilot spend):** the FROZEN OOF pair judges GOLD-BLIND over the logged
   open-book evidence with `expectedEntailment:'true'` (does the open-book evidence ENTAIL the supported claim?). Per
   control the AVeriTeC 4-way label maps to the frozen binary via `mapAveritecToBinary`: `supported`->SUPPORTED;
   `refuted`->NOT-SUPPORTED; `not-enough-evidence`/`conflicting`/unknown->RESIDUE. OOF non-unanimity (split) ->
   `conflicting` -> RESIDUE (Guerdan rating-indeterminacy: EXCLUDED from the binary denominator + routed to the
   maintainer, NEVER coerced). kappa + evidence_jaccard are REPORTED, never gated (D-08).

## The TWO-SIDED re-score RULE (frozen; the decisive guard)
Re-score the FROZEN Sonnet votes against the open-book gold over the FULL frozen 30 (`reclassify`, byte-identical;
`sampleUids` = all 30 so `nUnReadjudicated` collapses to 0 and `validN` = the open-book-confirmed supported count):
- A control the open-book gold labels **SUPPORTED** stays in the denominator. If the voter REFUTED it -> a GENUINE
  OVER-REFUSAL (numerator). If the voter upheld it -> a correct uphold.
- A control the open-book gold labels **NOT-SUPPORTED** (genuinely overclaimed open-book) is REMOVED from the
  denominator. If the voter REFUTED it -> the voter was CORRECT (NOT an over-refusal -- the gold-error case the
  construct fix exists to catch). If the voter UPHELD it -> a FALSE-UPHOLD the closed gold missed (this is the
  TWO-SIDED arm: the same pass can move an item AGAINST the voter; recorded as `missed_false_upholds_two_sided`).
- **RESIDUE** -> excluded from both numerator and denominator.

## Scoring + the N-floor (frozen)
- Over-refusal numerator = # SUPPORTED-and-voter-REFUTED. Denominator `validN` = the open-book-confirmed SUPPORTED
  controls among the frozen 30.
- `cpUpper = clopperPearsonUpperOneSided(overRefusals, validN)` vs `TAU_OR` 0.15.
- **N-FLOOR:** if `validN < N_CTRL_FLOOR` (24) -> **VOID-on-power -> RAISE**. NEVER drop only adverse items to
  manufacture a pass (the two-sided rule removes contaminated controls on BOTH sides, decided by the gold label, not
  by their effect on the rate).
- Report BOTH the raw closed-book result (4/30, CP 0.28) AND the decontaminated open-book CP, with the full
  reclassification itemized (`openbook-rescore-result.json`).

## Anti-result-shopping commitments (T-21-01, T-21-16)
- **ONE pass.** The rule + the gold procedure + the snapshot hash + the frozen N are frozen here, before any scored
  vote. The result stands as output; no re-run after seeing a fail; no optional stopping.
- **The denominator is EXACTLY the frozen 30** -- `rescore` FAILS CLOSED if the open-book gold covers more or fewer
  uids than the frozen confirmed set (a grown/shrunk arm throws).
- **The zero-votes window is clean:** the open-book gold is a fresh, NEVER-scored construct, so re-pre-registration is
  not result-shopping.
- **The two arms are NEVER pooled.** `missed_false_upholds_two_sided` is a TRANSPARENCY datum, not a separate pooled
  gate -- arm A (false-uphold / specificity) is structurally VOID on-distribution and is NOT certified here.
- **Frozen primitives unchanged** (CP estimator, `TAU_OR`, `reclassify`, the OOF gold-decider identity, the schema).

## Verdict frame (frozen; D-09 / D-11)
- `validN < 24` -> **VOID-on-power-RAISE**.
- `validN >= 24` AND `cpUpper <= TAU_OR (0.15)` -> **SCOPED SENSITIVITY-ONLY** certificate (specificity VOID-on-
  distribution; NOT full WORKS).
- `validN >= 24` AND `cpUpper > 0.15` -> **DOES-NOT-WORK** (clean negative).
- In EVERY case: full WORKS is OUT (arm A void); the Phase-19 MCC SCREEN-PASS is an off-distribution NON-certifying
  diagnostic, not the specificity half; the construct-mismatch is the RAISE headline; `decisionMatrix.raiseToUser`
  stays true (settle-OR-raise); the **Sonnet-default verify-voter SHIPS regardless** (D-01); the **Haiku-first flip
  stays DEFERRED** (Phase-20 D-06).

## The metered-spend guard (D-12 / D-14)
Plan 05 opens with a 1-2 item pre-flight COST + FEASIBILITY spike, bounded BY CONSTRUCTION by the `LZ_SAMPLE`
candidate cap in `openbook-oof-gold.mjs` (the cap is applied BEFORE any dispatch). If the per-item OOF credit cost is
materially above estimate, HALT + RAISE rather than continue to full N. Estimate before each spend; disclose actuals
after (ANSI-strip `parseCredits`, learning M-1). The no-spend build + tests precede any spend (D-13).

## Transparency notes (named, not hidden)
- **Evidence is WebFetch-rendered.** Claude's WebFetch returns model-rendered page text, not raw HTML; the stored
  excerpts are that rendering and every quote is a verbatim substring of it. This is CONSTRUCT-MATCHED: the open-book
  voter being graded ALSO retrieves via WebFetch, so the gold's retrieval mechanism matches the voter's (D-01). Any
  residual snapshot/time drift is a named PROVISIONAL limit (D-07).
- **OA-preference retrieval.** Many primary publishers (NEJM, nature.com, science.org, fda.gov, sciencedirect.com,
  ashpublications.org) bot-block automated fetching; retrieval preferred openly-fetchable PRIMARY sources (arXiv, PMC,
  europePMC, ACP/Copernicus, NOAA, bioRxiv, NCBI Bookshelf, plus Wikipedia/LibreTexts where a reliable secondary was
  the best fetchable option). This is a retrieval-reachability characteristic of the gold, reported with the
  groundedness field; it does not change the binary judgment, which is gold-blind over whatever was logged.
- **One source-provenance record was completed by hand.** `photosynthesis-mechanisms::cluster21`'s extract worker
  stored its excerpt + verbatim quotes but its `sources/` provenance record (canonical key + url + fetched_at) was
  truncated mid-write; the orchestrator wrote that one record (no evidence fabricated -- the excerpt + quotes were
  already retrieved this run; fetched_at pinned to the run date 2026-06-22).
- **Scope limit (D-05):** the 30 were CLOSED-BOOK-selected; the 10 OOF-split items are not re-includable open-book.
  The certificate is scoped to the closed-book-selected 30 -- a documented limit, not a reason to re-harvest.

## Tree / import boundary (D-13)
All retrieval/snapshot/result artifacts live under gitignored `.lz-research/` + `eval/.cache/p21-live/`; only this
pre-registration lock-rule (no secrets) is tracked under `.planning/`. The eval tree imports the SHIPPED aggregator's
`safeId`/`ContractError` one-directionally (eval -> runtime, NEVER runtime -> eval); no plugin-tree file imports eval.
