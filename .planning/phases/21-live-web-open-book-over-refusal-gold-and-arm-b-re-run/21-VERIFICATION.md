---
phase: 21-live-web-open-book-over-refusal-gold-and-arm-b-re-run
verified: 2026-06-22T11:30:00Z
status: passed
score: 6/6 success criteria verified (9/9 OBG requirements accounted for)
overrides_applied: 0
re_verification:
  previous_status: null
  previous_score: null
  note: Initial verification (no prior 21-VERIFICATION.md existed).
notes:
  - "Phase outcome is a PRE-REGISTERED VOID-on-power-RAISE (validN 10 < N_CTRL_FLOOR 24). This is one of the three frozen lock-rule branches, NOT a failure. The phase GOAL was to BUILD + JUDGE + RE-SCORE the construct-matched gold and emit an honest verdict (SCOPED / DOES-NOT-WORK / VOID->RAISE) -- that goal is achieved. The RAISE (a powered open-book-NATIVE control set) is explicitly future work, not this milestone."
  - "REQUIREMENTS.md status table marks OBG-01/03/06 as 'Pending' (line 152/154/157) -- this is STALE plan-time tracking. The actual run artifacts + the 21-04/21-05 SUMMARY requirements-completed lists prove all three are delivered. Recommend the orchestrator flip OBG-01/03/06 to Complete in REQUIREMENTS.md during milestone close."
---

# Phase 21: live-web-open-book-over-refusal-gold-and-arm-b-re-run Verification Report

**Phase Goal:** Resolve the construct mismatch that VOIDed the Phase-20 over-refusal (sensitivity) arm by building a live-web OPEN-BOOK over-refusal gold (adjudicators do the SAME live-web search the voter does), re-run arm B against that gold, and emit a SCOPED sensitivity-only certificate, a clean DOES-NOT-WORK, or an honest VOID->RAISE. Sonnet-default ships regardless; the Haiku-first flip stays deferred.

**Verified:** 2026-06-22T11:30:00Z
**Status:** passed
**Re-verification:** No -- initial verification.

## Goal Achievement

The phase goal -- build + freeze + judge out-of-family + two-sided re-score the construct-matched open-book gold and apply the frozen CP gate honestly -- is **achieved**. The realized verdict is **VOID-on-power-RAISE** (`validN = 10 < N_CTRL_FLOOR 24`), which is one of the three pre-registered lock-rule branches. Per the phase brief, a passing certificate was never the success condition; an honestly-derived verdict from a construct-matched, frozen, out-of-family-judged gold is. Every integrity invariant (frozen snapshot hash, frozen primitives byte-identical, pre-registration-before-spend, one pass, two-sided guard, arms never pooled) holds.

### Observable Truths

