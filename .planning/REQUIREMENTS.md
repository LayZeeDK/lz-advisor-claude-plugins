# Requirements -- Milestone v2.0.0 (Prefixed skill names)

**Defined:** 2026-06-14
**Milestone goal:** Fix the critical built-in-command shadowing bug by prefixing all four skills with `lz-`, shipped as a breaking (MAJOR) release.

## v2.0.0 Requirements

### Skill Rename (RENAME)

- [ ] **RENAME-01**: The four skills are invoked as `/lz-plan`, `/lz-execute`, `/lz-review`, `/lz-security-review` -- each skill directory and its `name:` frontmatter renamed with the `lz-` prefix via `git mv` (history preserved). Qualified forms become `lz-advisor:lz-<skill>`.
- [ ] **RENAME-02**: Selecting Claude Code's built-in `/plan`, `/review`, or `/security-review` no longer invokes an lz-advisor skill -- the bare-name shadowing is gone. Verified in the interactive command picker (NOT a headless `claude -p` probe, which is blind to bare-form collisions).
- [ ] **RENAME-03**: All in-repo references to the old skill names are updated in lockstep (plugin + root README, CLAUDE.md including the `claude -p` UAT examples, PROJECT.md, eval workspace references). Closing gate: `git grep` for the old bare skill names returns zero hits under `plugins/lz-advisor/`.

### Release & Publication (REL)

- [ ] **REL-01**: Plugin version is `2.0.0` across all 5 surfaces (`plugin.json` + the 4 `SKILL.md` `version:` fields), bumped atomically.
- [ ] **REL-02**: `CHANGELOG.md` has a `[2.0.0]` entry documenting the breaking rename with a migration table (old -> new, bare AND qualified forms) + a compare link; the plugin README "What's New" shows the 2.0.0 entry.
- [ ] **REL-03**: A `v2.0.0` git tag is pushed to origin and a GitHub Release is published with the `[2.0.0]` notes.

## Future Requirements (deferred)

- On-demand Fable (or stronger-than-Opus) advisor selection -- **SEED-001**. The override mechanism is proven; blocked only by Anthropic's server-side denial of Fable for subagent dispatch (API 404). Revisit when that access is granted.

## Out of Scope

- On-demand Fable advisor (deferred above -- not deliverable today).
- Any change to agent personas / system-prompt behavior -- the rename is mechanical; advisor / reviewer / security-reviewer behavior is unchanged.
- Any new skills, agents, or features beyond the rename + release.

## Locked Decisions

- All FOUR skills get the `lz-` prefix (including `execute`, which does not itself collide) -- for suite consistency + `/lz-` autocomplete grouping (user decision, 2026-06-14).
- Version is `2.0.0` (MAJOR) because renaming the public skill names is a backward-incompatible change to the plugin's invocation surface.
- Fable advisor descoped after empirical proof that subagent-Fable is blocked server-side (see `research/FABLE-OVERRIDE-PROBE.md`, SEED-001).
- Tag + GitHub Release are in scope (the project now publishes; v1.0.0 / v1.0.1 shipped 2026-06-13).

## Traceability

| REQ-ID | Phase | Status |
|--------|-------|--------|
| RENAME-01 | Phase 14 | Planned |
| RENAME-02 | Phase 14 | Planned |
| RENAME-03 | Phase 14 | Planned |
| REL-01 | Phase 15 | Planned |
| REL-02 | Phase 15 | Planned |
| REL-03 | Phase 15 | Planned |
