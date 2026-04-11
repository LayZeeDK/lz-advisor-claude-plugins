# Phase 3: Execute Skill - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md -- this log preserves the alternatives considered.

**Date:** 2026-04-11
**Phase:** 03-execute-skill
**Areas discussed:** Plan input mechanism, Durability before final review, Advisor call flow, Reference file strategy

---

## Plan Input Mechanism

| Option | Description | Selected |
|--------|-------------|----------|
| Both (auto-detect + user mention) | Auto-detect plan-*.md in project root (most recent if multiple), but if user mentions a specific file path in their request, use that instead. No plan found = orient from scratch. | |
| Auto-detect only | Executor looks for plan-*.md files. If found, use as input. If not, proceed without. User never specifies a path. | |
| User mentions path | Executor checks if user referenced a plan file in their request. No auto-detection. Clean but more friction. | |
| User-mention via @ reference (Other) | User explicitly passes a plan file via @ file reference syntax (e.g., /lz-advisor.execute @plans/add-favicon.plan.md). No auto-detection. | x |

**User's choice:** User-mention only via `@` file reference. Example: `/lz-advisor.execute @plans/add-favicon.plan.md`
**Notes:** User also raised that plan files in project root is messy. Decided to change plan output location to `plans/<task-slug>.plan.md`. This requires updating the plan skill (Phase 2 artifact).

---

## Durability Before Final Review

| Option | Description | Selected |
|--------|-------------|----------|
| Git commit | Executor writes files AND commits before final advisor call. Matches advisor-timing.md guidance. Deliverable survives session loss during the Opus call. | x |
| File writes only | Executor writes all files but does NOT commit. User reviews and commits after the final advisor review. Cleaner git history but vulnerable to session loss. | |
| Executor judges | Skill says 'make deliverable durable' without prescribing mechanism. Executor decides per task. | |

**User's choice:** Git commit with `git add` mentioning specific files rather than all unstaged changes.
**Notes:** Aligns with global CLAUDE.md rule: never use `git add .`, `git add -A`, or `git add -u`.

---

## Advisor Call Flow

| Option | Description | Selected |
|--------|-------------|----------|
| All 4, executor judges | Match the API pattern: describe all 4 moments in the skill prompt, let executor judge which apply per task. advisor-timing.md already has the guidance; SKILL.md reinforces it in the workflow structure. | x |
| 2 mandatory + conditional | Explicitly separate 'always do' (before work, before done) from 'if needed' (stuck, approach change). More structured but diverges from how the API expresses it. | |
| Hard cap: 2-4 with triggers | Explicit budget with specific trigger conditions for each moment. Most predictable cost but most rigid. | |

**User's choice:** All 4, executor judges -- matching the API advisor tool pattern.
**Notes:** User asked to consult the Anthropic API advisor tool docs for the closest-to-API approach. The API uses system prompt guidance (not enforcement) with all 4 moments described. `max_uses` provides optional cost ceiling separate from timing logic.

---

## Reference File Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Duplicate per skill | Copy advisor-timing.md into each skill's references/ directory. Follows the official convention exactly. 4 copies for 4 skills. | |
| Shared references/ at plugin root | Move to a plugin-root references/ directory. All skills reference the single copy. DRY but non-standard. | x |
| Duplicate + lint check | Duplicate per skill AND add a Phase 5 task to verify all copies are identical. Convention-compliant with drift protection. | |

**User's choice:** Shared `references/` directory at plugin root.
**Notes:** User asked to consult plugin-dev plugin-structure guidelines, skill-creator guidelines, and official plugin examples before deciding. Research showed: (1) official convention is per-skill references/, (2) no official plugin shares references across skills, (3) `lib/` shared pattern exists only for scripts. User chose DRY over convention given all 4 skills need the identical file.

---

## Claude's Discretion

- Exact workflow structure and section ordering in SKILL.md
- "Stuck" and "approach change" detection phrasing
- Reconciliation pattern phrasing
- Context summarization instructions for each advisor consultation

## Deferred Ideas

None -- discussion stayed within phase scope.
