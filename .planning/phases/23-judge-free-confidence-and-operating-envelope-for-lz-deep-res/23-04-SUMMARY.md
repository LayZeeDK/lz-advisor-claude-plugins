---
phase: 23-judge-free-confidence-and-operating-envelope-for-lz-deep-res
plan: 04
subsystem: testing
tags: [env-01, pre-registration, freeze-commit, anti-drift, sha256-pin, contamination-disclosure, ci]

# Dependency graph
requires:
  - phase: 23-01
    provides: "the D-22 cost source with both q1 stream enumerations and the recorded exclusion, both validating q1 MANIFESTs, and the frozen ARXIV_RE / DOI_RE / KEEP_PARAMS canonicalizer constants"
  - phase: 23-02
    provides: "DRAW (seed 20260907, 20 per direction), the realized 40-item balanced draw, buildDispatchString's voter prompt template, and SPIKE_CEILING (3 resume cycles / 2 reset windows)"
  - phase: 23-03
    provides: "the frozen ENV-04 normalization rules, RESOLVE_LIMITS and the network controls, and the published not-bar-setting q1 dry run carrying the 69 / 13 / 18 correction"
provides:
  - "eval/lz-eval-p23-prereg.md: the FROZEN sole authority for every bar, item list, rule, seed, disclosure, pre-committed conditional and termination in Phase 23"
  - "The pre-registration timestamp of record for the whole phase: commit 9ab9933 at 2026-09-07T23:37:33+02:00"
  - "eval/lz-eval-p23-prereg.test.mjs: the anti-drift co-test plus the required-section presence checklist, both discrimination-proven"
  - "eval/lz-eval-p23-capture-driver.md: the q2 capture protocol with the D-17 retention step the Phase-22 driver lacked, and the D-19 first-observation step"
  - "The frozen q2 question text, quoted identically in both documents"
  - "A sha256 pin on the ENV-03 voter prompt, so the template the maintainer reviewed is provably the one that drives all 40 verdicts in 23-05"
  - "A per-session contamination ledger derived from transcript evidence, superseding a recalled disclosure that was wrong in three ways"
affects: [23-05, 23-06, 23-07, 23-08, 23-09]

actuals:
  tokens: 27035
  tasks: 3
  commits: 2

tech-stack:
  added: []
  patterns:
    - "Freeze the prose and pin the code hash together: quoting alone lets prose drift from code, hashing alone is unreadable at review time, so the reviewed artifact and the running artifact are only provably the same when both are done"
    - "A placeholder round-trip renders a template through its own substitution function, so the digest pins the TEMPLATE the reviewer reads rather than one instantiation of it"
    - "Scope an ordering guarantee to what git actually proves and name the exception: a pre-registration that overstates its own ancestry claim is worse than one that states a narrower claim accurately"
    - "Derive a contamination disclosure from transcript evidence by measuring what each tool call RETURNED into context, not what a process opened"
    - "Pin a deliberate encoding exception to its source: the prereg's non-ASCII set must be a SUBSET of the characters the corpus itself emits, rather than asserting pure ASCII or abandoning the check"

key-files:
  created:
    - eval/lz-eval-p23-prereg.md
    - eval/lz-eval-p23-prereg.test.mjs
    - eval/lz-eval-p23-capture-driver.md
  modified:
    - .github/workflows/ci.yml

key-decisions:
  - "The freeze commit contains EXACTLY three files. CI registration of the co-test is a separate later commit, deliberately deviating from the same-task rule the three earlier plans followed, because an unambiguous freeze timestamp is what every later ancestry check depends on"
  - "The ENV-03 voter prompt is pinned BOTH ways -- quoted verbatim in the prose AND sha256-asserted in the co-test -- and a second digest pins a fixed synthetic instantiation, so a one-character module edit fails three assertions"
  - "The pre-freeze ordering claim is scoped to RATIOS, with the 18-unique-canonical-sources co-test pin named explicitly as the exception; the stronger 'no measured figure precedes this freeze' is NOT written, because git does not support it"
  - "The pre-registration is deliberately NOT strictly ASCII: it quotes the realized draw verbatim, and those claim strings are corpus data. The co-test asserts the narrower property that every non-ASCII character comes from a quoted corpus claim"
  - "The q2 question text lives in BOTH documents, not only the driver, so the co-test can assert they state it identically and no capture can drift from what was reviewed"
  - "Section (vii) was rewritten from a recalled disclosure into a transcript-derived per-session ledger before the freeze, because after the freeze the same correction would cost a numbered amendment"
  - "requirements.mark-complete was NOT run: the orchestrator owns planning-file writes for this phase, and the SDK mutator verbs have deleted branching_strategy from config.json five times in this session"

