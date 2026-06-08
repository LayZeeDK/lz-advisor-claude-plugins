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

### ESCALATION to n=5 (operational guidance: residual + headroom)

After the n=3 floor showed reviewer 2/3 and security 2/3 (combined c=4/6, a
residual over-cap on both skills), the session pool had clear headroom (all 6 runs
returned a clean `result` event with no 429/out_of_credits), so the captures were
ESCALATED to n=5 per skill to get a fuller statistical picture of the residual.

| Run | result event | 4 headers | Cross-Cutting | anchored \b...: | SHAPE | BUDGET exit | findings | worst finding (w) | fully passes |
|-----|--------------|-----------|---------------|-----------------|-------|-------------|----------|-------------------|--------------|
| r2-review-4 | Y | [OK] | [OK] | 0 | [OK] | 1 | (parsed) | 45 (Question) | NO (BUDGET) |
| r2-review-5 | Y | [OK] | [OK] | 0 | [OK] | 0 | 6 | (all <=28) | YES |

### r2-review-4 BUDGET detail (residual -- multi-clause Question, reviewer has no carve-out)

`--from-trace r2-review-4.agent.md` -> exit 1, 9/10. SHAPE clean. The single
failing finding is a 45w **multi-clause Question** body (a post-parse type-mismatch
question: "`processAdmin` receives the parsed `payload` typed `RawRequest`, but the
parse output is arbitrary JSON ... Is `RawRequest` the wrong type ... or is the
parse-vs-wire-object distinction intentional? The annotation ... claims the
post-parse object has `body`/`headers`, which it does not.").

This is the FIX-4 class (bracket-less multi-clause Question), but it landed in the
REVIEWER, whose grammar has NO 75w auto-clarity carve-out (the carve-out is
security-only, gated on `[CVE]`/`[GHSA]`/`[CWE]`). 13-04's FIX-4 corrected the
SECURITY agent's Question concision but the REVIEWER agent's Questions can still
overshoot the 28w cap with no sanctioned escape. RECORDED HONESTLY (D-10).

**Reviewer summary (n=5): c=3 fully-passing.** r2-review-1/2/5 fully pass;
r2-review-3 (29w deref-chain finding) + r2-review-4 (45w Question) BUDGET exit 1.
SHAPE (SC-1) holds 5/5; BUDGET (SC-4 reviewer half) holds 3/5. Worst finding-body
overshoot collapsed from the pre-fix 46w to 29w; the remaining reviewer over-caps
are (a) a marginal 1w deref-chain finding and (b) a multi-clause Question with no
carve-out.

## Security-reviewer (`/lz-advisor:security-review`) runs -- target `review-src/disk-info.ts`

| Run | result event | 4 headers | Threat Patterns | OWASP [Axx] | anchored \b...: | SHAPE | BUDGET exit | findings | over-cap findings (w) | fully passes |
|-----|--------------|-----------|-----------------|-------------|-----------------|-------|-------------|----------|-----------------------|--------------|
| r2-security-1 | Y | [OK] | [OK] | [A01][A02][A03][A06][A07][A09] | 0 | [OK] | 7 | 4 findings: 33,33,33,30 | NO (BUDGET) |
| r2-security-2 | Y | [OK] | [OK] | [A01][A02][A03][A06][A09] | 0 | [OK] | 0 | 9 | none (worst 21) | YES |
| r2-security-3 | Y | [OK] | [OK] | [A01][A02][A03][A06][A07][A09] | 0 | [OK] | 0 | 7 | none (worst 26) | YES |
| r2-security-4 | Y | [OK] | [OK] | [A01][A02][A03][A04][A07][A09] | 0 | [OK] | 0 | 9 | none (worst <=28) | YES |
| r2-security-5 | Y | [OK] | [OK] | [A01][A02][A03][A06][A07][A09] | 0 | [OK] | 0 | 7 | none (worst <=28) | YES |

### r2-security-1 BUDGET detail (residual -- verbose fix-prose tails)

`--from-trace r2-security-1.agent.md` -> exit 1, 6/10. SHAPE clean (four headers,
Threat Patterns, OWASP `[Axx]` byte-intact, zero anchored shorthand). FOUR findings
over the 28w cap, all at 30-33w. The overshoot is NOT inline FINDING-code
reproduction (FIX-3's target) but verbose FIX-clause prose -- e.g.:
- 33w: `exec('du -sh ' + path)` ... "Replace with `execFile('du', ['-sh', path])` plus an allow-list of permitted mount paths."
- 33w: hardcoded key ... "Move to a secrets manager / env var and rotate the leaked key now."
- 33w: `exec('curl ' + url + ...)` ... "Use `execFile`/`fetch` with an arg array, never a shell string."
- 30w: token over `http://` ... "Switch to `https://` and move the token to an `Authorization` header, not the URL."

The fix-clause carries a remediation code snippet + a second clause, pushing the
body to ~33w. This is a verbosity residual of the same family the 13-04 fix
targeted, but on the FIX side rather than the FINDING side. RECORDED HONESTLY (D-10);
NOT masked, NOT re-worded.

**Security summary (n=5): c=4 fully-passing.** r2-security-2/3/4/5 fully pass
(every finding <=28w, worst 21/26/28/28); r2-security-1 BUDGET exit 1 (4 findings
at 30-33w). SHAPE (SC-2) holds 5/5 with OWASP `[Axx]` byte-intact every run; BUDGET
(SC-4 security half) holds 4/5. Pre-fix security half was 0/3 (every run over-cap,
35/31/34/36w); the fix moved it to 4/5 with the worst overshoot collapsing from 36w
to 33w -- a large improvement, but not yet 5/5.

## Combined verdict (n=5 per skill)

- Reviewer: c=3/5 (review-3 29w, review-4 45w Question)
- Security: c=4/5 (security-1 four findings 30-33w)
- **Combined c=7/10.** Pre-fix combined was c=2/6. The 13-04 fix is a LARGE
  improvement (Pass@1 0.3333 -> 0.7000; worst finding-body overshoot 46w -> 33w for
  findings, 45w for an uncarved Question) but SC-4 PASS requires EVERY run exit 0,
  so SC-4 is NOT yet fully GREEN. 3/10 runs retain a marginal/verbose over-cap.
- SHAPE-only: 10/10 clean (Pass^k = 1.0 everywhere) -- the grouped grammar render is
  flawless on every run; the BUDGET cap is the sole discriminator.

## Residual gap -> GAP-13-BUDGET-R2 (second concision iteration needed)

Three residual over-cap classes survive the 13-04 fix, all on the FIX/Question side
the first iteration under-addressed:
1. **Reviewer multi-clause Question** (review-4, 45w): the reviewer grammar has no
   auto-clarity carve-out, so a long Question is hard-capped at 28w with no escape.
   Candidate: extend the reviewer's Question concision rule (FIX-4 analog for the
   reviewer), or add a reviewer Per-finding-validation routing for Question
   elaboration.
2. **Verbose security FIX-clause prose** (security-1, 30-33w x4): the remediation
   clause carries a code snippet + a second sentence. FIX-3 addressed FINDING-code
   reproduction; the FIX clause needs the same reference-by-shape discipline.
3. **Marginal reviewer deref-chain finding** (review-3, 29w): a 1w overflow from a
   multi-clause causal chain; a terseness nudge in the reviewer body rule.

These are a SECOND concision iteration (a follow-on gap plan), NOT patched in this
re-measure plan. SC-4 stays NOT-fully-PASS until a re-measure shows every run
exit 0.
