# lz-advisor-execute Description Optimization Results

## Method

Used `claude -p` with `--effort low` and `--plugin-dir plugins/lz-advisor` to sample
eval queries. Adapted approach: `run_loop.py` unavailable (no ANTHROPIC_API_KEY), used
`claude -p` instead.

## Queries Tested

### Positive (should_trigger=true)

| Query | Triggered? | Result |
|-------|-----------|--------|
| "build the new user profile API endpoint..." | YES | Skill oriented on codebase (correct behavior) |
| "lz-advisor execute the database migration task..." | YES | Skill activated, oriented before acting |

### Negative (should_trigger=false)

| Query | Triggered? | Result |
|-------|-----------|--------|
| "help me plan the approach for implementing the new dashboard before I start coding" | NO | Triggered plan skill instead (correct) |
| "execute this SQL query: SELECT * FROM users WHERE active = true" | NO | No skill activation (correct) |

## Score: 4/4 (100%)

## Description Changes

### Before (52 words)
- 5 trigger phrases
- No negative markers
- No workflow description

### After (128 words)
- 10 trigger phrases (added: "start building", "implement with guidance", "build this with advisor help", "execute the plan", "code this feature")
- Explicit negative markers: NOT for planning, reviewing, security audits
- Sibling skill references: lz-advisor-plan, lz-advisor-review, lz-advisor-security-review
- Added: six-phase workflow description and plan file acceptance

## Rationale

Original description worked well in testing (4/4), but was under the recommended 100-200 word range. Enhanced with additional trigger phrases, negative markers for disambiguation, workflow description for clarity, and sibling skill references. The "execute this SQL query" negative case correctly did not trigger -- the skill distinguishes between executing code tasks and executing database queries.
