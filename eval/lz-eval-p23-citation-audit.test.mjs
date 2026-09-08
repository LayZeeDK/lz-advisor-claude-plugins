// lz-eval-p23-citation-audit.test.mjs
//
// Co-test for the ENV-04 citation-audit module's FIRST slice (Plan 23-01, Task 1; NO-SPEND): the
// format-agnostic identifier canonicalizer and its frozen constants. Dev-only eval-tree test: it
// imports the module under test plus node stdlib only. There is NO model call and NO network here --
// canonicalizeCitation is a pure string transform.
//
// WHY THIS ONE RULE MATTERS (D-13 / the format-sensitive-citation-metric anti-pattern): the two systems
// cite differently. The built-in emits numbered references to bare arXiv identifiers in prose (0 inline
// URLs in the q1 report); lz emits full inline URLs. Without a canonical identifier both formats of the
// SAME paper count as different citations, and any URL-counting-shaped metric silently favours lz. This
// canonicalizer is what makes the two report formats comparable at all.
//
// Asserted behaviors (one named test each, never a tautology):
//   - ARXIV_RE / DOI_RE / KEEP_PARAMS are exported module-level constants (KEEP_PARAMS Object.frozen).
//   - the three surface forms of the SAME arXiv paper collapse to one identifier.
//   - the arXiv rule covers the abs / pdf / html URL shapes and the version suffix.
//   - a DOI token canonicalizes lowercased with trailing punctuation stripped.
//   - a scheme-less host/path canonicalizes to url:host/path (the built-in bare-host form).
//   - the scheme case, www., a trailing slash and a fragment are all normalized away.
//   - a non-allowlisted query parameter drops; an allowlisted one is kept and sorted.
//   - an unparseable token lands in the raw: bucket -- REPORTED, never dropped.
//   - a non-string input is a ContractError (fail-closed; no silent String() coercion of null).
//
// EXTENDED in Plan 23-03, Task 1 (NO-SPEND, NO NETWORK) with the rest of the offline audit surface:
//   - the global fetch is a THROWING STUB for the whole file, so every offline case proves itself
//     network-free. That is the strongest available guarantee that the offline rates are reproducible.
//   - fenced code sections are stripped before matching, so a URL in a fence is not a citation.
//   - the identifier set is lexicographic and two runs are deep-equal (byte-identical output).
//   - numbered markers resolve THROUGH the bibliography before counting; an unresolvable marker is
//     REPORTED in the unmatched bucket, never dropped.
//   - normalizeForQuoteMatch is idempotent over all five fold classes and never applies NFKC.
//   - quoteMatches is case-sensitive, splits on truncation markers in order, and refuses an empty or
//     whitespace-only quote (T-23-16 -- an empty quote matches every excerpt).
//   - countUncitedUnits excludes headings, tables, fences and the bibliography, and applies the
//     published passage-level attribution rule.
//   - auditReport has an EXACT key set and every ratio carries integer numerator + denominator only.
//
// DISCRIMINATION (the invert-the-fix proof, required by project convention):
//   - the bare-identifier form 'arXiv 2306.15595' and the URL form
//     'https://arxiv.org/abs/2306.15595' must produce the SAME value. A URL-only implementation would
//     return 'url:arxiv.org/abs/2306.15595' for the second and a raw: value for the first, so the
//     equality assertion FAILS without the arXiv rule. The set-cardinality assertion makes that
//     explicit: three tokens, ONE identifier.
//   - PROVEN EMPIRICALLY 2026-09-07 by disabling the fix and re-running (see 23-03-SUMMARY.md):
//     removing the bare-arXiv-in-prose scanner from the body scan fails the built-in 18-source
//     discrimination case (27 pass / 2 fail); removing bare-arXiv handling from the bibliography
//     resolver as well ALSO fails the both-reports unification case (23 pass / 6 fail). A
//     format-sensitive implementation cannot pass this file.
//
// HOST QUIRK (load-bearing): on this host the phase gate MUST target the explicit FILE form:
//   node --test eval/lz-eval-p23-citation-audit.test.mjs
// The directory form (`node --test <dir>`) spuriously exits 1 on this host even when every real test
// passes.

import fs from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { ContractError } from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

