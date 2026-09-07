---
phase: 23-judge-free-confidence-and-operating-envelope-for-lz-deep-res
plan: 01
subsystem: testing
tags: [node-test, stream-json, manifest, citation-canonicalization, ci, tdd]

# Dependency graph
requires:
  - phase: 22-deep-research-skill-eval-and-parity-baseline-with-built-in-d
    provides: "eval/lz-eval-baseline-manifest.mjs (extractSystemInit/buildManifest/validateManifest), the two q1 captures under the gitignored eval/.cache/p22-baseline/, and the known-defect proofs authored by the Phase-22 Nyquist audit"
provides:
  - "extractSystemInit pins a CC version from a REAL system/init event (claude_code_version), so a MANIFEST can be produced from a real capture at all"
  - "extractTerminalCost + aggregateRunCost: the RESOLVED per-run cost source (D-22) with a caller-owned stream enumeration"
  - "validateManifest rejects a zero-byte report.md (Phase-22 defect B2 / security flag F4 closed)"
  - "buildManifest records cost provenance: costStreams, costStreamsExcluded, resumeCycles"
  - "Both q1 captures are ADMISSIBLE: two validateManifest-passing MANIFEST files on disk"
  - "canonicalizeCitation + ARXIV_RE / DOI_RE / KEEP_PARAMS: the frozen ENV-04 identifier canonicalizer (thin first slice)"
  - "The Phase-22 defect proofs promoted into the eval/*.test.mjs suite glob as a standing regression guard"
  - "Three eval test files registered in CI"
affects: [23-02, 23-03, 23-04, 23-06, 23-07]

actuals:
  tokens: 10818
  tasks: 3
  commits: 5

tech-stack:
  added: []
  patterns:
    - "Caller-owned enumeration for any aggregated figure: aggregateRunCost never discovers its inputs from the filesystem, and the enumeration plus its exclusions are recorded on the artifact"
    - "Rule-ordered canonicalization with a reported raw: fallback bucket -- an unmatched token is surfaced, never dropped"
    - "Skip-if-absent guards on every test that reads the gitignored eval/.cache/ tree, so a fresh clone degrades to skips rather than a fabricated fixture"

key-files:
  created:
    - eval/lz-eval-p23-citation-audit.mjs
    - eval/lz-eval-p23-citation-audit.test.mjs
    - eval/lz-eval-baseline-manifest-defects.test.mjs
    - eval/.cache/p22-baseline/lz/qB1-run1.MANIFEST.json
    - eval/.cache/p22-baseline/builtin/qB1-run1.MANIFEST.json
  modified:
    - eval/lz-eval-baseline-manifest.mjs
    - eval/lz-eval-baseline-manifest.test.mjs
    - .github/workflows/ci.yml

key-decisions:
  - "D-22 RESOLVED and named on the artifact: the per-run cost source is the LAST type=result event's total_cost_usd of each capture stream, summed by aggregateRunCost over a caller-enumerated stream list"
  - "The built-in q1 cost enumeration is THREE streams (67.085261) and the different-session broad-partial stream is EXCLUDED with its reason recorded on the MANIFEST; including it would produce 114.166644"
  - "The zero-byte report threshold is exactly zero bytes -- a truncation check, not a content heuristic, so a one-byte report still validates"
  - "buildManifest also threads costStreamsExcluded and resumeCycles, not only costStreams, so both MANIFESTs carry their full provenance through one write path instead of post-hoc mutation"
  - "The plan's stated lz model (claude-opus-4-8) is wrong for that capture; the real pin is claude-sonnet-4-6[1m], which is correct for the advisor strategy's Sonnet executor"

patterns-established:
  - "Discrimination by not-equal against the wrong implementation's output: asserting extractTerminalCost != 0.7800860000000001 and the built-in total != 114.166644 is what makes those tests catch a first-result-event or directory-glob regression"
  - "A knowingly-red test parked outside the suite glob moves INTO it in the same plan that fixes the defect, with its assertions kept verbatim and only its header rewritten"
  - "New eval test files are registered in .github/workflows/ci.yml by explicit FILE path in the same task that creates them"

requirements-completed: []

