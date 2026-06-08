# Phase 13: Empirical verification - Research

**Researched:** 2026-06-08
**Domain:** Headless `claude -p` UAT harness + budget-gate replay + residue sweep (verify-only, zero new source)
**Confidence:** HIGH (all five research questions resolved by direct codebase + machine inspection; one SC-3 finding requires a planner decision -- see below)

## Summary

Phase 13 is a verification phase: it produces EVIDENCE (captured traces, graded findings, budget verdicts, a residue-sweep result) and a VERIFICATION report, not new source. All five operational questions are answered concretely below with exact commands, file-path shapes, and jq extractions verified on THIS machine (claude CLI 2.1.168, jq 1.8.1, Git Bash).

Two findings change the plan materially versus the CONTEXT assumptions:

1. **SC-3 branch name mismatch (planner decision required, NOT a blocker):** the branch `uat/pre-storybook-compodoc` named in ROADMAP/REQUIREMENTS/CONTEXT **does not exist** in the ngx-smart-components repo. The closest semantic match is `lz-advisor-compodoc-storybook-uat-base` (SHA `019a26a`, 2026-04-14, explicitly the lz-advisor compodoc/storybook UAT base). The ngx working tree is currently CLEAN on `main` (0 dirty files), so the "active WIP" concern is about the repo being under active development generally -- the worktree discipline still applies (never check out onto `main`/live tree). This is the one item CONTEXT explicitly deferred to plan time ("exact name verified at plan time").

2. **Review-target thinness (affects the >=5-findings anti-vacuous guard):** the ngx-smart-components library is a minimal Nx scaffold -- only ~4-5 source `.ts` files on every candidate branch. Pointing `:review` at `src/lib/*.ts` will likely NOT yield the >=5 findings the budget fixtures require (`MIN_FINDINGS=5`). The robust approach is to seed a small purpose-built reviewable file into the throwaway worktree (the past UATs did exactly this with `review-src/handler.ts`), OR target the richer Storybook/Compodoc config wiring.

**Primary recommendation:** Use `lz-advisor-compodoc-storybook-uat-base` as the worktree base (planner confirms with user if a different checkpoint is preferred). Capture each `claude -p --output-format stream-json --verbose` run's STDOUT to a file; grade the user-facing report via `jq -r 'select(.type=="result").result'`; locate the agent's raw emission via the `result` event's `.session_id` -> `~/.claude/projects/<cwd-hash>/<session_id>/subagents/agent-*.jsonl`; extract that agent text with `jq -r 'select(.type=="assistant").message.content[]?|select(.type=="text").text'` into a plain-markdown file and feed it to `tests/D-reviewer-budget.sh --from-trace <file>`. Seed a reviewable source slice so each run clears `MIN_FINDINGS=5`.

## User Constraints (from CONTEXT.md)

### Locked Decisions (D-01..D-10, verbatim intent)
- **D-01:** Canonical headless form per CLAUDE.md: `claude --model sonnet --permission-mode auto --plugin-dir "<abs plugins/lz-advisor>" -p "/lz-advisor:review <one-sentence directive>" --verbose --output-format stream-json`, CWD = the ngx worktree. Qualified slash form; `auto` permission (NOT `acceptEdits`); PROSE target (NEVER `@file` in `-p`). Capture stream-json to a file.
- **D-02:** Sample **n>=3 runs per skill**; REUSE the same captures for the budget gate (SC-1/2/4 share one capture set). Report Pass@k and Pass^k per skill and overall. A run "fully passes" when its rendered report shows all present-severity sections under spelled-out headlines, `(none)` markers where empty, OWASP `[Axx]` preserved (security), and zero `crit:|imp:|sug:|q:`.
- **D-03:** Grade SHAPE from the PARENT stream's final rendered report; measure BUDGET from the AGENT subagent emission. Two different surfaces, two different captures.
- **D-04:** Measure the n>=3 budget gate by feeding LIVE captured AGENT output into `tests/D-reviewer-budget.sh --from-trace <file>` / `tests/D-security-reviewer-budget.sh --from-trace <file>`. Self-extracted examples are NOT an acceptable SC-4 source.
- **D-05:** A small extraction step converts each capture into the plain rendered-text shape `--from-trace` expects (jq over assistant text). Exact one-liner is Claude's discretion (resolved below).
- **D-06:** Dedicated `git worktree` branched from the verified checkpoint inside `/d/projects/github/LayZeeDK/ngx-smart-components` -- NEVER its live tree. MANUAL `git worktree add`, NOT Claude Code `isolation: worktree`.
- **D-07:** Confirm branch exists BEFORE `worktree add`; capture `EXPECTED_BASE`; verify worktree base matches; correct with `git merge --ff-only` (NOT `reset --soft`) if drifted.
- **D-08:** EXTRACT all UAT artifacts into `.planning/phases/13-empirical-verification/` BEFORE removing the ngx worktree (worktree removal discards uncommitted artifacts).
- **D-09:** Residue sweep is one-shot `git grep -nE 'crit:|imp:|sug:|q:' -- plugins/lz-advisor/` (expected: zero hits, exit 1). Pathspec ALONE excludes frozen `.planning/` history.
- **D-10:** Failure disposition SPLIT by class: MECHANICAL residue -> fix in-phase + re-sweep; SUBSTANTIVE behavioral failure (grammar does not reach rendered report) -> record as gap, route to a Phase 12.x gap-closure REPLAN (do not patch the contract inside a verify phase).

