// lz-eval-traps.mjs
//
// The OFFLINE known-gold TRAP-CONSTRUCTION recipe + validity / leakage gates (Plan 19-03, Task 1;
// EVAL-01). This is the genuinely-open research surface of Phase 19: it mutates EXISTING
// AVeriTeC-dev seeds (no hand-authoring) into the three RETRIEVAL-DIFFICULTY strata -- buried /
// evidence-absent / date-sensitive -- so the offline Haiku-vs-Sonnet gating read stresses RETRIEVAL
// ORCHESTRATION (the only untested, non-saturated axis), NEVER claim subtlety (the subtlety axis is
// empirically proven saturated: Haiku 0/30 == Sonnet 0/30). 19-RESEARCH.md "The Trap-Set
// Construction Methodology" (lines 319-360) is authoritative.
//
// What it exports (all pure / deterministic, MC/DC-tested):
//   - TRANSFORM_CLASSES + mutateOverreach: the one-step-overreach recipe (scope/causation/magnitude/
//     certainty) applied to an AVeriTeC-Supported seed so the gold flips to refuted. The recipe is a
//     deterministic STRING transform CLASS + seed; the actual mutation prose is produced by a
//     generator OUTSIDE the voter families (A3) -- the recipe records the transform class + seed,
//     NOT a hand-written claim.
//   - classifySeed: the OQ-3 mechanical classifier -- a seed with a pre-cutoff in-corpus disconfirmer
//     ranked deep behind distractors -> buried; one without -> evidence-absent.
//   - validityGate: the deliberately-weak-verifier difficulty anchor (family-neutral) -- accept a
//     trap ONLY if a weak reference verifier wrongly upholds it.
//   - leakageProbe: the GATING OQ-1 screen (A1, LOAD-BEARING) -- after the date filter +
//     fact_checking_article / cached_original_claim_url URL exclusion, returns { clean:true } ONLY if
//     NO surviving doc carries a post-cutoff published verdict. This BLOCKS the manifest lock
//     (Task 2): a leaky KS ESCALATES to the user; the CLI exits 2.
//   - writeTrap: emits mutated CC-BY-NC text ONLY under the gitignored eval/.cache/ and the manifest
//     row metadata (uid + remapped label + stratum + recipe/seed + sha256) with NO `text` field.
//   - verifySha256: the corpus-integrity guard (T-19-09), reused from the dataset loader's shape.
//
// Tree / dependency boundary (D-10/D-11): this script lives in the repo-level eval/ tree, NEVER in
// the distributed plugin tree. It imports the SHIPPED runtime aggregator's hardening primitives
// ACROSS trees by relative path -- ONE-DIRECTIONAL (eval -> runtime, NEVER runtime -> eval) -- so no
// eval dependency can ever leak into the marketplace package. NEVER add an eval/ import to any
// plugin-tree file. The module is node stdlib + the runtime hardening primitives + the date filter
// reused from lz-eval-search-loop.mjs (Plan 19-01); zero npm deps.
//
// LICENSE COMPLIANCE (D-07 / Pitfall 5): AVeriTeC (CC-BY-NC) mutated derivatives are FETCH-/
// CONSTRUCT-ONLY: writeTrap writes the mutated text into the gitignored eval/.cache/ at construction
// time, and the committed manifest carries ONLY uids + remapped labels + a pinned revision + sha256 +
// the mutation recipe/seed -- never the NonCommercial text. The drift gate asserts no `text` field on
// any AVeriTeC row.
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

// Reuse the Plan-19-01 date primitives (the leakage seam): parseAvtDate (DD-MM-YYYY, fail-closed) +
// dateFilter (drop undated OR >= claimDate). One-directional within the eval tree.
import { parseAvtDate, dateFilter } from './lz-eval-search-loop.mjs';

// Shared fail-closed JSON read (Group-B F12 de-dup); re-exported to preserve the prior export surface.
import { readJson } from './lz-eval-readjson.mjs';
export { readJson };

// safeId / stripBom are part of the established cross-tree hardening surface; referenced below where
// the writer guards a content-derived basename and where the KS loader strips a BOM.
void safeId;
void stripBom;

