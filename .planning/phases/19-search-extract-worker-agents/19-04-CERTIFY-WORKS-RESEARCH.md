# Deep-research synthesis: reaching a certified-WORKS verdict for an LLM claim-judge

**Date:** 2026-06-19. **Method:** the `deep-research` workflow (run wf_cd6853aa-792): 5 search angles -> 23 sources
fetched -> 109 claims extracted -> 25 verified by 3-vote adversarial verification -> 20 confirmed, 5 killed ->
7 synthesized findings. 105 agents. Full output in the run transcript (gitignored temp tasks dir).

## Question
How can a team certify an LLM claim-verification JUDGE "works" when the over-refusal (false-refusal) arm cannot
be cleanly constructed offline -- given that entailment-native positive controls are either not freely fetchable
as evidence text, or single-sentence / structurally EASIER than dense multi-document negative traps (a
difficulty-confound)?

## Confirmed findings (primary peer-reviewed sources; 3-vote adversarially verified)

F1. **OR-Bench** (Cui et al., ICML 2025; arXiv:2405.20947) is the canonical large-scale over-refusal MEASUREMENT
   benchmark (80k prompts, 10 categories, ~1k hard subset). It is NOT an anti-confound design (its supposed
   toxic-positive-control bundle was REFUTED 0-3).

F2. **Contrastive minimal-pairs (VitaminC)** (Schuster, Fisch, Barzilay, NAACL 2021; arXiv:2103.08541) are the
   established difficulty-matched construction: supported/refuted claims on near-identical before/after evidence
   differing only by the label-flipping edit, drawn from the same lexical/structural distribution; symmetric
   annotation; explicitly avoids word-overlap difficulty bias. **CAVEAT (verified):** VitaminC evidence is
   SINGLE-SENTENCE -> it matches positive-vs-negative WITHIN its own pairs, NOT against external dense
   multi-document traps. The claim it solves the positives-easier-than-hard-negatives confound was REFUTED 0-3.

F3. **Contrast sets** (Gardner et al., EMNLP 2020 Findings) + **Counterfactually-Augmented Data (CAD)**: minimal
   label-flipping edits -> difficulty-matched-by-construction pairs; model accuracy drops up to 25% vs original
   sets. **CAVEAT:** naive minimal-pair construction is an unreliable robustness guarantee (a "myopia" failure
   mode where models overfocus on edited features) -- sound item-construction, NOT a robustness panacea.

F4. **Matthews Correlation Coefficient (MCC)** (Chicco & Jurman, BMC Genomics 2020 + BioData Mining 2023) is the
   metric that STRUCTURALLY breaks the always-refute confound WITHOUT a separately-hand-built positive corpus:
   high only when ALL FOUR confusion-matrix cells are good; a degenerate single-class (refuse-everything) judge
   = MCC 0. F1/accuracy can be inflated by one-sided performance; ROC-AUC can be inflated by ONE high rate.

F5. **Signal Detection Theory** (National Academies NBK219045; Green & Swets): separates discriminability
   (d-prime) from the accept/reject criterion; always-refute is a criterion shift a naive metric misreads as
   poor sensitivity. **DECISIVE CONSTRAINT:** d-prime (and balanced accuracy, Youden's J, MCC, AUC) MATHEMATICALLY
   REQUIRE BOTH a hit rate (positive trials) AND a false-alarm rate (negative trials). You CANNOT certify
   sensitivity from the trap arm alone. CAVEAT: LLMs violate equal-variance Gaussian -> unequal-variance indices
   (da, A') may be needed.

F6. **AUC** (NCSS/PASS; Hanley-McNeil, DeLong): = P(positive ranked above negative); refuse-everything cannot beat
   chance (0.5); large-sample one-sided normal-approx CI supports a certification gate. **CAVEATS:** a hard binary
   REFUTE/UPHOLD label gives a degenerate AUC=0.5 (AUC needs a graded/rankable score); the normal CI is weak near
   the boundary / small N (use DeLong / logit / empirical-likelihood). The claim ROC/AUC bounds BOTH error arms
   at once was REFUTED 0-3.

F7. **THE CENTRAL UNAVOIDABLE FINDING:** the confound-robust metrics (MCC, balanced accuracy, d-prime, AUC) do
   NOT eliminate the need for positive trials -- they only REMOVE the requirement that positives be a SEPARATELY
   hand-built, PERFECTLY difficulty-matched CORPUS. You still need SOME supported items.

## Research GAPS (no surviving verified claims -- treat as unknowns; possibly search-coverage, field is fast-moving)
- Multi-hop / multi-document difficulty-matched positive construction (matching positives to DENSE traps):
  the one multi-hop counterfactual-construction claim (arXiv:2310.14508) was REFUTED 0-3 -> our HARDEST problem
  has NO verified literature solution; every verified method (VitaminC, contrast sets, CAD) is
  single-sentence / single-instance.
- Claim-verification-SPECIFIC over-refusal benchmarks: none verified.
- LIVE / shadow / canary OPERATIONAL certification methods: none surfaced/survived.
- Published LLM-as-judge ACCEPTANCE STANDARDS (what metric value / CI width / sample size = trustworthy): none
  verified -> the certification BAR is unspecified by evidence (-> pre-registration discipline must carry it,
  not a defensible-sounding self-chosen number).

## Open questions (carried into the board + the eventual re-plan)
1. A method for difficulty-matched positives from DENSE multi-doc evidence (unsolved in the surveyed literature).
2. The certification BAR itself (metric value / CI width / N) -- unspecified by verified evidence.
3. Operational (live/shadow) certification methods -- unaddressed by verified evidence.
4. Which bias-free sensitivity index (d-prime / da / A' / balanced-acc / Youden / MCC) + which one-sided CI
   method (Wald / DeLong / logit / empirical-likelihood) near a certification threshold.

## Primary sources
- arXiv:2405.20947 (OR-Bench); arXiv:2103.08541 (VitaminC); aclanthology 2020.findings-emnlp.117 (contrast sets);
  arXiv:2406.06633 + arXiv:2306.12146 (CAD / PairCFR); Springer 10.1186/s12864-019-6413-7 + 10.1186/s13040-023-00322-4
  (MCC, Chicco & Jurman); NCBI NBK219045 (Signal Detection Theory); NCSS/PASS ROC-AUC CI doc.
- REFUTED (do not rely on): OR-Bench toxic-positive-control anti-confound claim; VitaminC-solves-our-confound
  claim; arXiv:2310.14508 multi-hop counterfactual construction; ROC/AUC-bounds-both-arms claim.
