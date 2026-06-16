// lz-eval-aggregate.test.mjs
//
// Validation fixture for the deterministic, off-model EVAL aggregator (Plan 18-03).
// Dev-only eval-tree test: imports the SCRIPT under test (which carries the pinned jstat) and
// node stdlib only. The aggregator itself imports the SHIPPED runtime aggregator's hardening
// primitives across trees (one-directional eval -> runtime), so this test transitively requires
// both eval/node_modules/jstat AND the plugin-tree runtime aggregator to resolve.
//
// Asserts the EVAL-02 / EVAL-04 / D-06 / D-07 load-bearing behaviors (each a DISTINCT named test
// that genuinely exercises the behavior, never a tautology):
//   - the CI / Pass@k math is LIBRARY-WIRED (jstat); the test pins ONLY the five verified anchors
//     (0.218 / 0.327 / 0.082 / CP(n,n)=1 / combination(15,3)=455) -- it never re-derives the math.
//   - per-stratum false-uphold counting flips between a present fixture (counted) and an absent
//     sibling fixture (not counted) -- discriminating, not tautological (Phase 17 CR-01 lesson).
//   - the Haiku-MINUS-Sonnet DELTA subtracts (a fixture where Sonnet is non-zero proves the
//     subtraction fired, not just Haiku's absolute count).
//   - the frozen eval-thresholds object passes Object.isFrozen.
//   - the mechanical lock-rule verdict is deterministic PASS / FAIL-RAISE for fixed counts.
//
// HOST QUIRK (load-bearing): on this host (Node v24.13.0 / Windows arm64 / Git Bash) the phase gate
// MUST target the explicit FILE form:
//   node --test eval/lz-eval-aggregate.test.mjs
// The directory form (`node --test <dir>`) spuriously exits 1 on this host even when every real
// test passes. The suite is one file, so the file form is the equivalent reliable gate. The eval
// tree additionally requires eval/node_modules/ restored first (`cd eval && npm install`).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import jStatPkg from 'jstat';

import {
  clopperPearsonUpper,
  wilsonUpper,
  passAtK,
  passHatK,
  EVAL_THRESHOLDS,
  countFalseUpholds,
  delta,
  lockRuleVerdict,
} from './lz-eval-aggregate.mjs';

const { jStat } = jStatPkg;

// Resolve __fixtures__ test-file-relative (NEVER process.cwd() -- cwd drifts under GSD worktrees and
// headless `claude -p`).
const HERE = path.dirname(fileURLToPath(import.meta.url));
const aggCase = (name) => path.join(HERE, '__fixtures__', 'agg-cases', name);

// ---------------------------------------------------------------------------
// D-07 / EVAL-04: the CI + Pass@k math is LIBRARY-WIRED. The test asserts ONLY the verified anchors
// (the library is wired); it never re-derives a hand-rolled special function.
// ---------------------------------------------------------------------------

test('D-07 Clopper-Pearson upper bound is library-wired (anchors 0.218; CP(n,n)=1; CP(x,0)=1)', () => {
  // The ONLY thing pinned about the float math is the verified anchor: 0 of 15 at alpha 0.05.
  assert.ok(
    Math.abs(clopperPearsonUpper(0, 15, 0.05) - 0.218) < 1e-3,
    'clopperPearsonUpper(0,15,0.05) must be within 1e-3 of 0.218 (verified 0.2180194)',
  );

  // Degenerate boundaries handled explicitly (not by the library): x===n and n===0 both -> 1.
  assert.equal(clopperPearsonUpper(15, 15), 1, 'CP(n,n) === 1');
  assert.equal(clopperPearsonUpper(0, 0), 1, 'CP(x,0) === 1 (zero trials -> no information -> 1)');
  assert.equal(clopperPearsonUpper(3, 0), 1, 'CP(x,0) === 1 regardless of x');
});

