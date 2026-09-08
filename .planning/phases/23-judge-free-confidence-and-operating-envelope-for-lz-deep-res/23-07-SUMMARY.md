---
phase: 23-judge-free-confidence-and-operating-envelope-for-lz-deep-res
plan: 07
subsystem: testing
tags: [deep-research, eval, env-04, citation-audit, resolvability, quote-match, coverage, partial-q2]

requires:
  - phase: 23-04
    provides: the ENV-01 pre-registration freeze carrying the frozen ENV-04 rules, the D-19 conditional and the contamination disclosure
  - phase: 23-06
    provides: the option-A q2 capture pair -- one admissible lz report with its 15-file excerpt corpus, one built-in capture that ran and produced no report -- plus the D-19 branch-A determination in the spike record
  - phase: 23-03
    provides: the frozen audit and resolvability modules, and the published q1 dry run whose rows are carried separately
provides:
  - "the ENV-04 reading of reference, published under a single machine-readable PARTIAL-Q2 status line"
  - "the lz q2 offline audit: 12 canonical sources, 0 unmatched, citation COVERAGE 59 of 67, quote-match 1 of 8"
  - "the dated q2 resolvability envelope: 12 of 12 resolvable as of 2026-09-08T09:30:52.465Z, with per-system attribution"
  - "the PARTIAL-Q2 reason recorded as a MEASURED shortfall behind a dispatched capture, never as a descope"
  - "D-19 branch A recorded as in force, with the reason the symmetric match did not run distinguished from branch B's premise"
  - "four findings against the plan and the frozen artifacts, none reconciled by editing anything frozen"
affects: [23-08, 23-09, milestone-audit]

actuals:
  tokens: 10600
  tasks: 3
  commits: 2

tech-stack:
  added: []
  patterns:
    - "a status line, not a keyword count, is what makes an absent reading legible to a downstream plan"
    - "an inherited population rule is proven by reproducing the published prior population before it is applied to new data"

key-files:
  created:
    - eval/lz-eval-p23-citation-audit-q2-record.md
    - eval/.cache/p23-read/citation-audit-q2-lz.json
    - eval/.cache/p23-read/resolvability-q2.json
    - .planning/phases/23-judge-free-confidence-and-operating-envelope-for-lz-deep-res/23-07-SUMMARY.md
  modified:
    - .planning/WINDOWS.md
    - .planning/REQUIREMENTS.md

key-decisions:
  - "ENV-04 is published under PARTIAL-Q2, and its reason is the built-in q2 capture having run under option A and produced no admissible report -- never option B and never an amendment-driven descope"
  - "D-19 branch A is recorded as in force; the symmetric quote-match was impossible because no built-in REPORT exists, which is a different fact from branch B's premise that no content is retained"
  - "the q1 quote population rule was inherited by section title and PROVEN by reproducing the published q1 five-quote population exactly before being applied to q2"
  - "an absence ROW was added to the per-system table rather than dropped, on the same reasoning the plan gives for an absent column"

patterns-established:
  - "Pattern: where a frozen label's stated CONDITION does not describe a realized case, carry the label verbatim and record the realized reason beside it -- never edit the frozen label to fit"
  - "Pattern: prove a bidirectional discrimination for a consistency gate by flipping the asserted value to EVERY wrong member of its enumeration, then restoring byte-exact"

requirements-completed: [ENV-04]