// ---------------------------------------------------------------------------
// The one-step-overreach transform CLASSES (frozen, anti-drift). A one-step overreach takes a
// Supported claim and pushes a SINGLE dimension past what the evidence supports (scope / causation /
// magnitude / certainty), so the resulting claim is unsupported -> the gold flips to refuted. The
// recipe records the class + a deterministic seed; the mutation PROSE is generated OUTSIDE the voter
// families (A3) and never hand-authored here. Mirrors EVAL_THRESHOLDS' Object.freeze discipline.
// ---------------------------------------------------------------------------
export const TRANSFORM_CLASSES = Object.freeze(['scope', 'causation', 'magnitude', 'certainty']);

// ---------------------------------------------------------------------------
// mutateOverreach: record a one-step-overreach trap over an AVeriTeC-Supported seed. The seed MUST be
// label 'Supported' (a one-step overreach is defined ON a supported claim). Returns the trap-row
// metadata: uid_seed + the flipped gold (refuted) + the recipe { transform, seed } -- NEVER the
// mutated prose (recipe-not-text, D-07). Fails closed on a non-Supported seed or an unknown
// transform class (so a tautological "always refuted" row can never be produced silently).
// ---------------------------------------------------------------------------
export function mutateOverreach(seed, { transform, seed: mutationSeed } = {}) {
  if (seed == null || typeof seed !== 'object') {
    throw new ContractError('mutateOverreach requires a seed object', 'mutateOverreach');
  }

  if (seed.label !== 'Supported') {
    throw new ContractError(
      'mutateOverreach requires a Supported seed (a one-step overreach makes a supported claim ' +
        'unsupported): got label ' + JSON.stringify(seed.label),
      'mutateOverreach',
    );
  }

  if (!TRANSFORM_CLASSES.includes(transform)) {
    throw new ContractError(
      'unknown transform class (expected one of ' + TRANSFORM_CLASSES.join('|') + '): ' + JSON.stringify(transform),
      'mutateOverreach',
    );
  }

  if (!Number.isInteger(mutationSeed)) {
    throw new ContractError('mutateOverreach requires an integer recipe seed: ' + JSON.stringify(mutationSeed), 'mutateOverreach');
  }

  return {
    uid_seed: seed.claim_id,
    // The overreach makes a SUPPORTED claim unsupported -> the gold flips to refuted (the overreach
    // is unsupported). This is the gold-by-construction guarantee (generator-neutral).
    expected_verdict: 'refuted',
    recipe: Object.freeze({ transform, seed: mutationSeed, source_label: 'Supported' }),
    // NO `text` field: the committed row carries the recipe + uid only. The mutated prose is produced
    // by the out-of-family generator and lives only in the gitignored cache (writeTrap).
  };
}

// ---------------------------------------------------------------------------
// classifySeed (OQ-3): mechanically classify a candidate seed's KS as `buried` (a decisive
// pre-cutoff in-corpus disconfirmer exists, ranked DEEP behind distractors) or `evidence-absent`
// (no in-window in-corpus disconfirmer). A disconfirmer doc is one flagged `disconfirmer:true`.
// Only PRE-CUTOFF disconfirmers count: a post-cutoff disconfirmer is excluded (the date cutoff /
// leakage rule -- it would leak future evidence) and therefore cannot make a seed `buried`.
//
// "Ranked deep" = its index in the (date-screened) KS is at or beyond BURIED_RANK_FLOOR. A
// disconfirmer that sits at the top of the KS is too easy to find -> not a discriminating buried
// trap (still classified buried if a disconfirmer exists, but disconfirmer_rank surfaces the depth
// so the calibrator can harden a shallow one). The returned disconfirmer_rank is the rank within the
// FULL KS (so the depth the voter must dig is visible).
// ---------------------------------------------------------------------------
export const BURIED_RANK_FLOOR = 20;

