---
phase: 21-live-web-open-book-over-refusal-gold-and-arm-b-re-run
plan: 04
subsystem: eval
tags: [eval, open-book-gold, live-web-retrieval, session-pool, pre-registration, adversarial-review, zero-copilot-spend, gitignored]

# Dependency graph
requires:
  - phase: 21-live-web-open-book-over-refusal-gold-and-arm-b-re-run
    plan: 01
    provides: "openbook-lib.mjs (mapAveritecToBinary, filterMetaSources, cohenKappa, evidenceJaccard) + openbook-rescore.mjs (two-sided re-score + frozen CP gate)"
  - phase: 21-live-web-open-book-over-refusal-gold-and-arm-b-re-run
    plan: 02
    provides: "openbook-retrieval-log.mjs (the deterministic run-dir reader + meta-source blocklist + uid-keyed sorted-key snapshot freeze)"
  - phase: 21-live-web-open-book-over-refusal-gold-and-arm-b-re-run
    plan: 03
    provides: "openbook-oof-gold.mjs (the LZ_SPEND-gated OOF gold driver + LZ_SAMPLE cap; consumes the frozen snapshot)"
  - phase: 20-orchestrator-skill-headless-scale-confirmation
    provides: "armB-oof-gold-result.json (the frozen 30 confirmed_uids) + armB-control-packets.json (claim text only) + votes/sonnet/ctrl (the frozen Sonnet votes)"
provides:
  - "openbook-normalize-claims.mjs: the NET-NEW deterministic worker-output -> builder-contract normalizer (inject uid+claim from packets, propagate top-level source to each claims[] entry); FILE-form mutation-verified node:test (8/8, empirically discriminating against the frozen builder)"
  - ".lz-research/p21-openbook: the session-written run dir (candidates/claims/excerpts/sources) for the frozen 30 controls"
  - "eval/.cache/p21-live/openbook-evidence.json: the FROZEN, blocklist-filtered, byte-stable uid-keyed sorted-key open-book evidence snapshot (30 controls, 0 retrieval gaps, 159 evidence items; sha256 9faee64a)"
  - "21-OPENBOOK-LOCK-RULE.md: the COMMITTED pre-registration (frozen N, two-sided rule, CP estimator, TAU_OR ref, snapshot hash, blocklist, 4-way->binary rule) -- the anti-result-shopping anchor BEFORE any spend"
  - "review-openbook-nospend.md: the independent adversarial review of the Plans 01-03 + normalize no-spend build (CLEAN-WITH-NOTES; 9/9 gating dimensions PASS; 3 LOW non-gating diagnostic findings resolved-as-documented)"
affects: [21-05]

tech-stack:
  added: []
  patterns:
    - "Orchestrator-driven live-web retrieval: gsd-executor lacks Agent/WebSearch/WebFetch, so Plan 04 runs INLINE in the orchestrator, fanning out the real lz-advisor:research-search-worker + research-extract-worker plugin agents (loaded via --plugin-dir) over the frozen 30 controls, batched <=5, receipt-only"
    - "Worker-output -> builder-contract bridge: dispatch the extract worker with worker-id = percentEncodeKey(uid) so it writes claims/<encoded-uid>.json directly; a deterministic normalize pass injects the control claim (from packets, NEVER the voter excerpt) + propagates the top-level source to each claims[] entry"
    - "OA-preference retrieval: primary publishers (NEJM/nature/science/fda/sciencedirect/ash) bot-block WebFetch, so search workers prefer openly-fetchable PRIMARY sources (arXiv/PMC/europePMC/ACP-Copernicus/NOAA/bioRxiv/NCBI-Bookshelf, Wikipedia/LibreTexts where the best fetchable secondary)"
    - "Pre-registration committed BEFORE any metered spend (git-history ordering); snapshot sha256 pinned in the lock-rule over the gitignored frozen snapshot"

key-files:
  created:
    - "eval/.cache/p21-live/openbook-normalize-claims.mjs (gitignored)"
    - "eval/.cache/p21-live/openbook-normalize-claims.test.mjs (gitignored)"
    - ".lz-research/p21-openbook/ (gitignored run dir: candidates/claims/excerpts/sources for 30 controls)"
    - "eval/.cache/p21-live/openbook-evidence.json (gitignored; the frozen snapshot)"
    - "eval/.cache/p21-live/review-openbook-nospend.md (gitignored; the adversarial review)"
    - ".planning/phases/21-live-web-open-book-over-refusal-gold-and-arm-b-re-run/21-OPENBOOK-LOCK-RULE.md (TRACKED; committed 59f8d4b)"
  modified: []