coverage:
  - id: D1
    description: "extractSystemInit pins ccVersion from a REAL on-disk system/init event via claude_code_version, with event.version retained as a fallback (D-11 / security T-22-06 / validation gap B1)"
    requirement: ENV-02
    verification:
      - kind: unit
        ref: "eval/lz-eval-baseline-manifest.test.mjs#D-11: extractSystemInit pins ccVersion from the REAL on-disk lz q1 capture (claude_code_version)"
        status: pass
      - kind: unit
        ref: "eval/lz-eval-baseline-manifest.test.mjs#D-11: extractSystemInit PREFERS claude_code_version when an event carries both fields"
        status: pass
      - kind: unit
        ref: "eval/lz-eval-baseline-manifest-defects.test.mjs#DEFECT 1 -- extractSystemInit pins the CC version from a REAL system/init event (claude_code_version)"
        status: pass
      - kind: other
        ref: "discrimination proof: fix reverted to version-only -> 3 of 31 fail; restored -> 31/31 (output recorded verbatim in this SUMMARY)"
        status: pass
    human_judgment: false
  - id: D2
    description: "D-22 resolved: extractTerminalCost reads the LAST type=result event's total_cost_usd, and aggregateRunCost sums it over a caller-enumerated stream list, order-independently and fail-closed"
    requirement: ENV-02
    verification:
      - kind: unit
        ref: "eval/lz-eval-baseline-manifest.test.mjs#D-22: extractTerminalCost reads the LAST result event of the real built-in q1 cold stream (48.5367785, NOT 0.7800860000000001)"
        status: pass
      - kind: unit
        ref: "eval/lz-eval-baseline-manifest.test.mjs#T-23-12: aggregateRunCost sums the CALLER-ENUMERATED lz q1 stream list (cold + resume = 18.1152213)"
        status: pass
      - kind: unit
        ref: "eval/lz-eval-baseline-manifest.test.mjs#T-23-12: aggregateRunCost is order-independent -- a shuffled stream list yields the identical total"
        status: pass
      - kind: unit
        ref: "eval/lz-eval-baseline-manifest.test.mjs#D-22: extractTerminalCost throws when the terminal result event has no finite total_cost_usd (no default is substituted)"
        status: pass
    human_judgment: false
  - id: D3
    description: "validateManifest rejects a zero-byte report.md with 'report' in the message, closing Phase-22 validation defect B2 / security flag F4, without over-rejecting a non-empty one"
    requirement: ENV-02
    verification:
      - kind: unit
        ref: "eval/lz-eval-baseline-manifest.test.mjs#B2/F4: validateManifest REJECTS a zero-byte report.md with \"report\" in the message (the driver gate is \"non-empty report\")"
        status: pass
      - kind: unit
        ref: "eval/lz-eval-baseline-manifest.test.mjs#B2/F4 control: a NON-empty report.md still validates -- the size guard must not over-reject"
        status: pass
      - kind: unit
        ref: "eval/lz-eval-baseline-manifest-defects.test.mjs#DEFECT 2 -- validateManifest rejects a zero-byte report.md (driver: \"non-empty report\")"
        status: pass
      - kind: other
        ref: "discrimination proof: guard removed -> exactly 1 of 28 fails; restored -> 28/28 (output recorded verbatim in this SUMMARY)"
        status: pass
    human_judgment: false
  - id: D4
    description: "Both q1 captures are admissible: two validateManifest-passing MANIFEST files on disk, each recording its cost enumeration, its exclusions with reasons, and its resume history"
    requirement: ENV-02
    verification:
      - kind: integration
        ref: "node eval/lz-eval-baseline-manifest.mjs eval/.cache/p22-baseline/lz/qB1-run1.MANIFEST.json (exit 0, model=claude-sonnet-4-6[1m] ccVersion=2.1.186)"
        status: pass
      - kind: integration
        ref: "node eval/lz-eval-baseline-manifest.mjs eval/.cache/p22-baseline/builtin/qB1-run1.MANIFEST.json (exit 0, model=claude-opus-4-8 ccVersion=2.1.186)"
        status: pass
      - kind: unit
        ref: "eval/lz-eval-baseline-manifest.test.mjs#T-23-12: the built-in q1 cost is the sum over exactly THREE enumerated streams (67.085261) and EXCLUDES the different-session broad-partial stream"
        status: pass
    human_judgment: true
    rationale: "The MANIFEST files live in the gitignored eval/.cache/ tree, so CI cannot re-derive them and the assertions above degrade to skips on a fresh clone. Admissibility as an EVAL-INPUT claim also depends on the maintainer accepting the recorded exclusions (the different-session broad-partial stream) as correct -- a provenance judgment no test can make."
  - id: D5
    description: "canonicalizeCitation collapses the built-in's bare arXiv identifiers and lz's inline URLs to one identifier, with frozen ARXIV_RE / DOI_RE / KEEP_PARAMS and a reported raw: fallback (D-13 / ENV-04 first slice)"
    verification:
      - kind: unit
        ref: "eval/lz-eval-p23-citation-audit.test.mjs#D-13: the three surface forms of the same arXiv paper collapse to ONE identifier (arxiv:2306.15595)"
        status: pass
      - kind: unit
        ref: "eval/lz-eval-p23-citation-audit.test.mjs#D-13: query filtering is allowlist-inversion -- non-allowlisted params drop, allowlisted ones stay sorted"
        status: pass
      - kind: unit
        ref: "eval/lz-eval-p23-citation-audit.test.mjs#D-13: an unparseable token lands in the raw: bucket -- REPORTED, never dropped"
        status: pass
      - kind: unit
        ref: "eval/lz-eval-p23-citation-audit.test.mjs#ENV-04: the frozen normalization constants are exported and KEEP_PARAMS is Object.frozen (anti-drift)"
        status: pass
    human_judgment: false
  - id: D6
    description: "The Phase-22 defect proofs promoted into the eval/*.test.mjs suite glob, and three test files registered in CI by explicit FILE path"
    verification:
      - kind: unit
        ref: "node --test eval/lz-eval-baseline-manifest.test.mjs eval/lz-eval-baseline-manifest-defects.test.mjs eval/lz-eval-p23-citation-audit.test.mjs (41/41 pass, exit 0)"
        status: pass
      - kind: automated_ui
        ref: "node -e ci.yml non-comment-line registration check for all three files (exit 0)"
        status: pass
      - kind: other
        ref: "git show --stat --find-renames HEAD reports the known-defects file as a rename; eval/__known-defects__/ no longer exists"
        status: pass
    human_judgment: false

