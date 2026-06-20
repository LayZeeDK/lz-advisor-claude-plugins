# lz-deep-research LIVE-cert session-driver protocol (re-authored Plan 20-05, certified-WORKS two-arm split-source)

This is the exact, step-by-step protocol a CLAUDE CODE SESSION follows AT SPEND TIME to drive the staged
LIVE certified-WORKS certification of the lz-deep-research verify-voter. It is the operational companion to
the no-spend seams in `eval/lz-eval-live-cert.mjs` + `eval/lz-eval-contrastive-authoring.mjs` +
`eval/lz-eval-baseline-guard.mjs` + `eval/lz-eval-difficulty-proxy.mjs` + `eval/lz-eval-prescale-probe.mjs`,
and the pre-registered acceptance rule in `eval/lz-eval-live-lock-rule.md`.

It is RE-AUTHORED for the certified-WORKS RE-PLAN (D-21 / `CERTIFY-WORKS-BOARD-DECISION.md`): Stage 0 now
authors arm A as MANUALLY-CONSTRUCTED contrastive minimal-pairs + runs the construct-validity gate + the
10-pair pre-scale probe BEFORE the full-N spend; arm B (over-refusal) STAYS live-harvested. Following it
incurs spend; this document does NOT itself spend. The spend is the human-authorized BLOCKING checkpoint of
the re-authored Plan 20-05 (Stage 1 `freeze-and-authorize`). Do NOT run any step below until that go is
given.

## The transport split (D-20 -- read this first)

Three transports, three different mechanisms. Getting this wrong is the single most common error:

| Transport | Mechanism | Pool | Node-wireable? |
|-----------|-----------|------|----------------|
| `callVoter` (CHEAP Haiku + STRONG Sonnet voters) | the Phase-18 verify-voter Agent sub-agents, spawned via the Agent tool, per-invocation `model: haiku` / `model: sonnet` | the Claude SESSION pool | NO -- the Agent tool is UNAVAILABLE to a bare `node` process. SESSION-DRIVEN. |
| `callAuditor` (Stage-3 unanimous-uphold audit / load-bearing census) | the Agent tool (a Sonnet/Opus re-vote + audit agent) | the Claude SESSION pool | NO -- SESSION-DRIVEN. |
| `callOof` (gold adjudication: gpt-5.5 + gemini-3.1-pro-preview) | the Copilot CLI external subprocess (`makeCopilotCallModel` in `lz-eval-live-cert.mjs`) | the metered Copilot AI Credits pool | YES -- the ONLY node-wireable transport. |

ABSOLUTE PROHIBITIONS (D-20 / PROJECT.md):

- NEVER call the Anthropic API. The Claude voter spend is the Agent tool drawing the session pool, never
  the metered API.
- NEVER use `claude -p` for the voters or the auditor. `claude -p` is the dev/UAT-only harness (e.g. the
  20-04 SC-5 spike); it is NOT a voter transport.
- The metered pool is the Copilot OOF Credits ONLY. The Claude voter spend is the session pool.

## Why the node engine NEVER spawns voters

`eval/lz-eval-live-cert.mjs` runs as a bare `node` process via `Bash(node:*)`. A bare `node` process has NO
access to the Agent tool. Therefore `callVoter` and `callAuditor` CANNOT be node functions -- they are a
SESSION-DRIVEN PROTOCOL the orchestrating Claude Code session executes by spawning Agent sub-agents and
landing each vote on disk via `persistDualRunVote`. The node engine then SCORES FROM DISK
(`scoreFromPersistedVotes`) with ZERO spend. The session does the (spend) voting; node does the (no-spend)
scoring. Only `callOof` (the Copilot CLI) is node-wireable.

## Stage 0 -- author arm A + the construct-validity gate + the 10-pair probe (mostly NO SPEND)

Stage 0 is the certified-WORKS prerequisite. Arm B stays the live harvest; arm A is now MANUALLY
CONSTRUCTED. Run these BEFORE the full-N spend.

### 0a. Harvest arm B (over-refusal control; NO SPEND)

Run `stage0FeasibilityProbe({ corpusDir })` (`lz-eval-live-cert.mjs`) -> `harvest` over the curated corpus
of real run dirs. It confirms arm B can emit `>= 30` difficulty-representative SUPPORTED claims in the dense
/ contested-evidence band (`overRefusalControls`). If arm B is below floor -> RAISE; Sonnet-default ships.
This is on-disk only -- no model spend.

### 0b. Author arm A as MANUALLY-CONSTRUCTED contrastive minimal-pairs (NO SPEND)

