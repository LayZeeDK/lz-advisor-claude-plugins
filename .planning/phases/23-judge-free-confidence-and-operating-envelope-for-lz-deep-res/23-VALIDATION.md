---
phase: 23
slug: judge-free-confidence-and-operating-envelope-for-lz-deep-res
# status lifecycle: draft (seeded by plan-phase) -> validated (set by validate-phase section 6)
# audit-milestone section 5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: validated
nyquist_compliant: true
wave_0_complete: true
created: 2026-09-07
validated: 2026-09-08
validated_at_head: 996fcfe
auditor: gsd-nyquist-auditor
verdict: PARTIAL
verdict_reason: >-
  Every ENV requirement now carries either an executed automated check or a recorded honest reason it
  cannot carry one, so the coverage contract holds. ENV-08's content-review half remains open as seven
  NAMED human items in .planning/WINDOWS.md rows 1-7. Those are review obligations, not test gaps, and
  no test was fabricated to appear to close one.
gaps_filled: 2
gaps_open_human: 7
suite_at_close: 285/285 pass, exit 0, explicit FILE form
---

# Phase 23 -- Validation Strategy and Coverage Audit

> Seeded by plan-phase; the Per-Task Verification Map and the coverage verdicts below were filled
> post-execution by an independent audit at HEAD `996fcfe`.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `node:test` (Node stdlib, no test runner dependency) |
| **Config file** | `eval/package.json` (`type: module`; sole devDependency `jstat@1.9.6`, dev-only, never ships) |
| **Quick run command** | `node --test eval/<specific>.test.mjs` -- the explicit FILE form |
| **Full suite command** | The 15 files enumerated in `.github/workflows/ci.yml`, passed as an explicit file list |
| **Measured suite result** | **285 tests / 285 pass / 0 fail, exit 0** (run in this audit's own process) |
| **Measured runtime** | ~2 s for the registered eval list |

**HOST QUIRK -- do not gate on the directory form.** On this machine `node --test <dir>` exits 1 even
when every test passes. Every command in this document uses the explicit `.test.mjs` FILE form. A
directory-form red is not a failure signal.

**CI registration, re-derived.** `ci.yml` registers 15 `eval/*.test.mjs` files; 47 exist on disk. All
nine files any Phase-23 requirement depends on are registered -- the eight Phase-23 files plus
`lz-eval-sliceA-gold.test.mjs`, which this audit registered (see Gap 2). The remaining 32 are Phase
16-22 files and are judged below.

---

## Sampling Rate

- **After every task commit:** run the file-form test for the module the task touched
- **After every plan wave:** run the full explicit-file-list eval suite
- **Before `/gsd-verify-work`:** full suite must be green -- measured green at close
- **Max feedback latency:** ~2 s measured, well inside the 30 s budget

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 23-01 T1-T3 | 23-01 | 1 | ENV-02 | T-23-26, T-23-12 | A report with no `validateManifest`-passing MANIFEST is INADMISSIBLE; `extractSystemInit` pins a version from a real `system/init` event; cost is enumerated per stream, never invented | unit | `node --test eval/lz-eval-baseline-manifest.test.mjs eval/lz-eval-baseline-manifest-defects.test.mjs` | yes | green |
| 23-02 T1-T3 | 23-02 | 1 | ENV-03, ENV-05 | T-23-03, T-23-09 | The draw is seeded and reproducible; the tally never pools; the read emits exactly five keys with no rate, interval or pass/fail; the spike predicates are frozen | unit | `node --test eval/lz-eval-p23-sliceA-draw.test.mjs eval/lz-eval-p23-sliceA-read.test.mjs eval/lz-eval-p23-verify-complete.test.mjs` | yes | green |
| 23-03 T1-T2 | 23-03 | 2 | ENV-04 | T-23-14 | Normalization and identifier canonicalization are frozen before any rate; the live resolvability half asserts the mechanism against stub fetchers and records a check date, never a remote result | unit | `node --test eval/lz-eval-p23-citation-audit.test.mjs eval/lz-eval-p23-resolvability.test.mjs` | yes | green |
| 23-04 T1-T2 | 23-04 | 2 | ENV-01, ENV-08 | T-23-01 | The pre-registration is frozen byte-for-byte and is a strict git ancestor of every capture, vote and score commit | unit + git ancestry | `node --test eval/lz-eval-p23-prereg.test.mjs`; `git merge-base --is-ancestor 9ab9933 <each post-freeze commit>` | yes | green (22/22 ancestor-ok; negative control `3189239` exits 1) |
| 23-05 T2 | 23-05 | 3 | ENV-03 | T-23-06 | A dispatch that STARTED must complete: a partial run cannot hide inside the never-ran path, and a read record cannot outlive a dispatch that never ran | integration (extracted gate over scratch fixtures) | `node --test eval/lz-eval-p23-sliceA-gate.test.mjs` | yes -- **authored by this audit** | green (7/7; discrimination proof below) |
| 23-05 T3 | 23-05 | 3 | ENV-03 | T-23-09 | The published read rests on 40 write-once verdicts on disk and is re-tallied per direction, never pooled | unit + re-tally from disk | `node --test eval/lz-eval-p23-sliceA-read.test.mjs eval/lz-eval-sliceA-gold.test.mjs` | yes | green |
| 23-06 T1-T3 | 23-06 | 4 | ENV-05, ENV-02 | T-23-07, T-23-06 | The spike's verdict is computed by frozen predicates, not asserted; the retention destination is pattern-checked and asserted inside the cache root before any write | unit | `node --test eval/lz-eval-p23-verify-complete.test.mjs eval/lz-eval-p23-retain.test.mjs` | yes | green |
| 23-06 spike outcome | 23-06 | 4 | ENV-05 | -- | The spike RAN and its frozen predicates returned their planned reading | **measurement -- no pass/fail exists** | recorded run properties re-executed: `spikeCleared({reportText:'',resumeCycles:1,resetWindows:2})` -> `cleared false`, completeness `false`, ceiling `cleared true` | n/a | green as a recorded observation |
| 23-07 T1-T2 | 23-07 | 5 | ENV-04 | T-23-14 | Only ADMISSIBLE reports are audited; an absent report is published as an ABSENCE, never back-fitted onto q1 | integration CLI | `node eval/lz-eval-p23-citation-audit.mjs eval/.cache/p23-baseline/lz/q2/q2-run1.report.md` (read-only) | yes | green (`sources=12 unmatched=0 markers=0/0 uncited-units=59/67`, reproduces byte-identically) |
| 23-08 T1 | 23-08 | 6 | ENV-06 | -- | Nothing is graded when the reference half of the pair does not exist | **inspection -- a published termination** | `test -e eval/.cache/p23-baseline/builtin/q2/q2-run1.report.md` -> absent; exactly one status line, `NOT-RUN branch (b)` | n/a | green as a recorded absence |
| 23-09 T1 | 23-09 | 7 | ENV-07 | -- | The envelope names exactly one termination branch and a non-empty NOT ESTABLISHED section | structural | the plan's inline section/branch check, re-run: `[OK] eight sections non-empty; resolved branch = MEASURED` | yes | green (mechanical half only -- usefulness is WINDOWS row 6) |
| 23-09 T2 | 23-09 | 7 | ENV-08 | T-23-20 | The eval tree never ships; the eval -> runtime import boundary is one-directional; zero out-of-family transport | unit | `node --test eval/lz-eval-packaging-boundary.test.mjs eval/lz-eval-worker-contract.test.mjs` | yes | green |
| 23-09 T2 (content half) | 23-09 | 7 | ENV-08 | -- | Every prompt/reference steering an LLM task is content-reviewed BEFORE it drives that task or ships | **human -- not test-closable** | none; six reviews owed plus one measured ordering failure, `.planning/WINDOWS.md` rows 1-7 | n/a | **open, NAMED** |
| Gap closure | -- | 8 | ENV-03 | T-23-06 | The Task 2 completeness gate discriminates a partial dispatch WITHOUT touching a real record | integration | `node --test eval/lz-eval-p23-sliceA-gate.test.mjs` | yes | green |

*Status: pending / green / red / flaky. Every command above was executed in this audit's process.*

---

## Requirement Coverage Verdicts

| Req | Verdict | The executable check that covers it | What is NOT covered |
|-----|---------|-------------------------------------|---------------------|
| ENV-01 | **COVERED** | `eval/lz-eval-p23-prereg.test.mjs` (25 tests) pins the frozen blob byte-for-byte, plus `git merge-base --is-ancestor` over every post-freeze commit. Re-derived here: freeze `9ab9933`, exactly three files, 22/22 descendants, negative control `3189239` exit 1 | Nothing. This is the phase's strongest requirement -- the ordering claim is git-provable and the negative control discriminates |
| ENV-02 | **COVERED** | `lz-eval-baseline-manifest.test.mjs` + `lz-eval-baseline-manifest-defects.test.mjs`, both registered. Re-derived: `validateManifest` passes three MANIFESTs and throws its quoted reason on the built-in q2, which is filed `.MANIFEST.INADMISSIBLE.json`; `extractSystemInit` pins CC 2.1.263 from real `system/init` events | The per-run cost figures are enumerations of stream terminals, so they are only as good as the retained streams. That is a provenance property, not a testable one, and the MANIFESTs carry the enumeration rather than a summary |
| ENV-03 | **COVERED** | `lz-eval-p23-sliceA-draw.test.mjs`, `lz-eval-p23-sliceA-read.test.mjs`, `lz-eval-sliceA-gold.test.mjs` (now registered) and the new `lz-eval-p23-sliceA-gate.test.mjs`. The five-key output contract, the seeded draw and the per-direction tally are all unit-asserted; the completeness gate is now discrimination-proven in both directions | The voter READ itself has no pass/fail and correctly acquires none. The voter seat's RESOLVED model string was never captured -- only the alias `sonnet` -- and the envelope names that as a gap rather than inventing a string |
| ENV-04 | **COVERED, as PARTIAL-Q2** | `lz-eval-p23-citation-audit.test.mjs` + `lz-eval-p23-resolvability.test.mjs`, both registered; the audit CLI reproduces byte-identically on all three admissible reports. The live resolvability half runs entirely against stub fetchers, so CI needs no network | The COMPARATIVE bar is NOT SET and is published as such: the built-in q2 produced no report. No test can create the missing half, and none pretends to. The ledger now carries `PARTIAL-Q2` (fixed at `073d0f7`) |
| ENV-05 | **COVERED for the predicates; a MEASUREMENT for the outcome** | `lz-eval-p23-verify-complete.test.mjs` covers `spikeCleared` and `spikeCeilingCheck` as frozen functions; both re-executed at the realized inputs and at the window-3 boundary | The spike's OUTCOME is a spend event and has no repeatable test. That is recorded as a manual-only verification below rather than papered over with an assertion on a stored result |
| ENV-06 | **NOT TESTABLE, correctly** | None, and none should exist. The check that stands in for one is a disk fact re-executed here: the reference report and its audit output are both absent, exactly one status line reads `NOT-RUN branch (b)`, and nothing was graded | A grading. The requirement resolves by published termination, and manufacturing a test here would assert a pass/fail where the method itself was not establishable |
| ENV-07 | **COVERED mechanically; a HUMAN READ for the rest** | The plan's inline structural check, re-run: eight sections non-empty, exactly one `Resolved branch:` line, ASCII/LF/no-BOM | Whether the envelope is useful rather than boilerplate. That is WINDOWS row 6 and the check does not cover it -- and this document does not report it as doing so |
| ENV-08 | **PARTIAL** | Mechanical halves covered and green: `lz-eval-packaging-boundary.test.mjs` (2/2), `lz-eval-worker-contract.test.mjs`, no out-of-family transport string in any p23 module, no maintainer-authored gold, the eval -> runtime import boundary one-directional | The CONTENT-REVIEW half. Six independent reviews are owed and one MEASURED ordering failure is recorded (`1bdb1ee` is not a git ancestor of first-use `3189239`). All seven are NAMED in `.planning/WINDOWS.md`; a presence check was never substituted for a content review, and this audit did not attempt to close a human review with a test |

**8 of 8 requirements carry either an executed automated check or a recorded honest reason they
cannot. 7 of 8 are fully covered to the extent their subject matter permits; ENV-08 is PARTIAL on its
human half.**

---

## Gaps found, and what I did with each

### Gap 1 -- FILLED. The NOT-EXERCISED half of Plan 23-05 Task 2's discrimination proof

Plan 23-05 Task 2's acceptance criteria demanded, in full: *"with the directories present, remove one
dispatch record and observe FAIL."* The SUMMARY recorded that half as NOT-EXERCISED rather than
claiming it -- correctly, because the only dispatch directory in existence holds 40 write-once
provenance records in a gitignored cache with no backup (T-23-06).

I judge the recorded non-exercise **acceptable as a decision and closable as a gap.** Refusing to
destroy irreplaceable evidence to test a five-line predicate was right. But an equivalent proof IS
constructible without touching anything real, and that makes the gap genuine: every path the gate
names is RELATIVE, so the committed gate source can be extracted verbatim from the plan text and run
with `cwd` pointed at scratch fixtures in the OS temp tree.

Test authored: **`eval/lz-eval-p23-sliceA-gate.test.mjs`** (7 tests, registered in CI). It exercises
the ACTUAL committed gate source rather than a re-implementation, and asserts -- rather than assumes
-- that the gate carries no absolute path and that no fixture resolves inside `eval/.cache/`. Coverage:
the never-ran pass, the record-outlives-dispatch fail, the 40/40 pass, the **39-dispatch fail**, and
the 39-verdict fail.

**Discrimination proof, both outputs recorded.** The covered predicate was broken by deleting the
dispatch-count check from the extracted gate source. First, the gate itself on a 39-record tree:

```
--- COMMITTED gate, 39 dispatch / 40 verdicts ---
{ "status": 1, "err": "Error: a dispatch STARTED, so it must complete: expected 40 dispatch records, found 39" }
--- MUTATED gate (dispatch-count check deleted), same fixture ---
{ "status": 0, "out": "[OK] 40 dispatch records and 40 verdicts" }
```

The mutated gate exits 0 and prints `[OK] 40 dispatch records and 40 verdicts` over 39 records -- a
false pass. Then the test file itself, run against that mutated source:

```
x ENV-03: the gate FAILS when one dispatch record is removed from a started run (Plan 23-05 Task 2, previously NOT-EXERCISED)
  AssertionError [ERR_ASSERTION]: a partial dispatch must not hide inside the never-ran path
tests 7 / pass 6 / fail 1
```

Exactly the target test went red and the other six stayed green. Restored: **tests 7 / pass 7 / fail
0, exit 0.** Nothing under `eval/.cache/` or `.lz-research/` was read, written, moved or deleted at
any point; the plan file was read only.

### Gap 2 -- FILLED. ENV-03's gold-collapse and per-direction tally were not running in CI

`eval/lz-eval-sliceA-gold.mjs` is imported directly by both Phase-23 Slice-A modules --
`filterSliceA` by the draw, `tallyPerDirection` and `sliceAFeasibilityGate` by the read. The
never-pooled tally that the published ENV-03 reading rests on therefore lives in a module whose
18-test co-test was passing locally and **not executing on push.** Registered in `ci.yml` with a
comment naming why. Measured: 18/18 pass, and the full registered list goes from 267 to **285 tests /
285 pass / 0 fail, exit 0.**

### Gap 3 -- NOT A GAP, and worth stating plainly. The probe-coverage manifest reads 0 resolved

`23-PROBE-COVERAGE.json` records `coverage.applicable: 36, resolved: 0, unresolved: 36` and
`"status": "unresolved"` on all 36 items. Read alone that looks like 36 open edges. It is not: the
manifest records what the edge probe emitted BEFORE planning touched it, and the plans' own tables are
the resolution record. 23-09-SUMMARY says so in advance, which is the difference between a stale
artifact and a disclosed one.

Re-derived rather than accepted: 36 manifest edges, 36 unique on `requirement_id` + `category`, and
**36 of 36 match a row in one of the nine plan tables -- zero missing, zero invented.** 35 are
discharged into a plan's `must_haves`; 1 -- ENV-07 / unclassified -- is deliberately NOT discharged
and is surfaced as WINDOWS row 6. That is the honest disposition for a requirement whose deliverable
is a document.

### Gap 4 -- OPEN, human, correctly NAMED. ENV-08's six content reviews and one ordering failure

Confirmed present and named rather than silently passed: `.planning/WINDOWS.md` carries
`open_count: 7` with all seven rows `open` and all seven scoped to phase 23, and each of rows 1-5
names the specific wording properties its review must check rather than asking for review in general.
Row 7 records an ordering failure the phase measured against ITSELF -- the review record at `1bdb1ee`
is not a git ancestor of first-use commit `3189239` -- which is the behaviour the project's
review-before-use rule asks for when it is broken.

**I did not attempt to close any of these with a test, and no test in this phase reports covering
one.** Whether prose is honest rather than merely present is not a predicate. These are listed under
Manual-Only Verifications below and in `23-VERIFICATION.md`'s `human_verification` block.

---

## The 33-unregistered-test-files finding -- my judgement

**Carried debt from Phases 16-22, NOT a Phase-23 coverage gap -- with one exception I closed.**

Re-derived at HEAD: 47 `eval/*.test.mjs` on disk, 13 registered before this audit, so 34 unregistered
once `lz-eval-p23-retain.test.mjs` landed. Registration is now 15 and unregistered is 32.

Why the bulk is not this phase's gap: no Phase-23 requirement depends on any of the 32. The two named
Phase-22 modules are the clearest case -- `lz-eval-parity-judge` and `lz-eval-parity-verdict` are
blinding and judge machinery, and ENV-06 terminated on branch (b) with **nothing graded, no ordering
dispatched and no per-dimension score in existence.** A module a requirement did not use cannot be
that requirement's coverage gap. Registering all 32 in this audit would also mean shipping 32 files
whose green state I have not re-verified against the current tree into a gate that blocks push.

The exception, and why it was different: `lz-eval-sliceA-gold.test.mjs` was on that same list, but
ENV-03's published reading imports that module directly. That is a live Phase-23 dependency running
without a CI gate, and I closed it (Gap 2). The distinction the earlier finding missed is
DEPENDENCE, not authorship -- and by that test exactly one of the 33 belonged to Phase 23.

**Recommendation, not a blocker for this phase:** the remaining 32 are a milestone-level item for
`/gsd-audit-milestone`, best closed by one pass that runs each file, registers the green ones, and
files the reds as windows defects. Doing it inside a phase audit would be scope this phase did not
ask for.

---

## The NOT-EXERCISED 23-05 criterion -- my judgement

**The recorded non-exercise was acceptable. The gap was still real, and it is now closed.**

Two things had to be judged separately, and conflating them is how a phase either destroys evidence or
quietly drops a criterion:

1. **Was refusing to run it correct?** Yes. The alternative was deleting one of 40 irreplaceable
   write-once records from a cache with no backup, and the completeness property was independently
   confirmed another way -- the gate asserts exactly 40 in each directory, and both directories were
   confirmed at 40. Recording NOT-EXERCISED rather than claiming the proof is exactly the discipline
   this project demands.
2. **Was an equivalent proof constructible?** Also yes, and that is where the phase stopped one step
   short. The gate's paths are relative; a scratch fixture plus a redirected `cwd` reaches the same
   observation at zero risk. That step was available at the time and was not taken.

So: no fault in the decision, a genuine hole in the coverage, filled. The proof now runs on every push
and the phase's own criterion is met by observation rather than by argument.

---

## Requirement Verifiability -- as measured, replacing the plan-time estimate

| Req | Plan-time estimate | Measured | Change |
|-----|--------------------|----------|--------|
| ENV-01 | Deterministic | Deterministic -- 25 unit tests plus git ancestry with a discriminating negative control | held |
| ENV-02 | Deterministic, blocked on D-22 | Deterministic -- D-22 resolved before the MANIFEST test was authored; cost is an enumeration of stream terminals, not an invented value | held, block cleared |
| ENV-03 | Partly deterministic | Partly deterministic -- and MORE covered than estimated: the completeness gate is now discrimination-proven in both directions, which the plan expected to leave half-open | strengthened |
| ENV-04 | Partly deterministic | Partly deterministic as estimated; resolvability asserts the mechanism against stubs and records a check date, never a remote result | held |
| ENV-05 | Not testable -- a measurement | Correct. The predicates ARE unit-tested; the outcome is not, and acquired no assertion | held |
| ENV-06 | Not testable -- conditional measurement | Correct, and it did not even reach the conditional: no grading occurred | held |
| ENV-07 | Inspection only | Correct. Structure is checked, usefulness is routed to a human | held |
| ENV-08 | Process, evidenced by artifacts | Correct, and honestly PARTIAL: the mechanical halves are green and the content half is open and named | held |

---

## Wave 0 Requirements

- [x] Resolve D-22 (`costUsd` source) before any ENV-02 test is authored -- resolved; the MANIFESTs
      enumerate per-stream terminals and the audit re-summed every figure rather than reading one
- [x] Add every new `.test.mjs` to `ci.yml` in the same task that creates it -- held for all eight
      Phase-23 files (with Plan 23-04's deliberate, disclosed separate-commit deviation so the freeze
      commit carried exactly three files), and held for this audit's own new file

**`wave_0_complete: true`** -- both wave-0 items are satisfied by measured evidence, not by assertion.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions | Status |
|----------|-------------|------------|-------------------|--------|
| The ENV-05 spike's capture completed within the frozen ceiling | ENV-05 | A capture is a spend event, not a repeatable test | Read the recorded run properties: resume cycles, reset windows, whether a verification-complete report landed | DONE -- recorded: 1 resume / 2 windows, no report; not cleared on COMPLETENESS |
| The built-in's workers leave recoverable fetched content (D-19 branch selector) | ENV-04 / ENV-05 | One-time observation during the spike | Inspect the retained `subagents/` copy for `tool_result` entries carrying fetched source text | DONE -- 15 `tool-results/` files, 203 transcripts, 87 MB; branch A confirmed |
| Content-review `lz-eval-p23-citation-audit-q1-dryrun.md` and the two modules it introduced | ENV-08 | Whether prose is not-bar-setting rather than merely present is a judgment | Read against the row's named properties | **OPEN -- WINDOWS row 1** |
| Content-review `lz-eval-p23-citation-audit-q2-record.md` against its five wording properties | ENV-08 | The executing session cannot review its own output | PARTIAL-Q2 must read as a measured shortfall behind a dispatched capture, never a budget descope; coverage never relabelled support | **OPEN -- WINDOWS row 2** |
| Content-review `lz-eval-p23-env06-record.md` | ENV-08 | A keyword scan cannot decide a semantic property | The termination never worded as MEASURED; (b) never presented as (c); no cost figure without its retry history and the 79.32 upper bound | **OPEN -- WINDOWS row 3** |
| Content-review `lz-eval-p23-sliceA-read-record.md` | ENV-03 / ENV-08 | Framing is a language property | No pooled rate, accuracy figure, interval or pass/fail implied; the 2-versus-0 asymmetry never presented as established | **OPEN -- WINDOWS row 4** |
| Content-review `lz-eval-p23-spike-record.md` | ENV-05 / ENV-08 | Same | Failure worded as COMPLETENESS rather than ceiling exhaustion; no bare cost figure | **OPEN -- WINDOWS row 5** |
| Maintainer read of `23-ENVELOPE.md` against the four prior-art skeletons | ENV-07 | Usefulness is judgment, not assertion | Read against 23-RESEARCH Pattern 6; the structural check does not cover this and is not reported as doing so | **OPEN -- WINDOWS row 6** |
| Disposition for the measured ENV-08 ordering failure | ENV-08 | A decision, not a check | Either accept it as a recorded historical defect or re-review the two modules under a commit preceding their next use | **OPEN -- WINDOWS row 7** |
| Accept or reject the envelope's 190-line / 2627-word overshoot of its one-page target | ENV-07 | A judgment about what may be dropped from a published disclosure | Accept the deviation, or name which disclosure may be cut | **OPEN -- routed by the verifier** |

---

## Validation Sign-Off

- [x] All tasks have an `<automated>` verify or a recorded honest reason they cannot -- ENV-05's
      outcome, ENV-06's termination and ENV-07's usefulness are the three recorded reasons, and each
      names what it cannot assert rather than substituting a weaker assertion
- [x] Sampling continuity: no 3 consecutive tasks without automated verify -- the longest run without
      one is 2 (23-08 T1 and the ENV-08 content half)
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags -- `ci.yml` uses the explicit FILE form throughout, no `--watch`, no
      coverage threshold added
- [x] Feedback latency < 30s -- measured ~2 s
- [x] `nyquist_compliant: true` set in frontmatter

**`nyquist_compliant: true`, and why.** Nyquist compliance asks whether the phase samples its own
behaviour often enough to catch a regression, not whether every requirement passed. All eight ENV
requirements carry an executed check or a recorded honest reason none can exist; the two coverage
holes I found are closed with discrimination-proven tests registered in CI; the full registered suite
is 285/285 exit 0; and the one requirement that is PARTIAL is PARTIAL on a HUMAN REVIEW obligation
that no sampling rate could satisfy. Setting it false would say the phase cannot detect its own
regressions, and that is not what I measured. The seven open human items are tracked in
`.planning/WINDOWS.md` and block `/gsd-ship` by design -- which is the right gate for them, and not
this one.

**Approval:** PARTIAL -- coverage contract satisfied, ENV-08's content-review half open and named.

---

## Audit hygiene

I modified **no** planning file. `.planning/STATE.md`, `.planning/ROADMAP.md` and
`.planning/config.json` are untouched; `git diff .planning/config.json .planning/STATE.md` is empty
and no `gsd-tools query` verb was called, so no SDK mutator ran. I rewrote no published record, no
SUMMARY, no PLAN, neither `23-VERIFICATION.md` nor `23-SECURITY.md`, neither pre-registration, and no
frozen status line. This document and the two files listed below are the whole of my writes.

I ran no `git clean` in any form. Every access to `eval/.cache/` was a read through an existing CLI;
nothing under `eval/.cache/` or `.lz-research/` was written, moved or deleted, and the 40 write-once
Slice-A records, both q1 and q2 captures and both excerpt corpora are intact. The one test I authored
composes every path under `os.tmpdir()` and asserts that no fixture resolves inside `eval/.cache/`
rather than trusting that it does not.

**Files written:**

- `.planning/phases/23-judge-free-confidence-and-operating-envelope-for-lz-deep-res/23-VALIDATION.md`
- `eval/lz-eval-p23-sliceA-gate.test.mjs` (new)
- `.github/workflows/ci.yml` (two entries appended plus their comment; every existing entry kept, the
  explicit FILE form kept, no coverage threshold added)

---

_Validated: 2026-09-08 at HEAD `996fcfe`_
_Auditor: Claude (gsd-nyquist-auditor), independent of the executing sessions_
