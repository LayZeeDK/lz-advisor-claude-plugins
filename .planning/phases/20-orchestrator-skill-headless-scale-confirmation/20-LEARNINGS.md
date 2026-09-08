---
phase: 20
phase_name: "Orchestrator skill + headless scale confirmation"
project: "lz-advisor"
generated: "2026-06-21"
counts:
  decisions: 11
  lessons: 9
  patterns: 8
  surprises: 5
missing_artifacts: []
---

# Phase 20 Learnings: Orchestrator skill + headless scale confirmation

## Decisions

### D-21: certified-WORKS two-arm split-source methodology

The certified-WORKS cert was re-planned to TWO arms certified on SEPARATE pools (SDT estimates sensitivity and specificity independently): arm B (over-refusal / sensitivity) stays LIVE-harvested SUPPORTED claims from the skill's own runs (N >= 30, CP-upper <= TAU_OR 0.15); arm A (false-uphold / specificity) becomes a SEPARATE constructed/native source (N >= 30, CP-upper <= TAU_FU 0.10). The two arms are NEVER pooled into one N; WORKS requires BOTH gates on-distribution.

**Rationale:** The original D-02 single-source "harvest dense-SUPPORTED positives from the skill's own output" proved empirically infeasible (~0.33 dense-SUPPORTED/run; lexical dedup under-merges so corroboration sticks at 1; the dense-trap arm would have needed ~90 runs). A 3-round UNANIMOUS cross-family board (2 Opus lenses + GPT-5.5 + gemini-3.1-pro-preview) decided the replacement, with `CERTIFY-WORKS-BOARD-DECISION.md` made the authority. Shared pipeline/origin is not required because SDT separates the two estimands.
**Source:** 20-CONTEXT.md (D-21); CERTIFY-WORKS-BOARD-DECISION.md

---

### D-22: ARM-A substitution to the skill's own native refuted-gold (option C, board-ratified 4/4)

The D-21 arm-A construction (manually-authored minimal-edit contrastive pairs) was superseded. Arm A instead harvests the skill's OWN naturally-occurring Contested/Unsupported/Low claims and RETAINS them as refuted-gold ONLY where the frozen OOF all-agree pair confirms gold-blind that "the evidence does not entail the claim" (gold = the OOF read, never the skill self-tag); difficulty-matched STATISTICALLY (covariate-overlap + subject-difficulty + cluster floors), not minimal-pairs. Construct-validity gate (d) minimal-edit is DROPPED; gates (a) lexical-AUC <= 0.65 and (b) one-sided not-easier are re-run on the POST-OOF retained set.

**Rationale:** Minimal-edit pairs were infeasible on-distribution at N >= 36 (dense-AND-SUPPORTED scarcity), the human maintainer declined to author them, and model-authoring injected the very lexical artifact gate (a) guards (a 32-pair seed scored lexical-overlap AUC 0.856 >> the 0.65 ceiling). The skill over-produces refuted-gold as a FREE by-product of the arm-B harvest (~15/run). The ORIGINAL certified-WORKS board was RESUMED and ratified option C unanimously (4/4, round 1) via `CERTIFY-WORKS-RATIFICATION.md`. This is full-WORKS-eligible (on-distribution); the minimal-pair rule was an instrument for construct validity, not the construct.
**Source:** 20-CONTEXT.md (D-22); 20-05-ARMA-BUILD-SUMMARY.md

---

### D-20: live-cert callVoter=Agent sub-agents / callOof=Copilot CLI transport split

The live-cert `callVoter` transport is Agent sub-agents (the Phase-18 verify-voter agents via the Agent tool, per-invocation `model: haiku` for CHEAP / `model: sonnet` for STRONG) driven from a Claude Code session, so the Claude voter spend draws the Claude session pool and NEVER the Anthropic API nor `claude -p`. `callOof` stays the Copilot CLI (metered Copilot AI Credits). `eval/lz-eval-live-cert.mjs` is invoked via `Bash(node:*)` for deterministic scoring only.

