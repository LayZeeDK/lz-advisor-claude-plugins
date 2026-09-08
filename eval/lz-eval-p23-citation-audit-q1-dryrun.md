# ENV-04 citation audit -- q1 DRY RUN (not-bar-setting)

**This is a published dry run. Its numbers do NOT set the ENV-04 bar and are NOT checked against
one.** Nothing below is a threshold, a pass, a failure, or a comparison of equal standing with the
fresh q2 pair. The ENV-04 bar is frozen on the q2 pair per D-02, for one reason that cannot be
argued away: the session that DESIGNED this metric and the session that RESEARCHED it both had
partial sight of these two q1 reports (see `## Contamination disclosure`). A bar set on data the
designer has already seen measures the designer, not the system. This dry run exists to do two
narrower things -- exercise the audit script on real reports before a capture that costs pool
windows depends on it, and raise the phase's floor by producing a real ENV-04 reading even if the
ENV-05 spike never clears (D-20).

Read every figure here as an operating observation about two specific reports, dated
`2026-09-07`. It is exploratory in the ICH-E9 sense: no hypothesis was pre-committed for it and
none is confirmed by it.

- **q1 question:** "What techniques do large language models use to extend their context window
  beyond 100K tokens?"
- **Reports audited:** `eval/.cache/p22-baseline/builtin/qB1-run1.report.md` (15,125 bytes) and
  `eval/.cache/p22-baseline/lz/qB1-run1.report.md` (15,233 bytes). Both gitignored.
- **Audit code:** `eval/lz-eval-p23-citation-audit.mjs` (offline) and
  `eval/lz-eval-p23-resolvability.mjs` (live). The normalization rules were frozen as module
  constants in a commit that PRECEDES this record, which is checkable from `git log` ancestry
  alone -- the point being that no rule here could have been tuned to a number, because no number
  existed yet.

---

## What was measured, and what was not

| Dimension | Computed? | What it is |
|---|---|---|
| Unique canonical sources | yes | Cardinality of the canonical identifier set. Format-agnostic by construction |
| Unmatched citation tokens | yes | The NAMED reported bucket. Nothing is silently dropped |
| Uncited text units | yes | **citation COVERAGE**, structural. See the section below |
| Verbatim-quote match | lz only | A single-system diagnostic. The built-in retained no excerpt corpus |
| Identifier resolvability | yes | Whether a request came back, as of the check date. NOT source quality |
| Factual support / groundedness | **NO** | Not computable without a judge. See the section below |

---

## Per-system readings

One row per system per metric. Nothing here is averaged, pooled, or combined into a single
cross-system figure -- at n=1 question and two structurally different reports, a combined rate
would be an artifact of the two formats rather than a measurement (D-04, Pitfall 3).

| Metric | built-in q1 | lz q1 |
|---|---|---|
| Unique canonical sources (identifier-set cardinality) | **18** | **12** |
| Unmatched citation tokens (reported bucket) | 3 (`marker:[16]`, `marker:[17]`, `marker:[19]`) | 0 |
| Surface `[n]` reference markers (total / unique values) | 69 / 13 | 0 / 0 |
| Uncited text units -- **citation COVERAGE**, not support | 19 of 43 | 30 of 64 |
| Verbatim-quote match -- **SINGLE-SYSTEM DIAGNOSTIC, lz only, not comparative** | not computable (no retained corpus) | 3 of 5 quotes matched a stored excerpt |
| Identifier resolvability as of 2026-09-07 | 17 resolvable, 1 oversize (of 18) | 10 resolvable, 2 oversize (of 12) |

Raw numerators and denominators only. The audit module emits no pre-rounded rate anywhere, so no
rounding rule can move a figure in this table.

The two identifier sets overlap on 4 sources (`arxiv:2306.15595`, `arxiv:2309.00071`,
`arxiv:2404.06654`, `arxiv:2510.05381`), giving a 26-identifier union for the live check.

### The format unification actually works, and is asserted rather than assumed

