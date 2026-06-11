---
phase: 13-empirical-verification
plan: 01
subsystem: uat-substrate
tags: [worktree, uat, evidence-custody, seeded-review-target, sc-3]
requires: []
provides:
  - "Dedicated ngx worktree on uat/phase-13-render off 019a26a (SC-3 substrate)"
  - "Seeded review-src/handler.ts + review-src/disk-info.ts on the throwaway branch (Wave 0 anti-vacuous target)"
  - "Evidence-custody dir .planning/.../uat/ in this repo (D-08)"
affects:
  - "Plan 13-02 (live claude -p runs consume the worktree + seeded target; write captures into the evidence dir)"
  - "Plan 13-03 (tears the worktree down after extraction)"
tech-stack:
  added: []
  patterns:
    - "Manual git worktree add against an external repo via --git-dir (NOT Claude Code isolation: worktree)"
    - "EXPECTED_BASE/ACTUAL_BASE assertion for base-drift defense (merge --ff-only correction, never reset --soft)"
key-files:
  created:
    - ".planning/phases/13-empirical-verification/uat/WORKTREE-PROVENANCE.md"
    - ".planning/phases/13-empirical-verification/uat/.gitkeep"
    - "/d/projects/github/LayZeeDK/ngx-smart-components-uat-13/review-src/handler.ts (throwaway worktree branch only)"
    - "/d/projects/github/LayZeeDK/ngx-smart-components-uat-13/review-src/disk-info.ts (throwaway worktree branch only)"
  modified: []
decisions:
  - "A2 stated as a decision: seeded files live ONLY on the throwaway uat/phase-13-render branch; they are a slice within ngx-smart-components and do NOT mutate the active tree (never main, never this repo)."
metrics:
  duration: ~6min
  completed: 2026-06-08
---

# Phase 13 Plan 01: UAT substrate provisioning Summary

Provisioned the isolated UAT substrate for the GATE-02 empirical verification: a dedicated ngx worktree on `uat/phase-13-render` off the user-confirmed checkpoint `019a26a` (never ngx main), two seeded reviewable source files that reliably clear the budget fixtures' `MIN_FINDINGS=5` guard, and an evidence-custody directory in this repo for Plan 13-02 captures.

## What Plan 13-02 consumes

- **Worktree (CWD for `claude -p`):** `/d/projects/github/LayZeeDK/ngx-smart-components-uat-13`
- **Branch:** `uat/phase-13-render` (one seed commit `4fa7fd7` off base `019a26a`)
- **EXPECTED_BASE SHA:** `019a26a6cf17fb4968791817eecfab14ec81b369`
- **Seeded review target (reviewer, >=5 findings):** `review-src/handler.ts`
- **Seeded review target (security-reviewer, >=5 OWASP-tagged findings):** `review-src/disk-info.ts`
- **Evidence-custody dir (D-08):** `.planning/phases/13-empirical-verification/uat/` (in THIS repo; holds `*.streamjson` / `*.report.md` / `*.agent.md` / grade logs / `PASS-K.md`)

## Tasks Completed

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 | Provision dedicated ngx worktree off checkpoint (SC-3) | `68d1605` (this repo) | `.planning/.../uat/WORKTREE-PROVENANCE.md`; ngx worktree registered |
| 2 | Seed reviewable source slices (Wave 0 anti-vacuous dependency) | `4fa7fd7` (ngx throwaway branch) | `review-src/handler.ts`, `review-src/disk-info.ts` |
| 3 | Create evidence-custody directory (D-08) | `c026a82` (this repo) | `.planning/.../uat/.gitkeep` |

Task 2's atomic record is the worktree-branch commit `4fa7fd7` on the EXTERNAL ngx repo (the seeded files never enter THIS repo); Tasks 1 and 3 are committed in THIS repo.

## Verification Results

**SC-3 worktree isolation (Task 1):**
- Checkpoint branch `lz-advisor-compodoc-storybook-uat-base` asserted to exist BEFORE worktree add. [OK]
- `EXPECTED_BASE == ACTUAL_BASE == 019a26a6cf17fb4968791817eecfab14ec81b369` (no origin/HEAD drift; manual add with explicit start-point). [OK]
- `git worktree list` shows `ngx-smart-components-uat-13 ... [uat/phase-13-render]`. [OK]
- ngx `main` worktree still reads `bad1aed [main]` -- live tree untouched. [OK]
- `uat/phase-13-render` HEAD~1 == `019a26a` (provenance preserved after the seed commit). [OK]

**Seeded target (Task 2):**
- Both files tracked on `uat/phase-13-render` in the worktree (`ls-files` rg exit 0). [OK]
- Absent from ngx `main` (`ls-tree -r main` rg exit 1). [OK]
- Absent from THIS repo (bare `git status --porcelain` rg exit 1). [OK]
- `handler.ts` contains unguarded `JSON.parse(req.body)` + braceless `if (payload.admin === true) return ...` (reviewer >=5-findings seed). [OK]
- `disk-info.ts` contains attacker-controlled `exec('du -sh ' + path, ...)` + unvalidated `fsSize(path)` sink (security >=5-OWASP seed). [OK]

**Evidence dir (Task 3):**
- `.planning/phases/13-empirical-verification/uat/.gitkeep` exists (`test -f` exit 0). [OK]
- Lives in this repo's `.planning/` tree, surviving worktree teardown. [OK]

## Seeded defect inventory (for Plan 13-02 finding-count expectation)

`review-src/handler.ts` (targets the reviewer; ~7 reviewable issues):
1. Missing parameter/return types on `handleRequest` (implicit `any`).
2. Unguarded `JSON.parse` of untrusted `req.body`.
3. Braceless `if` guard.
4. Dead/unreachable code branch (`notified` always false).
5. Swallowed error in `processUser` catch.
6. Missing types + no input validation in `validate` (dereferences `data.name`).
7. No-op stubbed `sendAuditLog` with a TODO in a wired path.

`review-src/disk-info.ts` (targets the security-reviewer; >=5 OWASP-taggable):
1. Command injection -- attacker-controlled `path` into `exec('du -sh ' + path)` (A03).
2. Path traversal -- unvalidated `path` into `fsSize(path)` (A01).
3. Hardcoded credential `API_TOKEN` (A07 / hardcoded secret).
4. Over-broad catch swallowing security-relevant failures (A09).
5. Secret + data sent over plain `http://` (A02 cryptographic failures).
6. Outdated/vulnerable `systeminformation` dependency pin comment (A06).
   Plus the missing input-validation guard feeding both sinks.

## Deviations from Plan

None - plan executed exactly as written. Decision A2 stated explicitly per the plan action: the seeded files live ONLY on the throwaway `uat/phase-13-render` branch; they are a slice within ngx-smart-components and do NOT mutate the active tree (verified absent from both ngx main and this repo).

## Teardown reference (Plan 13-03, D-08)

After Plan 13-02 extracts all captures into `.planning/.../uat/`:
```
git --git-dir=/d/projects/github/LayZeeDK/ngx-smart-components/.git worktree remove /d/projects/github/LayZeeDK/ngx-smart-components-uat-13 --force
git --git-dir=/d/projects/github/LayZeeDK/ngx-smart-components/.git branch -D uat/phase-13-render
```

## Self-Check: PASSED

- All 3 created files in this repo present (WORKTREE-PROVENANCE.md, .gitkeep, 13-01-SUMMARY.md).
- Both seeded files present in the worktree (review-src/handler.ts, review-src/disk-info.ts).
- All commits exist: `68d1605` + `c026a82` (this repo), `4fa7fd7` (ngx throwaway branch).
