# Phase 13: Empirical verification - Context

**Gathered:** 2026-06-08
**Status:** Ready for planning

> Captured autonomously via `/gsd-discuss-phase 13 --auto --analyze --chain`.
> Every implementation decision below was auto-resolved to the recommended
> option; the full trade-off tables are in `13-DISCUSSION-LOG.md`. The WHAT/WHY
> is locked upstream: GATE-02 in REQUIREMENTS.md and the five Phase 13 success
> criteria in ROADMAP.md. This is a VERIFICATION phase -- it proves the Phase 12
> grouped-grammar rewrite actually reached rendered output; it does not
> re-litigate the grammar itself (that is locked in `12-CONTEXT.md` D-01..D-11).

<domain>
## Phase Boundary

Produce behavioral and budget EVIDENCE that the Phase 12 grouped spelled-out
severity grammar (`### Critical` / `### Important` / `### Suggestions` /
`### Questions`) actually reaches the rendered, user-facing report on BOTH
review skills through real headless `claude -p` sessions -- and that no
unintended `crit:`/`imp:`/`sug:`/`q:` shorthand residue or `.planning/`
history corruption slipped in. This closes GATE-02, the last open v1.0.1
requirement.

**In scope (the five success criteria):**
1. A headless `claude -p /lz-advisor:review` run yields a rendered report with
   the four grouped spelled-out headlines and zero shorthand.
2. A headless `claude -p /lz-advisor:security-review` run yields the same
   grouped shape with OWASP `[Axx]` tags preserved and zero shorthand.
3. The ngx-smart-components UAT runs in a DEDICATED worktree branched from the
   `uat/pre-storybook-compodoc` checkpoint branch (exact name verified at plan
   time; that repo has active work in progress).
4. An empirical n>=3 budget-gate run on the NEW grammar confirms both agents
   stay within the word-budget cap -- MEASURED on real output, not reasoned.
5. A scoped `git grep` confirms zero `crit:|imp:|sug:|q:` residue in
   `plugins/lz-advisor/`, and the sweep touches NO frozen v1.0 history
   (`.planning/milestones/`, archived phase summaries, UAT traces); new v1.0.1
   planning artifacts are exempt.

**Out of scope (defined boundary, not gray area):** rewriting the grammar
(Phase 12, done and verified at fixture level); reverting any Phase 7 lexicon
unification; the deferred RPT-F01/F02/F03 report-format enhancements; adding new
review/security-review capabilities; mutating the ngx-smart-components active
working tree. A standing residue regression test is noted as a deferred
hardening idea, not built here (verify-only phase).

**What is already green (do NOT re-prove):** `12-UAT.md` confirmed both budget
fixtures parse the grouped grammar GREEN-on-new, RED-on-old-shorthand,
RED-on-`[Axx]`-missing, via `--self-test` and `--from-trace` against the agents'
SELF-EXTRACTED worked examples. Phase 13's NEW evidence is the LIVE render +
the budget gate on LIVE agent output (not the hand-authored examples) -- the
gap `12-UAT.md` explicitly deferred to GATE-02.

</domain>

<decisions>
## Implementation Decisions

These are the HOW-level choices this discussion resolved for the verification
mechanism. The WHAT (the five success criteria) is locked in ROADMAP.md +
REQUIREMENTS.md GATE-02 and is not re-opened.

### Behavioral UAT harness (SC-1, SC-2)
- **D-01:** Run each review skill via the canonical headless form
  `claude --model sonnet --permission-mode auto --plugin-dir "<abs path to
  plugins/lz-advisor>" -p "/lz-advisor:review <one-sentence directive>"
  --verbose --output-format stream-json`, CWD = the ngx-smart-components
  worktree (per CLAUDE.md "Skill Verification with `claude -p`"). Use the
  qualified `/lz-advisor:<skill>` slash form (reliable activation), `auto`
  permission mode (NOT `acceptEdits`, which denies the skill launch), and a
  PROSE target reference -- NEVER an `@file` mention in `-p` (breaks slash-command
  recognition). Capture stream-json to a file for grading.
- **D-02:** Sample **n>=3 runs per skill** (not a single binary run), and REUSE
  the same captures for the budget gate (D-04). Few-shot drift is probabilistic
  -- one clean run can mask intermittent shorthand leakage -- and SC-4 needs
  n>=3 measured anyway, so one set of >=3 captures per skill satisfies SC-1, 2,
  and 4 together. Report **Pass@k and Pass^k** per skill and overall (per the
  CLAUDE.md skill-creator convention): a run "fully passes" when its rendered
  report shows all present-severity sections under the spelled-out headlines,
  `(none)` markers where empty, OWASP `[Axx]` preserved (security), and zero
  `crit:|imp:|sug:|q:` shorthand.