patterns-established:
  - "The anti-drift needle is built FROM the imported constant and the value-plus-one form is asserted ABSENT, so a one-digit prose edit fails two cases rather than one"
  - "The section checklist states in the test file's own header that it is a PRESENCE check which cannot validate content and must never stand in for the human read"

requirements-completed: [ENV-01]

coverage:
  - id: D1
    description: "The ENV-01 pre-registration is frozen and committed in its OWN timestamped commit containing exactly three files, BEFORE any capture, vote or score, and is a strict git ancestor of every later artifact commit (D-16)"
    requirement: ENV-01
    verification:
      - kind: other
        ref: "name-only check: freeze commit 9ab9933 contains exactly [capture-driver.md, prereg.md, prereg.test.mjs], exit 0"
        status: pass
      - kind: other
        ref: "git merge-base --is-ancestor 9ab993319da0fc3a10ae0cba45f10cb19576b93a HEAD, exit 0"
        status: pass
    human_judgment: false
  - id: D2
    description: "Every frozen numeric bar appears verbatim in the pre-registration prose, built FROM the Object.frozen module constant, and each value-plus-one form is absent -- so post-hoc bar tuning is detectable rather than merely discouraged"
    requirement: ENV-01
    verification:
      - kind: unit
        ref: "eval/lz-eval-p23-prereg.test.mjs#ENV-01 anti-drift: the prereg prose NUMBERS match the frozen module constants byte-for-byte"
        status: pass
      - kind: unit
        ref: "eval/lz-eval-p23-prereg.test.mjs#ENV-01 anti-drift is DISCRIMINATING: a wrong (constant + 1) value is NOT present in the prose"
        status: pass
      - kind: other
        ref: "discrimination proof: one prose digit changed (262144 -> 262145) -> 2 of 25 fail, both anti-drift cases; restored -> 25/25 (output recorded verbatim in this SUMMARY)"
        status: pass
    human_judgment: false
  - id: D3
    description: "The ENV-03 voter prompt template is frozen so that what the maintainer reviewed is provably what drives all 40 Slice-A verdicts in Plan 23-05: quoted verbatim in the prose, sha256-pinned in the co-test, with its withheld-field list recorded as the blinding"
    requirement: ENV-01
    verification:
      - kind: unit
        ref: "eval/lz-eval-p23-prereg.test.mjs#ENV-03: the rendered voter prompt template matches its pinned sha256 (what was reviewed is what runs)"
        status: pass
      - kind: unit
        ref: "eval/lz-eval-p23-prereg.test.mjs#ENV-03: the pre-registration quotes the rendered voter prompt template VERBATIM"
        status: pass
      - kind: unit
        ref: "eval/lz-eval-p23-prereg.test.mjs#ENV-03: the pre-registration records the withheld fields as the blinding"
        status: pass
      - kind: other
        ref: "discrimination proof: one comma removed from the frozen template -> 3 of 25 fail (both digests plus the verbatim-quote case); restored -> 25/25 (output recorded verbatim in this SUMMARY)"
        status: pass
    human_judgment: false
  - id: D4
    description: "The realized 40-item draw is quoted IN FULL with its seed, verbatim including its original Unicode, and is re-derived from DRAW.SEED at test time rather than trusted as transcribed"
    requirement: ENV-01
    verification:
      - kind: unit
        ref: "eval/lz-eval-p23-prereg.test.mjs#D-08/D-09: the pre-registration quotes the realized 40-item draw in full, verbatim"
        status: pass
      - kind: unit
        ref: "eval/lz-eval-p23-prereg.test.mjs#the pre-registration is LF-only with no BOM, and its non-ASCII characters all come from the corpus"
        status: pass
    human_judgment: false
  - id: D5
    description: "All three frozen-record discrepancies are RECORDED and not reconciled, with the canonical-source count written as 18 and never as 13, and no Phase-22 artifact edited"
    requirement: ENV-01
    verification:
      - kind: unit
        ref: "eval/lz-eval-p23-prereg.test.mjs#D-10: the pre-registration records the 83/181 re-verification AND the 95/216 discrepancy"
        status: pass
      - kind: unit
        ref: "eval/lz-eval-p23-prereg.test.mjs#D-21: the three-quantity built-in q1 correction is recorded, with 18 as the canonical-source count"
        status: pass
      - kind: other
        ref: "git status clean for eval/lz-eval-parity-prereg.md and .planning/notes/phase-22-diagnosis-two-root-causes.md, checked before and after the freeze commit"
        status: pass
    human_judgment: false
  - id: D6
    description: "The capture driver carries the D-17 retention step with exact paths as the first post-capture action, the D-19 first-observation step before any rate is computed, and generation-5 model pins with no generation-4 string presented as a target"
    requirement: ENV-01
    verification:
      - kind: unit
        ref: "eval/lz-eval-p23-prereg.test.mjs#D-17: the driver carries the retention step with exact paths, as the FIRST post-capture action"
        status: pass
      - kind: unit
        ref: "eval/lz-eval-p23-prereg.test.mjs#D-19: the driver records the first observation BEFORE any rate is computed, with both branches"
        status: pass
      - kind: unit
        ref: "eval/lz-eval-p23-prereg.test.mjs#generation 5: every driver transport is pinned to generation 5 and no generation-4 string is a target"
        status: pass
    human_judgment: false
  - id: D7
    description: "Both frozen documents are content-reviewed by the maintainer BEFORE they drive anything, per the project's review-before-use rule, and the verdict is recorded in both"
    requirement: ENV-08
    verification:
      - kind: unit
        ref: "eval/lz-eval-p23-prereg.test.mjs#ENV-08: both documents carry a Review record section"
        status: pass
    human_judgment: true
    rationale: "The presence of a Review record section is testable; whether the review was a real read is not. The verdict is recorded as TWO ROUNDS because that is what happened -- round 1 returned revise-then-freeze on the contamination disclosure and round 2 approved the corrected document. ENV-08 nonetheless stays OPEN: it is a phase-wide gate covering every eval script and reference, and it closes in Plan 23-09."
  - id: D8
    description: "The anti-drift co-test runs in CI by explicit FILE path, with all eleven prior entries kept and no coverage threshold added to the eval step"
    verification:
      - kind: other
        ref: "non-comment scan of .github/workflows/ci.yml: 12 entries, no duplicates, explicit FILE form, prereg co-test present; the --test-coverage-* flags remain on the plugin-tree step only"
        status: pass
      - kind: unit
        ref: "node --test over all 12 registered eval test files: 250/250 pass, exit 0"
        status: pass
    human_judgment: false

