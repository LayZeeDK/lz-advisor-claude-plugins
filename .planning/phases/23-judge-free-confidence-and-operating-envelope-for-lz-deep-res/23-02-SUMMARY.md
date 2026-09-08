---
phase: 23-judge-free-confidence-and-operating-envelope-for-lz-deep-res
plan: 02
subsystem: testing
tags: [node-test, seeded-prng, dispatch-provenance, sha256, confusion-matrix, ci, tdd]

# Dependency graph
requires:
  - phase: 22-deep-research-skill-eval-and-parity-baseline-with-built-in-d
    provides: "eval/lz-eval-sliceA-gold.mjs (filterSliceA / sliceAFeasibilityGate / tallyPerDirection, all frozen and unchanged), the two q1 built-in reports under the gitignored eval/.cache/p22-baseline/, and the escalated T-22-15 substitution defect"
  - phase: 23-judge-free-confidence-and-operating-envelope-for-lz-deep-res
    provides: "Plan 23-01's admissible q1 MANIFESTs, the frozen ENV-04 canonicalizer slice, and the CI eval-tree step this plan appends to"
provides:
  - "DRAW: the pre-registered Slice-A draw seed 20260907 and per-direction size 20, frozen before any selection was computed"
  - "mulberry32 + drawBalanced: the deterministic balanced 20+20 draw over filterSliceA's OUTPUT, with the generator's stream pinned byte-for-byte"
  - "claimsEqual: the single claim-text comparison rule (normalize('NFC') then byte-exact, never case-folded)"
  - "The REALIZED 40-item draw, recorded in full here for Plan 23-04 to quote into the ENV-01 freeze commit"
  - "The D-10 re-verification re-run from disk: 83 unrefuted / 181 refuted, gate cleared"
  - "buildDispatchString: the frozen voter prompt with replacer-function substitution, closing escalated defect T-22-15 before verdict one"
  - "writeDispatchRecord + readSliceAVerdicts: write-once dispatch provenance with a fail-closed sha256 cross-check, closing SEED-005"
  - "sliceARead: the DESCRIPTIVE never-pooled Slice-A read, output key set exactly [unrefuted, refuted, n, drawSeed, provisionalLimits]"
  - "LEDGER_HEADING_RE + isVerificationComplete: the frozen mechanical definition of a verification-complete built-in report"
  - "SPIKE_CEILING + spikeCeilingCheck + spikeCleared: the ENV-05 ceiling frozen BEFORE the spike (3 resume cycles / 2 reset windows)"
  - "Three more eval test files registered in CI by explicit FILE path"
affects: [23-04, 23-05, 23-06, 23-08, 23-09]

actuals:
  tokens: 26900
  tasks: 3
  commits: 7

tech-stack:
  added: []
  patterns:
    - "A seeded generator's output stream pinned byte-for-byte in a co-test, so the SELECTION is a contract and no refactor can change it silently"
    - "Write-once provenance: persist the exact dispatched string plus its sha256 at dispatch time, refuse to overwrite, and fail closed at score time on an unmatched verdict or a digest mismatch"
    - "Substitute through a replacer function in exactly one non-global scan, so corpus dollar sequences are inserted literally and inserted text is never re-scanned"
    - "Exact-key-set assertion on the PRODUCER's output as the anti-pooling guarantee -- it forecloses every pooled name, including ones nobody has thought of yet"
    - "Owned constants recovered through the owning module's own accessor rather than re-typed, so a change there propagates instead of drifting"
    - "A malformed input returns a NAMED reason rather than throwing, so a finding cannot be mistaken for a pass; only a malformed READ throws"

key-files:
  created:
    - eval/lz-eval-p23-sliceA-draw.mjs
    - eval/lz-eval-p23-sliceA-draw.test.mjs
    - eval/lz-eval-p23-sliceA-read.mjs
    - eval/lz-eval-p23-sliceA-read.test.mjs
    - eval/lz-eval-p23-verify-complete.mjs
    - eval/lz-eval-p23-verify-complete.test.mjs
  modified:
    - .github/workflows/ci.yml

key-decisions:
  - "D-10 re-verified as a RUN, not a citation: the on-disk AVeriTeC dev cache yields 83 unrefuted / 181 refuted with the gate cleared, against the Phase-22 record's 95/216. The discrepancy is recorded, not reconciled, and the Phase-22 pre-registration was not edited"
  - "DRAW.SEED is 20260907 and the realized 40-item list is whatever that seed produced -- re-seeding after seeing the draw is forbidden, which is why the list is recorded here in full for the freeze to quote"
  - "The single generator instance is consumed in DIRECTIONS order (unrefuted then refuted); that order is part of the deterministic contract, not an implementation detail"
  - "T-22-15 is fixed with ONE substitution site: a single non-global regex scan with a replacer function, so inserted text is never re-scanned and a claim containing a placeholder literal cannot be re-substituted either"
  - "sliceARead's anti-pooling guarantee is an EXACT key-set assertion on its own output rather than named-absence checks in the frozen gold module's co-test (the pre-approved relocation deviation)"
  - "The first two provisional limits are recovered through sliceAFeasibilityGate's own return value rather than re-typed, so the frozen gold module stays their owner; only the third (evidence-set mismatch) is new to this read"
  - "A duplicate ledger heading is REPORTED (duplicateLedgerHeadings) but does not by itself fail completeness -- the ambiguity is surfaced for the reader to weigh, which is what the plan asks, rather than silently resolved either way"
  - "LEDGER_HEADING_RE is deliberately NON-global: a frozen global regex throws on exec/test because those write lastIndex, so the scan is line by line"

patterns-established:
  - "Discrimination by disabling the guard in the shipped module and recording the observed failure verbatim, then restoring with git checkout -- three separate proofs run this way in this plan"
  - "The negative example comes from disk where one exists (qB1-run1.report.partial-verify.md) rather than from a synthesized fixture, so the predicate is proven against a real artifact of a real incomplete run"

requirements-completed: []

