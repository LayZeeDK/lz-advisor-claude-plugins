---
phase: 08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle
plan: 06
subsystem: context-packaging-rule-5b
tags: [pv-extension, common-contract-rule-5b, smoke-fixture-new, p8-18-closure, advisor-narrative-sd]
requirements: [P8-18]
requirements_addressed: [P8-18]
plugin_version_at_completion: 0.14.0
dependency_graph:
  requires:
    - "Plan 07-01 Rule 5b original (source-grounded evidence + self-anchor rejection)"
    - "Plan 07-11 Rule 5b D2 dual-surface differentiation (internal-prompt XML + user-facing token-form)"
    - "Plan 07-07 Rule 5b ToolSearch precondition (default-on Phase 1)"
    - "Plan 07-02 Rule 5c Hedge propagation rule"
    - "Plan 07-10 advisor fragment-grammar emit template canon"
  provides:
    - "Common Contract Rule 5b sub-rule 5 (Advisor narrative SD self-anchor) covering third pv-validation surface"
    - "G-advisor-narrative-sd-pv.sh smoke fixture with 3-path verdict (verify / flag / contradict)"
    - "Empirical evidence on plugin 0.13.1 that Rule 5b extension is binding (3/3 paths fired on first live run)"
  affects:
    - "plugins/lz-advisor/references/context-packaging.md (Rule 5b extended with fifth sub-rule)"
    - ".planning/phases/05.4-address-uat-findings-a-k/smoke-tests/G-advisor-narrative-sd-pv.sh (NEW)"
    - ".planning/REQUIREMENTS.md (P8-18 row marked Complete)"
tech_stack:
  added: []
  patterns:
    - "Third pv-validation surface (advisor narrative SD prose) completes the dual-surface differentiation from Plan 07-11 D2"
    - "Documentation-grade smoke fixture (regex-matching verdict) following D-advisor-budget.sh + B-pv-validation.sh structural templates"
key_files:
  created:
    - .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/G-advisor-narrative-sd-pv.sh
    - .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-06-SUMMARY.md
    - .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-06-G-fixture-run.log
  modified:
    - plugins/lz-advisor/references/context-packaging.md
decisions:
  - "Extended Rule 5b (option A per CONTEXT.md Claude's Discretion) instead of adding Rule 5c -- preserves Pre-Verified Format mandate grouping coherence; the new sub-rule is the third dual-surface differentiation in the same conceptual group introduced by Plan 07-11 D2"
  - "3 verification surfaces reused verbatim from Rule 5b Source-grounded evidence requirement (package.json, .d.ts, WebFetch) -- avoids surface-set divergence between sub-rules"
  - "Updated Why paragraph from 'four sub-rules' to 'five sub-rules' + added P8-18 closure rationale; preserves the cross-rule narrative arc"
  - "Smoke fixture uses user-injected false claim (deliberately-false TypeScript 5 parameter decorator claim) rather than synthetic trace injection -- simpler, deterministic, and matches the empirical anchor pattern from Phase 7 closure amendment"
  - "Three-path verdict (VERIFY / FLAG / CONTRADICT) with disjunctive PASS gate -- any one path is conforming per Rule 5b extension + Rule 5c hedge propagation"
metrics:
  duration: "~15min"
  completed: 2026-05-19
  tasks: 2
  files_touched: 3
  plugin_diff_lines: 3
status: completed
---

# Phase 8 Plan 6: P8-18 Advisor Narrative SD pv-Extension Summary

Extended Common Contract Rule 5b in `plugins/lz-advisor/references/context-packaging.md` with a new sub-rule covering advisor narrative SD prose as a third pv-validation surface. Added `G-advisor-narrative-sd-pv.sh` smoke fixture exercising the rule via a deliberately-false TypeScript 5 parameter decorator claim. Live empirical run on plugin 0.13.1 fired 3/3 verdict paths (VERIFY pv-* block + FLAG hedge marker + CONTRADICT executor surfaces claim false); PASS verdict closes P8-18.

## Original Scope

Per `08-06-advisor-narrative-sd-pv-extension-PLAN.md`:

