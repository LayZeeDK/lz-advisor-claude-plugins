// lz-eval-prescale-probe.mjs
//
// NET-NEW (Plan 20-06, Task 3; D-21 / CERTIFY-WORKS-BOARD-DECISION.md section 4, NO-SPEND build /
// STUB-exercised): the 10-PAIR PRE-SCALE PROBE driver. THE AUTHORITY is CERTIFY-WORKS-BOARD-DECISION.md
// section 4 (the pre-scale probe before spending the full N).
//
// THE PROBE (board section 4): before scaling arm A to the full N (>= 30), run a 10-pair probe and gate on
// (both must pass):
//   (1) the OUT-OF-FAMILY all-agree gold panel unanimously admits >= PROBE_UNANIMITY_FLOOR (9) of the 10
//       pairs (a pair is ADMITTED iff BOTH its SUPPORTED and REFUTED members are retained by the strict
//       all-agree gold-blind consensus -- the gold panel agrees on the correct entailment direction);
//   (2) the lexical-overlap AUC over the 10 pairs is <= LEXICAL_AUC_CEILING (gate (a), reused from
//       eval/lz-eval-baseline-guard.mjs).
// Pass BOTH -> 'scale' (proceed to the full N). Any fail -> 'reconstruct' (re-author + re-probe; do NOT
// scale).
//
// THE SCORED VOTER: RUN-but-DO-NOT-GATE (board section 4). The probe RUNS the scored voter over the 10
// pairs (callVoter -- the CHEAP/STRONG tier, persisted via persistDualRunVote for pipeline/telemetry
// validation) and emits a PRE-REGISTERED VOLUNTARY early-stop SIGNAL (>= 1 scored false-uphold on the
// probe jeopardizes clearing TAU_FU at N=30 -> the operator INVESTIGATES the pipeline / re-pre-registers,
// NEVER edits items until the probe is clean). The scored voter is EXCLUDED from decidePrescale (a scored
// pass on 10 pairs has negligible power vs TAU_FU 0.10; gating on it would tune the corpus against the
// certified system). The early-stop signal is ADVISORY telemetry, NEVER the cert gate.
//
// THE LZ_SPEND HARD-GUARD (D-07 / T-20-27): runPrescaleProbe calls requireSpend('callOof') FIRST before
// any real OOF dispatch (stub: true bypasses for the no-spend seam exercise). The scored voter (callVoter)
// is the SESSION-pool Agent transport (D-20) -- not node-wireable; the test injects a deterministic STUB.
// NO model spend in this build.
//
// Frozen primitives consumed BYTE-IDENTICAL (REUSE; never re-authored): makeBatchedOofProbe +
// runProbeConsensus + the FROZEN_OOF_PAIR gold identity, requireSpend + persistDualRunVote (from
// eval/lz-eval-live-cert.mjs), lexicalOverlapAuc + LEXICAL_AUC_CEILING (from eval/lz-eval-baseline-guard
// .mjs), adjudicateContrastivePairs (from eval/lz-eval-contrastive-authoring.mjs). Mirrors
// runSurvivalProbe's prepare-then-screen loop + decideControlArm's fixed-conjunction rule +
// stage0FeasibilityProbe's Object.freeze receipt.
//
// Tree / dependency boundary (D-10/D-11): this script lives in the repo-level eval/ dev tree, NEVER in the
// distributed plugin tree. It imports the SHIPPED runtime aggregator's ContractError ACROSS trees by
// relative path -- ONE-DIRECTIONAL (eval -> runtime, NEVER runtime -> eval). Zero npm deps.
//
// This source contains no literal byte-order mark and is strictly ASCII (per CLAUDE.md).
//
// Pure functions are exported for the validation fixture; the thin CLI is guarded so that `import`-ing this
// module does NOT run the CLI.

import path from 'node:path';
import { fileURLToPath } from 'node:url';

// (1) The FROZEN OOF all-agree gold-blind seams (CONSUMED byte-identical).
import { makeBatchedOofProbe } from './lz-eval-oof-batch.mjs';
import { runProbeConsensus } from './lz-eval-trap-assembler.mjs';

