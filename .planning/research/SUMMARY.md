# Project Research Summary

**Project:** lz-advisor (milestone v2.1.0 -- the `lz-deep-research` skill)
**Domain:** Parallel-fan-out, web-searching, adversarially-verified deep-research capability inside a zero-dependency, headless-verifiable Claude Code plugin
**Researched:** 2026-06-15
**Confidence:** HIGH

> **Orientation for the requirements + roadmap authors.** This milestone is unusual: a fully converged design already exists at `.planning/research/SESSION-DESIGN.md` (triangulated across 3 model lineages -- 6 blind Opus architects + GPT-5.5 + Gemini 3.1 Pro -- plus 4 empirical spikes, with two PASS results: A1 deterministic core, A2 headless fan-out). The four researcher files (STACK, FEATURES, ARCHITECTURE, PITFALLS) overwhelmingly **CONFIRM** that spine. Do NOT re-litigate the converged design. This summary deliberately foregrounds the handful of items that are **NEW or SHARPENED beyond SESSION-DESIGN** -- those are where roadmap attention is actually needed. Everything else is "build what the design already says."

> **[CORRECTION applied -- script placement]** The four researcher files + SESSION-DESIGN.md were drafted placing the deterministic off-model aggregator in `bin/`. That was re-verified (live plugins-reference + plugin-dev `plugin-structure`/`skill-development` + skill-creator, UNANIMOUS) and CORRECTED: `bin/` is a real official component but it is for USER-FACING executables injected onto the Bash PATH (invokable as bare commands). The aggregator is a SKILL-INTERNAL helper, so it belongs in the skill's own bundled `scripts/` dir: **`skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs`**, invoked via `node "${CLAUDE_PLUGIN_ROOT}/skills/lz-deep-research/scripts/..."` (NEVER a bare command; no PATH/exec-bit/shebang dependency; Windows-arm64 / Git-Bash safe). This summary, REQUIREMENTS.md, and ROADMAP.md use the corrected location; each source file carries a top-of-file correction banner.

## Executive Summary

`lz-deep-research` is a fifth skill for the shipped v2.0.0 lz-advisor plugin: a deep-research agent that decomposes a question, fans out parallel web search/fetch/extract workers, adversarially verifies the top claims with isolated skeptic voters, and emits a cited report with per-claim confidence -- all as a zero-dependency Claude Code plugin (skill + agents + references + the skill's first bundled `scripts/` Node helper). The deep-research category has a stable, well-documented spine (decompose -> search -> fetch -> extract -> verify -> cite), and the converged design implements it as the "advisor strategy applied to research": cheap tiers (Haiku/Sonnet) do the volume, a deterministic off-model `scripts/` helper does all aggregation at zero model tokens, and the existing Opus `advisor` is consulted read-only at exactly two high-leverage gates. The target cost is ~1.2-2x a single-pass Sonnet run -- not the 4-220x of naive multi-agent designs. This cost asymmetry is the whole point and is over-determined by external evidence (Anthropic's own ~15x figure, UIUC's 4-220x, Stanford's equal-budget result).

The recommended approach is to build bottom-up against the converged spine: the deterministic `scripts/` aggregator + its validation fixture first (it is the highest-risk-of-subtle-bug component and the contract everything feeds), then freeze the JSON schema reference, then the three least-privilege worker agents, then the orchestrator skill (where full-scale headless fan-out is confirmed), then additive integration + release. The full pipeline including verify + cite + confidence is P1 and cannot be staged down -- deep research below the full pipeline is just chat-with-search, which Claude Code already has. The single config-gated P2 item is the **Haiku-first Tier-1 voter**, locked behind a pre-registered open-book gating eval; the escalation architecture itself is FINAL/P1, and **all-Sonnet voters are the shipping default**.

