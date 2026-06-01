# lz-advisor

## What This Is

A Claude Code marketplace plugin that implements the advisor strategy -- pairing a stronger advisor model (Opus) with a faster executor model (Sonnet) -- using only Claude Code's native plugin components (skills, agents). No Claude API or `advisor_20260301` tool dependency. Users invoke skills that orchestrate an executor-advisor loop where Sonnet drives the work and consults an Opus agent at strategic moments for concise guidance.

## Core Value

Near-Opus intelligence at Sonnet cost for coding tasks, achieved through strategic advisor consultation at high-leverage moments rather than running Opus end-to-end.

## Requirements

### Validated

- [x] Plugin manifest and directory structure (INFRA-01, INFRA-02) -- Validated in Phase 1
- [x] Opus advisor agent discoverable and invocable (ADVR-01, ADVR-02, ADVR-03, ADVR-04, ADVR-05) -- Validated in Phase 1
- [x] Advisor timing reference file (INFRA-03) -- Validated in Phase 1
- [x] Agent namespaced as `lz-advisor:lz-advisor` when loaded via `--plugin-dir` -- discovered in Phase 1 UAT
- [x] Plan skill (`/lz-advisor.plan`) -- Sonnet orients, Opus advises, Sonnet produces actionable plan -- Validated in Phase 2
- [x] Execute skill (`/lz-advisor.execute`) -- full executor-advisor loop with 6 phases (orient, consult, execute, durable, final, complete) -- Validated in Phase 3
- [x] Execute skill accepts optional plan from `/lz-advisor.plan` via @ file mention -- Validated in Phase 3
- [x] Shared advisor-timing reference at plugin-root `references/` -- Validated in Phase 3
- [x] Review skill (`/lz-advisor.review`) -- Sonnet scans code, packages findings, Opus reviewer provides deep quality analysis with cross-cutting patterns -- Validated in Phase 4
- [x] Security review skill (`/lz-advisor.security-review`) -- Sonnet scans for attack surfaces, packages findings, Opus security-reviewer provides OWASP-informed threat analysis -- Validated in Phase 4
- [x] Both review skills produce structured severity-classified output (Critical/Important/Suggestion for review, Critical/High/Medium for security) -- Validated in Phase 4
- [x] Both review skills use scan-consult-output pattern consistent with plan and execute skills -- Validated in Phase 4
- [x] Review + security-review scan phases derive scope mechanically from git (not narrative) -- Validated in Phase 5.4 (Mechanism C + Narrative-Isolation Rule; live smoke test J)
- [x] Context-packaging Common Contract rules 5, 5a, 6 (external claim verification, fetched content isolation, graceful tool-use degradation) -- Validated in Phase 5.4 (live smoke tests C, B, H, I)
- [x] D-11 per-skill allowed-tools profile ladder (A for review skills, B for plan, C for execute) with WebSearch + WebFetch on all four -- Validated in Phase 5.4
- [x] Advisor + reviewer + security-reviewer response-structure polish: Position B Critical marker, inline Assuming X framing, two-slot outputs -- Validated in Phase 5.4 (D-runtime + E-runtime + F-runtime all [OK] in DEF-response-structure.sh; E-runtime closed at skill-orchestration layer via lz-advisor.plan Phase 3 stdout pass-through, Plan 07)

### Active

None -- v1.0 is shipped (plugin 1.0.0). Every requirement above is Validated; the full set is archived in `milestones/v1.0-REQUIREMENTS.md`. The next milestone's requirements are defined via `/gsd-new-milestone`.

The items previously tracked here all shipped in v1.0 and are Validated:
- [x] Advisor agent provides concise guidance (under 100 words, enumerated) -- Phase 5.2 (maxTurns: 3 structural fix)
- [x] Skills inherit the session model for the executor (optimized for Sonnet 4.6) -- Phase 5
- [x] Advisor runs on Opus (the `opus` alias; runtime-proven 2026-06-01 on Opus 4.8) -- Phase 1
- [x] Advisor consultation timing follows Anthropic's suggested patterns -- Phase 5
- [x] Advisor output trimmed: under 100 words, enumerated steps -- Phase 5.2
- [x] Plugin components namespaced under `lz-advisor` -- Phase 5.2 introduced dotted `lz-advisor.*` skill names; Phase 9 reversed them to plain `<skill>` dirs so the qualified form is the clean `lz-advisor:<skill>`

