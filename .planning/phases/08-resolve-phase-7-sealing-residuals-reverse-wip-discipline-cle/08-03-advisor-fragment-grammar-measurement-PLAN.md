---
phase: 08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle
plan: 03
type: execute
wave: 2
depends_on: [02]
files_modified:
  - .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-advisor-budget.sh
  - .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-MEASUREMENT.md
  - .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/measurement-collator.mjs
autonomous: true
requirements: [RES-ADVISOR-FRAGMENT-GRAMMAR]
requirements_addressed: [RES-ADVISOR-FRAGMENT-GRAMMAR]
target_version_at_merge: 0.14.0
tags: [measurement, parser-extension, fixture-grade, compound-or-gate]

must_haves:
  truths:
    - "D-advisor-budget.sh parser emits per-item structured log line `[ITEM] idx=N wc=W frame=0/1 codeblock=0/1` for each finding"
    - "08-MEASUREMENT.md exists with full schema: scenarios table, per-run results table, gate decision (PASS/FAIL/INCONCLUSIVE)"
    - "n=3 fresh fixture-grade sessions executed across Compodoc + feature + refactor scenarios"
    - "Gate decision is mechanical per D-02 compound OR-gate: D1 (code-block) + D2 (aggregate) disjuncts evaluated independently with >=2/3 FAIL guard"
    - "Disposition recorded: D1 alone -> fragment-grammar extension; D2 alone -> density audit; both -> both; neither -> P2 closes structurally"
    - "If INCONCLUSIVE at n=3 per D-02 borderline band, Plan 3.5 auto-spawn is recommended (n=2 more for total n=5)"
  artifacts:
    - path: ".planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-advisor-budget.sh"
      provides: "Extended parser with code-block flag detection + structured log emission"
      contains: "CODE_BLOCK_RE regex + [ITEM] log line format"
    - path: ".planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-MEASUREMENT.md"
      provides: "Durable measurement artifact: scenarios + per-run data + gate decision + disposition"
      contains: "n=3 (or n=5) measurement results; PASS / FAIL / INCONCLUSIVE verdict"
    - path: ".planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/measurement-collator.mjs"
      provides: "Node ESM script that aggregates n runs of D-advisor-budget.sh stdout into MEASUREMENT.md schema"
      contains: "exit 0 on success"
  key_links:
    - from: "D-advisor-budget.sh [ITEM] log lines"
      to: "measurement-collator.mjs"
      via: "stdin pipe or per-trace file read"
      pattern: "\\[ITEM\\] idx=.*wc=.*frame=.*codeblock="
    - from: "measurement-collator.mjs"
      to: "08-MEASUREMENT.md"
      via: "schema-conformant markdown emission"
      pattern: "## Per-run results"
---

<objective>
P2 measurement plan for RES-ADVISOR-FRAGMENT-GRAMMAR. Plan 07-16 fixture-grade evidence (155w / 100w cap on session-1-plan.jsonl; items 3, 5, 7 over per-item cap with inline code) is n=1 only -- insufficient to justify structural advisor redesign. This plan gathers n>=3 fresh fixture-grade evidence across heterogeneous scenarios (Compodoc + feature + refactor) per Plan 07-12 stochastic-outlier-guard precedent, then evaluates D-02 compound OR-gate to determine whether Plan 4 (structural conditional) ships.

Two sub-deliverables:
1. **Parser extension:** Extend `D-advisor-budget.sh` to emit per-item structured log `[ITEM] idx=N wc=W frame=0/1 codeblock=0/1` so a collator script can aggregate n runs.
2. **Measurement:** Run n=3 fresh `claude -p` sessions on the 3 scenarios; aggregate via `measurement-collator.mjs`; emit `08-MEASUREMENT.md` with full schema + gate decision + disposition.

Compound OR-gate (D-02):
- **D1 (code-block disjunct):** >=2/3 runs have >=1 code-block item over per-item hard cap (15w fragment / 22w Assuming-frame).
- **D2 (aggregate disjunct):** mean aggregate >100w (no tolerance) AND >=2/3 per-run aggregate >110w (+10% tolerance).
- Each disjunct independently carries the >=2/3 FAIL stochastic-outlier guard.