duration: 22 min
completed: 2026-09-07
status: complete
---

# Phase 23 Plan 01: ENV-02 Stage 0 and the phase tracer Summary

**Both q1 captures are now admissible: a real `system/init` pins CC 2.1.186 via `claude_code_version`, the per-run cost is recovered from each stream's terminal `result` event under a caller-owned enumeration (lz 18.1152213, built-in 67.085261 over three streams), a zero-byte report can no longer validate, and the frozen arXiv/DOI/URL canonicalizer makes the two systems' citation formats comparable.**

## Performance

- **Duration:** 22 min (measured from the first task commit to close; roughly 10 further minutes of required reading and zero-spend data probing preceded it)
- **Started:** 2026-09-07T11:25:40Z (first task commit)
- **Completed:** 2026-09-07T11:36:00Z
- **Tasks:** 3 of 3
- **Files modified:** 6 tracked (3 created, 3 modified) + 2 gitignored MANIFEST files written
- **Spend:** ZERO. No model call, no network request, no capture. Every figure was read off stream metadata already on disk.

## Accomplishments

- **D-11 fixed, and the phase's whole reading path proven end-to-end on one real capture.** `extractSystemInit` now reads `event.claude_code_version` with `event.version` as a fallback. Before the fix the ContractError at that guard fired on **every** real capture, so no MANIFEST could ever be produced -- the mechanical cause of security T-22-06 and validation gap B1.
- **D-22 RESOLVED and named on the artifact, not deferred.** The per-run cost source is the **LAST** `type=result` event's `total_cost_usd`. `extractTerminalCost` implements the LAST-wins rule and `aggregateRunCost` sums it over a caller-supplied stream list.
- **Phase-22 validation defect B2 / security flag F4 closed.** `validateManifest` was `existsSync`-only, so a background-truncated capture that wrote a zero-byte `report.md` validated as complete.
- **Both q1 captures are admissible**, each MANIFEST recording its cost enumeration, its exclusions with reasons, and its resume history.
- **The ENV-04 canonicalizer is frozen and green** -- the one rule that makes the two report formats comparable at all.
- **The Phase-22 defect proofs are now a standing regression guard inside the suite glob**, and three eval test files run in CI that did not before.

## Task Commits

Each task was committed atomically; Tasks 1 and 2 are TDD and carry a RED then a GREEN commit.

1. **Task 1 (tracer, tdd): one q1 capture becomes admissible, costed and canonicalizable**
   - `bdf9e7f` — `test(23-01)`: RED. Both files fail to load (missing exports / missing module).
   - `0d7eb17` — `feat(23-01)`: GREEN. The `claude_code_version` fix, `extractTerminalCost`, `aggregateRunCost`, and the new `eval/lz-eval-p23-citation-audit.mjs`. 31/31.
