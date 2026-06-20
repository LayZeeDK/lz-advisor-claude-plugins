---
name: lz-deep-research
description: >
  This skill should be used when the user wants deep, multi-source,
  fact-checked, cited research on a question. Trigger phrases include
  "deep research on", "research this question thoroughly", "fact-check
  across sources", "verify this claim across multiple sources",
  "lz-advisor deep research", and "/lz-advisor:lz-deep-research". It
  decomposes the question into sub-angles, dispatches search and extract
  worker waves, runs an off-model aggregator, consults an Opus advisor at
  two strategic gates, verifies key claims with isolated skeptic voters,
  and emits a single cited Markdown report with per-claim confidence and
  a first-class Contested and Unsupported section. This skill should NOT
  be used when the user wants to plan before coding, execute or build a
  coding task, review completed code, or run a security audit -- those are
  handled by sibling skills lz-plan, lz-execute, lz-review, and
  lz-security-review respectively.
version: 2.1.0
allowed-tools: Agent, Read, Glob, Write, WebSearch, WebFetch, Bash(git:*), Bash(node:*), AskUserQuestion
---

This skill is a THIN DISPATCHER. It wires the deep-research pipeline end to
end: scope-clarify, decompose into sub-angles, dispatch a search wave, dispatch
a fetch/extract wave, run the off-model aggregator, consult the Opus advisor at
Gate 1, dispatch an isolated-voter verify wave, run the aggregator again to
tally, consult the Opus advisor at Gate 2, and assemble the cited report. The
worker subagents and the off-model aggregator do the volume; the main session
holds only run-dir paths, one-line receipts, bounded summaries, and the two
advisor notes. It never holds raw source text or raw votes, and it never tallies
or merges or re-canonicalizes in context -- the aggregator is the single reducer.

For the report 5-section micro-format, the citation-provenance join and
canonical-URL rule, the two advisor-gate consult packaging, the wave-batch
and per-invocation-model reminders, and the cross-session resume UX, see:

@${CLAUDE_PLUGIN_ROOT}/references/lz-deep-research-orchestration.md

For the frozen JSON shapes (the survivor record and its `escalate` flag, the
report claim record, the tally rubric, the confidence enum, the named ceilings,
and the two assurances), see:

@${CLAUDE_PLUGIN_ROOT}/references/lz-deep-research-schema.md

The first-party Claude Code runtime (Anthropic-backed) is the platform FLOOR; this
skill orchestrates via the Agent tool, never direct API calls. Do not branch on any
cloud-provider deployment and do not add provider-specific degradation paths
anywhere in this workflow.

<discipline>
## Load-bearing discipline (read before dispatching anything)

These rules govern the whole workflow. Hold them across every phase.

- Consult the Opus advisor at EXACTLY two gates total: Gate 1 in Decompose and
  Gate 2 in Synthesize. Never add a third Opus consult.
- Spawn the Sonnet voter (research-verify-voter-sonnet) for verification. Never
  spawn the Opus voter variant -- it is eval-reference-only and must not be
  dispatched by this skill.
- Set the model PER Agent invocation: model: sonnet for every search, extract,
  and verify worker; model: opus for each of the two advisor gates. A
  plugin-shipped agent's frontmatter model line is inert at dispatch; the model
  on each Agent call is the only thing that controls the tier.
- Dispatch worker waves at most 5 in-flight, foreground, per turn. Wait for all
  receipts before the next turn; assert the receipt count. Split a larger wave
  into sequential sub-waves of at most 5. Never issue a sixth concurrent Agent
  call and never spawn workers in the background.
- Cap the sub-angles at ANGLES = 5 and the extract fetches at MAX_FETCH = 15
  BEFORE spawning. These ceilings are carried from the aggregator's frozen
  CEILINGS; the aggregator fail-closes (exit 2) above its own ceilings, so a cap
  applied after dispatch is too late.
- Shell the aggregator once per stage as a single Bash node call. A non-zero exit
  is a RUN FAILURE: stop and surface it; never silently consume a missing
  survivors.json.
