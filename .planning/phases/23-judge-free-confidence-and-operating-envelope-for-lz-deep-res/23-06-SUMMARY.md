---
phase: 23-judge-free-confidence-and-operating-envelope-for-lz-deep-res
plan: 06
subsystem: testing
tags: [deep-research, eval, capture, retention, manifest, spike, env-05, env-02, headless-claude]

requires:
  - phase: 23-04
    provides: the ENV-01 pre-registration freeze, the q2 capture driver, and the frozen spike predicates
  - phase: 23-05
    provides: the Slice-A dispatch that shares this plan's 5-hour session pool, and AMENDMENT RECORD 1
provides:
  - "the lz q2 capture, complete in one window with a validating MANIFEST (ADMISSIBLE)"
  - "the built-in q2 capture, retained in full but with NO report (INADMISSIBLE, mechanically named)"
  - "the settled ENV-05 spike verdict: NOT CLEARED, on completeness, with the ceiling within its limits"
  - "87 MB of retained built-in evidence and 134 retained lz run-directory files, the only copies of both"
  - "a per-session correction to D-22's summation rule, disclosed as an ambiguity rather than resolved"
affects: [23-07, 23-08, 23-09, milestone-audit]

actuals:
  tokens: 10302
  tasks: 3
  commits: 2

tech-stack:
  added: []
  patterns:
    - "retention-first capture: the recursive evidence copy runs before any read, figure or rate"
    - "cost ambiguity disclosed with both readings and an upper bound, never resolved by preference"

key-files:
  created:
    - eval/.cache/p23-baseline/lz/q2/q2-run1.MANIFEST.json
    - eval/.cache/p23-baseline/builtin/q2/q2-run1.MANIFEST.INADMISSIBLE.json
    - .planning/phases/23-judge-free-confidence-and-operating-envelope-for-lz-deep-res/23-06-SUMMARY.md
  modified:
    - eval/lz-eval-p23-spike-record.md

key-decisions:
  - "ENV-05 terminates on branch (a) MEASURED, not (b) and not (c): the capture ran at real cost and the frozen predicates returned a verdict"
  - "ENV-06 terminates on branch (b) NOT-ESTABLISHABLE-BY-METHOD: its grading needs a built-in reference report that no capture in budget produced"
  - "the built-in q2 per-run cost is published as 55.31 with a 79.32 upper bound, because the same-session resume's accounting semantics are not decidable from the streams"
  - "no third resume was taken: it would be reset window 3, outside a bar frozen before the spike ran, and only a ratified amendment could authorize it"

patterns-established:
  - "Pattern: a capture that RAN and produced nothing is a measured result, not an unattempted method -- the two terminations must never be conflated"
  - "Pattern: a same-session hosted-workflow resume may report cumulative cost, so a stream enumeration must be read per-session before it is summed"

requirements-completed: [ENV-05, ENV-02]
---

# Phase 23 Plan 06: The q2 capture pair, its retention, and the settled ENV-05 spike Summary

The lz q2 capture completed cleanly in one window at 14.93 USD and is admissible; the built-in q2
capture ran twice at a published 55.31 USD, produced no report at all, and the ENV-05 spike therefore
did NOT clear -- on completeness, with its ceiling still inside the frozen limits.

## Task 1: the maintainer's choice, stated first because everything below is conditional on it

**Choice: option `A` -- proceed now, retention-first, capturing BOTH sides of the fresh q2 pair.**
Ratified by the maintainer on **2026-09-08**, with the spend authorized and the retention-first ordering
explicitly confirmed rather than assumed.

Neither option B nor option C was taken. **No descope occurred, so no AMENDMENT RECORD was required by
this plan and none was written.** `eval/lz-eval-p23-prereg.md` is UNCHANGED since AMENDMENT RECORD 1
(`0b4e479`, written by Plan 23-05), confirmed by `git log` on that path.

### The D-16 precondition, re-run and recorded

```
$ git merge-base --is-ancestor 9ab9933 HEAD   # the ENV-01 freeze commit
exit=0
$ git merge-base --is-ancestor 0b4e479 HEAD   # AMENDMENT RECORD 1
exit=0
```

