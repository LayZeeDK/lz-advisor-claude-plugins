# Phase 13 Plan 07 UAT Worktree Provenance R3 (SC-3 third re-measure substrate)

> Records the RE-PROVISIONED dedicated ngx-smart-components worktree for the
> THIRD GATE-02 budget RE-MEASURE (Plan 13-07, Wave 2). Proves the worktree was
> created off the SAME user-confirmed checkpoint branch as 13-01 / 13-05 (never
> ngx `main`) on a NEW throwaway branch `uat/phase-13-render-r3`, with a verified
> EXPECTED_BASE == ACTUAL_BASE match (D-06 / D-07). This substrate feeds the
> n>=3-per-skill live `claude -p` captures that re-measure SC-4 against the 13-06
> FIXED agents (FIX-R2-A/B/C, commits bfb8003 + 91ee635).

**Provisioned:** 2026-06-08 (Plan 13-07, Task 1)

## Why a new worktree (R3)

The 13-05 R2 worktree (`ngx-smart-components-uat-13-r2`) + branch
(`uat/phase-13-render-r2`) were torn down in 13-05; the 13-01 original
(`ngx-smart-components-uat-13` / `uat/phase-13-render`) in 13-03. This plan
re-provisions a DETERMINISTIC equivalent from the SAME checkpoint + SAME seed
shape on a NEW throwaway branch `uat/phase-13-render-r3` to avoid name collision
with both deleted predecessors.

## Checkpoint base (D-06; SAME as 13-01 / 13-05)

- Confirmed checkpoint branch: `lz-advisor-compodoc-storybook-uat-base`
- EXPECTED_BASE SHA: `019a26a6cf17fb4968791817eecfab14ec81b369` (short `019a26a`)
- The spec name `uat/pre-storybook-compodoc` DOES NOT EXIST and was NEVER used.
- Checkpoint branch asserted to exist BEFORE the worktree add (D-07).

## Throwaway worktree (R3)

- Path (sibling, outside both repos): `/d/projects/github/LayZeeDK/ngx-smart-components-uat-13-r3`
- New throwaway branch: `uat/phase-13-render-r3`
- Created via: `git --git-dir=/d/projects/github/LayZeeDK/ngx-smart-components/.git worktree add -b uat/phase-13-render-r3 /d/projects/github/LayZeeDK/ngx-smart-components-uat-13-r3 lz-advisor-compodoc-storybook-uat-base`
- This is a MANUAL `git worktree add` against the EXTERNAL ngx repo (D-06) -- NOT a Claude Code `isolation: worktree` subagent.

## Base-drift defense (D-07)

A manual `git worktree add` with an explicit start-point does NOT drift to
`origin/HEAD`, so the EXPECTED_BASE check is belt-and-suspenders. ACTUAL_BASE was
read from the WORKTREE-SCOPED gitdir
(`.git/worktrees/ngx-smart-components-uat-13-r3/HEAD` -> `refs/heads/uat/phase-13-render-r3`,
tip resolved pre-seed), NOT the main repo HEAD. A main-repo `rev-parse HEAD`
returned `2d4d9f0` (the CURRENT ngx live main, which has advanced from the
`bad1aed` recorded in 13-05) -- a documented FALSE-DRIFT signal, not our base.
Had a genuine drift occurred, the documented correction is
`git merge --ff-only <EXPECTED_BASE>` (NEVER `reset --soft`, which leaves stale
files).