2. **Task 2 (tdd): close defect B2 and make the built-in capture admissible under an enumerated cost rule**
   - `6883829` — `test(23-01)`: RED. Exactly 3 of 28 fail; the paired controls already pass.
   - `9a4a278` — `fix(23-01)`: GREEN. The non-empty-report size guard plus the three provenance fields. 28/28.
3. **Task 3: promote the defect proofs into the suite and register every changed test file in CI**
   - `2587a2a` — `chore(23-01)`: the `git mv`, the rewritten header, and the three CI entries. 41/41.

## Files Created/Modified

- `eval/lz-eval-baseline-manifest.mjs` — the `claude_code_version` fix; new exports `extractTerminalCost` and `aggregateRunCost`; the zero-byte report guard; three optional cost-provenance fields threaded through `buildManifest`.
- `eval/lz-eval-baseline-manifest.test.mjs` — 17 new cases on top of the pre-existing 11 (28 total), all cache reads skip-if-absent.
- `eval/lz-eval-p23-citation-audit.mjs` — **new.** `ARXIV_RE`, `DOI_RE`, frozen `KEEP_PARAMS`, `canonicalizeCitation`. ASCII-only, LF, no BOM, no package added, no CLI (Plan 23-03 adds the rest of the audit surface).
- `eval/lz-eval-p23-citation-audit.test.mjs` — **new.** 9 cases.
- `eval/lz-eval-baseline-manifest-defects.test.mjs` — **moved** from `eval/__known-defects__/p22-baseline-manifest-defects.test.mjs` via `git mv`. Header rewritten; every assertion, message and skip-if-absent guard kept verbatim. `eval/__known-defects__/` no longer exists.
- `.github/workflows/ci.yml` — three explicit test-file entries appended to the eval-tree step.
- `eval/.cache/p22-baseline/{lz,builtin}/qB1-run1.MANIFEST.json` — **new**, gitignored, regenerable (recipe below).

## The two discrimination proofs, with their observed failure output

The plan requires both proofs be RUN and their failure output recorded. A test that only passes on fixed code proves nothing about the bug it claims to guard.

### Proof 1 (Task 1) -- the `ccVersion` field fix

The `event.claude_code_version` branch was temporarily removed so the assignment read only `event.version`, then the two Task-1 test files were re-run.

**Result: 28 pass / 3 fail.** The three failures are exactly the real-capture-dependent cases; all 11 pre-existing cases stayed green, because the synthetic fixture at `streamWithInit()` uses `version` and is carried by the retained fallback.

```
✖ D-11: extractSystemInit pins ccVersion from the REAL on-disk lz q1 capture (claude_code_version) (4.3261ms)
✖ D-11: extractSystemInit PREFERS claude_code_version when an event carries both fields (0.9222ms)
✔ D-11: extractSystemInit still throws with "CC version" when NEITHER field is present (0.1271ms)
✖ ENV-02: the lz q1 MANIFEST built from the REAL capture validates (pinned, costed, report present) (9.0103ms)
ℹ tests 31
ℹ pass 28
ℹ fail 3
```

The two named error bodies, verbatim:

```
test at eval\lz-eval-baseline-manifest.test.mjs:319:1
✖ D-11: extractSystemInit PREFERS claude_code_version when an event carries both fields (0.9572ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
  + actual - expected

  + '2.1.185'
  - '2.1.186'
           ^

    generatedMessage: true,
    code: 'ERR_ASSERTION',
    actual: '2.1.185',
    expected: '2.1.186',
    operator: 'strictEqual',
    diff: 'simple'
  }

test at eval\lz-eval-baseline-manifest.test.mjs:423:1
✖ ENV-02: the lz q1 MANIFEST built from the REAL capture validates (pinned, costed, report present) (11.6579ms)
  Error [ContractError]: system/init event has no CC version -- the run cannot be pinned (D-15/D-16)
      at extractSystemInit (file:///D:/projects/github/LayZeeDK/lz-advisor-claude-plugins/eval/lz-eval-baseline-manifest.mjs:104:15)
      at TestContext.<anonymous> (file:///D:/projects/github/LayZeeDK/lz-advisor-claude-plugins/eval/lz-eval-baseline-manifest.test.mjs:431:13)
    file: 'extractSystemInit'
```

