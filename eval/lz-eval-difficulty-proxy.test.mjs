// lz-eval-difficulty-proxy.test.mjs
//
// FILE-form DISCRIMINATING coverage for the ONE-SIDED difficulty-proxy guard (Plan 20-06, Task 2;
// construct-validity gate (b)). Deterministic -- NO model call, NO spend. Each test is mutation-proven per
// the plan's <behavior> block (board section 3 (b): FAIL only the EASIER direction).
//
// THE PROXY DIRECTION (load-bearing): the proxy is HIGHER for an EASIER item (more corroborating sources,
// a shorter claim, a closer claim-vs-evidence paraphrase). The easier-direction SMD is the constructed
// cell minus the harvested dense-SUPPORTED cell; a POSITIVE SMD beyond the margin means the constructed
// cell is detectably EASIER -> the gate FAILS. A HARDER or indistinguishable constructed cell PASSES (the
// guard is strictly one-tailed -- only an EASIER cell fakes specificity).
//
// HOST QUIRK (load-bearing, CLAUDE.md): on this host `node --test <dir>` spuriously exits 1 even when all
// tests pass; ALWAYS gate by the explicit FILE path:
//   node --test eval/lz-eval-difficulty-proxy.test.mjs
//
// Strictly ASCII, no BOM.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  difficultyProxy,
  oneSidedNotEasierGuard,
  EASIER_DIRECTION_SMD_MARGIN,
  DIFFICULTY_GUARD_ALPHA,
} from './lz-eval-difficulty-proxy.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Cell builders. Each item is { corroboration_lower_bound, claim, evidence }. The proxy reads all three.
// ---------------------------------------------------------------------------

// A HARD cell: low corroboration, LONG heavily-qualified claims, distant claim-vs-evidence paraphrase.
function hardCell(n, salt) {
  const cell = [];

  for (let i = 0; i < n; i += 1) {
    cell.push({
      corroboration_lower_bound: 2,
      claim: 'The carefully qualified ' + salt + ' estimate for cohort ' + i + ' indicates a bounded conditional change subject to several caveats across the measured interval and stratified subgroups',
      evidence: ['An entirely different vocabulary records separate unrelated figures for case ' + i + ' under distinct conditions.'],
    });
  }

  return cell;
}

// An EASIER cell: HIGH corroboration, SHORT claims, CLOSE claim-vs-evidence paraphrase (the claim closely
// restates the evidence). Higher proxy on all three components -> detectably easier than a hard cell.
function easyCell(n, salt) {
  const cell = [];

  for (let i = 0; i < n; i += 1) {
    const shared = 'value rose case ' + i;
    cell.push({
      corroboration_lower_bound: 9,
      claim: shared,
      evidence: [shared + ' value rose case ' + i],
    });
  }

  return cell;
}

// ---------------------------------------------------------------------------
// difficultyProxy -- the per-item proxy + mean (deterministic).
// ---------------------------------------------------------------------------

test('Task-2 difficultyProxy: an EASIER cell has a HIGHER mean proxy than a HARDER cell (the direction is HIGHER=EASIER) (DISCRIMINATING)', () => {
  const easy = difficultyProxy({ cell: easyCell(30, 'a') });
  const hard = difficultyProxy({ cell: hardCell(30, 'a') });

  assert.equal(easy.vector.length, 30, 'the proxy vector has one entry per item');
  assert.ok(easy.mean > hard.mean, 'the easier cell has a higher mean proxy (' + easy.mean + ' > ' + hard.mean + ')');
});

test('Task-2 difficultyProxy: fails closed on an empty/malformed cell', () => {
  assert.throws(() => difficultyProxy({ cell: [] }), (e) => e.name === 'ContractError', 'an empty cell fails closed');
  assert.throws(() => difficultyProxy({ cell: [null] }), (e) => e.name === 'ContractError', 'a malformed item fails closed');
});

// ---------------------------------------------------------------------------
// (5) Two indistinguishable cells -> notEasier:true.
// ---------------------------------------------------------------------------

test('Task-2 oneSidedNotEasierGuard: two indistinguishable cells -> notEasier:true (PASS) (DISCRIMINATING)', () => {
  // The constructed cell and the harvested cell are statistically indistinguishable (the SAME builder).
  const constructedCell = hardCell(30, 'x');
  const harvestedDenseCell = hardCell(30, 'x');
  const out = oneSidedNotEasierGuard({ constructedCell, harvestedDenseCell });

  assert.ok(Math.abs(out.smd) < 0.5, 'indistinguishable cells -> SMD within the margin (got ' + out.smd + ')');
  assert.equal(out.notEasier, true, 'indistinguishable -> notEasier:true (PASS)');
});

// ---------------------------------------------------------------------------
// (6) A constructed cell detectably EASIER -> notEasier:false (FAIL).
// ---------------------------------------------------------------------------

