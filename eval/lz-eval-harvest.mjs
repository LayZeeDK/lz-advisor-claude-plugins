// lz-eval-harvest.mjs
//
// NET-NEW (Plan 20-02, Task 1; D-02 "run the skill on itself", D-03 two-arms-never-pooled): the LIVE
// over-refusal control-set + dense-trap monitor-set LOADER. The authority is 20-CONTEXT.md (D-02/D-03)
// + 20-RESEARCH.md "The LIVE certification harness ... What is genuinely NEW (1)" + 19-04-REPLAN-
// DECISION-12.md (the over-refusal CP gate MOVES to the live arm).
//
// It reads the SHIPPING deep-research skill's OWN output -- survivors.json + the report claim records
// from a CURATED set of real run dirs (the only difficulty-matched-AND-real positives available, D-02)
// -- selects the SUPPORTED-confidence claims, and difficulty-STRATIFIES to OVERSAMPLE dense /
// contested-evidence SUPPORTED claims (the band where correlated cheap-tier errors live), so a
// degenerate always-uphold judge cannot clear the over-refusal gate trivially.
//
// It emits TWO SEPARATE ARMS that are NEVER pooled into one N (D-03):
//   - the over-refusal CONTROL set (target N_ctrl = 40, floor 30) -- harvested SUPPORTED positives the
//     voter SHOULD uphold (an over-refusal is a wrong refute on one of these);
//   - the dense-trap false-uphold MONITOR set (target N_trap ~34-40, floor 30) -- harvested dense /
//     contested SUPPORTED claims that, on closer adjudication, are the band where a cheap voter is most
//     likely to wrongly uphold an unsupported overreach.
// A function or return shape that pools the two arms into one N is a DEFECT (the test asserts they are
// distinct arrays the harvester never concatenates).
//
// The loader is a PURE FUNCTION of its input run-dir corpus: no network, no model spend, no LZ_SPEND
// code path (the harvester is on-disk loading only; the spend lives in lz-eval-live-cert.mjs Stage 2+).
// It is the live analog of the offline lz-eval-control-source.mjs / lz-eval-survival-probe.mjs loaders,
// but the SOURCE is the pipeline's OWN run dirs, not FEVER / VitaminC.
//
// Tree / dependency boundary (D-10/D-11): this script lives in the repo-level eval/ dev tree, NEVER in
// the distributed plugin tree. It imports the SHIPPED runtime aggregator's fail-closed read primitives
// (listJson / safeId / ContractError) ACROSS trees by relative path -- ONE-DIRECTIONAL (eval ->
// runtime, NEVER runtime -> eval) -- so no eval dependency can ever leak into the marketplace package.
// NEVER add an eval/ import to any plugin-tree file. The module is node stdlib + the runtime hardening
// primitives + the shared eval readJson helper; zero npm deps.
//
// This source contains no literal byte-order mark and is strictly ASCII (per CLAUDE.md); JSON reads go
// through the shared lz-eval-readjson.mjs helper, which strips a BOM at read time.
//
// Pure functions are exported for the validation fixture; the thin CLI is guarded so that `import`-ing
// this module does NOT run the CLI.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Cross-tree reuse of the SHIPPED runtime aggregator's hardening primitives (D-10; eval -> runtime,
// one-directional, never the reverse). listJson is the sorted fail-closed *.json listing; safeId guards
// a content-derived claim id before it is used as a map key / surfaced; ContractError backs the
// fail-closed reads.
import {
  ContractError,
  safeId,
  listJson,
} from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

// Shared fail-closed JSON read (the eval-tree helper; strips a BOM, never a bare JSON.parse).
import { readJson } from './lz-eval-readjson.mjs';

