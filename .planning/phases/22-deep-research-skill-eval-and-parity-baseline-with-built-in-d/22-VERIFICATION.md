---
phase: 22-deep-research-skill-eval-and-parity-baseline-with-built-in-d
verified: 2026-09-05T00:00:00Z
status: gaps_found
score: 3/6 success criteria verified
behavior_unverified: 0
overrides_applied: 0
adjudications:
  - question: "Is the 22-05 halt a SANCTIONED outcome (the Phase Boundary's second branch) or an unfinished phase relabelled as one?"
    finding: "NEITHER, precisely. The halt is legitimate, correctly executed, and independently reproducible -- but it is NOT the Phase Boundary's second branch. Both branches of that sentence are findings ABOUT THE SKILL; what 22-05 delivered is a named gap in the MEASUREMENT INSTRUMENT, which the boundary did not contemplate. 22-05-SUMMARY.md concedes this itself: 'This is NOT evidence about the lz-deep-research skill in either direction.' The phase reached neither branch and reported that honestly."
    verdict: "Process integrity: EXEMPLARY (verified, not taken on trust). Goal achievement: NOT ACHIEVED on the measured-parity track."
  - question: "Does any fabricated result exist?"
    finding: "NO. 22-PARITY-RESULT.md has never existed in any commit on any branch (`git log --all --diff-filter=A` returns empty). eval/.cache/p22-baseline/judge/ is EMPTY -- no grading artifact of any kind. No artifact states a parity verdict or a cleared Stage-2 gate."
    verdict: VERIFIED CLEAN
  - question: "Was the AMENDMENT RECORD 3 stopping rule honored as frozen?"
    finding: "YES, on every independently checkable particular. Reproduced the gate result from the committed rows: mcc=0.4531 lowerCI=0.2366 cleared=false n=60 -- byte-identical to the claim. Verified both sha256 pins myself (prompt cb3d567a...=MATCH; 60 WiCE records 2353066d...=MATCH). Git history shows the calibration prompt has exactly ONE commit (2026-06-23, never edited) and the WiCE records exactly ONE (2026-06-16, never edited). Exactly two calibration sets exist on disk (opus4x/ 60, calibration/ 60) -- no third instrument. All 60 verdict files pin `claude-opus-5` (single-instrument check holds). The Opus 5 record contains ZERO subgroup MCC figures. AMENDMENT RECORD 3 was committed 2026-09-04, before the 2026-09-05 run."
    verdict: VERIFIED HONORED
  - question: "The requirements conflict: 22-02-SUMMARY frontmatter vs 22-05-SUMMARY / ROADMAP."
    finding: "22-02-SUMMARY.md frontmatter (line 49) `requirements-completed: [PAR-02, PAR-03, PAR-06]` is WRONG. All three requirement texts in REQUIREMENTS.md are BEHAVIORAL, not artifact-existence: PAR-02 demands the judge 'CLEARS the pre-registered MCC bar'; PAR-03 demands the baseline 'is captured headless ... with a MANIFEST'; PAR-06 demands Slice A 'runs DESCRIPTIVELY'. 22-02 landed only the modules. Its own body says so ('Task 1 -- judgeCalibrationGate ... returns { mcc, lowerCI, cleared }'), and its sibling 22-01-SUMMARY sets the correct precedent with `requirements-completed: []` plus the exact reasoning. REQUIREMENTS.md itself and the ROADMAP 22-02 line both already record these as Pending -- so 22-05-SUMMARY and the ROADMAP are CORRECT and 22-02's frontmatter is the outlier."
    verdict: "22-02-SUMMARY.md frontmatter is STALE/WRONG. Recorded as gap G4 below. PAR-02/03/04/05/06 and the PAR-08 remainder must be carried OPEN into /gsd-audit-milestone."
