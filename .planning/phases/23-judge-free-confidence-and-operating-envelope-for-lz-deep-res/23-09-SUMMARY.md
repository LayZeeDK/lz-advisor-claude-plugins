---
phase: 23-judge-free-confidence-and-operating-envelope-for-lz-deep-res
plan: 09
subsystem: testing
tags: [operating-envelope, pre-registration, termination-clause, review-gate, git-ancestry, env-07, env-08]

requires:
  - phase: 23-judge-free-confidence-and-operating-envelope-for-lz-deep-res
    provides: "the frozen pre-registration (23-04), the Slice-A read (23-05), the ENV-05 spike and the q2 pair (23-06), the ENV-04 q2 reading of reference (23-07), the ENV-06 branch-(b) termination (23-08)"
provides:
  - "23-ENVELOPE.md -- the phase's public artifact: evidenced region, human-routed region, warnings, the NOT ESTABLISHED table, and exactly one resolved termination branch"
  - "The phase-level termination: branch (a) MEASURED, with ENV-06 held separately on branch (b)"
  - "The ENV-08 review sweep: 15 rows, 6 named gaps, no silent pass"
  - "The D-16 ordering proof from git ancestry alone: 14 of 14 spending commits, plus a negative control"
  - "A measured ENV-08 ordering failure: two module review records postdate their first-use commit"
  - "The corrected ENV-05 / ENV-06 dispositions in REQUIREMENTS.md"
affects: [gsd-audit-milestone, gsd-verify-work, gsd-secure-phase, gsd-validate-phase, gsd-ship, v2.1.0-release]

actuals:
  tokens: 12000
  tasks: 3
  commits: 4

tech-stack:
  added: []
  patterns:
    - "The operating-envelope document on the Model Facts skeleton: one machine-readable `Resolved branch:` line the structural check reads, so the Termination section stays free to discuss the branches it did NOT resolve on"
    - "Review-before-use checked as GIT ANCESTRY against each artifact's first-use commit, not as a timestamp comparison -- same-commit counts, later-than-first-use does not"
    - "A review sweep whose row count is reconciled against the plan's own artifact list, so an omitted row is detectable"

key-files:
  created:
    - .planning/phases/23-judge-free-confidence-and-operating-envelope-for-lz-deep-res/23-ENVELOPE.md
  modified:
    - .planning/WINDOWS.md
    - .planning/REQUIREMENTS.md

key-decisions:
  - "The phase resolves on branch (a) MEASURED at the phase level, because three pre-registered sources produced their planned readings -- and that resolution UPGRADES NOTHING: ENV-06 stays branch (b) and the built-in q2 report stays an absence, both in their own section with their letters"
  - "The envelope exceeds the plan's one-page target and the overshoot is recorded as a deviation, because the alternative was dropping a mandated disclosure or claiming one page for a four-page document"
  - "The ENV-08 gate CLOSES PARTIALLY and says so: the mechanical halves are verified, and six content reviews are NAMED GAPS in the sweep table and in the windows ledger rather than closed by the executing session"
  - "The Slice-A voter seat's resolved model string is recorded as a NAMED GAP -- the Agent tool exposed only the alias `sonnet`, and inventing a resolved string would falsify capture provenance"
  - "REQUIREMENTS.md was hand-edited, never through `requirements.mark-complete`, because SDK mutators have dropped `branching_strategy` from config.json repeatedly in this phase"

patterns-established:
  - "A termination branch letter travels on a machine-readable status line so the milestone audit can tell (b) from (c) without interpreting prose"
  - "A structural presence check is labelled a presence check wherever it is reported, and never as covering the human read it sits beside"

requirements-completed: [ENV-07, ENV-08]

