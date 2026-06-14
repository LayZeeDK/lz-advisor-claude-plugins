# Stack Research

**Milestone:** v2.1.0 "lz-deep-research skill" -- add a fifth skill `/lz-advisor:lz-deep-research` (decompose -> parallel search -> fetch -> extract -> adversarial-verify -> cited report)
**Domain:** Claude Code native-plugin platform capabilities (zero external deps; skills + agents + references + the plugin's first `bin/` script)
**Researched:** 2026-06-15
**Confidence:** HIGH (every load-bearing fact re-verified against live `code.claude.com/docs` on 2026-06-15 and against the locally installed `claude --version` = 2.1.177)

> **[CORRECTION 2026-06-15 -- script placement]** Where this document places the deterministic off-model aggregator in `bin/`, that is SUPERSEDED. Re-verified against the live plugins-reference + plugin-dev `plugin-structure`/`skill-development` + skill-creator: `bin/` is a real official component, but it is for USER-FACING executables injected onto the Bash PATH (invokable as bare commands). The aggregator is a SKILL-INTERNAL helper, so it belongs in the skill's own bundled `scripts/` dir -- `skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs` -- invoked via `node "${CLAUDE_PLUGIN_ROOT}/skills/lz-deep-research/scripts/..."` (NOT a bare command; no PATH/exec-bit/shebang dependency, Windows-arm64 / Git-Bash safe). Read every `bin/` reference below as `skills/lz-deep-research/scripts/`. SUMMARY.md + REQUIREMENTS.md + ROADMAP.md use the corrected location.

> **Scope note.** This is NOT a library/npm stack. The "stack" for a zero-dep Claude Code plugin IS the set of Claude Code platform capabilities the feature stands on, plus the one runtime (Node.js) the `scripts/` aggregator needs. Every row below is a platform feature `lz-deep-research` depends on, with the version it was introduced/confirmed and WHY the feature needs it. The companion `.planning/research/SESSION-DESIGN.md` is the converged design; this file VALIDATES its platform assumptions against current docs, CONFIRMS them, EXTENDS them where new facts strengthen the design, and FLAGS the handful that are version- or provider-sensitive.

---

## Recommended Stack

### Core Technologies (Claude Code platform capabilities the feature depends on)

| Technology | Version | Purpose | Why Recommended / WHY the feature needs it |
|------------|---------|---------|--------------------------------------------|
| **Plugin component: `skills/<name>/SKILL.md`** | v2.1.x (stable) | The orchestrator. `skills/lz-deep-research/SKILL.md` runs in the main session, triggers by description, spawns subagents, calls `Bash`/`WebSearch`/`WebFetch`/`Write`. | A plugin's only first-class entry point for a multi-step workflow. Skills auto-trigger and support progressive disclosure (load `references/*` on demand). CONFIRMS SESSION-DESIGN section 2. |
| **Plugin component: `agents/*.md` with `model:` override** | v2.1.x (stable) | Worker + voter subagent personas (`research-search-worker` haiku, `research-extract-worker` sonnet, `research-verify-voter` sonnet) plus REUSE of the existing `advisor` (opus) at 2 read-only gates. | The `model:` alias on a plugin agent is the documented mechanism to fan work across tiers (haiku/sonnet/opus) from a single Sonnet session -- the "advisor strategy" applied to research. CONFIRMS SESSION-DESIGN section 4. |
| **Plugin component: `bin/` executables** | v2.1.x (stable, official) | Ship the deterministic off-model aggregator (dedup / rank / vote-tally / quote-vs-stored-excerpt re-check) -- the plugin's first `bin/` component. | **CONFIRMED + STRONGER than SESSION-DESIGN assumed.** Official Plugins reference: `bin/` = "Executables added to the Bash tool's `PATH`. Files here are invokable as **bare commands** in any Bash tool call while the plugin is enabled." So the aggregator is a first-class component, not just a loose script behind `${CLAUDE_PLUGIN_ROOT}`. |
| **Subagent fan-out via the `Agent` tool (alias `Task`)** | `Agent`/`Task` unified v2.1.63; nesting v2.1.172 | Parallel search/extract/verify waves; optional nested "phase-runner" as a SCALE refinement only. | `Agent` and `Task` are aliases of one dispatch. Subagents now nest up to **depth 5** (foreground any depth; a background subagent AT depth 5 loses the `Agent` tool). The spine uses flat fan-out; nesting is optional. CONFIRMS SESSION-DESIGN section 2. |
| **Built-in `WebSearch` tool** | v2.1.x (stable) | Search workers and open-book verify voters query Anthropic's search backend. | Built into Claude Code -- zero external deps. Up to 8 backend searches per call; `allowed_domains` / `blocked_domains` (mutually exclusive). **Provider-sensitive -- see "What NOT to Use" + "Version Compatibility".** |
| **Built-in `WebFetch` tool** | v2.1.x (stable) | Extract workers fetch a source URL and extract falsifiable claims + verbatim quote + stored excerpt. | Built in -- zero deps. In `auto`/`bypassPermissions` the per-domain prompt is **skipped entirely** (the headless path the feature relies on). In default/acceptEdits it prompts once per new domain. Cross-host redirects are returned, not followed -- re-fetch the redirect URL. |
| **`--permission-mode auto` (headless `claude -p`)** | v2.1.83+ | The headless UAT convention and the runtime path that lets workers `Write` to `.lz-research/` and the orchestrator run the one named non-git `Bash` (`bin/`) call without stalling. | A separate classifier model gates each action instead of prompting. Spike A2 PROVED parallel `Write` + a non-git `node` Bash run pass under `auto` headless. **Version- AND provider-gated -- see caveats.** CONFIRMS SESSION-DESIGN section 13 (A2). |
| **Skill `allowed-tools` frontmatter** | v2.1.x (stable; enforcement caveat) | Declares the new skill's tool surface: `Agent(lz-advisor:advisor)`, `Agent(lz-advisor:research-*)`, `Read`, `Glob`, `Write`, `WebSearch`, `WebFetch`, `Bash(git:*)`, and the one named `bin/` / `Bash(node:*)` invocation. | Pre-approves the tool set so the skill runs with minimal prompting. NOTE: `allowed-tools` enforcement is currently unreliable (open issues #14956 / #37683) -- treat it as intent/pre-approval and rely on the `auto`-mode classifier + per-agent least-privilege `tools` as the actual gate. |
| **Node.js runtime (for `bin/`)** | Node 18+ ESM, no packages | Executes the aggregator (pure functions, filesystem-only, zero npm deps). | The aggregator must be deterministic and off-model. Node ESM is the project's standing scripting choice; `.mjs` with only Node built-ins keeps the **zero external dependency** constraint intact. No `npm install`, no `node_modules`. |

### Supporting Capabilities

| Capability | Version | Purpose | When to Use |
|------------|---------|---------|-------------|
| **`references/lz-deep-research-schema.md`** | n/a (Markdown) | Progressive-disclosure reference: JSON schemas (source/claim/vote/excerpt), tally rubric, quote-recheck contract. | Load on demand from the skill body. Keeps SKILL.md lean; honors the "no cross-skill body references" rule (shared knowledge lives in `references/*`, not in another skill). |
| **Plugin agent frontmatter `effort:`** | v2.1.x (officially supported on plugin agents) | The existing `advisor` keeps `effort: high`; new workers set `effort` per role. | CONFIRMED supported in plugin-agent frontmatter (the official Plugins-reference example literally shows `effort: medium`). A stale community claim that per-agent `effort` is "only a feature request" is WRONG for plugin agents. |
| **Plugin agent frontmatter `maxTurns`, `tools`, `disallowedTools`** | v2.1.x (stable) | Bound worker cost (`maxTurns`), grant least-privilege `tools`, forbid spawning where undesired (`disallowedTools: Agent`). | Workers get only what they need (search worker: `WebSearch`, `Write`). Omit `Agent` from worker `tools` to keep fan-out flat unless nesting is explicitly wanted. |
| **`${CLAUDE_PLUGIN_ROOT}` / `${CLAUDE_PLUGIN_DATA}`** | v2.1.x (stable) | Portable path references; the `node ...mjs` invocation form of the aggregator uses `${CLAUDE_PLUGIN_ROOT}`. | `CLAUDE_PLUGIN_ROOT` = immutable installed files (read-only); `CLAUDE_PLUGIN_DATA` = mutable state across updates. The `.lz-research/<run-id>/` blackboard belongs in the user's CWD (run artifacts), NOT in the plugin root. |
| **Model aliases (`opus`/`sonnet`/`haiku`)** | v2.1.x (stable) | Auto-resolve to current generation: `opus`->Opus 4.8, `sonnet`->Sonnet 4.6, `haiku`->latest Haiku (Anthropic API). | Use the alias, never a pinned model name, so the plugin tracks the current generation (matches the existing advisor's `opus` alias). **Provider caveat -- see Version Compatibility.** |

### Development / Verification Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **Headless `claude -p ... --permission-mode auto --output-format stream-json`** | Behavioral UAT of the packaged skill (fan out, write to disk, run `bin/`, consult advisor at the 2 gates, emit a cited report). | Project convention (CLAUDE.md). Reference the run task by PROSE PATH, never an `@file` mention (breaks slash-command recognition). Use `auto`, NOT `acceptEdits` (acceptEdits DENIES the skill launch and blocks non-git Bash). |
| **`plugin-dev` plugin (installed)** | Validate plugin structure, agent/skill frontmatter, `bin/` placement at plugin root. | Authoritative for component discovery + the validation checklist. |
| **`skill-creator` plugin (installed)** | Eval framework for the skill's description-trigger optimization + a behavioral fixture. | Authoritative for skill methodology. The milestone's validation fixture is the deterministic-core + headless-fan-out proof. |
| **Subagent JSONL session logs** (`~/.claude/projects/<cwd-hash>/<session>/subagents/agent-<id>.jsonl`) | Observe worker tool-use (WebSearch/WebFetch counts, votes) that does NOT surface in the parent stream-json. | Worker/advisor tool-use is hidden from the parent trace; grade fan-out + web-tool usage from the per-subagent JSONL (memory: web tool usage must be observable). |

## Installation

```bash
# ZERO external dependencies. Nothing to npm-install.
# The plugin is plain Markdown/YAML + one Node ESM script in bin/.
# The only runtime requirement is Node.js (already present for Claude Code itself).

# Recommended (portable) invocation -- no executable-bit / shebang risk on Windows arm64:
#   from the skill body, run:  node "${CLAUDE_PLUGIN_ROOT}/bin/lz-deep-research.mjs" <args>
#   and declare Bash(node:*) (or a narrower Bash(node */bin/lz-deep-research.mjs*)) in allowed-tools.

# Alternative (documented bare-command idiom) -- bin/ files are PATH-injected:
#   ship bin/lz-deep-research (extensionless, '#!/usr/bin/env node' shebang) + chmod +x
#   then call it as a bare command: lz-deep-research <args>
```

> **Build decision to settle in roadmap:** `bin/` files are invokable as **bare commands** (PATH-injected). Choose (a) `bin/lz-deep-research` extensionless + shebang for the clean bare-command form, or (b) `bin/lz-deep-research.mjs` invoked via `node "${CLAUDE_PLUGIN_ROOT}/bin/..."`. **Recommend (b)** for Windows-arm64 / Git-Bash portability and zero shebang/exec-bit ambiguity, matching the project's `.mjs` scripting convention. Spike A2 proved a `node`-invoked script under `auto`; the bare-command form on Windows is NOT yet empirically proven for this plugin (see flag 4 below).

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| **Skill + agents + `bin/` (native components)** | Dynamic Workflow (`workflows/`) | NEVER for a plugin. A plugin CANNOT ship a `workflows/` directory -- dynamic workflows live only in user/project `.claude/workflows/`, and `ultracode` (which orchestrates them) is a session-only setting a plugin cannot set. A Sonnet session caps at `effort: high` and cannot reach `xhigh`/`ultracode`. CONFIRMS SESSION-DESIGN section 2. |
| **Flat subagent fan-out** | Nested subagents (depth up to 5) | Use nesting ONLY as a scale refinement (a "phase-runner" subagent splitting one wave further) when corpus size makes flat fan-out from main unwieldy. Not the spine. Beware ~7x token cost per branch. |
| **Reuse the existing `advisor` (opus) at 2 gates** | A new Opus research-specialist agent | Don't add a 4th Opus specialist -- honors the "too many specialists" warning and the single-advisor-persona decision. Reuse is the design's deliberate roster choice. |
| **Immutable per-worker files + explicit merge step** | Shared appendable JSONL ledger | NEVER. A shared append-only ledger written by many parallel subagents is a Windows/Git-Bash race-condition magnet (partial writes, dup ids) -- effectively reinventing the workflow engine we avoid. SESSION-DESIGN section 7 correction. |
| **`--permission-mode auto`** | `acceptEdits` / `--dangerously-skip-permissions` | `acceptEdits` DENIES the skill launch and blocks non-git Bash (verified). `--dangerously-skip-permissions` works but `auto` is classifier-gated and sufficient. Use bypass only in a throwaway container if `auto` is unavailable on the provider. |

## What NOT to Use (the explicit "do NOT add" list)

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **Any external/npm dependency** | Breaks the load-bearing zero-dependency constraint; adds install/supply-chain surface. The `bin/` aggregator must use Node built-ins only. | Pure Node ESM (`fs`, `path`, `crypto`) -- no `package.json` deps. |
| **MCP servers (`.mcp.json` / `mcpServers`)** | Out of scope by constraint; adds an external service + a per-server approval gate; plugin-shipped agents cannot even declare `mcpServers` (platform-forbidden for security). | Built-in `WebSearch`/`WebFetch` + the `Agent` tool. |
| **A plugin `workflows/` directory / any Workflow-tool dependency** | Not a valid plugin component surface; dynamic workflows are user/project-only; `ultracode` is session-only; Sonnet caps at `high`. | Self-contained skill orchestration. |
| **Agent teams (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`)** | Experimental; requires a flag a plugin cannot set/detect; ~7x token cost; headless-incompatible (tmux/iTerm2) -- breaks the `claude -p` UAT convention. | Subagent fan-out via `Agent`. |
| **Hooks (`hooks/`) for orchestration** | Out of scope for the plugin (cost/noise, global scope); plugin-shipped AGENTS cannot declare `hooks` at all (platform-forbidden). | Skill-driven orchestration only. |
| **A shared appendable JSONL blackboard ledger** | Parallel-append race conditions on Windows/Git-Bash; reintroduces the engine we avoid. | Immutable per-worker files + one deterministic off-model merge. |
| **Pinned model names in agent frontmatter** | A pinned `claude-opus-4-8` drifts as generations advance; the alias auto-tracks. | `model: opus` / `sonnet` / `haiku` aliases. |
| **Relying on `allowed-tools` to RESTRICT tools** | Enforcement is currently unreliable (issues #14956, #37683) -- parsed but may not actually gate. | Treat `allowed-tools` as pre-approval/intent; rely on `auto`-mode classifier + per-agent least-privilege `tools`. |
| **Writing run artifacts into `${CLAUDE_PLUGIN_ROOT}`** | The plugin root is immutable and replaced on update; writes there are lost/blocked. | Write `.lz-research/<run-id>/` under the user's CWD (or `${CLAUDE_PLUGIN_DATA}` if cross-run persistence is ever wanted -- not needed for v1). |
| **`fable`/`mythos` worker or advisor tiers** | Fable 5 + Mythos 5 are GLOBALLY suspended by a US export-control directive (2026-06-12); subagent-Fable was already API-blocked. | `opus`/`sonnet`/`haiku` only. |

## Stack Patterns by Variant

**If on the Anthropic first-party API (the assumed/primary target):**
- Use everything above as-is. `auto` mode, `WebSearch`, and the model aliases (`opus`->4.8, `sonnet`->4.6, `haiku`) all resolve and work. This is the configuration the existing plugin ships against and the milestone targets.

**If the user runs Claude Code on Amazon Bedrock:**
- **`WebSearch` is HIDDEN entirely** (Bedrock does not expose the server-side search tool) -- search workers and open-book voters lose their primary tool. The skill MUST degrade gracefully (mark search unavailable, continue) per the existing Common-Contract Rule 6, or the feature is effectively unsupported there.
- **`auto` mode is OFF by default** and requires Opus 4.7/4.8 + `CLAUDE_CODE_ENABLE_AUTO_MODE`; `sonnet`->Sonnet 4.5 and `opus`->Opus 4.6 on Bedrock.
- **Roadmap flag:** decide whether Bedrock/Vertex/Foundry are in scope. If yes, graceful degradation is a hard requirement, not a nicety.

**If on Google Cloud Vertex AI:**
- `WebSearch` works only with Claude 4 models (Opus/Sonnet/Haiku). `auto` mode requires Opus 4.7/4.8 + `CLAUDE_CODE_ENABLE_AUTO_MODE`.

**If verifier-tier flips to Haiku-first (PROVISIONAL):**
- Keep ALL-SONNET voters as the active default; Haiku-first behind a config flag, locked only by the pre-registered open-book gating eval (SESSION-DESIGN sections 15 / 15.1 / 15.2). No platform change -- purely the `model:` value on `research-verify-voter` plus escalation routing.

## Version Compatibility

| Capability | Confirmed against | Notes |
|------------|-------------------|-------|
| Locally installed Claude Code | `claude --version` = **2.1.177** | Matches SESSION-DESIGN's pin exactly; all facts below verified on/against this line. |
| `bin/` executables component | Plugins reference (live, 2026-06-15) | "Executables added to the Bash tool's `PATH` ... invokable as bare commands." First-class, current. |
| Plugin agent frontmatter fields | Plugins reference (live) | Supports `name, description, model, effort, maxTurns, tools, disallowedTools, skills, memory, background, isolation`. **`hooks`, `mcpServers`, `permissionMode` are FORBIDDEN for plugin agents.** |
| Subagent nesting (depth 5) | Live docs + v2.1.172 changelog | Foreground any depth; background subagent at depth 5 loses `Agent`. Cap is fixed/non-configurable. |
| `Agent` == `Task` tool | v2.1.63 | Aliases of the same dispatch. |
| `--permission-mode auto` | v2.1.83+ | Anthropic API (default) or Opus 4.6+/Sonnet 4.6; on Bedrock/Vertex/Foundry only Opus 4.7/4.8 and OFF by default; Team/Enterprise admins can disable via `permissions.disableAutoMode`. **Verify availability per user before relying on it.** |
| `effort` ladder | model-config (live) | Sonnet 4.6 + Opus 4.6 cap at `high` (NO `xhigh`); Opus 4.8/4.7 + Fable 5 support `xhigh`/`max`. Unsupported levels fall back to the highest supported at-or-below. |
| Model alias resolution | model-config (live) | Anthropic API: `opus`->4.8, `sonnet`->4.6. **Bedrock: `opus`->4.6, `sonnet`->4.5. Vertex/Foundry vary.** Aliases track the provider's recommended generation. |
| `WebSearch` provider availability | tools-reference (live) | Anthropic API + Foundry: available. Vertex: Claude 4 models only. **Bedrock: NOT exposed; Claude Code hides the tool.** |
| `WebFetch` permission behavior | tools-reference (live) | `auto`/`bypassPermissions`: no prompt. default/acceptEdits: prompts once per new domain (preapproved doc-domain allowlist exempt). |

## Notes That Re-Confirm / Extend / Flag SESSION-DESIGN

**Re-confirmed (no change needed):**
- Section 2: plugin-can't-ship-workflows, agent-teams-rejected, Sonnet-caps-at-`high`, subagents-nest-depth-5, `Agent`==`Task` -- all VERIFIED current on v2.1.177.
- Section 13 / A2: headless `auto`-mode `Write` + non-git `Bash` fan-out -- consistent with live `auto`-mode docs ("Everything, with background safety checks"; v2.1.83+).
- Section 4: model-tier roster (haiku/sonnet/opus aliases) -- aliases resolve as designed on the Anthropic API.

**Extends SESSION-DESIGN (new platform facts that strengthen the design):**
- `bin/` is an OFFICIAL first-class component whose files are invokable as **bare commands** on the Bash PATH. SESSION-DESIGN treated `bin/lz-research.mjs` as "the plugin's first `bin/` component" invoked via `node`; the bare-command idiom is the documented form. Both work; recommend the `node ${CLAUDE_PLUGIN_ROOT}/bin/...mjs` form for portability.
- Plugin agents officially support `effort:` in frontmatter (the existing advisor's `effort: high` is valid; the "feature request only" web claim is wrong for plugin agents).
- Platform SECURITY guardrails reinforce the zero-dep posture: plugin-shipped agents cannot declare `hooks`, `mcpServers`, or `permissionMode` at all -- the constraint is enforced, not just a project rule.

**Flag for re-verification / roadmap attention (version- or provider-sensitive):**
1. **`auto` mode is provider- and version-gated** (v2.1.83+; OFF by default on Bedrock/Vertex/Foundry; admin-disable-able on Team/Enterprise). The entire headless permission path (spike A2) assumes `auto`. If a target user lacks `auto`, the skill needs pre-approved `allowedTools` rules or a documented fallback. **Verify before treating A2 as universal.**
2. **`WebSearch` is hidden on Bedrock and Claude-4-only on Vertex.** SESSION-DESIGN assumes WebSearch is universally available to workers/voters; it is NOT on every provider. Decide provider scope; require graceful degradation if Bedrock/Vertex are in scope.
3. **`allowed-tools` enforcement is currently unreliable** (open issues). The design must not depend on it to RESTRICT -- use per-agent `tools` least-privilege + `auto`-mode classifier as the real gate. SESSION-DESIGN already leans on auto-mode, so this is a clarification, not a contradiction.
4. **`bin/` bare-command + executable-bit behavior on Windows arm64 / Git Bash** is the one path not yet empirically proven for THIS plugin (A2 proved a `node`-invoked script, not a PATH-injected bare `bin/` command). Prefer the `node "${CLAUDE_PLUGIN_ROOT}/bin/...mjs"` invocation, or add a build-time spike confirming the bare form on Windows.

## Sources

- `code.claude.com/docs/en/plugins-reference` (live, 2026-06-15) -- `bin/` executables component ("invokable as bare commands"), plugin agent frontmatter fields + the `hooks`/`mcpServers`/`permissionMode` prohibition, monitors v2.1.105, component locations. HIGH.
- `code.claude.com/docs/en/model-config` (live, 2026-06-15) -- effort ladder per model (Sonnet 4.6 caps at `high`), `ultracode` = `xhigh` + dynamic-workflow orchestration (session-only), model alias resolution + provider differences. HIGH.
- `code.claude.com/docs/en/permission-modes` (live, 2026-06-15) -- `auto` mode ("Everything, with background safety checks"), v2.1.83+ requirement, provider/admin gating, classifier behavior. HIGH.
- `code.claude.com/docs/en/headless` (live, 2026-06-15) -- `claude -p`, `--permission-mode acceptEdits` vs `auto`, `--bare`, `--allowedTools` prefix matching. HIGH.
- `code.claude.com/docs/en/tools-reference` (via search, 2026-06-15) -- `WebSearch` (8 backend searches/call; Bedrock-hidden; Vertex Claude-4-only) + `WebFetch` (per-domain prompt; auto/bypass skip; redirect handling). MEDIUM-HIGH (search-surfaced doc content; core claims corroborated by the API web-fetch/web-search docs).
- `github.com/anthropics/claude-code` issues #14956, #37683 -- `allowed-tools` enforcement unreliability. MEDIUM (open issues; directional).
- Subagent nesting depth-5 / v2.1.172; `Agent`==`Task` v2.1.63 -- `code.claude.com/docs/en/sub-agents` + changelog corroboration. HIGH.
- Local: `claude --version` = 2.1.177; existing `plugins/lz-advisor/` skills (`allowed-tools` lines), `advisor.md` frontmatter, `plugin.json` -- integration grounding. HIGH.
- `.planning/research/SESSION-DESIGN.md` -- converged design under validation. (This file confirms/extends it; flags noted above.)

---
*Stack research for: Claude Code native-plugin platform capabilities for `lz-deep-research`*
*Researched: 2026-06-15*
