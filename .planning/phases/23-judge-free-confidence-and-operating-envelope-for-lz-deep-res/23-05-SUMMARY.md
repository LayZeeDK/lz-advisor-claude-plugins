---
phase: 23-judge-free-confidence-and-operating-envelope-for-lz-deep-res
plan: 05
subsystem: testing
tags: [env-03, slice-a, confusion-matrix, judge-free, averitec, seed-005, dispatch-provenance, amendment]

# Dependency graph
requires:
  - phase: 23-02
    provides: "DRAW (seed 20260907, 20 per direction), buildDispatchString, writeDispatchRecord, readSliceAVerdicts, sliceARead, and the T-22-15 substitution fix"
  - phase: 23-04
    provides: "the frozen ENV-01 pre-registration (commit 9ab9933), the frozen 40-item draw quoted in full, the sha256-pinned voter prompt, and the reusable ancestry command"
provides:
  - "The four Slice-A confusion-matrix cells per direction, never pooled: unrefuted {tp 18, fn 2}, refuted {tn 20, fp 0}, n=40, drawSeed 20260907"
  - "eval/lz-eval-p23-sliceA-read-record.md: the committed durable descriptive read with all 40 per-item rows, so the result survives a cache wipe (T-23-06)"
  - "AMENDMENT RECORD 1 in the frozen pre-registration: the corrected voter transport row and the day-month-year cutoff label, both taken pre-spend"
  - "A MEASURED retrieval rate for the Slice-A voter: 30 of 40 items retrieved, 10 decided from parametric memory -- recorded as a fourth limit"
  - "The closure of the Phase-22 record's self-declared weakest link: every dispatched string is recoverable from disk with a recomputing digest"
affects: [23-06, 23-07, 23-08, 23-09]

actuals:
  tokens: 14000
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "Halt on a transport precondition rather than substituting a permitted-looking transport: an executor without the required tool reports it instead of routing around a frozen prohibition"
    - "Amend both halves of a pre-spend discovery in ONE numbered record, recording superseded and in-force digests side by side so a re-pin is auditable rather than asserted"
    - "Prove a data format from the data before correcting for it: 24 of 40 first fields exceed 12, which is impossible for a month, so day-month-year is established rather than assumed"
    - "Keep an observation that was not pre-registered OUTSIDE the frozen verdict schema, so adding it cannot perturb the contract it sits beside"
    - "Re-cast an abstain on its ORIGINAL recorded dispatch string, reusing write-once provenance rather than rewriting it, and record both passes"

key-files:
  created:
    - eval/lz-eval-p23-sliceA-read-record.md
  modified:
    - eval/lz-eval-p23-prereg.md
    - eval/lz-eval-p23-prereg.test.mjs
    - eval/lz-eval-p23-capture-driver.md
    - eval/lz-eval-p23-sliceA-read.mjs

key-decisions:
  - "Task 1 resolved on option A (proceed now), maintainer-ratified 2026-09-07, and Slice A ran FIRST among the phase's metered readings so a later pool exhaustion costs the comparative reading and not the floor"
  - "The executing agent HALTED at Task 2's transport precondition rather than routing 40 items through claude -p, which the frozen driver absolutely prohibits as a voter transport"
  - "AMENDMENT RECORD 1 corrected the voter transport row to a generic Agent sub-agent on Sonnet 5 and added a day-month-year label to the cutoff line; both taken pre-spend with zero verdicts in existence, so no bar moved and no result had been seen"
  - "The one abstain was recorded as null rather than coded from its surrounding prose, then re-cast on its original recorded string; both passes are published"
  - "Retrieval was MEASURED per item and recorded as a fourth limit, because the third frozen PROVISIONAL limit's live-web assertion holds for 30 of 40 items rather than universally"
  - "No pooled rate, accuracy figure, interval or pass/fail verdict appears in either artifact, and none was derived"

patterns-established:
  - "A durable record carries every per-item row plus its dispatch digest, so the instrument is reconstructible from the committed file alone after a gitignored cache is destroyed"
  - "Independently recompute every delegated dispatch string from the frozen builder and the frozen draw, so a delegated loop is auditable rather than trusted"

requirements-completed: [ENV-03]

