// lz-eval-search-loop.test.mjs
//
// MC/DC validation fixture for the autonomous search-and-stop CORE + the two retrieval adapters +
// the per-claim date-cutoff leakage guard + the URL canonicalization / SHA-256 filename rule
// (Phase 19, Plan 19-01). Dev-only eval-tree test: imports the SCRIPT under test (which imports the
// SHIPPED runtime aggregator's hardening primitives across trees, one-directional eval -> runtime)
// plus node stdlib only. No jstat is needed here; the module under test is node stdlib + the runtime
// hardening primitives.
//
// Every behavior assertion is DISCRIMINATING (proves the function actually flips / decides), never a
// tautology that would pass if the function returned a constant. The deterministic driver coverage
// follows 19-VALIDATION.md / 19-RESEARCH.md "Deterministic driver function coverage" (MC/DC):
//   - canonicalizeUrl: lowercases scheme+host; strips :80/:443; strips utm_*/denylist params;
//     strips fragment + trailing slash; preserves path; malformed URL fails closed.
//   - sourceFilename: deterministic SHA-256 hex; same key -> same name; different key -> different
//     name; no path separators in the output.
//   - parseAvtDate: valid DD-MM-YYYY parsed (UTC); malformed throws ContractError.
//   - dateFilter: pre-cutoff doc kept; post-cutoff dropped; undated dropped (fail-closed); the
//     boundary (== claim_date) is EXCLUDED.
//   - staticKsAdapter: returns only docs for the claim, date-filtered; empty KS -> empty.
//   - searchAndStop: min-not-met -> insufficient; minimums met + decisive -> judged verdict;
//     exhausted -> refuted-default; trace fields populated; the mechanical-minimum guard blocks an
//     early uphold.
//
// HOST QUIRK (load-bearing): on this host (Node v24.13.0 / Windows arm64 / Git Bash) the phase gate
// MUST target the explicit FILE form:
//   node --test eval/lz-eval-search-loop.test.mjs
// The directory form (`node --test <dir>`) spuriously exits 1 on this host even when every real
// test passes. The suite is one file, so the file form is the equivalent reliable gate.
//
// The byte-order mark is code point U+FEFF. In this source it appears ONLY via
// String.fromCharCode(0xFEFF) -- NEVER as a literal byte (ASCII-only source per CLAUDE.md).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  canonicalizeUrl,
  sourceFilename,
  parseAvtDate,
  dateFilter,
  staticKsAdapter,
  liveWebSearchAdapter,
  searchAndStop,
  SEARCH_DEFAULTS,
} from './lz-eval-search-loop.mjs';

// Resolve any fixtures test-file-relative (NEVER process.cwd() -- cwd drifts under GSD worktrees and
// headless `claude -p`). No on-disk fixture is needed here (all inputs are constructed in-memory),
// but HERE is established for parity with the sibling eval tests.
const HERE = path.dirname(fileURLToPath(import.meta.url));
void HERE;

// ===========================================================================
// canonicalizeUrl (D-13): the concrete URL canonicalization recipe.
// ===========================================================================

test('D-13 canonicalizeUrl lowercases the scheme and host (preserving the path case)', () => {
  const out = canonicalizeUrl('HTTPS://Example.ORG/A/Study');
  assert.equal(out, 'https://example.org/A/Study', 'scheme+host lowercased; path case preserved');
});

test('D-13 canonicalizeUrl strips the default ports 80 (http) and 443 (https)', () => {
  assert.equal(canonicalizeUrl('http://example.org:80/a'), 'http://example.org/a', 'strips :80 on http');
  assert.equal(canonicalizeUrl('https://example.org:443/a'), 'https://example.org/a', 'strips :443 on https');
  // A NON-default port is preserved (discriminating: the strip is port-specific, not a blanket drop).
  assert.equal(canonicalizeUrl('https://example.org:8443/a'), 'https://example.org:8443/a', 'non-default port kept');
});

test('D-13 canonicalizeUrl strips utm_* and the tracking-param denylist, preserving other params', () => {
  const out = canonicalizeUrl(
    'https://example.org/p?utm_source=x&utm_medium=y&fbclid=z&gclid=g&keep=1&ref=foo&msclkid=m',
  );
  // The denylist + utm_ prefix params are gone; a legitimate param survives.
  assert.ok(/keep=1/.test(out), 'a non-tracking param (keep=1) is preserved');
  assert.ok(!/utm_/.test(out), 'utm_* params stripped');
  assert.ok(!/fbclid/.test(out), 'fbclid stripped');
  assert.ok(!/gclid/.test(out), 'gclid stripped');
  assert.ok(!/msclkid/.test(out), 'msclkid stripped');
  assert.ok(!/(\?|&)ref=/.test(out), 'ref stripped');
});

