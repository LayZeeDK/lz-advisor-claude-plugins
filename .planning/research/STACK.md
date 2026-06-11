# Stack Research

**Milestone:** v1.0.1 "No review report shorthands" -- spelled-out severity labels in user-facing review reports
**Domain:** Claude Code marketplace plugin (pure Markdown/YAML skills + agents; zero runtime dependencies)
**Researched:** 2026-06-07
**Confidence:** HIGH

> This file is scoped to the v1.0.1 output-format change. The v1.0 full-stack survey (single-advisor architecture, dotted skill names, plugin 0.1.0) is preserved in git history at commit `84f6e77` and is superseded here -- the shipped architecture is three agents (advisor, reviewer, security-reviewer) + four skills (plan, execute, review, security-review), plain skill directories, plugin 1.0.0.

## Verdict (read this first)

**No stack additions are justified. This milestone is a pure prompt/contract-text change.**

Spelling out severity labels (`crit:`/`imp:`/`sug:`/`q:` -> `Critical`/`Important`/`Suggestion`/`Question`) in user-facing review and security-review reports is achieved entirely by editing Markdown instruction text in the two agent files (`agents/reviewer.md`, `agents/security-reviewer.md`) and, if a section-per-severity report shape is chosen, the two review SKILL.md output blocks. The `FRAGMENT_RE` severity alternation in the budget smoke fixtures updates in lockstep. There is NO Claude Code-native mechanism (output style, hook, references file) that can perform mechanical label expansion without (a) introducing a script/dependency or (b) failing to durably reach the user-facing report -- both disqualifying under the zero-dependency constraint. The existing stack is exactly sufficient.

## Recommended Stack

### Core Technologies (UNCHANGED -- no additions)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Agent files (`agents/*.md`, Markdown + YAML frontmatter) | plugin 1.0.0 | Define the reviewer / security-reviewer emit grammar in their `## Output Constraint` sections | The severity vocabulary is authored here as plain instruction text: the emit-format line, the `Severity prefix` legend, and every worked example. Changing `crit:` to `Critical:` is a text edit. This is the single highest-leverage surface and the natural home for the change. |
| Skill files (`skills/*/SKILL.md`, Markdown + YAML frontmatter) | plugin 1.0.0 | Enforce the render-verbatim contract in `## Phase 3: Structure Output` | If a section-per-severity report shape is chosen, the conversion (mechanical, lossless only) lives in Phase 3, AND the current `Do NOT reformat the response into severity groups` clause must be reversed. If the agent emits spelled-out labels directly (recommended), the skill needs only a worked-example/header-note refresh. |
| References files (`references/context-packaging.md`) | plugin 1.0.0 | Carry the shared severity vocabulary in the consultation templates + `<verify_request>` schema | The `Severity (initial): [Critical/Important/Suggestion]` template text and the `severity="<critical\|important\|suggestion>"` attribute enum already use word forms, not the `crit:`/`imp:` shorthands. These need only a consistency cross-check, not new tooling. |
| `wc -w` + regex bash smoke fixtures (existing test pattern) | n/a | Regression gates (`D-reviewer-budget.sh` / `D-security-reviewer-budget.sh`) that parse the emit grammar by `FRAGMENT_RE` and assert per-section word budgets | Spelled-out labels are word-neutral against the budgets (the agent grammar states the per-finding count "excludes the `<file>:<line>: <severity>:` prefix"). The `FRAGMENT_RE` severity alternation (`crit\|imp\|sug\|q`) is the ONLY fixture surface that must change, in lockstep with the agent grammar. These fixtures are transient phase artifacts (not committed to the repo tree); they are recreated/edited during the implementing phase. |

### Supporting Libraries

None. No library, package, MCP server, or runtime is added. The change is confined to Markdown instruction text and a regex literal in existing bash fixtures.

### Development Tools (UNCHANGED)