// ---------------------------------------------------------------------------
// FROZEN harvest N targets (D-03): run-config N TARGETS, NOT threshold changes. The frozen
// EVAL_THRESHOLDS (TAU_OR 0.15 / TAU_FU 0.10 / N_CTRL_FLOOR 24) stay BYTE-IDENTICAL in the engine; these
// are the live-arm N targets that sit ABOVE the frozen floor. The two arms are NEVER pooled.
//   N_CTRL_TARGET 40 (floor 30): the over-refusal control arm. The N=24 knife-edge (CP1s(0,24)=~0.117
//     can FAIL the 0.10 gate; CP1s(1,24)=~0.183 FAILS the 0.15 gate) is why the target sits at 40.
//   N_TRAP_TARGET 40 / floor 30: the dense-trap false-uphold MONITOR arm (target band ~34-40).
// These TARGETS govern how many SUPPORTED claims the harvester aims to select per arm; the LOCK rule
// (lz-eval-live-lock-rule.md) freezes them in prose before any scored vote. They are NOT EVAL_THRESHOLDS
// keys (those stay byte-identical) -- they are harvest run-config.
// ---------------------------------------------------------------------------
export const HARVEST_TARGETS = Object.freeze({
  N_CTRL_TARGET: 40,
  N_CTRL_FLOOR: 30,
  N_TRAP_TARGET: 40,
  N_TRAP_FLOOR: 30,
  // The dense / contested-evidence oversampling band: a claim is DENSE when it carries at least this many
  // corroborating sources (corroboration_lower_bound) OR is confidence==='Contested' (the band where
  // correlated cheap-tier errors live). The dense-trap monitor arm draws preferentially from this band;
  // the over-refusal control arm oversamples it relative to a flat sample so a trivial always-uphold judge
  // cannot clear the over-refusal gate.
  DENSE_SOURCE_FLOOR: 2,
});

// ---------------------------------------------------------------------------
// SUPPORTED-confidence selection (D-02): the live positives are the SUPPORTED-confidence claims the
// shipping skill emitted. The frozen confidence enum is High | Medium | Low | Contested | Unsupported
// (the survivor + report-claim records, lz-deep-research-schema.md). A SUPPORTED claim is one the skill
// resolved to a positive confidence -- High or Medium (the strongly-supported band); Low/Contested/
// Unsupported are NOT SUPPORTED positives (they are the band the skill itself flagged as weak/dissenting/
// absent). The dense-trap MONITOR arm additionally pulls Contested claims (a contested claim is, by
// construction, in the dense / correlated-error band).
// ---------------------------------------------------------------------------
const SUPPORTED_CONFIDENCE = Object.freeze({ High: true, Medium: true });

export function isSupportedClaim(rec) {
  return rec != null && typeof rec === 'object' && SUPPORTED_CONFIDENCE[rec.confidence] === true;
}

// A claim is DENSE / contested-evidence when it carries >= DENSE_SOURCE_FLOOR corroborating sources OR
// it is Contested (the band where correlated cheap-tier errors live -- the oversample target). Contested
// claims are NOT SUPPORTED positives (they never enter the control arm), but a dense High/Medium claim is.
export function isDenseClaim(rec, { sourceFloor = HARVEST_TARGETS.DENSE_SOURCE_FLOOR } = {}) {
  if (rec == null || typeof rec !== 'object') {
    return false;
  }

  const corroboration = Number.isInteger(rec.corroboration_lower_bound) ? rec.corroboration_lower_bound : 0;

  return corroboration >= sourceFloor || rec.confidence === 'Contested';
}