| # | Truth (ROADMAP Success Criterion) | Status | Evidence |
|---|-----------------------------------|--------|----------|
| 1 | Live-web OPEN-BOOK gold built by INDEPENDENT live-web search on the Claude session pool (logged canonical URLs + verbatim quotes + fetched_at), NOT training knowledge, NOT Copilot web search | VERIFIED | `.lz-research/p21-openbook/` run dir: 30 candidates, 30 claims, 32 excerpts, 26 source-provenance records. Frozen `openbook-evidence.json`: 30 controls, 159 evidence items, ALL 159 carry url+quote+fetched_at. Retrieval ran via the real `lz-advisor:research-search-worker`/`research-extract-worker` agents (orchestrator-inline, `--plugin-dir`), zero Copilot spend in Plan 04. |
| 2 | Each gold item separates groundedness (retrieval) from validity (judgment), carries an AVeriTeC 4-way label mapped to the frozen binary, honors the meta-source blocklist + a pinned/frozen snapshot | VERIFIED | `openbook-gold-result.json` has separate `groundedness` (urls/quotes/fetched_at, 30 keys) and `validity` (averitec_label + binary + oof_consensus, 30 keys) fields. `mapAveritecToBinary` maps supported->SUPPORTED / refuted->NOT-SUPPORTED / NEI,conflicting,unknown->RESIDUE. D-07 blocklist (snopes/politifact/factcheck/fullfact/paperswithcode/HF-datasets/kaggle-datasets + fact-check/leaderboard/dataset path patterns) enforced via `filterMetaSources`: **0 meta-source URLs in the frozen snapshot** (verified by running `isMetaSource` over all 159 items). Snapshot sha256 = `9faee64a...` matches the lock-rule pin exactly. |
| 3 | FROZEN OOF all-agree pair (gpt-5.5 + gemini-3.1-pro-preview, --effort high, gold-blind) adjudicates over logged evidence; OOF-split/indeterminate excluded from binary denominator + routed to human | VERIFIED | `FROZEN_OOF_PAIR = ['gpt-5.5','gemini-3.1-pro-preview']` (`eval/lz-eval-live-cert.mjs:100`). 30 per-control OOF verdict files tally to {10 all-agree-entail, 20 split, 0 all-agree-not-entail} -- byte-matches `oof_agreement` in the gold. All 20 splits labeled `binary: RESIDUE` (residueReason oof-split), excluded from denominator, routed to human (Guerdan rating-indeterminacy). Gold judged with `expectedEntailment: 'true'`, gold-blind. |
| 4 | Over-refusal arm re-run by RE-SCORING the FROZEN Sonnet votes against the new gold over the reused frozen 30 (two-sided; no new votes; no re-harvest); gold + lock rule pre-registered + frozen before any re-scored vote; arms never pooled | VERIFIED | `openbook-rescore-result.json`: frozen_N=30, `reclassify` byte-identical, sampleUids=all-30 so nUnReadjudicated=0. Two-sided guard operative: `missed_false_upholds_two_sided = 0`. Lock-rule committed `59f8d4b` at 2026-06-22 09:21:04; metered run outputs produced 11:00-11:01 (AFTER). Snapshot frozen 09:18 (before the lock-rule pinned its hash). `note` field: "arms NEVER pooled; arm A structurally void." |
| 5 | Frozen CP gate (CP-upper <= TAU_OR 0.15 over open-book-confirmed denom) yields SCOPED / clean DOES-NOT-WORK / honest VOID->RAISE; full WORKS NOT claimed; Sonnet-default ships; Haiku-first deferred | VERIFIED | Independently recomputed from frozen primitives: `clopperPearsonUpperOneSided(1,10) = 0.3941633...` (exact match), TAU_OR=0.15, N_CTRL_FLOOR=24. validN 10 < 24 -> `VOID-on-power-RAISE` (passCp=false; power dominates). Cert + lock-rule both state full WORKS is OUT (arm A void). `research-verify-voter-sonnet.md` (model: sonnet) ships; `research-verify-voter-haiku.md` exists but is NOT the default (deferred, gated on a powered metric). |
| 6 | Copilot AI Credits minimized (batched OOF + tight packaging + reuse-30 + human-authorized 1-2 item pre-flight spike that HALTs+RAISEs if over estimate); every LLM-feeding script code-reviewed AND covered by code-reviewed unit tests | VERIFIED | `openbook-gold-credits.json`: 59.58 full-N credits (8 calls, 8/8 captured, perCall non-monotonic -> genuinely summed, M-1 trap N/A). Pre-flight LZ_SAMPLE=2 spike = 15.72 credits; total 75.30 << ~100-350 estimate. LZ_SAMPLE cap applied via `records.slice(0,n)` BEFORE dispatch; LZ_SPEND hard-guard throws unless ===1. All 5 eval modules have paired `.test.mjs` (67/67 FILE-form green). Adversarial review `review-openbook-nospend.md` = CLEAN-WITH-NOTES, 9/9 gating dimensions PASS. |

