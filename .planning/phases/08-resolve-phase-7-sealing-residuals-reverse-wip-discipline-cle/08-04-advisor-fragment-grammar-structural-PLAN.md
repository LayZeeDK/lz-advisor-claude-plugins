---
phase: 08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle
plan: 04
type: execute
wave: 3
depends_on: [03]
conditional: true
conditional_on: "Plan 3 (or Plan 3.5) gate decision = FAIL per D-02 compound OR-gate; disposition rule picks fix surface"
files_modified:
  - plugins/lz-advisor/agents/advisor.md
  - plugins/lz-advisor/.claude-plugin/plugin.json
  - plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md
  - plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md
  - plugins/lz-advisor/skills/lz-advisor.review/SKILL.md
  - plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md
autonomous: true
requirements: [RES-ADVISOR-FRAGMENT-GRAMMAR]
requirements_addressed: [RES-ADVISOR-FRAGMENT-GRAMMAR]
target_version: 0.14.1
tags: [conditional, structural, advisor-prompt, version-bump, disposition-rule]

must_haves:
  truths:
    - "Plan 4 ships ONLY if Plan 3 (or Plan 3.5) gate decision is FAIL per D-02 compound OR-gate"
    - "Disposition rule applied mechanically (D1 alone -> fragment-grammar template extension; D2 alone -> density example audit; both -> both atomically; neither -> Plan 4 does NOT ship)"
    - "Escalation path: per-section <output_constraints> XML extension to advisor.md IF measurement reveals fragment-grammar structurally can't bind on code blocks"
    - "advisor.md fragment-grammar emit template canon (Plan 07-10) preserved unless escalation triggers"
    - "Atomic 5-surface version bump per D-04 hard constraint"
    - "Post-fix re-run of D-advisor-budget.sh on the same 3 (or 5) scenarios verifies gate now PASSES"
  artifacts:
    - path: "plugins/lz-advisor/agents/advisor.md"
      provides: "Fragment-grammar template extended for code-block binding (D1) AND/OR density example audited (D2) AND/OR escalated to per-section XML"
      contains: "code-block | density | output_constraints (per disposition)"
  key_links:
    - from: "Plan 3 (or 3.5) gate FAIL verdict"
      to: "Plan 4 disposition (D1 / D2 / both / escalation)"
      via: "08-MEASUREMENT.md disposition field"
      pattern: "Disposition:.*(fragment-grammar|density|both|escalation)"
---

<objective>
**CONDITIONAL PLAN.** Ships ONLY if Plan 3 (or Plan 3.5) emits `gate decision = FAIL` per D-02 compound OR-gate. Otherwise, this plan does NOT ship (P2 residual closes structurally with 08-MEASUREMENT.md as audit record).

Disposition rule (D-02) selects fix surface based on which disjunct fired:
- **D1 alone fires (code-block disjunct):** Plan 4 = fragment-grammar template extension to `agents/advisor.md` to bind on code-block items. Mirrors Plan 07-10 fragment-grammar canon; PATCH-tier refinement.
- **D2 alone fires (aggregate disjunct):** Plan 4 = density example audit in `agents/advisor.md` Output Constraint section (Plan 05.5-03 commit 84aaa5b density example as suspected drift surface). PATCH-tier refinement.
- **Both fire:** Plan 4 ships BOTH fixes atomically in one commit. PATCH-tier (still localized prose edits).
- **Neither fires:** Plan 4 does NOT ship.
- **Structural escalation:** If Plan 3 measurement reveals fragment-grammar template structurally cannot bind on code blocks (operationalized per RESEARCH Open Question 3 as 3/3 runs >=1 code-block item over per-item cap AND code-block items >=50% of over-cap items), Plan 4 escalates from fragment-grammar template extension (PATCH) to per-section `<output_constraints>` XML extension (MINOR; contract-shape change mirroring Plan 07-14 reviewer/security-reviewer canon).

Atomic 5-surface version sync per D-04: a coherent version trail is required. Default: 0.14.0 -> 0.14.1 PATCH. If escalation triggers (per-section XML extension to advisor.md is contract-shape change): 0.14.0 -> 0.15.0 MINOR.

Purpose: Mechanically derive the structural fix from gate evidence; eliminate planner judgment-call ambiguity for fix-surface attribution.

Output: 1 modified advisor.md (D1, D2, both, or escalation per disposition) + atomic 5-surface version bump.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-CONTEXT.md
@.planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-RESEARCH.md
@.planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-MEASUREMENT.md
@.planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-03-SUMMARY.md
@.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-10-SUMMARY.md
@.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-14-SUMMARY.md

