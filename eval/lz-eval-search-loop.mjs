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
// This source contains no literal byte-order mark and is strictly ASCII (per CLAUDE.md). JSON reads go
// through the shared lz-eval-readjson.mjs helper, which strips a BOM at read time.
//
// Pure functions + the frozen constants are exported for the validation fixture; the thin CLI is
// guarded so that `import`-ing this module does NOT run the CLI.

import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

// Cross-tree reuse of the SHIPPED runtime aggregator's ContractError (D-10; eval -> runtime,
// one-directional, never the reverse). From eval/ to the plugin tree: up one level, then into
// plugins/. The fail-closed JSON read lives in the shared lz-eval-readjson.mjs helper (F12).
import {
  ContractError,
} from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

// Shared fail-closed JSON read (Group-B F12 de-dup); re-exported to preserve the prior export surface.
import { readJson } from './lz-eval-readjson.mjs';
export { readJson };

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
    // Case-INSENSITIVE match (both arms): query-param keys vary in case in the wild (`FBCLID`, `Ref`,
    // `UTM_Source`), and a case-sensitive denylist would let an upper/mixed-case tracking param survive
    // -> two variants of one source would canonicalize to DIFFERENT keys -> different SHA-256 dedup
    // filenames (breaks the dedup invariant). The frozen TRACKING_PARAMS set is all-lowercase.
    if (TRACKING_PARAMS.has(k.toLowerCase()) || k.toLowerCase().startsWith('utm_')) {
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

  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  const d = new Date(Date.UTC(year, month - 1, day));

  // Range-check via UTC round-trip: a shape-valid but out-of-range date (e.g. 99-99-2020, 31-02-2020,
  // 00-00-2020) would SILENTLY ROLL OVER into a different month/day rather than fail. A real calendar
  // date round-trips its UTC fields unchanged; a mismatch means the components do not form a real date
  // -> fail closed (an out-of-range date must never be silently treated as a valid cutoff).
  if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) {
    throw new ContractError('out-of-range claim_date (components do not form a real date): ' + JSON.stringify(ddmmyyyy), 'date');
  }

  return d;
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

  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  const d = new Date(Date.UTC(year, month - 1, day));

  // An out-of-range (rolled-over) doc date is treated as undated (null) -- dateFilter drops it fail-
  // closed, same as a missing date. A bogus "99-99-2020" can never masquerade as an in-window date.
  if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) {
    return null;
  }

  return d;
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
// D-09/D-10 the pre-registered mechanical search-minimum defaults (frozen, anti-drift). These are
// the OQ-2 pre-registered floor: at least 3 distinct queries (at least one disconfirming) and at
// least 5 distinct in-window docs explored BEFORE an uphold is permitted. The Plan-04 Sonnet
// calibrator may only TIGHTEN them (raise N/M), never loosen -- the frozen floor is the
// anti-loosening anchor. maxQueries is the exhaustion bound. Mirrors the Object.freeze discipline of
// EVAL_THRESHOLDS / STRATA_FRACTIONS so the minimums cannot drift silently.
// ---------------------------------------------------------------------------
export const SEARCH_DEFAULTS = Object.freeze({
  minQueries: 3,
  minDocs: 5,
  maxQueries: 8,
});

// ---------------------------------------------------------------------------
// D-09 the static-AVeriTeC-KS retrieval adapter (the offline / Flow-B binding). A PURE function over
// the cached KS: fetchResults(query) returns ONLY the docs for THIS claim, date-filtered to strictly
// pre-cutoff via dateFilter (the leakage seam, D-07). The query argument is accepted for signature
// parity with the live adapter; the static KS is the fixed per-claim doc set (the model's
// query-formulation is exercised agent-side, not in this deterministic seam). The date filter is the
// ONLY thing that differs from the live binding -- everything else (minimums, stop rule, trace) is
// adapter-agnostic in searchAndStop.
// ---------------------------------------------------------------------------
export function staticKsAdapter(ksByClaim, claimId, claimDate) {
  if (ksByClaim == null || typeof ksByClaim !== 'object') {
    throw new ContractError('staticKsAdapter requires a ksByClaim object', 'staticKsAdapter');
  }

  const docs = Array.isArray(ksByClaim[claimId]) ? ksByClaim[claimId] : [];
  const filtered = dateFilter(docs, claimDate);

  return {
    // eslint-disable-next-line no-unused-vars -- `query` is accepted for signature parity (live binding).
    fetchResults(query) {
      // The static KS is the fixed pre-cutoff doc set for this claim; return a fresh array so a
      // caller cannot mutate the adapter's backing store.
      return filtered.slice();
    },
  };
}

