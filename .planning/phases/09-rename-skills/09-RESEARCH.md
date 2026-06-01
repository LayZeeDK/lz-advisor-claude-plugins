# Phase 9: Rename Skills - Research

**Researched:** 2026-06-01
**Domain:** Mechanical skill rename + cross-reference sweep; Claude Code plugin skill-name resolution (headless vs interactive)
**Confidence:** HIGH (counts verified against live tree; resolution behavior CITED from official docs + corroborated by real session logs)

<user_constraints>
## User Constraints (from 09-CONTEXT.md)

### Locked Decisions

- **D-01:** Skill `name:` frontmatter fields change `lz-advisor.<skill>` -> plain `<skill>` (`plan`, `execute`, `review`, `security-review`). Qualified forms become `lz-advisor:plan` etc.
- **D-02:** Skill directories rename via `git mv`: `skills/lz-advisor.plan/` -> `skills/plan/` (and execute, review, security-review). History-preserving.
- **D-03:** Agent names unchanged (already plain: `advisor`, `reviewer`, `security-reviewer`). Every `allowed-tools: Agent(lz-advisor:advisor)` line is INVARIANT. Only skill-name references change.
- **D-04:** `@${CLAUDE_PLUGIN_ROOT}/references/*.md` load paths unchanged; reference filenames unchanged. Only the *textual skill-name mentions* inside the three reference files are rewritten.
- **D-05:** Update only operational/load-bearing surfaces (plugin + CLAUDE.md + evals + the 11 maintained smoke fixtures). See file inventory below.
- **D-06:** Leave frozen historical artifacts (phase CONTEXT/PLAN/SUMMARY/VERIFICATION/UAT docs; `uat-replay-*/runners/`, `regression-gate-*/`, etc.) untouched. The `05.4/smoke-tests/*.sh` are maintained gates (update); `uat-replay-*/runners/` are version-pinned reproductions (leave).
- **D-07:** Canonical invocation differs by context. Interactive: bare `/plan`, `/execute`, `/review`, `/security-review` (picker disambiguates the built-in collision). Headless (`claude -p`): qualified `/lz-advisor:<skill>` (no picker; bare forms can resolve to built-ins).
- **D-08:** Execution MUST empirically verify resolution (a `claude -p` probe) before committing the documented invocation strings.
- **D-09:** Update CLAUDE.md dot->hyphen normalization gotcha to the new clean form (`lz-advisor:execute`); update headless `claude -p` example strings from `/lz-advisor.<skill>` to `/lz-advisor:<skill>`.
- **D-10:** MINOR bump `0.14.2 -> 0.15.0`, applied atomically across the 5 version surfaces (plugin.json + 4 SKILL.md `version:`).

### Claude's Discretion

- Plan breakdown/ordering within Phase 9 (single plan vs. plugin-then-docs split).
- Exact find/replace mechanics, provided `git mv` for directories and atomic 5-surface version sync.
- Whether to additionally smoke-test bare interactive forms; the qualified-form headless probe (D-08) is the mandatory gate.

### Deferred Ideas (OUT OF SCOPE)

- Research RTK command suitability for skills/agents -- standalone pending todo, NOT this phase.
</user_constraints>

## Summary

Phase 9 is a near-mechanical rename: collapse the redundant `lz-advisor.` directory/name prefix from the four skills to plain `<skill>`. The qualified `plugin:skill` form already supplies namespacing. Two researchable risks drove this investigation, and both resolved cleanly.

**Area A (counts):** CONTEXT.md's per-file numbers are *line counts*. The actual *occurrence* counts are higher in four files because some lines carry two dotted refs. Verification acceptance criteria MUST use occurrence counts (`git grep -o | wc -l`), not line counts (`git grep -c`), or the rename will false-pass. Additionally, three placeholder-form refs (`/lz-advisor.<skill>`) exist that CONTEXT.md's literal-name list omits and that still require updating to the colon form per D-07/D-09. No operational scope leak: every dotted ref outside `.planning/` lives in a CONTEXT-named surface. The 362 frozen `.planning/` files are correctly out of scope (D-06).

**Area B (resolution):** Official Claude Code docs confirm (1) for a plugin `skills/` subdirectory, the **directory name** -- not the `name:` frontmatter -- determines the slash command, namespaced by plugin (`my-plugin/skills/review/SKILL.md` -> `/my-plugin:review`); and (2) built-in `/init`, `/review`, `/security-review` ARE invokable via the Skill tool, confirming the D-07 collision. Real Phase 7/8 session logs show the *current* dotted skill resolves headlessly to the normalized form `<command-name>/lz-advisor:lz-advisor-plan</command-name>`. After rename, the equivalent proof for `/lz-advisor:plan` is `<command-name>/lz-advisor:plan</command-name>` in the stream-json -- this is the D-08 probe's success assertion.