coverage:
  - id: D1
    description: "The offline q2 citation audit ran over the one admissible q2 report on unmodified frozen rules, reporting canonical unique sources, the named unmatched bucket, surface markers and structural citation coverage per system"
    requirement: "ENV-04"
    verification:
      - kind: other
        ref: "node eval/lz-eval-p23-citation-audit.mjs eval/.cache/p23-baseline/lz/q2/q2-run1.report.md -> sources=12 unmatched=0 markers=0/0 uncited-units=59/67"
        status: pass
      - kind: other
        ref: "two independent runs asserted byte-identical, sha256 d08e82350c8a4b1a293a94c63e33202c41c645cd8f1dfc07c41d24010b3c60d0"
        status: pass
      - kind: unit
        ref: "eval/lz-eval-p23-citation-audit.test.mjs (29 tests)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Every q2 MANIFEST present on disk validates before its report is read, and the one absent report is recorded as an absence with its mechanical failing field rather than audited anyway"
    requirement: "ENV-04"
    verification:
      - kind: other
        ref: "node eval/lz-eval-baseline-manifest.mjs eval/.cache/p23-baseline/lz/q2/q2-run1.MANIFEST.json -> manifest valid: model=claude-sonnet-5 ccVersion=2.1.263; [OK] 1 of 2 q2 manifest(s) present and validating"
        status: pass
    human_judgment: false
  - id: D3
    description: "The verbatim-quote match ran within the pre-frozen D-19 branch's scope against the retained excerpt corpus, with the realized single-system scope recorded in the output object itself"
    requirement: "ENV-04"
    verification:
      - kind: other
        ref: "citation-audit-q2-lz.json quoteMatch 1/8 with quoteMatchScope.d19Branch=A and d19BranchSource=spike-record Part 1 @41b70f5"
        status: pass
    human_judgment: false
  - id: D4
    description: "The dated live resolvability half is reported separately, bounded by the frozen controls, carrying no response bodies, with per-system attribution and its named never-existed-versus-died-since limitation"
    requirement: "ENV-04"
    verification:
      - kind: other
        ref: "node eval/lz-eval-p23-resolvability.mjs -> checked=12 checkedAt=2026-09-08T09:30:52.465Z resolvable=12; envelope gate asserts ISO date, records array, no body/text key"
        status: pass
      - kind: unit
        ref: "eval/lz-eval-p23-resolvability.test.mjs (14 tests)"
        status: pass
    human_judgment: false
  - id: D5
    description: "The record is published under exactly one machine-readable ENV-04 status line whose value is asserted consistent with how many q2 audit outputs exist on disk, with a bidirectional flip-the-line discrimination proof"
    requirement: "ENV-04"
    verification:
      - kind: other
        ref: "status gate PASS on PARTIAL-Q2 (8 rows >= 3); FAIL on BAR-SET-ON-Q2 and FAIL on NOT-RUN; restored byte-exact sha256 0a569b6f60c1beb4d995c81c0fc5af7ad14b1894e609ae8c31dc73057b6d6450"
        status: pass
    human_judgment: false
  - id: D6
    description: "The record's wording and labelling properties -- coverage never worded as support, resolvability never as source quality, the q1 rows never as a bar, the PARTIAL-Q2 reason never as a descope, and branch A never presented as branch B"
    requirement: "ENV-04"
    verification: []
    human_judgment: true
    rationale: "These are wording properties. A search for a particular word would prove only that the word is absent, so the honest verification is the independent ENV-08 content review, which is OWED and closes in Plan 23-09. Recorded as defect id 2 in .planning/WINDOWS.md."

duration: 12 min
completed: 2026-09-08
status: complete
---

# Phase 23 Plan 07: The ENV-04 q2 citation audit, published under PARTIAL-Q2 Summary

**One admissible q2 report existed, so ENV-04 publishes a single-system q2 reading -- 12 canonical
sources, citation COVERAGE 59 of 67, quote-match 1 of 8, resolvability 12 of 12 -- under a machine-readable
`PARTIAL-Q2` status whose reason is a MEASURED shortfall behind a dispatched capture, not a descope.**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-09-08T09:25Z (approximate: no `PLAN_START_TIME` was captured; bounded below by the
  parent commit `4b2eb14` at 09:24:21Z and above by the first artifact write at 09:29:18Z)
- **Completed:** 2026-09-08T09:37Z
- **Tasks:** 3 of 3
- **Files created/modified:** 1 committed record, 2 gitignored cache outputs, 3 planning files

## The Plan 23-06 option and the resulting q2 report count -- stated first, because everything is conditional on it

**Option `A`.** Read from `23-06-SUMMARY.md`: "Choice: option `A` -- proceed now, retention-first,
capturing BOTH sides of the fresh q2 pair", ratified by the maintainer on 2026-09-08. Neither option B nor
option C was taken, **no descope occurred, and Plan 23-06 wrote no AMENDMENT RECORD** because none was
required.

**Resulting q2 report count: 1 of 2.** And NOT for the reason this plan's gates and prose assume.

| System | Capture dispatched | Report produced | Admissible |
|---|---|---|---|
| built-in `/deep-research` | YES -- cold run plus resume cycle 1, full metered cost | **NO** | **NO** |
| `lz-advisor:lz-deep-research` | YES -- one invocation, rc=0 | YES, 14306 bytes | **YES** |