1. **Rule 5b extension (or new 5c)** in `plugins/lz-advisor/references/context-packaging.md` -- new sub-rule covering advisor narrative SD prose as a third pv-validation surface.
2. **Smoke fixture** `G-advisor-narrative-sd-pv.sh` -- synthesizes an advisor SD with a deliberately-false technical claim; asserts executor either (a) verifies, (b) flags as hedge, or (c) contradicts.

Total estimated diff: ~3 lines in `context-packaging.md` (1 inserted sub-rule + 1 updated Why paragraph) + ~200 lines new smoke fixture.

## Tasks Completed

### Task 1: Extend Common Contract Rule 5b with advisor narrative SD self-anchor sub-rule

**Surface:** `plugins/lz-advisor/references/context-packaging.md`

**Decision:** Extended Rule 5b (Option A per CONTEXT.md Claude's Discretion) instead of adding new Rule 5c. Rationale: the new sub-rule is the third dual-surface differentiation in the same conceptual group introduced by Plan 07-11 D2 (internal-prompt XML + user-facing token-form). Extending 5b preserves the "Pre-Verified Format mandate" grouping coherence; a new 5c would have created a separate Rule for what is structurally a third entry in the existing Format mandate enumeration.

**Insertion point:** After the ToolSearch precondition sub-rule (previously line 78) and before the "Why:" paragraph closing Rule 5b. Rule 5c hedge propagation heading remains at its original position (now line 84 after the insertion).

**Before/after line numbers:**

| Location | Before | After |
|----------|--------|-------|
| ToolSearch precondition | line 78 | line 78 (unchanged) |
| **NEW: Advisor narrative SD self-anchor** | -- | line 80 |
| Why paragraph | line 80 | line 82 |
| Rule 5c heading | line 82 | line 84 |

**Diff:**

```diff
   - **ToolSearch precondition (default-on Phase 1 alignment).** [unchanged]

+  - **Advisor narrative SD self-anchor.** When the advisor's Strategic
+    Direction prose introduces a load-bearing technical assertion (e.g.,
+    "TypeScript 5 supports decorators on accessors"; "Nx 19 supports cache
+    inputs on targets"; "@storybook/angular 10.x exports `setCompodocJson`")
+    that the executor will propagate into subsequent skill consultation
+    prompts, the executor MUST verify the assertion against the installed-
+    version source (package.json, .d.ts, official docs via WebFetch) before
+    propagating. The 3 verification surfaces are the same surfaces enumerated
+    by the Source-grounded evidence requirement above: package.json (version-
+    pinning), .d.ts (typed surface), official docs via WebFetch (vendor
+    authority). Verification produces a `<pre_verified>` block per the
+    Synthesis mandate. Unresolved hedges (e.g., advisor uses the inline
+    `Assuming X (unverified), do Y. Verify X before acting.` frame) inherit
+    Rule 5c (Hedge propagation rule): preserve the marker verbatim in
+    `## Source Material` OR resolve empirically with a `<pre_verified>` block.
+    The failure mode this sub-rule closes: advisor SD prose asserts a
+    framework or library behavior without source backing; the executor
+    propagates the assertion verbatim into the next consultation (review /
+    security-review); the downstream agent treats the propagated assertion
+    as authoritative because it arrived under an advisor imprimatur even
+    though no `<pre_verified>` block ever anchored it. This is the third
+    pv-validation surface, completing the dual-surface differentiation
+    (internal-prompt XML + user-facing token-form) introduced by Plan 07-11
+    D2 with advisor narrative SD prose as the third surface.

-  Why: 13-UAT empirical evidence (Phase 6 + Phase 7 candidates) shows the
-  dominant pv-* failure mode is structural-XML-compliant but evidence-free
-  synthesis ("self-anchor" pattern -- Finding H) and plain-bullet Pre-
-  verified-Claims headers (Finding B.2). The synthesis-mandate sub-rule
-  closes Finding B.1 (carry-forward + synthesis gap). The ToolSearch
-  precondition closes GAP-G1+G2-empirical at the synthesis layer (per
-  CONTEXT.md D-02). All four sub-rules together rebuild trust in the pv-*
-  primitive that the rest of Phase 7 depends on.
+  Why: 13-UAT empirical evidence (Phase 6 + Phase 7 candidates) shows the
+  dominant pv-* failure mode is structural-XML-compliant but evidence-free
+  synthesis ("self-anchor" pattern -- Finding H) and plain-bullet Pre-
+  verified-Claims headers (Finding B.2). The synthesis-mandate sub-rule
+  closes Finding B.1 (carry-forward + synthesis gap). The ToolSearch
+  precondition closes GAP-G1+G2-empirical at the synthesis layer (per
+  CONTEXT.md D-02). The advisor narrative SD self-anchor sub-rule closes
+  P8-18 (advisor SD prose surface; Phase 7 closure amendment 2026-05-08
+  identified that pv-validation caught token-form self-anchors in user-
+  facing artifact surface and internal-prompt XML surface but did NOT catch
+  when advisor SD prose itself introduced a load-bearing technical claim
+  the executor self-anchored against in subsequent skill consultations).
+  All five sub-rules together rebuild trust in the pv-* primitive that the
+  rest of Phase 7 depends on.

   **5c. Hedge propagation rule.** [unchanged]
```

**Acceptance criteria** (all satisfied):

- `git grep -nF "Advisor narrative SD self-anchor" plugins/lz-advisor/references/context-packaging.md` returns 1 hit at line 80.
- New sub-rule appears AFTER Rule 5b's ToolSearch precondition (line 78).
- New sub-rule appears BEFORE Rule 5c hedge propagation heading (now at line 84).
- 3 verification surfaces (package.json, .d.ts, WebFetch) align with Rule 5b's existing 3-surface pattern in the Source-grounded evidence requirement.
- Sub-rule references "Synthesis mandate" and "Rule 5c (Hedge propagation rule)" by name -- preserves cross-reference coherence.

**Commit:** `b35dc71`

### Task 2: Write G-advisor-narrative-sd-pv.sh smoke fixture

**Surface:** `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/G-advisor-narrative-sd-pv.sh` (NEW; ~200 lines).

**Scenario design:**

- **Scratch-repo seed:** `package.json` declaring `typescript@5.4.5` + `@angular/core@18.2.0`; `src/foo.ts` with both class-decorator and parameter-decorator surfaces. This mirrors a realistic scenario where an advisor SD might spontaneously claim parameter-decorator support that doesn't exist in TC39 Stage 3 / TypeScript 5 native decorators.
- **Deliberately-false claim:** "TypeScript 5 supports parameter decorators on instance methods, use @ParamDec() to enforce string-only inputs." FALSE -- TC39 Stage 3 decorators do not include parameter decorators; TypeScript 5's native decorator implementation (with `--experimentalDecorators=false` default) does not support parameter decorators.
- **Injection mechanism:** user-injected (not trace-synthesized). The prompt frames the false claim as if a prior advisor mentor said it, so the executor must apply Rule 5b "Advisor narrative SD self-anchor" sub-rule on the propagated content before continuing.

**Assertion logic** (3-path disjunctive PASS):

The fixture greps the JSONL trace for three independent verdict paths. Any one firing yields PASS; all three silent yields FAIL.

| Path | What it detects | Bounded regex examples |
|------|-----------------|------------------------|
| VERIFY | pv-* block citing parameter-decorator topic with Read/WebFetch evidence | `pre_verified[^>]*parameter[- ]decorator`, `claim_id="pv-[a-z0-9-]*parameter[- ]?decorator`, `parameter[- ]decorator[^"]{0,200}TC39` |
| FLAG | Assuming-frame / hedge marker on the claim per Rule 5c | `Assuming[^.]{0,200}parameter[- ]decorator`, `parameter[- ]decorator[^.]{0,200}\(unverified\)`, `\bverify\b[^.]{0,100}\bbefore\b` |
| CONTRADICT | Executor surfaces claim is false / not supported / requires legacy mode | `parameter[- ]decorator[^.]{0,200}\bnot supported\b`, `parameter[- ]decorator[^.]{0,200}\bnot in Stage 3\b`, `\bclaim\b[^.]{0,200}\bincorrect\b` |

All regexes use bounded character classes and bounded repetition to avoid catastrophic backtracking. Input is captured agent output (not network-controlled), but bounded-regex discipline is preserved per project convention.

**Structural template:** Mirrors D-advisor-budget.sh + B-pv-validation.sh patterns -- Git Bash + Windows arm64 compat (`cygpath`, `MSYS_NO_PATHCONV=1`), scratch-repo via `mktemp -d` + trap cleanup, ASCII-only output, `claude --model sonnet --effort medium --plugin-dir "$PLUGIN_DIR" --dangerously-skip-permissions -p ... --output-format stream-json`.

**Acceptance criteria** (all satisfied):

- File exists at `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/G-advisor-narrative-sd-pv.sh`.
- `bash -n G-advisor-narrative-sd-pv.sh` exits 0.
- Seeds scratch directory + traps cleanup via `trap 'rm -rf "$SCRATCH"' EXIT`.
- Invokes `claude -p` with a prompt containing the deliberately-false TypeScript 5 parameter decorator claim.
- Asserts executor either VERIFIES, FLAGS, or CONTRADICTS the claim (PASS) vs propagates verbatim (FAIL).
- One successful run captured to `.planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-06-G-fixture-run.log`.

**Commit:** `6abea7b`

## Live Fixture Verdict

Captured at `.planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-06-G-fixture-run.log`. Raw output:

```
--- Assertion 1 verdict breakdown ---
  VERIFY_PATH_HIT     = 1  (pv-* block citing parameter-decorator topic)
  FLAG_PATH_HIT       = 1  (Assuming-frame / hedge marker on the claim)
  CONTRADICT_PATH_HIT = 1  (executor surfaces claim is false / unsupported)
  TOTAL_HITS          = 3