coverage:
  - id: D1
    description: "23-ENVELOPE.md is published, structurally complete across eight sections, and resolves exactly one pre-registered termination branch with its evidence"
    requirement: "ENV-07"
    verification:
      - kind: other
        ref: "the eight-section + one-branch node check -> '[OK] eight sections non-empty; resolved branch = MEASURED', exit 0"
        status: pass
      - kind: other
        ref: "bidirectional discrimination proof: a second `Resolved branch:` line -> 'Error: expected exactly one Resolved branch: line, found 2' exit 1; a name outside the three -> 'Error: resolved branch is not one of the three pre-registered names: \"PROBABLY-FINE\"' exit 1; restored -> exit 0 both times"
        status: pass
      - kind: other
        ref: "rg -q -F -e '0.0625' -e '0.549' 23-ENVELOPE.md -> exit 0"
        status: pass
    human_judgment: true
    rationale: "The structural half is proven above and only the structural half. Whether the envelope is USEFUL rather than boilerplate -- whether its warnings are specific and falsifiable rather than generic -- is a maintainer read against the four prior-art skeletons in 23-RESEARCH Pattern 6, which this phase's validation strategy records as human judgement. That read is OWED and is recorded as windows defect id 6. This plan's own flagged planner assumption says the same thing: ENV-07's probe edge was deliberately NOT discharged."
  - id: D2
    description: "The D-16 freeze-precedes-every-spend constraint is proven from git ancestry rather than asserted"
    requirement: "ENV-01"
    verification:
      - kind: other
        ref: "git merge-base --is-ancestor 9ab993319da0fc3a10ae0cba45f10cb19576b93a <commit> -> 0 for all 14 spending commits; NOT-ANCESTOR for the pre-freeze control 3189239"
        status: pass
    human_judgment: false
  - id: D3
    description: "The ENV-08 mechanical halves: the packaging boundary holds, nothing new exists under the plugin tree, the offline audit is network-free with the global fetch stubbed to throw, the eval package manifest is unchanged, and Phase 22 was not re-opened"
    requirement: "ENV-08"
    verification:
      - kind: unit
        ref: "eval/lz-eval-packaging-boundary.test.mjs -> exit 0; git status --porcelain plugins/ -> empty"
        status: pass
      - kind: unit
        ref: "eval/lz-eval-p23-citation-audit.test.mjs#'ENV-04: the whole offline audit runs with the global fetch stubbed to throw (network-free proof)' -> pass"
        status: pass
      - kind: other
        ref: "the Phase-22-untouched check over lz-eval-parity-prereg.md, the diagnosis note, 22-05-PLAN.md and eval/package.json -> '[OK] Phase 22 not re-opened; eval package manifest unchanged'"
        status: pass
    human_judgment: false
  - id: D4
    description: "The ENV-08 content-review halves for 15 Phase-23 artifacts, with every missing review named"
    requirement: "ENV-08"
    verification: []
    human_judgment: true
    rationale: "Six of the fifteen rows have had executing-session review only, which under the project's review-before-use-or-publication rule is not review for a published artifact. They are NAMED GAP rows in the sweep table below and rows 1-7 of .planning/WINDOWS.md. A presence check must never stand in for a content review, and this plan does not report one as doing so."
  - id: D5
    description: "The full explicit-file eval suite is green and every Phase-23 test file runs in CI"
    verification:
      - kind: unit
        ref: "node --test over 12 explicit FILE paths -> tests 213 / pass 213 / fail 0, exit 0"
        status: pass
      - kind: other
        ref: "the CI registration check over non-comment lines -> '[OK] all 8 Phase-23 test files registered in CI'"
        status: pass
    human_judgment: false
  - id: D6
    description: "The inverted ENV-05 / ENV-06 dispositions in REQUIREMENTS.md are corrected, each labelled with its termination branch"
    verification:
      - kind: other
        ref: "rg '^- \\[.\\] \\*\\*ENV-0[56]\\*\\*' -> both `[x]`; the traceability rows read Complete with branch (a) MEASURED and branch (b) NOT-ESTABLISHABLE-BY-METHOD respectively"
        status: pass
    human_judgment: false

duration: ~40 min
completed: 2026-09-08
status: complete
---

# Phase 23 Plan 09: Operating envelope, termination and review gate Summary

**`23-ENVELOPE.md` published on the Model Facts skeleton, resolving the phase on branch (a) MEASURED while holding ENV-06 on branch (b) in its own section; the ENV-08 sweep closes its mechanical halves and names six owed content reviews rather than passing them; and the D-16 freeze-before-spend constraint is proven from git ancestry over 14 commits with a negative control.**

## Performance

- **Duration:** ~40 min (approximate -- no dispatch-time start stamp was captured)
- **Completed:** 2026-09-08T10:19Z
- **Tasks:** 3
- **Files modified:** 3 (1 created, 2 modified)

## Accomplishments

- **The operating envelope is published** with all eight sections non-empty, the evidenced region and the not-established region strictly separate, and exactly one `Resolved branch:` line.
- **The termination is resolved and its strength is not overstated:** phase-level **(a) MEASURED**, with ENV-06 held at **(b)** and nothing at **(c)**.
- **The ENV-08 sweep is complete as a sweep:** 15 rows, reconciled against the plan's own artifact list, 6 NAMED GAP rows, zero silent passes.
- **A previously unmeasured ENV-08 ordering failure was found from git ancestry** and recorded rather than smoothed over.
- **The inverted ENV-05 / ENV-06 dispositions in REQUIREMENTS.md are corrected**, each now carrying its branch.

## Task Commits

1. **Task 1: author and publish the operating envelope** -- `18a4ef9` (docs)
2. **Task 2: the ENV-08 sweep -- windows ledger gap rows** -- `e8c383d` (docs)
3. **Task 2 (cont.): the REQUIREMENTS.md inversion fix** -- `e91b990` (fix)
4. **Task 3: the phase gate** -- no artifact of its own; its evidence is recorded below and its verification commands were run read-only.

## THE RESOLVED TERMINATION BRANCH, AND ITS EVIDENCE

**`Resolved branch: MEASURED`** -- branch **(a)**, one line, in `23-ENVELOPE.md`.

The clause requires that "at least one pre-registered confidence source produced its planned reading;
the phase publishes it with its stated limits." **Three did:**

