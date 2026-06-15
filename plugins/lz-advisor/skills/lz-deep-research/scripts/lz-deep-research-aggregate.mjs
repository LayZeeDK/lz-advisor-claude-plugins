// lz-deep-research-aggregate.mjs
//
// Deterministic, off-model deep-research aggregator for the lz-advisor plugin.
// Zero external dependencies (Node stdlib only): node:fs, node:path, node:url.
//
// Hardened from the proven spike prototype (plans/_spike/aggregate-spike.mjs, spike A1 PASS).
// The proven core (NUMWORDS / norm / jaccard / quote re-check / merge / tally) is preserved;
// three extensions are added per the locked phase decisions:
//   - three-way quote outcome verified/downgraded/dropped (D-05), run UPSTREAM of vote tally (D-06)
//   - distinct-source corroboration as a LOWER bound (D-08/D-09)
//   - in-code ceiling enforcement with observable caps (D-10/D-11)
//
// All comparison runs through normalize() (number-word fold + BOM strip + CRLF/CR -> LF), so
// the substring/Jaccard tests are newline- and BOM-insensitive on Windows arm64 / Git Bash.
//
// The byte-order mark is U+FEFF. It appears in this source ONLY as the JS escape \uFEFF,
// never as a literal byte (ASCII-only source per CLAUDE.md).
//
// Pure functions + frozen CEILINGS are exported for the validation fixture (Plan 02); the thin
// CLI is guarded so that `import`-ing this module does NOT run the CLI.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Comparison primitive (PRESERVED from the spike; HARDENED with BOM + CRLF strip)
// ---------------------------------------------------------------------------

// PRESERVE verbatim from the spike: the number-word fold that lets "30%" and
// "thirty percent" normalize to the same token stream.
export const NUMWORDS = {
  zero: '0',
  one: '1',
  two: '2',
  three: '3',
  four: '4',
  five: '5',
  six: '6',
  seven: '7',
  eight: '8',
  nine: '9',
  ten: '10',
  twenty: '20',
  thirty: '30',
  forty: '40',
  fifty: '50',
  hundred: '100',
};

// The single comparison primitive. Used by BOTH jaccard and quoteOutcome, so normalization
// happens at comparison time (never only at read time): the JSON `quote` field and the `.txt`
// excerpt always flow through the SAME normalize() before any .includes() / token compare.
//
// HARDEN per D-04: strip a leading BOM and fold CRLF / lone CR to LF BEFORE lowercasing, so a
// CRLF-saved excerpt still matches an LF-captured quote (and vice versa) regardless of host.
export function normalize(s) {
  return String(s)
    .replace(/^\uFEFF/, '') // strip leading BOM (the escape U+FEFF, never a literal byte)
    .replace(/\r\n/g, '\n') // CRLF -> LF
    .replace(/\r/g, '\n') // lone CR -> LF
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .split(/\s+/)
    .map((w) => NUMWORDS[w] ?? w)
    .filter((w) => w && w !== 'percent')
    .join(' ')
    .trim();
}

// PRESERVE the spike's tokenizer + Jaccard. Merge threshold >= 0.6 is D-07-locked.
const toks = (s) => new Set(normalize(s).split(' ').filter(Boolean));

export function jaccard(a, b) {
  const A = toks(a);
  const B = toks(b);
  let inter = 0;

  for (const t of A) {
    if (B.has(t)) {
      inter += 1;
    }
  }

  const union = A.size + B.size - inter;

  return union === 0 ? 0 : inter / union;
}

