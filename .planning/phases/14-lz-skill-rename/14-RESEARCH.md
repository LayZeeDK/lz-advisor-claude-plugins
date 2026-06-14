# Phase 14: lz- skill rename - Research

**Researched:** 2026-06-14
**Domain:** Mechanical in-repo skill-directory rename + cross-reference sweep (Claude Code plugin, Markdown/YAML, git)
**Confidence:** HIGH (everything verified against the live tree with `git grep` / `git ls-files` / `git log --follow`; no external sources needed or used)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Treat the rename as ONE coherent atomic unit -- `git mv` the 4 skill dirs + edit 4 `name:` fields + sweep all in-repo accuracy refs together. HEAD after the phase is fully renamed and gate-green. History preserved via `git mv` (never delete+recreate). Task/commit breakdown within the unit is planner discretion.
- **D-02:** `skills/<bare>/` -> `skills/lz-<bare>/`; `name: <bare>` -> `name: lz-<bare>`. Qualified invocation -> `lz-advisor:lz-<bare>`, slash form `/lz-<bare>`. ALL FOUR skills get the prefix, including `execute` (does not itself collide) -- locked for suite consistency + `/lz-` autocomplete grouping.
- **D-03 (MUST-change, gated):** 4 skill dirs (`git mv`) + 4 `name:` fields. These ARE the rename.
- **D-04 (change-for-accuracy, IN-plugin, gate-covered):** plugin README slash refs; 4 SKILL.md worked-example invocations + cross-skill pointers; `references/orient-exploration.md` worked scenario; sibling-skill description prose.
- **D-05 (change-for-accuracy, OUTSIDE gate, by inspection):** repo-root `CLAUDE.md` `claude -p` examples; root `README.md` (0 refs empirically); `.planning/PROJECT.md` current-state refs (NOT frozen Evolution log).
- **D-06 (looks-relevant-but-NOT -- LEAVE):** agents' `lz-advisor:advisor`/`reviewer`/`security-reviewer` agent names; `@plans/` `/plans/` paths and "filename contains `plan`" literal; the `lz-advisor` plugin-name token; `.planning/` frozen history (pathspec-excluded).
- **D-07 (eval-tree disposition):** gate scoped to `plugins/lz-advisor/` only; `evals/` outside it. (a) LEAVE the 4 `*-eval.json` trigger queries; (b) LEAVE eval filenames + `*-workspace/` dir names; (c) UPDATE `conciseness-assessment.md` runnable invocation prefixes (lines 18/31/45/59); (d) LEAVE `*/optimization-results.md` historical prose.
- **D-08:** Identifier-form `git grep` closing gate, pathspec `-- plugins/lz-advisor/`. Assert ZERO old-name identifier forms + POSITIVE assertions (4 `skills/lz-*/` exist, each `name: lz-*`). Gate MUST NOT flag prose "plan"/"review", `@plans/`, `/plans/`, "filename contains `plan`", or `lz-advisor:advisor`.
- **D-09 (Phase 14/15 boundary):** Phase 14 does NO version work (no 5-surface bump = REL-01/Phase 15), NO CHANGELOG/What's-New 2.0.0 entry (REL-02/Phase 15), NO tag/Release (REL-03/Phase 15). README edits are skill-name-accuracy only.
- **D-10 (RENAME-02, human_needed):** bare-form collision check MUST use the INTERACTIVE command picker, never a headless `claude -p` probe. Phase's human_needed closing item (ROADMAP SC-4).

### Claude's Discretion
- Task/commit breakdown within the atomic unit (D-01).
- Exact gate implementation syntax (one `git grep -E` per pattern vs combined alternation; committed `tests/` script vs inline verification commands).

### Deferred Ideas (OUT OF SCOPE)
- Renaming eval filenames / `*-workspace/` directories to the `lz-` form (optional housekeeping; churn the rename does not need).
- The RTK-command-suitability todo (orthogonal to a mechanical rename; backlog).
- ALL version/release work -> Phase 15 (REL-01..03).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| RENAME-01 | 4 skill dirs + `name:` frontmatter `lz-`-prefixed via `git mv` (history preserved); qualified -> `lz-advisor:lz-<skill>` | Exact `git mv` invocations verified (Rename Mechanics); `git log --follow` already resolves across the Phase 9 rename (proven, 58 commits). `name:` at line 2 of each SKILL.md (verified). |
| RENAME-02 | Built-in `/plan`/`/review`/`/security-review` no longer shadowed; verified in INTERACTIVE picker (NOT headless) | Interactive-picker recipe (RENAME-02 Verification). Memory `project_headless_probe_misses_bare_form_collisions` + Phase 9 D-08 confirm headless blindness. |
| RENAME-03 | All in-repo refs updated in lockstep; closing `git grep` gate returns zero old-name hits under `plugins/lz-advisor/` | Complete VERIFIED cross-ref surface (file:line) + runnable 5-pattern gate with pre/post snapshots. |
</phase_requirements>

## Summary

Phase 14 is a purely mechanical, behavior-preserving rename: `git mv` four skill directories to the `lz-` prefix, edit the four `name:` frontmatter fields in lockstep, sweep every in-repo accuracy reference, and close with a scoped `git grep` gate. The Phase 9 dotted-to-plain rename (commits `d88df91` + `c21ab2f`, plugin 0.15.0) is the exact, proven template: a `git mv`-the-dirs commit followed by a cross-reference-sweep commit, with the gate pathspec-scoped to `plugins/lz-advisor/` and `.planning/` frozen history excluded.

CONTEXT.md is exhaustive and almost entirely correct against the live tree. Research VERIFIED D-01..D-10 and surfaced **three genuine gaps** the planner must fold in: (1) a class of **directory-form `<bare>/SKILL.md` cross-references** (5 occurrences across `agents/reviewer.md:388`, `agents/security-reviewer.md:410`, `references/context-packaging.md:373/417/418`) that D-06 wrongly assumes do not exist in agents and that the D-08 gate as specified completely misses -- these break after `git mv review lz-review`; (2) the `.gitignore:11` comment `/plan` token (Phase 9 edited it; outside the gate); (3) two extra CLAUDE.md current-state references (lines 52-58 tree comments and line 212 "skill directories are plain" prose) not enumerated in D-05's line list. Finding (1) is the most important -- without a 5th gate pattern, the gate reports false-GREEN while real cross-references dangle.