The dominant risks are NOT the spine (proven) but four operational/correctness sharpenings the research surfaced beyond the design: (1) a parallel-spawn **disk-I/O storm** and a silent **~10-concurrent platform cap** with no `maxParallelAgents` setting, demanding explicit wave-batching (<=5 in-flight) plus a dedicated scale spike; (2) **open-book reference/corroboration pollution** as the concrete mechanism that manufactures the design's named "silent false-uphold," demanding a mandated disconfirming search and source-independence weighting; (3) a **provider-scope decision** (`--permission-mode auto` is v2.1.83+ and off-by-default on Bedrock/Vertex; `WebSearch` is hidden on Bedrock) that must pin a platform floor and a graceful-degradation rule; and (4) two mechanical integration facts -- a **6-surface atomic version sync** (the new SKILL.md adds a `version:` field) and `.lz-research/` gitignore + a CRLF-safe, zero-dep `scripts/` helper. Plus one feature elevation: **scope clarification** should be promoted from a guard to a first-class table-stakes feature.

## Key Findings

### Recommended Stack

This is a zero-dependency Claude Code plugin, so the "stack" is the set of platform capabilities the feature stands on plus the one runtime (Node.js) the `scripts/` aggregator needs -- not an npm dependency tree. STACK.md re-verified every load-bearing fact against live `code.claude.com/docs` on 2026-06-15 and against the locally installed `claude --version` = 2.1.177, and CONFIRMS all of SESSION-DESIGN's platform assumptions. It EXTENDS the design with strengthening platform facts (plugin agents officially support `effort:` in frontmatter) and FLAGS the provider-/version-sensitivity that drives the platform-floor decision below. **It also surfaced the `bin/` placement question, now CORRECTED:** the aggregator is a skill-internal helper and belongs in `skills/lz-deep-research/scripts/`, not `bin/` (which is for user-facing PATH executables).

**Core technologies:**
- **`skills/lz-deep-research/SKILL.md`** (v2.1.x stable): the orchestrator -- thin Sonnet dispatcher, runs in the main session, spawns workers, runs the `scripts/` helper, consults the advisor. The plugin's only first-class multi-step entry point.
- **`agents/*.md` with `model:` override** (v2.1.x stable): the tier-fan-out mechanism. NEW workers (`research-search-worker` haiku, `research-extract-worker` sonnet, `research-verify-voter` sonnet) plus REUSE of the existing `advisor` (opus) at 2 read-only gates. No new Opus specialist.
- **`skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs`** (v2.1.x stable): the skill's FIRST bundled `scripts/` helper -- deterministic off-model aggregator (merge / dedup / rank / vote-tally / quote-vs-excerpt re-check), pure Node ESM, zero npm deps. Invoked via `node "${CLAUDE_PLUGIN_ROOT}/skills/lz-deep-research/scripts/..."` (or `${CLAUDE_SKILL_DIR}/scripts/...`) -- never a bare command, for Windows-arm64 / Git-Bash portability and zero shebang/exec-bit ambiguity.
- **Built-in `WebSearch` + `WebFetch`** (v2.1.x stable): the search/fetch tools workers and voters use -- zero external deps. Both are provider-sensitive (see platform floor).
- **`--permission-mode auto`** (v2.1.83+): the headless path that lets workers `Write` and the orchestrator run the one named non-git `Bash` (`node ...scripts/...`) call without stalling. Spike A2 PROVED this at n=2. Version- and provider-gated.
- **Node.js (Node 18+ ESM, no packages)**: runs the aggregator. Zero external dependency constraint stays intact.

### Expected Features

FEATURES.md triangulates four production systems (OpenAI / Gemini / Perplexity / Anthropic Research) + the arXiv 2506.18096 survey + the citation-verification and self-consistency literature. The category spine IS the table stakes; differentiation lives in HOW verification and aggregation are done and HOW cost is controlled. Deep research has an unusually high MVP floor -- the value comes precisely from verify + cite + confidence, so the P1 cluster is large.

