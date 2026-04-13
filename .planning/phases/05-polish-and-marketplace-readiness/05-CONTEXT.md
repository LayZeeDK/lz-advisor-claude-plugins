# Phase 5: Polish and Marketplace Readiness - Context

**Gathered:** 2026-04-13 (discuss mode, --analyze)
**Status:** Ready for planning

<domain>
## Phase Boundary

Optimize all skill descriptions for discoverability using the skill-creator eval pipeline, restructure the plugin to follow marketplace conventions (`plugins/lz-advisor/`), verify agents against plugin-dev guidelines, measure conciseness and token overhead, and validate the plugin installs cleanly from GitHub. This phase closes all v1 deferred items and makes the plugin marketplace-ready.

</domain>

<decisions>
## Implementation Decisions

### Description Optimization Pipeline

- **D-01:** Full skill-creator description optimization pipeline for all 4 skills. Generate 20 eval queries per skill (8-10 should-trigger, 8-10 should-not-trigger). Queries must be realistic and detailed per skill-creator guidelines -- include file paths, personal context, casual speech, near-miss negatives.
- **D-02:** Cross-skill negatives in each skill's eval set. Queries intended for sibling skills appear as should-not-trigger entries. Example: "check for SQL injection risks" is positive for security-review, negative for review. Tests disambiguation within skill-creator's per-skill pipeline.
- **D-03:** Description optimization targets skill descriptions only (not agent descriptions). Agents are skill-orchestrated (Phase 1 D-11) -- their descriptions don't need user-triggering optimization. Agents are verified separately against plugin-dev structural guidelines (D-10).
- **D-04:** Agent reviews at BOTH review points in the pipeline: (1) eval query quality before running `run_loop.py` (verify realistic, properly categorized, tricky negatives), (2) before/after description comparison after optimization (verify trigger rates improved, approve `best_description`). Replaces the skill-creator HTML template user review.
- **D-05:** All eval commands must explicitly pass `--model claude-sonnet-4-6` (or `--model sonnet`). The current session runs Opus 4.6, but the plugin targets Sonnet users. Description triggering tests must match real-world user experience.
- **D-06:** `run_loop.py` runs once per skill (4 total, sequential). Uses `--max-iterations 5 --verbose`. Skill path points to `plugins/lz-advisor/skills/<name>`. Workspace output goes to `evals/lz-advisor/`.

### Plugin Structure (Marketplace Convention)

- **D-07:** Restructure plugin from repo root to `plugins/lz-advisor/`. All plugin components (`.claude-plugin/`, `agents/`, `skills/`, `references/`, `README.md`, `LICENSE`) move inside `plugins/lz-advisor/`. Development artifacts (`.planning/`, `research/`, `CLAUDE.md`) stay at repo root. Follows the marketplace `plugins/<plugin-name>/` convention observed in `claude-plugins-official`.
- **D-08:** Version stays at `0.1.0`. Pre-release until proven in the wild. No version bump for marketplace.
- **D-09:** Repo-level README with brief explanation of directory structure: `plugins/lz-advisor/` is the installable plugin, other directories are development artifacts.
- **D-10:** Update `--plugin-dir` path convention in CLAUDE.md to `plugins/lz-advisor` for local development testing.
- **D-11:** Plugin README cost expectations section removed. Hard to measure precisely and goes stale with model pricing changes.

### Agent Verification

- **D-12:** Verify all 3 agents (`advisor.md`, `reviewer.md`, `security-reviewer.md`) against plugin-dev agent-development guidelines. Run plugin-dev:plugin-validator for structural checks. Additionally verify: system prompt length (500-3000 words recommended), example count (2-4 recommended), color semantic fit, no aggressive language (ADVR-06). Fix issues found. Known issues to investigate: `reviewer.md` system prompt may be short (~400 words), `reviewer.md` color `green` may not match plugin-dev's "blue/cyan for analysis/review" guideline, both reviewer agents have only 2 examples (minimum).

### Conciseness Calibration (Deferred from Phase 2)

- **D-13:** Measure then tune. Run each skill via `claude -p` with `--model sonnet` and a realistic prompt. Measure advisor output token count. If consistently over 100 words, strengthen the agent system prompt. Threshold for tuning is Claude's Discretion -- executor judges based on measurements.

### Token Overhead and Effort Level (Deferred from Phase 4)

- **D-14:** Piggyback on eval runs. Capture token counts and timing during the description optimization pipeline. Use data for: (1) documenting actual token usage patterns, (2) deciding whether to downgrade reviewer agents from `effort: high` to `effort: medium`. Thresholds for action are Claude's Discretion.