test('D-13 canonicalizeUrl is DISCRIMINATING: a tracking-only query string collapses to no query', () => {
  // If the canonicalizer did NOT strip tracking params, this URL would retain a query string. The
  // flip is that an all-tracking query is fully removed.
  const out = canonicalizeUrl('https://example.org/p?utm_source=x&igshid=q&mc_eid=e');
  assert.ok(!out.includes('?'), 'an all-tracking query string is fully removed');
  assert.equal(out, 'https://example.org/p', 'only the clean path/host survives');
});

test('D-13 canonicalizeUrl strips tracking params CASE-INSENSITIVELY (FBCLID / Ref / UTM_Source -- F3)', () => {
  // Upper/mixed-case tracking keys must be stripped too, else two variants of one source canonicalize
  // to DIFFERENT keys -> different SHA-256 dedup filenames (the dedup invariant breaks). Pre-fix the
  // case-sensitive denylist let FBCLID / Ref survive.
  const out = canonicalizeUrl('https://example.org/p?FBCLID=z&Ref=foo&UTM_Source=x&keep=1');
  assert.ok(/keep=1/.test(out), 'a non-tracking param survives');
  assert.ok(!/fbclid/i.test(out), 'FBCLID (uppercase) stripped case-insensitively');
  assert.ok(!/(\?|&)ref=/i.test(out), 'Ref (capitalized) stripped case-insensitively');
  assert.ok(!/utm_/i.test(out), 'UTM_Source (uppercase prefix) stripped case-insensitively');
  // The dedup invariant holds across a lowercase and an uppercase tracking variant of one source.
  const lower = canonicalizeUrl('https://example.org/study?id=7&fbclid=abc');
  const upper = canonicalizeUrl('https://example.org/study?id=7&FBCLID=abc');
  assert.equal(lower, upper, 'lowercase and uppercase tracking variants collapse to one canonical key');
});

test('D-13 canonicalizeUrl strips the URL fragment', () => {
  assert.equal(canonicalizeUrl('https://example.org/a#section-2'), 'https://example.org/a', 'fragment stripped');
});

test('D-13 canonicalizeUrl strips a single trailing slash, INCLUDING the bare-host root slash (consistent dedup key)', () => {
  assert.equal(canonicalizeUrl('https://example.org/a/'), 'https://example.org/a', 'path trailing slash stripped');
  // The bare-host root slash is ALSO stripped: https://example.org/ and https://example.org collapse to
  // ONE canonical key (intended dedup -- same resource). The prior test name wrongly implied the root
  // slash was PRESERVED; the source strips it (and that is correct, D1-5).
  assert.equal(canonicalizeUrl('https://example.org/'), 'https://example.org', 'bare-host root slash stripped');
  assert.equal(canonicalizeUrl('https://example.org'), 'https://example.org', 'bare host (no slash) unchanged');
});

test('D-13 canonicalizeUrl preserves the path and yields a stable key for two tracking variants', () => {
  // Two URLs that differ ONLY by tracking params canonicalize to the SAME key (the dedup invariant
  // the source-key collapse depends on).
  const a = canonicalizeUrl('https://example.org/study?utm_campaign=spring&id=7');
  const b = canonicalizeUrl('https://example.org/study?id=7&fbclid=abc');
  assert.equal(a, b, 'two tracking variants of one source collapse to one canonical key');
  assert.ok(/\/study/.test(a), 'the path is preserved');
});

test('D-13 canonicalizeUrl fails closed on a malformed URL (new URL throws)', () => {
  assert.throws(
    () => canonicalizeUrl('not a url'),
    (err) => err instanceof Error,
    'a malformed URL must throw (fail-closed upstream)',
  );
});

// ===========================================================================
// sourceFilename (D-13): SHA-256 hex of the canonical key + '.json', no path separators.
// ===========================================================================

test('D-13 sourceFilename is the deterministic SHA-256 hex of the key + .json', () => {
  const key = 'https://example.org/a/study';
  const expected = createHash('sha256').update(key, 'utf8').digest('hex') + '.json';
  assert.equal(sourceFilename(key), expected, 'sha256-hex of the key + .json');
});

