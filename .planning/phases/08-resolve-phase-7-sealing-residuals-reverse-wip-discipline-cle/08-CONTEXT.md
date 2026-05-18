# Phase 8: Resolve Phase 7 sealing residuals + reverse wip-discipline + clear Phase 8 carry-forward backlog - Context

**Gathered:** 2026-05-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Close all 3 documented residuals from `07-VERIFICATION.md closure_amendment_2026_05_08_uat_replay_0_13_1` + 2 evidence-weighted P3 carry-forward items + 1 standalone P3 mechanical bundle. Total 7 plans on plugin 0.13.1.

**In scope:**

- **P0 (standing user directive):** `residual-wip-discipline-reversal` -- remove Plan 07-08 wip: rule from `lz-advisor.execute/SKILL.md` + path-d assertion from `E-verify-before-commit.sh` + `GAP-G2-wip-scope` row from `REQUIREMENTS.md`
- **P1 (zero-cost mech fix bundle):** `residual-shape-regression-parser` (loosen smoke parser regex to accept backtick-wrapped fragment-grammar lines) + `residual-pfv-outlier-cap` (raise PFV outlier soft cap on `D-security-reviewer-budget.sh`)
- **P2 measurement + conditional structural:** `residual-advisor-fragment-grammar-not-binding-on-code-blocks` -- n>=3 fixture-grade measurement across Compodoc + generic feature + refactor scenarios with compound OR-gate decision rule (auto-extend to n=5 on borderline); structural plan ships IF gate fires
- **P3 (evidence-weighted carry-forward):** P8-18 self-anchor through advisor narrative SD prose (empirical Phase 7 closure evidence) + FIND-F Class-2 Escalation Hook observability (Plan 07-13 PARTIAL; designed trigger scenario)
- **P3 (mechanical):** WR-04 + WR-05 legacy lexicon edits in `references/context-packaging.md` (standalone Plan 5)

**Not in scope:**

- P8-03 Pre-Verified Contradiction Rule -- deferred to Phase 9 (no empirical FAIL evidence; defensive rule against hypothetical contradiction)
- P8-12 Cross-Skill Hedge Tracking auto-detect -- deferred to Phase 9 (Plan 07-03 D-07 sub-rule (ii) prose foundation exists; auto-detect enhancement lacks evidence)
- 1.0.0 marketplace-readiness cut -- deferred until carry-forward backlog clears AND follow-up regression cycle confirms zero residuals
- Per-section `<output_constraints>` XML extension to advisor.md -- available as MINOR-escalation path for Plan 4 IF measurement reveals fragment-grammar template structurally can't bind on code blocks; otherwise default to fragment-grammar template extension (PATCH)
- Reviewer/security-reviewer per-section XML contract changes -- Plan 07-14 canon preserved; Plan 4 only touches advisor.md
- Marketplace re-publishing beyond version bump
- Hard-rules layer for word-budget on advisor -- per Phase 7 D-03 deferred unless hybrid insufficient

</domain>

<decisions>
## Implementation Decisions

### Plan structure (foundational)