// ---------------------------------------------------------------------------
// readRunDirClaims(runDir): fail-closed read of ONE real run dir's survivor / report claim records. It
// reads survivors.json (the stage-1 survivor array). Each record MUST be a non-null object carrying a
// string id + a string confidence (the frozen survivor shape) -- a malformed record fails closed with a
// ContractError (mirroring the offline readJson / scorePositiveControls discipline). Every content-
// derived id is routed through safeId (T-19-TRAVERSE) before it is surfaced.
//
// Returns the survivor records as read (an array). A missing survivors.json fails closed (the run dir is
// not a usable harvest source). The caller (harvest) selects the SUPPORTED claims + stratifies.
// ---------------------------------------------------------------------------
export function readRunDirClaims(runDir) {
  if (typeof runDir !== 'string' || runDir.length === 0) {
    throw new ContractError('readRunDirClaims requires a run-dir path', 'readRunDirClaims');
  }

  const survivorsPath = path.join(runDir, 'survivors.json');

  if (!fs.existsSync(survivorsPath)) {
    throw new ContractError('readRunDirClaims: no survivors.json in run dir (not a usable harvest source): ' + runDir, survivorsPath);
  }

  const survivors = readJson(survivorsPath);

  if (!Array.isArray(survivors)) {
    throw new ContractError('readRunDirClaims: survivors.json must be an array', survivorsPath);
  }

  const records = [];

  for (const rec of survivors) {
    if (rec == null || typeof rec !== 'object') {
      throw new ContractError('readRunDirClaims: malformed survivor record (expected object): ' + JSON.stringify(rec), survivorsPath);
    }

    if (typeof rec.id !== 'string' || rec.id.length === 0) {
      throw new ContractError('readRunDirClaims: survivor record missing a non-empty string id: ' + JSON.stringify(rec), survivorsPath);
    }

    if (typeof rec.confidence !== 'string' || rec.confidence.length === 0) {
      throw new ContractError('readRunDirClaims: survivor record missing a non-empty string confidence: ' + JSON.stringify(rec), survivorsPath);
    }

    // Route the content-derived cluster id through safeId before it is used as a map key / surfaced
    // (T-19-TRAVERSE). The run-dir-qualified uid (below) is the stable key across multiple run dirs.
    safeId(rec.id, survivorsPath);

    records.push(rec);
  }

  return records;
}

// ---------------------------------------------------------------------------
// listRunDirs(corpusDir): the curated corpus of real run dirs is a parent directory whose immediate
// children are run dirs (each carrying a survivors.json). Returns the sorted list of child run-dir
// ABSOLUTE paths that contain a survivors.json (a child without one is not a harvest source -- skipped,
// not an error: the corpus may carry scratch dirs). Fail-closed on a missing corpus dir.
// ---------------------------------------------------------------------------
export function listRunDirs(corpusDir) {
  if (typeof corpusDir !== 'string' || corpusDir.length === 0) {
    throw new ContractError('listRunDirs requires a corpus directory', 'listRunDirs');
  }

  if (!fs.existsSync(corpusDir)) {
    throw new ContractError('listRunDirs: corpus directory does not exist: ' + corpusDir, corpusDir);
  }

  let entries;

  try {
    entries = fs.readdirSync(corpusDir);
  } catch (err) {
    throw new ContractError('listRunDirs: cannot read corpus dir: ' + err.message, corpusDir);
  }

  const runDirs = [];

  for (const name of entries.sort()) {
    const full = path.join(corpusDir, name);

    if (!fs.statSync(full).isDirectory()) {
      continue;
    }

    if (fs.existsSync(path.join(full, 'survivors.json'))) {
      runDirs.push(full);
    }
  }

  return runDirs;
}

// ---------------------------------------------------------------------------
// stratifyOversampleDense(records, { sourceFloor }): difficulty-STRATIFY the SUPPORTED claims so the
// DENSE / contested-evidence band is OVER-represented relative to a flat sample. The dense band is sorted
// FIRST (descending by corroboration_lower_bound), then the sparse band -- so a fixed-size draw from the
// front oversamples dense claims. This is a PURE, deterministic ordering (no PRNG): two calls over the
// same records return byte-identical order, so the harvest is reproducible from the corpus.
//
// Returns { dense: [...], sparse: [...], ordered: [...] } where ordered = dense (desc by corroboration)
// THEN sparse. The control / trap arms draw from `ordered` (front-weighted to the dense band).
// ---------------------------------------------------------------------------
export function stratifyOversampleDense(records, { sourceFloor = HARVEST_TARGETS.DENSE_SOURCE_FLOOR } = {}) {
  if (!Array.isArray(records)) {
    throw new ContractError('stratifyOversampleDense requires an array of records', 'stratifyOversampleDense');
  }

  const dense = [];
  const sparse = [];

  for (const rec of records) {
    if (isDenseClaim(rec, { sourceFloor })) {
      dense.push(rec);
    } else {
      sparse.push(rec);
    }
  }

  // Deterministic ordering: dense band descending by corroboration (densest first), tie-broken by uid;
  // then the sparse band by uid. No PRNG -- reproducible from the corpus.
  const byCorroborationThenUid = (a, b) => {
    const ca = Number.isInteger(a.corroboration_lower_bound) ? a.corroboration_lower_bound : 0;
    const cb = Number.isInteger(b.corroboration_lower_bound) ? b.corroboration_lower_bound : 0;

    if (cb !== ca) {
      return cb - ca;
    }

    return String(a.__uid).localeCompare(String(b.__uid));
  };

  const byUid = (a, b) => String(a.__uid).localeCompare(String(b.__uid));

  dense.sort(byCorroborationThenUid);
  sparse.sort(byUid);

  return Object.freeze({ dense, sparse, ordered: [...dense, ...sparse] });
}

