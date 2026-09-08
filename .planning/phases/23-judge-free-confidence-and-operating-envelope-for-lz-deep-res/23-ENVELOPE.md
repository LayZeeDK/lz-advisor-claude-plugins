# lz-deep-research -- Operating Envelope (Phase 23)

**Date:** 2026-09-08. **Skill:** `plugins/lz-advisor/skills/lz-deep-research/SKILL.md`, Sonnet-default.
Resolved model strings are written in, because the Agent tool exposes ALIASES and an alias pins nothing.

| Run | Resolved model | CC version |
|---|---|---|
| lz q2 -- the ENV-04 reading of reference | `claude-sonnet-5` | 2.1.263 |
| built-in `/deep-research` q2 reference capture | `claude-opus-5` | 2.1.263 |
| lz q1 / built-in q1 (Phase-22 records, not-bar-setting) | `claude-sonnet-4-6[1m]` / `claude-opus-4-8` | 2.1.186 |
| ENV-03 Slice-A verify-voter seat | **alias `sonnet` only -- NAMED GAP, no resolved string recorded** | not recorded |

That last row is a named gap, not an omission: the seat ran as `subagent_type: "Explore"`, `model:
"sonnet"`, and the Agent tool exposes no resolved string to the dispatching session. Inventing one
would falsify capture provenance.

**Rests on exactly these artifacts:** `eval/lz-eval-p23-prereg.md` (frozen at
`9ab993319da0fc3a10ae0cba45f10cb19576b93a`, 2026-09-07T23:37:33+02:00, exactly three files; amended by
AMENDMENT RECORD 1 at `0b4e479`); `eval/lz-eval-p23-sliceA-read-record.md`;
`eval/lz-eval-p23-citation-audit-q2-record.md`; `eval/lz-eval-p23-citation-audit-q1-dryrun.md`;
`eval/lz-eval-p23-spike-record.md`; `eval/lz-eval-p23-env06-record.md`.

## What this covers

Two question shapes, both declared EXPLORATORY in advance by the pre-registration: fact-check-style
binary claims with a 2020 cutoff (40 items, balanced 20/20 per direction), and long-form research
reports on bounded single-facet technical questions -- **n=2 questions, q1 and q2, as separate rows,
never averaged.** At n=2 **no per-question generalisation is available, and that is a limit on the
CLAIM, not on an interval** (D-04).

**What judged the 40 binary claims was a PROXY seat, not the shipped voter, and the difference matters
to how you read the cells below.** Each item was dispatched to a generic `Explore` Agent sub-agent on
Sonnet 5 carrying the frozen one-word dispatch string, which is what AMENDMENT RECORD 1 specifies. It
was **not** the shipped `research-verify-voter-sonnet` seat: that seat cannot consume the pinned string
at all, because it requires an evidence excerpt, an attack mode, an arm and a vote-file path the string
does not carry, and it is contracted to write a four-field vote JSON where the string demands one
lowercase word. So ENV-03 measured a proxy under the reviewed prompt, and any inference from it to the
shipped seat's behaviour is an inference the phase did not test. See
`eval/lz-eval-p23-sliceA-read-record.md` for the seat as dispatched and `eval/lz-eval-p23-prereg.md`
AMENDMENT RECORD 1 for why the substitution was made before any verdict existed.

## Where the output is evidenced

