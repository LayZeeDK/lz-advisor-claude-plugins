---
phase: 23
phase_name: "judge-free-confidence-and-operating-envelope-for-lz-deep-res"
project: "lz-advisor"
generated: "2026-09-08"
counts:
  decisions: 10
  lessons: 11
  patterns: 11
  surprises: 11
missing_artifacts:
  - "23-UAT.md"
---

# Phase 23 Learnings: judge-free confidence and operating envelope for lz-deep-research

Nine plans, four post-execution gates, five published records and an operating envelope. The phase set
out to measure a research skill against a built-in reference system without a judge. It got a
judge-free component reading and a single-system citation reading, and it did NOT get the comparative
report-quality reading it most wanted -- recorded as a named termination rather than a gap.

**The dominant finding is not any single measurement. It is that a stated figure or a stated control
disagreed with disk 28 times, and every one was caught by measuring rather than by reading.**

## Decisions

### Freeze the pre-registration in its own timestamped commit, before any spend
Every bar, item list, rule, seed and disclosure was frozen in a commit containing exactly three files,
and every later spending commit asserts `git merge-base --is-ancestor` against it.

**Rationale:** D-16. Spend that lands before the freeze cannot be un-spent, and a pre-registration
written after seeing results is not a pre-registration. Keeping the commit to exactly three files makes
its timestamp unambiguous -- a freeze carrying tracking churn muddies what was frozen and when.
**Source:** 23-04-PLAN.md, 23-04-SUMMARY.md

### Record the n=2 capture budget as an explicit freeze, ratified rather than deferred
One fresh q2 pair on both systems, with the existing q1 pair carried as a disclosed second data point.

**Rationale:** D-03. Phase 22 had a maintainer DEFER a full campaign and the executing session then
carried the reduction forward as though ratified, with no amendment covering it. This phase states the
smaller set as its own freeze with the power implications up front, and records the ratification. A
deferral is not a ratification.
**Source:** 23-04-PLAN.md, 23-CONTEXT.md

### Freeze the spike ceiling before the spike, and say why the requirement's literal reading is not the criterion
At most 3 resume cycles across at most 2 reset windows, with ENV-05's literal "inside one 5-hour
window" deliberately NOT operative.

**Rationale:** D-05/D-06. A strict one-window bar fails by construction on Phase-22 evidence already in
hand, so testing it would terminate ENV-06 on a documented rather than a newly-learned reason. Marking
the reinterpretation as ratified-not-drift is what stops a later reader mistaking it for scope creep.
**Source:** 23-04-PLAN.md, lz-eval-p23-prereg.md

### Force executor isolation to `none` for the whole phase
Sequential execution on the primary checkout, with `.planning/config.json` left byte-identical.

**Rationale:** `eval/.cache/` and `.lz-research/` are gitignored, so a fresh worktree lacks the captures
and caches that plan preconditions halt on, and MANIFEST writes into the cache would be discarded with
the worktree. Each wave held exactly one plan, so isolation bought no parallelism -- only the risk of a
forced worktree removal recursing a cache with no backup.
**Source:** 23-01-SUMMARY.md, 23-CONTEXT.md

### Report Slice A per direction, never pooled, with the output key set asserted exactly
`sliceARead` returns exactly `unrefuted`, `refuted`, `n`, `drawSeed`, `provisionalLimits`.

**Rationale:** No rate, interval or pass/fail field exists to be mistaken for a certification. Asserting
the EXACT key set forecloses every pooled name including ones nobody has thought of yet, which a list of
named absences cannot do.
**Source:** 23-02-SUMMARY.md, lz-eval-p23-sliceA-read-record.md

### Route the ENV-04 bar onto the fresh q2 pair and publish q1 as a dry run that sets no bar
**Rationale:** D-02/D-20. Prior sessions had partial sight of q1, and a bar set on data the designer has
seen measures the designer. Publishing the q1 audit as an explicitly not-bar-setting dry run raised the
phase floor -- a real ENV-04 reading existed before any capture ran -- without contaminating the bar.
**Source:** lz-eval-p23-citation-audit-q1-dryrun.md, 23-03-SUMMARY.md

### Order the cheap certain reading before the expensive uncertain one
Slice A ran before the q2 captures, both drawing the same 5-hour pool.

**Rationale:** Phases 19 through 22 each ended with nothing publishable. Spending the certain reading
first means a pool exhaustion costs the phase its comparative reading but not its floor. The ordering,
not the budget, is what made this phase end with something.
**Source:** 23-05-PLAN.md

