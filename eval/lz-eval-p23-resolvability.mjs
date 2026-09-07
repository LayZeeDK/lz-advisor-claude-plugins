// lz-eval-p23-resolvability.mjs
//
// NET-NEW (Plan 23-03, Task 2; NO MODEL SPEND): the LIVE half of the ENV-04 citation audit -- link
// resolvability over identifiers extracted from model-authored report prose.
//
// WHY THIS IS A SEPARATE MODULE, WITH A SEPARATE ENTRY POINT AND A SEPARATE OUTPUT FILE (D-12 as
// REVISED 2026-09-07): verbatim-quote matching runs against STORED excerpts obtained under the D-17
// retention protocol; live re-fetch is used ONLY for link resolvability and is reported separately with
// its check date. One mixed function would make the WHOLE audit network-dependent and its artifact
// irreproducible. eval/lz-eval-p23-citation-audit.mjs never imports this file; this file consumes its
// canonical identifier set and nothing else.
//
// THE EVAL TREE'S FIRST OUTBOUND NETWORK SURFACE. No sibling module performs outbound HTTP, so these
// controls have no in-repo precedent to copy -- they are written from 23-RESEARCH's Security Domain
// (ASVS V12 Files & Resources) against T-23-05 (SSRF) and T-23-14 (denial of service):
//   - a frozen http-and-https-only scheme allowlist, checked BEFORE any request is made
//   - manual redirect handling, with the scheme RE-VALIDATED and the hop RE-COUNTED on every hop,
//     capped at MAX_REDIRECT_HOPS
//   - an abort signal and a raced deadline at TIMEOUT_MS
//   - a MAX_BYTES read cap after which the outcome is oversize rather than resolvable; reading STOPS
//     at the cap rather than buffering the whole body
//   - no credentials, no cookies, no authorization header, no referrer
//   - the response body is NEVER executed, NEVER persisted and NEVER returned: each record is an exact
//     five-key object
// Every identifier is treated as untrusted, because it came out of model-authored report prose.
//
// DOCUMENTED LIMITATION, carried into the ENV-04 record via the envelope's `limitation` field: this
// module does NOT distinguish a link that never existed from one that has since died. The published
// definition that draws that line -- "A hallucinated URL is a non-resolving URL for which no archived
// snapshot exists in the Wayback Machine at any point in time" [CITED: arXiv 2604.03173] -- requires a
// second third-party archive lookup. ENV-04 does not require the distinction, and adding a second
// network dependency to draw it would widen the surface for a nuance nothing here consumes. The
// omission is NAMED rather than left to make the resolvability column look stronger than it is. Link
// rot is expected, which is why `checkedAt` travels with the result.
//
// NOT A QUALITY MEASURE. Resolvability is whether a request came back, nothing more. It must never be
// worded as source quality (ENV-04 transparency prohibition).
//
// INJECTED TRANSPORT (the idiom eval/lz-eval-control-source.mjs already uses at its one fetch
// reference): fetchImpl, now and delay are all parameters, so the ENTIRE co-test runs against stubs and
// makes no real network request. The only live run in this phase is the Plan 23-03 Task 3 dry run,
// which is dated and reported separately.
//
// Tree / dependency boundary (D-10/D-11): repo-level eval/ dev tree only, NEVER the distributed plugin
// tree. It imports the SHIPPED runtime aggregator's ContractError ACROSS trees by relative path --
// ONE-DIRECTIONAL (eval -> runtime, never the reverse). No package is added.
//
// This source contains no literal byte-order mark and is strictly ASCII (per CLAUDE.md); LF endings.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ContractError } from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

// ---------------------------------------------------------------------------
// SCHEME_ALLOWLIST -- http and https ONLY, and it is an ALLOWLIST, not a denylist of bad schemes.
// A denylist cannot work: `file:`, `data:`, `blob:`, `gopher:` and whatever a URL parser accepts next
// are not a closed set, and one unlisted scheme is an SSRF (T-23-05). Checked BEFORE any request.
// ---------------------------------------------------------------------------
export const SCHEME_ALLOWLIST = Object.freeze(['http:', 'https:']);

// ---------------------------------------------------------------------------
// RESOLVE_LIMITS -- the frozen bounds. Each is boundary-proven in the co-test at the limit and one
// step either side, because a cap that is never tested at its own boundary is a cap on paper.
// ---------------------------------------------------------------------------
export const RESOLVE_LIMITS = Object.freeze({
  TIMEOUT_MS: 10000,
  MAX_BYTES: 262144,
  MAX_REDIRECT_HOPS: 3,
});