**Must have (table stakes, all P1):**
- Query decomposition into ~5 sub-angles
- **Scope clarification before work -- ELEVATE to first-class.** SESSION-DESIGN has it as a Phase 0 "scope guard"; FEATURES.md flags it as the single highest-leverage quality lever (per OpenAI/Gemini) and recommends promoting it from guard to headline feature. It reuses the plugin's existing Assuming-frame convention for the headless path.
- Multi-source web search fan-out (Haiku wave, one worker per angle)
- Fetch + read source content + **store the excerpt immutably at fetch time** (load-bearing for the quote re-check differentiator)
- Falsifiable-claim extraction (claim + verbatim quote + excerpt id + source meta)
- Inline citations binding each claim to a source
- Per-claim confidence levels (High/Medium/Low/Contested/Unsupported)
- A written, structured report as the deliverable
- Cross-source consistency / contradiction flagging (Contested is first-class)

**Should have (differentiators, all P1 -- this is where lz-advisor distinguishes itself):**
- **Adversarial multi-vote verification with ISOLATED voters** -- the literature warns debate (voters see each other) risks propagating persuasive-but-wrong arguments; isolation is the safer choice.
- **Evidence-artifact-centric verification (deterministic quote-vs-stored-excerpt re-check)** -- the strongest differentiator; catches fabricated/drifted quotes at zero model cost. Verifies CONSISTENCY, not un-checkable provenance.
- **Deterministic off-model aggregation (`scripts/` helper)** -- reproducible, auditable, zero model tokens.
- **Cost discipline by construction** -- Opus at exactly 2 gates over bounded files; bulk on cheap tiers; ~1.2-2x single-pass Sonnet.
- **File-blackboard / receipt-only orchestration** -- workers write to disk, return one-line receipts; main context stays bounded regardless of corpus size.

**Defer (config-gated / v2+):**
- **Haiku-first Tier-1 voting (P2)** -- behind a config flag; locked ONLY by the pre-registered open-book gating eval (false-uphold rate as the SOLE hard gate). All-Sonnet ships as default. The escalation ARCHITECTURE is FINAL regardless.
- **Random audit-sample escalation of unanimous upholds (P2, but include from the start)** -- the only interim guard against silent false-upholds; harmless as a cheap interim guard even before Haiku-first.
- Stronger paraphrase dedup (P3); nested phase-runner subagent (P3, scale only); multimodal/PDF/CSV ingestion (P3); resumability beyond checkpointed reruns (defer indefinitely -- it re-introduces the workflow engine the design rejects).

**Explicit anti-features (do NOT build):** full orchestrator-worker token blowup (~15x); `workflows/` component dependency (a plugin cannot ship it); agent teams (experimental, headless-incompatible, ~7x); a 3rd Opus split-tally gate ("launders noisy votes into authority"); a shared appendable JSONL ledger (Windows/Git-Bash race magnet); trusting the vote count as proof of truth.

### Architecture Approach

ARCHITECTURE.md is a BUILD-ON integration study, not a fresh map: the shipped v2.0.0 layout (3 Opus agents, 4 skills, 4 references, atomic multi-surface version sync, zero deps) is FIXED, and the converged spine slots cleanly onto it. The roster delta is **+1 skill, +3 cheap-tier worker agents, +1 skill `scripts/` helper, +1 reference, +1 gitignored scratch dir** -- the `advisor` agent and three references are reused unchanged; `reviewer.md` and `security-reviewer.md` are out of scope. The four architectural patterns (Receipt-Rule Fan-Out, Off-Model Deterministic Reduction, Advisor at Exactly Two Gates, Evidence-Artifact-Centric Verification) all map directly onto existing plugin conventions.

