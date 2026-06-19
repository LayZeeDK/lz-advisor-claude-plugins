// lz-eval-sc5-trace.mjs
//
// The SC-5 headless-scale acceptance trace-parser (Plan 20-04, Task 2; D-13). This module is a PURE
// parser over a CAPTURED `claude -p ... --output-format stream-json` trace file. It computes the five
// un-fakeable SC-5 acceptance facts mechanically from the trace -- it spends NOTHING, calls NO model,
// performs no network I/O, and draws no randomness (so the verdict is a deterministic function of the
// captured trace bytes). The live spike that PRODUCES the trace is run + recorded separately (the
// 20-04-SC5-SPIKE.md doc); this parser only GRADES an already-captured trace, so the acceptance is a
// re-runnable check rather than a one-off subjective read (T-20-14 mitigation).
//
// Tree / dependency boundary (D-10/D-11): this script lives in the repo-level eval/ tree, NEVER in the
// distributed plugin tree. It imports the SHIPPED runtime aggregator's hardening primitives ACROSS
// trees by relative path -- ONE-DIRECTIONAL (eval -> runtime, NEVER runtime -> eval) -- so no eval
// dependency can ever leak into the marketplace package. NEVER add an eval/ import to any plugin-tree
// file. The module is node stdlib + the runtime hardening primitives + the shared eval-tree
// fail-closed JSON read; zero npm deps.
//
// NESTED-TOOL-USE CAVEAT (MEMORY project_test_5_tool_budget_threshold_ambiguity): a subagent's OWN
// tool-use is HIDDEN from the parent stream-json trace. This parser therefore reads the advisor-spawn
// count and the worker Write outcomes from the PARENT Agent dispatch events (the tool_use the
// orchestrator issues + the tool_result it receives back), NOT from inside the subagents. The
// per-agent JSONL session log (~/.claude/projects/<cwd-hash>/<session>/subagents/agent-<id>.jsonl) is
// the documented fallback evidence for nested tool-use; the spike doc cross-checks against it.
//
// The captured trace file may be EITHER the native `claude -p --output-format stream-json` JSONL (one
// JSON object per line, possibly with interleaved non-JSON stderr lines from a `2>&1` redirect) OR a
// JSON array (a pre-converted *.array.json or a stub fixture). gradeTraceFile / parseTraceText accept
// both: the array form is tried first, else the text is split into lines and each parseable line is one
// event (blank / non-JSON lines are ignored). A BOM is stripped at read time (ASCII-only source per
// CLAUDE.md; the byte-order mark is code point U+FEFF, never written literally here).
//
// Pure functions are exported for the validation fixture; the thin CLI is guarded so that `import`-ing
// this module does NOT run the CLI.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Cross-tree reuse of the SHIPPED runtime aggregator's fail-closed error type + BOM stripper (D-10;
// eval -> runtime, one-directional, never the reverse). A malformed trace fails closed as a
// ContractError, never a bare throw, so callers + tests match on a stable name.
import {
  ContractError,
  stripBom,
} from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

// ---------------------------------------------------------------------------
// Frozen SC-5 acceptance thresholds (D-13). A verdict is `pass` iff ALL of these hold. These are the
// un-fakeable acceptance criteria parsed from the trace; the values are pinned (no parameterization).
// ---------------------------------------------------------------------------
export const SC5_THRESHOLDS = Object.freeze({
  MAX_IN_FLIGHT: 5, // <= 5 concurrent in-flight Agent calls at EVERY point (COST-03 / D-08 wave cap)
  MIN_WAVES: 3, // >= 3 sequential waves (search, extract, verify)
  ADVISOR_SPAWNS: 2, // EXACTLY 2 Opus advisor gates (COST-01 / D-18)
  WORKER_WRITE_FAILURES: 0, // zero failed worker Write tool_results (T-20-15)
});

