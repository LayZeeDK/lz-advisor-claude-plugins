---
phase: 09-rename-skills
plan: 01
subsystem: plugin-skills
tags: [rename, skill-naming, version-bump, plugin-surfaces]
requires: []
provides:
  - "Four plugin skills named plain (plan, execute, review, security-review) -- directory + name: field"
  - "Zero dotted lz-advisor.<skill> references in plugins/lz-advisor/ and .gitignore"
  - "Plugin at version 0.15.0 across 5 surfaces"
affects:
  - plugins/lz-advisor/skills/plan/SKILL.md
  - plugins/lz-advisor/skills/execute/SKILL.md
  - plugins/lz-advisor/skills/review/SKILL.md
  - plugins/lz-advisor/skills/security-review/SKILL.md
  - plugins/lz-advisor/.claude-plugin/plugin.json
  - plugins/lz-advisor/references/context-packaging.md
  - plugins/lz-advisor/references/orient-exploration.md
  - plugins/lz-advisor/references/verify-target-selection.md
  - plugins/lz-advisor/agents/reviewer.md
  - plugins/lz-advisor/agents/security-reviewer.md
  - plugins/lz-advisor/README.md
  - .gitignore
tech-stack:
  added: []
  patterns:
    - "git mv for history-preserving directory renames (loop, never bulk add)"
    - "Atomic 5-surface version sync (plugin.json quoted + 4 SKILL.md bare)"
    - "Occurrence-count verification (git grep -o | wc -l), never line-count"
key-files:
  created:
    - .planning/phases/09-rename-skills/09-01-SUMMARY.md
  modified:
    - plugins/lz-advisor/skills/plan/SKILL.md
    - plugins/lz-advisor/skills/execute/SKILL.md
    - plugins/lz-advisor/skills/review/SKILL.md
    - plugins/lz-advisor/skills/security-review/SKILL.md
    - plugins/lz-advisor/.claude-plugin/plugin.json
    - plugins/lz-advisor/references/context-packaging.md
    - plugins/lz-advisor/references/orient-exploration.md
    - plugins/lz-advisor/references/verify-target-selection.md
    - plugins/lz-advisor/agents/reviewer.md
    - plugins/lz-advisor/agents/security-reviewer.md
    - plugins/lz-advisor/README.md
    - .gitignore
decisions:
  - "All dotted skill-name references in plugin surfaces became BARE forms (D-07 interactive), because no headless `claude -p` invocation string exists anywhere in these files -- the qualified colon form is reserved for CLAUDE.md/smoke-fixture `claude -p` strings owned by plan 09-02"
  - "Refs paired with /SKILL.md (agent files, context-packaging.md cross-refs) became directory-form (review/SKILL.md, security-review/SKILL.md), matching the Task 1 directory rename"
metrics:
  duration: 7min
  tasks: 3
  files: 12
  completed: 2026-06-01
---

# Phase 9 Plan 01: Plugin Skill Rename (dotted -> plain) Summary

Renamed the four plugin skills from the dotted `lz-advisor.<skill>` convention to plain `<skill>` across all `plugins/lz-advisor/` operational surfaces plus the `.gitignore` comment, and applied the atomic 5-surface version bump 0.14.2 -> 0.15.0. This reverses the Phase 5.2 naming decision (D-01/D-02): the qualified `lz-advisor:<skill>` form already supplies namespacing, so the `lz-advisor.` prefix only produced the redundant `lz-advisor:lz-advisor-<skill>` normalized name.

## What Changed

### Task 1: Directory renames (commit d88df91)

`git mv` (history-preserving) of the four skill directories:
- `skills/lz-advisor.plan/` -> `skills/plan/`
- `skills/lz-advisor.execute/` -> `skills/execute/`
- `skills/lz-advisor.review/` -> `skills/review/`
- `skills/lz-advisor.security-review/` -> `skills/security-review/`

Git tracked all four as renames (R, 100% similarity). The directory name is what drives the headless invocation `/lz-advisor:<skill>`, so this rename is the load-bearing change for the clean qualified name.

### Task 2: Content sweep (commit c21ab2f)