Both are strict git ancestors of HEAD, asserted with git's ancestry test rather than by comparing
timestamps. No capture ran before the freeze.

## The resulting q2 report count: 1 of 2 -- and NOT for the reason the gates assume

| System | Capture dispatched | Report produced | MANIFEST | Admissible |
|---|---|---|---|---|
| built-in `/deep-research` | YES -- cold run plus resume cycle 1 | **NO** | INADMISSIBLE, failing field named | **NO** |
| `lz-advisor:lz-deep-research` | YES -- one invocation, rc=0 | YES, 14306 bytes | validates | **YES** |

**This must not be misread, and both automated gates in the plan invite the misreading.** A count below
two is NOT option B or option C here. Option A was taken and BOTH captures were dispatched at full
metered cost. The built-in side ran, spanned two reset windows, and did not reach a report. That is a
MEASURED outcome about the reference system, not an unattempted method.

## Retention orderings, both confirmed to have run BEFORE any read

### Built-in side (driver Stage 2a, widened per the Part-2 finding)

The recursive retention completed before the report absence was assessed, before any figure was
computed and before any rate. Final inventory, verified on disk:

| Measure | Count |
|---|---|
| files under `eval/.cache/p23-baseline/builtin/q2/session/` | **422** |
| `.jsonl` worker transcripts (recursive) | **203** |
| `tool-results/` fetched documents | **15** |
| top-level `session.jsonl` | 183541 bytes |
| retained bytes for `builtin/q2/` | **87 MB** |

The frozen flat `subagents/agent-*.jsonl` path would have retained almost nothing: the transcripts sit
at `session/subagents/workflows/wf_14facf94-3f0/` and the fetched documents sit in a sibling
`tool-results/` the flat path never names. The widening to a recursive copy retains strictly MORE than
the frozen path specified, so it cannot lose evidence the protocol intended to keep. Recorded as a
finding about the protocol in the spike record's Part 2, not as executor discretion.

### lz side (driver Stage 2b)

Retention was the FIRST action after the capture returned -- before the report was opened, before the
MANIFEST was built and before any figure was read. The run-id was validated against a fixed identifier
pattern before being composed into any path, and the destination was resolved and asserted to sit inside
the phase cache directory before any write (T-23-07).

| Measure | Count |
|---|---|
| retained run-directory files | **134** (113106 bytes) |
| `excerpts/` -- the ENV-04 quote-match corpus | **15** files, 18863 bytes |
| `claims/` | 15 files |
| `votes/` | 79 files |
| `sources/` | 15 files |
| `candidates/` | 5 files |
| `run_state.json`, `survivors.json`, `decompose.json`, `scope.md` | all present |
| lz capture session transcripts, additionally retained | 208 files, 8 MB |

Source run directory: `.lz-research/20260908-105102-post-training-quantization-4bit/`. That tree is
gitignored and held the only copy, which is how the q1 corpus became the phase's single point of
failure. **No `git clean` was run in any form at any point in this plan.**

## The D-19 first observation: Branch A, recorded pre-rate and already committed

Branch A was selected by observation at `41b70f5`, in the spike record's Part 1, before any q2 rate,
ratio or coverage figure existed. It is not restated or revisited here and Part 1 was not rewritten. The
evidence was gathered from file names, sizes and tool-call structure only; the fetched content itself was
not read, so no reader was added to the ENV-04 contamination ledger.

Branch A means a symmetric verbatim quote-match runs on both systems for q2 -- subject to the
admissibility exclusion below, which is a separate matter that Plan 23-07 must handle on its own terms.

## The spike verdict, as computed by the frozen predicates

### The completeness check, run through the CLI

```
$ node eval/lz-eval-p23-verify-complete.mjs eval/.cache/p23-baseline/builtin/q2/q2-run1.report.md 1 2
lz-eval-p23-verify-complete: missing or invalid <report.md>
exit=2
```

The same predicate at the API level, over the absent report's empty text:

```
spikeCleared({ reportText: '', resumeCycles: 1, resetWindows: 2 })
  -> cleared: false
     completeness: { complete: false, declaredN: null, confirmedN: null, tableRows: null,
                     duplicateLedgerHeadings: 0,
                     reason: "no verification-ledger heading declaring an N/N confirmed count was found
                              (Pattern 5: a format change is itself an ENV-07 finding and falls to a
                              documented manual read, never a silent re-definition)" }
     ceiling: { cleared: true, ceiling: { MAX_RESUME_CYCLES: 3, MAX_RESET_WINDOWS: 2,
                                          resumeCycles: 1, resetWindows: 2 } }

spikeCeilingCheck({ resumeCycles: 1, resetWindows: 3 }) -> cleared: false
```

No manual read was substituted and the predicate was not re-defined. Pattern 5's manual-read fallback
covers a report whose FORMAT the predicate cannot parse; there is no report at all, and an absence is
not a format mismatch.

### **NOT CLEARED -- on COMPLETENESS, not on ceiling exhaustion**

| Axis | Realized | Frozen limit | Status |
|---|---|---|---|
| resume cycles | 1 | <= 3 | **within** |
| reset windows | 2 | <= 2 | **within, and at the limit** |
| verification-complete report | none produced | required | **FAILED** |

`spikeCleared` needs both halves. The ceiling half CLEARED. The completeness half failed. **"The ceiling
was exceeded" and "it ran out of resumes" would both be wrong**, and both were checked against the
predicate rather than asserted. Only the WINDOW axis is exhausted: a further resume would be reset
window 3, which `spikeCeilingCheck` rejects.

**No third resume was taken.** It would break a bar frozen before the spike ran, after having watched
the run get close, which is the post-hoc bar-moving the pre-registration exists to remove. It would
require a numbered, dated, maintainer-ratified amendment; an operational nudge to resume is not
ratification of a pre-registration change. Surfaced here, never self-authorized.

## Realized counts and per-stream costs, with retry history attached

### Built-in side -- 1 resume cycle across 2 reset windows

| Stream | Events | START / END (UTC) | rc | Terminal `is_error` | Terminal `total_cost_usd` |
|---|---|---|---|---|---|
| `q2-run1.stream.jsonl` | 576 | 2026-09-07T22:41:05Z / 22:48:40Z | 1 | **true** | 24.015203250000027 |
| `q2-run1.resume1.stream.jsonl` | 1188 | 2026-09-08T00:53:48Z / 01:08:09Z | 1 | **true** | **55.30793200000004** |

Both streams: `system/init` model `claude-opus-5`, `claude_code_version` `2.1.263`, one shared
`session_id` `ac91e3d6-3f8f-4ed3-ac81-7b8ca4a9e7dd`. Resolved model strings recorded, never the `opus`
alias that dispatched them. Neither run synthesized a report: two short assistant text blocks each (485
and 65 chars cold; 272 and 65 chars on the resume). The resume DID advance -- the Verify phase was
executing when the limit hit, where the cold run had failed at that stage wholesale.

**Published cost 55.31, upper bound 79.32.** See the deviation below: the same-session resume's
accounting semantics are not decidable from the streams, so both readings travel together.

### lz side -- 0 resume cycles in 1 reset window

| Stream | START / END (UTC) | rc | Terminal `is_error` | Terminal `total_cost_usd` |
|---|---|---|---|---|
| `q2-run1.stream.jsonl` | 2026-09-08T08:50:43Z / 09:12:39Z | **0** | **false** | **14.930978050000009** |

`system/init` model `claude-sonnet-5`, `claude_code_version` `2.1.263`, session
`a673b76f-c515-44e3-8896-de7780f66031`. Generation 5 on both sides, as required, and the same CC version
as the built-in capture. Single stream, single window, no resume, so the enumeration has one element and
`aggregateRunCost` is exact with no ambiguity.

T-23-27 verified from the stream's own `system/init` `plugins` array rather than any self-report:
exactly ONE `lz-advisor` entry, `lz-advisor@inline` at
`D:\projects\github\LayZeeDK\lz-advisor-claude-plugins\plugins\lz-advisor`. The working-tree build was
under test and the marketplace copy was not loaded.

