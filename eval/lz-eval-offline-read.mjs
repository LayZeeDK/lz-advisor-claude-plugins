// lz-eval-offline-read.mjs
//
// The OFFLINE known-gold Haiku-vs-Sonnet gating-read DECISION DRIVER (Plan 19-04, Task 1; EVAL-01 /
// EVAL-02 / EVAL-04). This module is the DETERMINISTIC seam around the model votes: it owns the D-06
// Sonnet-as-calibrator gate, the Haiku-MINUS-Sonnet pooled DELTA read, the Pass@1 / Pass^k /
// per-stratum false-uphold reporting, the VOID / PASS / FAIL-RAISE outcome resolver, and the
// resumable filesystem vote persistence (skip-already-done, D-08) + per-vote search trace (D-10).
//
// It does NOT itself spawn subagents. The model VOTES come from the D-08 dynamic Workflow over the
// nested voter subagents (Sonnet calibrator first, then the Haiku variant); that Workflow writes each
// vote (verdict + search trace) into the gitignored eval/.cache/ via persistVote() below, and this
// module reads those vote files back and computes the mechanical decision. The deterministic decision
// logic is the unit-tested seam (lz-eval-offline-read.test.mjs); the model dispatch is the Workflow.
//
// Tree / dependency boundary (D-10/D-11): this script lives in the repo-level eval/ tree, NEVER in
// the distributed plugin tree. It imports the FROZEN engine (lz-eval-aggregate.mjs) + the search
// spine (lz-eval-search-loop.mjs) WITHIN the eval tree, and the SHIPPED runtime aggregator's
// hardening primitives ACROSS trees by relative path -- ONE-DIRECTIONAL (eval -> runtime, NEVER
// runtime -> eval) -- so no eval dependency can ever leak into the marketplace package. NEVER add an
// eval/ import to any plugin-tree file. The module is node stdlib + the in-eval engine/spine + the
// runtime hardening primitives; zero direct npm deps (the CI math is jstat-backed via the frozen
// engine, never hand-rolled here).
//
// The byte-order mark is code point U+FEFF. This source contains no literal byte-order mark; the
// imported stripBom handles a BOM at read time (ASCII-only source per CLAUDE.md).
//
// Pure functions are exported for the validation fixture; the thin CLI is guarded so that `import`-ing
// this module does NOT run the CLI.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// (1) The FROZEN, OFF-MODEL engine (consumed, NOT rewritten -- Plan 18-03 / re-registered 19-03). The
//     CI math (clopperPearsonUpper, passAtK, passHatK) is jstat-backed INSIDE this engine; the gate
//     verdict (lockRuleVerdict) and the false-uphold counter (countFalseUpholds) / DELTA (delta) are
//     the pre-registered mechanical decision. We NEVER re-derive any of these here.
import {
  countFalseUpholds,
  delta,
  clopperPearsonUpper,
  passAtK,
  passHatK,
  lockRuleVerdict,
  EVAL_THRESHOLDS,
} from './lz-eval-aggregate.mjs';

// (2) The Plan-01 search-and-stop spine: the offline read drives searchAndStop bound to the
//     staticKsAdapter (the per-claim date cutoff enforced, NEVER live web -- D-07). Re-exported by use
//     so the Workflow / CLI can compose a vote from the same deterministic core the test samples.
import { searchAndStop, staticKsAdapter, dateFilter } from './lz-eval-search-loop.mjs';

// (3) Cross-tree reuse of the SHIPPED runtime aggregator's hardening primitives (D-10; eval ->
//     runtime, one-directional, never the reverse). safeId guards a content-derived vote basename
//     before it can index gold or reach any path; ContractError / stripBom give the fail-closed read.
import {
  ContractError,
  stripBom,
  safeId,
} from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

// searchAndStop / staticKsAdapter / dateFilter are part of the deterministic spine the offline read
// composes; referenced where a vote is produced (CLI / Workflow). Kept exported-by-use so a lint pass
// does not flag the spine import while the per-module Workflow wiring lives agent-side.
void searchAndStop;
void staticKsAdapter;
void dateFilter;

