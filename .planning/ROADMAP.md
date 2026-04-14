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

### Phase 05.2: Rename skills and resolve preamble waste for advisor agent (INSERTED)

**Goal:** Rename all four skill directories and name fields to `lz-advisor.<skill>` pattern for unique user-facing shorthands, change advisor agent effort from high to medium to eliminate preamble waste, update all cross-references, bump to 0.3.0, and update Opus research doc for 4.6
**Requirements**: RENAME-01, RENAME-02, RENAME-03, PREAMBLE-01, PREAMBLE-02, DOC-01
**Depends on:** Phase 5
**Plans:** 4 plans

Plans:
- [x] 05.2-01-PLAN.md -- Git mv directories, update skill frontmatter/body, advisor effort, plugin version
- [x] 05.2-02-PLAN.md -- Update CLAUDE.md, README.md, and eval JSON query strings
- [x] 05.2-03-PLAN.md -- Rewrite MODEL-OPTIMIZATION-OPUS.md from Opus 4.5 to 4.6
- [ ] 05.2-04-PLAN.md -- Gap closure: fix maxTurns: 1 structural blocker, restructure advisor prompt with visibility model

### Phase 05.1: Advisor consultation refinements (INSERTED)

**Goal:** Eliminate advisor preamble waste, preserve user-pasted source material fidelity, and add specific re-consultation triggers -- refining ADVR-02, IMPL-02, IMPL-03 through surgical edits to agent and skill files
**Requirements**: ADVR-02, IMPL-02, IMPL-03 (refinements, no new requirements)
**Depends on:** Phase 5
**Plans:** 1/1 plans complete

Plans:
- [x] 05.1-01-PLAN.md -- Final Response Discipline, verbatim-vs-summary rules, re-consultation triggers, version bump