**Score:** 6/6 truths verified.

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `.planning/phases/21-.../21-OPENBOOK-CERT-RESULT.md` | The construct-matched verdict | VERIFIED | Tracked/committed. Documents VOID-on-power-RAISE, the 4 voter-refuted dispositions, PROVISIONAL limits, D-05 scope, 75.30-credit disclosure, no-WORKS/Sonnet-ships/Haiku-deferred statements. |
| `.planning/phases/21-.../21-OPENBOOK-LOCK-RULE.md` | Pre-registration frozen before spend | VERIFIED | Tracked, committed `59f8d4b` BEFORE the metered run. Pins snapshot sha256, frozen N=30, two-sided rule, TAU_OR 0.15, CP estimator, AVeriTeC->binary rule, OOF pair identity, N-floor 24. |
| `eval/.cache/p21-live/openbook-evidence.json` | Frozen snapshot, sha256 9faee64a | VERIFIED | Recomputed sha256 = `9faee64aa93e8c21bbe198924e20494a6e5fc284b7558a0ae4b34863ff912de0` (EXACT match). 30 controls, 159 evidence items, uid-keyed sorted-key object. |
| `eval/.cache/p21-live/openbook-gold-result.json` | 10 SUPPORTED / 20 RESIDUE / 0 NOT-SUPPORTED | VERIFIED | nConfirmed=10, nResidue=20, oof_agreement {10,20,0}, validity tally {SUPPORTED:10, RESIDUE:20}. groundedness + validity two-field separation present. |
| `eval/.cache/p21-live/openbook-gold-credits.json` | 59.58 full-N credits | VERIFIED | totalCredits 59.58, 8/8 captured, perCall non-monotonic (summed, not cumulative). |
| `eval/.cache/p21-live/openbook-rescore-result.json` | overRefusals=1, validN=10, cpUpper=0.3942, VOID-on-power-RAISE | VERIFIED | All fields match exactly; supportedInSample=10, notSupported=0, residue=20, missed_false_upholds_two_sided=0, frozen_N=30, passCp=false, power=VOID-on-power. |
| `eval/lz-eval-*.mjs` (frozen primitives) | byte-identical, no edits | VERIFIED | `git diff --quiet eval/lz-eval-*.mjs` CLEAN (no frozen primitive edited). |
| 5 eval modules + 5 tests under `eval/.cache/p21-live/` | code-reviewed + unit-tested | VERIFIED | lib/normalize-claims/oof-gold/rescore/retrieval-log each have a paired `.test.mjs`. `node --test` (FILE-form) = 67/67 pass. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| live-web retrieval (Claude pool) | frozen snapshot | `openbook-retrieval-log.mjs` builder + blocklist gate | WIRED | 159 items, 0 retrieval gaps, 0 blocklisted, byte-stable sha256. |
| frozen snapshot | OOF gold | `openbook-oof-gold.mjs` (LZ_SPEND-gated, gold-blind) | WIRED | 30 per-control verdict files; evidenceSha pinned per control. |
| OOF gold | rescore | `openbook-rescore.mjs` reclassify (two-sided) | WIRED | validN=10, overRefusals=1, fails closed on grown/shrunk arm. |
| rescore | CP verdict | `clopperPearsonUpperOneSided` + `EVAL_THRESHOLDS` (frozen) | WIRED | Recomputed 0.3942 independently; VOID-on-power-RAISE. |
| lock-rule commit | metered run | git-history ordering (anti-result-shopping) | WIRED | Lock-rule 09:21:04 < run 11:00 -- ordering holds. |

### Requirements Coverage

