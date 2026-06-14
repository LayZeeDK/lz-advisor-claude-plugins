# Architecture Research

**Domain:** Claude Code marketplace-plugin skill -- integrating a new deep-research capability (`lz-deep-research`) into the existing lz-advisor plugin (milestone v2.1.0)
**Researched:** 2026-06-15
**Confidence:** HIGH (grounded in the on-disk plugin tree + the converged SESSION-DESIGN.md: 3 model lineages + 4 empirical spikes)

> **[CORRECTION 2026-06-15 -- script placement]** Where this document places the deterministic off-model aggregator in `bin/`, that is SUPERSEDED. Re-verified against the live plugins-reference + plugin-dev `plugin-structure`/`skill-development` + skill-creator: `bin/` is a real official component, but it is for USER-FACING executables injected onto the Bash PATH (invokable as bare commands). The aggregator is a SKILL-INTERNAL helper, so it belongs in the skill's own bundled `scripts/` dir -- `skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs` -- invoked via `node "${CLAUDE_PLUGIN_ROOT}/skills/lz-deep-research/scripts/..."` (NOT a bare command; no PATH/exec-bit/shebang dependency, Windows-arm64 / Git-Bash safe). Read every `bin/` reference below as `skills/lz-deep-research/scripts/`. SUMMARY.md + REQUIREMENTS.md + ROADMAP.md use the corrected location.

This file answers ONE question: how does `lz-deep-research` integrate with the existing lz-advisor plugin architecture? It is BUILD-ON analysis -- SESSION-DESIGN.md already converged the internal spine (file-blackboard + deterministic `scripts/` aggregator + advisor at 2 gates + Sonnet-default voters). Here I confirm that spine slots cleanly into the shipped v2.0.0 plugin, make new-vs-reused components explicit, trace the data flow, and give a dependency-ordered build sequence. Divergences from SESSION-DESIGN are flagged and justified; none are introduced without strong cause.

## Scope

This is a SUBSEQUENT-milestone integration study, not a fresh ecosystem map. The shipped v2.0.0 architecture (3 Opus agents: advisor/reviewer/security-reviewer; 4 `lz-`-prefixed skills; 4 shared references with the pv-*/verify_request/scope-verdict discipline; 5-surface version sync; zero deps) is FIXED. This file answers: how does the NEW fifth skill and its support cast graft onto that layout cleanly, what is NEW vs REUSED vs MODIFIED, and in what dependency order is it buildable. Only the new feature is in scope -- `reviewer.md`, `security-reviewer.md`, and the four existing skills are untouched.

## Standard Architecture

### System Overview

```
+---------------------------------------------------------------------+
|  ENTRY: /lz-advisor:lz-deep-research  (skill, runs in main session) |
|  Model: session model (Sonnet). Role: thin dispatcher.              |
|  Holds ONLY: run manifest (paths/ids/counts), bounded summaries,    |
|  2 advisor notes. NEVER holds: raw source text, raw votes.          |
+--------------------------------+------------------------------------+
                                 |
        +------------------------+------------------------+-----------------+
        | spawns (Agent tool)    | runs (Bash)            | consults (Agent)|
        v                        v                        v                 |
+----------------------+  +----------------------+  +-----------------------+
|  WORKER SUBAGENTS    |  |  bin/ NODE SCRIPT    |  |  advisor  (REUSED)    |
|  (NEW, cheap tier)   |  |  (NEW, off-model)    |  |  agent  model: opus   |
|  - search-worker     |  |  lz-deep-research    |  |  tools [Read, Glob]   |
|    haiku WebSearch   |  |  .mjs  (zero tokens) |  |  Gate 1: scope/rank   |
|  - extract-worker    |  |  merge/dedup/rank/   |  |  Gate 2: synthesis    |
|    sonnet WebFetch   |  |  tally/quote-recheck |  |  read-only judge      |
|  - verify-voter      |  |                      |  +-----------------------+
|    sonnet WebSearch  |  +----------+-----------+
|  each WRITEs a file  |             |
|  returns 1-line ACK  |             | reads many files, returns tiny summary
+----------+-----------+             |
           |                         |
           v                         v
+---------------------------------------------------------------------+
|  STATE ON DISK:  .lz-research/<run-id>/   (NEW, gitignored scratch)  |
|  immutable per-worker files: <wave>/<worker-id>.json                 |
|  stored excerpts (addressed by excerpt_id) | merged/ranked artifacts |
|  votes/  | survivors.json (bounded) | <report>.md (deliverable)      |
+---------------------------------------------------------------------+

REUSED knowledge surfaces (references/, progressive disclosure):
  context-packaging.md  -> pv-* schema, verify_request schema, scope-verdict
  orient-exploration.md -> Class 1-4 / 2-S question taxonomy (per-angle ranking)
  advisor-timing.md     -> "advise at high-leverage moments" rationale
```

