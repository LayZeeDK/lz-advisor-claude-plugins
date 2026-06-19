// lz-eval-sc5-trace.test.mjs
//
// Validation fixture for the SC-5 headless-scale acceptance trace-parser (Plan 20-04, Task 2; D-13).
// Dev-only eval-tree test: imports the PURE parser under test (which imports the SHIPPED runtime
// aggregator's ContractError ACROSS trees, one-directional eval -> runtime) plus node stdlib. NO model
// call, NO network, NO spend -- the fixtures are STUB captured stream-json traces built in-process.
//
// The parser computes the five un-fakeable SC-5 acceptance facts from a captured stream-json trace:
//   maxInFlight (<= 5), waves (>= 3), waveBoundaryHeld, exitOk, workerWriteFailures (=== 0),
//   advisorSpawns (=== 2), and the AND-folded `pass`.
//
// Every fixture is DISCRIMINATING (MEMORY project_fixture_must_discriminate_ordering): a PASSING trace
// plus FOUR failing traces, each flipping EXACTLY ONE criterion off the passing baseline, so the test
// proves the parser actually DECIDES rather than returning a constant:
//   - passing             -> pass true  (3 waves, <=5 in flight, boundary held, exit 0, 0 writes, 2 advisors)
//   - over-cap (6)        -> pass false ONLY because maxInFlight === 6
//   - boundary violation  -> pass false ONLY because waveBoundaryHeld === false
//   - 3 advisor spawns    -> pass false ONLY because advisorSpawns === 3
//   - worker Write failure -> pass false ONLY because workerWriteFailures > 0
//
// HOST QUIRK (load-bearing): on this host (Node v24.13.0 / Windows arm64 / Git Bash) the phase gate
// MUST target the explicit FILE form:
//   node --test eval/lz-eval-sc5-trace.test.mjs
// The directory form (`node --test <dir>`) spuriously exits 1 on this host even when every real test
// passes. The suite is one file, so the file form is the equivalent reliable gate.
//
// The byte-order mark is code point U+FEFF. This source contains no literal byte-order mark.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseTrace, gradeTraceFile, SC5_THRESHOLDS } from './lz-eval-sc5-trace.mjs';

// Resolve test artifacts test-file-relative (NEVER process.cwd() -- cwd drifts under GSD worktrees and
// headless `claude -p`). Stub traces are written to a per-test tmpdir, not under HERE, so no committed
// bytes; HERE is established for parity with the sibling eval tests.
const HERE = path.dirname(fileURLToPath(import.meta.url));
void HERE;

// ---------------------------------------------------------------------------
// Stub-trace builder. A wave is a list of agent specs; each spec carries an explicit `batch` label, an
// agentType (advisor vs worker), and an optional worker_write_failures count on its result. The builder
// emits a well-ordered stream-json trace: an assistant event with all the wave's Agent tool_use STARTS,
// then a user event with all the wave's matching tool_results -- so each wave fully drains before the
// next wave's starts (the foreground/wait boundary HOLDS) unless a spec deliberately interleaves.
// ---------------------------------------------------------------------------
let uid = 0;

function nextId() {
  uid += 1;

  return 'toolu_' + String(uid).padStart(4, '0');
}

// Build a START block for an Agent dispatch.
function startBlock(id, batch, agentType) {
  return {
    type: 'tool_use',
    id,
    name: 'Agent',
    input: { batch, subagent_type: agentType, description: 'stub dispatch' },
  };
}

// Build a RESULT block for an Agent dispatch (worker_write_failures defaults to 0).
function resultBlock(id, writeFailures) {
  const block = { type: 'tool_result', tool_use_id: id, is_error: false, content: 'receipt: ok' };

  if (writeFailures && writeFailures > 0) {
    block.worker_write_failures = writeFailures;
  }

  return block;
}

