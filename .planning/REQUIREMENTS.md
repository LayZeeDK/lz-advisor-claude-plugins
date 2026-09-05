# Requirements: lz-advisor

**Defined:** 2026-06-15
**Milestone:** v2.1.0 -- the `lz-deep-research` skill (decompose -> parallel search -> fetch -> extract -> adversarial-verify -> cited report)
**Core Value:** Near-Opus intelligence at Sonnet cost, achieved through strategic advisor consultation at high-leverage moments rather than running Opus end-to-end -- now extended from coding tasks to deep research.

> **Scope decisions (2026-06-15):** (1) Platform floor = Anthropic first-party API only; Bedrock/Vertex out of scope. (2) The pre-registered Haiku gating eval is IN scope and runs EARLY (right after the schema, before the search/extract workers and the orchestrator), decoupled from the pipeline. A dedicated deep-research pass on Haiku prompt engineering precedes authoring ANY Haiku agent (the verify-voter Haiku variant AND the Haiku search worker), so the eval tests a fair, research-grounded Haiku prompt -- never `model: haiku` on a Sonnet prompt. Sonnet-default voters ship regardless; Haiku-first flips ON only if the research-grounded eval clears, and if it shows Haiku non-viable the decision is RAISED TO THE USER (not auto-resolved). (3) The `.lz-research/<run-id>/` run dir is retained (gitignored) as the audit trail. (4) Release / publication (version sync, CHANGELOG/README, tag + GitHub Release) is handled during `/gsd-complete-milestone` AFTER `/gsd-audit-milestone` passes -- so audit findings can be resolved before publishing -- and is NOT a build phase. The aggregator is a skill-internal helper in `skills/lz-deep-research/scripts/`, NOT a top-level `bin/` (verified 2026-06-15).

## v1 Requirements

Requirements for the v2.1.0 milestone. Each maps to exactly one roadmap phase.

### Pipeline (PIPE) -- the deep-research spine

- [ ] **PIPE-01**: User can invoke `/lz-advisor:lz-deep-research <question>` and the skill decomposes the question into roughly five sub-angles before searching.
- [ ] **PIPE-02**: The skill clarifies scope before doing research work -- interactively when possible, or by surfacing explicit Assuming-frames in headless mode (scope clarification is a first-class step, not a silent default).
- [ ] **PIPE-03**: The skill fans out parallel web-search workers (about one per sub-angle) that each return source candidates.
- [ ] **PIPE-04**: For each fetched source, the skill stores the fetched excerpt immutably at fetch time as the evidence artifact (the basis for later quote re-checking).
- [ ] **PIPE-05**: The skill extracts falsifiable claims, each bound to a verbatim quote, a stored-excerpt id, and source metadata.
- [ ] **PIPE-06**: The final report cites every reported claim inline to its source.
- [x] **PIPE-07**: Every reported claim carries a confidence level (High / Medium / Low / Contested / Unsupported).
- [ ] **PIPE-08**: The skill flags cross-source contradictions, with Contested as a first-class verdict (not silently dropped or averaged away).
- [ ] **PIPE-09**: The skill emits a structured written report as the deliverable.

### Verification (VERIF) -- adversarial, evidence-artifact-centric

