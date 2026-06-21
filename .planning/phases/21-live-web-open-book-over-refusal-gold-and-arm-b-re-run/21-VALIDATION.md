---
phase: 21
slug: live-web-open-book-over-refusal-gold-and-arm-b-re-run
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-21
---

# Phase 21 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Draft scaffold (frontmatter filled at plan-phase 5.5). The Per-Task Verification Map,
> Wave 0, and Manual-Only sections are filled post-execution by `/gsd-validate-phase`
> against the RESEARCH.md "## Validation Architecture" section (OBG-01..09).

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | node:test (Node stdlib) -- the repo `eval/` tree convention |
| **Config file** | none (eval/package.json provides the runner; jstat pinned) |
| **Quick run command** | `node --test eval/<changed>.test.mjs` (explicit FILE form) |
| **Full suite command** | `node --test eval/*.test.mjs` (FILE form per file; the dir form spuriously exits 1 on this host) |
| **Estimated runtime** | ~tens of seconds (no-spend; stubs only) |

---

## Sampling Rate

- **After every task commit:** Run the changed module's FILE-form `node --test eval/<mod>.test.mjs`
- **After every plan wave:** Run the full eval-tree FILE-form suite
- **Before `/gsd-verify-work`:** Full suite green; the live-cert spend is a separate human-authorized boundary
- **Max feedback latency:** ~60 seconds (no-spend build)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | OBG-01..09 | TBD | TBD | unit | `node --test eval/<mod>.test.mjs` | W0 | pending |

*Status: pending . green . red . flaky (filled by /gsd-validate-phase post-execution).*

*Note (from RESEARCH.md Validation Architecture): OBG-01..06/08/09 are deterministically FILE-form testable (blocklist filter, AVeriTeC-4-way -> binary map, retrieval-log builder, re-score wiring to scoreArmFromVotes + clopperPearsonUpperOneSided, LZ_SPEND/isCliEntry guards, kappa/Jaccard reporting). OBG-07 (the over-refusal CP verdict) is covered-by-empirical-spike at the human-authorized live-cert spend (the SCOPED verdict), not a pure unit test. The pre-flight cost spike (OBG-08) is empirical/manual-gated.*

---

## Wave 0 Requirements

- [ ] eval-tree `.test.mjs` stubs for each new LLM-task script (D-13: every LLM-task script code-reviewed AND covered by code-reviewed unit tests)
- [ ] reuse the existing eval harness/fixtures; no new framework install (node:test stdlib)

*Existing eval infrastructure covers the runner; new tests are added per new module.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| The over-refusal CP verdict (SCOPED / DOES-NOT-WORK / VOID->RAISE) | OBG-07 | Requires the human-authorized live OOF spend; cannot be unit-asserted | Run the pre-registered lock rule, then the 1-2 item pre-flight cost spike, then (if cost is near estimate) the full-N OOF judgment; read the CP-upper vs TAU_OR 0.15 |
| Per-item OOF credit cost near estimate | OBG-08 | Real Copilot spend; measured, not asserted | Capture the CLI AI-Credits line (ANSI-strip parser); HALT + RAISE if significantly over estimate |

*The deterministic seams (gold builder, blocklist, mapping, re-score wiring, reporting) all have automated FILE-form verification.*

---

## Validation Sign-Off

- [ ] All tasks have an automated verify or a Wave 0 dependency
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter (post-execution, by /gsd-validate-phase)

**Approval:** pending
