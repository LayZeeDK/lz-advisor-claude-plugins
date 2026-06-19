# Phase 20 Plan 04: SC-5 Headless Scale-Confirmation Spike (D-13)

**Status:** PASSED -- all 5 D-13 gating criteria + INTEG-01 + INTEG-02 satisfied.
**Run date:** 2026-06-19 (run dir `20260619-232106`); graded 2026-06-20.
**Spend:** real Claude session-pool spend, total_cost_usd $29.07 (user-authorized; result reviewed + accepted by the user).

This is the #1 build-time unknown for the milestone: the only stage that proves the packaged
`lz-deep-research` SKILL.md's wave-batch cap, exactly-two-Opus-gates, and host stability HOLD at real
concurrency under headless `claude -p` (the A2 spike only proved n=2). The acceptance is parsed
mechanically + un-fakeably from the captured stream-json trace by the Task-2 parser
(`eval/lz-eval-sc5-trace.mjs`), not read subjectively (T-20-14 mitigation).

## Exact Invocation

Question (FIXED, modest-scope, genuinely multi-angle -- four explicit dimensions so >= 3 sequential
waves fire; recorded in the run dir's `scope.md`):

> What are the documented trade-offs of WebAssembly vs. native compilation for CPU-bound workloads --
> across performance, portability, security sandboxing, and toolchain maturity?

Main spike (capture stdout to a FILE so the raw trace persists even if interrupted):

```
claude --model sonnet --permission-mode auto --plugin-dir plugins/lz-advisor \
  -p "/lz-advisor:lz-deep-research What are the documented trade-offs of WebAssembly vs. native compilation for CPU-bound workloads -- across performance, portability, security sandboxing, and toolchain maturity?" \
  --verbose --output-format stream-json > eval/.cache/p20-sc5/sc5-spike.stream.json 2>&1
```

- `--permission-mode auto` is REQUIRED (acceptEdits denies the skill launch + blocks non-git `node`).
- NO `@file` mention in the `-p` prompt (breaks slash-command recognition -- prose path only).
- The committed `.claude/settings.json` disables the marketplace lz-advisor in this repo, so the
  `--plugin-dir` build is the one under test.

## Captured-trace paths (gitignored `eval/.cache/p20-sc5/`)

| File | Shape | Notes |
|------|-------|-------|
| `sc5-spike.stream.json` | raw JSONL + 1 stderr line | `2>&1` interleaved one `Warning: no stdin data received` line |
| `sc5-spike.clean.jsonl` | JSONL (one event per line) | stderr line removed |
| `sc5-spike.array.json` | JSON array | pre-converted array form fed to the parser |
| `init-probe.stream.json` | JSONL | the INTEG-01 discoverability init probe |

After the Task-1 JSONL-adapter fix (commit `e5e62d1`), the parser grades ALL THREE main-trace shapes
identically -- including the raw `2>&1` file with the interleaved stderr line:

```
node eval/lz-eval-sc5-trace.mjs eval/.cache/p20-sc5/sc5-spike.array.json   -> pass=true maxInFlight=5 advisorSpawns=2 waves=24
node eval/lz-eval-sc5-trace.mjs eval/.cache/p20-sc5/sc5-spike.clean.jsonl  -> pass=true maxInFlight=5 advisorSpawns=2 waves=24
node eval/lz-eval-sc5-trace.mjs eval/.cache/p20-sc5/sc5-spike.stream.json  -> pass=true maxInFlight=5 advisorSpawns=2 waves=24
```

## Parser verdict object (frozen)

```json
{
  "maxInFlight": 5,
  "waves": 24,
  "waveBoundaryHeld": true,
  "exitOk": true,
  "survivorsReproducible": false,
  "workerWriteFailures": 0,
  "advisorSpawns": 2,
  "pass": true
}
```

`pass` = AND(maxInFlight<=5, waves>=3, waveBoundaryHeld, exitOk, workerWriteFailures===0,
advisorSpawns===2) = `true`. The two tightest gates are EXACTLY at their bound: maxInFlight is EXACTLY
5 (the COST-03 / D-08 cap), advisorSpawns is EXACTLY 2 (COST-01 / D-18 two-gates).

## The 5 D-13 acceptance verdicts (observed values)

| # | Criterion | Observed | Verdict |
|---|-----------|----------|---------|
| 1 | max-in-flight: max concurrent in-flight Agent calls <= 5 across >= 3 sequential waves | maxInFlight = 5; waves = 24 | PASS (cap exactly held; well above the 3-wave floor) |
| 2 | each wave's next-batch spawn is AFTER all prior-batch results (foreground/wait boundary) | waveBoundaryHeld = true | PASS |
| 3 | host stable: exit 0 + survivors.json on disk + independent aggregator re-run reproduces the summary | exit 0 (subtype success); survivors.json present; aggregator re-run reproduced summary, exit 0 | PASS (see note below) |
| 4 | zero worker Write failures | workerWriteFailures = 0 | PASS |
| 5 | advisor spawns == 2 (the two Opus gates) | advisorSpawns = 2 | PASS |

### Criterion 3 note: `survivorsReproducible: false` is a heuristic FALSE-NEGATIVE

The parser's `survivorsReproducible` flag is `false`, but criterion 3 is nonetheless SATISFIED. The flag
is a heuristic that tries to match a recorded survivors-summary line inside the parent stream-json; it
could not match in the live JSONL shape (the live capture does not echo the aggregator's stdout summary
in a form the heuristic recognizes), so it reports a FALSE-NEGATIVE. Criterion 3 is confirmed
INDEPENDENTLY by re-running the off-model aggregator over the retained run dir:

```
node "plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs" ".lz-research/20260619-232106-wasm-vs-native-cpu/"
raw: 70 -> clusters: 70 (merged: 0)
quote-recheck: verified 70 | downgraded 0 | dropped 0
capped: claims 70->24 synth 24->20 votes_ignored 16
survivors: 20 (High 3, Medium 0, Low 1, Contested 16, Unsupported 0)
exit 0
```

The deterministic re-run REPRODUCES the survivors summary and exits 0, so the host is stable and the
survivors.json is reproducible. (`survivorsReproducible` is NOT one of the AND-folded gating booleans,
so its heuristic false-negative does not affect the `pass: true` verdict; it is informational only.)

## Run dir (retained audit trail, gitignored under `.lz-research/`)

`.lz-research/20260619-232106-wasm-vs-native-cpu/` -- `scope.md`, `survivors.json` (7.5KB, 20
survivors), `report.md` (~21.9KB cited report), plus `votes/`, `sources/`, `claims/`, `excerpts/`,
`candidates/`, `vote_context.json`. Survivors: 20 (Contested 16, High 3, Low 1); every survivor carries
the frozen record shape `{ id, claim, sources, corroboration_lower_bound, quote_fidelity, confidence,
escalate }`. Retained on disk per AGG-05; gitignored per INTEG-02 (never committed).

## INTEG-01: discoverability (init probe)

The init probe's stream-json INIT (`type: system`, `subtype: init`) event's `slash_commands` list
INCLUDES `lz-advisor:lz-deep-research` (confirmed by parsing the captured `init-probe.stream.json`, NOT
a model self-report):

```
deep-research slash_commands: ["deep-research","lz-advisor:lz-deep-research"]
```

The packaged skill at `skills/lz-deep-research/SKILL.md` auto-discovers and surfaces as
`lz-advisor:lz-deep-research`. The bare-form `deep-research` built-in also appears in the list; the
QUALIFIED form de-shadows it. NOTE: the bare-form `/deep-research` collision is resolved in the
INTERACTIVE picker and CANNOT be confirmed headless (the qualified probe cannot catch bare-form
collisions -- MEMORY headless_probe). INTEG-01 satisfied.

## INTEG-02: gitignore

```
git check-ignore .lz-research/20260619-232106-wasm-vs-native-cpu/scope.md
.lz-research/20260619-232106-wasm-vs-native-cpu/scope.md   (exit 0)
```

The `/.lz-research/` entry was added to `.gitignore` in commit `5b244ef`. INTEG-02 satisfied.

## Merged multi-member cluster (Risk 1 / D-15): satisfied-by-equivalent-coverage (NOT a blocker)

The live run produced single-member clusters ONLY (`merged: 0` in the aggregator re-run above), so the
LIVE merged-cluster sub-criterion was not exercised by this particular question. This is satisfied by
equivalent deterministic coverage, NOT a blocker, because:

- D-13 (the AUTHORITATIVE SC-5 gate) does NOT include merged-cluster; the 5 gating criteria all PASS.
- D-15 + RESEARCH.md Risk 1 prescribe a DETERMINISTIC worker-contract check that at least one MERGED
  multi-member cluster's votes key by cluster id and tally correctly -- explicitly ALONGSIDE the spike.
- That deterministic check EXISTS and PASSES:
  `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs:1192`
  -- test `D-12b load_bearing OR-folds across cluster members`. Two same-text claims (Jaccard 1.0)
  from TWO sources MERGE into ONE cluster (`survivors.length === 1`); the votes are keyed by CLUSTER id
  (`votes/cluster0-{0,1,2}.json`) and tally to High (3/3 unrefuted); the load_bearing OR-fold across
  members sets `escalate: true`. The aggregator suite is green (49/49, FILE form), so this test passes.

This is the Risk-1 worker-contract coverage that the live single-member run did not happen to exercise.

## Parser JSONL-adapter fix (Task 1 of this resume; commit `e5e62d1`)

The captured spike exposed a real gap in the Task-2 parser: `gradeTraceFile` originally
`JSON.parse`-d the whole file as a single array, but native `claude -p --output-format stream-json`
emits JSONL (one object per line) and -- with a `2>&1` redirect -- can interleave a non-JSON stderr
line. The fix adds `parseTraceText`: it tries the JSON-array shape first (back-compat for
`*.array.json` + stub fixtures), else splits into lines and parses each, IGNORING blank + non-JSON
lines, and fails closed (ContractError) only when no line yields an event. Four tests were added
(JSONL == array grading; interleaved-stderr ignored; no-events fail-closed; real-shape JSONL via
`gradeTraceFile`); all prior array-fixture tests stay green. `node --test
eval/lz-eval-sc5-trace.test.mjs` -> 13/13 PASS (FILE form). Proven on all three real capture files
above.

## Cost instrumentation (session-pool spend)

### Total (from the stream-json `result` event)

| Metric | Value |
|--------|-------|
| total_cost_usd | $29.07 |
| num_turns | 144 |
| duration_ms (wall-clock) | 3,446,594 ms (~57.4 min) |
| duration_api_ms (cumulative API) | 8,675,625 ms (~144.6 min; ~2.5x wall-clock -> ~2.5 avg concurrent API streams) |
| session_id | 5cfdddb0-faf9-41c4-b38e-d8b897c8552d |
| exit | 0 (subtype success, is_error false) |

Parent-session `result.usage` (the orchestrator's OWN stream): input 4,195; output 99,834;
cache_creation 362,317; cache_read 5,260,022; server WebSearch 0 / WebFetch 0 at the parent (workers
own their own search/fetch). This is the orchestrator context only -- the worker spend is in the
per-subagent JSONLs below.

### Per-subagent (role-correlated)

Roles classified MECHANICALLY by each subagent JSONL's sibling `.meta.json` `agentType` field (the
authoritative dispatch correlation: `agentType` + `toolUseId`) -- NOT the broken `cost-report.mjs`
heuristic (which had mislabeled all 100 as "advisor"). The 100 subagent JSONLs map 1:1 to the 100
Agent dispatch events in the parent trace (by subagent_type: advisor 2, search 7, extract 15, voter
76 -- which matches the JSONL meta tally exactly). Built via `eval/.cache/p20-sc5/cost-table.mjs`.

| Role | n | input_tok | output_tok | cache_read | cache_creation | wall-clock (sum) | tool_uses |
|------|---|-----------|------------|------------|----------------|------------------|-----------|
| research-verify-voter-sonnet | 76 | 44,357 | 73,035 | 5,732,933 | 4,098,971 | 3,490 s | 166 |
| research-extract-worker | 15 | 193 | 30,185 | 2,833,691 | 728,816 | 745 s | 73 |
| research-search-worker | 7 | 31,728 | 11,774 | 1,785,696 | 647,450 | 1,319 s | 64 |
| advisor (Opus gates) | 2 | 4 | 261 | 0 | 77,693 | 14 s | 0 |
| GRAND TOTAL | 100 | 76,282 | 115,255 | 10,352,320 | 5,552,930 | 5,568 s (92.8 min) | 303 |

Observations:
- The summed per-subagent wall-clock is 92.8 min, but real wall-clock was 57.4 min -- the <= 5
  concurrency overlap COMPRESSED the 92.8 min of subagent work into 57.4 min (criterion 1 in action).
- The 76 verify voters dominate output tokens (73,035 of 115,255) -- adversarial verification is the
  cost center, as designed.
- 15 extract workers = the frozen MAX_FETCH = 15 cap; the search wave used 7 workers.
- The 2 advisor gates are minimal-output read-only synthesis (n=2, output 261, 0 tool_uses, 14 s),
  confirming the two-Opus-gates discipline from the JSONL side (cross-check below).

### JSONL cross-check (nested tool-use hidden from the parent trace)

Per MEMORY project_test_5_tool_budget_threshold_ambiguity, a subagent's OWN tool-use is hidden from the
parent stream-json, so the advisor-spawn count + worker Write outcomes are cross-checked against the
per-agent JSONLs:

- Advisor spawns == 2: CONFIRMED on BOTH sides -- the parent trace has exactly 2 `subagent_type:
  lz-advisor:advisor` Agent dispatch events, AND exactly 2 subagent `.meta.json` files carry
  `agentType: lz-advisor:advisor`. Matches the parser's `advisorSpawns: 2`.
- Worker Write outcomes: zero worker Write failures (parser `workerWriteFailures: 0`); the extract +
  search workers (which carry the least-privilege Write grant to the run dir) recorded tool_uses with
  no failed Write tool_results in their JSONLs. Confirmed.

## Verdict

PASSED. All 5 D-13 gating criteria pass (maxInFlight EXACTLY 5; advisorSpawns EXACTLY 2; boundary held;
exit 0 + reproducible survivors; zero Write failures). INTEG-01 (discoverable) + INTEG-02 (gitignored)
satisfied. The merged-cluster sub-criterion is covered deterministically by the D-12b worker-contract
test (file:line cited). No BLOCKER. The packaged `lz-deep-research` skill holds at real headless
concurrency.
