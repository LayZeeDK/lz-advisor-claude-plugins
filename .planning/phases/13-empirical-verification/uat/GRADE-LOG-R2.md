# Phase 13 Plan 05 -- Live UAT Grade Log R2 (SC-4 RE-MEASURE)

GATE-02 budget RE-MEASURE on LIVE emission AFTER the 13-04 concision fix
(commit `5085bca`, FIX-1..4). Per-run SHAPE grade (parent `.result`) + BUDGET
fixture exit (subagent emission) + parsed-findings count for every captured run.
All captures are headless `claude -p` runs against the seeded R2 ngx worktree
(`uat/phase-13-render-r2` @ seed `b8f99e1` off `019a26a`), CWD = the R2 worktree,
`--plugin-dir` = THIS repo's `plugins/lz-advisor` (the 13-04 FIXED agents).

This RE-MEASURES the over-cap baseline recorded in `GRADE-LOG.md` (4/6 over-cap:
review-2 46w; security-1 35w; security-2 31w; security-3 34w+36w).

## Provenance (SC-3)

- Worktree CWD for all runs: `/d/projects/github/LayZeeDK/ngx-smart-components-uat-13-r2`
- Plugin dir (FIXED agents from 13-04): `D:/projects/github/LayZeeDK/lz-advisor-claude-plugins/plugins/lz-advisor`
- `git worktree list` at run time:
  - `D:/projects/github/LayZeeDK/ngx-smart-components           bad1aed [main]` (live tree, untouched)
  - `D:/projects/github/LayZeeDK/ngx-smart-components-uat-13-r2 019a26a [uat/phase-13-render-r2]` (dedicated R2 UAT worktree off `lz-advisor-compodoc-storybook-uat-base` @ `019a26a`)
- CLI: claude 2.1.168, jq 1.8.1
- Subagent JSONL CWD hash: `D--projects-github-LayZeeDK-ngx-smart-components-uat-13-r2`
- Review target: `review-src/handler.ts` (reviewer); `review-src/disk-info.ts` (security)

## Grading method (unchanged from 13-02 / GRADE-LOG.md)

- SHAPE (D-03): graded from the PARENT stream `.result` (`r2-<skill>-N.report.md`).
  PASS = four grouped `### ` severity headers present AND (review) `### Cross-Cutting
  Patterns` / (security) `### Threat Patterns` present AND zero severity-shorthand
  (word-boundary anchored `\b(crit|imp|sug|q):`) AND (security) OWASP `[Axx]` preserved.
- BUDGET (D-04): `bash tests/D-*-budget.sh --from-trace r2-<skill>-N.agent.md`,
  measured on the LIVE subagent emission. PASS = exit 0 (every per-finding body
  <=28w; CVE/GHSA/CWE auto-clarity <=75w; >=5 findings parsed).
- A run "fully passes" iff SHAPE clean AND BUDGET exit 0 (AND security: `[Axx]` present).
- D-09: the unanchored `crit:|imp:|sug:|q:` grep fires a documented INNOCUOUS prose
  false positive on `q:` inside the TS identifier `req:`. Both the unanchored count
  (transparency) and the anchored verdict (authoritative) are recorded.

## Reviewer (`/lz-advisor:review`) runs -- target `review-src/handler.ts`

| Run | result event | 4 headers | Cross-Cutting | unanchored (crit:/imp:/sug:/q:) | anchored \b...: | SHAPE | BUDGET exit | findings | worst finding (w) | fully passes |
|-----|--------------|-----------|---------------|---------------------------------|-----------------|-------|-------------|----------|-------------------|--------------|
| r2-review-1 | Y | [OK] | [OK] | 1 (`q:` in `req:`, innocuous) | 0 | [OK] | 0 | 8 | 19 | YES |
| r2-review-2 | Y | [OK] | [OK] | 1 (`q:` in `req:`, innocuous) | 0 | [OK] | 0 | 5 | 17 | YES |
| r2-review-3 | Y | [OK] | [OK] | 1 (`q:` in `req:`, innocuous) | 0 | [OK] | 1 | 6 | 29 (Finding 5) | NO (BUDGET) |

### r2-review-3 BUDGET detail (residual marginal over-cap)

`bash tests/D-reviewer-budget.sh --from-trace r2-review-3.agent.md` -> exit 1, 8/9.
SHAPE clean (four headers, Cross-Cutting Patterns, zero anchored shorthand). The
single failing assertion is Finding 5: **29w > 28** (a 1-word marginal overflow).
The body bundled a multi-clause causal chain into one finding:
`data.name.trim()` derefs `name` with no guard; non-string/missing `name` throws
`TypeError` -- swallowed by `processUser` catch (line 44), so valid-vs-malformed
inputs both silently return `null`. Guard `typeof data?.name === 'string'`.

This is a CONCISION-tail residual of the same class FIX-1/FIX-3 target (a verbose
explanatory tail appended to a finding body), but at a MUCH smaller magnitude than
the pre-fix baseline (review-2 was 46w; this is 29w, 1w over). The 13-04 fix
dramatically reduced the overshoot (46w -> 29w on the worst reviewer finding) but
did not eliminate the marginal case on every run. D-10: recorded honestly; NOT
masked, NOT re-worded to pass, NOT patched inline.

Reviewer summary: c=2 fully-passing of n=3 (r2-review-1, r2-review-2 fully pass;
r2-review-3 SHAPE-clean but BUDGET exit 1 on a 29w finding). SHAPE (SC-1) holds 3/3;
BUDGET (SC-4 reviewer half) holds 2/3. Pre-fix reviewer half was also 2/3, BUT the
overshoot magnitude collapsed from 46w to 29w (a real, large concision improvement).

## Security-reviewer (`/lz-advisor:security-review`) runs -- target `review-src/disk-info.ts`

(populated below as captures complete)
