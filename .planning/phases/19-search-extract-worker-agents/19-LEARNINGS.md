---
phase: 19-search-extract-worker-agents
milestone: v2.1.0
extracted: 2026-06-19
tags:
  - eval
  - certify-works
  - staged-certification
  - mcc-screen
  - contrastive-minimal-pairs
  - difficulty-confound
  - dual-baseline-guard
  - signal-detection-theory
  - sdt-positive-trials
  - pre-registration
  - result-shopping
  - confound-robust-metric
  - leave-one-pair-out
  - contamination-gate
  - spend-discipline
  - no-spend-build
  - node-test-file-form
  - lsp-not-authoritative
  - offline-never-works
  - screen-not-certificate
  - frozen-primitives
  - least-privilege-workers
---

# Phase 19 Learnings -- Search + Extract Worker Agents + the Offline Confound-Robust MCC SCREEN

The deep-research search/extract workers landed cleanly in 19-02. The dominant learning surface
is 19-04: a long re-plan arc (RE-PLAN-7 -> -8 -> -9/10/11 -> -12) that converged, via a cross-family
board, on a STAGED path to a certified-WORKS verify-voter verdict. The offline arm became a
confound-robust SCREEN that NEVER says WORKS; full WORKS certification moved to the Phase-20 live arm.
These notes are written to transfer to any future "how do we certify an LLM judge works" problem.

---

## Decisions

### D1. The STAGED path to certified WORKS: offline = SCREEN (never WORKS); WORKS = live only

A valid WORKS/sensitivity verdict is reached in TWO stages: an OFFLINE confound-robust SCREEN
(label SCREEN-PASS / PROVISIONAL, gates progression but never earns the word WORKS) and a LIVE
operational stage that is the PRIMARY full-WORKS certifier.

- WHY: Signal Detection Theory imposes a decisive constraint -- every bias-free sensitivity index
  (d-prime, balanced accuracy, Youden's J, MCC, AUC) MATHEMATICALLY requires BOTH a hit rate
  (positive trials) AND a false-alarm rate (negative trials). A trap-only (negatives-only) corpus
  cannot certify sensitivity, period. Offline could not construct a difficulty-matched-AND-real
  positive arm, so offline structurally cannot say WORKS.
- HOW TO APPLY: When the positive arm of a judge eval cannot be built cleanly offline, do not stretch
  the offline read to a WORKS claim. Split certification: offline screens/gates (and can cheaply
  FALSIFY the judge); the operational/live stage with real adjudicated positives certifies. Make the
  "never WORKS" property load-bearing in code (here `provisional` is hardcoded `true` on BOTH the gate
  and demote branches), not just in prose.

### D2. Manual contrastive minimal-pairs over expanded-synthetic positives

Construct positives as manual CONTRASTIVE MINIMAL-PAIRS on the SAME dense trap evidence bundles:
the REFUTED side is the original trap (claim + evidence verbatim); the SUPPORTED side keeps the claim
BYTE-IDENTICAL and applies exactly ONE minimal label-flipping edit ON THE EVIDENCE (or symmetric).

- WHY: This is difficulty-matched BY CONSTRUCTION -- same multi-doc density and reasoning depth, only
  the label-determining fact differs -- which kills the difficulty-confound that sank the
  synthetic-control arm. Expanded-synthetic generation was REJECTED: an audit board found it scales a
  superficial-conjunction skew and stays non-difficulty-matched. Byte-identical claims also
  structurally exclude the F3 claim-side ("myopia") artifact.
- HOW TO APPLY: To match positives to HARD negatives, do not generate fresh positives -- edit the
  evidence of the existing hard negatives minimally to flip the label. The same physical bundle on both
  sides is the matching guarantee no synthetic generator can promise.

### D3. Confound-robust metric (MCC) instead of accuracy/F1/AUC for a binary judge

Score the screen with the Matthews Correlation Coefficient; pre-register the bar as point MCC >= 0.5
AND one-sided 95% lower-CI bound > 0.

- WHY: MCC is high only when ALL FOUR confusion-matrix cells are good; a degenerate single-class
  (always-refute) judge scores MCC 0 (NOT NaN, NOT 0.5). This structurally breaks the always-refute
  confound WITHOUT a separately hand-built positive corpus. Accuracy/F1 can be inflated by one-sided
  performance; a hard binary REFUTE/UPHOLD label gives a degenerate AUC = 0.5 (AUC needs a graded score).
- HOW TO APPLY: For a binary judge where "refuse/refute everything" is the failure mode you most fear,
  reach for MCC (or balanced accuracy) as the confound-robust scalar, and assert the degenerate matrix
  -> 0 in a discriminating test.

### D4. The over-refusal CP gate, full-WORKS, and the Haiku-vs-Sonnet worker-tier flip all MOVE to live

The carried over-refusal Clopper-Pearson gate (CP-upper <= TAU_OR 0.15, N_ctrl >= 24), the full-WORKS
certification, and the cheap-tier worker flip are all Phase-20 (live) obligations -- named and explicit,
not silently dropped.

- WHY: Same SDT constraint -- those all need real positive trials. Sonnet-default ships regardless; the
  tier decision is settled where the positives actually exist.
- HOW TO APPLY: When you descope an arm, record it as a DEFERRED OBLIGATION with the destination named
  (here: the manifest `over_refusal_moved_to_live` key + the Phase-20 ROADMAP success criterion), so the
  anti-confound purpose survives the descope.

### D5. Least-privilege worker agents proven against the real frozen consumer

The search worker ships `[WebSearch, Write]`, the extract worker `[WebFetch, Write]` (Sonnet, fixed --
the extract step is trust-critical and not gated). Both return a one-line counts-only receipt; the round
trip is proven against the FROZEN aggregator, not a mock.

- WHY: Principle of least privilege (no Read/Bash); the main session never holds raw source text
  (bounded context); a producer contract is only real if it round-trips through the actual consumer.
- HOW TO APPLY: Prove producer agents with `aggregate(fixture(...))` against the shipped consumer, and
  gate the agents' frontmatter `tools:` list with an SSOT test that reads the shipped .md files (a
  maintainer re-adding Read/Bash or swapping search<->fetch must fail a test).

