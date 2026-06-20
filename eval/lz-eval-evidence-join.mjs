// lz-eval-evidence-join.mjs
//
// NET-NEW (Phase 20, Plan 20-05 evidence-join fix; NO-SPEND): the EVIDENCE-TEXT JOIN shared by BOTH live-cert
// harvest arms. A survivor cluster (survivors.json) carries only SOURCE URLs in its `sources` field -- NOT the
// stored evidence TEXT. The OOF entailment adjudication (arm A) + the Stage-2 verify-voter (arm B) judge
// "does this EVIDENCE entail the CLAIM?"; a bare URL is NOT adjudicable. The REAL evidence text lives on disk
// in each run dir:
//   - claims/<worker>.json: { worker, source, claims:[ { id, text, quote, excerpt_id, load_bearing } ... ] }
//     -- each worker claim carries a verbatim `quote` snippet + an `excerpt_id`;
//   - excerpts/<excerpt_id>.txt: the fetched passage TEXT.
// This module reconstructs a cluster's evidence as the matched worker quote(s) + the referenced excerpt
// passage(s), as [{ sentence: <text> }] -- the shape the oof packet builder + the voter consume. It NEVER
// emits a URL as evidence; a cluster with no recoverable text is FLAGGED (matched:false + a reason) so the
// caller DROPS it (arm A) or surfaces it without an evidence field (arm B keeps its existing counts).
//
// It is extracted into its OWN module (not co-located in lz-eval-armA-native.mjs) so BOTH arm A
// (lz-eval-armA-native.mjs) AND arm B (lz-eval-harvest.mjs) import it WITHOUT a cycle: arm A imports the
// run-dir reader from arm B (lz-eval-harvest.mjs), so importing the join from arm A into arm B would form a
// cycle. The join lives here, one-directional: both arms -> this module -> the runtime hardening primitives.
//
// Tree / dependency boundary (D-10/D-11): this script lives in the repo-level eval/ dev tree, NEVER in the
// distributed plugin tree. It imports the SHIPPED runtime aggregator's hardening primitives (ContractError /
// safeId / listJson) ACROSS trees by relative path -- ONE-DIRECTIONAL (eval -> runtime, NEVER runtime ->
// eval). Zero new npm deps; node stdlib + the runtime primitives + the shared eval readJson helper.
//
// This source contains no literal byte-order mark and is strictly ASCII (per CLAUDE.md). It performs NO
// network I/O, NO model spend, and carries NO LZ_SPEND code path (a pure on-disk join).

import fs from 'node:fs';
import path from 'node:path';

import {
  ContractError,
  safeId,
  listJson,
} from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

import { readJson } from './lz-eval-readjson.mjs';

// The per-excerpt passage cap (documented): an excerpt file can be tens of KB (a full fetched passage). The
// OOF/voter packet needs the relevant passage, NOT a 50KB dump. Cap each excerpt to the first ~1200 chars
// (deterministic prefix; the verbatim worker `quote` -- the load-bearing snippet -- is emitted IN FULL
// separately, so the cap never loses the decisive sentence).
export const EXCERPT_CHAR_CAP = 1200;

// The lexical-overlap (token Jaccard) threshold for the OVERLAP match path (documented). The synthesized
// cluster claim is an EXACT copy of a worker claim `text` in 100% of the curated corpus (verified), so EXACT
// match is the primary path; the overlap path is a deterministic fallback for any future paraphrased
// synthesis. 0.6 is the SAME UNDER-merge Jaccard the aggregator's corroboration clustering uses (D-07
// jaccard >= 0.6) -- reused for consistency, never tuned toward a target N.
export const EVIDENCE_OVERLAP_JACCARD = 0.6;

