// lz-eval-armA-native.mjs
//
// NET-NEW (Phase 20, Plan 20-05 ARM-A amendment; NO-SPEND): the AMENDED ARM-A assembly path -- the
// skill's OWN naturally-occurring refuted-gold (Contested/Unsupported/Low) claims, RETAINED as refuted-gold
// by the FROZEN out-of-family all-agree gold-blind pair, difficulty-matched STATISTICALLY to the ARM-B
// SUPPORTED controls, with construct-validity gates (a)+(b) RE-RUN on the retained set. THE AUTHORITY is
// CERTIFY-WORKS-RATIFICATION.md (the original cross-family board, UNANIMOUS 4/4) + 20-CONTEXT.md D-22 (the
// ratification) + D-20 (the transport split) + D-04 (the OOF + human hybrid / Guerdan response-set
// exclusion). It SUPERSEDES the 20-06 minimal-edit ARM-A construction (eval/lz-eval-contrastive-authoring.mjs
// authorContrastivePair / ARM_A_SEED is UNUSED for the live cert; gate (d) minimal-edit is DROPPED).
//
// WHY THE AMENDMENT (D-22): minimal-edit pairs are infeasible on-distribution at N>=36 (dense-AND-SUPPORTED
// scarcity); the human maintainer declines to author; model-authoring INJECTED a lexical artifact (an
// authored 32-pair seed scored lexical-overlap AUC 0.856 >> the 0.65 ceiling -- by-construction pairing
// produced the very artifact gate (a) guards). The skill OVER-produces refuted-gold (4 real runs -> ~61
// Contested/Low candidates; ~15/run as a FREE by-product of the ARM-B harvest). Statistical
// difficulty-matching of the skill's REAL refuted negatives serves the construct-validity PURPOSE as well
// or better (removes the authoring artifact + samples the actual negative distribution), PROVIDED the
// construct-validity gates pass on the retained set. This is FULL-WORKS-eligible (C is ON-distribution).
//
// THE SIX PRE-SPEND LOCKS (CERTIFY-WORKS-RATIFICATION.md, all ratified):
//   (a) cluster key = source-doc/seed WITHIN a run (NOT run-question; else 4 runs collapse to ~4 traps).
//   (b) gold = the FROZEN OOF all-agree pair, gold-blind, NEVER the skill self-tag.
//   (c) covariate-overlap + subject-difficulty + cluster floors AND the (a)+(b) construct-validity gates
//       are load-bearing, NEVER tuned toward N=36.
//   (d) N_trap frozen the instant the OOF consensus finishes, before vote 1.
//   (e) arms never pooled; ARM B stays live-harvested SUPPORTED.
//   (f) post-OOF retained N_trap < 36 -> documented VOID-on-power -> SCOPED external arm + RAISE.
//
// THE AMENDED CONSTRUCT-VALIDITY GATE: gate (d) minimal-edit/source_uid is DROPPED (no edits under C).
// Gates (a) lexical-overlap AUC <= 0.65 AND (b) one-sided not-easier difficulty guard are RE-RUN ON THE
// POST-OOF RETAINED SET (arm-A refuted cell vs the dense-SUPPORTED arm-B control cell), jointly with the
// N-freeze; fail either -> VOID-on-validity -> SCOPED external arm + RAISE. The realized difficulty SMD is
// ALSO reported for post-hoc auditability.
//
// THIS MODULE OWNS ONLY ARM A. It receives armBControls READ-ONLY for the matching guards (covariate +
// difficulty + lexical AUC) and NEVER merges the two arms into one N (lock e -- a pooled / combined-N field
// is a DEFECT). It COMPOSES the frozen seams BYTE-IDENTICAL:
//   - readRunDirClaims / listRunDirs / isSupportedClaim (eval/lz-eval-harvest.mjs) -- the run-dir reader +
//     the SUPPORTED predicate (ARM A is the INVERSE: the Contested/Unsupported/Low candidates);
//   - makeBatchedOofProbe (eval/lz-eval-oof-batch.mjs) + runProbeConsensus (eval/lz-eval-trap-assembler.mjs)
//     -- the OOF all-agree gold-blind RETAIN consensus (the SAME strict all-agree contract as the offline
//     screen);
//   - requireSpend / makeOofAdjudicator / makeCopilotCallModel / FROZEN_OOF_PAIR (eval/lz-eval-live-cert.mjs)
//     -- the LZ_SPEND hard-guard + the real OOF transport (called ONLY behind requireSpend) + the frozen
//     gold pair identity;
//   - lexicalOverlapAuc / LEXICAL_AUC_CEILING (eval/lz-eval-baseline-guard.mjs) -- gate (a);
//   - oneSidedNotEasierGuard / EASIER_DIRECTION_SMD_MARGIN (eval/lz-eval-difficulty-proxy.mjs) -- gate (b).
//
// THE LZ_SPEND HARD-GUARD (D-07 / D-20): the OOF dispatch is the ONLY node-wireable spend (the Copilot CLI
// subprocess). adjudicateNativeRefutedGold takes an INJECTED callModel (the test passes a deterministic
// STUB -> ZERO spend); the REAL path (useFrozenTransport) builds the frozen Copilot transport whose
// callModel calls requireSpend('callOof') FIRST -> it THROWS unless LZ_SPEND===1. This module triggers NO
// live spend; the real harvest + OOF adjudication + voting are the human-authorized Plan 20-05 spend.
//
// Tree / dependency boundary (D-10/D-11): this script lives in the repo-level eval/ dev tree, NEVER in the
// distributed plugin tree. It imports the FROZEN seams WITHIN the eval tree + the SHIPPED runtime
// aggregator's ContractError ACROSS trees by relative path -- ONE-DIRECTIONAL (eval -> runtime, NEVER
// runtime -> eval). Zero new npm deps.
//
// This source contains no literal byte-order mark and is strictly ASCII (per CLAUDE.md). Pure functions are
// exported for the validation fixture; the thin CLI is guarded so that `import`-ing this module does NOT
// run the CLI.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// (1) The FROZEN run-dir reader + the SUPPORTED predicate (ARM A is the INVERSE -- the refuted-gold buckets).
import {
  readRunDirClaims,
  listRunDirs,
  isSupportedClaim,
} from './lz-eval-harvest.mjs';

