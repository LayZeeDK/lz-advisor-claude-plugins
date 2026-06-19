---
phase: 19-search-extract-worker-agents
verified: 2026-06-19T20:30:00Z
status: passed
score: 5/5 must-haves verified (7/7 requirements satisfied)
overrides_applied: 0
re_verification:
  previous_status: none
  previous_score: n/a
  gaps_closed: []
  gaps_remaining: []
  regressions: []
---

# Phase 19: Search + extract worker agents -- Verification Report

**Phase Goal:** The fetch/extract worker (Sonnet, stores each fetched excerpt immutably at fetch time and extracts falsifiable claims) and the search worker are authored against the frozen schema, each least-privilege, each writing immutable evidence to the run dir and returning only a one-line receipt -- with the search worker's model tier chosen FROM the Phase-18 Haiku research/eval outcome. AMENDED (RE-PLAN-12): the autonomous-search loop ALSO hosts the OFFLINE confound-robust MCC SCREEN (relocated EVAL-01/02/04), which GATES progression but NEVER certifies WORKS.

**Verified:** 2026-06-19T20:30:00Z
**Status:** passed
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths (ROADMAP Success Criteria -- the contract)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | A search worker (model tier from the Phase-18 outcome, `[WebSearch, Write]`) returns source candidates for a sub-angle, dispatchable once per sub-angle for the fan-out | VERIFIED | `plugins/lz-advisor/agents/research-search-worker.md` -- `model: sonnet` (Phase-18 pursue-Haiku-first DISPOSITION + ROADMAP "model tier follows the Phase-18 outcome"; Sonnet-default ships, the Haiku flip is settled at the live stage per RE-PLAN-12), `tools: ["WebSearch", "Write"]`, writes `candidates/<worker-id>.json`, description states "dispatchable once per sub-angle for the parallel fan-out" |
| 2 | An extract worker (Sonnet, `[WebFetch, Write]`) stores each fetched excerpt immutably at fetch time as the evidence artifact | VERIFIED | `plugins/lz-advisor/agents/research-extract-worker.md` -- `model: sonnet`, `tools: ["WebFetch", "Write"]`, Step 1 "store the excerpt verbatim at fetch time" -> `excerpts/<excerpt-id>.txt`, "the immutable evidence the quote re-check runs against ... stored exactly as fetched, not summarized" |
| 3 | The extract worker extracts falsifiable claims, each bound to a verbatim quote, stored-excerpt id, and source metadata, conforming to the frozen Phase-17 schema | VERIFIED | research-extract-worker.md Step 3 -- claim record `{ id, text, quote, excerpt_id }`, "Extract only FALSIFIABLE claims", quote must be VERIFIED verbatim substring of the stored excerpt before writing; Step 4 source record `{ id, url, title, fetched_at }`; round-trips through the FROZEN aggregator (see SC 4 + AGG-03 below) |
| 4 | Each worker writes evidence to the run dir and returns only a one-line receipt under a char cap; the main session never holds raw source text | VERIFIED | Both agents -- "Return exactly ONE line, at most ~200 characters, counts-only, with NO raw search-result text / source text or quotes"; `lz-eval-worker-contract.test.mjs` (in the 389 green suite) asserts the receipt + ownership + recipe contract against the SHIPPED .md files; round-trip fixture proves the aggregator accepts the on-disk evidence (the consumer reads the files, not the session) |
| 5 | (RE-PLAN-12) The offline read is a confound-robust SCREEN (NOT a WORKS certificate): the healthy dense-trap false-uphold arm (Estimand A) reports a scoped (NOT WORKS) result; the verdict mechanism is an MCC SCREEN over manual contrastive minimal-pairs with a PRE-REGISTERED bar + a dual-baseline artifact guard; a guard-pass SCREEN-PASS GATES progression to Phase-20 live; offline NEVER certifies WORKS | VERIFIED | `eval/lz-eval-mcc.mjs` (MCC + BCa-bootstrap + label-permutation + frozen bar 0.5/0.05/0), `eval/lz-eval-baseline-guard.mjs` (dualBaselineGuard, lexical + claim-only, chance=MCC 0), `eval/lz-eval-contrastive-screen.mjs` (decideContrastiveScreen `gate` iff guard+bar all clear, label SCREEN-PASS/PROVISIONAL, `provisional` ALWAYS true); manifest pre-registration timestamped `2026-06-19T16:07:00Z` before authoring; Task 9 human-confirmed SCREEN-PASS (guard PASS, MCC 1.0, BCa lower-CI 1.0, permutation p ~0.0002); spot-check confirms `gate` at runtime + always-refute MCC=0 (F4) |