Arm A's false-uphold traps are MANUALLY-CONSTRUCTED contrastive minimal-pairs, each a minimal edit of a
REAL live dense bundle (a harvested `denseTrapMonitor` member of the SAME class as the arm-B positives),
flipping ONLY the truth-value (preserve density / length / style). Use `authorContrastivePair(denseBundle)`
(`lz-eval-contrastive-authoring.mjs`) per real bundle, supplying the AUTHORED overclaim (the human writes
the truth-value flip; the harness enforces the `MIN_COMPLEXITY_TOKENS` floor + records `source_uid`, gate
(d)). Expand to `>= MIN_TRAP_PAIRS` (30) -- the 12-trap seed (`ARM_A_SEED`) is the seed material; author
`>= 18` more from real dense bundles. N is frozen before scoring; the two arms are NEVER pooled (this
harness owns ONLY arm A).

### 0c. Run the construct-validity gate (NO SPEND, deterministic)

Run all three gates over the authored arm-A pairs:

- gate (d): every pair carries `source_uid` (`constructValidityVerdict` -> `minimalEdit`).
- gate (a): `lexicalOverlapAuc(pairs).pass` -- the zero-dep lexical-overlap AUC `<= LEXICAL_AUC_CEILING`
  (the truth-value is not lexically readable).
- gate (b): `oneSidedNotEasierGuard({ constructedCell, harvestedDenseCell }).notEasier` -- the constructed
  cell is NOT detectably EASIER than the harvested dense-SUPPORTED cell (one-sided SMD `> 0.5` FAILS).

`constructValidityVerdict({ pairs, lexicalGatePass, notEasier })` folds them: `constructValid = (d) AND (a)
AND (b)`. A FAIL -> a downstream SCOPED certificate (NOT WORKS). All three deterministic, no model call.

### 0d. Run the 10-pair pre-scale probe (the FIRST OOF spend boundary -- LZ_SPEND-gated)

Run `runPrescaleProbe({ pairs, callModel, callVoter })` (`lz-eval-prescale-probe.mjs`) over the FIRST
`PROBE_PAIR_COUNT` (10) arm-A pairs. The probe gates on (both must pass): (1) the OOF all-agree gold panel
unanimously admits `>= PROBE_UNANIMITY_FLOOR` (9) of 10 pairs; (2) the lexical AUC `<= LEXICAL_AUC_CEILING`.
`decidePrescale` returns `scale` | `reconstruct`. The scored voter is RUN-but-NOT-GATE (telemetry + a
VOLUNTARY early-stop signal: `>= 1` scored false-uphold -> INVESTIGATE the pipeline / re-pre-register,
NEVER edit items until the probe is clean; it is EXCLUDED from `decidePrescale`). The probe's OOF dispatch
spends Copilot Credits via the `callOof` transport and is hard-guarded behind `requireSpend('callOof')`. A
`reconstruct` -> re-author + re-probe; do NOT scale. A `scale` -> proceed to Stage 1.

## Preconditions (all must hold before Stage 2)

1. Stage 0 passed: arm B feasible (`>= 30`); arm A authored as `>= 30` manual contrastive minimal-pairs;
   the construct-validity gate `constructValid: true`; the 10-pair probe `decision: 'scale'`. If ANY raised
   -> STOP (SCOPED or RAISE; Sonnet-default ships).
2. Stage 1 [HUMAN BLOCK] authorized: the user selected `freeze-and-authorize`. The frozen snapshot
   (`stage1FreezeGold` -> `freezeArms`) is recorded, and `eval/lz-eval-live-lock-rule.md` is COMMITTED as
   the freeze evidence (commit ref + the bar-constant freeze timestamp recorded in
   `20-05-LIVE-CERT-RESULT.md` Stage 1) BEFORE any scored vote. N is frozen; the two arms are separate; no
   optional stopping.
3. The two frozen arms (`overRefusalControls` + the authored arm-A contrastive pairs) and their members'
   `uid`s are fixed. Each member carries the evidence bundle + the claim text. Vote-store keys are
   `:`-free (the run-dir-qualified `::` separator is mapped to a `:`-free form for the Windows vote store).

## Stage 2 -- the dual-run (session-Agent-driven voters + node scoring), STRONG-first then CHEAP-separate

Run STRONG (Sonnet) FIRST against the frozen corpus / gold / gates; the CHEAP (Haiku) certification is a
SEPARATE pass over the SAME frozen artifacts with the EVAL-05 Haiku prompt + a task-fit pre-gate. No tier
inherits another's verdict; no TAU is loosened per tier (D-21 section 5). The votes land on disk; the node
engine scores them.