- **D-01:** Phase 8 ships **7 plans** in tight multi-step ordering. Plan 1 (P0 wip) is independent contract-shape change. Plans 2 + 5 are fixture-parser-layer / doc-only PATCH-tier additions (parallelizable). Plan 3 (P2 measure) accumulates measurement artifact only; no behavior change. Plan 4 ships ONLY if compound OR-gate fires per disposition rule. Plans 6 + 7 add evidence-weighted P3 surfaces. Recommended execution order (PATCH-first principle; superseded by D-04 -- version cadence is not load-bearing, but plan ordering still respects logical dependency):

  - **Plan 1: P0 wip-discipline reversal** -- Remove `<verify_before_commit>` Phase 3.5 subject-prefix discipline section + 3-shape worked example pair from `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` (~25 lines); remove path-d assertion + synthesized in-process scenario block from `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/E-verify-before-commit.sh` (~30 lines); remove `GAP-G2-wip-scope` row from `.planning/REQUIREMENTS.md` (1 row). Contract-shape change to skill behavior contract.
  - **Plan 2: P1 SHAPE + PFV parser bundle** -- Loosen smoke parser regex in `D-reviewer-budget.sh` and `D-security-reviewer-budget.sh` from `/^[^:\s]+:\d+(?:-\d+)?:\s+(?:crit|imp|sug|q):/` to `/^\`?[^:\s]+:\d+(?:-\d+)?:\s+(?:crit|imp|sug|q):.+\`?$/m` (optional leading + trailing backtick). Raise PFV outlier_soft_cap on `D-security-reviewer-budget.sh` from 66w to 75-80w (security carve-out specific); decision between 75w and 80w **Claude's Discretion** based on observed margin headroom (75w covers max observed 77w UAT outlier; 80w gives more headroom for CVE-class auto-clarity). Validate via `--from-trace` replay against 5 captured shape-regression traces in `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/traces/` (must FLIP from FAIL to PASS) + n=3 fresh re-runs for PFV threshold (no regression on previously-passing runs). Zero claude -p spend at validation time.
  - **Plan 3: P2 measure** -- Add per-item code-block flag detection to `D-advisor-budget.sh` parser (regex match on backtick-fenced or inline-code patterns; ~10 lines); add structured log output for `08-MEASUREMENT.md` (per-run aggregate, per-item words, per-item code-block flag). Run n=3 fresh fixture-grade sessions against Compodoc + generic feature implementation + refactor scenarios on `ngx-smart-components` testbed (or canonical scratch with prompts derived from `project_compodoc_uat_initial_plan_prompt.md` for Compodoc; feature implementation + refactor prompts to be composed by planner). Evaluate compound OR-gate at n=3. If INCONCLUSIVE (per D-02 borderline band), spawn Plan 3.5 (n=2 more, total n=5) and re-evaluate. Write `08-MEASUREMENT.md` capturing all n runs + gate decision + disposition.
  - **Plan 4: P2 structural conditional** -- Ships ONLY if Plan 3 (or Plan 3.5) gate decision is FAIL. Disposition rule (D-02) selects fix surface:
    - D1 alone fires -> extend fragment-grammar emit template in `agents/advisor.md` to bind on code-block items (Plan 07-16 root cause; mirrors Plan 07-10 fragment-grammar template canon)
    - D2 alone fires -> density example audit in `agents/advisor.md` Output Constraint section (Plan 05.5-03 commit `84aaa5b` density example as suspected drift surface)
    - Both fire -> ship both fixes atomically in one commit
    - Neither fires -> Plan 4 does NOT ship; P2 residual closes structurally with `08-MEASUREMENT.md` as audit record
    - Escalation: if Plan 3 measurement reveals fragment-grammar template structurally cannot bind on code blocks (e.g., per-item parser detects inline code that the fragment grammar consistently fails to wrap), Plan 4 escalates to per-section `<output_constraints>` XML extension matching reviewer/security-reviewer canon (Plan 07-14). Default fix is fragment-grammar extension (PATCH-tier); escalation is contract-shape change (MINOR-tier).
  - **Plan 5: P3 mechanical (WR-04 + WR-05)** -- Standalone plan, ~5 lines across 2 edits in `plugins/lz-advisor/references/context-packaging.md`. WR-04: schema BNF at line 376 still permits legacy `|high|medium`; replace with `|important|suggestion` per Plan 07-13 severity-vocabulary alignment. WR-05: worked-example at line 317 shows `Severity: High`; replace with `Severity: Important`. Both 1-line text edits; doc-only.
  - **Plan 6: P8-18 advisor narrative SD self-anchor** -- Extend pv-validation rule (Plan 07-01 / 07-11 dual-surface) to advisor narrative SD prose. Currently pv-validation catches token-form self-anchors in user-facing artifact surface (plan files, review/security-review output bodies, commit bodies); does not catch when advisor's Strategic Direction prose itself introduces a claim the executor self-anchors against. New sub-rule in `plugins/lz-advisor/references/context-packaging.md` Common Contract Rule 5b: when advisor SD prose contains a load-bearing technical assertion (e.g., "TypeScript 5 supports decorators on accessors"), executor must verify against installed-version source (package.json, .d.ts, official docs via WebFetch) before propagating into subsequent skills' consultation prompts. Smoke fixture: synthesize an advisor SD with a deliberately-false technical assertion; assert executor either (a) flags the assertion as unverified hedge, or (b) verifies + cites source. Empirical anchor: Phase 7 closure amendment noted advisor narrative SD self-anchor leak as Phase 8 candidate.
  - **Plan 7: FIND-F Class-2 Escalation Hook observability** -- Plan 07-13 structurally added `## Class-2 Escalation Hook` section to `agents/security-reviewer.md` mirroring reviewer.md lines 223-249. No natural UAT triggered the hook (Phase 7 UAT S3 + S4 emitted zero `<verify_request>` blocks). Plan 7 designs a trigger scenario that forces Class-2 escalation: a code change involving a CVE-relevant vendor library version (e.g., outdated `express` < 4.19.0 with known CVE-2024-29041) that security-reviewer cannot resolve from local context alone. Run 1 UAT session against the scenario; capture trace; verify (a) security-reviewer emits `<verify_request>` block with `class="2"`, (b) executor parses block + invokes WebSearch / WebFetch + synthesizes pv-* anchors, (c) executor re-invokes security-reviewer ONCE with new anchors (Spotify Honk one-shot), (d) security-reviewer closes the Class-2 hedge with anchored citation. Smoke-fixture optional (planner's discretion: extend `E-verify-before-commit.sh` with a new path-e assertion, or write a dedicated `F-class-2-escalation.sh` fixture). Closes Plan 07-13 PARTIAL row.

### P2-ADVISOR structural redesign gate (foundational; highest-quality choice)

- **D-02:** **Compound OR-gate + disposition rule + measurement artifact.** Optimizes for evidentiary rigor + recall + fix-surface attribution + observability. Single predicate alternatives (gate C, gate C2) explicitly rejected per "highest quality, no shortcuts" user directive 2026-05-08.

  **Compound trigger gate (Plan 4 ships if EITHER disjunct fires):**

  - **D1 (code-block disjunct):** `>=2/3 runs` have `>=1 code-block item` over **per-item hard cap** (15w for fragment items / 22w for Assuming-frame items per Plan 07-10 canon).
  - **D2 (aggregate disjunct):** `mean aggregate >100w` (hard cap; no tolerance on mean -- canonical target rules) AND `>=2/3 per-run aggregate >110w` (+10% tolerance matching commit `ef97e21` fixture-parser-layer convention; absorbs stochastic variance at test layer).

  Each disjunct independently carries the `>=2/3 FAIL` stochastic-outlier guard from Plan 07-12 precedent. A single disjunct firing is its own complete evidentiary case.

  **Disposition rule (which structural fix ships in Plan 4):**

  - **D1 alone fires** -> Plan 4 = fragment-grammar template extension to `agents/advisor.md` to bind on code-block items (Plan 07-16 root cause; refines existing Plan 07-10 canon).
  - **D2 alone fires** -> Plan 4 = density example audit in `agents/advisor.md` Output Constraint section (Plan 05.5-03 commit `84aaa5b` density example as suspected drift surface; aggregate inflation without code-block-FAIL points to prose-density regression, not fragment-grammar binding).
  - **Both fire** -> Plan 4 ships both fixes atomically in one commit.
  - **Neither fires** -> P2 residual closes structurally; advisor budget contract holds on n=3 evidence.
  - **Structural escalation path:** if Plan 3 measurement reveals fragment-grammar template structurally cannot bind on code blocks (e.g., per-item parser detects inline code that the fragment grammar consistently fails to wrap correctly across all 3 runs), Plan 4 escalates from fragment-grammar template extension (PATCH-tier refinement) to per-section `<output_constraints>` XML extension (MINOR-tier contract-shape change mirroring Plan 07-14 reviewer/security-reviewer canon).

  **Borderline band (mechanical INCONCLUSIVE classification; auto-extends to n=5 per D-03):**

  - **D1 INCONCLUSIVE if:** Exactly 2/3 runs code-block-FAIL AND **all** FAIL items in soft outlier band (`[15w, 17w]` for fragment items OR `[22w, 25w]` for Assuming-frame items). The +2-3w soft outlier band matches Plan 07-15 D-reviewer-budget.sh 22w/28w outlier soft cap precedent applied to advisor's bimodal cap structure.
  - **D2 INCONCLUSIVE if:** Mean aggregate in `[98w, 105w]` AND per-run pattern doesn't decisively fire (i.e., `<=2/3` per-run >110w OR all runs <100w). The +/-5w band around 100w target matches roughly +/-5% noise around canonical target.
  - **Compound INCONCLUSIVE if:** Either disjunct INCONCLUSIVE (conservative: any ambiguity triggers extension).

  **Measurement artifact (`08-MEASUREMENT.md`; durable audit record):**

  Plan 3 writes per-run aggregate word count, per-item words, per-item code-block flag (boolean), per-item assuming-frame flag (boolean), gate decision (PASS / FAIL / INCONCLUSIVE), disposition selected (or N/A), and which scenarios were run. Plan 4 conditional reads this artifact to pick the correct fix surface; Phase 9 audit can revisit the decision against the raw data if fix surface attribution turns out wrong.

  **Heterogeneous scenarios:** Compodoc + generic feature implementation + refactor (n=3 fresh fixture-grade sessions). Matches Plan 07-12 sample size; covers config-heavy / new-code / restructuring task-type axes. Full-spectrum n=5 (adds bug-fix + migration) is OPTIONAL fallback if INCONCLUSIVE band fires.

### Re-run policy on borderline measurement (foundational)

- **D-03:** **Auto-extend on borderline (tri-state).** Plan 3 outputs PASS / FAIL / INCONCLUSIVE per D-02 borderline band. INCONCLUSIVE auto-triggers Plan 3.5 (n=2 more fresh runs, total n=5) before Plan 4 decision. Plan 3.5 re-evaluates the compound OR-gate at n=5 with the same borderline band scaled (D1 INCONCLUSIVE at n=5 requires >=3/5 code-block-FAIL with all FAIL items in soft outlier band; D2 INCONCLUSIVE at n=5 requires >=3/5 per-run pattern non-decisive).

  Single-shot, planner-discretion, and always-n=5 alternatives explicitly rejected per "highest quality, no shortcuts" -- they either force binary decisions on noisy data, reintroduce judgment ambiguity, or pay full cost upfront whether needed.

  **Cost profile:**

  - Unambiguous PASS or FAIL at n=3 -> 3 sessions
  - INCONCLUSIVE at n=3 -> 5 sessions total (n=3 + Plan 3.5's n=2)
  - Worst case (still INCONCLUSIVE at n=5) -> planner escalates to n=10 statistical gate via Plan 3.6 (matches Plan 07-15 E.1 precedent); this is a soft-fail signal that the gate design needs revisiting in Phase 9

### Version cadence (not load-bearing)

- **D-04:** **Version numbers are not load-bearing in this pre-release plugin** (per user directive 2026-05-08; memory `feedback_version_numbers_not_load_bearing_prerelease.md`). Planner picks any coherent version trail that signals plan boundaries for audit; SemVer-rigorous PATCH-vs-MINOR-vs-MAJOR classification is OPTIONAL polish, not required structure.

  **Hard constraint preserved:** atomic 5-surface version sync across `plugins/lz-advisor/.claude-plugin/plugin.json` + 4 `plugins/lz-advisor/skills/lz-advisor.*/SKILL.md` frontmatter `version:` fields when any version bump occurs (Plan 07-15 / 07-17 atomic-5-surface canon). Whatever trail the planner picks, the 5 surfaces must move together within a single commit.

  **Re-evaluate this decision at:** 1.0.0 marketplace-readiness cut (deferred until carry-forward backlog clears + follow-up regression cycle confirms zero residuals).

### Claude's Discretion

- **PFV outlier_soft_cap target value in Plan 2:** 75w vs 80w on `D-security-reviewer-budget.sh`. 75w covers max observed UAT outlier (77w from Phase 7 UAT replay S4); 80w provides margin headroom for future CVE-class auto-clarity findings. Planner picks based on n=3 fresh re-run distribution; if n=3 mean PFV is in [60w, 75w] range, 75w is sufficient; if mean is in [70w, 78w], 80w is more defensible.
- **Symmetric vs asymmetric PFV cap raise:** P1-PFV memory recommendation is "security-reviewer only" (asymmetric) since the auto-clarity carve-out is CVE-specific. Planner may consider raising D-reviewer-budget.sh PFV cap to 75w as well for symmetry IF n=3 fresh re-runs surface any D-reviewer PFV outliers in [60w, 75w]; otherwise asymmetric raise is the default.
- **Feature implementation + refactor prompt composition for Plan 3:** Compodoc prompt is locked (memory `project_compodoc_uat_initial_plan_prompt.md`). The two other scenarios need prompts. Suggested: generic feature implementation = "add a debounced search input component to my Angular library" (exercises new-code path); refactor = "extract a shared validation utility from these 3 components" (exercises restructuring path). Planner finalizes wording.
- **Code-block detection regex in Plan 3 parser:** suggested patterns: backtick-fenced (single, triple, or 4+ backticks), `<code>` HTML tags, indented 4+ spaces in markdown context. Planner picks based on observed Plan 07-16 fixture (items 3, 5, 7 carried `compodocArgs={...}` JSON, addon-docs `setCompodocJson(...)`, signal `input()/output()` declarations -- all backtick-fenced in the fixture). Single-backtick inline-code detection is the minimum bar; multi-backtick block detection is a stronger signal.
- **Plan 7 fixture extension vs standalone:** extend `E-verify-before-commit.sh` with path-e assertion vs write dedicated `F-class-2-escalation.sh`. Suggested: standalone `F-class-2-escalation.sh` to match letter-based naming convention (F is the natural anchor for FIND-F observability; existing letter set: A-K from 5.4, G+H from 5.5, I from 5.6, J from 5.4 Mechanism C; F is currently unused at smoke-test level).
- **Plan 6 sub-rule placement:** new sub-rule in Common Contract Rule 5b vs new Rule 5c. Suggested: 5b extension to keep "Pre-Verified Format mandate" grouping coherent (Plan 07-11 D2 amendment introduced dual-surface differentiation in 5b; advisor narrative SD prose is a third surface in the same conceptual group). Planner picks based on prose flow.
- **Plan 1 ordering relative to other plans:** Plan 1 (P0 wip) removes the wip-discipline rule that fires during execute skill. Plan 3 (P2 measure) uses plan + advisor skill flows, not execute, so Plan 1 ordering relative to Plan 3 is independent. Planner picks any ordering; suggested PATCH-first (Plans 2 + 5 first, then 3, then 1 + 4 + 6 + 7) though version cadence is not load-bearing per D-04.
- **Plan 4 version classification IF it ships:** PATCH by default (fragment-grammar template extension is refinement); MINOR if escalation path triggers (per-section `<output_constraints>` XML extension to advisor.md is contract-shape change). Planner picks based on actual fix shape observed in Plan 3 measurement. Per D-04, this is documentation-grade decision, not gate-grade.

### Folded Todos

(No todos folded from `cross_reference_todos` step -- the only pending todo `research-rtk-command-suitability-for-skills-and-agents` matched at score 0.6 on keyword overlap, but the actual subject -- token-saving wrapper for review/security-review skills -- is unrelated to verify-chain-integrity sealing residuals.)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 7 closure (immediate evidentiary anchor)

- `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-VERIFICATION.md` -- Specifically `closure_amendment_2026_05_08_uat_replay_0_13_1` block (lines 1166-1353) recording final status `passed_with_residual_on_0_13_1` + `phase_8_worklist` (lines 1333-1341) + 3 documented residuals with concrete fix paths + carry-forward backlog enumeration (lines 1307-1312).
- `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-UAT-REPLAY-0.13.1.md` -- 8-session UAT empirical evidence (PASSED_WITH_RESIDUAL on plugin 0.13.1; per-session trace inventory; PFV outlier 77w on S4 anchoring P1-PFV residual; 5/10 wip: commits anchoring P0 wip-discipline reversal; 0 `<verify_request>` blocks anchoring FIND-F Class-2 Escalation Hook observability gap).
- `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-CONTEXT.md` -- Phase 7 D-01..D-07 locked decisions. Phase 8 inherits and does NOT re-open the 6-themed-plan structure, descriptive-prose word-budget enforcement, 4-guard confidence-laundering pattern, etc.

### Phase 8 ROADMAP entry + REQUIREMENTS gaps

- `.planning/ROADMAP.md` -- Phase 8 entry (lines 242-250) with goal + requirements + Depends-on + plans-TBD bundling hint.
- `.planning/REQUIREMENTS.md` -- `GAP-G2-wip-scope` row (lines 70-71); Plan 1 (P0 wip) REMOVES this row + the linked assertion + linked SKILL.md section. Plan 6 (P8-18) may add a new requirement row for advisor-narrative-SD-pv-extension.

### Memory (durable user preferences + Phase 8 backlog)

- `C:/Users/LarsGyrupBrinkNielse/.claude/projects/D--projects-github-LayZeeDK-lz-advisor-claude-plugins/memory/project_phase_8_candidates_post_07.md` -- Phase 8 priority-ordered worklist (P0 wip / P1 SHAPE+PFV / P2-ADVISOR / P3-WR-04+05 / P3-P8-03 / P3-P8-12 / P3-P8-18 / P3-CLASS2-OBSERVABILITY). 2026-05-08 revision after E.1 + E.4 + E.3 empirical evidence.
- `C:/Users/LarsGyrupBrinkNielse/.claude/projects/D--projects-github-LayZeeDK-lz-advisor-claude-plugins/memory/feedback_no_wip_commits.md` -- User directive 2026-05-03 rejecting `wip:` commits as workflow choice. Plan 1 (P0 wip) operationalizes this directive in plugin contract.
- `C:/Users/LarsGyrupBrinkNielse/.claude/projects/D--projects-github-LayZeeDK-lz-advisor-claude-plugins/memory/feedback_version_numbers_not_load_bearing_prerelease.md` -- User directive 2026-05-08 collapsing version cadence to non-load-bearing concern. Plan 4 version classification + overall Phase 8 version trail are planner discretion subject to atomic 5-surface sync hard constraint.
- `C:/Users/LarsGyrupBrinkNielse/.claude/projects/D--projects-github-LayZeeDK-lz-advisor-claude-plugins/memory/project_compodoc_uat_initial_plan_prompt.md` -- Canonical Compodoc prompt for session 1 of any UAT replay. Plan 3 (P2 measure) uses this verbatim for the Compodoc scenario in the n=3 measurement set.

### Phase 7 plan SUMMARIES (rationale anchors for Phase 8 P2 design)

- `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-10-SUMMARY.md` -- Plan 07-10 closed residual-advisor-budget via fragment-grammar emit template + DROP/KEEP lists adapted to single-block 100w shape + `D-advisor-budget.sh` parser updated with `ADVISOR_FRAGMENT_RE` + `ASSUMING_FRAME_RE`. Per-item caps locked at 15w fragment / 22w Assuming-frame. Phase 8 Plan 3 (P2 measure) extends this parser with per-item code-block flag detection.
- `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-12-SUMMARY.md` -- Plan 07-12 stochastic-outlier guard precedent (security-reviewer 326w on plugin 0.12.1 reclassified as stochastic outlier after 3x re-run mean 272.3w; no structural change shipped). D-02 compound OR-gate inherits >=2/3 FAIL precedent from this plan.
- `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-15-SUMMARY.md` -- Plan 07-15 fixture-parser update (commit `ef97e21`) added +10% test-layer tolerance precedent. D-02 D2 per-run aggregate +10% tolerance + D-advisor-budget.sh per-item soft outlier band both inherit this convention.
- `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-16-SUMMARY.md` -- Plan 07-16 fixture-grade extraction of advisor SD against `session-1-plan.jsonl` (155w / 100w cap; items 3, 5, 7 over per-item cap; all carried inline configuration code). n=1 fixture-grade evidence anchoring P2-ADVISOR residual + D1 code-block disjunct design.
- `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-14-SUMMARY.md` -- Plan 07-14 per-section `<output_constraints>` XML contract in reviewer.md + security-reviewer.md. Phase 8 Plan 4 escalation path mirrors this contract for advisor.md IF structural binding required.
- `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-13-SUMMARY.md` -- Plan 07-13 Class-2 Escalation Hook structural addition to security-reviewer.md + WR-01/02/03 severity-vocabulary alignment. Phase 8 Plan 7 closes the conditional-firing observability PARTIAL row from this plan.

### Plugin surface files Phase 8 modifies

- `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` -- Plan 1 removes `<verify_before_commit>` Phase 3.5 subject-prefix discipline section + 3-shape worked example pair (~25 lines).
- `plugins/lz-advisor/agents/advisor.md` -- Plan 4 (conditional) extends fragment-grammar emit template to bind on code-block items (D1 disposition) AND/OR audits density example (D2 disposition). Plan 4 escalation path (if triggered): replace single-block Output Constraint with per-section `<output_constraints>` XML mirroring reviewer/security-reviewer canon.
- `plugins/lz-advisor/references/context-packaging.md` -- Plan 5 (P3 mechanical) does WR-04 at line 376 (schema BNF |high|medium -> |important|suggestion) + WR-05 at line 317 (worked example `Severity: High` -> `Severity: Important`). Plan 6 (P8-18) adds new sub-rule (in Rule 5b or new 5c per planner discretion) for advisor narrative SD pv-extension.
- `plugins/lz-advisor/agents/security-reviewer.md` -- Plan 7 (FIND-F obs) does NOT modify the agent prompt; it only adds the trigger-scenario fixture + UAT session. Plan 07-13 `## Class-2 Escalation Hook` section structure preserved verbatim.
- `plugins/lz-advisor/.claude-plugin/plugin.json` + 4 `plugins/lz-advisor/skills/lz-advisor.*/SKILL.md` frontmatter `version:` fields -- any version bump across all 5 surfaces atomically (D-04 hard constraint; planner's version trail discretion otherwise).

### Smoke-test surfaces Phase 8 modifies

- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/E-verify-before-commit.sh` -- Plan 1 removes path-d assertion + synthesized in-process scenario block (~30 lines).
- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-reviewer-budget.sh` -- Plan 2 (P1 SHAPE) loosens per-finding regex to accept optional leading + trailing backtick. Plan 2 optional symmetric raise: D-reviewer PFV outlier_soft_cap 66w -> 75w if n=3 surfaces D-reviewer PFV outliers in `[60w, 75w]` range.
- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-security-reviewer-budget.sh` -- Plan 2 (P1 SHAPE + PFV) does the same regex loosening + asymmetric PFV outlier_soft_cap raise (66w -> 75w or 80w per Claude's Discretion).
- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-advisor-budget.sh` -- Plan 3 (P2 measure) extends parser with per-item code-block flag detection (regex match on backtick-fenced or inline-code patterns) + structured log output schema for `08-MEASUREMENT.md`. Plan 4 (conditional) may extend further with `<output_constraints>` XML parser hooks if escalation path triggers.
- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/F-class-2-escalation.sh` (NEW, Plan 7) -- designed-trigger fixture forcing security-reviewer Class-2 escalation against a CVE-relevant vendor library version mismatch scenario; asserts `<verify_request>` block emission + executor parse-and-re-invoke + one-shot reviewer closure.
- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/G-advisor-narrative-sd-pv.sh` or similar (NEW, Plan 6, name at planner's discretion) -- synthesized advisor SD with deliberately-false technical assertion; asserts executor either flags as unverified hedge OR verifies and cites source before propagating into subsequent skill consultation.

### Captured trace inventory (zero-cost validation infrastructure; Plan 2 uses via --from-trace)

- `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/traces/` -- 5 captured shape-regression FAIL traces (9 total files including 4 PFV-outlier failures) preserved by Plan 07-15 commit `72efbce`. Phase 8 Plan 2 (P1 SHAPE) validates parser regex change by re-running parsers against these traces; must FLIP from FAIL to PASS without spawning claude -p.
- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/extract-from-log.mjs` (and analog in `traces/`) -- trace-replay infrastructure (`--from-trace <file>` flag added by Plan 07-15 commit `1fd1250` + `1b0c947`).

### Cross-phase context inherited (no re-opening)

- `.planning/phases/06-address-phase-5-6-uat-findings/06-CONTEXT.md` -- Phase 6 D-01..D-06 (Pattern D 4-class taxonomy, 4-skill byte-identical canon, Common Contract Rules 1-7). Phase 8 inherits all; touches no Pattern D or canon-shape change.
- `.planning/PROJECT.md` -- Plugin constraints (no hooks for v1; zero external dependencies; Sonnet 4.6 + Opus 4.7 model availability). Plus Key Decisions table (Mechanism C scope derivation, Common Contract rule 5 + 5a + 6, etc.). Phase 8 inherits all.
- `plugins/lz-advisor/references/orient-exploration.md` -- Pattern D 4-class taxonomy + Class 2-S sub-pattern + cross-skill hedge tracking section (Plan 07-03 D-07 sub-rule (ii)). Phase 8 deferred P8-12 (cross-skill hedge tracking auto-detect) builds on this; Phase 8 does NOT modify this file (unless Plan 4 escalation requires reference cross-link).
- `plugins/lz-advisor/references/context-packaging.md` -- Common Contract Rules 1-7 + Rule 5b dual-surface differentiation (Plan 07-11) + Rule 5b ToolSearch precondition sub-rule (Plan 07-07). Plan 5 modifies lines 317 + 376 (lexicon); Plan 6 extends Rule 5b (or adds 5c) for advisor narrative SD pv-extension.

### Project conventions (carried forward)

- `CLAUDE.md` -- Skill Verification with `claude -p` convention; Git Bash Windows arm64 shell rules; ASCII-only constraint; RTK prefix convention; fetch fallback chain. Phase 8 plan execution constrained by these.

### Anthropic foundational research (preserved from prior phases; not directly modified)

- `research/anthropic/docs/advisor-tool.md` -- Advisor tool docs.
- `research/anthropic/blog/the-advisor-strategy-give-agents-an-intelligence-boost.md` -- Executor-holds-tools split.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- **`--from-trace` replay infrastructure** (Plan 07-15 commits `1fd1250` + `1b0c947`) -- Phase 8 Plan 2 (P1 SHAPE + PFV) validates parser regex change against 5 captured shape-regression traces in `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/traces/` without spawning claude -p. Zero claude -p cost at validation time. Plan 3 (P2 measure) also benefits: if Plan 3.5 needs n=5 evidence, traces from n=3 can be replayed against any future parser refinement without re-running claude -p sessions.
- **Existing letter-based smoke-test framework** (`A-K from 5.4 + G+H from 5.5 + I from 5.6 + J from 5.4 + B-pv-validation + D-advisor-budget`) -- Plan 7 takes F as the natural letter for `F-class-2-escalation.sh` (F = FIND-F anchor). Plan 6 takes G (already used historically but in a different fixture) or any unused letter; planner picks.
- **Plan 07-10 fragment-grammar emit template canon in `advisor.md`** -- Plan 4 (conditional, D1 disposition) extends this template to bind on code-block items; preserves the single-block 100w aggregate shape unless escalation path triggers. The template's DROP/KEEP lists already encode advisor-specific shaping; extension targets are well-localized.
- **Plan 07-14 per-section `<output_constraints>` XML canon in `reviewer.md` + `security-reviewer.md`** -- Plan 4 escalation path (if triggered) replicates this canon byte-identically in `advisor.md` (adapted for advisor's single-section nature: Strategic Direction block becomes the constraint surface). Mirrors the byte-identical-canon pattern from Phase 6 Plans 06/07 and Phase 7 Plans 07-01 / 07-07 / 07-09.
- **Plan 07-11 dual-surface pv-validation rule (Rule 5b in `context-packaging.md`)** -- Plan 6 (P8-18) extends this rule to advisor narrative SD prose surface; the rule's existing dual-surface framing (internal-prompt XML required; user-facing token-form permitted with concrete-source backing) generalizes naturally to a third surface (advisor SD prose with concrete-source backing). Sub-rule placement (in 5b or new 5c) is **Claude's Discretion**.
- **Plan 07-13 `## Class-2 Escalation Hook` section in `security-reviewer.md`** -- Plan 7 (FIND-F obs) does NOT modify this section; it ONLY designs a trigger scenario and runs 1 UAT to verify the hook fires. Structural canon preserved.
- **Plan 07-03 D-07 cross-skill hedge tracking prose in `orient-exploration.md`** -- Phase 8 does NOT extend this section; P8-12 auto-detect deferred to Phase 9.

### Established Patterns

- **Compound OR-gate evidentiary structure** -- D-02 introduces this pattern; each disjunct independently carries the Plan 07-12 `>=2/3 FAIL` stochastic-outlier guard. Pattern is novel to Phase 8 but composes Plan 07-12's evidentiary precedent + Plan 07-15's +10% tolerance precedent + Plan 07-16's per-item attribution into a single decision rule. Phase 9 may extend this pattern to other multi-modal residuals.
- **Disposition rule pattern** -- D-02 introduces fix-surface attribution via gate disjunct (D1 fires -> fix surface A; D2 fires -> fix surface B; both -> both; neither -> close). Pattern eliminates planner judgment-call ambiguity for which structural fix to ship. Phase 9 may reuse for any multi-cause residual.
- **Measurement artifact pattern** -- D-02 introduces `08-MEASUREMENT.md` as durable audit record for gate decision + raw measurement data. Pattern enables Phase 9 audit revisits and fix-surface re-attribution if Plan 4 attribution turns out wrong. Similar to Phase 7 `traces/` infrastructure but at the measurement-decision layer rather than the trace-capture layer.
- **Auto-extend on borderline tri-state** -- D-03 introduces PASS / FAIL / INCONCLUSIVE classification with mechanical borderline band. Pattern resolves measurement ambiguity with more data, not more judgment. Cost-aligned with evidence quality (pays for n=5 only when n=3 is insufficient).
- **Evidence-weighted P3 carry-forward selection** -- ROADMAP Phase 8 entry stated "P3 items can sequence by evidence weight"; D-01 operationalizes this verbatim by including P8-18 + FIND-F obs (empirical evidence exists) and deferring P8-03 + P8-12 (defensive rules without evidence). Pattern: include carry-forward items with empirical anchors; defer items with hypothetical-only motivation.
- **Atomic 5-surface version sync** (Plan 07-15 / 07-17 canon) -- preserved as hard constraint per D-04 even though version cadence is otherwise non-load-bearing. Whatever trail the planner picks, the 5 surfaces (`plugin.json` + 4 SKILL.md frontmatter) must move together within a single commit.
- **Byte-identical 4-skill canon for shared blocks** (Phase 5.6 Plan 06/07 / Phase 6 Plan 02 / Phase 7 Plan 07-01 + 07-07 + 07-09) -- Phase 8 does NOT add to this canon directly. Plan 4 escalation path (if triggered) extends a per-section XML pattern that exists in reviewer + security-reviewer to advisor (3-skill canon would emerge for that block; advisor is structurally different from plan + execute so 4-skill canon would not apply for this specific block).

### Integration Points

- **3 plugin surface files modified by Plans 1 + 4 + 5 + 6:** `lz-advisor.execute/SKILL.md` (Plan 1 removal); `agents/advisor.md` (Plan 4 conditional); `references/context-packaging.md` (Plan 5 mechanical edits + Plan 6 sub-rule extension). Plan 7 (FIND-F obs) does NOT modify any plugin surface.
- **1 plugin manifest file:** `plugins/lz-advisor/.claude-plugin/plugin.json` -- version bump per planner discretion + atomic 5-surface sync.
- **4 SKILL.md frontmatter `version:` fields:** `lz-advisor.plan` + `lz-advisor.execute` + `lz-advisor.review` + `lz-advisor.security-review` -- version bump synced with `plugin.json`.
- **1 REQUIREMENTS.md row removed:** `GAP-G2-wip-scope` (Plan 1). Possibly 1 row added by Plan 6 for advisor-narrative-SD-pv-extension (planner's discretion -- could be tracked as informal residual closure instead of new requirement).
- **Smoke-test directory `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/` gains 2 NEW fixtures + modifies 3 existing fixtures:**
  - NEW: `F-class-2-escalation.sh` (Plan 7); `G-advisor-narrative-sd-pv.sh` or similar (Plan 6 -- planner names).
  - MODIFIED: `E-verify-before-commit.sh` (Plan 1 removal); `D-reviewer-budget.sh` (Plan 2 regex + optional symmetric PFV); `D-security-reviewer-budget.sh` (Plan 2 regex + asymmetric PFV); `D-advisor-budget.sh` (Plan 3 instrumentation + optional Plan 4 conditional extension).
- **Phase 8 phase directory `.planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/` gains:**
  - `08-MEASUREMENT.md` (Plan 3 measurement artifact)
  - Per-plan SUMMARY.md files (Plans 1-7; standard GSD execution output)
  - Per-plan PLAN.md files (TBD by `/gsd-plan-phase 8`)
  - VERIFICATION.md (post-execution)
  - Possibly UAT-related artifacts (subdirectories for Plan 7 UAT session traces, etc.)

</code_context>

<specifics>
## Specific Ideas

- **"Highest quality, no shortcuts" user directive 2026-05-08 is the load-bearing meta-decision.** It anchors D-02 (compound OR-gate over simpler gate C / C2 alternatives), D-03 (auto-extend on borderline over single-shot), and the per-item soft outlier band choice in D-02. The user explicitly rejected simplification when offered.
- **Version numbers don't matter (D-04) is a constraint LOOSENING, not strengthening.** It collapses the "Version bump cadence" gray area to non-load-bearing concern. Atomic 5-surface sync is the only preserved hard constraint. Planner has full discretion on PATCH-vs-MINOR-vs-MAJOR classification; downstream consumer signal preservation is NOT a concern in pre-release.
- **The compound OR-gate is the most-engineered single design decision in Phase 8.** Each disjunct (D1 code-block, D2 aggregate) has its own evidentiary structure (>=2/3 FAIL guard + soft outlier band). The disposition rule (D1 -> fragment-grammar extension; D2 -> density audit; both -> both; neither -> close) eliminates planner judgment-call ambiguity for fix-surface attribution. The measurement artifact (`08-MEASUREMENT.md`) is the durable audit record.
- **P2-ADVISOR is the most evidentially-thin residual in Phase 8.** n=1 fixture-grade evidence (Plan 07-16 against `session-1-plan.jsonl`: 155w / 100w cap; items 3, 5, 7 over per-item cap with inline code) is the entirety of the empirical anchor. Plan 07-12 precedent (security-reviewer 326w on 0.12.1 reclassified as stochastic outlier after 3x re-run) is the strongest reason to MEASURE before SHIPPING structural redesign. The compound OR-gate honors this precedent verbatim per disjunct.
- **P1-SHAPE + PFV are zero-cost mech fixes via `--from-trace`.** Plan 2 validates parser regex change against 5 captured shape-regression traces without spawning claude -p. PFV threshold change needs n=3 fresh re-runs (cannot trace-replay because the threshold change affects which findings cross the cap on FUTURE outputs; not retroactively). But the SHAPE fix is 100% trace-replay validated.
- **P0 wip reversal is mechanically simple but contract-shape-wise significant.** ~60 lines removed across 3 files. The wip-discipline rule (Plan 07-08) DOES fire correctly per its specification per Phase 7 UAT evidence (5 of 10 commits used `wip:` prefix; carve-outs respected). The reversal is a project-level decision to drop the contract, not a defect-driven removal. Documentation in plan should preserve this distinction (the rule worked; we just don't want it).
- **Plan 6 (P8-18) and Plan 7 (FIND-F obs) are the smallest-effort P3 surfaces in Phase 8.** Plan 6 adds 1 sub-rule + 1 smoke fixture. Plan 7 designs 1 trigger scenario + 1 UAT session + (optional) 1 smoke fixture. Both have clear acceptance criteria; both are evidence-bearing rather than defensive.
- **P8-03 and P8-12 deferral is principled, not lazy.** Both are well-motivated defensively but lack empirical evidence demanding them. The ROADMAP entry's "carry-forward by evidence weight" sequencing principle explicitly accommodates deferral. Phase 9 should re-evaluate if Phase 8 execution OR follow-up UAT surfaces evidence.
- **The disposition rule is the highest-novelty pattern introduced in Phase 8.** It treats fix-surface attribution as a mechanical decision derived from gate output rather than a planner judgment call. This pattern, the measurement-artifact pattern, and the auto-extend-on-borderline tri-state pattern compose into a re-usable "measurement-driven structural-redesign-gate" architecture that Phase 9+ can adapt for any multi-modal residual.

</specifics>

<deferred>
## Deferred Ideas

### Reviewed Todos (not folded)

- **`research-rtk-command-suitability-for-skills-and-agents`** (todo from 2026-04-26) -- matched at score 0.6 on keyword overlap (status, gsd, verify, phase, advisor) but actual subject (token-saving wrapper for review + security-review skills) is unrelated to Phase 8's verify-chain-integrity sealing residuals. Reviewed; explicitly NOT folded into Phase 8 scope.

### Carry-forward to Phase 9

- **P8-03 Pre-Verified Contradiction Rule** -- defensive rule (executor must resolve contradiction between synthesized pv-* block and subsequent finding). No empirical FAIL evidence in any UAT. Defer until Phase 9 UAT surfaces actual contradiction failure.
- **P8-12 Cross-Skill Hedge Tracking auto-detect** -- enhancement to Plan 07-03 D-07 sub-rule (ii) prose foundation (executor auto-detects hedge markers across skill boundaries vs current manual per-skill prompt). No empirical FAIL evidence. Defer until Phase 9 UAT surfaces actual cross-skill hedge stripping failure.
- **Per-section `<output_constraints>` XML extension to `advisor.md`** -- Plan 4 escalation path if measurement reveals fragment-grammar template structurally can't bind on code blocks. Default fix is fragment-grammar template extension (PATCH-tier refinement); escalation is contract-shape change (MINOR-tier). Only ships in Phase 8 IF Plan 3 measurement triggers escalation; otherwise carries to Phase 9 as available structural alternative.
- **n=10 statistical gate (Wilson 95% CI) for P2-ADVISOR** -- Plan 07-15 E.1 precedent for n=10 statistical evidence-grading. Phase 8 uses n=3 + auto-extend to n=5 as the default; n=10 escalation reserved for "still INCONCLUSIVE at n=5" worst case (Plan 3.6 conditional, not pre-committed).
- **1.0.0 marketplace-readiness cut** -- deferred until Phase 8 closes empirically AND follow-up regression cycle confirms zero residuals AND P8-03 + P8-12 are either closed or definitively deferred to v2.
- **Reviewer + security-reviewer per-section `<output_constraints>` XML contract changes** -- Plan 07-14 canon stays in Phase 8. If Phase 9 UAT surfaces evidence of regression in the existing canon (e.g., per-finding cap drift on reviewer), addressed separately.
- **Hard-rules layer for word-budget** -- Phase 7 D-03 deferred unless hybrid (descriptive triggers + worked example + structural sub-caps) proves insufficient. Phase 8 measurement evidence may inform Phase 9 decision to reconsider.
- **`maxTurns` cap removal or SendMessage-based bidirectional advisor** -- architectural change, deferred since Phase 5.3 + 5.4 + 5.5 + 5.6 + 6 + 7. Still deferred.
- **README "Recommended prompt shape" section** -- deferred from Phase 5.5 / 5.6 / 6 / 7. Phase 8 does not address; remains polish-phase concern.
- **Pattern D as `claude -p` linter / pre-flight check** -- deferred from Phase 6. Still deferred.
- **Plugin README update for Phase 8 contract changes** -- internal contract refinement; defer to next polish phase.
- **TeammateIdle hook analog for verify-before-commit** -- out of scope per "no hooks for v1" constraint.
- **Reviewer iterative re-invoke loop** (multiple `<verify_request>` rounds) -- deferred per Spotify Honk one-shot principle (Phase 7 D-04).
- **Pro / Free plan tier UAT cross-tier verification** -- structurally impossible from Team subscription. Inherits prior deferred status.

</deferred>

---

*Phase: 08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle*
*Context gathered: 2026-05-08*