### Claude's Discretion (resolved in this research)
- The exact checkpoint branch + whether a newer one supersedes `uat/pre-storybook-compodoc` -> **RESOLVED below (Q1): name does not exist; use `lz-advisor-compodoc-storybook-uat-base` or planner-confirmed alternative.**
- The realistic review target / slice yielding >=5 findings -> **RESOLVED below (Q3): seed a reviewable file; library scaffold is too thin.**
- Exact n (3 floor, 5 sharper) -> planner picks per the 5-hour session-pool budget (caveat below).
- The stream-json/JSONL -> trace-file extraction one-liner -> **RESOLVED below (Q2).**
- Throwaway grader script vs inline `rg`/`git grep` over captured text -> inline `rg` is sufficient (recipes below).

### Deferred Ideas (OUT OF SCOPE)
- Standing residue regression test (`tests/D-residue-sweep.sh`) -- future-milestone hardening, NOT built here.
- RPT-F01 / RPT-F02 / RPT-F03 report-format enhancements.
- RTK-command-suitability todo (reviewed, not folded -- orthogonal tooling research).
- Rewriting the grammar (Phase 12, done) or reverting the Phase 7 lexicon.
- Mutating the ngx-smart-components active working tree.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| GATE-02 | Headless `claude -p` UAT proves grouped spelled-out reports reach rendered output on both review skills; ngx run in a dedicated worktree off the checkpoint branch | Q1 (worktree provisioning + verified branch), Q2 (capture/extraction), Q3 (command form + target), Q4 (residue sweep), Q5 (validation map). All five SCs mapped to discrete checkable points. |

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Live render of grouped grammar (SC-1/2) | Skill render-verbatim contract (parent session) | Reviewer/security-reviewer agent (subagent) | The skill emits the agent response unchanged; the user-facing surface is the PARENT stream's final report. |
| Budget measurement (SC-4) | Reviewer/security-reviewer agent emission (subagent JSONL) | Budget fixtures (`tests/D-*-budget.sh --from-trace`) | The agent's RAW emission is the faithful budget source; the fixture is the measurement tool. |
| Worktree isolation (SC-3) | External ngx-smart-components git repo (`git worktree`) | This repo's `.planning/` (artifact custody) | Review subject lives in the worktree; evidence custody lives in lz-advisor planning tree. |
| Residue sweep (SC-5) | This repo's `plugins/lz-advisor/` tree (`git grep`) | -- | Pathspec scoping is the structural guard against touching frozen history. |

## Research Question 1: ngx-smart-components Worktree Provisioning (SC-3)

### VERIFIED branch inventory (read-only inspection, no mutation)

The named branch `uat/pre-storybook-compodoc` **DOES NOT EXIST**. Verified:
```
$ git --git-dir=/d/projects/github/LayZeeDK/ngx-smart-components/.git rev-parse 'uat/pre-storybook-compodoc'
fatal: ambiguous argument 'uat/pre-storybook-compodoc': unknown revision or path not in the working tree.
```

Full branch list (all `uat/*` + related), with the **closest semantic match highlighted**:

| Branch | Tip SHA | Date | Tip subject | Source repute |
|--------|---------|------|-------------|---------------|
| **`lz-advisor-compodoc-storybook-uat-base`** | **`019a26a`** | **2026-04-14** | **chore(claude): remove lz-advisor plugin from project scope** | **Explicitly named the lz-advisor compodoc/storybook UAT BASE; recommended** |
| `uat-compodoc-0.14.2` | `53cf1b3` | 2026-05-31 | fix(storybook): add documentation.json to dev-server outputs | Most recent compodoc UAT checkpoint |
| `uat/gap-closure-v0_14_1` | -- | 2026-05-31 | chore(storybook): exclude documentation.json | gap-closure checkpoint |
| `uat/manual-v0_14_0` | -- | 2026-05-31 | restore browserTarget to storybook dev-server | manual UAT |
| `uat-replay-0.12.0..0.13.1` | -- | 2026-05-04..08 | docs: add plans | replay checkpoints |
| `uat/phase-5.6-*`, `uat/phase-6-*`, `uat/phase-7-*`, `uat/v15_0_0`, `uat/manual-s3/s4-*` | -- | 2026-04-14..05-01 | various | older phase checkpoints |

`[VERIFIED: git rev-parse / branch --list on ngx-smart-components/.git, 2026-06-08]`

### ngx working-tree state (the "active WIP" blocker)

```
$ git --git-dir=.../ngx/.git --work-tree=.../ngx rev-parse --abbrev-ref HEAD   ->  main
$ git ... status --porcelain=v1 | wc -l                                        ->  0  (CLEAN)
$ git ... worktree list   ->  D:/projects/github/LayZeeDK/ngx-smart-components 91d1c42 [main]  (only the main worktree)
```
The tree is currently clean on `main`, but `main` is actively developed (tip 2026-06-08). The worktree discipline holds: **NEVER check out a UAT branch onto the live `main` tree; always use a dedicated `git worktree`.** No existing worktrees are registered, so there are no stale/LOCKED worktrees to collide with. `[VERIFIED: git status / worktree list, 2026-06-08]`

### RECOMMENDATION (Q1)