### 2a. Set the spend authorization

Export `LZ_SPEND=1` in the Bash environment ONLY for the spend window. The node SCORER
(`scoreFromPersistedVotes`) is NO-SPEND; `makeCopilotCallModel` (callOof) + the guarded stage entrypoints
DO require it. The Claude voter Agent spawns are session-pool spend and are NOT gated by `LZ_SPEND` (that
env var guards only the node-side spend paths); the human authorization at Stage 1 is the voter-spend gate.

### 2b. Cast the CHEAP + STRONG votes via Agent sub-agents (the callVoter protocol)

For EACH frozen member in EACH arm (the over-refusal control arm AND the arm-A contrastive monitor), and
for EACH tier (STRONG = Sonnet FIRST, then CHEAP = Haiku SEPARATELY):

1. Spawn the Phase-18 verify-voter Agent sub-agent via the Agent tool, with the PER-INVOCATION model
   override: `model: sonnet` for the STRONG tier, `model: haiku` for the CHEAP tier. (The agent file's
   frontmatter `model:` is INERT -- tier is controlled ONLY by the per-invocation override.)
   - STRONG voter agent: `research-verify-voter-sonnet` with `model: sonnet`.
   - CHEAP voter agent: `research-verify-voter-haiku` with `model: haiku`.
   - NEVER spawn `research-verify-voter-opus` here (it is EVAL-REFERENCE-ONLY).
2. The agent receives the member's evidence bundle + claim, conducts the search-and-stop voting loop, and
   returns a verdict (`unrefuted` | `refuted`) PLUS the required per-vote search trace
   (`{ queries: [...], depth, stop_reason in {decisive-evidence,exhausted,min-not-met} }`).
3. Persist the vote to the CORRECT per-tier, per-arm vote dir via the node helper, keyed by the member uid:
   - run via `Bash(node:*)` a tiny driver that imports `persistDualRunVote` from `lz-eval-live-cert.mjs`
     and writes `{ id: <member.uid (:-free)>, verdict, trace }` to the arm+tier vote dir.
   - Vote-dir layout (gitignored `eval/.cache/p20-live/`):
     - `votes/sonnet/ctrl/` -- STRONG votes on the over-refusal control arm (arm B)
     - `votes/sonnet/trap/` -- STRONG votes on the arm-A contrastive monitor (arm A)
     - `votes/haiku/ctrl/`  -- CHEAP votes on the over-refusal control arm (arm B)
     - `votes/haiku/trap/`  -- CHEAP votes on the arm-A contrastive monitor (arm A)
   - `persistDualRunVote` is RESUMABLE: a re-run SKIPS an already-persisted vote (skip-already-done), so a
     credit/account interruption mid-run is recoverable. Re-running 2b after an interruption only casts the
     missing votes.
4. Key the vote by the member uid EXACTLY (the `:`-free form of the run-dir-qualified id). The node scorer
   reads votes by member uid; a mis-keyed vote silently mis-scores.

WAVE DISCIPLINE: batch the Agent spawns at `<= 5` in-flight per turn (foreground; wait for the batch before
the next turn), per the orchestrator's wave-batching contract (D-08). Do NOT background-fan-out.

### 2c. OOF-adjudicate the gold gold-blind (the callOof transport)

The gold for each member (does the evidence ENTAIL the claim?) is decided by the FROZEN out-of-family
all-agree pair, gold-blind, via the Copilot CLI. For arm A, the contrastive pairs are already authored with
a gold direction (SUPPORTED -> `unrefuted`; REFUTED -> `refuted`); the OOF pair adjudicates gold-blind via
`adjudicateContrastivePairs({ pairs, callModel })` (the SAME strict all-agree gold-blind contract). For arm
B, the harvested SUPPORTED positives' gold is `unrefuted`, OOF-confirmed via `makeOofAdjudicator`.

1. Build the adjudicator: `makeOofAdjudicator({ seed })` (from `lz-eval-live-cert.mjs`). It composes ONE
   `makeBatchedOofProbe` per frozen OOF model (gpt-5.5 + gemini-3.1-pro-preview), each wired over
   `makeCopilotCallModel({ model })` -- the Copilot CLI subprocess transport (stdin-piped prompt, no `-p`,
   no `--allow-all-tools`, `--model <slug> --effort high`). Hard-guarded behind `requireSpend('callOof')`.
2. Pre-pass: call `adjudicator.prepare(packets)` over the FULL candidate set (both arms' members as
   gold-blind packets) BEFORE the per-packet consensus loop -- the documented PRE-PASS shape.