| Tool | Purpose | Notes |
|------|---------|-------|
| `claude -p` headless skill verification | Behaviorally prove the new label shape reaches the user-facing report | Use the canonical `--permission-mode auto --plugin-dir ... -p "/lz-advisor:review ..."` invocation from CLAUDE.md Conventions. Grade the rendered report for spelled-out labels in the `### Findings` body and (if adopted) section-per-severity headings. |
| `git grep` severity-vocab sweep | Enumerate every surface hardcoding a shorthand before editing | Sweep `crit:`, `imp:`, `sug:`, `q:` across `plugins/lz-advisor/` to fix the edit set: agents x2, the two review SKILL.md Phase-3 "Do NOT reformat into severity groups" clauses, context-packaging.md, and the worked examples. |

## How the NEW capability is delivered (mechanism, with doc references)

Exactly two viable mechanisms, both pure-text. Requirements pick one (or a hybrid).

### Mechanism A (RECOMMENDED): change the agent emit grammar to spelled-out labels

Edit `agents/reviewer.md` and `agents/security-reviewer.md` so the `### Findings` emit format and `Severity prefix` legend use full words. Two sub-variants:

- **A1 -- spelled-out inline prefix.** Format becomes `<file>:<line>: Critical: <problem>. <fix>.` (replacing `crit:`). The two-slot `### Findings` / `### Cross-Cutting Patterns` (review) and `### Findings` / `### Threat Patterns` (security) header contract is untouched. Render-verbatim holds with near-zero skill changes (just refresh the "the reviewer already includes severity per finding entry" note).
- **A2 -- section-per-severity shape.** The agent emits `### Critical` / `### Important` / `### Suggestion` / `### Question` subsection headers inside (or replacing) the `### Findings` block, grouping findings under each. This is the milestone's named "restored section-per-severity report shape" option. It requires updating the SKILL.md allowed-header set, REVERSING the current `Do NOT reformat into severity groups` clause, extending the agent `<output_constraints>` section allowlist, and updating the fixtures' section-parsing regexes.

Why A is preferred: render-verbatim stays intact (the skill never paraphrases), so there is no risk the conversion drops or rewords a finding. The agent is the single source of truth for severity presentation -- consistent with the shipped architecture where agents own output shape and skills pass it through.

### Mechanism B (FALLBACK): mechanical label expansion at the skill layer

Keep the agent shorthands; add a deterministic, lossless substitution in each SKILL.md Phase 3 before rendering: `crit:`->`Critical:`, `imp:`->`Important:`, `sug:`->`Suggestion:`, `q:`->`Question:`. The render-verbatim contract is amended from "render unchanged" to "apply ONLY this fixed 4-token substitution, then render unchanged; never paraphrase, reorder, merge, or drop a finding."

Why B is the fallback: it weakens the verbatim contract from "no changes" to "one whitelisted change," reintroducing the exact risk (skill mutating agent output) the contract was built to eliminate. A Sonnet executor doing string substitution is less reliable than the Opus agent emitting the right tokens. Choose B only if requirements decide the agents must keep terse shorthands internally while users see full words.

### Why no Claude Code-native automation mechanism applies

| Native mechanism | Can it mechanically expand labels in the durable user-facing report? | Verdict |
|------------------|---------------------------------------------------------------------|---------|
| **Output styles** (`output-styles`; Markdown + frontmatter; plugin-distributable) | No. Output styles modify the *system prompt* (role/tone/format steering), read once at session start, apply session-wide, and community reports note model defaults can override them. They steer generation; they do not deterministically rewrite emitted text. | Not applicable -- a heavier, less reliable way to do what an agent-prompt edit does directly. |
| **`MessageDisplay` hook** | Only cosmetically. It is the sole hook that rewrites user-visible text, but it is explicitly **display-only**: "the transcript and what Claude sees keep the original text ... verbose mode shows the original." Shorthands persist in the transcript and for any downstream consumer. It also requires a command/HTTP hook (a script = dependency), has NO matcher (fires on every assistant message globally), and reintroduces the cost/noise the project rejected. | Disqualified -- violates zero-dependency, only cosmetic, leaves shorthands in the transcript. |
| **`SubagentStop` / `PostToolUse` / `Stop` hooks** | No. They provide `additionalContext` / continuation control / feedback to Claude; `last_assistant_message` is read-only INPUT. They cannot replace the rendered text. | Disqualified -- cannot rewrite the report; also a script dependency. |
| **References files** (`references/*.md`) | No. Progressive-disclosure context loaded into the prompt. They can DEFINE the spelled-out vocabulary (and should, for consistency) but perform no runtime conversion. | Documentation surface only, not a conversion mechanism. |