duration: 78 min
completed: 2026-09-07
status: complete
---

# Phase 23 Plan 04: the ENV-01 pre-registration freeze Summary

**Phase 23's sole authority is frozen in its own timestamped commit containing exactly three files, ahead of every capture, vote and score -- carrying the maintainer-ratified n=2 budget, the up-front statement that no significance claim is reachable, the realized 40-item draw, all three recorded discrepancies, a sha256-pinned voter prompt, the D-17 retention protocol and the D-19 two-branch conditional, plus a contamination disclosure that was rebuilt from session-transcript evidence after the recalled version proved wrong in three ways.**

## The pre-registration timestamp of record

| | |
|---|---|
| **Freeze commit SHA** | `9ab993319da0fc3a10ae0cba45f10cb19576b93a` |
| **ISO committer timestamp** | `2026-09-07T23:37:33+02:00` |
| **Subject** | `freeze(23-04): the ENV-01 Phase-23 pre-registration, its anti-drift co-test and the q2 capture protocol` |

**This pair is the pre-registration timestamp of record for the whole of Phase 23.** Every later plan's
ordering claim refers to it.

### The reusable ancestry command

Run this before any commit that carries a capture, a vote or a score. It is a git ANCESTRY TEST, not a
timestamp comparison -- two commits can share a timestamp, and topology is what actually orders them:

```
git merge-base --is-ancestor 9ab993319da0fc3a10ae0cba45f10cb19576b93a HEAD
```

Exit 0 means the freeze precedes HEAD. Exit 1 means it does not, and whatever is about to be recorded
cannot claim to have been pre-registered.

Verified at close of this plan: exit 0.

### The freeze commit contains exactly three paths

```
[OK] freeze commit 9ab993319da0fc3a10ae0cba45f10cb19576b93a contains exactly the three freeze artifacts
```

Staged by name, never by directory, dot or `-A`/`-u`. `git diff --cached --stat` was asserted non-empty
with the expected counts BEFORE the commit -- `3 files changed, 1812 insertions(+)` -- because `git add`
stages nothing when any pathspec fails, and that failure mode cost Wave 1 an amend. Here it would have
baked a false provenance claim into unrewindable history.

