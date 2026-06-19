# lz-deep-research LIVE-cert session-driver protocol (Plan 20-05, Stage 2/3 spend)

This is the exact, step-by-step protocol a CLAUDE CODE SESSION follows AT SPEND TIME to drive the staged
live over-refusal + full-WORKS certification of the lz-deep-research verify-voter. It is the operational
companion to the no-spend seams in `eval/lz-eval-live-cert.mjs` and the pre-registered acceptance rule in
`eval/lz-eval-live-lock-rule.md`.

It is authored as part of the NO-SPEND build of Plan 20-05. Following it incurs spend; this document does
NOT itself spend. The spend is the human-authorized BLOCKING checkpoint of Plan 20-05 (Stage 1
`freeze-and-authorize`). Do NOT run any step below until that go is given.

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

`eval/lz-eval-live-cert.mjs` runs as a bare `node` process via `Bash(node:*)`. A bare `node` process has
NO access to the Agent tool. Therefore `callVoter` and `callAuditor` CANNOT be node functions -- they are
a SESSION-DRIVEN PROTOCOL the orchestrating Claude Code session executes by spawning Agent sub-agents and
landing each vote on disk via `persistDualRunVote`. The node engine then SCORES FROM DISK
(`scoreFromPersistedVotes`) with ZERO spend. This decoupling is the whole design: the session does the
(spend) voting; node does the (no-spend) scoring.

The `stage2DualRun` / `stage3UnanimousUpholdAudit` entrypoints in `lz-eval-live-cert.mjs` accept INJECTED
`callVoter` / `callOof` / `callAuditor` for the seam test (stubs, no spend). In a real run the session does
NOT call those node entrypoints to spawn voters -- it follows THIS protocol (the Agent tool lives in the
session, not in node), persists votes to disk, then invokes the node SCORER over the persisted votes.

## Preconditions (all must hold before Stage 2)

1. Stage 0 (D-19) feasibility passed: `stage0FeasibilityProbe` returned `feasible: true` over the curated
   corpus (both arms at-or-above the frozen floor). If it RAISED, STOP -- CHEAP is not certifiable; keep
   STRONG; Sonnet-default ships.
2. Stage 1 [HUMAN BLOCK] authorized: the user selected `freeze-and-authorize`. The frozen snapshot
   (`stage1FreezeGold` -> `freezeArms`) is recorded, and `eval/lz-eval-live-lock-rule.md` is COMMITTED as
   the freeze evidence (commit ref + timestamp recorded in `20-05-LIVE-CERT-RESULT.md` Stage 1) BEFORE any
   CHEAP scored vote. N is frozen; the two arms are separate; no optional stopping.
3. The two frozen arms (`overRefusalControls` + `denseTrapMonitor`) and their members' `uid`s are fixed.
   Each member carries the evidence bundle (the date-filtered survivors) + the claim text.

## Stage 2 -- the dual-run (session-Agent-driven voters + node scoring)

Run each step IN ORDER. The votes land on disk; the node engine scores them.

### 2a. Set the spend authorization

Export `LZ_SPEND=1` in the Bash environment ONLY for the spend window. The node SCORER
(`scoreFromPersistedVotes`) is NO-SPEND and does not require it; but `makeCopilotCallModel` (callOof) and
the guarded stage entrypoints DO. The Claude voter Agent spawns are session-pool spend and are NOT gated by
`LZ_SPEND` (that env var only guards the node-side spend paths) -- the human authorization at Stage 1 is
the voter-spend gate.

### 2b. Cast the CHEAP + STRONG votes via Agent sub-agents (the callVoter protocol)

For EACH frozen member in EACH arm (the over-refusal control arm AND the dense-trap monitor arm), and for
EACH tier (CHEAP = Haiku, STRONG = Sonnet):

1. Spawn the Phase-18 verify-voter Agent sub-agent via the Agent tool, with the PER-INVOCATION model
   override: `model: haiku` for the CHEAP tier, `model: sonnet` for the STRONG tier. (The agent file's
   frontmatter `model:` is INERT -- D-10/R1; tier is controlled ONLY by the per-invocation override.)
   - CHEAP voter agent: `research-verify-voter-haiku` with `model: haiku`.
   - STRONG voter agent: `research-verify-voter-sonnet` with `model: sonnet`.
   - NEVER spawn `research-verify-voter-opus` here (it is EVAL-REFERENCE-ONLY -- D-18).
2. The agent receives the member's evidence bundle + claim, conducts the search-and-stop voting loop, and
   returns a verdict (`unrefuted` | `refuted`) PLUS the required per-vote search trace
   (`{ queries: [...], depth, stop_reason in {decisive-evidence,exhausted,min-not-met} }`).