coverage:
  - id: D1
    description: "The Slice-A item yield is re-verified at ZERO spend from the on-disk AVeriTeC cache and reads 83 unrefuted / 181 refuted with the feasibility gate cleared, against the Phase-22 record's 95/216 (D-10)"
    requirement: ENV-03
    verification:
      - kind: integration
        ref: "node eval/lz-eval-sliceA-gold.mjs eval/.cache/chenxwh__AVeriTeC/data/dev.json (exit 0, 'clean unrefuted=83 clean refuted=181 gate-cleared=true')"
        status: pass
      - kind: unit
        ref: "eval/lz-eval-p23-sliceA-draw.test.mjs#D-10: the on-disk AVeriTeC dev cache re-verifies at 83 unrefuted / 181 refuted (NOT the recorded 95/216)"
        status: pass
    human_judgment: false
  - id: D2
    description: "A balanced, deterministic, leak-controlled 40-item draw exists and is reproducible from the pinned seed 20260907 (D-08 / D-09 / T-23-03 / T-23-13)"
    requirement: ENV-03
    verification:
      - kind: unit
        ref: "eval/lz-eval-p23-sliceA-draw.test.mjs#D-09: mulberry32(DRAW.SEED) emits a PINNED first-five sequence (the stream is a contract, not an implementation detail)"
        status: pass
      - kind: unit
        ref: "eval/lz-eval-p23-sliceA-draw.test.mjs#T-23-03: every real drawn entry carries EXACTLY [direction, drawIndex, voterRecord] and every voterRecord EXACTLY [claim, claim_date]"
        status: pass
      - kind: unit
        ref: "eval/lz-eval-p23-sliceA-draw.test.mjs#D-08 DISCRIMINATION: a pool with 19 survivors in one direction is a ContractError naming drawBalanced, NOT a smaller draw"
        status: pass
      - kind: integration
        ref: "node eval/lz-eval-p23-sliceA-draw.mjs eval/.cache/chenxwh__AVeriTeC/data/dev.json (exit 0, 20 per direction, seed 20260907)"
        status: pass
      - kind: other
        ref: "discrimination proof: balance guard disabled -> exactly 1 of 20 fails with 'Missing expected exception'; restored -> 20/20 (output recorded verbatim in this SUMMARY)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Dispatch provenance is fail-closed and in place BEFORE verdict one: the exact dispatched string plus its sha256 is persisted write-once, and score time refuses an unmatched verdict or a tampered digest (SEED-005 / D-14 / T-23-09)"
    requirement: ENV-03
    verification:
      - kind: unit
        ref: "eval/lz-eval-p23-sliceA-read.test.mjs#SEED-005: writeDispatchRecord persists the EXACT dispatched string plus its sha256, keyed by direction and drawIndex"
        status: pass
      - kind: unit
        ref: "eval/lz-eval-p23-sliceA-read.test.mjs#SEED-005: writeDispatchRecord REFUSES a second write to the same key (write-once, so a re-roll is distinguishable from a resume)"
        status: pass
      - kind: unit
        ref: "eval/lz-eval-p23-sliceA-read.test.mjs#T-23-09 DISCRIMINATION: a verdict with NO dispatch record throws a ContractError naming the unmatched drawIndex"
        status: pass
      - kind: unit
        ref: "eval/lz-eval-p23-sliceA-read.test.mjs#T-23-09 DISCRIMINATION: a dispatch record whose stored sha256 disagrees with its stored string throws"
        status: pass
    human_judgment: false
  - id: D4
    description: "The escalated T-22-15 substitution defect is fixed and discrimination-proven: each of $&, $`, $' and $$ round-trips verbatim into the dispatch string"
    verification:
      - kind: unit
        ref: "eval/lz-eval-p23-sliceA-read.test.mjs#T-22-15 DISCRIMINATION: each of the four special dollar sequences round-trips VERBATIM into the dispatch string"
        status: pass
      - kind: other
        ref: "discrimination proof: substitution reverted to a plain string replacement value -> exactly 3 of 23 fail, all three T-22-15 cases, everything else green; restored -> 23/23 (output recorded verbatim in this SUMMARY)"
        status: pass
    human_judgment: false
  - id: D5
    description: "The ENV-03 read is DESCRIPTIVE: sliceARead's output key set is exactly [unrefuted, refuted, n, drawSeed, provisionalLimits] with no pooled rate, accuracy, interval or pass/fail field, and an incomplete pool throws rather than reading partially"
    requirement: ENV-03
    verification:
      - kind: unit
        ref: "eval/lz-eval-p23-sliceA-read.test.mjs#ENV-03: sliceARead returns EXACTLY [drawSeed, n, provisionalLimits, refuted, unrefuted] -- no pooled rate, no accuracy, no interval, no pass/fail"
        status: pass
      - kind: unit
        ref: "eval/lz-eval-p23-sliceA-read.test.mjs#ENV-03 DISCRIMINATION: an INCOMPLETE pool (fewer than 40 definite verdicts) is a ContractError, not a partial read"
        status: pass
      - kind: unit
        ref: "eval/lz-eval-p23-sliceA-read.test.mjs#ENV-03: sliceARead carries the three PROVISIONAL limits, as a defensive copy"
        status: pass
    human_judgment: false
  - id: D6
    description: "The ENV-05 spike's pass criterion is a frozen mechanical predicate, discrimination-proven against a real partial report on disk, with the ceiling (3 resume cycles / 2 reset windows) frozen before the spike runs (D-05 / D-06 / D-07 / T-23-02b / T-23-08)"
    requirement: ENV-05
    verification:
      - kind: integration
        ref: "node eval/lz-eval-p23-verify-complete.mjs eval/.cache/p22-baseline/builtin/qB1-run1.report.md (exit 0, complete=true 25/25/25)"
        status: pass
      - kind: integration
        ref: "node eval/lz-eval-p23-verify-complete.mjs eval/.cache/p22-baseline/builtin/qB1-run1.report.partial-verify.md (exit 1, complete=false with a named reason)"
        status: pass
      - kind: unit
        ref: "eval/lz-eval-p23-verify-complete.test.mjs#ENV-05 DISCRIMINATION: equal header counts are NOT sufficient -- the table must have exactly that many data rows"
        status: pass
      - kind: unit
        ref: "eval/lz-eval-p23-verify-complete.test.mjs#D-05 DISCRIMINATION: spikeCeilingCheck does NOT clear at 4 resume cycles (the resume boundary is load-bearing)"
        status: pass
      - kind: unit
        ref: "eval/lz-eval-p23-verify-complete.test.mjs#D-05 DISCRIMINATION: spikeCeilingCheck does NOT clear at 3 reset windows (the window boundary is load-bearing)"
        status: pass
    human_judgment: true
    rationale: "The predicate itself is fully proven by tests, but Pattern 5 / assumption A5 stands: the definition derives from a SINGLE observed report and the built-in's output format is not contractual. Whether it still holds on the fresh q2 capture cannot be established offline -- that is an ENV-07 finding about the reference system, and the maintainer must accept the documented manual-read fallback if q2's format differs."
  - id: D7
    description: "Three more eval test files run in CI by explicit FILE path, with the seven pre-existing entries kept and no coverage thresholds added to the eval step"
    verification:
      - kind: other
        ref: "node -e ci.yml non-comment-line registration check for all three files (exit 0)"
        status: pass
      - kind: unit
        ref: "node --test eval/lz-eval-p23-sliceA-draw.test.mjs eval/lz-eval-p23-sliceA-read.test.mjs eval/lz-eval-p23-verify-complete.test.mjs eval/lz-eval-sliceA-gold.test.mjs (80/80 pass, exit 0)"
        status: pass
    human_judgment: false

