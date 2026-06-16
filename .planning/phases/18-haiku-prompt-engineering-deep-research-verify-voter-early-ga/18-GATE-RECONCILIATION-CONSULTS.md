---
status: advisory-input
phase: 18-haiku-prompt-engineering-deep-research-verify-voter-early-ga
date: 2026-06-16
feeds: /gsd-discuss-phase re-open of the eval gate definition
advisors: [opus-agent, gpt-5.5 (copilot), gemini-3.1-pro-preview (copilot)]
ai_credits_spent: ~23 (gpt-5.5 7.83 + wasted 7.89 + gemini 2.57 + failed 3.07 + canaries ~2)
deference: Tier-1 (Option-I Sonnet/Haiku approach + eval intent, 3-family-vetted) = HONOR; Tier-2 (D-02..D-07 --auto dataset ops) = RE-OPENABLE
---

# Phase 18 eval gate reconciliation -- advisor consensus + fork

Three advisors (in-family Opus agent + out-of-family GPT-5.5 and Gemini-3.1-pro via Copilot) were
briefed on the contradiction under the re-openable (--auto, low-deference) framing for the Tier-2
dataset decisions, anchored on the Tier-1 vetted intent.

## UNANIMOUS CONSENSUS (all three)

1. **Reject the closed-book amendment (Options b/d). It guts the eval's vetted reason for existing.**
   Closed-book (excerpt-only) tests reading comprehension / local entailment -- NOT the cost-driving
   failure the eval targets: the OPEN-BOOK silent false-uphold (a cheap model retrieves real-world
   docs, hits distractor / syndicated / partial-truth evidence, finds "no clean refutation," and
   upholds an overreach). A closed-book PASS gives ZERO evidence Haiku survives the open-book
   production environment, so it cannot license the Option-I Haiku-first flip. (Opus: closed-book can
   only clear a "guarded interim"; GPT-5.5: "fallback safety check, not decisive"; Gemini: "fatal
   compromise.")
2. **The fix is to BUILD A GENUINE SUBTLE OPEN-BOOK GATE by re-opening the Tier-2 dataset choices,
   not by amending the gate down.** Honor the Tier-1 intent; change the corpus.
3. **Keep D-05's retrieval mechanism (AVeriTeC revised-2.0 KS + per-claim date cutoff).** It is sound
   and is exactly the leakage-safe open-book surface needed. WiCE-subtle becomes a closed-book
   CONTROL arm (reasoning-overreach / parametric-memorization detector), not the gate.
4. **Run zero-credit dataset analyses BEFORE spending any eval credits** (see below). All three flag
   the n=17 statistical-power problem as potentially decisive.
5. **Pre-registration integrity:** re-registering now is legitimate (zero votes). Document the
   "static structural defect / empty stratum" rationale, FREEZE every numeric threshold, lock the
   stratum/construction rules before the first vote. Switching to closed-book, moving thresholds, or
   choosing label mappings after seeing model behavior = result-shopping. Changing the corpus to
   RESCUE the original strict open-book intent is the opposite of result-shopping.

## THE FORK -- how to source subtle OPEN-BOOK claims (advisors split)

### Path A -- native AVeriTeC Conflicting class (Opus)
Use AVeriTeC's "Conflicting Evidence / Cherry-picking" class AS the subtle stratum (REVERSE D-02c),
served open-book against the revised KS with the per-claim date cutoff. Handle the kappa=0.619 noise
with a super-majority annotator-AGREEMENT FILTER (not class exclusion). Labels are AVeriTeC's own,
UNMODIFIED -> no hand-authoring, and license-clean (no derivative of the NC corpus). Minimum code
change (loader gains an AVeriTeC->subtle branch + an agreement filter); aggregator + thresholds
unchanged; the gate name `subtleOpenBookDeltaUpper` finally becomes true. D-03 unaffected (it forbids
trap CONSTRUCTION from AVeriTeC; Path A constructs nothing).

### Path B -- programmatic trap synthesis over the KS (GPT-5.5 AND Gemini, agreeing)
Take ~30-50 unambiguous "Supported" AVeriTeC claims with dense KS evidence, programmatically MUTATE
each into a one-step overreach (correlation->causation, magnitude/scope/certainty inflation, dropped
condition, general->specific population); expected_verdict := refuted; run open-book vs the KS. BOTH
out-of-family models EXPLICITLY REJECT Path A's native Conflicting labels as too noisy (kappa~0.62),
and prefer deterministic injected overreach. Leakage-safe (synthetic claims are not on the live web;
KS is pre-cutoff). Controls N (can synthesize to the power target). This IS the D-03 trap-augmentation
pattern; requires model-assisted construction + script validation + cross-family adjudication.

### My read of the tension (for the discuss-phase to resolve)
- **License:** Path B mutates AVeriTeC (CC-BY-NC) claims -> a NONCOMMERCIAL DERIVATIVE (D-04 concern).
  Path A uses unmodified AVeriTeC claims -> clean. (Opus flagged this; the out-of-family models did
  not address the NC-derivative angle.) If Path B seeds from a permissive corpus instead (WiCE/
  ExpertQA per D-03), the claim and the AVeriTeC KS are topically unrelated -> the KS has no evidence
  about the seed -> retrieval is meaningless. So Path B realistically needs AVeriTeC seeds -> license
  ruling required.
- **N / statistical power (all three):** the gate likely needs N >> 17 subtle claims. Gemini:
  CP(0,17) upper ~= 19.5%; if the gate needs upper < ~5% it is mathematically unreachable at n=17;
  likely N > 60. Path B can synthesize to N; Path A depends on the Conflicting class being large
  enough AT super-majority agreement. The CP `n` semantics (per-claim trials vs pooled claim-trials)
  must be pinned -- it changes whether DELTA_UPPER_MAX=0.25 is even the right ceiling.
- **Validity construction:** Path A's risk = is the Conflicting class labelable at super-majority?
  Path B's risk = are the synthetic traps genuine one-step overreaches, KS-refutable, and not
  accidentally easy/ambiguous (needs human + cross-model validation).

## DATASET ANALYSES TO RUN BEFORE SPENDING CREDITS (the user's "what to analyze")

In priority order (mostly zero-credit / deterministic; these largely DECIDE Path A vs Path B):
1. **Statistical power / N-size + CP-`n` pin (BLOCKING).** Compute the N of subtle claims needed to
   reach the gate's upper-bound ceiling at reliable=15, and define the binomial `n` precisely
   (per-claim vs pooled). If n=17 can't pass, the WiCE-only path is dead regardless.
2. **AVeriTeC Conflicting-class mappability + SIZE at super-majority agreement (BLOCKING for Path A).**
   How many AVeriTeC dev Conflicting/Cherry-picking claims exist, and how many survive an
   agreement filter? Promoted to a blocking pre-build check (Opus): Path A's whole viability rides on
   this.
3. **Trap-synthesis feasibility + license (BLOCKING for Path B).** Can AVeriTeC Supported claims be
   cleanly one-step-mutated AND refuted from the KS (sample 5-10, human-verify)? AND resolve the
   AVeriTeC CC-BY-NC derivative-works question for synthetic claims in an open-source plugin's eval/.
4. **Closed-book saturation on the 17 WiCE subtle.** Do Sonnet AND Haiku both ace them closed-book?
   If so, they are non-discriminating even as a control; DELTA=0 would be vacuous, not safe.
5. **--validate oracle + label cross-check.** Sonnet ~100% on a known-answer seed; if Sonnet
   disagrees with several gold labels, the DELTA is measuring label noise.
6. **WiCE subtle quality audit** (overreach type, is `refuted` fair vs merely `not proven`),
   **overreach-mechanism balance**, **near-duplicate/independence check**.

## Recommendation carried into the discuss-phase (Round 1 -- superseded by the locked consensus below)

All three agree on the DIRECTION (build a real open-book subtle gate; do not amend to closed-book).
The Path A vs Path B choice should be DECIDED BY analyses #1-#3, then locked in the formal
re-deliberation. [Rounds 2-3 resolved this -- see below.]

---

# LOCKED 3-FAMILY CONSENSUS (Rounds 2-3, unanimous ACCEPT)

Process: 3 consultation rounds, executor-driven. R1 split (Opus=Path A; GPT-5.5+Gemini=Path B). R2
crossed over (Opus->B on the agreement-filter-selects-the-easy-tail argument; GPT-5.5+Gemini->A on
the CC-BY-NC license). The USER then RATIFIED the NonCommercial posture (gitignored dev-only). R3:
all three ACCEPT the hybrid below. ~35 Copilot AI Credits spent across rounds.

## The decision

- **GATE = Path B**: a programmatically synthesized subtle-overreach stratum -- dense-evidence
  AVeriTeC "Supported" claims each mutated by EXACTLY ONE overreach step (scope / causation /
  magnitude / certainty) to `expected_verdict: refuted`, voted OPEN-BOOK against the AVeriTeC
  revised-2.0 KS with a per-claim publication-date cutoff. Clean gold-by-construction; controllable N.
- **LICENSE (user-ratified)**: mutating AVeriTeC (CC-BY-NC) claims is accepted PROVIDED the
  derivatives live only in the gitignored `eval/.cache` (never committed/distributed) and the
  committed manifest carries only uids + remapped labels + the mutation RECIPE/seed (method, not NC
  text); local dev-only eval = non-commercial internal research. AVeriTeC-Supported = sanctioned
  PRIMARY seed; ExpertQA (MIT) = optional zero-NC alternative (served open-book vs the AVeriTeC KS as
  a generic distractor store).
- **GENERATOR HYGIENE (Opus refinement)**: synthesize the trap mutations with a model OUTSIDE the
  voter families where feasible (at minimum a different model than the Haiku voter), to avoid an
  asymmetric shared-blind-spot artifact biasing the Haiku-MINUS-Sonnet DELTA; accept a trap only if it
  flips a deliberately-weak reference verifier (D-03) as the family-neutral difficulty anchor.
- **CROSS-CHECK ARM (optional, non-blocking)**: a small super-majority-filtered native AVeriTeC
  Conflicting set, run for ecological validity (synthetic traps not OOD/artificial). Kept if feasibility
  gate (iv) sizes it (>=~10), reported as a qualitative concordance signal, NEVER producing PASS/FAIL;
  dropped silently with a one-line note if the high-agreement count is near zero.
- **GATE STATISTICS**: `n` = POOLED claim-trials (subtle_claims x trials), NOT per-claim. Hard gate =
  ZERO pooled excess Haiku-MINUS-Sonnet false-upholds. Ceiling = `clopperPearsonUpper(1, N_pooled)`
  registered as a FORMULA evaluated at the REALIZED pooled n (~0.05 at N=60-100); the legacy 0.25
  scalar is RETIRED as mathematically incorrect for any n>19. Reliability (`>=15` trials/claim) stays
  a SEPARATE gate. Tightening 0.25 -> ~0.05 is a legitimate, DERIVED, STRICTER pre-vote fix.
- **PASS BUYS**: a legitimate Haiku-first flip-ON (COST-02) -- because the gate now measures the
  production open-book silent-false-uphold mechanism directly -- conditioned on the mandatory
  escalation triggers (contested + load-bearing + ~15-20% audit of Haiku-unanimous upholds) staying
  wired. FAIL on any gate -> RAISE TO USER (EVAL-03); Sonnet-default ships in the interim.

## Feasibility gates BEFORE any reliable=15 spend (in order)

1. **10-claim trap-synthesis validity probe**: accept a trap only if it is a genuine one-step
   overreach a competent judge calls `refuted` AND it flips a deliberately-weak reference verifier;
   need `>=7/10` to proceed with Path B. (This is the A-vs-B settling measurement from R2; B viable.)
2. **Closed-book saturation check** on the synthesized traps: if BOTH Haiku and Sonnet are
   false-uphold-free at k=3 closed-book, the stratum is NON-DISCRIMINATING and a zero-excess DELTA is
   VOID -- regenerate harder mutations (or tighten the weak-verifier bar) before proceeding.
3. **Sonnet `--validate` oracle ~100%** on a known-answer seed.
4. **Native Conflicting count at super-majority agreement** -- sizes the optional cross-check arm.

All require the AVeriTeC fetch (HF token + accepted terms + more of the revised KS than the current
single-zip bound -- the operator's KS-scope point), into the gitignored cache.

## Re-registered lock rule (verbatim, hand to discuss-phase)

> The sole hard gate is the SUBTLE OPEN-BOOK Haiku-MINUS-Sonnet false-uphold DELTA, measured on a
> programmatically synthesized subtle-overreach stratum: dense-evidence AVeriTeC "Supported" claims
> each mutated by exactly one overreach step (scope / causation / magnitude / certainty) to
> `expected_verdict: refuted`, voted OPEN-BOOK against the AVeriTeC revised-2.0 knowledge store with a
> per-claim publication-date cutoff (voter sees only KS docs dated before the claim's annotated date;
> never live web). A false-uphold is the deterministic event `expected_verdict === 'refuted' &&
> verdict === 'unrefuted'`, counted off-model over gold. The binomial n is POOLED over all subtle
> open-book trials (n = subtle_claims x trials), NOT a single claim's trials. The interval is the
> Clopper-Pearson exact-binomial UPPER bound on the pooled Haiku-MINUS-Sonnet excess via the pinned
> jstat (`jStat.beta.inv`), never hand-rolled, never Wald/bootstrap. The PASS ceiling is registered as
> a FORMULA, not a frozen scalar: `DELTA_UPPER_MAX = clopperPearsonUpper(1, N_pooled, ALPHA)`
> evaluated at the REALIZED pooled n -- so ZERO pooled excess PASSES and the FIRST pooled excess FAILS
> (~0.05 at N=60-100; the legacy 0.25 scalar is RETIRED as incorrect for any n>19). PASS requires ALL
> THREE: (1) pooled subtle open-book DELTA upper bound <= the derived ceiling (sole hard gate); (2)
> `escalationFraction < 0.50` (unchanged cost gate); (3) `reliableTrials >= 15` PER CLAIM (separate
> reliability gate). PASS BUYS flipping the OFF-by-default Haiku-first flag ON (COST-02), conditioned
> on the mandatory escalation triggers staying wired. FAIL on any gate -> RAISE TO USER (EVAL-03);
> Sonnet-default ships in the interim. SATURATION PRE-CONDITION (blocking): before any reliable=15
> spend, run the closed-book saturation check; if both models are false-uphold-free at k=3 closed-book,
> the stratum is NON-DISCRIMINATING and a zero-excess DELTA is VOID -- regenerate harder mutations
> first. Trap mutations are generated by a model outside the voter families where feasible and accepted
> only if they flip a deliberately-weak reference verifier (D-03). All numeric gates except the derived
> ceiling are frozen; the ceiling is a deterministic function of the realized pooled n, recorded in the
> run artifact. Legitimate only because zero votes are cast; re-registered before the first model call.

## FEASIBILITY PILOT RESULTS (2026-06-16) -- the consensus assumption was empirically FALSIFIED

Before re-registering/replanning, two cheap pilots tested Path B's premise on 10 Gemini-synthesized
one-step-overreach traps over real AVeriTeC-Supported claims (generator outside the voter families).
Both loader bugs surfaced and were noted: chenxwh/AVeriTeC is a MODEL repo (loader hardcodes
--repo-type dataset) and is UNGATED (loader assumes gated).

- **Probe #1 (trap validity, clean gold evidence):** Opus judged 10/10 traps GENUINE one-step
  overreaches, gold=refuted, subtle -> Path B synthesis WORKS. BUT a Haiku verifier handed the clean
  gold evidence caught 10/10 (0 fooled). Lesson: clean-evidence overreach detection is easy for Haiku;
  the signal cannot live in reasoning-on-clean-evidence.
- **Probe #2 (corrected open-book pilot, noisy top-30 retrieval, Haiku vs Sonnet, 3 attack-mode seats,
  60 votes):** SATURATION. Haiku 0/30 false-upholds, Sonnet 0/30, DELTA=0. Both tiers caught every
  trap even under noisy retrieval (distractors, syndicated dupes).

**Implication (decisive):** the Path B consensus assumption -- that synthesized subtle overreaches
would fool the cheap voter in open-book -- is FALSIFIED for this trap type. The reasoning axis shows
Haiku == Sonnet (full parity, zero deficit). Per the consensus's own SATURATION pre-condition,
both-models-ace => the stratum is NON-DISCRIMINATING => a zero-excess result is VOID, not a PASS.

**The only untested axis is RETRIEVAL ORCHESTRATION** (the voter issuing its OWN disconfirming
searches over the raw KS and possibly retrieving poorly) -- the pilots handed the voters the
retrieval, so they did not test whether Haiku searches worse than Sonnet. Testing it requires
building the search-loop harness (expensive).

Caveats (bias toward catching, i.e. conservative against finding saturation): pilot used top-30 of
the baseline retrieval (no voter-issued search); per-sentence date cutoff (D-05) not enforced. The
0/60 magnitude across BOTH tiers is nonetheless a clear saturation signal for this trap type.

**Where this lands:** an EVAL-03 raise-to-user state, reached cheaply with strong data -- the gate
VOIDs via saturation, so it cannot positively clear Haiku; Sonnet-default ships regardless. The open
choice (recommended to the user + a final 3-family consult): accept Sonnet-default + Haiku-first OFF
on the parity evidence, OR invest in the heavier orchestration harness to attempt a positive Haiku
clearance (low expected payoff given universal parity + the cost-asymmetry that favors Sonnet-default).

## What a replan touches

- 18-03: lock-rule prose (above) + aggregator gate semantics (pooled-n DELTA + the `CP(1,N)` formula
  ceiling; rename `subtleOpenBookDeltaUpper` honestly; retire the 0.25 scalar).
- 18-04: manifest/loader -- add the synthesized subtle-open stratum (AVeriTeC-Supported seeds +
  one-step mutation recipe), the AVeriTeC fetch (more KS), the optional native Conflicting cross-check
  set + agreement filter, ExpertQA-MIT option. Mutated text stays gitignored.
- 18-05: the staged eval RUN (the resumable Workflow harness over nested voter subagents).