### Amend rather than edit, at the time the change is taken
AMENDMENT RECORD 1 corrected the voter transport row and labelled the dispatched cutoff, dated, with
both superseded and new sha256 digests recorded.

**Rationale:** Recording both digests is what lets a later reader confirm the superseded pin belonged to
the superseded template rather than taking the new one on trust. Taken pre-spend with zero verdicts in
existence, so no result could have motivated it.
**Source:** lz-eval-p23-prereg.md, 23-05-SUMMARY.md

### Record discrepancies rather than reconcile them
Three frozen-record discrepancies were recorded side by side with the figures they contradict, and no
Phase-22 artifact was edited.

**Rationale:** Bending an extraction rule to hit an expected number is exactly the rule-tuned-to-a-number
the commit-ordering control exists to prevent. When the plan expected 13 unique canonical sources and
the honest measurement was 18, the rule was not contorted to reach 13.
**Source:** 23-03-SUMMARY.md, 23-04-PLAN.md

### Keep the audit-trail sections in the envelope despite an adopter-focused review
A review found the envelope mis-aimed at auditors and recommended cutting roughly a third of it.

**Rationale:** The milestone auditor is a second legitimate reader, and the Termination section exists
for it. Add what a reader is missing; do not restructure and break a consumer.
**Source:** 23-ENVELOPE.md Review record, 23-REVIEW.md

---

## Lessons

### Prose asserting a control the code does not implement is this project's dominant defect class
Twenty-eight instances across the phase. Six of the seven code-review BLOCKERs were a module header
claiming a guard the code lacked. A HIGH security threat (T-23-07) was a run-id validation and
containment assertion that existed only as a retrospective sentence in a SUMMARY, with no code anywhere.

**Context:** Three audits read those same files for other purposes -- threat mitigations, wording
properties, coverage -- and all three read past the gap, because none of them was comparing the header's
claim to the code's behaviour. That comparison is a distinct act and needs its own gate.
**Source:** 23-SECURITY.md, 23-REVIEW.md

### A workflow's run-order summary can omit a mandatory gate
The house rules state the post-execution order as one line that does not include code review. Code
review is named in the same file's dedicated-agent list, Phase 22 produced a `22-REVIEW.md`, and this
phase's own 23-09-SUMMARY listed it as pending. The summary line was trusted and the gate was skipped.

**Context:** Caught only when the maintainer asked whether the preceding steps had run. The review then
found 7 BLOCKERs that no other gate would have found. A summary of a rule is not the rule.
**Source:** 23-REVIEW.md, 23-09-SUMMARY.md

### A probe that the subject already knows the answer to measures nothing
The first Slice-A transport pilot asked a voter whether Nigeria's capital is Lagos. Both candidate seats
answered in about two seconds with zero tool calls, and one answered wrongly. That looked like a broken
seat. Re-probing with a claim no model could know drew two confirmed web searches over thirty seconds.

**Context:** The first probe conflated "will it retrieve?" with "does it already know?". The seat was
fine; the experiment was badly designed. A capability probe has to be unanswerable from memory.
**Source:** 23-05-SUMMARY.md

### Retention has to fire on partial captures, because the successful capture may never come
Both built-in q2 runs died on session limits and neither produced a report. Retention ran on each
failure anyway, taking the evidence from 34 MB to 87 MB across 422 files.

**Context:** A retention step that waited for a successful capture would have lost every byte -- the
Phase-22 built-in session had already aged out of the transcript store entirely, which is why the
protocol is frozen rather than advisory.
**Source:** 23-06-SUMMARY.md, lz-eval-p23-spike-record.md

### The frozen retention path would have retained almost nothing
It named a flat `subagents/agent-*.jsonl` shape. The real session directory held three subdirectories,
and the fetched source documents -- 13 MB, the evidence a quote-match consumes -- sat outside that glob
entirely. The worker transcripts were nested a level deeper than the glob reached.

**Context:** Retention was widened to a recursive copy, which keeps strictly more than the frozen path
specified and so cannot lose intended evidence. A path shape frozen from one observation is a guess
about a format that is not contractual.
**Source:** lz-eval-p23-spike-record.md Part 2

### The shipped agent could not consume the prompt the phase pinned for it
`research-verify-voter-sonnet` requires an evidence excerpt, an attack mode, an arm and a vote-file path
that the frozen one-word dispatch string does not carry, and it writes a four-field vote JSON where the
string demands one lowercase word.

