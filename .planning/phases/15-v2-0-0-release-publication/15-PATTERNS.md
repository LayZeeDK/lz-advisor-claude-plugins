# Phase 15: v2.0.0 release & publication - Pattern Map

**Mapped:** 2026-06-14
**Files analyzed:** 7 modified (5 version surfaces + CHANGELOG + README)
**Analogs found:** 7 / 7 (all in-file / same-repo precedents)

This is a metadata/docs release. Every modified file ALREADY EXISTS and its
closest analog is the prior-version pattern IN THE SAME FILE (or the identical
field in a sibling file). No new patterns are introduced -- the planner mirrors
the existing in-repo shape and changes only the version-specific values.

## File Classification

| Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---------------|------|-----------|----------------|---------------|
| `plugins/lz-advisor/.claude-plugin/plugin.json` | config/manifest | transform (value edit) | the `version` field itself (line 3) | exact (in-file) |
| `plugins/lz-advisor/skills/lz-plan/SKILL.md` | skill metadata | transform (value edit) | its own `version:` (line 18) + 3 sibling SKILL.md | exact (in-file) |
| `plugins/lz-advisor/skills/lz-execute/SKILL.md` | skill metadata | transform (value edit) | its own `version:` (line 19) + 3 sibling SKILL.md | exact (in-file) |
| `plugins/lz-advisor/skills/lz-review/SKILL.md` | skill metadata | transform (value edit) | its own `version:` (line 19) + 3 sibling SKILL.md | exact (in-file) |
| `plugins/lz-advisor/skills/lz-security-review/SKILL.md` | skill metadata | transform (value edit) | its own `version:` (line 20) + 3 sibling SKILL.md | exact (in-file) |
| `CHANGELOG.md` | changelog | transform (prepend entry + append link) | the `## [1.0.1]` entry + `[1.0.1]:` compare link | exact (in-file) |
| `plugins/lz-advisor/README.md` | readme | transform (collapse section) | the `### 1.0.1` "What's New" entry shape | exact (in-file) |

## Pattern Assignments

### `plugins/lz-advisor/.claude-plugin/plugin.json` (config/manifest)

**Analog:** the `version` field in this same file (surface 1 of 5).

**Current value to change** (line 3):
```json
  "version": "1.0.1",
```
Change `1.0.1` -> `2.0.0`. JSON string value; trailing comma stays. Edit matches
the unique string `"version": "1.0.1"`.

---

### `plugins/lz-advisor/skills/lz-{plan,execute,review,security-review}/SKILL.md` (skill metadata, surfaces 2-5)

**Analog:** the `version:` YAML frontmatter field in each file -- all four are
IDENTICAL, so the four siblings are each other's analog.

**Current value to change** (one per file, exact line varies -- do NOT assume a
single line number across files):

| File | `version:` line |
|------|-----------------|
| `lz-plan/SKILL.md` | 18 |
| `lz-execute/SKILL.md` | 19 |
| `lz-review/SKILL.md` | 19 |
| `lz-security-review/SKILL.md` | 20 |

Each line reads (unquoted YAML scalar, no surrounding quotes):
```yaml
version: 1.0.1
```
Change `1.0.1` -> `2.0.0` in all four. The Edit tool matches on the unique
`version: 1.0.1` string within each file; the differing line number is not
load-bearing for the edit. NOTE: do NOT touch `name:`, `description:`, or
`allowed-tools:` on adjacent lines -- only the `version:` scalar changes.

**Completeness gate (REL-01 D-04 invariant)** -- after the bump, exactly 5
surfaces read `2.0.0` and ZERO read `1.0.1`, pathspec-scoped to the version
surfaces (so the CHANGELOG `[1.0.1]` history is not a false positive):
```bash
git grep -c -E '("version": "2\.0\.0"|^version: 2\.0\.0)' -- \
  plugins/lz-advisor/.claude-plugin/plugin.json \
  'plugins/lz-advisor/skills/*/SKILL.md'        # expect 5 files, count 1 each
git grep -n -E '("version": "1\.0\.1"|^version: 1\.0\.1)' -- \
  plugins/lz-advisor/.claude-plugin/plugin.json \
  'plugins/lz-advisor/skills/*/SKILL.md'        # expect exit 1 (no matches)
```

---

### `CHANGELOG.md` (changelog)

**Analog:** the existing `## [1.0.1] - 2026-06-11` entry (lines 8-21) for the
SECTION SHAPE, and the bottom-of-file compare-link footer (lines 60-61) for the
REFERENCE-LINK SHAPE. Keep a Changelog 1.1.0 + SemVer, newest-first.

