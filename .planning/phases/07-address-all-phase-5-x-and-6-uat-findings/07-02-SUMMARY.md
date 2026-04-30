---
phase: 07-address-all-phase-5-x-and-6-uat-findings
plan: 02
subsystem: skills+agents
tags: [verify-before-commit, hedge-marker-discipline, refuse-or-flag, finding-a, finding-e1, finding-e2, finding-g, silent-resolve, sentinel-regex-reuse]

# Dependency graph
requires:
  - phase: 07-address-all-phase-5-x-and-6-uat-findings
    plan: 01
    provides: "Common Contract Rule 5b (pv-* synthesis discipline) and 4-skill <context_trust_contract> pv-* synthesis precondition supplement; trust-contract carve-out the new <verify_before_commit> block builds atop"
  - phase: 06-address-phase-5-6-uat-findings
    provides: "Plan 06-05 sentinel regex set for verify-first markers (5 patterns); inline `Assuming X (unverified), do Y. Verify X before acting.` frame in 3 agent prompts; PHASE-7-CANDIDATES.md sections E.1, E.2, A, G, silent-resolve sub-pattern; 8th UAT empirical anchor (advisor Critical-flag mechanism worked in spirit)"
provides:
  - "Hedge Marker Discipline section in 3 agent prompts (advisor / reviewer / security-reviewer) with literal `Unresolved hedge: <marker>. Verify <action> before/after committing.` frame"
  - "<verify_before_commit> block in lz-advisor.execute/SKILL.md (Phase 3.5) covering all 4 D-05 elements (E.1 hedge resolution + E.2 plan-step Run/Verify + cost-cliff allowance + Verified: trailer convention) plus Reconciliation extension for Finding A apply-then-revert flow"
  - "Review SKILL.md ### Scan Criteria gains 'Verification gaps in implementation of hedged claims' bullet (downstream safety net for verify-skip discipline)"
  - "Plan SKILL.md plan-file template gains conditional ## Findings Disposition section with 4 explicit dispositions (addressed / deferred / rejected / not-applicable) for numbered finding-list inputs"
  - "Sentinel regex set reused verbatim from Plan 06-05 across 5 places (3 agents + execute SKILL + review SKILL) with no new regex"
affects: ["plan-07-04", "plan-07-06"]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Paired upstream-prevention + downstream-detection: agent refuse-or-flag rule (E.1 prompt-layer) + execute SKILL <verify_before_commit> block (E.1+E.2 execution-layer) + review SKILL scan criterion (G safety-net layer). Three layers reject the same verify-skip pathway from different angles."
    - "Cost-cliff aware verification: cheap synchronous validations execute pre-commit; long-running async validations (nx storybook, full test suites, dev-server startup) move to wip: + ## Outstanding Verification body section. Formalizes 8th UAT empirical pattern (3 of 4 cheap directives ran; 1 long-running skipped) into a documented commitment instead of silent loss."
    - "Verified: trailer as detection signal (not verification mechanism): smoke fixture cross-greps trailer + tool_use event in JSONL trace; either alone is non-conforming. Architectural difference between transcript-parsing verification (unreliable) and outcome-based verification (reliable)."
    - "Sentinel regex reuse discipline: same 5-regex set reused verbatim from Plan 06-05 across 5 surfaces; no new regex introduced. Future regex changes propagate atomically across all 5 surfaces."
    - "Findings Disposition convention as silent-drop sentinel: explicit per-finding disposition prevents the silent-resolve sub-pattern observed in 7th UAT (plan addressed 3 of 5 input findings, silently dropped 2). Conditional (only applies when input is numbered finding list)."

key-files:
  created: []
  modified:
    - "plugins/lz-advisor/agents/advisor.md"
    - "plugins/lz-advisor/agents/reviewer.md"
    - "plugins/lz-advisor/agents/security-reviewer.md"
    - "plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md"
    - "plugins/lz-advisor/skills/lz-advisor.review/SKILL.md"
    - "plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md"

