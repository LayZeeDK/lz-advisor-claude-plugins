---
status: partial
phase: 01-plugin-scaffold-and-advisor-agent
source: [01-VERIFICATION.md]
started: 2026-04-11T00:00:00Z
updated: 2026-04-11T00:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Plugin load test
expected: Run `claude --debug` with the plugin installed via `--plugin-dir` and confirm that (a) Claude Code's manifest validator accepts `plugin.json` without errors, and (b) the `agents/` directory scan discovers `lz-advisor`
result: [pending]

### 2. Agent invocation and model override
expected: Invoke `lz-advisor` via the Agent tool in a Sonnet 4.6 session and confirm that (a) `model: opus` actually spawns Opus 4.6, and (b) the response is under 100 words in enumerated step format
result: [pending]

## Summary

total: 2
passed: 0
issues: 0
pending: 2
skipped: 0
blocked: 0

## Gaps