That `ContractError` is the Phase-22 failure reproduced exactly: it is why zero MANIFEST files existed on disk.

**Fix restored, re-run: `ℹ tests 31 / ℹ pass 31 / ℹ fail 0`, exit 0.**

### Proof 2 (Task 2) -- the non-empty-report guard

The `fs.statSync(...).size === 0` guard was temporarily removed, leaving the `existsSync`-only check, then `eval/lz-eval-baseline-manifest.test.mjs` was re-run.

**Result: 27 pass / 1 fail.** Exactly the zero-byte case fails. All three paired controls (non-empty validates, single-byte validates, the absent-path and non-existent-file messages) and all 11 pre-existing cases stayed green -- which is what proves the guard is narrow and does not over-reject.

```
✖ failing tests:

test at eval\lz-eval-baseline-manifest.test.mjs:475:1
✖ B2/F4: validateManifest REJECTS a zero-byte report.md with "report" in the message (the driver gate is "non-empty report") (2.2456ms)
  AssertionError [ERR_ASSERTION]: Missing expected exception (ContractError).
      at file:///D:/projects/github/LayZeeDK/lz-advisor-claude-plugins/eval/lz-eval-baseline-manifest.test.mjs:477:12
      at withReportOfSize (file:///D:/projects/github/LayZeeDK/lz-advisor-claude-plugins/eval/lz-eval-baseline-manifest.test.mjs:457:12)
      at TestContext.<anonymous> (file:///D:/projects/github/LayZeeDK/lz-advisor-claude-plugins/eval/lz-eval-baseline-manifest.test.mjs:476:3)
    generatedMessage: false,

ℹ tests 28
ℹ pass 27
ℹ fail 1
```

"Missing expected exception" is the defect stated plainly: a zero-byte report validated silently.

**Guard restored, re-run: `ℹ tests 28 / ℹ pass 28 / ℹ fail 0`, exit 0.**

## D-22 RESOLVED: the per-run cost source, with every figure and its retry history

**The source is the LAST `type=result` event of each capture stream, read from its `total_cost_usd`.** `aggregateRunCost` sums that over a stream list the **caller** enumerates; it never globs a directory. All figures below were read from disk by `extractTerminalCost`, never transcribed.

### lz q1 -- `costUsd` 18.1152213, `resumeCycles` 1

| Stream | Role | Terminal cost | `is_error` | Note |
|---|---|---|---|---|
| `qB1-run1.stream.jsonl` | cold run | 8.927337350000004 | **true** | Stage 2 incomplete at the window wall; `is_error` true on the rate/pool limit. |
| `qB1-run1.resume.stream.jsonl` | designed-in slug-match resume (auto-detected by the skill) | 9.187883949999998 | false | Completed the run; `run_state.json {stage2_complete:true}`. |

The cold stream carries two `result` events. The first, 7.6122105, belongs to a **different `session_id`** (`4fce2c41-...`) than the stream's own init (`8183574c-...`); the LAST-wins rule takes 8.927337350000004 and the discrepancy is noted here rather than reconciled.

### built-in q1 -- `costUsd` 67.085261, `resumeCycles` 3

| Stream | Role | Terminal cost | `is_error` | Note |
|---|---|---|---|---|
| `qB1-run1.stream.jsonl` | cold run | 48.5367785 | **true** | `is_error` true on the pool limit, hit mid-verify (5 of 25 claims verified). Carries **two** `result` events; the first reports 0.7800860000000001. |
| `qB1-run1.resume2.stream.jsonl` | report-recovery resume | 0.9598505 | false | Synthesized the partial-verify report from the prior output file; no re-fetch. |
| `qB1-run1.resume3.stream.jsonl` | verifier-completion resume | 17.588632000000008 | false | Ran the missing verifier panels to 25/25; no re-fetch. Also carries two `result` events (first 2.05047675). |

**Recorded exclusions** (on the MANIFEST, with reasons):

| Excluded stream | Terminal cost | Reason |
|---|---|---|
| `qB1-run1.resume.stream.jsonl` | none | Zero bytes -- the bare `--resume` errored before emitting anything, so it carries no `result` event at all. |
| `qB1-run1.broad-partial-2026-06-22.stream.jsonl` | 47.081383 | **Different `session_id`** (`8c54db7e-...`) from an earlier BROAD attempt on 2026-06-22, not part of the narrow q1 chain (`6e92b80e-...`). Folding it in would produce **114.166644**, roughly doubling the figure. A test asserts the total is not that. |