`arxiv:2306.15595` is present in the canonical identifier set of BOTH reports. The built-in cites
that paper as a bare identifier in prose (`arXiv 2306.15595`); lz cites it as an inline URL
(`https://arxiv.org/abs/2306.15595`). Both collapse to one identifier. That is the whole reason a
cross-format count is possible at all -- a test exercising only the lz form would pass on a
format-sensitive implementation.

The single-assertion protection is on SYNTHETIC fixtures, and naming the right test matters here.
`D-13: two tokens canonicalizing to the same identifier MERGE into one set entry` in
`eval/lz-eval-p23-citation-audit.test.mjs` puts BOTH surface forms in one input text and asserts the
whole identifier set deep-equals the single entry `['arxiv:2306.15595']`, so a format-sensitive
implementation fails that one assertion. The REAL-report test above it,
`D-13 UNIFICATION: arxiv:2306.15595 is in the canonical identifier set of BOTH q1 reports`, checks the
two reports in two separate `assert.ok` calls and SKIPS entirely when gitignored `eval/.cache/` is
absent -- so it is the fixture test, not the real-report test, that keeps this claim in a fresh clone.

---

## Citation COVERAGE is not factual support

The uncited-unit column measures **citation COVERAGE**: whether a sentence-level text unit carries
a citation token, or sits in a paragraph whose end carries one. It is structural. It says nothing
about whether any claim is true, supported by its cited source, or entailed by any quoted text.

**A factual-support measure was NOT computed.** The reason is a constraint, not an omission: every
published implementation of an uncited-claim or support measure decomposes claims with a model and
then judges support with a model or an entailment scorer, and Phase 23 has no judge by design. For
ENV-07 this is a clean **not-established** item with a named reason, not a gap to be filled later
by relabelling a structural count. Presenting a structural count under a semantic label is the
construct error that voided Phases 19 through 22; the label in the audit module's own output
(`citationCoverage.label`) says so in the artifact itself so a downstream reader cannot lose it.

The same rule binds the resolvability column: it records whether a request came back within the
frozen limits. It is not a source-quality measure and must never be worded as one.

---

## Verbatim-quote match: an lz-only diagnostic, and WHY

The quote match ran against the surviving lz q1 evidence corpus
(`.lz-research/20260623-094345-llm-context-window-extension/excerpts/`, 15 excerpt files). Frozen
quote population for this dry run: every double-quoted span of 4 or more characters inside the lz
report's findings sections (b) and (c). The legend section (d) and the bibliography (e) are
excluded -- (d)'s quoted strings are the report's own legend questions, not source quotes, and
counting them would depress the figure by a definitional artifact rather than a measurement.
Result: **3 of 5**.

| Quote | Matched a stored excerpt |
|---|---|
| `processing capabilities` | yes |
| `large drops` | no |
| `LLaMA models` | yes |
| `large performance drops as context length increases` | no |
| `Implications` | yes |

**It could not run on the built-in side at all, and that is a RETENTION failure -- not a structural
property of the built-in (D-18).** An ordinary subagent transcript DOES retain fetched web content;
what failed was keeping it. The built-in q1 session (`6e92b80e-d807-43ea-89d1-e24bf40f3ab1`, run
2026-06-23) has aged out of `~/.claude/projects` entirely, so there is nothing left to compare
against and nothing to recover. Its fetched content was very likely recoverable AT CAPTURE TIME.

Two consequences follow, and both matter more than the 3-of-5:

1. Do not describe this metric as permanently one-sided. It is one-sided for q1 because an
   artifact was not copied.
2. This dry run is why the D-17 retention protocol is a precondition of the q2 capture rather than
   a nice-to-have.

The 3-of-5 is not comparative and cannot be made comparative retroactively. It is a diagnostic
that the string-matching path runs end-to-end on real captured prose against real retained
excerpts, which is what a dry run is for.

---

## Identifier resolvability, as of 2026-09-07T12:33:22.655Z

One live check over the 26-identifier union of both reports' canonical sets. This is the only
network access in Plan 23-03; the offline audit above makes no request at all, and its co-test
proves that by running with the global fetch replaced by a throwing stub.