## Performance

- **Duration:** 78 min including two maintainer review rounds
- **Tasks:** 3 of 3
- **Files:** 3 created, 1 modified
- **Commits:** 2 (the freeze, then the CI registration)
- **Spend:** ZERO. No model call, no network request, no capture, no vote, no score. Every figure quoted
  in the frozen document was computed from files already on disk, and the transcript search that rebuilt
  the contamination disclosure read local session logs only.

## Accomplishments

- **ENV-01 is satisfied by the existence and ordering of one commit**, and nothing downstream can change
  that. The bars, the scripts, the item lists, the contamination disclosure, the termination clause and
  the advance no-significance statement are all in it.
- **Both Stage-0 discrepancies and the resolved cost source are recorded IN the frozen document rather
  than reconciled away**, and no Phase-22 artifact was edited.
- **The D-19 conditional's two branches and the D-17 retention protocol are frozen before the spike that
  resolves and consumes them.** Neither can be added retroactively; that is the whole reason they are
  here rather than in Wave 6.
- **The ENV-03 voter prompt is pinned so the reviewed instrument is provably the running one.** It had
  had only executing-session review, and it drives all 40 verdicts two waves from now.
- **The contamination disclosure is now evidence-derived rather than recalled**, and it caught an entire
  undisclosed session. See *The contamination-disclosure correction* below.
- 250/250 registered eval tests green (was 225/225; +25 new cases). Twelve eval test files run in CI.

## Task Commits

1. **Task 1: author the three artifacts** -- not committed by design; the plan requires the freeze commit
   to be Task 3's and to contain exactly three files.
2. **Task 2: maintainer content review** -- `blocking-human`, two rounds, recorded below. Nothing
   committed.
3. **Task 3: the freeze, then CI** -- `9ab9933` (freeze), then `813f1f6` (ci).

| Commit | ISO timestamp | Subject |
|---|---|---|
| `9ab9933` | 2026-09-07T23:37:33+02:00 | `freeze(23-04): the ENV-01 Phase-23 pre-registration, its anti-drift co-test and the q2 capture protocol` |
| `813f1f6` | 2026-09-07T23:38:26+02:00 | `ci(23-04): run the ENV-01 anti-drift co-test on push` |

Neither carries an AI attribution trailer or a generated-with line. Both messages were written to a file
with the Write tool and committed with `git commit -F`, and both subjects were confirmed with
`git log --oneline -1` afterwards, because a mangled subject still exits 0.

## The maintainer's review verdict -- TWO rounds, recorded as two

**Reviewer:** Lars Gyrup Brink Nielsen. **Date:** 2026-09-07. Recorded in the `## Review record` section
of BOTH `eval/lz-eval-p23-prereg.md` and `eval/lz-eval-p23-capture-driver.md`, inside the freeze commit
rather than after it.

- **Round 1 returned `revise-then-freeze`, on item 6** -- the contamination disclosure was found
  INCOMPLETE when checked against session-transcript evidence. Items 1-5 and 7-9 stood as authored.
- **The correction** rewrote Section (vii) as a per-session ledger measured from the transcripts.
- **Round 2, on the corrected document, returned `approve-as-frozen`.**

**A single-round "approved" would misstate what happened**, which is why both rounds are on the record in
the frozen document itself. The maintainer-ratified items -- the capture budget, the spike ceiling and
the balanced draw -- were ratified at discuss time and were not re-opened by this review.

All NINE checkpoint items were surfaced explicitly with their concrete values: the q2 question text and
its reasoning; the seed and the realized list; the cost-stream enumeration and the excluded stream; the
verification-complete definition and its caveat; the resolvability limits and the named omission; the
completeness of the contamination disclosure; the completeness of the three recorded discrepancies; the
generation-5 capture models and the third disclosure axis; and the pinned voter prompt with its two
digests.

## The q2 question, as approved

> **Which post-training quantization methods preserve accuracy at 4-bit for transformer inference, and
> what accuracy drop does each report?**

Frozen in both documents; the co-test asserts they state it identically, so no capture can drift from
what was reviewed. Chosen because it is bounded and single-facet (matching the narrowing that made
captures feasible at all), sits in an arXiv-dense literature so the canonical identifier space is
comparable to q1's rather than dominated by the `url:` fallback, forces numeric claims that must be
cited, and is topically disjoint from q1's context-window-extension subject.

