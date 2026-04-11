---
phase: 02-plan-skill
reviewed: 2026-04-11T18:30:00Z
depth: standard
files_reviewed: 1
files_reviewed_list:
  - skills/lz-advisor-plan/SKILL.md
findings:
  critical: 1
  warning: 2
  info: 2
  total: 5
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-04-11T18:30:00Z
**Depth:** standard
**Files Reviewed:** 1
**Status:** issues_found

## Summary

Reviewed the `lz-advisor-plan` SKILL.md, a Claude Code skill definition (markdown with YAML frontmatter) that orchestrates an orient-consult-produce planning workflow using an Opus advisor agent. The YAML frontmatter is structurally valid and follows project conventions (third-person description, kebab-case naming, semver versioning). The three-phase workflow is well-structured and the instructions are clear.

However, there is one critical issue: the `allowed-tools` field restricts the executor to only the Agent tool, but the skill's own instructions require Read, Glob, and Write to function. There is also an orphaned XML closing tag and a potentially incorrect cross-reference to the execute skill.

## Critical Issues

### CR-01: allowed-tools whitelist prevents skill from functioning

**File:** `skills/lz-advisor-plan/SKILL.md:11`
**Issue:** The frontmatter declares `allowed-tools: Agent(lz-advisor:advisor)`, which restricts the executor to only the Agent tool during skill execution. However, the skill's own instructions require additional tools:
- Phase 1 (Orient, lines 26-29): "Read files relevant to the user's request" and "Examine directory structure" require **Read** and **Glob** tools.
- Phase 3 (Produce, line 65): "Write the plan to a markdown file" requires the **Write** tool.

If `allowed-tools` acts as a restrictive whitelist (which is its documented behavior in Claude Code), the executor cannot perform any of the three phases except the advisor consultation. The skill would fail at runtime.

**Fix:** Add the executor's required tools to the `allowed-tools` list:
```yaml
allowed-tools: Read, Glob, Write, Agent(lz-advisor:advisor)
```

If `allowed-tools` is instead meant to declare only the *additional* tools granted beyond defaults, and Read/Glob/Write are already available by default, then no change is needed -- but this should be verified against the Claude Code plugin runtime documentation.

## Warnings

### WR-01: Orphaned closing tag with no matching opening tag

**File:** `skills/lz-advisor-plan/SKILL.md:109`
**Issue:** Line 109 contains a `</output>` closing tag, but there is no corresponding `<output>` opening tag anywhere in the file. The three workflow phases use `<orient>`, `<consult>`, and `<produce>` tags, all properly opened and closed. This stray tag is likely a leftover from an earlier draft. While Claude's XML parsing is lenient, an unmatched closing tag could cause unpredictable behavior -- the model might interpret content after `</produce>` (lines 107-108, the instruction about passing the plan to the execute skill) as being inside an implicit `<output>` block that is immediately closed, or it might ignore the lines between `</produce>` and `</output>` depending on parsing heuristics.

**Fix:** Remove the orphaned `</output>` tag on line 109. The closing instructions on lines 107-108 should sit outside all XML blocks, which they already effectively do after `</produce>` on line 105:
```markdown
After writing the plan file, let the user know where it is. The plan can be
reviewed, edited, and then passed to `/lz-advisor.execute` for implementation.
```

### WR-02: Cross-reference to execute skill uses incorrect syntax

**File:** `skills/lz-advisor-plan/SKILL.md:108`
**Issue:** Line 108 references `/lz-advisor.execute` using dot notation. However, the project's directory structure defines the execute skill as `lz-advisor-execute` (hyphenated). The `/` prefix suggests a command invocation, but skills are not invoked via `/name` syntax in Claude Code -- that is the legacy commands pattern. If this is meant to guide users on how to proceed, the reference format may not resolve or may confuse users.

**Fix:** Use the skill's actual name in a natural-language reference rather than a pseudo-invocation syntax:
```markdown
reviewed, edited, and then used with the `lz-advisor-execute` skill for implementation.
```

## Info

### IN-01: Plan file output location could accumulate clutter at project root

**File:** `skills/lz-advisor-plan/SKILL.md:65`
**Issue:** The skill writes plan files as `plan-<task-slug>.md` to the project root directory. Over multiple planning sessions, this could accumulate many plan files at the top level of the user's project, adding noise to the root. A dedicated subdirectory (e.g., `plans/`) would keep the workspace cleaner.

**Fix:** Consider writing to a `plans/` subdirectory:
```markdown
Write to: `plans/plan-<task-slug>.md` in the project.
```

### IN-02: Reference syntax should be verified for portability

**File:** `skills/lz-advisor-plan/SKILL.md:18`
**Issue:** Line 18 uses `@references/advisor-timing.md` to include the advisor timing reference document. The project's validation checklist in CLAUDE.md states "All paths use `${CLAUDE_PLUGIN_ROOT}` (no hardcoded paths)." The `@references/` syntax appears to be a Claude Code skill-relative include convention (where `@` resolves relative to the SKILL.md's directory), which would be correct. However, if the runtime resolves `@` differently (e.g., relative to the working directory rather than the skill directory), this reference would break when the plugin is installed in a user's project.

**Fix:** Verify that `@references/advisor-timing.md` resolves relative to the SKILL.md location in the installed plugin path. If it does not, use the portable form:
```markdown
${CLAUDE_PLUGIN_ROOT}/skills/lz-advisor-plan/references/advisor-timing.md
```

---

_Reviewed: 2026-04-11T18:30:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