duration: 41 min
completed: 2026-09-07
status: complete
---

# Phase 23 Plan 02: Slice-A draw, dispatch provenance, and the frozen spike ceiling Summary

**The frozen 40-item Slice-A set now exists as a reproducible seeded draw over the re-verified 83/181 pool, every dispatched string will be recoverable from disk with a fail-closed sha256 cross-check, the escalated `$&`-substitution defect is fixed and proven, and the ENV-05 spike's pass criterion is a mechanical predicate that discriminates against a real partial report already on disk.**

## Performance

- **Duration:** 41 min across two sessions (the first was cut off by a session usage limit mid-Task-2; work resumed at the exact uncommitted GREEN module with no restart)
- **Started:** 2026-09-07T12:04:00Z (first task commit)
- **Completed:** 2026-09-07T14:31:00Z
- **Tasks:** 3 of 3
- **Files modified:** 7 tracked (6 created, 1 modified)
- **Spend:** ZERO. No model call, no network request, no capture, no dispatch. Every figure below was computed from files already on disk.

## Accomplishments

- **D-10 re-verified as a RUN, not a citation.** The on-disk AVeriTeC dev cache yields **83 unrefuted / 181 refuted** with the feasibility gate cleared. The Phase-22 pre-registration records 95 clean Supported / 216 clean Refuted from a 2026-06-22 inspection; that figure does not reproduce. The 8/8 floor still clears with wide margin and both directions stay populated, so the gate outcome is unchanged. **83/181 is the number this phase plans on, the discrepancy is recorded rather than reconciled, and the Phase-22 pre-registration was not edited.**
- **The realized 40-item draw exists and is reproducible from a pinned seed** (`DRAW.SEED` 20260907, fixed before any selection was computed). It is recorded IN FULL below for Plan 23-04 to quote into the ENV-01 freeze commit, because re-seeding after seeing the draw is forbidden.
- **SEED-005 is closed before verdict one, which is the only time it can be closed.** The exact dispatched string plus its sha256 is persisted per item at dispatch time, write-once, and score time fails closed on a verdict with no dispatch record or a digest that disagrees with its stored string. The Phase-22 run's single unverifiable assumption becomes a checkable one.
- **The escalated T-22-15 defect is fixed and discrimination-proven.** Substitution goes through a replacer function in one non-global scan. Broken back to a plain string replacement value, a claim containing `` $` `` injects the **entire preceding prompt text** into itself -- the mangled instrument made concrete.
- **ENV-03's read is descriptive by construction.** `sliceARead` returns exactly five keys and the co-test asserts that exact set, which forecloses every pooled name rather than the handful a reader would think to check.
- **The ENV-05 spike criterion is mechanical and frozen before the spike**, and it discriminates against `qB1-run1.report.partial-verify.md`, a real artifact of a real incomplete run, not a synthesized fixture.
- **Three more eval test files run in CI** that did not before; the seven pre-existing entries are untouched and the eval step still carries no coverage thresholds.

## Task Commits

Each task was committed atomically; all three are TDD and carry a RED then a GREEN commit.

1. **Task 1 (tdd): re-verify the yield at zero spend and build the deterministic balanced 20+20 draw**
   - `6d67ee5` -- `test(23-02)`: RED. The module does not exist; the whole file fails to load.
   - `55be725` -- `feat(23-02)`: GREEN. `DRAW`, `mulberry32`, `drawBalanced`, `claimsEqual`, thin CLI. 20/20.
2. **Task 2 (tdd): dispatch provenance and the descriptive read, closing SEED-005 and T-22-15**
   - `30e11a3` -- `test(23-02)`: RED. Module absent.
   - `acfb779` -- `feat(23-02)`: GREEN. `buildDispatchString`, `writeDispatchRecord`, `readSliceAVerdicts`, `sliceARead`. 23/23.
3. **Task 3 (tdd): freeze the mechanical verify-complete definition and the ENV-05 spike ceiling, register all three test files in CI**
   - `3ce1f3b` -- `test(23-02)`: RED. Module absent.
   - `ce8e1f8` -- `feat(23-02)`: GREEN. `LEDGER_HEADING_RE`, `SPIKE_CEILING`, `isVerificationComplete`, `spikeCeilingCheck`, `spikeCleared`, thin CLI, plus the three CI entries. 19/19.

## Files Created/Modified

- `eval/lz-eval-p23-sliceA-draw.mjs` -- **new.** The seeded balanced draw. Composes `filterSliceA` and samples its OUTPUT, so the answer-leak strip cannot be bypassed. Exports `DRAW`, `mulberry32`, `drawBalanced`, `claimsEqual`; guarded thin CLI. No package added.
- `eval/lz-eval-p23-sliceA-draw.test.mjs` -- **new.** 20 cases; the real-pool cases skip if the gitignored cache is absent.
- `eval/lz-eval-p23-sliceA-read.mjs` -- **new.** The frozen voter prompt, write-once dispatch provenance, the fail-closed score-time cross-check, and the never-pooled read. No CLI: Plan 23-05 drives it from the session.
- `eval/lz-eval-p23-sliceA-read.test.mjs` -- **new.** 23 cases, all on `fs.mkdtempSync` temp directories. One case reads the module's own source to assert it imports no package and performs no network call.
- `eval/lz-eval-p23-verify-complete.mjs` -- **new.** The frozen completeness predicate and the frozen spike ceiling; guarded thin CLI with the 0 / 1 / 2 exit split.
- `eval/lz-eval-p23-verify-complete.test.mjs` -- **new.** 19 cases; the two real-report cases skip if absent.
- `.github/workflows/ci.yml` -- three explicit test-file entries appended to the eval-tree step; all seven pre-existing entries kept, explicit FILE form preserved, no coverage thresholds added.

All six new sources are strictly ASCII (0 bytes >= 128), LF-only (0 CR bytes), no BOM. The NFC/NFD comparison test writes its two spellings as `\u00e9` and `e\u0301` escapes rather than literal characters, for exactly that reason.

## D-10: the measured yield, recorded verbatim

The command and its stdout, copied from the run rather than transcribed:

```
$ node eval/lz-eval-sliceA-gold.mjs eval/.cache/chenxwh__AVeriTeC/data/dev.json
clean unrefuted=83 clean refuted=181 gate-cleared=true
provisional: uniform 2020 claim_date (out-of-cutoff for a 2026 voter; the voter judges the claim as-of 2020)
provisional: topical narrowness (the AVeriTeC dev set is ~34% US-2020-politics, ~21% COVID -- NOT a representative cross-section of general research questions; Slice A speaks to fact-check-style claims, not Slice B natural breadth)
EXIT=0
```

**The discrepancy against the Phase-22 record, stated and NOT reconciled.** `eval/lz-eval-parity-prereg.md` and the header of `eval/lz-eval-sliceA-gold.mjs` both record "95 clean Supported, 216 clean Refuted" from a 2026-06-22 inspection of the same 500-row cache. The re-run gives 83 / 181. Nothing was edited to make them agree: the Phase-22 pre-registration is untouched, the gold module's header comment is untouched, and **Plan 23-04 records the discrepancy in the ENV-01 freeze rather than resolving it.** The gate outcome is unaffected (83 >= 8, 181 >= 8, both directions populated), so the only thing that changes is the number the phase plans on. What caused the drift is not established here and is not guessed at.

## The REALIZED 40-item draw, in full

This is the frozen Slice-A item set. **Plan 23-04 quotes this list into the ENV-01 freeze commit and its anti-drift co-test pins it**, so it is recorded here in full -- both directions, every `drawIndex`, every claim string. It is reproducible at any time with the command shown; re-seeding after seeing it is forbidden.

The claim strings below are **verbatim corpus data and carry their original Unicode** (curly apostrophes appear in several AVeriTeC claims). They must NOT be ASCII-transliterated when quoted into the freeze: the anti-drift test compares them against what `filterSliceA` actually emits, so a transliterated copy would not match. That is a deliberate exception to the repo's ASCII preference, which governs SOURCE, not quoted data.

```
$ node eval/lz-eval-p23-sliceA-draw.mjs eval/.cache/chenxwh__AVeriTeC/data/dev.json
drawn unrefuted=20 refuted=20 seed=20260907 pool-unrefuted=83 pool-refuted=181 unrefuted-first=32 unrefuted-last=28 refuted-first=56 refuted-last=20
unrefuted drawIndex=32 claim=Nigeria’s urban population at independence was approximately 7 million.
unrefuted drawIndex=63 claim=Fact Check: AARP Did NOT Spend 'Millions In TV Ads Targeting Republican Candidates' -- Nonprofit AARP Is Prohibited From Involvement In Any Political Campaigns
unrefuted drawIndex=52 claim=Americans advised to reconsider travel to Ghana due to COVID-19.
unrefuted drawIndex=11 claim=Former President Donald Trump who lost the popular vote by 3 million has nominated a full third of The United Supreme Court, as of 13th October 2020.
unrefuted drawIndex=18 claim=Forty percent of Iowa’s energy resources are from renewables.
unrefuted drawIndex=44 claim=Nigeria’s urban population at the time of independence was approximately 7 million
unrefuted drawIndex=38 claim=52% of Nigeria’s current population lives in urban areas
unrefuted drawIndex=60 claim=The White House blocked a plan to send facemasks to every household in April 2020.
unrefuted drawIndex=54 claim=Basketball superstar Michael Jordan is joining NASCAR as a team owner.
unrefuted drawIndex=46 claim=At independence, Nigeria had a population of 45 million.
unrefuted drawIndex=6 claim=Hunter Biden was chairman of the Nobel Peace Prize winning World Food Program.
unrefuted drawIndex=15 claim=From 8th October the UK government will combine weekly flu and covid reports.
unrefuted drawIndex=17 claim=Labour reversed the 4,400 health health worker cuts by the LNP.
unrefuted drawIndex=56 claim=Sightway Capital is owned by Two Sigma Investments.
unrefuted drawIndex=8 claim=A third of excess deaths in the United States between 1 March and  1 August 2020 during the COVID-19 pandemic could not be directly attributed to the coronavirus
unrefuted drawIndex=49 claim=A Maryland man was sentenced to a year in jail for throwing parties.
unrefuted drawIndex=73 claim=Spraying of Naira notes is an offence punishable by imprisonment in Nigeria.
unrefuted drawIndex=58 claim=The passing of Ruth Bader Ginsburg will have a profound effect on the future of the Supreme Court of America.
unrefuted drawIndex=64 claim=Tourism, lockdown key to deep New Zealand recession.
unrefuted drawIndex=28 claim=The wife of  Lal Bahadur Shastri (ex Prime minister of India) repaid his car loan after his death.
refuted drawIndex=56 claim=it is unknown whether a person under 20 can pass the disease to an older adult.
refuted drawIndex=119 claim=Minneapolis City Council has defunded the police.
refuted drawIndex=139 claim=Nita Ambani is to give Rs 200 crore for Kangana Ranaut’s new studio
refuted drawIndex=87 claim=Olive Garden prohibits its employees from wearing face masks depicting the American flag.
refuted drawIndex=27 claim=Dr Anthony Fauci wrote a paper regarding the Spanish Flu and stated that the majority of deaths in 1918-1919 was because of bacterial pneumonia from wearing masks.
refuted drawIndex=14 claim=Paul Pogba, who plays for Manchester United and the French national team, retired from international football in response to French President Macron’s comments on Islamist terrorism.
refuted drawIndex=83 claim=AARP endorsed President Biden and gave financial support to planned parenthood.
refuted drawIndex=168 claim=Suresh Raina, the Chennai Super Kings (CSK) cricketer, has withdrawn from the upcoming 2020 edition of the IPL after testing positive for COVID-19.
refuted drawIndex=11 claim=Sleeping under a mosquito bed net treated (or not treated) with insecticide is ineffective and harmful to human health.
refuted drawIndex=161 claim=Bill Gates was involved in crafting the TRACE Act.
refuted drawIndex=10 claim=Germany’s Foreign Minister Heiko Maas said that Thailand’s King Maha Vajiralongkorn didn’t do anything illegal while at his German residence.
refuted drawIndex=62 claim=In 1977 Senate Minority Leader Chuck Schumer had an affair with his daughter best friend from high school.
refuted drawIndex=16 claim=Breitbart News reports that the daughter of Delaware Democratic Senator Chris Coons and seven other underage girls were featured on Hunter Biden's laptop.
refuted drawIndex=153 claim=The CDC recommended wearing only certain beard styles to help prevent the spread of coronoavirus.
refuted drawIndex=94 claim=Shah Rukh Khan's Kolkata Knight Riders (KKR) is acquiring a 1.28 per cent stake in Reliance Retail at Rs 5,500 crore
refuted drawIndex=107 claim=Zimbabwe recorded its first coronavirus Infection before 20 February 2020.
refuted drawIndex=91 claim=The State of Massachusetts committed voter fraud by deleting over one million ballot images during the 2020 Presidential Election.
refuted drawIndex=76 claim=Flu shots lead to severe or life-threatening conditions making them unsafe.
refuted drawIndex=54 claim=Swiss Squash player Ambre Allinckx’s refuses to play in India due to safety reasons
refuted drawIndex=20 claim=Cutting the umbilical cord straight away deliberately denies the baby natural immunity so that medical professionals have a reason to vaccinate and medicate them.
EXIT=0
```

`unrefuted` `drawIndex` values in draw order: 32, 63, 52, 11, 18, 44, 38, 60, 54, 46, 6, 15, 17, 56, 8, 49, 73, 58, 64, 28.
`refuted` `drawIndex` values in draw order: 56, 119, 139, 87, 27, 14, 83, 168, 11, 161, 10, 62, 16, 153, 94, 107, 91, 76, 54, 20.

Each `drawIndex` is the item's position in **that direction's** `filterSliceA` output, and it is the join key gold is recovered by at score time. It is never dispatched: the voter record is `{ claim, claim_date }` and nothing else.

## The three discrimination proofs, with their observed failure output

The plan requires each proof be RUN, not asserted, and its observed failure output recorded. A test that only passes against fixed code proves nothing about the defect it claims to guard. In all three cases the guard was disabled in the shipped module, the suite was re-run, and the module was restored with `git checkout --`.

### Proof 1 (Task 1) -- the balance guard, and the seed actually driving the selection

**(a) Observed outputs, guard in place.** A synthetic pool with 19 survivors in one direction:

```
threw: ContractError file=drawBalanced
message: drawBalanced cannot draw a BALANCED set: pool.unrefuted holds 19 survivors, fewer than the required 20 (D-08: an unbalanced draw leaves the smaller direction uninformative; a smaller draw is NOT a fallback)
```

Same seed twice versus a different seed, over a synthetic 60/60 pool at n=20:

```
seed 20260907 run 1 unrefuted drawIndex: [23, 46, 38, 9, 14, 32, 29, 44, 40, 34, 6, 4, 15, 42, 41, 37, 54, 7, 48, 24]
seed 20260907 run 2 unrefuted drawIndex: [23, 46, 38, 9, 14, 32, 29, 44, 40, 34, 6, 4, 15, 42, 41, 37, 54, 7, 48, 24]
seed 20260908 run 1 unrefuted drawIndex: [35, 42, 26, 48, 50, 20, 27, 25, 4, 28, 47, 18, 24, 17, 49, 36, 29, 9, 39, 12]
run1 === run2 (JSON): true
run1 === seed+1  (JSON): false
```

**(b) Invert the fix.** The `pool[direction].length < nPerDirection` guard was disabled so a short direction would draw smaller. **Result: 19 pass / 1 fail** -- exactly the balance case, everything else green, which is what shows the guard is narrow:

```
test at eval\lz-eval-p23-sliceA-draw.test.mjs:246:1
✖ D-08 DISCRIMINATION: a pool with 19 survivors in one direction is a ContractError naming drawBalanced, NOT a smaller draw (0.8798ms)
  AssertionError [ERR_ASSERTION]: Missing expected exception.
      at TestContext.<anonymous> (file:///D:/projects/github/LayZeeDK/lz-advisor-claude-plugins/eval/lz-eval-p23-sliceA-draw.test.mjs:251:10)

ℹ tests 20
ℹ pass 19
ℹ fail 1
```

"Missing expected exception" is the defect stated plainly: without the guard, a 19-survivor pool silently produces a 19 + 20 draw, and every count assertion elsewhere in the file still passes while the balance D-08 requires is gone. **Guard restored, re-run: 20/20, exit 0.**

### Proof 2 (Task 2) -- the T-22-15 substitution defect

The single replacer-function scan was replaced with the naive plain-string form the seed names -- `.replace('{{CLAIM_DATE}}', claimDate).replace('{{CLAIM}}', claim)` -- and the suite was re-run.

**Result: 20 pass / 3 fail.** Exactly the three T-22-15 cases fail; all 20 other cases, including the answer-leak and provenance cases, stay green:

```
✖ T-22-15 DISCRIMINATION: each of the four special dollar sequences round-trips VERBATIM into the dispatch string
✖ T-22-15: a claim carrying ALL FOUR sequences at once still round-trips verbatim
✖ T-22-15: a dollar sequence in the CLAIM_DATE also round-trips verbatim (both call sites are covered)
ℹ tests 23
ℹ pass 20
ℹ fail 3
```

The `$&` case, verbatim -- the claim's `$&` was replaced by the matched placeholder text, so the voter would have been asked about `Budget line {{CLAIM}} was approved...`:

```
test at eval\lz-eval-p23-sliceA-read.test.mjs:136:1
✖ T-22-15 DISCRIMINATION: each of the four special dollar sequences round-trips VERBATIM into the dispatch string (0.51ms)
  AssertionError [ERR_ASSERTION]: dollar-ampersand must round-trip verbatim, got: "You are a verify-voter. Decide whether the CLAIM below is REFUTED by the evidence you can find.\n\nJudge the claim AS OF the cutoff date below, not as of today. Evidence published after the cutoff\nis out of scope.\n\nCUTOFF: 2020-02-02\nCLAIM: Budget line {{CLAIM}} was approved by the committee without amendment in 2019.\n\nAnswer with exactly one word, lowercase, and nothing else: refuted, or unrefuted."
```

The combined case is the one worth reading twice. `` $` `` inserted **the entire preceding prompt text** into the middle of the claim, so the dispatched string contains the instruction block twice and the claim is destroyed:

```
test at eval\lz-eval-p23-sliceA-read.test.mjs:155:1
✖ T-22-15: a claim carrying ALL FOUR sequences at once still round-trips verbatim (0.1235ms)
  AssertionError [ERR_ASSERTION]: the combined claim must round-trip verbatim, got: "You are a verify-voter. Decide whether the CLAIM below is REFUTED by the evidence you can find.\n\nJudge the claim AS OF the cutoff date below, not as of today. Evidence published after the cutoff\nis out of scope.\n\nCUTOFF: 2020-03-03\nCLAIM: The {{CLAIM}} and You are a verify-voter. Decide whether the CLAIM below is REFUTED by the evidence you can find.\n\nJudge the claim AS OF the cutoff date below, not as of today. Evidence published after the cutoff\nis out of scope.\n\nCUTOFF: 2020-03-03\nCLAIM:  and \n\nAnswer with exactly one word, lowercase, and nothing else: refuted, or unrefuted. and $ sequences all appear in this single corpus-shaped claim.\n\nAnswer with exactly one word, lowercase, and nothing else: refuted, or unrefuted."
```

This is exactly the traced failure mode SEED-005 records: injected prompt text carrying no uid and no gold marker, so **neither existing Phase-22 anti-leak guard would have fired**. The instrument would have been silently mangled and the run would have looked clean. **Fix restored, re-run: 23/23, exit 0.**

### Proof 3 (Task 3) -- the completeness predicate against the real partial report

Both CLI invocations, verbatim. This pair is the proof: the two files sit side by side in the same directory, and a predicate that merely searched for the words "verification ledger" would pass both.

```
$ node eval/lz-eval-p23-verify-complete.mjs eval/.cache/p22-baseline/builtin/qB1-run1.report.md
complete=true declaredN=25 confirmedN=25 tableRows=25 duplicateLedgerHeadings=0
EXIT=0

$ node eval/lz-eval-p23-verify-complete.mjs eval/.cache/p22-baseline/builtin/qB1-run1.report.partial-verify.md
complete=false declaredN=null confirmedN=null tableRows=null duplicateLedgerHeadings=0
reason: no verification-ledger heading declaring an N/N confirmed count was found (Pattern 5: a format change is itself an ENV-07 finding and falls to a documented manual read, never a silent re-definition)
EXIT=1
```

The ceiling half, also run against the real complete report, showing both sides of the resume boundary:

```
$ node eval/lz-eval-p23-verify-complete.mjs .../qB1-run1.report.md 3 2
complete=true declaredN=25 confirmedN=25 tableRows=25 duplicateLedgerHeadings=0 ceiling-cleared=true resumeCycles=3 resetWindows=2 spike-cleared=true
EXIT=0

$ node eval/lz-eval-p23-verify-complete.mjs .../qB1-run1.report.md 4 2
complete=true declaredN=25 confirmedN=25 tableRows=25 duplicateLedgerHeadings=0 ceiling-cleared=false resumeCycles=4 resetWindows=2 spike-cleared=false
EXIT=1
```

**Worth recording for Plan 23-04:** the partial report fails on the **no-ledger-heading** path, not on a count mismatch. Its heading reads `## Verification ledger` with no `N/N` count at all, and its ledger table's own summary line says "25 claims selected -> 5 verified, 20 unverified (billing interruption, not refutation)". So on the one negative example available, the built-in signalled incompleteness by **dropping the count from the heading**, not by declaring a smaller one. The predicate handles both shapes (a synthetic 25/25-over-5-rows case is asserted separately and returns false), but only the heading-dropping shape is empirically attested.

## Decisions Made

1. **The draw order is part of the contract.** One `mulberry32` instance is created from the seed and consumed for `unrefuted` then `refuted`. Two independent generators, or the reverse order, would produce a different 40 items from the same seed. The `DIRECTIONS` constant carries a comment saying so, and the pinned five-value sequence plus the recorded realized list make any change visible.
2. **The float and rounding rules are fixed in the module, not left to the caller.** `Math.floor(rand() * (len - i))` over a half-open `[0, 1)` generator, which is what guarantees `i <= j < len` and makes the partial Fisher-Yates swap safe without a bounds check.
3. **`sliceARead` cross-checks the gold label against the drawn direction and throws on disagreement.** The direction IS the gold direction by construction, so a mismatch means the `drawIndex` join is wrong -- and a wrong join would silently mis-score every cell. Cheap check, and the failure it catches is not recoverable after the fact.
4. **An indefinite verdict does not count toward the 40.** Padding an incomplete pool with abstains cannot satisfy the completeness requirement; a test asserts that specific route.
5. **A duplicate ledger heading is reported but does not by itself fail completeness.** The plan asks for the ambiguity to be "surfaced rather than resolved silently"; failing on it would be resolving it, and passing it silently would be hiding it. Reporting `duplicateLedgerHeadings` alongside a completeness verdict computed from the FIRST heading is the reading that matches the instruction.
6. **`LEDGER_HEADING_RE` is non-global.** A frozen global regex throws on `exec`/`test` because those write `lastIndex`. Freezing was required; global was not, so the scan is line by line.
7. **No `requirements-completed` claim.** ENV-03 and ENV-05 are BEHAVIOURAL requirements and this plan lands only their machinery -- no voter has been dispatched and no spike has run. The Phase-22 lesson about one stale `requirements-completed:` line silently closing an unsatisfied requirement applies directly.

## Deviations from Plan

### Pre-approved deviation, recorded as a decision

**1. [Plan `<output>`] The no-pooled-rate assertion is RELOCATED out of `eval/lz-eval-sliceA-gold.test.mjs`**

- **Found during:** Task 2 (by plan instruction, not discovery)
- **What `23-PATTERNS.md` lists:** an added assertion in `eval/lz-eval-sliceA-gold.test.mjs` that the ENV-03 driver output carries no pooled-rate key.
- **What landed instead:** the exact key-set assertion on `sliceARead`'s own output, in this plan's co-test -- `ENV-03: sliceARead returns EXACTLY [drawSeed, n, provisionalLimits, refuted, unrefuted]`. Plan 23-05 Task 3 re-checks the same set against the written `read.json`.
- **Reason (as stated in the plan):** the responsibility map records `eval/lz-eval-sliceA-gold.mjs` as existing and unchanged, and re-opening a frozen module to assert a NEW module's output contract puts the check in the wrong place. An exact key-set assertion on the PRODUCER forecloses every pooled name, including ones nobody has thought of yet, which an assertion in the gold module's co-test would not.
- **Verified:** `eval/lz-eval-sliceA-gold.test.mjs` is **UNMODIFIED** -- `git diff HEAD -- eval/lz-eval-sliceA-gold.test.mjs` is empty and its last commit is `cd54ea2` from Phase 22. It appears in no plan's `files_modified`.
- **Committed in:** `acfb779`

### Auto-fixed issues

**2. [Rule 1 - Bug] `23-PATTERNS.md` states that no seeded PRNG exists anywhere in the tree. One does.**

- **Found during:** Task 1
- **Issue:** `23-PATTERNS.md` records, under both *Pattern Assignments* and *No Analog Found*, that "no seeded RNG exists in the tree" and that `Math.random` "appears nowhere in a scoring path". The second half is true; the first is not. `eval/lz-eval-mcc.mjs` already contains a **private** `mulberry32` over a 32-bit FNV-1a hash (around lines 184-212), used as the seeded resampling source for the BCa bootstrap and the label permutation test.
- **Fix:** the plan's instruction (write it inline, no package) was followed as written, and the implementation is **byte-identical in algorithm** to the existing private one so the tree has one generator behaviour rather than two. It was NOT exported from `lz-eval-mcc.mjs` and re-imported: that module is a frozen scoring path, and widening its public surface to save fifteen lines is the wrong trade. The module header records the duplication and why.
- **Files modified:** `eval/lz-eval-p23-sliceA-draw.mjs` (comment only -- no behaviour change)
- **Verification:** the pinned five-value sequence test passes; `eval/lz-eval-mcc.mjs` is untouched.
- **Committed in:** `55be725`

**3. [Rule 1 - Bug] The plan says the frozen gold module owns THREE provisional limits. It owns two.**

- **Found during:** Task 2
- **Issue:** the plan describes `provisionalLimits` as "a defensive copy of the three limit strings the frozen gold module owns: the uniform 2020 cutoff, the topical narrowness, and the evidence-set mismatch". On disk, `eval/lz-eval-sliceA-gold.mjs`'s `PROVISIONAL_LIMITS` holds exactly **two** (uniform 2020, topical narrowness) and is not exported. The third does not exist there.
- **Fix:** the first two are recovered through the gold module's own accessor -- `sliceAFeasibilityGate(...)` returns a fresh copy of them -- rather than re-typed here, so a change there propagates instead of drifting. The third (evidence-set mismatch between a 2020-labelled reference standard and a live-2026-web voter) is defined in this module and its comment says it is new to this read. Ownership is therefore accurate rather than merely asserted.
- **Files modified:** `eval/lz-eval-p23-sliceA-read.mjs`
- **Verification:** `ENV-03: sliceARead carries the three PROVISIONAL limits, as a defensive copy` asserts all three are named and that a caller's mutation does not reach the next call.
- **Committed in:** `acfb779`

**4. [Rule 2 - Missing Critical] `claimsEqual` exported as a fourth symbol beyond the plan's three**

- **Found during:** Task 1
- **Issue:** the plan requires "Give claim-text comparison one rule and state it: strings are compared after `normalize('NFC')` and byte-exactly thereafter, never case-folded", and lists a behaviour case for it -- but lists only `DRAW`, `mulberry32` and `drawBalanced` as exports. With the rule implemented privately, the co-test could only assert `normalize('NFC')` against itself, which is a tautology about Node rather than a contract about this module. The plan separately forbids normalizing the emitted `voterRecord` ("the `{ claim, claim_date }` object as emitted, unchanged"), so the rule could not be made observable that way either.
- **Fix:** exported `claimsEqual(a, b)` so the rule is a checkable contract. It also gives Plan 23-05 one rule to cross-check a persisted dispatch record's claim against the drawn claim, instead of inventing a second one at dispatch time.
- **Files modified:** `eval/lz-eval-p23-sliceA-draw.mjs`
- **Verification:** three named cases -- NFD/NFC equal, case and trailing whitespace significant, non-string is a `ContractError`.
- **Committed in:** `55be725`

---

**Total deviations:** 1 pre-approved relocation + 3 auto-fixed (2 plan-vs-disk factual corrections, 1 missing critical).
**Impact on plan:** No scope creep, no criterion weakened, no task descoped. Both factual corrections were verified against disk before acting, per the Wave-1 lesson that a plan can be wrong about ground truth; neither changes what the plan asked for, only what the plan claimed about existing code. The fourth export is additive and makes a rule the plan explicitly required into something a test can actually check.

## Issues Encountered

- **Literal non-ASCII could not be round-tripped through the Edit tool**, the same wall Plan 23-01 hit. The NFC/NFD test was written with literal accented characters (which the Write tool did place correctly on disk, as `cat -v` confirmed), but Edit could match neither the literal nor the escaped form afterwards. Resolved by rewriting those two lines through a throwaway Node script into `\u00e9` / `e\u0301` escapes. All six new sources are now 0 non-ASCII bytes. **The lesson for later plans: write non-ASCII as escapes in the FIRST draft; do not plan to fix it with Edit afterwards.**
- **A session usage limit terminated the first session mid-Task-2**, after the GREEN module had been written but before it was committed. Resume verified the file was complete by re-running the suite from scratch (23/23) rather than trusting the pre-interruption claim, then committed. No work was redone and no commit was duplicated.
- **`node --test <dir>` was never used**; every gate in this plan names explicit `.test.mjs` FILE paths, per the host quirk.
- **No config or STATE drift during task execution.** No `gsd-tools` `phase.*` / `state.*` / `query` verb was invoked while the three tasks ran; `.planning/config.json` was read with the Read tool. `git diff .planning/config.json .planning/STATE.md` was empty before every task commit. Per Plan 23-01's finding, `query state.update-progress` was NOT called at close-out -- it is a no-op on this STATE.md format and deletes `branching_strategy` from `config.json` as a side effect; the `progress:` block was edited by hand instead.
- **The irreplaceable gitignored caches are intact.** No `git clean` was run in any form. Nothing under `eval/.cache/` or `.lz-research/` was written, deleted or truncated by this plan -- every access was a read. The untracked `.gsd/` directory was left alone and not committed.

## Review record (project MUST: scripts reviewed before they drive an LLM task or are published)

This obligation is **live** for this plan, not deferred: `buildDispatchString` renders the exact prompt that will drive the ENV-03 voter LLM tasks in Plan 23-05, so its template is a PROMPT under the project rule, not merely a script.

- **The three modules** were re-read after writing for the project's control-flow style (braces on every body, blank lines around control flow and returns), the `ContractError` message convention (plain-English cause, then the offending value via `JSON.stringify`, then the governing decision id, with the function name as the second argument), and ASCII/LF/no-BOM. Byte-verified above.
- **The voter prompt template** was reviewed for content, not just mechanics: it carries the claim and the as-of cutoff and nothing else; it never names the gold label, the justification, the fact-checking article, the questions, the speaker or the `drawIndex`; it asks for a one-word lowercase answer from a two-value enum, matching the verdict enum `readSliceAVerdicts` accepts. The value-based leak test enumerates a full synthetic gold row's own fields and asserts none of their values appears in the rendered string.
- **One residual item for Plan 23-04/23-05, raised rather than silently accepted:** the template's wording has been reviewed here by the executing session only. It is frozen in code but has not had an independent content review, and it is the instrument every ENV-03 verdict depends on. Plan 23-04 should quote it into the pre-registration verbatim (or by sha256 pin) so that what was reviewed is what runs.
- `node --test eval/lz-eval-packaging-boundary.test.mjs` passes (2/2): nothing was added under `plugins/lz-advisor/` and the one-directional `eval -> runtime` import boundary is intact.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Plan 23-03** (offline citation audit + the q1 dry run, network only). Wave 2 is complete.

Carried forward, for the plans that consume this:

- **Plan 23-04 (the ENV-01 freeze) must quote from this plan:** (i) the realized 40-item draw above, verbatim including its Unicode, with `DRAW.SEED` 20260907 and `N_PER_DIRECTION` 20; (ii) the 83/181 re-verification AND the unresolved discrepancy against the recorded 95/216; (iii) `SPIKE_CEILING`'s 3 and 2 with D-06's ratified reading of ENV-05's literal one-window wording; (iv) the frozen voter prompt template, verbatim or sha256-pinned, so the reviewed instrument is the one that runs; (v) the Pattern 5 caveat that the completeness definition derives from a single observed report and a q2 format change is an ENV-07 finding falling to a documented manual read.
- **Plan 23-05 must dispatch through `buildDispatchString` and persist through `writeDispatchRecord` per item, at dispatch time.** Retrofitting either afterwards is impossible by construction -- that is the whole content of SEED-005. `readSliceAVerdicts` will refuse a verdict whose dispatch record is missing, so a skipped `writeDispatchRecord` surfaces as a hard failure at score time rather than as a quiet gap.
- **Plan 23-06's spike should record the realized resume-cycle and reset-window counts explicitly**, because `spikeCleared` publishes them either way under D-07 and the CLI's `spike-cleared` line is only as good as the counts fed to it. Those counts are observations the session must make; nothing in the module can derive them.
- **`requirements-completed` is deliberately empty.** ENV-03 closes only once the 40 verdicts exist and the read has run (Plan 23-05); ENV-05 closes only once the spike has run (Plan 23-06). This plan lands machinery.
- **The pre-registration has not been frozen yet.** No capture, vote or score may run before Plan 23-04's freeze commit lands in its own timestamped commit (D-16). Nothing in this plan spent anything.

## Self-Check: PASSED

- `eval/lz-eval-p23-sliceA-draw.mjs` -- FOUND
- `eval/lz-eval-p23-sliceA-draw.test.mjs` -- FOUND
- `eval/lz-eval-p23-sliceA-read.mjs` -- FOUND
- `eval/lz-eval-p23-sliceA-read.test.mjs` -- FOUND
- `eval/lz-eval-p23-verify-complete.mjs` -- FOUND
- `eval/lz-eval-p23-verify-complete.test.mjs` -- FOUND
- `.github/workflows/ci.yml` -- 10 explicit entries (7 pre-existing kept + 3 appended), FILE form preserved, no coverage thresholds on the eval step
- `eval/lz-eval-sliceA-gold.test.mjs` -- CONFIRMED UNMODIFIED (last commit `cd54ea2`, Phase 22)
- Commits `6d67ee5`, `55be725`, `30e11a3`, `acfb779`, `3ce1f3b`, `ce8e1f8` -- all FOUND in `git log`
- Plan `<verification>`: four-file gate **80/80 exit 0**; `eval/lz-eval-packaging-boundary.test.mjs` **2/2 exit 0**; all three discrimination proofs RUN with their failure output recorded verbatim above; the 83/181 CLI line and the realized 40-item draw both recorded; `git diff .planning/config.json .planning/STATE.md` empty before staging
- All task `<acceptance_criteria>` re-run and passing, including `Object.isFrozen(DRAW)`, `Object.isFrozen(SPIKE_CEILING)` with values 3 and 2, the pinned mulberry32 sequence, the exact key sets, the duplicate-heading case, the four ceiling boundaries, and the ci.yml registration check
- ZERO SPEND confirmed: no model call, no network request, no capture, no dispatch

---
*Phase: 23-judge-free-confidence-and-operating-envelope-for-lz-deep-res*
*Completed: 2026-09-07*
