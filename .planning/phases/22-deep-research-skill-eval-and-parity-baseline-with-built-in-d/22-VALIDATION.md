---
phase: 22
slug: deep-research-skill-eval-and-parity-baseline-with-built-in-d
status: validated
nyquist_compliant: false
wave_0_complete: true
created: 2026-06-22
validated: 2026-09-05
validator: gsd-nyquist-auditor
---

# Phase 22 -- Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Scope note: this phase's deliverables are EVAL HARNESS scripts + pre-registration docs + the architectural-parity write-up (the eval tree never ships). Automated coverage targets the deterministic eval modules (`eval/lz-eval-*.mjs`); the model-driven runs (built-in baseline capture, judge grading) are manual/human-acknowledged Claude-pool operations, NOT unit-testable, and are listed under Manual-Only Verifications.

**Post-execution honesty note (2026-09-05).** The phase HALTED at the Stage-2 judge-calibration gate (mcc 0.4889 and 0.4531 against a frozen bar of MCC >= 0.5 AND lowerCI > 0; both attempted instruments failed). Stages 3-5 never ran. Consequently the MODULE half of PAR-02/03/04/05/06 landed and is automated-green, while the BEHAVIORAL half was never exercised. `nyquist_compliant` stays **false**: module-level green is not requirement-level coverage, and the requirement-level checks for those five requirements have no automatable route inside this phase. This matches `22-VERIFICATION.md` (3/6 success criteria; close PAR-01 + PAR-07, carry PAR-02/03/04/05/06 + the PAR-08 remainder OPEN). I read the same evidence and reached the same classification independently -- no dissent to record.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `node:test` (Node stdlib) -- repo convention; eval/ has its own `package.json` (jstat pinned, never ships) |
| **Config file** | `eval/package.json` |
| **Quick run command** | `node --test eval/<module>.test.mjs` (FILE-form -- `node --test <dir>` spuriously exits 1 on this host) |
| **Full suite command** | `node --test $(ls -1 eval/*.test.mjs) $(find plugins/lz-advisor/skills -name '*.test.mjs')` |
| **Measured runtime** | **1.5 s wall / 1.21 s reported** for the full 700-test suite (700 pass, 0 fail, exit 0; measured 2026-09-05) |
| **Phase-22 subset** | 108 tests across 9 FILE-form files (see the map below), all green |

---

## Sampling Rate

