# lz-deep-research parity-eval session-driver protocol (Phase 22, PAR-03/PAR-04; capture + calibrate + grade)

This is the exact, step-by-step protocol a CLAUDE CODE SESSION follows AT SPEND TIME to drive the
measured parity eval of lz-deep-research against the built-in `/deep-research`. It is the operational
companion to the no-spend seams in `eval/lz-eval-parity-judge.mjs` + `eval/lz-eval-judge-calibration.mjs`
+ `eval/lz-eval-sliceA-gold.mjs` + `eval/lz-eval-parity-verdict.mjs` +
`eval/lz-eval-baseline-manifest.mjs`, and the pre-registered acceptance rule in
`eval/lz-eval-parity-prereg.md`.

It is the analog of `eval/lz-eval-live-cert-driver.md` (the Phase-20 LIVE-cert session driver): the SAME
"session drives spend, node scores from disk" discipline, the SAME transport prohibitions -- but MINUS
the out-of-family transport, which is FORBIDDEN in this phase (D-18). Following the steps below incurs
session-pool spend; this document does NOT itself spend. The spend is the human-authorized BLOCKING
checkpoint of Plan 22-05. Do NOT run any step below until the pre-registration freeze commit has landed
(`eval/lz-eval-parity-prereg.md` committed) and the go is given.

## The transport split (D-18 / D-20 -- read this first)

Two transports, two different mechanisms. Getting this wrong is the single most common error. The KEY
difference from the live-cert driver: there are ONLY TWO transports here, both session-driven; the
live-cert driver's THIRD transport, `callOof` (the Copilot CLI / metered out-of-family pool), is REMOVED
and FORBIDDEN in this phase.

| Transport | Mechanism | Pool | Node-wireable? |
|-----------|-----------|------|----------------|
| `callJudge` (the OPUS parity judge + the OPUS calibration judge) | the parity-judge Agent sub-agent, spawned via the Agent tool, per-invocation `model: opus`, temp 0, one dimension per call | the Claude SESSION pool | NO -- the Agent tool is UNAVAILABLE to a bare `node` process. SESSION-DRIVEN. |
| `callVoter` (the Slice-A verify-voter) | the Phase-18 verify-voter Agent sub-agent, spawned via the Agent tool | the Claude SESSION pool | NO -- SESSION-DRIVEN. |
| `capture` (the built-in `/deep-research` + lz-deep-research report capture) | a headless `claude -p` subprocess (capture ONLY, NOT a voter/judge transport) | the Claude SESSION pool (shared 5-hour pool) | NO model SCORING -- the captured report.md lands on disk; node scores from disk. |

The node engine SCORES FROM DISK at ZERO spend: `scoreJudgeCells` (parity judge),
`judgeCalibrationGate` (calibration), `filterSliceA` + `tallyPerDirection` + `sliceAFeasibilityGate`
(Slice A), and `parityVerdict` (the two-layer verdict) all read already-landed records / reports and
emit a verdict with NO model call. The session does the (spend) capturing + judging + voting; node does
the (no-spend) scoring.

## The ABSOLUTE no-OOF prohibition (D-18) -- contrast with the live-cert driver

The live-cert driver (`eval/lz-eval-live-cert-driver.md`) has a THIRD transport, `callOof`, wired over
`makeCopilotCallModel` -- the Copilot CLI external subprocess drawing the metered Copilot AI Credits
pool (gpt-5.5 + gemini-3.1-pro-preview gold adjudication). THAT TRANSPORT IS REMOVED HERE. There is NO
`callOof` in this phase. The gold for this eval comes ONLY from FREE expert-labeled public datasets
(WiCE / LLM-AggreFact for the judge calibration; AVeriTeC for Slice A) -- NEVER from a metered
out-of-family model and NEVER from the maintainer.

ABSOLUTE PROHIBITIONS (D-18 / PROJECT.md):

- NO out-of-family (Copilot / GPT / Gemini) model spend INSIDE this eval. There is NO OOF transport,
  no `callOof`, no `makeCopilotCallModel`, no Copilot CLI subprocess. The live-cert driver's `callOof`
  is explicitly REMOVED -- do NOT re-introduce it.
