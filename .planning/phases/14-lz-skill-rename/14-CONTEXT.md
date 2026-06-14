# Phase 14: lz- skill rename - Context

**Gathered:** 2026-06-14
**Status:** Ready for planning
**Mode:** `--auto --chain --analyze` (autonomous discuss, recommended option per gray area, auto-advance to plan)

<domain>
## Phase Boundary

Rename all four lz-advisor skills (`plan` / `execute` / `review` / `security-review` -> `lz-plan` / `lz-execute` / `lz-review` / `lz-security-review`) via `git mv` so they stop shadowing Claude Code's built-in `/plan`, `/review`, `/security-review`, with every in-repo reference updated in lockstep and closed by a scoped `git grep` gate. Pure mechanical rename + cross-reference sweep -- NO behavior change to any agent or skill, NO version bump, NO release artifacts.

**In scope:** skill directory renames + `name:` frontmatter (RENAME-01); lockstep accuracy sweep of in-repo references (RENAME-03); interactive-picker bare-form collision verification (RENAME-02, human_needed).

**Out of scope (-> Phase 15):** the 5-surface 1.0.1 -> 2.0.0 version bump (REL-01), the `CHANGELOG.md [2.0.0]` entry + README "What's New" 2.0.0 entry + migration table (REL-02), git tag + GitHub Release (REL-03). Also out: any agent/skill persona or system-prompt change (the rename is mechanical).
</domain>

<decisions>
## Implementation Decisions

### Rename Mechanics
- **D-01:** Treat the rename as one **coherent atomic unit** -- `git mv` the 4 skill directories + edit the 4 `name:` frontmatter fields + sweep all in-repo accuracy references together, so the repo is never left half-renamed at a loadable-state commit boundary and the closing `git grep` gate is meaningful at HEAD. History is preserved via `git mv` (never delete+recreate). Task/commit breakdown within the unit is the planner's discretion; the invariant is "HEAD after the phase is fully renamed and gate-green." (Phase 9 precedent: the dotted->plain rename used `git mv` + a pathspec-scoped gate.)
- **D-02:** Names: directory `skills/<bare>/` -> `skills/lz-<bare>/`; `name: <bare>` -> `name: lz-<bare>`. Qualified invocation becomes `lz-advisor:lz-<bare>` (e.g. `lz-advisor:lz-plan`), slash form `/lz-<bare>`. All FOUR skills get the prefix, **including `execute`** which does not itself collide -- locked for suite consistency + `/lz-` autocomplete grouping (REQUIREMENTS.md Locked Decisions).

### Cross-Reference Sweep Taxonomy (3 classes, grounded by codebase scout)
- **D-03 (MUST-change, gated):** 4 skill directories (`git mv`) + 4 `name:` frontmatter fields. These ARE the rename.
- **D-04 (change-for-accuracy, IN-plugin, covered by the gate):**
  - `plugins/lz-advisor/README.md` skill table + prose slash refs (lines ~11, 17-20, 48, 81, 95-96): `/plan`->`/lz-plan`, `/execute`->`/lz-execute`, `/review`->`/lz-review`, `/security-review`->`/lz-security-review`.
  - The 4 `SKILL.md` worked-example invocations + cross-skill pointers: the `/plan Address findings...` worked example present in ALL four (`plan:56`, `execute:59`, `review:57`, `security-review:58`); `plan/SKILL.md:212` `/security-review`; `plan/SKILL.md:223` `/execute`.
  - `plugins/lz-advisor/references/orient-exploration.md` worked scenario (lines 149-152: `/review`, `/plan`, `/execute`).
  - `plugins/lz-advisor/skills/execute/SKILL.md:17` description prose "sibling skills plan, review, and ..." -> `lz-plan`, `lz-review`, ... (and the analogous sibling-skill prose in the other 3 skill descriptions).
- **D-05 (change-for-accuracy, OUTSIDE the gate -- verified by inspection):**
  - Repo-root `CLAUDE.md` §Conventions `claude -p` qualified examples (lines ~194, 195, 209, 215): `lz-advisor:plan`->`lz-advisor:lz-plan`, `lz-advisor:execute`->`lz-advisor:lz-execute`.
  - Root `README.md` (marketplace-level): empirically has **0** skill slash refs, but scan for any qualified/name references and update for accuracy.
  - `.planning/PROJECT.md` current-state references that name the live invocation surface (NOT the frozen Evolution log entries).
