# Stack Research

**Milestone:** v2.0.0 "Fable and prefixed skill names" -- `lz-` skill rename + on-demand Fable advisor + persistent default setting
**Domain:** Claude Code marketplace plugin (pure Markdown/YAML skills + agents; zero runtime dependencies)
**Researched:** 2026-06-13
**Confidence:** HIGH

Scope note: this milestone adds NO new technology. It uses Claude Code primitives already in the v1.0.1 plugin (Markdown skills, YAML-frontmatter agents, the Agent/Task tool). This file confirms the exact mechanism names, field semantics, model IDs, and the one new convention (a `.local.md` plugin setting). The advisor strategy itself is shipped and is not re-researched.

## Recommended Stack

### Core Technologies (all already in use -- confirmed current as of June 2026)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Subagent `model:` frontmatter field | Claude Code, June 2026 | Default advisor model | Officially supports `sonnet`, `opus`, `haiku`, **`fable`**, a full model ID (e.g. `claude-opus-4-8`), or `inherit`. Keep `model: opus` as the safe default in each agent file. Defaults to `inherit` if omitted. |
| Per-invocation `model` parameter (Agent/Task tool) | Claude Code, June 2026 | On-demand Fable selection | Resolution priority **(2)** -- BEATS the frontmatter value (priority 3). The skill body instructs the executor to spawn the advisor with `model: claude-fable-5` (or `fable`) only when the user opts in; otherwise the frontmatter `opus` default applies. This is the entire mechanism for `--model fable`. |
| Skill argument substitution (`$ARGUMENTS`, `$N`, `arguments:` frontmatter) | Claude Code, June 2026 | Receive `--model fable` from the invocation | Skills are NOT pure model-interpretation: Claude Code does documented **string substitution** of `$ARGUMENTS` / `$ARGUMENTS[N]` / `$N` into the SKILL.md body before the model reads it. The model still has to *branch* on the substituted text, which is the soft part (see reliability caveat). |
| `.claude/lz-advisor.local.md` plugin-settings file | Claude Code, June 2026 (plugin-dev `plugin-settings` skill) | Persistent default advisor model | Documented convention: YAML frontmatter (machine-readable settings) + Markdown body (context). Read at runtime via the **Read tool** from the skill body -- no hooks required, preserving zero-dependency. `.local.md` suffix keeps it out of git by convention. |
| `claude-fable-5` (alias `fable`) | GA 2026-06-09 | Opt-in advisor model | Mythos-class, state-of-the-art on SWE/knowledge benchmarks. $10/$50 per Mtok (2x Opus 4.8). Falls back to Opus 4.8 on high-risk content (relevant to security-review). |

### Supporting Mechanisms

| Mechanism | Field/Token | Purpose | When to Use |
|-----------|-------------|---------|-------------|
| `CLAUDE_CODE_SUBAGENT_MODEL` env var | shell env | User/org global override | Resolution priority **(1)** -- highest. Forces every subagent in a session onto one model. DOCUMENT it as the escape hatch that can override the plugin's per-invocation choice; do not set it from the plugin. |
| `argument-hint:` frontmatter | optional skill field | Autocomplete hint | Set e.g. `argument-hint: [task] [--model fable]` so the picker hints the flag. Cosmetic, not load-bearing. |
| `disable-model-invocation:` frontmatter | optional skill field | Manual-only trigger | Out of scope -- skills should still auto-trigger; noted only for completeness. |

### Development Tools (unchanged from v1.0.x)

| Tool | Purpose | Notes |
|------|---------|-------|
| Headless `claude -p` | Behavioral verification of the resolved model | Grade the advisor subagent's actual model from `~/.claude/projects/<cwd-hash>/<session>/subagents/agent-<id>.jsonl` (per CONVENTIONS.md). This is how to PROVE Fable was selected vs. fell back to Opus. |
| plugin-dev `plugin-settings` skill | Authoritative pattern for `.local.md` | On disk at `~/.claude/plugins/.../plugin-dev/skills/plugin-settings/SKILL.md`. |

## Installation

```bash
# None. Zero new dependencies. v2.0.0 ships as Markdown + YAML edits only:
#  - rename 4 skill directories + name: fields (plan->lz-plan, execute->lz-execute, review->lz-review, security-review->lz-security-review)
#  - add a model-selection branch to each skill body (arg + .local.md default -> per-invocation override)
#  - keep model: opus in each agent frontmatter as the safe default
#  - add .claude/*.local.md to .gitignore; ship a README template for lz-advisor.local.md
```

## Verified Mechanism Details

### 1. Subagent model resolution order (CONFIRMED against official docs)

The established finding is CORRECT. Per `code.claude.com/docs/en/sub-agents`, the effective model is resolved in this priority order:

