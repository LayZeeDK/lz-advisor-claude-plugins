# Phase 14: lz- skill rename - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md -- this log preserves the alternatives considered.

**Date:** 2026-06-14
**Phase:** 14-lz-skill-rename
**Mode:** `--auto --chain --analyze` (autonomous; recommended option auto-selected per area; trade-off tables logged for audit)
**Areas discussed:** Rename mechanics, Cross-ref sweep taxonomy, Eval-tree disposition, git grep gate precision, Phase 14/15 boundary

---

## Rename Mechanics (atomicity + history)

| Option | Description | Selected |
|--------|-------------|----------|
| Atomic coherent unit (`git mv` + frontmatter + sweep together; gate at HEAD) | Repo never half-renamed; history preserved; gate meaningful | [X] (recommended) |
| Staged across milestones (dirs first, refs later) | Lower per-commit blast radius | |
| Delete + recreate dirs | Simplest mechanically | (rejected -- loses git history) |

**Auto-selected:** Atomic coherent unit, `git mv` for history (Phase 9 precedent).
**Notes:** Task/commit split within the unit left to the planner; invariant is "HEAD fully renamed + gate-green."

## Cross-Reference Sweep Taxonomy

| Option | Description | Selected |
|--------|-------------|----------|
| 3-class taxonomy (MUST-change / accuracy / looks-relevant-but-NOT) grounded by scout | Reuse PROJECT.md classes, verify each against the actual tree | [X] (recommended) |
| Blanket find-and-replace of bare names | Fast but corrupts prose, `/plans/`, agent refs, eval triggers | (rejected) |

**Auto-selected:** 3-class taxonomy, grounded. Confirmed in-plugin surface = 4 `name:` + 4 dirs + README/SKILL/reference slash+prose; agents carry zero skill refs; `.planning/` frozen history excluded.
**Notes:** Trap line (SKILL.md 56/59/57/58) mixes `/plan` (rename), `@plans//plans/` (leave), "filename contains `plan`" (leave).

## Eval-Tree Disposition (RENAME-03 "eval workspace references" vs PROJECT.md "eval JSON = NOT")

| Option | Description | Selected |
|--------|-------------|----------|
| Split: leave triggers/filenames/historical prose; update only runnable invocation prefixes | Honors RENAME-03 for genuinely-runnable refs, protects test substrate | [X] (recommended) |
| Update everything under `evals/` | Literal reading of "eval workspace references" | (rejected -- corrupts NL trigger queries) |
| Leave all of `evals/` | Literal reading of PROJECT.md "looks-relevant-but-NOT" | (rejected -- conciseness-assessment.md prompts are runnable) |

**Auto-selected:** Split (D-07 a/b/c/d). `evals/` is outside the hard gate either way.
**Notes:** Resolves the requirement-vs-context tension empirically: `conciseness-assessment.md` lines 18/31/45/59 = runnable -> update; `*-eval.json` triggers + filenames + `optimization-results.md` historical prose -> leave.

## git grep Closing Gate Precision

| Option | Description | Selected |
|--------|-------------|----------|
| Identifier-form gate (frontmatter / paths / un-prefixed slash / qualified) + positive `lz-*` assertions, pathspec-scoped | Non-vacuous, no false positives on prose | [X] (recommended) |
| Naive word search (`git grep "review"`) | Impossible to reach zero; floods on English prose | (rejected) |

**Auto-selected:** Identifier-form gate scoped to `plugins/lz-advisor/` (D-08).
**Notes:** Must NOT flag prose, `/plans/`, "filename contains `plan`", or agent `lz-advisor:advisor`.

## Phase 14 / Phase 15 Boundary

| Option | Description | Selected |
|--------|-------------|----------|
| Phase 14 = rename + accuracy sweep only; all version/release work -> Phase 15 | Clean separation; matches REQUIREMENTS REL split | [X] (recommended) |
| Fold the version bump into Phase 14 | Fewer phases | (rejected -- REL-01/02/03 are Phase 15) |

**Auto-selected:** Strict boundary (D-09). No 5-surface bump, no CHANGELOG/What's-New 2.0.0 entry in Phase 14.

---

## Claude's Discretion

- Task/commit breakdown within the atomic rename unit (planner decides).
- Exact gate implementation syntax (per-pattern `git grep -E` vs combined alternation; committed script vs inline commands).

## Deferred Ideas

- Renaming eval filenames / workspace directories to the `lz-` form -- optional housekeeping, not required for the shadowing fix; deferred.

### Reviewed Todos (not folded)
- **Research RTK command suitability for skills and agents** (score 0.6) -- reviewed, NOT folded. Generic keyword match only; RTK token-savings research is orthogonal to a mechanical rename. Folding would breach the scope guardrail. Stays in backlog (STATE.md Deferred Items). Logged as an explicit override of the `--auto` fold-at-0.4 default.
