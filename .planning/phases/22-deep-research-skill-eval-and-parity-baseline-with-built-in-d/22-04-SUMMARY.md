---
phase: 22-deep-research-skill-eval-and-parity-baseline-with-built-in-d
plan: 04
subsystem: testing
tags: [eval, parity, deep-research, pre-registration, freeze, anti-drift, content-review, no-spend]

# Dependency graph
requires:
  - phase: 22-01
    provides: the frozen PARITY_BAR (eval/lz-eval-parity-verdict.mjs) + PARITY_K_RANGE (eval/lz-eval-parity-judge.mjs) the prereg prose must match byte-for-byte
  - phase: 22-02
    provides: the frozen JUDGE_MCC_BAR (eval/lz-eval-judge-calibration.mjs) + SLICE_A_GATE (eval/lz-eval-sliceA-gold.mjs) the prereg prose must match byte-for-byte
provides:
  - eval/lz-eval-parity-prereg.md -- the frozen, timestamped pre-registration lock rule (the lz-eval-live-lock-rule.md analog): the 5-dimension rubric + both question lists + the collapse map + the MCC bar + the RESOLVED D-14 feasibility gate + the fallback + the two-layer parity bar + k + the D-09/D-19 disclosures
  - eval/lz-eval-parity-driver.md -- the session-driven capture+calibrate+grade protocol (the lz-eval-live-cert-driver.md analog) with the transport split + the absolute no-OOF prohibition (D-18; callOof REMOVED)
  - eval/lz-eval-parity-prereg.test.mjs -- the anti-drift co-test (the prereg prose NUMBERS == the frozen module constants byte-for-byte; discrimination-proven)
affects: [22-05 measured parity run (gated AFTER this freeze), milestone-audit pre-registration record]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "pre-registration freeze: the frozen NUMBERS are committed in their OWN timestamped commit BEFORE any grading spend (D-20); the freeze commit is the pre-registration timestamp of record"
    - "anti-drift co-test mirroring lz-eval-lock-rule.md <-> EVAL_THRESHOLDS: the prose table rows are built FROM the Object.freeze'd constants so the test follows the code; a wrong-needle (constant + 1) test + an invert-the-fix test prove discrimination"
    - "transport-split contrast: the driver is the live-cert driver MINUS callOof -- the removed out-of-family transport is named explicitly so the D-18 no-OOF prohibition is unambiguous"

key-files:
  created:
    - eval/lz-eval-parity-prereg.md
    - eval/lz-eval-parity-driver.md
    - eval/lz-eval-parity-prereg.test.mjs
  modified: []

key-decisions:
  - "PAR-01 fully satisfied: the frozen, timestamped pre-registration is committed BEFORE any grading; the anti-drift test asserts the prose NUMBERS equal the Object.freeze'd module constants byte-for-byte"
  - "The freeze commit (ae7294d, 2026-06-22T22:23:01+02:00 / 2026-06-22T20:23:01Z) is the pre-registration timestamp of record (D-20); it contains ONLY the three files -- SUMMARY/STATE were committed separately so the freeze is a clean timestamp"
  - "The D-14 conditional branch is RESOLVED FEASIBLE pre-grade (95 clean Supported / 216 clean Refuted); a resolved pre-registered conditional is valid pre-registration, not result-shopping (D-14 explicit)"
  - "The driver documents the session-drives-spend / node-scores-from-disk split with the OOF transport FORBIDDEN (D-18); callOof / makeCopilotCallModel are explicitly REMOVED vs the live-cert driver"
  - "PAR-08 NOT flipped to Complete: the prereg + driver content-review portion is satisfied (this plan's blocking content-review approved), but the phase-wide PAR-08 gate (the 22-05 judge rubric + claim-extraction prompts) closes in 22-05 -- mirrors how 22-03 handled PAR-08"
  - "Zero model spend, zero packages: 2 docs + 1 node:test over Node stdlib; no model call, no network, no install"

patterns-established:
  - "Pattern 1: the pre-registration freeze commit is dedicated (only the 3 files) so it is an unambiguous timestamp of record; the finalize commit (SUMMARY + STATE/ROADMAP/REQUIREMENTS) is separate"
  - "Pattern 2: the anti-drift co-test proves discrimination THREE ways -- the byte-for-byte present-needle table, a wrong-needle (constant + 1) absence table, and an in-memory invert-the-fix tamper that must flip the predicate RED"

requirements-completed: [PAR-01]

# Metrics
duration: ~40min
completed: 2026-06-22
---

# Phase 22 Plan 04: Pre-registration FREEZE Summary

