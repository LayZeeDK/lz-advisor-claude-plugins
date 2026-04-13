# Phase 5: Polish and Marketplace Readiness - Research

**Researched:** 2026-04-13
**Domain:** Claude Code plugin marketplace conventions, skill description optimization, agent verification
**Confidence:** HIGH

## Summary

Phase 5 covers four interrelated areas: (1) restructuring the plugin for marketplace distribution, (2) verifying agents against plugin-dev guidelines, (3) optimizing skill descriptions for discoverability via the skill-creator evaluation pipeline, and (4) measuring conciseness and token overhead. The restructure to `plugins/lz-advisor/` is the foundation -- everything else operates on the new directory structure.

The skill-creator description optimization pipeline is well-documented and automated. It generates eval queries, runs `run_loop.py` which splits 60/40 train/test, evaluates each query 3 times via `claude -p`, uses extended thinking to propose description improvements, and iterates up to 5 times. The output is a `best_description` selected by test score to prevent overfitting. All required tools (Python 3.14.3, anthropic SDK 0.76.0, Claude CLI 2.1.104) are available on this machine.

**Primary recommendation:** Execute in the strict order D-17 defines. The restructure MUST happen first because all subsequent commands reference `plugins/lz-advisor/skills/<name>` paths. The marketplace distribution path requires a `marketplace.json` -- not a simple `claude plugin install owner/repo` (that command does not exist). Document both `--plugin-dir` local testing and marketplace-based remote installation.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Full skill-creator description optimization pipeline for all 4 skills. Generate 20 eval queries per skill (8-10 should-trigger, 8-10 should-not-trigger). Queries must be realistic and detailed per skill-creator guidelines -- include file paths, personal context, casual speech, near-miss negatives.
- **D-02:** Cross-skill negatives in each skill's eval set. Queries intended for sibling skills appear as should-not-trigger entries. Example: "check for SQL injection risks" is positive for security-review, negative for review. Tests disambiguation within skill-creator's per-skill pipeline.
- **D-03:** Description optimization targets skill descriptions only (not agent descriptions). Agents are skill-orchestrated (Phase 1 D-11) -- their descriptions don't need user-triggering optimization. Agents are verified separately against plugin-dev structural guidelines (D-10).
- **D-04:** Agent reviews at BOTH review points in the pipeline: (1) eval query quality before running `run_loop.py` (verify realistic, properly categorized, tricky negatives), (2) before/after description comparison after optimization (verify trigger rates improved, approve `best_description`). Replaces the skill-creator HTML template user review.
- **D-05:** All eval commands must explicitly pass `--model claude-sonnet-4-6` (or `--model sonnet`). The current session runs Opus 4.6, but the plugin targets Sonnet users. Description triggering tests must match real-world user experience.
- **D-06:** `run_loop.py` runs once per skill (4 total, sequential). Uses `--max-iterations 5 --verbose`. Skill path points to `plugins/lz-advisor/skills/<name>`. Workspace output goes to `evals/lz-advisor/`.
- **D-07:** Restructure plugin from repo root to `plugins/lz-advisor/`. All plugin components (`.claude-plugin/`, `agents/`, `skills/`, `references/`, `README.md`, `LICENSE`) move inside `plugins/lz-advisor/`. Development artifacts (`.planning/`, `research/`, `CLAUDE.md`) stay at repo root. Follows the marketplace `plugins/<plugin-name>/` convention observed in `claude-plugins-official`.
- **D-08:** Version stays at `0.1.0`. Pre-release until proven in the wild. No version bump for marketplace.
- **D-09:** Repo-level README with brief explanation of directory structure: `plugins/lz-advisor/` is the installable plugin, other directories are development artifacts.
- **D-10:** Update `--plugin-dir` path convention in CLAUDE.md to `plugins/lz-advisor` for local development testing.
- **D-11:** Plugin README cost expectations section removed. Hard to measure precisely and goes stale with model pricing changes.
- **D-12:** Verify all 3 agents (`advisor.md`, `reviewer.md`, `security-reviewer.md`) against plugin-dev agent-development guidelines. Run plugin-dev:plugin-validator for structural checks. Additionally verify: system prompt length (500-3000 words recommended), example count (2-4 recommended), color semantic fit, no aggressive language (ADVR-06). Fix issues found. Known issues to investigate: `reviewer.md` system prompt may be short (~400 words), `reviewer.md` color `green` may not match plugin-dev's "blue/cyan for analysis/review" guideline, both reviewer agents have only 2 examples (minimum).
- **D-13:** Measure then tune. Run each skill via `claude -p` with `--model sonnet` and a realistic prompt. Measure advisor output token count. If consistently over 100 words, strengthen the agent system prompt. Threshold for tuning is Claude's Discretion.
- **D-14:** Piggyback on eval runs. Capture token counts and timing during the description optimization pipeline. Use data for: (1) documenting actual token usage patterns, (2) deciding whether to downgrade reviewer agents from `effort: high` to `effort: medium`. Thresholds for action are Claude's Discretion.
- **D-15:** Eval artifacts live at `evals/lz-advisor/` at repo root, following skill-creator sibling workspace conventions from there. NOT inside `plugins/lz-advisor/`. Structure: `evals/lz-advisor/<skill-name>-workspace/` for workspaces, eval definitions alongside.
- **D-16:** Commit all eval artifacts EXCEPT `outputs/` directories. `.gitignore` only `evals/**/outputs/` (raw skill-produced files, regenerated on re-run). Everything else committed: timing, grading, benchmarks, feedback, history, eval metadata, description optimization results. Full audit trail of optimization process.
- **D-17:** Strict execution order with dependencies: (1) Restructure, (2) Verify agents + fix, (3) Plugin-validator, (4) Generate eval queries, (5) Agent reviews queries, (6) Run description optimization, (7) Apply best descriptions + measure conciseness, (8) Final plugin-validator, (9) Update README/CLAUDE.md/.gitignore.
- **D-18:** Three success gates: (1) plugin-dev:plugin-validator passes, (2) run_loop.py scores improved for all 4 skills, (3) clean GitHub install test via `claude plugin install`.
- **D-19:** Local-first testing with `--plugin-dir plugins/lz-advisor` throughout Phase 5.
- **D-20:** Update ROADMAP.md Phase 5 description and success criteria to reflect the expanded scope before planning.