- **After every task commit:** Run the changed module's `node --test eval/<module>.test.mjs`
- **After every plan wave:** Run all `eval/*.test.mjs` (FILE-form)
- **Before `/gsd:verify-work`:** Full eval suite green
- **Max feedback latency:** 2 seconds (measured 1.5 s for the full suite)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 22-01-T1 | 22-01 | 1 | PAR-04 (module half) | T-22-01 | Malformed/partial judge JSON is rejected, not silently scored; both orderings must agree | unit | `node --test eval/lz-eval-parity-judge.test.mjs` | [OK] | [OK] green (17/17) |
| 22-01-T2 | 22-01 | 1 | PAR-05 (module half) | T-22-02 | Parity bar is `Object.freeze`d; post-hoc bar tuning is detectable | unit | `node --test eval/lz-eval-parity-verdict.test.mjs` | [OK] | [OK] green (14/14) |
| 22-02-T1 | 22-02 | 1 | PAR-02 (module half) | T-22-02, T-22-10 | MCC bar frozen at `{POINT:0.5, ALPHA:0.05, LOWER_FLOOR:0}`; subtle-item `ContractError` blocks a subgroup read | unit | `node --test eval/lz-eval-judge-calibration.test.mjs` | [OK] | [OK] green (12/12) |
| 22-02-T2 | 22-02 | 1 | PAR-06 (module half) | T-22-05b, T-22-06 | Voter payload is an allowlist `{claim, claim_date}` (no gold leak); tally is per-direction, never pooled | unit | `node --test eval/lz-eval-sliceA-gold.test.mjs` | [OK] | [OK] green (18/18) |
| 22-02-T3 | 22-02 | 1 | PAR-03 (module half) | T-22-03b, T-22-13 | MANIFEST fails closed on a missing model / CC version / report / cost | unit | `node --test eval/lz-eval-baseline-manifest.test.mjs` | [OK] | [FLAKY] green (11/11) but **NON-DISCRIMINATING** -- see the two escalated defects below |
| 22-03-T1 | 22-03 | 1 | PAR-07, PAR-08 (content-review half) | T-22-08, T-22-09 | Every built-in claim flagged docs-grounded; lz claims cross-checked against the shipped schema | manual (blocking content review) | none -- human-verify checkpoint, executed and approved (`22-03-SUMMARY.md:63`) | [OK] | [OK] approved |
| 22-04-T1 | 22-04 | 2 | PAR-01, PAR-08 | T-22-02, T-22-07, T-22-10 | Prose matches the frozen constants byte-for-byte; freeze predates all grading; no OOF transport | unit (anti-drift) | `node --test eval/lz-eval-parity-prereg.test.mjs` | [OK] | [OK] green (8/8, discrimination-proven) |
| 22-04-T2 | 22-04 | 2 | PAR-01, PAR-08 (content-review half) | T-22-02 | Pre-registration + driver content-reviewed and frozen BEFORE any spend | manual (blocking content review) | none -- human-verify checkpoint, executed and approved | [OK] | [OK] approved |
| 22-05-T1 | 22-05 | 3 | PAR-08 (spend gate) | T-22-SC | Full FILE-form suite green + freeze committed before the metered spend is authorized | smoke | `node --test $(ls -1 eval/*.test.mjs)` | [OK] | [OK] green |
| 22-05-T2 | 22-05 | 3 | **PAR-02, PAR-03** (behavioral) | T-22-05a, T-22-06, T-22-10, T-22-12 | Dispatch guards fail closed on uid/gold leakage; single instrument; write-once attempt | manual (Claude-pool) | none possible | n/a | [FAIL] **red -- HALTED.** Calibration ran (60 real verdicts, guards exercised clean) and returned `cleared:false`. PAR-02 unmet by design. PAR-03 unmet: q2/q3 never captured, zero MANIFESTs on disk |
| 22-05-T3 | 22-05 | 3 | **PAR-04, PAR-05, PAR-06** (behavioral) | T-22-01, T-22-11, T-22-05b | Blind + position-swapped grading; per-direction Slice-A tally; mechanical two-layer verdict | manual (Claude-pool) | none possible | n/a | [PENDING] **never ran** -- blocked by the T2 disqualifier. `eval/.cache/p22-baseline/judge/` is empty |
| 22-XX-B1 | (audit) | -- | PAR-03 (defect) | **T-22-06** | `extractSystemInit` must pin the CC version from a REAL `system/init` event | unit | `node --test eval/__known-defects__/p22-baseline-manifest-defects.test.mjs` | [OK] | [FAIL] **red -- ESCALATED** (implementation defect, fix out of auditor scope) |
| 22-XX-B2 | (audit) | -- | PAR-03 (defect) | **T-22-13** | `validateManifest` must reject a zero-byte report.md ("non-empty report", `lz-eval-parity-driver.md:127`) | unit | same file as B1 | [OK] | [FAIL] **red -- ESCALATED** |
| INFRA-1 | 22-03/04 | -- | PAR-08 (never-ships half) | T-22-03a | No `package.json`/`node_modules` under the plugin tree; no runtime import of `eval/` | unit (boundary) | `node --test eval/lz-eval-packaging-boundary.test.mjs` | [OK] | [OK] green (2/2) |
| INFRA-2 | 22-05 | 3 | PAR-02 (transport) | T-22-05a, T-22-07 | Calibration transport is payload-allowlisted, no OOF/network/child_process | unit | `node --test eval/lz-eval-parity-calibration-harness.test.mjs` - `node --test eval/lz-eval-parity-calibration-dispatch.test.mjs` | [OK] | [OK] green (18/18, 8/8) |