import {
  ARXIV_RE,
  DOI_RE,
  KEEP_PARAMS,
  UNCITED,
  auditReport,
  canonicalizeCitation,
  countUncitedUnits,
  extractCitationTokens,
  normalizeForQuoteMatch,
  quoteMatches,
} from './lz-eval-p23-citation-audit.mjs';

// ---------------------------------------------------------------------------
// NETWORK-FREE PROOF (Plan 23-03, Task 1). The global fetch is replaced by a throwing stub for the
// WHOLE file. Every case below runs under it. If any part of the offline audit ever reached the
// network, this file would fail loudly instead of quietly producing a figure that depends on the day's
// connectivity -- which is the strongest available guarantee that the offline rates are reproducible.
// ---------------------------------------------------------------------------
const FETCH_FORBIDDEN = 'the offline citation audit must never fetch: the global fetch is a throwing stub here';

globalThis.fetch = () => {
  throw new Error(FETCH_FORBIDDEN);
};

const BUILTIN_Q1 = 'eval/.cache/p22-baseline/builtin/qB1-run1.report.md';
const LZ_Q1 = 'eval/.cache/p22-baseline/lz/qB1-run1.report.md';

// The q1 reports live in gitignored `eval/.cache/`, so a fresh clone has no copy. Skip rather than
// fail -- but never silently pass off a skipped real-report case as a green one.
function readQ1(pathname) {
  return fs.existsSync(pathname) ? fs.readFileSync(pathname, 'utf8') : null;
}

test('ENV-04: the whole offline audit runs with the global fetch stubbed to throw (network-free proof)', () => {
  assert.throws(() => globalThis.fetch('https://example.com'), /must never fetch/);

  // A full audit under the throwing stub. If any code path fetched, this call would throw.
  const audit = auditReport({ reportText: 'Alpha is true [1].\n\n## Sources\n\n- [1] Paper - arXiv 2306.15595\n' });

  assert.equal(audit.uniqueSources.count, 1);
});

test('ENV-04: the frozen normalization constants are exported and KEEP_PARAMS is Object.frozen (anti-drift)', () => {
  assert.ok(ARXIV_RE instanceof RegExp, 'ARXIV_RE must be an exported RegExp');
  assert.ok(DOI_RE instanceof RegExp, 'DOI_RE must be an exported RegExp');
  assert.ok(Object.isFrozen(KEEP_PARAMS), 'KEEP_PARAMS must be Object.frozen (allowlist-inversion, frozen)');
  assert.deepEqual(KEEP_PARAMS, ['id', 'v', 'page']);
});

test('D-13: the three surface forms of the same arXiv paper collapse to ONE identifier (arxiv:2306.15595)', () => {
  // DISCRIMINATION: the built-in cites the bare identifier, lz cites the URL. Both must land on the
  // same value or every comparative citation count is a format artifact.
  assert.equal(canonicalizeCitation('arXiv 2306.15595'), 'arxiv:2306.15595');
  assert.equal(canonicalizeCitation('https://arxiv.org/abs/2306.15595'), 'arxiv:2306.15595');
  assert.equal(canonicalizeCitation('arxiv:2306.15595v2'), 'arxiv:2306.15595');

  const identifiers = new Set(
    ['arXiv 2306.15595', 'https://arxiv.org/abs/2306.15595', 'arxiv:2306.15595v2'].map(canonicalizeCitation),
  );

  assert.equal(identifiers.size, 1, 'three surface forms of one paper must yield exactly one identifier');
});

test('D-13: the arXiv rule also covers the pdf and html URL shapes and the version suffix', () => {
  assert.equal(canonicalizeCitation('https://arxiv.org/pdf/2306.15595v3.pdf'), 'arxiv:2306.15595');
  assert.equal(canonicalizeCitation('https://arxiv.org/html/2309.00071'), 'arxiv:2309.00071');
});

test('D-13: a DOI token canonicalizes lowercased with trailing punctuation stripped', () => {
  assert.equal(canonicalizeCitation('DOI 10.1145/3530811'), 'doi:10.1145/3530811');
  assert.equal(canonicalizeCitation('https://doi.org/10.1145/3530811.'), 'doi:10.1145/3530811');
});