A second critical, ARM64-specific finding: on this machine **`git grep` silently swallows a pattern whose first literal character is `/`** -- `git grep '/plan'` returns EXIT 1 (zero hits) even though the string is present. A naive leading-slash gate pattern therefore produces a FALSE-GREEN, the worst failure for a regression gate. Every slash-form gate pattern below uses a bracketed `[/]` or a boundary-char alternation `(^|[^a-z-])/` to defeat this.

**Primary recommendation:** Replicate the Phase 9 two-commit shape (mv-dirs, then sweep). Use the 5-pattern gate below (4 negative + 2 positive), every slash pattern bracketed `[/]`. Fold the 5 directory-form `<bare>/SKILL.md` refs and the `.gitignore`/CLAUDE.md extras into the sweep. Defer ALL version/release work to Phase 15.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Skill slash-command / qualified name derivation | Claude Code plugin loader (skill directory name + `name:` frontmatter) | -- | Claude Code derives `/lz-<skill>` and `lz-advisor:lz-<skill>` from the directory name AND the `name:` field; renaming both in lockstep is what de-shadows the built-ins. |
| History preservation across the move | git (`git mv` + `git log --follow`) | -- | `git mv` stages source-delete + dest-add atomically; `--follow` resolves history across the boundary (already proven across the Phase 9 rename). |
| Cross-reference accuracy | Markdown docs (README, SKILL.md bodies, references, CLAUDE.md, PROJECT.md) | -- | Pure documentation edits; no runtime effect. The gate enforces the in-plugin subset; out-of-plugin refs verified by inspection. |
| De-shadowing verification | Interactive command picker (human) | -- | Bare-form collision is only observable in the interactive picker; headless `claude -p` is structurally blind to it (D-10). |

## Standard Stack

Not applicable. This phase installs NO external packages, adds NO dependencies, and writes NO code. The "stack" is git + the Bash/PowerShell shell + the project's existing Markdown/YAML files. The Package Legitimacy Audit, Environment Availability, and Security Domain sections are intentionally omitted (no external dependencies, no network, no new code surface).

## Architecture Patterns

### Rename Mechanics (RENAME-01)

**Verified live-tree state:**
- 4 skill dirs (verified via `git ls-files`): `plugins/lz-advisor/skills/{execute,plan,review,security-review}/SKILL.md`.
- `name:` field is at **line 2** of each SKILL.md (verified): `name: execute` / `name: plan` / `name: review` / `name: security-review`.
- `version:` field (verified): `execute:19`, `plan:18`, `review:19`, `security-review:19` -- all `1.0.1`. **DO NOT TOUCH** (Phase 15 / D-09).

**Exact `git mv` invocations (the 4 directory renames):**
```bash
git mv plugins/lz-advisor/skills/plan            plugins/lz-advisor/skills/lz-plan
git mv plugins/lz-advisor/skills/execute         plugins/lz-advisor/skills/lz-execute
git mv plugins/lz-advisor/skills/review          plugins/lz-advisor/skills/lz-review
git mv plugins/lz-advisor/skills/security-review plugins/lz-advisor/skills/lz-security-review
```
Then edit the four `name:` fields (line 2 of each moved SKILL.md): `name: plan` -> `name: lz-plan`, etc.

**Windows/Git-Bash gotchas (verified relevant on this arm64 host):**
- **Case:** the rename ADDS a prefix (`plan` -> `lz-plan`); it is not a case-only change, so NTFS/ReFS case-insensitivity is not a hazard here. (A case-only rename would need `git mv -f` or a two-step move; not applicable.)
- **Path quoting:** all four paths are ASCII with no spaces; no quoting needed. Run `git mv` directly (per CLAUDE.md: never `cd <path> &&`, never `git -C`).
- **Loop vs explicit:** four explicit `git mv` lines are clearest and match the Phase 9 commit body. A loop is acceptable (planner discretion) but the explicit form is self-documenting in the commit.
- **Per CLAUDE.md git rules:** prefer `git mv` for tracked renames (stages both sides atomically); NEVER `git add .`/`-A`/`-u`; stage specific files by name.

### Phase 9 Precedent (the direct template -- CITED from git history)

Verified via `git show --stat`:

- **`d88df91` `refactor(09-01): git mv four skill dirs to plain names`** -- the rename commit. Body lists the 4 moves; `git diff --stat` shows the four `{old => new}/SKILL.md | 0` rename entries (zero content change in the move commit). This is the model: one commit that is PURELY the four `git mv`s.
- **`c21ab2f` `refactor(09-01): drop dotted lz-advisor. skill-name prefix in plugin surfaces`** -- the sweep commit. Touched **11 files**: `.gitignore`, `README.md`, `agents/reviewer.md`, `agents/security-reviewer.md`, `references/context-packaging.md` (38 refs), `references/orient-exploration.md`, `references/verify-target-selection.md`, and the 4 `SKILL.md`. Commit body explicitly notes: ".gitignore comment -> /plan (ignore pattern /plans/ unchanged)" and "invariant Agent(lz-advisor:*) lines and @-load reference paths untouched".
- **`9304f83` `chore(09-01): bump plugin 0.14.2 -> 0.15.0 across 5 version surfaces`** -- the version bump was a SEPARATE commit, AFTER the rename+sweep. For Phase 14 the bump is a SEPARATE PHASE (15), confirming D-09: the rename does not carry version work.

**Direct lesson for Phase 14:** the Phase 9 sweep edited the agents and `verify-target-selection.md` -- contradicting CONTEXT.md D-06's claim that agents have "confirmed zero skill-invocation refs." See the Runtime State Inventory below for the live re-verification.