- NEVER call the Anthropic API. The Claude judge + voter spend is the Agent tool drawing the session
  pool, never the metered API.
- NEVER use `claude -p` for the judge or the voter. `claude -p` is the CAPTURE-ONLY harness here (it
  captures the built-in + lz report.md to disk); it is NOT a judge or voter transport. The judge and
  voter are Agent sub-agents on the session pool.
- The gold is the free WiCE / LLM-AggreFact / AVeriTeC corpora ONLY. No maintainer-authored gold, no
  metered-model gold.

## Why the node engine NEVER spawns judges or voters

`eval/lz-eval-parity-judge.mjs` (and the other eval `.mjs` modules) run as bare `node` processes via
`Bash(node:*)`. A bare `node` process has NO access to the Agent tool. Therefore `callJudge` and
`callVoter` CANNOT be node functions -- they are a SESSION-DRIVEN PROTOCOL the orchestrating Claude Code
session executes by spawning Agent sub-agents and landing each record on disk. The node engine then
SCORES FROM DISK with ZERO spend. There is no node-wireable spend transport in this phase at all (unlike
the live-cert phase, where `callOof` was the one node-wireable transport).

## Stage 0 -- the pre-registration freeze (precondition; NO SPEND)

`eval/lz-eval-parity-prereg.md` is COMMITTED in its OWN timestamped commit (the pre-registration
timestamp of record) BEFORE any capture or grade. The anti-drift co-test
`eval/lz-eval-parity-prereg.test.mjs` is green (the prose NUMBERS == the frozen module constants
byte-for-byte). No step below runs until that commit has landed and the human go is given.

## Stage 1 -- capture the baseline + the candidate (the `capture` transport; session pool)

Capture n=3 frozen Slice-B questions x k=1 run each (the 2026-06-23 feasibility re-freeze; was k=2 -- see
the prereg AMENDMENT RECORD), for BOTH systems, paired in the SAME reset window (D-16). END-STATE grading:
extract the report.md deliverable, NOT the process trace (D-16).

EMPIRICAL CAPTURE REALITY (2026-06-23 smoke findings, RESEARCH Pitfall 4): the built-in `/deep-research`
is an ASYNC, pool-HEAVY workflow. It (a) emits its report ONLY in the FINAL result event on COMPLETION --
it does NOT write a report file to disk, so a run that does not finish yields NO report (and
`validateManifest` correctly fail-closes on the missing report); and (b) a single broad question's run
can exceed an entire 5-hour pool window (two broad smoke runs cost ~25.46 / ~47.08 USD notional and were
rate-limited mid-run with no report). Hence the narrower questions (above) + PACING one capture per 5-hour
window + the resume protocol below. Verify a NON-EMPTY report + a final non-error result before counting a
capture as done.

### 1a. Built-in `/deep-research` baseline (closed-source workflow)

Run from a scratch CWD; tee the stream to the gitignored run dir. Set the background-wait ceiling to 0
(a long deep-research run can exceed the 10-min default; D-15):

```
CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS=0 \
  claude -p "/deep-research <frozen Slice-B question, inline prose>" \
  --permission-mode auto \
  --allowedTools "WebSearch,WebFetch" \
  --output-format stream-json --verbose \
  | tee "eval/.cache/p22-baseline/builtin/<qid>-run<k>.stream.jsonl"
```

- Use `--permission-mode auto` (classifier-gated). NEVER `acceptEdits` (it DENIES the skill launch) and
  NEVER an `@file` mention in the `-p` prompt (it breaks slash-command auto-trigger) -- reference the
  question inline as prose (CLAUDE.md headless gotchas).
- Extract `report.md` from the FINAL assistant message / result event (END-STATE), not the trace.
- Capture `system/init` (CC version + model) from the first stream line; capture per-run cost via a
  parallel `--output-format json` `total_cost_usd` field (D-16). Persist report + `system/init` + cost
  + the workflow-surface note ("built-in `/deep-research`, closed-source, captured headless") into the
  MANIFEST via `eval/lz-eval-baseline-manifest.mjs`.