So `ENV-04 status: PARTIAL-Q2`, and its reason is **"the built-in q2 capture ran under option A and
produced no admissible report"**. It is neither "option B was selected" nor an amendment-driven descope.
Publishing a measured shortfall as a pre-registered budget choice would understate what was learned about
the reference system.

## Task 1 -- the offline q2 audit on frozen rules

### Manifest admissibility, asserted before any report was read

```
$ node -e "<the plan's Task-1 precondition gate>"
manifest valid: model=claude-sonnet-5 ccVersion=2.1.263
[OK] 1 of 2 q2 manifest(s) present and validating
exit=0
```

Only the lz manifest exists at a validating path. The built-in side carries
`q2-run1.MANIFEST.INADMISSIBLE.json` with `admissible: false` and this mechanical failing field, quoted
from `validateManifest`'s own distinct error rather than judged:

```
manifest report file does not exist (truncated/empty capture?):
eval/.cache/p23-baseline/builtin/q2/q2-run1.report.md
```

This is an **absence of a report behind a capture that ran** -- distinct from an option-B/C case where no
capture was dispatched and there would be no failing field at all. No manifest, report or placeholder was
fabricated to make any check pass.

### The audit CLI output, verbatim

```
$ node -e "<the plan's Task-1 audit gate>"
sources=12 unmatched=0 markers=0/0 uncited-units=59/67
[OK] audited 1 q2 report(s)
exit=0
```

Full per-system output, through `auditReport({ reportText, excerpts, quotes })` with the excerpt corpus and
quote population supplied:

```
lz q2: sources=12 unmatched=0 markers=0/0 uncited-units=59/67 quote-match=1/8 quotes=8 excerpts=15
```

The `unmatched` field is present and reports **0**, as a field rather than an omission.

### Byte-identical re-run, asserted rather than claimed

```
run1 sha256=d08e82350c8a4b1a293a94c63e33202c41c645cd8f1dfc07c41d24010b3c60d0
run2 sha256=d08e82350c8a4b1a293a94c63e33202c41c645cd8f1dfc07c41d24010b3c60d0
[OK] two independent runs of the offline q2 audit are BYTE-IDENTICAL
```

### The D-19 branch, quoted from its source

Read from `eval/lz-eval-p23-spike-record.md` **Part 1**, recorded pre-rate and committed at `41b70f5`:

> **Determination: YES. Branch A is selected.**
>
> > **Branch A** -- the built-in's workers DO leave recoverable fetched content: a symmetric verbatim
> > quote-match runs on BOTH systems for q2.

**Branch A is in force. No branch was selected here and D-19 was not re-opened.** A spike record DOES
exist, because option A ran the built-in capture that is the spike, so there is no AMENDMENT RECORD to cite
in its place.

**And the symmetric match still did not run -- for a different reason than branch B would have given.**
Branch B's premise is that the built-in leaves no recoverable content. That premise is false here: 15
fetched documents and 203 worker transcripts (87 MB) are retained. What is absent is a built-in **report**,
so there are no built-in quoted spans to extract. The lz quote-match is therefore de facto single-system,
and the realized scope is recorded **inside the output object** at `quoteMatchScope`
(`d19Branch: "A"`, `symmetric: false`, with the reason spelled out), not only in surrounding prose.

### Both module files unchanged

`git status --short` reports nothing for `eval/lz-eval-p23-citation-audit.mjs`,
`eval/lz-eval-p23-resolvability.mjs` or `eval/lz-eval-p23-prereg.md`. Applying frozen rules did not modify
them; a diff in either module would be the signature of a rule tuned after seeing q2 (T-23-02e).

### Co-test

```
$ node --test eval/lz-eval-p23-citation-audit.test.mjs
tests 29  pass 29  fail 0
```

## Task 2 -- the dated live resolvability check

```
$ node eval/lz-eval-p23-resolvability.mjs <q2-identifier-union.json> eval/.cache/p23-read/resolvability-q2.json
union size=12 (lz only -- the built-in q2 report does not exist)
checked=12 checkedAt=2026-09-08T09:30:52.465Z resolvable=12
exit=0
```

**Check date: 2026-09-08T09:30:52.465Z. Outcome breakdown: 12 resolvable of 12; zero dead, oversize,
timeout, scheme-blocked, redirect-limit or network-error.** Every outcome was asserted to be a member of
the frozen `RESOLVE_OUTCOMES` enumeration.

