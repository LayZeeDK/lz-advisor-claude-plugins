# Phase 23 q2 capture + retention session-driver protocol (ENV-05 / ENV-02 / ENV-04; D-17 / D-19)

This is the exact, step-by-step protocol a CLAUDE CODE SESSION follows AT SPEND TIME to run the ENV-05
feasibility spike, capture the fresh q2 pair on both systems, and RETAIN the evidence those captures
produce. It is the operational companion to the no-spend seams in
`eval/lz-eval-p23-verify-complete.mjs`, `eval/lz-eval-p23-sliceA-draw.mjs`,
`eval/lz-eval-p23-sliceA-read.mjs`, `eval/lz-eval-p23-citation-audit.mjs`,
`eval/lz-eval-p23-resolvability.mjs` and `eval/lz-eval-baseline-manifest.mjs`, and to the
pre-registered authority in `eval/lz-eval-p23-prereg.md`.

It is the analog of `eval/lz-eval-parity-driver.md` (the Phase-22 session driver): the SAME
"session drives spend, node scores from disk" discipline and the SAME transport prohibitions -- **plus
the one thing that document LACKS, which is a retention step.** That omission is the documented cause of
the lost q1 evidence corpus, on both systems. Stage 2 below exists so it cannot recur.

**Following the steps below incurs session-pool spend. This document does not itself spend.** No step
runs until the ENV-01 freeze commit has landed (`eval/lz-eval-p23-prereg.md` committed in its own
timestamped commit) and the human go is given.

## The transport split (read this first)

Three transports, three different mechanisms, and every model pinned to Claude GENERATION 5. Getting
this wrong is the single most common error.

| Transport | Mechanism | Model (Claude generation 5) | Pool | Node-wireable? |
|---|---|---|---|---|
| `voter` (the ENV-03 Slice-A verify-voter) | the verify-voter Agent sub-agent, spawned via the Agent tool, one drawn item per call | Sonnet 5 | the Claude SESSION pool | NO -- the Agent tool is UNAVAILABLE to a bare `node` process. SESSION-DRIVEN. |
| `capture` (the built-in `/deep-research` and the lz-deep-research q2 report capture) | a headless `claude -p` subprocess -- a CAPTURE transport ONLY, never a voter or judge transport | built-in side: Opus 5. lz side: its Sonnet 5 executor with the Opus 5 advisor, per the advisor strategy | the Claude SESSION pool (shared 5-hour pool) | NO model SCORING -- the captured `report.md` lands on disk and node scores from disk. |
| `grade` (the CONDITIONAL ENV-06 head-to-head grading) | the parity-judge Agent sub-agent, one dimension per call, blinded and position-swapped | Opus 5 | the Claude SESSION pool | NO -- SESSION-DRIVEN. Runs only if the ENV-05 spike clears. |

The node engine SCORES FROM DISK at ZERO spend: `sliceARead` (Slice A), `auditReport` (the ENV-04 offline
half), `checkResolvability` (the live half, its own module and its own dated output), `validateManifest`
(admissibility) and `isVerificationComplete` / `spikeCleared` (the spike). The session does the
(spend) capturing, voting and grading; node does the (no-spend) scoring.

### Pin the RESOLVED model string, never the alias

The Agent tool and the `claude -p` harness both dispatch by **ALIAS**. An alias re-points as generations
ship, so a MANIFEST or a verdict record that names an alias is unfalsifiable after the fact: a later
reader cannot tell which generation produced it.

**Every MANIFEST and every dispatch record MUST record the RESOLVED model string the run itself reports**
-- read from the stream's own `system/init` event for a headless capture, and from the orchestrating
session's own model identity for an Agent sub-agent -- **never the alias, and never the model's
self-report.** For this phase the resolved strings are expected to read `claude-opus-5` and
`claude-sonnet-5`; record what the run actually reports, even if it differs.

**Do NOT copy a model string from `eval/lz-eval-parity-driver.md` or from the q1 MANIFESTs.** Those are
generation-4 strings and they are RECORDS of past runs, not targets. Rewriting them would be
falsification; reusing them as a target here would be worse.

## ABSOLUTE PROHIBITIONS

- **NO out-of-family transport.** There is no metered external-model transport in this phase -- no
  external CLI subprocess, no out-of-family pool, and no such capability exists account-wide. Do not
  introduce one.
- **NEVER call the Anthropic API.** All Claude spend is the Agent tool or headless `claude -p` drawing
  the session pool, never the metered API.
