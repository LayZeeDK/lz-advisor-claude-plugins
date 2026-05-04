---
phase: 07-address-all-phase-5-x-and-6-uat-findings
plan: 10
status: complete
gap_closure: true
requirements: [FIND-D]
closes_residual: residual-advisor-budget
dated: 2026-05-04
subsystem: lz-advisor advisor agent prompt + smoke fixture
tags: [word-budget, advisor, output-constraint, smoke-fixture, gap-closure, fragment-grammar]
requires:
  - plans: [07-04, 07-09]
  - files:
      - plugins/lz-advisor/agents/advisor.md
      - .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-advisor-budget.sh
provides:
  - Advisor fragment-grammar emit template (single-block 100w numbered-list adaptation of Plan 07-09 reviewer + security-reviewer reference impl)
  - Advisor smoke-fixture parser fragment-grammar shape detection (per-item <=15w target with <=22w Assuming-frame outlier soft cap; backward-compat legacy whole-body fallback)
  - residual-advisor-budget structurally CLOSED (closes the only remaining FIND-D residual after Plan 07-09 closed reviewer + security-reviewer side)
affects:
  - lz-advisor.plan skill behavior (advisor agent output shape on plan-time consultation)
  - lz-advisor.execute skill behavior (advisor agent output shape on stuck / final-check consultation)
  - D-advisor-budget.sh smoke fixture parser
  - All 3 agents' Output Constraint sections now use fragment-grammar emit template (advisor 100w / reviewer 300w / security-reviewer 300w; technique transfers across word-budget tiers)
tech-stack:
  added: []
  patterns:
    - "Fragment-grammar emit template adapted to advisor's single-block 100w shape (Plan 07-09 reference adapted from three-section 300w to single-block 100w)"
    - "Positive-framed DROP/KEEP-list output constraint per Anthropic Best Practices `Tell Claude what to do, not what not to do`"
    - "Node ESM per-item word-count parser with 3-way exit-code dispatch (0 PASS / 1 FAIL / 2 LEGACY-FALLBACK)"
    - "Backward-compat legacy whole-body word-count fallback for transitional Plan 07-04 prose shape"
    - "ASSUMING_FRAME_RE outlier soft-cap branch (verbatim phrase preservation; <=22w accepted on frame items vs <=15w target / <=18w soft outlier on non-frame items)"
key-files:
  created:
    - .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-10-SUMMARY.md
  modified:
    - plugins/lz-advisor/agents/advisor.md
    - .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-advisor-budget.sh
decisions:
  - "Replace Plan 07-04 descriptive soft-cap density paragraph in advisor.md with fragment-grammar emit template (Candidate A): empirically validated by Plan 07-09 closure (reviewer 197w / security-reviewer 285w on plugin 0.12.0); LOW-MEDIUM complexity; LOW-MEDIUM residual risk"
  - "PRESERVE advisor frontmatter `effort: high` UNCHANGED (Candidate B effort de-escalation REJECTED): advisor strategic-reasoning role profile differs from reviewer/security-reviewer synthesis-of-packaged-findings role per CONTEXT.md D-04; D-04 amendment 2026-05-02 binding reversion criterion does not apply to advisor"
  - "PRESERVE D-03 phrasing-style (Candidate C ALL-CAPS hard-rules imperative REJECTED): conflicts with D-03 reservation of ALL-CAPS for safety-critical only; carries Anthropic-documented 3% intelligence cost per April 23, 2026 postmortem; advisor is the most intelligence-sensitive of the 3 agents"
  - "PRESERVE existing 2 ### Density example blocks byte-identically: they ALREADY conform to the fragment-grammar shape; they are the empirical anchor of the technique (Phase 5.5 D-04 worked-example pattern transfers verbatim)"
  - "PRESERVE Assuming-frame contract + Hedge Marker Discipline + Critical-block uncounted rule byte-identically: load-bearing for Plan 07-02 grep routing across all 3 agents; fragment-grammar applies ONLY to the numbered Strategic Direction list, not to upstream/downstream contracts"
  - "Plugin version NOT bumped here; deferred to Plan 07-11 closing plan (paired bundle) for atomic 0.12.0 -> 0.12.1 across 5 surfaces with the Rule 5b D2 amendment"
  - "Smoke fixture parser ASSUMING_FRAME_RE accepts trailing `\\b` word boundary instead of literal `\\.` because ADVISOR_FRAGMENT_RE consumes the line-final period when capturing the body (Rule 1 auto-fix during synthetic Test 10 validation)"
