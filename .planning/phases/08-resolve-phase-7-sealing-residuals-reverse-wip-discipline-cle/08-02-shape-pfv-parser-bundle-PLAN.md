---
phase: 08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-reviewer-budget.sh
  - .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-security-reviewer-budget.sh
autonomous: true
requirements: [RES-SHAPE-REGRESSION-PARSER, RES-PFV-OUTLIER-CAP]
requirements_addressed: [RES-SHAPE-REGRESSION-PARSER, RES-PFV-OUTLIER-CAP]
target_version_at_merge: 0.14.0
tags: [smoke-fixture-parser, regex-change, threshold-change, trace-replay]

must_haves:
  truths:
    - "Smoke parser FRAGMENT_RE in D-reviewer-budget.sh accepts backtick-wrapped finding lines"
    - "Smoke parser FRAGMENT_RE in D-security-reviewer-budget.sh accepts backtick-wrapped finding lines (with severity bracket prefix preserved)"
    - "All 9 captured shape-regression traces FLIP from FAIL to PASS under the new regex (--from-trace replay)"
    - "D-security-reviewer-budget.sh PFV outlier_soft_cap raised from 66w to 75w (covers max observed 77w with -2w margin)"
    - "3 fresh claude -p re-runs of D-security-reviewer-budget.sh PASS without PFV-related FAIL"
    - "Capture group preserved in regex so per-item word counting downstream still works"
  artifacts:
    - path: ".planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-reviewer-budget.sh"
      provides: "FRAGMENT_RE regex on line 154 updated with optional leading/trailing backtick"
      contains: "/^\\`?[^:\\s]+:\\\\d+(?:-\\\\d+)?:\\\\s+(?:crit|imp|sug|q):\\\\s+(.+?)\\`?$/gm"
    - path: ".planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-security-reviewer-budget.sh"
      provides: "FRAGMENT_RE regex on line 154 + PFV cap on line 238 updated"
      contains: "outlier_soft_cap=75 (or 80 per Claude's Discretion)"
  key_links:
    - from: "9 captured trace files in .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/traces/"
      to: "D-{reviewer,security-reviewer}-budget.sh --from-trace replay"
      via: "trace-replay infrastructure (Plan 07-15)"
      pattern: "bash D-.*-budget.sh --from-trace traces/.*\\.txt"
---

<objective>
Close P1 SHAPE + PFV residuals from `closure_amendment_2026_05_08_uat_replay_0_13_1`. Two coordinated parser-layer changes in two smoke fixtures:

1. **SHAPE (RES-SHAPE-REGRESSION-PARSER):** Loosen FRAGMENT_RE regex in `D-reviewer-budget.sh` and `D-security-reviewer-budget.sh` to accept optional leading + trailing backtick wrappers on fragment-grammar finding lines. Validated zero-cost via `--from-trace` replay against 9 captured shape-regression FAIL traces (must FLIP from FAIL to PASS).