**Major components:**
1. **`skills/lz-deep-research/SKILL.md`** (NEW) -- orchestrator: scope-guard, decompose, dispatch worker waves, run the `scripts/` helper, consult advisor at 2 gates, assemble cited report. Holds only the run manifest + bounded summaries + 2 advisor notes; never raw source text or raw votes.
2. **Three worker agents** (NEW, least-privilege) -- `research-search-worker` (haiku, `[WebSearch, Write]`), `research-extract-worker` (sonnet, `[WebFetch, Write]`), `research-verify-voter` (sonnet default, `[WebSearch, WebFetch, Write]`).
3. **`skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs`** (NEW) -- off-model deterministic aggregator: merge per-worker files, dedup, rank/cap, tally votes, re-check quotes vs stored excerpts, emit bounded summaries.
4. **`references/lz-deep-research-schema.md`** (NEW) -- JSON schemas, tally rubric, quote-recheck contract, named ceilings. Reuses `advisor` (Gate 1/Gate 2) + 3 existing references via progressive disclosure.
5. **`.lz-research/<run-id>/`** (NEW, gitignored) -- the file-blackboard: immutable per-worker files, stored excerpts, votes, bounded survivors, the report deliverable.

**Two integration facts NEW beyond SESSION-DESIGN (mechanical, not design changes):**
- The version bump is a **6-surface atomic sync** -- the new SKILL.md adds a `version:` field to the existing 5 (plugin.json + 4 existing SKILL.md), then the release-publication surfaces (CHANGELOG, README, tag/Release).
- **`.lz-research/` must be gitignored** as runtime scratch.

### Critical Pitfalls

PITFALLS.md tags each pitfall against the design (`MITIGATED-IN-DESIGN` / `PARTIALLY MITIGATED` / `OPEN` / `NEW`). The two `[NEW]` critical pitfalls are the ones requiring the most roadmap attention; the `[MITIGATED-IN-DESIGN]` ones need build-time re-confirmation, not re-design.

1. **Parallel-spawn disk-I/O storm + silent ~10-concurrent batching `[NEW]`** -- the fan-out (search ~5, fetch up to 15, verify up to 24 claims x 3 = up to 72 voter spawns) collides with two documented platform behaviors: (a) a disk-I/O storm (a documented case spawned 24 subagents and drove disk I/O 17.3x over baseline, requiring a hard reboot), and (b) a ~10-concurrent cap with silent batching (the skill THINKS it fanned out 72 voters while they run in serial batches). No `maxParallelAgents` setting exists. **Avoid:** wave-batch explicitly at <=5 in-flight, wait for receipts, dispatch the next batch; treat in-flight spawn count as a first-class ceiling in the `scripts/` aggregator and the skill; add a dedicated build-time scale spike at real ceilings (not n=2).
2. **Open-book reference/corroboration pollution `[NEW]`** -- this is the concrete MECHANISM that manufactures the design's named silent false-uphold: an open-book voter "verifies" a false claim by finding echo-chamber pages that repeat it. SESSION-DESIGN treats open-book as strictly stronger than closed-book; it is not -- open-book introduces this failure class. **Avoid:** mandate an explicit DISCONFIRMING search (search the negation, not the claim's own terms) and require the vote to record the disconfirming query it ran; weight corroboration by SOURCE INDEPENDENCE not source count (N syndicated copies = 1 source); require the voter to distinguish "found pages asserting X" from "found primary evidence for X."
3. **Silent false-uphold the escalation cannot catch `[PARTIALLY MITIGATED]`** -- a unanimous-wrong verdict has no split, so the contested-trigger structurally cannot catch it. **Avoid:** escalate on the UNION of three triggers -- (a) any contested split, (b) any load-bearing claim regardless of Tier-1 verdict, (c) a ~15-20% random audit sample of unanimous upholds; keep the quote-vs-excerpt drop UPSTREAM of all voting. These are STRUCTURALLY REQUIRED, not optional.
4. **Headless `--permission-mode auto` Write / non-git-Bash stall `[MITIGATED-IN-DESIGN, re-confirm packaged]`** -- proven at n=2 as a bare `-p` prompt; the PACKAGED skill with declared `allowed-tools` is untested. **Avoid:** confine all Writes to worker frontmatter so the main session's only non-git Bash is the single named `node ...scripts/...` call; declare `Write` + the exact `Bash(node ...)` invocation in the skill; re-run A2 as the packaged skill as an acceptance gate.
5. **Lexical-dedup over-claim of corroboration `[PARTIALLY MITIGATED]`** + **quote/passage fidelity `[PARTIALLY MITIGATED]`** -- "30%" vs "thirty percent" under-merges (number-word normalization landed in A1; deeper paraphrase is OPEN); and a verbatim quote can be REAL but not SUPPORT the claim (quote-presence != entailment). **Avoid:** treat corroboration count as a lower bound; bias dedup toward under-merging (preserve dissent); store enough surrounding excerpt context for the voter to judge on-point-ness; label "quote verified verbatim" and "claim supported" as two distinct assurances. Do NOT add an embedding/semantic-dedup dependency (zero-dep violation).
6. **`scripts/` helper zero-dep + cross-platform drift `[NEW]`** -- the skill's first bundled `scripts/` helper could pull an npm dep, break on Windows arm64 / Git Bash (CRLF, path separators), or assume a Node version. **Avoid:** pure Node stdlib only; explicit UTF-8 + LF normalization; `path.join` + `${CLAUDE_PLUGIN_ROOT}`/`${CLAUDE_SKILL_DIR}`; `fs.readdirSync` not shell globbing; test on the actual host.