Disposition:
- D1 alone -> Plan 4 = fragment-grammar template extension
- D2 alone -> Plan 4 = density example audit
- Both -> Plan 4 ships both
- Neither -> Plan 4 does NOT ship; P2 closes structurally
- Auto-extend (D-03): if INCONCLUSIVE at n=3 per borderline band, recommend Plan 3.5 (n=2 more).

Purpose: Mechanical evidence-based gate decision. No structural change to plugin until n>=3 data justifies it.

Output: `08-MEASUREMENT.md` durable audit record; parser extension; gate decision documented.
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
@.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-16-SUMMARY.md
@.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-10-SUMMARY.md
@.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-12-SUMMARY.md

<interfaces>
<!-- Key parser contracts extracted from 08-RESEARCH.md Plan 3 code-examples + D-advisor-budget.sh current structure -->

Current per-item loop in D-advisor-budget.sh:113-138 (check-advisor-items.mjs heredoc):
```javascript
matches.forEach((m, idx) => {
  const itemBody = m[1].trim();
  const wc = itemBody.split(/\s+/).filter(Boolean).length;
  const isFrame = ASSUMING_FRAME_RE.test(itemBody);
  total++;
  aggregateWc += wc;

  if (isFrame) {
    // ... per-frame logging
  } else {
    // ... per-item logging
  }
});
```

