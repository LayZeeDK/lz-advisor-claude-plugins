# Phase 23: Judge-free confidence and operating envelope for lz-deep-research - Research

**Researched:** 2026-09-06
**Domain:** Judge-free evaluation methodology -- deterministic citation auditing, descriptive
confusion-matrix reporting, and evaluation-limitation publication formats
**Confidence:** MIXED -- HIGH on the in-repo mechanical findings (all re-derived from disk this
session); MEDIUM on the external methodology prior art (primary sources fetched, verbatim quoted);
LOW on nothing that is presented as settled.

---

<user_constraints>
## User Constraints (from 23-CONTEXT.md)

### Locked Decisions

> Copied verbatim from `23-CONTEXT.md` `## Implementation Decisions`.

**Capture budget and the ENV-04 contamination route (MAINTAINER-RATIFIED)**

- **D-01:** Phase 23 budgets **ONE fresh capture pair (q2), on both systems**, gated behind the ENV-05
  spike. Slice-B **n=2**: the fresh q2 pair plus the existing q1 pair carried as a disclosed second
  data point. -- **Reversibility:** costly -- undoing means either discarding a paid built-in capture
  (~1.4 pool windows) or re-freezing the item set in a further phase's pre-registration; the frozen set
  is quoted in the ENV-01 commit, so a change after the freeze is an amendment, not an edit.
- **D-02:** ENV-04 therefore takes **route (a)**: the citation-audit bar is frozen on the FRESH q2
  pair, which no session has seen. The q1 pair is still audited, but its exploration-time contamination
  is disclosed and is NOT what the bar is set on. -- **Reversibility:** one-way -- the bar's credibility
  depends on being fixed before anyone reads q2; once read, route (a) is unavailable for that pair and
  only route (b) (disclosure) remains.
- **D-03:** This is an EXPLICIT freeze of a set smaller than Phase 22's frozen n=3, made in Phase 23's
  OWN pre-registration with its power implications stated up front, and ratified by the maintainer at
  discuss time. It is the deviation note's option 2, done properly. **A deferral is not a ratification;
  this one is a ratification and must be recorded as such in the ENV-01 pre-registration.**
- **D-04:** Phase 23 does NOT inherit `n=1` from the Phase-22 cache by default. The record must state
  that at n=2 no per-question generalisation is available -- a limit on the CLAIM, not merely on a
  confidence interval.

**ENV-05 spike clearing bar (MAINTAINER-RATIFIED)**

- **D-05:** The spike CLEARS iff a built-in `/deep-research` capture reaches a verification-complete
  report within a ceiling frozen BEFORE the spike runs: **at most 3 resume cycles across at most 2
  reset windows.** This is the two-window protocol empirically validated in Phase 22. -- **Reversibility:**
  one-way -- the ceiling must be frozen pre-spike or the spike becomes a post-hoc pass/fail choice, which
  is exactly what pre-registration exists to remove.
- **D-06:** ENV-05's literal "inside one 5-hour pool window" is NOT the operative criterion, and the
  pre-registration must say so and say why: the Phase-22 q1 capture needed three resume cycles across
  two windows, so a strict one-window bar fails by construction on evidence already in hand. Testing it
  would terminate ENV-06 on a reason already documented rather than newly learned. **This is a
  deliberate, ratified reading of ENV-05, recorded here so it is not mistaken for drift.**
- **D-07:** The realized ceiling is itself a publishable ENV-07 finding about the reference system's
  operating envelope, whether or not the spike clears.

**Slice A draw (MAINTAINER-RATIFIED)**

- **D-08:** Slice A freezes a **balanced draw of 40 items -- 20 unrefuted + 20 refuted.** Balance is
  load-bearing because ENV-03 requires the tally be reported PER CONFUSION-MATRIX DIRECTION and never
  pooled; an unbalanced draw leaves the smaller direction's row uninformative. -- **Reversibility:**
  costly -- the item list is quoted in the ENV-01 freeze and the voter spend is consumed on dispatch.
- **D-09:** The draw is sampled from the RE-VERIFIED pool (see D-10), not from the pre-registration's
  recorded 95/216. Selection must be deterministic and seeded, with the seed pre-registered.

**Stage-0 corrections, verified at zero spend during this discussion**

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
  `version` as a fallback. Fully verifiable offline against the two captures on disk. -- **Reversibility:**
  reversible.

**Auto-locked areas (`--auto`, outside the trap quadrant)**

- **D-12:** `[auto]` **Citation-audit evidence source** -- audit verbatim-quote match against the
  **stored excerpts already captured**, using live re-fetch ONLY for link/identifier resolvability.
  *Impact medium, confidence HIGH:* ENV-04 requires a DETERMINISTIC audit, and a script whose quote
  matching depends on the live network is not reproducible (link rot, paywalls, content drift between
  the 2026-06 capture and any later run). Resolvability is inherently a live check and is reported
  separately, with its check date recorded.
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

**Sequencing constraint (hard)**

- **D-16:** **No capture, vote, or score may run before the ENV-01 pre-registration is frozen and
  committed in its own timestamped commit.** The planner MUST sequence ENV-01 as its own wave, ahead of
  every spending task. ENV-02's `extractSystemInit` fix and the ENV-03 yield re-verification are
  zero-spend and may precede the freeze; both must be reflected IN the frozen pre-registration (the
  83/181 correction especially). -- **Reversibility:** one-way -- spend that lands before the freeze
  cannot be un-spent, and a pre-registration written after seeing results is not a pre-registration.

### Claude's Discretion