coverage:
  - id: D1
    description: "The verify-voter is scored against the frozen 40-item Slice-A seed list, judge-free, with the four confusion-matrix cells published PER DIRECTION and never pooled"
    requirement: ENV-03
    verification:
      - kind: other
        ref: "sliceARead from disk: key set exactly [drawSeed,n,provisionalLimits,refuted,unrefuted]; unrefuted {tp:18,fn:2}; refuted {tn:20,fp:0}; n=40; drawSeed=20260907"
        status: pass
      - kind: other
        ref: "read-contract gate (exact five-name key set, unrefuted row exactly tp+fn, refuted row exactly tn+fp, record required elements), exit 0"
        status: pass
      - kind: unit
        ref: "node --test eval/lz-eval-p23-sliceA-read.test.mjs eval/lz-eval-sliceA-gold.test.mjs eval/lz-eval-p23-sliceA-draw.test.mjs -- 61/61, exit 0"
        status: pass
    human_judgment: false
  - id: D2
    description: "The instrument is reconstructible from disk: 40 dispatch records carrying the exact dispatched string and its sha256, 40 definite verdicts, fail-closed pairing, closing the Phase-22 record's weakest link (SEED-005 / T-23-09)"
    requirement: ENV-03
    verification:
      - kind: other
        ref: "readSliceAVerdicts returned 40 pairs, fail-closed cross-check passed (no unmatched verdict, every stored sha256 recomputes)"
        status: pass
      - kind: other
        ref: "independent re-verification against buildDispatchString over the frozen draw: 40 files, 40 ok, 0 mismatched, no extra records, every drawn item present"
        status: pass
    human_judgment: false
  - id: D3
    description: "The dispatched set matches the frozen 40-item list item by item, and the ENV-03 blinding holds -- no gold field VALUE reaches any dispatched string"
    requirement: ENV-03
    verification:
      - kind: other
        ref: "draw re-derived from DRAW.SEED over the on-disk corpus: 40/40 lines matched the pre-registration verbatim, 0 mismatched; pool re-verified 83/181"
        status: pass
      - kind: other
        ref: "answer-leak probe built from each row's own gold VALUES (not hardcoded field names): 40/40 rows checked, 0 leaks; voterRecord key set is exactly claim,claim_date"
        status: pass
    human_judgment: false
  - id: D4
    description: "The read is published as a committed durable record framed as EXPLORATORY, with the three PROVISIONAL limits verbatim, the recorded decline of a confidence interval, the analogy caveat, the provenance attestation and all 40 per-item rows"
    requirement: ENV-03
    verification:
      - kind: other
        ref: "eval/lz-eval-p23-sliceA-read-record.md committed; gate asserts '## Review record', 'exploratory' and 'PROVISIONAL' present; 40 rows spliced in draw order, cells tally tp=18 fn=2 tn=20 fp=0"
        status: pass
    human_judgment: true
    rationale: "That the record contains no pooled rate, accuracy figure, interval or pass/fail verdict is a WORDING property. The mechanical half is covered by the exact key-set assertion on read.json and by a scan confirming every accuracy/interval/pooled mention is a negation or a recorded decline, but whether the prose as a whole avoids implying a certification is the ENV-08 content review's call, which is OPEN and closes in Plan 23-09."
  - id: D5
    description: "AMENDMENT RECORD 1: the voter transport row corrected and the dispatched cutoff labelled day-month-year, both taken BEFORE any dispatch with zero verdicts in existence, with superseded and in-force sha256 pins both recorded"
    requirement: ENV-01
    verification:
      - kind: unit
        ref: "eval/lz-eval-p23-prereg.test.mjs -- 25/25 pass, exit 0 (both re-pinned digests plus the verbatim-quote assertion)"
        status: pass
      - kind: other
        ref: "discrimination proof re-run against the NEW pin: one character removed from the template -> 22 pass / 3 fail, all three ENV-03 assertions firing; restored -> 25/25 (output verbatim in this SUMMARY)"
        status: pass
      - kind: unit
        ref: "full registered eval suite, 12 files, explicit FILE form -- 250/250 pass, exit 0"
        status: pass
    human_judgment: false
  - id: D6
    description: "Retrieval measured per item and published as a fourth limit: 30 of 40 items retrieved, 10 decided from parametric memory, so the third frozen PROVISIONAL limit's live-web assertion does not hold universally"
    requirement: ENV-03
    verification:
      - kind: other
        ref: "eval/.cache/p23-read/sliceA/retrieval.json, 40 entries; 10 with tool_uses=0 (unrefuted 4/20, refuted 6/20); held outside the frozen verdict schema"
        status: pass
    human_judgment: false

