ENV-04 status: PARTIAL-Q2

# ENV-04 citation audit -- the q2 reading of reference

**One admissible q2 report exists, so there is a single-system q2 reading and NO comparative q2 bar.**
The status line above is the one machine-readable statement of that fact in this document, and it is the
line Plan 23-09 and `/gsd-audit-milestone` read. Everything below it is prose, including the discussion of
branches this reading did not take -- so a check that counted keyword mentions would fail on a correct
document, which is why the check reads that single line instead.

This record is **exploratory** in the ICH-E9 sense: no hypothesis was pre-committed for the figures below
and none is confirmed by them. The audit rules were frozen two waves before any q2 report existed
(`eval/lz-eval-p23-prereg.md`, frozen at `9ab9933`); nothing about the metric was decided here, only
applied.

## Why PARTIAL-Q2, stated precisely -- it is a MEASURED shortfall, not a budget choice

This is the single most misreadable fact in this record, and the plan that produced it invited the
misreading, so it is stated before any figure.

**Plan 23-06 Task 1 resolved on option `A`.** The maintainer ratified the full pair on 2026-09-08, the
spend was authorized, and BOTH captures were dispatched at full metered cost. Option B (lz only) and
option C (both descoped) were pre-registered as valid completions and **neither was taken**; no descope
occurred and Plan 23-06 wrote no AMENDMENT RECORD, because none was required.

The built-in q2 capture then **ran** -- a cold run plus one resume cycle, spanning two reset windows --
and **produced no report at all.** That is why one side is missing.

| The reason PARTIAL-Q2 holds | Not the reason |
|---|---|
| The built-in q2 capture ran under option A and produced no admissible report | "Option B was selected" |
| A capture that was dispatched and did not deliver | "The built-in side was descoped to save budget" |
| A measured outcome about the reference system | An amendment-driven reduction in scope |

Publishing a measured shortfall as a pre-registered budget choice would understate what was learned about
the reference system, which is the transparency prohibition this phase binds every termination with.

Verified from disk rather than inherited from the plan text:

| Report | Files on disk | Verdict |
|---|---|---|
| lz q2 | `q2-run1.report.md` (14306 bytes) + `q2-run1.MANIFEST.json` | **ADMISSIBLE** -- `model=claude-sonnet-5 ccVersion=2.1.263` |
| built-in q2 | `q2-run1.MANIFEST.INADMISSIBLE.json` only -- **NO `report.md`** | **INADMISSIBLE** |

The built-in exclusion is mechanical, quoted from `validateManifest`'s own distinct error rather than
judged:

```
manifest report file does not exist (truncated/empty capture?):
eval/.cache/p23-baseline/builtin/q2/q2-run1.report.md
```

An inadmissible report is excluded with its failing field recorded and is never audited anyway. The
exclusion carries forward into ENV-07's not-established table.

## The D-19 branch: A is in force, and the reason the symmetric match did not run is NOT branch B's

The branch was **read**, not chosen here. Quoted from `eval/lz-eval-p23-spike-record.md` Part 1, recorded
pre-rate and committed at `41b70f5`:

> **Determination: YES. Branch A is selected.**
>
> > **Branch A** -- the built-in's workers DO leave recoverable fetched content: a symmetric verbatim
> > quote-match runs on BOTH systems for q2.

Branch A rests on retained evidence that exists on disk: 15 fetched documents under
`session/.../tool-results/` and 203 worker transcripts, 87 MB in total, the only copy of either.

**And yet no symmetric quote-match ran -- for a different reason than branch B would have given, and the
distinction is the point.** Branch B's premise is that the built-in leaves NO recoverable content. That
premise is false here: it does leave content. What is missing is a built-in q2 **report**, so there are no
built-in quoted spans to extract and no built-in side to compare against.

| | Branch B's premise | The realized situation |
|---|---|---|
| Recoverable fetched content on the built-in side | absent | **present** -- 15 documents, 203 transcripts |
| A built-in report to extract quotes from | present | **absent** |
| Symmetric quote-match possible | no | no |

The two arrive at the same practical outcome through different facts, and presenting this as branch B
would misstate what was observed about the reference system. **Branch A is recorded as in force. D-19 is
not re-opened and no branch was selected retroactively.** The realized scope is carried in the audit
output object itself, at `quoteMatchScope`, not only in this prose.