---

## Lessons

### L1. Pre-registration ORDERING is the only defense against result-shopping a literature-unspecified bar

The certification bar (what MCC value / CI width / N = trustworthy) is unspecified by the literature.
The only thing that answers the result-shopping objection is freezing the bar BEFORE seeing any data --
not a defensible-sounding number.

- HOW TO APPLY: Freeze the bar as module constants (`MCC_BAR_POINT=0.5`, `MCC_CI_ALPHA=0.05`,
  `MCC_CI_LOWER_FLOOR=0`) AND record a TIMESTAMP before any pair is authored or scored. MACHINE-ASSERT
  the timestamp in an anti-drift test: it must parse as ISO-8601 UTC, reject the literal placeholder
  (no `<>`), and be strictly in the past. A human attestation is not enough -- the test is the gate.
  (Bar was frozen + timestamped `2026-06-19T16:07:00Z`; pairs authored/scored afterward.)

### L2. A leave-one-PAIR-out classifier is required for the dual-baseline guard (partner-pull trap)

The dual-baseline artifact guard needs a lexical baseline AND a claim-only baseline to BOTH be at
chance. The implementation gotcha: realize the separation test as a leave-one-PAIR-out log-odds
classifier, NOT a leave-one-OUT / centroid scheme.

- WHY: On near-identical contrastive pairs, a leave-one-OUT/centroid classifier suffers partner-pull --
  the held-out item's near-identical partner sits in the training set and drags the centroid, reporting
  a spurious strong separation even on an artifact-free corpus. Leave-one-PAIR-out removes both members
  of the pair together.
- HOW TO APPLY: Whenever you measure "can a trivial baseline separate these?" over contrastive pairs,
  hold out the WHOLE pair. Otherwise the near-duplicate leaks the answer and your artifact guard
  false-fails on clean data.