duration: see Performance
completed: 2026-09-08
status: complete
---

# Phase 23 Plan 05: the judge-free Slice-A read (ENV-03) Summary

**Phase 23 has its first published metered reading: the verify-voter cross-tabulated against 40 frozen AVeriTeC items, reported per direction and never pooled -- 18 true positives and 2 false negatives on the unrefuted arm, 20 true negatives and 0 false positives on the refuted arm -- with every dispatched string recoverable from disk, retrieval measured rather than assumed, and two pre-spend defects in the frozen instrument caught and amended before verdict one.**

## Task 1 -- the maintainer's choice, recorded first because everything else is conditional on it

**Maintainer choice: `A` -- proceed now. Date: 2026-09-07.** Reasoning as given:

> Slice A is the cheap certain reading and the captures are the expensive uncertain one, so spending the
> certain one first is what makes a stalled campaign end in a published branch-(b) termination rather
> than in nothing -- the concrete difference from Phases 19 through 22, all of which ended with no
> publishable reading.

This is neither branch (b) nor branch (c). **The dispatch ran and completed with 40 definite verdicts, so
ENV-03 is satisfied on its primary path** and `requirements-completed` lists it.

### The D-16 ancestry check, run twice

Orchestrator's run, before the go:

```
$ git merge-base --is-ancestor 9ab993319da0fc3a10ae0cba45f10cb19576b93a HEAD
exit=0
```

Executor's own re-run at HEAD `3821be2`, because HEAD had moved:

```
$ git merge-base --is-ancestor 9ab993319da0fc3a10ae0cba45f10cb19576b93a HEAD
exit=0
```

Re-confirmed a third time after the amendment commit, at HEAD `0b4e479`: **exit 0**. The freeze commit
`9ab9933` (2026-09-07T23:37:33+02:00) carries exactly the three freeze artifacts and is a strict git
ancestor of every artifact commit in this plan. This is an ancestry test, never a timestamp comparison.

## The four cells, per direction, never pooled

`sliceARead` returned EXACTLY the five keys `["drawSeed", "n", "provisionalLimits", "refuted",
"unrefuted"]`. **There is no rate, accuracy, interval or pass/fail field in the output, and none is
derived anywhere in this SUMMARY or in the read record.**

| Gold direction | Cell | Count |
|---|---|---|
| `unrefuted` (n = 20) | true positives (`tp`) | **18** |
| `unrefuted` (n = 20) | false negatives (`fn`) | **2** |
| `refuted` (n = 20) | true negatives (`tn`) | **20** |
| `refuted` (n = 20) | false positives (`fp`) | **0** |

`n` = 40 definite verdicts. `drawSeed` = 20260907.

**This is an EXPLORATORY diagnostic read, not a performance claim.** No threshold was set in advance for
it to pass and none is applied afterwards. The three PROVISIONAL limits -- the uniform 2020 `claim_date`,
the ~34% US-2020-politics / ~21% COVID topical narrowness, and the evidence-set mismatch between
2020-labelled gold and a live-2026-web voter -- came through unchanged from the frozen module and are
quoted verbatim in the read record. A confidence interval is declined by design, with its reason
recorded: at this n and against this reference standard the limit is on the CLAIM, not merely on an
interval.

### The error structure

Both errors are on the unrefuted arm: `unrefuted-17` and `unrefuted-6`, each returning `refuted` against
gold `unrefuted`. **Two false refutes, zero false upholds.** One retrieved (3 tool uses), one answered
from memory (0), so retrieval does not cleanly predict correctness at this n.

The candidate explanation recorded WITHOUT overclaiming it: the frozen prompt frames the task as deciding
"whether the CLAIM below is REFUTED", an asymmetric framing that could nudge toward refuting. **At n = 20
per arm, 2-versus-0 is not significant and is not presented as established** -- the phase's own up-front
ceiling forbids any significance claim.

