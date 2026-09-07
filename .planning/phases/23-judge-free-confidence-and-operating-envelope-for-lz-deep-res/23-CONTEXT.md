# Phase 23: Judge-free confidence and operating envelope for lz-deep-research - Context

**Gathered:** 2026-09-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Produce defensible, honestly-bounded confidence in `lz-deep-research`'s research quality from
confidence sources that require NEITHER a calibrated LLM judge NOR closed-book gold, and publish an
OPERATING ENVELOPE naming both the region where the skill's output is evidenced and the region routed
to a human -- together with an explicit statement of what was NOT established and why.

This phase delivers READINGS and DOCUMENTS, not runtime behaviour. Nothing here changes the shipped
skill, and nothing here is a ship gate (D-03 carries).

**In scope:** a fresh Phase-23 pre-registration (ENV-01); MANIFEST admissibility + the
`extractSystemInit` fix (ENV-02); the judge-free Slice-A voter read (ENV-03); the deterministic
citation audit (ENV-04); the built-in capture-feasibility spike (ENV-05); the CONDITIONAL head-to-head
grading gated on that spike (ENV-06); the published envelope + termination (ENV-07); the review +
zero-OOF-spend discipline (ENV-08).

**Out of scope:** re-opening Phase 22 (`22-05-PLAN.md` is TERMINAL); calibrating a third judge
instrument; any change to the shipped skill's runtime design; the lz-deep-research workflow
re-architecture (deferred to a later milestone); release/publication (handled at
`/gsd-complete-milestone`).

</domain>

<decisions>
## Implementation Decisions

> Provenance: `/gsd-discuss-phase 23 --analyze --auto`, 2026-09-06. Three spend-determining freezes
> were ESCALATED to the maintainer rather than auto-locked, because they sit in the `--auto` trap
> quadrant (high impact, not-high confidence) and because auto-locking the capture-budget question
> would have repeated blocking anti-pattern #3 -- the un-ratified n=1 reduction -- verbatim. The
> remaining areas were auto-locked and are logged as such with their impact/confidence ratings.

### Capture budget and the ENV-04 contamination route (MAINTAINER-RATIFIED)

- **D-01:** Phase 23 budgets **ONE fresh capture pair (q2), on both systems**, gated behind the ENV-05
  spike. Slice-B **n=2**: the fresh q2 pair plus the existing q1 pair carried as a disclosed second
  data point. — **Reversibility:** costly — undoing means either discarding a paid built-in capture
  (~1.4 pool windows) or re-freezing the item set in a further phase's pre-registration; the frozen set
  is quoted in the ENV-01 commit, so a change after the freeze is an amendment, not an edit.
- **D-02:** ENV-04 therefore takes **route (a)**: the citation-audit bar is frozen on the FRESH q2
  pair, which no session has seen. The q1 pair is still audited, but its exploration-time contamination
  is disclosed and is NOT what the bar is set on. — **Reversibility:** one-way — the bar's credibility
  depends on being fixed before anyone reads q2; once read, route (a) is unavailable for that pair and
  only route (b) (disclosure) remains.
- **D-03:** This is an EXPLICIT freeze of a set smaller than Phase 22's frozen n=3, made in Phase 23's
  OWN pre-registration with its power implications stated up front, and ratified by the maintainer at
  discuss time. It is the deviation note's option 2, done properly. **A deferral is not a ratification;
  this one is a ratification and must be recorded as such in the ENV-01 pre-registration.**
- **D-04:** Phase 23 does NOT inherit `n=1` from the Phase-22 cache by default. The record must state
  that at n=2 no per-question generalisation is available -- a limit on the CLAIM, not merely on a
  confidence interval.

### ENV-05 spike clearing bar (MAINTAINER-RATIFIED)

- **D-05:** The spike CLEARS iff a built-in `/deep-research` capture reaches a verification-complete
  report within a ceiling frozen BEFORE the spike runs: **at most 3 resume cycles across at most 2
  reset windows.** This is the two-window protocol empirically validated in Phase 22. — **Reversibility:**
  one-way — the ceiling must be frozen pre-spike or the spike becomes a post-hoc pass/fail choice, which
  is exactly what pre-registration exists to remove.