<interfaces>
<!-- Advisor.md current Output Constraint structure (lines 51-100 per RESEARCH) -->

Plan 07-10 fragment-grammar canon (line 60 Format line + Plan 05.5-03 Density examples at lines 86-100). These are the surfaces Plan 4 may modify per disposition.

D1 disposition target (line 60 Format extension):
Current:
```
Format: each numbered item is `<verb-led action>. <concrete object or path>. <one-clause rationale or Assuming-frame if needed>.`
```

Proposed D1 extension:
```
Format: each numbered item is `<verb-led action>. <concrete object or path>. <one-clause rationale or Assuming-frame if needed>.` When the action involves a code-block (configuration block, function signature, or multi-line snippet), keep the code-block inline-wrapped in single backticks; do NOT expand the code-block across multiple lines. The 15-word per-item budget applies to the entire item including the inline-wrapped code-block; if the code-block alone exceeds 12 words, abstract it: replace the literal block with the symbolic name + a verify-step on a follow-up item.
```

D2 disposition target (lines 86-100 Density examples audit):
Read advisor.md lines 86-92 (Density example, full-context) and 94-100 (Density example, thin-context). Audit each density example item for inline-code patterns inflating word counts; ensure each is <=15w including inline backtick-wrapped configuration. If currently >15w, abstract or split.

