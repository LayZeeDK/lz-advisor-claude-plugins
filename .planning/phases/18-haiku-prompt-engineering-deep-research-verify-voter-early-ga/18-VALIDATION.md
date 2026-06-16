---
phase: 18
slug: haiku-prompt-engineering-deep-research-verify-voter-early-ga
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-16
---

# Phase 18 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | node:test (Node built-in; zero-dep) |
| **Config file** | none -- node built-in test runner |
| **Quick run command** | `node --test plugins/lz-advisor/skills/lz-deep-research/scripts/<name>.test.mjs` (explicit FILE form -- never `node --test <dir>`; host quirk exits 1 even on pass) |
| **Full suite command** | run each `*.test.mjs` file explicitly (loop over files, not the dir form) |
| **Estimated runtime** | ~5-15 seconds (deterministic, no model calls) |

> The deterministic harness/aggregator is unit-testable offline. The live gating-eval RUN (k>=5 voter
> calls over the dataset) is NOT a node:test -- it is a staged `claude -p` execution gated by the
> pre-registered lock rule; its outputs feed the deterministic aggregator, which IS unit-tested.

---

## Sampling Rate

- **After every task commit:** Run the relevant `*.test.mjs` file(s)
- **After every plan wave:** Run all `*.test.mjs` files for the phase
- **Before `/gsd:verify-work`:** All deterministic tests green
- **Max feedback latency:** ~15 seconds (deterministic suite)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD (planner fills) | TBD | TBD | EVAL-* / VERIF-* / COST-02 | TBD | TBD | unit / harness | `node --test <file>.test.mjs` | TBD | pending |

*Status: pending / green / red / flaky. Planner populates this map from the PLAN.md task list; the
deterministic-testable surface (per RESEARCH.md Validation Architecture): Clopper-Pearson/Wilson interval
math, Pass@1/Pass^k tally, false-uphold + Haiku-minus-Sonnet DELTA counting, label remapping
(supported/partially_supported/not_supported -> unrefuted/refuted), checksum verification + fail-closed
on mismatch, manifest parsing.*

---

## Wave 0 Requirements

- [ ] Deterministic aggregator test file(s) `*.test.mjs` (explicit-file form) for the interval math + tally + false-uphold/DELTA + label remap + checksum fail-closed
- [ ] Reference-value fixtures for Clopper-Pearson/Wilson (anchor against known stdlib values per RESEARCH.md)

*node:test is built in -- no framework install needed.*

---

## Manual-Only / Live-Model Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| The gating-eval RUN (voter false-uphold rate) | EVAL-02/03 | Requires live k>=5 model calls; non-deterministic; credit-bound | Staged `claude -p --permission-mode auto` per RESEARCH.md harness; feeds the deterministic aggregator |
| Haiku-prompt technique efficacy | EVAL-05 | Prompt quality is surfaced empirically by the eval | The eval's Haiku-minus-Sonnet DELTA measures it |

*The deterministic aggregator over the live outputs IS unit-tested; the live run itself is gated by the
pre-registered lock rule, not a node:test.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter (flips post-execution via /gsd:validate-phase)

**Approval:** pending