1. **Branch:** Use `lz-advisor-compodoc-storybook-uat-base` as the checkpoint base (it is literally the lz-advisor compodoc/storybook UAT base). **The planner MUST surface the name discrepancy to the user** (CONTEXT/ROADMAP say `uat/pre-storybook-compodoc`; that name is absent) and confirm `lz-advisor-compodoc-storybook-uat-base` is the intended checkpoint, OR accept a planner-chosen alternative (e.g. `uat-compodoc-0.14.2` for a richer Storybook surface). This is a `checkpoint:human-verify` candidate. `[ASSUMED A1: that lz-advisor-compodoc-storybook-uat-base is the semantically-intended checkpoint -- needs user confirmation]`
2. **Worktree location:** OUTSIDE both repos' working trees. Recommended: `/d/projects/github/LayZeeDK/ngx-smart-components-uat-13` (sibling to ngx, not nested). Nesting a worktree inside either repo's tree risks the parent repo treating it as untracked content.
3. **Safe provisioning sequence (D-06/D-07), read-only on the source branch:**
```bash
GD="git --git-dir=/d/projects/github/LayZeeDK/ngx-smart-components/.git"
BRANCH="lz-advisor-compodoc-storybook-uat-base"   # planner-confirmed
WT="/d/projects/github/LayZeeDK/ngx-smart-components-uat-13"

# 1. Confirm the checkpoint branch exists BEFORE worktree add (D-07)
$GD branch --list "$BRANCH"                         # must print the branch
EXPECTED_BASE="$($GD rev-parse "$BRANCH")"          # capture base SHA

# 2. Create a DEDICATED throwaway worktree on a NEW branch off the checkpoint
#    (a new branch avoids mutating the checkpoint ref; --git-dir keeps the
#     external repo's index untouched on disk except for the new worktree)
$GD worktree add -b uat/phase-13-render "$WT" "$BRANCH"

# 3. Verify the worktree base matches EXPECTED_BASE (baseRef-drift defense)
ACTUAL_BASE="$(git --git-dir="$WT/.git" rev-parse HEAD 2>/dev/null \
              || git -C "$WT" rev-parse HEAD)"
#    If drifted: correct with merge --ff-only, NEVER reset --soft
#    git -C "$WT" merge --ff-only "$EXPECTED_BASE"
```
Note: this is a MANUAL `git worktree add` in the EXTERNAL repo (D-06) -- the CLAUDE.md `worktree.baseRef=head` setting only governs Claude Code subagent `isolation: worktree`, which is NOT used here. Manual `git worktree add ... <BRANCH>` uses the EXPLICIT start-point you pass, so there is no origin/HEAD drift; the EXPECTED_BASE check is belt-and-suspenders.
4. **Teardown (D-08), AFTER extracting all artifacts into this repo's planning tree:**
```bash
git --git-dir=/d/projects/github/LayZeeDK/ngx-smart-components/.git worktree remove "$WT" --force
git --git-dir=/d/projects/github/LayZeeDK/ngx-smart-components/.git branch -D uat/phase-13-render
```

## Research Question 2: Headless Capture + Extraction (SC-1, SC-2, SC-4) -- THE LINCHPIN

### Parent stream-json STDOUT schema (VERIFIED empirically, claude 2.1.168)

`claude -p ... --output-format stream-json --verbose` emits newline-delimited JSON to STDOUT. Event `.type` values observed: `system` (init/multiple), `assistant` (one per turn), `result` (exactly one, terminal), `rate_limit_event`. `[VERIFIED: trivial headless run captured + jq inspected, 2026-06-08]`

The `result` event carries the user-facing final answer in `.result` and the session id in `.session_id`:
```json
{"type":"result","subtype":"success","result":"<final rendered report text>","session_id":"<uuid>", ...}
```

### SHAPE grading source (SC-1/SC-2) -- the PARENT final report

Capture and grade the final user-facing report (cleanest surface -- excludes intermediate "I'll start by..." prose):
```bash
# Capture (one per run):
claude --model sonnet --permission-mode auto \
  --plugin-dir "D:/projects/github/LayZeeDK/lz-advisor-claude-plugins/plugins/lz-advisor" \
  -p "/lz-advisor:review <one-sentence directive>" \
  --verbose --output-format stream-json  > run-review-1.streamjson 2>run-review-1.err

# Extract the final rendered report (the surface the user sees):
jq -r 'select(.type=="result") | .result' run-review-1.streamjson > run-review-1.report.md

# Grab the session id (to locate the subagent emission for the budget gate):
SID="$(jq -r 'select(.type=="result") | .session_id' run-review-1.streamjson)"
```
`[VERIFIED: .result and .session_id extraction on a real result event, 2026-06-08]`

Alternative (all assistant turns concatenated, if `.result` is ever truncated): `jq -r 'select(.type=="assistant")|.message.content[]?|select(.type=="text").text' run-review-1.streamjson`. For SHAPE grading prefer `.result`; it is the single contracted final report.

### BUDGET measurement source (SC-4) -- the AGENT subagent emission

The reviewer/security-reviewer runs as a SUBAGENT of the skill. Its raw emission lands at:
```
~/.claude/projects/<cwd-hash>/<session-uuid>/subagents/agent-<id>.jsonl
```
VERIFIED path shape on this machine (example from a prior lz-advisor headless run):
```
/c/Users/LarsGyrupBrinkNielse/.claude/projects/C--Users-LarsGyrupBrinkNielse-AppData-Local-Temp-lz-advisor-d-reviewer-Ykh8/28eebe09-.../subagents/agent-ad87221b87d2d0614.jsonl
```
Critical: the `<cwd-hash>` is derived from the `-p` run's CWD = the **ngx WORKTREE path** (e.g. `D--projects-github-LayZeeDK-ngx-smart-components-uat-13`), NOT this repo. The `<session-uuid>` == the `.session_id` from the `result` event. `[VERIFIED: find ~/.claude/projects -path '*subagents*', 2026-06-08]`

