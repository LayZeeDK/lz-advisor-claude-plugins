---
phase: 23-judge-free-confidence-and-operating-envelope-for-lz-deep-res
verified: 2026-09-08T00:00:00Z
status: gaps_found
score: 6/6 ROADMAP success criteria verified; 6/8 ENV requirements met, 1 PARTIAL-Q2, 1 PARTIAL
behavior_unverified: 0
overrides_applied: 0
re_verification:
  previous_status: none
  previous_score: none
  gaps_closed: []
  gaps_remaining: []
  regressions: []
gaps:
  - truth: "A branch-(b) or PARTIAL disposition is never recorded as if it were unqualified"
    status: partial
    reason: >-
      REQUIREMENTS.md records ENV-04 as a bare `Complete` with no PARTIAL-Q2 qualifier and no note
      that the comparative q2 bar is NOT SET, while ENV-05 and ENV-06 in the same table each carry
      their branch letter and full reasoning. The published envelope and the q2 record both carry
      `ENV-04 status: PARTIAL-Q2` correctly, so nothing false is published -- but the ledger that
      `/gsd-audit-milestone` reads states ENV-04 stronger than the evidence. Plan 23-09 disclosed
      the ENV-01/02/03 UNDERSTATEMENT in its own SUMMARY and did not notice this OVERSTATEMENT in
      the opposite direction.
    artifacts:
      - path: ".planning/REQUIREMENTS.md"
        issue: "line 200 reads `| ENV-04 | Phase 23 | Complete |` with no PARTIAL-Q2 qualifier; line 97's requirement text carries no realized disposition at all, unlike ENV-05 and ENV-06"
    missing:
      - "Carry `PARTIAL-Q2` onto the ENV-04 status-table row, with the fact that the comparative q2 bar is NOT SET under D-02 and that only lz q2 was admissible"
      - "Append the realized disposition to the ENV-04 requirement text at line 97, in the same shape ENV-05 and ENV-06 already use"
  - truth: "Every eval script is code-reviewed AND every prompt/reference that steers an LLM task is content-reviewed BEFORE it drives that task or ships (ENV-08)"
    status: partial
    reason: >-
      ENV-08's mechanical halves hold and are independently confirmed. Its content-review half does
      not: six published artifacts have had executing-session review only, which under the project's
      review-before-use-or-publication rule is not review. All six are NAMED GAPS in the Plan 23-09
      sweep and in `.planning/WINDOWS.md` rows 1-6, and no presence check was substituted for any of
      them. A seventh row records a MEASURED ordering failure I re-derived from git ancestry. This is
      an honest PARTIAL, not a concealed pass, and it blocks `/gsd-ship` by design.
    artifacts:
      - path: ".planning/WINDOWS.md"
        issue: "open_count 7 -- six owed independent content reviews plus one measured ENV-08 ordering failure"
      - path: "eval/lz-eval-p23-citation-audit.mjs"
        issue: "its review record at 1bdb1ee is NOT a git ancestor of its first-use commit 3189239, so it does not count as before-use; same for lz-eval-p23-resolvability.mjs"
    missing:
      - "Six independent content reviews (WINDOWS rows 1-6), each against the specific wording properties its row names -- these are human items and are listed under human_verification below"
      - "A disposition for the WINDOWS row 7 ordering failure: either accept it as a recorded historical defect or re-review the two modules under a commit that precedes their next use"
  - truth: "The requirements ledger states each requirement's realized disposition"
    status: partial
    reason: >-
      ENV-01, ENV-02 and ENV-03 still read `Pending` in REQUIREMENTS.md although I independently
      verified all three as MET. This UNDERSTATES rather than inverts -- no requirement reads
      stronger than its evidence -- and Plan 23-09 flagged it deliberately rather than editing rows
      it was not assigned. Recorded here so the ledger can be brought level with the evidence.
    artifacts:
      - path: ".planning/REQUIREMENTS.md"
        issue: "lines 94-96 unchecked and lines 197-199 read `Pending` for ENV-01/02/03; lines 100-101 read `Pending` for ENV-07/08"
    missing:
      - "ENV-01 -> MET; ENV-02 -> MET; ENV-03 -> MET on branch (a); ENV-07 -> MET; ENV-08 -> PARTIAL with its six named gaps"