export function classifySeed({ ks, claimDate } = {}) {
  if (!Array.isArray(ks)) {
    throw new ContractError('classifySeed requires a ks array', 'classifySeed');
  }

  const cd = parseAvtDate(claimDate); // fail-closed on a malformed claim_date

  // Find the first in-corpus disconfirmer that survives the date cutoff (undated OR >= claimDate is
  // excluded -- a possibly-post-cutoff doc cannot count as an in-window disconfirmer). We walk the KS
  // in its original ranking so the rank reflects retrieval depth.
  let disconfirmerRank = -1;

  for (let i = 0; i < ks.length; i += 1) {
    const d = ks[i];

    if (d == null || d.disconfirmer !== true) {
      continue;
    }

    // A disconfirmer must be DATED and strictly pre-cutoff to be in-window (the leakage rule). An
    // undated disconfirmer is excluded (fail-closed) -- it cannot be proven pre-cutoff.
    const surviving = dateFilter([d], cd);

    if (surviving.length === 1) {
      disconfirmerRank = i;
      break;
    }
  }

  if (disconfirmerRank >= 0) {
    return Object.freeze({ stratum: 'buried', disconfirmer_rank: disconfirmerRank, buried_deep: disconfirmerRank >= BURIED_RANK_FLOOR });
  }

  return Object.freeze({ stratum: 'evidence-absent', disconfirmer_rank: -1, buried_deep: false });
}

// ---------------------------------------------------------------------------
// validityGate (the deliberately-weak-verifier difficulty anchor): accept a trap into the set ONLY if
// a deliberately-weak REFERENCE verifier FLIPS on it -- i.e. the weak verifier wrongly UPHOLDS a
// refuted-gold trap (returns unrefuted on refuted). A trap the weak verifier already catches
// (correctly refutes) is too easy to discriminate the tiers and is rejected. This is the
// family-neutral difficulty anchor (it does not use the Haiku/Sonnet voters).
// ---------------------------------------------------------------------------
export function validityGate({ expected_verdict, weakVerifierVerdict } = {}) {
  if (expected_verdict !== 'refuted' && expected_verdict !== 'unrefuted') {
    throw new ContractError(
      'validityGate requires expected_verdict in {refuted,unrefuted}: ' + JSON.stringify(expected_verdict),
      'validityGate',
    );
  }

  if (weakVerifierVerdict !== 'refuted' && weakVerifierVerdict !== 'unrefuted') {
    throw new ContractError(
      'validityGate requires weakVerifierVerdict in {refuted,unrefuted}: ' + JSON.stringify(weakVerifierVerdict),
      'validityGate',
    );
  }

  // The weak verifier FLIPS (is fooled) when its verdict != the gold. A flipped weak verifier means
  // the trap is hard enough to discriminate -> accept. A weak verifier that matches the gold catches
  // the trap -> reject (too easy).
  const weakVerifierFlips = weakVerifierVerdict !== expected_verdict;

  return Object.freeze({ accepted: weakVerifierFlips, reason: weakVerifierFlips ? 'weak-verifier-flipped' : 'weak-verifier-caught' });
}

