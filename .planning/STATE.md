---
gsd_state_version: 1.0
milestone: v2.1.0
milestone_name: lz-deep-research skill
status: executing
stopped_at: Phase 18 COMPLETE (verified passed 2026-06-16). EVAL-03 achieved via RAISE -- the standalone synthesized-overreach gate VOIDed via saturation; owner chose to PURSUE Haiku-first via a staged autonomous-search pilot (Sonnet-default ships, Haiku OFF behind the flag). Definitive eval relocated to Phase 19 (offline known-gold harness on the search loop) + Phase 20 (operational shadow/canary + audit guardrails). Ready for Phase 19. See 18-HAIKU-PILOT.md + 18-VERIFICATION.md.
last_updated: "2026-06-16T14:30:00.000Z"
last_activity: 2026-06-16 -- Phase 18 CLOSED (verifier: passed). All 5 plans complete; EVAL-03 settle-or-raise achieved via RAISE -> owner PURSUES Haiku-first via a staged pilot (the synthesized-overreach gate VOIDed via saturation: Haiku 0/30 == Sonnet 0/30, plus query-formulation parity 1.70/1.70). Built deliverables stand (EVAL-05 reference; eval install surface + aggregator + dataset loader; both verify-voter agents -- Sonnet ship-default, Haiku OFF). EVAL-01/02/04 re-mapped to Phase 19; the staged autonomous-search pilot (offline known-gold -> shadow/canary) + the pre-registered Clopper-Pearson clear-rejection gate + the unanimity-blind-spot guardrails carry into Phase 19/20 (18-HAIKU-PILOT.md). Next: Phase 19.
progress:
  total_phases: 8
  completed_phases: 6
  total_plans: 16
  completed_plans: 16
  percent: 75
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-06-15 -- milestone v2.1.0 started)

**Core value:** Near-Opus intelligence at Sonnet cost, through strategic advisor consultation at high-leverage moments -- now extended from coding tasks to deep research
**Current focus:** Phase 19 -- Search + extract worker agents (+ the relocated offline Haiku-vs-Sonnet gating pilot, EVAL-01/02/04)

## Deferred Items

Items deferred across milestones (v1.0.1 close 2026-06-11; v2.0.0 additions tagged by category):

| Category | Item | Status | Note |
|----------|------|--------|------|
| feature-deferred (v2.0.0) | on-demand-fable-advisor | deferred | Subagent-Fable blocked server-side (Anthropic API 404 "not available, use Opus 4.8"); interactive `/model fable` works but subagent dispatch is denied. Override mechanism proven (opus->haiku via subagent JSONL). SEED-001; evidence in research/FABLE-OVERRIDE-PROBE.md. Revisit when Anthropic enables Fable for subagent dispatch. NOTE (2026-06-12): Fable 5 + Mythos 5 are now GLOBALLY suspended for all customers under a US export-control directive, so the trigger is further off than the seed records. |
| backlog-todo | research-rtk-command-suitability-for-skills-and-agents | open | Future investigation: RTK command suitability for skills/agents (plugin-tooling); out of v1.0.1 scope -- carries to backlog. |
| tech-debt (Phase 12) | dangling "Reviewer Escalation Hook" cross-ref | open | Pre-existing, out-of-scope; review-skill side IS wired, security-skill side unwired. Track as backlog. |
| tech-debt (Phase 13) | FIX-R2-D budget-gate tolerance band | moot | Recorded deferred decision; now moot -- SC-4 closed GREEN 6/6 via genuine concision, no tolerance band needed. |
| tech-debt (Phase 13) | external-repo safety branch safety/edge-aion-986dae1 (ngx clone) | open | Inert quarantine of a transient UAT stray; ngx main + user work confirmed clean. Cleanup when convenient. |

## Current Position

Phase: 18 COMPLETE (verifier: passed, 2026-06-16) -> advancing to Phase 19
Plan: 5 of 5 complete
Status: RESOLVED -- Phase 18 closed; the resolution history follows. The phase hit a locked-decision contradiction at Plan 05 Task 2. The pre-registered lock rule's sole hard gate (SUBTLE open-book false-uphold DELTA, D-07) has ZERO matching data: D-02 makes the subtle spine WiCE (closed-book) while D-05 confines open-book retrieval to AVeriTeC's KS, and D-02c excludes AVeriTeC's subtle-adjacent class -- so subtle and open-book are disjoint by construction (0 of 70 manifest rows are both). Verified: clopperPearsonUpper(0,0)=1 -> auto FAIL-RAISE. Zero votes cast, so a pre-registration amendment is still legitimate; user chose to formally RE-OPEN via /gsd-discuss-phase + targeted replan (of 18-03 lock rule + 18-05 gate semantics; 18-04 manifest only if the AVeriTeC-subtle option is taken). Recommended resolution carried in the finding (Option d: closed-book SUBTLE hard gate + AVeriTeC open-book as the leakage cross-check). Harness decided: dynamic Workflow over nested voter subagents (NOT claude -p), resumable via filesystem vote persistence, MC/DC-tested + agent-reviewed -- none built yet (paused). Full evidence + options + intent: 18-EVAL-GATE-CONTRADICTION.md. CONSENSUS REACHED (3-family unanimous over 3 executor-driven rounds: Opus + GPT-5.5 + Gemini-3.1-pro via Copilot; ~35 AI credits): resolution is NOT the closed-book amendment but GATE = programmatically synthesized subtle OPEN-BOOK traps (one-step overreach of dense-evidence AVeriTeC-Supported seeds, voted open-book vs the dated revised KS), pooled-n statistics, ceiling re-derived as clopperPearsonUpper(1, N_pooled) (~0.05 at N=60-100; legacy 0.25 retired), reliability >=15/claim kept separate, optional non-blocking native-Conflicting cross-check arm, trap generator OUTSIDE the voter families. User RATIFIED the AVeriTeC CC-BY-NC NonCommercial posture (gitignored dev-only; mutated text never committed). Earlier gate-design consensus: 18-GATE-RECONCILIATION-CONSULTS.md. FEASIBILITY PILOTS RAN (2026-06-16): traps 10/10 valid (Opus judge), but Haiku caught all on clean evidence AND on noisy top-30 retrieval (Haiku 0/30, Sonnet 0/30) -> SATURATION -> the synthesized-overreach gate VOIDed (non-discriminating); a disconfirming-query-formulation proxy was also parity (Haiku 1.70 vs Sonnet 1.70). DISPOSITION (owner decision + multiple neutral consensus rounds): PURSUE Haiku-first -- reject ONLY on clear evidence, and none was found (parity on every cheaply-testable axis, but ONLY on reasoning-over-supplied-evidence; the production silent-false-uphold axis -- autonomous search-STOPPING + date-cutoff -- remains untested). The decisive test is RELOCATED from the standalone Phase-18 gate to a STAGED AUTONOMOUS-SEARCH PILOT (unanimous plan, 18-HAIKU-PILOT.md): build the search loop ONCE -> first decisive read OFFLINE on curated KNOWN-GOLD traps (buried/absent/date-sensitive; Sonnet-below-ceiling difficulty calibration; known gold is the only instrument that sees the correlated-failure quadrant Sonnet-as-auditor is blind to) -> then live shadow -> canary -> Tier-1, with a pre-registered Clopper-Pearson clear-rejection gate + unanimity-blind-spot guardrails (elevated/targeted audit of unanimous upholds, Sonnet mixed-tier seat, mechanical search minimums, pre-committed rollback). This THREADS Phase 19 (the search loop) + Phase 20 (audit/escalation instrumentation). Phase 18 concludes as: Haiku-first PURSUED (not rejected); built deliverables stand (EVAL-05 reference, eval install surface + aggregator + dataset loader, both voter agents); the staged pilot + gate + guardrails carry into 19/20. Also found (for the 18-04 replan): chenxwh/AVeriTeC is an UNGATED model repo; the loader hardcodes --repo-type dataset + assumes gated.
Last activity: 2026-06-16 -- Plan 18-04 complete (eval/lz-eval-dataset.mjs: hf-CLI fetch into gitignored eval/.cache/ + node:crypto sha256 fail-closed + D-02d WiCE label remap to the frozen unrefuted|refuted enum (partially_supported=subtle) + actionable gated-401 HF_TOKEN pre-flight (no retry) + EVAL-01 stratify; committed eval/__fixtures__/lz-eval-manifest.json with 70 stratified examples (30 unrefuted ~43% / 40 refuted / 17 subtle), WiCE rows vendored + per-file sha256 + revision 54f7976b..., AVeriTeC/LLM-AggreFact/ExpertQA fetch-only IDs+labels+revision only; vendored eval/__fixtures__/wice-vendored/ 60 real WiCE subclaim records (ASCII-escaped) + NOTICE (ODC-BY/MIT); offline manifest/vendor drift gate fails closed at Wave 2; 15-test FILE-form gate exits 0; eval-tree 32 tests green)

