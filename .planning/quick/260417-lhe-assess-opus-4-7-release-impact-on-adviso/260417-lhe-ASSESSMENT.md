# Opus 4.7 Release Impact on lz-advisor -- Assessment

**Date:** 2026-04-17
**Task ID:** 260417-lhe
**Research source:** `260417-lhe-RESEARCH.md` (quote-backed findings from Anthropic release post + migration guide)

## TL;DR

1. **Opus 4.7 is already live in the plugin.** All three agents use `model: opus`, which auto-routes to 4.7. No user action, no pin change, no frontmatter edit needed to adopt it.
2. **`effort: xhigh` is accepted by Claude Code's agent frontmatter parser.** This was the critical unverified gate -- Task 1 confirmed it with an empirical probe (no validation errors on plugin load). Unblocked the reviewer effort upgrade.
3. **Reviewer and security-reviewer upgraded to `effort: xhigh`.** Matches Anthropic's explicit guidance: "Start with the new `xhigh` effort level for coding and agentic use cases." These two agents do exploration + synthesis on hard problems -- exactly the `xhigh` sweet spot.
4. **Advisor stays at `effort: high`.** Deliberate choice, against Claude Code's new default. Advisor's job is compression (under 100 words, start with "1.", no preamble) -- not exploration. `xhigh` increases tool usage, which is the opposite of what the Phase 5.1 / 5.2 maxTurns work is trying to achieve.
5. **Two docs synced to 4.7 baseline:** `README.md` (user-facing model reference + 4.7 auto-selection note) and `PROJECT.md` constraints (requirements + prompt optimization assumptions). Root `CLAUDE.md` intentionally not touched -- out of scope for this quick task.
6. **Open: empirical UAT still required.** 4.7's documented behavior changes (fewer tool calls by default, literal instruction following, task-calibrated response length) may resolve several Phase 5.1 / 5.2 open items for free. Needs measurement, not assumption.

## Changes shipped

### Agent frontmatter (commit `80f0c82`)

| File | Before | After | Rationale |
|------|--------|-------|-----------|
| `plugins/lz-advisor/agents/advisor.md` | `effort: high`, `model: opus`, `maxTurns: 3` | **Unchanged** | Synthesis task; avoid amplifying maxTurns issue |
| `plugins/lz-advisor/agents/reviewer.md` | `effort: high` | `effort: xhigh` | Code exploration + edge-case analysis -- Anthropic's stated `xhigh` sweet spot |
| `plugins/lz-advisor/agents/security-reviewer.md` | `effort: high` | `effort: xhigh` | Canonical hard, long-horizon reasoning (threat modeling) |

`model: opus` alias and `maxTurns: 3` preserved on all three agents.

### Docs (commit `7903866`)

- `plugins/lz-advisor/README.md`: updated model-tier references from "Opus 4.6" to "Opus 4.7"; added a one-line note at end of Requirements section that 4.7 is auto-selected via the `opus` alias.
- `.planning/PROJECT.md` Constraints section: updated "Requires Sonnet 4.6 and Opus 4.6" to reflect 4.7 availability; updated the "prompt optimization" note to reflect 4.7's behavior (literal instruction following, lower baseline tool usage, task-calibrated response length).

## Per-agent effort-tier recommendation (from RESEARCH.md)

| Agent | Effort | Rationale |
|-------|--------|-----------|
| advisor | `high` | 4.7's lower baseline tool usage + stricter instruction following expected to fix the Phase 5.1 / 5.2 preamble waste WITHOUT changing effort. Synthesis-first task under 100 words -- does not benefit from `xhigh`'s exploration budget. Only raise to `xhigh` if UAT shows weak synthesis on hard consultations. |
| reviewer | `xhigh` | Coding/agentic use case on hard problems (cross-cutting pattern analysis). Anthropic's explicit guidance: "the best setting for most coding and agentic use cases." `xhigh` brings substantially more tool usage, which reviewer legitimately needs for claim verification. |
| security-reviewer | `xhigh` | Same rationale as reviewer, amplified. Threat modeling and attack-chain analysis are the canonical "hard, long-horizon reasoning" task Anthropic optimized 4.7 for. The "thinks more at higher effort levels, particularly on later turns" quote is especially relevant. |

## Why advisor stays at `high` (against Claude Code's new default)

Claude Code's default effort level is now `xhigh`. The plugin's advisor agent deliberately opts out by specifying `effort: high` in its frontmatter. Reasoning:

1. **Task shape:** advisor returns under 100 words of enumerated strategic guidance. That is compression, not exploration. Exploration budget is wasted effort tokens.
2. **Documented failure mode:** Phase 5.1 and 5.2 captured maxTurns exhaustion -- advisor consumes all 3 tool-use turns re-reading already-packed context instead of synthesizing. Migration guide explicitly states `xhigh` effort "show[s] substantially more tool usage in agentic search and coding" -- the exact direction we don't want for advisor.
3. **Captured lesson:** Memory feedback `feedback_advisor_fix_approach.md` -- "Fix via prompt, not maxTurns increase; batch calls and trust packed content." Escalating effort is the wrong lever for this failure mode.
4. **Anthropic permits both:** Release post quote -- "When testing Opus 4.7 for coding and agentic use cases, we recommend starting with `high` or `xhigh` effort." Both are sanctioned starting points; choose by task shape.
5. **4.7 free win:** 4.7 uses fewer tools by default than 4.6 at any effort level -- advisor gets a correctness bump at `high` without paying `xhigh`'s cost or risking tool over-reach.

