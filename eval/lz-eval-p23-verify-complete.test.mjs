// lz-eval-p23-verify-complete.test.mjs
//
// Co-test for the FROZEN mechanical definition of a verification-complete built-in report and the
// FROZEN ENV-05 spike ceiling (Plan 23-02, Task 3; NO-SPEND). Dev-only eval-tree test: it imports the
// module under test plus node stdlib only. NO model call, NO network, NO capture -- the two real-report
// cases read reports already on disk, and every other case is a synthetic string.
//
// WHY BOTH CONSTANTS ARE FROZEN NOW, BEFORE THE SPIKE (D-05 / T-23-02b): D-05 clears the ENV-05 spike
// iff a built-in capture reaches a verification-complete report within a ceiling frozen BEFORE the
// spike runs. A ceiling chosen after seeing the spike, or a "verification-complete" judgement made
// after reading q2, is exactly the post-hoc choice pre-registration exists to remove. Both land here,
// in wave 2, so Plan 23-04's freeze commit can quote them and precede the spike in git ancestry.
//
// THIS IS A MECHANICAL PREDICATE, NOT A STATISTICAL GATE. It counts two declared numbers and a table's
// data rows. It computes no rate, no interval and no significance, so the point-estimate-gate
// anti-pattern does not apply to it.
//
// Asserted behaviors (one named test each, never a tautology):
//   - LEDGER_HEADING_RE and SPIKE_CEILING are exported and Object.frozen; the ceiling is 3 and 2.
//   - isVerificationComplete over the on-disk COMPLETE report returns complete true with declaredN,
//     confirmedN and tableRows all 25.
//   - a report with NO ledger heading returns complete false with a NAMED reason and does NOT throw --
//     a malformed report is a finding, not a crash a caller could mistake for a pass.
//   - a heading declaring UNEQUAL counts returns complete false.
//   - a heading whose declared count does not equal the table's data-row count returns complete false.
//     Equality of the header pair ALONE is not sufficient.
//   - a heading whose count is not a strict run of digits (thousands-separated, decimal) returns
//     complete false rather than a coerced integer.
//   - a report carrying TWO ledger headings uses the FIRST and reports duplicateLedgerHeadings 1, so
//     the ambiguity is surfaced rather than resolved silently.
//   - a ledger heading QUOTED INSIDE a fenced block does not govern (23-REVIEW.md CR-04): fenced code
//     is stripped first, reusing the sibling citation-audit module's proven stripFencedCode.
//   - that fence strip does not disturb CRLF handling.
//   - spikeCeilingCheck clears at 3 resume cycles / 2 reset windows and at any lower pair.
//   - spikeCeilingCheck throws a ContractError on a non-integer or negative argument.
//   - spikeCleared requires BOTH halves and its returned object names which half failed, carrying the
//     realized counts (D-07: the realized ceiling is publishable either way).
//
// DISCRIMINATION (the invert-the-fix proofs, required by the plan):
//   - THE ON-DISK NEGATIVE EXAMPLE. eval/.cache/p22-baseline/builtin/qB1-run1.report.partial-verify.md
//     is a real artifact of an incomplete run and must return complete false, while its sibling
//     qB1-run1.report.md returns complete true. A predicate that merely looked for the words
//     "verification ledger" would pass BOTH, so this pair is what makes the definition discriminating
//     rather than decorative.
//   - THE FOUR CEILING BOUNDARIES. cleared at {3, 2}, NOT cleared at {4, 2}, NOT cleared at {3, 3}.
//     A check that ignored either argument would pass some of these and fail others.
//
// HOST QUIRK (load-bearing): on this host the phase gate MUST target the explicit FILE form:
//   node --test eval/lz-eval-p23-verify-complete.test.mjs
// The directory form (`node --test <dir>`) spuriously exits 1 on this host even when every real test
// passes.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ContractError } from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

import {
  LEDGER_HEADING_RE,
  SPIKE_CEILING,
  isVerificationComplete,
  spikeCeilingCheck,
  spikeCleared,
} from './lz-eval-p23-verify-complete.mjs';

