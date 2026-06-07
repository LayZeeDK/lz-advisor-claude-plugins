---
phase: 12
slug: atomic-grouped-grammar-rewrite
status: bound
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-07
bound: 2026-06-07
---

# Phase 12 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Source: 12-RESEARCH.md `## Validation Architecture`. This is a zero-runtime
> Markdown/YAML plugin; the validation backbone is the two bash budget smoke
> fixtures (Phase 11) retargeted to the grouped grammar, plus `git grep` static
> assertions. Behavioral proof (rendered output) is deferred to Phase 13.
>
> BOUND 2026-06-07: each requirement is mapped to the plan/task that satisfies
> it; the automated commands are copied into each task's `<acceptance_criteria>`.

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

- **After every task commit:** Run the relevant fixture (`bash tests/D-reviewer-budget.sh` after `reviewer.md` edits in Plan 12-01; `bash tests/D-security-reviewer-budget.sh` after `security-reviewer.md` edits in Plan 12-02).
- **After every plan wave:** Both fixtures green + `git grep -nE 'crit:|imp:|sug:|q:' plugins/lz-advisor/` clean.
- **Before `/gsd:verify-work` (phase gate, Plan 12-04 Task 2):** Both fixtures GREEN on the new grammar AND RED on the old shorthand sample (D-10 RED/GREEN proof); residue grep clean across `plugins/lz-advisor/`; `.planning/` frozen history untouched.
- **Max feedback latency:** ~2 seconds.

---

## Per-Task Verification Map (BOUND)

> Each requirement is bound to the plan + task that satisfies it. The automated
> command is copied verbatim into that task's `<acceptance_criteria>`.

| Requirement | Behavior | Test Type | Automated Command | Bound to | Status |
|-------------|----------|-----------|-------------------|----------|--------|
| RPT-01 | Reviewer emits grouped `### Critical/Important/Suggestions/Questions`, no shorthand | unit (self-extract) | `bash tests/D-reviewer-budget.sh` GREEN + `git grep -nE 'crit:\|imp:\|sug:\|q:' plugins/lz-advisor/agents/reviewer.md` empty | 12-01 T1+T2 | pending |
| RPT-02 | Security emits same headers, `[Axx]` preserved | unit | `bash tests/D-security-reviewer-budget.sh` ([Axx] assertion in FINDING_RE) + `git grep -n '\[A0' security-reviewer.md` | 12-02 T1+T2 | pending |
| RPT-03 | Continuous finding numbers across sections | unit | fixture counts `^N.`-prefixed lines across all sections; holistic example numbered 1..N contiguous | 12-01 T1 / 12-02 T1 | pending |
| RPT-04 | Empty section renders `(none)` | unit | fixture treats `(none)` as non-finding; all 4 headers present even when empty | 12-01 T1 / 12-02 T1 | pending |
| AGNT-01 | Legend + all examples rewritten; `(formerly X)` stripped | static | `git grep -nE 'formerly High\|formerly Medium\|crit:\|imp:\|sug:' plugins/lz-advisor/agents/` empty | 12-01 T1 / 12-02 T1 | pending |
| AGNT-02 | Per-section sub-caps re-scoped, aggregate intent unchanged | unit | fixture per-section budget assertions GREEN (per-section `<max_words>` mapped 1:1; aggregate `none`) | 12-01 T1+T2 / 12-02 T1+T2 | pending |
| AGNT-03 | Hedge frame, Class-2 hook, `severity=` lowercase survive | static | `git grep -c '^## Class-2 Escalation Hook$'` =1 + `'^## Hedge Marker Discipline$'` =1 per agent; `git grep -n 'severity="' plugins/lz-advisor/agents/` only lowercase | 12-01 T1 / 12-02 T1 + 12-04 T2 re-confirm | pending |
| SKILL-01 | Render-verbatim absolute; prohibition inverted; new headers contracted | static | both skills name the four severity headers + trailing section; `git grep -nE 'Reformat the .* response into severity groups' plugins/lz-advisor/skills/` empty | 12-03 T1 | pending |
| SYNC-01 | Disposition table covers every git grep hit; `.planning/` untouched | static | per-hit KEEP/CHANGE disposition documented in 12-03 SUMMARY; lowercase `severity=` + INPUT Findings template kept; residue sweep scoped to `plugins/lz-advisor/` | 12-03 T2 + 12-04 T2 | pending |
| SYNC-02 | 5-surface atomic version bump | static | `git grep -n '1\.0\.1' plugins/lz-advisor/.claude-plugin/plugin.json plugins/lz-advisor/skills/*/SKILL.md` = 5 hits; zero at `1\.0\.0` | 12-04 T1 | pending |

*Status: pending · green · red · flaky*

---

## Wave 0 Requirements

- Test INFRASTRUCTURE: none missing — both fixtures exist (Phase 11) with `--self-test`, `--from-trace`, and anti-vacuous `matched_count >= 5` guards.
- Wave 0 WORK item (in-scope Phase 12, D-10): the fixtures currently parse the OLD grammar (green on HEAD). The retarget (header-tracking parser + self-extract sentinel `^> ### Critical$` + new self-test sample) is committed in the SAME wave as the agent rewrite (Plan 12-01 Task 2 retargets the reviewer fixture in lockstep with 12-01 Task 1; Plan 12-02 Task 2 retargets the security fixture in lockstep with 12-02 Task 1). RED/GREEN proof: new parser RED on the old shorthand sample, GREEN on the new grouped sample. **wave_0_complete: true** — the retarget is bound to Wave 1 alongside the agent rewrites, not a separate prerequisite.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions | Bound to |
|----------|-------------|------------|-------------------|----------|
| Render-verbatim contract names the four severity headers + trailing analytical section as the literal headers that must reach the user | SKILL-01 | Prose-contract change in SKILL.md; no automated assertion of intent | Read review/SKILL.md + security-review/SKILL.md Phase-3 render step; confirm the four `### Critical/Important/Suggestions/Questions` + `### Cross-Cutting Patterns` (reviewer) / `### Threat Patterns` (security) are named as protected verbatim headers and the "Reformat into severity groups" prohibition is inverted | 12-03 T1 |
| Class-2 Escalation Hook + Hedge Marker Discipline sections survive byte-intact | AGNT-03 | Section-presence + intent check | Confirm `## Class-2 Escalation Hook` and `## Hedge Marker Discipline` sections present in both agents post-edit (grep count =1 each, automated in 12-01/12-02/12-04) | 12-01 T1 / 12-02 T1 / 12-04 T2 |
| Rendered behavioral proof (grouped headers reach user-facing output) | GATE-02 | Requires live `claude -p` session | Deferred to Phase 13 — headless UAT against the dedicated worktree; grep the captured `--output-format stream-json` RAW agent text (terminal renderer strips `###`), n>=3 per-section budget measurement | Phase 13 |

---

## Validation Sign-Off

- [x] All requirements have an automated fixture/grep assertion or an explicit manual-only entry
- [x] Sampling continuity: every agent-file edit task runs its fixture before commit
- [x] Wave 0 retarget (D-10) committed in the same wave as the agent rewrite (12-01 T2, 12-02 T2)
- [x] No watch-mode flags (fixtures are one-shot)
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter (planner bound tasks to this map)

**Approval:** bound 2026-06-07 (planner)
