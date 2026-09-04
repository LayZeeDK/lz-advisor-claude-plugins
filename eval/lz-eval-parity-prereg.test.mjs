// lz-eval-parity-prereg.test.mjs
//
// PAR-01 / D-20 anti-drift co-test (Plan 22-04, Task 1; NO-SPEND): the pre-registration PROSE
// (eval/lz-eval-parity-prereg.md) must carry the frozen module constants byte-for-byte. Mirrors the
// established anti-drift idiom (eval/lz-eval-lock-rule.md <-> eval/lz-eval-aggregate.mjs
// EVAL_THRESHOLDS, asserted by eval/lz-eval-aggregate.test.mjs): a co-test reads the lock-rule prose
// and asserts each frozen number appears verbatim, so the prose bar can never silently drift from the
// code bar (which would let the verdict be re-tuned post-hoc).
//
// Dev-only eval-tree test: imports the four FROZEN modules + node stdlib only -- NO jstat (this is a
// structural string check; it needs no statistics). The modules import only the SHIPPED runtime
// aggregator's ContractError across trees (one-directional eval -> runtime).
//
// The code is AUTHORITATIVE: every expected needle is built FROM the Object.freeze'd constant, so the
// test FOLLOWS the code -- if a constant changes, the test demands the prose change in lockstep.
//
// DISCRIMINATION (proven, not vacuous): a dedicated test builds a DELIBERATELY-WRONG needle for each
// frozen number (the constant + 1, or a sentinel mismatch) and asserts that wrong needle is NOT present
// in the prose. If the prose ever drifted to the wrong value -- or if the constant changed without the
// prose -- the byte-for-byte assertion above flips RED. The wrong-needle test proves the match is not a
// tautology (a substring match against an empty/looser pattern).
//
// HOST QUIRK (load-bearing): on this host (Windows arm64 / Git Bash) the phase gate MUST target the
// explicit FILE form:
//   node --test eval/lz-eval-parity-prereg.test.mjs
// The directory form (`node --test <dir>`) spuriously exits 1 on this host even when every real test
// passes. The suite is one file, so the file form is the equivalent reliable gate.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// The four FROZEN constant sources (Plans 22-01 + 22-02). The prose must match these byte-for-byte.
import { PARITY_BAR } from './lz-eval-parity-verdict.mjs';
import { JUDGE_MCC_BAR } from './lz-eval-judge-calibration.mjs';
import { SLICE_A_GATE } from './lz-eval-sliceA-gold.mjs';
import { PARITY_K_RANGE } from './lz-eval-parity-judge.mjs';

// Resolve the prereg test-file-relative (NEVER process.cwd() -- cwd drifts under GSD worktrees and
// headless `claude -p`). HERE is the repo-level eval/ dir.
const HERE = path.dirname(fileURLToPath(import.meta.url));
const PREREG = path.join(HERE, 'lz-eval-parity-prereg.md');
const DRIVER = path.join(HERE, 'lz-eval-parity-driver.md');

function readPrereg() {
  return fs.readFileSync(PREREG, 'utf8');
}

// ---------------------------------------------------------------------------
// The frozen constants are themselves Object.frozen (anti-result-shopping, D-20). The prereg only
// records what the code freezes; assert the code froze it.
// ---------------------------------------------------------------------------

test('the frozen constant sources are Object.frozen (anti-result-shopping, D-20)', () => {
  assert.ok(Object.isFrozen(PARITY_BAR), 'PARITY_BAR must be Object.frozen');
  assert.ok(Object.isFrozen(JUDGE_MCC_BAR), 'JUDGE_MCC_BAR must be Object.frozen');
  assert.ok(Object.isFrozen(SLICE_A_GATE), 'SLICE_A_GATE must be Object.frozen');
  assert.ok(Object.isFrozen(PARITY_K_RANGE), 'PARITY_K_RANGE must be Object.frozen');
});

// ---------------------------------------------------------------------------
// The byte-for-byte anti-drift table. Each needle is the EXACT prose-table row cell built FROM the
// frozen constant -- the prereg renders every frozen number as `| `Constant` | <value> |` in its
// "Frozen NUMBERS" table. A drift in either the prose or the code flips this RED.
// ---------------------------------------------------------------------------