### The retry history travels with the number (ENV-02 transparency prohibition, honored)

Both MANIFESTs carry a `retryHistoryNote`. **These figures MUST NOT be presented as a clean per-run cost comparison between the two systems.** The built-in figure is retry-inflated across three resume cycles plus an earlier billing-limit failure; the lz figure spans a cold run plus one resume across two reset windows. Both cold runs terminated with `is_error: true`. Any appearance of "~$18 vs ~$67" without that history attached breaks the prohibition this plan is bound by.

## Decisions Made

1. **D-22 resolved as the terminal `result` event, with the enumeration owned by the caller.** The alternative -- letting the module discover a run's streams -- was rejected: the built-in q1 directory contains a different-session stream whose accidental inclusion would nearly double the published figure. That is T-23-12 (repudiation) made concrete, so the list comes from the caller and lands on the artifact.
2. **Figures are read from disk, never transcribed.** For this particular sum the transcribed and stored doubles happen to agree, but reading removes the question permanently.
3. **The zero-byte threshold is exactly zero.** A content heuristic ("looks too short") would be a second, unpre-registered quality gate. A one-byte report validates and a test asserts it.
4. **The lz MANIFEST was regenerated in Task 2** so both captures carry provenance through one write path. See deviation 2.
5. **No `requirements-completed` claim.** ENV-02's admissibility gate closes only when the q2 pair is also manifested in Plan 23-06, so the field is `[]`. Phase 22's lesson -- one stale `requirements-completed:` line silently closing an unsatisfied requirement -- applies directly here, and the mechanical half being done is not the requirement being met.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] The plan's expected lz model value is factually wrong**

- **Found during:** Task 1
- **Issue:** The plan's `<behavior>` states `extractSystemInit on the real on-disk lz q1 stream returns ccVersion "2.1.186" and model "claude-opus-4-8"`. The real lz capture pins **`claude-sonnet-4-6[1m]`**. `claude-opus-4-8` is the **built-in** capture's model. Asserting the plan's value would have failed against ground truth.
- **Fix:** The test asserts the real value with a comment explaining why it is right (the lz surface runs the Sonnet executor by design -- that IS the advisor strategy). The plan's acceptance criterion for this task only requires the CLI print `model=` and `ccVersion=2.1.186`, both satisfied, so no criterion was weakened.
- **Files modified:** `eval/lz-eval-baseline-manifest.test.mjs`
- **Verification:** `node eval/lz-eval-baseline-manifest.mjs eval/.cache/p22-baseline/lz/qB1-run1.MANIFEST.json` prints `model=claude-sonnet-4-6[1m] ccVersion=2.1.186`, exit 0.
- **Committed in:** `bdf9e7f` / `0d7eb17`

**2. [Rule 2 - Missing Critical] `costStreamsExcluded` and `resumeCycles` threaded through `buildManifest`, and the lz MANIFEST regenerated with provenance**

- **Found during:** Task 2
- **Issue:** The plan says to add **`costStreams`** to `buildManifest` and to record the exclusions and `resumeCycles` "alongside". With only `costStreams` threaded, the other two could reach the artifact only by post-hoc mutation of the returned object -- two write paths for one record. Separately, the lz MANIFEST is written in Task 1, **before** `costStreams` exists, so it would have shipped with its enumeration implicit. That is precisely the T-23-12 threat the field exists to mitigate, left open on one of the two captures.
- **Fix:** All three fields (`costStreams`, `costStreamsExcluded`, `resumeCycles`) are optional parameters threaded through `buildManifest` and recorded only when supplied, so the pre-existing 8-field shape is byte-identical for every existing caller (a test asserts this). The lz MANIFEST was then regenerated in Task 2 through the same path, so **both** captures record their enumeration.
- **Files modified:** `eval/lz-eval-baseline-manifest.mjs`, `eval/lz-eval-baseline-manifest.test.mjs`, both MANIFEST files
- **Verification:** `T-23-12: buildManifest threads costStreams / resumeCycles through, and omits them when the caller supplies none` passes; both MANIFESTs validate through the CLI at exit 0.
- **Committed in:** `9a4a278`

**3. [Rule 3 - Blocking] A `git add` that silently staged nothing, caught before it became a broken commit**