metrics:
  duration: ~25 minutes
  tasks_completed: 3
  files_modified: 2
  files_created: 1
  commits: 2
  completed: 2026-05-04
---

# Phase 07 Plan 10: Gap closure for FIND-D advisor word-budget regression Summary

Closes `residual-advisor-budget` (advisor agent at 118w / 100w cap = 18% over on plugin 0.12.0 S1 plan session per `07-VERIFICATION.md` `empirical_subverification_2026_05_03` block lines 80, 94 + `07-HUMAN-UAT.md` lines 78-83) by extending Plan 07-09's empirically-validated fragment-grammar emit template (Candidate A) to `agents/advisor.md` while preserving `effort: high` (Candidate B explicitly rejected) and D-03 phrasing-style (Candidate C explicitly rejected). Plan 07-04's descriptive-prose-only approach for the advisor was empirically insufficient on plugin 0.12.0; the cost-benefit per CONTEXT.md "Hard-rules layer for word-budget -- deferred unless 0.10.0 cycle confirms hybrid is insufficient" condition has now been met empirically for advisor too. The recommendation is NOT a hard-rules layer (Candidate C rejected) but a structural emit template that works WITH the model's training rather than against it (Candidate A; Plan 07-09 empirical proof transfers).

## Objective

Plan 07-09 explicitly excluded the advisor as the control case for descriptive-prose-only at `effort: high`; the full 6-session UAT chain on plugin 0.12.0 (executed 2026-05-03) invalidated that working hypothesis -- descriptive prose at any effort level produces overshoot, not bind, on Sonnet 4.6 / Opus 4.7. Plan 07-10 differs structurally from Plan 07-09 in three ways:

1. Single agent (`advisor.md`) vs two (`reviewer.md` + `security-reviewer.md`)
2. Single-block output shape (one numbered Strategic Direction list) vs `### Findings` + `### Cross-Cutting Patterns` + `### Missed surfaces` three-section structure
3. Tighter 100w aggregate cap vs 300w aggregate cap

The per-item shape is `<verb-led action>. <concrete object or path>. <one-clause rationale or Assuming-frame if needed>.` -- NOT the reviewer's `<file>:<line>: <severity>:` line-shape. The Assuming-frame contract (load-bearing for Plan 07-02 verify-skip discipline grep routing across all 3 agents) is preserved verbatim; Assuming-frame items are inherently longer (~18-22w) due to verbatim phrase preservation, so the per-item 15w target accepts <=22w outliers when the Assuming-frame is used.

Empirical anchor for the technique: Plan 07-09 reduced reviewer 396w / 32% over to 197w / 34% under-cap (`07-VERIFICATION.md` line 82) and security-reviewer 414w / 38% over to 285w / 5% under-cap (`07-VERIFICATION.md` line 83) on plugin 0.12.0 via fragment-grammar emit template + DROP/KEEP lists + worked examples + `effort: medium`. The advisor's milder 18% overshoot at `effort: high` is structurally identical regression; same technique without effort change should bind to ~85w (Plan 07-09's reduction delta applied to the advisor's tighter cap).

## What Landed

### `plugins/lz-advisor/agents/advisor.md` (commit `a11834d`)

The `## Output Constraint` section's existing soft-cap density paragraph (line 60 in pre-edit file) is REPLACED with the fragment-grammar emit template + DROP/KEEP lists + aggregate-cap reinforcement. Concretely:

- **Format declaration**: `each numbered item is \`<verb-led action>. <concrete object or path>. <one-clause rationale or Assuming-frame if needed>.\``
- **Per-item word target**: <=15 words for the body (excludes leading "1.", "2.", etc.); items using the literal `Assuming X (unverified), do Y. Verify X before acting.` frame accepted up to 22 words (verbatim phrase preservation; load-bearing for Plan 07-02 Hedge Marker Discipline grep contract)
- **DROP list (7 entries)**: `I'd recommend...`, `You might consider...`, `It would be good to...`, `Sure! Here's my advice...`, restating executor's findings, hedging adjectives (perhaps/maybe/likely/probably; replace with Assuming-frame), articles where omission preserves meaning, filler (just/really/basically/actually/simply), explanatory adjectives without actionable signal change
- **KEEP list (5 entries)**: verb-led action (Add/Remove/Replace/Run/Verify/Inline/Drop/Configure), exact file paths and config-key names in backticks, exact command invocations in backticks, full Assuming-frame on items depending on unpackaged context, full `Unresolved hedge: <text>. Verify <action> before/after committing.` frame on items surfacing upstream verify-first markers
- **Aggregate cap reinforcement**: <=100w across numbered items combined; `**Critical:**` block uncounted; cross-references `D-advisor-budget.sh` smoke fixture and Plan 07-10 rationale + Plan 07-09 empirical anchor

PRESERVED byte-identically:

- 100w descriptive prose lead paragraph (lines 53-56 pre-edit; "Respond in under 100 words. Use enumerated steps...")
- Assuming-frame contract paragraph (line 58 pre-edit; "When your advice depends on context the executor did not package...")
- Both `### Density example` blocks (full-context Compodoc + Storybook + Nx scenario lines 62-68; thin-context Express + Node + Redis scenario lines 70-76)
- All sections after `## Output Constraint`: Visibility Model, Context Trust Contract, Verification Process, Consultation Awareness, Response Structure (including Out-of-scope observations sub-section with Critical-block rule), Edge Cases (with worked substitutions + forbidden-paraphrase list), Hedge Marker Discipline (Plan 07-02 contract), Boundaries
- Frontmatter: `effort: high` UNCHANGED; `tools: ["Read", "Glob"]` UNCHANGED; `maxTurns: 3` UNCHANGED

### `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-advisor-budget.sh` (commit `cd4e49b`)

Parser updated to recognize the new fragment-grammar shape via per-item regex + Node ESM extractor. Concretely:

- **`ADVISOR_FRAGMENT_RE` per-item regex**: `/^\d+\.\s+(.+?)\.\s*$/gm` extracts numbered-item bodies (without leading "N." or trailing period); multiline flag for line-by-line scanning
- **`ASSUMING_FRAME_RE` outlier branch**: `/Assuming\s+.+?\s+\(unverified\),\s+do\s+.+?\.\s+Verify\s+.+?\s+before\s+acting\b/` -- frame detection accepts both with/without trailing period since `ADVISOR_FRAGMENT_RE` consumes the line-final period when capturing the body
- **Per-item word counts**: target <=15w; non-frame items error at >18w; frame items accepted up to 22w (INFO outlier between 18-22w; ERROR at >22w)
- **Node ESM check-script** returns 3-way exit code: `0` PASS (fragment-grammar detected, all items within target); `1` FAIL (per-item over-cap); `2` LEGACY-FALLBACK (fragment-grammar NOT detected; legacy prose shape)
- **Bash case dispatch** handles all 3 paths with explicit `[OK]` / `[ERROR]` / `[INFO]` / `[WARN]` log lines per Plan 07-09 D-reviewer-budget.sh pattern
- **Aggregate <=100w assertion** PRESERVED via `$LEGACY_WC=$(wc -w < "$SD_BODY")` (load-bearing gate that closes the gap; runs in BOTH fragment-grammar and legacy paths)
- **`**Critical:**` block strip** PRESERVED via existing `sed '/^\*\*Critical:\*\*/,$d'` pipeline; now writes to `$SD_BODY` shared by per-item and aggregate checks
- Pattern mirrors Plan 07-09 D-reviewer-budget.sh `check-entries.mjs` Node ESM extractor (commit `5787a3c`)

