---
quick_id: 260613-u6l
description: Add CHANGELOG.md (v1.0.0 + v1.0.1) and create GitHub releases for v1.0.0 and v1.0.1
date: 2026-06-13
status: complete
commit: dc2e28d
---

# Quick Task 260613-u6l - Summary

## Outcome

Authored `CHANGELOG.md`, renamed the initial-version tag `v1.0` -> `v1.0.0`, and
published GitHub releases for both shipped versions. All three planned tasks done.

## What changed

### Task 1 - CHANGELOG.md (committed `dc2e28d`)

- New `CHANGELOG.md` at the repo root in Keep a Changelog 1.1.0 + SemVer format,
  newest version first.
- `[1.0.1] - 2026-06-11` (Changed): the severity-headline review-report grammar
  overhaul -- `/review` and `/security-review` group findings under spelled-out
  `### Critical` / `### Important` / `### Suggestions` / `### Questions` headlines,
  continuous numbering, `(none)` markers, OWASP `[Axx]` preserved.
- `[1.0.0] - 2026-06-01` (Added): initial stable release -- four advisor-strategy
  skills (`/plan`, `/execute`, `/review`, `/security-review`), three Opus agents
  (`advisor`, `reviewer`, `security-reviewer`), verification-chain integrity,
  per-section output budgets, change-surface-matched verification, zero external
  dependencies, marketplace install.
- Bottom-of-file compare/tag links target the renamed tags (`v1.0.0`, `v1.0.1`).
- Content distilled from `plugins/lz-advisor/README.md` "What's New" + "Skills"
  (canonical end-user descriptions) and `.planning/MILESTONES.md`.

### Task 2 - Tag rename v1.0 -> v1.0.0 (user-authorized, outward-facing)

- Created annotated `v1.0.0` at commit `84f6e77` (same MVP commit `v1.0` pointed to).
- Deleted `v1.0` locally and on origin; pushed `v1.0.0`.
- Remote tag set is now exactly `{v1.0.0, v1.0.1}` -- verified via `git ls-remote --tags`.
- Rationale: aligns the git tag with the `1.0.0` package version. User selected
  "Rename v1.0 -> v1.0.0" over the lower-risk "use existing v1.0 tag" option.

### Task 3 - GitHub releases (outward-facing)

- `v1.0.0 - MVP` -- published on tag `v1.0.0`, `--latest=false`.
  https://github.com/LayZeeDK/lz-advisor-claude-plugins/releases/tag/v1.0.0
- `v1.0.1 - Severity-headline review reports` -- published on tag `v1.0.1`, marked
  **Latest**.
  https://github.com/LayZeeDK/lz-advisor-claude-plugins/releases/tag/v1.0.1
- Release notes derived from the CHANGELOG sections; verified via `gh release list`
  (v1.0.1 shows the Latest badge).

## Deviation from the default quick workflow

Outward-facing / irreversible steps (deleting a published tag, creating GitHub
releases) were executed by the orchestrator directly rather than delegated to a
worktree-isolated `gsd-executor`, per global operating guidance on controlling
outward-facing actions. GSD tracking guarantees were preserved (PLAN.md, an atomic
content commit for the CHANGELOG, this SUMMARY.md, and the STATE.md row).

## Verification

- `CHANGELOG.md` present at repo root; both versions, correct dates, links to the
  renamed tags.
- `git ls-remote --tags origin` -> `v1.0.0` + `v1.0.1`, no `v1.0`.
- `gh release list` -> both releases present; `v1.0.1` is Latest.

## Follow-ups

- None required. Note: the repo no longer has a `v1.0` tag; any external reference
  to `v1.0` should be updated to `v1.0.0`.