// The agent type that resolves to the read-only Opus advisor (the two gates). A parent Agent dispatch
// is counted as an advisor spawn when its resolved subagent_type matches this. Worker dispatches
// (search / extract / verify-voter) are NOT advisor spawns.
const ADVISOR_AGENT_TYPE = 'lz-advisor:advisor';

// ---------------------------------------------------------------------------
// Trace-shape helpers. A captured stream-json trace is a JSON array of events. Each event is an object
// with a `type` (e.g. 'assistant' / 'user' / 'result'). Assistant events carry a `message.content[]`
// array; an Agent dispatch is a content block { type: 'tool_use', id, name: 'Agent', input: {...} }.
// The matching result is a content block in a later 'user' event:
// { type: 'tool_result', tool_use_id, is_error?, content }. A 'start' (the Agent tool_use) with no
// matching 'tool_result' yet is "in flight". The parser walks the events in array order and tracks the
// in-flight set; the maximum size of that set is `maxInFlight`.
// ---------------------------------------------------------------------------

function isObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

// Extract the content[] blocks of an event regardless of whether they sit on event.message.content
// (the SDK-style envelope) or directly on event.content (a flattened capture). Returns [] when absent.
function contentBlocks(event) {
  if (!isObject(event)) {
    return [];
  }

  if (isObject(event.message) && Array.isArray(event.message.content)) {
    return event.message.content;
  }

  if (Array.isArray(event.content)) {
    return event.content;
  }

  return [];
}

// Resolve the subagent type of an Agent tool_use block. The orchestrator passes it as
// input.subagent_type (the canonical field) or input.agentType (the Workflow alias). Returns '' when
// neither is present (an unresolved dispatch is NOT counted as an advisor spawn).
function agentTypeOf(block) {
  if (!isObject(block) || !isObject(block.input)) {
    return '';
  }

  if (typeof block.input.subagent_type === 'string') {
    return block.input.subagent_type;
  }

  if (typeof block.input.agentType === 'string') {
    return block.input.agentType;
  }

  return '';
}

// A worker Write failure is a tool_result whose tool name resolves to Write AND is flagged is_error.
// Because nested tool-use is hidden from the parent trace, a worker's Write surfaces at the parent as
// the Agent dispatch's tool_result carrying a worker-reported failure marker. The capture records the
// failed-write count on the Agent tool_result as input/content meta `worker_write_failures` (an integer
// the orchestrator's receipt carries), OR a direct Write tool_result with is_error true. Both are
// summed so the parser is robust to either capture shape.
function writeFailuresInResult(block) {
  if (!isObject(block) || block.type !== 'tool_result') {
    return 0;
  }

  let failures = 0;

  // Direct Write tool_result flagged as an error.
  if (block.tool_name === 'Write' && block.is_error === true) {
    failures += 1;
  }

  // Worker-reported failed-write count carried on the Agent receipt (counts-only, nested-hidden).
  if (Number.isInteger(block.worker_write_failures) && block.worker_write_failures > 0) {
    failures += block.worker_write_failures;
  }

  return failures;
}

