---
phase: 18-haiku-prompt-engineering-deep-research-verify-voter-early-ga
verified: 2026-06-16T17:05:00Z
status: passed
score: 6/6 must-have truths verified (settle-or-raise achieved via RAISE)
overrides_applied: 0
re_verification:
  previous_status: none
  previous_score: n/a
deferred:
  - truth: "EVAL-01: a pre-registered, stratified >=60-100-claim DEFINITIVE dataset covering BOTH closed-book and open-book is the dataset the gate runs on"
    addressed_in: "Phase 19"
    evidence: "18-05-SUMMARY requirements_relocated_to_phase_19: [EVAL-01, EVAL-02, EVAL-04]; the synthesized-overreach open-book gate VOIDed via saturation, so the DEFINITIVE eval (its curated-gold dataset + autonomous-search run + pre-registered gate) moves to the Phase-19 staged pilot. Phase-18 machinery (loader + committed 70-example manifest) is built and committed; the subtle+open-book stratum that the definitive run needs does not exist in the Phase-18 manifest (0 rows) by the documented structural contradiction."
  - truth: "EVAL-02: the DEFINITIVE eval runs each claim k>=5 and reports Pass@1/Pass^k + per-stratum false-uphold for the gating decision"
    addressed_in: "Phase 19"
    evidence: "18-05-SUMMARY relocates EVAL-02; the aggregator that computes Pass@1/Pass^k/false-uphold/DELTA/Clopper-Pearson is BUILT and unit-passing (eval/lz-eval-aggregate.mjs, 15 tests green), but the definitive k>=5 + reliable=15 RUN moves to the staged pilot. Cheap feasibility pilots (10/10 trap validity, 60 votes) were run and recorded; they saturated."
  - truth: "EVAL-04: the DEFINITIVE pre-registered lock rule the gating verdict is judged against"
    addressed_in: "Phase 19"
    evidence: "18-05-SUMMARY relocates EVAL-04 + records the committed eval/lz-eval-lock-rule.md as superseded by the pilot's gate. A pre-registered lock rule WAS authored and committed before any model call (f497c5a, Plan 18-03) and a re-registered replacement lock rule is recorded verbatim in 18-GATE-RECONCILIATION-CONSULTS.md; the DEFINITIVE pre-registration for the autonomous-search pilot lands in Phase 19."
---

# Phase 18: Haiku prompt-engineering deep research + verify-voter + early gating eval -- Verification Report

**Phase Goal:** The Haiku verify-voter is engineered from a deep-research pass (EVAL-05) BEFORE any Haiku agent; the Sonnet baseline + research-grounded Haiku verify-voter are authored against the frozen vote schema; and the pre-registered gating eval runs standalone -- SETTLING the Haiku-first flag, OR RAISING the decision to the user if Haiku is non-viable (EVAL-03). Sonnet-default ships regardless.

**Verified:** 2026-06-16T17:05:00Z
**Status:** passed
**Re-verification:** No -- initial verification

## How the goal was achieved (SETTLE-OR-RAISE -> RAISE)

The phase goal is an explicit disjunction: SETTLE the flag OR RAISE to the user if Haiku is non-viable. It was achieved via the **RAISE** branch, which EVAL-03 names as a first-class outcome:

1. The pre-registered "SUBTLE open-book" hard gate had **zero satisfiable data** -- a structural contradiction among the locked decisions (D-02 makes the subtle spine WiCE/closed-book; D-05 confines open-book retrieval to AVeriTeC's KS; D-02c excludes AVeriTeC's overreach class). Verified directly in the committed manifest: `stratum=subtle AND book=open` = **0 of 70 rows**.
2. The contradiction was discovered at the Plan 18-05 pre-flight, **before any model call** (zero votes cast), and re-deliberated via a 3-family consult that converged on a replacement gate (programmatically synthesized subtle-overreach traps, voted open-book). Re-registering before the first vote preserves pre-registration integrity (legitimate).
3. Cheap feasibility pilots (10/10 traps judged genuine; 60 votes Haiku-vs-Sonnet) **SATURATED** -- Haiku 0/30 false-upholds, Sonnet 0/30, DELTA = 0. Per the pre-registered saturation rule, both-models-ace => the stratum is NON-DISCRIMINATING => a zero-excess result is **VOID, not a PASS**.
4. Because the gate could not positively clear Haiku, the decision was **RAISED to the owner** (EVAL-03). The owner decided to **PURSUE Haiku-first via a staged autonomous-search pilot** (Phase 19/20). Sonnet-default ships; the Haiku variant stays authored behind the OFF flag.

