---
phase: 22-deep-research-skill-eval-and-parity-baseline-with-built-in-d
plan: 05
status: halted
outcome: "Stage-2 judge calibration FAILED on the single authorized re-calibration instrument (mcc=0.4531 lowerCI=0.2366 cleared=false n=60). Per PAR-02 an uncalibrated judge is a DISQUALIFIER, so NO report was graded and no parity verdict exists. Per the AMENDMENT RECORD 3 pre-committed stopping rule the phase HALTS. Phase Boundary satisfied on its second branch: an honest, named gap."
subsystem: testing
tags: [eval, parity, deep-research, judge-calibration, pre-registration, stopping-rule, halted, disqualifier, no-verdict]

# Dependency graph
requires:
  - phase: 22-01
    provides: the frozen PARITY_BAR + PARITY_K_RANGE + the mechanical parityVerdict (never reached -- no cells were scored)
  - phase: 22-02
    provides: judgeCalibrationGate (the Stage-2 predicate that returned cleared:false), the WiCE calibration harness, buildManifest/validateManifest, sliceAGold (the latter two never reached)
  - phase: 22-04
    provides: the FROZEN, timestamped pre-registration (freeze commit ae7294d) + AMENDMENT RECORD 3's forced-instrument-replacement authorization and its pre-committed stopping rule
provides:
  - eval/lz-eval-parity-calibration-opus5-record.md -- the durable, committed Opus 5 calibration record (aggregate confusion matrix + all 60 per-item rows)
  - "the TERMINAL disposition of Phase 22's measured-parity track: no parity verdict, an honest named gap, and a construct question deferred to a NEW phase under its OWN fresh pre-registration"
affects: [milestone-audit -- PAR-02..PAR-06 remain unsatisfied and must NOT be closed off this plan]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "pre-committed stopping rule honored ON A FAILURE: the amendment authorized EXACTLY ONE re-calibration; it failed; the phase halted with no third instrument, no prompt revision, no widened draw, no subgroup read"
    - "durable null: the failing calibration is COMMITTED (aggregate + all 60 rows) rather than left in gitignored eval/.cache/, so a replicator can reproduce the null from a fresh clone"
    - "write-once verdict files: the single authorized attempt is CONSUMED at the first landed verdict, so a partial re-roll is indistinguishable from a resume and is therefore forbidden"

key-files:
  created:
    - eval/lz-eval-parity-calibration-opus5-record.md
  modified: []
  absent-by-design:
    - .planning/phases/22-deep-research-skill-eval-and-parity-baseline-with-built-in-d/22-PARITY-RESULT.md

key-decisions:
  - "The Stage-2 gate returned cleared:false. Per PAR-02 / D-13 an uncalibrated judge is a DISQUALIFIER, not a soft warning -- so Stage 3 (grading), Stage 4 (Slice A), and Stage 5 (the two-layer verdict) were NOT run and incurred zero spend."
  - "22-PARITY-RESULT.md does NOT exist and must not be fabricated. There is no parity verdict -- not PARITY, not SCOPED-PARITY, not NAMED-GAP-as-a-graded-outcome. The judge never read a report."
  - "The phase HALTS under the AMENDMENT RECORD 3 stopping rule, frozen before the run: no third instrument, no prompt revision, no widening of the WiCE draw, no subgroup read."
  - "Conditional C was retired PROSPECTIVELY in AMENDMENT RECORD 3 and was not invoked; the realized shape would not have triggered it in any case."
  - "This is NOT evidence about the lz-deep-research skill in either direction. The failure is a verdict about the measurement INSTRUMENT; the judge never graded a report, so the eval produced no signal about the skill."
  - "PAR-02, PAR-03, PAR-04, PAR-05, PAR-06 all remain UNSATISFIED. None may be closed off this plan."

patterns-established:
  - "Pattern 1: a pre-registered stopping rule is only worth what it costs to honor when it bites. It bit here -- the tempting moves (a third instrument, a prompt tweak, a wider draw, the clear-cut subgroup that satisfies the entire predicate) were all pre-banned and all declined."
  - "Pattern 2: report a null on a re-runnable instrument, and publish it. The prior Opus 4.x null was on a judge nobody can invoke again; this one is reproducible from a fresh clone."

requirements-completed: []

# Metrics
duration: single sitting (run 2026-09-05; record committed 2026-09-05T02:18:09+02:00)
completed: 2026-09-05
---

# Phase 22 Plan 05: TERMINAL -- Stage-2 judge calibration failed; the phase HALTS with no parity verdict

