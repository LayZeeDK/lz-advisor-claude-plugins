// lz-eval-oof-batch.mjs
//
// NET-NEW (RE-PLAN-8, NO-SPEND): the BATCHED OUT-OF-FAMILY probe adapter (DP1-DP3) + the
// contamination gate (DP4). The authority is 19-04-REPLAN-DECISION-8.md (a 4-round cross-family
// advisor board, UNANIMOUS on DP1-DP10). This module is ADDITIVE: it composes the REUSED
// eval/.cache/oof-probe/score.mjs slice helper + an INJECTED callModel transport and produces ONE
// element per OUT-OF-FAMILY model for the EXISTING runProbeConsensus `probes` array. The gating
// consensus logic in eval/lz-eval-trap-assembler.mjs (runProbeConsensus) is UNCHANGED -- it still
// sees one probe function per OOF model returning { accepted, reason, entails } per packet.
//
// NO FROZEN PRIMITIVE CHANGE: this module imports neither the frozen jstat engine
// (eval/lz-eval-aggregate.mjs) nor the OOF gold-decider identity (gpt-5.5 + gemini-3.1-pro-preview).
// Bulk-batching (DP1-DP4) is UNFROZEN operational latitude -- it changes only HOW the per-packet
// consensus calls are dispatched (in batches), never WHAT the consensus decides.
//
// Tree / dependency boundary (D-10/D-11): this script lives in the repo-level eval/ dev tree, NEVER
// in the distributed plugin tree. It is never shipped.
//
// This source contains no literal byte-order mark and is strictly ASCII (per CLAUDE.md).
//
// ---------------------------------------------------------------------------
// CHOSEN ADAPTER SHAPE (DOCUMENTED, load-bearing): the prepareBatches(packets) -> resolverMap
// PRE-PASS. runProbeConsensus drives packets ONE-AT-A-TIME and short-circuits on the FIRST decline,
// and never signals batch-end -- so a probe that BUFFERS packets to accumulate batchSize before
// flushing risks a FLUSH-BOUNDARY DEADLOCK (the last sub-batchSize packets never flush; a decline
// mid-batch leaves later packets un-dispatched). The pre-pass avoids this entirely: the T-spend-1
// orchestrator PRE-COMPUTES every batch for a stratum's full candidate set BEFORE the consensus loop
// begins (prepareBatches dispatches all batched callModel calls and resolves a per-packet map keyed
// by packet identity), and the per-packet probe just READS the resolved map. The probe is therefore
// pure + synchronous-on-the-resolved-map and cannot deadlock on flush boundaries.
//
// makeBatchedOofProbe wraps prepareBatches: when called with the full candidate set up front it
// pre-seeds the resolver map; the returned probe resolves each packet against it. For the unit tests
// (and the T-spend-1 orchestrator) the resolver map is built by prepareBatches once, then the probe
// is handed to runProbeConsensus per-packet.
// ---------------------------------------------------------------------------

import { sliceByIdEntails } from './lz-eval-oof-batch-parse.mjs';

// ---------------------------------------------------------------------------
// Deterministic PRNG keyed by seed + model + callIndex (DP1 -- per-call-and-per-model order
// reshuffle with a RECORDED seed). A small xorshift-style mulberry32 fed a 32-bit hash of the
// (seed, model, callIndex) tuple: deterministic, reproducible, and independent per call/model so two
// models never reshuffle identically and re-running with the same seed is byte-stable.
// ---------------------------------------------------------------------------
function hash32(str) {
  let h = 2166136261 >>> 0;

  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }

  return h >>> 0;
}

