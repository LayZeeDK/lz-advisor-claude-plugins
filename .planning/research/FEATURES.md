# Feature Landscape

**Domain:** Claude Code marketplace plugin implementing the advisor strategy (Opus advisor + Sonnet executor)
**Researched:** 2026-04-10

## Table Stakes

Features users expect. Missing = plugin feels incomplete or not worth installing over manual `/model opusplan` usage.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Opus advisor agent with concise output | Core value proposition -- the advisor IS the plugin | Low | Under 100 words, enumerated steps, not explanations. Anthropic's trimming instruction cuts output 35-45% without quality loss |
| Plan skill (`/lz-advisor.plan`) | Every competing plugin has planning (compound-engineering, deep-plan). Without it, no reason to install | Medium | Sonnet orients (reads files, gathers context), then consults Opus for strategic plan, then Sonnet produces actionable output |
| Implement skill (`/lz-advisor.implement`) | The full executor-advisor loop is the core workflow. Without execution support, the plugin is just a planning toy | High | Must implement Anthropic's full timing pattern: consult after orientation, when stuck, when changing approach, before declaring done |
| Review skill (`/lz-advisor.review`) | Code review is table stakes for coding plugins per 2026 ecosystem norms. Compound Engineering has 12-agent review; deep-implement has built-in review | Medium | Opus reviews completed work for correctness, patterns, edge cases. Single focused Opus pass, not multi-agent parallelism |
| Advisor consultation at Anthropic-recommended timing points | Without disciplined timing, the plugin is just "ask Opus" -- no different from switching models manually | Low | Timing is prompt engineering, not orchestration. Encode in skill prompts |
| Advisor output trimming (conciseness enforcement) | Cost control is critical -- untrimmed advisor output wastes Opus tokens. Anthropic proved trimming works without quality loss | Low | Single system prompt line: "respond in under 100 words and use enumerated steps, not explanations" |
| Accept external plans in implement skill | Users may plan with other tools (compound-engineering, deep-plan, manual specs). Rejecting external plans kills adoption | Low | Optional parameter: path to plan file. If absent, implement skill handles orientation + advisor consultation for planning inline |

## Differentiators