deferred: []
behavior_unverified_items: []
coincidental_reliance_items: []
human_verification:
  - test: "Content-review eval/lz-eval-p23-citation-audit-q1-dryrun.md and the two eval modules it introduced"
    expected: "The dry run reads as not-bar-setting throughout, and the contamination disclosure is specific rather than generic"
    why_human: "Whether prose is honest rather than merely present is a judgment; WINDOWS row 1"
  - test: "Content-review eval/lz-eval-p23-citation-audit-q2-record.md against its five named wording properties"
    expected: "PARTIAL-Q2 reads as a measured shortfall behind a dispatched capture, never as a budget descope; coverage is never relabelled support"
    why_human: "WINDOWS row 2; the executing session cannot review its own output"
  - test: "Content-review eval/lz-eval-p23-env06-record.md"
    expected: "The termination is never worded as MEASURED, branch (b) is never presented as (c) or vice versa, and no cost figure appears without its retry history and the 79.32 upper bound"
    why_human: "WINDOWS row 3. My mechanical checks found no violation, but the check is a keyword scan and the property is semantic"
  - test: "Content-review eval/lz-eval-p23-sliceA-read-record.md"
    expected: "No pooled rate, accuracy figure, interval or pass/fail verdict is implied, and the 2-versus-0 asymmetry is never presented as established"
    why_human: "WINDOWS row 4"
  - test: "Content-review eval/lz-eval-p23-spike-record.md"
    expected: "The failure is worded as COMPLETENESS rather than ceiling exhaustion, and 55.30793200000004 never appears without its retry history and the 79.32313525000006 upper bound"
    why_human: "WINDOWS row 5"
  - test: "Maintainer read of 23-ENVELOPE.md against the four prior-art skeletons in 23-RESEARCH.md Pattern 6"
    expected: "The warnings are specific rather than generic and the document is useful rather than boilerplate"
    why_human: "WINDOWS row 6. The structural section check exits 0 and I re-ran it, but it does not cover usefulness and must not be reported as doing so"
  - test: "Decide whether the envelope's 190-line / 2627-word overshoot of its own one-page target is accepted"
    expected: "Either accept the recorded deviation, or identify which disclosure may be cut"
    why_human: "A judgment about what may be dropped from a published disclosure"
---

# Phase 23: Judge-free confidence and operating envelope Verification Report

**Phase Goal:** produce defensible, honestly-bounded confidence in `lz-deep-research` using
confidence sources requiring neither a calibrated LLM judge nor closed-book gold; publish an
OPERATING ENVELOPE plus an explicit statement of what was NOT established and why; close the
v2.1.0 measured-quality question under one of three sanctioned terminations.

**Verified:** 2026-09-08
**Status:** gaps_found
**Re-verification:** No -- initial verification

## Method, and what I refused to accept

I re-derived every headline figure from disk rather than reading it out of a SUMMARY. Forty-one
distinct claims were re-computed; the table at the end lists each one and whether it held. Two
things are worth saying up front, because they shape the verdict:

**The arithmetic is exceptionally clean.** Not one re-derived figure disagreed with the published
records. That includes the two figures easiest to fudge -- the built-in q2 cost upper bound, which
is the EXACT sum of the two stream terminals, and the 40 Slice-A confusion cells, which I re-tallied
from the raw verdict files without touching `read.json`. I also re-ran the frozen draw against the
AVeriTeC dev set and diffed its 40 indices against the 40 verdict filenames: IDENTICAL. No item was
substituted and none was dropped.

**The gaps are in the ledger, not in the deliverable.** The published envelope is honest. What
overstates is one row of `.planning/REQUIREMENTS.md`.

## Goal Achievement

### The six ROADMAP Success Criteria