| Reading | Result | What a reader may take from it | Its named limits |
|---|---|---|---|
| **ENV-03** Slice A, judge-free, per direction, never pooled | gold `unrefuted` n=20: **tp 18 / fn 2**. gold `refuted` n=20: **tn 20 / fp 0**. n=40, `drawSeed` 20260907 | on claims of this shape the voter falsely upheld nothing in this draw, and both errors were false refutes | **measured on a PROXY seat, not the shipped voter** (see above), so this says nothing about a printed confidence label -- see NOT ESTABLISHED row 12; plus the three PROVISIONAL limits below and a fourth measured here: retrieval fired on only **30 of 40** items |
| **ENV-04** the q2 citation reading of reference, `ENV-04 status: PARTIAL-Q2` | **lz q2 only**: 12 canonical sources, 0 unmatched, 0 `[n]` markers, citation COVERAGE **59 uncited of 67** units, quote match **1 of 8**, resolvability **12 of 12** @ 2026-09-08T09:30:52.465Z | one system's q2 report cites resolvable identifiers and quotes its one genuine source quotation verbatim | **single-system, so no comparative q2 bar and none was set**; quote match is a SINGLE-SYSTEM diagnostic; see the format effect under Warnings |
| **ENV-02** admissibility | lz q2 **ADMISSIBLE** (`model=claude-sonnet-5 ccVersion=2.1.263`); built-in q2 **INADMISSIBLE** | every figure above stands on a report with a validating MANIFEST | the exclusion is mechanical, from the module's own error: `manifest report file does not exist (truncated/empty capture?): .../builtin/q2/q2-run1.report.md` |
| **ENV-05** the capture-feasibility spike -- **MEASURED** | the method ran at full cost and the frozen predicates returned its planned reading: **did NOT clear, failing on COMPLETENESS, not ceiling exhaustion** | the ceiling half CLEARED at 1 resume across 2 reset windows (frozen limits 3 and 2); no report was produced | "the ceiling was exceeded" and "it ran out of resumes" are both wrong, and both were checked against the predicate rather than asserted |
| the **q1 pair** -- a published DRY RUN setting and checking NO bar (D-20) | built-in q1: 18 sources, 3 unmatched, 69 markers / 13 unique values, coverage 19 of 43, quote match not computable, 17 resolvable + 1 oversize. lz q1: 12 sources, 0 unmatched, 0 markers, coverage 30 of 64, quote match 3 of 5, 10 resolvable + 2 oversize (both @ 2026-09-07T12:33:22.655Z) | nothing about a bar; these rows exist so the q2 reading is legible beside a second data point | never averaged with q2 or with each other; three prior sessions have partial sight of q1 |

Two things a table cannot carry. **The D-19 branch was quoted, not chosen: branch A is in force** --
the built-in's workers DO leave recoverable fetched content (15 documents, 203 worker transcripts,
87 MB retained). **And PARTIAL-Q2 is a MEASURED shortfall, not a descope:** option A was ratified
2026-09-08, both captures were dispatched at full metered cost, and the built-in side produced no
report. The audit does NOT judge topical relevance, does NOT judge factual support, and does NOT
distinguish an identifier that never existed from one that has since died.

## Where the output is routed to a human

Re-check a report when ANY of these holds. The first four are the skill's own design making dissent
first-class; the rest are what the readings did not cover.

1. **`Contested`** -- any voter split, even 2 unrefuted against 1 refuted, resolves to `Contested`
   rather than `Medium` so dissent is not erased. Read that section, not only Key Findings.
2. **`Low` or `Unsupported`** -- `Low` covers thin support AND refuted-without-support; a refuted claim
   is downgraded and SURFACED, never deleted.
3. **Assurance 2 (`claim_support`) weak while Assurance 1 (`quote_fidelity`) is verified** -- only
   Assurance 1 is mechanically re-checked; a verbatim quote need not entail the claim.
4. **The finding is central to your decision** -- a `load_bearing` claim is routed to a re-vote wave by
   design, which is the design saying one pass is not enough.
5. **The answer depends on the date** -- no reading here covers date-sensitive questions.
6. **You need factual support, not citation coverage** -- none was computed; see below.
7. **Your question is not a bounded single-facet technical one** -- both audited reports were narrowed
   ones, at n=2.
8. **You need a link live NOW** -- resolvability is true as of its check date and no other date.

## Warnings

**The three PROVISIONAL limits on Slice A, from the frozen module:** uniform 2020 `claim_date`
(out-of-cutoff for a 2026 voter); topical narrowness (the AVeriTeC dev set is **~34%
US-2020-politics, ~21% COVID**, not a cross-section of general research questions); evidence-set
mismatch (a **2020-labelled** reference standard against a voter searching the live 2026 web, so a
disagreement may reflect a different evidence set rather than a voter error). The fourth, measured in
this run: **30 of 40** items retrieved, so roughly a quarter was decided closed-book and the third
limit holds for 30 of 40 rather than universally.