- Retain the run dir. It is the gitignored audit trail; never clean it up on
  completion.
</discipline>

<resume>
## Resume: recover a run that died mid-pipeline

Run this BEFORE Phase 0. A deep-research run is a long, interruptible spend that
can die at the org usage / spend limit (HTTP 429); resumability lets it -- and any
end-user run -- recover from disk and reuse all prior search / fetch / extract work
instead of re-paying for it. The run dir is the immutable per-phase blackboard, so
resume is a per-phase done-signal check plus a conditional skip. The done-signals,
in pipeline order, are: scope.md (Phase 0); decompose.json (Phase 1);
candidates/<worker-id>.json (Phase 2, per sub-angle); claims/ + excerpts/ +
sources/ records (Phase 3, per source); survivors.json (Phase 4 stage-1, with the
degenerate-aggregate caveat below); votes/<cluster-id>-<seat>.json (Phase 5, per
seat); run_state.json { stage2_complete: true } (Phase 5/6 stage-2 sentinel);
report.md (Phase 6 terminal sentinel).

Decide fresh-vs-resume with the slug-match auto-detect heuristic (it needs no
AskUserQuestion, so it works headless under `-p`):

1. Normalize the research question to a slug -- the same kebab-case derivation the
   run-id uses (lowercase, non-alphanumeric to `-`, collapse repeats, trim). Keep
   it `:`-free (a Windows filename constraint).
2. Scan .lz-research/ for resume candidates. A run dir is a candidate iff it has NO
   report.md (an absent terminal sentinel means it did not finish) AND its run-id
   slug matches the question slug (or its scope.md scope matches). A run dir WITH
   report.md is complete and is never a candidate.
3. If one or more candidates match, pick the MOST RECENT (the run-id
   YYYYMMDD-HHMMSS prefix orders them), surface `Resuming <run-id>`, and jump to
   the FIRST INCOMPLETE phase -- the first phase whose done-signal is absent. Each
   phase below opens with its skip guard, so jumping there resumes cleanly.
4. If no candidate matches, start a fresh run via the normal Phase-0 path below.

Fallback: when the user passes `--resume <run-id>`, resume THAT run dir directly
(skip the slug scan), surface `Resuming <run-id>`, and jump to its first incomplete
phase. A `--resume <run-id>` whose dir is missing or already has report.md is
surfaced as nothing-to-resume / already-complete -- never silently restarted.

THE DEGENERATE-AGGREGATE MITIGATION (the highest-risk correctness item). When
resuming a run whose report.md is ABSENT, NEVER infer stage-2 completion from
survivors.json confidence values: a run that crashed between stage 1 and the verify
wave can leave a PREMATURE survivors.json that is all-Unsupported (no votes were
cast yet), and consuming it as final would emit a silently-wrong all-Unsupported
report. The authoritative stage-2 signal is the run_state.json { stage2_complete:
true } sentinel, NOT the survivor confidence values. So when report.md is absent:
finish the verify wave (cast the missing votes, see Phase 5), then ALWAYS re-run
the aggregator's stage-2 tally (it is idempotent and cheap), and write run_state.json
{ stage2_complete: true } only after a clean stage-2 exit. A non-zero aggregator
exit stays a RUN FAILURE (surface stderr; never consume a missing survivors.json)
-- resume does not weaken the aggregator's fail-closed discipline.
</resume>

<scope>
## Phase 0: Scope guard

Skip guard: if scope.md already exists in the resumed run dir, the scope is fixed
-- read it and proceed to Phase 1 without re-clarifying.

Generate the run-id yourself, in this session, at scope-guard time. Format it as
YYYYMMDD-HHMMSS-<short-slug>, where the slug is a short kebab-case label derived
from the research question. The aggregator NEVER generates the run-id -- it is a
pure function of run-dir contents and takes the run dir as its only argument.