**The frozen, timestamped pre-registration `eval/lz-eval-parity-prereg.md` (the lz-eval-live-lock-rule.md analog) committing -- BEFORE any grading (D-20) -- the 5-dimension rubric, both question lists (the Slice-A deterministic AVeriTeC seed rule + the Slice-B n=3 natural research questions), the verdict-collapse map, the judge-calibration MCC bar, the RESOLVED-FEASIBLE D-14 Slice-A gate + the fallback + PROVISIONAL limits, and the two-layer parity bar + k + the D-09 instrument-strength disclosure + the D-19 self-preference threat-to-validity; the session-driven `eval/lz-eval-parity-driver.md` documenting the transport split with the OOF transport FORBIDDEN (callOof REMOVED, D-18); and the anti-drift co-test `eval/lz-eval-parity-prereg.test.mjs` asserting the prose NUMBERS equal the Object.freeze'd module constants (PARITY_BAR / JUDGE_MCC_BAR / SLICE_A_GATE / PARITY_K_RANGE) byte-for-byte, discrimination-proven. Content-reviewed (PAR-08 portion), then committed in its OWN timestamped freeze commit before any spend.**

## Pre-registration record (the freeze, D-20)

- **Freeze commit (the pre-registration timestamp of record):** `ae7294d8c7ad8878e5a952412b42b29774f6d814` (short `ae7294d`)
- **Freeze commit timestamp:** `2026-06-22T22:23:01+02:00` (UTC `2026-06-22T20:23:01Z`)
- **Freeze commit contents:** EXACTLY the 3 files (`eval/lz-eval-parity-prereg.md`, `eval/lz-eval-parity-driver.md`, `eval/lz-eval-parity-prereg.test.mjs`); 702 insertions; no SUMMARY/STATE bundled (the freeze is a clean timestamp).
- The zero-grades window was genuinely open at the freeze (no report captured or graded). The D-14 conditional branch is RESOLVED FEASIBLE pre-grade. No optional stopping; the bars are frozen in advance.

## Performance

- **Duration:** ~40 min
- **Started:** 2026-06-22T20:00:00Z (approx)
- **Completed:** 2026-06-22
- **Tasks:** 1 auto task (author 3 files + green the anti-drift test) + 1 blocking content-review/FREEZE checkpoint (orchestrator-approved)
- **Files modified:** 3 created

## Accomplishments