1. **`CLAUDE_CODE_SUBAGENT_MODEL`** environment variable (highest -- forces all subagents)
2. **Per-invocation `model` parameter** (set when delegating via the Agent/Task tool)
3. **Subagent frontmatter `model:`** field
4. **Main conversation model** (`inherit`, the default when `model:` is omitted)

**(2) beats (3).** This is exactly what v2.0.0 relies on: frontmatter `opus` is the floor; a per-invocation `claude-fable-5` overrides it. Failure to pass the override degrades safely to the Opus default -- never broken. Confidence: HIGH (official frontmatter table + resolution-order synthesis).

Known upstream bug to note (does not block this milestone): subagent model resolution strips the `[1m]` context-window suffix (anthropics/claude-code#45169), so advisor subagents get ~200k context regardless. Irrelevant here -- the advisor reads small packed context, not 1M.

### 2. Valid `model:` values -- `fable` / `claude-fable-5` CONFIRMED

The official subagents frontmatter table lists the `model` field verbatim as:
> `sonnet`, `opus`, `haiku`, `fable`, a full model ID (for example, `claude-opus-4-8`), or `inherit`. Defaults to `inherit`.

So BOTH `fable` (alias) and `claude-fable-5` (full ID) are accepted in subagent frontmatter AND as a per-invocation override (the field "accepts the same values as the `--model` flag"). Confidence: HIGH.

Recommendation: use the **full ID `claude-fable-5`** in the per-invocation override for determinism, and log the resolved value for observability (a milestone requirement).

### 3. Skill argument handling -- substitution + model branch (with caveat)

Skills receive arguments via documented Claude Code string substitution into the SKILL.md body BEFORE the model reads it:

- `$ARGUMENTS` -- the full argument string as typed (if absent from the body, args are appended as `ARGUMENTS: <value>`).
- `$ARGUMENTS[N]` / `$N` -- a specific 0-based positional argument.
- `arguments:` frontmatter -- optional named positional args mapped by position.

So `--model fable` arrives in the body as literal substituted text. **Reliability caveat (load-bearing):** the substitution is deterministic, but *interpreting* it -- "if the args contain `fable`, spawn the advisor with `model: claude-fable-5`" -- is model-interpreted by the Sonnet executor, not hard CLI-parsed. This is reliable enough for an opt-in flag because the failure mode is safe (miss the flag -> fall back to the Opus default), but it is NOT a hard guarantee. Mitigations for the planner:
- Make the branch a crisp, few-shot-style instruction in the skill body (per the Sonnet 4.6 prompt-steering memory: descriptive trigger + example, reserve imperatives for the compliance line).
- Accept both `--model fable` and natural-language "Fable" (the milestone allows both).
- Verify behaviorally with headless `claude -p` + the subagent JSONL trace, not by inspection.

Confidence: HIGH on the substitution mechanism; MEDIUM on branch reliability (inherent to model interpretation, by design safe-degrading).

### 4. `.claude/lz-advisor.local.md` plugin-settings pattern -- CONFIRMED

The plugin-dev `plugin-settings` skill is authoritative. Pattern:
- Path: `.claude/lz-advisor.local.md` in the project root (name MUST match the plugin name `lz-advisor`).
- Structure: YAML frontmatter for structured settings + Markdown body for context. Example field: `advisor_model: claude-fable-5`.
- Read by: hooks, commands, **and agents/skills**. This plugin has no hooks, so the SKILL.md body reads it with the **Read tool** and parses the frontmatter -- fully within the existing `[Read, Glob]`-class tool grants and the zero-dependency constraint.
- Lifecycle: user-managed, NOT committed. Add `.claude/*.local.md` to `.gitignore` and ship a README template.
- Restart caveat: the skill doc notes settings changes require a Claude Code restart *for hooks*; since this plugin reads the file fresh from the skill body each invocation via Read, that caveat does not bind here -- but provide sensible defaults (Opus) when the file is absent.

Resolution chain the planner should wire (most specific wins): per-invocation `--model fable` arg > `.claude/lz-advisor.local.md` `advisor_model` > frontmatter `opus` default. (And `CLAUDE_CODE_SUBAGENT_MODEL` overrides everything, externally.) Confidence: HIGH.

### 5. `claude-fable-5` availability and access -- CONFIRMED with dates

- **Model ID:** `claude-fable-5` (alias `fable`). GA **2026-06-09**, the first publicly available Mythos-class model.
- **Pricing:** $10 / Mtok input, $50 / Mtok output (2x Opus 4.8); 90% cached-read discount. Most expensive GA frontier model Anthropic ships.
- **Platforms (GA, full access from launch):** Claude API, consumption-based Enterprise, Amazon Bedrock, Google Vertex AI, Microsoft Foundry.
- **Subscription access (Pro / Max / Team / seat-based Enterprise):** INCLUDED at no extra cost only through **2026-06-22**. On **2026-06-23** Anthropic removes Fable 5 from those plans; continued use requires prepaid usage credits billed at API rates. Anthropic states it aims to restore Fable as a standard subscription feature once capacity allows (no date given).
- **Safety behavior (relevant to security-review):** built-in safeguards block high-risk categories (cybersecurity, bio, chem) and FALL BACK to Opus 4.8; triggers in <5% of sessions on average but is conservatively tuned (catches some harmless requests). Requires 30-day data retention to run the classifiers. This is why Fable is the WEAKEST fit for the security-review skill -- a security prompt is the likeliest to trip the classifier and silently degrade to Opus.

Implications for v2.0.0: Fable is strictly opt-in, Opus is the default, and the per-invocation override degrades safely. Document the 2026-06-23 subscription cliff and the security-review safety-classifier risk so users understand cost/behavior. Confidence: HIGH.

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Claude API / Anthropic SDK to select Fable | Violates the zero-dependency, plugin-only constraint | Per-invocation `model` parameter on the existing Agent/Task tool spawn |
| A second Fable-only agent file per role | Doubles surface area; the resolution order makes one agent + per-invocation override sufficient | ONE agent per role with `model: opus` frontmatter + per-invocation override |
| Hooks to read `lz-advisor.local.md` | Adds a `hooks/` dir (out of scope since v1), needs restart-to-reload | Read the `.local.md` from the skill body with the Read tool |
| Setting `CLAUDE_CODE_SUBAGENT_MODEL` from the plugin | It is priority (1) and would override the user's per-task choice globally | Leave it to the user/org; only DOCUMENT it as an external override |
| Hard-coding the `fable` alias in the override | Alias resolution is fine, but the full ID is unambiguous and observable in logs | `claude-fable-5` full ID in the per-invocation override |
| Committing `.claude/lz-advisor.local.md` | It is user-local config | `.gitignore` `.claude/*.local.md`; ship a README template |

## Stack Patterns by Variant

**If the user passes `--model fable` (or says "Fable"):**
- Skill body branches on the substituted `$ARGUMENTS` and spawns the advisor with per-invocation `model: claude-fable-5`.
- Log the resolved model.

**If `.claude/lz-advisor.local.md` sets `advisor_model: claude-fable-5` and no per-invocation arg:**
- Skill reads the file via Read, parses frontmatter, applies it as the default.

**If neither is present:**
- Frontmatter `model: opus` applies -- the safe, always-available default.

**For the security-review skill specifically:**
- Even when Fable is selected, expect possible silent fallback to Opus 4.8 on flagged content. Note this in user-facing docs; do not treat a Fable request on security content as guaranteed.

## Version Compatibility

| Component | Compatible With | Notes |
|-----------|-----------------|-------|
| `model: fable` / `claude-fable-5` frontmatter + per-invocation | Claude Code subagent runtime (June 2026) | Listed in the official frontmatter table; same value set as `--model`. |
| `.claude/lz-advisor.local.md` read-from-skill-body | `[Read, Glob]`-class tool grants | No hooks, no new deps. |
| Fable on subscription plans | Through 2026-06-22 only | Credits-billed after 2026-06-23. |

## Sources

- `code.claude.com/docs/en/sub-agents` (official) -- subagent frontmatter table (`model:` accepts `sonnet`/`opus`/`haiku`/`fable`/full ID/`inherit`, default `inherit`), scope/priority table, model resolution order. Fetched via markdown.new. Confidence: HIGH.
- `code.claude.com/docs/en/skills` (official) -- `$ARGUMENTS` / `$ARGUMENTS[N]` / `$N` substitution, `arguments:` and `argument-hint:` frontmatter, "commands merged into skills". Fetched via markdown.new. Confidence: HIGH.
- plugin-dev `plugin-settings` SKILL.md (installed, official) -- `.claude/plugin-name.local.md` pattern, frontmatter+body structure, read from agents/commands, `.gitignore` convention, defaults. On disk. Confidence: HIGH.
- anthropic.com/news/claude-fable-5-mythos-5 + CNBC / TechCrunch / AWS / Azure / GitHub changelog (2026-06-09..12) -- Fable 5 GA date, $10/$50 pricing, platform availability, Opus 4.8 fallback, 30-day retention. Confidence: HIGH (multi-source agreement).
- developersdigest.tech + quoted Anthropic announcement -- subscription cliff: included through 2026-06-22, removed 2026-06-23, credits thereafter, restore-when-capacity. Confidence: HIGH.
- anthropics/claude-code#45169 -- subagent model resolution strips `[1m]` suffix (noted, non-blocking). Confidence: MEDIUM (open issue).

---
*Stack research for: lz-advisor v2.0.0 milestone mechanisms*
*Researched: 2026-06-13*