3. Persist the vote to the CORRECT per-tier, per-arm vote dir via the node helper, keyed by the member uid:
   - run via `Bash(node:*)` a tiny driver that imports `persistDualRunVote` from `lz-eval-live-cert.mjs`
     and writes `{ id: <member.uid>, seat: <haiku|sonnet>, verdict, trace }` to the arm+tier vote dir.
   - Vote-dir layout (gitignored `eval/.cache/p20-live/`):
     - `votes/haiku/ctrl/`  -- CHEAP votes on the over-refusal control arm
     - `votes/haiku/trap/`  -- CHEAP votes on the dense-trap monitor arm
     - `votes/sonnet/ctrl/` -- STRONG votes on the over-refusal control arm
     - `votes/sonnet/trap/` -- STRONG votes on the dense-trap monitor arm
   - `persistDualRunVote` is RESUMABLE: a re-run SKIPS an already-persisted vote (skip-already-done), so a
     credit/account interruption mid-run is recoverable. Re-running 2b after an interruption only casts the
     missing votes.
4. Key the vote by the member uid EXACTLY (the run-dir-qualified `<run-basename>::<clusterId>` from the
   harvest). The node scorer reads votes by member uid; a mis-keyed vote silently mis-scores.

WAVE DISCIPLINE: batch the Agent spawns at <=5 in-flight per turn (foreground; wait for the batch before
the next turn), per the orchestrator's wave-batching contract (D-08). Do NOT background-fan-out.

### 2c. OOF-adjudicate the gold gold-blind (the callOof transport)

The gold for each member (does the evidence ENTAIL the claim?) is decided by the FROZEN out-of-family
all-agree pair, gold-blind, via the Copilot CLI:

1. Build the adjudicator: `makeOofAdjudicator({ seed })` (from `lz-eval-live-cert.mjs`). It composes ONE
   `makeBatchedOofProbe` per frozen OOF model (gpt-5.5 + gemini-3.1-pro-preview), each wired over
   `makeCopilotCallModel({ model })` -- the Copilot CLI subprocess transport (stdin-piped prompt, no `-p`,
   no `--allow-all-tools`, `--model <slug> --effort high`). This spends Copilot AI Credits and is
   hard-guarded behind `requireSpend('callOof')` -- it THROWS unless `LZ_SPEND=1`.
2. Pre-pass: call `adjudicator.prepare(packets)` over the FULL candidate set (both arms' members as gold-
   blind packets) BEFORE the per-packet consensus loop -- the documented PRE-PASS shape (a packet not
   pre-prepared fail-closes to a DROP).
3. Run the all-agree consensus: for each member, collect the per-OOF-model `entails` verdict from each
   probe's resolved map. The pair must AGREE (all-agree) for the OOF gold to stand.
4. Route the residue (the node helper `classifyAdjudicationResidue({ oofProbes, cheapVerdict })`):
   - `oof` (all-agree, no cheap conflict) -> the OOF pair IS the gold (PRIMARY).
   - `oof-split` (the pair disagrees / a probe abstained) -> RESIDUE to the maintainer.
   - `response-set-indeterminate` (a non-boolean / multi-defensible OOF verdict) -> RESIDUE to the
     maintainer; the item LEAVES the binary denominator (Guerdan response-set exclusion, NEVER coerced to a
     forced binary).
   - `cheap-vs-unanimous-oof` (CHEAP contradicts a unanimous OOF) -> RESIDUE to the maintainer.
5. The maintainer (the solo human) resolves ONLY the residue. A small OOF-vs-human CALIBRATION subset (the
   maintainer adjudicates a handful blind, compared to the OOF pair) validates the OOF oracle before it is
   trusted as primary (D-04).
6. Record the gold per member (the gold separates the control arm's `unrefuted` gold from the trap arm's
   `refuted`-on-overreach gold). The OOF transcripts land in gitignored `eval/.cache/p20-live/oof/` -- no
   secret / transcript is written to a tracked path (T-20-20).

### 2d. Score from disk (the node scorer -- NO SPEND)

After 2b (votes persisted) + 2c (gold recorded), the node engine scores from disk with ZERO spend. Run via
`Bash(node:*)` a driver that:

1. Re-derives the frozen Stage-1 snapshot (`freezeArms` over the same two arms -- byte-identical to the
   committed freeze), or loads the recorded frozen `{ nCtrl, nTrap }`.
2. Calls `scoreFromPersistedVotes` PER MODEL over the two SEPARATE arm vote dirs (the two arms NEVER
   pooled):
   - CHEAP (haiku): `scoreFromPersistedVotes({ frozen, ctrlArm, trapArm, ctrlVoteDir: votes/haiku/ctrl,
     trapVoteDir: votes/haiku/trap, model: 'haiku', traceAudit, difficultyFloorMet, covariateOverlapMet,
     evidenceAbsentStratumMet })`.
   - STRONG (sonnet): same with the `votes/sonnet/...` dirs + `model: 'sonnet'`.
   - The over-refusal control arm scores a `refuted` vote as an over-refusal (ESTIMAND B, `overRefusals` /
     `nCtrl`); the dense-trap monitor arm scores an `unrefuted` vote as a false-uphold (ESTIMAND A,
     `falseUpholds` / `nTrap`). The scorer NEVER pools the two arms.
   - `traceAudit` is the per-model audited upheld set (the false-uphold pooled records + their search
     traces, for the W-3 min-not-met / truncated / quota-killed scan) -- its count MUST equal the model's
     false-uphold count.
   - The F5/F7 floor flags (`difficultyFloorMet` / `covariateOverlapMet` / `evidenceAbsentStratumMet`) are
     the harvest's difficulty-stratification + covariate-overlap evidence; the read is confounded without
     them.