// A clean wave: emit { assistant: [all starts] }, then { user: [all results] }. Returns the events.
function cleanWave(specs) {
  const ids = specs.map((s) => ({ id: nextId(), spec: s }));
  const starts = ids.map(({ id, spec }) => startBlock(id, spec.batch, spec.agentType));
  const results = ids.map(({ id, spec }) => resultBlock(id, spec.writeFailures || 0));

  return [
    { type: 'assistant', message: { content: starts } },
    { type: 'user', message: { content: results } },
  ];
}

// The terminal result event (exit 0 + survivors reproducible).
function terminalOk() {
  return { type: 'result', subtype: 'success', is_error: false, exit_code: 0, survivors_reproducible: true };
}

// The PASSING baseline: three clean foreground waves -- a search wave (5 workers), an extract wave (5
// workers) and a verify wave (3 voters) -- PLUS the two advisor gates each in its OWN single-member
// batch (Gate 1 after search, Gate 2 after verify). 3+ waves, max 5 in flight, boundary held, exit 0,
// zero write failures, exactly 2 advisor spawns.
function buildPassingTrace() {
  const W = 'lz-advisor:research-search-worker';
  const X = 'lz-advisor:research-extract-worker';
  const V = 'lz-advisor:research-verify-voter-sonnet';
  const A = 'lz-advisor:advisor';

  const events = [];
  // Wave 1: search (5 in flight).
  events.push(...cleanWave([
    { batch: 'search', agentType: W },
    { batch: 'search', agentType: W },
    { batch: 'search', agentType: W },
    { batch: 'search', agentType: W },
    { batch: 'search', agentType: W },
  ]));
  // Gate 1: one advisor spawn (its own batch).
  events.push(...cleanWave([{ batch: 'gate1', agentType: A }]));
  // Wave 2: extract (5 in flight).
  events.push(...cleanWave([
    { batch: 'extract', agentType: X },
    { batch: 'extract', agentType: X },
    { batch: 'extract', agentType: X },
    { batch: 'extract', agentType: X },
    { batch: 'extract', agentType: X },
  ]));
  // Wave 3: verify (3 voters in flight).
  events.push(...cleanWave([
    { batch: 'verify', agentType: V },
    { batch: 'verify', agentType: V },
    { batch: 'verify', agentType: V },
  ]));
  // Gate 2: the second advisor spawn (its own batch).
  events.push(...cleanWave([{ batch: 'gate2', agentType: A }]));
  events.push(terminalOk());

  return events;
}

// ===========================================================================
// The frozen thresholds sanity-pin (proves the criteria are the pinned SC-5 values, not a stub).
// ===========================================================================

test('SC5_THRESHOLDS is frozen and value-pinned to the D-13 acceptance criteria', () => {
  assert.equal(Object.isFrozen(SC5_THRESHOLDS), true, 'SC5_THRESHOLDS must be frozen');
  assert.equal(SC5_THRESHOLDS.MAX_IN_FLIGHT, 5, '<= 5 concurrent in-flight Agent calls (COST-03 / D-08)');
  assert.equal(SC5_THRESHOLDS.MIN_WAVES, 3, '>= 3 sequential waves');
  assert.equal(SC5_THRESHOLDS.ADVISOR_SPAWNS, 2, 'exactly 2 advisor gates (COST-01 / D-18)');
  assert.equal(SC5_THRESHOLDS.WORKER_WRITE_FAILURES, 0, 'zero worker Write failures');
});

// ===========================================================================
// The PASSING fixture: every criterion satisfied -> pass true. The frozen verdict shape is asserted.
// ===========================================================================