Subagent JSONL schema: lines have `.type` in `{user, assistant}`; the agent's text is in assistant content `text` blocks:
```bash
# Locate the agent JSONL via the captured session id, then extract its text:
CWD_HASH="$(pwd | sed -E 's#^/([a-z])/#\U\1--#; s#/#-#g')"   # derive from worktree CWD; or glob it
AGENT_JSONL="$(find ~/.claude/projects/*"$SID"*/subagents -name 'agent-*.jsonl' 2>/dev/null | head -1)"
# Robust fallback: find by session id directly under any project dir:
AGENT_JSONL="$(find ~/.claude/projects -path "*${SID}/subagents/agent-*.jsonl" 2>/dev/null | head -1)"

jq -r 'select(.type=="assistant") | .message.content[]? | select(.type=="text") | .text' \
  "$AGENT_JSONL" > run-review-1.agent.md
```
`[VERIFIED: jq extraction over a real agent JSONL produced raw grouped-grammar markdown, 2026-06-08]`

### `--from-trace` input shape (VERIFIED by READING both fixtures)

Both `tests/D-reviewer-budget.sh` and `tests/D-security-reviewer-budget.sh` `--from-trace <file>` branch do exactly one thing to the input: `tr -d '\r' < "$TRACE_FILE"` (CRLF->LF normalize), then run the SAME header-tracking parser. The expected file shape is therefore **plain rendered markdown report text** -- the agent's response containing:
- `### Critical` / `### Important` / `### Suggestions` / `### Questions` headers (regex `^### (Critical|Important|Suggestions|Questions)$`)
- numbered finding lines `N. <path>:<line[-range]>: <body>` (reviewer) or `N. <path>:<line>: [Axx] <body>` (security; the `\[[^]]+\]` bracket is load-bearing)
- `### Cross-Cutting Patterns` (reviewer, REQUIRED) / `### Threat Patterns` (security, REQUIRED)
- optional `### Missed surfaces`

NO delimiter, NO wrapping, NO JSON -- just the markdown body. The `run-review-1.agent.md` produced above is exactly this shape. `[VERIFIED: read tests/D-reviewer-budget.sh:115-123,134-179 and tests/D-security-reviewer-budget.sh:101-118,142-172]`

### END-TO-END pipeline PROVEN

Feeding an extracted (pre-Phase-12, OLD-grammar) agent trace into the reviewer fixture correctly produced `0 findings parsed` + anti-vacuous RED -- proving (a) the extraction one-liner produces a `--from-trace`-compatible file, and (b) the fixture distinguishes old vs new grammar. A NEW grouped-grammar capture from Phase 13's live runs will parse GREEN. `[VERIFIED: bash tests/D-reviewer-budget.sh --from-trace <extracted-old-trace> => 0 findings, RED, 2026-06-08]`

### RECOMMENDATION (Q2)

Per run, produce TWO files: `run-<skill>-<n>.report.md` (parent `.result`, for SHAPE) and `run-<skill>-<n>.agent.md` (subagent text, for BUDGET). Feed the `.agent.md` into the matching `--from-trace` fixture. Keep both as committed evidence under `.planning/phases/13-empirical-verification/uat/`.

## Research Question 3: Canonical Headless Command Form + Landmines (SC-1, SC-2)

### Locked command form (per CLAUDE.md "Skill Verification with `claude -p`")

```bash
# CWD = the ngx worktree (D-01). ABSOLUTE --plugin-dir. auto permission. PROSE target.
claude --model sonnet --permission-mode auto \
  --plugin-dir "D:/projects/github/LayZeeDK/lz-advisor-claude-plugins/plugins/lz-advisor" \
  -p "/lz-advisor:review review the storybook + compodoc integration wiring in this library" \
  --verbose --output-format stream-json > run-review-1.streamjson 2>&1

claude --model sonnet --permission-mode auto \
  --plugin-dir "D:/projects/github/LayZeeDK/lz-advisor-claude-plugins/plugins/lz-advisor" \
  -p "/lz-advisor:security-review audit this library's config and dependency wiring for security issues" \
  --verbose --output-format stream-json > run-security-1.streamjson 2>&1
```

### Landmines (all VERIFIED in CLAUDE.md / prior UATs)
- **NEVER `@file` in `-p`** -- breaks `/skill` slash-command recognition; the model falls back to the Skill TOOL and errors. Reference targets by PROSE PATH only.
- **`--permission-mode auto`, NOT `acceptEdits`** -- `acceptEdits` DENIES the skill launch (Skill tool `is_error`) and blocks non-git Bash. `auto` is classifier-gated and sufficient.
- **Qualified `/lz-advisor:review` / `/lz-advisor:security-review`** -- skill dirs are plain (`review`, `security-review`); qualified name is `lz-advisor:<skill>` (no redundant prefix).
- **One-sentence directive, NOT a verbose deliverable list** -- verbose prompts cause orient loops (`feedback_uat_canonical_prompt_format`).
- **Nested `claude -p` draws on the SAME 5-hour session-usage pool** as the parent -- n>=3 across TWO skills (>=6 runs, possibly 10 at n=5) can hit `out_of_credits` (HTTP 429) mid-run. Budget across reset windows; the planner should consider n=3 floor first, escalate to n=5 only if the pool allows.

### Review-target richness (the >=5-findings problem) -- IMPORTANT

The ngx-smart-components library is a minimal Nx scaffold: only ~4-5 source `.ts` files (`src/index.ts`, `src/lib/ngx-smart-components/ngx-smart-components.ts`) on EVERY candidate branch. `[VERIFIED: git ls-tree on lz-advisor-compodoc-storybook-uat-base and uat-compodoc-0.14.2, 2026-06-08]`. Pointing `:review` at `src/lib/*.ts` risks `<5` findings -> the fixtures' `MIN_FINDINGS=5` anti-vacuous guard fires RED for a NON-grammar reason (vacuous, not a real failure), and the per-section budget caps are never exercised.