- The union is the lz canonical identifier set alone. **No q1 identifier union was substituted.**
- Per-system attribution lives at the ENVELOPE level (`attribution.bySystem`), so the record reports
  per-system rows without re-fetching. `builtin: []`, with a note that the emptiness is an absent report
  rather than a system that cited nothing. Attribution was added at envelope level deliberately: the
  module's per-record contract is EXACTLY five keys and its co-test asserts that, so a sixth per-record key
  would have broken a frozen contract.
- Envelope gate: `[OK] dated envelope, 12 records, no bodies retained`. All 12 records carry exactly
  `finalUrl, identifier, outcome, requestUrl, status`.
- The run was neither partial nor network-unavailable, so no `notRun` reason applies. The offline outputs
  from Task 1 are byte-unchanged by this task.
- Frozen controls unchanged: `TIMEOUT_MS 10000`, `MAX_BYTES 262144`, `MAX_REDIRECT_HOPS 3`,
  `SCHEME_ALLOWLIST ['http:','https:']` re-validated per hop, no credentials or cookies.
- **Named limitation carried forward:** this check does not distinguish an identifier that never existed
  from one that has since died. Every outcome is true as of the check date and of no other date, and
  resolvability is not a source-quality measure.

```
$ node --test eval/lz-eval-p23-resolvability.test.mjs
tests 14  pass 14  fail 0
```

## Task 3 -- the published record and its status line

`eval/lz-eval-p23-citation-audit-q2-record.md` (24578 bytes, strictly ASCII, LF, no BOM), committed at
`3ada1b3`.

**Published value: `ENV-04 status: PARTIAL-Q2`** -- one such line in the whole document, and it is what the
structural check reads. The record legitimately discusses the branches it did not take, so a check
counting keyword mentions would have failed on a correct document.

### The flip-the-line discrimination proof, in BOTH wrong directions

```
=== 1. AS PUBLISHED (PARTIAL-Q2) ===
[OK] status PARTIAL-Q2 consistent with 1 output(s)
exit=0
=== 2. FLIPPED to BAR-SET-ON-Q2 ===
Error: 1 q2 audit output(s) on disk implies PARTIAL-Q2 but the record says BAR-SET-ON-Q2
exit=1
=== 3. FLIPPED to NOT-RUN ===
Error: 1 q2 audit output(s) on disk implies PARTIAL-Q2 but the record says NOT-RUN
exit=1
=== 4. RESTORED ===
[OK] status PARTIAL-Q2 consistent with 1 output(s)
exit=0
[OK] restored byte-exact, sha256=0a569b6f60c1beb4d995c81c0fc5af7ad14b1894e609ae8c31dc73057b6d6450
```

Flipping to EVERY other member of the enumeration was tested, not just one, so the gate is proven to
discriminate in both wrong directions rather than merely to reject a single value. The restore was
asserted byte-exact.

### Both Task-3 gates

```
$ rg -q -F -e '## Review record' -e 'citation COVERAGE' -e 'exploratory' -e 'not-bar-setting' <record>
exit=0     (each of the four literals verified present individually: 1, 3, 1, 3 occurrences)

$ node -e "<the exactly-one-status assertion>"
[OK] status PARTIAL-Q2 consistent with 1 q2 audit output(s); 8 rows (>= 3)
exit=0
```

### What the record carries

- **Three MEASURED rows plus one ABSENCE row**, one per system per question, nothing merged or averaged:
  lz q2 (the reading of reference), built-in q2 (every cell reads not-run with its reason), built-in q1 and
  lz q1 (labelled not-bar-setting **inside the table**). The absence row was added rather than dropped, on
  the same reasoning the plan gives for an absent column -- a dropped row is how a missing reading becomes
  invisible. The gate's floor of three rows permits it.
- All four q1 disclosures: no MANIFEST until 23-01, no retained built-in evidence corpus, a retry-inflated
  built-in cost (67.085261 enumerated, not the 48.5367785 cold stream alone), and two prior sessions with
  partial sight.
- D-04 where a reader meets it, plus the three-axis disclosure: **q1 and q2 differ on model generation AND
  Claude Code version** (`claude-opus-4-8` / `claude-sonnet-4-6[1m]` at CC 2.1.186 against `claude-opus-5` /
  `claude-sonnet-5` at CC 2.1.263), so the pairing is weak even unaveraged and no difference is attributable
  to any single axis.