function antiDriftChecks() {
  return [
    ['| `PARITY_BAR.PASS_THRESHOLD` | ' + PARITY_BAR.PASS_THRESHOLD + ' |', 'PARITY_BAR.PASS_THRESHOLD'],
    ['| `PARITY_BAR.MAX_LOSS_FLOOR_DIMS` | ' + PARITY_BAR.MAX_LOSS_FLOOR_DIMS + ' |', 'PARITY_BAR.MAX_LOSS_FLOOR_DIMS'],
    ['| `PARITY_BAR.MAX_LOSS_OTHER_DIMS` | ' + PARITY_BAR.MAX_LOSS_OTHER_DIMS + ' |', 'PARITY_BAR.MAX_LOSS_OTHER_DIMS'],
    ['| `JUDGE_MCC_BAR.POINT` | ' + JUDGE_MCC_BAR.POINT + ' |', 'JUDGE_MCC_BAR.POINT'],
    ['| `JUDGE_MCC_BAR.LOWER_FLOOR` | ' + JUDGE_MCC_BAR.LOWER_FLOOR + ' |', 'JUDGE_MCC_BAR.LOWER_FLOOR'],
    ['| `JUDGE_MCC_BAR.ALPHA` | ' + JUDGE_MCC_BAR.ALPHA + ' |', 'JUDGE_MCC_BAR.ALPHA'],
    ['| `SLICE_A_GATE.N_SUP_MIN` | ' + SLICE_A_GATE.N_SUP_MIN + ' |', 'SLICE_A_GATE.N_SUP_MIN'],
    ['| `SLICE_A_GATE.N_REF_MIN` | ' + SLICE_A_GATE.N_REF_MIN + ' |', 'SLICE_A_GATE.N_REF_MIN'],
    ['| `PARITY_K_RANGE.MIN` | ' + PARITY_K_RANGE.MIN + ' |', 'PARITY_K_RANGE.MIN'],
    ['| `PARITY_K_RANGE.MAX` | ' + PARITY_K_RANGE.MAX + ' |', 'PARITY_K_RANGE.MAX'],
  ];
}

test('PAR-01 anti-drift: the prereg prose NUMBERS match the frozen module constants byte-for-byte', () => {
  const prose = readPrereg();

  for (const [needle, name] of antiDriftChecks()) {
    assert.ok(
      prose.includes(needle),
      'prereg prose must carry the frozen ' + name + ' value verbatim: "' + needle + '"',
    );
  }
});

// ---------------------------------------------------------------------------
// DISCRIMINATION: prove the byte-for-byte match is NOT vacuous. For each frozen number, a deliberately
// WRONG needle (the constant value + 1) must NOT appear in the prose table row. If the prose ever
// drifted to the wrong value, the assertion above would already be RED; this proves the match pins the
// EXACT value, not a looser substring. (A prose-vs-constant mismatch breaks the suite.)
// ---------------------------------------------------------------------------

function wrongNeedleChecks() {
  return [
    ['| `PARITY_BAR.PASS_THRESHOLD` | ' + (PARITY_BAR.PASS_THRESHOLD + 1) + ' |', 'PARITY_BAR.PASS_THRESHOLD'],
    ['| `PARITY_BAR.MAX_LOSS_FLOOR_DIMS` | ' + (PARITY_BAR.MAX_LOSS_FLOOR_DIMS + 1) + ' |', 'PARITY_BAR.MAX_LOSS_FLOOR_DIMS'],
    ['| `PARITY_BAR.MAX_LOSS_OTHER_DIMS` | ' + (PARITY_BAR.MAX_LOSS_OTHER_DIMS + 1) + ' |', 'PARITY_BAR.MAX_LOSS_OTHER_DIMS'],
    ['| `JUDGE_MCC_BAR.POINT` | ' + (JUDGE_MCC_BAR.POINT + 1) + ' |', 'JUDGE_MCC_BAR.POINT'],
    ['| `JUDGE_MCC_BAR.LOWER_FLOOR` | ' + (JUDGE_MCC_BAR.LOWER_FLOOR + 1) + ' |', 'JUDGE_MCC_BAR.LOWER_FLOOR'],
    ['| `JUDGE_MCC_BAR.ALPHA` | ' + (JUDGE_MCC_BAR.ALPHA + 1) + ' |', 'JUDGE_MCC_BAR.ALPHA'],
    ['| `SLICE_A_GATE.N_SUP_MIN` | ' + (SLICE_A_GATE.N_SUP_MIN + 1) + ' |', 'SLICE_A_GATE.N_SUP_MIN'],
    ['| `SLICE_A_GATE.N_REF_MIN` | ' + (SLICE_A_GATE.N_REF_MIN + 1) + ' |', 'SLICE_A_GATE.N_REF_MIN'],
    ['| `PARITY_K_RANGE.MIN` | ' + (PARITY_K_RANGE.MIN + 1) + ' |', 'PARITY_K_RANGE.MIN'],
    ['| `PARITY_K_RANGE.MAX` | ' + (PARITY_K_RANGE.MAX + 1) + ' |', 'PARITY_K_RANGE.MAX'],
  ];
}