**Context:** Found by an executor that halted rather than routing 40 items through a prohibited
transport. The plan's stated rationale for reading that agent file -- "so the dispatched prompt matches
what the agent expects" -- was false on disk. A generic seat under the reviewed prompt was substituted by
dated amendment before any verdict existed.
**Source:** 23-05-SUMMARY.md, lz-eval-p23-prereg.md AMENDMENT RECORD 1

### Branch (b) versus branch (c) turns on attempted-versus-not, not on whether budget was involved
The pre-registration lists "a capture that cannot complete in budget" under branch (b)
NOT-ESTABLISHABLE-BY-METHOD, while branch (c) NOT-ATTEMPTED-BY-BUDGET records only that spend was
declined.

**Context:** The built-in capture ran twice at full metered cost and produced no report. That is (b): the
method was attempted and its result is unreachable for a reason checkable on disk. Nothing was declined,
so nothing in the phase is (c).
**Source:** lz-eval-p23-env06-record.md, 23-08-SUMMARY.md

### Rounding an upper bound down is the flattering direction, and it propagates
The spike record published its lower cost figure to full float precision while writing its upper bound as
a two-decimal value in all six disclosures. Because that record originates the travel mandate requiring
the bound to accompany the figure, its own rounded wording carried the imprecision into a downstream
record.

**Context:** Found by an independent content review. The document that sets a precision standard is the
one that has to meet it.
**Source:** 23-REVIEW.md, lz-eval-p23-spike-record.md

### An exhaustive-looking disclosure list with a hole in it is worse than no list
The envelope's NOT ESTABLISHED section was eleven numbered rows each with a reason. The gap most
relevant to a reader -- that the published confidence labels were never calibrated -- was not among them,
while the routing section instructed the reader to act on those labels.

**Context:** The structure signalled completeness and the omission then read as an absence of concern.
`High` appeared nowhere in the document despite being the label that drives the re-vote audit sample.
**Source:** 23-ENVELOPE.md NOT ESTABLISHED row 12, 23-REVIEW.md

### Delegated work needs its provenance re-derived, not trusted
Thirty-two of the forty Slice-A dispatches were driven by a delegated loop. All forty dispatch records
were afterwards re-derived from the frozen draw and every digest recomputed: 40 ok, 0 mismatched, no
extra records.

**Context:** Without that check, "the sub-agent used the pinned string" is an assertion. With it, the
delegation is auditable.
**Source:** 23-05-SUMMARY.md

### The GSD SDK drops a config key from verbs whose names imply read-only
Six distinct verbs were observed deleting `branching_strategy` from `.planning/config.json`, including
`init.execute-phase`, `init.phase-op`, `dispatch-isolation`, `phase.mvp-mode`, `state.update-progress`
and `state.load`. `state.update-progress` additionally returns `{"updated": false}` on this STATE.md
format -- all risk, no benefit.

**Context:** Mitigated by diffing config and STATE after every query call and reverting before staging.
The progress block is hand-edited instead.
**Source:** 23-01-SUMMARY.md through 23-09-SUMMARY.md, 23-SECURITY.md

---

## Patterns

### The discrimination proof: break it, watch the specific test fail, restore, record both outputs
Every guard in the phase was proven by disabling it and recording the failure verbatim -- "27 pass / 2
fail", "exactly 1 of 28 with Missing expected exception", "3 of 23, all three T-22-15 cases".

**When to use:** Any time a test is offered as evidence a guard works. A test that only ever passes on
correct code is not evidence, and the failure output is what distinguishes a real assertion from a
tautology.
**Source:** 23-01-SUMMARY.md through 23-09-SUMMARY.md, 23-PATTERNS.md

### Commit ordering as the control, checkable from ancestry alone
The citation rules landed at 14:26:29 and 14:30:59; the first computed rate landed at 14:36:06. A reader
verifies from git that the rules could not have been tuned to the number.

**When to use:** Whenever a measurement rule and its result are authored by the same party. The ordering
is the evidence; nothing about the rule's content can supply it.
**Source:** 23-03-SUMMARY.md

### Assert ordering with `git merge-base --is-ancestor`, never with timestamps
Two commits can share a timestamp; topology is what orders them. The phase's central claim was
re-verified over 22 post-freeze commits with a pre-freeze negative control that correctly failed.

**When to use:** Any before-and-after claim about commits. Include the negative control, or the test
passes on everything.
**Source:** 23-09-SUMMARY.md, 23-VERIFICATION.md

### Close provenance before the first result exists
`writeDispatchRecord` persists the exact dispatched string plus its sha256 per item, write-once and
refusing to overwrite; the read fails closed on a verdict with no dispatch record and on a digest that
disagrees with its stored string.

