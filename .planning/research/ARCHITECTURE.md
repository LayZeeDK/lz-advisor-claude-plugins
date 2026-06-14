# Architecture Research

**Domain:** Claude Code marketplace plugin -- integrating the `lz-` skill rename + on-demand Fable model selection into the existing lz-advisor component layout (milestone v2.0.0)
**Researched:** 2026-06-13
**Confidence:** HIGH (Agent-tool model-override mechanics + Fable specs confirmed against official docs; rename surfaces enumerated against the live tree)

## Scope

This is a SUBSEQUENT-milestone integration study, not a fresh ecosystem map. The shipped v1.0.1 architecture (3 agents, 4 skills, 4 shared references, 5-surface version sync) is FIXED. This file answers: how do the four v2.0.0 changes graft onto that layout cleanly, what is NEW vs MODIFIED, and in what order are the phases buildable.

## Standard Architecture (current, fixed)

```
+-------------------------------------------------------------------+
|  ENTRY: Skills (skills/<name>/SKILL.md)                           |
|  +----------+ +-----------+ +----------+ +-------------------+     |
|  | plan     | | execute   | | review   | | security-review   |    |
|  +----+-----+ +-----+-----+ +----+-----+ +---------+---------+    |
|       | @-load references           |  Agent(...) invocation       |
+-------|-----------------------------|----------------------------+
        v                             v
+-----------------------------+  +-------------------------------+
|  SHARED: references/*.md     |  |  AGENTS: agents/*.md          |
|  - advisor-timing.md         |  |  +---------+ (model: opus)    |
|  - context-packaging.md      |  |  | advisor | <- plan,execute  |
|  - orient-exploration.md     |  |  +---------+                  |
|  - verify-target-selection.md|  |  | reviewer| <- review        |
|  [NEW: model-selection.md]   |  |  | sec-rev | <- security-rev   |
+-----------------------------+  +-------------------------------+
        ^                             ^
        | progressive disclosure      | one-per-role, model: opus default
        +--- "no cross-skill body references" convention ----------+

+-------------------------------------------------------------------+
|  IDENTITY/RELEASE: .claude-plugin/plugin.json (version)           |
|  + 4 x SKILL.md `version:` = 5-surface atomic bump                |
|  marketplace.json (root) references PLUGIN name only -- untouched |
+-------------------------------------------------------------------+
```

### Component Responsibilities (changes only)

| Component | v1.0.1 state | v2.0.0 change | New/Modified |
|-----------|--------------|---------------|--------------|
| `skills/<name>/` dirs | `plan`/`execute`/`review`/`security-review` | `git mv` -> `lz-plan`/`lz-execute`/`lz-review`/`lz-security-review` | MODIFIED (moved) |
| SKILL.md `name:` frontmatter | `plan` etc. | `lz-plan` etc. (must match new dir; dir name drives the slash command) | MODIFIED |
| SKILL.md body | orient/consult/produce | `@`-load new `model-selection.md`; consult phase resolves+logs model | MODIFIED |
| `references/model-selection.md` | absent | arg-interpretation + Opus default + observability logic, DRY across all 4 | NEW |
| `agents/{advisor,reviewer,security-reviewer}.md` | `model: opus` | UNCHANGED frontmatter; one-per-role, Opus stays the safe default | UNCHANGED |
| `.claude/lz-advisor.local.md` | absent | optional persistent default-model plugin-setting (already gitignored) | NEW (optional) |
| `plugin.json` `version` | `1.0.1` | `2.0.0` | MODIFIED |
| 4 SKILL.md `version:` | `1.0.1` | `2.0.0` | MODIFIED |
| `CHANGELOG.md` | `[1.0.1]` top | `[2.0.0]` entry + rename migration table + compare link | MODIFIED |
| `README.md` | bare `/plan` etc. | `/lz-plan` etc. + What's New 2.0.0 | MODIFIED |
| `marketplace.json` (root) | plugin name only | UNCHANGED (no skill names) | UNCHANGED |