- **NEVER use `claude -p` as a voter or judge transport.** It is the CAPTURE-ONLY harness here. The
  voter and the conditional grader are Agent sub-agents on the session pool.
- **No maintainer-authored gold, and no metered-model gold.** Slice A's reference standard is the free
  AVeriTeC corpus; ENV-04 is judge-free by construction.
- **No `git clean` in any form.** `eval/.cache/` and `.lz-research/` are gitignored and hold
  irreplaceable data, including everything Stage 2 retains.
- **No step below runs before the ENV-01 freeze commit has landed and the go is given.**

## Stage 0 -- the pre-registration freeze (precondition; NO SPEND)

`eval/lz-eval-p23-prereg.md` is COMMITTED in its OWN timestamped commit containing exactly three files.
The anti-drift co-test `eval/lz-eval-p23-prereg.test.mjs` is green. Confirm the freeze SHA is a strict
git ANCESTOR of `HEAD` with git's ancestry test, not by comparing timestamps.

## Stage 1 -- capture the built-in `/deep-research` q2 report (the `capture` transport; Opus 5)

### The frozen q2 question

**"Which post-training quantization methods preserve accuracy at 4-bit for transformer inference, and
what accuracy drop does each report?"**

This text is frozen. It is quoted identically in `eval/lz-eval-p23-prereg.md` and it cannot be swapped
after the capture begins.

**Why this question was chosen** (Claude's discretion under D-01, within the bounded-single-facet
constraint):

- It is **bounded and single-facet**, matching the narrowing that made captures feasible at all. A broad
  multi-facet question did not complete inside a 5-hour window in Phase 22.
- It sits in an **arXiv-dense literature**, so the canonical identifier space is comparably stable to
  q1's and the ENV-04 canonicalizer has something to unify -- rather than an identifier set dominated by
  the `url:` fallback, which would be a property of the question choice and not of either system.
- It **forces numeric claims that must be cited** (accuracy drops per method), which is exactly what
  exercises citation behaviour.
- It is **topically disjoint from q1's** context-window-extension subject, so the two questions do not
  share a source pool.

### The run

Run from a scratch working directory; tee the stream to the gitignored run directory. Set the
background-wait ceiling to 0, because a long deep-research run exceeds the default:

```
CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS=0 \
  claude -p "/deep-research <the frozen q2 question, inline prose>" \
  --model opus \
  --permission-mode auto \
  --allowedTools "WebSearch,WebFetch" \
  --output-format stream-json --verbose \
  | tee "eval/.cache/p23-baseline/builtin/q2/q2-run1.stream.jsonl"
```

- Use `--permission-mode auto` (classifier-gated). NEVER `acceptEdits` -- it DENIES the skill launch --
  and NEVER an `@file` mention in the `-p` prompt, which breaks slash-command auto-trigger. Reference the
  question inline as prose.
- Note the `session_id` from the first stream line. **Stage 2 needs it, and it is only recoverable from
  the stream.**
- The built-in emits its report ONLY in the final result event on COMPLETION; a run that does not finish
  yields NO report. Extract `report.md` from the final assistant message / result event (END-STATE), not
  from the trace.
- Record the resolved model and the CC version from the `system/init` event, and the per-run cost from
  each stream's terminal `type=result` event's `total_cost_usd`.
- HALT cleanly on any rate-limit or spend-limit result and resume after the window resets. **Count every
  resume cycle and every reset window as you go** -- Stage 4 consumes those counts and nothing in the
  module can derive them.

## Stage 2 -- RETAIN THE EVIDENCE (D-17). This is the FIRST post-capture action.

**Do this before saving anything else, before computing anything, and before any rate is looked at.**
Sessions age out: the q1 built-in capture's session no longer exists anywhere under the transcript
store, and no June-2026 session survives at all. **An artifact not copied immediately is an artifact
lost, and it cannot be re-derived without re-spending the capture.**

**2a. Copy the built-in session's per-subagent transcripts. FIRST.**

Source (substituting the `session_id` noted in Stage 1; the working-directory hash for this repository
is `D--projects-github-LayZeeDK-lz-advisor-claude-plugins`):

```
~/.claude/projects/D--projects-github-LayZeeDK-lz-advisor-claude-plugins/<session-id>/subagents/agent-*.jsonl
```

Destination:

```
eval/.cache/p23-baseline/builtin/q2/subagents/
```