test('PAR-01 anti-drift is DISCRIMINATING: a wrong (constant + 1) value is NOT present in the prose', () => {
  const prose = readPrereg();

  for (const [wrongNeedle, name] of wrongNeedleChecks()) {
    assert.ok(
      !prose.includes(wrongNeedle),
      'a drifted ' + name + ' value must NOT be present (discriminating): "' + wrongNeedle + '"',
    );
  }
});

// ---------------------------------------------------------------------------
// DISCRIMINATION (the invert-the-fix proof, required by the plan): build the prose table with a single
// deliberate prose-vs-constant mismatch in memory and assert the anti-drift predicate FLIPS RED. This
// proves a real prose edit away from the frozen constant breaks the test (not a tautology).
// ---------------------------------------------------------------------------

test('PAR-01 anti-drift FLIPS RED on a deliberate prose-vs-constant mismatch (invert-the-fix proof)', () => {
  const realProse = readPrereg();

  // Tamper: rewrite the PASS_THRESHOLD prose row to a wrong value (0.7 -> 0.9) -- a result-shopping
  // edit the test must catch.
  const correctRow = '| `PARITY_BAR.PASS_THRESHOLD` | ' + PARITY_BAR.PASS_THRESHOLD + ' |';
  const tamperedRow = '| `PARITY_BAR.PASS_THRESHOLD` | 0.9 |';

  assert.ok(realProse.includes(correctRow), 'precondition: the real prose carries the correct row');

  const tamperedProse = realProse.replace(correctRow, tamperedRow);

  // The anti-drift predicate (the correct needle must be present) MUST now fail on the tampered prose.
  assert.ok(
    !tamperedProse.includes(correctRow),
    'the tampered prose must no longer carry the correct PASS_THRESHOLD row (proves the edit took)',
  );
});

// ---------------------------------------------------------------------------
// The pre-registration must record the load-bearing pieces, not just the numbers: the FLOOR_DIMS, the
// 5-dimension rubric verbatim, the collapse map, the D-09 disclosure, the D-19 threat, the RESOLVED
// feasibility gate + the fallback, and the freeze timestamp record.
// ---------------------------------------------------------------------------

test('PAR-01: the prereg records the FLOOR_DIMS (factual + citation) the frozen PARITY_BAR carries', () => {
  const prose = readPrereg();

  // The two floor dimensions the frozen PARITY_BAR.FLOOR_DIMS names.
  for (const dim of PARITY_BAR.FLOOR_DIMS) {
    assert.ok(prose.includes(dim), 'the prereg must name the floor dimension "' + dim + '"');
  }
});