// ---------------------------------------------------------------------------
// Fail-closed JSON read (copy of the runtime aggregator's module-private readJson shape, using the
// IMPORTED ContractError + stripBom -- never a bare JSON.parse on an untrusted vote file). T-19-PARSE.
// ---------------------------------------------------------------------------
const readText = (p) => fs.readFileSync(p, 'utf8');

export function readJson(p) {
  let text;

  try {
    text = stripBom(readText(p));
  } catch (err) {
    throw new ContractError('cannot read file: ' + err.message, p);
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    throw new ContractError('malformed JSON: ' + err.message, p);
  }
}

// ---------------------------------------------------------------------------
// The D-06 SATURATION pre-condition / Sonnet-as-calibrator gate (the gate ON the gate).
//
// Sonnet runs FIRST as the difficulty calibrator. A stratum DISCRIMINATES only if Sonnet is
// demonstrably BELOW ceiling on it -- i.e. Sonnet catches the traps with a NON-TRIVIAL false-uphold
// count gap (it does NOT ace the stratum). The mechanical reading of "below ceiling" here is: Sonnet
// recorded at least one false-uphold on the stratum (a both-models-ace tie -- Sonnet 0 false-upholds
// -- is the saturation fallacy that voided the Phase-18 supplied-evidence pilots and is NEVER read as
// Haiku-safe).
//
// This is decided BEFORE the frozen engine runs: a 'saturated' calibrator forces VOID (the engine has
// no VOID branch -- lockRuleVerdict returns only PASS / FAIL-RAISE). The recorded CP(1,N) ceiling
// label is computed via the frozen clopperPearsonUpper for the run artifact; the DISCRIMINATION
// DECISION itself is the exact-zero Sonnet-false-uphold check, never a CI-width comparison (the
// Pitfall-3 clustering caveat -- the CP value is a LABEL, never re-derived as a clustered CI).
//
// Returns { status: 'below-ceiling' | 'saturated', sonnetFalseUpholds, trials, ceiling, reason }.
// ---------------------------------------------------------------------------
export function calibratorGate({ sonnetFalseUpholds, trials } = {}) {
  if (!Number.isInteger(sonnetFalseUpholds) || sonnetFalseUpholds < 0) {
    throw new ContractError(
      'calibratorGate requires a non-negative integer sonnetFalseUpholds: ' + JSON.stringify(sonnetFalseUpholds),
      'calibratorGate',
    );
  }

  if (!Number.isInteger(trials) || trials < EVAL_THRESHOLDS.MIN_K) {
    throw new ContractError(
      'calibratorGate requires trials >= MIN_K (' + EVAL_THRESHOLDS.MIN_K + '): ' + JSON.stringify(trials),
      'calibratorGate',
    );
  }

  if (sonnetFalseUpholds > trials) {
    throw new ContractError(
      'calibratorGate: sonnetFalseUpholds (' + sonnetFalseUpholds + ') cannot exceed trials (' + trials + ')',
      'calibratorGate',
    );
  }

  // The recorded CP(1,N) ceiling LABEL for the run artifact (the FORMULA at the realized n, D-05).
  // This value is a LABEL, never re-derived as a clustered CI (Pitfall 3).
  const ceiling = clopperPearsonUpper(1, trials, EVAL_THRESHOLDS.ALPHA);

  // DISCRIMINATION = Sonnet recorded at least one false-uphold (below ceiling). Zero false-upholds is
  // the saturation fallacy (a both-models-ace tie) -> NON-discriminating -> harden + re-calibrate, or
  // VOID if no hardened stratum can put Sonnet below ceiling.
  if (sonnetFalseUpholds >= 1) {
    return Object.freeze({
      status: 'below-ceiling',
      sonnetFalseUpholds,
      trials,
      ceiling,
      reason: 'sonnet-below-ceiling',
    });
  }

  return Object.freeze({
    status: 'saturated',
    sonnetFalseUpholds,
    trials,
    ceiling,
    reason: 'sonnet-aces-stratum (non-discriminating -- harden + re-calibrate, else VOID)',
  });
}

