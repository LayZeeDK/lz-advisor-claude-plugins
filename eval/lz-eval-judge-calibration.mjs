// lz-eval-judge-calibration.mjs
//
// NET-NEW (Plan 22-02, Task 1; NO-SPEND): the OFF-MODEL judge-MCC-calibration GATE (PAR-02 / D-13).
// It scores the session-landed Opus-judge verdicts over the closed-book WiCE + LLM-AggreFact
// calibration set against gold, and returns whether the judge CLEARS the pre-registered MCC bar. An
// uncalibrated judge is a DISQUALIFIER (the caller stops, never a silent grade). THE AUTHORITY is
// 22-CONTEXT.md (D-13) + 22-RESEARCH.md section 4 "The MCC judge-calibration gate" + "Calibrating the
// judge through the existing MCC machinery".
//
// THE ROLE SEPARATION (the ratified construct-validity principle): the CLOSED-book gold
// (WiCE/LLM-AggreFact) calibrates the JUDGE -- it never grades an open-book report. AVeriTeC's
// open-book gold scores the open-book verify-voter descriptively (lz-eval-sliceA-gold.mjs). Different
// roles, no mismatch (resolves the Phase 18-21 construct VOID).
//
// DELEGATION (D-07: hand-rolled stats are FORBIDDEN): the MCC point estimate routes through
// mccFromPairs and the one-sided lower CI through bcaBootstrapLowerCI -- BOTH from eval/lz-eval-mcc.mjs
// (which wraps the pinned jstat). This module computes NO statistics itself; it composes the existing
// metric engine + applies the gate predicate.
//
// LLM-AggreFact EMBEDS WiCE (D-13): dedupAgreFactVsWice drops any AggreFact item whose uid is already
// in the WiCE set BEFORE the calibration set is assembled -- a mandatory de-dup, never optional.
//
// Tree / dependency boundary (D-10/D-11): this script lives in the repo-level eval/ dev tree, NEVER in
// the distributed plugin tree. It imports the SHIPPED runtime aggregator's ContractError ACROSS trees
// by relative path -- ONE-DIRECTIONAL (eval -> runtime, NEVER runtime -> eval). It has NO out-of-family
// (Copilot/GPT/Gemini) transport (D-18); the gold is the free WiCE/AVeriTeC/LLM-AggreFact only.
//
// This source contains no literal byte-order mark and is strictly ASCII (per CLAUDE.md); LF line
// endings. The thin CLI is guarded so importing this module runs nothing.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Cross-tree reuse of the SHIPPED runtime aggregator's fail-closed signal (D-10; eval -> runtime,
// one-directional, never the reverse).
import { ContractError } from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

// The MCC metric engine + the FROZEN default bars (D-07: all stats route here). mccFromPairs returns
// { mcc, tp, tn, fp, fn }; bcaBootstrapLowerCI returns the one-sided lower CI bound.
import {
  MCC_BAR_POINT,
  MCC_CI_ALPHA,
  MCC_CI_LOWER_FLOOR,
  bcaBootstrapLowerCI,
  mccFromPairs,
} from './lz-eval-mcc.mjs';

// Fail-closed BOM-stripping JSON read (the established eval-tree convention) -- used by the CLI to read
// on-disk judge verdicts / gold.
import { readJson } from './lz-eval-readjson.mjs';

// ---------------------------------------------------------------------------
// JUDGE_MCC_BAR: the DEFAULT judge-calibration bar, RE-EXPORTING the frozen lz-eval-mcc.mjs constants
// (D-13). The phase-specific freeze is asserted against the pre-registration in Plan 22-04; this is
// the default carried so the gate predicate reads a single named contract. Object.freeze'd so the bar
// cannot be mutated post-hoc (anti-result-shopping, D-20).
//   POINT       : the MCC point estimate must be >= this (0.5).
//   ALPHA       : the one-sided CI alpha (0.05 -> a one-sided 95% lower bound).
//   LOWER_FLOOR : the one-sided lower-CI bound must be STRICTLY > this (0 -- the MCC chance value).
// ---------------------------------------------------------------------------
export const JUDGE_MCC_BAR = Object.freeze({
  POINT: MCC_BAR_POINT,
  ALPHA: MCC_CI_ALPHA,
  LOWER_FLOOR: MCC_CI_LOWER_FLOOR,
});

// ---------------------------------------------------------------------------
// dedupAgreFactVsWice({ wice, aggrefact }) -- LLM-AggreFact EMBEDS WiCE, so any AggreFact item whose
// uid is already present in the WiCE set is a DUPLICATE and MUST be dropped before calibration (D-13).
// Returns the de-duped AggreFact array (the WiCE set is unchanged -- it is the reference). Each item
// carries a string `uid`; a missing/non-string uid is a ContractError (fail-closed, never a silent
// drop that would distort the de-dup).
// ---------------------------------------------------------------------------
export function dedupAgreFactVsWice({ wice, aggrefact } = {}) {
  if (!Array.isArray(wice)) {
    throw new ContractError('dedupAgreFactVsWice requires a wice array: ' + JSON.stringify(wice), 'dedupAgreFactVsWice');
  }

  if (!Array.isArray(aggrefact)) {
    throw new ContractError(
      'dedupAgreFactVsWice requires an aggrefact array: ' + JSON.stringify(aggrefact),
      'dedupAgreFactVsWice',
    );
  }

  const wiceUids = new Set();

  for (const item of wice) {
    if (item == null || typeof item.uid !== 'string' || item.uid.length === 0) {
      throw new ContractError('wice item missing a non-empty string uid: ' + JSON.stringify(item), 'dedupAgreFactVsWice');
    }

    wiceUids.add(item.uid);
  }

  const out = [];

  for (const item of aggrefact) {
    if (item == null || typeof item.uid !== 'string' || item.uid.length === 0) {
      throw new ContractError(
        'aggrefact item missing a non-empty string uid: ' + JSON.stringify(item),
        'dedupAgreFactVsWice',
      );
    }

    if (!wiceUids.has(item.uid)) {
      out.push(item);
    }
  }

  return out;
}