### The prohibited presentation, stated so it cannot be reached for by accident

**14.93 against 55.31 is NOT a clean per-run cost comparison and must never be published as one.** The
built-in figure is retry-inflated across a resume, spans two reset windows, ends `is_error: true` on
both streams, is ambiguous between 55.31 and 79.32, and bought NO report. The lz figure is a single
clean completed run. Comparing a completed run against a failed one as if they were peers is exactly
what the ENV-02 transparency prohibition forbids. q1 and q2 stay separate rows, never averaged.

## Admissibility (ENV-02)

| Report | MANIFEST | Verdict |
|---|---|---|
| lz q2 | `eval/.cache/p23-baseline/lz/q2/q2-run1.MANIFEST.json` | **valid**: `model=claude-sonnet-5 ccVersion=2.1.263` |
| built-in q2 | `q2-run1.MANIFEST.INADMISSIBLE.json` | **INADMISSIBLE** |

The built-in exclusion is mechanical, taken from the module's own distinct error rather than judged:

```
manifest report file does not exist (truncated/empty capture?):
eval/.cache/p23-baseline/builtin/q2/q2-run1.report.md
```

**The built-in q2 capture is excluded from ENV-04's q2 route, with that reason recorded**, and the
exclusion carries forward into ENV-07's not-established table. It is filed under a name that cannot be
mistaken for a passing manifest and carries `admissible: false`. **No cost value was invented, no report
or placeholder was fabricated, and no validation field was relaxed to make anything pass.**

This is an ABSENCE OF A REPORT behind a capture that ran -- distinct from the option-B/C case of a
capture that was never dispatched and has no failing field at all. The two are not conflated anywhere in
this SUMMARY.

