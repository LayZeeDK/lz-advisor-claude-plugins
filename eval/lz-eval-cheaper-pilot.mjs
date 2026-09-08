// lz-eval-cheaper-pilot.mjs
//
// NET-NEW (RE-PLAN-8, NO-SPEND): the NON-GATING cheaper-model PILOT runner (DP7-DP9) + the DP10
// k=1-stability-certificate. The authority is 19-04-REPLAN-DECISION-8.md (a 4-round cross-family
// advisor board, UNANIMOUS on DP1-DP10) + the 3 operator decisions (2026-06-19): run the pilot as
// part of T-spend-1, adopt the DP10 k=1 lever, include gpt-5.4-mini in the pilot.
//
// THE PILOT IS NON-GATING BY CONSTRUCTION. runCheaperPilot returns NO retain/membership signal and
// CANNOT enter the assembler retain AND. Making a cheaper model the DECIDER stays AMENDMENT-ONLY and
// is NOT adopted (DP6) -- classifyCheaperRole's 'decider' role is amendment-only.
//
// NO FROZEN PRIMITIVE CHANGE: this module CONSUMES clopperPearsonUpperOneSided + EVAL_THRESHOLDS.
// TAU_FU/TAU_OR from the frozen engine (eval/lz-eval-aggregate.mjs) and edits NOTHING in it. The
// per-arm Clopper-Pearson is computed on the PACKET counts (false-accepts/nTrap; false-vetoes/nCtrl),
// NEVER pooled over n*k (DP8/Pitfall 3 -- the k votes share one packet, positively correlated, so
// pooling would be anti-conservative).
//
// Tree / dependency boundary (D-10/D-11): repo-level eval/ dev tree ONLY; never shipped.
//
// Strictly ASCII, no BOM (per CLAUDE.md).

import { clopperPearsonUpperOneSided, EVAL_THRESHOLDS } from './lz-eval-aggregate.mjs';

// ---------------------------------------------------------------------------
// DP9 PRE-REGISTERED PROMOTION THRESHOLDS (cheap model -> role), FIXED HERE before the pilot runs.
// Recorded against the verified CP anchors (eval/.cache/bulk-design-consult/cp-anchors.mjs):
//   CP1s(0,36) = 0.0798  <= TAU_FU 0.10  -> the 0-miss trap arm clears the decider trap bar.
//   CP1s(1,36) = 0.1251  >  TAU_FU 0.10  -> one false-accept FAILS the decider (would need N>=46).
//   CP1s(1,30) = 0.1486  <= TAU_OR 0.15  -> 30 controls tolerate ONE over-refusal.
//   CP1s(1,24) = 0.1829  >  TAU_OR 0.15  -> 24 controls would NOT (the basis for nCtrl=30).
//
// Roles (pre-registered, DP9):
//   decider (AMENDMENT-ONLY, NOT adopted) = falseAccepts === 0
//       AND CP1s(falseVetoes, nCtrl) <= TAU_OR
//       AND selfSplits <= 1
//       AND frozenPairAgreement >= DECIDER_AGREEMENT (62 of 66).
//   pre-filter (only if ever membership-neutral, per DP5) = frozenPairAgreement >= PREFILTER_AGREEMENT (62)
//       AND falseAccepts === 0  (but NOT all decider sub-bars met).
//   diagnostic-annotator (always allowed, no gold impact) = selfConsistency >= ANNOTATOR_SELF_CONSISTENCY (0.95)
//       AND frozenPairAgreement >= ANNOTATOR_AGREEMENT (60 of 66 ~= 90%).
//   none = below all of the above.
// ---------------------------------------------------------------------------
export const PILOT_THRESHOLDS = Object.freeze({
  N_TRAP: 36,
  N_CTRL: 30,
  K: 5,
  ANNOTATOR_SELF_CONSISTENCY: 0.95,
  ANNOTATOR_AGREEMENT: 60, // of 66
  PREFILTER_AGREEMENT: 62, // of 66
  DECIDER_AGREEMENT: 62, // of 66
  DECIDER_MAX_SELF_SPLITS: 1,
  AGREEMENT_DENOMINATOR: 66, // n = 36 traps + 30 controls
});

