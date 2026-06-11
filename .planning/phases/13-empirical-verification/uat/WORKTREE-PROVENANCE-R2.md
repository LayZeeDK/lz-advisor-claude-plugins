# Phase 13 Plan 05 UAT Worktree Provenance R2 (SC-3 re-measure substrate)

> Records the RE-PROVISIONED dedicated ngx-smart-components worktree for the
> GATE-02 budget RE-MEASURE (Plan 13-05, Wave 2). Proves the worktree was
> created off the SAME user-confirmed checkpoint branch as 13-01 (never ngx
> `main`) on a NEW throwaway branch, with a verified EXPECTED_BASE == ACTUAL_BASE
> match (D-06 / D-07). This substrate feeds the n>=3-per-skill live `claude -p`
> captures that re-measure SC-4 against the 13-04 FIXED agents.

**Provisioned:** 2026-06-08 (Plan 13-05, Task 1)

## Why a new worktree (R2)

The original 13-01 worktree (`ngx-smart-components-uat-13`) + branch
(`uat/phase-13-render`) were torn down in 13-03. This plan re-provisions a
DETERMINISTIC equivalent from the SAME checkpoint + SAME seed shape on a NEW
throwaway branch to avoid name collision with the deleted original.

## Checkpoint base (D-06; SAME as 13-01)

- Confirmed checkpoint branch: `lz-advisor-compodoc-storybook-uat-base`
- EXPECTED_BASE SHA: `019a26a6cf17fb4968791817eecfab14ec81b369` (short `019a26a`)
- The spec name `uat/pre-storybook-compodoc` DOES NOT EXIST and was NEVER used.
- Checkpoint branch asserted to exist BEFORE the worktree add (D-07).

## Throwaway worktree (R2)

- Path (sibling, outside both repos): `/d/projects/github/LayZeeDK/ngx-smart-components-uat-13-r2`
- New throwaway branch: `uat/phase-13-render-r2`
- Created via: `git --git-dir=/d/projects/github/LayZeeDK/ngx-smart-components/.git worktree add -b uat/phase-13-render-r2 /d/projects/github/LayZeeDK/ngx-smart-components-uat-13-r2 lz-advisor-compodoc-storybook-uat-base`
- This is a MANUAL `git worktree add` against the EXTERNAL ngx repo (D-06) -- NOT a Claude Code `isolation: worktree` subagent.

## Base-drift defense (D-07)

A manual `git worktree add` with an explicit start-point does NOT drift to
`origin/HEAD`, so the EXPECTED_BASE check is belt-and-suspenders. ACTUAL_BASE was
read from the WORKTREE-SCOPED gitdir
(`.git/worktrees/ngx-smart-components-uat-13-r2`), NOT the main repo HEAD (a
main-repo `rev-parse HEAD` returns `bad1aed`, the live main, and would be a false
drift signal). Had a genuine drift occurred, the documented correction is
`git merge --ff-only <EXPECTED_BASE>` (NEVER `reset --soft`, which leaves stale
files).

| Check | Value | Verdict |
|-------|-------|---------|
| Checkpoint branch exists (asserted BEFORE worktree add) | `lz-advisor-compodoc-storybook-uat-base` -> `019a26a...` | [OK] |
| EXPECTED_BASE (checkpoint branch SHA) | `019a26a6cf17fb4968791817eecfab14ec81b369` | captured |
| ACTUAL_BASE (worktree-scoped HEAD after add) | `019a26a6cf17fb4968791817eecfab14ec81b369` | [OK] |
| EXPECTED_BASE == ACTUAL_BASE | match | [OK] no drift |

## Seed defect files (SAME shape as 13-01; byte-identical)

Both seeds were recovered VERBATIM from the original 13-01 seed commit `4fa7fd7`
(the commit object survives the `uat/phase-13-render` branch deletion until GC)
and confirmed byte-identical via `diff` BEFORE the R2 seed commit:

- `review-src/handler.ts` (reviewer, ~7 reviewable issues: implicit-any params/return; unguarded `JSON.parse(req.body)`; braceless `if`; dead `notified` branch; swallowed catch; missing-validation `validate` dereferencing `data.name`; no-op stubbed `sendAuditLog` TODO). `diff` vs `4fa7fd7:review-src/handler.ts` = empty (IDENTICAL).
- `review-src/disk-info.ts` (security, >=5 OWASP-taggable: command injection `exec('du -sh ' + path)` A03; path traversal `fsSize(path)` A01; hardcoded `API_TOKEN` A07; over-broad catch A09; secret+data over `http://` A02; outdated `systeminformation` pin A06; plus the missing-input-validation guard feeding both sinks). `diff` vs `4fa7fd7:review-src/disk-info.ts` = empty (IDENTICAL).

Seed commit on `uat/phase-13-render-r2` ONLY: `b8f99e1` (HEAD~1 == `019a26a`,
provenance preserved).

## Isolation assertion (SC-3)

[OK] The UAT worktree is on `uat/phase-13-render-r2`, NEVER on ngx `main`.
[OK] Seeds present on `uat/phase-13-render-r2` (`ls-tree -r` shows both).
[OK] Seeds ABSENT from ngx `main` (`ls-tree -r main` rg exit 1).
[OK] Seeds ABSENT from THIS repo (bare `git status --porcelain` + `git ls-files` rg exit 1).
[OK] ngx `main` live working tree untouched (still `bad1aed`).

## `git worktree list` output (captured at R2 provisioning)

```
D:/projects/github/LayZeeDK/ngx-smart-components           bad1aed [main]
D:/projects/github/LayZeeDK/ngx-smart-components-uat-13-r2 019a26a [uat/phase-13-render-r2]
```

-> The dedicated R2 worktree reads `[uat/phase-13-render-r2]` off `019a26a`.
-> The ngx main worktree still reads `[main]` at `bad1aed` (live tree untouched).

## Teardown commands (Task 3, D-08 -- only after evidence custody)

By EXACT name (never a blanket loop -- ngx has stale `uat/*` branches):

```
git --git-dir=/d/projects/github/LayZeeDK/ngx-smart-components/.git worktree remove /d/projects/github/LayZeeDK/ngx-smart-components-uat-13-r2 --force
git --git-dir=/d/projects/github/LayZeeDK/ngx-smart-components/.git branch -D uat/phase-13-render-r2
```

Post-teardown asserts: ngx `worktree list` shows only `[main]`;
`rev-parse --verify uat/phase-13-render-r2` fails; ngx live tree untouched.