- The uncited-unit **column heading itself** reads `citation COVERAGE`, and a dedicated section states that
  a factual-support measure was NOT computed, why no deterministic judge-free version can exist, and that
  it is a named not-established item rather than a gap.
- An explicit three-item negative list: no topical relevance, no factual support, no
  never-existed-versus-died-since distinction.
- Cost as an operating observation only: **14.93 against 55.31 is not presented as a clean per-run
  comparison**, with the retry history and the 79.32 upper bound attached.
- The format asymmetry as measured, with the explicit statement that the q2 asymmetry could NOT be measured
  for want of a second side, and that the comparison rests on canonical identifiers rather than surface
  markers.
- The exploratory declaration and a `## Review record` section.

## Task Commits

Tasks 1 and 2 produced **no committable files**: both write only to `eval/.cache/p23-read/`, which
`.gitignore:18` excludes (`git check-ignore -v` confirms both paths). That is exactly why the plan
promotes their outputs into one committed durable record -- T-23-06, a result that dies with one cache
wipe is not a published result. So there is one task commit, not three.

1. **Task 3: publish the ENV-04 record of reference** - `3ada1b3` (docs)

**Plan metadata:** see the `docs(23-07)` commit following this SUMMARY.

## Files Created/Modified

- `eval/lz-eval-p23-citation-audit-q2-record.md` - the committed ENV-04 reading of reference
- `eval/.cache/p23-read/citation-audit-q2-lz.json` - the lz q2 offline audit output, with the quote
  population, the 15-file excerpt list and the `quoteMatchScope` record (gitignored)
- `eval/.cache/p23-read/resolvability-q2.json` - the dated envelope with per-system attribution (gitignored)
- `.planning/WINDOWS.md` - defect id 2: the owed independent ENV-08 review of the new record
- `.planning/REQUIREMENTS.md` - ENV-04 marked complete

## Decisions Made

1. **The PARTIAL-Q2 reason is conditioned on disk, not on the plan's text.** The plan hardwires PARTIAL-Q2
   to Plan 23-06 option B; the realized cause is option A with no built-in report. The status VALUE is
   derived from how many audit outputs exist; the REASON is stated from what happened.
2. **Branch A recorded as in force, with the distinction stated explicitly.** Presenting this as branch B
   would have been convenient -- the practical outcome is identical -- and would have misstated an
   observation about the reference system.
3. **The quote population rule was inherited, and the inheritance was proven.** It is not frozen in the
   pre-registration; it exists only in the 23-03 SUMMARY. The extractor is asserted to reproduce the
   published q1 five-quote population exactly before it is applied to q2, so it is the same rule rather than
   a new one.
4. **An absence row, not a dropped row.** The plan's floor is three rows under PARTIAL-Q2; a fourth,
   explicitly-labelled absence row is more transparent and the gate permits it.
5. **Resolvability attribution at envelope level, not per record.** The module's five-key per-record
   contract is frozen and co-tested; attribution went beside `records`, not inside them.

## Deviations from Plan

### Auto-fixed and recorded findings

**1. [Rule 1 - Bug] The plan's PARTIAL-Q2 reason and its no-spike-record premise are wrong for the
realized branch**

- **Found during:** Task 1, establishing the report count.
- **Issue:** `23-07-PLAN.md` conditions PARTIAL-Q2 on Plan 23-06 resolving on option B, and its Task-3
  action text says that under PARTIAL-Q2 "no spike record exists" and the 23-06 AMENDMENT RECORD should be
  cited in its place. Realized: option **A**, the spike record **does** exist, and there is **no** AMENDMENT
  RECORD because nothing was descoped. Following the plan's wording would have published a measured
  shortfall as a pre-registered budget choice and cited a document that does not exist.
- **Fix:** the status value is derived from disk and the reason from `23-06-SUMMARY.md`. The plan text was
  NOT rewritten and the record states the realized cause in a dedicated section placed before any figure.
- **Verification:** the status gate passes and is proven to fail on both other enumeration members.
- **Committed in:** `3ada1b3`.

**2. [Rule 1 - Bug] A naive quoted-span regex measured a garbage figure, and it was caught before publication**

- **Found during:** Task 1, building the quote population.
- **Issue:** a pattern of the shape `/"([^"]{4,})"/g` reported **0 of 8** on the q2 report. Its inner length
  filter skips a 3-character span (`"the"`), after which it pairs that span's CLOSING quote with the next
  span's OPENING quote and swallows hundreds of characters of prose as a single "quote". Three of the eight
  extracted spans were multi-paragraph prose blocks.
