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

---

## Part 3 -- The capture as it stands (spike verdict PENDING)

| Property | Value |
|---|---|
| `system/init` model | `claude-opus-5` (Claude generation 5, as required) |
| `claude_code_version` | `2.1.263` |
| stream | `q2-run1.stream.jsonl`, 576 events, 14443816 bytes |
| wall clock | START 2026-09-07T22:41:05Z, END 2026-09-07T22:48:40Z, `rc=1` |
| `type=result` events | 2 -- first `is_error: false`, last `is_error: true`, both `total_cost_usd` 24.015203250000027 |
| terminal cost (D-22, LAST-wins) | **24.015203250000027** |
| `report.md` at the destination | **ABSENT** |

**The spike verdict is NOT recorded here and must not be inferred from the above.** `isVerificationComplete`
has not been run, no `report.md` exists to run it against, and the realized resume-cycle and reset-window
counts against the frozen ceiling (<= 3 resumes across <= 2 reset windows, D-05/D-06) are not yet final.
Part 2 of this record is completed when the capture is resolved -- by a resume under the documented
two-window protocol, or by a recorded termination naming its branch.

Recording a spike verdict now, from a capture whose terminal event is `is_error: true` and which
produced no report, would be exactly the after-the-fact reading the frozen ceiling exists to prevent.

## Review record

ENV-08 content review: **OWED**. Written by the orchestrating session; closes in Plan 23-09.
