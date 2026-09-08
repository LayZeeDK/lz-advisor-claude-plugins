---
phase: quick-260615-wje
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs
  - plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs
  - plugins/lz-advisor/references/lz-deep-research-schema.md
autonomous: true
requirements: []
must_haves:
  truths:
    - "A non-null non-enum verdict string (e.g. 'Refuted' wrong case) causes tally() to throw ContractError naming the vote file"
    - "safeId rejects Windows reserved device names (CON, NUL, etc.) with ContractError"
    - "mergeClusters rejects a worker claims[] exceeding CEILINGS.MAX_VERIFY_CLAIMS * CEILINGS.ANGLES with ContractError"
    - "lz-deep-research-schema.md documents the Phase-19 filename-safety rule for sources/<source-id>.json"
    - "node --test exits 0 on the explicit file form after all fixes"
  artifacts:
    - path: "plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs"
      provides: "Aggregator with verdict enum guard, Windows device-name guard in safeId, per-worker claims ceiling"
    - path: "plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs"
      provides: "Regression tests for H-1, L-1, L-2 findings"
    - path: "plugins/lz-advisor/references/lz-deep-research-schema.md"
      provides: "Canonical-URL key rule extended with Phase-19 filename-safety rule"
  key_links:
    - from: "tally() verdict guard"
      to: "ContractError"
      via: "throw new ContractError('invalid verdict ...')"
      pattern: "invalid verdict"
    - from: "safeId() device-name guard"
      to: "ContractError"
      via: "throw new ContractError('unsafe id (Windows reserved device name) ...')"
      pattern: "unsafe id \\(Windows reserved"
    - from: "mergeClusters() ceiling guard"
      to: "ContractError"
      via: "throw new ContractError('worker claims[] exceeds ceiling ...')"
      pattern: "exceeds ceiling"
---

<objective>
Fix four security review findings in the lz-deep-research aggregator and schema:
H-1 (verdict enum validation silently treats typos as abstention), L-1 (Windows
reserved device names not rejected by safeId), L-2 (per-worker claims ceiling
missing before the O(n^2) merge loop), M-4 (schema missing filename-safety rule
for Phase-19 sources/<source-id>.json).

Purpose: Close the fail-closed discipline gaps identified in the security review so
the aggregator is consistent with its stated fail-closed posture. M-4 gives Phase
19 authors a clear contract before they write sources/ files.

Output: Three code fixes + three regression tests + one schema paragraph, each
committed atomically.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/quick/260615-wje-fix-security-review-findings-verdict-enu/260615-wje-PLAN.md

<!-- Key interfaces the executor needs. Extracted from the aggregator source. -->
<interfaces>
From plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs:

class ContractError extends Error {
  constructor(message, file) { super(message); this.name = 'ContractError'; this.file = file; }
}

export function safeId(id, file) {
  // Rejects non-string, empty, path-separator-containing, '..', or '.' ids.
  // Windows reserved device names are NOT currently rejected (L-1 gap).
}

export function mergeClusters(runDir) {
  // Iterates claimsDir .json files; guard: !w || !Array.isArray(w.claims) throws.
  // The `for (const c of w.claims)` loop follows immediately after the source check.
  // Per-worker claims ceiling is NOT currently enforced before the loop (L-2 gap).
  // CEILINGS.MAX_VERIFY_CLAIMS = 24, CEILINGS.ANGLES = 5 -> ceiling = 120.
}

// tally() reads vote seats:
const verdict = rec.verdict;
seats.push(verdict == null ? 'insufficient' : verdict);
// Non-null non-enum verdicts (e.g. "Refuted" wrong case) silently become invalid seats (H-1 gap).
// Valid enum values are exactly 'unrefuted' and 'refuted'.

export const CEILINGS = Object.freeze({
  ANGLES: 5,
  MAX_FETCH: 15,
  MAX_VERIFY_CLAIMS: 24,
  VOTES_PER_CLAIM: 3,
  SYNTH_CAP: 20,
});
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1 (H-1 HIGH): Add verdict enum validation in tally() + regression test</name>
  <files>plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs, plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs</files>
  <behavior>
    - Test: a vote file with verdict "Refuted" (capital R, wrong case) causes aggregate() to throw ContractError matching /invalid verdict/
    - Test: a vote file with verdict "refuted " (trailing space) causes aggregate() to throw ContractError matching /invalid verdict/
    - Test: verdict null still maps to 'insufficient' (existing behavior preserved -- no regression)
    - Test: verdict 'unrefuted' and 'refuted' (exact case) continue to work (no regression)
  </behavior>
  <action>
In lz-deep-research-aggregate.mjs, locate the two lines at the end of tally()'s per-seat loop:

    const verdict = rec.verdict;
    seats.push(verdict == null ? 'insufficient' : verdict);

