---
phase: 20-orchestrator-skill-headless-scale-confirmation
plan: 05
subsystem: testing
tags: [eval, oof, evidence-join, faithful-cleaning, quote-primary, dedup, blocker-fix, no-spend]

# Dependency graph
requires:
  - phase: 20-05 (PACKAGING / quote-primary evidence packaging)
    provides: the quote-primary evidence join with a bidirectional quote/excerpt containment dedup + the extended faithful front-matter strip
provides:
  - FAITHFUL evidence dedup (single-direction) -- a SUPERSET excerpt (restates the quote PLUS extra factual sentences) is KEPT IN FULL; the excerpt is dropped ONLY when the verified quote already contains the WHOLE cleaned excerpt
  - substantive-sentence loss eliminated -- probe3 drops from 57/108 (53%) to 0/108 (0%); droppedNoEvidence unchanged (0); quote-primary ordering preserved
  - a DISCRIMINATING superset-extra-facts test in BOTH the evidence-join suite and the arm-A suite (fails on the old over-trim, passes on the fix)
  - content-'#' preservation (C#, F#, A#) in stripBibliographicMetadata -- only a markdown HEADING marker at a unit boundary is stripped
affects: [live-cert OOF arm-A native refuted-gold, arm-B verify-voter, Phase 20 live certification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Faithful dedup: drop the SECONDARY excerpt ONLY when the PRIMARY verified quote already contains the WHOLE cleaned excerpt; a superset excerpt (quote + extra facts) is kept in full. Token savings come from the metadata strip, not from discarding superset facts."
    - "Content-'#' preservation: a markdown heading marker is ONLY a '#' run at a UNIT BOUNDARY (^|\\s); a '#' glued to a preceding word char is content (C#/F#/A#) and is preserved."

key-files:
  created: []
  modified:
    - eval/lz-eval-evidence-join.mjs
    - eval/lz-eval-evidence-join.test.mjs
    - eval/lz-eval-armA-native.test.mjs

key-decisions:
  - "BLOCKER fix: the bidirectional containment drop (drop the excerpt when the quote contains it OR vice-versa) OVER-TRIMMED on 53% of candidates -- a SUPERSET excerpt (excerpt contains the quote PLUS extra facts) was dropped to the lean quote alone, LOSING load-bearing facts (CRISPR measured rates, Chinchilla scaling-law, lithium named chemistries). The fix keeps the SUPERSET in full and drops the excerpt ONLY when the quote already contains the WHOLE excerpt (quote-contains-excerpt -- total redundancy). Reviewer fix option #2 (keep both): faithful, accepts a small overlap-token cost. Quote stays first (relevance); never empty (droppedNoEvidence stays 0)."
  - "MAJOR fix: the prior superset guard was INVERTED to pass the over-trim (the quote was lengthened to be the superset; the arm-A excerpt was changed from a superset 'beta led ... before fading' to a distinct sentence). RESTORED the genuine arm-A superset guard ('... before fading on the final lap') and ADDED a discriminating evidence-join test (quote='output doubled in Q3', excerpt='... output doubled in Q3, and margins expanded 400 bps.' -> assert BOTH survive). Both tests FAIL on the old over-trim and PASS on the fix (verified by swapping the guard back)."
  - "MINOR fix: the residual lone-'#' cleanup `\\s*#{1,6}\\s+` matched a glued 'C# ' (the `\\s*` matched zero spaces), corrupting C# -> C. Anchored to `(^|\\s)#{1,6}\\s+` (capture restores the boundary space) so a content '#' is preserved and only a real heading marker is stripped. Latent (the one corpus C# excerpt does not reach an arm-A candidate), but faithfulness-correct for any '#'-bearing corpus."

patterns-established:
  - "Faithful evidence dedup: NEVER drop a substantive sentence. Drop the secondary excerpt only when the primary verified quote wholly subsumes it; keep a superset excerpt's extra facts; keep distinct excerpts. Re-measure with faithfulness-probe3 (must approach 0 substantive sentences dropped)."
  - "Discriminating-test discipline: a dedup/cleaning property test must FAIL on the un-fixed behavior and PASS on the fix; never bend a fixture (lengthen the quote / swap a superset for a distinct sentence) to make a passing test."

metrics:
  duration: "~25 min"
  completed: 2026-06-21
  tasks: 3
  files-changed: 3
---

# Phase 20 Plan 05: Packaging Fix 2 (Faithful Evidence Dedup) Summary

NO-SPEND repair of the evidence-packaging BLOCKER + MAJOR + MINOR a reviewer found in `eval/lz-eval-evidence-join.mjs`: the bidirectional quote/excerpt dedup OVER-TRIMMED (it dropped a superset excerpt and kept only the quote, losing load-bearing facts on 53% of arm-A refuted-gold candidates). The dedup is now FAITHFUL -- a superset excerpt's extra facts are kept while the metadata-strip token savings are retained; the discriminating test that would have caught it was restored + added; the C# over-strip was fixed. Zero model spend; frozen seams untouched.

## What changed

### FIX 1 -- BLOCKER (the dedup, `eval/lz-eval-evidence-join.mjs`)

The bidirectional containment guard `(qKey.includes(eKey) || eKey.includes(qKey))` dropped the excerpt whenever EITHER string contained the other. In the corpus-dominant SUPERSET case (excerpt contains the quote PLUS extra factual sentences -- ~53% of candidates), this dropped the excerpt to the lean quote alone, LOSING the extra facts the OOF entailment turns on (e.g. CRISPR "10% of 200 donors", Chinchilla "scaled equally" / "400 models", lithium "LFP/NCA/NMC").

The fix narrows the drop to a SINGLE direction: drop the excerpt ONLY when the verified quote already contains the WHOLE cleaned excerpt (`qKey.includes(eKey)` -- total redundancy). A superset excerpt (excerpt contains the quote) is now KEPT IN FULL as secondary context; a distinct excerpt is kept; the quote always leads (quote-primary ordering for relevance). The token savings come from the metadata strip (unchanged), NOT from discarding superset facts.

### FIX 2 -- MAJOR (the tests)

- Restored the genuine arm-A superset guard in `lz-eval-armA-native.test.mjs`: the excerpt is again a superset that carries an EXTRA fact (`'Lap log: beta led for three quarters of the race before fading on the final lap.'`), asserting the extra fact ("before fading") survives.
- Replaced the inverted bent test in `lz-eval-evidence-join.test.mjs` with a discriminating test: quote=`'output doubled in Q3'`, excerpt=`'Per the audited filing, output doubled in Q3, and margins expanded 400 bps.'` -> assert BOTH "output doubled in Q3" AND "margins expanded 400 bps" are recoverable from the emitted evidence.
- Both tests were proven to FAIL on the old over-trim behavior (by temporarily swapping the guard back) and PASS on the fix -- they discriminate.

### FIX 3 -- MINOR (`stripBibliographicMetadata` residual cleanup)

The residual lone-'#' cleanup `working.replace(/\s*#{1,6}\s+/g, ' ')` matched a glued `C# ` (the `\s*` matched zero spaces), corrupting "C#" -> "C" (and "F#"). Anchored to `(^|\s)#{1,6}\s+` (capture restores the consumed boundary space) so a content '#' (C#, F#, A#) is PRESERVED and only a real markdown heading marker at a unit boundary (e.g. "## Results") is stripped. Added a C#/F# survival test.

## Verification (NO-SPEND)

- `node eval/.cache/p20-live/faithfulness-probe3.mjs` -> substantive-sentence loss **0/108 (0%)**, down from 57/108 (53%).
- `node eval/.cache/p20-live/strip-csharp-check.mjs` / `strip-edgecases.mjs` -> `C# (23.7%)`, `F#`, `A#`, and `C/C++ ... C# at 23.7% and F#` all survive intact.
- `node eval/.cache/p20-live/superset-fact-check.mjs` -> the reviewer-named superset extra facts (CRISPR "10% of 200 donors", Chinchilla "scaled equally" / "400 models", lithium "LFP") now appear in the joined evidence.
- `node --test eval/lz-eval-evidence-join.test.mjs` -> 22/22, exit 0 (incl. the new discriminating + C# tests).
- `node --test eval/lz-eval-armA-native.test.mjs` -> 26/26, exit 0 (incl. the restored superset guard).
- `node --test eval/lz-eval-harvest.test.mjs` -> 15/15, exit 0.
- `node eval/.cache/p20-live/oof-dryrun.mjs` -> avg evidence chars/candidate = **1290** (up from the over-trimmed 650, since superset facts are now kept; the metadata strip still keeps it near the pre-fix OLD ~1155 rather than the raw 50KB excerpt). droppedNoEvidence 0; EMPTY 0; URL-ONLY 0; avg 2.0 sentences/candidate.

## Avg evidence chars/candidate (re-measured)

The new avg is **1290 chars/candidate** (2.0 sentences). This is INTENTIONALLY higher than the over-trimmed 650: the superset case now keeps the quote PLUS the full excerpt (which restates the quote and carries the extra facts), trading a small overlap-token cost for faithfulness. It is comparable to the pre-fix OLD join (~1155) and far below an unstripped raw-excerpt dump -- the metadata strip is still doing the heavy token reduction. This is the reviewer's "keep both" option (#2): unambiguously faithful for cert validity.

## Deviations from Plan

None beyond the planned three fixes. The dedup design chosen (drop only when the quote wholly contains the excerpt; otherwise keep the excerpt in full as one secondary sentence) is reviewer fix option #2 ("keep both") -- it satisfies probe3 (loss -> 0), all existing tests, and the new discriminating tests with the simplest faithful rule.

## Frozen seams / spend / ASCII

- git diff: only `eval/lz-eval-evidence-join.mjs` + `eval/lz-eval-evidence-join.test.mjs` + `eval/lz-eval-armA-native.test.mjs` changed. The shipped `plugins/` tree is byte-untouched (empty diff). The cross-tree import of ContractError/safeId/listJson is unchanged.
- All three changed files: 0 non-ASCII bytes, no UTF-8 BOM (verified directly + by the in-suite ASCII test).
- ZERO model spend: no LZ_SPEND set, no copilot/voter dispatch, no network fetch (in-suite test asserts the join carries no LZ_SPEND code path / no fetch).
- The `.cache/p20-live/*` probes are gitignored (uncommitted, NO-SPEND, re-runnable).

## Self-Check: PASSED

- `eval/lz-eval-evidence-join.mjs` -- FOUND, single-direction guard present (line 648).
- `eval/lz-eval-evidence-join.test.mjs` -- FOUND, discriminating superset + C# tests present (22 tests).
- `eval/lz-eval-armA-native.test.mjs` -- FOUND, restored superset guard present (26 tests).
- Commit `389990a` -- FOUND in git log.
