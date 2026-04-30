---
phase: 07-address-all-phase-5-x-and-6-uat-findings
plan: 01
subsystem: skills
tags: [pv-validation, common-contract, context-trust-contract, byte-identical-canon, smoke-fixture, finding-h, finding-b1, finding-b2, gap-g1-g2-empirical]

# Dependency graph
requires:
  - phase: 06-address-phase-5-6-uat-findings
    provides: "Common Contract Rule 5 + 5a + 6 baseline; 4-skill byte-identical <context_trust_contract> with ToolSearch availability rule (Plan 06-05); pv-* XML format defined in Phase 5.4 D-07; PHASE-7-CANDIDATES.md empirical anchors for Findings B.1, B.2, H"
provides:
  - Common Contract Rule 5b (pv-* synthesis discipline) with 5 sub-rules: Format mandate, Source-grounded evidence requirement, Self-anchor rejection, Synthesis mandate, ToolSearch precondition
  - 4-skill byte-identical pv-* synthesis precondition supplement inside <context_trust_contract>, cross-referencing Rule 5b
  - B-pv-validation.sh smoke fixture (4 assertions: XML format, synthesis count, no self-anchor, no empty evidence)
  - Empirical-anchor enforcement layer for Plans 07-02/07-03/07-05 (which assume pv-* validation primitive trustworthy)
  - GAP-G1+G2-empirical structural closure at the synthesis layer (Phase 6 follow-up)
affects: ["plan-07-02", "plan-07-03", "plan-07-04", "plan-07-05", "plan-07-06", "phase-6-verification-amendment-6"]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Layered prevention contract: Common Contract Rule 5b (reference doc) + 4-skill synthesis precondition (skill prompts) + smoke fixture (CI gate). Three layers reject the same self-anchor pathway from different angles."
    - "Self-anchor rejection enumeration: explicitly forbid method= values that name claimed knowledge instead of tool invocations. Enumerated patterns are concrete (prior knowledge, claimed knowledge, framework knowledge, training data, general knowledge, library semantics) and verifiable via grep."
    - "Synthesis mandate (positive form): every load-bearing Read/WebFetch MUST be packaged as pv-*; closes the carry-forward + synthesis gap (Finding B.1) by mandate rather than prohibition."
    - "Byte-identical canon discipline preserved across 4 SKILL.md: 3 cross-file diffs against plan baseline = 0 lines after the supplement land."

key-files:
  created:
    - ".planning/phases/05.4-address-uat-findings-a-k/smoke-tests/B-pv-validation.sh"
  modified:
    - "plugins/lz-advisor/references/context-packaging.md"
    - "plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md"
    - "plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md"
    - "plugins/lz-advisor/skills/lz-advisor.review/SKILL.md"
    - "plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md"

key-decisions:
  - "Rule 5b sub-rules ordered by specificity: Format mandate (XML shape) -> Source-grounded evidence (path/URL + tool excerpt) -> Self-anchor rejection (forbid method= claimed knowledge) -> Synthesis mandate (every load-bearing Read/WebFetch becomes pv-*) -> ToolSearch precondition (Class 2/3/4 agent-generated input). Reading order matches enforcement order in B-pv-validation.sh assertions 1-4."
  - "4-skill <context_trust_contract> supplement is one paragraph (not split per sub-rule) and cross-references Rule 5b rather than restating all 5 sub-rules. Keeps SKILL.md prose lean; deep-detail enumeration stays in references/context-packaging.md per progressive-disclosure principle."
  - "B-pv-validation.sh mirrors KCB-economics.sh shape (Bash + scratch git repo + claude -p stream-json + rg-based JSONL trace assertions). New file rather than KCB extension keeps the smoke ladder semantically split: KCB owns K+C+B (synthesis-presence), B-pv-validation owns B.1+B.2+H (synthesis-discipline)."
  - "Self-anchor regex enumerates 9 forbidden method= values: prior knowledge, claimed knowledge, framework knowledge, training data, general knowledge, Nx semantics, Storybook semantics, Angular semantics, TypeScript semantics. The library-semantics group is open-ended in spirit (Rule 5b prose covers any '<library> semantics' pattern) but the smoke regex enumerates the four observed in 13 UAT cycles."
  - "Behavioral validation deferred to Plan 07-06 UAT replay per VALIDATION.md Tier 2 acceptance: Plan 07-01 ships the structural surface, Plan 07-06 runs the live B-pv-validation.sh against plugin 0.10.0 + UAT replay subset that closes GAP-G1+G2-empirical empirically."