Net: every native "automation" path either fails to reach the durable report, requires a script (breaking zero-dependency + the standing "no hooks for v1" decision), or is a strictly weaker form of the prompt edit. Mechanism A (edit the agent prompt) is the correct, native, zero-dependency answer.

## Word-budget interaction (token-economy motivation no longer binds)

The shorthand grammar (Phase 7 Plan 07-09) was partly motivated by token economy. The current gates are `wc -w` per-section caps (`per_entry max_words="22"`, `outlier_soft_cap="28"`, `cross_cutting_patterns`/`threat_patterns max_words="160"`, `aggregate_cap none`). The severity prefix sits OUTSIDE the counted span -- the grammar explicitly excludes `<file>:<line>: <severity>:` from the per-finding count. So `crit:` -> `Critical:` is word-neutral against the binding budgets; no `max_words` value moves. Only `FRAGMENT_RE`'s severity-token alternation must change so the fixtures still recognize a finding line.

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Mechanism A (agent emits spelled-out labels) | Mechanism B (skill-layer mechanical expansion) | Only if requirements mandate the agents retain terse shorthands internally while users see full words. Accept the weakened verbatim contract consciously. |
| A1 (spelled-out inline prefix) | A2 (section-per-severity headings) | Choose A2 if a grouped `### Critical` / `### Important` report is decided more readable than per-line prefixes; costs extra SKILL.md + fixture edits and reverses the current `Do NOT reformat into severity groups` clause. |
| Pure prompt/contract edit | `MessageDisplay` hook | Never for this project. Only if a future milestone needed session-wide cosmetic redaction AND accepted a script dependency AND dropped the no-hooks decision -- none hold here. |
| Pure prompt/contract edit | Output style | Never for this purpose. Output styles steer; they do not deterministically rewrite. Editing the agent prompt is the direct, reliable equivalent. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Adding a `hooks/` directory + `MessageDisplay`/`SubagentStop`/`PostToolUse` hook | Requires a shell/HTTP script (breaks zero-dependency); `MessageDisplay` is display-only so shorthands persist in the transcript + downstream consumers; hooks are unscoped/global and reintroduce cost/noise the project rejected in the "No hooks for v1" decision. | Edit the agent emit grammar (Mechanism A). |
| Adding an output style to the plugin | Modifies the system prompt (steering, not deterministic rewriting), applies session-wide rather than per-skill, can be overridden by model defaults. Strictly weaker than editing the agent prompt. | Edit the agent emit grammar (Mechanism A). |
| Adding `.mcp.json` / MCP server / Node or Python conversion script | Any external service/runtime is a hard violation of the zero-dependency constraint and grossly disproportionate to a 4-token label rename. | Pure text edit. |
| Increasing agent `maxTurns` or `effort` "to fit longer labels" | Spelled-out labels are word-neutral against the budget gates; the prefix is excluded from the counted span. No budget pressure exists. | Leave `maxTurns: 3`, `effort: medium` unchanged. |
| A non-mechanical (paraphrasing) skill-layer conversion | Letting the Sonnet executor rewrite finding text risks dropping/rewording findings -- the precise failure render-verbatim prevents. | If Mechanism B is chosen, constrain it to a fixed 4-token substitution table and forbid all other edits in the contract text. |

