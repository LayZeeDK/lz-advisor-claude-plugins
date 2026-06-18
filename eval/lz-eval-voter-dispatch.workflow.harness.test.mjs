// lz-eval-voter-dispatch.workflow.harness.test.mjs
//
// THE test for the D-08 voter-dispatch dynamic workflow (eval/lz-eval-voter-dispatch.workflow.mjs). It
// is the single source of truth's single test -- there is no separate lib and no anti-drift proxy.
//
// WHY a harness (researched 2026-06-16, eval/lz-review-gate.workflow.harness.test.mjs): workflow
// scripts cannot be node-tested by plain import -- top-level return/await are only legal inside the
// runtime's wrapper function, and module loading is sealed off (static import is rejected as "import
// call expects one or two arguments"; dynamic import() as "import() is not available in workflow
// scripts"). There is NO official unit-testing API for workflow scripts. The governing principle is
// "test the artifacts, not the prose": this harness mirrors the runtime's own execution model
// (de-export meta, wrap the body in an async function, inject MOCK globals) to run the REAL
// orchestration deterministically, asserts on its observable outputs, and slices the real
// control-helper block to exercise the actual functions.
//
// COVERAGE BOUNDARY (W3, 19-04-REPLAN-DECISION-3): the harness mocks the JUDGE agent (which is correct
// -- the agent return is a TEXT string in the closed-book realization), so the orchestration tests prove
// the deterministic CONTROL LOGIC of the dispatch (the scoring-reconciliation mapping, the no-abstention
// re-cast, skip-already-done, the k-floor, the trace shape, the maxInFlight cap, the readDelta guard,
// the reducePooledVerdict k->1 reduction). The ENRICHED-KS-over-searchAndStop binding (PART 1) rests on
// (a) the frozen eval/lz-eval-search-loop.test.mjs, (b) the Task-1 enrichment tests, PLUS (c) the NEW
// INTEGRATION SMOKE below over the REAL searchAndStopPrePass (the sibling prepass module) -- so I1 (the
// harness never touching the real binding) cannot recur. The judge mock returns the REAL TEXT STRING
// contract (a JSON vote string), NEVER a {vote,trace} object (the I1 false-confidence fix).
//
// HOST QUIRK: gate on the explicit FILE form:
//   node --test eval/lz-eval-voter-dispatch.workflow.harness.test.mjs
//
// This source contains no literal byte-order mark and is strictly ASCII (per CLAUDE.md).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// The BUILT decision driver (consumed, never rewritten): the REAL persistVote (rejects non-{unrefuted,
// refuted} -- the no-abstention persistence guard) + readDelta (the F3/F4 realized-count guard) +
// STOP_REASONS. The harness exercises them with the dispatch's scored-vote records so the resumability
// proof is end-to-end against the real persistence + read.
import {
  persistVote,
  readDelta,
  STOP_REASONS,
} from './lz-eval-offline-read.mjs';

// PART 1 of the closed-book realization -- the REAL Node searchAndStop pre-pass (the sibling importable
// module). The integration smoke drives this over a tiny enriched KS (no model call) to prove the JS
// pre-pass actually produces the { queries, depth, stop_reason } trace + the date-filtered packet the
// dispatch attaches (so I1 -- the harness never touching the real binding -- cannot recur).
import {
  searchAndStopPrePass,
  renderEvidenceText,
} from './lz-eval-voter-dispatch.prepass.mjs';

import { parseAvtDate } from './lz-eval-search-loop.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const WF = path.join(HERE, 'lz-eval-voter-dispatch.workflow.mjs');
const SRC = fs.readFileSync(WF, 'utf8');

// De-export the meta literal so the source is valid inside a function body (the runtime extracts meta
// separately). No other top-level exports exist in the workflow.
function deExport(src) {
  return src.replace(/^export\s+const\s+meta\s*=/m, 'const meta =');
}

// Mirror the runtime: the de-exported body inside an async IIFE with the injected globals as
// parameters. Top-level return/await in the body become valid here -- exactly the runtime model.
function makeRunner() {
  const body = deExport(SRC);
  // eslint-disable-next-line no-new-func
  return new Function(
    'agent', 'parallel', 'pipeline', 'log', 'phase', 'args', 'budget', 'workflow',
    `"use strict";\nreturn (async () => {\n${body}\n})();`,
  );
}

// Faithful-enough pipeline: each item through the single stage; a throwing stage drops the item to null
// (matches the documented pipeline contract). The dispatch fans out votes through one stage.
async function fakePipeline(items, ...stages) {
  return Promise.all(items.map(async (it, i) => {
    let v = it;

    for (const st of stages) {
      try {
        v = await st(v, it, i);
      } catch {
        v = null;
        break;
      }
    }

    return v;
  }));
}

const noop = () => {};

function runWorkflow(agent, argsObj) {
  return makeRunner()(agent, null, fakePipeline, noop, noop, argsObj, null, null);
}

// Slice the real inlined control-helper block from the workflow source and execute it, so the tests
// exercise the ACTUAL functions that run in production (no copy, no lib).
function getHelpers() {
  const startIdx = SRC.indexOf('LZ-EVAL-VOTER-DISPATCH-SHARED-START');
  const endIdx = SRC.indexOf('LZ-EVAL-VOTER-DISPATCH-SHARED-END');
  assert.ok(startIdx > 0, 'shared-block START marker missing');
  assert.ok(endIdx > startIdx, 'shared-block END marker missing or precedes START');
  const headerOnly = deExport(SRC.slice(0, endIdx));
  // W-1 (RE-PLAN-5): the allow-list ADDS ATTACK_MODES + attackModeForSeat so the seat-diversity test can
  // reach them from the SHARED block slice (they are NOT reachable as-is without this).
  const exportTail = 'return { STOP_REASONS, parseVoteVerdict, toScoredVote, voteId, remainingVotes, kFloorAtLeast, reducePooledVerdict, ATTACK_MODES, attackModeForSeat };';
  // eslint-disable-next-line no-new-func
  return new Function(`"use strict";\n${headerOnly}\n${exportTail}`)();
}

const H = getHelpers();