// ---------------------------------------------------------------------------
// The pooled DELTA read (EVAL-02 / D-05). Given the per-seat vote directories (sonnet + haiku) over
// the SHARED SUBTLE open-book pool and the gold labels, compute via the FROZEN engine:
//   - the Sonnet + Haiku false-uphold counts (countFalseUpholds -- off-model verdict-vs-gold);
//   - the pooled EXCESS (delta(haiku, sonnet)) -- the SOLE gated quantity (Haiku-MINUS-Sonnet);
//   - the pooled n (the realized claim-trial count, the shared trial pool size);
//   - the CP(1, N_pooled) ceiling LABEL (clopperPearsonUpper, the recorded value of record, D-05);
//   - the SUBTLE-open-book delta upper bound the engine's hard gate reads.
//   - Pass@1 / Pass^k (the EVAL-02 sampling reliability, computed PER SEAT via the engine combinatorics).
//
// THE GATE IS THE EXACT-ZERO POOLED EXCESS COUNT (Pitfall 3): the recorded pooled CP(1,N) value is a
// LABEL, NEVER re-derived as a clustered / design-effect CI; "~0.05" is never presented as a coverage
// guarantee. The engine's 0.25 per-claim anchor discriminates 0-vs->=1 excess ONLY at the per-claim
// RELIABILITY scale (CP(0,15)~=0.218 PASS, CP(1,15)~=0.319 FAIL) -- at the LARGE pooled n the CP upper
// on a single excess is small (e.g. CP(2,80)~=0.087 < 0.25), so reading the engine anchor at the
// pooled n would let a non-zero excess SLIDE UNDER the gate. To keep "any single excess fails"
// MECHANICALLY true, the engine-facing subtleOpenBookDeltaUpper is the CP upper on the
// EXACT-ZERO-vs->=1 excess COUNT evaluated at the per-claim reliability scale (reliableTrials): a zero
// pooled excess -> CP(0, reliableTrials) (PASS-side of 0.25); ANY non-zero excess -> CP(1,
// reliableTrials) (FAIL-side of 0.25), independent of how large the pooled n is. The pooled CP(1,N)
// label is recorded separately as the run-artifact value of record.
//
// goldLabels maps a vote id -> its expected verdict ('refuted' for a bad/trap seed). Both seat
// directories index the SAME gold (the shared pool). k is the EVAL-02 reporting k (floor MIN_K = 5);
// reliableTrials is the realized per-claim trial depth (>= RELIABLE_TRIALS = 15 before a PASS).
// ---------------------------------------------------------------------------
export function readDelta({
  sonnetVoteDir,
  haikuVoteDir,
  goldLabels,
  nPooled,
  reliableTrials,
  k = EVAL_THRESHOLDS.MIN_K,
} = {}) {
  if (typeof sonnetVoteDir !== 'string' || typeof haikuVoteDir !== 'string') {
    throw new ContractError('readDelta requires sonnetVoteDir + haikuVoteDir paths', 'readDelta');
  }

  if (!Number.isInteger(nPooled) || nPooled <= 0) {
    throw new ContractError('readDelta requires a positive integer nPooled: ' + JSON.stringify(nPooled), 'readDelta');
  }

  if (!Number.isInteger(reliableTrials) || reliableTrials < 1) {
    throw new ContractError('readDelta requires a positive integer reliableTrials (>= 1; reliableTrials=0 feeds a degenerate clopperPearsonUpper(_,0,_)): ' + JSON.stringify(reliableTrials), 'readDelta');
  }

  if (!Number.isInteger(k) || k < EVAL_THRESHOLDS.MIN_K) {
    throw new ContractError('readDelta requires k >= MIN_K (' + EVAL_THRESHOLDS.MIN_K + '): ' + JSON.stringify(k), 'readDelta');
  }

  // passHatK/passAtK are undefined for n < k (they return NaN by contract). Guard nPooled >= k here so
  // a NaN can never land silently in the frozen read output; a pool smaller than the reporting k is a
  // misconfigured run, not a valid read.
  if (nPooled < k) {
    throw new ContractError('readDelta requires nPooled >= k (else passHatK is NaN in the read): nPooled=' + nPooled + ' k=' + k, 'readDelta');
  }

  // The FROZEN off-model verdict-vs-gold counts over the shared SUBTLE pool (each routes every vote id
  // through safeId inside the engine -- T-19-TRAVERSE).
  const sonnetFalseUpholds = countFalseUpholds(sonnetVoteDir, goldLabels);
  const haikuFalseUpholds = countFalseUpholds(haikuVoteDir, goldLabels);

  // A vote dir holding MORE false-upholds than the declared pooled n (a superset / stale vote dir)
  // would drive sonnetCorrect / haikuCorrect NEGATIVE into passAtK below. Fail closed: a realized
  // false-uphold count can never exceed the pool it was drawn from.
  if (sonnetFalseUpholds > nPooled || haikuFalseUpholds > nPooled) {
    throw new ContractError(
      'readDelta: false-uphold count exceeds nPooled (superset/stale vote dir): sonnet=' +
        sonnetFalseUpholds + ' haiku=' + haikuFalseUpholds + ' nPooled=' + nPooled,
      'readDelta',
    );
  }

  // The SOLE gated quantity: the Haiku-MINUS-Sonnet pooled EXCESS (never Haiku's absolute rate, D-06).
  const pooledExcess = delta(haikuFalseUpholds, sonnetFalseUpholds);

  // The recorded CP(1, N_pooled) ceiling LABEL (the run-artifact value of record, D-05). LABEL only --
  // NEVER re-derived as a clustered CI (Pitfall 3); "~0.05" is never presented as a coverage guarantee.
  const pooledCeilingLabel = clopperPearsonUpper(1, nPooled, EVAL_THRESHOLDS.ALPHA);

  // The SUBTLE-open-book delta upper bound the engine's hard gate reads. To make "any single excess
  // fails" MECHANICALLY true regardless of the (large) pooled n, this is the CP upper on the
  // EXACT-ZERO-vs->=1 excess COUNT at the per-claim RELIABILITY scale: zero pooled excess -> CP(0,
  // reliableTrials) (PASS-side of the 0.25 anchor); ANY non-zero excess -> CP(1, reliableTrials)
  // (FAIL-side). A negative excess (Haiku BETTER than Sonnet) is a zero-excess clean read. The CI x is
  // the EXACT-ZERO-count indicator (0 or 1), NEVER the raw excess magnitude (so 1 excess and 5 excess
  // both FAIL identically -- the gate is the count being non-zero, not its size).
  const excessIndicator = pooledExcess > 0 ? 1 : 0;
  const subtleOpenBookDeltaUpper = clopperPearsonUpper(excessIndicator, reliableTrials, EVAL_THRESHOLDS.ALPHA);

  // EVAL-02 sampling reliability PER SEAT (passes = nPooled - falseUpholds; combinatorics via the
  // engine, NEVER hand-rolled). These are reported alongside the gate, they do not themselves gate.
  const sonnetCorrect = nPooled - sonnetFalseUpholds;
  const haikuCorrect = nPooled - haikuFalseUpholds;

  return Object.freeze({
    sonnetFalseUpholds,
    haikuFalseUpholds,
    pooledExcess,
    nPooled,
    reliableTrials,
    k,
    pooledCeilingLabel,
    subtleOpenBookDeltaUpper,
    passAt1: Object.freeze({
      sonnet: passAtK(nPooled, sonnetCorrect, 1),
      haiku: passAtK(nPooled, haikuCorrect, 1),
    }),
    passHatK: Object.freeze({
      sonnet: passHatK(nPooled, sonnetCorrect, k),
      haiku: passHatK(nPooled, haikuCorrect, k),
    }),
  });
}