**The no-significance ceiling was stated IN ADVANCE, in the freeze commit, not discovered afterwards.**
It is a POLICY binding every reading in this phase, and the pre-registration's Section (ii) states it
for the QUESTION-level design: the two-sided sign-test minimum at n=5 paired questions is
`2 x 0.5^5 = 0.0625`, already above a conventional 0.05 threshold, and a perfect 5-for-5 sweep yields
only a 95% Clopper-Pearson lower bound of `0.05^(1/5) = 0.549`.

**That arithmetic is about paired QUESTIONS and does not by itself settle Slice A**, which is 40 items
at 20 per arm -- a different n and a different unit of analysis. On its own table, **Slice A's
2-versus-0 asymmetry is not significant on the observed effect: Fisher exact two-sided gives
`p = 0.49`.** Note what that does and does not say: significance IS reachable at this n on a larger
split -- `[[13,7],[20,0]]` at the same n gives `p = 0.008` -- so the barrier is the observed effect
size, NOT the sample size. Independently of either calculation, the Section (ii) ceiling bars any
significance claim in this phase, so the asymmetry is **NOT established** either way -- an observation
about this draw. **A phase ending without a significance claim has NOT fallen short.**

**D-07, the realized capture ceiling -- an operating observation about the reference system, measured
rather than descoped.** On a deliberately narrowed, bounded single-facet q2 question the built-in
`/deep-research` surface did not reach a verification-complete report within 1 resume cycle across 2
reset windows, at **55.30793200000004 USD published with a disclosed upper bound of
79.32313525000006**, on CC 2.1.263 with `claude-opus-5`; both streams end `is_error: true`. The run did
advance across the resume -- Verify was executing when the limit hit, where the cold run failed at that
stage wholesale -- so the resume protocol worked and the envelope, not the protocol, is what the window
budget ran out against.

| Capture | Windows | Resumes | Terminal `is_error` | Report | Cost, with its retry history attached |
|---|---|---|---|---|---|
| lz q2 | 1 | 0 | false, `rc=0` | YES, 14306 bytes | **14.930978050000009** -- single stream, single window, exact enumeration |
| built-in q2 | 2 | 1 | **true on BOTH streams** | **NO** | **55.30793200000004** published / **79.32313525000006** upper bound; ambiguous because both streams share one `session_id` |
| built-in q1 | 2 | 3 | -- | YES | 67.085261 over three enumerated streams, NOT the 48.5367785 cold stream alone; retry-inflated across three resumes plus an earlier billing-limit failure |
| lz q1 | 2 | 1 | true on the cold stream | YES | 18.1152213 over two enumerated streams |

**14.93 against 55.31 is NOT a clean per-run cost comparison and is not presented as one.** One figure
is a completed run; the other is retry-inflated across two windows, ends in error on both streams, is
ambiguous between two readings, and bought no report at all.

**Further specific limitations, each falsifiable.**

- The q2 coverage figure is **at least in part a REPORT-FORMAT effect**: 19 of the 59 uncited units are
  `Confidence:` / `Assurance:` metadata lines and 10 of 23 body paragraphs end on one, against **zero
  such lines in q1**. It is not evidence that q2 cites worse than q1.
- q1 and q2 differ on **three axes at once** -- contamination, question identity, and **both model
  generation AND CC version** -- so no q1-versus-q2 difference is attributable to any one of them.
- **A named retention gap:** the q1 evidence corpus is gone for BOTH systems; the June-2026 built-in
  session aged out of the transcript store entirely. A RETENTION failure, not a structural property of
  either system. Closed, not deferred.
- The quote-match denominators are artifacts of a structural population rule: 6 of q2's 8 spans are the
  report's own framing terms in scare quotes, and the one genuine source quotation matched.
- Resolvability is not a source-quality measure and does not distinguish a link that never existed from
  one that has since died.

## NOT ESTABLISHED, and why

**Strictly separate from the evidenced section, no shared rows.** Measured-and-negative and
not-measured are different published claims. Every reason is identifiable independently of any result.

