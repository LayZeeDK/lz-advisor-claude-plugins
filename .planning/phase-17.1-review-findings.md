# Phase 17.1: Address Phase 16/17 Review Findings

## Context

Five rounds of `/lz-advisor:lz-review` (each surface reviewed separately) over the Phase 16
and 17 output. Surfaces covered: the aggregator source
(`skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs`), the test suite
(`lz-deep-research-aggregate.test.mjs`), and the schema reference
(`references/lz-deep-research-schema.md`). Review loop ran until no `### Missed surfaces`
entries remained.

**Scope:** Before Phase 18 begins the voter + eval authoring, the aggregator's validation gap
(AGG-1) and the test suite's SYNTH_CAP blind spot (TEST-1) are Important-severity findings
that could silently corrupt vote tallies or let a ceiling-enforcement regression go undetected.
The schema inaccuracies (SCHEMA-1, SCHEMA-2) would mislead Phase 18/19/20 implementors who
read the schema to implement against the frozen contract. All other findings are Suggestions
that reduce observability accuracy or test coverage debt.

---

## Findings by Surface

### lz-deep-research-aggregate.mjs (source)

#### Important

**AGG-1: `claims[].id` not validated in `mergeClusters`**
- Location: `aggregate.mjs:220-235` (WR validation block), `aggregate.mjs:437-439` (tally fallback)
- `text`, `quote`, and `source` all have explicit `ContractError` guards. `id` does not, despite
  the schema marking it required. In `tally()`, the member-id vote-file fallback uses
  `safeId(String(cl.members[0].id))`. When `id` is missing/undefined, `String(undefined)`
  produces the literal string `"undefined"` which passes `safeId`. All claims without an `id`
  share the same fallback vote-file path (`votes/undefined-0.json`), cross-contaminating vote
  tallies across unrelated claims. The member-id fallback IS in active use: two committed fixtures
  (`wrong-passage-downgraded`, `fabricated-quote-dropped`) name their vote files by member id
  (`c1-0.json`), not cluster id.
- Fix: add `ContractError` guard for `c.id` matching the `text`/`quote`/`source` pattern:
  ```javascript
  if (typeof c.id !== 'string' || c.id.length === 0) {
    throw new ContractError('claim missing non-empty id', path.join(claimsDir, f));
  }
  ```

#### Suggestions

**AGG-2: Extra-seats counting loop breaks at first gap; no upper bound**
- Location: `aggregate.mjs:465-482`
- The `for (;;)` loop counting `caps.votes_ignored` breaks on the first missing seat. Non-
  contiguous vote files (seats 3 and 5 present, seat 4 absent) cause silent undercount of
  `votes_ignored`. No upper bound: a run-dir with many consecutive extra vote files iterates
  proportionally. Observability-only issue (does not affect tally results), but diverges from
  the D-11 "no silent truncation" contract.
- Fix: scan a bounded range (`CEILINGS.VOTES_PER_CLAIM` to some reasonable upper, e.g. 3x) or
  list all `<clusterId>-*.json` files in the votes dir and count those beyond seat 2.

**AGG-3: `safeId()` redundant `id === '..'` check**
- Location: `aggregate.mjs:149`
- `id === '..'` is subsumed by `id.includes('..')`. The `id === '.'` check is necessary and
  not redundant. Remove the dead `id === '..'` branch.

**AGG-4: `caps.votes_ignored` counter includes non-survivors**
- Location: `aggregate.mjs:530-545`
- `tally()` is called for all MAX_VERIFY_CLAIMS (24) clusters before SYNTH_CAP drops clusters
  21-24. Extra votes from those dropped clusters inflate `votes_ignored` in the summary, making
  the observability count potentially misleading.
- Fix: move `votes_ignored` accumulation into a post-SYNTH_CAP pass, or document scope in the
  summary/schema.

**AGG-5: `loadExcerpts` bare `readText` -- fs failures produce unannotated error messages**
- Location: `aggregate.mjs:281`
- `readJson` wraps `readText` in a try/catch that rethrows as `ContractError('cannot read
  file: ...', p)`. `loadExcerpts` calls `readText` bare. A failing excerpt read throws a native
  Node.js `Error` without the `.file` annotation the CLI uses for its error output format.
  Exit code 2 is preserved; the impact is message-format inconsistency.
- Fix: wrap the `readText` call in `loadExcerpts` the same way `readJson` wraps it.

**AGG-6: `safeId` called in `loadExcerpts` without `.file` arg -- malformed excerpt filename yields annotation-less ContractError**
- Location: `aggregate.mjs:283`
- `safeId(f.slice(0, -'.txt'.length))` is called without passing the file path as the second
  argument. A malformed excerpt filename yields a `ContractError` that lacks the `.file`
  property, so the CLI's `(${err.file})` annotation is omitted.
- Fix: pass `path.join(excerptsDir, f)` as the second arg to `safeId`.

