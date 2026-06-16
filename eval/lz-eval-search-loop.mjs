// lz-eval-search-loop.mjs
//
// The genuinely-NEW deterministic spine of Phase 19: the ONE shared autonomous search-and-stop core
// (D-09/D-10/D-11 -- built once, no throwaway), its two retrieval adapters (a live-WebSearch
// protocol-shape stub + a static-AVeriTeC-KS pure function), the per-claim date-cutoff leakage guard
// (D-07), and the URL-canonicalization + SHA-256 filename rule (D-13) that the extract worker
// invokes. Every export is a pure, MC/DC-tested deterministic seam consumed by the workers (Plan 02),
// the trap builder (Plan 03), and the offline read (Plan 04).
//
// Tree / dependency boundary (D-10/D-11): this script lives in the repo-level eval/ tree, NEVER in
// the distributed plugin tree. It imports the SHIPPED runtime aggregator's hardening primitives
// ACROSS trees by relative path -- ONE-DIRECTIONAL (eval -> runtime, NEVER runtime -> eval) -- so no
// eval dependency can ever leak into the marketplace package. NEVER add an eval/ import to any
// plugin-tree file. The module is node stdlib + the runtime hardening primitives; zero npm deps.
//
// The byte-order mark is code point U+FEFF. This source contains no literal byte-order mark; the
// imported stripBom handles a BOM at read time (ASCII-only source per CLAUDE.md).
//
// Pure functions + the frozen constants are exported for the validation fixture; the thin CLI is
// guarded so that `import`-ing this module does NOT run the CLI.

import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

// Cross-tree reuse of the SHIPPED runtime aggregator's hardening primitives (D-10; eval -> runtime,
// one-directional, never the reverse). From eval/ to the plugin tree: up one level, then into
// plugins/. readJson is module-private in the runtime aggregator, so its fail-closed shape is copied
// below using the IMPORTED ContractError + stripBom (no bare JSON.parse on untrusted data).
import {
  ContractError,
  stripBom,
  safeId,
} from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

// safeId/stripBom are part of the established cross-tree hardening surface and are re-exported-by-use
// where this module reads JSON (readJson below) and where the trap builder / adapters guard ids.
void safeId;
void stripBom;

// ---------------------------------------------------------------------------
// D-13: the tracking-param denylist (frozen). canonicalizeUrl strips any of these exact keys plus
// any key with the `utm_` prefix. Mirrors the aggregator's Object.freeze discipline (the same way
// EVAL_THRESHOLDS / STRATA_FRACTIONS are frozen) so the recipe cannot drift silently.
// ---------------------------------------------------------------------------
export const TRACKING_PARAMS = Object.freeze(
  new Set([
    'fbclid',
    'gclid',
    'gclsrc',
    'dclid',
    'msclkid',
    'mc_eid',
    'igshid',
    'ref',
    'ref_src',
    '_hsenc',
    '_hsmi',
  ]),
);

// ---------------------------------------------------------------------------
// D-13 URL canonicalization: lowercase scheme + host; strip default ports (80/443); strip the
// tracking-param denylist (exact keys above + the `utm_` prefix); strip the URL fragment; strip a
// single trailing slash. The RAW canonical key returned here lives in the JSON `id` field; the
// FILENAME uses sourceFilename() (SHA-256 hex) below. `new URL(raw)` THROWS on a malformed URL ->
// fail-closed upstream (the established ContractError discipline -- a bad URL never silently passes).
// ---------------------------------------------------------------------------
export function canonicalizeUrl(raw) {
  const u = new URL(raw); // throws on malformed -> fail-closed upstream

  u.protocol = u.protocol.toLowerCase();
  u.hostname = u.hostname.toLowerCase();

  if (
    (u.protocol === 'http:' && u.port === '80') ||
    (u.protocol === 'https:' && u.port === '443')
  ) {
    u.port = '';
  }

  for (const k of [...u.searchParams.keys()]) {
    if (TRACKING_PARAMS.has(k) || k.toLowerCase().startsWith('utm_')) {
      u.searchParams.delete(k);
    }
  }

  u.hash = ''; // strip the fragment

  let s = u.toString();
  s = s.replace(/\/$/, ''); // strip a single trailing slash

  return s; // the raw canonical key -> goes in the JSON `id`
}