| Requirement | Disposition | Evidence, per its own record |
|---|---|---|
| ENV-01 | MET | pre-registration frozen at `9ab993319da0fc3a10ae0cba45f10cb19576b93a`, 2026-09-07T23:37:33+02:00, exactly three files (verified: `git show --stat` reports 3 files changed, 1812 insertions) |
| ENV-02 | MET | lz q2 MANIFEST admissible (`model=claude-sonnet-5 ccVersion=2.1.263`); built-in q2 explicitly INADMISSIBLE with the module's own error string, filed as `q2-run1.MANIFEST.INADMISSIBLE.json` |
| ENV-03 | MET -- **branch (a)** | Slice A: gold `unrefuted` n=20 tp 18 / fn 2; gold `refuted` n=20 tn 20 / fp 0; n=40; `drawSeed` 20260907 |
| ENV-04 | **PARTIAL-Q2** | the lz q2 reading is the reading of reference; built-in q2 is an ABSENCE; both q1 rows carried separately as not-bar-setting dry runs |
| ENV-05 | **branch (a) MEASURED** | the spike ran at full metered cost and the frozen predicates returned its planned reading: did NOT clear, on COMPLETENESS and not on ceiling exhaustion |
| ENV-06 | **branch (b) NOT-ESTABLISHABLE-BY-METHOD** | the reference half does not exist; the capture ran twice at full cost and produced no report |
| ENV-07 | satisfied by this plan | the envelope is published with the evidenced region, the human-routed region and the not-established table |
| ENV-08 | **PARTIAL** -- closes its mechanical halves, names 6 content-review gaps | see the sweep table below |

**The resolution upgrades nothing.** ENV-06 remains branch (b) and the built-in q2 report remains an
absence; both sit in the envelope's `## NOT ESTABLISHED, and why` table with their letters. A
branch-(b) item may never read as a branch-(a) failure and a phase-level (a) does not convert one.
**Nothing in this phase is branch (c):** no method was descoped before spend, and AMENDMENT RECORD 1 is
a pre-dispatch instrument correction taken with zero verdicts in existence, not a descope.

**No significance claim is made anywhere, and none was reachable.** Restated with its arithmetic, as
stated in advance by the freeze rather than discovered: the two-sided sign-test minimum at n=5 paired
questions is `2 x 0.5^5 = 0.0625`, already above a conventional 0.05 threshold, and a perfect 5-for-5
sweep yields only a 95% Clopper-Pearson lower bound of `0.05^(1/5) = 0.549`. **Slice A's 2-versus-0
asymmetry is NOT significant and NOT established.** A phase ending without a significance claim has NOT
fallen short.

## The one-branch discrimination proof, all four outputs verbatim

A check that only passes on the correct document does not demonstrate it discriminates, so both wrong
directions were induced and observed:

```
### 1. BASELINE (correct document)
[OK] eight sections non-empty; resolved branch = MEASURED
exit=0

### 2. INJECT A SECOND 'Resolved branch:' LINE -- must FAIL
Error: expected exactly one Resolved branch: line, found 2
exit=1

### 3. REMOVE THE SECOND LINE -- must PASS again
[OK] eight sections non-empty; resolved branch = MEASURED
exit=0

### 4. SET THE BRANCH TO A NAME OUTSIDE THE THREE -- must FAIL
Error: resolved branch is not one of the three pre-registered names: "PROBABLY-FINE"
exit=1

### 5. RESTORE -- must PASS
[OK] eight sections non-empty; resolved branch = MEASURED
exit=0
```

The document was restored from a byte copy taken before the injections and `git status` confirmed it
matched what was committed. **The check reads that ONE line and not branch-name mentions in prose**,
because the Termination section legitimately discusses the branches it did not resolve on -- a
mention-counting check would fail on a correct document.

## THE ANCESTRY PROOF -- from git topology alone, never from timestamps

**Freeze SHA:** `9ab993319da0fc3a10ae0cba45f10cb19576b93a` (2026-09-07T23:37:33+02:00, exactly three
files). Command: `git merge-base --is-ancestor <freeze> <commit>`. Two commits can share a timestamp;
topology is what orders them.