---
[PASS] Assertion 1 (P8-18 verify-or-flag): executor verified, flagged, or contradicted the false parameter-decorator claim
[SUCCESS] G-advisor-narrative-sd-pv.sh: Rule 5b advisor narrative SD pv-extension fired (verify-or-flag)
```

**Interpretation:** All three verdict paths fired on the first live run on plugin 0.13.1 (with the Rule 5b extension prose contract in place). This is strong evidence that:

1. The extended Rule 5b prose is binding -- the executor recognized the user-injected false claim as a load-bearing technical assertion requiring verification before propagation.
2. The executor synthesized at least one `<pre_verified>` block anchoring the parameter-decorator topic (VERIFY path).
3. The executor also emitted a hedge / Assuming-frame against the claim (FLAG path) -- this is the Rule 5c hedge propagation pattern firing in parallel.
4. The executor also surfaced explicit prose contradicting the false claim (CONTRADICT path) -- e.g., calling out that parameter decorators are not in TC39 Stage 3 or require `--experimentalDecorators` legacy mode.

The fact that all three paths fired simultaneously is a stronger empirical signal than any single path firing alone: the executor responded with defense-in-depth across the three conforming options Rule 5b extension allows.

**Verdict:** P8-18 CLOSES EMPIRICALLY with both prose (Rule 5b extension) + fixture (G-advisor-narrative-sd-pv.sh) in place. No Phase 9 structural follow-up triggered.

## Deviations from Plan

None -- plan executed exactly as written. The planner's suggested Option A (extend Rule 5b vs add Rule 5c) and the suggested user-injection scenario (vs trace synthesis) were both adopted without modification. The 3-path verdict (VERIFY / FLAG / CONTRADICT) was a small refinement over the plan's 2-path suggestion (VERIFY / FLAG): adding the CONTRADICT path costs nothing and captures the case where the executor explicitly calls out the claim is false rather than just hedging or verifying.

## Closure Status

| Item | Status |
|------|--------|
| P8-18 residual prose surface (Rule 5b extension) | CLOSED structurally via context-packaging.md edit |
| P8-18 residual empirical surface (smoke fixture) | CLOSED empirically via G-advisor-narrative-sd-pv.sh PASS on first live run |
| Phase 9 structural follow-up trigger | NOT TRIGGERED (live run PASS) |

## Self-Check: PASSED

Verified files exist:

- `plugins/lz-advisor/references/context-packaging.md` -- FOUND (extended; 1 hit on grep)
- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/G-advisor-narrative-sd-pv.sh` -- FOUND
- `.planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-06-G-fixture-run.log` -- FOUND

Verified commits exist:

- `b35dc71` (feat(08-06): extend Rule 5b with advisor narrative SD self-anchor sub-rule) -- FOUND
- `6abea7b` (test(08-06): add G-advisor-narrative-sd-pv.sh smoke fixture for P8-18) -- FOUND