**The single re-calibration authorized by AMENDMENT RECORD 3 of `eval/lz-eval-parity-prereg.md` ran to completion over all 60 vendored WiCE items on Opus 5 and FAILED the frozen Stage-2 judge gate: `mcc=0.4531 lowerCI=0.2366 cleared=false n=60`, against a bar of `MCC >= 0.5` and `lowerCI > 0`. Per PAR-02 an uncalibrated judge is a DISQUALIFIER, so NO report was graded -- Stage 3 (grading), Stage 4 (Slice A), and Stage 5 (the two-layer verdict) never ran, and `22-PARITY-RESULT.md` does not exist. Per the pre-committed stopping rule the phase HALTS: no third instrument, no prompt revision, no widening of the WiCE draw, no subgroup read. The remaining construct question is deferred to a NEW phase under its OWN fresh pre-registration.**

This plan is TERMINAL, not paused. Its single authorized attempt is spent (consumed at the first landed verdict file, per the AMENDMENT RECORD 3 write-once clause). No remaining 22-05 task may be executed under this plan.

## The gate result

| | Opus 4.x (pre-registered judge, disqualified) | Opus 5 (forced replacement) |
|---|---|---|
| MCC (point) | 0.4889 | **0.4531** |
| one-sided lower CI | 0.2722 | **0.2366** |
| `cleared` | false | **false** |
| accuracy | 0.750 | 0.733 |
| tp / fp / tn / fn | 18 / 7 / 27 / 8 | 17 / 7 / 27 / 9 |

Bar (frozen, NOT lowered): `JUDGE_MCC_BAR.POINT = 0.5`, `JUDGE_MCC_BAR.LOWER_FLOOR = 0`. BCa knobs pre-registered in AMENDMENT RECORD 3: `alpha = 0.05`, `resamples = 2000`, `seed = 'bca'`.

Aggregate confusion matrix (positive class = `unrefuted`): `ALL n=60 tp=17 fp=7 tn=27 fn=9 acc=0.733`. Set shape: `total=60 unrefuted=26 refuted=34 subtle=17` -- the frozen AMENDMENT RECORD 2 draw.

The forced instrument replacement did not rescue the gate. It scored slightly LOWER than the disqualified instrument on every headline figure. That is stated plainly because AMENDMENT RECORD 3's own justification for re-running at all was that a null on a re-runnable judge beats a null on a judge nobody can invoke again. This is that: a null a replicator can reproduce.

## What did NOT run (and must not be reported as if it had)

- **Stage 3 -- grading (PAR-04).** No report was graded. No per-cell judge record exists. No claim-extraction bridge run occurred.
- **Stage 4 -- Slice A (PAR-06).** No verify-voter dispatch, no per-direction tally.
- **Stage 5 -- the two-layer verdict (PAR-05).** `parityVerdict` was never called over scored cells.
- **`22-PARITY-RESULT.md` does not exist.** It must NOT be fabricated, back-filled, or synthesized from the calibration numbers. There is no parity verdict of any kind.
- **No capture grading (PAR-03).** The Stage-2 disqualifier fires before any report is admissible as evidence.

Zero Stage-3+ spend was authorized or incurred.

## Stopping rule -- honored as frozen

AMENDMENT RECORD 3 authorized EXACTLY ONE re-calibration, on the forced-replacement instrument, prompt and item set unchanged, and pre-committed the consequence of a `cleared === false`:

- **No third instrument.** Declined.
- **No prompt revision.** Declined.
- **No widening of the WiCE draw.** Declined. (Option B -- importing LLM-AggreFact into the gate -- remains EXCLUDED.)
- **No subgroup read.** Not merely unreported -- **not computed**. Unlike the 4.x diagnosis, this record deliberately contains no per-subset MCC. The 4.x diagnosis had shown the clear-cut subset (n=43) satisfies the ENTIRE predicate, `cleared === true`; selecting it after seeing a pooled failure is exactly the post-hoc subgroup selection PAR-02's "NEVER relax the bar" forbids, and the operative ban is that NO subgroup figure may authorize Stage-3 spend. The committed record carries only the aggregate matrix and the raw per-item rows, so a replicator can compute whatever a fresh pre-registration licenses them to compute.
- **Conditional C.** Retired PROSPECTIVELY in AMENDMENT RECORD 3 (resolved before the run precisely so a near-bar shape could not be argued either way after the fact). Not invoked; the realized shape would not have triggered it in any case.

## Where the record lives