// ---------------------------------------------------------------------------
// leakageProbe (OQ-1, A1, LOAD-BEARING): the GATING screen that BLOCKS the manifest lock (Task 2).
// SCREEN-THEN-CHECK semantics (the plan's literal wording: "after applying dateFilter + EXCLUDING
// fact_checking_article / cached_original_claim_url URLs FROM THE KS, it returns {clean:true} only
// if NO surviving doc carries a post-cutoff published verdict (no fact-check-article URL survives
// in-window, no cached-original-claim URL appears, no doc dated >= claim_date survives)"). Per seed:
//   1) SCREEN (remove) any KS doc whose URL EXACT-MATCHES one of the seed's OWN declared leak
//      vectors -- fact_checking_article (THIS claim's published verdict; post-claim by construction),
//      cached_original_claim_url / original_claim_url (the archived CLAIM SOURCE, dated AT the claim,
//      not a verdict -- excluded as conservative defense-in-depth). Removing these is the screen, NOT
//      a leak to escalate. "fact-check-article URL" in the spec means THIS seed's OWN declared field,
//      caught here by exact match -- NOT the fact-checking genre. A generic/unrelated fact-check site
//      elsewhere in the dense web-crawl KS (e.g. a 2016 article on a different topic) is ordinary
//      evidence, never a leak of THIS claim's gold (flagging the genre would falsely escalate nearly
//      every claim -- verified: 9/10 dev seeds carry an unrelated fact-check site in their KS).
//   2) Over the SCREENED residue, report a leak ONLY if a DATED doc dated >= claim_date survives the
//      screen (the date arm -- a doc that could carry a post-cutoff published verdict). The revised-
//      2.0 AVeriTeC KS already removed each claim's own post-claim fact-check (the 2024-11-15 fix);
//      the date arm catches any dated post-cutoff doc in the date-sensitive stratum or a future
//      dated revised-KS doc. (The dev KS docs are UNDATED, so on dev the date arm is inert and the
//      screen reduces to exact-URL exclusion -- verified: 0 dev KS docs carry a date.)
//
// Returns { clean:true, leaks:[] } when the whole seed set screens clean; otherwise
// { clean:false, leaks:[{ claim_id, url, reason }] }. A leaky result ESCALATES to the user (the CLI
// exits 2) -- the manifest lock NEVER proceeds on a leaky KS (D-07 / Pitfall 2 / A1).
// ---------------------------------------------------------------------------
function normalizeUrlForCompare(u) {
  // Compare URLs by host (www. dropped) + path (lowercased, no trailing slash), dropping
  // scheme/query/fragment, so trailing-slash / www / case / scheme / query variants of the SAME URL
  // match the exact-screen. KNOWN LIMITATION (do not overstate): this does NOT unwrap an
  // archive-wrapper prefix -- a web.archive.org-wrapped copy has a DIFFERENT host+path and will NOT
  // match the bare KS URL; the date arm (post-cutoff drop) is the backstop for an archived post-cutoff
  // copy. Fail-soft to the raw string on a malformed URL (a malformed URL never silently "matches").
  try {
    const x = new URL(String(u));

    return x.hostname.toLowerCase().replace(/^www\./, '') + x.pathname.toLowerCase().replace(/\/+$/, '');
  } catch {
    return String(u);
  }
}

export function leakageProbe(seeds, ksByClaim) {
  if (!Array.isArray(seeds)) {
    throw new ContractError('leakageProbe requires a seeds array', 'leakageProbe');
  }

  if (ksByClaim == null || typeof ksByClaim !== 'object') {
    throw new ContractError('leakageProbe requires a ksByClaim object', 'leakageProbe');
  }

  const leaks = [];

  for (const seed of seeds) {
    if (seed == null || typeof seed !== 'object') {
      throw new ContractError('leakageProbe seed must be an object: ' + JSON.stringify(seed), 'leakageProbe');
    }

    const id = seed.claim_id;
    const cd = parseAvtDate(seed.claim_date); // fail-closed on a malformed date
    const ks = Array.isArray(ksByClaim[id]) ? ksByClaim[id] : [];

    // The seed's OWN declared leak-vector URLs -- the screen REMOVES any KS doc matching one of
    // these (the published fact-check, the cached/original claim source). Their presence in the raw
    // KS is HANDLED by the screen, never escalated.
    const screened = new Set();

    for (const field of ['fact_checking_article', 'cached_original_claim_url', 'original_claim_url']) {
      const v = seed[field];

      if (typeof v === 'string' && v.length > 0) {
        screened.add(normalizeUrlForCompare(v));
      }
    }

    for (const d of ks) {
      if (d == null || typeof d.url !== 'string') {
        continue;
      }

      const u = normalizeUrlForCompare(d.url);

      // STEP 1 -- SCREEN: a doc matching one of the seed's declared leak URLs is REMOVED by the
      // screen. Skip it; it never reaches the voter and is NOT a residual leak.
      if (screened.has(u)) {
        continue;
      }

      // STEP 2 -- DATE arm: a DATED doc dated >= claim_date is a post-cutoff leak that survives the
      // screen. dateFilter KEEPS only strictly-pre-cutoff dated docs; a dated doc that is NOT kept is
      // a leak. Undated docs are not flagged (they carry no provable post-cutoff verdict and are
      // dropped at retrieval time by the production dateFilter).
      if (d.date != null) {
        const kept = dateFilter([d], cd);

        if (kept.length === 0) {
          leaks.push({ claim_id: id, url: d.url, reason: 'post-cutoff date (>= claim_date) survives screen' });
        }
      }
    }
  }

  return { clean: leaks.length === 0, leaks };
}