*Status: [PENDING] pending - [OK] green - [FAIL] red - [FLAKY] flaky/non-discriminating*

### Requirement-level coverage roll-up

| Req | Module coverage | Requirement coverage | Verdict |
|-----|-----------------|----------------------|---------|
| PAR-01 | [OK] automated (anti-drift 8/8) | [OK] the requirement IS the frozen artifact | **COVERED** |
| PAR-02 | [OK] automated (12/12) + EXERCISED on 60 real verdicts | [FAIL] requires the judge to CLEAR the bar; it did not | **MISSING (behavioral)** |
| PAR-03 | [FLAKY] automated but non-discriminating (2 live defects) | [FAIL] n=1 of 3 captured; zero MANIFESTs producible | **MISSING (behavioral) + defective module** |
| PAR-04 | [OK] automated (17/17) | [FAIL] never run on real judge output | **MISSING (behavioral)** |
| PAR-05 | [OK] automated (14/14) | [FAIL] never run on real scored cells | **MISSING (behavioral)** |
| PAR-06 | [OK] automated (18/18) | [FAIL] Slice A never ran | **MISSING (behavioral)** |
| PAR-07 | manual content review, approved | [OK] artifact verified substantively | **COVERED** |
| PAR-08 | [OK] boundary 2/2 + all script tests green; 22-03/22-04 prompts content-reviewed | [FLAKY] the 22-05 judge rubric + claim-extraction prompts never drove an LLM task, so the phase-wide gate does not close | **PARTIAL** |

---

## Wave 0 Requirements

- [x] Per-task test stubs for the new deterministic eval modules (judge-cell scorer, two-layer verdict, judge-MCC gate, Slice-A gold, baseline-capture MANIFEST validator) -- FILE-form `.test.mjs`, all landed and green
- [x] Reuse existing fixtures where possible (`eval/__fixtures__/`, vendored WiCE 60 records, digest-pinned)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions | Outcome |
|----------|-------------|------------|-------------------|---------|
| Built-in `/deep-research` baseline capture | PAR-03 | Headless model run on the Claude pool (stochastic, live-web); not unit-testable | Per `eval/lz-eval-parity-driver.md`: `CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS=0 claude -p "/deep-research <q>" --output-format stream-json \| tee <run>/qBn-runK.stream.jsonl`; then `node eval/lz-eval-baseline-manifest.mjs <run>/qBn-runK.stream.jsonl` must print a model + CC-version pin; verify report.md + MANIFEST persisted, and pair lz-vs-built-in in the SAME reset window (D-16) | [FAIL] **q1 only, both systems; q2/q3 never captured; ZERO MANIFEST files exist** -- mechanically blocked by defect B1 |
| Opus judge calibration (Stage 2) | PAR-02 | LLM-as-judge run on the Claude pool | Per AMENDMENT RECORD 3 the single authorized attempt is **CONSUMED**. Do NOT re-launch inside Phase 22 | [FAIL] **ran, failed the frozen bar** (mcc 0.4531, lowerCI 0.2366, cleared false; reproducible from committed rows) |
| Opus judge grading (blind + swap + multi-sample) | PAR-04 | LLM-as-judge run on the Claude pool | Verify per-cell raw verdicts recorded per-direction; the deterministic tally/aggregation IS unit-tested | [PENDING] **never ran** (Stage-2 disqualifier fired first) |
| Two-layer verdict + operating envelope | PAR-05 | Depends on real scored cells | Run `parityVerdict` over the graded cells; report raw per-cell verdicts per-direction, never only the aggregate | [PENDING] **never ran** |
| AVeriTeC Slice A descriptive run (verify-voter path) | PAR-06 | Live-web voter dispatch | Verify per-direction (never pooled) descriptive output; the collapse-map + scoring helpers ARE unit-tested | [PENDING] **never ran** |
| Zero GitHub Copilot AI Credits during the 2026-09-05 run | PAR-08 / D-18 | Absence of an external metered call is not observable from the repo | Check the Copilot usage dashboard for the run window; expect zero | [PENDING] carried from `22-VERIFICATION.md` human_verification |