Create the run dir at .lz-research/<run-id>/ relative to the working directory.
This dir holds candidates/, claims/, excerpts/, sources/, votes/, plus scope.md,
survivors.json, and report.md as the run proceeds. The dir is gitignored and
RETAINED as the audit trail; do not delete it.

When the scope is underspecified, ATTEMPT to clarify it with AskUserQuestion.
When an answer comes back (the interactive path), record the clarified scope in
scope.md and proceed on it. When no answer comes back (the headless `-p` path,
which has no answer channel), do NOT block waiting -- proceed on STATED
ASSUMPTIONS, surfaced as `Assuming <X> (unverified)` frames. Record each frame in
scope.md and echo them into the report header in Synthesize. Keep the frame words
intact: `Assuming` and `(unverified)`. Workers NEVER call AskUserQuestion -- it is
unavailable to subagents; only this main session attempts it.
</scope>

<decompose>
## Phase 1: Decompose into sub-angles, then Gate 1

Skip guard: if decompose.json already exists in the resumed run dir, this phase
(decomposition AND the Opus Gate-1 consult) is already done -- read the fixed
angles, gate1_note, and selected_urls from it and proceed to Phase 2 WITHOUT
re-decomposing and WITHOUT re-spending the Gate-1 consult.

Decompose the research question into about five distinct sub-angles -- the facets
the answer hinges on, including at least one disconfirming angle that searches the
negation of the likely answer. Cap the count at ANGLES = 5 BEFORE spawning any
worker; if the question suggests more, fold the weakest angles together so the
ceiling holds.

Then consult the Opus advisor at Gate 1. Make a single foreground Agent call to
the reused advisor agent with a per-invocation model: opus, packaging bounded
curated JSON only: the research question, the proposed sub-angles, and the ranking
cut-line (which angles to prioritize). Do not package raw source text. The
SESSION-DESIGN "Gate 1b" re-order is the SAME consult continued, not a new spawn:
the advisor may return both the angle framing and a re-ordering in this one
response. This is the FIRST of the two Opus consults. Apply the advisor's framing
to the angle set before searching.

Then WRITE decompose.json into the run dir, right after Gate 1 and BEFORE
dispatching any search worker. Record the fixed angle set as angles (each
{ id, text, priority }, where id is the search-worker id for that angle, kept
filename-safe and `:`-free), the bounded Gate-1 advisor note as gate1_note, and
the Gate-1-ranked URL set as selected_urls. This is the Phase-1 done-signal: it
lets a resume skip both decomposition and the Opus Gate-1 spend. The aggregator
does NOT read decompose.json -- it is a SKILL-owned resume artifact, additive to
the schema; the frozen aggregator shapes are byte-unchanged.
</decompose>

<search>
## Phase 2: Search wave

Skip guard: skip any sub-angle whose candidates/<worker-id>.json already exists in
the resumed run dir -- that sub-angle's search is done and its candidate list is on
disk. Dispatch search workers ONLY for the sub-angles whose candidate file is
missing; if every sub-angle already has its file, skip the search wave entirely and
proceed to Phase 3.

Dispatch the search wave as foreground worker calls, at most 5 in-flight per turn.
For each sub-angle, make one research-search-worker Agent call with a
per-invocation model: sonnet, passing the sub-angle text, the run-dir paths, and a
worker id. Dispatch exactly N = min(remaining angles, 5) calls in ONE turn, each
foreground, then WAIT for all N one-line receipts before the next turn, and assert
you received exactly N receipts. If more than 5 angles remain, repeat as
ceil(count / 5) sequential sub-waves of at most 5; never issue a sixth concurrent
Agent call.

Each search worker writes its deduplicated candidate list to
candidates/<worker-id>.json and returns a counts-only receipt. The main session
reads only the receipts; the candidate lists stay on disk. After all sub-waves
return, gather the distinct candidate URLs across the candidates/ files for the
extract wave.
</search>

<extract>
## Phase 3: Fetch and extract wave

