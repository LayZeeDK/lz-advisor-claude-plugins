---
phase: 23
slug: judge-free-confidence-and-operating-envelope-for-lz-deep-res
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-09-07
---

# Phase 23 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Seeded by plan-phase from `23-RESEARCH.md` §Validation Architecture. The Per-Task Verification Map
> is filled once plans exist (by `/gsd-validate-phase` post-execution) — the `TBD` row below is
> expected at plan time, not a gap.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `node:test` (Node stdlib, no test runner dependency) |
| **Config file** | `eval/package.json` (`type: module`; sole devDependency `jstat@1.9.6`, dev-only, never ships) |
| **Quick run command** | `node --test eval/<specific>.test.mjs` — the explicit FILE form |
| **Full suite command** | Enumerate `eval/*.test.mjs` explicitly and pass the file list |
| **Estimated runtime** | ~10-30 seconds for the eval tree |

**HOST QUIRK — do not gate on the directory form.** On this machine `node --test <dir>` exits 1 even
when every test passes. Always gate on the explicit `.test.mjs` FILE form. This has recurred for every
`node:test` suite in this repo (v2.1.0 Phase 16 aggregator fixture, Phase 18 eval). A directory-form
red is not a failure signal.

**CI GAP CARRIED FROM PHASE 22 (open, non-blocking for this phase but relevant to any new test):**
Phase 22's validation found that none of its 9 test files run in CI — 106 of 108 tests were unexecuted
on push. Any test authored in Phase 23 should be added to `ci.yml` in the same task that creates it,
or the phase repeats that gap.

---

## Sampling Rate

- **After every task commit:** run the file-form test for the module the task touched
- **After every plan wave:** run the full explicit-file-list eval suite
- **Before `/gsd-verify-work`:** full suite must be green
- **Max feedback latency:** ~30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | ENV-01..08 | TBD | TBD | TBD | TBD | ❌ W0 | ⬜ pending |

*Filled by `/gsd-validate-phase` after plans and execution exist. Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Requirement Verifiability (from `23-RESEARCH.md` §Validation Architecture)

Phase 23 is document- and reading-producing more than code-producing. Several ENV requirements are
honestly **not** deterministically testable, and this project has an explicit prior lesson against
fabricating hollow grep-tests to satisfy a coverage count. Recorded plainly:

| Req | Verifiability | Basis |
|-----|---------------|-------|
| ENV-01 | **Deterministic** | The pre-registration exists, is committed in its own timestamped commit, and precedes every capture/vote/score commit — checkable from git history alone. An anti-drift co-test can pin frozen constants byte-for-byte (the Phase-22 pattern). |
| ENV-02 | **Deterministic** | `extractSystemInit` + `buildManifest` + `validateManifest` are unit-testable against the two real captures on disk. The D-11 field fix is discrimination-provable (old field → throw, new field → pins `2.1.186`). Blocked on D-22: name the `costUsd` source first. |
| ENV-03 | **Partly deterministic** | The filter/draw/tally scripts are unit-testable (`filterSliceA`, `tallyPerDirection`, seeded selection reproducibility). The voter *read itself* is a measurement, not a test — it has no pass/fail and must not acquire one. |
| ENV-04 | **Partly deterministic** | Normalization, identifier canonicalization, and quote-match are pure functions — fully unit-testable, and the D-20 q1 dry run exercises them on real data before they matter. Resolvability is a live network check: assert the *mechanism*, record the check date, never assert a specific remote result. |
| ENV-05 | **Not testable — a measurement** | A capture-feasibility spike produces an observation. Its ceiling (≤3 resumes / ≤2 windows) is a pre-registered criterion, not an assertion. Verified by the recorded run properties, not by a test. |
| ENV-06 | **Not testable — conditional measurement** | Gated on ENV-05. The blinding/position-swap machinery is unit-testable (existing `lz-eval-parity-judge.mjs` tests); the grading outcome is not. |
| ENV-07 | **Inspection only** | The envelope document either carries its required sections and a named not-established statement, or it does not. Structural presence is grep-checkable; usefulness is a human read. |
| ENV-08 | **Process, evidenced by artifacts** | Review-before-use is verified by the existence of review records, not by a runtime test. Zero-OOF-spend is structurally satisfied (no OOF transport exists in any eval module) and the packaging boundary is already covered by `eval/lz-eval-packaging-boundary.test.mjs`. |

---

## Wave 0 Requirements

- [ ] Resolve D-22 (`costUsd` source) before any ENV-02 test is authored — otherwise the MANIFEST test encodes an invented value
- [ ] Add every new `.test.mjs` to `ci.yml` in the same task that creates it (Phase-22 CI gap)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| The ENV-05 spike's capture completed within the frozen ceiling | ENV-05 | A capture is a spend event, not a repeatable test | Read the recorded run properties: resume-cycle count, reset-window count, whether a verification-complete report landed |
| The built-in's workers leave recoverable fetched content (D-19 branch selector) | ENV-04 / ENV-05 | One-time observation during the spike; the answer selects a pre-frozen branch | Inspect the retained `subagents/` copy for `tool_result` entries carrying fetched source text |
| The operating envelope is useful rather than boilerplate | ENV-07 | Judgment, not assertion | Maintainer read against the four verified envelope skeletons in RESEARCH.md |
| Slice-A and citation-audit reads are framed descriptively, never as a cert | ENV-03 / ENV-04 | Framing is a language property | Maintainer read against the ICH E9 confirmatory/exploratory split and STARD 2015 layout cited in RESEARCH.md |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or a recorded honest reason they cannot
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