- Plan/wave decomposition of ENV-01..ENV-08, and which plans pair.
- The exact deterministic sampling seed and selection routine for D-08/D-09 (must be pre-registered,
  but the value is Claude's to pick).
- The q2 question text, within the ENV-05/D-05 bounded-capture constraint and Phase 22's Slice-B
  question-shape conventions -- a bounded single-facet question, matching the AMENDMENT RECORD 1
  narrowing that made captures feasible at all.
- The internal structure of `23-ENVELOPE.md`.

### Deferred Ideas (OUT OF SCOPE)

- **Reviving a calibrated judge gate** (and with it SEED-002/003/004) -- explicitly out of scope; the
  ROADMAP constraint forbids a third judge instrument in this phase.
- **q3 / the full frozen n=3 campaign** -- considered and declined at discuss time on cost (~2.8 pool
  windows on the built-in side, multi-day paced). Recorded as a ratified scope choice under D-01/D-03,
  NOT as an agent-side reduction. A later phase may capture q3 under its own pre-registration.
- **The lz-deep-research workflow re-architecture** (script + `Workflow scriptPath`) -- deferred to a
  later milestone, per Phase 20 records.
- **Release/publication** (version bump / CHANGELOG / README / tag / GitHub Release) -- handled at
  `/gsd-complete-milestone` after `/gsd-audit-milestone`, never a build phase.

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description (abbreviated from REQUIREMENTS.md) | Research Support |
|----|-----------------------------------------------|------------------|
| ENV-01 | Fresh timestamped pre-registration frozen in its OWN commit before any capture/vote/score; carries bars, scripts, item lists, ENV-04 contamination disclosure, termination clause, and the advance no-significance statement at n<=5. | Sections *Pre-registration content checklist* and *Pitfall 1*. The pre-registration must additionally freeze the **capture-artifact retention protocol** (new finding -- see *Capture-Artifact State Inventory*), the citation normalization rules (*Pattern 2*), and the Slice-A seed. |
| ENV-02 | Every report used in any reading carries a `validateManifest`-passing MANIFEST; `extractSystemInit` fixed so a version pins from a real `system/init`. | *Pattern 1* -- the exact one-field fix, with the real event's key list and values read from disk this session. `validateManifest`'s four required fields quoted verbatim. |
| ENV-03 | Slice A judge-free, per-direction, never pooled, descriptive-only, PROVISIONAL limits carried; yield re-verified at zero spend first. | *Pattern 3* (descriptive-not-certifying framing, with ICH E9 / STARD prior art) + the re-verified 83/181 yield + the existing `tallyPerDirection` shape, all read from disk. |
| ENV-04 | Deterministic citation audit: resolvability, verbatim-quote match, uncited-claim count, unique-source count, on a normalization frozen before any rate is computed. | *Pattern 2* (the normalization pipeline), *Pattern 4* (deterministic vs judged split), the measured q1 format inventory, and the **blocking evidence-corpus finding** in *Capture-Artifact State Inventory*. |
| ENV-05 | Capture-feasibility spike on a frozen question, gating ENV-06; itself publishable. | *Pattern 5* -- what "verification-complete" is detectable from, measured against the on-disk q1 built-in report. |
| ENV-06 | CONDITIONAL head-to-head grading: blinded, position-swapped, per-dimension, model-authored reference baseline; judge agreement reported, never a disqualifier. | *State of the Art* (DeepResearch Bench RACE reference-parity, DeepConsult order-flipping) + *Pitfall 5* (per-dimension reads are weaker than system-level). Existing `lz-eval-parity-judge.mjs` / `lz-eval-parity-verdict.mjs` are reusable. |
| ENV-07 | Publish the OPERATING ENVELOPE + explicit named statement of what was NOT established and why; resolve under exactly one of three terminations. | *Pattern 6* -- four verified prior-art formats (Model Facts label, Evaluation Cards, STARD items 26/27, model/system cards) with their exact section lists. |
| ENV-08 | Every eval SCRIPT code-reviewed + covered by code-reviewed unit tests; every PROMPT/REFERENCE content-reviewed before it drives an LLM task or ships; ZERO OOF spend; eval tree never ships. | *Project Constraints* + *Validation Architecture* (the review gates are the verification for the document-producing requirements). |

</phase_requirements>

---

## Project Constraints (from CLAUDE.md and PROJECT.md)

These bind the plan with the same authority as the locked decisions.

| Constraint | Source | Effect on this phase |
|---|---|---|
| **Review before use or publication** -- every eval SCRIPT gets code review + code-reviewed unit tests; every PROMPT / SKILL body / agent `.md` / `references/*.md` gets content review BEFORE it drives an LLM task OR ships. | `.planning/PROJECT.md` (Constraints + Key Decisions), extended 2026-06-22 | ENV-08 is a per-plan gate, not a phase-end sweep. Any new eval module and the ENV-01 pre-registration text both need their review recorded before the artifact drives anything. |
| **The eval tree never ships.** One-directional `eval/ -> runtime` import boundary. | `eval/lz-eval-packaging-boundary.test.mjs` | New Phase-23 modules live in `eval/`, may import from `plugins/lz-advisor/.../scripts/` by relative path, never the reverse. |
| **`node --test <dir>` spuriously exits 1 on this host.** | `23-CONTEXT.md` Established Patterns; MEMORY `node --test dir exits 1 quirk` | Every test gate must name explicit `.test.mjs` FILE paths, never a directory. |
| **ASCII in committed artifacts.** | user CLAUDE.md Shell rules | Normalization code and docs use `[OK]`/`->`/`|--` forms. Note the tension with Unicode-folding rules -- the *data* is Unicode, the *source* stays ASCII by using escapes (`’`), not literals. |
| **Never `git add .` / `-A` / `-u`.** Commit multi-line messages with `git commit -F <file>`. | user CLAUDE.md Git rules | The ENV-01 freeze commit is a named-files commit with a `-F` message. |
| **No AI attribution in commits.** | user CLAUDE.md | -- |
| **Banned words** (vacuous, wire/wiring, load-bearing, salient, tractable, crux, coda, carve-out, ladder/rung, locus, stratum, stratification). | user CLAUDE.md Prose style | Binds every word written into `23-ENVELOPE.md`, the pre-registration, plan files, and commit messages. Note: the *existing* Phase-22 sources quoted in this document use "load-bearing"; quoting them verbatim is fine, writing it fresh is not. |
| **GSD SDK mutator side effects.** After any `phase.*` / `state.*` / `query init.resume`, run `git diff .planning/config.json .planning/STATE.md` and revert unintended changes before staging. | `23-CONTEXT.md` Infrastructure Hazards; observed 3x | Add this as an explicit step in any plan task that calls an SDK mutator. |
| **`eval/.cache/` is gitignored.** One `git clean -xdf` destroys the AVeriTeC cache and both q1 captures. | `23-CONTEXT.md` | No plan task may run `git clean` with `-x`. |
| **ZERO out-of-family spend.** | ROADMAP constraint; MEMORY `Copilot WITHDRAWN` | Structurally unbreachable -- no OOF transport exists in any eval module and no OOF capability exists account-wide. |

---

## Summary

Phase 23 is a **documents-and-readings phase with three spending moments** (the Slice-A voter dispatch,
the fresh q2 pair, and the conditional head-to-head grading), all fenced behind one frozen
pre-registration. Nothing here changes shipped runtime behaviour. The research question is therefore not
"which library" but "which *metric definitions* and *reporting formats* survive contact with two systems
that cite in incompatible formats, at n=2, with no judge and no gold."

Three findings dominate the plan, and two of them are new to this session:

**1. ENV-04's evidence corpus does not exist on disk, for either system.** D-12 locks the citation audit
to "quote-match against the stored excerpts already captured." Verified this session: there is no
`excerpts/`, `claims/`, or `votes/` directory anywhere under `eval/.cache/p22-baseline/`
[VERIFIED: `find eval/.cache -maxdepth 5 -type d -name excerpts|claims|votes`, 2026-09-06 -- the only hit is
`eval/.cache/p20-live/votes`, a Phase-20 artifact]. Worse, the built-in's parent `stream.jsonl` carries no
fetched web content at all: across 740 events the only `tool_use` recorded is `{"Workflow":1}`, because
`/deep-research` runs inside a Workflow and its sub-agents' tool calls never appear in the parent stream
[VERIFIED: scripted scan of `eval/.cache/p22-baseline/builtin/qB1-run1.stream.jsonl`, 2026-09-06]. The
per-subagent JSONL that *would* hold them is not present under `~/.claude/projects/` for either capture's
`session_id` [VERIFIED: `find` over `~/.claude/projects` for `6e92b80e-...` and `8183574c-...` -- zero hits].
**Consequence: the verbatim-quote-match dimension of ENV-04 is not runnable on the q1 pair at all, and is
runnable on q2 only if the ENV-01 pre-registration freezes a capture-artifact retention protocol that
archives the lz run dir *including* `excerpts/` and the built-in session's subagent JSONL, before the q2
capture runs.** If that protocol is not frozen pre-capture, the dimension is lost permanently and ENV-04
terminates on branch (b) for its quote-match half -- a reason identifiable independently of any result,
which is exactly what branch (b) is for, but a needless one.

**2. "Uncited-claim count" cannot be both semantic and deterministic.** Every published implementation of
that metric decomposes the report into atomic claims with an LLM and then judges support with an LLM or an
NLI model -- ALCE via TRUE, RAGAS via claim decomposition + NLI, DeepResearch Bench's FACT via a Judge LLM
plus live web scraping through a Jina API key. A deterministic audit must redefine the unit *structurally*:
count sentence-level text units in the body sections that carry no citation marker under a frozen
attribution rule, and say plainly in the artifact that this measures **citation coverage, not factual
support**. That relabelling is honest and cheap; presenting a structural count as a support measure would
repeat the construct error that killed Phases 19-22.

**3. The reporting question has settled answers, and they are old.** For ENV-03's "descriptive, not a
certification," the accepted vocabulary is ICH E9's confirmatory/exploratory split -- exploratory analyses
"cannot be the basis of the formal proof of efficacy, although they may contribute to the total body of
relevant evidence." For ENV-07's envelope, four formats already carry the exact shape required: the
Model Facts label's *Uses and directions* / *Warnings* pair, STARD 2015 items 26 and 27, the Evaluation
Cards five-part framework, and model/system cards' intended-vs-out-of-scope-use split. Phase 23 should
adopt one of these section skeletons rather than invent a structure.

**Primary recommendation:** Sequence ENV-01 as a solo wave that freezes *four* things the current context
does not yet name -- the citation normalization rules, the structural definition of "uncited," the
Slice-A seed, and the **capture-artifact retention protocol** -- then run all zero-spend work (ENV-02 fix,
ENV-03 yield re-verify, ENV-04 offline extraction over q1) before any spend, and treat ENV-04's
quote-match dimension as conditional on ENV-05 in exactly the way ENV-06 already is.

---

## Architectural Responsibility Map

This phase has no application tiers. The equivalent question is *which artifact owns each capability*, and
the answer matters because a capability assigned to the wrong artifact is either un-reviewable (a rule
buried in a script instead of frozen in the pre-registration) or un-runnable (an evidence requirement
discovered after the capture that was supposed to produce it).

| Capability | Primary owner | Secondary owner | Rationale |
|------------|---------------|-----------------|-----------|
| Freezing bars, item lists, seeds, normalization rules, retention protocol, termination clause | `eval/lz-eval-p23-prereg.md` (new) | anti-drift `.test.mjs` asserting prose == constants | Anything a later reader could accuse of being chosen after seeing results must live in the timestamped freeze commit, not in code that can be edited silently. |
| Capture admissibility (CC version, model, cost pins) | `eval/lz-eval-baseline-manifest.mjs` (fixed) | the per-run `MANIFEST.json` files on disk | The module already fails closed on all four fields; only the field name is wrong. |
| Citation extraction + normalization (format-agnostic identifier set) | new `eval/lz-eval-p23-citation-audit.mjs` | the frozen rule text in the pre-registration | The *rules* are pre-registration content; the *implementation* is a reviewed script. Splitting them is what makes the "frozen before any rate is computed" claim checkable. |
| Link/identifier resolvability (live, dated, reported separately) | the same module, separate entry point + separate output file | -- | D-12 requires the live half be isolated so the offline half stays reproducible. A single mixed function makes the whole audit network-dependent. |
| Slice-A filter, collapse, per-direction tally | `eval/lz-eval-sliceA-gold.mjs` (existing, unchanged) | new thin driver for the seeded 40-item draw | The module is complete and frozen. ENV-03 composes it; a rebuild would re-open a settled artifact. |
| Deterministic seeded 40-item draw | new small module or a function added to the ENV-03 driver | seed value frozen in pre-registration | Determinism is the requirement; the RNG must not be `Math.random`. |
| Voter dispatch provenance (SEED-005) | the ENV-03 driver -- persist the exact dispatched string per item at dispatch time | -- | SEED-005 binds every dispatch, judge or not. |
| Capture-artifact retention (run dir + subagent JSONL archiving) | the q2 capture driver `.md` (a reviewed PROMPT under ENV-08) | pre-registration clause | This is a *protocol*, executed by a human-authorized session, so it lives in a driver document -- but its requirement must be frozen, because it cannot be added retroactively. |
| The published envelope + termination branch | `23-ENVELOPE.md` | `23-VERIFICATION.md` | D-15 fixes the artifact; the internal structure is Claude's discretion (see *Pattern 6*). |

---

## Standard Stack

### Core

**No new packages. Node.js standard library only.**

| Component | Version | Purpose | Why standard |
|-----------|---------|---------|--------------|
| Node.js built-ins (`node:fs`, `node:path`, `node:url`, `node:test`, `node:assert`) | the repo's existing runtime | Every new eval module and its co-test | Every existing module in `eval/` uses exactly this set [VERIFIED: import blocks of `eval/lz-eval-sliceA-gold.mjs:40-55` and `eval/lz-eval-baseline-manifest.mjs:31-41`] |
| `URL` (WHATWG, global) | built-in | URL parsing + host/path canonicalization for the citation normalizer | Already used ad hoc; it performs percent-encoding and host lowercasing per the URL Standard without a dependency |
| `String.prototype.normalize('NFC')` | built-in (ECMA-402/ES2015) | Unicode normalization for verbatim-quote matching | See *Pattern 2*; NFC is the W3C-recommended form |
| `node:crypto` `createHash('sha256')` | built-in | sha256 pins for anything the pre-registration claims "unchanged" | The established Phases 18-22 freeze discipline |

### Supporting

| Component | Purpose | When to use |
|-----------|---------|-------------|
| `ContractError` from `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs` | Fail-closed signal, imported across trees | Every new eval module -- matches the existing convention [VERIFIED: `eval/lz-eval-sliceA-gold.mjs:46`, `eval/lz-eval-baseline-manifest.mjs:37`] |
| `readJson` from `eval/lz-eval-readjson.mjs` | BOM-stripping fail-closed JSON read | Any on-disk JSON read in a new module |
| `mccFromPairs` from `eval/lz-eval-mcc.mjs` | tp/tn/fp/fn cell mapping | Already consumed by `tallyPerDirection`; do not call it directly from ENV-03 |

### Alternatives Considered

| Instead of | Could use | Tradeoff |
|------------|-----------|----------|
| Hand-rolled Markdown citation extraction with regex | A Markdown AST parser (e.g. a CommonMark implementation) | The published prior art uses an AST parser explicitly for reproducibility (see *Pattern 2*). **But** adding a package to `eval/` is permitted (the tree has its own `package.json` and never ships) and the reports here are ~130 lines each. Recommendation: **regex over a frozen, unit-tested rule set** -- the two report formats are known and small, and a zero-dependency extractor is easier to review under ENV-08 than a parser plus its transitive tree. If the extractor's co-test cannot discriminate the two formats cleanly, revisit. |
| A seeded PRNG package | A 30-line xorshift / mulberry32 implemented inline | Determinism is the only requirement and a seeded PRNG is a textbook function. Do not add a package for it. |
| Live-fetch quote matching (FACT-style) | Stored-excerpt matching | Locked by D-12, and independently supported: FACT's own pipeline requires a "Jina API key (for web scraping in FACT evaluation)" [CITED: github.com/Ayanami0730/deep_research_bench README], i.e. it is network-dependent by construction. |

**Installation:** none. `eval/package.json` is unchanged.

**Version verification:** not applicable -- no package is added, so there is nothing to verify against a
registry.

## Package Legitimacy Audit

**Not applicable.** This phase installs zero external packages in either tree. The runtime tree is
zero-dependency by constraint, and the `eval/` tree gains no new dependency under the recommendation
above. If planning later chooses a Markdown AST parser, that decision re-opens this section and the
Package Legitimacy Gate must be run before the plan is written.

**Packages removed due to [SLOP] verdict:** none.
**Packages flagged as suspicious [SUS]:** none.

---

## Capture-Artifact State Inventory

> Not a rename phase, but the same question applies and is decisive here: *after every file in the repo is
> correct, what evidence does the phase still need that is not on disk?* This section answers it
> explicitly. "Nothing found" is stated, never left blank.

| Category | What was checked | Found | Action required |
|----------|------------------|-------|-----------------|
| **Stored source excerpts (lz side)** | `find eval/.cache -maxdepth 5 -type d -name 'excerpts\|claims\|votes'` | **NONE for p22-baseline.** Only `eval/.cache/p20-live/votes` exists (a Phase-20 artifact, wrong run, wrong question). The lz q1 capture left only `qB1-run1.report.md`, `qB1-run1.stream.jsonl`, `qB1-run1.resume.stream.jsonl`, and two zero-byte `.err` files [VERIFIED: `ls -la eval/.cache/p22-baseline/lz/`, 2026-09-06] | ENV-01 must freeze a retention protocol that archives the lz run dir (incl. `excerpts/`) for q2. Quote-match on q1-lz: **NOT RUNNABLE**. |
| **Stored source excerpts (built-in side)** | Scripted scan of every `tool_use` / `tool_result` block in both built-in streams | **NONE.** `qB1-run1.stream.jsonl`: 740 events, tools `{"Workflow":1}`, 1 tool_result totalling 1,309 bytes. `qB1-run1.resume3.stream.jsonl`: 1,130 events, tools `{"Workflow":1,"Read":1}`, 2 tool_results totalling 69,582 bytes. No `WebFetch`/`WebSearch` results anywhere -- the Workflow's sub-agent tool calls do not surface in the parent stream [VERIFIED: scripted scan, 2026-09-06] | ENV-01 must freeze archiving of `~/.claude/projects/<cwd-hash>/<session>/subagents/agent-*.jsonl` at q2 capture time. Quote-match on q1-builtin: **NOT RUNNABLE**. |
| **Subagent session logs for the q1 captures** | `find ~/.claude/projects -maxdepth 3 -name '*<session_id>*'` for `6e92b80e-d807-43ea-89d1-e24bf40f3ab1` (built-in) and `8183574c-dce0-4cee-b59b-c6c05841ba34` (lz) | **ZERO hits for both.** The session directories are gone [VERIFIED: 2026-09-06] | Irrecoverable. Do not plan any task that assumes they can be found. |
| **MANIFEST files** | `ls eval/.cache/p22-baseline/{builtin,lz}/` | **ZERO.** Confirms the Phase-22 gap. Both q1 reports exist and are non-empty (builtin 15,063 bytes / 131 lines; lz 15,233 bytes / 124 lines) and both streams carry a parseable `system/init`, so MANIFESTs are **constructible offline at zero spend** once ENV-02's fix lands -- except `costUsd`, which `validateManifest` requires as a non-negative finite number and which is not in the `system/init` event | ENV-02 plan must state where `costUsd` for the q1 runs comes from (the `result` event's cost field, or a recorded figure) -- otherwise the MANIFEST cannot pass validation and the q1 pair stays inadmissible. **Verify this before planning ENV-02 as "zero-spend, offline, done."** |
| **AVeriTeC gold cache** | Ran `node eval/lz-eval-sliceA-gold.mjs eval/.cache/chenxwh__AVeriTeC/data/dev.json` | Present and readable. Output: `clean unrefuted=83 clean refuted=181 gate-cleared=true`, exit 0 [VERIFIED: 2026-09-06] | D-10 confirmed independently. Plan on 83/181. |
| **Phase-22 calibration verdicts** | `ls eval/.cache/p22-baseline/calibration*/` | Present (input/verdict JSON pairs). **Out of scope** -- no subgroup figure from them may authorize spend | None. Do not read them. |
| **Build artifacts / installed packages** | -- | Nothing name-dependent; no rename in this phase | None. |

