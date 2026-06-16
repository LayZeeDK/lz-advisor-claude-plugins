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

## Recommendation carried into the discuss-phase

All three agree on the DIRECTION (build a real open-book subtle gate; do not amend to closed-book).
The Path A vs Path B choice should be DECIDED BY analyses #1-#3, then locked in the formal
re-deliberation: run the zero-credit analyses first; if the AVeriTeC Conflicting class is large
enough at super-majority agreement, prefer Path A (license-clean, minimum change, no synthesis); if
not (too small/noisy), take Path B pending the CC-BY-NC derivative ruling, seeding from AVeriTeC
Supported claims. Keep WiCE-subtle as the closed-book control either way. Re-register the lock rule
(stratum, construction rules, CP-`n`, what PASS buys) with thresholds frozen, before any vote.
