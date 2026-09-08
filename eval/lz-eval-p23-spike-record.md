# Phase 23 -- ENV-05 spike record and the D-19 first observation

Authority: `eval/lz-eval-p23-prereg.md` (frozen at `9ab9933`, 2026-09-07T23:37:33+02:00), as amended by
AMENDMENT RECORD 1 (`0b4e479`, 2026-09-08).

This file is written in two parts. **Part 1, the D-19 first observation, is recorded BEFORE any rate,
ratio or score has been computed over the q2 corpus** -- that ordering is the whole point of a
pre-committed conditional, and it is checkable from this file's own commit ancestry. Part 2, the spike
verdict, is completed when the capture is resolved.

---

## Part 1 -- The D-19 first observation (RECORDED PRE-RATE)

**Recorded:** 2026-09-08T00:55Z, by the orchestrator, after the wave-6 executor terminated on a
session usage limit mid-retention.

**The pre-committed question, quoted from the freeze:** does the built-in's workers' output leave
RECOVERABLE FETCHED CONTENT under the retention protocol?

**Determination: YES. Branch A is selected.**

Both branches were written before the spike ran. Branch A is therefore in force:

> **Branch A** -- the built-in's workers DO leave recoverable fetched content: a symmetric verbatim
> quote-match runs on BOTH systems for q2.

Branch B -- restricting ENV-04's comparative bar to the symmetric text-derived metrics and publishing
the lz quote-match as an explicitly-labelled single-system diagnostic -- is NOT in force and is not
used.

### The evidence, gathered structurally

Deliberately gathered from file names, sizes and tool-call structure only. **The fetched content itself
was NOT read**, so this observation does not add the orchestrator to the ENV-04 contamination ledger as
a reader of the q2 corpus.

Retained under `eval/.cache/p23-baseline/builtin/q2/session/`:

| Evidence | Measure |
|---|---|
| `tool-results/` fetched documents | 5 files, `webfetch-*.pdf`, 982289 / 10308097 / 624957 / 470243 / 624957 bytes |
| subagent transcripts retained | 104 files, 6843923 bytes total |
| transcripts carrying a `WebFetch`/`WebSearch` tool_use | 37 of 104 |
| whole retained session | 214 files, ~34 MB including the 132289-byte top-level transcript |

The `webfetch-` filename prefix is assigned by the fetch mechanism itself, so the presence of these
files is a structural fact about the run rather than an inference from their contents.

### The ordering claim, stated precisely

At the moment this observation was recorded: the q2 built-in capture existed on disk, and **no citation
audit, no quote-match, no coverage ratio and no resolvability check had been run over it.** No q2 rate
of any kind existed. The claim is scoped to the q2 corpus; the Wave-3 q1 dry-run figures long predate
this and are governed by D-20, not by this conditional.

---

## Part 2 -- The retention protocol needed widening, and this is a finding not a deviation of convenience

**The frozen retention path would have retained almost nothing for this capture.**

The protocol as frozen names the built-in session's per-subagent transcript files -- a flat
`subagents/agent-*.jsonl` shape. The real session directory for this run holds THREE subdirectories:

| Subdirectory | Size | What it holds |
|---|---|---|
| `subagents/` | 6.9 MB | the per-subagent transcripts the frozen path names |
| `tool-results/` | **13 MB** | **the actual fetched source documents -- the evidence ENV-04's quote-match consumes** |
| `workflows/` | 176 KB | the Workflow-runtime records |

A flat glob over `subagents/` alone would have missed `tool-results/` entirely -- that is, it would have
missed the fetched source corpus while retaining only the transcripts that reference it. Retention was
therefore widened to a RECURSIVE copy of the whole session directory plus the top-level transcript.

This is recorded as a **finding about the frozen protocol**, not as executor discretion: the widening
retains strictly MORE than the frozen path specified, never less, so it cannot lose evidence the
protocol intended to keep. Whether the pre-registration's retention wording should be amended to name
the recursive form is left to the maintainer; the evidence is safe either way, which is the property
D-17 actually protects.

The wave-6 executor identified this before it was terminated. Its retention copy had reached only the
three top-level stream files (`q2-run1.stream.jsonl`, `.err`, `.timing`) with an EMPTY `subagents/`
directory when the session limit stopped it; the orchestrator completed the recursive retention
afterwards, from a source session that was still intact.