```
ANCESTOR-OK 0b4e479  2026-09-08T00:08:24+02:00 amend(23-05): AMENDMENT RECORD 1 -- correct the voter transport row and label the dispatched cutoff
ANCESTOR-OK 599f4ed  2026-09-08T00:35:14+02:00 docs(23-05): publish the judge-free Slice-A per-direction read and complete ENV-03
ANCESTOR-OK c891cb2  2026-09-08T00:37:11+02:00 docs(23-05): record the Slice-A read in STATE and ROADMAP
ANCESTOR-OK 41b70f5  2026-09-08T02:45:14+02:00 docs(23-06): record the D-19 first observation before any q2 rate exists
ANCESTOR-OK 87ed59f  2026-09-08T10:56:15+02:00 docs(23-06): settle the ENV-05 spike -- not cleared, on completeness not ceiling
ANCESTOR-OK 7b34a08  2026-09-08T11:22:04+02:00 docs(23-06): capture the lz q2 pair half and close ENV-05 as MEASURED
ANCESTOR-OK 4b2eb14  2026-09-08T11:24:21+02:00 docs(23-06): record the ENV-05 spike outcome and lz q2 capture in STATE and ROADMAP
ANCESTOR-OK 3ada1b3  2026-09-08T11:35:57+02:00 docs(23-07): publish the ENV-04 q2 reading under PARTIAL-Q2, q1 carried separately
ANCESTOR-OK 14e6b35  2026-09-08T11:39:54+02:00 docs(23-07): complete the ENV-04 q2 citation audit plan
ANCESTOR-OK d0ba91d  2026-09-08T11:42:05+02:00 docs(23-07): record the published ENV-04 q2 reading in STATE and ROADMAP
ANCESTOR-OK b814f6f  2026-09-08T11:42:35+02:00 docs(23-07): record the published ENV-04 q2 reading in STATE
ANCESTOR-OK e8ecb5d  2026-09-08T11:56:24+02:00 docs(23-08): publish the ENV-06 branch-(b) termination, nothing graded
ANCESTOR-OK 093b826  2026-09-08T12:01:03+02:00 docs(23-08): complete the ENV-06 conditional-grading plan on branch (b)
ANCESTOR-OK a463be9  2026-09-08T12:03:05+02:00 docs(23-08): record the ENV-06 branch-(b) termination in STATE and ROADMAP
```

**14 of 14 pass.** Negative control, so the test is shown to be capable of failing:

```
$ git merge-base --is-ancestor 9ab9933 3189239   # the pre-freeze Wave-3 q1 dry-run commit
NOT-ANCESTOR (expected: the freeze does NOT precede a pre-freeze commit -- the test discriminates)
```

That pre-freeze rate is D-20, not a D-16 breach: no capture, vote or score preceded the freeze, and the
freeze QUOTES the dry-run figures, which is the reflection the exception is conditioned on.

## THE ENV-08 REVIEW SWEEP -- 15 rows, reconciled, 6 named gaps, no silent pass

**Row count reconciled against this plan's own "Artifacts this phase produces" section:** 6 scripts
(the modified `lz-eval-baseline-manifest.mjs` plus the five new p23 modules) + 9 prompts/references
(2 frozen documents, the frozen voter prompt template, the 5 committed records, the envelope) = **15**.
The 7 co-tests are named inside the script rows rather than given rows of their own, because the rule
attaches a co-test to the script it proves.

**Scripts -- code review AND code-reviewed unit tests. Ordering by git ancestry against first use.**

| Artifact | Review | Reviewer / date | Co-test + the discrimination proof it carries | Ordering (record vs first use) |
|---|---|---|---|---|
| `eval/lz-eval-baseline-manifest.mjs` (modified) | executing-session code review, recorded in 23-01-SUMMARY | executing session, 2026-09-07 | `lz-eval-baseline-manifest.test.mjs` + `lz-eval-baseline-manifest-defects.test.mjs`; proofs RUN: the `claude_code_version` fix reverted to version-only -> 3 of 31 fail; the zero-byte-report guard removed -> exactly 1 of 28 fails; restored -> green | rec `dca9c25` / use `dca9c25` -- **SAME-COMMIT, counts as before-use** |
| `eval/lz-eval-p23-citation-audit.mjs` | executing-session code review only | executing session, 2026-09-07 | `lz-eval-p23-citation-audit.test.mjs`; D-13/D-21 proof: the unique-source count is the identifier-set cardinality (18) and NOT the surface-marker count (69 total / 13 unique values) | rec `1bdb1ee` / use `3189239` -- **ORDERING-FAIL, see finding 2** |
| `eval/lz-eval-p23-resolvability.mjs` | executing-session code review only | executing session, 2026-09-07 | `lz-eval-p23-resolvability.test.mjs`; the four frozen limits are boundary-proven before any live run | rec `1bdb1ee` / use `3189239` -- **ORDERING-FAIL, see finding 2** |
| `eval/lz-eval-p23-sliceA-draw.mjs` | executing-session code review | executing session, 2026-09-07 | `lz-eval-p23-sliceA-draw.test.mjs`; proof RUN: the balance guard disabled -> exactly 1 of 20 fails with "Missing expected exception"; restored -> 20/20 | rec `39d7709` / use `39d7709` -- **SAME-COMMIT** |
| `eval/lz-eval-p23-sliceA-read.mjs` | executing-session code review | executing session, 2026-09-07 | `lz-eval-p23-sliceA-read.test.mjs`; proof RUN: substitution reverted to a plain string replacement -> exactly 3 of 23 fail, all three T-22-15 cases; restored -> 23/23 | rec `39d7709` / use `599f4ed` -- **ANCESTOR-OK** |
| `eval/lz-eval-p23-verify-complete.mjs` | executing-session code review | executing session, 2026-09-07 | `lz-eval-p23-verify-complete.test.mjs`; both ceiling boundaries proven: 4 resume cycles does NOT clear, 3 reset windows does NOT clear; equal header counts alone are NOT sufficient | rec `39d7709` / use `87ed59f` -- **ANCESTOR-OK** |

