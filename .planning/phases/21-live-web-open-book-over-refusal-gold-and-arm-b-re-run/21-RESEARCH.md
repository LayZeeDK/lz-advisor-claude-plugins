# Phase 21: Live-web open-book over-refusal gold and arm-B re-run - Research

**Researched:** 2026-06-21
**Domain:** LLM-eval certification methodology (construct-validity repair) + zero-dep Node eval scripting on the FROZEN `eval/` certification seams
**Confidence:** HIGH (decisions locked in 21-CONTEXT.md; this converts them to implementation specifics by direct read of every seam cited)

## Summary

Phase 21 fixes ONE thing: the over-refusal (arm B) gold was CLOSED-book (the OOF pair judged from a fixed excerpt + training knowledge), but the voter is OPEN-book live-web. The prior re-score (`rejudication-lib.mjs` -> `rejudicate.mjs`, 20-05) already implements the exact TWO-SIDED reclassify -> `clopperPearsonUpperOneSided` vs `TAU_OR` pipeline -- but its prompt says "considering the EVIDENCE AND your knowledge of the established literature," which is the closed/knowledge gold the board ruled construct-mismatched. The build is therefore SMALL and ADDITIVE: (a) a session-driven Claude live-web retrieval pass over the frozen 30 confirmed controls (reusing `research-search-worker` + `research-extract-worker`, zero Copilot credits) that writes a per-control logged-evidence bundle (canonical URL + verbatim quote + `fetched_at` + immutable excerpt) into a gitignored run dir; (b) a thin packaging step that feeds that ENRICHED open-book evidence through the existing `joinClusterEvidence` (`EXCERPT_CHAR_CAP`, front-matter strip, dedup) into the existing batched closed-book OOF adapter (`lz-eval-oof-batch.mjs` via `makeOofAdjudicator`/`makeCopilotCallModel`) for the ONLY metered spend; (c) re-score the FROZEN Sonnet votes in `votes/sonnet/ctrl/` against the new open-book gold via the same TWO-SIDED reclassify + frozen `clopperPearsonUpperOneSided(overRefusals, validN) <= TAU_OR 0.15`.

**Primary recommendation:** Build the open-book gold as a NEW gitignored driver pair (a retrieval-log builder + an open-book-OOF-gold adjudicator) that REUSES `joinClusterEvidence`, `makeOofAdjudicator`/`makeCopilotCallModel`/`FROZEN_OOF_PAIR`, `clopperPearsonUpperOneSided`/`EVAL_THRESHOLDS`, and the `rejudication-lib.mjs` reclassify shape BYTE-IDENTICAL where possible; only the GOLD's evidence source changes (training-knowledge -> logged live-web). Re-score the frozen `votes/sonnet/ctrl/` (no re-vote). Pre-register the new gold + lock rule before any re-scored vote; gate the metered OOF behind a 1-2 item pre-flight cost spike that HALTs+RAISEs if per-item credits exceed the disclosed estimate (~8 credits/call, learning M-1).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Live-web retrieval per control | Claude session pool (Agent tool: `research-search-worker` [WebSearch] + `research-extract-worker` [WebFetch]) | -- | D-01: retrieval must be construct-matched + open-book + zero Copilot credits; the Agent tool is unreachable from bare node |
| Evidence packaging (tight) | Node eval tree (`joinClusterEvidence` reuse) | -- | Deterministic, no spend; the D-03 token-minimization lever |
| OOF gold JUDGMENT over logged evidence | Copilot CLI subprocess (`makeCopilotCallModel` -> `makeBatchedOofProbe`) | -- | D-08: judgment stays out-of-family; the ONLY metered spend, node-wireable |
| Re-score frozen votes + CP gate | Node eval tree (reclassify + `clopperPearsonUpperOneSided`) | -- | NO spend; reads cast votes + new gold off disk |
| Pre-registration / freeze / HALT+RAISE | Session orchestration + a committed lock-rule doc | Node guard (`LZ_SPEND`) | D-10/D-14 anti-result-shopping + cost guard |

## User Constraints (from CONTEXT.md)

