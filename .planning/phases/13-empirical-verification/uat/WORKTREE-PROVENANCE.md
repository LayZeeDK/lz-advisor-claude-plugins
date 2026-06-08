# Phase 13 UAT Worktree Provenance (SC-3)

> Records the dedicated ngx-smart-components worktree provisioning for the
> GATE-02 empirical-verification UAT. Proves the worktree was created off the
> user-confirmed checkpoint branch (never ngx `main`) with a verified
> EXPECTED_BASE == ACTUAL_BASE match (D-06 / D-07).

**Provisioned:** 2026-06-08 (Plan 13-01, Task 1)

## Checkpoint base (D-06 PLAN-TIME RESOLUTION)

- Confirmed checkpoint branch: `lz-advisor-compodoc-storybook-uat-base`
- EXPECTED_BASE SHA: `019a26a6cf17fb4968791817eecfab14ec81b369` (short `019a26a`)
- The spec name `uat/pre-storybook-compodoc` DOES NOT EXIST and was NEVER used.

## Throwaway worktree

- Path (sibling, outside both repos): `/d/projects/github/LayZeeDK/ngx-smart-components-uat-13`
- New throwaway branch: `uat/phase-13-render`
- Created via: `git --git-dir=/d/projects/github/LayZeeDK/ngx-smart-components/.git worktree add -b uat/phase-13-render /d/projects/github/LayZeeDK/ngx-smart-components-uat-13 lz-advisor-compodoc-storybook-uat-base`
- This is a MANUAL `git worktree add` against the EXTERNAL ngx repo (D-06) -- NOT a Claude Code `isolation: worktree` subagent.

## Base-drift defense (D-07)

A manual `git worktree add` with an explicit start-point does NOT drift to
`origin/HEAD`, so the EXPECTED_BASE check is belt-and-suspenders. Had it
drifted, the documented correction is `git -C <wt> merge --ff-only <EXPECTED_BASE>`
(NEVER `reset --soft`, which leaves stale files).

| Check | Value | Verdict |
|-------|-------|---------|
| Checkpoint branch exists (asserted BEFORE worktree add) | `lz-advisor-compodoc-storybook-uat-base` printed | [OK] |
| EXPECTED_BASE (checkpoint branch SHA) | `019a26a6cf17fb4968791817eecfab14ec81b369` | captured |
| ACTUAL_BASE (worktree HEAD after add) | `019a26a6cf17fb4968791817eecfab14ec81b369` | [OK] |
| EXPECTED_BASE == ACTUAL_BASE | match | [OK] no drift |

## Isolation assertion (SC-3)

[OK] The UAT worktree is on `uat/phase-13-render`, NEVER on ngx `main`.
The ngx `main` live working tree was untouched by this provisioning.

## `git worktree list` output (captured at provisioning)

```
D:/projects/github/LayZeeDK/ngx-smart-components        bad1aed [main]
D:/projects/github/LayZeeDK/ngx-smart-components-uat-13 019a26a [uat/phase-13-render]
```

-> The dedicated worktree reads `[uat/phase-13-render]` off `019a26a`.
-> The ngx main worktree still reads `[main]` (live tree untouched).

## Teardown note (D-08)

This worktree is torn down in Plan 13-03 AFTER all UAT captures are extracted
into this repo's `.planning/phases/13-empirical-verification/uat/` evidence
directory:

```
git --git-dir=/d/projects/github/LayZeeDK/ngx-smart-components/.git worktree remove /d/projects/github/LayZeeDK/ngx-smart-components-uat-13 --force
git --git-dir=/d/projects/github/LayZeeDK/ngx-smart-components/.git branch -D uat/phase-13-render
```