test('D-13 sourceFilename: same key -> same name; different key -> different name (DISCRIMINATING)', () => {
  const a = sourceFilename('https://example.org/a');
  const aAgain = sourceFilename('https://example.org/a');
  const b = sourceFilename('https://example.org/b');
  assert.equal(a, aAgain, 'deterministic: the same key yields the same filename');
  assert.notEqual(a, b, 'different keys yield different filenames (no constant collision)');
});

test('D-13 sourceFilename output has no path separators (traversal-safe filename, T-19-01)', () => {
  // A key containing slashes and dot-segments must NOT leak into the filename -- the SHA-256 hex
  // eliminates the path-separator vector by construction.
  const name = sourceFilename('https://evil.example/../../etc/passwd');
  assert.ok(!/[\\/]/.test(name), 'no path separators in the filename');
  assert.ok(!name.includes('..'), 'no parent-dir reference in the filename');
  assert.ok(/^[0-9a-f]{64}\.json$/.test(name), 'filename is exactly 64 hex chars + .json');
});

// ===========================================================================
// parseAvtDate (D-07): DD-MM-YYYY -> UTC Date; malformed throws ContractError.
// ===========================================================================

test('D-07 parseAvtDate parses a valid DD-MM-YYYY into a UTC Date', () => {
  const d = parseAvtDate('31-10-2020');
  assert.equal(d.getUTCFullYear(), 2020, 'year');
  assert.equal(d.getUTCMonth(), 9, 'month is 0-based October = 9');
  assert.equal(d.getUTCDate(), 31, 'day');
  assert.equal(d.getTime(), Date.UTC(2020, 9, 31), 'exact UTC epoch');
});

test('D-07 parseAvtDate fails closed on a malformed date (ContractError naming the date file)', () => {
  assert.throws(
    () => parseAvtDate('2020-10-31'),
    (err) => err.name === 'ContractError' && /unparseable|date/i.test(err.message),
    'an ISO-shaped (not DD-MM-YYYY) date must throw ContractError',
  );
  assert.throws(
    () => parseAvtDate('not-a-date'),
    (err) => err.name === 'ContractError' && /unparseable|date/i.test(err.message),
    'garbage must throw ContractError',
  );
});

test('D-07 parseAvtDate range-checks the components (a shape-valid but out-of-range date throws, no rollover -- probe #4)', () => {
  // A shape-valid but out-of-range date must NOT silently roll over (99-99-2020 -> a future month;
  // 31-02-2020 -> early March). Fail closed so a bogus date can never become a real cutoff.
  assert.throws(
    () => parseAvtDate('99-99-2020'),
    (err) => err.name === 'ContractError' && /out-of-range|date/i.test(err.message),
    'an impossible month/day must throw, not roll over',
  );
  assert.throws(
    () => parseAvtDate('31-02-2020'),
    (err) => err.name === 'ContractError' && /out-of-range|date/i.test(err.message),
    'Feb 31 must throw (no rollover into March)',
  );
  assert.throws(
    () => parseAvtDate('00-01-2020'),
    (err) => err.name === 'ContractError',
    'day 00 must throw',
  );
  // DISCRIMINATING: a genuinely valid edge date (leap day) still parses -- the guard rejects only
  // invalid dates, not all dates.
  assert.equal(parseAvtDate('29-02-2020').getUTCDate(), 29, 'a real leap day (29-02-2020) still parses');
});

// ===========================================================================
// dateFilter (D-05/D-07): the per-claim date-cutoff leakage guard.
// ===========================================================================

test('D-07 dateFilter keeps a pre-cutoff doc, drops a post-cutoff doc, drops an undated doc', () => {
  const claimDate = parseAvtDate('15-06-2020');
  const docs = [
    { url: 'https://a/pre', date: '01-01-2020' }, // pre-cutoff -> KEEP
    { url: 'https://a/post', date: '01-01-2021' }, // post-cutoff -> DROP
    { url: 'https://a/undated', date: null }, // undated -> DROP (fail-closed)
  ];
  const kept = dateFilter(docs, claimDate);
  const urls = kept.map((d) => d.url);
  assert.deepEqual(urls, ['https://a/pre'], 'only the pre-cutoff doc survives');
});