Three options for the planner (recommend Option A):
- **Option A (recommended) -- seed a reviewable slice into the throwaway worktree.** The worktree is disposable; add a small file with deliberate, reviewable issues (the past UATs used `review-src/handler.ts` with unguarded `JSON.parse`, braceless `if`, missing types, dead code -- it reliably yielded 6-7 findings). Commit it on the worktree's `uat/phase-13-render` branch, point `:review` at it. Reproducible, deterministic, clears `MIN_FINDINGS=5`, exercises Critical+Important+Suggestion sections. For security, a `disk-info.ts` style file (attacker-controlled string -> `fsSize()` sink, a vulnerable `systeminformation` pin) yielded 4 OWASP-tagged findings in a prior trace -- expand slightly to clear 5.
- **Option B -- target the richer config/Storybook wiring.** `:review the storybook + compodoc integration` against `.storybook/`, `project.json`, `documentation.json` may yield enough findings but is non-deterministic (config-review finding counts vary run to run -- risky for an n>=3 gate that needs every run to clear 5).
- **Option C -- target the last commit's diff** (`fix(storybook): add documentation.json...`) -- small diff, likely `<5` findings. Not recommended.

`[ASSUMED A2: that a seeded reviewable file is acceptable as the SC-3 review subject -- it satisfies "a slice within ngx-smart-components" since the file lives in the ngx worktree; planner should confirm this is not considered "mutating the active tree" (it is NOT -- it is the throwaway worktree, never main).]`

## Research Question 4: Residue Sweep (SC-5)

### CURRENT state VERIFIED CLEAN
```
$ git grep -nE 'crit:|imp:|sug:|q:' -- plugins/lz-advisor/   ->  (no output) exit=1
```
Phase 12's "zero residue" claim holds as of HEAD. `[VERIFIED: git grep, exit 1, 2026-06-08]`

### Exact sweep invocation (D-09)
```bash
git grep -nE 'crit:|imp:|sug:|q:' -- plugins/lz-advisor/   # expect: no output, exit 1
```
The `-- plugins/lz-advisor/` pathspec ALONE excludes every frozen `.planning/` history artifact (no fragile `:(exclude)` list). `.planning/milestones/`, archived phase summaries, and UAT traces are OUTSIDE `plugins/lz-advisor/`, so they are structurally untouched -- historical shorthand stays as accurate history (Phase 9 precedent).

### `q:` false-positive risk -- NOTE for the planner
`q:` is the riskiest token (matches ordinary prose, e.g. "FAQ:", "Q: ...", any sentence with "...q: "). It is currently clean, but if a future edit introduces a `q:` prose hit, the sweep would surface a FALSE positive. The planner should treat any `q:` hit with care: confirm whether it is a severity shorthand (real residue, fix in-phase per D-10) or innocuous prose (record as a noted false-positive, do not change). The reviewer/security agents document `### Questions` (full word) for the question tier, so no legitimate `q:` severity token should exist. `[VERIFIED: only token-shape risk; current tree clean]`

### Companion `formerly-X` sweep (Phase 12 also cleared this; cheap to re-confirm)
```bash
git grep -nE 'formerly High|formerly Medium' -- plugins/lz-advisor/   # expect: no output, exit 1
```

### Disposition (D-10)
- Zero hits (expected) -> SC-5 PASS, record exit-1 as evidence.
- A MECHANICAL hit (stray shorthand/typo) -> fix in-phase, re-sweep to confirm exit 1.
- A `q:` prose false-positive -> document as innocuous, leave unchanged.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Budget measurement on live output | A new word-counting parser | `tests/D-reviewer-budget.sh --from-trace` / `tests/D-security-reviewer-budget.sh --from-trace` | Already encode per-section sub-caps, anti-vacuous `matched_count>=5` guard, `[Axx]` bracket assertion, CVE 75w carve-out, CRLF normalize. Re-authoring repeats the exact mistake the fixtures fix. |
| Capturing the rendered report | Screen-scraping / manual copy | `--output-format stream-json` + `jq -r 'select(.type=="result").result'` | Deterministic, machine-gradeable, the contracted final surface. |
| Locating the agent emission | Guessing file paths | `result` event `.session_id` -> `find ~/.claude/projects -path "*${SID}/subagents/agent-*.jsonl"` | The session id is the reliable join key; cwd-hash derivation is brittle on Windows path mangling. |
| Excluding frozen history from the sweep | A per-directory `:(exclude)` list | the `-- plugins/lz-advisor/` pathspec alone | Pathspec scoping is structural and matches the Phase 9 precedent; exclude-lists drift. |
| Worktree base correctness | `reset --soft` | `git merge --ff-only $EXPECTED_BASE` (only if drifted; manual add with explicit start-point avoids drift entirely) | `reset --soft` leaves STALE working-tree files; `--ff-only` advances pointer AND files. |

**Key insight:** Every measurement tool this phase needs already exists and is GREEN-on-new / RED-on-old proven (12-UAT tests 1-4). Phase 13 only WIRES live captures into them -- it builds no new measurement code.

## Common Pitfalls

### Pitfall 1: Vacuous `--from-trace` pass from a thin review target
**What goes wrong:** `:review` against the ~4-file ngx scaffold yields `<5` findings; the fixture fires anti-vacuous RED, the planner misreads it as a grammar failure.
**Why it happens:** the library is a minimal scaffold; finding count is target-dependent, not grammar-dependent.
**How to avoid:** seed a reviewable slice (Q3 Option A) so every run clears `MIN_FINDINGS=5` and exercises real budget caps.
**Warning signs:** `0 findings parsed` or `only N findings parsed (need >= 5)` on a NEW-grammar capture.

