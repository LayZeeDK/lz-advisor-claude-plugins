# Feature Research

**Domain:** On-demand advisor-model selection + prefixed-skill UX in a Claude Code plugin (lz-advisor v2.0.0)
**Researched:** 2026-06-13
**Confidence:** HIGH (Claude Code model-config + sub-agents docs are authoritative and current)

> Scope note: This file covers ONLY the two new v2.0.0 user-facing features -- `lz-` prefixed skill
> names and on-demand `--model fable` advisor selection. The orient -> consult -> produce loop, the
> four skills, and the three Opus agents already shipped in v1.0.1 and are not re-evaluated here.

## How model selection works (the mechanism this milestone builds on)

Verified against the current Claude Code docs (`/en/sub-agents`, `/en/model-config`):

1. **Subagent `model` resolution priority** (HIGH): (1) `CLAUDE_CODE_SUBAGENT_MODEL` env var ->
   (2) per-invocation `model` parameter on the Agent tool -> (3) the agent's `model:` frontmatter ->
   (4) the main conversation's model. The milestone's documented "2 beats 3, env var beats all"
   assumption is exactly correct.
2. **The `model` field accepts `fable` and full IDs** (HIGH, supersedes a stale GitHub issue):
   `/en/sub-agents` -> "Choose a model" lists `sonnet`, `opus`, `haiku`, `fable`, a full ID such as
   `claude-opus-4-8`, or `inherit`, and states it "Accepts the same values as the `--model` flag."
   An older issue (anthropics/claude-code#34821, closed-as-not-planned) reported the Agent tool's
   `model` parameter was hardcoded to a 3-value enum (`sonnet`/`opus`/`haiku`); the current docs
   contradict that, so `fable` IS a valid per-invocation/frontmatter value now. FLAG for empirical
   verification during the milestone (it is the load-bearing assumption).
3. **`$ARGUMENTS` is a single string, not parsed flags** (HIGH): Claude Code does not pre-parse
   `--model fable` into structured argv. The skill body must instruct the executor to detect the
   intent (flag form or natural language) from the raw argument string and choose the Agent-tool
   `model` value accordingly. This is a prompt-engineering task, not a config feature.
4. **Fable safety classifiers + non-interactive refusal** (HIGH, critical for security-review):
   Fable flags cybersecurity/biology content and auto-falls-back to Opus with a transcript notice
   interactively -- but "In non-interactive mode and SDK integrations that can't show the prompt, a
   flagged request ends the turn with a refusal instead." A security-review run on Fable in headless
   mode (the project's own `claude -p` UAT path) can hard-fail rather than gracefully degrade.

## Feature Landscape

### Table Stakes (Users Expect These)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| `lz-` prefix removes built-in shadowing | `/review` and `/security-review` silently collided with Claude Code built-ins; users expect their installed plugin command to win | MEDIUM | `git mv` 4 skill dirs + `name:` frontmatter; sweep every cross-reference (SKILL.md, references/*, agents, README, CHANGELOG, CLAUDE.md, tests, in-repo `claude -p` examples). This is the bug-fix half of the milestone and is non-negotiable. |
| Opus stays the default advisor | The whole value prop is "near-Opus at Sonnet cost"; users who pass no model must get the proven Opus behavior | LOW | Keep `model: opus` in all three agent frontmatter. No change = safe default by construction. |
| `fable` is strictly opt-in | Fable is ~2x Opus cost; nobody should pay 2x by accident | LOW | Opt-in only via explicit flag/intent in the skill argument. Never auto-select. |
| Graceful fallback on unrecognized/unavailable model | A typo (`--model fabel`) or no-access must not break the skill | MEDIUM | If the requested override is not a recognized opt-in value, fall back to the Opus default and say so. Mirrors Claude Code's own warn-and-fallback and `availableModels`-blocked-override behavior (a blocked subagent override "falls back to the inherited or default model rather than failing the request"). |
| Observability: announce the resolved advisor model | This project's stated principle is "model/tool usage must be observable"; a silent fallback or a Fable->Opus provider handoff otherwise hides what actually ran | LOW-MEDIUM | Emit a one-line "Consulting advisor on `<model>`..." before the Agent spawn, and surface when a requested model was NOT honored (fell back to Opus). This is the single most important quality gate for the model-selection feature. |
| `/lz-` prefix surfaces the suite in autocomplete | Typing `/lz-` should list all four skills together so the suite is discoverable as a group | LOW | Free side-effect of the prefix: Claude Code plugin skills DO appear in slash autocomplete by prefix (the missing-from-autocomplete bug #21526 was specifically about `.claude/commands/`, not plugin skills). The prefix doubles as a discovery namespace, like `uv pip` / `gh pr`. |
| Migration guidance for the rename | Existing users (and the project's own CONVENTIONS.md `claude -p` invocations) reference the old names; a BREAKING rename without a map is hostile | LOW | CHANGELOG `[2.0.0]` rename table (old -> new), README "What's New", and updated in-repo `claude -p` examples. Standard CLI-rename hygiene: changelog + migration table + rationale. |

### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Per-skill, per-invocation advisor escalation to Fable | Pay for Fable-class reasoning only on the one hard task that needs it, inside an existing skill, without `/model fable` for the whole session or a session relaunch | MEDIUM | The plugin's edge over the now-native `--advisor fable` (see Competitor Analysis): selection lives in the skill call, scoped to that consultation, with the plugin's curated context-packaging + word-budget contract still applied. |
| Natural-language model intent ("use Fable") alongside `--model fable` | Skills are invoked conversationally; forcing exact flag syntax fights the medium | LOW-MEDIUM | Since `$ARGUMENTS` is unparsed, the skill prompt should recognize BOTH `--model fable` and prose like "use Fable for this" / "fable advisor". Flag form is the documented canonical; NL is the convenience layer. Precedence inside the skill: explicit flag > NL phrasing > default Opus. |
| Honest per-call cost/observability framing | Telling users "this consult ran on Fable (~2x Opus)" turns the cost into an informed choice, not a surprise | LOW | One line at consult time. Reinforces the observability principle and the strictly-opt-in cost posture. |
| Security-review Fable caveat surfaced inline | Fable's classifiers make it the weakest fit for security content; the plugin can warn before the user wastes a flagged/refused run | LOW-MEDIUM | If `fable` is requested for `lz-security-review`, warn that the classifier may refuse/hand off (and that headless mode hard-refuses). Optionally steer to Opus. Differentiator because the native advisor tool does not pre-warn per workflow. |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Prompt the user for a model on every invocation | "Make it flexible / always ask" | Friction on every call; defeats the strategic 2-3-consults-per-task discipline; punishes the 95% Opus-default case | Default to Opus silently; opt in per-invocation only when the user passes a flag/intent. |
| Make Fable the default advisor | "Use the best model" | ~2x Opus cost on every task; Fable subscription access suspends 2026-06-23 (credits-only after); classifiers refuse security/biology content -> broken default for `lz-security-review` | Opus default, Fable strictly opt-in, graceful fallback to Opus. |
| Persistent plugin-level model setting (a config file the plugin reads) | "Set it once, remember my choice" | Zero-dependency, no-runtime constraint -- a plugin skill is Markdown; it cannot reliably read/write a settings file or own resolution priority. Duplicates Claude Code's own `advisorModel` / `CLAUDE_CODE_SUBAGENT_MODEL`, risking precedence conflicts | Per-invocation selection only. For a persistent default, point users at Claude Code's native `CLAUDE_CODE_SUBAGENT_MODEL` (which already overrides the plugin's per-invocation choice -- document it, don't reimplement it). |
| Silent model switch with no notice | "Less noise" | Violates the observability principle; a Fable->Opus classifier handoff or a typo-triggered fallback becomes invisible, and the user can't reason about cost or refusals | Always announce the resolved model and any non-honored request. |
| Keep old skill names as working aliases | "Don't break my scripts" | Re-introduces the exact built-in shadowing bug the milestone exists to fix (`/review` / `/security-review` collide); a "deprecation alias" here is the disease, not the cure | Clean BREAKING rename + a migration table. The whole point is to STOP colliding; aliasing would defeat it. (The standard "keep the old name as an alias" advice does NOT apply when the old name is the bug.) |
| Arbitrary free-form model values (`--model gpt-4`, any string) | "Let me route anywhere" | Plugin can't validate; non-Anthropic/unknown values either error or silently no-op; expands the test matrix without value for this milestone | Recognize a small, validated opt-in set (Fable; Opus as the default). Treat anything else as unrecognized -> fall back to Opus with a notice. |

## Feature Dependencies

```
[lz- prefix rename]  (BREAKING, the shadowing fix)
    |--enables--> [/lz- autocomplete grouping]   (free discoverability side-effect)
    '--requires--> [cross-reference sweep + migration table]   (rename hygiene)

[On-demand model selection]
    |--requires--> [Agent-tool `model` accepts `fable`]   (VERIFY empirically; load-bearing)
    |--requires--> [argument-intent parsing in skill body]   ($ARGUMENTS is one string)
    |--requires--> [graceful fallback to Opus]   (unrecognized/unavailable -> default)
    '--requires--> [resolved-model announcement]   (observability gate)
            |--enhances--> [per-call cost framing]
            '--enhances--> [security-review Fable caveat]

[Opus default]  --guarantees safe behavior for-->  [On-demand model selection]
[CLAUDE_CODE_SUBAGENT_MODEL]  --overrides-->  [the plugin's per-invocation choice]   (document, don't fight)
```

### Dependency Notes

- **Model selection requires the Agent tool to accept `fable`:** Current docs say yes; a stale
  closed issue said no. This is the milestone's single point of failure -- verify with a headless
  `claude -p` probe (CONVENTIONS.md pattern) before building the prompt surface around it.
- **Selection requires argument parsing in the skill body:** `$ARGUMENTS` is unparsed, so flag-vs-NL
  intent detection is a prompt concern in each skill (or a shared `references/*.md` doc, per the
  no-cross-skill-body-references convention).
- **Fallback + announcement are inseparable from selection:** A selection feature without a "what
  actually ran" notice fails this project's observability principle and hides cost/refusals.
- **The prefix rename enables autocomplete grouping for free:** No extra work; the namespace IS the
  discovery surface.
- **`CLAUDE_CODE_SUBAGENT_MODEL` sits above the plugin:** It overrides the per-invocation `model`.
  Document this precedence so users understand why a session-wide override wins; do not attempt to
  defeat or detect it.

## MVP Definition

### Launch With (v2.0.0)

- [ ] `lz-`-prefixed skill names (4 skills renamed; full cross-reference sweep) -- the BREAKING shadowing fix
- [ ] Opus remains the default advisor across all three agents (no frontmatter change) -- safe default
- [ ] Per-invocation opt-in to Fable via `--model fable` AND natural-language "fable" intent -- the new capability
- [ ] Graceful fallback to Opus on any unrecognized/unavailable model value -- never-broken guarantee
- [ ] Resolved-advisor-model announcement ("Consulting advisor on `<model>`...") + notice when a request was not honored -- the observability gate
- [ ] CHANGELOG `[2.0.0]` + rename migration table + README "What's New"; update in-repo `claude -p` examples -- migration hygiene
- [ ] `CLAUDE_CODE_SUBAGENT_MODEL` precedence documented -- avoids confusion when a session override wins

### Add After Validation (v2.x)

- [ ] Security-review-specific Fable caveat/steer (warn about classifier refusal, headless hard-refusal) -- add once base selection is proven
- [ ] Per-call cost framing ("~2x Opus") in the announcement -- low cost, add if users want it surfaced

### Future Consideration (post-2.x)

- [ ] Re-evaluate the plugin's reason-to-exist against Claude Code's now-native `advisor` tool
      (`--advisor fable`, `advisorModel`) -- the native feature overlaps the core value prop; the
      plugin's edge is per-skill scoping + curated context-packaging + word-budget contracts. Defer
      to a strategy review, not this milestone.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| `lz-` prefix rename (shadowing fix) | HIGH | MEDIUM | P1 |
| Opus default preserved | HIGH | LOW | P1 |
| `--model fable` + NL opt-in | HIGH | MEDIUM | P1 |
| Graceful fallback to Opus | HIGH | MEDIUM | P1 |
| Resolved-model announcement (observability) | HIGH | LOW-MEDIUM | P1 |
| Migration table + changelog + example updates | MEDIUM | LOW | P1 |
| `CLAUDE_CODE_SUBAGENT_MODEL` precedence doc | MEDIUM | LOW | P1 |
| `/lz-` autocomplete grouping | MEDIUM | LOW (free) | P2 |
| Security-review Fable caveat | MEDIUM | LOW-MEDIUM | P2 |
| Per-call cost framing | LOW-MEDIUM | LOW | P3 |

**Priority key:**
- P1: Must have for v2.0.0 launch
- P2: Should have / fast-follow
- P3: Nice to have, defer

## Competitor Feature Analysis

| Feature | Claude Code native `advisor` tool | Claude Code `/model fable` / subagent `model:` | lz-advisor v2.0.0 (our approach) |
|---------|-----------------------------------|------------------------------------------------|----------------------------------|
| Select a stronger advisor model | `--advisor fable` / `advisorModel: fable` / `/advisor fable`; server-side, full transcript auto-sent | `/model fable` switches the whole session; subagent frontmatter sets one model for the whole subtask | Per-invocation Fable opt-in scoped to a single skill consultation, with curated context-packaging + word budget |
| Default | Off unless configured | Opus/Sonnet per tier; Fable never default | Opus default, Fable opt-in |
| When the strong model runs | Claude decides, mid-task | Whole session / whole subtask | At the skill's strategic consult points only |
| Cost control | Decision-point calls only | Session-wide (expensive) | 2-3 consults per task by design |
| Availability constraint | Anthropic API only; not Bedrock/Vertex/Foundry; v2.1.98+ | Broad | Inherits Claude Code's model availability; zero extra deps |
| Observability | "Advising" transcript line | Status line / `/status` | Explicit "Consulting advisor on `<model>`..." + fallback notice |

## Sources

- Claude Code, Model configuration -- <https://code.claude.com/docs/en/model-config> (HIGH: aliases incl. `fable`/`best`, Fable not default, content-classifier fallback, fallback chains, `--model` flag vs settings, `availableModels`, `CLAUDE_CODE_SUBAGENT_MODEL` precedence, non-interactive refusal)
- Claude Code, Create custom subagents -- <https://code.claude.com/docs/en/sub-agents> (HIGH: `model` field accepts `fable`/full IDs/`inherit`; 4-step resolution priority; per-invocation `model` parameter; plugin agent frontmatter)
- Claude Code, Advisor tool -- <https://code.claude.com/docs/en/advisor> (HIGH: native `advisorModel`/`--advisor fable`, advisor pairings, "Advising" notice, compare-with-subagents -- competitor context)
- anthropics/claude-code#34821 -- <https://github.com/anthropics/claude-code/issues/34821> (MEDIUM, stale: Task-tool model-enum restriction, closed-as-not-planned; CONTRADICTED by current sub-agents docs -- flagged for empirical verification)
- anthropics/claude-code#21526 -- <https://github.com/anthropics/claude-code/issues/21526> (MEDIUM: autocomplete surfaces `.claude/skills/` by prefix; the missing-from-autocomplete bug was `.claude/commands/`-specific, so plugin-skill prefix grouping works)
- Claude Code slash-command argument handling -- WebSearch synthesis (MEDIUM: `$ARGUMENTS` is a single unparsed string; the model decides parsing; `--model` is a flag/frontmatter mechanism, not parsed from `$ARGUMENTS`)
- CLI rename/deprecation conventions -- WebSearch synthesis (MEDIUM: changelog + migration table + rationale; "keep old name as alias" is the standard pattern but does NOT apply when the old name is the bug being fixed)
- Project context -- `.planning/PROJECT.md` Current Milestone + Key context (HIGH: Opus default, priority 2>3, Fable ~2x cost + 2026-06-23 access suspension + security-classifier weakness, `CLAUDE_CODE_SUBAGENT_MODEL` priority 1)

---
*Feature research for: on-demand advisor-model selection + prefixed-skill UX (lz-advisor v2.0.0)*
*Researched: 2026-06-13*
