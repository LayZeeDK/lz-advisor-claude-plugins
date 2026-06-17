// lz-eval-voter-dispatch.prepass.mjs
//
// PART 1 of the CLOSED-BOOK 3-part voter-dispatch realization (19-04-REPLAN-DECISION-3; the C1 fix):
// the Node DEV-TREE searchAndStop PRE-PASS. A Workflow body is import-sealed (it cannot `import` the
// frozen spine) and a dispatched subagent is filesystem-blind and returns only a TEXT string -- so it
// CANNOT run searchAndStop and the frozen staticKsAdapter ignores the query. Therefore the ORCHESTRATOR
// (Task 4) runs the frozen searchAndStop in JS here, OUTSIDE the Workflow execution, to produce the
// real { queries, depth, stop_reason } trace + the date-filtered evidence packet the dispatch Workflow
// then INLINES for a JUDGE-ONLY verdict. This module is IMPORTABLE (plain ESM) -- it is the importable
// surface the orchestrator calls; it is NEVER loaded by the Workflow runtime (which rejects all
// import). It composes the FROZEN spine (searchAndStop / staticKsAdapter / dateFilter) -- never rewrites
// it.
//
// The reducePooledVerdict k->1 reduction (PART 3) lives in the Workflow's SHARED block (it is pure
// control logic, needs no imports, and is unit-tested via the harness slice). This module owns only the
// frozen-spine-bound PRE-PASS (PART 1), which needs the imports.
//
// SCORING RECONCILIATION (T-19-19): the trace this pre-pass produces is the searchAndStop MECHANICAL
// trace -- the diagnostic { queries, depth, stop_reason } + the mechanical-minimums outcome. It is NOT
// the scored quantity. The SCORED quantity is the MODEL voter's free-text verdict over the INLINED
// evidence packet (the Workflow's judge pass, PART 2). The pre-pass trace is attached orchestrator-side
// so persistVote's trace contract holds; searchAndStop's flag-verdict enum NEVER becomes the vote.
//
// CONSTRUCT-SCOPE BOUNDARY: because the frozen staticKsAdapter ignores the query, the model's
// query-formulation / search-depth / premature-stop is NOT exercised through this seam -- retrieval
// orchestration is NOT measured offline (it defers to the Phase-20 live operational shadow). The
// pre-pass is a deterministic JS retrieval over the fixed pre-cutoff doc set; the offline gate measures
// CLOSED-BOOK JUDGMENT over the supplied window, NOT retrieval (19-04-REPLAN-DECISION-3 item 4).
//
// Tree / dependency boundary (D-10/D-11): this script lives in the repo-level eval/ dev tree, NEVER in
// the distributed plugin tree; it composes the FROZEN spine within the eval tree only. zero npm deps.
//
// This source contains no literal byte-order mark and is strictly ASCII (per CLAUDE.md).

import {
  searchAndStop,
  staticKsAdapter,
  SEARCH_DEFAULTS,
} from './lz-eval-search-loop.mjs';

import {
  ContractError,
} from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

// ---------------------------------------------------------------------------
// renderEvidenceText(docs): render the date-filtered evidence packet as numbered plain-text lines the
// judge prompt inlines. Recipe-not-text discipline: the packet is built only at dispatch time and lives
// in gitignored eval/.cache/; this renderer formats it for the prompt, never for the committed tree.
// Each line is `[i] <sentence>` (the doc.sentence the model reads -- the flags are NOT rendered, so the
// gold label never leaks into the inlined evidence). An empty packet renders a single explicit
// "(no in-window evidence)" line so the judge sees the ABSENCE rather than an empty string.
// ---------------------------------------------------------------------------
export function renderEvidenceText(docs) {
  const arr = Array.isArray(docs) ? docs : [];

  if (arr.length === 0) {
    return '(no in-window evidence: the date-filtered packet is empty -- judge on ABSENCE)';
  }

  return arr
    .map((d, i) => {
      const sentence = d != null && typeof d.sentence === 'string' ? d.sentence : '';
      return '[' + i + '] ' + sentence;
    })
    .join('\n');
}

