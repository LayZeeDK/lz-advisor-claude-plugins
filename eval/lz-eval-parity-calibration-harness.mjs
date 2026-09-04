// lz-eval-parity-calibration-harness.mjs
//
// NET-NEW (Plan 22-05, Stage 2; NO-SPEND): the RESUMABLE materialize + score-from-disk harness for the
// closed-book Opus judge MCC calibration (PAR-02 / PAR-08 / D-13). It composes the FROZEN seams
// (goldFromWiceLabel + judgeCalibrationGate from lz-eval-judge-calibration.mjs; readJson) over the
// vendored WiCE fixtures; it changes NO frozen NUMBER and adds NO selection rule (the set is the whole
// 60-item vendored WiCE draw resolved in AMENDMENT RECORD 2 of eval/lz-eval-parity-prereg.md). THE
// AUTHORITY is eval/lz-eval-parity-driver.md Stage 2 + eval/lz-eval-parity-calibration-prompt.md.
//
// This harness is NO-SPEND and node-only. The actual judging is done by the orchestrating Claude Code
// SESSION spawning one Opus Agent sub-agent per item (callJudge; eval/lz-eval-parity-driver.md) and
// PERSISTING each verdict to <CALIBRATION_OUT_DIR>/<uid>.verdict.json. This module:
//   - materializes the per-item judge INPUT payload (anti-leak: claim + context + evidence ONLY, never
//     the gold label / supporting_sentences) so the dispatch is auditable + frozen-at-dispatch;
//   - reports the PENDING items (skip-on-resume: an item whose verdict file already exists is DONE), so
//     a mid-run 5-hour-window exhaustion loses nothing;
//   - assembles the gate input with UID-ORDERED POSITIONAL ALIGNMENT (load-bearing: mccFromPairs pairs
//     verdicts[i] with gold[i] BY INDEX, not by id -- so verdicts and gold MUST be built in one identical
//     uid order) and scores via the FROZEN judgeCalibrationGate (cleared===false is a DISQUALIFIER).
//
// Tree / dependency boundary (D-10/D-11): lives in the repo-level eval/ dev tree, NEVER in the
// distributed plugin tree. It imports the SHIPPED runtime aggregator's ContractError ACROSS trees by
// relative path -- ONE-DIRECTIONAL (eval -> runtime, never the reverse). NO out-of-family transport
// (D-18). This source contains no literal byte-order mark and is strictly ASCII (per CLAUDE.md); LF line
// endings. The thin CLI is guarded so importing this module runs nothing.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Cross-tree reuse of the SHIPPED runtime aggregator's fail-closed signal (D-10; eval -> runtime).
import { ContractError } from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

// The FROZEN calibration seams: the WiCE label -> { id, gold, subtle } remap + the MCC gate predicate.
import { goldFromWiceLabel, judgeCalibrationGate } from './lz-eval-judge-calibration.mjs';

// Fail-closed BOM-stripping JSON read (the established eval-tree convention).
import { readJson } from './lz-eval-readjson.mjs';

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));

// The vendored, offline, tracked WiCE calibration corpus (60 records; 26 supported / 17
// partially_supported subtle / 17 not_supported -> 26 unrefuted / 34 refuted gold).
export const WICE_RECORDS_DIR = path.join(MODULE_DIR, '__fixtures__', 'wice-vendored', 'records');

// The gitignored per-item verdict + input sink (eval/.cache is gitignored; never committed).
export const CALIBRATION_OUT_DIR = path.join(MODULE_DIR, '.cache', 'p22-baseline', 'calibration');

// The frozen verdict enum (the same enum mccFromPairs reads). Verdict files are validated against it at
// READ time (fail-closed) before they ever reach the gate.
const VERDICT_ENUM = Object.freeze(['unrefuted', 'refuted']);

// ---------------------------------------------------------------------------
// assertSafeUid(uid) -- a uid is used as an on-disk basename, so reject anything that could traverse or
// is not a plain token. fail-closed ContractError (defense-in-depth even though uids come from tracked
// fixtures). Allows the WiCE shape (e.g. "dev00003-0").
// ---------------------------------------------------------------------------
function assertSafeUid(uid) {
  if (typeof uid !== 'string' || uid.length === 0) {
    throw new ContractError('uid must be a non-empty string: ' + JSON.stringify(uid), 'assertSafeUid');
  }

  if (uid === '.' || uid === '..' || !/^[A-Za-z0-9._-]+$/.test(uid)) {
    throw new ContractError('unsafe uid (expected /^[A-Za-z0-9._-]+$/, not "." or ".."): ' + JSON.stringify(uid), 'assertSafeUid');
  }

  return uid;
}