// (1b) The shared evidence-text JOIN (cluster -> claims -> excerpts). Extracted into its own module so BOTH
//      arm A (here) and arm B (lz-eval-harvest.mjs) import it WITHOUT a cycle (arm A already imports the
//      run-dir reader from arm B). joinClusterEvidence returns the REAL stored TEXT as [{ sentence }], NEVER
//      a URL; resetEvidenceJoinCache clears the per-runDir claims cache for tests reusing a run-dir path.
import {
  joinClusterEvidence,
  resetEvidenceJoinCache,
} from './lz-eval-evidence-join.mjs';

// Re-export the join surface from arm A so existing importers (the validation fixture) keep working after the
// extraction -- the join's authority is shared, but arm A remains the documented entry point for the harvest.
export { joinClusterEvidence, resetEvidenceJoinCache };

// (2) The OUT-OF-FAMILY batched gold-blind probe adapter (composed UNCHANGED -- one element per OOF model).
import { makeBatchedOofProbe } from './lz-eval-oof-batch.mjs';

// (3) The ALL-AGREE-RETAIN consensus over the probe array (the SAME strict all-agree gold-blind contract
//     used by the offline screen). RETAIN a candidate only if EVERY probe agrees entails == expectation.
import { runProbeConsensus } from './lz-eval-trap-assembler.mjs';

// (4) The LZ_SPEND hard-guard + the real OOF transport + the frozen gold pair identity (the real path is
//     hard-guarded; the test uses an injected stub -> no spend). makeOofAdjudicator / makeCopilotCallModel
//     are imported so the real (useFrozenTransport) path builds the FROZEN pair behind requireSpend.
import {
  requireSpend,
  makeOofAdjudicator,
  FROZEN_OOF_PAIR,
} from './lz-eval-live-cert.mjs';

// (5) The construct-validity gates -- gate (a) the zero-dep lexical-overlap AUC + gate (b) the one-sided
//     not-easier difficulty SMD guard. RE-RUN on the POST-OOF retained set (NOT assumed).
import { lexicalOverlapAuc, LEXICAL_AUC_CEILING } from './lz-eval-baseline-guard.mjs';
import { oneSidedNotEasierGuard, EASIER_DIRECTION_SMD_MARGIN } from './lz-eval-difficulty-proxy.mjs';

// (6) Cross-tree reuse of the SHIPPED runtime aggregator's ContractError + safeId (eval -> runtime,
//     one-directional, never the reverse). ContractError backs the fail-closed reads; safeId guards a
//     content-derived id before it is surfaced.
import {
  ContractError,
  safeId,
} from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

// requireSpend is consumed by the real (useFrozenTransport) OOF path; makeOofAdjudicator builds the FROZEN
// pair behind it. Kept exported-by-use so a lint pass does not flag the import while the stub path runs.
void requireSpend;

// ---------------------------------------------------------------------------
// THE EXPECTED ENTAILMENT for a refuted-gold candidate is 'false' (the survivors must NOT entail the
// claim). This is the runProbeConsensus expectation the OOF all-agree pair is held to -- the SAME 'false'
// the offline trap arm uses. Gold = the OOF read of non-entailment, NEVER the skill self-tag (lock b).
// ---------------------------------------------------------------------------
export const ARM_A_EXPECTED_ENTAILMENT = 'false';

// ---------------------------------------------------------------------------
// THE REFUTED-GOLD CONFIDENCE BUCKETS (the INVERSE of isSupportedClaim): the skill's OWN
// Contested/Unsupported/Low claims are the refuted-gold CANDIDATES (a SOURCE BUCKET, NEVER the gold). The
// frozen confidence enum is High | Medium | Low | Contested | Unsupported; isSupportedClaim returns true
// for High/Medium, so the refuted-gold candidate predicate is the complement over the weak/dissenting/
// absent band. A candidate's bucket is NEVER the gold -- the OOF all-agree pair decides the gold gold-blind.
// ---------------------------------------------------------------------------
const REFUTED_GOLD_CONFIDENCE = Object.freeze({ Low: true, Contested: true, Unsupported: true });

export function isRefutedGoldCandidate(rec) {
  return (
    rec != null &&
    typeof rec === 'object' &&
    !isSupportedClaim(rec) &&
    REFUTED_GOLD_CONFIDENCE[rec.confidence] === true
  );
}