**Score:** 5/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `plugins/lz-advisor/agents/research-search-worker.md` | Search worker, `[WebSearch, Write]`, candidates/, one-line receipt | VERIFIED | 139 lines, substantive; least-privilege grant + search-and-stop protocol + >=3-query floor + disconfirming query + source-independence dedup; `model: sonnet`, `maxTurns: 6` |
| `plugins/lz-advisor/agents/research-extract-worker.md` | Extract worker, Sonnet, `[WebFetch, Write]`, immutable excerpt + falsifiable claims | VERIFIED | 189 lines, substantive; verbatim excerpt-at-fetch, canonical-URL recipe (D-08/D-13), claim+source records to frozen schema, percent-encoded filename (not hash) |
| `.../__fixtures__/worker-output-roundtrip/` (claims/excerpts/sources) | AGG-03 round-trip fixture | VERIFIED | Shaped exactly as the extract worker emits; claim `text` is a PARAPHRASE distinct from the verbatim `quote` (non-tautological); source filename is the percent-encoded canonical key |
| `eval/lz-eval-mcc.mjs` | MCC + BCa-bootstrap + label-permutation + pre-registered bar | VERIFIED | matthewsCorrelation (degenerate -> 0, F4), mccFromPairs, bcaBootstrapLowerCI (jstat quantiles, not hand-rolled), labelPermutationTestMccPositive; bar constants frozen 0.5/0.05/0 |
| `eval/lz-eval-baseline-guard.mjs` | Dual-baseline artifact guard | VERIFIED | lexicalBaselineSeparation + claimOnlyBaselineSeparation + dualBaselineGuard; guardPasses iff BOTH at chance (separation-MCC BCa lower CI <= 0) |
| `eval/lz-eval-contrastive-screen.mjs` | Contrastive-screen harness + SCREEN-PASS/DEMOTE decision | VERIFIED | runContrastiveScreen + decideContrastiveScreen (`gate` iff guard AND mcc>=0.5 AND ci>0 AND p<0.05); label SCREEN-PASS/PROVISIONAL; `provisional` always true; reuses makeBatchedOofProbe (same strict screen, no asymmetric criterion) |
| `eval/__fixtures__/lz-eval-manifest.json` | Pre-registration block (timestamped) | VERIFIED | stage1_pre_registration: contrastive_construction, mcc_screen (`bar_pre_registered_before_authoring: true`, `pre_registered_timestamp: 2026-06-19T16:07:00Z`), dual_baseline_guard, screen_decision_rule, over_refusal_moved_to_live; RE-PLAN-9 synthetic keys preserved as superseded |
| `eval/lz-eval-lock-rule.md` | Pre-registered lock rule + RE-PLAN-12 section | VERIFIED | 857 lines; `## RE-PLAN-12 ... PRE-REGISTERED 2026-06-19T16:07:00Z BEFORE any pair authored/scored`; MCC SCREEN / SCREEN-PASS framing; over-refusal CP gate moved to live; RE-PLAN-7/8/9 sections preserved |
| `eval/lz-eval-aggregate.mjs` (frozen engine) | EVAL_THRESHOLDS + clopperPearsonUpperOneSided byte-identical | VERIFIED | ALPHA 0.05, MIN_K 5, TAU_FU 0.10, TAU_OR 0.15, N_TRAP_FLOOR 36, N_CTRL_FLOOR 24; passAtK/passHatK/countFalseUpholds/lockRuleVerdict present; working tree clean (committed, unmodified by RE-PLAN-12) |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| Extract worker output (claims/excerpts/sources) | Frozen aggregator | round-trip fixture | WIRED | `aggregate(fx('worker-output-roundtrip'))` -> `dropped.length === 0`, a survivor with `quote_fidelity === 'verified'`, canonical key flows into `survivor.sources[]`; claims[].source == source-record id; percent-encoded filename. The fixture's paraphrased `text` != verbatim `quote` proves the quote re-check fired (non-tautological) |
| Shipped agent .md files | Schema canonical-URL recipe + record shapes | `lz-eval-worker-contract.test.mjs` SSOT gate | WIRED | Test READS the agent files; asserts the inlined TRACKING_PARAMS denylist (>=11 keys), utm_ prefix, case-insensitive matching, percent-encoding (not SHA-256), verbatim excerpt, ownership (search->candidates/, extract->sources/), maxTurns>=5, 3-query floor -- all byte-anchored to the deterministic eval set |
| dualBaselineGuard | decideContrastiveScreen | guard runs FIRST; either-separates -> demote | WIRED | A guard fail forces `demote` regardless of MCC (verified by spot-check: guardPasses=false -> demote) |
| matthewsCorrelation + BCa + permutation | decideContrastiveScreen | `gate` iff all four legs clear | WIRED | Spot-check: 12/12/0/0 -> MCC 1.0 -> gate (SCREEN-PASS); each single failing leg -> demote |
| Same 12 dense WiCE trap bundles | manual contrastive minimal-pairs | evidence-side label-flipping edit | WIRED (T-spend-1 substrate; pairs in gitignored eval/.cache/) | SUMMARY: 12/12 claims byte-identical across the pair (F3 claim-side artifact structurally excluded), evidence-side edits, difficulty-matched by construction; guard PASS confirms artifact-free |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| Round-trip fixture -> aggregator | survivors / dropped | committed on-disk claims/excerpts/sources shaped as the extract worker emits | Yes -- verified survivor with the paraphrased claim + the canonical source key; zero drops | FLOWING |
| MCC SCREEN | mcc / mccLowerCI / permutationP | Task-9 OOF judging of 24 contrastive items (frozen gpt-5.5 + gemini-3.1-pro-preview pair; 6 Copilot calls) | Yes -- real spend, 12/12/0/0 confusion matrix, MCC 1.0, human-confirmed | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Always-refute confusion matrix -> MCC 0 (F4 confound broken, not NaN) | `matthewsCorrelation({tp:0,tn:12,fp:0,fn:12})` | `0` | PASS |
| Perfect Task-9 matrix -> MCC 1.0 | `matthewsCorrelation({tp:12,tn:12,fp:0,fn:0})` | `1` | PASS |
| Pre-registered bar constants frozen | import MCC_BAR_POINT/CI_ALPHA/CI_LOWER_FLOOR | `0.5 / 0.05 / 0` | PASS |
| Task-9 inputs -> gate (SCREEN-PASS) | `decideContrastiveScreen({guardPasses:true,mcc:1,mccLowerCI:1,permutationP:0.0002})` | `gate` | PASS |
| Any single leg failing -> demote | guard=false / mcc=0.49 / ci=0 / p=0.05 each | all `demote` | PASS |