key-decisions:
  - "NET-NEW normalize helper (openbook-normalize-claims.mjs) bridges an under-specified plan gap: the gold driver reads the control claim from the snapshot (rec.claim) and the frozen builder requires a per-claim source, but the raw extract worker writes neither (its source is top-level, no uid/claim). The helper injects both deterministically (claim from the control packets, never the voter excerpt) -- D-13 reviewed + mutation-tested."
  - "Retrieval ran orchestrator-inline with the REAL plugin retrieval agents (session restarted with --plugin-dir to register lz-advisor:research-search-worker / research-extract-worker). Construct fix confirmed on the named exemplars: transformer/cluster38 -> arXiv over-training/additional-tokens evidence; crispr/cluster47 -> PMC 'gene editing at the erythroid enhancer region of the BCL11A gene' (NOT the voter's excerpt)."
  - "30/30 controls retrieved with evidence, 0 retrieval gaps, 0 blocklisted URLs; snapshot is the pinned uid-keyed sorted-key object, byte-stable (sha256 9faee64a)."

patterns-established:
  - "Pre-flight a large session-pool fan-out: validate the full search->extract->normalize->builder->freeze pipeline on 1-2 exemplar controls (incl. the construct-mismatch cases) before committing all N -- it surfaced the publisher-bot-block fetchability issue and the OA-preference fix early."

requirements-completed: [OBG-01, OBG-03, OBG-06, OBG-09]

# Metrics
duration: ~3h (orchestrator-driven retrieval + build + pre-registration + review)
completed: 2026-06-22
status: awaiting-checkpoint
---

# Phase 21 Plan 04: Live-web open-book retrieval + pre-registration + review Summary

