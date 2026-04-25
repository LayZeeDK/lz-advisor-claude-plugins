# Roadmap: lz-advisor

## Overview

This roadmap delivers a Claude Code marketplace plugin implementing the advisor strategy -- pairing an Opus advisor agent with Sonnet executor skills. All four skills use the same pattern: Sonnet executor scans/orients, packages context, and consults an Opus advisor agent for strategic guidance. The build order follows hard dependencies: the advisor agent must exist before any skill can reference it, the plan skill validates the consultation mechanism before the more complex execute skill builds on it, review skills reuse the proven pattern for code analysis, and polish addresses cross-cutting description optimization that requires working skills.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Plugin Scaffold and Advisor Agent** - Working plugin with Opus advisor agent discoverable and invocable
- [ ] **Phase 2: Plan Skill** - Users can get Opus-guided strategic plans before writing code
- [ ] **Phase 3: Execute Skill** - Users can execute tasks with full executor-advisor loop
- [ ] **Phase 4: Review Skills** - Users can get Opus-powered code and security reviews of completed work
- [ ] **Phase 5: Polish and Marketplace Readiness** - Plugin is discoverable, documented, and ready for marketplace

## Phase Details

### Phase 1: Plugin Scaffold and Advisor Agent
**Goal**: A valid marketplace plugin structure with an Opus advisor agent that provides concise strategic guidance when invoked
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, ADVR-01, ADVR-02, ADVR-03, ADVR-04, ADVR-05, ADVR-06
**Success Criteria** (what must be TRUE):
  1. Plugin loads without errors when installed via `--plugin-dir` (verified with `claude --debug`)
  2. User can invoke the `lz-advisor` agent via the Agent tool and receive a response from Opus 4.6
  3. Advisor responses are concise (under 100 words, enumerated steps) and strategic, not verbose explanations
  4. Advisor reads project files when needed but never writes or modifies anything
  5. Reference file for advisor timing guidance exists and stays under the 5,000-token compaction limit
**Plans**: 2 plans

Plans:
- [x] 01-01-PLAN.md -- Plugin manifest, directory structure, and Opus advisor agent definition
- [x] 01-02-PLAN.md -- Advisor timing reference file and plugin README

### Phase 2: Plan Skill
**Goal**: Users can invoke `/lz-advisor.plan` to get an Opus-informed strategic plan for any coding task
**Depends on**: Phase 1
**Requirements**: PLAN-01, PLAN-02, PLAN-03, PLAN-04, PLAN-05, PLAN-06
**Success Criteria** (what must be TRUE):
  1. User invokes `/lz-advisor.plan` and the executor explores the codebase before consulting the advisor
  2. Advisor receives packaged orientation findings (not raw conversation history) and returns concise strategic direction
  3. Executor expands advisor guidance into a detailed, actionable plan artifact (written to file or displayed)
  4. Skill runs on the session model (Sonnet) for execution while consulting Opus only for strategic direction
**Note from Phase 1 UAT**: Advisor conciseness constraint (under 100 words) was not respected when invoked with broad open-ended questions. Calibrate during Phase 2 -- the executor's scoped prompts may suffice, or the agent system prompt may need strengthening. Measure with real skill-driven invocations before tuning.
**Plans**: 1 plan

Plans:
- [x] 02-01-PLAN.md -- SKILL.md with orient-consult-produce workflow and .gitkeep cleanup

### Phase 3: Execute Skill
**Goal**: Users can invoke `/lz-advisor.execute` to execute coding tasks with strategic Opus consultation at high-leverage moments
**Depends on**: Phase 2
**Requirements**: IMPL-01, IMPL-02, IMPL-03, IMPL-04, IMPL-05, IMPL-06, IMPL-07, IMPL-08, IMPL-09, IMPL-10
**Success Criteria** (what must be TRUE):
  1. Executor consults advisor before substantive work (after orientation) and packages relevant context into each consultation
  2. Executor consults advisor when stuck (recurring errors, approach not converging) or considering a change of approach
  3. Executor makes deliverable durable (writes files, commits) before final advisor review, then consults advisor before declaring done
  4. When executor findings conflict with advisor guidance, the reconciliation pattern surfaces the conflict in one more advisor call rather than silently ignoring advice
  5. Skill accepts an optional plan file (from `/lz-advisor.plan` or other sources) and uses it to inform the implementation
**Plans**: 2 plans

Plans:
- [x] 03-01-PLAN.md -- Move advisor-timing.md to shared references/ and update plan skill output path
- [x] 03-02-PLAN.md -- Execute skill SKILL.md with 6-phase executor-advisor loop

