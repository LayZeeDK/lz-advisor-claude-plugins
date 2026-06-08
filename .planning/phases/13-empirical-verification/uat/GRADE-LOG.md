# Phase 13 Plan 02 -- Live UAT Grade Log

GATE-02 empirical verification: per-run SHAPE grade (parent `.result`) + BUDGET
fixture exit (subagent emission) + parsed-findings count for every captured run.
All captures are headless `claude -p` runs against the seeded ngx worktree.

## Provenance (SC-3)

- Worktree CWD for all runs: `/d/projects/github/LayZeeDK/ngx-smart-components-uat-13`
- Plugin dir: `D:/projects/github/LayZeeDK/lz-advisor-claude-plugins/plugins/lz-advisor`
- `git worktree list` at run time:
  - `D:/projects/github/LayZeeDK/ngx-smart-components        bad1aed [main]` (live tree, untouched)
  - `D:/projects/github/LayZeeDK/ngx-smart-components-uat-13 4fa7fd7 [uat/phase-13-render]` (dedicated UAT worktree off `lz-advisor-compodoc-storybook-uat-base` @ `019a26a`)
- CLI: claude 2.1.168, jq 1.8.1
- Review target: `review-src/handler.ts` (reviewer); `review-src/disk-info.ts` (security)

## Grading method

- SHAPE (D-03): graded from the PARENT stream `.result` (`review-N.report.md` /
  `security-N.report.md`). PASS = `### Critical` present AND (review)
  `### Cross-Cutting Patterns` / (security) `### Threat Patterns` present AND zero
  severity-shorthand tokens AND (security) OWASP `[Axx]` preserved.
- BUDGET (D-04): `bash tests/D-*-budget.sh --from-trace <skill>-N.agent.md`,
  measured on the LIVE subagent emission (`<skill>-N.agent.md`). PASS = exit 0.
- A run "fully passes" iff SHAPE clean AND BUDGET exit 0 (AND security: `[Axx]` present).

### Shorthand-token grep: word-boundary disposition (D-09 / RESEARCH `q:` note)

The plan's literal SHAPE check `! rg -q 'crit:|imp:|sug:|q:'` is UNANCHORED and
fires a documented PROSE FALSE POSITIVE: the `q:` substring matches inside the
TypeScript identifier `req:` (e.g. `req: RawRequest`). 13-RESEARCH.md Q4 and
13-CONTEXT.md D-09 anticipate exactly this: "`q:` is the riskiest token... matches
ordinary prose" and is "matched with word-boundary care to avoid false hits."

DISPOSITION: the substantive SHAPE assertion is "zero SEVERITY-SHORTHAND tokens."
A severity shorthand is a standalone lexical token, so the correct test is the
word-boundary-anchored `\b(crit|imp|sug|q):`. This:
- excludes `req:` / `seq:` etc. (no word boundary between `re` and `q`) -- false
  positive removed;
- still catches a standalone `q:` / `crit:` severity label -- real residue caught.

Both the unanchored count (for transparency) and the anchored verdict are recorded
per run below. The anchored result is the authoritative SHAPE verdict. This is a
NOTED INNOCUOUS prose false positive (D-09 disposition: "document as innocuous,
leave unchanged"), NOT a substantive grammar failure. No agent contract is changed.

## Reviewer (`/lz-advisor:review`) runs

Target: `review-src/handler.ts`

| Run | result event | `### Critical` | `### Cross-Cutting Patterns` | shorthand (unanchored crit:/imp:/sug:/q:) | severity-shorthand (anchored \b...:) | SHAPE | BUDGET exit | findings parsed | fully passes |
|-----|--------------|----------------|------------------------------|-------------------------------------------|--------------------------------------|-------|-------------|-----------------|--------------|
| review-1 | Y | [OK] | [OK] | 1 (`q:` inside `req:`, innocuous prose) | 0 | [OK] | 0 | 6 | YES |
| review-2 | Y | [OK] | [OK] | 0 | 0 | [OK] | 1 | 6 | NO (BUDGET) |

### review-2 BUDGET failure detail (SC-4 live over-cap)

`bash tests/D-reviewer-budget.sh --from-trace review-2.agent.md` -> exit 1, 8/9.
SHAPE is clean (all four spelled-out headers, `(none)`, `### Cross-Cutting Patterns`,
zero shorthand). The single failing assertion is the per-finding word budget on
Finding 1: 46 > 28. The agent bundled an inline `Severity: Critical (executor said
Important; ...)` severity-reassignment justification INTO the finding body, inflating
the counted span from ~18w (run 1's equivalent) to 46w.

DISPOSITION (D-10): this is a SUBSTANTIVE BUDGET result on LIVE emission -- exactly
what SC-4 is designed to detect ("measured, not reasoned; burned 3x assuming
budget-neutrality"). The grouped GRAMMAR reaches the rendered report fine (SC-1
holds for this run); the per-finding budget DOES NOT hold. Recorded as a FAILED
budget run (not fully passing). It is NOT patched inline (verify phase observes).
Root pattern: the per-finding cap is exceeded when the agent appends a verbose
severity-divergence rationale to a finding body rather than keeping it terse.

| review-3 | Y | [OK] | [OK] | 1 (`q:` inside `req:`, innocuous prose) | 0 | [OK] | 0 | 7 | YES |

Reviewer summary: c=2 fully-passing of n=3 runs (review-1, review-3 fully pass;
review-2 SHAPE-clean but BUDGET exit 1 on a 46w Finding-1 over-cap). SHAPE (SC-1)
holds 3/3; BUDGET (SC-4 reviewer half) holds 2/3.

## Security-reviewer (`/lz-advisor:security-review`) runs

Target: `review-src/disk-info.ts`

| Run | result event | `### Critical` | `### Threat Patterns` | OWASP `[Axx]` | shorthand (unanchored) | severity-shorthand (anchored) | SHAPE | BUDGET exit | findings parsed | fully passes |
|-----|--------------|----------------|-----------------------|---------------|------------------------|-------------------------------|-------|-------------|-----------------|--------------|