**D-18 travels with it so the limitation is not misread as permanent:** the quote-match asymmetry is a
RETENTION failure rather than a structural property of the built-in, evidenced by ordinary subagent
transcripts demonstrably retaining fetched web content. For q2 the retention succeeded on both sides; it
is the report that is absent.

## Per-system readings -- one row per system per question, never merged and never averaged

Three MEASURED rows plus one ABSENCE row. The absence row is present deliberately: a dropped row is how a
missing reading becomes invisible, which is the same reason a column with no value below reads not-run
rather than being left blank.

| System / question | Unique canonical sources | Unmatched tokens (named bucket) | Surface `[n]` markers (total / unique values) | Uncited text units -- **citation COVERAGE**, not support | Verbatim-quote match | Resolvability (check date in the section below) |
|---|---|---|---|---|---|---|
| **lz q2 -- THE READING OF REFERENCE** | **12** | 0 | 0 / 0 | **59 of 67** | **1 of 8** -- SINGLE-SYSTEM DIAGNOSTIC, not comparative | 12 resolvable of 12 |
| **built-in q2 -- ABSENCE, not a measurement** | not-run: no report produced | not-run: same reason | not-run: same reason | not-run: same reason | not-run: no report to extract quotes from | not-run: no identifiers to check |
| built-in q1 -- **published DRY RUN, not-bar-setting** | 18 | 3 (`marker:[16]`, `marker:[17]`, `marker:[19]`) | 69 / 13 | 19 of 43 | not computable (no retained corpus) | 17 resolvable, 1 oversize, of 18 |
| lz q1 -- **published DRY RUN, not-bar-setting** | 12 | 0 | 0 / 0 | 30 of 64 | 3 of 5 -- SINGLE-SYSTEM DIAGNOSTIC | 10 resolvable, 2 oversize, of 12 |

Every figure is a raw numerator over a raw denominator. The audit module emits no pre-rounded rate
anywhere, so no rounding rule can move a published figure. Unique-source counts are cardinalities of the
canonical identifier set per report, so the two systems' incompatible surface formats cannot move the
comparison.

**D-04, where a reader meets it:** at n=2 questions **no per-question generalisation is available.** That
is a limit on the CLAIM, not merely a wide interval. And the q2 reading is single-system, so at q2 there
is no cross-system comparison at all -- only one system's reading.

### The q1 rows are a published dry run, and carry all four of their disclosures

They appear on every branch because the Wave-3 dry run already ran at zero spend. They **do not set the
ENV-04 bar and are not checked against one** (D-20), and the fresh-pair bar (D-02) is unavailable here
because the fresh pair is incomplete. No fallback onto q1 exists: under D-02 the bar is either set on the
fresh pair or NOT SET.

1. **q1 had no MANIFEST** until Plan 23-01 built one, so its admissibility was established after the fact.
2. **q1 has no retained built-in evidence corpus at all**, so its built-in quote-match is not computable
   and cannot be made computable -- the session aged out of `~/.claude/projects` entirely.
3. **The q1 built-in capture cost is retry-inflated** across three resume cycles plus an earlier
   billing-limit failure; the run's enumerated total is 67.085261, not the 48.5367785 that names the cold
   stream alone.
4. **Two sessions had partial sight of q1 before and during the metric's design; a third, the executing
   session, read the reports to run the audit.** Of the first two, one read roughly 8.9 KB of report prose
   and one ran programmatic structure scans over both full reports. A bar set on data the designer has
   seen measures the designer. That is three sessions in total with partial sight of q1.

### Why q1 and q2 cannot be paired, even unaveraged

The two questions differ on **three axes at once**: contamination (three sessions have partial sight of
q1; none has seen q2), question identity (different subjects), and **model generation AND Claude Code
version** -- q1 on `claude-opus-4-8` / `claude-sonnet-4-6[1m]` at CC 2.1.186, q2 on `claude-opus-5` /
`claude-sonnet-5` at CC 2.1.263. With n=2 and three simultaneous differences, no q1-versus-q2 difference
can be attributed to any one of them. The rows sit side by side and are never averaged into a single
figure.

## The lz q2 reading in detail

### Canonical identifier set (lexicographic, so a re-run is byte-identical)