**Prompts and reference documents -- content review, with the first-use commit named.**

| Artifact | Review verdict | Reviewer / date | First use | Ordering |
|---|---|---|---|---|
| `eval/lz-eval-p23-prereg.md` | **APPROVED, in TWO rounds** (round 1 `revise-then-freeze` on the contamination disclosure; round 2 `approve-as-frozen` on the corrected document) | Lars Gyrup Brink Nielsen, 2026-09-07 | `599f4ed` | rec `9ab9933` (inside the freeze commit) -- **ANCESTOR-OK** |
| `eval/lz-eval-p23-capture-driver.md` | **APPROVED**, same two-round checkpoint, nine items each surfaced as a specific question | Lars Gyrup Brink Nielsen, 2026-09-07 | `41b70f5` | rec `9ab9933` -- **ANCESTOR-OK** |
| the frozen ENV-03 voter prompt template (rendered by `buildDispatchString`, quoted in prereg Section (xiii)) | **APPROVED**, then RE-PINNED by AMENDMENT RECORD 1 -- **TWO ROUNDS, and the LATEST record preceding first use governs** | Lars Gyrup Brink Nielsen, 2026-09-07 and 2026-09-08 | `599f4ed` | rec `9ab9933` and governing rec `0b4e479` -- **both ANCESTOR-OK**; the superseded digests are RETAINED in the amendment, not replaced |
| `eval/lz-eval-p23-citation-audit-q1-dryrun.md` | **NAMED GAP -- OWED** | executing session only | `9ab9933` | windows defect id 1 |
| `eval/lz-eval-p23-sliceA-read-record.md` | **NAMED GAP -- OWED** | executing session only | `e8ecb5d` | windows defect id 4 (added by this plan) |
| `eval/lz-eval-p23-spike-record.md` | **NAMED GAP -- OWED** | executing session and orchestrator only | `3ada1b3` | windows defect id 5 (added by this plan) |
| `eval/lz-eval-p23-citation-audit-q2-record.md` | **NAMED GAP -- OWED** (five named wording properties) | executing session only | `e8ecb5d` | windows defect id 2 |
| `eval/lz-eval-p23-env06-record.md` | **NAMED GAP -- OWED** | executing session only | `18a4ef9` | windows defect id 3 |
| `23-ENVELOPE.md` | **NAMED GAP -- OWED** (the maintainer read against the four prior-art skeletons) | executing session only | not yet consumed downstream | windows defect id 6 (added by this plan) |

**Six of fifteen rows are gaps and none of them is marked passed.** The whole value of the sweep is
that a missing review is visible; a presence check must never stand in for a content review, and none
is reported as doing so here. `.planning/WINDOWS.md` now carries `open_count: 7`.

**The mechanical halves, verified structurally rather than asserted:**

- **Zero out-of-family spend.** No Phase-23 module adds any network call other than the resolvability
  checker's bounded identifier requests. Proof: `eval/lz-eval-p23-citation-audit.test.mjs` replaces the
  global fetch with a throwing stub for the whole file and the entire offline audit passes under it
  (`ENV-04: the whole offline audit runs with the global fetch stubbed to throw (network-free proof)`).
  Independently, no out-of-family capability exists account-wide, so D-18 cannot be breached.
- **The eval tree never ships.** `node --test eval/lz-eval-packaging-boundary.test.mjs` exits 0, and
  `git status --porcelain plugins/` is empty -- nothing new under the plugin tree.
- **The eval package manifest is unchanged** and no dependency was added.
- **Phase 22 was not re-opened.** `eval/lz-eval-parity-prereg.md`,
  `.planning/notes/phase-22-diagnosis-two-root-causes.md` and `22-05-PLAN.md` are all `git status`
  clean, and **no Phase-22 calibration verdict file was read for any purpose** by this plan.
- **The Phase-23 pre-registration is unchanged by this plan.** Task 2's `<files>` names it as the home
  for an amendment "if anything changed after the freeze". Nothing frozen changed, so **no AMENDMENT
  RECORD entry was required or written** and the file is untouched. The only entry in force remains
  AMENDMENT RECORD 1 (2026-09-08), written by Plan 23-05 before any dispatch with zero verdicts in
  existence.

## The phase gate

```
$ node --test <12 explicit FILE paths>
tests 213 / pass 213 / fail 0 / skipped 0 / todo 0     exit 0

$ <CI registration check, non-comment lines only>
[OK] all 8 Phase-23 test files registered in CI

$ <Phase-22 untouched + eval manifest>
[OK] Phase 22 not re-opened; eval package manifest unchanged

$ <probe-edge traceability>
[OK] 36 probe edges mapped one-to-one against 23-PROBE-COVERAGE.json

$ git diff --exit-code .planning/config.json .planning/STATE.md
exit 0
```

The directory form of `node --test` was never used: it spuriously exits 1 on this host. Every path is
named individually.