| # | Criterion | Status | Evidence I produced myself |
|---|---|---|---|
| 1 | Pre-registration frozen and committed in its own timestamped commit BEFORE any capture, vote or score, carrying the bar, scripts, item lists, ENV-04 contamination disclosure, termination clause and the n<=5 ceiling | VERIFIED | `git show --name-only 9ab9933` returns EXACTLY three files (`lz-eval-p23-capture-driver.md`, `lz-eval-p23-prereg.md`, `lz-eval-p23-prereg.test.mjs`) at `2026-09-07T23:37:33+02:00`. I ran `git merge-base --is-ancestor` for ALL 22 post-freeze commits, not the 14 claimed: 22/22 ANCESTOR-OK. The negative control `3189239` returns exit 1, so the test discriminates. The frozen blob (967 lines) carries the ceiling in Section (ii), the draw and item list in Section (v), the frozen citation rules in Section (vi), the contamination disclosure and third axis in Section (vii), the spike ceiling in Section (viii), and the termination clause quoted in full in Section (xv) |
| 2 | Slice A runs, tallied per confusion-matrix direction and never pooled, reported descriptively with its three PROVISIONAL limits | VERIFIED | Re-tallied 40 raw verdict JSONs: gold `unrefuted` 20 items -> 18 `unrefuted` / 2 `refuted`; gold `refuted` 20 items -> 20 `refuted` / 0 `unrefuted`. Exactly the published `tp 18 / fn 2` and `tn 20 / fp 0`. `read.json` carries exactly five keys with no rate, interval or pass/fail field. `rg` over the published record finds no pooled figure. The three PROVISIONAL limits are the frozen module's own strings |
| 3 | A deterministic citation audit runs over every admissible captured report, on a format-normalized basis fixed BEFORE any rate is computed | VERIFIED | Re-ran the audit CLI: lz q2 -> `sources=12 unmatched=0 markers=0/0 uncited-units=59/67`, byte-identical to the record. Only one report was admissible, so "every admissible report" is one report, and the comparative bar is published as NOT SET rather than fabricated. Ordering: the rule commits `2cb5133` (14:26:29) and `fcc206c` (14:30:59) both precede the first rate commit `3189239` (14:36:06) -- I confirmed all three timestamps and contents from git |
| 4 | Every report used in any reading carries a `validateManifest`-passing MANIFEST pinning CC version, model and per-run cost; a report without one is NOT admissible; `extractSystemInit` can pin a version from a real `system/init` event | VERIFIED | I ran `validateManifest` over all four MANIFESTs: lz q2 `true`, lz q1 `true`, built-in q1 `true`, built-in q2 THROWS with exactly the string the envelope quotes. I ran `extractSystemInit` against both real q2 streams: it returns `ccVersion 2.1.263` plus the resolved model from the `system/init` event at line 4 of each. The Phase-22 gap (zero MANIFESTs on disk) is closed |
| 5 | ZERO out-of-family spend; no maintainer-authored gold; the eval tree never ships | VERIFIED | No out-of-family transport string in any p23 module. Gold is AVeriTeC dev-set labels via `collapseAvtLabel`, external and not maintainer-authored. `eval/lz-eval-packaging-boundary.test.mjs` passes 2/2 and no plugin runtime file imports from `eval/` -- the two `eval/` mentions under `plugins/` are comments |
| 6 | An OPERATING ENVELOPE is published plus an explicit statement of what was not established and why; no significance claim, with the pre-registration stating in advance that none is reachable | VERIFIED | `23-ENVELOPE.md` exists with all eight required sections non-empty, exactly one `Resolved branch: MEASURED` line, ASCII/LF/no-BOM. Its NOT ESTABLISHED table carries 11 named rows, strictly separate from the evidenced section. I computed `2*0.5^5 = 0.0625` and `0.05^(1/5) = 0.5492802716530588`, then grepped the FROZEN blob at `9ab9933` and found both at lines 98 and 101 -- stated in advance, not discovered |

**Score: 6/6 criteria verified.**

### The three checks that would have sunk the phase, and what I found

**Does the phase-level branch (a) improperly upgrade anything?** No. I grepped every phase artifact
for an ENV-06 reference near MEASURED, branch (a) or "graded": the only hits are the envelope's own
NOT ESTABLISHED row 2 marked **(b)** and the REQUIREMENTS.md text that spells out the (b)
termination. The envelope's Termination section says so directly -- "This resolution upgrades
nothing... a phase-level (a) does not convert one." The evidenced section and the NOT ESTABLISHED
section share no rows.

**Is any branch (c) presented anywhere, or any (b) presented as MEASURED?** No. Every occurrence of
branch (c) across the whole phase is either a definition or an explicit negation. The ENV-06 record
carries exactly one status line, `NOT-RUN branch (b)`. Nothing claims the built-in q2 report exists:
`test -e` on `eval/.cache/p23-baseline/builtin/q2/q2-run1.report.md` returns absent, and
`citation-audit-q2-builtin.json` is likewise absent, which is the disk fact the status line is
asserted against.

**Are the cost figures ever presented as a clean comparison?** No. I pulled all 17 occurrences of
55.30793200000004 / 55.31 with context. Every one is either inside the section that publishes both
readings and the ambiguity, or an explicit "NOT a clean per-run cost comparison" sentence. The
79.32313525000006 upper bound is the exact sum 24.015203250000027 + 55.30793200000004, both streams
carry `is_error: true`, and the envelope's own row states the built-in side bought no report.

### Required Artifacts