### Component Responsibilities

| Component | New / Reused | Responsibility | Implementation |
|-----------|--------------|----------------|----------------|
| `skills/lz-deep-research/SKILL.md` | **NEW** | Orchestrator: scope-guard, decompose, dispatch worker waves, run `bin/`, consult advisor at 2 gates, assemble cited report | Markdown + YAML frontmatter, ~8-phase workflow, extended `allowed-tools` profile (see Integration Points) |
| `agents/advisor.md` | **REUSED, unchanged** | Gate 1 (scope/ranking framing), Gate 2 (synthesis/calibration). Read-only Opus judge; never fetches/writes | Existing `model: opus`, `tools: [Read, Glob]`, `maxTurns: 3`, `effort: high`. The 100-word enumerated contract + Assuming-frame + Hedge-Marker discipline all apply unchanged |
| `agents/research-search-worker.md` | **NEW** | Per-angle web search; writes candidate sources to disk; returns count receipt | `model: haiku`, `tools: [WebSearch, Write]` |
| `agents/research-extract-worker.md` | **NEW** | Per-source fetch + extract falsifiable claims (claim + verbatim quote + stored excerpt + source meta); returns count | `model: sonnet`, `tools: [WebFetch, Write]` |
| `agents/research-verify-voter.md` | **NEW** | One isolated skeptic vote per (claim x seat); writes verdict + cited counter-evidence; returns receipt | `model: sonnet` (default; Haiku-first PROVISIONAL behind flag), `tools: [WebSearch, WebFetch, Write]` |
| `bin/lz-deep-research.mjs` | **NEW (plugin's first `bin/`)** | Off-model: merge per-worker files, dedup (URL-canonical + number-word-normalized shingle/Jaccard), rank/cap, tally votes (rubric), re-check quotes vs stored excerpts, emit bounded summaries | Node ESM, zero deps, pure functions, reproducible |
| `references/lz-deep-research-schema.md` | **NEW** | JSON schemas (source/claim/vote/excerpt), tally rubric, quote-recheck contract, named ceilings | Markdown, progressive-disclosure reference |
| `references/context-packaging.md` | **REUSED** | pv-* synthesis discipline (5b), Hedge propagation (5c), `<verify_request>` schema, Scope-Disambiguated Provenance Markers | Existing file; the new skill cites it the same way the other 4 skills do |
| `references/orient-exploration.md` | **REUSED** | Class 1-4 + 2-S question taxonomy -- maps each decomposed angle to a search/fetch strategy | Existing file; reused per-angle inside the search/extract waves |
| `references/advisor-timing.md` | **REUSED** | The "advise at high-leverage moments, not per-tool-call" rationale justifying exactly 2 Opus gates | Existing file |

Roster delta vs v2.0.0: **+1 skill, +3 cheap-tier worker agents, +1 `bin/` script, +1 reference, +1 gitignored scratch dir.** Reuse the `advisor` agent and the three knowledge references. No new Opus specialist (honors the SESSION-DESIGN "too many specialists" warning and the v1.0 "single advisor, multiple skills" decision). `reviewer.md` and `security-reviewer.md` are untouched -- not in scope.

## Recommended Project Structure

```
plugins/lz-advisor/
|-- .claude-plugin/
|   '-- plugin.json                          # MODIFIED: 2.0.0 -> 2.1.0; optional: add research keywords
|-- agents/
|   |-- advisor.md                           # REUSED (byte-unchanged)
|   |-- reviewer.md                          # untouched (out of scope)
|   |-- security-reviewer.md                 # untouched (out of scope)
|   |-- research-search-worker.md            # NEW: haiku, [WebSearch, Write]
|   |-- research-extract-worker.md           # NEW: sonnet, [WebFetch, Write]
|   '-- research-verify-voter.md             # NEW: sonnet, [WebSearch, WebFetch, Write]
|-- bin/                                      # NEW directory (plugin's first bin/)
|   '-- lz-deep-research.mjs                 # NEW: deterministic off-model aggregator
|-- skills/
|   |-- lz-plan/SKILL.md                     # untouched
|   |-- lz-execute/SKILL.md                  # untouched
|   |-- lz-review/SKILL.md                   # untouched
|   |-- lz-security-review/SKILL.md          # untouched
|   '-- lz-deep-research/SKILL.md            # NEW: orchestrator skill
|-- references/
|   |-- advisor-timing.md                    # REUSED
|   |-- context-packaging.md                 # REUSED (pv-*/verify_request/scope-verdict)
|   |-- orient-exploration.md                # REUSED (Class 1-4/2-S taxonomy)
|   |-- verify-target-selection.md           # untouched
|   '-- lz-deep-research-schema.md           # NEW: JSON schemas + rubric + quote-recheck contract
|-- README.md                                # MODIFIED: add 5th skill + What's New 2.1.0
'-- LICENSE                                  # untouched

tests/
'-- <research validation fixture>            # NEW: validates the bin/ aggregator (quote-recheck,
                                             #      dedup, tally) on representative data -- the
                                             #      "currently non-existent" fixture SESSION-DESIGN s14 flags

.lz-research/<run-id>/                        # NEW: runtime scratch (MUST be gitignored)
|-- search/<worker-id>.json                  # immutable per-search-worker candidate sources
|-- excerpts/<excerpt-id>.txt                # immutable stored fetched excerpts
|-- extract/<worker-id>.json                 # immutable per-extract-worker claims
|-- votes/<claim-id>-<seat>.json             # immutable per-voter votes
|-- merged.json | ranked.json                # bin/ outputs (deterministic)
|-- survivors.json                           # bounded top-N, quote-rechecked
'-- <report-slug>.md                         # the cited deliverable
```

### Structure Rationale

- **`bin/` is a first-class plugin component surface** (SESSION-DESIGN s2, verified against Claude Code v2.1.177: the component surface is `skills/ commands/ agents/ hooks/ .mcp.json .lsp.json output-styles/ themes/ monitors/ bin/`). This is the plugin's first `bin/` entry but it is a supported native location -- no precedent risk. Invoke it via `Bash(node:*)` against an absolute `${CLAUDE_PLUGIN_ROOT}/bin/lz-deep-research.mjs` path.
- **New agents live alongside existing agents at `agents/*.md`** -- the same flat discovery surface used today. Worker names are `research-`-prefixed so they group distinctly from the advisor/reviewer/security-reviewer triad and resolve as `lz-advisor:research-search-worker` etc.
- **New reference lives at `references/`** alongside the four existing references, matching the established progressive-disclosure convention (the SKILL.md `@${CLAUDE_PLUGIN_ROOT}/references/...` mention pattern). This honors the memory rule `feedback_no_cross_skill_body_references` -- shared knowledge goes in `references/*.md`, never inlined cross-skill.
- **`.lz-research/<run-id>/` is runtime scratch, not a tracked component.** It MUST be added to `.gitignore`. It is the file-blackboard; immutability + per-worker addressing (one file per worker, written once) is the load-bearing race-avoidance property (SESSION-DESIGN s7: NO shared appendable JSONL ledger -- that is a Windows/Git-Bash race magnet).
- **The validation fixture lives in `tests/`** (the established home for the budget smoke fixtures `D-reviewer-budget.sh` etc.). SESSION-DESIGN s14 explicitly notes the fixture is currently non-existent and must be authored as part of the build; PROJECT.md lists it as a target feature.

## Architectural Patterns

### Pattern 1: Receipt-Rule Fan-Out (bounded main context)

**What:** Worker subagents do all the verbose work in their OWN isolated context, WRITE results to immutable disk files, and return only a one-line receipt (`<ack path=... n=N/>`). The main orchestrator never ingests raw pages, raw claims, or raw votes.
**When to use:** Any time corpus volume would otherwise blow the orchestrator's context window. This is THE mechanism that makes deep research feasible on a Sonnet session.
**Trade-offs:** (+) Main-context growth is ~O(workers x receipt) + bounded summaries -- independent of corpus size (SESSION-DESIGN s3/s6, spike A2 proven). (-) Requires disk I/O and a permission path for worker `Write` (resolved: A2 proved `--permission-mode auto` permits worker Write + one named non-git Bash).

**Example:**
```
// worker returns ONLY this to the orchestrator:
<ack path=".lz-research/run-7/extract/w3.json" n=6/>
// the 6 extracted claims + quotes + excerpt-ids live in the file, never in main context
```

### Pattern 2: Off-Model Deterministic Reduction

**What:** All dedup / ranking / vote-tally / quote-recheck run in `bin/lz-deep-research.mjs` -- pure functions, reproducible, auditable, ZERO model tokens. Between waves the orchestrator does NO in-context reasoning over raw data; it shells the script which returns only tallies.
**When to use:** Any aggregation step that is mechanizable. Reserve model tokens (especially Opus) for non-mechanizable judgment only.
**Trade-offs:** (+) Cheap, deterministic, testable in a fixture. (+) Removes the "self-anchor" risk -- the script can verifiably re-check quote-vs-excerpt consistency. (-) Lexical dedup under-merges semantic paraphrase beyond number/format variance (spike A1 caveat: "30%" vs "thirty percent" needed a number-word normalization step; deeper paraphrase still under-merges -- do not over-claim corroboration).

**Example:**
```js
// off-model: re-check every surviving claim's quote against its stored excerpt
const survivors = claims.filter(c =>
  storedExcerpt(c.excerpt_id).includes(normalize(c.quote))
); // fabricated/drifted quotes deterministically dropped (spike A1 PASS)
```

### Pattern 3: Advisor at Exactly Two High-Leverage Gates (the advisor strategy, applied)

**What:** The existing Opus `advisor` agent is consulted READ-ONLY at exactly two bounded gates: Gate 1 (decompose -> review angles/framing + later the ranked claim cut-line) and Gate 2 (synthesis/calibration over `survivors.json` only). Opus never fetches, never writes, never sees raw corpus.
**When to use:** This IS the lz-advisor core value applied to research -- frontier reasoning lands only where judgment is non-mechanizable; cheap tiers do the volume.
**Trade-offs:** (+) Opus spend is FLAT as the corpus scales (2 fixed-size calls over bounded files) -- cost scales with cheap-tier worker volume, not the expensive tier (SESSION-DESIGN s9). (+) Reuses the proven agent verbatim -- no new Opus persona to tune. (-) The advisor's 100-word enumerated contract is calibrated for code tasks; verify it reads bounded research artifacts cleanly (low risk -- input is bounded JSON, exactly the "trust packaged content" shape the agent is built for; see Open Question on the Assuming-frame fit).

**Example:**
```
Gate 1 prompt to advisor: bounded -- ~5 drafted angles + ranked top-24 slice.
Gate 2 prompt to advisor: bounded -- survivors.json only (top ~20, verbatim evidence).
Both fit the agent's Context Trust Contract: answer from packaged content, do not re-locate on disk.
```

### Pattern 4: Evidence-Artifact-Centric Verification (verifiable consistency, not provenance)

**What:** Trust comes from a deterministic quote-vs-stored-excerpt re-check (Pattern 2), NOT from claiming a tool was called. Extract workers store the fetched excerpt immutably; each claim carries its `excerpt_id`; the `bin/` script mechanically re-checks the verbatim quote appears in the stored excerpt; the final report cites ONLY claims whose quotes re-check. This is the SESSION-DESIGN s8 GPT-red-team correction: "self-anchor rejection enforced in code" was overclaimed; reframe from un-verifiable provenance to verifiable consistency.
**When to use:** As the primary anti-hallucination guard -- the vote count is a secondary signal that can share blind spots.
**Trade-offs:** (+) Catches fabricated/drifted quotes deterministically (spike A1 proven). (+) Runs UPSTREAM of all voting, removing the content-absent class at zero model risk (SESSION-DESIGN s15.1). (-) Cannot verify reasoning overreach (scope/causation/magnitude) -- that is what the isolated-voter tier is for.

## Data Flow

### Request Flow (the 8-phase orchestration, mapped to disk + model tiers)

```
[User: /lz-advisor:lz-deep-research <question>]
    |
P0  Scope guard ---------------------> create .lz-research/<run-id>/
    | (interactive: ask 2-3 Qs; headless -p: proceed w/ surfaced Assuming-frames)
    v
P1  Decompose + GATE 1 (Opus advisor) -> ~5 angles, bounded review (read-only)
    v
P2  Search wave (Haiku) -------------> ~5 search-workers WRITE search/<id>.json, return counts
    v
P3  Fetch+Extract wave (Sonnet) -----> extract-workers WRITE excerpts/<id>.txt (immutable)
    |                                   + extract/<id>.json (claim+quote+excerpt_id+meta), return counts
    v
P4  Dedup+Rank (bin/, off-model) ----> merge per-worker files -> ranked.json (cap top ~24)
    v
P5  GATE 1b (Opus advisor, optional) -> may RE-ORDER/TRIM top-24 (may NOT expand corpus)
    v
P6  Verify wave (Sonnet, isolated) --> 3 isolated voters/claim, attack-mode diversified,
    |                                   WRITE votes/<claim>-<seat>.json, return receipts
    v
P7  Tally + quote re-check (bin/) ----> rubric tally + mechanical quote-vs-excerpt re-check
    |                                   -> survivors.json (bounded, top ~20, verbatim evidence only)
    v
P8  Synthesize + GATE 2 (Opus) -------> advisor reads ONLY survivors.json; Sonnet writes
                                        cited report (per-claim confidence + contested/unverified section)
    |
    v
[Deliverable: .lz-research/<run-id>/<report-slug>.md]
```

### State Management (file-blackboard)

```
Immutable per-worker WRITE (one file per worker, written once -- NO shared append)
    |
    v (deterministic merge step reads ALL per-worker files)
bin/lz-deep-research.mjs  --(tiny summary only)-->  main orchestrator context
    |
    v
Opus advisor reads ONLY bounded files (angle slice; top-24; survivors.json)
```

### Key Data Flows

1. **Receipt flow (context-bounding):** worker -> disk file -> one-line ack -> orchestrator. Raw evidence NEVER transits the main context. This is the spike-A2-proven property that keeps the skill runnable on a Sonnet session.
2. **Evidence-consistency flow (anti-hallucination):** fetched page -> stored excerpt (immutable, excerpt_id) -> claim carries excerpt_id -> `bin/` re-checks quote in excerpt -> only re-checked claims cited. Deterministic, off-model, spike-A1 proven.
3. **Escalation flow (verification hardening):** quote-recheck drop (upstream, zero model risk) -> Tier-1 cheap vote -> Sonnet escalation on ANY contested claim PLUS load-bearing claims PLUS a ~15-20% random audit slice of unanimous upholds (SESSION-DESIGN s15.1: the audit slice is STRUCTURALLY REQUIRED because a silent false-uphold is by definition unanimous and the contested-split trigger cannot catch it).
4. **Scope-verdict flow (reuse):** the report's final verdict carries a `**Verdict axis:** scope: <value>` marker per the reused `context-packaging.md` Scope-Disambiguated Provenance Markers section -- so a deep-research report cannot be mistaken for a security or perf clearance. Likely `scope: api-correctness` for technical research, or a research-appropriate value the roadmap defines.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Small run (~5 angles, ~15 sources, ~24 claims) | The named-ceiling defaults (`ANGLES~5`, `MAX_FETCH=15`, `MAX_VERIFY_CLAIMS~24`, `VOTES_PER_CLAIM=3`, `SYNTH_CAP~20`). Spike A2 proved 2-worker fan-out + non-git Bash headless; this scale is the build-time target. |
| Medium run (more sources/claims) | Raise ceilings via config; main context stays bounded by the receipt rule regardless. Concurrency at ~5-15 parallel workers is UNPROVEN (A2 tested 2) -- this is the lead build-time empirical unknown. |
| Large run | Optional `phase-runner` nested subagent (subagents can nest since v2.1.172, foreground any depth) as a SCALE REFINEMENT, not the spine. Defer until concurrency limits are measured. |

### Scaling Priorities

1. **First bottleneck: headless concurrency at scale.** A2 proved 2 parallel workers under `claude -p --permission-mode auto`; ~5-15 concurrent is unproven. The build's first empirical gate is to confirm the skill fans out the full wave headlessly without classifier stalls. Mitigation already designed: confine ALL Writes to worker-agent frontmatter so the main session's only non-git Bash is the single named `bin/` call.
2. **Second bottleneck: semantic-paraphrase under-merge in dedup.** Lexical Jaccard + number-word normalization handles near-duplicates and number/format variance (spike A1); deeper paraphrase under-merges, inflating apparent source diversity. Mitigation: treat lexical dedup as "good for near-duplicates, moderate for paraphrase"; the report's confidence calibration must not over-claim cross-source corroboration.

## Anti-Patterns

### Anti-Pattern 1: Shared appendable JSONL ledger written by parallel workers

**What people do:** Have all parallel subagents append evidence to one shared JSONL file.
**Why it's wrong:** On Windows / Git-Bash this is a race-condition magnet (partial writes, dup ids, collisions) and is effectively "the workflow engine we said we don't have" (SESSION-DESIGN s7, GPT-red-team correction).
**Do this instead:** Immutable per-worker output files (`<wave>/<worker-id>.json`), written once, plus an explicit deterministic merge step in `bin/`. No parallel append to shared files.

### Anti-Pattern 2: Claiming code can verify a tool was actually called

**What people do:** Assert that the aggregator enforces "self-anchor rejection" -- i.e., proves a voter genuinely searched.
**Why it's wrong:** A script can verify a vote CITES a source, not that a tool was CALLED with that result (SESSION-DESIGN s8). Overclaiming this creates false assurance.
**Do this instead:** Verify CONSISTENCY (quote appears in stored excerpt), not provenance. Reframe the trust mechanism around the deterministic quote-recheck; treat the 3 same-family votes as a signal, not a proof, and bias toward under-claiming (Contested is a first-class outcome).

### Anti-Pattern 3: Extending worker tool grants to "just let the agent verify"

**What people do:** Give a worker or the advisor broad tool access to self-serve.
**Why it's wrong:** Violates least-privilege (the v1.0 `[Read, Glob]` advisor decision; the `<verify_request>` schema rationale cites OWASP AI Agent Security, arXiv 2601.11893, Claude Code Issue #20264 on subagent privilege escalation).
**Do this instead:** Keep the advisor at `[Read, Glob]` (reused unchanged). Each worker gets exactly the minimal grant for its job (search-worker: `[WebSearch, Write]`; extract-worker: `[WebFetch, Write]`; voter: `[WebSearch, WebFetch, Write]`). The orchestrator holds the broader profile and acts on workers' behalf -- the same gateway pattern the existing `verify_request` hook uses.

### Anti-Pattern 4: A third Opus gate to break a noisy vote tally

**What people do:** Add an Opus call to adjudicate split votes.
**Why it's wrong:** A 3rd gate "launders noisy votes into authority" (SESSION-DESIGN s10) -- it dresses an unreliable signal as a frontier verdict and inflates Opus spend.
**Do this instead:** Exactly 2 Opus gates (scope/ranking + synthesis). Split tallies surface as Contested in the report; escalation to Sonnet (not Opus) recovers recall on contested/load-bearing claims.

### Anti-Pattern 5: Flipping the voter tier to Haiku-first on thin evidence

**What people do:** Treat the n=6 A/B (and the n=18 open-book pilot) as settling the voter tier toward Haiku-first to cut cost.
**Why it's wrong:** Both are directional, single-run, small-n; the over-refutation flipped tiers between runs (label fuzziness, not a stable signal). A Haiku false-uphold is a SILENT, uncatchable failure; the value prop is "near-Opus at SONNET cost," so all-Sonnet voters are already inside the promised budget (SESSION-DESIGN s15/s15.1).
**Do this instead:** Sonnet-default voters ship; Haiku-first stays PROVISIONAL behind a config flag, locked ONLY by a pre-registered open-book gating eval (>=60-100 claims, ~half the bad ones SUBTLE, k>=5, false-uphold rate as the SOLE hard gate). The escalation ARCHITECTURE is FINAL regardless of Tier-1 model.

## Integration Points

### External Services / Native Tools

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| WebSearch (Claude Code native tool) | Granted to search-worker + voter agents | Already used by all 4 existing skills (D-11 ladder); no new dependency. The fetch fallback chain (markdown.new -> WebFetch -> ...) is an executor-runtime concern, not a plugin-shipped dependency |
| WebFetch (Claude Code native tool) | Granted to extract-worker + voter agents | Same as above. Fetched content is untrusted source material per reused Rule 5a (`<fetched ... trust="untrusted">`) |
| Node.js (off-model `bin/` runtime) | `Bash(node:*)` from the skill | Zero npm deps (honors the plugin's zero-dependency constraint). Invoked as ONE named non-git Bash call per wave-boundary; A2 proved auto-mode permits this |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| skill (orchestrator) <-> worker subagents | `Agent` tool spawn -> worker WRITEs file -> one-line ack | Receipt rule. Worker `Write` confined to worker frontmatter so the orchestrator's only non-git Bash is the `bin/` call |
| skill <-> `bin/lz-deep-research.mjs` | `Bash(node:*)` invocation -> JSON files in, tiny summary out | Off-model boundary; the script reads many files, returns bounded summary |
| skill <-> advisor agent | `Agent(lz-advisor:advisor)` -> bounded prompt -> 100-word enumerated SD | REUSED. Package per the reused `context-packaging.md` Proposal/Verification templates; Gate 1 ~ Proposal, Gate 2 ~ Verification |
| skill <-> references | `@${CLAUDE_PLUGIN_ROOT}/references/*.md` progressive-disclosure mentions | REUSED pattern; the new schema reference joins the four existing ones |
| skill `allowed-tools` <-> Claude Code permission classifier | Frontmatter declares the extended profile | NEW profile = D-11 Profile C (execute-like) + `Agent(lz-advisor:research-*)` worker grants + `Bash(node:*)` (or rely on `--permission-mode auto`). This is the lead packaging unknown SESSION-DESIGN A2 flagged: "the skill likely needs `Write` + `Bash(node:*)` in `allowed-tools`, or to rely on auto mode" |

### Version / Release Surface (MODIFIED)

The atomic 5-surface bump is the established release ritual. v2.1.0 is an additive MINOR (new skill, backward-compatible):

| Surface | 2.0.0 -> 2.1.0 |
|---------|----------------|
| `.claude-plugin/plugin.json` `version` | `2.1.0` |
| `skills/lz-plan/SKILL.md` `version:` | `2.1.0` |
| `skills/lz-execute/SKILL.md` `version:` | `2.1.0` |
| `skills/lz-review/SKILL.md` `version:` | `2.1.0` |
| `skills/lz-security-review/SKILL.md` `version:` | `2.1.0` |
| `skills/lz-deep-research/SKILL.md` `version:` | `2.1.0` (NEW skill ships at the milestone version) |

Plus the release-publication surfaces (AFTER the version bump): CHANGELOG `[2.1.0]` with `### Added` (the deep-research skill + 3 workers + `bin/` aggregator); README (5th-skill table row + What's New 2.1.0 -- per the `release_readme_current_version_only` memory, the stable What's New shows the current version); `git tag v2.1.0` + GitHub Release (confirm push/publish intent with the user; prior milestones deferred tag push).

### What SESSION-DESIGN already specifies vs what the roadmap must still decide

**Already specified (do NOT re-litigate without strong cause):**
- The spine (file-blackboard + off-model `bin/` + advisor at 2 gates) -- 3 lineages + spikes A1/A2 PASS.
- Component roster (skill + 3 workers + 1 `bin/` + 1 reference; reuse advisor) -- SESSION-DESIGN s4.
- The 8-phase sequence and named ceilings -- SESSION-DESIGN s5/s6.
- Immutable per-worker files, NO shared JSONL append -- s7.
- Evidence-artifact-centric verification (quote-recheck) -- s8.
- Sonnet-default voters; Haiku-first PROVISIONAL behind a pre-registered eval -- s15/s15.1/s15.2.
- The escalation trigger set (contested + load-bearing + audit-sample of unanimous upholds) -- s15.1.

**Roadmap must still decide:**
- The exact `allowed-tools` line for the skill (Profile C + Agent worker grants + `Bash(node:*)` vs auto-mode reliance) -- A2 left this as a build-time confirm.
- The scope-tag value(s) a research report emits (likely `api-correctness`, but research may warrant a dedicated value defined in `context-packaging.md`).
- The shape + assertions of the NEW validation fixture (quote-recheck, dedup, tally) -- s14 says author it as part of the work.
- Phase decomposition + which phases need deeper phase-research (see flags below).
- Whether/when to run the pre-registered Haiku-first gating eval (can be a deferred post-ship item; Sonnet-default ships without it).
- Concurrency-at-scale confirmation (A2 tested 2 workers; full-wave headless fan-out is the lead empirical gate).
- The skill `description` trigger phrases (it must de-shadow the built-in `/deep-research`; third-person + concrete triggers per the skill-creator discipline already used by the 4 skills).

## Suggested Build Order (dependency-ordered)

Dependencies run bottom-up: the deterministic core is the foundation everything feeds; the skill is the last assembly step. This ordering lets each layer be validated before the layer above depends on it.

1. **`bin/lz-deep-research.mjs` + its validation fixture (FOUNDATION).** Build the off-model aggregator FIRST (merge/dedup/rank/tally/quote-recheck) and its `tests/` fixture. It has zero dependencies on the agents or skill and is the most testable, highest-risk-of-subtle-bug component. Spike A1's `aggregate-spike.mjs` is the proven prototype to harden into the shipped script. Validates: quote-recheck drops fabricated quotes; immutable-files merge + dedup + tally produce bounded `survivors.json`; number-word normalization merges format variance. **Blocks everything downstream that consumes its output contract.**
2. **`references/lz-deep-research-schema.md` (CONTRACT).** Pin the JSON schemas (source/claim/vote/excerpt), the tally rubric, the quote-recheck contract, and the named ceilings. The `bin/` script and all three worker agents must agree on these shapes, so freeze them right after the aggregator's behavior is proven. **Blocks the worker agents (they emit to this schema).**
3. **The three worker agents (PRODUCERS).** Author `research-search-worker.md`, `research-extract-worker.md`, `research-verify-voter.md` against the frozen schema, each least-privilege. They depend on the schema (step 2) and write the files the aggregator (step 1) consumes. Voter ships Sonnet-default; the Haiku-first flag is a config affordance, not a separate agent. **Blocks the skill (it spawns them).**
4. **`skills/lz-deep-research/SKILL.md` (ORCHESTRATOR / ASSEMBLY).** Wire the 8 phases: scope-guard, decompose + Gate 1, search wave, extract wave, `bin/` dedup/rank, Gate 1b, verify wave, `bin/` tally + quote-recheck, synthesize + Gate 2. Reuse `advisor` at the 2 gates; cite the reused references; set the `allowed-tools` profile; write the de-shadowing `description`. Depends on ALL prior steps. **This is where the A2 headless-fan-out + permission path is confirmed at full scale.**
5. **Plugin integration + release (PUBLISH).** Add `bin/` and the new components to discovery; gitignore `.lz-research/`; bump 2.0.0 -> 2.1.0 atomically across the 6 version surfaces (5 existing + the new SKILL.md); CHANGELOG `[2.1.0]`; README (5th skill + What's New); tag + GitHub Release. Depends on a working skill (step 4).

**Ordering rationale:** Each step's output is the next step's input contract. Building the aggregator first means the schema is empirically grounded (not guessed) before agents commit to it; freezing the schema before the agents prevents drift; building agents before the skill means the skill's fan-out has real producers to dispatch; the skill is the only place full-scale headless concurrency can be confirmed, so it comes last among the build steps. Release is purely additive and trails a working capability.

**Phase-research flags for the roadmap:**
- **Highest:** the skill phase (step 4) -- full-wave headless concurrency under `--permission-mode auto` is the lead empirical unknown (A2 only proved 2 workers). Likely needs deeper phase-research / a build spike.
- **Medium:** the worker-agent phase (step 3) -- open-book voter behavior (Haiku tool-orchestration; subtle-overclaim detection) is the cost-driving fork; the pre-registered gating eval may be scoped here or deferred post-ship.
- **Low:** the aggregator (step 1) is largely de-risked by spike A1; the reference (step 2) is a contract-writing task; release (step 5) follows the proven atomic 5-surface bump procedure.

## Consistency check vs SESSION-DESIGN

This integration analysis CONFIRMS the SESSION-DESIGN component/phase shape rather than diverging from it. The component roster (s4), the 8-phase sequence (s5), the file-blackboard with immutable per-worker files (s7), the evidence-artifact-centric verification (s8), the 2-gate Opus reuse, and the Sonnet-default/Haiku-PROVISIONAL voter decision (s15.x) all map cleanly onto the existing v2.0.0 plugin layout (flat `agents/`, `references/` progressive disclosure, `skills/<name>/SKILL.md`, atomic multi-surface version sync, zero-dep constraint). Two integration facts were not spelled out in SESSION-DESIGN and are surfaced here for the roadmap: (1) the version bump is a 6-surface atomic sync (the new SKILL.md adds a `version:` field to the existing 5); (2) `.lz-research/` must be gitignored as runtime scratch. Neither contradicts the design; both are mechanical integration requirements.

## Open Questions (for phase-specific research)

- **Advisor contract fit for research artifacts.** The reused advisor's output contract (100-word enumerated steps, code-task-calibrated Assuming-frame, Hedge-Marker discipline) was tuned for coding consultations. Reading bounded research JSON (angle slices, `survivors.json`) is well inside its "trust packaged content" design, but the enumerated-action output shape may need a slightly different consultation framing at Gate 1/Gate 2. LOW risk; confirm during the skill phase. Do NOT modify `advisor.md` -- adapt the consultation prompt instead (the same way the 4 existing skills adapt framing without editing the agent).
- **Scratch-dir lifecycle.** Whether `.lz-research/<run-id>/` is retained (auditable evidence trail) or cleaned post-report is a product decision the roadmap should make; retention aids the cited-report audit story but accumulates disk.
- **Concurrency ceiling.** The realistic parallel-worker count under headless auto-mode (A2 proved 2) bounds `MAX_FETCH` and the search-wave width; a build spike settles it.

## Sources

- `.planning/research/SESSION-DESIGN.md` (this repo) -- converged design: 3 model lineages (6 blind Opus architects + GPT-5.5 + Gemini 3.1 Pro) + 4 spikes (A1 deterministic core PASS, A2 headless fan-out PASS, verifier-tier A/B, open-book viability pilot). HIGH confidence.
- `.planning/PROJECT.md` (this repo) -- milestone v2.1.0 goal, constraints (zero-dep, reuse advisor, additive MINOR), key decisions. HIGH confidence.
- `plugins/lz-advisor/agents/advisor.md` -- the reused Opus advisor agent: `model: opus`, `tools: [Read, Glob]`, `maxTurns: 3`, `effort: high`, 100-word enumerated contract, Assuming-frame, Hedge-Marker discipline. HIGH (on-disk).
- `plugins/lz-advisor/references/context-packaging.md` -- the reused pv-* synthesis discipline (5b), Hedge propagation (5c), `<verify_request>` schema, Scope-Disambiguated Provenance Markers. HIGH (on-disk).
- `plugins/lz-advisor/references/orient-exploration.md` -- the reused Class 1-4 + 2-S question taxonomy. HIGH (on-disk).
- `plugins/lz-advisor/skills/lz-plan/SKILL.md`, `skills/lz-execute/SKILL.md` -- the SKILL.md frontmatter pattern, `allowed-tools` profile ladder (D-11), multi-phase orchestration shape, reference-mention progressive disclosure, `**Verdict axis:** scope:` output marker. HIGH (on-disk).
- `plugins/lz-advisor/.claude-plugin/plugin.json` -- current manifest (version 2.0.0) to bump. HIGH (on-disk).

---
*Architecture research for: lz-deep-research integration into the lz-advisor Claude Code plugin (milestone v2.1.0)*
*Researched: 2026-06-15*