### Phase 4: Review Skills
**Goal**: Users can get thorough Opus-advised code quality reviews and security-focused threat analysis of completed work
**Depends on**: Phase 1
**Requirements**: REVW-01, REVW-02, REVW-03, REVW-04, REVW-05, REVW-06, SECR-01, SECR-02, SECR-03, SECR-04, SECR-05, SECR-06, SECR-07
**Success Criteria** (what must be TRUE):
  1. User invokes `/lz-advisor.review` and Sonnet scans code, packages findings, then Opus advisor provides deep quality analysis
  2. User invokes `/lz-advisor.security-review` and Sonnet scans for attack surfaces, packages findings, then Opus advisor performs threat modeling with OWASP Top 10 lens
  3. Both review skills produce structured output with actionable, severity-classified findings
  4. Both review skills use the same executor-advisor pattern as plan and implement (consistent architecture)
**Plans**: 2 plans

Plans:
- [x] 04-01-PLAN.md -- Validation script, reviewer agent, and code quality review skill
- [x] 04-02-PLAN.md -- Security-reviewer agent and security review skill

### Phase 5: Polish and Marketplace Readiness
**Goal**: Plugin restructured for marketplace distribution, agents verified, skill descriptions optimized for discoverability, and plugin ready for publication
**Depends on**: Phase 4
**Requirements**: INFRA-04
**Success Criteria** (what must be TRUE):
  1. Plugin lives at plugins/lz-advisor/ following marketplace conventions
  2. All agents pass plugin-dev validation with expanded system prompts (500+ words)
  3. Every skill description optimized via run_loop.py with improved eval scores
  4. Plugin installs from GitHub marketplace and all skills appear in user's skill list
**Plans**: 5 plans

Plans:
- [x] 05-01-PLAN.md -- Restructure plugin to plugins/lz-advisor/ and marketplace setup
- [x] 05-02-PLAN.md -- Agent verification and fixes against plugin-dev guidelines
- [x] 05-03-PLAN.md -- Generate eval queries with cross-skill negatives
- [x] 05-04-PLAN.md -- Run description optimization pipeline and measure conciseness
- [x] 05-05-PLAN.md -- Final validation, README updates, and marketplace install test

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Plugin Scaffold and Advisor Agent | 0/2 | Planning complete | - |
| 2. Plan Skill | 0/1 | Planning complete | - |
| 3. Execute Skill | 0/2 | Planning complete | - |
| 4. Review Skills | 0/2 | Planning complete | - |
| 5. Polish and Marketplace Readiness | 0/5 | Planning complete | - |

### Phase 05.6: Diagnose E-runtime regression and re-run full Compodoc UAT to close Phase 5.5 Plan 06 (INSERTED)

**Goal:** Diagnose and close the Finding E semantic regression in the advisor literal-frame contract for thin-context plan tasks; re-run the full 6-session Compodoc UAT against the fixed plugin to close Phase 5.5 Plan 06's D-11 gates. Gap 1 (plan-skill Orient phase uses node_modules archaeology instead of WebFetch/WebSearch for public-library tasks, surfaced via 05.6-UAT.md rerun under plugin 0.8.1) closed via Plan 05 with tool-preference prose edits + SemVer patch 0.8.1 -> 0.8.2. Gap 2 (regression of Plan 05 fix under sonnet/medium even with authoritative docs inlined) closed via Plan 06 with <context_trust_contract> + <orient_exploration_ranking> XML blocks across all 4 SKILLs + Pattern C in Rule 5 + SemVer patch 0.8.2 -> 0.8.3.
**Requirements**: ADVR-02 (umbrella advisor-calibration requirement)
**Depends on:** Phase 5
**Plans:** 7 plans (6 complete, 1 pending Plan 07 gap-closure)

Plans:
- [x] 05.6-01-PLAN.md -- Forward-capture diagnostic for Finding E regression (completed 2026-04-24)
- [x] 05.6-02-PLAN.md -- Density bifurcation (two-example advisor density) + DEF JSONL-layer redesign (Shape 3 supersession) (completed 2026-04-24)
- [x] 05.6-03-PLAN.md -- Plugin version bump 0.8.0 -> 0.8.1 (SemVer patch) (completed 2026-04-24)
- [x] 05.6-04-PLAN.md -- Stage 0 DEF fix-validation + Stage 2 6-session UAT replay + VERIFICATION.md with D-11 gates (completed 2026-04-24)
- [x] 05.6-05-PLAN.md -- Orient-phase tool-preference ranking: WebFetch over node_modules archaeology (plan + execute skills + context-packaging Rule 5 amendment) + SemVer patch 0.8.1 -> 0.8.2 (closes Gap 1 from 05.6-UAT.md)
- [x] 05.6-06-PLAN.md -- Context Trust Contract + Orient Exploration Ranking (Pattern A + B XML blocks) replacing Plan 05's failed soft-preference bullet across all 4 SKILL.md + Pattern C in context-packaging.md Rule 5 + SemVer patch 0.8.2 -> 0.8.3 (closes Gap 2 from 05.6-UAT.md)
- [ ] 05.6-07-PLAN.md -- SKILL.md de-conflict (remove permissive Inside-node_modules clause from plan + execute SKILL.md L74/L85 leaving only the unconditional prohibition; brings plan + execute to byte-identical prohibition-only parity with review + security-review) + context-packaging.md Rule 7 (prior Strategic Direction inclusion in subsequent advisor consultations) + SemVer patch 0.8.3 -> 0.8.4 (closes Gap 3 from 05.6-UAT.md)