// A canonical searchAndStop-shaped trace whose mechanical flag-verdict DIFFERS from the model verdict.
function traceWithStop(stopReason) {
  return { queries: ['disconfirm:r0:c', 'disconfirm:r1:c', 'disconfirm:r2:c'], depth: 6, stop_reason: stopReason };
}

// The REAL agent-return contract in the closed-book realization is a TEXT STRING (a JSON vote string),
// NEVER a {vote,trace} object (the I1 fix). Build the string the way a real judge agent would emit it.
function voteString(verdict) {
  return JSON.stringify({ verdict, attack_mode: 'disconfirm', evidence_note: 'judged inlined packet' });
}

// Build the per-claim `packets` arg the orchestrator (PART 1) supplies: each packet carries the inlined
// claimText + evidenceText + the JS-PRODUCED trace. The orchestration tests must supply a packet per
// claimUid (a missing packet is treated as an orchestration error -> re-cast, not dispatched).
function packetsFor(claimUids, stopReason) {
  const out = {};

  for (const uid of (Array.isArray(claimUids) ? claimUids : [])) {
    out[uid] = {
      claimText: 'trap claim ' + uid,
      evidenceText: '[0] supporting sentence (date-filtered)\n[1] another in-window doc',
      trace: traceWithStop(stopReason),
    };
  }

  return out;
}

// ===========================================================================
// Control helpers, executed DIRECTLY from the real workflow source.
// ===========================================================================

test('parseVoteVerdict: definite model verdict is returned; null/abstain/unparseable -> null (no-abstention)', () => {
  assert.equal(H.parseVoteVerdict({ verdict: 'refuted' }), 'refuted');
  assert.equal(H.parseVoteVerdict({ verdict: 'unrefuted' }), 'unrefuted');
  // The model vote as a RAW JSON string is parsed leniently.
  assert.equal(H.parseVoteVerdict('{"verdict":"refuted"}'), 'refuted');
  // Abstain forms -> null (re-cast).
  assert.equal(H.parseVoteVerdict({ verdict: null }), null);
  assert.equal(H.parseVoteVerdict({}), null, 'absent verdict -> null');
  assert.equal(H.parseVoteVerdict({ verdict: 'insufficient' }), null, "searchAndStop's 'insufficient' is NOT a definite vote");
  assert.equal(H.parseVoteVerdict({ verdict: 'judge-result' }), null, "searchAndStop's flag enum is NOT a model verdict");
  assert.equal(H.parseVoteVerdict('not json'), null, 'unparseable -> null');
  assert.equal(H.parseVoteVerdict(null), null);
});

test('SCORING RECONCILIATION (T-19-19): toScoredVote takes the verdict from the MODEL vote, NEVER searchAndStop flag-enum', () => {
  // The MODEL vote says 'refuted'; the searchAndStop trace's mechanical flag-verdict is 'insufficient'
  // (min-not-met) -- a DIFFERENT enum. The persisted vote.verdict MUST be the MODEL's 'refuted'.
  const scored = H.toScoredVote('sonnet-c1-0', 'sonnet', { verdict: 'refuted' }, traceWithStop('exhausted'));
  assert.equal(scored.verdict, 'refuted', 'the scored verdict is the model vote');
  assert.equal(scored.trace.stop_reason, 'exhausted', 'the trace stop_reason is searchAndStop mechanical (diagnostic only)');

  // DISCRIMINATING: even when searchAndStop's enum would say 'refuted-default'/'insufficient', the model
  // vote (here 'unrefuted') wins -- proving the dispatch never records the flag-enum as the scored value.
  const scored2 = H.toScoredVote('sonnet-c2-0', 'sonnet', { verdict: 'unrefuted' }, { queries: ['q'], depth: 5, stop_reason: 'decisive-evidence' });
  assert.equal(scored2.verdict, 'unrefuted', 'the model unrefuted wins over the trace mechanical outcome');

  // The trace is the searchAndStop trace; its stop_reason must be a KNOWN reason (else not persistable).
  assert.ok(H.STOP_REASONS.includes(scored2.trace.stop_reason), 'the trace stop_reason is a known STOP_REASON');
});

test('toScoredVote: an abstain model verdict -> null (NOT persisted -> re-cast); an un-diagnosable trace -> null', () => {
  // Abstain model verdict -> null (no record built).
  assert.equal(H.toScoredVote('sonnet-c1-0', 'sonnet', { verdict: null }, traceWithStop('exhausted')), null);
  // A definite model verdict but an UNKNOWN trace stop_reason -> null (an un-diagnosable trace can never
  // be persisted -- mirrors persistVote's STOP_REASONS guard).
  assert.equal(H.toScoredVote('sonnet-c1-0', 'sonnet', { verdict: 'refuted' }, { queries: [], depth: 5, stop_reason: 'bogus' }), null);
  // A missing trace -> null.
  assert.equal(H.toScoredVote('sonnet-c1-0', 'sonnet', { verdict: 'refuted' }, null), null);
});

test('remainingVotes: skip-already-done expands only the k NOT already done; kFloorAtLeast enforces the MIN_K floor', () => {
  // 2 claims, k=3 floor, with sonnet-c1-0 already done -> 5 remaining (c1 keeps k1,k2; c2 keeps k0,k1,k2).
  const todo = H.remainingVotes(['c1', 'c2'], 'sonnet', 3, ['sonnet-c1-0']);
  assert.equal(todo.length, 5, 'the one done vote is skipped');
  assert.equal(todo.find((t) => t.id === 'sonnet-c1-0'), undefined, 'the done vote is not re-cast');
  assert.ok(todo.some((t) => t.id === 'sonnet-c1-1'), 'the not-done k are still cast');

  // kFloorAtLeast: a request below MIN_K (5) is raised to the floor; the calibrator may only tighten.
  assert.equal(H.kFloorAtLeast(2, 5), 5, 'k below MIN_K is raised to the floor');
  assert.equal(H.kFloorAtLeast(7, 5), 7, 'k above MIN_K is honored (tighten only)');
  assert.equal(H.kFloorAtLeast(undefined, 5), 5, 'a missing k falls back to the floor');
});

