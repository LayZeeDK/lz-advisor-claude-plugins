// lz-eval-wice-traps.mjs
//
// NET-NEW (Plan 19-04, Task 3b; RE-PLAN-7, W1/F7): the WiCE CLOSED-BOOK trap+control arm -- the
// "WiCE-heavy" trap BULK that de-risks the AVeriTeC median-5 collapse (F7). WiCE is closed-book-NATIVE
// and CANNOT run through the AVeriTeC date-filter / >=5-survivor / staticKsAdapter pipeline
// (loadDevSeedsAndKs reads ONLY the AVeriTeC dev cache; WiCE has no dated-URL knowledge store -- its
// evidence is GIVEN closed-book), so it is its OWN module, NOT folded into assembleStage1Traps.
//
// It REUSES the committed Phase-18 WiCE loader (remapLabel / stratify from eval/lz-eval-dataset.mjs) over
// the vendored records (eval/__fixtures__/wice-vendored/records):
//   - a WiCE TRAP    = { claim + its GIVEN closed-book evidence + a partially_supported|not_supported
//                        human label -> gold=refuted via remapLabel };
//   - a WiCE CONTROL = { claim + evidence + a supported human label -> gold=unrefuted via remapLabel }.
// CLOSED-BOOK NATIVE: this module does NOT call enrichKsForClaim / dateFilter / staticKsAdapter / the
// >=5-survivor floor (WiCE has no dated-URL KS; book:'closed'). It SCREENS each candidate through the
// SAME OUT-OF-FAMILY all-agree consensus (runProbeConsensus, reused from the assembler -- GPT-5.5 +
// Gemini, the in-family Opus probe is a non-gating annotation, #3/F3) + the F5 subjectDifficultyProbe
// (a held-out Claude reference must NOT ace the retained traps) + the trap/control COVARIATE-OVERLAP
// check (claim length / evidence-token complexity within tolerance, so a model cannot pass by STYLE) +
// F6 cluster independence (one primary sub-claim per source/seed cluster) -- IDENTICAL to the AVeriTeC arm.
//
// FLOOR-SITE SPLIT (W2/W3, load-bearing): the build-floor default STAYS perStratumFloor:3 /
// positiveControlFloor:3 ("can we even build an arm"). The adequacy POWER-floor (N_TRAP_FLOOR=36 /
// N_CTRL_FLOOR=24) lives at certifyModel's VOID-on-power gate (Task 2), NEVER as this module's default.
//
// RECIPE-NOT-TEXT + license-clean (D-07; WiCE is ODC-BY / MIT, the only commit-safe corpus): the
// returned row carries uid + stratum + book + expected_verdict ONLY -- NEVER a `text` field and NEVER an
// overreach `recipe` (the trap is the NATIVE partially/not_supported claim against its given evidence, NOT
// a mutateOverreach mutation). The given closed-book evidence stays out of the committed manifest.
//
// Tree / dependency boundary (D-10/D-11): this script lives in the repo-level eval/ tree, NEVER in the
// distributed plugin tree. It imports the WiCE loader + the runProbeConsensus consensus WITHIN the eval
// tree, and the SHIPPED runtime aggregator's ContractError ACROSS trees by relative path --
// ONE-DIRECTIONAL (eval -> runtime, NEVER runtime -> eval). It imports NEITHER the frozen primitives nor
// EVAL_THRESHOLDS (the frozen numbers are byte-identical -- this module touches none of them). zero npm deps.
//
// This source contains no literal byte-order mark and is strictly ASCII (per CLAUDE.md).

// Cross-tree reuse of the SHIPPED runtime aggregator's ContractError (D-10; eval -> runtime,
// one-directional, never the reverse).
import {
  ContractError,
} from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

// The CARRIED Phase-18 WiCE loader (CONSUMED, never rewritten): remapLabel maps the human WiCE label to
// the FROZEN verdict enum (supported -> unrefuted; partially_supported|not_supported -> refuted). The
// closed-book book tag is 'closed' by construction (WiCE evidence is given).
import { remapLabel } from './lz-eval-dataset.mjs';