### Probe Execution

| Probe | Command | Result | Status |
|-------|---------|--------|--------|
| Full eval-tree suite (FILE-form, 20 files) | `node --test <20 .test.mjs files>` | tests 389, pass 389, fail 0 | PASS |
| Plugin aggregator suite (FILE-form) | `node --test lz-deep-research-aggregate.test.mjs` | tests 41, pass 41, fail 0 | PASS |

(389 eval-tree + 41 plugin = the exact counts claimed in SUMMARY/STATE/ROADMAP.)

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| PIPE-03 | 19-02 | Fan-out parallel web-search workers (~one per sub-angle) returning source candidates | SATISFIED | research-search-worker.md (SC 1); one-per-sub-angle dispatch in the description |
| PIPE-04 | 19-02 | Store the fetched excerpt immutably at fetch time as the evidence artifact | SATISFIED | research-extract-worker.md Step 1 (SC 2); round-trip verified-survivor proves the quote re-check basis |
| PIPE-05 | 19-02 | Extract falsifiable claims bound to a verbatim quote, stored-excerpt id, source metadata | SATISFIED | research-extract-worker.md Steps 3-4 (SC 3); frozen claim/source schema; worker-contract SSOT gate |
| AGG-03 | 19-02 | Workers write evidence to the run dir and return only a one-line receipt (char cap); session never holds raw text | SATISFIED | Both agents' receipt sections (SC 4); worker-output-roundtrip fixture + the round-trip + receipt-format tests (41-test plugin suite) |
| EVAL-01 | 19-03/19-04 | Pre-registered stratified labeled dataset (closed- + open-book) | SATISFIED | lz-eval-dataset.mjs + lz-eval-traps.mjs + lz-eval-wice-traps.mjs (AVeriTeC + WiCE strata); dataset/drift-gate green in the suite |
| EVAL-02 | 19-04 | k>=5; report Pass@1, Pass^k, per-stratum false-uphold | SATISFIED | MIN_K=5, passAtK, passHatK, countFalseUpholds in lz-eval-aggregate.mjs; the per-model false-uphold (Estimand A) read carried byte-identical; the MCC screen is the RE-PLAN-12 confound-robust scalar |
| EVAL-04 | 19-03/19-04 | Lock rule written down BEFORE the eval runs (no post-hoc rationalization) | SATISFIED | lz-eval-lock-rule.md + manifest pre-registration; the MCC bar FROZEN + TIMESTAMPED 2026-06-19T16:07:00Z before any pair authored/scored (Task 8 before Task 9); prose==code anti-drift test green |