**The balanced 20/20 draw and the per-direction reporting are what make the asymmetry visible at all.** A
pooled figure would have absorbed both errors into one number. That was the stated design reason before
any verdict existed, and it is the reason the most interesting thing in this run is legible.

## Retrieval, measured rather than assumed -- a fourth limit

The third frozen PROVISIONAL limit asserts the voter "searches the live 2026 web". Measured:

| | Retrieved (`tool_uses` > 0) | From parametric memory (`tool_uses` = 0) |
|---|---|---|
| gold `unrefuted` | 16 / 20 | 4 / 20 |
| gold `refuted` | 14 / 20 | 6 / 20 |
| **all** | **30 / 40** | **10 / 40** |

**Roughly a quarter of the pool was decided closed-book, so the third limit holds for 30 of 40 items
rather than universally**, and this reading is not purely open-book. The frozen prompt invites retrieval
but does not compel it, and retrieval is claim-dependent -- a model that already knows a fact does not
search.

The per-item counts live in `eval/.cache/p23-read/sliceA/retrieval.json`, **deliberately OUTSIDE the
frozen verdict schema**, so that recording an observation nobody pre-registered could not perturb
`readSliceAVerdicts` or the five-key contract.

## Provenance attestation -- the Phase-22 record's weakest link, closed

| Check | Result |
|---|---|
| Dispatch records / verdicts on disk | **40 / 40**, all verdicts definite |
| `readSliceAVerdicts` fail-closed cross-check | **PASSED** -- 40 pairs, no unmatched verdict, every stored sha256 recomputes from its stored string |
| Independent re-verification against `buildDispatchString` over the frozen draw | **40 ok / 0 mismatched**, no extra records, every drawn item present |
| Write-once provenance overwritten | **No** |
| Dispatched set vs the frozen 40-item list | **40/40 verbatim**, 0 mismatched; pool re-verified at 83/181 |
| Answer-leak probe from each row's own gold VALUES | **40/40 rows, 0 leaks**; `voterRecord` key set is exactly `claim,claim_date` |

The independent re-verification exists because **32 of the 40 items were dispatched by a delegated
loop**: recomputing every string from the frozen builder is what makes that delegation auditable rather
than trusted. The dispatch harness was ephemeral scratchpad tooling that never entered the repository,
and **it composed no prompt** -- every string came from the frozen `buildDispatchString` and every record
from the frozen write-once `writeDispatchRecord`.

## The abstain, and its re-cast

`refuted drawIndex=14` (Pogba / Macron) first returned the verdict word followed by a blank line and a
`Sources:` list of four URLs, so the last whitespace-delimited token was part of a URL. **It was recorded
`null` -- an abstain -- rather than coded from the obvious surrounding prose.** It was then re-cast on its
ORIGINAL recorded dispatch string, reusing the write-once provenance rather than rewriting it, and
returned a clean `refuted` with 2 tool uses.

Both passes are published in the read record. An abstain that is re-cast is exactly the plan's "re-cast
on the next pass" path, and omitting the first pass would misstate the run.

**The verdict parsing rule, frozen at dispatch time and applied uniformly to all 40:** the verdict is the
LAST whitespace-delimited token, lowercased and stripped of trailing punctuation, and must be exactly
`refuted` or `unrefuted`; anything else is an abstain. Fixing it before the verdicts were read is what
keeps it a parser rather than a coder. One preamble case is noted in `format-notes.json`
(`unrefuted-52`).

## The transport halt, and AMENDMENT RECORD 1

**This plan's executor halted before dispatching anything**, and the halt is why the run is sound.

Task 2 requires the voter to be an Agent sub-agent on the session pool; the frozen driver's ABSOLUTE
PROHIBITIONS state that `claude -p` is NEVER a voter transport. The executing agent had no Agent tool.
**It reported that rather than routing 40 items through a permitted-looking substitute**, and the
maintainer resolved it by amendment.

Checking the frozen instrument against disk at that point surfaced two defects, both fixed pre-spend in
ONE numbered record -- **AMENDMENT RECORD 1, maintainer-ratified 2026-09-08, taken with ZERO verdicts in
existence.** No result had been seen because no result existed, and **no BAR moved**: the 40-item list,
`DRAW.SEED`, the balanced draw, the per-direction rule, the five-key contract and the three PROVISIONAL
limits are all untouched. The pre-registration never named a transport anywhere -- only the driver did.