- **D-06:** ENV-05's literal "inside one 5-hour pool window" is NOT the operative criterion, and the
  pre-registration must say so and say why: the Phase-22 q1 capture needed three resume cycles across
  two windows, so a strict one-window bar fails by construction on evidence already in hand. Testing it
  would terminate ENV-06 on a reason already documented rather than newly learned. **This is a
  deliberate, ratified reading of ENV-05, recorded here so it is not mistaken for drift.**
- **D-07:** The realized ceiling is itself a publishable ENV-07 finding about the reference system's
  operating envelope, whether or not the spike clears.

### Slice A draw (MAINTAINER-RATIFIED)

- **D-08:** Slice A freezes a **balanced draw of 40 items -- 20 unrefuted + 20 refuted.** Balance is
  load-bearing because ENV-03 requires the tally be reported PER CONFUSION-MATRIX DIRECTION and never
  pooled; an unbalanced draw leaves the smaller direction's row uninformative. — **Reversibility:**
  costly — the item list is quoted in the ENV-01 freeze and the voter spend is consumed on dispatch.
- **D-09:** The draw is sampled from the RE-VERIFIED pool (see D-10), not from the pre-registration's
  recorded 95/216. Selection must be deterministic and seeded, with the seed pre-registered.

### Stage-0 corrections, verified at zero spend during this discussion

- **D-10:** **The Slice-A yield does NOT reproduce the frozen record.** `filterSliceA` over the
  on-disk 500-row AVeriTeC dev cache yields **83 unrefuted / 181 refuted**; the pre-registration
  records "clean Supported = 95, clean Refuted = 216" from a 2026-06-22 inspection. The
  `SLICE_A_GATE` (>=8 / >=8) still clears with wide margin and both directions are populated, so the
  gate outcome is unchanged -- but **planning MUST use 83/181**, and the discrepancy MUST be recorded
  in the ENV-01 pre-registration rather than silently reconciled. ENV-03's zero-spend re-verification
  requirement is what caught this; do not treat the frozen numbers as authoritative.
- **D-11:** **`extractSystemInit` reads the wrong field, confirmed empirically.** The real `system/init`
  event in `eval/.cache/p22-baseline/builtin/qB1-run1.stream.jsonl` carries
  `claude_code_version: "2.1.186"`; `event.version` is `undefined`.
  `eval/lz-eval-baseline-manifest.mjs:91` reads `event.version`, so `ccVersion` is null and the
  ContractError at :94 fires on every real capture. This is the mechanical cause of security T-22-06 /
  validation gap B1. The ENV-02 fix is a **one-field change**: read `claude_code_version`, keeping
  `version` as a fallback. Fully verifiable offline against the two captures on disk. — **Reversibility:**
  reversible.

### Auto-locked areas (`--auto`, outside the trap quadrant)

- **D-12 (REVISED 2026-09-07 -- supersedes the original auto-locked wording):** **Citation-audit
  evidence source.** Verbatim-quote match runs against **stored excerpts obtained under a frozen
  retention protocol (D-17)**, NOT against "stored excerpts already captured" -- the original wording
  assumed a corpus that does not exist for both systems and is the reason the asymmetry below was
  initially misdiagnosed as structural. Live re-fetch is used ONLY for link/identifier resolvability,
  reported separately with its check date. *Rationale unchanged:* ENV-04 requires a DETERMINISTIC
  audit, and quote matching that depends on the live network is not reproducible (link rot, paywalls,
  content drift).

### Capture-artifact retention and the ENV-04 asymmetry (verified 2026-09-07)

