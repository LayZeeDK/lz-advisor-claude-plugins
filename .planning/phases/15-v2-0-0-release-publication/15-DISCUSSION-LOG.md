# Phase 15: v2.0.0 release & publication - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md -- this log preserves the alternatives considered.

**Date:** 2026-06-14
**Phase:** 15-v2-0-0-release-publication
**Mode:** `--auto --chain --analyze` (autonomous; recommended option per area; trade-off tables logged for audit)
**Areas discussed:** Release sequencing & PR merge, Atomic version bump, CHANGELOG scope, Migration table, README "What's New", GitHub Release metadata

---

## Release Sequencing & PR Merge (user directive)

| Option | Description | Selected |
|--------|-------------|----------|
| Tag release-branch tip, then merge | Fewer steps; tag points at the soon-merged branch tip | |
| BUMP -> PR -> MERGE-COMMIT -> TAG (on merge commit) -> RELEASE | Tag = canonical main-line commit; preserves phase topology; matches v1.0.1 PR #1 | [x] |
| Squash-merge then tag | Clean single commit on main; discards GSD planning history (inconsistent -- main tracks `.planning/`) | |

**User's choice:** Merge-commit flow -- explicit user directive: "open and merge a PR with merge commit before GitHub release and Git tag". Tag points to the merge commit on `main`.
**Notes:** v1.0.1 shipped via PR #1 merged to `main` (precedent). `release/v2.0.0` is 46 commits ahead of `origin/main`; `main` already tracks `.planning/`, so a true merge commit loses no history (D-01/D-02/D-03).

---

## Atomic Version Bump (REL-01)

| Option | Description | Selected |
|--------|-------------|----------|
| One atomic 5-surface commit | `plugin.json` + 4 `SKILL.md` `version:` bumped together (Phase 12 pattern) | [x] |
| Per-file bumps | Separate commits per surface | |

**User's choice:** One atomic 5-surface bump `1.0.1 -> 2.0.0` (recommended default).
**Notes:** Established Phase 12 pattern; the "all 5 agree" invariant is the phase completeness gate (D-04).

---

## CHANGELOG `[2.0.0]` Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Skill rename only | Literal REL-02 reading | |
| All 2.0.0 changes | Rename (headline) + 14.1 canonical severities + 14.2 Verdict axis | [x] |

**User's choice:** Document all three milestone changes, rename as the headline (recommended default).
**Notes:** 14.1 is itself a breaking output-contract change for security-review consumers and must be discoverable; `/lz-review` keeps its taxonomy (asymmetric divergence noted) (D-05/D-06).

---

## Migration Table (REL-02)

| Option | Description | Selected |
|--------|-------------|----------|
| Bare forms only | `/plan` -> `/lz-plan` etc. | |
| Bare AND qualified forms | adds `lz-advisor:plan` -> `lz-advisor:lz-plan` etc. | [x] |

**User's choice:** Both bare and qualified, all four skills + a one-line "why" (recommended default; matches REQUIREMENTS REL-02 "bare AND qualified forms").
**Notes:** Same table is the core of the GitHub Release notes (D-07).

---

## Plugin README "What's New"

| Option | Description | Selected |
|--------|-------------|----------|
| Append 2.0.0 above 1.0.1/1.0.0 | Accumulating changelog in README | |
| Collapse to 2.0.0-only | Self-contained on current version; full history in CHANGELOG.md | [x] |

**User's choice:** Collapse to 2.0.0-only (recommended -- memory `feedback_release_readme_current_version_only`).
**Notes:** CAVEAT flagged -- this deletes the 1.0.1/1.0.0 README entries; they survive in CHANGELOG.md + the published GitHub Releases (D-08).

---

## GitHub Release Metadata (REL-03)

| Option | Description | Selected |
|--------|-------------|----------|
| Annotated tag, `--latest`, notes from CHANGELOG `[2.0.0]` | Matches 260613-u6l recipe | [x] |
| Lightweight tag / not-Latest | Diverges from v1.0.0/v1.0.1 precedent | |

**User's choice:** Annotated `v2.0.0` tag on the merge commit, Release marked Latest (demotes v1.0.1), title `v2.0.0 - Prefixed skill names`, notes from CHANGELOG (recommended default).
**Notes:** Recipe = quick task 260613-u6l; outward-facing steps run from the orchestrator, not a subagent worktree (D-03/D-09).

---

## Claude's Discretion

- Commit breakdown of the pre-PR work (REL-01 bump / CHANGELOG / README as one commit or three) -- planner decides; invariant is all of REL-01+REL-02 on `release/v2.0.0` before merge.
- Exact `[2.0.0]` / Release date string -- use the publish date.
- GitHub Release notes inline vs `--notes-file`.
- PR title/body wording.

## Deferred Ideas

- Renaming eval filenames / workspace directories to `lz-*` -- optional housekeeping carried from Phase 14; not release scope.
- Research RTK command suitability for skills/agents (todo, score 0.6) -- REVIEWED, NOT folded (orthogonal to a release phase; scope-guardrail). Stays backlog.