test('PASSING trace: all five criteria satisfied -> pass true; verdict object is frozen', () => {
  const verdict = parseTrace(buildPassingTrace());

  assert.equal(verdict.maxInFlight, 5, 'peak 5 concurrent in-flight Agent calls');
  assert.equal(verdict.waves, 5, '5 distinct batches (search, gate1, extract, verify, gate2) -- >= 3');
  assert.ok(verdict.waves >= SC5_THRESHOLDS.MIN_WAVES, 'waves >= 3');
  assert.equal(verdict.waveBoundaryHeld, true, 'each batch drained before the next batch started');
  assert.equal(verdict.exitOk, true, 'terminal result records exit 0');
  assert.equal(verdict.survivorsReproducible, true, 'terminal result records survivors reproducible');
  assert.equal(verdict.workerWriteFailures, 0, 'zero worker Write failures');
  assert.equal(verdict.advisorSpawns, 2, 'exactly two advisor gates');
  assert.equal(verdict.pass, true, 'the AND-fold passes');
  assert.equal(Object.isFrozen(verdict), true, 'the verdict object is frozen');
});

// ===========================================================================
// Determinism: the same trace yields a byte-identical verdict across two parses.
// ===========================================================================

test('parseTrace is deterministic (byte-identical verdict over the same trace)', () => {
  const trace = buildPassingTrace();
  const a = parseTrace(trace);
  const b = parseTrace(trace);
  assert.deepEqual(a, b, 'parseTrace must be a pure function of the trace bytes (no Math.random / no clock)');
});

// ===========================================================================
// DISCRIMINATING FAILING fixture 1: over-cap (6 concurrent in flight). Flips ONLY maxInFlight.
// ===========================================================================

test('FAILING (over-cap): a sixth concurrent Agent in one batch -> maxInFlight === 6 -> pass false', () => {
  // Identical to the passing baseline except the extract wave dispatches SIX workers concurrently.
  const W = 'lz-advisor:research-search-worker';
  const X = 'lz-advisor:research-extract-worker';
  const V = 'lz-advisor:research-verify-voter-sonnet';
  const A = 'lz-advisor:advisor';

  const events = [];
  events.push(...cleanWave([
    { batch: 'search', agentType: W },
    { batch: 'search', agentType: W },
    { batch: 'search', agentType: W },
    { batch: 'search', agentType: W },
    { batch: 'search', agentType: W },
  ]));
  events.push(...cleanWave([{ batch: 'gate1', agentType: A }]));
  events.push(...cleanWave([
    { batch: 'extract', agentType: X },
    { batch: 'extract', agentType: X },
    { batch: 'extract', agentType: X },
    { batch: 'extract', agentType: X },
    { batch: 'extract', agentType: X },
    { batch: 'extract', agentType: X }, // the SIXTH -- over the cap
  ]));
  events.push(...cleanWave([
    { batch: 'verify', agentType: V },
    { batch: 'verify', agentType: V },
    { batch: 'verify', agentType: V },
  ]));
  events.push(...cleanWave([{ batch: 'gate2', agentType: A }]));
  events.push(terminalOk());

  const verdict = parseTrace(events);

  // The single flipped criterion:
  assert.equal(verdict.maxInFlight, 6, 'six concurrent in-flight Agent calls were observed');
  assert.equal(verdict.pass, false, 'over-cap fails the verdict');
  // Everything else still holds (discriminating, not vacuous):
  assert.ok(verdict.waves >= SC5_THRESHOLDS.MIN_WAVES, 'waves still >= 3');
  assert.equal(verdict.waveBoundaryHeld, true, 'the boundary still held');
  assert.equal(verdict.exitOk, true, 'still exit 0');
  assert.equal(verdict.workerWriteFailures, 0, 'still zero Write failures');
  assert.equal(verdict.advisorSpawns, 2, 'still exactly two advisor spawns');
});

// ===========================================================================
// DISCRIMINATING FAILING fixture 2: wave-boundary violation (next batch spawns before the prior batch
// fully drains). Flips ONLY waveBoundaryHeld. maxInFlight is kept <= 5.
// ===========================================================================