| # | Named method | Branch | Reason, independent of any result |
|---|---|---|---|
| 1 | Factual support / groundedness of report claims | **(b)** | No deterministic judge-free version can exist: every published implementation decomposes claims with a model and judges support with a model or an entailment scorer, and this phase has no judge by constraint. The uncited-unit count is citation COVERAGE and must never be relabelled support. |
| 2 | Blinded, position-swapped, per-dimension head-to-head grading against the built-in as a model-authored reference baseline (ENV-06) | **(b)** | **The reference half of the pair does not exist:** `eval/.cache/p23-baseline/builtin/q2/q2-run1.report.md` is absent, checkable on disk. A pairwise comparison needs two reports. Carried from `ENV-06 status: NOT-RUN branch (b)`; nothing was graded and no per-dimension score exists. |
| 3 | The comparative ENV-04 bar on the FRESH q2 pair (D-02) | **(b)** | Same on-disk absence. Under D-02 the bar is either set on the fresh pair or NOT SET -- **it is NOT SET**, and no fallback onto q1 exists because q1 is a not-bar-setting dry run (D-20). |
| 4 | Symmetric verbatim-quote match across both systems on q2 | **(b)** | No built-in q2 report to extract spans from. NOT branch B's premise: branch B assumes the built-in leaves no recoverable content, and it demonstrably does. |
| 5 | The q2 citation-format asymmetry between the systems | **(b)** | An asymmetry needs both sides. The only measured instance is the q1 dry-run row, which sets no bar. |
| 6 | Verbatim-quote match on the built-in q1 report | **(b)** | No corpus was retained and the session aged out of the transcript store. Closed, not deferred. |
| 7 | Whether the voter's error profile is asymmetric IN GENERAL | not established | 2 against 0 at n=20 per arm; Fisher exact two-sided `p = 0.49` on the observed table. Significance IS reachable at this n on a larger split (`p = 0.008` at `[[13,7],[20,0]]`), so the barrier is the observed effect size, not the sample size -- and the pre-registration's Section (ii) ceiling independently bars any significance claim in this phase. |
| 8 | Whether the built-in surface can reach a verification-complete report at all | not established | One narrowed question in one ratified envelope is a single observation, not an impossibility claim. Re-running a documented failure mode is excluded as a route to resolution. |
| 9 | Never-existed versus died-since, for an unresolvable identifier | **(b)**, by design | Requires a second third-party archive lookup ENV-04 does not require and that would widen the network surface. |
| 10 | Per-question generalisation across the two questions | not established | D-04: at n=2 this is a limit on the CLAIM. |
| 11 | A clean per-run cost comparison between the systems | not established | Retry-inflated, one figure ambiguous between 55.31 and 79.32, one side bought no report. Forbidden by the ENV-02 transparency prohibition. |
| 12 | **Calibration of the published `High` / `Medium` / `Low` / `Unsupported` / `Contested` confidence labels -- the labels the routing section above tells you to act on** | not established | **No reading in this phase connects ENV-03 to the shipped label.** ENV-03 measured ONE proxy seat (a generic `Explore` sub-agent, not the shipped voter) on BINARY claims against KNOWN gold. The published label is produced by a THREE-seat tally plus a `load_bearing` re-vote wave (`SKILL.md:278`, `:289`) over OPEN-ENDED research claims with NO gold. Nothing measures the error rate of a printed `High`, and the 18/2 and 20/0 cells must not be read as if it did. This row is listed because the section it sits in reads exhaustive, and an exhaustive-looking list missing the gap a reader would act on is worse than no list. |

**Nothing in this phase is branch (c).** No method was descoped before spend and no AMENDMENT RECORD
records one; AMENDMENT RECORD 1 is a pre-dispatch instrument correction taken with zero verdicts in
existence. Presenting a row above as (c) would claim a descope that never happened; presenting a (c) as
(b) would claim evidence never gathered. Neither substitution is available.

**Row 2 is a COMPLETED outcome, in the clause's own words:** "The phase publishes the named method, the
evidence that it cannot deliver, and the operating envelope that stands without it. **This is a
COMPLETED phase, not a gap**, and `/gsd-audit-milestone` must close it as such."

## Termination

Resolved branch: MEASURED

**The evidence.** The clause requires that "at least one pre-registered confidence source produced its
planned reading; the phase publishes it with its stated limits." Three did, all published above:
ENV-03, ENV-04 (single-system, under PARTIAL-Q2) and ENV-05 (the spike ran at full cost and the frozen
predicates returned its planned reading). ENV-02 additionally ruled on admissibility in both directions.