This is a legitimate, well-evidenced EVAL-03 raise. The standalone-gating-eval machinery is BUILT (aggregator, dataset loader, lock-rule prose, both voter agents); the DEFINITIVE numeric gate relocates to the staged pilot because the synthesized open-book gate VOIDed.

## Goal Achievement

### Observable Truths (mapped to ROADMAP Success Criteria)

| #   | Truth | Status | Evidence |
| --- | ----- | ------ | -------- |
| 1 (SC-1) | EVAL-05: a deep-research-grounded Haiku prompt-engineering reference exists and PRECEDES any Haiku agent; lz-nx-ai MODEL-OPTIMIZATION-HAIKU.md treated as non-authoritative | VERIFIED | `plugins/lz-advisor/references/lz-haiku-prompt-engineering.md` (260 lines): D-08 fairness framing first, H1-H12 each with `[CITED: claude-4-best-practices ...]` tags, `[ASSUMED]` preserved on H7/H10, stale-pattern section (budget_tokens/prefill/CRITICAL-MUST-NEVER), names lz-nx-ai as NON-authoritative. Committed 08876be (Plan 18-01) BEFORE the Haiku agent 459b4fd (Plan 18-05) -- precedence proven by commit order. ASCII-only. |
| 2 (SC-2) | Sonnet baseline (ship default) + research-grounded Haiku verify-voter; isolated skeptic vote; attack-mode diversification; disconfirming search recorded; source-independence weighting | VERIFIED | Both agents exist + tracked + committed (459b4fd). sonnet=`model: sonnet`/color green; haiku=`model: haiku`/color blue. Both carry `verdict`/`attack_mode`/`disconfirming_query`/`source_independence_note`, the 3 attack modes, the negation-search instruction, and source-independence collapse. Haiku is XML-tagged + `<examples>`-driven + plain-phrasing (no CRITICAL/MUST/NEVER, no budget_tokens, no prefill) -- demonstrably derived from the EVAL-05 reference (names it), NOT a model-swapped Sonnet copy. |
| 3 (SC-5) | Haiku-first flag exists, defaults OFF, flips ON only on the eval clearing; if non-viable the decision is RAISED to the user; Sonnet-default ships in the interim (EVAL-03/COST-02) | VERIFIED | Haiku agent description states OFF-by-default until the gating eval clears it; Sonnet is the ship default. The lock rule (`eval/lz-eval-lock-rule.md`) encodes flip-ON only on all-three-gates-clear else FAIL-RAISE-to-user. EVAL-03 was genuinely exercised: contradiction -> 3-family re-deliberation -> saturating pilots (VOID) -> raise-to-user -> owner PURSUE-via-pilot (18-EVAL-GATE-CONTRADICTION.md, 18-GATE-RECONCILIATION-CONSULTS.md, 18-HAIKU-PILOT.md, 18-05-SUMMARY). |
| 4 | Deterministic off-model gate engine built: Pass@1/Pass^k + per-stratum false-uphold + Haiku-minus-Sonnet DELTA + library-computed Clopper-Pearson + mechanical lock-rule verdict | VERIFIED | `eval/lz-eval-aggregate.mjs` (13964 bytes); `node --test` = 15/15 pass. Library-wired anchors asserted (CP(0,15)~=0.218, beta.inv(0.2,3,3)~=0.327, combination(15,3)===455); NO hand-rolled logGamma/incbeta/betaInv (only an absence-asserting comment); discriminating false-uphold + DELTA fixtures; frozen EVAL_THRESHOLDS; four lock-rule verdict paths. |
| 5 | Eval install surface + D-11 packaging boundary built + CI-backstopped; plugin tree stays zero-dep | VERIFIED | `eval/package.json` (private lz-eval, type:module, jstat@1.9.6 exact) + committed `eval/package-lock.json`; `eval/node_modules`+`.cache` gitignored. Packaging-boundary test 2/2 pass (no package.json/node_modules under plugin tree; no plugin-tree .mjs imports eval/). ci.yml + test-act.yml gate the 3 eval-tree tests. Cross-tree import is one-directional (eval -> runtime, verified); the only plugin-tree "eval/" hit is a re-scope COMMENT, not an import. |
| 6 | Zero-hand-authoring stratified dataset loader + committed derived license-compliant manifest + vendored WiCE | VERIFIED | `eval/lz-eval-dataset.mjs` + `node --test` = 15/15 pass (remap D-02d, sha256 fail-closed, gated-401 actionable, stratify, manifest parse, drift gate). `lz-eval-manifest.json` = 70 examples, 30 unrefuted/40 refuted (~43/57, in-band), 17 WiCE subtle. WiCE vendored with ODC-BY/MIT NOTICE; AVeriTeC/LLM-AggreFact manifest-only (no corpus text). |