key-decisions:
  - "Per-agent placement variations distinguish role-specific contracts: advisor places frame in **Critical: block or Strategic Direction list; reviewer places frame in ### Findings entry or ### Cross-Cutting Patterns; security-reviewer places frame in ### Findings entry or ### Threat Patterns AND adds severity-downgrade rationale ('Severity: Medium pending verification of <hedge action>.') for security-clearance hedges. Each agent's structural placement matches its existing output contract; the frame composes additively rather than displacing existing structure."
  - "Phase 4 step 0 references the new <verify_before_commit> block by name rather than restating its content. Keeps Phase 4 lean (step 0 is one sentence) while preserving the byte-identical 'never use git add . / git add -A' prohibition in step 3. The existing 1/2/3 numbered list is renumbered to 0/1/2/3 with no other changes to step content."
  - "Findings Disposition section is conditional (only when input is numbered finding list) rather than mandatory. Free-form task descriptions (the common case) do not invoke the section. Conditionality is explicit in the section header itself ('## Findings Disposition (when input is a numbered finding list)') and reinforced by the prose ('this section is OMITTED -- it does not apply to fresh tasks'). Prevents the convention from cluttering plans for fresh tasks."
  - "Cost-cliff threshold heuristic per CONTEXT.md Claude's Discretion: command-name pattern with explicit override list (nx storybook, nx test*, nx serve*, nx run-many over many projects, full test suites). Documented in the SKILL.md prose with a 30-second timeout heuristic as a secondary signal. Behavioral validation deferred to Plan 07-06 E-verify-before-commit.sh smoke fixture."
  - "Verified: trailer format per CONTEXT.md Claude's Discretion: one trailer per claim, format 'Verified: <claim text>' on its own line in commit body after body paragraphs; multiple trailers allowed; never embedded in subject line. Verified-by: <tool_use_id> trailer field DEFERRED per CONTEXT.md Deferred Ideas (parsing complexity outweighs traceability gain at this stage)."

patterns-established:
  - "Three-layer verify-skip prevention: agent prompt (refuse-or-flag) + execute SKILL (verify-before-commit) + review SKILL (scan criterion). Each layer addresses a different surface (prompt-construction / execution / post-hoc detection) without redundancy."
  - "Sentinel regex set as a load-bearing canonical artifact: 5 regex patterns from Plan 06-05 reused verbatim across 5 surfaces in Plan 07-02. The regex set is now a stable contract that future plans extend atomically (single change-point) rather than accreting per-surface drift."
  - "Disposition convention as silent-drop prevention: explicit per-finding disposition with 4 enumerated values (addressed / deferred / rejected / not-applicable) makes drops user-visible. The convention is a compile-time-style check at the plan-output layer rather than runtime detection."

requirements-completed: [FIND-A, FIND-E.1, FIND-E.2, FIND-G, FIND-silent-resolve]

# Metrics
duration: approximately 10min
completed: 2026-04-30
---

# Phase 07 Plan 02: verify-skip discipline (verify-before-commit + safety net) Summary

**Landed paired upstream-prevention + downstream-detection for the verify-skip discipline gap: 3 agents (advisor + reviewer + security-reviewer) gain a `## Hedge Marker Discipline` section with literal `Unresolved hedge:` frame; lz-advisor.execute/SKILL.md gains a `<verify_before_commit>` Phase 3.5 block (E.1 + E.2 + cost-cliff + Verified: trailer + Reconciliation extension for Finding A); lz-advisor.review/SKILL.md scan criteria gain a 'Verification gaps in implementation of hedged claims' Flag bullet; lz-advisor.plan/SKILL.md plan-file template gains a conditional `## Findings Disposition` section with 4 explicit dispositions covering the silent-resolve sub-pattern.**

## Performance

- **Duration:** approximately 10 minutes
- **Started:** 2026-04-30 (worktree-agent-a22fad814f8e18cc9)
- **Tasks completed:** 3 of 3 (no checkpoints, no deviations)
- **Files modified:** 6
- **Files created:** 0