test('reducePooledVerdict (I2): k votes -> ONE pooled per-claim record; ANY uphold among k -> pooled false-uphold (DISCRIMINATING, not majority)', () => {
  const tr = traceWithStop('exhausted');
  const v = (verdict) => ({ id: 'sonnet-c1-x', seat: 'sonnet', verdict, trace: tr });

  // ALL refuted -> pooled refuted (a clean stratum). The pooled record is keyed by the CLAIM UID.
  const allRefuted = H.reducePooledVerdict('c1', [v('refuted'), v('refuted'), v('refuted'), v('refuted'), v('refuted')]);
  assert.equal(allRefuted.id, 'c1', 'the pooled record is keyed by the claim uid (not seat-uid-k)');
  assert.equal(allRefuted.verdict, 'refuted', 'k all-refuted -> pooled refuted');
  assert.equal(allRefuted.seat, 'sonnet', 'the pooled record carries the seat');
  assert.ok(allRefuted.trace && Array.isArray(allRefuted.trace.queries), 'a representative trace is attached');

  // ANY uphold among k -> pooled unrefuted (a FALSE-UPHOLD). DISCRIMINATING: a SINGLE uphold among 5
  // flips the pooled verdict -- the conservative any-uphold rule, NOT majority (4/5 refuted would be
  // 'refuted' under majority, but it is 'unrefuted' here because one vote upheld).
  const oneUphold = H.reducePooledVerdict('c2', [v('refuted'), v('refuted'), v('unrefuted'), v('refuted'), v('refuted')]);
  assert.equal(oneUphold.verdict, 'unrefuted', 'a single uphold among k -> pooled false-uphold (any-uphold, not majority)');

  // An empty pool throws (a pool must never reduce silently); an abstain in the pool throws (abstains
  // are re-cast, never pooled).
  assert.throws(() => H.reducePooledVerdict('c3', []), /empty vote pool/, 'an empty pool throws');
  assert.throws(() => H.reducePooledVerdict('c4', [v('refuted'), v(null)]), /definite/, 'an abstain in the pool throws');
});

test('SEAT DIVERSITY (W-1, RE-PLAN-5): attackModeForSeat over k in [0..8] covers MULTIPLE distinct attack-modes (DISCRIMINATING vs a constant)', () => {
  // The k=9 seats per claim each get a DISTINCT attack-mode from the pre-registered rotation -- "all k
  // resisted" means resisted a BATTERY of distinct attacks, NOT k identical re-draws. DISCRIMINATING: a
  // regression returning a constant (or always seat 0) would collapse the set to size 1 and fail.
  const modes = [];

  for (let k = 0; k <= 8; k += 1) {
    modes.push(H.attackModeForSeat(k));
  }

  const distinct = new Set(modes);
  assert.ok(distinct.size > 1, 'the k=9 seats cover MULTIPLE distinct attack-modes (not a constant)');
  // With 7 rotation entries, k in [0..8] covers ALL 7 (the first 7 are distinct, then it wraps).
  assert.equal(distinct.size, H.ATTACK_MODES.length, 'k in [0..8] covers every distinct attack-mode in the rotation');
  // Deterministic seat k -> ATTACK_MODES[k % len].
  assert.equal(H.attackModeForSeat(0), H.ATTACK_MODES[0], 'seat 0 -> the first mode');
  assert.equal(H.attackModeForSeat(7), H.ATTACK_MODES[0], 'seat 7 wraps to the first mode (k % len)');
  assert.equal(H.attackModeForSeat(8), H.ATTACK_MODES[1], 'seat 8 wraps to the second mode');
  // The rotation includes the board's named seat-styles.
  assert.ok(H.ATTACK_MODES.includes('factual-contradiction'), 'the rotation includes factual-contradiction');
  assert.ok(H.ATTACK_MODES.includes('scope-causality-overclaim'), 'the rotation includes scope-causality-overclaim');
  assert.ok(H.ATTACK_MODES.includes('source-provenance'), 'the rotation includes source-provenance');
  assert.ok(H.ATTACK_MODES.length >= 7, 'at least 7 distinct modes so k=9 rotates with coverage');
});

// ===========================================================================
// RE-PLAN-7 (Task 3): the THREE-voter seat selection + the per-model prompt-sha recording (#2) + the
// symmetric reduction on both arms per model (F6).
// ===========================================================================

test('RE-PLAN-7 three-voter seat selection: the dispatch records the SELECTED model + the frozen prompt-sha per seat (#2; DISCRIMINATING -- a wrong-model/wrong-prompt seat is detectable)', async () => {
  // The dispatch is parameterized over a measured model in { sonnet, haiku, opus }; the orchestrator
  // passes the per-model FAIR PROMPT agent file's frozen sha (args.promptSha). The dispatch RECORDS the
  // selected model + the prompt-sha per seat so the run artifact can assert the frozen sha.
  const agent = async () => voteString('refuted');

  const haikuSha = 'haiku-prompt-sha-aaaa';
  const haiku = await runWorkflow(agent, { seat: 'haiku', claimUids: ['c1'], k: 5, packets: packetsFor(['c1'], 'exhausted'), promptSha: haikuSha });
  assert.equal(haiku.model, 'haiku', 'the haiku seat resolves the haiku model');
  assert.equal(haiku.promptSha, haikuSha, 'the dispatch records the haiku prompt-sha (the run artifact asserts the frozen sha)');

  for (const v of haiku.scoredVotes) {
    assert.equal(v.model, 'haiku', 'each scored vote records the SELECTED model (haiku)');
    assert.equal(v.promptSha, haikuSha, 'each scored vote records the per-model frozen prompt-sha');
  }

  // The Opus reference voter is a DISTINCT seat with a DISTINCT prompt-sha (NOT a Sonnet copy -- W4).
  const opusSha = 'opus-prompt-sha-bbbb';
  const opus = await runWorkflow(agent, { seat: 'opus', claimUids: ['c1'], k: 5, packets: packetsFor(['c1'], 'exhausted'), promptSha: opusSha });
  assert.equal(opus.model, 'opus', 'the opus seat resolves the opus model (the measured reference voter)');
  assert.notEqual(opus.promptSha, haikuSha, 'the Opus prompt-sha differs from the Haiku prompt-sha (per-model fair prompts, #2)');

  // DISCRIMINATING: the Sonnet seat records the Sonnet sha, distinct from Opus (not a shared prompt).
  const sonnetSha = 'sonnet-prompt-sha-cccc';
  const sonnet = await runWorkflow(agent, { seat: 'sonnet', claimUids: ['c1'], k: 5, packets: packetsFor(['c1'], 'exhausted'), promptSha: sonnetSha });
  assert.equal(sonnet.model, 'sonnet', 'the sonnet seat resolves the sonnet model');
  assert.notEqual(sonnet.promptSha, opus.promptSha, 'the Sonnet prompt-sha differs from the Opus prompt-sha (per-model fair prompts, NOT a shared prompt)');
});

