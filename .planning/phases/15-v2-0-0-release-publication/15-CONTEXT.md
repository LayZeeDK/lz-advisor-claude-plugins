# Phase 15: v2.0.0 release & publication - Context

**Gathered:** 2026-06-14
**Status:** Ready for planning
**Mode:** `--auto --chain --analyze` (autonomous discuss, recommended option per gray area, auto-advance to plan)

<domain>
## Phase Boundary

Ship the `lz-` rename milestone (Phases 14 + 14.1 + 14.2) as **v2.0.0**: the atomic 5-surface version bump `1.0.1 -> 2.0.0` (REL-01), the `CHANGELOG.md [2.0.0]` entry with the old->new migration table + compare link and the plugin README "What's New" update (REL-02), and the `v2.0.0` git tag + GitHub Release (REL-03). The release flow goes through a **PR merged to `main` with a merge commit BEFORE** the tag and GitHub Release are created (user directive).

**In scope:** the 5-surface atomic `version` bump (REL-01); the CHANGELOG `[2.0.0]` entry + migration table + compare link + the README "What's New" 2.0.0 entry (REL-02); the PR `release/v2.0.0` -> `main` (merge commit), the `v2.0.0` annotated tag on the merge commit, and the published GitHub Release (REL-03).

**Out of scope:** any agent/skill persona, prompt, budget, or output-contract change (the milestone's behavior work shipped in Phases 14/14.1/14.2 and is frozen); any new skill/agent/feature; renaming eval filenames or workspace dirs (deferred housekeeping from Phase 14).

**Gate:** Phase 15 is gated on Phase 14 verification. RENAME-02 (interactive-picker bare-form de-shadow) was human-confirmed 2026-06-14; Phases 14.1 and 14.2 are complete and verified. The gate is satisfied -- release may proceed.
</domain>

<decisions>
## Implementation Decisions

### Release Sequencing & PR Merge (user directive: "open and merge a PR with merge commit before GitHub release and Git tag")
- **D-01:** Order of operations is **BUMP -> PR -> MERGE-COMMIT -> TAG -> RELEASE**. On `release/v2.0.0`: land the atomic 5-surface version bump (REL-01) + the `CHANGELOG.md [2.0.0]` entry + the README "What's New" 2.0.0 entry (REL-02) as commit(s). THEN open a PR `release/v2.0.0` -> `main` and merge it with a **merge commit**. THEN create the `v2.0.0` tag on the resulting **merge commit on `main`** (NOT the release-branch tip), push it to origin, and publish the GitHub Release (REL-03). Rationale: the user directive is explicit; the tag must point to the canonical main-line commit users land on, not a soon-to-be-merged branch tip. Precedent: v1.0.1 shipped via PR #1 merged to `main`.
- **D-02:** Merge method is a **true merge commit** (preserve branch topology) -- NOT squash, NOT rebase-merge. The release branch carries the full GSD planning history (`release/v2.0.0` is 46 commits ahead of `origin/main`); `main` already tracks `.planning/` (the `dc2e28d` quick-task commit lives on `main`), so a full merge is consistent with repo convention and loses no history. (`/gsd-pr-branch`'s planning-filtered PR branch is the REJECTED alternative -- the directive wants the branch merged, and `main` already contains planning artifacts.)
- **D-03:** The `v2.0.0` tag is **annotated** (matches the v1.0.0 / v1.0.1 precedent -- both annotated) and created post-merge on `main` at the merge commit; pushed via `git push origin v2.0.0`. Outward-facing / irreversible steps (PR merge, tag push, Release publish) are executed by the **orchestrator directly**, never delegated to a worktree-isolated executor (260613-u6l deviation precedent + global operating guidance on outward-facing actions).

### Atomic Version Bump (REL-01)
- **D-04:** The 5-surface bump `1.0.1 -> 2.0.0` covers `plugins/lz-advisor/.claude-plugin/plugin.json` `version` + the 4 `skills/lz-*/SKILL.md` `version:` fields (the post-rename `lz-plan`, `lz-execute`, `lz-review`, `lz-security-review` dirs). All 5 surfaces change together (established pattern: Phase 12 bumped 1.0.0 -> 1.0.1 atomically across the same 5 surfaces). The "all 5 agree" invariant is a completeness gate for the phase.

### CHANGELOG `[2.0.0]` Scope & Content (REL-02)
- **D-05:** The `[2.0.0]` entry documents ALL user-facing changes bundled into the release, not only the skill rename:
  1. **Changed / BREAKING (headline):** the `lz-` skill rename (`/plan` -> `/lz-plan`, etc.) -- carries the migration table; this is WHY the version is MAJOR.
  2. **Changed / BREAKING:** the `/lz-security-review` canonical 5-tier severity taxonomy (`Critical/High/Medium/Low/Informational` + a non-severity `### Open Questions`, omit-when-empty), replacing `Critical/Important/Suggestions/Questions` -- a breaking output-contract change for security-review consumers (Phase 14.1). `/lz-review` intentionally keeps its `Critical/Important/Suggestions/Questions` taxonomy (asymmetric divergence -- note this so consumers do not expect symmetry).
  3. **Changed:** the cross-skill provenance-marker label `**Verdict scope:**` -> `**Verdict axis:**` (Phase 14.2; the machine `scope: <enum>` token is unchanged).
  Rationale: a release changelog documents what shipped in the version; 14.1 is itself a breaking change and must be discoverable.
- **D-06:** Keep the existing CHANGELOG format: Keep a Changelog 1.1.0 + SemVer, newest-first, `## [2.0.0] - <publish date>`, with a bottom-of-file compare link `[2.0.0]: https://github.com/LayZeeDK/lz-advisor-claude-plugins/compare/v1.0.1...v2.0.0`. The `[1.0.1]` / `[1.0.0]` entries and their links are PRESERVED untouched -- CHANGELOG.md is the cumulative history.

### Migration Table (REL-02)
- **D-07:** The migration table maps old -> new in BOTH bare slash form AND qualified form, all four skills:

  | v1.0.1 (old) | v2.0.0 (new) |
  |---|---|
  | `/plan` | `/lz-plan` |
  | `/execute` | `/lz-execute` |
  | `/review` | `/lz-review` |
  | `/security-review` | `/lz-security-review` |
  | `lz-advisor:plan` | `lz-advisor:lz-plan` |
  | `lz-advisor:execute` | `lz-advisor:lz-execute` |
  | `lz-advisor:review` | `lz-advisor:lz-review` |
  | `lz-advisor:security-review` | `lz-advisor:lz-security-review` |

  Plus a one-line "why": the bare `/plan`, `/review`, `/security-review` shadowed Claude Code built-ins; the `lz-` prefix de-shadows them, and `/execute` was renamed too for suite consistency + `/lz-` autocomplete grouping. The same table (or a condensed prose form) is the core of the GitHub Release notes.

### Plugin README "What's New" (REL-02)
- **D-08:** **COLLAPSE** the plugin README `## What's New` to show ONLY the `### 2.0.0` entry -- REMOVE the `### 1.0.1` and `### 1.0.0` entries. The 2.0.0 entry summarizes the breaking rename (with the new `/lz-*` names) + the canonical-severity migration, and points to `CHANGELOG.md` for the full migration table. Rationale: memory `feedback_release_readme_current_version_only` -- at a major/stable release the README "What's New" is self-contained on the current version, not an accumulating prerelease changelog. **Caveat (flagged):** this DELETES the 1.0.1 / 1.0.0 README entries; they remain in `CHANGELOG.md` and the published GitHub Releases, so no history is lost.

### GitHub Release Metadata (REL-03)
- **D-09:** The GitHub Release is created on tag `v2.0.0`, title `v2.0.0 - Prefixed skill names` (matches the milestone name), marked **Latest** (`--latest`, demoting v1.0.1's Latest badge). Notes derived from the `CHANGELOG.md [2.0.0]` section (including the migration table). Recipe template: quick task `260613-u6l` (annotated tag + `gh release create` + Latest verification via `gh release list`).

### Claude's Discretion
- Commit breakdown of the pre-PR work (whether REL-01 bump, the CHANGELOG entry, and the README "What's New" are one commit or three) -- planner decides. Invariant: all of REL-01 + REL-02 are committed on `release/v2.0.0` and captured by the PR before merge.
- The exact `[2.0.0]` / Release date string -- use the actual publish date.
- Whether GitHub Release notes are written inline or via `--notes-file` from the CHANGELOG section.
- PR title/body wording.

### Reviewed Todos (not folded)
- **Research RTK command suitability for skills and agents** (`research-rtk-command-suitability-for-skills-and-agents.md`, area: plugin-tooling, score 0.6) -- REVIEWED, **NOT folded**. The match was generic keyword overlap; the todo concerns whether `rtk git diff` / `rtk gh pr diff` belong inside the review/security-review skills (token-savings vs detail-loss) -- orthogonal to publishing a release. Folding it would violate the phase scope guardrail. Remains a backlog item (STATE.md Deferred Items); same disposition as Phase 14.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Roadmap (locked scope)
- `.planning/REQUIREMENTS.md` -- REL-01..03 requirement text + the Locked Decisions table (tag + Release in scope; v2.0.0 MAJOR rationale for the breaking invocation-surface change).
- `.planning/ROADMAP.md` -- Phase 15 goal + the 3 success criteria (5-surface bump; CHANGELOG migration table + README "What's New"; tag pushed + GitHub Release).
- `.planning/PROJECT.md` -- current milestone v2.0.0 state and the locked decisions (all-four-rename incl. `execute`; v2.0.0 MAJOR; Fable advisor descoped).

### Release artifacts to edit (grounded by inspection)
- `CHANGELOG.md` (repo root) -- Keep a Changelog 1.1.0 format, compare-link footer; append the `[2.0.0]` entry + migration table + compare link (D-05/D-06/D-07). Existing `[1.0.1]`/`[1.0.0]` entries preserved.
- `plugins/lz-advisor/README.md` -- `## What's New` (collapse to 2.0.0-only per D-08); the Skills table is already `/lz-*` (Phase 14).
- `plugins/lz-advisor/.claude-plugin/plugin.json` -- `version` (surface 1 of 5).
- `plugins/lz-advisor/skills/lz-plan/SKILL.md`, `.../lz-execute/SKILL.md`, `.../lz-review/SKILL.md`, `.../lz-security-review/SKILL.md` -- the `version:` fields (surfaces 2-5 of 5).

### Precedent / recipe
- `.planning/quick/260613-u6l-add-changelog-md-v1-0-0-v1-0-1-and-creat/260613-u6l-SUMMARY.md` -- the PROVEN release recipe: annotated tag, `gh release create`, `--latest` flag, compare-link format, and the "orchestrator runs outward-facing steps directly" deviation. Directly templates REL-03.
- `.planning/phases/14-lz-skill-rename/14-CONTEXT.md` -- the rename decisions (old->new bare/qualified forms feeding the migration table, D-07).
- `.planning/phases/14.1-lz-security-review-canonical-severities-critical-high-medium/14.1-CONTEXT.md` -- the canonical 5-tier severity migration (feeds the CHANGELOG 14.1 line, D-05 item 2).
- `.planning/phases/14.2-verdict-scope-marker-label-rename/14.2-CONTEXT.md` -- the Verdict scope -> Verdict axis label rename (feeds the CHANGELOG 14.2 line, D-05 item 3).

### Memory / conventions
- memory `feedback_release_readme_current_version_only` -- the "What's New" collapse-to-current-version rule (D-08).
- memory `feedback_version_numbers_not_load_bearing_prerelease` -- NOT relevant here: this is the real stable release, so SemVer rigor + the 5-surface atomic sync DO apply.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **The 260613-u6l release recipe** (annotated tag + `gh release create` + `--latest` + compare-link footer + `gh release list` verification) directly templates REL-03 -- reuse its shape rather than inventing a new release procedure.
- **The Phase 12 5-surface atomic bump** (1.0.0 -> 1.0.1 across `plugin.json` + 4 `SKILL.md` `version:` fields in one commit) directly templates REL-01.
- **The existing `CHANGELOG.md`** already carries the Keep a Changelog 1.1.0 + SemVer scaffold, newest-first ordering, and the bottom-of-file `[ver]: .../compare/...` link pattern -- the `[2.0.0]` entry slots in at the top + one new compare link at the bottom.

### Established Patterns
- **PR-to-`main`-then-tag:** v1.0.1 shipped via PR #1 merged to `main`; v2.0.0 repeats the pattern with a merge commit (D-01/D-02).
- **5-surface version-sync invariant:** `plugin.json` + the 4 `SKILL.md` `version:` fields must all read the same version; divergence is a release defect (completeness gate).
- **Pathspec-scoped outward-facing safety:** tag/release/merge steps run from the orchestrator, not a subagent worktree (260613-u6l).

### Integration Points
- Claude Code reads `plugin.json` `version` for marketplace metadata; the 4 `SKILL.md` `version:` fields are per-skill display/metadata. They are independent files that must be bumped in lockstep.
- The `v2.0.0` tag must resolve to the merge commit on `main` so the GitHub Release (which is created from the tag) reflects the canonical released tree.
- `release/v2.0.0` is currently 46 commits ahead of `origin/main`; `main` last landed `7af29c5` (the v1.0.0/v1.0.1 CHANGELOG quick task). Remote `origin` = `github.com/LayZeeDK/lz-advisor-claude-plugins`; existing tags on origin: `v1.0.0`, `v1.0.1`.
</code_context>

<specifics>
## Specific Ideas

- **User directive (verbatim intent):** open and merge a PR with a **merge commit** BEFORE creating the GitHub Release and the Git tag. The tag therefore points to the main-line merge commit, not the release-branch tip (D-01/D-02/D-03).
- `2.0.0` is the MAJOR bump because the public skill invocation surface changed (breaking) -- the bare `/plan`, `/review`, `/security-review` no longer resolve to this plugin's skills.
- The release bundles three milestone changes (rename + canonical severities + Verdict axis label); the CHANGELOG documents all three, with the rename as the headline (D-05).
</specifics>

<deferred>
## Deferred Ideas

- **Renaming eval filenames / workspace directories** (`lz-advisor-plan-eval.json`, `plan-workspace/`, ...) to the `lz-`-prefixed form -- carried forward from Phase 14 as optional housekeeping; not required for the release and not part of REL-01..03.

### Reviewed Todos (not folded)
- **Research RTK command suitability for skills and agents** (`research-rtk-command-suitability-for-skills-and-agents.md`, area: plugin-tooling, match score 0.6) -- REVIEWED, **NOT folded**. Generic keyword match; orthogonal to a release/publication phase (it is about `rtk git diff` / `rtk gh pr diff` inside the review skills). Folding would violate the scope guardrail. Stays a backlog item (STATE.md Deferred Items).

</deferred>

---

*Phase: 15-v2-0-0-release-publication*
*Context gathered: 2026-06-14*
