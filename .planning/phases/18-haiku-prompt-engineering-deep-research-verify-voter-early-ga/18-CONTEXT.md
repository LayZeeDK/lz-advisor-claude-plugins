# Phase 18: Haiku prompt-engineering deep research + verify-voter + early gating eval - Context

**Gathered:** 2026-06-16
**Status:** Ready for planning
**Mode:** `--auto --analyze --chain` (ultracode). Two high-impact gray areas (dataset/labeling, eval
execution/cost) were escalated to the user, who DELEGATED to research-backed judgment: "I will not
handcode anything / I will not hand-write these. Find EXISTING datasets if you need to. Use your best
judgment, backed by research. Use advisors (Opus); escalate out-of-family (Copilot) only if absolutely
needed. Comply with licensing or keep them local-only (Git-ignored) while running evals."

All decisions below are made by Claude, grounded in (a) a multi-source research pass -- academic
fact-verification literature + Anthropic + OpenAI primary articles + the SkillsBench paper + the
installed skill-creator eval framework + mgechev/skillgrade; (b) an Opus advisor consult; and (c) a
6-agent ADVERSARIAL VERIFICATION workflow that re-fetched primary sources and tried to refute every
load-bearing claim. The verification OVERTURNED four of my initial premises (recorded below) -- those
corrections are the load-bearing reason the dataset choice changed from VitaminC to WiCE and the CI
method changed from Wald to exact-binomial. No Copilot consult was needed.

<domain>
## Phase Boundary

A STANDALONE gating eval that settles whether the adversarial verify-voter may run on Haiku (cheap) or
must stay on Sonnet -- BEFORE any Haiku agent is authored anywhere in the pipeline. Runs isolated from
the orchestrator/search/extract workers, over the Phase-16 aggregator tally + the Phase-17 frozen vote
schema. Four deliverables:

1. A **Haiku prompt-engineering reference artifact**, from a dedicated deep-research pass over CURRENT
   authoritative sources (Claude Code Guide / Docs + web), every load-bearing technique verified;
   `lz-nx-ai-plugins` `MODEL-OPTIMIZATION-HAIKU.md` is a NON-authoritative starting point only. Precedes
   authoring any Haiku agent (EVAL-05).
2. The **verify-voter in two variants** -- Sonnet baseline (ship default) + research-grounded Haiku --
   against the FROZEN vote schema, each casting one isolated skeptic vote.
3. A **committed, zero-dependency eval harness** + a **pre-registered, stratified labeled dataset**
   (60-100 claims) drawn from EXISTING human-labeled corpora.
4. The **pre-registered gating eval run** that flips the Haiku-first flag ON, or RAISES the decision to
   the user if Haiku is non-viable (Sonnet-default ships in the interim regardless).

**In scope:** the Haiku-prompt reference artifact; the two voter agents filling the reserved envelope
(`attack_mode`, `disconfirming_query`, source-independence); the eval harness (executor -> deterministic
off-model aggregator computing Pass@1 / Pass^k / per-stratum false-uphold); the dataset assembled by
SAMPLING + STRATIFYING + label-remapping existing corpora (no hand-authoring); the pre-registered lock
rule; the staged, credit-aware eval run.

**Out of scope (other phases):** orchestrator skill, search/extract workers and THEIR model tier
(Phase 19 -- follows this eval), synthesis, `.lz-research/` wiring, production false-uphold monitoring
(Phase 20). Frozen aggregator/vote/schema shapes are consumed, not re-opened.

</domain>

<decisions>
## Implementation Decisions

> Verification verdicts and the refuted premises are in `18-DISCUSSION-LOG.md`. Datasets, licenses, the
> leakage mitigation, and the CI method below were each re-fetched and confirmed/corrected against
> primary sources by the adversarial workflow.