Copy the whole `subagents/` directory, not a selection from it. If the directory does not exist, record
that fact -- it is the Stage 3 observation, and it is a finding rather than an error.

**2b. Copy the WHOLE lz run directory** once Stage 5 has produced one.

Source: `.lz-research/<run-id>/` -- including `claims/`, `excerpts/`, `votes/`, `survivors.json`,
`run_state.json` and `report.md`.
Destination: `eval/.cache/p23-baseline/lz/q2/`.

**2c. Only now** save the extracted `report.md` and the stream alongside them, and proceed.

**This step list does not end at saving the report and the stream.** That ending is exactly what the
Phase-22 driver had, and it is why ENV-04's quote-match half was not runnable on q1 for either system.

## Stage 3 -- the D-19 first observation, recorded BEFORE any rate is computed

Inspect the RETAINED copy from Stage 2a -- never the live session directory, which may be reclaimed --
for entries carrying **fetched source text** (tool-result bodies from web fetch or search calls, not
merely the tool-call records).

Record, in the spike record, which pre-frozen branch the observation selects:

- **Branch A -- recoverable fetched content IS present.** Symmetric verbatim-quote match runs on BOTH
  systems for q2, and the quote-match figure is reported comparatively.
- **Branch B -- it is NOT present.** ENV-04's comparative bar uses only the symmetric text-derived
  metrics (identifier resolvability and structural citation coverage), and the lz quote-match is
  published as an explicitly-labelled SINGLE-SYSTEM diagnostic, never comparative.

Both branches were frozen before this capture ran. **Record the observation and the selected branch
BEFORE computing any rate.** No third branch may be added here.

## Stage 4 -- the completeness check and the ceiling check (mechanical, NO SPEND)

Do not read the report by eye. Call the frozen predicate:

```
node eval/lz-eval-p23-verify-complete.mjs \
  eval/.cache/p23-baseline/builtin/q2/q2-run1.report.md <resumeCycles> <resetWindows>
```

- `isVerificationComplete` decides completeness from the verification-ledger heading's `N/N` count and
  the ledger table's row count. It is discrimination-proven against a real partial report on disk.
- `spikeCeilingCheck` / `spikeCleared` decide the ceiling from the resume-cycle and reset-window counts
  you recorded in Stage 1, against the frozen `SPIKE_CEILING`.

**If q2's report format differs so the predicate cannot read it, that is itself an ENV-07 finding about
the reference system.** The completeness check then falls to a DOCUMENTED MANUAL READ recorded as a
deviation -- never a silent re-definition of the predicate, and never an eyeball verdict presented as a
mechanical one.

Record the realized resume-cycle and reset-window counts either way. They are a publishable ENV-07
finding whether or not the spike clears.

## Stage 5 -- capture the lz-deep-research q2 report (the `capture` transport; Sonnet 5 + Opus 5)

Capture lz the SAME way, in the SAME reset window where the pool allows, adding
`--plugin-dir plugins/lz-advisor` and the prompt `/lz-advisor:lz-deep-research <the frozen q2 question>`.
Its `report.md` lands in `.lz-research/<run-id>/report.md`.

- Verify the WORKING-TREE build is the one under test via the `system/init` `plugins` array in the
  stream, never the model's self-report. This repository's committed `.claude/settings.json` already
  disables the marketplace build here.
- lz is itself a multi-phase run and is resumable: re-invoke with the resume affordance targeting the
  SAME run-id and VERIFY from `run_state.json` that completed phases are SKIPPED. A resume must ADVANCE,
  not restart. A partial lz run is NOT a valid capture.
- **Then go back to Stage 2b immediately** and copy the whole run directory. The `excerpts/` directory is
  the ONLY copy of the lz evidence corpus, and `.lz-research/` is gitignored.

## Stage 6 -- MANIFEST both q2 captures (admissibility; NO SPEND)

Build a MANIFEST per capture through `buildManifest` and confirm it passes `validateManifest`. Each pins
the CC version, the RESOLVED model and the per-run cost, and records `costStreams` (the CALLER's
enumeration), `costStreamsExcluded` with reasons, and `resumeCycles`.

**A report without a passing MANIFEST is NOT admissible** and is excluded from every reading, with the
exclusion recorded rather than passed over. The cost figures carry their retry history and are never
presented as a clean per-run cost comparison between the two systems.

## Stage 7 -- the ENV-03 Slice-A voter dispatch (the `voter` transport; Sonnet 5)