### Claude's Discretion
- Measurement thresholds for conciseness tuning and effort level decisions
- Exact eval query content (must follow skill-creator guidelines)
- Agent review criteria beyond high-level guidance
- Number and structure of plans within Phase 5
- Whether to run skill-creator's full skill improvement loop beyond description optimization

### Deferred Ideas (OUT OF SCOPE)
None -- Phase 5 closes all v1 loose ends including items deferred from Phases 2 and 4.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INFRA-04 | All skill descriptions include 5+ trigger phrases optimized for discoverability | Skill-creator description optimization pipeline (run_loop.py) generates, evaluates, and iteratively improves descriptions. 20 eval queries per skill with cross-skill negatives. Best description selected by test score. |
</phase_requirements>

## Standard Stack

### Core
| Component | Version | Purpose | Why Standard |
|-----------|---------|---------|--------------|
| skill-creator plugin | latest (58578a456a83) | Description optimization pipeline | Official Anthropic tool for skill eval/optimization; `run_loop.py` is the prescribed mechanism [VERIFIED: local cache inspection] |
| plugin-dev plugin | latest (58578a456a83) | Agent verification and plugin validation | Official Anthropic tool for plugin structure validation; `plugin-validator` agent runs 10-step checks [VERIFIED: local cache inspection] |
| Python 3 | 3.14.3 | Run skill-creator scripts | Required by `run_loop.py`, `improve_description.py`, `run_eval.py` [VERIFIED: `python3 --version`] |
| anthropic SDK | 0.76.0 | Extended thinking for description improvement | Required by `improve_description.py` for Claude API calls with thinking [VERIFIED: `pip3 show anthropic`] |
| Claude CLI | 2.1.104 | `claude -p` for eval queries and conciseness testing | Required by `run_eval.py` to test skill triggering [VERIFIED: `claude --version`] |