// ---------------------------------------------------------------------------
// clusterKeyWithinRun(runBasename, rec): lock (a) -- the cluster key is the source-doc/seed WITHIN a run,
// NOT the run-question. A claim's cluster is `<run-basename>::<source-doc>` so the SAME source doc in two
// DIFFERENT runs is TWO distinct clusters (4 runs yield MANY independent clusters, never collapsing to ~4).
// Order: an explicit source_doc / source_cluster / source_url tag, else the claim id (a singleton cluster).
// The run basename PREFIX is what makes the key within-run.
// ---------------------------------------------------------------------------
function clusterKeyWithinRun(runBasename, rec) {
  const docTag =
    (typeof rec.source_doc === 'string' && rec.source_doc.length > 0 && rec.source_doc) ||
    (typeof rec.source_cluster === 'string' && rec.source_cluster.length > 0 && rec.source_cluster) ||
    (typeof rec.source_url === 'string' && rec.source_url.length > 0 && rec.source_url) ||
    (typeof rec.cached_original_claim_url === 'string' && rec.cached_original_claim_url.length > 0 && rec.cached_original_claim_url) ||
    null;

  if (docTag) {
    return runBasename + '::' + docTag;
  }

  // No source-doc tag -> a singleton per-claim cluster (still run-qualified).
  return runBasename + '::cid-' + String(rec.id);
}

// ---------------------------------------------------------------------------
// harvestRefutedGoldCandidates({ corpusDir, runDirs }): read the run dirs (via the FROZEN readRunDirClaims /
// listRunDirs) and return the skill's OWN refuted-gold CANDIDATES = the Contested + Unsupported + Low claims
// (the INVERSE of isSupportedClaim). Each candidate carries:
//   - uid: run-dir-qualified, ':'-free with the '::' separator (`<run-basename>::<claim-id>`);
//   - claim: the claim text;
//   - evidence: the REAL stored evidence TEXT, joined cluster -> claims -> excerpts (the matched worker
//     quote(s) + their excerpt passage(s) as [{ sentence: <text> }]) -- NEVER a bare URL (the BLOCKING-BUG
//     fix; joinClusterEvidence);
//   - corroboration_lower_bound: the corroboration count (for the difficulty proxy);
//   - source_run_dir: the run basename;
//   - source_cluster: the WITHIN-RUN source-doc cluster key (lock a);
//   - confidence: the source bucket (Contested/Unsupported/Low -- NEVER the gold).
// A candidate whose evidence TEXT cannot be recovered (no matching worker claim / no readable quote or
// excerpt) is DROPPED -- never emitted with a URL or an empty packet -- and counted in droppedNoEvidence.
// PURE function of the on-disk corpus: no network, no spend, no LZ_SPEND code path. A malformed run dir
// fails closed (readRunDirClaims). The OOF adjudication (the gold) is a SEPARATE step.
//
// Returns { candidates, nCandidates, nRunDirs, droppedNoEvidence, dropped } where droppedNoEvidence is the
// count of refuted-gold clusters dropped for lacking recoverable evidence text, and `dropped` surfaces each
// dropped cluster's { uid, reason } for the maintainer.
// ---------------------------------------------------------------------------
export function harvestRefutedGoldCandidates({ corpusDir, runDirs } = {}) {
  let dirs;

  if (Array.isArray(runDirs)) {
    dirs = runDirs;
  } else if (typeof corpusDir === 'string' && corpusDir.length > 0) {
    dirs = listRunDirs(corpusDir);
  } else {
    throw new ContractError('harvestRefutedGoldCandidates requires either a corpusDir or an explicit runDirs array', 'harvestRefutedGoldCandidates');
  }

  const candidates = [];
  const dropped = [];

  for (const dir of dirs) {
    const basename = path.basename(dir);
    const records = readRunDirClaims(dir);

    for (const rec of records) {
      if (!isRefutedGoldCandidate(rec)) {
        continue;
      }

      // Route the content-derived id through safeId before it is surfaced (T-19-TRAVERSE). The uid uses the
      // run-dir-qualified '::' separator so a claim id repeated across run dirs is distinct + ':'-free.
      safeId(rec.id, dir);
      const uid = basename + '::' + rec.id;

      // THE EVIDENCE-TEXT JOIN (BLOCKING-BUG fix): reconstruct the REAL stored evidence TEXT (matched worker
      // quote(s) + excerpt passage(s)) from cluster -> claims -> excerpts. A cluster with no recoverable
      // text is DROPPED -- never emitted with a URL or an empty packet.
      const joined = joinClusterEvidence(dir, rec);

      if (!joined.matched || joined.evidence.length === 0) {
        dropped.push(Object.freeze({ uid, reason: joined.reason }));
        continue;
      }

      candidates.push(
        Object.freeze({
          uid,
          claim_id: rec.id,
          source_id: rec.id,
          claim: rec.claim,
          evidence: joined.evidence,
          corroboration_lower_bound: Number.isInteger(rec.corroboration_lower_bound) ? rec.corroboration_lower_bound : 0,
          source_run_dir: basename,
          source_cluster: clusterKeyWithinRun(basename, rec),
          confidence: rec.confidence,
        }),
      );
    }
  }

  return Object.freeze({
    candidates: Object.freeze(candidates),
    nCandidates: candidates.length,
    nRunDirs: dirs.length,
    droppedNoEvidence: dropped.length,
    dropped: Object.freeze(dropped),
  });
}