// ---------------------------------------------------------------------------
// searchAndStopPrePass({ claim, claimUid, claimText, enrichedKs, claimId, claimDate, attackMode,
//   minQueries, minDocs, maxQueries }): run the FROZEN searchAndStop in JS over
// staticKsAdapter(enrichedKs, claimId, claimDate) to produce the per-claim { queries, depth,
// stop_reason } trace + the date-filtered evidence packet the dispatch Workflow inlines for a JUDGE-ONLY
// verdict. Returns { trace, docs, claimText, evidenceText } -- exactly the per-claim `packet` the
// Workflow's args.packets[claimUid] expects (claimText + evidenceText + trace).
//
//   - enrichedKs is the date-enriched KS for this claim (the Task-1 enrichKsForClaim output);
//     staticKsAdapter date-filters it strictly pre-cutoff (the frozen dateFilter, D-07) and IGNORES the
//     query (signature parity only) -- the date-filtered docs are the inlined packet.
//   - claimDate is a Date (the frozen parser output) -- staticKsAdapter requires a Date claimDate.
//   - claim is the searchAndStop claim object { id, text, ... }; minimums default to SEARCH_DEFAULTS and
//     may only be TIGHTENED (raised), never loosened (the calibrator ratchet).
//
// The returned trace is normalized to the dispatch's { queries, depth, stop_reason } shape (the
// searchAndStop trace already has it). searchAndStop's mechanical verdict enum is DISCARDED here (it is
// the trace + minimums only -- T-19-19); only the trace is carried forward.
// ---------------------------------------------------------------------------
export function searchAndStopPrePass({
  claim,
  claimText,
  enrichedKs,
  claimId,
  claimDate,
  attackMode = 'disconfirm',
  minQueries = SEARCH_DEFAULTS.minQueries,
  minDocs = SEARCH_DEFAULTS.minDocs,
  maxQueries = SEARCH_DEFAULTS.maxQueries,
} = {}) {
  if (claim == null || typeof claim !== 'object') {
    throw new ContractError('searchAndStopPrePass requires a claim object', 'searchAndStopPrePass');
  }

  if (!Array.isArray(enrichedKs)) {
    throw new ContractError('searchAndStopPrePass requires an enrichedKs array', 'searchAndStopPrePass');
  }

  if (!(claimDate instanceof Date) || Number.isNaN(claimDate.getTime())) {
    throw new ContractError('searchAndStopPrePass requires a valid claimDate Date', 'searchAndStopPrePass');
  }

  // Build the date-filtered adapter over THIS claim's enriched KS (the frozen dateFilter is applied
  // inside staticKsAdapter; the query is ignored). ksByClaim keys by claimId.
  const ksByClaim = { [claimId]: enrichedKs };
  const adapter = staticKsAdapter(ksByClaim, claimId, claimDate);

  // The date-filtered evidence packet (strictly pre-cutoff) -- the docs the voter judges. fetchResults
  // ignores the query, so any query yields the same fixed pre-cutoff set; capture it once.
  const docs = adapter.fetchResults('disconfirm');

  // Run the FROZEN searchAndStop to produce the real trace. Its verdict enum is DISCARDED (trace +
  // minimums only). The trace is the diagnostic { queries, depth, stop_reason } persistVote requires.
  const { trace } = searchAndStop({ claim, attackMode, adapter, minQueries, minDocs, maxQueries });

  return {
    trace: { queries: trace.queries, depth: trace.depth, stop_reason: trace.stop_reason },
    docs,
    claimText: typeof claimText === 'string' ? claimText : (typeof claim.text === 'string' ? claim.text : ''),
    evidenceText: renderEvidenceText(docs),
  };
}