### The retention inventory as FINAL, after resume cycle 1

The recursive retention was re-run after resume cycle 1 completed, so the inventory grew past the
figures Part 1 recorded. **Part 1's smaller counts are a correct PRE-RESUME snapshot, not a discrepancy**
-- they were taken at the moment the D-19 observation was recorded, which by design was before the
resume, and Part 1 is not rewritten to match a later state. The final inventory, verified on disk:

| Measure | At the Part-1 observation (pre-resume) | FINAL (post-resume-1) |
|---|---|---|
| files under `session/` | 214 | **422** |
| `.jsonl` worker transcripts (recursive) | 104 | **203** |
| `tool-results/` fetched documents | 5 | **15** |
| retained bytes for `builtin/q2/` | ~34 MB | **87 MB** |

The transcripts sit at `session/subagents/workflows/wf_14facf94-3f0/`, NOT flat under `session/subagents/`
-- one more reason the frozen flat-glob path would have retained nothing, and a second structural fact
supporting Branch A rather than a re-reading of it. The top-level `session.jsonl` is 183541 bytes. There
is no backup: this tree is the only copy, `eval/.cache/` is gitignored, and no `git clean` was run in any
form at any point in this plan.

T-23-10 residual, recorded as accepted: the retained transcripts may carry third-party fetched text and
session material. The destination is the gitignored eval cache and is never committed; this record
carries counts, file names and sizes only, never transcript bodies.

---

## Part 3 -- The spike verdict (RESOLVED; the spike did NOT clear)

### The capture as realized

Two streams, one session (`ac91e3d6-3f8f-4ed3-ac81-7b8ca4a9e7dd`), both ending `is_error: true`.

| Property | Cold run | Resume cycle 1 |
|---|---|---|
| stream | `q2-run1.stream.jsonl` | `q2-run1.resume1.stream.jsonl` |
| events | 576 | 1188 |
| bytes | 14443816 | 20085459 |
| START (UTC) | 2026-09-07T22:41:05Z | 2026-09-08T00:53:48Z |
| END (UTC) | 2026-09-07T22:48:40Z | 2026-09-08T01:08:09Z |
| `rc` | 1 | 1 |
| `type=result` events | 2 -- first `is_error: false`, last `is_error: true` | 2 -- first `is_error: false`, last `is_error: true` |
| terminal `total_cost_usd` (LAST-wins) | 24.015203250000027 | **55.30793200000004** |
| `system/init` model | `claude-opus-5` | `claude-opus-5` |
| `claude_code_version` | `2.1.263` | `2.1.263` |
| assistant text blocks | 2 (485 and 65 chars) | 2 (272 and 65 chars) |
| `report.md` produced | **NO** | **NO** |

The resolved model string is recorded, never the `opus` alias that dispatched it. Generation 5, as
required.

### The cost figure, and an ambiguity that is disclosed rather than resolved by preference

**Published per-run cost: 55.30793200000004 USD, with an upper bound of 79.32313525000006 USD disclosed
alongside it.** Both figures are given here at full precision, which is the form that travels. Where
`55.31` and `79.32` appear below they are ROUNDED CONVENIENCES for exactly these two values and for no
others -- an upper bound in particular must never be quoted in a form lower than the figure itself.

The two streams share ONE `session_id` (`ac91e3d6-3f8f-4ed3-ac81-7b8ca4a9e7dd`), so whether the resume's
terminal figure is CUMULATIVE for the session or PER-INVOCATION decides between two very different
totals. The streams do not settle it, and **guessing in the cheaper direction would be exactly the
invented figure D-22 was raised to prevent, so both readings are recorded:**

| Reading | Total | Evidence for it |
|---|---|---|
| CUMULATIVE (published) | **55.31** | Same `session_id`. The resume's terminal event has the SAME hosted-workflow shape as the cold run's -- `num_turns: 1`, all-zero parent `usage`, sub-second `duration_ms` -- so its `modelUsage` is the workflow's own aggregate for the session, and its opus-5 input tokens (1557379) strictly EXCEED the cold run's (480930) rather than being disjoint from them. |
| PER-INVOCATION (upper bound) | 79.32 | A literal `aggregateRunCost` sum over the caller-enumerated streams, which is the rule D-22 states without qualification. Cannot be excluded from the streams alone: a 14-minute wide worker fan-out could independently account for 1.56M opus-5 input tokens. |