| Artifact | Expected | Status | Details |
|---|---|---|---|
| `23-ENVELOPE.md` | The phase's public artifact | VERIFIED | 190 lines, 8 sections non-empty, one branch line, ASCII/LF/no-BOM. Missed its own one-page target -- recorded as a deviation, see below |
| `eval/lz-eval-p23-prereg.md` | The frozen authority | VERIFIED | 967 lines at the freeze; carries all six ENV-01 elements; co-test 25/25 green |
| `eval/lz-eval-p23-sliceA-read-record.md` | The ENV-03 read | VERIFIED | Cells reproduce; five-key contract stated and true; no pooled rate |
| `eval/lz-eval-p23-citation-audit-q2-record.md` | The ENV-04 q2 reading | VERIFIED | `ENV-04 status: PARTIAL-Q2`; all figures reproduce from the CLI |
| `eval/lz-eval-p23-citation-audit-q1-dryrun.md` | The not-bar-setting q1 dry run | VERIFIED | Both q1 rows reproduce exactly from the CLI |
| `eval/lz-eval-p23-spike-record.md` | The ENV-05 spike | VERIFIED | Both predicates reproduce; D-19 retention counts reproduce |
| `eval/lz-eval-p23-env06-record.md` | The ENV-06 termination | VERIFIED | One status line, branch (b), nothing graded |
| `.planning/WINDOWS.md` | The gap ledger | VERIFIED | `open_count: 7`, seven rows, all phase 23, all `open` |
| `.planning/REQUIREMENTS.md` | The requirements ledger | ORPHANED-DISPOSITION | ENV-04 overstates; ENV-01/02/03/07/08 understate. See gaps |

### Data-Flow Trace (Level 4)

| Reading | Value | Source | Produces real data | Status |
|---|---|---|---|---|
| ENV-03 cells | 18/2, 20/0 | 40 write-once verdict JSONs under `eval/.cache/p23-read/sliceA/verdicts/` | YES -- re-tallied independently | FLOWING |
| ENV-03 item set | 40 items | `lz-eval-p23-sliceA-draw.mjs` over `chenxwh__AVeriTeC/data/dev.json`, seed 20260907 | YES -- draw reproduces and its 40 indices are IDENTICAL to the scored set | FLOWING |
| ENV-03 gold labels | per-direction | AVeriTeC `item.label` via `collapseAvtLabel` in `lz-eval-sliceA-gold.mjs` | YES -- external gold, not the `direction` field circularly | FLOWING |
| ENV-04 q2 figures | 12/0/0-0/59-of-67 | `lz-eval-p23-citation-audit.mjs` over the 14306-byte lz q2 report | YES -- CLI reproduces byte-identically | FLOWING |
| ENV-04 resolvability | 12 of 12 @ 2026-09-08T09:30:52.465Z | `resolvability-q2.json`, 12 records all `resolvable` | YES | FLOWING |
| ENV-02 admissibility | lz ADMISSIBLE / built-in INADMISSIBLE | `validateManifest` executed by me on both | YES | FLOWING |
| ENV-05 verdict | not cleared on completeness | `spikeCleared` / `spikeCeilingCheck` executed by me | YES | FLOWING |
| Costs | 14.93 / 55.31 / 79.32 / 67.09 / 18.12 | four MANIFEST `costStreams` enumerations | YES -- every sum re-computed | FLOWING |
| Built-in q1 reset-window count | "2" in the envelope table | the q1 MANIFESTs carry `resetWindows: undefined` | PARTIAL -- inherited from the Phase-22 record, not re-derivable from those manifests | STATIC (see note) |