// ---------------------------------------------------------------------------
// judgeCalibrationGate({ verdicts, gold }) -- the calibration GATE.
//   verdicts: parallel array of the judge's closed-book verdicts (each 'unrefuted'|'refuted', or
//     { id, verdict }) -- the same enum mccFromPairs reads.
//   gold:     parallel array of the calibration gold labels. Each gold entry MUST carry the
//     unrefuted|refuted label (string, or { id, gold }) AND a `subtle` marker on the WiCE
//     partially_supported items (mapped to 'refuted' by remapLabel). At least ONE subtle item is
//     mandatory (D-13: the calibration set MUST include the subtle-overreach substratum) -- a
//     zero-subtle set is a ContractError.
//
// Computes mcc via mccFromPairs and the one-sided lower CI via bcaBootstrapLowerCI (DELEGATED -- no
// hand-rolled stats, D-07), then returns:
//   { mcc, lowerCI, cleared }
//   cleared === (mcc >= JUDGE_MCC_BAR.POINT && lowerCI > JUDGE_MCC_BAR.LOWER_FLOOR)
// cleared === false is a DISQUALIFIER: the caller (the 22-05 driver) STOPS and does NOT grade. This
// function only returns the flag; it never grades and never silently defaults.
//
// A verdicts/gold length mismatch or an out-of-enum label is a ContractError (delegated to
// mccFromPairs / bcaBootstrapLowerCI). The gold-shape validation (the subtle-count) is done HERE.
// ---------------------------------------------------------------------------
export function judgeCalibrationGate({ verdicts, gold } = {}) {
  if (!Array.isArray(gold)) {
    throw new ContractError('judgeCalibrationGate requires a gold array: ' + JSON.stringify(gold), 'judgeCalibrationGate');
  }

  // D-13: the calibration set MUST include >= 1 WiCE partially_supported remap (the SUBTLE
  // substratum). A set with zero subtle items is a ContractError -- it cannot calibrate the judge's
  // subtle-overreach sensitivity, the whole point of the WiCE inclusion.
  const subtleCount = gold.reduce((acc, g) => {
    const isSubtle = g != null && typeof g === 'object' && g.subtle === true;

    return acc + (isSubtle ? 1 : 0);
  }, 0);

  if (subtleCount < 1) {
    throw new ContractError(
      'calibration gold must include >= 1 WiCE partially_supported subtle item (carry subtle:true); ' +
        'a zero-subtle set cannot calibrate subtle-overreach sensitivity (D-13)',
      'judgeCalibrationGate',
    );
  }

  // DELEGATE the stats (D-07): the MCC point estimate + the one-sided lower CI. mccFromPairs +
  // bcaBootstrapLowerCI normalize { id, verdict } / { id, gold } entries and fail closed on a length
  // mismatch or an out-of-enum label -- so we route the raw lists straight through. The gold entries
  // carry an extra `subtle` field; mccFromPairs reads only the verdict/gold value, so the marker is
  // ignored by the stats (it is a calibration-shape concern, validated above).
  const { mcc } = mccFromPairs({ verdicts, gold });
  const lowerCI = bcaBootstrapLowerCI({ verdicts, gold, alpha: JUDGE_MCC_BAR.ALPHA });

  const cleared = mcc >= JUDGE_MCC_BAR.POINT && lowerCI > JUDGE_MCC_BAR.LOWER_FLOOR;

  return { mcc, lowerCI, cleared };
}

// ---------------------------------------------------------------------------
// Thin CLI (guarded so importing the module does NOT run it). Single positional <calib-input.json>
// holding { verdicts, gold } (the session-landed judge verdicts + the calibration gold); prints the
// gate result; exits 0 if cleared, 1 if DISQUALIFIED, 2 on a contract error. NO model call -- it
// scores already-landed verdicts from disk (zero spend).
// ---------------------------------------------------------------------------
/* node:coverage disable */
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const inputPath = process.argv[2];

  if (!inputPath || !fs.existsSync(inputPath)) {
    console.error('lz-eval-judge-calibration: missing or invalid <calib-input.json>');
    process.exit(2);
  }

  try {
    const input = readJson(inputPath);
    const { mcc, lowerCI, cleared } = judgeCalibrationGate(input);
    console.log('mcc=' + mcc.toFixed(4) + ' lowerCI=' + lowerCI.toFixed(4) + ' cleared=' + cleared);
    process.exit(cleared ? 0 : 1);
  } catch (err) {
    const where = err && err.file ? ' (' + err.file + ')' : '';
    console.error('lz-eval-judge-calibration: ' + (err && err.message ? err.message : String(err)) + where);
    process.exit(2);
  }
}
/* node:coverage enable */