| Requirement | Source Plan(s) | Status | Evidence |
|-------------|----------------|--------|----------|
| OBG-01 (live-web open-book gold, independent search, Claude pool, not training/Copilot) | 21-02, 21-04 | SATISFIED | `.lz-research/p21-openbook/` run dir + frozen snapshot with logged urls/quotes/fetched_at; zero Copilot spend in retrieval. (REQUIREMENTS.md table shows stale "Pending".) |
| OBG-02 (two-field record: groundedness + AVeriTeC->binary validity) | 21-01 | SATISFIED | Separate groundedness + validity fields in gold; mapAveritecToBinary tested. |
| OBG-03 (bounded leakage: meta-source blocklist + pinned timestamps + frozen snapshot) | 21-02, 21-04 | SATISFIED | 0 meta-source URLs (isMetaSource over all 159); fetched_at on every item; snapshot sha256 frozen + pinned. (REQUIREMENTS.md table shows stale "Pending".) |
| OBG-04 (FROZEN OOF pair, gold-blind, split->residue->human) | 21-03, 21-05 | SATISFIED | FROZEN_OOF_PAIR identity; 20 splits -> RESIDUE -> excluded + human-routed. |
| OBG-05 (two-sided re-score of frozen Sonnet votes over frozen 30; no new votes/re-harvest) | 21-01, 21-05 | SATISFIED | rescore frozen_N=30, reclassify byte-identical, missed_false_upholds_two_sided datum present. |
| OBG-06 (pre-registered + frozen before any re-scored vote; no optional stopping; arms never pooled) | 21-04 | SATISFIED | Lock-rule committed `59f8d4b` before the run; one-pass; arms-never-pooled stated + structurally enforced. (REQUIREMENTS.md table shows stale "Pending".) |
| OBG-07 (frozen CP gate byte-identical -> SCOPED / DOES-NOT-WORK / VOID->RAISE; no WORKS; Sonnet ships; Haiku deferred) | 21-01, 21-05 | SATISFIED | CP gate recomputed exact; VOID-on-power-RAISE; no-WORKS; Sonnet agent ships; Haiku deferred. |
| OBG-08 (Copilot credits minimized: batched + reuse-30 + human-authorized pre-flight spike that HALTs+RAISEs) | 21-03, 21-05 | SATISFIED | LZ_SAMPLE cap before dispatch; 2-control spike (15.72) + 2nd GO/NO-GO; 75.30 total << estimate. |
| OBG-09 (every LLM-feeding script code-reviewed AND code-reviewed unit tests; eval never ships; one-directional import boundary) | 21-01..05 | SATISFIED | 5 modules + 5 tests (67/67); adversarial review CLEAN-WITH-NOTES 9/9; eval->runtime import boundary verified one-directional. |

**All 9 OBG requirements (OBG-01..09) accounted for and SATISFIED.** No orphaned requirements; no requirements deferred. The REQUIREMENTS.md status table is stale (marks OBG-01/03/06 "Pending") -- the run artifacts and SUMMARY `requirements-completed` lists prove delivery; recommend flipping those three to Complete during milestone close.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Frozen snapshot integrity | recompute sha256 | 9faee64a... exact match | PASS |
| CP gate arithmetic | `clopperPearsonUpperOneSided(1,10)` from frozen primitive | 0.3941633... exact | PASS |
| OOF verdict tally | scan 30 per-control verdict files | {10 entail, 20 split, 0 not-entail} | PASS |
| Frozen primitives unchanged | `git diff --quiet eval/lz-eval-*.mjs` | CLEAN | PASS |
| Meta-source blocklist gate | run `isMetaSource` over 159 items | 0 meta-source URLs | PASS |
| FILE-form test suite | `node --test eval/.cache/p21-live/*.test.mjs` | 67/67 pass | PASS |
| Lock-rule precedes spend | git commit time vs artifact mtime | 09:21 < 11:00 | PASS |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| (none) | - | No TBD/FIXME/XXX in source modules; no TODO/HACK/PLACEHOLDER | - | Clean. |

One named PROVISIONAL limit (WebFetch-rendered + OA-preference retrieval; one source-provenance record completed by hand at freeze with no fabricated evidence) is documented transparently in the lock-rule + cert -- not a hidden stub.

### Human Verification Required

None. This is a local-artifact + requirement-traceability verification; all checks were performed deterministically (hash recompute, CP arithmetic recompute, per-control verdict tally, git-history ordering, test run). No visual/real-time/external-service behavior required human judgment.

### Gaps Summary

No gaps. The phase goal -- build, freeze, judge out-of-family, two-sided re-score, and apply the frozen CP gate honestly to produce one of the three pre-registered verdicts -- is achieved. The outcome (VOID-on-power-RAISE: validN 10 < N_CTRL_FLOOR 24; 20/30 OOF-splits; the construct-matched gold is under-powered on the closed-book-selected 30) is a valid, pre-registered, anti-result-shopping-compliant result. The RAISE (a powered verdict needs an open-book-NATIVE control set selected so the gold-decider's open-book consensus is high by construction) is explicitly future work, not this milestone.

Only a non-blocking bookkeeping note: REQUIREMENTS.md still marks OBG-01/03/06 as "Pending" -- stale plan-time tracking contradicted by the run artifacts. Flip to Complete during milestone close.

---

_Verified: 2026-06-22T11:30:00Z_
_Verifier: Claude (gsd-verifier)_
