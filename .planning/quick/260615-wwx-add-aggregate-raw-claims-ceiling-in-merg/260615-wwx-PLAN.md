---
phase: quick
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs
  - plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs
  - plugins/lz-advisor/references/lz-deep-research-schema.md
autonomous: true
requirements: [OQ-1]

must_haves:
  truths:
    - "aggregate() throws ContractError when the total pre-merge raw[] count exceeds MAX_FETCH * MAX_VERIFY_CLAIMS (360)"
    - "The ceiling guard fires after the per-file read loop and before the merge loop in mergeClusters()"
    - "The schema doc's MAX_FETCH row in the named-ceilings enforcement table reflects aggregator enforcement"
    - "A regression test with 4 * 100 = 400 claims confirms the throw"
  artifacts:
    - path: "plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs"
      provides: "TOTAL_RAW_CEILING guard in mergeClusters()"
      contains: "TOTAL_RAW_CEILING"
    - path: "plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs"
      provides: "OQ-1 regression test"
      contains: "exceed.*ceiling|total pre-merge"
    - path: "plugins/lz-advisor/references/lz-deep-research-schema.md"
      provides: "Updated MAX_FETCH enforcement row"
      contains: "MAX_FETCH * MAX_VERIFY_CLAIMS = 360"
  key_links:
    - from: "mergeClusters raw[] accumulation loop"
      to: "TOTAL_RAW_CEILING guard"
      via: "raw.length > TOTAL_RAW_CEILING check inserted between the read loop and the merge loop"
      pattern: "TOTAL_RAW_CEILING"
---

<objective>
Close OQ-1: add an aggregate raw-claims ceiling in mergeClusters() to prevent a cross-file claims DoS.
A single malicious run-dir with many worker files each under the per-file ceiling could push raw[]
to an arbitrary size before the merge loop. The fix caps raw[] at MAX_FETCH * MAX_VERIFY_CLAIMS (360)
and fails closed via ContractError -- consistent with all other ceiling guards in the aggregator.

Purpose: Defense-in-depth for the claims read path; the per-file CLAIMS_CEILING already caps any
single worker file but nothing bounds the aggregate across all files.
Output: Guard in aggregate.mjs, regression test in aggregate.test.mjs, schema doc update.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add TOTAL_RAW_CEILING guard, update schema doc, add regression test</name>
  <files>
    plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs,
    plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs,
    plugins/lz-advisor/references/lz-deep-research-schema.md
  </files>
  <action>
Three co-located edits, one atomic commit.

-- aggregate.mjs --

In mergeClusters(), AFTER the `for (const f of files)` read loop (the loop that ends with
`raw.push({ ...c, source: w.source, _file: path.join(claimsDir, f) })`) and BEFORE the merge loop
(`const clusters = []; for (const c of raw)`), insert:

  const TOTAL_RAW_CEILING = CEILINGS.MAX_FETCH * CEILINGS.MAX_VERIFY_CLAIMS;

  if (raw.length > TOTAL_RAW_CEILING) {
    throw new ContractError(
      'total pre-merge claims exceed ceiling (' + raw.length + '>' + TOTAL_RAW_CEILING + ')',
      claimsDir,
    );
  }

Notes:
- CEILINGS.MAX_FETCH = 15, CEILINGS.MAX_VERIFY_CLAIMS = 24, product = 360.
- claimsDir is already in scope from the top of mergeClusters().
- The ContractError message must match /exceed.*ceiling/ or /total pre-merge/ for the test regex.
- No blank lines inside the if-body beyond those already present in the surrounding code style
  (blank line before and after if-statements per CLAUDE.md, but do NOT add a blank between the
  const declaration and the if -- they form one logical unit).
- TOTAL_RAW_CEILING is a local const; it does NOT need to be exported (the test reads CEILINGS
  directly and computes the expected value).

-- aggregate.test.mjs --

Add a new test at the END of the file (after the last existing test). Use node:test's `test()`.
Name: 'OQ-1 aggregate raw-claims ceiling: 4 * 100 = 400 claims > 360 ceiling throws ContractError'.

