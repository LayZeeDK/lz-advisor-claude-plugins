// lz-review-gate-lib.test.mjs
//
// Unit tests for the ENHANCED CODE-REVIEW GATE control logic (eval/lz-review-gate-lib.mjs).
// Dev-only eval-tree test; node stdlib only (zero-dep). Every assertion is DISCRIMINATING (it
// proves the behavior flips), never a tautology -- a misparse here would cause the review gate to
// either converge prematurely (incomplete review) or loop forever, so these are load-bearing.
//
// HOST QUIRK (load-bearing): on this host (Windows arm64 / Git Bash) the phase gate MUST target the
// explicit FILE form:
//   node --test eval/lz-review-gate-lib.test.mjs
// The directory form (`node --test <dir>`) spuriously exits 1 on this host even when every real test
// passes. The suite is one file, so the file form is the equivalent reliable gate.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  parseReviewerSentinel,
  missedIsNone,
  isConverged,
  nextRequests,
  groupSlug,
  computeRemainingGroups,
  hasNullStage,
  dedupeFindingLines,
} from './lz-review-gate-lib.mjs';

// ---------------------------------------------------------------------------
// parseReviewerSentinel
// ---------------------------------------------------------------------------

test('parseReviewerSentinel: CONVERGED + none', () => {
  const text = 'findings...\nMISSED-SURFACES: none\nROUND-VERDICT: CONVERGED';
  const p = parseReviewerSentinel(text);
  assert.equal(p.verdict, 'CONVERGED');
  assert.equal(p.missed, 'none');
  assert.equal(p.requests, '');
});

test('parseReviewerSentinel: MORE-NEEDED captures missed + requests to end', () => {
  const text = [
    '### Critical',
    'C-1 ...',
    'MISSED-SURFACES: safeParse wrapper, the denylist definition',
    'ROUND-VERDICT: MORE-NEEDED',
    'NEXT-ROUND-PACKAGING-REQUESTS: searchAndStop core, staticKsAdapter, liveWebSearchAdapter',
  ].join('\n');
  const p = parseReviewerSentinel(text);
  assert.equal(p.verdict, 'MORE-NEEDED');
  assert.equal(p.missed, 'safeParse wrapper, the denylist definition');
  assert.match(p.requests, /searchAndStop core/);
  assert.match(p.requests, /liveWebSearchAdapter/);
});

test('parseReviewerSentinel: absent sentinel -> UNKNOWN (discriminates from CONVERGED)', () => {
  const p = parseReviewerSentinel('just some prose with no sentinel lines');
  assert.equal(p.verdict, 'UNKNOWN');
  assert.notEqual(p.verdict, 'CONVERGED');
  assert.equal(p.missed, '');
  assert.equal(p.requests, '');
});

test('parseReviewerSentinel: case-insensitive + non-string input', () => {
  const p = parseReviewerSentinel('round-verdict: converged\nmissed-surfaces: none');
  assert.equal(p.verdict, 'CONVERGED');
  assert.equal(missedIsNone(p.missed), true);
  const p2 = parseReviewerSentinel(null);
  assert.equal(p2.verdict, 'UNKNOWN');
});

// ---------------------------------------------------------------------------
// missedIsNone
// ---------------------------------------------------------------------------

test('missedIsNone: none / None. / none -- notes all true; a list is false', () => {
  assert.equal(missedIsNone('none'), true);
  assert.equal(missedIsNone('None.'), true);
  assert.equal(missedIsNone('  none -- coverage complete'), true);
  assert.equal(missedIsNone('safeParse, denylist'), false);
  assert.equal(missedIsNone(''), false);
  // discriminating: "none missing except X" must NOT count as none if it does not start with the word none
  assert.equal(missedIsNone('nonexistent-ish surface'), false);
});

// ---------------------------------------------------------------------------
// isConverged
// ---------------------------------------------------------------------------

test('isConverged: true on CONVERGED verdict', () => {
  assert.equal(isConverged({ verdict: 'CONVERGED', missed: 'whatever', requests: '' }), true);
});

