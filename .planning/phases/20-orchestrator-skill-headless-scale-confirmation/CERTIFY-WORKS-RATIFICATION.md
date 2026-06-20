# Certified-WORKS arm-A RATIFICATION -- original cross-family board (amends CERTIFY-WORKS-BOARD-DECISION.md)

**Status:** DECIDED. Original certified-WORKS cross-family board (the D-21 / RE-PLAN-12 board) RESUMED and re-asked.
**Verdict:** UNANIMOUS 4/4 (2 Opus lenses + GPT-5.5 + gemini-3.1-pro-preview); consensus round 1, no further rounds.
**Date:** 2026-06-20 (ratification recorded 2026-06-20T15:46:16Z).
**Authority for:** the ARM-A construction of the live certified-WORKS cert (amends CERTIFY-WORKS-BOARD-DECISION.md section 1/2/3 + D-21). Everything else in CERTIFY-WORKS-BOARD-DECISION.md stands byte-identical.

## Why re-asked (the new facts since the original decision)
1. Building ARM A as minimal-edit contrastive pairs at N>=36 is INFEASIBLE on-distribution (dense-AND-SUPPORTED source claims ~0.33-1/run -- the Stage-0 RAISE shortfall).
2. The human maintainer DECLINES to hand-author the overclaims.
3. Model-authoring INJECTED a measurable lexical artifact: an authored 32-pair seed scored lexical-overlap AUC 0.856 (>> the 0.65 ceiling) -- by-construction pairing produced the very artifact gate (a) exists to prevent.
4. The skill OVER-produces the opposite material: 4 real runs -> 80 survivors = 41 Contested + 20 Low + 19 High -> ~61 refuted-gold candidates on disk; ~15/run as a FREE by-product of the ARM-B harvest.

## THE RATIFIED AMENDMENT: option C SUBSTITUTES for ARM A (full-WORKS-eligible, NOT scoped)

### Q1 (DECISIVE) -- APPROVE C for FULL WORKS (SDT / measurement-validity grounds)
The minimal-pair rule was an INSTRUMENT for two construct-validity properties (no lexical artifact + not-easier-than-controls), NOT the construct itself. Authored minimal-pairs empirically FAILED the gate they were meant to protect (AUC 0.856) -- by-construction pairing INJECTED the artifact. Statistical difficulty-matching of the skill's REAL, on-distribution refuted-gold negatives serves the construct-validity PURPOSE as well or better (removes the authoring artifact + samples the actual negative distribution the skill faces), PROVIDED the construct-validity gates pass on the retained set. Per-item minimal-pair construction is NOT required for full WORKS. External/vetted benchmarks remain SCOPED -- that exclusion is about being OFF-distribution; C is ON-distribution.

### Q2 (CONTESTED-GOLD) -- RETAIN predicate = OOF all-agree "evidence does not entail," gold-blind. SUFFICIENT.
Do NOT restrict to Unsupported-only (truncates the difficulty distribution + removes the boundary cases where false-upholds are most likely). The skill's "Contested" tag is only a SOURCE BUCKET, NEVER gold. Items where the frozen OOF pair does NOT unanimously agree on non-entailment (split / materially ambiguous / dependent on an unstated rating convention) are EXCLUDED from the binary denominator and routed to the human (Guerdan rating-indeterminacy). Unanimous gold-blind OOF IS the indeterminacy filter.

### Q3 (FALLBACK) -- CONFIRMED ordering
C (full-WORKS-eligible) -> external-dataset arm (SCOPED, named, SCREEN-only, never WORKS) -> RAISE (ship strong-default, certify nothing). Descend only when the rung above provably fails its gate.

## AMENDED ARM A (replaces the minimal-edit spec)
- Source: harvest the skill's OWN naturally-occurring Contested/Unsupported claims (~15/run, FREE by-product of the ARM-B harvest). NO authoring by anyone.
- Gold: RETAIN as refuted-gold ONLY those the FROZEN OOF all-agree pair (gpt-5.5 + gemini-3.1-pro-preview, --effort high) confirms gold-blind as "does not entail." Gold = the OOF read, NEVER the skill self-tag.
- Difficulty-match to ARM B's SUPPORTED controls STATISTICALLY via the frozen covariate-overlap + subject-difficulty + cluster-independence guards -- NOT per-item minimal-pair construction.
- N_trap >= 30 (target 36); CP-upper(false-upholds, nTrap) <= TAU_FU 0.10.
- ARM B UNCHANGED: live-harvested SUPPORTED positives, N >= 30, CP-upper(over-refusals, nCtrl) <= TAU_OR 0.15. Arms never pooled.

## AMENDED CONSTRUCT-VALIDITY GATE (the load-bearing change)
- Gate (d) minimal-edit/source_uid is DROPPED (no edits under C).
- Gates (a) lexical-overlap AUC <= 0.65 AND (b) one-sided not-easier difficulty guard are RE-RUN ON THE POST-OOF RETAINED SET, BEFORE vote 1, jointly with the N-freeze. Under C these are the ONLY remaining construct-validity instruments, so they must be applied to the EXACT retained native traps (arm-A refuted cell vs the dense-SUPPORTED arm-B control cell), not assumed. Fail either -> VOID-on-validity -> SCOPED external arm + RAISE.
- ADDITIONALLY REPORT the realized difficulty SMD (Contested-gold vs SUPPORTED controls) alongside the certificate for post-hoc auditability.

## PRE-SPEND LOCKS (freeze before any scored vote) -- all six RATIFIED
(a) cluster key = source-doc/seed WITHIN a run (not run-question; else 4 runs collapse to ~4 traps).
(b) gold = frozen OOF all-agree pair, gold-blind, NEVER the skill self-tag.
(c) covariate-overlap + subject-difficulty + cluster floors AND the (a)+(b) construct-validity gates are load-bearing, NEVER tuned toward N=36.
(d) N_trap frozen the instant the OOF consensus finishes, before vote 1.
(e) arms never pooled; ARM B stays live-harvested SUPPORTED.
(f) post-OOF retained N_trap < 36 -> documented VOID-on-power -> SCOPED external arm + RAISE, never a floor relaxation.

## WORKS definition (amended)
WORKS = pre-registered + OOF-retained gold + the construct-validity gates (a)+(b) pass on the retained set + BOTH CP gates pass; else SCOPED or RAISE. STRONG (Sonnet) certified FIRST; CHEAP (Haiku) a SEPARATE cert on the same frozen corpus/gold/gates with its own frozen prompt + a task-fit pre-gate. Frozen primitives byte-identical (certifyModel / clopperPearsonUpperOneSided / EVAL_THRESHOLDS / the OOF gold pair). Sonnet-default ships regardless (D-01); the Haiku-first flip stays DEFERRED regardless (D-06).

## Provenance
- Pre-discussion verification (this session): a 3-lens Opus panel (alignment / feasibility / decision) converged C-primary, B-SCOPED-fallback, C-needs-ratification (eval/.cache/p20-live/advisor-{alignment,feasibility,decision}.md). The disk feasibility census (61 refuted-gold candidates over 4 runs) is in eval/.cache/p20-live/stage0-nospend.mjs + dump-dense-bundles.mjs.
- The ratification question put to the original board: eval/.cache/p20-live/original-board-question.md.
- This ratification supersedes the minimal-edit ARM-A construction in 20-06 (eval/lz-eval-contrastive-authoring.mjs ARM_A_SEED is now UNUSED for the live cert; gates (a)/(b) in lz-eval-baseline-guard.mjs + lz-eval-difficulty-proxy.mjs are RETAINED + re-run on the native retained set).