test('RE-PLAN-7 symmetric reduction (F6): any-seat-REFUTE on a control is the over-refusal event, mirroring any-seat-UPHOLD on a trap (reducePooledVerdict is symmetric on both arms)', () => {
  const tr = traceWithStop('exhausted');
  const v = (verdict) => ({ id: 'sonnet-ctrl-x', seat: 'sonnet', verdict, trace: tr });

  // ON A CONTROL (gold=unrefuted), the voter SHOULD uphold (vote 'unrefuted'). Any-seat-REFUTE among k is
  // the OVER-REFUSAL event -- mirroring any-seat-UPHOLD on a trap. The pooled record is 'refuted' (the
  // over-refusal) if ANY seat refuted, so the downstream scorePositiveControls counts it as an over-refusal.
  const allUphold = H.reducePooledVerdict('ctrl-1', [v('unrefuted'), v('unrefuted'), v('unrefuted'), v('unrefuted'), v('unrefuted')]);
  assert.equal(allUphold.verdict, 'unrefuted', 'a control all seats uphold -> pooled unrefuted (no over-refusal)');

  const oneRefute = H.reducePooledVerdict('ctrl-2', [v('unrefuted'), v('refuted'), v('unrefuted'), v('unrefuted'), v('unrefuted')]);
  // any-uphold reduction: a single uphold among k makes the pooled verdict 'unrefuted' -- so the
  // OVER-REFUSAL event is detected at the per-seat level (a control with a pooled 'unrefuted' that still
  // had a refute seat). The reduction is the SAME function on both arms (symmetric); the over-refusal
  // accounting reads per-seat refutes on the control arm (the downstream scorePositiveControls scores it).
  assert.equal(oneRefute.verdict, 'unrefuted', 'one refute among k still pools to unrefuted (any-uphold) -- the SAME reducer applies to both arms (F6)');

  // The all-refute degenerate control (every seat refuses) -> pooled 'refuted' = the over-refusal event
  // the F1 always-refute detector reads (symmetric mirror of the all-uphold trap = a full false-uphold).
  const allRefute = H.reducePooledVerdict('ctrl-3', [v('refuted'), v('refuted'), v('refuted'), v('refuted'), v('refuted')]);
  assert.equal(allRefute.verdict, 'refuted', 'a control all seats refute -> pooled refuted (the over-refusal event, F1)');
});

// ===========================================================================
// Orchestration: the real dispatch loop/fan-out, driven by scripted mock agents.
// ===========================================================================

test('orchestration: empty claimUids returns early without spawning agents', async () => {
  let called = false;
  const agent = async () => {
    called = true;
    return voteString('refuted');
  };
  const result = await runWorkflow(agent, { seat: 'sonnet', claimUids: [] });
  assert.equal(result.dispatched, 0);
  assert.equal(called, false);
});

test('orchestration: the closed-book judge agent returns a TEXT STRING (I1 fix) -- the dispatch builds the scored vote from the STRING + the PASSED-IN packet trace', async () => {
  // I1 FIX: the mock agent returns the REAL contract -- a JSON vote STRING (NOT a {vote,trace} object).
  // The trace on the scored vote is the JS-PRODUCED packet trace, NOT anything the agent returned.
  const received = [];
  const agent = async (_p) => {
    received.push(typeof voteString('refuted')); // record the return TYPE the dispatch consumes
    return voteString('refuted');
  };
  const result = await runWorkflow(agent, {
    seat: 'sonnet',
    claimUids: ['c1'],
    k: 5,
    packets: packetsFor(['c1'], 'decisive-evidence'),
  });
  assert.equal(result.cast, 5, 'all 5 string-return votes are scored');
  assert.ok(received.every((t) => t === 'string'), 'the agent return is a TEXT string, never an object');

  for (const v of result.scoredVotes) {
    assert.equal(v.verdict, 'refuted', 'the model STRING verdict is the scored quantity');
    assert.equal(v.trace.stop_reason, 'decisive-evidence', 'the trace is the JS-PRODUCED packet trace');
  }
});

test('orchestration: the k-floor casts at least MIN_K (5) votes per claim', async () => {
  const seen = [];
  const agent = async (_p, opts) => {
    seen.push(opts.label);
    return voteString('refuted');
  };
  const result = await runWorkflow(agent, { seat: 'sonnet', claimUids: ['c1'], k: 5, packets: packetsFor(['c1'], 'exhausted') });
  // 1 claim * 5 = 5 dispatched + 5 scored definite votes.
  assert.equal(result.dispatched, 5, 'exactly MIN_K votes dispatched for the one claim');
  assert.equal(result.cast, 5, 'all 5 are definite scored votes');
  assert.equal(seen.length, 5, 'the agent was invoked 5 times');
});

test('orchestration: a requested k below MIN_K is raised to the floor (tighten-only)', async () => {
  const agent = async () => voteString('refuted');
  const result = await runWorkflow(agent, { seat: 'sonnet', claimUids: ['c1'], k: 2, packets: packetsFor(['c1'], 'exhausted') });
  assert.equal(result.k, 5, 'k=2 was raised to the MIN_K floor of 5');
  assert.equal(result.dispatched, 5);
});