**Half (a) -- the transport row named a seat that cannot run this dispatch.** The driver specified the
shipped `research-verify-voter-sonnet` agent, and Task 2's `read_first` justified reading it "so the
dispatched prompt matches what the agent expects". **False on disk**: that seat requires four inputs the
pinned string does not carry (evidence excerpt, attack mode, arm, vote-file path) and is contracted to
write a four-field vote JSON, where the pinned string demands one lowercase word. It is also absent from
the executing registry, because the plugin is deliberately disabled in-repo so the marketplace build
cannot shadow the working tree. Corrected to a generic Agent sub-agent on Sonnet 5 receiving the
`buildDispatchString` output verbatim. Every absolute prohibition is unchanged.

**Half (b) -- the dispatched cutoff was ambiguous in a direction-biasing way.** 16 of 40 `claim_date`
values have a first field <= 12, so `1-10-2020` read as either 1 October or 10 January. **The
day-month-year order is PROVEN from the draw, not assumed: 24 of 40 have a first field greater than 12,
which is impossible for a month.** A month-day misreading lands earlier in the year and excludes evidence
the voter was entitled to use; for refuted claims the refuting evidence usually sits near the fact-check
date, so exclusion pushes toward `unrefuted` -- a direction-biasing false negative on the refuted arm, in
the phase's only guaranteed reading. The balanced per-direction reporting would have made it visible, but
**prevention beat observation because prevention was free pre-spend**: one label on one line.

The template change is exactly one line, `CUTOFF:` to `CUTOFF (day-month-year):`. No date converter, no
reformatted value, and the T-22-15 replacer-function substitution untouched.

### The re-pinned digests, old and new

| Pin | Superseded (freeze `9ab9933`) | In force (AMENDMENT RECORD 1) |
|---|---|---|
| Template round-trip | `8a93c283591b1e81046a8d1d61da9d0e035ea922c5105afacf215b911309fe5a` | `a1cb493a980307271666597ac306d9cd383efdc9493acefefcf1aa159e7f1318` |
| Fixed synthetic instantiation | `4a2c47f2a70009762addb16f2485d362a13eda8ed0490406ecd4f654f1aa4efe` | `e95cc436b092adbb596b4ae16a2a9016088ad28bb1603341609f22d2a7960430` |

Both RECOMPUTED from the changed template, never hand-edited toward a guess, and both directions recorded
so a later reader can confirm the superseded digest belonged to the superseded template.

## How the seat was chosen -- on evidence, not assertion

A first pilot used a synthetic claim ("Nigeria's capital city is Lagos") that is not one of the 40. Both
candidate seats answered in about two seconds with zero tool uses, and one answered WRONG.

**That first pilot was a badly designed probe, not evidence of a broken seat** -- the fact was easy enough
to answer from memory, so it could not test retrieval at all. A second pilot used an unknowable synthetic
claim, and the same `Explore` seat then made two confirmed `WebSearch` calls over 29.8 seconds.

The conclusion carried into the limits: **the frozen prompt invites retrieval but does not compel it, and
retrieval is claim-dependent.** Final seat: `subagent_type: "Explore"`, `model: "sonnet"`, one drawn item
per call, session pool -- matching AMENDMENT RECORD 1's generic Agent sub-agent on Sonnet 5.

## Performance

- **Tasks:** 3 of 3 (Task 1 resolved by the maintainer; Task 2 dispatched session-driven by the
  orchestrator after the amendment; Task 3 scored and published)
