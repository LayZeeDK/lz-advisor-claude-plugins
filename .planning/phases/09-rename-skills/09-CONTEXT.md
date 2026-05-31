# Phase 9: Rename Skills - Context

**Gathered:** 2026-06-01 (discuss mode, --analyze)
**Status:** Ready for planning

<domain>
## Phase Boundary

Reverse the Phase 5.2 naming decision: rename the four skill directories and their
`name:` frontmatter fields from the `lz-advisor.<skill>` dotted pattern back to plain
`<skill>` -- `plan`, `execute`, `review`, `security-review`. The qualified
`<plugin>:<skill>` form (`lz-advisor:plan`) already supplies namespacing, and Claude Code
normalizes `.` to `-` in the qualified name, so the `lz-advisor.` prefix only produces the
redundant `lz-advisor:lz-advisor-plan` and adds no value.

This phase is a mechanical rename plus its cross-reference sweep across operational
surfaces. It does NOT change skill behavior, agent prompts, the executor-advisor loop, or
any contract other than the user-facing skill name and its invocation strings.

</domain>

<decisions>
## Implementation Decisions

### Rename Target (reverses Phase 5.2 D-01/D-02)

- **D-01:** Skill `name:` frontmatter fields change from `lz-advisor.<skill>` to plain
  `<skill>`. New names: `plan`, `execute`, `review`, `security-review`. Qualified forms
  become `lz-advisor:plan`, `lz-advisor:execute`, `lz-advisor:review`,
  `lz-advisor:security-review` (clean, no redundant prefix).
- **D-02:** Skill directories rename to match the name fields via `git mv`:
  `skills/lz-advisor.plan/` -> `skills/plan/`, and likewise for execute, review,
  security-review. `git mv` preserves history (global rule + Phase 5.2 D-09 precedent).
- **D-03:** Agent names are unchanged -- they are already plain (`advisor`, `reviewer`,
  `security-reviewer`). Consequently every `allowed-tools: Agent(lz-advisor:advisor)` line
  in the SKILL.md frontmatter is left untouched. Only skill-name references change.
- **D-04:** `@${CLAUDE_PLUGIN_ROOT}/references/*.md` load paths are unchanged. The three
  reference files keep their filenames; only their internal *mentions* of skill names
  (`context-packaging.md` x19, `orient-exploration.md` x4, `verify-target-selection.md` x3)
  are rewritten.

### Blast Radius -- Operational Sweep

- **D-05:** Update only operational/load-bearing surfaces; leave the frozen historical
  audit trail intact. Concretely, the rename sweep touches:
  - **Plugin (mandatory -- phase goal):** 4 skill directories + 4 SKILL.md `name:` fields +
    in-body skill-name references; `references/context-packaging.md`,
    `references/orient-exploration.md`, `references/verify-target-selection.md`;
    `agents/reviewer.md` (x1), `agents/security-reviewer.md` (x1); `README.md` (x6);
    `.claude-plugin/plugin.json` (version); `.gitignore` (x1).
  - **Project doc:** `CLAUDE.md` (x15) -- directory-structure diagram, naming-convention
    section, skill-verification convention strings, and the dot->hyphen normalization note.
  - **Evals:** 4 `evals/lz-advisor/*-eval.json` query strings,
    `evals/lz-advisor/conciseness-assessment.md` (x4), and the 4 workspace directories
    `evals/lz-advisor/lz-advisor.<skill>-workspace/` -> `<skill>-workspace/` (`git mv`).
  - **Live regression-gate smoke fixtures:** the `-p "/lz-advisor.<skill> ..."` invocation
    strings (and comments) in `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/*.sh`.
    These actively invoke skills via `claude -p`; if not updated they break on the next
    regression run.
- **D-06:** Leave the frozen historical artifacts untouched: phase CONTEXT/PLAN/SUMMARY/
  VERIFICATION/UAT documents and the version-pinned UAT runners
  (`uat-replay-*/runners/`, `uat-plan-07-rerun/`, `uat-pattern-d-replay/`, the various
  `regression-gate-*/` runners). Rewriting them would (a) make true historical statements
  (e.g. "Phase 5.2 renamed the skills to `lz-advisor.plan`") inaccurate, and (b) add high
  churn and error risk to ~371 `.planning/` files for no operational benefit. The
  distinction within `.planning/`: the `05.4/smoke-tests/*.sh` are *maintained gates*
  (update); the `uat-replay-*/runners/` are *version-pinned reproductions* (leave).

