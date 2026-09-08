// lz-eval-p23-prereg.test.mjs
//
// ENV-01 / D-16 anti-drift co-test + required-section checklist (Plan 23-04, Task 1; NO-SPEND).
//
// THE PROSE MUST CARRY THE CODE'S NUMBERS. `eval/lz-eval-p23-prereg.md` is the frozen authority for
// every bar in Phase 23, and the same bars also live as Object.freeze'd module constants. Two
// representations of one bar can drift apart, and a prose-vs-code divergence is a silent
// result-shopping surface (T-23-02). This file follows the Phase-22 analog
// (eval/lz-eval-parity-prereg.test.mjs) exactly: every expected needle is built FROM the frozen
// constant, so the test FOLLOWS the code -- if a constant changes, the test demands the prose change in
// lockstep.
//
// DISCRIMINATION (proven, not tautological): for each frozen number a deliberately WRONG needle (the
// constant + 1) is asserted ABSENT, and a dedicated case tampers with the prose IN MEMORY and asserts
// the anti-drift predicate flips RED. Together they prove the substring match pins the EXACT value
// rather than passing against a looser pattern.
//
// THE VOTER PROMPT IS PINNED THREE WAYS. `buildDispatchString` renders the exact string dispatched for
// all 40 ENV-03 verdicts in Plan 23-05, and it had only executing-session review before this freeze.
// The prose quotes the rendered template, the test pins its sha256, and the test asserts the prose
// carries the rendered template verbatim -- so prose, code and hash must all three agree or this file
// fails. Quoting alone is weaker (prose drifts from code); pinning alone is weaker (a hash is
// unreadable at review time).
//
// THE SECTION CHECKLIST IS A PRESENCE CHECK AND NOTHING MORE. It asserts each required header exists
// and that its body is non-empty. **It CANNOT assert the content is correct, and it must NEVER stand in
// for the human content review under ENV-08.** An empty section is reported as a gap; a section full of
// wrong prose passes this file and is caught only by a reader.
//
// Dev-only eval-tree test: imports the frozen modules + node stdlib only. No package, no network.
//
// HOST QUIRK (binding): on this host (Windows arm64 / Git Bash) the gate MUST target the explicit FILE
// form -- `node --test eval/lz-eval-p23-prereg.test.mjs`. The directory form spuriously exits 1 here
// even when every real test passes.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// The frozen constant sources. The prose must match these byte-for-byte.
import { SLICE_A_GATE, filterSliceA } from './lz-eval-sliceA-gold.mjs';
import { DRAW, drawBalanced } from './lz-eval-p23-sliceA-draw.mjs';
import { SPIKE_CEILING } from './lz-eval-p23-verify-complete.mjs';
import { RESOLVE_LIMITS, SCHEME_ALLOWLIST, RESOLVE_OUTCOMES } from './lz-eval-p23-resolvability.mjs';
import { UNCITED, KEEP_PARAMS } from './lz-eval-p23-citation-audit.mjs';
import { buildDispatchString } from './lz-eval-p23-sliceA-read.mjs';
import { readJson } from './lz-eval-readjson.mjs';

// Resolve every path test-file-relative, NEVER from process.cwd() -- the working directory drifts
// under GSD worktrees and headless `claude -p`.
const HERE = path.dirname(fileURLToPath(import.meta.url));
const PREREG = path.join(HERE, 'lz-eval-p23-prereg.md');
const DRIVER = path.join(HERE, 'lz-eval-p23-capture-driver.md');
const AVERITEC = path.join(HERE, '.cache', 'chenxwh__AVeriTeC', 'data', 'dev.json');

function readPrereg() {
  return fs.readFileSync(PREREG, 'utf8');
}

function readDriver() {
  return fs.readFileSync(DRIVER, 'utf8');
}

