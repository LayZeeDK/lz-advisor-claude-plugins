# lz-deep-research LIVE-cert session-driver protocol (re-authored Plan 20-05, certified-WORKS two-arm split-source)

This is the exact, step-by-step protocol a CLAUDE CODE SESSION follows AT SPEND TIME to drive the staged
LIVE certified-WORKS certification of the lz-deep-research verify-voter. It is the operational companion to
the no-spend seams in `eval/lz-eval-live-cert.mjs` + `eval/lz-eval-armA-native.mjs` +
`eval/lz-eval-baseline-guard.mjs` + `eval/lz-eval-difficulty-proxy.mjs` + `eval/lz-eval-harvest.mjs`,
and the pre-registered acceptance rule in `eval/lz-eval-live-lock-rule.md`.

It is RE-AUTHORED for the AMENDED ARM A (D-22 / `CERTIFY-WORKS-RATIFICATION.md`, the original cross-family
board, UNANIMOUS 4/4): Stage 0 no longer authors arm A as manual minimal-edit contrastive pairs. Stage 0 now
HARVESTS arm A as the skill's OWN naturally-occurring refuted-gold (Contested/Unsupported/Low) claims,
RETAINS them as refuted-gold ONLY via the FROZEN out-of-family all-agree gold-blind pair ("evidence does NOT
entail the claim"; gold = the OOF read, NEVER the skill self-tag), difficulty-matches them STATISTICALLY to
the ARM-B SUPPORTED controls (covariate-overlap + subject-difficulty + cluster guards), and RE-RUNS the
construct-validity gates (a) lexical-AUC <= 0.65 + (b) one-sided not-easier ON THE POST-OOF RETAINED SET
BEFORE the full-N spend (gate (d) minimal-edit is DROPPED -- no edits under option C). Arm B (over-refusal)
STAYS live-harvested. The minimal-edit ARM-A construction (`eval/lz-eval-contrastive-authoring.mjs`
`authorContrastivePair` / `ARM_A_SEED`) is UNUSED for the live cert -- it is NOT deleted (it stays a frozen
no-spend seam), but it is no longer referenced for ARM A; the gates (a)/(b) in `eval/lz-eval-baseline-guard.mjs`
+ `eval/lz-eval-difficulty-proxy.mjs` are RETAINED + re-run on the native retained set via
`eval/lz-eval-armA-native.mjs`. Following it incurs spend; this document does NOT itself spend. The spend is
the human-authorized BLOCKING checkpoint of Plan 20-05 (Stage 1 `freeze-and-authorize`). Do NOT run any step
below until that go is given.

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

## Stage 0 -- harvest arm A native refuted-gold + OOF all-agree RETAIN + the construct-validity gates (mostly NO SPEND)

Stage 0 is the certified-WORKS prerequisite. Arm B stays the live harvest; arm A is now HARVESTED from the
skill's OWN refuted-gold (Contested/Unsupported/Low) claims, RETAINED gold-blind by the frozen OOF all-agree
pair, and difficulty-matched STATISTICALLY to the ARM-B SUPPORTED controls. Run these BEFORE the full-N
spend. The amended ARM-A seams are in `eval/lz-eval-armA-native.mjs` (`harvestRefutedGoldCandidates` /
`adjudicateNativeRefutedGold` / `assembleArmA`).

### 0a. Harvest arm B (over-refusal control; NO SPEND)

Run `stage0FeasibilityProbe({ corpusDir })` (`lz-eval-live-cert.mjs`) -> `harvest` over the curated corpus
of real run dirs. It confirms arm B can emit `>= 30` difficulty-representative SUPPORTED claims in the dense
/ contested-evidence band (`overRefusalControls`). If arm B is below floor -> RAISE; Sonnet-default ships.
This is on-disk only -- no model spend. ARM B is UNCHANGED by the D-22 amendment.

### 0b. Harvest arm A native refuted-gold candidates + RETAIN via the OOF all-agree gold-blind pair

Arm A's false-uphold traps are the skill's OWN naturally-occurring refuted-gold claims -- NO authoring by
anyone (D-22; the maintainer declines to author + model-authoring injected a lexical artifact at AUC 0.856).

1. **Harvest the candidates (NO SPEND).** Run `harvestRefutedGoldCandidates({ corpusDir })`
   (`lz-eval-armA-native.mjs`) over the SAME curated corpus of real run dirs. It returns the skill's OWN
   refuted-gold CANDIDATES = the Contested + Unsupported + Low claims (the INVERSE of `isSupportedClaim`;
   ~15/run as a FREE by-product of the ARM-B harvest). Each candidate carries a run-dir-qualified `:`-free
   `uid` (`<run-basename>::<claim-id>`), the claim text, the evidence/sources, the corroboration lower
   bound, the `source_run_dir`, and the WITHIN-RUN source-doc `source_cluster` (lock a -- the cluster key is
   the source-doc/seed WITHIN a run, NOT the run-question, so 4 runs yield MANY independent clusters, never
   collapsing to ~4). The candidate's Contested/Unsupported/Low tag is a SOURCE BUCKET, NEVER the gold.

2. **RETAIN via the FROZEN OOF all-agree gold-blind pair (the FIRST OOF spend boundary -- LZ_SPEND-gated).**
   Run `adjudicateNativeRefutedGold({ candidates, useFrozenTransport: true })` (`lz-eval-armA-native.mjs`).
   It builds ONE `makeBatchedOofProbe` per FROZEN OOF model (gpt-5.5 + gemini-3.1-pro-preview via the Copilot
   CLI transport, `--effort high`), runs the documented `prepare()` PRE-PASS over the FULL candidate set,
   then `runProbeConsensus` per candidate with `expectedEntailment: 'false'` (the SAME strict all-agree
   gold-blind contract the offline screen uses). A candidate is RETAINED as refuted-gold ONLY if BOTH OOF
   models all-agree the evidence does NOT entail the claim (gold = the OOF read of non-entailment, NEVER the
   skill self-tag -- lock b). A NON-unanimous / split / entailed / materially ambiguous read is EXCLUDED from
   the binary denominator + routed to the maintainer (`excludedIndeterminate` + `residue`; Guerdan
   response-set exclusion, D-04). The OOF dispatch spends Copilot Credits via the `callOof` transport and is
   hard-guarded behind `requireSpend('callOof')` (the dry-run + the test suite use a deterministic STUB
   `callModel` -> ZERO spend; only `useFrozenTransport` reaches the real subprocess behind the guard).

3. **FREEZE N_trap the instant the OOF consensus finishes, BEFORE vote 1 (lock d).** The retained count is
   the frozen N_trap. If `retained.length < MIN_TRAP_PAIRS` (30; target 36) -> documented VOID-on-power ->
   SCOPED external arm + RAISE (lock f -- NEVER a floor relaxation). The two arms are NEVER pooled (lock e --
   this seam owns ONLY arm A; the ARM-B controls are consumed READ-ONLY for the matching guards below).

### 0c. Run the construct-validity gates ON THE POST-OOF RETAINED SET (NO SPEND, deterministic)

Run `assembleArmA({ retainedTraps, armBControls })` (`lz-eval-armA-native.mjs`) over the EXACT post-OOF
retained refuted cell + the ARM-B SUPPORTED control cell (READ-ONLY). Under option C gate (d) minimal-edit
is DROPPED (no edits), so the REMAINING construct-validity instruments are RE-RUN on the retained set (NOT
assumed):

- covariate-overlap: the retained refuted cell vs the ARM-B control cell claim-length means must OVERLAP
  within tolerance (`covariateOverlapMet`) -- a model cannot pass by STYLE.
- subject-difficulty: the held-out Claude reference must NOT ace the retained traps (`difficultyFloorMet`;
  the catch-rate is computed at the human-gated spend -- it is an injected flag in the no-spend seam).
- cluster-independence: every retained trap is in a DISTINCT within-run source-doc cluster
  (`clusterIndependenceMet`; lock a) so the per-claim CP denominator does not double-count.
- gate (a): `lexicalOverlapAuc` ON THE RETAINED SET -- the zero-dep lexical-overlap AUC `<= LEXICAL_AUC_CEILING`
  (0.65) over the refuted cell vs the dense-SUPPORTED control cell (`lexicalGatePass`; the truth-value is not
  lexically readable -- the artifact that killed the authored 32-pair seed).
- gate (b): `oneSidedNotEasierGuard({ constructedCell: retainedTraps, harvestedDenseCell: armBControls })`
  -- the retained refuted cell is NOT detectably EASIER than the dense-SUPPORTED controls (one-sided SMD
  `> 0.5` FAILS; `notEasier`).

`assembleArmA` folds them: `constructValid = covariateOverlapMet AND difficultyFloorMet AND
clusterIndependenceMet AND lexicalGatePass AND notEasier` (NO minimal-edit term -- gate (d) DROPPED). It ALSO
reports the realized difficulty `smd` (refuted-gold cell vs SUPPORTED controls) for post-hoc auditability.
A FAIL on EITHER gate (a)/(b) (or a matching floor) -> VOID-on-validity -> a SCOPED external arm + RAISE
(NOT WORKS; lock c -- the floors/gates are load-bearing, NEVER tuned toward N=36). All deterministic, no
model call (the OOF spend already happened at 0b).

### 0d. (Optional telemetry) the scored voter on a probe slice -- RUN-but-NOT-GATE

The scored voter MAY be run over a small slice of the retained set for pipeline/telemetry validation + a
PRE-REGISTERED VOLUNTARY early-stop signal (`>= 1` scored false-uphold on the slice jeopardizes clearing
TAU_FU at the full N -> INVESTIGATE the pipeline / re-pre-register, NEVER edit items). It is EXCLUDED from
the Stage-0 gate (a scored pass on a slice has negligible power vs TAU_FU 0.10, and gating on it would tune
the corpus against the certified system). The Stage-0 gate is the OOF all-agree RETAIN (0b) + the
construct-validity gates on the retained set (0c) -- NOT a scored vote.

## Preconditions (all must hold before Stage 2)

1. Stage 0 passed: arm B feasible (`>= 30`); arm A HARVESTED + OOF-RETAINED to `>= MIN_TRAP_PAIRS` (30;
   target 36) native refuted-gold claims (`adjudicateNativeRefutedGold(...).retained`); the construct-validity
   gates on the POST-OOF retained set `constructValid: true` (`assembleArmA(...)`; covariate + difficulty +
   cluster + lexical-AUC + not-easier). If arm A retains below `MIN_TRAP_PAIRS` -> VOID-on-power; if a gate
   fails -> VOID-on-validity. ANY raise -> STOP (SCOPED external arm + RAISE; Sonnet-default ships).
2. Stage 1 [HUMAN BLOCK] authorized: the user selected `freeze-and-authorize`. The frozen snapshot
   (`stage1FreezeGold` -> `freezeArms`) is recorded, and `eval/lz-eval-live-lock-rule.md` is COMMITTED as
   the freeze evidence (commit ref + the bar-constant freeze timestamp + the realized N_trap + the realized
   retained set recorded in `20-05-LIVE-CERT-RESULT.md` Stage 1) BEFORE any scored vote. N_trap is frozen the
   instant the OOF consensus finishes (lock d); the two arms are separate; no optional stopping.
3. The two frozen arms (`overRefusalControls` + the OOF-RETAINED native refuted-gold arm-A members) and
   their members' `uid`s are fixed. Each member carries the evidence bundle + the claim text. Vote-store
   keys are `:`-free (the run-dir-qualified `::` separator is mapped to a `:`-free form for the Windows vote
   store).

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
all-agree pair, gold-blind, via the Copilot CLI. For arm A, the native refuted-gold members were ALREADY
RETAINED gold-blind at Stage 0 (0b, `adjudicateNativeRefutedGold` -> the OOF all-agree pair reads "does NOT
entail" = gold `refuted`); the gold is the OOF read recorded at 0b, NEVER re-adjudicated here (and NEVER the
skill self-tag -- lock b). For arm B, the harvested SUPPORTED positives' gold is `unrefuted`, OOF-confirmed
via `makeOofAdjudicator`. Both consume the SAME FROZEN OOF pair + the SAME strict all-agree gold-blind
contract -- arm A's adjudication simply happens at Stage 0 (so N_trap freezes before vote 1, lock d), not at
Stage 2.

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
   - the construct-validity verdict on the POST-OOF retained set (covariate-overlap + subject-difficulty +
     cluster-independence + lexical AUC + one-sided not-easier; gate (d) minimal-edit DROPPED) + the realized
     difficulty SMD (refuted-gold cell vs SUPPORTED controls) + the OOF-RETAIN attrition (retained vs
     excludedIndeterminate);
   - the two SEPARATE arm CP results (over-refusal CP-upper vs TAU_OR 0.15; arm-A false-uphold CP-upper vs
     TAU_FU 0.10), NEVER one pooled N;
   - the OOF-vs-maintainer calibration + the residue resolution (the excludedIndeterminate routed to human);
   - the Stage-3 unanimous-uphold audit outcome;
   - the `decisionMatrix` verdict (WORKS iff construct validity passes AND BOTH gates pass; else SCOPED /
     settle-OR-raise);
   - the Haiku-first DEFER decision (ship Sonnet-default + the gated mechanism + guardrails + a
     pre-committed rollback; the flip stays OFF -- D-06);
   - the DISTRIBUTION-SCOPE LIMIT named explicitly (maintainer-curated -- arm B from the skill's own runs,
     arm A the skill's OWN naturally-occurring refuted-gold from real run dirs -- NOT all production, D-05);
   - the owner escaped-error budget ratified.
3. If WORKS does not clear: record SCOPED (construct-validity fail) or settle-OR-raise (a gate breach);
   Sonnet ships; RAISE to the user. The Haiku flip is DEFERRED regardless of the verdict.

## Anti-result-shopping invariants (never violate)

- N_trap is FROZEN the instant the OOF all-agree RETAIN consensus finishes at Stage 0 (lock d), BEFORE vote
  1; the two arms are frozen at Stage 1 (`freezeArms`). The bar constants (`LEXICAL_AUC_CEILING` 0.65,
  `EASIER_DIRECTION_SMD_MARGIN` 0.5, `DIFFICULTY_GUARD_ALPHA` 0.05, `MIN_TRAP_PAIRS` 30) are frozen at the
  lock rule's commit, BEFORE any candidate is OOF-adjudicated or scored. NEVER grow N after a CP read (no
  optional stopping); a post-OOF retained N_trap below `MIN_TRAP_PAIRS` is a documented VOID-on-power ->
  SCOPED external arm + RAISE (lock f), NEVER a floor relaxation. The gates (a)/(b) on the retained set are
  load-bearing, NEVER tuned toward N=36 (lock c).
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
- `eval/lz-eval-armA-native.mjs` -- the AMENDED ARM-A assembly path (`harvestRefutedGoldCandidates` /
  `adjudicateNativeRefutedGold` / `assembleArmA`): harvest the skill's OWN refuted-gold candidates, OOF
  all-agree RETAIN gold-blind, statistical difficulty-match + gates (a)/(b) on the post-OOF retained set.
- `eval/lz-eval-harvest.mjs` -- the run-dir reader + the SUPPORTED predicate (`readRunDirClaims`,
  `listRunDirs`, `isSupportedClaim`; ARM A is the INVERSE of `isSupportedClaim`) + the ARM-B SUPPORTED
  harvest (`harvest` -> `overRefusalControls`).
- `eval/lz-eval-contrastive-authoring.mjs` -- the SUPERSEDED minimal-pair authoring (`authorContrastivePair`,
  `adjudicateContrastivePairs`, `constructValidityVerdict`, `ARM_A_SEED`). It is a frozen no-spend seam and
  is NOT deleted, but it is UNUSED for the live cert (the D-22 amendment replaced minimal-edit ARM A with
  the native refuted-gold path above). `MIN_TRAP_PAIRS` (30) still carries as the arm-A floor.
- `eval/lz-eval-baseline-guard.mjs` -- the construct-validity gate (a) zero-dep lexical-overlap AUC
  (`lexicalOverlapAuc`, `LEXICAL_AUC_CEILING`), RE-RUN on the post-OOF retained set.
- `eval/lz-eval-difficulty-proxy.mjs` -- the construct-validity gate (b) one-sided not-easier difficulty SMD
  guard (`oneSidedNotEasierGuard`, `EASIER_DIRECTION_SMD_MARGIN`, `DIFFICULTY_GUARD_ALPHA`), RE-RUN on the
  post-OOF retained set.
- `eval/lz-eval-live-lock-rule.md` -- the pre-registered acceptance rule (the AMENDMENT header for ARM A,
  the two-arm methodology, the construct-validity gate, the bar constants frozen with a timestamp, the
  frozen N + TAU references).
- `CERTIFY-WORKS-RATIFICATION.md` -- THE AUTHORITY for the amended ARM A (the original cross-family board,
  UNANIMOUS 4/4): the harvest-native-refuted-gold construction + the six pre-spend locks + the amended
  construct-validity gate.
- `20-CONTEXT.md` D-22 (the ARM-A ratification), D-20 (the transport split), D-04 (the OOF + human hybrid /
  Guerdan response-set exclusion), D-05 (the distribution-scope limit), D-06 (the DEFER-the-flip
  discipline), D-07 (the staged blocking spend), D-21 (the certified-WORKS two-arm split-source re-plan).