## Stack Patterns by Variant

**If requirements choose A1 (inline spelled-out prefix):**
- Edit set: `agents/reviewer.md` + `agents/security-reviewer.md` (emit-format line, `Severity prefix` legend, every worked example, the holistic worked example, the `<verify_request>` example severity tokens), the `FRAGMENT_RE` severity alternation in both budget fixtures, a consistency sweep of `context-packaging.md`.
- Skills need only a note refresh; the render-verbatim contract is untouched.

**If requirements choose A2 (section-per-severity headings):**
- All of A1, PLUS: update each SKILL.md `<output>` block to add `### Critical` / `### Important` / `### Suggestion` / `### Question` to the allowed-header set and REVERSE the `Do NOT reformat ... into severity groups` clause; extend the agent `<output_constraints>` section allowlist (currently `Any section heading not enumerated ... is forbidden`); update both fixtures' section-parsing regexes to recognize per-severity subsections.

**If requirements choose Mechanism B (skill-layer expansion):**
- Agents unchanged (keep shorthands).
- Edit set: both SKILL.md Phase 3 blocks add the fixed substitution table + amended verbatim-contract wording; fixtures unchanged (they still parse the shorthand emit).
- Add a `claude -p` UAT asserting the rendered report shows full words while the agent transcript still shows shorthands.

## Version Compatibility

| Surface | Compatible With | Notes |
|---------|-----------------|-------|
| Agent emit grammar (Markdown text) | Any Claude Code version supporting `agents/*.md` with `model`/`effort`/`maxTurns` frontmatter | Plain instruction text; introduces no Claude Code feature-version dependency. |
| Spelled-out label tokens | Existing `wc -w` budget gates | Word-neutral; prefix excluded from counted span. No `max_words` change. |
| Atomic 5-surface version bump | Existing SemVer convention (plugin 1.0.0 -> 1.0.1) | A user-facing report-format change is a PATCH per the "v1.0.1" framing; bump `plugin.json`, README What's New, and the three other version surfaces atomically per the existing convention. |

## Sources

- `https://code.claude.com/docs/en/hooks` (fetched via markdown.new) -- HIGH. Authoritative hook lifecycle + schemas. Confirmed: hooks are "user-defined shell commands, HTTP endpoints, or LLM prompts"; `MessageDisplay` is the only hook that rewrites user-visible text and is explicitly "display-only" (transcript + downstream keep the original, verbose mode shows the original); `SubagentStop`/`PostToolUse`/`Stop` provide context/continuation control, with `last_assistant_message` as read-only input.
- `https://code.claude.com/docs/en/output-styles` (via WebSearch summary; code.claude.com blocks direct AI fetch) -- MEDIUM. Output styles modify the system prompt (role/tone/format steering), read once at session start, apply session-wide, plugin-distributable; community reports note model defaults can override them. Confirms steering, not deterministic rewriting.
- Local source of truth -- HIGH: `plugins/lz-advisor/agents/reviewer.md` + `agents/security-reviewer.md` (`## Output Constraint`, `Severity prefix` legend, `<output_constraints>` blocks, worked examples), `skills/review/SKILL.md` + `skills/security-review/SKILL.md` (`## Phase 3: Structure Output` render-verbatim contract + `Do NOT reformat into severity groups` clause), `references/context-packaging.md` (severity template + `<verify_request>` severity enum), `plugins/lz-advisor/.claude-plugin/plugin.json` (1.0.0; verified pure Markdown + manifest + LICENSE, no `hooks/`, no `.mcp.json`, no scripts).
- `.planning/PROJECT.md` -- HIGH. Zero-dependency constraint, "No hooks for v1" key decision, milestone goal + target features, `wc -w`-based budget context.

---
*Stack research for: Claude Code plugin output-format change (spelled-out review severity labels), milestone v1.0.1*
*Researched: 2026-06-07*