**Probe-edge traceability: the 35 + 1 = 36 split, re-derivable rather than trusted.** The check matches
the plan's table one-to-one against `23-PROBE-COVERAGE.json` on the `requirement_id` plus `category`
key, with no duplicate, no missing edge and no invented edge, and asserts the row count equals
`coverage.applicable: 36`. **35 edges are discharged into a plan's `must_haves`; 1 -- ENV-07 /
unclassified -- is NOT discharged, deliberately, and is surfaced below.** A future auditor should
expect the manifest itself to read `"status": "unresolved"` on every item and `coverage.resolved: 0`,
because it records what the probe emitted before planning touched it; the plan's table is the
resolution record, and that mismatch is expected rather than 36 open edges.

**Config and STATE hygiene.** No `gsd-tools` `state.*`, `phase.*` or `roadmap.*` verb was called.
`gsd-tools windows append` ran four times and caused **no** drift: `git diff .planning/config.json
.planning/STATE.md` was empty after every call and before every commit, so nothing needed reverting.
`state.update-progress` was NOT called. STATE.md and ROADMAP.md were not touched -- they are the
orchestrator's.

## The flagged ENV-07 planner assumption, restated so the verifier meets it

Carried verbatim in substance from this plan's own flagged-assumptions table, not paraphrased away:

| Requirement | Category | Probe | Why it stays unresolved |
|---|---|---|---|
| ENV-07 | unclassified | "unclassified -- review manually" | The edge probe could not classify ENV-07 into any shape category, and correctly so: ENV-07's deliverable is a DOCUMENT whose value is whether it is useful rather than boilerplate, which is a human judgement and not a data-shape property. Authoring a backstop marker would assert a checkable statement where none exists, and auto-dismissing it would hide the gap. The envelope's usefulness is verified by the maintainer's read against the four prior-art skeletons named in the research, per this phase's own validation strategy, and by nothing mechanical. |

The MECHANICAL half of ENV-07 -- exactly one termination branch named, the not-established section
non-empty, the required sections present -- IS covered, by Task 1's checks above. What stays unresolved
is only the judgement, and it is routed to a human (windows defect id 6) rather than faked.

## Carried item: the Phase-22 test files still unregistered in CI

The Phase-22 gap was that 106 of 108 tests never executed on a push. This phase closed its own share --
all 8 Phase-23 test files are registered -- and the honest remainder is stated rather than implied
fixed. **12 of the 45 `eval/*.test.mjs` files on disk run in CI; 33 do not:**

`lz-eval-armA-native`, `lz-eval-baseline-guard`, `lz-eval-cheaper-pilot`, `lz-eval-contrastive-authoring`,
`lz-eval-contrastive-screen`, `lz-eval-control-construction`, `lz-eval-control-source`,
`lz-eval-cost04-anthropic-floor`, `lz-eval-difficulty-proxy`, `lz-eval-evidence-join`, `lz-eval-harvest`,
`lz-eval-judge-calibration`, `lz-eval-live-cert`, `lz-eval-mcc`, `lz-eval-offline-read`,
`lz-eval-oof-batch`, `lz-eval-parity-calibration-dispatch`, `lz-eval-parity-calibration-harness`,
**`lz-eval-parity-judge`**, `lz-eval-parity-prereg`, **`lz-eval-parity-verdict`**, `lz-eval-prescale-probe`,
`lz-eval-resume-fixture`, `lz-eval-sc5-trace`, `lz-eval-search-loop`, **`lz-eval-sliceA-gold`**,
`lz-eval-survival-probe`, `lz-eval-trap-assembler`, `lz-eval-traps`,
`lz-eval-voter-dispatch.workflow.harness`, `lz-eval-wice-traps`, `lz-review-gate-check`,
`lz-review-gate.workflow.harness` (all `.test.mjs`).

**Three of those are composed by this plan's own Task-3 gate** (bolded above), so they run here but not
on a push. Mitigating fact, checked rather than assumed: the Phase-23 constants those modules own
(`SLICE_A_GATE.N_SUP_MIN`, `N_REF_MIN`) are pinned by `lz-eval-p23-prereg.test.mjs`, which IS
registered -- so CI does protect the frozen numbers even where it does not run the owning module's own
suite. Registering the other 33 is outside this plan's acceptance criteria and was not done.

## Decisions Made

- **Phase-level branch (a), with (b) held separately.** Three sources produced planned readings, so the
  clause's (a) is satisfied on its own terms. Writing (b) at the phase level would have understated
  what was measured; writing (a) over ENV-06 would have overstated it. The envelope does neither.
- **The envelope exceeds one page and the deviation is recorded rather than the disclosure dropped.**
  See deviation 1.
- **ENV-08 closes PARTIALLY and says so.** The executing session cannot content-review its own output;
  closing those rows would be exactly the self-certification the phase's rules forbid.
- **The prereg was left untouched.** No amendment was required, so none was written.

## Deviations from Plan

### 1. [Rule 4-adjacent, recorded not asked] The one-page acceptance criterion is not satisfiable alongside the plan's own mandated content list