The one STATIC cell: the envelope's q1 rows show 2 reset windows for both q1 captures, but
`resetWindows` did not exist as a MANIFEST field until Phase 23, so those two cells come from the
Phase-22 record rather than from disk. The q1 rows are declared not-bar-setting throughout, so
nothing rests on them; noted for completeness rather than as a defect.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|---|---|---|---|
| Citation audit reproduces on lz q2 | `node eval/lz-eval-p23-citation-audit.mjs .../lz/q2/q2-run1.report.md` | `sources=12 unmatched=0 markers=0/0 uncited-units=59/67` | PASS |
| Citation audit reproduces on built-in q1 | same, on `p22-baseline/builtin/qB1-run1.report.md` | `sources=18 unmatched=3 markers=69/13 uncited-units=19/43` | PASS |
| Citation audit reproduces on lz q1 | same, on `p22-baseline/lz/qB1-run1.report.md` | `sources=12 unmatched=0 markers=0/0 uncited-units=30/64` | PASS |
| Spike completeness CLI on an absent report | `node eval/lz-eval-p23-verify-complete.mjs .../builtin/q2/q2-run1.report.md 1 2` | `missing or invalid <report.md>`, exit 2 | PASS |
| `spikeCleared` at the realized inputs | `spikeCleared({reportText:'',resumeCycles:1,resetWindows:2})` | `cleared false`, completeness `false`, ceiling `cleared true` | PASS |
| `spikeCeilingCheck` at window 3 | `spikeCeilingCheck({resumeCycles:1,resetWindows:3})` | `cleared false` | PASS |
| The frozen draw reproduces | `node eval/lz-eval-p23-sliceA-draw.mjs .../dev.json` | `drawn unrefuted=20 refuted=20 seed=20260907 pool-unrefuted=83 pool-refuted=181 unrefuted-first=32 unrefuted-last=28 refuted-first=56 refuted-last=20` | PASS |
| Drawn set equals scored set | diff of 40 drawn keys against 40 verdict filenames | IDENTICAL | PASS |
| `validateManifest` over four MANIFESTs | executed in-process | 3 pass, built-in q2 throws the quoted string | PASS |
| `extractSystemInit` on both q2 streams | executed in-process | `ccVersion 2.1.263` + resolved model from `system/init` | PASS |
| Envelope structural + branch check | the plan's own inline check, re-run | `[OK] eight sections non-empty; resolved branch = MEASURED` | PASS |
| All six p23 co-tests, explicit FILE form | `node --test eval/lz-eval-p23-*.test.mjs` individually | 29 + 25 + 14 + 20 + 23 + 19 = **130 pass, 0 fail** | PASS |
| Packaging boundary | `node --test eval/lz-eval-packaging-boundary.test.mjs` | 2 pass, 0 fail | PASS |

### Probe Execution

No `scripts/*/tests/probe-*.sh` exists in this repo and this phase declares none. The equivalent
runnable checks are the co-tests and CLIs in the table above, all executed in my own process.

### Requirements Coverage -- my own verdicts

| Requirement | My verdict | Evidence |
|---|---|---|
| ENV-01 | **MET** | Freeze commit `9ab9933`, exactly three files, `2026-09-07T23:37:33+02:00`; 22/22 post-freeze commits are strict descendants; negative control `3189239` fails the test; all six required elements present in the frozen blob. The one pre-freeze rate (the q1 dry run) is disclosed IN the freeze under D-20, its ordering claim deliberately scoped to RATIOS with the single integer exception (the 18-source count pinned in `2cb5133`) named. A pre-registration that states a narrower guarantee accurately is stronger than one that overstates, and this one does the former |
| ENV-02 | **MET** | `validateManifest` executed by me: lz q2 passes with `model=claude-sonnet-5 ccVersion=2.1.263`, built-in q2 throws the quoted error and is filed as `.MANIFEST.INADMISSIBLE.json`. Both q1 MANIFESTs also pass, closing the Phase-22 zero-MANIFEST gap. `extractSystemInit` pins a version from a real `system/init` event on both q2 streams |
| ENV-03 | **MET, branch (a)** | Cells re-tallied from 40 raw verdicts; n=40 balanced 20/20; `drawSeed` 20260907; five-key output with no pooled rate; the scored set IS the frozen draw; dispatch strings carry claim text plus the day-month-year cutoff and nothing that leaks gold. The three PROVISIONAL limits are carried, plus a fourth measured here (retrieval fired on 30 of 40, which I re-derived: 16 of 20 unrefuted, 14 of 20 refuted) |
| ENV-04 | **MET AS PARTIAL-Q2** in the published records; **OVERSTATED in the requirements ledger** | The audit is deterministic, format-normalized on rules frozen before any rate, and reproduces byte-identically. Only lz q2 was admissible; the comparative bar is published as NOT SET under D-02 rather than fabricated or back-fitted onto q1. That disposition is correct in `23-ENVELOPE.md` and in the record's `ENV-04 status: PARTIAL-Q2` line. It is NOT carried onto REQUIREMENTS.md, which reads a bare `Complete` -- see gap 1 |
| ENV-05 | **MET, branch (a) MEASURED** | Both predicates re-run by me and reproduce exactly: not cleared, completeness `false`, ceiling `cleared true` at 1 resume across 2 windows against frozen limits 3 and 2, and `cleared false` at window 3. The requirement asks for the observation, and a spike that does not clear has still supplied one. Reading this as branch (a) does not upgrade anything: the spike RAN and returned its planned reading, which happens to be negative |
| ENV-06 | **MET by PUBLISHED TERMINATION, branch (b)** | The reference half is absent on disk -- I confirmed `q2-run1.report.md` and `citation-audit-q2-builtin.json` both missing. Nothing was graded, no ordering was dispatched, no per-dimension score exists. The reason (a pairwise comparison needs two reports) is identifiable independently of any result, which is exactly what branch (b) requires. Not branch (c): both captures were dispatched at full metered cost and no AMENDMENT RECORD records a descope. Under the ROADMAP's own clause this is a COMPLETED outcome |
| ENV-07 | **MET** | The envelope publishes the evidenced region, the human-routing region (8 numbered triggers), the warnings, and 11 named NOT ESTABLISHED rows with reasons independent of any result. It resolves under exactly one branch, makes no significance claim, and states it is not a ship gate (D-03) |
| ENV-08 | **PARTIAL** | Mechanical halves VERIFIED by me: 130 co-tests green, packaging boundary green, zero out-of-family transport, no maintainer gold, one-directional eval-to-runtime boundary intact, all six p23 test files registered in CI. Content-review half NOT MET: six independent reviews owed, all NAMED, plus a measured ordering failure. See gap 2 |