### Out of Scope

- Claude API / Anthropic SDK dependency -- plugin uses Claude Code's Agent tool only
- `advisor_20260301` server-side tool -- plugin replicates the pattern client-side
- Hooks -- advisor consultation stays purely skill-driven for v1 (cost control, no noise)
- Task-type-specific skills (refactoring, testing, infra) -- phase-based skills cover all task types
- Automatic advisor triggering -- user explicitly invokes skills

## Context

- Based on Anthropic's "advisor strategy" blog post (April 9, 2026) and advisor tool docs
- The API advisor tool shows: Sonnet + Opus advisor = +2.7pp on SWE-bench Multilingual at 11.9% lower cost
- Key insight: advisor adds most value on first call (before approach crystallizes) and final check (after work done)
- Suggested system prompt timing: after orientation before substantive work, when stuck, when changing approach, when done
- Trimming advisor output by ~35-45% with conciseness instruction without changing call frequency
- Claude Code's Agent tool supports `model: "opus"` overrides for spawning advisor agents
- Plugin-dev and skill-creator plugins define best practices for component design
- Skill-creator plugin is authoritative for agent skill guidelines, overriding plugin-dev overlap
- **Shipped v1.0 (2026-06-01, plugin 1.0.0):** 4 skills (`/plan`, `/execute`, `/review`, `/security-review`) + 3 Opus agents (advisor, reviewer, security-reviewer); pure Markdown/YAML, zero external dependencies; hardened across 16 phases of UAT-driven field testing. Re-audit: 52/52 requirements, 6/6 integration, 5/5 E2E flows, 16/16 Nyquist-complete.

## Constraints