// ---------------------------------------------------------------------------
// Build the gold-blind OOF packet for a candidate: { trap: { uid, claim }, enrichedKs: [{ sentence }...] }.
// makeBatchedOofProbe's renderer reads packet.trap.claim (renderClaim) + packet.enrichedKs (renderSurvivors,
// each { sentence } or a string) and packetIdentity reads packet.trap.uid. The expected entailment + the
// skill self-tag NEVER enter the packet (gold-blind -- lock b).
// ---------------------------------------------------------------------------
function oofPacketFor(candidate) {
  const ev = candidate.evidence;
  const enrichedKs = (Array.isArray(ev) ? ev : [ev])
    .map((e) => {
      if (typeof e === 'string') {
        return { sentence: e };
      }

      if (e != null && typeof e === 'object' && typeof e.sentence === 'string') {
        return { sentence: e.sentence };
      }

      if (e != null && typeof e === 'object' && typeof e.text === 'string') {
        return { sentence: e.text };
      }

      return { sentence: '' };
    })
    .filter((d) => d.sentence.length > 0);

  return {
    trap: { uid: candidate.uid, claim: candidate.claim },
    enrichedKs,
  };
}

// ---------------------------------------------------------------------------
// THE RESUMABLE OOF VERDICT CACHE (Phase 20, Plan 20-05 OOF-PREP; NO-SPEND prep for the human-gated spend).
// The OOF adjudication is the Copilot CLI spend; a usage-limit interruption mid-round must NOT re-pay for
// candidates already adjudicated. This MIRRORS the FROZEN persistDualRunVote skip-already-done resumability
// (eval/lz-eval-live-cert.mjs -> persistVote, lz-eval-offline-read.mjs: votePath/persistVote, D-08): one
// small JSON per candidate keyed by the candidate uid, a re-run loads the cache and dispatches ONLY the
// still-un-adjudicated candidates. The cache is the SAME verdict the probe would produce -- it changes
// nothing about WHAT the consensus decides, it only avoids re-DISPATCHING an already-decided candidate.
//
// The per-candidate verdict record is { uid, accepted, entails, split, reason }: `accepted` = retained as
// refuted-gold (the all-agree does-not-entail pass); `entails` = the resolved OOF entailment read ('false'
// when retained as does-not-entail; 'true'/'unknown' otherwise); `split` is persisted so the residue's
// split-vs-reject distinction is reconstructed EXACTLY from the cache; `reason` is the consensus reason.
//
// FILENAME SAFETY (Windows): the candidate uid carries the '::' run-dir separator, and ':' is an ILLEGAL
// Windows filename character. oofVerdictPath sanitizes '::' -> '__' and any residual ':' -> '_', then routes
// the basename through safeId (T-19-TRAVERSE) before it is used as a path component -- a crafted uid cannot
// traverse out of cacheDir.
// ---------------------------------------------------------------------------
function oofVerdictPath(cacheDir, uid) {
  if (typeof cacheDir !== 'string' || cacheDir.length === 0) {
    throw new ContractError('oofVerdictPath requires a cacheDir (gitignored eval/.cache/)', 'oofVerdictPath');
  }

  if (typeof uid !== 'string' || uid.length === 0) {
    throw new ContractError('oofVerdictPath requires a non-empty candidate uid', 'oofVerdictPath');
  }

  // ':'-free key: the '::' run-dir separator -> '__', any residual ':' -> '_' (Windows filename safety).
  const key = uid.replace(/::/g, '__').replace(/:/g, '_');
  const base = safeId(key, cacheDir) + '.json';

  return path.join(cacheDir, base);
}

// Load a persisted per-candidate OOF verdict, or null when none is cached. Fail-closed on a malformed cache
// file (a corrupt cache must be surfaced, never silently treated as un-adjudicated -> a re-pay).
function loadOofVerdict(cacheDir, uid) {
  const p = oofVerdictPath(cacheDir, uid);

  if (!fs.existsSync(p)) {
    return null;
  }

  let raw;

  try {
    raw = fs.readFileSync(p, 'utf8');
  } catch (err) {
    throw new ContractError('loadOofVerdict: cannot read cached verdict: ' + err.message, p);
  }

  let rec;

  try {
    rec = JSON.parse(raw);
  } catch (err) {
    throw new ContractError('loadOofVerdict: malformed cached verdict JSON: ' + err.message, p);
  }

  if (rec == null || typeof rec !== 'object' || rec.uid !== uid || typeof rec.accepted !== 'boolean') {
    throw new ContractError('loadOofVerdict: cached verdict missing uid / boolean accepted (corrupt): ' + p, p);
  }

  return rec;
}

// Persist a per-candidate OOF verdict, SKIP-ALREADY-DONE (mirrors persistVote/persistDualRunVote D-08): a
// re-run does NOT re-write an existing verdict. Returns { persisted, skipped, path }.
function persistOofVerdict(cacheDir, verdict) {
  const p = oofVerdictPath(cacheDir, verdict.uid);

  if (fs.existsSync(p)) {
    return Object.freeze({ persisted: false, skipped: true, path: p });
  }

  fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(p, JSON.stringify(verdict, null, 2) + '\n', 'utf8');

  return Object.freeze({ persisted: true, skipped: false, path: p });
}

