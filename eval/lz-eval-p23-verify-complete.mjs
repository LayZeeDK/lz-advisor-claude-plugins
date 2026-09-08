// lz-eval-p23-verify-complete.mjs
//
// NET-NEW (Plan 23-02, Task 3; NO-SPEND): the FROZEN MECHANICAL definition of a verification-complete
// built-in `/deep-research` report, plus the FROZEN ENV-05 spike ceiling. THE AUTHORITY is
// 23-CONTEXT.md (D-05/D-06/D-07) + eval/lz-eval-p23-prereg.md.
//
// WHY IT IS FROZEN NOW, BEFORE THE SPIKE (D-05 / T-23-02b): D-05 clears the ENV-05 spike iff a built-in
// capture reaches "a verification-complete report" within a ceiling frozen BEFORE the spike runs. That
// phrase needs a mechanically checkable definition or the spike becomes a judgement call at exactly the
// moment pre-registration exists to prevent one. Both constants land in wave 2 so Plan 23-04's freeze
// commit can quote them and precede the spike commit in git ancestry.
//
// THIS IS A MECHANICAL PREDICATE, NOT A STATISTICAL GATE. It compares two declared integers and counts
// a table's data rows. It computes no rate, no interval and no significance, so the
// point-estimate-gate-at-small-n anti-pattern does not apply here.
//
// PATTERN 5 CAVEAT, CARRIED DELIBERATELY (23-RESEARCH.md Pattern 5 / assumption A5): this definition is
// derived from a SINGLE observed report and the built-in is closed-source -- its output format is NOT
// contractual. If the q2 capture's format differs, that difference is ITSELF an ENV-07 finding about the
// reference system's operating envelope, and the spike falls to a documented MANUAL read recorded as a
// deviation. It is NEVER a silent re-definition of this predicate.
//
// D-06, A RATIFIED READING RECORDED SO IT CANNOT BE MISTAKEN FOR DRIFT: ENV-05's literal wording says
// "inside one 5-hour pool window", and that is deliberately NOT the operative criterion. The Phase-22
// q1 built-in capture needed THREE resume cycles across TWO reset windows, so a strict one-window bar
// fails by construction on evidence already in hand -- testing it would terminate ENV-06 on a reason
// already documented rather than newly learned. SPIKE_CEILING therefore encodes the two-window protocol
// empirically validated in Phase 22. D-07 applies to BOTH outcomes: the realized ceiling is a
// publishable ENV-07 finding whether or not the spike clears, so every return value below carries the
// realized counts and not just the boolean.
//
// Tree / dependency boundary (D-10/D-11): this script lives in the repo-level eval/ dev tree, NEVER in
// the distributed plugin tree. It imports the SHIPPED runtime aggregator's ContractError ACROSS trees
// by relative path -- ONE-DIRECTIONAL (eval -> runtime, NEVER runtime -> eval). It adds no package and
// performs no network call.
//
// This source contains no literal byte-order mark and is strictly ASCII (per CLAUDE.md); LF line
// endings. The thin CLI is guarded so importing this module runs nothing. NO model call, NO capture.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Cross-tree reuse of the SHIPPED runtime aggregator's fail-closed signal (D-10; eval -> runtime,
// one-directional, never the reverse).
import { ContractError } from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

// The SIBLING module's fence stripper, REUSED rather than reimplemented (23-REVIEW.md CR-04). Both
// modules were written in the same wave and must not diverge on what a fence is; citation-audit.mjs's
// version is the one already proven by its own co-test. This is an in-tree eval -> eval import and adds
// no package and no network call.
import { stripFencedCode } from './lz-eval-p23-citation-audit.mjs';