- **D-03:** Grade the SKILL's final rendered report (the user-facing assistant
  text in the PARENT stream-json) for the grouped headers + shorthand absence --
  that is the render-verbatim surface the user actually sees. The
  reviewer/security-reviewer AGENT runs as a subagent; its raw emission lives in
  the subagent JSONL (`~/.claude/projects/<cwd-hash>/<session>/subagents/agent-<id>.jsonl`),
  which is the faithful source for the budget measurement (D-04). Grade shape
  from the parent stream; measure budget from the agent emission.

### Budget-gate measurement source (SC-4)
- **D-04:** Measure the n>=3 budget gate by feeding the LIVE captured agent
  output into the existing `tests/D-reviewer-budget.sh --from-trace <file>` and
  `tests/D-security-reviewer-budget.sh --from-trace <file>` fixtures. The
  fixtures already encode the per-section sub-caps, the anti-vacuous
  `matched_count >= min` guard, and (security) the `[Axx]` bracket assertion --
  so the budget number reflects REAL agent output on a REAL repo, exactly what
  D-09 / the locked decision demands ("measured, not reasoned; the project has
  been burned 3x assuming budget-neutrality"). The self-extracted example sample
  is explicitly NOT an acceptable SC-4 source -- it would re-measure the
  hand-authored example, which is vacuous for "empirical on new grammar."
- **D-05:** A small extraction step converts each stream-json / subagent-JSONL
  capture into the plain rendered-text shape `--from-trace` expects (jq over the
  assistant message text). The exact extraction one-liner is Claude's discretion
  (planner derives it from the capture schema).

### ngx-smart-components worktree provisioning (SC-3)
- **D-06:** The UAT runs in a DEDICATED `git worktree` branched from the verified
  checkpoint branch inside the external repo at
  `/d/projects/github/LayZeeDK/ngx-smart-components` -- NEVER on its live working
  tree (that repo is under active development; worktree discipline applies even
  though the tree is currently clean on `main`). This is a MANUAL `git worktree
  add` in the external repo, NOT a Claude Code subagent `isolation: worktree`
  (that branches from origin/HEAD and is for parallel mutation of THIS repo).
  **PLAN-TIME RESOLUTION (2026-06-08, user-confirmed):** the branch named in
  ROADMAP/REQUIREMENTS SC-3, `uat/pre-storybook-compodoc`, DOES NOT EXIST in the
  ngx repo (verified via `git rev-parse` -> `fatal: ambiguous argument`). The
  user confirmed the intended checkpoint is **`lz-advisor-compodoc-storybook-uat-base`**
  (SHA `019a26a`, 2026-04-14 -- literally the lz-advisor compodoc/storybook UAT
  base; 4 branches share this SHA, confirming it as the canonical baseline). The
  throwaway worktree is created on a NEW branch `uat/phase-13-render` off this
  base. All plans + execution MUST use `lz-advisor-compodoc-storybook-uat-base`,
  never the absent spec name.
- **D-07:** Defend the documented worktree base-drift failure mode: confirm the
  exact checkpoint branch name exists (`git branch --list 'uat/pre-storybook-compodoc'`)
  BEFORE `worktree add`; capture `EXPECTED_BASE` = the checkpoint branch SHA;
  after creating the worktree verify its base matches and correct with
  `git merge --ff-only` (NOT `reset --soft`) if drifted. (CLAUDE.md "Claude Code
  worktree isolation" + the `reference_claude_worktree_baseref_origin_head`
  memory.)
- **D-08:** EXTRACT all UAT artifacts (captured stream-json/JSONL traces, the
  graded findings, Pass@k numbers) into this repo's
  `.planning/phases/13-empirical-verification/` BEFORE removing the ngx
  worktree -- worktree removal discards uncommitted artifacts
  (`feedback_worktree_artifact_loss`). The canonical evidence lives in the
  lz-advisor planning tree, not the throwaway worktree.

### Residue sweep + failure disposition (SC-5)
- **D-09:** The residue sweep is a ONE-SHOT scoped `git grep -nE
  'crit:|imp:|sug:|q:' -- plugins/lz-advisor/` recorded as UAT/VERIFICATION
  evidence (expected: zero hits, exit 1). The `-- plugins/lz-advisor/` pathspec
  ALONE excludes every frozen `.planning/` history artifact -- no fragile
  per-directory `:(exclude)` list, and no risk of flagging accurate history
  (Phase 9 precedent: historical shorthand references stay as accurate history).
  The `q:` token is matched with word-boundary care to avoid false hits on
  ordinary prose.
- **D-10:** Failure disposition is SPLIT by failure class. MECHANICAL residue
  the sweep surfaces (a stray shorthand/typo on a single operational surface) is
  fixed IN-PHASE and re-swept to confirm -- the sweep is a find-and-clean
  deliverable of this phase. A SUBSTANTIVE behavioral failure (the grouped
  grammar does NOT reach the rendered report = few-shot drift) is recorded as a
  gap and routed to a Phase 12.x gap-closure REPLAN -- it is an agent-contract
  rewrite, and patching it inline inside a verify phase repeats the documented
  WR-05 partial-rewrite scar. Verification observes; it does not silently
  rewrite the contract.

### Claude's Discretion
- The exact `uat/pre-storybook-compodoc` branch name + whether a newer
  checkpoint branch supersedes it (SC-3 defers this verification to plan time).
- The realistic review target within the ngx worktree (which changed files /
  diff slice to point `:review` at) -- pick a slice that yields >=5 findings so
  the anti-vacuous guard is satisfied and the budget caps are actually exercised.
- Exact n: 3 is the floor; 5 gives sharper Pass@k discrimination per the
  skill-creator convention. Planner picks based on the 5-hour session-pool /
  credit budget (nested `claude -p` draws on the same pool -- can hit
  `out_of_credits` mid-run; budget across reset windows).
- The stream-json/JSONL -> trace-file extraction one-liner (D-05).
- Whether grading uses a throwaway grader script or inline `rg`/`git grep` over
  the captured rendered text.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Locked requirements and decisions
- `.planning/ROADMAP.md` -- Phase 13 entry: goal + the five success criteria +
  GATE-02; the v1.0.1 milestone locked-decisions block.
- `.planning/REQUIREMENTS.md` -- GATE-02 verbatim (line 44); the 4 locked
  milestone decisions; the Out-of-Scope table; deferred RPT-F01/F02/F03.
- `.planning/PROJECT.md` -- "Current Milestone" context + Key Decisions (Phase 7
  lexicon-unification history WR-01..WR-05; the budget-neutrality scar).
- `.planning/phases/12-atomic-grouped-grammar-rewrite/12-CONTEXT.md` -- D-01..D-11:
  the exact grammar shape (four `###` headers, `(none)` markers, continuous
  curation-order numbers, `[Axx]` placement) the UAT must confirm reached output.
- `.planning/phases/12-atomic-grouped-grammar-rewrite/12-UAT.md` -- explicitly
  DEFERS the live-render proof + n>=3 budget gate on live output to Phase 13
  GATE-02; documents what is already fixture-green (do not re-prove).

### Headless UAT how-to (THE authoritative procedure)
- `CLAUDE.md` section "Conventions > Skill Verification with `claude -p`" -- the
  canonical headless command form, `--permission-mode auto` (NOT `acceptEdits`),
  the `@file`-in-`-p` breakage, qualified `lz-advisor:<skill>` naming, stream-json
  grading, the subagent JSONL path for tool/budget data, and the nested-session
  credit-pool caveat. The single most important ref for this phase.
- `CLAUDE.md` section "Claude Code worktree isolation (...)" -- the
  `worktree.baseRef` origin/HEAD base-drift gotcha and the `git merge --ff-only`
  (not `reset --soft`) correction. Governs D-06/D-07.

### Verification targets (the surfaces under test)
- `plugins/lz-advisor/agents/reviewer.md` -- grouped-grammar source for `:review`.
- `plugins/lz-advisor/agents/security-reviewer.md` -- grouped grammar + OWASP
  `[Axx]` + CVE carve-out source for `:security-review`.
- `plugins/lz-advisor/skills/review/SKILL.md` -- render-verbatim contract that
  must carry the four headers to rendered output.
- `plugins/lz-advisor/skills/security-review/SKILL.md` -- same render-verbatim
  contract for the security skill.

### Budget-gate mechanism (reuse, do not re-author)
- `tests/D-reviewer-budget.sh` -- `--from-trace <file>` / `--self-test` modes,
  header-tracking + numbered-line parser, per-section sub-caps, anti-vacuous
  `matched_count >= min` guard. The SC-4 measurement tool.
- `tests/D-security-reviewer-budget.sh` -- same, plus the load-bearing `[Axx]`
  bracket assertion in `FINDING_RE` and the 75w CVE auto-clarity carve-out.

### External UAT target
- `/d/projects/github/LayZeeDK/ngx-smart-components` -- the third-party Angular
  repo the live review runs against; branch `uat/pre-storybook-compodoc`
  (confirm exact name at plan time; repo has active WIP -- worktree-only).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Phase 11/12 budget fixtures** (`tests/D-reviewer-budget.sh`,
  `tests/D-security-reviewer-budget.sh`): the `--from-trace <file>` replay mode
  is the SC-4 measurement vehicle -- feed live captures in, get a measured
  per-section + aggregate budget verdict with the anti-vacuous guard already
  wired. No new test harness needed for the budget gate.
- **The CLAUDE.md headless-UAT convention**: a complete, project-tested command
  recipe (validated in Phase 2 and Phase 8 gap-closure GAP-S9/S10) -- the plan
  reuses it verbatim rather than re-deriving flags.
- **Phase 11/12 UAT.md format**: the `### N. <test>` / `expected:` / `result:` /
  `evidence:` structure is the established autonomous-UAT shape; Phase 13's
  `13-UAT.md` follows it, adding the Pass@k/Pass^k table.

### Established Patterns
- **Render-verbatim contract**: the skill emits the agent response unchanged and
  enumerates the literal headers that must reach the user. The behavioral grade
  (D-03) therefore targets the parent stream's final rendered report -- that IS
  the user-facing surface the contract protects.
- **Per-surface disposition / leave-history-as-history** (Phase 9 precedent):
  the residue sweep scopes to `plugins/lz-advisor/` and never touches the ~362
  frozen `.planning/` history artifacts -- the pathspec enforces this structurally.
- **Gap-closure replan** (Phase 8 GAP-S9/S10): substantive behavioral failures
  route to a planned gap-closure cycle, not an inline verify-phase patch (D-10).

### Integration Points
- The `claude -p` headless run bridges THREE surfaces: CWD = ngx worktree (the
  review subject), `--plugin-dir` = absolute lz-advisor path (the skills under
  test), and the captured stream-json/subagent-JSONL = the evidence the budget
  fixtures and the shape grader consume. Getting any one wrong invalidates the run.
- The reviewer/security-reviewer agent is a SUBAGENT of the skill; its raw
  emission (budget source) is in the subagent JSONL, while the skill's rendered
  report (shape source) is in the parent stream -- the plan must capture both.

</code_context>

<specifics>
## Specific Ideas

- Canonical headless prompt form is `/lz-advisor:<skill> <one sentence>` -- a
  terse one-sentence directive, NOT a verbose deliverable list (verbose prompts
  cause orient loops; `feedback_uat_canonical_prompt_format`).
- Grouped headers under test are exactly `### Critical`, `### Important`,
  `### Suggestions`, `### Questions` (plural on the last two), with a literal
  `(none)` line for empty severities -- the grader matches these byte-shapes.
- OWASP tag form is the `[Axx]` bracket (e.g. `[A02]`), preserved byte-for-byte
  immediately after the location on security findings.
- Shorthand to prove ABSENT: `crit:` / `imp:` / `sug:` / `q:` (and no
  `(formerly High)` / `(formerly Medium)` residue) anywhere in
  `plugins/lz-advisor/`.
- ASCII-only throughout; no emoji/icon severity markers (hard constraint).

</specifics>

<deferred>
## Deferred Ideas

- **Standing residue regression test** (`tests/D-residue-sweep.sh` or similar):
  a committed test that fails on any `crit:|imp:|sug:|q:` in operational paths
  would be a durable guard, but it is Phase-12-style hardening, not verification.
  This verify-only phase uses the one-shot scoped `git grep` (D-09); the tracked
  guard is a future-milestone hardening idea. (Phase 12's retargeted budget
  fixtures already guard the agent grammar shape, partially covering this.)
- **RPT-F01 / RPT-F02 / RPT-F03** (carried from `12-CONTEXT.md`): per-severity
  roll-up counts, severity/kind axis split, severity-prefixed finding IDs --
  all future-milestone report-format enhancements, untouched here.

### Reviewed Todos (not folded)
- **research-rtk-command-suitability-for-skills-and-agents** (matched at score
  0.6 on superficial keyword overlap: skills/agents/status/work/phase).
  **Reviewed and NOT folded** -- it is orthogonal RTK-tooling research (token
  savings of `rtk git diff` / `rtk gh pr diff` vs detail-loss in the review
  skills), unrelated to GATE-02's behavioral/budget/residue verification.
  Folding RTK research into a verify-only phase would be scope creep. (Deliberate
  deviation from the blanket `--auto` >=0.4 auto-fold heuristic -- same call
  Phase 12 made; flagged here for the audit trail.) Remains pending for a future
  tooling phase.

</deferred>

---

*Phase: 13-empirical-verification*
*Context gathered: 2026-06-08*
