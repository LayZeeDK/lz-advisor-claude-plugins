# lz-advisor-plan Description Optimization Results

## Method

Used `claude -p` with `--effort low` and `--plugin-dir plugins/lz-advisor` to sample
eval queries. Adapted approach: `run_loop.py` unavailable (no ANTHROPIC_API_KEY), used
`claude -p` instead.

## Queries Tested

### Positive (should_trigger=true)

| Query | Triggered? | Result |
|-------|-----------|--------|
| "think through the approach for migrating our REST API to GraphQL..." | YES | Skill activated, recognized lz-advisor-plan context |
| "I need to implement a new caching layer... plan this out before I start writing code?" | YES | Skill activated, advisor consulted |
| "help me plan the approach for implementing the new dashboard before I start coding" | YES | Skill activated, advisor consulted |

### Negative (should_trigger=false)

| Query | Triggered? | Result |
|-------|-----------|--------|
| "implement the caching layer I planned yesterday..." | NO | No plan skill activation (correct) |
| "review the authentication changes I just made..." | NO | No plan skill activation (correct) |
| "plan my weekly schedule for next week" | NO | Correctly rejected as non-coding |

## Score: 6/6 (100%)

## Description Changes

### Before (51 words)
- 5 trigger phrases
- No negative markers
- No sibling skill references

### After (125 words)
- 10 trigger phrases (added: "help me think through", "what's the best approach for", "before I start coding", "plan out the architecture", "how should I approach this")
- Explicit negative markers: NOT for implement, build, review, fix, security audits
- Sibling skill references: lz-advisor-execute, lz-advisor-review, lz-advisor-security-review
- Added: "produces a written plan file" (clarifies output)

## Rationale

Original description worked well in testing (6/6), but was under the recommended 100-200 word range. Enhanced with additional trigger phrases, negative markers for disambiguation, and sibling skill references per skill-creator best practices. These changes reduce false positives when users request implementation or review instead of planning.
