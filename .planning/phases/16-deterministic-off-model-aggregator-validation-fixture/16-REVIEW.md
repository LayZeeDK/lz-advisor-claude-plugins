---
phase: 16-deterministic-off-model-aggregator-validation-fixture
reviewed: 2026-06-15T00:00:00Z
depth: standard
files_reviewed: 2
files_reviewed_list:
  - plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs
  - plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs
findings:
  critical: 1
  warning: 5
  info: 2
  total: 8
status: issues_found
---

# Phase 16: Code Review Report

**Reviewed:** 2026-06-15
**Depth:** standard
**Files Reviewed:** 2
**Status:** issues_found

## Summary

Reviewed the deterministic off-model aggregator (`lz-deep-research-aggregate.mjs`) and its
`node:test` validation fixture against the frozen Phase-16 contract (16-01-SUMMARY.md), the locked
decisions (16-CONTEXT.md D-01..D-16), and the proven spike baseline (`plans/_spike/aggregate-spike.mjs`).
All 9 fixture tests pass on the host. The core invariants the scope note flagged as most important
hold up well under tracing:

- The three-way quote outcome runs UPSTREAM of tally. A dropped cluster never reaches `tally()`
  (`recheckClusters` runs before `rankClusters`/`enforceCeilings`/`tally` in `aggregate`); verified
  empirically against `fabricated-quote-dropped` (drops 1, never tallied despite 3 unrefuted seats).
- Distinct-source corroboration is a Set-based LOWER bound; `paraphrase-one-source` correctly merges
  the same-source pair to corroboration 1 and the SC5-3 precondition guard prevents a vacuous pass.
