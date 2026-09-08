# Phase 21: Live-web open-book over-refusal gold and arm-B re-run - Context

**Gathered:** 2026-06-21
**Status:** Ready for planning
**Mode:** `--analyze --auto --chain`. The two load-bearing forks (adjudicator mechanism, corpus) were escalated to the maintainer rather than auto-locked -- both are HIGH-impact and the board EXPLICITLY deferred the adjudicator mechanism (trap quadrant). They were resolved interactively. Pre-discussion research: four read-only digests over the Phase 18/19/20 decision records + the eval infrastructure, plus two web-research passes (open-book gold methodology; Copilot CLI web-tool capability).

<domain>
## Phase Boundary

Phase 21 is the RAISE from the Plan 20-05 live-cert verdict (NOT WORKS -> RAISE). It resolves the **construct mismatch** that VOIDed the over-refusal (sensitivity / arm B) certification: a **closed / training-knowledge gold** (the out-of-family OOF pair judged from a fixed excerpt + training knowledge, with NO live-web search) was used to grade an **open-book live-web voter**. The voter's CORRECT refutes of overclaimed controls (e.g. transformer/cluster38: the claim says a scaling law "underestimates" while the cited paper says "overestimates"; crispr/cluster47: the claim conflates a gene with its erythroid-specific enhancer) were mis-scored as over-refusals (4/30, CP-upper 0.28 > TAU_OR 0.15).

**Deliverable:** build a **live-web OPEN-BOOK over-refusal gold** whose evidence comes from the SAME class of live-web search the voter does (with per-item reasoning + bounded leakage), re-adjudicate the frozen 30 over-refusal controls against it, re-score the frozen Sonnet voter votes, and apply the frozen over-refusal CP gate -> a **SCOPED sensitivity-only certificate** OR a **clean DOES-NOT-WORK**.

**Verdict ceiling: SCOPED sensitivity-only (or clean DOES-NOT-WORK).** Full WORKS is UNREACHABLE: arm A (false-uphold / specificity) is structurally VOID on-distribution (the pipeline extracts each claim FROM its evidence, so claim ~= evidence; the native re-test gave 1/16 retained << the N_trap floor 36). The Phase-19 MCC SCREEN-PASS over external datasets is an off-distribution, NON-certifying diagnostic only -- not the specificity half of a two-arm result.

**Out of scope (do NOT re-open):** arm A / specificity reconstruction (structurally void on-distribution); native-OOF Copilot web search (maintainer ruling 2026-06-21: too expensive at this scale -- D-02); the Haiku-first flip (deferred, Phase-20 D-06); any frozen primitive (EVAL_THRESHOLDS / clopperPearsonUpperOneSided / certifyModel / decisionMatrix / the OOF gold-decider identity / the schema); release/publication (REL-01..03, completion-gated).

**Constant:** the Sonnet-default verify-voter SHIPS regardless of the cert outcome (Phase-20 D-01, settle-OR-raise).

</domain>

<decisions>
## Implementation Decisions