**Rationale:** The user directive forbids the Anthropic API (PROJECT.md: "the Claude Code Agent tool is the only mechanism"); `claude -p` stays the dev/UAT-only harness. This corrected the "metered Claude voter spend" wording in 20-05-PLAN.md -- the only metered pool is the OOF Credits.
**Source:** 20-CONTEXT.md (D-20)

---

### D-01: settle-OR-raise verdict rule (Sonnet-default ships regardless)

Phase 20 delivers both the orchestrator skill (workstream A) and the live WORKS certification (workstream B), but the live-cert outcome is honestly settle-OR-raise: if WORKS cannot be cleanly certified, RAISE to the user and ship the Sonnet-default voter anyway. The shippable milestone deliverable (the Sonnet-default `lz-deep-research` skill) never depends on the cert verdict.

**Rationale:** The live arm is the only stage that can certify WORKS (the SDT positive-trials constraint), but the Sonnet-default is already inside the accepted budget, so a failed/voided cert is not a phase gap -- it is a pre-registered honest outcome. This is what let the final NOT-WORKS verdict close the phase as SATISFIED-BY-HONEST-RAISE rather than a failure.
**Source:** 20-CONTEXT.md (D-01); 20-VERIFICATION.md (SC-6 analysis)

---

### D-06: Haiku-first flip DEFERRED regardless of the cert verdict

Phase 20 ships only the STRONG (Sonnet) default + the gated CHEAP (Haiku) mechanism + the guardrails (load-bearing escalation, unanimous-uphold audit) + a pre-committed rollback ("the flag stays OFF"). The CHEAP tier flips ON only after a FUTURE run clears BOTH CP gates jointly plus a demonstrated real cost win, at an explicit human checkpoint.

**Rationale:** The cost-asymmetry is decisive -- STRONG is already inside the accepted budget, so a wrong CHEAP uphold (false confidence in a CITED report) is an irreversible credibility failure strictly worse than spending within budget. A cheap-vs-strong McNemar/non-inferiority comparison is only meaningful on a construct-matched over-refusal metric, which does not yet exist, so the flip was never going to flip ON this phase.
**Source:** 20-CONTEXT.md (D-06); 20-05-LIVE-CERT-RESULT.md

---

### Evidence-join: real excerpt TEXT, not bare URLs

The harvested live-cert members (both arms) originally carried only the survivor cluster's SOURCE URLs as "evidence". A bare URL is not adjudicable -- the OOF probe and Stage-2 voter ask "does this EVIDENCE entail the CLAIM?". The fix reconstructs evidence from the on-disk run dir (`survivors.json` cluster -> `claims/<worker>.json` matched by source + EXACT-then-Jaccard-0.6 text overlap -> `excerpts/<id>.txt` passage TEXT), returning the verbatim worker quote plus the referenced excerpt passage.

**Rationale:** Without this join the entire live cert would have judged against URLs. Arm B keeps counts byte-identical (a no-match member carries `evidence:[]`, NEVER dropped); arm A DROPS a no-match candidate (it must not enter the cert with no evidence). The join was extracted into its own module (`lz-eval-evidence-join.mjs`) to avoid an import cycle (arm A already imports the run-dir reader from arm B).
**Source:** 20-05-EVIDENCE-JOIN-SUMMARY.md

---

### Evidence-packaging: quote-primary + faithful bibliographic-strip

OOF evidence packets LEAD with the verified worker quote (the load-bearing, directly-verified snippet), with the excerpt passage as secondary context. A faithful front-matter strip removes ONLY bibliographic metadata lines/segments (Source/Title/Authors/Published/DOI/arXiv/Status/Category/`## section` headings/`--- SECTION ---` separators) plus a bare-URL-only residue, applied via a line-pass on RAW text before the whitespace collapse.