// ---------------------------------------------------------------------------
// loadCalibrationItems({ recordsDir }) -- read every vendored WiCE record, validate its shape fail-closed,
// derive the gold via goldFromWiceLabel (the canonical remap; throws on an unknown label), and return the
// items SORTED ASCENDING BY uid (the deterministic order the gate input is built in). Each item:
//   { uid, claim, claimContext|null, evidence: string[], evidenceText, label, gold: { id, gold, subtle } }
// A duplicate uid, a missing/empty claim, a non-string-array / empty evidence, or an unknown label is a
// ContractError (never a silent drop that would distort the calibration set).
// ---------------------------------------------------------------------------
export function loadCalibrationItems({ recordsDir = WICE_RECORDS_DIR } = {}) {
  if (!fs.existsSync(recordsDir) || !fs.statSync(recordsDir).isDirectory()) {
    throw new ContractError('calibration records dir not found: ' + recordsDir, 'loadCalibrationItems');
  }

  const files = fs.readdirSync(recordsDir).filter((f) => f.endsWith('.json'));
  const seen = new Set();
  const items = [];

  for (const file of files) {
    const record = readJson(path.join(recordsDir, file));

    if (record == null || typeof record !== 'object') {
      throw new ContractError('WiCE record is not an object: ' + file, 'loadCalibrationItems');
    }

    const meta = record.meta;

    if (meta == null || typeof meta.id !== 'string' || meta.id.length === 0) {
      throw new ContractError('WiCE record missing meta.id (string): ' + file, 'loadCalibrationItems');
    }

    const uid = assertSafeUid(meta.id);

    if (seen.has(uid)) {
      throw new ContractError('duplicate WiCE uid: ' + JSON.stringify(uid), 'loadCalibrationItems');
    }

    seen.add(uid);

    if (typeof record.claim !== 'string' || record.claim.trim().length === 0) {
      throw new ContractError('WiCE record ' + uid + ' missing a non-empty claim', 'loadCalibrationItems');
    }

    if (!Array.isArray(record.evidence) || record.evidence.length === 0) {
      throw new ContractError('WiCE record ' + uid + ' missing a non-empty evidence array', 'loadCalibrationItems');
    }

    for (const sentence of record.evidence) {
      if (typeof sentence !== 'string') {
        throw new ContractError('WiCE record ' + uid + ' has a non-string evidence sentence', 'loadCalibrationItems');
      }
    }

    const evidenceText = record.evidence.join('\n');

    if (evidenceText.trim().length === 0) {
      throw new ContractError('WiCE record ' + uid + ' has empty evidence text', 'loadCalibrationItems');
    }

    // The canonical WiCE label -> { id, gold, subtle } remap. An unknown label fails closed HERE.
    const gold = goldFromWiceLabel({ id: uid, wiceLabel: record.label });

    const claimContext = typeof meta.claim_context === 'string' ? meta.claim_context : null;

    items.push({
      uid,
      claim: record.claim,
      claimContext,
      evidence: record.evidence,
      evidenceText,
      label: record.label,
      gold,
    });
  }

  if (items.length === 0) {
    throw new ContractError('no WiCE records found in ' + recordsDir, 'loadCalibrationItems');
  }

  // Deterministic ascending uid order -- the SINGLE order both verdicts[] and gold[] are built in
  // (mccFromPairs pairs by index; see assembleGateInput).
  items.sort((a, b) => (a.uid < b.uid ? -1 : a.uid > b.uid ? 1 : 0));

  return items;
}

// ---------------------------------------------------------------------------
// buildJudgePayload(item) -- the EXACT per-item input the Opus judge sub-agent is shown. ANTI-LEAK: it
// carries the claim + interpretation context + evidence ONLY -- NEVER the gold label, the subtle marker,
// or the supporting_sentences (the held-back answer). Asserted by the harness test.
// ---------------------------------------------------------------------------
export function buildJudgePayload(item) {
  if (item == null || typeof item !== 'object') {
    throw new ContractError('buildJudgePayload requires an item object', 'buildJudgePayload');
  }

  return {
    uid: assertSafeUid(item.uid),
    claim: item.claim,
    context: item.claimContext,
    evidence: item.evidenceText,
  };
}

// ---------------------------------------------------------------------------
// Path helpers (uid-safe).
// ---------------------------------------------------------------------------
export function inputPath(uid, outDir = CALIBRATION_OUT_DIR) {
  return path.join(outDir, assertSafeUid(uid) + '.input.json');
}

export function verdictPath(uid, outDir = CALIBRATION_OUT_DIR) {
  return path.join(outDir, assertSafeUid(uid) + '.verdict.json');
}

