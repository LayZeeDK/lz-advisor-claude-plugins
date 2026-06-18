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

// The KS-enrichment layer's byte-locked URL_DATE_RULE (Plan 19-04, Task 1). The Task-3 anti-drift
// assertion below pins the manifest's recorded rule string == this RegExp's source byte-for-byte.
import { URL_DATE_RULE } from './lz-eval-trap-assembler.mjs';

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

test('hardening: the stats helpers fail closed on degenerate-arithmetic inputs x>n / c>n (no silent NaN/1.0 -- F1/F2)', () => {
  // n > 0 with x > n is impossible; the guard throws rather than feeding jStat a negative shape (NaN).
  assert.throws(() => clopperPearsonUpper(5, 3), (e) => e.name === 'ContractError', 'clopperPearsonUpper(x>n) fails closed');
  assert.throws(() => wilsonUpper(5, 3), (e) => e.name === 'ContractError', 'wilsonUpper(x>n) fails closed');
  // c > n is impossible (more correct than trials); the guard throws rather than returning a corrupted 1.0.
  assert.throws(() => passAtK(3, 5, 1), (e) => e.name === 'ContractError', 'passAtK(c>n) fails closed');
  assert.throws(() => passHatK(3, 5, 1), (e) => e.name === 'ContractError', 'passHatK(c>n) fails closed');
  // DISCRIMINATING: the degenerate-but-VALID boundaries still return their defined values (the guard is
  // x>n / c>n only, it does not over-fire on n===0 or c===n).
  assert.equal(clopperPearsonUpper(3, 0), 1, 'CP(x,0)=1 preserved (n===0 short-circuits before the x>n guard)');
  assert.equal(passAtK(15, 15, 5), 1, 'passAtK(n,n,k)=1 preserved (c===n is valid)');
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

// ---------------------------------------------------------------------------
// Plan 19-04 / Task 3 / T-19-15 pre-registration anti-drift: the manifest's recorded URL_DATE_RULE
// string is BYTE-LOCKED to the KS-enrichment layer's RegExp source. The manifest carries the rule the
// offline read uses; the assembler owns the RegExp. If either drifts, the gate fails -- a drifted rule
// (e.g. a looser/tighter regex) could silently re-populate the strata after the zero-votes window.
// ---------------------------------------------------------------------------

const MANIFEST = path.join(HERE, '__fixtures__', 'lz-eval-manifest.json');

test('Task-3 anti-drift: the manifest URL_DATE_RULE string equals URL_DATE_RULE.source byte-for-byte', () => {
  const m = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const recorded = m.stage1_pre_registration && m.stage1_pre_registration.url_date_rule;

  assert.equal(typeof recorded, 'string', 'the manifest records a stage1_pre_registration.url_date_rule string');
  assert.equal(
    recorded,
    URL_DATE_RULE.source,
    'the manifest URL_DATE_RULE must equal the assembler RegExp source byte-for-byte (anti-drift, T-19-15)',
  );

  // DISCRIMINATING: the recorded string is the EXACT strict path-only rule (not a vacuous empty/looser
  // pattern). A drifted manifest (e.g. dropping the day range bound) would no longer equal the source.
  assert.equal(
    recorded,
    '(19|20)\\d{2}\\/(0[1-9]|1[0-2])\\/(0[1-9]|[12]\\d|3[01])(\\/|$)',
    'the byte-locked strict path-only rule is recorded verbatim',
  );
});

test('Task-3 pre-registration: EVAL_THRESHOLDS numbers are byte-UNCHANGED (the re-plan adds only assembly-layer rules)', () => {
  // The re-plan (two offline strata + scoring reconciliation + no-abstention) touches the manifest +
  // lock rule as PRE-REGISTRATION only; the frozen engine thresholds are byte-identical. Pin every
  // value so a sneaky threshold change during the re-plan would fail.
  assert.equal(EVAL_THRESHOLDS.ALPHA, 0.05);
  assert.equal(EVAL_THRESHOLDS.RELIABLE_TRIALS, 15);
  assert.equal(EVAL_THRESHOLDS.MIN_K, 5);
  assert.equal(EVAL_THRESHOLDS.DELTA_UPPER_MAX, 0.25);
  assert.equal(EVAL_THRESHOLDS.ESCALATION_KILL_LOW, 0.4);
  assert.equal(EVAL_THRESHOLDS.ESCALATION_KILL_HIGH, 0.5);
  assert.equal(Object.isFrozen(EVAL_THRESHOLDS), true, 'EVAL_THRESHOLDS stays frozen');
});

test('Task-3 lock rule documents the SINGLE offline stratum + the gold-blind probe + the count-vs-rank correction + scoring reconciliation + no-abstention (RE-PLAN-4 re-pre-registration)', () => {
  const prose = fs.readFileSync(LOCK_RULE, 'utf8');

  // RE-PLAN-4: ONE offline stratum (evidence-absent); buried DROPPED + date-sensitive DEFERRED. The
  // difficulty-axis wording is CLOSED-BOOK JUDGMENT, NOT retrieval orchestration (the stale prose was
  // corrected in lockstep with this assertion); this anti-drift assertion tracks the single-stratum prose.
  assert.ok(/ONE offline CLOSED-BOOK JUDGMENT-difficulty stratum/i.test(prose), 'the lock rule states ONE offline closed-book judgment-difficulty stratum (single stratum)');
  assert.ok(!/Two offline CLOSED-BOOK JUDGMENT-difficulty strata/i.test(prose), 'the prior "Two offline ... strata" prose is gone (single stratum, RE-PLAN-4)');
  assert.ok(/date-sensitive is DEFERRED to the Phase-20 live phase/i.test(prose), 'date-sensitive deferral is recorded');
  assert.ok(/buried is DROPPED ENTIRELY from the offline gate/i.test(prose), 'buried is recorded as DROPPED from the offline gate (RE-PLAN-4)');
  // The corrected prose no longer claims the difficulty lives in retrieval orchestration (anti
  // self-contradiction): it states retrieval orchestration is NOT measured offline.
  assert.ok(!/difficulty lives in RETRIEVAL ORCHESTRATION/i.test(prose), 'the stale "difficulty lives in RETRIEVAL ORCHESTRATION" prose is corrected');

  // RE-PLAN-4: the gold-blind entailment validity probe (the mandatory mitigation) + the count-vs-rank
  // predicate-error record (D-RP4-2) are recorded in the pre-registration (anti-drift guarded).
  assert.ok(/gold-blind entailment validity probe/i.test(prose), 'the lock rule records the gold-blind entailment validity probe (the mandatory mitigation)');
  assert.ok(/count-vs-rank/i.test(prose) && /D-RP4-2/.test(prose), 'the lock rule records the count-vs-rank predicate-error correction (D-RP4-2)');

  // The scoring reconciliation + the no-abstention rule (T-19-19 / W1).
  assert.ok(/SCORING RECONCILIATION/.test(prose), 'the lock rule carries a SCORING RECONCILIATION section');
  assert.ok(/NO-ABSTENTION rule/i.test(prose), 'the lock rule carries the NO-ABSTENTION rule');

  // The byte-locked URL_DATE_RULE appears verbatim in the lock-rule prose.
  assert.ok(prose.includes('(19|20)\\d{2}\\/(0[1-9]|1[0-2])\\/(0[1-9]|[12]\\d|3[01])(\\/|$)'), 'the byte-locked URL_DATE_RULE is recorded in the lock rule');

  // The strict-cutoff / no-date-shift / >=5-survivor rules.
  assert.ok(/no-date-shift|NO date-shift/i.test(prose), 'the no-date-shift rule is recorded');
  assert.ok(/>=5 strictly-pre-cutoff|>= ?5 strictly-pre-cutoff/i.test(prose) || />=5 strictly-pre-cutoff surviving/i.test(prose), 'the >=5-survivor rule is recorded');
});

test('Task-3 RE-PLAN-5 re-pre-registration: the lock rule + manifest record the positive controls + OOF probe consensus + the NON-ZERO decision rule + the probe-strictness rubric + k=9 + CP(0,N) (construct/measurement-validity prose, NOT threshold changes)', () => {
  const prose = fs.readFileSync(LOCK_RULE, 'utf8');

  // Finding 1 -- the interleaved positive controls (the mandatory power/plumbing check).
  assert.ok(/interleaved POSITIVE CONTROLS/i.test(prose), 'the lock rule records the interleaved positive controls (Finding 1)');
  assert.ok(/ALWAYS-REFUTE-ARTIFACT/i.test(prose), 'the lock rule records the always-refute-artifact VOID');
  assert.ok(/positive-control floor/i.test(prose), 'the lock rule records the independent positive-control floor');

  // Finding 2 -- the OUT-OF-FAMILY all-agree-retain probe consensus + the seed-75 proof + the copilot CLI.
  assert.ok(/OUT-OF-FAMILY probe consensus/i.test(prose), 'the lock rule records the out-of-family probe consensus (Finding 2)');
  assert.ok(/all-agree-retain/i.test(prose), 'the lock rule records the ALL-AGREE-RETAIN rule');
  assert.ok(/seed 75/i.test(prose), 'the lock rule records the seed-75 leniency proof');
  assert.ok(/copilot --model \{gpt-5\.5\|gemini-3\.1-pro-preview\}/.test(prose), 'the lock rule records the copilot CLI invocation (the OOF probe broker)');
  assert.ok(/GENERATE is DEFERRED/i.test(prose), 'the lock rule records the out-of-family-generate deferral (board guardrail 7)');

  // The probe-strictness rubric (the seed-75 DISQUALIFY example).
  assert.ok(/probe-strictness rubric/i.test(prose), 'the lock rule records the probe-strictness rubric');
  assert.ok(/DISQUALIF/i.test(prose) && /entail the overreach/i.test(prose), 'the rubric DISQUALIFIES survivors-entail-the-overreach packets');

  // k=9 attack-mode-diverse seats (picked ONCE).
  assert.ok(/k=9 attack-mode-diverse seats/i.test(prose), 'the lock rule records k=9 attack-mode-diverse seats');
  assert.ok(/picked ONCE/i.test(prose), 'the lock rule records that k is picked ONCE (anti result-shopping)');
  assert.ok(/ATTACK_MODES rotation/i.test(prose), 'the lock rule records the ATTACK_MODES rotation');

  // The NON-ZERO decision rule (the exact wording + the four terminal labels + the W-3 derivation note).
  assert.ok(/NON-ZERO decision rule/i.test(prose), 'the lock rule records the NON-ZERO decision rule (Finding 3)');
  assert.ok(/ALL-PROBES-AGREE consensus/i.test(prose), 'the rule wording requires the all-probes-agree consensus (i)');
  assert.ok(/min-MET/i.test(prose) && /min-not-met/i.test(prose), 'the rule wording requires a min-MET trace (ii)');
  assert.ok(/SATURATED-VOID/.test(prose) && /BELOW-CEILING-PROCEED/.test(prose) && /ARTIFACT-VOID-REDO/.test(prose), 'the four terminal labels are recorded');
  assert.ok(/DERIVED MECHANICALLY/i.test(prose), 'the min-not-met leg is recorded as DERIVED MECHANICALLY (W-3)');

  // The CP(0,N) gate statistic + per-vote-secondary + per-class + frozen N_retained (UNANIMOUS-3).
  assert.ok(/CP\(0, ?N/i.test(prose) || /CP\(0,N\)/i.test(prose), 'the lock rule records the CP(0,N) pooled gate statistic');
  assert.ok(/LABELED SECONDARY/i.test(prose), 'per-vote 0/(N*k) is recorded as a LABELED SECONDARY only');
  assert.ok(/PER-CLASS breakdown/i.test(prose), 'the per-class breakdown is recorded');
  assert.ok(/FREEZE N_retained/i.test(prose), 'the frozen N_retained discipline is recorded');
  assert.ok(/partition checksum/i.test(prose), 'the partition checksum (trials(traps)+nControls==N_retained) is recorded');

  // The CARRIED RE-PLAN-4 sections STAND (additive, not replaced): the single-stratum-TRAP wording + the
  // in-family probe + the count-vs-rank correction are still recorded.
  assert.ok(/ONE offline CLOSED-BOOK JUDGMENT-difficulty stratum/i.test(prose), 'the carried single trap-stratum wording STANDS');
  assert.ok(/gold-blind entailment validity probe/i.test(prose), 'the carried in-family gold-blind probe section STANDS');
  assert.ok(/count-vs-rank/i.test(prose), 'the carried count-vs-rank correction STANDS');

  // The manifest records the RE-PLAN-5 stage1_pre_registration blocks (anti-drift).
  const m = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const pre = m.stage1_pre_registration;
  assert.ok(typeof pre.positive_controls === 'string' && pre.positive_controls.length > 0, 'the manifest records positive_controls');
  assert.ok(typeof pre.out_of_family_probe_consensus === 'string' && /all-agree-retain/i.test(pre.out_of_family_probe_consensus), 'the manifest records out_of_family_probe_consensus (all-agree-retain)');
  assert.ok(typeof pre.probe_strictness_rubric === 'string' && /seed[- ]75/i.test(pre.probe_strictness_rubric), 'the manifest records the probe_strictness_rubric (the seed-75 example)');
  assert.ok(typeof pre.k_and_seat_diversity === 'string' && /k=9/i.test(pre.k_and_seat_diversity), 'the manifest records k_and_seat_diversity (k=9)');
  assert.ok(typeof pre.non_zero_decision_rule === 'string' && /ALWAYS-REFUTE-ARTIFACT-VOID/.test(pre.non_zero_decision_rule), 'the manifest records the non_zero_decision_rule (the four labels)');
  assert.ok(typeof pre.cp_n_gate_statistic === 'string' && /partition checksum/i.test(pre.cp_n_gate_statistic), 'the manifest records cp_n_gate_statistic (the partition checksum)');

  // The strata membership in the manifest definition is EXACTLY {evidence-absent, positive-control} for
  // the offline gate (buried + date-sensitive defs are retained for Phase-20 but carry NO example rows).
  const avtExamples = m.examples.filter((e) => e.source === 'averitec');
  const avtStrata = new Set(avtExamples.map((e) => e.stratum));
  assert.ok(avtStrata.has('evidence-absent') && avtStrata.has('positive-control'), 'the manifest AVeriTeC example rows span {evidence-absent, positive-control}');
  assert.equal(avtStrata.size, 2, 'EXACTLY {evidence-absent, positive-control} example rows (buried + date-sensitive carry NO example rows)');

  // EVAL_THRESHOLDS numbers are byte-UNCHANGED (the RE-PLAN-5 additions are construct/measurement-validity
  // prose, NOT threshold changes -- re-pinned here so a sneaky threshold change would fail).
  assert.equal(EVAL_THRESHOLDS.ALPHA, 0.05);
  assert.equal(EVAL_THRESHOLDS.RELIABLE_TRIALS, 15);
  assert.equal(EVAL_THRESHOLDS.MIN_K, 5);
  assert.equal(EVAL_THRESHOLDS.DELTA_UPPER_MAX, 0.25);
  assert.equal(EVAL_THRESHOLDS.ESCALATION_KILL_HIGH, 0.5);

  // The byte-locked URL_DATE_RULE is UNCHANGED in the manifest (manifest string == URL_DATE_RULE.source).
  assert.equal(m.stage1_pre_registration.url_date_rule, URL_DATE_RULE.source, 'the URL_DATE_RULE byte-lock holds through the RE-PLAN-5 re-registration');
});

// ---------------------------------------------------------------------------
// D2 additions: lockRuleVerdict boundary pins + countFalseUpholds contract guards + passHatK all-fail
// ---------------------------------------------------------------------------

test('D2 lockRuleVerdict: escalationFraction 0.45 (inside [0.40,0.50]) with clean DELTA + reliable=15 -> PASS (kill is the HIGH edge, not LOW)', () => {
  // The cost gate is a strict < on the HIGH edge (0.50). 0.45 is inside the named band [0.40,0.50]
  // but BELOW the 0.50 kill threshold, so it must clear. This pins that the LOW edge (0.40) is NOT
  // the kill threshold -- a regression that swapped HIGH for LOW would fail this assertion.
  const verdict = lockRuleVerdict({
    subtleOpenBookDeltaUpper: clopperPearsonUpper(0, 15),
    escalationFraction: 0.45,
    reliableTrials: 15,
  });
  assert.equal(verdict, 'PASS', 'escalation 0.45 is below the kill threshold 0.50 -> PASS');
});

test('D2 lockRuleVerdict: escalationFraction 0.50 (exact HIGH edge, strict <) -> FAIL-RAISE', () => {
  // The cost gate is escalationFraction < ESCALATION_KILL_HIGH (0.50). Exact equality (0.50 < 0.50
  // is false) must fail. This pins the strict-less-than boundary: a >= implementation would pass 0.50.
  const verdict = lockRuleVerdict({
    subtleOpenBookDeltaUpper: clopperPearsonUpper(0, 15),
    escalationFraction: 0.50,
    reliableTrials: 15,
  });
  assert.equal(verdict, 'FAIL-RAISE', 'escalation 0.50 is NOT strictly < 0.50 -> FAIL-RAISE (strict <)');
});

test('D2 lockRuleVerdict: subtleOpenBookDeltaUpper === DELTA_UPPER_MAX (at the <= boundary) -> PASS', () => {
  // The false-uphold gate is <=: exact equality with DELTA_UPPER_MAX must clear. Pins 0.25 as the
  // boundary. A regression using strict < would fail this assertion.
  const verdict = lockRuleVerdict({
    subtleOpenBookDeltaUpper: EVAL_THRESHOLDS.DELTA_UPPER_MAX,
    escalationFraction: 0.3,
    reliableTrials: 15,
  });
  assert.equal(verdict, 'PASS', 'deltaUpper === DELTA_UPPER_MAX clears the <= gate -> PASS');
});

test('D2 lockRuleVerdict: subtleOpenBookDeltaUpper one ULP above DELTA_UPPER_MAX -> FAIL-RAISE (pins 0.25 as ceiling)', () => {
  // A value infinitesimally above DELTA_UPPER_MAX must not clear. Pins the exact value of the
  // threshold: any drift (e.g. to 0.26) would flip this assertion.
  const verdict = lockRuleVerdict({
    subtleOpenBookDeltaUpper: EVAL_THRESHOLDS.DELTA_UPPER_MAX + 1e-9,
    escalationFraction: 0.3,
    reliableTrials: 15,
  });
  assert.equal(verdict, 'FAIL-RAISE', 'deltaUpper one ULP above DELTA_UPPER_MAX fails the <= gate -> FAIL-RAISE');
});

test('D2 lockRuleVerdict: reliableTrials 14 (boundary-minus-1) with clean DELTA + escalation below kill -> FAIL-RAISE', () => {
  // The reliability gate is reliableTrials >= RELIABLE_TRIALS (15). 14 is one below the boundary
  // and must not pass. Pins the >= edge: a > implementation would wrongly reject 15 too. Existing
  // test uses 8; this pins the exact minus-1 boundary.
  const verdict = lockRuleVerdict({
    subtleOpenBookDeltaUpper: clopperPearsonUpper(0, 15),
    escalationFraction: 0.3,
    reliableTrials: 14,
  });
  assert.equal(verdict, 'FAIL-RAISE', 'reliableTrials 14 is one below the >= 15 gate -> FAIL-RAISE');
});

test('D2 countFalseUpholds: vote record with unrecognized verdict throws ContractError', () => {
  // A verdict value that is neither "unrefuted" nor "refuted" is a contract violation. Pins that the
  // guard fires (a regression removing the verdict check would silently count or skip the record).
  const runDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-eval-badverdict-'));
  const votesDir = path.join(runDir, 'votes');
  fs.mkdirSync(votesDir, { recursive: true });

  try {
    fs.writeFileSync(
      path.join(votesDir, 'c-x-0.json'),
      JSON.stringify({ id: 'c-x', verdict: 'UNKNOWN' }),
      'utf8',
    );
    assert.throws(
      () => countFalseUpholds(votesDir, { 'c-x': 'refuted' }),
      (e) => e.name === 'ContractError',
      'an unrecognized verdict must throw ContractError',
    );
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
});

test('D2 countFalseUpholds: vote record whose id is absent from goldLabels throws ContractError', () => {
  // A vote id not present in goldLabels is a contract violation (there is no gold to compare against).
  // Pins that the missing-gold guard fires (a regression returning 0 silently would lose discrimination).
  const runDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-eval-missinggold-'));
  const votesDir = path.join(runDir, 'votes');
  fs.mkdirSync(votesDir, { recursive: true });

  try {
    fs.writeFileSync(
      path.join(votesDir, 'c-unknown-0.json'),
      JSON.stringify({ id: 'c-unknown', verdict: 'unrefuted' }),
      'utf8',
    );
    assert.throws(
      () => countFalseUpholds(votesDir, { 'c-other': 'refuted' }),
      (e) => e.name === 'ContractError',
      'a vote id absent from goldLabels must throw ContractError',
    );
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
});

test('D2 countFalseUpholds: a vote id equal to an Object.prototype member name (__proto__/toString) throws ContractError (own-property gold guard)', () => {
  // The missing-gold guard must fail closed even when the vote id is a prototype-chain key. With a
  // bare `goldLabels[id] == null` check, id '__proto__' / 'toString' resolve to inherited members
  // (NOT null) and the record would be SILENTLY skipped, defeating the fail-closed-on-missing-gold
  // contract. The Object.hasOwn check rejects them. DISCRIMINATING: a plain absent id already throws
  // (the test above); these prototype keys are exactly the subset that bypassed the pre-fix guard.
  const runDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-eval-protokey-'));
  const votesDir = path.join(runDir, 'votes');
  fs.mkdirSync(votesDir, { recursive: true });

  try {
    for (const protoId of ['__proto__', 'toString']) {
      fs.writeFileSync(path.join(votesDir, 'v.json'), JSON.stringify({ id: protoId, verdict: 'unrefuted' }), 'utf8');
      assert.throws(
        () => countFalseUpholds(votesDir, { 'c-real': 'refuted' }),
        (e) => e.name === 'ContractError' && /no gold label/i.test(e.message),
        'vote id ' + protoId + ' (a prototype-chain key) must throw ContractError, not be silently skipped',
      );
    }
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
});

test('D2 passHatK(15, 0, 5) === 0 (all-fail: no k-subset of zero correct trials can pass)', () => {
  // Symmetric to the passAtK(n,0,k)===0 assertion. passHatK(n,c,k) = C(c,k)/C(n,k).
  // C(0,5) === 0 (cannot choose 5 from 0), so the result is 0/C(15,5) = 0. Pins all-fail symmetry.
  assert.ok(Math.abs(passHatK(15, 0, 5) - 0) < 1e-12, 'passHatK(15,0,5) === 0 (no correct -> no passing k-subset)');
});