## The two discrimination proofs, with their observed failure output

Per the project convention: a green test alone proves nothing. In both cases the artifact was tampered
with, the suite re-run, and the tamper reverted.

### Proof 1 -- one prose digit changed (`RESOLVE_LIMITS.MAX_BYTES` 262144 -> 262145)

**Result: 23 pass / 2 fail.** Both anti-drift cases fire, from opposite directions -- the correct value
goes missing AND the drifted value appears:

```
✖ ENV-01 anti-drift: the prereg prose NUMBERS match the frozen module constants byte-for-byte (0.6971ms)
  AssertionError [ERR_ASSERTION]: the pre-registration must carry the frozen RESOLVE_LIMITS.MAX_BYTES value verbatim: "| `RESOLVE_LIMITS.MAX_BYTES` | 262144 |"
      at TestContext.<anonymous> (file:///D:/projects/github/LayZeeDK/lz-advisor-claude-plugins/eval/lz-eval-p23-prereg.test.mjs:123:12)

✖ ENV-01 anti-drift is DISCRIMINATING: a wrong (constant + 1) value is NOT present in the prose (0.2881ms)
  AssertionError [ERR_ASSERTION]: a drifted RESOLVE_LIMITS.MAX_BYTES value must NOT be present (discriminating): "| `RESOLVE_LIMITS.MAX_BYTES` | 262145 |"
      at TestContext.<anonymous> (file:///D:/projects/github/LayZeeDK/lz-advisor-claude-plugins/eval/lz-eval-p23-prereg.test.mjs:134:12)
```

**Restored, re-run: `tests 25 / pass 25 / fail 0`, exit 0.**

### Proof 2 -- one character removed from the frozen voter template

The comma before `or unrefuted` was deleted from `VOTER_PROMPT_TEMPLATE` in
`eval/lz-eval-p23-sliceA-read.mjs`. **Result: 22 pass / 3 fail** -- both digests and the verbatim-quote
assertion, which is the point of pinning it three ways:

```
✖ ENV-03: the rendered voter prompt template matches its pinned sha256 (what was reviewed is what runs) (1.4083ms)
  AssertionError [ERR_ASSERTION]: buildDispatchString rendered a template that does not match the frozen sha256 -- the instrument changed
  + actual - expected
  + 'b7609d68f9184badeffe971138a01207f54732191ede5f52e8a85227a8925145'
  - '8a93c283591b1e81046a8d1d61da9d0e035ea922c5105afacf215b911309fe5a'

✖ ENV-03: a fixed synthetic instantiation matches its pinned sha256 (0.1676ms)
  AssertionError [ERR_ASSERTION]: the synthetic dispatch string drifted
  + actual - expected
  + '641906edfd5fcdf778812f73db1ac31d64c69ed48ecdd1d66f2b0813861dcfc8'
  - '4a2c47f2a70009762addb16f2485d362a13eda8ed0490406ecd4f654f1aa4efe'

✖ ENV-03: the pre-registration quotes the rendered voter prompt template VERBATIM (0.2167ms)
  AssertionError [ERR_ASSERTION]: the pre-registration must quote the template buildDispatchString renders, byte-for-byte
```

**Restored with `git checkout -- eval/lz-eval-p23-sliceA-read.mjs`, re-run: `tests 25 / pass 25 / fail 0`,
exit 0.** This is exactly the silent failure the pin exists to prevent: a template that drifted between
the freeze and the dispatch would invalidate all 40 verdicts without failing anything.

## The contamination-disclosure correction -- a first-class finding

**The disclosure as first authored was wrong in three ways, and the maintainer could not recall what had
been read.** The Claude session transcripts under
`~/.claude/projects/D--projects-github-LayZeeDK-lz-advisor-claude-plugins/` were therefore parsed as
JSONL and each tool call's RETURNED output measured. The measure is what entered a model's context, not
what a process opened -- several operations read a whole file and printed only counts, and only printed
output can contaminate.

