// ---------------------------------------------------------------------------
// lz-eval-parity-calibration-dispatch.mjs -- materialize one UID-FREE dispatch file per Stage-2
// calibration item, for the session to INLINE into each Opus judge sub-agent call.
//
// WHY UID-FREE (AMENDMENT RECORD 3, pre-registered): the Agent tool cannot restrict a spawned agent's
// tools, so the judge persona DOES have file tools while the WiCE gold labels sit on disk at
// eval/__fixtures__/wice-vendored/records/<uid>.json. Two mitigations were pre-registered: an emphatic
// no-tools / no-file-reads instruction, and withholding the uid so the judge is not handed the key that
// locates its own gold record. This script enforces the second one MECHANICALLY -- it throws if a uid
// pattern or any gold marker reaches an output file.
//
// The payload comes from the FROZEN buildJudgePayload (anti-leak: never the label, subtle flag, or
// supporting_sentences) and the prompt text is extracted VERBATIM from the sha256-pinned
// eval/lz-eval-parity-calibration-prompt.md -- never re-typed here, so the two cannot drift.
//
// Output goes OUTSIDE the repo (a scratch dir passed as argv[2]); dispatch files are transient.
// NO model call, NO network. Usage: node eval/lz-eval-parity-calibration-dispatch.mjs <outDir>
// ---------------------------------------------------------------------------
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { loadCalibrationItems, buildJudgePayload } from './lz-eval-parity-calibration-harness.mjs';

const HERE = path.dirname(url.fileURLToPath(import.meta.url));
const PROMPT_MD = path.join(HERE, 'lz-eval-parity-calibration-prompt.md');

// A uid ("dev00003-0") or any WiCE gold vocabulary reaching a dispatch file is a leak, not a nit.
const UID_PATTERN = /dev\d{5}-\d/;
const GOLD_MARKERS = /supporting_sentences|partially_supported|not_supported/;

export class DispatchError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DispatchError';
  }
}

// Pull the frozen prompt verbatim from between the fences under "## The frozen prompt". Extracting it
// (rather than duplicating it) means the dispatch cannot drift from the pinned prompt file.
export function extractFrozenPrompt(markdown) {
  const m = markdown.match(/## The frozen prompt[^\n]*\n+```\n([\s\S]*?)\n```/);

  if (!m) {
    throw new DispatchError('could not extract the frozen prompt block from the prompt file');
  }

  return m[1];
}

// Substitute the three presentation-contract placeholders. Every one MUST be consumed -- a surviving
// placeholder would ship the literal "<the claim text>" to a judge.
export function renderDispatch({ frozen, payload } = {}) {
  const context = payload.context && payload.context.trim() ? payload.context : '(none)';
  const body = frozen
    .replace('<the claim text>', payload.claim)
    .replace('<the claim_context, or "(none)">', context)
    .replace('<the evidence document>', payload.evidence);

  if (/<the claim text>|<the claim_context|<the evidence document>/.test(body)) {
    throw new DispatchError('a presentation-contract placeholder survived substitution');
  }

  if (UID_PATTERN.test(body)) {
    throw new DispatchError('a uid reached the dispatch body -- the judge must not be handed its gold key');
  }

  if (GOLD_MARKERS.test(body)) {
    throw new DispatchError('a WiCE gold marker reached the dispatch body (anti-leak)');
  }

  return body;
}

export function generateDispatch({ outDir, items = loadCalibrationItems() } = {}) {
  if (typeof outDir !== 'string' || outDir.length === 0) {
    throw new DispatchError('generateDispatch requires an outDir');
  }

  const frozen = extractFrozenPrompt(fs.readFileSync(PROMPT_MD, 'utf8'));
  fs.mkdirSync(outDir, { recursive: true });

  const map = items.map((item, i) => {
    const idx = String(i + 1).padStart(2, '0');
    const body = renderDispatch({ frozen, payload: buildJudgePayload(item) });
    fs.writeFileSync(path.join(outDir, 'item-' + idx + '.txt'), body, 'utf8');

    return { idx, uid: item.uid };
  });

  // The index -> uid map stays with the ORCHESTRATOR (it writes <uid>.verdict.json); it is never shown
  // to a judge.
  fs.writeFileSync(path.join(outDir, '_map.json'), JSON.stringify(map, null, 2), 'utf8');

  return map;
}

if (process.argv[1] && url.fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const outDir = process.argv[2];

  if (!outDir) {
    console.error('usage: node eval/lz-eval-parity-calibration-dispatch.mjs <outDir>');
    process.exit(2);
  }

  const map = generateDispatch({ outDir });
  console.log('wrote ' + map.length + ' uid-free dispatch files to ' + outDir);
}
