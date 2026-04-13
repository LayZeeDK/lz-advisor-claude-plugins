# lz-advisor-review Description Optimization Results

## Method

Used `claude -p` with `--effort low` and `--plugin-dir plugins/lz-advisor` to sample
eval queries. Adapted approach: `run_loop.py` unavailable (no ANTHROPIC_API_KEY), used
`claude -p` instead.

## Queries Tested

### Positive (should_trigger=true)

| Query | Triggered? | Result |
|-------|-----------|--------|
| "check my changes for issues -- I modified the database query builder..." | YES | Correctly identified review context |
| "review this code for bugs and edge cases" | YES | Triggered review skill, invoked reviewer agent |

### Negative (should_trigger=false)

| Query | Triggered? | Result |
|-------|-----------|--------|
| "review this restaurant -- looking for good Italian food nearby" | NO | Correctly rejected as non-code |
| "explain how JWT authentication works" | NO | No skill activation (correct) |

## Score: 4/4 (100%)

## Description Changes

### Before (59 words)
- 6 trigger phrases
- No negative markers
- No severity classification mention

### After (128 words)
- 10 trigger phrases (added: "look over my code", "find bugs in", "review my recent commits", "check for correctness")
- Explicit negative markers: NOT for security reviews, vulnerability audits, threat modeling
- Sibling skill references: lz-advisor-security-review, lz-advisor-plan, lz-advisor-execute
- Added: severity classification (Critical, Important, Suggestion)

## Rationale

Original description worked well in testing (4/4), but was under the recommended 100-200 word range. Key improvement is the explicit disambiguation from security-review -- the review/security-review boundary is the most likely source of confusion since both involve "reviewing code". The negative markers make clear that security-focused requests go to lz-advisor-security-review while general code quality goes here.