## What Was Done

### Task 1: Hedge Marker Discipline section in 3 agent prompts (FIND-E.1)

Added a new `## Hedge Marker Discipline` section to each of the 3 agent prompts (`advisor.md`, `reviewer.md`, `security-reviewer.md`). The section appears between the existing `## Edge Cases` and `## Boundaries` sections in each file, preserving the existing section ordering elsewhere.

The section content directs the agent to surface an unresolved hedge in source material (review files, plan files, prior consultations, `## Pre-verified Package Behavior Claims` blocks) using the literal frame:

`Unresolved hedge: <marker text or paraphrase>. Verify <action> before committing.`

Phase 6 final-review consultations use the `after committing.` variant. Forbidden paraphrases (`Pending verification:`, `Hedge unresolved:`, `Outstanding verification:`, softer hedges) are explicitly enumerated in the negative-example list -- the executor greps for the literal `Unresolved hedge:` token to route the item to verification.

The 5 sentinel regexes from Plan 06-05 (`\b(unverified)\b`, `\bverify .+ before acting\b`, `\bAssuming .+ \(unverified\)\b`, `\bconfirm .+ before\b`, `\bfall back to .+ if .+\b`) are reused verbatim with no new regex introduced.

**Per-agent placement variations:**

- **advisor.md:** frame goes in a `**Critical:**` block when correctness-affecting; otherwise as a numbered Strategic Direction item.
- **reviewer.md:** frame goes inside the relevant `### Findings` entry as the validation step's conclusion; otherwise within `### Cross-Cutting Patterns` as a verification-gap pattern.
- **security-reviewer.md:** frame goes inside the relevant `### Findings` entry; otherwise within `### Threat Patterns`. Additional severity-downgrade rationale clause for security-clearance hedges (CVE / supply-chain / advisory / authentication / authorization): "Severity: Medium pending verification of <hedge action>." Severity escalates if verification confirms the threat.

The new rule composes additively with the existing inline `Assuming X (unverified), do Y. Verify X before acting.` frame: the inline frame surfaces premises the AGENT is asserting; the `Unresolved hedge:` frame surfaces premises UPSTREAM artifacts asserted that the executor packaged into the prompt unverified.

**Commit:** `4b61907 feat(07-02): add Hedge Marker Discipline section to 3 agents`

### Task 2: <verify_before_commit> block in lz-advisor.execute/SKILL.md (FIND-A + E.1 + E.2)

Inserted a new top-level XML container `<verify_before_commit>...</verify_before_commit>` block between the existing `</execute>` (Phase 3) and `<durable>` (Phase 4) blocks. The block contains a `## Phase 3.5: Verify Before Commit` section with all 4 D-05 elements:

1. **Hedge marker resolution (E.1).** When source material contains an unresolved verify-first marker (sentinel regex set reused verbatim) AND the advisor did not flag the hedge with the literal `Unresolved hedge:` frame, the executor MUST perform the verification action before staging related changes. When the advisor DID flag the hedge with the literal frame, the verification action becomes a hard precondition for the commit -- changes do not stage until verification has run AND the outcome is recorded as either a `<pre_verified>` block synthesized for the next consultation OR a `Verified: <claim>` trailer on the commit body.

2. **Plan-step shape rule (E.2).** When the plan input contains a numbered, executable plan step structured as `N. **Validate** ... - Run: <command> - Verify: <observable conditions>`, the `Run:` directive is treated as an EXECUTOR-BOUND action (Bash invocation BEFORE the commit), not a USER-FACING instruction. Failure to execute the `Run:` directive before the commit is a verify-skip violation triggering the cost-cliff allowance.

