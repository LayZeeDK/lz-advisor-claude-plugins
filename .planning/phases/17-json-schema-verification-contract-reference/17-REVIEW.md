---
phase: 17-json-schema-verification-contract-reference
reviewed: 2026-06-15T00:00:00Z
depth: standard
files_reviewed: 21
files_reviewed_list:
  - plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs
  - plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs
  - plugins/lz-advisor/references/lz-deep-research-schema.md
  - plugins/lz-advisor/skills/lz-deep-research/scripts/__fixtures__/contested-split/claims/w1.json
  - plugins/lz-advisor/skills/lz-deep-research/scripts/__fixtures__/contested-split/excerpts/e1.txt
  - plugins/lz-advisor/skills/lz-deep-research/scripts/__fixtures__/contested-split/votes/cluster0-0.json
  - plugins/lz-advisor/skills/lz-deep-research/scripts/__fixtures__/contested-split/votes/cluster0-1.json
  - plugins/lz-advisor/skills/lz-deep-research/scripts/__fixtures__/low-refuted-downgraded/claims/w1.json
  - plugins/lz-advisor/skills/lz-deep-research/scripts/__fixtures__/low-refuted-downgraded/excerpts/e1.txt
  - plugins/lz-advisor/skills/lz-deep-research/scripts/__fixtures__/low-refuted-downgraded/votes/cluster0-0.json
  - plugins/lz-advisor/skills/lz-deep-research/scripts/__fixtures__/low-refuted-downgraded/votes/cluster0-1.json
  - plugins/lz-advisor/skills/lz-deep-research/scripts/__fixtures__/low-refuted-downgraded/votes/cluster0-2.json
  - plugins/lz-advisor/skills/lz-deep-research/scripts/__fixtures__/low-thin-support/claims/w1.json
  - plugins/lz-advisor/skills/lz-deep-research/scripts/__fixtures__/low-thin-support/excerpts/e1.txt
  - plugins/lz-advisor/skills/lz-deep-research/scripts/__fixtures__/low-thin-support/votes/cluster0-0.json
  - plugins/lz-advisor/skills/lz-deep-research/scripts/__fixtures__/medium-two-unrefuted/claims/w1.json
  - plugins/lz-advisor/skills/lz-deep-research/scripts/__fixtures__/medium-two-unrefuted/excerpts/e1.txt
  - plugins/lz-advisor/skills/lz-deep-research/scripts/__fixtures__/medium-two-unrefuted/votes/cluster0-0.json
  - plugins/lz-advisor/skills/lz-deep-research/scripts/__fixtures__/medium-two-unrefuted/votes/cluster0-1.json
  - plugins/lz-advisor/skills/lz-deep-research/scripts/__fixtures__/unsupported-no-votes/claims/w1.json
  - plugins/lz-advisor/skills/lz-deep-research/scripts/__fixtures__/unsupported-no-votes/excerpts/e1.txt
findings:
  critical: 1
  warning: 2
  info: 2
  total: 5
status: issues_found
---

# Phase 17: Code Review Report

**Reviewed:** 2026-06-15T00:00:00Z
**Depth:** standard
**Files Reviewed:** 21
**Status:** issues_found

## Summary

Phase 17 corrects the deep-research aggregator confidence vocabulary to the single
canonical 5-tier enum, freezes the corrected shapes in the reference doc, and adds
six committed tier fixtures plus six new PIPE-07 coverage tests. The production code
itself is in good shape: the `tally()` branch order is correct (Contested precedes
Medium), the downgrade-not-delete invariant holds (a 3/3-refuted claim resolves to
`Low` and STAYS in survivors), the doc freezes the rubric / CEILINGS / survivor record
byte-for-byte against the code, and all files are pure ASCII with LF endings (verified
via `git ls-files --eol`: `i/lf w/lf`). The full suite passes (19/19) on the host file
form.