Build a run-dir under os.tmpdir() using fs.mkdtempSync. Create a claims/ subdir. Write 4 worker
files (w1.json through w4.json), each containing 100 claims. Each claim needs: a unique id, a
non-empty text, and a non-empty quote (no excerpt required -- the guard fires before loadExcerpts).
Per-file count (100) must be below the per-file CLAIMS_CEILING (CEILINGS.MAX_VERIFY_CLAIMS *
CEILINGS.ANGLES = 24 * 5 = 120) so the per-file guard does NOT fire first; the aggregate guard
is what fires. Use a simple pattern for ids/texts/quotes: 'c' + fileIndex + '-' + claimIndex
(e.g. 'c1-0', 'c1-1', ..., 'c4-99'). Text and quote can be identical minimal strings like
'claim ' + id (unique, non-empty). Source must be a non-empty string ('s' + fileIndex).

Wrap the aggregate() call in assert.throws with a regex /exceed.*ceiling|total pre-merge/.
Use try/finally with fs.rmSync(runDir, { recursive: true, force: true }) for cleanup -- same
pattern as existing tests (TEST-6, TEST-7, TEST-8).

Import ContractError is NOT needed (assert.throws with a regex is sufficient).

-- lz-deep-research-schema.md --

In the named-ceilings enforcement table (columns: Ceiling | Value | Enforced by | What it caps),
find the MAX_FETCH row. Update the two cells as follows:

"Enforced by" cell: change from
  "Phase-20 orchestrator (at wave dispatch)"
to
  "Aggregator (mergeClusters, aggregate raw-claims ceiling: MAX_FETCH * MAX_VERIFY_CLAIMS = 360); Phase-20 orchestrator (dispatch)"

"What it caps" cell: change from
  "Max distinct fetches per run. CARRIED by the aggregator, not enforced by it."
to
  "Max distinct fetches per run. NOW ALSO enforced by aggregator as aggregate raw-claims ceiling (MAX_FETCH * MAX_VERIFY_CLAIMS = 360 total pre-merge claims)."

Also update the Stage-ownership summary table at the bottom of the document. Find the row for
`ANGLES` / `MAX_FETCH` (last row). Change its "Notes" cell from
  "Carried by the aggregator; enforced at wave dispatch."
to
  "Carried by the aggregator; enforced at wave dispatch (ANGLES). MAX_FETCH additionally enforced by the aggregator as aggregate raw-claims ceiling (MAX_FETCH * MAX_VERIFY_CLAIMS = 360)."
  </action>
  <verify>
    <automated>node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs</automated>
  </verify>
  <done>
    - All existing tests pass.
    - The new OQ-1 test passes (aggregate throws ContractError on 400 > 360 claims).
    - git grep confirms TOTAL_RAW_CEILING is present in aggregate.mjs.
    - The schema doc's MAX_FETCH row mentions "MAX_FETCH * MAX_VERIFY_CLAIMS = 360".
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| run-dir -> aggregator | Worker-authored JSON files cross here; claims[] is untrusted input |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-OQ1-01 | Denial of Service | mergeClusters raw[] accumulation | mitigate | TOTAL_RAW_CEILING = MAX_FETCH * MAX_VERIFY_CLAIMS = 360 inserted between the read loop and the merge loop; throws ContractError on excess |
| T-OQ1-SC | Tampering | npm/pip/cargo installs | accept | No package installs in this plan; Node stdlib only |
</threat_model>

<verification>
- node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs passes with no failures
- git grep -l "TOTAL_RAW_CEILING" plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs returns the file
- rg "MAX_FETCH \* MAX_VERIFY_CLAIMS = 360" plugins/lz-advisor/references/lz-deep-research-schema.md returns a match
</verification>

<success_criteria>
aggregate() fails closed (ContractError) when raw[] exceeds 360 total pre-merge claims.
All existing tests still pass. Schema doc and Stage-ownership table reflect the new enforcement.
</success_criteria>

<output>
Create .planning/quick/260615-wwx-add-aggregate-raw-claims-ceiling-in-merg/260615-wwx-SUMMARY.md when done.
</output>