### Milestone v2.1.0 roadmap (REVISED 2026-06-15)

5 phases (16-20), continuing integer numbering from the v2.0.0 milestone's final phase (15). Derived bottom-up from the converged design (`.planning/research/SESSION-DESIGN.md`); REVISED so the Haiku prompt-engineering research + gating eval run EARLY (Phase 18, right after the schema, decoupled from the orchestrator) -- the voter default and the Haiku/Sonnet model choice for ALL cheap-tier workers is settled BEFORE any worker or the orchestrator is authored. All 32 phased requirements mapped, 0 orphans, 0 duplicates. Release/publication (REL-01..03) is handled during `/gsd-complete-milestone` after `/gsd-audit-milestone` passes -- NOT a build phase.

- **Phase 16 (Deterministic off-model aggregator + validation fixture):** AGG-01, AGG-02, AGG-04, AGG-06, VERIF-04 -- the zero-dependency Node `scripts/` helper (`skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs`) does all dedup/rank/vote-tally/quote-vs-stored-excerpt re-check off-model, enforces named ceilings in code, runs CRLF/path-safe on Windows arm64 / Git Bash, and is locked down by a load-bearing validation fixture. Built first because it is the highest-risk-of-subtle-bug component and the contract everything feeds (spike A1 proven; LOW research-flag). UNCHANGED by the revision.
- **Phase 17 (JSON schema + verification contract reference):** PIPE-07, VERIF-06 -- `references/lz-deep-research-schema.md` freezes JSON shapes (source/claim/vote/excerpt), the tally rubric (confidence enum mapping, downgrade-not-delete), the quote-recheck contract, the named ceilings as a contract, and the two-assurance distinction. Frozen against the proven aggregator so the eval harness and all workers commit before authoring (LOW research-flag, contract-writing task). UNCHANGED by the revision.
- **Phase 18 (Haiku prompt-engineering deep research + verify-voter + early gating eval):** VERIF-01, VERIF-02, VERIF-03, COST-02, EVAL-01, EVAL-02, EVAL-03, EVAL-04, EVAL-05 -- MOVED EARLY (was the trailing phase). A dedicated deep-research pass on Haiku prompt engineering (captured as a reference artifact; grounded in CURRENT authoritative sources -- Claude Code Guide / Claude Code Docs + web -- every load-bearing technique verified; `lz-nx-ai-plugins` `MODEL-OPTIMIZATION-HAIKU.md` is a NON-AUTHORITATIVE starting point, details potentially stale until verified) PRECEDES authoring any Haiku agent (EVAL-05). Then author the Sonnet baseline verify-voter + the research-grounded Haiku verify-voter variant (isolated skeptic vote, disconfirming search, source-independence weighting), write the lock rule FIRST, and run the pre-registered eval (>=60-100 stratified labeled claims, both closed- + open-book, k>=5, Pass@1 + Pass^k + per-stratum false-uphold, false-uphold-as-sole-hard-gate) standalone via the existing pilot harness over the Phase-16 tally + Phase-17 vote schema. Settle the Haiku-first flag (defaults OFF); if Haiku is non-viable, RAISE THE DECISION TO THE USER (EVAL-03). Sonnet-default ships regardless. Decoupled from the orchestrator -- needs only a voter prompt + a labeled dataset, no search/extract/orchestrator. (MEDIUM/HIGH research-flag: open-book voter behavior is the cost-driving fork + the mechanism behind the named silent false-uphold; the eval verdict gates the whole Haiku-first economics.)
- **Phase 19 (Search + extract worker agents):** PIPE-03, PIPE-04, PIPE-05, AGG-03 -- the extract worker (sonnet, `[WebFetch, Write]`, stores each excerpt immutably at fetch time + extracts falsifiable claims to the frozen schema) and the search worker (`[WebSearch, Write]`), each least-privilege, each returning a one-line receipt. CRITICAL: the search worker's model tier (Haiku vs Sonnet) is decided FROM the Phase-18 Haiku research/eval outcome -- authored AFTER the Haiku research, honoring the "deep research before any Haiku agent" constraint.
- **Phase 20 (Orchestrator skill + headless scale confirmation):** PIPE-01, PIPE-02, PIPE-06, PIPE-08, PIPE-09, VERIF-05, AGG-05, COST-01, COST-03, COST-04, INTEG-01, INTEG-02 -- `skills/lz-deep-research/SKILL.md` wires the full pipeline (scope-clarify -> decompose -> dispatch waves -> aggregate -> advisor at 2 gates -> cited report) using the ALREADY-SETTLED voter default from Phase 18, wave-batches <=5 in-flight, retains the gitignored run dir, de-shadows `/deep-research`, pins the Anthropic-API floor. THIS is where full-scale headless concurrency + the packaged-skill permission path are confirmed -- the #1 build-time unknown (HIGHEST research-flag: A2 proved only n=2; needs a dedicated scale-concurrency spike with I/O-storm + silent-batching acceptance criteria, plus the packaged-skill permission re-proof).