- **D-06 (looks-relevant-but-NOT -- LEAVE):**
  - `plugins/lz-advisor/agents/*.md` -- confirmed **zero** skill-invocation refs; they carry only agent names (`lz-advisor:advisor` / `reviewer` / `security-reviewer`) which are NOT being renamed.
  - The `@plans/` and `/plans/` directory paths and the literal "filename contains `plan`" inside the worked-example lines (plan:56 / execute:59 / review:57 / security-review:58) -- these are file-path/substring tokens, NOT skill invocations. A naive `/plan`->`/lz-plan` sed MUST NOT touch `@plans/`, `/plans/`, or the word "plan" in "filename contains `plan`".
  - The plugin-name token `lz-advisor` in manifests / `--plugin-dir` paths.
  - `.planning/` frozen history (the ~10 dotted `lz-advisor.<skill>` refs + any bare refs across `milestones/`, `quick/`, `todos/`, `MILESTONES.md`) -- accurate as-written history; pathspec-excluded (Phase 9 precedent).

### Eval-Tree Disposition (resolves the apparent RENAME-03 "eval workspace references" vs PROJECT.md "eval JSON = looks-relevant-but-NOT" tension)
- **D-07:** The hard `git grep` gate is scoped to `plugins/lz-advisor/` only; the `evals/` tree sits OUTSIDE it. Within `evals/lz-advisor/`:
  - **(a) LEAVE** the 4 `*-eval.json` trigger queries -- they are natural-language description-match tests; the word "plan"/"review" is English prose, not an invocation. Renaming them corrupts the eval.
  - **(b) LEAVE** the eval *filenames* (`lz-advisor-plan-eval.json` ...) and *workspace dir names* (`plan-workspace/` ...) for Phase 14 -- test-harness keys, orthogonal to the shadowing fix, not gated. (Renaming is churn the rename does not require.)
  - **(c) UPDATE** the `conciseness-assessment.md` runnable invocation-prompt prefixes (lines 18/31/45/59: `/plan ...`, `/execute ...`, `/review ...`, `/security-review ...`) -> `/lz-*` for reproducibility, since these are copy-pasteable invocation examples.
  - **(d) LEAVE** `*/optimization-results.md` historical skill-name prose (e.g. `review-workspace/optimization-results.md:42` "lz-advisor-security-review") -- a historical record of a past description-optimization run; rewriting it misrepresents what was tested then.
  - This split honors RENAME-03 ("eval workspace references updated") for the only genuinely-runnable references (c) while protecting the test substrate (a/b/d). None of `evals/` is checked by the closing gate.

### `git grep` Closing Gate (RENAME-03) -- identifier-form, non-vacuous
- **D-08:** The gate is an **identifier-form** assertion, NOT a naive word search ("plan"/"execute"/"review" are pervasive English in the SKILL bodies -- a literal `git grep "review"` is both false-positive-prone and would make a "zero hits" target impossible). Pathspec `-- plugins/lz-advisor/`. Assert **ZERO** hits for the old-name identifier forms:
  - `^name: (plan|execute|review|security-review)$` (frontmatter)
  - `skills/(plan|execute|review|security-review)/` (directory paths)
  - un-prefixed slash form `/(plan|execute|review|security-review)\b` that is NOT `/lz-...` (the `\b` after the name also excludes `/plans/`)
  - `lz-advisor:(plan|execute|review|security-review)\b` (qualified -- already 0 today)
  Plus **POSITIVE** assertions: the 4 `skills/lz-*/` directories exist and each `SKILL.md` carries `name: lz-*`.
  The gate MUST NOT flag: prose "plan"/"review", `@plans/` / `/plans/`, "filename contains `plan`", or the agent ref `lz-advisor:advisor`.

### Phase 14 / Phase 15 Boundary
- **D-09:** Phase 14 performs NO version work: no 5-surface `version:` bump (that is REL-01, Phase 15), no README "What's New" 2.0.0 entry and no `CHANGELOG.md [2.0.0]` entry or migration table (REL-02, Phase 15), no tag/Release (REL-03). Phase 14 README edits are **skill-name-accuracy only** (the command table + prose slash refs). This keeps the version/release work from bleeding into the mechanical rename.

### RENAME-02 Verification (human_needed)
- **D-10:** The bare-form collision check MUST use the **interactive command picker**, never a headless `claude -p` probe -- headless invocation is structurally blind to bare-form collisions (memory `project_headless_probe_misses_bare_form_collisions`; Phase 9 D-08). The phase produces a precise manual-verification script: in an interactive session, type `/plan`, `/review`, `/security-review` and confirm the picker surfaces the Claude Code BUILT-IN (no lz-advisor skill shadowing); then confirm `/lz-plan` / `/lz-execute` / `/lz-review` / `/lz-security-review` resolve to the plugin skills. This is the phase's human_needed closing item (ROADMAP SC-4).