### Invocation Contract -- Context-Dependent

- **D-07:** Canonical documented invocation differs by context:
  - **Interactive** (README, CLAUDE.md prose, the skill picker): bare `/plan`, `/execute`,
    `/review`, `/security-review`. The skill picker shows the plugin name in each item's
    description, which disambiguates the collision with Claude Code's built-in `/review`
    and `/security-review` commands. (User-confirmed: bare shorthand resolves and the
    picker shows the plugin name.)
  - **Headless** (`claude -p` skill-verification convention + smoke-fixture `-p` strings):
    qualified `/lz-advisor:<skill>`. There is no picker in headless mode, so a bare
    `/review` / `/security-review` could silently resolve to the built-in PR-review /
    security-review command instead of the plugin skill. Qualification removes that risk.
- **D-08:** Execution MUST empirically verify resolution before committing the documented
  invocation strings: a quick `claude -p` probe confirming that (a) the qualified
  `/lz-advisor:<skill>` form resolves to the plugin skill headlessly, and ideally (b) the
  bare forms resolve as expected. This closes the open Phase 5.2 D-07 "bet on resolution"
  (which was never empirically verified) and de-risks the load-bearing headless gates.
- **D-09:** Update the CLAUDE.md dot->hyphen normalization gotcha (currently
  "`lz-advisor.execute` -> `lz-advisor:lz-advisor-execute`") to reflect the new clean
  normalization (`lz-advisor:execute`), and update the headless `claude -p` example strings
  in the skill-verification convention from `/lz-advisor.<skill>` to `/lz-advisor:<skill>`.

### Version