## Implications for Roadmap

The build is dependency-ordered bottom-up: each step's output is the next step's input contract. Building the aggregator first means the schema is empirically grounded before agents commit to it; the skill is last among build steps because it is the only place full-scale headless concurrency can be confirmed; release is purely additive and trails a working capability. The provider-scope decision is a prerequisite that should be settled before or during Phase 1 because it bounds the platform floor everything else assumes.

### Phase 0 (prerequisite decision): Provider scope + platform floor
**Rationale:** `--permission-mode auto` is v2.1.83+ and OFF by default on Bedrock/Vertex/Foundry; `WebSearch` is HIDDEN entirely on Bedrock and Claude-4-only on Vertex; model aliases resolve differently per provider. The entire headless permission path (spike A2) and the search/voter tiers assume the Anthropic first-party API. This is not a build phase but a decision the roadmap must pin before requirements freeze.
**Delivers:** A pinned platform floor (recommend: Anthropic first-party API as the supported target, matching what the plugin ships against today) + an explicit graceful-degradation rule if Bedrock/Vertex are declared in scope (mark search unavailable, continue -- per the existing Common-Contract Rule 6). If Bedrock/Vertex are in scope, graceful degradation is a hard requirement, not a nicety.
**Avoids:** Shipping a skill that silently fails on a provider where `WebSearch`/`auto` are absent.

### Phase 1: Deterministic `scripts/` aggregator + validation fixture (FOUNDATION)
**Rationale:** Build the off-model aggregator FIRST -- it has zero dependencies on agents or skill, is the most testable, and is the highest-risk-of-subtle-bug component. Spike A1's `aggregate-spike.mjs` is the proven prototype to harden. It blocks everything downstream that consumes its output contract.
**Delivers:** `skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs` (merge/dedup/rank/tally/quote-recheck) + the validation fixture (currently non-existent per SESSION-DESIGN s14).
**Uses:** Pure Node ESM stdlib (zero deps); `${CLAUDE_PLUGIN_ROOT}`/`${CLAUDE_SKILL_DIR}` paths; UTF-8 + LF normalization.
**Implements:** Off-Model Deterministic Reduction + Evidence-Artifact-Centric Verification patterns.
**Avoids:** Pitfall 6 (zero-dep/CRLF -- acceptance gate: runs zero-dep on Windows arm64 / Git Bash); Pitfall 5/8 (fixture asserts fabricated-quote dropped, real-quote/wrong-passage downgraded, paraphrase-pair NOT counted as 2 independent sources, near-dup pair merges, ceilings code-enforced).