test('Task-2 oneSidedNotEasierGuard: a detectably EASIER constructed cell -> notEasier:false (FAIL) (DISCRIMINATING)', () => {
  // The constructed cell is EASIER (high corroboration, short claims, close paraphrase) vs a HARD harvested
  // dense-SUPPORTED cell -> the easier-direction SMD lower bound exceeds the margin -> the gate FAILS.
  const constructedCell = easyCell(30, 'y');
  const harvestedDenseCell = hardCell(30, 'y');
  const out = oneSidedNotEasierGuard({ constructedCell, harvestedDenseCell });

  assert.ok(out.smd > 0.5, 'the easier constructed cell -> a positive SMD beyond the margin (got ' + out.smd + ')');
  assert.ok(out.ciBound > EASIER_DIRECTION_SMD_MARGIN, 'the one-sided SMD lower bound exceeds the margin (got ' + out.ciBound + ')');
  assert.equal(out.notEasier, false, 'detectably EASIER -> notEasier:false (FAIL the certificate)');
});

// ---------------------------------------------------------------------------
// (7) A HARDER constructed cell -> notEasier:true (one-sided -- harder does NOT fail).
// ---------------------------------------------------------------------------

test('Task-2 oneSidedNotEasierGuard: a HARDER constructed cell -> notEasier:true (one-sided; harder does NOT fail) (DISCRIMINATING)', () => {
  // The constructed cell is HARDER than the harvested dense-SUPPORTED cell (reversed). A symmetric TOST
  // would flag this; the one-sided guard does NOT -- a harder cell cannot fake specificity.
  const constructedCell = hardCell(30, 'z');
  const harvestedDenseCell = easyCell(30, 'z');
  const out = oneSidedNotEasierGuard({ constructedCell, harvestedDenseCell });

  assert.ok(out.smd < 0, 'a harder constructed cell -> a NEGATIVE easier-direction SMD (got ' + out.smd + ')');
  assert.equal(out.notEasier, true, 'HARDER -> notEasier:true (PASS; the guard is strictly one-tailed)');

  // DISCRIMINATING: the SAME cells, swapped (easier constructed), would FAIL -- proving the one-sidedness.
  const swapped = oneSidedNotEasierGuard({ constructedCell: easyCell(30, 'z'), harvestedDenseCell: hardCell(30, 'z') });
  assert.equal(swapped.notEasier, false, 'swapping to an easier constructed cell FAILS -- the guard is directional, not symmetric');
});

// ---------------------------------------------------------------------------
// (8) The constants are frozen module literals.
// ---------------------------------------------------------------------------

test('Task-2 the bar constants are frozen module literals (EASIER_DIRECTION_SMD_MARGIN=0.5, DIFFICULTY_GUARD_ALPHA=0.05)', () => {
  assert.equal(EASIER_DIRECTION_SMD_MARGIN, 0.5, 'the easier-direction SMD margin is 0.5');
  assert.equal(DIFFICULTY_GUARD_ALPHA, 0.05, 'the one-sided alpha is 0.05 (mirrors MCC_CI_ALPHA)');

  // Source-level: they are module-level export literals (frozen before scoring; recorded in the lock rule).
  const src = fs.readFileSync(path.join(HERE, 'lz-eval-difficulty-proxy.mjs'), 'utf8');
  assert.ok(/export const EASIER_DIRECTION_SMD_MARGIN = 0\.5;/.test(src), 'EASIER_DIRECTION_SMD_MARGIN is a frozen module literal');
  assert.ok(/export const DIFFICULTY_GUARD_ALPHA = 0\.05;/.test(src), 'DIFFICULTY_GUARD_ALPHA is a frozen module literal');
});

// ---------------------------------------------------------------------------
// The SMD CI quantile math routes through jstat ONLY (the SMD itself is hand-rolled).
// ---------------------------------------------------------------------------

test('Task-2 the difficulty-proxy SMD CI routes the quantile math through jstat (the SMD is hand-rolled)', () => {
  const src = fs.readFileSync(path.join(HERE, 'lz-eval-difficulty-proxy.mjs'), 'utf8');
  // The module imports jstat for the CI normal-inverse / normal-cdf (the SAME discipline as lz-eval-mcc.mjs).
  assert.ok(/import\s+jStatPkg\s+from\s+'jstat'/.test(src), 'jstat is imported for the CI quantile math');
  assert.ok(/jStat\.normal\.inv/.test(src), 'the bias-correction normal-inverse routes through jStat');
  assert.ok(/jStat\.normal\.cdf/.test(src), 'the adjusted percentile routes through jStat.normal.cdf');
  // The SMD itself is hand-rolled (mean-difference / pooled-SD) -- no jstat in the point estimate.
  assert.ok(/function standardizedMeanDifference/.test(src), 'the SMD is a hand-rolled function (mean-difference / pooled-SD)');
});

// ---------------------------------------------------------------------------
// The module source is strictly ASCII (committed bytes, CLAUDE.md).
// ---------------------------------------------------------------------------

test('Task-2 the difficulty-proxy module source is strictly ASCII (committed bytes, CLAUDE.md)', () => {
  const buf = fs.readFileSync(path.join(HERE, 'lz-eval-difficulty-proxy.mjs'));

  for (let i = 0; i < buf.length; i += 1) {
    assert.ok(buf[i] <= 0x7f, 'lz-eval-difficulty-proxy.mjs byte at offset ' + i + ' must be ASCII (<= 0x7F), got 0x' + buf[i].toString(16));
  }
});