// ---------------------------------------------------------------------------
// The settle-OR-raise OUTCOME RESOLVER (EVAL-04). VOID is decided BEFORE the frozen engine runs:
//   - calibrator 'saturated' (no Sonnet-below-ceiling stratum) -> 'VOID' (the engine never sees a
//     saturated stratum -- a both-models-ace tie is NEVER read as Haiku-safe, D-06). RAISE to user.
//   - calibrator 'below-ceiling' -> delegate to the FROZEN lockRuleVerdict for PASS / FAIL-RAISE.
//
// The engine PASSES only when the SUBTLE-open-book delta upper bound is at/below the anchor (a clean
// ZERO pooled excess), the escalation fraction is below the kill band, AND reliableTrials >= 15. Any
// non-zero pooled excess pushes subtleOpenBookDeltaUpper above the anchor -> FAIL-RAISE.
//
// Returns { outcome: 'VOID' | 'PASS' | 'FAIL-RAISE', raiseToUser: boolean, shipsSonnetDefault, reason,
//   ...the read fields }. Sonnet-default ships in EVERY non-PASS case (settle-OR-raise honored).
// ---------------------------------------------------------------------------
export function resolveOutcome({ calibration, read, escalationFraction } = {}) {
  if (calibration == null || typeof calibration !== 'object' || typeof calibration.status !== 'string') {
    throw new ContractError('resolveOutcome requires a calibration result (calibratorGate output)', 'resolveOutcome');
  }

  // GATE-ON-THE-GATE: a saturated calibrator is VOID, decided BEFORE the engine. The delta is NOT read
  // (a both-models-ace tie is never read as Haiku-safe). RAISE to user; Sonnet-default ships.
  if (calibration.status === 'saturated') {
    return Object.freeze({
      outcome: 'VOID',
      raiseToUser: true,
      shipsSonnetDefault: true,
      reason: 'saturation pre-condition failed (no Sonnet-below-ceiling stratum) -- defer the tier to Phase-20 shadow',
      calibration,
    });
  }

  if (calibration.status !== 'below-ceiling') {
    throw new ContractError('resolveOutcome: unknown calibration.status ' + JSON.stringify(calibration.status), 'resolveOutcome');
  }

  if (read == null || typeof read !== 'object') {
    throw new ContractError('resolveOutcome requires a read (readDelta output) on a below-ceiling stratum', 'resolveOutcome');
  }

  if (!Number.isFinite(escalationFraction) || escalationFraction < 0 || escalationFraction > 1) {
    // Range-check [0,1]: an escalation FRACTION outside [0,1] is a computation error. Left unguarded, a
    // negative value silently clears the cost gate (escalationFraction < ESCALATION_KILL_HIGH), masking
    // the error as a PASS-eligible read. Fail closed.
    throw new ContractError('resolveOutcome requires escalationFraction in [0,1]: ' + JSON.stringify(escalationFraction), 'resolveOutcome');
  }

  // Below ceiling: delegate to the FROZEN engine (PASS / FAIL-RAISE only -- VOID is handled above).
  const verdict = lockRuleVerdict({
    subtleOpenBookDeltaUpper: read.subtleOpenBookDeltaUpper,
    escalationFraction,
    reliableTrials: read.reliableTrials,
  });

  const isPass = verdict === 'PASS';

  return Object.freeze({
    outcome: verdict, // 'PASS' | 'FAIL-RAISE'
    raiseToUser: !isPass,
    shipsSonnetDefault: !isPass, // on PASS the Haiku-first flag flips ON; otherwise Sonnet-default ships
    haikuFirstFlag: isPass ? 'ON' : 'OFF',
    reason: isPass
      ? 'all three gates clear at reliable=15 on a Sonnet-below-ceiling stratum -- clear Haiku for Phase-20 shadow/canary'
      : 'a gate failed (non-zero pooled excess, kill-band escalation, or insufficient reliability) -- raise to user; Sonnet-default ships',
    escalationFraction,
    calibration,
    read,
  });
}

