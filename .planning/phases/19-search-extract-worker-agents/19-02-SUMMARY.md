---
phase: 19-search-extract-worker-agents
plan: 02
subsystem: deep-research-workers
tags: [agents, least-privilege, worker-output-contract, schema, round-trip]
requires:
  - "Frozen Phase-17 schema (lz-deep-research-schema.md): claim/source/excerpt shapes + canonical-URL key + filename-safety rule"
  - "Frozen Phase-16/17 aggregator (lz-deep-research-aggregate.mjs): the consumer the producer output must round-trip through"
  - "Wave-1 (19-01) eval/lz-eval-search-loop.mjs: sourceFilename() for the real SHA-256-hex fixture basename"
provides:
  - "research-search-worker agent ([WebSearch, Write], one sub-angle, one-line receipt) -- PIPE-03"
  - "research-extract-worker agent (Sonnet [WebFetch, Write], verbatim excerpt + frozen claim/source records + URL canon + receipt) -- PIPE-04/05"
  - "worker-output-roundtrip fixture + round-trip/receipt-format tests proving the producer contract against the frozen aggregator -- AGG-03"
affects:
  - "Phase 20 orchestrator (dispatches both workers; joins sources/ for citations)"
tech-stack:
  added: []
  patterns:
    - "Least-privilege worker subagent (copied from research-verify-voter-sonnet.md template)"
    - "Producer round-trip against the frozen consumer (fx() + aggregate(fx(...)))"
    - "node:test FILE-form gate (host quirk)"
key-files:
  created:
    - plugins/lz-advisor/agents/research-search-worker.md
    - plugins/lz-advisor/agents/research-extract-worker.md
    - plugins/lz-advisor/skills/lz-deep-research/scripts/__fixtures__/worker-output-roundtrip/claims/w1.json
    - plugins/lz-advisor/skills/lz-deep-research/scripts/__fixtures__/worker-output-roundtrip/excerpts/e1.txt
    - plugins/lz-advisor/skills/lz-deep-research/scripts/__fixtures__/worker-output-roundtrip/sources/8ee1c1b9042fcf073f46b75aefd4244ac536a460ee8fc1ccba1862a273e8c72d.json
  modified:
    - plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs
decisions:
  - "Search worker color=orange, extract worker color=red (distinct from existing magenta/blue/green/cyan/yellow)"
  - "Search worker ships model=sonnet (cheap-tier default; the Haiku variant is what the Plan-04 offline read tests, per D-02/D-10) -- no separate Haiku file authored here"
  - "Fixture source URL https://example.org/a/study -> real SHA-256-hex filename 8ee1c1b9...c72d.json computed via the Wave-1 sourceFilename()"
metrics:
  duration: "~30 min"
  completed: "2026-06-16"
  tasks: 3
  files: 6
requirements: [PIPE-03, PIPE-04, PIPE-05, AGG-03]
---

# Phase 19 Plan 02: Search + extract worker agents Summary

Authored the two Phase-19 deep-research worker subagents (least-privilege search
+ extract) and proved their output contract end-to-end against the FROZEN
aggregator via a committed worker-output round-trip fixture and a receipt-format
assertion -- closing PIPE-03/04/05 + AGG-03 against the real consumer, not a mock.

## What Was Built

1. **research-search-worker.md (PIPE-03, AGG-03)** -- a least-privilege
   `[WebSearch, Write]` subagent (model sonnet ship default, color orange, effort
   medium, maxTurns 4). Third-person description with `<example>` blocks ending
   "not intended for direct user invocation". Body declares the minimum grant +
   why, applies the shared search-and-stop PROTOCOL (disconfirming query,
   mechanical search minimums, source-independence weighting), writes source
   candidates to `sources/<sha>.json`, and returns a one-line counts-only receipt
   (D-14). Schema referenced via `${CLAUDE_PLUGIN_ROOT}`, never inlined.

2. **research-extract-worker.md (PIPE-04, PIPE-05, AGG-03)** -- a fixed-Sonnet
   `[WebFetch, Write]` subagent (color red, effort medium, maxTurns 4). Body
   specifies, copying field names byte-for-byte from the schema: (1) WebFetch the
   source + store the returned content VERBATIM at fetch time as
   `excerpts/<excerpt-id>.txt` (plain UTF-8, CRLF/LF/BOM tolerated, ~50KB cap,
   D-04/D-15); (2) extract falsifiable claims to `claims/<worker-id>.json`
   `{worker, source, claims:[{id, text, quote, excerpt_id}]}` with all fail-closed
   fields (source WR-03, id AGG-1, text WR-02, quote WR-01); (3) canonicalize the
   URL to the source key (D-13: lowercase scheme+host, strip default ports +
   tracking denylist + utm_* + fragment + trailing slash) used identically in
   `claims[].source` AND the `sources/<sha-256-hex>.json` `id`, the filename being
   the SHA-256 hex; (4) return a one-line counts-only receipt (D-14).

