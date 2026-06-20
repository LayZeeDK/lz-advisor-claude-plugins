# Phase 20: Orchestrator skill + headless scale confirmation - Context

**Gathered:** 2026-06-19
**Status:** Ready for planning
**Mode:** `--analyze --auto --chain`. Decisions made via the user-directed methodology: a de-identified, fact-only **cross-family board** (2 Opus lenses + Copilot GPT-5.5 + Gemini-3.1-pro-preview) for the hard-to-reverse, high-impact LIVE-certification cluster, and an **Opus panel** (design-synthesizer + risk/integration-checker) for the orchestrator-skill HOW-decisions. Two pre-discussion research passes (live LLM-judge certification; Claude Code skill-orchestration mechanics incl. skill-creator + plugin-dev authoritative docs) fed the board/panel with facts.

> **How this context was produced.** Phase-20 scope is FIXED by `ROADMAP.md` Phase 20 SC-1..6 (AMENDED 2026-06-19, RE-PLAN-12) and was NOT re-opened. The frozen primitives carried from Phases 16-19 (the aggregator, the schema, the named ceilings, `EVAL_THRESHOLDS` TAU_OR 0.15 / TAU_FU 0.10 / N_CTRL_FLOOR 24, `clopperPearsonUpperOneSided`, the OOF gold-decider identity, the offline SCREEN-PASS gate) are AUTHORITATIVE ground truth, consumed not re-litigated. The decisions below resolve the genuinely-open HOW questions inside that fixed scope. Board credits spent this session: ~10.7 Copilot AI Credits (R1 only; consensus reached, no R2). Board/panel transcripts in gitignored `eval/.cache/p20-board/`.

<domain>
## Phase Boundary

Phase 20 is the milestone-capping phase. It delivers TWO coupled workstreams, both fixed by ROADMAP Phase 20 SC-1..6:

**(A) The orchestrator skill** `plugins/lz-advisor/skills/lz-deep-research/SKILL.md` wires the full pipeline end-to-end (scope-clarify -> decompose ~5 sub-angles -> dispatch search wave -> fetch/extract wave -> run the off-model aggregator -> Opus advisor Gate 1 -> verify wave [3 isolated voters/claim] -> aggregator tally + quote-recheck -> Opus advisor Gate 2 -> assemble the cited report) using the **already-settled Sonnet-default voter**, wave-batched at **<=5 in-flight**, reusing the existing Opus `advisor` at **exactly two** read-only gates, retaining the **gitignored `.lz-research/<run-id>/`** run dir as the audit trail, discoverable as `lz-advisor:lz-deep-research` (de-shadowing the built-in `/deep-research`), pinned to the Anthropic first-party API floor. **Empirically confirmed working as a packaged skill at real headless concurrency** (the #1 build-time unknown; A2 spike only proved n=2).

**(B) The LIVE over-refusal + full-WORKS certification** (RE-PLAN-12 live arm) -- the ONLY stage that can certify the verify-voter "WORKS" (the Signal-Detection-Theory positive-trials constraint; the Phase-19 offline MCC SCREEN GATES progression but cannot certify). Over adjudicated production-distribution SUPPORTED claims, PRE-REGISTERED Clopper-Pearson gates decide WORKS: the over-refusal CP-upper <= TAU_OR (0.15) with N_ctrl >= 24, MOVED here from the offline read; AND the carried dense-trap false-uphold CP-upper <= TAU_FU (0.10) as a continuing monitor; MCC / balanced-accuracy a SECONDARY scalar once both arms have data. **WORKS = both gates pass.** The **Haiku-vs-Sonnet worker-tier flip is settled HERE** (the live stage), staged behind the unanimity-blind-spot guardrails + a pre-committed rollback.

**Requirements:** PIPE-01, PIPE-02, PIPE-06, PIPE-08, PIPE-09, VERIF-05, AGG-05, COST-01, COST-03, COST-04, INTEG-01, INTEG-02 (12 phased reqs). The live-arm certification operationalizes ROADMAP SC-6 (over-refusal CP gate + full-WORKS + the Haiku-first flip).

**Out of scope (do NOT re-open):** the frozen aggregator / schema / ceilings / `EVAL_THRESHOLDS` / `clopperPearsonUpperOneSided` / OOF gold-decider identity (consumed, byte-identical); the offline SCREEN (Phase 19, SCREEN-PASS already achieved); REL-01..03 (release/publication -- handled at `/gsd-complete-milestone` after `/gsd-audit-milestone`, NOT a build phase); the v2 backlog (SCALE-01 nested phase-runner, SCALE-02 multimodal ingestion, SCALE-03 full crash-resumability, AGGX-01 semantic dedup); Bedrock/Vertex/Foundry degradation paths (COST-04 pins Anthropic-API floor).
</domain>

<decisions>
## Implementation Decisions

> D-01 anchors scope. D-02..D-07 are the **cross-family board CONSENSUS** on the LIVE-certification methodology (the literature-GAP, high-impact, hard-to-reverse cluster). D-08..D-14 are the **Opus-panel convergence** on the orchestrator-skill HOW-decisions. D-15..D-18 are integration constraints the risk/integration-checker surfaced that the plan MUST honor. All four board members (2 Opus lenses + GPT-5.5 + Gemini) converged in one round; the only divergences (Q3 substitute framing, Q5 staging granularity) were reconcilable syntheses, recorded below.

### Scope & sequencing
- **D-01:** Phase 20 delivers BOTH workstreams: the orchestrator skill (A) AND the live over-refusal + full-WORKS certification (B). The Phase-19 offline SCREEN-PASS gates progression here; the live stage is the ONLY stage that certifies WORKS (SDT positive-trials constraint). The Sonnet-default voter SHIPS regardless of the live-cert outcome; the live-cert outcome is honestly **settle-OR-raise** (if WORKS cannot be cleared, RAISE to the user, Sonnet-default ships).

### LIVE certification methodology (board consensus, Cluster 1)
- **D-02:** Live positives ("adjudicated production-distribution SUPPORTED claims") are sourced by running the SHIPPING STRONG-tier skill itself on a curated set of diverse real research questions and harvesting the SUPPORTED claims it emits, then re-adjudicating those gold-blind (option a, primary). An external labeled benchmark is NOT the certifying set (it is off-distribution -- different decomposition granularity, evidence density, citation style); it may serve ONLY as an optional difficulty-calibration sanity cross-check. The harvested control set is difficulty-stratified to OVERSAMPLE dense / contested-evidence SUPPORTED claims (the band where correlated cheap-tier errors live), so a degenerate always-uphold judge cannot clear the over-refusal gate trivially.
- **D-03:** N targets sit ABOVE the frozen floor. The frozen `EVAL_THRESHOLDS` (TAU_OR 0.15 / TAU_FU 0.10 / N_CTRL_FLOOR 24) stay BYTE-IDENTICAL -- these are run-config N TARGETS, not threshold changes. The over-refusal control arm targets **N_ctrl = 40 (floor 30)**, never the bare 24 knife-edge: at the one-sided 95% CP, 0/24 clears 0.15 ONLY at exactly zero (1/24 -> ~0.183 FAILS), and 0/24 -> ~0.117-0.125 which can FAIL the separate 0.10 false-uphold gate. The dense-trap false-uphold MONITOR arm is a SEPARATE set with its own **N_trap target ~34-40 (floor 30)**. The two arms are NEVER pooled into one N. N=30 absorbs one adjudication artifact; N=40 absorbs two.
- **D-04:** Adjudicator = HYBRID. The frozen OUT-OF-FAMILY all-agree gold-decider pair (carried byte-identical) is the PRIMARY adjudicator; the solo maintainer (the only available human) resolves ONLY the residue: OOF-split items, response-set-indeterminate items, or items where CHEAP contradicts a unanimous OOF verdict. Use **response-set elicitation** (Guerdan, NeurIPS 2025): multi-defensible items are EXCLUDED from the binary denominator and routed to human, never coerced to a forced binary gold (which biases judge selection up to 31%). The adjudicator stays OUT-OF-FAMILY from any tier under test (OR-Bench rejected a same-family judge as too conservative). A small **OOF-vs-human calibration subset** (the maintainer adjudicates a handful blind, compared to the OOF pair) validates the OOF oracle before it is trusted as primary.
- **D-05:** With NO production traffic, staged operational shadow -> canary -> Tier-1 is NOT literally applicable and must NOT be faked (theatre). The honest substitute: (i) **"shadow" = a maintainer-driven offline DUAL-RUN** of CHEAP vs STRONG voters (run-without-acting) over the SAME frozen harvested claim/evidence bundles, gold-blind-adjudicated, scored on the two pre-registered CP gates; (ii) the **correlated-unanimous-false-uphold guard** = load-bearing-claim auto-escalation to STRONG/OOF + an audit of CHEAP unanimous upholds (CENSUS on load-bearing / high-consequence claims, sample elsewhere) -- the only mechanisms that can catch a unanimous (contested-trigger-invisible) false-uphold; (iii) the closest honest "canary" = an **OPT-IN dogfood beta** -- CHEAP shipped behind an explicit OFF-by-default flag, the maintainer opts in during daily use, unanimous upholds logged for periodic human audit. "Rollback" degenerates to "the flag stays OFF" -- free and real, since STRONG ships regardless.
- **D-06:** DEFER the Haiku-first flip. Ship the STRONG (Sonnet) default + the gated CHEAP mechanism + the guardrails (load-bearing escalation, unanimous-uphold audit, optional mixed-tier Sonnet seat, mechanical search minimums) + logging/audit hooks + a pre-committed rollback. The CHEAP tier flips ON only after a FUTURE run clears BOTH CP gates jointly + a clean unanimous-uphold audit + a demonstrated real cost win, at an explicit human checkpoint. The cost-asymmetry is decisive: STRONG is already inside the accepted budget, so a wrong CHEAP uphold (false confidence in a CITED report) is an irreversible credibility failure strictly worse than spending within budget. Optional compromise available to the planner: a "CHEAP-with-STRONG-backstop" tier for NON-load-bearing claims only -- still gated behind the same certification, never pre-cert.
- **D-07:** The certification SPEND is a STAGED, PRE-REGISTERED, human-authorized BLOCKING spend (matches the project's blocking-checkpoint pattern; mirrors 19-04 Task 9). **Stage 1** = harvest STRONG outputs + OOF/human adjudicate + FREEZE the gold control set (N_ctrl) + the dense-trap set + the acceptance rule (N targets, the 0.15/0.10 ceilings, the CP estimator) BEFORE any CHEAP scored vote `[HUMAN BLOCK]`; **Stage 2** = dual-run CHEAP + STRONG over the FROZEN artifacts in ONE scored pass, compute CP; **Stage 3** = the unanimous-uphold audit / load-bearing census folded in. NO optional-stopping / add-until-pass (N is frozen in advance -- the anti-p-hacking discipline). A cheap pilot may validate harness/plumbing before the main spend. A **pre-flight harvest feasibility probe** runs first (see D-19).

### Orchestrator skill HOW-decisions (Opus panel, Cluster 2)
- **D-08:** Wave-batching (<=5 in-flight, COST-03) is enforced via FOREGROUND worker spawns + a hard counted skill-body instruction: "dispatch exactly N = min(remaining, 5) Agent calls in ONE assistant turn, then wait for all N receipts before the next turn; split a >5 wave into ceil(count/5) sequential sub-waves of <=5," reinforced by a per-wave receipt-count assertion. No platform concurrency cap exists for skill-spawned subagents (the min(16, cpu-2) cap is dynamic-Workflows-only, which plugins cannot ship) and CLAUDE.md-style concurrency rules are reportedly ignored, so the cap is a BEHAVIORAL instruction proven by the SC-5 spike (D-13). Foreground is mandatory -- background fan-out auto-denies prompts under `-p` and has no backpressure.
- **D-09:** Scope-clarify (PIPE-02): the skill attempts `AskUserQuestion` when scope is underspecified. There is NO documented headless-detection signal, so the fallback contract is: on no-answer (the `-p` path) proceed on STATED ASSUMPTIONS surfaced as `Assuming <X> (unverified)` frames (the existing lz-advisor convention), recorded in `scope.md` and echoed into the report header. Workers NEVER call `AskUserQuestion` (unavailable to subagents).
- **D-10:** Orchestrator `allowed-tools` declaration + tier dispatch (COST-04): declare `allowed-tools: Agent, Read, Glob, Write, WebSearch, WebFetch, Bash(git:*), Bash(node:*), AskUserQuestion` as DOCUMENTATION/intent (a skill's `allowed-tools` is parsed-not-enforced, claude-code#37683); rely on `--permission-mode auto`'s classifier at runtime. Workers carry their OWN `tools` grants (Phase 19). `Bash(node:*)` is the correct command-prefix filter form (not `Bash(node "...")`). CORRECTION: reference the bundled aggregator as `${CLAUDE_PLUGIN_ROOT}/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs` -- `${CLAUDE_SKILL_DIR}` does NOT exist.
- **D-11:** Cited-report structure (PIPE-06/08/09 + VERIF-06): a single Markdown report (the PIPE-09 deliverable, written to the run dir + surfaced): (1) Question & Scope (+ Assuming-frames); (2) Key Findings -- one bullet per surviving claim with an INLINE citation `(Title, url)` (PIPE-06) + a confidence tag `[High|Medium|Low|Contested|Unsupported]` + the two-assurance pair (quote_fidelity; claim_support); (3) **Contested & Unsupported** -- a FIRST-CLASS section showing dissent, not averaged away (PIPE-08); (4) Confidence & Assurance legend defining the two orthogonal axes (quote-verified-verbatim vs claim-supported-by-quote), one NEVER derived from the other (VERIF-06); (5) Sources. Confidence enum is exactly the frozen five -- never a sixth.
- **D-12:** VERIF-05 escalation is computed DETERMINISTICALLY in the aggregator (off-model spine), via an ADDITIVE schema + aggregator + worker-prompt extension under the anti-drift lockstep discipline. The aggregator emits a per-claim `escalate` flag on the UNION of: (a) `confidence === 'Contested'`; (b) a `load_bearing: true` flag set by the EXTRACT worker at claim-extraction time and carried through `mergeClusters`; (c) a ~15-20% audit sample of unanimous (3/3 unrefuted) upholds selected by a STABLE HASH of the cluster id (no `Math.random`, reproducible from the run dir). The orchestrator dispatches a Sonnet re-vote wave on every flagged claim. `claim_support` (Assurance 2) is produced by the orchestrator's synthesis step -- no other component supplies it.
- **D-13:** Headless scale-confirmation (SC-5) is a dedicated build-time spike running the PACKAGED skill via `claude -p --permission-mode auto --plugin-dir plugins/lz-advisor "/lz-advisor:lz-deep-research <fixed question>" --verbose --output-format stream-json`. Un-fakeable acceptance, parsed from the stream-json trace: max concurrent in-flight Agent calls **<= 5 at every point** across **>= 3 sequential waves**; each wave's next-batch spawn timestamp is AFTER all prior-batch result timestamps (the foreground/wait boundary held); host stable (exit 0, `survivors.json` on disk, an independent `node` aggregator re-run reproduces the summary line); zero worker `Write` failures. Resolves research U1/U2/U4/U5.
- **D-14:** Run-id is GENERATED BY THE SESSION at scope-guard time, format `YYYYMMDD-HHMMSS-<short-slug>`; the Node aggregator NEVER generates it (it receives `<run-dir>` as `process.argv[2]`, uses no `Date.now()`/`new Date()` -- stays a deterministic pure function of run-dir contents). Layout = the frozen schema run-dir block + `scope.md` + `report.md`. Add `.lz-research/` to the repo `.gitignore` (INTEG-02); the run dir is RETAINED as the audit trail (AGG-05) -- gitignored, not deleted (retention and gitignore are complementary).

### Integration constraints the plan MUST honor (risk/integration-checker)
- **D-15:** Vote-file naming is keyed by the aggregator's STAGE-1 CLUSTER ID. Dispatch order is load-bearing: aggregate stage-1 (emits `clusterN` ids) -> dispatch voters keyed by `clusterN` -> aggregate stage-2 (tally). Voters keyed by claim/member id silently mis-tally merged multi-member clusters (the member-id fallback works only for single-member clusters).
- **D-16:** The orchestrator caps dispatched extract workers at `MAX_FETCH = 15` and sub-angles at `ANGLES ~5` BEFORE spawning (the aggregator fail-closes with `ContractError` exit 2 above its ceilings -- a hard mid-run abort, not a graceful trim). `CEILINGS` is the single source (import from the aggregator or mirror with a dev-time identity test). The report stage treats a non-zero aggregator exit as a RUN FAILURE, never silently consumes a missing `survivors.json`.
- **D-17:** Citation provenance is guarded: for every `survivors[].sources[]` canonical key, the synthesis step reads the percent-encoded `sources/<key>.json` for title/citation and FAILS LOUDLY (or marks `citation: source-record-missing`) rather than fabricating a title. The canonical-URL recipe stays BYTE-IDENTICAL across the search-worker prompt, the extract-worker prompt, and the eval `canonicalizeUrl` `TRACKING_PARAMS` (a dev-time identity test; the aggregator counts the key it is given and never re-canonicalizes, so a drifted LLM-computed key silently under/over-counts corroboration).
- **D-18:** COST-01 two-gates discipline: exactly TWO Opus `advisor` consults (Gate 1 scope/ranking-cut-line; Gate 2 synthesis/calibration), each via the reused `advisor` agent with a per-invocation `model: opus`, over bounded curated JSON only. `research-verify-voter-opus` is EVAL-REFERENCE-ONLY and must NEVER be spawned by SKILL.md. Reconcile SESSION-DESIGN section 5 "Gate 1b (optional re-order)" into the SINGLE Gate-1 consult (or document it as the same consult continued, not a new spawn) so the sanctioned Opus-spawn count is exactly 2; the SC-5 trace asserts advisor spawns == 2.

> **CRITICAL CARRIED FACT (D-10 / risk R1):** plugin-shipped agents' frontmatter `model:` is SILENTLY IGNORED. The `model: sonnet|haiku|opus` lines in the existing `research-*` agent files are INERT. Tier is controlled ONLY by the orchestrator passing `model` per Agent-invocation. A build-time test must assert this (frontmatter `model:` treated as documentation). Without per-invocation `model`, the whole cost model and the Haiku-OFF/Sonnet-default discipline are unfounded.

### Claude's Discretion (planner/researcher latitude, inside the frozen contracts)
- The exact curated research-question set used to harvest live positives (D-02); the precise audit-sample percentage within 15-20% (D-12c); the exact receipt char cap (the "one line under a cap" contract is frozen); the SKILL.md prose structure + the progressive-disclosure split into `references/`; the report Markdown micro-format (D-11); the run-id slug derivation (D-14). The planner finalizes these within the frozen schema + ceilings + the two-assurance contract.

### Empirical unknowns resolved DURING execution (pre-flight checks, not blockers)
- **D-19:** Before committing the full live-cert spend, a Stage-1 **harvest feasibility probe** confirms the shipping skill can emit >= 30 difficulty-representative SUPPORTED claims in the dense / contested-evidence band from real research questions. If it cannot (the board's #1 uncertainty -- difficulty-matched dense-evidence positives are literature-unsolved), the over-refusal arm is not constructible at the target N -> CHEAP is not certifiable under current constraints -> keep STRONG indefinitely, RAISE to the user. Sonnet-default ships regardless.

### Post-discussion directive (user, 2026-06-20) -- live-cert voter transport
- **D-20:** The live-cert `callVoter` transport = **Agent sub-agents** (the Phase-18 verify-voter agents via the Agent tool, per-invocation `model: haiku` for CHEAP / `model: sonnet` for STRONG), driven from a Claude Code session; `eval/lz-eval-live-cert.mjs` is invoked via `Bash(node:*)` for the deterministic scoring only. The Claude voter spend therefore draws the **Claude session pool**, NEVER the metered Anthropic API (user directive: never use the Anthropic API -- reasserts PROJECT.md "the Claude Code Agent tool is the only mechanism") and NEVER `claude -p` (which stays the dev/UAT-only harness, e.g. the 20-04 SC-5 spike). `callOof` stays the Copilot CLI (metered Copilot AI Credits). Corrects the "metered Claude voter spend" wording in 20-05-PLAN.md: the metered pool is the OOF Credits only.

### Post-discussion directive (user + cross-family board, 2026-06-20) -- certified-WORKS methodology re-plan
- **D-21:** The D-02 false-uphold positives source ("harvest dense-SUPPORTED claims from the skill's own
  output") is empirically INFEASIBLE (the Stage-0 harvest RAISE: ~0.33 dense-SUPPORTED/run; lexical dedup
  under-merges so corroboration sticks at 1; the dense-trap arm would need ~90 runs -- see
  `20-05-LIVE-CERT-RESULT.md`). A 3-round UNANIMOUS cross-family board (2 Opus lenses + gpt-5.5 +
  gemini-3.1-pro-preview, `--effort high`) DECIDED a replacement: `CERTIFY-WORKS-BOARD-DECISION.md` is THE
  AUTHORITY for the re-plan, superseding the D-02 positives source. The certified-WORKS methodology -- TWO
  arms, split-source, both certifying: (B) the OVER-REFUSAL control STAYS LIVE-harvested (D-02 "run the skill
  on itself" remains valid for arm B; ~2.3 SUPPORTED/run feasible, ~13 runs), N >= 30, CP-upper <= TAU_OR
  (0.15); (A) the FALSE-UPHOLD arm becomes MANUALLY-CONSTRUCTED contrastive minimal-pairs, each a minimal
  edit of a REAL live dense evidence bundle of the SAME class as the over-refusal positives (flip only the
  truth-value; preserve density / length / style), N >= 30, CP-upper <= TAU_FU (0.10) -- EXPAND the
  underpowered 12-trap set to >= 30, reuse the 12 as seed. WORKS (not merely scoped) IFF: pre-registered
  before any scored vote + every trap is a minimal-edit-from-a-real-bundle + the construct-validity gate
  passes -- (d) minimal-edit [MANDATORY] + (a) a zero-dep lexical-overlap AUC <= the pre-registered ceiling
  (0.60-0.65) [PRIMARY] + (b) a one-sided "not easier" difficulty guard (FAIL only if the constructed cell is
  detectably EASIER than the harvested dense-SUPPORTED cell, easier-direction SMD > 0.5) + (c) an optional
  blind audit. Shared pipeline / origin is NOT required (SDT estimates sensitivity + specificity on separate
  pools); fail the gate -> a SCOPED certificate (scoped to the unverified distribution claim). A 10-pair
  pre-scale probe gates on gold-panel unanimity (>= 9/10) + the lexical AUC; its scored voter is
  RUN-but-NOT-GATED (telemetry + a voluntary early-stop only, NEVER the cert gate). STRONG (Sonnet) is
  certified FIRST; CHEAP (Haiku) is a SEPARATE cert over the SAME frozen corpus / gold / gates with its own
  frozen prompt (EVAL-05 `lz-haiku-prompt-engineering.md`) + a task-fit pre-gate; no tier inherits another's
  verdict, no TAU loosened per tier. FOLD IN cross-session resumability as a build item (disk-state recovery;
  Opus-design + Sonnet-impl; `20-RESUMABILITY-SCOPING.md`). Frozen primitives consumed BYTE-IDENTICAL
  (EVAL_THRESHOLDS TAU_OR 0.15 / TAU_FU 0.10 / N_CTRL_FLOOR 24; certifyModel / decisionMatrix /
  clopperPearsonUpperOneSided; the OOF all-agree gold-decider gpt-5.5 + gemini-3.1-pro-preview, `--effort
  high`, gold-blind); zero runtime deps; N frozen before scoring; no optional stopping; the two arms NEVER
  pooled; the SDT positive-trials constraint satisfied (both arms carry positive trials). The lz-deep-research
  workflow re-architecture is DEFERRED to a later milestone (`reference_claude_code_workflows_shippable`).
  This stays an honest settle-OR-raise: construct-validity fail or a breached gate -> RAISE; the spend is a
  staged, pre-registered, human-authorized BLOCKING checkpoint; the Sonnet-default voter ships regardless (D-01).
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.** Plan-phase MUST run WITH research (no `--skip-research`) -- the live-cert methodology + the SC-5 scale spike are research-heavy. Note: the **deep research for Plan 19-04** (`19-04-CERTIFY-WORKS-RESEARCH.md`) is the foundation of this phase's live-arm design.

### Phase definition + acceptance bar (AUTHORITATIVE scope -- do NOT re-open)
- `.planning/ROADMAP.md` -> "Phase 20" entry (the **AMENDED 2026-06-19, RE-PLAN-12** block + Success Criteria 1-6); and "Phase 19" (the offline SCREEN this phase's gate sits downstream of).
- `.planning/REQUIREMENTS.md` -> PIPE-01/02/06/08/09, VERIF-05, AGG-05, COST-01/03/04, INTEG-01/02 (the 12 Phase-20 reqs) + the v2.1.0 scope-decisions banner + the Out-of-Scope table.

### The live-arm WORKS design + the deep research that grounds it (Plan 19-04)
- `.planning/phases/19-search-extract-worker-agents/19-04-REPLAN-DECISION-12.md` -- THE AUTHORITY for the staged certification: the offline SCREEN gates, the LIVE stage is the PRIMARY over-refusal + full-WORKS certifier, the carried/frozen primitives, the over-refusal CP gate moved to live.
- `.planning/phases/19-search-extract-worker-agents/19-04-CERTIFY-WORKS-RESEARCH.md` -- **the deep-research synthesis for Plan 19-04** (105 agents; 23 sources; 20/25 claims 3-vote adversarially verified): the SDT positive-trials constraint (F5/F7), MCC/AUC/d-prime confound-robust metrics, the literature GAPS (no verified live/operational cert method; no published acceptance standard). The foundation of the live-arm design.
- `.planning/phases/18-haiku-prompt-engineering-deep-research-verify-voter-early-ga/18-HAIKU-PILOT.md` -- the staged-pilot consensus: discriminating strata, the pre-registered clear-rejection gate, the unanimity blind spot + the operational guardrails (shadow->canary->Tier-1, elevated/100% audit of unanimous upholds, mixed-tier Sonnet seat, mechanical search minimums, kill-switch/rollback), the owner escaped-error budget (a Phase-20 concern).
- `eval/lz-eval-lock-rule.md` -- the PRE-REGISTRATION discipline the live arm MUST mirror (write the lock rule + freeze N/ceilings/estimator BEFORE any scored vote; the zero-votes window; anti-result-shopping); the carried `EVAL_THRESHOLDS` table (TAU_FU 0.10 / TAU_OR 0.15 / N_CTRL_FLOOR 24 / one-sided CP anchors) and the OOF gold-decider identity (gpt-5.5 + gemini-3.1-pro-preview, --effort high, all-agree, gold-blind).

### Frozen contracts consumed by Phase 20 (do NOT re-open; ADDITIVE extension only, under anti-drift lockstep)
- `plugins/lz-advisor/references/lz-deep-research-schema.md` -- run-dir layout; source/claim/vote/excerpt + survivor + stage-2 report records; the tally rubric (confidence enum); the quote-recheck contract; the named ceilings; the two assurances. D-12 ADDS `load_bearing` + `escalate` (additive, lockstep).
- `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs` (+ `.test.mjs`) -- the off-model aggregator the orchestrator shells once per stage; emits `survivors.json`; fail-closes (exit 2) above ceilings; the report consumes its output.
- `plugins/lz-advisor/agents/research-search-worker.md`, `research-extract-worker.md`, `research-verify-voter-sonnet.md`, `research-verify-voter-haiku.md`, `research-verify-voter-opus.md`, `advisor.md` -- the existing producers/voters/advisor the orchestrator dispatches. Their frontmatter `model:` is INERT (D-10/R1); the voter-opus is EVAL-ONLY (D-18).
- `plugins/lz-advisor/references/lz-haiku-prompt-engineering.md` -- the EVAL-05 research-grounded Haiku prompt (the fairness premise for the CHEAP tier under the live flip).

### Converged design (the WHY) + the orchestration conventions
- `.planning/research/SESSION-DESIGN.md` -- the spine (section 3), components (4), phases (5), context-boundedness + ceilings (6), evidence-artifact-centric verification (8), cost model (9), decided forks + verifier tier (10, 15, 15.1, 15.2). NOTE section 5 "Gate 1b" must be reconciled to the COST-01 two-gates count (D-18).
- `plugins/lz-advisor/skills/lz-execute/SKILL.md` -- the existing orchestrator-skill conventions (frontmatter, `allowed-tools` form, `${CLAUDE_PLUGIN_ROOT}` references, Assuming-frames, the context-trust contract) to mirror.

### This phase's pre-discussion research (board/panel inputs)
- `.planning/phases/20-orchestrator-skill-headless-scale-confirmation/20-PRE-DISCUSS-RESEARCH-live-cert.md` -- verified/convention/gap facts on live LLM-judge certification (shadow/canary, rare-event N math, Guerdan rating-indeterminacy, ICLR judge over-confidence, OR-Bench out-of-family ensemble, IAA acceptance numbers).
- `.planning/phases/20-orchestrator-skill-headless-scale-confirmation/20-PRE-DISCUSS-RESEARCH-skill-orchestration.md` -- verified Claude Code v2.1.x mechanics (subagent tool grants are the subagent's own; skill `allowed-tools` parsed-not-enforced; AskUserQuestion unavailable to subagents; depth-5 nesting cap; wave-batching via turn structure + PostToolBatch; no platform concurrency cap for skill-spawned subagents; plugin agents can't pin model; `${CLAUDE_SKILL_DIR}` does not exist) + the skill-creator + plugin-dev authoritative guidance + the local-vs-live divergence table + the must-spike list (U1-U6).
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- The frozen aggregator + schema + the named ceilings: the orchestrator is a CONSUMER of a settled off-model spine; it shells `node lz-deep-research-aggregate.mjs <run-dir>` and reads `survivors.json` -- it never tallies or re-canonicalizes.
- The search + extract workers and all three voter variants (Sonnet/Haiku/Opus) already exist (Phase 18/19), each least-privilege with its own `tools` grant. Phase 20 WIRES them; it does not author them (it ADDS the `load_bearing` flag to the extract worker per D-12).
- The reused Opus `advisor` agent (read-only `[Read, Glob]`) is the Gate-1/Gate-2 judge -- no new Opus specialist.
- The `eval/` live-cert machinery carries from Phase 19: `clopperPearsonUpperOneSided`, `certifyModel`/`decisionMatrix` (lz-eval-offline-read.mjs -- the over-refusal CP gate now applies at the LIVE arm), the OOF batch adapter (lz-eval-oof-batch.mjs), the pre-registration prose discipline (lz-eval-lock-rule.md). The live arm reuses these; the over-refusal CP gate is MOVED here, frozen primitives byte-identical.
- The existing lz-* SKILL.md files (lz-execute the most complex) are the orchestration-prose + frontmatter templates to mirror.

### Established Patterns
- Immutable per-worker files + receipt-only returns (bounded main context; spike A2). Off-model deterministic aggregation as the spine; workers never tally.
- Wave-batching via turn structure (issue <=5 Agent calls/turn, foreground, wait for the batch -- the PostToolBatch boundary).
- Pre-registration discipline + freeze-before-scoring (the lock-rule pattern); blocking human-authorized spend checkpoints (19-04 Task 9).
- The OUT-OF-FAMILY frozen gold-decider pair + all-agree + gold-blind adjudication (carried).
- node:test via the explicit `.test.mjs` FILE form (host quirk; never the dir form). ASCII-only, zero-dep, CRLF/BOM/path-safe.
- No cross-skill body references; progressive disclosure into `references/`; `${CLAUDE_PLUGIN_ROOT}` for all intra-plugin paths.

### Integration Points
- Worker `Write` -> the run-dir blackboard (`claims/`, `excerpts/`, `sources/`, `votes/`) -> the aggregator -> `survivors.json` -> the report. Contract CLOSES on the verification path; the two report-side gaps (citation-provenance join D-17, `claim_support` producer D-12) are orchestrator-owned and currently unbacked -- the plan must wire them.
- Vote dispatch is keyed by the aggregator's stage-1 cluster id (D-15); the dispatch order aggregate->dispatch->aggregate is load-bearing.
- The live-cert arm consumes the shipping skill's OWN real outputs (harvested positives, D-02) -> the OOF/human adjudicator -> the frozen CP gates.
- The Phase-19 SCREEN-PASS is the upstream gate; the Phase-20 live WORKS verdict + the Haiku-first flip decision are the downstream milestone-closing outputs.

</code_context>

<specifics>
## Specific Ideas

- "Run the skill on itself" -- the live positives come from the tool's OWN real outputs on curated real questions, not a synthetic or off-distribution benchmark (the only difficulty-matched-AND-real positives available; D-02).
- "No theatre" -- since there is no production traffic, do NOT dress up a fake canary; the honest substitute is the offline dual-run + the audit-of-unanimous-upholds + an opt-in dogfood beta (D-05). Name the limit in the report: the verdict certifies on the maintainer-curated distribution, not "all production."
- "N=24 is a knife-edge, not a target" -- the board's decisive arithmetic finding (D-03): 0/24 clears 0.15 only at exactly zero, and fails the 0.10 gate; target N_ctrl 40 / N_trap ~34-40, separate arms.
- "Earn the flip" -- the CHEAP tier must EARN adoption (both gates + clean unanimous audit + a real cost win); the conservative-correct default is STRONG, deferred flip (D-06). Cost-asymmetry governs.
- "Frozen-floor headroom, not a threshold change" -- raising the N TARGET above N_CTRL_FLOOR=24 keeps `EVAL_THRESHOLDS` byte-identical (D-03); never relax a TAU to fit a realized N.
- "Per-invocation model" -- the single most load-bearing orchestration fact: plugin-agent frontmatter `model:` is inert; the orchestrator owns tier via the Agent-call `model` override (D-10).

</specifics>

<deferred>
## Deferred Ideas

- **The Haiku-first FLIP itself** -> a future post-certification run: only after a live WORKS pass + a clean unanimous-uphold audit + a real cost win, at a human checkpoint (D-06). Phase 20 ships the gated mechanism + guardrails + rollback, not the flip.
- **The owner escaped-error budget** ("<= X escaped false-upholds / 1000 claims") -> ratified at the Phase-20 live-cert plan review where the audit N makes it bind (carried from Phase 19's deferral; HAIKU-PILOT).
- **Release / publication (REL-01..03)** -> `/gsd-complete-milestone` after `/gsd-audit-milestone`, NOT a build phase.
- **v2 backlog:** SCALE-01 nested phase-runner (context-scaling beyond flat fan-out); SCALE-02 multimodal/PDF/CSV ingestion; SCALE-03 full crash-resumability state machine; AGGX-01 stronger semantic/paraphrase dedup. All explicitly v2.
- **A larger-N / ecosystem-representative live-cert corpus + ongoing production monitoring (SPC control charts)** -> post-release operational maturity; the literature found formal SPC essentially absent from LLM practice (threshold + drift + intervention is the current art).

### Reviewed Todos (not folded)
- **Research RTK command suitability for skills and agents** (~0.6) -- REVIEWED, NOT folded: orthogonal to wiring the orchestrator + the live cert (same disposition as Phases 16-19). Stays on the backlog.

</deferred>

---

*Phase: 20-orchestrator-skill-headless-scale-confirmation*
*Context gathered: 2026-06-19*
