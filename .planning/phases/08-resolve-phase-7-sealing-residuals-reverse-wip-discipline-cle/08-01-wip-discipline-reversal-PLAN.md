---
phase: 08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md
  - .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/E-verify-before-commit.sh
  - .planning/REQUIREMENTS.md
  - plugins/lz-advisor/.claude-plugin/plugin.json
  - plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md
  - plugins/lz-advisor/skills/lz-advisor.review/SKILL.md
  - plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md
autonomous: true
requirements: [RES-WIP-DISCIPLINE-REVERSAL]
requirements_addressed: [RES-WIP-DISCIPLINE-REVERSAL]
target_version: 0.14.0
tags: [contract-change, doc-removal, smoke-fixture-edit, version-bump]

must_haves:
  truths:
    - "Plan 07-08 subject-prefix wip-discipline rule no longer appears anywhere in plugins/lz-advisor/"
    - "E-verify-before-commit.sh has zero references to path-d, SYNTHESIZE_PATH_D, PATH_D_VIOLATION, --replay flag"
    - "REQUIREMENTS.md GAP-G2-wip-scope row removed; traceability table updated; coverage count adjusted"
    - "Plugin version atomically bumped to 0.14.0 across 5 surfaces in single commit"
    - "E-verify-before-commit.sh still PASSES when run after removal (positive paths a, b, c remain intact)"
  artifacts:
    - path: "plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md"
      provides: "execute SKILL without Subject-prefix discipline section or 3-shape worked example"
      contains: "no occurrences of 'wip:' or 'Subject-prefix discipline'"
    - path: ".planning/phases/05.4-address-uat-findings-a-k/smoke-tests/E-verify-before-commit.sh"
      provides: "E-fixture reduced to 3-path positive assertion (paths a, b, c) only"
      contains: "no occurrences of 'path-d', 'SYNTHESIZE_PATH_D', 'PATH_D_VIOLATION', '--replay'"
    - path: ".planning/REQUIREMENTS.md"
      provides: "REQUIREMENTS without GAP-G2-wip-scope"
      contains: "no occurrences of 'GAP-G2-wip-scope'"
  key_links:
    - from: "plugins/lz-advisor/.claude-plugin/plugin.json"
      to: "4 SKILL.md frontmatter version fields"
      via: "atomic 5-surface version sync"
      pattern: "version.*0\\.14\\.0"
---

<objective>
Remove the Plan 07-08 wip-discipline contract from the plugin per user directive 2026-05-03 (memory `feedback_no_wip_commits.md`). The rule fires correctly per spec, but the user rejects `wip:` commits as a workflow choice. Reversal touches 3 files: execute SKILL.md (~62 lines), E-verify-before-commit.sh (~110 lines including --replay flag), REQUIREMENTS.md (1 row + traceability row + coverage block). Bump plugin 0.13.1 -> 0.14.0 MINOR (skill-behavior contract change) atomically across 5 surfaces.

Purpose: Honor user workflow preference; eliminate workflow rule rejected at project-level even though it worked per spec.