**Score:** 6/6 must-have truths verified. The phase goal (settle-or-raise the Haiku-first flag) is met via the RAISE branch.

### Deferred Items

Items addressed in a later milestone phase -- NOT actionable Phase-18 gaps. The DEFINITIVE eval relocates to the Phase-19 staged autonomous-search pilot because the standalone synthesized-overreach open-book gate VOIDed via saturation; the Phase-18 machinery for these is built and committed.

| # | Item | Addressed In | Evidence |
|---|------|-------------|----------|
| 1 | EVAL-01: the DEFINITIVE pre-registered stratified dataset the gate runs on (the subtle+open-book stratum the definitive run needs is absent in Phase 18 by the documented structural contradiction) | Phase 19 | 18-05-SUMMARY `requirements_relocated_to_phase_19: [EVAL-01, EVAL-02, EVAL-04]`; 18-HAIKU-PILOT.md roadmap implication. Loader + 70-example manifest BUILT + committed. |
| 2 | EVAL-02: the DEFINITIVE k>=5 + reliable=15 gating RUN reporting Pass@1/Pass^k + per-stratum false-uphold | Phase 19 | Aggregator that computes these is BUILT + unit-passing; the definitive RUN moves to the pilot. Cheap pilots ran (60 votes) and saturated. |
| 3 | EVAL-04: the DEFINITIVE pre-registered lock rule for the autonomous-search pilot | Phase 19 | A pre-registered lock rule was authored + committed before any model call (f497c5a); the re-registered replacement is recorded verbatim in 18-GATE-RECONCILIATION-CONSULTS.md; the definitive pre-registration lands in Phase 19. |

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | -------- | ------ | ------- |
| `plugins/lz-advisor/references/lz-haiku-prompt-engineering.md` | EVAL-05 deep-research reference (H1-H12 + D-08 + stale patterns) | VERIFIED | 260 lines; CITED tags; ASSUMED preserved; ASCII-only; committed 08876be, precedes Haiku agent |
| `plugins/lz-advisor/agents/research-verify-voter-sonnet.md` | Sonnet baseline, ship default, frozen schema | VERIFIED | model: sonnet, color green, tools per-arm, all envelope fields, no eval/ ref, ASCII-only |
| `plugins/lz-advisor/agents/research-verify-voter-haiku.md` | Research-grounded Haiku, OFF by default, derived from EVAL-05 | VERIFIED | model: haiku, color blue, XML-tagged, plain phrasing, no budget_tokens/prefill, names the reference, no eval/ ref |
| `eval/lz-eval-aggregate.mjs` (+ test) | Deterministic off-model gate engine | VERIFIED | 15/15 tests pass; library-computed CP via jstat; no hand-rolled stats |
| `eval/lz-eval-dataset.mjs` (+ test) | Zero-hand-authoring loader | VERIFIED | 15/15 tests pass; remap/sha256/gated-401/stratify/drift-gate |
| `eval/__fixtures__/lz-eval-manifest.json` | >=60 stratified license-compliant manifest | VERIFIED | 70 examples, ~43/57 split, manifest-only for encumbered corpora |
| `eval/__fixtures__/wice-vendored/` (+ NOTICE) | Only commit-safe corpus, attributed | VERIFIED | 60 records + ODC-BY/MIT NOTICE citing jon-tow/wice + EMNLP 2023 |
| `eval/lz-eval-lock-rule.md` | Pre-registered EVAL-04 lock rule | VERIFIED (superseded for the definitive run) | Committed before any vote (f497c5a); describes the now-superseded subtle-open-book gate; honestly flagged as superseded-by-pilot, not silently wrong |
| `eval/lz-eval-packaging-boundary.test.mjs` | D-11 boundary check | VERIFIED | 2/2 tests pass |
| `.github/workflows/ci.yml` + `test-act.yml` | CI backstop for the 3 eval-tree tests | VERIFIED | eval step in the single test job; test-act paths extended (per 18-02-SUMMARY) |

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | -- | --- | ------ | ------- |
| research-verify-voter-haiku.md | lz-haiku-prompt-engineering.md | prompt derived from EVAL-05 (D-08) | WIRED | Haiku description names the reference; prompt structure (XML tags, plain phrasing, disconfirming few-shots) is the reference's H2/H3/H5/H11 applied -- not a Sonnet copy |
| eval/lz-eval-aggregate.mjs | runtime aggregator (ContractError/safeId/listJson/stripBom) | cross-tree relative import (one-directional) | WIRED | Confirmed eval -> runtime only; no runtime -> eval import (D-11 holds) |
| eval/lz-eval-aggregate.mjs | eval/node_modules/jstat | jStat.beta.inv / combination | WIRED | jstat imported only in eval/; anchors asserted |
| eval/lz-eval-lock-rule.md | eval/lz-eval-aggregate.mjs EVAL_THRESHOLDS | byte-for-byte threshold parity | WIRED | Test asserts parity; all 9 thresholds tabulated in the doc |
| manifest WiCE rows | eval/__fixtures__/wice-vendored/ | drift gate (coverage + sha256) | WIRED | Drift-gate test passes; NOTICE documents the cross-check |
| voter agents | plugin package | zero-dep, no eval/ import | WIRED | grep finds no eval/ reference in either agent |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| Aggregator gate engine works | `cd eval && node --test lz-eval-aggregate.test.mjs` | 15 pass / 0 fail | PASS |
| Dataset loader works | `cd eval && node --test lz-eval-dataset.test.mjs` | 15 pass / 0 fail | PASS |
| D-11 packaging boundary holds | `cd eval && node --test lz-eval-packaging-boundary.test.mjs` | 2 pass / 0 fail | PASS |
| Voter agents: models/schema/zero-dep/Haiku-phrasing | node check of both agent files | all checks OK | PASS |
| Manifest stratification shape | node count of manifest by source/stratum/book | 70 ex, 30/40, 0 subtle+open | PASS (confirms the documented contradiction) |
| Cross-tree import one-directional | git grep eval->runtime + runtime->eval | eval imports runtime; no runtime->eval import | PASS |

