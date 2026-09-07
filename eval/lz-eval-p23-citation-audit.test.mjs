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
// DISCRIMINATION (the invert-the-fix proof, required by project convention):
//   - the bare-identifier form 'arXiv 2306.15595' and the URL form
//     'https://arxiv.org/abs/2306.15595' must produce the SAME value. A URL-only implementation would
//     return 'url:arxiv.org/abs/2306.15595' for the second and a raw: value for the first, so the
//     equality assertion FAILS without the arXiv rule. The set-cardinality assertion makes that
//     explicit: three tokens, ONE identifier.
//
// HOST QUIRK (load-bearing): on this host the phase gate MUST target the explicit FILE form:
//   node --test eval/lz-eval-p23-citation-audit.test.mjs
// The directory form (`node --test <dir>`) spuriously exits 1 on this host even when every real test
// passes.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { ContractError } from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

import {
  ARXIV_RE,
  DOI_RE,
  KEEP_PARAMS,
  canonicalizeCitation,
} from './lz-eval-p23-citation-audit.mjs';

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