Output: Wip-discipline rule removed from plugin contract; E-fixture reduced to positive-path assertions; REQUIREMENTS.md cleansed; version 0.14.0 across 5 surfaces.
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
@.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-VERIFICATION.md
</context>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| None added | Plan removes documentation and a smoke-fixture assertion; no new code path |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-8-01-01 | N/A | wip-discipline rule | accept | No new attack surface -- removes existing documentation contract; no code or data flow changes. The wip-discipline contract was a workflow hygiene rule, never a security control. Removing it does not weaken any security boundary. |
</threat_model>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Remove wip-discipline section + 3-shape worked example from execute SKILL.md</name>
  <files>plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md</files>
  <read_first>
    - plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md (current content, focus on lines 224-286 and line 311)
    - .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-RESEARCH.md (specifically Plan 1 Code Examples section and Pitfall 6 cross-reference cleanup at line 311)
    - .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-CONTEXT.md (D-01 Plan 1 description; Specific Ideas P0 reversal note)
    - .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-VERIFICATION.md (lines 1302-1305 wip-reversal disposition)
  </read_first>
  <action>
    Edit `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` to remove the entire wip-discipline contract:

    1. Delete lines 224-286 inclusive. This is the block starting with `### Subject-prefix discipline when Outstanding Verification is populated` and ending at the last line of the `**Shape 3 (CORRECT carve-out):**` worked example block (line 286 is the last line before `### `Verified:` trailer convention` at line 288). Remove all 3 worked-example shapes (Shape 1, Shape 2, Shape 3) and their surrounding prose.

    2. Edit line 311 (currently inside `<durable>` block / `## Phase 4: Make Durable` section) to simplify the cross-reference. Current line:
       ```
       0. Apply Phase 3.5 verify-before-commit rules from `<verify_before_commit>` -- resolve hedge markers, execute plan Run: directives, route long-running validations to a `wip:` commit if necessary, and record verifications via `Verified:` trailers. The commit you make in step 3 must reflect either completed verifications or a `wip:` prefix with an Outstanding Verification body section.
       ```
       Replace with:
       ```
       0. Apply Phase 3.5 verify-before-commit rules from `<verify_before_commit>` -- resolve hedge markers, execute plan Run: directives, and record verifications via `Verified:` trailers.
       ```

    3. Search the rest of the SKILL.md for residual `wip:` mentions: `git grep -n "wip:" plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` after edit MUST return zero hits. Any other surviving cross-reference must be removed.

    4. Preserve `### `Verified:` trailer convention` section (line 288+) and `### Reconciliation extension` section -- these are independent of subject-prefix discipline.

    5. Do NOT use `cat << 'EOF'` heredoc. Use the Edit tool with old_string/new_string for the line 311 surgical edit; use Edit for the large block removal too (provide the verbatim block as old_string and empty as new_string). If the block is too large for a single Edit, split into 2-3 sequential Edits.
  </action>
  <verify>
    <automated>git grep -n "wip:" plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md ; test $? -eq 1</automated>
  </verify>
  <acceptance_criteria>
    - `git grep -n "wip:" plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` returns exit code 1 (no matches)
    - `git grep -n "Subject-prefix discipline" plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` returns exit code 1
    - `git grep -n "Outstanding Verification" plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` returns 0 hits (all references gone, including line 311 simplification)
    - Line 311's `Apply Phase 3.5 verify-before-commit rules` text remains but without `wip:` or `Outstanding Verification` mentions
    - `### `Verified:` trailer convention` section still present (independent feature preserved)
    - File length decreased by approximately 62 lines vs. pre-edit
  </acceptance_criteria>
  <done>
    Wip-discipline contract section is removed from execute SKILL.md; cross-reference at Phase 4 step 0 is simplified; Verified trailer convention preserved; grep verifies zero residual references.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Reduce E-verify-before-commit.sh to 3-path positive assertion only</name>
  <files>.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/E-verify-before-commit.sh</files>
  <read_first>
    - .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/E-verify-before-commit.sh (current 301-line content; focus lines 42-81 --replay block, lines 170-188 SYNTHESIZE_PATH_D block, lines 217-269 PATH_D_VIOLATION detection block)
    - .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-RESEARCH.md (Pitfall 6 removal targets enumeration)
    - .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-CONTEXT.md (Plan 1 description + Specific Ideas P0 reversal contract-shape note)
  </read_first>
  <action>
    Edit `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/E-verify-before-commit.sh` to remove ALL wip-discipline / path-d machinery, leaving only the 3-path positive assertion (paths a, b, c):

    1. Remove `--replay <sha>` flag block (lines 42-81). The flag was added by Plan 07-08 as a manual auditor mode for arbitrary commits; removing the wip contract makes it dead code. Remove its argument parsing, its branch in the main control flow, and any helper functions it relied on (if functions are exclusively used by --replay, remove them too).

    2. Remove `SYNTHESIZE_PATH_D` block (lines 160-188 per CONTEXT, lines 170-188 per RESEARCH -- read the file to confirm the exact range). This is the synthesized in-process scenario that constructs a fake commit with Outstanding Verification body + non-wip subject to exercise the path-d detector.

    3. Remove `PATH_D_VIOLATION` detection block (lines 217-269 per CONTEXT, lines 225-244 per RESEARCH -- read the file to confirm the exact range). This is the assertion logic that grep-detects wip-discipline violations.

    4. Remove all "Outstanding Verification" cross-references throughout the script body (comments, echo statements, variable names like `PATH_D_*`).

    5. Preserve the script's positive paths a, b, c (likely lines that assert `## Outstanding Verification` body when `Verified:` trailers are present in trace, or analog -- read the script to identify each surviving path's exact name).

    6. Adjust the final assertion summary so TOTAL_PATHS reflects 3 remaining paths (a, b, c). If the script tracks `RESULT_D` or similar, remove the variable and any printf line that references it.

    7. After edits, run `bash -n .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/E-verify-before-commit.sh` to confirm syntax is valid.

    8. Run the fixture: `bash .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/E-verify-before-commit.sh`. It must PASS (exit 0) on the 3-path positive criterion. The fixture's scratch-repo setup paths (a, b, c) should not depend on any removed code.

    Use the Edit tool for each surgical removal. Do NOT use heredoc to rewrite the whole file -- use targeted Edit calls per block.
  </action>
  <verify>
    <automated>bash -n .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/E-verify-before-commit.sh && bash .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/E-verify-before-commit.sh</automated>
  </verify>
  <acceptance_criteria>
    - `git grep -n "path-d\|PATH_D\|SYNTHESIZE_PATH_D" .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/E-verify-before-commit.sh` returns exit code 1
    - `git grep -n -- "--replay" .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/E-verify-before-commit.sh` returns exit code 1
    - `git grep -n "Outstanding Verification" .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/E-verify-before-commit.sh` returns exit code 1
    - `bash -n` exits 0 (valid bash syntax)
    - `bash E-verify-before-commit.sh` exits 0 (positive paths a, b, c still pass)
    - File length decreased by approximately 110 lines vs. pre-edit
  </acceptance_criteria>
  <done>
    E-fixture has no wip-discipline machinery; positive 3-path assertions are intact and the script runs green.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: Remove GAP-G2-wip-scope row from REQUIREMENTS.md + bump plugin to 0.14.0 across 5 surfaces atomically</name>
  <files>.planning/REQUIREMENTS.md, plugins/lz-advisor/.claude-plugin/plugin.json, plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md, plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md, plugins/lz-advisor/skills/lz-advisor.review/SKILL.md, plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md</files>
  <read_first>
    - .planning/REQUIREMENTS.md (lines 70-71 GAP-G2-wip-scope row; line 150 traceability row; lines 154-157 coverage block)
    - plugins/lz-advisor/.claude-plugin/plugin.json (line 3 currently `"version": "0.13.1"`)
    - plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md (frontmatter; line 18 `version: 0.13.1`)
    - plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md (frontmatter; line 19 `version: 0.13.1`)
    - plugins/lz-advisor/skills/lz-advisor.review/SKILL.md (frontmatter; line 19 `version: 0.13.1`)
    - plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md (frontmatter; line 19 `version: 0.13.1`)
    - .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-CONTEXT.md (D-04 atomic 5-surface version sync hard constraint)
    - .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-RESEARCH.md (Architecture Patterns section: Pattern 3 atomic 5-surface canon)
  </read_first>
  <action>
    Two parts: REQUIREMENTS.md cleanup + atomic 5-surface version bump.

    Part A: REQUIREMENTS.md
    1. Delete lines 70-71 entirely. These are the `### GAP-G2-wip-scope:` heading + body row.
    2. Delete the traceability entry `| GAP-G2-wip-scope | Phase 7 | Pending |` near line 150.
    3. Update the coverage block at lines 154-157:
       - `v1 requirements: 42 total` -> `v1 requirements: 41 total`
       - `Mapped to phases: 42` -> `Mapped to phases: 41`

    Part B: Atomic 5-surface version bump (0.13.1 -> 0.14.0)
    All 5 edits MUST land in a single commit per atomic-5-surface canon (Plan 07-15 / 07-17 precedent):

    1. `plugins/lz-advisor/.claude-plugin/plugin.json` line 3: `"version": "0.13.1"` -> `"version": "0.14.0"`
    2. `plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md` frontmatter: `version: 0.13.1` -> `version: 0.14.0`
    3. `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` frontmatter: `version: 0.13.1` -> `version: 0.14.0`
    4. `plugins/lz-advisor/skills/lz-advisor.review/SKILL.md` frontmatter: `version: 0.13.1` -> `version: 0.14.0`
    5. `plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md` frontmatter: `version: 0.13.1` -> `version: 0.14.0`

    Verify all 5 surfaces show 0.14.0:
    `git grep -n "version.*0\.14\.0" plugins/lz-advisor/.claude-plugin/plugin.json plugins/lz-advisor/skills/lz-advisor.*/SKILL.md`

    Confirm no surface still shows 0.13.1:
    `git grep -n "0\.13\.1" plugins/lz-advisor/` MUST return zero hits.

    Use Edit tool for each version field. Per D-04, version trail is not load-bearing; the choice of 0.14.0 MINOR signals contract-shape change (skill behavior contract removed) per planner discretion. Atomic 5-surface sync is the only hard constraint.
  </action>
  <verify>
    <automated>git grep -nF "GAP-G2-wip-scope" .planning/REQUIREMENTS.md ; test $? -eq 1 && git grep -c "0.14.0" plugins/lz-advisor/.claude-plugin/plugin.json plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md plugins/lz-advisor/skills/lz-advisor.review/SKILL.md plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md</automated>
  </verify>
  <acceptance_criteria>
    - `git grep -nF "GAP-G2-wip-scope" .planning/REQUIREMENTS.md` returns exit code 1 (no hits)
    - `git grep -n "0\.13\.1" plugins/lz-advisor/` returns exit code 1
    - All 5 surfaces show `0.14.0`: `plugin.json` + 4 `SKILL.md`
    - Coverage block reads `v1 requirements: 41 total` and `Mapped to phases: 41`
    - All 5 version edits land in a single commit (atomic 5-surface canon)
  </acceptance_criteria>
  <done>
    REQUIREMENTS.md is cleansed; plugin version is 0.14.0 atomically across all 5 surfaces; the contract-shape change is signaled by the MINOR bump.
  </done>
