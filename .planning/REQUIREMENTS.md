# Requirements: lz-advisor

**Defined:** 2026-04-10
**Core Value:** Near-Opus intelligence at Sonnet cost for coding tasks, through strategic advisor consultation at high-leverage moments

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Plugin Infrastructure

- [ ] **INFRA-01**: Plugin has minimal `plugin.json` manifest with no unrecognized fields
- [ ] **INFRA-02**: Plugin directory structure follows marketplace conventions (`agents/`, `skills/*/SKILL.md`, `.claude-plugin/`)
- [ ] **INFRA-03**: Reference file (`references/advisor-timing.md`) offloads Anthropic's timing guidance from SKILL.md to stay under 5,000-token compaction limit
- [ ] **INFRA-04**: All skill descriptions include 5+ trigger phrases optimized for discoverability

### Advisor Agent

- [ ] **ADVR-01**: Agent definition uses `model: opus` to always run on Opus 4.6 regardless of session model
- [x] **ADVR-02**: Agent enforces conciseness: under 100 words, enumerated steps, not explanations
- [ ] **ADVR-03**: Agent has read-only tools (Read, Glob) -- never takes write actions
- [ ] **ADVR-04**: Agent uses `maxTurns: 1` -- single strategic response, no iterative tool-call loops
- [ ] **ADVR-05**: Agent uses `effort: high` for deep strategic reasoning
- [ ] **ADVR-06**: Agent system prompt uses calm natural language (no "MUST", "CRITICAL", "ALWAYS")

### Plan Skill

- [ ] **PLAN-01**: Skill instructs executor to orient first (read files, explore codebase) before consulting advisor
- [ ] **PLAN-02**: Skill instructs executor to package orientation findings into advisor agent invocation
- [ ] **PLAN-03**: Advisor returns concise strategic direction (under 100 words)
- [ ] **PLAN-04**: Executor expands advisor's terse guidance into a detailed, actionable plan
- [ ] **PLAN-05**: Skill outputs a durable plan artifact (written to file or displayed for user)
- [ ] **PLAN-06**: Skill inherits session model for executor (no model override)

### Execute Skill

- [ ] **IMPL-01**: Skill instructs executor to consult advisor before substantive work (after orientation)
- [ ] **IMPL-02**: Skill instructs executor to consult advisor when stuck (errors recurring, approach not converging)
- [ ] **IMPL-03**: Skill instructs executor to consult advisor when considering a change of approach
- [ ] **IMPL-04**: Skill instructs executor to consult advisor before declaring done (after making deliverable durable)
- [ ] **IMPL-05**: Skill accepts optional plan file input (from `/lz-advisor.plan` or other sources)
- [ ] **IMPL-06**: Skill instructs executor to make deliverable durable (write files, commit) before final advisor call
- [ ] **IMPL-07**: Skill instructs executor to give advice serious weight but adapt if empirical evidence contradicts
- [ ] **IMPL-08**: Skill implements reconciliation pattern: when executor findings conflict with advisor, surface conflict in one more advisor call
- [ ] **IMPL-09**: Skill instructs executor to package relevant context at each advisor consultation point
- [ ] **IMPL-10**: Skill inherits session model for executor (no model override)

### Review Skill

- [ ] **REVW-01**: Skill instructs executor to scan code first (read files, identify areas of concern)
- [ ] **REVW-02**: Skill instructs executor to package scan findings and relevant code sections into advisor invocation
- [ ] **REVW-03**: Advisor provides deep analysis of quality, correctness, edge cases, and maintainability
- [ ] **REVW-04**: Skill provides structured output with actionable, severity-classified findings
- [ ] **REVW-05**: Skill can review specific files, directories, or recent changes
- [ ] **REVW-06**: Skill inherits session model for executor (no model override)

### Security Review Skill

- [ ] **SECR-01**: Skill instructs executor to scan code first with security focus (read files, identify attack surfaces)
- [ ] **SECR-02**: Skill instructs executor to package security-relevant findings and code sections into advisor invocation
- [ ] **SECR-03**: Advisor applies OWASP Top 10 lens to packaged findings
- [ ] **SECR-04**: Advisor performs threat modeling for reviewed code paths
- [ ] **SECR-05**: Skill provides severity-classified security findings with remediation guidance
- [ ] **SECR-06**: Skill can review specific files, directories, or recent changes
- [ ] **SECR-07**: Skill inherits session model for executor (no model override)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Hooks

- **HOOK-01**: Configurable opt-in hook for advisor consultation reminders
- **HOOK-02**: PostToolUse hook detecting repeated test failures

### Extensions

- **EXTD-01**: Task-type-specific skill variants (refactoring, testing, infrastructure)
- **EXTD-02**: Multi-agent parallel review (compound-engineering approach)
- **EXTD-03**: Plan storage and lifecycle management
- **EXTD-04**: Cost tracking and advisor usage reporting

## Out of Scope

| Feature | Reason |
|---------|--------|
| Claude API / Anthropic SDK dependency | Plugin uses Claude Code's Agent tool only -- zero external dependencies |
| `advisor_20260301` server-side tool | Plugin replicates the pattern client-side using native plugin components |
| Automatic advisor triggering via hooks | Hooks are global (can't scope to skill), lack conversation context, add hidden cost |
| Opus-advising-Opus support | When user session is Opus, advisor adds marginal value -- untested, defer to v2 |
| Custom advisor model selection | Opus 4.6 is the only valid advisor; no user configurability needed for v1 |
| Build steps or npm dependencies | Plugin is pure Markdown/YAML -- no compilation, no package management |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Pending |
| INFRA-02 | Phase 1 | Pending |
| INFRA-03 | Phase 1 | Pending |
| INFRA-04 | Phase 5 | Pending |
| ADVR-01 | Phase 1 | Pending |
| ADVR-02 | Phase 1 | Complete |
| ADVR-03 | Phase 1 | Pending |
| ADVR-04 | Phase 1 | Pending |
| ADVR-05 | Phase 1 | Pending |
| ADVR-06 | Phase 1 | Pending |
| PLAN-01 | Phase 2 | Pending |
| PLAN-02 | Phase 2 | Pending |
| PLAN-03 | Phase 2 | Pending |
| PLAN-04 | Phase 2 | Pending |
| PLAN-05 | Phase 2 | Pending |
| PLAN-06 | Phase 2 | Pending |
| IMPL-01 | Phase 3 | Pending |
| IMPL-02 | Phase 3 | Pending |
| IMPL-03 | Phase 3 | Pending |
| IMPL-04 | Phase 3 | Pending |
| IMPL-05 | Phase 3 | Pending |
| IMPL-06 | Phase 3 | Pending |
| IMPL-07 | Phase 3 | Pending |
| IMPL-08 | Phase 3 | Pending |
| IMPL-09 | Phase 3 | Pending |
| IMPL-10 | Phase 3 | Pending |
| REVW-01 | Phase 4 | Pending |
| REVW-02 | Phase 4 | Pending |
| REVW-03 | Phase 4 | Pending |
| REVW-04 | Phase 4 | Pending |
| REVW-05 | Phase 4 | Pending |
| REVW-06 | Phase 4 | Pending |
| SECR-01 | Phase 4 | Pending |
| SECR-02 | Phase 4 | Pending |
| SECR-03 | Phase 4 | Pending |
| SECR-04 | Phase 4 | Pending |
| SECR-05 | Phase 4 | Pending |
| SECR-06 | Phase 4 | Pending |
| SECR-07 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 39 total
- Mapped to phases: 39
- Unmapped: 0

---
*Requirements defined: 2026-04-10*
*Last updated: 2026-04-10 after roadmap creation*
