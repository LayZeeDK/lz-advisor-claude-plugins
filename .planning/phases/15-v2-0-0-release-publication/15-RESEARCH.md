# Phase 15: v2.0.0 release & publication - Research

**Researched:** 2026-06-14
**Domain:** Software release mechanics -- SemVer version bump, Keep a Changelog authoring, GitHub PR merge + git tag + GitHub Release publication
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Order of operations is **BUMP -> PR -> MERGE-COMMIT -> TAG -> RELEASE**. On `release/v2.0.0`: land the atomic 5-surface version bump (REL-01) + the `CHANGELOG.md [2.0.0]` entry + the README "What's New" 2.0.0 entry (REL-02) as commit(s). THEN open a PR `release/v2.0.0` -> `main` and merge it with a **merge commit**. THEN create the `v2.0.0` tag on the resulting **merge commit on `main`** (NOT the release-branch tip), push it to origin, and publish the GitHub Release (REL-03). The tag must point to the canonical main-line commit. Precedent: v1.0.1 shipped via PR #1 merged to `main`.
- **D-02:** Merge method is a **true merge commit** (preserve branch topology) -- NOT squash, NOT rebase-merge. `release/v2.0.0` carries the full GSD planning history (48 commits ahead of `origin/main` at research time); `main` already tracks `.planning/`, so a full merge loses no history and is consistent with repo convention. (`/gsd-pr-branch`'s planning-filtered PR branch is the REJECTED alternative.)
- **D-03:** The `v2.0.0` tag is **annotated** (matches v1.0.0 / v1.0.1) and created post-merge on `main` at the merge commit; pushed via `git push origin v2.0.0`. Outward-facing / irreversible steps (PR merge, tag push, Release publish) are executed by the **orchestrator directly**, never delegated to a worktree-isolated executor (260613-u6l deviation precedent).
- **D-04:** The 5-surface bump `1.0.1 -> 2.0.0` covers `plugins/lz-advisor/.claude-plugin/plugin.json` `version` + the 4 `skills/lz-*/SKILL.md` `version:` fields (post-rename `lz-plan`, `lz-execute`, `lz-review`, `lz-security-review` dirs). All 5 change together. "All 5 agree" is the completeness gate.
- **D-05:** The `[2.0.0]` entry documents ALL three bundled user-facing changes: (1) the `lz-` skill rename (headline/BREAKING, carries migration table); (2) the `/lz-security-review` canonical 5-tier severity migration (BREAKING output-contract); (3) the `**Verdict scope:**` -> `**Verdict axis:**` label rename (cosmetic). `/lz-review` intentionally KEEPS `Critical/Important/Suggestions/Questions` (asymmetric divergence -- note so consumers do not expect symmetry).
- **D-06:** Keep a Changelog 1.1.0 + SemVer, newest-first, `## [2.0.0] - <publish date>`, bottom-of-file compare link `[2.0.0]: https://github.com/LayZeeDK/lz-advisor-claude-plugins/compare/v1.0.1...v2.0.0`. The `[1.0.1]` / `[1.0.0]` entries and links are PRESERVED untouched.
- **D-07:** The migration table maps old -> new in BOTH bare slash form AND qualified form, all four skills. Plus a one-line "why". The same table (or condensed prose) is the core of the Release notes.
- **D-08:** **COLLAPSE** the plugin README `## What's New` to show ONLY `### 2.0.0` -- REMOVE `### 1.0.1` and `### 1.0.0`. 2.0.0 entry summarizes the breaking rename + canonical-severity migration, points to `CHANGELOG.md` for the full migration table. **Caveat (flagged):** this DELETES the 1.0.1 / 1.0.0 README entries; they remain in `CHANGELOG.md` and the published GitHub Releases, so no history is lost.
- **D-09:** GitHub Release created on tag `v2.0.0`, title `v2.0.0 - Prefixed skill names`, marked **Latest** (`--latest`, demoting v1.0.1's Latest badge). Notes derived from the `CHANGELOG.md [2.0.0]` section. Recipe template: quick task `260613-u6l`.

### Claude's Discretion

- Commit breakdown of the pre-PR work (REL-01 bump + CHANGELOG entry + README "What's New" -- one commit or three). Invariant: all of REL-01 + REL-02 committed on `release/v2.0.0` and captured by the PR before merge.
- The exact `[2.0.0]` / Release date string -- use the actual publish date.
- Whether GitHub Release notes are written inline or via `--notes-file` from the CHANGELOG section.
- PR title/body wording.

### Deferred Ideas (OUT OF SCOPE)

- **Renaming eval filenames / workspace directories** (`lz-advisor-plan-eval.json`, `plan-workspace/`, ...) to the `lz-`-prefixed form -- carried from Phase 14 as optional housekeeping; not required and not part of REL-01..03.
- **Research RTK command suitability for skills and agents** -- REVIEWED, NOT folded (orthogonal to a release/publication phase). Stays a backlog item (STATE.md Deferred Items).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| REL-01 | Plugin version is `2.0.0` across all 5 surfaces (`plugin.json` + 4 `SKILL.md` `version:` fields), bumped atomically. | 5 surfaces located + line numbers verified (Standard Stack > Version Surfaces). Single `git grep` completeness assertion designed (5-Surface Atomicity Check). Phase 12 precedent (same 5 surfaces, atomic). |
| REL-02 | `CHANGELOG.md` `[2.0.0]` entry documents the breaking rename with a migration table (old -> new, bare AND qualified) + compare link; plugin README "What's New" shows the 2.0.0 entry. | Keep a Changelog 1.1.0 subsection conventions verified against keepachangelog.com (CHANGELOG Content Shape). Existing CHANGELOG.md + README inspected; compare-link format confirmed. Migration table shape from D-07. README collapse grounded in D-08 + v1.0.1 precedent. |
| REL-03 | A `v2.0.0` git tag is pushed to origin and a GitHub Release is published with the `[2.0.0]` notes. | End-to-end command sequence with exact `gh pr merge --merge` / `git tag -a` / `gh release create --latest --notes-file` flags verified against cli.github.com manual (Release Mechanics). 260613-u6l recipe templates the tag + release steps. |
</phase_requirements>

## Summary

This is **release mechanics for a docs/metadata-only change** -- there is no application code to build, test, or compile. The entire phase is: (1) an atomic 5-surface SemVer bump `1.0.1 -> 2.0.0`; (2) authoring a Keep a Changelog `[2.0.0]` entry + a plugin-README "What's New" collapse; (3) shipping it through a PR merged to `main` with a **true merge commit**, then tagging the merge commit and publishing a GitHub Release. Every mechanic here has a directly applicable in-repo precedent: the Phase 12 5-surface atomic bump (REL-01), the existing Keep a Changelog 1.1.0 `CHANGELOG.md` scaffold (REL-02), and the proven `260613-u6l` release recipe (annotated tag + `gh release create --latest` + `gh release list` verification, REL-03).

The one mechanic without a verbatim precedent is the **merge-commit-before-tag sequencing** (user directive D-01). The risk surface is small and well-understood: the tag must point to the **merge commit on `main`**, not the release-branch tip. Because `release/v2.0.0` is a clean linear descendant of `origin/main` (verified: `origin/main` IS an ancestor of HEAD, merge-base == `7af29c5` == `origin/main` HEAD, zero divergence), the PR merges without conflict, and a true merge commit (`--no-ff`) produces exactly one new commit on `main` that is the canonical tag target.

**Primary recommendation:** Execute the linear sequence BUMP -> commit -> PR -> `gh pr merge --merge` -> sync local `main` -> annotated tag on the merge commit -> push tag -> `gh release create v2.0.0 --latest --notes-file <changelog-slice> --target <merge-sha>`. The orchestrator runs all outward-facing steps directly (D-03). Verify with `git ls-remote --tags origin` and `gh release list`. Do not over-engineer -- there is no test suite to gate, only artifact-shape and version-sync assertions.

## Architectural Responsibility Map

This phase has no runtime application tiers. The "tiers" are the publication surfaces and who owns each action.

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| 5-surface version bump (REL-01) | Local working tree (Edit) | git commit on `release/v2.0.0` | Pure file edits; no build artifact regenerates from version strings. |
| CHANGELOG + README authoring (REL-02) | Local working tree (Write/Edit) | git commit on `release/v2.0.0` | Markdown docs; committed before the PR so the PR captures them. |
| PR open + merge (D-01/D-02) | GitHub (remote) via `gh` | Local `main` sync after | Outward-facing -- orchestrator runs directly (D-03). Merge commit lands on `origin/main`. |
| Annotated tag (REL-03) | Local git -> pushed to `origin` | -- | Tag is created locally ON the merge commit, then pushed. Must NOT be created before the merge lands. |
| GitHub Release (REL-03) | GitHub (remote) via `gh` | Reads tag + CHANGELOG slice | Outward-facing -- orchestrator runs directly (D-03). `--latest` demotes v1.0.1. |

## Standard Stack

This phase uses only command-line tooling already installed and verified in this environment. No packages are installed.

### Core Tooling

| Tool | Version (verified) | Purpose | Why Standard |
|------|--------------------|---------|--------------|
| `git` | 2.54.0.windows.1 `[VERIFIED: git --version]` | Commit the bump/docs; create + push the annotated tag; sync local `main` | Native VCS; annotated-tag precedent (v1.0.0/v1.0.1 both annotated). |
| `gh` (GitHub CLI) | 2.86.0 (2026-01-21) `[VERIFIED: gh --version]` | Open + merge the PR; publish the GitHub Release | The `260613-u6l` recipe uses `gh release create`; PR #1 precedent. |

### Version Surfaces (the 5 surfaces for REL-01, line numbers verified)

| # | Surface | Field | Current | Verified |
|---|---------|-------|---------|----------|
| 1 | `plugins/lz-advisor/.claude-plugin/plugin.json` | `"version": "1.0.1"` | 1.0.1 | `[VERIFIED: Read, line 3]` |
| 2 | `plugins/lz-advisor/skills/lz-plan/SKILL.md` | `version: 1.0.1` | 1.0.1 | `[VERIFIED: git grep, line 18]` |
| 3 | `plugins/lz-advisor/skills/lz-execute/SKILL.md` | `version: 1.0.1` | 1.0.1 | `[VERIFIED: git grep, line 19]` |
| 4 | `plugins/lz-advisor/skills/lz-review/SKILL.md` | `version: 1.0.1` | 1.0.1 | `[VERIFIED: git grep, line 19]` |
| 5 | `plugins/lz-advisor/skills/lz-security-review/SKILL.md` | `version: 1.0.1` | 1.0.1 | `[VERIFIED: git grep, line 20]` |

Note the `version:` line number differs per file (18 vs 19 vs 20); the Edit tool matches on the unique `version: 1.0.1` string, so the exact line is not load-bearing for the edit, but the planner should not assume a single line number across files.

### Alternatives Considered

| Instead of | Could Use | Tradeoff / Why Not |
|------------|-----------|--------------------|
| `gh pr merge --merge` | `--squash` / `--rebase` | REJECTED by D-02. Squash collapses the 48-commit planning history into one commit; rebase rewrites SHAs and produces no merge commit. The directive requires a true merge commit so the tag points to a canonical merge node. |
| `gh pr merge --merge` | manual `git merge --no-ff` + `git push origin main` | Would bypass the PR entirely. D-01 requires a PR (`gh pr create` then `gh pr merge`). Use the PR path; it produces an equivalent `--no-ff` merge commit AND a PR record. |
| `gh release create ... --notes-file` | `--notes "<inline>"` | Discretion (D-09). `--notes-file` is preferred on this platform: CLAUDE.md bans multi-line inline strings / heredocs, and a long migration-table body inline would violate that. Write the slice to a temp file with the Write tool, pass `-F`. |
| annotated tag on merge commit | lightweight tag, or tag on branch tip | REJECTED. D-03 mandates annotated (matches v1.0.0/v1.0.1). Tag on branch tip is the headline failure mode (see Risks) -- it must be the merge commit. |

**Installation:** none -- all tooling pre-installed and verified. No `## Package Legitimacy Audit` section is required for this phase (zero external packages installed).

## Release Mechanics: Recommended End-to-End Command Sequence

This is the heart of the phase. All commands are Git Bash-compatible (per CLAUDE.md the Bash tool runs Git Bash). The orchestrator runs steps 3-7 directly (D-03). Replace `<DATE>` with the actual publish date and `<MERGE_SHA>` with the captured merge-commit SHA.

**Verified preconditions (research time):**
- `git branch --show-current` -> `release/v2.0.0` `[VERIFIED]`
- `git status --porcelain` -> empty (clean tree) `[VERIFIED]`
- `git merge-base --is-ancestor origin/main HEAD` -> true (clean fast-forward; PR merges without conflict) `[VERIFIED]`
- `git merge-base origin/main HEAD` == `7af29c5` == `origin/main` HEAD (zero divergence) `[VERIFIED]`
- Remote tags: exactly `{v1.0.0, v1.0.1}`; no `v2.0.0` yet `[VERIFIED: git ls-remote --tags origin]`
- `mergeCommitAllowed: true` on the repo (so `--merge` is accepted, not rejected by branch protection) `[VERIFIED: gh repo view --json mergeCommitAllowed]`

### Step 1 -- Edit the 5 version surfaces + CHANGELOG + README (executor or orchestrator)

Edit surfaces 1-5 from `1.0.1` -> `2.0.0`. Author the CHANGELOG `[2.0.0]` entry (prepend above `## [1.0.1]`; add the compare link at the bottom). Collapse the README `## What's New` to `### 2.0.0` only. (Content shapes below.)

### Step 2 -- Commit on `release/v2.0.0` (NEVER `git add .`)

```bash
git add plugins/lz-advisor/.claude-plugin/plugin.json \
        plugins/lz-advisor/skills/lz-plan/SKILL.md \
        plugins/lz-advisor/skills/lz-execute/SKILL.md \
        plugins/lz-advisor/skills/lz-review/SKILL.md \
        plugins/lz-advisor/skills/lz-security-review/SKILL.md \
        CHANGELOG.md \
        plugins/lz-advisor/README.md
git commit -m "chore(release): v2.0.0 -- atomic 5-surface bump + CHANGELOG + README"
```

Stage files by name (CLAUDE.md: never `git add .`). Commit breakdown is Claude's discretion (D-09) -- one commit or three; the invariant is all 7 files land on `release/v2.0.0` before the PR.

### Step 3 -- Push the branch and open the PR (orchestrator, outward-facing)

```bash
git push -u origin release/v2.0.0
gh pr create --base main --head release/v2.0.0 \
  --title "Milestone v2.0.0: Prefixed skill names" \
  --body-file <pr-body-file>      # write PR body via Write tool; CLAUDE.md bans inline multi-line
```

`--body-file` avoids inline multi-line strings. PR title/body wording is discretion (D-09).

### Step 4 -- Merge with a TRUE MERGE COMMIT (orchestrator, outward-facing)

```bash
gh pr merge release/v2.0.0 --merge --delete-branch=false
```

`-m, --merge` creates a true merge commit (`--no-ff`), preserving all individual commits + branch topology `[CITED: cli.github.com/manual/gh_pr_merge; docs.github.com about-merge-methods]`. Do NOT pass `--squash`/`--rebase` (D-02). `--delete-branch=false` keeps the release branch around until the release is verified (delete later if desired). Optionally pass `--subject`/`--body` to customize the merge commit message.

### Step 5 -- Sync local `main` to the merged state and capture the merge SHA (orchestrator)

```bash
git checkout main
git pull --ff-only origin main        # fast-forward local main to the merge commit
MERGE_SHA=$(git rev-parse HEAD)       # this is the merge commit -- the tag target
git log --oneline -1                  # sanity: confirms the merge commit subject
```

`--ff-only` is correct here: after the remote merge, local `main` is strictly behind origin and fast-forwards cleanly. (Do not use `git reset --hard` -- usually blocked by the permission classifier and unnecessary.)

### Step 6 -- Create the ANNOTATED tag ON THE MERGE COMMIT and push it (orchestrator, outward-facing)

```bash
git tag -a v2.0.0 <MERGE_SHA> -m "v2.0.0 - Prefixed skill names"
git push origin v2.0.0
```

Tag is annotated (`-a`, D-03), points explicitly at `<MERGE_SHA>` (the merge commit, NOT the branch tip -- this is the headline safety). Matches the v1.0.0/v1.0.1 annotated-tag precedent. Verify the tag target before pushing: `git rev-list -n1 v2.0.0` should equal `<MERGE_SHA>`.

### Step 7 -- Publish the GitHub Release (orchestrator, outward-facing)

```bash
# Write the [2.0.0] CHANGELOG slice (heading body + migration table) to a temp file
# using the Write tool, then:
gh release create v2.0.0 \
  --title "v2.0.0 - Prefixed skill names" \
  --notes-file <release-notes-file> \
  --target "$MERGE_SHA" \
  --latest \
  --verify-tag
```

`--latest` marks v2.0.0 as Latest, demoting v1.0.1 (D-09) `[CITED: cli.github.com/manual/gh_release_create]`. `--notes-file` (`-F`) reads notes from a file (CLAUDE.md bans inline multi-line) `[CITED: same]`. `--target "$MERGE_SHA"` pins the release to the merge commit. `--verify-tag` aborts if the tag is not on the remote -- a guard that the tag push (Step 6) actually landed; only pass it AFTER Step 6 succeeds. Title matches the milestone name (D-09).

### Step 8 -- Verify (orchestrator)

```bash
git ls-remote --tags origin | rg "refs/tags/v2.0.0"        # tag pushed (expect 1 non-^{} line)
git rev-list -n1 v2.0.0                                      # == $MERGE_SHA (tag on merge commit)
gh release list                                             # v2.0.0 present AND shows Latest; v1.0.1 no longer Latest
gh release view v2.0.0                                      # notes contain the migration table
```

Pipe to `rg`, never `grep` (CLAUDE.md). These mirror the `260613-u6l` verification (`git ls-remote --tags`, `gh release list` Latest check).

## CHANGELOG `[2.0.0]` Content Shape (REL-02)

Keep a Changelog 1.1.0 standard subsections are: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security` `[CITED: keepachangelog.com/en/1.1.0]`. For a breaking rename, the spec says both `Added` (new names) and `Removed` (old names) apply; `Changed` covers in-place modifications `[CITED: same]`.

**Recommended grouping** (matches the three bundled changes in D-05, headline first). The existing CHANGELOG uses `### Changed` prose with bold lead-ins; follow that house style:

```markdown
## [2.0.0] - <DATE>

This is a breaking release. The four skills are now invoked with an `lz-` prefix so they
no longer shadow Claude Code's built-in `/plan`, `/review`, and `/security-review`.

### Changed

- **BREAKING -- skill rename (`lz-` prefix).** All four skills are renamed. The bare
  `/plan`, `/review`, and `/security-review` shadowed Claude Code built-ins; the `lz-`
  prefix de-shadows them, and `/execute` was renamed too for suite consistency and
  `/lz-` autocomplete grouping. Migration:

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

- **BREAKING -- `/lz-security-review` canonical severities.** The security review report
  now groups findings under the canonical 5-tier security severity taxonomy --
  `### Critical` / `### High` / `### Medium` / `### Low` / `### Informational`, omit-when-empty
  -- plus a non-severity `### Open Questions` section, replacing the prior
  `Critical / Important / Suggestions / Questions` grouping. This is a breaking
  output-contract change for security-review consumers. Note: `/lz-review`
  intentionally KEEPS its `Critical / Important / Suggestions / Questions` taxonomy --
  the two review skills no longer use a symmetric severity vocabulary.

- The cross-skill provenance-marker label `**Verdict scope:**` is renamed to
  `**Verdict axis:**` (cosmetic; the machine-readable `scope: <value>` token is unchanged).
```

Add at the bottom of the file (preserving the existing `[1.0.1]` / `[1.0.0]` links, D-06):

```markdown
[2.0.0]: https://github.com/LayZeeDK/lz-advisor-claude-plugins/compare/v1.0.1...v2.0.0
```

**Subsection decision (resolves the CONTEXT open question):** A single `### Changed` section with three bold-led bullets is cleaner here than splitting into `### Removed` + `### Added`. The existing CHANGELOG `[1.0.1]` entry already uses `### Changed` prose for a contract-shape overhaul -- this matches house style and reads as a coherent "what changed" narrative. Splitting the rename into Removed (8 old forms) + Added (8 new forms) would duplicate the migration mapping awkwardly. `[ASSUMED]` on the house-style preference; the planner may split if it prefers strict spec literalism, but `### Changed` is the recommended shape and is spec-compliant (a rename is a change in existing functionality).

**Confidence:** HIGH on the subsection set (verified against keepachangelog.com) and the compare-link format (matches the existing file's `[1.0.1]` link verbatim). The severity-migration wording is grounded in the live `lz-security-review/SKILL.md` (lines 14-15, 152, 164) `[VERIFIED: git grep]`.

## README "What's New" Collapse Shape (REL-02, D-08)

**Current state verified:** the README `## What's New` section shows `### 1.0.1` (lines 79-90) and `### 1.0.0` (lines 92-101) `[VERIFIED: Read]`. D-08 collapses both to a single `### 2.0.0` entry.

**Consistency check (resolves the CONTEXT open question):** D-08 follows memory `feedback_release_readme_current_version_only` (at a stable/major release the README "What's New" is self-contained on the current version). The `260613-u6l` quick task authored the CHANGELOG as the cumulative history while the README "What's New" was NOT expanded to mirror it -- the README and CHANGELOG are deliberately different scopes (README = current-version highlights, CHANGELOG = full cumulative). Collapsing to 2.0.0-only is consistent with that division. **Caveat (already flagged in D-08):** this DELETES the 1.0.1 / 1.0.0 README prose; it survives in `CHANGELOG.md` and the published GitHub Releases, so no history is lost.

**Recommended replacement** (the Skills table is already `/lz-*` from Phase 14 -- do not re-touch it):

```markdown
## What's New

### 2.0.0

Breaking release. The four skills are renamed with an `lz-` prefix --
`/lz-plan`, `/lz-execute`, `/lz-review`, `/lz-security-review` (qualified
`lz-advisor:lz-<skill>`) -- so they no longer shadow Claude Code's built-in
`/plan`, `/review`, and `/security-review`. The `/lz-security-review` report also
adopts the canonical 5-tier security severity taxonomy
(`Critical` / `High` / `Medium` / `Low` / `Informational`, plus `Open Questions`).
See [CHANGELOG.md](../../CHANGELOG.md) for the full old-to-new migration table.
```

Verify the relative link path to CHANGELOG.md resolves from `plugins/lz-advisor/README.md` to the repo-root `CHANGELOG.md` (two levels up: `../../CHANGELOG.md`). `[ASSUMED]` on the exact link target -- the planner should confirm whether the README already links CHANGELOG and match that convention if so.

## 5-Surface Atomicity Check (REL-01 completeness gate)

A non-vacuous completeness assertion the planner can encode as the phase gate. After the bump, exactly 5 surfaces must read `2.0.0` and ZERO may still read `1.0.1`:

```bash
# Expect 5 matches: plugin.json "version" + 4 SKILL.md version: fields
git grep -c -E '("version": "2\.0\.0"|^version: 2\.0\.0)' -- \
  plugins/lz-advisor/.claude-plugin/plugin.json \
  'plugins/lz-advisor/skills/*/SKILL.md'

# Residue gate: zero remaining 1.0.1 in the version surfaces (exit 1 == clean)
git grep -n -E '("version": "1\.0\.1"|^version: 1\.0\.1)' -- \
  plugins/lz-advisor/.claude-plugin/plugin.json \
  'plugins/lz-advisor/skills/*/SKILL.md'
```

The first command should report 5 files each with count 1 (total 5 hits). The second should exit non-zero (no matches) -- any hit is a divergence defect (D-04 invariant). This is the "all 5 agree" completeness gate. Pathspec-scope to the version surfaces so the CHANGELOG `[1.0.1]` history (which legitimately still contains `1.0.1`) is NOT a false positive -- this is the same pathspec-scoping guard used in Phases 9/13/14.

## Common Pitfalls

### Pitfall 1: Tag created on the release-branch tip instead of the merge commit
**What goes wrong:** Tagging `release/v2.0.0`'s HEAD (or running `git tag` while still on the release branch) produces a tag that does NOT point to the canonical main-line commit users land on -- violating D-01/D-03.
**Why it happens:** The natural reflex is to tag where the work was committed.
**How to avoid:** Tag ONLY after Step 5 (checkout + ff-only pull of `main`), and pass the explicit `<MERGE_SHA>` to `git tag -a v2.0.0 <MERGE_SHA>`. Verify `git rev-list -n1 v2.0.0 == $MERGE_SHA` before pushing.
**Warning signs:** `git rev-list -n1 v2.0.0` differs from `git rev-parse main` after the merge.

### Pitfall 2: Pushing the tag before the merge lands on origin/main
**What goes wrong:** If the tag is created/pushed before the PR merge completes, the merge commit does not yet exist, so the tag necessarily points at the wrong commit (the branch tip).
**Why it happens:** Out-of-order execution of the D-01 sequence.
**How to avoid:** Strict ordering: PR merge (Step 4) -> local main sync (Step 5) -> tag (Step 6). `--verify-tag` on `gh release create` (Step 7) catches a missing-on-remote tag but does NOT catch a wrong-target tag -- the Step 6 `rev-list` check is the real guard.

### Pitfall 3: `gh release create` not marking v2.0.0 as Latest (or wrong default)
**What goes wrong:** Without `--latest`, GitHub uses date/version heuristics; if v1.0.1 was force-set Latest, the new release might not auto-promote, or a pre-release flag could interfere.
**Why it happens:** Relying on default Latest behavior.
**How to avoid:** Pass `--latest` explicitly (D-09). Verify with `gh release list` -- v2.0.0 must show the Latest badge, v1.0.1 must not. This exact verification is in the `260613-u6l` recipe.

### Pitfall 4: Squash or rebase merge silently selected
**What goes wrong:** `--squash` collapses 48 planning commits into one (loses topology + history); `--rebase` rewrites SHAs and produces no merge commit -- both violate D-02 and leave no merge commit to tag.
**Why it happens:** Repo allows all three methods (`squashMergeAllowed: true`, `rebaseMergeAllowed: true` -- verified); a default or habit could pick the wrong one.
**How to avoid:** Always pass `--merge` explicitly to `gh pr merge`. After merge, `git log --oneline -1 main` must show a merge commit (two parents: `git rev-list --parents -n1 HEAD` shows 3 SHAs).

### Pitfall 5: Multi-line release notes via inline string / heredoc (CLAUDE.md violation)
**What goes wrong:** The migration-table release body is multi-line; passing it via `--notes "<inline>"` or a heredoc violates the project shell rules and produces mojibake on Windows cp1252 / breaks Git Bash parsing.
**Why it happens:** Reaching for `--notes` instead of `--notes-file`.
**How to avoid:** Write the `[2.0.0]` slice to a temp file with the Write tool, pass `--notes-file <file>` (D-09 explicitly permits this). ASCII-only content (no em dashes, curly quotes -- CLAUDE.md).

### Pitfall 6: `git add .` staging unrelated planning artifacts
**What goes wrong:** The PR is intended to carry the bump + docs + (consistent with repo) the `.planning/` Phase 15 artifacts; a blanket `git add .` could also stage stray temp files (release-notes scratch file, etc.).
**Why it happens:** Habit.
**How to avoid:** CLAUDE.md bans `git add .` / `-A` / `-u`. Stage the 7 release files by name (Step 2). Planning artifacts are committed by the GSD workflow separately. Put any temp release-notes file outside the repo or in an ignored path so it is never staged.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Creating the merge commit | Manual `git merge --no-ff` + manual `git push origin main` bypassing the PR | `gh pr create` + `gh pr merge --merge` | D-01 requires a PR record; `gh` produces an equivalent `--no-ff` merge commit AND the PR audit trail, matching the PR #1 precedent. |
| Generating release notes | Hand-writing a separate notes body | Slice the `[2.0.0]` section from `CHANGELOG.md` into `--notes-file` | D-09; single source of truth. The CHANGELOG entry IS the release notes. |
| Verifying the tag/release landed | Eyeballing the GitHub web UI | `git ls-remote --tags origin` + `gh release list` + `gh release view` | Scriptable, matches the `260613-u6l` verification; no browser dependency. |
| Bumping versions | A version-bump script / tool (`npm version`, etc.) | 5 direct Edit operations | There is no `package.json` lifecycle here; the 5 surfaces are hand-maintained markdown/JSON. A tool would not know about the 4 SKILL.md `version:` fields. |

**Key insight:** Every mechanic in this phase has a proven in-repo precedent (Phase 12 bump, existing CHANGELOG scaffold, 260613-u6l release recipe, PR #1 merge). Reuse the shapes; do not invent new procedures.

## Validation Architecture

> nyquist_validation is `true` in `.planning/config.json` `[VERIFIED: cat .planning/config.json]`, so this section is included. NOTE: this is a docs/metadata release with NO application code and NO test framework -- "validation" here means artifact-shape + version-sync + publication assertions, run as shell commands, NOT a unit-test suite. There is no `tests/` to extend and no framework to install.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None -- no application code under test. Validation is shell-command assertions (git/gh/git grep). |
| Config file | none |
| Quick run command | `git grep -c -E '("version": "2\.0\.0"\|^version: 2\.0\.0)' -- plugins/lz-advisor/.claude-plugin/plugin.json 'plugins/lz-advisor/skills/*/SKILL.md'` (expect 5) |
| Full suite command | The Step 8 verification block (tag on remote + tag-on-merge-commit + `gh release list` Latest + `gh release view` notes) |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REL-01 | All 5 surfaces read `2.0.0`; zero read `1.0.1` | shape assertion | `git grep -c -E '... 2\.0\.0 ...'` (expect 5) AND residue `git grep ... 1\.0\.1` exits 1 | N/A (no test file) |
| REL-02 | CHANGELOG `[2.0.0]` entry + migration table + compare link present | shape assertion | `git grep -n '## \[2\.0\.0\]' -- CHANGELOG.md` AND `git grep -n 'compare/v1\.0\.1\.\.\.v2\.0\.0' -- CHANGELOG.md` AND `git grep -c '/lz-plan' -- CHANGELOG.md` (migration rows) | N/A |
| REL-02 | README "What's New" shows 2.0.0 only (1.0.1/1.0.0 removed) | shape assertion | `git grep -n '### 2\.0\.0' -- plugins/lz-advisor/README.md` (present) AND `git grep -n '### 1\.0\.1' -- plugins/lz-advisor/README.md` (exits 1) | N/A |
| REL-03 | `v2.0.0` tag on remote, on the merge commit | publication assertion | `git ls-remote --tags origin \| rg v2.0.0` AND `git rev-list -n1 v2.0.0` == merge SHA | N/A |
| REL-03 | GitHub Release published + Latest | publication assertion | `gh release list \| rg 'v2.0.0.*Latest'` AND `gh release view v2.0.0` notes contain migration table | N/A |

### Sampling Rate
- **Per task commit:** the 5-surface version-sync `git grep` (cheap, <1s).
- **Per wave merge:** N/A -- single linear sequence, no parallel waves.
- **Phase gate:** the full Step 8 verification block green AFTER the release publishes. Shape assertions (REL-01/REL-02) run BEFORE the PR merge (Step 2 commit); publication assertions (REL-03) run only after Step 7.

### Wave 0 Gaps
- None -- no test infrastructure is needed or appropriate for a docs/metadata release. All validation is the inline shell assertions above. (Framework install: not applicable.)

## Security Domain

> `security_enforcement` is not set in `.planning/config.json` (absent = enabled), so this section is included. However, this phase ships NO application code, NO authentication/authorization, NO input handling, NO cryptography, and NO new attack surface -- it edits version strings and markdown and publishes a git tag. The only security-relevant action is outward-facing git/GitHub operations on a public repo.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No auth code. `gh` uses the operator's existing GitHub credentials. |
| V3 Session Management | no | N/A |
| V4 Access Control | no | Branch protection / merge permissions are GitHub-side (`mergeCommitAllowed` verified); no code-level access control. |
| V5 Input Validation | no | No user input is processed; only static markdown/JSON edits. |
| V6 Cryptography | no | Annotated tags are not signed in this repo (v1.0.0/v1.0.1 precedent is unsigned annotated tags); no crypto introduced. |

### Known Threat Patterns for this phase

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Irreversible outward-facing action run by an isolated subagent (rogue tag push / release) | Tampering / Repudiation | D-03: orchestrator runs all outward-facing steps directly, never a worktree-isolated executor. |
| Tag points at wrong commit (supply-chain integrity of the published release) | Tampering | Step 6 `git rev-list -n1 v2.0.0 == $MERGE_SHA` guard + `--target $MERGE_SHA` on the release. |
| Accidental Latest demotion / wrong release marked Latest | Repudiation | `--latest` explicit + `gh release list` Latest-badge verification (260613-u6l recipe). |

No new vulnerabilities are introduced. The phase's security posture is entirely about **operational integrity of the publication** (right commit, right tag, right Latest), covered by the Step 6/8 guards.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `git` | All steps (commit, tag, push, sync) | yes | 2.54.0.windows.1 `[VERIFIED]` | -- |
| `gh` (GitHub CLI) | PR create/merge (Step 3/4), Release create (Step 7) | yes | 2.86.0 `[VERIFIED]` | -- |
| `origin` remote (github.com/LayZeeDK/lz-advisor-claude-plugins) | push, PR, release | yes | reachable; tags `{v1.0.0, v1.0.1}` present `[VERIFIED: git ls-remote]` | -- |
| Repo merge-commit permission | `gh pr merge --merge` | yes | `mergeCommitAllowed: true` `[VERIFIED: gh repo view]` | -- |
| `gh` authenticated session | PR + Release | assumed yes (PR #1 + 260613-u6l succeeded with this gh) | -- | If 429 out_of_credits or auth lapse, re-auth `gh auth status`; outward-facing steps are operator-run anyway |

**Missing dependencies with no fallback:** none.
**Missing dependencies with fallback:** none material -- all tooling present and verified.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tag-then-publish directly on a branch (v1.0/v1.0.1 era was tag-on-MVP-commit, release after) | PR-merge-commit-then-tag-the-merge-commit | This phase (user directive D-01) | Tag now resolves to a canonical `main`-line merge node, not a branch tip. |
| `gh release create` with `--notes` inline | `--notes-file` from the CHANGELOG slice | This phase (CLAUDE.md multi-line ban + D-09) | Single source of truth; no shell-quoting/encoding hazard. |

**Deprecated/outdated:** nothing in scope. The `260613-u6l` recipe (annotated tag + `gh release create` + `--latest` + `gh release list` verify) remains current and directly reused.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Single `### Changed` section (vs splitting into `### Removed` + `### Added`) is the better fit for the breaking rename | CHANGELOG Content Shape | Low -- both are Keep a Changelog 1.1.0-compliant; cosmetic. Planner may split if it prefers strict spec literalism. |
| A2 | README -> CHANGELOG relative link is `../../CHANGELOG.md` and the README does not already link CHANGELOG elsewhere | README Collapse Shape | Low -- a broken relative link is cosmetic and caught on render; planner should confirm the existing README link convention. |
| A3 | `gh` is authenticated and has not lapsed since the 260613-u6l / PR #1 runs | Environment Availability | Low -- caught immediately by the first `gh` call; re-auth is trivial and operator-run. |

**Note:** all release-mechanic flags, version surfaces, git state, and Keep a Changelog conventions are `[VERIFIED]` or `[CITED]`, not assumed. The three assumptions above are all cosmetic/operational with low blast radius.

## Open Questions

1. **Delete the release branch after merge?**
   - What we know: `gh pr merge` supports `--delete-branch`. v1.0.1's `release` branch fate is not recorded.
   - What's unclear: whether to keep `release/v2.0.0` for reference or delete it post-release.
   - Recommendation: keep it (`--delete-branch=false`) until the release is verified green, then delete at the operator's discretion. Not load-bearing for REL-01..03.

2. **Should the annotated tag be GPG-signed?**
   - What we know: v1.0.0/v1.0.1 are unsigned annotated tags `[VERIFIED: git ls-remote shows the tags; precedent is annotated, signing not mentioned in 260613-u6l]`.
   - What's unclear: whether the operator wants signed tags going forward.
   - Recommendation: match precedent (unsigned annotated). Signing is out of scope for REL-03 as written; raise only if the operator asks.

## Sources

### Primary (HIGH confidence)
- `cli.github.com/manual/gh_pr_merge` -- `--merge` creates a true merge commit; `-t/--subject`, `-b/--body`, `-F/--body-file`, `-d/--delete-branch`; auto-selects the PR for the current branch.
- `cli.github.com/manual/gh_release_create` -- `--latest` (and `--latest=false`), `-F/--notes-file`, `-n/--notes`, `-t/--title`, `--target <branch|sha>`, `--verify-tag`; auto-creates a tag if missing unless `--verify-tag`.
- `keepachangelog.com/en/1.1.0` -- six standard subsections (Added/Changed/Deprecated/Removed/Fixed/Security); breaking rename uses Added+Removed or Changed; `## [X.Y.Z] - YYYY-MM-DD` header; `[X.Y.Z]: .../compare/...` reference links.
- `docs.github.com .../about-merge-methods-on-github` -- merge commit = `--no-ff`, preserves all individual commits + branch topology; squash collapses; rebase linearizes with new SHAs.
- In-repo verified state: `git --version` 2.54.0, `gh --version` 2.86.0, `git ls-remote --tags origin` ({v1.0.0,v1.0.1}), `git merge-base --is-ancestor origin/main HEAD` (true), `gh repo view --json mergeCommitAllowed` (true), `git grep`/`Read` of the 5 version surfaces + CHANGELOG.md + README.md + lz-security-review/SKILL.md.

### Secondary (MEDIUM confidence)
- `.planning/quick/260613-u6l-.../260613-u6l-SUMMARY.md` -- the proven in-repo release recipe (annotated tag + `gh release create` + `--latest` + `gh release list` verify + orchestrator-runs-outward-facing deviation).
- PR #1 (`gh pr list --state merged`) -- merge-to-main precedent with a distinct merge commit oid (`cb4ae89`).

### Tertiary (LOW confidence)
- none -- all claims are verified in-session or cited from official docs.

## Metadata

**Confidence breakdown:**
- Release mechanics (gh/git command sequence + flags): HIGH -- every flag cited from cli.github.com manual; git state verified in-session; clean fast-forward relationship confirmed.
- CHANGELOG/README content shape: HIGH on structure (keepachangelog.com cited; existing file inspected); MEDIUM on exact prose wording (discretion + assumed house-style preference A1).
- 5-surface atomicity check: HIGH -- all 5 surfaces located with verified current values; pathspec-scoping guard matches established Phase 9/13/14 pattern.
- Pitfalls / risks: HIGH -- grounded in the D-01 sequencing directive and verified merge/tag relationships.

**Research date:** 2026-06-14
**Valid until:** 2026-07-14 (stable -- release mechanics and CLI flags are slow-moving; the verified git state is a point-in-time snapshot and should be re-confirmed at execution if other work lands on the branch).