### L3. "Chance" for MCC is 0, not 0.5 (the scale-mix bug)

The at-chance comparator for an MCC-based separation guard is MCC 0, not 0.5.

- WHY: MCC ranges -1..1 with 0 = chance; accuracy/AUC use 0.5. A 0.5 comparator would misread a weak
  lexical artifact whose separation-MCC lower-CI lands in (0, 0.5) as "at chance" and let it through.
- HOW TO APPLY: Pin the comparator to the metric's own chance value (`AT_CHANCE_MCC = 0`) and add a
  discriminating test in the exact band a wrong comparator would misjudge.

### L4. The contamination gate is a one-directional transport assurance, NOT a leg of the decision rule

The batching contamination gate (single-vs-batched OOF agreement) is NOT one of the four legs of the
screen decision rule -- it is a transport-fidelity assurance.

- WHY: Its risk is one-directional under the DP1-DP3 anti-leakage design (opaque non-ordinal ids,
  per-call reshuffle, fail-closed-to-drop): contamination can only DEPRESS MCC, never inflate it. So a
  high MCC cannot be a contamination artifact, and re-running the gate for a new bulk OOF spend is not
  required for soundness.
- HOW TO APPLY: Before authorizing a fresh spend, run a FOUR-SOURCE alignment check (board decision +
  pre-registration + roadmap + plan) on whether a carried gate must re-run. If the gate's risk is
  one-directional away from a false PASS, keep it as an on-demand diagnostic for a suspicious demote
  rather than spending to re-run it. The alignment check itself is the discipline.

### L5. node:test FILE-form gate, never the dir form; LSP/TS diagnostics are not authoritative

Always gate on the explicit `.test.mjs` FILE form (`node --test eval/x.test.mjs ...`); the directory
form spuriously exits 1 on this host even when all tests pass.

- WHY (LSP): Every "unused/unreachable" diagnostic this phase was either a stale false positive (an
  import used at a distant line) or benign dead code (a `return` after a throwing `assert.fail`). The
  test runner is the gate, not the editor's TypeScript server.
- HOW TO APPLY: Run multiple files in one FILE-form invocation; never the dir form. Do not chase LSP
  "unused"/"unreachable" flags into edits -- verify against the FILE-form run first.

### L6. Spend discipline: NO-SPEND author + deterministic guard resolve the central unknown for free

The central empirical unknown (can ~12 manual minimal-pairs be authored without a claim-side lexical
artifact?) was resolved with ZERO AI Credits: manual authoring is no-spend, and the dual-baseline guard
is deterministic and runs FIRST. Only a guard PASS triggered the small batched OOF spend (~6 Copilot
calls); a stub dry-run validated the wiring before any credit was spent.

- HOW TO APPLY: Order eval work so the expensive model spend is the LAST gate, behind a no-spend
  mechanical guard that can falsify the construction for free. Always run a deterministic STUB dry-run
  of the spend path first (here: 24/24 packets resolved, no drops) to validate wiring before real spend.
  The RE-PLAN-9/10/11 checkpoint design caught a fragile, negative-EV synthetic build BEFORE a ~4x scale
  spend -- the cheap probe paid for itself.

---

## Patterns

### P1. Dual-baseline artifact guard (mechanical sufficiency condition)

Two baselines -- a lexical/overlap (TF / bag-of-words on claim+evidence) AND a no-evidence claim-only
baseline -- must BOTH score at chance on separating the pairs. `guardPasses` iff both at chance. If
EITHER separates the pairs, a lexical or claim-side artifact exists and the screen AUTO-DEMOTES to a
non-gating diagnostic. Mechanical, not discretionary; runs FIRST (no-spend), before the OOF judge.
See L2 (leave-one-PAIR-out) and L3 (chance = MCC 0) for the two implementation traps.

### P2. Same-strict-screen on both arms (no asymmetric criterion)

OOF-judge SUPPORTED and REFUTED items through the SINGLE carried probe path (one `runProbeConsensus`
contract): SUPPORTED requires entails=true, REFUTED requires entails=false -- the same strict screen, no
asymmetric branch. Asymmetric criteria (a looser "support" bar than the "refute" bar) break false-uphold
vs over-refusal comparability and let a judge pass positives under a bar it failed on negatives. Assert
exactly one judge path in a test.