| # | Error | Corrected to |
|---|---|---|
| 1 | **An entire session was undisclosed.** The head/tail prose reads were attributed to "the designing session (2026-09-06)". | Session `47836ace`, a `/gsd-explore` session at **2026-09-05T22:43-23:15**, is now entry C. It is the ONLY session that read substantial report prose (~8.9 KB) before the ENV-04 bar was designed. The designing session (`bd364133`) did not begin until 23:17, **29 minutes later**, and **its main thread read neither report at all** -- every access was its research subagent's. |
| 2 | **"the head and both tails of both q1 reports" overstates and is ambiguous.** | **ONE head (built-in, 40 lines) and TWO tails (built-in 25, lz 18). The lz report's head was never read in that session.** |
| 3 | **The research-session line ranges were understated.** Authored as "~6 source-list lines from each (built-in 116-119, lz 109-114)". | Built-in **114-120** (7 lines), lz **108-116** (9 lines), PLUS built-in verification-ledger lines **80-84** (5 lines), which the draft did not mention at all. Each line truncated to 200 chars. |

Section (vii) is now the fullest form: **every session that touched either report**, including the two
that saw only metadata (`a6cef555` and `5f330ed4`), each labelled with what it returned. It also records
that stream access was bounded to provenance fields (`system/init` model and version, `total_cost_usd`)
in every session and never printed report prose, and it names its own provenance -- a transcript search
on 2026-09-07 -- so a later reader knows it is evidence-derived rather than remembered.

**Correcting it before the freeze is the point.** After the freeze the same correction would cost a
numbered, dated amendment.

### This is the FIFTH recorded figure in this phase that disagreed with disk

Every one caught by measuring rather than trusting:

| # | Claim | Disk |
|---|---|---|
| 1 | 23-01-PLAN: the lz q1 stream pins `claude-opus-4-8` | it pins `claude-sonnet-4-6[1m]` |
| 2 | 23-PATTERNS: no seeded PRNG exists in the tree | a private `mulberry32` was already in `eval/lz-eval-mcc.mjs` |
| 3 | 23-03-PLAN and D-21: 13 unique canonical sources | 18; 13 is the unique-marker-VALUE count |
| 4 | 23-04-PLAN: "all seven discretionary items" | its own acceptance criteria say NINE |
| 5 | the contamination disclosure's attributed sessions and line ranges | a whole session missing, one head not two, ranges understated |

The through-line the phase handoff asked a resuming session to carry -- verify from disk, record the
discrepancy, never bend the artifact to hit the expected number -- held on all five.

## Deviations from Plan

### 1. [Plan-directed] CI registration is a SEPARATE commit from the artifact it tests

- **Found during:** Task 3 (by plan instruction, not discovery)
- **What the phase's other plans did:** registered each new test file in `.github/workflows/ci.yml` in
  the SAME task that created it. Plans 23-01, 23-02 and 23-03 all followed that rule.
- **What landed instead:** the freeze commit `9ab9933` contains exactly the three freeze artifacts, and
  `eval/lz-eval-p23-prereg.test.mjs` was appended to the eval-tree step in the separate follow-up commit
  `813f1f6`.
- **Reason:** the freeze commit's timestamp is the pre-registration timestamp of record for the whole
  phase, and every later plan's ancestry check refers to it. A freeze commit that also carries CI churn
  muddies what exactly was frozen and when. This is the Phase-22 lesson applied deliberately.
- **Also recorded** in the workflow's own comment block, so a reader of `ci.yml` meets the reason where
  the exception lives rather than only here.

### 2. [Rule 2 - Missing Critical] The pre-registration is deliberately NOT strictly ASCII

- **Found during:** Task 1
- **Issue:** the Phase-22 analog's co-test asserts both frozen documents are strictly ASCII. This
  pre-registration cannot be: the plan requires the realized 40-item draw quoted verbatim, and those
  claim strings are corpus data carrying `U+2019` (x10) and `U+00A0` (x1). Transliterating them would
  make the quoted list something other than the item set the voter is dispatched.
- **Fix:** the co-test asserts a NARROWER but still discriminating property -- every non-ASCII character
  in the pre-registration must be one the corpus itself emits, derived at test time from
  `drawBalanced(DRAW.SEED)`. That pins the exception to quoted data instead of licensing non-ASCII
  anywhere in the prose. The driver is still asserted strictly ASCII, and both files are asserted BOM-free
  and LF-only.
- **Files:** `eval/lz-eval-p23-prereg.test.mjs`
- **Committed in:** `9ab9933`

### 3. [Rule 2 - Missing Critical] The q2 question text lives in BOTH documents

- **Found during:** Task 1
- **Issue:** the plan requires the q2 question in the driver only. But the driver is the document that
  executes, and the pre-registration is the document that is frozen -- a frozen item set that lives only
  in the executing document can drift from the frozen authority without failing anything.