Rewrote every dotted `lz-advisor.<skill>` textual mention to its plain form across 11 files (68 replacements):
- 4 SKILL.md `name:` fields -> bare skill names (D-01)
- SKILL.md body trigger phrases, prose mentions, prose slash-references (e.g. `/lz-advisor.execute` -> `/execute`), and `<example>` Input invocation lines (e.g. `/lz-advisor.plan ...` -> `/plan ...`)
- `references/context-packaging.md` (25 occurrences across multi-ref lines, including the "When to Use Each Template" table and the scope-default lines)
- `references/orient-exploration.md` (4 occurrences)
- `references/verify-target-selection.md` (4 occurrences, including the L4 two-refs-on-one-line case)
- `agents/reviewer.md` + `agents/security-reviewer.md` (1 each; the `lz-advisor.<skill>/SKILL.md` cross-refs became `review/SKILL.md` / `security-review/SKILL.md`)
- `README.md` (6: the skill table rows L17-20 became bare `/plan`, `/execute`, `/review`, `/security-review`; the L93-94 changelog prose became bare names)
- `.gitignore` (1: the L11 comment `/lz-advisor.plan` -> `/plan`; the `/plans/` ignore pattern on L12 is untouched)

Invariant `Agent(lz-advisor:advisor|reviewer|security-reviewer)` lines (count 4) and all `@${CLAUDE_PLUGIN_ROOT}/references/` load paths (count 36) were left unchanged.

### Task 3: Atomic version bump (commit 9304f83)

0.14.2 -> 0.15.0 across all 5 version surfaces (plugin.json quoted `"0.15.0"`, four SKILL.md bare `version: 0.15.0`). MINOR bump signals the skill-name contract change (D-10).

## Decisions Made

1. **All dotted refs in plugin surfaces became bare interactive forms.** Per D-07, headless `claude -p` invocation strings use the qualified colon form (`/lz-advisor:<skill>`); everything else (README, prose, skill picker) uses the bare form. A grep confirmed zero `claude -p` invocation strings carrying a dotted skill ref exist anywhere in `plugins/lz-advisor/` (the one `claude -p` mention in context-packaging.md L122 is prose about the concept, not an invocation). Therefore every dotted reference in this plan's scope is interactive/prose and resolves to the bare form. The qualified colon form belongs to CLAUDE.md and the smoke fixtures, both owned by plan 09-02.

2. **Refs paired with `/SKILL.md` became directory-form.** The two agent cross-refs and three context-packaging.md cross-refs that referenced `lz-advisor.<skill>/SKILL.md` became `review/SKILL.md` / `security-review/SKILL.md`, matching the Task 1 directory rename rather than the bare skill name.

## Deviations from Plan

None - plan executed exactly as written. No Rule 1-4 deviations were needed. The D-07 bare-vs-qualified classification was resolved empirically (the no-`claude -p`-string finding above) rather than guessed, which kept the sweep mechanical.

## Verification

All plan verification commands pass:

- Zero residual dotted refs across `plugins/lz-advisor/` + `.gitignore`: `git grep -n -E "lz-advisor\.(plan|execute|review|security-review|<)" -- 'plugins/lz-advisor/' '.gitignore'` returns EMPTY (exit 1).
- Invariant Agent() lines intact: count == 4.
- `@${CLAUDE_PLUGIN_ROOT}/references/` load paths unchanged: count == 36 (baseline preserved).
- Version sync: exactly 5 hits of 0.15.0, zero 0.14.2 residue.
- 4 skill directories present at plain-name paths; dotted directories gone; git tracks the moves as renames.
- 4 SKILL.md `name:` fields are plain skill names.

## Scope Boundary Note

This plan (09-01) covers ONLY plugin operational surfaces per its `files_modified` frontmatter. CLAUDE.md (23 occurrences), eval JSON + conciseness-assessment.md + eval workspace directory renames, and the 11 maintained smoke fixtures under `.planning/phases/05.4-.../smoke-tests/` are explicitly out of scope here -- they belong to plan 09-02. The frozen historical `.planning/` artifacts (D-06) and the living root planning docs remain untouched by design.

## Self-Check: PASSED

- All 12 modified files + the SUMMARY.md verified present on disk.
- All 3 task commits (d88df91, c21ab2f, 9304f83) reachable in git history.