**Section-heading + `### Changed` prose shape to mirror** (existing `[1.0.1]`,
lines 8-21 -- note the house style: `### Changed` with bold lead-in bullets,
NOT split Added/Removed):
```markdown
## [1.0.1] - 2026-06-11

### Changed

- **Review report grammar overhaul.** The `/review` and `/security-review` skills
  now present findings GROUPED under fully spelled-out severity headlines --
  ...
```
The new `## [2.0.0] - <publish date>` entry is PREPENDED directly above
`## [1.0.1]` (line 8). The `[1.0.1]` and `[1.0.0]` entries are PRESERVED
untouched (D-06). Migration-table + content shape is fully specified in
15-RESEARCH.md "CHANGELOG [2.0.0] Content Shape" -- do not re-derive it.

**Compare-link footer shape to mirror** (existing, lines 60-61):
```markdown
[1.0.1]: https://github.com/LayZeeDK/lz-advisor-claude-plugins/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/LayZeeDK/lz-advisor-claude-plugins/releases/tag/v1.0.0
```
PREPEND one new link above the `[1.0.1]:` line (newest-first), verbatim format
(D-06):
```markdown
[2.0.0]: https://github.com/LayZeeDK/lz-advisor-claude-plugins/compare/v1.0.1...v2.0.0
```
Note the existing links: the latest-vs-prior uses `compare/vPREV...vNEW`; the
initial `[1.0.0]` uses `releases/tag/v1.0.0`. The new `[2.0.0]` follows the
`compare/v1.0.1...v2.0.0` form (matches the `[1.0.1]` line exactly, prev->new).

---

### `plugins/lz-advisor/README.md` (readme)

**Analog:** the existing `## What's New` section's `### 1.0.1` entry (lines
79-90) for the per-entry PROSE SHAPE.

**Current entry shape to mirror** (existing `### 1.0.1`, lines 79-90 -- a
version sub-heading followed by a single prose paragraph, no bullet list):
```markdown
## What's New

### 1.0.1

Review report grammar overhaul. The `/lz-review` and `/lz-security-review` agents now
present findings GROUPED under fully spelled-out severity headlines --
...
```

**Action (D-08): COLLAPSE, not append.** REPLACE the entire `## What's New`
block -- both the `### 1.0.1` entry (lines 79-90) AND the `### 1.0.0` entry
(lines 92-101) -- with a SINGLE `### 2.0.0` entry. The 2.0.0 prose summarizes
the breaking rename + canonical-severity migration and links to CHANGELOG.md
for the full migration table. Exact replacement prose is in 15-RESEARCH.md
"README What's New Collapse Shape".

**Caveat (flag to user):** this DELETES the 1.0.1 / 1.0.0 README prose. It
survives in CHANGELOG.md and the published GitHub Releases -- no history lost.

**Do NOT re-touch the Skills table** (lines 15-20) -- it is already `/lz-*` from
Phase 14. Confirm the relative CHANGELOG link is `../../CHANGELOG.md` (from
`plugins/lz-advisor/README.md` up two levels to repo root). The README does not
currently link CHANGELOG, so the new link is additive.

## Shared Patterns

### Atomic 5-surface version sync
**Source:** Phase 12 precedent (1.0.0 -> 1.0.1 across the same 5 surfaces in lockstep).
**Apply to:** `plugin.json` + the 4 `SKILL.md` `version:` fields.
All 5 surfaces change `1.0.1` -> `2.0.0` in the SAME pre-PR commit set (one
commit or three is Claude's discretion per D-09; the invariant is all 5 agree
and all land before the PR). Divergence is a release defect.

### Keep a Changelog 1.1.0 house style
**Source:** existing `CHANGELOG.md` (`### Changed` prose with bold lead-in
bullets; newest-first; `## [X.Y.Z] - YYYY-MM-DD` heading; bottom-of-file
`[X.Y.Z]: .../compare/vPREV...vNEW` reference links).
**Apply to:** the new `[2.0.0]` entry + its compare link.
A single `### Changed` section with bold-led bullets (recommended) matches the
existing `[1.0.1]` entry -- do NOT split into `### Added`/`### Removed`.

### Release-notes single source of truth
**Source:** `260613-u6l` recipe + D-09.
**Apply to:** the GitHub Release notes (REL-03).
The `[2.0.0]` CHANGELOG slice IS the release notes -- write it to a temp file
(Write tool, ASCII-only) and pass `--notes-file` (never inline multi-line; CLAUDE.md ban).

## No Analog Found

None. Every modified file has an exact in-file (or sibling-file) precedent.

The ONE mechanic without a verbatim in-repo precedent is the
**merge-commit-before-tag sequencing** (D-01) -- but that is a PROCEDURE (covered
end-to-end in 15-RESEARCH.md "Release Mechanics" + the `260613-u6l` recipe), not
a file-content pattern, so it is out of scope for this pattern map.

## Metadata

**Analog search scope:** the 7 modified files themselves + their in-file prior
versions; sibling SKILL.md files; existing CHANGELOG.md `[1.0.1]`/`[1.0.0]`
entries + compare-link footer; README `## What's New` section.
**Files scanned:** 7 (all read in full or frontmatter region).
**Pattern extraction date:** 2026-06-14