### Anti-Patterns to Avoid
- **Leading-slash gate pattern.** `git grep '/plan'` returns zero on this arm64 host (see Pitfall 1). NEVER write a gate pattern whose first literal char is `/`. Always bracket: `[/]plan\b`.
- **Naive `sed s#/plan#/lz-plan#g`.** Would corrupt `@plans/`, `/plans/`, and "filename contains `plan`" on the trap line, and would touch `/plans/` in `.gitignore:12`. Use surgical, token-aware edits.
- **delete + recreate the skill dirs.** Destroys `git log --follow` history. Use `git mv` only (D-01).
- **Bumping `version:` or adding a CHANGELOG/What's-New entry.** That is Phase 15 (D-09). Leave all 5 `version:` surfaces at `1.0.1`.

## Runtime State Inventory

This is a rename phase, so the runtime-state question applies: a Claude Code plugin has no database, no live service, no OS registration. The only "runtime state" is what Claude Code derives from the skill directory name + `name:` frontmatter (the slash command and qualified name) and any in-repo path references that point at the old directory names.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None -- no datastore; the plugin is pure Markdown/YAML. Verified (no `.mcp.json`, no DB, per project CLAUDE.md). | None |
| Live service config | None -- no external service holds the skill name. The skill name lives only in the directory name + `name:` field, both in git. | None |
| OS-registered state | None -- no Task Scheduler / pm2 / systemd registration. Plugin loads from disk by Claude Code at session start. | None |
| Secrets/env vars | None -- no secret or env var references the skill names. Verified. | None |
| Build artifacts | None -- no compilation/bundling (project CLAUDE.md: "All components are plain Markdown files; no compilation or bundling"). No `egg-info`, no `dist/`. | None |
| **In-repo path references to the old dir names (the real "runtime state" for a plugin rename)** | **5 directory-form `<bare>/SKILL.md` refs** (see below) + slash/name/qualified forms catalogued in Cross-Reference Surface. | Code/doc edit in lockstep with the `git mv`. |

**The canonical question -- "after every file is updated, what still points at the old name?":** The only non-obvious answer is the **directory-form cross-references** that name the old skill DIRECTORY as a path (`review/SKILL.md`), distinct from slash-invocations (`/review`). These dangle after `git mv` and are the gap below.

### GAP 1 (CONTEXT.md D-06 is WRONG here): directory-form `<bare>/SKILL.md` cross-references

CONTEXT.md D-06 states agents have "confirmed zero skill-invocation refs." VERIFIED FALSE. `git grep -nE '(plan|execute|review|security-review)/SKILL\.md' -- plugins/lz-advisor/` returns **5 hits** that reference the renamed directory as a PATH:

| file:line | Old ref | Must become | In gate scope? | Caught by D-08 as written? |
|-----------|---------|-------------|----------------|----------------------------|
| `agents/reviewer.md:388` | `` `review/SKILL.md` `` | `lz-review/SKILL.md` | YES (`plugins/lz-advisor/`) | **NO** -- no leading slash, no `skills/` prefix |
| `agents/security-reviewer.md:410` | `` `review/SKILL.md` `` | `lz-review/SKILL.md` | YES | **NO** |
| `references/context-packaging.md:373` | `review/SKILL.md` and `security-review/SKILL.md` | `lz-review/...` + `lz-security-review/...` | YES | **NO** |
| `references/context-packaging.md:417` | `` `review/SKILL.md` `` | `lz-review/SKILL.md` | YES | **NO** |
| `references/context-packaging.md:418` | `` `security-review/SKILL.md` `` | `lz-security-review/SKILL.md` | YES | **NO** |

These are **change-for-accuracy AND functionally stale** (the path no longer resolves after the move). The planner MUST (a) edit all 5, and (b) add the 5th gate pattern below so the gate actually catches a regression here. Note: keep these as descriptive path references; per memory `feedback_no_cross_skill_body_references`, do NOT turn them into section-pointing cross-skill body references -- they already are plain `<dir>/SKILL.md "section name"` mentions, which is fine; just update the directory token.

### GAP 2: `.gitignore:11` comment (outside gate -- D-05 class, CONTEXT.md missed it)
`.gitignore:11` = `# Transient /plan side-effect output (plan files written to cwd by skill)` -- a `/plan` slash token in a COMMENT. `.gitignore:12` = `/plans/` -- the actual ignore pattern, **LEAVE**. Phase 9 explicitly updated the line-11 comment ("`.gitignore comment -> /plan`"). `.gitignore` is at repo root, OUTSIDE `plugins/lz-advisor/`, so the gate won't catch it -> handle by inspection. Recommended new comment text: `# Transient /lz-plan side-effect output (plan files written to cwd by skill)`.

### GAP 3: CLAUDE.md current-state refs beyond D-05's line list
D-05 enumerates CLAUDE.md lines ~194/195/209/215. VERIFIED there are MORE current-state refs:
- `CLAUDE.md:52,54,56,58` -- directory-structure tree comments `(qualified: lz-advisor:plan)` / `:execute` / `:review` / `:security-review`. These describe the CURRENT invocation surface -> update to `lz-advisor:lz-plan` etc. for accuracy.
- `CLAUDE.md:212` -- prose "the skill directories are plain (`plan`, `execute`, `review`, `security-review`), so the qualified name is simply `lz-advisor:execute`". This becomes FALSE post-rename -> update (dirs are now `lz-plan` etc.; qualified is `lz-advisor:lz-execute`).
- `CLAUDE.md:194,195,209,215` -- the `claude -p` examples (D-05, confirmed): `lz-advisor:plan` -> `lz-advisor:lz-plan`, `lz-advisor:execute` -> `lz-advisor:lz-execute`.
All four CLAUDE.md edits are repo-root (outside the gate) -> verify by inspection. **Note:** `CLAUDE.md` is a project-instruction file; editing it is in-scope for accuracy but is a documentation change only (no behavior impact).

## Cross-Reference Surface (VERIFIED, file:line)

All counts/lines below are from `git grep` against the live tree on 2026-06-14. The "Disposition" column states CHANGE or LEAVE and the CONTEXT.md class.