Insert a guard between those two lines so that a non-null, non-enum verdict throws ContractError
naming the vote file (consistent with existing fail-closed discipline). Valid enum values are
exactly 'unrefuted' and 'refuted' -- these are the only two strings tally() branches on and the
only two the verify-voter schema emits. The guard fires BEFORE the push so an invalid verdict
never enters the seats array.

    const verdict = rec.verdict;
    if (verdict != null && verdict !== 'unrefuted' && verdict !== 'refuted') {
      throw new ContractError('invalid verdict (expected "unrefuted" or "refuted"): ' + JSON.stringify(verdict), f);
    }
    seats.push(verdict == null ? 'insufficient' : verdict);

The variable `f` is the loop variable carrying the current vote file path (already in scope).

In lz-deep-research-aggregate.test.mjs, add two regression tests after the existing test suite.
Each uses tmpRunDirWithWorker to build a run-dir with one valid claim + an excerpt so the claim
reaches tally, then writes a vote file for cluster0 with the bad verdict, then asserts
aggregate() throws /invalid verdict/. Use the try/finally pattern (rm runDir) from existing tests.
Add a separate vote dir with fs.mkdirSync before writing the vote file (the tmpRunDirWithWorker
helper only creates the claims dir).

Commit message pattern: fix(aggregate): reject non-enum verdict strings in tally() (H-1)
  </action>
  <verify>
    <automated>node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs</automated>
  </verify>
  <done>
    node --test exits 0; the two new "H-1" tests appear in passing output; existing tests unaffected.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2 (L-1 LOW): Reject Windows reserved device names in safeId() + regression tests</name>
  <files>plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs, plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs</files>
  <behavior>
    - Test: safeId('CON', 'file.json') throws ContractError matching /unsafe id \(Windows reserved/
    - Test: safeId('NUL', 'file.json') throws ContractError matching /unsafe id \(Windows reserved/
    - Test: safeId('COM1', 'file.json') throws ContractError matching /unsafe id \(Windows reserved/
    - Test: safeId('LPT9', 'file.json') throws ContractError matching /unsafe id \(Windows reserved/
    - Test: safeId('CON.json', 'file.json') throws (device name + extension variant)
    - Test: safeId('context', 'file.json') does NOT throw (not a reserved name -- prefix match only)
    - Test: safeId('c1', 'file.json') does NOT throw (existing behavior preserved)
  </behavior>
  <action>
In lz-deep-research-aggregate.mjs, locate the safeId() function. After the existing
path-separator/'..'/'.' guard block (which ends with the first throw), add one new guard
BEFORE the `return id` line:

  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\.|$)/i.test(id)) {
    throw new ContractError('unsafe id (Windows reserved device name): ' + JSON.stringify(id), file);
  }

The regex uses the standard Windows reserved-name pattern: match from the start of the string,
match the device name case-insensitively, then require either a period (device name + extension,
e.g. CON.json) or end-of-string. This does NOT match 'console', 'context', 'conquest', etc.
(the `(\.|$)` anchor prevents prefix false-positives).

In lz-deep-research-aggregate.test.mjs, import safeId from the aggregator (add it to the
existing import line: `import { aggregate, normalize, CEILINGS, listJson, safeId } from './...'`).
Then add a named test block asserting the device-name throws, including variants (CON, NUL,
COM1, LPT9, CON.json) and negative assertions (safeId('context', '') must NOT throw,
safeId('c1', '') must NOT throw).

Commit message pattern: fix(aggregate): reject Windows reserved device names in safeId() (L-1)
  </action>
  <verify>
    <automated>node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs</automated>
  </verify>
  <done>
    node --test exits 0; the new "L-1" safeId test appears in passing output; safeId import visible
    in the test file's import line; existing tests unaffected.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 3 (L-2 LOW): Per-worker claims ceiling before O(n^2) merge loop + regression test</name>
  <files>plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs, plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs</files>
  <behavior>
    - Test: a worker file with 121 claims (= 24 * 5 + 1 = CEILINGS.MAX_VERIFY_CLAIMS * CEILINGS.ANGLES + 1) causes aggregate() to throw ContractError matching /exceeds ceiling/
    - Test: a worker file with exactly 120 claims (= 24 * 5 = CEILINGS.MAX_VERIFY_CLAIMS * CEILINGS.ANGLES) does NOT throw the ceiling error (boundary: exactly at ceiling is allowed)
  </behavior>
  <action>
In lz-deep-research-aggregate.mjs, locate mergeClusters(). Find the point after the
`!Array.isArray(w.claims)` guard (which throws 'worker file missing claims[] array') and
after the `w.source` guard (which throws 'worker file missing non-empty source'), but
BEFORE `for (const c of w.claims)`. Add:

    const CLAIMS_CEILING = CEILINGS.MAX_VERIFY_CLAIMS * CEILINGS.ANGLES;
    if (w.claims.length > CLAIMS_CEILING) {
      throw new ContractError('worker claims[] exceeds ceiling (' + w.claims.length + '>' + CLAIMS_CEILING + ')', path.join(claimsDir, f));
    }

CLAIMS_CEILING is a local constant (computed once per worker iteration, not top-level), which is
appropriate since CEILINGS is frozen and the multiplication is trivial. The path argument to
ContractError uses path.join(claimsDir, f) -- identical to how the surrounding guards name the
file, maintaining .file discipline.

In lz-deep-research-aggregate.test.mjs, add a test that builds a run-dir via tmpRunDirWithWorker
with a synthesized worker record containing 121 claims (generate them with Array.from or a loop;
each claim needs id, text, quote, excerpt_id to pass the field guards before reaching the ceiling
check). Assert aggregate() throws /exceeds ceiling/. Also add a boundary test with exactly 120
claims asserting no ceiling error is thrown (the boundary claim count is allowed). Use try/finally
to clean up the run-dirs.

Commit message pattern: fix(aggregate): add per-worker claims ceiling before merge loop (L-2)
  </action>
  <verify>
    <automated>node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs</automated>
  </verify>
  <done>
    node --test exits 0; the new "L-2" ceiling test and boundary test appear in passing output;
    existing tests unaffected; CLAIMS_CEILING constant visible in the mjs file.
  </done>
</task>

<task type="auto">
  <name>Task 4 (M-4 SCHEMA DOC): Add Phase-19 filename-safety rule to lz-deep-research-schema.md</name>
  <files>plugins/lz-advisor/references/lz-deep-research-schema.md</files>
  <action>
In plugins/lz-advisor/references/lz-deep-research-schema.md, locate the "Canonical-URL key rule"
paragraph (the paragraph that begins "**Canonical-URL key rule (D-08, VERIF-03
source-independence).**"). This paragraph ends with the sentence: "This reference fixes the rule
at the contract level; the extract worker implements the exact canonicalization (Phase 19)."

IMMEDIATELY AFTER that closing sentence (still within the same section, before the next
"## The claim record" heading), add a new paragraph with a bold lead:

"**Phase 19 filename-safety rule.** The raw canonical key MUST NOT be used verbatim as the
`sources/<source-id>.json` basename because a canonical URL legitimately contains path
separators in its URL path component (e.g. `https://example.org/a/study`). Phase 19 MUST
encode the canonical key to a safe basename before writing `sources/<id>.json` -- for example,
by percent-encoding (replacing `/` with `%2F`, `:` with `%3A`, etc.) or by computing a stable
hash of the key (e.g. SHA-256 hex). The `id` field INSIDE the JSON file always carries the raw
canonical key; only the filename uses the encoded form. This encoding is NOT required of the
aggregator (which never reads `sources/`) but IS required of Phase 19 extract workers and Phase
20 synthesis."

No code changes. No test changes. This is a documentation-only fix.

Commit message pattern: docs(schema): add Phase-19 filename-safety rule for sources/ basenames (M-4)
  </action>
  <verify>
    <automated>git grep -c "Phase 19 filename-safety rule" plugins/lz-advisor/references/lz-deep-research-schema.md</automated>
  </verify>
  <done>
    git grep exits 0 with count 1; the paragraph is present immediately after the Canonical-URL key
    rule closing sentence; the schema heading structure is unchanged.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| worker file -> aggregator | Worker-authored JSON (claims, vote files) is untrusted input crossing into the aggregator's trust domain |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-wje-01 | Tampering | tally() verdict field | mitigate | H-1: throw ContractError on non-null non-enum verdict before push |
| T-wje-02 | Tampering | safeId() id field | mitigate | L-1: regex guard rejecting Windows reserved device names before return |
| T-wje-03 | Denial of Service | mergeClusters() claims[] | mitigate | L-2: CLAIMS_CEILING guard before O(n^2) merge loop |
</threat_model>

<verification>
All four tasks pass their automated verification independently:
- Task 1-3: node --test exits 0 on lz-deep-research-aggregate.test.mjs (FILE form, not dir)
- Task 4: git grep -c "Phase 19 filename-safety rule" exits 0 with count 1
</verification>

<success_criteria>
- node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs exits 0 after all three code tasks
- Regression tests for H-1 (2 tests), L-1 (device-name variants + negatives), and L-2 (121-claim throw + 120-claim boundary) are present and named clearly
- lz-deep-research-schema.md contains the Phase-19 filename-safety rule paragraph in the Canonical-URL key rule section
- safeId is exported from the aggregator (added to the existing export list if not already there)
- Four atomic commits, one per task
</success_criteria>

<output>
Create `.planning/quick/260615-wje-fix-security-review-findings-verdict-enu/260615-wje-SUMMARY.md` when done.
</output>