**Rationale:** Each packet should lead with the verified fact, not bibliographic noise. The strip is faithful by construction -- markers match only at a unit boundary so a mid-sentence "source"/"title"/"status" word is never removed, the case-insensitive marker match avoids the `/i` flag so value-terminator classes stay case-sensitive (an author initial "Y." never trips a sentence boundary), and the verbatim quote is never cleaned (it is the safety fallback). Applied inside the shared join so it is pre-registration-clean and affects both arms with one change.
**Source:** 20-05-PACKAGING-SUMMARY.md; 20-05-OOF-PREP-SUMMARY.md

---

### Single-direction dedup keeping superset facts

The quote/excerpt dedup drops the secondary excerpt ONLY when the verified quote already contains the WHOLE cleaned excerpt (total redundancy). A SUPERSET excerpt (restates the quote PLUS extra factual sentences) is KEPT IN FULL; a distinct excerpt is kept; the quote always leads.

**Rationale:** The earlier BIDIRECTIONAL containment dedup (drop when either string contains the other) over-trimmed on 53% of arm-A candidates -- a superset excerpt was dropped to the lean quote alone, LOSING the extra facts the OOF entailment turns on (CRISPR measured rates, Chinchilla scaling-law, lithium named chemistries). Token savings come from the metadata strip, not from discarding superset facts. The fixed avg is ~1290 chars/candidate (intentionally higher than the over-trimmed 650), comparable to the pre-fix join and far below a raw-excerpt dump.
**Source:** 20-05-PACKAGING-FIX2-SUMMARY.md

---

### Two arms NEVER pooled + N frozen before scoring (anti-result-shopping)

The over-refusal control arm (nCtrl) and the false-uphold/dense-trap monitor arm (nTrap) are frozen as SEPARATE disjoint counts with NO combined-N field, passed separately to `certifyModel` (ESTIMAND B / ESTIMAND A). `freezeArms` snapshots both arms at-or-above-floor and disjoint into an `Object.freeze`d snapshot at the Stage-1 [HUMAN BLOCK] boundary; N cannot grow afterward.

**Rationale:** Pooling the arms or growing N after seeing results is result-shopping. The lock rule, sample, seed, and reclassification rule are pre-registered and committed BEFORE any scored vote; frozen primitives (CP estimator, TAU_OR 0.15, TAU_FU 0.10, N_CTRL_FLOOR 24) are consumed byte-identical; there is no optional stopping. This discipline is what let the team report the raw 4/30 transparently without laundering it into a pass.
**Source:** 20-02-SUMMARY.md; 20-05-REJUDICATION-PREREGISTRATION.md

---

### D-12: deterministic off-model escalate union (VERIF-05)

The aggregator emits a per-claim `escalate` flag computed DETERMINISTICALLY (never by model discretion) as the UNION of (a) `confidence === 'Contested'`, (b) an OR-folded worker `load_bearing` flag, and (c) a stable-FNV-1a-hash audit sample of unanimous (3/3 High) upholds at `AUDIT_SAMPLE_RATE` 0.15. The escalate field appends after `confidence` as an additive last key; the frozen survivor field set is byte-unchanged.

**Rationale:** Escalation must be reproducible from the run dir and not subject to model judgment, so it uses a stable FNV-1a hash of the aggregator-generated `'cluster'+N` id (never `Math.random`, never a worker-authored id). `load_bearing` is fail-OPEN (only literal `true` counts) because it is the worker's judgment; id/text/quote/source stay fail-closed.
**Source:** 20-01-SUMMARY.md; 20-01-PLAN.md

---

### D-21 fold-in: cross-session resumability ships as a user-facing SKILL feature

A `lz-deep-research` run that dies mid-pipeline (e.g. HTTP 429 org limit) resumes from its on-disk blackboard, reuses every prior search/fetch/extract artifact, and casts only the missing cluster-keyed vote seats -- with ZERO changes to the off-model aggregator. Completion is signalled by a SKILL-written `run_state.json { stage2_complete: true }` sentinel plus `report.md`, never inferred from `survivors.json` confidence values.