**When to use:** Before any dispatch that will be scored. Provenance cannot be retrofitted after a
write-once run -- the Phase-22 transcription-fidelity check recovered zero payloads for exactly this
reason.
**Source:** 23-02-SUMMARY.md, lz-eval-p23-sliceA-read-record.md

### Make an asymmetry visible rather than preventing it
The voter prompt frames the task as deciding whether a claim is REFUTED, which could nudge toward
refuting. The balanced 20-plus-20 draw with per-direction cells made the resulting one-sidedness -- two
false refutes, zero false upholds -- legible instead of hiding it inside a pooled 38-of-40.

**When to use:** When a suspected bias cannot be designed out. Report at the granularity where it would
show, and it becomes a finding rather than a confound.
**Source:** lz-eval-p23-sliceA-read-record.md, 23-05-SUMMARY.md

### Assert an exact key set to foreclose a class of error
Rather than listing forbidden field names, the co-test asserts the read's output has exactly five keys.

**When to use:** When the risk is a category of thing appearing, not one named thing. A list of named
absences misses the name nobody thought of.
**Source:** 23-02-SUMMARY.md

### Use an already-published result as a regression oracle
A corrected quote-span implementation had to reproduce the q1 dry run's published five-quote population
exactly -- and did. A naive span regex had been reporting a garbage population.

**When to use:** Whenever a measurement path is repaired after publication. The prior figure is a free
fixture, and without it a "fix" that changes the answer is indistinguishable from one that corrects it.
**Source:** 23-07-SUMMARY.md, lz-eval-p23-citation-audit-q2-record.md

### Detect an identity leak by allowlist inversion, never by searching for the excluded value
Assert that the only email-shaped token present is the approved public address. Writing the address to be
excluded as a search needle IS the leak.

**When to use:** Every identity-hygiene check. Verified across 64 commits and 60 touched files.
**Source:** 23-SECURITY.md T-23-20

### Measure the assumption the instrument states, rather than inheriting it
The frozen third provisional limit asserts the voter "searches the live 2026 web". Recording tool-use per
item turned that into a measurement: 30 of 40 retrieved, so a quarter of the pool was decided
closed-book and the limit holds for 30 of 40 rather than universally.

**When to use:** When a frozen artifact states a behavioural assumption. Recording it outside the frozen
schema keeps the measurement from perturbing what it measures.
**Source:** lz-eval-p23-sliceA-read-record.md

### Pilot a transport with a synthetic probe before spending on the real set
One throwaway call surfaced that the candidate seat answered from memory in two seconds and got the
answer wrong. Forty such answers would have looked exactly like a result.

**When to use:** Before any batch dispatch that costs metered budget. Use a synthetic item so no
provenance is burned, and pick one the subject cannot answer without the capability being tested.
**Source:** 23-05-SUMMARY.md

### Build the anti-drift needle FROM the constant, and assert the value-plus-one is absent
The co-test imports each frozen constant, builds its search needle from the value, and separately asserts
the value-plus-one form does not appear.

**When to use:** Any time prose and code state the same number. The second assertion is what proves the
first is not satisfied by a substring match.
**Source:** 23-04-SUMMARY.md, lz-eval-p23-prereg.test.mjs

---

## Surprises

### The envelope contradicted itself, and the correct fact was already in it
Its header table recorded the Slice-A seat as a generic `Explore` sub-agent and flagged it a named gap.
Fifteen lines later, "What this covers" said the claims were judged by the shipped verify-voter.

**Impact:** Four independent lenses read that document closely and none caught it. A fifth agent found it
by checking their claims against disk. No external knowledge was needed -- only reading the document
against itself.
**Source:** 23-ENVELOPE.md Review record, 23-REVIEW.md

### The review-before-use ancestry rule caught its own authors
The review record for two citation modules is not a git ancestor of their first-use commit, so by the
phase's own ENV-08 boundary rule the modules were used before their review was recorded.

**Impact:** Logged as a ledger row with nothing back-dated, then accepted as an unrepairable historical
defect. A control that fires on the people who wrote it is the strongest available evidence it is real
rather than decorative.
**Source:** 23-09-SUMMARY.md, 23-VERIFICATION.md

### Two distinct DOIs collapsed onto one arXiv identifier
`ARXIV_RE` left its prefix optional and the token unanchored, so any four-dot-five digit run anywhere
matched. `10.1145/3442188.3445922` canonicalized to `arxiv:2188.34459`, and a different DOI sharing that
digit window produced the same id.

**Impact:** This is the function that produces the headline unique-source counts. Latent on this phase's
data -- neither corpus contained a DOI -- and it would have corrupted the next dataset silently.
**Source:** 23-REVIEW.md CR-03