| Outcome | Count (union of 26) | Meaning |
|---|---|---|
| resolvable | 23 | 2xx, headers inside the per-hop deadline and body inside the read cap |
| oversize | 3 | 2xx, but the body exceeded the 262,144-byte read cap; reading STOPPED at the cap |
| dead / timeout / scheme-blocked / redirect-limit / network-error | 0 | none observed |

The three oversize outcomes are `url:attention-survey.github.io/files/Attention_Survey.pdf` (a
PDF), `url:github.com/booydar/recurrent-memory-transformer` and
`url:trychroma.com/research/context-rot`. **Oversize is the size cap firing, not a dead link.** Two
identifiers were reached through a redirect, each hop re-validated against the http/https
allowlist.

**Named limitation, carried from the module and not to be dropped downstream:** this check does NOT
distinguish a link that never existed from one that has since died. The published definition that
draws that line requires a second third-party archive lookup (arXiv 2604.03173); ENV-04 does not
require the distinction, and a second network dependency would widen the surface for a nuance
nothing here consumes. **Link rot is expected -- every outcome above is true as of the check date
and of no other date.** Resolvability is also not a measure of source quality.

Frozen limits in force during the run: http and https schemes only (checked before any request and
re-validated on every redirect hop), at most 3 redirect hops, a 10,000 ms deadline per redirect hop,
applied to the response headers; the body read is bounded by the 262,144-byte cap rather than by time.
No credentials, no cookies, no authorization header, no referrer. No response body was executed,
persisted or returned.

---

## D-21: the frozen-record discrepancy, recorded and NOT reconciled

Three figures for the same report, from three readings. They are shown side by side because the
frozen record must not restate a number a re-run contradicts, and must not quietly overwrite one
either.

| Source of the figure | Reference markers | Source count |
|---|---|---|
| `.planning/notes/phase-22-diagnosis-two-root-causes.md` (superseded; head-and-tails read) | 26 numbered markers | 10-item source list |
| `23-RESEARCH.md` / D-21 (full-file regex inventory, 2026-09-06) | **69** markers, 13 unique marker values | recorded as "13 unique sources" |
| This dry run (full-file audit through the frozen canonicalization, 2026-09-07) | **69** markers, **13** unique marker VALUES | **18** unique canonical sources |

Two distinct corrections are in that table, and conflating them is exactly the error this record
exists to prevent:

1. **The marker count.** The diagnosis note's 26 came from reading the head and both tails only.
   The full-file count is 69. This changes no conclusion -- the format asymmetry between the two
   systems holds and is starker, not weaker.
2. **"13 unique sources" is a mislabel of the marker column, and 13 is not a source count at
   all.** 13 is the number of distinct `[n]` marker VALUES in the built-in report
   (`[1]`-`[10]` plus `[16]`, `[17]`, `[19]`). The canonical identifier set has **18** entries.
   Resolving markers through the bibliography yields 10 identifiers from the 10-entry source list;
   the remaining 8 come from bare arXiv identifiers in the report's own "Consulted (fetched, no
   claim in the verified top-25)" line, and `[16]`/`[17]`/`[19]` resolve to nothing and sit in the
   reported unmatched bucket. Three different numbers -- 69, 13, 18 -- measure three different
   things, and using any of them as a stand-in for another is the format-sensitivity D-13 exists to
   prevent.

`.planning/notes/phase-22-diagnosis-two-root-causes.md` is deliberately left UNCHANGED. Both
corrections live here and in the Plan 23-04 freeze. Superseding a frozen record in place would
destroy the evidence that the reading changed.

---

## Contamination disclosure

ENV-04's metric was proposed and researched with partial sight of these two reports. Specifically,
and listing the scans rather than gesturing at them, because an approximately-complete disclosure
is not a disclosure:

**The designing session** (the Phase-22 diagnosis, 2026-09-06) read the **head and both tails** of
both q1 reports. What it observed is recorded in that note's own contamination section: both
completed, ~15 KB each, both citation-bearing but in different formats -- the built-in using
numbered references to arXiv identifiers in prose with 0 inline URLs, lz using full inline URLs
plus an explicit "fetched but produced no surviving claims" section. Its stated marker figures were
26 markers over a 10-item source list.