test('orchestration: the DISPATCH DEFAULT k is 9 when args.k is unset (RE-PLAN-5; a DEFAULT change, NOT a MIN_K threshold change)', async () => {
  // RE-PLAN-5: an UNSET k defaults to 9 (the board UNANIMOUS-2 default; picked ONCE here). DISCRIMINATING:
  // a full-workflow runWorkflow with NO args.k reports K=9 (a regression to the old 5-default fails here).
  const agent = async () => voteString('refuted');
  const result = await runWorkflow(agent, { seat: 'sonnet', claimUids: ['c1'], packets: packetsFor(['c1'], 'exhausted') });
  assert.equal(result.k, 9, 'an unset k DEFAULTS to 9 (the RE-PLAN-5 dispatch default)');
  assert.equal(result.dispatched, 9, '9 votes dispatched for the one claim at the k=9 default');

  // The frozen MIN_K floor is UNCHANGED -- an explicit k >= MIN_K is honored verbatim (this is a DEFAULT
  // change, NOT a threshold change). kFloorAtLeast still admits any explicit k >= 5.
  assert.equal(H.kFloorAtLeast(5, 5), 5, 'kFloorAtLeast(5,5) still yields 5 (MIN_K floor unchanged)');
  assert.equal(H.kFloorAtLeast(11, 5), 11, 'kFloorAtLeast(11,5) still yields 11 (tighten-only, MIN_K unchanged)');

  // An EXPLICIT k=5 is still honored verbatim (it is not silently bumped to the 9 default).
  const explicit5 = await runWorkflow(agent, { seat: 'sonnet', claimUids: ['c1'], k: 5, packets: packetsFor(['c1'], 'exhausted') });
  assert.equal(explicit5.k, 5, 'an explicit k=5 is honored verbatim (only an UNSET k defaults to 9)');
});

test('orchestration: positive controls are dispatched INDISTINGUISHABLY through the SAME prompt (the gold is never in the prompt; RE-PLAN-5)', async () => {
  // A positive-control claim flows through the SAME Workflow + SAME voterPrompt as a refuted trap -- the
  // dispatch is stratum-agnostic (it consumes claimUids + packets, never a stratum name or gold). The
  // voter cannot tell a control from a trap. DISCRIMINATING: the prompt the agent receives contains the
  // claim + evidence + attack-mode but NEVER the words "positive-control", "gold", "unrefuted-gold", or
  // "refuted-gold" -- the gold label is invisible to the judge.
  const prompts = [];
  const agent = async (p) => {
    prompts.push(p);
    return voteString('unrefuted'); // the voter SHOULD uphold a control (scored downstream)
  };

  // 'ctrl-1' is a positive control; the dispatch treats it identically to any trap claimUid.
  const result = await runWorkflow(agent, { seat: 'sonnet', claimUids: ['ctrl-1'], k: 5, packets: packetsFor(['ctrl-1'], 'exhausted') });
  assert.equal(result.cast, 5, 'all 5 votes on the control are scored (same dispatch path as a trap)');

  for (const p of prompts) {
    // The PER-CLAIM gold/stratum is NEVER in the prompt: no stratum name (the dispatch is
    // stratum-agnostic) and no gold-label leak. ("known-gold" in the eval's NAME is the eval description,
    // not this claim's gold -- the assertion targets the per-claim leak vectors.)
    assert.equal(/positive-control|evidence-absent|unrefuted-gold|refuted-gold|gold[ -]?(label|verdict)/i.test(p), false, 'the per-claim gold/stratum is NEVER in the prompt (the voter judges indistinguishably)');
    // The prompt DOES carry the per-seat attack-mode (seat diversity applies to BOTH arms).
    assert.match(p, /ATTACK MODE:/, 'the control prompt carries the per-seat attack-mode (seat diversity, both arms)');
  }

  for (const v of result.scoredVotes) {
    assert.equal(v.verdict, 'unrefuted', 'the MODEL verdict on the control is the scored quantity (the voter upheld)');
  }
});

test('orchestration: skip-already-done -- a vote already in doneIds is NOT re-cast (the mock agent is not invoked for it)', async () => {
  const invoked = [];
  const agent = async (_p, opts) => {
    invoked.push(opts.label);
    return voteString('refuted');
  };
  // c1 has all 5 done; c2 has none done. Only c2's 5 votes should dispatch.
  const done = ['sonnet-c1-0', 'sonnet-c1-1', 'sonnet-c1-2', 'sonnet-c1-3', 'sonnet-c1-4'];
  const result = await runWorkflow(agent, { seat: 'sonnet', claimUids: ['c1', 'c2'], k: 5, doneIds: done, packets: packetsFor(['c1', 'c2'], 'exhausted') });
  assert.equal(result.dispatched, 5, 'only c2 (5 votes) remains; c1 is fully done');
  assert.equal(invoked.length, 5, 'the agent is invoked only for the not-done votes');
  assert.ok(invoked.every((l) => l.includes('c2')), 'no done vote (c1) is re-cast');
});

test('orchestration: a vote with NO evidence packet (orchestrator PART 1 missing) is NOT dispatched and is re-cast', async () => {
  // A missing packet is an orchestration error (PART 1 not run), not an abstain -- the judge is NEVER
  // dispatched with no evidence, and the vote is re-cast on the next pass.
  let invoked = 0;
  const agent = async () => {
    invoked += 1;
    return voteString('refuted');
  };
  const result = await runWorkflow(agent, { seat: 'sonnet', claimUids: ['c1'], k: 5, packets: {} });
  assert.equal(result.cast, 0, 'no vote is scored without a packet');
  assert.equal(result.recast, 5, 'all 5 are re-cast (no-packet)');
  assert.equal(invoked, 0, 'the judge agent is NEVER dispatched without an evidence packet');
});

test('NO-ABSTENTION (W1): a null/abstain model verdict is NOT persisted (not a scored vote) and is re-cast', async () => {
  // The mock agent abstains on every vote (a string with a null verdict). NONE are scored; all re-cast.
  const agent = async () => voteString(null);
  const result = await runWorkflow(agent, { seat: 'sonnet', claimUids: ['c1'], k: 5, packets: packetsFor(['c1'], 'exhausted') });
  assert.equal(result.cast, 0, 'no abstain vote lands in the pool');
  assert.equal(result.recast, 5, 'all 5 abstains are flagged for re-cast');
  assert.equal(result.scoredVotes.length, 0, 'no scored vote is returned for persistence');
});