### Adjudicator mechanism (the load-bearing fork; board-deferred, maintainer-resolved)
- **D-01:** Adjudicator = **retrieve-then-judge SPLIT, Claude-only retrieval.** ALL live-web search + fetch runs on the Claude **session pool** via the existing pipeline retrieval agents (`research-search-worker` [WebSearch], `research-extract-worker` [WebFetch]) -- an INDEPENDENT live-web search per control (NOT a replay of the voter's own excerpt -- it must surface the broader live-web literature the voter could reach), storing a structured retrieval log (canonical URL + verbatim quote + `fetched_at` + immutable excerpt). The FROZEN out-of-family OOF pair then judges **gold-blind** over that logged evidence. RATIONALE: keeps JUDGMENT out-of-family (the load-bearing gold-decider rule; same-family judges are too conservative on their own product -- OR-Bench), makes RETRIEVAL construct-matched + open-book, and reuses the frozen Copilot transport for JUDGMENT ONLY. ALIGNED with Phase-20 D-20 (Agent voters + Copilot OOF judgment), D-04 (OOF-primary hybrid adjudicator), and the board's Target-D principle "separate retrieval-reachability from judgment." This is a deliberate **SYSTEM-LEVEL interpretation** of the ROADMAP's "adjudicators do the SAME live-web search the voter does" (the gold is built on live-web evidence, not training knowledge) -- recorded as a blessed HOW-interpretation, NOT drift.
- **D-02:** **NO native-OOF Copilot web search.** Maintainer ruling (2026-06-21): Copilot web search/fetch is too expensive at this scale. Research CONFIRMED it is technically feasible (built-in `web_fetch` + `--allow-all-tools --allow-all-urls`; `playwright-cli` skill for bot-protected sources; the maintainer authorized the flags) -- but it is un-batchable + token-billed (under the post-2026-06-01 AI-Credits model every fetched page is billable input tokens, re-read across agentic turns), prose-only provenance, and has headless friction (copilot-cli#1592 forces `--yolo` for MCP tools). The split is strictly dominant on cost, provenance, and headless reliability. Native-OOF search is OUT -- not even a recorded fallback.
- **D-03:** **MINIMIZE Copilot AI Credits is a first-class phase constraint.** The ONLY metered Copilot spend is the OOF judgment over the logged evidence; minimize it via (a) **batched** closed-book OOF calls (multiple controls per call -- batching captured ~85% of the savings in prior passes: ~310 vs ~2,140 credits/pass); (b) **tight evidence packaging** (reuse the 20-05 quote-primary + faithful front-matter strip + bidirectional quote/excerpt dedup + `EXCERPT_CHAR_CAP`; ~44% per-candidate token cut); (c) reuse the frozen 30 (no new harvest, no new voter wave -- D-04); (d) a **1-2 item pre-flight cost spike** before the full N (D-12). Estimated Copilot spend on the split: ~100-350 credits (vs ~1,000-3,500 for native-OOF search). Phase-20 baseline: the closed-book gold over 40 controls was ~10 batched calls / ~79 credits; the per-call OOF ran ~3x the disclosed estimate (learning M-1) -- pad upward and disclose actuals after (the ANSI-strip `parseCredits` fix now captures per-call credits).

### Corpus
- **D-04:** **Reuse the FROZEN 30 over-refusal controls + RE-SCORE the FROZEN Sonnet votes.** Re-adjudicate the SAME 30 controls open-book (new gold labels), then re-score the existing frozen votes (the 4/30 in `votes/sonnet/ctrl/`) against the new gold -- NO new voter votes. ALIGNED with the ROADMAP/STATE "re-run arm B against that gold" + the 20-05-REJUDICATION-PREREGISTRATION frozen artifacts (the 30 confirmed controls + the 4 disputed UIDs + the voter verdicts carried byte-identical). Cheapest (directly serves D-03). The open-book re-adjudication is **TWO-SIDED** -- it may CONFIRM a refute as correct (a control that is not genuinely supported open-book drops from the supported denominator) or surface a missed false-uphold, NOT only rescue over-refusals. Re-harvest fresh is OUT (scope-expanding; re-opens N + pre-registration + adds snapshot drift).
- **D-05:** **Scope limit recorded, not corrected:** the 30 were closed-book-SELECTED (the 10 oof-split items cannot be re-included open-book). The certificate is scoped to the closed-book-selected 30 -- a documented limit on the certificate, NOT a reason to re-harvest (D-04).

### Open-book gold record + adjudication contract (research-grounded; RAGAS/ARES, AVeriTeC, Guerdan)
- **D-06:** Per-item gold record is **TWO-FIELD**: (1) a retrieval / groundedness field (the logged URLs + quoted spans + `fetched_at` the extract worker already produces) and (2) a verdict / validity field. Adopt the AVeriTeC 4-way label space {supported, refuted, not-enough-evidence, conflicting} for adjudication so the SUPPORTS-vs-NEI boundary (where the over-refusals live) is REPRESENTABLE, then map to the frozen binary for the CP gate. Separating retrieval-reachability (groundedness) from judgment (validity) makes an over-refusal attributable to a retrieval gap vs a reasoning error -- without it the over-refusal rate stays as uninterpretable as it was closed-book.
- **D-07:** **Bounded leakage** is operationalized as (a) log every URL + quoted span + timestamp the retrieval saw; (b) a **meta-source blocklist** -- the gold's retrieval must NOT pull the claim's own published fact-check, leaderboards, or dataset pages, so judgment is from PRIMARY evidence (not a copied verdict); (c) prefer primary-source contestability. PIN retrieval timestamps + FREEZE the gold's evidence snapshot so the re-run is against a fixed snapshot, not a moving web; snapshot / time-drift that cannot be closed is a named **PROVISIONAL** limit on the certificate.
- **D-08:** Adjudicator = the FROZEN OOF all-agree pair (`gpt-5.5` + `gemini-3.1-pro-preview`, `--effort high`, gold-blind), reused byte-identical via the Copilot CLI for JUDGMENT ONLY. OOF non-unanimity = the rating-indeterminacy filter (Guerdan): split / materially-ambiguous items are EXCLUDED from the binary denominator and ROUTED TO THE HUMAN -- do NOT discard, because the SUPPORTS-vs-NEI boundary IS the over-refusal signal. Report verdict agreement (kappa, expect ~0.44-0.68 for open-book) AND evidence-overlap (Jaccard, expect ~0.3) SEPARATELY; do NOT demand 0.8 verdict-kappa or high evidence overlap.

### Certification gate + pre-registration (carried byte-identical)
- **D-09:** Frozen primitives consumed byte-identical: `EVAL_THRESHOLDS` (TAU_OR 0.15, N_CTRL_FLOOR 24; CP anchors CP1s(0,30)~=0.117, CP1s(1,30)~=0.149), `clopperPearsonUpperOneSided`, `certifyModel` / `decisionMatrix`, the OOF gold-decider identity. The over-refusal CP gate: CP-upper of the over-refusal rate `<=` TAU_OR 0.15 over the RE-CONFIRMED open-book supported denominator. The two arms are NEVER pooled.
- **D-10:** PRE-REGISTRATION discipline (the lock-rule pattern): write + freeze the new open-book gold + the lock rule (the re-confirmed N, the CP estimator, the two-sided guard, the snapshot) BEFORE any re-scored vote; no optional stopping; the zero-votes window is clean (the open-book gold is a fresh, never-scored construct, so re-pre-registration is not result-shopping). `decisionMatrix.raiseToUser` stays true (settle-OR-raise). The spend is a STAGED, human-authorized BLOCKING checkpoint (`LZ_SPEND`-gated; mirrors 19-04 Task 9 and 20-05).

### Disposition
- **D-11:** Outcome = a SCOPED sensitivity-only certificate (if the over-refusal CP gate CLEARS over the open-book-confirmed denominator), OR a clean DOES-NOT-WORK (if it BREACHES), OR an honest VOID-on-construct / VOID-on-power -> RAISE (if the open-book gold itself fails its construct-validity / feasibility checks). Full WORKS is OUT (arm A void). Sonnet-default ships regardless (Phase-20 D-01); the Haiku-first flip stays DEFERRED (Phase-20 D-06).

### Process constraints (maintainer directives, 2026-06-21 overnight)
- **D-13:** Every script that RUNS an LLM task or is USED BY an LLM task MUST be code-reviewed AND covered by code-reviewed unit tests (the project-wide MUST). The new open-book retrieval driver, the open-book OOF gold driver, the re-score/scoring path, and any new eval module all qualify. Mirror the established discipline: no-spend build first, FILE-form `node --test`, mutation-verified discriminating tests, an independent adversarial review, the eval tree never ships, the one-directional eval -> runtime import boundary. This is a plan-structure constraint, not optional.
- **D-14:** Overnight AUTONOMOUS run with CONDITIONAL Copilot-spend approval (maintainer, 2026-06-21): the metered OOF judgment spend is PRE-APPROVED for this run, conditioned on (a) the realized cost is NOT significantly above the disclosed estimate, AND (b) tokens are actively minimized to minimize AI Credits (batched OOF + tight evidence packaging + reuse-30 -- D-03). The D-12 pre-flight 1-2 item spike is the cost GUARD: if the per-item cost lands significantly above estimate, HALT + RAISE rather than continue to full N. Estimate before each spend; disclose actuals after (capture the CLI AI-Credits line via the ANSI-strip parser, learning M-1). The no-spend build + tests (D-13) precede any spend.

### Claude's Discretion (planner / researcher latitude inside the frozen contracts)
- The exact retrieval wiring for the gold (reuse the search + extract workers directly vs a thin dedicated retrieval driver over the same tools); the precise evidence-packaging caps within the frozen quote-primary join; the OOF batch size; the AVeriTeC-4-way -> binary mapping micro-rule; the 1-2 item pre-flight spike design; the kappa / Jaccard reporting format. The planner finalizes these within the frozen schema + `EVAL_THRESHOLDS` + the two-assurance contract.

### Empirical unknowns resolved DURING execution (pre-flight checks, not blockers)
- **D-12:** A **1-2 item pre-flight COST + FEASIBILITY spike** (human-authorized) measures the real per-control OOF judgment credits over the enriched open-book evidence AND confirms the Claude retrieval actually surfaces the broader live-web literature the voter found, BEFORE committing the full N=30. If the per-item credit cost is materially above estimate, HALT + RAISE (the minimize-credits constraint, D-03).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.** Plan-phase MUST run WITH research (no `--skip-research`). The deep research for Plan 19-04 (`19-04-CERTIFY-WORKS-RESEARCH.md`) and the Plan 20-05 verdict records are the foundation of this phase.

### Phase definition + acceptance bar (AUTHORITATIVE scope -- do NOT re-open)
- `.planning/ROADMAP.md` -> "Phase 21" entry (goal, depends-on, the RAISE framing) + the Phase-20 AMENDED blocks (RE-PLAN-12, CERTIFIED-WORKS, ARM-A RATIFICATION) the live arm sits downstream of.
- `.planning/REQUIREMENTS.md` -> the EVAL-* / VERIF-* / COST-* families + the v2.1.0 scope banner (Phase-21 requirements are TBD -- derived at `/gsd-plan-phase 21`).

### The VOID verdict + the RAISE design + the board ruling (Plan 20-05)
- `.planning/phases/20-orchestrator-skill-headless-scale-confirmation/20-05-LIVE-CERT-RESULT.md` -- the FINAL verdict (NOT WORKS -> RAISE), the construct-mismatch diagnosis, the raw 4/30 + CP 0.28, the RAISE headline (build an open-book gold; adjudicators do the same live-web search; per-item reasoning; bounded leakage).
- `.planning/phases/20-orchestrator-skill-headless-scale-confirmation/20-05-SUMMARY.md` -- the spend + outcome summary (~106 Copilot credits across 20-05).
- `.planning/phases/20-orchestrator-skill-headless-scale-confirmation/20-05-PROVE-DISPROVE-BOARD-DECISION.md` -- the cross-family board's unanimous Q1 construct-mismatch ruling + the two-sided re-adjudication guard.
- `.planning/phases/20-orchestrator-skill-headless-scale-confirmation/20-05-PROVE-DISPROVE-RESEARCH.md` -- Target D (separate retrieval-reachability from judgment) + the open design questions explicitly deferred to this phase.
- `.planning/phases/20-orchestrator-skill-headless-scale-confirmation/20-05-REJUDICATION-PREREGISTRATION.md` -- the frozen 30 controls + 4 disputed UIDs + frozen votes; the pre-registration discipline the open-book re-run mirrors.

### The certification methodology + frozen design (the WHY)
- `.planning/phases/20-orchestrator-skill-headless-scale-confirmation/20-CONTEXT.md` -- D-01..D-22 (esp. D-01 settle-OR-raise, D-04 hybrid OOF adjudicator, D-20 transport split, D-21/D-22 two-arm methodology, D-06 Haiku-flip deferral).
- `.planning/phases/20-orchestrator-skill-headless-scale-confirmation/CERTIFY-WORKS-RATIFICATION.md` (D-22, arm-A authority) + `CERTIFY-WORKS-BOARD-DECISION.md` (D-21, two-arm split-source) + `20-PATTERNS-CERTIFY-WORKS.md`.
- `.planning/phases/19-search-extract-worker-agents/19-04-REPLAN-DECISION-12.md` -- the staged certification (offline SCREEN gates; LIVE = the only WORKS certifier).
- `.planning/phases/19-search-extract-worker-agents/19-04-CERTIFY-WORKS-RESEARCH.md` -- the SDT positive-trials constraint (F5/F7), confound-robust metrics, the literature GAP (no validated live-operational cert method -- this phase assembles primitives, pre-registers, labels PROVISIONAL).
- `.planning/phases/18-haiku-prompt-engineering-deep-research-verify-voter-early-ga/18-HAIKU-PILOT.md` -- the clear-rejection gate + the over-refusal control concept + the unanimity blind spot.

### Frozen eval seams consumed by Phase 21 (do NOT re-open; ADDITIVE extension only)
- `eval/lz-eval-aggregate.mjs` -- `EVAL_THRESHOLDS` (TAU_OR 0.15, N_CTRL_FLOOR 24), `clopperPearsonUpperOneSided`.
- `eval/lz-eval-offline-read.mjs` -- `certifyModel` / `decisionMatrix` (verdict labels: WORKS / DOES-NOT-WORK / SCOPED / VOID-*; raiseToUser always true).
- `eval/lz-eval-live-cert.mjs` -- `FROZEN_OOF_PAIR` (gpt-5.5 + gemini-3.1-pro-preview, --effort high), `scoreArmFromVotes` (kind:'over-refusal'), `persistDualRunVote`, `freezeArms`, `requireSpend` (LZ_SPEND gate).
- `eval/lz-eval-oof-batch.mjs` -- the batched OOF adapter (the closed-book judgment over inlined evidence; the seam the split feeds enriched evidence into).
- `eval/lz-eval-evidence-join.mjs` -- the quote-primary + front-matter-strip + dedup + char-cap packaging (the token-minimization lever for D-03).
- `eval/lz-eval-armA-native.mjs` -- the arm-A native refuted-gold path (the `armB-oof-gold.mjs` driver was parameterized from this; the over-refusal arm reuses the same harvest/adjudicate machinery).
- `eval/.cache/p20-live/armB-oof-gold.mjs` + `armB-oof-gold-result.json` (GITIGNORED; the frozen 30 `confirmed_uids`) -- the over-refusal gold driver + the frozen denominator.
- `eval/lz-eval-live-cert-driver.md` + `eval/lz-eval-live-lock-rule.md` -- the Stage 0/1/2/3 runbook + the pre-registration prose to mirror.

### Pipeline retrieval / voter agents + schema (the retrieval mechanism + the evidence contract)
- `plugins/lz-advisor/agents/research-search-worker.md` ([WebSearch, Write]; disconfirming query, >=3-query floor, source-independence dedup) + `research-extract-worker.md` ([WebFetch, Write]; verbatim excerpt at fetch time, canonical URL, fetched_at) -- the Claude live-web retrieval the gold reuses (D-01).
- `plugins/lz-advisor/agents/research-verify-voter-sonnet.md` ([WebSearch, WebFetch, Write]; the ship-default open-book voter whose frozen votes are re-scored).
- `plugins/lz-advisor/references/lz-deep-research-schema.md` -- the frozen source/claim/vote/excerpt + survivor records, the tally rubric, the two assurances.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- The frozen eval seams (`certifyModel` / `decisionMatrix` / `clopperPearsonUpperOneSided` / `EVAL_THRESHOLDS` / `FROZEN_OOF_PAIR`) carry byte-identical -- the over-refusal CP gate already lives here.
- The **batched OOF adapter** (`lz-eval-oof-batch.mjs`) and the **quote-primary evidence join** (`lz-eval-evidence-join.mjs`) are the two cost-minimization levers (D-03): the open-book gold feeds ENRICHED (live-web-retrieved) evidence into the same batched closed-book judgment, packaged tight.
- The `armB-oof-gold.mjs` driver + `armB-oof-gold-result.json` already produced the frozen 30 over-refusal controls (the denominator) -- the open-book re-run re-adjudicates these.
- The Claude retrieval agents (`research-search-worker`, `research-extract-worker`) already do live-web search/fetch with the voter's disconfirming-search + source-independence discipline -- the gold's retrieval REUSES them (session pool, zero Copilot credits).
- The frozen Sonnet votes (`votes/sonnet/ctrl/`, the 4/30) are re-scored, not re-cast (D-04).

### Established Patterns
- `LZ_SPEND`-gated spend behind `isCliEntry` / `requireSpend` (importing a driver triggers NO spend); the no-spend build surface is the full `.test.mjs` suite via the explicit FILE-form `node --test` (host quirk -- never the dir form).
- OOF all-agree, gold-blind adjudication + Guerdan rating-indeterminacy residue routed to the human (D-08).
- Pre-registration freeze-before-scoring + the zero-votes window + arms-never-pooled (the lock-rule pattern, D-10).
- Tight evidence packaging (quote-primary + faithful front-matter strip + dedup + char cap) for token minimization.
- ANSI-strip `parseCredits` (learning M-1) so the metered OOF credits are captured exactly; disclose actuals after.
- ASCII-only, zero-dep, CRLF/BOM/path-safe; the eval tree NEVER ships (one-directional eval -> runtime import boundary).

### Integration Points
- Claude retrieval (session pool) -> run-dir logged evidence (URL + quote + fetched_at + excerpt) -> `lz-eval-evidence-join` (tight package) -> BATCHED closed-book OOF judgment (Copilot, the only metered spend) -> the new open-book gold -> re-score the frozen Sonnet votes -> `scoreArmFromVotes(kind:'over-refusal')` -> `clopperPearsonUpperOneSided(overRefusals, nConfirmed)` vs TAU_OR 0.15 -> the SCOPED verdict + the record.
- The new open-book gold is a fresh, never-scored construct -> the pre-registration window is clean (anti-result-shopping).

</code_context>

<specifics>
## Specific Ideas

- **"No Copilot web search"** -- maintainer ruling: too expensive at this scale; the strategy MUST minimize Copilot AI Credits (D-02 / D-03).
- **"Claude preprocessing before Copilot spend is highly preferred"** -- all live-web retrieval on the Claude session pool; Copilot is judgment-only over the logged evidence (D-01).
- **"Re-run, not re-harvest"** -- reuse the frozen 30 + re-score the frozen votes (D-04); the construct fix is the GOLD, not the corpus.
- **"Two-sided re-adjudication"** -- the open-book gold can confirm a refute as correct or add a missed false-uphold, not only rescue over-refusals (D-04 / the 20-05 guard).
- The construct-mismatch exemplars to preserve: transformer/cluster38 (underestimates vs overestimates), crispr/cluster47 (gene vs erythroid enhancer) -- the voter's live-web refutes a closed-book gold could not surface.

</specifics>

<deferred>
## Deferred Ideas

- **Full WORKS / arm-A specificity reconstruction** -> structurally VOID on-distribution (claim ~= evidence); only a future, genuinely on-distribution difficulty-matched false-uphold method could revisit it. Out of this RAISE.
- **The Haiku-first flip** -> DEFERRED (Phase-20 D-06); waits for a live WORKS pass that this RAISE cannot produce (ceiling is SCOPED sensitivity-only).
- **Native-OOF Copilot web search** -> ruled OUT on cost (D-02); could be revisited only if the Copilot AI-Credits cost model changes materially.
- **A larger-N / ecosystem-representative live-cert corpus + ongoing production monitoring** -> post-release operational maturity.

### Reviewed Todos (not folded)
- **Relocate non-distributable lz-deep-research test fixtures** (~0.6) -- REVIEWED, NOT folded: a packaging-boundary cleanup orthogonal to the over-refusal gold re-run; stays on the backlog (same disposition as Phases 16-20).
- **Research RTK command suitability for skills and agents** (~0.6) -- REVIEWED, NOT folded: plugin-tooling, orthogonal to this eval phase; stays on the backlog (same disposition as Phases 16-20).

</deferred>

---

*Phase: 21-live-web-open-book-over-refusal-gold-and-arm-b-re-run*
*Context gathered: 2026-06-21*