### 1b. lz-deep-research candidate (the same way, the same reset window)

Capture lz the SAME way, in the SAME reset window, adding `--plugin-dir plugins/lz-advisor` and the
prompt `/lz-advisor:lz-deep-research <question>`. Its report.md lands in `.lz-research/<run-id>/report.md`
(copy it into the baseline run dir or MANIFEST-reference it). Verify the working-tree build is the one
under test via the `system/init` `plugins` array in the stream (NOT model self-report); this repo's
committed `.claude/settings.json` already disables the marketplace build here.

## Resumability + pacing (the 5-hour-window discipline; 2026-06-23)

Captures are pool-heavy and may not all fit one 5-hour window. The campaign is resumable at TWO levels so
a window exhaustion never loses completed work:

1. CAMPAIGN-LEVEL (cell-skip; the primary mechanism). Each (question x system) capture lands its own
   stream + extracted report + a validated MANIFEST in `eval/.cache/p22-baseline/<system>/`. A captured
   cell is DONE iff its MANIFEST passes `validateManifest` (non-empty report + system/init model + cost).
   On resume, SKIP every cell that already has a passing MANIFEST and capture only the missing cells. This
   makes the capture stage idempotent and window-spanning -- never re-capture a completed cell.
2. PER-RUN (within one overflowing run). BOTH systems need this -- lz is cheaper (Sonnet-default) but is
   itself a multi-phase run (scope -> search -> extract -> verify -> aggregate -> synthesize) that can
   exceed a 5-hour window on a heavier question, so lz resumability is a co-equal REQUIRED mechanism, not
   a theoretical nicety:
   - lz-deep-research (REQUIRED, and the better-supported path): use the shipped resume affordance (the
     `<resume>` slug-match + `run_state.json` / `decompose.json` per-phase skip guards from Phase 20,
     validated end-to-end in Phase 20). CAPTURE MECHANICS: on first invocation, record the lz run dir
     `.lz-research/<run-id>/` (from the stream / the created dir) into the cell's MANIFEST-in-progress. If
     the window exhausts mid-run, on resume RE-INVOKE `/lz-advisor:lz-deep-research` with the resume
     affordance targeting that SAME run-id, and VERIFY from `run_state.json` that the already-completed
     phases are SKIPPED (the resume must ADVANCE, not restart -- confirm the phase pointer moved before
     continuing, else the run is silently re-doing work and re-spending). Only the FINAL completed
     `.lz-research/<run-id>/report.md` (with `run_state.json` showing synthesis complete) is graded;
     a partial lz run is NOT a valid capture.
   - built-in `/deep-research` (closed-source, NOT resumable by us): its session carries a `session_id`;
     `claude -p --resume <session_id>` MAY continue an interrupted built-in run after a window reset --
     treat this as an UNTESTED backstop (the built-in's background tasks may not resume cleanly). The
     reliable mitigation is the narrower questions (so a built-in run COMPLETES in one window) + cell-skip
     across windows; only fall back to `--resume` if a narrow run still overflows.

PACING: capture at most what one 5-hour window safely holds (empirically a broad built-in run alone hit
the wall; a narrow run should fit, but budget conservatively). Pair lz + built-in for the SAME question in
the SAME window where possible (D-16); if the window cannot hold both, capture them in adjacent windows
and record the window split in the MANIFEST (the per-direction parity read does not require same-window
pairing, only same-frozen-question). HALT cleanly on any rate-limit/spend-limit result and resume after
the window resets -- the cell-skip makes resumption a no-op for completed cells.

## Stage 2 -- calibrate the Opus judge (the `callJudge` transport; session pool; PAR-02 / D-13)

Before grading ANY report, calibrate the Opus judge through the existing MCC machinery over the
CLOSED-BOOK calibration set (WiCE incl. `partially_supported` subtle items + LLM-AggreFact de-duped vs
WiCE). The session has the Opus judge label each calibration item closed-book (does the evidence entail
the claim -> `unrefuted`, else `refuted`); the verdicts land on disk.

1. The session spawns the Opus judge Agent sub-agent (`model: opus`, temp 0) per calibration item and
   persists each verdict to disk as `{ verdict, reasoning, model }` -- the `model` pin is MANDATORY
   (AMENDMENT RECORD 3) and `readVerdict` FAILS CLOSED without it. Record the concrete model the alias
   resolved to (e.g. `claude-opus-5`), not the alias: the Agent tool dispatches by ALIAS, so `model: opus`
   silently re-points as generations ship, and a verdict that does not name its own judge cannot be
   attributed to one afterwards. Read the resolved id from the session's own `system`/init, never assume.
2. node scores from disk (NO SPEND): `judgeCalibrationGate({ verdicts, gold })`
   (`eval/lz-eval-judge-calibration.mjs`) computes the MCC point + the one-sided lower CI and returns
   `cleared`.
3. GATE: the judge may grade reports ONLY if `cleared === true` (MCC `>= JUDGE_MCC_BAR.POINT` 0.5 AND
   lower CI `> JUDGE_MCC_BAR.LOWER_FLOOR` 0). An uncalibrated judge is a DISQUALIFIER (PAR-02) -- STOP,
   do NOT grade, NEVER relax the bar.

## Stage 3 -- grade the reports (the `callJudge` transport; session pool; PAR-04)

For EACH frozen Slice-B question, grade BOTH captured report.md files (built-in vs lz) on the 5
dimensions, per-dimension-isolated, blinded + position-swapped + k-sampled.

1. Blinding: strip system identity from both reports; label them only "Report A" / "Report B";
   randomize the A/B assignment per ordering.
2. Position-swap: run BOTH orderings ('AB' / 'BA'); record the per-ordering preferred token. A win is
   recorded ONLY when both orderings agree, else TIE (`cellVerdict`).
3. Multi-sample: k samples per (question x dimension x ordering) cell, with k within `PARITY_K_RANGE`
   (3..5); the realized run uses k = 3.
4. Claim-extraction bridge (D-12) for factual + citation: the judge FIRST extracts discrete claims +
   inline citations from EACH report, THEN scores each claim against the report's OWN cited evidence.
5. The session spawns the Opus judge Agent (`model: opus`, temp 0, one dimension per call) and lands a
   per-(question x dimension x ordering x sample) JSON record on disk:
   `{ question, dimension, ordering, sample, score: 0..1, verdict: 'pass'|'fail'|'unknown',
   preferred: 'A'|'B'|'tie', notes }`.
6. Budget fallback (only if the Claude pool binds): Opus on factual + citation; Sonnet on the cheaper
   dims (completeness, source quality, tool/process efficiency). NEVER a Sonnet judge on factual /
   citation (D-10).

The judge RUBRIC prompt + the claim-extraction prompt are LLM-steering prompts -> content-reviewed
before they drive any grading (PAR-08).

## Stage 4 -- run Slice A (the `callVoter` transport; session pool; PAR-06 / D-11)

Slice A is judge-FREE. The session spawns the verify-voter Agent sub-agent over the frozen Slice-A seed
list (the deterministic ascending-`claim_id` selection, ~8-12 per direction), passing ONLY the claim +
the `claim_date` cutoff (every leaky gold field stripped). The voter's verdict lands on disk; node scores
from disk:

1. `filterSliceA` materializes the frozen seed list deterministically from the cached AVeriTeC dev set.
2. `sliceAFeasibilityGate` confirms the frozen gate clears (RESOLVED FEASIBLE in the pre-registration).
3. `tallyPerDirection({ verdicts, gold })` reports the four confusion-matrix cells SPLIT by direction,
   DESCRIPTIVELY -- NO pooled rate, NO Clopper-Pearson, NO pass/fail cert. The PROVISIONAL limits
   (uniform 2020 claim_date + topical narrowness) are recorded with the read.

## Stage 5 -- score the two-layer verdict from disk (the node engine; NO SPEND; PAR-05)

After Stages 1-4, the node engine scores from disk with ZERO spend:

1. `scoreJudgeCells({ records, orderingMap })` (`eval/lz-eval-parity-judge.mjs`) resolves each
   ordering's preferred A/B into lz | builtin, applies the position-swap agreement rule, and emits the
   per-cell win/tie/loss + the descriptive mean/SEM over k.
2. Derive `floorPassByQuestion` (the lz skill passes factual AND citation on each frozen question) +
   `lossByDimension` (the clear-LOSS count per dimension) from the scored cells.
3. `parityVerdict({ floorPassByQuestion, lossByDimension })` (`eval/lz-eval-parity-verdict.mjs`) returns
   the two-layer verdict: `PARITY` | `SCOPED-PARITY-OR-NAMED-GAP` | `NAMED-GAP`. The raw per-cell
   verdicts are reported per-direction, never only the aggregate (D-07).
4. Record the verdict + the Slice-A descriptive per-direction tally + the per-run cost spread + the
   PROVISIONAL limits + the D-09 instrument-strength disclosure + the D-19 self-preference
   threat-to-validity in the result artifact. The verdict is NEVER a ship gate (D-03); the Sonnet-default
   skill ships regardless. The output is confidence / an operating envelope / an honest named gap.

## Anti-result-shopping invariants (never violate)

- The pre-registration (`eval/lz-eval-parity-prereg.md`) is FROZEN + committed BEFORE any capture or
  grade. The frozen NUMBERS match the `Object.freeze`d module constants byte-for-byte (the anti-drift
  co-test enforces it). NEVER re-tune a bar after seeing a grade.
- Both question lists are frozen; the realized Slice-A claim_id list is materialized deterministically
  (sorted by claim_id), not hand-picked. The Slice-B questions cannot be swapped after capture begins.
- The Slice-A feasibility branch is RESOLVED pre-grade (a resolved pre-registered conditional is valid
  pre-registration); no new branch may be added at grade time.
- There is NO OOF / Copilot transport in this phase (D-18). The live-cert driver's `callOof` is REMOVED
  and FORBIDDEN. The judge + voter are Agent sub-agents on the session pool; the gold is the free
  public corpora only.
- The frozen module seams (`parityVerdict` / `PARITY_BAR` / `cellVerdict` / `scoreJudgeCells` /
  `PARITY_K_RANGE` / `judgeCalibrationGate` / `JUDGE_MCC_BAR` / `filterSliceA` / `sliceAFeasibilityGate`
  / `SLICE_A_GATE` / `tallyPerDirection`) are consumed BYTE-IDENTICAL -- never edited at grade time.

## Cross-reference

- `eval/lz-eval-parity-prereg.md` -- the pre-registered acceptance rule (the rubric, both question
  lists, the collapse map, the MCC bar, the feasibility gate + fallback, the parity bar + k, the D-09 /
  D-19 disclosures, the freeze timestamp).
- `eval/lz-eval-parity-judge.mjs` -- the position-swap `cellVerdict` / `scoreJudgeCells` + `PARITY_K_RANGE`.
- `eval/lz-eval-judge-calibration.mjs` -- the MCC calibration `judgeCalibrationGate` + `JUDGE_MCC_BAR`.
- `eval/lz-eval-sliceA-gold.mjs` -- the Slice-A `filterSliceA` / `tallyPerDirection` /
  `sliceAFeasibilityGate` + `SLICE_A_GATE` + the collapse map + the PROVISIONAL limits.
- `eval/lz-eval-parity-verdict.mjs` -- the two-layer `parityVerdict` + `PARITY_BAR`.
- `eval/lz-eval-baseline-manifest.mjs` -- the MANIFEST (CC version + model + workflow surface + per-run cost).
- `eval/lz-eval-live-cert-driver.md` -- the Phase-20 PROTOCOL MODEL for this document (same
  session-drives-spend / node-scores-from-disk discipline), MINUS the `callOof` transport (FORBIDDEN
  here, D-18).
- `22-CONTEXT.md` D-15/D-16 (headless capture), D-18 (no OOF spend / the eval never ships), D-20
  (pre-registration discipline).