Skip guard: skip any candidate URL whose claims/ + excerpts/ + sources/ records
already exist in the resumed run dir -- that source is fetched, its excerpt stored
verbatim, and its claims written. Dispatch extract workers ONLY for the selected
candidates whose records are missing; if every selected candidate already has its
records, skip the extract wave entirely and proceed to Phase 4.

Cap the fetch set at MAX_FETCH = 15 distinct candidate URLs BEFORE spawning. If
the deduped candidate set is larger, select the top 15 by the Gate-1 ranking and
drop the rest -- the cap is applied at dispatch, because the aggregator
fail-closes above its raw-claims ceiling.

Dispatch the extract wave at the same at-most-5-in-flight foreground cap. For each
selected candidate, make one research-extract-worker Agent call with a
per-invocation model: sonnet, passing the source URL, the run-dir paths, and a
worker id. Dispatch N = min(remaining fetches, 5) per turn, wait for all N
receipts, assert the count, and repeat as ceil(count / 5) sequential sub-waves of
at most 5. Each extract worker fetches one source, stores its excerpt verbatim at
fetch time to excerpts/, writes the claim record to claims/ (binding each claim to
a verbatim quote and an excerpt id, and setting load_bearing: true on a claim it
judges central or high-consequence), writes the source record to
sources/<percent-encoded-key>.json, and returns a counts-only receipt.
</extract>

<aggregate>
## Phase 4: Aggregate stage 1

Skip guard: if survivors.json already exists in the resumed run dir, stage-1
already ran -- you MAY skip re-running it here and proceed to Phase 5 to cast the
remaining votes. But do NOT treat that survivors.json as a finished tally: it can
be a PREMATURE stage-1 array written before any vote was cast (all-Unsupported),
and stage 2 will rewrite it from the votes. Completion is decided ONLY by the
run_state.json sentinel and report.md, never by these stage-1 confidence values.
(The aggregator is idempotent, so re-running stage 1 here is also safe if you
prefer to refresh it.)

Shell the off-model aggregator exactly once, as a single Bash node call:

node "${CLAUDE_PLUGIN_ROOT}/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs" "<run-dir>"

It reads claims/ and excerpts/, deduplicates and ranks and runs the quote-recheck,
and writes survivors.json -- an array of survivor records, each carrying a cluster
id (cluster0, cluster1, and so on), the claim, the distinct sources, the
corroboration lower bound, quote_fidelity, confidence, and the escalate flag. It
prints a four-line counts-only summary on exit 0.

A non-zero exit is a RUN FAILURE: exit 2 is a ContractError (a malformed run dir,
a missing required field, an overflow above a fail-closed ceiling). Stop and
surface the stderr message; never proceed as if survivors.json exists when the
aggregator did not write it. Do NOT reason over the raw claims or votes in context
-- the aggregator is the single reducer.
</aggregate>

<verify>
## Phase 5: Verify wave, then aggregate stage 2

Skip guard: cast ONLY the MISSING vote seats. For each survivor and each of its
three seats, skip the seat whose votes/<cluster-id>-<seat>.json already exists in
the resumed run dir -- that seat's vote is cast and stays valid. Cluster ids are
reproducible (the aggregator's mergeClusters is deterministic) and are ALREADY the
vote-file keys, so a resume re-keys NOTHING: existing votes match the same cluster
ids and only the missing seats are re-cast. The same applies to escalate re-votes:
re-cast an escalated survivor's seat only if its vote file is missing.

Read survivors.json. For each survivor, dispatch three isolated verify seats: make
three research-verify-voter-sonnet Agent calls, each with a per-invocation model:
sonnet, each with no shared context and a single assigned attack mode. Package the
survivor's stage-1 cluster id into each voter prompt and name each vote file by
that cluster id and the 0-indexed seat: votes/<cluster-id>-0.json,
votes/<cluster-id>-1.json, votes/<cluster-id>-2.json. Vote files MUST be keyed by
the stage-1 cluster id, not by a claim or member id -- a merged multi-member
cluster mis-tallies silently if its votes are keyed by member id.

Re-vote every survivor whose escalate flag is true. The escalate flag is the
aggregator's deterministic re-vote signal (the union of Contested, OR-folded
load_bearing, and a stable-hash audit sample of unanimous High upholds); read it
straight from survivors.json and dispatch a fresh Sonnet re-vote seat on every
true flag. Do not recompute the escalate set -- the aggregator already computed it
off-model.