**The research session** (Phase-23 research, 2026-09-06) went further and ran **programmatic
structure scans over BOTH full reports**: a scripted regex inventory producing byte and line
counts, inline-URL totals and uniques, URL hosts, numbered-marker totals and uniques, bare
arXiv-shaped token counts, DOI counts, Markdown-link counts, ASCII-quote counts, smart-quote /
ellipsis / non-breaking-space counts and en/em-dash counts; a heading scan of both files; and a
read of roughly six source-list lines from each report (built-in lines 116-119, lz lines 109-114).
It also read the lz q1 run directory's structure and confirmed verbatim source text in
`excerpts/w00.txt`.

**The executing session** (Plan 23-03, 2026-09-07) additionally measured the full identifier sets,
the quoted-span positions and the section boundaries in order to run this audit -- which is
unavoidable when the audit's job is to read the reports.

**What follows from this.** The q2 pair is fresh to all three sessions, which is why D-02 puts the
bar there and why this record is labelled not-bar-setting in its title and its first sentence. q1
also carries three further disclosures that travel with any figure taken from it (Pitfall 3): it
had no MANIFEST until ENV-02 rebuilt one, it has no stored built-in evidence corpus at all, and
its built-in capture cost is retry-inflated across three resume cycles plus an earlier
billing-limit failure. q1 is a disclosed second data point, never a second data point of equal
standing.

---

## Reproducing this record

The offline half is deterministic and needs no network. The JSON outputs live in gitignored
`eval/.cache/p23-read/`, which is why this Markdown record is committed -- a result that dies with
one `git clean` is not a published result.

```sh
node eval/lz-eval-p23-citation-audit.mjs eval/.cache/p22-baseline/builtin/qB1-run1.report.md
# sources=18 unmatched=3 markers=69/13 uncited-units=19/43

node eval/lz-eval-p23-citation-audit.mjs eval/.cache/p22-baseline/lz/qB1-run1.report.md
# sources=12 unmatched=0 markers=0/0 uncited-units=30/64
```

Outputs on disk: `eval/.cache/p23-read/citation-audit-q1-builtin.json`,
`eval/.cache/p23-read/citation-audit-q1-lz.json` (carrying the frozen quote population and the
excerpt-file list), and `eval/.cache/p23-read/resolvability-q1.json` (the dated envelope). None of
them contains any excerpt or response body text.

The live resolvability run is NOT deterministic and is not expected to reproduce: re-running it on
a later date is a new observation with a new check date, not a re-derivation of this one.

## Review record

This record is a Markdown artifact that carries published measurements and the wording constraints
ENV-04 imposes on them, so it falls under the project's review-before-use/publish MUST
(`.planning/PROJECT.md`): scripts, prompts AND Markdown references are content-reviewed before they
drive an LLM task or are published. It MUST be independently content-reviewed against four
properties before any downstream artifact quotes it:

1. Every measurement is per-system, with no mean, no average and no combined cross-system rate.
2. The uncited-unit count is worded as citation COVERAGE throughout, and the resolvability column
   is never worded as source quality.
3. The not-bar-setting labelling is present in the title and the opening paragraph, and no figure
   is presented as a bar or as a check against one.
4. The D-21 discrepancy appears side by side with the superseded figures rather than reconciled.

The review verdict, reviewer and date are recorded in the Plan 23-03 SUMMARY when the review
completes. The ENV-08 content review is the honest verification for properties 1-3: they are
wording properties, and a grep would prove only that a particular word is absent.

## Cross-reference

- `eval/lz-eval-p23-citation-audit.mjs` -- the frozen offline rules, landed before this record.
- `eval/lz-eval-p23-resolvability.mjs` -- the live half, its frozen limits and its named limitation.
- `.planning/phases/23-.../23-CONTEXT.md` -- D-12 (as revised), D-13, D-18, D-19, D-20, D-21.
- `.planning/notes/phase-22-diagnosis-two-root-causes.md` -- the superseded figures, left unchanged.
- `eval/lz-eval-parity-architecture.md` -- the house style for a record about a closed system.