**The construct fix executed end-to-end with ZERO Copilot spend: an independent live-web OPEN-BOOK retrieval ran on the Claude session pool (the real lz-advisor retrieval agents) over the frozen 30 over-refusal controls, surfacing the broader primary literature the voter could reach (NOT the voter's excerpt); the blocklist-filtered evidence is frozen to a byte-stable uid-keyed snapshot (30/30 with evidence, 0 gaps, sha256 9faee64a); the pre-registration lock-rule is COMMITTED before any spend; and the no-spend build passed an independent adversarial review (CLEAN-WITH-NOTES, 9/9 gating dimensions, 67/67 tests). Awaiting the human GO/NO-GO checkpoint before the Plan-05 metered OOF spend.**

## Accomplishments

### Task 1 -- independent open-book retrieval + frozen snapshot
- Built a NET-NEW deterministic normalizer `openbook-normalize-claims.mjs` (+ FILE-form node:test, 8/8) to bridge the worker output to the frozen builder contract -- injects the control `claim` (read ONLY from `armB-control-packets.json`, never the voter excerpt) + the top-level `uid`, and propagates the worker's top-level `source` to each `claims[]` entry (the frozen builder drops source-less claims). Mutation-verified discriminating against the FROZEN `readControlBundle` (empty BEFORE normalization, populated AFTER).
- Ran the retrieval ORCHESTRATOR-INLINE (gsd-executor lacks Agent/WebSearch/WebFetch; the session was restarted with `--plugin-dir` to register the real `lz-advisor:research-search-worker` + `research-extract-worker`). Per control: a disconfirming search -> the orchestrator picked the top openly-fetchable PRIMARY candidate -> an extract worker (worker-id = `percentEncodeKey(uid)`) fetched + stored the verbatim excerpt + quotes + canonical URL + fetched_at into `.lz-research/p21-openbook`. Batched <=5, receipt-only.
- Froze the snapshot via the Plan-02 builder: **30 controls, 30 with evidence, 0 retrieval gaps, 159 evidence items, 0 blocklisted URLs**, uid-keyed sorted-key object, byte-stable (sha256 `9faee64aa93e8c21bbe198924e20494a6e5fc284b7558a0ae4b34863ff912de0`).
- Construct fix verified on the named exemplars: transformer/cluster38 -> arXiv 2403.08540 (additional-tokens-at-scale); crispr/cluster47 -> PMC11374260 ("ex-vivo gene editing at the erythroid enhancer region of the BCL11A gene") -- the gene-vs-enhancer distinction the voter found, from an INDEPENDENT primary source.

### Task 2 -- pre-registration + adversarial review
- Authored + COMMITTED `21-OPENBOOK-LOCK-RULE.md` (commit `59f8d4b`, BEFORE any spend) freezing: the frozen-30 candidate set; the two-sided re-score rule; `TAU_OR` 0.15 (EVAL_THRESHOLDS reference) + `N_CTRL_FLOOR` 24; `clopperPearsonUpperOneSided`; the AVeriTeC-4-way -> binary rule (`mapAveritecToBinary`); the OOF gold-decider identity (gpt-5.5 + gemini-3.1-pro-preview, --effort high, gold-blind, all-agree); the snapshot sha256. States: zero-votes window clean, arms NEVER pooled, no optional stopping, full WORKS OUT (arm A void), Sonnet-default ships, Haiku-first deferred. Hash verified matching the frozen snapshot before commit.
- Independent adversarial review (`review-openbook-nospend.md`, CLEAN-WITH-NOTES): 9/9 gating dimensions PASS (no-spend/no-network guards by runtime probe, LZ_SAMPLE cap, uid-keyed producer/consumer contract, two-sided anti-optional-stopping fail-closed, blocklist enforcement, imported-safeId two-stage path-safety, one-directional eval->runtime import boundary, mutation-discrimination, frozen-seam byte-identity). Full suite 67/67 FILE-form green.

## Decisions Made
- Used the REAL plugin retrieval agents (not general-purpose substitutes) after the maintainer restarted with `--plugin-dir` -- highest fidelity to D-01.
- One primary source per control (acceptance: "one bundle per control"); the OA-preference steer (publisher bot-blocks) was learned in the pre-flight and applied across the fan-out.
- Did NOT code-fix the 3 LOW non-gating review findings: they are all D-08 "reported, never gated" diagnostics (kappa/jaccard degeneracy; quote not substring-checked) that do not enter the CP gate or verdict; the driver is frozen by the committed pre-registration; resolution = report them honestly/caveated in the Plan-05 cert. Documented in the review's ORCHESTRATOR RESOLUTION section.

## Deviations from Plan
- **Normalize helper is net-new** (the plan implied "the extract worker layout consumes unchanged", but the builder needs a per-control claim file with claim text + per-claim source the raw worker does not emit). Resolved with a small reviewed + mutation-tested deterministic helper -- no scope creep; the frozen builder, blocklist, snapshot shape, and no-spend contract are preserved exactly.
- **Fetchability**: primary publishers bot-block WebFetch; mitigated with OA-source preference (arXiv/PMC/NOAA/ACP). One control's source-provenance record (photo21) was completed by hand after its worker was truncated mid-write (no evidence fabricated; excerpt + quotes were already retrieved this run).
- **WebFetch-rendered evidence**: stored excerpts are Claude's WebFetch rendering, not raw HTML -- construct-matched to the open-book voter (which also retrieves via WebFetch); named as a PROVISIONAL note in the lock-rule.

## Known Stubs / Pending
- The Plan-05 metered OOF spend has NOT run (this plan is fully no-spend). The blocking human-verify GO/NO-GO checkpoint is pending the maintainer's "approved" before Plan 05.

## Self-Check: PASSED (no-spend work)
- Snapshot frozen + byte-stable; 30/30 with evidence; 0 blocklisted; plan Task-1 automated verify gate prints `frozen uid-keyed snapshot controls=30`.
- Lock-rule committed (`59f8d4b`) with a snapshot hash matching the frozen JSON; commit precedes any spend.
- Adversarial review CLEAN-WITH-NOTES; full p21-live suite 67/67 FILE-form green; frozen seams byte-identical (`git status` clean).
- Zero Copilot spend in this plan (all retrieval session-pool; the freeze + review + re-score arithmetic are deterministic node).

---
*Phase: 21-live-web-open-book-over-refusal-gold-and-arm-b-re-run*
*Completed (no-spend half): 2026-06-22 -- awaiting GO/NO-GO before Plan 05*
