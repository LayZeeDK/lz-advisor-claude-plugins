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
// COVERAGE BOUNDARY (W3): the harness mocks agents, so it proves ONLY the deterministic CONTROL LOGIC
// of the dispatch (the scoring-reconciliation mapping, the no-abstention re-cast, skip-already-done,
// the k-floor, the trace shape, the readDelta guard). The correctness of the ENRICHED-KS-over-
// searchAndStop binding rests on three OTHER signals: (a) the frozen eval/lz-eval-search-loop.test.mjs
// (the spine + staticKsAdapter + dateFilter), (b) the Task-1 enrichment tests (dates + flags wired),
// (c) the Task-4 per-vote-trace inspection on the real run. This harness is NOT full dispatch-path
// coverage.
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
  const exportTail = 'return { STOP_REASONS, parseVoteVerdict, toScoredVote, voteId, remainingVotes, kFloorAtLeast };';
  // eslint-disable-next-line no-new-func
  return new Function(`"use strict";\n${headerOnly}\n${exportTail}`)();
}

const H = getHelpers();

// A canonical searchAndStop-shaped trace whose mechanical flag-verdict DIFFERS from the model verdict.
function traceWithStop(stopReason) {
  return { queries: ['disconfirm:r0:c', 'disconfirm:r1:c', 'disconfirm:r2:c'], depth: 6, stop_reason: stopReason };
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

// ===========================================================================
// Orchestration: the real dispatch loop/fan-out, driven by scripted mock agents.
// ===========================================================================

test('orchestration: empty claimUids returns early without spawning agents', async () => {
  let called = false;
  const agent = async () => {
    called = true;
    return { vote: { verdict: 'refuted' }, trace: traceWithStop('exhausted') };
  };
  const result = await runWorkflow(agent, { seat: 'sonnet', claimUids: [] });
  assert.equal(result.dispatched, 0);
  assert.equal(called, false);
});

test('orchestration: the k-floor casts at least MIN_K (5) votes per claim', async () => {
  const seen = [];
  const agent = async (_p, opts) => {
    seen.push(opts.label);
    return { vote: { verdict: 'refuted' }, trace: traceWithStop('exhausted') };
  };
  const result = await runWorkflow(agent, { seat: 'sonnet', claimUids: ['c1'], k: 5 });
  // 1 claim * 5 = 5 dispatched + 5 scored definite votes.
  assert.equal(result.dispatched, 5, 'exactly MIN_K votes dispatched for the one claim');
  assert.equal(result.cast, 5, 'all 5 are definite scored votes');
  assert.equal(seen.length, 5, 'the agent was invoked 5 times');
});

test('orchestration: a requested k below MIN_K is raised to the floor (tighten-only)', async () => {
  const agent = async () => ({ vote: { verdict: 'refuted' }, trace: traceWithStop('exhausted') });
  const result = await runWorkflow(agent, { seat: 'sonnet', claimUids: ['c1'], k: 2 });
  assert.equal(result.k, 5, 'k=2 was raised to the MIN_K floor of 5');
  assert.equal(result.dispatched, 5);
});

test('orchestration: skip-already-done -- a vote already in doneIds is NOT re-cast (the mock agent is not invoked for it)', async () => {
  const invoked = [];
  const agent = async (_p, opts) => {
    invoked.push(opts.label);
    return { vote: { verdict: 'refuted' }, trace: traceWithStop('exhausted') };
  };
  // c1 has all 5 done; c2 has none done. Only c2's 5 votes should dispatch.
  const done = ['sonnet-c1-0', 'sonnet-c1-1', 'sonnet-c1-2', 'sonnet-c1-3', 'sonnet-c1-4'];
  const result = await runWorkflow(agent, { seat: 'sonnet', claimUids: ['c1', 'c2'], k: 5, doneIds: done });
  assert.equal(result.dispatched, 5, 'only c2 (5 votes) remains; c1 is fully done');
  assert.equal(invoked.length, 5, 'the agent is invoked only for the not-done votes');
  assert.ok(invoked.every((l) => l.includes('c2')), 'no done vote (c1) is re-cast');
});

test('NO-ABSTENTION (W1): a null/abstain model verdict is NOT persisted (not a scored vote) and is re-cast', async () => {
  // The mock agent abstains on every vote (null verdict). NONE are scored; all are counted as re-cast.
  const agent = async () => ({ vote: { verdict: null }, trace: traceWithStop('exhausted') });
  const result = await runWorkflow(agent, { seat: 'sonnet', claimUids: ['c1'], k: 5 });
  assert.equal(result.cast, 0, 'no abstain vote lands in the pool');
  assert.equal(result.recast, 5, 'all 5 abstains are flagged for re-cast');
  assert.equal(result.scoredVotes.length, 0, 'no scored vote is returned for persistence');
});

test('NO-ABSTENTION: a re-run after an abstain lands a DEFINITE vote (re-cast completes the pool)', async () => {
  // First pass: abstain on c1-k0. Second pass: the same vote re-cast as a definite verdict.
  let pass = 0;
  const agent = async (_p, opts) => {
    if (opts.label.includes('k0') && pass === 0) {
      return { vote: { verdict: null }, trace: traceWithStop('exhausted') };
    }

    return { vote: { verdict: 'refuted' }, trace: traceWithStop('exhausted') };
  };

  const first = await runWorkflow(agent, { seat: 'sonnet', claimUids: ['c1'], k: 5 });
  assert.equal(first.cast, 4, 'k0 abstained -> only 4 definite this pass');
  assert.equal(first.recast, 1, 'k0 is flagged for re-cast');

  // Second pass: the orchestrator passes the 4 definite ids as done; only k0 re-casts (now definite).
  pass = 1;
  const done = first.scoredVotes.map((v) => v.id);
  const second = await runWorkflow(agent, { seat: 'sonnet', claimUids: ['c1'], k: 5, doneIds: done });
  assert.equal(second.dispatched, 1, 'only the abstained k0 remains to re-cast');
  assert.equal(second.cast, 1, 'the re-cast lands a definite vote');
});

test('trace shape: each scored vote carries { queries[], depth, stop_reason in STOP_REASONS }', async () => {
  const agent = async () => ({ vote: { verdict: 'refuted' }, trace: traceWithStop('decisive-evidence') });
  const result = await runWorkflow(agent, { seat: 'sonnet', claimUids: ['c1'], k: 5 });

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
    return { vote: { verdict: 'refuted' }, trace: traceWithStop('exhausted') };
  };
  const sonnet = await runWorkflow(agent, { seat: 'sonnet', claimUids: ['c1'], k: 5 });
  assert.equal(sonnet.model, 'sonnet', 'Stage-1 seat resolves to sonnet');
  assert.ok(models.every((m) => m === 'sonnet'), 'every dispatch used the sonnet model');

  models.length = 0;
  const haiku = await runWorkflow(agent, { seat: 'haiku', claimUids: ['c1'], k: 5 });
  assert.equal(haiku.model, 'haiku', 'Stage-2 seat resolves to haiku (same Workflow, parameterized)');
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

    // Dispatch ONE definite vote per claim (k=5 floor; we persist the k0 vote per claim as the pooled
    // per-claim vote, keyed by the claim uid so countFalseUpholds/readDelta index gold by claim).
    const agent = async (_p, opts) => {
      // Sonnet refutes every trap (correct); Haiku also refutes (a clean zero-excess pool).
      return { vote: { verdict: 'refuted' }, trace: traceWithStop('exhausted') };
    };

    const sonnetRun = await runWorkflow(agent, { seat: 'sonnet', claimUids, k: 5 });
    const haikuRun = await runWorkflow(agent, { seat: 'haiku', claimUids, k: 5 });

    // The ORCHESTRATOR persists ONE definite vote per claim (id = claim uid) -- the per-claim pooled
    // vote readDelta/countFalseUpholds read. (The workflow returns k scored votes per claim; the
    // orchestrator selects the per-claim pooled vote. Here we persist the k0 vote per claim, re-keyed to
    // the claim uid, so the realized per-seat count == nPooled == the claim count.)
    const persistPerClaim = (run, dir, claims) => {
      for (const uid of claims) {
        const v = run.scoredVotes.find((s) => s.id === 'sonnet-' + uid + '-0' || s.id === 'haiku-' + uid + '-0');
        const rec = { id: uid, seat: v.seat, verdict: v.verdict, trace: v.trace };
        const res = persistVote(dir, rec);
        assert.ok(res.persisted || res.skipped, 'the definite vote persists (model verdict, valid trace)');
      }
    };

    // PARTIAL pool: persist only 3 of the 5 sonnet votes -> readDelta must throw the F3/F4 guard.
    persistPerClaim(sonnetRun, sonnetDir, claimUids.slice(0, 3));
    persistPerClaim(haikuRun, haikuDir, claimUids);

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

    // COMPLETED re-run: persist the remaining 2 sonnet votes (skip-already-done is idempotent) -> the
    // pool is now exactly nPooled per seat -> readDelta proceeds.
    persistPerClaim(sonnetRun, sonnetDir, claimUids);

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
});

test('workflow source is strictly ASCII', () => {
  const buf = fs.readFileSync(WF);

  for (let i = 0; i < buf.length; i += 1) {
    assert.ok(buf[i] <= 0x7f, `non-ASCII byte 0x${buf[i].toString(16)} at offset ${i}`);
  }
});
