---
phase: 9
slug: rename-skills
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-01
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
>
> Phase 9 is a mechanical rename. Most surfaces are statically grep-verifiable (occurrence
> counts -> 0). The ONE genuine behavioral contract is the D-08 headless resolution probe:
> proving the renamed `/lz-advisor:<skill>` qualified form resolves to the plugin skill
> (not Claude Code's built-in `/review` / `/security-review`) before the documented
> invocation strings are committed. Source: 09-RESEARCH.md "Validation Architecture".

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `claude -p` headless invocation + `stream-json` grep (project convention, CLAUDE.md "Skill Verification with `claude -p`"). No unit-test runner -- pure Markdown/YAML plugin. Static surfaces verified with `git grep -o`. |
| **Config file** | none -- invocation convention documented in CLAUDE.md |
| **Quick run command** | `git grep -n -E "lz-advisor\.(plan\|execute\|review\|security-review\|<)" -- <touched surface>` (expect empty) |
| **Full suite command** | 4-skill D-08 probe loop + the 5 canonical `git grep` verification commands (09-RESEARCH.md "Recommended canonical verification commands") |
| **Estimated runtime** | git grep checks ~seconds; each D-08 `claude -p` probe ~1-3 min (4 skills) |

---

## Sampling Rate

- **After every task commit:** Run the per-surface `git grep` zero-residual check for the surfaces touched by that task (expect empty).
- **After every plan wave:** Run the full 4-skill D-08 probe + all 5 canonical verification commands.
- **Before `/gsd-verify-work`:** Full suite must be green -- 132 textual occurrences (111 operational + 21 smoke) -> 0; 5 version surfaces at 0.15.0 (zero 0.14.2); 362 frozen `.planning/` files unchanged; 4 invariant `Agent(lz-advisor:<agent>)` lines intact; at least one updated smoke fixture re-run green.
- **Max feedback latency:** git grep checks < 5 s; D-08 probe loop < 12 min.

---

## Per-Task Verification Map

> Task IDs are illustrative (planner assigns final IDs). The D-08 probe is one step run AFTER
> the rename + version bump but BEFORE the documented invocation strings are committed.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 9-rename-dirs | plugin | 1 | D-02/D-05 | — | N/A | smoke (filesystem) | `test -d plugins/lz-advisor/skills/plan && test ! -d plugins/lz-advisor/skills/lz-advisor.plan` | ✅ (git mv) | ⬜ pending |
| 9-content-sweep | plugin | 1 | D-01/D-04/D-09 | — | N/A | static | `git grep -n -E "lz-advisor\.(plan\|execute\|review\|security-review\|<)" -- 'plugins/lz-advisor/' 'CLAUDE.md' '.gitignore' 'evals/lz-advisor/'` (expect empty) | ✅ existing tree | ⬜ pending |
| 9-version-sync | plugin | 1 | D-10 | — | N/A | static | `git grep -n "0\.14\.2" -- 'plugins/lz-advisor/.claude-plugin/plugin.json' 'plugins/lz-advisor/skills/*/SKILL.md'` (expect empty); `... "0\.15\.0"` -> 5 hits | ✅ | ⬜ pending |
| 9-agent-invariant | plugin | 1 | D-03 | — | Agent refs unchanged | static | `git grep -c -E "Agent\(lz-advisor:(advisor\|reviewer\|security-reviewer)\)" -- 'plugins/lz-advisor/skills/*/SKILL.md' \| wc -l` -> 4 | ✅ | ⬜ pending |
| 9-d08-probe-plan | probe | 2 | D-08 | — | `/lz-advisor:plan` resolves to plugin skill | smoke (resolution) | `claude --model sonnet --permission-mode auto --plugin-dir plugins/lz-advisor -p "/lz-advisor:plan say hello and stop" --verbose --output-format stream-json \| rg -F '<command-name>/lz-advisor:plan</command-name>'` (>=1 match) | created this phase | ⬜ pending |
| 9-d08-probe-execute | probe | 2 | D-08 | — | `/lz-advisor:execute` resolves | smoke | same for `execute` | created | ⬜ pending |
| 9-d08-probe-review | probe | 2 | D-08 | — | `/lz-advisor:review` resolves to plugin, NOT built-in `/review` | smoke | same for `review`; success = `<command-name>/lz-advisor:review</command-name>` present (NOT bare `/review`) | created | ⬜ pending |
| 9-d08-probe-secrev | probe | 2 | D-08 | — | `/lz-advisor:security-review` resolves to plugin, NOT built-in | smoke | same for `security-review` | created | ⬜ pending |
| 9-smoke-regression | smoke | 2 | D-05 | — | Maintained gate fires with new qualified `-p` strings | smoke (regression) | `bash .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/DEF-response-structure.sh` | exists (updated) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] No new test infrastructure file required -- the D-08 probe is a one-off executor step run during execution (not a committed test file).
- [ ] No framework install needed -- the plugin is Markdown/YAML; the `claude` CLI is already the verification harness.
- [ ] Existing smoke-test infrastructure under `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/` covers the regression-gate dimension once the `-p` invocation strings are updated to the qualified form.

*Existing infrastructure covers all phase verification; Wave 0 is a no-op for this phase.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Bare interactive `/review` / `/security-review` picker disambiguates the built-in collision via plugin name in each item's description | D-07 (A2) | Interactive skill-picker behavior cannot be asserted from a headless `claude -p` stream-json; no picker exists in headless mode | In an interactive Claude Code session with the plugin loaded, type `/review` and `/security-review`; confirm the picker lists the `lz-advisor` plugin entry with its plugin name shown. Optional per Claude's Discretion -- the mandatory gate is the headless qualified-form D-08 probe. |

---

## Validation Sign-Off

- [ ] All tasks have an automated verify (static `git grep` or `claude -p` probe) or are Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (none -- no new infra)
- [ ] No watch-mode flags
- [ ] Feedback latency < 720 s (D-08 probe loop)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