- **D-10:** MINOR bump `0.14.2 -> 0.15.0`, signalling the skill-name contract change
  (mirrors Phase 5.2's minor bump for the same rename in the other direction). Applied
  atomically across the 5 version surfaces (plugin.json + 4 SKILL.md `version:` fields).
  Note: the plugin is pre-publication (no external consumers yet) and version numbers are
  not load-bearing in pre-release, so the bump is for signal clarity, not compatibility.

### Claude's Discretion

- Plan breakdown and ordering within Phase 9 (single rename plan vs. plugin-then-docs split).
- Exact mechanics of the cross-reference find/replace, provided `git mv` is used for the
  directory renames and the 5-surface version sync is atomic.
- Whether to additionally smoke-test the bare interactive forms (picker behavior is hard to
  assert headlessly); the qualified-form headless probe in D-08 is the mandatory gate.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Plugin surfaces to modify (skill names + version)
- `plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md` -- rename dir -> `skills/plan/`; `name:` -> `plan`; body refs (x11); `version:` -> 0.15.0
- `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` -- rename dir -> `skills/execute/`; `name:` -> `execute`; body refs (x7); `version:` -> 0.15.0
- `plugins/lz-advisor/skills/lz-advisor.review/SKILL.md` -- rename dir -> `skills/review/`; `name:` -> `review`; body refs (x9); `version:` -> 0.15.0
- `plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md` -- rename dir -> `skills/security-review/`; `name:` -> `security-review`; body refs (x6); `version:` -> 0.15.0
- `plugins/lz-advisor/.claude-plugin/plugin.json` -- `version` -> 0.15.0 (5-surface sync anchor)
- `plugins/lz-advisor/references/context-packaging.md` -- skill-name mentions (x19; heaviest reference)
- `plugins/lz-advisor/references/orient-exploration.md` -- skill-name mentions (x4)
- `plugins/lz-advisor/references/verify-target-selection.md` -- skill-name mentions (x3)
- `plugins/lz-advisor/agents/reviewer.md` -- skill-name mention (x1); `Agent(lz-advisor:advisor)` NOT affected
- `plugins/lz-advisor/agents/security-reviewer.md` -- skill-name mention (x1)
- `plugins/lz-advisor/README.md` -- invocation examples + skill-name mentions (x6)
- `.gitignore` -- skill-name reference (x1)

### Project documentation
- `CLAUDE.md` -- directory-structure diagram (~L49-58), naming-conventions section (~L145), skill-verification convention `claude -p` strings (~L194-195, L209, L215), dot->hyphen normalization gotcha (L212). 15 occurrences total.

### Eval infrastructure
- `evals/lz-advisor/lz-advisor-plan-eval.json`, `-execute-eval.json`, `-review-eval.json`, `-security-review-eval.json` -- query strings (x1 each)
- `evals/lz-advisor/conciseness-assessment.md` -- skill-name mentions (x4)
- `evals/lz-advisor/lz-advisor.plan-workspace/`, `lz-advisor.execute-workspace/`, `lz-advisor.review-workspace/`, `lz-advisor.security-review-workspace/` -- `git mv` to `<skill>-workspace/`

### Live regression-gate smoke fixtures (update `-p` invocation strings to qualified form)
- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/DEF-response-structure.sh` (x5)
- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/HIA-discipline.sh` (x3)
- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/B-pv-validation.sh` (x2)
- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-reviewer-budget.sh` (x2)
- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-security-reviewer-budget.sh` (x2)
- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/F-class-2-escalation.sh` (x2)
- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-advisor-budget.sh` (x1)
- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/E-verify-before-commit.sh` (x1)
- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/G-advisor-narrative-sd-pv.sh` (x1)
- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/J-narrative-isolation.sh` (x1)
- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/KCB-economics.sh` (x1)

### Prior phase context (the decision being reversed)
- `.planning/phases/05.2-rename-skills-and-resolve-preamble-waste-for-advisor-agent/05.2-CONTEXT.md` -- D-01/D-02 introduced the `lz-advisor.<skill>` prefix; D-07 was the unverified "bet on resolution"; D-22 kept evals valid. Phase 9 reverses D-01/D-02 and closes D-07 empirically (Phase 9 D-08).

### Roadmap rationale
- `.planning/ROADMAP.md` Phase 9 section + "Roadmap Evolution" note (Phase 9 added) -- the namespacing-redundancy rationale and the two watch items (skill-name normalization; headless `claude -p` invocation strings).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `git mv` for the 4 skill directory renames and 4 eval workspace directory renames (preserves history; loop with `git mv`, never bulk `git add`).
- The rename is a near-mechanical find/replace of `lz-advisor.<skill>` -> `<skill>` everywhere EXCEPT inside paths that are themselves being `git mv`-renamed.
- Phase 8 0.14.1 / 0.14.2 atomic 5-surface version bumps are the template for the 0.15.0 sync (plugin.json + 4 SKILL.md `version:` fields).

### Established Patterns
- Atomic 5-surface version sync is a hard project convention (byte-consistent, no residue).
- Agent names are plain and stay plain -> `allowed-tools: Agent(lz-advisor:<agent>)` lines are invariant under this rename.
- Reference files are `@`-loaded by path, not by skill name -> reference *paths* are invariant; only their textual skill-name mentions change.
- `.planning/` has two classes of `.sh` fixture: maintained gates (`05.4/smoke-tests/`) vs. version-pinned reproductions (`uat-replay-*/runners/`, `regression-gate-*/`). Only the former are operational and in-scope.

### Integration Points
- `git mv` directory renames (skills + eval workspaces).
- CLAUDE.md directory-structure diagram, naming-conventions section, skill-verification `claude -p` convention strings, and the dot->hyphen normalization gotcha (L212).
- README invocation examples.
- Live smoke-fixture `-p` invocation strings.
- Eval JSON query strings + workspace directories.
- A `claude -p` resolution probe (Phase 9 D-08) gating the documented headless invocation strings.

</code_context>

<specifics>
## Specific Ideas

- User is "fairly confident" the bare `/plan`, `/review`, `/security-review` resolve
  interactively: when typing `/plan`, the skill/command picker shows the plugin name in
  each item's description, which disambiguates the built-in `/review` and
  `/security-review` collisions.
- The qualified `plugin:skill` form is the namespacing mechanism, which is the entire
  rationale for dropping the redundant `lz-advisor.` directory prefix.
- The headless `claude -p` path has no picker, which is why D-07 splits the canonical
  invocation by context and D-08 mandates an empirical resolution probe.

</specifics>

<deferred>
## Deferred Ideas

### Reviewed Todos (not folded)
- **Research RTK command suitability for skills and agents** (`plugin-tooling`, matched
  score 0.6 on generic keywords only) -- evaluating `rtk git diff` / `rtk gh pr diff`
  token-savings vs. detail-loss for the review/security-review skills. Out of scope for a
  mechanical rename phase; remains a standalone pending todo for a future phase.

</deferred>

---

*Phase: 09-rename-skills*
*Context gathered: 2026-06-01*