test('NO-ABSTENTION: a re-run after an abstain lands a DEFINITE vote (re-cast completes the pool)', async () => {
  // First pass: abstain on c1-k0 (string with null verdict). Second pass: re-cast as a definite verdict.
  let pass = 0;
  const agent = async (_p, opts) => {
    if (opts.label.includes('k0') && pass === 0) {
      return voteString(null);
    }

    return voteString('refuted');
  };

  const first = await runWorkflow(agent, { seat: 'sonnet', claimUids: ['c1'], k: 5, packets: packetsFor(['c1'], 'exhausted') });
  assert.equal(first.cast, 4, 'k0 abstained -> only 4 definite this pass');
  assert.equal(first.recast, 1, 'k0 is flagged for re-cast');

  // Second pass: the orchestrator passes the 4 definite ids as done; only k0 re-casts (now definite).
  pass = 1;
  const done = first.scoredVotes.map((v) => v.id);
  const second = await runWorkflow(agent, { seat: 'sonnet', claimUids: ['c1'], k: 5, doneIds: done, packets: packetsFor(['c1'], 'exhausted') });
  assert.equal(second.dispatched, 1, 'only the abstained k0 remains to re-cast');
  assert.equal(second.cast, 1, 'the re-cast lands a definite vote');
});

test('trace shape: each scored vote carries the JS-produced { queries[], depth, stop_reason in STOP_REASONS }', async () => {
  const agent = async () => voteString('refuted');
  const result = await runWorkflow(agent, { seat: 'sonnet', claimUids: ['c1'], k: 5, packets: packetsFor(['c1'], 'decisive-evidence') });

  for (const v of result.scoredVotes) {
    assert.ok(Array.isArray(v.trace.queries), 'trace.queries is an array');
    assert.equal(typeof v.trace.depth, 'number', 'trace.depth is a number');
    assert.ok(STOP_REASONS.includes(v.trace.stop_reason), 'trace.stop_reason is a known STOP_REASON');
  }
});

test('the parameterized seat resolves the model (sonnet Stage-1; haiku Stage-2 reuses this Workflow)', async () => {
  const models = [];
  const agent = async (_p, opts) => {
    models.push(opts.model);
    return voteString('refuted');
  };
  const sonnet = await runWorkflow(agent, { seat: 'sonnet', claimUids: ['c1'], k: 5, packets: packetsFor(['c1'], 'exhausted') });
  assert.equal(sonnet.model, 'sonnet', 'Stage-1 seat resolves to sonnet');
  assert.ok(models.every((m) => m === 'sonnet'), 'every dispatch used the sonnet model');

  models.length = 0;
  const haiku = await runWorkflow(agent, { seat: 'haiku', claimUids: ['c1'], k: 5, packets: packetsFor(['c1'], 'exhausted') });
  assert.equal(haiku.model, 'haiku', 'Stage-2 seat resolves to haiku (same Workflow, parameterized)');
});

test('W-3 maxInFlight: the fan-out never runs more than maxInFlight judge agents concurrently', async () => {
  // A mock agent that records the concurrent-call depth (increments on entry, decrements on exit, after
  // a microtask yield so concurrent calls overlap). With maxInFlight=2 over 5 votes, the observed peak
  // concurrency must never exceed 2 (the chunked-pipeline cap is HONORED, not a phantom arg).
  let inFlight = 0;
  let peak = 0;
  const agent = async () => {
    inFlight += 1;
    peak = Math.max(peak, inFlight);
    await Promise.resolve(); // yield so overlapping calls are observable
    await Promise.resolve();
    inFlight -= 1;
    return voteString('refuted');
  };
  const result = await runWorkflow(agent, { seat: 'sonnet', claimUids: ['c1'], k: 5, maxInFlight: 2, packets: packetsFor(['c1'], 'exhausted') });
  assert.equal(result.maxInFlight, 2, 'the maxInFlight cap is surfaced in the result');
  assert.equal(result.cast, 5, 'all 5 votes still cast (the cap paces, does not drop)');
  assert.ok(peak <= 2, 'never more than maxInFlight=2 agents concurrently (got peak ' + peak + ')');
  assert.ok(peak >= 2, 'the cap is actually exercised (peak reached 2, not trivially 1)');
});

// ===========================================================================
// End-to-end resumability against the REAL persistVote + readDelta (F3/F4 realized-count guard).
// ===========================================================================