test('FAILING (boundary): an extract start lands before a search result -> waveBoundaryHeld false -> pass false', () => {
  const W = 'lz-advisor:research-search-worker';
  const X = 'lz-advisor:research-extract-worker';
  const V = 'lz-advisor:research-verify-voter-sonnet';
  const A = 'lz-advisor:advisor';

  // Manually interleave: dispatch 3 search workers, drain only 2, then -- while 1 search worker is
  // STILL in flight -- spawn an extract worker (a DIFFERENT batch). That start jumps the foreground/wait
  // boundary. Peak concurrency stays at 3 (<= 5), so ONLY the boundary criterion flips.
  const s1 = nextId();
  const s2 = nextId();
  const s3 = nextId();
  const x1 = nextId();

  const events = [];
  events.push({ type: 'assistant', message: { content: [
    startBlock(s1, 'search', W),
    startBlock(s2, 'search', W),
    startBlock(s3, 'search', W),
  ] } });
  // Two search results land (s3 is still in flight).
  events.push({ type: 'user', message: { content: [resultBlock(s1, 0), resultBlock(s2, 0)] } });
  // The extract start arrives BEFORE s3 drained -> boundary violation.
  events.push({ type: 'assistant', message: { content: [startBlock(x1, 'extract', X)] } });
  // Now both drain.
  events.push({ type: 'user', message: { content: [resultBlock(s3, 0), resultBlock(x1, 0)] } });

  // Add a clean verify wave + the two advisor gates so the OTHER criteria are satisfied.
  events.push(...cleanWave([{ batch: 'gate1', agentType: A }]));
  events.push(...cleanWave([
    { batch: 'verify', agentType: V },
    { batch: 'verify', agentType: V },
    { batch: 'verify', agentType: V },
  ]));
  events.push(...cleanWave([{ batch: 'gate2', agentType: A }]));
  events.push(terminalOk());

  const verdict = parseTrace(events);

  // The single flipped criterion:
  assert.equal(verdict.waveBoundaryHeld, false, 'the extract start jumped the search batch boundary');
  assert.equal(verdict.pass, false, 'a boundary violation fails the verdict');
  // Everything else still holds (discriminating):
  assert.ok(verdict.maxInFlight <= SC5_THRESHOLDS.MAX_IN_FLIGHT, 'peak concurrency still <= 5');
  assert.ok(verdict.waves >= SC5_THRESHOLDS.MIN_WAVES, 'waves still >= 3 (search, extract, gate1, verify, gate2)');
  assert.equal(verdict.exitOk, true, 'still exit 0');
  assert.equal(verdict.workerWriteFailures, 0, 'still zero Write failures');
  assert.equal(verdict.advisorSpawns, 2, 'still exactly two advisor spawns');
});

// ===========================================================================
// DISCRIMINATING FAILING fixture 3: a THIRD advisor spawn. Flips ONLY advisorSpawns.
// ===========================================================================

test('FAILING (3 advisor spawns): an extra advisor gate -> advisorSpawns === 3 -> pass false', () => {
  const events = buildPassingTrace();
  // Splice an extra advisor batch in BEFORE the terminal result (which is the last event). A clean
  // single-member advisor wave keeps maxInFlight at 1 for that batch and the boundary held.
  const A = 'lz-advisor:advisor';
  const extra = cleanWave([{ batch: 'gate3', agentType: A }]);
  events.splice(events.length - 1, 0, ...extra);

  const verdict = parseTrace(events);

  // The single flipped criterion:
  assert.equal(verdict.advisorSpawns, 3, 'a third advisor gate was spawned');
  assert.equal(verdict.pass, false, 'three advisor spawns fail the COST-01 / D-18 two-gates assertion');
  // Everything else still holds (discriminating):
  assert.ok(verdict.maxInFlight <= SC5_THRESHOLDS.MAX_IN_FLIGHT, 'peak concurrency still <= 5');
  assert.ok(verdict.waves >= SC5_THRESHOLDS.MIN_WAVES, 'waves still >= 3');
  assert.equal(verdict.waveBoundaryHeld, true, 'the boundary still held');
  assert.equal(verdict.exitOk, true, 'still exit 0');
  assert.equal(verdict.workerWriteFailures, 0, 'still zero Write failures');
});