</task>

</tasks>

<verification>
After all 3 tasks complete:

1. `git grep -n "wip:\|wip-discipline\|Subject-prefix\|Outstanding Verification\|path-d\|PATH_D" plugins/lz-advisor/ .planning/REQUIREMENTS.md .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/E-verify-before-commit.sh` MUST return exit code 1 (no hits anywhere in plugin or modified fixture).
2. `bash .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/E-verify-before-commit.sh` exits 0.
3. `git grep -n "0\.14\.0" plugins/lz-advisor/.claude-plugin/plugin.json plugins/lz-advisor/skills/lz-advisor.*/SKILL.md` returns exactly 5 hits.
4. `git grep -n "0\.13\.1" plugins/lz-advisor/` returns exit code 1.
</verification>

<success_criteria>
- Plan 07-08 wip-discipline contract entirely removed from plugin
- E-fixture reduced to 3-path positive assertion only; still PASSES
- REQUIREMENTS.md GAP-G2-wip-scope eliminated; coverage updated
- Plugin atomically at 0.14.0 across 5 surfaces in single commit
- User directive `feedback_no_wip_commits.md` honored at plugin contract level
</success_criteria>

<output>
After completion, create `.planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-01-SUMMARY.md` documenting:
- Total lines removed from execute SKILL.md (target: ~62 lines)
- Total lines removed from E-verify-before-commit.sh (target: ~110 lines)
- REQUIREMENTS.md row + traceability + coverage changes
- 5-surface version bump 0.13.1 -> 0.14.0 (atomic single commit)
- Verification grep results (must all return zero hits / 5 hits as specified)
- Note: rule worked per spec per Phase 7 UAT evidence (5 of 10 commits used wip: prefix); removal is project-level workflow decision, not defect-driven.
</output>