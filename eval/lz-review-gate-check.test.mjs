// lz-review-gate-check.test.mjs
//
// Unit tests for the orchestrator-side review-gate safeguards (eval/lz-review-gate-check.mjs):
// the severity-drop "diff" guard and the grouping-manifest coverage check (2026-06-17 consensus,
// hardened by the 2026-06-17 dogfood: section-based extraction + zero-token fail-toward-detection).
//
// HOST QUIRK: gate on the explicit FILE form: node --test eval/lz-review-gate-check.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  normalizeText,
  distinctiveTokens,
  extractSectionFindings,
  findingPresent,
  severityDropDiff,
  assertManifestCoverage,
} from './lz-review-gate-check.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));

// A realistic reviewer message in the lz-advisor:reviewer NATIVE section grammar (### sections +
// blank-line-separated finding blocks + trailing sentinel), NOT inline tags.
const REVIEWER = [
  '### Critical',
  '',
  '(none)',
  '',
  '### Important',
  '',
  '5. canonicalizeUrl strips the trailing slash on the serialized url, corrupting dedup keys.',
  '',
  '11. dateFilter accepts month thirteen without a value-range check.',
  '',
  '### Suggestions',
  '',
  '1. rename helper for clarity.',
  '',
  '### Cross-Cutting Patterns',
  '',
  'findings share a normalization root cause.',
  '',
  'MISSED-SURFACES: none',
  'ROUND-VERDICT: CONVERGED',
].join('\n');

test('normalizeText / distinctiveTokens are deterministic and skip short words', () => {
  assert.equal(normalizeText('Foo-BAR  baz!'), 'foo bar baz');
  const toks = distinctiveTokens('the canonicalizeUrl trailing slash');
  assert.ok(toks.has('canonicalizeurl'));
  assert.ok(toks.has('trailing'));
  assert.ok(toks.has('slash')); // length 5 -> kept
  assert.ok(!toks.has('the')); // length < 5 -> skipped
});

test('extractSectionFindings: parses ### sections, skips (none) and non-finding sections', () => {
  const found = extractSectionFindings(REVIEWER);
  // 2 Important + 1 Suggestion; Critical is (none); Cross-Cutting + trailing sentinel are not findings.
  assert.equal(found.length, 3);
  assert.deepEqual(found.map((f) => f.severity), ['IMPORTANT', 'IMPORTANT', 'SUGGESTION']);
  assert.match(found[0].text, /canonicalizeUrl/);
  assert.ok(!found.some((f) => /ROUND-VERDICT|Cross-Cutting|normalization root cause/.test(f.text)));
});

test('severityDropDiff: present high findings are NOT flagged', () => {
  const synth = [
    '### Critical', '', '(none)', '',
    '### Important', '',
    '5. canonicalizeUrl strips the trailing slash on the serialized url corrupting dedup keys', '',
    '11. dateFilter accepts month thirteen without a value-range check', '',
  ].join('\n');
  const r = severityDropDiff([{ reviewed: REVIEWER }], synth);
  assert.equal(r.reviewerHighCount, 2);
  assert.equal(r.dropDetected, false);
});

test('severityDropDiff: a DROPPED high finding IS flagged (discriminating)', () => {
  // synth kept the dateFilter Important but DROPPED the canonicalizeUrl Important.
  const synth = '### Critical\n\n(none)\n\n### Important\n\n11. dateFilter accepts month thirteen without a value-range check';
  const r = severityDropDiff([{ reviewed: REVIEWER }], synth);
  assert.equal(r.reviewerHighCount, 2);
  assert.equal(r.droppedCount, 1);
  assert.equal(r.dropDetected, true);
  assert.match(r.dropped[0].text, /canonicalizeUrl/);
});

test('severityDropDiff: dedups the same high finding repeated across rounds', () => {
  const synth = '### Important\n\n5. canonicalizeUrl strips the trailing slash on the serialized url corrupting dedup keys\n\n11. dateFilter accepts month thirteen without a value-range check';
  const r = severityDropDiff([{ reviewed: REVIEWER }, { reviewed: REVIEWER }], synth);
  assert.equal(r.reviewerHighCount, 2); // deduped across the two identical rounds (not 4)
  assert.equal(r.dropDetected, false);
});

test('severityDropDiff: SUGGESTION findings are ignored (only Critical/Important gate)', () => {
  const reviewer = '### Critical\n\n(none)\n\n### Suggestions\n\n1. rename helper for clarity';
  const r = severityDropDiff([{ reviewed: reviewer }], '### Critical\n\n(none)');
  assert.equal(r.reviewerHighCount, 0);
  assert.equal(r.dropDetected, false);
});