// ASCII-safe, whitespace-collapsed normalization for a piece of evidence text. Non-ASCII bytes (6/15 excerpt
// files in the curated corpus carry them) are stripped so the emitted packet is strictly ASCII (CLAUDE.md);
// CR/LF/tabs collapse to single spaces so a multi-line passage is one clean sentence for the renderer.
function asciiClean(text) {
  return String(text == null ? '' : text)
    // eslint-disable-next-line no-control-regex
    .replace(/[^\x09\x0a\x0d\x20-\x7e]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Normalize a claim/worker-text for MATCHING only (lowercase + whitespace-collapsed). Distinct from
// asciiClean (which prepares the surfaced evidence) -- this drives the exact/overlap comparison.
function normForMatch(text) {
  return String(text == null ? '' : text).toLowerCase().replace(/\s+/g, ' ').trim();
}

// Token set for the Jaccard overlap fallback (whitespace-split non-empty tokens over the normalized text).
function tokenSet(text) {
  return new Set(normForMatch(text).split(' ').filter(Boolean));
}

function jaccard(aSet, bSet) {
  if (aSet.size === 0 && bSet.size === 0) {
    return 0;
  }

  let inter = 0;

  for (const t of aSet) {
    if (bSet.has(t)) {
      inter += 1;
    }
  }

  const union = aSet.size + bSet.size - inter;

  return union === 0 ? 0 : inter / union;
}

// Read ONE run dir's worker claims (claims/*.json), flattened to a single array of
// { worker, source, id, text, quote, excerpt_id } records. Fail-closed via readJson (BOM-safe). A run dir
// with no claims/ dir returns [] (listJson returns [] for an absent dir) -- the caller then drops every
// cluster from that run (no recoverable evidence text).
function readRunDirWorkerClaims(runDir) {
  const claimsDir = path.join(runDir, 'claims');
  const files = listJson(claimsDir);
  const out = [];

  for (const f of files) {
    const w = readJson(path.join(claimsDir, f));

    if (w == null || typeof w !== 'object' || !Array.isArray(w.claims)) {
      throw new ContractError('readRunDirWorkerClaims: worker file missing a claims[] array: ' + f, path.join(claimsDir, f));
    }

    for (const c of w.claims) {
      if (c == null || typeof c !== 'object') {
        continue;
      }

      out.push({
        worker: w.worker,
        source: w.source,
        id: c.id,
        text: typeof c.text === 'string' ? c.text : '',
        quote: typeof c.quote === 'string' ? c.quote : '',
        excerpt_id: typeof c.excerpt_id === 'string' ? c.excerpt_id : '',
      });
    }
  }

  return out;
}

// Read one excerpt passage (excerpts/<excerpt_id>.txt), ASCII-cleaned + capped. The excerpt_id is routed
// through safeId (T-19-TRAVERSE) before it is used as a path component -- a crafted id cannot traverse out of
// the run dir. A missing/unreadable excerpt file returns '' (the quote is still emitted; only the passage is
// absent).
function readExcerptText(runDir, excerptId) {
  if (typeof excerptId !== 'string' || excerptId.length === 0) {
    return '';
  }

  const safe = safeId(excerptId, runDir);
  const excerptPath = path.join(runDir, 'excerpts', safe + '.txt');

  if (!fs.existsSync(excerptPath)) {
    return '';
  }

  let raw;

  try {
    raw = fs.readFileSync(excerptPath, 'utf8');
  } catch {
    return '';
  }

  const cleaned = asciiClean(raw);

  return cleaned.length > EXCERPT_CHAR_CAP ? cleaned.slice(0, EXCERPT_CHAR_CAP) : cleaned;
}

// Per-runDir cache of the flattened worker claims so the JOIN reads claims/*.json ONCE per run dir even when
// many clusters share a run dir. Keyed by the run-dir path. A Map (not a plain object) so an adversarial
// run-dir path string cannot collide with Object.prototype.
const workerClaimsCacheByRunDir = new Map();

function workerClaimsForRunDir(runDir) {
  if (!workerClaimsCacheByRunDir.has(runDir)) {
    workerClaimsCacheByRunDir.set(runDir, readRunDirWorkerClaims(runDir));
  }

  return workerClaimsCacheByRunDir.get(runDir);
}

// Reset the per-runDir worker-claims cache. Exported for tests that re-use a run-dir path across fixtures
// (the cache would otherwise serve stale claims for a re-written tmp dir of the same name).
export function resetEvidenceJoinCache() {
  workerClaimsCacheByRunDir.clear();
}

// ---------------------------------------------------------------------------
// joinClusterEvidence(runDir, cluster): reconstruct a survivor cluster's REAL evidence TEXT by joining
// cluster -> claims -> excerpts. For a cluster { claim, sources }:
//   1. Select the run dir's worker claims whose `source` is in cluster.sources.
//   2. Among those, MATCH the cluster claim: EXACT normalized-text match FIRST; else the highest-overlap
//      worker claim with token-Jaccard >= EVIDENCE_OVERLAP_JACCARD.
//   3. Collect the matched worker `quote` (verbatim snippet) AND its excerpts/<excerpt_id>.txt passage
//      (ASCII-cleaned + capped), de-duplicated, as [{ sentence: <text> }].
//   4. If NO worker claim matches (no recoverable evidence text), return matched:false + an empty evidence
//      array + a reason -- the caller DROPS the candidate (NEVER emits a URL or an empty packet).
// PURE function of the on-disk run dir (no network, no spend). The cluster's URL `sources` NEVER enter the
// returned evidence -- they are used ONLY to scope which worker claims are eligible. `reason` is the match
// path on success ('exact' | 'overlap') or the drop reason on failure.
// ---------------------------------------------------------------------------
export function joinClusterEvidence(runDir, cluster) {
  if (typeof runDir !== 'string' || runDir.length === 0) {
    throw new ContractError('joinClusterEvidence requires a run-dir path', 'joinClusterEvidence');
  }

  if (cluster == null || typeof cluster !== 'object') {
    throw new ContractError('joinClusterEvidence requires a cluster record', 'joinClusterEvidence');
  }

  const clusterSources = Array.isArray(cluster.sources) ? cluster.sources : [];
  const claimText = typeof cluster.claim === 'string' ? cluster.claim : '';

  // Worker claims whose source is one of the cluster's sources (the URL `sources` SCOPE the join only).
  const sourceSet = new Set(clusterSources);
  const eligible = workerClaimsForRunDir(runDir).filter((c) => sourceSet.has(c.source));

  if (eligible.length === 0) {
    return Object.freeze({ evidence: Object.freeze([]), matched: false, reason: 'no-eligible-worker-claims-for-cluster-sources' });
  }

  const wantNorm = normForMatch(claimText);

  // (a) EXACT normalized-text matches FIRST (the curated corpus case -- the cluster claim is a verbatim copy
  // of a worker claim text). There may be MORE than one (the same text from two workers) -- collect all.
  let matchedClaims = eligible.filter((c) => normForMatch(c.text) === wantNorm && wantNorm.length > 0);
  let matchPath = 'exact';

  // (b) OVERLAP fallback: the single highest-Jaccard worker claim at or above the threshold.
  if (matchedClaims.length === 0) {
    const wantSet = tokenSet(claimText);
    let best = null;
    let bestJ = 0;

    for (const c of eligible) {
      const j = jaccard(wantSet, tokenSet(c.text));

      if (j > bestJ) {
        bestJ = j;
        best = c;
      }
    }

    if (best != null && bestJ >= EVIDENCE_OVERLAP_JACCARD) {
      matchedClaims = [best];
      matchPath = 'overlap';
    }
  }

  if (matchedClaims.length === 0) {
    return Object.freeze({ evidence: Object.freeze([]), matched: false, reason: 'no-worker-claim-matched-cluster-claim' });
  }

  // Collect the matched quotes + their excerpt passages, ASCII-cleaned, de-duplicated, NEVER a URL.
  const sentences = [];
  const seen = new Set();

  const push = (text) => {
    const clean = asciiClean(text);

    if (clean.length === 0 || seen.has(clean)) {
      return;
    }

    seen.add(clean);
    sentences.push({ sentence: clean });
  };

  for (const c of matchedClaims) {
    push(c.quote);
    push(readExcerptText(runDir, c.excerpt_id));
  }

  if (sentences.length === 0) {
    // Matched a worker claim but it carried neither a usable quote nor a readable excerpt passage -> no
    // recoverable evidence TEXT. Flag + drop (never emit an empty packet).
    return Object.freeze({ evidence: Object.freeze([]), matched: false, reason: 'matched-but-no-recoverable-text' });
  }

  return Object.freeze({ evidence: Object.freeze(sentences.map((s) => Object.freeze(s))), matched: true, reason: matchPath });
}