test('D-07 dateFilter EXCLUDES the boundary (a doc dated exactly == claim_date is dropped)', () => {
  // Strict less-than: a doc dated ON the claim date is post-or-equal and must be EXCLUDED (the
  // fail-closed leakage rule; a same-day fact-check could carry the published verdict).
  const claimDate = parseAvtDate('15-06-2020');
  const docs = [{ url: 'https://a/boundary', date: '15-06-2020' }];
  const kept = dateFilter(docs, claimDate);
  assert.equal(kept.length, 0, 'a doc dated exactly == claim_date is EXCLUDED (strict <)');
});

test('D-07 dateFilter is DISCRIMINATING: it does not return the input unchanged', () => {
  const claimDate = parseAvtDate('15-06-2020');
  const docs = [
    { url: 'https://a/pre', date: '01-01-2020' },
    { url: 'https://a/post', date: '01-01-2021' },
  ];
  const kept = dateFilter(docs, claimDate);
  assert.notEqual(kept.length, docs.length, 'the filter actually drops a post-cutoff doc (not a pass-through)');
});

// ===========================================================================
// staticKsAdapter (D-09): the offline retrieval adapter -- KS docs for the claim, date-filtered.
// ===========================================================================

test('D-09 staticKsAdapter.fetchResults returns ONLY this claim docs, date-filtered', () => {
  const claimDate = parseAvtDate('15-06-2020');
  const ksByClaim = {
    c1: [
      { url: 'https://a/pre', date: '01-01-2020', snippet: 's1' },
      { url: 'https://a/post', date: '01-01-2021', snippet: 's2' },
    ],
    c2: [{ url: 'https://b/other', date: '01-01-2019', snippet: 'other' }],
  };
  const adapter = staticKsAdapter(ksByClaim, 'c1', claimDate);
  const results = adapter.fetchResults('any query');
  const urls = results.map((d) => d.url);
  assert.deepEqual(urls, ['https://a/pre'], 'only c1 docs dated pre-cutoff are returned (c2 + post-cutoff excluded)');
});

test('D-09 staticKsAdapter is DISCRIMINATING: a different claim id yields different (or no) docs', () => {
  const claimDate = parseAvtDate('15-06-2020');
  const ksByClaim = {
    c1: [{ url: 'https://a/pre', date: '01-01-2020', snippet: 's1' }],
    c2: [{ url: 'https://b/pre', date: '01-01-2019', snippet: 's2' }],
  };
  const a1 = staticKsAdapter(ksByClaim, 'c1', claimDate).fetchResults('q');
  const a2 = staticKsAdapter(ksByClaim, 'c2', claimDate).fetchResults('q');
  assert.notDeepEqual(
    a1.map((d) => d.url),
    a2.map((d) => d.url),
    'the adapter is claim-scoped (c1 docs differ from c2 docs)',
  );
});

test('D-09 staticKsAdapter on an empty / absent KS for the claim returns an empty result set', () => {
  const claimDate = parseAvtDate('15-06-2020');
  const adapter = staticKsAdapter({ c1: [] }, 'c1', claimDate);
  assert.deepEqual(adapter.fetchResults('q'), [], 'empty KS -> empty');
  const missing = staticKsAdapter({}, 'cX', claimDate);
  assert.deepEqual(missing.fetchResults('q'), [], 'absent claim id -> empty (no throw)');
});

test('D-09 liveWebSearchAdapter exposes the same fetchResults seam shape (stub, not executed in eval)', () => {
  // The production binding is realized agent-side (the model executes WebSearch); this is the shape
  // stub. It must expose fetchResults so the searchAndStop core is adapter-agnostic.
  const adapter = liveWebSearchAdapter();
  assert.equal(typeof adapter.fetchResults, 'function', 'liveWebSearchAdapter exposes fetchResults');
});

// ===========================================================================
// searchAndStop (D-09/D-10/D-11): the ONE shared spine + the mechanical-minimum guard.
// ===========================================================================

test('D-09 searchAndStop frozen SEARCH_DEFAULTS pin the mechanical minimums (minQueries=3, minDocs=5)', () => {
  assert.equal(SEARCH_DEFAULTS.minQueries, 3, 'pre-registered minQueries floor');
  assert.equal(SEARCH_DEFAULTS.minDocs, 5, 'pre-registered minDocs floor');
  assert.ok(Object.isFrozen(SEARCH_DEFAULTS), 'the defaults are Object.frozen (anti-drift)');
});

