---
phase: 5
slug: polish-and-marketplace-readiness
status: validated
nyquist_compliant: partial
wave_0_complete: true
created: 2026-04-13
updated: 2026-04-14
---

# Phase 5 -- Validation Strategy

> Per-phase validation contract. Updated post-execution with empirical results.

---

## Nature of the Test Surface

This plugin is a **pure Markdown/YAML** artifact with no source code. Traditional unit/integration tests do not apply. Validation relies on three mechanisms:

1. **Structural validation** (plugin-dev:plugin-validator) — checks manifest, frontmatter, directory layout
2. **Eval-based skill discoverability** — JSON query sets measuring trigger accuracy via claude-p
3. **Behavioral integration testing** — live skill invocation on realistic tasks, verifying orient-consult-produce workflow

Because there is no source code, `gsd-nyquist-auditor` has nothing to generate. Nyquist sampling instead means: every requirement has a repeatable verification path, even if some paths require human invocation.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | plugin-dev:plugin-validator (structural) + skill-creator run_loop.py (eval, requires ANTHROPIC_API_KEY) + claude -p (integration) |
| **Quick run command** | `claude --model sonnet --effort medium --plugin-dir plugins/lz-advisor -p "/lz-advisor.plan plan a simple feature" --verbose` |
| **Structural validation** | Manual invocation of plugin-dev:plugin-validator agent on plugins/lz-advisor/ |
| **Full eval suite command** | `cd ~/.claude/plugins/cache/claude-plugins-official/skill-creator/*/skills/skill-creator && python -m scripts.run_loop --eval-set <path> --skill-path <path> --model claude-sonnet-4-6 --max-iterations 5 --verbose --results-dir <path>` |
| **Estimated runtime** | ~300s per skill eval run; ~30s per skill smoke test; ~2s for structural validation |

---

## Sampling Rate

- **After every structural change:** plugin-dev:plugin-validator (manual or on-demand)
- **After description changes:** claude -p smoke test for affected skill
- **Before phase completion:** All 4 skills empirically smoke-tested via live marketplace install
- **Max feedback latency:** ~30s for smoke test, ~5min for full eval suite per skill

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Command | Automated | Status | Evidence |
|---------|------|------|-------------|-----------|---------|-----------|--------|----------|
| 05-01-01 | 01 | 1 | INFRA-04 (structure) | structural | `git ls-files plugins/lz-advisor/` | yes | green | 13 files present at new location (see 05-01-SUMMARY) |
| 05-01-02 | 01 | 1 | INFRA-04 (marketplace) | structural | `cat .claude-plugin/marketplace.json \| jq .plugins[0].source` | yes | green | Returns "./plugins/lz-advisor" |
| 05-02-01 | 02 | 2 | INFRA-04 (agents) | structural | Manual plugin-dev:plugin-validator + word count | partial | green | advisor 550w, reviewer 529w, security-reviewer 621w |
| 05-02-02 | 02 | 2 | INFRA-04 (plugin load) | integration | `claude --model sonnet --effort min --plugin-dir plugins/lz-advisor -p "list skills"` | yes | green | All 4 skills discovered |
| 05-03-01 | 03 | 3 | INFRA-04 (eval queries) | structural | `python3 -c "import json; [json.load(open(f)) for f in ...]"` | yes | green | 4 valid JSON files, 20 queries each, 8-10/8-10 split |
| 05-03-02 | 03 | 3 | INFRA-04 (eval quality) | manual review | Agent-driven quality review | no | green | Reviewed in plan 05-03 Task 2 |
| 05-04-01 | 04 | 4 | INFRA-04 (descriptions) | eval pipeline | run_loop.py (requires ANTHROPIC_API_KEY; substituted with claude -p sampling) | partial | green (deviation) | Descriptions expanded to 125-130 words with 10+ triggers each |
| 05-04-02 | 04 | 4 | INFRA-04 (conciseness) | integration | `claude -p` per skill, measure advisor output tokens | yes | green | Documented in evals/lz-advisor/conciseness-assessment.md |
| 05-05-01 | 05 | 5 | INFRA-04 (final structure) | structural | plugin-dev:plugin-validator | partial | green | Manual validation passed |
| 05-05-02 | 05 | 5 | INFRA-04 (docs) | inspection | `grep -c "Cost expectations" plugins/lz-advisor/README.md` | yes | green | 0 matches (section removed); repo README exists |
| 05-05-03 | 05 | 5 | INFRA-04 (marketplace) | manual | `/plugin marketplace add` + `/plugin install` in fresh session | no | green | All 4 skills empirically verified by user on 2026-04-14 |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements (all satisfied post-execution)