---

## Architecture Patterns

### System Architecture Diagram

```
                      [ENV-01 FREEZE COMMIT]  <-- gate: nothing below the line runs before this
                              |
        +---------------------+----------------------+------------------------+
        | frozen: bars,       | frozen: citation     | frozen: Slice-A seed   |
        | termination clause, | normalization rules  | + 40-item balanced     |
        | n<=5 ceiling,       | + "uncited" unit def | draw (20/20 from       |
        | contamination       | + resolvability      | the 83/181 pool)       |
        | disclosure          |   check protocol     |                        |
        |                     | + CAPTURE-ARTIFACT   |                        |
        |                     |   RETENTION PROTOCOL |                        |
        +---------------------+----------------------+------------------------+
                              |
   ===========================|=========================== zero spend above / spend below
                              |
   [ZERO-SPEND STAGE 0]       |
     stream.jsonl ---> extractSystemInit (FIXED) ---> buildManifest ---> validateManifest
                                                            |
                                        report.md  ---------+---> ADMISSIBLE? --no--> excluded, recorded
                                                                       |yes
   [ENV-04 OFFLINE HALF]                                               v
     report.md --> extract citation tokens --> canonicalize --> identifier set
                     (numbered-ref | inline-URL | bare arXiv | bibliography entry)
                                    |
                                    +--> unique-source count  (per system, comparable)
                                    +--> uncited-unit count   (STRUCTURAL -- coverage, not support)
                                    +--> [quote-match]  <-- REQUIRES stored excerpts: q1 = UNRUNNABLE

   [ENV-04 LIVE HALF -- separate entry point, separate output, dated]
     identifier set --> HTTP HEAD/GET --> resolvable | dead | archived-only
                                              (report separately, never folded into the offline rates)

   [ENV-03]  83/181 pool --> seeded draw (20+20) --> filterSliceA (claim + claim_date only)
                 --> voter dispatch (SEED-005: persist dispatched string) --> verdicts
                 --> tallyPerDirection --> { unrefuted:{tp,fn}, refuted:{tn,fp} }  NEVER pooled

   [ENV-05 SPIKE]  one built-in /deep-research capture on the frozen q2 question
                 --> clears iff verification-complete within <=3 resumes / <=2 windows
                       |cleared                              |not cleared
                       v                                     v
   [ENV-06 conditional]  blinded + position-swapped     branch (b) for ENV-06,
     per-dimension grading over the pair                 realized ceiling still published (D-07)
                       |                                     |
                       +--------------+----------------------+
                                      v
                          [ENV-07]  23-ENVELOPE.md
                     evidenced region | human-routed region |
                     NOT-ESTABLISHED (named, with reasons)  |
                     termination branch (a) / (b) / (c)
```

### Recommended file layout

```
eval/
|-- lz-eval-p23-prereg.md              # ENV-01 freeze -- the authority for every rule below
|-- lz-eval-p23-prereg.test.mjs        # anti-drift: prose == constants, byte-for-byte
|-- lz-eval-p23-citation-audit.mjs     # ENV-04 offline: extract + canonicalize + count
|-- lz-eval-p23-citation-audit.test.mjs
|-- lz-eval-p23-resolvability.mjs      # ENV-04 live half -- SEPARATE module, dated output
|-- lz-eval-p23-resolvability.test.mjs
|-- lz-eval-p23-sliceA-draw.mjs        # ENV-03 seeded 20+20 draw over filterSliceA output
|-- lz-eval-p23-sliceA-draw.test.mjs
|-- lz-eval-p23-capture-driver.md      # q2 capture protocol INCL. artifact retention (PROMPT -> content review)
'-- lz-eval-baseline-manifest.mjs      # ENV-02: one-field fix at line 91
.planning/phases/23-.../
'-- 23-ENVELOPE.md                     # ENV-07 (D-15)
```

### Pattern 1: The ENV-02 `extractSystemInit` fix (one field, fully verified)

**What:** `extractSystemInit` reads `event.version`, which does not exist on a real `system/init` event.

**Verified evidence.** The real event's key list, read from disk this session:

```
["type","subtype","cwd","session_id","tools","mcp_servers","model","permissionMode",
 "slash_commands","apiKeySource","claude_code_version","output_style","agents","skills",
 "plugins","analytics_disabled","product_feedback_disabled","uuid","memory_paths",
 "fast_mode_state"]
claude_code_version= "2.1.186"
version= undefined
model= "claude-opus-4-8"
```
[VERIFIED: `eval/.cache/p22-baseline/builtin/qB1-run1.stream.jsonl`, first `system/init` event, scripted read 2026-09-06]

The current source, verbatim:

```js
      const ccVersion = typeof event.version === 'string' && event.version.length > 0 ? event.version : null;

      if (ccVersion == null) {
        throw new ContractError(
          'system/init event has no CC version -- the run cannot be pinned (D-15/D-16)',
          'extractSystemInit',
        );
      }
```
[VERIFIED: `eval/lz-eval-baseline-manifest.mjs:91-98`]

**Fix:** prefer `claude_code_version`, keep `version` as a fallback so any older fixture still parses:

```js
      const rawVersion =
        typeof event.claude_code_version === 'string' && event.claude_code_version.length > 0
          ? event.claude_code_version
          : typeof event.version === 'string' && event.version.length > 0
            ? event.version
            : null;
      const ccVersion = rawVersion;
```

**Discrimination proof (project convention, MEMORY `Prove test discrimination empirically`):** the co-test
must assert the FIXED code returns `"2.1.186"` from the real on-disk capture AND that reverting to
`event.version` alone throws. A synthetic fixture carrying only `version` proves nothing about the bug.

**Do not stop at the fix.** `validateManifest` requires four fields and each has a distinct failure:

```
  - a missing/empty model      -> 'model' in the message (the run is unpinned -- cannot be graded).
  - a missing/empty ccVersion  -> 'CC version' in the message (cannot be pinned).
  - a missing reportPath / a non-existent report file -> 'report' in the message.
  - a missing costUsd          -> 'cost' in the message (D-16 per-run cost).
```
[VERIFIED: `eval/lz-eval-baseline-manifest.mjs:149-156`, and enforced at :165-198 where `costUsd` must be
`typeof 'number' && Number.isFinite && >= 0`]

`costUsd` is not in `system/init`. **A plan task that says "build MANIFESTs for the two q1 captures,
zero-spend, offline" is incomplete until it names the cost source.** Candidate: the terminal `result`
event in the stream. This was not verified this session -- see the Assumptions Log.

### Pattern 2: Frozen citation-format normalization (ENV-04 / D-13)

**What the two formats actually are.** Measured programmatically this session, not read as prose:

| Signal | built-in q1 | lz q1 |
|---|---|---|
| bytes / lines | 15,063 / 131 | 15,233 / 124 |
| inline URLs (total / unique) | **0 / 0** | **32 / 12** |
| URL hosts | -- | `arxiv.org`, `www.trychroma.com`, `github.com` |
| numbered ref markers `[n]` (total / unique) | **69 / 13** | 0 / 0 |
| bare `NNNN.NNNNN` arXiv-shaped tokens | 16 | 28 |
| `arXiv:` labelled ids | 0 | 0 |
| DOIs | 0 | 0 |
| Markdown links `](http` | 0 | 0 |
| ASCII `"` chars | 94 | 14 |
| smart quotes / ellipsis char / NBSP | 0 / 0 / 0 | 0 / 0 / 0 |
| en/em dashes | 31 | 0 |

[VERIFIED: scripted regex inventory over both `qB1-run1.report.md` files, 2026-09-06]

**This corrects the diagnosis note.** `.planning/notes/phase-22-diagnosis-two-root-causes.md` records
"26 numbered ref markers, 10-item source list" for the built-in. The measured figures are **69 markers,
13 unique**, over a 10+ item source list. Same pattern as D-10: **record the discrepancy in the ENV-01
pre-registration rather than silently reconciling it.** The note's figures came from reading the head and
both tails only; the full-file count is larger. This does not change any conclusion (the format asymmetry
holds and is if anything starker), but the frozen document must not restate a number that a re-run
contradicts.

**Source-list shapes (structural, both formats resolve to arXiv IDs):**

```
built-in:  - [1] YaRN: Efficient Context Window Extension of Large Language Models - arXiv 2309.00071
           - [4] EleutherAI engineering blog, "YaRN" - blog.eleuther.ai/yarn
lz:        2. Extending Context Window of Large Language Models via Positional Interpolation (https://arxiv.org/abs/2306.15595)
           7. Context Rot: How Increasing Input Tokens Impacts LLM Performance (https://www.trychroma.com/research/context-rot)
```
[VERIFIED: `eval/.cache/p22-baseline/builtin/qB1-run1.report.md` lines 116-119 and
`eval/.cache/p22-baseline/lz/qB1-run1.report.md` lines 109-114, read 2026-09-06]