gaps:
  - truth: "SC1 -- 2-3 baseline research reports produced by the built-in /deep-research on the frozen question set; lz-deep-research runs on the SAME questions"
    status: partial
    reason: "The frozen Slice-B set is n=3 questions (prereg Section (ii), re-frozen 2026-06-23, k=1 per system). Only q1 was ever captured. q2 and q3 have no capture on disk for either system. No MANIFEST file exists anywhere under eval/.cache/p22-baseline/ despite PAR-03/D-15 requiring one per run."
    artifacts:
      - path: "eval/.cache/p22-baseline/builtin/"
        issue: "qB1-run1 only; no qB2 / qB3; no MANIFEST"
      - path: "eval/.cache/p22-baseline/lz/"
        issue: "qB1-run1 only; no qB2 / qB3; no MANIFEST"
    missing:
      - "Captures for frozen questions 2 and 3 on both systems (STATE.md records n=3 as 'deferred per the maintainer', which is a scope reduction never folded into the pre-registration as an amendment)"
      - "A buildManifest/validateManifest MANIFEST per captured run (the validator module exists and is tested; it has never been run on a real capture)"
    closure_route: "NEW phase only -- see the closure-route note below."
  - truth: "SC3 -- lz-deep-research's graded quality is measured against the built-in baselines AND the expert-labeled gold, reported as a PARITY measurement + an operating envelope"
    status: failed
    reason: "Zero grading occurred. The Stage-2 judge gate returned cleared:false and the PAR-02 disqualifier fired, correctly, before any report was admissible. eval/.cache/p22-baseline/judge/ is empty; parityVerdict was never called over scored cells; no operating envelope was produced."
    artifacts:
      - path: "eval/.cache/p22-baseline/judge/"
        issue: "empty directory -- no per-cell judge record exists"
      - path: "eval/lz-eval-parity-judge.mjs"
        issue: "exists, 103 tests green across the phase-22 suite, but never executed on real judge output"
      - path: "eval/lz-eval-parity-verdict.mjs"
        issue: "exists and tested, never executed on real scored cells"
      - path: "eval/lz-eval-sliceA-gold.mjs"
        issue: "exists and tested, never executed on a real Slice-A run"
    missing:
      - "A calibrated Stage-2 judge (both attempted instruments failed the frozen bar: 0.4889 and 0.4531 against a 0.5 point bar)"
      - "Per-dimension blind/position-swapped grading of the captured pair"
      - "The Slice-A descriptive per-direction tally"
      - "The two-layer mechanical verdict + operating envelope"
    closure_route: "NEW phase only -- see the closure-route note below."
  - truth: "SC6 -- the outcome states plainly whether Sonnet-on-lz-deep-research is at parity (scoped) or has a named gap"
    status: failed
    reason: "The outcome is stated plainly and honestly, but it does not answer SC6's question. What is named is a gap in the MEASUREMENT INSTRUMENT ('Phase 22 could not construct a judge that clears its own pre-registered calibration bar'), not a parity finding or a named gap in the skill. 22-05-SUMMARY.md states this itself: 'This is NOT evidence about the lz-deep-research skill in either direction.' SC6's second clause ('Sonnet-default ships regardless') IS satisfied -- D-03 is carried explicitly and nothing here blocks the release."
    artifacts:
      - path: ".planning/phases/22-.../22-05-SUMMARY.md"
        issue: "correctly declines to state a parity verdict; therefore SC6's first clause is unanswered rather than answered"
    missing:
      - "A statement about the SKILL -- at parity (scoped), or a named gap in the skill. Requires a working measurement instrument first."
    closure_route: "NEW phase only -- see the closure-route note below."
  - truth: "Phase requirement bookkeeping is consistent across REQUIREMENTS.md, ROADMAP.md and the plan SUMMARY frontmatter"
    status: failed
    reason: "22-02-SUMMARY.md frontmatter declares three behavioral requirements complete that are not. REQUIREMENTS.md and ROADMAP.md are correct; the SUMMARY is the outlier. A 3-source cross-reference in /gsd-audit-milestone could silently close PAR-02, PAR-03 and PAR-06 on the strength of this line."
    artifacts:
      - path: ".planning/phases/22-.../22-02-SUMMARY.md"
        issue: "line 49: `requirements-completed: [PAR-02, PAR-03, PAR-06]` -- all three are behavioral requirements that 22-02 did not satisfy; it landed only the harness modules"
    missing:
      - "Correct 22-02-SUMMARY.md frontmatter to `requirements-completed: []` with the same note 22-01-SUMMARY.md carries ('satisfied at the module level only; Pending until the 22-05 spend validates them end-to-end')"
  - truth: "No committed artifact instructs a future session to perform an action the frozen stopping rule forbids"
    status: failed
    reason: "Two committed artifacts still describe 22-05 as pending and one actively instructs launching the now-consumed attempt. The write-once clause states the single authorized attempt is CONSUMED at the first landed verdict file; a session resuming from these would violate the pre-registration."
    artifacts:
      - path: ".planning/phases/22-.../.continue-here.md"
        issue: "frontmatter `status: paused-before-spend`, `last_updated: 2026-09-04`; title says the Opus 5 re-run is 'AUTHORIZED (Option 3), NOT yet launched'; its `<next_action>` block reads 'launch the single authorized ~60-call Opus 5 calibration in resumable waves'. The run completed 2026-09-05 and the attempt is spent."
      - path: ".planning/ROADMAP.md"
        issue: "the 22-05 plan line is still `- [ ]` with no TERMINAL/HALTED annotation, unlike 22-02/22-03/22-04 which each carry a `-- DONE ...` note. Commit c131e1a ('record plan 22-05 as TERMINAL') touched only STATE.md and 22-05-SUMMARY.md."
      - path: ".planning/STATE.md"
        issue: "line 40 is still tagged `[2026-06-23 -- CURRENT]` and ends 'NEXT (more session-pool spend): Stage 2 Opus judge MCC calibration ... -> 22-PARITY-RESULT.md (scoped n=1)'. The top-of-file `stopped_at` IS correct and current; only this log entry's CURRENT tag is stale."
    missing:
      - "Delete or supersede .continue-here.md with a TERMINAL marker that forbids re-launch"
      - "Annotate the ROADMAP 22-05 line as TERMINAL/HALTED (no parity verdict; attempt consumed; closure requires a NEW phase)"
      - "Re-tag the 2026-06-23 STATE.md entry as historical so `CURRENT` points only at the halt"