**Rationale:** Promotes the v2 SCALE-03 resumability idea to in-scope (the workflow re-architecture stays DEFERRED). The aggregator stays untouched; the SKILL counts votes itself, pre-validates vote JSON, re-dispatches damaged seats, and re-drives the unchanged idempotent aggregator. Completion-by-sentinel avoids the degenerate-aggregate trap (a premature all-Unsupported survivors.json must never be read as "done").
**Source:** 20-07-SUMMARY.md

---

## Lessons

### The construct mismatch that VOIDed both cert arms (the central lesson)

A closed-book / knowledge-based gold compared against an open-book live-web voter is a WRONG-CONSTRUCT comparison. The over-refusal controls' gold was built CLOSED-BOOK ("does the provided excerpt entail the claim?"), but the shipping voter runs OPEN-BOOK ("is the claim true given the live-web literature?"). The closed-book gold systematically mismeasures the voter, so the 4/30 nominal breach (raw CP-upper 0.2796 > TAU_OR 0.15) is confounded with CORRECT refutes of overclaimed controls. A 3-round unanimous cross-family board ruled this wrong-construct (UNANIMOUS Q1), indicting BOTH arms. Sensitivity is therefore VOID-on-construct and specificity VOID-on-power -> the cert neither certifies nor refutes WORKS.

**Context:** Even the pre-registered two-sided re-adjudication could not rescue it: the OOF re-adjudicators judged from evidence + training knowledge via the Copilot CLI -- they did NOT live-web-search, so by the board's own Q1 principle a non-live-web gold is STILL construct-mismatched for an open-book live-web voter. The construct-aligned fix (RAISED to Phase 21) is to build an OPEN-BOOK over-refusal gold whose adjudicators perform the SAME live-web search the voter does.
**Source:** 20-05-LIVE-CERT-RESULT.md; 20-05-PROVE-DISPROVE-BOARD-DECISION.md

---

### Arm A is structurally VOID because claim ~= quote

Arm A (the false-uphold / specificity arm) is structurally infeasible on-distribution at N >= 30: the skill's pipeline EXTRACTS each claim FROM its evidence, so claim ~= evidence, and the corpus under-produces dense-evidence false-uphold traps. A claim that is a near-copy of its own quote cannot serve as a difficulty-matched false-uphold trap.

**Context:** The D-22 native refuted-gold re-test gave 10/98 retained on old evidence; the clean-evidence re-test gave 1/16 -- far below the N >= 30 (36) floor -- CONFIRMING the arm is genuinely VOID-on-power, not a packaging artifact. The only available specificity evidence is the off-distribution Phase-19 MCC SCREEN-PASS, reported AS a non-certifying, off-distribution diagnostic, never as the specificity half of a two-arm result.
**Source:** 20-05-LIVE-CERT-RESULT.md; 20-05-SUMMARY.md

---

### The 4/30 refutes were correct, not over-refusals

Inspection of all 4 arm-B refutes showed the voter, via live-web disconfirming search, correctly finding the controls overclaim or contradict the broader literature (e.g. a claim says a scaling law "underestimates" while the cited paper says "OVERestimates" -- the claim contradicts its own source; another conflates a gene with its erythroid-specific enhancer). The open-book/closed-gold mismatch made the voter correctly refute overclaimed controls; the 4 are control label-noise, not voter over-refusals.

**Context:** This is the tier-flip artifact the board flagged: a STRONGER open-book judge correctly refutes contaminated controls and scores WORSE on a confounded metric, so a cheap "tie" would be spurious -- which is exactly why the Haiku flip is gated on a construct-matched gold (D-06).
**Source:** 20-05-LIVE-CERT-RESULT.md (ESTIMAND B section)

---

### M-1: the Copilot CLI interleaves ANSI SGR codes in its AI-Credits line

