# Feature Research

**Domain:** Deep-research agent capability (cited, fact-checked research reports) as a Claude Code plugin skill (`lz-deep-research`)
**Researched:** 2026-06-15
**Confidence:** HIGH (4 production systems + a domain survey + the citation-verification + self-consistency literature all triangulate; converged SESSION-DESIGN cross-checked against current external best practice)

> **[CORRECTION 2026-06-15 -- script placement]** Where this document places the deterministic off-model aggregator in `bin/`, that is SUPERSEDED. Re-verified against the live plugins-reference + plugin-dev `plugin-structure`/`skill-development` + skill-creator: `bin/` is a real official component, but it is for USER-FACING executables injected onto the Bash PATH (invokable as bare commands). The aggregator is a SKILL-INTERNAL helper, so it belongs in the skill's own bundled `scripts/` dir -- `skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs` -- invoked via `node "${CLAUDE_PLUGIN_ROOT}/skills/lz-deep-research/scripts/..."` (NOT a bare command; no PATH/exec-bit/shebang dependency, Windows-arm64 / Git-Bash safe). Read every `bin/` reference below as `skills/lz-deep-research/scripts/`. SUMMARY.md + REQUIREMENTS.md + ROADMAP.md use the corrected location.

> **Reading note for the requirements author.** This milestone (v2.1.0) has a FULL converged design at `.planning/research/SESSION-DESIGN.md` (3 model lineages + 4 spikes). This file's job is to (a) categorize the feature space the way the deep-research ecosystem frames it, (b) flag which features SESSION-DESIGN already commits to vs leaves open, and (c) note complexity + dependencies on existing plugin components. Where external best practice CONFIRMS the design I say so; where it adds a nuance or a gap I flag it explicitly. I found no strong cause to contradict any well-evidenced SESSION-DESIGN conclusion.
>
> NOTE: This file replaces the prior v2.0.0 FEATURES.md (on-demand Fable advisor / prefixed-skill UX), which shipped and was descoped/archived. This is fresh research for the v2.1.0 `lz-deep-research` milestone.

## How the deep-research category frames its capabilities

The four reference systems (OpenAI Deep Research, Gemini Deep Research, Perplexity Deep Research, Anthropic Research) and the "Deep Research Agents: A Systematic Examination And Roadmap" survey (arXiv 2506.18096) agree on a stable pipeline: **plan/decompose -> multi-source search -> retrieve/fetch -> extract claims -> verify -> synthesize a cited report with confidence**. That spine IS the table stakes. Differentiation lives in HOW verification and aggregation are done and HOW cost is controlled. The citation-verification literature (CiteCheck, CiteAudit, SemanticCite, RARR) and the self-consistency/voting literature supply the rigor benchmarks for the verification half.

## Feature Landscape

### Table Stakes (Users Expect These)

Every credible deep-research tool ships all of these. Missing any one makes the output feel like a glorified chat answer, not a research report.

