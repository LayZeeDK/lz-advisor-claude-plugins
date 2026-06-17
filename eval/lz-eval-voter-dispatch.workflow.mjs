export const meta = {
  name: 'lz-eval-voter-dispatch',
  description: 'D-08 offline gating-read voter-dispatch: dispatches the PARAMETERIZED verify-voter seat (Sonnet Stage-1 / Haiku Stage-2) inside searchAndStop over the ENRICHED static-KS adapter (per-claim date cutoff enforced, never live web), records the MODEL voter free-text verdict (scoring reconciliation T-19-19 -- never searchAndStop flag-enum), no-abstention re-cast, skip-already-done resumable + pace-able; structured per eval/lz-review-gate.workflow.mjs (meta + marker SHARED block + injected globals, no import)',
  phases: [
    { title: 'Dispatch' },
  ],
}

// This is a dynamic Workflow script (run via the Workflow tool, NOT node:test -- agent()/log()/
// pipeline() are injected globals and the runtime has no filesystem/Node API). It lives in the
// repo-level eval/ dev tree and never ships.
//
// The function block between the LZ-EVAL-VOTER-DISPATCH-SHARED markers is the SINGLE SOURCE of the
// dispatch control logic, inlined here because workflow scripts cannot load modules at all: BOTH static
// import (rejected as "import call expects one or two arguments" -- the body is parsed as a function,
// not a module) AND dynamic import() (rejected as "import() is not available in workflow scripts") are
// blocked by the runtime (verified empirically 2026-06-16, eval/lz-review-gate.workflow.mjs). It is
// unit-tested DIRECTLY from this file by eval/lz-eval-voter-dispatch.workflow.harness.test.mjs, which
// mirrors the runtime's own execution model (de-export meta, wrap the body in an async function, inject
// MOCK globals) to run the real orchestration, and slices this marker-delimited block to exercise the
// real helper functions. No lib copy and no anti-drift proxy are needed -- the test runs the actual
// source. The markers are the slice point for the helper test.
//
// SCORING RECONCILIATION (T-19-19, load-bearing): the SCORED quantity is the MODEL voter's free-text
// vote.verdict over the date-filtered KS text (persisted in {unrefuted,refuted}, read by
// countFalseUpholds). searchAndStop's flag-driven mechanical verdict enum {judge-result,
// 'refuted-default','insufficient'} governs ONLY the TRACE + the mechanical minimums and NEVER becomes
// the recorded vote. toScoredVote takes the verdict from the MODEL vote; a test FAILS if the dispatch
// records searchAndStop's verdict.
//
// NO-ABSTENTION (W1, load-bearing): the offline-read dispatch prompt REQUIRES a definite
// refuted/unrefuted verdict (the gating read measures the BINARY false-uphold; abstention is NOT a
// valid vote here). parseVoteVerdict returns null for a null/absent/abstain/unparseable verdict; a null
// verdict is NOT persisted (the orchestrator's persistVote would reject it anyway) and the claim is
// RE-CAST on the next pass (skip-already-done skips only a DEFINITE persisted vote). So each seat's
// pool completes only with definite votes and readDelta proceeds only at a complete exactly-nPooled
// pool.
//
// RESUMABILITY (orchestrator-owned): the Workflow is filesystem-blind, so it cannot self-scan
// eval/.cache/ or self-persist. The ORCHESTRATOR (Task 4) scans the vote dir for already-persisted
// (definite) votes and passes the done set as args so the Workflow SKIPS them. The seat dispatch is
// PACE-ABLE (the usage pool is capped this session): wave-batch the fan-out via pipeline() so a run can
// be interrupted and resumed without re-casting completed votes.

// === LZ-EVAL-VOTER-DISPATCH-SHARED-START (canonical source; the workflow is self-contained -- tested via the harness slice) ===