// (2) The FROZEN OOF gold-decider identity + the LZ_SPEND hard-guard + the resumable vote store.
import { FROZEN_OOF_PAIR, requireSpend, persistDualRunVote } from './lz-eval-live-cert.mjs';

// (3) The lexical-overlap AUC gate (a) + the pre-registered ceiling (CONSUMED byte-identical, Task 2).
import { lexicalOverlapAuc, LEXICAL_AUC_CEILING } from './lz-eval-baseline-guard.mjs';

// (4) Cross-tree reuse of the SHIPPED runtime aggregator's ContractError (D-10; eval -> runtime,
//     one-directional, never the reverse).
import {
  ContractError,
} from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

// ---------------------------------------------------------------------------
// THE FROZEN PROBE CONSTANTS (module-level literals; pre-registered, recorded in the re-authored
// eval/lz-eval-live-lock-rule.md WITH A TIMESTAMP before any pair is scored, Task 3). NOT computed from
// the corpus.
//   PROBE_PAIR_COUNT     = 10: the probe runs over the FIRST 10 arm-A pairs (board section 4).
//   PROBE_UNANIMITY_FLOOR = 9: the OOF all-agree gold panel must unanimously admit >= 9 of the 10 pairs.
// ---------------------------------------------------------------------------
export const PROBE_PAIR_COUNT = 10;
export const PROBE_UNANIMITY_FLOOR = 9;

// The FROZEN OOF gold-decider pair (re-exported byte-identical -- never a new identity).
export const FROZEN_PAIR = FROZEN_OOF_PAIR;

// ---------------------------------------------------------------------------
// The per-item packet shape (COPIED byte-faithful from eval/lz-eval-contrastive-screen.mjs / the arm-A
// authoring harness). The gold direction (expectedEntailment) is NEVER rendered into the prompt.
// ---------------------------------------------------------------------------
function asSurvivors(evidence) {
  if (Array.isArray(evidence)) {
    return evidence.map((e) => (typeof e === 'string' ? { sentence: e } : e));
  }

  if (typeof evidence === 'string') {
    return [{ sentence: evidence }];
  }

  return [];
}

function itemPacket(item, i) {
  const id = item && item.id !== undefined ? String(item.id) : 'ci-' + i;
  const claim = item && typeof item.claim === 'string' ? item.claim : '';
  const survivors = asSurvivors(item ? item.evidence : undefined);
  const expectedEntailment = item && item.gold === 'unrefuted' ? 'true' : 'false';

  return {
    trap: { uid: id, claim, enrichedKs: survivors },
    enrichedKs: survivors,
    stratum: 'contrastive',
    decisiveRank: -1,
    expectedEntailment,
  };
}

// ---------------------------------------------------------------------------
// decidePrescale({ unanimityCount, lexicalAuc }) -> 'scale' | 'reconstruct'. The PRE-REGISTERED
// fixed-conjunction rule (mirrors decideControlArm): 'scale' iff
//   unanimityCount >= PROBE_UNANIMITY_FLOOR (9, of 10) AND lexicalAuc <= LEXICAL_AUC_CEILING (0.65);
// else 'reconstruct'. The scored voter is EXCLUDED from this decision (run-but-NOT-gate). NO auto-lock;
// this is the recommendation (the operator confirms scale-vs-reconstruct).
// ---------------------------------------------------------------------------
export function decidePrescale({ unanimityCount, lexicalAuc } = {}) {
  if (!Number.isFinite(unanimityCount)) {
    throw new ContractError('decidePrescale requires a finite unanimityCount: ' + JSON.stringify(unanimityCount), 'decidePrescale');
  }

  if (typeof lexicalAuc !== 'number' || Number.isNaN(lexicalAuc)) {
    throw new ContractError('decidePrescale requires a finite lexicalAuc: ' + JSON.stringify(lexicalAuc), 'decidePrescale');
  }

  const scale = unanimityCount >= PROBE_UNANIMITY_FLOOR && lexicalAuc <= LEXICAL_AUC_CEILING;

  return scale ? 'scale' : 'reconstruct';
}