test('D-13: a scheme-less host/path canonicalizes to url:host/path (the built-in bare-host form)', () => {
  assert.equal(canonicalizeCitation('blog.eleuther.ai/yarn'), 'url:blog.eleuther.ai/yarn');
});

test('D-13: the scheme case, www., a trailing slash and a fragment are all normalized away', () => {
  assert.equal(canonicalizeCitation('HTTPS://WWW.Example.COM/docs/'), 'url:example.com/docs');
  assert.equal(canonicalizeCitation('https://example.com/docs#section-3'), 'url:example.com/docs');
  assert.equal(
    canonicalizeCitation('http://www.example.com/a/b'),
    canonicalizeCitation('https://example.com/a/b'),
    'the scheme is not part of the identifier -- http and https forms of one page must not double-count',
  );
});

test('D-13: query filtering is allowlist-inversion -- non-allowlisted params drop, allowlisted ones stay sorted', () => {
  assert.equal(
    canonicalizeCitation('https://example.com/p?utm_source=x&ref=y'),
    'url:example.com/p',
    'a tracking parameter must not make two citations of one page look distinct',
  );
  assert.equal(canonicalizeCitation('https://example.com/p?v=2&id=7&utm_source=x'), 'url:example.com/p?id=7&v=2');
});

test('D-13: an unparseable token lands in the raw: bucket -- REPORTED, never dropped', () => {
  const id = canonicalizeCitation('see the appendix, no identifier given');

  assert.match(id, /^raw:/, 'an unmatched token must be reported under raw:, not silently discarded');
});

test('ENV-04: a non-string token is a ContractError (fail-closed -- no silent coercion of null)', () => {
  assert.throws(() => canonicalizeCitation(null), ContractError);
  assert.throws(() => canonicalizeCitation(undefined), ContractError);
  assert.throws(() => canonicalizeCitation(42), ContractError);
});

// ===========================================================================
// Plan 23-03, Task 1: the rest of the offline audit surface.
// ===========================================================================

test('ENV-04: UNCITED is Object.frozen alongside the three 23-01 constants (anti-drift, T-23-02c)', () => {
  assert.ok(Object.isFrozen(ARXIV_RE), 'ARXIV_RE must be Object.frozen');
  assert.ok(Object.isFrozen(DOI_RE), 'DOI_RE must be Object.frozen');
  assert.ok(Object.isFrozen(KEEP_PARAMS), 'KEEP_PARAMS must be Object.frozen');
  assert.ok(Object.isFrozen(UNCITED), 'UNCITED must be Object.frozen');
  assert.equal(UNCITED.MAX_RANGE_SPAN, 32);
  assert.match(UNCITED.LABEL, /citation COVERAGE/, 'the label must say COVERAGE, not support');

  // The label must never make an AFFIRMATIVE support or groundedness claim, while its existing NEGATIVE
  // phrasing ("NOT factual support, NOT groundedness") must still pass. So every occurrence of a
  // support/groundedness word has to carry a NOT immediately in front of it.
  //
  // DISCRIMINATION (proven empirically 2026-09-08, see 23-09-SUMMARY.md): the previous guard was
  // `assert.doesNotMatch(UNCITED.LABEL, /\bsupported\b|\bgrounded\b/i)`, which passed on inflection
  // mismatch alone -- the label literally contains "factual support" and "groundedness" -- and so would
  // NOT have caught an affirmative relabel to "factual support: 12/40". Relabelling UNCITED.LABEL that
  // way fails the assertion below and passed the old one.
  const affirmativeSupportClaims = [
    ...UNCITED.LABEL.matchAll(
      /(NOT\s+)?\b(factual\s+support|support(?:s|ed|ing)?|grounded(?:ness)?|grounding)\b/gi,
    ),
  ]
    .filter((match) => match[1] === undefined)
    .map((match) => match[0]);

  assert.deepEqual(
    affirmativeSupportClaims,
    [],
    'the label may mention support or groundedness ONLY under a NOT -- never as an affirmative claim',
  );
});

test('D-13: a URL inside a fenced code block is NOT a citation (fenced sections are stripped first)', () => {
  const text = 'Prose with no citation.\n\n```sh\ncurl https://example.com/not-a-citation\n```\n\nMore prose.\n';
  const { identifiers } = extractCitationTokens(text);

  assert.deepEqual(identifiers, [], 'a URL inside a fence must be absent from the identifier set');
});