// ---------------------------------------------------------------------------
// RESOLVE_OUTCOMES -- the closed outcome vocabulary. `resolvable` means a request came back with a 2xx
// within every limit. It does NOT mean the source is good, relevant or correct.
// ---------------------------------------------------------------------------
export const RESOLVE_OUTCOMES = Object.freeze({
  RESOLVABLE: 'resolvable',
  DEAD: 'dead',
  OVERSIZE: 'oversize',
  TIMEOUT: 'timeout',
  SCHEME_BLOCKED: 'scheme-blocked',
  REDIRECT_LIMIT: 'redirect-limit',
  NETWORK_ERROR: 'network-error',
});

const LIMITATION =
  'Resolvability does NOT distinguish a link that never existed from one that has since died: that ' +
  'distinction requires a second third-party archive lookup (arXiv 2604.03173) which ENV-04 does not ' +
  'require and which would widen the network surface. Resolvability is also NOT a source-quality ' +
  'measure. Link rot is expected -- read every outcome as of checkedAt.';

const TIMED_OUT = Symbol('lz-eval-p23-resolvability/timed-out');

// The default deadline timer. Unreferenced so a pending timer cannot hold the event loop open once the
// fetch has won the race. Injected in the co-test so the frozen 10000 ms deadline can be proven
// without a ten-second test.
function defaultDelay(ms) {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);

    if (typeof timer.unref === 'function') {
      timer.unref();
    }
  });
}

// ---------------------------------------------------------------------------
// requestUrlFor(identifier) -- map ONE canonical identifier (the citation audit's output) or a raw URL
// to the URL that would be requested, or null when nothing http(s) can be derived.
//
// `arxiv:<id>` -> https://arxiv.org/abs/<id>; `doi:<id>` -> https://doi.org/<id>;
// `url:<host/path>` -> https://<host/path>; an explicit http(s) URL passes through. Anything else --
// including the audit's `raw:` bucket and any other scheme -- returns null and is recorded
// scheme-blocked WITHOUT a request. Fail-closed by construction.
// ---------------------------------------------------------------------------
function requestUrlFor(identifier) {
  if (identifier.startsWith('arxiv:')) {
    return 'https://arxiv.org/abs/' + identifier.slice('arxiv:'.length);
  }

  if (identifier.startsWith('doi:')) {
    return 'https://doi.org/' + identifier.slice('doi:'.length);
  }

  if (identifier.startsWith('url:')) {
    return 'https://' + identifier.slice('url:'.length);
  }

  if (/^https?:\/\//i.test(identifier)) {
    return identifier;
  }

  return null;
}

function allowedScheme(url) {
  try {
    return SCHEME_ALLOWLIST.includes(new URL(url).protocol);
  } catch {
    return false;
  }
}

// Count the response body's bytes up to the cap and STOP. The body is measured, never kept: nothing
// read here is returned, persisted or executed (T-23-05 / T-23-14).
async function overCap(body) {
  if (body === null || body === undefined) {
    return false;
  }

  if (typeof body === 'string') {
    return Buffer.byteLength(body, 'utf8') > RESOLVE_LIMITS.MAX_BYTES;
  }

  if (body instanceof Uint8Array) {
    return body.byteLength > RESOLVE_LIMITS.MAX_BYTES;
  }

  if (typeof body[Symbol.asyncIterator] !== 'function' && typeof body[Symbol.iterator] !== 'function') {
    return false;
  }

  let bytes = 0;

  for await (const chunk of body) {
    bytes += chunk instanceof Uint8Array ? chunk.byteLength : Buffer.byteLength(String(chunk), 'utf8');

    if (bytes > RESOLVE_LIMITS.MAX_BYTES) {
      // Reading STOPS at the cap -- the rest of the body is never pulled.
      return true;
    }
  }

  return false;
}

function locationOf(response) {
  const headers = response && response.headers;

  if (headers && typeof headers.get === 'function') {
    return headers.get('location');
  }

  return null;
}

// ---------------------------------------------------------------------------
// checkResolvability({ identifiers, fetchImpl, now, delay }) -- the dated resolvability envelope.
//
// Returns { checkedAt, limits, limitation, records }, where each record is EXACTLY
// { identifier, requestUrl, finalUrl, status, outcome }. The response body reaches none of them.
//
// `identifiers` must be an array of non-empty strings; anything else is a ContractError, because a
// silently skipped identifier would deflate the denominator of the resolvability breakdown.
// ---------------------------------------------------------------------------
export async function checkResolvability({ identifiers, fetchImpl, now = () => new Date(), delay = defaultDelay } = {}) {
  if (!Array.isArray(identifiers)) {
    throw new ContractError(
      'checkResolvability requires an identifiers array: ' + JSON.stringify(identifiers),
      'checkResolvability',
    );
  }

  if (typeof fetchImpl !== 'function') {
    throw new ContractError(
      'checkResolvability requires an INJECTED fetchImpl (a STUB in the unit suite, the global fetch in the live run)',
      'checkResolvability',
    );
  }

  for (const identifier of identifiers) {
    if (typeof identifier !== 'string' || identifier.trim().length === 0) {
      throw new ContractError(
        'checkResolvability requires every identifier to be a non-empty string: ' + JSON.stringify(identifier),
        'checkResolvability',
      );
    }
  }

  const records = [];

  for (const identifier of identifiers) {
    records.push(await checkOne({ identifier, fetchImpl, delay }));
  }

  return {
    checkedAt: now().toISOString(),
    limits: RESOLVE_LIMITS,
    limitation: LIMITATION,
    records,
  };
}