// ---------------------------------------------------------------------------
// classifyCheaperRole({ falseAccepts, nTrap, falseVetoes, nCtrl, selfConsistency, frozenPairAgreement,
//   selfSplits }) -> 'decider' | 'pre-filter' | 'diagnostic-annotator' | 'none'.
//
// Uses clopperPearsonUpperOneSided + EVAL_THRESHOLDS.TAU_FU/TAU_OR on the PER-ARM PACKET counts (DP8 --
// NEVER pooled over n*k). The decider sub-bars use the trap-arm CP (CP1s(falseAccepts, nTrap) <= TAU_FU)
// AND the control-arm CP (CP1s(falseVetoes, nCtrl) <= TAU_OR). Because CP1s(1,36)=0.1251 > 0.10, a
// single false-accept can never clear the decider trap bar -- the decider trap arm is 0-miss-only.
// ---------------------------------------------------------------------------
export function classifyCheaperRole({
  falseAccepts,
  nTrap,
  falseVetoes,
  nCtrl,
  selfConsistency,
  frozenPairAgreement,
  selfSplits = 0,
} = {}) {
  const trapCp = clopperPearsonUpperOneSided(falseAccepts, nTrap, EVAL_THRESHOLDS.ALPHA);
  const ctrlCp = clopperPearsonUpperOneSided(falseVetoes, nCtrl, EVAL_THRESHOLDS.ALPHA);

  const trapBarClears = falseAccepts === 0 && trapCp <= EVAL_THRESHOLDS.TAU_FU; // CP1s(0,36)=0.0798<=0.10
  const ctrlBarClears = ctrlCp <= EVAL_THRESHOLDS.TAU_OR; // CP1s(<=1,30)<=0.15
  const agreementForDecider = frozenPairAgreement >= PILOT_THRESHOLDS.DECIDER_AGREEMENT;
  const splitsOk = selfSplits <= PILOT_THRESHOLDS.DECIDER_MAX_SELF_SPLITS;

  // decider (AMENDMENT-ONLY) -- all sub-bars.
  if (trapBarClears && ctrlBarClears && splitsOk && agreementForDecider) {
    return 'decider';
  }

  // pre-filter -- agreement >= 62/66 AND zero false-accepts (but NOT all decider sub-bars met).
  if (frozenPairAgreement >= PILOT_THRESHOLDS.PREFILTER_AGREEMENT && falseAccepts === 0) {
    return 'pre-filter';
  }

  // diagnostic-annotator -- self-consistency >= 0.95 AND agreement >= 60/66.
  if (
    typeof selfConsistency === 'number' &&
    selfConsistency >= PILOT_THRESHOLDS.ANNOTATOR_SELF_CONSISTENCY &&
    frozenPairAgreement >= PILOT_THRESHOLDS.ANNOTATOR_AGREEMENT
  ) {
    return 'diagnostic-annotator';
  }

  return 'none';
}

// ---------------------------------------------------------------------------
// Deterministic PRNG keyed by seed + a reshuffle index (k=5 order reshuffle, recorded seed). Reuses
// the same mulberry32 + hash32 shape as the batched adapter (kept local to avoid a cross-module dep;
// the two are independent runners).
// ---------------------------------------------------------------------------
function hash32(str) {
  let h = 2166136261 >>> 0;

  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }

  return h >>> 0;
}

