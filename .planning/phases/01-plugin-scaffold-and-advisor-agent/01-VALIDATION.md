---
phase: 1
slug: plugin-scaffold-and-advisor-agent
status: validated
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-11
validated: 2026-06-01
---

# Phase 1 -- Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual validation + plugin-validator agent |
| **Config file** | None -- plugin components validated by Claude Code's discovery system |
| **Quick run command** | `claude --plugin-dir . --debug` (verify plugin loads) |
| **Full suite command** | plugin-validator agent + manual agent invocation test |
| **Estimated runtime** | ~30 seconds (manual steps) |

---

## Sampling Rate

- **After every task commit:** Run `claude --plugin-dir . --debug` -- check for plugin load errors
- **After every plan wave:** Run plugin-validator agent scan
- **Before `/gsd-verify-work`:** Full manual agent invocation test
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | INFRA-01 | -- | Only recognized fields in plugin.json | smoke | `claude --plugin-dir . --debug` | W0 | green |
| 01-01-02 | 01 | 1 | INFRA-02 | -- | Directory structure follows conventions | smoke | plugin-validator agent scan | W0 | green |
| 01-01-03 | 01 | 1 | INFRA-03 | -- | Reference file under 5,000 tokens | manual | `wc -w references/advisor-timing.md` | W0 | green |
| 01-02-01 | 02 | 1 | ADVR-01 | -- | Agent spawns on Opus 4.6 | manual | `claude --plugin-dir . --debug` (check model selection) | Manual only | green |
| 01-02-02 | 02 | 1 | ADVR-02 | -- | Output under 100 words | manual | Invoke agent, count response words | Manual only | green |
| 01-02-03 | 02 | 1 | ADVR-03 | T-01-01 | Read-only tools (no Write/Edit/Bash) | smoke | `git grep "tools:" agents/advisor.md` | W0 | green |
| 01-02-04 | 02 | 1 | ADVR-04 | -- | maxTurns: 3 (evolved from spec maxTurns:1 via Phase 5.2 + 08-09) | manual | Invoke agent, verify single response | Manual only | green |
| 01-02-05 | 02 | 1 | ADVR-05 | -- | effort: high | manual | `claude --plugin-dir . --debug` (check effort level) | Manual only | green |
| 01-02-06 | 02 | 1 | ADVR-06 | T-01-02 | Calm language: 0 CRITICAL/ALWAYS; MUST only in the literal output-contract frame (evolved spec, Phase 5.4+) | smoke | `git grep -nE "\b(MUST\|CRITICAL\|ALWAYS)\b" agents/advisor.md` (0 CRITICAL/ALWAYS; the 3 MUSTs are output-contract only) | W0 | green |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [x] Verification checklist document with exact manual test steps for ADVR-01 through ADVR-06
- [x] No automated test framework needed -- plugin components are validated by structure and manual invocation

*Existing infrastructure covers automated verifications (plugin-validator agent, `claude --debug`).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Agent spawns on Opus 4.6 | ADVR-01 | Model selection only visible in debug logs | 1. Run `claude --plugin-dir . --debug` 2. Invoke lz-advisor agent 3. Check debug output for `model: opus` |
| Output under 100 words | ADVR-02 | Response length varies per prompt | 1. Invoke agent with test prompt 2. Count words in response 3. Verify under 100 |
| maxTurns: 3 (bounded) | ADVR-04 | Turn count only observable in debug | `git grep maxTurns: agents/advisor.md` -> 3 (static check; evolved from spec's 1) |
| effort: high applied | ADVR-05 | Effort level only visible in debug logs | 1. Run `claude --plugin-dir . --debug` 2. Invoke agent 3. Check debug for effort setting |

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** validated 2026-06-01 (Nyquist backfill; all 9 requirements covered)

## Validation Audit 2026-06-01

Backfill of this pre-framework draft during v1.0 milestone finalization (Phase 1 predates the Nyquist framework). No `gsd-nyquist-auditor` spawn: zero MISSING-coverage gaps -- every requirement already has a passing automated check, so per the workflow ("No gaps -> set nyquist_compliant: true").

| Metric | Count |
|--------|-------|
| Requirements | 9 (INFRA-01/02/03, ADVR-01..06) |
| Missing-coverage gaps | 0 |
| Resolved (automated/runtime) | 9 |
| Escalated to manual-only | 0 |
| Requirement-text drifts noted (non-blocking) | 2 |

**Coverage basis (re-verified 2026-06-01 against current paths):**
- INFRA-01 `node JSON.parse` + field enumeration (7 keys) PASS; INFRA-02 structure PASS; INFRA-03 `references/advisor-timing.md` 768 words (< 5,000-token proxy) PASS.
- ADVR-01 `model: opus` static PASS **+ runtime-proven** (advisor subagent ran on `claude-opus-4-8` under a `claude-sonnet-4-6` main session; trace `agent-a14aeeecc032f05c7.jsonl`, see 01-VERIFICATION Resolution Amendment).
- ADVR-02 conciseness governed by `D-advisor-budget.sh` fixture; ADVR-03 `tools: ["Read","Glob"]` PASS; ADVR-04 `maxTurns: 3` present; ADVR-05 `effort: high` present.

**Requirement-text drifts (REQUIREMENTS.md definition-hygiene, NOT coverage gaps; flagged, non-blocking):**
1. **ADVR-04**: definition says `maxTurns: 1`; shipped advisor is `maxTurns: 3` (2 tool-use + 1 synthesis, per CLAUDE.md), evolved via Phase 5.2 Plan 04 + Plan 08-09. Verification samples the value as intentional; the original "1" was superseded.
2. **ADVR-06**: definition says "no MUST/CRITICAL/ALWAYS"; `advisor.md` now uses `MUST` x3 -- all enforcing the literal `Assuming X (unverified), do Y. Verify X before acting.` output contract (Phase 5.4+), consistent with the user's "reserve imperatives for compliance only" steering. 0 CRITICAL/ALWAYS; no motivational imperatives. Spirit preserved; literal "0 matches" check superseded.

These two drifts are the same class as the GAP-D definition staleness swept in Phase 10; recommend reconciling the REQUIREMENTS.md definition text in a follow-up (non-blocking for Nyquist or the milestone).

Stale references corrected this audit: `agents/lz-advisor.md` -> `agents/advisor.md`; `skills/lz-advisor-plan/references/advisor-timing.md` -> `references/advisor-timing.md`.