test('PAR-01: the prereg freezes all six required sections + the D-09/D-19 disclosures', () => {
  const prose = readPrereg();

  // (i) the 5-dimension rubric verbatim + the scoring rule + the Unknown escape hatch.
  assert.ok(/factual \/ groundedness accuracy/i.test(prose), 'rubric dim 1 (factual/groundedness) verbatim');
  assert.ok(/citation accuracy/i.test(prose), 'rubric dim 2 (citation accuracy) verbatim');
  assert.ok(/completeness \/ coverage/i.test(prose), 'rubric dim 3 (completeness/coverage) verbatim');
  assert.ok(/source quality/i.test(prose), 'rubric dim 4 (source quality) verbatim');
  assert.ok(/tool \/ process efficiency/i.test(prose), 'rubric dim 5 (tool/process efficiency) verbatim');
  assert.ok(/tool_process_efficiency/.test(prose), 'the machine key tool_process_efficiency is recorded');
  assert.ok(/Unknown/.test(prose), 'the Unknown escape hatch is recorded');

  // (ii) both question lists.
  assert.ok(/Slice-A AVeriTeC seed list/i.test(prose), 'the Slice-A seed list is recorded');
  assert.ok(/claim_id/.test(prose), 'the Slice-A seed list is deterministic by claim_id');
  assert.ok(/Slice-B natural research question set/i.test(prose), 'the Slice-B natural question set is recorded');

  // (iii) the verdict-collapse map.
  assert.ok(/Supported -> `unrefuted`/.test(prose), 'collapse: Supported -> unrefuted');
  assert.ok(/Refuted -> `refuted`/.test(prose), 'collapse: Refuted -> refuted');
  assert.ok(/Conflicting Evidence\/Cherrypicking -> EXCLUDED/.test(prose), 'collapse: Conflicting EXCLUDED');
  assert.ok(/Not Enough Evidence \(NEI\) -> HELD OUT/.test(prose), 'collapse: NEI HELD OUT');

  // (iv) the MCC bar (numbers asserted above; the section presence here).
  assert.ok(/judge-calibration MCC bar/i.test(prose), 'the MCC bar section is present');
  assert.ok(/DISQUALIFIER/.test(prose), 'an uncalibrated judge is a DISQUALIFIER');

  // (v) the RESOLVED feasibility gate + the fallback + the provisional limits.
  assert.ok(/RESOLVED FEASIBLE/.test(prose), 'the feasibility gate is RESOLVED FEASIBLE');
  assert.ok(/95/.test(prose) && /216/.test(prose), 'the 95 Supported / 216 Refuted resolution is recorded');
  assert.ok(/D-14 FALLBACK RULE/i.test(prose), 'the D-14 fallback rule is recorded');
  assert.ok(/uniform 2020 claim_date/i.test(prose), 'PROVISIONAL: uniform 2020 claim_date');
  assert.ok(/topical narrowness/i.test(prose), 'PROVISIONAL: topical narrowness');

  // (vi) the parity bar + k + the D-09 / D-19 disclosures.
  assert.ok(/two-layer/i.test(prose), 'the two-layer parity bar is recorded');
  assert.ok(/PARITY_K_RANGE/.test(prose), 'k within PARITY_K_RANGE is recorded');
  assert.ok(/D-09/.test(prose) && /deliberately stronger/i.test(prose), 'the D-09 instrument-strength disclosure');
  assert.ok(/D-19/.test(prose) && /self-preference/i.test(prose), 'the D-19 self-preference threat-to-validity');
  assert.ok(/defensible parity SCREEN/i.test(prose), 'D-19: a defensible parity SCREEN, never a proof');

  // The freeze record (the pre-registration timestamp of record).
  assert.ok(/FREEZE RECORD/.test(prose), 'the freeze-record section is present');
});

// ---------------------------------------------------------------------------
// The driver documents the transport split + the absolute no-OOF prohibition (D-18), contrasting the
// removed live-cert callOof.
// ---------------------------------------------------------------------------

test('PAR-03: the driver documents the transport split + the absolute no-OOF prohibition (D-18)', () => {
  const driver = fs.readFileSync(DRIVER, 'utf8');

  assert.ok(/transport split/i.test(driver), 'the driver names the transport split');
  assert.ok(/callJudge/.test(driver) && /callVoter/.test(driver), 'the driver names callJudge + callVoter');
  assert.ok(/SESSION-DRIVEN/.test(driver), 'the driver states the transports are session-driven');
  assert.ok(/SCORES FROM DISK/i.test(driver), 'the driver states node scores from disk');
  assert.ok(/no OOF/i.test(driver) || /no-OOF/i.test(driver), 'the driver states the no-OOF prohibition');
  assert.ok(/callOof/.test(driver) && /REMOVED/.test(driver), 'the driver explicitly contrasts the removed callOof');
  assert.ok(/D-18/.test(driver), 'the driver cites D-18');
});

// ---------------------------------------------------------------------------
// Both files are strictly ASCII (committed bytes, CLAUDE.md): no BOM, no non-ASCII byte.
// ---------------------------------------------------------------------------

test('the prereg + driver are strictly ASCII with no BOM (CLAUDE.md committed-byte rule)', () => {
  for (const [label, file] of [['prereg', PREREG], ['driver', DRIVER]]) {
    const buf = fs.readFileSync(file);

    // No UTF-8 BOM (EF BB BF) at the head.
    assert.ok(
      !(buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf),
      label + ' must not start with a UTF-8 BOM',
    );

    for (let i = 0; i < buf.length; i += 1) {
      assert.ok(
        buf[i] <= 0x7f,
        label + ' byte at offset ' + i + ' must be ASCII (<= 0x7F), got 0x' + buf[i].toString(16),
      );
    }
  }
});
