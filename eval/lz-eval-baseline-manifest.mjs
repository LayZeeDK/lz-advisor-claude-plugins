// lz-eval-baseline-manifest.mjs
//
// NET-NEW (Plan 22-02, Task 3; NO-SPEND): the OFF-MODEL baseline-capture MANIFEST writer/validator
// (PAR-03 / D-15 / D-16). It parses the headless-captured stream-json's system/init line (pinning the
// EXACT CC version + model), builds a per-run MANIFEST, and FAILS CLOSED on a truncated/unpinned run.
// THE AUTHORITY is 22-CONTEXT.md (D-15/D-16) + 22-RESEARCH.md section 2 "Headless built-in
// /deep-research baseline capture".
//
// WHY FAIL-CLOSED (D-15/D-16, T-22-03): a run with no system/init model is UNPINNED -- it cannot be
// graded, because the parity verdict must never average across CC versions, and a background-wait-
// truncated capture (RESEARCH Pitfall 4) must not silently validate. So extractSystemInit throws on a
// missing model, and validateManifest fails closed on a missing model / missing report / missing cost.
//
// SYMMETRY (D-15): the built-in /deep-research surface ("built-in /deep-research, closed-source") and
// the lz surface ("lz-advisor:lz-deep-research") validate IDENTICALLY -- both pin a CC version + model.
// The MANIFEST is surface-agnostic: it records the surface as a note, but the fail-closed guards are
// the same for both.
//
// NO CAPTURE HERE (D-20 / the session/node split): this module VALIDATES the captured artifacts; the
// capture itself (the `claude -p` headless run that produces the stream-json + report.md) is the
// human-authorized session spend in Plan 22-05. There is NO model call and NO network in this module.
//
// Tree / dependency boundary (D-10/D-11): this script lives in the repo-level eval/ dev tree, NEVER in
// the distributed plugin tree. It imports the SHIPPED runtime aggregator's ContractError ACROSS trees
// by relative path -- ONE-DIRECTIONAL (eval -> runtime, NEVER runtime -> eval). It has NO out-of-family
// transport (D-18).
//
// This source contains no literal byte-order mark and is strictly ASCII (per CLAUDE.md); LF line
// endings. The thin CLI is guarded so importing this module runs nothing.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Cross-tree reuse of the SHIPPED runtime aggregator's fail-closed signal (D-10; eval -> runtime,
// one-directional, never the reverse).
import { ContractError } from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

// Fail-closed BOM-stripping JSON read (the established eval-tree convention) -- used by the CLI to read
// an on-disk stream-json capture / a manifest.
import { readJson } from './lz-eval-readjson.mjs';

// ---------------------------------------------------------------------------
// extractSystemInit(streamJsonlText) -- parse the FIRST system/init event from a stream-json capture
// (one JSON object per line) and return { ccVersion, model, plugins }. The headless system/init line
// (D-15) carries model + the CC version + the loaded plugins.
//
// FAIL-CLOSED (D-15): a missing model line is a ContractError (an unpinned run cannot be graded). A
// stream with NO system/init event at all is also a ContractError. Malformed (non-JSON) lines are
// skipped while scanning for the init event -- but if no valid init-with-model is found, it throws.
// ---------------------------------------------------------------------------
export function extractSystemInit(streamJsonlText) {
  if (typeof streamJsonlText !== 'string') {
    throw new ContractError(
      'extractSystemInit requires the stream-json text as a string: ' + JSON.stringify(streamJsonlText),
      'extractSystemInit',
    );
  }

  const lines = streamJsonlText.split('\n');

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line.length === 0) {
      continue;
    }

    let event;

    try {
      event = JSON.parse(line);
    } catch {
      // A non-JSON line (partial/garbage) is skipped while scanning for the init event.
      continue;
    }

    if (event == null || typeof event !== 'object') {
      continue;
    }

    // The first system/init event wins (D-15: pin the EXACT version + model from the FIRST init line).
    if (event.type === 'system' && event.subtype === 'init') {
      if (typeof event.model !== 'string' || event.model.length === 0) {
        throw new ContractError(
          'system/init event has no model -- an unpinned CC-version+model run cannot be graded (D-15)',
          'extractSystemInit',
        );
      }

      // D-11 (Plan 23-01, verified empirically against BOTH q1 captures on disk): the REAL Claude Code
      // system/init event carries `claude_code_version`; `event.version` is undefined there. Reading
      // only `version` made the ContractError below fire on every real capture, so NO MANIFEST could
      // ever be produced -- the mechanical cause of security T-22-06 / validation gap B1. Prefer the
      // real field and keep `version` as a fallback so older/synthetic fixtures still parse. Same
      // `typeof x === 'string' && x.length > 0` guard idiom as the model guard directly above.
      let ccVersion = null;

      if (typeof event.claude_code_version === 'string' && event.claude_code_version.length > 0) {
        ccVersion = event.claude_code_version;
      } else if (typeof event.version === 'string' && event.version.length > 0) {
        ccVersion = event.version;
      }

      if (ccVersion == null) {
        throw new ContractError(
          'system/init event has no CC version -- the run cannot be pinned (D-15/D-16)',
          'extractSystemInit',
        );
      }

      const plugins = Array.isArray(event.plugins) ? event.plugins.slice() : [];

      return { ccVersion, model: event.model, plugins };
    }
  }

  throw new ContractError(
    'no system/init event found in the stream-json capture (truncated/empty? -- it cannot be graded)',
    'extractSystemInit',
  );
}