test('D-13: the identifier set is lexicographic and two runs over the same text are deep-equal', () => {
  const text = 'See <https://zeta.example.com/z> and https://alpha.example.com/a and arXiv 2306.15595.\n';
  const first = extractCitationTokens(text);
  const second = extractCitationTokens(text);

  assert.deepEqual(first, second, 'two runs over one report must produce byte-identical output');
  assert.deepEqual(first.identifiers, [...first.identifiers].sort(), 'the set must be lexicographic');
  assert.deepEqual(first.identifiers, [
    'arxiv:2306.15595',
    'url:alpha.example.com/a',
    'url:zeta.example.com/z',
  ]);
});

test('D-13: two tokens canonicalizing to the same identifier MERGE into one set entry', () => {
  const text = 'The bare form arXiv 2306.15595 and the URL form https://arxiv.org/abs/2306.15595v2 are one source.\n';
  const { identifiers } = extractCitationTokens(text);

  assert.deepEqual(identifiers, ['arxiv:2306.15595'], 'one paper under two surface forms is ONE identifier');
});

test('ENV-04: a report with zero citation tokens audits to zero sources and zero unmatched, no throw', () => {
  const { identifiers, unmatched, markerTokens } = extractCitationTokens('Just prose. Nothing cited here.\n');

  assert.deepEqual(identifiers, []);
  assert.deepEqual(unmatched, []);
  assert.deepEqual(markerTokens, { total: 0, unique: 0 });
});

test('D-13 rule (C): numbered markers resolve THROUGH the bibliography before counting, ranges included', () => {
  const text = [
    'Alpha [1] and beta [2] and the range [1-2].',
    '',
    '## Sources',
    '',
    '- [1] YaRN - arXiv 2309.00071',
    '- [2] EleutherAI blog - blog.eleuther.ai/yarn',
    '',
  ].join('\n');
  const { identifiers, unmatched, markerTokens } = extractCitationTokens(text);

  assert.deepEqual(identifiers, ['arxiv:2309.00071', 'url:blog.eleuther.ai/yarn']);
  assert.deepEqual(unmatched, [], 'both markers resolve, so nothing lands in the bucket');
  assert.equal(markerTokens.total, 5, 'three body markers plus the two bibliography entry markers');
  assert.equal(markerTokens.unique, 2);
});

test('D-13 rule (B5): a marker with no bibliography entry is REPORTED in the unmatched bucket, never dropped', () => {
  const text = 'Consulted but unlisted [16], [17].\n\n## Sources\n\n- [1] Paper - arXiv 2306.15595\n';
  const { identifiers, unmatched } = extractCitationTokens(text);

  assert.deepEqual(identifiers, ['arxiv:2306.15595']);
  assert.deepEqual(unmatched, ['marker:[16]', 'marker:[17]'], 'a silent drop is how a format-sensitive metric hides');
});

test('ENV-04: extractCitationTokens fails closed on a non-string report', () => {
  assert.throws(() => extractCitationTokens(null), ContractError);
  assert.throws(() => extractCitationTokens(undefined), ContractError);
});

// ---------------------------------------------------------------------------
// D-13 rule (D): the quote-normalization fold.
// ---------------------------------------------------------------------------
test('D-13 rule (D): normalizeForQuoteMatch is idempotent across all five fold classes', () => {
  // All five classes: curly singles, curly doubles, en/em dashes, the ellipsis char, a no-break space.
  const fixture = '\u2018a\u2019 \u201Cb\u201D \u2013 \u2014 \u2026 c\u00A0\u00A0d ';
  const once = normalizeForQuoteMatch(fixture);

  assert.equal(once, '\'a\' "b" - - ... c d');
  assert.equal(normalizeForQuoteMatch(once), once, 'the fold must be a fixed point');
});

test('D-13 rule (D): normalizeForQuoteMatch applies NFC and NEVER NFKC (UAX #15 warns against blind NFKC)', () => {
  // U+FB01 is the fi ligature: NFC leaves it alone, NFKC would rewrite it to "fi".
  assert.equal(normalizeForQuoteMatch('\uFB01ne'), '\uFB01ne', 'NFKC would erase this formatting distinction');
  // U+FF21 is full-width A: NFKC would fold it to ASCII "A".
  assert.equal(normalizeForQuoteMatch('\uFF21'), '\uFF21');
});