### Probe Execution

No conventional `scripts/*/tests/probe-*.sh` declared or implied for this phase; the runnable checks are the node:test suites above (executed). N/A.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ----------- | ----------- | ------ | -------- |
| VERIF-01 | 18-05 | Three isolated skeptic voters, no shared context, attack-mode diversified | SATISFIED | Both voters cast ONE isolated seat, no shared context, 3 attack modes (factual-contradiction / scope-causality-overclaim / source-provenance), attack_mode recorded |
| VERIF-02 | 18-05 | Open-book voter runs explicit disconfirming search, records the query | SATISFIED | Both voters: step 1 searches the NEGATION, records `disconfirming_query`; empty on closed-book |
| VERIF-03 | 18-05 | Corroboration weighted by source independence | SATISFIED | Both voters: collapse N syndicated copies to one canonical source, record `source_independence_note` |
| COST-02 | 18-02 / 18-03 / 18-05 | Sonnet-default; Haiku-first flag OFF until the eval clears | SATISFIED | Sonnet = ship default; Haiku = OFF by default; lock rule encodes flip-ON vs raise-to-user |
| EVAL-03 | 18-05 | Flip ON only if eval clears; else RAISE to user; Sonnet ships interim | SATISFIED | Genuinely exercised: VOID-via-saturation -> raised -> owner PURSUE-via-pilot; Sonnet ships |
| EVAL-05 | 18-01 | Haiku prompt engineered from a deep-research pass, precedes any Haiku agent | SATISFIED | Reference committed before the Haiku agent; Haiku prompt demonstrably derived from it |
| EVAL-01 | 18-04 | Pre-registered >=60-100-claim stratified dataset (closed + open book) | RELOCATED to Phase 19 | Loader + 70-example manifest BUILT; the DEFINITIVE dataset (with the subtle+open-book stratum, absent in P18 by structural contradiction) moves to the staged pilot |
| EVAL-02 | 18-03 | Eval runs each claim k>=5, reports Pass@1/Pass^k + per-stratum false-uphold | RELOCATED to Phase 19 | Aggregator BUILT + unit-passing; the DEFINITIVE k>=5 + reliable=15 RUN moves to the pilot (cheap pilots ran + saturated) |
| EVAL-04 | 18-03 | Lock rule written down before the eval runs | RELOCATED to Phase 19 | A pre-registered lock rule WAS committed before any vote; re-registered replacement recorded; the DEFINITIVE pre-registration for the autonomous-search gate lands in Phase 19 |