**No ORPHANED requirements.** ROADMAP maps ENV-01..08 to Phase 23 and all eight appear in the plans.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|---|---|---|---|---|
| -- | -- | No `TBD` / `FIXME` / `XXX` anywhere in the phase's eval modules, records or the envelope | -- | Clean; the debt-marker gate does not fire |
| `eval/lz-eval-p23-sliceA-read.mjs` | 83, 159 | `PLACEHOLDER_RE` | Info | A template-substitution identifier, not a debt marker |
| `.planning/REQUIREMENTS.md` | 200 | A PARTIAL disposition recorded as unqualified `Complete` | Blocker | The file `/gsd-audit-milestone` reads states ENV-04 stronger than its evidence. Gap 1 |
| `.planning/REQUIREMENTS.md` | 94-96, 197-201 | MET dispositions recorded as `Pending` | Warning | Understates; disclosed by Plan 23-09. Gap 3 |

## Self-reported shortfalls -- confirmed, and my judgment on each

| Shortfall | Confirmed? | Does it affect goal achievement? |
|---|---|---|
| The envelope missed its own one-page target: 190 lines / 2627 words | YES -- `wc -l -w` returns exactly `190 2627` | **No.** The target is a plan acceptance criterion, not a ROADMAP criterion. The trade taken was to keep required disclosures rather than drop one or claim one page for a four-page document, and that is the right direction. Routed to human for acceptance |
| The ENV-03 voter seat's RESOLVED model string was never recorded -- only the alias `sonnet` | YES -- the Slice-A record documents `subagent_type: "Explore"`, `model: "sonnet"` and no resolved string exists anywhere | **No, and this is the correct behaviour.** The Agent tool exposes aliases, so inventing a resolved string would falsify capture provenance. The envelope names it as a gap in its own identity block rather than filling it. One tension worth noting: the Slice-A record asserts "on Sonnet 5" at line 145, which is AMENDMENT RECORD 1's specification rather than an observed resolved string. The envelope's stricter wording governs the public claim |
| 33 of 45 eval test files are unregistered in CI | YES -- 45 `eval/*.test.mjs` exist, `ci.yml` registers 12 | **No.** All six Phase-23 test files ARE registered, and I ran all six. The 33 are inherited from Phases 16-22 and are a milestone-level debt, not a Phase-23 regression |
| A MEASURED ENV-08 ordering failure: the review record at `1bdb1ee` is not an ancestor of first-use commit `3189239` | YES -- I ran it both ways: `1bdb1ee` -> `3189239` exits 1, and `3189239` -> `1bdb1ee` exits 0, so the review landed 4m27s AFTER first use | **Partly** -- it is why ENV-08 is PARTIAL rather than MET. It was found by the phase's own git-ancestry check and recorded as WINDOWS row 7 rather than smoothed over, which is the behaviour the phase's discipline asks for |

## The claimed limitations -- carried, not resolved away

Each of the six limitations I was asked to check is genuinely carried in the envelope, and each
re-derives:

1. **The q2 coverage figure is largely a report-format effect.** HELD. I replicated the audit
   module's own unit pipeline: q2 has 23 body paragraphs of which **10** end on a
   `Confidence:`/`Assurance:` line -- the published figure exactly. The metadata-unit count comes to
   20 by my looser regex against a published 19 uncited, the one-unit difference being a metadata
   unit sitting inside a cited paragraph. The q1 zero is CORRECT and worth spelling out: q1's
   `Confidence:` metadata is inline on the same line as the claim and its URL, so those units are
   CITED, whereas q2 moved it to a standalone block. The envelope states this is "not evidence that
   q2 cites worse than q1", and it is right.