```
arxiv:2208.07339
arxiv:2210.17323
arxiv:2305.14314
arxiv:2306.00978
arxiv:2402.04396
arxiv:2404.00456
arxiv:2409.11055
arxiv:2501.12956
arxiv:2505.02214
arxiv:2508.16785
arxiv:2604.19884
url:aclanthology.org/2025.acl-long.618
```

Cardinality **12**. The unmatched bucket is **empty (0 tokens)** and is reported as a field even at zero,
because a silently dropped token is how a format-sensitive metric hides.

### Structural citation coverage: 59 uncited of 67 units, and the mechanical reason

This is much lower coverage than lz q1's 30 of 64, and the difference is measured rather than guessed:

| Measure | lz q2 | lz q1 |
|---|---|---|
| text units in the body population | 67 | 64 |
| uncited units | 59 | 30 |
| of the uncited, units that are `Confidence:` / `Assurance:` metadata lines | **19** | **0** |
| body paragraphs whose LAST unit is a `Confidence:` / `Assurance:` line | **10** of 23 | 0 |

The q2 report carries a per-finding two-line assurance block that the q1 report does not. Under the frozen
passage-attribution rule -- a citation at the end of a passage covers the preceding uncited units of that
passage -- a paragraph ending on a metadata line is not marked cited, so each of its remaining prose units
is tested on its own. The frozen rule was applied unchanged and the count was then measured.

#### AMENDMENT, 2026-09-08: the DENOMINATOR is qualified, and the figure is NOT re-derived

Raised as WR-02 by the Phase-23 code review (`23-REVIEW.md`, `status: issues_found`) and recorded here
as a dated amendment rather than a silent recomputation -- the same discipline this phase applies to a
re-seed.

**The frozen unit rule does not split at a Markdown list-item boundary.** `SENTENCE_SPLIT_RE` requires
the next unit to begin with an optional opening delimiter followed by `[A-Z]`; a bullet begins `- ` or
`* `, so no split occurs across `\n- ` and a whole bullet list collapses into ONE "sentence-level text
unit". Measured consequence on this report: **5 of the 67 units are multi-sentence collapses**, the
largest holding roughly 983 characters and six sentence-enders. A per-sentence denominator would be
approximately **75** rather than 67.

**`59 of 67` stands as published and is NOT restated.** Three reasons, in order:

1. **The unit rule is FROZEN.** `eval/lz-eval-p23-prereg.md` defines the unit as "a sentence-level text
   unit inside the report's body sections" and states the passage-attribution rule alongside it.
   Changing the rule to split at a list-item boundary would amend a frozen artifact, which requires its
   own numbered, dated, maintainer-ratified AMENDMENT RECORD -- a larger action than this finding
   warrants, and not one an audit may take on its own authority.
2. **The reading does not move.** Coverage is low on this report either way; `59/67` and a per-sentence
   `~75` denominator support the same conclusion. What changes is the exact pair, not what it says.
3. **Recomputing quietly would be the error the phase exists to avoid.** A published figure that shifts
   without a dated record is indistinguishable from a figure tuned after the fact.

**This is a DIFFERENT effect from the metadata-line effect above, and the two are not the same
disclosure.** The metadata effect explains why so many units are uncited; this one qualifies how many
units there are. A reader who took the existing format-effect caveat as covering the denominator would
be wrong, which is why this amendment is stated separately rather than folded into it.

Not established either way: whether a per-sentence denominator is the more faithful unit for this
metric. The frozen rule was pre-registered before any rate was computed, and re-choosing the unit after
seeing a rate is exactly the post-hoc choice pre-registration removes.

**This is a REPORT-FORMAT effect at least in part, not a citation-behaviour finding**, and the format
changed with the model generation, which is one of the three axes above. It is therefore not evidence that
q2 cites worse than q1, and it is not read that way here.

### Verbatim-quote match: 1 of 8, against the retained q2 excerpt corpus

Run against the **retained stored excerpts** (`eval/.cache/p23-baseline/lz/q2/excerpts/`, 15 files),
never against a live fetch (D-12 as revised). Quote population, inherited verbatim from the Plan 23-03 q1
dry run's rule and transferred by section TITLE: every double-quoted span of 4 or more characters in
sections (b) Key Findings and (c) Contested and Unsupported; the legend (d) and the bibliography (e) are
excluded. The q2 report carries the same five sections as q1 with the `(a)`-`(e)` enumerators dropped, so
the mapping is exact and no rule was re-defined.

