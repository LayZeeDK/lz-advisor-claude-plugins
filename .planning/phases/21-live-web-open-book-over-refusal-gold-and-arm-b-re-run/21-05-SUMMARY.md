---
phase: 21-live-web-open-book-over-refusal-gold-and-arm-b-re-run
plan: 05
subsystem: testing
tags: [oof, copilot, clopper-pearson, over-refusal, certification, pre-registration, metered-spend]

# Dependency graph
requires:
  - phase: 21-01
    provides: openbook-rescore.mjs (two-sided re-score + frozen CP gate) + mapAveritecToBinary
  - phase: 21-02
    provides: openbook-retrieval-log.mjs (the frozen snapshot builder) + the meta-source blocklist
  - phase: 21-03
    provides: openbook-oof-gold.mjs (the LZ_SPEND-gated, LZ_SAMPLE-capped OOF gold driver)
  - phase: 21-04
    provides: the frozen openbook-evidence.json (sha256 9faee64a) + the committed 21-OPENBOOK-LOCK-RULE.md
provides:
  - The metered open-book OOF gold (10 SUPPORTED / 20 RESIDUE / 0 NOT-SUPPORTED over the frozen 30)
  - The two-sided re-score + frozen CP verdict (VOID-on-power-RAISE; validN 10 < 24 floor)
  - 21-OPENBOOK-CERT-RESULT.md (the construct-matched certificate + honest 75.30-credit disclosure)
affects: [milestone-close, haiku-first-flip-deferral, future open-book-native control set]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Staged metered spend: bounded pre-flight spike (LZ_SAMPLE cap, applied before dispatch) + a SECOND human GO/NO-GO on a real per-item number, not a blind range"
    - "Resumable evidenceSha cache: spike controls are cache-reused in the full run, never re-billed"

key-files:
  created:
    - .planning/phases/21-.../21-OPENBOOK-CERT-RESULT.md
  modified: []  # all metered-run artifacts land under gitignored eval/.cache/p21-live/ (D-13)

key-decisions:
  - "Staged the only metered spend behind a 2-control pre-flight spike + a second explicit GO/NO-GO; the spike measured 7.86 credits/control, the full N landed at ~2.1/control after batch amortization (75.30 total, vs the ~100-350 estimate)"
  - "Accepted the pre-registered VOID-on-power-RAISE as-output (validN 10 < 24); ONE pass, no optional stopping, TAU never relaxed, denominator never grown/shrunk"
  - "The construct-matched gold is under-powered (20/30 oof-splits), not VOID-on-construct as in Phase 20 -- a distinct, RAISE-worthy finding"

patterns-established:
  - "Construct-matched open-book gold can be under-powered: two strong models split on broader-literature entailment for closed-book-selected controls, starving the binary denominator"

requirements-completed: [OBG-04, OBG-05, OBG-07, OBG-08]

# Metrics
duration: ~45min
completed: 2026-06-22
---

# Phase 21 Plan 05: open-book OOF gold + re-score + certificate Summary

**The construct-matched open-book over-refusal gold was built and judged (the only metered spend, 75.30 AI Credits); it is UNDER-POWERED (10/30 all-agree-SUPPORTED, 20 oof-splits) -> validN 10 < the 24 floor -> VOID-on-power -> RAISE. Sonnet-default ships regardless; the Haiku-first flip stays deferred.**

## Performance
- **Duration:** ~45 min (interactive, two human GO/NO-GO gates)
- **Tasks:** 2 auto tasks + 1 blocking-human checkpoint (all complete)
- **Metered spend:** 75.30 AI Credits (the only Copilot spend of the phase)

## Accomplishments
- **Human-gated, cost-guarded metered spend.** The Plan-04 GO/NO-GO was re-opened with the maintainer; the spend was staged behind a bounded `LZ_SAMPLE=2` pre-flight spike (15.72 credits, 2 controls) and a SECOND explicit GO/NO-GO on the real projection, per the CLAUDE.md metered-out-of-family rule + D-12/D-14.
- **Full-N open-book OOF gold (metered).** The frozen pair (`gpt-5.5` + `gemini-3.1-pro-preview`, `--effort high`) judged gold-blind over the pinned `openbook-evidence.json`: 10 all-agree-ENTAIL (SUPPORTED), 20 oof-split (RESIDUE), 0 all-agree-not-entail. 59.58 credits (8 calls, 8/8 captured; spike controls cache-reused).
- **Two-sided re-score + frozen CP verdict (no spend).** overRefusals=1, validN=10; `cpUpper(1,10)=0.3942` vs `TAU_OR 0.15`; `validN < N_CTRL_FLOOR (24)` -> **VOID-on-power-RAISE**. missed_false_upholds=0 (two-sided guard operative).
- **Certificate written.** `21-OPENBOOK-CERT-RESULT.md`: the verdict, the under-power finding, the PROVISIONAL + D-05 scope limits, the honest 75.30-credit disclosure, and the explicit no-WORKS / Sonnet-ships / Haiku-deferred / arms-never-pooled statements.

## Verdict (pre-registered; one pass)
| Field | Value |
|-------|-------|
| nConfirmed (SUPPORTED) | 10 |
| nResidue (oof-split) | 20 |
| nNotSupported | 0 |
| overRefusals | 1 (`crispr-cas9::cluster47`, genuine-over-refusal) |
| validN | 10 |
| cpUpper vs TAU_OR | 0.3942 vs 0.15 (not load-bearing -- power dominates) |
| disposition | **VOID-on-power-RAISE** (validN 10 < 24) |

## Integrity
- Frozen snapshot sha256 matched the lock-rule pin (`9faee64a...`) before any spend; snapshot NOT re-frozen.
- Frozen primitives byte-identical: `git diff --quiet eval/lz-eval-*.mjs` CLEAN.
- Denominator was the frozen 30 (rescore fails closed on grow/shrink); TAU never relaxed; one pass, no optional stopping.
- All metered-run artifacts under gitignored `eval/.cache/p21-live/` (D-13); only the cert + lock-rule are tracked under `.planning/`.

## Files Created
- `.planning/phases/21-.../21-OPENBOOK-CERT-RESULT.md` -- the construct-matched certificate.

## Gitignored artifacts (on disk, not committed -- D-13)
- `eval/.cache/p21-live/openbook-gold-result.json`, `openbook-gold-credits.json`, `openbook-rescore-result.json`, `openbook-gold-fulln.log`.

## RAISE (future work, not this milestone)
The Phase-20 construct mismatch is fixed, but the construct-matched gold is under-powered on the closed-book-selected 30. A POWERED sensitivity verdict needs an open-book-NATIVE control set (>= 24 open-book all-agree-SUPPORTED by construction). The false-uphold arm stays structurally VOID on-distribution. Sonnet-default ships throughout; the Haiku flip is gated on a powered construct-matched over-refusal metric.