`2306.15595` appears in BOTH reports under different surface forms. That is the proof the canonicalization
below actually unifies them, not just a hope that it will.

**The frozen normalization rules -- freeze these words, not a paraphrase:**

*(A) Citation-token extraction.* Handle exactly the forms the prior art handles. The published
Markdown-report citation parser states it handles "numbered references ([1], [2]), footnote-style
references ([^note]), inline Markdown links ([text](url)), autolinks (<url>), and ranges ([1-3])"
and that it "normalizes line endings and whitespace" with "Code block removal strips fenced code sections
to prevent false citation matches", then "Registry building creates a deduplicated citation list with
normalized URLs" [CITED: arXiv 2605.06635 §3.2 "Markdown AST Parser"]. Add two forms these reports need
and that list omits: **bare `arXiv NNNN.NNNNN` in prose** and **scheme-less `host/path` strings** (the
built-in's `blog.eleuther.ai/yarn`).

*(B) Identifier canonicalization, in this order.* Each rule is stated so a reviewer can check it:

1. **arXiv.** Canonical form is `arXiv:YYMM.NNNNN` -- "The canonical form of identifiers from January
   2015 (1501) is arXiv:YYMM.NNNNN, with 5-digits for the sequence number within the month", with
   "arXiv:YYMM.numbervV" for specific versions [CITED: info.arxiv.org/help/arxiv_identifier.html]. So:
   strip any `arxiv.org/(abs|pdf|html)/` prefix, strip a trailing `vN`, strip a trailing `.pdf`,
   lowercase the scheme prefix to `arxiv:`. `https://arxiv.org/abs/2306.15595`, `arXiv 2306.15595`, and
   `arxiv:2306.15595v2` all collapse to `arxiv:2306.15595`. **This single rule is what makes the two
   systems comparable at all** -- 16 of the built-in's tokens and 28 of lz's are arXiv-shaped.
2. **DOI.** Reduce `https://doi.org/10.x/y`, `http://dx.doi.org/10.x/y`, and bare `10.x/y` to `doi:10.x/y`,
   lowercased. (Zero DOIs in the q1 pair, but q2 may differ.) See the Assumptions Log on DOI case rules.
3. **Bare URL.** Lowercase scheme and host; drop a `www.` prefix; drop the fragment; drop a trailing
   slash; drop tracking query parameters by a **frozen allowlist-inversion** (keep only parameters
   named in a frozen keep-list -- do not maintain a blocklist of tracker names). Add `https://` to a
   scheme-less `host/path` token before parsing.
4. **Case and Unicode.** Apply `NFC` to every extracted string before comparison. NFC is the
   W3C-recommended form: the W3C specifications "recommend using Normalization Form C for all content,
   because this form avoids potential interoperability problems arising from the use of canonically
   equivalent, yet different, character sequences in document formats on the Web" [CITED: unicode.org
   UAX #15]. **Do not use NFKC** -- "Normalization Forms KC and KD must _not_ be blindly applied to
   arbitrary text. Because they erase many formatting distinctions, they will prevent round-trip
   conversion to and from many legacy character sets, and unless supplanted by formatting markup, they
   may remove distinctions that are important to the semantics of the text." [CITED: same].
5. **Fallback.** A token matching none of the above canonicalizes to itself under (4) and is counted in a
   named `unmatched` bucket that is **reported**, never silently dropped. A silent drop is how a
   format-sensitive metric hides.

*(C) Unique-source count* = cardinality of the canonical identifier set per report. On the measured q1
pair, the built-in's `[n]` markers must be resolved through the bibliography to identifiers before
counting; counting markers (69) against lz's URLs (32) is precisely the anti-pattern.

*(D) Verbatim-quote match.* A quote matches iff, after: NFC; collapse of all runs of whitespace
(including ` `) to a single space; fold of `‘’` to `'` and `“”` to `"`; fold of
`–—` to `-`; fold of `…` to `...`; trim -- the normalized quote is a substring of the
normalized stored excerpt. **Case-sensitive** (a case-folding rule would let a paraphrase pass more
easily and buys nothing here; the measured q1 pair contains zero smart quotes and zero non-breaking
spaces, so these folds are insurance for q2, not fixes for q1). A truncation marker (`...`, `[...]`) in
the quote splits it into segments, each of which must match in order.

*(E) Uncited-unit count -- STRUCTURAL, and say so.* Freeze the unit as a sentence-level text unit inside
the report's body sections (excluding headings, tables, code fences, and the bibliography section), split
on `[.?!]` followed by whitespace-plus-uppercase. A unit is CITED if it contains a citation token, or if
a citation token appears at the end of its containing paragraph -- adopting the published attribution
rule: "When a citation appears at the end of a passage, it applies to all preceding uncited sentences in
that passage." [CITED: arXiv 2605.06635 §3.2]. The artifact MUST state that this measures **citation
coverage, not factual support** (see *Pitfall 2*).

### Pattern 3: Reporting a per-direction confusion matrix descriptively (ENV-03)

**What already exists.** `tallyPerDirection` returns exactly:

```js
  return {
    unrefuted: { tp, fn },
    refuted: { tn, fp },
  };
```
[VERIFIED: `eval/lz-eval-sliceA-gold.mjs:259-262`], and the module's own header records that "It emits NO
pooled accuracy / rate, NO Clopper-Pearson, NO confidence interval, NO pass/fail cert -- it is DESCRIPTIVE
only." [VERIFIED: `eval/lz-eval-sliceA-gold.mjs:22-25`]. ENV-03 composes this; it does not rebuild it.

**The framing question, answered.** The accepted vocabulary for "a real reading that is nonetheless not a
performance claim" is the **confirmatory / exploratory** distinction, and its canonical statement is
already regulatory text:

> "Their analysis may entail data exploration; tests of hypothesis may be carried out, but the choice of
> hypothesis may be data dependent. Such trials cannot be the basis of the formal proof of efficacy,
> although they may contribute to the total body of relevant evidence."
> -- [CITED: ICH E9, *Statistical Principles for Clinical Trials*, §II.B Scope of Trials]

and, on keeping the two roles apart inside one study:

> "The protocol should make a clear distinction between the aspects of a trial which will be used for
> confirmatory proof and the aspects which will provide data for exploratory analysis."
> -- [CITED: same]

That second sentence is the design rule for ENV-01: the pre-registration must name, in advance, which
Phase-23 readings are exploratory. Under the no-judge constraint, **all of them are.** Saying so in the
freeze commit is stronger than disclaiming it afterwards.

**Prior art for the reporting layout itself** -- a diagnostic-accuracy study is structurally identical to
Slice A (a binary index test against a reference standard), and its reporting standard is explicit:

| STARD 2015 item | Exact text | ENV-03 use |
|---|---|---|
| 17 | "Any analyses of variability in diagnostic accuracy, distinguishing pre-specified from exploratory" | Freeze the draw and the tally as pre-specified; anything noticed afterwards is labelled exploratory |
| 23 | "Cross tabulation of the index test results (or their distribution) by the results of the reference standard" | **This is the per-direction tally.** Publish the 2x2 cross-tabulation itself, not a derived rate |
| 24 | "Estimates of diagnostic accuracy and their precision (such as 95% confidence intervals)" | **Deliberately declined** -- ENV-03 emits no CI by design. Record the decline and the reason (D-04: a limit on the claim, not on an interval) |
| 26 | "Study limitations, including sources of potential bias, statistical uncertainty, and generalisability" | The three PROVISIONAL limits go here |
| 27 | "Implications for practice, including the intended use and clinical role of the index test" | Feeds ENV-07's evidenced-vs-human-routed split |

[CITED: STARD 2015 checklist, Table 1, via PMC4623764]

**Recommended sentence for the artifact** (adapt, do not paraphrase away the force):

> This is a cross-tabulation of the verify-voter's verdicts against a 2020-labelled reference standard,
> reported per direction and never pooled. It is an exploratory diagnostic read, not a performance
> claim: no threshold was set in advance for it to pass, none is applied afterwards, and it cannot be
> the basis of a claim about lz-deep-research's accuracy on general research questions. Its three
> named limits -- uniform 2020 `claim_date`, ~34% US-2020 politics / ~21% COVID topical narrowness, and
> the evidence-set mismatch between 2020-labelled gold and a live-2026-web voter -- scope what the
> numbers can mean.

The three limits are quoted from the module's own frozen `PROVISIONAL_LIMITS` and the requirement text
[VERIFIED: `eval/lz-eval-sliceA-gold.mjs:70-75` -- "uniform 2020 claim_date (out-of-cutoff for a 2026
voter; the voter judges the claim as-of 2020)" and "topical narrowness (the AVeriTeC dev set is ~34%
US-2020-politics, ~21% COVID -- NOT a representative cross-section of general research questions; Slice A
speaks to fact-check-style claims, not Slice B natural breadth)"].

**The 40-item draw operates on `{ claim, claim_date }` only** -- `filterSliceA` emits
`const voterRecord = { claim: item.claim, claim_date: item.claim_date };`
[VERIFIED: `eval/lz-eval-sliceA-gold.mjs:201`], so the seeded draw must sample the *output* of
`filterSliceA`, never the raw rows, or the leak control is bypassed.

### Pattern 4: Split deterministic from judged, and never blend the outputs

The published deep-research citation frameworks all split the same way: **URL reachability is
rule-based; topical relevance and factual support are LLM-judged.**

- Link Works "produces a binary score of 1 if the URL returns accessible content and 0 if the request
  fails due to HTTP errors (404, 403), timeouts, or blocked access." Relevant Content and Fact Check both
  use "LLM-as-a-judge", the latter "calibrated through manual review of 50-100 LLM judgments."
  [CITED: arXiv 2605.06635 §3.3.1-3.3.3]
- The same paper's limitation section concedes "URLs that were accessible during evaluation may become
  unavailable." [CITED: arXiv 2605.06635 §5]
- A useful, drift-proof definition of resolvability from a second paper: "A hallucinated URL is a
  non-resolving URL for which no archived snapshot exists in the Wayback Machine at any point in time."
  [CITED: arXiv 2604.03173] -- worth adopting, because it separates *never existed* from *died since*,
  which is the distinction ENV-04's resolvability column actually wants.

Phase 23 keeps the rule-based half and **replaces the judged half with string matching**, which is why
the artifact must relabel what it measures. The direction is endorsed by the project's own reference
source and by current benchmark practice:

> "We recommend choosing deterministic graders where possible, LLM graders where necessary or for
> additional flexibility, and using human graders judiciously for additional validation."
> -- [CITED: anthropic.com/engineering/demystifying-evals-for-ai-agents]

> "ALE deliberately avoids LLM-as-judge wherever a deterministic alternative exists; a task workflow
> whose only proposed scoring path is 'ask a model whether the result looks correct' is rejected at QC
> and re-engineered to expose a checkable artifact."
> -- [CITED: arXiv 2606.05405 §3.3 "Evaluation Modes"]

The same source confines judging narrowly: "the minority of task workflows that genuinely require an LLM
judge (video clip, game screenshot, rendered scene, etc) are scored not by general-purpose holistic
prompts but by narrow, evidence-anchored yes/no probes." [CITED: same]. If ENV-06 runs, that is the shape
its per-dimension probes should take -- narrow, evidence-anchored, yes/no -- not a holistic rubric score.

### Pattern 5: What "verification-complete" means for the ENV-05 spike

D-05 clears the spike on reaching "a verification-complete report." That phrase needs a frozen,
mechanically checkable definition or the spike becomes a judgement call at exactly the moment the
pre-registration exists to prevent one.

The on-disk q1 built-in report supplies one. Its headings are:

```
   5: # Techniques LLMs Use to Extend Context Windows Beyond 100K Tokens
   6: ### Fully verified, cited research report
  14: ## Direct answer
  ...
  80: ## Complete verification ledger (25/25 confirmed)
 114: ## Sources (all carry verified claims)
```
[VERIFIED: heading scan of `eval/.cache/p22-baseline/builtin/qB1-run1.report.md`, 2026-09-06]

and the ledger is a parseable table:

```
| # | Claim (abbreviated) | Source | Vote |
|---|---|---|---|
| C1 | YaRN extends RoPE context; RoPE fails past trained length | [1] | 3-0 |
```
[VERIFIED: same file, lines 82-84]

Note also the sibling file `qB1-run1.report.partial-verify.md` on disk -- an artifact of an *incomplete*
run, which is the negative example the definition must exclude.

**Recommended frozen definition:** a built-in capture is verification-complete iff its `report.md`
contains a verification-ledger section whose header states an `N/N` count with both numbers equal, and
that section's table has N data rows. This is checkable by a five-line script and discriminates against
the `partial-verify` artifact already on disk. **Freeze it in ENV-01 with the caveat that it is derived
from a single observed report and the built-in's output format is not contractual** -- if q2's format
differs, that is itself an ENV-07 finding about the reference system, and the spike falls to a documented
manual read recorded as a deviation, not a silent re-definition.

### Pattern 6: The operating-envelope document (ENV-07)

Four verified formats carry the exact structure ENV-07 needs. Pick one skeleton; do not invent a sixth.

**(i) Model Facts label** -- one page, aimed at the person deciding whether to rely on the output. Seven
sections: *Model name, locale, and version*; *Summary of the model*; *Mechanism of risk score
calculation*; *Validation and performance*; *Uses and directions*; *Warnings*; *Other information*
[CITED: Sendak et al., npj Digital Medicine 3:41 (2020), via PMC7090057]. The design intent is stated as
ensuring users know "how, when, how not, and when not to incorporate model output into clinical
decisions" -- which is ENV-07's evidenced-region / human-routed-region split almost word for word.
**This is the recommended skeleton**: it is the shortest, it is explicitly one page, and its
*Warnings* section is the natural home for the not-established statement.

**(ii) STARD 2015 items 26 + 27** -- "Study limitations, including sources of potential bias, statistical
uncertainty, and generalisability" and "Implications for practice, including the intended use and
clinical role of the index test" [CITED: STARD 2015 Table 1, via PMC4623764]. Use these as the required
*content* of the Warnings and Uses sections.

**(iii) Evaluation Cards** -- the five-part reporting framework, verbatim from Table 2:
*Design*: "Goals, tested constructs & context; development and design preregistration; validity; task
types & item development; human subjects / ethics." *Before execution*: "Protocol & pre-run; scoring &
validation; splits & holdouts; pilot & baselines; contamination, gaming & awareness; pre-reporting."
*Execution*: "Run logging & reproducibility capture; mitigations & adaptations; analysis & run
differences." *Lifecycle*: "Data availability & access; later use & maintenance." *Reporting &
publication*: "Reporting & publication; process reporting; transparency; replication & reproducibility."
[CITED: arXiv 2606.09809, Table 2]. Note the near-exact overlap with what Phase 23 already does --
pre-registration, contamination disclosure, run logging, reproducibility. Use this as a **completeness
checklist against the pre-registration**, not as the envelope's own layout.

**(iv) Model cards / system cards** -- the intended-use vs out-of-scope-use split. See the Assumptions
Log; the nine-section list was not confirmed from a primary source this session.

**What makes such a document useful rather than boilerplate**, from the pattern across all four:

1. It names the *decision* the reader is about to make, not the artifact's properties. ("Should I act on
   this report without re-checking it?" -- not "here are our metrics.")
2. Its limitations are **specific and falsifiable** ("2020-labelled gold, ~34% US politics") rather than
   generic ("results may not generalize").
3. It distinguishes *measured and negative* from *not measured*. Phase 23's three-branch termination is
   already this distinction; the envelope just has to keep them in separate sections and never let a
   branch-(b) item read as a branch-(a) failure.
4. It is one page. Every source above says so explicitly or by example.

**Recommended `23-ENVELOPE.md` skeleton** (Claude's discretion per D-15, this is the recommendation):

```
# lz-deep-research -- Operating Envelope (Phase 23)
Version / date / resolved model / CC version / the exact artifacts this rests on

## What this covers
one paragraph: the skill, the question shapes, the n

## Where the output is evidenced
the readings that ran, each with its reading and its named limits

## Where the output is routed to a human
the concrete conditions under which a reader must re-check; drawn from the skill's own
Contested/Unsupported design and from what the readings did NOT cover

## Warnings
the PROVISIONAL limits; the n<=5 no-significance ceiling stated in advance; the
retry-inflated cost observation with its retry history attached

## NOT ESTABLISHED, and why
one row per named method, with its termination branch and the reason -- the reason
identifiable independently of any result

## Termination
exactly one of (a) MEASURED / (b) NOT-ESTABLISHABLE-BY-METHOD / (c) NOT-ATTEMPTED-BY-BUDGET,
with the evidence

## Not a ship gate
D-03 carries: Sonnet-default ships regardless
```

### Anti-Patterns to Avoid

- **Counting citation markers across systems.** 69 built-in markers vs 32 lz URLs is not a comparison;
  it is a format artifact. Always resolve to the canonical identifier set first.
- **Blending the resolvability check into the offline rates.** One mixed function makes the whole audit
  network-dependent and the artifact irreproducible. Separate module, separate output file, check date
  recorded (D-12).
- **A "verification-complete" judgement made after seeing the q2 report.** Freeze the mechanical
  definition in ENV-01 (Pattern 5).
- **Calling the structural uncited-unit count a factual-support measure.** See *Pitfall 2*.
- **Re-deriving a pooled rate from the per-direction cells "for readability."** The cells are the output.
- **Writing the envelope's limitations generically.** Generic limitations are the boilerplate failure
  mode all four prior-art formats were designed against.

---

## Don't Hand-Roll

| Problem | Don't build | Use instead | Why |
|---------|-------------|-------------|-----|
| Per-direction confusion-matrix tally | A new tally function | `tallyPerDirection` in `eval/lz-eval-sliceA-gold.mjs` | Complete, frozen, co-tested, and its no-pooling guarantee is documented in the module header [VERIFIED: :22-25, :252-263] |
| AVeriTeC label collapse + leak stripping | A new filter | `collapseAvtLabel` + `filterSliceA` | The collapse map and the leak-strip are the settled, benchmark-standard treatment; re-deriving them re-opens SEED-003's refuted direction |
| Feasibility gate | A new threshold check | `sliceAFeasibilityGate` with the frozen `SLICE_A_GATE = { N_SUP_MIN: 8, N_REF_MIN: 8 }` [VERIFIED: :64-67] | Pre-registered floor; recomputing it from the corpus is exactly what a pre-registered floor exists to prevent |
| MANIFEST build + validation | A new admissibility check | `buildManifest` / `validateManifest` | Four distinct fail-closed errors already specified [VERIFIED: :149-201] |
| Blinding / position-swap / two-layer verdict (if ENV-06 runs) | New grading machinery | `eval/lz-eval-parity-judge.mjs` + `eval/lz-eval-parity-verdict.mjs` | Already built and co-tested in Phase 22 |
| Fail-closed error signalling | A new error class | `ContractError` imported across trees | Every existing eval module does this |
| Seeded PRNG | A package | ~15 lines of mulberry32/xorshift, unit-tested with a fixed expected sequence | Determinism is the whole requirement; a dependency adds a supply-chain surface for a textbook function |
| Claim decomposition for "uncited claims" | An LLM claim extractor | A frozen structural sentence-unit rule | The LLM route is definitionally non-deterministic and would reintroduce a judge (see *Pitfall 2*) |

**Key insight:** almost every mechanism this phase needs already exists in `eval/` and is frozen. The
genuinely net-new code is small -- a citation extractor/canonicalizer, a resolvability checker, a seeded
draw, and the fixed field name. Everything else is composition and documents. Plan accordingly; a plan
that proposes rebuilding Slice-A machinery has misread the tree.

---

## Common Pitfalls

### Pitfall 1: Freezing the pre-registration without the retention protocol

**What goes wrong:** ENV-01 freezes bars, seeds, and normalization -- but not *what artifacts the q2
capture must keep*. The q2 capture then runs, produces two reports, and ENV-04's quote-match dimension is
discovered to be un-runnable for the second time.
**Why it happens:** the retention requirement is invisible from the requirement text. ENV-04 says
"verbatim-quote match against the fetched source"; D-12 says "stored excerpts already captured"; both
read as though such a store exists. It does not (see *Capture-Artifact State Inventory*).
**How to avoid:** the ENV-01 pre-registration must freeze, in the same commit: archive the entire lz run
dir (`claims/`, `excerpts/`, `votes/`, `survivors.json`, `run_state.json`) into
`eval/.cache/p23-baseline/lz/q2/`; and archive
`~/.claude/projects/<cwd-hash>/<session-id>/subagents/agent-*.jsonl` for the built-in session into
`eval/.cache/p23-baseline/builtin/q2/subagents/` immediately after the capture, before the session
directory can be reclaimed.
**Warning signs:** any plan task for the q2 capture whose action list ends at "save report.md and
stream.jsonl."

### Pitfall 2: An "uncited-claim count" that is really a support claim

**What goes wrong:** ENV-04 asks for a deterministic audit *and* an "uncited-claim count." Every
published implementation of the latter is LLM-driven. Producing a structural count and reporting it
under a semantic label is a construct error of the same family that voided Phases 19-22.
**Why it happens:** the requirement's own wording invites it, and the number looks like a support rate.
**How to avoid:** freeze the structural definition (Pattern 2E), and label the output column
`uncited_units` with an inline note that it measures citation coverage. State in the artifact that a
factual-support measure was **not** computed and why (no judge, by constraint) -- this is a clean
branch-(b) item for ENV-07's not-established table, not a gap.
**Warning signs:** the artifact's prose says "supported" or "grounded" anywhere near this number.

### Pitfall 3: Treating the q1 pair as a second data point of equal standing

**What goes wrong:** D-01 admits q1 as "a disclosed second data point," which is easily read as n=2 of
comparable quality. It is not: q1 has no MANIFEST until ENV-02 rebuilds one, it has no stored evidence
corpus at all, its built-in capture cost is retry-inflated across three resume cycles and an earlier
billing-limit failure, and the designing session has partial sight of it (D-02).
**How to avoid:** carry all four disclosures wherever a q1 figure appears. Report q1 and q2 as separate
rows, never averaged. D-04's rule -- "at n=2 no per-question generalisation is available" -- is a limit
on the claim.
**Warning signs:** any mean, any "across both questions," any single combined rate.

### Pitfall 4: The cost headline read as a clean comparison

**What goes wrong:** the ~3.6x figure (~$18 lz vs ~$66 built-in) is retry-inflated. The built-in q1
capture needed three resume cycles -- `qB1-run1.resume.stream.jsonl`, `.resume2.`, `.resume3.` are all on
disk [VERIFIED: `ls eval/.cache/p22-baseline/builtin/`, 2026-09-06] -- and an earlier attempt hit a
billing limit.
**How to avoid:** report it as an operating observation with the retry history attached. It belongs in
ENV-07's Warnings, not in any comparative table.

### Pitfall 5: A per-dimension ENV-06 read presented as strong

**What goes wrong:** per-dimension LOSS counting is metric-level assessment; pairwise preference is held
valid at system level, while metric-level assessment is said to require expert metric-wise annotation
(arXiv 2603.06942, per the diagnosis note). ENV-06 must say so if it runs.
**How to avoid:** report the system-level pairwise outcome as the primary read and the per-dimension
breakdown as explicitly weaker, in the same table.

### Pitfall 6: SDK mutators quietly rewriting `.planning/`

**What goes wrong:** `phase.*` / `state.*` / even `query init.resume` mutate `.planning/config.json` and
`STATE.md` as a side effect. Observed three times, twice in one day.
**How to avoid:** every plan task that calls one must be followed by
`git diff .planning/config.json .planning/STATE.md` with unintended changes reverted **before** staging.
Prefer controlled `Edit` calls over mutator verbs.

### Pitfall 7: `node --test <dir>` false failure

**What goes wrong:** on this host `node --test <dir>` exits 1 even when every test passes, so a
directory-form gate reports a phantom failure and burns a debugging cycle.
**How to avoid:** every test command in every plan names explicit `.test.mjs` file paths.

---

## Code Examples

### Canonicalizing a citation token (the format-agnostic identifier)

```js
// Frozen rules -- the pre-registration is the authority; this implements it.
// ASCII source per CLAUDE.md: Unicode literals are written as escapes.

const ARXIV_RE = /(?:arxiv[:\s]*|arxiv\.org\/(?:abs|pdf|html)\/)?(\d{4}\.\d{4,5})(v\d+)?(?:\.pdf)?/i;
const DOI_RE = /\b(10\.\d{4,9}\/[^\s"<>)\]]+)/i;
const KEEP_PARAMS = Object.freeze(['id', 'v', 'page']); // allowlist-inversion, frozen

export function canonicalizeCitation(rawToken) {
  const t = String(rawToken).normalize('NFC').trim();

  const arxiv = t.match(ARXIV_RE);

  if (arxiv) {
    return 'arxiv:' + arxiv[1];
  }

  const doi = t.match(DOI_RE);

  if (doi) {
    return 'doi:' + doi[1].toLowerCase().replace(/[.,;)\]]+$/, '');
  }

  // Scheme-less host/path (the built-in emits e.g. blog.eleuther.ai/yarn).
  const withScheme = /^https?:\/\//i.test(t) ? t : 'https://' + t;

  let u;

  try {
    u = new URL(withScheme);
  } catch {
    return 'raw:' + t.toLowerCase(); // reported in the `unmatched` bucket, never dropped
  }

  const host = u.hostname.toLowerCase().replace(/^www\./, '');
  const params = [...u.searchParams.entries()]
    .filter(([k]) => KEEP_PARAMS.includes(k))
    .map(([k, v]) => k + '=' + v)
    .sort()
    .join('&');
  const pathname = u.pathname.replace(/\/+$/, '');

  return 'url:' + host + pathname + (params ? '?' + params : '');
}
```

**Discrimination check this must pass** (the two surface forms of the same paper, both verified present
in the q1 pair):

```js
assert.equal(canonicalizeCitation('arXiv 2306.15595'), 'arxiv:2306.15595');
assert.equal(canonicalizeCitation('https://arxiv.org/abs/2306.15595'), 'arxiv:2306.15595');
assert.equal(canonicalizeCitation('arxiv:2306.15595v2'), 'arxiv:2306.15595');
assert.equal(canonicalizeCitation('blog.eleuther.ai/yarn'), 'url:blog.eleuther.ai/yarn');
```

### Verbatim-quote normalization (Pattern 2D)

```js
export function normalizeForQuoteMatch(s) {
  return String(s)
    .normalize('NFC')                      // NEVER NFKC -- UAX #15 warns against blind application
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/[\s ]+/g, ' ')
    .trim();
}
```

### Reading `system/init` from a real capture (the ENV-02 fix, verified shape)

```js
// The real event exposes claude_code_version, NOT version.
// Verified against eval/.cache/p22-baseline/builtin/qB1-run1.stream.jsonl on 2026-09-06:
//   claude_code_version = "2.1.186", version = undefined, model = "claude-opus-4-8"
const rawVersion =
  (typeof event.claude_code_version === 'string' && event.claude_code_version.length > 0
    ? event.claude_code_version
    : null) ??
  (typeof event.version === 'string' && event.version.length > 0 ? event.version : null);
```

---

## State of the Art

| Old approach | Current approach | Impact on this phase |
|---|---|---|
| Citation quality judged by a fine-tuned NLI model (ALCE via TRUE-T5-11B) | LLM-as-judge over statement-URL pairs (DeepResearch Bench FACT; "Cited but Not Verified" three-dimension framework) | Both are judged. Phase 23 keeps only the rule-based dimension and relabels the rest -- a deliberate, disclosed narrowing |
| Live-fetch verification of every cited page | Increasingly recognized as irreproducible over time -- the same framework concedes "URLs that were accessible during evaluation may become unavailable" [CITED: arXiv 2605.06635 §5] | Vindicates D-12: offline quote-match, live resolvability reported separately with its date |
| Human-authored gold reference reports | Model-authored reference baselines are the field norm -- DeepResearch Bench RACE scores "relative to expert reference reports, where 0.5 indicates reference parity"; DeepConsult is reference-free pairwise win-rate, order-flipped | The built-in `/deep-research` as reference is standard practice, not a compromise |
| A fixed judge model across a benchmark's life | Judge migration is now routine and re-ranks results: DeepResearch Bench switched its official evaluator to GPT-5.5 after Gemini-2.5-Pro's deprecation, benchmarking three candidates against a "human inter-annotator agreement baseline = 68.78%" and re-evaluating prior results [CITED: github.com/Ayanami0730/deep_research_bench README, 11 May 2026 entry] | Independent support for declining a judge gate: a judge-anchored bar is not stable across model generations. Reinforces MEMORY `Agent tool models are aliases, not pins` |
| Holistic LLM rubric scoring for agent evals | Deterministic-first, with judging confined to narrow evidence-anchored yes/no probes [CITED: arXiv 2606.05405 §3.3] | The shape ENV-06 should take if it runs |

**Deprecated / not applicable here:**
- FACT's live-scrape pipeline (requires a "Jina API key (for web scraping in FACT evaluation)"
  [CITED: deep_research_bench README]) -- network-dependent, so out under D-12 and out under the
  zero-external-spend constraint.
- Point-estimate calibration gates -- superseded by lower-bound-CI gating per the ROADMAP constraint and
  the n=60 power result.

---

## Assumptions Log

> Every claim tagged `[ASSUMED]`. The planner and any later discuss pass must confirm these before they
> become locked decisions.

| # | Claim | Section | Risk if wrong |
|---|---|---|---|
| A1 | The per-run `costUsd` required by `validateManifest` can be recovered offline from the terminal `result` event in each q1 `stream.jsonl`. | Capture-Artifact State Inventory; Pattern 1 | **HIGH.** If not, the q1 pair cannot be made admissible at zero spend, and ENV-02's "closes the Phase-22 gap" outcome partially fails. Verify by scanning both streams for a cost field **before** the ENV-02 plan is written -- it is a 10-line script. |
| A2 | The built-in `/deep-research` sub-agent tool calls (and therefore its fetched source text) are recorded in `~/.claude/projects/<hash>/<session>/subagents/agent-*.jsonl` and would survive if archived promptly. | Capture-Artifact State Inventory; Pitfall 1 | **HIGH.** This is the only route to a built-in evidence corpus. Sourced from MEMORY (`Test #5 tool-budget threshold ambiguity`), not verified for a Workflow-hosted `/deep-research` run -- the q1 session dirs are gone, so it cannot be checked without a capture. If false, ENV-04's quote-match is not symmetric on any pair and must terminate branch (b) by design rather than by accident. |
| A3 | Model cards (Mitchell et al. 2019) carry nine sections: model details, intended use, factors, metrics, evaluation data, training data, quantitative analyses, ethical considerations, caveats and recommendations. | Pattern 6(iv) | LOW. Only affects which skeleton is cited as prior art; three other formats were primary-verified. The arXiv abstract fetch did not contain the section list. |
| A4 | DOIs are case-insensitive and the practical normalization is lowercase, prefix-preserved. | Pattern 2B rule 2 | LOW for this phase (zero DOIs measured in the q1 pair) but could matter for q2. Sourced from a search summary of the DOI Handbook / Crossref display guidelines, not a fetched primary page. |
| A5 | The built-in's report format (a `## Complete verification ledger (N/N confirmed)` heading plus a table) is stable enough for Pattern 5's mechanical completeness check to work on q2. | Pattern 5 | MEDIUM. Derived from a single observed report; the built-in is closed-source and its output format is not contractual. Mitigation is already stated in Pattern 5 -- a format change is itself an ENV-07 finding. |
| A6 | A regex-based citation extractor over a frozen rule set is sufficient for these two report formats and preferable to adding a Markdown AST parser. | Standard Stack, Alternatives | LOW-MEDIUM. Reversible: if the co-test cannot discriminate the two formats, add a parser to `eval/` (permitted -- the tree never ships) and re-run the Package Legitimacy Gate. |
| A7 | `filterSliceA`'s output ordering is stable across runs, so a seeded draw over it is reproducible. | Pattern 3 | MEDIUM. `filterSliceA` iterates the input array in order, so stability follows from `readJson` preserving JSON array order -- but the plan should assert it in a test (draw twice, compare) rather than assume it. |

---

## Unresolved / abstain ledger

> House style from `.planning/notes/phase-22-diagnosis-two-root-causes.md`. **Never promote these to
> settled prose.**

- *DeepWeb-Bench rejected an LLM-judge design because judge-based aggregate scores vary across judge
  models and conflict with auditable evaluation* -- **abstain: unverifiable.** Attributed to Appendix F.3
  "Scoring Alternatives Considered" by a search summary; the fetched HTML of arXiv 2605.21482 does not
  contain that appendix, and the body text describes "an automated GPT-5.5 grader applying the per-cell
  rubric," which points the other way. The *conclusion* is independently supported by the ALE quote
  (arXiv 2606.05405 §3.3), which is verified -- cite that one, not this.
- *A follow-up paper declined to use FACT because referenced pages become inaccessible over time, making
  the metric unreliable for reproducible evaluation* -- **abstain: unverifiable** (search summary; the
  paper is unnamed). The equivalent point IS verified from the primary source: arXiv 2605.06635 §5
  concedes "URLs that were accessible during evaluation may become unavailable." Use that.
- *Evaluation Cards treats "every absent field as a claim not made, with neither being an error," and
  performs no back-filling* -- **abstain: unverifiable.** The fetched arXiv 2606.09809 HTML confirms the
  five-part Table 2 structure but the fetch explicitly could not locate those sentences. The framing is
  attractive for ENV-07 and may be true; do not quote it.
- *Model cards' nine sections* -- **abstain: non-authoritative source** (see A3).
- *Binarizing a graded label raises agreement* -- **abstain: non-authoritative source** (carried forward
  from the Phase-22 diagnosis ledger; unchanged, and moot here).
- *BAcc -> MCC mapping figures* -- **abstain: derived arithmetic, not measurement** (carried forward
  unchanged).
- *No deep-research Elo/arena leaderboard exists* -- **abstain: unverifiable** (carried forward; absence
  of search hits is not absence of the thing).
- *The diagnosis note's "26 numbered ref markers, 10-item source list"* -- **superseded by measurement,
  not abstained.** The full-file count is 69 markers / 13 unique. Record the correction in ENV-01; do not
  quietly overwrite the note.
- *This researcher's own contamination* -- **disclosed.** This session ran programmatic structure scans
  over both q1 reports (regex counts, heading list, and ~6 source-list lines from each). It did not read
  the reports' argumentative content. This extends, in kind, the contamination already disclosed for the
  designing session, and is covered by D-02's route (a): the ENV-04 bar is frozen on the fresh q2 pair,
  which no session has seen. **The ENV-01 pre-registration must record this session's scan as part of the
  contamination disclosure**, listing the specific scans, so the disclosure is complete rather than
  approximately complete.

---

## Open Questions (RESOLVED)

All four were carried into planning and all four are closed. Q1 stays open as a fact about the world
BY DESIGN -- it is resolved as a planning question by being pre-committed, with both branches frozen
before the observation that selects one, which is the correct handling rather than an unresolved item.

1. **Does the built-in's Workflow surface its sub-agents' fetched content anywhere retrievable?**
   -- **RESOLVED BY PRE-COMMITMENT (D-19).** Both branches are written into the ENV-01 freeze by Plan
   23-04 Task 1 before the spike runs, and the observation that selects one is Plan 23-06 Task 2's
   FIRST post-retention action. The answer is not known at plan time and does not need to be.
   - Known: not in the parent `stream.jsonl` (verified -- only `{"Workflow":1}` as a tool_use).
   - Unclear: whether the per-subagent JSONL exists for a Workflow-hosted `/deep-research` and whether it
     records `WebFetch` result bodies.
   - Recommendation: make this an explicit, cheap **first observation of the ENV-05 spike** -- the spike
     is already a paid built-in capture, so checking the session dir immediately afterwards costs nothing
     extra. Freeze the check in ENV-01 so its outcome is pre-committed, and pre-commit both branches:
     if present, archive it and ENV-04's quote-match runs on q2; if absent, ENV-04's quote-match
     terminates branch (b) with a named, result-independent reason.

2. **Is `costUsd` recoverable for the q1 captures?** (= A1.) Resolve before writing the ENV-02 plan; it
   determines whether ENV-02 is fully zero-spend-closable or leaves a residual.
   -- **RESOLVED (D-22).** Yes: the source is the LAST `type=result` event's `total_cost_usd` per
   capture stream, summed over a caller-enumerated stream list. Implemented in Plan 23-01 as
   `extractTerminalCost` and `aggregateRunCost`, with the last-not-first choice pinned by a real
   on-disk two-result stream. ENV-02 is fully zero-spend-closable.

3. **What is the q2 question?** Claude's discretion, but the constraint is sharp: bounded single-facet,
   matching AMENDMENT RECORD 1's narrowing (which is what made captures feasible at all), and it must
   still exercise citation behaviour. Recommendation: choose a question in a domain with **stable,
   canonical identifiers** (arXiv-heavy, as q1 was) so the canonicalizer has something to unify; a
   question answered mostly from blogs and vendor pages would leave the identifier set dominated by the
   `url:` fallback and weaken the audit's comparability -- which would be a property of the question
   choice, not of either system.
   -- **RESOLVED.** The chosen q2 question text is stated VERBATIM in the ENV-01 freeze by Plan 23-04
   Task 1, together with its selection reasoning, and Plan 23-04's acceptance criteria require both.
   The capture driver quotes the same text, so no capture can drift from it.

4. **Should ENV-04's offline half run on q1 at all?** It can (extraction, canonicalization, unique-source
   count, uncited-unit count are all runnable offline today; only quote-match is not). Recommendation:
   yes, run it -- as a **pre-registered dry run whose numbers are published but explicitly not used to
   set or check the bar** (D-02 puts the bar on q2). It de-risks the script before the paid capture and
   it produces a real ENV-04 reading even if ENV-05 does not clear, which materially improves the
   phase's floor under termination branch (b).
   -- **RESOLVED (D-20).** Yes, and the recommendation was adopted as written: Plan 23-03 Task 3 runs
   the q1 audit as a published dry run labelled not-bar-setting, and Plan 23-04's sequencing record
   states that its rate landed pre-freeze under D-20 and set no bar.