// ---------------------------------------------------------------------------
// LEDGER_HEADING_RE: the built-in's verification-ledger heading, capturing its two declared counts.
// Observed form (eval/.cache/p22-baseline/builtin/qB1-run1.report.md:80):
//   ## Complete verification ledger (25/25 confirmed)
//
// Each count is a STRICT run of digits between the parenthesis, the slash and the word `confirmed`, so
// a thousands-separated form (1,000/1,000) or a decimal form (25.0/25.0) does NOT parse and yields
// complete false rather than a coerced integer.
//
// NON-GLOBAL on purpose: this regex is Object.frozen, and a frozen GLOBAL regex throws on exec/test
// because those write `lastIndex`. Scanning is done line by line instead.
// ---------------------------------------------------------------------------
export const LEDGER_HEADING_RE = Object.freeze(
  /^#{1,6}[ \t]+[^\n]*\bverification ledger\b[^\n]*\((\d+)\/(\d+)[ \t]+confirmed\)[ \t]*$/i,
);

// ---------------------------------------------------------------------------
// SPIKE_CEILING: the ENV-05 clearing ceiling, FROZEN BEFORE the spike runs (D-05 / D-06 / T-23-02b).
// A co-test asserts Object.isFrozen and both values. See the D-06 paragraph in the module header for
// why the literal one-window reading of ENV-05 is deliberately not the operative criterion.
//   MAX_RESUME_CYCLES : at most 3 resume cycles.
//   MAX_RESET_WINDOWS : across at most 2 reset windows.
// ---------------------------------------------------------------------------
export const SPIKE_CEILING = Object.freeze({
  MAX_RESUME_CYCLES: 3,
  MAX_RESET_WINDOWS: 2,
});

// A Markdown table separator row: | --- | --- | (dashes, optional alignment colons, pipes).
const TABLE_SEPARATOR_RE = /^\s*\|(?:\s*:?-{3,}:?\s*\|)+\s*$/;

// Any ATX heading line -- used to stop the table search at the next section.
const ANY_HEADING_RE = /^#{1,6}[ \t]/;

function isTableRow(line) {
  return line.trimStart().startsWith('|');
}

// ---------------------------------------------------------------------------
// assertNonNegativeInteger(name, v, where) -- the argument-checking shape sliceAFeasibilityGate
// already uses (lz-eval-sliceA-gold.mjs:220-238).
// ---------------------------------------------------------------------------
function assertNonNegativeInteger(name, v, where) {
  if (!Number.isInteger(v) || v < 0) {
    throw new ContractError(
      where + ' requires a non-negative integer ' + name + ': ' + JSON.stringify(v),
      where,
    );
  }
}