- **Found during:** Task 3
- **Issue:** After `git mv`, `git add <old-path> <new-path> <ci.yml>` exited non-zero because the old path no longer matches any pathspec -- and `git add` stages **nothing** when any pathspec fails. The commit therefore captured only the bare rename already staged by `git mv`: the rewritten header and all three CI entries were left in the working tree. `git log` showed a clean subject, so nothing about the commit looked wrong.
- **Fix:** Detected via `git show --stat --find-renames` reporting `1 file changed, 0 insertions(+), 0 deletions(-)` for a commit that should have carried ~46 insertions. Re-staged both real paths and `--amend`ed (local, unpushed) so Task 3 remains one atomic commit as the plan requires.
- **Files modified:** none beyond the intended Task 3 set
- **Verification:** `git show --stat --find-renames HEAD` now reports the rename plus `.github/workflows/ci.yml`, 46 insertions / 22 deletions; working tree clean.
- **Committed in:** `2587a2a` (amended)

### Recorded, not silently taken: the tracer feedback gate

The tracer gate's interactive branch would have stopped after Task 1 for a human `checkpoint:human-verify`. `workflow.auto_advance` and `workflow._auto_chain_active` are both `false`, but `mode` is `yolo` and this plan is `autonomous: true`, and the tracer's entire `<verify>` is two automated commands with no human-judgment component. The gate was therefore run as the autonomous branch: both `<verify>` commands were **re-run end-to-end after the Task 1 commit and before any Task 2 work** (`31/31`, exit 0; CLI exit 0), and expansion proceeded only on that pass. **This is a gate-semantics resolution, not a scope reduction, and it is recorded here rather than carried silently** -- per the blocking anti-pattern, a deferral is not a ratification. Had the tracer verify failed, the rule is HALT before expansion, and it would have been honored.

### Deliberate scope boundary (not a stub)

`eval/lz-eval-p23-citation-audit.mjs` ships **only** `ARXIV_RE`, `DOI_RE`, `KEEP_PARAMS` and `canonicalizeCitation`, and has no CLI. This is the plan's design: the rest of the ENV-04 surface (`extractCitationTokens`, `normalizeForQuoteMatch`, `quoteMatches`, `countUncitedUnits`, `auditReport`, the CLI) lands in Plan 23-03. What is here is production-quality and complete for what it covers -- no placeholder values, no hardcoded empties, no unwired path. **Known stubs: none.**

---

**Total deviations:** 3 auto-fixed (1 bug, 1 missing critical, 1 blocking) + 1 recorded gate-semantics resolution.
**Impact on plan:** No scope creep and no criterion weakened. Deviation 1 corrects a factual error in the plan against ground truth on disk; deviation 2 extends the T-23-12 mitigation to the capture the task split would have left uncovered; deviation 3 prevented a commit that looked clean and carried nothing.

## Issues Encountered

- **Non-ASCII characters could not be round-tripped through the Edit tool.** A first draft of the citation-audit co-test carried literal accented characters and a ligature in an NFC/NFKC test; the Edit tool's match failed on both the literal and escaped forms. Resolved by rewriting the file via Write with strictly ASCII content and **dropping** that test: the ligature assertion would in fact have been wrong, because `new URL` applies UTS-46 IDNA mapping to the hostname and folds `U+FB01` to `fi` on its own. `normalize('NFC')` remains in the module per the plan; the rule is frozen in the pre-registration, and Plan 23-03 will exercise it where it actually bears weight (verbatim quote matching).
- **No config or STATE drift during task execution.** No `gsd-tools` `phase.*` / `state.*` / `query` mutator verb was invoked while the three tasks ran -- `.planning/config.json` was read with the Read tool instead of `query config-get`. `git diff .planning/config.json .planning/STATE.md` was **empty** before every task commit and before the SUMMARY commit.
- **The SDK drift then fired at close-out, exactly as the phase handoff predicted.** `query state.update-progress` **DELETED `branching_strategy` from `.planning/config.json`** while accomplishing nothing at all -- it returned `{"updated": false, "reason": "Progress field not found in STATE.md"}`. The deletion was caught by the prescribed post-call diff and reverted with `git checkout -- .planning/config.json` **before staging**; `config.json` is byte-identical to HEAD at `ca68059`. `query roadmap.update-plan-progress 23` was clean (both file hashes unchanged) and correctly ticked the 23-01 wave entry. Because `state.update-progress` is a no-op on this STATE.md format, later plans in this phase should skip it and edit the `progress:` block directly -- it carries the drift risk with none of the benefit. The `progress:` numbers here were updated by hand.

## Regenerating the MANIFEST files