// The search-and-stop trace stop_reason enum (mirrors searchAndStop's three outcomes + the offline-read
// driver's STOP_REASONS). A persisted trace must carry one of these so a null delta stays diagnosable
// (genuine parity vs both-stopped-early).
const STOP_REASONS = ['decisive-evidence', 'exhausted', 'min-not-met'];

// parseVoteVerdict(agentVote): extract the MODEL voter's definite verdict from its written vote JSON.
// Returns 'unrefuted' | 'refuted' for a definite verdict, or null for a null/absent/abstain/
// unparseable verdict (the no-abstention rule -- a null is NOT persisted and is re-cast). The agentVote
// may be the parsed vote object { verdict, ... } OR a raw JSON string the agent returned; both are
// handled (a raw string is JSON.parsed leniently -- a parse failure yields null, i.e. abstain/re-cast).
function parseVoteVerdict(agentVote) {
  let vote = agentVote;

  if (typeof agentVote === 'string') {
    try {
      vote = JSON.parse(agentVote);
    } catch {
      return null;
    }
  }

  if (vote == null || typeof vote !== 'object') {
    return null;
  }

  const v = vote.verdict;

  if (v === 'unrefuted' || v === 'refuted') {
    return v;
  }

  // null / undefined / 'null' / 'abstain' / 'insufficient' / anything else -> abstain -> re-cast.
  return null;
}

// toScoredVote(id, seat, agentVote, trace): build the persisted vote record from the MODEL's verdict
// and attach the searchAndStop trace for diagnosability. CRITICAL (T-19-19): the verdict is taken from
// the MODEL vote via parseVoteVerdict, NEVER from searchAndStop's mechanical flag-enum (trace.verdict /
// trace.stop_reason). Returns null when the model verdict is not definite (abstain -> not persisted ->
// re-cast). The trace is normalized to { queries, depth, stop_reason } -- the shape the orchestrator's
// persistVote validates (D-10); a trace whose stop_reason is not a known STOP_REASON is rejected
// (returns null) so an un-diagnosable trace can never be persisted.
function toScoredVote(id, seat, agentVote, trace) {
  const verdict = parseVoteVerdict(agentVote);

  if (verdict == null) {
    return null;
  }

  if (trace == null || typeof trace !== 'object') {
    return null;
  }

  const queries = Array.isArray(trace.queries) ? trace.queries : null;
  const depth = typeof trace.depth === 'number' ? trace.depth : null;
  const stopReason = typeof trace.stop_reason === 'string' ? trace.stop_reason : null;

  if (queries == null || depth == null || stopReason == null || !STOP_REASONS.includes(stopReason)) {
    return null;
  }

  // The persisted record: the MODEL's verdict + the seat + the diagnostic trace. The model verdict is
  // the scored quantity; the trace is diagnostic only (its stop_reason is searchAndStop's mechanical
  // outcome, NOT the scored value).
  return {
    id,
    seat,
    verdict,
    trace: { queries, depth, stop_reason: stopReason },
  };
}

// voteId(seat, claimUid, k): the deterministic per-vote id (seat-claimUid-k). The orchestrator routes
// this through safeId before any path; it is content-derived but seat/claim/k-scoped so each of the k
// votes per claim has a distinct id (skip-already-done is per-id).
function voteId(seat, claimUid, k) {
  return String(seat) + '-' + String(claimUid) + '-' + String(k);
}

// remainingVotes(claimUids, kFloor, doneIds): the skip-already-done expansion -- for each claim, emit
// the k in [0, kFloor) whose voteId is NOT already in doneIds (the orchestrator's scan of persisted
// definite votes). doneIds is an array or Set. A claim with all k done emits nothing (fully cast).
function remainingVotes(claimUids, seat, kFloor, doneIds) {
  const done = doneIds instanceof Set ? doneIds : new Set(Array.isArray(doneIds) ? doneIds : []);
  const uids = Array.isArray(claimUids) ? claimUids : [];
  const out = [];

  for (const uid of uids) {
    for (let k = 0; k < kFloor; k += 1) {
      const id = voteId(seat, uid, k);

      if (!done.has(id)) {
        out.push({ claimUid: uid, k, id });
      }
    }
  }

  return out;
}

