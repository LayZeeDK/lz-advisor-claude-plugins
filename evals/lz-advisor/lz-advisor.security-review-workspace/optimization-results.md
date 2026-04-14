# lz-advisor-security-review Description Optimization Results

## Method

Used `claude -p` with `--effort low` and `--plugin-dir plugins/lz-advisor` to sample
eval queries. Adapted approach: `run_loop.py` unavailable (no ANTHROPIC_API_KEY), used
`claude -p` instead.

## Queries Tested

### Positive (should_trigger=true)

| Query | Triggered? | Result |
|-------|-----------|--------|
| "check for SQL injection risks in src/db/query-builder.ts..." | YES | Correctly identified security review context |
| "audit the authentication module for security vulnerabilities" | YES | Correctly identified security audit context |

### Negative (should_trigger=false)

| Query | Triggered? | Result |
|-------|-----------|--------|
| "what security best practices should I follow for a Node.js app?" | NO | Correctly treated as general question |
| "review this code for bugs and edge cases" | NO | Triggered review skill instead (correct disambiguation) |

## Score: 4/4 (100%)

## Description Changes

### Before (55 words)
- 7 trigger phrases
- No negative markers
- No severity/OWASP mention

### After (130 words)
- 11 trigger phrases (added: "find vulnerabilities in", "security scan", "check for SQL injection", "audit for security")
- Explicit negative markers: NOT for general code quality reviews, bug finding, style issues
- Sibling skill references: lz-advisor-review, lz-advisor-plan, lz-advisor-execute
- Added: severity classification (Critical, High, Medium) and OWASP Top 10 mention

## Rationale

Original description worked well in testing (4/4), but was under the recommended 100-200 word range. Key improvement is the explicit disambiguation from review -- "general code quality reviews, bug finding, or style issues" go to lz-advisor-review, while security-focused analysis stays here. Added OWASP and severity classification references to make the security focus unambiguous in the description itself.