// ---------------------------------------------------------------------------
// materializeInputs({ items, outDir }) -- write each item's anti-leak judge payload to <uid>.input.json
// (idempotent; the frozen-at-dispatch record of exactly what each judge was shown). Returns the count
// written. NO model call.
// ---------------------------------------------------------------------------
export function materializeInputs({ items, outDir = CALIBRATION_OUT_DIR } = {}) {
  if (!Array.isArray(items)) {
    throw new ContractError('materializeInputs requires an items array', 'materializeInputs');
  }

  fs.mkdirSync(outDir, { recursive: true });

  for (const item of items) {
    const payload = buildJudgePayload(item);
    fs.writeFileSync(inputPath(item.uid, outDir), JSON.stringify(payload, null, 2) + '\n', 'utf8');
  }

  return items.length;
}

// ---------------------------------------------------------------------------
// pendingItems({ items, outDir }) -- the items still needing a judge verdict (skip-on-resume: an item
// whose <uid>.verdict.json already exists is DONE). The dispatch loop spawns judges only for these.
// ---------------------------------------------------------------------------
export function pendingItems({ items, outDir = CALIBRATION_OUT_DIR } = {}) {
  if (!Array.isArray(items)) {
    throw new ContractError('pendingItems requires an items array', 'pendingItems');
  }

  return items.filter((it) => !fs.existsSync(verdictPath(it.uid, outDir)));
}

// ---------------------------------------------------------------------------
// readVerdict({ uid, outDir }) -- read + validate a landed verdict file (fail-closed). The file MUST be a
// JSON object carrying a `verdict` in the frozen enum. Returns { id: uid, verdict }. A missing file, a
// malformed object, or an out-of-enum verdict is a ContractError (never a silent default that would
// distort the MCC).
//
// INTEROP CONTRACT: the uid is taken from the FILENAME (<uid>.verdict.json), NOT from the body, so the
// orchestrating session may persist the judge's raw object verbatim (e.g. the prompt's
// { "verdict", "reasoning" }) under that filename. Only `verdict` is read here; any `reasoning` the judge
// emitted is retained on disk for audit but is NOT gate-relevant. A `uid` field in the body, if present,
// is ignored (the filename is authoritative).
// ---------------------------------------------------------------------------
export function readVerdict({ uid, outDir = CALIBRATION_OUT_DIR } = {}) {
  const p = verdictPath(uid, outDir);

  if (!fs.existsSync(p)) {
    throw new ContractError('missing verdict file for uid ' + uid + ': ' + p, 'readVerdict');
  }

  const record = readJson(p);

  if (record == null || typeof record !== 'object') {
    throw new ContractError('verdict file for uid ' + uid + ' is not an object', 'readVerdict');
  }

  if (!VERDICT_ENUM.includes(record.verdict)) {
    throw new ContractError(
      'verdict file for uid ' + uid + ' has a verdict outside ' + JSON.stringify(VERDICT_ENUM) + ': ' + JSON.stringify(record.verdict),
      'readVerdict',
    );
  }

  // FAIL-CLOSED MODEL PIN (AMENDMENT RECORD 3; mirrors the D-15 pin the baseline-capture arm enforces
  // in lz-eval-baseline-manifest.mjs). The judge is dispatched by ALIAS -- the Agent tool takes
  // `model: opus`, never a pinned version -- so the alias silently re-points as generations ship, and a
  // verdict that does not name its own judge cannot be attributed to one afterwards. The Opus 4.x set
  // that DISQUALIFIED at mcc=0.4889 recorded only { uid, verdict, reasoning }, so its instrument had to
  // be identified from file mtimes; that set is retained UNPINNED at calibration-opus4x/ as a record and
  // is deliberately NOT re-scorable through this path. An unpinned run cannot be graded.
  if (typeof record.model !== 'string' || record.model.length === 0) {
    throw new ContractError(
      'verdict file for uid ' + uid + ' has no judge model -- an unpinned verdict cannot be scored (AMENDMENT RECORD 3)',
      'readVerdict',
    );
  }

  return { id: uid, verdict: record.verdict, model: record.model };
}

// ---------------------------------------------------------------------------
// assembleGateInput({ items, outDir }) -- build { verdicts, gold } in ONE identical uid order (the
// pre-sorted items order). LOAD-BEARING: mccFromPairs pairs verdicts[i] with gold[i] BY INDEX (not by
// id), so both arrays MUST be built in the same single pass over the sorted items -- verdicts[i].id and
// gold[i].id are guaranteed equal by construction. If ANY item lacks a verdict file, throw a ContractError
// naming the missing uids (never score a partial set).
// ---------------------------------------------------------------------------
export function assembleGateInput({ items, outDir = CALIBRATION_OUT_DIR } = {}) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new ContractError('assembleGateInput requires a non-empty items array', 'assembleGateInput');
  }

  const missing = items.filter((it) => !fs.existsSync(verdictPath(it.uid, outDir))).map((it) => it.uid);

  if (missing.length > 0) {
    throw new ContractError(
      'cannot score: ' + missing.length + ' item(s) lack a verdict file: ' + missing.join(', '),
      'assembleGateInput',
    );
  }

  const verdicts = [];
  const gold = [];

  for (const item of items) {
    const { verdict } = readVerdict({ uid: item.uid, outDir });
    verdicts.push({ id: item.uid, verdict });
    gold.push({ id: item.uid, gold: item.gold.gold, subtle: item.gold.subtle });
  }

  return { verdicts, gold };
}