test('D-07 jStat.beta.inv quantile is wired (anchors 0.327 and 0.082)', () => {
  // These two anchors prove the underlying beta quantile (the CP upper bound machinery) is the
  // library's, not a hand-rolled incomplete-beta inverse.
  assert.ok(
    Math.abs(jStat.beta.inv(0.2, 3, 3) - 0.327) < 1e-3,
    'jStat.beta.inv(0.2,3,3) must be within 1e-3 of 0.327 (verified 0.3265979)',
  );
  assert.ok(
    Math.abs(jStat.beta.inv(0.4, 1, 6) - 0.082) < 1e-3,
    'jStat.beta.inv(0.4,1,6) must be within 1e-3 of 0.082 (verified 0.0816141)',
  );
});

test('D-07 Wilson upper bound is library-wired (degenerate n===0 -> 1; bounded by 1)', () => {
  // Wilson is the alternative interval per D-07; it routes through jStat.normal.inv. We assert only
  // the degenerate boundary + that it stays a valid probability -- the interior value is the
  // library's responsibility, not a hand-rolled formula to pin.
  assert.equal(wilsonUpper(0, 0), 1, 'wilsonUpper(0,0) === 1 (no trials)');

  const w = wilsonUpper(0, 15, 0.95);
  assert.ok(w > 0 && w <= 1, 'wilsonUpper(0,15) must be a valid probability in (0,1]');
});

test('EVAL-02 Pass@k / Pass^k use jStat.combination (combination(15,3)===455; c===n -> 1; n<k -> NaN)', () => {
  // The combinatorics come from the library; the verified anchor pins the wiring.
  assert.equal(jStat.combination(15, 3), 455, 'jStat.combination(15,3) === 455 (verified)');

  // passHatK(n,c,k) === combination(c,k)/combination(n,k): a known small case (5 choose 2 = 10).
  assert.ok(
    Math.abs(passHatK(5, 5, 2) - 1) < 1e-12,
    'passHatK(5,5,2): all 5 correct -> every 2-subset passes -> 1',
  );
  assert.ok(
    Math.abs(passHatK(5, 2, 2) - jStat.combination(2, 2) / jStat.combination(5, 2)) < 1e-12,
    'passHatK(5,2,2) === combination(2,2)/combination(5,2) === 1/10',
  );

  // passAtK with c === n returns 1 (at least one of any k passes when all pass).
  assert.equal(passAtK(15, 15, 5), 1, 'passAtK(n,n,k) === 1 (all correct)');
  // passAtK with c === 0 returns 0 (none pass -> no k-subset contains a pass).
  assert.ok(Math.abs(passAtK(15, 0, 5) - 0) < 1e-12, 'passAtK(n,0,k) === 0 (none correct)');

  // n < k is undefined (cannot draw k from n) -> NaN, for BOTH estimators.
  assert.ok(Number.isNaN(passAtK(3, 1, 5)), 'passAtK(n<k) -> NaN');
  assert.ok(Number.isNaN(passHatK(3, 1, 5)), 'passHatK(n<k) -> NaN');
});

// ---------------------------------------------------------------------------
// EVAL-02 / D-01: per-stratum false-uphold counting is deterministic, off-model (verdict vs gold),
// and DISCRIMINATING -- it flips between a present fixture and an absent sibling.
// ---------------------------------------------------------------------------

function loadGold(caseName) {
  return JSON.parse(fs.readFileSync(path.join(aggCase(caseName), 'gold.json'), 'utf8'));
}

test('EVAL-02 false-uphold PRESENT: a refuted-gold claim voted unrefuted IS counted (count 1)', () => {
  // gold: c-bad -> refuted, c-good -> unrefuted. votes: c-bad voted unrefuted (false-uphold),
  // c-good voted unrefuted (CORRECT, not a false-uphold). The correct-unrefuted control proves the
  // counter scores against GOLD, not "any unrefuted verdict" -- so the count is exactly 1, not 2.
  const gold = loadGold('false-uphold-present');
  const n = countFalseUpholds(path.join(aggCase('false-uphold-present'), 'votes'), gold);

  assert.equal(n, 1, 'exactly one false-uphold (c-bad refuted-gold voted unrefuted); c-good is correct');
});