// ---------------------------------------------------------------------------
// isVerificationComplete(reportText) -- the FROZEN mechanical completeness predicate. Returns
//   { complete, declaredN, confirmedN, tableRows, duplicateLedgerHeadings, reason }
//
// A report is COMPLETE iff the FIRST ledger heading declares two EQUAL counts AND the table
// immediately following that heading has EXACTLY that many data rows. Equality of the heading pair
// alone is NOT sufficient: a 25/25 heading over a 5-row table is precisely the shape a run truncated
// mid-verify produces.
//
// Every failure path returns complete false with a NAMED `reason` instead of throwing, because a
// malformed report is a FINDING, not a crash a caller could mistake for a pass. Only a malformed READ
// -- a non-string argument -- throws.
//
// FENCED CODE IS STRIPPED FIRST, reusing the sibling citation-audit module's `stripFencedCode`. A
// heading quoted inside a fence is an EXAMPLE, not the ledger, and must not be scanned.
//
// When a report carries TWO ledger headings the FIRST one governs and the second is counted in
// `duplicateLedgerHeadings`, so the ambiguity is surfaced rather than resolved silently. A duplicate
// alone does not fail completeness; it is reported for the reader to weigh. That leniency is exactly
// why the fence strip above is required rather than optional: without it a fenced example heading
// governed and the REAL ledger became the "duplicate" that does not fail anything.
// ---------------------------------------------------------------------------
export function isVerificationComplete(reportText) {
  if (typeof reportText !== 'string') {
    throw new ContractError(
      'isVerificationComplete requires the report text as a string: ' + JSON.stringify(reportText),
      'isVerificationComplete',
    );
  }

  // FENCED CODE IS STRIPPED BEFORE THE SCAN (23-REVIEW.md CR-04). A /deep-research report that shows
  // its own output format in a fenced block -- a common thing for a report to do -- put an example
  // ledger heading BEFORE the real one, and since the FIRST match governs, the predicate certified the
  // illustrative example as the verification ledger and demoted the real ledger to
  // `duplicateLedgerHeadings`, which by design does not fail completeness. Every count in the published
  // record would then have described the example.
  const lines = stripFencedCode(reportText).split(/\r?\n/);
  let headingLine = -1;
  let declaredN = null;
  let confirmedN = null;
  let duplicateLedgerHeadings = 0;

  for (let i = 0; i < lines.length; i += 1) {
    const m = LEDGER_HEADING_RE.exec(lines[i]);

    if (m === null) {
      continue;
    }

    if (headingLine === -1) {
      headingLine = i;
      declaredN = Number.parseInt(m[1], 10);
      confirmedN = Number.parseInt(m[2], 10);
    } else {
      duplicateLedgerHeadings += 1;
    }
  }

  if (headingLine === -1) {
    return {
      complete: false,
      declaredN: null,
      confirmedN: null,
      tableRows: null,
      duplicateLedgerHeadings,
      reason:
        'no verification-ledger heading declaring an N/N confirmed count was found (Pattern 5: a ' +
        'format change is itself an ENV-07 finding and falls to a documented manual read, never a ' +
        'silent re-definition)',
    };
  }

  // Walk forward from the heading to the FIRST table, stopping at the next section heading.
  let cursor = headingLine + 1;

  while (cursor < lines.length && !isTableRow(lines[cursor]) && !ANY_HEADING_RE.test(lines[cursor])) {
    cursor += 1;
  }

  if (cursor >= lines.length || !isTableRow(lines[cursor])) {
    return {
      complete: false,
      declaredN,
      confirmedN,
      tableRows: null,
      duplicateLedgerHeadings,
      reason: 'the ledger heading declares ' + declaredN + '/' + confirmedN + ' but no ledger table follows it',
    };
  }

  // cursor is the header row; the next line must be the separator row.
  const separator = cursor + 1;

  if (separator >= lines.length || !TABLE_SEPARATOR_RE.test(lines[separator])) {
    return {
      complete: false,
      declaredN,
      confirmedN,
      tableRows: null,
      duplicateLedgerHeadings,
      reason: 'the ledger table has no Markdown separator row, so its data rows cannot be counted',
    };
  }

  let tableRows = 0;
  let row = separator + 1;

  while (row < lines.length && isTableRow(lines[row])) {
    tableRows += 1;
    row += 1;
  }

  if (declaredN !== confirmedN) {
    return {
      complete: false,
      declaredN,
      confirmedN,
      tableRows,
      duplicateLedgerHeadings,
      reason:
        'the ledger heading declares unequal counts (' +
        declaredN +
        ' selected vs ' +
        confirmedN +
        ' confirmed), which is an incomplete verification',
    };
  }

  if (tableRows !== declaredN) {
    return {
      complete: false,
      declaredN,
      confirmedN,
      tableRows,
      duplicateLedgerHeadings,
      reason:
        'the ledger heading declares ' +
        declaredN +
        ' but its table holds ' +
        tableRows +
        ' data rows (heading-count equality alone is NOT sufficient -- this is the shape a run ' +
        'truncated mid-verify produces)',
    };
  }

  return { complete: true, declaredN, confirmedN, tableRows, duplicateLedgerHeadings, reason: null };
}