Locked decisions: skill named `lz-deep-research` (qualified `lz-advisor:lz-deep-research`); aggregator lives in `skills/lz-deep-research/scripts/`, NOT a top-level `bin/` (verified 2026-06-15); Anthropic first-party API floor, Bedrock/Vertex out of scope (COST-04); `.lz-research/<run-id>/` retained as the audit trail; provider scope is NOT a separate phase (folded into Phase 20's headless permission path); gating eval moved EARLY (Phase 18, decoupled from the orchestrator); a Haiku prompt-engineering deep-research pass precedes authoring ANY Haiku agent (EVAL-05); if the eval shows Haiku non-viable the decision is raised to the user (EVAL-03, Sonnet-default ships in the interim); the search worker's model tier follows the Phase-18 outcome; release/publication handled at completion, not as a build phase.

### Milestone v2.0.0 roadmap (historical)

2 phases (14-15), continuing numbering from the v1.0.1 milestone's final phase (13):

- **Phase 14 (lz- skill rename):** RENAME-01..03 -- rename all four skills (`plan`/`execute`/`review`/`security-review` -> `lz-*`) via `git mv` so they no longer shadow Claude Code built-ins; lockstep cross-ref sweep + closing `git grep` gate; interactive-picker bare-form collision check (human_needed).
- **Phase 15 (v2.0.0 release & publication):** REL-01..03 -- atomic 5-surface 1.0.1 -> 2.0.0 bump + CHANGELOG `[2.0.0]` migration table + README + `git tag v2.0.0` + GitHub Release. Gated on Phase 14 verification.

Locked decisions: all four skills renamed (incl. `execute`) for suite consistency; v2.0.0 MAJOR (breaking invocation surface); Fable advisor descoped (subagent-Fable API-blocked, SEED-001).

### Milestone v1.0.1 roadmap (historical)

3 phases, continuing from the v1.0 milestone's final integer phase (Phase 10):

- **Phase 11 (Fixture baseline):** GATE-01 -- re-author the missing `D-reviewer-budget.sh` / `D-security-reviewer-budget.sh` smoke fixtures as committed, tracked tests green on the CURRENT shorthand grammar (regression gate before any change; build-order step 0).
- **Phase 12 (Atomic grouped-grammar rewrite):** RPT-01..04, AGNT-01..03, SKILL-01, SYNC-01..02 -- both agents + both skill render-verbatim contracts + context-packaging sync rewritten to the grouped spelled-out `### Critical`/`### Important`/`### Suggestions`/`### Questions` shape in one atomic unit, with lockstep fixture retarget and the 5-surface 1.0.0 -> 1.0.1 bump.
- **Phase 13 (Empirical verification):** GATE-02 -- headless `claude -p` UAT proves grouped spelled-out reports reach the rendered output on both review skills (ngx-smart-components run in a dedicated worktree off the `uat/pre-storybook-compodoc` checkpoint branch); n>=3 budget-gate run; residue + `.planning/`-history-preservation sweep.

Locked decisions: Route A (agent-emit, verbatim contract absolute); section-per-severity layout with `(none)` markers + continuous finding numbers; unified Critical/Important/Suggestion/Question vocabulary; plugin 1.0.0 -> 1.0.1.

### Historical position (v1.0 milestone -- SHIPPED 2026-06-01)

v1.0 MVP shipped at plugin 1.0.0: 16 phases, 80 plans, 187 tasks. Re-audit clean on all hard gates
(52/52 requirements, 6/6 integration, 5/5 flows, 16/16 Nyquist-complete). Milestone archived to
`milestones/v1.0-*`. Tagged `v1.0` (NOT pushed -- marketplace publication deferred per user directive).
Advisor runtime-proven on Opus 4.8. Final phase: Phase 10 (documentation-hygiene cleanup).

## Performance Metrics

**Velocity:**

- Total plans completed: 130 (v1.0 milestone, all phases)
- Average duration: -
- Total execution time: 0 hours

**By Phase (v1.0 milestone):**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 2 | - | - |
| 02 | 1 | - | - |
| 03 | 2 | - | - |
| 04 | 2 | - | - |
| 05.1 | 1 | - | - |
| 05.2 | 4 | - | - |
| 05.4 | 7 | - | - |
| 05.6 | 7 | - | - |
| 06 | 7 | - | - |
| 07 | 13 | - | - |
| 08 | 10 | - | - |
| 9 | 3 | - | - |
| 11 | 2 | - | - |
| 12 | 4 | - | - |
| 13 | 7 | - | - |
| 14 | 1 | - | - |
| 14.1 | 1 | - | - |
| 14.2 | 1 | - | - |
| 16 | 2 | - | - |
| 17 | 2 | - | - |
| 17.1 | 3 | - | - |
| 17.2 | 2 | - | - |
| 17.3 | 2 | - | - |

**By Phase (v2.1.0 milestone):**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 16 (Aggregator + fixture) | 1/2 | - | - |
| 17 (Schema + contract) | TBD | - | - |
| 18 (Haiku research + voter + early eval) | 4/5 | 45min | 11min |
| 19 (Search + extract workers) | TBD | - | - |
| 20 (Orchestrator + scale) | TBD | - | - |

**Recent Trend:**

- Last 5 plans: -
- Trend: -

*Updated after each plan completion*
| Phase 12 P12-01 | 35min | 2 tasks | 2 files |
| Phase 12 P12-02 | 10min | 2 tasks | 2 files |
| Phase 12 P12-03 | 20min | 2 tasks | 4 files |
| Phase 12 P12-04 | 9min | 2 tasks | 6 files |
| Phase 13 P01 | 6min | 3 tasks | 3 files |
| Phase 13 P02 | 35min | 3 tasks | 26 files |
| Phase 13 P03 | 12min | 3 tasks | 2 files |
| Phase 13 P04 | 18min | 3 tasks | 2 files |
| Phase 13 P05 | ~40min | 3 tasks | 33 files |
| Phase 13 P06 | ~25min | 3 tasks | 2 files |
| Phase 13 P07 | ~30min | 3 tasks | 30 files |
| Phase 14 P01 | 9min | 3 tasks | 13 files |
| Phase 14.1 P01 | 13min | 6 tasks | 5 files |
| Phase 14.2 P01 | 6min | 1 tasks | 5 files |
| Phase 16 P01 | 24min | 2 tasks | 1 files |
| Phase 16 P16-02 | 7min | 3 tasks | 98 files |
| Phase 17 P01 | 8min | 2 tasks | 20 files |
| Phase 17 P02 | 5min | 2 tasks | 2 files |
| Phase 18 P01 | 7min | 1 tasks | 1 files |
| Phase 18 P02 | 7min | 4 tasks | 7 files |
| Phase 18 P03 | 18min | 1 tasks | 16 files |
| Phase 18 P04 | ~13min | 2 tasks | 64 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table and REQUIREMENTS.md locked-decisions table.
Recent decisions affecting current work (v2.1.0):

- [v2.1.0]: Skill named `lz-deep-research` (qualified `lz-advisor:lz-deep-research`) -- the `lz-` prefix de-shadows the Claude Code built-in `/deep-research`, same rationale as the v2.0.0 `lz-` rename of plan/review/security-review.
- [v2.1.0]: The deterministic aggregator lives in `skills/lz-deep-research/scripts/` (`lz-deep-research-aggregate.mjs`), NOT a top-level `bin/` -- `bin/` is for user-facing PATH executables; a skill's deterministic helper is a bundled `scripts/` resource. Reference via `${CLAUDE_PLUGIN_ROOT}`/`${CLAUDE_SKILL_DIR}`; invoke `node "..."` (not bare). Verified 2026-06-15 (claude-code-guide live docs + plugin-dev + skill-creator, unanimous); corrects the SESSION-DESIGN/STACK `bin/` assumption.
- [v2.1.0]: Provider scope DECIDED -- Anthropic first-party API floor; Bedrock/Vertex/Foundry out of scope (COST-04). Not a separate phase; folded into Phase 20 (the headless permission path / WebSearch usage).
- [v2.1.0 / REVISED]: The Haiku gating eval is MOVED EARLY (Phase 18, right after the schema, decoupled from the orchestrator). It drives the voter agent directly via the existing pilot harness, needing only the aggregator tally (Phase 16) + the vote schema (Phase 17) + a voter prompt + a labeled dataset -- so the voter default and the Haiku/Sonnet model choice for ALL cheap-tier workers is settled BEFORE any worker or the orchestrator is authored.
- [v2.1.0 / REVISED]: NEW EVAL-05 -- a dedicated deep-research pass on Haiku prompt-engineering patterns/techniques (captured as a reference artifact; grounded in CURRENT authoritative sources -- Claude Code Guide / Claude Code Docs + web -- every load-bearing technique verified; `lz-nx-ai-plugins` `MODEL-OPTIMIZATION-HAIKU.md` is a NON-AUTHORITATIVE starting point, details potentially stale until verified) must PRECEDE authoring ANY Haiku agent (the verify-voter Haiku variant AND the Haiku search worker), so the eval tests a fair, research-grounded Haiku prompt -- never `model: haiku` on a Sonnet prompt.
- [v2.1.0 / REVISED]: EVAL-03 kill-path -- if the research-grounded eval shows Haiku non-viable, the decision (drop the Haiku variant, retain it behind the OFF flag, or invest further) is RAISED TO THE USER, not auto-resolved. Sonnet-default voters ship in the interim regardless. The Haiku-first flag flips ON only if the eval clears (~0 open-book false-upholds on the SUBTLE subset AND escalation materially below all-Sonnet).
- [v2.1.0 / REVISED]: The search worker's model tier (Haiku vs Sonnet) is decided FROM the Phase-18 Haiku research/eval outcome; search + extract workers (Phase 19) are authored AFTER the Haiku research, honoring the "deep research before any Haiku agent" constraint.
- [v2.1.0]: The Haiku-first gating eval is IN scope this milestone but decoupled from launch -- Sonnet-default voters ship regardless; the Haiku-first flag flips ON only if the eval clears (false-uphold rate as the sole hard gate, lock rule written before the run).
- [v2.1.0]: `.lz-research/<run-id>/` retained (gitignored) as the audit trail (AGG-05 / INTEG-02), not cleaned post-report.
- [v2.1.0]: Release/publication (REL-01..03: 6-surface version sync, CHANGELOG/README, tag + GitHub Release) handled during `/gsd-complete-milestone` AFTER `/gsd-audit-milestone` passes -- NOT a build phase; not mapped to any phase.
- [v2.1.0 / REVISED]: Build is dependency-ordered bottom-up (aggregator -> schema -> Haiku-research+voter+early-eval -> search/extract workers -> orchestrator+scale) -- each phase's output is the next phase's input contract; the schema is empirically grounded against the proven aggregator; the eval runs before the workers/orchestrator so the voter default is settled first; the skill comes last because full-scale headless concurrency can only be confirmed once real producers exist.
- [v2.1.0 / Phase 16 P01]: survivor record shape FROZEN as `{id, claim, sources, corroboration_lower_bound, quote_fidelity, confidence}` (Phase 17 inherits verbatim, Phase 18/20 consume). confidence vocab = `High | Medium | Low/Contested | Rejected | Unsupported` (Unsupported added for zero-readable-seats); quote_fidelity = `verified | downgraded` (dropped members excluded before tally). stdout summary is a deterministic 4-line counts-only receipt; CLI exits 0 ok / 2 on contract violation. Full output contract recorded in 16-01-SUMMARY.md for Phase 17 to freeze.
- [v2.1.0 / Phase 16 P01]: the aggregator ACTIVELY enforces MAX_VERIFY_CLAIMS(24)/VOTES_PER_CLAIM(3)/SYNTH_CAP(20) with observable caps (no silent truncation); CARRIES ANGLES(5)/MAX_FETCH(15) in the same frozen CEILINGS block as the shared contract the Phase-20 orchestrator enforces at wave dispatch. LZ_DR_* env override intentionally NOT wired (D-12): hardcoded CEILINGS defaults are the enforced contract this phase.

(v1.0.1 + v2.0.0 decision history preserved in PROJECT.md Key Decisions and the milestone archives.)

- [Phase ?]: [v2.1.0 / Phase 16 P02]: the aggregator is locked by a committed node:test validation fixture (lz-deep-research-aggregate.test.mjs) -- 9 named tests (5 SC-5 behaviors + CRLF/BOM/determinism/zero-dep hardening) over 6 committed immutable __fixtures__ run-dirs; phase gate is node --test FILE exits 0 (the dir form false-fails on this host); BOM/CRLF excerpt written at runtime so zero non-ASCII bytes committed.
- [Phase ?]: [v2.1.0 / Phase 16 P02]: paraphrase-one-source fixture uses the genuinely-merging pair (Jaccard 1.0), NOT the RESEARCH-suggested Jaccard-0.5 pair, and the test asserts survivors.length===1 BEFORE corroboration_lower_bound===1 -- closing the vacuous-pass hole the plan-checker flagged.
- [Phase ?]: [v2.1.0 / Phase 17 P01]: aggregator tally() CORRECTED to the single canonical D-01 confidence enum {High, Medium, Low, Contested, Unsupported} -- spike artifacts Rejected (dropped) and Low/Contested (un-fused) gone from code/stdout/fixture comment. Option I branch order: Unsupported guard -> High -> Contested(split) -> Medium -> Low; split MUST precede Medium (D-03); 0 unrefuted/N refuted -> Low, claim never removed (downgrade-not-delete, D-03b).
- [Phase ?]: [v2.1.0 / Phase 17 P01]: per-tier confidence coverage added -- four new committed __fixtures__ trees (medium-two-unrefuted, low-thin-support, low-refuted-downgraded, contested-split) + unsupported-no-votes (Pattern A, no votes/ dir); five per-tier assertions + a 5-label stdout assertion; suite 19 tests green via the FILE-form gate. Forbidden Low/Contested + Rejected tokens assembled from fragments so the closing git grep zero-hit gate stays clean. The corrected aggregator is now the source 17-02 freezes verbatim (D-12).
- [Phase ?]: [v2.1.0 / Phase 17 P02]: references/lz-deep-research-schema.md created (the FIFTH references/ file) -- single source of truth for the deep-research data contract, frozen VERBATIM from the corrected aggregator under D-12. Freezes source/claim/vote/excerpt + survivor + report claim records, the Option I tally rubric + truth table, the single 5-tier enum High|Medium|Low|Contested|Unsupported, the two orthogonal assurances (quote_fidelity mechanical vs claim_support judgment) with a worked example, the named-ceilings + quote-recheck (+WR-04) contracts. No second confidence field, no schema-keyword/ajv validator. PIPE-07 + VERIF-06 close at the contract level.
- [Phase ?]: [v2.1.0 / Phase 17 P02]: forbidden tokens (Rejected / Low/Contested / report_confidence / schema-keyword / ajv) kept OUT of the reference doc by describing the superseded concepts descriptively (terminal-delete tier / fused low-or-contested token / no second per-report confidence field), so the closing zero-hit gate stays clean while the doc still explains what is NOT in the contract. Claude's-discretion picks: claim_support not-yet-judged = unassessed; source-record forward field = fetched_at.
- [Phase 18 P01]: [v2.1.0 / Phase 18 P01]: EVAL-05 deliverable authored -- `plugins/lz-advisor/references/lz-haiku-prompt-engineering.md` (shipped, pure-prose, zero-dep, the SIXTH references/ file) carries the 12 verified Haiku 4.5 techniques H1-H12, each with WHAT / WHY-for-a-cheap-model / `[CITED:]` source; the `[ASSUMED]` tags on H7 (abstain-when-unsure, A1) and H10 (step-bounded 3-5 steps, A3) preserved verbatim, NOT promoted to fact. Opens with the D-08 fairness framing (Haiku voter engineered to the SAME task contract as the Sonnet baseline -- identical schema/dataset/grader -- so the eval measures MODEL capability, not prompt quality) and names the downstream consumers (Plan 18-05 Haiku-voter author + the Phase-19 Haiku search-worker author). Stale-pattern corrections section: `budget_tokens` deprecated (use adaptive thinking + effort), prefill returns 400 on 4.6 (use Structured Outputs / direct instruction), aggressive `CRITICAL`/`MUST`/`NEVER` overtriggers (use plain phrasing), stale Structured-Outputs BETA caveat; names `lz-nx-ai-plugins` `MODEL-OPTIMIZATION-HAIKU.md` as the NON-authoritative starting point only. PRECEDES authoring any Haiku agent (D-08). Verify gate green (0 non-ASCII codepoints; CITED tags present; stale-pattern corrections present). No deviations.
- [Phase ?]: [v2.1.0 / Phase 17 P02]: 16-01-SUMMARY superseded banner re-pointed at the new reference doc + the corrected aggregator as the contract authority (17-CONTEXT.md retained for decision provenance); the dated as-shipped historical record preserved unchanged below the banner. Phase 17 is ready_for_verification (last plan).
- [Phase 18 P02]: [v2.1.0 / Phase 18 P02]: the repo's FIRST install surface stood up -- repo-level `eval/` (private `lz-eval`, type:module) with `eval/package.json` exact-pinning `jstat@1.9.6` (D-01b/D-10) + a COMMITTED `eval/package-lock.json` (lockfileVersion 3, integrity sha512-rPBkJbK2TnA8pzs...); `eval/node_modules/` + `eval/.cache/` gitignored. The distributed plugin tree gains NO package.json/node_modules (D-11). jstat verified at a BLOCKING-human supply-chain checkpoint before the lockfile was committed -- all 6 checks PASS (exact pin in manifest+lockfile; verbatim MIT LICENSE Copyright (c) 2013 jStat; no install/native scripts, zero runtime deps, gypfile unset; numeric anchors 0.21801936 / 0.32659794 / 0.08161410 / combination(15,3)=455; node_modules gitignored). The manifest `license` field is undefined (known jstat packaging gap, RESEARCH A7) -- the LICENSE file is the MIT proof. NOT auto-approved (gate=blocking-human); human typed approval.
- [Phase 18 P02]: [v2.1.0 / Phase 18 P02]: D-11 packaging boundary enforced from BOTH sides -- the Phase-16 SC-2 zero-dependency test RE-SCOPED in place (in-scope edit, Pitfall 1) from a repo-root package.json walk to a recursive plugin-tree-only assertion (no package.json/node_modules under plugins/lz-advisor/; import-spec assertion kept verbatim; non-vacuous inspected-count guard; plugin root resolved file-relative three levels up from scripts/), plus a NEW eval-side `eval/lz-eval-packaging-boundary.test.mjs` (stdlib-only, no jstat) asserting (1) no install surface under the plugin tree and (2) no plugin-tree .mjs imports any eval/ script (one-directional eval->runtime boundary). Both pass via the explicit FILE-form node:test gate.
- [Phase 18 P03]: [v2.1.0 / Phase 18 P03]: the SOLE HARD GATE engine landed -- `eval/lz-eval-aggregate.mjs` (dev-only eval tree, NEVER shipped) exports `clopperPearsonUpper`/`wilsonUpper`/`passAtK`/`passHatK`/`EVAL_THRESHOLDS`/`countFalseUpholds`/`delta`/`lockRuleVerdict`. ALL CI/Pass@k math is library-computed via the pinned jstat (jStat.beta.inv / jStat.normal.inv / jStat.combination) -- NO hand-rolled logGamma/incbeta/betaInv/comb (D-07). The false-uphold counter is deterministic off-model verdict-vs-gold (D-01); the gated quantity is the Haiku-MINUS-Sonnet DELTA excess on the shared SUBTLE pool (D-06), never Haiku absolute. Cross-tree one-directional import (eval -> runtime) of ContractError/stripBom/safeId/listJson (readJson copied module-private). `EVAL_THRESHOLDS` frozen: ALPHA 0.05, RELIABLE_TRIALS 15, MIN_K 5, escalation kill band 0.40-0.50 (kill enforced at the 0.50 high edge), DELTA_UPPER_MAX 0.25 (separates CP(0,15)~=0.218 PASS from CP(1,15)~=0.319 FAIL), strata fractions 0.40/0.60/0.50. `eval/lz-eval-lock-rule.md` is the pre-registered EVAL-04 lock rule whose thresholds match the frozen object byte-for-byte (verified programmatically). 15-test fixture green via the FILE-form gate; the false-uphold present/absent siblings + the Haiku-2/Sonnet-1 DELTA fixture are mutation-verified discriminating. EVAL-02/EVAL-04/COST-02 satisfied at the DETERMINISTIC-ENGINE level -- they stay Pending in traceability until the Plan 18-05 live eval validates them end-to-end (do not orphan the live-eval close).
- [Phase 18 P03]: [v2.1.0 / Phase 18 P03 / DEVIATION]: one Rule-1 auto-fix -- the Pattern-2 reference Pass@k wrapper `1 - jStat.combination(n-c,k)/jStat.combination(n,k)` returns NaN whenever n-c<k (jstat's combination is undefined for n<k; e.g. combination(0,5) is NaN), poisoning Pass@1 when all trials are correct. Fixed by an internal `comb(a,k)` that applies the documented combinatorial identity C(a,k)=0 for a<k BEFORE delegating to jStat.combination (the standard HumanEval Pass@k formulation). NOT hand-rolling: every real combination value still comes from the library; only the degenerate a<k identity (a fact) is applied -- D-07 preserved.
- [Phase 18 P04]: [v2.1.0 / Phase 18 P04]: the zero-hand-authoring dataset loader landed -- `eval/lz-eval-dataset.mjs` (dev-only eval tree, NEVER shipped) exports `remapLabel`/`verifySha256`/`resolveHfToken`/`preflightToken`/`loadManifest`/`stratify`/`fetchDataset` + `STRATA_FRACTIONS`/`WICE_REVISION`. WiCE labels remap to the FROZEN verdict enum (D-02d): supported->unrefuted; partially_supported->refuted AND tagged the `subtle` substratum (the false-uphold trap); not_supported->refuted; unknown label fails closed (ContractError). sha256 verify is fail-closed (/checksum mismatch/ naming the file; rejects a non-64-hex expected). Gated-401 pre-flight (Pitfall 2): a gated repo with no token throws an actionable HF_TOKEN/`hf auth login` error naming the dataset and NEVER retries; WiCE is ungated so the closed-book SUBTLE gate runs token-free; token resolution mirrors huggingface_hub (env HF_TOKEN -> HF_TOKEN_PATH -> HF_HOME/token). `stratify` hits ~40% supported / ~60% bad / ~half-bad-subtle and fails closed if a stratum is unsatisfiable (no degenerate sample). `fetchDataset` shells to `hf download --revision <pinned-sha> --include <glob> --local-dir eval/.cache/<safeId-slug>` (network only at eval time, 18-05). Cross-tree one-directional import (eval -> runtime) of ContractError/stripBom/safeId; readJson copied module-private (no bare JSON.parse on untrusted data).
- [Phase 18 P04]: [v2.1.0 / Phase 18 P04]: committed derived manifest `eval/__fixtures__/lz-eval-manifest.json` -- 70 stratified examples (30 unrefuted ~42.9% / 40 refuted; 17 subtle = half the WiCE bad). WiCE rows vendored at revision 54f7976b... with per-vendored-file sha256 in sources[]; AVeriTeC (open-book) + LLM-AggreFact (stress) + ExpertQA (secondary seed) are FETCH-ONLY: vendored:false, PENDING revision (enumerated once authenticated at eval time, A4), empty files[], example rows carry ONLY uid/source/source_label/stratum/book/expected_verdict (NO corpus text -- D-04 CC-BY-NC/CC-BY-ND compliance). Vendored `eval/__fixtures__/wice-vendored/`: 60 real WiCE subclaim_dev records (the ONLY commit-safe corpus, ODC-BY/MIT) kept verbatim but with non-ASCII escaped to \\uXXXX so the committed files are strictly ASCII and JSON.parse to the identical record; basename = WiCE meta.id; + a NOTICE (jon-tow/wice + EMNLP 2023 Kamoi et al. + ryokamoi/wice + the pinned revision; states AVeriTeC/LLM-AggreFact are fetch-only, never vendored). OFFLINE manifest/vendor DRIFT GATE in the test: coverage (every manifest WiCE uid is vendored; matched count == uid count; no orphans) + sha256 match (recomputed per file, fail-closed) + a discriminating tampered-buffer case -- so drift fails at Wave 2, not the costly live run. 15-test FILE-form gate green (no network, no HF_TOKEN); eval-tree 32 tests green; plugin-tree runtime aggregator 39 green (cross-tree boundary intact). EVAL-01 satisfied at the loader/manifest level (stays Pending in traceability until the 18-05 live eval validates it end-to-end). No deviations.
- [Phase 18 P02]: [v2.1.0 / Phase 18 P02]: BOTH CI workflows backstop the three eval-tree tests on every push/PR -- ci.yml gained an eval-tree gate as steps IN THE EXISTING `test` job (ci.yml kept to exactly ONE job so test-act's `act -j test` mirrors the whole gate with no act-command change): `cd eval && (npm ci || npm install)` then `node --test eval/lz-eval-{aggregate,dataset,packaging-boundary}.test.mjs` by EXPLICIT file path WITHOUT any `--test-coverage-*` flags (the plugin-tree 97/89/100 coverage step kept verbatim, scoped to the plugin tree only). test-act.yml's push + pull_request `paths:` both extended to watch the eval tree (eval/**/*.test.mjs, eval/*.mjs, eval/package.json, eval/package-lock.json); ACT_VERSION/ACT_IMAGE + .actrc pin unchanged. The aggregate/dataset tests are authored in 18-03/18-04 -- the CI step references all three by path now (intentional forward reference per the plan). COST-02 + EVAL-04 unblocked at the infrastructure level. No deviations (one pre-commit self-corrected SC-2 level miscount; one Task-4-verify job-count false positive against the plan's over-broad regex that also matches `on:` keys -- single-job invariant satisfied).

### Pending Todos

- [research-rtk-command-suitability-for-skills-and-agents](./todos/pending/research-rtk-command-suitability-for-skills-and-agents.md) -- analyze whether `rtk git diff` / `rtk gh pr diff` are appropriate for review + security-review skills/agents (token savings vs. detail-loss trade-off). Captured 2026-04-26 during Phase 05.6 Test 2 review.

### Blockers/Concerns

- None blocking. Carry-forward watch items for the v2.1.0 build (from research flags, not blockers):
  - **Phase 18 (CI coverage of eval/ tests -- NOW IN-SCOPE):** REVERSED 2026-06-16 per user decision. The earlier note flagged extending CI as a post-Phase-18 follow-up (scope-control); that is no longer the plan. CI coverage of the three eval-tree tests (eval-aggregate, dataset, packaging-boundary) is IN-SCOPE this phase as **Plan 18-02 Task 4**, which extends BOTH `.github/workflows/ci.yml` (an eval-tree step in the existing `test` job: restore `eval/` deps via `cd eval && npm ci`/`npm install`, then run the three `.test.mjs` by explicit file path, WITHOUT the plugin-tree `--test-coverage` thresholds, leaving the plugin-tree coverage step unchanged) and `.github/workflows/test-act.yml` (its push+pull_request `paths:` filters extended to watch the eval tree so the local act sim still mirrors ci.yml). The eval tests are no longer a LOCAL-ONLY gate; they are backstopped on every push/PR.
  - **Phase 18 (HIGH):** open-book voter behavior (disconfirming-search compliance, subtle-overclaim detection, source-independence weighting) is the cost-driving fork and the mechanism behind the named silent false-uphold. The pre-registered eval (now early) gates the whole Haiku-first economics; EVAL-05 requires the Haiku prompt to be research-grounded before the eval is fair, and a non-viable verdict escalates to the user (EVAL-03) rather than auto-resolving.
  - **Phase 20 (HIGHEST):** full-wave headless concurrency under `--permission-mode auto` is the lead empirical unknown (A2 proved only n=2; platform caps silently at ~10, no `maxParallelAgents` setting). Needs a dedicated scale-concurrency spike with disk-I/O-storm + silent-batching observations as explicit acceptance criteria, plus the packaged-skill permission re-proof (A2 was a bare `-p` prompt, not a declared-`allowed-tools` skill).
  - **Phase 16:** semantic-paraphrase dedup residual -- lexical dedup under-merges beyond number/format variance; document the lexical limit and phrase confidence as a lower bound; do NOT add an embedding dependency (zero-dep violation).
- (Resolved v1.0.1/v2.0.0 blockers archived in the milestone records; the GATE-13-BUDGET trail is in the milestone archive.)

### Quick Tasks Completed

| # | Description | Date | Commit | Status | Directory |
|---|-------------|------|--------|--------|-----------|
| 260417-lhe | Assess Opus 4.7 release impact on advisor plugin and propose upgrade path | 2026-04-17 | 593920d | Verified | [260417-lhe-assess-opus-4-7-release-impact-on-adviso](./quick/260417-lhe-assess-opus-4-7-release-impact-on-adviso/) |
| 260601-f2a | Correct /plan "no built-in twin" claim in 09-03-SUMMARY + 09-VERIFICATION (Claude Code ships a built-in /plan; picker disambiguates) | 2026-06-01 | 401b7af | - | [260601-f2a-correct-the-no-built-in-twin-claim-for-p](./quick/260601-f2a-correct-the-no-built-in-twin-claim-for-p/) |
| 260610-w0f | Correct dangling "Reviewer Escalation Hook" cross-ref (security-reviewer.md -> review/SKILL.md; security side hedged not-yet-wired) | 2026-06-10 | 0e3f6c4 | - | [260610-w0f-correct-dangling-reviewer-escalation-hoo](./quick/260610-w0f-correct-dangling-reviewer-escalation-hoo/) |
| 260611-c5l | Address all PR #1 /code-review findings (#1-#9, #11, #12 fixed; #10 won't-fix per Phase 11 D-10) | 2026-06-11 | 5b57a0a | Verified | [260611-c5l-address-all-review-findings](./quick/260611-c5l-address-all-review-findings/) |
| 260611-ebt | Address 2nd /code-review pass findings (#1 deeper fix: confirmed Finding 3; #2 multi-line PFV + loud-fail; #3 plural revert; #4 dead var; #5 closed-vocab anchor) | 2026-06-11 | 56e8172 | Verified | [260611-ebt-address-the-review-findings](./quick/260611-ebt-address-the-review-findings/) |
| 260611-f98 | Address 3rd /code-review pass findings (#1 PFV multi-paragraph under-count + #2 dead `### ` branch -> two-arm loop; #3 Threat Patterns names confirmed Finding 3) | 2026-06-11 | 1a46b93 | Verified | [260611-f98-address-the-review-findings](./quick/260611-f98-address-the-review-findings/) |
| 260613-u6l | Add CHANGELOG.md (v1.0.0 + v1.0.1) and create GitHub releases for v1.0.0 and v1.0.1 (renamed tag v1.0 -> v1.0.0) | 2026-06-13 | dc2e28d | - | [260613-u6l-add-changelog-md-v1-0-0-v1-0-1-and-creat](./quick/260613-u6l-add-changelog-md-v1-0-0-v1-0-1-and-creat/) |
| 260615-wje | Fix security review findings: verdict enum validation, Windows device names, claims ceiling, schema source-to-filename note | 2026-06-15 | 7a5f5ba | - | [260615-wje-fix-security-review-findings-verdict-enu](./quick/260615-wje-fix-security-review-findings-verdict-enu/) |
| 260615-wwx | Add aggregate raw-claims ceiling in mergeClusters to close cross-file claims DoS residual (OQ-1) | 2026-06-15 | c2c1a83 | - | [260615-wwx-add-aggregate-raw-claims-ceiling-in-merg](./quick/260615-wwx-add-aggregate-raw-claims-ceiling-in-merg/) |
| 260615-x72 | Fix schema observability sentence: distinguish trim caps from fail-closed ceilings | 2026-06-15 | 02beccb | - | [260615-x72-fix-schema-observability-sentence-distin](./quick/260615-x72-fix-schema-observability-sentence-distin/) |

### Roadmap Evolution

- **Milestone v2.1.0 roadmap REVISED (2026-06-15):** two user-driven changes folded in. (1) The verifier gating eval MOVED EARLY -- it no longer trails the pipeline; it now runs as Phase 18 (right after the schema), decoupled from the orchestrator, driving the voter agent directly via the existing pilot harness (needs only the Phase-16 tally + Phase-17 vote schema + a voter prompt + a labeled dataset). (2) NEW requirement EVAL-05 -- a dedicated deep-research pass on Haiku prompt-engineering must precede authoring any Haiku agent (verify-voter Haiku variant AND the Haiku search worker), so the eval tests a fair research-grounded Haiku prompt. EVAL-03 kill-path revised to raise the non-viable decision to the user. Phased-requirement count rose 31 -> 32 (EVAL-05). New per-phase mapping: 16=5, 17=2, 18=9, 19=4, 20=12 (= 32). Phase 18 became "Haiku prompt-engineering deep research + verify-voter + early gating eval"; the old Phase 18 (workers) split so search+extract land at Phase 19 (AFTER the Haiku research, since the search worker's model tier follows the eval outcome); the old Phase 19 (orchestrator) became Phase 20. REL-01..03 remain excluded (completion-gated).
- **Milestone v2.1.0 roadmap created (2026-06-15):** 5 phases (16-20), continuing integer numbering from the v2.0.0 milestone's final Phase 15. Initial bottom-up order was aggregator -> schema -> workers -> orchestrator+scale -> gating eval (the eval trailing). All 31 phased requirements mapped, 0 orphans. ROADMAP.md appended the v2.1.0 milestone group while preserving the archived v1.0 / v1.0.1 / v2.0.0 groupings. (Superseded by the same-day revision above.)
- **Milestone v2.0.0 roadmap created (2026-06-14):** 2 phases (14-15), continuing from Phase 13. Fable advisor descoped after empirical probe (subagent-Fable API-blocked, SEED-001); roadmap reduced to the `lz-` rename + release.
- **Milestone v1.0.1 roadmap created (2026-06-07):** 3 phases (11-13), continuing integer numbering from the v1.0 milestone's final Phase 10. Fixture baseline first, atomic grouped-grammar rewrite, empirical verification last.

(v1.0 milestone roadmap-evolution history archived in `milestones/v1.0-ROADMAP.md`. Phase 14.1 / 14.2 were inserted after Phase 14 during the v2.0.0 build.)

- Phase 17.1 inserted after Phase 17: Address Phase 16/17 review findings (URGENT)
- Phase 17.2 inserted after Phase 17.1: Address lz-review Important findings R1-1 (id path-safety in mergeClusters) and R2-1 (null vote file TypeError) plus 4 Suggestion findings (URGENT)
- Phase 17.3 inserted after Phase 17: Add GitHub Actions workflow for script tests (URGENT)

## Session Continuity

Last session: 2026-06-16T10:18:16.000Z
Stopped at: Phase 18 Plan 04 complete (zero-hand-authoring dataset loader + committed derived manifest + vendored WiCE + offline drift gate)
Resume file: .planning/phases/18-haiku-prompt-engineering-deep-research-verify-voter-early-ga/18-04-SUMMARY.md
Resume next: Execute Plan 18-05 (the LAST Phase-18 plan): author the two verify-voter agents -- `research-verify-voter-sonnet.md` (ship default) + `research-verify-voter-haiku.md` (research-grounded from the EVAL-05 reference, behind the OFF flag) -- against the FROZEN vote schema, then run the staged, credit-aware live gating eval (SUBTLE-first, k>=5, reliable=15 on PASS) that settles-or-raises the Haiku-first flag (EVAL-03). The full eval infrastructure is now ready: the gate engine `eval/lz-eval-aggregate.mjs` + pre-registered `eval/lz-eval-lock-rule.md` (18-03) and the dataset loader `eval/lz-eval-dataset.mjs` + committed manifest + vendored WiCE (18-04). The eval-tree CI gate (all three .test.mjs) is now fully green end-to-end.

## Operator Next Steps

- Execute Plan 18-05 (the final Phase-18 plan): the two voter agents + the staged live gating eval (EVAL-03 settle-or-raise). All deterministic eval infrastructure (gate engine, lock rule, dataset loader, manifest, vendored WiCE, drift gate) is committed and green. The live arms (AVeriTeC open-book / LLM-AggreFact stress) need an `HF_TOKEN` + accepted dataset terms at eval time; the WiCE closed-book SUBTLE gate (the sole hard gate) runs token-free.