### IN-PLUGIN, gate-covered (D-03 / D-04)

**D-03 -- MUST-change (the rename itself):**
- `skills/{plan,execute,review,security-review}/` (4 dirs) -> `git mv` to `lz-*`.
- `name:` line 2 of each: `skills/plan/SKILL.md:2`, `skills/execute/SKILL.md:2`, `skills/review/SKILL.md:2`, `skills/security-review/SKILL.md:2` -> `name: lz-*`.

**D-04 -- change-for-accuracy, slash/prose forms (`/<bare>` -> `/lz-<bare>`):**

`plugins/lz-advisor/README.md` (9 lines with bracketed-slash hits):
- `:11` prose `/plan`, `/execute`, `/review`, `/security-review`
- `:17,:18,:19,:20` the Skills table rows `` `/plan` `` ... `` `/security-review` ``
- `:48` "advisor for `/plan` and `/execute`, reviewer for `/review`, security-reviewer for `/security-review`"
- `:81` What's-New **1.0.1** changelog prose `/review` + `/security-review` (see note below)
- `:95,:96` What's-New **1.0.0** changelog prose `/plan`, `/execute`, `/review`, `/security-review` (see note below)

The 4 SKILL.md worked-example + cross-skill pointers:
- The trap line `/plan Address findings...` in ALL FOUR: `plan/SKILL.md:56`, `execute/SKILL.md:59`, `review/SKILL.md:57`, `security-review/SKILL.md:58` (token `/plan` -> `/lz-plan`; see Trap Line below).
- The second worked-example `/plan` with `---` block: `plan/SKILL.md:62`, `execute/SKILL.md:65`, `review/SKILL.md:63`, `security-review/SKILL.md:64`.
- `plan/SKILL.md:139` prose `(/execute)` -> `(/lz-execute)`.
- `plan/SKILL.md:212` `(use `/security-review` after implementation)` -> `/lz-security-review`.
- `plan/SKILL.md:223` `use /execute for implementation` -> `/lz-execute`.
- `plan/SKILL.md:230` `passed to `/execute` for implementation` -> `/lz-execute`.
- `review/SKILL.md:112` `deep security analysis is for `/security-review`` -> `/lz-security-review`.
- `review/SKILL.md:215` `Security threats are out of scope (use `/security-review`)` -> `/lz-security-review`.

`plugins/lz-advisor/references/orient-exploration.md` worked scenario:
- `:149` `/review`, `:150` `/plan`, `:152` `/execute` (the multi-skill chain). LEAVE the `@review-output.md` / `@plan-output.md` / `review-output.md` / `plan-output.md` file-path tokens on those same lines.
- `:130` prose "review file passed to plan-skill" -- bare PROSE nouns ("plan-skill", "execute-skill"), NOT slash/path forms; descriptive English -> see "Bare-prose nuance" below; safe to LEAVE for the gate (invisible to it) but the planner MAY tidy for consistency.

**D-04 -- sibling-skill DESCRIPTION prose (bare-word nouns, invisible to gate):**
- `plan/SKILL.md:14-17` description: "...handled by sibling skills execute, review, and security-review respectively."
- `execute/SKILL.md:14-18` description: "Optionally accepts a plan file from plan via @ file mention... handled by sibling skills plan, review, and security-review respectively." (`sibling skill` matched at `execute/SKILL.md:17`.)
- `review/SKILL.md:14-18` description: "use security-review instead... use plan or execute instead."
- `security-review/SKILL.md:15-18` description: "use review instead... use plan or execute instead."

**Bare-prose nuance (a refinement of D-04 the planner must understand):** these description references use the bare skill NAME as an English noun ("use `review` instead", "sibling skills plan, review, and security-review"). They are neither slash forms nor qualified forms, so the D-08 gate is BLIND to them -- updating them is accuracy-only and unverifiable by the gate. CONTEXT.md D-04 says to update "the analogous sibling-skill prose"; the recommended edit is to prefix to the new name (`lz-review`, `lz-plan`, etc.) so the descriptions stay truthful. **Caution:** the same descriptions contain quoted TRIGGER phrases (e.g. `plan/SKILL.md:7` `"plan"`, `execute/SKILL.md:9` `"execute"`, `review/SKILL.md:8` `"review"`, `security-review/SKILL.md:8` `"security-review"`). Those quoted trigger strings are description-match tokens (like the eval queries, D-07a) -- they are how a user's natural-language phrase activates the skill. Renaming the natural-language trigger words (e.g. changing the quoted `"review"` trigger) would DEGRADE triggering and is NOT required by the rename. Recommendation: update only the structural sibling-pointer nouns; LEAVE the quoted natural-language trigger phrases. This is a planner judgment call -- flag it for the discuss/plan step.

### OUT-OF-PLUGIN, by inspection (D-05) -- NOT gate-covered