human_verification:
  - test: "Confirm no GitHub Copilot AI Credits were spent during the 2026-09-05 Phase-22 calibration session (check the Copilot usage dashboard for the run window)."
    expected: "Zero AI Credits consumed on 2026-09-05. The 17.92 credits disclosed in 22-CONTEXT.md line 19 belong to the 2026-06-22 pre-phase design board, which is outside D-18's 'INSIDE the eval' scope."
    why_human: "Absence of an external metered API call is not observable from the repository. The structural half IS verified (the driver has no callOof/makeCopilotCallModel transport; `rg` over the phase-22 eval modules returns no OOF references), but only the account's usage record can confirm the behavioral half."
  - test: "Confirm the n=3 -> n=1 Slice-B scope reduction was a maintainer decision and decide whether it needs a retrospective amendment note."
    expected: "STATE.md line 40 records 'Option A (full n=3) remains deferred per the maintainer'. No AMENDMENT RECORD covers this reduction, unlike the k=2 -> k=1 reduction which IS covered by the 2026-06-23 re-freeze."
    why_human: "Whether an un-amended scope reduction is acceptable under this pre-registration is a maintainer judgment, not a codebase fact. It is moot for the halted run (nothing was graded) but matters for the successor phase's pre-registration."
---

# Phase 22: Deep-research skill eval and parity baseline with built-in deep-research -- Verification Report

---