// ---------------------------------------------------------------------------
// harvest({ corpusDir, runDirs, nCtrlTarget, nTrapTarget, denseSourceFloor }): the top-level live-arm
// control-set loader. It reads the curated corpus of real run dirs, selects the SUPPORTED claims, and
// returns TWO SEPARATE ARMS that are NEVER pooled (D-03):
//   - overRefusalControls -- the over-refusal control arm (SUPPORTED positives the voter SHOULD uphold),
//     drawn front-weighted from the dense-oversampled order, up to nCtrlTarget;
//   - denseTrapMonitor    -- the dense-trap false-uphold monitor arm (dense / contested SUPPORTED claims),
//     drawn from the dense band only, up to nTrapTarget.
//
// The arms are built from DISJOINT draws over the dense-oversampled order so one claim is never counted in
// both arms (no double-count, no pooling). Each returned member carries a run-dir-qualified `uid`
// (`<run-basename>::<clusterId>`) so a cluster id repeated across run dirs is distinct. The two arms are
// SEPARATE arrays on the result; there is NO combined-N field (pooling them is the defect this guards).
//
// PURE function of the on-disk corpus: no network, no spend. A floor-shortfall is REPORTED on the result
// (belowCtrlFloor / belowTrapFloor) -- the harvester does NOT throw on a short corpus (Stage 0 / D-19 is
// the feasibility decision in lz-eval-live-cert.mjs); a malformed run dir DOES fail closed (readRunDirClaims).
// ---------------------------------------------------------------------------
export function harvest({
  corpusDir,
  runDirs,
  nCtrlTarget = HARVEST_TARGETS.N_CTRL_TARGET,
  nTrapTarget = HARVEST_TARGETS.N_TRAP_TARGET,
  denseSourceFloor = HARVEST_TARGETS.DENSE_SOURCE_FLOOR,
} = {}) {
  // Resolve the run-dir list: either an explicit list (the test path) or a curated corpus dir.
  let dirs;

  if (Array.isArray(runDirs)) {
    dirs = runDirs;
  } else if (typeof corpusDir === 'string' && corpusDir.length > 0) {
    dirs = listRunDirs(corpusDir);
  } else {
    throw new ContractError('harvest requires either a corpusDir or an explicit runDirs array', 'harvest');
  }

  if (!Number.isInteger(nCtrlTarget) || nCtrlTarget <= 0 || !Number.isInteger(nTrapTarget) || nTrapTarget <= 0) {
    throw new ContractError('harvest requires positive integer nCtrlTarget + nTrapTarget', 'harvest');
  }

  // (1) Read every run dir + select the SUPPORTED claims, tagging each with a run-dir-qualified uid.
  const supported = [];

  for (const dir of dirs) {
    const basename = path.basename(dir);
    const records = readRunDirClaims(dir);

    for (const rec of records) {
      if (!isSupportedClaim(rec)) {
        continue;
      }

      // Run-dir-qualified uid so a cluster id repeated across run dirs is distinct (safeId already
      // validated rec.id in readRunDirClaims). The uid is non-enumerable-by-convention internal state
      // (prefixed __) so it never collides with a frozen survivor field.
      supported.push(Object.assign({}, rec, { __uid: basename + '::' + rec.id, source_run_dir: basename }));
    }
  }

  // (2) Difficulty-stratify so the dense band is over-represented.
  const strata = stratifyOversampleDense(supported, { sourceFloor: denseSourceFloor });

  // (3) Build the two DISJOINT arms over the dense-oversampled order. The dense-trap MONITOR arm draws
  // from the dense band FIRST (the correlated-cheap-error band); the over-refusal CONTROL arm draws the
  // remaining dense-oversampled order (still front-weighted to the dense band relative to a flat sample).
  // DISJOINT: a claim assigned to the trap arm is removed from the control-arm pool -- the two arms are
  // NEVER the same member and are NEVER pooled into one N.
  const denseTrapMonitor = strata.dense.slice(0, nTrapTarget);
  const trapUids = new Set(denseTrapMonitor.map((r) => r.__uid));
  const controlPool = strata.ordered.filter((r) => !trapUids.has(r.__uid));
  const overRefusalControls = controlPool.slice(0, nCtrlTarget);

  // Strip the internal __uid into a stable `uid` field on the surfaced members (drop other internal state).
  const surface = (members) =>
    members.map((r) => {
      const out = Object.assign({}, r);
      out.uid = r.__uid;
      delete out.__uid;

      return Object.freeze(out);
    });

  const overRefusalArm = surface(overRefusalControls);
  const denseTrapArm = surface(denseTrapMonitor);

  return Object.freeze({
    // The TWO SEPARATE ARMS (D-03) -- distinct arrays, NEVER pooled into one N.
    overRefusalControls: Object.freeze(overRefusalArm),
    denseTrapMonitor: Object.freeze(denseTrapArm),
    // Counts are reported PER ARM (never summed into one N -- there is intentionally no combined field).
    nCtrl: overRefusalArm.length,
    nTrap: denseTrapArm.length,
    nCtrlTarget,
    nTrapTarget,
    // Floor-shortfall flags (the Stage-0 / D-19 feasibility decision reads these; the loader never throws
    // on a short corpus). The floors are the frozen-floor headroom values (D-03), not EVAL_THRESHOLDS.
    belowCtrlFloor: overRefusalArm.length < HARVEST_TARGETS.N_CTRL_FLOOR,
    belowTrapFloor: denseTrapArm.length < HARVEST_TARGETS.N_TRAP_FLOOR,
    nRunDirs: dirs.length,
    nSupported: supported.length,
    nDense: strata.dense.length,
  });
}