test('D-12: quoteMatches is CASE-SENSITIVE -- a quote differing only in case does not match', () => {
  assert.equal(quoteMatches({ quote: 'the memory wall', excerpt: 'about the memory wall here' }), true);
  assert.equal(
    quoteMatches({ quote: 'The Memory Wall', excerpt: 'about the memory wall here' }),
    false,
    'case folding would let a paraphrase pass more easily and buys nothing here',
  );
});

test('D-12: a truncation marker splits the quote into segments that must match IN ORDER', () => {
  const excerpt = 'alpha beta gamma delta omega';

  assert.equal(quoteMatches({ quote: 'alpha ... omega', excerpt }), true);
  assert.equal(quoteMatches({ quote: 'alpha [...] gamma', excerpt }), true);
  assert.equal(quoteMatches({ quote: 'omega ... alpha', excerpt }), false, 'segments must match in order');
  assert.equal(quoteMatches({ quote: 'alpha \u2026 omega', excerpt }), true, 'the ellipsis char folds to ...');
});

test('T-23-16: an empty or whitespace-only quote is a ContractError (it would report a perfect match rate)', () => {
  assert.throws(() => quoteMatches({ quote: '', excerpt: 'anything' }), ContractError);
  assert.throws(() => quoteMatches({ quote: '   \t  ', excerpt: 'anything' }), ContractError);
  assert.throws(() => quoteMatches({ quote: '\u00A0', excerpt: 'anything' }), ContractError);
  assert.throws(() => quoteMatches({ quote: '...', excerpt: 'anything' }), ContractError);
  assert.throws(() => quoteMatches({ quote: 'x', excerpt: null }), ContractError);
});

// ---------------------------------------------------------------------------
// D-13 rule (E): the STRUCTURAL uncited-unit count. COVERAGE, not support.
// ---------------------------------------------------------------------------
test('D-13 rule (E): a citation at the end of a paragraph covers the preceding units in that paragraph', () => {
  const text = [
    '# Heading with no citation',
    '',
    'Alpha is asserted. Beta is asserted [1].',
    '',
    'Gamma stands alone with nothing behind it.',
    '',
    '## Sources',
    '',
    '- [1] Paper - arXiv 2306.15595',
    '',
  ].join('\n');
  const { uncited, total, label } = countUncitedUnits(text);

  assert.equal(total, 3, 'two units in the cited paragraph plus one in the uncited paragraph');
  assert.equal(uncited, 1, 'the paragraph-end citation covers Alpha as well as Beta');
  assert.match(label, /citation COVERAGE/);
});

test('D-13 rule (E): headings, tables, fenced code and the bibliography are excluded from the unit population', () => {
  const text = [
    '# Title',
    '### Subtitle',
    '',
    '| Family | Idea |',
    '|---|---|',
    '| One | Two |',
    '',
    '```js',
    'const uncited = "this sentence is code, not prose.";',
    '```',
    '',
    'Only this sentence counts.',
    '',
    '---',
    '',
    '## (e) Sources',
    '',
    '1. A paper (https://arxiv.org/abs/2306.15595)',
    '2. Another sentence in the bibliography. It must not count.',
    '',
  ].join('\n');
  const { uncited, total } = countUncitedUnits(text);

  assert.equal(total, 1, 'exactly one prose unit survives the exclusions');
  assert.equal(uncited, 1);
});