- **Commits:** 2 (`0b4e479` the amendment, plus this plan's record commit)
- **Files:** 1 created, 4 modified
- **Spend:** 40 voter dispatches + 1 re-cast + 2 pilots, on the shared session pool. All scoring was from
  disk at zero further spend.

### Pacing record

| | |
|---|---|
| Items dispatched | 40 |
| Re-casts | 1 (`refuted drawIndex=14`, after an abstain) |
| Rate-limit events | none observed |
| Reset-window spread | a single window; the dispatch did not span a pool reset |
| Realized terminal cost | **not separately metered** -- the Agent-tool voter draws the shared session pool and no per-call cost figure is exposed to the dispatching session |

The cost row is recorded as unavailable rather than estimated, per this phase's standing rule that a
figure is measured or recorded absent, never guessed at. Slice A ran FIRST among the metered readings, so
a later pool exhaustion costs the phase its comparative reading and not its floor.

## Task Commits

1. **Task 1** -- a `blocking-human` decision checkpoint; nothing committed.
2. **Task 2** -- halted at the transport precondition, then unblocked by `0b4e479`
   (`amend(23-05): AMENDMENT RECORD 1 -- correct the voter transport row and label the dispatched
   cutoff`). The dispatch itself writes only into the gitignored cache, so it produces no commit.
3. **Task 3** -- the read record and this SUMMARY, in the plan metadata commit below.

## Verification

| Check | Result |
|---|---|
| `node --test eval/lz-eval-p23-prereg.test.mjs` | **25/25 pass, exit 0** |
| `node --test eval/lz-eval-p23-sliceA-read.test.mjs eval/lz-eval-sliceA-gold.test.mjs eval/lz-eval-p23-sliceA-draw.test.mjs` | **61/61 pass, exit 0** |
| Full registered eval suite (12 files, explicit FILE form) | **250/250 pass, exit 0** |
| Task 2 gate (40 dispatch records + 40 verdicts) | `[OK] 40 dispatch records and 40 verdicts`, exit 0 |
| Task 3 gate (exact five-key contract + record elements) | `[OK] never-pooled five-key read contract; read record carries its required elements`, exit 0 |
| 40 drawn lines still verbatim in the pre-registration | **40/40 matched, 0 mismatched** |
| Read record: pooled-metric scan | every `accuracy` / `interval` / `pooled` mention is a NEGATION or a recorded decline; no derived rate anywhere |
| Read record: banned-word scan | none |
| ASCII / LF / no BOM | read record LF-only, BOM-free, exactly 11 non-ASCII characters -- `U+2019` x10 and `U+00A0` x1, all from quoted corpus claims, byte-identical to the corpus |
| `git diff .planning/config.json .planning/STATE.md` empty before staging | confirmed |
| `git config user.email` | confirmed by ALLOWLIST INVERSION -- the only email-shaped token across git identity and every changed file is the approved public address; the excluded address was never written as a search needle |

### The discrimination proof against the NEW pin

One character removed from `VOTER_PROMPT_TEMPLATE` (the comma before `or unrefuted`) -- **22 pass / 3
fail**, all three ENV-03 assertions firing:

```
X ENV-03: the rendered voter prompt template matches its pinned sha256 (what was reviewed is what runs)
  AssertionError: buildDispatchString rendered a template that does not match the frozen sha256 -- the instrument changed
  + '6ff53ef1cfc3e470eff3d90d22f68fcc1399574107bcd22eeb83bace1a7f0b5d'
  - 'a1cb493a980307271666597ac306d9cd383efdc9493acefefcf1aa159e7f1318'

X ENV-03: a fixed synthetic instantiation matches its pinned sha256
  AssertionError: the synthetic dispatch string drifted
  + '1724da61ee438ac48b377a56a13779d5fa4461fd9b6bf51a5d23c97ca46321b4'
  - 'e95cc436b092adbb596b4ae16a2a9016088ad28bb1603341609f22d2a7960430'

X ENV-03: the pre-registration quotes the rendered voter prompt template VERBATIM
  AssertionError: the pre-registration must quote the template buildDispatchString renders, byte-for-byte
```

**Restored, re-run: `tests 25 / pass 25 / fail 0`, exit 0.**

### The gate discrimination proofs, run on the never-ran path before the dispatch

Both gates are existence-tolerant in one direction only. Run while no dispatch had occurred:

| Step | Task 2 gate | Task 3 gate |
|---|---|---|
| Baseline: no dirs, no record | `[OK]` exit 0 | `[OK]` exit 0 |
| Tamper: empty read record with nothing behind it | **FAIL** exit 1 -- "a record must not outlive a dispatch that never ran" | **FAIL** exit 1 -- "a published reading must rest on an output on disk" |
| Restore | `[OK]` exit 0 | `[OK]` exit 0 |

The remaining half of Task 2's proof -- "with the directories present, remove one dispatch record and
observe FAIL" -- is **recorded as NOT-EXERCISED rather than claimed.** It was not runnable when the proofs
were taken (no directories existed), and after the dispatch it would have meant deleting one of the 40
irreplaceable write-once provenance records from a gitignored cache with no backup (T-23-06). The
completeness half is nonetheless covered: the gate asserts exactly 40 in each directory and both
directories were independently confirmed at 40.

## Deviations from Plan

### 1. [Rule 4 - Architectural] Task 2's specified voter seat cannot run the frozen dispatch

- **Found during:** Task 2, before any dispatch
- **Issue:** the plan and the driver route the dispatch through `research-verify-voter-sonnet`. On disk
  that agent requires four inputs the pinned string does not carry and writes a four-field vote JSON
  where the pinned string demands one lowercase word; it is also not loadable in the executing session.
  Separately, the executing agent had no Agent tool, and `claude -p` is absolutely prohibited as a voter
  transport.
- **Action:** HALTED and escalated as a `blocking-human` checkpoint rather than substituting a transport.
  Resolved by AMENDMENT RECORD 1 and a session-driven dispatch from the orchestrator.
- **Files:** `eval/lz-eval-p23-capture-driver.md`, `eval/lz-eval-p23-prereg.md`
- **Committed in:** `0b4e479`

### 2. [Rule 2 - Missing Critical] The dispatched cutoff carried no field-order label

- **Found during:** Task 2, pre-dispatch verification
- **Issue:** 16 of 40 `claim_date` values are ambiguous between day-month and month-day when read alone,
  and a month-day misreading is direction-biasing toward `unrefuted` on the refuted arm.
- **Fix:** one line of the frozen template, `CUTOFF:` to `CUTOFF (day-month-year):`, with both sha256
  pins recomputed. Format proven from the data: 24 of 40 first fields exceed 12.
- **Files:** `eval/lz-eval-p23-sliceA-read.mjs`, `eval/lz-eval-p23-prereg.md`,
  `eval/lz-eval-p23-prereg.test.mjs`
- **Committed in:** `0b4e479`

### 3. [Rule 2 - Missing Critical] Retrieval measured and published as a fourth limit

- **Found during:** Task 2 seat selection
- **Issue:** the third frozen PROVISIONAL limit asserts the voter searches the live 2026 web. Two pilots
  showed retrieval is claim-dependent, so the assertion could not be taken as universal.
- **Fix:** `tool_uses` recorded per item into `retrieval.json`, held OUTSIDE the frozen verdict schema so
  it cannot perturb the read, and published as a fourth limit: the assertion holds for 30 of 40 items.
- **Files:** `eval/.cache/p23-read/sliceA/retrieval.json` (gitignored),
  `eval/lz-eval-p23-sliceA-read-record.md`

### 4. [Plan-directed] The Task-1 checkpoint was resolved before this executor started

- Task 1 is `blocking-human`; the maintainer answered `A` on 2026-09-07 and the orchestrator supplied the
  choice, its reasoning and the precondition output. Recorded verbatim above rather than re-asked.

---

**Total deviations:** 1 escalated to the maintainer (Rule 4), 2 auto-fixed missing-critical hardenings,
1 plan-directed.
**Impact:** no scope creep and no criterion weakened. Deviations 1 and 2 corrected defects in the frozen
instrument BEFORE any verdict existed, which is the only window in which correcting them is free.

## The sixth and seventh plan-stated figures to disagree with disk

The phase's standing discipline held again. Every discrepancy was recorded, none was reconciled away, and
no artifact was bent to fit an expected number.

| # | Claim | Disk |
|---|---|---|
| 6 | 23-05-PLAN Task 2: reading `research-verify-voter-sonnet.md` shows "what the agent expects" of the dispatched prompt | that agent expects four inputs the pinned string does not carry, and writes a vote JSON where the pinned string demands one word |
| 7 | The third frozen PROVISIONAL limit: the verify-voter "searches the live 2026 web" | true for 30 of 40 items; 10 were decided from parametric memory |

Items 1-5 are recorded in `23-04-SUMMARY.md`.

## Issues Encountered

- **The executing agent could not dispatch.** Resolved by amendment plus a session-driven dispatch, not
  by a workaround. Described in full above.
- **No SDK mutator was invoked at any point in this plan's execution.** No `gsd-tools query` verb ran, so
  nothing could delete `branching_strategy` from `.planning/config.json`. `git diff .planning/config.json
  .planning/STATE.md` was empty before staging and both files are byte-identical to HEAD.
  `state.update-progress` was NOT called.
- **`requirements.mark-complete` was NOT run.** The orchestrator owns planning-file writes for this
  phase; `requirements-completed: [ENV-03]` is recorded in this frontmatter and `.planning/REQUIREMENTS.md`
  is left to the orchestrator.
- **The irreplaceable gitignored caches are intact.** No `git clean` was run in any form. The AVeriTeC
  cache, both q1 captures, both MANIFESTs and the excerpt corpus were read only. The 40 write-once
  dispatch records and 40 verdicts were never overwritten, and `read.json` was written once.
- **The Edit tool's non-ASCII round-trip limitation was avoided, not tested.** All 40 per-item rows
  carrying corpus Unicode were generated and spliced by script, the same method Plans 23-01, 23-02 and
  23-04 settled on. Verified afterwards: the record holds exactly `U+2019` x10 and `U+00A0` x1, matching
  the corpus.

## Known Stubs

None. No placeholder, no zero-filled output, no fabricated record.

## Review record

**ENV-08 content review of `eval/lz-eval-p23-sliceA-read-record.md` is OWED and OPEN**, and the record
says so in its own `## Review record` section. It has had executing-session review only, which under the
project's review-before-use-or-publication rule is not review for a published artifact.

Tracked in `.planning/WINDOWS.md` alongside defect id 1 (the Wave-3 dry-run record and the Wave-1/2/3
modules). ENV-08 is a phase-wide gate that closes in Plan 23-09 and blocks `/gsd-ship`; it does not block
this reading from being recorded, and recording it with the gap named beats leaving it in a gitignored
cache that one clean would destroy.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Plan 23-06** (the q2 capture pair, the D-17 retention step first, and the ENV-05 option).

Carried forward:

- **Phase 23 now has a published metered reading, so termination branch (b) has a real floor under it.**
  That was the entire reason Slice A was ordered first, and it is the concrete difference from Phases 19
  through 22.
- **The pool has been drawn on.** 40 dispatches plus a re-cast plus two pilots came out of the same
  5-hour pool the q2 captures need. The Phase-22 built-in capture consumed roughly 1.4 windows across two
  resets with three resume cycles, so budget 23-06 accordingly and expect an extra reset window.
- **AMENDMENT RECORD 1 is now part of the frozen authority.** Any further change is amendment 2, numbered
  and dated at the time it is taken. The voter transport row and the day-month-year cutoff label are
  settled.
- **The read record's ENV-08 review is owed** and is one of the items 23-09 must close.
- **Every later plan must still prove its own ancestry** with
  `git merge-base --is-ancestor 9ab993319da0fc3a10ae0cba45f10cb19576b93a HEAD`.

## Self-Check: PASSED

- `eval/lz-eval-p23-sliceA-read-record.md` -- FOUND (303 lines, 40 per-item rows, cells tally tp=18 fn=2
  tn=20 fp=0)
- `eval/.cache/p23-read/sliceA/read.json` -- FOUND, exact five-key set
- `eval/.cache/p23-read/sliceA/dispatch/` -- 40 records; `.../verdicts/` -- 40 verdicts
- Commit `0b4e479` -- FOUND in `git log`
- Plan `<verification>`: ancestry exit 0 (three times); 40 dispatch records with recomputing digests and
  40 definite verdicts; `read.json` satisfies the exact five-key contract with both per-direction rows;
  the three-file co-test gate 61/61 exit 0; the pre-registration changed ONLY by a dated AMENDMENT RECORD
  entry; `git diff .planning/config.json .planning/STATE.md` empty before staging
- All task `<acceptance_criteria>` re-run and passing, with the one not-exercised item recorded as
  not-exercised rather than claimed
- **No pooled rate, accuracy figure, confidence interval or pass/fail verdict appears in either artifact**

---
*Phase: 23-judge-free-confidence-and-operating-envelope-for-lz-deep-res*
*Completed: 2026-09-08*