### `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-10-SUMMARY.md` (this file)

Documents the closure with citations to load-bearing inputs and the empirical anchor.

## Why

Per `07-RESEARCH-GAPS.md` Section "Gap 1 ranked recommendation":

- **Rank 1: Candidate A (RECOMMENDED) chosen** -- adapt fragment-grammar emit template to advisor's single-block numbered-list 100w shape. Reuse existing 2 Density example blocks verbatim. Add explicit DROP list (concrete phrases-to-omit) + KEEP list (concrete content-to-preserve) following Anthropic Best Practices `Tell Claude what to do, not what not to do` positive-framing principle. Per-item word target <=15w; aggregate cap stays <=100w; `**Critical:**` block remains uncounted. Empirical anchor: Plan 07-09 reviewer 197w + security-reviewer 285w on plugin 0.12.0 (`07-VERIFICATION.md` lines 82-83). LOW-MEDIUM complexity; LOW-MEDIUM residual risk.

- **Rank 2: Candidate B (effort de-escalation `high` -> `medium` for advisor) REJECTED** -- advisor's strategic-reasoning role profile (judging tradeoffs, recognizing framework + runtime + auth-model + transport constraints, committing to one direction) differs from reviewer/security-reviewer synthesis-of-packaged-findings role (per CONTEXT.md D-04 + Plan 07-05). Anthropic Best Practices: "If you observe shallow reasoning on complex problems, raise effort to high or xhigh rather than prompting around it." Save the lever; defer to Phase 8 if Candidate A alone is insufficient on plugin 0.12.1 UAT replay. The D-04 amendment 2026-05-02 binding reversion criterion (15% Class-1 recall drop) does NOT apply to advisor since advisor was not de-escalated.

- **Rank 3: Candidate C (ALL-CAPS hard-rules imperative `CRITICAL: TOTAL RESPONSE <=100 WORDS. NON-NEGOTIABLE.`) REJECTED** -- conflicts with D-03 phrasing-style (ALL-CAPS reserved for safety-critical only); carries Anthropic-documented 3% intelligence cost per April 23, 2026 postmortem; advisor is the most intelligence-sensitive of the 3 agents.

## Acceptance Verification

All 13 grep tests from Task 1 + 11 grep/integration tests from Task 2 passed:

**Task 1 (advisor.md):**
- `git grep -F 'Format: each numbered item is'` returns 1 match
- `git grep -F 'Per-item word target: <=15 words'` returns 1 match
- `git grep -F '### Density example (full-context, 95-100 words)'` returns 1 match (preserved)
- `git grep -F '### Density example (thin-context, 95-100 words)'` returns 1 match (preserved)
- `head -50 plugins/lz-advisor/agents/advisor.md | rg '^effort: high$'` returns the line (frontmatter preserved)
- `git grep -c -F '## Hedge Marker Discipline'` returns exactly 1 (Plan 07-02 contract preserved)
- `git grep -F 'Unresolved hedge:'` returns 4 matches (frame phrase preserved + new KEEP-list entry)
- `git grep -F 'D-advisor-budget.sh'` returns >=1 match (smoke fixture cross-reference)
- `git grep -F 'See Plan 07-10'` returns >=1 match (rationale anchor)
- `git grep -F "I'd recommend..."` returns 1 match (DROP list anchor)
- `git grep -F 'Verb-led action (Add, Remove, Replace'` returns 1 match (KEEP list anchor)
- `git grep -F 'Assuming X (unverified), do Y. Verify X before acting.'` returns 5 matches (existing Output Constraint mention + Edge Cases worked-substitution mention + new KEEP-list entry + new Per-item-target paragraph mention + Hedge Marker Discipline cross-reference)
- `git diff plugins/lz-advisor/agents/advisor.md | rg -c '^\+.*wip:'` returns 0 (no wip refs introduced)
- `git diff plugins/lz-advisor/agents/advisor.md | rg -c '^\+.*(CRITICAL: TOTAL RESPONSE|NON-NEGOTIABLE|MUST NOT EXCEED)'` returns 0 (Candidate C NOT applied)