test('EVAL-02 false-uphold ABSENT (sibling): the same gold-bad claim voted refuted is NOT counted (count 0)', () => {
  // Identical gold + identical claim ids, but c-bad is voted refuted (the voter caught the bad
  // claim). The counter MUST flip to 0 -- if it counted regardless of verdict (a tautology), this
  // sibling would still report 1 and the discrimination would be lost (Phase 17 CR-01).
  const gold = loadGold('false-uphold-absent');
  const n = countFalseUpholds(path.join(aggCase('false-uphold-absent'), 'votes'), gold);

  assert.equal(n, 0, 'no false-uphold when the refuted-gold claim is correctly voted refuted');
});

// ---------------------------------------------------------------------------
// D-06: the gated quantity is the Haiku-MINUS-Sonnet DELTA on the shared SUBTLE pool, never Haiku's
// absolute rate. The fixture makes Sonnet NON-ZERO so the subtraction must fire.
// ---------------------------------------------------------------------------

test('D-06 Haiku-minus-Sonnet DELTA subtracts on the shared SUBTLE pool (Haiku 2 - Sonnet 1 -> 1)', () => {
  // Shared gold pool of three refuted-gold claims. Haiku false-upholds c1,c2 (count 2); Sonnet
  // false-upholds only c1 (count 1). The DELTA is the EXCESS: 2 - 1 = 1. Sonnet being NON-ZERO is
  // what makes this discriminating -- if the code reported Haiku's ABSOLUTE count it would be 2 and
  // fail this assertion.
  const gold = loadGold('delta-two-tier');
  const haikuCount = countFalseUpholds(path.join(aggCase('delta-two-tier'), 'haiku'), gold);
  const sonnetCount = countFalseUpholds(path.join(aggCase('delta-two-tier'), 'sonnet'), gold);

  assert.equal(haikuCount, 2, 'Haiku false-upholds c1 and c2');
  assert.equal(sonnetCount, 1, 'Sonnet false-upholds only c1');
  assert.equal(delta(haikuCount, sonnetCount), 1, 'DELTA = Haiku - Sonnet = 2 - 1 = 1 (the excess)');
});

// ---------------------------------------------------------------------------
// EVAL-04 / D-07: the frozen eval-thresholds object + the mechanical lock-rule verdict.
// ---------------------------------------------------------------------------

test('EVAL-04 EVAL_THRESHOLDS is Object.isFrozen and carries ALPHA / RELIABLE_TRIALS / MIN_K / escalation band', () => {
  assert.equal(Object.isFrozen(EVAL_THRESHOLDS), true, 'EVAL_THRESHOLDS must be frozen (single source of truth)');
  assert.equal(EVAL_THRESHOLDS.ALPHA, 0.05, 'ALPHA pinned at 0.05');
  assert.equal(EVAL_THRESHOLDS.RELIABLE_TRIALS, 15, 'RELIABLE_TRIALS pinned at 15');
  assert.equal(EVAL_THRESHOLDS.MIN_K, 5, 'MIN_K pinned at 5 (EVAL-02 k>=5)');
  // The escalation-kill band (cost gate): Haiku is killed if escalation fraction crosses it.
  assert.equal(EVAL_THRESHOLDS.ESCALATION_KILL_LOW, 0.4, 'escalation kill band low edge 0.40');
  assert.equal(EVAL_THRESHOLDS.ESCALATION_KILL_HIGH, 0.5, 'escalation kill band high edge 0.50');
  // The DELTA upper-CI ceiling encoding "~0": at or below the zero-excess-at-reliable-15 CP ceiling.
  assert.ok(
    EVAL_THRESHOLDS.DELTA_UPPER_MAX > clopperPearsonUpper(0, 15) &&
      EVAL_THRESHOLDS.DELTA_UPPER_MAX < clopperPearsonUpper(1, 15),
    'DELTA_UPPER_MAX must separate the 0/15 CP ceiling (PASS) from the 1/15 ceiling (FAIL)',
  );
});