// ---------------------------------------------------------------------------
// parseTrace(events): the PURE parser. `events` is the already-parsed array of stream-json events.
// Returns the frozen verdict object. Fails closed (ContractError) on a non-array input.
// ---------------------------------------------------------------------------
export function parseTrace(events) {
  if (!Array.isArray(events)) {
    throw new ContractError('trace must be an array of stream-json events', '<trace>');
  }

  // The map of in-flight Agent tool_use ids -> the batch (wave) label the start carried. An entry is
  // present from its start event until its matching tool_result lands. The map size at any point is the
  // concurrent in-flight count; its maximum is `maxInFlight`.
  const inFlight = new Map();
  let maxInFlight = 0;

  // Wave segmentation: the orchestrator labels each Agent start with its batch (wave) via
  // input.batch / input.wave (the COST-03 / D-08 foreground sub-wave). `waves` counts the DISTINCT
  // batch labels observed (in first-seen order). When the capture carries no explicit label, a batch is
  // synthesized each time the in-flight set transitions from empty to non-empty (the fallback
  // segmentation), so the parser still works on an un-annotated capture.
  const seenBatches = new Set();
  let waves = 0;
  let lastEmptyBatch = null; // the synthetic label for the current empty-set-derived wave
  let syntheticCounter = 0;

  // Wave-boundary ordering (the foreground/wait boundary, criterion 2): every Agent start must come
  // AFTER all prior-batch results landed. A start whose batch label differs from the batch(es) STILL
  // in flight means the next batch was spawned before the prior batch fully drained -- a violation.
  let waveBoundaryHeld = true;

  let advisorSpawns = 0;
  let workerWriteFailures = 0;

  let exitOk = false;
  let survivorsReproducible = false;

  for (let i = 0; i < events.length; i += 1) {
    const event = events[i];

    // Terminal result event: exit code + survivors-summary reproducibility marker.
    if (isObject(event) && event.type === 'result') {
      if (event.subtype === 'success' || event.is_error === false || event.exit_code === 0) {
        exitOk = true;
      }

      if (event.survivors_reproducible === true) {
        survivorsReproducible = true;
      }
    }

    const blocks = contentBlocks(event);

    for (const block of blocks) {
      if (!isObject(block)) {
        continue;
      }

      // An Agent dispatch START.
      if (block.type === 'tool_use' && block.name === 'Agent' && typeof block.id === 'string') {
        // Resolve the batch (wave) label: explicit input.batch / input.wave, else a synthetic label
        // for the current empty-set-derived wave (created lazily when the set was empty).
        let batch;

        if (isObject(block.input) && (typeof block.input.batch === 'string' || typeof block.input.batch === 'number')) {
          batch = 'b:' + String(block.input.batch);
        } else if (isObject(block.input) && (typeof block.input.wave === 'string' || typeof block.input.wave === 'number')) {
          batch = 'b:' + String(block.input.wave);
        } else {
          if (inFlight.size === 0) {
            syntheticCounter += 1;
            lastEmptyBatch = 'syn:' + syntheticCounter;
          }

          batch = lastEmptyBatch;
        }

        // Boundary check: if anything is still in flight under a DIFFERENT batch label, this start
        // jumped the foreground/wait boundary (its prior batch had not fully drained).
        for (const pendingBatch of inFlight.values()) {
          if (pendingBatch !== batch) {
            waveBoundaryHeld = false;
            break;
          }
        }

        if (!seenBatches.has(batch)) {
          seenBatches.add(batch);
          waves += 1;
        }

        inFlight.set(block.id, batch);

        if (inFlight.size > maxInFlight) {
          maxInFlight = inFlight.size;
        }

        if (agentTypeOf(block) === ADVISOR_AGENT_TYPE) {
          advisorSpawns += 1;
        }

        continue;
      }

      // An Agent dispatch RESULT (or a direct worker Write result captured at the parent).
      if (block.type === 'tool_result') {
        workerWriteFailures += writeFailuresInResult(block);

        if (typeof block.tool_use_id === 'string' && inFlight.has(block.tool_use_id)) {
          inFlight.delete(block.tool_use_id);
        }
      }
    }
  }

  // A trace that ends with un-resolved Agent calls never drained its last wave; treat that as an
  // ordering / completeness failure (the foreground/wait contract was not observed to hold).
  if (inFlight.size > 0) {
    waveBoundaryHeld = false;
  }

  const pass =
    maxInFlight <= SC5_THRESHOLDS.MAX_IN_FLIGHT &&
    waves >= SC5_THRESHOLDS.MIN_WAVES &&
    waveBoundaryHeld === true &&
    exitOk === true &&
    workerWriteFailures === SC5_THRESHOLDS.WORKER_WRITE_FAILURES &&
    advisorSpawns === SC5_THRESHOLDS.ADVISOR_SPAWNS;

  return Object.freeze({
    maxInFlight,
    waves,
    waveBoundaryHeld,
    exitOk,
    survivorsReproducible,
    workerWriteFailures,
    advisorSpawns,
    pass,
  });
}