- **Fix:** quote characters are paired SEQUENTIALLY in document order and the length filter is applied
  afterwards, with a span crossing a blank line rejected as an unbalanced-quote artifact. This is the
  faithful reading of "double-quoted span". The corrected figure is **1 of 8**.
- **Discrimination proof:** the corrected extractor reproduces the **published q1 five-quote population
  exactly** (`[OK] pairwise extractor reproduces the published q1 population exactly: 5 quotes`), asserted
  in the wrapper itself so a divergence would throw rather than publish. The naive form is therefore an
  implementation defect, not the frozen rule.
- **Files modified:** the audit wrapper only. `eval/lz-eval-p23-citation-audit.mjs` is `git status`-clean.

**3. [Rule 2 - Missing correctness requirement] The frozen quote-match label's stated condition does not
hold in this case**

- **Found during:** Task 1, recording the quote-match scope.
- **Issue:** `UNCITED.QUOTE_LABEL` reads "a SINGLE-SYSTEM diagnostic wherever only one side retained a
  corpus". Here BOTH sides retained a corpus and one produced no report, so the label's stated condition is
  false even though its conclusion (single-system) is right.
- **Fix:** the frozen label is carried **verbatim** in the output and a sibling `quoteMatchScope` field
  records the realized reason, the branch and its source. **The module was not edited** -- editing a frozen
  label to fit an observed case is the post-hoc move the freeze exists to remove.
- **Carried forward:** an ENV-07 finding about the frozen label's wording; whether it should be amended is
  the maintainer's call and nothing here amends it.

**4. [Recorded finding] The quote population rule is not frozen in the pre-registration**

- **Issue:** `eval/lz-eval-p23-prereg.md` freezes the extraction, canonicalization, quote-normalization,
  uncited-unit and resolvability rules, but **not** the quote POPULATION (which spans of a report are
  submitted to the matcher). It exists only in the 23-03 SUMMARY and the q1 output object.
- **Handling:** inherited by section title -- the q2 report carries the same five sections as q1 with the
  `(a)`-`(e)` enumerators dropped -- and the inheritance is proven by reproducing q1's population. Recorded
  as a finding about the freeze's completeness; nothing amends it.

**5. [Recorded observation, not a deviation] The q2 structural coverage figure is largely a report-FORMAT effect**

lz q2 reads 59 uncited of 67 against lz q1's 30 of 64. Measured rather than guessed: **19** of the 59
uncited q2 units are `Confidence:` / `Assurance:` metadata lines, a per-finding block the q1 report does not
have at all (0 there), and **10 of 23** q2 body paragraphs END on such a line, so under the frozen
passage-attribution rule those paragraphs are not marked cited and their remaining prose units are each
tested alone. The report format changed with the model generation, which is one of the three disclosed axes,
so this is **not** evidence that q2 cites worse than q1 and the record does not read it that way.

---

**Total deviations:** 3 auto-fixed (2 bugs, 1 missing correctness requirement) plus 2 recorded findings.
**Impact on plan:** no scope creep and no frozen artifact edited. Two of the three auto-fixes prevented a
published figure from being wrong -- one a false reason, one a garbage denominator.

## Figures checked against disk

**Every q1 figure reproduced exactly** -- built-in 18 sources / 3 unmatched (`marker:[16]`, `marker:[17]`,
`marker:[19]`) / 69-13 markers / 19 of 43 uncited; lz 12 / 0 / 0-0 / 30 of 64 / 3 of 5 quote-match; the
26-identifier union at 23 resolvable and 3 oversize as of `2026-09-07T12:33:22.655Z`, splitting 17+1 on the
built-in side and 10+2 on the lz side. **Zero q1 discrepancies.**

Every Plan 23-06 figure quoted here was re-read from the manifests rather than inherited, and all
reproduced: lz `costUsd` 14.930978050000009, `resumeCycles` 0, `isError` false, `model claude-sonnet-5`,
`ccVersion 2.1.263`, report 14306 bytes, 15 excerpt files; built-in `admissible: false`,
`costUsd 55.30793200000004`, `costUpperBoundUsd 79.32313525000006`, `resumeCycles 1`,
`model claude-opus-5`.

The only disagreements found this plan are the plan-text ones in deviations 1 and 3 -- claims about a
branch and a label, not measured values. **No implementation was bent to hit an expected number.**