---

## Environment Availability

| Dependency | Required by | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | every eval module and test | [OK] | the repo's existing runtime (`eval/` has its own `package.json` + `node_modules`) | -- |
| `eval/.cache/chenxwh__AVeriTeC/data/dev.json` | ENV-03 draw | [OK] | 500 rows; `filterSliceA` -> 83/181, gate cleared, exit 0 (run 2026-09-06) | none -- re-fetch would be needed; do not run `git clean -x` |
| `eval/.cache/p22-baseline/{builtin,lz}/qB1-run1.report.md` | ENV-04 offline half | [OK] | 15,063 / 15,233 bytes | none |
| `eval/.cache/p22-baseline/{builtin,lz}/*.stream.jsonl` | ENV-02 MANIFEST build | [OK] | built-in 1.19 MB + 3 resume streams; lz 1.04 MB + 1 resume stream | none |
| Stored source excerpts for either q1 capture | ENV-04 quote-match | **[MISSING]** | -- | **No fallback for q1.** For q2, the retention protocol (Pitfall 1). |
| `~/.claude/projects/<...>/subagents/` for the q1 sessions | ENV-04 quote-match, built-in side | **[MISSING]** | -- | **Irrecoverable.** |
| MANIFEST files under `p22-baseline/` | ENV-02 admissibility | **[MISSING]** | -- | Constructible offline once the field fix lands, subject to A1 (cost source) |
| Live network | ENV-04 resolvability half only | [OK] | -- | If unavailable, the resolvability column is reported as not-run with its reason; the offline half is unaffected by design |
| Claude 5-hour session pool | ENV-03 voter dispatch, ENV-05 spike, ENV-06 grading | [OK] but **contended** | -- | Slice-A dispatch and the q2 captures draw on the SAME pool and must be paced against each other, not scheduled independently |
| Out-of-family model access | nothing | **[MISSING, by design]** | -- | Not needed; zero-OOF is structurally satisfied |