> ## ORCHESTRATOR RESOLUTION of the two `human_verification` items (added 2026-09-06)
>
> The verifier's report below is unaltered. Both items it routed to a human have now been answered by
> the maintainer. Recorded here so the milestone audit does not re-raise them.
>
> **Item 1 -- zero GitHub Copilot AI Credits during the 2026-09-05 calibration.** RESOLVED AS FAR AS IT
> CAN BE, and permanently moot going forward. The maintainer stated on 2026-09-06 that **Copilot AI
> Credits are no longer available at all and cross-family advisory is out of the question**. That does
> not retroactively read the 2026-09-05 usage record, so the behavioral attestation stays exactly where
> the verifier put it: unconfirmed from the repository. What IS verified, independently and twice, is the
> structural half -- `gsd-security-auditor` found zero `callOof`, `copilot`, `child_process`, `execSync`,
> `spawn`, `fetch(` or `http(s)://` occurrences across all seven Phase-22 modules (T-22-07 / T-22-12), and
> the driver explicitly removes the live-cert driver's OOF transport. Since no OOF call is *possible*
> from this code, and the capability is now withdrawn account-wide, D-18 is satisfied structurally and no
> successor phase can breach it. Do not carry this as open debt.
>
> **Item 2 -- the n=3 -> n=1 Slice-B reduction.** RESOLVED: the maintainer directed that **if the agent
> made the call, it gets a note**. It did. A `RETROSPECTIVE DEVIATION NOTE` is now appended to
> `eval/lz-eval-parity-prereg.md`, with a pointer beside the frozen Slice-B set in Section (ii). It is
> explicitly NON-AUTHORIZING -- it amends nothing and changes no number (anti-drift co-test still 8/8).
> Finding of fact: the maintainer **deferred** the full campaign; the executing session then carried
> `n=1` forward as a settled design. A deferral is not a ratified reduction. The contrast that decides
> it: the sibling scope change made the same day (question narrowing + k=2 -> k=1) IS covered by
> AMENDMENT RECORD 1, which calls itself "maintainer-ratified" in its own words. This one has no
> counterpart. Nothing was graded, so no result is tainted; the successor phase must either capture
> q2/q3 or freeze a smaller set explicitly in its own pre-registration.

---

**Phase Goal:** Establish that `lz-deep-research` on Sonnet produces research of quality EQUIVALENT to the built-in `/deep-research`, via a holistic system-level eval on two tracks (architectural parity + measured parity). Outcome: a scoped parity claim + operating envelope, OR an honest, named gap. Sonnet-default ships regardless.

**Verified:** 2026-09-05
**Status:** gaps_found
**Re-verification:** No -- initial verification

## Verdict in one paragraph

