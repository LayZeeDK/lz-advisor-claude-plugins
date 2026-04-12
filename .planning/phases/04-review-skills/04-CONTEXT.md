# Phase 4: Review Skills - Context

**Gathered:** 2026-04-12 (discuss mode, --analyze)
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver two review skills (`/lz-advisor.review` and `/lz-advisor.security-review`) and two new Opus reviewer agents (`reviewer.md` and `security-reviewer.md`) that follow the executor-advisor pattern. Sonnet executor scans code, curates findings, and packages them for an Opus reviewer agent that provides strategic analysis. Both skills are general-purpose (not tied to execute-skill output) and produce conversational output with severity-classified, actionable findings.

Additionally, this phase revises Phase 1 D-07 (single agent) to a 3-agent architecture: the existing `advisor.md` for plan/execute, plus two new review-specialized agents.

</domain>

<decisions>
## Implementation Decisions

### Architecture (revises Phase 1 D-07)
- **D-01:** Three agents: `advisor.md` (plan/execute, unchanged), `reviewer.md` (code quality review), `security-reviewer.md` (security review). Revises D-07 (single agent) because reviews now use the advisor pattern instead of `context: fork`, and review requires a fundamentally different persona than strategic advising (REVW-03 "deep analysis" conflicts with ADVR-02 "under 100 words"). Validated by Anthropic's subagents blog which shows a dedicated `security-reviewer` agent as the canonical custom subagent example, and pr-review-toolkit which uses 6 specialized agents.
- **D-02:** Review agents use ~300 word output budget (not 100 words). Review analysis IS the deliverable (woven into Sonnet's output), not direction for future work. 100 words insufficient for validating 3-5 findings + cross-cutting analysis + per-finding strategic depth. Cost impact: ~$0.02 more per call -- negligible.
- **D-03:** Review agents use `model: opus`, `effort: high`, `tools: ["Read", "Glob"]`, `maxTurns: 1`. Same constraints as `advisor.md` except output budget. Read-only tools only -- reviewers analyze, never modify.
- **D-04:** Token overhead noted for Phase 5 measurement. Economics are fundamentally sound: subagent fresh context avoids conversation history replay ($0.45-$1.50 saved), Sonnet scanning is 5x cheaper than Opus reading. Measure actual CLAUDE.md overhead and thinking token volume during Phase 4 testing.

### Review Skill Design (both skills)
- **D-05:** General-purpose advisor-pattern review, not tied to `/lz-advisor.execute` output. Reviews any code -- files, directories, recent changes. The execute skill's Phase 5 (Final Advisor Consultation) already covers post-execution review; a separate review skill limited to that would be redundant.
- **D-06:** Executor judges scope from user's request. Skill describes all targeting modes (explicit file/dir paths, git diff-based, conversation context-based) and executor picks based on what the user asked for. Matches plan/execute pattern.
- **D-07:** Sonnet reads thoroughly within scope. Scan depth is a consequence of scope + signal criteria, not a separate knob. Sonnet tokens are cheap ($3/MTok) -- constraining scan depth saves pennies while potentially degrading Opus input quality. Matches advisor strategy: "the rest of the run stays at executor-level cost."
- **D-08:** High-signal criteria + exclusion list. Executor gets explicit guidance:
  - **Flag:** logic errors, CLAUDE.md violations, security issues, clear bugs
  - **Skip:** linter/typechecker-catchable, style/formatting, pre-existing issues not in scope, pedantic nitpicks, subjective suggestions
  Adapted from code-review plugin's (claude-code repo) HIGH SIGNAL philosophy.
- **D-09:** CLAUDE.md awareness. Executor reads CLAUDE.md files in reviewed directories. Findings can cite specific project guidelines. Adapted from code-review plugin where CLAUDE.md compliance is a primary review dimension.
- **D-10:** Opus reviewer validates AND analyzes. The advisor call both confirms/rejects findings (removing false positives from output) and provides strategic analysis. Not just analysis -- validation is a core function.
- **D-11:** Cross-cutting pattern recognition. Explicitly instruct Opus to identify shared root causes and patterns across findings (e.g., "findings 1, 3, and 5 share a root cause: missing input validation at the boundary"). This is the advisor pattern's unique advantage over parallel isolated agents.
- **D-12:** Advisor focuses on top 3-5 findings. Sonnet packages the most significant findings for Opus. Fits the ~300 word budget naturally. Lower-priority findings structured by Sonnet alone.
- **D-13:** One Opus reviewer call per review invocation. Advisor pattern: single strategic consultation after scan, before output. Not per-finding or per-aspect calls.

### Output Structure (both skills)
- **D-14:** Console only -- no file artifact. Reviews are advisory, not work artifacts. No downstream consumer needs a file (unlike plan files consumed by execute).
- **D-15:** Summary header at top. Brief stats: scope reviewed, finding counts by severity.
- **D-16:** Fix suggestions per finding. Concrete, actionable -- user knows what to do, not just what's wrong. Matches both code-review plugin (committable suggestions) and pr-review-toolkit (concrete fix per finding).
- **D-17:** Opus insights woven in silently. No separate "Strategic Direction" section or per-finding attribution tags. Clean reading experience.
- **D-18:** Findings only -- no strengths/positive observations section. Concise, action-oriented.
- **D-19:** No "Recommended Action" section. Severity tiers already imply priority.

### General Review Skill (/lz-advisor.review)
- **D-20:** Severity tiers: Critical / Important / Suggestion. Matches pr-review-toolkit's aggregated output tiers. Familiar to users of Anthropic's plugins.
- **D-21:** `reviewer.md` agent has code quality analysis persona: bugs, logic errors, CLAUDE.md compliance, correctness, edge cases, maintainability. ~300 word analytical output with per-finding reasoning.

### Security Review Skill (/lz-advisor.security-review)
- **D-22:** Severity tiers: Critical / High / Medium. CVSS/OWASP-aligned, not the general review tiers. "Suggestion" doesn't fit security -- findings are risks, not suggestions. Matches pr-review-toolkit's silent-failure-hunter (CRITICAL/HIGH/MEDIUM).
- **D-23:** `security-reviewer.md` agent has OWASP Top 10 lens and threat modeling methodology baked into system prompt. Domain expertise in the agent prompt primes Opus for systematic security analysis (like silent-failure-hunter's 130-line error handling methodology).
- **D-24:** Security differentiation via executor scan focus AND agent expertise. Executor scans for attack surfaces, input handling, auth gaps, data exposure. Agent applies OWASP framework and threat modeling to curated findings. Both layers contribute.

### Skill Structure
- **D-25:** Shared SKILL.md structure between both review skills. Both follow: determine scope -> scan with focus -> package findings -> consult reviewer agent -> structure output. Only the scan lens (quality vs security) and which agent (reviewer vs security-reviewer) differ. DRY, consistent, easier to maintain.

### Claude's Discretion
- Exact system prompt wording for `reviewer.md` and `security-reviewer.md` -- decisions above define the structure, domain knowledge, and output budget; planner has flexibility on exact phrasing.
- Executor scan instructions specificity -- goal-oriented ("identify potential issues within scope") preferred over prescriptive ("run these specific grep patterns").
- Internal structure of the review output (section headings, per-finding formatting) -- must include summary header + severity-grouped findings with fix suggestions, but exact layout is flexible.
- Whether `reviewer.md` and `security-reviewer.md` include `effort: high` or defer to session effort -- Phase 1 set `effort: high` for `advisor.md`; same rationale applies (deep analysis is the value) but planner can evaluate.
- Skill prompt wording and XML tag structure -- follows Sonnet 4.6 patterns (structured XML, explicit constraints) but exact phrasing is the planner's choice.
- How the executor summarizes context for each reviewer consultation -- must be self-contained (reviewer has no transcript access), but prescription level is flexible.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Anthropic Advisor Strategy
- `research/anthropic/docs/advisor-tool.md` -- API advisor tool reference with timing guidance, suggested system prompt blocks, trimming instructions. Source for advisor pattern economics and consultation timing.
- `research/anthropic/blog/the-advisor-strategy-give-agents-an-intelligence-boost.md` -- Strategy rationale, benchmark results (Sonnet + Opus = +2.7pp at -11.9% cost). Key principle: "the rest of the run stays at executor-level cost."
- `research/anthropic/blog/how-and-when-to-use-subagents-in-claude-code.md` -- Subagent patterns including dedicated `security-reviewer` agent example, `deep-review` skill pattern, "fresh perspective needed" for review, "handful of well-scoped agents" guideline. Source for D-01 (3-agent architecture) and D-23 (security agent).

### Native Review Plugins (Comparative Reference)
- `D:\projects\github\anthropics\claude-code\plugins\code-review\commands\code-review.md` -- Current code-review plugin (claude-code repo, actively maintained since 2025-12). Uses 2 Opus bug agents + 2 Sonnet CLAUDE.md agents + validation subagents. HIGH SIGNAL philosophy. Terminal output by default. Source for D-08, D-09.
- `D:\projects\github\anthropics\claude-plugins-official\plugins\pr-review-toolkit\commands\review-pr.md` -- pr-review-toolkit with 6 specialized agents. Aggregated output: Critical/Important/Suggestions/Strengths. Source for D-20 severity tiers.
- `D:\projects\github\anthropics\claude-plugins-official\plugins\pr-review-toolkit\agents\code-reviewer.md` -- Opus code-reviewer agent with confidence scoring (0-100, threshold 80), Critical (90-100) / Important (80-89) grouping. Source for understanding existing Opus review patterns.
- `D:\projects\github\anthropics\claude-plugins-official\plugins\pr-review-toolkit\agents\silent-failure-hunter.md` -- 130-line specialized error handling agent with CRITICAL/HIGH/MEDIUM tiers. Source for D-22 (security severity tiers) and D-23 (domain methodology in system prompt).

### Plugin Architecture
- `.planning/research/ARCHITECTURE.md` -- Original review skill flow diagrams (fork pattern -- now superseded by advisor pattern per PROJECT.md key decision). Model optimization findings, subagent context isolation, anti-patterns.
- `.planning/research/STACK.md` -- Skill file format, frontmatter fields, allowed-tools syntax.

### Existing Components (Phase 1-3 output)
- `agents/advisor.md` -- Opus advisor agent (unchanged). System prompt, output constraint (<100 words), consultation awareness, tools (Read, Glob), maxTurns: 1. New reviewer agents follow same tool/turn constraints with different persona and output budget.
- `skills/lz-advisor-plan/SKILL.md` -- Plan skill with orient-consult-produce workflow. Template for review skill structure (scan-consult-output).
- `skills/lz-advisor-execute/SKILL.md` -- Execute skill with 6-phase workflow. Phase 5 (Final Advisor Consultation) is the existing post-execution review -- separate from the new review skills.
- `references/advisor-timing.md` -- Timing/weight/packaging reference. Review skills may reference this for context packaging guidance.

### Prior Phase Context
- `.planning/phases/01-plugin-scaffold-and-advisor-agent/01-CONTEXT.md` -- Phase 1 decisions. Key: D-07 (single agent -- now revised by D-01 above), D-09 (positive-only instruction style), D-10/D-11 (agent description patterns).
- `.planning/phases/02-plan-skill/02-CONTEXT.md` -- Phase 2 decisions. Key: D-03 (scoped executor framing for conciseness).
- `.planning/phases/03-execute-skill/03-CONTEXT.md` -- Phase 3 decisions. Key: D-05 (shared references/ at plugin root).

### Requirements
- `.planning/REQUIREMENTS.md` -- REVW-01 through REVW-06 and SECR-01 through SECR-07 are the hard constraints for this phase.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `agents/advisor.md` -- Opus advisor agent. New reviewer agents follow the same frontmatter pattern (model, effort, tools, maxTurns) with different persona and output budget.
- `skills/lz-advisor-plan/SKILL.md` -- Plan skill establishes the scan-consult-produce pattern. Review skills adapt this: scan (orient) -> consult reviewer agent -> structure output.
- `skills/lz-advisor-execute/SKILL.md` -- Execute skill's Phase 5 shows the "review completed work" advisor consultation pattern. Review skills extend this into a full standalone workflow.
- `references/advisor-timing.md` -- Context packaging guidance (self-contained prompts, summarize don't dump). Applicable to reviewer agent consultations.
- `.claude-plugin/plugin.json` -- Valid plugin manifest (v0.1.0).

### Established Patterns
- Skills use `allowed-tools: Agent(lz-advisor:advisor)` to pre-approve advisor spawning. Review skills will use `Agent(lz-advisor:reviewer)` and `Agent(lz-advisor:security-reviewer)` respectively.
- Agent system prompt uses calm natural language, no aggressive keywords (Phase 1 D-09).
- Agent descriptions follow Style A: "Use this agent when..." + example blocks.
- Plugin uses kebab-case naming throughout.
- No `context: fork` -- all skills run inline to access conversation context.
- No `model` or `effort` override in skill frontmatter -- inherits session model.

### Integration Points
- New skills created at `skills/lz-advisor-review/SKILL.md` and `skills/lz-advisor-security-review/SKILL.md`.
- New agents created at `agents/reviewer.md` and `agents/security-reviewer.md`.
- Both skills invoke their respective agents via Agent tool (same mechanism as plan/execute with advisor).
- Both skills can reference `@${CLAUDE_PLUGIN_ROOT}/references/advisor-timing.md` for context packaging guidance.

</code_context>

<specifics>
## Specific Ideas

- The review skill's workflow mirrors the plan skill's orient-consult-produce pattern but replaces "produce plan" with "structure review output." The scan (orient) phase is the executor's thorough code reading. The consult phase packages top findings for the reviewer agent. The output phase structures the agent's analysis into severity-classified findings.
- The reviewer agents' ~300 word budget maps to: ~50 words per finding for 3-5 findings (validation + analysis) + ~50-100 words for cross-cutting pattern identification. The executor expands this into the full review output with fix suggestions and file:line references.
- The security-reviewer agent's OWASP lens should follow the silent-failure-hunter pattern: domain methodology baked into the system prompt as a structured review framework, not just a list of categories. This primes Opus for systematic analysis.
- The code-review plugin (claude-code repo) evolved from confidence scoring to validation-based filtering. Our advisor pattern uses Sonnet as the confidence gate (executor pre-filters) and Opus as the validator (confirms/rejects in its analysis). This is architecturally cleaner than post-hoc scoring.

</specifics>

<deferred>
## Deferred Ideas

- **Token overhead measurement:** Measure actual CLAUDE.md size in subagent context, thinking token volume at effort: high, and total cost per review invocation. Phase 5 concern -- economics are sound but exact numbers inform documentation and user expectations.
- **Effort level tuning for reviewer agents:** If thinking tokens at effort: high prove expensive, consider effort: medium for reviewer agents. Trade-off: analysis depth vs cost. Measure during Phase 4 testing.
- **Parallel review subagents (deep-review pattern):** The subagents blog shows a skill spawning 3 parallel review subagents (security, performance, style). Our advisor pattern uses 1 Opus call. Could explore parallel calls in v2 if single-call analysis proves insufficient.
- **PR integration:** The code-review plugin supports `--comment` for GitHub PR comments. Our skills are conversational-only for v1. PR integration could be a future extension.

</deferred>

---

*Phase: 04-review-skills*
*Context gathered: 2026-04-12*