- **Fix:** the question is stated in the pre-registration's Section (i) as well, and the co-test asserts
  both documents carry the identical string.
- **Files:** `eval/lz-eval-p23-prereg.md`, `eval/lz-eval-p23-prereg.test.mjs`
- **Committed in:** `9ab9933`

### 4. [Rule 2 - Missing Critical] TWO sha256 pins on the voter prompt, not one

- **Found during:** Task 1
- **Issue:** the plan asks for a sha256 over the template rendered with "a fixed synthetic claim and
  cutoff". That pins one instantiation, but the thing the maintainer reads at the checkpoint is the
  TEMPLATE, with its placeholders intact.
- **Fix:** the template is rendered by passing each placeholder as its own literal value, which
  round-trips exactly because the substitution is a single non-global scan through a replacer function
  (the T-22-15 fix) and inserted text is never re-scanned. That rendering is what the prose quotes and
  what the first digest pins; the plan's fixed synthetic instantiation is pinned as a second digest.
  Proof 2 above shows a one-character edit failing all three assertions.
- **Files:** `eval/lz-eval-p23-prereg.md`, `eval/lz-eval-p23-prereg.test.mjs`
- **Committed in:** `9ab9933`

### 5. [Rule 1 - Bug] A corpus non-breaking space lost in transcription, caught by the draw-verbatim test

- **Found during:** Task 1
- **Issue:** the claim for `refuted drawIndex=168` carries a `U+00A0` after "Kings". The first draft of
  the quoted draw wrote a plain space there. The two strings are visually identical and 175 characters
  each; only a code-point comparison distinguishes them.
- **Fix:** the offending line was rewritten from the corpus by script (the Edit tool does not round-trip
  non-ASCII reliably in this repository -- Plans 23-01 and 23-02 both hit the same wall). The guard is now
  permanent: the co-test re-derives all 40 lines from `DRAW.SEED` and asserts each appears verbatim, so a
  transcription slip in the frozen item list fails a test rather than silently changing what 40 verdicts
  are asked.
- **Verification:** `D-08/D-09: the pre-registration quotes the realized 40-item draw in full, verbatim`
  passes; 40 of 40 quoted.
- **Committed in:** `9ab9933`

---

**Total deviations:** 1 plan-directed (the CI split) + 4 auto-fixed (3 missing-critical hardenings, 1 bug).
**Impact:** no scope creep, no criterion weakened, no task descoped. Deviations 2-4 each make a plan
requirement into something a test can actually check; deviation 5 corrected the frozen item list before it
became unrewindable.

## Verification

| Check | Result |
|---|---|
| `node --test eval/lz-eval-p23-prereg.test.mjs` | 25/25 pass, exit 0 |
| `node --test eval/lz-eval-p23-sliceA-draw.test.mjs eval/lz-eval-p23-verify-complete.test.mjs eval/lz-eval-p23-resolvability.test.mjs eval/lz-eval-sliceA-gold.test.mjs` | 71/71 pass, exit 0 |
| Full registered eval suite (12 files, explicit FILE form) | 250/250 pass, exit 0 |
| `node --test eval/lz-eval-packaging-boundary.test.mjs` | included above, pass |
| Freeze commit contains exactly three paths | confirmed, name-only check exit 0 |
| `git merge-base --is-ancestor 9ab9933 HEAD` | exit 0 |
| Both anti-drift discrimination proofs RUN with failure output recorded | confirmed, verbatim above |
| `eval/lz-eval-parity-prereg.md` unchanged | confirmed clean before and after |
| `.planning/notes/phase-22-diagnosis-two-root-causes.md` unchanged | confirmed clean before and after |
| `git diff .planning/config.json .planning/STATE.md` empty before staging | confirmed |
| `git config user.email` is the public address | confirmed by ALLOWLIST INVERSION -- the only email-shaped token across git identity and all three artifacts is the approved public one; the excluded address was never written as a search needle |
| ASCII / LF / no BOM | driver and co-test strictly ASCII; pre-registration LF-only, BOM-free, non-ASCII limited to quoted corpus characters |
| ci.yml: 12 entries, no duplicates, FILE form, no coverage thresholds on the eval step | confirmed by non-comment scan; `--test-coverage-*` remains on the plugin-tree step only |

## Issues Encountered

- **The Edit tool still does not round-trip non-ASCII in this repository**, the same wall Plans 23-01 and
  23-02 hit. The initial Write placed the corpus Unicode correctly; the one transcription slip was
  repaired with a throwaway Node script reading the claim from the corpus, never by hand.