// ---------------------------------------------------------------------------
// adjudicateNativeRefutedGold({ candidates, callModel, useFrozenTransport, seed, cacheDir }): the OOF
// all-agree gold-blind RETAIN step (lock b + D-04). It builds ONE makeBatchedOofProbe per FROZEN_OOF_PAIR
// model, runs the documented prepare() PRE-PASS over the un-cached candidate set, then runProbeConsensus per
// un-cached candidate with expectedEntailment='false' (does NOT entail). A candidate is RETAINED as
// refuted-gold ONLY if BOTH OOF models all-agree the evidence does NOT entail the claim. A NON-unanimous /
// split / ambiguous read is EXCLUDED from the binary denominator + routed to human (Guerdan response-set
// exclusion, D-04).
//
// TRANSPORT (D-20): callModel is INJECTED. The test passes a deterministic STUB (callModel(promptText) ->
// JSON array string) -> ZERO spend. The REAL path (useFrozenTransport:true) builds the frozen Copilot
// transport via makeOofAdjudicator, whose per-model callModel calls requireSpend('callOof') FIRST -> it
// THROWS unless LZ_SPEND===1 (the no-spend build never reaches a real dispatch).
//
// RESUMABLE CACHE (Phase 20, Plan 20-05 OOF-PREP): an optional `cacheDir`. When set, BEFORE dispatching it
// loads any persisted per-candidate verdict (oofVerdictPath, keyed by uid) and passes ONLY the un-cached
// candidates to probe.prepare() (the spend). After dispatch it PERSISTS each newly-resolved verdict
// (skip-already-done, like persistDualRunVote). The final retained/residue/excluded sets are computed by
// MERGING cached + freshly-resolved verdicts over the FULL candidate set, in candidate order. A re-run after
// an interruption re-loads the cache and dispatches ONLY the still-un-adjudicated candidates -> never
// re-pays. OFF by default (cacheDir undefined -> current behavior: ALL candidates dispatched, nothing
// persisted), so existing tests are unaffected. The cache changes nothing about WHAT the consensus decides:
// a cached verdict is the SAME verdict the probe would produce -- it only avoids re-dispatching it.
//
// Returns { retained, residue, excludedIndeterminate, nRetained, nExcluded, expectedEntailment,
//   nDispatched, nCacheHits }:
//   - retained: the candidates the OOF pair all-agrees do-not-entail (the refuted-gold cell);
//   - excludedIndeterminate: the candidates EXCLUDED (split / entailed / unresolved) -- the binary
//     denominator they LEAVE; each carries { uid, residueReason };
//   - residue: the same excluded items, surfaced for the maintainer's human routing (D-04);
//   - nDispatched: how many candidates were sent to the probe this call (the un-cached set; 0 on a full
//     re-run from cache -> ZERO new spend); nCacheHits: how many were served from the cache.
// ---------------------------------------------------------------------------
export async function adjudicateNativeRefutedGold({ candidates, callModel, useFrozenTransport = false, seed = 'armA-native', cacheDir = undefined } = {}) {
  if (!Array.isArray(candidates)) {
    throw new ContractError('adjudicateNativeRefutedGold requires a candidates array', 'adjudicateNativeRefutedGold');
  }

  const useCache = typeof cacheDir === 'string' && cacheDir.length > 0;

  // (1) LOAD the cache (when enabled): a per-uid verdict map for the already-adjudicated candidates. Only the
  //     candidates WITHOUT a cached verdict are dispatched (the spend). On a full re-run every candidate is
  //     a cache hit -> ZERO candidates dispatched -> ZERO new spend.
  const cachedByUid = new Map();
  const toDispatch = [];

  for (const candidate of candidates) {
    if (useCache) {
      const cached = loadOofVerdict(cacheDir, candidate.uid);

      if (cached != null) {
        cachedByUid.set(candidate.uid, cached);
        continue;
      }
    }

    toDispatch.push(candidate);
  }

  // (2) DISPATCH only the un-cached candidates. The fresh verdicts (per uid) are merged with the cached ones
  //     over the FULL candidate set below. When toDispatch is EMPTY (a full re-run from cache), NO probe is
  //     built + NO prepare() is called -> ZERO new spend (the real-transport prepare is the spend boundary).
  const freshByUid = new Map();

  if (toDispatch.length > 0) {
    // Build ONE OOF probe per FROZEN model. The REAL path routes each callModel through the Copilot
    // transport (hard-guarded by requireSpend('callOof')); the test path wraps the SAME injected stub
    // callModel per model (the stub is gold-blind -- it reads only the rendered prompt).
    let probes;

    if (useFrozenTransport) {
      // The real OOF dispatch -- the FROZEN pair over the Copilot CLI transport. Its callModel calls
      // requireSpend('callOof') FIRST, so building is no-spend but dispatching (prepare) THROWS unless
      // LZ_SPEND===1. The no-spend build never authorizes the spend; this path exists ONLY for the
      // human-authorized Plan 20-05.
      const adjudicator = makeOofAdjudicator({ seed });
      probes = adjudicator.probes;
    } else {
      // callModel is INJECTED (the deterministic STUB; the real path is useFrozenTransport behind
      // requireSpend). It may be a SINGLE function (the SAME gold-blind judge for both OOF models) OR an ARRAY
      // of one callModel per FROZEN model (so a test can drive an inter-judge SPLIT). Build ONE
      // makeBatchedOofProbe per FROZEN model over the matching per-model callModel.
      const callModels = Array.isArray(callModel) ? callModel : FROZEN_OOF_PAIR.map(() => callModel);

      if (callModels.length !== FROZEN_OOF_PAIR.length || callModels.some((c) => typeof c !== 'function')) {
        throw new ContractError(
          'adjudicateNativeRefutedGold requires an injected callModel (a single STUB function for both OOF models, or an array of one per FROZEN_OOF_PAIR model); the real path is useFrozenTransport behind requireSpend',
          'adjudicateNativeRefutedGold',
        );
      }

      probes = FROZEN_OOF_PAIR.map((model, i) => makeBatchedOofProbe({ callModel: callModels[i], model, seed }));
    }

    const dispatchPackets = toDispatch.map((c) => oofPacketFor(c));

    // The documented PRE-PASS: pre-seed EVERY probe's resolver map over the UN-CACHED candidate set BEFORE
    // the per-candidate consensus loop (avoids the flush-boundary deadlock; lock e -- per the oof-batch
    // shape). For the real transport this is the spend boundary (requireSpend fires here) -- so a full re-run
    // from cache (toDispatch empty) never reaches it.
    for (const probe of probes) {
      await probe.prepare(dispatchPackets);
    }

    for (let i = 0; i < toDispatch.length; i += 1) {
      const candidate = toDispatch[i];
      const packet = dispatchPackets[i];

      // The SAME strict all-agree gold-blind contract the offline screen uses. RETAIN only if EVERY probe
      // agrees entails == 'false' (does NOT entail). A split / entailed / unresolved read -> NOT retained.
      const consensus = await runProbeConsensus(probes, {
        trap: packet.trap,
        enrichedKs: packet.enrichedKs,
        stratum: 'native-refuted-gold',
        decisiveRank: -1,
        expectedEntailment: ARM_A_EXPECTED_ENTAILMENT,
      });

      // The per-candidate verdict record (the SAME verdict the probe produced). `accepted` = retained; on a
      // retain the resolved entailment is the expected 'false' (does NOT entail); a split/reject carries the
      // OOF read direction (split -> 'true' = the pair disagreed by reading entailment; reject -> 'unknown').
      const verdict = {
        uid: candidate.uid,
        accepted: consensus.retained === true,
        entails: consensus.retained ? String(ARM_A_EXPECTED_ENTAILMENT) : (consensus.split ? 'true' : 'unknown'),
        split: consensus.split === true,
        reason: consensus.retained ? 'all-probes-agree-does-not-entail' : (consensus.split ? 'oof-split' : (consensus.reason || 'oof-non-entailment-reject')),
      };

      freshByUid.set(candidate.uid, verdict);

      // PERSIST the newly-resolved verdict (skip-already-done, like persistDualRunVote) so a future re-run
      // serves it from cache instead of re-dispatching (re-paying). No-op when the cache is OFF.
      if (useCache) {
        persistOofVerdict(cacheDir, verdict);
      }
    }
  }

  // (3) MERGE cached + freshly-resolved verdicts over the FULL candidate set, in candidate order, to build
  //     the retained / residue / excluded sets. The merge is verdict-driven so a re-run (all cache hits) and
  //     a fresh run (all dispatched) produce the IDENTICAL retained/residue (the cache changes nothing about
  //     WHAT is decided -- only whether it was re-dispatched).
  const retained = [];
  const excludedIndeterminate = [];
  const residue = [];

  for (const candidate of candidates) {
    const verdict = freshByUid.get(candidate.uid) || cachedByUid.get(candidate.uid);

    if (verdict == null) {
      // Defensive: a candidate with neither a fresh nor a cached verdict should be impossible (every
      // candidate is either cached or dispatched). Fail closed rather than silently drop it.
      throw new ContractError('adjudicateNativeRefutedGold: no verdict (cached or fresh) for candidate ' + candidate.uid, 'adjudicateNativeRefutedGold');
    }

    if (verdict.accepted === true) {
      retained.push(candidate);
      continue;
    }

    // EXCLUDED from the binary denominator + routed to the human (Guerdan response-set exclusion, D-04). A
    // SPLIT (a probe accepted but read entails=true -- the OOF pair disagrees) vs a unanimous-style reject
    // (a probe declined / the evidence DOES entail) is recorded as the residue reason.
    const residueReason = verdict.split ? 'oof-split' : (verdict.reason || 'oof-non-entailment-reject');
    const excluded = Object.freeze({ uid: candidate.uid, candidate, residueReason });
    excludedIndeterminate.push(excluded);
    residue.push(excluded);
  }

  return Object.freeze({
    retained: Object.freeze(retained),
    excludedIndeterminate: Object.freeze(excludedIndeterminate),
    residue: Object.freeze(residue),
    nRetained: retained.length,
    nExcluded: excludedIndeterminate.length,
    expectedEntailment: ARM_A_EXPECTED_ENTAILMENT,
    // Resumability telemetry: how many candidates were DISPATCHED this call (the spend) vs served from cache.
    nDispatched: toDispatch.length,
    nCacheHits: cachedByUid.size,
  });
}

