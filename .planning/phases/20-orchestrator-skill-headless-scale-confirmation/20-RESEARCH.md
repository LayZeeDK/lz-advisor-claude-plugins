# Phase 20: Orchestrator skill + headless scale confirmation - Research

**Researched:** 2026-06-19
**Domain:** Claude Code v2.1.x skill orchestration (packaged SKILL.md) + additive off-model schema/aggregator extension + a LIVE LLM-judge certification harness reusing the frozen eval/ tree + a headless-concurrency build spike
**Confidence:** HIGH (the decisions are locked; the BUILD path reuses already-shipped, already-tested machinery -- this research traces the wiring, it does not discover new stacks)

## Summary

Phase 20 is the milestone-capping phase. Every high-impact DECISION is already locked in `20-CONTEXT.md` (D-01..D-19), settled this session by a cross-family board + an Opus panel + two pre-discussion research passes. This research answers only "what do I need to know to PLAN the BUILD well?" -- it traces the implementation path that realizes the locked decisions and flags genuinely-new risks the decisions did not anticipate. It does NOT re-open any decision.

The phase delivers two coupled workstreams. **(A)** The orchestrator skill `plugins/lz-advisor/skills/lz-deep-research/SKILL.md` (does NOT exist yet -- authored from scratch, mirroring `lz-execute/SKILL.md`) wires the SESSION-DESIGN section-5 pipeline end-to-end: scope-clarify -> decompose ~5 angles -> search wave -> fetch/extract wave -> `node` aggregator -> Opus Gate 1 -> verify wave (3 isolated voters/claim, keyed by cluster id) -> aggregator tally + quote-recheck -> Opus Gate 2 -> assemble the cited report. The skill is a thin dispatcher: it holds only receipts, bounded summaries, and two advisor notes; the off-model aggregator and the worker subagents do the volume. **(B)** The LIVE over-refusal + full-WORKS certification (RE-PLAN-12 live arm) is built in the gitignored `eval/` tree (NEVER ships), reusing `certifyModel`/`decisionMatrix`/`clopperPearsonUpperOneSided`/the OOF batch adapter/the `persistVote` lock-rule discipline -- the over-refusal CP gate MOVES here from the offline read, frozen primitives byte-identical.

**Primary recommendation:** Author the SKILL.md as a phase-structured orchestrator that mirrors `lz-execute`'s frontmatter + progressive-disclosure-into-`references/` conventions, with the wave-batch cap, the aggregate->dispatch->aggregate cluster-id keying, the exactly-2-Opus-gates discipline, and the two report-side joins (citation provenance D-17, `claim_support` D-12) as explicit skill-body steps. Build the additive `load_bearing`/`escalate` extension under the proven anti-drift lockstep (code + schema doc + byte-identity test in one wave). Build the live-cert harness as a NEW `eval/` orchestrator + a small NEW report-claim-harvest adapter that composes the EXISTING certifyModel/OOF/lock-rule machinery -- run it as a staged `LZ_SPEND`-gated blocking checkpoint. Prove the whole skill at headless concurrency with the SC-5 `claude -p --output-format stream-json` spike.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Scope clarify / decompose (PIPE-01/02) | Main session (skill body, Sonnet) | -- | Only the main session can call `AskUserQuestion`; subagents cannot (D-09, pre-discuss finding C). |
| Wave dispatch + concurrency cap (COST-03) | Main session (skill body) | -- | The cap is a behavioral turn-structure instruction; no platform cap exists for skill-spawned agents (D-08, finding H). |
| Search / fetch-extract volume (PIPE-03/04/05) | Worker subagents (own `tools` grant) | run-dir blackboard (disk) | Workers WRITE evidence + return receipts; main session never holds raw text (Phase 19, spike A2). |
| Dedup / rank / tally / quote-recheck / `escalate` (AGG-*, VERIF-05) | Off-model Node aggregator (`scripts/`) | -- | Deterministic, zero model tokens, reproducible from the run dir (D-12/D-14/D-16). |
| Strategic judgment at 2 gates (COST-01) | Opus `advisor` agent (read-only) | -- | Frontier reasoning lands only where it is non-mechanizable; exactly 2 reused-advisor consults (D-18). |
| `claim_support` synthesis + citation join (PIPE-06, VERIF-06) | Main session (skill synthesis step) | `sources/` records (disk) | Assurance 2 + the inline citation are orchestrator-owned; no other component supplies them (D-11/D-12/D-17). |
| Run-id generation + run-dir layout (AGG-05, INTEG-02) | Main session (scope-guard time) | `.gitignore` | The Node aggregator is a pure function of run-dir contents; it never generates the id or a timestamp (D-14). |
| LIVE WORKS certification (ROADMAP SC-6) | `eval/` dev tree (never ships) | OOF + human adjudicators | Reuses the frozen `certifyModel`/CP/OOF machinery; the over-refusal CP gate moves here (D-02..D-07, D-19). |

## Standard Stack

> This is a zero-new-dependency phase. Every "library" below already exists in the repo. The Standard-Stack and Package-Legitimacy sections are therefore short by design: NO new package is installed in either the plugin tree (zero-dep, never ships) or the eval tree (its `jstat@1.9.6` is already pinned + committed). The "version verification" step is N/A -- nothing is fetched.

### Core (all pre-existing, consumed not installed)

| Component | Version | Purpose | Why Standard |
|-----------|---------|---------|--------------|
| `lz-deep-research-aggregate.mjs` | frozen (Phase 16/17/17.1/17.2) | off-model dedup/rank/tally/quote-recheck/ceilings; the spine the orchestrator shells | Already proven by 30+ committed fixture tests; byte-frozen contract |
| `references/lz-deep-research-schema.md` | frozen (Phase 17) | the data contract the skill + workers + aggregator all implement | Single source of truth; D-12 ADDS `load_bearing`/`escalate` additively |
| `agents/research-search-worker.md` / `research-extract-worker.md` | Phase 19 | search + fetch/extract producers the orchestrator dispatches | Least-privilege `tools`; frontmatter `model:` is INERT (D-10/R1) |
| `agents/research-verify-voter-sonnet.md` | Phase 18 | the SHIPPING-default verify voter (Haiku OFF) | Settled default; per-invocation `model` set by orchestrator |
| `agents/advisor.md` | v2.0 (reused) | the Opus read-only judge at Gate 1 + Gate 2 | `[Read, Glob]`, `maxTurns 3`, `effort high`; reused, no new Opus specialist |
| `eval/lz-eval-offline-read.mjs` | RE-PLAN-7/8 (frozen decision path) | `certifyModel` / `decisionMatrix` / `scorePositiveControls` / `persistVote` | The live arm REUSES these; the over-refusal CP gate moves here |
| `eval/lz-eval-aggregate.mjs` (`EVAL_THRESHOLDS`, `clopperPearsonUpperOneSided`) | frozen | TAU_OR 0.15 / TAU_FU 0.10 / N_CTRL_FLOOR 24 / one-sided CP | Byte-identical carry; never re-derived |
| `eval/lz-eval-oof-batch.mjs` (`makeBatchedOofProbe`) | RE-PLAN-8 | the batched OUT-OF-FAMILY gold-screen adapter | Reused unchanged for the live adjudication consensus |
| `eval/lz-eval-lock-rule.md` | pre-registered | the freeze-before-scoring discipline the live arm MUST mirror | Anti-result-shopping; the live lock rule is a NEW sibling doc |

### Supporting (pre-existing references / conventions)

| Component | Purpose | When to Use |
|-----------|---------|-------------|
| `skills/lz-execute/SKILL.md` | the orchestrator-skill structural template (frontmatter, `allowed-tools` form, `${CLAUDE_PLUGIN_ROOT}` refs, Assuming-frames) | mirror its phase structure + progressive disclosure |
| `references/lz-haiku-prompt-engineering.md` | the EVAL-05 research-grounded Haiku prompt | the fairness premise for the gated CHEAP tier (D-06) |
| `references/advisor-timing.md`, `context-packaging.md` | advisor consult packaging conventions | reuse for the two Gate consults' prompt shape |
| `eval/.cache/run-stage1/RUNBOOK.md` + the `LZ_SPEND=1` hard-guard pattern | the proven staged blocking-spend harness pattern (19-04 Task 9) | the live-cert harness mirrors this exactly |