### Phase 2: JSON schema reference (CONTRACT)
**Rationale:** Freeze the schemas right after the aggregator's behavior is proven, so the `scripts/` helper and all three workers agree on the shapes before agents commit. Blocks the worker agents.
**Delivers:** `references/lz-deep-research-schema.md` -- JSON schemas (source/claim/vote/excerpt), tally rubric (3/3->High, 2/3->Medium, <=1/3 or explicit refutation->Low/Contested, all-insufficient->Unsupported; refuted = downgrade not delete unless explicit), quote-recheck contract, named ceilings (`ANGLES~5`, `MAX_FETCH=15`, `MAX_VERIFY_CLAIMS~24`, `VOTES_PER_CLAIM=3`, `SYNTH_CAP~20`), and the escalation trigger set (contested + load-bearing + audit-sample).
**Avoids:** Pitfall 14 (shared knowledge in `references/`, never inlined cross-skill); Pitfall 11 (downgrade-not-delete rubric).

### Phase 3: Three worker agents (PRODUCERS)
**Rationale:** Author the workers against the frozen schema, each least-privilege. They depend on the schema and write the files the aggregator consumes. Blocks the skill.
**Delivers:** `research-search-worker.md` (haiku), `research-extract-worker.md` (sonnet), `research-verify-voter.md` (sonnet default; Haiku-first is a config affordance, not a separate agent).
**Implements:** Receipt-Rule Fan-Out (each worker returns a one-line receipt under a char cap); the voter's mandated disconfirming search + attack-mode diversification.
**Avoids:** Pitfall 2 (disconfirming search + source-independence in the voter prompt); Pitfall 3 (receipt rule enforced in worker frontmatter, not just orchestrator intent); the extract worker's immutable-excerpt-at-fetch-time `Write` contract (load-bearing for the entire verification differentiator).

### Phase 4: Orchestrator skill + headless scale confirmation (ASSEMBLY)
**Rationale:** Wire the 8 phases; reuse `advisor` at 2 gates; set the `allowed-tools` profile; write the de-shadowing `description`. Depends on all prior steps. THIS is where full-scale headless fan-out + the permission path is confirmed -- the lead empirical unknown.
**Delivers:** `skills/lz-deep-research/SKILL.md` with explicit wave-batching (<=5 in-flight); the packaged-skill A2 re-proof; the scale-concurrency spike at real ceilings.
**Uses:** Skill `allowed-tools` (Profile C + `Agent(lz-advisor:research-*)` worker grants + `Bash(node:*)`); `--permission-mode auto`.
**Implements:** Advisor at Exactly Two Gates; scope clarification elevated to first-class (Phase 0 scope-guard with Assuming-frames headless).
**Avoids:** Pitfall 4 (wave-batching + dedicated scale spike -- acceptance criteria: host stable, wall-clock not linear-serial, spawns batched <=5); Pitfall 5 (packaged-skill permission re-proof); Pitfall 12 (vague headless prompt surfaces Assuming-frames).