The Copilot CLI's "AI Credits N.N" usage line carries interleaved ANSI SGR (color) escape codes, which broke automated credit capture. The fix is to strip ANSI before parsing the credits line. The M-1 ANSI-strip fix landed mid-stream during the arm-B OOF gold run (only 3/10 calls were captured cleanly: 13.8 / 4.51 / 5.45).

**Context:** Without the strip, the credit-capture regex silently fails and the disclosed spend cannot be reconciled against the Copilot dashboard -- which matters for the project's MUST to disclose actual AI Credits after a metered consult.
**Source:** 20-05-SUMMARY.md; 20-05-LIVE-CERT-RESULT.md

---

### OOF credits are PER-CALL (~8/call), not cumulative; recalibrate the estimate

The Copilot "AI Credits" usage line reports per-call credits, not a cumulative running total, and each OOF call costs roughly 8 credits -- about 3x the disclosed pre-spend estimate. The arm-B OOF gold round (10 Copilot calls) ran ~79 AI Credits against a ~25-credit disclosed estimate.

**Context:** Copilot bills per token AND per session, and the OOF round dispatches each packet to TWO models. The per-call ~8 calibration is recorded in memory so future estimates use it. This was surfaced honestly rather than hidden.
**Source:** 20-05-SUMMARY.md; 20-05-LIVE-CERT-RESULT.md

---

### The `while read` piped-stdin DRAIN when running `claude -p` in a bash loop

Driving the Sonnet voter via `claude -p` inside a `while read` loop fed from a pipe drains stdin -- the loop exits after one iteration because `claude -p` consumes the remaining piped stdin. The fix is to feed the loop from a FILE and run `claude </dev/null` so the child does not swallow the loop's input stream.

**Context:** Found and fixed during the arm-B over-refusal voting (30 dedicated `claude -p --plugin-dir` voter sessions). This matches the global-memory rule about piped while-read loops running `claude -p`.
**Source:** 20-05-SUMMARY.md

---

### lz-advisor project-disable means working-tree voter agents need --plugin-dir headless

Because this repo project-disables the marketplace `lz-advisor` (`enabledPlugins: false`), the working-tree voter agents are NOT registered as `subagent_type`s in an in-repo session. The live-cert voter votes were cast via dedicated `claude -p --plugin-dir plugins/lz-advisor` sessions (the explicit load path), and the SC-5 spike likewise ran with `--plugin-dir` so the build under test is the one exercised.

**Context:** Same constraint documented for the SC-5 spike: the committed `.claude/settings.json` disables the marketplace build in this repo so `--plugin-dir` is the load path. An in-repo Agent dispatch would otherwise fail to resolve the working-tree voter agent type.
**Source:** 20-05-SUMMARY.md; 20-04-SC5-SPIKE.md

---

### Stage-0 harvest yield is ~0 dense-SUPPORTED -- a property of the skill, not a defect

The Stage-0 harvest feasibility probe (D-19) found the skill structurally under-produces the band the cert most needs (dense AND SUPPORTED): DENSE multi-source claims surface cross-source dissent under the adversarial 3-isolated-voter verification and resolve Contested, while surviving SUPPORTED claims tend to be thin (single readable seat) -> Low or single-source High. This held across both a contested topic (wasm) and a settled-fact topic (titanium).

**Context:** This is the verify-voter doing its job (surfacing dissent on multi-source claims), not a bug. It means the over-refusal/false-uphold live cert cannot be built from the skill's own dense-SUPPORTED positives at the required difficulty + N -- the literature-unsolved "difficulty-matched positives from dense multi-doc evidence" gap, now observed directly on the shipping skill.
**Source:** 20-05-LIVE-CERT-RESULT.md (Stage-0 historical section)

---

### LLM-task scripts need a code review AND tested coverage (req #6 gate)

Before the live-cert spend, the rest-of-Phase-20 test+review gate was satisfied: the full eval suite green (540/540), every spend driver guarded + tested, and an independent review CLEAN. Every script that runs or is used by an LLM task must be code-reviewed and covered by code-reviewed unit tests.