`aggregateRunCost`'s SUM was NOT applied. **The lower figure is published only because the cumulative
reading has the stronger structural evidence, not because it is smaller, and the 79.32 upper bound
travels with it everywhere.** No reading of this capture may present 55.31 as a settled per-run cost.

**The Phase-22 q1 precedent does NOT transfer, and checking that is what surfaced the ambiguity.** The
Phase-22 lz q1 manifest summed its two streams correctly because ITS cold and resume streams are
DIFFERENT sessions (`8183574c-dce0-4cee-b59b-c6c05841ba34` and `d16badf7-929c-4fdf-b683-3845270ab1f3`)
with independent accounting. The Phase-22 built-in q1 manifest summed THREE same-session streams
(`6e92b80e-...`) -- but its resumes carry `num_turns: 2` with real parent `usage` and costs far SMALLER
than its cold run (0.96 and 17.59 against 48.54), so those resumes were ordinary parent-driven session
turns that did NOT re-enter the hosted workflow. q2's resume did. Summing is right for the q1 shape and
wrong-or-right-unproven for the q2 shape; **the two are not the same case and the earlier manifest is
not a precedent for this one.**

**This is recorded as a finding about D-22's summation rule**: the rule as frozen says "sum the
enumerated streams" without distinguishing a same-session hosted-workflow resume, whose terminal
accounting may already include its predecessors. The enumeration itself is still the caller's and is
still recorded on the artifact, which is what D-22 was raised to guarantee. Whether D-22's wording
should be amended to name the per-session case is left to the maintainer; nothing here amends it.

**Either figure is retry-inflated and is NEVER a clean per-run cost comparison.** Retry history: 1
resume cycle across 2 reset windows, and BOTH streams end `is_error: true`. Every later appearance of
55.30793200000004 must carry that history AND the 79.32313525000006 upper bound, at that precision
(ENV-02 transparency prohibition).

### The completeness check, run mechanically

Run through the CLI, not by eye. There is no report to read, so the CLI's own path guard is the
mechanical outcome:

```
$ node eval/lz-eval-p23-verify-complete.mjs eval/.cache/p23-baseline/builtin/q2/q2-run1.report.md 1 2
lz-eval-p23-verify-complete: missing or invalid <report.md>
exit=2
```

The same predicate at the API level, over the absent report's empty text:

```
spikeCleared({ reportText: '', resumeCycles: 1, resetWindows: 2 })
  -> cleared: false
     completeness: { complete: false, declaredN: null, confirmedN: null, tableRows: null,
                     duplicateLedgerHeadings: 0,
                     reason: "no verification-ledger heading declaring an N/N confirmed count was found
                              (Pattern 5: a format change is itself an ENV-07 finding and falls to a
                              documented manual read, never a silent re-definition)" }
     ceiling: { cleared: true, ceiling: { MAX_RESUME_CYCLES: 3, MAX_RESET_WINDOWS: 2,
                                          resumeCycles: 1, resetWindows: 2 } }
```

No manual read was substituted and the predicate was not re-defined. Pattern 5's manual-read fallback
covers a report whose FORMAT the predicate cannot parse; it does not apply here, because there is no
report at all. An absence is not a format mismatch.

### **The verdict: NOT CLEARED, on COMPLETENESS -- not on ceiling exhaustion**

This precision is the point of a two-axis ceiling and it must not be collapsed:

| Axis | Realized | Frozen limit | Status |
|---|---|---|---|
| resume cycles | 1 | <= 3 | **within** |
| reset windows | 2 | <= 2 | **within, and at the limit** |
| verification-complete report | none produced | required | **FAILED** |

`spikeCleared` requires BOTH halves. The ceiling half CLEARED at 1 resume across 2 windows. The
completeness half failed. So the correct sentence is **"the spike failed on completeness"** -- it is
wrong to write "the ceiling was exceeded" or "it ran out of resumes", and both were checked against the
predicate rather than asserted.

What IS spent is the WINDOW axis alone. A further resume would be reset window 3:

```
spikeCeilingCheck({ resumeCycles: 1, resetWindows: 3 }) -> cleared: false
```

So the capture is FINAL as it stands. **A further resume is not available to this executor**: it would
break a bar frozen before the spike ran, after having watched the run get close, which is exactly the
post-hoc bar-moving the pre-registration exists to remove. It would require a numbered, dated,
maintainer-RATIFIED amendment. An operational nudge to "just resume it" is NOT ratification of a
pre-registration change. This is surfaced, never self-authorized.

### D-06, repeated so the ceiling is not misread as drift

ENV-05's literal one-5-hour-window reading is NOT the operative criterion, and the ratified ceiling of
<= 3 resumes across <= 2 reset windows is not drift from it. A strict one-window bar fails BY
CONSTRUCTION on Phase-22 evidence already in hand: the built-in q1 capture needed three resume cycles
across two reset windows and an earlier attempt died on a billing limit. A bar that the only prior
observation already fails measures the bar, not the system.

### The ENV-05 / ENV-07 finding this establishes (D-07: publishable either way)

**On a DELIBERATELY NARROWED, bounded single-facet q2 question, the built-in `/deep-research` surface did
not reach a verification-complete report within 1 resume cycle across 2 reset windows, at a published
55.31 USD (79.32 upper bound), on Claude Code 2.1.263 with `claude-opus-5`.**

Compared honestly to the one prior datum, as two separate rows and never averaged:

| Question | Model | CC version | Resume cycles | Reset windows | Report reached | Cost (retry-inflated) |
|---|---|---|---|---|---|---|
| q1 (Phase 22, context-window extension) | `claude-opus-4-8` | 2.1.186 | 3 | 2 | YES | 67.085261 (sum of 3 enumerated streams) |
| q2 (this spike, 4-bit PTQ) | `claude-opus-5` | 2.1.263 | 1 | 2 | **NO** | 55.31 published / 79.32 upper bound |

**Two disclosures that limit this comparison, both verified from the manifests on disk rather than
recalled:**

1. **The q1 figure is 67.085261, NOT the 48.5367785 that appears in `lz-eval-baseline-manifest.mjs`'s
   own header comment.** That 48.54 is q1's COLD STREAM alone; the run's enumerated total adds a
   0.9598505 report-recovery resume and a 17.588632 verifier-completion resume. The module comment is
   discussing last-wins semantics within one stream, not publishing a run total, and reading it as a run
   total was caught and corrected here.
2. **q1 and q2 differ on BOTH the model generation and the CC version** (`claude-opus-4-8` on 2.1.186
   against `claude-opus-5` on 2.1.263). The pre-registration's own rule is that figures are never
   averaged across CC versions, so these two rows are a WEAK pairing even as separate rows: a difference
   between them may be the question, the model generation, the CC version, or the envelope, and nothing
   here can separate those. This is the second reason no trend is claimed, alongside n=2.

q2 did NOT complete on a comparable window budget. It consumed both available reset windows in one
resume rather than three, and produced no report at a cost that -- on either reading -- is of the same
order as q1's COMPLETED capture. Two observations are not a trend and no rate is claimed from n=2; what
is claimed is the narrower and defensible thing -- **narrowing the question did not by itself make the
reference system's report reachable inside the ratified envelope.**

The run did ADVANCE across the resume: the Verify phase was executing when the limit hit, where the cold
run had failed at that stage wholesale. So the resume protocol worked as documented; the envelope, not
the protocol, is what the window budget ran out against.

### Admissibility (ENV-02)

The built-in q2 capture produced no report, so no MANIFEST can pass `validateManifest` and the capture is
**INADMISSIBLE for ENV-04's q2 route**. The failing field is mechanical, taken from the module's own
distinct error rather than judged:

```
manifest report file does not exist (truncated/empty capture?):
eval/.cache/p23-baseline/builtin/q2/q2-run1.report.md
```

The record is written to `q2-run1.MANIFEST.INADMISSIBLE.json` under that name specifically so it can
never be mistaken for a passing manifest, and it carries `admissible: false` with the reason above. No
cost value was invented, no report or placeholder was fabricated, and no field was relaxed to make it
pass.

## Review record

ENV-08 content review: **OWED**. Written by the orchestrating session and by the wave-6 executor; closes
in Plan 23-09.