### Claude's Discretion
- Task/commit breakdown within the atomic unit (D-01) -- planner decides (e.g. mv+frontmatter / doc sweep / gate as separate tasks, or fewer).
- Exact gate implementation syntax (one `git grep -E` per pattern vs a combined alternation; a committed `tests/`-style script vs inline verification commands).
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Roadmap (locked scope)
- `.planning/REQUIREMENTS.md` -- RENAME-01..03 requirement text + the Locked Decisions table (all-four-rename incl. `execute`; MAJOR rationale; eval-disposition note).
- `.planning/ROADMAP.md` -- Phase 14 goal + the 4 success criteria (note SC-4 is the human_needed interactive-picker check).
- `.planning/PROJECT.md` -- "Current Milestone: v2.0.0" -> the 3 cross-ref classes (MUST-change / change-for-accuracy / looks-relevant-but-NOT) and the "bare-form collision MUST use the interactive picker" constraint.

### Precedent
- `.planning/milestones/v1.0-ROADMAP.md` (Phase 9) -- the prior dotted `lz-advisor.<skill>` -> plain `<skill>` rename: `git mv` history preservation, pathspec-scoped `git grep` closing gate, the eval-sweep precedent, and the D-08 headless-probe finding. Directly templates Phase 14.

### Files to edit (grounded by scout)
- `plugins/lz-advisor/skills/{plan,execute,review,security-review}/SKILL.md` -- the `name:` field (D-02) + the worked-example line at 56/59/57/58 (D-04 invocation token, D-06 `@plans//plans/`/literal traps) + sibling-skill description prose.
- `plugins/lz-advisor/README.md` -- command table + prose slash refs (D-04).
- `plugins/lz-advisor/references/orient-exploration.md` -- worked scenario lines 149-152 (D-04).
- `CLAUDE.md` (repo-root, project) §Conventions -- `claude -p` qualified examples (D-05).
- `evals/lz-advisor/conciseness-assessment.md` -- runnable invocation prefixes only (D-07c).

### Memory / conventions
- memory `project_headless_probe_misses_bare_form_collisions` -- WHY RENAME-02 cannot be headless (D-10).
- memory `feedback_no_cross_skill_body_references` -- skills must not reference another skill's named sections; relevant when editing the sibling-skill prose (keep it descriptive, not section-pointing).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Phase 9 rename methodology** is the direct, proven template: `git mv` for history, a pathspec-scoped (`-- plugins/lz-advisor/`) `git grep` closing gate, and the explicit "frozen `.planning/` history is excluded" rule. Reuse its shape rather than inventing a new gate.

### Established Patterns
- **Identifier-form vs prose distinction** (D-08): the plugin tree currently has ZERO qualified (`lz-advisor:<skill>`), slash-prefixed (`/lz-advisor:<skill>`), or `skills/<bare>/` path references -- Phase 9 already removed the dotted forms. The remaining old-name surface in-plugin is: 4 `name:` fields, 4 directory names, README/SKILL/reference **slash-form** + **prose** mentions of `/plan` etc. The gate must target structural forms because "plan"/"execute"/"review" are common English in these docs.
- **The worked-example trap line** appears in all 4 SKILL.md (56/59/57/58): one line mixes a skill invocation (`/plan` -> rename), a file path (`@plans/`, `/plans/` -> leave), and a literal substring ("filename contains `plan`" -> leave). Surgical edits, not blanket sed.

### Integration Points
- Claude Code derives the slash command + qualified `lz-advisor:<name>` from the skill **directory name** and the `name:` frontmatter -- renaming both in lockstep is what de-shadows the built-ins. Agents (`advisor`/`reviewer`/`security-reviewer`) are invoked BY skills via `subagent_type` and are untouched.

</code_context>

<specifics>
## Specific Ideas

- The rename is deliberately mechanical and behavior-preserving -- the user's intent (REQUIREMENTS.md) is "fix the shadowing bug," not "improve the skills." Resist any temptation to also touch agent prompts, budgets, or contracts during the sweep.
- Version `2.0.0` is the MAJOR bump for the breaking invocation-surface change, but it lands in **Phase 15**, atomically across 5 surfaces -- do not pre-bump in Phase 14.

</specifics>

<deferred>
## Deferred Ideas

- **Renaming eval filenames / workspace directories** (`lz-advisor-plan-eval.json`, `plan-workspace/`, ...) to the `lz-`-prefixed form -- deferred as optional housekeeping; not required for the shadowing fix or the gate, and would add churn. Could be a future tidy-up if eval naming consistency becomes desirable.

### Reviewed Todos (not folded)
- **Research RTK command suitability for skills and agents** (`research-rtk-command-suitability-for-skills-and-agents.md`, area: plugin-tooling, match score 0.6) -- REVIEWED, **NOT folded**. The match was on generic keyword overlap ("command, skills, phase, advisor, plugins"); the todo is about whether `rtk git diff` / `rtk gh pr diff` are appropriate inside the review/security-review skills (token-savings vs detail-loss). That is orthogonal to a mechanical directory rename. Folding it would violate the phase scope guardrail. Remains a backlog item (STATE.md Deferred Items).

</deferred>

---

*Phase: 14-lz-skill-rename*
*Context gathered: 2026-06-14*
