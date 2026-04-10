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
**Plans**: TBD

Plans:
- [ ] 01-01: TBD
- [ ] 01-02: TBD

### Phase 2: Plan Skill
**Goal**: Users can invoke `/lz-advisor.plan` to get an Opus-informed strategic plan for any coding task
**Depends on**: Phase 1
**Requirements**: PLAN-01, PLAN-02, PLAN-03, PLAN-04, PLAN-05, PLAN-06
**Success Criteria** (what must be TRUE):
  1. User invokes `/lz-advisor.plan` and the executor explores the codebase before consulting the advisor
  2. Advisor receives packaged orientation findings (not raw conversation history) and returns concise strategic direction
  3. Executor expands advisor guidance into a detailed, actionable plan artifact (written to file or displayed)
  4. Skill runs on the session model (Sonnet) for execution while consulting Opus only for strategic direction
**Plans**: TBD

Plans:
- [ ] 02-01: TBD

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
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD

### Phase 4: Review Skills
**Goal**: Users can get thorough Opus-advised code quality reviews and security-focused threat analysis of completed work
**Depends on**: Phase 1
**Requirements**: REVW-01, REVW-02, REVW-03, REVW-04, REVW-05, REVW-06, SECR-01, SECR-02, SECR-03, SECR-04, SECR-05, SECR-06, SECR-07
**Success Criteria** (what must be TRUE):
  1. User invokes `/lz-advisor.review` and Sonnet scans code, packages findings, then Opus advisor provides deep quality analysis
  2. User invokes `/lz-advisor.security-review` and Sonnet scans for attack surfaces, packages findings, then Opus advisor performs threat modeling with OWASP Top 10 lens
  3. Both review skills produce structured output with actionable, severity-classified findings
  4. Both review skills use the same executor-advisor pattern as plan and implement (consistent architecture)
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

### Phase 5: Polish and Marketplace Readiness
**Goal**: All skill descriptions are optimized for discoverability and the plugin is ready for marketplace publication
**Depends on**: Phase 4
**Requirements**: INFRA-04
**Success Criteria** (what must be TRUE):
  1. Every skill description includes 5+ trigger phrases and surfaces the skill reliably when users describe related tasks
  2. Plugin installs cleanly from GitHub (not just `--plugin-dir`) and all skills appear in the user's skill list
**Plans**: TBD

Plans:
- [ ] 05-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Plugin Scaffold and Advisor Agent | 0/2 | Not started | - |
| 2. Plan Skill | 0/1 | Not started | - |
| 3. Execute Skill | 0/2 | Not started | - |
| 4. Review Skills | 0/2 | Not started | - |
| 5. Polish and Marketplace Readiness | 0/1 | Not started | - |