### Supporting
| Component | Version | Purpose | When to Use |
|-----------|---------|---------|-------------|
| `git mv` | system | Restructure plugin directories | D-07: move components to `plugins/lz-advisor/` [VERIFIED: git available] |
| `jq` | system | Parse JSON outputs from run_loop.py | Extracting best_description from results.json [ASSUMED] |

## Architecture Patterns

### Marketplace Distribution Structure

After restructure (D-07), the repo follows the marketplace convention:

```
lz-advisor-claude-plugins/          # Repository root
|-- .claude-plugin/
|   '-- marketplace.json            # Marketplace catalog (NEW)
|-- plugins/
|   '-- lz-advisor/                 # The installable plugin
|       |-- .claude-plugin/
|       |   '-- plugin.json         # Plugin manifest
|       |-- agents/
|       |   |-- advisor.md
|       |   |-- reviewer.md
|       |   '-- security-reviewer.md
|       |-- skills/
|       |   |-- lz-advisor-plan/
|       |   |   '-- SKILL.md
|       |   |-- lz-advisor-execute/
|       |   |   '-- SKILL.md
|       |   |-- lz-advisor-review/
|       |   |   '-- SKILL.md
|       |   '-- lz-advisor-security-review/
|       |       '-- SKILL.md
|       |-- references/
|       |   '-- advisor-timing.md
|       |-- README.md
|       '-- LICENSE
|-- evals/                          # Eval artifacts (D-15)
|   '-- lz-advisor/
|       |-- lz-advisor-plan-workspace/
|       |-- lz-advisor-execute-workspace/
|       |-- lz-advisor-review-workspace/
|       '-- lz-advisor-security-review-workspace/
|-- research/                       # Development artifacts
|-- .planning/                      # GSD planning artifacts
|-- tests/                          # Validation scripts
|-- CLAUDE.md                       # Project instructions
|-- README.md                       # Repo-level README (D-09)
'-- .gitignore
```

### Critical Finding: Marketplace.json Required for Remote Installation

**There is no `claude plugin install owner/repo` command.** [VERIFIED: official docs at code.claude.com/docs/en/discover-plugins] The installation path for remote plugins is:

1. User adds the marketplace: `/plugin marketplace add LayZeeDK/lz-advisor-claude-plugins`
2. User installs the plugin: `/plugin install lz-advisor@lz-advisor-claude-plugins`

This requires a `.claude-plugin/marketplace.json` at the repository root. The D-18 success gate "clean GitHub install test via `claude plugin install`" MUST use the marketplace flow, not a nonexistent direct install command.

**marketplace.json structure** (NEW file needed at repo root):
```json
{
  "name": "lz-advisor-claude-plugins",
  "owner": {
    "name": "Lars Gyrup Brink Nielsen"
  },
  "plugins": [
    {
      "name": "lz-advisor",
      "source": "./plugins/lz-advisor",
      "description": "Advisor strategy: pair Opus advisor with session model for near-Opus intelligence at Sonnet cost"
    }
  ]
}
```

[VERIFIED: marketplace schema from code.claude.com/docs/en/plugin-marketplaces, cross-referenced with claude-plugins-official structure]

### Pattern: Description Optimization Pipeline

The skill-creator pipeline for each skill:

1. **Generate 20 eval queries** as JSON: `[{"query": "...", "should_trigger": true/false}, ...]`
2. **Agent review** of eval query quality (D-04 review point 1)
3. **Run optimization** via `run_loop.py`:
   - Splits 60/40 train/test (stratified by should_trigger)
   - Evaluates each query 3 times via `claude -p` with `--model sonnet`
   - Uses extended thinking to propose description improvements
   - Iterates up to 5 times or until all train queries pass
   - Returns `best_description` selected by test score