**Context:** This is the project-wide MUST applied as a no-spend gate before any metered run -- it covers both the plugin `scripts/` and the `eval/` drivers, and it is what made the live spend defensible.
**Source:** 20-05-SUMMARY.md

---

## Patterns

### SC-5 headless-scale empirical spike (un-fakeable trace parse)

Confirm LLM-behavioral requirements by mechanically parsing the captured `claude -p --output-format stream-json` trace with a pure re-runnable parser that computes a frozen verdict object `{ maxInFlight, waves, waveBoundaryHeld, exitOk, workerWriteFailures, advisorSpawns, pass }`. The SC-5 spike proved the packaged skill holds at real concurrency: maxInFlight EXACTLY 5 across 24 waves, advisorSpawns EXACTLY 2, exit 0, zero Write failures.

**When to use:** When a requirement is an LLM-prompt behavior of a Markdown skill that cannot be unit-tested (wave-batch cap, exactly-N-Opus-gates, host stability). The parser is locked by one passing + four single-criterion discriminating failing fixtures so the acceptance is un-fakeable and not a subjective read. Nested subagent tool-use is hidden from the parent trace, so cross-check advisor-spawn count and worker Write outcomes against the per-agent JSONLs (sibling `.meta.json` `agentType` is the authoritative role correlation).
**Source:** 20-04-SUMMARY.md; 20-04-SC5-SPIKE.md

---

### Cross-family board convergence methodology

For an un-recipe'd, high-impact call (here: how to validly prove-or-disprove the voter given a confounded metric), convene a board of 2 in-family Opus lenses (validity; decision/closure) + 2 out-of-family Copilot models (GPT-5.5; gemini-3.1-pro-preview), de-identified fact-only, and iterate to consensus on every item -- never pick for them. The board converged UNANIMOUSLY (wrong-construct; two-sided re-adjudication; scoped-not-WORKS; defer the Haiku flip) for ~20.3 Copilot AI Credits (Opus lenses on the session pool).

**When to use:** After a probe surfaces a methodology ambiguity that the existing decision records do not resolve (the canonical board trigger). Precede it with a research pass; record convergence in a decision doc; the board may request cheap probes. Cost is ~20-45 credits.
**Source:** 20-05-PROVE-DISPROVE-BOARD-DECISION.md; 20-05-SUMMARY.md

---

### Pre-register-then-freeze-then-score

Freeze the lock rule, the exact item set, the disagreement IDs, the adjudication question text, the blind-sample size + random seed, the reclassification rule, and the fail semantics in a committed document BEFORE any scored / metered call runs. The result stands as output -- no second pass, no prompt edits mid-flight, no item added/removed after scoring begins.

**When to use:** Any metered or scored measurement where the temptation to optional-stop or result-shop exists. The re-adjudication pre-registration (`20-05-REJUDICATION-PREREGISTRATION.md`) was committed before any OOF call; new bar constants (Plan 20-06) were frozen as module literals recorded in the lock rule WITH A TIMESTAMP (2026-06-20T14:39:54Z) before any pair was authored or scored.
**Source:** 20-05-REJUDICATION-PREREGISTRATION.md; 20-06-SUMMARY.md

---

### Dev-time SSOT prose-contract guard (eval test reads the shipped contract, ships nothing)

Lock an LLM-prompt invariant with a dev-only `eval/` test that READS the shipped contract file (SKILL.md / schema / worker prompt) and asserts the invariant, while shipping nothing into the plugin tree. The worker-contract SSOT test reads the schema + worker prompts and fails on field-name drift; the NEW `lz-eval-cost04-anthropic-floor.test.mjs` is a dual-sided guard asserting both the positive Anthropic-floor language AND the negative absence of any provider (Bedrock/Vertex/Foundry) token or branching prose.