- **D-17:** **A capture-artifact RETENTION PROTOCOL is frozen in ENV-01 and is a precondition of every
  capture.** Immediately after any capture completes, copy BOTH the run directory AND
  `~/.claude/projects/<cwd-hash>/<session-id>/subagents/` to a durable location before anything else.
  **Evidence this is required, not precautionary:** the built-in q1 capture ran 2026-06-23 with
  `cwd = D:\projects\github\LayZeeDK\lz-advisor-claude-plugins` and `session_id`
  `6e92b80e-d807-43ea-89d1-e24bf40f3ab1`. That session no longer exists anywhere under
  `~/.claude/projects` -- NO June-2026 session survives, and the oldest surviving session in this
  repo's project directory is 2026-09-04. Sessions age out. An artifact not copied is an artifact
  lost. — **Reversibility:** one-way — a capture whose artifacts aged out cannot be re-derived without
  re-spending the capture.
- **D-18:** **The ENV-04 quote-match asymmetry is a RETENTION failure, NOT a structural property of the
  built-in.** Verified empirically: an ordinary subagent transcript DOES retain fetched web content --
  this session's own researcher transcript is 915 KB with 57 `tool_result` lines, 29 WebFetch/WebSearch
  calls, and 57 URL-bearing lines. So the built-in's fetched content was very likely recoverable at
  capture time. What failed was keeping it. Do NOT plan around a permanent one-sided metric, and do NOT
  drop quote-match on the belief that the built-in cannot supply excerpts. **Residual unknown (the real
  open question):** the built-in is Workflow-hosted and its parent stream records `Workflow` as the only
  tool call, so its workers may be spawned by the Workflow runtime rather than as ordinary subagents and
  may write elsewhere or not at all.
- **D-19:** **ENV-01 freezes ONE pre-committed conditional on that unknown, with BOTH branches written
  before the spike runs.** The ENV-05 spike's FIRST observation records whether the built-in's workers
  leave recoverable fetched content under the retention protocol. Branch A (they do): symmetric
  quote-match runs on both systems for q2. Branch B (they do not): ENV-04's comparative bar uses only
  the symmetric text-derived metrics (identifier resolvability + structural citation coverage), and the
  lz quote-match is published as an explicitly-labelled SINGLE-SYSTEM diagnostic, never comparative.
  Resolving this after seeing any rate is the post-hoc choice pre-registration exists to remove.
- **D-20:** **The q1 lz-only quote-match runs as a published DRY RUN that does NOT set the bar.** The
  lz q1 corpus survives (`.lz-research/20260623-094345-llm-context-window-extension/`: 15 excerpts,
  14 claims, 60 votes, 12 sources, verbatim source text confirmed in `excerpts/w00.txt`). Auditing it
  costs nothing, exercises the script before it matters, and materially raises the phase's floor under
  termination branch (b). It is labelled not-bar-setting because the ENV-04 bar is frozen on the fresh
  q2 pair (D-02) and because the designing session had partial sight of q1.
- **D-21:** **A second frozen-record discrepancy, same shape as D-10 -- record, do not silently
  reconcile.** `.planning/notes/phase-22-diagnosis-two-root-causes.md` records "26 numbered ref markers,
  10-item source list" for the built-in q1 report; the full-file measurement is **69 markers / 13 unique
  sources**. Also: the ENV-01 contamination disclosure must record that the Phase-23 research session ran
  programmatic structure scans over BOTH q1 reports, which widens the D-02/ENV-04 contamination beyond
  the original discuss-session read.