function mulberry32(a) {
  let t = a >>> 0;

  return function next() {
    t = (t + 0x6d2b79f5) >>> 0;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);

    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

// A deterministic Fisher-Yates shuffle of indices [0..n-1] keyed by the (seed, model, callIndex)
// tuple. Returns a permutation array. PURE -- never mutates the caller's array.
function deterministicPermutation(n, seed, model, callIndex) {
  const rand = mulberry32(hash32(String(seed) + '|' + String(model) + '|' + String(callIndex)));
  const idx = [];

  for (let i = 0; i < n; i += 1) {
    idx.push(i);
  }

  for (let i = n - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = idx[i];
    idx[i] = idx[j];
    idx[j] = tmp;
  }

  return idx;
}

// ---------------------------------------------------------------------------
// OPAQUE NON-ORDINAL per-call ids (DP1): a non-sequential token keyed by the (seed, model, callIndex,
// position) tuple so the id cannot leak the trap/control interleave or the packet's position. NOT
// c1/c2/.../sequential (an ordinal id would leak the order). The id is a short hex token; the
// per-call resolver map records id -> packet so the response can be de-mapped regardless of the
// order the model emits the array in.
// ---------------------------------------------------------------------------
function opaqueId(seed, model, callIndex, position) {
  const h = hash32(String(seed) + '#' + String(model) + '#' + String(callIndex) + '#' + String(position));

  // 8-hex-char non-ordinal token. Prefix 'p' so it is a valid JSON-friendly id string.
  return 'p' + h.toString(16).padStart(8, '0');
}

// ---------------------------------------------------------------------------
// Packet identity: runProbeConsensus calls the probe per-packet with { trap, ... }. We key the
// resolver map by a stable per-packet identity derived from the trap. The trap object carries a
// uid/id; fall back to a stable stringification when neither is present (the unit stubs always
// supply an id). NEVER use array position as identity (that is the ordinal leak DP1 forbids).
// ---------------------------------------------------------------------------
export function packetIdentity(packet) {
  const trap = packet && packet.trap !== undefined ? packet.trap : packet;

  if (trap && typeof trap === 'object') {
    if (typeof trap.uid === 'string' && trap.uid.length > 0) {
      return trap.uid;
    }

    if (typeof trap.id === 'string' && trap.id.length > 0) {
      return trap.id;
    }
  }

  if (packet && typeof packet === 'object' && typeof packet.id === 'string' && packet.id.length > 0) {
    return packet.id;
  }

  // Defense-in-depth: a stable JSON identity (never the array index).
  return 'pkt:' + JSON.stringify(trap);
}

// ---------------------------------------------------------------------------
// Render the GOLD-BLIND batched prompt (DP2). The PREAMBLE is the rubric judge instructions + the
// JSON-array output spec REUSED from eval/.cache/oof-probe/prompt.txt (the c1-c6 ITEMS in that file
// are static capability-probe fixtures and are NOT carried). The adapter GENERATES its OWN per-item
// EVIDENCE + CLAIM block from the real packets' date-filtered survivors (enrichedKs). The expected
// direction (trap=false / control=true) and the per-packet expectedEntailment NEVER appear in the
// prompt text -- they live ONLY in the parser/consensus comparison downstream.
// ---------------------------------------------------------------------------
export const RUBRIC_PREAMBLE = [
  'You are a careful entailment judge. For each item you are given EVIDENCE (a few factual sentences) and a CLAIM. Decide exactly one thing per item:',
  '',
  'Does the EVIDENCE entail the CLAIM? "Entail" means the evidence states the claim OR directly forces it to be true by arithmetic, set-logic, definition, or an established (e.g. randomized) causal design.',
  '- entails = true  -> the evidence supports/licenses the claim. NOTE: a claim that is a WEAKER CONSEQUENCE of the evidence is still entailed (if the evidence forces "tripled", then "doubled" is entailed; if it forces a 5x increase, then "doubled" is entailed).',
  '- entails = false -> the evidence supports only something WEAKER than the claim; the claim exceeds what the evidence forces, by any margin.',
  '',
  'Judge each item INDEPENDENTLY, on its own evidence only. Do the arithmetic/logic explicitly in your reason. Treat plural "millions" as at least one million.',
  '',
  'Output ONLY a JSON array, one object per item, exactly this shape, with NOTHING before or after it and NO markdown fences:',
  '[{"id":"p0000abcd","entails":true,"reason":"..."},{"id":"p0000ef01","entails":false,"reason":"..."}]',
  '',
  'ITEMS:',
].join('\n');

// Extract the date-filtered survivor sentences from an enrichedKs packet for the EVIDENCE block.
// enrichedKs is the array of date-filtered surviving docs (each { sentence, ... }). The adapter
// renders ONLY the survivor sentences + the (mutated/native) CLAIM -- never any gold/label/recipe.
function renderSurvivors(enrichedKs) {
  if (!Array.isArray(enrichedKs)) {
    return [];
  }

  return enrichedKs
    .map((doc) => {
      if (doc && typeof doc === 'object' && typeof doc.sentence === 'string') {
        return doc.sentence;
      }

      if (typeof doc === 'string') {
        return doc;
      }

      return '';
    })
    .filter((s) => s.length > 0);
}

// The CLAIM text for a packet: the mutated overreach (trap) or native claim (control) carried on the
// trap object. NEVER the gold label / expectedEntailment / recipe.
function renderClaim(packet) {
  const trap = packet && packet.trap !== undefined ? packet.trap : packet;

  if (trap && typeof trap === 'object') {
    if (typeof trap.claim === 'string') {
      return trap.claim;
    }

    if (typeof trap.mutatedClaim === 'string') {
      return trap.mutatedClaim;
    }

    if (typeof trap.text === 'string') {
      return trap.text;
    }
  }

  return '';
}

// Render ONE item block for a packet given its opaque id. Strictly the EVIDENCE survivors + the CLAIM
// -- gold-blind (no expected direction, no expectedEntailment, no label).
function renderItem(opaque, packet) {
  const survivors = renderSurvivors(packet && packet.enrichedKs ? packet.enrichedKs : (packet && packet.trap ? packet.trap.enrichedKs : undefined));
  const claim = renderClaim(packet);
  const lines = [opaque + ')', 'EVIDENCE:'];

  for (const s of survivors) {
    lines.push('- ' + s);
  }

  lines.push('CLAIM: ' + claim);

  return lines.join('\n');
}

// Render the full batched prompt: the REUSED rubric PREAMBLE + the per-item EVIDENCE/CLAIM blocks in
// the (reshuffled) order. The opaque ids are the only join key the response is de-mapped on.
export function renderBatchedPrompt(orderedItems) {
  const blocks = orderedItems.map(({ opaque, packet }) => renderItem(opaque, packet));

  return RUBRIC_PREAMBLE + '\n\n' + blocks.join('\n\n') + '\n';
}

// ---------------------------------------------------------------------------
// Batch packing (DP1): pack <=batchSize packets/call; packets whose identity is in
// hardNearBoundaryIds ride in <=hardBatchSize batches. Returns an array of batches, each an array of
// { packet, identity } in the ORIGINAL order (the per-call reshuffle happens at dispatch). Hard
// near-boundary packets are packed into their OWN batches (<=hardBatchSize) so a 7-hard set splits
// into 6 + 1, never a single batch of 7. The remaining (non-hard) packets pack into <=batchSize.
// ---------------------------------------------------------------------------
export function packBatches(packets, { batchSize = 8, hardBatchSize = 6, hardNearBoundaryIds = [] } = {}) {
  const hardSet = new Set(hardNearBoundaryIds);
  const hard = [];
  const normal = [];

  for (const packet of packets) {
    const identity = packetIdentity(packet);
    const entry = { packet, identity };

    if (hardSet.has(identity)) {
      hard.push(entry);
    } else {
      normal.push(entry);
    }
  }

  const batches = [];

  for (let i = 0; i < hard.length; i += hardBatchSize) {
    batches.push(hard.slice(i, i + hardBatchSize));
  }

  for (let i = 0; i < normal.length; i += batchSize) {
    batches.push(normal.slice(i, i + batchSize));
  }

  return batches;
}

// ---------------------------------------------------------------------------
// Parse one batch response into a per-opaque-id { entails } map via the REUSED score.mjs slice
// (fence-strip + first-`[`/last-`]` + JSON.parse + the byId { id -> entails } extraction). On a
// whole-batch parse failure (no JSON array sliceable) returns { ok: false } so the caller can apply
// the DP3 re-run-once-then-split protocol. sliceByIdEntails is the byte-faithful extraction of
// score.mjs's slice + byId logic (score.mjs is the source of truth; see lz-eval-oof-batch-parse.mjs).
// ---------------------------------------------------------------------------
function parseBatchResponse(raw) {
  return sliceByIdEntails(raw);
}

// ---------------------------------------------------------------------------
// prepareBatches(packets, { callModel, model, batchSize, hardBatchSize, hardNearBoundaryIds, seed }):
// the PRE-PASS. Packs the FULL candidate set into batches, dispatches each batch through callModel
// (one OOF model) with a per-call-and-per-model reshuffled order + opaque non-ordinal ids, parses
// each response via the reused score.mjs slice, and resolves a per-PACKET-IDENTITY map:
//   identity -> { accepted, entails, reason }   (resolved)
//   identity -> { accepted: false, reason }     (DP3 fail-closed-to-DROP -- a per-packet defect)
//
// DP3 whole-batch JSON failure: re-run the batch ONCE; if it fails again, SPLIT it in half and
// re-dispatch each half (recorded in `batchEvents`). A packet still unresolved after the split is
// fail-closed-to-DROP. NEVER fabricates a retain.
//
// Returns { resolverMap, batchEvents } where batchEvents records retries/splits for the run artifact.
// ---------------------------------------------------------------------------
export async function prepareBatches(packets, { callModel, model, batchSize = 8, hardBatchSize = 6, hardNearBoundaryIds = [], seed } = {}) {
  const batches = packBatches(packets, { batchSize, hardBatchSize, hardNearBoundaryIds });
  const resolverMap = new Map();
  const batchEvents = [];
  let callIndex = 0;

  // Dispatch ONE batch: reshuffle order, assign opaque ids, render the prompt, call the model, parse.
  // Returns { ok, byOpaque } where byOpaque maps opaqueId -> entails (only on a parseable array);
  // ok=false signals a whole-batch parse failure. Also records the opaque -> packet mapping so the
  // caller can de-map after parsing.
  async function dispatchBatch(batch, ci) {
    const perm = deterministicPermutation(batch.length, seed, model, ci);
    const orderedItems = perm.map((srcPos, renderedPos) => {
      const entry = batch[srcPos];
      const opaque = opaqueId(seed, model, ci, renderedPos);

      return { opaque, packet: entry.packet, identity: entry.identity };
    });

    const promptText = renderBatchedPrompt(orderedItems);
    const raw = await callModel(promptText);
    const parsed = parseBatchResponse(raw);

    return { parsed, orderedItems };
  }

  // Resolve a parsed batch into the resolverMap, applying DP3 per-packet fail-closed-to-DROP.
  function resolveParsedBatch(parsed, orderedItems) {
    const byOpaque = parsed.byId;
    const seen = new Set();

    for (const { opaque, identity, packet } of orderedItems) {
      // A per-packet defect: the opaque id is MISSING from the response, or its entails is non-boolean
      // (sliceByIdEntails records a sentinel for non-boolean). FAIL-CLOSED-TO-DROP for THAT packet.
      const hasId = Object.prototype.hasOwnProperty.call(byOpaque, opaque);

      if (!hasId) {
        resolverMap.set(identity, { accepted: false, reason: 'oof-batch-unresolved-missing-id' });
        continue;
      }

      // Duplicate id in the response -> ambiguous -> drop that packet.
      if (seen.has(opaque)) {
        resolverMap.set(identity, { accepted: false, reason: 'oof-batch-unresolved-duplicate-id' });
        continue;
      }

      seen.add(opaque);
      const entails = byOpaque[opaque];

      if (entails !== true && entails !== false) {
        resolverMap.set(identity, { accepted: false, reason: 'oof-batch-unresolved-non-boolean-entails' });
        continue;
      }

      resolverMap.set(identity, { accepted: true, entails, reason: 'oof-batch-resolved' });
    }

    // An EXTRA id in the response (an id not in this batch's opaque set) is a parse defect, but it
    // cannot be mapped back to a packet -- it only matters if it COLLIDES with a real opaque id
    // (handled above as a duplicate) or shadows a missing one. We do not fabricate retains from
    // unknown ids; unknown ids are ignored (the affected packet stays missing -> dropped above).
  }

  for (const batch of batches) {
    const ci = callIndex;
    callIndex += 1;
    let { parsed, orderedItems } = await dispatchBatch(batch, ci);

    if (parsed.ok) {
      resolveParsedBatch(parsed, orderedItems);
      continue;
    }

    // DP3 whole-batch JSON failure -> re-run the batch ONCE.
    batchEvents.push({ batchCallIndex: ci, event: 'whole-batch-parse-failure', action: 'rerun-once' });
    const ci2 = callIndex;
    callIndex += 1;
    const retry = await dispatchBatch(batch, ci2);

    if (retry.parsed.ok) {
      resolveParsedBatch(retry.parsed, retry.orderedItems);
      continue;
    }

    // Still failed -> SPLIT the batch in half and re-dispatch each half (recorded).
    batchEvents.push({ batchCallIndex: ci2, event: 'rerun-failed', action: 'split-in-half' });
    const mid = Math.ceil(batch.length / 2);
    const halves = [batch.slice(0, mid), batch.slice(mid)];

    for (const half of halves) {
      if (half.length === 0) {
        continue;
      }

      const ciH = callIndex;
      callIndex += 1;
      const halfRes = await dispatchBatch(half, ciH);

      if (halfRes.parsed.ok) {
        resolveParsedBatch(halfRes.parsed, halfRes.orderedItems);
      } else {
        // A half that still fails -> every packet in it is fail-closed-to-DROP.
        for (const { identity } of halfRes.orderedItems) {
          if (!resolverMap.has(identity)) {
            resolverMap.set(identity, { accepted: false, reason: 'oof-batch-unresolved-whole-batch-split-failed' });
          }
        }
      }
    }
  }

  return { resolverMap, batchEvents };
}

// ---------------------------------------------------------------------------
// makeBatchedOofProbe({ callModel, model, batchSize, hardBatchSize, hardNearBoundaryIds, seed, score }):
// returns a probe function with the EXACT runProbeConsensus per-packet contract --
//   await probe({ trap, enrichedKs, stratum, decisiveRank, expectedEntailment })
//     -> { accepted, reason, entails }.
//
// The probe reads a pre-computed resolverMap (the PRE-PASS shape). The orchestrator (and the unit
// tests) call `probe.prepare(packets)` ONCE up front to dispatch the batched calls + seed the map;
// each subsequent per-packet probe call de-maps that packet's identity against the map. A packet not
// yet prepared resolves to a fail-closed DROP (defense-in-depth -- the orchestrator MUST prepare the
// full candidate set before the consensus loop, per the documented shape).
//
// The probe returns the model's reported `entails` UNCHANGED; the consensus (runProbeConsensus)
// compares it to expectedEntailment. The expected direction NEVER enters this module's prompt.
//
// `score` is accepted for parity with the interface (the source-of-truth slice lives in
// lz-eval-oof-batch-parse.mjs, a byte-faithful port of eval/.cache/oof-probe/score.mjs's slice +
// byId logic); it is unused internally and recorded only so the caller can assert provenance.
// ---------------------------------------------------------------------------
export function makeBatchedOofProbe({ callModel, model, batchSize = 8, hardBatchSize = 6, hardNearBoundaryIds = [], seed, score } = {}) {
  let resolverMap = new Map();
  let batchEvents = [];
  void score;

  async function prepare(packets) {
    const res = await prepareBatches(packets, { callModel, model, batchSize, hardBatchSize, hardNearBoundaryIds, seed });
    resolverMap = res.resolverMap;
    batchEvents = res.batchEvents;

    return res;
  }

  async function probe(packet) {
    const identity = packetIdentity(packet);

    if (resolverMap.has(identity)) {
      return resolverMap.get(identity);
    }

    // Not prepared (the orchestrator MUST pre-seed the full candidate set before the consensus loop).
    // Fail closed to a DROP rather than fabricate a retain.
    return { accepted: false, reason: 'oof-batch-unresolved-not-prepared' };
  }

  probe.prepare = prepare;
  probe.getBatchEvents = () => batchEvents.slice();
  probe.model = model;

  return probe;
}

// ---------------------------------------------------------------------------
// runContaminationGate({ singleResults, batchedResults, model }) (DP4): >=11/12 EXACT single-vs-batched
// entails agreement PER MODEL over the SAME 12-packet HARDEST slice (incl. one reversed-order variant).
// singleResults + batchedResults are maps (or plain objects) of id -> entails. Computes the EXACT
// agreement count over the union of ids; pass = agreement >= 11 (of 12). On fail returns
// directive 'batch-size-5-and-revalidate'. 11/12 = 91.7% tolerates one benign near-determinism flip;
// 100% would false-trip. Runs ONCE at T-spend-1 BEFORE trusting bulk.
// ---------------------------------------------------------------------------
export function runContaminationGate({ singleResults, batchedResults, model } = {}) {
  const single = toMap(singleResults);
  const batched = toMap(batchedResults);
  const ids = new Set([...single.keys(), ...batched.keys()]);
  const total = ids.size;
  let agreement = 0;

  for (const id of ids) {
    const a = single.get(id);
    const b = batched.get(id);

    // EXACT entails agreement: both present AND equal. A missing side counts as a disagreement
    // (the batched form must reproduce the single form on the hardest slice).
    if (a !== undefined && b !== undefined && a === b) {
      agreement += 1;
    }
  }

  const pass = agreement >= 11;

  return {
    model,
    agreement,
    total,
    pass,
    directive: pass ? null : 'batch-size-5-and-revalidate',
  };
}

function toMap(x) {
  if (x instanceof Map) {
    return x;
  }

  const m = new Map();

  if (x && typeof x === 'object') {
    for (const [k, v] of Object.entries(x)) {
      m.set(k, v);
    }
  }

  return m;
}