- **Platform**: Claude Code marketplace plugin only -- no standalone API usage
- **Dependencies**: Zero external dependencies -- Claude Code Agent tool is the only mechanism
- **Model availability**: Requires user has access to Sonnet 4.6 (or later) and Opus 4.7 (or later). The `model: opus` alias auto-resolves to the current Opus generation.
- **Prompt optimization**: Executor prompts optimized for Sonnet 4.6; advisor prompts optimized for Opus 4.7 (literal instruction following, lower baseline tool usage, task-calibrated response length).
- **Cost**: Advisor consultations should be strategic (2-3 per task), not per-tool-call

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Phase-based skills over task-type skills | Advisor timing pattern is the same regardless of task type (refactor, test, feature) -- prompt concern, not orchestration concern | Good (shipped v1.0) |
| No hooks for v1 | Hooks are global (can't scope to skill execution), lack conversation context, and would add cost/noise without clear value | Good (shipped v1.0) |
| Single advisor agent, multiple skills | Skills define the workflow; agent defines the advisor persona. Review variants differ by prompt, not orchestration | Good (shipped v1.0) |
| Inherit session model for executor | Users choose their session model; plugin shouldn't override. Skills optimized for Sonnet 4.6 but work with any model | Good (shipped v1.0) |
| Agent file renamed to `advisor.md` (qualified: `lz-advisor:advisor`) | Original `lz-advisor.md` produced redundant `lz-advisor:lz-advisor`. Renamed to `advisor.md` so qualified name is `lz-advisor:advisor`. Skills use `lz-advisor:advisor` as `subagent_type`. | Phase 1 UAT rename |
| All skills use advisor pattern (no `context: fork`) | Review skills with `context: fork` + `model: opus` would be indistinguishable from `/review` + `/model opus`. Advisor pattern (Sonnet scans, packages context, Opus advises) genuinely differentiates. Consistent architecture across all skills. | Good (shipped v1.0) |
| Conciseness calibration deferred to Phase 2 | Under 100 words constraint not respected with broad open-ended questions. Scoped skill prompts may suffice; measure with real invocations before tuning agent system prompt. | Phase 1 UAT finding |
| Mechanism C: review scope derives from git diff, not conversation | Plan narrative claiming "file X is unchanged" previously collapsed review scope. Mechanical derivation via `git diff HEAD --name-only` + `git ls-files --others --exclude-standard` with explicit Narrative-Isolation Rule makes the reviewer robust to executor framing. | Phase 5.4 validated (D-04/D-05/D-06) |
| Common Contract rule 5 + 5a: executor pre-verifies external claims; fetched content is untrusted source material | Executors routinely punt on "is method X still exported from package Y" rather than resolve during orient. Rule 5 mandates pre-verification with Pre-Verified Package Behavior Claims block; rule 5a wraps WebSearch/WebFetch content in `<fetched source trust="untrusted">` tags to block prompt-injection from docs. | Phase 5.4 validated (D-07/D-08/D-09/D-10) |
| Common Contract rule 6: graceful degradation on tool-use failure | Denied tools previously produced "Interrupted" halt. Rule 6 enumerates four sub-rules: primitive swap on first denial, cheaper-primitive fallback, mark-unavailable-and-continue, never halt. Pairs with D-11 three-profile allowed-tools ladder. | Phase 5.4 validated (D-13) |
| Reverse Phase 5.2 skill rename: dotted `lz-advisor.<skill>` -> plain `<skill>` | The qualified `plugin:skill` form (`lz-advisor:plan`) already supplies namespacing; the `lz-advisor.` directory prefix only produced the redundant `lz-advisor:lz-advisor-plan`. The directory name drives the slash command, so plain dirs yield the clean `lz-advisor:<skill>`. | Phase 9 complete (0.15.0); D-08 probe confirmed all 4 skills resolve to `lz-advisor:<skill>`, not the built-in `/review` / `/security-review` |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check -- still the right priority?
3. Audit Out of Scope -- reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-01 -- **v1.0 MILESTONE COMPLETE** (plugin 1.0.0). Re-audit clean on all hard gates (52/52 requirements, 6/6 integration, 5/5 flows, 16/16 Nyquist-complete); the first-audit tech_debt is resolved (Phase 10 doc-hygiene + the finding-resolution session: Phase 01 human_verification empirically closed, FIND-F closed by-design via web-deprivation re-verification, and the ADVR-04 / ADVR-06 / CLAUDE.md-effort definition drifts reconciled). Atomic 5-surface SemVer bump 0.15.0 -> 1.0.0; README "What's New" collapsed to a standalone 1.0.0 entry. Milestone archived to `milestones/v1.0-*`; ROADMAP collapsed to a milestone index; REQUIREMENTS archived + removed (fresh set comes via `/gsd-new-milestone`). Tagged `v1.0` (NOT pushed -- marketplace publication deferred per user directive until after a successful audit + completion). Advisor runtime-proven on Opus 4.8.*

*Last updated: 2026-06-01 -- Phase 9 complete (plugin 0.15.0; final phase of v1.0). Reversed the Phase 5.2 D-01/D-02 skill naming: the four skill directories + `name:` frontmatter fields renamed from the dotted `lz-advisor.<skill>` pattern back to plain `<skill>` (`plan`, `execute`, `review`, `security-review`) via `git mv` (history preserved), so the qualified invocation is now the clean `lz-advisor:<skill>` instead of the redundant `lz-advisor:lz-advisor-<skill>`. Cross-reference sweep across operational surfaces only (4 SKILL.md, 3 references, 2 agents, README, .gitignore, CLAUDE.md, 4 eval JSON + conciseness-assessment.md + 4 eval workspace dirs, 11 maintained smoke fixtures); atomic 5-surface 0.14.2 -> 0.15.0 bump; the `Agent(lz-advisor:<agent>)` colon refs (D-03) and the ~362 frozen historical `.planning/` artifacts + these root planning-doc dotted refs (D-06) left UNCHANGED as accurate history. Empirically closed the open Phase 5.2 D-07 "bet on resolution" via the D-08 headless probe: all 4 skills resolve headlessly to `<command-name>/lz-advisor:<skill></command-name>` and review/security-review resolve to the PLUGIN skill, not Claude Code's built-in `/review` / `/security-review` (verified against the 4 `claude -p` session transcripts on disk). Code review clean (0 critical / 0 warning / 1 info); goal verification 10/10 decisions D-01..D-10. Canonical invocation is context-dependent (D-07): bare `/plan` interactive (picker disambiguates), qualified `/lz-advisor:plan` headless.*

*Last updated: 2026-05-31 -- Post-Phase-8 refactor (plugin 0.14.2, commit ca7137f). Removed the two cross-skill body references in lz-advisor.plan (which named lz-advisor.execute's E.2/E.3 sections) per progressive disclosure (plugin-dev skill-development: information lives in SKILL.md OR a references file, not both). Extracted the canonical surface-to-target mapping + worked examples + stale-daemon caveat into `references/verify-target-selection.md`; both skills now reference the shared doc, execute keeps the load-bearing principle inline; atomic 5-surface 0.14.1 -> 0.14.2 bump. Supersedes Phase 8 REVIEW IN-01 (plan/execute mapping divergence) at the root. Validated end-to-end by a plan+execute Compodoc UAT against ngx-smart-components (uat-refactor-0.14.2/FINDINGS.md): plan emits a Validate step naming the Storybook target via the shared doc; execute E.3 verify-target selection (build-storybook, not nx test) + GAP-S10 final-consult packing both preserved; advisor final consult caught a real dev-server-target `outputs` gap (fixed same run). New convention recorded: memory feedback_no_cross_skill_body_references.*

*Last updated: 2026-05-31 -- Phase 8 complete (plugin 0.14.1). Original Phase 8 (Plans 08-01..08-07) sealed the Phase 7 residuals + reversed the wip-discipline contract at 0.14.0 (RES-WIP-DISCIPLINE-REVERSAL, RES-SHAPE-REGRESSION-PARSER, RES-PFV-OUTLIER-CAP, RES-ADVISOR-FRAGMENT-GRAMMAR closed structurally via 08-MEASUREMENT.md n=3 D-02 PASS, WR-04/05 reconciled, P8-18 + FIND-F-CLASS-2-OBSERVABILITY closed). Phase 8 was then reopened by the 2026-05-31 natural Compodoc UAT (/gsd-verify-work 8 against ngx-smart-components) which surfaced 2 PLUGIN gaps, both now closed via /gsd-execute-phase 8 --gaps-only (verified PASS 4/4 each): GAP-S9 (Plan 08-08) -- execute Phase 3.5 E.3 change-surface verify-target selection + stale-daemon tooling-freshness clause + plan-skill change-surface-matched Validate-step rule (defense-in-depth against the verify-target mismatch that hid a broken `nx storybook` dev-server across all 8 UAT sessions); GAP-S10 (Plan 08-09) -- execute Phase 5 packs post-change content (`## Relevant File Contents`) into the final consult + advisor.md "synthesize from packed content, do not re-locate changed files on disk" clause (maxTurns stays 3, effort high -- prompt-side, not a budget increase), atomic 5-surface 0.14.0 -> 0.14.1 PATCH bump. Code review clean (0 critical / 0 warning). Carry-forward Phase 9 watch items (pre-existing, non-blocking): natural Class-2 escalation-hook re-validation + optional marketplace publication.*

*Last updated: 2026-05-05 -- Phase 7 sealed (passed_with_residual; plugin 0.12.2). Plan 07-12 HALTED at Task 1 by design: 326w security-reviewer aggregate on plugin 0.12.1 was empirically disconfirmed as a stochastic outlier (3x re-run mean 272.3w, 3/3 PASS); residual-security-reviewer-budget-0_12_1 RECLASSIFIED, not closed via structural change. Plan 07-13 shipped 4/4: WR-01 Hedge Marker carve-out severity-vocab + WR-02 5-surface legacy lexicon alignment + WR-03 NEW self-contained `## Class-2 Escalation Hook` section in security-reviewer.md (replacing broken cross-file pointer to reviewer.md) + plugin 0.12.1 -> 0.12.2 PATCH across 5 surfaces. gsd-code-reviewer surfaced 2 warnings (WR-04 schema BNF still permits `|high|medium` at context-packaging.md:376; WR-05 worked-example shows `Severity: High` at context-packaging.md:317) deferred to Phase 8 candidates per verifier ruling. OUT-OF-SCOPE residual remains: residual-wip-discipline-reversal (Phase 8 reversal target per user directive 2026-05-03 / memory feedback_no_wip_commits.md; bumps 0.12.2 -> 0.13.0 for contract-shape change).*

*Last updated: 2026-05-04 -- Phase 7 gap-closure complete (passed_with_residual; plugin 0.12.1). Plans 07-10 + 07-11 close the 2 in-phase residuals from the 0.12.0 6-session UAT (residual-advisor-budget closed structurally by Plan 07-10 fragment-grammar adaptation of advisor.md; residual-pre-verified-format closed structurally by Plan 07-11 D2 dual-surface differentiation in Rule 5b). Plugin bumped 0.12.0 -> 0.12.1 PATCH across 5 surfaces. Empirical regression-gate (D-advisor-budget.sh + B-pv-validation.sh against 0.12.1) tracked as 2 pending HUMAN-UAT items. Only OUT-OF-SCOPE residual remaining: residual-wip-discipline-reversal (Phase 8 reversal target per user directive 2026-05-03 / memory feedback_no_wip_commits.md; bumps 0.12.1 -> 0.13.0 for contract-shape change).*

*Last updated: 2026-05-03 -- Phase 7 complete (passed_with_residual; plugin 0.12.0). Closed all 15 requirement IDs (FIND-A/B.1/B.2/C/D/E.1/E.2/F/G/H/silent-resolve + GAP-G1+G2-empirical/G1-firing/G2-wip-scope/D-budget-empirical) across 9 plans. Plan 07-09 word-budget gap closure (fragment-grammar emit template + reviewer/security-reviewer effort xhigh -> medium) empirically verified on plugin 0.12.0 via D-reviewer-budget.sh (aggregate 275w / 300 cap, exit 0) + D-security-reviewer-budget.sh (exit 0). Compodoc UAT plan session against ngx-smart-components confirmed Plan 07-07 default-on ToolSearch (1x) + Pattern D web-first activation (WebSearch 4x + WebFetch 5x) + Plan 07-02/07-03 reconciliation rule firing. Two residuals tracked for Phase 8: advisor word budget at 118w / 100 cap (Plan 07-09 explicitly excluded advisor; Plan 07-04 advisor sub-cap residual) + pv-* schema clarification on plan-artifact-body format. Plugin bumped 0.11.0 -> 0.12.0 across 5 surfaces.*

*Last updated: 2026-04-30 -- Phase 6 complete (gap-closure cycle, plugin 0.9.0). Pattern D shipped + 3 follow-up amendments closed: G1+G2 trust-contract rewrite (provenance-based source classification + ToolSearch-availability rule, byte-identical across 4 SKILL.md) and G3 Class 2-S security-currency taxonomy (npm audit -> GHSA -> WebSearch CVE ordering with Compodoc worked example). Plugin bumped 0.8.9 -> 0.9.0 (minor for contract-shape change). Verification verdict: PASSED with documented overrides -- security-review replay PASS confirms G3 closure empirically (5 npm audit invocations + GHSA URL + transitive HIGH advisories anchored); G1+G2 structural surface lands but plan-fixes / execute-fixes empirical replays still show 0 web tools on plugin 0.9.0. Empirical residual deferred to Phase 7 alongside Findings A / B.1+B.2 / C / D from PHASE-7-CANDIDATES.md. v1.0 milestone ready for audit.*