// ---------------------------------------------------------------------------
// The DIFFICULTY-MATCHING GUARDS (the covariate-overlap + subject-difficulty + cluster-independence floors).
// These mirror the EXACT formulas the offline assembler (eval/lz-eval-trap-assembler.mjs F5/F6 floors)
// applies between the trap cell and the control cell -- here between the ARM-A retained refuted cell and
// the ARM-B SUPPORTED control cell. Lock (c): the floors are load-bearing, NEVER tuned toward N=36.
// ---------------------------------------------------------------------------

// The token length of a claim (the SAME tokenization the assembler's covariate-overlap uses:
// whitespace-split non-empty tokens).
function claimTokenLen(rec) {
  return String((rec && rec.claim) || '').trim().split(/\s+/).filter(Boolean).length;
}

function meanOf(xs) {
  return xs.length === 0 ? 0 : xs.reduce((a, b) => a + b, 0) / xs.length;
}

// (F5-2) COVARIATE OVERLAP: the trap-arm vs control-arm claim-length means must OVERLAP within tolerance (a
// relative mean difference) so a model cannot pass by STYLE (systematically longer/shorter traps). Mirrors
// the assembler's relDiff = |trapMean - ctrlMean| / max(trapMean, ctrlMean, 1) <= covariateOverlapTolerance.
function covariateOverlap(retainedTraps, armBControls, tolerance) {
  const trapMean = meanOf(retainedTraps.map(claimTokenLen));
  const ctrlMean = meanOf(armBControls.map(claimTokenLen));
  const denom = Math.max(trapMean, ctrlMean, 1);
  const relDiff = Math.abs(trapMean - ctrlMean) / denom;

  return { met: relDiff <= tolerance, relDiff, trapMean, ctrlMean };
}