test('resumability (F3/F4): a partial pool makes readDelta throw; a completed re-run lets it proceed -- proven before the spend', async () => {
  const runDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-eval-dispatch-resume-'));
  const sonnetDir = path.join(runDir, 'sonnet');
  const haikuDir = path.join(runDir, 'haiku');

  try {
    // The shared pool is 5 claims (>= reliableTrials would normally be 15; here we use a small pool to
    // exercise the realized-count guard, with reliableTrials = nPooled so the D1-17 floor holds).
    const claimUids = ['t0', 't1', 't2', 't3', 't4'];
    const nPooled = claimUids.length;
    const goldLabels = {};

    for (const uid of claimUids) {
      goldLabels[uid] = 'refuted';
    }

    // The closed-book judge returns a TEXT STRING vote (the I1-correct contract). Sonnet refutes every
    // trap (correct); Haiku also refutes (a clean zero-excess pool).
    const agent = async () => voteString('refuted');

    const sonnetRun = await runWorkflow(agent, { seat: 'sonnet', claimUids, k: 5, packets: packetsFor(claimUids, 'exhausted') });
    const haikuRun = await runWorkflow(agent, { seat: 'haiku', claimUids, k: 5, packets: packetsFor(claimUids, 'exhausted') });

    // The ORCHESTRATOR reduces the k votes/claim -> ONE pooled per-claim record (id = claim uid) via the
    // REAL reducePooledVerdict (PART 3, any-uphold) and persists THAT -- the per-claim pooled vote
    // readDelta/countFalseUpholds read. This exercises the k->1 reduction in the persistence path (not a
    // hand-rolled k0 selection): the realized per-seat count == nPooled == the claim count.
    const persistPerClaim = (run, seatName, dir, claims) => {
      for (const uid of claims) {
        const kVotes = run.scoredVotes.filter((s) => s.id === seatName + '-' + uid + '-0' ||
          s.id === seatName + '-' + uid + '-1' || s.id === seatName + '-' + uid + '-2' ||
          s.id === seatName + '-' + uid + '-3' || s.id === seatName + '-' + uid + '-4');
        const pooled = H.reducePooledVerdict(uid, kVotes);
        const res = persistVote(dir, pooled);
        assert.ok(res.persisted || res.skipped, 'the pooled definite vote persists (model verdict, valid trace)');
      }
    };

    // PARTIAL pool: persist only 3 of the 5 sonnet claims -> readDelta must throw the F3/F4 guard.
    persistPerClaim(sonnetRun, 'sonnet', sonnetDir, claimUids.slice(0, 3));
    persistPerClaim(haikuRun, 'haiku', haikuDir, claimUids);

    assert.throws(
      () =>
        readDelta({
          sonnetVoteDir: sonnetDir,
          haikuVoteDir: haikuDir,
          goldLabels,
          nPooled,
          reliableTrials: nPooled,
          k: 5,
        }),
      (e) => e.name === 'ContractError' && /realized per-seat vote count != nPooled/.test(e.message),
      'a partial (interrupted) pool fails closed (F3/F4 realized-count guard)',
    );

    // COMPLETED re-run: persist the remaining 2 sonnet claims (skip-already-done is idempotent) -> the
    // pool is now exactly nPooled per seat -> readDelta proceeds.
    persistPerClaim(sonnetRun, 'sonnet', sonnetDir, claimUids);

    const read = readDelta({
      sonnetVoteDir: sonnetDir,
      haikuVoteDir: haikuDir,
      goldLabels,
      nPooled,
      reliableTrials: nPooled,
      k: 5,
    });
    assert.equal(read.nPooled, nPooled, 'the completed pool reads at exactly nPooled');
    assert.equal(read.pooledExcess, 0, 'a clean zero-excess read (both seats refute every trap)');
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
});

test('NO-ABSTENTION end-to-end: the real persistVote REJECTS a non-{unrefuted,refuted} verdict (a null/abstain is unpersistable)', () => {
  const runDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-eval-dispatch-abstain-'));
  const dir = path.join(runDir, 'votes');

  try {
    // The dispatch never builds a scored vote for an abstain (toScoredVote returns null), but assert the
    // backstop: even if a null verdict reached persistVote it is rejected (offline-read.mjs:384-389).
    assert.throws(
      () => persistVote(dir, { id: 'c1', seat: 'sonnet', verdict: null, trace: traceWithStop('exhausted') }),
      (e) => e.name === 'ContractError' && /verdict must be in \{unrefuted,refuted\}/.test(e.message),
      'persistVote rejects a null verdict (the no-abstention persistence backstop)',
    );
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
});

// ===========================================================================
// INTEGRATION SMOKE over the REAL searchAndStop/staticKsAdapter pre-pass (PART 1). No model call. This
// proves the JS pre-pass actually produces the { queries, depth, stop_reason } trace + the date-filtered
// evidence packet the dispatch attaches -- so I1 (the harness never touching the real binding) cannot
// recur (the harness CONTROL-LOGIC tests above mock the judge; this test drives the real spine).
// ===========================================================================

test('integration smoke (PART 1, I1 fix): the REAL searchAndStopPrePass yields a real trace + a non-empty date-filtered packet (no model call)', () => {
  // A tiny ENRICHED KS fixture (Task-1 enrichKsForClaim shape): doc.date is the DD-MM-YYYY STRING the
  // frozen dateFilter consumes; 6 strictly-pre-cutoff dated docs survive a 15-05-2020 cutoff; one
  // same-day doc + one undated doc are DROPPED by the strict `<`.
  const enrichedKs = [];

  for (let i = 0; i < 6; i += 1) {
    const dd = String(i + 1).padStart(2, '0');
    enrichedKs.push({ sentence: 'in-window support ' + i, url: 'https://x/2019/01/' + dd + '/p', date: dd + '-01-2019' });
  }

  enrichedKs.push({ sentence: 'same-day (excluded)', url: 'https://x/2020/05/15/sd', date: '15-05-2020' });
  enrichedKs.push({ sentence: 'undated (excluded)', url: 'https://x/no-date', date: null });

  const claimId = 42;
  const claimDate = parseAvtDate('15-05-2020');

  const packet = searchAndStopPrePass({
    claim: { id: claimId, text: 'a trap claim' },
    claimText: 'a trap claim',
    enrichedKs,
    claimId,
    claimDate,
  });

  // The trace is the REAL searchAndStop trace -- a known STOP_REASON, an array of queries, a depth.
  assert.ok(Array.isArray(packet.trace.queries), 'the pre-pass yields a real trace.queries array');
  assert.ok(packet.trace.queries.length >= 3, 'at least the minQueries floor of queries were issued');
  assert.equal(typeof packet.trace.depth, 'number', 'the trace carries a numeric depth');
  assert.ok(STOP_REASONS.includes(packet.trace.stop_reason), 'the trace stop_reason is a known STOP_REASON (persistable)');

  // The date-filtered packet is non-empty and contains ONLY the strictly-pre-cutoff docs (same-day +
  // undated dropped by the frozen dateFilter -- the leak-safety the closed-book design buys).
  assert.equal(packet.docs.length, 6, 'exactly the 6 strictly-pre-cutoff docs survive (same-day + undated dropped)');
  assert.equal(packet.docs.some((d) => d.sentence === 'same-day (excluded)'), false, 'the same-day doc is excluded by strict <');
  assert.equal(packet.docs.some((d) => d.sentence === 'undated (excluded)'), false, 'the undated doc is dropped');

  // The evidenceText the Workflow inlines is rendered from the date-filtered packet (numbered lines).
  assert.equal(typeof packet.evidenceText, 'string', 'the packet carries the inlined evidenceText');
  assert.match(packet.evidenceText, /in-window support 0/, 'the inlined evidence renders a surviving doc');
  assert.equal(/decisive|disconfirmer|refuted/i.test(packet.evidenceText), false, 'no flag leaks into the inlined evidence text');

  // The scored vote the dispatch would build from a (string) model verdict + THIS JS trace is valid for
  // persistVote (closes the loop: PART 1 trace + PART 2 model verdict -> a persistable scored record).
  const scored = H.toScoredVote('sonnet-c1-0', 'sonnet', voteString('refuted'), packet.trace);
  assert.ok(scored != null && scored.verdict === 'refuted', 'the JS trace + model string verdict build a scored vote');
  const res = persistVote(fs.mkdtempSync(path.join(os.tmpdir(), 'lz-eval-prepass-')), scored);
  assert.ok(res.persisted, 'the scored vote (JS trace + model verdict) persists -- the real binding closes the loop');
});

test('integration smoke: renderEvidenceText renders the ABSENCE explicitly for an empty packet (evidence-absent judge sees no in-window evidence)', () => {
  const empty = renderEvidenceText([]);
  assert.match(empty, /no in-window evidence/i, 'an empty packet renders an explicit absence line (not a blank string)');
});

// ===========================================================================
// Structural contract + ASCII (mirroring the review-gate harness).
// ===========================================================================

test('workflow structural contract: meta present, marker block present, no static/dynamic import', () => {
  assert.match(SRC, /export const meta = \{/);
  assert.match(SRC, /name: 'lz-eval-voter-dispatch'/);
  assert.match(SRC, /LZ-EVAL-VOTER-DISPATCH-SHARED-START/);
  assert.match(SRC, /LZ-EVAL-VOTER-DISPATCH-SHARED-END/);
  // Injected globals, never imported (the runtime rejects both static + dynamic import). Scope the
  // check to CODE, not comments: strip line comments so the header comment that DOCUMENTS the no-import
  // constraint (it literally writes "dynamic import()") does not false-trip the regex.
  const codeOnly = SRC.split(/\r?\n/).filter((l) => !/^\s*\/\//.test(l)).join('\n');
  assert.ok(!/^\s*import\s/m.test(codeOnly), 'no static import statement in the workflow code');
  assert.ok(!/\bimport\s*\(/.test(codeOnly), 'no dynamic import() in the workflow code');
  // The parameterized seat + the model resolution + the scoring-reconciliation helpers are present.
  assert.match(SRC, /function parseVoteVerdict\(/);
  assert.match(SRC, /function toScoredVote\(/);
  assert.match(SRC, /model: MODEL, effort: EFFORT, phase: 'Dispatch'/);

  // CLOSED-BOOK rework (19-04-REPLAN-DECISION-3): the reducePooledVerdict k->1 helper is in the SHARED
  // block; the maxInFlight cap is HONORED (read from args + chunked fan-out); the {vote,trace}-OBJECT
  // destructuring is REMOVED (the agent return is parsed as a TEXT string). Scope these to CODE (strip
  // line comments) so the header comment that DOCUMENTS the removed assumption does not false-trip.
  assert.match(SRC, /function reducePooledVerdict\(/);
  const codeOnlyB = SRC.split(/\r?\n/).filter((l) => !/^\s*\/\//.test(l)).join('\n');
  assert.match(codeOnlyB, /MAX_IN_FLIGHT\s*=\s*Number\.isInteger\(A\.maxInFlight\)/, 'maxInFlight is read from args (W-3 honored)');
  assert.match(codeOnlyB, /i \+= MAX_IN_FLIGHT/, 'the fan-out is chunked by MAX_IN_FLIGHT (the cap is honored, not a phantom arg)');
  assert.ok(!/'vote'\s+in\s+raw/.test(codeOnlyB), "the {vote,trace}-object destructuring is REMOVED (no \"'vote' in raw\" in code)");
  assert.ok(!/'trace'\s+in\s+raw/.test(codeOnlyB), "the model-returned-trace assumption is REMOVED (no \"'trace' in raw\" in code)");
  // The judge prompt inlines the supplied evidence packet (closed-book, no self-search) + the per-seat
  // attack-mode (RE-PLAN-5 seat diversity).
  assert.match(SRC, /voterPrompt\(item\.claimUid, item\.k, packet\.claimText, packet\.evidenceText, attackMode\)/);
  // RE-PLAN-5: the ATTACK_MODES rotation + attackModeForSeat helper live INSIDE the SHARED block; the
  // dispatch default k is 9. Scope these to CODE (strip line comments) so header prose does not false-trip.
  const codeOnlyC = SRC.split(/\r?\n/).filter((l) => !/^\s*\/\//.test(l)).join('\n');
  assert.match(codeOnlyC, /const ATTACK_MODES = \[/, 'the ATTACK_MODES rotation is defined in code');
  assert.match(codeOnlyC, /function attackModeForSeat\(/, 'the attackModeForSeat helper is defined in code');
  assert.match(codeOnlyC, /kFloorAtLeast\(Number\.isInteger\(A\.k\) \? A\.k : 9, 5\)/, 'the dispatch DEFAULT k is 9 (an unset k defaults to 9; the frozen MIN_K floor stays 5)');
});

test('prepass module structural contract: the sibling pre-pass is importable + composes the FROZEN spine, strictly ASCII', () => {
  const prepassPath = path.join(HERE, 'lz-eval-voter-dispatch.prepass.mjs');
  const prepassSrc = fs.readFileSync(prepassPath, 'utf8');

  // PART 1 lives in an IMPORTABLE sibling (it needs the frozen-spine imports the Workflow body cannot
  // make). It exports searchAndStopPrePass + composes the FROZEN searchAndStop/staticKsAdapter.
  assert.match(prepassSrc, /export function searchAndStopPrePass\(/);
  assert.match(prepassSrc, /import\s*\{[\s\S]*searchAndStop[\s\S]*staticKsAdapter[\s\S]*\}\s*from '\.\/lz-eval-search-loop\.mjs'/);

  const buf = fs.readFileSync(prepassPath);

  for (let i = 0; i < buf.length; i += 1) {
    assert.ok(buf[i] <= 0x7f, `prepass non-ASCII byte 0x${buf[i].toString(16)} at offset ${i}`);
  }
});

test('workflow source is strictly ASCII', () => {
  const buf = fs.readFileSync(WF);

  for (let i = 0; i < buf.length; i += 1) {
    assert.ok(buf[i] <= 0x7f, `non-ASCII byte 0x${buf[i].toString(16)} at offset ${i}`);
  }
});