## Threat mitigations applied

| Threat | Applied |
|---|---|
| T-23-05 SSRF | frozen two-scheme allowlist checked before every hop, manual redirects capped at 3, 10 s deadline, 262144-byte cap, no credentials or cookies; all 12 records asserted to carry exactly the five allowed keys, so no fetched body reached any output |
| T-23-02e rule tuned after seeing q2 | both module files and the pre-registration asserted `git status`-clean after the reading; the one frozen label that does not fit this case was carried verbatim rather than edited |
| T-23-28 branch chosen instead of read | branch A quoted from the committed spike record at `41b70f5` with its source named; the realized reason distinguished from branch B's premise rather than relabelled |
| T-23-01d auditing an inadmissible report | the lz manifest validated before its report was opened; the built-in report was never audited and its absence is recorded with the mechanical failing field |
| T-23-42 an absent reading read as an unfinished plan | published on this branch under one machine-readable status line, asserted consistent with disk and proven to discriminate in both wrong directions |
| T-23-15 format-sensitive metric | counts are cardinalities of the canonical identifier space; the unmatched bucket is reported at 0 as a field; the record states the q2 asymmetry was not measurable for want of a second side |
| T-23-29 semantic reading on a structural count | coverage label in the column heading, a dedicated not-computed section, and a three-item negative list |
| T-23-06 evidence loss | all three readings promoted into one committed record; **no `git clean` was run in any form**, and the ~87 MB retained evidence tree, both q2 captures and the excerpt corpora are untouched |
| T-23-14 oversized or never-settling response | frozen byte cap and abort deadline in force; no oversize, timeout or network-error outcome occurred |
| T-23-17 fetched text in a committed artifact | the record carries counts, labels and identifiers only; no excerpt or response body |
| T-23-SC package installs | none; `eval/package.json` unchanged, so the Package Legitimacy Gate does not apply |

## Issues Encountered

None beyond the deviations above. The live resolvability run completed on the first attempt with no
partial-run degradation, so the `notRun` path was not exercised (it remains covered by the co-test's
stubbed fetcher).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- **23-08 (ENV-07 envelope):** `ENV-04 status: PARTIAL-Q2` with the reason recorded as a measured shortfall.
  For the not-established table: the built-in q2 exclusion with its named failing field, the absent
  factual-support measure with its constraint reason, and the un-measurable q2 format asymmetry. Publishable
  operating findings: the 12-of-12 resolvability reading with its date, the structural coverage
  report-format effect, and the cost observation with its retry history and 79.32 upper bound.
- **23-09 (review closure):** the ENV-08 content review of this record is **OWED** and is recorded as
  defect id 2 in `.planning/WINDOWS.md`, with five named properties to review. The spike record's own ENV-08
  review remains owed as defect id 1.
- **No blockers.** `.planning/STATE.md` and `.planning/ROADMAP.md` were deliberately not touched by this
  executor, per the phase's handoff constraint on GSD SDK mutator side effects.

## Self-Check: PASSED

- `eval/lz-eval-p23-citation-audit-q2-record.md` -- FOUND, 24578 bytes, committed
- `eval/.cache/p23-read/citation-audit-q2-lz.json` -- FOUND, byte-identical across two runs
- `eval/.cache/p23-read/resolvability-q2.json` -- FOUND, ISO `checkedAt`, 12 records, no bodies
- `eval/.cache/p23-read/citation-audit-q2-builtin.json` -- **CORRECTLY ABSENT** (the disk fact the status
  line is asserted against)
- `eval/.cache/p23-baseline/lz/q2/q2-run1.report.md` -- FOUND, 14306 bytes, untouched
- `eval/.cache/p23-baseline/lz/q2/excerpts/` -- FOUND, 15 files, untouched
- `eval/.cache/p23-baseline/builtin/q2/session/` -- FOUND, retained evidence tree untouched
- commit `3ada1b3` -- FOUND in `git log`
- `eval/lz-eval-p23-citation-audit.mjs`, `eval/lz-eval-p23-resolvability.mjs`,
  `eval/lz-eval-p23-prereg.md` -- all `git status`-clean
- `git diff .planning/config.json .planning/STATE.md` -- EMPTY
- all plan `<verification>` items re-run and passing

---
*Phase: 23-judge-free-confidence-and-operating-envelope-for-lz-deep-res*
*Completed: 2026-09-08*