// kFloorAtLeast(requested, min): the k>=MIN_K floor (MIN_K = 5). The dispatch casts at least MIN_K
// votes per claim; a requested k below the floor is raised to the floor (the calibrator may only
// TIGHTEN, never loosen). A non-integer / non-positive request falls back to the floor.
function kFloorAtLeast(requested, min) {
  const floor = Number.isInteger(min) && min > 0 ? min : 5;

  if (!Number.isInteger(requested) || requested < floor) {
    return floor;
  }

  return requested;
}

// === LZ-EVAL-VOTER-DISPATCH-SHARED-END ===

// ---------------------------------------------------------------------------
// Workflow-specific prompt builder (not shared with the harness slice; prose, not control logic). The
// voter prompt runs the open-book disconfirming search inside searchAndStop bound to the ENRICHED
// static-KS adapter (per-claim date cutoff enforced, NEVER live web -- D-07), with the pre-registered
// mechanical minimums (minQueries=3 / minDocs=5 floor; the calibrator may TIGHTEN only), and the
// NO-ABSTENTION instruction (a definite refuted/unrefuted is required). The voter writes the frozen
// vote JSON; the ORCHESTRATOR persists it (only a definite verdict) via persistVote.
// ---------------------------------------------------------------------------
function voterPrompt(claimUid, k, minQueries, minDocs) {
  return `You are the verify-voter seat for the OFFLINE known-gold gating read, casting vote ${k} on trap claim ${claimUid}.
Run an open-book DISCONFIRMING search (search the NEGATION of the claim) inside the search-and-stop loop bound to the ENRICHED static AVeriTeC knowledge store ONLY -- the per-claim publication-date cutoff is ENFORCED by the harness adapter; do NOT use live web search and do NOT rely on any fact-check article (retrieving the published verdict defeats the test).
Mechanical minimums (pre-registered floor; do not stop earlier): at least ${minQueries} distinct queries (at least one disconfirming) and at least ${minDocs} distinct in-window docs explored BEFORE any uphold.
Quote the relevant retrieved text first, then judge.
NO ABSTENTION: this gating read measures the BINARY false-uphold, so you MUST return a DEFINITE verdict -- either "refuted" or "unrefuted". Do NOT abstain, do NOT return null, do NOT return "insufficient". If the evidence is thin, weigh it and decide; err toward "refuted" when the evidence does not fully support the claim as stated.
Return the frozen vote JSON { verdict, attack_mode, disconfirming_query, source_independence_note } with verdict in {refuted, unrefuted}. Write NO files -- return the vote JSON as your final message; the orchestrator persists it.`;
}

// ---------------------------------------------------------------------------
// Orchestration: dispatch the parameterized voter seat at the k>=MIN_K floor over the remaining
// (skip-already-done) votes, fanned out via pipeline() (pace-able). The orchestrator owns persistence
// (the workflow is filesystem-blind): this returns the SCORED vote records (model verdict + trace) for
// the votes cast THIS run; a null/abstain vote is NOT returned (it is re-cast on the next pass). The
// caller persists the returned definite votes via persistVote and re-runs to complete the pool.
//
// args = { seat: 'sonnet'|'haiku', claimUids: [uid...], k?: 5, doneIds?: [id...], minQueries?: 3,
//   minDocs?: 5, model?: 'sonnet', effort?: 'medium', maxInFlight?: 4 }
// ---------------------------------------------------------------------------