If future UAT shows advisor synthesis quality suffers at `high` on hard consultations, escalate in order: (1) add positive examples to the advisor prompt (Anthropic's recommended approach for 4.7 length / tone tuning), (2) only then raise to `xhigh`.

## What 4.7 potentially fixes for free

Based on RESEARCH.md's behavior-change quotes:

| Existing issue | 4.7 behavior change | Expected impact | UAT required? |
|----------------|--------------------|-----------------| ------------ |
| advisor preamble waste (Phase 5.1/5.2) | Stricter literal instruction following -- "Begin your response with '1.' -- no preamble" taken more literally | Preamble should drop to zero without prompt changes | Yes |
| advisor maxTurns exhaustion | Fewer tool calls by default; "to use reasoning more" | Expect <=1 tool call per consultation at `effort: high` | Yes |
| reviewer verbosity drift | Task-calibrated response length | 300-word cap may need positive-example reinforcement if reviewer expands on complex findings | Yes |

## Open UAT items (follow-ups)

Ported from `RESEARCH.md` "Open Questions" section; not blockers for this quick task:

1. **Measure advisor tool-call count** in a real `/lz-advisor.execute` run on 4.7 at `effort: high`. Compare to pre-4.7 baseline from Phase 5.1 / 5.2 field tests. Keep `high` if tool calls drop to <=1 per consultation.
2. **Verify the 100-word advisor cap still fires on 4.7.** 4.7 calibrates length to task complexity -- a strict cap may need a positive one-shot example if the cap starts being ignored on harder consultations. Per Anthropic: prefer positive examples over negative instructions.
3. **Verify the 300-word reviewer / security-reviewer cap still fires on 4.7 at `xhigh`.** Same concern amplified: `xhigh` + open-ended analysis tasks may expand output beyond the cap.
4. **Watch for tone drift on reviewer severity classification.** 4.7's "more direct tone" (less validation-forward phrasing) may blunt the tact the reviewer prompt intends.
5. **Confirm `model: opus` auto-routes to 4.7 on Pro and Free plan tiers.** Confirmed on Team Plan this session; README currently implies broad availability.
6. **Re-evaluate `maxTurns: 3` at `xhigh`.** `xhigh` expands thinking budget, not tool-use-round count -- 3 should remain correct -- but worth confirming on a reviewer run that hits the ceiling.

## Decisions captured for future reference

| Decision | Reason | Reversible? |
|----------|--------|-------------|
| Keep `model: opus` alias (no pin to `claude-opus-4-7`) | Alias auto-upgrades on future Opus releases; 4.7 is a direct upgrade; risks of auto-adoption are improvements for our use case | Yes -- pin to `claude-opus-4-7` later if a future Opus regresses |
| advisor at `high`, reviewers at `xhigh` | Different task shapes -- compression vs. exploration -- warrant different effort budgets | Yes -- flip advisor to `xhigh` or reviewers back to `high` in one-line frontmatter edits |
| Root `CLAUDE.md` not edited this task | User deferred; CLAUDE.md update is a separate concern (project-level rather than plugin-level) | N/A |
| No advisor prompt edits this task | 4.7's baseline improvements may resolve Phase 5.1 / 5.2 issues without prompt changes; measure before tuning | Yes -- prompt edits go through a future phase or quick task |

## Out of scope (reaffirmed)

The following were explicitly excluded by CONTEXT.md and remain unchanged by this quick task. They are listed here so future readers can see the scope boundary at a glance:

1. **Root `./CLAUDE.md`** -- not edited. User declined in the discussion phase. Revisit in a dedicated docs pass.
2. **`plugins/lz-advisor/agents/advisor.md` prompt changes** -- not edited. 4.7 baseline improvements may resolve Phase 5.1 / 5.2 issues without prompt tuning; measure first, then decide.
3. **Model pinning** -- no agent pins `claude-opus-4-7`. All three keep `model: opus` alias; auto-upgrade on future Opus releases is preferred.
4. **`maxTurns` changes** -- unchanged at 3 on all three agents. `xhigh` expands thinking budget, not tool-use round count, so 3 should remain correct. UAT can challenge this if a reviewer run hits the ceiling.
5. **`plugins/lz-advisor/skills/*/SKILL.md` edits** -- not edited. No model-specific references in skill files that require syncing per RESEARCH.md findings.
6. **`plugins/lz-advisor/references/advisor-timing.md` edits** -- not edited. No model-specific references that need syncing.

## Sources

- Primary: `260417-lhe-RESEARCH.md` (this quick task)
- Anthropic release post (2026-04-16): https://www.anthropic.com/news/claude-opus-4-7
- Anthropic migration guide (Opus 4.7 section): https://platform.claude.com/docs/en/about-claude/models/migration-guide#migrating-to-claude-opus-4-7
- Empirical probe: this session (Team Plan; model ID `claude-opus-4-7[1m]`)
