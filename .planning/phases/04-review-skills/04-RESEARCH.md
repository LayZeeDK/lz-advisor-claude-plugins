# Phase 4: Review Skills - Research

**Researched:** 2026-04-12
**Domain:** Claude Code plugin skills -- code quality review and security review with executor-advisor pattern
**Confidence:** HIGH

## Summary

Phase 4 delivers two review skills (`/lz-advisor.review` and `/lz-advisor.security-review`) and two new Opus reviewer agents (`reviewer.md` and `security-reviewer.md`). This revises the Phase 1 single-agent architecture (D-07) to a 3-agent model. The core pattern mirrors plan/execute: Sonnet executor scans code, packages top findings, consults an Opus reviewer agent, then structures output with severity-classified actionable findings. The key difference is output budget (~300 words for reviewer agents vs ~100 words for advisor) because review analysis IS the deliverable.

All components are pure Markdown files following established Claude Code plugin conventions. The review skills follow the same scan-consult-produce pattern as the plan skill (orient-consult-produce) but with a review-specific lens. Both skills are general-purpose (not tied to `/lz-advisor.execute` output) and produce console-only output (no file artifact).

**Primary recommendation:** Build both review skills and agents in parallel since they share structural patterns but differ only in scan lens and agent persona. The `reviewer.md` and `security-reviewer.md` agents follow the exact same frontmatter pattern as `advisor.md` but with different system prompts and output budgets.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Three agents: `advisor.md` (plan/execute, unchanged), `reviewer.md` (code quality review), `security-reviewer.md` (security review). Revises D-07 (single agent) because reviews now use the advisor pattern instead of `context: fork`, and review requires a fundamentally different persona than strategic advising (REVW-03 "deep analysis" conflicts with ADVR-02 "under 100 words"). Validated by Anthropic's subagents blog which shows a dedicated `security-reviewer` agent as the canonical custom subagent example, and pr-review-toolkit which uses 6 specialized agents.
- **D-02:** Review agents use ~300 word output budget (not 100 words). Review analysis IS the deliverable (woven into Sonnet's output), not direction for future work. 100 words insufficient for validating 3-5 findings + cross-cutting analysis + per-finding strategic depth. Cost impact: ~$0.02 more per call -- negligible.
- **D-03:** Review agents use `model: opus`, `effort: high`, `tools: ["Read", "Glob"]`, `maxTurns: 1`. Same constraints as `advisor.md` except output budget. Read-only tools only -- reviewers analyze, never modify.
- **D-04:** Token overhead noted for Phase 5 measurement.
- **D-05:** General-purpose advisor-pattern review, not tied to `/lz-advisor.execute` output.
- **D-06:** Executor judges scope from user's request.
- **D-07:** Sonnet reads thoroughly within scope.
- **D-08:** High-signal criteria + exclusion list. Flag: logic errors, CLAUDE.md violations, security issues, clear bugs. Skip: linter/typechecker-catchable, style/formatting, pre-existing issues, pedantic nitpicks, subjective suggestions.
- **D-09:** CLAUDE.md awareness. Executor reads CLAUDE.md files in reviewed directories.
- **D-10:** Opus reviewer validates AND analyzes.
- **D-11:** Cross-cutting pattern recognition.
- **D-12:** Advisor focuses on top 3-5 findings.
- **D-13:** One Opus reviewer call per review invocation.
- **D-14:** Console only -- no file artifact.
- **D-15:** Summary header at top.
- **D-16:** Fix suggestions per finding.
- **D-17:** Opus insights woven in silently. No separate section or per-finding attribution tags.
- **D-18:** Findings only -- no strengths/positive observations section.
- **D-19:** No "Recommended Action" section.
- **D-20:** Severity tiers: Critical / Important / Suggestion (general review).
- **D-21:** `reviewer.md` agent has code quality analysis persona.
- **D-22:** Severity tiers: Critical / High / Medium (security review). CVSS/OWASP-aligned.
- **D-23:** `security-reviewer.md` agent has OWASP Top 10 lens and threat modeling methodology.
- **D-24:** Security differentiation via executor scan focus AND agent expertise.
- **D-25:** Shared SKILL.md structure between both review skills.

### Claude's Discretion
- Exact system prompt wording for `reviewer.md` and `security-reviewer.md`
- Executor scan instructions specificity
- Internal structure of the review output (section headings, per-finding formatting)
- Whether `reviewer.md` and `security-reviewer.md` include `effort: high` or defer to session effort
- Skill prompt wording and XML tag structure
- How the executor summarizes context for each reviewer consultation

### Deferred Ideas (OUT OF SCOPE)
- Token overhead measurement (Phase 5)
- Effort level tuning for reviewer agents
- Parallel review subagents (deep-review pattern)
- PR integration
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| REVW-01 | Skill instructs executor to scan code first (read files, identify areas of concern) | Scan phase in workflow pattern; mirrors plan skill's orient phase. D-07 (thorough scan), D-08 (signal criteria), D-09 (CLAUDE.md awareness) |
| REVW-02 | Skill instructs executor to package scan findings and relevant code sections into advisor invocation | Context packaging pattern from advisor-timing.md; D-12 (top 3-5 findings), D-10 (self-contained prompt) |
| REVW-03 | Advisor provides deep analysis of quality, correctness, edge cases, and maintainability | `reviewer.md` agent with ~300 word budget (D-02), code quality persona (D-21), cross-cutting patterns (D-11) |
| REVW-04 | Skill provides structured output with actionable, severity-classified findings | Critical/Important/Suggestion tiers (D-20), fix suggestions (D-16), summary header (D-15), findings-only (D-18) |
| REVW-05 | Skill can review specific files, directories, or recent changes | Executor judges scope (D-06), all targeting modes described in skill |
| REVW-06 | Skill inherits session model for executor (no model override) | No `model:` in skill frontmatter, same as plan/execute skills |
| SECR-01 | Skill instructs executor to scan code first with security focus | Executor scans for attack surfaces, input handling, auth gaps, data exposure (D-24) |
| SECR-02 | Skill instructs executor to package security-relevant findings and code sections into advisor invocation | Same packaging pattern as REVW-02 but with security lens |
| SECR-03 | Advisor applies OWASP Top 10 lens to packaged findings | `security-reviewer.md` agent with OWASP methodology baked in (D-23) |
| SECR-04 | Advisor performs threat modeling for reviewed code paths | Threat modeling methodology in security-reviewer agent system prompt (D-23) |
| SECR-05 | Skill provides severity-classified security findings with remediation guidance | Critical/High/Medium tiers (D-22), fix suggestions (D-16) |
| SECR-06 | Skill can review specific files, directories, or recent changes | Same scoping as REVW-05 |
| SECR-07 | Skill inherits session model for executor (no model override) | Same as REVW-06 |
</phase_requirements>

## Standard Stack

### Core
| Component | Format | Purpose | Why Standard |
|-----------|--------|---------|--------------|
| SKILL.md (x2) | Markdown + YAML frontmatter | Orchestrate scan-consult-output workflows | Skills are the primary entry point per plugin conventions [VERIFIED: codebase] |
| Agent .md (x2) | Markdown + YAML frontmatter | Opus reviewer personas (code quality + security) | Agents support `model: opus` override; the mechanism for spawning Opus [VERIFIED: codebase] |

### Supporting
| Component | Format | Purpose | When to Use |
|-----------|--------|---------|-------------|
| `references/advisor-timing.md` | Markdown | Context packaging guidance | Loaded by review skills via `@${CLAUDE_PLUGIN_ROOT}/references/advisor-timing.md` [VERIFIED: codebase] |
| `allowed-tools` frontmatter | YAML | Pre-approve agent invocation | Each skill specifies its reviewer agent [VERIFIED: codebase pattern] |

### No External Dependencies

This plugin remains pure Markdown/YAML. No npm packages, no build steps, no runtime dependencies. [VERIFIED: codebase]

## Architecture Patterns

### New Component Locations
```
lz-advisor/
|-- agents/
|   |-- advisor.md                     # Existing (unchanged)
|   |-- reviewer.md                    # NEW: code quality reviewer
|   '-- security-reviewer.md          # NEW: security reviewer
|-- skills/
|   |-- lz-advisor-plan/
|   |   '-- SKILL.md                  # Existing (unchanged)
|   |-- lz-advisor-execute/
|   |   '-- SKILL.md                  # Existing (unchanged)
|   |-- lz-advisor-review/
|   |   '-- SKILL.md                  # NEW: code quality review skill
|   '-- lz-advisor-security-review/
|       '-- SKILL.md                  # NEW: security review skill
'-- references/
    '-- advisor-timing.md             # Existing (unchanged)
```

### Pattern 1: Review Skill Workflow (scan-consult-output)

**What:** Both review skills follow the same three-phase pattern, differing only in scan lens and which agent is consulted.
**When to use:** Every review skill invocation.
**Source:** Adapted from plan skill's orient-consult-produce pattern [VERIFIED: skills/lz-advisor-plan/SKILL.md]

```
Phase 1: Scan (executor)
  - Determine scope from user request (files, dirs, git diff)
  - Read CLAUDE.md files in reviewed directories
  - Identify findings using lens-specific criteria
  - Curate top 3-5 high-signal findings

Phase 2: Consult reviewer agent (one call)
  - Package: scope description, top findings with code context, specific analysis request
  - Agent validates findings, adds strategic analysis, identifies cross-cutting patterns
  - ~300 word output budget

Phase 3: Structure output (executor)
  - Summary header (scope, finding counts by severity)
  - Severity-grouped findings with:
    - Description
    - File:line reference
    - Fix suggestion
    - Opus insights woven in (no attribution)
  - Console output only (no file artifact)
```

### Pattern 2: Reviewer Agent Definition

**What:** Both reviewer agents share the same frontmatter structure as `advisor.md` but with different persona and output budget.
**When to use:** Creating `reviewer.md` and `security-reviewer.md`.
**Source:** Established by `advisor.md` [VERIFIED: agents/advisor.md]

```yaml
---
name: reviewer   # or security-reviewer
description: |
  Use this agent when a skill needs [code quality / security] review analysis
  from a stronger model. Requires structured findings packaging from the
  executor; not intended for direct invocation.

  <example>
  Context: [review-specific scenario]
  user: "[user request]"
  assistant: "[executor response with structured findings]"
  <commentary>
  [When and why this agent is invoked]
  </commentary>
  </example>

model: opus
color: [green / yellow]   # green=quality, yellow=security/caution
effort: high
tools: ["Read", "Glob"]
maxTurns: 1
---

[System prompt with persona, output budget, and methodology]
```

### Pattern 3: Skill Frontmatter

**What:** Review skill frontmatter follows the exact same pattern as plan/execute skills.
**When to use:** Creating both SKILL.md files.
**Source:** Established by plan/execute skills [VERIFIED: codebase]

```yaml
---
name: lz-advisor-review   # or lz-advisor-security-review
description: >
  This skill should be used when [trigger phrases]...
  [5+ trigger phrases for discoverability]
version: 0.1.0
allowed-tools: Agent(lz-advisor:reviewer)   # or Agent(lz-advisor:security-reviewer)
---
```

Key constraints:
- No `model:` field (inherits session model -- REVW-06, SECR-07)
- No `context: fork` (runs inline to access conversation context)
- No `effort:` field (inherits session effort)
- `allowed-tools` specifies only the reviewer agent for this skill (not the advisor agent)

### Pattern 4: Agent Description Style

**What:** Agent descriptions follow Style A from plugin-dev: "Use this agent when..." + example blocks.
**When to use:** Writing `reviewer.md` and `security-reviewer.md` descriptions.
**Source:** Phase 1 D-10, D-11; all 3 plugin-dev agents [VERIFIED: agents/advisor.md]

Requirements:
- "Use this agent when..." opening
- 2-3 `<example>` blocks with Context/user/assistant/commentary structure
- State "not intended for direct invocation" -- skill-orchestrated only
- Examples show skill-driven scenarios (after scan, before output)

### Anti-Patterns to Avoid

- **Per-finding agent calls:** One reviewer call per review invocation (D-13). Do NOT call the agent per finding or per aspect -- package all top findings together. [CITED: CONTEXT.md D-13]
- **Raw context dumps:** Summarize findings for the agent prompt; do not paste entire files. The agent starts with fresh context. [CITED: references/advisor-timing.md]
- **Strengths/positive observations:** Findings only (D-18). Do not include a "what's good" section. [CITED: CONTEXT.md D-18]
- **Agent attribution in output:** Opus insights are woven in silently (D-17). No "Strategic Direction" section, no per-finding "Opus says:" tags. [CITED: CONTEXT.md D-17]
- **File artifact output:** Console only (D-14). Reviews are advisory, not work artifacts. [CITED: CONTEXT.md D-14]
- **Aggressive language in agent prompts:** Calm natural language, no "MUST", "CRITICAL", "ALWAYS" (Phase 1 D-09). [CITED: Phase 1 CONTEXT.md D-09]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Agent model override | Custom API integration | `model: opus` in agent frontmatter | Claude Code's built-in mechanism; verified working in advisor.md [VERIFIED: codebase] |
| Subagent context | Pass-through transcript mechanism | Agent tool with self-contained prompt + Read/Glob tools | Agents get fresh context by design; skill must package all findings [VERIFIED: Anthropic docs] |
| Severity classification | Custom scoring system | Executor-determined severity tiers per CONTEXT.md decisions | code-review plugin evolved away from confidence scoring to validation-based filtering; our approach uses Sonnet as confidence gate + Opus as validator [CITED: CONTEXT.md specifics] |
| OWASP framework | Custom security checklist | OWASP Top 10 categories baked into security-reviewer agent prompt | Well-established framework; domain expertise in agent prompt primes Opus for systematic analysis [CITED: CONTEXT.md D-23] |

## Common Pitfalls

### Pitfall 1: Agent Output Budget Not Enforced
**What goes wrong:** Without explicit output constraint, Opus generates verbose analysis that overwhelms the executor's output structuring.
**Why it happens:** The `advisor.md` uses "under 100 words" which is validated by Anthropic. Review agents need ~300 words but still need a constraint.
**How to avoid:** Include explicit word budget in reviewer agent system prompt: "Respond in under 300 words" or equivalent. Match the pattern from advisor.md's "Respond in under 100 words."
**Warning signs:** Agent responses exceeding 400+ words; executor struggling to structure them concisely.

### Pitfall 2: Agent Description Too Similar to advisor.md
**What goes wrong:** Claude Code routes review-skill agent calls to the wrong agent because descriptions overlap.
**Why it happens:** If `reviewer.md` description also mentions "strategic guidance" or "advisor consultation", the agent discovery mechanism may route incorrectly.
**How to avoid:** Differentiate agent descriptions clearly: reviewer agents mention "code quality review analysis" or "security review analysis" -- not "strategic guidance" or "advisor consultation." Each agent's description should name the specific skill that invokes it.
**Warning signs:** Wrong agent invoked during skill execution.

### Pitfall 3: Scan Phase Too Shallow or Too Deep
**What goes wrong:** Executor either skips important files (shallow) or reads the entire codebase (deep), wasting tokens.
**Why it happens:** Skill prompt doesn't provide clear scope guidance.
**How to avoid:** D-06 says executor judges scope from user request. Skill should describe targeting modes (explicit paths, git diff-based, conversation context-based) but let executor choose. D-07 says "don't constrain scan depth" -- Sonnet tokens are cheap.
**Warning signs:** Reviews missing obvious issues (too shallow) or taking 5+ minutes to scan (too deep for small scope).

### Pitfall 4: Security-Reviewer Agent Not Differentiated Enough
**What goes wrong:** Security review produces generic code quality findings rather than security-specific analysis.
**Why it happens:** Both the executor scan and the agent prompt need security-specific lens. If only one is differentiated, the output reverts to general review.
**How to avoid:** D-24 requires differentiation at both layers: executor scans for attack surfaces, input handling, auth gaps, data exposure; agent applies OWASP framework and threat modeling. Both must be explicit.
**Warning signs:** Security review findings overlap 90%+ with general review findings.

### Pitfall 5: Allowed-Tools Mismatch
**What goes wrong:** Skill fails to invoke its reviewer agent because `allowed-tools` doesn't match the agent's qualified name.
**Why it happens:** Agent qualified name includes the plugin prefix: `lz-advisor:reviewer`, not just `reviewer`.
**How to avoid:** Use `Agent(lz-advisor:reviewer)` and `Agent(lz-advisor:security-reviewer)` in `allowed-tools` frontmatter. Match the pattern from plan/execute: `Agent(lz-advisor:advisor)`.
**Warning signs:** "Tool not permitted" errors during skill execution.

### Pitfall 6: Review Output Lacks File:Line References
**What goes wrong:** Findings are vague without specific code locations, making them hard to act on.
**Why it happens:** Executor summarizes findings without preserving file paths and line numbers.
**How to avoid:** Skill prompt should instruct executor to include file:line references for each finding, both in the agent packaging and in the final output. The code-review plugin and pr-review-toolkit both require file:line references per finding.
**Warning signs:** Findings like "there's a potential null reference issue" without indicating where.

## Code Examples

### Example 1: Reviewer Agent System Prompt Structure

Based on `advisor.md` pattern and CONTEXT.md decisions. [VERIFIED: agents/advisor.md for pattern]

```markdown
You are a code quality reviewer specializing in thorough analysis of
correctness, edge cases, and maintainability.

## Output Constraint

Respond in under 300 words. For each finding the executor packages,
provide:
1. Validation (confirm or reject the finding with reasoning)
2. Strategic analysis (root cause, severity, broader implications)

After individual findings, identify cross-cutting patterns: shared root
causes, systemic issues, or recurring themes across findings. For
example: "findings 1, 3, and 5 share a root cause: missing input
validation at the boundary."

## Review Process

When consulted, read the executor's packaged findings carefully. Each
finding includes a description, code context, and file location.

If the executor's findings seem questionable or lack context, use Read
or Glob to verify against the actual project files before responding.
Do this within a single turn -- gather what you need, then respond.

Focus on the highest-impact findings. If the executor packaged more
findings than can be covered in 300 words, prioritize by severity and
skip lower-impact items.
```

### Example 2: Security-Reviewer Agent System Prompt Structure

Based on silent-failure-hunter pattern and CONTEXT.md D-23. [VERIFIED: silent-failure-hunter.md for pattern]

```markdown
You are a security reviewer specializing in identifying vulnerabilities,
attack surfaces, and threat patterns in code.

## Output Constraint

Respond in under 300 words. For each finding the executor packages,
provide:
1. Validation against OWASP Top 10 categories
2. Threat analysis (attack vector, exploitability, impact)

After individual findings, perform cross-cutting threat modeling:
identify how findings combine to create attack chains, and flag any
systemic security weaknesses.

## OWASP Top 10 Lens

Apply these categories systematically:
- A01 Broken Access Control
- A02 Cryptographic Failures
- A03 Injection
- A04 Insecure Design
- A05 Security Misconfiguration
- A06 Vulnerable and Outdated Components
- A07 Identification and Authentication Failures
- A08 Software and Data Integrity Failures
- A09 Security Logging and Monitoring Failures
- A10 Server-Side Request Forgery

## Review Process

When consulted, read the executor's packaged security findings
carefully. Each finding includes a description, code context, file
location, and the executor's initial severity assessment.

If the executor's findings seem questionable or lack context, use Read
or Glob to verify against the actual project files before responding.
Do this within a single turn -- gather what you need, then respond.

Prioritize findings by exploitability and impact. A confirmed
injection vulnerability outranks a theoretical SSRF.
```

### Example 3: Review Skill Workflow Structure

Based on plan skill pattern. [VERIFIED: skills/lz-advisor-plan/SKILL.md for pattern]

```markdown
---
name: lz-advisor-review
description: >
  This skill should be used when the user asks to "review this code",
  "check my changes", "review these files", "lz-advisor review",
  "look at my code for issues", or needs quality analysis of
  completed work. Provides Opus-level code quality analysis at
  Sonnet cost by consulting the reviewer agent for deep analysis.
version: 0.1.0
allowed-tools: Agent(lz-advisor:reviewer)
---

The lz-advisor:reviewer agent is backed by a stronger model (Opus).
Invoke it via the Agent tool at the strategic moment described below.
For detailed guidance on context packaging, see:

@${CLAUDE_PLUGIN_ROOT}/references/advisor-timing.md

This skill follows a three-phase workflow: scan, consult, then output.

<scan>
## Phase 1: Scan
[Executor reads files, identifies findings with high-signal criteria]
</scan>

<consult>
## Phase 2: Consult the Reviewer
[Package top 3-5 findings for Opus reviewer agent]
</consult>

<output>
## Phase 3: Structure Output
[Format findings with severity, file:line, fix suggestions]
</output>
```

### Example 4: Agent Allowed-Tools Pattern

```yaml
# Review skill
allowed-tools: Agent(lz-advisor:reviewer)

# Security review skill
allowed-tools: Agent(lz-advisor:security-reviewer)

# NOT: Agent(reviewer) -- must include plugin prefix
# NOT: Agent(lz-advisor:advisor) -- wrong agent for reviews
```

### Example 5: Output Structure Pattern

Based on CONTEXT.md decisions D-14 through D-20. [CITED: CONTEXT.md]

```
## Review Summary

Reviewed: [scope description]
Findings: [N] Critical, [N] Important, [N] Suggestion

---

### Critical

**[Finding title]** `file/path.ts:42`
[Description with analysis woven in]
**Fix:** [Concrete fix suggestion]

### Important

**[Finding title]** `file/path.ts:88`
[Description with analysis woven in]
**Fix:** [Concrete fix suggestion]

### Suggestion

**[Finding title]** `file/path.ts:15`
[Description]
**Fix:** [Concrete fix suggestion]
```

For security review, tiers are Critical / High / Medium per D-22.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `context: fork` with `model: opus` for reviews | Executor-advisor pattern with separate reviewer agents | Phase 4 D-01 | Reviews now follow the same architectural pattern as plan/execute; adds Sonnet scanning as cost-efficient pre-filter |
| Single `advisor.md` agent (Phase 1 D-07) | Three agents: advisor, reviewer, security-reviewer | Phase 4 D-01 | Different personas for different concerns; review output budget (300 words) differs from advisor (100 words) |
| Confidence scoring (code-reviewer pattern) | Executor pre-filters + Opus validates | Phase 4 design | Architecturally cleaner; Sonnet is the confidence gate, Opus is the validator |

**Key reference plugins examined:**
- `code-review` (claude-code repo): 4 parallel agents (2 Opus bug, 2 Sonnet CLAUDE.md) + validation subagents. HIGH SIGNAL philosophy. Source for D-08 signal criteria. [VERIFIED: code-review plugin]
- `pr-review-toolkit` (official marketplace): 6 specialized agents. Critical/Important/Suggestions/Strengths tiers. Source for D-20 severity tiers. [VERIFIED: pr-review-toolkit plugin]
- `silent-failure-hunter` (pr-review-toolkit): 130-line domain methodology in system prompt. CRITICAL/HIGH/MEDIUM tiers. Source for D-22, D-23. [VERIFIED: silent-failure-hunter agent]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | ~300 word output budget is sufficient for 3-5 finding validation + cross-cutting analysis | Architecture Patterns | Agent output too compressed, losing analytical value. Mitigation: Phase 5 measurement will calibrate. |
| A2 | `effort: high` is appropriate for reviewer agents (same as advisor.md) | Architecture Patterns | Higher cost per review if thinking tokens are expensive. Mitigation: Phase 5 can tune to `effort: medium`. Both are in CONTEXT.md deferred ideas. |
| A3 | Agent color choice (green for reviewer, yellow for security-reviewer) follows plugin-dev semantics | Code Examples | No functional impact -- purely visual. Can be adjusted at any time. |
| A4 | Both review skills reference `advisor-timing.md` for context packaging guidance | Architecture Patterns | The timing file was written for advisor consultations (plan/execute); some guidance may not apply to review consultations. Low risk: the packaging section is generic enough. |

## Open Questions

1. **Agent color assignment**
   - What we know: `advisor.md` uses `magenta` (creative/strategic). `code-reviewer` in pr-review-toolkit uses `green`. `silent-failure-hunter` uses `yellow`.
   - What's unclear: Whether the project has specific color semantics beyond magenta. The subagents blog example uses `sonnet` (not a color) for `security-reviewer`, which is the model field, not color.
   - Recommendation: Use `green` for `reviewer.md` (code quality, constructive) and `yellow` for `security-reviewer.md` (caution, warnings). Matches pr-review-toolkit precedent. Planner's discretion per CONTEXT.md.

2. **Include path for advisor-timing.md from new skill directories**
   - What we know: Phase 3 moved the reference to `references/advisor-timing.md` at plugin root. Plan and execute skills use `@${CLAUDE_PLUGIN_ROOT}/references/advisor-timing.md`.
   - What's unclear: Whether the `@${CLAUDE_PLUGIN_ROOT}` path variable resolves correctly from all skill locations.
   - Recommendation: Use the same include path as plan/execute skills. If it works for them, it works for review skills. [VERIFIED: existing skill files use this path]

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | bash assertions + git grep (same as Phase 3) |
| Config file | none -- bash scripts in `tests/` |
| Quick run command | `bash tests/validate-phase-04.sh` |
| Full suite command | `bash tests/validate-phase-04.sh && claude --model sonnet --effort medium --plugin-dir . -p "/lz-advisor.review <target>" --verbose` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REVW-01 | Executor scans code first | structural | `bash tests/validate-phase-04.sh` (scan section exists) | Wave 0 |
| REVW-02 | Executor packages findings for reviewer | structural | `bash tests/validate-phase-04.sh` (consult section with packaging) | Wave 0 |
| REVW-03 | Reviewer provides deep analysis | structural + smoke | Agent file exists with quality persona + `claude -p` smoke test | Wave 0 (structural) |
| REVW-04 | Structured severity-classified output | structural | `bash tests/validate-phase-04.sh` (output section with severity tiers) | Wave 0 |
| REVW-05 | Can review files, dirs, or recent changes | structural | `bash tests/validate-phase-04.sh` (scope targeting in scan section) | Wave 0 |
| REVW-06 | Inherits session model | structural | `bash tests/validate-phase-04.sh` (no model: in frontmatter) | Wave 0 |
| SECR-01 | Executor scans with security focus | structural | `bash tests/validate-phase-04.sh` (security scan section) | Wave 0 |
| SECR-02 | Executor packages security findings | structural | `bash tests/validate-phase-04.sh` (consult section) | Wave 0 |
| SECR-03 | Reviewer applies OWASP Top 10 | structural | `bash tests/validate-phase-04.sh` (OWASP in agent prompt) | Wave 0 |
| SECR-04 | Reviewer performs threat modeling | structural | `bash tests/validate-phase-04.sh` (threat in agent prompt) | Wave 0 |
| SECR-05 | Severity-classified security findings | structural | `bash tests/validate-phase-04.sh` (Critical/High/Medium tiers) | Wave 0 |
| SECR-06 | Can review files, dirs, or recent changes | structural | Same as REVW-05 pattern | Wave 0 |
| SECR-07 | Inherits session model | structural | Same as REVW-06 pattern | Wave 0 |

### Sampling Rate
- **Per task commit:** `bash tests/validate-phase-04.sh`
- **Per wave merge:** Full structural suite + smoke test with `claude -p`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `tests/validate-phase-04.sh` -- structural assertions for all 13 requirements
- [ ] `skills/lz-advisor-review/SKILL.md` -- review skill (primary deliverable)
- [ ] `skills/lz-advisor-security-review/SKILL.md` -- security review skill (primary deliverable)
- [ ] `agents/reviewer.md` -- code quality reviewer agent
- [ ] `agents/security-reviewer.md` -- security reviewer agent

## Sources

### Primary (HIGH confidence)
- `agents/advisor.md` -- existing Opus advisor agent pattern (frontmatter, system prompt, output constraint) [VERIFIED: codebase]
- `skills/lz-advisor-plan/SKILL.md` -- orient-consult-produce workflow pattern [VERIFIED: codebase]
- `skills/lz-advisor-execute/SKILL.md` -- full executor-advisor loop pattern [VERIFIED: codebase]
- `references/advisor-timing.md` -- context packaging guidance [VERIFIED: codebase]
- `research/anthropic/docs/advisor-tool.md` -- API advisor tool reference, timing guidance, trimming instructions [VERIFIED: local copy]
- `research/anthropic/blog/how-and-when-to-use-subagents-in-claude-code.md` -- subagent patterns, dedicated security-reviewer example [VERIFIED: local copy]
- `code-review plugin` (claude-code repo) -- HIGH SIGNAL philosophy, CLAUDE.md compliance review, multi-agent validation [VERIFIED: local copy at D:\projects\github\anthropics\claude-code\plugins\code-review\]
- `pr-review-toolkit` (official marketplace) -- 6 specialized agents, Critical/Important/Suggestions tiers, code-reviewer confidence scoring [VERIFIED: local copy at D:\projects\github\anthropics\claude-plugins-official\plugins\pr-review-toolkit\]
- `silent-failure-hunter` agent -- 130-line domain methodology, CRITICAL/HIGH/MEDIUM tiers [VERIFIED: local copy]

### Secondary (MEDIUM confidence)
- Phase 1 D-09 (positive-only instruction style) -- established pattern, applied to new agents [VERIFIED: codebase]
- Phase 3 validation script pattern (`tests/validate-phase-03.sh`) -- template for Phase 4 validation [VERIFIED: codebase]

### Tertiary (LOW confidence)
- None -- all claims verified against codebase or local copies of referenced sources.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- zero external dependencies, all components are Markdown files following verified patterns
- Architecture: HIGH -- review skills follow the exact same pattern as plan/execute skills with documented deviations (output budget, agent persona)
- Pitfalls: HIGH -- derived from examining two real-world review plugins (code-review, pr-review-toolkit) and prior phase experience
- Validation: HIGH -- structural assertions follow the established Phase 3 pattern

**Research date:** 2026-04-12
**Valid until:** 2026-05-12 (stable -- pure Markdown plugin, no version-sensitive dependencies)