Each MANIFEST records its stream enumeration (`costStreams`, the caller's, never a directory glob),
its `resumeCycles`, and its per-stream `isError` status, so the retry history travels with every figure.

## Pacing record across the shared 5-hour session pool

Every metered activity in this phase drew the SAME pool, so they were paced against each other rather
than scheduled independently.

| Activity | Plan | Reset windows consumed | Outcome |
|---|---|---|---|
| Slice-A voter dispatch (40 items) | 23-05 | 1 | completed, 40 write-once records |
| built-in q2 capture, cold run | 23-06 | 1 (2026-09-07 evening) | pool limit, no report |
| built-in q2 capture, resume 1 | 23-06 | 1 (2026-09-08 early) | pool limit mid-Verify, no report |
| lz q2 capture | 23-06 | 1 (2026-09-08 morning) | **completed rc=0** |
| ENV-06 head-to-head grading | 23-06 | **0 -- never dispatched** | see the ENV-06 disposition below |

The pacing is itself an ENV-07 operating finding: the built-in side consumed both of its available reset
windows without producing an artifact, while the lz side completed inside a single window at roughly a
quarter of the cost. Two prior wave-6 executors were terminated by session usage limits during this
plan, which is a further operating observation about the envelope rather than a workflow defect.

## Requirement dispositions -- state WHICH branch, so the milestone audit closes them correctly

### ENV-05: branch (a) MEASURED

**ENV-05 is a MEASURED result. It is NOT branch (b) and NOT branch (c).** The pre-registered method was
dispatched, ran at full metered cost across two reset windows, and its planned reading -- the spike
verdict from the frozen predicates -- was produced. ENV-05 asks for the observation, not for a pass, so a
spike that did not clear has still satisfied it.

- It is not **(c) NOT-ATTEMPTED-BY-BUDGET**: nothing was descoped, no AMENDMENT RECORD was needed, and
  the full option-A spend was taken.
- It is not **(b) NOT-ESTABLISHABLE-BY-METHOD**: the method was not shown unable to deliver a reading.
  It delivered one. The reading is "did not clear".

The publishable ENV-07 finding, per D-07 which applies whichever way the verdict lands: **on a
deliberately narrowed, bounded single-facet q2 question, the built-in `/deep-research` surface did not
reach a verification-complete report within 1 resume cycle across 2 reset windows, at a published 55.31
USD, on Claude Code 2.1.263 with `claude-opus-5`.** Compared honestly to the q1 datum as separate
unaveraged rows: q1 needed 3 resumes across 2 windows and DID complete at 67.085261; q2 did not complete
on a comparable window budget. Both differ on model generation and CC version, so even unaveraged the
pairing is weak, and n=2 supports no trend. What is claimed is narrower: narrowing the question did not
by itself make the reference system's report reachable inside the ratified envelope.

D-06 is repeated in the spike record so the ratified ceiling is not misread as drift from ENV-05's
literal one-window wording: a strict one-window bar fails by construction on Phase-22 evidence already
in hand.

### ENV-06: branch (b) NOT-ESTABLISHABLE-BY-METHOD

ENV-06's grading was gated on the spike clearing (driver Stage 8). It did not clear, so **no grading was
dispatched and none may be run in the hope of a different draw.**

**ENV-06 terminates on branch (b), not (c).** The pre-registration names "a capture that cannot complete
in budget" explicitly as a branch-(b) reason. ENV-06's method grades the lz report against the built-in
report as a reference baseline; that reference report does not exist and was not reachable inside the
ratified envelope at a documented 55.31 USD. The reason is identifiable entirely independently of any
grading result -- nothing about the comparison's outcome is involved, only the absence of one of its two
inputs. It is not (c), because nothing was descoped before spend: the spend was taken in full.

ENV-06 is **not** listed under `requirements-completed`, because its planned reading was not produced.
It is a completed phase item with a published termination, not a gap, and `/gsd-audit-milestone` should
close it as such.

### ENV-02: met

Every q2 report that EXISTS carries a validating MANIFEST pinning the CC version, the resolved model and
the per-run cost, built before any reading touched it. The one report that does not exist is recorded as
an absence-of-report behind a dispatched capture, with its mechanical failing field named and the
exclusion carried forward. Nothing was fabricated.

## Deviations from Plan

### Auto-fixed and recorded findings

**1. [Rule 1 - Bug] The Task 2 automated gate fails on the realized branch, and its premise is wrong for
this case**

- **Found during:** Task 2 verification.
- **Issue:** the gate asserts "a spike record exists but no built-in q2 report does -- the record must
  not outlive a capture that never ran", using `report.md` as its proxy for "a capture ran". It was
  written for two branches: option A with a report, and option B/C with no capture. The realized third
  branch -- **option A, capture dispatched twice at full cost, no report produced** -- makes the proxy
  wrong, and the gate throws on a spike record that D-07 REQUIRES to exist.
- **Handling:** neither side was bent. The spike record was NOT deleted, because deleting it would
  destroy the ENV-05 finding the plan mandates. The gate in the PLAN was not rewritten. Instead the
  gate's actual intent -- a spike record must have a CAPTURE behind it -- was checked directly and
  passes:

```
[OK] capture ran: 2 non-empty streams; retained session files: 422; spike record carries its
     required elements
[OK] report.md ABSENT -- the measured ENV-05 result, not an unran capture
exit=0
```

- **Discrimination proof** (run in a scratch sandbox, so the real evidence tree was never touched):
  with a spike record present and NO capture at all, the original gate FAILS
  (`Error: GATE FAIL: a spike record exists but no built-in q2 report does`); with the record removed it
  PASSES (`[OK] gate passes -- no record, no capture`). The gate does discriminate as designed; its
  report-as-proxy premise is what does not cover this branch.
- **Carried forward:** Plans 23-07 through 23-09 and any future capture plan should test "a capture ran"
  by stream existence, not by report existence.

**2. [Rule 1 - Bug] The Task 3 gate passes but prints a wrong explanation for the count**

- **Issue:** it reports "1 of 2 q2 report(s) captured and manifested; a smaller count is Task 1 option B
  or C recorded in the SUMMARY, not a failure". The count IS 1 of 2, but option A was taken -- the same
  report-as-proxy blind spot as above.
- **Handling:** the gate exits 0 and was not modified. The count's real cause is stated explicitly in
  this SUMMARY so no reader inherits the gate's wrong explanation.

**3. [Rule 2 - Missing correctness requirement] The built-in q2 per-run cost is AMBIGUOUS, and summing
the enumeration would have published a figure the run never incurred**

- **Found during:** Task 2, building the built-in MANIFEST.
- **Issue:** both built-in streams share ONE `session_id`, so whether the resume's terminal
  `total_cost_usd` is CUMULATIVE for the session or PER-INVOCATION decides between 55.31 and 79.32. A
  literal `aggregateRunCost` sum over the caller-enumerated list gives 79.32. The streams do not settle
  it.
- **Handling:** **55.31 is published with 79.32 recorded as an upper bound that travels with it
  everywhere**, including in the MANIFEST's `costUpperBoundUsd` field. The cumulative reading is
  published on structural evidence, not because it is smaller: the resume's terminal event has the cold
  run's hosted-workflow shape (`num_turns: 1`, all-zero parent `usage`, sub-second `duration_ms`) and its
  `claude-opus-5` `modelUsage` input tokens (1557379) strictly EXCEED the cold run's (480930) rather than
  being disjoint from them. `aggregateRunCost` was not applied.
- **Why the q1 precedent does not transfer:** the lz q1 resume was a DIFFERENT session with independent
  accounting; the built-in q1 same-session resumes carry `num_turns: 2` with real parent `usage` and
  costs far smaller than their cold run (0.96 and 17.59 against 48.54), so they were parent-driven turns
  that did not re-enter the hosted workflow. q2's resume did. Summing is right for the q1 shape and
  unproven for the q2 shape.
- **Recorded as a finding about D-22:** the rule as frozen says "sum the enumerated streams" without
  distinguishing a same-session hosted-workflow resume whose accounting may already include its
  predecessors. Whether D-22's wording should be amended is left to the maintainer; **nothing here
  amends it**, and the enumeration is still the caller's and still recorded on the artifact.

**4. [Rule 1 - Bug] A stated q1 comparison figure was wrong by 18.55 USD**

- **Issue:** `eval/lz-eval-baseline-manifest.mjs`'s header comment names 48.5367785 as "the run's" cost
  for the built-in q1 capture. That is q1's COLD STREAM alone. The run's enumerated total in its own
  MANIFEST is **67.085261** (48.5367785 + 0.9598505 + 17.588632).
- **Handling:** the spike record publishes 67.085261 and states the correction explicitly. The module
  comment was not edited -- in context it is discussing last-wins semantics within one stream, not
  publishing a run total, so it is not wrong on its own terms; reading it as a run total was the error
  and it is recorded here so the next reader does not repeat it.

**5. [Recorded finding, already committed] The frozen retention path would have retained almost nothing**

Recorded in the spike record's Part 2 at `41b70f5` and unchanged by this executor: the transcripts sit
nested under `session/subagents/workflows/wf_14facf94-3f0/` and the fetched documents sit in a sibling
`tool-results/` the frozen flat glob never names. Retention was widened to a recursive copy, which
retains strictly more than the frozen path specified.

**6. [Ordering, not a discrepancy] Part 1's retention counts are smaller than the final ones**

Part 1 records 214 session files, 104 transcripts, 5 fetched documents and ~34 MB. The final inventory is
422 / 203 / 15 / 87 MB. Part 1's counts are a correct PRE-RESUME snapshot taken at the moment the D-19
observation was recorded, which by design was before the resume. **Part 1 was not rewritten to match a
later state**, and both sets of counts appear side by side in Part 2.

### Figures checked against disk

Every figure this plan inherited was re-derived from the streams and manifests rather than trusted.
Reproduced exactly: both built-in stream event counts (576, 1188), byte sizes, all four wall-clock
timestamps, both `rc=1` values, both terminal `is_error: true` flags, both `total_cost_usd` values, both
`system/init` pins, the assistant text-block counts and lengths, the frozen `SPIKE_CEILING` contents, and
the two `spikeCleared` / `spikeCeilingCheck` outputs verbatim. **Two disagreed and are corrected above:**
the q1 comparison cost (deviation 4) and the summability of the built-in cost enumeration (deviation 3).

### No architectural changes and no Rule 4 escalations

No new dependency, no package install, no schema change. `eval/package.json` unchanged, so the Package
Legitimacy Gate does not apply.

## Threat mitigations applied

| Threat | Applied |
|---|---|
| T-23-07 path traversal | the lz run-id was validated against `^[0-9]{8}-[0-9]{6}-[a-z0-9-]+$` before being composed into a path, and the destination was resolved and asserted to sit inside the phase cache root with boundary safety, not a glob prefix |
| T-23-10 transcript secrets | accepted residual: the destination is the gitignored eval cache and is never committed; the committed record carries counts, names and sizes only, never transcript bodies |
| T-23-01c truncation read as complete | the built-in has no report and `validateManifest` failed closed on exactly that field; the lz report is 14306 bytes, well past the zero-byte guard |
| T-23-08 spoofed completeness | decided by the frozen predicate through its CLI; no eyeball verdict and no re-definition |
| T-23-25 post-hoc verdict | the ceiling and completeness definitions were frozen module constants committed before the capture, ancestry-asserted; the D-19 branch was read pre-rate at `41b70f5`; no third resume was self-authorized |
| T-23-06 evidence loss | retention ran first on both sides; the lz excerpt corpus is non-empty; no `git clean` in any form |
| T-23-26 fabricated cost | every figure comes from a stream's terminal result event; the one ambiguous figure is published with both readings rather than a chosen number |
| T-23-27 marketplace build | verified from the stream's `plugins` array: exactly one `lz-advisor`, `@inline`, at the working-tree path |

## Tests

```
$ node --test eval/lz-eval-baseline-manifest.test.mjs \
    eval/lz-eval-baseline-manifest-defects.test.mjs \
    eval/lz-eval-p23-verify-complete.test.mjs
tests 51  pass 51  fail 0
```

Explicit FILE form, per the known `node --test <dir>` exit-1 quirk on this host.

## What Plans 23-07, 23-08 and 23-09 read from here

- **23-07 (the q2 citation audit):** the lz q2 report is ADMISSIBLE at
  `eval/.cache/p23-baseline/lz/q2/q2-run1.report.md` with its 15-file excerpt corpus retained. The
  built-in q2 report DOES NOT EXIST and is INADMISSIBLE, so the q2 route is **single-system for the
  built-in side**. **No q2 citation rate, coverage ratio or quote-match was computed by this plan** --
  that is 23-07's work, and Part 1's pre-rate ordering claim is still true.
- **23-08 (ENV-07 envelope):** ENV-05 is branch (a) MEASURED; ENV-06 is branch (b)
  NOT-ESTABLISHABLE-BY-METHOD. The built-in q2 exclusion belongs in the not-established table with its
  named failing field. The realized ceiling, the pacing table and the cost ambiguity are all publishable
  ENV-07 findings.
- **23-09 (review closure):** the spike record's ENV-08 content review is OWED.

## Self-Check: PASSED

- `eval/lz-eval-p23-spike-record.md` -- FOUND, committed
- `eval/.cache/p23-baseline/lz/q2/q2-run1.MANIFEST.json` -- FOUND, validates
- `eval/.cache/p23-baseline/lz/q2/q2-run1.report.md` -- FOUND, 14306 bytes
- `eval/.cache/p23-baseline/lz/q2/excerpts/` -- FOUND, 15 files
- `eval/.cache/p23-baseline/lz/q2/run/` -- FOUND, 134 files
- `eval/.cache/p23-baseline/builtin/q2/q2-run1.MANIFEST.INADMISSIBLE.json` -- FOUND, `admissible: false`
- `eval/.cache/p23-baseline/builtin/q2/session/` -- FOUND, 422 files, 87 MB
- `eval/.cache/p23-baseline/builtin/q2/q2-run1.report.md` -- **CORRECTLY ABSENT** (the measured result)
- commit `87ed59f` -- FOUND in `git log`