### A ledger declaring `0/0 confirmed` certified as verification-complete
The predicate required the declared and confirmed counts to be equal and the table rows to match. At
zero, all three conditions hold.

**Impact:** A report that verified nothing would have passed the completeness gate. It survived only
because the realized capture produced no report at all and took the no-heading branch.
**Source:** 23-REVIEW.md CR-05

### A ledger heading quoted inside a code fence governed the verdict
The heading scan walked every line with no fence handling and took the first match, demoting the real
ledger to a duplicate. Its sibling module already had a proven `stripFencedCode` for exactly this.

**Impact:** A documentation example inside a report could have decided a published termination branch.
**Source:** 23-REVIEW.md CR-04

### The code review's own recommended fix would have moved a published figure
Its snippet allowed only a `www.` arXiv host. The lz q2 report cites one paper both as a bare identifier
and as an ar5iv mirror URL, which the unanchored rule merged by accident; the proposed anchor would have
split them and moved the published unique-source count from 12 to 13.

**Impact:** Caught by the fixer rather than applied verbatim. The host rule was widened to any arXiv
subdomain, making the merge correct on identity grounds instead of accidental.
**Source:** 23-REVIEW.md CR-03, the CR-03 fix commit

### Extraction ran for every phase; the ROLLUP that feeds the cross-project pool is what stopped at 17.3
A closure-procedure review reported that `LEARNINGS.md` reads "phases 16, 17, 17.1, 17.2, 17.3" and
concluded phases 18 through 22 were never extracted. **That conclusion is wrong and was repeated by the
orchestrator without checking.** Per-phase files exist for all of them -- 18-LEARNINGS.md (36 items),
19 (19), 20 (33), 21 (16), 22 (33) -- and this phase's is the sixth. What stopped at 17.3 is
`.planning/LEARNINGS.md`, the project ROLLUP.

**Impact:** The real defect is worse than the reported one and in a different place. `learnings.copy`
reads the rollup, so running it after this extraction returned `total 103, created 0, skipped 103` -- it
re-offered the 103 rollup items already pooled and never saw the 137 items sitting in six per-phase
files. With `features.global_learnings: true`, six phases of learnings exist locally and have never
reached `~/.gsd/knowledge/`. Extraction writes per-phase; pooling reads the rollup; nothing in the
observed chain updates the rollup.

This is also the 29th instance of the phase's own dominant pattern, committed by the orchestrator inside
the extraction itself: a summary was trusted instead of the source, and the source was one `ls` away.
**Source:** 23-VERIFICATION.md MAINTAINER DISPOSITIONS; corrected against `.planning/phases/*/[0-9]*-LEARNINGS.md`

### The reference system produced no report at all, twice, for about 55 dollars
The built-in capture ran a cold pass and one resume across two reset windows, ending in error both
times, with two assistant text blocks of 485 and 272 characters and no report.

**Impact:** ENV-06's comparative grading became unreachable and terminated on branch (b). The spike
verdict failed on COMPLETENESS while the ceiling half actually cleared -- only the window axis was spent.
**Source:** lz-eval-p23-spike-record.md, 23-06-SUMMARY.md

### The cost figure was ambiguous because both streams shared one session id
Whether the resume's terminal figure is cumulative or per-invocation decides between roughly 55 and
roughly 79 dollars, and the streams do not settle it.

**Impact:** Both readings were published, the cumulative one chosen on structural evidence rather than
because it is smaller, with the upper bound travelling alongside. A larger figure would have flattered
the comparison, so the choice runs against interest.
**Source:** 23-06-SUMMARY.md, lz-eval-p23-spike-record.md

### Retrieval turned out to be claim-dependent rather than guaranteed
Thirty of forty items drew web searches; ten were answered from parametric memory, split 16-of-20 and
14-of-20 across the two directions.

**Impact:** The frozen instrument asserts the voter searches the live web. It holds for three quarters of
the pool, so the reading is partly closed-book and is now described that way.
**Source:** lz-eval-p23-sliceA-read-record.md

### The verifier was more thorough than the phase's own claims
It re-ran freeze ancestry over 22 post-freeze commits where the plan had claimed 14, and re-derived the
frozen draw then diffed its 40 indices against the 40 verdict filenames.

**Impact:** Confirmed no item was substituted or dropped between draw and score -- a property nothing in
the phase had checked. Forty-one of forty-one re-derivations held with zero disagreements, which is a
meaningful signal after 21 earlier figure defects.
**Source:** 23-VERIFICATION.md