test('D-10 searchAndStop: minimums NOT met -> insufficient with stop_reason min-not-met (early-uphold blocked)', () => {
  // An adapter that returns nothing: the loop can never reach minDocs, so it must NOT uphold. The
  // mechanical-minimum guard is the load-bearing anti-lazy-stop behavior.
  const adapter = { fetchResults: () => [] };
  const { verdict, trace } = searchAndStop({
    claim: { id: 'c1', text: 'X' },
    attackMode: 'disconfirm',
    adapter,
    minQueries: 3,
    minDocs: 5,
    maxQueries: 5,
  });
  assert.equal(verdict, 'insufficient', 'no docs -> cannot uphold -> insufficient');
  assert.equal(trace.stop_reason, 'min-not-met', 'stop_reason records the minimum was not met');
  assert.ok(Array.isArray(trace.queries) && trace.queries.length > 0, 'trace.queries populated');
});

test('D-10 searchAndStop: an EARLY decisive hit before minQueries does NOT short-circuit to a verdict', () => {
  // Even if decisive evidence appears on query 1, the guard forbids returning a judged verdict
  // before BOTH minQueries and minDocs are met -- this is the anti-early-uphold guard.
  let calls = 0;
  const adapter = {
    fetchResults: () => {
      calls += 1;
      // Each call returns 5 docs (so minDocs=5 is satisfiable in one query), one decisive.
      return [
        { url: 'https://a/1', date: '01-01-2020', decisive: true, verdict: 'refuted' },
        { url: 'https://a/2', date: '01-01-2020' },
        { url: 'https://a/3', date: '01-01-2020' },
        { url: 'https://a/4', date: '01-01-2020' },
        { url: 'https://a/5', date: '01-01-2020' },
      ];
    },
  };
  const { trace } = searchAndStop({
    claim: { id: 'c1', text: 'X' },
    attackMode: 'disconfirm',
    adapter,
    minQueries: 3,
    minDocs: 5,
    maxQueries: 5,
  });
  // The guard means it cannot stop at query 1 even though minDocs is already met -- it needs >=3
  // queries. So at least 3 queries are issued.
  assert.ok(calls >= 3, 'the minQueries floor is enforced even when minDocs is met early (got ' + calls + ' calls)');
  assert.ok(trace.queries.length >= 3, 'trace shows >= minQueries queries issued before stopping');
});

test('D-10 searchAndStop: minimums met + decisive evidence -> judged verdict, stop_reason decisive-evidence', () => {
  // Decisive 'refuted' evidence present once minimums are met -> the judged verdict is returned.
  const adapter = {
    fetchResults: () => [
      { url: 'https://a/d', date: '01-01-2020', decisive: true, verdict: 'refuted' },
      { url: 'https://a/2', date: '01-01-2020' },
    ],
  };
  const { verdict, trace } = searchAndStop({
    claim: { id: 'c1', text: 'X' },
    attackMode: 'disconfirm',
    adapter,
    minQueries: 3,
    minDocs: 5,
    maxQueries: 8,
  });
  assert.equal(verdict, 'refuted', 'the decisive evidence verdict is returned once minimums are met');
  assert.equal(trace.stop_reason, 'decisive-evidence', 'stop_reason records the decisive stop');
  assert.ok(trace.depth >= 5, 'depth reflects the docs explored (>= minDocs)');
});

test('D-10 searchAndStop: minimums met, NO decisive evidence by exhaustion -> refuted-default / exhausted', () => {
  // The loop sees enough docs across enough queries but none decisive -> exhaustion with minimums
  // met returns the refuted-default (never a lazy uphold).
  const adapter = {
    fetchResults: () => [
      { url: 'https://a/x', date: '01-01-2020' },
      { url: 'https://a/y', date: '01-01-2020' },
    ],
  };
  const { verdict, trace } = searchAndStop({
    claim: { id: 'c1', text: 'X' },
    attackMode: 'disconfirm',
    adapter,
    minQueries: 3,
    minDocs: 5,
    maxQueries: 4,
  });
  assert.equal(verdict, 'refuted-default', 'exhaustion with minimums met returns refuted-default (no default uphold)');
  assert.equal(trace.stop_reason, 'exhausted', 'stop_reason records exhaustion');
  assert.ok(trace.depth >= 5, 'minDocs was met before exhaustion');
});