### Phase 05.5: Resolve issues found in Phase 5.4 UAT Test #5 pipeline and ensure plan skill uses WebSearch and WebFetch to research and verify information not in pre-trained knowledge before asking the plan advisor agent, including Nx knowledge gap. Include minor and follow-up issues: plan-skill Nx-convention verification gap, security-reviewer output-shape smoke test, advisor word-budget discipline audit, verbose-prompt detection nudge. (INSERTED)

**Goal:** Close 4 actionable issues from Phase 5.4 UAT Test #5 through surgical edits to plan/execute SKILLs, advisor agent, smoke-test script, and context-packaging reference: (MAJOR) plan-skill Nx-ecosystem convention knowledge gap that drove S5 to 3 advisor consultations on cache inputs / dependsOn / lint dependsOn -- closed via Common Contract rule 5 broadening (D-01) and symmetric orient-phase framework-verification cues in plan + execute SKILLs (D-02); (MODERATE) security-reviewer has no output-shape smoke-test analog to DEF-response-structure.sh -- closed by extending DEF with G and H assertion blocks against a separate security-review invocation (D-06/D-07); (MODERATE) advisor word-budget drift (S4 = 136 full / 118 numbered-only, not S1 per empirical R-03 correction) -- closed via advisor.md density example (D-04) + DEF word-count gate (D-05); (MINOR) verbose-prompt orient-loop trigger -- closed via plan-skill-only runtime reshape nudge (D-08). Bumps plugin to 0.8.0 (plugin.json + 4 SKILL.md files, correcting Phase 5.4 drift where execute/review/security-review were missed). Verified via two-stage gate: extended DEF-response-structure.sh (Stage 1) + full 6-session UAT replay with tally.mjs against fresh traces (Stage 2; D-11 per-skill gates).
**Requirements**: D-01..D-12 (CONTEXT.md locked decisions; REQUIREMENTS.md IDs not assigned for this phase)
**Depends on:** Phase 5.4
**Plans:** 5/6 plans executed

Plans:
- [x] 05.5-01-PLAN.md -- Common Contract rule 5 broadening in context-packaging.md (D-01, D-03; framework conventions first-class)
- [x] 05.5-02-PLAN.md -- Orient-phase framework cue in plan + execute SKILL.md + verbose-prompt reshape nudge in plan SKILL.md only (D-02, D-08, D-09)
- [x] 05.5-03-PLAN.md -- Advisor density example (95-100 word worked example) in advisor.md Output Constraint (D-04)
- [x] 05.5-04-PLAN.md -- DEF-response-structure.sh word-count gate + security-reviewer G/H assertions (D-05, D-06, D-07)
- [x] 05.5-05-PLAN.md -- Version bump 0.8.0 across plugin.json + 4 SKILL.md files, correcting Phase 5.4 drift (D-12)
- [ ] 05.5-06-PLAN.md -- Two-stage verification: DEF smoke test + 6-session UAT replay + tally + VERIFICATION.md with D-11 gates (D-10, D-11)

### Phase 05.4: Address UAT findings A-K (INSERTED)

**Goal:** Close 10 executor/agent discipline findings (A-K) surfaced in Phase 5.3 UAT by shipping a coherent "executor verifies cheaply and correctly before burdening agents" doctrine. Rewrites review/security-review scan phases to derive scope mechanically from git (Finding J), adds web tools to all four skill allowed-tools lines, introduces Pre-Verified Package Behavior Claims section and Common Contract rules 5 + 6 in context-packaging.md (Findings K + C + B + I), reworks the node_modules orientation-budget instruction (Finding A), and polishes advisor + reviewer + security-reviewer response structures with Position B Critical marker, inline Assuming X framing, and two-slot Findings + Cross-Cutting/Threat Patterns outputs (Findings D + E + F). Bumps plugin to 0.6.0. Plan 05 closes 2 live-runtime regressions (E-runtime, F-runtime) and 1 smoke-test script bug (A-smoke-script-bug) surfaced during Phase 05.4 HUMAN-UAT.
**Requirements**: D-01..D-17 (CONTEXT.md locked decisions; REQUIREMENTS.md IDs not assigned for this phase)
**Depends on:** Phase 5.3
**Plans:** 7/7 plans complete