- **Committed (durable, reproducible from a fresh clone):** `eval/lz-eval-parity-calibration-opus5-record.md` -- commit `f288767` (`f288767d8d0235fe727ff7d09e5f855cc24c0b0b`, 2026-09-05T02:18:09+02:00 / UTC 2026-09-05T00:18:09Z). Contains the gate result, the aggregate confusion matrix, the instrument of record, the pre-run gate table, the 4.x comparison, the realized fidelity limits, and all 60 `{uid, verdict, gold, subtle, outcome}` rows.
- **Session run notes (GITIGNORED, dies with one `git clean -xdf`):** `eval/.cache/p22-baseline/calibration-opus5-run-notes.md`.
- **Raw verdict files (GITIGNORED):** `eval/.cache/p22-baseline/calibration/`. The prior 4.x set is at `eval/.cache/p22-baseline/calibration-opus4x/`, with its own durable committed record at `eval/lz-eval-parity-calibration-opus4x-record.md`.

## Run properties of record

1. **Both sha256 pins verified TWICE -- before verdict #1 AND again after the last.** Calibration prompt `cb3d567a7ac099099453834f06db89f84c7b063c0eda317fd541e707747247e6` -- MATCH. The 60 vendored WiCE records digest `2353066d70c5a4b421bc9294a620ac98f42cd3566ec705d524961c6da7e82e6b` -- MATCH. "Unchanged" is pinned, not asserted, and it held across the whole run rather than only at the start.
2. **Single-instrument check PASSED.** All 60 verdict files pin `claude-opus-5`; `assembleGateInput`'s single-instrument check confirmed the set spans exactly one model string. An MCC over a set straddling two generations measures nothing, and this set does not straddle.
3. **Anti-leak mitigation HELD in every case.** All 60 judge sub-agents returned `tool_uses: 0`. The Agent tool cannot restrict a spawned agent's tools, so the judge ran on a general-purpose persona that DID possess file tools while the WiCE gold sat on disk; the mitigations were the emphatic no-tools instruction plus uid omission. The measured outcome makes this an observation, not a hope.
4. **One transient transport interruption.** Dispatching `dev00131-0` was refused once with "Output blocked by content filtering policy" -- the orchestrator's own dispatch, no sub-agent spawned, no verdict file created. Disk state was verified (31 landed / 29 pending, the uid absent) and the identical dispatch succeeded on retry, so the block was transient. Recorded because an unexplained gap in a one-shot calibration is exactly what a replicator needs to see.
5. **Three of sixty verdicts carry reasoning that contradicts their own verdict token** (`dev00016-1`, `dev00219-1`, `dev00429-0`). All three were persisted VERBATIM: each verdict is parseable and in-enum, so the write-once clause does not permit discarding it, and `readVerdict` scores only the token. A judge whose stated reasoning argues the opposite of its emitted verdict is measured on the token, not the argument -- a limitation of the two-token output contract. Descriptive; changed no verdict; a seed for the future phase; NOT offered as an explanation for the failure and not usable to argue the set up or down.
6. **NEW fidelity limit -- transcription, UNVERIFIED (not anticipated by AMENDMENT RECORD 3).** The pre-registration requires the payload INLINED in the agent prompt and forbids the judge reading the dispatch file, so the orchestrating session hand-transcribed ~520 KB of evidence across the 60 dispatches. Transcription drift would silently alter the instrument. Mitigation applied: the 60 items share only 29 unique evidence documents, each read immediately before dispatch and reused verbatim within its group. The independent check was written (`eval/.cache/p22-baseline/verify-transcription.mjs`) and run over all 63 task transcript files -- and came back **INCONCLUSIVE, not passing**: it recovered ZERO payloads because 62 of the 63 transcript files are 0 bytes and the transport retains no readable copy of the outbound prompt. **Transcription fidelity is therefore an UNVERIFIED assumption of this run** -- the weakest link in the record. A future phase should close it by having the harness itself persist the exact dispatched string per item.
7. **Pre-existing fidelity limits carried forward.** Temperature: the driver specifies temp 0, but the Agent sub-agent transport exposes no temperature knob, so the judge ran at the sub-agent default. Instrument provenance: `claude-opus-5` is the generation the `opus` alias resolved to for this account in this session, taken from the orchestrating session's own identity -- NOT a per-call attestation (the Agent tool exposes none). It establishes the GENERATION, not the individual call.
8. **Zero out-of-family spend (D-18).** No Copilot / GPT / Gemini call occurred. All model use was the Claude session pool.

## Framing against the Phase Boundary

The Phase 22 boundary in `22-CONTEXT.md` sanctions two acceptable outcomes: "a SCOPED, defensible 'Sonnet works for lz-deep-research, at parity with the blessed reference' claim + an operating envelope -- **or an honest, named gap**."

**This is the second branch.** The named gap is precise and it is a gap in the MEASUREMENT INSTRUMENT, not in the artifact under test:

> Phase 22 could not construct a judge that clears its own pre-registered calibration bar. Two instrument generations were tried under an unchanged bar, unchanged items, and an unchanged prompt; both failed (0.4889 and 0.4531 against a 0.5 point bar). The measured-parity track therefore produced no parity verdict, and the construct question -- whether this Stage-2 gate is the right instrument for this comparison at all -- is deferred to a new phase under its own fresh pre-registration.

**This is NOT a failure of the `lz-deep-research` skill.** The judge never read a report. The eval produced no evidence about the skill in either direction -- it did not find the skill wanting, and it did not clear it. Any downstream claim in either direction is unsupported by this plan.

Per D-03, the Sonnet-default `lz-deep-research` skill ships regardless: this track was always confidence / scientific-completeness work, never a ship gate. That disposition is unchanged by the halt.

The architectural-parity track (D-02 track 1) is independent of this plan and unaffected.

## Requirements status

| Requirement | Status after this plan |
|-------------|------------------------|
| PAR-02 | **NOT satisfied.** The gate ran and returned `cleared:false`. The DISQUALIFIER path fired exactly as pre-registered -- correct behavior, unsatisfied requirement. |
| PAR-03 | **NOT satisfied.** No capture was graded; the Stage-2 disqualifier precedes admissibility. |
| PAR-04 | **NOT satisfied.** No grading ran. |
| PAR-05 | **NOT satisfied.** No verdict was assembled; `22-PARITY-RESULT.md` does not exist. |
| PAR-06 | **NOT satisfied.** Slice A did not run. |

None of these may be closed off this plan, and none may be marked satisfied by the milestone audit on the strength of the landed harness alone -- the harnesses landed in 22-01/22-02; the BEHAVIORAL requirements were this plan's, and they are open.

`PAR-08` (the phase-wide content-review gate that 22-04 left partial pending "the 22-05 judge rubric + claim-extraction prompts") also does NOT close: those prompts were never exercised at grading time.

## Deviations from Plan

The plan's Tasks 2 and 3 were not completed, by pre-registered design rather than by deviation:

- **Task 2 (PAR-02 / PAR-03)** ran its PAR-02 half to completion and hit its own explicit HALT clause: *"If cleared === false, HALT: the judge is a DISQUALIFIER -- do NOT grade any report (D-13)."* The PAR-03 capture half was therefore not run.
- **Task 3 (PAR-04 / PAR-06 / PAR-05)** was never entered. It is gated behind a cleared judge.

Following the halt IS executing the plan as written. The plan's own success criteria anticipate this: *"a below-bar judge would have HALTED as a disqualifier."*

## Issues Encountered

- The transient content-filter refusal on the `dev00131-0` dispatch (item 4 above) -- resolved on an identical retry, no state corruption, recorded rather than smoothed over.
- The transcription-fidelity check could not be completed because the transport does not retain the outbound prompt (item 6 above). Reported as INCONCLUSIVE, deliberately not upgraded to a pass.
- The three self-contradicting verdict/reasoning pairs (item 5 above) -- persisted verbatim under the write-once clause.

## User Setup Required

None.

## Next Phase Readiness

- **Phase 22's measured-parity track is CLOSED with a named gap.** Do not re-open it under this pre-registration; the authorized attempt is spent and the stopping rule is frozen.
- **The deferred work needs a NEW phase with its OWN fresh pre-registration**, carrying at minimum: (a) the construct question -- is a WiCE-collapsed MCC gate the right Stage-2 instrument for a deep-research parity comparison; (b) the near-bar power question retired with Conditional C; (c) the single-pole subtle-subset instrument defect noted (all 17 `partially_supported` items collapse to gold `refuted`, so tp and fn are zero by construction and the subset can only depress a pooled MCC); (d) the two-token output contract weakness surfaced by the three contradicting verdicts; (e) a harness that PERSISTS the exact dispatched string per item, closing the unverified transcription assumption.
- **Nothing here blocks the milestone**, provided PAR-02..PAR-06 and the PAR-08 remainder are carried as OPEN into `/gsd-audit-milestone` rather than closed. Per D-03 the skill ships regardless.

## Self-Check: PASSED

- FOUND: `eval/lz-eval-parity-calibration-opus5-record.md` (committed `f288767`)
- FOUND: `eval/.cache/p22-baseline/calibration-opus5-run-notes.md` (gitignored, as expected)
- CONFIRMED ABSENT (by design): `22-PARITY-RESULT.md` -- no parity verdict exists and none was fabricated
- CONFIRMED: no remaining 22-05 task was executed by this summary write; zero model spend
- ASCII-only / LF / no BOM; no AI-attribution

---
*Phase: 22-deep-research-skill-eval-and-parity-baseline-with-built-in-d*
*Plan 05: TERMINAL (halted by pre-registration)*
*Completed: 2026-09-05*