### Eval harness architecture (SkillsBench + skill-creator + skillgrade; CONFIRMED)
- **D-01:** Mirror executor -> grader -> **deterministic off-model aggregator** in a COMMITTED, ZERO-DEP
  harness. The false-uphold GATE is a **deterministic** verdict-vs-gold-label check (SkillsBench:
  "reproducible pass/fail without LLM-as-a-judge variance"; Anthropic *Demystifying Evals*: deterministic
  preferred, LLM-judge only "where necessary"). A Node aggregator in `scripts/` computes Pass@1, Pass^k,
  per-stratum false-uphold + its interval from a single shared sample pool. An LLM-rubric grader is used
  ONLY for qualitative VERIF checks (attack-mode diversity present, `disconfirming_query` recorded,
  source-independence applied), one ISOLATED judge per dimension with an "Unknown" out. skillgrade is NOT
  a dependency (Docker + TS + multi-agent vs the zero-dep constraint); its PATTERNS are mirrored.
- **D-01b (owner clarification, 2026-06-16):** "zero external dependencies" governs the DISTRIBUTED
  PLUGIN RUNTIME -- the research skill + Phase 19/20 workers + the Phase-16 runtime aggregator + the
  shipped voter agents -- which use no npm packages and no external CLIs. The EVAL scripts (`lz-eval-*`)
  are dev/design infrastructure and MAY use the globally-installed `hf` CLI (dataset fetch via
  `hf download` -- handles auth, LFS, `--include` selective fetch, `--revision` pinning, repo-type) and
  the `claude` CLI (the headless run driver), as accepted eval-time TOOL dependencies. They still carry
  no npm/package deps (node built-ins only), and we still re-verify sha256 after download for integrity.