| Check | Value | Verdict |
|-------|-------|---------|
| Checkpoint branch exists (asserted BEFORE worktree add) | `lz-advisor-compodoc-storybook-uat-base` -> `019a26a...` | [OK] |
| EXPECTED_BASE (checkpoint branch SHA) | `019a26a6cf17fb4968791817eecfab14ec81b369` | captured |
| ACTUAL_BASE (worktree-scoped tip after add, pre-seed) | `019a26a6cf17fb4968791817eecfab14ec81b369` | [OK] |
| EXPECTED_BASE == ACTUAL_BASE | match | [OK] no drift |
| main-repo `rev-parse HEAD` (false-drift signal) | `2d4d9f0` (ngx live main; advanced from 13-05's `bad1aed`) | dispositioned (not our base) |

## Seed defect files (SAME shape as 13-01 / 13-05; byte-identical)

Both seeds were recovered VERBATIM from the original 13-01 seed commit `4fa7fd7`
(the commit object survives the `uat/phase-13-render` branch deletion until GC)
and confirmed byte-identical via `diff` (empty diff) BEFORE the R3 seed commit:

- `review-src/handler.ts` (reviewer, ~7 reviewable issues: implicit-any params/return; unguarded `JSON.parse(req.body)`; braceless `if`; dead `notified` branch; swallowed catch; missing-validation `validate` dereferencing `data.name`; no-op stubbed `sendAuditLog` TODO). `diff` vs `4fa7fd7:review-src/handler.ts` = empty (IDENTICAL).
- `review-src/disk-info.ts` (security, >=5 OWASP-taggable: command injection `exec('du -sh ' + path)` A03; path traversal `fsSize(path)` A01; hardcoded `API_TOKEN` A07; over-broad catch A09; secret+data over `http://` A02; outdated `systeminformation` pin A06; plus the missing-input-validation guard feeding both sinks). `diff` vs `4fa7fd7:review-src/disk-info.ts` = empty (IDENTICAL).

Each clears the fixtures' `MIN_FINDINGS=5` anti-vacuous floor.

Seed commit on `uat/phase-13-render-r3` ONLY: `cd1b9c8` (HEAD~1 == `019a26a`,
provenance preserved).

## Tampering incident caught + reverted (T-13-07-01)

During the seed commit a first attempt used a shared `--git-dir` + `-C <worktree>`
invocation that resolved HEAD against the MAIN ngx repo's index, creating a stray
commit `ec9cc92` on ngx `main` (parent `2d4d9f0`, containing ONLY the 2 seed files,
131 insertions, none of the user's work). This is precisely the T-13-07-01
tampering threat. It was caught by the isolation assertion (`ls-tree -r main`
showed the seeds) and SURGICALLY reverted:

- `git reset --mixed 2d4d9f0...` (from the main checkout) moved `main` back to
  `2d4d9f0`, removed the seeds from main's tree + index, and PRESERVED the user's
  pre-existing uncommitted working-tree modifications (`M package.json`,
  `M packages/.../project.json`, etc.) untouched.
- The stray commit `ec9cc92` is now dangling (GC-eligible); ngx `main` ref is
  restored to `2d4d9f0`; the seeds exist ONLY on `uat/phase-13-render-r3`.
- The corrected seed commit was then made from INSIDE the worktree (no `--git-dir`,
  no `-C`) -> `cd1b9c8` on `uat/phase-13-render-r3`.

ngx `main` is verified untouched (ref `2d4d9f0`; user's working-tree edits intact;
seeds absent from main's tree + index).

## Isolation assertion (SC-3)

[OK] The UAT worktree is on `uat/phase-13-render-r3`, NEVER on ngx `main`.
[OK] Seeds present on `uat/phase-13-render-r3` (`ls-tree -r` shows both).
[OK] Seeds ABSENT from ngx `main` (`ls-tree -r main` rg exit 1, after the T-13-07-01 revert).
[OK] Seeds ABSENT from THIS repo (bare `git status --porcelain` + `git ls-files` rg exit 1).
[OK] ngx `main` live working tree untouched (ref `2d4d9f0`; user's pre-existing edits preserved).

## `git worktree list` output (captured at R3 provisioning)

```
D:/projects/github/LayZeeDK/ngx-smart-components           2d4d9f0 [main]
D:/projects/github/LayZeeDK/ngx-smart-components-uat-13-r3 cd1b9c8 [uat/phase-13-render-r3]
```

-> The dedicated R3 worktree reads `[uat/phase-13-render-r3]` (tip `cd1b9c8`, off `019a26a`).
-> The ngx main worktree still reads `[main]` at `2d4d9f0` (live tree untouched).

## Teardown commands (Task 3, D-08 -- only after evidence custody)

By EXACT name (never a blanket loop -- ngx has stale `uat/*` branches):

```
git --git-dir=/d/projects/github/LayZeeDK/ngx-smart-components/.git worktree remove /d/projects/github/LayZeeDK/ngx-smart-components-uat-13-r3 --force
git --git-dir=/d/projects/github/LayZeeDK/ngx-smart-components/.git branch -D uat/phase-13-render-r3
```

Post-teardown asserts: ngx `worktree list` shows only `[main]` at `2d4d9f0`;
`rev-parse --verify uat/phase-13-render-r3` fails; ngx live tree untouched.