### P3. Out-of-family-decided gold + family-independent construction

The gold is decided by a FROZEN out-of-family pair (gpt-5.5 + gemini-3.1-pro-preview, all-agree); the
subject family never makes its own gold. Contrastive pairs are authored on family-independent dense
bundles and OOF-judged. This removes in-family-gold bias from the certification.

### P4. Frozen-primitives-byte-identical re-plan (ADD-only over a long re-plan arc)

Across RE-PLAN-7/8/9/10/11/12 the frozen engine (EVAL_THRESHOLDS, `clopperPearsonUpperOneSided`,
URL_DATE_RULE, the OOF identity, the healthy trap arm) stayed byte-identical; every re-plan was ADD-only
(new modules + ADDITIVE lock-rule/manifest keys; superseded keys ANNOTATED not deleted). A
prose==code anti-drift test asserts the manifest/lock-rule numbers equal the engine constants
byte-for-byte. This is how a multi-pivot eval stays trustworthy: the measurement instrument never
silently shifts under the verdict.

### P5. Route all statistical primitives through a vetted library; never hand-roll

BCa bootstrap bias-correction + percentile route through jStat (`normal.inv` / `normal.cdf`); resampling
is a seeded index pick only (no distribution math). A discriminating test asserts the jstat import AND
that no hand-rolled `normalInv`/`betaInv`/`incbeta`/`logGamma` exists. CI math is hand-rolling-forbidden;
resampling is allowed, the quantile/inverse math is not.

---

## Surprises

### S1. The offline MCC screen scored a PERFECT MCC 1.0 (12/12/0/0)

The screen returned tp=12, tn=12, fp=0, fn=0 -> MCC 1.0, one-sided 95% BCa lower-CI 1.0,
label-permutation p ~= 0.0002. Initially eyebrow-raising, but EXPECTED on reflection: clean single-fact
evidence-side label flips, judged by strong frozen-pair OOF models, on a corpus already cleared as
artifact-free by the no-spend guard. The key interpretation: a perfect score VALIDATES the offline
INSTRUMENT (it discriminates -- a degenerate always-refute judge would score 0), it does NOT certify a
subject WORKS. The offline read is a SCREEN/gate; WORKS still lands entirely at the live stage.

### S2. The synthetic-control arm was tried and descoped TWICE before the contrastive pivot

The offline positive (over-refusal) arm was attempted as a synthetic-control build across
RE-PLAN-9/10/11. RE-PLAN-9 redesigned it (entailment-native source + survival probe + build-OR-descope
rule). RE-PLAN-10/11 tightened the generator + added a conjunction-decomposition reject gate, but the
genuine-synthesis yield (~7/40 = 17.5%) cleared the frozen N_CTRL_FLOOR=24 only thinly at the POINT
estimate and FAILED at the honest Clopper-Pearson lower bound (~12). A cross-family board unanimously
DESCOPED it (negative EV; reading the yield at its point while every other rate uses a CP lower bound is
the result-shopping signature). The lesson that survived: the difficulty-confound is not fixable by
making more/better synthetic positives -- it is fixed by changing the CONSTRUCTION (contrastive on the
same bundles, RE-PLAN-12). Do not keep paying to scale a confounded construction; pivot the construction.

### S3. The literature has NO verified solution for difficulty-matched positives from DENSE multi-doc evidence

The deep-research pass (23 sources, 3-vote adversarial verification) confirmed VitaminC / contrast sets
/ CAD as established difficulty-matched constructions -- but ALL are single-sentence / single-instance;
the one multi-hop counterfactual-construction claim was REFUTED 0-3. Our hardest sub-problem (matching
positives to DENSE traps) is literature-unsolved. This is WHY the dual-baseline guard exists: it
adjudicates an unsolved construction question empirically (both baselines at chance -> construction
validated) rather than relying on a published method that does not exist.