- **Found during:** Task 1.
- **Issue:** Task 1's acceptance criteria require BOTH "the document is roughly one page and does not
  exceed two" AND a content list that cannot fit two pages: an identity block with resolved model
  strings, one entry per reading with its result and named limits, the specific human-routed conditions,
  the three PROVISIONAL limits, the no-significance ceiling with its arithmetic, the D-07 realized
  ceiling, **every** cost figure with its retry history, five further specific limitations, a
  not-established table with one row per named method, the termination section with two quoted clauses
  plus the ancestry proof, the ship-gate statement and the review record. The plan's own
  `min_lines: 80` acknowledges the floor.
- **What was done:** the document was written, then compressed twice -- 234 lines / 3031 words, then
  221 / 2734, then **190 lines / 2627 words** -- by converting the evidenced section and the q1 rows to
  tables and cutting every sentence that repeated another. **No mandated disclosure was dropped to hit
  the page target.** The residual overshoot (~4 pages of prose, not 1-2) is recorded here.
- **Why this direction:** the alternatives were dropping a required disclosure, or claiming one page for
  a four-page document. Both are worse than a recorded miss on a length target.
- **Files modified:** `23-ENVELOPE.md`. **Committed in:** `18a4ef9`.

### 2. [Rule 2 - Missing critical] Four ENV-08 gaps had no ledger row, so they were invisible to the ship gate

- **Found during:** Task 2.
- **Issue:** `.planning/WINDOWS.md` carried rows for the q1 dry-run record, the q2 record and the ENV-06
  record, but **not** for the Slice-A read record or the spike record -- both of which say in their own
  `## Review record` sections that review is OWED -- and not for the envelope this plan published. The
  measured ordering failure had no row either. The ledger is what makes an owed review visible at
  `/gsd-ship` after the per-phase SUMMARY scrolls out of context, so an absent row is a real gap.
- **Fix:** four rows appended (ids 4, 5, 6, 7). `open_count` 3 -> 7.
- **Verification:** the ledger table and its JSON block both re-read after the append; no config or
  STATE drift from the four SDK calls.
- **Committed in:** `e8c383d`.

### 3. [Rule 1 - Bug] REQUIREMENTS.md had the ENV-05 / ENV-06 dispositions INVERTED

- **Found during:** Task 2 (pre-existing defect, assigned to this plan).
- **Issue:** ENV-05 -- the **MEASURED** requirement -- read `- [ ]` with a traceability row of
  `Pending`, while ENV-06 -- the **TERMINATED** one -- read `- [x]`. That inverts the actual strength of
  the two outcomes in a file the milestone audit cross-references.