patterns-established:
  - "Three-layer pv-* enforcement: reference-doc validation rule + 4-skill prompt-level precondition + smoke-test fixture. Each layer addresses a different surface (validator can read the rule; runtime advisor honours the precondition; CI catches violations)."
  - "Self-anchor as a named failure mode: Finding H now has a structural name (self-anchor) and an enumerated rejection set, transitioning it from 'rule bypass' empirical observation to enforceable contract clause."
  - "Smoke-fixture ladder split by failure-mode generation: KCB covers synthesis-presence (do pv-* blocks exist?); B-pv-validation covers synthesis-discipline (are existing pv-* blocks well-formed?). Future fixtures may cover synthesis-coverage (ratio of Read/WebFetch to pv-* synthesis) without expanding either."

requirements-completed: [FIND-B.1, FIND-B.2, FIND-H, GAP-G1+G2-empirical]

# Metrics
duration: approximately 12min
completed: 2026-05-01
---

# Phase 07 Plan 01: pv-* synthesis discipline Summary

**Strengthened Common Contract Rule 5 with new sub-rule 5b (5 sub-rules covering pv-* XML format mandate, source-grounded evidence, self-anchor rejection, synthesis mandate, ToolSearch precondition); added byte-identical pv-* synthesis precondition supplement to all 4 SKILL.md `<context_trust_contract>` blocks; shipped new B-pv-validation.sh smoke fixture (4 assertions) covering Findings B.1 + B.2 + H plus GAP-G1+G2-empirical at the synthesis layer.**

## Performance

- **Duration:** approximately 12 minutes
- **Started:** 2026-05-01 (worktree-agent-af2c058f406e3ff17)
- **Tasks completed:** 3 of 3 (no checkpoints, no deviations)
- **Files modified:** 5
- **Files created:** 1

## What Was Done

### Task 1: Common Contract Rule 5b in references/context-packaging.md

Added a new sub-rule **5b. pv-\* synthesis discipline (validation rule)** between existing Rules 5a and 6 in `plugins/lz-advisor/references/context-packaging.md`. The sub-rule contains five enumerated sub-rules:

1. **Format mandate** -- pv-* MUST use canonical XML form `<pre_verified source="..." claim_id="pv-N">...<claim>...</claim><evidence method="...">...</evidence></pre_verified>`. Plain-bullet "Pre-verified Claims" sections (Finding B.2 failure mode) are non-conforming.
2. **Source-grounded evidence requirement** -- `<evidence>` MUST contain a `source=` URL/path the executor read in this skill execution AND verbatim tool-output text content. Empty `<evidence>` is non-conforming.
3. **Self-anchor rejection** -- `method=` MUST name a concrete tool (`WebFetch | WebSearch | Read | Glob | Bash`). Forbids `method="prior knowledge"`, `method="claimed knowledge"`, `method="framework knowledge"`, `method="<library> semantics"` (Nx / Storybook / Angular), `method="training data"`, `method="general knowledge"`. This is the structural rejection of Finding H (self-confabulation despite trust-contract carve-out firing).
4. **Synthesis mandate** -- every Read or WebFetch the executor performs during orient that produces a load-bearing empirical fact MUST be packaged as a `<pre_verified>` block in the next consultation prompt. Inferred-but-not-Read claims belong in `## Source Material` or `## Orientation Findings`. Closes Finding B.1 carry-forward + synthesis gap.
5. **ToolSearch precondition** -- on Class 2/3/4 questions with agent-generated source material, the existing ToolSearch availability rule MUST fire BEFORE any pv-* synthesis. This closes GAP-G1+G2-empirical at the synthesis layer per CONTEXT.md D-02.

Rule 5a and Rule 6 are preserved byte-identically around the insertion point (verified via `awk` line-order check: a=46 < b=48 < c=68).