// ---------------------------------------------------------------------------
// scoreCalibration({ items, outDir }) -- assemble the gate input from disk and run the FROZEN
// judgeCalibrationGate. Returns { mcc, lowerCI, cleared }. cleared===false is a DISQUALIFIER (PAR-02):
// the caller STOPS and does NOT grade. NO model call (zero spend).
// ---------------------------------------------------------------------------
export function scoreCalibration({ items, outDir = CALIBRATION_OUT_DIR } = {}) {
  return judgeCalibrationGate(assembleGateInput({ items, outDir }));
}

// ---------------------------------------------------------------------------
// summarize(items) -- a no-spend descriptive summary of the loaded calibration set (counts + gold balance
// + subtle count). Used by the CLI + the materialize step to confirm the frozen WiCE-only N=60 shape.
// ---------------------------------------------------------------------------
export function summarize(items) {
  if (!Array.isArray(items)) {
    throw new ContractError('summarize requires an items array', 'summarize');
  }

  let unrefuted = 0;
  let refuted = 0;
  let subtle = 0;

  for (const item of items) {
    if (item.gold.gold === 'unrefuted') {
      unrefuted += 1;
    } else {
      refuted += 1;
    }

    if (item.gold.subtle === true) {
      subtle += 1;
    }
  }

  return { total: items.length, unrefuted, refuted, subtle };
}

// ---------------------------------------------------------------------------
// Thin CLI (guarded so importing the module runs nothing). Commands:
//   materialize [outDir]  -- write the per-item anti-leak payloads + print the summary + pending count.
//   pending     [outDir]  -- print the uids still needing a verdict (one per line) + the count.
//   score       [outDir]  -- score the landed verdicts via the frozen gate; exit 0 if cleared, 1 if
//                            DISQUALIFIED, 2 on a contract error (e.g. missing verdicts). NO model call.
//   summary     [recordsDir] -- print the loaded set summary (counts + gold balance + subtle).
// ---------------------------------------------------------------------------
/* node:coverage disable */
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const command = process.argv[2];
  const arg = process.argv[3];

  try {
    if (command === 'materialize') {
      const outDir = arg || CALIBRATION_OUT_DIR;
      const items = loadCalibrationItems();
      const written = materializeInputs({ items, outDir });
      const s = summarize(items);
      const pending = pendingItems({ items, outDir }).length;
      console.log(
        'materialized=' + written + ' total=' + s.total + ' unrefuted=' + s.unrefuted +
          ' refuted=' + s.refuted + ' subtle=' + s.subtle + ' pendingVerdicts=' + pending,
      );
      console.log('out=' + outDir);
      process.exit(0);
    } else if (command === 'pending') {
      const outDir = arg || CALIBRATION_OUT_DIR;
      const items = loadCalibrationItems();
      const pending = pendingItems({ items, outDir });

      for (const it of pending) {
        console.log(it.uid);
      }

      console.error('pending=' + pending.length + '/' + items.length);
      process.exit(0);
    } else if (command === 'score') {
      const outDir = arg || CALIBRATION_OUT_DIR;
      const items = loadCalibrationItems();
      const { mcc, lowerCI, cleared } = scoreCalibration({ items, outDir });
      console.log('mcc=' + mcc.toFixed(4) + ' lowerCI=' + lowerCI.toFixed(4) + ' cleared=' + cleared + ' n=' + items.length);
      process.exit(cleared ? 0 : 1);
    } else if (command === 'summary') {
      const items = loadCalibrationItems(arg ? { recordsDir: arg } : {});
      const s = summarize(items);
      console.log('total=' + s.total + ' unrefuted=' + s.unrefuted + ' refuted=' + s.refuted + ' subtle=' + s.subtle);
      process.exit(0);
    } else {
      console.error('usage: node lz-eval-parity-calibration-harness.mjs <materialize|pending|score|summary> [dir]');
      process.exit(2);
    }
  } catch (err) {
    const where = err && err.file ? ' (' + err.file + ')' : '';
    console.error('lz-eval-parity-calibration-harness: ' + (err && err.message ? err.message : String(err)) + where);
    process.exit(2);
  }
}
/* node:coverage enable */