// ---------------------------------------------------------------------------
// D-09 the live-WebSearch retrieval adapter SHAPE STUB (the production / Flow-A binding). The
// PRODUCTION binding is realized AGENT-SIDE: the model executes the WebSearch tool and the harness
// shapes results into the same { url, snippet, date|null } records. This stub documents the seam
// (RESEARCH A4): it exposes the identical fetchResults signature so the searchAndStop core is
// adapter-agnostic; it is NOT executed in the eval (the eval drives the static-KS adapter only --
// live web for the eval is forbidden by D-05/D-07). A real WebSearch executor is injectable.
// ---------------------------------------------------------------------------
export function liveWebSearchAdapter(executor) {
  return {
    fetchResults(query) {
      if (typeof executor !== 'function') {
        // Not bound in the deterministic eval -- the agent realizes this at runtime. Fail loud if a
        // caller attempts to actually fetch through the stub (never silently return []).
        throw new ContractError(
          'liveWebSearchAdapter is a protocol-shape stub: bind an executor (the agent realizes ' +
            'WebSearch at runtime). The eval drives the static-KS adapter, never live web (D-05/D-07).',
          'liveWebSearchAdapter',
        );
      }

      return executor(query);
    },
  };
}

// hasDecisiveEvidence: a results set is DECISIVE when it carries an explicitly decisive doc (one
// flagged `decisive` with a judgeable `verdict`). Deterministic + injectable-free; the agent-side
// loop realizes the equivalent judgement, the eval driver tests this exact mechanic.
function hasDecisiveEvidence(results) {
  return results.some((r) => r != null && r.decisive === true && typeof r.verdict === 'string');
}

// judge: derive the verdict from the first decisive doc (the loop only calls this once
// hasDecisiveEvidence is true). Deterministic.
function judge(results) {
  const decisive = results.find((r) => r != null && r.decisive === true && typeof r.verdict === 'string');

  return decisive ? decisive.verdict : 'refuted-default';
}