- `CLAUDE.md:52,54,56,58` (tree comments, GAP 3), `:194,:195,:209,:215` (claude -p examples, D-05), `:212` (prose, GAP 3). All `lz-advisor:<bare>` -> `lz-advisor:lz-<bare>`.
- `.gitignore:11` comment `/plan` (GAP 2) -> `/lz-plan`; LEAVE `.gitignore:12` `/plans/`.
- Root `README.md`: VERIFIED **0** skill slash/qualified refs (`git grep` EXIT 1). No edit needed (confirms D-05's "0 refs empirically").
- `.planning/PROJECT.md`: VERIFIED **no edit needed**. `:24` (and the whole "Current Milestone: v2.0.0" block, lines 19-28) ALREADY uses the `lz-` form (`lz-plan`, `lz-execute`, ... written when context was gathered). Every other PROJECT.md hit (`:42,:43,:44,:46,:47,:53,:91,:110,:115,:146,:150,:152`) is a FROZEN Evolution-log / Key-Decisions / historical entry with dotted `lz-advisor.<skill>` or bare `/plan` -- D-05 explicitly excludes frozen Evolution-log entries. **Net: PROJECT.md requires zero edits.** (This corrects the ROADMAP SC-3 phrasing "PROJECT.md" -- the live current-state line is already correct.)

### EVAL TREE (D-07) -- NOT gate-covered (outside `plugins/lz-advisor/`)

- **UPDATE (D-07c):** `evals/lz-advisor/conciseness-assessment.md:18` `/plan`, `:31` `/execute`, `:45` `/review`, `:59` `/security-review` (runnable copy-paste invocation prefixes). VERIFIED these 4 lines.
- **LEAVE (D-07a):** the 4 `evals/lz-advisor/lz-advisor-*-eval.json` trigger queries (natural-language description-match tests).
- **LEAVE (D-07b):** eval filenames `lz-advisor-{plan,execute,review,security-review}-eval.json` + `{plan,execute,review,security-review}-workspace/` dirs (test-harness keys; deferred housekeeping).
- **LEAVE (D-07d):** `*-workspace/optimization-results.md` historical prose.

### LOOKS-RELEVANT-BUT-LEAVE (D-06) -- VERIFIED

- Agent NAMES `lz-advisor:advisor` / `lz-advisor:reviewer` / `lz-advisor:security-reviewer` (in SKILL `allowed-tools:` lines e.g. `plan/SKILL.md:19` `Agent(lz-advisor:advisor)`, and agent file bodies). These are AGENT identifiers, NOT skills -- LEAVE. The qualified-form gate pattern P4 (`lz-advisor:(plan|execute|review|security-review)\b`) does NOT match `:advisor`/`:reviewer`/`:security-reviewer` (verified: `:reviewer` shares the `review` prefix but `\b` after `review` requires a word boundary -- `reviewer` continues with `er`, so `review\b` fails to match `reviewer`; confirmed EXIT 1).
- `@plans/`, `/plans/`, "filename contains `plan`" on the trap lines -- file-path/substring tokens, LEAVE (excluded by `\b`: `/plans/` has `plan` followed by `s`, so `plan\b` does not match).
- The `lz-advisor` plugin-name token in `--plugin-dir` paths and `plugin.json` -- LEAVE (not a skill name).
- `.planning/` frozen history -- pathspec-excluded.

## The `git grep` Closing Gate (D-08) -- concretely runnable

### CRITICAL arm64 caveat baked into every pattern
`git grep '/plan'` returns **EXIT 1 / zero hits** on this host even though `/plan` is present (Pitfall 1). Therefore NO gate pattern starts with a literal `/`. Slash patterns use bracketed `[/]` (proven to work: `git grep '[/]plan'` returned 4 hits where `'/plan'` returned 0).

### NEGATIVE assertions (each must return ZERO hits / EXIT 1 when the rename is complete)

```bash
GATE_SCOPE="-- plugins/lz-advisor/"

# P1 -- frontmatter old name (pre-rename: 4 hits; post: 0)
git grep -nE '^name: (plan|execute|review|security-review)$' $GATE_SCOPE

# P2 -- skills/<bare>/ directory paths (pre: 0 already, Phase 9 clean; post: 0)
git grep -nE 'skills/(plan|execute|review|security-review)/' $GATE_SCOPE

# P3 -- un-prefixed slash form, bracketed to dodge the arm64 leading-slash bug.
#       \b after the name excludes /plans/ ; the [/] (not /lz-) excludes /lz-plan.
git grep -nE '[/](plan|execute|review|security-review)\b' $GATE_SCOPE

# P4 -- qualified old form (pre: 0 already; post: 0). \b excludes :advisor/:reviewer.
git grep -nE 'lz-advisor:(plan|execute|review|security-review)\b' $GATE_SCOPE

# P5 -- directory-form <bare>/SKILL.md cross-refs (THE GAP-1 PATTERN; pre: 5 hits; post: 0)
#       (^|[^a-z-]) boundary excludes lz-review/SKILL.md while matching review/SKILL.md
git grep -nE '(^|[^a-z-])(plan|execute|review|security-review)/SKILL\.md' $GATE_SCOPE
```

**Why P3 is correct (verified by simulation):** after the rename, the trap line reads `` `/lz-plan Address findings in @plans/upstream-review.md` ... (path matches `/plans/` and filename contains `plan`) ``. Running P3 against that simulated line returns EXIT 1 (zero), because: `/lz-plan` has the slash before `lz` not `plan`; `@plans/` and `/plans/` are excluded by `\b` (`plan` followed by `s`); "filename contains `plan`" has no leading slash. So P3 self-suffices WITHOUT a separate `lz-` exclusion. (If the planner prefers belt-and-suspenders, pipe `| rg -v '/lz-'` -- but it is provably unnecessary.)

**Combined one-shot wrapper (planner discretion -- D-08 allows either form):**
```bash
GATE_SCOPE="-- plugins/lz-advisor/"
fail=0
for pat in \
  '^name: (plan|execute|review|security-review)$' \
  'skills/(plan|execute|review|security-review)/' \
  '[/](plan|execute|review|security-review)\b' \
  'lz-advisor:(plan|execute|review|security-review)\b' \
  '(^|[^a-z-])(plan|execute|review|security-review)/SKILL\.md'; do
  if git grep -nE "$pat" $GATE_SCOPE; then
    echo "[GATE-FAIL] old-name hit for: $pat"; fail=1
  fi
done
[ "$fail" -eq 0 ] && echo "[GATE-PASS] no old-name identifier forms under plugins/lz-advisor/"
```

### POSITIVE assertions (each must HOLD when the rename is complete)

```bash
# A1 -- the 4 lz-* skill dirs exist (post: 4; pre: 0)
test "$(git ls-files 'plugins/lz-advisor/skills/lz-*/SKILL.md' | wc -l)" -eq 4 \
  && echo "[A1-PASS] 4 lz-* skill dirs" || echo "[A1-FAIL]"

# A2 -- each SKILL.md carries name: lz-* (post: 4; pre: 0)
test "$(git grep -cE '^name: lz-(plan|execute|review|security-review)$' -- plugins/lz-advisor/ | wc -l)" -eq 4 \
  && echo "[A2-PASS] 4 name: lz-* fields" || echo "[A2-FAIL]"
```

### Sample current (pre-rename) vs expected (post-rename) output

| Pattern | Pre-rename (VERIFIED 2026-06-14) | Expected post-rename |
|---------|----------------------------------|----------------------|
| P1 `^name: <bare>$` | 4 files (`plan:2 execute:2 review:2 security-review:2`) | 0 (EXIT 1) |
| P2 `skills/<bare>/` | 0 (EXIT 1 already -- Phase 9 clean) | 0 (EXIT 1) |
| P3 `[/]<bare>\b` | 7 files (README 9 lines, context-packaging 2, orient 4, execute 3, plan 6, review 4, security-review 2) | 0 (EXIT 1) |
| P4 `lz-advisor:<bare>\b` | 0 (EXIT 1 already) | 0 (EXIT 1) |
| P5 `<bare>/SKILL.md` | 3 files / 5 hits (reviewer.md:388, security-reviewer.md:410, context-packaging.md:373/417/418) | 0 (EXIT 1) |
| A1 `lz-*` dirs | 0 | 4 |
| A2 `name: lz-*` | 0 | 4 |

**Non-vacuity is proven:** P1 (4), P3 (7), P5 (5 hits) are NON-zero pre-rename -- the gate is meaningful, not a tautology. P2 and P4 are already zero (Phase 9 removed the dotted/path forms); they guard against regression introducing them.

## The Trap Line (VERIFIED -- present in all 4 SKILL.md)

`plan/SKILL.md:56`, `execute/SKILL.md:59`, `review/SKILL.md:57`, `security-review/SKILL.md:58` are byte-identical:

```
Input: `/plan Address findings in @plans/upstream-review.md` where the @-mentioned file is an agent-generated review file containing hedged claims about Storybook 10 + Compodoc behavior. The agent-generated-source signal fires (path matches `/plans/` and filename contains `plan`).
```

**The ONLY token that changes:** `/plan ` (the leading invocation, followed by a space + "Address") -> `/lz-plan `.

**Tokens on this line that MUST NOT change (D-06):**
- `@plans/upstream-review.md` -- @-mention file path.
- `` `/plans/` `` -- the directory-pattern literal inside backticks.
- "filename contains `plan`" -- the word `plan` is a literal-substring example, not an invocation.

A safe edit targets only the backticked-leading invocation `` `/plan Address `` -> `` `/lz-plan Address ``. Per CLAUDE.md, do NOT use a blanket `sed`; use a token-anchored Edit (e.g. match the literal `` `/plan Address findings `` to disambiguate from `@plans/` / `/plans/`). The same precision applies to the second worked example (`plan/SKILL.md:62` etc.) where `` `/plan` `` (backtick-slash-plan-backtick) is the invocation and any nearby `plans/` paths stay.

## RENAME-02 Verification Recipe (human_needed -- D-10)

**Why it cannot be headless** (memory `project_headless_probe_misses_bare_form_collisions`; Phase 9 D-08): a headless `claude -p "/lz-advisor:lz-plan ..."` probe uses the QUALIFIED name and proves the plugin skill resolves, but it is structurally blind to whether the BARE `/plan` still surfaces the plugin in the interactive picker. Bare-form collision is only observable in the interactive command picker.

**The precise manual steps a human runs (the phase's closing human_needed item, ROADMAP SC-4):**

1. Start an interactive Claude Code session with the plugin loaded:
   `claude --plugin-dir plugins/lz-advisor` (from this repo root) -- or with the installed marketplace plugin enabled.
2. **De-shadow assertions (the bug being fixed):** type each bare built-in and inspect the picker:
   - `/plan`   -> picker surfaces the Claude Code BUILT-IN `/plan` (NO `lz-advisor` skill in the list for the bare name).
   - `/review` -> picker surfaces the BUILT-IN `/review` (no lz-advisor shadowing).
   - `/security-review` -> picker surfaces the BUILT-IN `/security-review` (no lz-advisor shadowing).
   - (`/execute` has no built-in twin; confirm no stale bare `lz-advisor` `execute` entry remains.)
3. **Positive resolution assertions (the new names work):** type each `/lz-` form and confirm it resolves to the PLUGIN skill:
   - `/lz-plan`, `/lz-execute`, `/lz-review`, `/lz-security-review` each surface the `lz-advisor` skill.
4. Record the picker observations in the phase verification doc; mark RENAME-02 / SC-4 PASS only after a human confirms steps 2-3 interactively. If access/time blocks the interactive check, return it as `human_needed` (do NOT silently auto-pass via a headless probe).

(Reference precedent: Phase 9's D-08 confirmed all 4 skills resolved to `lz-advisor:<skill>` and that `/review` / `/security-review` resolved to the built-in -- but note Phase 9 used a headless transcript inspection for the QUALIFIED resolution; the bare-form collision conclusion is the part that genuinely needs the interactive picker, which is why this is human_needed.)

## Phase 14 / Phase 15 Boundary (D-09) -- CONFIRMED OUT of Phase 14

Verified against REQUIREMENTS.md traceability + ROADMAP:
- **OUT (Phase 15, REL-01):** the 5-surface `version:` bump 1.0.1 -> 2.0.0 (`plugin.json` + 4 SKILL.md `version:` fields). Phase 14 leaves all five at `1.0.1` (verified current: plugin SKILL.md `version: 1.0.1` x4).
- **OUT (Phase 15, REL-02):** `CHANGELOG.md [2.0.0]` entry + migration table; the plugin README "What's New" 2.0.0 entry. Phase 14 does NOT add a What's-New 2.0.0 block.
- **OUT (Phase 15, REL-03):** `git tag v2.0.0` + GitHub Release.
- **OUT (always):** any agent/skill persona, budget, or system-prompt change. The rename is mechanical and behavior-preserving (REQUIREMENTS.md "Out of Scope"; CONTEXT.md specifics).

**Subtlety on the README What's-New historical entries (`README.md:81,95,96`):** these are PAST-release changelog prose (### 1.0.1 and ### 1.0.0 sections) that contain `/plan`, `/review`, etc. They live INSIDE `plugins/lz-advisor/` so the **gate P3 will flag them** -- meaning the gate forces a decision. Two coherent options for the planner:
- **(Recommended) Update them too.** They describe the skills by their slash name; after the rename the accurate name is `/lz-plan` etc. Updating keeps the README internally consistent and lets the gate go green WITHOUT a pathspec exclusion. This is a skill-name-accuracy edit (allowed by D-09; it is NOT a version/CHANGELOG edit).
- **(Alternative) Treat them as frozen changelog history and exclude from the gate.** This complicates the gate (a `:!` pathspec or line-range carve-out) and risks the README claiming a `/review` that no longer exists. Not recommended.
This is the one spot where D-09 ("README edits are skill-name-accuracy only") and "frozen history" could be read as tension; the research recommendation is option 1 (update for accuracy -- it is name-accuracy, not version work). Flag for the planner to lock.

## Common Pitfalls

### Pitfall 1: `git grep` leading-slash false-GREEN (arm64, VERIFIED on this host)
**What goes wrong:** `git grep '/plan' -- plugins/lz-advisor/` returns EXIT 1 (zero hits) even though `/plan` appears on 7+ files. A leading-slash gate pattern reports the rename "complete" when it is not -- a silent false-GREEN, the worst possible regression-gate failure.
**Why it happens:** on this vendored arm64 git build a search pattern whose first literal character is `/` is swallowed (treated specially / pathspec-like). VERIFIED: `git grep '/plan'` -> 0; `git grep '[/]plan'` -> 4; `git grep -E '/plan'` -> 0; `git grep '[/]plan'` works.
**How to avoid:** ALWAYS bracket the slash in gate patterns: `[/](plan|...)\b`. Never `/plan`. (Per CLAUDE.md the project already prefers `git grep`; this caveat is the specific gotcha for THIS gate.)
**Warning signs:** a gate that "passes" on the very first run before any edit, or P3 returning 0 pre-rename (it should return 7).

### Pitfall 2: the gate misses directory-form cross-refs (GAP 1)
**What goes wrong:** after `git mv review lz-review`, the 5 `review/SKILL.md` path references dangle, but a 4-pattern D-08 gate (name + skills/ + slash + qualified) reports GREEN because none of those four patterns match `review/SKILL.md`.
**Why it happens:** `review/SKILL.md` has no leading slash, no `skills/` prefix, no `name:`, no `lz-advisor:` qualifier.
**How to avoid:** include gate pattern P5 `(^|[^a-z-])(plan|execute|review|security-review)/SKILL\.md`. VERIFIED it matches the 5 stale refs pre-rename and excludes `lz-review/SKILL.md` post-rename.
**Warning signs:** a code search for the old skill name after the move still finds `review/SKILL.md`.

### Pitfall 3: blanket sed corrupts file-path tokens
**What goes wrong:** `sed 's#/plan#/lz-plan#g'` turns `@plans/` into `@lz-plans/` (wait -- `/plan` is a substring of `/plans/`), and rewrites `/plans/` in `.gitignore:12`, and the "filename contains `plan`" literal.
**Why it happens:** `/plan` is a substring of `/plans/`; a naive global replace has no word-boundary awareness.
**How to avoid:** token-anchored Edits matching the invocation context (`` `/plan Address ``, `` `/plan` ``, `(/execute)`, table rows), never a global `/plan` -> `/lz-plan`.
**Warning signs:** post-edit `git grep '[/]lz-plans'` finds anything, or `.gitignore:12` changed.

### Pitfall 4: touching `version:` or the natural-language trigger phrases
**What goes wrong:** bumping `version:` (Phase 15 work leaks in) or renaming the quoted natural-language trigger phrases in descriptions (degrades skill triggering).
**How to avoid:** leave all 5 `version:` surfaces at `1.0.1` (D-09); in descriptions, update only the structural sibling-pointer nouns, leave quoted trigger strings (e.g. `"review"`, `"plan"`).
**Warning signs:** `git diff` shows a `version:` line changed, or a quoted trigger phrase changed.

## Validation Architecture

> `nyquist_validation: true` (verified in `.planning/config.json`). For this mechanical rename, validation is deterministic SHELL ASSERTIONS, not unit tests -- there is no code to unit-test. The git-grep gate IS the regression test.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Deterministic shell assertions (`git grep`, `git ls-files`, `git log --follow`). No JS/Python test runner -- no code in this phase. |
| Config file | none -- inline verification commands (or an optional committed `tests/` script; D-08 leaves this to planner discretion). |
| Quick run command | the 5-pattern negative gate + 2 positive assertions (see The Closing Gate). |
| Full suite command | gate + positive assertions + `git log --follow` history check for all 4 moved SKILL.md. |

### Phase Requirements -> Validation Map
| Req / SC | Behavior | Validation type | Automated command | Exists? |
|----------|----------|-----------------|-------------------|---------|
| RENAME-01 / SC-1 | 4 dirs + `name:` `lz-`-prefixed via `git mv` | positive shell assertion | A1: `test "$(git ls-files 'plugins/lz-advisor/skills/lz-*/SKILL.md' | wc -l)" -eq 4`; A2: `test "$(git grep -cE '^name: lz-(plan|execute|review|security-review)$' -- plugins/lz-advisor/ | wc -l)" -eq 4` | yes (inline) |
| RENAME-01 / SC-1 | history preserved across the move | history assertion | `for d in lz-plan lz-execute lz-review lz-security-review; do git log --follow --oneline -- "plugins/lz-advisor/skills/$d/SKILL.md" | rg -q d88df91 && echo "$d OK"; done` (each must resolve back through the Phase 9 rename commit `d88df91`) | yes (`--follow` proven across the prior rename, 58 commits) |
| RENAME-03 / SC-2 | zero old-name identifier hits under `plugins/lz-advisor/` | negative gate (PRIMARY regression gate) | P1..P5 each EXIT 1 (see The Closing Gate) | yes (inline) |
| RENAME-03 / SC-3 | doc refs updated for accuracy (README, CLAUDE.md, PROJECT.md) | inspection + gate (in-plugin subset gated; out-of-plugin by inspection) | gate covers README + SKILL.md + references; `CLAUDE.md`/`.gitignore`/`evals` verified by inspection (PROJECT.md = no edit) | partial -- out-of-plugin refs are inspection-only by nature |
| RENAME-02 / SC-4 | built-in `/plan`/`/review`/`/security-review` no longer shadowed | **human_needed -- interactive picker; CANNOT be auto-validated** | none (D-10): manual interactive-picker check (see RENAME-02 Verification Recipe) | n/a -- explicitly the one criterion not auto-validatable |

### Sampling Rate
- **Per edit/commit:** run P3 + P5 scoped to the file(s) just touched (fast).
- **Per atomic-unit completion (the single HEAD that must be gate-green):** full 5-pattern negative gate + A1/A2 positive + `git log --follow` history check.
- **Phase gate (before `/gsd-verify-work`):** full gate GREEN + the human_needed interactive-picker check completed (or returned as human_needed).

### Wave 0 Gaps
- None. No test infrastructure to scaffold -- the validation is git-native shell assertions that exist today. (Optional: the planner MAY commit a `tests/`-style gate script per D-08 discretion; not required.)

## State of the Art

Not applicable -- no library/framework evolution is relevant to an in-repo rename. The only "state of the art" is the project's own Phase 9 precedent, which is the canonical method (cited above).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The arm64 `git grep` leading-slash swallow is a property of THIS host's git build (reproduced live 4x), not a one-off | Pitfall 1 | LOW -- mitigated regardless: bracketed `[/]` patterns work whether or not the leading-slash bug is present. Even if the bug were absent, `[/]plan\b` is correct. |
| A2 | Updating the README What's-New historical `/plan` refs (option 1) is "name-accuracy" and within D-09, not "version/CHANGELOG work" | Phase 14/15 Boundary | LOW -- it is a slash-name edit, not a version-surface edit; but flagged for the planner to lock since D-09 phrasing could be read either way. |
| A3 | Quoted natural-language TRIGGER phrases in SKILL descriptions should be LEFT (renaming them degrades triggering) | Cross-Reference Surface (Bare-prose nuance) | MEDIUM -- this is a judgment call; if the user wants the literal trigger words prefixed, the recommendation flips. Flag in discuss/plan. |

**All other claims are VERIFIED against the live tree (file:line, exit codes) or CITED from git history (Phase 9 commits).**

## Open Questions

1. **README What's-New historical entries (`README.md:81,95,96`) -- update or exclude from gate?**
   - What we know: they live in-plugin so gate P3 flags them; they are past-release changelog prose with old slash names.
   - What's unclear: whether the user considers them "frozen changelog history" (leave) or "skill-name-accuracy" (update).
   - Recommendation: UPDATE (option 1) -- keeps the gate clean without a pathspec carve-out and the README truthful. Lock in plan.

2. **SKILL description sibling-pointer prose AND quoted trigger phrases -- how far to prefix?**
   - What we know: the structural sibling nouns ("use `review` instead") should become `lz-review`; the quoted natural-language triggers ("review", "plan") are description-match activation tokens.
   - What's unclear: whether to also prefix the quoted triggers.
   - Recommendation: prefix the structural sibling nouns only; LEAVE the quoted natural-language triggers (renaming them would hurt activation and is not required by the shadowing fix). Confirm with user.

3. **Commit shape within the atomic unit (D-01 planner discretion).**
   - Recommendation: mirror Phase 9 -- commit 1 = the four `git mv`s (pure rename, zero content change, preserves `--follow`); commit 2 = the cross-reference sweep (the 4 `name:` fields + README + SKILL bodies + references + the 5 directory-form refs + CLAUDE.md + .gitignore + conciseness-assessment.md). HEAD after commit 2 is the gate-green state.

## Sources

### Primary (HIGH confidence) -- live-tree verification, 2026-06-14
- `git ls-files plugins/lz-advisor/skills/` -- 4 skill dirs confirmed.
- `git grep -nE` runs for all 5 gate patterns + positive assertions -- exact file:line and exit codes captured (tables above).
- `git show --stat d88df91` (Phase 9 `git mv` commit) and `git show --stat c21ab2f` (Phase 9 sweep commit, 11 files) -- the precedent method, CITED.
- `git log --follow --oneline -- plugins/lz-advisor/skills/plan/SKILL.md` -- 58 commits resolving across the Phase 9 rename (history-preservation proof).
- `.planning/config.json` -- `nyquist_validation: true` confirmed.
- CONTEXT.md / REQUIREMENTS.md / ROADMAP.md / STATE.md / PROJECT.md -- read in full.

### Secondary -- project memory (conventions)
- `project_headless_probe_misses_bare_form_collisions` -- WHY RENAME-02 must be interactive (D-10).
- `feedback_no_cross_skill_body_references` -- keep the directory-form refs descriptive, not section-pointing.

## Metadata

**Confidence breakdown:**
- Rename mechanics: HIGH -- exact `git mv` paths verified; Phase 9 method cited from git history; arm64 `git mv` gotchas assessed (none blocking).
- Cross-reference surface: HIGH -- every reference located by file:line with exit codes; 3 CONTEXT.md gaps surfaced and verified.
- Gate design: HIGH -- all 5 patterns + 2 positive assertions run live; pre/post behavior simulated and confirmed (including the arm64 leading-slash false-GREEN hazard and its bracketed-`[/]` fix).
- RENAME-02 recipe: HIGH on the WHY (memory + Phase 9), MEDIUM on the exact picker UX wording (interactive UI not exercisable headlessly).

**Research date:** 2026-06-14
**Valid until:** stable -- this is an in-repo rename; valid until the tree changes. Re-run the pre-rename gate snapshot if substantial edits land before planning.