The defect that matters is in the TEST COVERAGE, not the production logic: the suite
that exists specifically to guard the "CRITICAL ordering invariant" does not actually
exercise the only input that can distinguish the correct branch order from the buggy
swapped order. A reviewer following the phase intent's explicit instruction to check
"whether the fixtures genuinely encode their intended tier (not tautological)" finds
that the Contested fixture is a `1-unrefuted / 1-refuted` split -- which classifies as
`Contested` regardless of branch order. The regression the phase exists to prevent
would ship green. This is a BLOCKER because the safety net advertised as protecting the
invariant is non-functional.

Two warnings (an unenforced contract-required field and a contradictory worked-example
claim in a test comment) and two info-level doc/comment defects round out the findings.

## Critical Issues

### CR-01: Contested-tier fixture cannot catch the branch-ordering regression it claims to guard (false safety net)

**File:** `plugins/lz-advisor/skills/lz-deep-research/scripts/__fixtures__/contested-split/votes/cluster0-0.json` + `cluster0-1.json`; test `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs:120-126`; production invariant at `lz-deep-research-aggregate.mjs:495-501`

**Issue:**
The phase intent names ONE invariant CRITICAL: the `unrefuted >= 1 && refuted >= 1 -> Contested`
branch MUST precede the `unrefuted === 2 -> Medium` branch, "or a 2-unrefuted/1-refuted
split silently returns Medium and erases the dissent." The PIPE-07 Contested test
(`lz-deep-research-aggregate.test.mjs:120-126`) asserts this, and its inline comment claims
"the split branch fires BEFORE the Medium branch."

But the `contested-split` fixture encodes `unrefuted=1 / refuted=1` (one `unrefuted` seat
file, one `refuted` seat file -- confirmed by reading both vote files and by `git grep`
across all 10 fixtures: none encode a 2-unrefuted/1-refuted combination). With `unrefuted=1`,
the `unrefuted === 2` Medium branch is FALSE regardless of where it sits in the chain. I
proved this by simulating the swapped rubric (Medium branch first) against the fixture's
tally inputs:

```
swapped-rubric on 1-unrefuted/1-refuted: Contested   (test still passes -- bug undetected)
swapped-rubric on 2-unrefuted/1-refuted: Medium      (the ONLY input that exposes the bug)
```

The test would pass even if a future edit swapped the branch order, because no committed
fixture and no test ever feeds tally a `2-unrefuted / 1-refuted` tally. The doc's own truth
table (`lz-deep-research-schema.md:300`) lists `2 | 1 | 0 -> Contested` as a covered row, but
nothing exercises it. The advertised guard for the phase's single CRITICAL invariant is
non-functional -- the regression it exists to prevent ships green.

**Fix:**
Add a committed fixture (e.g. `contested-two-unrefuted-one-refuted/`) whose votes are
exactly the load-bearing case, and a distinct PIPE-07 test asserting it. Either retarget the
existing fixture to 3 seats or add a second one:

```
votes/cluster0-0.json -> {"verdict":"unrefuted"}
votes/cluster0-1.json -> {"verdict":"unrefuted"}
votes/cluster0-2.json -> {"verdict":"refuted"}
```

```javascript
test('PIPE-07 Contested precedes Medium: 2 unrefuted + 1 refuted -> Contested (NOT Medium)', () => {
  // This is the ONLY tally that distinguishes correct order from the swapped-branch bug:
  // unrefuted === 2 is TRUE, so a Medium-first rubric would return Medium and erase dissent.
  const r = aggregate(fx('contested-two-unrefuted-one-refuted'));
  assert.equal(r.survivors[0].confidence, 'Contested');
});
```

Keep the existing 1/1 fixture (it covers the `unrefuted=1` Contested path), but it must not
be presented as the guard for the branch-ordering invariant.

## Warnings

### WR-01: `claims[].id` is declared contract-required but never enforced; missing id silently coerces to the string `'undefined'`

**File:** `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs:221-235` (validation) and `:439` (consumption); contract in `lz-deep-research-schema.md:147`