2. **Retrieval measured at 30 of 40, so roughly a quarter was decided closed-book.** HELD. I counted
   `retrieval.json`: 30 non-zero, 10 zero, split 16/4 unrefuted and 14/6 refuted. The envelope also
   correctly narrows the third PROVISIONAL limit to holding for 30 of 40 rather than universally.
3. **q1 versus q2 differ on both model generation AND CC version.** HELD. q1: `claude-opus-4-8` and
   `claude-sonnet-4-6[1m]`, both CC 2.1.186. q2: `claude-opus-5` and `claude-sonnet-5`, both CC
   2.1.263 -- the latter two read out of the real `system/init` events by me. The freeze names three
   axes and the envelope names CC version as part of the third, which strengthens the disclosure.
4. **The D-19 branch-A-with-no-report distinction.** HELD, and it is the subtlest thing in the
   phase. Branch A was pre-committed before the spike ran, selected because the built-in's workers
   DO leave recoverable content -- I confirmed 15 files in `tool-results/`, **203** worker
   transcripts and **87 MB** retained, all three exact. Branch B's premise (the built-in leaves
   nothing recoverable) is demonstrably false, so the symmetric quote-match failed for a different
   reason: content was retained but no REPORT was produced. The envelope keeps those two apart in
   NOT ESTABLISHED row 4.
5. **Coverage-is-not-support as a named not-established item.** HELD. NOT ESTABLISHED row 1, branch
   (b), and `UNCITED.LABEL` in the module itself reads "NOT factual support, NOT groundedness, NOT
   verification".
6. **The no-significance ceiling with its arithmetic, and the 2-versus-0 asymmetry not presented as
   significant.** HELD. Both figures compute, both sit in the freeze commit at lines 98 and 101, and
   the envelope states "Slice A's 2-versus-0 asymmetry is NOT significant and NOT established" while
   NOT ESTABLISHED row 7 carries it as an explicit non-result.

## Every claim I re-derived

