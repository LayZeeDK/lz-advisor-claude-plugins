---
phase: 5
slug: polish-and-marketplace-readiness
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-13
---

# Phase 5 -- Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | skill-creator run_loop.py + plugin-dev plugin-validator |
| **Config file** | None -- scripts invoked directly |
| **Quick run command** | `claude --model sonnet --plugin-dir plugins/lz-advisor -p "/lz-advisor.plan plan a simple feature" --verbose` |
| **Full suite command** | `cd ~/.claude/plugins/cache/claude-plugins-official/skill-creator/*/skills/skill-creator && python -m scripts.run_loop --eval-set <path> --skill-path <path> --model claude-sonnet-4-6 --max-iterations 5 --verbose` |
| **Estimated runtime** | ~300 seconds per skill (4 skills = ~20 min total) |

---

## Sampling Rate

- **After every task commit:** Plugin-validator after structural changes, quick skill invocation test after description changes
- **After every plan wave:** Full run_loop.py pipeline for affected skills
- **Before `/gsd-verify-work`:** All 4 skills pass run_loop.py with improved scores + final plugin-validator pass
- **Max feedback latency:** ~300 seconds (single skill eval run)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | INFRA-04 | -- | N/A | structural | `plugin-dev:plugin-validator on plugins/lz-advisor/` | yes | pending |
| 05-01-02 | 01 | 1 | INFRA-04 | -- | N/A | eval pipeline | `python -m scripts.run_loop --eval-set <eval-json> --skill-path <skill> --model claude-sonnet-4-6 --max-iterations 5 --verbose` | Wave 0: eval JSON files | pending |
| 05-01-03 | 01 | 1 | INFRA-04 | -- | N/A | integration | `claude --model sonnet --plugin-dir plugins/lz-advisor -p "/lz-advisor.plan ..." --verbose` | yes | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `evals/lz-advisor/lz-advisor-plan-eval.json` -- 20 eval queries for plan skill
- [ ] `evals/lz-advisor/lz-advisor-execute-eval.json` -- 20 eval queries for execute skill
- [ ] `evals/lz-advisor/lz-advisor-review-eval.json` -- 20 eval queries for review skill
- [ ] `evals/lz-advisor/lz-advisor-security-review-eval.json` -- 20 eval queries for security-review skill
- [ ] `.claude-plugin/marketplace.json` -- marketplace catalog at repo root
- [ ] `.gitignore` update for `evals/**/outputs/`
- [ ] Verify ANTHROPIC_API_KEY is set in environment

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Plugin installs from GitHub marketplace | INFRA-04 | Requires GitHub-hosted repo with marketplace registration | (1) Push to GitHub, (2) `/plugin marketplace add LayZeeDK/lz-advisor-claude-plugins`, (3) `/plugin install lz-advisor@lz-advisor-claude-plugins`, (4) verify all skills appear |
| Cross-skill disambiguation in real usage | INFRA-04 | Eval pipeline tests individual skills but real usage has all skills loaded simultaneously | Use `claude -p` with `--plugin-dir plugins/lz-advisor` and ambiguous queries to verify correct skill triggers |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 300s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