### Locked Decisions (D-01..D-14, copied verbatim-in-substance from 21-CONTEXT.md)
- **D-01:** Adjudicator = retrieve-then-judge SPLIT, Claude-only retrieval. ALL live-web search/fetch on the Claude session pool via `research-search-worker` [WebSearch] + `research-extract-worker` [WebFetch] -- an INDEPENDENT live-web search per control (NOT a replay of the voter's own excerpt; surface the broader literature), storing a structured retrieval log (canonical URL + verbatim quote + `fetched_at` + immutable excerpt). The FROZEN OOF pair judges gold-blind over that logged evidence.
- **D-02:** NO native-OOF Copilot web search (too expensive at scale; not even a recorded fallback).
- **D-03:** MINIMIZE Copilot AI Credits is a first-class constraint. Only the OOF judgment is metered; minimize via batched OOF + tight evidence packaging + reuse-30 + the 1-2 item pre-flight spike. Estimate ~100-350 credits on the split.
- **D-04:** Reuse the FROZEN 30 over-refusal controls + RE-SCORE the FROZEN Sonnet votes. No re-vote, no re-harvest. The re-adjudication is TWO-SIDED.
- **D-05:** Scope limit recorded: the 30 were closed-book-SELECTED; the certificate is scoped to those 30.
- **D-06:** Two-field gold record (groundedness + validity); AVeriTeC 4-way {supported, refuted, not-enough-evidence, conflicting} for adjudication, then mapped to the frozen binary.
- **D-07:** Bounded leakage = log every URL+quote+timestamp; a meta-source blocklist (no own fact-check / leaderboards / dataset pages); pin timestamps + freeze the snapshot; unclosable drift = a named PROVISIONAL limit.
- **D-08:** Adjudicator = the FROZEN OOF all-agree pair (`gpt-5.5` + `gemini-3.1-pro-preview`, `--effort high`, gold-blind), byte-identical for JUDGMENT ONLY. OOF non-unanimity excludes the item from the binary denominator + routes to the human. Report kappa + Jaccard separately; do NOT demand 0.8 kappa.
- **D-09:** Frozen primitives byte-identical (`EVAL_THRESHOLDS`, `clopperPearsonUpperOneSided`, `certifyModel`/`decisionMatrix`, OOF identity). Over-refusal CP gate: CP-upper <= TAU_OR 0.15 over the RE-CONFIRMED open-book supported denominator. Arms never pooled.
- **D-10:** PRE-REGISTRATION: write+freeze the new gold + lock rule (re-confirmed N, CP estimator, two-sided guard, snapshot) BEFORE any re-scored vote; no optional stopping; `raiseToUser` stays true; spend is a staged `LZ_SPEND`-gated BLOCKING checkpoint.
- **D-11:** Outcome = SCOPED sensitivity-only OR clean DOES-NOT-WORK OR honest VOID -> RAISE. Full WORKS OUT. Sonnet-default ships; Haiku flip deferred.
- **D-12:** A 1-2 item pre-flight COST + FEASIBILITY spike measures real per-control OOF credits AND confirms Claude retrieval surfaces the broader literature, BEFORE the full N. Materially-over-estimate -> HALT + RAISE.
- **D-13:** Every script that runs/is used by an LLM task is code-reviewed AND covered by code-reviewed unit tests. No-spend build first, FILE-form `node --test`, mutation-verified discriminating tests, independent adversarial review, eval-never-ships, one-directional eval->runtime import.
- **D-14:** Overnight autonomous with CONDITIONAL pre-approved metered OOF spend, conditioned on (a) cost not materially above estimate AND (b) active token minimization. The D-12 spike is the cost guard.

### Claude's Discretion
- Exact retrieval wiring (reuse workers directly vs a thin dedicated retrieval driver over the same tools); evidence-packaging caps within the frozen quote-primary join; OOF batch size; the AVeriTeC-4-way -> binary micro-rule; the 1-2 item spike design; the kappa/Jaccard reporting format. Finalize within the frozen schema + `EVAL_THRESHOLDS` + the two-assurance contract.

### Deferred Ideas (OUT OF SCOPE)
- Full WORKS / arm-A specificity reconstruction (structurally void on-distribution).
- The Haiku-first flip (Phase-20 D-06).
- Native-OOF Copilot web search (cost ruling D-02).
- Larger-N / ecosystem-representative live-cert corpus + production monitoring.
- Relocate non-distributable test fixtures (~0.6) + RTK suitability research (~0.6) -- backlog, not folded.

## Project Constraints (from CLAUDE.md)
- ASCII-only (no Unicode, no em/en dashes, no box-drawing) in all scripts AND output.
- Zero-dep eval scripts; CRLF/BOM/path-safe on Windows arm64 / Git Bash (explicit UTF-8 + LF; `path.join`; no shell globbing). `jstat@1.9.6` is the ONLY allowed eval dep and is consumed only inside `lz-eval-aggregate.mjs`.
- The eval tree NEVER ships: one-directional eval -> runtime import boundary (eval imports the shipped aggregator's `ContractError`/`safeId`/`listJson`; NEVER runtime -> eval).
- `node:test` via the explicit `.test.mjs` FILE form (the dir form spuriously exits 1 on this host).
- `git grep` CANNOT see gitignored paths (`eval/.cache/`, `.lz-research/`) -- use `rg`/Read there.
- Frozen primitives consumed BYTE-IDENTICAL (`EVAL_THRESHOLDS` / `clopperPearsonUpperOneSided` / `certifyModel` / `decisionMatrix` / `FROZEN_OOF_PAIR`).
- D-13 (project-wide MUST, 2026-06-21): every LLM-task script reviewed + unit-tested.
- No `git add .`; stage files by name. Copilot AI Credits: estimate before + disclose after.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| OBG-01 | Live-web OPEN-BOOK gold; evidence from independent live-web search on the Claude session pool; not training knowledge; not Copilot web search | Seam 1: reuse `research-search-worker`/`research-extract-worker`; new retrieval-log builder writes per-control bundles to a gitignored run dir |
| OBG-02 | Two-field gold record (groundedness: logged URLs+quotes+`fetched_at`; validity: AVeriTeC 4-way mapped to frozen binary) | Seam 3: extract worker already emits `source`/`quote`/`excerpt_id`/`fetched_at`; add a validity field; map 4-way -> binary |
| OBG-03 | Bounded leakage: meta-source blocklist; pinned timestamps; frozen snapshot; unclosable drift = PROVISIONAL | Seam 4: blocklist in the retrieval prompt + a deterministic node post-filter on logged URLs; freeze the bundle JSON |
| OBG-04 | FROZEN OOF all-agree pair judges over the logged evidence; non-unanimity excludes + routes to human (Guerdan) | Seam 1+2: reuse `makeOofAdjudicator`/`FROZEN_OOF_PAIR`/`classifyAdjudicationResidue`; `consensusLabel` -> RESIDUE on disagreement |
| OBG-05 | Re-run by re-scoring FROZEN Sonnet votes vs the new gold over the frozen 30; no new votes/harvest; two-sided | Seam 2: read `votes/sonnet/ctrl/`; reclassify two-sided; recompute over-refusal numerator/denominator |
| OBG-06 | Pre-register gold + lock rule (re-confirmed N, CP estimator, two-sided guard, snapshot) before any re-scored vote; no optional stopping; arms never pooled | Seam 5: a committed lock-rule doc mirroring `20-05-REJUDICATION-PREREGISTRATION.md`; zero-votes window is clean (fresh construct) |
| OBG-07 | Frozen over-refusal CP gate byte-identical (CP-upper <= TAU_OR 0.15 over the open-book-confirmed denominator) -> SCOPED / DOES-NOT-WORK / VOID->RAISE; no WORKS; Sonnet ships; Haiku deferred | Seam 2: `clopperPearsonUpperOneSided` + `EVAL_THRESHOLDS.TAU_OR`; `decideScopedSensitivity` shape |
| OBG-08 | Minimize Copilot credits: batched OOF + tight packaging + reuse-30 + 1-2 item pre-flight spike that HALTs+RAISEs if per-item cost >> estimate | Seam 2+5: `joinClusterEvidence` packaging; batched probe; `makeWinRunner`/`buildCreditsRecord` ANSI-strip credit capture |
| OBG-09 | Every LLM-task script reviewed + unit-tested; eval never ships (one-directional import) | Seam 6: FILE-form `.test.mjs` per new script; `isCliEntry` dispatch guard; adversarial review |
</phase_requirements>

## Standard Stack

Zero new packages. Phase 21 is pure additive code over the FROZEN eval seams.

### Core (reused BYTE-IDENTICAL -- never edit)
| Module / Export | Purpose | Provenance |
|-----------------|---------|------------|
| `eval/lz-eval-aggregate.mjs` -> `EVAL_THRESHOLDS` (TAU_OR 0.15, N_CTRL_FLOOR 24), `clopperPearsonUpperOneSided` | The frozen CP gate + thresholds | [VERIFIED: read] |
| `eval/lz-eval-live-cert.mjs` -> `FROZEN_OOF_PAIR`, `makeCopilotCallModel`, `makeOofAdjudicator`, `classifyAdjudicationResidue`, `scoreArmFromVotes`, `persistDualRunVote`, `freezeArms`, `requireSpend` | OOF transport + residue router + vote scorer + N-freeze + spend guard | [VERIFIED: read] |
| `eval/lz-eval-oof-batch.mjs` -> `makeBatchedOofProbe`, `prepareBatches`, `packBatches`, `runContaminationGate` | The batched closed-book OOF adapter (the seam enriched evidence feeds into) | [VERIFIED: read] |
| `eval/lz-eval-evidence-join.mjs` -> `joinClusterEvidence`, `EXCERPT_CHAR_CAP` (1200), `stripBibliographicMetadata`, `resetEvidenceJoinCache` | Quote-primary + front-matter strip + dedup + char-cap (the D-03 token lever) | [VERIFIED: read] |
| `eval/lz-eval-armA-native.mjs` -> `adjudicateNativeRefutedGold` (parameterized `expectedEntailment`), `oofPacketFor`, resumable `evidenceSha` cache | The harvest/adjudicate machinery `armB-oof-gold.mjs` was parameterized from | [VERIFIED: read] |
| `eval/.cache/p20-live/oof-transport-lib.mjs` -> `RUN_DIRS`, `COPILOT_CMD`, `makeWinRunner`, `parseCredits` (ANSI-strip), `buildCreditsRecord`, `isCliEntry` | The Windows Copilot runner + honest credit capture (M-1) + import-safe dispatch guard | [VERIFIED: read] |
| `eval/.cache/p20-live/rejudication-lib.mjs` -> `selectRejudicationSample`, `buildRejudicationPrompt`, `parseRejudication`, `consensusLabel`, `reclassify`, `decideScopedSensitivity` | The TWO-SIDED reclassify -> CP pipeline (PROSE-of-prompt is the ONLY thing Phase 21 changes) | [VERIFIED: read] |
| `plugins/lz-advisor/agents/research-search-worker.md` + `research-extract-worker.md` | The Claude live-web retrieval the gold reuses (session pool, zero Copilot $) | [VERIFIED: read] |

### Supporting (NEW, gitignored under `eval/.cache/p21-live/`)
| New module | Purpose | When |
|------------|---------|------|
| `openbook-retrieval-log.mjs` | Deterministic builder: read the session-written per-control retrieval bundles from the p21 run dir, apply the meta-source blocklist post-filter, freeze the snapshot, emit `openbook-evidence.json` | After session retrieval; NO spend |
| `openbook-oof-gold.mjs` | Driver: feed the open-book bundles through `joinClusterEvidence` -> `adjudicateNativeRefutedGold`/`makeOofAdjudicator` (`expectedEntailment:'true'`) -> write `openbook-gold-result.json` (two-field) + credits | The ONLY metered spend; `LZ_SPEND`-gated; `isCliEntry` |
| `openbook-rescore.mjs` | Driver: load the frozen `votes/sonnet/ctrl/` + the new open-book gold -> two-sided reclassify -> `clopperPearsonUpperOneSided` vs TAU_OR -> `openbook-rescore-result.json` | NO spend |
| `openbook-lib.mjs` | PURE testable units the three drivers share (blocklist filter, 4-way->binary map, two-sided reclassify if it must diverge from `rejudication-lib`, kappa/Jaccard) | NO spend; FILE-form tested |

**Installation:** none. `node --version` = v24.13.0; `eval/package.json` deps `{}`, devDeps `{ "jstat": "1.9.6" }`. No new install.

## Package Legitimacy Audit

Phase 21 installs NO external packages (zero-dep eval scripts; the only dep `jstat@1.9.6` is pre-pinned, already vetted, consumed byte-identical inside `lz-eval-aggregate.mjs` only). No `npm install` step exists in this phase. slopcheck not applicable -- there is nothing to audit.

**Packages removed due to slopcheck [SLOP] verdict:** none (no packages).
**Packages flagged [SUS]:** none.

## Architecture Patterns

### System Architecture Diagram (data flow)

```
[Frozen 30 confirmed_uids]            (armB-oof-gold-result.json: confirmed_uids[])
        |
        v
SESSION: per control, dispatch research-search-worker [WebSearch] (independent + DISCONFIRMING query,
   >=3-query floor, source-independence dedup) -> candidates/<w>.json
        |  (broader-literature search, NOT a replay of the voter's excerpt)
        v
SESSION: research-extract-worker [WebFetch] per candidate -> excerpts/<id>.txt (verbatim, immutable)
   + claims/<w>.json (quote + excerpt_id + load_bearing) + sources/<key>.json (canonical url + fetched_at)
        |  (zero Copilot credits -- Claude session pool)
        v
NODE openbook-retrieval-log.mjs: apply META-SOURCE BLOCKLIST (drop own fact-check / leaderboard / dataset
   pages); PIN fetched_at; FREEZE -> eval/.cache/p21-live/openbook-evidence.json   [NO SPEND]
        |
        v
NODE openbook-oof-gold.mjs: joinClusterEvidence (EXCERPT_CHAR_CAP, strip, dedup) -> oofPacketFor
   -> makeOofAdjudicator(FROZEN_OOF_PAIR) batched prepare() -> all-agree consensus, gold-blind
        |  (Copilot CLI; THE ONLY METERED SPEND; LZ_SPEND=1; D-12 pre-flight spike first)
        v
   AVeriTeC-4-way validity label per control -> map to frozen binary (SUPPORTED | NOT-SUPPORTED | RESIDUE)
   non-unanimity -> RESIDUE -> excluded from denominator + routed to human (Guerdan)
        v  -> openbook-gold-result.json (TWO-FIELD: groundedness + validity)
        |
        v
NODE openbook-rescore.mjs: read FROZEN votes/sonnet/ctrl/ (the 30; 4 'refuted')
   TWO-SIDED reclassify against the open-book gold:
     - control labeled SUPPORTED + voter 'refuted'  -> over-refusal (numerator)
     - control labeled SUPPORTED + voter 'unrefuted' -> valid control upheld
     - control labeled NOT-SUPPORTED + voter 'refuted' -> gold-error / voter-correct (drops from denom)
     - control labeled NOT-SUPPORTED + voter 'unrefuted' -> MISSED FALSE-UPHOLD (two-sided guard)
     - RESIDUE -> excluded from the binary denominator
   validN = SUPPORTED-confirmed count; overRefusals = SUPPORTED-confirmed-AND-voter-refuted count
        |
        v
   clopperPearsonUpperOneSided(overRefusals, validN) vs TAU_OR 0.15  [NO SPEND]
        v
   SCOPED sensitivity-only (CP clears) | clean DOES-NOT-WORK (CP breaches) | VOID-on-construct/power -> RAISE
   Sonnet-default ships regardless; Haiku-first flip deferred.
```

File-to-implementation mapping is the Standard Stack tables above; this diagram is the data flow only.

### Pattern 1: Reuse the rejudication pipeline, swap ONLY the gold's evidence source
**What:** `rejudication-lib.mjs` already does select -> build prompt -> parse -> `consensusLabel` -> `reclassify` (two-sided) -> `decideScopedSensitivity` (CP vs TAU_OR). Its `buildRejudicationPrompt` is the closed/knowledge gold ("considering the EVIDENCE AND your knowledge of the established literature"). Phase 21's construct fix is to replace the evidence the OOF reads: instead of the voter's own ~1200-char excerpt + the model's training knowledge, feed the INDEPENDENT live-web-retrieved logged evidence (broader-literature quotes + excerpts).
**When to use:** Always -- this is the cheapest construct-valid path (D-04, serves D-03).
**Note:** Decide whether to reuse `reclassify`/`decideScopedSensitivity` byte-identical (preferred -- they are already two-sided + frozen-CP-backed) or fork into `openbook-lib.mjs`. If the open-book denominator is the FULL 30 (re-adjudicate all 30, not a 4+k blind sample) then `reclassify`'s denominator logic (`nUnReadjudicated + supportedInSample`) collapses to `supportedInSample` and the function is reusable directly with `sampleUids = all 30`.

### Pattern 2: Independent broad search, NOT excerpt replay (D-01 load-bearing)
**What:** The search worker MUST run a DISCONFIRMING query (the negation) and weight source independence, surfacing the wider live-web literature the voter could reach (e.g. transformer/cluster38: find the canonical Sardana&Frankle paper that says "overestimates," not the voter's summary; crispr/cluster47: the gene-vs-enhancer distinction). This is what makes the gold construct-matched. The extract worker stores the verbatim excerpt at fetch time.
**Anti-pattern:** Re-feeding the voter's own `armB-control-packets.json` excerpt as the gold's evidence -- that reproduces the closed-book construct and the VOID.

### Anti-Patterns to Avoid
- **Editing any frozen primitive** (EVAL_THRESHOLDS / clopperPearsonUpperOneSided / certifyModel / FROZEN_OOF_PAIR / makeBatchedOofProbe / runProbeConsensus). Verify byte-identical via empty `git diff` on the tracked seams.
- **Pooling arms.** Phase 21 scores ONLY the over-refusal arm (arm B). Arm A is structurally void; do not reconstruct it (D-11).
- **Optional stopping / re-harvest.** N is the frozen 30; freeze before any re-scored read (D-10).
- **Copilot web search** (D-02). Retrieval is Claude-session-only.
- **A `0` credits reading meaning "free."** `buildCreditsRecord` returns `null` = UNMEASURED; capture via the ANSI-strip `parseCredits` and disclose actuals.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Clopper-Pearson upper bound | A hand-coded incbeta/betaInv | `clopperPearsonUpperOneSided` (jstat-backed, frozen) | D-07 forbids hand-rolled stats; byte-identical anchors CP1s(0,30)~=0.117, CP1s(1,30)~=0.149 |
| OOF batched judgment + DP3 retry/split | A bespoke batch loop | `makeBatchedOofProbe`/`prepareBatches` | Already handles reshuffle + opaque ids + re-run-once-then-split + fail-closed-to-drop |
| Copilot CLI transport | A new spawn wrapper | `makeCopilotCallModel` + `makeWinRunner` | Stdin-piped (no `-p`), no `--allow-all-tools`, `requireSpend` guard, ANSI credit capture |
| Evidence packaging / front-matter strip | A new cleaner | `joinClusterEvidence` + `stripBibliographicMetadata` | Faithful strip + KEEP-SUPERSET-ONLY dedup + EXCERPT_CHAR_CAP; the proven D-03 token lever |
| Vote read + over-refusal count | A new vote reader | `scoreArmFromVotes({ kind:'over-refusal' })` OR `reclassify` | Fail-closed realized-count guard; `refuted` on a SUPPORTED control = over-refusal |
| Live-web retrieval | A new fetch agent | `research-search-worker` + `research-extract-worker` | Disconfirming-query + source-independence + immutable excerpt already contracted |
| Resumable OOF cache | A new cache | `adjudicateNativeRefutedGold` `cacheDir` + `evidenceSha` | Skip-already-done + fingerprint guard so a re-run never re-pays on the SAME evidence |

**Key insight:** Phase 21 is ~90% composition of frozen seams. The genuinely net-new code is: the meta-source blocklist filter, the AVeriTeC-4-way->binary micro-rule, the open-book retrieval-log builder, and the kappa/Jaccard reporting -- all small, deterministic, FILE-form testable.

## Runtime State Inventory

Not a rename/refactor phase. SKIPPED -- no stored data / OS-registered state / secret renames involved. (The only runtime state is the gitignored `eval/.cache/` artifacts, which are fresh per phase.)

## The seven focus answers (implementation-ready)

### (1) Minimal seam to build the open-book gold
- **REUSE byte-identical:** `joinClusterEvidence`/`EXCERPT_CHAR_CAP` (packaging), `oofPacketFor` (gold-blind packet shape `{ trap:{uid,claim}, enrichedKs:[{sentence}] }`), `makeOofAdjudicator`+`makeCopilotCallModel`+`FROZEN_OOF_PAIR` (the OOF transport), `makeBatchedOofProbe`/`prepareBatches` (batching), `adjudicateNativeRefutedGold({ expectedEntailment:'true', cacheDir })` (the all-agree retain with resumable `evidenceSha` cache), `classifyAdjudicationResidue` (Guerdan residue routing), `requireSpend`/`LZ_SPEND`.
- **ADD (gitignored `eval/.cache/p21-live/`):** `openbook-retrieval-log.mjs` (read session-written `.lz-research`-shaped run dir bundles for the 30 controls; the SAME `claims/`/`excerpts/`/`sources/` layout the extract worker writes, so `joinClusterEvidence` consumes them unchanged; apply the blocklist; freeze the snapshot), `openbook-oof-gold.mjs` (the driver, mirrors `armB-oof-gold.mjs` structure: `harvest`-equivalent input is the open-book bundle, `expectedEntailment:'true'`, write two-field result + credits), and `openbook-lib.mjs` (pure helpers).
- **Independent-broad-search vs excerpt-replay:** the retrieval is a NEW `.lz-research`-shaped run dir built by session-dispatched `research-search-worker`/`research-extract-worker` per control (disconfirming query, source-independence) -- NOT the voter's `armB-control-packets.json`. The gold's evidence is the wider live-web literature; that is the construct fix.
- **Do NOT touch** `lz-eval-live-cert.mjs` / `lz-eval-oof-batch.mjs` / `lz-eval-evidence-join.mjs` / `lz-eval-armA-native.mjs` source (compose by import; verify empty `git diff`).

### (2) The re-score mechanism (frozen votes -> CP gate)
- Read the 30 FROZEN votes in `eval/.cache/p20-live/votes/sonnet/ctrl/` (each `{ id (:-free uid), verdict:'unrefuted'|'refuted', trace }`). 4 are `refuted` (montreal/cluster40, crispr/cluster47, transformer/cluster38, antibiotic/cluster24 -- per `armB-over-refusal-score.json`).
- TWO-SIDED reclassify against the NEW open-book gold (per `reclassify` in `rejudication-lib.mjs`):
  - gold SUPPORTED + voter `refuted` -> `overRefusals += 1` (genuine over-refusal).
  - gold SUPPORTED + voter `unrefuted` -> valid control upheld (counts in `validN`, not numerator).
  - gold NOT-SUPPORTED + voter `refuted` -> gold-error / voter-correct -> DROPS from the supported denominator (this is exactly the construct-mismatch rescue: a control no longer genuinely supported open-book leaves `validN`).
  - gold NOT-SUPPORTED + voter `unrefuted` -> a MISSED FALSE-UPHOLD surfaced (the two-sided guard; report it, but arm A is void so it does not enter a separate pooled count -- record it as a transparency datum).
  - RESIDUE (OOF non-unanimity) -> excluded from the binary denominator (Guerdan), routed to human.
- `validN` = (controls confirmed SUPPORTED open-book). `overRefusals` = (SUPPORTED-confirmed AND voter-`refuted`). The numerator AND denominator RE-COMPUTE because a reclassified-not-supported control leaves BOTH (it is no longer a supported positive the voter should uphold). This is the two-sided recompute the CONTEXT requires.
- Gate: `clopperPearsonUpperOneSided(overRefusals, validN) <= EVAL_THRESHOLDS.TAU_OR (0.15)` -- byte-identical via `decideScopedSensitivity` (which also returns the power band: VOID-on-power if validN < 24, under-powered if 24..29, at-target if >=30). Either reuse `scoreArmFromVotes({ kind:'over-refusal' })` (counts `refuted` over a frozen arm) on the RE-CONFIRMED supported arm, or use `reclassify` directly (preferred, since `reclassify` already encodes the two-sided dispositions and produces `validN`).
- Anchors: 0/30 -> ~0.117 (PASS); 1/30 -> ~0.149 (PASS, at floor); 2/30 -> >0.15 (BREACH). If reclassification drops the denominator below 30, the power band tightens (e.g. 1/24 ~= 0.183 BREACHES) -- report the realized N honestly, NEVER relax TAU.

### (3) AVeriTeC-4-way -> frozen-binary mapping + two-field gold record
- **Two-field record (per control uid):**
  - `groundedness`: `{ urls:[canonical], quotes:[verbatim spans], fetched_at:[ISO], excerpt_ids:[] }` -- straight from the extract worker's `sources`/`claims`/`excerpts` (already produced; OBG-02).
  - `validity`: `{ averitec_label: 'supported'|'refuted'|'not-enough-evidence'|'conflicting', binary: 'SUPPORTED'|'NOT-SUPPORTED'|'RESIDUE', oof_per_model:{gpt-5.5,gemini-3.1-pro-preview}, kappa, evidence_jaccard }`.
- **4-way -> binary micro-rule (deterministic, in `openbook-lib.mjs`, FILE-form tested):**
  - `supported` -> `SUPPORTED` (the voter SHOULD uphold; a `refuted` vote here is the over-refusal signal).
  - `refuted` -> `NOT-SUPPORTED` (the control is genuinely overclaimed open-book; the voter's refute was CORRECT -> drops from the supported denominator).
  - `not-enough-evidence` -> `RESIDUE` (excluded from the binary denominator; routed to human -- the SUPPORTS-vs-NEI boundary IS the over-refusal signal, so do NOT coerce, per D-06/D-08).
  - `conflicting` -> `RESIDUE` (Guerdan rating-indeterminacy; routed to human).
  - OOF non-unanimity at the binary level (the two models disagree on supported-vs-not) -> `RESIDUE` regardless of any single model's 4-way label (`consensusLabel` returns RESIDUE unless both agree).
- The frozen OOF prompt rubric is entailment ("does the EVIDENCE entail the CLAIM?"); the open-book rubric must additionally permit the broader-literature read. Reuse `buildRejudicationPrompt`'s SUPPORTED/NOT-SUPPORTED/UNCLEAR shape but feed open-book evidence; map UNCLEAR -> RESIDUE. If the AVeriTeC 4-way granularity is wanted in-prompt, extend the enum to the 4 labels and collapse in node -- keep the collapse OFF-MODEL and tested.

### (4) Bounded-leakage mechanics
- **Meta-source blocklist (D-07):** a deterministic node post-filter in `openbook-retrieval-log.mjs` over the logged canonical URLs -- DROP any source that is the claim's own published fact-check, a leaderboard, or a dataset/benchmark page (host/path patterns; an explicit, reviewed denylist of host substrings + a documented rule, NOT a model judgment). The search-worker prompt ALSO instructs "prefer primary-source contestability; do not pull the claim's own fact-check/leaderboard/dataset page." Belt-and-suspenders: prompt-level avoidance + node-level enforcement (the enforcement is the gate; the prompt is best-effort).
- **Pinned timestamps:** every logged source carries `fetched_at` (the extract worker already writes it). The builder records the retrieval window.
- **Frozen snapshot:** `openbook-evidence.json` is written ONCE and frozen (the OOF judges against this fixed snapshot, not a moving web). Re-runs read the frozen JSON; they never re-fetch.
- **Audit separation (retrieval-reachability vs judgment):** the groundedness field records WHAT was reachable; the validity field records the OOF JUDGMENT. An over-refusal that the gold cannot ground (no SUPPORTED evidence reachable) is attributable to a retrieval gap, not a reasoning error -- log both. Report `evidence_jaccard` (expect ~0.3) separately from verdict `kappa` (expect ~0.44-0.68); do NOT demand high overlap.
- **PROVISIONAL limit:** any snapshot/time-drift that cannot be closed (e.g. a source that changed since the voter ran) is a NAMED PROVISIONAL caveat on the certificate, recorded in the result + report.

### (5) Pre-registration + 1-2 item pre-flight cost-spike + HALT+RAISE
- **Pre-registration (D-10, mirror `20-05-REJUDICATION-PREREGISTRATION.md` + `lz-eval-live-lock-rule.md`):** author + COMMIT a new lock-rule doc (`21-OPENBOOK-LOCK-RULE.md` or equivalent) BEFORE any re-scored vote, freezing: the re-confirmed N (the open-book SUPPORTED denominator), the CP estimator (`clopperPearsonUpperOneSided`), TAU_OR 0.15 (byte-identical reference, NOT a new number), the two-sided guard, the frozen evidence snapshot hash, the meta-source blocklist, and the 4-way->binary rule. The zero-votes window is clean (the open-book gold is a fresh, never-scored construct -> re-pre-registration is not result-shopping). `decisionMatrix.raiseToUser` stays true. No optional stopping; arms never pooled.
- **Pre-flight cost spike (D-12/D-14):** before the full N, run the OOF gold on 1-2 controls ONLY (`LZ_SPEND=1`, batched), capturing per-call credits via `makeWinRunner`/`buildCreditsRecord` (ANSI-strip `parseCredits`; arm-B baseline was ~8 credits/call, ~3x the original estimate). ALSO confirm the Claude retrieval surfaced the broader literature (e.g. for transformer/cluster38 the gold's evidence should include the canonical "overestimates" source, not the voter's summary). 
- **HALT + RAISE guard:** if realized per-item credits are MATERIALLY above the disclosed estimate (D-14 condition (a)), HALT -- do NOT proceed to the full N; record an UNRESOLVED/RAISE entry. The spike is the cost guard; the full OOF spend is conditional on the spike clearing. Disclose actuals after.
- **Spend ordering:** no-spend build + tests (D-13) FIRST -> commit -> pre-registration commit -> pre-flight spike (metered, gated) -> [HALT decision] -> full OOF gold (metered) -> re-score (no spend) -> verdict.

### (6) D-13 script-review + tested-coverage plan
Every new LLM-task script is reviewed AND covered by a code-reviewed FILE-form `.test.mjs`. The new scripts and their test surfaces:

| New script | LLM-task role | No-spend testable units | Test (FILE-form `node --test`) | Mutation-discrimination check |
|------------|---------------|--------------------------|-------------------------------|-------------------------------|
| `openbook-lib.mjs` | Used-by (blocklist filter, 4-way->binary map, two-sided reclassify, kappa/Jaccard) | All pure; no I/O | `openbook-lib.test.mjs` | Flip a mapping (refuted->SUPPORTED) and assert the test RED; swap an over-refusal disposition |
| `openbook-retrieval-log.mjs` | Used-by (reads run-dir bundles, applies blocklist, freezes snapshot) | Pure over a tmp fixture run dir; `isCliEntry`-guarded; NO network | `openbook-retrieval-log.test.mjs` | Inject a blocklisted URL and assert it is DROPPED; assert a frozen snapshot is stable |
| `openbook-oof-gold.mjs` | Runs (the metered OOF judgment) | Dispatch guarded behind `isCliEntry` + `requireSpend`/`LZ_SPEND`; `callModel` INJECTED stub -> ZERO spend; `buildOpenbookResult` pure | `openbook-oof-gold.test.mjs` (stub callModel; assert no spend, two-field result shape, residue routing) | Assert the guard throws on `LZ_SPEND` unset; stub a split -> RESIDUE |
| `openbook-rescore.mjs` | Used-by (reads frozen votes + gold -> CP) | Pure reclassify + CP over a fixture; NO spend | `openbook-rescore.test.mjs` | Reclassify a SUPPORTED+refuted -> assert over-refusal counted; reclassify a NOT-SUPPORTED+refuted -> assert it DROPS from validN (the two-sided recompute) |

Discipline: no-spend build first; the entire suite runs with NO `LZ_SPEND`; importing any driver triggers NO spend (`isCliEntry` guard); tests are mutation-verified discriminating (disable the fix / flip a branch -> RED); an INDEPENDENT adversarial review (Explore subagent) of every new script + test before the spend; the eval tree never ships (one-directional eval -> runtime import of `ContractError`/`safeId`/`listJson` only). Frozen-seam byte-identity proven by empty `git diff` on the tracked `lz-eval-*.mjs` files. Per the project rule, run tests via the explicit `.test.mjs` FILE form, never `node --test <dir>`.

### (7) Validation Architecture -- see the dedicated section below.

## Common Pitfalls

### Pitfall 1: Replaying the voter's excerpt as the gold's evidence
**What goes wrong:** Re-running the OOF over `armB-control-packets.json` reproduces the closed-book construct -> the SAME VOID.
**How to avoid:** Build an INDEPENDENT `.lz-research`-shaped run dir via session retrieval (disconfirming query). The gold's evidence is the broader literature.
**Warning sign:** The gold's logged URLs match the voter's `source_independence_note` sources 1:1 with no new primary source.

### Pitfall 2: Treating UNCLEAR/NEI as a binary verdict
**What goes wrong:** Coercing not-enough-evidence into SUPPORTED or NOT-SUPPORTED hides the over-refusal signal (the SUPPORTS-vs-NEI boundary IS the signal).
**How to avoid:** Map NEI/conflicting -> RESIDUE, exclude from the binary denominator, route to human (D-06/D-08).

### Pitfall 3: A `0` credit reading misread as free
**What goes wrong:** `parseCredits` can return null (UNMEASURED); a naive sum treats it as 0.
**How to avoid:** `buildCreditsRecord` returns `null` when uncaptured; disclose "UNMEASURED -- verify dashboard," never 0. The ANSI-strip fix captures per-call values; they are PER-CALL (non-monotonic), so SUM them.

### Pitfall 4: Growing or shrinking N after a read (optional stopping)
**What goes wrong:** Re-fetching or re-confirming "until it passes."
**How to avoid:** Freeze the snapshot + the denominator before any re-scored vote; the denominator is computed once from the frozen gold. Report the realized N; never relax TAU.

## Code Examples

### Reuse the batched OOF over open-book evidence (gold-blind), parameterized for over-refusal
```javascript
// openbook-oof-gold.mjs (gitignored eval/.cache/p21-live/); dispatch guarded by isCliEntry + requireSpend.
// Source pattern: eval/.cache/p20-live/armB-oof-gold.mjs (VERIFIED read) -- only the evidence source changes.
import { makeCopilotCallModel, FROZEN_OOF_PAIR } from '../../lz-eval-live-cert.mjs';
import { adjudicateNativeRefutedGold } from '../../lz-eval-armA-native.mjs';
import { COPILOT_CMD, makeWinRunner, buildCreditsRecord, isCliEntry } from '../p20-live/oof-transport-lib.mjs';
// candidates carry { uid, claim, evidence:[{sentence}] } from the OPEN-BOOK bundle (NOT the voter excerpt).
// expectedEntailment:'true' -> RETAIN = the OOF pair all-agree the OPEN-BOOK evidence DOES support the claim.
// A split / not-supported / NEI read EXCLUDES the control (Guerdan) + routes to human.
```

### Two-sided reclassify -> frozen CP (reused byte-identical)
```javascript
// reuse rejudication-lib.mjs reclassify + decideScopedSensitivity (VERIFIED read); feed the OPEN-BOOK gold.
// validN = nUnReadjudicated(=0 when all 30 re-adjudicated) + supportedInSample; overRefusals = SUPPORTED & voter-refuted.
// clopperPearsonUpperOneSided(overRefusals, validN) <= EVAL_THRESHOLDS.TAU_OR (0.15).
```

## State of the Art

| Old Approach (20-05) | Current Approach (Phase 21) | Why |
|----------------------|-----------------------------|-----|
| Closed/knowledge OOF gold ("EVIDENCE AND your knowledge of the literature") | Open-book live-web logged-evidence gold | The board's Q1 ruling: a closed gold cannot judge an open-book voter |
| Voter excerpt as the only evidence | Independent broad live-web retrieval per control | Surface the literature the voter reached (construct match) |
| One-field verdict | Two-field (groundedness + validity) | Make an over-refusal attributable to retrieval gap vs reasoning error |

**Deprecated/outdated:** `rejudicate.mjs`'s closed-book prompt is the construct-mismatched gold being replaced (keep the lib's reclassify/CP; swap the evidence source).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The open-book denominator re-adjudicates ALL 30 controls (not a 4+k blind sample) so `reclassify` is reusable with `sampleUids = 30` | Seam 2, Pattern 1 | If the plan keeps the 4+k blind-sample design, `nUnReadjudicated` logic stays as-is (still reusable); low risk |
| A2 | The OOF per-call credit cost is ~8 (the arm-B baseline); the full N is ~30 controls in batches of <=8 -> ~4-6 calls + the 1-2 spike | D-03/D-12 | The pre-flight spike is the guard -- if higher, HALT+RAISE; the estimate only sizes the disclosure |
| A3 | The session-written open-book run dir uses the SAME `claims/`/`excerpts/`/`sources/` layout the extract worker emits, so `joinClusterEvidence` consumes it unchanged | Seam 1 | If the layout diverges, `openbook-retrieval-log.mjs` must adapt the shape (small, deterministic, tested) |
| A4 | kappa ~0.44-0.68 and Jaccard ~0.3 are reasonable open-book expectations (CONTEXT D-08); reported, not gated | Seam 4 | These are reporting expectations only; no gate depends on them |
| A5 | security_enforcement default (enabled); the one-directional eval->runtime import boundary is the load-bearing control for this eval-only phase | Security Domain | Eval tree never ships; no network/secret surface beyond the gitignored cache |

## Open Questions

1. **Re-adjudicate all 30 vs the 4-disputed + blind-agreed sample?**
   - What we know: `rejudication-lib.selectRejudicationSample` did 4 disputed + k=6 agreed; full-30 is cleaner for an open-book denominator.
   - Recommendation: re-adjudicate ALL 30 open-book (the gold is fresh; the cost is ~4-6 batched OOF calls; it removes the "un-re-adjudicated assumed valid" caveat). Pre-register N before scoring either way.

2. **In-prompt 4-way enum vs SUPPORTED/NOT-SUPPORTED/UNCLEAR then node-collapse?**
   - Recommendation: keep the model output to SUPPORTED/NOT-SUPPORTED/UNCLEAR (proven parser `parseRejudication`); collapse NEI/conflicting -> RESIDUE off-model. If the AVeriTeC 4-way is wanted explicitly, extend the enum + collapse in `openbook-lib.mjs` (tested). Either is within Claude's discretion (D).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| node | All eval scripts | yes | v24.13.0 | -- |
| jstat | `clopperPearsonUpperOneSided` (frozen, indirect) | yes | 1.9.6 (eval devDep) | -- (consumed only inside lz-eval-aggregate.mjs) |
| Copilot CLI | OOF judgment ONLY (metered) | yes | `C:\Users\...\.local\bin\copilot.cmd` (COPILOT_CMD) | none -- the gold cannot be built without OOF judgment (HALT+RAISE if unavailable) |
| Claude session pool (Agent tool: search/extract workers) | Live-web retrieval (OBG-01) | yes (session-driven; not node) | -- | none -- retrieval is the construct fix |
| WebSearch / WebFetch (worker tools) | Retrieval workers | yes | -- | none |

**Missing dependencies with no fallback:** none currently (all present). If Copilot CLI or the session Agent tool is unavailable at spend time, HALT + RAISE (the gold cannot be built).

## Validation Architecture

> nyquist_validation = true (config). This section drives VALIDATION.md generation.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | `node:test` (Node v24.13.0 stdlib), zero-dep |
| Config file | none -- per-file `*.test.mjs` |
| Quick run command | `node --test eval/openbook-lib.test.mjs` (FILE form -- never the dir form) |
| Full suite command | run each `eval/*.test.mjs` + the new `eval/.cache/p21-live/*.test.mjs` by explicit file (the dir form spuriously exits 1 on this host) |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command / Observation | File Exists? |
|--------|----------|-----------|---------------------------------|--------------|
| OBG-01 | Open-book gold evidence comes from independent live-web session retrieval, not the voter excerpt / training knowledge / Copilot search | empirical-spike + deterministic | Pre-flight D-12 spike OBSERVES the gold's logged URLs include broader-literature primary sources (e.g. the transformer "overestimates" source); `openbook-retrieval-log.test.mjs` asserts the builder reads the session run dir + emits logged URL/quote/fetched_at | Wave 0 |
| OBG-02 | Two-field record (groundedness + validity); 4-way -> frozen binary | deterministic | `openbook-lib.test.mjs`: 4-way->binary mapping table (supported->SUPPORTED, refuted->NOT-SUPPORTED, NEI/conflicting->RESIDUE); record-shape assertion | Wave 0 |
| OBG-03 | Meta-source blocklist drops own fact-check/leaderboard/dataset; pinned timestamps; frozen snapshot | deterministic | `openbook-retrieval-log.test.mjs`: inject a blocklisted URL -> asserted DROPPED; assert `fetched_at` preserved + snapshot frozen/stable across re-read | Wave 0 |
| OBG-04 | FROZEN OOF pair judges gold-blind; non-unanimity -> RESIDUE + human | deterministic | `openbook-oof-gold.test.mjs` (stub callModel, NO spend): assert `FROZEN_OOF_PAIR` used; `consensusLabel` split -> RESIDUE; residue routed (not coerced) | Wave 0 |
| OBG-05 | Re-score frozen Sonnet votes two-sided; numerator/denominator recompute | deterministic | `openbook-rescore.test.mjs`: SUPPORTED+refuted -> over-refusal counted; NOT-SUPPORTED+refuted -> DROPS from validN; NOT-SUPPORTED+unrefuted -> missed-false-uphold surfaced; RESIDUE excluded | Wave 0 |
| OBG-06 | Pre-registration freeze before any re-scored vote; no optional stopping; arms not pooled | manual-only (process) + deterministic | The committed lock-rule doc precedes the spend commit (git history ordering); `openbook-rescore.test.mjs` asserts the denominator is the frozen N (a grown/shrunk arm fails closed) | Wave 0 (doc) |
| OBG-07 | Frozen CP gate byte-identical -> SCOPED / DOES-NOT-WORK / VOID->RAISE; no WORKS | deterministic | `openbook-rescore.test.mjs`: `clopperPearsonUpperOneSided(0,30)~=0.117` PASS, `(1,30)~=0.149` PASS, `(2,30)`>0.15 BREACH; empty `git diff` on frozen seams (byte-identity) | Wave 0 |
| OBG-08 | Credits minimized; pre-flight spike HALTs+RAISEs if per-item >> estimate | empirical-spike + deterministic | D-12 spike: capture per-call credits via `buildCreditsRecord` (ANSI-strip); `openbook-oof-gold.test.mjs` asserts `requireSpend` throws on `LZ_SPEND` unset + batching used | Wave 0 (test) / spike (cost) |
| OBG-09 | Every LLM-task script reviewed + unit-tested; eval never ships | deterministic + manual-review | Each new script has a FILE-form `.test.mjs` (above), mutation-verified discriminating; independent adversarial review recorded; assert no eval import in any plugin-tree file (one-directional) | Wave 0 |

### Sampling Rate
- **Per task commit:** the changed module's `.test.mjs` (FILE form).
- **Per wave merge:** the full new `eval/.cache/p21-live/*.test.mjs` group + the touched frozen-seam byte-identity `git diff` check.
- **Phase gate:** full new suite green + frozen seams byte-identical BEFORE the metered spend; the re-score result after the spend.

### Wave 0 Gaps
- [ ] `eval/.cache/p21-live/openbook-lib.test.mjs` -- OBG-02, OBG-05 (pure units: map, reclassify, kappa/Jaccard)
- [ ] `eval/.cache/p21-live/openbook-retrieval-log.test.mjs` -- OBG-01, OBG-03 (blocklist, snapshot, run-dir read; tmp-fixture)
- [ ] `eval/.cache/p21-live/openbook-oof-gold.test.mjs` -- OBG-04, OBG-08 (stub callModel, requireSpend guard, residue)
- [ ] `eval/.cache/p21-live/openbook-rescore.test.mjs` -- OBG-05, OBG-07 (two-sided recompute + CP anchors)
- [ ] Lock-rule doc (`21-OPENBOOK-LOCK-RULE.md` or equivalent) committed BEFORE the spend (OBG-06)
- [ ] Independent adversarial review record (Explore subagent) before the spend (OBG-09)
- Framework install: none (node stdlib).

*(Note: the new test files live under gitignored `eval/.cache/p21-live/` like the 20-05 driver tests, so they are NOT tracked commits -- the review record is the artifact, mirroring the 20-05 step-3 discipline.)*

## Security Domain

> security_enforcement treated as enabled (absent = enabled). This is an eval-only phase: no shipped runtime surface, no auth, no user data.

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V5 Input Validation | yes | `safeId` (T-19-TRAVERSE) on every content-derived id used as a path/key; fail-closed JSON reads (`readJson` BOM-safe); listJson sorted fail-closed |
| V6 Cryptography | no (only sha256 fingerprint for cache keying via `evidenceSha`) | `node:crypto` `createHash` -- not a security control, a cache equivalence key |
| V12 / Files | yes | Windows filename safety: `::` -> `__`, `:` -> `_`, then `safeId`; no traversal out of the gitignored cache dir |
| V2/V3/V4 Auth/Session/Access | no | No auth surface; the spend gate is `LZ_SPEND`/`requireSpend`, a cost control, not authn |

### Known Threat Patterns
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Eval dependency leaking into the shipped plugin | Elevation/Tampering | One-directional eval -> runtime import boundary (verify no eval import in plugin tree); eval tree never ships |
| Crafted uid traversing out of the cache dir | Tampering | `safeId` on every uid/excerpt_id before path use |
| Unauthorized Copilot spend | (cost) | `requireSpend('callOof')` / `LZ_SPEND=1`; `isCliEntry` so import never dispatches; the 1-2 item HALT+RAISE guard |
| Secret/transcript written to a tracked path | Information disclosure | OOF transcripts + credits land ONLY in gitignored `eval/.cache/p21-live/` |
| Result-shopping (optional stopping) | Tampering (integrity) | Pre-registration freeze + frozen N denominator (fail-closed on grown/shrunk arm) + arms never pooled |

## Sources

### Primary (HIGH confidence -- read this session)
- `eval/lz-eval-live-cert.mjs` -- FROZEN_OOF_PAIR, makeCopilotCallModel, makeOofAdjudicator, classifyAdjudicationResidue, scoreArmFromVotes, freezeArms, requireSpend, persistDualRunVote
- `eval/lz-eval-oof-batch.mjs` -- makeBatchedOofProbe, prepareBatches, packBatches, runContaminationGate, RUBRIC_PREAMBLE
- `eval/lz-eval-evidence-join.mjs` -- joinClusterEvidence, EXCERPT_CHAR_CAP, stripBibliographicMetadata
- `eval/lz-eval-armA-native.mjs` -- adjudicateNativeRefutedGold (expectedEntailment param), oofPacketFor, evidenceSha cache
- `eval/lz-eval-aggregate.mjs` -- EVAL_THRESHOLDS (TAU_OR 0.15, N_CTRL_FLOOR 24), clopperPearsonUpper
- `eval/.cache/p20-live/armB-oof-gold.mjs` + `armB-oof-gold-result.json` -- the frozen 30 confirmed_uids + the driver parameterized for over-refusal
- `eval/.cache/p20-live/oof-transport-lib.mjs` -- RUN_DIRS, COPILOT_CMD, makeWinRunner, parseCredits (ANSI), buildCreditsRecord, isCliEntry
- `eval/.cache/p20-live/rejudication-lib.mjs` + `rejudicate.mjs` -- the TWO-SIDED reclassify -> CP pipeline (closed-book prompt = the construct being fixed)
- `eval/.cache/p20-live/votes/sonnet/ctrl/*.json` (30) + `armB-over-refusal-score.json` (4/30, CP 0.28) + `armB-control-packets.json` (the voter excerpts -- NOT the gold source)
- `eval/lz-eval-live-cert-driver.md` + `eval/lz-eval-live-lock-rule.md` -- the Stage 0/1/2/3 runbook + pre-registration prose to mirror
- `plugins/lz-advisor/agents/research-search-worker.md` + `research-extract-worker.md` -- the Claude live-web retrieval (tools, receipts, immutable excerpt + fetched_at contract)
- `.planning/phases/21-.../21-CONTEXT.md` (D-01..D-14) + `.planning/REQUIREMENTS.md` (OBG-01..09) + `.planning/STATE.md` (the 20-05 RAISE trail)
- `.planning/config.json` -- nyquist_validation true, context_window 1000000

## Metadata

**Confidence breakdown:**
- Standard stack / seams: HIGH -- every cited seam read directly; reuse-vs-add boundary is explicit.
- Re-score data flow: HIGH -- `reclassify`/`scoreArmFromVotes`/`clopperPearsonUpperOneSided` read directly; the 4/30 + frozen votes confirmed on disk.
- Open-book retrieval wiring: MEDIUM-HIGH -- the worker contract + run-dir layout read; the exact session-driven dispatch is Claude's discretion (D).
- Cost estimate: MEDIUM -- ~8 credits/call from the arm-B baseline (learning M-1); the D-12 spike is the guard.

**Research date:** 2026-06-21
**Valid until:** 30 days (the frozen seams are stable; the live-web snapshot is pinned at retrieval time).