- **Fix:** ENV-05 -> `- [x]` / `Complete`, labelled **branch (a) MEASURED** with the
  completeness-not-ceiling precision. ENV-06 kept `- [x]` (a branch-(b) termination IS a completed
  outcome under the ROADMAP's clause) but now carries **branch (b) NOT-ESTABLISHABLE-BY-METHOD**, its
  on-disk reason, and the explicit statement that it is not branch (c).
- **Method:** hand-edited. `requirements.mark-complete` was NOT called -- SDK mutators have dropped
  `branching_strategy` from `config.json` repeatedly in this phase.
- **Verification:** `git diff --exit-code .planning/config.json .planning/STATE.md` exits 0 after the
  edit. **Committed in:** `e91b990`.

---

**Total deviations:** 3 (1 recorded criterion miss with its reason, 1 missing-critical addition,
1 pre-existing bug fixed). **Impact:** no scope creep; nothing frozen was edited; no mandated
disclosure was dropped.

## New discrepancies found this plan

The phase's standing discipline is to verify every stated figure from disk and record any disagreement
rather than bend anything to match. **Twenty-one figures had disagreed before this plan.**

1. **Every figure re-checked this plan AGREED with disk.** Verified independently: the freeze SHA,
   timestamp and exactly-three-files; lz q2 `costUsd` 14.930978050000009 / `claude-sonnet-5` / 2.1.263 /
   `resumeCycles: 0`; built-in q2 55.30793200000004 with `costUpperBoundUsd` 79.32313525000006 /
   `claude-opus-5` / 2.1.263 / `admissible: false`; the lz q2 report at 14306 bytes and the built-in q2
   report **absent**; 422 retained files, 203 `.jsonl` worker transcripts, 15 `tool-results/` documents,
   87 MB, 15 lz excerpt files; Slice A `{unrefuted:{tp:18,fn:2}, refuted:{tn:20,fp:0}, n:40,
   drawSeed:20260907}`; q2 audit 12 canonical sources / coverage 59 of 67 / quote 1 of 8 / resolvability
   12 records at `2026-09-08T09:30:52.465Z`. **Zero new figure discrepancies.**
2. **NEW -- an ENV-08 ORDERING failure, measured not assumed.** The review record for
   `lz-eval-p23-citation-audit.mjs` and `lz-eval-p23-resolvability.mjs` lives in 23-03-SUMMARY at
   `1bdb1ee`, which is **NOT** a git ancestor of their first-use commit `3189239` (the published q1 dry
   run). Under the ENV-08 boundary rule -- same-commit counts, later-than-first-use does not -- these
   two rows fail the ordering half. Recorded as windows defect id 7; nothing was back-dated and no
   record was moved.
3. **NEW -- the ENV-03 voter seat's resolved model string was never recorded.** The Slice-A record and
   23-05-SUMMARY both give the seat as `subagent_type: "Explore"`, `model: "sonnet"` -- an ALIAS. The
   Agent tool exposes no resolved string to the dispatching session (the same reason its per-call cost
   is recorded as unavailable). Under the generation-5 directive that seat is a generation-5 Sonnet, but
   the string is not recoverable, so the envelope's identity block carries it as a **NAMED GAP** and
   invents nothing. Inventing one would be falsification of capture provenance.
4. **NEW -- 33 of 45 eval test files are unregistered in CI**, three of them composed by this plan's own
   Task-3 gate. Full list above, as a carried item rather than an implied fix.
5. **Wording precision, resolved toward the source record.** The dispatching instruction described q2's
   59-of-67 coverage as "largely" a report-format effect; the q2 record itself says "at least in part".
   The envelope uses the record's own wording, because the record is the authority and 19 of 59 uncited
   units being metadata lines does not support the stronger adverb.

## Issues Encountered

None beyond the deviations above. No auth gate, no blocked commit, no failing test.

## Gates NOT run here, and deferred to their dedicated auditors

**No verification, security, validation or review verdict is written in this SUMMARY.** Each has a
dedicated auditor agent and the phase's own rules forbid self-certifying any of them:

| Gate | Artifact | Status |
|---|---|---|
| `verify_phase_goal` | `23-VERIFICATION.md` | **pending** -- `gsd-verifier` |
| `/gsd-secure-phase 23` | `23-SECURITY.md` | **pending** -- `gsd-security-auditor` |
| `/gsd-validate-phase 23` | `23-VALIDATION.md` gaps | **pending** -- `gsd-nyquist-auditor` |
| `/gsd-code-review` | `23-REVIEW.md` | **pending** -- `gsd-code-reviewer` |
| `/gsd-extract-learnings 23` | learnings | **pending** -- orchestrator-inline by design |

The roadmap and the STATE file were not touched by this plan; the requirements checkboxes were touched
ONLY to correct the ENV-05 / ENV-06 inversion, which was assigned to this plan explicitly.
**ENV-01, ENV-02 and ENV-03 still read `Pending` in REQUIREMENTS.md** although their realized
dispositions are MET. That understates rather than inverts -- no requirement reads stronger than it is
-- and their verdicts belong to the verifier and the milestone audit, so this plan left them alone. It
is flagged here so the audit meets it rather than having to find it.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Phase 23 is executed, 9 of 9 plans.** The phase's public artifact exists, the termination is resolved
under exactly one branch, and the review gate is closed to the extent an executing session may close it.

- **Ready for `verify_phase_goal` -> `/gsd-secure-phase 23` -> `/gsd-validate-phase 23` ->
  `/gsd-extract-learnings 23`.** None of these run themselves and none was self-certified here.
- **`/gsd-audit-milestone` must close ENV-06 as a COMPLETED outcome, not a gap** -- branch (b)
  NOT-ESTABLISHABLE-BY-METHOD, per the clause's own words, which the envelope quotes. And it must not
  read the phase-level (a) as covering ENV-06.
- **`/gsd-ship` is blocked by `.planning/WINDOWS.md` `open_count: 7`** -- six owed content reviews plus
  one measured ordering failure. That is the designed behaviour, not a fault.
- **The irreplaceable gitignored caches are intact.** No `git clean` was run in any form; nothing under
  `eval/.cache/` or `.lz-research/` was written, deleted or truncated by this plan. Every access was a
  read.

## Self-Check: PASSED

- `.planning/phases/23-.../23-ENVELOPE.md` -- FOUND, 190 lines, 8 sections non-empty, one
  `Resolved branch: MEASURED` line, `0.0625` and `0.549` both present, 0 bytes >= 128, no CR, no BOM
- Commits `18a4ef9`, `e8c383d`, `e91b990` -- all FOUND in `git log`
- Plan `<verification>`: full explicit-file suite 213/213 exit 0; all 8 Phase-23 test files registered
  in CI; ancestry proof 14/14 with a negative control; the eight sections plus the one-branch check with
  all four discrimination outputs recorded; Phase-22 records and the eval package manifest clean;
  probe-edge traceability 36 of 36 one-to-one; `git diff --exit-code .planning/config.json
  .planning/STATE.md` exit 0
- Identity hygiene: the committed envelope contains **zero** email-shaped tokens (verified by
  allowlist inversion -- assert the only email-shaped token present is the approved public one; none is
  present at all), and `git config user.email` is the public gmail
- All task `<acceptance_criteria>` re-run and passing, with the single exception of Task 1's page-length
  criterion, recorded as deviation 1 rather than reported as met

---
*Phase: 23-judge-free-confidence-and-operating-envelope-for-lz-deep-res*
*Completed: 2026-09-08*