// ---------------------------------------------------------------------------
// Resumable vote persistence (D-08): the D-08 dynamic Workflow writes each vote here, and a re-run
// SKIPS an already-persisted vote (skip-already-done) so a credit / account interruption mid-run is
// recoverable. A vote record is { id, seat, verdict, trace:{queries[], depth, stop_reason} }: the
// per-vote SEARCH TRACE (D-10) makes a null delta diagnosable as genuine parity vs both-stopped-early.
//
// votePath = voteDir/<safeId(seat-id)>.json. The basename is safeId-guarded (T-19-TRAVERSE) so a
// content-derived id can never traverse. Returns { persisted: boolean, skipped: boolean, path }.
// persisted=true on a fresh write; skipped=true when the vote already exists (idempotent re-run).
// ---------------------------------------------------------------------------
export function votePath(voteDir, id) {
  if (typeof voteDir !== 'string' || voteDir.length === 0) {
    throw new ContractError('votePath requires a voteDir (gitignored eval/.cache/)', 'votePath');
  }

  const base = safeId(String(id), 'votePath') + '.json';

  return path.join(voteDir, base);
}

export function votePersisted(voteDir, id) {
  return fs.existsSync(votePath(voteDir, id));
}

export function persistVote(voteDir, vote, { overwrite = false } = {}) {
  if (typeof voteDir !== 'string' || voteDir.length === 0) {
    throw new ContractError('persistVote requires a voteDir (gitignored eval/.cache/)', 'persistVote');
  }

  if (vote == null || typeof vote !== 'object') {
    throw new ContractError('persistVote requires a vote object', 'persistVote');
  }

  if (typeof vote.id !== 'string' || vote.id.length === 0) {
    throw new ContractError('persistVote vote requires a non-empty id', 'persistVote');
  }

  if (vote.verdict !== 'unrefuted' && vote.verdict !== 'refuted') {
    throw new ContractError(
      'persistVote vote.verdict must be in {unrefuted,refuted}: ' + JSON.stringify(vote.verdict),
      'persistVote',
    );
  }

  // The per-vote SEARCH TRACE is REQUIRED (D-10): { queries:[], depth, stop_reason }. A null delta is
  // only diagnosable as parity-vs-both-stopped-early when the trace is present.
  const t = vote.trace;

  if (
    t == null ||
    typeof t !== 'object' ||
    !Array.isArray(t.queries) ||
    typeof t.depth !== 'number' ||
    typeof t.stop_reason !== 'string'
  ) {
    throw new ContractError(
      'persistVote vote.trace must be { queries:[], depth:number, stop_reason:string } (D-10)',
      'persistVote',
    );
  }

  const p = votePath(voteDir, vote.id);

  // SKIP-ALREADY-DONE (D-08): a re-run does NOT re-cast or overwrite an existing vote unless told to.
  if (!overwrite && fs.existsSync(p)) {
    return Object.freeze({ persisted: false, skipped: true, path: p });
  }

  fs.mkdirSync(voteDir, { recursive: true });
  fs.writeFileSync(p, JSON.stringify(vote, null, 2) + '\n', 'utf8');

  return Object.freeze({ persisted: true, skipped: false, path: p });
}

