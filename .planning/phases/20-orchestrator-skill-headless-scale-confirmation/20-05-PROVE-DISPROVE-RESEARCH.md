# 20-05 PROVE-OR-DISPROVE research: methodological options for a board converging on the verify-voter WORKS verdict

**Researched:** 2026-06-21
**Domain:** LLM-as-judge / claim-verification certification methodology under (1) a VOID false-uphold (specificity) arm and (2) a confounded over-refusal (sensitivity) arm
**Confidence:** MEDIUM overall (the underlying eval-methodology literature is HIGH-confidence; the application to this exact two-breakdown situation is necessarily extrapolated -- the literature has no end-to-end protocol for it, confirmed by both prior passes)
**Status:** NEUTRAL decision-support. This artifact enumerates OPTIONS with what each proves/disproves, feasibility under our constraints, and cost. It does NOT pick a winner -- the cross-family board converges on the choice.

---

## How to read this document

This EXTENDS three prior research passes; it does not repeat them. The board has already accepted:
the SDT positive-trials constraint (a trap-only design cannot certify sensitivity), the confound-robust
scalar metrics (MCC / balanced-accuracy / d-prime / AUC) and their residual need for SOME positives,
OR-Bench / VitaminC / contrast-set construction, Guerdan rating-indeterminacy, ICLR judge over-confidence,
the rare-event CP/Wilson upper-bound math, and the shadow/canary/ramp operational analogy. All of that is
GROUND, cited where load-bearing but not re-derived (see `19-04-CERTIFY-WORKS-RESEARCH.md`,
`20-PRE-DISCUSS-RESEARCH-live-cert.md`, `CERTIFY-WORKS-BOARD-DECISION.md`,
`CERTIFY-WORKS-RATIFICATION.md`).

NEW here: the two specific breakdowns -- a VOID specificity arm and a CONTAMINATED-CONTROL sensitivity arm --
and the executable options each breakdown admits.

Claim tags: [VERIFIED] = confirmed in a prior project pass AND from a peer-reviewed / primary source;
[CITED: url] = referenced from a source fetched this session; [ASSUMED] = training-knowledge or single
unconfirmed source, needs the board's eye before it becomes load-bearing.

---

## The current factual situation (de-identified; the two breakdowns, restated precisely)

The verify-voter casts one skeptic vote per claim: `refuted` / `unrefuted`. It runs OPEN-BOOK in production
(one disconfirming web search, then judge). WORKS = both error-rate gates pass on SEPARATE pools (never
pooled), Signal-Detection style:

- FALSE-UPHOLD (specificity): one-sided 95% Clopper-Pearson upper bound on the false-uphold rate <= TAU_FU
  (0.10), N_trap floor 30.
- OVER-REFUSAL (sensitivity): CP-upper on the over-refusal rate <= TAU_OR (0.15), N_ctrl floor 30 (target 40).

**Breakdown 1 -- the FALSE-UPHOLD (specificity) arm is VOID.** Building difficulty-matched, dense-evidence
false-uphold traps ON-DISTRIBUTION at N>=30 is structurally infeasible: the pipeline EXTRACTS each claim FROM
its cited evidence, so claim ~= evidence (the re-test hypothesis estimates ~28% of candidate pairs at token
Jaccard >= 0.6). An OOF entailment reader therefore reads "entails" and the corpus structurally
under-produces traps. Manual minimal-edit construction was attempted and FAILED its own construct-validity
gate (an authored 32-pair seed scored lexical-overlap AUC 0.856 >> the 0.65 ceiling -- by-construction
pairing injected the very lexical artifact the gate guards), then the human maintainer declined to author.
An OFFLINE screen over external contrastive datasets produced only a non-certifying SCREEN-PASS (off
-distribution; see Phase-19 SCREEN-PASS). (Internal: `CERTIFY-WORKS-RATIFICATION.md`; `.continue-here.md`
step-4 hypothesis.)

**Breakdown 2 -- the OVER-REFUSAL (sensitivity) controls are CONFOUNDED.** The 30 "supported" controls were
confirmed by an out-of-family all-agree adjudicator answering CLOSED-BOOK "does the PROVIDED EXCERPT entail
the claim?". The voter (OPEN-BOOK, live web) refuted 4/30 -> CP-upper 0.28 > 0.15 (nominal FAIL). BUT on
inspection the voter was substantively CORRECT in all 4: it found via web search that the claims OVERREACH
or CONTRADICT the broader literature (one claim says a scaling law "underestimates" while its cited paper says
"overestimates" -- the claim contradicts its own source; another conflates a gene with its enhancer). So the
closed-book excerpt-entailment GOLD admitted OVERCLAIMED / contaminated controls that an open-book voter
correctly refutes. The measured "over-refusal rate" is confounded with CORRECT refutes (control label-noise),
and live-web reach means published gold is reachable (leakage).

**The deep structural insight tying them together:** both arms break for the SAME reason -- the gold is built
CLOSED-BOOK by excerpt-entailment, while the voter runs OPEN-BOOK against the live web. Closed-book "does the
excerpt entail the claim?" and open-book "is the claim actually true given the literature?" are DIFFERENT
CONSTRUCTS (see Section D). Breakdown 1 is that construct gap making traps impossible (claim entailed by its
own excerpt by construction); Breakdown 2 is that same gap making controls contaminated (claim entailed by
excerpt but false against the literature). A board choice that fixes one without naming the shared cause will
likely leave the other live.