**This resolution upgrades nothing.** ENV-06 remains a branch **(b)** termination and the built-in q2
report remains an ABSENCE; both stay in the section above with their letters. A branch-(b) item may
never read as a branch-(a) failure, and a phase-level (a) does not convert one.

**The negative clause, quoted so a reader can check this phase avoided it:** "Phase 23 does NOT reach
resolution if it produces no artifact for any source, or if it re-runs a method whose failure mode is
already documented in the hope of a different draw." Every source produced a committed artifact -- five
records plus this envelope -- and no method was re-run: the built-in q2 capture was left FINAL after
resume cycle 1, because a further resume would be reset window 3, which the frozen `spikeCeilingCheck`
rejects, and moving that bar after watching the run get close would have required a numbered, dated,
maintainer-ratified amendment that was never sought.

**Freeze-before-spend is proven from git ancestry, not timestamps.** `git merge-base --is-ancestor
9ab993319da0fc3a10ae0cba45f10cb19576b93a <commit>` returns 0 for all 14 commits in this phase carrying
a capture, a vote, a score or a reading output, and non-zero for the pre-freeze Wave-3 commit
`3189239`, which is the discrimination proof that the test can fail. Two commits can share a timestamp;
topology is what orders them.

## Not a ship gate

**D-03 carries unchanged: the Sonnet-default `lz-deep-research` skill ships regardless, and nothing in
this phase gates it.** No reading here is a certification, no bar was set for any to clear, and all are
declared EXPLORATORY in advance -- under the no-judge constraint there is no confirmatory arm.

## Review record

**Structural completeness of this document is checked mechanically; its USEFULNESS is not, and the
mechanical check must not be reported as covering it.** Whether the warnings are specific rather than
generic, and whether this document is useful rather than boilerplate, is a maintainer read against the
four prior-art skeletons in `23-RESEARCH.md` Pattern 6 (Model Facts label; STARD 2015 items 26 and 27;
Evaluation Cards; model/system cards) and nothing mechanical.

**Status: REVIEWED and CLOSED, 2026-09-08.** Reviewer: five independent fresh-context agents plus
maintainer ratification of the resulting corrections. Verdict: the warnings ARE specific rather than
generic; the document was NOT boilerplate but DID fail the usefulness criterion as first published, on
three defects now corrected at `f030aef`.

Written originally by the Plan 23-09 executing session, which for a published artifact is not review.
What the review found, recorded because the corrections change what this document says about its own
measurement:

1. **This document contradicted itself about what ENV-03 measured.** The header table above already
   recorded the Slice-A seat as `Explore`/`sonnet`; "What this covers" said the claims were "judged by
   the shipped verify-voter". The header was right. Corrected, with the substitution and its reason
   stated where the claim is made, and the ENV-03 row's limits cell now names the proxy too.
2. **`NOT ESTABLISHED` read exhaustive and omitted the gap a reader would act on** -- the calibration
   of the published confidence labels the routing section instructs the reader to act on. Added as row
   12. `High` previously appeared nowhere in this document despite driving the re-vote audit sample.
3. **N7's stated reason was false** ("no significance reachable at this n"). Corrected to the observed
   effect size, with Fisher `p = 0.49` observed and `p = 0.008` reachable at the same n, both
   independently recomputed by a confirming reader; the Section (ii) policy ceiling carries the
   conclusion instead of the n=5 paired-question arithmetic, which is a different unit of analysis.

**On the form of this review.** `PROJECT.md` names a fresh-context reviewer subagent as its FIRST valid
form of independent review, and this row was closed on that basis with the maintainer ratifying the
wording rather than re-deriving the findings. That is weaker evidence than a maintainer's own read of
the prose, and it is recorded as such rather than presented as equivalent. A presence check never stood
in for a content review: the review failed the document and named what to change.

Row 6's framing overstated its own source, which is worth carrying: of the four prior-art formats, only
the Model Facts label has a scorable section list. Pattern 6 itself directs that Evaluation Cards be
used as a completeness checklist rather than as this document's layout, and the model/system-cards
section list is an unverified assumption (`23-RESEARCH.md` Assumptions Log A3). One genuinely absent
Model Facts section remains -- *Mechanism of risk score calculation* -- which Pattern 6's own
recommended skeleton dropped and this document inherited; row 12 now carries the part of it a reader
needs.