**Issue:**
`mergeClusters` fail-closes on missing `text`, `quote`, and `source` (WR-01/02/03 guards), but
NOT on missing `claims[].id`. The schema doc declares `claims[].id` as `Required: yes`
("Claim id; used as the first-member fallback for the vote-file lookup", `:147`). When a claim
lacks `id`, `tally` computes `memberId = safeId(String(cl.members[0].id))` = `safeId('undefined')`
(`:439`). `safeId` does NOT reject `'undefined'` (no path separator), so the member-fallback
vote lookup silently searches for files named `undefined-0.json`. This is exactly the
`String(undefined) -> 'undefined'` coercion the module's own `normalize()` comment
(`:58-63`) explicitly calls out as a bug pattern to avoid -- a non-string field producing a
spurious non-empty token. It is masked here only because the cluster-id lookup is tried first,
but it is a doc/code contract mismatch and a latent silent-misbehavior path.

**Fix:**
Add a fail-closed guard alongside the existing field validators in `mergeClusters`:

```javascript
if (typeof c.id !== 'string' || c.id.length === 0) {
  throw new ContractError('claim missing non-empty id', path.join(claimsDir, f));
}
```

If `id` is genuinely intended to be optional (contradicting the doc), instead guard the
fallback in `tally` so a missing id yields `null` (cluster-id-only lookup) rather than the
literal `'undefined'`, and downgrade the doc's Required to optional. Either way, code and doc
must agree.

### WR-02: PIPE-07 Contested test comment makes a claim the fixture does not substantiate

**File:** `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs:120-126`

**Issue:**
The test comment states: "A voter split (cluster0-0 unrefuted, cluster0-1 refuted) -> the
split branch fires BEFORE the Medium branch, so the dissent is surfaced as Contested rather
than silently Medium." This asserts the test proves the ordering, but it does not: with
`unrefuted=1` the Medium branch never evaluates true, so "fires before the Medium branch" is
not demonstrated by this input (see CR-01). The same misleading framing appears in the
5-label test (`:166-169`, "Seed cluster0 as a Contested split"). A future maintainer reading
this comment will believe the ordering is under test when it is not.

**Fix:**
Once CR-01's 2/1 fixture exists, move the "fires before the Medium branch" claim onto that
test. Rewrite this comment to state only what the 1/1 fixture proves: "any explicit refutation
alongside support yields Contested (the `unrefuted >= 1 && refuted >= 1` branch with
unrefuted=1)."

## Info

### IN-01: `recheckClusters` doc comment is a garbled, self-contradictory sentence

**File:** `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs:335`

**Issue:**
Line 335 reads: "fidelity is 'verified' unless ALL kept members are 'downgraded' is false --
i.e. fidelity is 'downgraded' when no kept member is 'verified'". The first clause
("verified unless ALL ... 'downgraded' is false") is malformed and contradicts itself. The
code (`:367`, `hasVerified ? 'verified' : 'downgraded'`) is correct; only the comment is
broken.

**Fix:**
Replace with the clause already correct in the same comment: "fidelity is 'verified' when at
least one kept member is 'verified', otherwise 'downgraded' (any verified member lifts the
cluster)."

### IN-02: PIPE-07 Medium/Low/Unsupported tests do not assert `quote_fidelity`, leaving the upstream-quote-recheck interaction implicit

**File:** `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs:96-133`

**Issue:**
The new tier tests assert only `survivors.length` and `confidence`. Because the quote-recheck
runs UPSTREAM of tally (D-06), each tier fixture's claim must first survive the quote-recheck
to reach tally at all. The tests pass because every tier fixture's quote ("X reduces Y by 30%")
verifies against its excerpt (I confirmed `quote_fidelity=verified` for all five via direct
aggregation), but the tests do not assert this precondition. A future fixture edit that
broke the excerpt would change which code path produced the result (drop vs. tally) without
the test name reflecting it. Low severity -- the behavior is correct today and the upstream
drop is covered by SC5-1 separately.

**Fix:**
Optionally add `assert.equal(r.survivors[0].quote_fidelity, 'verified')` to the per-tier
tests so the precondition (claim reached tally via a verified quote) is explicit and a broken
fixture excerpt fails loudly at the right assertion.

---

_Reviewed: 2026-06-15T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