---

## Target A -- Control label-noise: when the JUDGE disagrees with the GOLD and the judge may be RIGHT

This is the heart of Breakdown 2. The literature has a clear, recent stance: judge-vs-gold disagreement does
NOT automatically mean judge error; structured re-adjudication of the disagreement set routinely surfaces
GOLD contamination.

- **Gold labels are not ground truth; principled human disagreement and ambiguous criteria are pervasive.**
  Guerdan et al. (NeurIPS 2025, "Validating LLM-as-a-Judge Systems under Rating Indeterminacy",
  arXiv:2503.05965) [VERIFIED]: the standard "aggregate human ratings into one per-item gold label, then
  measure judge-vs-gold agreement" workflow is BIASED when items admit multiple defensible answers; forced
  -choice elicitation selects judge systems up to 31% worse than their multi-label "response set" elicitation
  (raters mark ALL defensible verdicts). [CITED: https://arxiv.org/html/2503.05965v1]
- **A judge that overrides a flawed reference can be CORRECT, and protocols exist to separate the two cases.**
  "Judging Against the Reference: Uncovering Knowledge-Driven Failures in LLM-Judges on QA Evaluation"
  (arXiv:2601.07506) [ASSUMED -- single-pass find, Jan-2026, ID not independently confirmed this session]:
  LLM judges frequently override a provided reference from internal/external knowledge; a SUBSTANTIAL portion
  of overrides correctly identify a FLAWED reference rather than committing an error; the paper builds
  protocols + manual annotation to classify each contradiction as "legitimate flaw-detection" vs "erroneous
  override". This is almost exactly our Breakdown-2 situation (open-book voter overriding a closed-book gold).
  [CITED: https://arxiv.org/pdf/2601.07506]
- **The re-adjudication loop is an established treatment, not just a diagnostic.** Multi-model disagreement
  with the human gold is used to CONSTRUCT an improved gold standard (re-examine items where >=4 models
  disagree with the gold -> dual review + adjudication -> corrected gold). [CITED:
  https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12873610/] Practitioner guides frame the disagreement set as
  "the data you need to improve the judge / close gaps in ground truth", not as judge failures. [CITED:
  https://labelstud.io/learningcenter/how-to-use-llm-as-judge-for-agent-evaluation/]
- **Confident Learning / Cleanlab** (Northcutt et al., arXiv:1911.00068) [VERIFIED]: a model-agnostic,
  hyperparameter-free framework that estimates the joint distribution of noisy-vs-true labels from predicted
  probabilities and FLAGS likely label errors as candidates for human re-adjudication; it found real label
  errors in "clean" benchmarks (MNIST, ImageNet) and surfaced ontological ambiguity. Caveat: CL flags are
  CANDIDATES for re-adjudication, not final verdicts (good recall, imperfect precision). [CITED:
  https://arxiv.org/abs/1911.00068; worked detect-then-readjudicate loop: CLEANANERCorp arXiv:2408.12362]
- **The Alternative Annotator Test (alt-test)** (Calderon et al., NAACL 2025, "The Alternative Annotator
  Test for LLM-as-a-Judge", arXiv:2501.10970) [CITED: https://arxiv.org/pdf/2501.10970]: a leave-one
  -annotator-out (LOAO) procedure that asks whether the judge can REPLACE a human annotator -- for each item
  drop one human, test whether the judge agrees with the remaining panel at least as well (within an
  acceptable-disagreement margin epsilon) as the dropped human did. When the judge agrees with the majority
  but disagrees with one human, that is treated as NORMAL panel variation, NOT judge error -- precisely the
  reframing Breakdown 2 needs. Requires a MINIMUM of 3 annotators. Limitation: assumes annotator independence;
  may miss a SYSTEMATIC judge bias on a specific item type.

**What this target establishes for the board:** there is a defensible, peer-reviewed path to treat the 4/30
refutes as a GOLD-CONTAMINATION question rather than a fixed over-refusal numerator -- but ONLY if the
re-adjudication is pre-registered and independent (otherwise it is result-shopping: "re-adjudicate until the
judge looks good"). The options in Section F-A operationalize this with anti-gaming guards.

---

## Target B -- Constructing VALID over-refusal positives + false-uphold traps for a claim-verifier

This is the heart of Breakdown 1 (traps) and the upstream cause of Breakdown 2 (contaminated positives). The
key distinction the literature draws is between "the excerpt entails the claim" and "the claim is actually
supported / not overreaching".

- **The standard three-way scheme (Supported / Refuted / Not-Enough-Information) originates with FEVER and is
  built by MUTATING source sentences** (paraphrase, negation, substitution, altering specificity) to make
  plausible claims, with the minimal evidence set recorded. [CITED:
  https://www.emergentmind.com/topics/fever-fact-verification-task] This is the canonical way to manufacture
  difficulty-matched refuted items -- but it is a CONSTRUCTION method (claim authored FROM evidence by edit),
  which is exactly what injected our lexical artifact when attempted (the by-construction pair leaks the
  truth-value lexically).
- **AVeriTeC** (arXiv:2305.13117) [VERIFIED] is the most careful at separating REFUTATION from
  ABSENCE-OF-EVIDENCE, adding a fourth label "Conflicting Evidence / Cherry-picking" and an explicit "Not
  Enough Evidence" category; many fact-checkers wrongly collapse "no supporting evidence" into "refuted".
  [CITED: https://arxiv.org/pdf/2305.13117] DIRECTLY RELEVANT to Breakdown 2: our voter's 4 "over-refusals"
  may actually be AVeriTeC-style "Conflicting Evidence" or genuine "Refuted-by-the-literature" items that a
  closed-book excerpt gold mislabeled "Supported". A four-way (or a "not-enough-evidence" escape) gold label
  set could re-classify them out of the over-refusal numerator on principled grounds.
- **The NEI/insufficient-evidence label means DIFFERENT things across datasets** (SciFact: no relevant
  evidence in the corpus; HealthFC: a substantive verdict backed by a document reporting that no reliable
  study exists). [CITED: https://arxiv.org/html/2309.08503v2] -- so any gold scheme we adopt must pin down
  what "unrefuted" means against an open-book voter (Section D).
- **VitaminC** (arXiv:2103.08541) [VERIFIED] contrastive minimal-pairs are the established difficulty
  -matched construction, but its evidence is SINGLE-SENTENCE; the prior pass REFUTED (0-3) the claim that it
  solves our dense multi-doc difficulty-confound. Our own attempt to apply contrastive minimal-pairs failed
  the lexical-AUC gate. The board has ALREADY moved off minimal-pairs (D-22 / `CERTIFY-WORKS-RATIFICATION.md`).
- **RAG/claim-level entailment** (RAGCHECKER) extracts atomic claims from both output and gold and applies
  BIDIRECTIONAL entailment for claim-level precision/recall. [CITED:
  https://github.com/lyy1994/awesome-data-contamination context / RAG eval results above] This is a method
  for SCORING, transferable as a way to define "support" precisely, not a trap-construction method.

**What this target establishes for the board:** difficulty-matched DENSE positives remain literature-unsolved
(re-confirmed -- no new method closes it). But the AVeriTeC NEI / Conflicting-Evidence distinction gives a
PRINCIPLED relabeling vocabulary that could rescue Breakdown 2 (re-classify "voter found the claim contradicts
the literature" as genuine refutation, not over-refusal) and is consistent with the D-22 native-refuted-gold
harvest (the skill OVER-produces Contested/Unsupported claims -- ~15/run). It does NOT solve Breakdown 1's
trap scarcity directly; the native-harvest path (Section F-B) does, by sourcing traps from the skill's own
refuted-gold rather than authoring them.

---

## Target C -- Certifying vs disproving under a VOID arm + the SDT positive-trials constraint

The decisive prior constraint (F5/F7, `19-04`): a valid sensitivity / WORKS verdict REQUIRES positive trials;
trap-only cannot certify. The new question: with the SPECIFICITY (false-uphold) arm VOID, can a defensible
ONE-SIDED certificate be issued on the SENSITIVITY (over-refusal) arm alone? And what does a defensible
SCOPED / VOID / DOES-NOT-WORK statement look like?

- **In diagnostic-accuracy methodology, sensitivity and specificity are CO-PRIMARY endpoints; a claim on one
  alone is a SCOPED / partial validation by definition.** [CITED:
  https://journals.sagepub.com/doi/full/10.1177/0962280220913588] The standard single-arm confirmatory design
  states a SEPARATE one-sided hypothesis per metric (H0: sensitivity <= s0 vs H1: sensitivity > s0, and
  likewise for specificity) -- i.e. each metric IS independently testable and certifiable on its own pool;
  what you CANNOT do is claim the OTHER metric from the one you measured. [CITED:
  https://www.medrxiv.org/content/10.1101/2020.11.05.20226449.full.pdf]
- **The sensitivity-specificity trade-off ("communicating vessels") is why a one-sided claim is dangerous if
  presented as a full verdict.** A judge tuned to never over-refuse (high sensitivity) can trivially achieve
  it by always upholding -- which is exactly the false-uphold (specificity) failure the VOID arm can no longer
  bound. [CITED: https://www.medrxiv.org/content/10.1101/2020.11.05.20226449.full.pdf] This is the SDT/MCC
  degenerate-judge concern in diagnostic-testing language: an over-refusal-only certificate is uninformative
  about the catastrophic arm (silently shipped bad research). The project's frozen `certifyModel` already
  encodes this -- WORKS requires BOTH gates; one-arm -> SCOPED or VOID.
- **Partial-verification-bias correction** (relative TPR/FPR; inverse-probability bootstrap) is the
  established treatment when the gold standard is applied to only SOME items. [CITED:
  https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0321440] Relevant if the board chooses to
  certify on a SUBSET (e.g. only items where the OOF gold and the voter AGREE) -- this introduces verification
  bias that must be named and, ideally, bounded.

**What this target establishes for the board:** issuing a ONE-SIDED certificate on the over-refusal arm alone
is methodologically coherent ONLY as a SCOPED claim explicitly labeled "sensitivity-only; specificity
unverified" -- never as WORKS. This is precisely the project's existing SCOPED / VOID / DOES-NOT-WORK ladder
(`lz-eval-live-lock-rule.md`): the literature corroborates that the project's design (BOTH gates for WORKS;
one arm -> SCOPED) is the defensible stance, and tells the board what an honest scoped/void statement must
disclose (which metric is bounded, which is not, and the trade-off that makes the unbounded one matter).

---

## Target D -- Open-book vs closed-book measurement + leakage

This is the SHARED ROOT cause. The voter runs OPEN-BOOK (live web); the gold was built CLOSED-BOOK
(excerpt-entailment). These are different constructs and the gold's answers are web-reachable (leakage).

- **Data leakage is a systematic, multi-stage threat -- not just verbatim train-test overlap; paraphrased /
  translated / cross-lingual leakage evades surface decontamination.** Audited leakage runs 1%-45% across QA
  benchmarks and grows over time. [CITED:
  https://github.com/lyy1994/awesome-data-contamination ; https://arxiv.org/pdf/2402.03927] For an open-book
  judge measured against PUBLISHED gold, the gold's expected answer may be directly retrievable -> the judge
  can "pass" by retrieval rather than by reasoning, OR (our case) RETRIEVE the broader literature and
  correctly contradict a contaminated excerpt-gold.
- **Open-book / RAG evaluation must DISENTANGLE retrieval-reachability from generation.** The standard move is
  to inspect context precision / the retrieval span to determine whether the gold answer was actually
  REACHABLE, separating a retrieval failure from a judgment failure. [CITED:
  https://www.evidentlyai.com/llm-guide/llm-as-a-judge] Applied here: when the voter refutes, the board can
  ask "did it refute because the EXCERPT fails to entail (in-scope), or because it retrieved BROADER
  literature the excerpt-gold never saw (out-of-scope for an excerpt-entailment gold)?" -- the same
  retrieval-vs-judgment split.
- **Closed-book excerpt-entailment and open-book truth are DIFFERENT CONSTRUCTS.** [ASSUMED -- synthesized
  from the above sources + the project's own 4/30 inspection; no single source states it for this exact
  setup.] "Does the provided excerpt entail the claim?" is a bounded NLI task; "is the claim actually
  supported once you search the web?" is an open-world fact-check. The voter is certified for production where
  it runs open-book; measuring it against a closed-book gold tests the WRONG construct and manufactures
  apparent over-refusals. Whichever construct the board certifies MUST match the production construct
  (open-book) for the WORKS claim to transfer.

**What this target establishes for the board:** the certification TARGET (the gold's construct) should match
the PRODUCTION construct. If the voter runs open-book in production, an open-book gold (or an explicit
construct-scope disclosure) is the valid target; a closed-book excerpt gold systematically mismeasures it.
This reframes Breakdown 2 from "the voter over-refuses" to "the gold and the voter measure different
constructs" -- which is an adjudication / construct-alignment problem, not a voter-quality problem.

---

## Target E -- Cheap-vs-strong (Haiku vs Sonnet) tier comparison

How to validly show the cheaper tier is co-equal or inferior on these error rates, given the same breakdowns.

- **McNemar's test is the standard paired test for two judges on the SAME items** -- it uses only the
  discordant cells (A-right/B-wrong vs A-wrong/B-right), and an EXACT binomial variant is used when the
  discordant count is small (our N~30-40 regime). [CITED:
  https://rasbt.github.io/mlxtend/user_guide/evaluate/mcnemar/ ;
  https://machinelearningmastery.com/mcnemars-test-for-machine-learning/]
- **To certify CO-EQUALITY you need an EQUIVALENCE / NON-INFERIORITY framing, not a non-significant McNemar.**
  Absence of evidence (a non-significant difference) is not evidence of equivalence; a small discordant count
  gives little power. The literature points to a non-inferiority margin / equivalence ("margin") test on the
  paired binary data. [CITED:
  https://www.emergentmind.com/topics/mcnemar-s-test] This matters because the project's design is exactly
  this: certify STRONG first, then certify CHEAP SEPARATELY on the SAME frozen corpus/gold/gates, with NO TAU
  loosened per tier (D-21 / `CERTIFY-WORKS-RATIFICATION.md` section 5).
- **The "over-refute-on-overclaim flips tiers" phenomenon** [ASSUMED -- synthesized from Breakdown 2 + the
  cascade literature]: a STRONGER open-book judge is MORE likely to retrieve broader literature and refute a
  contaminated control (correctly) -> it scores WORSE on a confounded over-refusal metric than a weaker judge
  that lazily upholds. So the SAME contamination that inflates Strong's apparent over-refusal rate could make
  Haiku look "co-equal or better" for the WRONG reason (Haiku upholds because it searches less). Cascade work
  (Cascaded Selective Evaluation; FrugalGPT) starts from a cheap judge and escalates only on low confidence,
  WITH a human-agreement guarantee -- but the cited evidence is consistent that smaller models are generally
  WEAKER judges, and a blanket cheap-substitution is risky. [CITED:
  https://proceedings.iclr.cc/paper_files/paper/2025/file/08dabd5345b37fffcbe335bd578b15a0-Paper-Conference.pdf
  (Trust or Escalate, ICLR 2025) -- already VERIFIED in the prior pass]

**What this target establishes for the board:** if the over-refusal arm is decontaminated (Target A/D), a
paired McNemar + a pre-registered non-inferiority margin is the defensible cheap-vs-strong instrument. But the
board must guard against the tier-flip artifact: a cheap tier that "ties" on a CONTAMINATED over-refusal
metric may be tying because it under-searches, not because it is co-equal. The Haiku flip is DEFERRED
regardless (D-06); this is about the methodology for the eventual flip decision, not Phase 20.

---

## Target F -- CONCRETE EXECUTABLE OPTIONS (what each proves/disproves, feasibility, cost)

Feasibility assets on hand (from `.continue-here.md` / `20-05-*`): an out-of-family adjudicator pair via the
Copilot CLI (gpt-5.5 + gemini-3.1-pro-preview, `--effort high`, all-agree, gold-blind); in-family
Opus/Sonnet/Haiku agents via the Agent tool (session pool, NOT the API, NOT `claude -p` for voters -- D-20);
8 canonical harvested run dirs; arm-B = 40 over-refusal controls (target met); ~108 arm-A refuted-gold
candidates on disk; the frozen eval machinery (`clopperPearsonUpperOneSided`, `certifyModel`,
`lz-eval-baseline-guard.mjs` gate (a), `lz-eval-difficulty-proxy.mjs` gate (b)); the evidence-text join is
fixed (judges now see real passage text, not bare URLs). Cost units: "Copilot calls" = metered AI Credits
(disclose-estimate-before / actual-after, classifier-gated); "voter votes" = Claude session pool (org monthly
budget -- was EXHAUSTED mid-probe at HTTP 429, a hard external dependency). NO model-certification spend was
incurred producing this artifact.

The options are grouped by which breakdown they address. They are NOT mutually exclusive -- several compose
(e.g. A1 + B1 + C-scoped is a coherent bundle). The board converges on a bundle, not a single row.

### Group A -- options for the CONTAMINATED over-refusal controls (Breakdown 2)

**A1. Independent re-adjudication of the 4 disagreements as a GOLD-CONTAMINATION question (pre-registered).**
- DOES: tests whether each of the 4 voter-refutes is a CORRECT refutation of a contaminated control (gold
  error) vs a genuine over-refusal (voter error). Re-adjudicate the 4 (plus a blind control sample of
  agreed-upon items, so the adjudicator can't tell which are "the disputed ones") with the frozen OOF pair
  asked the OPEN-BOOK question ("given the broader literature, is this claim supported?") rather than the
  closed-book excerpt question, with the human resolving residue (Guerdan response-set: indeterminate items
  EXCLUDED from the denominator, not coerced). [VERIFIED method: Guerdan + Judging-Against-the-Reference +
  the multi-model-disagreement-readjudication loop.]
- PROVES/DISPROVES: if the OOF-open-book + human agree the 4 are correct refutations -> they are GOLD ERRORS,
  removed from the over-refusal numerator (0/26 or 0/30 -> CP-upper clears 0.15) -> arm B can certify. If they
  are genuine over-refusals -> the numerator stands -> arm B DOES-NOT-WORK on the over-refusal gate. Either
  way the verdict becomes defensible.
- FEASIBILITY: HIGH. ~4-10 OOF calls (the 4 disputed + a blind control set) + a short human residue pass.
  Requires the org budget for nothing (OOF is the separate Copilot pool). The anti-gaming guard: the
  re-adjudication QUESTION, the blind control mix, and the relabel rule are PRE-REGISTERED before the OOF runs
  (mirrors the existing lock-rule discipline) so it is not "re-adjudicate until the judge passes".
- COST: ~10-15 Copilot AI Credits + ~30 min human. LOW.
- RISK: the alt-test minimum is 3 annotators; with one human + the OOF pair this is borderline -- frame as
  OOF-pair-as-2-annotators + human-as-3rd, or accept it is a re-adjudication (not a formal alt-test).

**A2. Switch the over-refusal GOLD to the production construct (open-book) entirely.**
- DOES: rebuilds the over-refusal control gold by asking the OOF pair the OPEN-BOOK question for ALL controls,
  not just the 4 -- aligning the gold construct with the production construct (Target D).
- PROVES/DISPROVES: proves the voter's sensitivity AGAINST AN OPEN-BOOK GOLD (the construct it actually runs
  in). Disproves the validity of the original closed-book measurement. A clean CP-upper <= 0.15 on the
  open-book gold is a stronger WORKS-eligible sensitivity result than A1's surgical fix.
- FEASIBILITY: MEDIUM. ~40 OOF calls (re-adjudicate all 40 controls open-book) -- more spend than A1, and the
  open-book OOF read is itself leakage-exposed (the OOF models can retrieve the same literature). Must
  disclose the construct change in the lock rule + re-freeze N at the new consensus.
- COST: ~40 Copilot calls / ~80-120 Credits. MEDIUM.
- RISK: re-opening the gold construct after seeing the 4/30 result risks looking like result-shopping unless
  pre-registered as "the closed-book gold was the wrong construct" with a committed rationale BEFORE the
  re-run; the leakage exposure of an open-book OOF gold must be named (Target D).

**A3. Accept the 4/30 at face value -> over-refusal arm DOES-NOT-WORK; do not decontaminate.**
- DOES: takes the nominal CP-upper 0.28 > 0.15 as the verdict; declines to re-adjudicate.
- PROVES/DISPROVES: "disproves" WORKS on the over-refusal gate -- but this is a KNOWN-CONFOUNDED disproof
  (the inspection already showed the 4 are correct refutes), so it would record a FALSE NEGATIVE as if it
  were a real one. Methodologically the WEAKEST honest option: it certifies nothing and mislabels a gold-error
  as a voter-error.
- FEASIBILITY: HIGH (no spend).
- COST: ~0. But it throws away the inspection evidence and is arguably LESS honest than A1/A2.
- RISK: records DOES-NOT-WORK on contaminated data -> future readers inherit a wrong "voter over-refuses"
  signal. Include ONLY if the board wants the most conservative possible non-certification.

### Group B -- options for the VOID false-uphold (trap) arm (Breakdown 1)

**B1. Native refuted-gold harvest (the D-22 ratified path) -> re-run construct-validity gates -> CP.**
- DOES: harvests the skill's OWN naturally-occurring Contested/Unsupported claims (~15/run, FREE by-product
  of the arm-B harvest; ~108 candidates already on disk), RETAINS as refuted-gold ONLY those the frozen OOF
  all-agree pair confirms gold-blind as "does not entail", difficulty-matches STATISTICALLY (covariate
  -overlap + subject-difficulty + cluster floors), re-runs gates (a) lexical-AUC <= 0.65 + (b) one-sided
  not-easier on the POST-OOF retained set, then scores false-uphold CP. (This is the path `armA-retest.mjs` /
  `oof-retain.mjs` implement; the re-test step is the metered HALT.)
- PROVES/DISPROVES: if the OOF retains >= 36 traps that pass gates (a)+(b) and the voter clears CP-upper <=
  0.10 -> a FULL-WORKS-eligible specificity result on-distribution. If OOF retention < floor (the standing
  hypothesis: claim ~= quote -> OOF reads "entails" -> few traps retained, ~10/98 on the stale run) ->
  VOID-on-power, DISPROVING that on-distribution traps are constructible at N.
- FEASIBILITY: MEDIUM, budget-gated. The re-test is ~4 Copilot calls / ~12-25 Credits (16 candidates on clean
  evidence); the FULL retain is ~108 OOF calls. Voting (if it scales) draws the Claude session pool (the
  EXHAUSTED org budget -- a hard blocker until raised/reset).
- COST: re-test LOW (~12-25 Credits); full path MEDIUM-HIGH (~108 Copilot calls + a voting wave on a restored
  budget).
- RISK: the structural claim~=quote property may make this VOID regardless of evidence-cleaning (the re-test
  is designed to confirm or refute exactly this). HIGH probability of VOID per the project's own hypothesis.

**B2. Adopt the Phase-19 offline MCC SCREEN-PASS as a SCOPED false-uphold arm (the records-aligned fallback).**
- DOES: uses the already-achieved Phase-19 SCREEN-PASS over the vetted external contrastive datasets (WiCE
  vendored + AVeriTeC fetched) as the specificity evidence, explicitly SCOPED (off-distribution; SCREEN, never
  WORKS).
- PROVES/DISPROVES: proves the voter discriminates supported-vs-refuted ON A VETTED EXTERNAL DISTRIBUTION
  (a confound-robust MCC screen), does NOT prove it on the production distribution. Honest SCOPED specificity.
- FEASIBILITY: HIGH (already done in Phase 19; no new spend).
- COST: ~0.
- RISK: the SCOPED limit must be named in the report (the verdict does not transfer to production
  distribution). This is the D-22 Q3 fallback rung between C (full WORKS) and RAISE.

**B3. Manual/model trap authoring -- REJECTED by prior evidence, listed for completeness.**
- DOES: author minimal-edit contrastive traps from real dense bundles.
- PROVES/DISPROVES: would give difficulty-matched traps IF it passed gate (a) -- but it EMPIRICALLY FAILED
  (authored 32-pair seed AUC 0.856 >> 0.65), and the human declined to author. [VERIFIED:
  `CERTIFY-WORKS-RATIFICATION.md`.]
- FEASIBILITY: LOW (failed once; human declines). COST: high human effort.
- RISK: re-introduces the lexical artifact. Include only to record WHY it is off the table.

### Group C -- options for the VERDICT FRAME (what to certify, given the arms)

**C1. SCOPED sensitivity-only certificate (over-refusal arm passes after A1/A2; false-uphold VOID/SCOPED).**
- DOES: certifies sensitivity (over-refusal <= 0.15) on the decontaminated arm B, and reports the
  false-uphold arm as VOID-on-power (B1 fails) or SCOPED-external (B2), with an explicit co-primary-endpoint
  disclosure (Target C): "sensitivity bounded; specificity NOT bounded on-distribution; the trade-off means a
  silently-shipped overclaim is not ruled out by this certificate."
- PROVES/DISPROVES: proves the voter does not WRONGLY REFUTE supported claims (the user-facing under-citation
  failure); does NOT prove it catches overclaims (the catastrophic arm). Honest, defensible, partial.
- FEASIBILITY: HIGH (composes A1 + B2). COST: ~A1 + 0.
- RISK: must NOT be presented as WORKS (the frozen `certifyModel` already enforces BOTH-gates-for-WORKS).

**C2. Full WORKS (both arms pass on-distribution).**
- DOES: B1 retains >= 36 traps passing gates (a)+(b) AND voter clears 0.10, AND arm B (after A1/A2) clears
  0.15. The D-22 target outcome.
- PROVES/DISPROVES: the strongest verdict -- bounds BOTH error rates on the maintainer-curated production
  distribution. Disproves nothing; it is the success state.
- FEASIBILITY: LOW-MEDIUM, budget-gated and hypothesis-against (B1 likely VOID). Needs a restored org budget
  for the voting wave.
- COST: HIGH (full OOF retain + a both-arms voting wave).
- RISK: gated on B1 not being structurally VOID -- the project's own hypothesis is that it IS.

**C3. Honest VOID/RAISE (declare the on-distribution cert un-constructible; ship Sonnet-default).**
- DOES: records VOID-on-power for the false-uphold arm (B1 fails the floor), keeps the over-refusal arm as
  diagnostic, RAISES to the user, ships Sonnet-default (D-01), keeps the Haiku flip DEFERRED (D-06).
- PROVES/DISPROVES: proves NOTHING about WORKS -- but honestly so. It is a VOID (the read lacks power), NOT a
  DOES-NOT-WORK (the voter is not shown to fail). The cleanest settle-OR-raise.
- FEASIBILITY: HIGH (no spend; the `20-05-LIVE-CERT-RESULT.md` RAISE is already this shape).
- COST: ~0.
- RISK: the milestone closes without a WORKS verdict -- acceptable because the shippable outcome (Sonnet
  -default skill) never depended on it (D-01). The most-defensible cheapest path if the board values closure.

### Group D -- the cheap-vs-strong tier instrument (only if an over-refusal arm certifies; Haiku flip DEFERRED)

**D1. Paired McNemar + pre-registered non-inferiority margin on the SAME frozen decontaminated corpus.**
- DOES: scores STRONG and CHEAP on the identical frozen items/gold/gates; compares discordant cells with an
  exact McNemar (small-N regime) and a pre-registered non-inferiority margin for "co-equal".
- PROVES/DISPROVES: proves CHEAP is non-inferior (or inferior) to STRONG at a stated margin; guards against
  the tier-flip artifact (Target E) by requiring CHEAP to clear the SAME absolute CP gates, not merely "tie".
- FEASIBILITY: deferred (D-06); a future-run instrument. COST: a second voting wave (session pool).
- RISK: the tier-flip artifact -- a CHEAP tie on a still-contaminated over-refusal metric is spurious; D1
  must run on a DECONTAMINATED arm (A1/A2 first).

---

## The shared-root recommendation frame (NEUTRAL -- for the board, not a verdict)

The two breakdowns share ONE cause: gold built CLOSED-BOOK (excerpt-entailment) vs voter run OPEN-BOOK (live
web) -- different constructs (Target D). Any bundle the board converges on is more defensible if it NAMES this
and aligns the certification construct with the production construct. Coherent bundles the board might weigh:

- **Cheapest-honest:** A3-or-skip + B2 (SCOPED external) + C3 (VOID/RAISE). ~0 spend; certifies nothing;
  ships Sonnet-default. Matches `20-05-LIVE-CERT-RESULT.md`.
- **Surgical-rescue:** A1 (decontaminate the 4, pre-registered) + B2 (SCOPED external false-uphold) + C1
  (SCOPED sensitivity-only). ~10-15 Credits; certifies sensitivity, scopes specificity.
- **Construct-aligned full attempt:** A2 (open-book gold) + B1 (native traps) + C2 (full WORKS). Budget
  -gated, hypothesis-against; the most spend; the only path to full WORKS.

Each is internally consistent with the frozen primitives (CP gates byte-identical, two arms never pooled,
N frozen before scoring, Sonnet-default ships regardless). The board's job is the trade-off between
defensibility, spend, and how strong a verdict the milestone needs -- not to manufacture a WORKS the data
does not support.

---

## Open questions for the board

1. **Is the over-refusal arm's gold the right CONSTRUCT?** If the voter runs open-book in production, is a
   closed-book excerpt-entailment gold even a valid measurement target (Target D)? This single question
   determines whether Breakdown 2 is "voter over-refuses" or "wrong gold construct".
2. **Does re-adjudicating the 4 disagreements (A1) cross the result-shopping line?** Pre-registration of the
   question + blind control mix is the literature's answer (Guerdan / Cleanlab-as-candidates), but the board
   should ratify the anti-gaming guard explicitly.
3. **Is full WORKS worth the budget given the structural VOID hypothesis (B1)?** The project's own re-test
   hypothesis predicts the false-uphold arm is structurally near-empty (claim ~= quote). The board may prefer
   to confirm-VOID cheaply (the ~12-25 Credit re-test) before committing to the full-WORKS spend.
4. **Minimum annotators for a formal alt-test.** One human + the OOF pair is borderline for the 3-annotator
   alt-test minimum (Target A). Frame as informal re-adjudication, or recruit a second human signal?

---

## Sources

### Primary / peer-reviewed (HIGH -- VERIFIED in this or a prior pass)
- Guerdan et al., "Validating LLM-as-a-Judge Systems under Rating Indeterminacy," NeurIPS 2025 --
  https://arxiv.org/html/2503.05965v1 (rating indeterminacy; response-set elicitation; 31% mis-selection).
- Northcutt, Jiang, Chuang, "Confident Learning: Estimating Uncertainty in Dataset Labels," JAIR --
  https://arxiv.org/abs/1911.00068 (label-error detection as re-adjudication candidates; Cleanlab).
- AVeriTeC, "A Dataset for Real-world Claim Verification with Evidence from the Web," arXiv:2305.13117 --
  https://arxiv.org/pdf/2305.13117 (Supported/Refuted/Not-Enough-Evidence/Conflicting; refutation vs absence).
- VitaminC, Schuster et al., NAACL 2021, arXiv:2103.08541 -- contrastive minimal-pairs (single-sentence
  caveat; the prior pass REFUTED its application to our dense confound).
- Lee et al., "Trust or Escalate," ICLR 2025 --
  https://proceedings.iclr.cc/paper_files/paper/2025/file/08dabd5345b37fffcbe335bd578b15a0-Paper-Conference.pdf
  (judge over-confidence; selective evaluation; cascade-from-cheap with a human-agreement guarantee).
- Calderon et al., "The Alternative Annotator Test for LLM-as-a-Judge," NAACL 2025, arXiv:2501.10970 --
  https://arxiv.org/pdf/2501.10970 (LOAO; judge-replaces-a-human; epsilon margin; min 3 annotators).

### Secondary (MEDIUM -- fetched this session, single authoritative source each)
- "Judging Against the Reference: Knowledge-Driven Failures in LLM-Judges on QA," arXiv:2601.07506 --
  https://arxiv.org/pdf/2601.07506 (correct-override vs erroneous-override; protocols to separate them).
  [ID not independently re-confirmed this session -- treat as MEDIUM until the board verifies.]
- FEVER fact-verification task overview -- https://www.emergentmind.com/topics/fever-fact-verification-task
  (three-way scheme; mutate-source construction; label aggregation rule).
- HealthFC, arXiv:2309.08503 -- https://arxiv.org/html/2309.08503v2 (NEI means different things across datasets).
- "Beyond human gold standards: multimodel automated abstract classification," PMC12873610 --
  https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12873610/ (multi-model disagreement -> improved gold).
- CLEANANERCorp, arXiv:2408.12362 (worked Cleanlab detect-then-re-adjudicate loop).
- Stark & Zapf, "Sample size... single-arm confirmatory diagnostic accuracy study," 2020 --
  https://journals.sagepub.com/doi/full/10.1177/0962280220913588 (sensitivity+specificity co-primary;
  per-metric one-sided hypotheses).
- "Increasing test specificity without impairing sensitivity (SARS-CoV-2 serology)," medRxiv 2020 --
  https://www.medrxiv.org/content/10.1101/2020.11.05.20226449.full.pdf (the communicating-vessels trade-off).
- "Partial verification bias correction (inverse-probability bootstrap)," PLOS One --
  https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0321440 (relative TPR/FPR under partial
  verification).
- Data-contamination paper list -- https://github.com/lyy1994/awesome-data-contamination ; "Leak, Cheat,
  Repeat," arXiv:2402.03927 -- https://arxiv.org/pdf/2402.03927 (leakage is multi-stage; 1-45% audited).
- Evidently AI LLM-judge guide -- https://www.evidentlyai.com/llm-guide/llm-as-a-judge (retrieval-vs
  -generation reachability split; reference-anchored scoring).
- McNemar's test references -- https://rasbt.github.io/mlxtend/user_guide/evaluate/mcnemar/ ;
  https://machinelearningmastery.com/mcnemars-test-for-machine-learning/ ;
  https://www.emergentmind.com/topics/mcnemar-s-test (paired binary; exact variant; equivalence/margin test).
- Label Studio disagreement-review guide --
  https://labelstud.io/learningcenter/how-to-use-llm-as-judge-for-agent-evaluation/ (adjudication feedback loop).

### Internal (project authority -- the GROUND this extends)
- `19-04-CERTIFY-WORKS-RESEARCH.md` (SDT positive-trials constraint; MCC/AUC/d-prime; the GAPS).
- `19-04-REPLAN-DECISION-12.md` (the staged offline-SCREEN-gates / live-PRIMARY design).
- `20-PRE-DISCUSS-RESEARCH-live-cert.md` (shadow/canary; rare-event N; Guerdan; OR-Bench out-of-family).
- `CERTIFY-WORKS-BOARD-DECISION.md` + `CERTIFY-WORKS-RATIFICATION.md` (D-21/D-22; the two-arm split-source
  design; the native refuted-gold ARM-A amendment; the six pre-spend locks).
- `20-CONTEXT.md` D-01..D-22; `eval/lz-eval-live-lock-rule.md` (the pre-registered acceptance ladder:
  WORKS/SCOPED/DOES-NOT-WORK/VOID/RAISE); `20-05-LIVE-CERT-RESULT.md` (the Stage-0 RAISE); `.continue-here.md`
  (the metered re-test halt + the claim~=quote VOID hypothesis).

## Metadata

**Confidence breakdown:**
- Target A (control label-noise / re-adjudication): HIGH -- multiple peer-reviewed sources converge.
- Target B (valid control construction): MEDIUM -- dense-difficulty-matched positives remain literature
  -unsolved (re-confirmed); the AVeriTeC relabeling vocabulary is the new lever.
- Target C (one-sided / scoped certification): HIGH -- diagnostic-accuracy methodology is settled.
- Target D (open-book vs closed-book + leakage): MEDIUM-HIGH -- leakage literature HIGH; the "different
  constructs" framing is ASSUMED (synthesized, no single source for this exact setup).
- Target E (cheap-vs-strong): MEDIUM -- McNemar + non-inferiority is standard; the tier-flip artifact is
  ASSUMED (synthesized from Breakdown 2 + cascade literature).
- Options (F): HIGH on feasibility/cost (grounded in the on-disk project state); the prove/disprove framing
  follows directly from Targets A-E.

**Research date:** 2026-06-21
**Valid until:** ~2026-07-21 for the methodology (stable); the budget-gated feasibility (org spend limit) is
volatile -- re-confirm before any metered run.