**Missing dependencies with no fallback:** the q1 evidence corpus (both systems) and the q1 subagent
session logs. These bound ENV-04's scope and must be reflected in the ENV-01 freeze, not discovered
during execution.

---

## Validation Architecture

### Test framework

| Property | Value |
|----------|-------|
| Framework | `node:test` + `node:assert` (Node built-in) |
| Config file | none -- co-located `*.test.mjs` files beside each module in `eval/` |
| Quick run command | `node --test eval/lz-eval-p23-<module>.test.mjs` (explicit FILE form) |
| Full suite command | `node --test eval/lz-eval-*.test.mjs` (explicit glob to FILE paths -- **never** `node --test eval/`) |

**Host quirk, binding:** `node --test <dir>` spuriously exits 1 on this machine even when all tests pass.
Every gate in every plan must name explicit `.test.mjs` file paths.

### Phase requirements -> verification map

Several ENV items produce **documents**, not code. Those are verified by review and by inspection, and
this table says so plainly rather than inventing a grep-test that would pass on a hollow artifact. A
grep-test asserting a heading exists proves the heading exists, not that the section says anything --
the project has an explicit prior lesson against exactly that.

| Req | Behaviour | Verification type | Command / method | Exists? |
|-----|-----------|-------------------|------------------|---------|
| ENV-01 | Pre-registration prose matches its frozen constants byte-for-byte; the freeze commit precedes every spending commit | **automated (anti-drift) + inspection** | `node --test eval/lz-eval-p23-prereg.test.mjs`; plus `git log --format='%H %cI %s'` showing the freeze commit's timestamp is earlier than every capture/vote/score commit | [NO] Wave 0 |
| ENV-01 | Pre-registration *content completeness* (contamination disclosure incl. this session's scans; termination clause; n<=5 ceiling; retention protocol; 83/181 correction; 69/13 correction; seed) | **human read -- content review under ENV-08** | Content-review record committed alongside. **Not automatable.** A checklist test can assert each required *section* is present and non-empty; it cannot assert the content is correct. Report both, and do not let the checklist test stand in for the read. | [NO] Wave 0 |
| ENV-02 | `extractSystemInit` returns `ccVersion === '2.1.186'` from the real on-disk capture, and the pre-fix code path throws on it | **automated, discrimination-proven** | `node --test eval/lz-eval-baseline-manifest.test.mjs` -- add a case reading `eval/.cache/p22-baseline/builtin/qB1-run1.stream.jsonl` (skip-if-absent guard, since the cache is gitignored) plus a synthetic event carrying only `claude_code_version` | [PARTIAL] test file exists; cases are Wave 0 |
| ENV-02 | Both q1 reports have a `validateManifest`-passing MANIFEST on disk | **automated** | a check script asserting `validateManifest(readJson(<path>)) === true` for each of the two MANIFEST paths | [NO] Wave 0. **Blocked on A1** (cost source) |
| ENV-03 | Yield re-verified at zero spend before any voter spawns | **automated** | `node eval/lz-eval-sliceA-gold.mjs eval/.cache/chenxwh__AVeriTeC/data/dev.json` asserting `clean unrefuted=83 clean refuted=181 gate-cleared=true`, exit 0 -- **already passing today** | [OK] verified 2026-09-06 |
| ENV-03 | The 40-item draw is deterministic and balanced 20/20 | **automated** | `node --test eval/lz-eval-p23-sliceA-draw.test.mjs` -- draw twice with the frozen seed and assert identical output; assert 20 + 20; assert every drawn record has exactly the keys `claim` and `claim_date` (leak control) | [NO] Wave 0 |
| ENV-03 | Tally is per-direction and never pooled | **automated** | existing `eval/lz-eval-sliceA-gold.test.mjs` already covers `tallyPerDirection`'s shape; add an assertion that the ENV-03 driver's output JSON contains no pooled rate key | [PARTIAL] |
| ENV-03 | The read is presented descriptively, with its three PROVISIONAL limits, and is not cited as a pass/fail | **human read -- content review** | Reviewer confirms the artifact's framing. A test can assert the three limit strings appear; it cannot assert the surrounding prose does not certify. **Report the test as a presence check, not as validation of the framing.** | [NO] Wave 0 |
| ENV-04 | Canonicalization unifies the two formats | **automated, discrimination-proven** | `node --test eval/lz-eval-p23-citation-audit.test.mjs` -- the four assertions in *Code Examples* plus: over the two q1 reports, assert `2306.15595` appears in **both** canonical identifier sets. A test that only checks lz's URLs would pass on a format-sensitive implementation, so it must include the built-in's `arXiv NNNN.NNNNN` prose form | [NO] Wave 0 |
| ENV-04 | Normalization was frozen before any rate was computed | **inspection (git history)** | `git log` ordering: the pre-registration commit containing the rules precedes the first commit containing any audit output | -- |
| ENV-04 | Quote normalization is deterministic | **automated** | assert `normalizeForQuoteMatch` is idempotent and folds each of the five character classes; assert a smart-quoted variant matches its ASCII original | [NO] Wave 0 |
| ENV-04 | Resolvability is a separate, dated, live check that the offline audit does not depend on | **automated (structural)** | assert the offline module makes no network call -- e.g. run its test with `fetch`/`http` stubbed to throw and confirm it still passes. This is the strongest available guarantee of reproducibility and it IS automatable | [NO] Wave 0 |
| ENV-04 | Uncited-unit count is labelled as coverage, not support | **human read -- content review** | Reviewer confirms the artifact's column label and note. Not automatable. | [NO] Wave 0 |
| ENV-05 | The completeness definition was frozen before the spike ran | **inspection (git history)** | commit ordering | -- |
| ENV-05 | The captured report is verification-complete under the frozen definition | **automated** | a small checker asserting the `N/N` header equality and the row count; **discrimination-proven** by asserting it returns false for `qB1-run1.report.partial-verify.md`, which is on disk | [NO] Wave 0 |
| ENV-05 | The realized resume-cycle / window count is recorded | **inspection** | count of `*.resume*.stream.jsonl` files plus a recorded session log | -- |
| ENV-06 | Blinding + position-swap, win only when both orders agree | **automated** | existing `eval/lz-eval-parity-judge.test.mjs` / `lz-eval-parity-verdict.test.mjs` | [OK] exists |
| ENV-06 | Judge agreement is reported, never used as a disqualifier | **human read -- content review** | Reviewer confirms no gate keys on it. Not automatable. | -- |
| ENV-07 | `23-ENVELOPE.md` exists, resolves exactly one termination branch, and names what was not established | **inspection + a weak structural check** | A test can assert exactly one of the three branch strings appears and that the NOT-ESTABLISHED section is non-empty. **This is a presence check.** Whether the envelope is useful rather than boilerplate is a human judgement -- verified by the ENV-08 content review, not by a test | [NO] Wave 0 |
| ENV-08 | Every new eval script is code-reviewed and covered by code-reviewed unit tests; every prompt/reference is content-reviewed before it drives an LLM task | **process gate -- review records** | One review record committed per artifact, before the artifact is used. Verified by inspection of the commit trail | -- |
| ENV-08 | The eval tree never ships | **automated** | `node --test eval/lz-eval-packaging-boundary.test.mjs` | [OK] exists |
| ENV-08 | Zero OOF spend | **structural** | No OOF transport exists in any eval module and no OOF capability exists account-wide. Assert by inspection that no new module adds one | [OK] |

### Sampling rate

- **Per task commit:** the co-test for the module touched, explicit FILE form.
- **Per wave merge:** `node --test eval/lz-eval-p23-*.test.mjs eval/lz-eval-baseline-manifest.test.mjs eval/lz-eval-sliceA-gold.test.mjs eval/lz-eval-packaging-boundary.test.mjs`
- **Phase gate:** the full explicit-file suite green, plus every ENV-08 review record present, before
  `/gsd-verify-work`.

### Wave 0 gaps

- [ ] `eval/lz-eval-p23-prereg.test.mjs` -- anti-drift (ENV-01)
- [ ] `eval/lz-eval-p23-citation-audit.test.mjs` -- canonicalization + quote normalization + no-network (ENV-04)
- [ ] `eval/lz-eval-p23-resolvability.test.mjs` -- live half, isolated (ENV-04)
- [ ] `eval/lz-eval-p23-sliceA-draw.test.mjs` -- determinism + balance + leak control (ENV-03)
- [ ] New cases in `eval/lz-eval-baseline-manifest.test.mjs` -- real-capture `claude_code_version`, discrimination-proven (ENV-02)
- [ ] A completeness checker + its test, discrimination-proven against `report.partial-verify.md` (ENV-05)
- [ ] Framework install: **none needed** -- `node:test` is built in

---

## Security Domain

`security_enforcement` is absent from `.planning/config.json`, so it is treated as enabled. This phase
adds no runtime surface, no network listener, no user input path, and no shipped code. The applicable
categories are narrow and mostly already mitigated.

### Applicable ASVS categories

| ASVS category | Applies | Standard control |
|---------------|---------|------------------|
| V2 Authentication | no | No auth surface; the only credential-adjacent item is the Claude session pool, unchanged |
| V3 Session Management | no | -- |
| V4 Access Control | no | -- |
| V5 Input Validation | **yes** | Every new eval module parses untrusted-ish on-disk artifacts (captured reports, stream JSONL, gold JSON). Use the existing fail-closed convention: `readJson` for JSON, `ContractError` on any shape violation, never a silent default |
| V6 Cryptography | **yes (narrow)** | sha256 pins for freeze integrity via `node:crypto`. Never hand-roll; never use a non-cryptographic hash for a pin |
| V12 Files & Resources | **yes** | The resolvability checker performs outbound HTTP to identifiers extracted from model-authored reports. Treat every extracted URL as untrusted: no redirect-following to `file:`/`data:` schemes, a hard timeout, a response-size cap, and no execution of anything fetched |

### Known threat patterns

| Pattern | STRIDE | Mitigation |
|---|---|---|
| **Answer leak into the voter** (T-22-05) -- a gold field reaching the verify-voter | Information disclosure | `filterSliceA` emits only `{ claim, claim_date }` [VERIFIED: `eval/lz-eval-sliceA-gold.mjs:201`]. The seeded draw must sample its OUTPUT, never the raw rows. Assert the drawn records' key set in a test |
| **Unpinned capture graded** (T-22-06) -- a run with no CC-version/model pin admitted | Tampering / repudiation | `validateManifest` fails closed on all four fields; ENV-02's fix makes the pin actually obtainable |
| **SSRF via a report-supplied URL** in the resolvability check | Information disclosure / SSRF | Scheme allowlist (`http`/`https` only), no redirect to other schemes, timeout, size cap, no credential forwarding. New to this phase -- not previously present, because no eval module previously fetched a model-authored URL |
| **Post-hoc rule editing** presented as pre-registration | Repudiation | The anti-drift test plus commit-ordering inspection; the freeze commit is the timestamp of record |
| **Destructive cache loss** via `git clean -xdf` | Denial of service (to the phase) | `eval/.cache/` is gitignored and holds irreplaceable captures. No plan task may run `git clean` with `-x` |

---

## Sources

### Primary (HIGH confidence -- read from disk or fetched and quoted verbatim)

**In-repo, read this session (2026-09-06):**
- `eval/lz-eval-sliceA-gold.mjs` -- `SLICE_A_GATE` (:64-67), `PROVISIONAL_LIMITS` (:70-75), `AVT_COLLAPSE`
  (:78-83), `FILTER` (:86-91), `filterSliceA` emit (:201), `tallyPerDirection` (:252-263)
- `eval/lz-eval-baseline-manifest.mjs` -- `extractSystemInit` (:52-110, bug at :91), `buildManifest`
  (:119-146), `validateManifest` (:149-201)
- `eval/.cache/p22-baseline/builtin/qB1-run1.stream.jsonl` -- real `system/init` key list and values
- `eval/.cache/p22-baseline/{builtin,lz}/qB1-run1.report.md` -- citation-format inventory, heading scan,
  source-list line shapes
- `eval/.cache/chenxwh__AVeriTeC/data/dev.json` via the `lz-eval-sliceA-gold` CLI -- 83/181, gate cleared
- `plugins/lz-advisor/skills/lz-deep-research/SKILL.md` -- the report contract (sections (a)-(e), the
  five-value confidence enum, the two assurances, the verbatim excerpt store)
- `.planning/` -- ROADMAP Phase 23 section, REQUIREMENTS ENV-01..08, 23-CONTEXT.md, the diagnosis note,
  `.continue-here.md`, `config.json`

**Fetched and quoted verbatim:**
- https://arxiv.org/html/2605.06635v1 -- "Cited but Not Verified", §3.2 Markdown AST Parser, §3.3.1-3.3.3,
  §5. Citation-form list, whitespace/code-fence normalization, deduplicated normalized-URL registry,
  passage-level attribution rule, the three dimensions, the accessibility caveat
- https://arxiv.org/html/2606.05405v1 -- "Agents' Last Exam", §3.3 Evaluation Modes. The
  deterministic-first rule and the narrow-probe confinement
- https://arxiv.org/html/2604.03173v1 -- the Wayback-anchored definition of a hallucinated URL; explicit
  scope limitation to URL-existence (no registry canonicalization)
- https://arxiv.org/html/2606.09809v1 -- "Evaluation Cards", Table 2 five-part framework
- https://info.arxiv.org/help/arxiv_identifier.html -- canonical arXiv identifier form and version suffix
- https://unicode.org/reports/tr15/ -- NFC/NFD/NFKC/NFKD definitions; the W3C NFC recommendation; the
  explicit warning against blind NFKC
- https://pmc.ncbi.nlm.nih.gov/articles/PMC4623764/ -- STARD 2015 checklist, all 30 items
- https://pmc.ncbi.nlm.nih.gov/articles/PMC7090057/ -- Model Facts label, seven sections
- https://macrolib.com/books/ich/chapter/ich-e9/export/html -- ICH E9 §II.B exploratory vs confirmatory
  (a reprint of the ICH standard; the authoritative copy is the FDA reprint at
  https://www.fda.gov/media/71336/download, not fetched this session)
- https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents -- deterministic-grader
  recommendation; the judge-calibration loop
- https://raw.githubusercontent.com/Ayanami0730/deep_research_bench/main/README.md -- FACT's Citation
  Accuracy / Effective Citations definitions; the Jina API key requirement; the 2026 evaluator migration

### Secondary (MEDIUM confidence -- search results whose specific claim was cross-checked)

- DeepResearch Bench RACE reference-parity framing (arXiv 2506.11763) -- consistent with the diagnosis
  note's independent citation of the same paper; the arXiv abstract fetch did not carry the formulas
- Crossref / DataCite DOI display guidelines -- normalization direction confirmed across two independent
  summaries; primary page not fetched (see A4)

### Tertiary (LOW confidence -- recorded in the abstain ledger, not used)

- DeepWeb-Bench Appendix F.3; the unnamed FACT-declining follow-up; Evaluation Cards' absence-as-claim
  framing; Mitchell et al.'s nine sections

---

## Metadata

**Confidence breakdown:**

| Area | Level | Reason |
|------|-------|--------|
| ENV-02 mechanical fix | **HIGH** | The real event's field names and values were read from the actual capture on disk; the buggy line was read in source. Nothing here is inferred. |
| Capture-artifact inventory | **HIGH** | Every "missing" is a negative result from a `find`/`ls`/scripted scan run this session, not an absence of search hits. The one inference (A2, that subagent JSONL would carry the content) is flagged. |
| Slice-A composition (ENV-03) | **HIGH** | The module was read line by line and its CLI re-run; 83/181 reproduced independently. |
| Citation normalization rules (ENV-04) | **MEDIUM-HIGH** | Format facts measured directly; the rule set is assembled from one primary-quoted prior-art parser plus two identifier standards. Not itself tested against q2, which does not exist. |
| Descriptive-reporting framing (ENV-03/Q2) | **MEDIUM** | ICH E9 and STARD are authoritative and quoted, but they are from clinical diagnostics -- the transfer to an LLM eval is by analogy and should be stated as such in the artifact. |
| Envelope formats (ENV-07/Q3) | **MEDIUM-HIGH** | Three of four skeletons primary-verified with exact section lists. |
| Judge-free eval prior art (Q4) | **MEDIUM** | One strong verbatim primary quote (ALE §3.3) plus the Anthropic guidance; the broader landscape claims are in the abstain ledger. |
| "Uncited claim" determinism | **HIGH (negative result)** | Every implementation surveyed is LLM-driven. The conclusion that a deterministic version must be structural follows from the definitions, not from a search miss. |

**Research date:** 2026-09-06
**Valid until:** ~2026-10-06 for the external methodology (deep-research eval is fast-moving; the
DeepResearch Bench evaluator migrated in May 2026). The in-repo findings are valid until the cache
changes -- and `eval/.cache/` is gitignored, so **re-run the inventory scans at plan time if any session
has intervened.**