// ---------------------------------------------------------------------------
// extractTerminalCost(streamJsonlText) -- the RESOLVED per-run cost source (D-22). It scans every line
// of a stream-json capture and keeps the LAST event whose `type` is `result`, then returns that event's
// `total_cost_usd`.
//
// WHY LAST-WINS, and why it is the whole point: a capture stream can carry MORE THAN ONE result event.
// The real built-in q1 cold stream carries two, and the FIRST reports 0.7800860000000001 -- a fraction
// of the run's 48.5367785. A first-result-event implementation would silently under-report the run by
// ~98%. The TERMINAL result event is the run's own final accounting; the earlier ones are not.
//
// FAIL-CLOSED (T-23-01): a stream with NO result event is a ContractError, and a terminal result event
// whose `total_cost_usd` is absent, non-finite or negative is a ContractError. NO default is
// substituted anywhere -- an unrecoverable cost must surface, never be imputed. Malformed (non-JSON)
// lines are skipped while scanning but can never satisfy the guard.
// ---------------------------------------------------------------------------
export function extractTerminalCost(streamJsonlText) {
  if (typeof streamJsonlText !== 'string') {
    throw new ContractError(
      'extractTerminalCost requires the stream-json text as a string: ' + JSON.stringify(streamJsonlText),
      'extractTerminalCost',
    );
  }

  const lines = streamJsonlText.split('\n');
  let terminal = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line.length === 0) {
      continue;
    }

    let event;

    try {
      event = JSON.parse(line);
    } catch {
      // A non-JSON line (partial/garbage) is skipped while scanning for the terminal result event.
      continue;
    }

    if (event == null || typeof event !== 'object') {
      continue;
    }

    // LAST result event wins (D-22) -- keep overwriting so the final assignment is the terminal one.
    if (event.type === 'result') {
      terminal = event;
    }
  }

  if (terminal == null) {
    throw new ContractError(
      'no type=result event found in the stream-json capture -- the per-run cost cannot be recovered (D-22)',
      'extractTerminalCost',
    );
  }

  const cost = terminal.total_cost_usd;

  if (typeof cost !== 'number' || !Number.isFinite(cost) || cost < 0) {
    throw new ContractError(
      'terminal result event has no valid total_cost_usd (a non-negative finite number is required; no ' +
        'default is substituted): ' +
        JSON.stringify(cost),
      'extractTerminalCost',
    );
  }

  return cost;
}

// ---------------------------------------------------------------------------
// aggregateRunCost({ streamTexts }) -- the per-run total: extractTerminalCost mapped over a
// CALLER-SUPPLIED array of stream texts, summed (D-22 / D-16).
//
// THE ENUMERATION IS THE CALLER'S (T-23-12, repudiation): this function NEVER discovers which streams
// belong to a run by globbing the filesystem. A cost figure whose stream enumeration is implicit cannot
// be audited later, and a same-directory glob would silently fold in a DIFFERENT session's stream (the
// built-in q1 directory holds exactly such a file). The caller enumerates, the MANIFEST records the
// enumeration under `costStreams`, and the exclusions are recorded with their reason.
//
// FAIL-CLOSED: a non-array `streamTexts` is a ContractError; every element is validated by
// extractTerminalCost, so one uncostable stream fails the whole aggregate rather than being skipped.
// ---------------------------------------------------------------------------
export function aggregateRunCost({ streamTexts } = {}) {
  if (!Array.isArray(streamTexts)) {
    throw new ContractError(
      'aggregateRunCost requires a streamTexts array -- the CALLER enumerates which streams belong to a ' +
        'run (T-23-12): ' +
        JSON.stringify(streamTexts),
      'aggregateRunCost',
    );
  }

  let total = 0;

  for (const streamText of streamTexts) {
    total += extractTerminalCost(streamText);
  }

  return total;
}