async function checkOne({ identifier, fetchImpl, delay }) {
  const requestUrl = requestUrlFor(identifier);

  const record = (finalUrl, status, outcome) => ({ identifier, requestUrl, finalUrl, status, outcome });

  if (requestUrl === null) {
    return record(null, null, RESOLVE_OUTCOMES.SCHEME_BLOCKED);
  }

  let url = requestUrl;
  let hops = 0;

  for (;;) {
    // Scheme validation happens BEFORE the request on EVERY hop, so a redirect target with a blocked
    // scheme is never fetched at all.
    if (!allowedScheme(url)) {
      return record(url, null, RESOLVE_OUTCOMES.SCHEME_BLOCKED);
    }

    const controller = new AbortController();
    let response;

    try {
      response = await Promise.race([
        fetchImpl(url, {
          method: 'GET',
          redirect: 'manual',
          credentials: 'omit',
          cache: 'no-store',
          referrerPolicy: 'no-referrer',
          headers: {},
          signal: controller.signal,
        }),
        delay(RESOLVE_LIMITS.TIMEOUT_MS).then(() => TIMED_OUT),
      ]);
    } catch (err) {
      if (err instanceof ContractError) {
        throw err;
      }

      return record(url, null, RESOLVE_OUTCOMES.NETWORK_ERROR);
    }

    if (response === TIMED_OUT) {
      controller.abort();

      return record(url, null, RESOLVE_OUTCOMES.TIMEOUT);
    }

    if (response === null || typeof response !== 'object' || typeof response.status !== 'number') {
      return record(url, null, RESOLVE_OUTCOMES.NETWORK_ERROR);
    }

    const status = response.status;
    const location = status >= 300 && status < 400 ? locationOf(response) : null;

    if (location) {
      hops += 1;

      if (hops > RESOLVE_LIMITS.MAX_REDIRECT_HOPS) {
        return record(url, status, RESOLVE_OUTCOMES.REDIRECT_LIMIT);
      }

      try {
        url = new URL(location, url).toString();
      } catch {
        return record(url, status, RESOLVE_OUTCOMES.SCHEME_BLOCKED);
      }

      continue;
    }

    if (status < 200 || status >= 300) {
      return record(url, status, RESOLVE_OUTCOMES.DEAD);
    }

    const tooBig = await overCap(response.body);

    return record(url, status, tooBig ? RESOLVE_OUTCOMES.OVERSIZE : RESOLVE_OUTCOMES.RESOLVABLE);
  }
}

// ---------------------------------------------------------------------------
// Thin CLI (guarded so importing the module does NOT run it).
//   node eval/lz-eval-p23-resolvability.mjs <identifiers.json> <out.json>
//
// <identifiers.json> is an array of canonical identifiers, or an object with an `identifiers` array.
// This is the ONE entry point that touches the network, and it writes the dated envelope to its OWN
// output file so the offline audit's artifact stays reproducible. Exit 2 on a ContractError.
// ---------------------------------------------------------------------------
/* node:coverage disable */
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const inputPath = process.argv[2];
  const outPath = process.argv[3];

  if (!inputPath || !fs.existsSync(inputPath) || !outPath) {
    console.error('lz-eval-p23-resolvability: usage <identifiers.json> <out.json>');
    process.exit(2);
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    const identifiers = Array.isArray(parsed) ? parsed : parsed && parsed.identifiers;

    if (typeof fetch !== 'function') {
      throw new ContractError('lz-eval-p23-resolvability: no global fetch on this runtime', 'cli');
    }

    const envelope = await checkResolvability({ identifiers, fetchImpl: (url, init) => fetch(url, init) });
    const tally = {};

    for (const rec of envelope.records) {
      tally[rec.outcome] = (tally[rec.outcome] || 0) + 1;
    }

    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(envelope, null, 2) + '\n', 'utf8');

    console.log(
      'checked=' +
        envelope.records.length +
        ' checkedAt=' +
        envelope.checkedAt +
        ' ' +
        Object.keys(tally)
          .sort()
          .map((key) => key + '=' + tally[key])
          .join(' '),
    );
    process.exit(0);
  } catch (err) {
    console.error('lz-eval-p23-resolvability: ' + (err && err.message ? err.message : String(err)));
    process.exit(2);
  }
}
/* node:coverage enable */
