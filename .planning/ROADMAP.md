# Roadmap: lz-advisor

## Milestones

- **[SHIPPED] v1.0 MVP** -- Phases 1-10 (incl. 5.1-5.6), shipped 2026-06-01 at plugin 1.0.0. Full detail: [milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md). Requirements: [milestones/v1.0-REQUIREMENTS.md](milestones/v1.0-REQUIREMENTS.md). Audit: [milestones/v1.0-MILESTONE-AUDIT.md](milestones/v1.0-MILESTONE-AUDIT.md).
- **[SHIPPED] v1.0.1 No review report shorthands** -- Phases 11-13, shipped 2026-06-11 at plugin 1.0.1 (PR #1 merged). Full detail: [milestones/v1.0.1-ROADMAP.md](milestones/v1.0.1-ROADMAP.md). Requirements: [milestones/v1.0.1-REQUIREMENTS.md](milestones/v1.0.1-REQUIREMENTS.md). Audit: [milestones/v1.0.1-MILESTONE-AUDIT.md](milestones/v1.0.1-MILESTONE-AUDIT.md).
- **[SHIPPED] v2.0.0 Prefixed skill names** -- Phases 14-15 (incl. 14.1, 14.2), shipped 2026-06-14 at plugin 2.0.0 (PR #2 merged). Breaking `lz-` skill rename (de-shadow built-in `/plan` / `/review` / `/security-review`) + release. Full detail: [milestones/v2.0.0-ROADMAP.md](milestones/v2.0.0-ROADMAP.md). Requirements: [milestones/v2.0.0-REQUIREMENTS.md](milestones/v2.0.0-REQUIREMENTS.md). Audit: [milestones/v2.0.0-MILESTONE-AUDIT.md](milestones/v2.0.0-MILESTONE-AUDIT.md).
- **[IN PROGRESS] v2.1.0 lz-deep-research skill** -- Phases 16-22, started 2026-06-15. Add a fifth skill `/lz-advisor:lz-deep-research` (de-shadowing the built-in `/deep-research`): decompose -> parallel search -> fetch -> extract -> adversarial-verify -> cited report. Built bottom-up, with the Haiku prompt-engineering research + gating eval moved EARLY (right after the schema) so the voter default is settled before the workers and orchestrator are authored.

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

### [IN PROGRESS] v2.1.0 lz-deep-research skill (Phases 16-22)

**Milestone Goal:** Add a fifth skill, `/lz-advisor:lz-deep-research` (the `lz-` prefix de-shadows the Claude Code built-in `/deep-research`), that applies the advisor strategy to research: decompose a question into ~5 sub-angles, fan out parallel cheap-tier web search/fetch/extract workers, adversarially verify the top claims with isolated skeptic voters, and emit a cited report with per-claim confidence -- at ~1.2-2x single-pass Sonnet cost, not the 4-220x of naive multi-agent designs. Built bottom-up against the converged design (`.planning/research/SESSION-DESIGN.md`, triangulated across 3 model lineages + 4 empirical spikes): a deterministic off-model `scripts/` aggregator does all dedup/rank/tally/quote-recheck at zero model tokens, and the existing Opus `advisor` is consulted read-only at exactly two high-leverage gates. The build is dependency-ordered: aggregator -> schema -> Haiku-prompt research + verify-voter + early gating eval -> search/extract workers -> orchestrator+scale. The gating eval is moved EARLY (right after the schema, decoupled from the orchestrator -- it drives the voter agent directly via the existing pilot harness, needing only the aggregator tally + the vote schema + a voter prompt + a labeled dataset) so the voter default and the Haiku/Sonnet model choice for ALL cheap-tier workers is settled BEFORE any worker or the orchestrator is authored. A dedicated deep-research pass on Haiku prompt engineering PRECEDES authoring any Haiku agent, so the eval tests a fair, research-grounded Haiku prompt -- never `model: haiku` on a Sonnet prompt; if the eval shows Haiku non-viable, the decision is raised to the user (Sonnet-default ships in the interim regardless). Release/publication (version sync, CHANGELOG/README, tag + GitHub Release; REL-01..03) is handled during `/gsd-complete-milestone` AFTER `/gsd-audit-milestone` passes -- it is NOT a build phase.

- [x] **Phase 16: Deterministic off-model aggregator + validation fixture** - The zero-dependency Node `scripts/` helper that does all dedup/rank/vote-tally/quote-recheck off-model, hardened by a load-bearing validation fixture (completed 2026-06-15)
- [x] **Phase 17: JSON schema + verification contract reference** - Frozen JSON shapes, tally rubric (confidence enum), quote-recheck contract, and the two-assurance distinction that every downstream component agrees on (completed 2026-06-15)
- [x] **Phase 17.1: Address Phase 16/17 review findings (INSERTED)** - Close all Important and Suggestion findings from the 5-round lz-review audit of Phases 16-17 (aggregator validation gap AGG-1, SYNTH_CAP test gap TEST-1, determinism test gap TEST-2, schema inaccuracies SCHEMA-1/2, and all Suggestion findings) before Phase 18 authoring begins (completed 2026-06-15)
- [ ] **Phase 18: Haiku prompt-engineering deep research + verify-voter + early gating eval** - Research-ground the Haiku prompt FIRST, author the Sonnet baseline + research-grounded Haiku verify-voter variants, run the pre-registered eval, and settle the voter default (raising to the user if Haiku is non-viable) -- all isolated from the orchestrator
- [ ] **Phase 19: Search + extract worker agents** - The fetch/extract worker (immutable excerpt at fetch time) and the search worker, whose model tier is chosen from the Phase-18 Haiku research/eval outcome, each returning one-line receipts
- [ ] **Phase 20: Orchestrator skill + headless scale confirmation** - The `lz-deep-research` skill that wires the full pipeline with the already-settled voter default, reuses the Opus advisor at two gates, wave-batches the fan-out (<=5 in-flight), and is empirically confirmed at real headless concurrency
- [ ] **Phase 21: Live-web open-book over-refusal gold and arm-B re-run** - Build a live-web OPEN-BOOK over-refusal gold (adjudicators run the SAME live-web search the voter does, with per-item reasoning + bounded leakage) and re-run arm B (over-refusal) against it to validly resolve sensitivity -- the RAISE from the Plan 20-05 NOT WORKS verdict (construct mismatch surfaced after many Phase 19/20 re-plans); Sonnet-default ships regardless, the Haiku-first flip stays deferred

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

### Phase 17.3: Add GitHub Actions workflow for script tests (INSERTED)

**Goal:** Stand up CI for the bundled lz-advisor plugin scripts so `node --test` runs (and coverage is enforced) on every push/PR. Scope:

- Add a `.node-version` file in the format `lts/<lts-codename>` pinning the Node.js LTS recommended for Claude agent skill scripts.
- Add a GitHub Actions "CI" workflow with a `test` job that runs `node --test` across all bundled lz-advisor plugin scripts.
- Have the CI workflow calculate and enforce test coverage in all supported dimensions -- and, if feasible, MC/DC plus coverage of nullish-coalescing (`??`) and optional-chaining (`?.`) expressions.
- Configure a `concurrency` strategy on the workflow (group by ref/workflow with in-progress cancellation) so superseded runs on the same branch/PR are cancelled.
- Configure least-privilege `permissions` for the workflow (default-minimal `contents: read`, granting only what each job needs).
- (SCOPE EXPANSION, user-directed 2026-06-16) Add a separate `.github/workflows/test-act.yml` meta-CI workflow that runs `act` (nektos/act) against `ci.yml` inside a GitHub-hosted runner to verify and test the CI workflow itself. Narrowly triggered (paths-filtered + `workflow_dispatch`) to avoid double-running, pinned act install + runner image, same least-privilege/concurrency posture as `ci.yml`.

**Requirements**: CI-01 (Node LTS pin), CI-02 (test job + glob discovery), CI-03 (fail-closed coverage gate), CI-04 (concurrency cancel), CI-05 (least-privilege permissions), CI-06 (act meta-CI: test-act.yml runs act against ci.yml)
**Depends on:** Phase 17
**Plans:** 2/2 plans complete

Plans:

- [x] 17.3-01-PLAN.md -- Measure coverage on Node 24, add the node:coverage bootstrap pragma (D-03), then author .node-version (lts/krypton) + .github/workflows/ci.yml (SHA-pinned actions, glob test discovery, fail-closed coverage gate, concurrency, contents:read)
- [x] 17.3-02-PLAN.md -- Author repo-root .actrc (single-source pinned -P image) + .github/workflows/test-act.yml meta-CI running pinned+checksum-verified act against ci.yml (CI-06; D-11/D-12/D-13: workflow_dispatch + paths-filtered triggers, SHA-pinned checkout, -P landmine + no-drift image match, contents:read, concurrency)

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
**Requirements**: R1-1, R2-1 (Important), R2-2, R1-2, R1-3, R2-3 (Suggestion)
**Plans:** 2/2 plans complete

- [x] 17.2-01-PLAN.md -- R1-1 read-time claim-id path-safety guard in mergeClusters + .file-annotated tally safeId calls + R2-1 non-object vote-record fail-closed guard, each with a mutation-verified regression test (R1-1, R2-1, R1-3, R2-3)
- [x] 17.2-02-PLAN.md -- WR-04 label-overload relabel: AGG-1 primary on the missing-id anchors (WR-04 co-label retained for SC-4) + QR-01 on the substring caveat, across source/test/schema with a closing git grep gate (R2-2, R1-2)

### Phase 18: Haiku prompt-engineering deep research + verify-voter + early gating eval

**Goal**: The Haiku verify-voter prompt is engineered from a dedicated deep-research pass on Haiku prompt-engineering patterns (captured as a reference artifact) BEFORE any Haiku agent is authored; the Sonnet baseline verify-voter and the research-grounded Haiku verify-voter variant are then authored against the frozen vote schema; and the pre-registered gating eval (lock rule written first, false-uphold as the sole hard gate) runs standalone against the voter -- settling the Haiku-first flag, or raising the decision to the user if Haiku is non-viable. Runs isolated from the orchestrator, search, and extract workers, driven by the existing pilot harness over the Phase-16 tally + Phase-17 vote schema.
**Depends on**: Phase 16 (the aggregator tally) and Phase 17 (the frozen vote schema); decoupled from the pipeline -- proven standalone by the existing pilot harness, which needs only a voter prompt + a labeled dataset (no orchestrator/search/extract)
**Requirements**: VERIF-01, VERIF-02, VERIF-03, COST-02, EVAL-03, EVAL-05 (EVAL-01/02/04 re-mapped to Phase 19 -- the definitive gating eval relocated to the staged pilot)
**Success Criteria** (what must be TRUE):

  1. A Haiku prompt-engineering reference artifact exists, grounded in a dedicated deep-research pass over CURRENT authoritative sources (the Claude Code Guide / Claude Code Docs + web), with every load-bearing technique verified; `lz-nx-ai-plugins` `MODEL-OPTIMIZATION-HAIKU.md` is treated only as a NON-AUTHORITATIVE starting point whose details are potentially stale until verified. The Haiku verify-voter prompt under eval is demonstrably derived from the verified research -- not a Sonnet prompt run on `model: haiku` (EVAL-05). This research precedes authoring ANY Haiku agent.
  2. The verify-voter exists in a Sonnet baseline variant (the ship default) and a research-grounded Haiku variant, each casting one isolated skeptic vote with no shared context between voters, diversified by attack mode; the voter runs an explicit DISCONFIRMING search (records the disconfirming query it ran) and weights corroboration by SOURCE INDEPENDENCE (N syndicated copies of one source count as one).
  3. The lock rule -- the exact pass/kill thresholds AND the false-uphold-as-sole-hard-gate decision -- is written down BEFORE the eval runs, over a pre-registered dataset of at least 60-100 labeled claims, stratified (~40% supported / ~60% bad, about half the bad SUBTLE), covering both closed-book and open-book voting.
  4. The eval runs each claim k>=5 and reports Pass@1, Pass^k, and the per-stratum false-uphold rate.
  5. The Haiku-first flag exists, defaults OFF, and flips ON only if the research-grounded eval clears (~0 open-book false-upholds on the SUBTLE subset AND escalation kept materially below all-Sonnet, kill if escalation exceeds ~40-50%); if the eval shows Haiku non-viable, the decision is RAISED TO THE USER rather than auto-resolved, and Sonnet-default ships in the interim.

**Plans**: 5 plans (3 waves)

- [x] 18-01-PLAN.md -- EVAL-05 Haiku prompt-engineering reference artifact (deliverable 1; precedes any Haiku agent) [Wave 1]
- [x] 18-02-PLAN.md -- eval/ install surface (eval/package.json + committed lockfile pinning jstat@1.9.6, gitignore) + SC-2 re-scope + D-11 packaging-boundary test + human-verify gate on the first npm install [Wave 1]
- [x] 18-03-PLAN.md -- Deterministic eval aggregator + pre-registered lock rule: Pass@1/Pass^k + per-stratum false-uphold + Haiku-minus-Sonnet DELTA + library-computed (jstat) Clopper-Pearson upper bound + mechanical lock-rule check [Wave 2] (completed 2026-06-16)
- [x] 18-04-PLAN.md -- Zero-hand-authoring dataset loader + committed derived manifest + vendored-WiCE NOTICE (hf-CLI fetch, sha256 fail-closed, gated-401 actionable, D-02d label remap, license-compliant) [Wave 2] (completed 2026-06-16)
- [x] 18-05-PLAN.md -- Sonnet baseline + research-grounded Haiku verify-voter agents (isolated attack-mode vote, disconfirming search, source-independence) + the staged gating eval run that settles-or-raises the Haiku-first flag (EVAL-03) [Wave 3] (completed 2026-06-16)

**Phase 18 outcome (2026-06-16, VERIFIED passed):** settle-or-raise achieved via RAISE. Shipped deliverables stand: the EVAL-05 Haiku prompt-engineering reference; the eval install surface + deterministic aggregator + dataset loader; and both verify-voter agents (Sonnet ship-default, Haiku OFF behind the flag). The standalone synthesized-overreach gating eval VOIDed via saturation (Haiku 0/30 == Sonnet 0/30 -> non-discriminating), so per EVAL-03 the decision was RAISED to the owner, who chose to PURSUE Haiku-first. The definitive Haiku-vs-Sonnet test is the staged autonomous-search pilot (`18-HAIKU-PILOT.md`), carried into Phase 19 (offline known-gold harness on the search loop -- relocated EVAL-01/02/04) + Phase 20 (operational shadow/canary + audit guardrails). See `18-EVAL-GATE-CONTRADICTION.md`, `18-GATE-RECONCILIATION-CONSULTS.md`, `18-VERIFICATION.md`.

### Phase 19: Search + extract worker agents

**Goal**: The fetch/extract worker (Sonnet, stores each fetched excerpt immutably at fetch time and extracts falsifiable claims) and the search worker are authored against the frozen schema, each least-privilege, each writing immutable evidence to the run dir and returning only a one-line receipt -- with the search worker's model tier (Haiku vs Sonnet) chosen FROM the Phase-18 Haiku research/eval outcome, honoring the "deep research before any Haiku agent" constraint.
**Depends on**: Phase 18 (the Haiku-prompt research + the eval DISPOSITION -- pursue-Haiku-first-via-pilot -- which makes the search worker's tier a pilot outcome, not a pre-settled value) and Phase 17 (the frozen schema)
**AMENDED (2026-06-16):** the Phase-18 standalone gate voided via saturation; the Haiku-vs-Sonnet decision is PURSUED via a staged pilot. Phase 19 therefore ALSO builds the autonomous-search loop and its OFFLINE known-gold harness -- the first decisive read of the false-uphold gate (relocated EVAL-01/02/04): curated buried/absent/date-sensitive traps, Sonnet-below-ceiling difficulty calibration, a pre-registered Clopper-Pearson clear-rejection gate (`18-HAIKU-PILOT.md`). Also fix the 18-04 loader bugs (chenxwh/AVeriTeC is an ungated `model` repo; loader hardcodes `--repo-type dataset` + assumes gated).
**AMENDED (2026-06-19, RE-PLAN-12):** after RE-PLAN-9/10/11 DESCOPED the synthetic offline positive-control (over-refusal) arm twice (thin genuine-synthesis yield ~7/40, an unbeatable difficulty-confound, negative-EV; board-unanimous), a deep-research pass + a 2-round cross-family board CONVERGED on a STAGED path to certified WORKS. The Phase-19 OFFLINE arm (19-04) is RE-SCOPED to a confound-robust **MCC SCREEN over manual contrastive minimal-pairs** + a dual-baseline artifact guard + a PRE-REGISTERED bar -- it GATES progression but NEVER earns the word WORKS (the SDT positive-trials constraint: a valid WORKS/sensitivity verdict mathematically requires positive trials, so trap-only cannot certify; output = SCREEN-PASS / PROVISIONAL). The over-refusal CP gate MOVES OUT of 19-04 to the Phase-20 LIVE arm. The HEALTHY dense-trap false-uphold arm (Estimand A, cleared 12/12) is kept as a scoped (NOT WORKS) certification; the carried frozen primitives + EVAL_THRESHOLDS are byte-identical. 19-05 (the offline relative Haiku-MINUS-Sonnet read) is SUPERSEDED -- the Haiku-vs-Sonnet worker-tier decision is settled at the live stage. See `19-04-REPLAN-DECISION-12.md` + `19-04-CERTIFY-WORKS-RESEARCH.md`.
**Requirements**: PIPE-03, PIPE-04, PIPE-05, AGG-03, EVAL-01, EVAL-02, EVAL-04
**Success Criteria** (what must be TRUE):

  1. A search worker (model tier chosen from the Phase-18 outcome, `[WebSearch, Write]`) returns source candidates for a sub-angle, and one such worker can be dispatched per sub-angle for the fan-out.
  2. An extract worker (Sonnet, `[WebFetch, Write]`) stores each fetched source excerpt immutably at fetch time as the evidence artifact (the basis for the Phase-16 quote re-check).
  3. The extract worker extracts falsifiable claims, each bound to a verbatim quote, a stored-excerpt id, and source metadata, conforming to the frozen Phase-17 schema.
  4. Each worker writes its evidence to the run dir and returns only a one-line receipt under a char cap, so the main session never holds raw source text.
  5. (AMENDED 2026-06-19, RE-PLAN-12) The autonomous-search loop hosts the OFFLINE known-gold gating read (relocated EVAL-01/02/04). The offline read is a confound-robust SCREEN, NOT a WORKS certificate: the HEALTHY dense-trap false-uphold arm (Estimand A) reports a scoped (NOT WORKS) result, and the verdict mechanism is an MCC SCREEN over manual contrastive minimal-pairs (~12 SUPPORTED claims authored as minimal label-flipping evidence-side edits on the SAME 12 dense trap bundles -> a 24-item difficulty-matched corpus) with a PRE-REGISTERED bar (MCC point >= 0.5 AND one-sided 95% BCa lower-CI > 0 + a label-permutation test for MCC > 0) and a dual-baseline artifact guard (a lexical TF-IDF baseline + a claim-only no-evidence baseline must BOTH be at chance, else the screen AUTO-DEMOTES to a non-gating diagnostic). A guard-pass SCREEN-PASS GATES progression to the Phase-20 live operational stage; offline NEVER certifies WORKS (the SDT constraint). Sonnet-default ships regardless. (The prior framing -- the synthetic offline over-refusal arm + the offline Clopper-Pearson clear-rejection gate -- is RETIRED; the over-refusal CP gate MOVES to the live arm.) See `19-04-REPLAN-DECISION-12.md`, `18-HAIKU-PILOT.md`.

**Plans**: 5 plans (5 waves)

- [x] 19-01-PLAN.md -- Deterministic spine: the shared search-and-stop core + retrieval adapters + dateFilter/parseAvtDate + canonicalizeUrl/sourceFilename (D-09/D-13) + the surgical D-12 loader fix [Wave 1]
- [x] 19-02-PLAN.md -- The two worker agents (search [WebSearch,Write]; extract Sonnet [WebFetch,Write]) + the worker-output round-trip fixture against the frozen aggregator (PIPE-03/04/05, AGG-03) [Wave 2]
- [x] 19-03-PLAN.md -- Trap construction (buried/evidence-absent/date-sensitive over AVeriTeC seeds) + manifest/drift-gate extension + the re-registered pooled-n CP(1,N) lock rule (EVAL-01/04) [Wave 2]
- [x] 19-04-PLAN.md -- (RE-PLANNED-12) Stage 1, the OFFLINE confound-robust read: the carried frozen engine + the HEALTHY dense-trap false-uphold arm (Estimand A, scoped/NOT WORKS) + a NET-NEW MCC SCREEN over manual contrastive minimal-pairs (the MCC + BCa-bootstrap + label-permutation module + the dual-baseline artifact guard + the contrastive-screen harness) + the PRE-REGISTERED MCC bar (timestamped before authoring) -> SCREEN-PASS (gate to the live stage) or DEMOTE (offline trap-only + PROVISIONAL); the over-refusal CP gate MOVES to the live arm; the synthetic positive-control arm RETIRED (EVAL-01/02/04) [Wave 4] -- DONE 2026-06-19: Tasks 6-8 NO-SPEND build (81db062/41c2aaa/24a84ea; 389 eval-tree green; frozen primitives byte-identical); Task 9 SPEND human-confirmed -> dual-baseline guard PASS + MCC SCREEN MCC 1.0 / one-sided 95% BCa lower-CI 1.0 / label-permutation p ~0.0002 -> SCREEN-PASS (gate to Phase-20 live; offline NEVER WORKS, provisional always true); 6 Copilot calls (frozen OOF pair); over-refusal + full-WORKS + Haiku-vs-Sonnet flip = Phase-20 obligations
- [x] 19-05-PLAN.md -- SUPERSEDED-BY-RE-PLAN-12 (does not execute; record preserved): the offline relative Haiku-MINUS-Sonnet read is subsumed by the staged design -- the offline arm is the MCC SCREEN (19-04), the Haiku-vs-Sonnet worker-tier decision is settled at the live stage (Phase 20) [Wave 5]

### Phase 20: Orchestrator skill + headless scale confirmation

**Goal**: The `lz-deep-research` skill wires the full pipeline (scope-clarify -> decompose -> dispatch worker waves -> run the aggregator -> consult the Opus advisor at exactly two gates -> assemble the cited report) using the ALREADY-SETTLED voter default from Phase 18, is discoverable as `lz-advisor:lz-deep-research`, wave-batches the fan-out at <=5 in-flight, retains the gitignored run dir as the audit trail, and is empirically confirmed working as a packaged skill at real headless concurrency.
**Depends on**: Phase 19 (real search/extract producers must exist to dispatch) and Phase 18 (the settled voter default); reuses the existing Opus `advisor` and three existing references
**AMENDED (2026-06-19, RE-PLAN-12):** the LIVE/operational stage is now the PRIMARY over-refusal + full-WORKS certifier (the only stage that earns the word WORKS, per the SDT positive-trials constraint -- the Phase-19 OFFLINE MCC SCREEN GATES progression but cannot certify). On a Phase-19 SCREEN-PASS (or a DEMOTE -- the over-refusal verdict defers to the live stage either way), the live stage certifies WORKS over ADJUDICATED production-distribution SUPPORTED claims: an adjudicated production-distribution SUPPORTED-claims pipeline + PRE-REGISTERED Clopper-Pearson gates that MOVE here from the offline read (the over-refusal CP gate: CP-upper of the over-refusal rate <= TAU_OR [0.15], N_ctrl >= 24; AND carry the dense-trap false-uphold CP-upper <= TAU_FU [0.10] as a continuing monitor) + MCC / balanced-accuracy as a SECONDARY confound-robust scalar once BOTH live arms have data. WORKS = BOTH live gates pass; ONLY the live stage certifies WORKS. The Haiku-vs-Sonnet worker-tier decision (the Haiku-first flip) is settled HERE (the live stage), not in a separate offline read. The frozen EVAL_THRESHOLDS (TAU_OR 0.15 / TAU_FU 0.10 / N_CTRL_FLOOR 24) + clopperPearsonUpperOneSided + the OOF gold-decider identity carry byte-identical into the live stage. The Phase-20 PLAN is authored when Phase 20 is reached. See `19-04-REPLAN-DECISION-12.md`, `19-04-CERTIFY-WORKS-RESEARCH.md`.
**AMENDED (2026-06-20, CERTIFIED-WORKS RE-PLAN):** the 20-05 "harvest dense-SUPPORTED positives from the skill's own output" false-uphold source (D-02) is empirically INFEASIBLE (the Stage-0 harvest RAISE: ~0.33 dense-SUPPORTED/run; arm A would need ~90 runs -- `20-05-LIVE-CERT-RESULT.md`). A 3-round UNANIMOUS cross-family board DECIDED a TWO-ARM SPLIT-SOURCE cert (THE AUTHORITY: `CERTIFY-WORKS-BOARD-DECISION.md`, superseding the D-02 false-uphold source via D-21): ESTIMAND B (over-refusal) STAYS LIVE-harvested (D-02 valid for arm B; ~2.3 SUPPORTED/run, N>=30, CP-upper <= TAU_OR 0.15); ESTIMAND A (false-uphold) becomes MANUALLY-CONSTRUCTED contrastive minimal-pairs, each a minimal edit of a REAL dense bundle of the same class (N>=30, CP-upper <= TAU_FU 0.10; the 12-trap seed EXPANDED to >=30). WORKS (not merely scoped) IFF pre-registered + every trap a minimal-edit-from-a-real-bundle + a construct-validity gate passes [(d) minimal-edit MANDATORY + (a) zero-dep lexical-overlap AUC <= a pre-registered ceiling 0.60-0.65 + (b) one-sided "not-easier" difficulty SMD>0.5 + (c) optional blind audit]; shared pipeline/origin NOT required (SDT separate pools); a construct-validity fail -> a SCOPED certificate. A 10-pair pre-scale probe (>=9/10 OOF unanimity + lexical AUC; scored voter run-but-NOT-gate) gates scaling to full N. STRONG (Sonnet) certified FIRST; CHEAP (Haiku) a SEPARATE cert over the SAME frozen corpus/gold/gates with its own frozen EVAL-05 prompt + a task-fit pre-gate. FOLD IN cross-session resumability as a shipped SKILL feature (`20-RESUMABILITY-SCOPING.md`). Frozen primitives byte-identical; the two arms NEVER pooled; Sonnet-default ships regardless. 20-05 RE-AUTHORED to this methodology; the no-spend build split into 20-06 (the construct-validity machinery) + 20-07 (resumability). The lz-deep-research workflow re-architecture is DEFERRED to a later milestone. See `CERTIFY-WORKS-BOARD-DECISION.md`, `20-PATTERNS-CERTIFY-WORKS.md`, `20-CONTEXT.md` D-21.
**AMENDED (2026-06-20, ARM-A RATIFICATION / D-22):** the D-21 ARM-A minimal-edit contrastive-pair construction is SUPERSEDED (THE AUTHORITY: `CERTIFY-WORKS-RATIFICATION.md`, the original cross-family board RESUMED + RE-ASKED, UNANIMOUS 4/4). Minimal-edit pairs are infeasible on-distribution at N>=36 (dense-AND-SUPPORTED scarcity); the maintainer declines to author; model-authoring INJECTED a lexical artifact (an authored 32-pair seed scored lexical-overlap AUC 0.856 >> the 0.65 ceiling). AMENDED ARM A: harvest the skill's OWN naturally-occurring refuted-gold (Contested/Unsupported/Low) claims (~15/run, a FREE by-product of the ARM-B harvest); RETAIN as refuted-gold ONLY those the FROZEN OOF all-agree pair confirms gold-blind as "does NOT entail" (gold = the OOF read, NEVER the skill self-tag; OOF non-unanimity = the rating-indeterminacy filter -> excluded from the binary denominator + routed to the human, D-04); difficulty-match STATISTICALLY (covariate-overlap + subject-difficulty + cluster floors), NOT minimal-pairs; N_trap >= 30 (target 36), CP-upper <= TAU_FU 0.10. Construct-validity gate (d) minimal-edit is DROPPED; gates (a) lexical-AUC <= 0.65 + (b) one-sided not-easier are RE-RUN ON THE POST-OOF RETAINED SET before vote 1, jointly with the N-freeze; fail -> VOID-on-validity -> SCOPED external arm + RAISE. FULL-WORKS-eligible (C is ON-distribution). ARM B UNCHANGED. Six pre-spend locks ratified (cluster-key = source-doc/seed-within-run; gold = OOF not self-tag; floors+gates load-bearing never tuned to 36; N frozen at OOF-consensus-finish before vote 1; arms never pooled; below-floor -> documented VOID-on-power). The NO-SPEND ARM-A assembly build (`eval/lz-eval-armA-native.mjs` + the re-authored `eval/lz-eval-live-cert-driver.md` Stage 0) is DONE (2026-06-20, stub-exercised, ZERO spend); the live spend is the still-pending Plan 20-05 human-authorized boundary. See `CERTIFY-WORKS-RATIFICATION.md`, `20-CONTEXT.md` D-22.
**Requirements**: PIPE-01, PIPE-02, PIPE-06, PIPE-08, PIPE-09, VERIF-05, AGG-05, COST-01, COST-03, COST-04, INTEG-01, INTEG-02
**Success Criteria** (what must be TRUE):

  1. The user invokes `/lz-advisor:lz-deep-research <question>` and the skill clarifies scope first (interactively, or via explicit Assuming-frames in headless mode) and then decomposes the question into roughly five sub-angles before searching.
  2. The skill emits a structured written report as the deliverable, citing every reported claim inline to its source, flagging cross-source contradictions with Contested as a first-class verdict (not averaged away), and escalating verification on the union of triggers (contested split, OR load-bearing claim, OR a ~15-20% audit sample of unanimous upholds).
  3. The Opus `advisor` is consulted read-only at exactly two gates (ranking cut-line; final synthesis/calibration) over bounded curated JSON only, and the subagent fan-out is wave-batched at no more than five in-flight per wave.
  4. The skill targets the Anthropic first-party API as its platform floor (no Bedrock/Vertex degradation paths), is discoverable as `lz-advisor:lz-deep-research` (bare `/lz-deep-research`, de-shadowing the built-in `/deep-research`), and `.lz-research/` is gitignored.
  5. The `.lz-research/<run-id>/` run dir (immutable worker files, stored excerpts, votes, survivors, report) is retained after the report as the audit trail, and a packaged-skill headless run at real concurrency leaves the host stable with wave-batched (non-linear-serial) spawns.
  6. (AMENDED 2026-06-19, RE-PLAN-12) The LIVE/operational stage is the PRIMARY over-refusal + full-WORKS certifier -- the only stage that certifies WORKS (the SDT positive-trials constraint; the Phase-19 offline MCC SCREEN only GATES progression). Over ADJUDICATED production-distribution SUPPORTED claims (the only difficulty-matched-AND-real positives available), PRE-REGISTERED Clopper-Pearson gates (committed before live data accrues) decide WORKS: the over-refusal CP gate (CP-upper of the over-refusal rate <= TAU_OR [0.15], N_ctrl >= 24) -- MOVED here from the offline read -- AND the carried dense-trap false-uphold CP-upper <= TAU_FU [0.10] as a continuing monitor; MCC / balanced-accuracy is a SECONDARY confound-robust scalar once both live arms have data. WORKS = BOTH live gates pass. If WORKS clears, the Haiku-first Tier-1 voter is rolled out via the staged pilot (shadow -> canary -> Tier-1) with the unanimity-blind-spot guardrails -- elevated/targeted audit of unanimous upholds, a Sonnet mixed-tier seat, mechanical search minimums -- and a pre-committed rollback; otherwise Sonnet-default remains. The escalation net (contested + load-bearing + audit) must surface the correlated unanimous false-uphold. (The prior framing -- "if the Phase-19 offline gate cleared Haiku" -- is superseded: the offline screen gates progression, the LIVE stage certifies WORKS + settles the Haiku-first flip.) See `19-04-REPLAN-DECISION-12.md`, `18-HAIKU-PILOT.md`.

**Plans**: 7 plans (2 waves)

- [x] 20-01-PLAN.md -- additive load_bearing/escalate aggregator extension (anti-drift lockstep) [VERIF-05] [Wave 1]
- [x] 20-02-PLAN.md -- live-cert harness NO-SPEND build composing the frozen eval seams + the pre-registered live lock rule [Wave 1]
- [x] 20-03-PLAN.md -- the orchestrator SKILL.md (scope/decompose/search/extract/aggregate/verify/synthesize) [PIPE-01/02/06/08/09, COST-01/03/04, AGG-05] [Wave 1]
- [x] 20-04-PLAN.md -- INTEG-01 discoverability + INTEG-02 gitignore + the SC-5 headless scale spike [Wave 1]
- [x] 20-06-PLAN.md -- (CERTIFIED-WORKS RE-PLAN, NO-SPEND build) the construct-validity machinery: the arm-A contrastive minimal-pair authoring/adjudication harness (N>=30) + the zero-dep lexical-overlap AUC (gate a) + the one-sided difficulty SMD guard (gate b) + the 10-pair pre-scale probe + RE-AUTHOR the two pre-registration docs [COST-01] [Wave 1]
- [x] 20-07-PLAN.md -- (CERTIFIED-WORKS RE-PLAN, NO-SPEND build) cross-session resumability as a shipped SKILL feature (the <resume> slug-match UX + per-phase skip guards + decompose.json/run_state.json + the degenerate-aggregate mitigation; Opus-design + Sonnet-impl; ZERO aggregator changes) [COST-01] [Wave 1]
- [x] 20-05-ARMA-BUILD (ARM-A RATIFICATION / D-22, NO-SPEND build) -- the amended ARM-A assembly path: `eval/lz-eval-armA-native.mjs` (harvestRefutedGoldCandidates / adjudicateNativeRefutedGold OOF all-agree RETAIN gold-blind / assembleArmA covariate+difficulty+cluster guards + gates (a)/(b) on the post-OOF retained set; constructValid fold sans minimal-edit; realized smd) + the re-authored `eval/lz-eval-live-cert-driver.md` Stage 0; frozen seams imported byte-identical; FILE-form test 16/16 green, ZERO spend (see `20-05-ARMA-BUILD-SUMMARY.md`) [Wave 2 prerequisite; depends_on 20-06]
- [ ] 20-05-PLAN.md -- (RE-AUTHORED; ARM A amended per D-22) the BLOCKING human-authorized two-arm split-source live-cert spend (Stage 0 = harvest native refuted-gold + OOF all-agree RETAIN + the construct-validity gates on the retained set; STRONG-first then cheap-separate; WORKS iff construct-validity + both CP gates pass, else SCOPED; Haiku-first flip deferred) [COST-01] [Wave 2; depends_on 20-06 + 20-07 + 20-05-ARMA-BUILD]

### Phase 21: Live-web open-book over-refusal gold and arm-B re-run

**Goal**: Resolve the construct mismatch that VOIDed the over-refusal (sensitivity) certification arm, surfaced after many re-plans in Phases 19 and 20 (the 2026-06-21 Plan 20-05 live-cert verdict: NOT WORKS -> RAISE). The shared root of both certification arms is a construct mismatch -- a closed/knowledge gold (adjudicated from evidence + training knowledge, with NO live-web search) versus an open-book live-web voter. To validly resolve SENSITIVITY, build a live-web OPEN-BOOK over-refusal gold in which the adjudicators do the SAME live-web search the voter does (with per-item reasoning + bounded leakage), then re-run arm B (over-refusal) against that gold. Only then is a SCOPED sensitivity-only certificate (or a clean DOES-NOT-WORK) valid. Sonnet-default verify-voter ships regardless; the Haiku-first flip stays deferred.
**Depends on**: Phases 19 and 20 (the re-plan/verdict outcomes -- the Plan 20-05 live-cert RAISE, the frozen eval primitives + EVAL_THRESHOLDS, and the two-arm split-source methodology)
**Requirements**: OBG-01, OBG-02, OBG-03, OBG-04, OBG-05, OBG-06, OBG-07, OBG-08, OBG-09 (the Open-Book Gold family -- derived 2026-06-21 from the goal + 21-CONTEXT.md; see REQUIREMENTS.md)
**Success Criteria** (what must be TRUE):

  1. A live-web OPEN-BOOK over-refusal gold exists whose evidence was gathered by an INDEPENDENT live-web search on the Claude session pool (logged canonical URLs + verbatim quoted spans + fetched_at) -- NOT from training knowledge and NOT via Copilot web search (cost ruling).
  2. Each gold item separates groundedness (retrieval) from validity (judgment), carries an AVeriTeC 4-way label mapped to the frozen binary, and honors the meta-source blocklist + a pinned/frozen evidence snapshot.
  3. The FROZEN out-of-family OOF all-agree pair (gpt-5.5 + gemini-3.1-pro-preview, --effort high, gold-blind) adjudicates over the logged evidence; OOF-split / indeterminate items are excluded from the binary denominator and routed to the human (Guerdan).
  4. The over-refusal arm is re-run by re-scoring the FROZEN Sonnet votes against the new open-book gold over the reused frozen 30 controls (two-sided; no new votes; no re-harvest), with the gold + lock rule pre-registered and frozen before any re-scored vote (the two arms never pooled).
  5. The frozen over-refusal CP gate (CP-upper of the over-refusal rate <= TAU_OR 0.15 over the open-book-confirmed denominator) yields a SCOPED sensitivity-only certificate, a clean DOES-NOT-WORK, or an honest VOID -> RAISE; full WORKS is NOT claimed (arm A is structurally void); Sonnet-default ships regardless; the Haiku-first flip stays deferred.
  6. Copilot AI Credits are minimized (batched OOF + tight evidence packaging + reuse-30 + a human-authorized 1-2 item pre-flight cost spike that HALTs + RAISEs if significantly over estimate); every script that runs or is used by an LLM task is code-reviewed AND covered by code-reviewed unit tests.

**Plans**: 5 plans (4 waves)

- [x] 21-01-PLAN.md -- Deterministic certification core: openbook-lib (4-way->binary map, blocklist filter, kappa/Jaccard) + openbook-rescore (two-sided re-score + frozen CP gate); FILE-form tested (wave 1)
- [x] 21-02-PLAN.md -- Retrieval-log builder: read the .lz-research run dir, enforce the meta-source blocklist, freeze the evidence snapshot; FILE-form tested (wave 1)
- [x] 21-03-PLAN.md -- OOF gold driver (no-spend build): LZ_SPEND-gated, isCliEntry-guarded, two-field gold + RESIDUE routing; stub-injected FILE-form test (wave 2)
- [x] 21-04-PLAN.md -- Live-web open-book retrieval (session pool, zero Copilot) over the frozen 30 + freeze snapshot + pre-register lock-rule + independent adversarial review (wave 3, has GO/NO-GO checkpoint)
- [x] 21-05-PLAN.md -- The only metered Copilot spend: 1-2 item pre-flight cost spike (HALT+RAISE) -> full-N OOF gold -> two-sided re-score -> frozen CP verdict -> VOID-on-power-RAISE (validN 10 < 24; 75.30 AI Credits) (wave 4, autonomous:false)

## Progress

**Execution Order:**
Phases execute in numeric order: 16 -> 17 -> 17.1 -> 18 -> 19 -> 20 -> 21

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-10 (v1.0) | v1.0 MVP | 80/80 | Complete | 2026-06-01 |
| 11-13 (v1.0.1) | v1.0.1 | 13/13 | Complete | 2026-06-08 |
| 14-15 (v2.0.0, incl. 14.1, 14.2) | v2.0.0 | 4/4 | Complete | 2026-06-14 |
| 16. Aggregator + fixture | v2.1.0 | 2/2 | Complete    | 2026-06-15 |
| 17. Schema + contract | v2.1.0 | 2/2 | Complete    | 2026-06-15 |
| 17.1. Address Phase 16/17 review findings (INSERTED) | v2.1.0 | 3/3 | Complete    | 2026-06-15 |
| 18. Haiku research + voter + early eval | v2.1.0 | 5/5 | Complete    | 2026-06-16 |
| 19. Search + extract workers | v2.1.0 | 3/5 | In Progress|  |
| 20. Orchestrator + scale | v2.1.0 | 6/7 | In Progress|  |
| 21. Over-refusal gold + arm-B re-run | v2.1.0 | 5/5 | Complete | 2026-06-22 |
| 22. Deep-research skill eval + built-in parity | v2.1.0 | 4/5 | In Progress |  |

v1.0 + v1.0.1 + v2.0.0 shipped (plugin 2.0.0). **Active milestone: v2.1.0 (lz-deep-research skill)** -- Phases 16-22 (Phase 21 added 2026-06-21; Phase 22 -- deep-research eval + built-in parity -- added 2026-06-22), roadmap revised 2026-06-15 (gating eval moved EARLY to Phase 18; EVAL-05 added -- Haiku prompt-engineering research must precede authoring any Haiku agent; the search worker's model tier follows the Phase-18 outcome). Release/publication (REL-01..03) is handled during `/gsd-complete-milestone` after `/gsd-audit-milestone` passes, not as a build phase. See `.planning/MILESTONES.md` for shipped-milestone summaries and `milestones/` for full detail.

### Phase 22: Deep-research skill eval and parity baseline with built-in deep-research

**Goal**: Establish that the `lz-deep-research` skill, running on Sonnet, produces research of quality EQUIVALENT to Claude Code's blessed built-in `/deep-research` workflow -- via a holistic, system-level eval, NOT the per-component statistical certification that structurally VOIDed across Phases 18-21. The reframe matches how Anthropic itself validates `/deep-research` (per "How we built our multi-agent research system" + "Demystifying evals for AI agents"): LLM-as-judge rubrics (groundedness, coverage, citation accuracy) calibrated against EXPERT-HUMAN-LABELED datasets + end-to-end quality, trusting the multi-agent ARCHITECTURE as the correctness mechanism rather than a component error-rate gate. Two complementary tracks: (1) ARCHITECTURAL PARITY -- document that lz-deep-research's verification design (N isolated adversarial skeptic voters + disconfirming search + non-unanimity->human abstention + first-class Contested/Unsupported) meets or exceeds the built-in's (single CitationAgent + LLM-judge); (2) MEASURED PARITY -- run lz-deep-research and the built-in `/deep-research` on the SAME pre-registered question set (built-in baselines are expensive -> capped at 2-3) and grade both on a frozen holistic rubric, anchoring the factual/citation-accuracy dimension on expert-labeled benchmark datasets (AVeriTeC over its revised KS open-book = construct-matched; WiCE; LLM-AggreFact). Optionally drive the comparison through the skill-creator plugin's skill-eval + optimization workflows. Outcome: a SCOPED, defensible "Sonnet works for lz-deep-research, at parity with the blessed reference" claim + an operating envelope (reliable region vs human-routed) -- or an honest, named gap. Sonnet-default ships regardless; this is confidence / scientific-completeness work, not a ship gate.

**Constraints (settled in the pre-phase Opus-panel discussion + claude-code-guide consult, 2026-06-22)**:

- ZERO out-of-family (GitHub Copilot AI Credits) spend. Gold comes from EXPERT-LABELED public datasets (out-of-family AND free) -- never from the maintainer (declines on expertise grounds) and never from a metered OOF model. In-plan Claude models do the runs + the LLM-judge grading (note + mitigate the in-family self-preference caveat: parity is Claude-vs-Claude so the judge bias is symmetric, and the dataset labels are the out-of-family anchor for factual/citation accuracy).
- The 2-3 built-in `/deep-research` baselines + the lz-deep-research runs + the LLM-judge grading all spend the CLAUDE session pool (capped; budget across reset windows) -- a bounded, human-acknowledged cost, NOT a metered-OOF gate.
- Holistic / system-level eval, NOT a pass/fail Clopper-Pearson component certification (that bar exceeds the blessed reference's own and structurally VOIDed -- see the Phase-21 over-refusal RAISE).
- Pre-registration discipline carries: freeze the rubric + the question set + the parity bar BEFORE grading.

**Depends on**: Phases 16-20 (the shipped lz-deep-research skill) + Phase 21 (the over-refusal RAISE that motivated a parity-based, blessed-aligned proof instead of a component cert).
**Requirements**: PAR-01, PAR-02, PAR-03, PAR-04, PAR-05, PAR-06, PAR-07, PAR-08 (the Parity / Eval family -- derived 2026-06-22 from the goal + 22-CONTEXT.md D-01..D-20 + 22-RESEARCH.md; see REQUIREMENTS.md).

**Success Criteria** (what must be TRUE):

  1. 2-3 baseline research reports are produced by the built-in `/deep-research` on a frozen, pre-registered question set (capped at 2-3 for cost); lz-deep-research runs on the SAME questions.
  2. A holistic grading rubric (groundedness / coverage / citation accuracy, per Anthropic's eval guidance) is defined and FROZEN before grading; the factual/citation dimension is anchored on expert-labeled benchmark gold (AVeriTeC revised-KS open-book / WiCE / LLM-AggreFact), not on maintainer or OOF-model labels.
  3. lz-deep-research's graded quality is measured against the built-in baselines AND the expert-labeled gold, reported as a PARITY measurement + an operating envelope (reliable region vs human-routed) -- not a single pass/fail gate.
  4. The architectural-parity argument is documented (lz-deep-research verification design vs the built-in's), citing Anthropic's holistic-eval philosophy.
  5. The eval spends ZERO GitHub AI Credits; all model use is the Claude pool; the eval tree never ships (zero-dep runtime; any pinned vetted stats lib lives in eval/ only).
  6. The outcome states plainly whether Sonnet-on-lz-deep-research is at parity (scoped) or has a named gap; Sonnet-default ships regardless.

**Plans:** 5 plans (3 waves)

Plans:
**Wave 1**

- [x] 22-01-PLAN.md -- Deterministic SCORE+VERDICT core: lz-eval-parity-judge.mjs (position-swap agreement + SEM) + lz-eval-parity-verdict.mjs (two-layer floor+parity bar, frozen PARITY_BAR) [PAR-04/05] [wave 1, no-spend]
- [x] 22-02-PLAN.md -- Gold-anchoring modules: lz-eval-judge-calibration.mjs (MCC gate, D-13) + lz-eval-sliceA-gold.mjs (AVeriTeC collapse/filter/per-direction tally + frozen feasibility gate, D-11/14) + lz-eval-baseline-manifest.mjs (fail-closed CC-ver+model pin) [PAR-02/03/06] [wave 1, no-spend] -- DONE 2026-06-22 (3 modules + 3 co-tests + 1 synthetic fixture; 41 tests green, discrimination-proven; the PAR-02/03/06 BEHAVIORAL satisfaction is the Wave-3 22-05 spend)
- [x] 22-03-PLAN.md -- Architectural-parity write-up (docs-grounded built-in-vs-lz preserve-vs-collapse contrast) + content-review gate [PAR-07/08] [wave 1, no-spend] -- DONE 2026-06-22 (eval/lz-eval-parity-architecture.md, 230 lines, content-reviewed/approved; PAR-07 complete; PAR-08 partial -- this artifact's content-review portion, the phase-wide gate closes across 22-04/22-05; commit 780fc35; no-spend, zero packages)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 22-04-PLAN.md -- FREEZE the pre-registration (rubric + both question lists + collapse map + MCC bar + resolved D-14 gate + fallback + parity bar + k) + the session driver + anti-drift test; blocking content-review + timestamped freeze commit BEFORE any spend [PAR-01/08] [wave 2, no-spend gate] -- DONE 2026-06-22 (eval/lz-eval-parity-prereg.md + eval/lz-eval-parity-driver.md + eval/lz-eval-parity-prereg.test.mjs; anti-drift 8/8 FILE-form, discrimination-proven; no-OOF driver D-18; freeze commit ae7294d at 2026-06-22T20:23:01Z = the pre-registration timestamp of record D-20; PAR-01 complete; PAR-08 partial -- prereg+driver content-review met, the phase-wide gate closes in 22-05; no-spend, zero packages)

**Wave 3** *(blocked on Wave 2 completion)*

- [ ] 22-05-PLAN.md -- BLOCKING human-authorized Claude-pool spend (gated AFTER the freeze): Opus judge MCC calibration + headless built-in/lz baseline capture (n=2-3 x k=2) + per-dimension blind/swap claim-extraction grading + Slice-A descriptive run + the mechanical two-layer verdict -> 22-PARITY-RESULT.md; ZERO OOF spend [PAR-02/03/04/05/06] [wave 3, autonomous:false] -- **TERMINAL 2026-09-05, NOT complete.** The Stage-2 judge-calibration gate FAILED on both attempted instruments (Opus 4.x mcc=0.4889 / Opus 5 mcc=0.4531, against a frozen bar of MCC>=0.5 AND lowerCI>0). Per PAR-02 an uncalibrated judge is a DISQUALIFIER, so no report was graded, Stages 3-5 never ran, and `22-PARITY-RESULT.md` does NOT exist and must not be fabricated. The AMENDMENT RECORD 3 stopping rule HALTS the phase: no third instrument, no prompt revision, no widened WiCE draw, no subgroup read. The single authorized attempt is CONSUMED -- do NOT re-open this plan. PAR-02/03/04/05/06 + the PAR-08 remainder stay OPEN. Durable record: `eval/lz-eval-parity-calibration-opus5-record.md` (f288767). Closure requires a NEW phase under its OWN fresh pre-registration.