| # | Claim | Held? |
|---|---|---|
| 1 | Freeze commit carries exactly three files | YES |
| 2 | Freeze at `9ab9933`, `2026-09-07T23:37:33+02:00` | YES |
| 3 | All post-freeze commits are strict descendants (I checked 22, not 14) | YES, 22/22 |
| 4 | Negative control `3189239` returns NOT-ANCESTOR | YES, exit 1 |
| 5 | Slice A cells 18/2 and 20/0 | YES, exactly |
| 6 | n=40, balanced 20/20, 40 distinct items | YES |
| 7 | `sliceARead` returns exactly five keys; no pooled rate in the record | YES |
| 8 | The 40 scored items ARE the frozen draw | YES, IDENTICAL |
| 9 | The frozen draw line reproduces (83/181 pool, seed, four boundary indices) | YES, byte-for-byte |
| 10 | Retrieval fired on 30 of 40 | YES |
| 11 | Dispatch strings leak no gold field | YES |
| 12 | Day-month-year proof: 24 of 40 first fields > 12, 16 <= 12, all 40 in 2020 | YES |
| 13 | lz q2 audit 12 / 0 / 0-0 / 59-of-67 | YES, byte-identical |
| 14 | q2 format effect: 10 of 23 paragraphs end on a metadata line | YES, exactly |
| 15 | Zero uncited metadata units in q1 | YES (q1's are inline and cited) |
| 16 | q1 dry run: built-in 18/3/69-13/19-of-43; lz 12/0/0-0/30-of-64 | YES, both exactly |
| 17 | Resolvability q2: 12 of 12 @ `2026-09-08T09:30:52.465Z`, built-in attribution empty | YES |
| 18 | Resolvability q1: union 23+3; built-in 17+1 of 18; lz 10+2 of 12 | YES, all three |
| 19 | Built-in q2 report absent on disk | YES |
| 20 | No `citation-audit-q2-builtin.json` | YES |
| 21 | Built-in q2 cost 55.30793200000004; upper bound 79.32313525000006 | YES -- upper bound is the EXACT stream sum |
| 22 | Both built-in q2 streams `is_error: true` | YES |
| 23 | lz q2 cost 14.930978050000009, single stream, `is_error false`, `rc=0` | YES |
| 24 | Built-in q1 67.085261 over three streams, not the 48.5367785 cold stream alone | YES, sums exactly |
| 25 | lz q1 18.1152213 over two streams | YES |
| 26 | q1 on CC 2.1.186 / generation 4; q2 on CC 2.1.263 / generation 5 | YES |
| 27 | Spike: not cleared, completeness `false`, ceiling `cleared` at 1/2, fails at window 3 | YES, all four |
| 28 | D-19 branch A: 15 `tool-results` files, 203 transcripts, 87 MB | YES, all three |
| 29 | `validateManifest` passes the three used reports, fails built-in q2 with the quoted string | YES |
| 30 | `extractSystemInit` pins a version from a real `system/init` event | YES |
| 31 | Ceiling arithmetic 0.0625 and 0.549, both in the freeze commit | YES |
| 32 | Envelope 190 lines / 2627 words | YES |
| 33 | ENV-08 ordering failure: `1bdb1ee` not an ancestor of `3189239` | YES |
| 34 | 33 of 45 eval test files unregistered in CI | YES (12 registered, all six p23 among them) |
| 35 | WINDOWS `open_count: 7` = six content reviews + one ordering failure | YES |
| 36 | Sequencing-record commits exist at stated timestamps; rule commits precede the rate commit | YES, all five |
| 37 | All p23 co-tests green | YES, 130 pass / 0 fail |
| 38 | Packaging boundary holds | YES, 2/2 |
| 39 | Envelope: eight sections non-empty, one branch line, ASCII/LF/no-BOM | YES |
| 40 | No branch (c) claimed; ENV-06 never MEASURED; no false report-existence claim | YES |
| 41 | No cost figure ever presented bare | YES, all 17 occurrences carry their history |

**41 of 41 held. Zero re-derived figures disagreed with the published records.**

## Gaps Summary

The phase goal IS achieved. All six ROADMAP success criteria hold under independent re-derivation,
the operating envelope is published with an honest NOT ESTABLISHED section, the termination resolves
under exactly one branch, and the transparency prohibition is respected in every published artifact
I checked. Given a phase that spent real money to learn that its reference system could not produce
a report, the discipline on display -- publishing an absence as an absence, keeping a cost figure's
ambiguity rather than picking the flattering reading, scoping an ordering guarantee to what git
actually proves -- is the substance of the goal rather than decoration on it.

Three gaps stand between that and a clean pass, and only one is closable by an edit:

**Gap 1 is the one that matters.** `.planning/REQUIREMENTS.md` line 200 reads `| ENV-04 | Phase 23 |
Complete |`. ENV-05 and ENV-06 in the same table each carry their branch letter and reasoning;
ENV-04 carries nothing. A reader of that ledger alone would take ENV-04's comparative bar as met,
when the envelope lists it as NOT ESTABLISHED, branch (b), NOT SET. Nothing false is published --
both the envelope and the record carry `PARTIAL-Q2` correctly -- but the ledger the milestone audit
consumes is where a quiet upgrade would do its damage, and Plan 23-09 flagged the opposite-direction
understatement while missing this one. One row, and it should be fixed before
`/gsd-audit-milestone` reads it.

**Gap 2 is honest and mostly not agent-closable.** ENV-08's content-review half is genuinely unmet:
six published artifacts have executing-session review only, every one is NAMED in the sweep and in
WINDOWS rows 1-6, and I confirmed no presence check was reported as covering a content review. The
seventh row records an ordering failure the phase measured against itself. Six of these are human
items and are listed in the frontmatter.

**Gap 3 understates rather than inverts.** ENV-01/02/03/07 read `Pending` though I verify all four
as MET, and ENV-08 reads `Pending` though it is PARTIAL. Plan 23-09 disclosed this deliberately and
left the rows for the verifier. My verdicts above are the input for that correction.

## Planning-file confirmation

**I modified no planning file.** I did not call any `gsd-tools query` verb, so no SDK mutator ran.
`git status --porcelain` is empty and `git diff --stat .planning/` is empty at the end of this
verification, exactly as at the start. I ran no `git clean` in any form; every access to
`eval/.cache/` and to the gitignored trees was a read, and the ~87 MB of retained capture evidence,
both excerpt corpora and the 40 write-once Slice-A records are intact. I edited no published record,
no SUMMARY, no pre-registration, and neither `eval/lz-eval-parity-prereg.md` nor
`.planning/notes/phase-22-diagnosis-two-root-causes.md`. No Phase-22 figure was used to authorize or
excuse anything here.

---

_Verified: 2026-09-08_
_Verifier: Claude (gsd-verifier)_