| Quote | Matched a stored excerpt |
|---|---|
| `signal degradation` | no |
| `computation collapse` | no |
| `All quantization methods exhibit noticeable performance degradation` | **yes** (`w8-e1.txt`) |
| `all methods` | no |
| `my new method beats GPTQ` | no |
| `all quantization methods... noticeable degradation` | no |
| `under 4-bit quantization` | no |
| `4-bit accuracy drop` | no |

**Read this figure with its population, not as a fidelity rate.** Six of the eight spans are the report's
own framing terms in scare quotes -- its own words for a failure mode, its own paraphrase of a literature
pattern, its own name for the quantity under discussion -- and were never presented as source quotations.
The one genuine source quotation in the population matched verbatim. A single-word or two-word framing
term in quotation marks is indistinguishable from a source quote to a purely structural population rule,
so the denominator here is a definitional artifact of that rule rather than a count of claimed quotations.
The same class of artifact is why the q1 dry run excluded the legend section.

Two mechanical notes, both checked rather than assumed:

- The truncated variant `all quantization methods... noticeable degradation` does NOT match while the full
  span does, and case is not the cause: the corpus contains `noticeable performance degradation`, and the
  report's elided restatement drops `performance`, so its second segment is not verbatim. The matcher
  correctly refuses an abbreviation-by-elision. Both readings were tested against the excerpt.
- The frozen quote-match label in the module reads `a SINGLE-SYSTEM diagnostic wherever only one side
  retained a corpus`. **That stated condition does not describe this case** -- both sides retained a
  corpus and one produced no report. The frozen label is carried verbatim in the output and the realized
  reason is recorded beside it at `quoteMatchScope`; the module was NOT edited to fit the case, which is
  recorded below as a finding.

## Identifier resolvability, as of 2026-09-08T09:30:52.465Z -- the live half, isolated

Reported **separately from the offline half**, and the offline figures above do not depend on it. One live
check over the q2 identifier union, which is the lz set alone at 12 identifiers, because the built-in q2
report contributed none.

| Outcome | Count (union of 12) | Meaning |
|---|---|---|
| resolvable | **12** | 2xx, headers inside the per-hop deadline and body inside the read cap |
| dead / oversize / timeout / scheme-blocked / redirect-limit / network-error | 0 | none observed |

Per-system rows without re-fetching, from the envelope's attribution map: **lz q2 -- 12 of 12 resolvable.
built-in q2 -- not-run, no identifiers to check, because no report exists.** An identifier cited by both
systems would appear once in the fetch and in both rows; here only one system cited anything.

Frozen controls in force, unchanged: http and https only, checked before any request and re-validated on
every one of at most 3 redirect hops; a 10,000 ms deadline per redirect hop, applied to the response
headers, with the body read bounded by the 262,144-byte cap rather than by time; no credentials, no
cookies, no authorization header, no referrer. **No response body was returned, persisted or executed** --
every record is exactly the five-field object `{identifier, requestUrl, finalUrl, status, outcome}`,
asserted on all 12.

**Named limitation, carried from the module and not dropped here:** this check does **not distinguish an
identifier that never existed from one that has since died.** Drawing that line requires a second
third-party archive lookup that ENV-04 does not require and that would widen the network surface. Link rot
is expected: every outcome above is true as of the check date and of no other date. Resolvability records
whether a request came back. It is not a measure of source quality.

Had the network been unavailable, the envelope would have been written with a `notRun` reason and its date
and the offline reading would have been unaffected -- the two halves are separate modules precisely so the
offline rates never depend on network availability.

## A factual-support measure was NOT computed, and why

The uncited-unit column is **citation COVERAGE**: whether a sentence-level text unit carries a citation
token, or sits in a passage whose end carries one. It is structural. It says nothing about whether any
claim is true, supported by its cited source, or entailed by any quoted text.

**No factual-support measure was computed, and no deterministic judge-free version of one can exist.**
Every published implementation decomposes claims with a model and then judges support with a model or an
entailment scorer, and Phase 23 has no judge by constraint. This is therefore a clean **not-established
item with a named reason** for ENV-07's table -- not a gap to be filled later by relabelling a structural
count.