- [ ] **VERIF-01**: Each claim selected for verification is judged by three ISOLATED skeptic voters (no shared context between voters), diversified by attack mode.
- [ ] **VERIF-02**: Each open-book voter runs an explicit DISCONFIRMING search (searches the negation, not the claim's own terms) and records the disconfirming query it ran.
- [ ] **VERIF-03**: Corroboration is weighted by SOURCE INDEPENDENCE, not raw source count (N syndicated copies of one source count as one).
- [x] **VERIF-04**: Each claim's verbatim quote is mechanically re-checked against its stored excerpt; quotes that fail the re-check are dropped UPSTREAM of all voting.
- [x] **VERIF-05**: Verification escalates to a stronger tier on the UNION of triggers -- any contested split, OR any load-bearing claim regardless of verdict, OR a random audit sample (~15-20%) of unanimous upholds.
- [x] **VERIF-06**: The report distinguishes "quote verified verbatim" from "claim supported by the quote" as two separate assurances.

### Aggregation (AGG) -- deterministic, off-model

- [x] **AGG-01**: All dedup / ranking / vote-tally / quote-re-check is performed off-model by a deterministic Node script in `skills/lz-deep-research/scripts/` (zero model tokens, reproducible, auditable).
- [x] **AGG-02**: The aggregator runs with zero external dependencies (Node stdlib only) and is CRLF- and path-safe on Windows arm64 / Git Bash (explicit UTF-8 + LF normalization; `path.join`; no shell globbing).
- [ ] **AGG-03**: Worker subagents write evidence to the run dir and return only a one-line receipt (under a char cap); the main session never holds raw source text or raw votes.
- [x] **AGG-04**: The aggregator is covered by a validation fixture asserting its load-bearing behaviors (fabricated quote dropped, real-but-wrong-passage downgraded, paraphrase pair not double-counted as independent, near-duplicate pair merged, named ceilings enforced).
- [ ] **AGG-05**: The `.lz-research/<run-id>/` run dir (immutable worker files, stored excerpts, votes, survivors, report) is retained after the report as the audit trail.
- [x] **AGG-06**: Named ceilings (sub-angles ~5, max-fetch 15, max-verify-claims ~24, votes-per-claim 3, synthesis cap ~20) are enforced in code, not left to model discretion.

### Cost discipline (COST)

- [ ] **COST-01**: The Opus `advisor` is consulted read-only at exactly two gates (ranking cut-line; final synthesis / calibration), over bounded curated JSON only.
- [ ] **COST-02**: Verification voters default to Sonnet (inside the "Sonnet cost" budget); a Haiku-first Tier-1 voter exists as a config flag that is OFF until the gating eval (EVAL-*) clears it.
- [ ] **COST-03**: Subagent fan-out is wave-batched at no more than five in-flight per wave (search, fetch, verify), to avoid the disk-I/O storm and the silent ~10-concurrent platform cap.
- [ ] **COST-04**: The skill targets the first-party Claude Code runtime (Anthropic-backed) as its supported platform floor -- it orchestrates via the Agent tool, not direct API calls; Bedrock / Vertex / Foundry are out of scope (no degradation paths built).

### Verifier gating eval (EVAL)

- [ ] **EVAL-01**: A pre-registered evaluation dataset of at least 60-100 labeled claims exists, stratified (~40% supported / ~60% bad, with about half the bad claims SUBTLE overreach), covering BOTH closed-book and open-book voting.
- [ ] **EVAL-02**: The eval runs each claim k>=5 and reports Pass@1, Pass^k, and the false-uphold rate per stratum.
- [ ] **EVAL-03**: The Haiku-first flag is flipped ON only if the research-grounded eval shows ~0 open-book false-upholds on the SUBTLE subset AND escalation fraction keeps cost materially below all-Sonnet (kill if escalation exceeds ~40-50%). If the eval shows Haiku non-viable, the resulting decision (drop the Haiku variant, retain it behind the OFF flag, or invest further) is RAISED TO THE USER rather than auto-resolved; Sonnet-default ships in the interim.
- [ ] **EVAL-04**: The lock rule (the exact pass/kill thresholds and the false-uphold-as-sole-hard-gate decision) is written down BEFORE the eval runs, so the verdict cannot be rationalized post-hoc.
- [x] **EVAL-05**: The Haiku voter prompt under eval is engineered from a dedicated deep-research pass on Haiku prompt-engineering patterns and techniques (captured as a reference artifact), so the eval is a fair best-effort test of Haiku rather than a Sonnet prompt run on `model: haiku`. This research precedes authoring ANY Haiku agent (the verify-voter Haiku variant and the Haiku search worker). The research is grounded in CURRENT authoritative sources -- the Claude Code Guide / Claude Code Docs + web -- with every load-bearing technique verified; the local `lz-nx-ai-plugins` `MODEL-OPTIMIZATION-HAIKU.md` is a NON-AUTHORITATIVE starting point whose details are treated as potentially stale until verified.

### Integration (INTEG)

- [x] **INTEG-01**: The new skill is discoverable as `lz-advisor:lz-deep-research` (bare `/lz-deep-research`), de-shadowing the Claude Code built-in `/deep-research`.
- [x] **INTEG-02**: `.lz-research/` is added to `.gitignore` as runtime scratch.

### Open-book over-refusal gold (OBG) -- Phase 21 RAISE

Derived 2026-06-21 (the ROADMAP Phase-21 "Requirements: TBD -- run /gsd-plan-phase 21 to derive"). The RAISE from the Plan 20-05 NOT-WORKS live-cert verdict: resolve the construct mismatch (a closed / training-knowledge gold vs an open-book live-web voter) by building a live-web OPEN-BOOK over-refusal gold and re-running arm B. Verdict ceiling = a SCOPED sensitivity-only certificate or a clean DOES-NOT-WORK (full WORKS is out of reach -- arm A / false-uphold is structurally void on-distribution). Sonnet-default ships regardless; the Haiku-first flip stays deferred.

- [x] **OBG-01**: A live-web OPEN-BOOK over-refusal gold is built whose evidence is gathered by an INDEPENDENT live-web search (the same class the voter runs) on the Claude session pool -- NOT from training knowledge, and NOT via Copilot web search (cost ruling).
- [x] **OBG-02**: Each gold item carries a two-field record -- a retrieval / groundedness field (logged canonical URLs + verbatim quoted spans + fetched_at) and a verdict / validity field (an AVeriTeC 4-way adjudication label mapped to the frozen binary).
- [x] **OBG-03**: Leakage is bounded -- a meta-source blocklist excludes the claim's own published fact-check / leaderboards / dataset pages; retrieval timestamps are pinned and the gold's evidence snapshot is frozen (snapshot / time-drift that cannot be closed is a named PROVISIONAL limit).
- [x] **OBG-04**: The gold is adjudicated by the FROZEN out-of-family OOF all-agree pair (gpt-5.5 + gemini-3.1-pro-preview, --effort high, gold-blind) judging over the logged evidence; OOF non-unanimity excludes the item from the binary denominator and routes it to the human (Guerdan rating-indeterminacy).
- [x] **OBG-05**: The over-refusal arm is RE-RUN by re-scoring the FROZEN Sonnet voter votes against the new open-book gold over the reused frozen 30 controls -- no new voter votes and no re-harvest; the re-adjudication is two-sided (it may confirm a refute as correct or surface a missed false-uphold).
- [x] **OBG-06**: The new open-book gold + lock rule (the re-confirmed N, the CP estimator, the two-sided guard, the snapshot) are PRE-REGISTERED and frozen BEFORE any re-scored vote; no optional stopping; the two arms are never pooled.
- [x] **OBG-07**: The frozen over-refusal CP gate is applied byte-identical (CP-upper of the over-refusal rate <= TAU_OR 0.15 over the open-book-confirmed denominator), yielding a SCOPED sensitivity-only certificate, a clean DOES-NOT-WORK, or an honest VOID -> RAISE; full WORKS is not claimed; Sonnet-default ships; the Haiku-first flip stays deferred.
- [x] **OBG-08**: Copilot AI Credits are minimized -- batched closed-book OOF judgment over tightly-packaged evidence + reuse-30 + a human-authorized 1-2 item pre-flight cost spike that HALTs + RAISEs if the per-item cost is significantly above the disclosed estimate.
- [x] **OBG-09**: Every script that runs or is used by an LLM task is code-reviewed AND covered by code-reviewed unit tests; the eval tree never ships (the one-directional eval -> runtime import boundary holds).

### Parity / Eval (PAR) -- Phase 22 deep-research skill eval + built-in parity

Derived 2026-06-22 (the ROADMAP Phase-22 "Requirements: TBD -- run /gsd-plan-phase 22 to derive"). A holistic, system-level LLM-as-judge parity eval (NOT the per-component Clopper-Pearson certification that structurally VOIDed across Phases 18-21): establish that the shipped `lz-deep-research` skill on Sonnet produces research at quality EQUIVALENT to Claude Code's blessed built-in `/deep-research`. Two tracks -- ARCHITECTURAL parity (documented) + MEASURED parity (graded on a frozen holistic rubric, factual/citation anchored on expert-labeled benchmark gold). ZERO out-of-family (Copilot/GPT/Gemini) spend inside the eval; the eval tree never ships. The Sonnet-default skill ships regardless of the outcome (confidence / operating-envelope work, never a ship gate). Family ratified from the 22-RESEARCH.md proposal; the 8 IDs map onto the 6 ROADMAP Phase-22 success criteria.

- [x] **PAR-01**: A frozen, timestamped pre-registration (`eval/lz-eval-parity-prereg.md` + `Object.freeze`d constants) commits the 5-dimension rubric, both question lists (the Slice-A AVeriTeC seed list + the Slice-B natural set), the verdict-collapse map, the judge-calibration MCC bar, the RESOLVED D-14 Slice-A feasibility gate (FEASIBLE), and the D-14 fallback rule BEFORE any grading; an anti-drift test asserts the prose matches the constants byte-for-byte. -- COMPLETE (Phase 22 Plan 04; freeze commit ae7294d at 2026-06-22T20:23:01Z is the pre-registration timestamp of record per D-20; anti-drift test 8/8 FILE-form, discrimination-proven).
- [ ] **PAR-02**: The Opus judge is calibrated through the existing MCC machinery (`lz-eval-mcc.mjs`) over WiCE (incl. `partially_supported` subtle-overreach) + LLM-AggreFact (de-dup vs WiCE; verbatim-only fetch), closed-book, and CLEARS the pre-registered MCC bar BEFORE grading any report; an uncalibrated judge is a DISQUALIFIER, never a silent default.
- [ ] **PAR-03**: The built-in `/deep-research` baseline is captured headless (n=2-3 questions x k=2 runs) into the gitignored run dir with a MANIFEST pinning the CC version + model from `system/init`, the workflow surface, the report.md path, and per-run cost; lz-deep-research is captured the same way in the same reset window. END-STATE grading; per-run spread reported; never average across CC versions.
- [ ] **PAR-04**: The Opus judge grades each report on the 5 Anthropic dimensions, per-dimension isolated, 0.0-1.0 + pass/fail (>= 0.7 default) + an "Unknown" escape hatch, using the claim-extraction bridge (D-12) for the factual/citation dimensions (extract claims+citations, score each against the report's OWN cited evidence), with blinding + mandatory position-swap (win only if both orders agree) + k=3-5 multi-sample at temp 0; NEVER a Sonnet judge on the factual/citation dimensions.
- [ ] **PAR-05**: The two-layer verdict is emitted mechanically (off-model, frozen constants): the absolute quality FLOOR (the Sonnet skill passes factual AND citation on EVERY frozen question) + the comparative PARITY bar (D-07: zero clear LOSS on factual/citation, <= 1 clear LOSS across the rest), reported as raw per-cell verdicts per-direction, never only the aggregate, resolving to PARITY / SCOPED-PARITY / NAMED-GAP -- never a ship gate (D-03).
- [ ] **PAR-06**: Slice A (AVeriTeC, judge-free) scores the verify-voter verdict-vs-gold DETERMINISTICALLY per-confusion-matrix-direction (never pooled), collapsing the 4-way label to `unrefuted|refuted` (exclude Conflicting/Cherry-picking, hold out NEI), honoring `claim_date` cutoffs, and runs DESCRIPTIVELY (not a pass/fail cert) ONLY if it clears the PAR-01-frozen feasibility gate (RESOLVED FEASIBLE; else the D-14 calibration-probe fallback applies); the 2020-dating + topical-narrowness limits are recorded as PROVISIONAL.
- [x] **PAR-07**: The architectural-parity write-up documents the built-in's design (votes-on-claims + adversarial cross-review + drops non-survivors -> collapses uncertainty) vs lz-deep-research's preserve-uncertainty design (first-class Contested/Unsupported + non-unanimity human abstention + disconfirming search + source-independence weighting + the two-assurance distinction), explicitly flagged docs-grounded (the built-in source is closed), citing Anthropic's holistic-eval philosophy.
- [ ] **PAR-08**: Every eval SCRIPT is code-reviewed AND covered by code-reviewed unit tests, and every PROMPT/REFERENCE that steers an LLM task (the judge rubric prompt, the claim-extraction prompt, the baseline-capture driver, the architectural-parity write-up) is content-reviewed BEFORE it drives an LLM task OR ships; the eval tree NEVER ships (the one-directional eval -> runtime import boundary holds; jstat pinned in `eval/` only). -- PARTIAL: the 22-03 architectural-parity write-up AND (Plan 22-04) the pre-registration + session-driver content-review portions are met (content-reviewed/approved); the phase-wide gate -- all eval scripts + tests + the 22-05 judge rubric / claim-extraction prompts -- closes in 22-05.

### Envelope / judge-free confidence (ENV) -- Phase 23 successor to the terminated Phase-22 measured track

Derived 2026-09-06 from the `/gsd-explore` option-space mapping (three parallel research passes -> synthesis; full diagnosis in `.planning/notes/phase-22-diagnosis-two-root-causes.md`). Phase 22's measured-parity track terminated at the Stage-2 judge gate. The diagnosis is that Phases 19-22 share TWO root causes, not four: CONSTRUCT (closed-book gold cannot certify an open-book system -- and relocating that gold to the grader's CALIBRATOR did not escape it, since short-claim-to-long-form transfer collapses from AUROC 0.90 to 0.53) and POWER (a point-estimate MCC gate at n=60 false-fails ~47% of the time against a judge sitting at its own bar, and raising n does not fix it). This family therefore selects only confidence sources structurally immune to both: **no cross-construct gold, and no claim requiring statistical power this n cannot supply.** The enabling reframe is that the gold requirement was always downstream of the JUDGE requirement -- remove the judge and D-18's "gold from free expert-labeled datasets" constraint stops binding, because there is nothing left to anchor. The Sonnet-default skill ships regardless (D-03); this is confidence / operating-envelope work, never a ship gate.

- [ ] **ENV-01**: A FRESH, timestamped pre-registration is frozen and committed in its OWN commit BEFORE any capture, vote, or score, carrying: the bars, the scripts, the item lists, the ENV-04 contamination disclosure, the Phase-23 termination clause, and the explicit advance statement that no significance claim is reachable at n<=5 (two-sided sign-test minimum 2 x 0.5^5 = 0.0625; a perfect 5-for-5 sweep yields only a 95% Clopper-Pearson lower bound of 0.549). It does NOT reuse, amend, or re-open Phase 22's pre-registration, and no subgroup figure from the Phase-22 data may authorize any spend.
- [ ] **ENV-02**: Every captured report used in ANY reading carries a `validateManifest`-passing MANIFEST pinning the CC version, the resolved model, and per-run cost; `extractSystemInit` is fixed so a version can be pinned from a real `system/init` event (Phase-22 security T-22-06 / validation B1). A report without a passing MANIFEST is NOT admissible. This closes the Phase-22 gap in which zero MANIFEST files existed on disk despite PAR-03/D-15 requiring one per run.
- [ ] **ENV-03**: Slice A runs judge-free: the verify-voter is scored against the frozen AVeriTeC seed list (claim text + `claim_date` cutoff only, every leaky gold field stripped), tallied PER CONFUSION-MATRIX DIRECTION and NEVER pooled, reported DESCRIPTIVELY and never as a pass/fail cert, with the PROVISIONAL limits recorded alongside the read: uniform 2020 `claim_date`, topical narrowness (~34% US-2020 politics, ~21% COVID), and the evidence-set mismatch between a 2020-labeled gold and a live-2026-web voter. Item yield is re-verified at ZERO spend from the on-disk cache before any voter is spawned.
- [ ] **ENV-04**: A DETERMINISTIC citation audit runs over every admissible report, reporting link/identifier resolvability, verbatim-quote match against the fetched source, uncited-claim count, and unique-source count per system. The citation-format normalization is frozen BEFORE any rate is computed -- the two systems cite differently (the built-in uses numbered references to arXiv identifiers in prose; lz uses full inline URLs), so a format-sensitive metric would silently favour lz. The pre-registration states the exploration-time contamination (the designing session saw the q1 pair) and either freezes this metric's bar on fresh q2/q3 captures or discloses the contamination explicitly.
- [ ] **ENV-05**: A capture-feasibility SPIKE is run BEFORE committing to any head-to-head grading: one built-in `/deep-research` capture attempt on a frozen question, to settle whether a capture completes inside one 5-hour pool window. This is the live risk, not item count -- the Phase-22 built-in q1 capture required THREE resume cycles and an earlier attempt hit a billing limit. The spike's result GATES ENV-06 and is itself a publishable finding about the reference system's operating envelope.
- [ ] **ENV-06**: CONDITIONAL on ENV-05 clearing -- head-to-head grading runs blinded, position-swapped (a win recorded only when BOTH orderings agree), per-dimension, over the captured pair(s), against the built-in as a MODEL-AUTHORED reference baseline (the field norm: DeepResearch Bench RACE, DeepConsult). Any judge agreement measured is REPORTED as a disclosed limitation, NEVER used as a disqualifier gate; if a calibration gate is used at all it keys on a LOWER-BOUND CI, never a point estimate. NO third judge instrument is calibrated against the Phase-22 bar. The per-dimension read is reported as weaker than the system-level one (pairwise preference is held valid at system level; metric-level assessment is held to require expert metric-wise annotation).
- [ ] **ENV-07**: The phase publishes an OPERATING ENVELOPE -- the region where lz-deep-research's output is evidenced versus the region routed to a human -- together with an explicit, named statement of what was NOT established and why. It resolves under exactly one of the three pre-registered terminations (MEASURED / NOT-ESTABLISHABLE-BY-METHOD / NOT-ATTEMPTED-BY-BUDGET). A NOT-ESTABLISHABLE termination is a COMPLETED phase, not a gap, and `/gsd-audit-milestone` closes it as such. No significance claim is made. Never a ship gate (D-03).
- [ ] **ENV-08**: Every eval SCRIPT is code-reviewed AND covered by code-reviewed unit tests, and every PROMPT/REFERENCE that steers an LLM task is content-reviewed BEFORE it drives an LLM task OR ships (PROJECT.md "Review before use or publication"); ZERO out-of-family spend and no maintainer-authored gold; the eval tree NEVER ships (the one-directional eval -> runtime import boundary holds).

## Release Requirements (handled during `/gsd-complete-milestone`)

Satisfied at milestone completion -- AFTER `/gsd-audit-milestone` passes -- so any audit findings can be resolved before publishing. These are NOT mapped to build phases; the roadmapper does not cover them.

- [ ] **REL-01**: The version is bumped atomically across all six surfaces (plugin.json + the four existing SKILL.md `version:` fields + the new SKILL.md `version:` field) from 2.0.0 to 2.1.0.
- [ ] **REL-02**: `CHANGELOG.md` gets a `[2.1.0] ### Added` entry and the README is updated (a fifth-skill row + a current-version-only "What's New 2.1.0").
- [ ] **REL-03**: `git tag v2.1.0` is created and a GitHub Release is published (push / publish intent confirmed with the user at completion time).

## v2 Requirements

Acknowledged but deferred -- not in this milestone's roadmap.

### Scaling and ingestion

- **SCALE-01**: A nested "phase-runner" subagent for context-scaling beyond flat fan-out (refinement, not the spine).
- **SCALE-02**: Multimodal / PDF / CSV source ingestion (beyond HTML/text web sources).
- **SCALE-03**: Crash-resumability beyond checkpointed reruns from immutable wave inputs (a full manifest-cursor state machine).

### Aggregation depth

- **AGGX-01**: Stronger semantic / paraphrase dedup (currently lexical with number-word normalization; deeper paraphrase merging is deferred to avoid an embedding dependency).

## Out of Scope

Explicitly excluded. Documented to prevent scope creep and to record the anti-features the research flagged.

| Feature | Reason |
|---------|--------|
| Bedrock / Vertex / Foundry providers | WebSearch is hidden on Bedrock and `--permission-mode auto` is off-by-default on Bedrock/Vertex; Anthropic first-party API is the pinned floor (scope decision 1). |
| `workflows/` dynamic-workflow component | A plugin cannot ship a `workflows/` directory; dynamic workflows live only in user/project `.claude/workflows/`. |
| Agent teams | Experimental flag, ~7x overhead, headless-incompatible -- breaks the `claude -p` UAT path. |
| A third Opus "split-tally" verification gate | "Launders noisy votes into authority"; two Opus gates is the adjudicated maximum. |
| Shared appendable JSONL ledger written by parallel workers | Windows / Git-Bash race-condition magnet; use immutable per-worker files + a deterministic merge instead. |
| Full orchestrator-worker token blowup (~15x naive multi-agent) | Violates the load-bearing "Sonnet cost" promise; the whole design exists to avoid it. |
| Embedding / semantic-dedup runtime dependency | Violates the zero-external-dependency constraint. |
| Top-level `bin/` for the aggregator | `bin/` is for user-facing PATH executables; the aggregator is a skill-internal helper and belongs in `skills/lz-deep-research/scripts/` (verified 2026-06-15). |
| Out-of-family (Copilot/GPT/Gemini) model spend inside the Phase-22 parity eval | D-18: ZERO OOF spend inside the eval; gold comes only from free expert-labeled public datasets, never the maintainer or a metered OOF model. |
| A per-component Clopper-Pearson certification of the Phase-22 parity eval | D-01: that bar exceeds the blessed reference's own and structurally VOIDED across Phases 18-21; Phase 22 is a holistic system-level LLM-as-judge parity eval, not a pass/fail CP cert. |

## Traceability

Which phase covers which requirement. Filled in during roadmap creation (2026-06-15) and revised the same day (gating eval moved early to Phase 18; EVAL-05 added). The original 32 v2.1.0 phased requirements map to Phases 16-20; Phase 21 (the RAISE, added 2026-06-21) adds the 9-item OBG family; Phase 22 (the parity eval, added 2026-06-22) adds the 8-item PAR family, for 49 phased requirements total.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AGG-01 | Phase 16 | Complete |
| AGG-02 | Phase 16 | Complete |
| AGG-04 | Phase 16 | Complete |
| AGG-06 | Phase 16 | Complete |
| VERIF-04 | Phase 16 | Complete |
| PIPE-07 | Phase 17 | Complete |
| VERIF-06 | Phase 17 | Complete |
| VERIF-01 | Phase 18 | Complete |
| VERIF-02 | Phase 18 | Complete |
| VERIF-03 | Phase 18 | Complete |
| COST-02 | Phase 18 | Complete |
| EVAL-01 | Phase 19 | Pending |
| EVAL-02 | Phase 19 | Pending |
| EVAL-03 | Phase 18 | Complete |
| EVAL-04 | Phase 19 | Pending |
| EVAL-05 | Phase 18 | Complete |
| PIPE-03 | Phase 19 | Pending |
| PIPE-04 | Phase 19 | Pending |
| PIPE-05 | Phase 19 | Pending |
| AGG-03 | Phase 19 | Pending |
| PIPE-01 | Phase 20 | Pending |
| PIPE-02 | Phase 20 | Pending |
| PIPE-06 | Phase 20 | Pending |
| PIPE-08 | Phase 20 | Pending |
| PIPE-09 | Phase 20 | Pending |
| VERIF-05 | Phase 20 | Complete |
| AGG-05 | Phase 20 | Pending |
| COST-01 | Phase 20 | Pending |
| COST-03 | Phase 20 | Pending |
| COST-04 | Phase 20 | Pending |
| INTEG-01 | Phase 20 | Complete |
| INTEG-02 | Phase 20 | Complete |
| OBG-01 | Phase 21 | Complete |
| OBG-02 | Phase 21 | Complete |
| OBG-03 | Phase 21 | Complete |
| OBG-04 | Phase 21 | Complete |
| OBG-05 | Phase 21 | Complete |
| OBG-06 | Phase 21 | Complete |
| OBG-07 | Phase 21 | Complete |
| OBG-08 | Phase 21 | Complete |
| OBG-09 | Phase 21 | Complete |
| PAR-01 | Phase 22 | Complete (22-04: eval/lz-eval-parity-prereg.md + eval/lz-eval-parity-driver.md + eval/lz-eval-parity-prereg.test.mjs; freeze commit ae7294d at 2026-06-22T20:23:01Z = the pre-registration timestamp of record D-20; anti-drift 8/8 FILE-form, discrimination-proven) |
| PAR-02 | Phase 22 | Pending (harness landed 22-02: lz-eval-judge-calibration.mjs; behavioral calibration is the 22-05 spend) |
| PAR-03 | Phase 22 | Pending (harness landed 22-02: lz-eval-baseline-manifest.mjs; behavioral capture is the 22-05 spend) |
| PAR-04 | Phase 22 | Pending |
| PAR-05 | Phase 22 | Pending |
| PAR-06 | Phase 22 | Pending (harness landed 22-02: lz-eval-sliceA-gold.mjs; behavioral Slice-A run is the 22-05 spend) |
| PAR-07 | Phase 22 | Complete (22-03: eval/lz-eval-parity-architecture.md authored + content-reviewed/approved; docs-grounded built-in-vs-lz preserve-vs-collapse contrast; commit 780fc35) |
| PAR-08 | Phase 22 | Pending (partial: the 22-03 architectural-parity write-up AND the 22-04 pre-registration + session-driver content-review portions are content-reviewed/approved; the phase-wide gate -- all eval scripts + tests + the 22-05 judge/claim-extraction prompts -- closes in 22-05) |
| ENV-01 | Phase 23 | Pending |
| ENV-02 | Phase 23 | Pending |
| ENV-03 | Phase 23 | Pending |
| ENV-04 | Phase 23 | Pending |
| ENV-05 | Phase 23 | Pending |
| ENV-06 | Phase 23 | Pending (CONDITIONAL on the ENV-05 capture-feasibility spike clearing) |
| ENV-07 | Phase 23 | Pending |
| ENV-08 | Phase 23 | Pending |

Release requirements (REL-01..03) are handled during `/gsd-complete-milestone`, not mapped to build phases.

**Coverage:**
- v2.1.0 phased requirements: 57 total (32 original + 9 OBG / Phase 21 RAISE + 8 PAR / Phase 22 parity eval + 8 ENV / Phase 23 judge-free confidence)
- Mapped to phases: 57 (100% -- no orphans, no duplicates)
- Unmapped: 0
- Release requirements (completion-gated, not phased): 3

**Per-phase counts:** Phase 16 = 5 (AGG-01/02/04/06, VERIF-04); Phase 17 = 2 (PIPE-07, VERIF-06); Phase 18 = 6 (VERIF-01/02/03, COST-02, EVAL-03/05); Phase 19 = 7 (PIPE-03/04/05, AGG-03, EVAL-01/02/04); Phase 20 = 12 (PIPE-01/02/06/08/09, VERIF-05, AGG-05, COST-01/03/04, INTEG-01/02); Phase 21 = 9 (OBG-01..09); Phase 22 = 8 (PAR-01..08); Phase 23 = 8 (ENV-01..08). 5 + 2 + 6 + 7 + 12 + 9 + 8 + 8 = 57. (REVISED 2026-06-16: EVAL-01/02/04 re-mapped Phase 18 -> 19 -- the definitive gating eval relocated to the Phase-19 staged autonomous-search pilot after the standalone synthesized-overreach gate VOIDed via saturation; the Phase-18 eval machinery is built and reused. AMENDED 2026-06-21: Phase 21 RAISE added; the 9-item OBG family derived from the goal + 21-CONTEXT.md. AMENDED 2026-06-22: Phase 22 parity eval added; the 8-item PAR family derived from the goal + 22-CONTEXT.md + 22-RESEARCH.md. AMENDED 2026-09-06: Phase 23 added after the Phase-22 measured track terminated; the 8-item ENV family derived from the `/gsd-explore` option-space mapping + `.planning/notes/phase-22-diagnosis-two-root-causes.md`.)

---
*Requirements defined: 2026-06-15*
*Last updated: 2026-06-15 -- traceability REVISED by roadmapper: gating eval moved EARLY (Phase 18, decoupled from the orchestrator), EVAL-05 (Haiku prompt-engineering research precedes any Haiku agent) added, EVAL-03 kill-path raised to the user. All 32 phased requirements mapped to Phases 16-20 (100% coverage). REL-01..03 left completion-gated.*
*Updated 2026-06-16 -- Phase 18 COMPLETE (verified): VERIF-01/02/03, COST-02, EVAL-03, EVAL-05 met. EVAL-03 achieved via RAISE (the standalone synthesized-overreach gate VOIDed via saturation; owner decided to PURSUE Haiku-first via a staged autonomous-search pilot; Sonnet-default ships, Haiku OFF). EVAL-01/02/04 re-mapped to Phase 19 (the definitive eval relocated to the staged pilot). Count: Phase 18 6, Phase 19 7; 32 total unchanged.*
*Updated 2026-06-21 -- Phase 21 RAISE: the 9-item OBG family (OBG-01..09) derived from the Phase-21 goal + 21-CONTEXT.md, filling the ROADMAP "Requirements: TBD -- run /gsd-plan-phase 21 to derive". Live-web open-book over-refusal gold + arm-B re-run; ceiling = SCOPED sensitivity-only or clean DOES-NOT-WORK. Phased total 32 -> 41. Sonnet-default ships regardless; Haiku-first flip deferred.*
*Updated 2026-06-22 -- Phase 22 parity eval: the 8-item PAR family (PAR-01..08) derived from the Phase-22 goal + 22-CONTEXT.md (D-01..D-20) + 22-RESEARCH.md (PAR-* proposal + the RESOLVED D-14 feasibility gate), filling the ROADMAP "Requirements: TBD -- run /gsd-plan-phase 22 to derive". Holistic system-level LLM-as-judge parity vs the built-in /deep-research; ZERO OOF spend; the eval tree never ships; Sonnet-default ships regardless. Phased total 41 -> 49.*
*Updated 2026-09-06 -- Phase 23 judge-free confidence: the 8-item ENV family (ENV-01..08) derived from the `/gsd-explore` option-space mapping after the Phase-22 measured track terminated at the Stage-2 judge gate. Diagnosis: Phases 19-22 share TWO root causes (construct + power), not four, and Phase 22 hit both -- so ENV selects only confidence sources needing NEITHER a calibrated judge NOR closed-book gold. Carries a three-branch termination clause under which a reasoned, evidenced "not establishable by method X, here is the envelope" is a COMPLETED phase rather than a gap. ZERO OOF spend; no maintainer gold; the eval tree never ships; Sonnet-default ships regardless (D-03). Phased total 49 -> 57.*