| Feature | Why Expected | Complexity | Notes / SESSION-DESIGN status |
|---------|--------------|------------|-------------------------------|
| **Query decomposition into sub-angles** | Universal first step (OpenAI plan phase, Gemini research plan, Perplexity Stage 1 query decomposition). Survey lists Planning & Decomposition as core. | LOW | COMMITTED: SESSION-DESIGN Phase 1 "Sonnet drafts ~5 angles" (`ANGLES~5`). Pure prompt work in the skill body. |
| **Scope clarification before work** | OpenAI runs an interactive clarification step; Gemini uses collaborative plan approval. Quality of plan == quality of report (asserted by both OpenAI and Gemini). | LOW | COMMITTED but UNDER-WEIGHTED: SESSION-DESIGN Phase 0 "scope guard" (ask 2-3 Qs interactive; Assuming-frames headless). **Flag:** worth elevating to first-class - it is the single highest-leverage quality lever per OpenAI/Gemini, and it reuses the plugin's existing Assuming-frame convention. |
| **Multi-source web search (fan-out)** | All four run many searches (Gemini "dozens of iterations"; Perplexity 3-5 sequential passes; OpenAI hundreds of sources). | MEDIUM | COMMITTED: Phase 2 Haiku search wave, one worker per angle. Depends on `WebSearch` (already on all 4 existing skills' allowed-tools, D-11). |
| **Fetch + read source content** | Retrieval/fetching is a named survey subsystem; all systems read full pages/PDFs, not just snippets. | MEDIUM | COMMITTED: Phase 3 Sonnet extract wave via `WebFetch`. Reuses the existing `<fetched source trust="untrusted">` isolation convention (Common Contract rule 5a). |
| **Falsifiable-claim extraction from sources** | Survey lists Claim Extraction as core; FACTScore-style atomic decomposition is the dominant grounding method in the literature. | MEDIUM | COMMITTED: Phase 3 extract worker emits (claim + verbatim quote + excerpt id + source meta). |
| **Inline citations tying each claim to a source** | THE defining feature of the category - OpenAI "every factual claim has an inline citation"; Perplexity clickable citations per claim; Anthropic has a dedicated CitationAgent pass. | MEDIUM | COMMITTED: Phase 8 cited report. The citation->source binding is enforced mechanically (see differentiators). |
| **Per-claim confidence / reliability levels** | Perplexity emits "high/medium/uncertain" + disputed-data lists; survey lists Confidence/Uncertainty Quantification as core. (OpenAI's own eval flags weak confidence calibration as an industry weakness - so doing this WELL is differentiating.) | MEDIUM | COMMITTED: Phase 7-8 tally rubric -> High/Medium/Low/Contested/Unsupported. |
| **A written, structured report as the deliverable** | The output IS the product (all four produce multi-section reports, not chat turns). Gemini does multi-pass self-critique on structure. | LOW-MEDIUM | COMMITTED: Phase 8 report (per-claim confidence, citations, contested/unverified section). Report is a deliverable, not intermediate state. |
| **Cross-source consistency check / contradiction flagging** | Perplexity Stage 4 "conflicting claims flagged and double-checked"; Gemini "identifies inconsistencies." | MEDIUM | COMMITTED: corroboration counting in `bin/` dedup + a first-class "contested" outcome. |

**Confidence on table stakes: HIGH.** All nine appear in 3+ reference systems AND the survey. SESSION-DESIGN already commits to all nine; the only adjustment is to promote scope clarification from a guard to a headline feature.

### Differentiators (Competitive Advantage)

These are where `lz-deep-research` does something the commodity tools do not, and they map directly to the lz-advisor core value (near-Opus quality at Sonnet cost). All four are SESSION-DESIGN commitments; the external literature independently validates each.

| Feature | Value Proposition | Complexity | Notes / external validation |
|---------|-------------------|------------|------------------------------|
| **Adversarial multi-vote verification with ISOLATED voters** | Goes beyond "cite a source" to "actively try to refute each top claim." Isolation (no sibling sight) is the key choice. | HIGH | COMMITTED (Phase 6, `VOTES_PER_CLAIM=3`, diversified by attack mode). **Strongly validated:** the self-consistency / multi-agent-debate literature explicitly warns that DEBATE (agents see each other) risks "influence from persuasive yet incorrect arguments," whereas strict isolation "reduces the risk of propagating elaborate but erroneous arguments." SESSION-DESIGN picked isolation for exactly this reason. Honest limit (design already states it): same-family votes can share blind spots, and "self-consistent errors" (all samples agree on a wrong answer) are a documented failure mode - the design correctly biases toward Contested and leans on the quote re-check as the real guard, not the vote count. |
| **Evidence-artifact-centric verification (quote-vs-stored-excerpt re-check)** | Mechanically drops/flags any claim whose verbatim quote is NOT present in the immutably-stored fetched excerpt. Catches fabricated/drifted quotes at ZERO model cost. | HIGH | COMMITTED (Phase 7, spike A1 PROVEN). **This is the strongest differentiator.** The citation-verification literature (CiteCheck 88.7 macro-F1; SemanticCite content-layer 84%; CiteAudit's Evidence-Matcher/Reasoner roles) confirms content-level support-checking is SOTA, and that "citation exists" vs "citation supports the claim" are DISTINCT problems. SESSION-DESIGN's re-check targets the support/grounding axis deterministically - a sharper, cheaper instantiation of what those (model-based) multi-agent verifiers do. The GPT red-team correction (verify CONSISTENCY, not un-checkable PROVENANCE) is well-founded: a script cannot prove a tool was called, only that a quote matches stored text. |
| **Deterministic OFF-MODEL aggregation (`bin/` Node script)** | All dedup / ranking / vote-tally / quote-recheck runs as pure functions - reproducible, auditable, zero model tokens, no "laundering noisy votes into authority." | MEDIUM | COMMITTED (`bin/lz-deep-research.mjs`; the plugin's FIRST `bin/` component; spike A1 PASS). **Validated by cost literature:** CISC/ModelSwitch show mechanizing the consensus step cuts inference cost sharply; moving tally off-model takes that to its limit (0 tokens). Also a robustness win - the immutable-per-worker-files + explicit-merge design (no shared appendable JSONL) avoids the Windows/Git-Bash race condition the GPT red-team flagged. NEW dependency on existing plugin surface: requires `Bash(node:*)` (or auto-mode classifier) in the skill's allowed-tools - spike A2 proved auto-mode permits one named non-git Bash call. |
| **Cost discipline by construction** | Opus runs at exactly 2 read-only gates over bounded files; bulk is Haiku/Sonnet; aggregation is 0 tokens; Opus spend is FLAT as corpus scales. Token multiplier ~1.2-2x a single-pass Sonnet run, NOT the 4-220x of naive multi-agent. | HIGH (architectural property, not a toggle) | COMMITTED throughout (context-boundedness §6, cost model §9). **This is the differentiator that separates lz-deep-research from every commodity tool** - see Anti-Features for why the alternative is so expensive. The "advisor at 2 gates" pattern is the existing plugin's proven mechanism (reuse `advisor.md` unchanged). |
| **File-blackboard / receipt-only orchestration** | Workers write evidence to disk and return one-line receipts; main context stays O(workers x receipt), independent of corpus size. | MEDIUM-HIGH | COMMITTED (spike A2 PROVEN headless). This is what makes the cost-discipline + boundedness actually hold at runtime. No reference system documents this exact mechanism publicly; it is the plugin-native answer to "context pollution," which Anthropic names as one of only three things that justify multi-agent at all. |

**Confidence on differentiators: HIGH.** Each is independently validated by current external sources, and all four are already PROVEN or COMMITTED in SESSION-DESIGN. No divergence found.

### Anti-Features (Commonly Requested, Often Problematic)

Documenting what NOT to build is the point here - the design's value is as much in what it refuses as what it ships. All are explicit SESSION-DESIGN rejections; the external evidence makes the case airtight.

| Feature | Why Requested | Why Problematic | Alternative (what to do instead) |
|---------|---------------|-----------------|----------------------------------|
| **Full orchestrator-worker token blowup (Anthropic-style ~15x)** | It is the famous, highest-performing public design (Anthropic reports +90.2% over single-agent; "token usage explains 80% of performance variance"). Tempting to copy wholesale. | Anthropic's OWN figure: multi-agent uses ~15x the tokens of chat (and ~4x for plain agents); a misbehaving subagent can multiply by another 10x. UIUC: 4-220x across configs. Stanford: at EQUAL token budget, single agents BEAT multi-agent on reasoning. A ~15x cost model directly VIOLATES the plugin's core value ("near-Opus at Sonnet cost"). | Receipt-only file-blackboard + off-model aggregation + Opus only at 2 gates. Keep the parallel-fan-out BENEFIT (genuine parallel work) without the orchestration TAX. Target ~1.2-2x, not 15x. (SESSION-DESIGN §9.) |
| **Workflow-tool / `workflows/` component dependency** | Dynamic workflows feel like the "native" way to express a multi-step pipeline. | A plugin CANNOT ship a `workflows/` component (verified: the component surface has no `workflows/`); dynamic workflows live only in user `.claude/workflows/`. Sonnet 4.6 cannot even auto-orchestrate one (`xhigh`/`ultracode` gated to Opus/Fable). Building on it makes the skill un-shippable as a plugin. | A self-contained `skill + agents + bin/` that orchestrates in the main Sonnet session. (SESSION-DESIGN §2.) |
| **Agent teams (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`)** | Marketed as the heavyweight multi-agent path; conceptually fits "a team of researchers." | Experimental; requires an env flag a plugin cannot set or detect; ~7x token cost in plan mode; headless-incompatible (tmux/iTerm2) - which breaks the project's `claude -p` verification convention outright. | Plain subagents spawned by the skill (which CAN nest since v2.1.172, used only as an OPTIONAL scale refinement, never the spine). (SESSION-DESIGN §2.) |
| **Scope creep: more Opus specialists / a 3rd verification gate / multimodal / PDF+CSV ingestion / live streaming / resumable state machine** | Each commodity tool advertises one of these (Gemini Max: multimodal grounding, MCP, live streaming; OpenAI: image/PDF analysis). Easy to chase parity. | (a) A 3rd "split-tally" Opus gate "launders noisy votes into authority" (GPT correction). (b) More Opus specialists violate the "too many specialists" warning and re-inflate cost. (c) Multimodal/streaming/MCP are large surface area for marginal v1 value and pull in dependencies the zero-dep constraint forbids. (d) A manifest-cursor resumable state machine re-introduces the workflow-engine complexity the design explicitly rejected. | Hold the line at: reuse `advisor` (no new Opus agent), exactly 2 gates, text-source v1, checkpointed reruns from immutable wave inputs (NOT a state machine). (SESSION-DESIGN §4, §10.) |
| **Shared appendable JSONL ledger written by parallel workers** | Obvious "one place to collect everything" pattern. | Windows/Git-Bash race-condition magnet (partial writes, dup ids, collisions); it is "the workflow engine we said we don't have." | Immutable per-worker files + one explicit deterministic merge step. (SESSION-DESIGN §7, GPT red-team correction.) |
| **Trusting the vote count as proof of truth** | 3/3 votes feels authoritative; tempting to treat a unanimous uphold as "verified." | Same-family votes share blind spots; "self-consistent errors" are a documented literature failure mode; a Haiku false-uphold is UNANIMOUS by definition, so the contested-split trigger structurally CANNOT catch it (4th-advisor "silent false-uphold" correction). | Treat the quote-vs-excerpt re-check as the real anti-hallucination guard; make Contested first-class; STRUCTURALLY require escalation of load-bearing claims + an audit sample of unanimous upholds. (SESSION-DESIGN §8, §15.1.) |

**Confidence on anti-features: HIGH.** The cost-discipline anti-feature in particular is over-determined: Anthropic's 15x, UIUC's 4-220x, Stanford's equal-budget result, and Google's -70%-on-sequential-tasks all point the same way.

## Feature Dependencies

```
[Scope clarification]  (Phase 0)
    '--feeds--> [Query decomposition into ~5 angles]  (Phase 1)
                    |--Gate 1 (Opus advisor)--> reviews framing / angles
                    '--requires--> [Multi-source search fan-out]  (Phase 2, Haiku)
                                       '--requires--> [Fetch + extract claims + STORE excerpt]  (Phase 3, Sonnet)
                                                          '--requires--> [Off-model dedup / rank]  (Phase 4, bin/)
                                                                             |--Gate 1b (Opus, optional re-order)
                                                                             '--requires--> [Adversarial isolated voting]  (Phase 6)
                                                                                                '--requires--> [Off-model tally + QUOTE RE-CHECK]  (Phase 7, bin/)
                                                                                                                   |--Gate 2 (Opus advisor: synthesis / calibration)
                                                                                                                   '--requires--> [Cited report + confidence + contested section]  (Phase 8)

[Evidence-artifact quote re-check]  --depends on--> [Immutable stored excerpt written at extract time]
[Deterministic off-model aggregation] --depends on--> [Immutable per-worker files] (NOT shared JSONL)
[Cost discipline] --emergent from--> [receipt-only returns] + [off-model bin/] + [Opus at 2 gates]
[Adversarial verification] --conflicts with--> [agent-debate / shared-vote-sight] (isolation required)
```

### Dependency Notes

- **Quote re-check requires the stored excerpt to be written DURING extraction (Phase 3), not reconstructed later.** If the excerpt is not captured immutably at fetch time, there is nothing to re-check the quote against. This makes the extract worker's `Write` contract load-bearing for the entire verification differentiator.
- **Cost discipline is emergent, not a feature you can add later.** It falls out of receipt-only returns + off-model aggregation + Opus-at-2-gates. Bolting volume on after the fact (raising `MAX_FETCH`, adding a 3rd Opus gate) erodes it. The named ceilings (`ANGLES~5`, `MAX_FETCH=15`, `MAX_VERIFY_CLAIMS~24`, `VOTES_PER_CLAIM=3`, `SYNTH_CAP~20`) are the cost contract.
- **Adversarial verification conflicts with agent debate.** You cannot have both "isolated skeptic votes" and "voters see each other's reasoning." The literature says isolation is the safer choice; the design must keep voters blind to siblings.
- **The Haiku-first voter tier depends on a pre-registered open-book eval.** SESSION-DESIGN §15/§15.1/§15.2 leaves the Tier-1 model OPEN: all-Sonnet is the active default; Haiku-first is PROVISIONAL behind a config flag until a 60-100-claim, k>=5, pre-registered eval (false-uphold rate as the SOLE hard gate) clears. The escalation ARCHITECTURE (quote-drop -> cheap vote -> Sonnet escalation on contested/load-bearing/audit-sample) is FINAL regardless of the Tier-1 model.
- **Reuse of the existing `advisor` agent is a dependency, not a new build.** Gate 1 and Gate 2 reuse `agents/advisor.md` (`[Read, Glob]`, `model: opus`) unchanged. No new Opus specialist (honors the "too many specialists" warning and the existing 3-agent roster discipline).

## MVP Definition

### Launch With (v1 == v2.1.0)

The full SESSION-DESIGN spine. Deep research is not meaningfully MVP-able below the full pipeline - a tool that decomposes and searches but does not verify or cite is just chat-with-search, which Claude Code already has.

- [ ] Scope guard + decompose into ~5 angles (Phase 0-1) - entry quality lever; reuses Assuming-frame convention
- [ ] Multi-source search fan-out (Phase 2) - the volume tier (Haiku workers)
- [ ] Fetch + extract falsifiable claims + STORE immutable excerpt (Phase 3) - without the stored excerpt, no quote re-check
- [ ] Off-model dedup/rank in `bin/` (Phase 4) - the first `bin/` component; zero-token aggregation
- [ ] Adversarial isolated voting on top claims (Phase 6) - the verification differentiator (all-Sonnet default)
- [ ] Off-model tally + quote-vs-excerpt re-check in `bin/` (Phase 7) - the real anti-hallucination guard (spike A1 proven)
- [ ] Cited report with per-claim confidence + first-class Contested section (Phase 8)
- [ ] Reuse existing Opus `advisor` at exactly 2 read-only gates - no new Opus agent
- [ ] Ship as additive MINOR v2.1.0: validation fixture, CHANGELOG, README, release (per PROJECT.md milestone goal)

### Add After Validation (v1.x / config-gated)

- [ ] **Haiku-first Tier-1 voting** - trigger: the pre-registered open-book gating eval (§15.1) clears with ~0 false-uphold on the SUBTLE subset AND a real cost win below the all-Sonnet baseline. Until then, all-Sonnet default stays; Haiku-first lives behind a config flag (downgrade-only pilot already showed no kill signal, §15.2).
- [ ] **Random audit-sample escalation of unanimous upholds** - STRUCTURALLY REQUIRED if/when Haiku-first ships (the only guard against silent false-upholds); harmless to include from the start as a cheap interim guard.
- [ ] **Stronger paraphrase dedup** - trigger: corpora where number-word normalization (already in spike A1) under-merges semantic paraphrase enough to mislead corroboration counts. Keep as a known caveat, not a v1 blocker.

### Future Consideration (v2+)

- [ ] **Optional nested "phase-runner" subagent** - defer until concurrency-at-scale (~5-15 workers) is proven; nesting is a scale refinement, never the spine.
- [ ] **Multimodal / PDF / CSV source ingestion** - defer; large surface area, marginal v1 value, risks the zero-dep constraint. (Gemini Max parity, not core value.)
- [ ] **Resumability beyond checkpointed reruns** - defer a manifest-cursor state machine indefinitely; checkpointed reruns from immutable wave inputs cover v1 and avoid re-introducing a workflow engine.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Decompose + scope clarification | HIGH | LOW | P1 |
| Multi-source search fan-out | HIGH | MEDIUM | P1 |
| Fetch + extract + store excerpt | HIGH | MEDIUM | P1 |
| Off-model dedup/rank (`bin/`) | HIGH | MEDIUM | P1 |
| Cited report + confidence levels | HIGH | MEDIUM | P1 |
| Quote-vs-excerpt re-check (`bin/`) | HIGH (the differentiator) | HIGH | P1 |
| Adversarial isolated voting | HIGH | HIGH | P1 |
| Reuse Opus advisor at 2 gates | HIGH (core-value carrier) | LOW (reuse) | P1 |
| Cost discipline (architectural) | HIGH | HIGH (design-time) | P1 |
| Haiku-first Tier-1 voting | MEDIUM (cost) | MEDIUM | P2 (gated on eval) |
| Audit-sample escalation | MEDIUM (safety) | LOW | P2 |
| Stronger paraphrase dedup | MEDIUM | MEDIUM | P3 |
| Nested phase-runner | LOW (scale only) | HIGH | P3 |
| Multimodal ingestion | LOW (v1) | HIGH | P3 |

**Priority key:**
- P1: Must have for launch (v2.1.0)
- P2: Should have, add when the gating signal clears
- P3: Nice to have, future consideration

Note the unusual P1 cluster: deep research has a high MVP floor. The category's value comes precisely from verify+cite+confidence, so those cannot be deferred without shipping a non-differentiated search wrapper.

## Competitor Feature Analysis

| Feature | OpenAI Deep Research | Gemini Deep Research | Perplexity Deep Research | Anthropic Research | `lz-deep-research` (our approach) |
|---------|----------------------|----------------------|--------------------------|---------------------|-----------------------------------|
| Decompose / plan | Plan phase (RL-tuned o3) | Collaborative plan, user-approved | Stage 1 query decomposition | Lead agent drafts strategy | Sonnet drafts ~5 angles; Opus reviews framing (Gate 1) |
| Scope clarification | Interactive clarification step | Plan review/refine before run | Intent parsing + routing | Lead agent analyzes request | Phase 0 scope guard (Qs interactive / Assuming-frames headless) |
| Search fan-out | Iterative, hundreds of sources | Dozens of iterations, parallel sub-tasks | 3-5 sequential passes | 3-5 parallel subagents | ~5 Haiku workers, one per angle |
| Architecture | Single-agent (one RL model, internal roles) | Single agentic model, dynamic plan | Single iterative loop | Orchestrator + 3-5 workers (~15x tokens) | Thin Sonnet dispatcher + file-blackboard workers + off-model `bin/` |
| Verification | Inline citations; admits weak calibration + hallucination | Self-critique passes; flags inconsistencies | Stage 4 cross-source validation; "high/med/uncertain" | Separate citation pass (CitationAgent) | Isolated adversarial votes + DETERMINISTIC quote-vs-excerpt re-check |
| Confidence levels | Citations only (calibration flagged weak) | Qualitative | Explicit high/med/uncertain + disputed list | Citation-backed | Rubric: High/Medium/Low/Contested/Unsupported; Contested first-class |
| Cost posture | High (minutes, premium) | High (background async, premium) | Moderate (2-4 min) | Very high (~15x; dollars/query) | ~1.2-2x a single Sonnet pass; Opus spend FLAT as corpus scales |
| Zero-dependency / plugin-native | N/A (hosted) | N/A (hosted/API) | N/A (hosted) | N/A (product) | YES - skill + agents + one `bin/` script; no external deps |

**Our distinct position:** the commodity tools optimize for breadth and polish at premium cost; `lz-deep-research` optimizes for VERIFIABLE grounding (deterministic quote re-check) at near-Sonnet cost, inside a zero-dep plugin. The deterministic off-model re-check is something no public reference system documents - they verify with models (CitationAgent, self-critique), which is exactly where cost and calibration weakness creep in.

## Sources

Reference systems:
- [Introducing deep research | OpenAI](https://openai.com/index/introducing-deep-research/)
- [How OpenAI's Deep Research Works | PromptLayer](https://blog.promptlayer.com/how-deep-research-works/)
- [How OpenAI, Gemini, and Claude Use Agents to Power Deep Research | ByteByteGo](https://blog.bytebytego.com/p/how-openai-gemini-and-claude-use)
- [Gemini Deep Research overview | Google](https://gemini.google/overview/deep-research/)
- [Try Deep Research and our new experimental model | Google blog](https://blog.google/products/gemini/google-gemini-deep-research/)
- [Gemini Deep Research Agent | Gemini API docs](https://ai.google.dev/gemini-api/docs/deep-research)
- [Introducing Perplexity Deep Research | Perplexity](https://www.perplexity.ai/hub/blog/introducing-perplexity-deep-research)
- [How Perplexity AI Answers Work: Retrieval, Ranking, and Citation Pipeline | ZipTie](https://ziptie.dev/blog/how-perplexity-ai-answers-work/)
- [How Anthropic Built a Multi-Agent Research System | ByteByteGo](https://blog.bytebytego.com/p/how-anthropic-built-a-multi-agent)
- [When to use multi-agent systems (and when not to) | Claude](https://claude.com/blog/building-multi-agent-systems-when-and-how-to-use-them)

Domain survey + verification/cost literature:
- [Deep Research Agents: A Systematic Examination And Roadmap (arXiv 2506.18096)](https://arxiv.org/pdf/2506.18096)
- [CiteCheck: Retrieval-Grounded Detection of LLM Citation Hallucinations (arXiv 2605.27700)](https://arxiv.org/html/2605.27700v1)
- [CiteAudit: A Benchmark for Verifying Scientific References (arXiv 2602.23452)](https://arxiv.org/pdf/2602.23452)
- [Detecting and Correcting Reference Hallucinations (RARR context) (arXiv 2604.03173)](https://arxiv.org/html/2604.03173v1)
- [Self-Consistency in Language Models | EmergentMind](https://www.emergentmind.com/topics/self-consistency-in-language-models)
- [LLM Fan-Out 101: Self-Consistency, Consensus, and Voting Patterns | Kinde](https://www.kinde.com/learn/ai-for-software-engineering/workflows/llm-fan-out-101-self-consistency-consensus-and-voting-patterns/)
- [Why Single Agents Beat Multi-Agent Systems at Equal Token Budgets | DEV](https://dev.to/greza_dev/why-single-agents-beat-multi-agent-systems-at-equal-token-budgets-445c)
- [When Multi-Agent Is Overkill: A Decision Framework | Augment Code](https://www.augmentcode.com/guides/when-multi-agent-ai-is-overkill)
- [The Hidden Economics of AI Agents | Stevens Online](https://online.stevens.edu/blog/hidden-economics-ai-agents-token-costs-latency/)

Internal:
- `.planning/research/SESSION-DESIGN.md` (converged 3-lineage + 4-spike design - the authoritative spec this milestone builds on)
- `.planning/PROJECT.md` (milestone v2.1.0 goal, core value, zero-dep constraint)

---
*Feature research for: deep-research agent capability (`lz-deep-research` skill)*
*Researched: 2026-06-15*