function sha256Hex(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

// ---------------------------------------------------------------------------
// The frozen constants are themselves Object.frozen. The prereg only RECORDS what the code freezes;
// assert the code actually froze it, or the anti-drift table pins a value that can still be mutated.
// ---------------------------------------------------------------------------

test('ENV-01: every constant the pre-registration pins is Object.frozen', () => {
  assert.ok(Object.isFrozen(SLICE_A_GATE), 'SLICE_A_GATE must be Object.frozen');
  assert.ok(Object.isFrozen(DRAW), 'DRAW must be Object.frozen');
  assert.ok(Object.isFrozen(SPIKE_CEILING), 'SPIKE_CEILING must be Object.frozen');
  assert.ok(Object.isFrozen(RESOLVE_LIMITS), 'RESOLVE_LIMITS must be Object.frozen');
  assert.ok(Object.isFrozen(SCHEME_ALLOWLIST), 'SCHEME_ALLOWLIST must be Object.frozen');
  assert.ok(Object.isFrozen(RESOLVE_OUTCOMES), 'RESOLVE_OUTCOMES must be Object.frozen');
  assert.ok(Object.isFrozen(UNCITED), 'UNCITED must be Object.frozen');
  assert.ok(Object.isFrozen(KEEP_PARAMS), 'KEEP_PARAMS must be Object.frozen');
});

// ---------------------------------------------------------------------------
// The byte-for-byte anti-drift table. Each needle is the EXACT prose-table row cell built FROM the
// frozen constant: the prereg renders every frozen number as `| `Constant` | <value> | <module> |`.
// ---------------------------------------------------------------------------

function row(name, value) {
  return '| `' + name + '` | ' + value + ' |';
}

function antiDriftChecks() {
  return [
    [row('SLICE_A_GATE.N_SUP_MIN', SLICE_A_GATE.N_SUP_MIN), 'SLICE_A_GATE.N_SUP_MIN'],
    [row('SLICE_A_GATE.N_REF_MIN', SLICE_A_GATE.N_REF_MIN), 'SLICE_A_GATE.N_REF_MIN'],
    [row('DRAW.SEED', DRAW.SEED), 'DRAW.SEED'],
    [row('DRAW.N_PER_DIRECTION', DRAW.N_PER_DIRECTION), 'DRAW.N_PER_DIRECTION'],
    [row('SPIKE_CEILING.MAX_RESUME_CYCLES', SPIKE_CEILING.MAX_RESUME_CYCLES), 'SPIKE_CEILING.MAX_RESUME_CYCLES'],
    [row('SPIKE_CEILING.MAX_RESET_WINDOWS', SPIKE_CEILING.MAX_RESET_WINDOWS), 'SPIKE_CEILING.MAX_RESET_WINDOWS'],
    [row('RESOLVE_LIMITS.TIMEOUT_MS', RESOLVE_LIMITS.TIMEOUT_MS), 'RESOLVE_LIMITS.TIMEOUT_MS'],
    [row('RESOLVE_LIMITS.MAX_BYTES', RESOLVE_LIMITS.MAX_BYTES), 'RESOLVE_LIMITS.MAX_BYTES'],
    [row('RESOLVE_LIMITS.MAX_REDIRECT_HOPS', RESOLVE_LIMITS.MAX_REDIRECT_HOPS), 'RESOLVE_LIMITS.MAX_REDIRECT_HOPS'],
    [row('UNCITED.MAX_RANGE_SPAN', UNCITED.MAX_RANGE_SPAN), 'UNCITED.MAX_RANGE_SPAN'],
  ];
}

function wrongNeedleChecks() {
  return antiDriftChecks().map(([needle, name]) => {
    const value = Number(needle.slice(needle.lastIndexOf('| ') + 2, needle.length - 2));

    return [row(name, value + 1), name];
  });
}

test('ENV-01 anti-drift: the prereg prose NUMBERS match the frozen module constants byte-for-byte', () => {
  const prose = readPrereg();

  for (const [needle, name] of antiDriftChecks()) {
    assert.ok(
      prose.includes(needle),
      'the pre-registration must carry the frozen ' + name + ' value verbatim: "' + needle + '"',
    );
  }
});

test('ENV-01 anti-drift is DISCRIMINATING: a wrong (constant + 1) value is NOT present in the prose', () => {
  const prose = readPrereg();

  for (const [wrongNeedle, name] of wrongNeedleChecks()) {
    assert.ok(
      !prose.includes(wrongNeedle),
      'a drifted ' + name + ' value must NOT be present (discriminating): "' + wrongNeedle + '"',
    );
  }
});

test('ENV-01 anti-drift FLIPS RED on a deliberate prose-vs-constant mismatch (invert-the-fix proof)', () => {
  const realProse = readPrereg();
  const correctRow = row('DRAW.SEED', DRAW.SEED);
  const tamperedRow = row('DRAW.SEED', '20260901');

  assert.ok(realProse.includes(correctRow), 'precondition: the real prose carries the correct DRAW.SEED row');

  const tamperedProse = realProse.replace(correctRow, tamperedRow);

  assert.ok(
    !tamperedProse.includes(correctRow),
    'the tampered prose must no longer carry the correct DRAW.SEED row (proves a one-digit edit is caught)',
  );
});

// ---------------------------------------------------------------------------
// The frozen ENV-03 voter prompt: prose == code == hash, or this fails.
//
// The template round-trips through buildDispatchString when each placeholder is passed as its own
// literal value, because the substitution is ONE non-global scan through a replacer function and
// inserted text is never re-scanned (the T-22-15 fix). That gives a rendering the maintainer can read
// at review time AND a digest a later edit cannot slip past.
// ---------------------------------------------------------------------------

// AMENDMENT RECORD 1 (2026-09-08, pre-spend, zero verdicts in existence) re-pinned BOTH digests when
// the cutoff line gained its day-month-year label. The superseded pins were
// 8a93c283591b1e81046a8d1d61da9d0e035ea922c5105afacf215b911309fe5a (template) and
// 4a2c47f2a70009762addb16f2485d362a13eda8ed0490406ecd4f654f1aa4efe (instantiation); both are recorded
// in the amendment so the change is auditable rather than merely asserted.
const VOTER_TEMPLATE_SHA256 = 'a1cb493a980307271666597ac306d9cd383efdc9493acefefcf1aa159e7f1318';
const VOTER_INSTANCE_SHA256 = 'e95cc436b092adbb596b4ae16a2a9016088ad28bb1603341609f22d2a7960430';
const PIN_CLAIM = 'A synthetic pin claim that is not a corpus item.';
const PIN_CLAIM_DATE = '2020-01-01';

function renderedTemplate() {
  return buildDispatchString({ claim: '{{CLAIM}}', claimDate: '{{CLAIM_DATE}}' });
}

test('ENV-03: the rendered voter prompt template matches its pinned sha256 (what was reviewed is what runs)', () => {
  assert.equal(
    sha256Hex(renderedTemplate()),
    VOTER_TEMPLATE_SHA256,
    'buildDispatchString rendered a template that does not match the frozen sha256 -- the instrument changed',
  );
});

test('ENV-03: a fixed synthetic instantiation matches its pinned sha256', () => {
  const rendered = buildDispatchString({ claim: PIN_CLAIM, claimDate: PIN_CLAIM_DATE });

  assert.equal(sha256Hex(rendered), VOTER_INSTANCE_SHA256, 'the synthetic dispatch string drifted');
});

test('ENV-03: the pre-registration quotes the rendered voter prompt template VERBATIM', () => {
  const prose = readPrereg();

  assert.ok(
    prose.includes(renderedTemplate()),
    'the pre-registration must quote the template buildDispatchString renders, byte-for-byte',
  );
  assert.ok(prose.includes(VOTER_TEMPLATE_SHA256), 'the pre-registration must record the template sha256');
  assert.ok(prose.includes(VOTER_INSTANCE_SHA256), 'the pre-registration must record the instantiation sha256');
});

test('ENV-03: the pre-registration records the withheld fields as the blinding', () => {
  const prose = readPrereg();

  for (const withheld of [
    'the gold label',
    'the gold justification',
    'the fact-checking article',
    'the corpus questions',
    'the speaker',
    'the `drawIndex`',
  ]) {
    assert.ok(prose.includes(withheld), 'the withheld-field list must name ' + withheld);
  }

  assert.ok(/refuted \| unrefuted/.test(prose), 'the two-value verdict enum must be recorded');
  assert.ok(/ENV-03 blinding/.test(prose), 'the withholding must be named as the ENV-03 blinding');
});

// ---------------------------------------------------------------------------
// The realized 40-item draw is quoted IN FULL. Re-derive it from the frozen seed and assert every
// drawn line appears verbatim, including its original Unicode -- a transliterated copy would not be
// the item set the voter is dispatched.
//
// Skip-if-absent: eval/.cache/ is gitignored, so a fresh clone degrades to a skip rather than to a
// fabricated fixture.
// ---------------------------------------------------------------------------

function realizedDraw() {
  const data = readJson(AVERITEC);
  const items = Array.isArray(data) ? data : data.claims;
  const pool = filterSliceA({ items });

  return drawBalanced({ pool, seed: DRAW.SEED, nPerDirection: DRAW.N_PER_DIRECTION });
}

test('D-08/D-09: the pre-registration quotes the realized 40-item draw in full, verbatim', (t) => {
  if (!fs.existsSync(AVERITEC)) {
    t.skip('the gitignored AVeriTeC dev cache is absent');

    return;
  }

  const prose = readPrereg();
  const drawn = realizedDraw();
  let quoted = 0;

  for (const direction of ['unrefuted', 'refuted']) {
    assert.equal(drawn[direction].length, DRAW.N_PER_DIRECTION, direction + ' must hold N_PER_DIRECTION items');

    for (const entry of drawn[direction]) {
      const line = direction + ' drawIndex=' + entry.drawIndex + ' claim=' + entry.voterRecord.claim;

      assert.ok(prose.includes(line), 'the pre-registration must quote this drawn item verbatim: ' + line);
      quoted += 1;
    }
  }

  assert.equal(quoted, 2 * DRAW.N_PER_DIRECTION, 'all 40 drawn items must be quoted');
});

test('D-10: the pre-registration records the 83/181 re-verification AND the 95/216 discrepancy', () => {
  const prose = readPrereg();

  assert.ok(
    prose.includes('clean unrefuted=83 clean refuted=181 gate-cleared=true'),
    'the re-verified yield must be quoted as the CLI emitted it',
  );
  assert.ok(/95/.test(prose) && /216/.test(prose), 'the superseded 95/216 record must appear beside it');
  assert.ok(/NOT RECONCILED|not reconciled/i.test(prose), 'the discrepancy must be recorded, not reconciled');
});

test('D-21: the three-quantity built-in q1 correction is recorded, with 18 as the canonical-source count', () => {
  const prose = readPrereg();

  assert.ok(/\*\*69\*\*/.test(prose), 'the 69 total surface markers must be recorded');
  assert.ok(/\*\*13\*\*/.test(prose), 'the 13 unique marker VALUES must be recorded');
  assert.ok(/\*\*18\*\*/.test(prose), 'the 18 unique CANONICAL SOURCES must be recorded');
  assert.ok(/MISLABEL/.test(prose), 'D-21 phrase "13 unique sources" must be named a MISLABEL');
  assert.ok(
    /26 (?:markers|numbered ref markers)/.test(prose) || /"26 numbered ref markers, 10-item source\s+list"/.test(prose),
    'the diagnosis note\'s superseded 26 markers / 10-item list must appear beside the correction',
  );
  assert.ok(
    /never written as 13/.test(prose),
    'the pre-registration must state the canonical-source count is never written as 13',
  );
});

test('ENV-01: the up-front no-significance ceiling carries its arithmetic', () => {
  const prose = readPrereg();

  assert.ok(prose.includes('2 x 0.5^5 = 0.0625'), 'the two-sided sign-test minimum must be stated');
  assert.ok(prose.includes('0.05^(1/5) = 0.549'), 'the Clopper-Pearson lower bound must be stated');
  assert.ok(/has NOT fallen short/.test(prose), 'the phase-ends-without-significance statement must be present');
});

test('ENV-01: the pre-registration scopes its ordering claim to RATIOS and names the 18-source exception', () => {
  const prose = readPrereg();

  assert.ok(/scoped to RATIOS/.test(prose), 'the ordering claim must be scoped to RATIOS');
  assert.ok(/2cb5133/.test(prose), 'the exception must name the Task-1 co-test commit that pins the integer');
  assert.ok(
    !/no measured figure precedes this freeze/i.test(prose),
    'the unsupported stronger ordering claim must NOT appear',
  );
});

test('ENV-04/generation: the third disclosure axis and the RECORDS-not-targets rule are present', () => {
  const prose = readPrereg();

  assert.ok(/THREE axes at once/.test(prose), 'the three simultaneous axes must be stated together');
  assert.ok(/model generation/i.test(prose), 'model generation must be named as an axis');
  assert.ok(
    /NO q1-versus-q2 difference can\s+be attributed to any single one of them/.test(prose),
    'the no-single-axis-attribution consequence must be stated',
  );
  assert.ok(prose.includes('claude-opus-4-8'), 'the built-in q1 provenance string must be recorded as a RECORD');
  assert.ok(prose.includes('claude-sonnet-4-6[1m]'), 'the lz q1 provenance string must be recorded as a RECORD');
  assert.ok(/would be falsification/.test(prose), 'rewriting a capture record must be named falsification');
});

// ---------------------------------------------------------------------------
// The required-section CHECKLIST. PRESENCE ONLY -- see the file header. A section that exists and is
// non-empty passes here even if its content is wrong; only the ENV-08 human read catches that.
// ---------------------------------------------------------------------------

const REQUIRED_PREREG_SECTIONS = Object.freeze([
  '## Frozen NUMBERS',
  '## Section (i) -- The capture budget',
  '## Section (ii) -- The ceiling is stated up front',
  '## Section (iii) -- The exploratory declaration',
  '## Section (iv) -- The no-judge constraints',
  '## Section (v) -- The Slice-A draw',
  '## Section (vi) -- The frozen ENV-04 citation rules',
  '## Section (vii) -- The contamination disclosure',
  '## Section (viii) -- The ENV-05 spike',
  '## Section (ix) -- The ONE pre-committed conditional',
  '## Section (x) -- The capture-artifact RETENTION PROTOCOL',
  '## Section (xi) -- MANIFEST admissibility',
  '## Section (xii) -- The seed disposition',
  '## Section (xiii) -- The frozen ENV-03 voter prompt',
  '## Section (xiv) -- The sequencing record',
  '## Section (xv) -- The termination clause',
  '## Section (xvi) -- The Assumptions Log',
  '## AMENDMENT RECORD',
  '## Review record',
  '## Cross-reference',
]);

const REQUIRED_DRIVER_SECTIONS = Object.freeze([
  '## The transport split',
  '## ABSOLUTE PROHIBITIONS',
  '## Stage 0 -- the pre-registration freeze',
  '## Stage 1 -- capture the built-in',
  '## Stage 2 -- RETAIN THE EVIDENCE',
  '## Stage 3 -- the D-19 first observation',
  '## Stage 4 -- the completeness check',
  '## Stage 5 -- capture the lz-deep-research',
  '## Stage 6 -- MANIFEST both q2 captures',
  '## Stage 7 -- the ENV-03 Slice-A voter dispatch',
  '## Stage 8 -- the CONDITIONAL ENV-06 grading',
  '## Anti-result-shopping invariants',
  '## Review record',
  '## Cross-reference',
]);

function sectionGaps(text, required) {
  const lines = text.split('\n');
  const gaps = [];

  for (const header of required) {
    const at = lines.findIndex((line) => line.startsWith(header));

    if (at < 0) {
      gaps.push('MISSING HEADER: ' + header);
      continue;
    }

    let bodyChars = 0;

    for (let i = at + 1; i < lines.length && !lines[i].startsWith('## '); i += 1) {
      bodyChars += lines[i].trim().length;
    }

    if (bodyChars === 0) {
      gaps.push('EMPTY BODY: ' + header);
    }
  }

  return gaps;
}

test('ENV-01 CHECKLIST (presence only): every required pre-registration section exists with a non-empty body', () => {
  assert.deepEqual(sectionGaps(readPrereg(), REQUIRED_PREREG_SECTIONS), []);
});

test('ENV-01 CHECKLIST is DISCRIMINATING: a header with an empty body is reported as a gap', () => {
  const synthetic = ['## Alpha', '', 'body text', '', '## Beta', '', '## Gamma', '', 'more'].join('\n');

  assert.deepEqual(sectionGaps(synthetic, ['## Alpha', '## Beta', '## Gamma', '## Delta']), [
    'EMPTY BODY: ## Beta',
    'MISSING HEADER: ## Delta',
  ]);
});

test('ENV-08 CHECKLIST (presence only): every required capture-driver section exists with a non-empty body', () => {
  assert.deepEqual(sectionGaps(readDriver(), REQUIRED_DRIVER_SECTIONS), []);
});

// ---------------------------------------------------------------------------
// The capture driver: the retention step, the D-19 observation, the frozen models, the q2 question.
// ---------------------------------------------------------------------------

const Q2_QUESTION =
  'Which post-training quantization methods preserve accuracy at 4-bit for transformer inference, and';

test('D-17: the driver carries the retention step with exact paths, as the FIRST post-capture action', () => {
  const driver = readDriver();

  assert.ok(/FIRST post-capture action/.test(driver), 'the transcript copy must be named the first post-capture action');
  assert.ok(driver.includes('/subagents/agent-*.jsonl'), 'the built-in transcript SOURCE path must be exact');
  assert.ok(
    driver.includes('eval/.cache/p23-baseline/builtin/q2/subagents/'),
    'the built-in transcript DESTINATION path must be exact',
  );
  assert.ok(driver.includes('.lz-research/<run-id>/'), 'the lz run-directory SOURCE path must be exact');
  assert.ok(driver.includes('eval/.cache/p23-baseline/lz/q2/'), 'the lz DESTINATION path must be exact');
  assert.ok(
    /does not end at saving the report and the stream/.test(driver),
    'the driver must state that the step list does not end at saving the report and the stream',
  );
});

test('D-19: the driver records the first observation BEFORE any rate is computed, with both branches', () => {
  const driver = readDriver();

  assert.ok(/Branch A/.test(driver) && /Branch B/.test(driver), 'both pre-frozen branches must be named');
  assert.ok(
    /BEFORE computing any rate|before any rate is computed/i.test(driver),
    'the observation must be ordered before any rate is computed',
  );
  assert.ok(/No third branch may be added/.test(driver), 'no third branch may be added at observation time');
});

test('ENV-05: the driver calls the frozen completeness predicate rather than reading the report by eye', () => {
  const driver = readDriver();

  assert.ok(driver.includes('isVerificationComplete'), 'the driver must name the frozen predicate');
  assert.ok(driver.includes('lz-eval-p23-verify-complete.mjs'), 'the driver must invoke the predicate module');
  assert.ok(/Do not read the report by eye/.test(driver), 'the driver must forbid an eyeball verdict');
  assert.ok(
    /resume-cycle and reset-window counts/.test(driver),
    'the driver must require the resume-cycle and reset-window counts the ceiling check consumes',
  );
});

test('generation 5: every driver transport is pinned to generation 5 and no generation-4 string is a target', () => {
  const driver = readDriver();

  assert.ok(/Model \(Claude generation 5\)/.test(driver), 'the transport table must carry a generation-5 model column');
  assert.ok(driver.includes('Sonnet 5'), 'the lz executor must be pinned to Sonnet 5');
  assert.ok(driver.includes('Opus 5'), 'the built-in capture and the conditional grading must be pinned to Opus 5');
  assert.ok(driver.includes('claude-opus-5') && driver.includes('claude-sonnet-5'), 'the resolved strings are named');
  assert.ok(/RESOLVED model string/.test(driver), 'the record-the-resolved-model rule must be present');
  assert.ok(/never the alias/.test(driver), 'the never-the-alias rule must be present');
  assert.ok(
    !/claude-(opus|sonnet)-4/.test(driver),
    'the driver must contain NO generation-4 model string -- those are records of past runs, never targets',
  );
});

test('the frozen q2 question is stated identically in BOTH documents, with its selection reasoning', () => {
  const prose = readPrereg();
  const driver = readDriver();

  assert.ok(prose.includes(Q2_QUESTION), 'the pre-registration must state the frozen q2 question');
  assert.ok(driver.includes(Q2_QUESTION), 'the driver must state the same frozen q2 question');
  assert.ok(/Why this question was chosen/.test(driver), 'the driver must record the selection reasoning');
  assert.ok(/arXiv-dense/.test(driver), 'the identifier-density reason must be recorded');
});

test('ENV-08: both documents carry a Review record section', () => {
  assert.ok(readPrereg().includes('## Review record'), 'the pre-registration must carry a Review record');
  assert.ok(readDriver().includes('## Review record'), 'the driver must carry a Review record');
});

// ---------------------------------------------------------------------------
// Committed bytes (CLAUDE.md): no BOM and no CR in either file. The driver is strictly ASCII. The
// pre-registration is NOT, deliberately: it quotes the realized draw's claim strings verbatim, and those
// are corpus data carrying their original Unicode. Its non-ASCII set must therefore be a SUBSET of the
// characters the corpus itself emits -- which pins the exception to quoted data rather than licensing
// non-ASCII anywhere in the prose.
// ---------------------------------------------------------------------------

function assertNoBomNoCr(label, file) {
  const buf = fs.readFileSync(file);

  assert.ok(
    !(buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf),
    label + ' must not start with a UTF-8 BOM',
  );
  assert.ok(!buf.includes(0x0d), label + ' must be LF-only (no CR bytes)');
}

test('the driver is strictly ASCII with no BOM and LF line endings', () => {
  assertNoBomNoCr('driver', DRIVER);

  const buf = fs.readFileSync(DRIVER);

  for (let i = 0; i < buf.length; i += 1) {
    assert.ok(buf[i] <= 0x7f, 'driver byte at offset ' + i + ' must be ASCII, got 0x' + buf[i].toString(16));
  }
});

test('the pre-registration is LF-only with no BOM, and its non-ASCII characters all come from the corpus', (t) => {
  assertNoBomNoCr('prereg', PREREG);

  if (!fs.existsSync(AVERITEC)) {
    t.skip('the gitignored AVeriTeC dev cache is absent -- cannot derive the corpus character set');

    return;
  }

  const drawn = realizedDraw();
  const corpus = new Set();

  for (const direction of ['unrefuted', 'refuted']) {
    for (const entry of drawn[direction]) {
      for (const ch of entry.voterRecord.claim) {
        if (ch.codePointAt(0) > 0x7f) {
          corpus.add(ch.codePointAt(0));
        }
      }
    }
  }

  const offenders = new Set();

  for (const ch of readPrereg()) {
    const cp = ch.codePointAt(0);

    if (cp > 0x7f && !corpus.has(cp)) {
      offenders.add('U+' + cp.toString(16).toUpperCase().padStart(4, '0'));
    }
  }

  assert.deepEqual(
    [...offenders],
    [],
    'every non-ASCII character in the pre-registration must come from a quoted corpus claim',
  );
});