### Phase 5: Plugin integration + release (PUBLISH)
**Rationale:** Purely additive, trails a working capability. Follows the proven atomic multi-surface bump procedure.
**Delivers:** discovery wiring; `.lz-research/` gitignore; 6-surface atomic version sync (2.0.0 -> 2.1.0); CHANGELOG `[2.1.0] ### Added`; README (5th-skill row + What's New 2.1.0, current-version-only); `git tag v2.1.0` + GitHub Release (confirm push/publish intent with the user).
**Avoids:** Forgetting the new SKILL.md's `version:` field (6-surface, not 5).

### Verifier-tier gating eval (deferred / post-ship, NOT a launch blocker)
**Rationale:** All-Sonnet ships as the default and is already inside the promised "Sonnet cost" envelope. Haiku-first must EARN its place by proving BOTH ~0 false-uphold AND a real cost win. The gating eval can be scoped into Phase 3 or deferred post-ship.
**Delivers:** A pre-registered eval (>=60-100 claims, BOTH closed- AND open-book, stratified ~40% supported / ~60% bad with ~half the bad SUBTLE, k>=5, Pass@1 + Pass^k, false-uphold rate as the SOLE hard gate, vetted labels for contestable claims). Flips the Haiku-first flag ONLY if open-book false-uphold stays ~0 on the SUBTLE subset AND escalation fraction keeps cost materially below all-Sonnet (kill if >40-50% escalation).
**Avoids:** Pitfall 7 (over-trusting a thin eval -- n=6/n=18 pilots are directional, not a lock).

### Phase Ordering Rationale

- **Bottom-up dependency chain:** aggregator -> schema -> workers -> skill -> release. Each layer is validated before the layer above depends on it; the schema is empirically grounded (not guessed) because the aggregator's behavior is proven first.
- **Provider scope is a prerequisite decision** because it pins the platform floor every later phase assumes (`auto` mode, `WebSearch` availability, alias resolution).
- **The skill comes last among build steps** because full-scale headless concurrency can only be confirmed once real producers exist to dispatch -- this is the #1 named build-time unknown and gets its own scale spike.
- **Release is purely additive** and intentionally trails a working capability.
- **The gating eval is decoupled** from launch: Sonnet-default ships without it, so it never blocks v2.1.0.

### Research Flags

Phases likely needing deeper phase-research / a build spike during planning:
- **Phase 4 (skill / orchestrator) -- HIGHEST.** Full-wave headless concurrency under `--permission-mode auto` is the lead empirical unknown (A2 proved only n=2). Needs a dedicated scale-concurrency spike with the I/O-storm and silent-batching observations as explicit acceptance criteria, plus the packaged-skill permission re-proof.
- **Phase 3 (worker agents) -- MEDIUM.** Open-book voter behavior (disconfirming-search compliance, subtle-overclaim detection, source-independence weighting) is the cost-driving fork. The pre-registered gating eval may be scoped here or deferred post-ship.

Phases with standard / well-de-risked patterns (skip research-phase):
- **Phase 1 (aggregator) -- LOW.** Largely de-risked by spike A1 (PASS); the residual semantic-paraphrase under-merge is a documented caveat, not a blocker.
- **Phase 2 (schema reference) -- LOW.** A contract-writing task.
- **Phase 5 (release) -- LOW.** Follows the proven atomic multi-surface bump procedure.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Every load-bearing fact re-verified against live `code.claude.com/docs` on 2026-06-15 and against locally installed `claude --version` = 2.1.177. The only items below HIGH are version-/provider-sensitive flags (auto-mode, WebSearch on Bedrock/Vertex) and the unreliable `allowed-tools` enforcement (MEDIUM, open issues). Script placement corrected to `skills/lz-deep-research/scripts/` (unanimous re-verification). |
| Features | HIGH | 4 production systems + arXiv 2506.18096 survey + citation-verification/self-consistency literature all triangulate; all 9 table stakes appear in 3+ reference systems AND the survey; all 4 differentiators independently validated. |
| Architecture | HIGH | Grounded in the on-disk v2.0.0 plugin tree + the converged SESSION-DESIGN (3 lineages + 4 spikes). The spine slots cleanly onto the existing layout with no divergence. |
| Pitfalls | HIGH (design-validated) / MEDIUM-HIGH (NEW externally-verified) | Design-validated pitfalls rest on 4 empirical spikes + the 4-family advisor consult. The two `[NEW]` critical pitfalls (I/O storm, reference pollution) rest on a documented case + open issue (#15487) and the citation-hallucination literature (MEDIUM-HIGH). |

**Overall confidence:** HIGH

### Gaps to Address

- **Concurrency ceiling under headless auto-mode** (A2 proved 2 workers; ~5-15+ is unproven, and the platform caps silently at ~10). Handle via the dedicated Phase 4 scale spike with I/O-storm + batching acceptance criteria; bound `MAX_FETCH` and search-wave width by the measured ceiling.
- **Packaged-skill permission path** (A2 was a bare `-p` prompt, not a declared-`allowed-tools` skill). Handle by re-running A2 as the packaged skill as a Phase 4 acceptance gate.
- **Provider scope** (Anthropic API vs Bedrock/Vertex/Foundry). Handle as the Phase 0 prerequisite decision; pin the floor and the graceful-degradation rule before requirements freeze.
- **Exact `allowed-tools` line for the skill** (Profile C + worker grants + `Bash(node:*)` vs auto-mode reliance). Resolve in Phase 4.
- **Scope-tag value a research report emits** (likely `scope: api-correctness`, or a dedicated research value defined in `context-packaging.md`). Roadmap/requirements decision.
- **Scratch-dir lifecycle** (retain `.lz-research/<run-id>/` for the audit trail vs clean post-report). Product decision for the roadmap.
- **Semantic-paraphrase dedup residual** (lexical dedup under-merges beyond number/format variance). Document the lexical limit; phrase confidence as a lower bound; do NOT add an embedding dependency.
- **Advisor contract fit for research artifacts** (the 100-word enumerated, code-task-calibrated contract reading bounded research JSON). LOW risk; do NOT modify `advisor.md` -- adapt the consultation prompt. Confirm in Phase 4.

## Sources

### Primary (HIGH confidence)
- `.planning/research/SESSION-DESIGN.md` -- the converged design (3 model lineages: 6 blind Opus architects + GPT-5.5 + Gemini 3.1 Pro; 4 spikes: A1 deterministic core PASS, A2 headless fan-out PASS, verifier-tier A/B, open-book viability pilot). The authoritative spec this milestone builds on.
- `.planning/research/STACK.md` -- platform capabilities re-verified against live `code.claude.com/docs` (plugins-reference, model-config, permission-modes, headless, tools-reference) on 2026-06-15 + `claude --version` = 2.1.177.
- `.planning/research/ARCHITECTURE.md` -- integration study grounded in the on-disk v2.0.0 plugin tree (advisor.md, context-packaging.md, orient-exploration.md, existing SKILL.md frontmatter, plugin.json).
- `.planning/research/FEATURES.md` -- 4 production deep-research systems + arXiv 2506.18096 survey + CiteCheck/CiteAudit/RARR citation-verification + self-consistency/voting literature.
- `.planning/research/PITFALLS.md` -- design-validated pitfalls (4 spikes + 4-family consult) + externally-verified platform limits.
- `plugins/lz-advisor/` on-disk: `agents/advisor.md`, `references/{context-packaging,orient-exploration,advisor-timing}.md`, existing `skills/*/SKILL.md`, `.claude-plugin/plugin.json`.
- plugin-dev `plugin-structure` + `skill-development` + skill-creator + live plugins-reference -- authoritative for the `bin/` vs `skills/<name>/scripts/` placement correction (UNANIMOUS, 2026-06-15).

### Secondary (MEDIUM-HIGH confidence)
- anthropics/claude-code#15487 (`maxParallelAgents` feature request) -- documented 24-subagent I/O storm (17.3x disk I/O, host lockout); no configurable limit exists (proposed default 5).
- MindStudio "Claude Code Sub-Agents Explained" -- ~10-concurrent cap with silent batching; ~20k-token per-subagent overhead; 3-5 practical sweet spot.
- arXiv 2604.03173 (reference hallucination) + arXiv 2602.23452 (CiteAudit) -- open-book reference-pollution mechanism (web echo of ghost refs).
- Matt Yeung "Deterministic Quoting" -- verbatim-by-construction; "may still quote the wrong part" (quote-presence != claim-support).
- anthropics/claude-code#14956, #37683 -- `allowed-tools` enforcement unreliability (directional).

### Tertiary (LOW confidence / directional)
- The n=6 verifier-tier A/B and n=18 open-book pilot in SESSION-DESIGN s13/s15.2 -- directional single-run signals, explicitly NOT a lock; the pre-registered gating eval supersedes them.

---
*Research completed: 2026-06-15*
*Ready for roadmap: yes*