3. **Cost-cliff allowance.** Cheap synchronous validations execute pre-commit (`npm ls`, `npm install`, `git grep`, `git check-ignore`, `git status`, `lint`, `tsc --noEmit`, `tsc --noEmit --pretty`, `jest --bail`, focused test runs; commands expected to complete in under 30 seconds). Long-running async validations (`nx storybook`, `nx test`, `nx test-storybook`, `nx serve*`, `nx run-many` over more than 3 projects; full test suites lasting longer than 30 seconds; dev-server startup or watch-mode commands) move to a `wip:` prefixed commit with a `## Outstanding Verification` body section listing the pending checks. Conversion to a regular commit (or follow-up non-wip commit) records verification outcomes as additional `Verified:` trailers OR a new `## Verified Outstanding` body section.

4. **`Verified:` trailer convention.** Format: `Verified: <claim text>` on its own line in the commit body, after body paragraphs; multiple trailers allowed; never embedded in subject line. The trailer is a DETECTION SIGNAL, not a verification mechanism: Plan 07-06's smoke fixture `E-verify-before-commit.sh` cross-greps BOTH the trailer presence AND the corresponding `tool_use` event in the JSONL trace. Either alone is non-conforming.

The block also contains a **Reconciliation extension** sub-section covering the apply-then-revert flow on advisor `**Critical:**` content (Finding A): silent revert is forbidden; the executor must choose either (a) empirical verification of contradicting evidence with `Verified:` trailer documenting the verification, OR (b) a reconciliation call to the advisor: "Applied your Critical X, then found Y contradicts it. Which is correct?" The xhigh advisor cost is cheap insurance against Critical-content silent loss.

Phase 4 (`<durable>`) gains a new step 0 referencing the new block by name, with the existing 1/2/3 numbered list renumbered to 0/1/2/3. Step 3's existing `never use \`git add .\` or \`git add -A\`` prohibition is preserved byte-identically.

**Commit:** `5125f8a feat(07-02): add <verify_before_commit> block to execute SKILL.md`

### Task 3: Review scan criterion + Plan Findings Disposition (FIND-G + FIND-silent-resolve)

**Review scan criterion (FIND-G).** Added a new bullet to the `### Scan Criteria` Flag list in `plugins/lz-advisor/skills/lz-advisor.review/SKILL.md`. The bullet directs the reviewer to flag changed code that implements a load-bearing claim an upstream artifact marked as hedged (sentinel regex set reused verbatim) when the commit body lacks a verification record. The verification record is one of: (a) a `Verified: <claim>` trailer; (b) a `<pre_verified>` anchor referenced in the commit body; (c) explicit empirical evidence (test output, build log, file content) recorded in the commit body. The absence of all three triggers a finding "Hedged claim X was implemented without verification record." with severity Important (correctness or security) or Suggestion (otherwise). The bullet appears at the end of the existing Flag list, AFTER `- Edge cases not handled`.

**Plan Findings Disposition (FIND-silent-resolve).** Added a conditional `## Findings Disposition (when input is a numbered finding list)` section to the plan-file template in `plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md`. The section appears AFTER `## Strategic Direction` and BEFORE `## Steps` within the existing template code block. The convention requires the plan to address ALL N input findings with explicit per-finding disposition: one of `addressed` (Step in this plan implements fix), `deferred` (out of scope; references where handled), `rejected` (does not apply or fix creates new problems; rationale required), or `not-applicable` (resolved by other means or false positive). Each finding entry includes a one-line summary, disposition, and a 1-2 sentence rationale.

The section is conditional: when no numbered finding list is supplied (free-form task descriptions, the common case), the section is OMITTED. The conditionality is explicit in the header itself and reinforced in the prose, preventing the convention from cluttering plans for fresh tasks. The closure rationale references 7th UAT empirical observation: plan-fixes-2 addressed 3 of 5 input findings with code changes but silently dropped F3 and F4 with no acknowledgment.

Existing template structure (`## Steps`, `## Key Decisions`, `## Dependencies`) preserved.

**Commit:** `286d2af feat(07-02): add review scan criterion + plan Findings Disposition convention`

## Verification

### Per-task verification

All 3 tasks pass their automated `<verify>` and `<acceptance_criteria>` blocks:

- **Task 1:** `## Hedge Marker Discipline` count = 1 in each of 3 agents; `Unresolved hedge:` count = 4 in each agent (>=2 required); 5 sentinel regexes each = 1 in each agent; awk line-order check Edge Cases (a) < Hedge Marker Discipline (b) < Boundaries (c) exits 0 in all 3 agents; reviewer.md mentions `### Cross-Cutting Patterns` (4); security-reviewer.md mentions `### Threat Patterns` (4); forbidden paraphrases (`Pending verification:`, `Hedge unresolved:`, `Outstanding verification:`) appear ONLY in the negative-example list within the new section (acceptable per acceptance criteria).
- **Task 2:** `<verify_before_commit>` opening AND closing tags present (count: 2 = open + close); `## Phase 3.5: Verify Before Commit` count = 1; all 4 D-05 element headings present (`Hedge marker resolution (E.1)`, `Plan-step shape rule (E.2)`, `Cost-cliff allowance`, `trailer convention`); Reconciliation extension count = 1; cost-cliff override list mentions all required commands (nx storybook, nx test, nx run-many); sentinel regex reused verbatim; `## Outstanding Verification` count = 2 (in cost-cliff prose + in code block example); `Verified:` count = 9 (multiple references in different elements); awk line-order `</execute>` (a=159) < `<verify_before_commit>` (b=161) < `<durable>` (c=232) exits 0; Phase 4 step 0 present; `never use \`git add .\`` prohibition preserved (count: 1).
- **Task 3:** Review SKILL.md scan criterion count = 1; all 3 verification record alternatives present (`Verified: <claim>`: 1, `<pre_verified>`: 2, `empirical evidence`: 1); all 5 sentinel patterns each = 1; awk Flag (a=96) < Edge cases not handled (b=102) < Verification gaps (c=103) ORDER OK; Plan SKILL.md `## Findings Disposition (when input is a numbered finding list)` count = 1; 4 disposition values present (addressed: 3, deferred: 3, rejected: 2, not-applicable: 1); awk Strategic Direction (a=146) < Findings Disposition (b=154) < Steps (c=166) ORDER OK; existing template structure preserved (`## Steps`, `## Key Decisions`, `## Dependencies` each = 1).

### Plan-level verification

| Check | Result |
|-------|--------|
| Sentinel regex set reused verbatim across 5 places (3 agents + execute SKILL + review SKILL) | 5/5 patterns each = 1 in each of 5 files |
| `Unresolved hedge:` literal frame in 3 agents | 4/4/4 occurrences |
| `## Findings Disposition` in plan SKILL.md | 1 |
| Reviewer / security-reviewer per-agent placement guidance | Cross-Cutting Patterns and Threat Patterns mentions present |
| All structural checks pass; behavioral validation deferred to Plan 07-06 | yes |
| End-to-end smoke verification (E-verify-before-commit.sh) | Deferred to Plan 07-06 |

### Threat register closure

| Threat ID | Disposition | Status |
|-----------|-------------|--------|
| T-07-02-01 (Tampering: verify-skip on hedged claims) | mitigate | Closed at three layers: (1) advisor refuse-or-flag rule (Task 1) at prompt-construction layer; (2) `<verify_before_commit>` block (Task 2) at execution layer; (3) review scan criterion (Task 3) at post-hoc detection layer. Smoke fixture (Plan 07-06) cross-greps trailer + tool_use event for outcome-based verification. |
| T-07-02-02 (Repudiation: apply-then-revert silent rollback) | mitigate | Closed: Reconciliation extension (Task 2) forbids silent revert of `**Critical:**` content; requires either empirical verification + `Verified:` trailer OR reconciliation advisor call. xhigh advisor cost (~1 extra consultation) is cheap insurance against Critical-content silent loss. |
| T-07-02-03 (Repudiation: silent-drop of numbered input findings) | mitigate | Closed: Plan SKILL.md `## Findings Disposition` convention (Task 3) requires explicit disposition for ALL numbered input findings. Drops now user-visible; downstream skills (execute) can pick up deferred items in subsequent invocation. |
| T-07-02-04 (Elevation of Privilege: reviewer / security-reviewer agent privilege) | accept | No tool grant changes; both keep `[Read, Glob]` per OWASP / arXiv 2601.11893 / Claude Code Issue #20264. New scan criterion operates within existing tool grant. |