// ---------------------------------------------------------------------------
// spikeCeilingCheck({ resumeCycles, resetWindows }) -- the MECHANICAL ceiling predicate (D-05).
// Clears iff resumeCycles <= MAX_RESUME_CYCLES AND resetWindows <= MAX_RESET_WINDOWS. Returns
// { cleared, ceiling } where `ceiling` carries BOTH frozen limits AND the realized counts, because
// D-07 makes the realized ceiling a publishable ENV-07 finding either way -- the boolean alone is not
// the finding. A non-integer or negative argument is a ContractError.
// ---------------------------------------------------------------------------
export function spikeCeilingCheck({ resumeCycles, resetWindows } = {}) {
  assertNonNegativeInteger('resumeCycles', resumeCycles, 'spikeCeilingCheck');
  assertNonNegativeInteger('resetWindows', resetWindows, 'spikeCeilingCheck');

  const cleared =
    resumeCycles <= SPIKE_CEILING.MAX_RESUME_CYCLES && resetWindows <= SPIKE_CEILING.MAX_RESET_WINDOWS;

  return {
    cleared,
    ceiling: {
      MAX_RESUME_CYCLES: SPIKE_CEILING.MAX_RESUME_CYCLES,
      MAX_RESET_WINDOWS: SPIKE_CEILING.MAX_RESET_WINDOWS,
      resumeCycles,
      resetWindows,
    },
  };
}

// ---------------------------------------------------------------------------
// spikeCleared({ reportText, resumeCycles, resetWindows }) -- the ENV-05 spike verdict (D-05).
// `cleared` requires BOTH halves: a verification-complete report AND a cleared ceiling. The returned
// object NAMES which half failed by carrying each half's own result -- `completeness.complete` and
// `ceiling.cleared` -- along with the realized counts and the named completeness reason (D-07).
// ---------------------------------------------------------------------------
export function spikeCleared({ reportText, resumeCycles, resetWindows } = {}) {
  const completeness = isVerificationComplete(reportText);
  const ceiling = spikeCeilingCheck({ resumeCycles, resetWindows });

  return { cleared: completeness.complete && ceiling.cleared, completeness, ceiling };
}

// ---------------------------------------------------------------------------
// Thin CLI (guarded so importing the module does NOT run it). Usage:
//   node eval/lz-eval-p23-verify-complete.mjs <report.md> [resumeCycles] [resetWindows]
// Prints one machine-readable line. With no counts supplied it reports COMPLETENESS only and exits 0
// when complete, 1 when not. With both counts supplied it reports the full spike verdict and exits on
// that. Exit 2 on a ContractError. NO model call -- it reads a report already on disk (zero spend).
// ---------------------------------------------------------------------------
/* node:coverage disable */
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const inputPath = process.argv[2];

  if (!inputPath || !fs.existsSync(inputPath)) {
    console.error('lz-eval-p23-verify-complete: missing or invalid <report.md>');
    process.exit(2);
  }

  try {
    const reportText = fs.readFileSync(inputPath, 'utf8');
    const hasCounts = process.argv[3] !== undefined && process.argv[4] !== undefined;
    const completeness = isVerificationComplete(reportText);
    let ok = completeness.complete;
    let line =
      'complete=' +
      completeness.complete +
      ' declaredN=' +
      completeness.declaredN +
      ' confirmedN=' +
      completeness.confirmedN +
      ' tableRows=' +
      completeness.tableRows +
      ' duplicateLedgerHeadings=' +
      completeness.duplicateLedgerHeadings;

    if (hasCounts) {
      const resumeCycles = Number.parseInt(process.argv[3], 10);
      const resetWindows = Number.parseInt(process.argv[4], 10);
      const verdict = spikeCleared({ reportText, resumeCycles, resetWindows });
      ok = verdict.cleared;
      line +=
        ' ceiling-cleared=' +
        verdict.ceiling.cleared +
        ' resumeCycles=' +
        resumeCycles +
        ' resetWindows=' +
        resetWindows +
        ' spike-cleared=' +
        verdict.cleared;
    }

    console.log(line);

    if (completeness.reason !== null) {
      console.log('reason: ' + completeness.reason);
    }

    process.exit(ok ? 0 : 1);
  } catch (err) {
    const where = err && err.file ? ' (' + err.file + ')' : '';
    console.error('lz-eval-p23-verify-complete: ' + (err && err.message ? err.message : String(err)) + where);
    process.exit(2);
  }
}
/* node:coverage enable */