// (lock a) CLUSTER INDEPENDENCE over the RETAINED refuted cell: every retained trap must be in a DISTINCT
// within-run source-doc cluster (no two retained traps share a source_cluster). A repeated cluster is
// positively correlated -> the per-claim CP denominator would double-count -> NOT independent. The cluster
// key was assigned at harvest (clusterKeyWithinRun, lock a).
function clusterIndependence(retainedTraps) {
  const seen = new Set();
  let collapsed = 0;

  for (const t of retainedTraps) {
    const key = (t && typeof t.source_cluster === 'string' && t.source_cluster.length > 0) ? t.source_cluster : 'cl-undefined';

    if (seen.has(key)) {
      collapsed += 1;
    } else {
      seen.add(key);
    }
  }

  return { met: collapsed === 0, collapsed, nClusters: seen.size };
}

// ---------------------------------------------------------------------------
// assembleArmA({ retainedTraps, armBControls, covariateOverlapTolerance, difficultyFloorMet, seed }): the
// ARM-A assembly over the POST-OOF retained refuted cell + the ARM-B SUPPORTED control cell (READ-ONLY).
// It runs the difficulty-matching guards (covariate-overlap + cluster-independence; subject-difficulty is
// an injected flag -- the held-out Claude reference catch-rate is computed at the human-gated spend) AND
// the construct-validity gates (a) lexical-overlap AUC + (b) one-sided not-easier ON THE RETAINED SET, then
// folds the verdict:
//
//   constructValid = covariateOverlapMet AND difficultyFloorMet AND clusterIndependenceMet AND
//                    lexicalGatePass AND notEasier
//
// Gate (d) minimal-edit/source_uid is DROPPED under option C -- NO minimal-edit term, NO source_uid required.
// The realized difficulty SMD (refuted-gold cell vs SUPPORTED controls) is ALSO reported for post-hoc
// auditability (CERTIFY-WORKS-RATIFICATION.md). The two arms are NEVER pooled (lock e) -- the result
// reports nTrap ONLY, never a combined / pooled N; armBControls are consumed READ-ONLY for the guards.
//
// difficultyFloorMet is an INJECTED flag (default true): the F5 subject-specific difficulty floor (the
// held-out Claude reference must NOT ace the retained traps) requires a model read, computed at the
// human-gated Plan 20-05 spend; this no-spend build accepts it as a flag so the fold + the gates are
// exercisable deterministically.
// ---------------------------------------------------------------------------
export async function assembleArmA({
  retainedTraps,
  armBControls,
  covariateOverlapTolerance = 0.5,
  difficultyFloorMet = true,
  seed = 'armA-native',
} = {}) {
  if (!Array.isArray(retainedTraps) || retainedTraps.length === 0) {
    throw new ContractError('assembleArmA requires a non-empty retainedTraps array (the POST-OOF refuted-gold cell)', 'assembleArmA');
  }

  if (!Array.isArray(armBControls) || armBControls.length === 0) {
    throw new ContractError('assembleArmA requires a non-empty armBControls array (the ARM-B SUPPORTED control cell, READ-ONLY)', 'assembleArmA');
  }

  if (typeof difficultyFloorMet !== 'boolean') {
    throw new ContractError('assembleArmA difficultyFloorMet must be a boolean (the F5 subject-difficulty flag; computed at the human-gated spend)', 'assembleArmA');
  }

  // The difficulty-matching guards between the two cells (covariate overlap + cluster independence). The
  // ARM-B controls are READ-ONLY inputs to the guards -- never merged into ARM A.
  const covariate = covariateOverlap(retainedTraps, armBControls, covariateOverlapTolerance);
  const cluster = clusterIndependence(retainedTraps);

  // Gate (a): the zero-dep lexical-overlap AUC ON THE RETAINED SET. lexicalOverlapAuc expects `pairs`
  // [{ supported, refuted }]; pair each retained refuted trap with an ARM-B SUPPORTED control positionally
  // (the AUC reads the cross-class lexical separation -- a clean retained set scores ~0.5, a lexical
  // artifact scores well above the ceiling). Pair up to min(len) so every pair carries both members.
  const nPairs = Math.min(retainedTraps.length, armBControls.length);
  const pairs = [];

  for (let i = 0; i < nPairs; i += 1) {
    pairs.push({
      supported: { claim: armBControls[i].claim, evidence: armBControls[i].evidence },
      refuted: { claim: retainedTraps[i].claim, evidence: retainedTraps[i].evidence },
    });
  }

  const auc = lexicalOverlapAuc({ pairs });

  // Gate (b): the one-sided not-easier difficulty SMD guard ON THE RETAINED SET. The constructed cell is
  // the ARM-A retained refuted cell; the harvested dense cell is the ARM-B SUPPORTED control cell. FAIL only
  // if the refuted cell is detectably EASIER than the controls beyond the pre-registered margin.
  const difficulty = oneSidedNotEasierGuard({
    constructedCell: retainedTraps,
    harvestedDenseCell: armBControls,
    seed,
  });

  const covariateOverlapMet = covariate.met;
  const clusterIndependenceMet = cluster.met;
  const lexicalGatePass = auc.pass;
  const notEasier = difficulty.notEasier;

  // THE FOLD (gate (d) minimal-edit DROPPED -- NO minimal-edit term): constructValid = covariate AND
  // difficulty AND cluster AND lexical AND notEasier. Fail any -> VOID-on-validity (the caller scopes to
  // the external arm + RAISEs; lock c -- the floors/gates are load-bearing, never tuned).
  const constructValid =
    covariateOverlapMet && difficultyFloorMet && clusterIndependenceMet && lexicalGatePass && notEasier;

  return Object.freeze({
    // ARM A owns ONLY its own count -- NO pooled / combined-N field (lock e; the two arms are NEVER pooled).
    nTrap: retainedTraps.length,
    // The matching guards.
    covariateOverlapMet,
    covariateRelDiff: covariate.relDiff,
    difficultyFloorMet,
    clusterIndependenceMet,
    clusterCollapsed: cluster.collapsed,
    nClusters: cluster.nClusters,
    // Gate (a).
    lexicalAuc: auc.auc,
    lexicalGatePass,
    lexicalAucCeiling: LEXICAL_AUC_CEILING,
    // Gate (b) + the realized SMD reported for post-hoc auditability.
    notEasier,
    smd: difficulty.smd,
    smdCiBound: difficulty.ciBound,
    easierDirectionSmdMargin: EASIER_DIRECTION_SMD_MARGIN,
    // The folded verdict (NO minimal-edit term -- gate (d) DROPPED under option C).
    constructValid,
  });
}