// ---------------------------------------------------------------------------
// Thin CLI (guarded so importing the module does NOT run it). With `--harvest <corpus-dir>` it reads the
// curated corpus and prints a counts-only receipt (the two arms' N + the floor flags) -- NO model spend,
// NO network (the harvester is on-disk loading only). The real live-cert run (Plan 20-05, human-gated)
// drives harvest() from lz-eval-live-cert.mjs Stage 0/1; this CLI is a convenience over a corpus on disk.
// ---------------------------------------------------------------------------
/* node:coverage disable */
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    const mode = process.argv[2];

    if (mode === '--harvest') {
      const corpusDir = process.argv[3];

      if (!corpusDir || !fs.existsSync(corpusDir) || !fs.statSync(corpusDir).isDirectory()) {
        console.error('lz-eval-harvest: missing or invalid <corpus-dir>');
        process.exit(2);
      }

      const res = harvest({ corpusDir });
      console.log(
        'harvest: nCtrl=' + res.nCtrl + ' (target ' + res.nCtrlTarget + ', floor ' + HARVEST_TARGETS.N_CTRL_FLOOR +
          (res.belowCtrlFloor ? ', BELOW-FLOOR' : '') + ') nTrap=' + res.nTrap + ' (target ' + res.nTrapTarget +
          ', floor ' + HARVEST_TARGETS.N_TRAP_FLOOR + (res.belowTrapFloor ? ', BELOW-FLOOR' : '') + ') over ' +
          res.nRunDirs + ' run dirs (' + res.nSupported + ' supported, ' + res.nDense + ' dense) -- two arms, never pooled',
      );
      process.exit(0);
    }

    console.error('lz-eval-harvest: usage: node lz-eval-harvest.mjs --harvest <corpus-dir>');
    process.exit(2);
  } catch (err) {
    const where = err && err.file ? ' (' + err.file + ')' : '';
    console.error('lz-eval-harvest: ' + (err && err.message ? err.message : String(err)) + where);
    process.exit(2);
  }
}
/* node:coverage enable */