function mulberry32(a) {
  let t = a >>> 0;

  return function next() {
    t = (t + 0x6d2b79f5) >>> 0;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);

    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function permute(arr, seed, tag) {
  const idx = arr.map((_, i) => i);
  const rand = mulberry32(hash32(String(seed) + '|' + String(tag)));

  for (let i = idx.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = idx[i];
    idx[i] = idx[j];
    idx[j] = tmp;
  }

  return idx.map((i) => arr[i]);
}

// ---------------------------------------------------------------------------
// Sample n=66 = nTrap traps + nCtrl controls FROM the gold candidates, weighted to hard near-boundary
// (>=18 of the nTrap traps are hard near-boundary incl. the "more than doubled" divergence item). The
// candidates carry { uid, expectedEntailment ('false'=trap / 'true'=control), hard:boolean, ... }. The
// sampling is DETERMINISTIC (recorded seed); it consumes `candidates` READ-ONLY and returns no freeze.
// ---------------------------------------------------------------------------
function sampleArms(candidates, { nTrap, nCtrl, seed }) {
  const traps = candidates.filter((c) => String(c.expectedEntailment) === 'false');
  const controls = candidates.filter((c) => String(c.expectedEntailment) === 'true');

  // Weight traps to hard near-boundary: put hard traps first (deterministic stable order by uid),
  // then non-hard, and take the first nTrap. This guarantees >=18 hard when >=18 hard exist.
  const sortByHardThenUid = (a, b) => {
    const ah = a.hard ? 0 : 1;
    const bh = b.hard ? 0 : 1;

    if (ah !== bh) {
      return ah - bh;
    }

    return String(a.uid) < String(b.uid) ? -1 : 1;
  };

  const trapSample = traps.slice().sort(sortByHardThenUid).slice(0, nTrap);
  const ctrlSample = controls.slice().sort((a, b) => (String(a.uid) < String(b.uid) ? -1 : 1)).slice(0, nCtrl);

  void seed; // sampling is order-deterministic; the seed drives the k=5 reshuffles below.

  return { trapSample, ctrlSample };
}

// ---------------------------------------------------------------------------
// runCheaperPilot({ candidates, callModel, models, frozenPair, k, seed, score, nTrap, nCtrl }) ->
//   { perModel, frozenPairSelfConsistency, stabilityCertificate }. NON-GATING.
//
// callModel(model, packet, reshuffleIndex) -> Promise<boolean entails> is the INJECTED transport (the
// same copilot transport at T-spend-1; deterministic stubs in the tests). The reference label is the
// FROZEN-PAIR all-agree consensus on the sampled packets (both frozenPair members must agree entails
// for the label to be defined; a split packet is excluded from agreement counting). k=5 by order
// reshuffle (the recorded seed). Per measured model:
//   falseAccepts = # traps the model called entails=true (a false-accept -- the catastrophic direction)
//   falseVetoes  = # controls the model called entails=false (an over-refusal)
//   selfConsistency = fraction of packets whose k votes all agree
//   selfSplits   = # packets whose k votes disagree
//   frozenPairAgreement = # packets where the model's (majority/first) vote matches the frozen-pair label
//   estimandA/B  = the per-arm one-sided CP on the PACKET counts (NOT n*k)
//   role         = classifyCheaperRole(...)
//
// frozenPairSelfConsistency = the frozen pair's own k=5 self-consistency (1.0 == 100%); the DP10
// stabilityCertificate = { k1: frozenPairSelfConsistency === 1.0, frozenPairSelfConsistency }.
// ---------------------------------------------------------------------------
export async function runCheaperPilot({
  candidates,
  callModel,
  models = ['gpt-5-mini', 'gemini-3.5-flash', 'gpt-5.4-mini'],
  frozenPair = ['gpt-5.5', 'gemini-3.1-pro-preview'],
  k = PILOT_THRESHOLDS.K,
  seed,
  score,
  nTrap = PILOT_THRESHOLDS.N_TRAP,
  nCtrl = PILOT_THRESHOLDS.N_CTRL,
} = {}) {
  void score; // parity with the interface; the pilot does not parse (callModel returns a boolean entails)

  const { trapSample, ctrlSample } = sampleArms(candidates, { nTrap, nCtrl, seed });
  const allPackets = [...trapSample, ...ctrlSample];

  // Cast k votes for a model over a packet by reshuffling the FULL packet order per reshuffle index
  // (k=5 by order reshuffle -- NOT identical re-draws). Returns the k boolean votes for this packet.
  async function votesFor(model, packet) {
    const votes = [];

    for (let r = 0; r < k; r += 1) {
      // The reshuffle of the order is the variation across the k passes (recorded seed); the per-packet
      // vote is callModel(model, packet, reshuffleIndex).
      const entails = await callModel(model, packet, r);
      votes.push(entails === true);
    }

    return votes;
  }

  // The frozen-pair all-agree REFERENCE label per packet: both frozenPair members vote (first pass);
  // the label is their agreed entails when they agree, else undefined (a split -- excluded). Also
  // measure the frozen pair's k=5 self-consistency (DP10).
  const referenceLabel = new Map();
  let fpSelfConsistentPackets = 0;
  let fpTotalPackets = 0;

  for (const packet of allPackets) {
    fpTotalPackets += 1;
    const memberVotes = [];
    let memberSelfConsistent = true;

    for (const fpModel of frozenPair) {
      const votes = await votesFor(fpModel, packet);
      const allSame = votes.every((v) => v === votes[0]);

      if (!allSame) {
        memberSelfConsistent = false;
      }

      // The member's vote for the all-agree label is its majority/first vote.
      memberVotes.push(majority(votes));
    }

    if (memberSelfConsistent) {
      fpSelfConsistentPackets += 1;
    }

    // All-agree: every frozen-pair member must agree for the reference label to be defined.
    if (memberVotes.every((v) => v === memberVotes[0])) {
      referenceLabel.set(packetKey(packet), memberVotes[0]);
    }
  }

  const frozenPairSelfConsistency = fpTotalPackets === 0 ? 1 : fpSelfConsistentPackets / fpTotalPackets;

  // Per measured model.
  const perModel = {};

  for (const model of models) {
    let falseAccepts = 0;
    let falseVetoes = 0;
    let selfSplits = 0;
    let consistentPackets = 0;
    let totalPackets = 0;
    let agreement = 0;
    let agreementDenom = 0;

    for (const packet of allPackets) {
      totalPackets += 1;
      const votes = await votesFor(model, packet);
      const allSame = votes.every((v) => v === votes[0]);

      if (allSame) {
        consistentPackets += 1;
      } else {
        selfSplits += 1;
      }

      const modelVote = majority(votes);
      const isTrap = String(packet.expectedEntailment) === 'false';

      // ANY-uphold conservatism on the trap arm (a false-accept if ANY of the k votes calls a trap
      // entails=true); symmetric on the control arm (an over-refusal if ANY vote calls a control
      // entails=false). This mirrors the gating any-uphold rule.
      if (isTrap) {
        if (votes.some((v) => v === true)) {
          falseAccepts += 1;
        }
      } else if (votes.some((v) => v === false)) {
        falseVetoes += 1;
      }

      // Frozen-pair agreement: count packets where the reference label is defined AND the model's vote
      // matches it.
      const ref = referenceLabel.get(packetKey(packet));

      if (ref !== undefined) {
        agreementDenom += 1;

        if (modelVote === ref) {
          agreement += 1;
        }
      }
    }

    const selfConsistency = totalPackets === 0 ? 1 : consistentPackets / totalPackets;
    const estimandA = { cpUpper: clopperPearsonUpperOneSided(falseAccepts, nTrap, EVAL_THRESHOLDS.ALPHA) };
    const estimandB = { cpUpper: clopperPearsonUpperOneSided(falseVetoes, nCtrl, EVAL_THRESHOLDS.ALPHA) };
    const role = classifyCheaperRole({
      falseAccepts,
      nTrap,
      falseVetoes,
      nCtrl,
      selfConsistency,
      frozenPairAgreement: agreement,
      selfSplits,
    });

    perModel[model] = {
      falseAccepts,
      nTrap,
      falseVetoes,
      nCtrl,
      estimandA,
      estimandB,
      selfConsistency,
      selfSplits,
      frozenPairAgreement: agreement,
      frozenPairAgreementDenominator: agreementDenom,
      role,
    };
  }

  const stabilityCertificate = {
    k1: frozenPairSelfConsistency === 1.0,
    frozenPairSelfConsistency,
  };

  // NON-GATING: no retain/membership signal is returned. The pilot informs the cheaper-model question
  // + a future cost amendment; it does NOT change the gold. The gold's N_trap/N_ctrl freeze is computed
  // ELSEWHERE (the gating frozen-pair screen + the F5/F6 floors); the pilot never sets it.
  return {
    perModel,
    frozenPairSelfConsistency,
    stabilityCertificate,
    gating: false,
    sampleSizes: { nTrap, nCtrl, n: nTrap + nCtrl },
  };
}

function majority(votes) {
  let t = 0;

  for (const v of votes) {
    if (v === true) {
      t += 1;
    }
  }

  return t * 2 >= votes.length;
}

function packetKey(packet) {
  return String(packet && packet.uid !== undefined ? packet.uid : JSON.stringify(packet));
}