**Task 2 (D-advisor-budget.sh):**
- `bash -n` exits 0 (no syntax errors)
- `git grep -F 'ADVISOR_FRAGMENT_RE'` returns 3 matches (declaration + comment + matchAll usage)
- `git grep -F 'ASSUMING_FRAME_RE'` returns 2 matches (declaration + .test usage)
- `git grep -F '"$WC" -le 100'` returns 1 match (aggregate gate preserved verbatim from original fixture)
- `git grep -F '/^\*\*Critical:\*\*/,$d'` returns 1 match (Critical-block strip preserved)
- `git grep -F 'LEGACY_WC'` returns 2 matches (declaration + WC assignment)
- `git diff` shows 0 wip-line additions
- ASCII byte check: zero non-ASCII bytes
- Synthetic-input integration tests:
  - PASS path: 5 fragment-grammar items (3 plain <=15w, 2 Assuming-frame <=22w); aggregate 90w (per-item) / 95w (whole-body); exit 0
  - FAIL path: frame >22w errors with explicit message; exit 1
  - FALLBACK path: prose-only body; exit 2 with `[WARN] Fragment-grammar shape NOT detected`
  - Density example block from advisor.md (canonical input): 5 items pass; aggregate 90w / 95w whole-body <=100w

## Plugin Version