## Deviations from Plan

None -- plan executed exactly as written. No Rule 1/2/3 auto-fixes triggered, no Rule 4 architectural questions raised, no authentication gates encountered.

The worktree branch was reset from `c797c16` (origin/main snapshot lacking 07-01 deliverables) to the expected base `de84076` (last 07-01 commit) per the `<worktree_branch_check>` instructions before executing any task. Then `git checkout de840765 -- .planning plugins/lz-advisor` repopulated the index and worktree from the expected base. This is environmental setup, not a plan deviation.

## Known Stubs

None. All edits ship complete prose; no placeholder text, no TODO/FIXME markers introduced. The literal `Verified: <claim>` and `<pre_verified>` substring tokens in the new prose are documentation conventions for the contract (placeholder syntax matching existing agent prompt convention from `Assuming X (unverified), do Y.`); they are not stub markers and they are read by smoke fixtures verbatim per design.

## Followups

- **Plan 07-04:** word-budget enforcement on 3 agent prompts. The new `## Hedge Marker Discipline` section in each agent prompt is structural prose for the agent's contract -- not output the agent emits at runtime -- so it does not consume runtime word budget. Plan 07-04 may want to verify that the new section does not reduce the agent's structural word budget by adding header overhead at runtime; verification is a smoke-fixture concern handled in Plan 07-06.
- **Plan 07-06:** `E-verify-before-commit.sh` smoke fixture is the behavioural confirmation for this plan. The fixture (per CONTEXT.md) synthesizes a hedge-marker survival scenario plus an explicit `Run:` directive in plan steps; asserts (a) advisor flags unresolved hedge with canonical frame, OR (b) executor performs verification action AND adds `Verified:` trailer, OR (c) executor produces `wip:` commit + `## Outstanding Verification` section. UAT replay subset (plan-fixes + execute-fixes + security-review) exercises all three layers end-to-end on plugin 0.10.0.
- **Plan 07-03:** confidence-laundering guards (hedge propagation, cross-skill hedge tracking, version-qualifier anchoring, scope-disambiguated provenance markers) compose with this plan's `Unresolved hedge:` frame. Plan 07-03 may extend the frame's scope (e.g., to version-qualifier hedges) without changing the literal frame text -- the frame is a stable contract.

## Self-Check: PASSED

Verified all claims:

- File `plugins/lz-advisor/agents/advisor.md` exists and contains `## Hedge Marker Discipline` (count: 1) and `Unresolved hedge:` (count: 4)
- File `plugins/lz-advisor/agents/reviewer.md` exists and contains `## Hedge Marker Discipline` (count: 1) and `Unresolved hedge:` (count: 4) and `### Cross-Cutting Patterns` mention (count: 4)
- File `plugins/lz-advisor/agents/security-reviewer.md` exists and contains `## Hedge Marker Discipline` (count: 1) and `Unresolved hedge:` (count: 4) and `### Threat Patterns` mention (count: 4)
- File `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` exists and contains `<verify_before_commit>` (count: 2 = open + close), `## Phase 3.5: Verify Before Commit` (count: 1), all 4 D-05 element headings (count: 1 each), Reconciliation extension (count: 1), Phase 4 step 0 (count: 1)
- File `plugins/lz-advisor/skills/lz-advisor.review/SKILL.md` exists and contains `Verification gaps in implementation of hedged claims` (count: 1) at the end of the existing Flag list
- File `plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md` exists and contains `## Findings Disposition` (count: 1) between `## Strategic Direction` and `## Steps` in the template code block
- Commit `4b61907` exists in `git log` (Task 1)
- Commit `5125f8a` exists in `git log` (Task 2)
- Commit `286d2af` exists in `git log` (Task 3)
