---
phase: 12
slug: atomic-grouped-grammar-rewrite
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-07
---

# Phase 12 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Source: 12-RESEARCH.md `## Validation Architecture`. This is a zero-runtime
> Markdown/YAML plugin; the validation backbone is the two bash budget smoke
> fixtures (Phase 11) retargeted to the grouped grammar, plus `git grep` static
> assertions. Behavioral proof (rendered output) is deferred to Phase 13.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | bash + coreutils smoke fixtures (no test runner; self-contained scripts) |
| **Config file** | none — `tests/D-reviewer-budget.sh`, `tests/D-security-reviewer-budget.sh` are standalone |
| **Quick run command** | `bash tests/D-reviewer-budget.sh` (exits 0 green / 1 red) |
| **Full suite command** | `bash tests/D-reviewer-budget.sh && bash tests/D-security-reviewer-budget.sh` |
| **Estimated runtime** | ~2 seconds total |

---

## Sampling Rate

- **After every task commit:** Run the relevant fixture (`bash tests/D-reviewer-budget.sh` after `reviewer.md` edits; `bash tests/D-security-reviewer-budget.sh` after `security-reviewer.md` edits).
- **After every plan wave:** Both fixtures green + `git grep -nE 'crit:|imp:|sug:| q:' plugins/lz-advisor/` clean (fixtures' own SEV-history comments excepted).
- **Before `/gsd:verify-work`:** Both fixtures GREEN on the new grammar AND RED on the old shorthand sample (D-10 RED/GREEN proof); residue grep clean across `plugins/lz-advisor/`.
- **Max feedback latency:** ~2 seconds.

---

## Per-Task Verification Map

> Task IDs are assigned by the planner. This map is requirement-keyed; the
> planner binds each requirement to the task(s) that satisfy it and copies the
> automated command into the task's `<acceptance_criteria>`.

| Requirement | Behavior | Test Type | Automated Command | File Exists | Status |
|-------------|----------|-----------|-------------------|-------------|--------|
| RPT-01 | Reviewer emits grouped `### Critical/Important/Suggestions/Questions`, no shorthand | unit (self-extract) | `bash tests/D-reviewer-budget.sh` GREEN + `git grep -nE 'crit:\|imp:\|sug:\|q:' plugins/lz-advisor/agents/reviewer.md` empty | retarget needed | pending |
| RPT-02 | Security emits same headers, `[Axx]` preserved | unit | `bash tests/D-security-reviewer-budget.sh` ([Axx] assertion in FINDING_RE) | retarget needed | pending |
| RPT-03 | Continuous finding numbers across sections | unit | fixture counts `^N.`-prefixed lines across all sections; ordinals 1..N contiguous | retarget needed | pending |
| RPT-04 | Empty section renders `(none)` | unit | fixture treats `(none)` as non-finding; all 4 headers present even when empty | retarget needed | pending |
| AGNT-01 | Legend + all examples rewritten; `(formerly X)` stripped | static | `git grep -nE 'formerly High\|formerly Medium\|crit:\|imp:\|sug:' plugins/lz-advisor/agents/` empty | self-extract + grep | pending |
| AGNT-02 | Per-section sub-caps re-scoped, aggregate intent unchanged | unit | fixture per-section budget assertions GREEN | retarget needed | pending |
| AGNT-03 | Hedge frame, Class-2 hook, `severity=` lowercase survive | static | `git grep -n 'severity="' plugins/lz-advisor/agents/` only lowercase; Class-2/Hedge sections present | grep + manual | pending |
| SKILL-01 | Render-verbatim absolute; prohibition inverted; new headers contracted | static | manual read of review/security-review SKILL.md Phase 3; new headers named as literal verbatim headers | manual | pending |
| SYNC-01 | Disposition table covers every git grep hit; `.planning/` untouched | static | RESEARCH.md disposition table; residue sweep scoped to `plugins/lz-advisor/` | manual + grep | pending |
| SYNC-02 | 5-surface atomic version bump | static | `git grep -n '1\.0\.1' plugins/lz-advisor/.claude-plugin/plugin.json plugins/lz-advisor/skills/*/SKILL.md` = 5 hits | grep | pending |

*Status: pending · green · red · flaky*

---

## Wave 0 Requirements

- Test INFRASTRUCTURE: none missing — both fixtures exist (Phase 11) with `--self-test`, `--from-trace`, and anti-vacuous `matched_count >= 5` guards.
- Wave 0 WORK item (in-scope Phase 12, D-10): the fixtures currently parse the OLD grammar (green on HEAD). The retarget (header-tracking parser + self-extract sentinel `^> ### Critical$` + new self-test sample) is committed in the SAME atomic unit as the agent rewrite. RED/GREEN proof: new parser RED on the old shorthand sample, GREEN on the new grouped sample.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Render-verbatim contract names the four severity headers + trailing analytical section as the literal headers that must reach the user | SKILL-01 | Prose-contract change in SKILL.md; no automated assertion | Read review/SKILL.md + security-review/SKILL.md Phase-3 render step; confirm the four `### Critical/Important/Suggestions/Questions` + `### Cross-Cutting Patterns` (reviewer) / `### Threat Patterns` (security) are named as protected verbatim headers and the "Reformat into severity groups" prohibition is inverted |
| Class-2 Escalation Hook + Hedge Marker Discipline sections survive byte-intact | AGNT-03 | Section-presence + intent check | Confirm `## Class-2 Escalation Hook` and `## Hedge Marker Discipline` sections present in both agents post-edit |
| Rendered behavioral proof (grouped headers reach user-facing output) | GATE-02 | Requires live `claude -p` session | Deferred to Phase 13 — headless UAT against the dedicated worktree; grep the captured `--output-format stream-json` RAW agent text (terminal renderer strips `###`), n>=3 per-section budget measurement |

---

## Validation Sign-Off

- [ ] All requirements have an automated fixture/grep assertion or an explicit manual-only entry
- [ ] Sampling continuity: every agent-file edit task runs its fixture before commit
- [ ] Wave 0 retarget (D-10) committed in the same atomic unit as the agent rewrite
- [ ] No watch-mode flags (fixtures are one-shot)
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter (after planner binds tasks to this map)

**Approval:** pending
