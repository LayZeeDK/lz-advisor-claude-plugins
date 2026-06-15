# Requirements: lz-advisor

**Defined:** 2026-06-15
**Milestone:** v2.1.0 -- the `lz-deep-research` skill (decompose -> parallel search -> fetch -> extract -> adversarial-verify -> cited report)
**Core Value:** Near-Opus intelligence at Sonnet cost, achieved through strategic advisor consultation at high-leverage moments rather than running Opus end-to-end -- now extended from coding tasks to deep research.

> **Scope decisions (2026-06-15):** (1) Platform floor = Anthropic first-party API only; Bedrock/Vertex out of scope. (2) The pre-registered Haiku-first gating eval is IN scope for this milestone (Sonnet-default voters ship regardless; Haiku-first flips only if the eval clears). (3) The `.lz-research/<run-id>/` run dir is retained (gitignored) as the audit trail. (4) Release / publication (version sync, CHANGELOG/README, tag + GitHub Release) is handled during `/gsd-complete-milestone` AFTER `/gsd-audit-milestone` passes -- so audit findings can be resolved before publishing -- and is NOT a build phase. The aggregator is a skill-internal helper in `skills/lz-deep-research/scripts/`, NOT a top-level `bin/` (verified 2026-06-15).

## v1 Requirements

Requirements for the v2.1.0 milestone. Each maps to exactly one roadmap phase.

### Pipeline (PIPE) -- the deep-research spine

- [ ] **PIPE-01**: User can invoke `/lz-advisor:lz-deep-research <question>` and the skill decomposes the question into roughly five sub-angles before searching.
- [ ] **PIPE-02**: The skill clarifies scope before doing research work -- interactively when possible, or by surfacing explicit Assuming-frames in headless mode (scope clarification is a first-class step, not a silent default).
- [ ] **PIPE-03**: The skill fans out parallel web-search workers (about one per sub-angle) that each return source candidates.
- [ ] **PIPE-04**: For each fetched source, the skill stores the fetched excerpt immutably at fetch time as the evidence artifact (the basis for later quote re-checking).
- [ ] **PIPE-05**: The skill extracts falsifiable claims, each bound to a verbatim quote, a stored-excerpt id, and source metadata.
- [ ] **PIPE-06**: The final report cites every reported claim inline to its source.
- [ ] **PIPE-07**: Every reported claim carries a confidence level (High / Medium / Low / Contested / Unsupported).
- [ ] **PIPE-08**: The skill flags cross-source contradictions, with Contested as a first-class verdict (not silently dropped or averaged away).
- [ ] **PIPE-09**: The skill emits a structured written report as the deliverable.

### Verification (VERIF) -- adversarial, evidence-artifact-centric