Presenting a structural count under a semantic label is the construct error that voided the four preceding
phases. That is why the coverage label sits in the table's column heading rather than in a footnote, and
why it is repeated in the audit module's own output object at `citationCoverage.label`, where a downstream
reader cannot lose it.

## What this audit deliberately does NOT do

An explicit negative list, following the house convention of publishing the boundary rather than leaving
it to inference:

1. **It does not judge topical relevance.** Whether a cited source is on-topic is not measured.
2. **It does not judge factual support.** See the section above; no judge exists by constraint.
3. **It does not distinguish an identifier that never existed from one that has since died.** The
   resolvability column is an as-of-date reachability record and nothing more.

## The format asymmetry, as measured on whichever reports were audited

The lz q2 report carries **0 surface `[n]` markers** and **12 canonical identifiers**, all from inline
URLs in prose. **The q2 asymmetry itself could not be measured**, because measuring an asymmetry needs
both sides and the built-in q2 report does not exist. The only measured instance remains the q1 dry-run
row -- 69 markers over 13 unique marker values on the built-in against 0 / 0 on lz -- and that row does not
set or check the bar.

The comparison rests on **canonical identifiers, never surface markers.** `arxiv:2306.15595` is in the
canonical identifier set of BOTH q1 reports, from a bare identifier in prose on one side and an inline URL
on the other. The both-halves-in-one-assertion pin is on a SYNTHETIC fixture rather than on the two real
reports: `D-13: two tokens canonicalizing to the same identifier MERGE into one set entry` in
`eval/lz-eval-p23-citation-audit.test.mjs` puts both surface forms in one input text and deep-equals the
identifier set to the single entry `['arxiv:2306.15595']`. The real-report test uses two separate
`assert.ok` calls and skips when gitignored `eval/.cache/` is absent, so the fixture test is what keeps
this claim in a fresh clone. So no format-sensitive count could have moved the reading, and the built-in's
markers are resolved through its bibliography to identifiers before any counting.

## Cost is an operating observation only

**14.93 against 55.31 is NOT a clean per-run cost comparison and is not published as one.** The built-in
figure is retry-inflated across a resume cycle, spans two reset windows, ends `is_error: true` on both of
its streams, is ambiguous between 55.31 and a disclosed **upper bound of 79.32**, and bought no report at
all. The lz figure (14.930978050000009, `resumeCycles: 0`, `is_error: false`, one stream in one window) is
a single completed run. Comparing a completed run against a failed one as if they were peers is exactly
what the ENV-02 transparency prohibition forbids. Both figures appear here only as operating observations
with their retry history attached.

## Findings recorded against the plan and the frozen artifacts

Recorded rather than reconciled, in the same idiom the phase uses elsewhere. **No frozen module, constant
or record was edited to fit any of them.**

1. **The plan's PARTIAL-Q2 reason is wrong for the realized branch.** `23-07-PLAN.md` conditions
   PARTIAL-Q2 on Plan 23-06 having resolved on option B, and its Task-3 text says that under a PARTIAL-Q2
   "no spike record exists" and the 23-06 AMENDMENT RECORD should be cited in its place. Realized: option
   **A** was taken, the spike record **does** exist, and there **is** no AMENDMENT RECORD because nothing
   was descoped. The status line's value is derived from what is on disk, and the reason is stated from
   what happened.
2. **The frozen quote-match label's stated condition does not hold in this case.** `UNCITED.QUOTE_LABEL`
   attributes a single-system diagnostic to only one side having retained a corpus. Both sides retained
   one. The label was carried verbatim and the realized reason recorded beside it; the module is
   `git status`-clean.
3. **The quote population rule is not frozen in the pre-registration.** It exists only in the Plan 23-03
   SUMMARY and the q1 output object. It was inherited by section title rather than re-derived, and the
   inheritance is **proven**: the same extractor reproduces the published q1 five-quote population exactly
   before it is applied to q2. Whether the pre-registration should name the population rule is left to the
   maintainer; nothing here amends it.