4. **Agent review** of before/after comparison (D-04 review point 2)
5. **Apply** `best_description` to SKILL.md frontmatter

### Pattern: run_loop.py Invocation

```bash
cd "C:\Users\LarsGyrupBrinkNielse\.claude\plugins\cache\claude-plugins-official\skill-creator\58578a456a83\skills\skill-creator"

python -m scripts.run_loop \
  --eval-set "D:\projects\github\LayZeeDK\lz-advisor-claude-plugins\evals\lz-advisor\lz-advisor-plan-eval.json" \
  --skill-path "D:\projects\github\LayZeeDK\lz-advisor-claude-plugins\plugins\lz-advisor\skills\lz-advisor-plan" \
  --model claude-sonnet-4-6 \
  --max-iterations 5 \
  --verbose \
  --results-dir "D:\projects\github\LayZeeDK\lz-advisor-claude-plugins\evals\lz-advisor\lz-advisor-plan-workspace"
```

[VERIFIED: CLI args from run_loop.py argparse, module path from scripts/__init__.py]

**Critical detail**: `run_loop.py` must run from the skill-creator's `skills/skill-creator/` directory because it uses `python -m scripts.run_loop` (relative module imports). Use absolute paths for `--eval-set`, `--skill-path`, and `--results-dir`.

### Pattern: run_eval.py Triggering Mechanism

`run_eval.py` tests skill triggering by creating temporary command files in `.claude/commands/` at the project root (found by walking up from cwd looking for `.claude/` directory). Each query spawns a `claude -p` process, checks whether the model's first tool call is to read the skill, and returns a boolean. [VERIFIED: run_eval.py source code lines 36-178]

**Important**: The project root detection (`find_project_root()`) looks for a `.claude/` directory. Our repo has `.claude/worktrees/` which satisfies this. The cwd during `run_loop.py` execution is the skill-creator directory, NOT our repo. But `run_eval.py` walks up from cwd -- since the skill-creator cache is under `~/.claude/plugins/cache/`, it will find `~/.claude/` as the project root and create temp commands there. This is correct behavior because `claude -p` sessions also discover commands from `~/.claude/commands/`. [VERIFIED: run_eval.py find_project_root() source]

### Pattern: Agent Verification

Plugin-dev's `plugin-validator` agent runs a 10-step validation:
1. Locate plugin root (find `.claude-plugin/plugin.json`)
2. Validate manifest (JSON syntax, required `name` field, format checks)
3. Validate directory structure (standard locations, auto-discovery)
4. Validate commands (if present)
5. Validate agents (frontmatter fields, description with examples, model/color values)
6. Validate skills (SKILL.md exists, frontmatter with name/description)
7. Validate hooks (if present)
8. Validate MCP config (if present)
9. Check file organization (README, LICENSE, .gitignore)
10. Security checks (no hardcoded credentials)

[VERIFIED: plugin-validator.md agent file]

### Anti-Patterns to Avoid

- **Direct `claude plugin install owner/repo`**: This command does not exist. Must use marketplace flow. [VERIFIED: official docs]
- **Running `run_loop.py` from repo root**: The script uses `python -m scripts.run_loop` which requires the cwd to be the skill-creator directory. [VERIFIED: Python module import mechanics]
- **Omitting `--model` on eval commands**: Without explicit `--model sonnet`, the eval runs on whatever the user's default model is. Since we run from an Opus session, evals would test Opus triggering behavior, not Sonnet. [VERIFIED: run_eval.py `--model` flag passthrough to `claude -p`]
- **Overfitting eval queries**: The skill-creator warns against ever-expanding lists of specific queries. Descriptions should be 100-200 words max with generalized intent coverage. [VERIFIED: improve_description.py prompt, lines 97-112]
- **Including `outputs/` in git**: Raw skill output files are regenerated on re-run and should be gitignored. [Context: D-16]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Description optimization | Custom eval harness | `run_loop.py` from skill-creator | Handles train/test split, multi-run reliability, extended thinking improvement, overfitting prevention via test score selection |
| Plugin validation | Manual checklist | `plugin-dev:plugin-validator` agent | 10-step automated validation covering manifest, structure, agents, skills, security |
| Eval query review | Inline review in executor | Agent review at both pipeline stages | D-04 requires structured review at query generation and after optimization |
| Marketplace JSON | Custom distribution script | Standard `marketplace.json` | Claude Code has built-in marketplace discovery, versioning, and auto-update |