// Resolve the cache test-file-relative (NEVER process.cwd() -- cwd drifts under GSD worktrees and
// headless `claude -p`). HERE is the repo-level eval/ dir.
const HERE = path.dirname(fileURLToPath(import.meta.url));
const BUILTIN = path.join(HERE, '.cache', 'p22-baseline', 'builtin');
const COMPLETE_REPORT = path.join(BUILTIN, 'qB1-run1.report.md');
const PARTIAL_REPORT = path.join(BUILTIN, 'qB1-run1.report.partial-verify.md');

// eval/.cache/ is gitignored and absent on a fresh clone -- the two real-report cases skip rather than
// fabricating a fixture that would prove nothing (T-23-06).
function readReport(t, file) {
  if (!fs.existsSync(file)) {
    t.skip('gitignored capture absent: ' + path.basename(file));

    return null;
  }

  return fs.readFileSync(file, 'utf8');
}

// A synthetic report in the built-in's observed shape: an intro, a ledger heading with an N/M count,
// and a ledger table with `rows` data rows.
function syntheticReport({ heading, rows, extraHeading = null }) {
  const lines = [
    '# A synthetic report',
    '',
    '## Direct answer',
    '',
    'Some prose that is not a table.',
    '',
    '---',
    '',
    heading,
    '',
    '| # | Claim (abbreviated) | Source | Vote |',
    '|---|---|---|---|',
  ];

  for (let i = 1; i <= rows; i += 1) {
    lines.push('| C' + i + ' | A synthetic claim number ' + i + ' | [1] | 3-0 |');
  }

  lines.push('');
  lines.push('**Tally: synthetic.**');

  if (extraHeading !== null) {
    lines.push('');
    lines.push(extraHeading);
    lines.push('');
    lines.push('| # | Claim (abbreviated) | Source | Vote |');
    lines.push('|---|---|---|---|');
    lines.push('| C1 | A second-ledger claim | [1] | 3-0 |');
  }

  lines.push('');
  lines.push('## Sources');

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// The frozen constants (D-05 / D-06 / T-23-02b).
// ---------------------------------------------------------------------------

test('D-05: SPIKE_CEILING is Object.frozen and holds MAX_RESUME_CYCLES 3 / MAX_RESET_WINDOWS 2', () => {
  assert.ok(Object.isFrozen(SPIKE_CEILING), 'SPIKE_CEILING must be Object.frozen (frozen BEFORE the spike runs)');
  assert.equal(SPIKE_CEILING.MAX_RESUME_CYCLES, 3);
  assert.equal(SPIKE_CEILING.MAX_RESET_WINDOWS, 2);
  assert.deepEqual(Object.keys(SPIKE_CEILING).sort(), ['MAX_RESET_WINDOWS', 'MAX_RESUME_CYCLES']);
});

test('D-05: LEDGER_HEADING_RE is an exported, frozen, NON-global RegExp capturing two counts', () => {
  assert.ok(LEDGER_HEADING_RE instanceof RegExp, 'LEDGER_HEADING_RE must be an exported RegExp');
  assert.ok(Object.isFrozen(LEDGER_HEADING_RE), 'LEDGER_HEADING_RE must be Object.frozen');
  // Non-global on purpose: a FROZEN global regex throws when exec/test tries to write lastIndex.
  assert.equal(LEDGER_HEADING_RE.global, false, 'a frozen regex must not be global');

  const m = LEDGER_HEADING_RE.exec('## Complete verification ledger (25/25 confirmed)');
  assert.ok(m, 'the observed built-in heading must match');
  assert.equal(m[1], '25');
  assert.equal(m[2], '25');
});

// ---------------------------------------------------------------------------
// DISCRIMINATION 1: the two REAL on-disk reports.
// ---------------------------------------------------------------------------

test('ENV-05: the on-disk COMPLETE built-in report returns complete true with declaredN / confirmedN / tableRows all 25', (t) => {
  const text = readReport(t, COMPLETE_REPORT);

  if (text == null) {
    return;
  }

  const result = isVerificationComplete(text);
  assert.equal(result.complete, true, 'the real complete report must be complete');
  assert.equal(result.declaredN, 25);
  assert.equal(result.confirmedN, 25);
  assert.equal(result.tableRows, 25);
  assert.equal(result.duplicateLedgerHeadings, 0);
  assert.equal(result.reason, null);
  assert.deepEqual(
    Object.keys(result).sort(),
    ['complete', 'confirmedN', 'declaredN', 'duplicateLedgerHeadings', 'reason', 'tableRows'],
  );
});

test('ENV-05 DISCRIMINATION: the on-disk PARTIAL-VERIFY report returns complete false with a NAMED reason (a real artifact of an incomplete run)', (t) => {
  // DISCRIMINATION: this file is the negative example already on disk. A predicate that only looked
  // for the words "verification ledger" would return true for BOTH reports -- its heading reads
  // "## Verification ledger" with no N/N count at all, because the run was cut off mid-verify.
  const text = readReport(t, PARTIAL_REPORT);

  if (text == null) {
    return;
  }

  const result = isVerificationComplete(text);
  assert.equal(result.complete, false, 'the real partial-verify report must NOT be complete');
  assert.ok(typeof result.reason === 'string' && result.reason.length > 0, 'the failure carries a named reason');
});

// ---------------------------------------------------------------------------
// The synthetic boundary cases.
// ---------------------------------------------------------------------------

test('ENV-05: a report with NO ledger heading at all returns complete false with a named reason, and does NOT throw', () => {
  const result = isVerificationComplete('# Just a report\n\n## Direct answer\n\nNo ledger here.\n');
  assert.equal(result.complete, false);
  assert.equal(result.declaredN, null);
  assert.equal(result.confirmedN, null);
  assert.equal(result.tableRows, null);
  assert.match(result.reason, /heading/, 'the reason names the missing heading');
});

test('ENV-05: a heading declaring UNEQUAL counts returns complete false', () => {
  const text = syntheticReport({ heading: '## Complete verification ledger (5/25 confirmed)', rows: 5 });
  const result = isVerificationComplete(text);
  assert.equal(result.complete, false);
  assert.equal(result.declaredN, 5);
  assert.equal(result.confirmedN, 25);
  assert.ok(typeof result.reason === 'string' && result.reason.length > 0);
});

test('ENV-05 DISCRIMINATION: equal header counts are NOT sufficient -- the table must have exactly that many data rows', () => {
  // DISCRIMINATION: a predicate that stopped at declaredN === confirmedN would call this complete.
  // The report declares 25/25 while its ledger table holds 5 rows, which is precisely the shape a
  // truncated run produces.
  const text = syntheticReport({ heading: '## Complete verification ledger (25/25 confirmed)', rows: 5 });
  const result = isVerificationComplete(text);
  assert.equal(result.complete, false);
  assert.equal(result.declaredN, 25);
  assert.equal(result.confirmedN, 25);
  assert.equal(result.tableRows, 5);
  assert.match(result.reason, /row/, 'the reason names the row-count mismatch');
});

test('ENV-05: a thousands-separated or decimal count is NOT a strict run of digits, so it returns complete false', () => {
  for (const heading of [
    '## Complete verification ledger (1,000/1,000 confirmed)',
    '## Complete verification ledger (25.0/25.0 confirmed)',
  ]) {
    const result = isVerificationComplete(syntheticReport({ heading, rows: 25 }));
    assert.equal(result.complete, false, 'must not coerce: ' + heading);
    assert.equal(result.declaredN, null, 'no coerced integer is reported');
  }
});

test('ENV-05: a ledger heading with no table after it returns complete false with a named reason', () => {
  const text = '# R\n\n## Complete verification ledger (3/3 confirmed)\n\nNo table follows.\n\n## Sources\n';
  const result = isVerificationComplete(text);
  assert.equal(result.complete, false);
  assert.equal(result.tableRows, null);
  assert.match(result.reason, /table/, 'the reason names the missing table');
});

test('ENV-05: TWO ledger headings -- the FIRST governs and duplicateLedgerHeadings is 1 (the ambiguity is surfaced, not resolved silently)', () => {
  const text = syntheticReport({
    heading: '## Complete verification ledger (25/25 confirmed)',
    rows: 25,
    extraHeading: '## Complete verification ledger (1/1 confirmed)',
  });
  const result = isVerificationComplete(text);
  assert.equal(result.duplicateLedgerHeadings, 1, 'the second heading is counted, not ignored');
  assert.equal(result.declaredN, 25, 'the FIRST heading governs');
  assert.equal(result.confirmedN, 25);
  assert.equal(result.tableRows, 25, 'and the FIRST heading\'s table is the one counted');
  assert.equal(result.complete, true, 'a duplicate heading is reported but does not by itself fail completeness');
});

test('CR-04 DISCRIMINATION: a ledger heading QUOTED INSIDE a fenced block does not govern -- the real ledger below it does', () => {
  // DISCRIMINATION: the heading scan walked every line with NO fence handling, and the FIRST match
  // wins. A report that shows its own output format in a fenced block therefore put an EXAMPLE heading
  // ahead of the real one, and the predicate certified the example as the verification ledger while
  // demoting the real 3/3 ledger to `duplicateLedgerHeadings` -- which by design does not fail
  // completeness. Measured before the fix: complete=true declaredN=2 tableRows=2 dup=1, i.e. every
  // count in the published record described the EXAMPLE (23-REVIEW.md CR-04).
  const text = [
    '# A report that documents its own format',
    '',
    '## Output format',
    '',
    'The ledger section looks like this:',
    '',
    '```markdown',
    '## Complete verification ledger (2/2 confirmed)',
    '',
    '| # | Claim | Source | Vote |',
    '|---|---|---|---|',
    '| C1 | An illustrative claim | [1] | 3-0 |',
    '| C2 | A second illustrative claim | [1] | 3-0 |',
    '```',
    '',
    '## Complete verification ledger (3/3 confirmed)',
    '',
    '| # | Claim | Source | Vote |',
    '|---|---|---|---|',
    '| C1 | A real claim | [1] | 3-0 |',
    '| C2 | A second real claim | [1] | 3-0 |',
    '| C3 | A third real claim | [1] | 3-0 |',
    '',
    '## Sources',
    '',
  ].join('\n');
  const result = isVerificationComplete(text);

  assert.equal(result.declaredN, 3, 'the REAL ledger governs, not the fenced example');
  assert.equal(result.confirmedN, 3);
  assert.equal(result.tableRows, 3, 'and the real ledger table is the one counted');
  assert.equal(result.duplicateLedgerHeadings, 0, 'a fenced example is not a duplicate heading at all');
  assert.equal(result.complete, true);
});

test('CR-04: the fence strip preserves CRLF handling -- a CRLF report parses identically to LF', () => {
  // stripFencedCode splits on \n and rejoins with \n, so the \r survives to the /\r?\n/ split here.
  // Pinned because CR-04 inserted a second line-splitting stage into this path.
  const lf = syntheticReport({ heading: '## Complete verification ledger (25/25 confirmed)', rows: 25 });
  const withFence = lf.replace(
    '## Direct answer',
    '## Direct answer\n\n```text\n## Complete verification ledger (1/1 confirmed)\n```',
  );

  assert.deepEqual(
    isVerificationComplete(withFence.replace(/\n/g, '\r\n')),
    isVerificationComplete(withFence),
    'CRLF and LF must produce the same result',
  );
  assert.equal(isVerificationComplete(withFence.replace(/\n/g, '\r\n')).declaredN, 25);
});

test('ENV-05: a non-string report is a ContractError (fail-closed; a malformed READ is not a malformed REPORT)', () => {
  assert.throws(() => isVerificationComplete(null), ContractError);
  assert.throws(() => isVerificationComplete(42), ContractError);
  assert.throws(() => isVerificationComplete(), ContractError);
});

// ---------------------------------------------------------------------------
// DISCRIMINATION 2: the four ceiling boundaries (D-05 / D-06).
// ---------------------------------------------------------------------------

test('D-05: spikeCeilingCheck CLEARS at exactly 3 resume cycles across exactly 2 reset windows', () => {
  const { cleared, ceiling } = spikeCeilingCheck({ resumeCycles: 3, resetWindows: 2 });
  assert.equal(cleared, true);
  assert.equal(ceiling.MAX_RESUME_CYCLES, 3);
  assert.equal(ceiling.MAX_RESET_WINDOWS, 2);
  assert.equal(ceiling.resumeCycles, 3, 'the realized counts travel with the verdict (D-07)');
  assert.equal(ceiling.resetWindows, 2);
});

test('D-05: spikeCeilingCheck clears at any LOWER pair, including a single-window zero-resume run', () => {
  assert.equal(spikeCeilingCheck({ resumeCycles: 0, resetWindows: 1 }).cleared, true);
  assert.equal(spikeCeilingCheck({ resumeCycles: 2, resetWindows: 2 }).cleared, true);
  assert.equal(spikeCeilingCheck({ resumeCycles: 3, resetWindows: 1 }).cleared, true);
});

test('D-05 DISCRIMINATION: spikeCeilingCheck does NOT clear at 4 resume cycles (the resume boundary is load-bearing)', () => {
  // DISCRIMINATION: a check that ignored resumeCycles would clear this. 4 is one past the frozen bar.
  assert.equal(spikeCeilingCheck({ resumeCycles: 4, resetWindows: 2 }).cleared, false);
});

test('D-05 DISCRIMINATION: spikeCeilingCheck does NOT clear at 3 reset windows (the window boundary is load-bearing)', () => {
  // DISCRIMINATION: a check that ignored resetWindows would clear this. 3 windows is one past the
  // frozen two-window protocol D-06 ratifies.
  assert.equal(spikeCeilingCheck({ resumeCycles: 3, resetWindows: 3 }).cleared, false);
});

test('D-05: spikeCeilingCheck throws a ContractError on a non-integer or negative argument', () => {
  assert.throws(() => spikeCeilingCheck({ resumeCycles: 1.5, resetWindows: 2 }), ContractError);
  assert.throws(() => spikeCeilingCheck({ resumeCycles: -1, resetWindows: 2 }), ContractError);
  assert.throws(() => spikeCeilingCheck({ resumeCycles: 3, resetWindows: -2 }), ContractError);
  assert.throws(() => spikeCeilingCheck({ resumeCycles: 3, resetWindows: 2.5 }), ContractError);
  assert.throws(() => spikeCeilingCheck(), ContractError);
});

// ---------------------------------------------------------------------------
// spikeCleared: BOTH halves, and the object names which half failed (D-05 / D-07).
// ---------------------------------------------------------------------------

test('D-05: spikeCleared requires BOTH a verification-complete report AND a cleared ceiling', () => {
  const complete = syntheticReport({ heading: '## Complete verification ledger (25/25 confirmed)', rows: 25 });
  const result = spikeCleared({ reportText: complete, resumeCycles: 3, resetWindows: 2 });
  assert.equal(result.cleared, true);
  assert.deepEqual(Object.keys(result).sort(), ['ceiling', 'cleared', 'completeness']);
  assert.equal(result.completeness.complete, true);
  assert.equal(result.ceiling.cleared, true);
});

test('D-05/D-07: spikeCleared NAMES which half failed -- a complete report over the ceiling', () => {
  const complete = syntheticReport({ heading: '## Complete verification ledger (25/25 confirmed)', rows: 25 });
  const result = spikeCleared({ reportText: complete, resumeCycles: 4, resetWindows: 2 });
  assert.equal(result.cleared, false);
  assert.equal(result.completeness.complete, true, 'the completeness half PASSED');
  assert.equal(result.ceiling.cleared, false, 'the ceiling half FAILED, and says so');
  assert.equal(result.ceiling.ceiling.resumeCycles, 4, 'the realized count is published either way (D-07)');
});

test('D-05/D-07: spikeCleared NAMES which half failed -- an incomplete report inside the ceiling', () => {
  const partial = syntheticReport({ heading: '## Complete verification ledger (25/25 confirmed)', rows: 5 });
  const result = spikeCleared({ reportText: partial, resumeCycles: 1, resetWindows: 1 });
  assert.equal(result.cleared, false);
  assert.equal(result.ceiling.cleared, true, 'the ceiling half PASSED');
  assert.equal(result.completeness.complete, false, 'the completeness half FAILED, and says so');
  assert.equal(result.completeness.tableRows, 5);
});