test('D-10 searchAndStop: the trace is fully populated (queries[], depth, stop_reason)', () => {
  const adapter = { fetchResults: () => [{ url: 'https://a/x', date: '01-01-2020' }] };
  const { trace } = searchAndStop({
    claim: { id: 'c1', text: 'X' },
    attackMode: 'disconfirm',
    adapter,
    minQueries: 2,
    minDocs: 3,
    maxQueries: 3,
  });
  assert.ok(Array.isArray(trace.queries), 'trace.queries is an array');
  assert.equal(typeof trace.depth, 'number', 'trace.depth is a number');
  assert.ok(trace.stop_reason !== null, 'trace.stop_reason is set');
});

test('D-09 searchAndStop is DISCRIMINATING: an evidence-rich adapter and an empty one give different verdicts', () => {
  const empty = { fetchResults: () => [] };
  const rich = {
    fetchResults: () => [
      { url: 'https://a/d', date: '01-01-2020', decisive: true, verdict: 'refuted' },
      { url: 'https://a/2', date: '01-01-2020' },
      { url: 'https://a/3', date: '01-01-2020' },
      { url: 'https://a/4', date: '01-01-2020' },
      { url: 'https://a/5', date: '01-01-2020' },
    ],
  };
  const args = { claim: { id: 'c1', text: 'X' }, attackMode: 'disconfirm', minQueries: 3, minDocs: 5, maxQueries: 5 };
  const ve = searchAndStop({ ...args, adapter: empty }).verdict;
  const vr = searchAndStop({ ...args, adapter: rich }).verdict;
  assert.notEqual(ve, vr, 'the verdict flips with the evidence (not a constant)');
  assert.equal(ve, 'insufficient');
  assert.equal(vr, 'refuted');
});

test('D-10 searchAndStop fails closed on non-positive minimums ({minQueries:0,minDocs:0} cannot bypass the guard -- probe #3)', () => {
  // { minQueries: 0, minDocs: 0 } would make `q+1>=0 && docsSeen>=0` trivially true and permit an
  // uphold-equivalent stop with NO search. Positive-integer validation fails it closed.
  const adapter = { fetchResults: () => [{ url: 'https://a/x', date: '01-01-2020', decisive: true, verdict: 'refuted' }] };
  assert.throws(
    () => searchAndStop({ claim: { id: 'c1', text: 'X' }, attackMode: 'disconfirm', adapter, minQueries: 0, minDocs: 0, maxQueries: 5 }),
    (err) => err.name === 'ContractError' && /positive integer/.test(err.message),
    'minQueries:0 / minDocs:0 fails closed (no zero-search uphold)',
  );
  assert.throws(
    () => searchAndStop({ claim: { id: 'c1', text: 'X' }, attackMode: 'disconfirm', adapter, minQueries: 3, minDocs: 5, maxQueries: 0 }),
    (err) => err.name === 'ContractError' && /positive integer/.test(err.message),
    'maxQueries:0 fails closed',
  );
});

test('D-10 searchAndStop pools decisive evidence across queries -- an EARLY decisive doc is retained (F1)', () => {
  // A decisive doc appears ONLY on query 1 (before the minQueries floor is met); later queries return
  // non-decisive docs. The pre-fix batch-only check forgot it and exhausted to refuted-default; the
  // pooled check retains it and returns the decisive verdict once the minimums are met. This is the
  // discriminating fixture: identical-batch adapters cannot distinguish the pooled fix from the bug.
  let q = 0;
  const adapter = {
    fetchResults: () => {
      q += 1;

      if (q === 1) {
        return [
          { url: 'https://a/decisive', date: '01-01-2020', decisive: true, verdict: 'refuted' },
          { url: 'https://a/x1', date: '01-01-2020' },
        ];
      }

      return [
        { url: 'https://a/n' + q, date: '01-01-2020' },
        { url: 'https://a/m' + q, date: '01-01-2020' },
      ];
    },
  };
  const { verdict, trace } = searchAndStop({
    claim: { id: 'c1', text: 'X' },
    attackMode: 'disconfirm',
    adapter,
    minQueries: 3,
    minDocs: 5,
    maxQueries: 6,
  });
  assert.equal(verdict, 'refuted', 'the early decisive verdict is retained via the doc pool (not forgotten)');
  assert.equal(trace.stop_reason, 'decisive-evidence', 'the pooled decisive evidence stops the loop once minimums are met');
});