- [x] `evals/lz-advisor/lz-advisor-plan-eval.json` -- 20 eval queries for plan skill
- [x] `evals/lz-advisor/lz-advisor-execute-eval.json` -- 20 eval queries for execute skill
- [x] `evals/lz-advisor/lz-advisor-review-eval.json` -- 20 eval queries for review skill
- [x] `evals/lz-advisor/lz-advisor-security-review-eval.json` -- 20 eval queries for security-review skill
- [x] `.claude-plugin/marketplace.json` -- marketplace catalog at repo root
- [x] `.gitignore` update for `evals/**/outputs/`
- [ ] ANTHROPIC_API_KEY availability -- NOT SATISFIED; `run_loop.py` substituted with `claude -p` sampling per user direction

---

## Manual-Only Verifications

Items that cannot be fully automated within this plugin's test surface:

| Behavior | Requirement | Why Manual | Test Instructions | Last Verified |
|----------|-------------|------------|-------------------|---------------|
| Plugin installs from GitHub marketplace | INFRA-04 | Requires GitHub-hosted repo + marketplace add/install flow; no headless invocation mechanism | (1) Push to GitHub main, (2) fresh session: `/plugin marketplace add LayZeeDK/lz-advisor-claude-plugins`, (3) `/plugin install lz-advisor@lz-advisor-claude-plugins`, (4) verify all 4 skills discoverable via `/lz-advisor.<name>` | 2026-04-14 (Sonnet 4.6 medium) |
| Cross-skill disambiguation in real usage | INFRA-04 | Eval queries test individual skills but real sessions have all skills loaded simultaneously | Use `claude -p` with `--plugin-dir plugins/lz-advisor` and ambiguous prompts; verify correct skill triggers | 2026-04-14 (partial -- skills triggered correctly on direct slash command form; natural-language trigger disambiguation not exhaustively tested) |
| Advisor produces substantive output (not preamble only) | (derived) | Agent transcript is not visible in terminal; requires reading `.output` file | Check `.output` file at `%TEMP%/claude/<slug>/tasks/<agentId>.output`; verify presence of substantive Msg 2 (>100 output_tokens) after preamble | 2026-04-14 (all 4 skills verified; see Phase 5.1 for preamble fix) |
| plugin-dev:plugin-validator passes | INFRA-04 | Validator is an interactive agent; no CLI wrapper exists | Invoke in Claude Code session: "Use plugin-dev:plugin-validator to validate the plugin at plugins/lz-advisor/" | 2026-04-14 (Wave 2 and Wave 5 both passed) |

---

## Known Limitations

1. **`run_loop.py` not run due to missing ANTHROPIC_API_KEY.** Description optimization was performed via `claude -p` sampling instead. Empirical skill triggering was verified but statistical eval scores (train/test split, Pass@k, Pass^k) were not computed. Phase 5.1 may run `run_loop.py` proper if API key becomes available.

2. **Preamble pattern in sub-agent transcripts.** All three agents produce a 2-4 token preamble ("Let me verify...") before substantive output in a continuation turn. Functional but wasteful (~1-4s per consultation) and UX-misleading. Scheduled for Phase 5.1 Fix A.

3. **No re-runnable test suite.** Each verification requires human invocation of `claude -p` or interactive Claude Code session. A small test runner script is worth considering for Phase 5.2+ if the plugin evolves further.

---

## Validation Sign-Off

- [x] All tasks have automated OR manual-only verification paths documented
- [x] Sampling continuity: structural checks can run between every commit; smoke tests between waves
- [x] Wave 0 covers all dependency references (only ANTHROPIC_API_KEY unsatisfied; workaround applied)
- [x] No watch-mode flags in test commands
- [x] Feedback latency under 300s per skill
- [x] `nyquist_compliant: partial` -- reflects the inherent manual-only surface (marketplace install, plugin-validator) inherent to Markdown/YAML plugins

**Approval:** Validated 2026-04-14

---

## Validation Audit 2026-04-14

| Metric | Count |
|--------|-------|
| Tasks mapped | 11 |
| Status: green | 11 |
| Status: red | 0 |
| Status: pending | 0 |
| Automated (yes) | 6 |
| Partially automated | 3 |
| Manual-only | 2 |
| Gaps generated | 0 (no source code; gsd-nyquist-auditor not applicable) |
| Requirements satisfied | INFRA-04 (with deviation from run_loop.py to claude -p) |

**Classification rationale:** `nyquist_compliant: partial` rather than `true` because the two final-gate verifications (marketplace install, plugin-validator agent invocation) are inherently manual for Markdown/YAML plugins. All other paths are automatable or were automated. No gsd-nyquist-auditor was spawned because there are no code paths to generate tests against.