test('EVAL-04 lock-rule PASS: zero-excess DELTA upper (~0) AND escalation below the kill band AND reliable=15', () => {
  // 0 of 15 excess false-upholds -> DELTA upper bound ~0.218 (at or below DELTA_UPPER_MAX);
  // escalation 0.30 is below the 0.40 kill-band low edge; reliable trials met -> PASS.
  const verdict = lockRuleVerdict({
    subtleOpenBookDeltaUpper: clopperPearsonUpper(0, 15),
    escalationFraction: 0.3,
    reliableTrials: 15,
  });
  assert.equal(verdict, 'PASS', 'all three gates clear -> PASS');
});

test('EVAL-04 lock-rule FAIL-RAISE on the false-uphold gate (DELTA upper above ~0)', () => {
  // 1 of 15 excess false-upholds -> DELTA upper ~0.319 (above DELTA_UPPER_MAX). Even with escalation
  // and reliability fine, the false-uphold gate alone forces FAIL-RAISE (it is the SOLE hard gate).
  const verdict = lockRuleVerdict({
    subtleOpenBookDeltaUpper: clopperPearsonUpper(1, 15),
    escalationFraction: 0.3,
    reliableTrials: 15,
  });
  assert.equal(verdict, 'FAIL-RAISE', 'a non-zero excess false-uphold upper bound forces FAIL-RAISE');
});

test('EVAL-04 lock-rule FAIL-RAISE on the cost gate (escalation above the kill band)', () => {
  // Even with a clean (~0) false-uphold DELTA and reliable=15, escalation 0.55 (above the 0.50 high
  // edge) kills Haiku on cost -> FAIL-RAISE.
  const verdict = lockRuleVerdict({
    subtleOpenBookDeltaUpper: clopperPearsonUpper(0, 15),
    escalationFraction: 0.55,
    reliableTrials: 15,
  });
  assert.equal(verdict, 'FAIL-RAISE', 'escalation above the kill band forces FAIL-RAISE on cost');
});

test('EVAL-04 lock-rule FAIL-RAISE when reliability not yet reached (reliableTrials < 15)', () => {
  // A clean DELTA + fine escalation but only 8 reliable trials -> not enough evidence to declare
  // PASS -> FAIL-RAISE (PASS requires reliable=15 on SUBTLE, D-06/D-07).
  const verdict = lockRuleVerdict({
    subtleOpenBookDeltaUpper: clopperPearsonUpper(0, 15),
    escalationFraction: 0.3,
    reliableTrials: 8,
  });
  assert.equal(verdict, 'FAIL-RAISE', 'reliability < RELIABLE_TRIALS cannot declare PASS');
});

// ---------------------------------------------------------------------------
// Hardening: fail-closed parse of an untrusted vote file (reuse the runtime ContractError discipline
// via the cross-tree import) -- a malformed vote file must throw, never coerce.
// ---------------------------------------------------------------------------