test('isConverged: true on MISSED-SURFACES none even if verdict mislabeled MORE-NEEDED', () => {
  // "no missed surfaces" wins -- faithful to the requirement (keep consulting until none missed).
  assert.equal(isConverged({ verdict: 'MORE-NEEDED', missed: 'none', requests: '' }), true);
});

test('isConverged: false on MORE-NEEDED with a real missed list, and false on UNKNOWN', () => {
  assert.equal(isConverged({ verdict: 'MORE-NEEDED', missed: 'safeParse', requests: 'x' }), false);
  assert.equal(isConverged({ verdict: 'UNKNOWN', missed: '', requests: '' }), false);
  assert.equal(isConverged(null), false);
});

// ---------------------------------------------------------------------------
// nextRequests
// ---------------------------------------------------------------------------

test('nextRequests: prefers explicit requests, then missed list, then fallback', () => {
  assert.equal(
    nextRequests({ verdict: 'MORE-NEEDED', missed: 'm', requests: 'pkg A and B' }, 'fb'),
    'pkg A and B',
  );
  assert.equal(
    nextRequests({ verdict: 'MORE-NEEDED', missed: 'cover X', requests: '' }, 'fb'),
    'cover X',
  );
  assert.equal(
    nextRequests({ verdict: 'MORE-NEEDED', missed: 'none', requests: '' }, 'fb'),
    'fb',
  );
  assert.match(nextRequests(null, ''), /remaining surfaces/);
});

// ---------------------------------------------------------------------------
// groupSlug
// ---------------------------------------------------------------------------

test('groupSlug: deterministic filesystem-safe slug', () => {
  assert.equal(groupSlug('eval/lz-eval-search-loop.mjs'), 'eval-lz-eval-search-loop-mjs');
  assert.equal(groupSlug('Worker Agents (plugins/)'), 'worker-agents-plugins');
  assert.equal(groupSlug('---weird__name!!!'), 'weird-name');
  // deterministic: same input -> same output
  assert.equal(groupSlug('Group A'), groupSlug('Group A'));
  // discriminating: different groups -> different slugs
  assert.notEqual(groupSlug('group a'), groupSlug('group b'));
});

// ---------------------------------------------------------------------------
// computeRemainingGroups (Layer-2 skip-already-done)
// ---------------------------------------------------------------------------

test('computeRemainingGroups: skips done slugs (object groups), non-vacuous', () => {
  const groups = [{ name: 'eval/a.mjs' }, { name: 'eval/b.mjs' }, { name: 'plugins/c.md' }];
  const done = [groupSlug('eval/a.mjs'), groupSlug('plugins/c.md')];
  const remaining = computeRemainingGroups(groups, done);
  assert.equal(remaining.length, 1);
  assert.equal(remaining[0].name, 'eval/b.mjs');
});

test('computeRemainingGroups: string groups + Set doneSlugs; empty done returns all', () => {
  const groups = ['x', 'y'];
  assert.deepEqual(computeRemainingGroups(groups, new Set([groupSlug('x')])), ['y']);
  assert.deepEqual(computeRemainingGroups(groups, []), ['x', 'y']);
  assert.deepEqual(computeRemainingGroups([], ['anything']), []);
});

// ---------------------------------------------------------------------------
// hasNullStage (quota-kill -> group not done)
// ---------------------------------------------------------------------------

test('hasNullStage: detects null / undefined / blank, false for real strings', () => {
  assert.equal(hasNullStage([null]), true);
  assert.equal(hasNullStage(['ok', undefined]), true);
  assert.equal(hasNullStage(['ok', '   ']), true);
  assert.equal(hasNullStage(['packaged', 'reviewed']), false);
  assert.equal(hasNullStage('single-non-null'), false);
  assert.equal(hasNullStage(null), true);
});

// ---------------------------------------------------------------------------
// dedupeFindingLines
// ---------------------------------------------------------------------------

test('dedupeFindingLines: order-preserving exact-dup removal, blanks preserved', () => {
  const input = ['C-1 bug', '', 'C-1 bug', 'I-1 issue', '  C-1 bug  ', ''];
  const out = dedupeFindingLines(input);
  // first C-1 kept, the two later duplicates (incl. whitespace variant) dropped; both blanks kept
  assert.deepEqual(out, ['C-1 bug', '', 'I-1 issue', '']);
});