// ---------------------------------------------------------------------------
// buildManifest({ system, reportPath, costUsd, workflowSurface, question, qid, runK }) -- assemble the
// per-run MANIFEST record. It pins the CC version + model (from `system`, the extractSystemInit
// result), the report.md path, the per-run cost (D-16), the workflow-surface note, and the question id
// + run index. Returns the manifest object (it does NOT validate here -- validateManifest is the gate).
// Fail-closed on a malformed `system` (the extractSystemInit shape is required).
// ---------------------------------------------------------------------------
export function buildManifest({ system, reportPath, costUsd, workflowSurface, question, qid, runK } = {}) {
  if (system == null || typeof system !== 'object') {
    throw new ContractError(
      'buildManifest requires a system object (the extractSystemInit result): ' + JSON.stringify(system),
      'buildManifest',
    );
  }

  if (typeof system.model !== 'string' || system.model.length === 0) {
    throw new ContractError('buildManifest system is missing a model (D-15)', 'buildManifest');
  }

  if (typeof system.ccVersion !== 'string' || system.ccVersion.length === 0) {
    throw new ContractError('buildManifest system is missing a ccVersion (D-15)', 'buildManifest');
  }

  return {
    ccVersion: system.ccVersion,
    model: system.model,
    plugins: Array.isArray(system.plugins) ? system.plugins.slice() : [],
    reportPath,
    costUsd,
    workflowSurface,
    question,
    qid,
    runK,
  };
}

// ---------------------------------------------------------------------------
// validateManifest(manifest) -- the fail-closed gate (D-15/D-16). Returns true iff the manifest is
// complete + the report exists; otherwise throws a DISTINCT ContractError per missing load-bearing
// field:
//   - a missing/empty model      -> 'model' in the message (the run is unpinned -- cannot be graded).
//   - a missing/empty ccVersion  -> 'CC version' in the message (cannot be pinned).
//   - a missing reportPath / a non-existent report file -> 'report' in the message.
//   - a missing costUsd          -> 'cost' in the message (D-16 per-run cost).
// Both surfaces (built-in + lz) validate symmetrically -- the workflowSurface is a note, not a gate.
// ---------------------------------------------------------------------------
export function validateManifest(manifest) {
  if (manifest == null || typeof manifest !== 'object') {
    throw new ContractError('manifest is not an object: ' + JSON.stringify(manifest), 'validateManifest');
  }

  // D-15: the model pin is load-bearing -- a missing/empty model means an unpinned run that cannot be
  // graded. Fail CLOSED.
  if (typeof manifest.model !== 'string' || manifest.model.length === 0) {
    throw new ContractError(
      'manifest is missing the system/init model -- an unpinned CC-version+model run cannot be graded (D-15)',
      'validateManifest',
    );
  }

  // D-15/D-16: the CC version pin is load-bearing (never average across CC versions).
  if (typeof manifest.ccVersion !== 'string' || manifest.ccVersion.length === 0) {
    throw new ContractError(
      'manifest is missing the CC version -- the run cannot be pinned (D-15/D-16)',
      'validateManifest',
    );
  }

  // The report.md must exist on disk -- a truncated capture with no report cannot be graded (T-22-03).
  if (typeof manifest.reportPath !== 'string' || manifest.reportPath.length === 0) {
    throw new ContractError('manifest is missing a reportPath', 'validateManifest');
  }

  if (!fs.existsSync(manifest.reportPath)) {
    throw new ContractError(
      'manifest report file does not exist (truncated/empty capture?): ' + manifest.reportPath,
      'validateManifest',
    );
  }

  // D-16: the per-run cost is load-bearing (report per-run cost, never a hidden average).
  if (typeof manifest.costUsd !== 'number' || !Number.isFinite(manifest.costUsd) || manifest.costUsd < 0) {
    throw new ContractError(
      'manifest is missing a valid per-run cost (costUsd, a non-negative finite number) (D-16)',
      'validateManifest',
    );
  }

  return true;
}

// ---------------------------------------------------------------------------
// Thin CLI (guarded so importing the module does NOT run it). Two positionals:
//   <stream.jsonl> <manifest-out.json>?  -- extracts system/init from the capture, prints the pin.
// OR a single <manifest.json> -- validates an existing manifest. Exits 0 on success, 2 on a contract
// error. NO model call -- it reads captured artifacts from disk (zero spend).
// ---------------------------------------------------------------------------
/* node:coverage disable */
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const inputPath = process.argv[2];

  if (!inputPath || !fs.existsSync(inputPath)) {
    console.error('lz-eval-baseline-manifest: missing or invalid <stream.jsonl | manifest.json>');
    process.exit(2);
  }

  try {
    if (inputPath.endsWith('.json')) {
      // Validate an existing manifest.
      const manifest = readJson(inputPath);
      validateManifest(manifest);
      console.log('manifest valid: model=' + manifest.model + ' ccVersion=' + manifest.ccVersion);
    } else {
      // Extract the system/init pin from a stream-json capture.
      const text = fs.readFileSync(inputPath, 'utf8');
      const info = extractSystemInit(text);
      console.log('system/init: model=' + info.model + ' ccVersion=' + info.ccVersion);
    }

    process.exit(0);
  } catch (err) {
    const where = err && err.file ? ' (' + err.file + ')' : '';
    console.error('lz-eval-baseline-manifest: ' + (err && err.message ? err.message : String(err)) + where);
    process.exit(2);
  }
}
/* node:coverage enable */