## Integration Point 1: Skill rename mechanics

### Mechanism

The skill **directory name drives the slash command** (confirmed Phase 9 decision + Conventions block). Renaming `skills/plan/` -> `skills/lz-plan/` changes the bare command to `/lz-plan` and the qualified form to `lz-advisor:lz-plan`. The `name:` frontmatter MUST be updated in lockstep to match the new directory (plugin-dev convention keeps dir and `name:` in sync). Use `git mv` per the global Git rule (history-preserving; atomically stages source-delete + dest-add).

```bash
git mv plugins/lz-advisor/skills/plan            plugins/lz-advisor/skills/lz-plan
git mv plugins/lz-advisor/skills/execute         plugins/lz-advisor/skills/lz-execute
git mv plugins/lz-advisor/skills/review          plugins/lz-advisor/skills/lz-review
git mv plugins/lz-advisor/skills/security-review plugins/lz-advisor/skills/lz-security-review
```

### Marketplace / cache implication

Renamed skills are NEW identifiers to Claude Code's plugin cache. On the next `/plugin marketplace update` (or fresh install), `/plan` etc. disappear and `/lz-plan` etc. appear -- this IS the intended BREAKING change and the entire motivation (the old bare `/plan`/`/review`/`/security-review` silently shadowed Claude Code built-ins). `marketplace.json` and `plugin.json` `name` are unchanged, so the marketplace entry and install command (`/plugin install lz-advisor@...`) stay identical; only the in-session command names change. No cache migration is needed -- this is exactly why it ships as a MAJOR bump with a migration table.

### Lockstep reference-update checklist (the project has been bitten by partial renames -- Phase 9)

Two reference CLASSES exist; treat them differently.

**A. Operational / invocation surfaces -- MUST change (skill identity + wiring):**

1. The 4 skill directories (`git mv`, above).
2. The 4 SKILL.md `name:` fields (`plan`->`lz-plan`, `execute`->`lz-execute`, `review`->`lz-review`, `security-review`->`lz-security-review`). Locate: `git grep -nE "^name: (plan|execute|review|security-review)$" plugins/lz-advisor/skills/*/SKILL.md`.
3. `agents/*` `allowed-tools: Agent(lz-advisor:advisor|reviewer|security-reviewer)` lines reference AGENT names, NOT skill names. Agents are NOT renamed -> do NOT touch these for the rename. (They ARE edited under Integration Point 2 for the model override.)

**B. Documentation / prose surfaces -- change for ACCURACY (user-facing invocation references):**

4. `plugins/lz-advisor/README.md`: Skills table rows (lines ~17-20), "How it works" prose (lines ~11, ~48), and the current-state What's New 1.0.0/1.0.1 spans (lines ~81, ~95-96) -- swap the bare `/plan` etc. invocation tokens to `/lz-plan` etc. (README is current-state, not a historical changelog, so update in place.)
5. `CHANGELOG.md`: do NOT rewrite the historical `[1.0.0]`/`[1.0.1]` entries -- they accurately record what shipped under the OLD names (lines 8-58 contain `/plan` etc. as history). The NEW `[2.0.0]` entry carries the rename migration table.
6. `CLAUDE.md` (project): the directory-structure comment block (lines ~52-58, `qualified: lz-advisor:plan` -> `lz-advisor:lz-plan` etc.) AND the Conventions `claude -p` examples (lines ~187, ~194-195, ~209, ~212, ~215: `/lz-advisor:plan`/`:execute` -> `/lz-advisor:lz-plan`/`:lz-execute`), including the "fully-qualified skill name is `<plugin>:<skill>`" gotcha example.
7. `.planning/PROJECT.md` (+ the STACK section embedded in CLAUDE.md): update current-state skill-name mentions; leave the frozen `Evolution` log entries as accurate history.

**C. Surfaces that LOOK relevant but are NOT operational (verify, then leave):**

