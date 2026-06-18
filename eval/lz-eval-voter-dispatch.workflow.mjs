export const meta = {
  name: 'lz-eval-voter-dispatch',
  description: 'D-08 offline gating-read voter-dispatch (CLOSED-BOOK realization, 19-04-REPLAN-DECISION-3): the ORCHESTRATOR runs a Node searchAndStop pre-pass in JS to produce the trace + the date-filtered evidence packet; this Workflow dispatches the PARAMETERIZED verify-voter seat (Sonnet Stage-1 / Haiku Stage-2) as a JUDGE over the INLINED date-filtered evidence (NO live web, NO self-search) and parses the agent return as a TEXT string; the orchestrator attaches the JS-produced trace, records the MODEL voter free-text verdict (scoring reconciliation T-19-19 -- never searchAndStop flag-enum), no-abstention re-cast, skip-already-done resumable + pace-able (maxInFlight honored), and reduces k votes/claim -> ONE pooled per-claim verdict (any-uphold); structured per eval/lz-review-gate.workflow.mjs (meta + marker SHARED block + injected globals, no import)',
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
// THE CLOSED-BOOK 3-PART REALIZATION (C1/I1/I2 fix, 19-04-REPLAN-DECISION-3): a Claude subagent
// dispatched by a Workflow is filesystem-blind + import-sealed and agent() returns a TEXT string -- it
// CANNOT run searchAndStop, the frozen staticKsAdapter ignores the query, and a string is not a
// {vote,trace} object. So:
//   PART 1 -- the ORCHESTRATOR (Task 4) runs the frozen searchAndStop in JS per claim over
//     staticKsAdapter(enrichedKs, claimId, claimDate) to produce the real {queries, depth, stop_reason}
//     trace + the date-filtered evidence packet. This pre-pass lives in the sibling importable module
//     eval/lz-eval-voter-dispatch.prepass.mjs (searchAndStopPrePass) -- NOT in this Workflow body (the
//     body is import-sealed). Packets are written to gitignored eval/.cache/.
//   PART 2 -- THIS Workflow dispatches the parameterized voter seat as a JUDGE over the INLINED
//     date-filtered evidence packet (passed in via args). The voter does NOT search, does NOT WebSearch,
//     does NOT rely on a fact-check article -- it judges the claim against ONLY the supplied window
//     (closed-book over a supplied packet) and returns a DEFINITE refuted/unrefuted verdict as a TEXT
//     string. The agent return is parsed as a STRING (the prior {vote,trace}-object assumption is
//     REMOVED); the trace handed to toScoredVote is the JS-PRODUCED trace from the packet, never a
//     model-returned trace.
//   PART 3 -- the ORCHESTRATOR attaches the JS trace, persists the MODEL verdict via persistVote, and
//     reduces the k votes/claim -> ONE pooled per-claim verdict via reducePooledVerdict (any-uphold).
//
// SCORING RECONCILIATION (T-19-19, load-bearing): the SCORED quantity is the MODEL voter's free-text
// vote.verdict over the INLINED date-filtered KS text (persisted in {unrefuted,refuted}, read by
// countFalseUpholds). searchAndStop's flag-driven mechanical verdict enum {judge-result,
// 'refuted-default','insufficient'} governs ONLY the JS-produced TRACE + the mechanical minimums and
// NEVER becomes the recorded vote. toScoredVote takes the verdict from the MODEL vote; a test FAILS if
// the dispatch records searchAndStop's verdict.
//
// NO-ABSTENTION (W1, load-bearing): the offline-read dispatch prompt REQUIRES a definite
// refuted/unrefuted verdict (the gating read measures the BINARY false-uphold; abstention is NOT a
// valid vote here). parseVoteVerdict returns null for a null/absent/abstain/unparseable verdict; a null
// verdict is NOT persisted (the orchestrator's persistVote would reject it anyway) and the claim is
// RE-CAST on the next pass (skip-already-done skips only a DEFINITE persisted vote). So each seat's
// pool completes only with definite votes and readDelta proceeds only at a complete exactly-nPooled
// pool.
//
// k->1 REDUCTION + FALSE-UPHOLD-OVER-k (I2): reducePooledVerdict (SHARED block below) applies the
// PRE-REGISTERED ANY-UPHOLD rule -- a claim's pooled verdict is 'unrefuted' (a FALSE-UPHOLD on a
// refuted-gold trap) if ANY of its k votes upholds, else 'refuted'. ANY-UPHOLD (not majority) is the
// conservative rule: a single silent uphold-on-absence is exactly the failure the gate hunts; it
// mirrors the shipped tally's downgrade-not-delete posture. readDelta consumes ONE pooled record/claim.
//
// RESUMABILITY + PACING (orchestrator-owned): the Workflow is filesystem-blind, so it cannot self-scan
// eval/.cache/ or self-persist. The ORCHESTRATOR (Task 4) scans the vote dir for already-persisted
// (definite) votes and passes the done set as args so the Workflow SKIPS them. The seat dispatch is
// PACE-ABLE (the usage pool is capped this session): maxInFlight caps the concurrent fan-out (W-3 --
// honored in code below by batching the todo into chunks of maxInFlight and pipelining each chunk in
// sequence), and the skip-already-done resume lets an interrupted run continue without re-casting
// completed votes.

// === LZ-EVAL-VOTER-DISPATCH-SHARED-START (canonical source; the workflow is self-contained -- tested via the harness slice) ===

// The search-and-stop trace stop_reason enum (mirrors searchAndStop's three outcomes + the offline-read
// driver's STOP_REASONS). A persisted trace must carry one of these so a null delta stays diagnosable
// (genuine parity vs both-stopped-early).
const STOP_REASONS = ['decisive-evidence', 'exhausted', 'min-not-met'];

// RE-PLAN-5 SEAT DIVERSITY (board r1-synthesis UNANIMOUS-2 + SHOULD-DO): the pre-registered ATTACK_MODES
// rotation. At k=9 each of the k seats per claim is assigned a DISTINCT attack-mode from this rotation so
// "all k resisted" means "resisted a BATTERY of distinct attacks", NOT k identical re-draws. The seven
// modes cover the board's named seat-styles (factual-contradiction / scope-causality-overclaim /
// source-provenance) plus the absence-of-evidence + quantifier/scope + causality/certainty +
// contradiction-vs-support disciplines, so k=9 rotates with coverage (>= 7 distinct modes). The voter
// agent (plugins/lz-advisor/agents/research-verify-voter-sonnet.md) knows these mode names.
const ATTACK_MODES = [
  'factual-contradiction',
  'scope-causality-overclaim',
  'source-provenance',
  'absence-of-evidence',
  'quantifier-scope',
  'causality-certainty',
  'contradiction-vs-support',
];

// attackModeForSeat(k): the deterministic seat-to-mode assignment (seat k -> ATTACK_MODES[k % len]). A
// sliceable function (not an inline expression) so the harness slice can drive it directly and assert the
// k=9 seats cover MULTIPLE distinct modes (DISCRIMINATING vs a constant). Picked ONCE here (re-choosing
// after seeing Stage-1 would be result-shopping; k=9 is at-or-above the frozen MIN_K floor).
function attackModeForSeat(k) {
  const idx = Number.isInteger(k) && k >= 0 ? k % ATTACK_MODES.length : 0;

  return ATTACK_MODES[idx];
}

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

// reducePooledVerdict(claimUid, kVotesForOneClaim): the k votes/claim -> ONE pooled per-claim vote
// record (I2; 19-04-REPLAN-DECISION-3). readDelta/countFalseUpholds consume EXACTLY ONE pooled record
// per claim keyed by the claim uid (the F3/F4 realized-count guard). The PRE-REGISTERED rule is
// ANY-UPHOLD (stated explicitly in the lock-rule before any vote): the pooled verdict is 'unrefuted'
// (a FALSE-UPHOLD on a refuted-gold trap) if ANY of the k votes is 'unrefuted', else 'refuted'.
// ANY-UPHOLD, NOT majority -- a single silent uphold-on-absence is exactly the failure the gate hunts,
// and the conservative rule mirrors the shipped tally's downgrade-not-delete posture. A representative
// trace (the first vote's trace) is attached so persistVote's trace contract holds. Each input vote is
// a scored record { id, seat, verdict, trace } (toScoredVote output); the pooled record's id is the
// CLAIM UID (not seat-uid-k). Throws on an empty pool or a non-{unrefuted,refuted} input verdict (a
// pool must never reduce silently from abstains -- those are re-cast, never pooled).
function reducePooledVerdict(claimUid, kVotesForOneClaim) {
  const votes = Array.isArray(kVotesForOneClaim) ? kVotesForOneClaim : [];

  if (votes.length === 0) {
    throw new Error('reducePooledVerdict: empty vote pool for claim ' + String(claimUid));
  }

  let seat = null;
  let trace = null;
  let anyUphold = false;

  for (const v of votes) {
    if (v == null || (v.verdict !== 'unrefuted' && v.verdict !== 'refuted')) {
      throw new Error('reducePooledVerdict: a pooled vote must be a definite {unrefuted,refuted} record for claim ' + String(claimUid));
    }

    if (seat == null) {
      seat = v.seat;
    }

    if (trace == null && v.trace != null) {
      trace = v.trace;
    }

    if (v.verdict === 'unrefuted') {
      anyUphold = true;
    }
  }

  return {
    id: String(claimUid),
    seat,
    verdict: anyUphold ? 'unrefuted' : 'refuted',
    trace,
  };
}

// === LZ-EVAL-VOTER-DISPATCH-SHARED-END ===

// ---------------------------------------------------------------------------
// Workflow-specific prompt builder (not shared with the harness slice; prose, not control logic). The
// CLOSED-BOOK realization (19-04-REPLAN-DECISION-3): the orchestrator INLINES the date-filtered evidence
// packet (the Node searchAndStop pre-pass docs -- strictly-pre-cutoff KS text) into the prompt; the
// voter JUDGES the claim against ONLY that supplied window. It does NOT search, does NOT WebSearch, does
// NOT rely on any fact-check article (closed-book over a supplied packet -- the leak-safety the design
// buys, D-07). The NO-ABSTENTION instruction requires a definite refuted/unrefuted (W1). The voter
// returns the vote JSON as a plain TEXT string (its FINAL message); the ORCHESTRATOR parses the string,
// attaches the JS-produced trace, and persists only a definite verdict via persistVote.
//
// claimText is the (mutated) trap claim; evidenceText is the inlined date-filtered packet rendered as
// numbered doc lines by the orchestrator (recipe-not-text discipline: the packet lives in gitignored
// eval/.cache/; the prompt inlines it only at dispatch time, never committed). attackMode (RE-PLAN-5) is
// the per-seat attack-mode from the ATTACK_MODES rotation (attackModeForSeat(k)) -- the prompt STATES it
// so each of the k seats frames its skepticism through a DISTINCT lens ("all k resisted" = resisted a
// battery of distinct attacks). The closed-book / no-abstention / no-self-search / judge-only / TEXT-return
// contract is otherwise UNCHANGED. The positive controls flow through this SAME prompt indistinguishably:
// the gold is NEVER in the prompt, so the voter cannot tell a control from a trap.
// ---------------------------------------------------------------------------
function voterPrompt(claimUid, k, claimText, evidenceText, attackMode) {
  return `You are the verify-voter seat for the OFFLINE known-gold gating read, casting vote ${k} on trap claim ${claimUid}.
ATTACK MODE: ${attackMode} -- frame your skepticism through this lens (this seat's assigned attack discipline).
CLOSED-BOOK over a SUPPLIED window: judge the CLAIM against ONLY the evidence below. Do NOT use live web search, do NOT search for anything, and do NOT rely on any external fact-check article -- the only admissible evidence is the date-filtered packet inlined here (retrieving the published verdict defeats the test). The per-claim publication-date cutoff was already ENFORCED by the orchestrator when it built this packet.
CLAIM: ${claimText}
EVIDENCE (date-filtered, strictly pre-cutoff; the ONLY admissible evidence):
${evidenceText}
Quote the relevant supplied text first, then judge whether the supplied evidence SUPPORTS the claim AS STATED.
NO ABSTENTION: this gating read measures the BINARY false-uphold, so you MUST return a DEFINITE verdict -- either "refuted" or "unrefuted". Do NOT abstain, do NOT return null, do NOT return "insufficient". If the supplied evidence does not fully support the claim as stated (including when the refutation is simply ABSENT from the packet), return "refuted".
Return the vote JSON { verdict, attack_mode, evidence_note } with verdict in {refuted, unrefuted} as your FINAL message (a single JSON object as plain text). Write NO files; the orchestrator persists it.`;
}

// ---------------------------------------------------------------------------
// Orchestration (CLOSED-BOOK realization): dispatch the parameterized voter seat at the k>=MIN_K floor
// over the remaining (skip-already-done) votes as a JUDGE over the INLINED date-filtered evidence
// packet (NO self-search, NO live web). The orchestrator owns the searchAndStop PRE-PASS (PART 1, in
// the sibling eval/lz-eval-voter-dispatch.prepass.mjs), persistence, and the k->1 reduction (PART 3,
// the workflow is filesystem-blind). The agent return is parsed as a TEXT string (the {vote,trace}
// object assumption is REMOVED); the trace attached to each scored vote is the JS-PRODUCED trace passed
// in via args.packets, never a model-returned trace. This returns the SCORED vote records (MODEL
// verdict + JS trace) for the votes cast THIS run; a null/abstain vote is NOT returned (re-cast next
// pass). The caller persists the definite votes via persistVote, re-runs to complete the pool, then
// reduces k->1 via reducePooledVerdict.
//
// args = { seat: 'sonnet'|'haiku', claimUids: [uid...], packets: { uid: { claimText, evidenceText,
//   trace } }, k?: 5, doneIds?: [id...], model?: 'sonnet', effort?: 'medium', maxInFlight?: 4 }
//
// packets[uid] is the Node pre-pass output (PART 1): claimText = the (mutated) trap claim;
// evidenceText = the inlined date-filtered packet rendered as numbered lines; trace = the JS-produced
// searchAndStop { queries, depth, stop_reason } trace for that claim. The Workflow inlines claimText +
// evidenceText into the judge prompt and attaches `trace` to the scored vote (it NEVER asks the model
// for a trace -- a Workflow/subagent cannot run searchAndStop).
// ---------------------------------------------------------------------------

const A = typeof args === 'object' && args ? args : {};
const SEAT = typeof A.seat === 'string' && A.seat.length > 0 ? A.seat : 'sonnet';
const CLAIM_UIDS = Array.isArray(A.claimUids) ? A.claimUids : [];
const PACKETS = A.packets && typeof A.packets === 'object' ? A.packets : {};
// RE-PLAN-5: the DISPATCH DEFAULT k floor is RAISED to 9 (board UNANIMOUS-2; picked ONCE here). An
// explicit A.k >= MIN_K is honored verbatim (kFloorAtLeast tightens-only); an UNSET A.k defaults to 9
// (zone 9-11; under any-uphold each extra vote is one more chance to expose a false-uphold -> more
// conservative for a saturation gate; the extra k is spent on SEAT DIVERSITY across distinct
// attack-modes, NOT identical re-draws). This is a DEFAULT change, NOT a MIN_K threshold change -- the
// frozen MIN_K floor in kFloorAtLeast STAYS 5.
const K = kFloorAtLeast(Number.isInteger(A.k) ? A.k : 9, 5);
const DONE_IDS = Array.isArray(A.doneIds) ? A.doneIds : [];
// W-3: maxInFlight caps the concurrent fan-out. A positive-integer request is honored; otherwise the
// default cap of 4. The cap is HONORED below by batching `todo` into chunks of MAX_IN_FLIGHT and
// pipelining each chunk in sequence (so no more than MAX_IN_FLIGHT agents run concurrently) -- the
// pace-able claim is real, not a phantom arg.
const MAX_IN_FLIGHT = Number.isInteger(A.maxInFlight) && A.maxInFlight > 0 ? A.maxInFlight : 4;
// The seat is parameterized so 19-05 (Haiku Stage 2) reuses this exact Workflow: Stage 1 = Sonnet
// (model:'sonnet', effort:'medium'); Stage 2 = Haiku (model:'haiku').
const MODEL = typeof A.model === 'string' && A.model.length > 0 ? A.model : (SEAT === 'haiku' ? 'haiku' : 'sonnet');
const EFFORT = typeof A.effort === 'string' && A.effort.length > 0 ? A.effort : 'medium';

if (CLAIM_UIDS.length === 0) {
  log('No claimUids passed (args.claimUids is empty) -- nothing to dispatch.');
  return { seat: SEAT, k: K, dispatched: 0, recast: 0, scoredVotes: [] };
}

const todo = remainingVotes(CLAIM_UIDS, SEAT, K, DONE_IDS);
log(`Voter dispatch (closed-book judge): seat=${SEAT} model=${MODEL} k=${K} ${todo.length} vote(s) remaining (skip-already-done over ${CLAIM_UIDS.length} claim(s)); maxInFlight=${MAX_IN_FLIGHT}`);

let recast = 0;

const judgeVote = async (item) => {
  const packet = PACKETS[item.claimUid];

  if (packet == null || typeof packet !== 'object') {
    // No pre-pass packet for this claim -- the orchestrator must supply one (PART 1). A missing packet
    // is an orchestration error, not an abstain; do NOT dispatch a judge with no evidence -> re-cast.
    recast += 1;
    log(`Vote ${item.id}: no evidence packet supplied (orchestrator PART 1 missing) -- NOT dispatched, re-cast`);
    return null;
  }

  // The voter AGENT is a JUDGE over the INLINED date-filtered packet (closed-book; NO self-search, NO
  // live web). The return is a TEXT string -- the model's vote JSON as plain text (parsed leniently by
  // parseVoteVerdict). The TRACE is the JS-PRODUCED searchAndStop trace from the packet, attached
  // orchestrator-side -- never asked of the model.
  let raw;

  // RE-PLAN-5: assign this seat its DISTINCT attack-mode from the pre-registered rotation (seat k ->
  // ATTACK_MODES[k % len]) and state it in the prompt, so the k seats per claim resist a BATTERY of
  // distinct attacks rather than k identical re-draws.
  const attackMode = attackModeForSeat(item.k);

  try {
    raw = await agent(
      voterPrompt(item.claimUid, item.k, packet.claimText, packet.evidenceText, attackMode),
      { model: MODEL, effort: EFFORT, phase: 'Dispatch', label: `vote ${SEAT} ${item.claimUid} k${item.k} ${attackMode}` },
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

  // SCORING RECONCILIATION (T-19-19): the scored verdict is the MODEL vote, parsed from the TEXT string
  // return (parseVoteVerdict handles a raw JSON string leniently). The trace is the JS-PRODUCED trace
  // from the packet, NOT a model-returned trace (the {vote,trace}-object assumption is REMOVED).
  const scored = toScoredVote(item.id, SEAT, raw, packet.trace);

  if (scored == null) {
    // NO-ABSTENTION: a null/abstain/unparseable model verdict (or an un-diagnosable trace) is NOT
    // persisted and is RE-CAST on the next pass (skip-already-done skips only definite persisted votes).
    recast += 1;
    log(`Vote ${item.id}: abstain/unparseable model verdict (or bad trace) -- NOT persisted, re-cast on the next pass`);
    return null;
  }

  return scored;
};

// W-3: HONOR maxInFlight -- batch `todo` into chunks of MAX_IN_FLIGHT and pipeline each chunk in
// sequence, so at most MAX_IN_FLIGHT judge agents run concurrently (the platform pipeline() fans the
// whole chunk out in parallel; sequencing the chunks caps the concurrency). The skip-already-done
// resume is the other half of pacing (an interrupted run re-runs only the not-done votes).
const results = [];

for (let i = 0; i < todo.length; i += MAX_IN_FLIGHT) {
  const chunk = todo.slice(i, i + MAX_IN_FLIGHT);
  const chunkResults = await pipeline(chunk, judgeVote);

  for (const r of chunkResults) {
    results.push(r);
  }
}

const scoredVotes = results.filter(Boolean);
log(`Voter dispatch done: seat=${SEAT} ${scoredVotes.length} definite vote(s) cast this run, ${recast} re-cast (abstain/null/no-packet); orchestrator persists the definite votes via persistVote + reduces k->1`);

return {
  seat: SEAT,
  model: MODEL,
  k: K,
  maxInFlight: MAX_IN_FLIGHT,
  claims: CLAIM_UIDS.length,
  dispatched: todo.length,
  cast: scoredVotes.length,
  recast,
  scoredVotes,
};
