# Phase 20 PRE-DISCUSS RESEARCH: Live/Operational Certification of an LLM Claim-Verification Judge

Research date: 2026-06-19. Scope: methodology for CERTIFYING an LLM claim-verifier ("judge") on a LIVE/operational distribution after an offline screen passed. Consumed by a cross-model decision board. Findings are tagged VERIFIED (peer-reviewed or primary vendor/standard source) vs CONVENTION (practitioner rule-of-thumb / commercial blog) vs GAP (literature silent).

---

## Verified findings

1. **Shadow -> canary -> ramp is a real, documented operational pattern for LLM releases, and an LLM judge is the standard shadow-phase scorer.** Candidate model runs in parallel on duplicated/replayed production traffic; an LLM judge scores candidate-vs-baseline on use-case criteria (factual accuracy, tone, task completion, format); progression is gated on regression thresholds; canary then routes a small live slice with automatic rollback. *Why credible: practitioner deployment guide (TianPan, 2026-04) plus an aggregated study of 1,200 production deployments (ZenML, 2025) and a named real-world case (Ramp runs financial agents in shadow mode, an LLM judge compares agent prediction to the human's actual action, live actions enabled only after shadow accuracy clears a threshold).* This is the closest published analog to certifying an evaluator against production distribution.

2. **The "validate-a-judge-against-a-multi-annotator gold set" workflow is the dominant published method, and the prior research's "you need positives" requirement is independently corroborated by the rare-event detection math.** A judge is validated by: collect multiple human ratings per item on a validation corpus, aggregate to per-item gold labels, then measure judge-vs-gold agreement. *Why credible: A Survey on LLM-as-a-Judge (arXiv 2411.15594) frames human-agreement as the foremost evaluation aspect; Reference-Guided Verdict (arXiv 2408.09235) and multiple benchmarks (AVeriTeC, VeriFact, DEER, M2-Verify) implement it.*

3. **The standard gold-label validation method is itself biased when the rating task admits multiple defensible answers ("rating indeterminacy"), and forced-choice elicitation is the culprit.** Guerdan et al., NeurIPS 2025 (arXiv 2503.05965): judge systems selected by the standard forced-choice / single-gold-label method perform up to 31% worse than systems selected by their multi-label "response set" elicitation (raters mark ALL defensible verdicts). *Why credible: peer-reviewed NeurIPS 2025; authors at CMU/Microsoft Research.* Directly relevant: a "refuted/unrefuted" binary on dense evidence may be indeterminate for some claims, so a single-gold adjudication can systematically misrank the judge.

4. **LLM judges are systematically over-confident: they over-estimate their agreement with the human majority.** "Trust or Escalate" (Lee et al., ICLR 2025) shows simple confidence measures are brittle even for the strongest judge; the fix is selective evaluation that abstains/escalates to satisfy a *prescribed* human-agreement level (simulate diverse annotators via in-context learning, estimate confidence as agreement ratio). *Why credible: peer-reviewed ICLR 2025.* This is the documented mechanism behind the "correlated silent false-positive" blind spot: a cheap judge can be confidently and uniformly wrong.

5. **The rare-event / zero-failure upper-bound math is settled and gives an exact N for a target false-uphold/over-refusal ceiling.** Rule of three: with 0 failures in n trials, 3/n is the one-sided upper 95% bound (Hanley & Lippman-Hand 1983; The American Statistician 1997; Wikipedia). Worked: 0/100 -> <3%; 0/300 -> <1%; 0/1500 -> <0.2%. For a two-sided 95% bound use 3.7/n. Reliable for n>30. *Why credible: classic peer-reviewed statistics; Cochrane Handbook 16.9.4.* For a ceiling near 0.10-0.15 with zero observed failures: n >= 3/0.10 = 30 (<=10%), n >= 3/0.15 = 20 (<=15%). With SOME failures observed, use a one-sided Clopper-Pearson or Wilson upper bound, not 3/n.

6. **Clopper-Pearson vs Wilson for the gate is a settled trade-off.** Wilson is the recommended default one-sided bound (shorter intervals, sane behavior at 0 events, good coverage for typical n). Clopper-Pearson is exact/conservative (guarantees >= nominal coverage) but needs ~40% larger N; prefer it for a guaranteed-conservative gate or very small n (<5). *Why credible: The American Statistician 2024 (tandfonline 00031305.2024.2350445); NIST TN.2119; Minitab/standard methods docs.* A one-sided test of H0: p <= p0 rejects when p0 < lower bound (or for an upper-ceiling gate, pass when the upper bound < p0).

7. **OR-Bench/XSTest establish how over-refusal (false refusal) is measured, and that an ensemble of out-of-family judges beats a single judge.** OR-Bench (Cui et al., ICML 2025, arXiv 2405.20947): 80k benign-but-toxic-looking prompts; refusal rate plotted against a toxic-prompt rejection rate; prompts admitted only by MAJORITY VOTE of GPT-4-turbo + Llama-3-70B + Gemini-1.5-pro. Critically, Claude-3-Opus was rejected as a judge for being over-conservative with low agreement to the others. *Why credible: peer-reviewed ICML 2025.* XSTest (Röttger et al., 2024) is the 250-safe/200-unsafe contrastive seed. Lesson for the board: single-family judging ensembles inherit a shared over-refusal bias; out-of-family ensemble + majority vote is the published de-biasing move.

8. **Production fact-verification ground truth is built by N>=2-3 independent annotators + a structured adjudication step, with IAA measured BEFORE labels are revealed.** Patterns: discussion-to-consensus (DEER, 100 claims, 2 annotators), majority-vote with tie-break escalation to 2 more clinicians (VeriFact), and multi-phase re-annotation where disagreement after re-pass -> claim discarded (AVeriTeC). Supported/Not-Supported/Not-Addressed is the common label set. *Why credible: peer-reviewed datasets (arXiv 2305.13117 AVeriTeC, 2501.16672 VeriFact, 2512.17776 DEER).*

---

## Practical methods (concrete, actionable)

- **Obtaining adjudicated production-distribution SUPPORTED claims:** Sample the judge's OWN real inputs (evidence + claim) from production. Have 2-3 independent annotators label verdict against evidence WITHOUT seeing each other or any model output. Resolve disagreement by majority vote, then escalate ties to additional annotators or moderated discussion (VeriFact/AVeriTeC pattern). To capture indeterminacy, allow annotators to mark a "response set" (both verdicts defensible) per Guerdan, rather than forcing one.
- **Hybrid / LLM-as-adjudicator:** Use an OUT-OF-FAMILY ensemble (e.g., GPT + Gemini + Llama) with majority vote as a cheap pre-adjudicator; reserve human adjudication for the disagreement set. OR-Bench validates this exact construction. Do NOT use a same-family judge to adjudicate its own family's outputs (Claude-Opus-as-judge was empirically too conservative + low-agreement).
- **Measuring over-refusal operationally:** Over-refusal = judge votes "refuted" on a claim adjudicated SUPPORTED. Measure it as a one-sided upper-bounded rate on the adjudicated-SUPPORTED corpus (the positives the prior SDT research requires). This is the live analog of the OR-Bench refusal-rate axis.
- **Shadow phase for the judge:** Run the candidate judge on replayed/duplicated production traffic; log its verdicts without acting; compare to baseline/adjudicated labels; gate ramp on the regression metric staying within threshold.
- **Canary + ramp:** 1% (or 0.1% high-stakes) -> 5% -> 20% -> 50% -> 100%, each step held long enough to accumulate statistically meaningful data; automatic rollback to baseline without human intervention on breach.
- **Kill-switch / control-chart layer:** Set thresholds on a guardrail metric (block/refusal rate, false-positive rate) and auto-alert/auto-revert on breach. NOTE: published LLM tooling implements this as threshold-on-eval-score + drift detection + runtime intervention, NOT formal Shewhart/CUSUM/EWMA control charts (see GAPS).
- **Calibration loop (judge-vs-human):** Sample 100-300 (best practice 200-500) production traces, 2-3 annotators, compute IAA; then judge-vs-human agreement on the same scale; recalibrate monthly against a frozen gold set, alert on agreement drop. (CONVENTION-grade numbers; see below.)

---

## Acceptance-standard guidance (numbers if any)

- **Inter-annotator agreement (human-human) acceptance:** Cohen's kappa >= 0.6 acceptable, >= 0.8 strong; < 0.4 means rubric is ambiguous (rewrite). Krippendorff's alpha >= 0.667 is the cited acceptable cutoff (alpha >= 0.8 ideal). *Mixed: kappa>=0.6/>=0.8 bands and the "rewrite if <0.4" rule are CONVENTION (FutureAGI commercial blogs); Krippendorff alpha>=0.667 is the author's own VERIFIED cutoff and appears in peer-reviewed annotation studies.*
- **Judge-vs-human acceptance:** accept the judge when its judge-to-human agreement is COMPARABLE to human-human agreement; rework the prompt if judge-to-human kappa < 0.5. *CONVENTION (commercial guidance), but consistent with the survey's "virtual annotator" framing.*
- **Gold-set size:** 200-500 hand-labeled traces per workload per rubric (calibration anchor); calibration corpora of 100-300 for the lighter loop. *CONVENTION.* Peer-reviewed IAA studies used ~100-200 claims for the agreement estimate itself (DEER 100, M2-Verify/AVeriTeC 200).
- **Rare-event N for an over-refusal/false-uphold ceiling (VERIFIED math):** zero-failure rule of three -> n=30 certifies <=10% at 95%; n=20 certifies <=15%; n=100 -> <=3%; n=300 -> <=1%. With observed failures, size via a one-sided Wilson/Clopper-Pearson upper bound on the target ceiling; CP needs ~40% more N than Wilson. Size with a RELATIVE margin of error for rare rates (absolute MoE misbehaves near 0).
- **Canary regression thresholds (from the deployment guide, CONVENTION):** P99 latency increase > 40%; refusal-rate jump > 5 percentage points; cost-per-request over budget -> auto-rollback. No published statistical-significance criterion for the ramp steps.
- **Golden dataset of 200-500 examples for CI eval gates** built from REAL production failures, not synthetic. *CONVENTION (ZenML/practitioner).*

---

## GAPS / where the literature is silent (or only folklore)

- **No published end-to-end "operational certification standard" for an LLM judge/claim-verifier.** Shadow/canary/ramp is documented as a release-safety pattern for the GENERATOR; applying it to certify the EVALUATOR itself is assembled from analogy, not a cited certification protocol. Confirms the prior research's stated gap.
- **No authoritative "this metric value / CI width / N = trustworthy judge" acceptance standard.** All concrete acceptance numbers (kappa bands, gold-set sizes, judge-vs-human cutoffs, canary thresholds) are CONVENTION from commercial blogs or single deployment guides, not a standards body or meta-analysis. The rare-event upper-bound MATH is the only VERIFIED quantitative anchor, and it tells you what a given N *certifies*, not what ceiling is *acceptable* (that remains a business/risk choice).
- **Formal Statistical Process Control (Shewhart/CUSUM/EWMA control charts) is essentially absent from LLM-monitoring practice.** Tooling uses threshold-on-eval-score + embedding-drift + runtime intervention. The "control-chart kill switch" framing is an analogy the board imports, not an established LLM pattern.
- **The "correlated silent false-positive" blind spot (cheap voters unanimously, confidently wrong) is named and mechanistically explained (judge over-confidence, ICLR 2025) but has NO published acceptance test specific to a tiered cheap-behind-strong judge seating.** Mitigations exist in adjacent literature (semantic-agreement cascades, FrugalGPT stop-judge, out-of-family ensemble majority vote, audit of unanimous agreements) but no paper certifies a Haiku-first-behind-Sonnet-default judge with an audit-of-unanimous-agreements protocol. This is a genuine extrapolation zone.
- **Difficulty-matched dense-evidence positives remain literature-unsolved** (confirms prior pass); no method surfaced here closes it. Confound-robust scalar metrics (MCC/balanced acc/d-prime/AUC) remain the published workaround and STILL require positives.
- **Cascade/agreement work targets cost-quality of the ANSWER, not certification of a JUDGE.** Semantic-agreement deferral (CMU, arXiv 2509.21837) and FrugalGPT are about when to escalate a generation, transferable as a SIGNAL but not a certification method.

---

## Sources

VERIFIED / peer-reviewed:
- Guerdan et al., "Validating LLM-as-a-Judge Systems under Rating Indeterminacy," NeurIPS 2025 — https://arxiv.org/abs/2503.05965
- Lee et al., "Trust or Escalate: LLM Judges with Provable Guarantees," ICLR 2025 — https://proceedings.iclr.cc/paper_files/paper/2025/file/08dabd5345b37fffcbe335bd578b15a0-Paper-Conference.pdf
- Cui et al., "OR-Bench: An Over-Refusal Benchmark for Large Language Models," ICML 2025 — https://arxiv.org/abs/2405.20947 ; code https://github.com/justincui03/or-bench
- Röttger et al., "XSTest," 2024 (over-refusal seed suite) — referenced via OR-Bench / FalseReject
- "A Survey on LLM-as-a-Judge," arXiv 2411.15594 — https://arxiv.org/pdf/2411.15594
- "Reference-Guided Verdict: LLMs-as-Judges in Free-Form QA," arXiv 2408.09235 — https://arxiv.org/pdf/2408.09235
- AVeriTeC dataset, arXiv 2305.13117 — https://arxiv.org/pdf/2305.13117
- VeriFact (clinical claim verification vs EHR), arXiv 2501.16672 — https://arxiv.org/pdf/2501.16672
- DEER deep-research report benchmark, arXiv 2512.17776 — https://arxiv.org/pdf/2512.17776
- "Semantic Agreement Enables Efficient Open-Ended LLM Cascades," arXiv 2509.21837 — https://arxiv.org/pdf/2509.21837
- "Dynamic Model Routing and Cascading: A Survey" (FrugalGPT, Self-REF, probe routing), arXiv 2603.04445 — https://arxiv.org/html/2603.04445v2
- Rule of three: Hanley & Lippman-Hand 1983; "A Look at the Rule of Three," The American Statistician 51(2) 1997 — https://www.tandfonline.com/doi/abs/10.1080/00031305.1997.10473947 ; Wikipedia — https://en.wikipedia.org/wiki/Rule_of_three_(statistics) ; Cochrane Handbook 16.9.4 — https://handbook-5-1.cochrane.org/chapter_16/16_9_4_confidence_intervals_when_no_events_are_observed.htm
- "Binomial Confidence Intervals for Rare Events," The American Statistician 2024 — https://www.tandfonline.com/doi/full/10.1080/00031305.2024.2350445
- NIST TN.2119 "Estimating Instrument Performance with Confidence Intervals" — https://nvlpubs.nist.gov/nistpubs/TechnicalNotes/NIST.TN.2119.pdf
- Minitab 1-Proportion methods (one-sided CP) — https://support.minitab.com/en-us/minitab/help-and-how-to/statistics/basic-statistics/how-to/1-proportion/methods-and-formulas/methods-and-formulas/

CONVENTION / practitioner (use as rules-of-thumb, NOT standards):
- TianPan, "Releasing AI Features Without Breaking Production: Shadow/Canary/A-B," 2026-04 — https://tianpan.co/blog/2026-04-09-llm-gradual-rollout-shadow-canary-ab-testing
- ZenML, "What 1,200 Production Deployments Reveal About LLMOps in 2025" (Ramp shadow-mode case) — https://www.zenml.io/blog/what-1200-production-deployments-reveal-about-llmops-in-2025
- FutureAGI, "LLM-as-Judge Best Practices 2026: Calibration, Bias, Cost" (kappa bands, gold-set sizes) — https://futureagi.com/blog/llm-as-judge-best-practices-2026
- Galileo, "Best LLM Output Drift Monitoring Platforms" — https://galileo.ai/blog/best-llm-output-drift-monitoring-platforms
- Confident AI / OpenObserve / Braintrust LLM-monitoring guides (guardrail-metric + threshold alerting) — https://openobserve.ai/blog/llm-monitoring-best-practices/