### Dataset selection -- EXISTING human-labeled corpora, no hand-authoring (D-02)
- **D-02:** The SUBTLE-OVERREACH stratum -- the stratum the whole gate hinges on -- uses **WiCE**
  (`jon-tow/wice`; EMNLP 2023, Kamoi et al.) as its SPINE. WiCE's `supported / partially-supported /
  not-supported` labels + non-supported-token annotations are the closest EXISTING operationalization of
  overreach (a claim that says slightly more than its evidence licenses); naturally occurring, open-book,
  human-labeled. **VitaminC is REJECTED** for this stratum (verification: ~57% of its edits are numeric/
  date flips + entity swaps = the EASY polarity-flip axis, paper Table A.1 / Sec 3.3 -- a verifier that
  passes VitaminC tells you nothing about false-uphold on subtly-wrong claims). VitaminC MAY appear only
  as an explicitly-labeled EASY-FLIP control, never as the subtle stratum.
- **D-02b:** **LLM-AggreFact** (`lytang/LLM-AggreFact`; MiniCheck EMNLP 2024, ~59.7K naturally-occurring
  subtle LLM errors) = a HELD-OUT realistic stress set, used VERBATIM only (license constraint, D-04),
  de-duplicating its embedded WiCE subset.
- **D-02c:** **AVeriTeC** (`MichSchli/AVeriTeC` authoritative; `chenxwh/AVeriTeC` = FEVER-2024 mirror w/
  knowledge store) = the OPEN-BOOK arm + leakage test only; its Conflicting-Evidence/Cherry-picking class
  is overreach-adjacent and a SECONDARY trap-authoring seed. **EXCLUDE the Conflicting/Cherry-picking
  class from the hard-gate stratum** (advisor: kappa=0.619 => ~38% contested labels = noise in the sole
  gate). **ExpertQA** (`cmalaviya/expertqa`, MIT) = SECONDARY seed only (claim -> expert-revised-claim
  deltas), not a turnkey stratum (no discrete overreach label). SciFact / Climate-FEVER / HoVer / FEVEROUS
  are REJECTED (verification: simple negations, or retrieval-difficulty axes orthogonal to false-uphold).
- **D-02d:** Sample + stratify PROGRAMMATICALLY to EVAL-01 (~40% supported / ~60% bad, ~half the bad
  SUBTLE; closed-book + open-book). Map source labels to the frozen `unrefuted | refuted`: supported ->
  voter SHOULD return `unrefuted`; partially-supported / not-supported -> voter SHOULD return `refuted`;
  `partially-supported` IS the SUBTLE substratum (the false-uphold trap = a voter that calls a
  partially-supported claim `unrefuted`).

### No hand-authoring; trap-augmentation is a CONDITIONAL programmatic fallback (D-03)
- **D-03:** Primary path uses WiCE's EXISTING human gold labels DIRECTLY -- no construction, no
  hand-writing (satisfies "I will not hand-write these"). **Residual risk (the verification's #1 flag):**
  no off-the-shelf corpus ships a BALANCED, calibrated set of false-uphold TRAPS, so a naive ingest can
  yield a SATURATED, non-discriminating gate (Pass@1=1.0 for both models -- the exact prior-phase failure
  pattern; see the discriminating-fixture lesson). **DECISION:** add a SATURATION CHECK -- if the natural
  WiCE `partially-supported` items do not discriminate (both Haiku and Sonnet near-perfect), augment with
  a PROGRAMMATICALLY generated, MECHANICALLY validated trap set: each trap = a WiCE partially-supported
  SEED overreached by exactly one hedge/quantifier/scope step, accepted ONLY if it flips a deliberately-
  weak reference verifier; cross-family panel adjudicates contested traps. This augmentation is
  model-assisted + script-validated, NEVER hand-written, and authored ONLY from permissive seeds (WiCE /
  ExpertQA), NEVER from LLM-AggreFact (No-Derivatives) or AVeriTeC (NonCommercial). Flagged here so the
  saturation risk stays visible.

### License + data handling -- comply or keep local-only/gitignored (D-04; user directive + verification)
- **D-04:** **Vendor ONLY WiCE** (annotations ODC-BY / code MIT -- the one candidate safe to commit) with
  an attribution NOTICE; do NOT trust the `tasksource/wice` mirror's license field (mislabels cc-by-sa-4.0)
  -- the authoritative `jon-tow/wice` is ODC-BY/MIT. **AVeriTeC = FETCH-ONLY, never vendored** (CC-BY-NC-4.0,
  confirmed 3 ways; NonCommercial is incompatible with the MIT plugin; its knowledge store is the
  MOST-encumbered component = CC-BY-NC PLUS unresolved third-party publisher copyright on scraped text =
  a hard BLOCKER against ever vendoring KS text). **LLM-AggreFact = CC-BY-ND-4.0** = verbatim-only; fetch
  or store verbatim with NOTICE; never derive/edit/release a modified variant. For every non-vendored
  source, COMMIT ONLY a DERIVED MANIFEST -- example IDs + our remapped strata labels + a PINNED HF revision
  + sha256 checksums -- and FETCH the claim/evidence text at eval time into a GITIGNORED local cache,
  failing loud on checksum mismatch. Eval-only, local, not redistributed. Zero-dep preserved.

### Open-book leakage mitigation (D-05; verification-corrected)
- **D-05:** The open-book arm uses AVeriTeC's **REVISED 2.0 knowledge store** (post-2024-11-15 / 2.0
  release) as the SOLE retrieval source -- NOT the original 2024 KS (it leaks fact-check articles +
  post-claim documents). Enforce a **per-claim publication-date cutoff** (voter sees only docs dated
  before the claim's annotated date). REJECT live web search (retrieves the published verdict; non-
  reproducible) and fact-check-domain exclusion (leaky proxy: verdict propagates to aggregators/Wikipedia/
  reposts). Add a **CLOSED-BOOK CONTROL ARM** on the same claims: if closed-book false-uphold approaches
  open-book, PARAMETRIC pretraining memorization dominates and the open-book number is contaminated
  regardless of corpus cleanliness -- gate trust on this. Prefer claims dated after both models' training
  cutoffs where feasible. (Residual: parametric memorization is asymmetric across Haiku vs Sonnet -- which
  is exactly why the gate is a DELTA, D-06, plus the closed-book cross-check.)

### Execution staging + the DELTA gate (D-06; advisor + verification)
- **D-06:** The gate is the **Haiku-MINUS-Sonnet false-uphold DELTA per stratum**, with Sonnet run on the
  IDENTICAL sampled strata as the calibration baseline -- NEVER Haiku's absolute rate (else a closed/open
  gap is just dataset difficulty, and parametric leakage biases the absolute number). Sequence: pre-register
  the lock rule (D-07) FIRST -> `--validate` oracle pre-flight (the trusted Sonnet baseline must score
  ~100% on a known-answer seed; SkillsBench oracle-100% + skillgrade `--validate`; doubles as a label
  cross-check) -> run the **SUBTLE stratum FIRST** (the sole hard gate; spend credits where the decision
  lives) -> remaining strata + the closed-book control arm. Shared-pool pass@k estimator (one pool, all k).
  Temperature 0. **Abort-early ONLY on FAIL;** for any PASS, escalate the SUBTLE subset to **reliable=15
  trials** before declaring PASS (k=5 is too thin for a near-zero-tolerance gate). Staged across credit-
  reset windows; `out_of_credits` mid-run is a known risk the staging bounds. k>=5 per EVAL-02 (its
  variance value is strongest on the non-deterministic open-book/agentic arm; a single-call closed-book
  classification at temp 0 gains little from high k, but k>=5 is retained for requirement compliance + the
  agentic arm).

### Lock rule -- pre-registered, exact-binomial interval (D-07; verification-corrected)
- **D-07:** Written BEFORE running (EVAL-04). Report an INTERVAL, not a point estimate -- but **NOT a
  Wald/normal-approx CI and NOT bootstrap** (arXiv 2503.01747, ICML 2025, refutes CLT/Wald at n<few-hundred
  -- it underestimates uncertainty and is degenerate near rate=0, exactly where a false-uphold rate sits;
  bootstrap also performs poorly there; and Miller 2411.00640, the source justifying "report a CI", is
  itself CLT-based). Use **Clopper-Pearson (exact binomial) or Wilson score**, or a **Beta-Bernoulli
  Bayesian credible interval**, and judge on the **UPPER bound** (worst-case false-uphold). Hard gate =
  the SUBTLE open-book false-uphold DELTA's upper CI bound ~0, with reliable=15 on SUBTLE required for
  PASS. Cost gate = kill Haiku if escalation fraction > 40-50%. Fail either gate -> RAISE TO USER
  (EVAL-03); Sonnet-default ships in the interim. Committed artifact, mechanically enforced
  (skillgrade `--ci --threshold` analog).

### EVAL-05 fairness separation (D-08; CONFIRMED)
- **D-08:** The Haiku voter prompt comes from the dedicated Haiku-prompt research artifact (deliverable 1),
  NOT a Sonnet prompt on `model: haiku`. Haiku and Sonnet run on the IDENTICAL dataset + grader so the
  measured gap is MODEL capability, not prompt quality. The research precedes authoring any Haiku agent.

### Voter agents against the FROZEN Phase-17 schema (D-09; CONFIRMED)
- **D-09:** Two variants vs the frozen vote schema (Phase-17 D-09/D-10): Sonnet baseline (ship default) +
  research-grounded Haiku. Each casts ONE isolated skeptic vote, NO shared context, diversified by the 3
  attack modes (factual contradiction / scope-causality overclaim / source-provenance; `SESSION-DESIGN.md`
  Section 6). Fills the reserved envelope: `attack_mode` (VERIF-01); `disconfirming_query` -- the open-book
  voter searches the NEGATION and RECORDS the query (VERIF-02); source-independence weighting -- N syndicated
  copies of one canonical source count as one (VERIF-03). **Grade outcomes, not steps** (Anthropic +
  SkillsBench, both confirmed): the deterministic gate scores `verdict` vs gold label, never the path.

### Harness location + test discipline (D-10; CONFIRMED)
- **D-10:** Harness + manifest are skill-internal under `skills/lz-deep-research/` (aggregator in
  `scripts/`; committed dataset manifest + vendored-WiCE in `scripts/__fixtures__/` or an `eval/` sibling
  -- planner picks). The fetched non-vendored corpora land in a GITIGNORED cache. Zero-dep. node:test gating
  MUST use the explicit `.test.mjs` FILE form, never `node --test <dir>` (host quirk: dir form spuriously
  exits 1 even when all tests pass).

### Claude's Discretion
- Exact WiCE sampling/stratification recipe and the supported:partially:not ratios within the SUBTLE stratum.
- The interval estimator among Clopper-Pearson / Wilson / Beta-Bernoulli (all valid; pick per implementation).
- Whether the saturation check triggers trap-augmentation, and the trap-generation templates.
- The cross-family adjudication agreement statistic; the `--validate` seed-claim count.
- Fixture/manifest directory (`scripts/__fixtures__/` vs `eval/`); the gitignored cache path name.
- Section ordering of the Haiku-prompt reference artifact; aggregator internal naming.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase definition + acceptance bar
- `.planning/ROADMAP.md` -> "Phase 18" goal + 5 Success Criteria; Phase 19/20 (consumers of the settled tier).
- `.planning/REQUIREMENTS.md` -> VERIF-01/02/03, COST-02, EVAL-01/02/03/04/05 (the 9 requirements closed here).

### Frozen contracts this eval consumes (do NOT re-open)
- `.planning/phases/17-json-schema-verification-contract-reference/17-CONTEXT.md` -> D-09 (frozen vote
  record `verdict: unrefuted|refuted`, seats) + D-10 (reserved voter envelope: `attack_mode`,
  `disconfirming_query`, source-independence -- this phase fills their SEMANTICS).
- `plugins/lz-advisor/references/lz-deep-research-schema.md` -> frozen JSON shapes + tally rubric.
- `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs` + its `.test.mjs`
  -- the off-model aggregator spine + node:test pattern the harness mirrors.

### Converged design + verifier-tier history (the WHY)
- `.planning/research/SESSION-DESIGN.md` Section 6 (3 isolated attack-mode voters) + Section 10 (verifier
  tier); memory `lz-research-deep-research-design` (the PROVISIONAL Sonnet-default / Haiku-provisional /
  false-uphold-sole-gate decision this eval settles).
- `lz-nx-ai-plugins` `MODEL-OPTIMIZATION-HAIKU.md` -- NON-AUTHORITATIVE Haiku-prompt starting point;
  re-verify every detail against current sources (EVAL-05).

### Datasets (existing human-labeled corpora; verified availability + license this session)
- **WiCE** (PRIMARY subtle-overreach spine): `jon-tow/wice` (authoritative; ODC-BY annotations / MIT code);
  EMNLP 2023 (aclanthology 2023.emnlp-main.470 / arXiv 2303.01432); GitHub `ryokamoi/wice`. ~1,260/349/358
  claims -> 3,470/949/958 subclaims. Avoid the `tasksource/wice` mirror's mislabeled license.
- **LLM-AggreFact** (held-out stress, VERBATIM only): `lytang/LLM-AggreFact`; CC-BY-ND-4.0; MiniCheck
  EMNLP 2024 (arXiv 2404.10774); embeds WiCE (de-dup).
- **AVeriTeC** (open-book + leakage-test arm, FETCH-ONLY): `MichSchli/AVeriTeC` + `chenxwh/AVeriTeC`
  (KS mirror); CC-BY-NC-4.0; NeurIPS 2023 (arXiv 2305.13117); use the REVISED 2.0 knowledge store.
- **ExpertQA** (SECONDARY seed): `cmalaviya/expertqa`; MIT; NAACL 2024 (arXiv 2309.07852).
- REJECTED (recorded so they are not re-proposed): VitaminC (`tals/vitaminc`, CC-BY-SA-3.0 data -- easy
  numeric/date flips, off-phenomenon); SciFact (negations); Climate-FEVER / HoVer / FEVEROUS (retrieval axes).

### Eval-methodology primary sources (verified this session)
- Anthropic, *Demystifying evals for AI agents* (anthropic.com/engineering/demystifying-evals-for-ai-agents)
  -- deterministic > LLM-judge; grade outcomes not steps; pass@k vs pass^k definitions; discriminating tasks;
  reference solutions; isolation; read transcripts.
- Anthropic, *Adding Error Bars to Evals* (arXiv 2411.00640) -- report an interval + power analysis +
  multiple samples (but CLT-based; see next).
- **arXiv 2503.01747** (ICML 2025) -- DO NOT use CLT/Wald (or bootstrap) CIs at n<few-hundred; use
  Wilson / Clopper-Pearson / Beta-Bernoulli. The decisive correction to D-07.
- SkillsBench (arXiv 2602.12670) -- deterministic verifiers; oracle 100% pre-flight; 5 trials @ temp 0;
  <10 distinct assertions; isolation; anti-cheating/leakage audit; AI-generated eval data rejected. Local:
  `D:/projects/github/LayZeeDK/lz-application-dev-ai-plugin/research/skillsbench-2602.12670v1/skillsbench-2602.12670v1.md`.
- ClaimCheck (arXiv 2510.01226) + AVerImaTeC (arXiv 2602.11221) -- AVeriTeC temporal-leakage handling
  (revised KS + per-claim date cutoff; parametric channel survives retrieval mitigation).
- OpenAI *eval-skills* (developers.openai.com/blog/eval-skills); FEVER (ACL N18-1074); "Illusion of
  Progress" (arXiv 2508.08285); Trust-or-Escalate (ICLR 2025); skill-creator (installed) + mgechev/skillgrade.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `lz-deep-research-aggregate.mjs` (Phase 16) + fixtures: the deterministic off-model Node aggregator the
  harness mirrors (Pass@1 / Pass^k / false-uphold computed off-model, reproducibly); frozen vote-file layout.
- `scripts/__fixtures__/` immutable per-file layout: reused for the committed manifest + vendored WiCE.
- skill-creator `aggregate_benchmark.py`: reference shape for two-config (baseline vs variant)
  mean/stddev/delta aggregation -- the Sonnet-baseline vs Haiku-variant DELTA the gate needs.

### Established Patterns
- Deterministic off-model aggregation as the spine (the product's core promise): the false-uphold gate
  follows it (verdict-vs-label, not LLM-judge).
- Freeze-from-code + reserved additive envelope: voters fill Phase-17 envelope fields without changing `verdict`.
- node:test via explicit `.test.mjs` file form (host quirk; never the dir form).
- Discriminating-fixture discipline (prior-phase lesson): the SUBTLE stratum MUST discriminate -- hence the
  D-03 saturation check, not just ingest-and-report-accuracy.

### Integration Points
- This eval's OUTCOME sets the model tier for the Phase-19 search/extract workers + the Phase-20 voter default.
- The voter variants authored here are the production verify-voter agents Phase 20 wires in.

</code_context>

<specifics>
## Specific Ideas

- Use EXISTING human-labeled corpora (WiCE primary), not constructed/synthetic claims -- no hand-writing.
- VitaminC is OFF-PHENOMENON for subtle overreach (easy numeric/date flips); WiCE `partially-supported`
  IS the overreach phenomenon. This was the single biggest correction from adversarial verification.
- The gate is a Haiku-minus-Sonnet DELTA on the SUBTLE stratum, upper-CI-bound ~0, exact-binomial interval
  (never Wald/bootstrap), reliable=15 before PASS, pre-registered.
- Open-book uses the REVISED AVeriTeC 2.0 KS + per-claim date cutoff + a closed-book control arm to catch
  parametric memorization; never live web, never domain-exclusion.
- License: vendor only WiCE (ODC-BY/MIT); AVeriTeC fetch-only (CC-BY-NC, KS = hard no-vendor); LLM-AggreFact
  verbatim-only (ND); commit only IDs+labels+pinned-revision+checksums; fetch to a gitignored cache.

</specifics>

<deferred>
## Deferred Ideas

- Ecosystem-representative / larger-N (>100) dataset -- v2 (the high-quality constructed set is the
  "optimistic scenario"; SkillsBench caveat).
- The Phase-19 Haiku search-worker tier -- follows this eval's outcome (the Haiku-prompt research serves it too).
- Production false-uphold monitoring + ~15-20% random audit of Haiku-unanimous upholds -- Phase 20.
- ExpertQA / AVeriTeC-Cherry-picking as additional trap-seed corpora -- pulled in ONLY if the WiCE-based
  SUBTLE stratum saturates (D-03 conditional).

### Reviewed Todos (not folded)
- **Research RTK command suitability for skills and agents** (match ~0.6) -- REVIEWED, NOT folded; concerns
  `rtk` token-savings for the review skills, unrelated to a gating eval. Backlog (as in Phases 16/17).

</deferred>

---

*Phase: 18-haiku-prompt-engineering-deep-research-verify-voter-early-ga*
*Context gathered: 2026-06-16*