// ---------------------------------------------------------------------------
// Thin CLI (guarded so importing the module does NOT run it). With `--resolve <run-dir>` it reads a
// run config (run.json: { sonnetVoteDir, haikuVoteDir, goldLabels, nPooled, reliableTrials,
// calibration:{sonnetFalseUpholds,trials}, escalationFraction }) from <run-dir> and prints the
// outcome (VOID / PASS / FAIL-RAISE); exits 0 / 2. The actual read (Task 2) is driven by the D-08
// Workflow; this CLI is a convenience that composes the exported deterministic functions over an
// already-persisted vote set.
// ---------------------------------------------------------------------------
/* node:coverage disable */
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    const mode = process.argv[2];

    if (mode === '--resolve') {
      const runDir = process.argv[3];

      if (!runDir || !fs.existsSync(runDir) || !fs.statSync(runDir).isDirectory()) {
        console.error('lz-eval-offline-read: missing or invalid <run-dir>');
        process.exit(2);
      }

      const cfg = readJson(path.join(runDir, 'run.json'));
      const calibration = calibratorGate({
        sonnetFalseUpholds: cfg.calibration.sonnetFalseUpholds,
        trials: cfg.calibration.trials,
      });

      let read = null;

      if (calibration.status === 'below-ceiling') {
        read = readDelta({
          sonnetVoteDir: path.resolve(runDir, cfg.sonnetVoteDir),
          haikuVoteDir: path.resolve(runDir, cfg.haikuVoteDir),
          goldLabels: cfg.goldLabels,
          nPooled: cfg.nPooled,
          reliableTrials: cfg.reliableTrials,
        });
      }

      const outcome = resolveOutcome({ calibration, read, escalationFraction: cfg.escalationFraction });
      console.log(JSON.stringify(outcome, null, 2));
      process.exit(0);
    }

    console.error('lz-eval-offline-read: usage: node lz-eval-offline-read.mjs --resolve <run-dir>');
    process.exit(2);
  } catch (err) {
    const where = err && err.file ? ' (' + err.file + ')' : '';
    console.error('lz-eval-offline-read: ' + (err && err.message ? err.message : String(err)) + where);
    process.exit(2);
  }
}
/* node:coverage enable */