// The CARRIED RE-PLAN-5 ALL-AGREE-RETAIN consensus (CONSUMED, never rewritten): the SAME multi-probe
// screen the AVeriTeC arm uses (Finding 2; OUT-OF-FAMILY GPT-5.5 + Gemini, the in-family Opus probe a
// non-gating annotation). A packet is RETAINED only if EVERY probe agrees the entailment matches the
// expectation ('false' for a refuted-gold trap, 'true' for an unrefuted-gold control).
import { runProbeConsensus } from './lz-eval-trap-assembler.mjs';

// ---------------------------------------------------------------------------
// readLabel(record): the human WiCE label at the TOP LEVEL (`record.label`). The vendored records expose
// the label at top level and the id under `meta.id` (the plan-checker-confirmed shape) -- they do NOT
// carry source_label/uid in the shape `stratify` expects, so this arm reads label + meta.id directly and
// routes the label through remapLabel.
// ---------------------------------------------------------------------------
function readLabel(record) {
  if (record == null || typeof record !== 'object' || typeof record.label !== 'string') {
    throw new ContractError('assembleWiceTraps: a WiCE record must carry a top-level string label', 'assembleWiceTraps');
  }

  return record.label;
}

function readId(record) {
  const id = record && record.meta && record.meta.id;

  if (typeof id !== 'string' || id.length === 0) {
    throw new ContractError('assembleWiceTraps: a WiCE record must carry meta.id (a non-empty string)', 'assembleWiceTraps');
  }

  return id;
}

// The source/seed cluster of a WiCE id (F6): the dev<NNNNN> prefix of dev<NNNNN>-<k> -- one Wikipedia
// claim, several positively-correlated sub-claims. One primary sub-claim is retained per cluster so the
// per-claim CP denominator is not anti-conservative.
function clusterOfId(id) {
  return String(id).replace(/-\d+$/, '');
}

// A cheap deterministic token-complexity proxy for the covariate-overlap check (F5): the number of
// whitespace-separated tokens in the claim + a flattened evidence string. Used only to compare the trap
// arm vs the control arm distributions (length / complexity overlap), never to score a vote.
function evidenceText(record) {
  const ev = record && record.evidence;

  if (Array.isArray(ev)) {
    return ev.map((e) => (typeof e === 'string' ? e : JSON.stringify(e))).join(' ');
  }

  return typeof ev === 'string' ? ev : '';
}

function tokenComplexity(record) {
  const claim = typeof record.claim === 'string' ? record.claim : '';
  const combined = claim + ' ' + evidenceText(record);

  return combined.trim().split(/\s+/).filter(Boolean).length;
}