4. **A naive span regex would have published a garbage figure.** A pattern of the shape
   `/"([^"]{4,})"/g` measured 0 of 8 on this report: its inner length filter skips a 3-character span
   (`"the"`), after which it pairs that span's closing quote with the next span's opening quote and
   swallows hundreds of characters of prose as one "quote". Pairing quote characters sequentially in
   document order and filtering by length afterwards is the faithful reading of "double-quoted span", and
   it is what reproduces the q1 population. The corrected figure is 1 of 8.

**Every q1 figure was re-derived from disk and every one reproduced exactly** -- 18 / 3 / 69-13 / 19-of-43
on the built-in, 12 / 0 / 0-0 / 30-of-64 / 3-of-5 on lz, and the 23-resolvable-3-oversize union at
`2026-09-07T12:33:22.655Z`. Every Plan 23-06 figure quoted here was likewise re-read from the manifests
rather than inherited.

## Reproducing this record

The offline half is deterministic and needs no network; two independent runs were asserted **byte-identical**
(`sha256 d08e82350c8a4b1a293a94c63e33202c41c645cd8f1dfc07c41d24010b3c60d0` on both). The JSON outputs live
in gitignored `eval/.cache/p23-read/`, which is why this Markdown record is committed -- a result that dies
with one cache wipe is not a published result.

```sh
node eval/lz-eval-p23-citation-audit.mjs eval/.cache/p23-baseline/lz/q2/q2-run1.report.md
# sources=12 unmatched=0 markers=0/0 uncited-units=59/67

# quote-match and the excerpt corpus are supplied through auditReport({ reportText, excerpts, quotes }),
# with the quote population above; the CLI alone reports 0/0 quotes by design.
```

Outputs on disk: `eval/.cache/p23-read/citation-audit-q2-lz.json` (carrying the quote population, the
excerpt-file list and the `quoteMatchScope` record) and `eval/.cache/p23-read/resolvability-q2.json` (the
dated envelope with its per-system attribution). Neither contains any excerpt or response-body text.
There is **no** `citation-audit-q2-builtin.json`, and its absence is the disk fact the status line is
asserted against.

The live resolvability run is not deterministic and is not expected to reproduce: re-running it on a later
date is a new observation with a new check date, not a re-derivation of this one.

## Review record

ENV-08 content review: **OWED**; closes in Plan 23-09. Written by the Plan 23-07 executor.

This record carries published measurements and the wording constraints ENV-04 imposes on them, so it falls
under the project's review-before-use/publish rule: scripts, prompts AND Markdown references are
content-reviewed before they drive a task or are published. It must be independently content-reviewed
against five properties before any downstream artifact quotes it:

1. Every measurement is per-system, with no mean, no average and no combined cross-system rate.
2. The uncited-unit count is worded as citation COVERAGE throughout, and the resolvability column is never
   worded as source quality. No figure is presented as support, grounding or verification.
3. The q1 rows carry their not-bar-setting label inside the table, and no figure is presented as a bar or
   as a check against one.
4. The PARTIAL-Q2 reason reads as a measured shortfall behind a dispatched capture, never as a
   pre-registered descope.
5. The D-19 branch is quoted from the spike record as branch A, and the record does not present the
   realized situation as branch B.

A search for a particular word is not the verification for properties 2 through 5: it would prove only
that the word is absent. The content review is.

## Cross-reference

- `eval/lz-eval-p23-prereg.md` -- Section (vi), the frozen ENV-04 rules; Section (vii), the contamination
  disclosure and the third axis; Section (ix), the D-19 conditional with both branches.
- `eval/lz-eval-p23-spike-record.md` -- Part 1, the D-19 branch-A determination recorded pre-rate; Part 3,
  the spike verdict, the cost ambiguity and the admissibility exclusion.
- `eval/lz-eval-p23-citation-audit-q1-dryrun.md` -- the published q1 dry run, whose rows are carried above
  and never merged with the q2 row.
- `.planning/phases/23-.../23-06-SUMMARY.md` -- the recorded option `A`, the retention inventories and the
  ENV-05 / ENV-06 dispositions.
- `eval/lz-eval-p23-citation-audit.mjs` / `eval/lz-eval-p23-resolvability.mjs` -- the frozen rules and
  limits, both `git status`-clean after this reading.
- `eval/lz-eval-parity-architecture.md` -- the house style for a record about a closed system.