**Primary recommendation:** Two-pattern verification (literal names + `lz-advisor.<` placeholder). Use occurrence counts. `git mv` the 8 directories independently of content edits (no path-string collision exists). Run the D-08 headless probe asserting `<command-name>/lz-advisor:<skill></command-name>` BEFORE writing the documented invocation strings; document headless as qualified `/lz-advisor:<skill>` and interactive as bare `/<skill>`.

## Phase Requirements

No phase requirement IDs were mapped (`phase_req_ids` is null). Phase 9 is scoped entirely by 09-CONTEXT.md decisions D-01..D-10. It does not close any REQUIREMENTS.md requirement; it reverses the Phase 5.2 naming decision and empirically closes the open Phase 5.2 D-07 "bet on resolution."

## Verified File Inventory + Occurrence Counts (Area A)

**Counting method:** `git grep -o -E "lz-advisor\.(plan|execute|review|security-review)"` for literal skill-name occurrences (NOT lines). `git grep -o -E "lz-advisor\.<"` for placeholder forms. Verified 2026-06-01 against the live tracked tree. The `Agent(lz-advisor:advisor)` lines (colon, agent refs) and the bare plugin name are NOT matched by these patterns (confirmed: the `lz-advisor\.(advisor|reviewer)` probe returns zero).

### Plugin surfaces (mandatory -- phase goal)

| File | CONTEXT count (lines) | LIVE occurrences | Discrepancy | Notes |
|------|----------------------|------------------|-------------|-------|
| `plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md` | 11 | **12** | +1 | `name:` field + trigger phrase + cross-refs + `/lz-advisor.plan` examples; one line carries two refs |
| `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` | 7 | **8** | +1 | one multi-ref line |
| `plugins/lz-advisor/skills/lz-advisor.review/SKILL.md` | 9 | 9 | 0 | match |
| `plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md` | 6 | 6 | 0 | match |
| `plugins/lz-advisor/references/context-packaging.md` | 19 | **25** | +6 | heaviest reference; multiple multi-ref lines |
| `plugins/lz-advisor/references/orient-exploration.md` | 4 | 4 | 0 | match |
| `plugins/lz-advisor/references/verify-target-selection.md` | 3 | **4** | +1 | L4 has TWO refs (`lz-advisor.plan` and `lz-advisor.execute`) on one line |
| `plugins/lz-advisor/agents/reviewer.md` | 1 | 1 | 0 | skill-name mention; `Agent(lz-advisor:advisor)` NOT affected |
| `plugins/lz-advisor/agents/security-reviewer.md` | 1 | 1 | 0 | match |
| `plugins/lz-advisor/README.md` | 6 | 6 | 0 | rows L17-20 (`/lz-advisor.<skill>` table) + L93-94 changelog prose |
| `.gitignore` | 1 | 1 | 0 | **comment only** (L11): `# Transient /lz-advisor.plan side-effect output`. The actual ignore pattern (L12) is `/plans/` -- unaffected. Update the comment text `/lz-advisor.plan` -> `/plan` |

### Project documentation

| File | CONTEXT count | LIVE literal | LIVE placeholder | Combined | Notes |
|------|---------------|--------------|------------------|----------|-------|
| `CLAUDE.md` | 15 | 21 | 2 | **23** | See per-line transform map below. Context-sensitive (NOT uniform replace) |

### Eval infrastructure