3. Run the all-agree consensus: a member's OOF gold stands only if the pair AGREES (all-agree). The gold
   direction (expectedEntailment) is NEVER rendered into the prompt.
4. Route the residue (`classifyAdjudicationResidue({ oofProbes, cheapVerdict })`): `oof` (all-agree,
   PRIMARY) | `oof-split` / `response-set-indeterminate` (Guerdan exclusion -- the item LEAVES the binary
   denominator, NEVER coerced) / `cheap-vs-unanimous-oof` -> the maintainer resolves ONLY the residue.
5. A small OOF-vs-human CALIBRATION subset validates the OOF oracle before it is trusted as primary (D-04).
6. The OOF transcripts land in gitignored `eval/.cache/p20-live/oof/` -- no secret / transcript is written
   to a tracked path.

### 2d. Score from disk (the node scorer -- NO SPEND)

After 2b (votes persisted) + 2c (gold recorded), the node engine scores from disk with ZERO spend. Run via
`Bash(node:*)` a driver that:

1. Re-derives / loads the frozen Stage-1 snapshot (`freezeArms` over the same two arms -- byte-identical to
   the committed freeze), or loads the recorded frozen `{ nCtrl, nTrap }`.
2. Calls `scoreFromPersistedVotes` PER MODEL over the two SEPARATE arm vote dirs (the two arms NEVER
   pooled), STRONG first then CHEAP:
   - STRONG (sonnet): `scoreFromPersistedVotes({ frozen, ctrlArm, trapArm, ctrlVoteDir: votes/sonnet/ctrl,
     trapVoteDir: votes/sonnet/trap, model: 'sonnet', traceAudit, difficultyFloorMet, covariateOverlapMet,
     evidenceAbsentStratumMet })`.
   - CHEAP (haiku): same with the `votes/haiku/...` dirs + `model: 'haiku'` (the SEPARATE cert).
   - The over-refusal control arm scores a `refuted` vote as an over-refusal (ESTIMAND B, `overRefusals` /
     `nCtrl`); the arm-A contrastive monitor scores an `unrefuted` vote on a REFUTED-gold member as a
     false-uphold (ESTIMAND A, `falseUpholds` / `nTrap`). The scorer NEVER pools the two arms.
   - `traceAudit` is the per-model audited upheld set; its count MUST equal the model's false-uphold count.
   - The F5/F7 floor flags (`difficultyFloorMet` / `covariateOverlapMet` / `evidenceAbsentStratumMet`) +
     the construct-validity verdict are the read's validity evidence; the read is confounded without them.
3. Each call returns the frozen `certifyModel` verdict: `WORKS` iff the construct-validity check passes AND
   BOTH gates pass (ESTIMAND A CP1s false-uphold `<= TAU_FU` 0.10 AND ESTIMAND B CP1s over-refusal `<=
   TAU_OR` 0.15, floors met); `SCOPED` if construct validity fails; else `DOES-NOT-WORK` / `VOID-*`. The CP
   estimator is the frozen `clopperPearsonUpperOneSided` -- NEVER re-derived; NEVER relax a TAU to fit a
   realized N (N is the FROZEN Stage-1 count).

## Stage 3 -- the unanimous-uphold audit / load-bearing census (the callAuditor protocol)

Fold in the Stage-3 audit, consuming the deterministic `escalate` flag union from the Plan 20-01 aggregator
(load-bearing claims + Contested + a ~15-20% stable-hash audit sample of unanimous 3/3 upholds):

1. For each claim in the `escalate` union, spawn the audit Agent sub-agent via the Agent tool (a Sonnet
   re-vote, optionally an Opus reference read -- the SESSION-driven callAuditor; NEVER the API, NEVER
   `claude -p`).
2. CENSUS on load-bearing / high-consequence claims (every one audited); SAMPLE elsewhere. This is the only
   mechanism that catches a correlated unanimous (contested-trigger-invisible) false-uphold.
3. Persist the audit outcomes; record the audit result + the owner escaped-error budget ratification in
   `20-05-LIVE-CERT-RESULT.md`.

## The decisionMatrix verdict + the recorded result

1. Compose the final verdict: `composeDecision({ haiku, sonnet, opus })` over the three per-model
   `certifyModel` verdicts (the Opus verdict is the EVAL-reference row, not a ship cell). `raiseToUser` is
   ALWAYS true (settle-OR-raise; the Haiku-first flip is DEFERRED regardless -- D-06).