// ---------------------------------------------------------------------------
// D-04 / T-19-09: integrity verify (copy of the dataset loader's verifySha256 shape using the
// IMPORTED ContractError). Recompute sha256 over the cached mutated bytes and compare to the
// recorded value, failing CLOSED on mismatch and naming the file -- so a tampered cache body fails
// LOUDLY, never silently "verifies". Returns the computed digest on success.
// ---------------------------------------------------------------------------
export function verifySha256(buf, expectedSha, file) {
  if (typeof expectedSha !== 'string' || !/^[0-9a-f]{64}$/.test(expectedSha)) {
    throw new ContractError('invalid expected sha256 (expected 64 hex chars): ' + JSON.stringify(expectedSha), file);
  }

  // Guard buf so createHash().update(null/undefined) cannot throw a NATIVE TypeError -- that would
  // break the ContractError-with-.file discipline (mirrors the dataset-loader verifySha256 guard).
  if (!Buffer.isBuffer(buf) && typeof buf !== 'string') {
    throw new ContractError('verifySha256 requires a Buffer or string buf', file);
  }

  const got = createHash('sha256').update(buf).digest('hex');

  if (got !== expectedSha) {
    throw new ContractError('checksum mismatch for ' + file + ': expected ' + expectedSha + ' got ' + got, file);
  }

  return got;
}

// ---------------------------------------------------------------------------
// writeTrap: write the mutated CC-BY-NC trap text to the gitignored cache ONLY and return the
// committed manifest-row metadata (uid + remapped label + stratum + recipe/seed + sha256) with NO
// `text` field (D-07 / Pitfall 5). The cache basename is safeId-guarded (T-19-PATHTRAV) so a
// content-derived uid cannot traverse. The returned row is what the manifest carries; the mutated
// prose stays on disk under the cache dir, never in git.
// ---------------------------------------------------------------------------
export function writeTrap(trap, { cacheDir } = {}) {
  if (trap == null || typeof trap !== 'object') {
    throw new ContractError('writeTrap requires a trap object', 'writeTrap');
  }

  if (typeof cacheDir !== 'string' || cacheDir.length === 0) {
    throw new ContractError('writeTrap requires a cacheDir (gitignored eval/.cache/)', 'writeTrap');
  }

  for (const k of ['uid', 'expected_verdict', 'stratum']) {
    if (typeof trap[k] !== 'string' || trap[k].length === 0) {
      throw new ContractError('writeTrap trap missing non-empty ' + k, 'writeTrap');
    }
  }

  if (typeof trap.mutatedText !== 'string' || trap.mutatedText.length === 0) {
    throw new ContractError('writeTrap requires the mutatedText (written to the cache, never committed)', 'writeTrap');
  }

  if (trap.expected_verdict !== 'refuted' && trap.expected_verdict !== 'unrefuted') {
    throw new ContractError('writeTrap expected_verdict must be in {refuted,unrefuted}: ' + JSON.stringify(trap.expected_verdict), 'writeTrap');
  }

  // Basename-only, traversal-rejected (the uid is content-derived).
  const base = safeId(trap.uid, 'writeTrap') + '.txt';
  fs.mkdirSync(cacheDir, { recursive: true });
  const cachePath = path.join(cacheDir, base);
  fs.writeFileSync(cachePath, trap.mutatedText, 'utf8');

  const sha256 = createHash('sha256').update(Buffer.from(trap.mutatedText, 'utf8')).digest('hex');

  // The committed manifest row: uid + remapped label + stratum + recipe/seed + sha256. NEVER a
  // `text` field (the drift gate asserts this). The recipe is the method, not the NC prose.
  const row = {
    uid: trap.uid,
    source: 'averitec',
    source_label: trap.recipe && trap.recipe.source_label ? trap.recipe.source_label : 'Supported',
    stratum: trap.stratum,
    book: 'open',
    expected_verdict: trap.expected_verdict,
    recipe: trap.recipe ? { ...trap.recipe } : null,
    sha256,
  };

  return { row, cachePath, sha256 };
}

