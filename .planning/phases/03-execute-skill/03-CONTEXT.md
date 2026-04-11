# Phase 3: Execute Skill - Context

**Gathered:** 2026-04-11 (discuss mode, --analyze)
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a SKILL.md for `lz-advisor-execute` that orchestrates a full executor-advisor coding loop. Sonnet executor does actual coding work (reading, writing, testing, committing) while consulting the Opus advisor agent (`lz-advisor:advisor`) at strategic moments -- before substantive work, when stuck, when changing approach, and before declaring done. One skill file, multiple advisor consultations per invocation.

Additionally, update the plan skill's output location from project root to `plans/<task-slug>.plan.md` -- a prerequisite for the execute skill's plan consumption mechanism.

</domain>

<decisions>
## Implementation Decisions

### Plan Input Mechanism
- **D-01:** User-mention only via `@` file reference. The user explicitly passes a plan file (e.g., `/lz-advisor.execute @plans/add-favicon.plan.md`). No auto-detection of plan files. When no plan is mentioned, the executor orients from scratch (same as plan skill's orient phase). This keeps the interface explicit and avoids false positives from stray plan files.
- **D-02:** Update the plan skill (`skills/lz-advisor-plan/SKILL.md`) to write plans to `plans/<task-slug>.plan.md` instead of `plan-<task-slug>.md` in the project root. Keeps the repo root clean and aligns with the user's global convention for plan file locations.

### Durability Before Final Advisor Call
- **D-03:** Git commit before the final advisor call. The executor writes all files AND commits them (staging specific files by name, never `git add .` or `git add -A`) before the final "before declaring done" advisor consultation. This matches the advisor-timing.md guidance: "make your deliverable durable: write the file, save the result, commit the change." The commit survives session interruptions during the final Opus call.

### Advisor Call Flow
- **D-04:** All 4 consultation moments described, executor judges which apply per task. Matches the API advisor tool pattern exactly -- the suggested system prompt describes all 4 moments (before substantive work, when stuck, when changing approach, before declaring done) and the executor decides which are relevant. No mandatory/conditional distinction. The advisor-timing.md reference file already carries this guidance; the SKILL.md reinforces it in the workflow structure.

### Reference File Strategy
- **D-05:** Shared `references/` directory at plugin root. Move `advisor-timing.md` from `skills/lz-advisor-plan/references/` to `references/advisor-timing.md` at the plugin root. All skills (plan, execute, review, security-review) reference this single copy. Non-standard relative to official plugin conventions (which use per-skill `references/`), but DRY for a file shared by all 4 skills. Implementation note: the `@references/` include syntax resolves relative to the skill directory -- the planner must determine the correct include path (e.g., `@../../references/advisor-timing.md` or Read tool with `${CLAUDE_PLUGIN_ROOT}/references/`).

### Claude's Discretion

- Exact workflow structure and section ordering in the SKILL.md -- must cover the complete executor-advisor loop (orient, consult, work, consult-done) but section naming and XML tag structure are flexible.
- How the skill prompt instructs the executor to detect "stuck" and "approach change" moments -- the guidance from advisor-timing.md provides the framework, but exact phrasing is the planner's choice.
- Reconciliation pattern phrasing -- must instruct executor to surface conflicts in one more advisor call (per IMPL-08), but exact wording and placement in the skill prompt are flexible.
- How the executor summarizes context for each advisor consultation -- must be self-contained summaries (advisor has no transcript access), but the level of prescription in the skill prompt is flexible.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Anthropic Advisor Strategy
- `research/anthropic/docs/advisor-tool.md` -- API advisor tool reference with timing guidance, suggested system prompt blocks (lines 580-598 are the exact timing wording), trimming instructions. Source for D-04 (all 4 moments, executor judges).
- `research/anthropic/blog/the-advisor-strategy-give-agents-an-intelligence-boost.md` -- Strategy rationale, benchmark results (Sonnet + Opus = +2.7pp at -11.9% cost), `max_uses: 3` context.

### Plugin Architecture
- `.planning/research/ARCHITECTURE.md` -- Execute skill flow diagram, skill-agent orchestration mechanism, subagent context isolation, reconciliation pattern, anti-patterns (no raw context dumps, no per-tool-call consultation).
- `.planning/research/STACK.md` -- Skill file format, frontmatter fields, `allowed-tools` syntax.

### Existing Components (Phase 1 and 2 output)
- `agents/advisor.md` -- Opus advisor agent definition. System prompt, output constraint (<100 words, enumerated steps), consultation awareness (adapts to framing), tools (Read, Glob), maxTurns: 1.
- `skills/lz-advisor-plan/references/advisor-timing.md` -- Current location of timing/weight/packaging reference. Will be moved to `references/advisor-timing.md` at plugin root per D-05.
- `skills/lz-advisor-plan/SKILL.md` -- Plan skill with orient-consult-produce workflow. Template for execute skill structure. Must also be updated per D-02 (plan output location).

### Prompt Engineering
- `research/prompt-engineering/MODEL-OPTIMIZATION-SONNET.md` -- Sonnet literal instruction following, structured XML, parallel tool use. Execute skill prompt should follow these patterns.
- `research/prompt-engineering/MODEL-OPTIMIZATION-OPUS.md` -- Opus system prompt sensitivity (no aggressive language). Relevant to advisor consultation framing.

### Prior Phase Context
- `.planning/phases/01-plugin-scaffold-and-advisor-agent/01-CONTEXT.md` -- Phase 1 decisions. Key carry-forwards: D-05 (advisor stance driven by consultation framing), D-06 (under 100 words), D-07 (single advisor, multiple skills).
- `.planning/phases/02-plan-skill/02-CONTEXT.md` -- Phase 2 decisions. Key carry-forwards: D-02 (one consult for plan; execute gets multiple), D-03 (scoped executor framing for conciseness), D-04 (plan file format: Strategic Direction + Steps + Key Decisions + Dependencies).

### Requirements
- `.planning/REQUIREMENTS.md` -- IMPL-01 through IMPL-10 are the hard constraints for this phase.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `agents/advisor.md` -- Complete Opus advisor agent, ready to invoke as `lz-advisor:advisor`. Consultation awareness section adapts to framing (orient, diagnose, verify, evaluate).
- `skills/lz-advisor-plan/SKILL.md` -- Plan skill establishes the orient-consult-produce pattern. Execute skill extends this with work and final-review phases.
- `skills/lz-advisor-plan/references/advisor-timing.md` -- Complete timing/weight/packaging reference (~60 lines). Will move to plugin root `references/` per D-05.
- `.claude-plugin/plugin.json` -- Valid plugin manifest (v0.1.0).

### Established Patterns
- Skill prompt uses structured XML sections (`<orient>`, `<consult>`, `<produce>`) per plan skill.
- Agent system prompt uses calm natural language, no aggressive keywords (Phase 1 D-09).
- Plugin uses kebab-case naming throughout.
- Reference files loaded via `@references/` include syntax in skill prompts.
- Skills use `allowed-tools: Agent(lz-advisor:advisor)` to permit advisor invocation.
- No `context: fork` -- skills run inline to access conversation context.
- No `model` override in skill frontmatter -- inherits session model.

### Integration Points
- Skill created at `skills/lz-advisor-execute/SKILL.md` -- directory does not yet exist.
- Skill invokes `lz-advisor:advisor` via Agent tool (same as plan skill).
- Plan files consumed from `plans/<task-slug>.plan.md` per D-01/D-02.
- Shared reference file at `references/advisor-timing.md` per D-05.
- Execute skill is the most complex skill -- plan has 1 consultation, execute has up to 4.

</code_context>

<specifics>
## Specific Ideas

- The execute skill's workflow is an extension of the plan skill: orient -> consult (before work) -> work -> [consult when stuck/approach change] -> make durable (commit) -> consult (before done). The plan skill covers orient -> consult -> produce; the execute skill covers the full loop.
- The "before declaring done" advisor call should receive a summary of what was built, what tests pass, and what was committed -- not a request for approval but a final check. The advisor verifies the approach is sound and flags concerns.
- The reconciliation pattern (IMPL-08) is described in advisor-timing.md: "Surface the conflict in one more advisor call -- 'I found X, you suggest Y, which constraint breaks the tie?'" The skill prompt should reinforce this instruction.
- Sonnet's literal instruction-following means the workflow phases can be explicitly structured in the SKILL.md. Specify the exact consultation moments and Sonnet will follow them.

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope.

</deferred>

---

*Phase: 03-execute-skill*
*Context gathered: 2026-04-11*