// ===========================================================================
// DISCRIMINATING FAILING fixture 4: a worker Write failure. Flips ONLY workerWriteFailures.
// ===========================================================================

test('FAILING (write failure): one worker Write failed -> workerWriteFailures > 0 -> pass false', () => {
  const W = 'lz-advisor:research-search-worker';
  const X = 'lz-advisor:research-extract-worker';
  const V = 'lz-advisor:research-verify-voter-sonnet';
  const A = 'lz-advisor:advisor';

  const events = [];
  events.push(...cleanWave([
    { batch: 'search', agentType: W },
    { batch: 'search', agentType: W },
    { batch: 'search', agentType: W },
    { batch: 'search', agentType: W },
    { batch: 'search', agentType: W },
  ]));
  events.push(...cleanWave([{ batch: 'gate1', agentType: A }]));
  // One extract worker reports a failed Write on its receipt.
  events.push(...cleanWave([
    { batch: 'extract', agentType: X },
    { batch: 'extract', agentType: X, writeFailures: 1 }, // the ONLY flipped fact
    { batch: 'extract', agentType: X },
    { batch: 'extract', agentType: X },
    { batch: 'extract', agentType: X },
  ]));
  events.push(...cleanWave([
    { batch: 'verify', agentType: V },
    { batch: 'verify', agentType: V },
    { batch: 'verify', agentType: V },
  ]));
  events.push(...cleanWave([{ batch: 'gate2', agentType: A }]));
  events.push(terminalOk());

  const verdict = parseTrace(events);

  // The single flipped criterion:
  assert.equal(verdict.workerWriteFailures, 1, 'one worker Write failure was recorded');
  assert.ok(verdict.workerWriteFailures > 0, 'workerWriteFailures > 0');
  assert.equal(verdict.pass, false, 'any worker Write failure fails the verdict');
  // Everything else still holds (discriminating):
  assert.ok(verdict.maxInFlight <= SC5_THRESHOLDS.MAX_IN_FLIGHT, 'peak concurrency still <= 5');
  assert.ok(verdict.waves >= SC5_THRESHOLDS.MIN_WAVES, 'waves still >= 3');
  assert.equal(verdict.waveBoundaryHeld, true, 'the boundary still held');
  assert.equal(verdict.exitOk, true, 'still exit 0');
  assert.equal(verdict.advisorSpawns, 2, 'still exactly two advisor spawns');
});

// ===========================================================================
// Fail-closed: a non-array trace throws a ContractError (never a bare throw / silent pass).
// ===========================================================================

test('parseTrace fails closed (ContractError) on a non-array trace', () => {
  assert.throws(
    () => parseTrace({ not: 'an array' }),
    (err) => err.name === 'ContractError',
    'a non-array trace must fail closed',
  );
});

// ===========================================================================
// File-read seam: gradeTraceFile reads a captured trace file and parses it. Exercises the readJson seam
// + the fail-closed path on a malformed file. Written to a per-test tmpdir (no committed bytes).
// ===========================================================================

test('gradeTraceFile reads a captured trace file and returns the parsed verdict', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-sc5-trace-'));
  const file = path.join(dir, 'trace.json');
  fs.writeFileSync(file, JSON.stringify(buildPassingTrace()) + '\n', 'utf8');

  const verdict = gradeTraceFile(file);
  assert.equal(verdict.pass, true, 'the captured passing trace grades as pass');

  // Malformed file fails closed.
  const bad = path.join(dir, 'bad.json');
  fs.writeFileSync(bad, '{ not valid json', 'utf8');
  assert.throws(
    () => gradeTraceFile(bad),
    (err) => err.name === 'ContractError',
    'a malformed trace file fails closed',
  );

  fs.rmSync(dir, { recursive: true, force: true });
});