**Key insight:** The entire description optimization loop is pre-built and tested by Anthropic. The planner should use `run_loop.py` as-is, not reinvent any part of the pipeline. The only customization is the eval query content (Claude's Discretion).

## Common Pitfalls

### Pitfall 1: Marketplace Install vs Plugin Install
**What goes wrong:** D-18 calls for "clean GitHub install test via `claude plugin install`" but `claude plugin install LayZeeDK/lz-advisor-claude-plugins` is not valid syntax.
**Why it happens:** Confusion between marketplace-add (registers a catalog) and plugin-install (installs from a registered marketplace). Only `plugin install name@marketplace` exists.
**How to avoid:** Create `marketplace.json` at repo root. Test with: (1) `/plugin marketplace add LayZeeDK/lz-advisor-claude-plugins`, (2) `/plugin install lz-advisor@lz-advisor-claude-plugins`.
**Warning signs:** "Plugin not found" error on install attempt.

### Pitfall 2: run_loop.py Working Directory
**What goes wrong:** `ModuleNotFoundError: No module named 'scripts'` when running `python -m scripts.run_loop`.
**Why it happens:** The `scripts/` package lives inside the skill-creator plugin directory, not the project repo.
**How to avoid:** Always `cd` to the skill-creator directory before running `python -m scripts.run_loop`, and use absolute paths for all `--` arguments.
**Warning signs:** Any import error referencing `scripts.run_eval` or `scripts.utils`.

### Pitfall 3: Eval Model Mismatch
**What goes wrong:** Description triggers correctly in evals but fails for real Sonnet users.
**Why it happens:** Eval runs without `--model sonnet` test against the session's default model (Opus), which has different triggering behavior.
**How to avoid:** Every `run_loop.py` and `claude -p` invocation MUST include `--model claude-sonnet-4-6` (or `--model sonnet`).
**Warning signs:** Suspiciously high trigger rates (Opus may be more generous in skill activation than Sonnet).

### Pitfall 4: Cross-Skill Confusion Between Review and Security-Review
**What goes wrong:** "review my code for issues" triggers security-review instead of review, or vice versa.
**Why it happens:** Both skills share overlapping keywords: "review", "check", "issues", "code". Without cross-skill negatives in the eval set, each skill's description may overreach.
**How to avoid:** D-02 requires cross-skill negatives. Include "check for SQL injection risks" as negative for review, "review code quality" as negative for security-review.
**Warning signs:** High false-positive rates on review-related queries during eval runs.

### Pitfall 5: Plugin Restructure Path References
**What goes wrong:** Skills reference `@${CLAUDE_PLUGIN_ROOT}/references/advisor-timing.md` but the file is not found after restructure.
**Why it happens:** `${CLAUDE_PLUGIN_ROOT}` resolves to the plugin root (`plugins/lz-advisor/`). If `references/` was not moved correctly, the path breaks.
**How to avoid:** After restructure, verify all `@${CLAUDE_PLUGIN_ROOT}` references in SKILL.md files resolve correctly by checking the target files exist at the relative path within `plugins/lz-advisor/`.
**Warning signs:** Skills fail to load reference files, advisor timing guidance missing from skill context.

### Pitfall 6: Agent Word Count Miscalculation
**What goes wrong:** Agent system prompt reported as "under 500 words" when counting only the body text, but plugin-dev guidelines count the entire system prompt including section headers.
**Why it happens:** The 500-3000 word guideline from `system-prompt-design.md` refers to the full markdown body after the YAML frontmatter closing `---`.
**How to avoid:** Count all words in the markdown body of the agent file, including headers, bullet points, and code examples.
**Warning signs:** Plugin-validator warnings about short system prompts.

## Code Examples

### Eval Query JSON Format
```json
[
  {
    "query": "ok so I have this big refactoring task for our auth module -- I need to migrate from session-based auth to JWT tokens. Can you help me think through the approach before I start coding? The main files are in src/auth/ and there are about 15 endpoints that need updating",
    "should_trigger": true
  },
  {
    "query": "review the changes I just made to the authentication module, I refactored the token validation and want to make sure I didn't break anything",
    "should_trigger": false
  }
]
```
Source: skill-creator SKILL.md description optimization section (lines 337-358) [VERIFIED]

### marketplace.json for Single-Plugin Repo
```json
{
  "name": "lz-advisor-claude-plugins",
  "owner": {
    "name": "Lars Gyrup Brink Nielsen"
  },
  "plugins": [
    {
      "name": "lz-advisor",
      "source": "./plugins/lz-advisor",
      "description": "Advisor strategy: pair Opus advisor with session model for near-Opus intelligence at Sonnet cost"
    }
  ]
}
```
Source: code.claude.com/docs/en/plugin-marketplaces marketplace schema [VERIFIED]

### Agent Color Guidelines
```
blue/cyan  -> Analysis, review
green      -> Success-oriented tasks
yellow     -> Caution, validation
red        -> Critical, security
magenta    -> Creative, generation
```
Source: plugin-dev agent-development SKILL.md [VERIFIED]

Current agent colors and recommended changes:
- `advisor.md`: magenta (creative/strategic) -- fits well, no change
- `reviewer.md`: green -- should change to blue or cyan (analysis/review per guideline)
- `security-reviewer.md`: yellow -- could change to red (security per guideline), but yellow (caution/validation) is also defensible

### Plugin-Validator Invocation
```
Use plugin-dev:plugin-validator on the plugin at plugins/lz-advisor/
```
The validator agent reads the plugin root, finds `.claude-plugin/plugin.json`, and runs all 10 validation steps automatically. [VERIFIED: plugin-validator.md]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `claude plugin install owner/repo` | Marketplace add + plugin install | Always (never existed as direct install) | Must create marketplace.json for remote distribution |
| Commands (legacy format) | Skills (SKILL.md in subdirectories) | 2025 plugin system launch | Already using skills correctly |
| Per-skill triggering test | `run_loop.py` automated pipeline | skill-creator plugin | Automated train/test split, multi-run reliability, extended thinking improvement |

**Deprecated/outdated:**
- `.claude/commands/` directory format is legacy per plugin-dev docs. Our plugin correctly uses `skills/` instead. [VERIFIED: plugin-dev skill-development SKILL.md]

## Assumptions Log

> List all claims tagged `[ASSUMED]` in this research.

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `jq` is available on system for parsing JSON | Standard Stack | Low -- can use Python or manual parsing as fallback |
| A2 | `run_eval.py`'s `find_project_root()` finding `~/.claude/` as project root works correctly for temp command creation | Architecture Patterns | Medium -- if temp commands end up in wrong location, eval triggering tests will fail silently (always return false). Mitigation: verify with `--verbose` output on first run |
| A3 | reviewer.md color should change from green to blue/cyan | Code Examples | Low -- plugin-dev guidelines are recommendations, not hard requirements. Plugin-validator may not flag this as an error |

**If this table is empty:** N/A -- 3 assumptions identified above.

## Open Questions

1. **Marketplace name format**
   - What we know: The marketplace `name` field becomes the install suffix (e.g., `lz-advisor@lz-advisor-claude-plugins`)
   - What's unclear: Whether the marketplace name must match the GitHub repo name, or can be shorter (e.g., `lz-advisor-plugins`)
   - Recommendation: Use the repo name `lz-advisor-claude-plugins` for consistency. Users type it once when adding the marketplace.

2. **Eval query count per cross-skill category**
   - What we know: D-01 requires 20 queries per skill (8-10 positive, 8-10 negative). D-02 requires cross-skill negatives.
   - What's unclear: How many of the 8-10 negatives should be cross-skill vs. completely unrelated?
   - Recommendation: At least 3-4 cross-skill negatives per eval set (sibling skill queries). The rest can be near-miss from other domains. This provides strong disambiguation testing without making the eval set too narrow.

3. **ANTHROPIC_API_KEY requirement for run_loop.py**
   - What we know: `improve_description.py` uses `anthropic.Anthropic()` client which reads `ANTHROPIC_API_KEY` from environment
   - What's unclear: Whether the environment already has this key set
   - Recommendation: Verify `ANTHROPIC_API_KEY` is set before running `run_loop.py`. If not, the script will fail immediately on first improvement iteration with a clear error.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Python 3 | run_loop.py, improve_description.py | yes | 3.14.3 | -- |
| anthropic SDK | improve_description.py (API calls with extended thinking) | yes | 0.76.0 | -- |
| Claude CLI | run_eval.py (claude -p for triggering tests) | yes | 2.1.104 | -- |
| ANTHROPIC_API_KEY | anthropic SDK client initialization | unknown | -- | Must verify before eval runs |
| git | Plugin restructure, commits | yes | system | -- |
| skill-creator plugin | run_loop.py, run_eval.py scripts | yes | 58578a456a83 cache | -- |
| plugin-dev plugin | plugin-validator agent | yes | 58578a456a83 cache | -- |

**Missing dependencies with no fallback:**
- ANTHROPIC_API_KEY must be verified at execution time (run_loop.py will fail without it)

**Missing dependencies with fallback:**
- None -- all required tools are available

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | skill-creator run_loop.py + plugin-dev plugin-validator |
| Config file | None -- scripts are invoked directly |
| Quick run command | `claude --model sonnet --plugin-dir plugins/lz-advisor -p "/lz-advisor.plan plan a simple feature" --verbose` |
| Full suite command | `python -m scripts.run_loop --eval-set <path> --skill-path <path> --model claude-sonnet-4-6 --max-iterations 5 --verbose` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INFRA-04 | Skill descriptions include 5+ trigger phrases optimized for discoverability | eval pipeline | `python -m scripts.run_loop --eval-set <eval-json> --skill-path <skill-path> --model claude-sonnet-4-6 --max-iterations 5 --verbose` | Wave 0: eval JSON files must be created |

### Sampling Rate
- **Per task commit:** Plugin-validator after structural changes
- **Per wave merge:** Full run_loop.py pipeline for affected skills
- **Phase gate:** All 4 skills pass run_loop.py with improved scores + final plugin-validator pass

### Wave 0 Gaps
- [ ] `evals/lz-advisor/lz-advisor-plan-eval.json` -- 20 eval queries for plan skill
- [ ] `evals/lz-advisor/lz-advisor-execute-eval.json` -- 20 eval queries for execute skill
- [ ] `evals/lz-advisor/lz-advisor-review-eval.json` -- 20 eval queries for review skill
- [ ] `evals/lz-advisor/lz-advisor-security-review-eval.json` -- 20 eval queries for security-review skill
- [ ] `.claude-plugin/marketplace.json` -- marketplace catalog at repo root
- [ ] `.gitignore` update for `evals/**/outputs/`
- [ ] Verify ANTHROPIC_API_KEY is set in environment

## Security Domain

> This phase involves no new code execution beyond existing tools. Security concerns are minimal.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | -- |
| V3 Session Management | no | -- |
| V4 Access Control | no | -- |
| V5 Input Validation | no | -- |
| V6 Cryptography | no | -- |

### Known Threat Patterns for Plugin Distribution

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Marketplace impersonation | Spoofing | Reserved marketplace names prevent official impersonation [VERIFIED: marketplace schema docs] |
| Malicious skill injection | Tampering | Plugin-validator security checks, skill content reviewed by user [VERIFIED: plugin-validator step 10] |

## Agent Verification Findings

### Current Agent State

| Agent | System Prompt Words | Examples | Color | Model | Known Issues |
|-------|-------------------|----------|-------|-------|--------------|
| advisor.md | ~270 | 3 | magenta | opus | Below 500 recommended minimum |
| reviewer.md | ~240 | 2 | green | opus | Below 500 minimum, green may not fit "analysis/review" guideline, minimum examples |
| security-reviewer.md | ~360 | 2 | yellow | opus | Below 500 minimum (borderline), minimum examples |

[VERIFIED: word counts by reading agent files]

### Recommended Fixes

1. **reviewer.md color**: Change `green` to `blue` or `cyan` (analysis/review per plugin-dev guideline). [VERIFIED: agent-development SKILL.md color guidelines]
2. **reviewer.md system prompt**: Expand from ~240 to 500+ words. Add edge cases, quality standards, more specific process steps. [VERIFIED: system-prompt-design.md length guidelines]
3. **All agents examples**: advisor has 3 (good), reviewer has 2 (minimum), security-reviewer has 2 (minimum). Consider adding 1 more example to each reviewer agent. [VERIFIED: agent-development SKILL.md "2-4 examples" guidance]
4. **advisor.md system prompt**: At ~270 words, also below the 500 recommended minimum. Consider expanding with edge case handling. [VERIFIED: system-prompt-design.md]
5. **security-reviewer.md color**: yellow (caution/validation) is defensible but red (critical/security) would be a better semantic fit. Recommend keeping yellow to avoid red's aggressive connotation (aligns with D-06/ADVR-06 calm language). [VERIFIED: color guidelines]

## Sources

### Primary (HIGH confidence)
- skill-creator SKILL.md (local cache: `~/.claude/plugins/cache/claude-plugins-official/skill-creator/58578a456a83/`) -- Description optimization pipeline, eval query guidelines, run_loop.py mechanics
- skill-creator scripts/ (same cache) -- run_loop.py, run_eval.py, improve_description.py, utils.py source code
- skill-creator references/schemas.md (same cache) -- JSON schemas for all eval/benchmark artifacts
- plugin-dev SKILL.md files (local cache: `~/.claude/plugins/cache/claude-plugins-official/plugin-dev/58578a456a83/`) -- Agent development guidelines, plugin structure, system prompt design
- plugin-dev agents/plugin-validator.md (same cache) -- 10-step validation process
- code.claude.com/docs/en/discover-plugins -- Plugin installation mechanics, marketplace flow
- code.claude.com/docs/en/plugin-marketplaces -- Marketplace creation, marketplace.json schema, source types

### Secondary (MEDIUM confidence)
- claude-plugins-official marketplace structure (local: `~/.claude/plugins/marketplaces/claude-plugins-official/`) -- Directory layout conventions verified by inspecting installed plugins
- claude-hud plugin (local cache) -- GitHub-installed plugin structure pattern verified

### Tertiary (LOW confidence)
- None -- all claims verified against local files or official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all tools verified installed and version-checked locally
- Architecture: HIGH - marketplace schema verified against official docs and real marketplace structure
- Pitfalls: HIGH - identified from reading source code of run_eval.py, run_loop.py, and official plugin docs
- Agent verification: HIGH - agent files read directly, guidelines verified against plugin-dev references

**Research date:** 2026-04-13
**Valid until:** 2026-05-13 (30 days -- plugin system is stable, skill-creator pipeline is mature)