// ---------------------------------------------------------------------------
// runPrescaleProbe({ pairs, callModel, callVoter, frozenPair = FROZEN_PAIR, score, voteDir, stub = false }):
//   (1) take the FIRST PROBE_PAIR_COUNT (10) arm-A pairs;
//   (2) build ONE makeBatchedOofProbe per frozenPair model, prepare(packets) FIRST, screen each item via
//       runProbeConsensus -- a pair is ADMITTED iff BOTH its SUPPORTED + REFUTED members are retained by
//       the all-agree gold-blind consensus; unanimityCount = the admitted-pair count;
//   (3) compute the lexical AUC over the 10 pairs (lexicalOverlapAuc);
//   (4) RUN the scored voter over the 10 pairs (callVoter -- telemetry only, persisted via
//       persistDualRunVote); count scoredFalseUpholds (a REFUTED-gold member the scored voter UPHELD);
//   (5) decision = decidePrescale({ unanimityCount, lexicalAuc }) -- the scored voter is EXCLUDED;
//   (6) earlyStopSignal = scoredFalseUpholds >= 1 (a pre-registered VOLUNTARY early-stop -- advisory only).
//
// Returns Object.freeze({ unanimityCount, lexicalAuc, lexicalAucPass, scoredFalseUpholds, decision,
//   earlyStopSignal, probePairCount }). requireSpend-gated for any real OOF dispatch (stub: true bypasses).
// ---------------------------------------------------------------------------
export async function runPrescaleProbe({
  pairs,
  callModel,
  callVoter,
  frozenPair = FROZEN_PAIR,
  score,
  voteDir,
  stub = false,
} = {}) {
  if (!Array.isArray(pairs) || pairs.length < PROBE_PAIR_COUNT) {
    throw new ContractError('runPrescaleProbe requires at least PROBE_PAIR_COUNT (' + PROBE_PAIR_COUNT + ') pairs', 'runPrescaleProbe');
  }

  if (typeof callModel !== 'function') {
    throw new ContractError('runPrescaleProbe requires a callModel function (the OOF gold transport)', 'runPrescaleProbe');
  }

  // The LZ_SPEND hard-guard: any REAL OOF dispatch (stub !== true) THROWS unless LZ_SPEND=1. The stub seam
  // test bypasses it (zero spend). requireSpend('callOof') FIRST -- before building or preparing probes.
  if (stub !== true) {
    requireSpend('callOof');
  }

  // (1) The first PROBE_PAIR_COUNT pairs.
  const probePairs = pairs.slice(0, PROBE_PAIR_COUNT);

  // The flattened items (SUPPORTED + REFUTED per pair), tagged with their pair index for the admit count.
  const items = [];

  for (let p = 0; p < probePairs.length; p += 1) {
    const pair = probePairs[p];

    if (!pair || typeof pair !== 'object' || !pair.supported || !pair.refuted) {
      throw new ContractError('runPrescaleProbe pair ' + p + ' must carry { supported, refuted }', 'runPrescaleProbe');
    }

    items.push({ ...pair.supported, gold: 'unrefuted', pairIndex: p, id: pair.supported.id !== undefined ? pair.supported.id : 'pair-' + p + '-sup' });
    items.push({ ...pair.refuted, gold: 'refuted', pairIndex: p, id: pair.refuted.id !== undefined ? pair.refuted.id : 'pair-' + p + '-ref' });
  }

  const packets = items.map((it, i) => itemPacket(it, i));

  // (2) One batched OOF probe per frozen-pair model; PREPARE each before the consensus loop.
  const probes = frozenPair.map((model) => makeBatchedOofProbe({ callModel: (prompt) => callModel(model, prompt), model, score }));

  for (const probe of probes) {
    // eslint-disable-next-line no-await-in-loop
    await probe.prepare(packets);
  }

  // Screen each item: a pair is ADMITTED iff BOTH its members are retained by the all-agree consensus.
  const memberRetained = new Map(); // pairIndex -> { sup: bool, ref: bool }

  for (let i = 0; i < packets.length; i += 1) {
    const item = items[i];
    // eslint-disable-next-line no-await-in-loop
    const consensus = await runProbeConsensus(probes, packets[i]);
    const entry = memberRetained.get(item.pairIndex) || { sup: false, ref: false };

    if (item.gold === 'unrefuted') {
      entry.sup = consensus.retained === true;
    } else {
      entry.ref = consensus.retained === true;
    }

    memberRetained.set(item.pairIndex, entry);
  }

  let unanimityCount = 0;

  for (const entry of memberRetained.values()) {
    if (entry.sup && entry.ref) {
      unanimityCount += 1;
    }
  }

  // (3) The lexical AUC over the 10 pairs (gate (a)).
  const auc = lexicalOverlapAuc({ pairs: probePairs });

  // (4) RUN the scored voter (telemetry only -- run-but-NOT-gate). callVoter is INJECTED (the SESSION-pool
  // Agent transport, D-20; the test injects a STUB). It votes per item; a REFUTED-gold member the voter
  // UPHOLDS ('unrefuted') is a scored false-uphold. Persist via persistDualRunVote (resumable) when a
  // voteDir is supplied (telemetry artifact; skip-already-done).
  let scoredFalseUpholds = 0;

  if (typeof callVoter === 'function') {
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      // eslint-disable-next-line no-await-in-loop
      const vote = await callVoter({ id: item.id, claim: item.claim, evidence: item.evidence, gold: item.gold });
      const verdict = vote && typeof vote === 'object' ? vote.verdict : vote;

      if (item.gold === 'refuted' && verdict === 'unrefuted') {
        scoredFalseUpholds += 1;
      }

      // Persist the scored vote for telemetry (resumable; skip-already-done). Only when a voteDir + a
      // valid trace are present (persistDualRunVote validates verdict + trace; the stub supplies both).
      // The vote id MUST be ':'-free (the Windows vote-store filename constraint): the run-dir-qualified
      // member id uses the '::' separator, which carries single colons illegal in a Windows filename. Map
      // '::' -> '--' for the vote-store key (a ':'-free, collision-stable rewrite -- the qualifier is the
      // only place a colon appears, so the rewrite is reversible by convention).
      if (typeof voteDir === 'string' && voteDir.length > 0 && vote && typeof vote === 'object' && vote.trace) {
        const voteId = String(item.id).split('::').join('--');
        persistDualRunVote(voteDir, { id: voteId, verdict, trace: vote.trace });
      }
    }
  }

  // (5) The PRE-REGISTERED decision (the scored voter is EXCLUDED -- run-but-NOT-gate).
  const decision = decidePrescale({ unanimityCount, lexicalAuc: auc.auc });

  // (6) The VOLUNTARY early-stop signal (advisory telemetry, NEVER the cert gate).
  const earlyStopSignal = scoredFalseUpholds >= 1;

  return Object.freeze({
    unanimityCount,
    lexicalAuc: auc.auc,
    lexicalAucPass: auc.pass,
    scoredFalseUpholds,
    decision,
    earlyStopSignal,
    probePairCount: PROBE_PAIR_COUNT,
  });
}

// ---------------------------------------------------------------------------
// Thin CLI (guarded so importing the module does NOT run it). With `--constants` it prints the
// pre-registered probe constants (recorded in the re-authored lock rule WITH A TIMESTAMP, Task 3).
// ---------------------------------------------------------------------------
/* node:coverage disable */
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const mode = process.argv[2];

  if (mode === '--constants') {
    console.log('PROBE_PAIR_COUNT=' + PROBE_PAIR_COUNT);
    console.log('PROBE_UNANIMITY_FLOOR=' + PROBE_UNANIMITY_FLOOR);
    console.log('LEXICAL_AUC_CEILING=' + LEXICAL_AUC_CEILING);
    process.exit(0);
  }

  console.error('lz-eval-prescale-probe: usage: node lz-eval-prescale-probe.mjs --constants');
  process.exit(2);
}
/* node:coverage enable */