// ---------------------------------------------------------------------------
// auditReport: the composed object. Ratios carry raw integers only.
// ---------------------------------------------------------------------------
test('ENV-04: auditReport has an exact key set and every ratio carries integer numerator and denominator', () => {
  const audit = auditReport({
    reportText: 'Alpha is true [1]. Beta stands alone.\n\n## Sources\n\n- [1] Paper - arXiv 2306.15595\n',
    excerpts: ['the paper says alpha is true and more'],
    quotes: ['alpha is true', 'never appears anywhere'],
  });

  assert.deepEqual(Object.keys(audit).sort(), [
    'citationCoverage',
    'markerTokens',
    'quoteMatch',
    'uniqueSources',
    'unmatched',
  ]);
  assert.deepEqual(Object.keys(audit.uniqueSources).sort(), ['count', 'identifiers']);
  assert.deepEqual(Object.keys(audit.unmatched).sort(), ['count', 'tokens']);
  assert.deepEqual(Object.keys(audit.markerTokens).sort(), ['total', 'unique']);

  // EXACT key set on each ratio: a float-valued rate field cannot exist without failing this.
  for (const ratio of [audit.citationCoverage, audit.quoteMatch]) {
    assert.deepEqual(Object.keys(ratio).sort(), ['denominator', 'label', 'numerator']);
    assert.ok(Number.isInteger(ratio.numerator), 'the numerator must be a raw integer');
    assert.ok(Number.isInteger(ratio.denominator), 'the denominator must be a raw integer');
  }

  assert.deepEqual(audit.quoteMatch, {
    label: UNCITED.QUOTE_LABEL,
    numerator: 1,
    denominator: 2,
  });
  assert.match(audit.quoteMatch.label, /SINGLE-SYSTEM/, 'the lz-only q1 read is a single-system diagnostic (D-18)');
});

test('ENV-04: auditReport fails closed on a non-array excerpts or quotes argument', () => {
  assert.throws(() => auditReport({ reportText: 'x', excerpts: 'nope' }), ContractError);
  assert.throws(() => auditReport({ reportText: 'x', quotes: 'nope' }), ContractError);
  assert.throws(() => auditReport({}), ContractError);
});

// ---------------------------------------------------------------------------
// The real q1 pair. Skip-if-absent: `eval/.cache/` is gitignored.
// ---------------------------------------------------------------------------
test('D-13 UNIFICATION: arxiv:2306.15595 is in the canonical identifier set of BOTH q1 reports', (t) => {
  const builtin = readQ1(BUILTIN_Q1);
  const lz = readQ1(LZ_Q1);

  if (builtin === null || lz === null) {
    t.skip('the gitignored q1 report pair is absent from this checkout');
    return;
  }

  // DISCRIMINATION: the built-in cites this paper as a bare identifier in prose ("arXiv 2306.15595"),
  // lz cites it as an inline URL. A format-sensitive implementation passes the lz half and FAILS the
  // built-in half, so both halves must live in the SAME assertion.
  assert.ok(
    extractCitationTokens(builtin).identifiers.includes('arxiv:2306.15595'),
    'the built-in bare-arXiv-in-prose form must canonicalize into the set',
  );
  assert.ok(
    extractCitationTokens(lz).identifiers.includes('arxiv:2306.15595'),
    'the lz inline-URL form must canonicalize to the SAME identifier',
  );
});

test('D-13/D-21 DISCRIMINATION: the built-in unique-source count is the identifier-set cardinality, NOT a surface-marker count', (t) => {
  const builtin = readQ1(BUILTIN_Q1);

  if (builtin === null) {
    t.skip('the gitignored built-in q1 report is absent from this checkout');
    return;
  }

  const { identifiers, unmatched, markerTokens } = extractCitationTokens(builtin);

  // The MEASURED figures, pinned. See 23-03-SUMMARY.md: Plan 23-03's acceptance criterion predicted 13
  // unique canonical sources; 13 is 23-RESEARCH's count of unique surface MARKER VALUES, not of
  // canonical identifiers. Recorded, not reconciled.
  assert.equal(identifiers.length, 18, 'the built-in q1 canonical identifier set has 18 entries');
  assert.equal(markerTokens.total, 69, 'the SURFACE marker count, kept visible beside the identifier count');
  assert.equal(markerTokens.unique, 13, 'unique surface marker VALUES -- 13 is this, not the source count');
  assert.deepEqual(unmatched, ['marker:[16]', 'marker:[17]', 'marker:[19]'], 'reported, never dropped');

  // The anti-pattern D-13 exists to prevent: reporting a surface count as a source count.
  assert.notEqual(identifiers.length, markerTokens.total, 'the source count must NOT be the 69-marker count');
  assert.notEqual(identifiers.length, markerTokens.unique, 'nor the 13 unique marker VALUES');
});