`eval/.cache/` is gitignored, so the two MANIFESTs are not in version control. They are fully regenerable from the streams already on disk, at zero spend, by composing the module's own exports: `extractSystemInit(coldStreamText)` for the pin, `aggregateRunCost({ streamTexts })` over the enumerated streams for `costUsd`, `extractTerminalCost` per stream for the `costStreams` entries, then `buildManifest({ ..., costStreams, costStreamsExcluded, resumeCycles })` and `validateManifest`. The exact enumerations, exclusions and per-stream figures are the tables above, and the test
`T-23-12: the built-in q1 cost is the sum over exactly THREE enumerated streams` re-derives the built-in total from disk on every run.

## User Setup Required

None - no external service configuration required.

## Review record (project MUST: scripts reviewed before they drive an LLM task or are published)

This plan's outputs are **eval-tree scripts** -- they neither drive an LLM task nor ship in `plugins/lz-advisor/`. `node --test eval/lz-eval-packaging-boundary.test.mjs` passes (2/2), confirming nothing was added under the plugin tree and the one-directional `eval -> runtime` import boundary is intact. Both new/changed modules were re-read after writing for the project's control-flow style (braces on every body, blank lines around control flow and returns), the `ContractError` message convention (plain-English cause, then the offending value via `JSON.stringify`, then the governing decision id, with the function name as the second argument), and ASCII/LF/no-BOM. `eval/lz-eval-p23-citation-audit.mjs` was byte-verified: 7673 bytes, zero bytes >= 128, no BOM, no CR, exactly one import.

## Next Phase Readiness

**Ready for Plan 23-02** (Slice-A draw + dispatch provenance, zero spend). Wave 1 is complete.

Carried forward, for the plans that consume this:

- **`requirements-completed` is deliberately empty.** ENV-02 stays OPEN. Plan 23-06 must manifest the q2 pair before ENV-02 can be claimed.
- **Plan 23-04 (the ENV-01 freeze) must record three things from this plan:** (i) that the per-run cost source is the terminal `result` event's `total_cost_usd` under a caller-owned enumeration; (ii) the built-in q1 exclusion of the different-session broad-partial stream and its 47.081383, since a later reader will find that file in the same directory; (iii) that both cold runs ended `is_error: true` and the cost figures are retry-inflated, so the prohibition on presenting them as a clean comparison is frozen alongside the numbers.
- **Plan 23-03 inherits a frozen canonicalizer**, and should pin `ARXIV_RE` / `DOI_RE` / `KEEP_PARAMS` from `eval/lz-eval-p23-citation-audit.mjs` in the prereg anti-drift test rather than restating their values.
- **One unreconciled observation for the record, not reconciled here:** the lz q1 cold stream's *first* `result` event carries a different `session_id` (`4fce2c41-...`) than the stream's own `system/init` (`8183574c-...`). LAST-wins makes this immaterial to the cost figure, but a reader auditing session identity across that stream will meet it. Recorded rather than silently reconciled, in the same spirit as D-10 and D-21.
- **The gitignored caches remain irreplaceable.** No `git clean` was run and nothing under `eval/.cache/` or `.lz-research/` was deleted or truncated; the MANIFEST writes were purely additive into the existing run directories.

## Self-Check: PASSED

- `eval/lz-eval-p23-citation-audit.mjs` — FOUND
- `eval/lz-eval-p23-citation-audit.test.mjs` — FOUND
- `eval/lz-eval-baseline-manifest-defects.test.mjs` — FOUND
- `eval/__known-defects__/` — CONFIRMED ABSENT
- `eval/.cache/p22-baseline/lz/qB1-run1.MANIFEST.json` — FOUND, validates (exit 0)
- `eval/.cache/p22-baseline/builtin/qB1-run1.MANIFEST.json` — FOUND, validates (exit 0)
- Commits `bdf9e7f`, `0d7eb17`, `6883829`, `9a4a278`, `2587a2a` — all FOUND in `git log`
- Plan `<verification>`: three-file gate 41/41 exit 0; `eval/lz-eval-packaging-boundary.test.mjs` 2/2 exit 0; both MANIFESTs validate through the CLI; both discrimination proofs run and recorded verbatim above; `git diff .planning/config.json .planning/STATE.md` empty before staging
- All task `<acceptance_criteria>` re-run and passing, including the four pre-existing CI entries still present and the eval step still carrying no `--test-coverage-*` flag

---
*Phase: 23-judge-free-confidence-and-operating-envelope-for-lz-deep-res*
*Completed: 2026-09-07*
