---
phase: 08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle
plan: 06
type: execute
wave: 2
depends_on: [05]
files_modified:
  - plugins/lz-advisor/references/context-packaging.md
  - .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/G-advisor-narrative-sd-pv.sh
autonomous: true
requirements: [P8-18]
requirements_addressed: [P8-18]
target_version: 0.14.0
tags: [pv-extension, common-contract-rule-5b, smoke-fixture-new]

must_haves:
  truths:
    - "Common Contract Rule 5b in plugins/lz-advisor/references/context-packaging.md has a new sub-rule (extension or 5c) covering advisor narrative SD prose self-anchor"
    - "Sub-rule mandates: when advisor SD introduces a load-bearing technical assertion, executor MUST verify against installed-version source before propagating into subsequent skill consultation"
    - "Sub-rule references the 3 verification surfaces from Rule 5b: package.json, .d.ts, official docs via WebFetch"
    - "New smoke fixture G-advisor-narrative-sd-pv.sh exists and asserts executor either flags as unverified hedge OR verifies+cites source"
    - "Smoke fixture's synthesized advisor SD contains a deliberately-false technical assertion (concrete example, not contrived)"
    - "Fixture PASSES on the canonical plugin (executor reaches verify-or-flag verdict)"
  artifacts:
    - path: "plugins/lz-advisor/references/context-packaging.md"
      provides: "Rule 5b extended (or Rule 5c added) covering advisor narrative SD pv-extension"
      contains: "Advisor narrative SD self-anchor"
    - path: ".planning/phases/05.4-address-uat-findings-a-k/smoke-tests/G-advisor-narrative-sd-pv.sh"
      provides: "New smoke fixture asserting executor verifies or flags advisor SD claims"
      contains: "synthesized advisor SD with false claim; executor verify-or-flag assertion"
  key_links:
    - from: "Common Contract Rule 5b dual-surface differentiation"
      to: "Advisor narrative SD prose (third surface)"
      via: "Rule 5b extension (planner's discretion: extend 5b vs new 5c)"
      pattern: "Advisor narrative SD"
---

<objective>
Close P8-18 (Self-anchor through advisor narrative SD prose) carry-forward residual. Phase 7 closure amendment identified that pv-validation currently catches token-form self-anchors in user-facing artifact surface (plan files, review/security-review output, commit bodies) and internal-prompt XML surface, but does NOT catch when advisor's Strategic Direction prose itself introduces a load-bearing technical claim that the executor self-anchors against in subsequent skill consultations.

Two deliverables:
1. **Rule 5b extension (or new 5c)** in `plugins/lz-advisor/references/context-packaging.md` -- new sub-rule covering advisor narrative SD prose as a third pv-validation surface. Planner picks placement: extend 5b (suggested) vs add Rule 5c. The rule mandates: when advisor SD contains a load-bearing technical assertion (e.g., "TypeScript 5 supports decorators on accessors"; "Nx 19 supports cache inputs on targets"; "@storybook/angular 10.x exports `setCompodocJson`"), the executor must verify against the installed-version source before propagating.