| File | CONTEXT count | LIVE | Notes |
|------|---------------|------|-------|
| `evals/lz-advisor/lz-advisor-plan-eval.json` | 1 | 1 | content query string only; **FILENAME already uses hyphen** (`lz-advisor-plan-eval.json`) -- do NOT rename file |
| `evals/lz-advisor/lz-advisor-execute-eval.json` | 1 | 1 | content only |
| `evals/lz-advisor/lz-advisor-review-eval.json` | 1 | 1 | content only |
| `evals/lz-advisor/lz-advisor-security-review-eval.json` | 1 | 1 | content only |
| `evals/lz-advisor/conciseness-assessment.md` | 4 | 4 literal + 1 placeholder = **5** | L12 has `/lz-advisor.<skill>` placeholder (not in CONTEXT's "x4"); L18/31/45/59 literal prompts |

### Eval workspace directories (`git mv`)

| Directory | Tracked files | `git mv` target |
|-----------|---------------|-----------------|
| `evals/lz-advisor/lz-advisor.plan-workspace/` | 2 (`before-description.txt`, `optimization-results.md`) | `evals/lz-advisor/plan-workspace/` |
| `evals/lz-advisor/lz-advisor.execute-workspace/` | 2 | `evals/lz-advisor/execute-workspace/` |
| `evals/lz-advisor/lz-advisor.review-workspace/` | 2 | `evals/lz-advisor/review-workspace/` |
| `evals/lz-advisor/lz-advisor.security-review-workspace/` | 2 | `evals/lz-advisor/security-review-workspace/` |

Workspace file CONTENTS contain ZERO dotted skill-name refs -- only the directory names need `git mv`. (Verified.)

### Live regression-gate smoke fixtures (maintained gates -- update `-p` strings)

All 11 confirmed; occurrence counts match CONTEXT.md D-05 exactly (literal only; no placeholders). Total = **21 occurrences**.

| Fixture (`.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/`) | Occurrences |
|--------------|-------------|
| `DEF-response-structure.sh` | 5 |
| `HIA-discipline.sh` | 3 |
| `B-pv-validation.sh` | 2 |
| `D-reviewer-budget.sh` | 2 |
| `D-security-reviewer-budget.sh` | 2 |
| `F-class-2-escalation.sh` | 2 |
| `D-advisor-budget.sh` | 1 |
| `E-verify-before-commit.sh` | 1 |
| `G-advisor-narrative-sd-pv.sh` | 1 |
| `J-narrative-isolation.sh` | 1 |
| `KCB-economics.sh` | 1 |

### Totals (BEFORE rename)

- **Operational tree** (plugin + evals + CLAUDE.md + .gitignore): **111 unique occurrences** = 107 literal + 3 placeholder (`lz-advisor.<`) + 1 hyphen-normalized qualified (`lz-advisor:lz-advisor-execute` at CLAUDE.md L212). The 4 dot-form qualified comments (CLAUDE.md L52-58 `lz-advisor:lz-advisor.plan`) are counted within the 107 literal.
- **In-scope smoke fixtures:** 21 occurrences.
- **Directory renames:** 8 (`git mv`): 4 skill dirs + 4 eval workspace dirs (16 tracked files moved).
- **Version-field bumps:** 5 surfaces (currently all `0.14.2`, verified).

### Discrepancies flagged for planner

1. **CONTEXT counts are LINE counts; acceptance criteria need OCCURRENCE counts.** Use `git grep -o ... | wc -l`, never `git grep -c`. Affected files: `context-packaging.md` (19->25), `CLAUDE.md` (15->23), `lz-advisor.plan/SKILL.md` (11->12), `lz-advisor.execute/SKILL.md` (7->8), `verify-target-selection.md` (3->4). A line-count acceptance criterion would let multi-ref lines slip through partially renamed.
2. **Placeholder forms omitted from CONTEXT's literal list (3 occurrences):** `CLAUDE.md:187`, `CLAUDE.md:198`, `evals/lz-advisor/conciseness-assessment.md:12` -- all `/lz-advisor.<skill...>`. These need updating to colon form (`/lz-advisor:<skill...>`) per D-07/D-09. The verification regex MUST include the `lz-advisor.<` alternation.
3. **No scope leak:** every dotted skill-name ref outside `.planning/` lives in a CONTEXT-named operational surface (verified by exclusion grep). No missed operational file.

### In-scope vs. frozen boundary (D-06 confirmation)

- **In-scope `.planning/` files (maintained gates):** ONLY the 11 `.sh` under `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/`.
- **Frozen `.planning/` (LEAVE -- 362 tracked files contain dotted refs):** all phase CONTEXT/PLAN/SUMMARY/VERIFICATION/RESEARCH/UAT docs, all `uat-replay-*/runners/`, `uat-plan-07-rerun/`, `uat-pattern-d-replay/`, `regression-gate-*/`, and the session `.jsonl`/transcript logs. These make true historical statements and are version-pinned reproductions.
- **Living root planning docs** (`PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md`) contain dotted refs as historical record (e.g. "Phase 5.2 renamed to `lz-advisor.plan`"). D-05/D-06 do NOT list them as operational rename surfaces -- leave them; their dotted refs are accurate history. (GSD state/roadmap tooling will add new entries as part of phase execution; that is normal and not part of the sweep.)

## `git mv` Rename Mechanics

### Skill directory renames (D-02)

```bash
git mv plugins/lz-advisor/skills/lz-advisor.plan            plugins/lz-advisor/skills/plan
git mv plugins/lz-advisor/skills/lz-advisor.execute         plugins/lz-advisor/skills/execute
git mv plugins/lz-advisor/skills/lz-advisor.review          plugins/lz-advisor/skills/review
git mv plugins/lz-advisor/skills/lz-advisor.security-review plugins/lz-advisor/skills/security-review
```

### Eval workspace directory renames (D-05)

```bash
git mv evals/lz-advisor/lz-advisor.plan-workspace            evals/lz-advisor/plan-workspace
git mv evals/lz-advisor/lz-advisor.execute-workspace         evals/lz-advisor/execute-workspace
git mv evals/lz-advisor/lz-advisor.review-workspace          evals/lz-advisor/review-workspace
git mv evals/lz-advisor/lz-advisor.security-review-workspace evals/lz-advisor/security-review-workspace
```

### Ordering hazard analysis -- NONE found

Verified: no operational tracked file references the skill directory path (`skills/lz-advisor.plan`) or eval workspace path (`lz-advisor.plan-workspace`) as a literal string in its CONTENT. Therefore the directory `git mv` operations are fully independent of the content find/replace edits -- either order is safe. The only path-based references are `@${CLAUDE_PLUGIN_ROOT}/references/*.md` (plugin-root-relative, reference files NOT renamed per D-04), which are unaffected.

### Substring-collision analysis -- SAFE

`lz-advisor.review` is NOT a substring of `lz-advisor.security-review` (the latter is `lz-advisor.security-review`, with `security-` between the dot and `review`). A literal find/replace of `lz-advisor.review` -> `review` will not corrupt `lz-advisor.security-review`. Verified. Still, recommend the planner replace the four full strings (longest-first or as exact tokens) rather than the bare word `review`, to avoid any naive `s/review/.../` that would hit `security-review`.

History-preserving `git mv` is the right call (global rule + Phase 5.2 D-09 precedent). Loop with `git mv`; never `git add -A`.

## Headless Skill Resolution (Area B -- the D-08 probe)

### How the invocation name is determined (CITED, authoritative)

Official Claude Code skills doc, section "How a skill gets its command name":

> Plugin `skills/` subdirectory -> Command name source: **Directory name, namespaced by plugin** -> Example: `my-plugin/skills/review/SKILL.md` -> `/my-plugin:review`

> The frontmatter `name` field sets the display label shown in skill listings and, except for a plugin-root `SKILL.md`, does not change what you type after `/`.

[CITED: code.claude.com/docs/en/skills -- "How a skill gets its command name" table]

**Implication for the rename:** It is the **directory rename** (`skills/lz-advisor.plan/` -> `skills/plan/`) that changes the invocation to `/lz-advisor:plan`. The `name:` frontmatter update (D-01) only fixes the *display label* in skill listings. Both are still required (D-01 + D-02): the directory drives invocation; the name field drives the listing. The new clean qualified form is `lz-advisor:plan` (no redundant `lz-advisor-` segment, because the directory is now `plan` not `lz-advisor.plan`).

### Built-in collision is real (CITED + corroborated)

Official skills doc, "Restrict Claude's skill access":

> A few built-in commands are also available through the Skill tool, including `/init`, `/review`, and `/security-review`. Other built-in commands such as `/compact` are not.

[CITED: code.claude.com/docs/en/skills -- "Restrict Claude's skill access"]

Corroborated empirically: a real Phase 8 headless session catalog lists `...,"run","init","review","security-review"` alongside the plugin's `lz-advisor:lz-advisor-security-review` [VERIFIED: `.planning/phases/08-.../natural-uat-compodoc/session-1-plan.jsonl`]. This confirms D-07: in headless mode (no picker), a bare `/review` or `/security-review` can resolve to the built-in instead of the plugin skill. The qualified `/lz-advisor:review` form is namespaced and cannot collide ("Plugin skills use a `plugin-name:skill-name` namespace, so they cannot conflict with other levels" [CITED]).

Namespace resolution also means there is NO ambiguity for `/lz-advisor:plan` and `/lz-advisor:execute` (no built-in `plan`/`execute`); the collision risk is specific to `review`/`security-review`. But D-07's per-context policy (qualified everywhere headless) is the right uniform rule.

### Current-state empirical baseline (VERIFIED from session logs)

Today's dotted plugin, invoked headlessly as `/lz-advisor.plan`, resolves and emits in the stream-json:

```
<command-name>/lz-advisor:lz-advisor-plan</command-name>
<command-message>lz-advisor:lz-advisor-plan</command-message>
```

[VERIFIED: `.planning/phases/08-.../natural-uat-compodoc/session-1-plan.jsonl`]

This is the dot->hyphen normalization the CLAUDE.md L212 gotcha describes: skill name `lz-advisor.plan` -> qualified `lz-advisor:lz-advisor-plan`. After the rename (directory `plan`), the qualified name is simply `lz-advisor:plan` -- no internal hyphen-normalization artifact, because the dot is gone.

### The D-08 probe (minimal, executable)

Run from CWD = this repo, with the renamed plugin in place but BEFORE committing the documented invocation strings. Use the project headless convention (`--permission-mode auto`; never an `@file` mention in `-p`).

**Mandatory gate -- qualified form resolves to plugin skill:**

```bash
# plan (and repeat for execute / review / security-review)
claude --model sonnet --permission-mode auto --plugin-dir plugins/lz-advisor \
  -p "/lz-advisor:plan say hello and stop" --verbose --output-format stream-json > /tmp/probe-plan.jsonl
```

**Success assertion (per skill):** the stream-json contains the slash-command expansion event

```
<command-name>/lz-advisor:plan</command-name>
```

(i.e. the plugin-namespaced name, with NO `lz-advisor-` doubled segment). Grep-checkable:

```bash
rg -F '<command-name>/lz-advisor:plan</command-name>' /tmp/probe-plan.jsonl   # expect >=1 match
```

**Failure modes to distinguish:**
- *Resolved to built-in* (review/security-review only): `<command-name>/review</command-name>` or `/security-review` with no `lz-advisor:` prefix -> documented headless string is wrong; must qualify.
- *Did not resolve / fell back to Skill TOOL:* a `Skill` tool_use with `is_error` (the CLAUDE.md L209 failure mode -- usually triggered by an `@file` mention in `-p`; ensure the probe prompt has none).
- *Resolved to plugin skill:* `<command-name>/lz-advisor:plan</command-name>` present. PASS.

**Optional (discretionary per D-07/Claude's-discretion):** bare-form probe `-p "/review say hello and stop"` to observe whether it resolves to the plugin or the built-in headlessly. Expectation per docs: ambiguous/built-in for `review`/`security-review`; this is *why* headless uses the qualified form. The bare interactive picker behavior is hard to assert headlessly and is NOT the mandatory gate.

Why the four-skill probe matters: `plan`/`execute` have no built-in twin (low risk), but `review`/`security-review` DO. Running all four makes the resolution proof uniform and catches any per-skill surprise.

## Atomic Version Sync (0.14.2 -> 0.15.0)

5 surfaces, all currently `0.14.2` [VERIFIED]:

| Surface | Current | Target |
|---------|---------|--------|
| `plugins/lz-advisor/.claude-plugin/plugin.json` (`"version": "0.14.2"`) | 0.14.2 | 0.15.0 |
| `plugins/lz-advisor/skills/<plan>/SKILL.md` (`version: 0.14.2`) | 0.14.2 | 0.15.0 |
| `plugins/lz-advisor/skills/<execute>/SKILL.md` | 0.14.2 | 0.15.0 |
| `plugins/lz-advisor/skills/<review>/SKILL.md` | 0.14.2 | 0.15.0 |
| `plugins/lz-advisor/skills/<security-review>/SKILL.md` | 0.14.2 | 0.15.0 |

Note JSON uses quoted `"0.14.2"`; SKILL.md YAML uses bare `0.14.2`. Byte-exact atomic sync is a hard project convention (no residue, all 5 land together). Phase 8 0.14.1/0.14.2 bumps are the template. MINOR bump signals the skill-name contract change (mirrors Phase 5.2's minor bump for the same rename in the other direction). Version numbers are not load-bearing in pre-release (no external consumers) -- the bump is for signal clarity (per memory: "Version numbers not load-bearing in pre-release").

## CLAUDE.md Per-Line Transform Map

CLAUDE.md is NOT a uniform replace. The 23 occurrences split into distinct transforms:

| Line(s) | Current | Transform | Rationale |
|---------|---------|-----------|-----------|
| 51,53,55,57 | dir-diagram `lz-advisor.plan/` etc. | -> `plan/` etc. | directory rename reflected in docs |
| 52,54,56,58 | comment `(qualified: lz-advisor:lz-advisor.plan)` | -> `(qualified: lz-advisor:plan)` | new clean qualified form (D-09) |
| 78 | table `lz-advisor.plan, lz-advisor.execute \| lz-advisor.review \| lz-advisor.security-review` | -> bare `plan, execute \| review \| security-review` | display label |
| 145 | naming-convention prose: "dotted-prefix (`lz-advisor.plan/` ...)" | rewrite to describe plain-name convention | reverses Phase 5.2 D-08 doc |
| 187 | `-p "/lz-advisor.<skill-name> <prompt>"` (same-repo example) | -> `-p "/lz-advisor:<skill-name> <prompt>"` | headless = qualified (D-09); placeholder form |
| 194 | `-p "/lz-advisor.plan <one-sentence directive>"` | -> `-p "/lz-advisor:plan ..."` | headless qualified (D-09) |
| 195 | `-p "/lz-advisor.execute Implement the plan..."` | -> `-p "/lz-advisor:execute ..."` | headless qualified (D-09) |
| 198 | "Use `/lz-advisor.<skill-name>` syntax" | -> "`/lz-advisor:<skill-name>`" | placeholder form |
| 209 | gotcha example `-p "/lz-advisor.execute Implement..."` | -> `-p "/lz-advisor:execute ..."` | headless qualified (D-09) |
| 212 | "normalizes dot -> hyphen: `lz-advisor.execute` -> `lz-advisor:lz-advisor-execute`" | -> new clean form: qualified name is `lz-advisor:execute` (no dot, no normalization artifact) | D-09 explicit |
| 215 | `claude -p "/lz-advisor.plan ..."` | -> `claude -p "/lz-advisor:plan ..."` | headless qualified (D-09) |

The planner should treat L212 specially: the gotcha's *meaning* changes (there is no longer a dot-to-hyphen normalization to warn about; the new note should say the qualified name is `lz-advisor:<skill>` directly). This is a semantic rewrite, not a token swap.

## Common Pitfalls / Sequencing

### Pitfall 1: Line-count acceptance criteria false-pass
**What goes wrong:** Using `git grep -c` (lines) instead of `git grep -o | wc -l` (occurrences) lets multi-ref lines pass with one ref renamed and one missed.
**Avoid:** All acceptance criteria use occurrence counts. Pre-rename baseline: 111 operational + 21 smoke = 132 textual occurrences. Post-rename target: 0 (see verification command).
**Warning sign:** `context-packaging.md` reports "19 done" when 25 occurrences existed.

### Pitfall 2: Placeholder forms slip through
**What goes wrong:** A regex of only literal skill names misses `/lz-advisor.<skill-name>` (CLAUDE.md L187/198, conciseness-assessment.md L12).
**Avoid:** Verification regex includes the `lz-advisor\.<` alternation. Three occurrences.

### Pitfall 3: Bare review/security-review headless collision
**What goes wrong:** Documenting headless `-p "/review ..."` resolves to the built-in `/review`, not the plugin skill -- silent wrong behavior, breaks the smoke gates.
**Avoid:** Headless strings use qualified `/lz-advisor:<skill>` (D-07/D-09). The D-08 probe proves it.

### Pitfall 4: Accidentally editing the invariant Agent() lines
**What goes wrong:** A sloppy replace touches `Agent(lz-advisor:advisor)` / `lz-advisor:reviewer` prose.
**Avoid:** The four target strings use a DOT (`lz-advisor.plan`); the agent refs use a COLON (`lz-advisor:advisor`). The skill-rename regex (`lz-advisor\.<skill>`) does not match colon forms. Verified zero false matches. Reviewer/security-reviewer agent files each have exactly 1 dotted skill-name mention (the `Default for lz-advisor.security-review` / review prose) to change, while their `Agent()`/`lz-advisor:` lines stay.

### Pitfall 5: Renaming the eval JSON files
**What goes wrong:** The eval JSON filenames `lz-advisor-plan-eval.json` use a HYPHEN (plugin-prefix convention), not the dotted skill name. Renaming them is out of scope and would break the eval pipeline's file expectations.
**Avoid:** Touch only the JSON *content* query strings (`"lz-advisor.plan how to..."` -> `"plan how to..."` -- planner decides exact replacement target per D-07; for an eval prompt the bare skill name is appropriate). Do NOT rename the files.

### Recommended canonical verification commands (post-sweep)

**Zero residual in operational surfaces (must return empty):**

```bash
git grep -n -E "lz-advisor\.(plan|execute|review|security-review|<)|lz-advisor:lz-advisor[.-]" \
  -- 'plugins/lz-advisor/' 'evals/lz-advisor/' 'CLAUDE.md' '.gitignore'
```

**Zero residual in maintained smoke fixtures (must return empty):**

```bash
git grep -n -E "lz-advisor\.(plan|execute|review|security-review|<)" \
  -- '.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/'
```

**Frozen historical artifacts UNCHANGED (sanity -- should still report ~362 files, NOT zero):**

```bash
git grep -l -E "lz-advisor\.(plan|execute|review|security-review)" -- ".planning/" \
  | rg -v "05.4-address-uat-findings-a-k/smoke-tests/" | wc -l   # expect ~362, proves D-06 respected
```

**Invariant Agent() lines unchanged (must still report 4):**

```bash
git grep -c -E "Agent\(lz-advisor:(advisor|reviewer|security-reviewer)\)" \
  -- 'plugins/lz-advisor/skills/*/SKILL.md' | wc -l   # expect 4
```

**Version sync (must show 5x 0.15.0, zero 0.14.2):**

```bash
git grep -n -E "0\.15\.0" -- 'plugins/lz-advisor/.claude-plugin/plugin.json' 'plugins/lz-advisor/skills/*/SKILL.md'
git grep -n -E "0\.14\.2" -- 'plugins/lz-advisor/.claude-plugin/plugin.json' 'plugins/lz-advisor/skills/*/SKILL.md'  # expect empty
```

### Suggested sequencing (Claude's discretion, but recommended)

1. `git mv` the 4 skill dirs + 4 eval workspace dirs (independent of content; no collision).
2. Content sweep: SKILL.md `name:` fields + body refs; references/*.md; agents/*.md; README; .gitignore comment; CLAUDE.md (per the transform map); eval JSON + conciseness-assessment.md; smoke fixtures.
3. Atomic 5-surface version bump 0.14.2 -> 0.15.0.
4. Run the D-08 headless probe (all 4 skills) -- BEFORE committing the documented invocation strings, so any resolution surprise is caught while strings are still editable.
5. Run all verification commands above.
6. Re-run at least one smoke fixture (e.g. `DEF-response-structure.sh`) to confirm the maintained gate still fires with the new qualified `-p` strings.

## Runtime State Inventory

Phase 9 is a rename, so this inventory applies.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None -- no datastore keys/collections reference the skill names. Skill resolution is filesystem-directory-based; there is no DB. | None |
| Live service config | The skill invocation name is resolved live by Claude Code from the plugin directory layout at session start. After the `git mv`, a running session must reload plugins (`/reload-plugins`) or restart; the D-08 probe starts a fresh `claude -p` so it picks up the new layout automatically. | Probe uses fresh sessions -- no manual reload needed for verification |
| OS-registered state | None -- no Task Scheduler / pm2 / launchd registration references skill names. | None |
| Secrets/env vars | None -- no env var or secret references the dotted skill names. The `--plugin-dir plugins/lz-advisor` path is the plugin root, unchanged. | None |
| Build artifacts / installed packages | None -- pure Markdown/YAML plugin; no compilation, no installed package carrying the name. The plugin is loaded directly from `--plugin-dir`, not from a marketplace cache (pre-publication). | None |

**Canonical question -- "after every file is updated, what runtime systems still cache the old string?":** Only an already-running interactive Claude Code session that loaded the plugin before the rename would still know `/lz-advisor:lz-advisor-plan`. A fresh session (which the D-08 probe and any real use start) reads the new directory layout. No persisted runtime state to migrate.

## Validation Architecture

> Included because the D-08 headless resolution probe is a genuine behavioral contract (the one candidate the objective flagged). Everything else in this phase is statically grep-verifiable, not a runtime behavior to sample.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | `claude -p` headless invocation + stream-json grep (project convention, CLAUDE.md "Skill Verification with `claude -p`"). No unit-test runner -- this is a pure Markdown/YAML plugin. |
| Config file | none -- invocation convention documented in CLAUDE.md |
| Quick run command | `claude --model sonnet --permission-mode auto --plugin-dir plugins/lz-advisor -p "/lz-advisor:plan say hello and stop" --verbose --output-format stream-json` |
| Full suite command | the 4-skill probe loop + `git grep` zero-residual verification commands above |

### Phase Requirements -> Test Map
| Req | Behavior | Test Type | Automated Command | Exists? |
|-----|----------|-----------|-------------------|---------|
| D-08 | Qualified `/lz-advisor:plan` resolves to the plugin skill headlessly | smoke (resolution probe) | `claude -p "/lz-advisor:plan ..." ... \| rg -F '<command-name>/lz-advisor:plan</command-name>'` | created in this phase |
| D-08 | ...execute | smoke | same for `execute` | created |
| D-08 | ...review (built-in collision skill) | smoke | same for `review` -- asserts plugin form, not built-in `/review` | created |
| D-08 | ...security-review (built-in collision skill) | smoke | same for `security-review` | created |
| D-05 | Maintained smoke gate still fires with new qualified `-p` strings | smoke (regression) | `bash .planning/phases/05.4-.../smoke-tests/DEF-response-structure.sh` | exists (updated) |

### Sampling Rate
- **Per task commit:** the relevant `git grep` zero-residual check for the surfaces touched.
- **Per wave/phase merge:** full 4-skill D-08 probe + all verification commands.
- **Phase gate:** all 132 occurrences -> 0 in operational + smoke surfaces; 5x version surfaces at 0.15.0; 362 frozen files unchanged; 4 invariant Agent() lines intact; at least one updated smoke fixture re-run green.

### Wave 0 Gaps
- [ ] D-08 probe is a one-off executor step (run during execution, not a committed test file) -- no new test infrastructure file required.
- [ ] No framework install needed (plugin is Markdown/YAML; `claude` CLI already the verification harness).
- *(Existing smoke-test infrastructure under `05.4/smoke-tests/` covers the regression-gate dimension once `-p` strings are updated.)*

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | After directory rename to `skills/plan/`, the headless invocation `/lz-advisor:plan` will emit `<command-name>/lz-advisor:plan</command-name>` (clean, no `lz-advisor-` doubled segment). Grounded in CITED docs (directory-name-drives-command) + VERIFIED current-state log showing the dotted form normalizes -- but the exact post-rename stream-json string is inferred, not yet observed. | Area B / Validation | LOW -- the D-08 probe (mandatory) directly observes the real string before any documented invocation string is committed. This is precisely what D-08 de-risks. |
| A2 | The bare interactive `/review` picker disambiguates the built-in collision via the plugin-name in each item's description (D-07 / user "fairly confident"). | Area B | LOW -- documented as user-confirmed in CONTEXT; not independently re-verified here (interactive picker is hard to assert headlessly, explicitly out of the mandatory gate per Claude's discretion). The headless path uses the qualified form regardless, so this does not gate execution. |

## Open Questions

1. **Exact eval JSON / conciseness-assessment replacement target for the prompt strings.**
   - What we know: filenames stay (hyphen convention); query/prompt CONTENT must drop the `lz-advisor.` prefix.
   - What's unclear: whether the eval prompt should become bare `plan ...` (interactive-style) or qualified `lz-advisor:plan ...`. Evals are run via the skill-creator pipeline, not headless `claude -p`, so they are not subject to the headless collision.
   - Recommendation: bare skill name in eval prompts (they exercise description-matching, not slash resolution); planner confirms against eval pipeline expectations. Low-risk either way -- evals are not currently run (no ANTHROPIC_API_KEY per Phase 5.2 D-21).

## Project Constraints (from CLAUDE.md)

- **No AI attribution in commits.** No `Co-Authored-By` / `Generated with` lines.
- **Never `git add .`/`-A`/`-u`.** Stage files by name.
- **Prefer `git mv` for renames** (atomic source-delete + dest-add). Loop for bulk moves -- exactly the D-02/D-05 directory renames.
- **Content search:** `git grep` (tracked) primary; `rg` for gitignored/untracked. NEVER `grep` (denied; silent zero on this arm64 box). All counts in this doc used `git grep`.
- **Pipe filtering:** `| rg`, never `| grep`.
- **No emojis / non-ASCII** in any output, scripts, or docs (`--` not em-dash, `->` not arrow).
- **Headless `claude -p`:** never an `@file` mention in `-p` (breaks slash recognition); use `--permission-mode auto`; reference plan files by prose path.
- **Atomic 5-surface version sync** is a hard project convention.
- **GSD workflow enforcement:** file edits go through a GSD command (this phase runs under `/gsd-execute-phase 9`).

## Sources

### Primary (HIGH confidence)
- `code.claude.com/docs/en/skills` -- "How a skill gets its command name" (plugin skills: directory name drives `/plugin:skill`; `name:` is display label only) and "Restrict Claude's skill access" (built-in `/init`, `/review`, `/security-review` available via Skill tool). Fetched 2026-06-01.
- Live tracked tree (`git grep -o`/`git ls-files`) -- all occurrence counts, directory inventory, version fields, invariant Agent() lines, scope-leak exclusion. Verified 2026-06-01.
- `.planning/phases/08-.../natural-uat-compodoc/session-1-plan.jsonl` -- empirical current-state resolution: `<command-name>/lz-advisor:lz-advisor-plan</command-name>`; headless command catalog listing built-in `review`/`security-review`. VERIFIED.

### Secondary (MEDIUM confidence)
- WebSearch (Claude Code plugin skill resolution) -- corroborated the directory-name-drives-command rule and `plugin:skill` namespacing before the official doc fetch confirmed it.

### Internal context
- `09-CONTEXT.md` (D-01..D-10, canonical_refs), `05.2-CONTEXT.md` (the reversed decision; D-07 unverified bet), `CLAUDE.md` (skill-verification convention, L212 normalization gotcha), `REQUIREMENTS.md`, `STATE.md`.

## Metadata

**Confidence breakdown:**
- File inventory / counts: HIGH -- every number re-counted live with `git grep -o`; discrepancies vs CONTEXT line-counts identified and explained.
- `git mv` mechanics: HIGH -- collision and substring analyses run against the live tree, both clear.
- Headless resolution (Area B): HIGH for the collision + directory-drives-command facts (CITED official docs + VERIFIED logs); the exact post-rename string is the one inferred item, fully de-risked by the mandatory D-08 probe.
- Version sync: HIGH -- all 5 surfaces confirmed at 0.14.2.

**Research date:** 2026-06-01
**Valid until:** 2026-07-01 (stable; Claude Code skill-resolution semantics could shift in a CLI update -- the D-08 probe re-verifies at execution time regardless).