*The five behavioral rows above are NOT closable inside Phase 22 -- the frozen stopping rule bans a third instrument, a prompt revision, a widened WiCE draw, and a subgroup read. Closure route: a NEW phase under its own fresh pre-registration (see `22-VERIFICATION.md` "Closure route").*

---

## Escalations (implementation defects -- auditor did NOT fix)

Both defects sit in `eval/lz-eval-baseline-manifest.mjs`, whose own co-test is 11/11 green. Green-but-non-discriminating is a coverage gap by definition, so a red regression test was authored and is committed at `eval/__known-defects__/p22-baseline-manifest-defects.test.mjs` -- deliberately OUTSIDE the `eval/*.test.mjs` glob so the phase suite gate keeps reporting the true state of the shipped contract instead of going red wholesale.

| # | Location | Defect | Threat Ref | Proof |
|---|----------|--------|------------|-------|
| B1 | `lz-eval-baseline-manifest.mjs:91-98` | `extractSystemInit` reads `event.version`; the real `system/init` carries `claude_code_version`. Reproduced against both on-disk captures (`claude_code_version: 2.1.186`, `model: claude-opus-4-8` / `claude-sonnet-4-6[1m]`) -- extraction throws "the run cannot be pinned". **No MANIFEST can ever be produced from a real capture.** This is the mechanical cause of `22-VERIFICATION.md` gap SC1 | T-22-06 (open, non-blocking) | Test red against the shipped module; **green against a one-line patched copy** (`event.claude_code_version`) |
| B2 | `lz-eval-baseline-manifest.mjs:185-190` | `validateManifest` is `existsSync`-only; `lz-eval-parity-driver.md:127` documents the gate as "non-empty report + system/init model + cost". A zero-byte report.md validates | T-22-13 | Test red against the shipped module; **green against a patched copy** adding `statSync(...).size === 0`. The paired non-empty control passes in BOTH runs, proving the failure is caused by emptiness and not by a broken harness |

**Discrimination proof (run 2026-09-05):** shipped module -> 4 tests, 1 pass / 3 fail. Two-line patched copy (both defects fixed, nothing else changed) -> 4 tests, 4 pass / 0 fail. The patched copy was deleted after the proof; no implementation file was modified.

**Recommended fix (developer, not auditor):** read `event.claude_code_version` (optionally falling back to `event.version` for older streams), and add a `statSync(reportPath).size === 0` rejection. Then move `p22-baseline-manifest-defects.test.mjs` into `eval/` as a normal `*.test.mjs`.

---

## Additional finding -- CI coverage gap (WARNING)

`.github/workflows/ci.yml:41-44` runs a FIXED list of four eval test files (`lz-eval-aggregate`, `lz-eval-dataset`, `lz-eval-packaging-boundary`, `lz-eval-worker-contract`). **None of the nine Phase-22 eval test files is in that list** -- 106 of the 108 Phase-22 tests never run in CI, including the anti-drift pre-registration test that guards against result-shopping (T-22-02) and every fail-closed dispatch guard (T-22-05a). The packaging-boundary test is the only overlap. Recommend extending the CI list (or switching it to a FILE-form glob expansion, since `node --test <dir>` is unreliable on the dev host).

---

## Validation Sign-Off

- [x] All deterministic eval modules have `<automated>` FILE-form verify -- 9 files, 108 tests, all green
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 2 s (measured 1.5 s, full 700-test suite)
- [ ] `nyquist_compliant: true` -- **NOT set.** Five requirements (PAR-02/03/04/05/06) are behavioral and unmet; PAR-08 is partial; PAR-03's module coverage is additionally non-discriminating pending B1/B2. Module-level green is not requirement-level coverage.

**Approval:** validated with PARTIAL coverage -- 2 of 8 requirements COVERED (PAR-01, PAR-07), 1 PARTIAL (PAR-08), 5 MISSING at the behavioral level (PAR-02/03/04/05/06), 2 implementation defects ESCALATED.

_Validated 2026-09-05 by gsd-nyquist-auditor._