- Authored `eval/lz-eval-parity-prereg.md` -- the frozen, timestamped pre-registration with all SIX required sections:
  - (i) the 5 Anthropic dimensions verbatim (factual/groundedness accuracy; citation accuracy; completeness/coverage; source quality; tool/process efficiency) + the machine keys (`factual`, `citation`, `completeness`, `source_quality`, `tool_process_efficiency`) + the per-dimension scoring rule (0..1 + pass/fail at PASS_THRESHOLD 0.7 + the "Unknown" escape hatch, Unknown not a pass; temp 0).
  - (ii) the Slice-A AVeriTeC seed list (the DETERMINISTIC ascending-`claim_id` selection, ~8-12 per direction within the gate) + the Slice-B natural research question set (n=3 GENERAL questions, not fact-check claims, not date-locked to <=2020).
  - (iii) the verdict-collapse map (Supported->unrefuted, Refuted->refuted, EXCLUDE Conflicting Evidence/Cherrypicking, HOLD OUT NEI).
  - (iv) the JUDGE_MCC_BAR (POINT 0.5 / LOWER_FLOOR 0) + the uncalibrated-judge-is-a-DISQUALIFIER rule + the closed-book-calibrates-judge-only role separation.
  - (v) the SLICE_A_GATE (N_SUP_MIN 8 / N_REF_MIN 8), RESOLVED FEASIBLE (95 clean Supported / 216 clean Refuted) + the D-14 fallback (degrade Slice A to a calibration probe) + the PROVISIONAL limits (uniform 2020 claim_date + topical narrowness).
  - (vi) the two-layer PARITY_BAR (FLOOR_DIMS factual+citation, MAX_LOSS_FLOOR_DIMS 0, MAX_LOSS_OTHER_DIMS 1) + k within PARITY_K_RANGE 3..5 (realized k=3) + the D-09 instrument-strength disclosure (the Opus judge is deliberately stronger and independent of the product's runtime cost profile) + the D-19 self-preference symmetric-cancellation threat-to-validity (a defensible parity SCREEN, never a proof).
- Authored `eval/lz-eval-parity-driver.md` -- the session-driven capture+calibrate+grade protocol (the lz-eval-live-cert-driver.md analog): the transport-split table (`callJudge` / `callVoter` are SESSION-DRIVEN Agent sub-agents; `capture` is headless `claude -p` for report.md only; node SCORES FROM DISK at zero spend) + the ABSOLUTE PROHIBITION that there is NO OOF/Copilot transport in this phase (D-18), explicitly contrasting the live-cert driver's `callOof` / `makeCopilotCallModel` which are REMOVED here.
- Authored `eval/lz-eval-parity-prereg.test.mjs` -- the FILE-form node:test asserting the prose NUMBERS equal every frozen module constant (PARITY_BAR.PASS_THRESHOLD 0.7 / MAX_LOSS_FLOOR_DIMS 0 / MAX_LOSS_OTHER_DIMS 1; JUDGE_MCC_BAR.POINT 0.5 / LOWER_FLOOR 0; SLICE_A_GATE.N_SUP_MIN 8 / N_REF_MIN 8; PARITY_K_RANGE.MIN 3 / MAX 5) byte-for-byte, plus the six-section + D-09/D-19 + transport-split/no-OOF + ASCII assertions.
- Passed the mandatory blocking content-review/FREEZE checkpoint (PAR-08 portion + the anti-result-shopping gate): the orchestrator independently re-verified the gates and the six frozen sections, confirmed the Slice-B questions are general/not-date-locked and the driver's no-OOF prohibition, and approved with no edits.
- Committed the 3 files in their OWN timestamped freeze commit (`ae7294d`) BEFORE any Plan 22-05 grading spend -- the pre-registration timestamp of record (D-20).

## Task Commits

1. **Task 1: Author the prereg + the session driver + the anti-drift test** + **Task 2: blocking content-review/FREEZE checkpoint** - `ae7294d` (docs: the freeze commit; ONLY the 3 files)
2. **Plan metadata (this SUMMARY + STATE + ROADMAP + REQUIREMENTS)** - separate finalize commit (docs: complete plan)

## Files Created/Modified

- `eval/lz-eval-parity-prereg.md` - the frozen, timestamped pre-registration lock rule (PAR-01). ASCII-only, LF, no BOM, no AI-attribution.
- `eval/lz-eval-parity-driver.md` - the session-driven capture+calibrate+grade protocol; transport split + no-OOF prohibition (D-18). ASCII-only, LF, no BOM, no AI-attribution.
- `eval/lz-eval-parity-prereg.test.mjs` - the anti-drift co-test (FILE-form node:test). ASCII-only, LF, no BOM, no AI-attribution.

## Verification

- **Anti-drift test (FILE form per host quirk):** `node --test eval/lz-eval-parity-prereg.test.mjs` -> EXIT 0, 8/8 pass (frozen-constant Object.frozen check; the byte-for-byte present-needle table; the wrong-needle (constant + 1) absence table; the invert-the-fix tamper FLIPS RED; the FLOOR_DIMS check; the six-section + D-09/D-19 check; the driver transport-split + no-OOF check; the ASCII/no-BOM check).
- **Discrimination proven empirically:** editing the prereg prose row `PASS_THRESHOLD` 0.7 -> 0.9 made the suite exit 1 (RED); restoring the file made it exit 0 (GREEN). A real prose-vs-constant mismatch breaks the test -- not a tautology.
- **Packaging-boundary test:** `node --test eval/lz-eval-packaging-boundary.test.mjs` -> EXIT 0, 2/2 pass (the docs + test are eval-only; the one-directional eval->runtime boundary holds).
- **Load-bearing token grep** (`git grep -c -e "transport split" -e "no OOF" -e "FEASIBLE"`): driver `transport split`=1 / `no OOF`=1 / `FEASIBLE`=1; prereg `transport split`=1 / `no OOF`=1 / `FEASIBLE`=2.
- **ASCII / LF / no-BOM:** direct byte scan of all 3 files -- `firstNonAscii=-1 firstCR=-1 bom=false` (prereg 15500 bytes, driver 14668 bytes, test 14524 bytes).
- **Freeze commit hygiene:** only the 3 files staged by name; the commit contains exactly those 3; zero file deletions; no AI-attribution trailer.

## Decisions Made

- PAR-01 is marked Complete: the frozen, timestamped pre-registration is committed BEFORE any grading, and the anti-drift test asserts the prose NUMBERS equal the Object.freeze'd module constants byte-for-byte.
- PAR-08 is NOT flipped to Complete here: PAR-08 is a phase-wide gate covering every eval SCRIPT (+ code-reviewed tests) and every PROMPT/REFERENCE that steers an LLM task. This plan's prereg + driver content-review portion is satisfied (the blocking content-review approved); the phase-wide gate closes once the 22-05 judge rubric + claim-extraction prompts also pass their reviews. The traceability note records the partial satisfaction (mirrors 22-03).
- The freeze commit is dedicated (only the 3 files) so it is an unambiguous pre-registration timestamp of record; the finalize commit (SUMMARY + STATE/ROADMAP/REQUIREMENTS) is separate.

## Deviations from Plan

None - plan executed exactly as written. (No deviation rules triggered: docs + one stdlib test, zero spend, zero packages, no missing critical functionality, no architectural change.)

## Issues Encountered

None. The new files were untracked at verification time, so the load-bearing token grep used `git grep --no-index`; after the freeze commit they are tracked.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- The pre-registration is FROZEN + timestamped + committed BEFORE any grading (D-20 / PAR-01). Wave 3 (Plan 22-05) -- the human-authorized Claude-pool spend -- is unblocked, but is dispatched SEPARATELY by the orchestrator (NOT begun here).
- The session driver is the protocol Plan 22-05 follows at spend time; the no-OOF prohibition (D-18) is recorded.

## Self-Check: PASSED

- FOUND: eval/lz-eval-parity-prereg.md
- FOUND: eval/lz-eval-parity-driver.md
- FOUND: eval/lz-eval-parity-prereg.test.mjs
- FOUND: 22-04-SUMMARY.md
- FOUND commit: ae7294d (the freeze; contains exactly the 3 files)
- ASCII-only / no BOM / LF confirmed on the 3 deliverables + all edited planning docs.

---
*Phase: 22-deep-research-skill-eval-and-parity-baseline-with-built-in-d*
*Completed: 2026-06-22*