test('hardening: a malformed vote JSON file fails closed (countFalseUpholds throws, no bare JSON.parse)', () => {
  // Write a runtime-only bad fixture under os.tmpdir() (NEVER into the committed __fixtures__ tree).
  const runDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-eval-badvote-'));
  const votesDir = path.join(runDir, 'votes');
  fs.mkdirSync(votesDir, { recursive: true });

  try {
    fs.writeFileSync(path.join(votesDir, 'c-bad-0.json'), 'not json', 'utf8');
    assert.throws(
      () => countFalseUpholds(votesDir, { 'c-bad': 'refuted' }),
      /malformed JSON|cannot read/,
      'a malformed vote file must fail closed (routed through the runtime ContractError read)',
    );
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
});

test('hardening: a path-traversal vote id is rejected via the cross-tree safeId guard', () => {
  // A vote record whose id is a path-traversal attempt must be rejected (the eval aggregator routes
  // content-derived ids through the runtime safeId). Build the bad input under os.tmpdir().
  const runDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-eval-traversal-'));
  const votesDir = path.join(runDir, 'votes');
  fs.mkdirSync(votesDir, { recursive: true });

  try {
    fs.writeFileSync(
      path.join(votesDir, 'evil-0.json'),
      JSON.stringify({ id: '../evil', verdict: 'unrefuted' }),
      'utf8',
    );
    assert.throws(
      () => countFalseUpholds(votesDir, { '../evil': 'refuted' }),
      /path traversal rejected|unsafe id/,
      'a path-traversal vote id must be rejected by the cross-tree safeId guard',
    );
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
});

test('determinism: countFalseUpholds is reproducible over the same committed fixture', () => {
  const gold = loadGold('delta-two-tier');
  const a = countFalseUpholds(path.join(aggCase('delta-two-tier'), 'haiku'), gold);
  const b = countFalseUpholds(path.join(aggCase('delta-two-tier'), 'haiku'), gold);
  assert.equal(a, b, 'same input -> same count');
});

// ---------------------------------------------------------------------------
// Plan 19-03 / EVAL-04 anti-drift: the re-registered lock-rule PROSE (eval/lz-eval-lock-rule.md)
// must match the frozen EVAL_THRESHOLDS byte-for-byte AND its recorded pooled-n CP(1,N) ceiling
// table must equal clopperPearsonUpper(1, N) at the locked N. The code is authoritative; this test
// fails the gate if the prose drifts from EVAL_THRESHOLDS or mis-records the formula ceiling.
// ---------------------------------------------------------------------------

const LOCK_RULE = path.join(HERE, 'lz-eval-lock-rule.md');

test('EVAL-04 anti-drift: lock-rule prose gate-thresholds match EVAL_THRESHOLDS byte-for-byte', () => {
  const prose = fs.readFileSync(LOCK_RULE, 'utf8');

  // Each frozen gate-threshold number must appear verbatim in the prose threshold table. The
  // assertion is DISCRIMINATING: it pins the EXACT value, so a doc that drifts (e.g. ALPHA 0.10)
  // would fail. We build the expected strings from EVAL_THRESHOLDS so the test follows the code.
  const checks = [
    ['`ALPHA` | ' + EVAL_THRESHOLDS.ALPHA + ' ', 'ALPHA'],
    ['`RELIABLE_TRIALS` | ' + EVAL_THRESHOLDS.RELIABLE_TRIALS + ' ', 'RELIABLE_TRIALS'],
    ['`MIN_K` | ' + EVAL_THRESHOLDS.MIN_K + ' ', 'MIN_K'],
    // The escalation band edges are written with two decimals in the prose (0.40 / 0.50).
    ['`ESCALATION_KILL_LOW` | ' + EVAL_THRESHOLDS.ESCALATION_KILL_LOW.toFixed(2) + ' ', 'ESCALATION_KILL_LOW'],
    ['`ESCALATION_KILL_HIGH` | ' + EVAL_THRESHOLDS.ESCALATION_KILL_HIGH.toFixed(2) + ' ', 'ESCALATION_KILL_HIGH'],
    ['`DELTA_UPPER_MAX` | ' + EVAL_THRESHOLDS.DELTA_UPPER_MAX + ' ', 'DELTA_UPPER_MAX'],
    ['`STRATA.SUPPORTED_FRACTION` | ' + EVAL_THRESHOLDS.STRATA.SUPPORTED_FRACTION.toFixed(2) + ' ', 'SUPPORTED_FRACTION'],
    ['`STRATA.BAD_FRACTION` | ' + EVAL_THRESHOLDS.STRATA.BAD_FRACTION.toFixed(2) + ' ', 'BAD_FRACTION'],
    ['`STRATA.SUBTLE_FRACTION_OF_BAD` | ' + EVAL_THRESHOLDS.STRATA.SUBTLE_FRACTION_OF_BAD.toFixed(2) + ' ', 'SUBTLE_FRACTION_OF_BAD'],
  ];

  for (const [needle, name] of checks) {
    assert.ok(prose.includes(needle), 'lock-rule prose must carry the frozen ' + name + ' value: "' + needle.trim() + '"');
  }
});

test('EVAL-04 anti-drift is DISCRIMINATING: a wrong threshold value is NOT present in the prose', () => {
  // Prove the byte-for-byte match is not vacuous: a deliberately-wrong ALPHA string (0.10) must NOT
  // appear in the threshold table row for ALPHA. If the prose ever drifted to 0.10 this would flip.
  const prose = fs.readFileSync(LOCK_RULE, 'utf8');
  assert.ok(prose.includes('`ALPHA` | ' + EVAL_THRESHOLDS.ALPHA + ' '), 'the correct ALPHA is present');
  assert.ok(!prose.includes('`ALPHA` | 0.10 '), 'a drifted ALPHA (0.10) must NOT be present (discriminating)');
});

test('EVAL-04 anti-drift: the recorded CP(1,N) pooled-ceiling table matches clopperPearsonUpper(1,N)', () => {
  const prose = fs.readFileSync(LOCK_RULE, 'utf8');

  // The re-registered rule records the pooled-n CP(1,N) ceiling at N=60/80/100 as ~4-decimal labels.
  // Recompute each from the engine and assert the prose carries the matching ~0.0xxx value -- the
  // doc mirrors the formula byte-for-byte (the code wins). The assertion is DISCRIMINATING: a
  // mis-recorded ceiling (e.g. claiming ~0.05 at N=60) would fail.
  for (const N of [60, 80, 100]) {
    const ceiling = clopperPearsonUpper(1, N, EVAL_THRESHOLDS.ALPHA);
    const recorded = '~' + ceiling.toFixed(4); // e.g. 0.08939... -> "~0.0894"
    assert.ok(
      prose.includes(recorded),
      'lock-rule prose must record CP(1,' + N + ',0.05) as ' + recorded + ' (got engine ' + ceiling.toFixed(4) + ')',
    );
  }
});

test('EVAL-04 the re-registration documents the zero-votes window + VOID outcome + pinned minimums', () => {
  const prose = fs.readFileSync(LOCK_RULE, 'utf8');

  // The pre-registration must explicitly state the zero-votes timing (EVAL-04 integrity).
  assert.ok(/zero-votes window/i.test(prose), 'the re-registration states the zero-votes window timing');

  // VOID is the third outcome (D-06 saturation pre-condition).
  assert.ok(/\bVOID\b/.test(prose), 'the rule names the VOID outcome (D-06)');
  assert.ok(/saturation pre-condition/i.test(prose), 'the rule documents the saturation pre-condition');

  // The mechanical minimums are PINNED (OQ-2), and the calibrator may only tighten, never loosen.
  assert.ok(/minQueries\s*=\s*3/i.test(prose), 'minQueries = 3 is pinned');
  assert.ok(/minDocs\s*=\s*5/i.test(prose), 'minDocs = 5 is pinned');
  assert.ok(/tighten/i.test(prose) && /never\s+loosen/i.test(prose), 'the calibrator-tighten-only ratchet is stated');

  // The minimums are search-loop params, NOT EVAL_THRESHOLDS keys (the note that prevents asserting
  // them against the engine struct).
  assert.ok(/NOT\s+`?EVAL_THRESHOLDS`?\s+keys/i.test(prose), 'the prose states the minimums are NOT EVAL_THRESHOLDS keys');
});

test('EVAL-04 the lock rule is strictly ASCII (committed bytes, CLAUDE.md)', () => {
  const buf = fs.readFileSync(LOCK_RULE);

  for (let i = 0; i < buf.length; i += 1) {
    assert.ok(buf[i] <= 0x7f, 'lock-rule byte at offset ' + i + ' must be ASCII (<= 0x7F), got 0x' + buf[i].toString(16));
  }
});