No ORPHANED requirements: all 9 phase requirement IDs appear in plan frontmatter and are accounted for (6 satisfied, 3 relocated).

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| (none) | - | No TBD/FIXME/XXX/HACK/PLACEHOLDER in any shipped phase file | - | Clean |
| eval/lz-eval-aggregate.mjs | 17 | Comment naming logGamma/incbeta/betaInv | INFO | Absence-asserting comment (D-07 honored), not a hand-rolled function |
| plugins/.../lz-deep-research-aggregate.test.mjs | 695 | Comment containing "eval/" | INFO | Deliberate Phase-18 SC-2 re-scope note, not an import -- D-11 boundary holds |

No blocker or warning anti-patterns. No debt markers.

### Human Verification Required

None. The EVAL-03 raise-to-user decision was already made by the owner (PURSUE Haiku-first via a staged pilot), recorded in 18-HAIKU-PILOT.md + 18-05-SUMMARY. The voter-agent behavior and eval machinery are verified programmatically (test suites pass; structural checks pass). No skill-discovery `claude -p` UAT is in scope for this phase (it produces agents + eval tooling, not user-invocable skills). No `<verify><human-check>` blocks were deferred in the PLAN files.

### Gaps Summary

No gaps. The phase goal -- engineer the Haiku verify-voter from a deep-research pass before any Haiku agent (EVAL-05), author both voters against the frozen schema (VERIF-01/02/03 + COST-02), and run the standalone gating eval to SETTLE-OR-RAISE the Haiku-first flag (EVAL-03) -- is achieved.

The goal is a disjunction and was achieved via its RAISE branch, which EVAL-03 explicitly provides for. The eval VOIDed via saturation (both Haiku and Sonnet caught every trap on the cheap pilots -> non-discriminating per the pre-registered saturation rule), so it could not positively clear Haiku; the decision was raised to the owner, who decided to pursue Haiku-first via a staged autonomous-search pilot (Phase 19/20), with Sonnet-default shipping in the interim. This is documented across 18-EVAL-GATE-CONTRADICTION.md, 18-GATE-RECONCILIATION-CONSULTS.md, and 18-HAIKU-PILOT.md, and honestly disclosed in 18-05-SUMMARY (no false closure).

EVAL-01 / EVAL-02 / EVAL-04 are honestly RELOCATED to Phase 19 (the DEFINITIVE eval moves to the staged pilot): the Phase-18 machinery for them is built, committed, and unit-passing (aggregator, dataset loader, 70-example manifest, pre-registered lock-rule prose), but the definitive gating run did not occur in Phase 18 because the synthesized-overreach open-book gate voided. These are deferred items, not gaps -- they do not block the Phase-18 settle-or-raise goal.

Pre-registration integrity is intact: the lock rule was committed before any model call, the contradiction was found before any vote was cast, and the re-deliberation/re-registration happened in the legitimate zero-votes window.

---

_Verified: 2026-06-16T17:05:00Z_
_Verifier: Claude (gsd-verifier)_