// ---------------------------------------------------------------------------
// Thin CLI (guarded so importing the module does NOT run it). With `--harvest <corpus-dir>` it reads the
// curated corpus and prints a counts-only receipt (the refuted-gold candidate count + the cluster count)
// -- NO model spend, NO network (the harvest is on-disk loading only; the OOF adjudication + the gates are
// the human-gated Plan 20-05 spend). This CLI is a convenience over a corpus on disk.
// ---------------------------------------------------------------------------
/* node:coverage disable */
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    const mode = process.argv[2];

    if (mode === '--harvest') {
      const corpusDir = process.argv[3];

      if (!corpusDir || !fs.existsSync(corpusDir) || !fs.statSync(corpusDir).isDirectory()) {
        console.error('lz-eval-armA-native: missing or invalid <corpus-dir>');
        process.exit(2);
      }

      const res = harvestRefutedGoldCandidates({ corpusDir });
      const clusters = new Set(res.candidates.map((c) => c.source_cluster));
      console.log(
        'armA-native: nCandidates=' + res.nCandidates + ' (refuted-gold buckets Contested/Unsupported/Low, evidence-text joined) ' +
          'droppedNoEvidence=' + res.droppedNoEvidence + ' over ' +
          res.nRunDirs + ' run dirs, ' + clusters.size + ' within-run source-doc clusters -- OOF all-agree RETAIN + gates (a)/(b) are the human-gated spend',
      );
      process.exit(0);
    }

    console.error('lz-eval-armA-native: usage: node lz-eval-armA-native.mjs --harvest <corpus-dir> (the OOF adjudication + the gates are the human-gated Plan 20-05; LZ_SPEND=1)');
    process.exit(2);
  } catch (err) {
    const where = err && err.file ? ' (' + err.file + ')' : '';
    console.error('lz-eval-armA-native: ' + (err && err.message ? err.message : String(err)) + where);
    process.exit(2);
  }
}
/* node:coverage enable */