### Alternatives Considered (all rejected by locked decisions -- do NOT re-explore)

| Instead of | Could Use | Why rejected (locked) |
|------------|-----------|----------------------|
| `${CLAUDE_PLUGIN_ROOT}/skills/lz-deep-research/scripts/...mjs` | `${CLAUDE_SKILL_DIR}/...` | `${CLAUDE_SKILL_DIR}` does NOT exist (D-10, finding I) |
| per-invocation `model` on the Agent call | plugin-agent frontmatter `model:` | frontmatter `model:` is SILENTLY IGNORED for plugin agents (D-10/R1, finding F) |
| foreground worker spawns | background fan-out | background auto-denies prompts under `-p` and has no backpressure (D-08, finding F) |
| harvested real-pipeline positives | an external labeled benchmark as the certifying set | off-distribution; benchmark is at most a difficulty cross-check (D-02) |
| Haiku flip as a future one-line change | flipping the tier in Phase 20 | DEFERRED -- ship the gated mechanism + guardrails + rollback only (D-06) |

**Installation:** None. No `npm install` in any tree. The plugin tree stays zero-dependency (asserted by `eval/lz-eval-packaging-boundary.test.mjs` + the aggregator test's plugin-tree walk). The eval tree's only dependency (`jstat@1.9.6`) is already pinned in `eval/package-lock.json` and gitignored at `eval/node_modules/`.

## Package Legitimacy Audit

> Not applicable -- this phase installs NO external packages in either tree. The plugin runtime is zero-dependency by hard contract (a committed test walks `plugins/lz-advisor/` and FAILS on any `package.json`/`node_modules`). The eval tree's single dep `jstat@1.9.6` was legitimacy-gated at Phase 18 behind a `checkpoint:human-verify` (18-02-PLAN) and is already committed; Phase 20 adds none.

| Package | Registry | Disposition |
|---------|----------|-------------|
| (none) | -- | No installs this phase |

**Packages removed due to slopcheck [SLOP] verdict:** none (no installs).
**Packages flagged as suspicious [SUS]:** none (no installs).

## Architecture Patterns

### System Architecture Diagram

```
USER  /lz-advisor:lz-deep-research <question>   (interactive OR claude -p headless)
  |
  v
[Main session = Sonnet skill body : THIN DISPATCHER]
  holds only: run-dir paths/ids/counts, bounded summaries, 2 advisor notes
  never holds: raw source text, raw votes
  |
  |-- Phase 0  scope-guard: gen run-id (YYYYMMDD-HHMMSS-<slug>), mkdir .lz-research/<run-id>/,
  |            AskUserQuestion if interactive ELSE Assuming-frames -> scope.md            (PIPE-02, D-09/D-14)
  |
  |-- Phase 1  decompose ~5 angles (cap ANGLES=5 BEFORE spawn, D-16)
  |       \--consult--> [Opus advisor: GATE 1] scope/angle framing + (continued) ranking cut-line  (COST-01 #1, D-18)
  |
  |-- Phase 2  SEARCH wave: <=5 foreground research-search-worker (model:sonnet) per turn,         (COST-03, D-08)
  |            wait for all receipts; sub-waves of <=5 if angles>5         -> candidates/<wid>.json
  |
  |-- Phase 3  FETCH/EXTRACT wave: <=5 foreground research-extract-worker (model:sonnet), MAX_FETCH=15
  |            (cap BEFORE spawn, D-16)  -> claims/<wid>.json + excerpts/<eid>.txt + sources/<key>.json
  |                                          (extract worker ALSO writes load_bearing: true, D-12b)
  |
  |-- Phase 4  AGGREGATE stage-1: node lz-deep-research-aggregate.mjs <run-dir>                    (off-model)
  |            -> survivors.json (clusterN ids, escalate flags); non-zero exit = RUN FAILURE (D-16)
  |
  |-- Phase 5  VERIFY wave: 3 isolated research-verify-voter-sonnet per claim,
  |            vote files keyed by stage-1 CLUSTER ID (cluster0-0.json ...), <=5 in-flight    (D-15, D-08)
  |            re-vote wave dispatched on every escalate-flagged claim                          (VERIF-05)
  |
  |-- Phase 6  AGGREGATE stage-2: node aggregator again -> tally + quote-recheck (re-reads votes/)
  |
  |       \--consult--> [Opus advisor: GATE 2] synthesis/calibration over survivors.json only (COST-01 #2, D-18)
  |
  '-- Phase 7  SYNTHESIZE report.md: per-claim claim_support (Assurance 2, D-12) + citation join
              from sources/<key>.json (D-17, fail loud on missing) -> the 5-section cited report  (PIPE-06/08/09)
              run dir RETAINED, gitignored (AGG-05, INTEG-02)

  ===========================================================================================
  LIVE-CERT (workstream B) -- gitignored eval/ tree, NEVER ships, staged LZ_SPEND blocking gate
  Stage 0 D-19 harvest feasibility probe  ->  Stage 1 harvest+adjudicate+FREEZE gold  [HUMAN BLOCK]
  ->  Stage 2 dual-run CHEAP+STRONG over frozen artifacts -> certifyModel CP gates
  ->  Stage 3 unanimous-uphold audit / load-bearing census  ->  decisionMatrix verdict (settle-OR-raise)
```

### Recommended Project Structure (the files this phase creates / edits)

```
plugins/lz-advisor/
|-- skills/lz-deep-research/
|   |-- SKILL.md                              # NEW: the orchestrator (mirror lz-execute structure)
|   '-- scripts/
|       |-- lz-deep-research-aggregate.mjs    # EDIT (additive, lockstep): load_bearing carry + escalate emit
|       '-- lz-deep-research-aggregate.test.mjs   # EDIT: + escalate/load_bearing fixtures & byte-identity tests
|-- references/
|   |-- lz-deep-research-schema.md            # EDIT (additive, lockstep): load_bearing + escalate fields
|   '-- lz-deep-research-orchestration.md     # NEW (optional): progressive-disclosure split from SKILL.md
|-- agents/
|   '-- research-extract-worker.md            # EDIT: emit load_bearing: true at claim-extraction (D-12b)
'-- .claude-plugin/plugin.json                # (no change unless version bump)

eval/                                         # NEVER ships (gitignored node_modules + .cache)
|-- lz-eval-live-cert.mjs                      # NEW: the live-cert orchestrator (composes certifyModel/OOF)
|-- lz-eval-live-cert.test.mjs                 # NEW: FILE-form node:test for the deterministic seams
|-- lz-eval-harvest.mjs                        # NEW: harvest SUPPORTED claims from real run dirs -> control set
|-- lz-eval-live-lock-rule.md                  # NEW: the live pre-registered lock rule (sibling of lz-eval-lock-rule.md)
'-- .cache/p20-live/                           # gitignored: harvested claims, votes, adjudications, transcripts

.gitignore                                    # EDIT: add /.lz-research/ (INTEG-02)
```

### Pattern 1: Thin-dispatcher orchestrator skill (mirror lz-execute)
**What:** The SKILL.md is a phase-structured body of imperative instructions. It mirrors `lz-execute`'s conventions: third-person `description` with concrete trigger phrases; `allowed-tools` as documentation; `${CLAUDE_PLUGIN_ROOT}` for every intra-plugin path; `@${CLAUDE_PLUGIN_ROOT}/references/...` for progressive disclosure; phase blocks (`<orient>`, `<consult>`, etc.). The deep-research analogues are `<scope>`, `<decompose>`, `<search>`, `<extract>`, `<aggregate>`, `<verify>`, `<synthesize>`.
**When to use:** This is THE structure -- the planner authors SKILL.md against it.
**Frontmatter (D-10 verbatim form):**
```yaml
---
name: lz-deep-research
description: >
  This skill should be used when the user wants deep, multi-source, fact-checked,
  cited research on a question. Trigger phrases include "deep research on", "research
  this question thoroughly", "fact-check across sources", "lz-advisor deep research",
  and "/lz-advisor:lz-deep-research". It decomposes the question into sub-angles,
  dispatches search and extract worker waves, runs an off-model aggregator, consults
  an Opus advisor at two gates, verifies key claims with isolated skeptic voters, and
  emits a single cited Markdown report with per-claim confidence. This skill should
  NOT be used for planning code, executing a task, or reviewing code -- those are
  lz-plan, lz-execute, and lz-review.
version: 2.1.0
allowed-tools: Agent, Read, Glob, Write, WebSearch, WebFetch, Bash(git:*), Bash(node:*), AskUserQuestion
---
```
Note `allowed-tools` is parsed-not-enforced (finding B); it is documentation/intent. `Bash(node:*)` is the correct command-prefix filter form (NOT `Bash(node "...")`). Workers carry their OWN `tools` grants (Phase 19); the skill cannot widen/narrow them.

### Pattern 2: Wave-batching by turn structure (COST-03 / D-08)
**What:** Per wave, dispatch exactly `N = min(remaining, 5)` Agent calls in ONE assistant turn, in the FOREGROUND, then wait for all N receipts before the next turn. Split a >5 wave into `ceil(count/5)` sequential sub-waves of <=5. Reinforce with a per-wave receipt-count assertion in the body. There is no platform cap for skill-spawned subagents (finding H), and CLAUDE.md concurrency rules are reportedly ignored -- so the cap is a HARD, counted, behavioral instruction, proven by the SC-5 spike (D-13).
**Example (skill-body prose, NOT code):**
```
Dispatch exactly N = min(remaining angles, 5) research-search-worker Agent calls in ONE turn,
each in the foreground, each with model: sonnet. Wait for all N one-line receipts before the next
turn. Assert you received exactly N receipts. If remaining angles > 5, repeat as ceil(count/5)
sequential sub-waves of at most 5; never issue a sixth concurrent Agent call.
```

### Pattern 3: aggregate -> dispatch -> aggregate (cluster-id vote keying, D-15)
**What:** The dispatch ORDER is load-bearing. Run the aggregator stage-1 FIRST (it emits `clusterN` ids). Dispatch the 3 verify voters per claim keyed by the `clusterN` id (vote files `cluster0-0.json`, `cluster0-1.json`, `cluster0-2.json`). Then run the aggregator stage-2 to tally. Voters keyed by claim/member id silently mis-tally merged multi-member clusters -- the member-id fallback (verified in the aggregator's `tally`) works only for single-member clusters.
**Anchor (schema-frozen):** `tally` reads seats `0..VOTES_PER_CLAIM-1` looking up `<clusterId>-<seat>.json` FIRST, then `<memberId>-<seat>.json`. The skill body must instruct voters to name their vote files by the cluster id surfaced in `survivors.json`.

### Pattern 4: Exactly two Opus gates, reused advisor, eval-only voter-opus (D-18 / COST-01)
**What:** Exactly TWO Opus `advisor` consults: Gate 1 (scope/ranking-cut-line) and Gate 2 (synthesis/calibration). Each via the reused `advisor` agent with a per-invocation `model: opus`, over bounded curated JSON only. `research-verify-voter-opus` is EVAL-REFERENCE-ONLY and must NEVER be spawned by SKILL.md. SESSION-DESIGN section 5's "Gate 1b (optional re-order)" must be reconciled INTO the single Gate-1 consult (document it as the same consult continued, not a new spawn) so the sanctioned Opus-spawn count is exactly 2. The SC-5 trace asserts advisor spawns == 2.

### Anti-Patterns to Avoid
- **Spawning `research-verify-voter-opus` from the skill** -- it is eval-reference-only (D-18). The skill spawns the Sonnet voter (the shipping default).
- **Setting tier via worker frontmatter `model:`** -- inert for plugin agents (D-10/R1). Set `model` per Agent-invocation.
- **Background fan-out under `-p`** -- auto-denies prompts, no backpressure (finding F). Foreground only.
- **Re-canonicalizing the source key in the synthesis step** -- the canonical-URL recipe is byte-frozen across both worker prompts + the eval `canonicalizeUrl`; the aggregator counts the key it is given (D-17). The synthesis READS `sources/<key>.json`; it never recomputes the key.
- **Silently consuming a missing `survivors.json`** -- a non-zero aggregator exit (ContractError, exit 2) is a RUN FAILURE; the report stage must treat it as such (D-16).
- **Faking a production canary** -- there is no production traffic; the honest substitute is the offline dual-run + audit + opt-in dogfood (D-05). Name the limit in the report.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| dedup / rank / tally / quote-recheck / ceilings | a new reducer in the skill | the frozen `lz-deep-research-aggregate.mjs` | byte-frozen, 30+ tests, zero model tokens |
| `escalate` decision | model-side judgment | a deterministic flag computed IN the aggregator (D-12) | reproducible from the run dir; no `Math.random` |
| Clopper-Pearson upper bound | a Wald / bootstrap CI | `clopperPearsonUpperOneSided` (jstat-backed, frozen) | hand-rolled CIs are forbidden (lock-rule D-07) |
| out-of-family gold adjudication | a fresh consensus loop | `makeBatchedOofProbe` + `runProbeConsensus` (reused) | already batched, already tested, frozen identity |
| pre-registration / freeze-before-scoring | ad-hoc thresholds | `eval/lz-eval-lock-rule.md` discipline + a NEW live sibling | anti-result-shopping; the discipline is the validity |
| audit-sample selection | `Math.random()` | a STABLE HASH of the cluster id (D-12c) | reproducible from the run dir; auditable |
| run-id generation | the Node aggregator | the session at scope-guard time (D-14) | the aggregator stays a pure fn of run-dir contents |

**Key insight:** Phase 20 is almost entirely WIRING + ADDITIVE EXTENSION + REUSE. The genuinely-new code is small: the SKILL.md prose, the `load_bearing`/`escalate` additive extension (a few aggregator functions + matching tests), the live-cert orchestrator (composing existing eval seams), and a small harvest adapter. The temptation to re-implement reduction logic in the skill body is the dominant failure mode -- resist it; shell the aggregator.

## The additive schema + aggregator + extract-worker extension (D-12) -- BUILD PATH

This is the highest-risk net-new CODE in workstream A. It must follow the PROVEN anti-drift lockstep discipline already used in Phases 16/17/17.1/17.2: **the aggregator source is authoritative; the schema doc COPIES field names/enums byte-for-byte; a dev-time test asserts they match; any change updates code AND doc in lockstep.**

**What changes (all ADDITIVE -- no frozen shape changes):**

1. **Extract worker (`research-extract-worker.md`)** -- emit `load_bearing: true` on a claim at extraction time when the claim is central/high-consequence (the worker's judgment, prompt-defined). Additive field on the existing `claims[]` entry. The schema's "consumers MUST ignore unknown fields" rule already permits it; this promotes it to a defined optional field.

2. **`mergeClusters`** -- carry `load_bearing` through into the cluster. A cluster is `load_bearing: true` if ANY member carries it (OR-fold). This is a small additive line in the existing member-spread + a cluster-level field, analogous to the existing `sources` Set.

3. **A new per-claim `escalate` flag** emitted on the survivor record on the UNION of:
   - (a) `confidence === 'Contested'` (already computed by `tally`);
   - (b) `load_bearing === true` (carried in step 2);
   - (c) a ~15-20% audit sample of unanimous (3/3 unrefuted) upholds, selected by a STABLE HASH of the cluster id (no `Math.random`; reproducible). The aggregator already has a deterministic-hash precedent pattern is NOT present in the runtime aggregator, so this is genuinely new -- author a tiny pure `stableHashFraction(clusterId)` helper (FNV-1a is already used in the eval `oof-batch` `hash32`; mirror that style, ASCII-only, zero-dep) and select when `hash32(clusterId) / 2^32 < AUDIT_SAMPLE_RATE`.

4. **`escalate` is emitted ON the survivor record** (additive field, after `confidence`). The orchestrator reads it and dispatches a Sonnet re-vote wave on every flagged claim (VERIF-05). The aggregator emits the flag; the orchestrator acts on it.

5. **`claim_support` (Assurance 2)** is produced by the orchestrator's SYNTHESIS step -- NOT the aggregator (the schema already states this; the survivor record never carries it, the report claim record does). No aggregator change for this; it is a skill-body step.

**Fixtures/tests that MUST accompany it (mirror the existing test discipline):**

- A fixture run-dir where a claim has `load_bearing: true` -> assert the survivor's `escalate === true` regardless of confidence.
- A Contested-split fixture (reuse `contested-split` shape) -> assert `escalate === true` via branch (a).
- A 3/3-unrefuted unanimous-uphold fixture whose cluster id hashes INTO the audit sample -> assert `escalate === true` via branch (c); and a sibling whose id hashes OUT -> assert `escalate === false` (a discriminating pair, not a tautology -- mirror the SC5-3 precondition-guard discipline).
- A determinism test: the same run-dir produces byte-identical `escalate` flags across two `aggregate()` calls (the audit sample must be hash-stable, never random) -- extend the existing `TEST-2b`/`SC-1` determinism tests.
- The anti-drift byte-identity test: a new `AUDIT_SAMPLE_RATE` constant (within 15-20%, planner's discretion, e.g. `0.15`) on the frozen `CEILINGS` or a sibling frozen object, asserted `Object.isFrozen` + value-pinned, with the schema doc quoting it byte-for-byte (mirror `SC5-5`'s `CEILINGS` assertions).
- Run via the FILE form ONLY: `node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs` (host quirk: the dir form spuriously exits 1).

**Lockstep ordering (one wave, do NOT split across waves):** edit the aggregator + add the tests + edit the schema doc + (if the recipe is mirrored into the worker prompt) edit the extract-worker prompt -- all in lockstep, with the byte-identity test as the gate. This mirrors the schema reference's stated discipline: "Any future change to a frozen shape MUST update the code AND this reference in lockstep."

## The LIVE certification harness (D-02..D-07, D-19) -- BUILD PATH

**Where it lives:** the gitignored repo-level `eval/` tree (its own `package.json`, its own `node_modules`, NEVER ships -- enforced by `lz-eval-packaging-boundary.test.mjs` + the aggregator's plugin-tree walk). The over-refusal CP gate MOVES here from the offline read; the frozen primitives carry byte-identical.

**What is REUSED (no new copy):**

| Reused asset | Role in the live arm |
|--------------|----------------------|
| `certifyModel({...})` (offline-read) | the ABSOLUTE per-model verdict: ESTIMAND A false-uphold (CP1s <= TAU_FU 0.10), ESTIMAND B over-refusal (CP1s <= TAU_OR 0.15). WORKS = both pass + floors met. |
| `decisionMatrix({haiku, sonnet, opus})` | the Haiku x Sonnet ship cell + the Opus reference row + `raiseToUser: true` (settle-OR-raise) |
| `clopperPearsonUpperOneSided`, `EVAL_THRESHOLDS` | the frozen CP estimator + the 4 thresholds/floors -- byte-identical |
| `makeBatchedOofProbe` + `runProbeConsensus` | the OUT-OF-FAMILY all-agree gold adjudicator (GPT-5.5 + Gemini), batched |
| `scorePositiveControls` | the over-refusal / always-refute-artifact detector over gold=unrefuted controls |
| `persistVote` + `STOP_REASONS` + skip-already-done | resumable vote persistence with the required search trace |
| `eval/lz-eval-lock-rule.md` discipline + the `LZ_SPEND=1` hard-guard + the RUNBOOK pattern | the pre-registration + staged blocking-spend mechanics (19-04 Task 9) |

**What is genuinely NEW (must be authored):**

1. **`lz-eval-harvest.mjs`** -- harvest SUPPORTED claims from REAL run dirs (D-02 "run the skill on itself"). It reads `survivors.json` + the report claim records from a curated set of diverse real research questions, selects the SUPPORTED-confidence claims, and difficulty-STRATIFIES to OVERSAMPLE dense/contested-evidence claims (the band where correlated cheap-tier errors live). This is the live analog of the offline `lz-eval-control-source.mjs`/`survival-probe` loaders, but the source is the pipeline's OWN output, not FEVER/VitaminC.
2. **`lz-eval-live-cert.mjs`** -- the orchestrator that: runs the D-19 feasibility probe; freezes the gold control set + the dense-trap monitor set; drives the dual-run (CHEAP vs STRONG voters) over the FROZEN bundles; feeds the OOF+human hybrid adjudication (D-04); and calls `certifyModel`/`decisionMatrix` to produce the verdict. It COMPOSES the reused seams; it owns only the staging + the harvest wiring.
3. **`lz-eval-live-lock-rule.md`** -- a NEW pre-registered sibling of `lz-eval-lock-rule.md`: the live N targets (N_ctrl = 40, floor 30; N_trap ~34-40, floor 30 -- the two arms NEVER pooled, D-03), the 0.15/0.10 ceilings (byte-identical TAU references, NOT new thresholds -- D-03 "run-config N targets, not threshold changes"), the CP estimator, the acceptance rule, FROZEN BEFORE any CHEAP scored vote. The N=24 knife-edge arithmetic (0/24 clears 0.15 only at exactly zero; 1/24 -> ~0.183 FAILS; 0/24 -> ~0.117 can FAIL the 0.10 gate) is the decisive reason the targets sit ABOVE the frozen floor.
4. **The OOF-vs-human calibration subset** -- a small set the maintainer adjudicates blind, compared to the OOF pair, validating the OOF oracle before it is trusted as primary (D-04). The solo maintainer resolves ONLY the residue: OOF-split items, response-set-indeterminate items (Guerdan response-set elicitation -- multi-defensible items are EXCLUDED from the binary denominator, NOT coerced), or items where CHEAP contradicts a unanimous OOF verdict.
5. **The dual-run shadow + unanimous-uphold audit (D-05)** -- (i) the maintainer-driven offline dual-run of CHEAP vs STRONG over the SAME frozen bundles, gold-blind-adjudicated, scored on the two CP gates; (ii) the load-bearing-claim auto-escalation + the audit of CHEAP unanimous upholds (census on load-bearing, sample elsewhere) -- the only mechanisms that catch a unanimous false-uphold; (iii) the opt-in dogfood beta as the closest honest "canary".

**The staged blocking spend (D-07), mirroring 19-04 Task 9 + the RUNBOOK `LZ_SPEND` gate:**
- **Stage 0 (D-19):** the harvest feasibility probe -- confirm the shipping skill can emit >= 30 difficulty-representative SUPPORTED claims in the dense/contested band. If it cannot, the over-refusal arm is not constructible at the target N -> CHEAP is not certifiable -> keep STRONG indefinitely, RAISE to the user. Sonnet-default ships regardless.
- **Stage 1 [HUMAN BLOCK]:** harvest STRONG outputs + OOF/human adjudicate + FREEZE the gold control set (N_ctrl) + the dense-trap set + the acceptance rule BEFORE any CHEAP scored vote.
- **Stage 2:** dual-run CHEAP + STRONG over the FROZEN artifacts in ONE scored pass; compute CP via `certifyModel`.
- **Stage 3:** the unanimous-uphold audit / load-bearing census folded in.
- NO optional-stopping / add-until-pass (N is frozen in advance). A cheap pilot may validate harness/plumbing before the main spend. Every model-spend stage is hard-guarded by `LZ_SPEND=1` (the dry-run runs stubs only).

**Settle-OR-raise (D-01):** the Sonnet-default voter SHIPS regardless of the live-cert outcome. If WORKS cannot be cleared, RAISE to the user; Sonnet-default ships. The Haiku-first flip is DEFERRED (D-06) -- Phase 20 ships only the gated mechanism + guardrails + rollback.

## The SC-5 headless scale spike (D-13) -- BUILD PATH

A dedicated build-time spike running the PACKAGED skill headless. Resolves research U1/U2/U4/U5.

**The exact invocation (per the project's claude -p convention + CLAUDE.md headless gotchas):**
```bash
claude --model sonnet --permission-mode auto \
  --plugin-dir plugins/lz-advisor \
  -p "/lz-advisor:lz-deep-research <fixed research question>" \
  --verbose --output-format stream-json
```
- `--permission-mode auto` is REQUIRED -- `acceptEdits` denies the skill launch and blocks non-git Bash (`node`); the auto-mode classifier gates each worker `Write` and the `node` aggregator call (finding F + the CLAUDE.md `claude -p` gotchas).
- NEVER put an `@file` mention in the `-p` prompt (breaks slash-command recognition); reference any input by prose path.
- Disable the marketplace `lz-advisor` in the spike's cwd (the committed `.claude/settings.json` already does this for this repo) so the working-tree `--plugin-dir` build is the one under test.
- Nested `claude -p` draws on the same 5-hour session pool -- budget across reset windows.

**Un-fakeable acceptance, parsed from the stream-json trace:**
1. max concurrent in-flight Agent calls **<= 5 at every point** across **>= 3 sequential waves** (search, extract, verify) -- count overlapping Agent tool_use start/result events;
2. each wave's next-batch spawn timestamp is AFTER all prior-batch result timestamps (the foreground/wait boundary held);
3. host stable: exit 0, `survivors.json` on disk, an independent `node` aggregator re-run reproduces the summary line;
4. zero worker `Write` failures (U5: the classifier permits worker `Write` to `.lz-research/` and `node <abs-path>`);
5. advisor spawns **== 2** (the COST-01/D-18 two-gates assertion).

The advisor subagent's own tool-use (turns / glob-vs-synthesis) is captured in the JSONL session log at `~/.claude/projects/<cwd-hash>/<session>/subagents/agent-<id>.jsonl` (parent stream-json hides nested tool-use -- this is the project's documented Test #5 threshold caveat). Grade from `--output-format stream-json` captured to a file.

## Wiring INTEG-01 / INTEG-02 / AGG-05 -- BUILD PATH

- **INTEG-01 (discoverability):** the skill is auto-discovered at `skills/lz-deep-research/SKILL.md` and surfaces as `lz-advisor:lz-deep-research`; the `lz-` directory prefix de-shadows the Claude Code built-in `/deep-research` (same de-shadow mechanism that lets `lz-plan`/`lz-execute` co-exist with built-in `/plan`/`/review`). **Headless verification:** a `claude -p ... --output-format stream-json` init probe lists `slash_commands` -- assert `lz-advisor:lz-deep-research` is present (per the project's "verify via stream-json init slash_commands, NOT model self-report" convention). Bare-form collision (`/deep-research`) must be checked in the INTERACTIVE picker, not headless (the headless qualified probe cannot catch bare-form collisions -- MEMORY note).
- **INTEG-02 (gitignore):** add `/.lz-research/` to the repo `.gitignore` (alongside the existing `/eval/.cache/`, `/plans/` entries). Verify with `git check-ignore .lz-research/<run-id>/scope.md`.
- **AGG-05 (retain run dir):** the run dir is RETAINED after the report as the audit trail -- gitignored, NOT deleted (retention and gitignore are complementary, D-14). The skill body must NOT clean up the run dir on completion. Verify the run dir (claims/, excerpts/, sources/, votes/, survivors.json, scope.md, report.md) survives a completed run.

## The Haiku-first gated mechanism + guardrails + rollback (D-06) -- BUILD PATH

Ship the STRONG (Sonnet) default + the GATED CHEAP mechanism + the guardrails + a pre-committed rollback. The flip itself is DEFERRED. Concrete representation:
- The Haiku voter already exists (`research-verify-voter-haiku.md`, OFF by default, ships disabled until the gating eval clears -- frontmatter/body already say so). Phase 20 does NOT enable it.
- Represent the tier choice as a **config flag** the SKILL.md reads (e.g. a documented `haiku_first` default-OFF constant in the skill body / a `references/` note), so the flip is a future ONE-LINE change at an explicit human checkpoint. The guardrails (load-bearing escalation, unanimous-uphold audit, the escalate flag's audit sample) are built into the aggregator's `escalate` logic (D-12) and ship ON regardless of the flag.
- "Rollback" degenerates to "the flag stays OFF" -- free and real, since STRONG ships regardless (D-05). The optional "CHEAP-with-STRONG-backstop for NON-load-bearing claims only" tier is available to the planner but still gated behind the same certification, never pre-cert.

## Runtime State Inventory

> Phase 20 is greenfield for the SKILL.md + the live-cert harness, but it ADDS a run-dir convention and a gitignore entry. Not a rename/refactor phase, so a full inventory is not required; the relevant runtime-state items are surfaced inline above (INTEG-02 gitignore; AGG-05 retention; the run-dir layout D-14). No stored data, OS-registered state, or secrets are renamed. **Build artifacts:** none stale (the SKILL.md is new; the aggregator edit is additive and re-tested in place). **Verified:** the SKILL.md does not yet exist (`scripts/` is the only child of `skills/lz-deep-research/`).

## Common Pitfalls

### Pitfall 1: Re-implementing reduction in the skill body
**What goes wrong:** the skill tallies votes or merges claims in-context instead of shelling the aggregator.
**Why it happens:** the orchestrator "has" the receipts and it feels natural to reason over them.
**How to avoid:** the skill body NEVER reasons over raw data between waves -- it shells `node lz-deep-research-aggregate.mjs <run-dir>` and reads only the bounded summary + `survivors.json` (SESSION-DESIGN section 6). The aggregator is the single reducer.
**Warning signs:** the skill body contains tally arithmetic, Jaccard, or confidence-enum logic.

### Pitfall 2: Vote files keyed by claim/member id, not cluster id
**What goes wrong:** merged multi-member clusters silently mis-tally (the member-id fallback only works for single-member clusters).
**Why it happens:** the worker "knows" the claim id, not the cluster id assigned downstream.
**How to avoid:** dispatch order is aggregate-stage-1 -> read `clusterN` ids from `survivors.json` -> dispatch voters keyed by `clusterN` -> aggregate-stage-2 (D-15). The skill packages the cluster id into each voter prompt.
**Warning signs:** vote files named by claim id; a Contested claim that should escalate shows a clean tally.

### Pitfall 3: A third Opus spawn (or the eval-only voter-opus) sneaks in
**What goes wrong:** the COST-01 two-gates discipline breaks; the SC-5 trace asserts advisor spawns == 2.
**Why it happens:** SESSION-DESIGN's "Gate 1b (optional re-order)" reads like a third consult.
**How to avoid:** reconcile Gate-1b INTO the single Gate-1 consult (same consult continued, not a new spawn, D-18). Never spawn `research-verify-voter-opus` from the skill.
**Warning signs:** stream-json shows 3 advisor Agent calls, or any `research-verify-voter-opus` spawn.

### Pitfall 4: The audit sample uses Math.random (non-reproducible)
**What goes wrong:** the ~15-20% unanimous-uphold audit sample changes run-to-run; the run dir is no longer reproducible.
**Why it happens:** "random sample" reads as `Math.random()`.
**How to avoid:** select by a STABLE HASH of the cluster id (D-12c). Mirror the eval `oof-batch` `hash32` FNV-1a style; the aggregator stays a pure function of run-dir contents (D-14). Lock with a determinism test.
**Warning signs:** the `escalate` flag differs across two `aggregate()` calls on the same run-dir.

### Pitfall 5: Optional-stopping / add-until-pass in the live-cert
**What goes wrong:** the live verdict is result-shopped; the pre-registration is void.
**Why it happens:** the natural urge to add a few more controls when the CI is borderline.
**How to avoid:** FREEZE N (N_ctrl 40 floor 30; N_trap 34-40 floor 30) + the acceptance rule BEFORE any CHEAP scored vote (D-07). Mirror `lz-eval-lock-rule.md`'s zero-votes-window discipline. The two arms are NEVER pooled into one N (D-03).
**Warning signs:** N grows after the first CP read; a TAU is relaxed to fit a realized N.

### Pitfall 6: Treating the live verdict as "production-safe" or auto-flipping Haiku
**What goes wrong:** a WORKS verdict is read as a ship green-light for the Haiku flip.
**Why it happens:** "WORKS" sounds terminal.
**How to avoid:** the flip is DEFERRED to a future human checkpoint (D-06); Phase 20 ships only the gated mechanism. The verdict certifies on the maintainer-curated distribution, not "all production" -- name the limit in the report (D-05). `decisionMatrix` already sets `raiseToUser: true` always.
**Warning signs:** the plan enables the Haiku flag; the report omits the distribution-scope caveat.

## Code Examples

### The aggregator CLI invocation the skill shells (frozen contract)
```bash
# Source: plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs (CLI guard)
node "${CLAUDE_PLUGIN_ROOT}/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs" "<run-dir>"
# exit 0 -> writes survivors.json + prints the 4-line summary; exit 2 -> ContractError (RUN FAILURE, D-16)
```

### The certifyModel call the live arm makes (reused, frozen)
```javascript
// Source: eval/lz-eval-offline-read.mjs (certifyModel; CONSUMED unchanged in the live arm)
const sonnet = certifyModel({
  model: 'sonnet',
  falseUpholds, nTrap,            // ESTIMAND A over the dense-trap monitor set
  overRefusals, nCtrl,            // ESTIMAND B over the harvested SUPPORTED controls (the OVER-REFUSAL arm MOVED here)
  traceAudit,                     // { upheldRecords:[...], anyUpholdOnTruncatedOrQuotaKilled }
  difficultyFloorMet, covariateOverlapMet, evidenceAbsentStratumMet,
});
// WORKS iff estimandA.pass (CP1s <= TAU_FU 0.10) AND estimandB.pass (CP1s <= TAU_OR 0.15) AND floors met.
const matrix = decisionMatrix({ haiku, sonnet, opus }); // raiseToUser is ALWAYS true (settle-OR-raise)
```

### The staged-spend hard guard (reused pattern)
```javascript
// Source: eval/.cache/run-stage1/RUNBOOK.md + transport hard-guard pattern
// every model-spend stage THROWS unless LZ_SPEND=1; the dry-run runs stubs only (no spend).
if (process.env.LZ_SPEND !== '1') { throw new Error('refusing to spend: set LZ_SPEND=1'); }
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| offline synthetic over-refusal arm | LIVE over-refusal CP gate over harvested adjudicated positives | RE-PLAN-12 (2026-06-19) | the over-refusal arm + the CP gate MOVE to Phase 20 |
| relative Haiku-MINUS-Sonnet delta | ABSOLUTE per-model `certifyModel` verdict | RE-PLAN-7 | the live arm uses certifyModel, not readDelta |
| `bin/` for the aggregator | `skills/lz-deep-research/scripts/` | 2026-06-15 correction | `bin/` is user-facing PATH; the aggregator is skill-internal |
| `${CLAUDE_SKILL_DIR}` (assumed) | `${CLAUDE_PLUGIN_ROOT}/skills/.../scripts/` | pre-discuss research | `${CLAUDE_SKILL_DIR}` does not exist |

**Deprecated/outdated:**
- The SESSION-DESIGN "Gate 1b" as a separate consult: reconcile into Gate 1 (D-18).
- The "background depth-5 cap, foreground any depth" framing: the cap is depth-5 for BOTH modes (finding D) -- not load-bearing here (the orchestrator is depth-1, workers depth-2).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `AUDIT_SAMPLE_RATE` concrete value within 15-20% (e.g. 0.15) is the planner's discretion within the frozen band | additive extension D-12c | low -- D-12 explicitly grants this latitude; any value in [0.15,0.20] is conformant |
| A2 | the `escalate` flag is best emitted ON the survivor record (additive field) vs a sidecar file | additive extension D-12 | low -- additive field matches the existing survivor-record extension pattern; a sidecar is an alternative if a frozen-shape concern arises |
| A3 | the SC-5 spike's stream-json trace exposes enough timing/concurrency detail to prove max-in-flight<=5 + advisor==2 from the PARENT trace (nested tool-use is in the per-agent JSONL) | SC-5 spike | medium -- the project's Test #5 caveat notes nested tool-use hides from the parent stream-json; the per-agent JSONL is the fallback. The spike must capture BOTH. |
| A4 | the live-cert harvest can reach >= 30 dense/contested SUPPORTED claims (D-19 feasibility) | live-cert | HIGH -- this is the board's #1 named uncertainty; D-19 makes it a pre-flight probe, not a blocker. If it fails: RAISE, keep STRONG, Sonnet ships. |
| A5 | `lz-haiku-prompt-engineering.md` + the existing Haiku voter agent suffice as the gated CHEAP mechanism (no new Haiku agent authored in Phase 20) | D-06 | low -- the agent exists and ships OFF; Phase 20 wires the flag, not a new agent |

**These are flagged for the planner/discuss-phase.** None re-opens a locked decision; each is a BUILD-detail latitude the locked decisions explicitly grant (Claude's Discretion in CONTEXT.md) or a known empirical unknown (D-19).

## Risks the plan must address (NEW risks the locked decisions did not fully anticipate)

1. **The skill body holds NO mechanism to enforce the exact sequencing the aggregator's vote keying requires** beyond prose. If a worker is told the claim id instead of the cluster id, the mis-tally is SILENT (the member-id fallback succeeds for single-member clusters and fails invisibly for merged ones, D-15). MITIGATION: the SC-5 spike + a worker-contract check should verify at least one MERGED multi-member cluster's votes are keyed by cluster id and tally correctly -- a single-member spike question would not exercise this (mirror the Phase-17 "fixtures must discriminate" lesson).
2. **The additive `escalate`/`load_bearing` extension touches the FROZEN aggregator** -- the highest-risk edit in workstream A. The frozen survivor-record field SET is load-bearing (Phase 17 froze it; Phase 18/20 consume it). Adding `escalate`/`load_bearing` is additive, but the byte-identity test (`SC5-5`-style `CEILINGS` frozen-object assertions) and the schema-doc lockstep MUST land in the SAME wave, or a drift between code and doc reopens the contract. MITIGATION: treat the extension as one atomic lockstep wave; do not let the SKILL.md authoring wave depend on a half-landed schema change.
3. **The live-cert harvest distribution is maintainer-curated, not "all production"** (there is no production traffic). A WORKS verdict over-generalizes if the report does not name this limit (D-05). MITIGATION: the live-cert report MUST state the distribution scope; `decisionMatrix.framing` ('clears-the-closed-book-SCREEN' analog) + `raiseToUser: true` already encode the non-terminal framing -- the plan should surface it in the artifact.
4. **`AskUserQuestion` has no headless-detection signal** (finding C). Under `-p` the call simply has no answer path; the skill must fall back to Assuming-frames WITHOUT a detect-signal it can branch on (D-09). MITIGATION: the skill ATTEMPTS the question and, on no-answer, proceeds on stated assumptions surfaced as `Assuming <X> (unverified)` frames in `scope.md` + the report header -- it must NOT block waiting for an answer that never comes. The SC-5 spike (which IS headless) confirms the no-answer path does not stall.
5. **`${CLAUDE_PLUGIN_ROOT}` non-expansion in some markdown contexts** (finding U4 / issue #9354). If the aggregator path comes through empty under `-p`, the `node` Bash call fails. MITIGATION: the SC-5 spike verifies the aggregator path resolves non-empty in a real `-p` run (the aggregator CLI fails loudly on a missing run-dir, exit 2 -- so an empty path is caught, not silent).
6. **The SC-5 spike spends real session budget on a full pipeline run** (search + extract + verify waves + 2 Opus gates over a real question). It is not free. MITIGATION: pick a FIXED, modest-scope research question; budget across the 5-hour reset window; the spike is a build-time cost the plan should schedule deliberately, not assume incidental.

## Open Questions

1. **The exact curated research-question set for the live harvest (D-02).**
   - What we know: harvest from the shipping skill's OWN outputs on diverse real questions; oversample dense/contested SUPPORTED claims.
   - What's unclear: which specific questions yield >= 30 dense/contested positives (D-19 / A4).
   - Recommendation: the D-19 feasibility probe selects/validates the set empirically before the Stage-1 freeze; do not pre-commit the question list in the plan beyond "diverse, dense-evidence-oversampling."
2. **Whether the SC-5 spike can run the FULL pipeline within one session budget, or needs a reduced-fan-out variant first.**
   - What we know: A2 proved n=2; SC-5 needs >= 3 waves with <=5 in-flight.
   - What's unclear: total token/turn cost of a real full run.
   - Recommendation: a cheap plumbing pre-spike (small question, observe wave structure) before the full acceptance spike; both use the same trace-parse acceptance.
3. **The progressive-disclosure split: how much of the SKILL.md body moves to `references/`.**
   - What we know: skill-creator ideal is <500 lines; lz-execute pushes timing/packaging into `references/`.
   - What's unclear: the exact split point for this 7-phase orchestrator.
   - Recommendation: keep the phase skeleton + the load-bearing caps/keying inline; push the report micro-format, the canonical-URL recipe reminder, and the advisor-consult packaging into `references/lz-deep-research-orchestration.md` (no cross-skill body references -- shared knowledge lives in `references/`).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js (stdlib) | aggregator + eval scripts | yes | v24.x (FNM) | -- |
| `claude` CLI (`-p`, `--output-format stream-json`, `--plugin-dir`) | SC-5 spike + headless verification | yes | v2.1.x | -- |
| `copilot` CLI (gpt-5.5, gemini-3.1-pro-preview) | OOF gold adjudication (live arm) | yes (metered AI Credits) | -- | human-only adjudication on the residue if Credits exhausted (D-04 already routes residue to human) |
| `jstat@1.9.6` (eval only) | `clopperPearsonUpperOneSided` | yes (committed, gitignored node_modules) | 1.9.6 | -- (restore via `cd eval && npm install`) |
| Both Sonnet 4.6 + Opus 4.6 model access | the pipeline (Sonnet workers + Opus gates) | yes (CLAUDE.md project constraint) | -- | -- |

**Missing dependencies with no fallback:** none.
**Missing dependencies with fallback:** OOF adjudication via Copilot is metered AI Credits (per CLAUDE.md, a human-confirmed spend); the D-04 hybrid already routes the residue to the human maintainer, so a Credits constraint degrades to more human adjudication, not a blocker.

## Validation Architecture

> `workflow.nyquist_validation: true` in `.planning/config.json` -- this section is REQUIRED. It drives VALIDATION.md.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | `node:test` + `node:assert/strict` (stdlib; zero-dep) |
| Config file | none -- direct `node --test <file>` invocation (no runner config) |
| Quick run command (aggregator) | `node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs` |
| Quick run command (eval tree) | `node --test eval/lz-eval-live-cert.test.mjs` (+ existing offline-read/oof-batch suites) |
| Full suite command | enumerate every `*.test.mjs` by FILE form (host quirk: `node --test <dir>` spuriously exits 1) -- the existing CI `ci.yml` glob-discovery job is authoritative |
| Headless skill verification | `claude --model sonnet --permission-mode auto --plugin-dir plugins/lz-advisor -p "/lz-advisor:lz-deep-research <q>" --verbose --output-format stream-json` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command / Method | File Exists? |
|--------|----------|-----------|----------------------------|-------------|
| PIPE-01 | decompose into ~5 sub-angles | behavioral (headless) | SC-5 stream-json trace: ~5 search workers in wave 1; ANGLES cap == 5 | Wave 0 (spike harness) |
| PIPE-02 | scope-clarify (interactive) + Assuming-frames (headless) | behavioral (headless) | SC-5 trace: `-p` run does NOT stall on AskUserQuestion; `scope.md` carries Assuming-frames | Wave 0 |
| PIPE-06 | every claim cited inline to its source | unit + behavioral | citation-join: report cites from `sources/<key>.json`; fail-loud on missing (D-17) -- a fixture + the headless report | Wave 0 |
| PIPE-08 | Contested first-class, not averaged away | unit | reuse `contested-split` fixture -> survivor `confidence: Contested`; report has a Contested section | exists (aggregator) + Wave 0 (report) |
| PIPE-09 | structured written report deliverable | behavioral (headless) | SC-5 trace: `report.md` written to run dir with all 5 sections (D-11) | Wave 0 |
| VERIF-05 | escalate on UNION (Contested OR load_bearing OR audit-sample) | unit | NEW fixtures: load_bearing->escalate; Contested->escalate; in-sample/out-of-sample hash pair; determinism | Wave 0 (NEW) |
| AGG-05 | run dir retained as audit trail | behavioral | post-run assert run-dir (claims/excerpts/sources/votes/survivors.json/scope.md/report.md) survives | Wave 0 |
| COST-01 | exactly 2 Opus advisor consults | behavioral (headless) | SC-5 trace: advisor Agent spawns == 2; zero `research-verify-voter-opus` spawns | Wave 0 |
| COST-03 | <=5 in-flight per wave, >=3 waves | behavioral (headless) | SC-5 trace: max concurrent Agent calls <=5; next-batch spawn after prior-batch results | Wave 0 |
| COST-04 | Anthropic-API floor (no Bedrock/Vertex/Foundry paths) | static | grep the skill body: no cloud-provider degradation branches; doc-only assertion | Wave 0 |
| INTEG-01 | discoverable as `lz-advisor:lz-deep-research` | behavioral | `claude -p ... --output-format stream-json` init: `slash_commands` lists it; bare-form in interactive picker | Wave 0 |
| INTEG-02 | `.lz-research/` gitignored | static | `git check-ignore .lz-research/<run-id>/scope.md` returns the path | Wave 0 |
| (D-12 aggregator) | additive `load_bearing` carry + `escalate` emit, byte-identity, determinism | unit | NEW fixtures + frozen-object assertion + determinism test (extend existing suite) | Wave 0 (NEW) |
| (live-cert D-02..D-07) | certifyModel CP gates over harvested adjudicated positives; staged freeze; OOF+human adjudication | unit (deterministic seams) + spend (gated) | `lz-eval-live-cert.test.mjs` over the deterministic seams (STUB, no spend); the spend stages run LZ_SPEND-gated | Wave 0 (NEW) |

### Sampling Rate
- **Per task commit:** the touched suite by FILE form (aggregator suite for the D-12 wave; `lz-eval-live-cert.test.mjs` for the live-cert wave).
- **Per wave merge:** the full FILE-form enumeration of affected `*.test.mjs` (aggregator + eval tree).
- **Phase gate:** full suite green + the SC-5 headless spike passing all 5 acceptance criteria + the live-cert verdict produced (WORKS or settle-OR-raise) before `/gsd-verify-work`.

### Wave 0 Gaps (test infrastructure to author before/with implementation)
- [ ] `lz-deep-research-aggregate.test.mjs` -- EXTEND with the D-12 `escalate`/`load_bearing` fixtures (load_bearing->escalate; Contested->escalate; in/out-of-sample hash pair; determinism; frozen `AUDIT_SAMPLE_RATE`); covers VERIF-05.
- [ ] new committed `__fixtures__/` run-dirs for the escalate cases (a load-bearing claim; an in-sample unanimous uphold; an out-of-sample unanimous uphold) -- discriminating pairs, not tautologies.
- [ ] `eval/lz-eval-live-cert.test.mjs` -- FILE-form node:test exercising the live-cert orchestrator's deterministic seams (harvest selection, N-freeze guard, certifyModel composition, the LZ_SPEND hard-guard) with STUBS (no spend).
- [ ] `eval/lz-eval-harvest.test.mjs` -- harvest selection + difficulty stratification over a stub run-dir corpus.
- [ ] the SC-5 spike harness: a captured stream-json trace + a small `node` trace-parser that asserts the 5 acceptance criteria (max-in-flight, wave-boundary, advisor==2, zero Write failures, reproducible survivors.json). This is the behavioral validator for PIPE-01/02/09, COST-01/03, INTEG-01, AGG-05.
- [ ] a worker-contract check that at least one MERGED multi-member cluster's votes key by cluster id and tally correctly (Risk 1).

*(No new framework install -- `node:test` is stdlib; the eval tree's `jstat` is already restored.)*

## Security Domain

> `workflow.security_enforcement` is ABSENT from `.planning/config.json` (workflow block has no such key) -- per the GSD convention "absent = enabled," the security domain is included. Phase 20 is a local CLI plugin + a dev-only eval harness; the threat surface is narrow but real (worker-authored data flows through the aggregator; the run dir is on disk).

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | no auth surface (local CLI plugin) |
| V3 Session Management | no | no sessions |
| V4 Access Control | yes | least-privilege worker `tools` grants (Phase 19); the skill cannot widen them; advisor is read-only `[Read, Glob]` |
| V5 Input Validation | yes | `safeId` path-traversal guard + `ContractError` fail-closed reads in the aggregator (already frozen); the new `escalate` logic must NOT bypass `safeId` on cluster ids |
| V6 Cryptography | no | the audit-sample hash (FNV-1a `hash32`) is a DISTRIBUTION hash, not a security primitive -- collision-resistance is irrelevant (reproducibility-only, like the schema's percent-encode-not-SHA rationale) |
| V12 File Resources | yes | run-dir writes are basename-guarded via `safeId`; worker `Write` is classifier-gated under `--permission-mode auto`; the percent-encoded source filename inverts safely |

### Known Threat Patterns for {local plugin + dev eval harness}

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| worker-authored path-traversal id (claim id / excerpt_id / source key) | Tampering | `safeId` rejects path separators / `..` / Windows reserved names (frozen aggregator); the new escalate logic re-uses cluster ids (`'cluster'+N`, never worker-authored) -- but route any new content-derived id through `safeId` |
| fabricated / drifted quote launders an unsupported claim | Spoofing | quote-recheck drops it UPSTREAM of voting (frozen); `claim_support` (Assurance 2) is NEVER derived from `quote_fidelity` (D-12) |
| over-fan-out disk-I/O storm | DoS | <=5 in-flight wave cap (COST-03); MAX_FETCH=15 cap BEFORE spawn; the aggregator fail-closes above its raw-claims ceiling (360) |
| eval-tree dependency leaks into the shipped plugin | supply-chain Tampering | the packaging-boundary test + the aggregator plugin-tree walk FAIL on any `package.json`/`node_modules` under `plugins/lz-advisor/`; eval imports are one-directional (eval -> runtime, never reverse) |
| live-cert spend runs unintentionally (Credits / model spend) | resource abuse | every spend stage hard-guarded by `LZ_SPEND=1`; the dry-run runs stubs only; the staged human-block before the freeze |
| result-shopping the live verdict | Repudiation (integrity) | pre-registered lock rule frozen BEFORE any scored vote; N frozen; no optional stopping (D-07) |

## Sources

### Primary (HIGH confidence)
- `20-CONTEXT.md` (D-01..D-19, canonical_refs, code_context) -- the authoritative locked decisions.
- `20-PRE-DISCUSS-RESEARCH-skill-orchestration.md` -- verified Claude Code v2.1.x mechanics (findings A-J, U1-U6); fetched live via markdown.new + local plugin-dev/skill-creator docs.
- `20-PRE-DISCUSS-RESEARCH-live-cert.md` -- verified live LLM-judge certification facts (Guerdan NeurIPS 2025; Lee ICLR 2025; OR-Bench ICML 2025; rule-of-three / Clopper-Pearson math).
- `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs` (+ `.test.mjs`) -- the frozen aggregator + its test discipline (read in full).
- `plugins/lz-advisor/references/lz-deep-research-schema.md` -- the frozen data contract + the anti-drift lockstep discipline (read in full).
- `plugins/lz-advisor/skills/lz-execute/SKILL.md` -- the orchestrator-skill structural template (read in full).
- `plugins/lz-advisor/agents/{advisor,research-extract-worker,research-search-worker}.md` -- the reused agents (frontmatter + bodies).
- `eval/lz-eval-offline-read.mjs` -- `certifyModel`/`decisionMatrix`/`scorePositiveControls`/`persistVote` (the reused live-cert seams; read in full).
- `eval/lz-eval-lock-rule.md` -- the pre-registration discipline + `EVAL_THRESHOLDS` + OOF identity (read).
- `eval/{lz-eval-oof-batch,lz-eval-control-source,lz-eval-survival-probe}.mjs` -- the reused OOF adapter + control loaders (headers read).
- `.planning/{ROADMAP.md (Phase 20),REQUIREMENTS.md (12 reqs),config.json}` -- the inherited contract + flags.
- `.planning/phases/19-search-extract-worker-agents/19-04-REPLAN-DECISION-12.md` -- the staged-WORKS authority.
- `.planning/research/SESSION-DESIGN.md` -- the converged pipeline (section 5 phases, section 6 ceilings, section 10/15 verifier-tier).
- `eval/.cache/run-stage1/RUNBOOK.md` -- the proven staged-spend + LZ_SPEND hard-guard pattern (19-04 Task 9).

### Secondary (MEDIUM confidence)
- (none requiring re-verification -- the pre-discuss research artifacts already carry their VERIFIED/CONVENTION/GAP tags and sources.)

### Tertiary (LOW confidence)
- `context: fork` skill field (U3, agensi.io, UNVERIFIED) -- NOT used by this phase; flagged only so the planner does not rely on it.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- every component pre-exists, is committed, and is tested; nothing installed.
- Architecture (orchestrator wiring): HIGH -- mirrors a shipped skill (lz-execute) + the converged SESSION-DESIGN; the locked decisions resolve every HOW question.
- Additive schema/aggregator extension: HIGH on the mechanics (the lockstep discipline is proven across 4 phases); the concrete `AUDIT_SAMPLE_RATE` value is planner's discretion (A1).
- Live-cert harness: HIGH on the reuse path (certifyModel/OOF/lock-rule are frozen + tested); MEDIUM on harvest feasibility (A4 / D-19 is the board's #1 named uncertainty, gated as a pre-flight probe).
- SC-5 spike: HIGH on the invocation + acceptance shape; MEDIUM on whether the parent stream-json trace alone proves concurrency (A3 -- the per-agent JSONL is the documented fallback).
- Pitfalls: HIGH -- drawn from the project's own committed learnings + the frozen contracts.

**Research date:** 2026-06-19
**Valid until:** ~2026-07-19 for the Claude Code mechanics (v2.1.x, fast-moving -- re-verify findings A-J if the SC-5 spike behaves unexpectedly); the frozen contracts + decisions are valid for the duration of the phase.