2. **Smoke fixture** `G-advisor-narrative-sd-pv.sh` -- synthesizes an advisor SD with a deliberately-false technical claim (the empirical anchor is a real fact-style claim that's actually false, not a contrived one); asserts executor either (a) flags as unverified hedge, or (b) verifies + cites source. Suggested false claim: "TypeScript 5 supports parameter decorators on instance methods" (FALSE -- TC39 Stage 3 decorators only support class decorators; parameter decorators are not in Stage 3).

Purpose: Close one of the three remaining P3 carry-forward items; honor the dual-surface pv-validation pattern (Plan 07-11) for a third surface.

Output: 1 modified reference file (sub-rule added) + 1 new smoke fixture.
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
@.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-11-SUMMARY.md
@.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-01-SUMMARY.md

<interfaces>
<!-- Current Rule 5b structure in plugins/lz-advisor/references/context-packaging.md lines 48-80 per RESEARCH -->

Rule 5b sections:
- Format mandate (lines 50-64; internal-prompt XML + user-facing token-form)
- Source-grounded evidence requirement (line 66)
- Self-anchor rejection (lines 68-74)
- Synthesis mandate (line 76)
- ToolSearch precondition (line 78)

Proposed extension (Option A: extend 5b per CONTEXT.md suggestion):

```markdown
   - **Advisor narrative SD self-anchor.** When the advisor's Strategic Direction prose introduces a load-bearing technical assertion (e.g., "TypeScript 5 supports decorators on accessors"; "Nx 19 supports cache inputs on targets"; "@storybook/angular 10.x exports `setCompodocJson`") that the executor will propagate into subsequent skill consultation prompts, the executor MUST verify the assertion against the installed-version source (package.json, .d.ts, official docs via WebFetch) before propagating. Verification produces a `<pre_verified>` block per Rule 5b synthesis mandate. Unresolved hedges (e.g., advisor uses the inline `Assuming X (unverified), do Y. Verify X before acting.` frame) inherit Rule 5c (Hedge propagation rule). The failure mode this sub-rule closes: advisor SD prose that asserts a framework / library behavior without source backing, executor propagates verbatim into the next consultation (review / security-review), downstream agent treats as authoritative.
```

The 3 verification surfaces are reused verbatim from Rule 5b: package.json (version-pinning), .d.ts (typed surface), official docs via WebFetch (vendor authority).
</interfaces>
</context>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| advisor SD prose -> executor's subsequent skill consultations | Internal data flow within plugin; no network surface |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-8-06-01 | N/A | sub-rule addition | accept | No new attack surface -- doc edit + smoke fixture. Smoke fixture's synthesized false claim is a synthetic test artifact (e.g., "TypeScript 5 supports parameter decorators on instance methods"). No actual training-data poisoning -- the fixture exists in a scratch repo, not the plugin distribution. |
| T-8-06-02 | N/A | new shell smoke fixture | accept | New smoke fixture executes in dev environment with standard shell utilities (grep, wc, regex matching). No network access, no privileged operations. Mirrors existing D-* / E-* / B-* fixture patterns. |
</threat_model>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Extend Common Contract Rule 5b with advisor narrative SD self-anchor sub-rule in references/context-packaging.md</name>
  <files>plugins/lz-advisor/references/context-packaging.md</files>
  <read_first>
    - plugins/lz-advisor/references/context-packaging.md (current 424-line content; focus lines 48-80 Common Contract Rule 5b; lines 82-89 Rule 5c hedge propagation)
    - .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-11-SUMMARY.md (Plan 07-11 D2 dual-surface differentiation pattern)
    - .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-01-SUMMARY.md (Plan 07-01 original Rule 5b structure)
    - .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-RESEARCH.md (Plan 6 Code Examples section + Pitfall 3 anchor)
    - .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-CONTEXT.md (Specific Ideas Plan 6 + Claude's Discretion sub-rule placement)
  </read_first>
  <action>
    Read `plugins/lz-advisor/references/context-packaging.md` and locate the precise end of Rule 5b (currently lines 48-80 per RESEARCH).

    Place the new sub-rule per planner discretion (per CONTEXT.md Claude's Discretion: extend 5b vs new 5c). Suggested: extend 5b for prose coherence -- the new sub-rule is the third dual-surface differentiation in the same conceptual group (Plan 07-11 D2 introduced internal-prompt XML + user-facing token-form; advisor SD prose is the third surface).

    Insert AFTER the ToolSearch precondition (currently at the end of Rule 5b) and BEFORE Rule 5c begins (line ~82):

    ```markdown
       - **Advisor narrative SD self-anchor.** When the advisor's Strategic Direction prose introduces a load-bearing technical assertion (e.g., "TypeScript 5 supports decorators on accessors"; "Nx 19 supports cache inputs on targets"; "@storybook/angular 10.x exports `setCompodocJson`") that the executor will propagate into subsequent skill consultation prompts, the executor MUST verify the assertion against the installed-version source (package.json, .d.ts, official docs via WebFetch) before propagating. Verification produces a `<pre_verified>` block per Rule 5b synthesis mandate. Unresolved hedges (e.g., advisor uses the inline `Assuming X (unverified), do Y. Verify X before acting.` frame) inherit Rule 5c (Hedge propagation rule). The failure mode this sub-rule closes: advisor SD prose that asserts a framework / library behavior without source backing, executor propagates verbatim into the next consultation (review / security-review), downstream agent treats as authoritative.
    ```

    Indentation: match the surrounding sub-rule format (3 spaces + `- **` per file structure; confirm by reading existing sub-rules at lines 50-78).

    Verify the prose flow: the new sub-rule should read coherently between the ToolSearch precondition and Rule 5c heading. Read the surrounding lines after insertion.

    Use Edit tool. Do NOT use heredoc.
  </action>
  <verify>
    <automated>git grep -nF "Advisor narrative SD self-anchor" plugins/lz-advisor/references/context-packaging.md</automated>
  </verify>
  <acceptance_criteria>
    - `git grep -nF "Advisor narrative SD self-anchor" plugins/lz-advisor/references/context-packaging.md` returns 1 hit
    - The new sub-rule appears AFTER Rule 5b's ToolSearch precondition (verify by reading lines around the insertion point)
    - The new sub-rule appears BEFORE Rule 5c hedge propagation heading
    - Sub-rule's 3 verification surfaces (package.json, .d.ts, WebFetch) align with Rule 5b's existing 3-surface pattern
    - Sub-rule references "Rule 5b synthesis mandate" and "Rule 5c (Hedge propagation rule)" by name -- preserves cross-reference coherence
  </acceptance_criteria>
  <done>
    Rule 5b extended (or new 5c added per planner discretion) with the advisor narrative SD pv-extension sub-rule.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Write new smoke fixture G-advisor-narrative-sd-pv.sh asserting executor verifies or flags advisor SD load-bearing claims</name>
  <files>.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/G-advisor-narrative-sd-pv.sh</files>
  <read_first>
    - .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-advisor-budget.sh (existing fixture as structural template: scratch-repo setup; claude -p invocation; trace parsing; assertion logic)
    - .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/B-pv-validation.sh (existing pv-validation fixture; assertion 6 pattern for token resolution check)
    - plugins/lz-advisor/references/context-packaging.md (the new Rule 5b extension from Task 1)
    - .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-RESEARCH.md (Plan 6 smoke fixture suggestion + anti-pattern "Synthesizing advisor SD in Plan 6 smoke fixture without empirical anchor")
    - .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-CONTEXT.md (Plan 6 description)
  </read_first>
  <action>
    Create `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/G-advisor-narrative-sd-pv.sh`.

    Structure (mirror D-advisor-budget.sh / B-pv-validation.sh patterns):

    1. Shebang + set -euo pipefail + ASCII-only output.
    2. SCRATCH directory setup: `mkdir -p` + `trap 'rm -rf "$SCRATCH"' EXIT`.
    3. Seed scratch directory with a minimal Angular/TS scenario where advisor SD might assert a TypeScript-5-decorator-related claim. Example: a single TypeScript source file containing `class Foo { @SomeDecorator() bar(@ParamDec() x: string) {} }` -- this exercises both class decorator and parameter decorator surfaces.
    4. Compose a scenario prompt that asks `/lz-advisor.plan` to advise on the file's decorator surface. The orient phase must surface the parameter decorator question; the advisor will either correctly note that parameter decorators are NOT in TC39 Stage 3 (rare; advisor doesn't always have current spec data) OR will assert "TypeScript 5 supports parameter decorators on instance methods" (FALSE -- this is the deliberately-false claim if it surfaces; the alternative is correct rejection).

       Recommended approach: instead of relying on the advisor to surface a false claim spontaneously (which is non-deterministic), the fixture INJECTS a synthesized advisor SD via mock-injection. The fixture writes a fake advisor trace JSONL with the false claim, then runs the executor against the injected trace to test whether the executor (a) verifies or (b) flags as hedge.

    5. Implementation (simpler approach -- direct synthesis mode):
       ```bash
       # Synthesize a fake advisor SD response into a trace file
       cat > "$SCRATCH/synthetic-advisor-sd.jsonl" <<'TRACE_EOF'
       {"type":"text","content":"## Strategic Direction\n\n1. TypeScript 5 supports parameter decorators on instance methods. Apply @ParamDec() to bar's `x` parameter to enforce string-only inputs.\n2. ..."}
       TRACE_EOF
       ```
       Then assert that the executor's next consultation either:
       - (a) Contains a `<pre_verified>` block referencing parameter-decorators with source-grounded evidence (TC39 stage; tsc test compile) OR
       - (b) Contains a hedge marker `Assuming X (unverified)` on the parameter decorator claim

    6. Practical assertion logic (since this fixture is documentation-grade evidence rather than full executor simulation, simpler approach):

       Run `claude -p` with the plan skill against the prompt that includes the false claim in the user-provided context:
       ```bash
       PROMPT='/lz-advisor.plan The advisor mentor told me: "TypeScript 5 supports parameter decorators on instance methods, use @ParamDec()". Please plan how to apply this to my Angular library Foo component.'

       OUTPUT=$(claude --model sonnet --effort medium --plugin-dir plugins/lz-advisor \
         -p "$PROMPT" --verbose --output-format stream-json 2>&1)
       ```

       Then assert:
       - Output contains EITHER `pv-` token with parameter-decorator anchoring OR `<pre_verified>` block citing TC39 / tsc test compile (verify path)
       - OR output contains `Assuming` frame on the parameter-decorator claim (flag path)
       - If output assumes the claim is true without verification or flagging, FAIL

       ```bash
       if rg -qi "Assuming.*parameter[- ]decorator|<pre_verified>.*parameter[- ]decorator|pv-.*parameter[- ]decorator" <<< "$OUTPUT"; then
         echo "[PASS] Executor verified or flagged advisor SD parameter-decorator claim"
         exit 0
       else
         echo "[FAIL] Executor propagated advisor SD parameter-decorator claim without verify-or-flag"
         exit 1
       fi
       ```

    7. Trap teardown:
       ```bash
       trap 'rm -rf "$SCRATCH"' EXIT
       ```

    8. Run `bash -n G-advisor-narrative-sd-pv.sh` to validate syntax.

    9. Run the fixture once: `bash G-advisor-narrative-sd-pv.sh`. Expected: PASS (executor verifies or flags). If FAIL: document in SUMMARY; this is empirical evidence that the Rule 5b extension prose alone is insufficient; structural follow-up needed in Phase 9.

    The fixture is documentation-grade evidence -- it's acceptable for the fixture to be partially heuristic (regex-matching on output strings). The acceptance criterion is "fixture runs to completion without bash error; emits PASS or FAIL with a clear verdict."

    Use Write tool to create the fixture. Cost: ~$0.50 per run.
  </action>
  <verify>
    <automated>test -f .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/G-advisor-narrative-sd-pv.sh && bash -n .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/G-advisor-narrative-sd-pv.sh</automated>
  </verify>
  <acceptance_criteria>
    - `G-advisor-narrative-sd-pv.sh` exists at the expected path
    - `bash -n G-advisor-narrative-sd-pv.sh` exits 0 (valid syntax)
    - The fixture seeds a scratch directory + traps cleanup
    - The fixture invokes `claude -p` with a prompt containing the deliberately-false TypeScript 5 parameter decorator claim
    - The fixture asserts executor either verifies OR flags the claim (PASS) vs propagates verbatim (FAIL)
    - One successful run of the fixture is captured to a log (PASS or FAIL verdict recorded in SUMMARY)
  </acceptance_criteria>
  <done>
    Smoke fixture exists, runs to completion, emits clear verdict. Either PASS (confirms Rule 5b extension works) or FAIL (logs evidence for Phase 9 structural follow-up).
  </done>
</task>

</tasks>

<verification>
After both tasks:

1. `git grep -nF "Advisor narrative SD self-anchor" plugins/lz-advisor/references/context-packaging.md` returns 1 hit.
2. `G-advisor-narrative-sd-pv.sh` exists; `bash -n` validates; one live run captured.
3. The fixture's verdict (PASS or FAIL) is documented in 08-06-SUMMARY.md.
</verification>

<success_criteria>
- Rule 5b extension closes P8-18 prose surface
- Smoke fixture provides empirical evidence of executor behavior
- If FAIL: Phase 9 structural follow-up triggered (advisor.md fragment-grammar amendment or trust-contract refinement)
- If PASS: P8-18 closes empirically with both prose + fixture in place
</success_criteria>

<output>
After completion, create `.planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-06-SUMMARY.md` documenting:
- Rule 5b extension diff (before/after; line numbers)
- G-advisor-narrative-sd-pv.sh creation: scenario design + assertion logic + scratch-repo structure
- Fixture verdict (PASS / FAIL); raw fixture log captured
- If FAIL: candidate Phase 9 follow-up surfaces (advisor.md fragment-grammar amendment OR trust-contract refinement OR new pv-validation assertion)
- Decision: extended 5b vs added 5c (per planner discretion); rationale
</output>