const A = typeof args === 'object' && args ? args : {};
const SEAT = typeof A.seat === 'string' && A.seat.length > 0 ? A.seat : 'sonnet';
const CLAIM_UIDS = Array.isArray(A.claimUids) ? A.claimUids : [];
const K = kFloorAtLeast(A.k, 5);
const DONE_IDS = Array.isArray(A.doneIds) ? A.doneIds : [];
const MIN_QUERIES = Number.isInteger(A.minQueries) && A.minQueries >= 3 ? A.minQueries : 3;
const MIN_DOCS = Number.isInteger(A.minDocs) && A.minDocs >= 5 ? A.minDocs : 5;
// The seat is parameterized so 19-05 (Haiku Stage 2) reuses this exact Workflow: Stage 1 = Sonnet
// (model:'sonnet', effort:'medium'); Stage 2 = Haiku (model:'haiku').
const MODEL = typeof A.model === 'string' && A.model.length > 0 ? A.model : (SEAT === 'haiku' ? 'haiku' : 'sonnet');
const EFFORT = typeof A.effort === 'string' && A.effort.length > 0 ? A.effort : 'medium';

if (CLAIM_UIDS.length === 0) {
  log('No claimUids passed (args.claimUids is empty) -- nothing to dispatch.');
  return { seat: SEAT, k: K, dispatched: 0, recast: 0, scoredVotes: [] };
}

const todo = remainingVotes(CLAIM_UIDS, SEAT, K, DONE_IDS);
log(`Voter dispatch: seat=${SEAT} model=${MODEL} k=${K} ${todo.length} vote(s) remaining (skip-already-done over ${CLAIM_UIDS.length} claim(s)); minQueries=${MIN_QUERIES} minDocs=${MIN_DOCS}`);

let recast = 0;

const results = await pipeline(
  todo,
  async (item) => {
    // The voter AGENT runs its own open-book disconfirming search inside searchAndStop over the
    // enriched static-KS adapter (the harness wires the adapter + the date cutoff agent-side) and WRITES
    // its own free-text vote.verdict. The returned value is { vote, trace } -- the model's vote JSON +
    // the searchAndStop trace the harness captured.
    let raw;

    try {
      raw = await agent(
        voterPrompt(item.claimUid, item.k, MIN_QUERIES, MIN_DOCS),
        { model: MODEL, effort: EFFORT, phase: 'Dispatch', label: `vote ${SEAT} ${item.claimUid} k${item.k}` },
      );
    } catch (e) {
      log(`Vote ${item.id}: agent error -- ${String((e && e.message) || e)}; re-cast on the next pass`);
      return null;
    }

    if (raw == null) {
      // A quota-killed / null agent output is an abstain-equivalent -> NOT persisted -> re-cast.
      log(`Vote ${item.id}: null agent output (quota/abort) -- NOT persisted, re-cast on the next pass`);
      return null;
    }

    // The agent returns { vote, trace }: vote is the model's free-text vote JSON/object; trace is the
    // searchAndStop trace. SCORING RECONCILIATION: the scored verdict is the MODEL vote, NOT the trace.
    const agentVote = raw && typeof raw === 'object' && 'vote' in raw ? raw.vote : raw;
    const trace = raw && typeof raw === 'object' && 'trace' in raw ? raw.trace : null;

    const scored = toScoredVote(item.id, SEAT, agentVote, trace);

    if (scored == null) {
      // NO-ABSTENTION: a null/abstain/unparseable model verdict (or an un-diagnosable trace) is NOT
      // persisted and is RE-CAST on the next pass (skip-already-done skips only definite persisted votes).
      recast += 1;
      log(`Vote ${item.id}: abstain/unparseable model verdict (or bad trace) -- NOT persisted, re-cast on the next pass`);
      return null;
    }

    return scored;
  },
);

const scoredVotes = results.filter(Boolean);
log(`Voter dispatch done: seat=${SEAT} ${scoredVotes.length} definite vote(s) cast this run, ${recast} re-cast (abstain/null); orchestrator persists the definite votes via persistVote`);

return {
  seat: SEAT,
  model: MODEL,
  k: K,
  claims: CLAIM_UIDS.length,
  dispatched: todo.length,
  cast: scoredVotes.length,
  recast,
  scoredVotes,
};