// ---------------------------------------------------------------------------
// Ceilings (D-10): single frozen source of truth.
// ---------------------------------------------------------------------------
//
// ACTIVELY ENFORCED by this aggregator:
//   - MAX_VERIFY_CLAIMS: cap on ranked clusters carried into tally (applied AFTER ranking)
//   - VOTES_PER_CLAIM:   max vote seats read per claim (extra seats ignored, counted)
//   - SYNTH_CAP:         cap on the survivors output array
//
// CARRIED as the shared contract (enforced by the Phase-20 orchestrator at wave dispatch, NOT here):
//   - ANGLES:    number of decomposition angles / search waves
//   - MAX_FETCH: max distinct fetches per run
//
// The "~" in the prose decisions means "tunable default", not "fuzzy code": these are concrete
// integers because "enforced in code" requires a concrete number.
export const CEILINGS = Object.freeze({
  ANGLES: 5,
  MAX_FETCH: 15,
  MAX_VERIFY_CLAIMS: 24,
  VOTES_PER_CLAIM: 3,
  SYNTH_CAP: 20,
});

// ---------------------------------------------------------------------------
// Safety + IO helpers (zero-dep; explicit UTF-8; BOM-safe JSON.parse)
// ---------------------------------------------------------------------------

// A contract violation the CLI maps to a non-zero exit (D-03). Carries the offending file.
export class ContractError extends Error {
  constructor(message, file) {
    super(message);
    this.name = 'ContractError';
    this.file = file;
  }
}

// JSON.parse throws on a leading BOM; fs.readFileSync(p,'utf8') does NOT strip it. Strip first.
export function stripBom(s) {
  return typeof s === 'string' && s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}

// Path safety (V12 / T-16-01): treat a file-content-derived id (excerpt_id, worker id) as a
// BASENAME only. Reject anything containing a path separator or a parent-dir reference so a
// crafted id cannot traverse outside the run dir.
export function safeId(id) {
  if (typeof id !== 'string' || id.length === 0) {
    throw new ContractError('invalid id (expected non-empty string): ' + JSON.stringify(id));
  }

  if (/[\\/]/.test(id) || id === '.' || id === '..' || id.includes('..')) {
    throw new ContractError('unsafe id (path traversal rejected): ' + JSON.stringify(id));
  }

  return id;
}

const readText = (p) => fs.readFileSync(p, 'utf8');

function readJson(p) {
  let text;

  try {
    text = stripBom(readText(p));
  } catch (err) {
    throw new ContractError('cannot read file: ' + err.message, p);
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    throw new ContractError('malformed JSON: ' + err.message, p);
  }
}

// Sorted directory listing of *.json (Pitfall 1: readdirSync order is OS-dependent; sort for
// reproducibility / AGG-01). Returns [] when the subdir is absent.
function listJson(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort();
}

// ---------------------------------------------------------------------------
// Merge immutable per-worker claim files into corroboration clusters (D-08/D-09)
// ---------------------------------------------------------------------------
//
// PRESERVE the spike's dedup/corroboration loop. cluster.sources is a Set of DISTINCT source
// ids: cluster.sources.size is the corroboration count and a LOWER bound (two paraphrases from
// ONE source -> size 1, NOT 2). Keep the UNDER-merge bias (D-07): merge only at jaccard >= 0.6.
//
// runDir is a PARAMETER (not a module-level ROOT) so this is a pure function the test can call.
export function mergeClusters(runDir) {
  const claimsDir = path.join(runDir, 'claims');
  const files = listJson(claimsDir);
  const raw = [];

  for (const f of files) {
    const w = readJson(path.join(claimsDir, f));

    if (!w || !Array.isArray(w.claims)) {
      throw new ContractError('worker file missing claims[] array', path.join(claimsDir, f));
    }

    for (const c of w.claims) {
      raw.push({ ...c, source: w.source });
    }
  }

  const clusters = [];

  for (const c of raw) {
    const hit = clusters.find((cl) => jaccard(cl.text, c.text) >= 0.6);

    if (hit) {
      hit.members.push(c);
      hit.sources.add(c.source);
    } else {
      clusters.push({
        id: 'cluster' + clusters.length,
        text: c.text,
        members: [c],
        sources: new Set([c.source]),
      });
    }
  }

  return clusters;
}