### Pitfall 2: Grading the wrong surface (subagent shape vs parent shape)
**What goes wrong:** grading SHAPE from the subagent JSONL or BUDGET from the parent `.result`.
**Why it happens:** the parent rendered report and the subagent emission are byte-similar (render-verbatim) but the parent ALSO contains the skill's scope-summary preamble; the budget must be measured on the AGENT span only.
**How to avoid:** SHAPE from `.result` (parent); BUDGET from `agent-*.jsonl` (subagent), per D-03. Keep the two files distinct.
**Warning signs:** budget word counts that include the skill's "Reviewed: <files>..." preamble.

### Pitfall 3: CRLF corruption (handled by the fixtures, but watch the SHAPE grep)
**What goes wrong:** Git Bash captures are CRLF; a naive `rg '^### Critical$'` against a CRLF file may miss the anchor.
**Why it happens:** trailing `\r` defeats `$` anchoring in some engines.
**How to avoid:** the fixtures already `tr -d '\r'`. For the SHAPE grep, either `tr -d '\r' < file | rg ...` or use `rg` without a `$` anchor. `[VERIFIED: fixtures normalize CRLF at tests/D-*-budget.sh:122/108]`
**Warning signs:** SHAPE grep returns zero hits on a report that visibly contains the header.

### Pitfall 4: out_of_credits mid-gate (nested session pool)
**What goes wrong:** the 6-10 nested `claude -p` runs exhaust the shared 5-hour pool; a run returns HTTP 429 with a partial capture.
**Why it happens:** nested `-p` draws on the parent's pool.
**How to avoid:** run n=3 first; check pool headroom before escalating to n=5; spread runs across reset windows if needed; verify each capture has a `result` event before grading.
**Warning signs:** `out_of_credits` / 429 in the `.err` file; a `.streamjson` with no `result` event.

### Pitfall 5: SC-3 branch name confusion
**What goes wrong:** the plan hardcodes `uat/pre-storybook-compodoc` and `worktree add` fails (`unknown revision`).
**Why it happens:** that branch name does not exist.
**How to avoid:** use the verified `lz-advisor-compodoc-storybook-uat-base` (or planner/user-confirmed alternative); always `git branch --list "$BRANCH"` before `worktree add` (D-07).
**Warning signs:** `fatal: ambiguous argument 'uat/pre-storybook-compodoc'`.

## Code Examples (verified recipes)

### Full per-run capture + dual extraction
```bash
# In the ngx worktree (CWD), with PLUGIN_DIR set to the absolute lz-advisor path:
PLUGIN_DIR="D:/projects/github/LayZeeDK/lz-advisor-claude-plugins/plugins/lz-advisor"
OUT=".planning-evidence"   # or capture into a temp, then copy into this repo's planning tree (D-08)

run_review() {  # $1 = run index
  local n="$1"
  claude --model sonnet --permission-mode auto --plugin-dir "$PLUGIN_DIR" \
    -p "/lz-advisor:review review the seeded handler module for correctness and style issues" \
    --verbose --output-format stream-json > "$OUT/review-$n.streamjson" 2>"$OUT/review-$n.err"

  jq -r 'select(.type=="result") | .result' "$OUT/review-$n.streamjson" > "$OUT/review-$n.report.md"
  local sid; sid="$(jq -r 'select(.type=="result") | .session_id' "$OUT/review-$n.streamjson")"
  local aj;  aj="$(find ~/.claude/projects -path "*${sid}/subagents/agent-*.jsonl" 2>/dev/null | head -1)"
  jq -r 'select(.type=="assistant") | .message.content[]? | select(.type=="text") | .text' \
    "$aj" > "$OUT/review-$n.agent.md"
}
```

### SHAPE grade (SC-1/2) over the parent report
```bash
# PASS conditions for one run's report.md:
tr -d '\r' < review-1.report.md | rg -q '^### Critical'        # spelled-out header present
tr -d '\r' < review-1.report.md | rg -q '^### Cross-Cutting Patterns'
! rg -q 'crit:|imp:|sug:|q:' review-1.report.md                 # zero shorthand
# Security additionally:
rg -q '\[A[0-9]{2}\]|\[Uncategorized\]' security-1.report.md    # OWASP [Axx] preserved
```

### BUDGET gate (SC-4) over the subagent emission
```bash
bash tests/D-reviewer-budget.sh         --from-trace review-1.agent.md     # expect exit 0 (GREEN)
bash tests/D-security-reviewer-budget.sh --from-trace security-1.agent.md  # expect exit 0 (GREEN)
# Repeat for n=1..3 (or 1..5); record per-run exit + "N findings parsed" line.
```

### Pass@k / Pass^k (per CLAUDE.md skill-creator convention)
A run "fully passes" when SHAPE grade is clean AND the BUDGET fixture exits 0. Compute per skill (n runs) and overall: Pass@k = `1 - C(n-c,k)/C(n,k)`; Pass^k = `C(c,k)/C(n,k)`, where c = fully-passing runs. Report k=1,3 (and 5 if n=5).

## Runtime State Inventory

> Not a rename/refactor/migration phase -- this is a verify-only phase. No stored data, live-service config, OS-registered state, secrets, or build artifacts are mutated. The only created state is a THROWAWAY ngx git worktree (removed in teardown, D-08) and evidence files committed into this repo's `.planning/phases/13-empirical-verification/`. None — verified by phase boundary (CONTEXT domain: "verify-only phase").

## Validation Architecture