Dispatch all of this verification under the at-most-5-in-flight foreground cap:
N = min(remaining seats, 5) per turn, wait for all N receipts, assert the count,
sub-waves of at most 5. The verify voters are Sonnet; never spawn the
eval-reference-only Opus voter variant.

Then shell the aggregator a second time, the same single Bash node call on the
same run dir. Stage 2 re-reads votes/, tallies each cluster to its confidence
tier, and re-runs the quote-recheck. A non-zero exit is again a RUN FAILURE.

After a clean (exit 0) stage-2 run, WRITE run_state.json { stage2_complete: true }
into the run dir. This sentinel is the AUTHORITATIVE stage-2-complete signal for a
later resume -- the SKILL writes it, the aggregator never does. Write it ONLY after
a clean stage-2 exit; never before, and never on a non-zero exit.

On the RESUME path (report.md ABSENT), this is the degenerate-aggregate mitigation:
ALWAYS re-run this stage-2 tally after filling the missing votes, regardless of any
survivors.json already on disk. A crashed run can leave a PREMATURE stage-1
survivors.json that is all-Unsupported (written before any vote); re-running the
idempotent stage-2 tally OVERWRITES it with the true post-vote tally. NEVER infer
stage-2 completion from survivors.json confidence values -- only the run_state.json
{ stage2_complete: true } sentinel (and report.md) signal completion. Do NOT edit
the aggregator to detect partial writes: the SKILL counts votes itself, pre-validates
each vote file's JSON before the call, and re-dispatches any damaged seat; the
aggregator stays unchanged and its fail-closed ContractError discipline is intact.
</verify>

<synthesize>
## Phase 6: Gate 2, then assemble the cited report

Skip guard: if report.md already exists in the resumed run dir, the run is complete
-- surface the existing report and stop; do NOT re-run Gate 2 or re-assemble. Enter
this phase only once report.md is absent AND run_state.json { stage2_complete: true }
is present (the stage-2 tally is final). If the sentinel is absent on a resume,
return to Phase 5 and re-run the stage-2 tally first (the degenerate-aggregate
mitigation) -- never synthesize a report off a stage-1 survivors.json.

Consult the Opus advisor at Gate 2. Make a single foreground Agent call to the
reused advisor agent with a per-invocation model: opus, packaging survivors.json
ONLY (the bounded, post-tally survivor array) -- not the raw excerpts and not the
raw votes. Ask it to sanity-check the synthesis and the confidence calibration.
This is the SECOND and final Opus consult.

Then assemble report.md per the 5-section micro-format in
@${CLAUDE_PLUGIN_ROOT}/references/lz-deep-research-orchestration.md: Question and
Scope (echoing the scope.md Assuming-frames); Key Findings (one bullet per
surviving claim with an inline (Title, url) citation, a confidence tag from the
frozen five, and the two-assurance pair); a first-class Contested and Unsupported
section showing dissent; the Confidence and Assurance legend; and Sources.

Produce claim_support (Assurance 2) yourself in this synthesis step for each
claim -- it is a judgment of whether the quoted text entails the claim, and it is
NEVER the aggregator's output and NEVER derived from quote_fidelity. Join each
citation from sources/<percent-encoded-key>.json: read that per-source record for
the title and url, fail loud (or mark citation: source-record-missing) when the
record is absent, and never re-canonicalize the key -- read it exactly as it
appears in the survivor's sources array. Where the report references the
verify-voter live-certification verdict, carry the maintainer-curated
distribution caveat: the verdict certifies on the maintainer-curated
distribution, not all production.

Write report.md into the run dir and surface it to the user. The run dir is
RETAINED as the audit trail -- do not clean it up.
</synthesize>