// ---------------------------------------------------------------------------
// parseTraceText(text): turn the raw captured trace TEXT into the array of stream-json events, then
// parse it. Accepts EITHER capture shape:
//   (a) JSONL -- the native `claude -p --output-format stream-json` output: one JSON object per line.
//       Blank lines and non-JSON lines (e.g. a stderr "Warning: no stdin data received" line
//       interleaved by a `2>&1` redirect) are IGNORED, so a raw redirect-captured file grades cleanly.
//   (b) a JSON array -- the back-compat shape (e.g. a pre-converted *.array.json or a stub fixture).
// The array form is tried FIRST (a whole-text JSON.parse that yields an array wins); otherwise the
// text is split into lines and each non-blank line is parsed as one event, skipping un-parseable lines.
// Fails closed (ContractError) only when NEITHER shape yields any event.
// ---------------------------------------------------------------------------
export function parseTraceText(text, fileLabel) {
  const label = fileLabel || '<trace>';
  const clean = stripBom(text);

  // (a) Whole-text JSON: an array is the back-compat shape. A single object or other JSON falls through
  // to the JSONL path (it may be a one-line JSONL capture).
  let whole;
  let wholeOk = false;

  try {
    whole = JSON.parse(clean);
    wholeOk = true;
  } catch {
    wholeOk = false;
  }

  if (wholeOk && Array.isArray(whole)) {
    return parseTrace(whole);
  }

  // (b) JSONL: one JSON object per line; ignore blank / non-JSON lines (interleaved stderr, etc.).
  const events = [];

  for (const rawLine of clean.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (line === '') {
      continue;
    }

    let obj;

    try {
      obj = JSON.parse(line);
    } catch {
      // Non-JSON line (e.g. an interleaved stderr warning) -- skip it, do not fail the whole trace.
      continue;
    }

    events.push(obj);
  }

  if (events.length === 0) {
    throw new ContractError('trace file yielded no stream-json events (neither a JSON array nor JSONL)', label);
  }

  return parseTrace(events);
}

// ---------------------------------------------------------------------------
// gradeTraceFile(traceFilePath): read a captured stream-json trace file and return parseTrace(). Accepts
// either the native JSONL capture or a JSON array (see parseTraceText). Fails closed (ContractError) on
// a missing / unreadable file or a file that yields no events.
// ---------------------------------------------------------------------------
export function gradeTraceFile(traceFilePath) {
  let text;

  try {
    text = fs.readFileSync(traceFilePath, 'utf8');
  } catch (err) {
    throw new ContractError('cannot read file: ' + err.message, traceFilePath);
  }

  return parseTraceText(text, traceFilePath);
}

// ---------------------------------------------------------------------------
// Thin guarded CLI: `node lz-eval-sc5-trace.mjs <trace-file>` prints the verdict JSON and exits
// 0 (pass) / 1 (fail) / 2 (ContractError). The guard ensures `import`-ing this module runs NO CLI.
// ---------------------------------------------------------------------------
/* node:coverage disable */
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    const traceFile = process.argv[2];

    if (!traceFile) {
      console.error('lz-eval-sc5-trace: usage: node lz-eval-sc5-trace.mjs <trace-file>');
      process.exit(2);
    }

    const verdict = gradeTraceFile(traceFile);
    console.log(JSON.stringify(verdict, null, 2));
    process.exit(verdict.pass ? 0 : 1);
  } catch (err) {
    const where = err && err.file ? ' (' + err.file + ')' : '';
    console.error('lz-eval-sc5-trace: ' + (err && err.message ? err.message : String(err)) + where);
    process.exit(2);
  }
}
/* node:coverage enable */
