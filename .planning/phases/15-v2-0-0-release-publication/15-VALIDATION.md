---
phase: 15
slug: v2-0-0-release-publication
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-14
---

# Phase 15 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> This is a release/publication phase: "tests" are deterministic shell-assertion
> gates (version-surface counts, CHANGELOG/README content, tag->merge-commit
> identity, `gh release` state), NOT a unit-test framework.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None (shell-assertion gates: `git grep` / `rg` / `git` / `gh`) |
| **Config file** | none -- assertions are inline, no install needed |
| **Quick run command** | 5-surface atomicity gate (see Per-Task map REL-01) |
| **Full suite command** | atomicity gate + CHANGELOG/README content gate + (post-merge) tag/release gate |
| **Estimated runtime** | ~5 seconds (local gates); outward-facing verify depends on network |

---

## Sampling Rate

- **After the bump+CHANGELOG+README commit (pre-PR):** run the REL-01 atomicity gate AND the REL-02 content gate. Both MUST be green before opening the PR.
- **After the PR merge to `main`:** run the REL-03 tag-identity gate (`git rev-list -n1 v2.0.0` == merge SHA) BEFORE `git push origin v2.0.0`.
- **After `gh release create`:** run the REL-03 release-state gate (`gh release list` shows v2.0.0 Latest; `git ls-remote --tags origin` has v2.0.0).
- **Max feedback latency:** ~5 seconds for local gates.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 15-01 (bump) | 01 | 1 | REL-01 | - / - | N/A (metadata only) | assertion | `[ "$(git grep -c '"version": "2.0.0"' -- plugins/lz-advisor/.claude-plugin/plugin.json)" = "1" ] && [ "$(git grep -lc '^version: 2.0.0$' -- 'plugins/lz-advisor/skills/lz-*/SKILL.md' | wc -l)" = "4" ]` (5 surfaces total) | tracked | pending |
| 15-01 (residue) | 01 | 1 | REL-01 | - / - | no stale version survives | assertion | `git grep -n '1\.0\.1' -- plugins/lz-advisor/.claude-plugin/plugin.json 'plugins/lz-advisor/skills/lz-*/SKILL.md'` exits 1 (zero hits in version surfaces) | tracked | pending |
| 15-02 (CHANGELOG) | 01 | 1 | REL-02 | - / - | N/A | assertion | `rg -q '^## \[2\.0\.0\]' CHANGELOG.md` AND `rg -q '^\[2\.0\.0\]: https://github.com/LayZeeDK/lz-advisor-claude-plugins/compare/v1\.0\.1\.\.\.v2\.0\.0' CHANGELOG.md` AND migration table has 8 old->new rows (4 bare + 4 qualified) | tracked | pending |
| 15-02 (README) | 01 | 1 | REL-02 | - / - | What's New collapsed | assertion | `rg -q '^### 2\.0\.0' plugins/lz-advisor/README.md` AND `rg -n '^### 1\.0\.(0\|1)' plugins/lz-advisor/README.md` exits 1 (no prior-version entries remain) | tracked | pending |
| 15-03 (tag identity) | 01 | post-merge | REL-03 | - / - | tag on merge commit, not branch tip | assertion | `[ "$(git rev-list -n1 v2.0.0)" = "$MERGE_SHA" ]` (MERGE_SHA = `gh pr view --json mergeCommit -q .mergeCommit.oid`) | n/a | pending |
| 15-03 (release state) | 01 | post-merge | REL-03 | - / - | tag + Release published, Latest | assertion | `git ls-remote --tags origin` contains `refs/tags/v2.0.0` AND `gh release list` shows `v2.0.0` with the Latest marker | n/a | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements -- no test framework or fixtures to install. The gates above are inline shell assertions over tracked files + git/gh state.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| GitHub PR opened and merged with a TRUE merge commit | REL-03 (D-01/D-02) | Outward-facing; orchestrator runs `gh pr merge --merge` directly (not a subagent) | Confirm the merge produced exactly one merge commit on `main` (`git log --merges -1 main` shows the PR merge); confirm via `gh pr view --json state,mergedAt,mergeCommit` |
| GitHub Release page renders the [2.0.0] notes + Latest badge | REL-03 (D-09) | Published artifact on github.com; visual confirm | Open the release URL from `gh release view v2.0.0 --web`; confirm the migration table renders and the Latest badge is present (v1.0.1 demoted) |

---

## Validation Sign-Off

- [ ] REL-01/02 gates green on the pre-PR commit (5 surfaces == 2.0.0; CHANGELOG + README content present)
- [ ] REL-03 tag-identity gate green (tag == merge commit SHA) before push
- [ ] REL-03 release-state gate green (origin has v2.0.0; release is Latest)
- [ ] Sampling continuity: each REL requirement has an automated assertion or a documented manual verify
- [ ] No watch-mode flags
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