- Ceilings are applied AFTER ranking and recorded observably; votes are keyed by immutable cluster id
  (not rank position), so ranking reorder does NOT misattribute vote files (verified against
  `ceilings-enforced`: `cluster1`'s votes correctly produce `High` at ranked position 4).
- `safeId` correctly rejects backslash, forward-slash, `.`, `..`, and any `..`-containing id (the
  CLAUDE.md heredoc backslash hazard initially masked this; confirmed via a fromCharCode probe).
- CLI guard (`fileURLToPath(import.meta.url) === path.resolve(process.argv[1])`) is correct; importing
  the module produces no side effect; malformed-JSON fails closed naming the file; exit 0/2 contract holds.

However, the OBSERVABLE STDOUT SUMMARY -- which D-03/D-11 designate as the load-bearing receipt the
Phase-20 orchestrator consumes -- is structurally broken: it can never report a non-zero merge count
and never reflects the true raw-claim volume (CR-01). Several robustness gaps around missing/undefined
input fields can silently corrupt the FROZEN survivor record shape that Phase 17 inherits verbatim.

## Critical Issues

### CR-01: stdout summary `raw`/`clusters`/`merged` counts are mathematically broken -- `merged` is pinned to 0 for every input; `raw` reports post-merge cluster count, not raw claim count

**File:** `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs:464-508`
**Issue:**
`aggregate()` sets `rawCount = clusters.length` (line 466) where `clusters` is the OUTPUT of
`mergeClusters` -- i.e. already-deduped clusters, not raw claims. The summary then computes:

```js
const merged = rawCount === 0 ? 0 : rawCount - (survived.length + dropped.length);   // line 496
// summary line 1:
'raw: ' + rawCount + ' -> clusters: ' + (survived.length + dropped.length) + ' (merged: ' + merged + ')'
```

`recheckClusters` only PARTITIONS the same clusters into kept/dropped -- it never creates or destroys a
cluster -- so `survived.length + dropped.length` is identically equal to `clusters.length` (= `rawCount`).
Therefore `merged` is **always 0**, for every possible input, and the `clusters:` figure equals `raw:`.

Confirmed empirically against the committed `near-duplicate-merged` fixture (2 claims from 2 sources
that genuinely merge into ONE cluster):

```
raw: 1 -> clusters: 1 (merged: 0)
```

The human-meaningful receipt should be `raw: 2 -> clusters: 1 (merged: 1)`. The proven spike baseline
(the thing this phase "hardens, do NOT rewrite the proven logic") got this right:
`raw worker files: 3 -> clusters: 2 (dup merged: 1)` -- it subtracted CLUSTER count from RAW CLAIM
count. The hardening regressed it: `mergeClusters` discards the raw-claim count (its local `raw` array),
so `aggregate` has no access to the pre-merge total and the formula collapses.

This violates D-03 / D-11 / the SS specifics ("every merge ... must show up as a count in
deterministic stdout") and the project's `web_tool_usage_must_be_observable` discipline. Because
Phase 17 FREEZES this stdout summary contract verbatim against the aggregator's proven behavior, a
broken merge count freezes into the downstream schema. The fixture suite does not catch it: no test
asserts the `raw ->` / `merged` numbers, and SC5-3/SC5-4 assert only `survivors.length` /
`corroboration_lower_bound`, never the summary's first line.

**Fix:** Have `mergeClusters` expose the raw claim count (or return it), and base the summary on it:

```js
// mergeClusters: return the raw claim count alongside clusters
export function mergeClusters(runDir) {
  // ... build raw[] and clusters[] as before ...
  return { clusters, rawClaimCount: raw.length };
}

// aggregate():
const { clusters, rawClaimCount } = mergeClusters(runDir);
// clusterCount is the post-merge cluster total (survived + dropped are a partition of it)
const clusterCount = clusters.length;
const merged = rawClaimCount - clusterCount;            // claims folded away by dedup
// ...
const summaryLine1 =
  'raw: ' + rawClaimCount + ' -> clusters: ' + clusterCount + ' (merged: ' + merged + ')';
```

Update the test to assert the first summary line on `near-duplicate-merged`
(`assert.match(r.summary, /^raw: 2 -> clusters: 1 \(merged: 1\)/m)`) so the regression cannot recur.
NOTE: changing `mergeClusters`'s return shape touches the exported surface 16-01-SUMMARY.md lists; if
that surface is itself considered frozen, prefer adding a non-breaking field (e.g. `aggregate` reads a
new `rawClaimCount` property) and coordinate with the Phase-17 freeze.

## Warnings

### WR-01: `normalize(undefined)` returns the literal token `"undefined"` -- a missing `quote`/`text` field can FALSE-VERIFY or wrongly merge

**File:** `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs:57-69, 268-288`
**Issue:**
`normalize(s)` begins with `String(s)`, so `normalize(undefined)` -> `String(undefined)` -> `'undefined'`
-> token `"undefined"`, and `normalize(null)` -> `"null"`. Consequences proven empirically:

- A claim member with NO `quote` field: `quoteOutcome` computes `nq = normalize(undefined) = 'undefined'`
  (non-empty, so the empty-quote guard at line 272 does NOT fire). If ANY stored excerpt contains the
  word "undefined", `allExcerpts.some(ex => ex.includes('undefined'))` returns true and the claim is
  **VERIFIED** (or downgraded) instead of dropped. Probe: missing-quote claim + excerpt
  `"the value is undefined in this passage"` -> survivor with `quote_fidelity: "verified"`.
- Two distinct claims both missing `text` normalize to the same token `"undefined"` (jaccard 1.0) and
  **merge into one cluster**, conflating unrelated claims.

The fixtures never exercise a missing `quote`/`text`, so this is uncaught. The quote re-check is the
load-bearing fidelity guard; a fabricated/empty quote silently passing it defeats the phase's purpose.

**Fix:** Reject or null-guard non-string inputs at the comparison boundary instead of coercing. Add an
early type guard at the top of `normalize` (keep the existing BOM strip as the `\uFEFF` escape, never a
literal byte, per CLAUDE.md ASCII-only):

```js
export function normalize(s) {
  if (typeof s !== 'string') {
    return ''; // undefined/null/number -> empty, so quoteOutcome's nq === '' guard drops it
  }

  return s
    .replace(/^\uFEFF/, '') // existing BOM strip, unchanged
    // ... rest of the pipeline unchanged ...
    .trim();
}
```

Returning `''` makes a missing quote hit the existing `nq === ''` -> `'dropped'` path, and makes
text-less claims non-mergeable empty-token sets. Add a fixture case (missing `quote`) asserting it drops.

### WR-02: missing `claims[].text` produces a survivor record with the FROZEN `claim` field silently absent from `survivors.json`

**File:** `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs:479-486`
**Issue:**
The survivor record is `{ id, claim: cl.text, ... }`. When a worker claim omits `text`, `cl.text` is
`undefined`; `JSON.stringify` drops own properties whose value is `undefined`, so the written
`survivors.json` record has NO `claim` key at all. The frozen contract (16-01-SUMMARY.md) declares
`claim` (string) a REQUIRED, load-bearing field that Phase 17 freezes and Phase 18/20 consume. A
survivor missing it will break a downstream schema validation or a `.claim` access. Proven: a
text-less claim yields `{"id":"cluster0","sources":["s1"],...}` with no `claim` line.

**Fix:** Validate required claim fields when reading worker files (fail closed, consistent with the
`missing claims[] array` ContractError at line 195), e.g. in `mergeClusters`:

```js
for (const c of w.claims) {
  if (typeof c.text !== 'string' || c.text.length === 0) {
    throw new ContractError('claim missing non-empty text', path.join(claimsDir, f));
  }

  raw.push({ ...c, source: w.source });
}
```

### WR-03: missing `claims/<worker>.json` `source` field leaks `null` into the FROZEN `sources[]` (declared `string[]`) and silently under-counts corroboration

**File:** `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs:199, 216, 483-484`
**Issue:**
`mergeClusters` does `raw.push({ ...c, source: w.source })` with no validation. When a worker file has
no `source`, `w.source` is `undefined`; the cluster Set becomes `new Set([undefined])`, and the
survivor record emits `sources: [...cl.sources].sort()` = `[null]` (undefined serializes to `null`
inside a JSON array) and `corroboration_lower_bound: 1`. The frozen contract declares
`sources` as `string[]`; a `null` element violates it. Worse, TWO distinct workers that both omit
`source` collapse to a single `null` Set entry -> `corroboration_lower_bound: 1` when two real
distinct sources existed -- silently UNDER-counting corroboration (proven: two undefined-source
workers with the same claim -> `corr: 1, sources: [null]`).

Per D-08 (corroboration counted by distinct source id) the `source` field is load-bearing for the
whole corroboration mechanism, so a missing source should fail closed, not coerce to `null`.

**Fix:** Validate `source` in `mergeClusters` alongside the existing `claims[]` check:

```js
if (typeof w.source !== 'string' || w.source.length === 0) {
  throw new ContractError('worker file missing non-empty source', path.join(claimsDir, f));
}
```

### WR-04: quote re-check uses raw-string `.includes` after token-join, so a quote can match ACROSS token boundaries / numeric substrings (e.g. `"30"` matches inside `"130"`)

**File:** `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs:279, 283`
**Issue:**
`quoteOutcome` does `cited.includes(nq)` / `ex.includes(nq)` where both sides are the
space-joined normalized token STRING. Because this is a substring test (not a token-sequence test), a
quote normalizing to `"30"` is reported present in an excerpt normalizing to
`"the rate is 130 overall"` -- `"...130 overall".includes("30")` is `true` (proven). The substring
`"30"` is found inside the token `"130"`. This over-verifies: a fabricated "X reduces Y by 30%" quote
would be VERIFIED against an excerpt that only ever said "130%". This behavior is inherited from the
spike's `quoteInExcerpt`, so it is "preserved proven behavior", but the spike never claimed
substring-safety, and the fidelity guard is the whole point of the phase. Since Phase 17 freezes this
match semantics, the false-positive class should be a conscious, documented decision -- not an
accident.

**Fix:** Either document the substring-match limitation explicitly in the code comment + the frozen
contract (cheapest, zero behavior change), or make the match token-boundary-aware by padding:

```js
// pad both sides with spaces so the substring test respects token boundaries
const hay = ' ' + cited + ' ';
const needle = ' ' + nq + ' ';
if (cited != null && hay.includes(needle)) {
  return 'verified';
}
```

(Padding changes proven behavior; coordinate with the Phase-17 freeze and re-run the fixtures before
adopting it. At minimum, raise the limitation to the user since it shapes the frozen fidelity contract.)

### WR-05: test suite writes an UNTRACKED artifact into the committed `__fixtures__` tree on every run (`crlf-bom-safe/excerpts/e1.txt`), polluting the working tree

**File:** `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs:112-130`
**Issue:**
The "CRLF+BOM excerpt ... still matches an LF quote" test does
`fs.mkdirSync(path.join(fx('crlf-bom-safe'), 'excerpts'), { recursive: true })` and
`fs.writeFileSync(.../e1.txt, ...)` INTO the committed fixture tree. The committed `crlf-bom-safe`
case ships only `claims/` and `votes/` (verified via `git ls-files`); the `excerpts/` directory is
created at runtime and is neither tracked nor gitignored. After running the suite, `git status` shows
`?? .../crlf-bom-safe/excerpts/` -- an untracked artifact that (a) dirties the tree, (b) risks being
accidentally `git add`-ed, and (c) means the test is not idempotent against a clean checkout. The
intent (author the only BOM/CRLF bytes at runtime so no non-ASCII byte is committed) is sound, but the
target should be an OS temp dir, not the committed fixture tree.

**Fix:** Write the runtime BOM/CRLF excerpt into a `fs.mkdtempSync(os.tmpdir(), ...)` run-dir that
also copies/links the committed `claims`+`votes`, and aggregate THAT temp dir; or add
`__fixtures__/crlf-bom-safe/excerpts/` to `.gitignore` if writing-in-place is intentional. Prefer the
temp dir so the test leaves no trace. (A `crlf-bom-safe/excerpts/` directory is currently present in
the working tree from this review's test run; it should be removed -- I was unable to delete it under
the review-only sandbox.)

## Info

### IN-01: `safeId` rejects any id CONTAINING `..` -- over-broad (would reject a legitimate `v1..2` token)

**File:** `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs:139`
**Issue:**
`id.includes('..')` rejects any id with a doubled dot anywhere (e.g. `report..final`, `v1..2`), not
just the parent-dir token. For the current controlled basenames this is harmless and fail-closed
(safe), but it is broader than the stated intent ("reject a parent-dir reference"). The path-separator
checks (`/[\\/]/`, `=== '.'`, `=== '..'`) already block real traversal; the `includes('..')` is the
only over-reach.
**Fix:** If a future id legitimately needs `..`, tighten to a path-component check (split on the
separator, reject any component equal to `..`). No change needed for the current frozen layout.

### IN-02: `loadExcerpts` reads excerpt `.txt` files via bare `readText` (no try/catch), so an unreadable excerpt throws a raw `Error`, not a `ContractError` naming the file

**File:** `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs:249`
**Issue:**
`mergeClusters`/`readJson` wrap file reads in `ContractError(... , file)` so the CLI exit-2 path names
the offending file (D-03). `loadExcerpts` calls `normalize(readText(path.join(excerptsDir, f)))`
directly; a mid-run unlink / permission error throws a raw Node `Error` that the CLI catch maps to
exit 2 but without the `(file)` suffix (the `err.file` branch at line 549 is empty). Minor consistency
gap in the fail-closed-naming-the-file contract; excerpt files are normally immutable so the window is
small.
**Fix:** Wrap the excerpt read like `readJson`:
`try { text = readText(p); } catch (err) { throw new ContractError('cannot read excerpt: ' + err.message, p); }`.

---

_Reviewed: 2026-06-15_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