- **No SDK mutator was invoked during task execution.** `.planning/config.json` was read with the Read
  tool. `git diff .planning/config.json .planning/STATE.md` was empty before staging, and both files are
  byte-identical to HEAD. `query state.update-progress` was NOT called, per the standing finding that it
  is a no-op on this STATE.md format and deletes `branching_strategy` from `config.json`.
- **`requirements.mark-complete` was NOT run.** The orchestrator owns planning-file writes for this phase.
  `requirements-completed: [ENV-01]` is recorded in this SUMMARY's frontmatter; `.planning/REQUIREMENTS.md`
  is left to the orchestrator.
- **The irreplaceable gitignored caches are intact.** No `git clean` was run in any form. Nothing under
  `eval/.cache/` or `.lz-research/` was written, deleted or truncated -- every access was a read.

## Review record

`eval/lz-eval-p23-prereg.md` and `eval/lz-eval-p23-capture-driver.md` both carry a `## Review record`
section with the two-round verdict, the reviewer and the date, recorded INSIDE the freeze commit.

**ENV-08 stays OPEN.** It is a phase-wide gate covering every eval script and every LLM-steering reference
in the phase, and it closes in Plan 23-09. `.planning/WINDOWS.md` defect id 1 -- the independent content
review of the Wave-3 dry-run record and the Wave-1/2/3 eval modules, which have had only
executing-session review -- remains open and blocks `/gsd-ship`, not this freeze.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Plan 23-05** (ENV-03: dispatch the frozen 40 Slice-A items, then publish the never-pooled
per-direction descriptive read). Wave 4 is complete and the spend gate is now OPEN.

Carried forward, for the plans that consume this:

- **Every later plan must prove its own ancestry** with
  `git merge-base --is-ancestor 9ab993319da0fc3a10ae0cba45f10cb19576b93a HEAD`, never a timestamp
  comparison.
- **Plan 23-05 dispatches through `buildDispatchString` and persists through `writeDispatchRecord` per
  item, at dispatch time.** The template is now sha256-pinned, so an edit to it between here and there
  fails CI rather than silently changing what 40 verdicts were asked.
- **Plan 23-06 must run the D-17 retention step as its FIRST post-capture action** and record the D-19
  first observation BEFORE computing any rate. Both are frozen preconditions now, not suggestions, and
  the driver gives exact source and destination paths for both systems.
- **Plan 23-06 must record the realized resume-cycle and reset-window counts explicitly.** They are
  observations the session makes; nothing in the module can derive them, and `spikeCleared` publishes them
  either way under D-07.
- **Any change to the frozen document after a reading is seen is a numbered, dated AMENDMENT with the
  maintainer ratification noted -- never an edit.** The convention is frozen in the document's empty
  `## AMENDMENT RECORD` section.
- **ENV-01 is COMPLETE** and cannot be undone by anything downstream: it is satisfied by the existence and
  ordering of commit `9ab9933`. **ENV-08 stays OPEN** until 23-09.

## Self-Check: PASSED

- `eval/lz-eval-p23-prereg.md` -- FOUND (967 lines)
- `eval/lz-eval-p23-prereg.test.mjs` -- FOUND (550 lines)
- `eval/lz-eval-p23-capture-driver.md` -- FOUND (295 lines)
- `.github/workflows/ci.yml` -- 12 explicit entries (11 pre-existing kept + 1 appended), FILE form
  preserved, no coverage thresholds on the eval step
- Commits `9ab9933` and `813f1f6` -- both FOUND in `git log`
- Plan `<verification>`: prereg co-test 25/25 exit 0; four-file gate 71/71 exit 0; full registered suite
  250/250 exit 0; freeze commit name-only check exit 0; ancestry test exit 0; both discrimination proofs
  RUN with failure output recorded verbatim above; `eval/lz-eval-parity-prereg.md` and the diagnosis note
  both clean; `git diff .planning/config.json .planning/STATE.md` empty before staging
- All task `<acceptance_criteria>` re-run and passing, including every required section present with a
  non-empty body, the NINE checkpoint items surfaced with a recorded response, the review verdict written
  into BOTH documents, and the ratio-scoped ordering claim with the 18-source exception named
- ZERO SPEND confirmed: no model call, no network request, no capture, no vote, no score

---
*Phase: 23-judge-free-confidence-and-operating-envelope-for-lz-deep-res*
*Completed: 2026-09-07*