**AGG-7: Both `loadExcerpts` and `listJson` have bare `readdirSync` calls**
- Location: `aggregate.mjs:277-280` (`loadExcerpts`), `aggregate.mjs:176-184` (`listJson`)
- Neither wraps `readdirSync` in a try/catch that rethrows as `ContractError`. Directory-read
  failures escape with unannotated native errors. Fix both together for consistency with the
  rest of the error-handling pattern; `existsSync` pre-checks screen the common absent-dir case
  but not permission failures or I/O errors.

**AGG-Q1 (open question for implementation): excerpt_id path-traversal abort vs skip**
- Location: `aggregate.mjs:311` (`quoteOutcome`)
- A worker file with `excerpt_id: "../../../etc/passwd"` causes `safeId` to throw a
  `ContractError`, aborting the entire aggregation run. The question is whether fail-hard (abort
  the run) or fail-soft (drop that member, continue) is the intended robustness posture for a
  single malformed `excerpt_id`. Current behavior: fail-hard. Document the choice explicitly in
  a comment; or change to fail-soft if a single bad excerpt should not abort a full run.

---

### lz-deep-research-aggregate.test.mjs (test suite)

#### Important

**TEST-1: SC5-5 does not assert SYNTH_CAP behavior despite fixture triggering both caps**
- Location: `test.mjs:268-278`
- The `ceilings-enforced` fixture (31 distinct claims, each with a matching excerpt) triggers
  MAX_VERIFY_CLAIMS (31->24) AND SYNTH_CAP (24->20). The test only asserts
  `assert.match(r.summary, /claims \d+->24/)`. If SYNTH_CAP logic were removed, the test still
  passes (24 survivors instead of 20, no assertion fails).
- Fix: add:
  ```javascript
  assert.match(r.summary, /synth \d+->20/);
  assert.equal(r.survivors.length, 20);
  assert.equal(CEILINGS.SYNTH_CAP, 20);
  ```

**TEST-2: SC-1 determinism test cannot detect listJson sort removal**
- Location: `test.mjs:330-335`
- `SC-1` calls `aggregate` twice in the same process. `readdirSync` returns the same order both
  times, so removing `listJson`'s `.sort()` still passes this test. The AGG-01 determinism
  guarantee (same input -> byte-identical output across any file-system ordering) is unverified
  against the OS-ordering axis the comment cites.
- Fix: add a test that creates a fixture with two claims in files whose lexical order differs
  from creation order, and asserts that `cluster.text` (representative claim) is stable
  regardless of which file is processed first.

**TEST-3: No test for missing `claims[].id` (prerequisite: AGG-1 code fix)**
- Location: `test.mjs:229-265`
- `WR-01/02/03` tests exist for missing `text`, `quote`, and `source`. No corresponding test
  for missing `id`. This test requires AGG-1 to be implemented first (the guard must exist
  before the test can pass).
- Fix: add after AGG-1:
  ```javascript
  test('WR-04 claim missing id fails closed (aggregate throws)', () => {
    const runDir = tmpRunDirWithWorker({
      worker: 'w1', source: 's1',
      claims: [{ text: 'X reduces Y by 30%', quote: 'X reduces Y by 30%', excerpt_id: 'e1' }],
    });
    assert.throws(() => aggregate(runDir), /missing non-empty id/);
  });
  ```

#### Suggestions

**TEST-4: SC5-2 does not lock the member-id vote fallback confidence value**
- Location: `test.mjs:54-64`
- `wrong-passage-downgraded` vote files are `c1-0.json`, `c1-1.json`, `c1-2.json` (all
  `unrefuted`) -- the member-id fallback fires and should yield `High`. The test asserts only
  `quote_fidelity === 'downgraded'`. A silent failure of the fallback (returning `Unsupported`
  instead of `High`) is not caught.
- Fix: add `assert.equal(r.survivors[0].confidence, 'High')`.

**TEST-5: Three `mkdtempSync` sites never cleaned up**
- Location: `test.mjs:145, 220, 297`
- `PIPE-07 / D-02 stdout` (line 145), `tmpRunDirWithWorker` helper (line 220), and
  `SC-2 CRLF+BOM` (line 297) all create OS temp dirs without cleanup. Accumulate on repeated
  runs.
- Fix: wrap each `mkdtempSync` block in `try/finally { fs.rmSync(runDir, {recursive:true, force:true}) }`.

**TEST-6: No test for `readJson` malformed JSON branch**
- Location: `test.mjs:229-265`
- `readJson` lines 169-170 catch `JSON.parse` failures and throw `ContractError('malformed
  JSON: ...')`. No test exercises this branch.
- Fix: write non-JSON bytes to the claims file via `tmpRunDirWithWorker` pattern (skip
  `JSON.stringify`); assert `throws(() => ..., /malformed JSON/)`.

**TEST-7: No test for `worker file missing claims[] array`**
- Location: `test.mjs:229-265`
- `mergeClusters` line 209 checks `!Array.isArray(w.claims)` and throws. A claims file with
  `{"worker":"w1","source":"s1"}` (no `claims` array) triggers this, but no test exercises it.
- Fix: `tmpRunDirWithWorker({ worker: 'w1', source: 's1' })` (no `claims` key); assert
  `throws(() => ..., /missing claims\[\] array/)`.