3. Each call returns the frozen `certifyModel` verdict (`WORKS` iff BOTH gates pass: ESTIMAND A CP1s
   false-uphold <= TAU_FU 0.10 AND ESTIMAND B CP1s over-refusal <= TAU_OR 0.15, floors met; else
   `DOES-NOT-WORK` / `VOID-*`). The CP estimator is the frozen `clopperPearsonUpperOneSided` -- NEVER
   re-derived; NEVER relax a TAU to fit a realized N (N is the FROZEN Stage-1 count).

## Stage 3 -- the unanimous-uphold audit / load-bearing census (the callAuditor protocol)

Fold in the Stage-3 audit, consuming the deterministic `escalate` flag union from the Plan 20-01 aggregator
(load-bearing claims + Contested + a ~15-20% stable-hash audit sample of unanimous 3/3 upholds):

1. For each claim in the `escalate` union, spawn the audit Agent sub-agent via the Agent tool (a Sonnet
   re-vote, optionally an Opus reference read -- the SESSION-driven callAuditor; NEVER the API, NEVER
   `claude -p`).
2. CENSUS on load-bearing / high-consequence claims (every one audited); SAMPLE elsewhere (the audit
   sample). This is the only mechanism that catches a correlated unanimous (contested-trigger-invisible)
   false-uphold.
3. Persist the audit outcomes; record the audit result + the owner escaped-error budget ratification in
   `20-05-LIVE-CERT-RESULT.md` (now that the audit N binds).

## The decisionMatrix verdict + the recorded result

1. Compose the final verdict: `composeDecision({ haiku, sonnet, opus })` over the three per-model
   `certifyModel` verdicts (the Opus verdict is the EVAL-reference row, not a ship cell). `raiseToUser` is
   ALWAYS true (settle-OR-raise; the Haiku-first flip is DEFERRED regardless -- D-06).
2. Record in `20-05-LIVE-CERT-RESULT.md`:
   - the two SEPARATE arm CP results (over-refusal CP-upper vs TAU_OR 0.15; dense-trap false-uphold
     CP-upper vs TAU_FU 0.10), NEVER one pooled N;
   - the OOF-vs-maintainer calibration + the residue resolution;
   - the Stage-3 unanimous-uphold audit outcome;
   - the `decisionMatrix` verdict (WORKS iff BOTH gates pass, else settle-OR-raise);
   - the Haiku-first DEFER decision (ship Sonnet-default + the gated mechanism + guardrails + a
     pre-committed rollback; the flip stays OFF -- D-06);
   - the DISTRIBUTION-SCOPE LIMIT named explicitly (maintainer-curated, NOT all production -- D-05);
   - the owner escaped-error budget ratified.
3. If WORKS does not clear: record settle-OR-raise (Sonnet ships; RAISE to the user). The Haiku flip is
   DEFERRED regardless of the verdict.

## Anti-result-shopping invariants (never violate)

- N is FROZEN at Stage 1 (before any CHEAP scored vote). NEVER grow N after a CP read (no optional
  stopping). `scoreFromPersistedVotes` fails closed if an arm size disagrees with the frozen `{ nCtrl,
  nTrap }`.
- The two arms are NEVER pooled into one N. They are scored separately and passed separately to
  `certifyModel`.
- The prose TAU references match `EVAL_THRESHOLDS` byte-for-byte. NEVER relax a TAU to fit a realized N.
- The frozen seams (`certifyModel` / `decisionMatrix` / `clopperPearsonUpperOneSided` / `EVAL_THRESHOLDS` /
  `persistVote` / `freezeArms`) are consumed BYTE-IDENTICAL -- never edited.

## Cross-reference

- `eval/lz-eval-live-cert.mjs` -- the seams this protocol drives (`scoreFromPersistedVotes`,
  `scoreArmFromVotes`, `makeCopilotCallModel`, `makeOofAdjudicator`, `classifyAdjudicationResidue`,
  `persistDualRunVote`, `freezeArms`, `stage2DualRun`, `stage3UnanimousUpholdAudit`, `requireSpend`).
- `eval/lz-eval-live-lock-rule.md` -- the pre-registered acceptance rule (the frozen N + TAU references +
  the distribution-scope limit + no optional stopping).
- `eval/lz-eval-oof-batch.mjs` -- the Copilot OOF batch adapter (`makeBatchedOofProbe`) the callOof
  transport composes.
- `20-CONTEXT.md` D-20 (the transport split), D-04 (the OOF + human hybrid), D-05 (the audit / census +
  the distribution-scope limit), D-06 (the DEFER-the-flip discipline), D-07 (the staged blocking spend).