Plans:
- [x] 05.4-01-PLAN.md -- Mechanism C scope derivation in review + security-review scan phases (Finding J)
- [x] 05.4-02-PLAN.md -- WebSearch/WebFetch + Pre-Verified Claims templates + Common Contract rule 5/5a (Findings K + C + B)
- [x] 05.4-03-PLAN.md -- D-11 allowed-tools expansion + Common Contract rule 6 + D-14 reword + 0.6.0 version bump (Findings H + I + A)
- [x] 05.4-04-PLAN.md -- advisor Position B Critical marker + inline Assuming X across three agents + reviewer/security-reviewer two-slot Output Constraint (Findings D + E + F)
- [x] 05.4-05-PLAN.md -- Gap closure: strengthen advisor Assuming X + reviewer/security-reviewer literal-header output contract + review/security-review Phase 3 pass-through + HIA smoke-script REPO_ROOT capture (E-runtime + F-runtime + A-smoke-script-bug)

### Phase 05.3: Resolve issues identified in field test and take the quick-260417-lhe task into account (INSERTED)

**Goal:** Close Phase 5.2 field-test findings F1-F5 and the 6 open Opus 4.7 UAT items from quick task 260417-lhe in one coordinated phase: harden all three Opus agent prompts with a Context Trust Contract (positive-framing, batching directive, per-role calibration), consolidate executor context packaging into a new shared `references/context-packaging.md` reference loaded by all four SKILL.md files, add an orientation-budget instruction to plan/execute skills, and empirically validate the fixes via an 8-subagent A/B UAT on the Compodoc+Storybook scenario with a D-04 dual acceptance gate (>=80% first-try success AND <=4 advisor tool calls per consultation). Bump plugin to 0.5.0.
**Requirements**: D-01..D-16 (CONTEXT.md locked decisions; REQUIREMENTS.md IDs not assigned for this phase)
**Depends on:** Phase 5
**Plans:** 5/5 plans complete

Plans:
- [x] 05.3-01-PLAN.md -- Agent prompt edits: Context Trust Contract on advisor + reviewer + security-reviewer, trim overlap in Verification/Review Process (D-06, D-07, D-08, D-09)
- [x] 05.3-02-PLAN.md -- New shared reference `references/context-packaging.md`, 4 SKILL.md @-load swaps, D-13 orientation-budget in plan + execute (D-10, D-11, D-12, D-13)
- [x] 05.3-03-PLAN.md -- UAT harness scaffolding (subagent prompt, grader prompt, Compodoc scenario, parse-trace.mjs) + single-UAT validation run confirming A1/A2/A3 (D-03, D-14, D-16 scaffolding)
- [x] 05.3-04-PLAN.md -- Full 8-subagent UAT (baseline + post-fix) + grader + D-04 dual-gate verdict + VERIFICATION.md with UAT 5 human_needed (D-01, D-02, D-04, D-05, D-14, D-15, D-16 execution)
- [x] 05.3-05-PLAN.md -- Version bump 0.4.0 -> 0.5.0 in plugin.json + 4 SKILL.md frontmatter; README.md What's New + References entries

### Phase 05.2: Rename skills and resolve preamble waste for advisor agent (INSERTED)

**Goal:** Rename all four skill directories and name fields to `lz-advisor.<skill>` pattern for unique user-facing shorthands, change advisor agent effort from high to medium to eliminate preamble waste, update all cross-references, bump to 0.3.0, and update Opus research doc for 4.6
**Requirements**: RENAME-01, RENAME-02, RENAME-03, PREAMBLE-01, PREAMBLE-02, DOC-01
**Depends on:** Phase 5
**Plans:** 4/4 plans complete

Plans:
- [x] 05.2-01-PLAN.md -- Git mv directories, update skill frontmatter/body, advisor effort, plugin version
- [x] 05.2-02-PLAN.md -- Update CLAUDE.md, README.md, and eval JSON query strings
- [x] 05.2-03-PLAN.md -- Rewrite MODEL-OPTIMIZATION-OPUS.md from Opus 4.5 to 4.6
- [x] 05.2-04-PLAN.md -- Gap closure: fix maxTurns: 1 structural blocker, restructure advisor prompt with visibility model

### Phase 05.1: Advisor consultation refinements (INSERTED)

**Goal:** Eliminate advisor preamble waste, preserve user-pasted source material fidelity, and add specific re-consultation triggers -- refining ADVR-02, IMPL-02, IMPL-03 through surgical edits to agent and skill files
**Requirements**: ADVR-02, IMPL-02, IMPL-03 (refinements, no new requirements)
**Depends on:** Phase 5
**Plans:** 1/1 plans complete

Plans:
- [x] 05.1-01-PLAN.md -- Final Response Discipline, verbatim-vs-summary rules, re-consultation triggers, version bump