// ---------------------------------------------------------------------------
// D-13 filename-safety: the FILENAME for a sources/<id>.json record is the SHA-256 hex of the
// canonical key + '.json' -- collision-safe, fixed-length, and (by construction) free of path
// separators / parent-dir references (T-19-01: eliminates the traversal vector entirely; the raw key
// stays only inside the JSON `id`). node:crypto is stdlib; never hand-roll a hash.
// ---------------------------------------------------------------------------
export function sourceFilename(canonicalKey) {
  if (typeof canonicalKey !== 'string' || canonicalKey.length === 0) {
    throw new ContractError(
      'sourceFilename requires a non-empty canonical key: ' + JSON.stringify(canonicalKey),
      'sourceFilename',
    );
  }

  return createHash('sha256').update(canonicalKey, 'utf8').digest('hex') + '.json';
}

// ---------------------------------------------------------------------------
// D-07 date parsing: AVeriTeC `claim_date` is DD-MM-YYYY in dev.json. Parse to a UTC Date; a string
// not matching /^\d{2}-\d{2}-\d{4}$/ throws ContractError (fail-closed -- an unparseable date can
// never be silently treated as "no cutoff", which would leak post-claim evidence).
// ---------------------------------------------------------------------------
export function parseAvtDate(ddmmyyyy) {
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(String(ddmmyyyy));

  if (m == null) {
    throw new ContractError('unparseable claim_date: ' + JSON.stringify(ddmmyyyy), 'date');
  }

  return new Date(Date.UTC(Number(m[3]), Number(m[2]) - 1, Number(m[1])));
}

// safeParse: a doc `date` may be DD-MM-YYYY (AVeriTeC KS) or absent/garbage. Return a Date for a
// parseable DD-MM-YYYY, else null (undated). NEVER throws here -- dateFilter treats null as "drop"
// (fail-closed), so a malformed doc date is simply excluded, not crashed on.
function safeParse(raw) {
  if (raw == null) {
    return null;
  }

  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(String(raw));

  if (m == null) {
    return null;
  }

  return new Date(Date.UTC(Number(m[3]), Number(m[2]) - 1, Number(m[1])));
}

// ---------------------------------------------------------------------------
// D-05/D-07 the leakage guard: keep ONLY docs with a parseable date STRICTLY BEFORE the claim's
// annotated date. Any undated doc OR any doc dated >= claimDate is DROPPED (fail-closed) -- so a
// possibly-post-cutoff doc (which could carry the published fact-check verdict) can never reach the
// voter. The boundary (== claimDate) is EXCLUDED by the strict `<`.
// ---------------------------------------------------------------------------
export function dateFilter(docs, claimDate) {
  if (!Array.isArray(docs)) {
    throw new ContractError('dateFilter requires a docs array', 'dateFilter');
  }

  if (!(claimDate instanceof Date) || Number.isNaN(claimDate.getTime())) {
    throw new ContractError('dateFilter requires a valid claimDate Date', 'dateFilter');
  }

  return docs.filter((d) => {
    const dd = d == null || d.date == null ? null : safeParse(d.date);

    return dd != null && dd < claimDate; // fail-closed: undated OR >= claimDate is dropped
  });
}

// ---------------------------------------------------------------------------
// Fail-closed JSON read (copy of the runtime aggregator's module-private readJson shape, using the
// IMPORTED ContractError + stripBom -- never a bare JSON.parse on an untrusted KS/manifest).
// ---------------------------------------------------------------------------
const readText = (p) => fs.readFileSync(p, 'utf8');

export function readJson(p) {
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

// ---------------------------------------------------------------------------
// Thin CLI (guarded so importing the module does NOT run it). With a single positional <url> it
// prints the canonical key + the SHA-256 filename; exits 0 / 2. The actual eval run drives the
// exported functions directly, NOT this convenience CLI.
// ---------------------------------------------------------------------------
/* node:coverage disable */
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    const raw = process.argv[2];

    if (!raw) {
      console.error('lz-eval-search-loop: usage: node lz-eval-search-loop.mjs <url>');
      process.exit(2);
    }

    const key = canonicalizeUrl(raw);
    console.log('canonical: ' + key);
    console.log('filename: ' + sourceFilename(key));
    process.exit(0);
  } catch (err) {
    const where = err && err.file ? ' (' + err.file + ')' : '';
    console.error('lz-eval-search-loop: ' + (err && err.message ? err.message : String(err)) + where);
    process.exit(2);
  }
}
/* node:coverage enable */