> nyquist_validation = true (`.planning/config.json:39`). This phase's deliverables are EVIDENCE + a VERIFICATION report, not new source code -- so the "tests" are the UAT gates themselves. Each success criterion maps to a discrete, checkable validation point below; the orchestrator can scaffold VALIDATION.md from this.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | bash + coreutils budget fixtures (`tests/D-*-budget.sh`) + `git grep` + `jq` + `rg` graders |
| Config file | none (standalone zero-dependency fixtures) |
| Quick run command | `bash tests/D-reviewer-budget.sh` (self-extract self-check) |
| Full suite command | both fixtures `--from-trace` per captured run + SHAPE greps + residue sweep |

### Phase Requirements -> Test Map
| SC | Behavior | Test Type | Automated Command | File Exists? |
|----|----------|-----------|-------------------|-------------|
| SC-1 | `:review` rendered report has grouped spelled-out headers + zero shorthand | shape grade | `tr -d '\r' < review-N.report.md | rg -q '^### Critical' && ! rg -q 'crit:|imp:|sug:|q:' review-N.report.md` | report.md from live run |
| SC-2 | `:security-review` same grouped shape + OWASP `[Axx]` preserved + zero shorthand | shape grade | as SC-1 plus `rg -q '\[A[0-9]{2}\]' security-N.report.md` | report.md from live run |
| SC-3 | UAT ran in a dedicated worktree off the verified checkpoint branch | provenance check | `git --git-dir=.../ngx/.git worktree list` shows the dedicated worktree; EXPECTED_BASE match recorded | worktree provisioned at plan-exec |
| SC-4 | n>=3 budget gate GREEN on new grammar for both agents | budget fixture | `bash tests/D-reviewer-budget.sh --from-trace review-N.agent.md` exit 0 (xN); `bash tests/D-security-reviewer-budget.sh --from-trace security-N.agent.md` exit 0 (xN) | fixtures exist (GATE-01) |
| SC-5 | zero `crit:|imp:|sug:|q:` residue in `plugins/lz-advisor/`; frozen history untouched | residue sweep | `git grep -nE 'crit:|imp:|sug:|q:' -- plugins/lz-advisor/` -> exit 1 | repo HEAD |

### Sampling Rate
- **Per run:** capture stream-json + extract report.md (shape) + agent.md (budget); grade both.
- **Per skill:** aggregate n>=3 runs into Pass@k / Pass^k.
- **Phase gate:** all five SCs satisfied; `13-UAT.md` + `13-VERIFICATION.md` written; evidence committed under `.planning/phases/13-empirical-verification/uat/`.

### Wave 0 Gaps
- [ ] Seeded reviewable source slice in the throwaway worktree (Q3 Option A) -- needed so every run clears `MIN_FINDINGS=5`.
- [ ] `.planning/phases/13-empirical-verification/uat/` evidence directory (created at execution).
- [ ] (No framework install needed: fixtures exist GREEN, jq/rg/git present.)

*Existing test infrastructure (the two budget fixtures, GATE-01 complete) covers the budget gate; the only gap is the seeded review target and the evidence directory.*

## Security Domain

> This is a verify-only meta-phase about a code-REVIEW plugin; it installs no packages, runs no network services, and processes no user data. The security-review skill is the SUBJECT under test, not a new attack surface. The fixtures already enforce safe trace handling: `--from-trace` quotes `"$TRACE_FILE"` everywhere and NEVER eval/sources it (T-11-01), and `tr -d '\r'` is the only transform. No ASVS category applies to the phase's own deliverables (no auth, sessions, access control, crypto, or untrusted input processing in the evidence pipeline). The one handling note: captured traces are read-only inputs to bash fixtures that treat them as opaque text -- confirmed by reading both fixtures' `--from-trace` branch. `[VERIFIED: tests/D-*-budget.sh:65-74,101-123]`

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `lz-advisor-compodoc-storybook-uat-base` is the semantically-intended checkpoint for the absent `uat/pre-storybook-compodoc` | Q1 | Wrong base = UAT runs against an unintended ngx state; planner must confirm with user (the ONE item CONTEXT deferred to plan time). LOW risk -- name is an exact semantic match; but a user-locked branch name was specified, so confirmation is mandatory. |
| A2 | A seeded reviewable file in the THROWAWAY worktree counts as a valid "slice within ngx-smart-components" and is not "mutating the active tree" | Q3 | If rejected, the planner must rely on the non-deterministic config-review target (Option B), risking `<5` findings on some runs. LOW risk -- the worktree is disposable and never touches `main`. |

**Both assumptions are flagged for the planner to confirm (A1 is a `checkpoint:human-verify` candidate; A2 is a scope-interpretation the planner should state explicitly in the plan).**

## Open Questions

1. **Exact checkpoint branch (the user-specified `uat/pre-storybook-compodoc` does not exist).**
   - What we know: 18 branches inventoried; `lz-advisor-compodoc-storybook-uat-base` (`019a26a`) is the explicit lz-advisor compodoc/storybook UAT base; `uat-compodoc-0.14.2` is the most recent compodoc checkpoint.
   - What's unclear: which the user intended by the (now-absent) name.
   - Recommendation: planner surfaces the discrepancy to the user (AskUserQuestion / `checkpoint:human-verify`), defaulting to `lz-advisor-compodoc-storybook-uat-base`.

2. **n=3 vs n=5 under the shared session-credit pool.**
   - What we know: nested `-p` draws on the parent's 5-hour pool; 2 skills x n runs = 6-10 nested sessions.
   - What's unclear: live pool headroom at execution time.
   - Recommendation: run n=3 floor first; escalate to n=5 only if the pool allows; budget across reset windows.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Grade budget on the agent's SELF-EXTRACTED worked example (12-UAT tests 1,3) | Grade budget on LIVE agent emission via `--from-trace` (D-04) | Phase 13 (this phase) | The self-extracted sample re-measures the hand-authored example -- vacuous for "empirical on new grammar"; live capture is the real signal. |