**TEST-8: No test asserts `votes_ignored` in summary for a >3-seat cluster**
- Location: `test.mjs:268-278`
- `tally()` lines 464-482 count extra vote seats beyond `VOTES_PER_CLAIM` into
  `caps.votes_ignored`. No committed fixture or inline run-dir exercises this code path.
- Fix: add a 4-seat fixture (seat files 0, 1, 2, 3) and assert summary contains
  `votes_ignored 1`.

**TEST-9: No test for `safeId` path-traversal rejection via `excerpt_id`**
- Location: `test.mjs` (new test)
- `quoteOutcome` calls `safeId(String(member.excerpt_id))` on worker-provided data. A malformed
  `excerpt_id` containing `..` or path separators should throw `ContractError` with
  `/path traversal rejected/`. No test exercises this boundary.
- Fix: `tmpRunDirWithWorker` with `claims: [{ id:'c1', text:'X', quote:'X', excerpt_id: '../evil' }]`
  plus a matching excerpt; assert `throws(() => ..., /path traversal rejected/)`.

---

### references/lz-deep-research-schema.md (schema)

#### Important

**SCHEMA-1: `claims[].id` row lacks `(fail-closed)` annotation; does not document silent coercion**
- Location: `schema.md` claim record table
- The table marks `id` as `yes` required but lacks the `(fail-closed)` annotation and note that
  other required fields carry. Downstream Phase 18/19/20 authors reading this table see `id:
  yes` and reasonably assume early rejection, but the current code silently coerces a missing
  `id` to `"undefined"` in the vote-file fallback. Until AGG-1 is fixed: add a caveat
  documenting the current behavior. After AGG-1 is fixed: promote to `(fail-closed)` matching
  the other required fields.
- Fix (interim): add a note: "No ContractError guard currently exists for `id`; a missing `id`
  silently coerces to `"undefined"` in `tally()`'s member-id vote-file fallback. Fix tracked as
  AGG-1."
- Fix (post-AGG-1): change the row to `yes (fail-closed)` and reference the WR-04 guard.

**SCHEMA-2: `verified` condition in quote-recheck table omits null-guard**
- Location: `schema.md` quote-recheck contract section
- The table documents the `verified` condition as `cited.includes(nq)`, but the source guards
  `cited != null && cited.includes(nq)`. The null check is load-bearing: it fires when
  `excerpt_id` is absent (no cited excerpt), which is a valid `optional` case per the claim
  schema.
- Fix: update the condition to `cited != null && cited.includes(nq)`.

#### Suggestions

**SCHEMA-3: Tally truth table missing `1 | 0 | 2 | 1 | Low` row**
- Location: `schema.md` truth table
- The truth table has 8 rows but omits the `1 unrefuted | 0 refuted | 2 insufficient |
  readableSeats=1 | Low (thin support)` combination. This is exercised by the `low-thin-support`
  fixture. The rubric prose already covers it (`otherwise -> Low`), so no consumer mis-
  implements, but the table is non-exhaustive for `readableSeats=1`.
- Fix: add the missing row.

**SCHEMA-4: `votes_ignored` summary entry not documented as potentially including non-survivors**
- Location: `schema.md` stdout summary section
- The template shows `votes_ignored N` but does not note that this count can include extra votes
  from clusters later dropped by SYNTH_CAP (clusters 21-24 in the MAX_VERIFY_CLAIMS=24 /
  SYNTH_CAP=20 gap).
- Fix: add a note: "When both MAX_VERIFY_CLAIMS and SYNTH_CAP fire, `votes_ignored` may include
  counts from clusters that did not survive SYNTH_CAP."

---

## Implementation Order

The findings have these dependencies:

1. **AGG-1 first** -- required before TEST-3 (the WR-04 test cannot pass without the guard).
   Also unblocks SCHEMA-1 full promotion to `(fail-closed)`.
2. **TEST-1, TEST-2** -- independent of AGG-1; pure test additions.
3. **SCHEMA-1 interim, SCHEMA-2** -- can be done before or after AGG-1; interim doc fix is
   immediately correct, full promotion waits for AGG-1.
4. **All Suggestions** -- independent; can be batched.

Recommended plan breakdown for phase 17.1:
- **Plan A (Aggregator code fixes)**: AGG-1 (Important + unblocks TEST-3), AGG-3, AGG-5, AGG-6,
  AGG-7, decide AGG-Q1 and document.
- **Plan B (Test suite additions)**: TEST-1, TEST-2, TEST-3 (requires Plan A), TEST-4, TEST-6,
  TEST-7, TEST-8, TEST-9; defer TEST-5 (cleanup) to same plan.
- **Plan C (Schema corrections)**: SCHEMA-1 (interim + post-AGG-1 promotion), SCHEMA-2, SCHEMA-3,
  SCHEMA-4.
- **Plan D (Observability/Suggestion code fixes)**: AGG-2, AGG-4 (lower priority, may defer to
  Phase 18+ review).

Plans A+B+C are prerequisite before Phase 18 authoring begins. Plan D can slip to Phase 18 review
if bandwidth is tight.