**Commit:** `79d2273 feat(07-01): add Common Contract Rule 5b for pv-* synthesis discipline`

### Task 2: pv-* synthesis precondition supplement in 4 SKILL.md

Added a single byte-identical paragraph -- the **pv-* synthesis precondition** -- to the `<context_trust_contract>` block in all four SKILL.md files (`lz-advisor.plan`, `lz-advisor.execute`, `lz-advisor.review`, `lz-advisor.security-review`). Insertion point: directly after the existing **ToolSearch availability rule** paragraph and before the **When no authoritative source block is present** closing paragraph.

The supplement:

- Mandates that every `<pre_verified>` block on a Class 2/3/4 question must satisfy either (a) a tool-output excerpt in `<evidence>` with the source URL/path produced in the current skill execution OR (b) a prior ToolSearch availability rule firing in the current skill execution.
- Cross-references `references/context-packaging.md` Common Contract Rule 5b for the full enumeration.
- Names the self-anchor pathway as the dominant Phase 6 + Phase 7 empirical failure mode (Finding H).

Byte-identical canon preserved: `diff <(awk '/<context_trust_contract>/,/<\/context_trust_contract>/' plan-SKILL) <(awk … execute-SKILL)` exits 0 for all three pairwise comparisons (plan vs execute, plan vs review, plan vs security-review).

**Commit:** `e9f4166 feat(07-01): add pv-* synthesis precondition to 4 SKILL.md context_trust_contract`

### Task 3: B-pv-validation.sh smoke fixture

Created `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/B-pv-validation.sh` mirroring `KCB-economics.sh` shape. The fixture invokes `/lz-advisor.plan` against a Storybook 10.3.5 + Compodoc Class-2 fixture (representative of the 8-skill UAT chain that surfaced Findings H + B.1 + B.2) with `claude -p --output-format stream-json` and runs four `rg`-based assertions on the JSONL trace:

| # | Assertion | Closes |
|---|-----------|--------|
| 1 | Canonical XML form present AND no plain-bullet `## Pre-verified Claims` section | FIND-B.2 |
| 2 | pv-* synthesis count >= 1 (paired with Read/WebFetch invocation count for ratio reporting) | FIND-B.1 |
| 3 | No self-anchor `method=` values (9 forbidden patterns: prior knowledge, claimed knowledge, framework knowledge, training data, general knowledge, Nx/Storybook/Angular/TypeScript semantics) | FIND-H |
| 4 | No empty `<evidence>` blocks AND every `source=` resolves to a path or URL token | FIND-H |

The fixture follows project conventions:

- ASCII-only `[OK]`/`[ERROR]`/`[SUCCESS]` markers (CLAUDE.md cp1252 rule)
- Pipe filtering uses `rg`, never `grep` (CLAUDE.md deny rule)
- `set -eu` + scratch git repo + `trap … EXIT` cleanup pattern shared with KCB/DEF/HIA/J fixtures
- `printf` for fixture file creation (heredoc-free per CLAUDE.md)

`bash -n` syntax check passes. Behavioral validation is deferred to Plan 07-06 UAT replay per VALIDATION.md Tier 2 acceptance criteria.

**Commit:** `d365b5f test(07-01): add B-pv-validation.sh smoke fixture (FIND-B.1+B.2+H)`

## Verification

### Per-task verification

All 3 tasks pass their automated `<verify>` and `<acceptance_criteria>` blocks:

- **Task 1:** all 7 `git grep -c -F` checks return >=1 (Rule 5b heading + 5 sub-rule headings + 4 self-anchor exemplars); Rule 5a + Rule 6 preserved; awk line-order check confirms 5a < 5b < 6.
- **Task 2:** all 4 SKILL.md contain the literal "pv-* synthesis precondition." phrase; 3 cross-file diffs against plan SKILL.md baseline exit 0; ToolSearch + closing paragraphs preserved; insertion order ToolSearch < pv-synthesis < When-no-authoritative confirmed.
- **Task 3:** file exists; `bash -n` valid; 4 assertion labels present (counts: 4/3/3/4); self-anchor regex present; `claude --model sonnet ... stream-json` invocation present; no `| grep` violations; `[SUCCESS]` marker present.