**When to use:** When an automatable contract invariant (no provider branching; field-name lockstep; the AUDIT_SAMPLE_RATE value) was previously verified only by a manual `git grep`. Prove discrimination empirically: inject a synthetic violation into a tempdir COPY of the contract and confirm the guard fires.
**Source:** 20-VALIDATION.md; 20-01-SUMMARY.md

---

### Resumable-from-disk dual-run vote sets (re-cast only missing seats)

Make long, interruptible model runs resumable by persisting per-unit verdicts to disk (skip-already-done) so a re-run after a usage-limit interruption re-casts ONLY the missing seats and never re-pays for an already-adjudicated unit. The arm-A OOF adjudication gained an optional resumable `cacheDir` (OFF by default) that loads persisted per-candidate verdicts, dispatches only un-cached candidates, and merges cached + fresh; the live-cert vote store and SKILL resume both work at this granularity.

**When to use:** Any metered/long run that can hit HTTP 429 or a budget cap mid-stream. A no-spend end-to-end check proved Run 2 dispatched 0 calls (117 cache hits) with the same retained set as Run 1. Keep uids/cluster-ids ':'-free (map '::' -> '--') for the Windows vote-store filename constraint.
**Source:** 20-05-OOF-PREP-SUMMARY.md; 20-07-SUMMARY.md; 20-06-SUMMARY.md

---

### Req-#6 empirical test-discrimination check (disable the fix / inject a violation)

Prove a test genuinely discriminates by making it FAIL on the un-fixed behavior, not just pass on the fix. For a mutation check, delete the branch under test (escalate branch (c)) and confirm only the discriminating fixture fails; for a contract guard, swap the guard back to the old over-trim and confirm the superset test fails. A dedup/cleaning property test must FAIL on the un-fixed behavior and PASS on the fix -- never bend a fixture to make a passing test.

**When to use:** Whenever a green test is offered as evidence -- a test that passes on both the fixed and broken code proves nothing. The packaging-fix-2 BLOCKER was caught precisely because the prior "passing" test had been INVERTED (the quote lengthened to be the superset) to mask the over-trim.
**Source:** 20-05-PACKAGING-FIX2-SUMMARY.md; 20-01-SUMMARY.md

---

### Anti-drift lockstep landing (code + tests + schema + worker prompt in one wave)

Land an additive extension to a frozen contract as ONE atomic wave: the aggregator (authoritative) + the byte-identity test + the schema doc + the extract-worker prompt, all together, or the contract reopens. The `load_bearing`/`escalate` extension mirrored the new fields byte-for-byte across all four surfaces; the worker-contract SSOT test reads the schema directly and fails on drift.

**When to use:** Any change touching a frozen survivor-record field set or a documented worker contract. The code wins; the doc copies byte-for-byte. Field names must match exactly (snake_case `load_bearing`, never camelCase).
**Source:** 20-01-SUMMARY.md; 20-01-PLAN.md

---

### Thin-dispatcher orchestrator skill with progressive disclosure

Author the orchestrator skill as a thin 7-phase dispatcher (scope -> decompose+Gate1 -> search -> extract -> aggregate -> verify -> synthesize+Gate2) where the main session holds only receipts + bounded summaries + 2 advisor notes, while the off-model aggregator and worker subagents do the volume. Push report micro-format, citation join, two-gate packaging, and wave-batch reminders into a `references/` file reached by @-mention, with NO cross-skill body references.

**When to use:** When a skill orchestrates many subagents and a deterministic off-model script. The wave-batch is a hard counted instruction (N = min(remaining, 5) foreground per turn; never a sixth concurrent Agent call); the eval-only Opus voter is referenced descriptively, never by literal name, to satisfy the zero-hit gate while keeping the prohibition explicit.
**Source:** 20-03-SUMMARY.md

---

## Surprises

### The arm-A re-test rescued only 1/16 on clean evidence -- genuinely VOID, not a packaging artifact

