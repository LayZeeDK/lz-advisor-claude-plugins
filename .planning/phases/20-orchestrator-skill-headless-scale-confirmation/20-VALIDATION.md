---
phase: 20
slug: orchestrator-skill-headless-scale-confirmation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-19
---

# Phase 20 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution. Draft skeleton created by plan-phase; the per-task map + Wave 0 gaps are filled during execution/validate-phase from RESEARCH.md's `## Validation Architecture` section.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | node:test (FILE-form only; host quirk -- never the dir form) + headless `claude -p --output-format stream-json` empirical gates |
| **Config file** | none for the plugin tree (zero-dep); eval/ has its own package.json |
| **Quick run command** | `node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs` |
| **Full suite command** | `node --test <each .test.mjs file>` (plugin tree) + `cd eval && node --test <each .test.mjs>` (eval tree) |
| **Estimated runtime** | ~plugin tree seconds; eval tree tens of seconds |

---

## Sampling Rate

- **After every task commit:** Run the quick run command
- **After every plan wave:** Run the full suite command
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** seconds (deterministic node:test) + the SC-5 headless spike (minutes, one-shot)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 20-01-01 | 01 | 1 | (filled during planning) | T-20-01 / -- | (expected secure behavior or N/A) | unit | `(command)` | [ ] W0 | [ ] pending |

*Status: [ ] pending - [OK] green - [X] red - [WARN] flaky*

---

## Wave 0 Requirements

- [ ] (filled from RESEARCH.md Validation Architecture: additive aggregator/schema fixtures, the SC-5 trace-parse harness, the live-cert harness gates)

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Live over-refusal + full-WORKS certification (blocking spend) | VERIF-05 / SC-6 | Spends real Claude pool + Copilot AI Credits; human-authorized blocking checkpoint (D-07) | Pre-register the lock rule, freeze N/ceilings/estimator, run the staged spend, RAISE the verdict |
| SC-5 packaged-skill headless concurrency | COST-03 / SC-5 | Requires a real `claude -p` packaged run; trace-parsed | Run the packaged skill headless, parse the stream-json for max-in-flight <=5 across >=3 waves |

*If none: "All phase behaviors have automated verification."*

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency bounded
- [ ] `nyquist_compliant: true` set in frontmatter (post-execution)

**Approval:** pending