| `### Findings` single header + inline `crit:`/`imp:`/`sug:`/`q:` shorthand | Four `###` severity sections, `(none)` markers, continuous numbering, no inline severity | Phase 12 (1.0.0->1.0.1) | The grammar under live test; all historical traces in `~/.claude/projects` are OLD-grammar (none post-Phase-12 exist yet -- confirmed by scan). |

**Deprecated/outdated:**
- The pre-Phase-12 agent emissions cached in `~/.claude/projects/*` are OLD-grammar (`### Findings` + `crit:`). They are useful only as RED-on-old `--from-trace` negatives; they are NOT valid SC-1/2/4 evidence.

## Sources

### Primary (HIGH confidence)
- `tests/D-reviewer-budget.sh` (read in full) -- `--from-trace` input shape, header-tracking parser, `MIN_FINDINGS=5`, per-section caps.
- `tests/D-security-reviewer-budget.sh` (read in full) -- same + `[Axx]` bracket assertion + 75w CVE carve-out.
- `plugins/lz-advisor/agents/reviewer.md`, `security-reviewer.md` -- grouped-grammar Output Constraint + worked examples (verified shape).
- `plugins/lz-advisor/skills/review/SKILL.md`, `security-review/SKILL.md` -- render-verbatim contract (lines 165/175/178; 151/161/164/167).
- CLAUDE.md "Skill Verification with `claude -p`" + "Claude Code worktree isolation" sections.
- Live machine inspection: `claude --version` (2.1.168), `jq --version` (1.8.1), `git rev-parse/branch --list` on ngx-smart-components/.git, `find ~/.claude/projects -path '*subagents*'`, a trivial headless stream-json capture (result/assistant event shapes), and an end-to-end `--from-trace` replay of an extracted trace.

### Secondary (MEDIUM confidence)
- 13-CONTEXT.md (D-01..D-10), 12-CONTEXT.md (D-01..D-11), 12-UAT.md (fixture-green baseline), STATE.md (blockers), ROADMAP/REQUIREMENTS (GATE-02 + SCs).

### Tertiary (LOW confidence)
- None -- all claims verified against codebase or this machine.

## Metadata

**Confidence breakdown:**
- Worktree provisioning (Q1): HIGH -- branch inventory + working-tree state verified by read-only git; one user-confirmation item (A1) flagged.
- Capture/extraction (Q2): HIGH -- stream-json event shapes, subagent path, and `--from-trace` shape all verified empirically; end-to-end pipeline proven.
- Command form/target (Q3): HIGH on form (CLAUDE.md), MEDIUM on target richness -- the thin-scaffold finding is verified; the seed-file mitigation (A2) is a planner scope call.
- Residue sweep (Q4): HIGH -- current state verified clean (exit 1).
- Validation architecture (Q5): HIGH -- all five SCs mapped to discrete commands.

**Research date:** 2026-06-08
**Valid until:** 2026-06-22 (14 days -- ngx branches and the claude CLI are the only moving parts; re-verify the branch SHA and CLI stream-json schema if the gap exceeds two weeks).

## RESEARCH COMPLETE

**Phase:** 13 - Empirical verification
**Confidence:** HIGH

### Key Findings
- **SC-3 branch name is wrong in the spec:** `uat/pre-storybook-compodoc` does NOT exist; recommend `lz-advisor-compodoc-storybook-uat-base` (`019a26a`, 2026-04-14) -- planner must confirm with user. ngx tree is clean on `main` (worktree discipline still mandatory).
- **The full capture->extract->budget-gate pipeline is PROVEN end-to-end:** parent SHAPE via `jq -r 'select(.type=="result").result'`; agent BUDGET via session-id -> `subagents/agent-*.jsonl` -> `jq -r '...message.content[]?|select(.type=="text").text'`; the resulting plain-markdown file is exactly the `--from-trace` shape (verified by replaying an old trace -> correct RED).
- **Review target is too thin (~4-5 .ts files):** seed a reviewable file into the throwaway worktree so every run clears `MIN_FINDINGS=5` and exercises the budget caps (planner scope call A2).
- **Residue sweep already CLEAN** (`git grep -nE 'crit:|imp:|sug:|q:' -- plugins/lz-advisor/` exit 1); `q:` is the only prose-false-positive risk.
- **No measurement code to build:** both budget fixtures exist GREEN (GATE-01); Phase 13 only wires live captures in. Zero post-Phase-12 grammar traces exist on disk -- the live runs produce the first real evidence.

### File Created
`.planning/phases/13-empirical-verification/13-RESEARCH.md`

### Confidence Assessment
| Area | Level | Reason |
|------|-------|--------|
| Worktree provisioning | HIGH | git inventory + tree state verified; one user-confirm item (A1) |
| Capture/extraction | HIGH | stream-json schema + subagent path + --from-trace shape verified; pipeline proven |
| Command form/target | HIGH/MEDIUM | form locked from CLAUDE.md; target-richness needs a seed file (A2) |
| Residue sweep | HIGH | current state verified exit 1 |
| Validation map | HIGH | all 5 SCs mapped to discrete commands |

### Open Questions
1. Exact checkpoint branch -- user-specified name absent; default to `lz-advisor-compodoc-storybook-uat-base`, confirm with user (A1).
2. n=3 vs n=5 under the shared 5-hour credit pool -- run n=3 first, escalate if headroom allows.

### Ready for Planning
Research complete. The planner can author PLAN.md + VALIDATION.md from the Validation Architecture section. Two items need a checkpoint/user confirmation before execution: A1 (branch name) and A2 (seeded review target scope interpretation).