Escalation target (lines 51-100 ## Output Constraint section replaced):
Plan 07-14 per-section `<output_constraints>` XML pattern in security-reviewer.md lines 165-192. Adapted for advisor.md single-section nature: the Strategic Direction block becomes the constraint surface with per-item caps + per-section section-cap.
</interfaces>
</context>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| None | Doc-only changes to agent prompt template + version-bump artifact |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-8-04-01 | N/A | advisor.md template change | accept | No new attack surface -- agent prompt template change; no code or data flow. Same threat model as Plan 07-10 (fragment-grammar template) and Plan 07-14 (per-section XML), both shipped without security incidents. |
</threat_model>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Read Plan 3 gate verdict + disposition; abort if not FAIL</name>
  <files>(read-only check; no file edits in this task)</files>
  <read_first>
    - .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-MEASUREMENT.md (verify Compound: FAIL or Compound: INCONCLUSIVE escalated via Plan 3.5 to FAIL)
    - .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-03-SUMMARY.md (Plan 3 disposition decision)
    - .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-03.5-SUMMARY.md (Plan 3.5 final disposition if applicable)
  </read_first>
  <action>
    Read `08-MEASUREMENT.md` Gate decision section. Confirm:
    - `Compound: FAIL` (or `Compound: INCONCLUSIVE` with Plan 3.6 recommended but actually escalated -- check carefully)
    - `Disposition:` is one of: `fragment-grammar template extension`, `density example audit`, `both atomic`, `escalation to <output_constraints> XML`

    If Compound is PASS: abort Plan 4. P2 residual closes structurally per D-02 "neither fires" branch. Print: "Plan 4 not applicable -- compound gate PASS at n=3 (or n=5)."

    If Compound is INCONCLUSIVE and Plan 3.5 also INCONCLUSIVE -> Plan 4 ALSO does not ship; soft-fail signal Plan 3.6 should be pursued in Phase 9. Print: "Plan 4 not applicable -- compound gate INCONCLUSIVE at n=5; Plan 3.6 deferred to Phase 9."

    If Compound is FAIL: proceed to Task 2 with the recorded disposition.
  </action>
  <verify>
    <automated>rg -qE "Compound:.*FAIL|Disposition:.*(fragment-grammar|density|both|escalation)" .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-MEASUREMENT.md</automated>
  </verify>
  <acceptance_criteria>
    - 08-MEASUREMENT.md compound verdict is FAIL (or plan aborts cleanly with no edits)
    - Disposition is one of the 4 mechanically-derived options (D1 / D2 / both / escalation)
  </acceptance_criteria>
  <done>
    Gate state confirmed FAIL with disposition; proceed; or abort cleanly.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Apply disposition-selected fix to plugins/lz-advisor/agents/advisor.md</name>
  <files>plugins/lz-advisor/agents/advisor.md</files>
  <read_first>
    - plugins/lz-advisor/agents/advisor.md (current 248-line content; focus lines 51-100 ## Output Constraint section, especially line 60 Format line + lines 86-100 Density examples)
    - plugins/lz-advisor/agents/security-reviewer.md (lines 165-192 per-section <output_constraints> XML; reference for escalation path)
    - plugins/lz-advisor/agents/reviewer.md (corresponding <output_constraints> block; reference for escalation path)
    - .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-10-SUMMARY.md (fragment-grammar emit template canon)
    - .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-14-SUMMARY.md (per-section XML canon)
    - .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-MEASUREMENT.md (the recorded disposition)
    - .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-RESEARCH.md (Plan 4 Code Examples + Architecture Pattern 4 fragment-grammar template canon)
  </read_first>
  <action>
    Apply the fix mechanically per the recorded disposition. Branch logic:

    **Branch A: Disposition = "fragment-grammar template extension" (D1 alone fires)**

    Edit advisor.md line 60 (Format line). Current:
    ```
    Format: each numbered item is `<verb-led action>. <concrete object or path>. <one-clause rationale or Assuming-frame if needed>.`
    ```

    New (append the code-block binding clause):
    ```
    Format: each numbered item is `<verb-led action>. <concrete object or path>. <one-clause rationale or Assuming-frame if needed>.` When the action involves a code-block (configuration block, function signature, or multi-line snippet), keep the code-block inline-wrapped in single backticks; do NOT expand the code-block across multiple lines. The 15-word per-item budget applies to the entire item including the inline-wrapped code-block; if the code-block alone exceeds 12 words, abstract it: replace the literal block with the symbolic name + a verify-step on a follow-up item.
    ```

    Preserve the rest of `## Output Constraint` section verbatim.

    **Branch B: Disposition = "density example audit" (D2 alone fires)**

    Read advisor.md lines 86-100 (both Density examples: full-context and thin-context). For each example item:
    - Count words including any inline `` `code` `` backtick-wrapped content
    - If item exceeds 15w (fragment) or 22w (Assuming-frame), either:
      - Abstract: replace literal code with symbolic name + verify-step on follow-up item
      - Split: break into 2 items each under cap

    Document each edited item in the SUMMARY with before/after word counts.

    **Branch C: Disposition = "both atomic" (D1 + D2 both fire)**

    Apply Branch A edit (line 60 Format extension) AND Branch B edits (density example audit). Single commit.

    **Branch D: Disposition = "escalation to <output_constraints> XML"**

    Replace advisor.md `## Output Constraint` section (lines 51-100) with per-section XML mirroring `agents/security-reviewer.md` lines 165-192 (adapted for advisor's single-section nature):

    ```xml
    <output_constraints>
      <strategic_direction>
        <per_item_cap>15 words for fragment items; 22 words for Assuming-frame items</per_item_cap>
        <section_cap>100 words total across all numbered items</section_cap>
        <forbidden>
          <pattern>multi-line code blocks expanded across newlines</pattern>
          <pattern>aggregate paragraphs longer than the per-item cap</pattern>
          <pattern>preamble narration before numbered items</pattern>
        </forbidden>
        <do_not_include>
          <pattern>"Here's what I think..."</pattern>
          <pattern>"Let me verify..."</pattern>
          <pattern>"My recommendation is..."</pattern>
        </do_not_include>
      </strategic_direction>
    </output_constraints>
    ```

    Preserve `## Strategic Direction` example blocks and density examples in their current location.

    Use Edit tool for each surgical change. Read line numbers from advisor.md at exec time -- they may have drifted since RESEARCH was captured.

    Verify after edit:
    - `bash -n` analog: confirm the file is still valid markdown / agent frontmatter parses (run `node -e "import('js-yaml').then(yaml => console.log(yaml.load(require('fs').readFileSync('plugins/lz-advisor/agents/advisor.md', 'utf8').split('---')[1])))"` or simpler: just visually inspect frontmatter + first H2)
  </action>
  <verify>
    <automated>git diff --stat plugins/lz-advisor/agents/advisor.md</automated>
  </verify>
  <acceptance_criteria>
    - advisor.md modified per disposition branch (A, B, C, or D)
    - Disposition recorded matches the disposition in 08-MEASUREMENT.md
    - Frontmatter still parses correctly (visual inspection or YAML parser)
    - If Branch A: line 60 Format extension applied
    - If Branch B: at least 1 density example item edited; per-item word counts recorded in SUMMARY
    - If Branch C: both Branch A and Branch B edits applied in single commit
    - If Branch D: `## Output Constraint` replaced with per-section `<output_constraints>` XML
  </acceptance_criteria>
  <done>
    advisor.md updated per disposition; ready for atomic 5-surface version bump in Task 3.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: Atomic 5-surface version bump (0.14.0 -> 0.14.1 PATCH; or 0.15.0 MINOR if Branch D escalation) + post-fix gate re-verification</name>
  <files>plugins/lz-advisor/.claude-plugin/plugin.json, plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md, plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md, plugins/lz-advisor/skills/lz-advisor.review/SKILL.md, plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md</files>
  <read_first>
    - plugins/lz-advisor/.claude-plugin/plugin.json (current version 0.14.0 from Plan 1 bump)
    - 4 SKILL.md files (current version 0.14.0 frontmatter)
    - .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-CONTEXT.md (D-04 atomic 5-surface hard constraint)
  </read_first>
  <action>
    Branching version trail per D-04 (planner discretion; atomic 5-surface sync hard constraint):
    - Branches A, B, C (PATCH-tier prose refinement): 0.14.0 -> 0.14.1 PATCH
    - Branch D (MINOR-tier contract-shape change): 0.14.0 -> 0.15.0 MINOR

    Update all 5 surfaces atomically (single commit):
    1. `plugins/lz-advisor/.claude-plugin/plugin.json` -> new version
    2. `plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md` frontmatter
    3. `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` frontmatter
    4. `plugins/lz-advisor/skills/lz-advisor.review/SKILL.md` frontmatter
    5. `plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md` frontmatter

    Verify:
    - `git grep -c "<new-version>" plugins/lz-advisor/.claude-plugin/plugin.json plugins/lz-advisor/skills/lz-advisor.*/SKILL.md` returns 5 hits
    - `git grep -n "0\.14\.0" plugins/lz-advisor/` returns no hits (all surfaces moved)

    Post-fix gate re-verification:
    Run n=3 fresh `claude -p` sessions on the same 3 scenarios from Plan 3 against the FIXED plugin. Capture each trace to `uat-replay-0.14.1/` (or `uat-replay-0.15.0/` for Branch D). Run `bash D-advisor-budget.sh --from-trace ...` against each; the gate must now PASS at n=3.

    If gate still FAILS: the disposition fix was insufficient. Document in SUMMARY; escalate to Phase 9 (the chosen disposition was incorrect OR a second-order effect not captured by D-02).

    Cost: 3x claude -p sessions; estimate $1.50-$3.00.
  </action>
  <verify>
    <automated>cd D:/projects/github/LayZeeDK/lz-advisor-claude-plugins && (test -z "$(git grep -F 0.14.0 plugins/lz-advisor/.claude-plugin/plugin.json plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md plugins/lz-advisor/skills/lz-advisor.review/SKILL.md plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md)" || echo "0.14.0 still present in some surface")</automated>
  </verify>
  <acceptance_criteria>
    - All 5 surfaces show the new version (0.14.1 or 0.15.0) in a single commit
    - No surface still shows 0.14.0
    - 3 fresh post-fix UAT traces captured to `uat-replay-0.14.1/` (or `uat-replay-0.15.0/`)
    - Post-fix `D-advisor-budget.sh --from-trace` on each: gate now PASSES at n=3
    - If still FAILS: SUMMARY documents the residual + Phase 9 escalation
  </acceptance_criteria>
  <done>
    Atomic version bump complete; post-fix gate verified PASS at n=3; or residual documented for Phase 9.
  </done>
</task>

</tasks>

<verification>
After all 3 tasks (if Plan 4 actually ships):

1. advisor.md modified per disposition (visible in `git diff`)
2. All 5 surfaces atomically bumped to 0.14.1 PATCH or 0.15.0 MINOR
3. Post-fix re-runs of D-advisor-budget.sh on the 3 scenarios all PASS
4. 08-MEASUREMENT.md disposition matches actual fix applied
</verification>

<success_criteria>
- Structural residual closed via mechanically-derived disposition
- Atomic 5-surface version sync preserved (D-04 hard constraint)
- Post-fix gate verification confirms the fix worked at n=3
</success_criteria>

<output>
After completion (or abort), create `.planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-04-SUMMARY.md` documenting:
- Disposition chosen (D1 / D2 / both / escalation / abort)
- Surgical edits per branch (line numbers + before/after)
- Atomic 5-surface version trail chosen (0.14.0 -> 0.14.1 PATCH or 0.15.0 MINOR; rationale)
- Post-fix gate verdict (PASS at n=3) OR residual documented for Phase 9
- Cost: ~3x claude -p sessions
- Disposition-to-edit fidelity: did the chosen branch's edits actually close the FAIL mode?
</output>