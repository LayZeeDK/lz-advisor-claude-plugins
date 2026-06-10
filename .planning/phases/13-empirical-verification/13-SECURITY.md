---
phase: 13
slug: empirical-verification
status: verified
threats_open: 0
asvs_level: 1
created: 2026-06-10
---

# Phase 13 - Security

> Per-phase security contract: threat register, accepted risks, and audit trail.
> Verify-only meta-phase. Edits agent PROMPT TEXT (markdown) + read-only
> capture/grade pipelines in a throwaway external-repo worktree + evidence
> markdown. `register_authored_at_plan_time: true` for all 7 plans -- this audit
> VERIFIES each declared mitigation; it does not scan for new threats.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| ngx external repo -> throwaway worktree | The only write surface; isolated on a disposable branch, never `main` | Seeded reviewable source TEXT (inert; never executed) |
| Seeded source files -> review skills | Deliberately-vulnerable text the reviewer reads; not run by this phase | Synthetic defect TEXT; fabricated `API_TOKEN` literal |
| Captured stream-json / subagent JSONL -> bash fixtures | Untrusted-ish text input to `--from-trace`; handled read-only | Opaque trace text (agents' own review output) |
| ngx worktree CWD -> nested `claude -p` session | Nested live session draws on the shared 5-hour usage pool | Session credit (DoS axis, not data) |
| residue sweep -> `plugins/lz-advisor/` pathspec | Structural guard against touching frozen `.planning/` history | git index reads only |
| agent prompt edits -> review output contract | Markdown-only edits; protected behaviors (Class-2 hook, Hedge Marker, OWASP lens) and caps must stay intact | No code path, network, install, or secret |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-13-01 | Tampering | ngx `main`/live working tree (plan 13-01) | mitigate | Manual `git worktree add -b uat/phase-13-render` off checkpoint `019a26a`; branch asserted before add; EXPECTED_BASE==ACTUAL_BASE recorded; never on `main` | closed |
| T-13-02 | Tampering | THIS repo's tracked tree (plan 13-01) | accept | Seeds committed ONLY on throwaway ngx branch (`4fa7fd7`); never enter this repo or ngx main | closed |
| T-13-SC(01) | Tampering | npm/pip/cargo installs (plan 13-01) | accept | No installs in this verify-only phase | closed |
| T-13-03 | Tampering | captured trace files fed to fixtures (plan 13-02) | mitigate | Fixtures quote `"$TRACE_FILE"`, normalize only via `tr -d '\r'`, NEVER eval/source a capture (T-11-01); explicit comments | closed |
| T-13-04(DoS) | Denial of Service | shared 5-hour session pool (plan 13-02) | accept | n=3 floor; verify result event before grading; out_of_credits re-run after reset, not graded partial | closed |
| T-13-SC(02) | Tampering | npm/pip/cargo installs (plan 13-02) | accept | No installs | closed |
| T-13-05 | Tampering | frozen `.planning/` v1.0 history (plan 13-03) | mitigate | Sweep scoped by `-- plugins/lz-advisor/` pathspec ALONE; no `.planning/` file referenced; Phase 9 precedent | closed |
| T-13-06 | Information Disclosure | uncommitted UAT artifacts (plan 13-03) | mitigate | D-08 precondition gate: all captures/report/agent/grade logs in this repo's `uat/` BEFORE worktree remove; teardown by exact branch name | closed |
| T-13-SC(03) | Tampering | npm/pip/cargo installs (plan 13-03) | accept | No installs | closed |
| T-13-04-01 | Tampering | reviewer.md / security-reviewer.md prompt edits (plan 13-04) | mitigate | Surgical concision edits; budget fixtures + residue sweep + SHAPE/AGNT-03 grep gates prove no protected behavior or output contract tampered | closed |
| T-13-04-02 | Information disclosure | FIX-3 reference-by-location rule (plan 13-04) | accept | FIX-3 REDUCES disclosure (path:line pointers instead of inline code); net-positive | closed |
| T-13-04-SC | Tampering | npm/pip/cargo installs (plan 13-04) | accept (n/a) | Markdown-only edits, no installs, no new attack surface | closed |
| T-13-05-01 | Tampering | ngx live working tree (plan 13-05) | mitigate | Dedicated worktree on NEW throwaway branch `uat/phase-13-render-r2`; D-07 base-drift defense + isolation assertion; teardown by EXACT branch name | closed |
| T-13-05-02 | Information disclosure | trace captures (plan 13-05) | accept | Read-only opaque text; `API_TOKEN` in seed is a fabricated UAT literal; evidence stays in `.planning/` | closed |
| T-13-05-03 | Denial of Service | shared 5-hour session pool (plan 13-05) | accept | n=3 floor, write-and-grade-incrementally, budget across reset windows | closed |
| T-13-05-04 | Elevation of Privilege | seeded vulnerable review-src files (plan 13-05) | mitigate | Inert review TEXT never run; only on throwaway branch; removed at teardown | closed |
| T-13-05-SC | Tampering | npm/pip/cargo installs (plan 13-05) | accept (n/a) | No installs | closed |
| T-13-06-01 | Tampering | reviewer.md / security-reviewer.md prompt edits (plan 13-06) | mitigate | Surgical edits; budget fixtures + residue sweep + SHAPE/AGNT-03 + cap-constant grep prove no protected behavior/contract/cap tampered | closed |
| T-13-06-02 | Tampering | budget gate `tests/D-*-budget.sh` (plan 13-06) | mitigate | Fixtures NEVER edited (`git status --porcelain tests/` empty -- hard check); close by genuine concision, not gate relaxation; FIX-R2-D deferred | closed |
| T-13-06-03 | Information disclosure | FIX-R2-B reference-by-shape rule (plan 13-06) | accept | FIX-R2-B REDUCES disclosure (name the API by shape instead of pasting remediation expr); net-positive | closed |
| T-13-06-SC | Tampering | npm/pip/cargo installs (plan 13-06) | accept (n/a) | Markdown-only edits | closed |
| T-13-07-01 | Tampering | ngx live working tree (plan 13-07) | mitigate | Dedicated worktree NEW throwaway branch `uat/phase-13-render-r3`; D-07 worktree-scoped gitdir-HEAD read + isolation assertion; teardown EXACT branch name. NOTE: transient breach caught + reverted (see audit note below) | closed (PASS-WITH-DEVIATION) |
| T-13-07-02 | Tampering | budget gate `tests/D-*-budget.sh` (plan 13-07) | mitigate | Fixtures NEVER edited (`git status --porcelain tests/` empty); gate run `--from-trace` read-only; SC-4 closes only on genuine GREEN under unchanged hard cap | closed |
| T-13-07-03 | Information disclosure | trace captures (plan 13-07) | accept | Read-only opaque text; fabricated `API_TOKEN` literal; evidence in `.planning/` | closed |
| T-13-07-04 | Denial of Service | shared 5-hour session pool (plan 13-07) | accept | n=3 floor, write-and-grade-incrementally, budget across reset windows | closed |
| T-13-07-05 | Elevation of Privilege | seeded vulnerable review-src files (plan 13-07) | mitigate | Inert review TEXT never run; only on throwaway branch; removed at teardown | closed |
| T-13-07-SC | Tampering | npm/pip/cargo installs (plan 13-07) | accept (n/a) | No installs | closed |

*Status: open / closed*
*Disposition: mitigate (implementation required) / accept (documented risk) / transfer (third-party)*

---

## Mitigation Evidence (independently verified, did NOT trust SUMMARY/VERIFICATION narratives)

| Threat ID | Disposition | Evidence |
|-----------|-------------|----------|
| T-13-01 | mitigate | `uat/WORKTREE-PROVENANCE.md` records EXPECTED_BASE==ACTUAL_BASE==`019a26a` on `uat/phase-13-render`; 13-01-SUMMARY records ngx main untouched (`bad1aed [main]`). External worktree torn down; verified no residue leaked into this repo. |
| T-13-02 | accept | `git ls-files \| rg "review-src\|disk-info\|handler.ts"` -> exit 1 (zero seed files in this repo). Documented in accepted-risks log below. |
| T-13-SC(01) | accept | No `package.json`/lockfile change in phase scope; verify-only. Logged below. |
| T-13-03 | mitigate | `tests/D-reviewer-budget.sh:122` + `tests/D-security-reviewer-budget.sh:108`: `tr -d '\r' < "$TRACE_FILE"` (quoted, read-only redirect); T-11-01 "never eval/source" comments at fixture lines 65 / 116 and 64 / 102. No eval/source token present. |
| T-13-04(DoS) | accept | 13-02-SUMMARY: per-run `jq -e 'select(.type=="result")'` gate before grading; n=3 floor. Operational DoS, not a security exposure. Logged below. |
| T-13-SC(02) | accept | No installs. Logged below. |
| T-13-05 | mitigate | `git log -1 -- .planning/milestones/` -> `84f6e77 chore: complete v1.0 milestone` (NOT a Phase 13 commit); residue sweeps scoped `-- plugins/lz-advisor/` only. Frozen history untouched. |
| T-13-06 | mitigate | 18 `r3-*` capture files + GRADE-LOG/PASS-K/WORKTREE-PROVENANCE markdowns present and committed in `uat/` (verified via `git ls-files`); teardown by exact branch name per 13-03/05/07 SUMMARYs. |
| T-13-SC(03) | accept | No installs. Logged below. |
| T-13-04-01 | mitigate | Both fixtures self-extract exit 0, self-test exit 1 (gate enforced, not gamed). FIX-1, FIX-3 markers present in reviewer.md; FIX-1..4 in security-reviewer.md. AGNT-03 markers present (Class-2 Escalation Hook x2/3, Hedge Marker Discipline x2/3, lowercase `severity="important"` x2/2). |
| T-13-04-02 | accept | FIX-3 rule present (reviewer.md:101, security-reviewer.md:105) + do_not_include items (reviewer.md:295, security-reviewer.md:313). Reduces disclosure surface. Logged below. |
| T-13-04-SC | accept (n/a) | `git status --porcelain tests/` empty; no install surface. Logged below. |
| T-13-05-01 | mitigate | 13-05-SUMMARY: R2 worktree on `uat/phase-13-render-r2` off `019a26a`, ACTUAL_BASE read via worktree-scoped gitdir HEAD; teardown by exact name; ngx main `bad1aed` untouched. No seed residue in this repo. |
| T-13-05-02 | accept | Trace captures are read-only opaque text; `API_TOKEN` is a fabricated literal; all R2 evidence under `.planning/`. Logged below. |
| T-13-05-03 | accept | n=3 floor (escalated to n=5 with pool headroom); write-and-grade-incrementally. Operational DoS. Logged below. |
| T-13-05-04 | mitigate | Seeds inert (never imported/built/run); only on throwaway branch; removed at teardown. Absent from this repo (`git ls-files` exit 1). |
| T-13-05-SC | accept (n/a) | No installs. Logged below. |
| T-13-06-01 | mitigate | Both fixtures self-extract exit 0 / self-test exit 1. FIX-R2-A + FIX-R2-C markers in reviewer.md; FIX-R2-B in security-reviewer.md. Caps unchanged: reviewer `22/28/60` with NO `auto_clarity_carve_out` element (grep exit 1 -- FIX-R2-A reused the 60w PFV); security `22/28/75/60`. SHAPE + AGNT-03 intact. |
| T-13-06-02 | mitigate | `git status --porcelain tests/` empty (verified). Fixture constants `PER_ENTRY_CAP=28`/`MIN_FINDINGS=5`/`AUTO_CLARITY_CAP=75` unchanged. Self-test exit 1 proves the gate still fires; gate not relaxed. |
| T-13-06-03 | accept | FIX-R2-B WRONG->RIGHT example at security-reviewer.md:199 (INCORRECT, full call expr) vs :203 (CORRECT, name-by-shape, no call expr / no second clause). Reduces disclosure. Logged below. |
| T-13-06-SC | accept (n/a) | Markdown-only; no install surface. Logged below. |
| T-13-07-01 | mitigate | `uat/WORKTREE-PROVENANCE-R3.md` + 13-07-SUMMARY + 13-VERIFICATION SC-3: R3 worktree off `019a26a`. Transient breach (stray `ec9cc92` on ngx main) CAUGHT by the isolation assertion + reverted via `git reset --mixed 2d4d9f0` (user work preserved); seed re-committed inside the worktree (`cd1b9c8`). FINAL ngx state independently confirmed clean (stray NOT ancestor of main `2d4d9f0` nor user branch `98e9e42`; quarantined on inert `safety/edge-aion-986dae1`). No seed residue in THIS repo (`git ls-files` exit 1). |
| T-13-07-02 | mitigate | `git status --porcelain tests/` empty; both fixtures self-test exit 1; 13-VERIFICATION re-ran a synthetic 38w finding -> exit 1 (`38 > 28`). Genuine close under unchanged hard cap. |
| T-13-07-03 | accept | Trace captures read-only opaque text; fabricated `API_TOKEN`; 18 `r3-*` evidence files under `.planning/`. Logged below. |
| T-13-07-04 | accept | n=3 floor, script-file for-loop durability, budget across reset windows. Operational DoS. Logged below. |
| T-13-07-05 | mitigate | Seeds recovered byte-identical from dangling `4fa7fd7`, inert TEXT only on throwaway branch, removed at teardown. Absent from this repo. |
| T-13-07-SC | accept (n/a) | No installs. Logged below. |

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-13-01 | T-13-02 | Seeded reviewable files committed only on the throwaway ngx branch (`4fa7fd7`); independently confirmed absent from this repo (`git ls-files \| rg "review-src\|disk-info\|handler.ts"` exit 1) and from ngx main. No permanent source added here. | Lars Gyrup Brink Nielsen | 2026-06-10 |
| AR-13-02 | T-13-SC(01), T-13-SC(02), T-13-SC(03), T-13-04-SC, T-13-05-SC, T-13-06-SC, T-13-07-SC | Verify-only meta-phase: no npm/pip/cargo installs across any of the 7 plans. No `[ASSUMED]`/`[SUS]` packages; no new dependency attack surface. `git status --porcelain tests/` empty. | Lars Gyrup Brink Nielsen | 2026-06-10 |
| AR-13-03 | T-13-04(DoS), T-13-05-03, T-13-07-04 | Nested `claude -p` shares the 5-hour usage pool; can hit out_of_credits/429 mid-run. Mitigated operationally by the n=3 floor, result-event verification before grading, write-and-grade-incrementally durability, and budgeting across reset windows. Availability of a developer-tooling UAT, not a security exposure of the plugin. | Lars Gyrup Brink Nielsen | 2026-06-10 |
| AR-13-04 | T-13-05-02, T-13-07-03 | Trace captures (`*.streamjson` / `*.agent.md`) are read-only opaque text of the agents' own review output against synthetic seeds. The `API_TOKEN` in the seed is a fabricated UAT literal; no real secret or PII flows through. All evidence stays in this repo's `.planning/` tree. | Lars Gyrup Brink Nielsen | 2026-06-10 |
| AR-13-05 | T-13-04-02 | FIX-3 (reference code by `path:line`) REDUCES disclosure surface -- it stops the agent reproducing code snippets inline in findings, replacing them with location pointers. Net-positive; no new disclosure introduced. | Lars Gyrup Brink Nielsen | 2026-06-10 |
| AR-13-06 | T-13-06-03 | FIX-R2-B (reference the fix/remediation clause by shape) REDUCES disclosure surface -- it stops the agent pasting full remediation call expressions into the fix span (verified: security-reviewer.md:203 names `execFile` by shape, dropping the call expression). Net-positive. | Lars Gyrup Brink Nielsen | 2026-06-10 |

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-06-10 | 27 | 27 | 0 | gsd-security-auditor (Claude) |

**Audit notes:**

- All 27 threats resolve to CLOSED. 14 `mitigate` threats verified present in the implementation; 13 `accept`/`n/a` threats documented in the Accepted Risks Log above (per `<constraints>`, the disposition + plan rationale is the acceptance record, captured here).
- No `unregistered_flag`: every Phase 13 SUMMARY threat-flag maps to a registered threat ID (the SUMMARYs raise GAP-13-BUDGET / GAP-13-BUDGET-R2, which are budget-concision gaps -- the closure work covered by T-13-04-01 / T-13-06-01 / T-13-06-02 / T-13-07-02 -- not new attack surface). No new exports, auth pattern, input handler, data flow, dependency, or service was introduced.
- **T-13-07-01 PASS-WITH-DEVIATION (recorded, not a blocker):** during 13-07 Task 1 a first seed-commit used a shared `--git-dir`/`-C` invocation that resolved HEAD against the MAIN ngx index, landing a stray commit (`ec9cc92`) on ngx live `main`. The isolation assertion (the mitigation itself) CAUGHT it; it was surgically reverted via `git reset --mixed 2d4d9f0` (preserving the user's uncommitted edits) and the seed re-committed cleanly inside the worktree (`cd1b9c8`). FINAL state independently confirmed clean: ngx main `2d4d9f0` (stray NOT an ancestor, no seeds); user active branch `98e9e42` clean; R3 worktree torn down. The stray is quarantined on an inert `safety/edge-aion-986dae1` branch (user may delete at convenience). An execution-hygiene rule is recorded for future external-repo UAT seeding (seed-commit MUST use the worktree's own git context, never a bare external `--git-dir`/`-C`). The criterion's success condition (dedicated worktree; never ngx main in the final state; user work intact) holds; the threat's mitigation (isolation assertion + exact-name teardown) functioned as designed.
- Independent checks executed by this audit (not taken on trust): `git status --porcelain tests/` (empty); `git ls-files | rg "review-src|disk-info|handler.ts"` (exit 1); three scoped residue sweeps over `plugins/lz-advisor/` (all exit 1); cap-constant greps in both agents + both fixtures (unchanged: 22/28/75/60 agents, 28/5/75 fixtures); reviewer carve-out-element grep (exit 1 -- FIX-R2-A reused the 60w PFV); FIX-marker presence in both agents; AGNT-03 marker counts in both agents; both budget fixtures self-extract exit 0 + self-test exit 1; `git log -1 -- .planning/milestones/` (`84f6e77`, not a Phase 13 commit); FIX-R2-B WRONG->RIGHT example at security-reviewer.md:199/:203; R3 evidence custody (18 captures + 3 markdowns committed).

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-06-10