function mean(xs) {
  if (xs.length === 0) {
    return 0;
  }

  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

// ---------------------------------------------------------------------------
// assembleWiceTraps({ records, probes, inFamilyAnnotationProbe, subjectDifficultyProbe,
//   subjectDifficultyMaxCatchRate = 0.5, covariateOverlapTolerance = 0.5, clusterIndependence = true,
//   perStratumFloor = 3, positiveControlFloor = 3 }): the WiCE CLOSED-BOOK trap+control arm.
//
// Deterministic over the vendored records (sorted by meta.id, ascending -- anti result-shopping). For
// each record: remapLabel its top-level label -> a refuted-gold TRAP (partially/not_supported) or an
// unrefuted-gold CONTROL (supported); the GIVEN closed-book evidence is the packet (NO AVeriTeC
// date-filter / survivor pipeline). SCREEN each candidate through the OUT-OF-FAMILY all-agree consensus
// (runProbeConsensus; expectedEntailment 'false' for a trap, 'true' for a control). F6 cluster
// independence keeps ONE retained primary sub-claim per source/seed cluster (deterministic -- the first
// surviving sub-claim by ascending id). THEN the F5 subjectDifficultyProbe is run over the RETAINED traps
// (its catch-rate must NOT exceed subjectDifficultyMaxCatchRate -> else VOID-difficulty) + the
// covariate-overlap check (the trap-arm vs control-arm token-complexity means must overlap within
// covariateOverlapTolerance -> else VOID-covariate). The build-floor (perStratumFloor / positiveControlFloor)
// is enforced LAST (below either -> a documented VOID-on-floor THROW; the floor is load-bearing, never relaxed).
//
// Returns { strata: { 'evidence-absent':[row], 'positive-control':[row] }, goldLabels, attrition,
//   runConfig }. attrition mirrors the AVeriTeC arm (probeDropped + probeSplitDropped + the F5 floor flags
//   difficultyFloorMet / covariateOverlapMet). A row carries { uid, stratum, book:'closed', expected_verdict }
//   -- NO `text`, NO `recipe`.
// ---------------------------------------------------------------------------
export async function assembleWiceTraps({
  records,
  probes,
  inFamilyAnnotationProbe,
  subjectDifficultyProbe,
  subjectDifficultyMaxCatchRate = 0.5,
  covariateOverlapTolerance = 0.5,
  clusterIndependence = true,
  perStratumFloor = 3,
  positiveControlFloor = 3,
} = {}) {
  if (!Array.isArray(records) || records.length === 0) {
    throw new ContractError('assembleWiceTraps requires a non-empty records array (the vendored WiCE corpus)', 'assembleWiceTraps');
  }

  const PROBES = Array.isArray(probes) && probes.length > 0 ? probes : null;

  if (PROBES == null || PROBES.some((p) => typeof p !== 'function')) {
    throw new ContractError('assembleWiceTraps requires an injected `probes` array of OUT-OF-FAMILY gold-blind judges', 'assembleWiceTraps');
  }

  const strata = { 'evidence-absent': [], 'positive-control': [] };
  const goldLabels = {};
  const attrition = {
    scanned: 0,
    controlScanned: 0,
    probeDropped: 0,
    probeSplitDropped: 0,
    controlProbeDropped: 0,
    clusterCollapsed: 0,
    perStratumCount: { 'evidence-absent': 0, 'positive-control': 0 },
    difficultyFloorMet: true,
    covariateOverlapMet: true,
    inFamilyAgreement: 0,
    retainedBelowFloor: false,
    controlBelowFloor: false,
    voidReason: null,
  };

  // Deterministic order: ascending meta.id (anti result-shopping). F6: track which source/seed clusters
  // already have a retained primary claim (one per cluster when clusterIndependence is on).
  const ordered = [...records].sort((a, b) => (readId(a) < readId(b) ? -1 : readId(a) > readId(b) ? 1 : 0));
  const seenClusters = new Set();

  // Keep the retained candidate records so the F5 subjectDifficultyProbe + covariate-overlap check can run
  // over the EXACT retained set (the probe judges the same evidence the voter would).
  const retainedTraps = [];
  const retainedControls = [];

  for (const record of ordered) {
    const label = readLabel(record);
    const mapped = remapLabel(label); // throws on an unknown label (fail closed, mirrors the loader)
    const id = readId(record);
    const isControl = mapped.expected_verdict === 'unrefuted';

    if (isControl) {
      attrition.controlScanned += 1;
    } else {
      attrition.scanned += 1;
    }

    // F6 cluster independence: keep ONE retained primary claim per source/seed cluster (the first
    // surviving sub-claim by ascending id). A later sub-claim from the same cluster collapses to the
    // already-retained one (positively-correlated sub-claims must not double-count the CP denominator).
    const cluster = clusterOfId(id);

    if (clusterIndependence && seenClusters.has(cluster)) {
      attrition.clusterCollapsed += 1;
      continue;
    }

    const expectedEntailment = isControl ? 'true' : 'false';

    // The GIVEN closed-book evidence is the packet the gold-blind probe reads (closed-book mirroring): the
    // probe sees ONLY the evidence the voter would. WiCE has no dated-URL KS, so there is no date-filter --
    // the evidence array IS the window.
    const enrichedKs = Array.isArray(record.evidence) ? record.evidence : [];

    const consensus = await runProbeConsensus(PROBES, {
      trap: record.claim,
      enrichedKs,
      stratum: isControl ? 'positive-control' : 'evidence-absent',
      decisiveRank: -1,
      expectedEntailment,
    });

    // The in-family Opus probe (if injected) is a NON-GATING annotation only (#3/F3): run it for the
    // OOF-vs-in-family agreement diagnostic, but NEVER add it to the retain AND.
    if (typeof inFamilyAnnotationProbe === 'function') {
      const ann = await inFamilyAnnotationProbe({ trap: record.claim, enrichedKs, stratum: isControl ? 'positive-control' : 'evidence-absent', expectedEntailment });

      if (ann && ann.entails !== undefined && String(ann.entails) === String(expectedEntailment)) {
        attrition.inFamilyAgreement += 1;
      }
    }

    if (!consensus.retained) {
      if (isControl) {
        attrition.controlProbeDropped += 1;
      } else {
        attrition.probeDropped += 1;
      }

      if (consensus.split) {
        attrition.probeSplitDropped += 1;
      }

      continue;
    }

    // RETAINED: claim the cluster (so a later sub-claim collapses) + record the candidate.
    if (clusterIndependence) {
      seenClusters.add(cluster);
    }

    const uid = 'wice-' + id;
    const row = {
      uid,
      stratum: isControl ? 'positive-control' : 'evidence-absent',
      book: 'closed',
      expected_verdict: mapped.expected_verdict,
    };

    if (isControl) {
      retainedControls.push(record);
      strata['positive-control'].push(row);
      goldLabels[uid] = 'unrefuted';
      attrition.perStratumCount['positive-control'] += 1;
    } else {
      retainedTraps.push(record);
      strata['evidence-absent'].push(row);
      goldLabels[uid] = 'refuted';
      attrition.perStratumCount['evidence-absent'] += 1;
    }
  }

  // ===== THE F5 FLOORS (load-bearing, never tuned toward a desired N) =====

  // (1) The SUBJECT-SPECIFIC difficulty floor (F5): a held-out Claude reference verifier run over the
  // RETAINED refuted-trap set must NOT ace it. If its catch-rate (the fraction it correctly REFUTES)
  // exceeds subjectDifficultyMaxCatchRate the set is too easy for the subject family to certify
  // capability -> a documented VOID-difficulty. Optional (only when a subjectDifficultyProbe is injected).
  if (typeof subjectDifficultyProbe === 'function' && retainedTraps.length > 0) {
    let caught = 0;

    for (const record of retainedTraps) {
      const enrichedKs = Array.isArray(record.evidence) ? record.evidence : [];
      const verdict = await subjectDifficultyProbe({ trap: record.claim, enrichedKs, stratum: 'evidence-absent' });

      if (verdict === 'refuted') {
        caught += 1;
      }
    }

    const catchRate = caught / retainedTraps.length;

    if (catchRate > subjectDifficultyMaxCatchRate) {
      attrition.difficultyFloorMet = false;
      attrition.voidReason =
        'VOID-difficulty: the held-out Claude reference verifier caught ' + caught + '/' + retainedTraps.length +
        ' retained traps (catch-rate ' + catchRate.toFixed(3) + ' > subjectDifficultyMaxCatchRate ' +
        subjectDifficultyMaxCatchRate + ') -- the retained set is too easy for the subject family to ' +
        'certify capability (F5). The floor is load-bearing, never tuned toward a desired N.';

      const err = new ContractError(
        'assembleWiceTraps: VOID-difficulty -- the F5 subject-specific difficulty floor is unmet (the Claude ' +
          'reference aced the retained traps: catch-rate ' + catchRate.toFixed(3) + ' > ' + subjectDifficultyMaxCatchRate + ')',
        'assembleWiceTraps',
      );
      err.attrition = attrition;
      throw err;
    }
  }

  // (2) The trap/control COVARIATE-OVERLAP check (F5): the trap-arm vs control-arm token-complexity
  // distributions must OVERLAP within covariateOverlapTolerance (a relative mean difference), so a model
  // cannot pass by STYLE (systematically longer/more-complex traps) rather than judgment. Below tolerance
  // -> a documented VOID-covariate. Checked only when BOTH arms have retained members.
  if (retainedTraps.length > 0 && retainedControls.length > 0) {
    const trapMean = mean(retainedTraps.map(tokenComplexity));
    const ctrlMean = mean(retainedControls.map(tokenComplexity));
    const denom = Math.max(trapMean, ctrlMean, 1);
    const relDiff = Math.abs(trapMean - ctrlMean) / denom;

    if (relDiff > covariateOverlapTolerance) {
      attrition.covariateOverlapMet = false;
      attrition.voidReason =
        'VOID-covariate: the trap-arm vs control-arm token-complexity means diverge (relDiff ' +
        relDiff.toFixed(3) + ' > covariateOverlapTolerance ' + covariateOverlapTolerance + ') -- a model ' +
        'could pass by STYLE not judgment (F5). The floor is load-bearing, never tuned.';

      const err = new ContractError(
        'assembleWiceTraps: VOID-covariate -- the F5 trap/control covariate-overlap check failed (relDiff ' +
          relDiff.toFixed(3) + ' > ' + covariateOverlapTolerance + ')',
        'assembleWiceTraps',
      );
      err.attrition = attrition;
      throw err;
    }
  }

  // ===== THE TWO INDEPENDENT BUILD-FLOORS (W2 -- default 3/3; load-bearing, never relaxed) =====

  if (strata['evidence-absent'].length < perStratumFloor) {
    attrition.retainedBelowFloor = true;
    attrition.voidReason =
      'RETAINED WiCE traps < perStratumFloor (' + perStratumFloor + '): got ' +
      strata['evidence-absent'].length + ' after the OUT-OF-FAMILY consensus dropped ' + attrition.probeDropped +
      ' trap packet(s). Documented VOID -- the WiCE corpus cannot honestly build the trap arm (the build-floor ' +
      'is load-bearing, not a knob; the 36-trap adequacy power-floor lives at certifyModel).';

    const err = new ContractError(
      'assembleWiceTraps: the WiCE trap arm has fewer than perStratumFloor (' + perStratumFloor +
        ') RETAINED traps: got ' + strata['evidence-absent'].length + ' (probeDropped=' + attrition.probeDropped + ')',
      'assembleWiceTraps',
    );
    err.attrition = attrition;
    throw err;
  }

  if (strata['positive-control'].length < positiveControlFloor) {
    attrition.controlBelowFloor = true;
    attrition.voidReason =
      'RETAINED WiCE controls < positiveControlFloor (' + positiveControlFloor + '): got ' +
      strata['positive-control'].length + ' after the consensus dropped ' + attrition.controlProbeDropped +
      ' control(s). Documented VOID-on-control-floor -- the read cannot prove the voter CAN uphold.';

    const err = new ContractError(
      'assembleWiceTraps: the WiCE control arm has fewer than positiveControlFloor (' + positiveControlFloor +
        ') RETAINED controls: got ' + strata['positive-control'].length + ' (controlProbeDropped=' + attrition.controlProbeDropped + ')',
      'assembleWiceTraps',
    );
    err.attrition = attrition;
    throw err;
  }

  return {
    strata,
    goldLabels,
    attrition,
    runConfig: {
      perStratumFloor,
      positiveControlFloor,
      clusterIndependence,
      subjectDifficultyMaxCatchRate,
      covariateOverlapTolerance,
      book: 'closed',
    },
  };
}