Proposed extension (Plan 07-10 fragment-grammar template canon preserved; only ADDs structured log emission):
```javascript
// Code-block detection: backtick-fenced (single, triple, 4+), <code> HTML tags, indented 4+ spaces.
const CODE_BLOCK_RE = /`[^`]+`|`{3,}|<code[\s>]|\n {4,}/;

matches.forEach((m, idx) => {
  const itemBody = m[1].trim();
  const wc = itemBody.split(/\s+/).filter(Boolean).length;
  const isFrame = ASSUMING_FRAME_RE.test(itemBody);
  const hasCodeBlock = CODE_BLOCK_RE.test(itemBody);
  total++;
  aggregateWc += wc;

  // ... existing per-item logging (unchanged)

  // NEW: structured log for 08-MEASUREMENT.md ingestion
  console.log(`[ITEM] idx=${idx+1} wc=${wc} frame=${isFrame ? 1 : 0} codeblock=${hasCodeBlock ? 1 : 0}`);
});
```

D-02 compound OR-gate evaluation logic:
- **D1 evaluation:** count runs where >=1 (codeblock=1 AND wc>15) item OR >=1 (codeblock=1 AND frame=1 AND wc>22) item. If >=2/3 -> FAIL on D1.
- **D2 evaluation:** mean(aggregate_per_run) -- if >100 AND count(aggregate>110) >=2/3 -> FAIL on D2.
- D-02 borderline (INCONCLUSIVE if mean in [98w, 105w] AND per-run pattern non-decisive, etc.).

08-MEASUREMENT.md schema (Pitfall 3 of RESEARCH):
```markdown
# 08-MEASUREMENT.md: P2-ADVISOR fixture-grade measurement

## Scenarios

| # | Scenario | Prompt | Trace path |
|---|----------|--------|------------|
| 1 | Compodoc | (canonical from memory: project_compodoc_uat_initial_plan_prompt.md) | uat-replay-0.14.x/scenario-1.jsonl |
| 2 | Feature implementation | add a debounced search input component to my Angular library | uat-replay-0.14.x/scenario-2.jsonl |
| 3 | Refactor | extract a shared validation utility from these 3 components | uat-replay-0.14.x/scenario-3.jsonl |

## Per-run results

| Run | Scenario | Aggregate (w) | Per-item words (csv) | Per-item code-block flag | Per-item assuming-frame flag | Per-item over-cap? |
| ... |          |               |                      |                          |                              |                    |

## Gate decision

- D1 (code-block disjunct): {PASS|FAIL|INCONCLUSIVE} -- X/3 runs have >=1 code-block item over per-item cap
- D2 (aggregate disjunct): {PASS|FAIL|INCONCLUSIVE} -- mean aggregate = Yw; Z/3 per-run aggregate >110w
- Compound: {PASS|FAIL|INCONCLUSIVE}
- Disposition: {N/A | fragment-grammar template extension | density example audit | both atomic | escalation to <output_constraints> XML}

## Recommendation
- Plan 4 ships: {YES | NO | conditional on Plan 3.5}
- If INCONCLUSIVE: Plan 3.5 auto-extend to n=5 (D-03)
```

Compodoc prompt (locked per memory `project_compodoc_uat_initial_plan_prompt.md`; use VERBATIM, do not paraphrase):
```
/lz-advisor.plan Set up Compodoc with Storybook in this Nx Angular library. Add a sample input and a sample output to our component using the input() and output() signal functions. The Docs tab should render JSDoc descriptions for the component, the input, and the output.
```

Feature implementation prompt (CONTEXT.md suggested):
```
/lz-advisor.plan Add a debounced search input component to my Angular library. It should use the signal-based control flow, accept placeholder text, and emit search events after 300ms debounce.
```

Refactor prompt (CONTEXT.md suggested):
```
/lz-advisor.plan Extract a shared validation utility from these 3 components: UserForm, AddressForm, PaymentForm. Each currently has duplicate email + phone + zipcode validators. Place the shared utility in libs/shared-validators.
```
</interfaces>
</context>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| smoke fixture <- captured trace + live claude -p stdout | Producer-controlled inputs only; no network input |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-8-03-01 | N/A | Plan 3 measurement | accept | No new attack surface -- read-only measurement; parser extension adds boolean flag emission only. CODE_BLOCK_RE pattern `/[^]+|{3,}|<code[\s>]|\n {4,}/` is non-catastrophic-backtracking; bounded character classes; no nested quantifiers on user-controlled input (input is captured agent output, not network input). |
</threat_model>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Extend D-advisor-budget.sh parser with code-block flag detection + structured [ITEM] log emission</name>
  <files>.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-advisor-budget.sh</files>
  <read_first>
    - .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-advisor-budget.sh (current 190-line content; focus lines 89 ADVISOR_FRAGMENT_RE + line 96 ASSUMING_FRAME_RE + lines 100-141 check-advisor-items.mjs heredoc with per-item loop)
    - .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-10-SUMMARY.md (fragment-grammar emit template canon + per-item caps 15w / 22w)
    - .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-RESEARCH.md (Plan 3 Code Examples section + Claude's Discretion code-block detection regex)
    - .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-CONTEXT.md (D-02 D1 code-block disjunct definition; Claude's Discretion code-block detection regex)
  </read_first>
  <action>
    Edit `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-advisor-budget.sh` to extend the parser:

    1. Read the script first to find the exact line numbers of:
       - `ADVISOR_FRAGMENT_RE` (line 89 per RESEARCH)
       - `ASSUMING_FRAME_RE` (line 96 per RESEARCH)
       - The `matches.forEach((m, idx) => { ... });` loop in `check-advisor-items.mjs` heredoc (lines ~100-141)

    2. Above the `matches.forEach()` loop (right after `ASSUMING_FRAME_RE` definition or where the regex constants live), add:
       ```javascript
       // Code-block detection: backtick-fenced (single, triple, 4+), <code> HTML tags, indented 4+ spaces.
       const CODE_BLOCK_RE = /`[^`]+`|`{3,}|<code[\s>]|\n {4,}/;
       ```

    3. Inside the `matches.forEach()` loop, immediately after the `isFrame` line, add:
       ```javascript
       const hasCodeBlock = CODE_BLOCK_RE.test(itemBody);
       ```

    4. After the existing per-item logging in the same `forEach` body, add the structured log emission:
       ```javascript
       // Structured log for 08-MEASUREMENT.md ingestion
       console.log(`[ITEM] idx=${idx+1} wc=${wc} frame=${isFrame ? 1 : 0} codeblock=${hasCodeBlock ? 1 : 0}`);
       ```

    5. After the `forEach` loop ends (before the script exits with aggregate output), add an aggregate log:
       ```javascript
       console.log(`[AGGREGATE] total=${total} aggregate_wc=${aggregateWc}`);
       ```

    6. Preserve ALL existing per-item logging (the human-readable `[ERROR] ...` / `[WARN] ...` lines) for human auditability.

    7. Run `bash -n D-advisor-budget.sh` to confirm bash syntax.

    8. Regression-test: run `bash D-advisor-budget.sh --from-trace <existing-advisor-trace>` if any advisor trace exists in `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/traces/` or `.planning/phases/05.6-.../uat-plan-07-rerun/`. The parser must still PASS / FAIL identically on the trace; the only addition is the `[ITEM]` and `[AGGREGATE]` log lines.

    Use Edit tool for surgical insertions; the existing per-item logging is preserved verbatim.
  </action>
  <verify>
    <automated>bash -n .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-advisor-budget.sh && grep -n "CODE_BLOCK_RE\|\\[ITEM\\] idx=" .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-advisor-budget.sh</automated>
  </verify>
  <acceptance_criteria>
    - `bash -n D-advisor-budget.sh` exits 0
    - `git grep -n "CODE_BLOCK_RE" .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-advisor-budget.sh` returns at least 2 hits (definition + use)
    - `git grep -nF "[ITEM] idx=" .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-advisor-budget.sh` returns 1+ hits (the structured log emission)
    - `git grep -nF "[AGGREGATE]" .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-advisor-budget.sh` returns 1+ hits
    - Existing per-item `[ERROR]` / `[WARN]` logging preserved (regression-test: parser still passes/fails identically on captured traces)
  </acceptance_criteria>
  <done>
    Parser emits structured per-item flags + aggregate; existing assertions intact.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Write measurement-collator.mjs + run n=3 fresh fixture-grade sessions on Compodoc + feature + refactor scenarios + emit 08-MEASUREMENT.md</name>
  <files>.planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/measurement-collator.mjs, .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-MEASUREMENT.md, .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/uat-replay-0.14.x/ (new directory + 3 trace files)</files>
  <read_first>
    - .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-advisor-budget.sh (the extended parser from Task 1)
    - .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-RESEARCH.md (Plan 3 + Pitfall 3 schema + Open Question 2 prompts)
    - .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-CONTEXT.md (D-02 compound OR-gate + disposition rule + borderline band)
    - C:/Users/LarsGyrupBrinkNielse/.claude/projects/D--projects-github-LayZeeDK-lz-advisor-claude-plugins/memory/project_compodoc_uat_initial_plan_prompt.md (canonical Compodoc prompt)
  </read_first>
  <action>
    Part A: Create `.planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/measurement-collator.mjs`

    This Node ESM script aggregates the n run logs (output captured from claude -p sessions piped through the extended D-advisor-budget.sh parser) into the 08-MEASUREMENT.md schema. Suggested structure (planner adapts):
    ```javascript
    #!/usr/bin/env node
    // Usage: node measurement-collator.mjs <run1.log> <run2.log> <run3.log> [...] > 08-MEASUREMENT.md
    import { readFileSync } from 'node:fs';

    const ITEM_RE = /^\[ITEM\] idx=(\d+) wc=(\d+) frame=(\d+) codeblock=(\d+)/gm;
    const AGGREGATE_RE = /^\[AGGREGATE\] total=(\d+) aggregate_wc=(\d+)/m;

    const runs = process.argv.slice(2).map((path, i) => {
      const text = readFileSync(path, 'utf8');
      const items = [...text.matchAll(ITEM_RE)].map(m => ({
        idx: +m[1], wc: +m[2], frame: !!+m[3], codeblock: !!+m[4],
      }));
      const agg = text.match(AGGREGATE_RE);
      const aggregateWc = agg ? +agg[2] : 0;
      return { runIdx: i + 1, items, aggregateWc };
    });

    // Evaluate D-02 compound OR-gate
    const overCap = (it) => (it.frame ? it.wc > 22 : it.wc > 15);
    const d1Runs = runs.filter(r => r.items.some(it => it.codeblock && overCap(it))).length;
    const meanAgg = runs.reduce((s, r) => s + r.aggregateWc, 0) / runs.length;
    const d2Runs = runs.filter(r => r.aggregateWc > 110).length;
    const n = runs.length;

    // Gate logic per D-02 (n=3 thresholds; n=5 scaling delegated to Plan 3.5)
    const d1Threshold = Math.ceil(n * 2 / 3);
    const d2RunThreshold = Math.ceil(n * 2 / 3);

    let d1Verdict = d1Runs >= d1Threshold ? 'FAIL' : 'PASS';
    let d2Verdict = (meanAgg > 100 && d2Runs >= d2RunThreshold) ? 'FAIL' : 'PASS';

    // INCONCLUSIVE band per D-02 (D1: exactly 2/3 with all FAIL items in soft band [15,17]/[22,25]; D2: mean in [98,105])
    // Planner implements borderline detection; the suggested heuristic:
    if (d1Runs === d1Threshold) {
      const allInSoftBand = runs.every(r => r.items.every(it =>
        !(it.codeblock && overCap(it)) ||
        (it.frame ? it.wc <= 25 : it.wc <= 17)
      ));
      if (allInSoftBand) d1Verdict = 'INCONCLUSIVE';
    }
    if (meanAgg >= 98 && meanAgg <= 105 && d2Runs < d2RunThreshold) d2Verdict = 'INCONCLUSIVE';

    const compound = [d1Verdict, d2Verdict].includes('INCONCLUSIVE')
      ? 'INCONCLUSIVE'
      : ([d1Verdict, d2Verdict].includes('FAIL') ? 'FAIL' : 'PASS');

    const disposition =
      (d1Verdict === 'FAIL' && d2Verdict === 'FAIL') ? 'fragment-grammar template extension + density example audit (both atomic)' :
      (d1Verdict === 'FAIL') ? 'fragment-grammar template extension' :
      (d2Verdict === 'FAIL') ? 'density example audit' :
      (compound === 'INCONCLUSIVE') ? 'pending Plan 3.5 (n=2 more)' :
      'N/A (P2 closes structurally; no Plan 4)';

    // Emit MEASUREMENT.md content to stdout (planner finalizes table format)
    process.stdout.write(`# 08-MEASUREMENT.md: P2-ADVISOR fixture-grade measurement\n\n`);
    // ... full schema emission per RESEARCH Pitfall 3 ...
    ```

    Make the script executable: `chmod +x measurement-collator.mjs`.

    Part B: Run n=3 fresh fixture-grade sessions on the 3 scenarios.

    Create directory `.planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/uat-replay-0.14.x/`.

    For each of the 3 scenarios, run:
    ```
    claude --model sonnet --effort medium --plugin-dir plugins/lz-advisor \
      -p "<scenario-prompt>" \
      --verbose --output-format stream-json 2>&1 | tee uat-replay-0.14.x/scenario-N-plan.jsonl
    ```

    Scenario prompts (verbatim from CONTEXT.md / memory):
    - **Scenario 1 (Compodoc):** `/lz-advisor.plan Set up Compodoc with Storybook in this Nx Angular library. Add a sample input and a sample output to our component using the input() and output() signal functions. The Docs tab should render JSDoc descriptions for the component, the input, and the output.`
      - **Use this prompt verbatim. Memory `project_compodoc_uat_initial_plan_prompt.md` locks it as canonical baseline; do not paraphrase.**
    - **Scenario 2 (Feature impl):** `/lz-advisor.plan Add a debounced search input component to my Angular library. It should use the signal-based control flow, accept placeholder text, and emit search events after 300ms debounce.`
    - **Scenario 3 (Refactor):** `/lz-advisor.plan Extract a shared validation utility from these 3 components: UserForm, AddressForm, PaymentForm. Each currently has duplicate email + phone + zipcode validators. Place the shared utility in libs/shared-validators.`

    For each captured trace, run the extended D-advisor-budget.sh in trace-replay mode (the script may need to accept the JSONL trace via `--from-trace` -- if not directly supported, use `extract-advisor-sd.mjs` first to extract advisor SD, then pipe to the parser):

    ```
    for i in 1 2 3; do
      bash D-advisor-budget.sh --from-trace uat-replay-0.14.x/scenario-$i-plan.jsonl 2>&1 | tee uat-replay-0.14.x/scenario-$i-parser.log
    done
    ```

    Part C: Aggregate via collator + emit MEASUREMENT.md
    ```
    node .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/measurement-collator.mjs \
      uat-replay-0.14.x/scenario-1-parser.log \
      uat-replay-0.14.x/scenario-2-parser.log \
      uat-replay-0.14.x/scenario-3-parser.log \
      > .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-MEASUREMENT.md
    ```

    Spot-check the emitted MEASUREMENT.md to confirm:
    - Scenarios table is complete with all 3 rows (prompt + trace path)
    - Per-run results table has 1 row per scenario with aggregate, per-item word csv, per-item flags
    - Gate decision section enumerates D1, D2, Compound, Disposition explicitly
    - Recommendation section indicates whether Plan 4 ships (YES / NO / conditional on Plan 3.5)

    Part D: Record disposition + spawn signal for Plan 3.5 if INCONCLUSIVE
    - If compound = PASS: Plan 4 does NOT ship. Phase 8 P2 closes structurally.
    - If compound = FAIL: Plan 4 ships per disposition (D1 alone -> fragment-grammar; D2 alone -> density; both -> both).
    - If compound = INCONCLUSIVE: Plan 3.5 auto-spawn (D-03 tri-state); flag this in the SUMMARY for orchestrator to schedule Plan 3.5.

    Write the disposition explicitly in 08-MEASUREMENT.md (the collator emits this; spot-check to confirm).

    Use Write tool for the collator script. Cost estimate: 3x `claude -p` sessions ~$1.50-$3.00.
  </action>
  <verify>
    <automated>test -f .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/measurement-collator.mjs && test -f .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-MEASUREMENT.md && grep -qE "Gate decision|Disposition" .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-MEASUREMENT.md</automated>
  </verify>
  <acceptance_criteria>
    - `measurement-collator.mjs` exists and is executable (`bash -c "node measurement-collator.mjs --help"` or analog exits 0; alternatively passes its CLI parse check)
    - `08-MEASUREMENT.md` exists with all schema sections: Scenarios, Per-run results, Gate decision, Disposition, Recommendation
    - n=3 fresh trace files exist at `uat-replay-0.14.x/scenario-{1,2,3}-plan.jsonl`
    - n=3 parser log files exist at `uat-replay-0.14.x/scenario-{1,2,3}-parser.log` with `[ITEM]` and `[AGGREGATE]` lines
    - Gate decision is one of PASS / FAIL / INCONCLUSIVE; Disposition is concretely named (fragment-grammar / density / both / N/A / pending Plan 3.5)
    - Manual spot-check confirms parser counted correctly (read raw trace, count visible items, compare to [ITEM] log)
  </acceptance_criteria>
  <done>
    n=3 measurement complete; collator script in place; 08-MEASUREMENT.md is structurally complete with gate decision + disposition; Plan 3.5 spawn decision recorded.
  </done>
</task>

</tasks>

<verification>
After both tasks:

1. `bash -n D-advisor-budget.sh` exits 0; parser extension is syntactically valid.
2. `08-MEASUREMENT.md` contains all required sections per Pitfall 3 schema.
3. Gate decision (PASS/FAIL/INCONCLUSIVE) is mechanically derived from D-02 logic; spot-check matches manual count.
4. Disposition is mechanically derived per D-02 (no planner judgment beyond mechanical mapping).
5. If INCONCLUSIVE: Plan 3.5 auto-spawn is recommended in the SUMMARY.
6. If FAIL: Plan 4 ships per disposition.
7. If PASS: Plan 4 does NOT ship; P2 residual closes structurally.
</verification>

<success_criteria>
- D-advisor-budget.sh parser emits structured per-item flags
- 08-MEASUREMENT.md is the durable audit record (Phase 9 can revisit)
- Gate decision is mechanical (no planner judgment)
- Disposition mechanically determines Plan 4 scope (if it ships)
</success_criteria>

<output>
After completion, create `.planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-03-SUMMARY.md` documenting:
- Parser extension diff (line numbers + before/after)
- 3 scenario prompts used + trace paths
- D-02 gate decision: D1 verdict, D2 verdict, Compound verdict
- Disposition selected + Plan 4 ship status
- If INCONCLUSIVE: recommendation to spawn Plan 3.5 (n=2 more fresh runs)
- Cost: 3x claude -p sessions; total spend
- Manual spot-check evidence: claimed parser counts match actual visible items in trace
</output>