- [ ] **VERIF-01**: Each claim selected for verification is judged by three ISOLATED skeptic voters (no shared context between voters), diversified by attack mode.
- [ ] **VERIF-02**: Each open-book voter runs an explicit DISCONFIRMING search (searches the negation, not the claim's own terms) and records the disconfirming query it ran.
- [ ] **VERIF-03**: Corroboration is weighted by SOURCE INDEPENDENCE, not raw source count (N syndicated copies of one source count as one).
- [ ] **VERIF-04**: Each claim's verbatim quote is mechanically re-checked against its stored excerpt; quotes that fail the re-check are dropped UPSTREAM of all voting.
- [ ] **VERIF-05**: Verification escalates to a stronger tier on the UNION of triggers -- any contested split, OR any load-bearing claim regardless of verdict, OR a random audit sample (~15-20%) of unanimous upholds.
- [ ] **VERIF-06**: The report distinguishes "quote verified verbatim" from "claim supported by the quote" as two separate assurances.

### Aggregation (AGG) -- deterministic, off-model

- [ ] **AGG-01**: All dedup / ranking / vote-tally / quote-re-check is performed off-model by a deterministic Node script in `skills/lz-deep-research/scripts/` (zero model tokens, reproducible, auditable).
- [ ] **AGG-02**: The aggregator runs with zero external dependencies (Node stdlib only) and is CRLF- and path-safe on Windows arm64 / Git Bash (explicit UTF-8 + LF normalization; `path.join`; no shell globbing).
- [ ] **AGG-03**: Worker subagents write evidence to the run dir and return only a one-line receipt (under a char cap); the main session never holds raw source text or raw votes.
- [ ] **AGG-04**: The aggregator is covered by a validation fixture asserting its load-bearing behaviors (fabricated quote dropped, real-but-wrong-passage downgraded, paraphrase pair not double-counted as independent, near-duplicate pair merged, named ceilings enforced).
- [ ] **AGG-05**: The `.lz-research/<run-id>/` run dir (immutable worker files, stored excerpts, votes, survivors, report) is retained after the report as the audit trail.
- [ ] **AGG-06**: Named ceilings (sub-angles ~5, max-fetch 15, max-verify-claims ~24, votes-per-claim 3, synthesis cap ~20) are enforced in code, not left to model discretion.

### Cost discipline (COST)

- [ ] **COST-01**: The Opus `advisor` is consulted read-only at exactly two gates (ranking cut-line; final synthesis / calibration), over bounded curated JSON only.
- [ ] **COST-02**: Verification voters default to Sonnet (inside the "Sonnet cost" budget); a Haiku-first Tier-1 voter exists as a config flag that is OFF until the gating eval (EVAL-*) clears it.
- [ ] **COST-03**: Subagent fan-out is wave-batched at no more than five in-flight per wave (search, fetch, verify), to avoid the disk-I/O storm and the silent ~10-concurrent platform cap.
- [ ] **COST-04**: The skill targets the Anthropic first-party API as its supported platform floor; Bedrock / Vertex / Foundry are out of scope (no degradation paths built).

### Verifier gating eval (EVAL)

- [ ] **EVAL-01**: A pre-registered evaluation dataset of at least 60-100 labeled claims exists, stratified (~40% supported / ~60% bad, with about half the bad claims SUBTLE overreach), covering BOTH closed-book and open-book voting.
- [ ] **EVAL-02**: The eval runs each claim k>=5 and reports Pass@1, Pass^k, and the false-uphold rate per stratum.
- [ ] **EVAL-03**: The Haiku-first flag is flipped ON only if the eval shows ~0 open-book false-upholds on the SUBTLE subset AND escalation fraction keeps cost materially below all-Sonnet (kill if escalation exceeds ~40-50%); otherwise Sonnet-default stays the shipping default.
- [ ] **EVAL-04**: The lock rule (the exact pass/kill thresholds and the false-uphold-as-sole-hard-gate decision) is written down BEFORE the eval runs, so the verdict cannot be rationalized post-hoc.

### Integration (INTEG)

- [ ] **INTEG-01**: The new skill is discoverable as `lz-advisor:lz-deep-research` (bare `/lz-deep-research`), de-shadowing the Claude Code built-in `/deep-research`.
- [ ] **INTEG-02**: `.lz-research/` is added to `.gitignore` as runtime scratch.

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

## Traceability

Which phase covers which requirement. Phases filled in during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| PIPE-01 | TBD | Pending |
| PIPE-02 | TBD | Pending |
| PIPE-03 | TBD | Pending |
| PIPE-04 | TBD | Pending |
| PIPE-05 | TBD | Pending |
| PIPE-06 | TBD | Pending |
| PIPE-07 | TBD | Pending |
| PIPE-08 | TBD | Pending |
| PIPE-09 | TBD | Pending |
| VERIF-01 | TBD | Pending |
| VERIF-02 | TBD | Pending |
| VERIF-03 | TBD | Pending |
| VERIF-04 | TBD | Pending |
| VERIF-05 | TBD | Pending |
| VERIF-06 | TBD | Pending |
| AGG-01 | TBD | Pending |
| AGG-02 | TBD | Pending |
| AGG-03 | TBD | Pending |
| AGG-04 | TBD | Pending |
| AGG-05 | TBD | Pending |
| AGG-06 | TBD | Pending |
| COST-01 | TBD | Pending |
| COST-02 | TBD | Pending |
| COST-03 | TBD | Pending |
| COST-04 | TBD | Pending |
| EVAL-01 | TBD | Pending |
| EVAL-02 | TBD | Pending |
| EVAL-03 | TBD | Pending |
| EVAL-04 | TBD | Pending |
| INTEG-01 | TBD | Pending |
| INTEG-02 | TBD | Pending |

Release requirements (REL-01..03) are handled during `/gsd-complete-milestone`, not mapped to build phases.

**Coverage:**
- v1 phased requirements: 31 total
- Mapped to phases: 0 (roadmap pending)
- Unmapped: 31 (filled by roadmapper)
- Release requirements (completion-gated, not phased): 3

---
*Requirements defined: 2026-06-15*
*Last updated: 2026-06-15 after initial definition for milestone v2.1.0*
