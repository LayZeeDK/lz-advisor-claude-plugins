# Quick Task 260417-lhe: Assess Opus 4.7 release impact on advisor plugin and propose upgrade path - Context

**Gathered:** 2026-04-17
**Status:** Ready for planning

<domain>
## Task Boundary

Anthropic released Opus 4.7 on 2026-04-16 with a new `xhigh` effort tier and materially different behavior vs. 4.6 (fewer tool calls by default, stricter literal instruction following, task-calibrated response length). Our advisor plugin runs three Opus agents (`advisor`, `reviewer`, `security-reviewer`) at `effort: high`. This task delivers (1) a written assessment of 4.7's impact on the plugin and (2) the concrete upgrade changes the assessment recommends. No standalone research phase or plan-checker revision -- pipeline already ran.

Sources the plan must honor:
- `.planning/quick/260417-lhe-assess-opus-4-7-release-impact-on-adviso/260417-lhe-RESEARCH.md` (primary reference; quote-backed findings)
- Anthropic release post: https://www.anthropic.com/news/claude-opus-4-7
- Migration guide: https://platform.claude.com/docs/en/about-claude/models/migration-guide#migrating-to-claude-opus-4-7

</domain>

<decisions>
## Implementation Decisions

### Output scope
- **Decision:** Assessment doc + upgrade path in the same quick task.
- **Artifact:** `.planning/quick/260417-lhe-assess-opus-4-7-release-impact-on-adviso/260417-lhe-ASSESSMENT.md` summarizes findings and links to RESEARCH.md.
- **Applied changes:** agent frontmatter + the two project docs listed below.

### Effort tier per agent
- **advisor (`plugins/lz-advisor/agents/advisor.md`):** Keep `effort: high`. Rationale: synthesis task under 100 words; `xhigh` would amplify the documented maxTurns exhaustion by increasing tool-use relative to 4.7's lower baseline. Anthropic permits `high` OR `xhigh` as starting points; our task shape favors `high`. Phase 5.1 prompt fixes plus 4.7's lower tool baseline are expected to resolve the preamble waste without raising effort.
- **reviewer (`plugins/lz-advisor/agents/reviewer.md`):** Change `effort: high` -> `effort: xhigh`. Rationale: code exploration + edge-case reasoning is Anthropic's stated sweet spot for `xhigh` ("the best setting for most coding and agentic use cases").
- **security-reviewer (`plugins/lz-advisor/agents/security-reviewer.md`):** Change `effort: high` -> `effort: xhigh`. Rationale: canonical hard, long-horizon reasoning (threat modeling, attack-chain analysis) -- exactly the 4.7 target.
- **All three agents:** Keep `model: opus` alias. No pinning to `claude-opus-4-7`. Alias auto-routes to 4.7 today and future Opus generations; Opus 4.7 is described as a direct upgrade.
- **maxTurns:** Unchanged at 3 for all agents.

### Doc updates (in-scope)
- `plugins/lz-advisor/README.md` -- user-facing. Update model-tier references; add a short note that Opus 4.7 is auto-picked via the `opus` alias with no user action required.
- `.planning/PROJECT.md` constraints -- update the "Requires user has access to both Sonnet 4.6 and Opus 4.6" line to reflect 4.7 availability, and note that prompt optimization assumptions now target 4.7 behavior (literal instruction following, fewer tool calls by default, task-calibrated response length).

### Doc updates (explicitly out of scope)
- **Root `CLAUDE.md`** -- user declined update in this quick task. Leave Technology Stack, Constraints, and Blockers/Concerns sections untouched. Revisit in a dedicated docs pass.
- `plugins/lz-advisor/references/advisor-timing.md` -- no model-specific references that need syncing based on research findings.
- Skill files under `plugins/lz-advisor/skills/*/SKILL.md` -- no model-specific references that need syncing.

### Frontmatter validation (critical gate)
- **Unverified risk:** Claude Code agent frontmatter parser acceptance of `effort: xhigh` is not documented. If the parser rejects `xhigh`, the reviewer / security-reviewer changes fail at load time.
- **Plan must include:** an empirical verification step that proves `effort: xhigh` loads without error before the two reviewer frontmatter changes are committed. Acceptable evidence: (a) running `claude --plugin-dir plugins/lz-advisor -p "/lz-advisor.review <probe>"` and observing no validation error, or (b) invoking plugin-validator / plugin-dev's validator and confirming green. If the parser rejects `xhigh`, roll back to `effort: high` on reviewers and document the blocker in ASSESSMENT.md rather than shipping a broken plugin.

### Advisor prompt changes
- **Decision:** No prompt edits to `advisor.md` in this task.
- Rationale: 4.7's stricter instruction following plus lower baseline tool usage may fix the Phase 5.1 preamble waste without code changes. Validate empirically in a follow-up UAT pass; escalate to prompt changes (positive example, trimmed anti-preamble scaffolding) only if the problem persists. Captured as open UAT item in ASSESSMENT.md.

### Cost and licensing
- Out of scope. Tokenizer change adds 0-35% input tokens; not material enough to warrant pricing doc changes at this stage.

### Claude's Discretion
- Exact wording of the ASSESSMENT.md (structure follows RESEARCH.md but should be narrative and decision-focused, not exhaustive).
- Exact phrasing of README.md and PROJECT.md updates.
- Commit granularity within the executor's plan (one commit per logical change is fine).

</decisions>

<specifics>
## Specific Ideas

- ASSESSMENT.md should open with a TL;DR (3-5 bullets) that maps 1:1 to the concrete changes being shipped, so a reader can see "this was decided and this is what we did" in one scroll.
- Include the per-agent effort-tier table from RESEARCH.md in ASSESSMENT.md verbatim -- it's the clearest artifact summarizing the decision.
- Carry forward the "open UAT questions" list from RESEARCH.md into ASSESSMENT.md as follow-up work, not as blockers for this quick task.

</specifics>

<canonical_refs>
## Canonical References

- Anthropic release post: https://www.anthropic.com/news/claude-opus-4-7
- Migration guide (Opus 4.7 section): https://platform.claude.com/docs/en/about-claude/models/migration-guide#migrating-to-claude-opus-4-7
- RESEARCH.md (this quick task): `.planning/quick/260417-lhe-assess-opus-4-7-release-impact-on-adviso/260417-lhe-RESEARCH.md`
- Cached sources (temp files, not committed):
  - `C:/Users/LARSGY~1/AppData/Local/Temp/opus-4-7-release.md`
  - `C:/Users/LARSGY~1/AppData/Local/Temp/opus-4-7-migration.md`
  - `C:/Users/LARSGY~1/AppData/Local/Temp/opus-4-7-migration-section.md`

</canonical_refs>