Plugin version is explicitly NOT bumped in this plan. Deferred to Plan 07-11 (the paired bundle's closing plan; Plan 07-11 owns the 0.12.0 -> 0.12.1 patch bump across 5 surfaces atomically with the Rule 5b D2 amendment for FIND-B.2 format gap closure).

## What This Enables Next

- Empirical re-run of `D-advisor-budget.sh` on plugin 0.12.1 (after Plan 07-11 lands the version bump) for closure validation -- expected aggregate ~85w (per Plan 07-09 reduction delta applied to advisor's 100w cap; reviewer reduced from 396w to 197w = 50% reduction; advisor 118w * 0.50 = 59w lower bound, 118w * 0.72 = 85w upper bound)
- Optional canonical S1 plan-session re-run on the Compodoc + Storybook + Angular signals scenario per memory `project_compodoc_uat_initial_plan_prompt.md`
- All 3 agents (advisor + reviewer + security-reviewer) now share the fragment-grammar emit template pattern (advisor 100w / reviewer 300w / security-reviewer 300w); future word-budget tier additions can use the same technique

## Out of Scope

Per user directive 2026-05-03 + research deliverable `07-RESEARCH-GAPS.md`:

- **effort de-escalation for advisor**: Phase 8 fallback if Candidate A alone insufficient on 0.12.1 (Phase 8 candidate per `project_phase_8_candidates_post_07.md`)
- **Class-1 recall vs xhigh baseline A/B study**: Phase 8 (advisor's mild 18% overshoot does not warrant the cost of a structured baseline study at this stage)
- **wip-discipline reversal**: Phase 8; user feedback `feedback_no_wip_commits.md` 2026-05-03 -- this plan introduces zero new wip: references
- **P8-03 Pre-Verified Contradiction Rule, P8-12 Cross-Skill Hedge Tracking auto-detect, P8-18 advisor narrative-SD self-anchor leak**: Phase 8 candidates
- **Severity-rename drift WR-01/WR-02/WR-03**: Phase 8

## Cross-References

- `07-RESEARCH-GAPS.md` Section "Gap 1: Advisor word budget" lines 132-260 (load-bearing research input; Candidate A specification + Candidate B/C rejection rationale + worked-example template + per-item word target suggestion)
- `07-VERIFICATION.md` `empirical_subverification_2026_05_03` block lines 80, 94 (empirical evidence: 118w / 18% over)
- `07-HUMAN-UAT.md` lines 78-83 (residual block: residual-advisor-budget)
- `07-09-PLAN.md` + `07-09-SUMMARY.md` (reference-pattern source; the technique this plan adapts to single-block 100w shape)
- `07-04-PLAN.md` (descriptive-prose-only baseline being superseded for advisor specifically)
- `07-CONTEXT.md` D-04 amendment 2026-05-02 binding reversion criterion (preserved; does not apply to advisor since advisor was not de-escalated)
- Anthropic Best Practices: Calibrating effort and thinking depth + Use XML tags + Use examples effectively + Tell Claude what to do not what not to do (positive-framing principle)
- Memory `project_compodoc_uat_initial_plan_prompt.md` (canonical S1 plan-session prompt for empirical re-validation on 0.12.1)
- Memory `feedback_no_wip_commits.md` 2026-05-03 (no wip: refs introduced; verified by `git diff | rg '^\+.*wip:'` returning 0)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed ASSUMING_FRAME_RE trailing-period mismatch in D-advisor-budget.sh**

- **Found during:** Task 2 synthetic Test 10 validation
- **Issue:** The plan's specified ASSUMING_FRAME_RE `/Assuming\s+.+?\s+\(unverified\),\s+do\s+.+?\.\s+Verify\s+.+?\s+before\s+acting\./` requires a trailing literal `\.` for `before acting.`. However, ADVISOR_FRAGMENT_RE `/^\d+\.\s+(.+?)\.\s*$/gm` consumes the line-final period when capturing the body via the trailing `\.\s*$` anchor. The captured `itemBody` therefore lacks the trailing period of `before acting.`, and ASSUMING_FRAME_RE fails to match every Assuming-frame item, misclassifying them as non-frame items and failing the <=18w cap at 19+ words.
- **Fix:** Replaced the trailing literal `\.` with `\b` word boundary in ASSUMING_FRAME_RE so frame detection accepts both forms (with or without the trailing period). Added an explanatory comment above the regex documenting why the boundary differs from the spec. Plan 07-09 D-reviewer-budget.sh does not have this issue because the reviewer fragment shape is `<file>:<line>: <severity>: <fix>.` where the captured `<fix>` clause has internal periods that the frame regex does not depend on.
- **Files modified:** `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-advisor-budget.sh` (same commit; parser self-consistent)
- **Commit:** `cd4e49b`
- **Validated by:** Synthetic Test 10 (frame outlier ~22w INFO accepted) + Test 10b (frame >22w ERROR as expected) + Test 10c (canonical Density example block from advisor.md: 5 items, aggregate 90w / 95w whole-body, all classifications correct)

### Acceptance-Criterion Phrasing Discrepancies (no code change required)

**1. Plan verify literal `WC -le 100` vs actual code `"$WC" -le 100`**

- **Found during:** Task 2 verification block
- **Issue:** Plan line 498 verify literal `git grep -F 'WC -le 100' ...` returns no matches because the actual aggregate-cap gate is `if [ "$WC" -le 100 ]; then` (with quoted variable). The original (pre-edit) fixture had this same form; preserving it verbatim is required by the plan's "PRESERVE aggregate <=100w assertion verbatim" directive.
- **Fix:** No code change. The aggregate-cap gate is preserved verbatim as required. The verify literal in the plan elided the closing quote of `"$WC"`. Documenting as observation only.
- **Validated by:** `git grep -F '"$WC" -le 100' ...` returns 1 match (verbatim preservation confirmed)

### Worktree Setup Note

Initial worktree HEAD was `99741b0` (older base; 20 commits behind expected base `9a57e1b`). Per worktree_branch_check guidance, `git reset --hard 9a57e1ba637efce3b22831c87cc3473bddb36f5d` reset to the correct base. Working tree was clean post-reset; no orchestrator-owned files (STATE.md / ROADMAP.md / 07-UAT.md begin-phase markers) were staged.

## Threat Model Compliance

Per Plan 07-10 `<threat_model>` section, 6 STRIDE threats with `mitigate` (5) + `accept` (1) dispositions:

| Threat ID | Mitigation Surface | Status |
|-----------|---------------------|--------|
| T-07-10-01 (Tampering: advisor.md Output Constraint surgical-edit boundaries) | Lines 53-56 + 58 + 62-76 PRESERVED byte-identically; only line 60 REPLACED; 13 grep acceptance tests verify no unintended changes elsewhere | LANDED |
| T-07-10-02 (Information Disclosure: D-advisor-budget.sh parser scope) | Parser reads only the SD body extracted from local JSONL trace; no external network calls; Local file IO + Node ESM stdlib only | ACCEPTED |
| T-07-10-03 (DoS via `claude -p` invocation) | Existing fixture pattern; `--dangerously-skip-permissions` flag is documented Phase 5.4 + 5.6 + 6 + 7 fixture pattern; no new attack surface | ACCEPTED |
| T-07-10-04 (Elevation of Privilege: advisor agent tool grant) | Frontmatter `tools: ["Read", "Glob"]` UNCHANGED; principle of least privilege preserved (OWASP AI Agent Security Cheat Sheet); Task 1 explicitly preserved frontmatter byte-identically | LANDED |
| T-07-10-05 (Spoofing: Plan 07-04 -> Plan 07-10 reference cross-link) | New prose explicitly cites `07-VERIFICATION.md empirical_subverification_2026_05_03` AND `Plan 07-10` as the rewrite-rationale anchor; downstream readers can grep `D-advisor-budget.sh` smoke fixture to verify the technique empirically | LANDED |
| T-07-10-06 (Repudiation: smoke-fixture exit codes) | Node ESM script returns 3-way exit code (0/1/2); bash dispatch logs explicit `[OK]` / `[ERROR]` / `[INFO]` / `[WARN]` messages per Plan 07-09 D-reviewer-budget.sh pattern; full trace + tail-100 dump on failure | LANDED |

No new tool grants. No new attack surface. Assuming-frame contract + Hedge Marker Discipline + Critical-block uncounted rule preserved byte-identically.

## Self-Check: PASSED

All 3 modified/created files exist and contain expected content; both commits exist in git log:

Commits:
- `a11834d`: feat(07-10): rewrite advisor.md Output Constraint with fragment-grammar emit template
- `cd4e49b`: feat(07-10): update D-advisor-budget.sh parser for fragment-grammar shape

Files:
- `plugins/lz-advisor/agents/advisor.md`: FOUND (fragment-grammar template + DROP/KEEP lists + Density examples preserved + effort: high preserved)
- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-advisor-budget.sh`: FOUND (ADVISOR_FRAGMENT_RE + ASSUMING_FRAME_RE + 3-way exit code + bash dispatch + LEGACY_WC fallback + Critical-block strip preserved; bash -n passes)
- `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-10-SUMMARY.md`: FOUND (this file)

Negative checks:
- Zero `wip:` references introduced anywhere in this plan's diff (`git diff plugins/lz-advisor/agents/advisor.md .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-advisor-budget.sh | rg -c '^\+.*wip:'` returns 0)
- Zero ALL-CAPS hard-rule imperatives introduced (Candidate C NOT applied; D-03 phrasing-style preserved)
- Frontmatter `effort: high` preserved (Candidate B NOT applied)
- Plugin version NOT bumped here (deferred to Plan 07-11)
