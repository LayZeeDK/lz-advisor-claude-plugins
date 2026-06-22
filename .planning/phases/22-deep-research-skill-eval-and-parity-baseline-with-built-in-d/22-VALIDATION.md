---
phase: 22
slug: deep-research-skill-eval-and-parity-baseline-with-built-in-d
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-22
---

# Phase 22 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Scope note: this phase's deliverables are EVAL HARNESS scripts + pre-registration docs + the architectural-parity write-up (the eval tree never ships). Automated coverage targets the deterministic eval modules (`eval/lz-eval-*.mjs`); the model-driven runs (built-in baseline capture, judge grading) are manual/human-acknowledged Claude-pool operations, NOT unit-testable, and are listed under Manual-Only Verifications.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `node:test` (Node stdlib) — repo convention; eval/ has its own `package.json` (jstat pinned, never ships) |
| **Config file** | `eval/package.json` |
| **Quick run command** | `node --test eval/<module>.test.mjs` (FILE-form — `node --test <dir>` spuriously exits 1 on this host) |
| **Full suite command** | run each `eval/*.test.mjs` by explicit file path (FILE-form gate) |
| **Estimated runtime** | ~{N} seconds (fill post-Wave-0) |

---

## Sampling Rate

- **After every task commit:** Run the changed module's `node --test eval/<module>.test.mjs`
- **After every plan wave:** Run all `eval/*.test.mjs` (FILE-form)
- **Before `/gsd:verify-work`:** Full eval suite green
- **Max feedback latency:** {N} seconds (fill post-Wave-0)

---

## Per-Task Verification Map

> Filled by the planner / `gsd-validate-phase`. Columns map each deterministic eval module + pre-registration artifact to its automated check; model-driven runs route to Manual-Only.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | PAR-{XX} | T-22-{XX} / — | TBD | unit | `node --test eval/{module}.test.mjs` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Per-task test stubs for the new deterministic eval modules (judge-harness scorer, parity tally, claim-extraction-bridge scorer, baseline-capture manifest validator) — FILE-form `.test.mjs`
- [ ] Reuse existing fixtures where possible (`eval/__fixtures__/`, vendored WiCE)

*Else: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Built-in `/deep-research` baseline capture | PAR-{XX} | Headless model run on the Claude pool (stochastic, live-web); not unit-testable | Run the `claude -p "/deep-research <q>" --output-format stream-json \| tee` capture per D-15; verify report.md + MANIFEST + workflow script persisted |
| Opus judge grading (blind + swap + multi-sample) | PAR-{XX} | LLM-as-judge run on the Claude pool | Verify per-cell raw verdicts recorded; the deterministic tally/aggregation IS unit-tested |
| AVeriTeC Slice A descriptive run (verify-voter path) | PAR-{XX} | Live-web voter dispatch | Verify per-direction (never pooled) descriptive output; the collapse-map + scoring helpers ARE unit-tested |

*The deterministic seams (scoring, tally, collapse-map, MCC calibration gate, manifest validation) get automated FILE-form tests; the model-driven runs are human-acknowledged Claude-pool operations.*

---

## Validation Sign-Off

- [ ] All deterministic eval modules have `<automated>` FILE-form verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < {N}s
- [ ] `nyquist_compliant: true` set in frontmatter (post-execution, via `/gsd-validate-phase`)

**Approval:** pending
