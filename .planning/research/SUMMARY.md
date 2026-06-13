# Project Research Summary

**Project:** lz-advisor
**Milestone:** v2.0.0 -- `lz-`-prefixed skill names (de-shadow Claude Code built-ins). BREAKING.
**Researched:** 2026-06-13 / 2026-06-14
**Confidence:** HIGH

## Executive Summary

v2.0.0 ships ONE feature on the existing v1.0.1 plugin (3 agents, 4 skills, 4 shared references, 5-surface version sync), plus the release that publishes it. No new technology.

**The feature:** a BREAKING skill rename -- `plan` / `execute` / `review` / `security-review` -> `lz-plan` / `lz-execute` / `lz-review` / `lz-security-review` -- fixing the bug where the bare `/plan`, `/review`, and `/security-review` skill names silently shadow Claude Code's built-in commands of the same name (the user selects the built-in from autocomplete but the plugin skill fires). All four are renamed for suite consistency and `/lz-` autocomplete grouping, even though only three collide.

**Descoped:** the originally-planned on-demand Fable advisor was removed after research + empirical probing proved subagent-Fable is blocked SERVER-SIDE by Anthropic. The API returns `404 not_found` ("Claude Fable 5 is not available. Please use Opus 4.8") for subagent/firstParty dispatch, even though interactive `/model fable` works as a primary model. The override MECHANISM is proven (opus->haiku, observable via subagent JSONL) -- only Fable ACCESS is blocked. Deferred to SEED-001; full evidence in `.planning/research/FABLE-OVERRIDE-PROBE.md`. (The detailed STACK/FEATURES/ARCHITECTURE/PITFALLS docs retain the Fable analysis as the investigation record and readiness notes for the future revisit.)

## Rename Approach (the deliverable)

- `git mv` the 4 skill directories and update the 4 `name:` frontmatter fields. The directory name drives the slash command, so the rename IS the breaking change. Qualified names become `lz-advisor:lz-plan` etc.; bare `/lz-plan`.
- **Lockstep cross-reference sweep, 3 classes** (the project has been bitten by partial renames; Phase 9 precedent):
  - **(A) MUST change:** 4 skill dirs (`git mv`, history-preserving) + 4 `name:` fields.
  - **(B) Change for accuracy:** root README + plugin README, CLAUDE.md (including the `claude -p` UAT examples and the Conventions/verification section), PROJECT.md, and any eval workspace references that name skills.
  - **(C) Looks-relevant-but-NOT:** eval JSON natural-language triggers, smoke fixtures that reference AGENT paths (not skill names), `marketplace.json` / `plugin.json` (plugin name only).
- **Closing gate:** `git grep` for the old bare skill names returns zero hits under `plugins/lz-advisor/`.
- **Bare-form collision check MUST use the INTERACTIVE picker, not a headless `claude -p` probe** -- headless is structurally blind to bare-form collisions (the Phase 9 false-positive scar). Flag as human_needed.

## Release (publishes the rename)

- Atomic 5-surface version bump 1.0.1 -> 2.0.0 (`plugin.json` + the 4 SKILL.md `version:` fields).
- `CHANGELOG.md` `[2.0.0]` entry with a `### Changed (BREAKING)` rename MIGRATION TABLE (old -> new, bare AND qualified forms) + a compare link; README "What's New" updated (current-version-only per the project convention).
- `git tag v2.0.0` + GitHub Release. (The project now publishes -- tags v1.0.0 / v1.0.1 were pushed and GitHub Releases created 2026-06-13; this is no longer deferred.)

## Suggested Phases

1. **Skill rename (BREAKING)** -- `git mv` + `name:` fields + A/B/C cross-ref sweep + closing `git grep` gate; interactive-picker bare-form collision verification (human_needed).
2. **Release** -- atomic 5-surface 1.0.1 -> 2.0.0 bump + CHANGELOG `[2.0.0]` migration table + README + `git tag v2.0.0` + GitHub Release.

(Rename + release are tightly coupled and small; the roadmapper may choose to merge them into a single phase. Continues phase numbering from 13.)

## Deferred

- **Fable advisor** (on-demand stronger-than-Opus advisor): blocked server-side; **SEED-001**; revisit when Anthropic enables Fable (or another stronger-than-Opus model) for subagent dispatch.

## Confidence

HIGH. The rename is a well-understood mechanical change with a proven Phase 9 playbook; the one nuance (bare-form collision needs interactive verification) is captured. No external/runtime unknowns remain now that Fable is descoped.