3. **worker-output-roundtrip fixture + tests (PIPE-04/05, AGG-03)** -- a run dir
   shaped exactly as the extract worker emits (`claims/w1.json`, `excerpts/e1.txt`,
   `sources/<real-sha-256-hex>.json`), plus two new tests in the existing
   aggregator suite: a round-trip test asserting `aggregate(...)` drops zero
   claims, yields a `quote_fidelity === 'verified'` survivor, and that
   `claims[].source === sources record id` with the filename equal to the real
   `sourceFilename()` hex (T-19-08 spoofing guard); and a receipt-format
   assertion proving a sample receipt is one line, <= 200 chars, counts-only, and
   carries no raw quote text (T-19-06).

## Verification Results

- Task 1 frontmatter gate: PASS (`[WebSearch, Write]` present, no WebFetch/Read/Bash, non-user-invoked close, `${CLAUDE_PLUGIN_ROOT}`).
- Task 2 frontmatter gate: PASS (`[WebFetch, Write]` + model sonnet present, no WebSearch/Read/Bash, schema field tokens `excerpt_id`/`quote`, `${CLAUDE_PLUGIN_ROOT}`).
- Task 3 test gate: `node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs` -> 41 tests, 41 pass, 0 fail (FILE-form per host quirk).
- Frozen aggregator source `lz-deep-research-aggregate.mjs` unchanged.
- Packaging boundary: no `package.json`/`node_modules` under `plugins/lz-advisor/`.
- Committed fixture + agent + test bytes are strictly ASCII.

## Threat Model Coverage

- T-19-05 (Elevation of Privilege): mitigated -- both workers declare least-privilege grants; the over-privilege-negation `git grep` gates confirm no Read/Bash/cross-tool grant.
- T-19-06 (Information Disclosure): mitigated -- the receipt-format assertion proves the one-line receipt carries counts only, no raw source text.
- T-19-07 (Tampering, filename): mitigated -- the fixture uses the real SHA-256-hex filename (no path separators); the extract worker body fixes the SHA-256-filename rule.
- T-19-08 (Spoofing, source-key identity): mitigated -- the round-trip test asserts `claims[].source === sources record id`.
- T-19-SC (Tampering, installs): n/a -- no new packages; agents are Markdown.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] search-worker description line-wrap broke the `not intended for direct user invocation` literal gate**
- **Found during:** Task 1
- **Issue:** The initial wrap placed "direct" and "user invocation" on separate lines, so the verification's `git grep -F 'not intended for direct user invocation'` (a per-line match) returned no hit.
- **Fix:** Re-flowed the description so the full phrase sits on one line.
- **Files modified:** plugins/lz-advisor/agents/research-search-worker.md
- **Commit:** c63e8b0

**2. [Rule 3 - Blocking] missing `node:crypto` import in the test file**
- **Found during:** Task 3
- **Issue:** The new round-trip test uses `createHash` to assert the source filename is the real SHA-256 hex, but the test file did not import `node:crypto`.
- **Fix:** Added `import { createHash } from 'node:crypto';` next to the existing imports.
- **Files modified:** plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs
- **Commit:** b9aab24

### Plan-text note (not a deviation)

The plan's `files_modified` listed the source fixture as `sources/SOURCEHASH.json` (a
placeholder). The actual committed basename is the real SHA-256 hex
`8ee1c1b9042fcf073f46b75aefd4244ac536a460ee8fc1ccba1862a273e8c72d.json` computed via the
Wave-1 `sourceFilename('https://example.org/a/study')` -- which the plan's Task-3 action and
host notes explicitly require.

## Known Stubs

None. Both agents are complete worker definitions; the fixture + tests exercise the real
frozen aggregator.

## Commits

- c63e8b0: feat(19-02): add research-search-worker agent (PIPE-03, AGG-03)
- afd14ea: feat(19-02): add research-extract-worker agent (PIPE-04, PIPE-05, AGG-03)
- b9aab24: test(19-02): worker-output round-trip + receipt-format against frozen aggregator (PIPE-04/05, AGG-03)

## Self-Check: PASSED

- FOUND: plugins/lz-advisor/agents/research-search-worker.md
- FOUND: plugins/lz-advisor/agents/research-extract-worker.md
- FOUND: plugins/lz-advisor/skills/lz-deep-research/scripts/__fixtures__/worker-output-roundtrip/claims/w1.json
- FOUND: plugins/lz-advisor/skills/lz-deep-research/scripts/__fixtures__/worker-output-roundtrip/excerpts/e1.txt
- FOUND: plugins/lz-advisor/skills/lz-deep-research/scripts/__fixtures__/worker-output-roundtrip/sources/8ee1c1b9042fcf073f46b75aefd4244ac536a460ee8fc1ccba1862a273e8c72d.json
- FOUND commit: c63e8b0
- FOUND commit: afd14ea
- FOUND commit: b9aab24
