# Roadmap: lz-advisor

## Milestones

- **[SHIPPED] v1.0 MVP** -- Phases 1-10 (incl. 5.1-5.6), shipped 2026-06-01 at plugin 1.0.0. Full detail: [milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md). Requirements: [milestones/v1.0-REQUIREMENTS.md](milestones/v1.0-REQUIREMENTS.md). Audit: [milestones/v1.0-MILESTONE-AUDIT.md](milestones/v1.0-MILESTONE-AUDIT.md).
- **[SHIPPED] v1.0.1 No review report shorthands** -- Phases 11-13, shipped 2026-06-11 at plugin 1.0.1 (PR #1 merged). Full detail: [milestones/v1.0.1-ROADMAP.md](milestones/v1.0.1-ROADMAP.md). Requirements: [milestones/v1.0.1-REQUIREMENTS.md](milestones/v1.0.1-REQUIREMENTS.md). Audit: [milestones/v1.0.1-MILESTONE-AUDIT.md](milestones/v1.0.1-MILESTONE-AUDIT.md).
- **[SHIPPED] v2.0.0 Prefixed skill names** -- Phases 14-15 (incl. 14.1, 14.2), shipped 2026-06-14 at plugin 2.0.0 (PR #2 merged). Breaking `lz-` skill rename (de-shadow built-in `/plan` / `/review` / `/security-review`) + release. Full detail: [milestones/v2.0.0-ROADMAP.md](milestones/v2.0.0-ROADMAP.md). Requirements: [milestones/v2.0.0-REQUIREMENTS.md](milestones/v2.0.0-REQUIREMENTS.md). Audit: [milestones/v2.0.0-MILESTONE-AUDIT.md](milestones/v2.0.0-MILESTONE-AUDIT.md).
- **[IN PROGRESS] v2.1.0 lz-deep-research skill** -- Phases 16-20, started 2026-06-15. Add a fifth skill `/lz-advisor:lz-deep-research` (de-shadowing the built-in `/deep-research`): decompose -> parallel search -> fetch -> extract -> adversarial-verify -> cited report. Built bottom-up, with the Haiku prompt-engineering research + gating eval moved EARLY (right after the schema) so the voter default is settled before the workers and orchestrator are authored.

## Phases

<details>
<summary>[SHIPPED] v1.0 MVP (Phases 1-10) -- 2026-06-01, plugin 1.0.0</summary>

- [x] Phase 1: Plugin Scaffold and Advisor Agent
- [x] Phase 2: Plan Skill
- [x] Phase 3: Execute Skill
- [x] Phase 4: Review Skills
- [x] Phase 5: Polish and Marketplace Readiness
- [x] Phase 5.1: Advisor consultation refinements (INSERTED)
- [x] Phase 5.2: Rename skills + advisor preamble waste (INSERTED)
- [x] Phase 5.3: Field-test findings + Opus 4.7 UAT items (INSERTED)
- [x] Phase 5.4: UAT findings A-K (INSERTED)
- [x] Phase 5.5: Test #5 pipeline + proactive web-research (INSERTED)
- [x] Phase 5.6: E-runtime regression + full Compodoc UAT (INSERTED)
- [x] Phase 6: Address Phase 5.6 UAT findings
- [x] Phase 7: Address all Phase 5.x + 6 UAT findings
- [x] Phase 8: Phase 7 residuals + wip-discipline reversal + GAP-S9/S10 gap-closure
- [x] Phase 9: Rename skills (dotted `lz-advisor.<skill>` -> plain `<skill>`)
- [x] Phase 10: Milestone v1.0 documentation-hygiene cleanup

Full phase details, requirements, success criteria, and plan breakdowns are archived in [milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md).

</details>

<details>
<summary>[SHIPPED] v1.0.1 No review report shorthands (Phases 11-13) -- 2026-06-11, plugin 1.0.1</summary>

**Goal:** Review and security-review reports present findings grouped under fully spelled-out severity headlines (`### Critical` / `### Important` / `### Suggestions` / `### Questions`) instead of the `crit:`/`imp:`/`sug:`/`q:` fragment-grammar shorthands, without breaking the render-verbatim contract or the word-budget regression gates.

- [x] Phase 11: Fixture baseline -- budget smoke fixtures re-authored as tracked regression tests, green on the current grammar (GATE-01) (completed 2026-06-07)
- [x] Phase 12: Atomic grouped-grammar rewrite -- both agents + both skill render-verbatim contracts + context-packaging sync rewritten to the grouped shape in one unit, with lockstep fixture retarget and the 5-surface 1.0.0 -> 1.0.1 bump (completed 2026-06-07)
- [x] Phase 13: Empirical verification -- headless `claude -p` UAT proves the grouped grammar reaches rendered output on both review skills; SC-4 budget gate GREEN 6/6 on the final re-measure; residue + history-preservation sweep clean (GATE-02) (completed 2026-06-08)

Full phase details, success criteria, and the gap-closure trail are archived in [milestones/v1.0.1-ROADMAP.md](milestones/v1.0.1-ROADMAP.md). Final status: all 12 requirements satisfied (see the audit); non-critical deferred items recorded in STATE.md.

</details>

<details>
<summary>[SHIPPED] v2.0.0 Prefixed skill names (Phases 14-15, incl. 14.1, 14.2) -- 2026-06-14, plugin 2.0.0</summary>

**Goal:** Fix the critical built-in-command shadowing bug by prefixing all four skills with `lz-`, shipped as a breaking (MAJOR) release.

- [x] Phase 14: lz- skill rename -- all four skills `git mv`'d to the `lz-` prefix (history preserved), de-shadowing the built-in `/plan` / `/review` / `/security-review`; lockstep cross-ref sweep + GREEN `git grep` gate; bare-form de-shadow human picker-confirmed (RENAME-01..03) (completed 2026-06-13)
- [x] Phase 14.1: lz-security-review canonical severities (INSERTED) -- security-review migrated to the canonical pentest 5-tier scale Critical/High/Medium/Low/Informational + Open Questions (omit-when-empty), scoped to security-review only (SEV-AGNT-01..04, SEV-SKILL-01, SEV-FIX-01, SEV-DOC-01, SEV-SCOPE-01) (completed 2026-06-14)
- [x] Phase 14.2: Verdict scope marker label rename (INSERTED) -- `**Verdict scope:**` -> `**Verdict axis:**` across 5 surfaces, machine `scope:` token frozen byte-intact (VLABEL-01, VLABEL-02) (completed 2026-06-14)
- [x] Phase 15: v2.0.0 release & publication -- atomic 5-surface 1.0.1 -> 2.0.0 bump + CHANGELOG `[2.0.0]` migration table + README + PR #2 true merge commit + `v2.0.0` tag + GitHub Release (Latest) (REL-01..03) (completed 2026-06-14)

Full phase details, success criteria, and decision logs are archived in [milestones/v2.0.0-ROADMAP.md](milestones/v2.0.0-ROADMAP.md). Final status: all 8 in-scope + 8 inserted-scope requirements satisfied (see the audit); deferred items recorded in STATE.md.

</details>

### [IN PROGRESS] v2.1.0 lz-deep-research skill (Phases 16-20)

**Milestone Goal:** Add a fifth skill, `/lz-advisor:lz-deep-research` (the `lz-` prefix de-shadows the Claude Code built-in `/deep-research`), that applies the advisor strategy to research: decompose a question into ~5 sub-angles, fan out parallel cheap-tier web search/fetch/extract workers, adversarially verify the top claims with isolated skeptic voters, and emit a cited report with per-claim confidence -- at ~1.2-2x single-pass Sonnet cost, not the 4-220x of naive multi-agent designs. Built bottom-up against the converged design (`.planning/research/SESSION-DESIGN.md`, triangulated across 3 model lineages + 4 empirical spikes): a deterministic off-model `scripts/` aggregator does all dedup/rank/tally/quote-recheck at zero model tokens, and the existing Opus `advisor` is consulted read-only at exactly two high-leverage gates. The build is dependency-ordered: aggregator -> schema -> Haiku-prompt research + verify-voter + early gating eval -> search/extract workers -> orchestrator+scale. The gating eval is moved EARLY (right after the schema, decoupled from the orchestrator -- it drives the voter agent directly via the existing pilot harness, needing only the aggregator tally + the vote schema + a voter prompt + a labeled dataset) so the voter default and the Haiku/Sonnet model choice for ALL cheap-tier workers is settled BEFORE any worker or the orchestrator is authored. A dedicated deep-research pass on Haiku prompt engineering PRECEDES authoring any Haiku agent, so the eval tests a fair, research-grounded Haiku prompt -- never `model: haiku` on a Sonnet prompt; if the eval shows Haiku non-viable, the decision is raised to the user (Sonnet-default ships in the interim regardless). Release/publication (version sync, CHANGELOG/README, tag + GitHub Release; REL-01..03) is handled during `/gsd-complete-milestone` AFTER `/gsd-audit-milestone` passes -- it is NOT a build phase.

- [x] **Phase 16: Deterministic off-model aggregator + validation fixture** - The zero-dependency Node `scripts/` helper that does all dedup/rank/vote-tally/quote-recheck off-model, hardened by a load-bearing validation fixture (completed 2026-06-15)
- [x] **Phase 17: JSON schema + verification contract reference** - Frozen JSON shapes, tally rubric (confidence enum), quote-recheck contract, and the two-assurance distinction that every downstream component agrees on (completed 2026-06-15)
- [x] **Phase 17.1: Address Phase 16/17 review findings (INSERTED)** - Close all Important and Suggestion findings from the 5-round lz-review audit of Phases 16-17 (aggregator validation gap AGG-1, SYNTH_CAP test gap TEST-1, determinism test gap TEST-2, schema inaccuracies SCHEMA-1/2, and all Suggestion findings) before Phase 18 authoring begins (completed 2026-06-15)
- [ ] **Phase 18: Haiku prompt-engineering deep research + verify-voter + early gating eval** - Research-ground the Haiku prompt FIRST, author the Sonnet baseline + research-grounded Haiku verify-voter variants, run the pre-registered eval, and settle the voter default (raising to the user if Haiku is non-viable) -- all isolated from the orchestrator
- [ ] **Phase 19: Search + extract worker agents** - The fetch/extract worker (immutable excerpt at fetch time) and the search worker, whose model tier is chosen from the Phase-18 Haiku research/eval outcome, each returning one-line receipts
- [ ] **Phase 20: Orchestrator skill + headless scale confirmation** - The `lz-deep-research` skill that wires the full pipeline with the already-settled voter default, reuses the Opus advisor at two gates, wave-batches the fan-out (<=5 in-flight), and is empirically confirmed at real headless concurrency

## Phase Details

### Phase 16: Deterministic off-model aggregator + validation fixture
**Goal**: A reproducible, auditable Node helper performs every dedup / ranking / vote-tally / quote-vs-stored-excerpt re-check off-model (zero model tokens), enforces the named ceilings in code, runs zero-dependency on Windows arm64 / Git Bash, and is locked down by a fixture asserting its load-bearing correctness behaviors.
**Depends on**: Nothing (first phase of this milestone; hardens spike A1's proven prototype)
**Requirements**: AGG-01, AGG-02, AGG-04, AGG-06, VERIF-04
**Success Criteria** (what must be TRUE):
  1. Running `node "${CLAUDE_PLUGIN_ROOT}/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs"` against a directory of worker files produces deterministic dedup / ranking / vote-tally / quote-recheck output with zero model tokens and zero npm dependencies (Node stdlib only).
  2. The aggregator is CRLF- and path-safe on the host: it runs clean on Windows arm64 / Git Bash with explicit UTF-8 + LF normalization, `path.join`, and `fs.readdirSync` (no shell globbing).
  3. A claim whose verbatim quote fails the mechanical re-check against its stored excerpt is dropped by the aggregator UPSTREAM of any vote-tally (the drop is observable in the output before any voting is considered).
  4. The named ceilings (sub-angles ~5, max-fetch 15, max-verify-claims ~24, votes-per-claim 3, synthesis cap ~20) are enforced in code, not left to model discretion (over-ceiling input is capped by the script).
  5. The committed validation fixture asserts each load-bearing behavior and passes: fabricated quote dropped, real-quote/wrong-passage downgraded, paraphrase pair NOT double-counted as independent, near-duplicate pair merged, ceilings enforced.
**Plans**: 2 plans
- [x] 16-01-PLAN.md -- Aggregator: harden the spike into exported pure functions + thin CLI (three-way quote outcome D-05, distinct-source corroboration D-08/09, in-code ceilings D-10/11, CRLF/BOM/path-safe, zero-dep)
- [x] 16-02-PLAN.md -- Validation fixture: node:test + six committed __fixtures__ run-dirs asserting all 5 SC-5 behaviors (drop, downgrade, paraphrase-one-source, near-dup-merge, ceilings) + CRLF/BOM/determinism/zero-dep hardening

### Phase 17: JSON schema + verification contract reference
**Goal**: A single reference file freezes the JSON shapes (source / claim / vote / excerpt), the tally rubric that maps vote tallies to the confidence enum, the quote-recheck contract, the named ceilings as a contract, and the two distinct assurances -- so the aggregator, the Phase-18 eval harness, and all worker agents commit to identical shapes before any agent is authored.
**Depends on**: Phase 16 (the schema is frozen against the aggregator's proven behavior, not guessed)
**Requirements**: PIPE-07, VERIF-06
**Success Criteria** (what must be TRUE):
  1. `references/lz-deep-research-schema.md` exists and defines the JSON schemas for source, claim, vote, and stored-excerpt records, each consistent with what the Phase 16 aggregator reads and writes.
  2. The tally rubric is written down and maps every possible vote tally to exactly one confidence level from the frozen enum (High / Medium / Low / Contested / Unsupported), with refuted = downgrade-not-delete unless explicit refutation.
  3. The schema mandates that every claim record carries a confidence-level field, so a confidence level is structurally attached to each claim (not left to model discretion).
  4. The reference defines "quote verified verbatim" and "claim supported by the quote" as two SEPARATE assurance fields, so the eventual report can distinguish them rather than conflating quote-presence with entailment.
**Plans**: 2 plans
- [x] 17-01-PLAN.md -- Lockstep GA-1/D-02 aggregator correction: rewrite tally() to the Option I 5-tier enum (drop Rejected, un-fuse Low/Contested, Contested-on-split, downgrade-not-delete) + 5-label stdout line + four new per-tier fixture cases/assertions (PIPE-07)
- [x] 17-02-PLAN.md -- Write references/lz-deep-research-schema.md freezing the corrected shapes (records, tally rubric, single enum, two assurances + worked example, named-ceilings + quote-recheck + D-12 anti-drift) + reconcile 16-01-SUMMARY (PIPE-07, VERIF-06)

### Phase 17.1: Address Phase 16/17 review findings (INSERTED)

**Goal**: Close all Important and Suggestion findings from the 5-round `/lz-advisor:lz-review` audit of Phases 16-17 (aggregator source, test suite, schema reference) before Phase 18 authoring begins. The two Important source findings (AGG-1: missing `claims[].id` validation; SCHEMA-2: doc-vs-code null-guard divergence) and the two Important test gaps (TEST-1: SYNTH_CAP unasserted; TEST-2: determinism test cannot detect sort removal) are hard blockers for downstream work. Full findings documented in `.planning/phase-17.1-review-findings.md`.
**Depends on**: Phase 17 (the aggregator and schema it produced are the reviewed artifacts)
**Requirements**: Review findings AGG-1 through AGG-7, TEST-1 through TEST-9, SCHEMA-1 through SCHEMA-4 (see `.planning/phase-17.1-review-findings.md`)
**Success Criteria** (what must be TRUE):
  1. `mergeClusters` rejects a claim with a missing or empty `id` via `ContractError('claim missing non-empty id', ...)`, matching the existing `text`/`quote`/`source` guards (AGG-1).
  2. SC5-5 asserts both observable caps: `synth \d+->20` in summary, `r.survivors.length === 20`, `CEILINGS.SYNTH_CAP === 20` (TEST-1).
  3. A new or extended SC-1 test verifies cross-file-order stability (not just intra-process idempotence) -- removing `listJson`'s `.sort()` would cause a test failure (TEST-2).
  4. WR-04 test exists: `tmpRunDirWithWorker` with no claim `id` throws `/missing non-empty id/` (TEST-3, requires criterion 1).
  5. The `verified` condition in the schema's quote-recheck table reads `cited != null && cited.includes(nq)` (SCHEMA-2).
  6. The `claims[].id` schema row is updated with correct enforcement annotation (SCHEMA-1).
  7. All Suggestion findings (AGG-2 through AGG-7, TEST-4 through TEST-9, SCHEMA-3, SCHEMA-4) addressed or explicitly deferred with rationale.
  8. `node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs` passes green.
**Plans**: 3 plans (Plan D -- AGG-2 + AGG-4, observability-only -- DEFERRED to Phase 18 review per CONTEXT.md D-02)
- [x] 17.1-01-PLAN.md -- Aggregator code fixes: AGG-1 claims[].id fail-closed guard + AGG-Q1 fail-hard posture comment (D-01); AGG-3 dead-branch removal; AGG-5/6/7 ContractError .file annotation consistency in loadExcerpts + listJson (Wave 1)
- [x] 17.1-02-PLAN.md -- Test suite additions: TEST-1 SYNTH_CAP assertion + TEST-2 cross-file-order determinism (inline tmpRunDir, D-03) + TEST-3 WR-04 missing-id + TEST-4/6/7/8/9 coverage + TEST-5 temp-dir cleanup (Wave 2, depends on 17.1-01)
- [x] 17.1-03-PLAN.md -- Schema corrections: SCHEMA-1 id fail-closed promotion (post-AGG-1, references WR-04) + SCHEMA-2 null-guard + SCHEMA-3 truth-table row + SCHEMA-4 votes_ignored caveat (Wave 2, depends on 17.1-01, parallel with 17.1-02)

### Phase 17.2: Address lz-review findings for lz-deep-research aggregator (R1-1 R2-1 R2-2 R1-2 R1-3 R2-3) (INSERTED)

**Goal**: Close all Important and Suggestion findings from the 3-pass `/lz-advisor:lz-review` audit of Phases 16/17/17.1 work (aggregator source, test suite, schema reference). The two Important findings are load-bearing: R1-1 (claim `id` path-safety missing at read-time in `mergeClusters`, violating AGG-5/6/7 `.file` discipline) and R2-1 (`readJson(f).verdict` throws raw `TypeError` on literal-null vote file, bypassing ContractError). Four Suggestion findings address labeling hygiene and test coverage gaps.
**Depends on:** Phase 17.1
**Requirements**: TBD
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd-plan-phase 17.2 to break down)

### Phase 18: Haiku prompt-engineering deep research + verify-voter + early gating eval
**Goal**: The Haiku verify-voter prompt is engineered from a dedicated deep-research pass on Haiku prompt-engineering patterns (captured as a reference artifact) BEFORE any Haiku agent is authored; the Sonnet baseline verify-voter and the research-grounded Haiku verify-voter variant are then authored against the frozen vote schema; and the pre-registered gating eval (lock rule written first, false-uphold as the sole hard gate) runs standalone against the voter -- settling the Haiku-first flag, or raising the decision to the user if Haiku is non-viable. Runs isolated from the orchestrator, search, and extract workers, driven by the existing pilot harness over the Phase-16 tally + Phase-17 vote schema.
**Depends on**: Phase 16 (the aggregator tally) and Phase 17 (the frozen vote schema); decoupled from the pipeline -- proven standalone by the existing pilot harness, which needs only a voter prompt + a labeled dataset (no orchestrator/search/extract)
**Requirements**: VERIF-01, VERIF-02, VERIF-03, COST-02, EVAL-01, EVAL-02, EVAL-03, EVAL-04, EVAL-05
**Success Criteria** (what must be TRUE):
  1. A Haiku prompt-engineering reference artifact exists, grounded in a dedicated deep-research pass over CURRENT authoritative sources (the Claude Code Guide / Claude Code Docs + web), with every load-bearing technique verified; `lz-nx-ai-plugins` `MODEL-OPTIMIZATION-HAIKU.md` is treated only as a NON-AUTHORITATIVE starting point whose details are potentially stale until verified. The Haiku verify-voter prompt under eval is demonstrably derived from the verified research -- not a Sonnet prompt run on `model: haiku` (EVAL-05). This research precedes authoring ANY Haiku agent.
  2. The verify-voter exists in a Sonnet baseline variant (the ship default) and a research-grounded Haiku variant, each casting one isolated skeptic vote with no shared context between voters, diversified by attack mode; the voter runs an explicit DISCONFIRMING search (records the disconfirming query it ran) and weights corroboration by SOURCE INDEPENDENCE (N syndicated copies of one source count as one).
  3. The lock rule -- the exact pass/kill thresholds AND the false-uphold-as-sole-hard-gate decision -- is written down BEFORE the eval runs, over a pre-registered dataset of at least 60-100 labeled claims, stratified (~40% supported / ~60% bad, about half the bad SUBTLE), covering both closed-book and open-book voting.
  4. The eval runs each claim k>=5 and reports Pass@1, Pass^k, and the per-stratum false-uphold rate.
  5. The Haiku-first flag exists, defaults OFF, and flips ON only if the research-grounded eval clears (~0 open-book false-upholds on the SUBTLE subset AND escalation kept materially below all-Sonnet, kill if escalation exceeds ~40-50%); if the eval shows Haiku non-viable, the decision is RAISED TO THE USER rather than auto-resolved, and Sonnet-default ships in the interim.
**Plans**: TBD

### Phase 19: Search + extract worker agents
**Goal**: The fetch/extract worker (Sonnet, stores each fetched excerpt immutably at fetch time and extracts falsifiable claims) and the search worker are authored against the frozen schema, each least-privilege, each writing immutable evidence to the run dir and returning only a one-line receipt -- with the search worker's model tier (Haiku vs Sonnet) chosen FROM the Phase-18 Haiku research/eval outcome, honoring the "deep research before any Haiku agent" constraint.
**Depends on**: Phase 18 (the Haiku-prompt research + eval outcome dictates the search worker's model tier -- this is why search/extract are authored AFTER the Haiku research, not before) and Phase 17 (the frozen schema)
**Requirements**: PIPE-03, PIPE-04, PIPE-05, AGG-03
**Success Criteria** (what must be TRUE):
  1. A search worker (model tier chosen from the Phase-18 outcome, `[WebSearch, Write]`) returns source candidates for a sub-angle, and one such worker can be dispatched per sub-angle for the fan-out.
  2. An extract worker (Sonnet, `[WebFetch, Write]`) stores each fetched source excerpt immutably at fetch time as the evidence artifact (the basis for the Phase-16 quote re-check).
  3. The extract worker extracts falsifiable claims, each bound to a verbatim quote, a stored-excerpt id, and source metadata, conforming to the frozen Phase-17 schema.
  4. Each worker writes its evidence to the run dir and returns only a one-line receipt under a char cap, so the main session never holds raw source text.
**Plans**: TBD

### Phase 20: Orchestrator skill + headless scale confirmation
**Goal**: The `lz-deep-research` skill wires the full pipeline (scope-clarify -> decompose -> dispatch worker waves -> run the aggregator -> consult the Opus advisor at exactly two gates -> assemble the cited report) using the ALREADY-SETTLED voter default from Phase 18, is discoverable as `lz-advisor:lz-deep-research`, wave-batches the fan-out at <=5 in-flight, retains the gitignored run dir as the audit trail, and is empirically confirmed working as a packaged skill at real headless concurrency.
**Depends on**: Phase 19 (real search/extract producers must exist to dispatch) and Phase 18 (the settled voter default); reuses the existing Opus `advisor` and three existing references
**Requirements**: PIPE-01, PIPE-02, PIPE-06, PIPE-08, PIPE-09, VERIF-05, AGG-05, COST-01, COST-03, COST-04, INTEG-01, INTEG-02
**Success Criteria** (what must be TRUE):
  1. The user invokes `/lz-advisor:lz-deep-research <question>` and the skill clarifies scope first (interactively, or via explicit Assuming-frames in headless mode) and then decomposes the question into roughly five sub-angles before searching.
  2. The skill emits a structured written report as the deliverable, citing every reported claim inline to its source, flagging cross-source contradictions with Contested as a first-class verdict (not averaged away), and escalating verification on the union of triggers (contested split, OR load-bearing claim, OR a ~15-20% audit sample of unanimous upholds).
  3. The Opus `advisor` is consulted read-only at exactly two gates (ranking cut-line; final synthesis/calibration) over bounded curated JSON only, and the subagent fan-out is wave-batched at no more than five in-flight per wave.
  4. The skill targets the Anthropic first-party API as its platform floor (no Bedrock/Vertex degradation paths), is discoverable as `lz-advisor:lz-deep-research` (bare `/lz-deep-research`, de-shadowing the built-in `/deep-research`), and `.lz-research/` is gitignored.
  5. The `.lz-research/<run-id>/` run dir (immutable worker files, stored excerpts, votes, survivors, report) is retained after the report as the audit trail, and a packaged-skill headless run at real concurrency leaves the host stable with wave-batched (non-linear-serial) spawns.
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 16 -> 17 -> 17.1 -> 18 -> 19 -> 20

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-10 (v1.0) | v1.0 MVP | 80/80 | Complete | 2026-06-01 |
| 11-13 (v1.0.1) | v1.0.1 | 13/13 | Complete | 2026-06-08 |
| 14-15 (v2.0.0, incl. 14.1, 14.2) | v2.0.0 | 4/4 | Complete | 2026-06-14 |
| 16. Aggregator + fixture | v2.1.0 | 2/2 | Complete    | 2026-06-15 |
| 17. Schema + contract | v2.1.0 | 2/2 | Complete    | 2026-06-15 |
| 17.1. Address Phase 16/17 review findings (INSERTED) | v2.1.0 | 3/3 | Complete    | 2026-06-15 |
| 18. Haiku research + voter + early eval | v2.1.0 | 0/TBD | Not started | - |
| 19. Search + extract workers | v2.1.0 | 0/TBD | Not started | - |
| 20. Orchestrator + scale | v2.1.0 | 0/TBD | Not started | - |

v1.0 + v1.0.1 + v2.0.0 shipped (plugin 2.0.0). **Active milestone: v2.1.0 (lz-deep-research skill)** -- Phases 16-20, roadmap revised 2026-06-15 (gating eval moved EARLY to Phase 18; EVAL-05 added -- Haiku prompt-engineering research must precede authoring any Haiku agent; the search worker's model tier follows the Phase-18 outcome). Release/publication (REL-01..03) is handled during `/gsd-complete-milestone` after `/gsd-audit-milestone` passes, not as a build phase. See `.planning/MILESTONES.md` for shipped-milestone summaries and `milestones/` for full detail.