- **D-22:** **ENV-02 is not fully closable offline until the plan names where `costUsd` comes from.**
  `validateManifest` requires a per-run cost and `system/init` does not carry one. Resolve the source
  (the stream's terminal result event, or an explicitly recorded manual figure) before writing the
  ENV-02 plan; if it is unrecoverable for q1, say so and treat q1's MANIFEST accordingly rather than
  inventing a value.
- **D-13:** `[auto]` **Citation-format normalization** -- frozen BEFORE any rate is computed, per
  ENV-04 and the advisory anti-pattern. The two systems cite differently (built-in: numbered references
  to arXiv identifiers in prose, 0 inline URLs in q1; lz: full inline URLs). Normalize to a
  system-agnostic identifier set (resolve arXiv IDs and URLs to a canonical form) so no
  URL-counting-shaped metric can favour lz. *Impact HIGH, confidence HIGH* -- high impact but the
  requirement text and the anti-pattern table already fix the direction, so it is not trap-quadrant.
- **D-14:** `[auto]` **Seed disposition** -- **SEED-005** (dispatch provenance: persist the exact
  dispatched string per item at dispatch time) **TRANSFERS** and binds every ENV-03 voter dispatch and
  any ENV-06 grading dispatch; it is not judge-specific. **SEED-002 / SEED-003 / SEED-004** are all
  Stage-2 judge-calibration-gate seeds, and Phase 23 declines that gate, so they are recorded
  **not-consumed-because-no-gate** and left DORMANT rather than retired -- a later phase that revives a
  judge gate still needs them. *Impact low, confidence HIGH.* Note this narrows the ROADMAP's
  "Consumes seeds SEED-002..005" line, which was written before the no-judge constraint was locked.
- **D-15:** `[auto]` **ENV-07 artifact** -- a committed `23-ENVELOPE.md` in the phase directory,
  carrying the envelope, the explicit not-established statement, and the resolved termination branch.
  *Impact low.*

### Sequencing constraint (hard)

- **D-16:** **No capture, vote, or score may run before the ENV-01 pre-registration is frozen and
  committed in its own timestamped commit.** The planner MUST sequence ENV-01 as its own wave, ahead of
  every spending task. ENV-02's `extractSystemInit` fix and the ENV-03 yield re-verification are
  zero-spend and may precede the freeze; both must be reflected IN the frozen pre-registration (the
  83/181 correction especially). — **Reversibility:** one-way — spend that lands before the freeze
  cannot be un-spent, and a pre-registration written after seeing results is not a pre-registration.

### Claude's Discretion

- Plan/wave decomposition of ENV-01..ENV-08, and which plans pair.
- The exact deterministic sampling seed and selection routine for D-08/D-09 (must be pre-registered,
  but the value is Claude's to pick).
- The q2 question text, within the ENV-05/D-05 bounded-capture constraint and Phase 22's Slice-B
  question-shape conventions -- a bounded single-facet question, matching the AMENDMENT RECORD 1
  narrowing that made captures feasible at all.
- The internal structure of `23-ENVELOPE.md`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope, requirements, and the reasoning behind them
- `.planning/ROADMAP.md` -- the **Phase 23** section (lines 323-375): goal, the why-this-is-not-Phase-22-again
  diagnosis, 5 constraints, 6 success criteria, and the **three-branch termination clause** in full.
- `.planning/notes/phase-22-diagnosis-two-root-causes.md` -- **REQUIRED.** The ENV requirement text is
  deliberately terse about motivation; this note carries why the ENV-04 contamination clause exists and
  why no third judge instrument may be calibrated. A planner working only from ENV-01..08 will miss both.
- `.planning/REQUIREMENTS.md` -- the **ENV-01..ENV-08** family block (lines 94-101) + traceability rows.
- `.planning/phases/23-judge-free-confidence-and-operating-envelope-for-lz-deep-res/.continue-here.md`
  -- the blocking-constraint table (4 blocking anti-patterns) and the required-reading order.

### The Phase-22 record that binds what Phase 23 may not do
- `eval/lz-eval-parity-prereg.md` §AMENDMENT RECORD 3 (line 344) -- the stopping rule: no third
  instrument, no prompt revision, no widened WiCE draw, no subgroup read; the single attempt is
  CONSUMED; verdict files are immutable.
- `eval/lz-eval-parity-prereg.md` §RETROSPECTIVE DEVIATION NOTE (line 516) -- the un-ratified n=1
  reduction, and "What a successor phase must do" (line 560), which D-01/D-03 answer.
- `eval/lz-eval-parity-prereg.md` §Section (v) (line 135) -- the Slice-A feasibility gate, the frozen
  fallback rule, and the PROVISIONAL limits that ENV-03 must carry into its artifact.
- `.planning/phases/22-.../22-VERIFICATION.md` -- the closure-route note prescribing a NEW phase.
- `.planning/phases/22-.../22-CONTEXT.md` -- D-01..D-20; note D-13 (the calibration disqualifier) is
  explicitly NOT carried into Phase 23.

### Seeds (Phase 23's declared inputs)
- `.planning/seeds/SEED-005-dispatch-provenance.md` -- **CONSUMED** (D-14); binds every dispatch.
- `.planning/seeds/SEED-002-llm-aggrefact-transfer-diagnostic.md`,
  `.planning/seeds/SEED-003-single-pole-subtle-subset.md`,
  `.planning/seeds/SEED-004-two-token-verdict-contract.md` -- judge-gate seeds, left DORMANT (D-14).

### Eval modules to reuse or fix
- `eval/lz-eval-sliceA-gold.mjs` -- `SLICE_A_GATE`, `collapseAvtLabel`, `filterSliceA` (emits only
  `{claim, claim_date}`, every leaky gold field stripped), `sliceAFeasibilityGate`, `tallyPerDirection`. REUSE.
- `eval/lz-eval-baseline-manifest.mjs` -- `extractSystemInit` (**FIX at line 91**, D-11), `buildManifest`,
  `validateManifest`. The ENV-02 admissibility gate.
- `eval/lz-eval-parity-judge.mjs`, `eval/lz-eval-parity-verdict.mjs` -- blinding / position-swap /
  two-layer verdict machinery, available to ENV-06 if the spike clears.
- `eval/.cache/chenxwh__AVeriTeC/data/dev.json` -- 500 rows on disk, gitignored, re-verified this session.
- `eval/.cache/p22-baseline/{builtin,lz}/qB1-run1.report.md` -- the two existing q1 reports.

### Project conventions (load-bearing)
- `.planning/PROJECT.md` "Review before use or publication" (Constraints + Key Decisions) -- ENV-08.
  Every eval SCRIPT gets code review + code-reviewed unit tests; every PROMPT/REFERENCE that steers an
  LLM task gets content review, BEFORE it drives an LLM task or ships.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- The `eval/` tree has its own `package.json` and `node_modules` and NEVER ships; the one-directional
  eval -> runtime import boundary is enforced by `eval/lz-eval-packaging-boundary.test.mjs`.
- Slice-A machinery is complete and frozen (`lz-eval-sliceA-gold.mjs`): gate, collapse map, the
  leak-stripping filter, and per-direction tally. ENV-03 composes it; it does not rebuild it.
- MANIFEST machinery exists (`lz-eval-baseline-manifest.mjs`) and is one field away from working
  against real captures.
- The two q1 reports and 120 calibration verdicts are on disk under `eval/.cache/p22-baseline/`.

### Established Patterns
- Pre-registration-before-scoring, frozen in its own timestamped commit, with sha256 pins for anything
  claimed "unchanged" -- carried from Phases 18-22 (AMENDMENT RECORD 2/3 discipline).
- Per-direction, never-pooled reporting for confusion-matrix reads (ENV-03).
- Descriptive-not-certifying output for judge-free slices: Slice A reports, it never passes or fails.
- `node --test <dir>` spuriously exits 1 on this host -- gate on the explicit `.test.mjs` FILE form.

### Integration Points
- ENV-02's fix makes the two existing captures admissible; every later reading depends on it.
- ENV-05's spike result gates ENV-06 and feeds ENV-07 regardless of outcome.
- Slice-A voter dispatch and the q2 captures draw on the SAME 5-hour session pool -- they must be paced
  against each other, not scheduled independently.

### Infrastructure Hazards
- `eval/.cache/` is **gitignored**: one `git clean -xdf` destroys the AVeriTeC cache and both q1
  captures. Do not run it without re-fetch/re-capture budget.
- **`.lz-research/` is ALSO gitignored (`.gitignore:20`) and holds the ONLY copy of the lz q1 evidence
  corpus** (15 excerpts / 14 claims / 60 votes / 12 sources). Same `git clean -xdf` hazard. A
  session-scratch backup was taken 2026-09-07 (111 files, 467 KB) but scratch is not durable --
  D-17's retention protocol is the real fix.
- **Claude session transcripts AGE OUT.** No June-2026 session survives under `~/.claude/projects`;
  the oldest in this repo's project directory is 2026-09-04. Subagent transcripts live at
  `~/.claude/projects/<cwd-hash>/<session-id>/subagents/` and DO retain fetched web content, but only
  until the session is cleaned up. Copy immediately after a capture (D-17).
- GSD SDK mutator verbs (`phase.*`, `state.*`, and even `query init.resume`) silently mutate
  `.planning/config.json` and `STATE.md`. Run `git diff .planning/config.json .planning/STATE.md` after
  any of them and revert unintended field changes before staging. Observed three times to date,
  including twice today.

</code_context>

<specifics>
## Specific Ideas

- The reframe that makes this phase possible: **the gold requirement was always downstream of the judge
  requirement.** Remove the judge and D-18's free-dataset-gold constraint stops binding, because nothing
  is left to anchor. A model-authored reference baseline is the field norm for deep-research evaluation
  (DeepResearch Bench RACE uses Gemini-2.5-pro Deep Research output as its reference; DeepConsult is
  reference-free pairwise win-rate against OpenAI Deep Research, order-flipped). The built-in
  `/deep-research` IS the reference.
- The one number to carry forward: at n=60 a judge whose TRUE MCC sits exactly at the 0.50 bar fails a
  point-estimate gate ~47% of the time, 95% interval [0.284, 0.728], and raising n does not reduce that
  rate. The realized 0.4889 and 0.4531 are two draws from that distribution -- evidence of neither
  adequacy nor inadequacy. Never read them as a finding about the judge.
- The ~3.6x cost headline (~$18 lz vs ~$66 built-in) is **retry-inflated, not merely n=1** -- the
  built-in q1 capture needed three resume cycles and an earlier attempt hit a billing limit. Report it
  as an operating observation with the retry history attached, never as a clean per-run comparison.
- Per-dimension reads are weaker than system-level ones: pairwise preference is held valid at system
  level, while metric-level assessment is said to require expert metric-wise annotation. ENV-06 must say
  so if it runs.

</specifics>

<deferred>
## Deferred Ideas

- **Reviving a calibrated judge gate** (and with it SEED-002/003/004) -- explicitly out of scope; the
  ROADMAP constraint forbids a third judge instrument in this phase.
- **Recovering the built-in q1 fetched content** -- CLOSED as unrecoverable, not deferred. The session
  aged out (D-17 evidence). Do not spend effort retrying this; the fix is retention on q2, not recovery
  of q1.
- **Semantic uncited-claim counting** -- ALCE/TRUE, RAGAS, and DeepResearch Bench's FACT all decompose
  claims with an LLM (FACT additionally needs a live Jina API key), so a semantic count cannot be both
  deterministic and judge-free. ENV-04's version must be a STRUCTURAL sentence-unit count under a frozen
  attribution rule, labelled citation **coverage**, never citation **support** -- conflating them repeats
  the construct error that voided Phases 19-22.
- **q3 / the full frozen n=3 campaign** -- considered and declined at discuss time on cost (~2.8 pool
  windows on the built-in side, multi-day paced). Recorded as a ratified scope choice under D-01/D-03,
  NOT as an agent-side reduction. A later phase may capture q3 under its own pre-registration.
- **The lz-deep-research workflow re-architecture** (script + `Workflow scriptPath`) -- deferred to a
  later milestone, per Phase 20 records.
- **Release/publication** (version bump / CHANGELOG / README / tag / GitHub Release) -- handled at
  `/gsd-complete-milestone` after `/gsd-audit-milestone`, never a build phase.

### Reviewed Todos (not folded)
- `2026-06-17-relocate-non-distributable-lz-deep-research-test-fixtures-fr` (packaging, score 0.6) --
  keyword-matched to the eval tree but it is packaging cleanup, not envelope work. Same disposition as
  Phase 22. Remains backlog.
- `research-rtk-command-suitability-for-skills-and-agents` (plugin-tooling, score 0.6) -- keyword-matched
  only; unrelated. Remains backlog.

</deferred>

---

*Phase: 23-judge-free-confidence-and-operating-envelope-for-lz-deep-res*
*Context gathered: 2026-09-06*