### Plan-level verification

| Check | Result |
|-------|--------|
| Rule 5b lands in context-packaging.md (count >= 1) | 1 |
| 4-skill byte-identical `<context_trust_contract>` canon (3 cross-file diffs vs plan baseline) | 0 / 0 / 0 |
| B-pv-validation.sh exists + bash -n valid + 4 named assertions | yes / yes / 14 occurrences |
| Behavioral B-pv-validation.sh execution against plugin 0.10.0 | deferred to Plan 07-06 |

### Threat register closure

| Threat ID | Disposition | Status |
|-----------|-------------|--------|
| T-07-01-01 (Repudiation: pv-* synthesis layer) | mitigate | Closed at the synthesis layer: Rule 5b structurally rejects self-anchor evidence; 4-skill precondition prevents synthesis bypass; smoke fixture grep-asserts the rejection patterns. Combined upstream-prevention + downstream-detection closes Finding H. |
| T-07-01-02 (Tampering: ToolSearch availability rule routing) | mitigate | Closed: Rule 5b ToolSearch precondition + 4-skill supplement ensure synthesis cannot precede ranking. GAP-G1+G2-empirical structurally closed (behavioral confirmation in Plan 07-06). |
| T-07-01-03 (Tampering: Rule 5a fetched-content defense) | accept | Carry-forward unchanged; Rule 5b composes additively with 5a (`<fetched>` wrapping vs pv-* synthesis are orthogonal layers). |

## Deviations from Plan

None -- plan executed exactly as written. No Rule 1/2/3 auto-fixes triggered, no Rule 4 architectural questions raised, no authentication gates encountered.

## Known Stubs

None. All edits ship complete prose; no placeholder text, no TODO/FIXME markers introduced. (The phrase "not available" in modified SKILL.md files is part of the pre-existing legitimate ToolSearch availability rule prose: "If `ToolSearch` is not available in the session, proceed with ranking …", carried forward unchanged.)

## Followups

- **Plan 07-02:** verify-skip discipline + safety net (advisor refuse-or-flag rule + execute SKILL.md `<verify_before_commit>` block + review-skill scan criterion). Builds on Rule 5b synthesis mandate at the verify-before-commit layer.
- **Plan 07-03:** confidence-laundering guards (hedge propagation, cross-skill hedge tracking, version-qualifier anchoring, scope-disambiguated provenance markers). Reuses Rule 5b's pv-* primitive; adds context-packaging.md sections that compose with Rule 5b without contradicting it.
- **Plan 07-04:** word-budget enforcement (3 agent prompts + 3 new D-*-budget.sh fixtures). Independent from this plan; ships in any order after 07-01.
- **Plan 07-05:** reviewer web-tool design (Option 1+2 in tandem -- pre-emptive Class-2 scan + reviewer escalation hook). Cross-references Rule 5b synthesis mandate when the executor pre-empts Class-2 findings before reviewer consultation.
- **Plan 07-06:** smoke fixture suite + UAT replay + version bump 0.9.0 -> 0.10.0 + `07-VERIFICATION.md` + `06-VERIFICATION.md` amendment 6. Runs live `bash B-pv-validation.sh` against plugin 0.10.0; closes GAP-G1+G2-empirical empirically.

## Self-Check: PASSED

Verified all claims:

- File `plugins/lz-advisor/references/context-packaging.md` exists and contains "5b. pv-* synthesis discipline" (count: 1)
- File `plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md` exists and contains "pv-* synthesis precondition." (count: 1)
- File `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` exists and contains "pv-* synthesis precondition." (count: 1)
- File `plugins/lz-advisor/skills/lz-advisor.review/SKILL.md` exists and contains "pv-* synthesis precondition." (count: 1)
- File `plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md` exists and contains "pv-* synthesis precondition." (count: 1)
- File `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/B-pv-validation.sh` exists and `bash -n` validates
- Commit `79d2273` exists in `git log` (Task 1)
- Commit `e9f4166` exists in `git log` (Task 2)
- Commit `d365b5f` exists in `git log` (Task 3)
