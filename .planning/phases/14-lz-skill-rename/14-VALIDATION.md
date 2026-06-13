---
phase: 14
slug: lz-skill-rename
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-14
---

# Phase 14 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> This is a PURELY MECHANICAL rename. Validation is deterministic SHELL ASSERTIONS
> (`git grep`, `git ls-files`, `git log --follow`), NOT unit tests -- there is no code
> to unit-test. The git-grep gate IS the regression test.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Deterministic shell assertions (`git grep`, `git ls-files`, `git log --follow`). No JS/Python test runner -- no code in this phase. |
| **Config file** | none -- inline verification commands (planner MAY commit an optional `tests/`-style gate script per D-08 discretion; not required). |
| **Quick run command** | the 5-pattern negative gate + 2 positive assertions (see Closing Gate below) |
| **Full suite command** | full gate + A1/A2 positive assertions + `git log --follow` history check for all 4 moved SKILL.md |
| **Estimated runtime** | ~5 seconds |

**arm64 hazard (RESEARCH.md, verified live 4x):** `git grep '/plan'` returns EXIT 1 / zero on this machine even when `/plan` is present. Every leading-slash gate pattern MUST use a bracketed `[/]` (e.g. `[/]plan`), never a bare `/plan`. A naive bare-slash pattern silently false-GREENs.

---

## Closing Gate (the primary regression test)

Scope ALL patterns with `-- plugins/lz-advisor/`. Each negative pattern must return EXIT 1 (zero hits) ONLY when the rename is complete.

- **P1 (frontmatter):** `git grep -nE '^name: (plan|execute|review|security-review)$' -- plugins/lz-advisor/` -> zero (pre-rename: 4 hits)
- **P2 (qualified):** `git grep -nE 'lz-advisor:(plan|execute|review|security-review)([^a-z-]|$)' -- plugins/lz-advisor/` -> zero (already 0; Phase 9 clean)
- **P3 (un-prefixed slash, arm64-safe brackets):** `git grep -nE '[/](plan|execute|review|security-review)([^a-z-]|$)' -- plugins/lz-advisor/` then exclude `[/]lz-` and `[/]plans/` -> zero non-prefixed hits (pre-rename: README + SKILL bodies + references)
- **P4 (skills path):** `git grep -nE 'skills/(plan|execute|review|security-review)/' -- plugins/lz-advisor/` -> zero
- **P5 (directory-form SKILL.md cross-ref -- RESEARCH GAP-1, the one CONTEXT.md missed):** `git grep -nE '(^|[^a-z-])(plan|execute|review|security-review)/SKILL\.md' -- plugins/lz-advisor/` -> zero (pre-rename: 5 hits at `agents/reviewer.md:388`, `agents/security-reviewer.md:410`, `references/context-packaging.md:373/417/418`; the post-rename `lz-review/SKILL.md` form is excluded by the `[^a-z-]` lead)
- **A1 (positive -- dirs exist):** `test "$(git ls-files 'plugins/lz-advisor/skills/lz-*/SKILL.md' | wc -l)" -eq 4`
- **A2 (positive -- frontmatter renamed):** `git grep -cE '^name: lz-(plan|execute|review|security-review)$' -- plugins/lz-advisor/` resolves to the 4 files

The gate MUST NOT flag: English prose "plan"/"review", `@plans/` / `/plans/` paths, the literal "filename contains `plan`", or the agent NAME ref `lz-advisor:advisor`.

---

## Sampling Rate

- **Per edit/commit:** run P3 + P5 scoped to the file(s) just touched (fast feedback on the trap line + dangling dir-form refs).
- **Per atomic-unit completion** (the single HEAD that must be gate-green): full 5-pattern negative gate + A1/A2 positive + `git log --follow` history check.
- **Before `/gsd:verify-work`:** full gate GREEN AND the human_needed interactive-picker check completed (or formally returned as human_needed).
- **Max feedback latency:** ~5 seconds.

---

## Per-Task Verification Map

> Filled by the planner against the actual task IDs. Requirement -> validation mapping:

| Requirement / SC | Behavior | Test Type | Automated Command | Status |
|------------------|----------|-----------|-------------------|--------|
| RENAME-01 / SC-1 | 4 dirs + `name:` `lz-`-prefixed via `git mv` | positive shell assertion | A1 + A2 | pending |
| RENAME-01 / SC-1 | history preserved across the move | history assertion | `git log --follow --oneline -- plugins/lz-advisor/skills/lz-<skill>/SKILL.md` resolves back through Phase 9 rename commit `d88df91` for all 4 | pending |
| RENAME-03 / SC-2 | zero old-name identifier hits under `plugins/lz-advisor/` | negative gate (PRIMARY) | P1..P5 each EXIT 1 | pending |
| RENAME-03 / SC-3 | doc refs updated for accuracy (READMEs, CLAUDE.md, .gitignore, evals) | inspection + in-plugin gate | gate covers plugin README + SKILL.md + references; `CLAUDE.md` / `.gitignore` / `evals/conciseness-assessment.md` verified by inspection; PROJECT.md = NO edit (`:24` already uses target form) | pending |
| RENAME-02 / SC-4 | built-in `/plan` / `/review` / `/security-review` no longer shadowed | **MANUAL -- interactive picker; CANNOT be auto-validated** | none (see Manual-Only) | pending (human_needed) |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

*None. No test infrastructure to scaffold -- the validation is git-native shell assertions that exist today. (Optional: the planner MAY commit a `tests/`-style gate script per D-08 discretion; not required.)*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Built-in `/plan` / `/review` / `/security-review` no longer shadowed by the plugin | RENAME-02 / SC-4 | Headless `claude -p` probes are structurally blind to bare-form collisions (memory `project_headless_probe_misses_bare_form_collisions`; Phase 9 D-08). Only the interactive command picker disambiguates bare forms. | In an interactive `claude` session with the plugin loaded: type `/plan`, `/review`, `/security-review` and confirm the picker surfaces the Claude Code BUILT-IN (no lz-advisor entry shadowing the bare name). Then confirm `/lz-plan` / `/lz-execute` / `/lz-review` / `/lz-security-review` resolve to the plugin skills. |

---

## Validation Sign-Off

- [x] All requirements have an automated shell assertion OR are explicitly marked human_needed (RENAME-02)
- [x] Sampling continuity: the gate runs per-commit and per-unit (no blind stretches)
- [x] Wave 0 covers all MISSING references (none -- git-native assertions exist today)
- [x] No watch-mode flags (gate is one-shot)
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