test('severityDropDiff: a DROPPED zero-distinctive-token Critical IS flagged (fail-toward-detection)', () => {
  // "null map bug here" has no tokens of length >= 5 -> exercises the raw-substring fallback.
  const reviewer = '### Critical\n\nnull map bug here\n\nROUND-VERDICT: CONVERGED';
  const synthDropped = '### Critical\n\n(none)\n\n### Important\n\n(none)';
  const r = severityDropDiff([{ reviewed: reviewer }], synthDropped);
  assert.equal(r.reviewerHighCount, 1);
  assert.equal(r.dropDetected, true); // BEFORE the fix this returned present=true and missed the drop

  const synthPresent = '### Critical\n\nnull map bug here\n';
  assert.equal(severityDropDiff([{ reviewed: reviewer }], synthPresent).dropDetected, false);
});

test('severityDropDiff: two distinct zero-token Criticals do NOT collide (empty-sig dedup fix)', () => {
  const reviewer = '### Critical\n\noff by one\n\nnull map bug\n\nROUND-VERDICT: CONVERGED';
  const r = severityDropDiff([{ reviewed: reviewer }], '### Critical\n\n(none)');
  assert.equal(r.reviewerHighCount, 2); // BEFORE the fix both shared sig='' -> counted 1
  assert.equal(r.droppedCount, 2);
});

test('severityDropDiff: two simultaneous drops (Critical + Important) -> droppedCount 2', () => {
  const reviewer = [
    '### Critical', '',
    'canonicalizeUrl trailing slash serialized corrupting collision', '',
    '### Important', '',
    'datefilter accepts thirteen without range validation', '',
    'ROUND-VERDICT: CONVERGED',
  ].join('\n');
  const synthEmpty = '### Critical\n\n(none)\n\n### Important\n\n(none)';
  const r = severityDropDiff([{ reviewed: reviewer }], synthEmpty);
  assert.equal(r.reviewerHighCount, 2);
  assert.equal(r.droppedCount, 2);
});

test('findingPresent: pins the 0.6 distinctive-token threshold direction', () => {
  const finding = 'alpha bravo charr delta extra'; // 5 distinctive tokens (all length >= 5)
  // 3 of 5 present == 0.6 -> present
  assert.equal(findingPresent(finding, normalizeText('alpha bravo charr'), distinctiveTokens('alpha bravo charr')), true);
  // 2 of 5 present == 0.4 -> absent
  assert.equal(findingPresent(finding, normalizeText('alpha bravo'), distinctiveTokens('alpha bravo')), false);
});

test('assertManifestCoverage: co-located chain passes', () => {
  const groups = [{ name: 'g1', files: ['a.mjs', 'b.mjs', 'c.mjs'] }];
  const manifest = { chains: [{ name: 'chain', files: ['a.mjs', 'b.mjs'] }] };
  const r = assertManifestCoverage(groups, manifest);
  assert.equal(r.ok, true);
  assert.equal(r.violations.length, 0);
});

test('assertManifestCoverage: chain SPLIT across groups is a violation (coupling blind spot)', () => {
  const groups = [{ name: 'g1', files: ['a.mjs'] }, { name: 'g2', files: ['b.mjs'] }];
  const r = assertManifestCoverage(groups, { chains: [{ name: 'split', files: ['a.mjs', 'b.mjs'] }] });
  assert.equal(r.ok, false);
  assert.match(r.violations[0].reason, /split across groups/);
});

test('assertManifestCoverage: chain not dispatched at all is a distinct violation', () => {
  const r = assertManifestCoverage([{ name: 'g1', files: ['x.mjs'] }], { chains: [{ name: 'absent', files: ['a.mjs', 'b.mjs'] }] });
  assert.equal(r.ok, false);
  assert.match(r.violations[0].reason, /not dispatched/);
});

test('assertManifestCoverage: empty-files chain is a malformed-manifest violation (no vacuous pass)', () => {
  const r = assertManifestCoverage([{ name: 'g1', files: ['a.mjs'] }], { chains: [{ name: 'empty', files: [] }] });
  assert.equal(r.ok, false);
  assert.match(r.violations[0].reason, /malformed/);
});

test('assertManifestCoverage: normalizes path separators (backslash vs forward slash)', () => {
  const groups = [{ name: 'g1', files: ['eval\\a.mjs', 'eval\\b.mjs'] }];
  const manifest = { chains: [{ name: 'c', files: ['eval/a.mjs', 'eval/b.mjs'] }] };
  assert.equal(assertManifestCoverage(groups, manifest).ok, true);
});

test('committed manifest file is valid JSON with the expected shape', () => {
  const raw = fs.readFileSync(path.join(HERE, 'lz-review-gate-manifest.json'), 'utf8');
  const manifest = JSON.parse(raw);
  assert.ok(Array.isArray(manifest.chains) && manifest.chains.length > 0);

  for (const chain of manifest.chains) {
    assert.equal(typeof chain.name, 'string');
    assert.ok(Array.isArray(chain.files) && chain.files.length > 0);
  }

  const names = manifest.chains.map((c) => c.name);
  assert.ok(names.some((n) => /safeId/i.test(n)), 'safeId coupling chain missing from manifest');
});