After the extensive evidence-join, packaging, and faithful-dedup fixes (which suggested the earlier low yield might be a packaging artifact), the clean-evidence arm-A native refuted-gold re-test still retained only 1/16 -- far below the ~36 (33%) floor. The native refuted-gold re-test on old evidence had given 10/98.

**Impact:** This CONFIRMED arm A is structurally VOID on-distribution (claim ~= quote), independent of any packaging quality. It closed off the hope that better evidence packaging could make the specificity arm constructible, and pinned the false-uphold arm as VOID-on-power.
**Source:** 20-05-LIVE-CERT-RESULT.md; 20-05-SUMMARY.md

---

### The OOF spend ran ~79 credits vs ~25 estimated (3x)

The arm-B OOF gold round (10 Copilot calls) cost ~79 AI Credits against a disclosed pre-spend estimate of ~25 -- roughly 3x over.

**Impact:** Surfaced the per-call ~8-credit calibration (recorded in memory) and the per-call (not cumulative) credit-reporting semantics. It reinforced the project MUST to disclose actual credits after a metered session and to re-estimate from the calibrated per-call figure. Total metered Copilot across 20-05 was ~106 credits (gold ~79 + re-adjudication 7.09 + board ~20.3).
**Source:** 20-05-LIVE-CERT-RESULT.md; 20-05-SUMMARY.md

---

### Both cert arms ultimately VOIDed despite extensive build investment

After substantial no-spend build investment (the live-cert harness, the harvest two-arm loader, the contrastive/native arm-A machinery, the construct-validity gates, the evidence join + three packaging iterations, the resumable cache) plus real metered spend (~106 Copilot credits + session-pool voting), BOTH cert arms VOIDed: sensitivity VOID-on-construct, specificity VOID-on-power. WORKS was neither certified nor refuted.

**Impact:** The shippable deliverable -- the Sonnet-default skill + empirically-confirmed headless scale -- never depended on the cert verdict (D-01), so the phase still closed as a 6/6 SATISFIED-BY-HONEST-RAISE. The investment was not wasted: it produced the construct-mismatch diagnosis that defines the Phase-21 construct-aligned path (build a live-web open-book over-refusal gold).
**Source:** 20-05-LIVE-CERT-RESULT.md; 20-VERIFICATION.md

---

### Arm-B live harvest yielded ~2.3 SUPPORTED/run vs the ~0.33 dense-SUPPORTED/run that killed the original arm-A source

The arm-B over-refusal control harvest produced ~2.3 SUPPORTED/run (feasible, ~13 runs to N >= 30), whereas the original D-02 single-source dense-SUPPORTED yield was only ~0.33/run (which would have needed ~90 runs and made the dense-trap arm infeasible).

**Impact:** This ~7x yield gap between plain-SUPPORTED and dense-SUPPORTED is exactly why D-21 split the sources -- arm B stays live-harvested (the SUPPORTED band is abundant) while arm A had to leave the single-source dense-SUPPORTED approach entirely (first to constructed pairs, then to native refuted-gold).
**Source:** 20-05-LIVE-CERT-RESULT.md; 20-CONTEXT.md (D-21)

---

### The verify-voter's own correctness is what broke the metric

The headline surprise is reflexive: the verify-voter doing its job WELL (surfacing cross-source dissent on dense claims, and correctly refuting overclaimed controls via live-web search) is precisely what made the harvest under-produce dense-SUPPORTED positives AND made the closed-book gold mismeasure it. A stronger, correct open-book judge scores WORSE on a confounded closed-book metric.

**Impact:** The cert could not measure the voter because the voter was better than its gold. This drove the deferral of the Haiku flip (a cheap-vs-strong tie would be spurious on a confounded metric) and the Phase-21 RAISE to build a construct-matched live-web open-book gold before any tier comparison is meaningful.
**Source:** 20-05-LIVE-CERT-RESULT.md; 20-05-PROVE-DISPROVE-BOARD-DECISION.md