The halt is real, disciplined, and independently reproducible -- I did not take a single number on trust and every check I could run came back clean. But the phase did not achieve its goal. Three of six Success Criteria are met. The measured-parity track (half of D-02's "both required" design) produced zero signal about the system under test, and the phase's own summary says so plainly. The Phase Boundary sentence in `22-CONTEXT.md` DOES contain the words "or an honest, named gap" -- but both branches of that sentence are findings about the SKILL, and what was delivered is a named gap in the MEASUREMENT INSTRUMENT. That is a third outcome the boundary did not contemplate, and calling it the second branch would stretch the language past what it says. The correct reading: **the phase could not reach either branch, and reported that honestly instead of manufacturing one.** That is a good failure, not a success.

## Goal Achievement

### Observable Truths (ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | 2-3 baseline reports by built-in `/deep-research` on the frozen set; lz on the SAME questions | ✗ FAILED (partial) | Frozen set = n=3 (prereg Section (ii)). Only q1 captured: `eval/.cache/p22-baseline/{builtin,lz}/qB1-run1.report.md`. No qB2/qB3 for either system. No MANIFEST anywhere under `eval/.cache/p22-baseline/`. |
| 2 | Holistic rubric defined and FROZEN before grading; factual/citation anchored on expert-labeled gold | ✓ VERIFIED | `eval/lz-eval-parity-prereg.md` frozen at commit `ae7294d` (2026-06-22T20:23:01Z). 5 Anthropic dimensions, verdict-collapse map, MCC bar Section (iv), Slice-A feasibility gate Section (v), two-layer bar Section (vi). Anti-drift test `lz-eval-parity-prereg.test.mjs` green. Gold = vendored WiCE (60 records, digest verified by me). |
| 3 | lz's graded quality measured vs baselines AND gold; reported as a PARITY measurement + operating envelope | ✗ FAILED | `eval/.cache/p22-baseline/judge/` is EMPTY. `parityVerdict` never called over scored cells. No operating envelope exists. Stage-2 disqualifier fired first. |
| 4 | Architectural-parity argument documented, citing Anthropic's holistic-eval philosophy | ✓ VERIFIED | `eval/lz-eval-parity-architecture.md`, 230 lines, 7 sections. Leads with a docs-grounded disclaimer. Cites both Anthropic eval posts + the workflows docs. Preserve-vs-collapse contrast grounded in the shipped schema (39 hits across Contested/Unsupported/abstention/disconfirming/source-independence/two-assurance). Summary table is narrow and does not overclaim "exceeds". |
| 5 | ZERO GitHub AI Credits; all model use is the Claude pool; the eval tree never ships | ✓ VERIFIED (one residual attestation) | Structural: `eval/lz-eval-parity-driver.md` explicitly REMOVES `callOof`/`makeCopilotCallModel` (11 prohibition references); no OOF transport in any phase-22 module. Packaging: `lz-eval-packaging-boundary.test.mjs` 2/2 green -- no package.json/node_modules under the plugin tree, no runtime `.mjs` imports any `eval/` script. Residual: the behavioral no-spend attestation is human-confirmable only (see human_verification). |
| 6 | The outcome states plainly whether Sonnet-on-lz-deep-research is at parity (scoped) or has a named gap; Sonnet-default ships regardless | ✗ FAILED (clause 1) / ✓ (clause 2) | The named gap is in the INSTRUMENT, not the skill. 22-05-SUMMARY.md: "This is NOT evidence about the lz-deep-research skill in either direction." SC6's question is therefore unanswered. Clause 2 holds: D-03 is carried, nothing blocks the release. |

**Score: 3/6 success criteria verified.**

### Fabrication check -- CLEAN

| Check | Method | Result |
|-------|--------|--------|
| `22-PARITY-RESULT.md` absent from the working tree | `find` + `git ls-files` | ABSENT |
| `22-PARITY-RESULT.md` never existed in history | `git log --all --diff-filter=A -- "*PARITY-RESULT*"` | EMPTY -- never added on any branch |
| No graded-report artifact anywhere | `ls eval/.cache/p22-baseline/judge/` | EMPTY directory |
| No artifact claims a cleared Stage-2 gate | `rg` for `cleared.*true` / parity verdicts across `eval/*.md`, phase artifacts, ROADMAP, STATE | Only test fixtures, prohibition text, and the 4.x record's explicitly-FORBIDDEN subgroup diagnosis. No claim of a cleared gate. |
| No cost claim masquerading as a parity verdict | Read STATE.md line 40 | It carries a "COST-PARITY HEADLINE (notional, n=1) ... ~3.6x cheaper" but explicitly states "QUALITY verdict NOT pre-judged". A cost observation, not a parity verdict. Stale (see gap G5) but not a fabrication. |

### Stopping-rule integrity -- HONORED (independently reproduced)

I re-derived the headline result from the committed rows rather than reading it:

```
node <recompute over the 60 rows in lz-eval-parity-calibration-opus5-record.md>
  parsed 60 rows, 60 unique uids
  tp=17 fp=7 tn=27 fn=9  acc=0.733
  gold: 26 unrefuted / 34 refuted / 17 subtle  (all 17 subtle -> gold refuted: single-pole, as disclosed)
  judgeCalibrationGate -> mcc=0.4531 lowerCI=0.2366 cleared=false
```

Byte-identical to the claim. The record is genuinely reproducible from a fresh clone, which is exactly what it promises.

| Frozen constraint (AMENDMENT RECORD 3) | Independent check | Result |
|---|---|---|
| Prompt unchanged (`cb3d567a7ac0...47247e6`) | `sha256sum eval/lz-eval-parity-calibration-prompt.md` | MATCH |
| 60 WiCE records unchanged (`2353066d70c5...7e82e6b`) | `find ... \| sort \| xargs sha256sum \| sha256sum` | MATCH; count = 60 |
| Prompt never revised | `git log -- eval/lz-eval-parity-calibration-prompt.md` | ONE commit (2026-06-23), never edited since |
| WiCE draw never widened | `git log -- eval/__fixtures__/wice-vendored/records` | ONE commit (2026-06-16), never edited since |
| No third instrument | `ls eval/.cache/p22-baseline/` | Exactly two calibration sets: `calibration-opus4x/` (60) + `calibration/` (60) |
| Single instrument per set | `rg '"model"' calibration/*.verdict.json \| sort \| uniq -c` | 60/60 `claude-opus-5` |
| No subgroup read in the Opus 5 record | `rg -i "subgroup\|clear-cut\|per-subset\|n=43"` on the record | No figures -- only the ban statement. Aggregate matrix + raw rows only. |
| Amendment predates the run | `git log -- eval/lz-eval-parity-prereg.md` | AMENDMENT RECORD 3 committed 2026-09-04; run 2026-09-05 |
| Bar not lowered | `JUDGE_MCC_BAR` in `lz-eval-judge-calibration.mjs` | `{POINT:0.5, ALPHA:0.05, LOWER_FLOOR:0}` -- unchanged, anti-drift test green |

I deliberately did NOT compute a subgroup MCC over the Opus 5 set. The stopping rule bans the read, and materializing one into a verification artifact would hand a future reader exactly the post-hoc figure the ban exists to remove.

One note, not a finding: the calibration prompt was first committed 2026-06-23, one day AFTER the freeze commit `ae7294d`. That is consistent -- the freeze covered the prereg (rubric, question lists, collapse map, bar, gate, fallback, k), and the prompt was authored later as no-spend Stage-2 prep, before any calibration verdict landed, then pinned by sha256 in Amendment 3 and used byte-identically by both instruments.

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `eval/lz-eval-parity-prereg.md` | Frozen pre-registration | ✓ VERIFIED | Frozen `ae7294d`; 3 amendment records; anti-drift test green |
| `eval/lz-eval-parity-driver.md` | Session driver, no OOF | ✓ VERIFIED | `callOof` explicitly removed; 11 prohibition references |
| `eval/lz-eval-parity-architecture.md` | PAR-07 write-up | ✓ VERIFIED | 230 lines, docs-grounded, substantive |
| `eval/lz-eval-judge-calibration.mjs` | MCC gate | ✓ VERIFIED + EXERCISED | Gate ran on 60 real verdicts; I reproduced the result |
| `eval/lz-eval-parity-calibration-harness.mjs` / `-dispatch.mjs` | Calibration transport | ✓ VERIFIED + EXERCISED | Tests green; drove the real run |
| `eval/lz-eval-parity-calibration-opus5-record.md` | Durable committed null | ✓ VERIFIED | Reproduced from committed rows; commit `f288767` |
| `eval/lz-eval-parity-calibration-opus4x-record.md` | Prior disqualified instrument | ✓ VERIFIED | Present, 60 rows |
| `eval/lz-eval-parity-judge.mjs` | Position-swap cell scorer | ⚠️ NEVER EXERCISED | Exists, tested; never run on real judge output |
| `eval/lz-eval-parity-verdict.mjs` | Two-layer verdict | ⚠️ NEVER EXERCISED | Exists, tested; never run on real cells |
| `eval/lz-eval-sliceA-gold.mjs` | Slice-A collapse/filter/tally | ⚠️ NEVER EXERCISED | Exists, tested; Slice A never ran |
| `eval/lz-eval-baseline-manifest.mjs` | Fail-closed MANIFEST | ⚠️ NEVER EXERCISED | Exists, tested; zero MANIFEST files on disk |
| `22-PARITY-RESULT.md` | Parity result | ✓ ABSENT BY DESIGN | Never existed in any commit -- correct |
| `22-VALIDATION.md` | Validation contract | ⚠️ DRAFT | `status: draft`; Per-Task Verification Map is a single `TBD` row; sign-off unchecked. `/gsd-validate-phase` appears never to have run for this phase. |

The four ⚠️ NEVER EXERCISED modules are not stubs -- they are complete, discrimination-proven, and 103 tests pass across the phase-22 suite. They are simply untested against real data, which is the direct consequence of the halt and is the honest state to record.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Phase-22 eval suite green | `node --test` over the 8 phase-22 `.test.mjs` files (FILE-form) | 103 pass / 0 fail | ✓ PASS |
| Eval tree never ships | `node --test eval/lz-eval-packaging-boundary.test.mjs` | 2 pass / 0 fail | ✓ PASS |
| Gate reproduces from committed rows | `judgeCalibrationGate` over the 60 record rows | `mcc=0.4531 lowerCI=0.2366 cleared=false` | ✓ PASS |
| Frozen prompt pin | `sha256sum` | MATCH | ✓ PASS |
| Frozen item-set pin | `find \| sort \| xargs sha256sum \| sha256sum` | MATCH | ✓ PASS |
| No runtime -> eval import | `rg "from ['\"].*eval/" plugins/` | no matches | ✓ PASS |

Full-suite run used once; per-truth filtering avoided.

### Requirements Coverage

Every PAR-* ID declared across the five plans is accounted for. REQUIREMENTS.md maps exactly PAR-01..08 to Phase 22 -- **no orphaned requirements**.

| Req | Source plan(s) | Status | Evidence |
|-----|----------------|--------|----------|
| PAR-01 | 22-04 | ✓ SATISFIED | Frozen prereg at `ae7294d`; anti-drift test green; timestamp of record per D-20 |
| PAR-02 | 22-02, 22-05 | ✗ BLOCKED | Gate RAN and returned `cleared:false` (reproduced). Requirement text demands the judge CLEARS the bar. Correct behavior, unsatisfied requirement. |
| PAR-03 | 22-02, 22-05 | ✗ BLOCKED | q1 captured on both systems; q2/q3 never captured; ZERO MANIFEST files exist. Requirement demands n=2-3 captures with a MANIFEST. |
| PAR-04 | 22-01, 22-05 | ✗ BLOCKED | No grading. `judge/` empty. |
| PAR-05 | 22-01, 22-05 | ✗ BLOCKED | `parityVerdict` never called over scored cells; no result artifact. |
| PAR-06 | 22-02, 22-05 | ✗ BLOCKED | Slice A never ran. |
| PAR-07 | 22-03 | ✓ SATISFIED | `eval/lz-eval-parity-architecture.md` verified substantively |
| PAR-08 | 22-03, 22-04 | ✗ PARTIAL | Eval-tree-never-ships half VERIFIED (boundary test 2/2). Content-review half met for 22-03 + 22-04 artifacts. The 22-05 judge rubric + claim-extraction prompts were never exercised at grading time, so the phase-wide gate does NOT close. |

**Carry OPEN into `/gsd-audit-milestone`: PAR-02, PAR-03, PAR-04, PAR-05, PAR-06, PAR-08.**
**Close: PAR-01, PAR-07.**

REQUIREMENTS.md already records exactly this (lines 176-183: PAR-01 Complete, PAR-07 Complete, the rest Pending). It is the correct source. `22-02-SUMMARY.md` frontmatter contradicts it and must be corrected -- see gap G4.

### Phase Constraints

| Constraint (ROADMAP) | Status | Evidence |
|---|---|---|
| ZERO out-of-family (Copilot AI Credits) spend (D-18) | ✓ VERIFIED structurally; 1 residual attestation | No OOF transport exists in any phase-22 module or in the driver; `callOof`/`makeCopilotCallModel` explicitly removed vs the live-cert driver. The 17.92 credits in 22-CONTEXT.md line 19 are the 2026-06-22 pre-phase design board -- outside D-18's "INSIDE the eval" scope, and disclosed. |
| Eval tree never ships / zero-dep runtime | ✓ VERIFIED | Packaging-boundary test 2/2 green; no package.json or node_modules under `plugins/`; no runtime import of any `eval/` script; jstat confined to `eval/package.json` |
| Claude session pool is the bounded cost | ✓ VERIFIED | All spend recorded against the Claude pool; capture costs logged in STATE.md |
| Holistic eval, NOT a Clopper-Pearson component cert | ✓ VERIFIED | The two-layer bar is a mechanical floor+parity rule with no CIs (prereg Section (vi)); the only CI in play is the judge-calibration MCC lower bound, which gates the INSTRUMENT, not the systems |
| Pre-registration discipline: freeze before grading | ✓ VERIFIED | Freeze `ae7294d` predates all capture and calibration; both pins independently re-verified; three amendments each in their own timestamped commit, each predating the spend it governs |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `.planning/phases/22-.../.continue-here.md` | frontmatter + `<next_action>` | Stale resume file instructing a forbidden action | 🛑 BLOCKER | `status: paused-before-spend`; "NOT yet launched"; instructs "launch the single authorized ~60-call Opus 5 calibration". The attempt is CONSUMED. A `/gsd-resume-work` here would violate the write-once clause. |
| `.planning/ROADMAP.md` | 22-05 plan line | Missing TERMINAL annotation | ⚠️ WARNING | Still `- [ ]` with no disposition note while 22-02/03/04 all carry `-- DONE ...`. Reads as "not yet attempted". |
| `.planning/STATE.md` | 40 | Stale `[2026-06-23 -- CURRENT]` tag | ⚠️ WARNING | Ends "NEXT (more session-pool spend): Stage 2 ... -> 22-PARITY-RESULT.md". The top-of-file `stopped_at` IS correct; only this entry's CURRENT tag misleads. |
| `.planning/phases/22-.../22-02-SUMMARY.md` | 49 | Stale `requirements-completed` | 🛑 BLOCKER | Would silently close PAR-02/03/06 in the milestone audit's 3-source cross-reference. |
| `.planning/phases/22-.../22-VALIDATION.md` | Per-Task map | Unfilled `TBD` row, `status: draft` | ⚠️ WARNING | `/gsd-validate-phase` appears never to have run. Not a phase deliverable, but the validation contract is empty. |

No debt markers (`TBD`/`FIXME`/`XXX`) and no `TODO`/`HACK`/`PLACEHOLDER` in any phase-22 eval script.

### Closure route -- read before acting on the gaps

**Do NOT run `/gsd-plan-phase 22 --gaps`.** SC1, SC3 and SC6 cannot be closed inside Phase 22: the AMENDMENT RECORD 3 stopping rule is frozen, the single authorized attempt is consumed at the first landed verdict file, and the rule bans a third instrument, a prompt revision, a widened WiCE draw and a subgroup read. Re-planning Phase 22 to close them would break the pre-registration this phase spent its integrity honoring.

The correct route, prescribed by 22-05-SUMMARY.md itself, is a **NEW phase under its own fresh pre-registration**, carrying at minimum:

1. The construct question -- is a WiCE-collapsed pooled MCC gate the right Stage-2 instrument for a deep-research parity comparison at all?
2. The single-pole subtle-subset defect (all 17 `partially_supported` items collapse to gold `refuted`; tp and fn are zero by construction, so the subset can only depress a pooled MCC -- I confirmed this independently from the committed rows).
3. The near-bar power question retired with Conditional C.
4. The two-token output contract weakness (3 of 60 verdicts carry reasoning contradicting their own token).
5. A harness that PERSISTS the exact dispatched string per item, closing the UNVERIFIED transcription assumption -- the weakest link in the current record and honestly labelled as such.
6. The relocated LLM-AggreFact cross-dataset transfer diagnostic (descriptive-only, never a soft gate).

Gaps G4 (the 22-02 frontmatter) and G5 (the stale artifacts) are the exception: they are documentation corrections with no spend and no pre-registration exposure, and should be fixed now, before `/gsd-audit-milestone`.

### Gaps Summary

Phase 22 delivered one of its two required tracks. The architectural-parity track (D-02 track 1, PAR-07) is complete and substantive. The measured-parity track produced a frozen, well-built, fully tested harness and a rigorously documented null -- and no measurement.

What earns credit here is that the null is honest and checkable. I reproduced the headline number from committed data, verified both frozen pins myself, confirmed from git history that neither the prompt nor the item set was ever touched, confirmed exactly two instruments exist, and confirmed the Opus 5 record carries no subgroup figure even though the 4.x diagnosis had already shown a clear-cut subset that satisfies the entire predicate. The tempting moves were all available and all declined. That is the pre-registration doing the job it was built for.

What it does not earn is a pass. The goal was to establish parity or name a gap in the skill; the eval never read a report, so the question is untouched. Success Criteria 1, 3 and 6 are not met, and five requirements plus the PAR-08 remainder stay open. Per D-03 and the ROADMAP's own framing this blocks nothing -- Sonnet-default ships regardless, this was always confidence work rather than a ship gate -- but the milestone audit must carry the open requirements rather than close them, and the three stale artifacts must be corrected so nobody re-runs a consumed attempt.

---

_Verified: 2026-09-05_
_Verifier: Claude (gsd-verifier)_