### Eval Infrastructure

- **D-15:** Eval artifacts live at `evals/lz-advisor/` at repo root, following skill-creator sibling workspace conventions from there. NOT inside `plugins/lz-advisor/`. Structure: `evals/lz-advisor/<skill-name>-workspace/` for workspaces, eval definitions alongside.
- **D-16:** Commit all eval artifacts EXCEPT `outputs/` directories. `.gitignore` only `evals/**/outputs/` (raw skill-produced files, regenerated on re-run). Everything else committed: timing, grading, benchmarks, feedback, history, eval metadata, description optimization results. Full audit trail of optimization process.

### Execution Ordering

- **D-17:** Strict execution order with dependencies:
  1. Restructure to `plugins/lz-advisor/`
  2. Verify agents against plugin-dev guidelines + fix issues
  3. Run plugin-dev:plugin-validator on new structure
  4. Generate 20 eval queries per skill (cross-skill negatives)
  5. Agent reviews eval queries
  6. Run description optimization (`run_loop.py` x4 skills, `--model claude-sonnet-4-6`)
  7. Apply best descriptions + measure conciseness (tune agent system prompt if needed)
  8. Final plugin-validator run (post-optimization)
  9. Update README, repo README, CLAUDE.md, .gitignore

### Validation Strategy

- **D-18:** Three success gates, all must pass: (1) plugin-dev:plugin-validator passes on final structure, (2) `run_loop.py` test scores improved for all 4 skills (if optimization doesn't improve a skill's score, keep original description), (3) clean GitHub install test via `claude plugin install`.
- **D-19:** Local-first testing with `--plugin-dir plugins/lz-advisor` throughout Phase 5. Push to GitHub and test remote install as the final validation step.

### ROADMAP Update

- **D-20:** Update ROADMAP.md Phase 5 description and success criteria to reflect the expanded scope before planning. Keeps roadmap as single source of truth.

### Claude's Discretion

- Measurement thresholds for conciseness tuning and effort level decisions -- executor measures during eval runs and makes judgment calls
- Exact eval query content -- must follow skill-creator guidelines (realistic, detailed, near-miss negatives) but specific queries are the planner's choice
- Agent review criteria -- what specifically the review agents check, beyond the high-level "query quality" and "before/after comparison" guidance
- Number and structure of plans within Phase 5 -- planner determines optimal plan breakdown given the execution ordering
- Whether to run skill-creator's full skill improvement loop on any skills beyond description optimization -- skill bodies were validated in Phases 1-4, but planner can evaluate

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Skill-Creator Plugin (authoritative for description optimization)
- `~/.claude/plugins/cache/claude-plugins-official/skill-creator/*/skills/skill-creator/SKILL.md` -- Full skill-creator workflow including description optimization pipeline (lines 336-405): eval query generation, `run_loop.py` mechanics, train/test split, `best_description` output. Source for D-01 through D-06.
- `~/.claude/plugins/cache/claude-plugins-official/skill-creator/*/skills/skill-creator/references/schemas.md` -- JSON schemas for `evals.json`, `grading.json`, `timing.json`, `benchmark.json`. Defines exact field names the viewer/aggregator expect.

### Plugin-Dev Plugin (authoritative for structure and agent verification)
- `~/.claude/plugins/cache/claude-plugins-official/plugin-dev/*/skills/plugin-structure/SKILL.md` -- Plugin directory structure, auto-discovery mechanism, naming conventions, best practices. Source for D-07 (marketplace `plugins/<name>/` convention).
- `~/.claude/plugins/cache/claude-plugins-official/plugin-dev/*/skills/plugin-structure/references/manifest-reference.md` -- Complete plugin.json field reference, validation regex, recommended metadata. Source for D-08 (version), D-11 (description guidance).
- `~/.claude/plugins/cache/claude-plugins-official/plugin-dev/*/agents/plugin-validator.md` -- 10-step validation process including manifest, directory structure, agents, skills, hooks, file organization, security. Source for D-12, D-18.
- `~/.claude/plugins/cache/claude-plugins-official/plugin-dev/*/skills/agent-development/SKILL.md` -- Agent frontmatter fields (name, description, model, color, tools), validation rules, example count guidance (2-4), testing. Source for D-12.
- `~/.claude/plugins/cache/claude-plugins-official/plugin-dev/*/skills/agent-development/references/system-prompt-design.md` -- System prompt patterns, length guidelines (500-3000 recommended), structure templates, writing style. Source for D-12.