8. `evals/lz-advisor/*.json`: the eval queries are NATURAL-LANGUAGE trigger phrases ("plan the implementation...", "review the authentication changes...") -- they test description-triggering, not slash-command names. They do NOT need to change for the rename. The eval JSON FILENAMES (`lz-advisor-plan-eval.json`) are descriptive labels, optional to rename for tidiness (cosmetic, not load-bearing).
9. `tests/D-reviewer-budget.sh` + `tests/D-security-reviewer-budget.sh`: reference AGENT files by path (`plugins/lz-advisor/agents/reviewer.md`), not skill names -- UNCHANGED by the rename. (`tests/validate-phase-0{3,4}.sh` use `git grep` content assertions; verify they don't pin skill dir paths.)
10. `references/*.md` body prose mentioning `/plan`, `/review`, `/security-review` (orient-exploration.md worked examples ~149-152; context-packaging.md surface lists ~54-58): these describe the cross-skill handoff CHAIN as a concept. Update where a token denotes a user invocation; abstract "review file" / "plan file" artifact mentions are fine as-is. Low-risk, but include in the sweep so a future grep doesn't surface stale tokens.

**Verification gate after the sweep:** `git grep -nE "/(plan|execute|review|security-review)\b" plugins/ README.md CLAUDE.md` returns ONLY intentional CHANGELOG-history hits; no stale current-state invocation token survives. (Same grep discipline that closed Phase 9.)

## Integration Point 2: Shared model-selection reference (NEW)

### Decision: shared reference file, NOT inlined per skill

Inlining the arg-interpretation + default + observability logic in each of the 4 SKILL.md bodies would violate the project's load-bearing **"no cross-skill body references -- extract shared knowledge to references/*.md"** convention (memory `feedback_no_cross_skill_body_references`, validated 0.14.2 with verify-target-selection.md). The existing 4 references are the precedent: shared contract lives in ONE file, `@`-loaded by progressive disclosure. `references/model-selection.md` is the fifth member of that set. NEW file; the 4 SKILL.md bodies are MODIFIED to add one `@`-load line + a one-line consult-phase pointer.

### Cleanest shape for `references/model-selection.md`

Hold, in one place:

1. **Argument interpretation** -- map `--model fable` / natural-language "Fable" / "use Fable" in the skill invocation to the model token. Use the `fable` alias (resolves to the recommended Fable version, updates over time) by default, or `claude-fable-5` if pinning is desired. Anything else -> default path.
2. **Default rule** -- absent any Fable request, the resolved model is `opus`: the skill passes NO override and lets the agent frontmatter `model: opus` (resolution priority 3) apply. Optional: read `.claude/lz-advisor.local.md` for a persistent default BEFORE falling back to Opus.
3. **Override emission** -- when Fable is requested, the skill passes a per-invocation `model: fable` parameter on the `Agent(...)` call. This lands at resolution **priority 2**, beating frontmatter `model: opus` at priority 3 -- exactly the milestone's stated precedence.
4. **Observability** -- the skill logs the resolved model in user-visible output before the consult (e.g. a `Advisor model: <resolved>` line), so the choice is auditable in `stream-json` traces (matches the project's "web tool usage must be observable" empirical-gate style; the resolved model also appears in the subagent JSONL).
5. **Graceful fallback** -- Fable's safety classifier can decline (`stop_reason: refusal`, returned as HTTP 200), and subscription access suspends 2026-06-23 (credits-only after). On refusal or unavailability, degrade to the Opus default and note it. Never halt, never broken. Flag security-review as Fable's weakest fit (the classifier is most likely to refuse security content).

Each SKILL.md gains ONE `@${CLAUDE_PLUGIN_ROOT}/references/model-selection.md` load line (next to the existing advisor-timing / context-packaging loads) and a short consult-phase pointer ("resolve the advisor model per model-selection.md, log it, then invoke"). No logic is duplicated across skills.

### Why this is feasible (was the central risk -- now CONFIRMED HIGH)

The official "Create custom subagents" doc (current, 2026-06) lists `fable` as a first-class value of the `model` frontmatter field AND documents the exact 4-level resolution order the milestone assumes:

```
1. CLAUDE_CODE_SUBAGENT_MODEL env var (highest -- can override the plugin's Fable choice; DOCUMENT it)
2. per-invocation model parameter on the Agent(...) call   <- the skill's Fable override
3. subagent definition's model frontmatter (model: opus)   <- the safe default
4. main conversation's model
```

Field spec verbatim: `model` accepts `sonnet`, `opus`, `haiku`, `fable`, a full model ID (e.g. `claude-opus-4-8` / `claude-fable-5`), or `inherit`. This SUPERSEDES the older "hardcoded to [sonnet,opus,haiku]" GitHub issues (#34821 closed not-planned, #44385 closed duplicate) -- those described a Feb-Apr 2026 limitation; the shipped docs now explicitly accept `fable` and full IDs in both frontmatter and the per-invocation parameter. The Task tool was renamed Agent in 2.1.63 (`Task(...)` still aliases) -- which is why the current spelling is `allowed-tools: Agent(...)`. Fable 5 requires Claude Code v2.1.170+.

## Integration Point 3: Agent layer (UNCHANGED, confirmed)

Single agent per role is retained -- NO per-model duplication. There is no `advisor-fable.md`. The 3 agent files keep `model: opus` frontmatter as the priority-3 safe default; the per-invocation override (priority 2) is what selects Fable on demand. This is architecturally correct: duplicating agents per model would re-introduce the maintenance divergence the 3-agent design avoids, and the resolution order makes duplication unnecessary. The `effort` / `maxTurns: 3` / `tools: [Read, Glob]` fields and the per-role output contracts are untouched by this milestone.

Two caveats to surface for the roadmap (not architecture changes):
- Fable's `effort` parameter is the only thinking control (adaptive thinking always on; raw chain-of-thought never returned). The agents' existing `effort: high|medium` settings remain valid.
- Fable costs 2x Opus ($10/$50 per Mtok) -- the strategic-consultation cost discipline (2-3 calls/task) matters more when Fable is selected; the model-selection reference should say so.

## Integration Point 4: Version / release surface

The atomic 5-surface bump is the established release ritual. v2.0.0 is a MAJOR bump (BREAKING rename):

| Surface | 1.0.1 -> 2.0.0 |
|---------|----------------|
| `plugin.json` `version` | `2.0.0` |
| `skills/lz-plan/SKILL.md` `version:` | `2.0.0` |
| `skills/lz-execute/SKILL.md` `version:` | `2.0.0` |
| `skills/lz-review/SKILL.md` `version:` | `2.0.0` |
| `skills/lz-security-review/SKILL.md` `version:` | `2.0.0` |

Plus the release-publication surfaces (sequenced AFTER the 5-surface bump):

- `CHANGELOG.md`: new `[2.0.0] - <date>` entry with `### Changed (BREAKING)` (rename migration table: `/plan`->`/lz-plan`, `/execute`->`/lz-execute`, `/review`->`/lz-review`, `/security-review`->`/lz-security-review`) and `### Added` (on-demand Fable advisor + `CLAUDE_CODE_SUBAGENT_MODEL` note). Add the `[2.0.0]: .../compare/v1.0.1...v2.0.0` link; keep `[1.0.1]`/`[1.0.0]` verbatim.
- `README.md` "What's New": prepend `### 2.0.0`. Per the project's "release README: current version only" convention, a MAJOR release is the point to COLLAPSE What's New to just 2.0.0 (self-contained), dropping the 1.0.0/1.0.1 prerelease detail. Update the Skills table to `/lz-plan` etc. and the Requirements/How-it-works prose.
- `git tag v2.0.0` + GitHub Release. NOTE: prior milestones did NOT push the tag (marketplace publication deferred). Confirm push/publish intent with the user; once publishing, the `version_numbers_not_load_bearing_prerelease` memory no longer applies and SemVer rigor binds.

## Data Flow (resolved-model selection)

```
user invokes /lz-plan [--model fable | "use Fable"] <task>
    |
    v
SKILL.md orient phase (unchanged) --@load--> references/model-selection.md
    |
    v  resolve model:
    |    Fable requested? --yes--> token = fable (or claude-fable-5)
    |                      --no--> .claude/lz-advisor.local.md default? --else--> opus (no override)
    |
    v  log "Advisor model: <resolved>"   (observable in stream-json + subagent JSONL)
    |
    v  Agent(lz-advisor:advisor, model=<override-if-fable>) consult
    |        priority-2 override beats frontmatter model: opus (priority 3)
    |        (CLAUDE_CODE_SUBAGENT_MODEL priority 1 can still override -- documented)
    v
  advisor returns Strategic Direction --> produce phase (unchanged)
    |
    on Fable refusal (stop_reason: refusal) / unavailable --> fall back to opus default, note it, never halt
```

## Suggested build order (dependency-respecting)

The two features (rename + Fable) are largely independent, but the rename moves every SKILL.md and the Fable feature edits those same bodies. Doing the rename FIRST avoids editing soon-to-move files twice and keeps each phase's diff clean and bisectable.

1. **Phase R -- Skill rename (BREAKING, self-contained).** `git mv` the 4 dirs; update the 4 `name:` fields; run the full lockstep sweep (classes A + B + C); pass the verification grep gate. No behavior change yet. Self-contained so the rename is bisectable and the migration table writes itself.
2. **Phase M -- Shared model-selection reference (NEW, before skill edits).** Author `references/model-selection.md` (arg-interpretation + Opus default + observability + Fable fallback + `CLAUDE_CODE_SUBAGENT_MODEL` priority-1 note). Build the shared contract BEFORE wiring skills to it -- mirrors how verify-target-selection.md was extracted before both skills referenced it.
3. **Phase F -- Skill wiring + optional local-setting.** Add the `@`-load line + consult-phase resolve-then-invoke pointer to all 4 (now `lz-`-prefixed) SKILL.md bodies. Optionally wire `.claude/lz-advisor.local.md` persistent default. Agents stay UNCHANGED (confirm `model: opus` default; no new agent files). Verify observability via headless `claude -p`: the `Advisor model:` log line in stdout + the resolved model in the subagent JSONL trace; spot-check the Fable override actually reaches the agent (priority 2 > 3) and the Opus default path when no override is passed.
4. **Phase V/Rel -- Version + release.** Atomic 5-surface 1.0.1 -> 2.0.0; CHANGELOG `[2.0.0]` + migration table; README What's New collapse + Skills-table rename; tag `v2.0.0` + GitHub Release (confirm push/publish intent).

Rationale for order: R before F (don't edit files about to move); M before F (the shared reference must exist before skills `@`-load it); release last (version bump is meaningless until feature + rename land). R and M have no mutual dependency and could parallelize, but R-first lets M author against the final `lz-`-named paths.

## Anti-Patterns (milestone-specific)

### Anti-Pattern 1: Duplicating agents per model
**What:** add `advisor-fable.md` alongside `advisor.md`.
**Why wrong:** re-introduces the maintenance divergence the 3-agent design eliminated; the priority-2 per-invocation override makes it unnecessary.
**Instead:** one agent per role, `model: opus` default, skill passes the Fable override.

### Anti-Pattern 2: Inlining model-selection logic in each SKILL.md
**What:** paste arg-interpretation + default + logging into all 4 skills.
**Why wrong:** violates "no cross-skill body references / extract to references"; 4x drift surface.
**Instead:** one `references/model-selection.md`, `@`-loaded by all 4.

### Anti-Pattern 3: Partial rename sweep
**What:** `git mv` the dirs, fix `name:`, ship -- miss README / CLAUDE.md / references prose.
**Why wrong:** the project was bitten before (Phase 9 needed a full operational+doc sweep); stale `/plan` tokens mislead users and break the headless `claude -p` examples in Conventions.
**Instead:** run the A+B+C checklist and the closing grep gate.

### Anti-Pattern 4: Rewriting historical CHANGELOG entries to the new names
**What:** s/`/plan`/`/lz-plan`/ across the whole CHANGELOG.
**Why wrong:** `[1.0.0]`/`[1.0.1]` shipped under the OLD names; rewriting falsifies history.
**Instead:** leave historical entries; document the rename only in `[2.0.0]`.

### Anti-Pattern 5: Passing `claude-fable-5` where only the enum is accepted
**What:** assume any model param everywhere takes a full ID.
**Why wrong:** older Task-tool builds were enum-locked; if a target runtime predates the `fable`-aware build, the override silently no-ops or 404s.
**Instead:** prefer the `fable` alias; require Claude Code v2.1.170+; the graceful-fallback path (priority-3 Opus) covers the no-op case so the skill is never broken.

## Integration Points

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| SKILL.md <-> references/*.md | `@${CLAUDE_PLUGIN_ROOT}/...` progressive-disclosure load | NEW: model-selection.md joins the 4 existing |
| SKILL.md <-> agents/*.md | `allowed-tools: Agent(lz-advisor:<agent>)` + Agent tool call | Agent NAMES unchanged by rename; per-invocation `model` param is the new field on the call |
| skill dir name <-> slash command | Claude Code derives `/lz-<name>` from the dir | Renaming the dir IS the breaking change |
| plugin.json/SKILL.md `version` <-> CHANGELOG/tag | manual atomic 5-surface bump + tag | established ritual; v2.0.0 MAJOR |

### External / Environment

| Surface | Integration | Notes |
|---------|-------------|-------|
| `CLAUDE_CODE_SUBAGENT_MODEL` | priority-1 model override | can override the plugin's Fable choice; DOCUMENT in model-selection.md |
| Fable subscription window | access suspends 2026-06-23 (credits after) | strictly opt-in; Opus default protects users without Fable access |
| Fable safety classifier | `stop_reason: refusal` (HTTP 200, not an error) | security-review weakest fit; fallback-to-Opus path required |
| Claude Code version | Fable needs v2.1.170+; Agent-tool rename at 2.1.63 | gate the feature on a recent enough runtime; fallback covers older |

## Sources

- Claude Code "Create custom subagents" doc (model frontmatter accepts `fable` + full IDs; 4-level resolution order; Task->Agent rename in 2.1.63) -- https://code.claude.com/docs/en/sub-agents (HIGH)
- "Introducing Claude Fable 5 and Claude Mythos 5" (model ID `claude-fable-5`; $10/$50 per Mtok = 2x Opus; safety-classifier refusals; 1M context; Jan 2026 cutoff) -- https://platform.claude.com/docs/en/about-claude/models/introducing-claude-fable-5-and-claude-mythos-5 (HIGH)
- "How to Use Claude Fable 5 with Claude Code" (alias `fable` / `claude-fable-5` accepted wherever a model is; v2.1.170+; subscription window through 2026-06-22) -- https://apidog.com/blog/claude-fable-5-claude-code/ (MEDIUM)
- GitHub issue #34821 "custom model aliases for subagent spawning" (closed not-planned; Feb-Apr 2026 enum limitation now superseded by the docs) -- https://github.com/anthropics/claude-code/issues/34821 (MEDIUM, historical)
- GitHub issue #44385 "frontmatter model field ignored" (closed duplicate; explicit per-invocation param is the working override -- aligns with current resolution order) -- https://github.com/anthropics/claude-code/issues/44385 (MEDIUM, historical)
- Live repo tree + `git grep` sweeps of plugins/, tests/, evals/, README.md, CHANGELOG.md, CLAUDE.md, marketplace.json (rename surface enumeration) -- HIGH
- Project memory `feedback_no_cross_skill_body_references` + Phase 9 decision in `.planning/PROJECT.md` (rename precedent + reference-extraction convention) -- HIGH

---
*Architecture research for: lz-advisor v2.0.0 (lz- rename + on-demand Fable model selection)*
*Researched: 2026-06-13*