Paced against the captures above, because both draw the SAME 5-hour session pool.

For each of the 40 frozen drawn items, in the frozen order: render the dispatch string with
`buildDispatchString({ claim, claimDate })`, persist it with `writeDispatchRecord` **at dispatch time**,
then spawn the verify-voter Agent sub-agent with that exact string. `writeDispatchRecord` is write-once
and refuses a second write to the same key, so a re-roll is distinguishable from a resume.

Node then scores from disk: `readSliceAVerdicts` fails closed on a verdict with no dispatch record or a
digest that disagrees with its stored string, and `sliceARead` emits the never-pooled per-direction read
with its three PROVISIONAL limits.

## Stage 8 -- the CONDITIONAL ENV-06 grading (the `grade` transport; Opus 5)

**Runs only if the ENV-05 spike cleared in Stage 4.** If it did not, publish the realized ceiling as the
ENV-07 finding it is and terminate ENV-06 on the pre-registered branch, without re-running a documented
failure mode in the hope of a different draw.

If it runs: blinded, position-swapped (a win recorded only when BOTH orderings agree), per-dimension,
against the built-in as a model-authored reference baseline. Any judge agreement measured is REPORTED as
a disclosed limitation and is NEVER a disqualifier; any calibration gate keys on a lower-bound CI, never
a point estimate. The system-level pairwise outcome is the primary read and the per-dimension breakdown
is reported as explicitly weaker, in the same table.

## Anti-result-shopping invariants (never violate)

- The pre-registration is FROZEN and committed BEFORE any capture, vote or grade, and its frozen NUMBERS
  match the `Object.freeze`d module constants byte-for-byte. NEVER re-tune a bar after seeing a reading.
- The q2 question is frozen and cannot be swapped after the capture begins.
- The 40-item Slice-A list is frozen and materialized deterministically from `DRAW.SEED`; it is never
  hand-picked and never re-seeded.
- The D-19 conditional's two branches were frozen before the observation that selects one, and the
  observation is recorded before any rate is computed.
- q1 and q2 are reported as separate rows, never averaged and never combined into one rate.
- Any change to the pre-registration after a reading is seen is a numbered, dated AMENDMENT with the
  maintainer ratification noted -- never an edit.

## Review record

This driver is an LLM-STEERING document: it determines the question two paid captures answer, the models
they run on, and what evidence survives them. It therefore falls under the project's
review-before-use-or-publication MUST (`.planning/PROJECT.md`) and must be content-reviewed BEFORE it
drives anything.

It was reviewed at the Plan 23-04 Task-2 checkpoint together with `eval/lz-eval-p23-prereg.md`, against
the nine items listed in that document's `## Review record` section -- in particular the q2 question text
and its selection reasoning, the retention step's exact paths, and the generation-5 model pins.

**Verdict: APPROVED, in the second of two rounds.** Round 1 returned `revise-then-freeze` on the
contamination disclosure in `eval/lz-eval-p23-prereg.md` Section (vii); nothing in THIS document was
revised, and its q2 question text, retention paths and generation-5 model pins stood as authored in both
rounds. Round 2, on the corrected pre-registration, returned `approve-as-frozen`.

**Reviewer:** Lars Gyrup Brink Nielsen
**Date:** 2026-09-07

## Cross-reference

- `eval/lz-eval-p23-prereg.md` -- the frozen authority for every bar, rule, item list, disclosure and
  conditional this driver executes.
- `eval/lz-eval-p23-verify-complete.mjs` -- `isVerificationComplete`, `SPIKE_CEILING`, `spikeCleared`.
- `eval/lz-eval-p23-sliceA-read.mjs` -- `buildDispatchString`, `writeDispatchRecord`,
  `readSliceAVerdicts`, `sliceARead`.
- `eval/lz-eval-p23-sliceA-draw.mjs` -- `DRAW`, `drawBalanced`.
- `eval/lz-eval-p23-citation-audit.mjs` / `eval/lz-eval-p23-resolvability.mjs` -- the ENV-04 offline and
  live halves.
- `eval/lz-eval-baseline-manifest.mjs` -- `extractSystemInit`, `extractTerminalCost`, `aggregateRunCost`,
  `buildManifest`, `validateManifest`.
- `eval/lz-eval-parity-driver.md` -- the Phase-22 PROTOCOL MODEL for this document. Read it for the
  transport discipline and the pacing lessons; note that it has NO retention step, which Stage 2 supplies.