2. **PFV (RES-PFV-OUTLIER-CAP):** Raise `outlier_soft_cap` on `D-security-reviewer-budget.sh` per-finding-validation check from 66w to 75w (Claude's Discretion: 75w if n=3 mean is in [60w, 75w]; 80w if mean is in [70w, 78w]). Asymmetric raise (security-reviewer only) per CONTEXT.md default; symmetric raise (D-reviewer too) only if n=3 D-reviewer re-runs surface PFV outliers in [60w, 75w]. PFV change cannot be trace-replay validated; requires n=3 fresh `claude -p` re-runs.

Purpose: Eliminate fixture-parser-layer false negatives (SHAPE) + accommodate empirically observed CVE-class auto-clarity findings up to 77w (PFV). Both are zero plugin-surface changes.

Output: 2 modified smoke fixtures; 9-trace `--from-trace` replay green; 3 fresh `claude -p` re-runs green on PFV path.
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

<interfaces>
<!-- Key regex contracts the executor needs. Extracted from 08-RESEARCH.md code-examples section. -->

Current FRAGMENT_RE in D-reviewer-budget.sh:154 (rejects backtick-wrapped lines per shape-regression FAIL traces):
```javascript
const FRAGMENT_RE = /^[^:\s]+:\d+(?:-\d+)?:\s+(?:crit|imp|sug|q):\s+(.+)$/gm;
```

Proposed FRAGMENT_RE replacement (preserves capture group + accepts optional backtick wrappers):
```javascript
const FRAGMENT_RE = /^`?[^:\s]+:\d+(?:-\d+)?:\s+(?:crit|imp|sug|q):\s+(.+?)`?$/gm;
```

Current FRAGMENT_RE in D-security-reviewer-budget.sh:154 (note severity-bracket prefix `\[[A-Za-z0-9\-]+\]`):
```javascript
const FRAGMENT_RE = /^[^:\s]+:\d+(?:-\d+)?:\s+(?:crit|imp|sug|q):\s+\[[A-Za-z0-9\-]+\]\s+(.+)$/gm;
```

Proposed replacement:
```javascript
const FRAGMENT_RE = /^`?[^:\s]+:\d+(?:-\d+)?:\s+(?:crit|imp|sug|q):\s+\[[A-Za-z0-9\-]+\]\s+(.+?)`?$/gm;
```

Current PFV cap structure (D-security-reviewer-budget.sh:238-244):
```javascript
if (wc > 66) {
  console.log(`[ERROR] Per-finding validation entry ${idx + 1}: ${wc} words (>66 outlier soft cap; target <=60w)`);
  bad++;
} else if (wc > 60) {
  console.log(`[WARN] Per-finding validation entry ${idx + 1}: ${wc} words (>60 target but <=66 outlier; acceptable)`);
}
```

Proposed (75w; default per CONTEXT.md "covers max observed 77w UAT outlier with -2w margin"):
```javascript
if (wc > 75) {
  console.log(`[ERROR] Per-finding validation entry ${idx + 1}: ${wc} words (>75 outlier soft cap; target <=60w)`);
  bad++;
} else if (wc > 60) {
  console.log(`[WARN] Per-finding validation entry ${idx + 1}: ${wc} words (>60 target but <=75 outlier; acceptable)`);
}
```

Available trace files (9 total in `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/traces/`):
- 0.13.0-strict-D-reviewer-budget-run-2.txt
- 0.13.0-strict-D-security-reviewer-budget-run-2.txt
- 0.13.0-strict-D-security-reviewer-budget-run-3.txt
- 4 additional 0.13.1-strict traces (read directory at execution time to enumerate)
- 4 additional 0.13.1-tolerance traces (read directory at execution time to enumerate)
</interfaces>
</context>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| smoke fixture parser <- captured trace | Input is producer-controlled (claude -p stdout / captured trace file). No network input. |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-8-02-01 | DoS / Tampering (ReDoS) | New FRAGMENT_RE pattern | mitigate | Proposed regex `/^\\`?[^:\\s]+:\\d+(?:-\\d+)?:\\s+(?:crit|imp|sug|q):\\s+(.+?)\\`?$/gm` is non-catastrophic-backtracking: anchors bound the line; non-greedy `(.+?)` does not enable ReDoS because the alternation set is finite; no nested quantifiers. Verified by manual structural review. Input is producer-controlled (claude -p output or captured traces in `traces/`), not user-supplied via network. |
| T-8-02-02 | Elevation of Privilege | --from-trace argument | accept | Trace paths are passed as `--from-trace <file>` argument; bash `case` statement parses them as literal strings (D-reviewer-budget.sh lines 33-40). No shell expansion of trace content. Existing mitigation preserved. |
</threat_model>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Loosen FRAGMENT_RE regex in D-reviewer-budget.sh + verify via --from-trace replay against captured traces</name>
  <files>.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-reviewer-budget.sh</files>
  <read_first>
    - .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-reviewer-budget.sh (current 305-line content; focus line 154 FRAGMENT_RE + lines 30-87 --from-trace handler)
    - .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/traces/ (list contents; identify all D-reviewer-budget trace files: at minimum 0.13.0-strict-D-reviewer-budget-run-2.txt + 0.13.1 traces; planner must enumerate at exec time)
    - .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-RESEARCH.md (Plan 2 Code Examples section + Pitfall 1 + Architecture Pattern 2 trace-replay)
    - .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-CONTEXT.md (D-01 Plan 2 description + Claude's Discretion symmetric vs asymmetric PFV cap note)
  </read_first>
  <action>
    1. Replicate the FAIL first (Pitfall 1 verification step). Run the unmodified parser against the captured trace before changing anything:
       ```
       bash .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-reviewer-budget.sh --from-trace .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/traces/0.13.0-strict-D-reviewer-budget-run-2.txt
       ```
       Capture the FAIL output and the specific assertion that breaks. If the parser actually passes against the trace (against expectation), STOP and report -- the SHAPE FAIL mode is then elsewhere and this plan needs re-scoping.

    2. Edit `D-reviewer-budget.sh` line 154. Current:
       ```javascript
       const FRAGMENT_RE = /^[^:\s]+:\d+(?:-\d+)?:\s+(?:crit|imp|sug|q):\s+(.+)$/gm;
       ```
       New:
       ```javascript
       const FRAGMENT_RE = /^`?[^:\s]+:\d+(?:-\d+)?:\s+(?:crit|imp|sug|q):\s+(.+?)`?$/gm;
       ```
       Critical: the capture group `(.+?)` MUST be preserved (non-greedy version of `(.+)`) so the per-item word counting downstream (`m[1].trim()`) still works. The trailing optional backtick `` `? `` consumes the trailing wrap without entering the capture.

    3. Run --from-trace replay against EVERY D-reviewer-related trace in `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/traces/`. Each invocation must exit 0 (FLIP from FAIL to PASS):
       ```
       for trace in .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/traces/*D-reviewer-budget*.txt; do
         echo "=== $trace ==="
         bash .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-reviewer-budget.sh --from-trace "$trace" || echo "FAIL: $trace"
       done
       ```
       Capture per-trace verdict; if any trace stays in FAIL, halt the plan and inspect.

    4. Run the fixture in NORMAL mode (no --from-trace) against the live plugin to confirm zero regression on the canonical path:
       ```
       bash .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-reviewer-budget.sh
       ```
       (This spawns `claude -p` so cost ~0.50; only one fresh re-run needed for SHAPE verification because the regex change is purely additive -- accepts more shapes, rejects no previously-passing shape.)

    5. **PFV symmetric raise decision:** if the normal-mode run from step 4 surfaces any D-reviewer PFV entries in `[60w, 75w]` (visible in the script's `[WARN] Per-finding validation entry` log lines), apply the symmetric PFV cap raise to D-reviewer-budget.sh too (mirror the D-security-reviewer change in Task 2 to D-reviewer line 238 or analog -- READ the script to find exact line number; it has the SAME structure per RESEARCH A7). If no D-reviewer PFV outliers in that band, stay asymmetric (D-security-reviewer only -- handled in Task 2). Record the decision in the task SUMMARY.

    Use Edit tool for the regex change. Do NOT use heredoc.
  </action>
  <verify>
    <automated>for trace in .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/traces/*D-reviewer-budget*.txt; do bash .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-reviewer-budget.sh --from-trace "$trace" || exit 1; done</automated>
  </verify>
  <acceptance_criteria>
    - `bash D-reviewer-budget.sh --from-trace <every-D-reviewer-trace>` exits 0 (FLIP from FAIL to PASS on captured traces)
    - The line 154 regex contains optional leading and trailing backticks: `/^\`?[^:\s]+:\d+(?:-\d+)?:\s+(?:crit|imp|sug|q):\s+(.+?)\`?$/gm`
    - The capture group `(m[1])` survives -- per-item word counting downstream still works
    - `bash D-reviewer-budget.sh` in normal mode exits 0 (no regression on canonical path)
    - Symmetric PFV raise decision documented (apply if D-reviewer PFV outlier observed in `[60w, 75w]`; otherwise asymmetric stays default)
  </acceptance_criteria>
  <done>
    D-reviewer-budget.sh accepts backtick-wrapped fragment-grammar shapes; all D-reviewer captured traces flip to PASS; symmetric vs asymmetric PFV decision recorded.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Loosen FRAGMENT_RE regex + raise PFV outlier_soft_cap in D-security-reviewer-budget.sh; verify via --from-trace + n=3 fresh re-runs</name>
  <files>.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-security-reviewer-budget.sh</files>
  <read_first>
    - .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-security-reviewer-budget.sh (current 303-line content; focus line 154 FRAGMENT_RE + lines 236-244 check-pfv-entries.mjs cap structure)
    - .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/traces/ (enumerate D-security-reviewer trace files; SHAPE + PFV variants)
    - .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-RESEARCH.md (Plan 2 Code Examples Surface 2 + PFV cap raise Option A/B + Pitfall 2 trace-replay limitation for PFV)
    - .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-CONTEXT.md (D-01 Plan 2 + Claude's Discretion PFV target value 75w vs 80w)
  </read_first>
  <action>
    1. Edit `D-security-reviewer-budget.sh` line 154 FRAGMENT_RE. Current:
       ```javascript
       const FRAGMENT_RE = /^[^:\s]+:\d+(?:-\d+)?:\s+(?:crit|imp|sug|q):\s+\[[A-Za-z0-9\-]+\]\s+(.+)$/gm;
       ```
       New (preserves the severity-bracket prefix `\[[A-Za-z0-9\-]+\]` between severity and body; adds optional leading + trailing backtick):
       ```javascript
       const FRAGMENT_RE = /^`?[^:\s]+:\d+(?:-\d+)?:\s+(?:crit|imp|sug|q):\s+\[[A-Za-z0-9\-]+\]\s+(.+?)`?$/gm;
       ```

    2. Edit `D-security-reviewer-budget.sh` PFV outlier_soft_cap at the `check-pfv-entries.mjs` heredoc (around lines 238-244 per RESEARCH; READ script to confirm exact line). Replace the `66`-threshold check with `75`-threshold (Claude's Discretion: pick 75w per default; if planner observes mean PFV in `[70w, 78w]` across the n=3 fresh re-runs, replace with 80w in a follow-up edit before declaring task done -- but default to 75w upfront since max observed is 77w).

       Current:
       ```javascript
       if (wc > 66) {
         console.log(`[ERROR] Per-finding validation entry ${idx + 1}: ${wc} words (>66 outlier soft cap; target <=60w)`);
         bad++;
       } else if (wc > 60) {
         console.log(`[WARN] Per-finding validation entry ${idx + 1}: ${wc} words (>60 target but <=66 outlier; acceptable)`);
       }
       ```

       New (75w):
       ```javascript
       if (wc > 75) {
         console.log(`[ERROR] Per-finding validation entry ${idx + 1}: ${wc} words (>75 outlier soft cap; target <=60w)`);
         bad++;
       } else if (wc > 60) {
         console.log(`[WARN] Per-finding validation entry ${idx + 1}: ${wc} words (>60 target but <=75 outlier; acceptable)`);
       }
       ```

    3. Run --from-trace replay against EVERY D-security-reviewer trace in `traces/`:
       ```
       for trace in .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/traces/*D-security-reviewer-budget*.txt; do
         echo "=== $trace ==="
         bash .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-security-reviewer-budget.sh --from-trace "$trace" || echo "FAIL: $trace"
       done
       ```
       SHAPE-failing traces must FLIP from FAIL to PASS. PFV-failing traces: trace-replay is NOT a valid verification for PFV (Pitfall 2 -- captured traces have PFV entries at fixed historical word counts; raising the cap reclassifies their status but the trace content is unchanged). PFV trace-replay may PASS or stay FAIL depending on whether the captured entries were over the old cap; this is informational only.

    4. Run n=3 fresh `claude -p` re-runs of the fixture in NORMAL mode:
       ```
       for i in 1 2 3; do
         echo "=== fresh run $i ==="
         bash .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-security-reviewer-budget.sh 2>&1 | tee /tmp/d-sec-run-$i.log
       done
       ```
       Each run must exit 0. Inspect `[WARN] Per-finding validation entry` and `[ERROR] Per-finding validation entry` lines; record the PFV word counts across all 3 runs.

    5. **PFV value retroactive check:** if max observed PFV across the 3 fresh runs is in `[70w, 78w]` (close to 75 but not far over), the 75w cap may be too tight. The planner may bump the cap to 80w in a follow-up edit and re-run n=1 more to validate. If max observed is <= 73w, 75w is sufficient and stays. Record the final value and rationale in the SUMMARY.

    Use Edit tool for both surgical edits (regex on line 154 + PFV cap on line ~238).
  </action>
  <verify>
    <automated>for trace in .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/traces/*D-security-reviewer-budget*.txt; do bash .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-security-reviewer-budget.sh --from-trace "$trace" || exit 1; done && for i in 1 2 3; do bash .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-security-reviewer-budget.sh || exit 1; done</automated>
  </verify>
  <acceptance_criteria>
    - The line 154 regex matches: `/^\`?[^:\s]+:\d+(?:-\d+)?:\s+(?:crit|imp|sug|q):\s+\[[A-Za-z0-9\-]+\]\s+(.+?)\`?$/gm`
    - PFV cap is 75 (or 80 if the planner reset based on n=3 distribution); the relevant `outlier soft cap` literal in the [ERROR] / [WARN] strings updated to match
    - All D-security-reviewer SHAPE-failing traces FLIP from FAIL to PASS under --from-trace replay
    - n=3 fresh re-runs (live claude -p) all exit 0
    - Final PFV cap value (75 vs 80) documented in task SUMMARY with justification (max observed PFV across 3 runs)
  </acceptance_criteria>
  <done>
    D-security-reviewer-budget.sh accepts backtick-wrapped + severity-bracket-preserved fragment-grammar shapes; PFV cap raised to 75w (or 80w post-hoc); 9-trace replay green on SHAPE-failing traces; 3 fresh re-runs green.
  </done>
</task>

</tasks>

<verification>
After both tasks complete:

1. Full --from-trace replay across all 9 trace files: every trace exits 0 under the new parsers.
2. Live n=3 D-security-reviewer-budget.sh re-runs: all PASS without PFV-related FAIL.
3. Live n=1 D-reviewer-budget.sh re-run (zero regression check): PASS.
4. Capture group preservation verified by inspecting the parsers' per-item word-count log lines (they print `${wc} words` and `${itemBody}` content; if these print malformed, the capture broke).
5. No plugin surface modified (only smoke fixtures).
</verification>

<success_criteria>
- SHAPE residual closed (parser accepts markdown-natural backtick wrapping)
- PFV residual closed (cap raised; max-observed 77w UAT outlier accommodated)
- Zero plugin spend other than n=3 + n=1 fresh re-runs (approximately $1.50 total at canonical claude -p rates)
- Closure_amendment_2026_05_08_uat_replay_0_13_1 P1 residuals retire
</success_criteria>

<output>
After completion, create `.planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-02-SUMMARY.md` documenting:
- SHAPE: regex before/after at exact line numbers (line 154 in both fixtures)
- SHAPE: --from-trace replay verdicts per captured trace (9 traces, FLIP table)
- PFV: cap value chosen (75 vs 80) + rationale (n=3 max-observed distribution)
- PFV: n=3 fresh re-run verdicts + per-run max PFV word count
- Symmetric vs asymmetric decision: applied symmetric raise to D-reviewer? Yes/No + evidence
- Total claude -p spend
- Pitfall 2 note: PFV trace-replay is informational only, not a verification (captured traces have fixed historical word counts)
</output>