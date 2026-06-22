---
phase: 21
slug: live-web-open-book-over-refusal-gold-and-arm-b-re-run
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-21
validated: 2026-06-22
---

# Phase 21 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Per-Task Map + Wave 0 + Manual-Only filled post-execution by `/gsd-validate-phase`
> against the RESEARCH.md "## Validation Architecture" section (OBG-01..09).

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | node:test (Node stdlib) -- the repo `eval/` tree convention |
| **Config file** | none (eval/package.json provides the runner; jstat pinned) |
| **Quick run command** | `node --test eval/.cache/p21-live/<mod>.test.mjs` (explicit FILE form) |
| **Full suite command** | `node --test eval/.cache/p21-live/*.test.mjs` (FILE form per file; the dir form spuriously exits 1 on this host) |
| **Last run** | 2026-06-22 -- **67/67 PASS** (post-spend regression check; frozen primitives byte-identical) |

---

## Sampling Rate

- **After every task commit:** Run the changed module's FILE-form `node --test eval/.cache/p21-live/<mod>.test.mjs`
- **After every plan wave:** Run the full p21-live FILE-form suite
- **Before `/gsd-verify-work`:** Full suite green; the live-cert spend is a separate human-authorized boundary
- **Max feedback latency:** ~60 seconds (no-spend build)

---

## Per-Task Verification Map

| Module (test file) | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|--------------------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| openbook-lib.test.mjs | 21-01 | 1 | OBG-02, OBG-03, OBG-04 | T-21-04 | 4-way->binary map (mutation-guarded), meta-source blocklist (load-bearing node filter), cohenKappa/evidenceJaccard | unit | `node --test eval/.cache/p21-live/openbook-lib.test.mjs` | yes | green |
| openbook-rescore.test.mjs | 21-01 | 1 | OBG-05, OBG-06, OBG-07 | T-21-01 | two-sided re-score, fail-closed denominator (grown/shrunk/missing-vote), composeVerdict CP anchors + disposition (byte-identical CP) | unit | `node --test eval/.cache/p21-live/openbook-rescore.test.mjs` | yes | green |
| openbook-retrieval-log.test.mjs | 21-02 | 1 | OBG-01, OBG-03, OBG-09 | T-21-05, T-21-04 | safeId path-safety (ContractError on traversal), blocklist enforcement, byte-stable frozen uid-keyed snapshot, no-network + ASCII | unit | `node --test eval/.cache/p21-live/openbook-retrieval-log.test.mjs` | yes | green |
| openbook-oof-gold.test.mjs | 21-03 | 2 | OBG-02, OBG-04, OBG-08, OBG-09 | T-21-09, T-21-11 | LZ_SAMPLE cap applied BEFORE dispatch, requireSpend/isCliEntry guards (zero-spend on import/test), gold-blind candidate shape, RESIDUE routing (mutation-guarded), two-field gold | unit (stub-injected) | `node --test eval/.cache/p21-live/openbook-oof-gold.test.mjs` | yes | green |
| openbook-normalize-claims.test.mjs | 21-04 | 3 | OBG-01, OBG-02, OBG-09 | T-21-05 | worker-output -> frozen-builder bridge (empty BEFORE / populated AFTER), per-claim source propagation, safeId reject, no-network + ASCII | unit | `node --test eval/.cache/p21-live/openbook-normalize-claims.test.mjs` | yes | green |

*Status: pending . green . red . flaky. All 5 modules green (67/67 FILE-form) as of 2026-06-22.*

*Note (RESEARCH.md Validation Architecture): OBG-01..06/09 + the CP-gate LOGIC of OBG-07 + the LZ_SAMPLE-cap LOGIC of OBG-08 are deterministically FILE-form tested above. The EMPIRICAL halves -- OBG-07's live CP verdict and OBG-08's real per-item Copilot credit cost -- are inherently manual (real metered spend, not unit-assertable) and were EXERCISED by the human-authorized Plan 05 run (see Manual-Only below).*

---

## Wave 0 Requirements

- [x] eval-tree `.test.mjs` for each new LLM-task script (D-13: every LLM-task script code-reviewed AND covered by code-reviewed unit tests) -- 5/5 modules tested (67/67)
- [x] reuse the existing eval harness/fixtures; no new framework install (node:test stdlib) -- zero new deps (T-21-SC verified)

*Existing eval infrastructure covers the runner; a new test was added per new module.*

---

## Manual-Only Verifications (inherent real-spend; EXERCISED by the authorized Plan 05 run)

| Behavior | Requirement | Why Manual | Outcome (2026-06-22) |
|----------|-------------|------------|----------------------|
| The over-refusal CP verdict (SCOPED / DOES-NOT-WORK / VOID->RAISE) | OBG-07 | Requires the human-authorized live OOF spend; cannot be unit-asserted | EXERCISED: full-N OOF over the frozen 30 -> validN=10 < N_CTRL_FLOOR 24 -> **VOID-on-power-RAISE** (cpUpper(1,10)=0.3942 vs TAU_OR 0.15). Recorded in 21-OPENBOOK-CERT-RESULT.md + openbook-rescore-result.json. |
| Per-item OOF credit cost vs estimate | OBG-08 | Real Copilot spend; measured, not asserted | EXERCISED: pre-flight spike 15.72cr (7.86/control) -> cleared the cost guard -> full-N 59.58cr (~2.1/control, amortized) = 75.30 total (under the ~100-350 estimate). ANSI-strip parser captured 10/10 calls; cert discloses + says verify dashboard. |

*The deterministic seams (gold builder, blocklist, 4-way->binary mapping, two-sided re-score wiring, CP-gate + disposition logic, reporting) all have automated FILE-form verification. The two manual-only items are real-spend measurements, not coverage gaps; both were performed under the Plan 05 BLOCKING human-verify checkpoint.*

---

## Validation Sign-Off

- [x] All tasks have an automated verify or a justified Manual-Only (real-spend) verification that was performed
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 60s
- [x] `nyquist_compliant: true` set in frontmatter (post-execution, by /gsd-validate-phase)

**Approval:** validated 2026-06-22 -- nyquist-compliant (deterministic core fully automated; the 2 inherent manual-only real-spend items exercised by the authorized Plan 05 run).

---

## Validation Audit 2026-06-22

| Metric | Count |
|--------|-------|
| Requirements | 9 (OBG-01..09) |
| Automated-covered (deterministic seam) | 9 (each maps to >=1 green FILE-form test) |
| Manual-only (real-spend, exercised) | 2 (OBG-07 live verdict, OBG-08 real cost) |
| Gaps found | 0 |
| Tests generated this audit | 0 (existing 67/67 suite already covers every deterministic seam) |
| Escalated | 0 |
