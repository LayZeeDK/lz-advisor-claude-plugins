# Phase 21: Live-web open-book over-refusal gold and arm-B re-run - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md -- this log preserves the alternatives considered.

**Date:** 2026-06-21
**Phase:** 21-live-web-open-book-over-refusal-gold-and-arm-b-re-run
**Areas discussed:** Adjudicator mechanism, Copilot cost / minimize-credits, Corpus strategy

---

## Adjudicator mechanism

| Option | Description | Selected |
|--------|-------------|----------|
| Retrieve-then-judge split (Claude retrieves -> OOF judges) | Claude search/extract agents do the live-web retrieval on the session pool (logged URLs+spans+timestamp); the frozen OOF pair judges batched closed-book over the enriched evidence. Out-of-family judgment, construct-matched retrieval, reuses the frozen Copilot transport for judgment only. ~100-350 Copilot credits. | yes |
| OOF searches natively (Copilot --allow-all-tools + web_fetch / playwright-cli) | The OOF models do the live-web search themselves. Most literal reading of "adjudicators do the same search," and confirmed feasible -- but un-batchable, token-billed (~1,000-3,500 credits), prose-only provenance, headless #1592 friction. | no |
| Claude agent adjudicator | A Claude agent with WebSearch/WebFetch judges. Construct-matched but IN-FAMILY -> self-preference bias; violates the out-of-family gold-decider rule. | no |
| Human maintainer adjudicates | The solo maintainer does the live-web search + judgment per item. Out-of-family + construct-matched but heavy manual labor; maintainer previously declined manual authoring (D-22). | no |

**User's choice:** Retrieve-then-judge split, Claude-only retrieval. NO Copilot web search.
**Notes:** The maintainer first authorized `--allow-all-tools` / an explicit allow-list for the copilot CLI and noted the `playwright-cli` skill is installed for Copilot, then asked for the expected cost. After the cost analysis + a dedicated web-research pass on Copilot CLI web tools (built-in `web_fetch`, the `/research` agent, MCP/Playwright, the post-2026-06-01 token-billing model, copilot-cli#1592), the maintainer ruled: "No Copilot web search -- it's too expensive at this scale. We have to use a strategy that minimizes Copilot AI Credits." This eliminated native-OOF search entirely (not even a fallback) and made the Claude-preprocessing split the locked design. Alignment was verified against the records (Phase-20 D-20/D-04, the out-of-family rule, the board's Target-D principle) before locking; the ROADMAP's "adjudicators do the same live-web search" is satisfied at the system level and recorded as a blessed HOW-interpretation.

---

## Corpus strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Reuse frozen 30 + re-score frozen votes | Re-adjudicate the SAME 30 over-refusal controls open-book (new gold), re-score the frozen Sonnet votes (4/30) -- no new voter votes. Cheapest; isolates the gold-construct as the only changed variable; aligned with the ROADMAP/STATE "re-run arm B against that gold" + the frozen 20-05 artifacts. | yes |
| Re-harvest fresh open-book | Harvest a fresh over-refusal positive set + adjudicate open-book from scratch + a fresh voter wave. Avoids the closed-book selection bias but costs more, re-opens pre-registration, adds snapshot drift. | no |

**User's choice:** Reuse the frozen 30 + re-score the frozen votes.
**Notes:** The maintainer explicitly asked which option was aligned/allowed per the plans and decision records. Verdict: reuse is the records-aligned path ("re-run arm B against that gold"; the 20-05 pre-registration froze the 30 controls + the 4 votes byte-identical), and it is the cheapest -- directly serving the minimize-credits constraint. The closed-book SELECTION of the 30 (the 10 oof-split items cannot be re-included) is recorded as a scope limit on the certificate, not a reason to re-harvest. The re-adjudication must stay two-sided and pre-registered before re-scoring.

---

## Process constraints (maintainer directives, 2026-06-21 overnight)

- All scripts that run or are used by an LLM task MUST be code-reviewed and covered by code-reviewed unit tests (project-wide MUST; CONTEXT D-13).
- Overnight autonomous run; Copilot AI Credit spend pre-approved conditioned on (a) realized cost not significantly above estimate and (b) active token minimization; the pre-flight cost spike is the guard, HALT + RAISE if cost runs significantly over (CONTEXT D-14).

## Claude's Discretion
- The exact retrieval wiring (reuse the search+extract workers vs a thin dedicated retrieval driver over the same tools); the evidence-packaging caps within the frozen quote-primary join; the OOF batch size; the AVeriTeC-4-way -> binary mapping micro-rule; the 1-2 item pre-flight spike design; the kappa/Jaccard reporting format.

## Deferred Ideas
- Full WORKS / arm-A specificity reconstruction (structurally void on-distribution).
- The Haiku-first flip (deferred, Phase-20 D-06).
- Native-OOF Copilot web search (ruled out on cost; revisit only if the Copilot AI-Credits model changes).
- A larger-N / ecosystem-representative live-cert corpus + ongoing production monitoring (post-release).
- Reviewed todos (not folded): relocate-non-distributable-lz-deep-research-test-fixtures; research-rtk-command-suitability -- both orthogonal to this eval phase.