// ---------------------------------------------------------------------------
// readText: raw UTF-8 read used by loadDevSeedsAndKs (the KS is JSONL, parsed line-by-line, not via
// readJson). The shared fail-closed readJson is imported from lz-eval-readjson.mjs (F12 de-dup).
// ---------------------------------------------------------------------------
const readText = (p) => fs.readFileSync(p, 'utf8');

// ---------------------------------------------------------------------------
// Load the dev seeds (data/dev.json -- array indexed by position = claim_id) + the KS
// (data_store/dev_top_k_sentences.json -- JSONL of { claim_id, claim, top_100:[{sentence,url}] }).
// Returns { seeds: [...], ksByClaim: { id: top_100 } } from the gitignored cache. Used by the CLI
// leakage screen; never by the unit suite (the suite drives the pure functions with fixtures).
// ---------------------------------------------------------------------------
export function loadDevSeedsAndKs(cacheRoot) {
  const devPath = path.join(cacheRoot, 'data', 'dev.json');
  const ksPath = path.join(cacheRoot, 'data_store', 'dev_top_k_sentences.json');
  const dev = readJson(devPath);

  if (!Array.isArray(dev)) {
    throw new ContractError('dev.json is not an array', devPath);
  }

  const seeds = dev.map((r, i) => ({
    claim_id: i,
    claim: r.claim,
    label: r.label,
    claim_date: r.claim_date,
    fact_checking_article: r.fact_checking_article,
    cached_original_claim_url: r.cached_original_claim_url,
    original_claim_url: r.original_claim_url,
  }));

  // The KS file is JSONL; parse line-by-line (fail-closed per line).
  const ksByClaim = {};
  const ksText = stripBom(readText(ksPath));

  for (const line of ksText.split(/\r?\n/)) {
    if (line.trim().length === 0) {
      continue;
    }

    let rec;

    try {
      rec = JSON.parse(line);
    } catch (err) {
      throw new ContractError('malformed KS JSONL line: ' + err.message, ksPath);
    }

    if (rec && rec.claim_id != null && Array.isArray(rec.top_100)) {
      ksByClaim[rec.claim_id] = rec.top_100;
    }
  }

  return { seeds, ksByClaim };
}

// ---------------------------------------------------------------------------
// Thin CLI (guarded so importing the module does NOT run it). With `--probe <cache-root> [n]` it runs
// the OQ-1 leakage screen over the first n Supported dev seeds (default 10) and exits 0 on a clean
// screen / 2 on a leak (the manifest lock must NOT proceed on a leak -- ESCALATE to the user). Any
// ContractError exits 2 with the offending file named.
// ---------------------------------------------------------------------------
/* node:coverage disable */
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    const mode = process.argv[2];

    if (mode === '--probe') {
      const cacheRoot = process.argv[3] || path.join(fileURLToPath(new URL('.', import.meta.url)), '.cache', 'chenxwh__AVeriTeC');
      const n = Number.parseInt(process.argv[4] || '10', 10);
      const { seeds, ksByClaim } = loadDevSeedsAndKs(cacheRoot);
      const supported = seeds.filter((s) => s.label === 'Supported').slice(0, Number.isInteger(n) && n > 0 ? n : 10);
      const res = leakageProbe(supported, ksByClaim);

      if (res.clean) {
        console.log('leakage probe CLEAN over ' + supported.length + ' Supported dev seeds (manifest lock may proceed).');
        process.exit(0);
      }

      console.error('leakage probe LEAKY (' + res.leaks.length + ' leak(s)) -- DO NOT lock the manifest; ESCALATE to the user:');

      for (const l of res.leaks.slice(0, 20)) {
        console.error('  claim_id ' + l.claim_id + ': ' + l.reason + ' (' + l.url + ')');
      }

      process.exit(2);
    }

    console.error('lz-eval-traps: usage: node lz-eval-traps.mjs --probe <cache-root> [n]');
    process.exit(2);
  } catch (err) {
    const where = err && err.file ? ' (' + err.file + ')' : '';
    console.error('lz-eval-traps: ' + (err && err.message ? err.message : String(err)) + where);
    process.exit(2);
  }
}
/* node:coverage enable */