Features that set this plugin apart from `opusplan` mode, compound-engineering, and deep-plan. Not expected, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Security review skill (`/lz-advisor.security-review`) | Dedicated security lens from Opus is rare in the plugin ecosystem. Most plugins bundle security into general review (compound-engineering has it as one of 12 review agents). A standalone security skill lets users invoke it explicitly for security-critical work | Medium | Threat modeling, injection vectors, auth/authz gaps, secret exposure, dependency risks. Opus's deeper reasoning matters most here |
| Reconciliation pattern for advisor-executor disagreement | No competing plugin handles the case where empirical evidence contradicts advisor guidance. Anthropic's suggested prompt explicitly addresses this with a "reconcile call" pattern | Medium | When executor finds evidence contradicting advisor, surface the conflict in one more advisor call: "I found X, you suggest Y, which constraint breaks the tie?" |
| Strategic advisor consultation (2-3 calls per task, not per-tool-call) | `opusplan` uses Opus for ALL plan-mode reasoning. Compound-engineering spawns 12+ subagents. This plugin's value is surgical Opus usage at high-leverage moments only | Low | Prompt discipline, not code. Key insight from Anthropic: advisor adds most value on first call (before approach crystallizes) and final check (after work done) |
| Durable deliverable before final advisor check | Anthropic's prompt explicitly says: "BEFORE this call, make your deliverable durable: write the file, save the result, commit the change. The advisor call takes time; if the session ends during it, a durable result persists." No competing plugin enforces this | Low | Encoded in implement skill prompt. Protects user work from session timeouts during Opus inference |
| Zero external dependencies | Compound-engineering optionally uses Gemini/OpenAI for review. deep-plan supports external LLM review. oh-my-claude requires an HTTP proxy. This plugin uses ONLY Claude Code's Agent tool -- nothing to configure, no API keys, no proxies | Low | Major UX advantage. One install, zero config. Works on any Claude Code plan (Team, individual) |
| Inherits session model for executor | Unlike `opusplan` which forces Sonnet in execution mode, this plugin respects whatever model the user chose for their session. Optimized for Sonnet 4.6 but works with any model | Low | If a user is already on Opus, the advisor still adds value (Opus-advising-Opus is a valid pair per Anthropic's compatibility table) |
| Advisor-guided stuck detection | When the executor hits recurring errors or approach isn't converging, the skill prompts trigger advisor consultation automatically. This is more nuanced than compound-engineering's "review after completion" pattern | Low | Prompt-level feature. Anthropic's timing: "When stuck -- errors recurring, approach not converging, results that don't fit" |

## Anti-Features

Features to explicitly NOT build. These are tempting but wrong for this plugin.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Hooks-based automatic advisor triggering | Hooks are global (can't scope to skill execution), lack conversation context for meaningful advisor consultation, and would fire on every session where the plugin is installed -- massive cost with no user intent signal | Keep advisor consultation purely skill-driven. Users explicitly invoke skills when they want the advisor pattern |
| Task-type-specific skills (refactor, test, infra, etc.) | The advisor timing pattern is identical regardless of task type. What changes is the user's prompt, not the orchestration. Adding `/lz-advisor.refactor`, `/lz-advisor.test`, etc. would duplicate skill logic with minor prompt variations | Rely on generic phase-based skills (plan, implement, review). The user's natural language prompt provides task-type context |
| Multi-agent parallel review (like compound-engineering's 12-agent approach) | Spawning 12 Sonnet agents for parallel review is compound-engineering's approach. This plugin's value proposition is Opus-level intelligence through a single focused advisor, not breadth through parallelism | Single Opus advisor review pass. Opus sees everything compound-engineering splits across 12 agents, but reasons about it holistically |
| External LLM integration (Gemini, OpenAI, etc.) | deep-plan supports external LLM review. oh-my-claude routes to DeepSeek/ZhiPu. Adding external model support adds API key management, configuration complexity, and failure modes -- contradicting the zero-dependency value proposition | Claude-only. Opus as advisor, session model as executor. Zero external dependencies |
| Claude API / `advisor_20260301` tool dependency | The API advisor tool requires the Messages API and beta headers. This plugin targets Claude Code users who don't write API code. Depending on the API tool would require an Anthropic SDK dependency and API key management | Replicate the advisor pattern using Claude Code's Agent tool with `model: "opus"`. Same pattern, native to the plugin system |
| Plan storage/management system | deep-plan writes section files to disk and tracks completion via commit hashes. Compound-engineering stores brainstorms in docs/brainstorms/. Adding a plan storage system adds complexity for marginal value | Plans are conversation artifacts. If the user wants to persist a plan, they can save the output. The implement skill accepts a plan file path but doesn't manage plan lifecycle |
| Automatic model detection/fallback | Detecting whether the user has Opus access, falling back to Sonnet-advising-Sonnet, etc. adds complexity and masks the core value proposition. If Opus isn't available, the plugin shouldn't pretend to work | Fail clearly if Opus is unavailable. Document the requirement. Don't degrade silently |
| Per-tool-call advisor consultation | Anthropic's benchmarks show advisor adds most value at 2-3 strategic calls per task. Consulting on every tool call would be expensive and noisy, negating the cost advantage | Strategic consultation only: after orientation, when stuck, when changing approach, before declaring done |
| Agent that writes code or calls tools | The advisor's role is guidance, not action. Giving it tool access turns it into a second executor, defeating the cost model | Restrict advisor agent to read-only tools at most (Read, Glob). Advisor returns plans and corrections, executor acts on them |

## Feature Dependencies

```
Opus advisor agent (lz-advisor) --> all skills depend on this
  |
  |-- Plan skill (/lz-advisor.plan)
  |     '-- Implement skill can consume plan output (optional dependency)
  |
  |-- Implement skill (/lz-advisor.implement)
  |     |-- Uses advisor timing pattern (after orientation, when stuck, when changing approach, before done)
  |     |-- Reconciliation pattern (when executor evidence contradicts advisor)
  |     '-- Durable deliverable enforcement (before final advisor check)
  |
  |-- Review skill (/lz-advisor.review)
  |     '-- No dependency on plan or implement -- reviews any completed work
  |
  '-- Security review skill (/lz-advisor.security-review)
        '-- No dependency on plan or implement -- reviews any completed work with security lens
```

## Detailed Feature Specifications

### Advisor Agent (`lz-advisor`)

**What it does:** An Opus 4.6 subagent that provides concise strategic guidance when consulted by skills.

**Advisor output format (from Anthropic's suggested prompt):**
- Under 100 words
- Enumerated steps
- Not explanations -- actionable directives
- Returns: a plan, a correction, or a stop signal

**Key behavioral constraints:**
- The advisor never calls tools or produces user-facing output
- Only provides guidance to the executor
- Sees the full conversation context (task, tool calls, results)

### Plan Skill (`/lz-advisor.plan`)

**Workflow:**
1. Executor (session model) orients: reads relevant files, gathers context, understands the codebase structure
2. Executor consults advisor (Opus) with orientation context: "Here's what I found, what's the strategic approach?"
3. Advisor returns concise enumerated plan (under 100 words)
4. Executor expands advisor's plan into a detailed, actionable implementation plan with specific files, steps, and considerations
5. Executor presents plan to user

**What makes a good plan output from an advisor-assisted flow:**
- Advisor provides the strategic skeleton (high-level approach, ordering, key decisions)
- Executor fills in tactical details (specific files, function signatures, test cases)
- Plan is immediately actionable by implement skill or human developer
- Dependencies between steps are explicit
- Risk areas flagged for deeper attention during implementation

**Differentiation from competitors:**
- Compound-engineering spawns 3 parallel research agents + 1 analyzer agent for planning (expensive, complex)
- deep-plan runs research + interview + external LLM review (slow, multi-phase, external dependencies)
- This plugin: one Opus consultation produces the strategic skeleton, executor expands it (fast, cheap, focused)

### Implement Skill (`/lz-advisor.implement`)

**Full executor-advisor loop step by step:**

1. **Orientation phase** (executor only -- no advisor yet)
   - Read relevant files, understand codebase structure
   - Identify what needs to change and where
   - If a plan file was provided, load and understand it
   - Orientation is NOT substantive work -- don't consult advisor yet

2. **First advisor consultation** (BEFORE substantive work)
   - After orientation, before writing any code
   - Executor presents findings to advisor
   - Advisor returns strategic approach as enumerated steps
   - This is the highest-value consultation -- before the approach crystallizes

3. **Execution phase** (executor drives, advisor on standby)
   - Executor implements following advisor's plan
   - Writes code, runs tests, iterates
   - Most turns are mechanical at executor cost

4. **Stuck detection** (triggers mid-work advisor consultation)
   - Errors recurring after 2-3 attempts
   - Approach not converging on a solution
   - Results that don't fit expectations
   - Executor consults advisor: "I'm stuck on X, tried Y and Z, what am I missing?"

5. **Approach change** (triggers mid-work advisor consultation)
   - When executor considers abandoning current approach
   - Consults advisor before switching: "Current approach isn't working because X, considering Y instead"

6. **Durable deliverable** (executor enforces before final check)
   - Write all files to disk
   - Save all results
   - Ensure work persists even if session ends during advisor call

7. **Final advisor consultation** (before declaring done)
   - Advisor reviews the completed work in context
   - Returns confirmation, corrections, or a stop signal
   - If corrections needed, executor applies them

8. **Reconciliation** (when evidence conflicts with advice)
   - If executor's empirical findings contradict advisor's recommendation
   - Don't silently switch -- surface the conflict in one more advisor call
   - "I found X, you suggest Y, which constraint breaks the tie?"
   - Advisor may have underweighted evidence; reconcile call is cheaper than wrong branch

**How the executor should treat advice (from Anthropic's suggested prompt):**
- Give the advice serious weight
- If a step fails empirically, or primary-source evidence contradicts a specific claim, adapt
- A passing self-test is NOT evidence the advice is wrong -- it's evidence the test doesn't check what the advice is checking

### Review Skill (`/lz-advisor.review`)

**What an effective advisor code review covers:**
- Correctness: Does the code do what it claims?
- Edge cases: What inputs/states could break it?
- Design patterns: Does it follow codebase conventions?
- Maintainability: Will future developers understand this?
- Test coverage: Are the important paths tested?
- Performance: Any obvious bottlenecks or N+1 queries?
- API contracts: Do interfaces match expectations?

**Workflow:**
1. Executor gathers context: changed files, git diff, test results
2. Single Opus advisor review pass with full context
3. Advisor returns enumerated findings (under 100 words per finding area)
4. Executor presents findings to user with actionable suggestions

**Differentiation:** Single focused Opus review vs. compound-engineering's 12 parallel Sonnet reviews. Opus holistically reasons about interactions between concerns that parallel agents can't see.

### Security Review Skill (`/lz-advisor.security-review`)

**Security-specific lens the advisor should apply:**
- **Injection vectors:** SQL injection, XSS, command injection, path traversal
- **Authentication/Authorization:** Missing auth checks, privilege escalation, broken access control
- **Secret exposure:** Hardcoded credentials, secrets in logs, environment variable leaks
- **Input validation:** Unvalidated user input, type confusion, buffer concerns
- **Dependency risks:** Known CVEs in dependencies, outdated packages
- **Data handling:** PII exposure, encryption gaps, insecure storage
- **Threat modeling:** What can an attacker do with access to this code path?
- **Configuration security:** Debug modes in production, permissive CORS, missing security headers

**Workflow:** Same as review skill but with security-focused advisor prompt. The advisor applies OWASP Top 10 lens and threat actor perspective.

## Competitive Landscape

| Plugin/Feature | Planning | Implementation | Review | Multi-Model | Dependencies | Cost Model |
|---------------|----------|---------------|--------|-------------|-------------|------------|
| **lz-advisor (this plugin)** | Opus-guided plan | Full advisor loop with timing | Opus review | Opus advisor + session model executor | Zero | 2-3 Opus calls per task |
| **opusplan mode** | Opus in plan mode | Sonnet in exec mode | No built-in review | Opus plan / Sonnet exec | Built-in | All plan-mode tokens at Opus rate |
| **compound-engineering** | 3 parallel research agents + analyzer | Basic `/ce:work` | 12 parallel Sonnet agents | Sonnet only (no Opus) | Optional Gemini/OpenAI | Many subagent spawns |
| **deep-plan + deep-implement** | Research + interview + LLM review | TDD with code review | Built into implement | Optional external LLM | Optional external API keys | Section-based, many agent spawns |
| **workflow-orchestrator** | Task decomposition + dependency analysis | Multi-agent delegation | No dedicated review | Single model | None | Heavy orchestration overhead |

### Key Differentiator Summary

The plugin's competitive position is: **surgical Opus intelligence at strategic moments** vs. competitors that use either (a) Opus for everything in plan mode (`opusplan`), (b) many Sonnet agents in parallel (compound-engineering), or (c) complex multi-phase pipelines with external LLM dependencies (deep-plan).

The cost argument: 2-3 Opus calls at 400-700 output tokens each is dramatically cheaper than running Opus for an entire plan mode session or spawning 12+ Sonnet subagents.

## MVP Recommendation

Prioritize (in build order):

1. **Opus advisor agent** (`lz-advisor`) -- foundation for everything else
2. **Implement skill** (`/lz-advisor.implement`) -- the core workflow, demonstrates full value proposition
3. **Plan skill** (`/lz-advisor.plan`) -- standalone planning, also feeds implement skill
4. **Review skill** (`/lz-advisor.review`) -- completes the development lifecycle

Defer:
- **Security review skill** (`/lz-advisor.security-review`): Same architecture as review skill with different prompt. Build after review skill is validated, since it's a prompt variation not a new orchestration pattern.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Advisor timing pattern | HIGH | Directly from Anthropic's official suggested system prompt for coding tasks |
| Advisor output format | HIGH | Directly from Anthropic's docs -- under 100 words, enumerated steps |
| Reconciliation pattern | HIGH | Directly from Anthropic's suggested system prompt -- explicit "reconcile call" instruction |
| Implement skill workflow | HIGH | Derived step-by-step from Anthropic's timing guidance and advice-treatment prompt |
| Competitive landscape | MEDIUM | Based on WebSearch findings; plugin ecosystem moves fast. Verified compound-engineering and deep-plan exist as described |
| Security review scope | MEDIUM | Based on industry standards (OWASP, common security review practices). No competing plugin specializes here, so no direct comparison |
| Cost advantage claims | HIGH | Anthropic's benchmarks: Sonnet + Opus advisor = +2.7pp at 11.9% lower cost than Sonnet alone |
| `opusplan` comparison | MEDIUM | Based on WebSearch; opusplan uses Opus for ALL plan mode tokens vs. 2-3 calls in this plugin. Directional comparison is sound but exact cost ratios depend on task |

## Sources

- Anthropic advisor tool docs: https://platform.claude.com/docs/en/agents-and-tools/tool-use/advisor-tool (HIGH confidence -- official documentation)
- Anthropic advisor strategy blog: https://claude.com/blog/the-advisor-strategy (HIGH confidence -- official blog post)
- [Compound Engineering Plugin](https://github.com/EveryInc/compound-engineering-plugin) (MEDIUM confidence -- GitHub repo, WebSearch descriptions)
- [Deep Trilogy Plugins](https://github.com/piercelamb/deep-plan) (MEDIUM confidence -- GitHub repo, Medium blog posts)
- [Claude Code model configuration](https://code.claude.com/docs/en/model-config) (MEDIUM confidence -- referenced in WebSearch)
- [Claude Code subagents](https://code.claude.com/docs/en/sub-agents) (MEDIUM confidence -- referenced in WebSearch)
- [oh-my-claude multi-model plugin](https://github.com/lgcyaxi/oh-my-claude) (LOW confidence -- WebSearch only)
- [workflow-orchestrator plugin](https://github.com/barkain/claude-code-workflow-orchestration) (LOW confidence -- WebSearch only)
- [Best Claude Code Plugins 2026](https://buildtolaunch.substack.com/p/best-claude-code-plugins-tested-review) (LOW confidence -- WebSearch summary)
- [Claude Code Plugins Review 2026](https://aitoolanalysis.com/claude-code-plugins/) (LOW confidence -- WebSearch summary)