2. Record in `20-05-LIVE-CERT-RESULT.md`:
   - the construct-validity verdict (minimal-edit + lexical AUC + one-sided not-easier) + the 10-pair probe
     result;
   - the two SEPARATE arm CP results (over-refusal CP-upper vs TAU_OR 0.15; arm-A false-uphold CP-upper vs
     TAU_FU 0.10), NEVER one pooled N;
   - the OOF-vs-maintainer calibration + the residue resolution;
   - the Stage-3 unanimous-uphold audit outcome;
   - the `decisionMatrix` verdict (WORKS iff construct validity passes AND BOTH gates pass; else SCOPED /
     settle-OR-raise);
   - the Haiku-first DEFER decision (ship Sonnet-default + the gated mechanism + guardrails + a
     pre-committed rollback; the flip stays OFF -- D-06);
   - the DISTRIBUTION-SCOPE LIMIT named explicitly (maintainer-curated -- arm B from the skill's own runs,
     arm A minimal-edited from real dense bundles -- NOT all production, D-05);
   - the owner escaped-error budget ratified.
3. If WORKS does not clear: record SCOPED (construct-validity fail) or settle-OR-raise (a gate breach);
   Sonnet ships; RAISE to the user. The Haiku flip is DEFERRED regardless of the verdict.

## Anti-result-shopping invariants (never violate)

- N is FROZEN at Stage 1 (before any scored vote). The NEW bar constants (`LEXICAL_AUC_CEILING` 0.65,
  `EASIER_DIRECTION_SMD_MARGIN` 0.5, `DIFFICULTY_GUARD_ALPHA` 0.05, `PROBE_PAIR_COUNT` 10,
  `PROBE_UNANIMITY_FLOOR` 9, `MIN_TRAP_PAIRS` 30) are frozen at the lock rule's commit, BEFORE any arm-A
  pair is authored or scored. NEVER grow N after a CP read (no optional stopping); the 10-pair probe never
  edits items until clean.
- The two arms are NEVER pooled into one N. They are scored separately and passed separately to
  `certifyModel`.
- The prose TAU references match `EVAL_THRESHOLDS` byte-for-byte. NEVER relax a TAU to fit a realized N.
- The frozen seams (`certifyModel` / `decisionMatrix` / `clopperPearsonUpperOneSided` / `EVAL_THRESHOLDS` /
  `persistVote` / `freezeArms` / `makeBatchedOofProbe` / `runProbeConsensus` / the OOF gold pair /
  `requireSpend` / `persistDualRunVote`) are consumed BYTE-IDENTICAL -- never edited.

## Cross-reference

- `eval/lz-eval-live-cert.mjs` -- the staging + scoring seams (`scoreFromPersistedVotes`,
  `makeCopilotCallModel`, `makeOofAdjudicator`, `classifyAdjudicationResidue`, `persistDualRunVote`,
  `freezeArms`, `stage0FeasibilityProbe`, `requireSpend`).
- `eval/lz-eval-contrastive-authoring.mjs` -- the arm-A contrastive minimal-pair authoring + adjudication +
  the construct-validity verdict (`authorContrastivePair`, `adjudicateContrastivePairs`,
  `constructValidityVerdict`, `MIN_TRAP_PAIRS`).
- `eval/lz-eval-baseline-guard.mjs` -- the construct-validity gate (a) zero-dep lexical-overlap AUC
  (`lexicalOverlapAuc`, `LEXICAL_AUC_CEILING`).
- `eval/lz-eval-difficulty-proxy.mjs` -- the construct-validity gate (b) one-sided not-easier difficulty SMD
  guard (`oneSidedNotEasierGuard`, `EASIER_DIRECTION_SMD_MARGIN`, `DIFFICULTY_GUARD_ALPHA`).
- `eval/lz-eval-prescale-probe.mjs` -- the 10-pair pre-scale probe (`runPrescaleProbe`, `decidePrescale`,
  `PROBE_PAIR_COUNT`, `PROBE_UNANIMITY_FLOOR`; the scored voter run-but-NOT-gate).
- `eval/lz-eval-live-lock-rule.md` -- the pre-registered acceptance rule (the two-arm methodology, the
  construct-validity gate, the NEW bar constants frozen with a timestamp, the frozen N + TAU references).
- `20-CONTEXT.md` D-20 (the transport split), D-04 (the OOF + human hybrid), D-05 (the distribution-scope
  limit), D-06 (the DEFER-the-flip discipline), D-07 (the staged blocking spend), D-21 (the certified-WORKS
  two-arm split-source re-plan).