### Existing Components (Phase 1-4 output)
- `agents/advisor.md` -- Opus advisor agent. Verify conciseness constraint, aggressive language, example count. Source for D-13.
- `agents/reviewer.md` -- Opus code quality reviewer. Known issues: ~400 words (below 500 recommended), 2 examples (minimum), green color (may not fit plugin-dev semantics). Source for D-12.
- `agents/security-reviewer.md` -- Opus security reviewer. 2 examples (minimum). Source for D-12.
- `skills/lz-advisor-plan/SKILL.md` -- Plan skill current description. Source for D-01.
- `skills/lz-advisor-execute/SKILL.md` -- Execute skill current description. Source for D-01.
- `skills/lz-advisor-review/SKILL.md` -- Review skill current description. Source for D-01, D-02.
- `skills/lz-advisor-security-review/SKILL.md` -- Security review skill current description. Source for D-01, D-02.
- `references/advisor-timing.md` -- Shared timing/weight/packaging reference. Moves to `plugins/lz-advisor/references/` per D-07.

### Prior Phase Context
- `.planning/phases/01-plugin-scaffold-and-advisor-agent/01-CONTEXT.md` -- Phase 1 decisions. Key carry-forwards: D-09 (positive-only instructions), D-10/D-11 (agent description patterns), D-06 (under 100 words).
- `.planning/phases/02-plan-skill/02-CONTEXT.md` -- Phase 2 decisions. Key: D-03 (scoped executor framing for conciseness -- hypothesis tested in D-13).
- `.planning/phases/04-review-skills/04-CONTEXT.md` -- Phase 4 decisions. Key: D-04 (token overhead deferred to Phase 5), deferred items (effort level tuning, conciseness measurement).

### Requirements
- `.planning/REQUIREMENTS.md` -- INFRA-04 is the primary requirement. Deferred items (conciseness, tokens, effort) are additions from prior phase deferrals.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- All 4 SKILL.md files with current descriptions (5-7 trigger phrases each) -- baseline for optimization.
- All 3 agent .md files with current system prompts -- baseline for verification.
- `.claude-plugin/plugin.json` -- valid manifest, needs path move only.
- `references/advisor-timing.md` -- shared reference, moves with plugin.
- `README.md` -- comprehensive, needs cost section removal and path updates.
- `LICENSE` -- MIT, moves with plugin.

### Established Patterns
- Skills use `allowed-tools: Agent(lz-advisor:<agent>)` to pre-approve agent spawning.
- Agent system prompts use calm natural language, no aggressive keywords (Phase 1 D-09).
- Agent descriptions follow Style A: "Use this agent when..." + example blocks.
- Plugin uses kebab-case naming throughout.
- Skills use `@${CLAUDE_PLUGIN_ROOT}/references/advisor-timing.md` for shared reference loading.
- No `context: fork` -- all skills run inline to access conversation context.
- No `model` or `effort` override in skill frontmatter -- inherits session model.

### Integration Points
- Plugin restructured from repo root to `plugins/lz-advisor/`.
- Eval infrastructure at `evals/lz-advisor/` (sibling to `plugins/` at repo root).
- `run_loop.py` at skill-creator plugin dir, invoked with `--skill-path plugins/lz-advisor/skills/<name>`.
- `claude -p` invocations for conciseness measurement with `--plugin-dir plugins/lz-advisor --model sonnet`.
- Final validation: `claude plugin install LayZeeDK/lz-advisor-claude-plugins` from pushed GitHub repo.

</code_context>

<specifics>
## Specific Ideas

- The skill-creator description optimization pipeline generates eval queries, runs a `run_loop.py` that splits 60/40 train/test, evaluates each query 3 times, uses extended thinking to propose improvements, and iterates up to 5 times. The output is `best_description` selected by test score to avoid overfitting.
- Cross-skill negatives are critical for our plugin because "review" and "security-review" share keyword space. The disambiguation testing ensures the RIGHT skill triggers.
- The eval workspace structure follows skill-creator conventions (`<name>-workspace/iteration-N/eval-<name>/`) but rooted at `evals/lz-advisor/` instead of inside the distributable plugin.
- `reviewer.md` color `green` may need changing to `blue` or `cyan` per plugin-dev's guideline that blue/cyan suits "analysis, review" while green suits "success-oriented tasks."
- The Opus session model means every eval/test invocation must explicitly override to Sonnet -- this is a hard constraint the planner must enforce on every command.

</specifics>

<deferred>
## Deferred Ideas

None -- Phase 5 closes all v1 loose ends including items deferred from Phases 2 and 4.

</deferred>

---

*Phase: 05-polish-and-marketplace-readiness*
*Context gathered: 2026-04-13*