// ---------------------------------------------------------------------------
// D-09/D-10/D-11 the ONE shared autonomous search-and-stop spine (built once, no throwaway -- the
// same core the offline read drives now and the Phase-20 live shadow/canary reuse). The retrieval
// ADAPTER is the ONLY swappable line; query-formulation cadence, the mechanical search-minimum
// guard, the stop decision, and the per-vote search trace are IDENTICAL across both backends.
//
// The mechanical-minimum guard is LOAD-BEARING (D-10): the loop CANNOT return an uphold-equivalent
// verdict before BOTH minQueries AND minDocs are met. Outcomes:
//   - minimums unmet at maxQueries           -> { verdict: 'insufficient',     stop_reason: 'min-not-met' }
//   - minimums met + decisive evidence        -> { verdict: judge(results),     stop_reason: 'decisive-evidence' }
//   - minimums met, exhausted, none decisive  -> { verdict: 'refuted-default',  stop_reason: 'exhausted' }
// The trace { queries:[], depth, stop_reason } makes a null Haiku-vs-Sonnet delta diagnosable as
// genuine parity vs both-stopped-early (the saturation artifact).
// ---------------------------------------------------------------------------
export function searchAndStop({
  claim,
  attackMode,
  adapter,
  minQueries = SEARCH_DEFAULTS.minQueries,
  minDocs = SEARCH_DEFAULTS.minDocs,
  maxQueries = SEARCH_DEFAULTS.maxQueries,
} = {}) {
  if (claim == null || typeof claim !== 'object') {
    throw new ContractError('searchAndStop requires a claim object', 'searchAndStop');
  }

  if (adapter == null || typeof adapter.fetchResults !== 'function') {
    throw new ContractError('searchAndStop requires an adapter with fetchResults()', 'searchAndStop');
  }

  // Positive-integer floor (anti-bypass): minQueries / minDocs / maxQueries must each be a positive
  // integer. This fails closed on the pathological { minQueries: 0, minDocs: 0 } case -- which would
  // make `q+1 >= 0 && docsSeen >= 0` trivially true and permit an uphold-equivalent stop with NO
  // search at all -- and on negative / non-integer inputs. The frozen SEARCH_DEFAULTS remain the
  // pre-registered floor, and the "tighten-only, never loosen" rule is enforced at the production
  // binding (the calibrator); the suite legitimately drives sub-floor-but-positive minimums, so this
  // primitive forbids only the <= 0 / non-integer degenerate cases.
  for (const [name, val] of [['minQueries', minQueries], ['minDocs', minDocs], ['maxQueries', maxQueries]]) {
    if (!Number.isInteger(val) || val < 1) {
      throw new ContractError('searchAndStop requires a positive integer ' + name + ': ' + JSON.stringify(val), 'searchAndStop');
    }
  }

  const trace = { queries: [], depth: 0, stop_reason: null };
  // depth = the cumulative count of docs explored across queries (the RESEARCH-drafted protocol:
  // `docsSeen += results.length`). The minDocs floor is "at least M docs EXPLORED", not "M distinct
  // urls" -- the agent-side loop counts retrieval effort, and re-encountering a doc is still effort.
  let docsSeen = 0;
  // The running doc POOL: decisiveness and the verdict are judged over ALL docs seen across queries,
  // not just the current batch. A decisive doc surfaced in an EARLY query (before the minimums are
  // met) must NOT be forgotten by the time the minimums ARE met. Latent under the fixed-return static
  // adapter (every batch is identical), but a real correctness defect on the Phase-20 live binding the
  // line-253 comment commits this core to -- there per-query results vary, so a batch-only check would
  // silently drop an early decisive doc and exhaust to refuted-default.
  const pool = [];

  for (let q = 0; q < maxQueries; q += 1) {
    // The disconfirming-query formulation cue is deterministic (search the negation, vary per round);
    // the model executes it agent-side. Here it is a recorded protocol step for the trace.
    const query = formulateDisconfirmingQuery(claim, attackMode, q);
    const results = adapter.fetchResults(query);
    trace.queries.push(query);
    docsSeen += results.length;
    trace.depth = docsSeen;

    for (const r of results) {
      pool.push(r);
    }

    // The mechanical-minimum guard: an uphold-equivalent (decisive) stop is permitted ONLY once BOTH
    // minimums are met. q + 1 is the number of queries issued so far. Decisiveness + the verdict are
    // judged over the accumulated POOL so an early decisive doc is retained, not the current batch.
    if (q + 1 >= minQueries && docsSeen >= minDocs && hasDecisiveEvidence(pool)) {
      trace.stop_reason = 'decisive-evidence';

      return { verdict: judge(pool), trace };
    }
  }

  // Exhausted maxQueries. If the minimums were met we return the refuted-default (never a lazy
  // default-uphold); if they were not met we return 'insufficient' (the early-uphold block).
  if (trace.depth >= minDocs) {
    trace.stop_reason = 'exhausted';

    return { verdict: 'refuted-default', trace };
  }

  trace.stop_reason = 'min-not-met';

  return { verdict: 'insufficient', trace };
}

// formulateDisconfirmingQuery: the shared deterministic query-formulation cue. Round 0 targets the
// claim's negation; later rounds vary the angle. The eval records the cue string in the trace; the
// agent realizes the actual WebSearch. Deterministic + pure.
function formulateDisconfirmingQuery(claim, attackMode, round) {
  const base = typeof claim.text === 'string' && claim.text.length > 0 ? claim.text : String(claim.id || 'claim');
  const mode = typeof attackMode === 'string' && attackMode.length > 0 ? attackMode : 'disconfirm';

  return mode + ':r' + round + ':' + base;
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
