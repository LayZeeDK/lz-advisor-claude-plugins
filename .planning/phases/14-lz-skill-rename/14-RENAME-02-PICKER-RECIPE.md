# Phase 14 - RENAME-02 / SC-4 Interactive Command-Picker Verification Recipe

**Status:** human_needed (NOT auto-passed, NOT verifiable via a headless `claude -p` probe)
**Requirement:** RENAME-02 / ROADMAP SC-4
**Decision basis:** CONTEXT.md D-10; memory `project_headless_probe_misses_bare_form_collisions`; Phase 9 D-08.

## Why this CANNOT be auto-validated

A headless `claude -p "/lz-advisor:lz-plan ..."` probe uses the QUALIFIED name and only
proves the plugin skill resolves. It is STRUCTURALLY BLIND to whether the BARE `/plan`
still surfaces the plugin in the interactive command picker. Bare-form collision is only
observable in the interactive command picker. Do NOT substitute a headless probe.

## Automated gate state (executor-confirmed, prerequisite to the human step)

The combined closing gate prints `[GATE-PASS]` at HEAD (commit f9636b8):

- P1 `^name: (plan|execute|review|security-review)$` -> EXIT 1 (zero hits)
- P2 `skills/(plan|execute|review|security-review)/` -> EXIT 1
- P3 `[^<][/](plan|execute|review|security-review)([^a-z-]|$)` -> EXIT 1
- P4 `lz-advisor:(plan|execute|review|security-review)([^a-z-]|$)` -> EXIT 1
- P5 `(^|[^a-z-])(plan|execute|review|security-review)/SKILL\.md` -> EXIT 1
- A1: 4 `skills/lz-*/SKILL.md` exist
- A2: 4 `name: lz-*` frontmatter fields
- History: all 4 moved SKILL.md resolve through d88df91 via `git log --follow`

## The interactive-picker recipe (a HUMAN runs these steps)

1. Start an interactive Claude Code session from this repo root with the plugin loaded:

   ```
   claude --plugin-dir plugins/lz-advisor
   ```

   (or with the installed marketplace plugin enabled.)

2. De-shadow assertions (the bug being fixed) -- type each bare built-in and inspect the picker:
   - Type `/plan`            -> the picker surfaces the Claude Code BUILT-IN `/plan` with NO
     lz-advisor skill shadowing the bare name.
   - Type `/review`          -> surfaces the BUILT-IN `/review` (no lz-advisor entry on the bare name).
   - Type `/security-review` -> surfaces the BUILT-IN `/security-review` (no lz-advisor shadowing).
   - (`/execute` has no built-in twin; confirm NO stale bare `lz-advisor` execute entry remains.)

3. Positive resolution assertions (the new names work) -- type each lz- form and confirm it
   resolves to the PLUGIN skill:
   - `/lz-plan`, `/lz-execute`, `/lz-review`, `/lz-security-review` each surface the lz-advisor skill.

4. Record the picker observations. Mark RENAME-02 / SC-4 PASS only after a human confirms
   steps 2-3 interactively. If access/time blocks the interactive check, leave it as
   human_needed (do NOT silently auto-pass).

## Recorded observations

_Pending human run. To be filled in by the operator after running steps 2-3 above._

| Bare form | Expected | Observed |
|-----------|----------|----------|
| `/plan` | built-in only, no lz-advisor shadow | (pending) |
| `/review` | built-in only, no lz-advisor shadow | (pending) |
| `/security-review` | built-in only, no lz-advisor shadow | (pending) |
| `/execute` | no stale bare lz-advisor entry | (pending) |
| `/lz-plan` | resolves to lz-advisor plugin skill | (pending) |
| `/lz-execute` | resolves to lz-advisor plugin skill | (pending) |
| `/lz-review` | resolves to lz-advisor plugin skill | (pending) |
| `/lz-security-review` | resolves to lz-advisor plugin skill | (pending) |

**Verdict:** human_needed -- surfaced to the user by phase verification.