No orphaned requirements: REQUIREMENTS.md maps PIPE-03/04/05, AGG-03, EVAL-01/02/04 to Phase 19; all are claimed by 19-02/19-03/19-04 and verified above.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| (none) | -- | No TBD/FIXME/XXX debt markers; no TODO/HACK/PLACEHOLDER/"coming soon"/"not implemented" in the phase-19 agent files or the 3 NET-NEW modules | -- | Clean |

### Human Verification Required

None. Phase 19 produces no end-user UI; the only human gate was the Task-9 SPEND boundary (the OOF MCC scoring), which was already HUMAN-CONFIRMED on 2026-06-19 (SCREEN-PASS, no auto-lock) per STATE.md, the 19-04 SUMMARY, and the ROADMAP `[x]` mark. No `<verify><human-check>` blocks were deferred to end-of-phase (all 8 `<verify>` blocks in 19-04-PLAN.md use `<automated>` checks). The runnable mechanisms were verified directly via the FILE-form test gates + behavioral spot-checks.

### Gaps Summary

No gaps. All 5 ROADMAP success criteria and all 7 requirements are achieved in the codebase.

**By-design Phase-20 deferrals (NOT gaps -- correctly scoped out per RE-PLAN-12, 19-04-REPLAN-DECISION-12.md):**

- The over-refusal CP gate (CP-upper <= TAU_OR 0.15, N_ctrl >= 24) MOVES to the Phase-20 LIVE arm. Offline cannot construct a difficulty-matched-AND-real positive arm (the synthetic attempt RE-PLAN-9/10/11 was RETIRED, board-unanimous, twice).
- Full-WORKS certification is exclusively a Phase-20 LIVE obligation (the SDT positive-trials constraint F5/F7: a valid sensitivity/WORKS verdict mathematically requires positive trials -> trap-only cannot certify). The offline MCC SCREEN GATES progression but the output label is SCREEN-PASS / PROVISIONAL, never WORKS -- and the code enforces this (`provisional` is ALWAYS true).
- The Haiku-vs-Sonnet worker-tier flip is settled at the live stage; Sonnet-default ships regardless (both workers are `model: sonnet`, the extract worker explicitly "fixed Sonnet: the extract step is trust-critical and is not gated").
- 19-05 is SUPERSEDED-BY-RE-PLAN-12 and correctly does not execute (the offline relative Haiku-MINUS-Sonnet read is subsumed by the staged design).

These are all explicitly addressed in the Phase 20 ROADMAP goal + success criteria (SC 6) and are NOT actionable Phase-19 gaps. The framing in `verification_focus` ("WORKS not certified offline" and "over-refusal not run offline" are BY DESIGN) is confirmed correct against the code, the decision record, and the amended ROADMAP.

---

_Verified: 2026-06-19T20:30:00Z_
_Verifier: Claude (gsd-verifier)_
