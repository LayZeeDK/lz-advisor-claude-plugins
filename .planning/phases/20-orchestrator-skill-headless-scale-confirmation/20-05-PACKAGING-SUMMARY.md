---
phase: 20-orchestrator-skill-headless-scale-confirmation
plan: 05
subsystem: testing
tags: [eval, oof, evidence-join, faithful-cleaning, quote-primary, token-reduction, no-spend]

# Dependency graph
requires:
  - phase: 20-05 (OOF-PREP / evidence-text join)
    provides: the shared cluster->claims->excerpts evidence-text join (joinClusterEvidence) + the first faithful bibliographic-metadata strip (Source/Title/Authors/Published/Submitted/Updated/DOI)
provides:
  - QUOTE-PRIMARY evidence packaging (the verified worker quote is the FIRST evidence sentence, always)
  - extended faithful front-matter strip (Status:/venue+acceptance lines/markdown section headings #/##/###/Submission Date:/DOI:/arXiv:/Category:/Subject Areas:/Article Identifier:/--- SECTION --- separator blocks)
  - a LINE-PASS that removes whole-line headings + markers on the RAW excerpt before collapse (faithful, deterministic)
  - bidirectional quote/excerpt containment dedup -> ~44% per-candidate evidence token reduction (650 vs 1171 chars), droppedNoEvidence unchanged (0)
affects: [live-cert OOF arm-A native refuted-gold, arm-B verify-voter, Phase 20 live certification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Line-pass-before-collapse: strip whole-line markdown headings + bibliographic markers on RAW text (unambiguous whole lines), THEN ASCII-collapse; segment passes catch any header/heading already collapsed inline."
    - "Quote-primary evidence: the verified, load-bearing snippet leads; the excerpt is secondary context kept ONLY when it adds content beyond the quote (bidirectional containment dedup)."

key-files:
  created: []
  modified:
    - eval/lz-eval-evidence-join.mjs
    - eval/lz-eval-evidence-join.test.mjs
    - eval/lz-eval-armA-native.test.mjs

key-decisions:
  - "Quote-primary: the verbatim worker quote is ALWAYS the first evidence sentence (the claim's direct, verified support); the excerpt is secondary."
  - "Bidirectional containment dedup (drop the excerpt when the quote contains it OR vice-versa) is the token-reduction lever -- the verified quote replaces the bulkier superset excerpt that merely restates it. Faithful: the load-bearing fact is the quote, always kept; only a containment-redundant excerpt is dropped, never a DISTINCT substantive passage."
  - "Line-pass on RAW (newline-bearing) excerpt text is the faithful way to remove whole-line ## section headings (568 across the corpus); a heading is unambiguous as a whole line, ambiguous once collapsed."
  - "Marker set extends bibliographic-only labels (Status/Category/Subject Areas/Article Identifier/arXiv/Journal/Publication/Fetched from); content labels used as factual-sentence prefixes (Key Finding:/Clinical Efficacy:/Mechanisms of Action:) are DELIBERATELY EXCLUDED so a factual line is never eaten."

patterns-established:
  - "Faithful front-matter strip: remove ONLY metadata lines/segments + structural section labels + normalize whitespace; never fabricate, paraphrase, or drop a substantive factual sentence; markers matched ONLY at a unit boundary (line start / leading segment / after a prior marker) so a mid-sentence 'status'/'category'/'source' word is never removed; case-INSENSITIVE marker match WITHOUT /i so the value-terminator [a-z]/[A-Z] classes stay case-sensitive (an author initial 'Y.' never trips a boundary)."

requirements-completed: []

# Metrics
duration: 95min
completed: 2026-06-21
---

# Phase 20 Plan 05: OOF Evidence Packaging (Quote-Primary + Front-Matter Strip) Summary

**Quote-primary OOF evidence with an extended faithful front-matter strip (Status/venue/section-headings/DOI/arXiv/separator blocks): a ~44% per-candidate token reduction (650 vs 1171 chars), every packet now LEADS with the verified quote instead of bibliographic noise, droppedNoEvidence unchanged at 0, ZERO model spend.**

## Performance

- **Duration:** ~95 min
- **Tasks:** 1 (evidence-packaging improvement, in the shared join used by both arms)
- **Files modified:** 3 (1 production module + 2 test files)

## Accomplishments

- **Quote-primary evidence:** the matched worker's verbatim `quote` (the verified snippet the claim was extracted from) is now ALWAYS the FIRST evidence sentence. Confirmed in the live corpus dry-run: sample packets now lead with `23.6% import security-related APIs (file access, execution), and 8 confirmed cryptominer malware instances` and `11% faster than Linux execution by ahead-of-time compiling` -- NOT `Status:` / `## Abstract` / `Category:` / `--- ABSTRACT ---`.
- **Extended faithful front-matter strip:** added `Status:` lines, venue/acceptance lines (`Accepted by/at ...`, `To appear in ...`, `Published in ...`), markdown SECTION headings (any `#`/`##`/`###` line, e.g. `## Abstract`, `## Key Overview`, `## Introduction`, `## Conclusion`), `Submission Date:`, `DOI:`, `arXiv:` id lines, plus `Category:` / `Subject Areas:` / `Article Identifier:` / `Journal:` / `Publication:` / `Fetched from:`, and `--- SECTION LABEL ---` rule-separator blocks. All faithful: substantive factual sentences kept verbatim.
- **Line-pass architecture:** the excerpt is now read RAW (newlines preserved) so a whole-line heading / marker is removed unambiguously BEFORE the whitespace collapse; the segment passes still catch any header/heading already collapsed inline (the single-line case). This faithfully strips the 568 section headings that litter the curated corpus.
- **Token reduction:** ~44% per candidate (650 vs the prior 1171/1155 chars; total 70214 vs 126517 chars). The reduction comes from (a) front-matter noise removal and (b) bidirectional quote/excerpt dedup -- when the excerpt merely restates the verified quote wrapped in vaguer prose, the lean quote replaces it.
- **Faithfulness preserved:** `droppedNoEvidence` is byte-identical at 0 (a metadata-only excerpt falls back to the verbatim quote; a candidate is dropped only when it has neither a quote nor any distinct substantive excerpt). Zero EMPTY-evidence packets, zero URL-only packets.
- **Both arms:** the change lives in the shared `joinClusterEvidence`, so arm-A native (lz-eval-armA-native.mjs) and arm-B controls (lz-eval-harvest.mjs) both get leaner, quote-first evidence with byte-identical candidate counts (108 arm-A candidates, unchanged).

## Re-measurement (NO-SPEND dry-run)

`node eval/.cache/p20-live/oof-dryrun.mjs` (corpus `.lz-research/`, no LZ_SPEND, no dispatch):

| Metric | OLD (pre-change) | NEW (this plan) |
|--------|------------------|-----------------|
| arm-A candidates | 108 | 108 (byte-identical) |
| droppedNoEvidence | 0 | 0 (unchanged) |
| EMPTY-evidence packets | 0 | 0 |
| URL-only packets | 0 | 0 |
| avg evidence sentences/candidate | 1.5 | 1.4 |
| **avg evidence chars/candidate** | **1171** (prior reported 1155) | **650** |
| total evidence chars | 126517 | 70214 |

Per-candidate char delta: **-521 (~-44%)**. The OLD-vs-NEW per-candidate comparison (`eval/.cache/p20-live/strip-reduction.mjs`, importing both the git-HEAD join and the new join over the SAME run-dir/cluster pairs) confirms `candidates the NEW join DROPS but OLD kept: 0` -> droppedNoEvidence cannot increase.

Sample packet (cluster28) now leads with the verified quote:
- `EV[0]: 11% faster than Linux execution by ahead-of-time compiling`  (the verbatim quote)
- `EV[1]: This comprehensive survey examines WebAssembly (Wasm) runtimes across 98 research articles. ...`  (distinct factual context, front-matter stripped)

## Files Modified

- `eval/lz-eval-evidence-join.mjs` -- (1) extended `BIBLIO_MARKERS` (added Status / Category / Subject Areas / Journal / Publication / Article Identifier / arXiv / Fetched from); (2) new `stripHeadingAndMarkerLines` LINE PASS (whole-line headings + markers on RAW text); (3) `readExcerptText` now returns RAW (newline-bearing) text bounded to `EXCERPT_RAW_READ_CAP`, with the final `EXCERPT_CHAR_CAP` applied AFTER cleaning by the join; (4) `stripBibliographicMetadata` extended: section-separator blocks (a2, unconditional), venue/acceptance segments (b2), inline section-heading runs (a3), residual heading tokens; (5) the emit loop is QUOTE-PRIMARY with bidirectional containment dedup.
- `eval/lz-eval-evidence-join.test.mjs` -- 20 tests (was 15): new OOF-PREP coverage (multi-line corpus shape Status/venue/##-heading strip; collapsed single-line inline strip; front-matter-only -> quote fallback; status/category mid-sentence faithfulness); the quote-primary + bidirectional-dedup contract; the EXACT/leading-`#`/Source-Title tests redesigned so the verified quote carries the load-bearing fact and the excerpt provides DISTINCT secondary context.
- `eval/lz-eval-armA-native.test.mjs` -- the EXACT-match join test redesigned to the quote-first + distinct-excerpt contract (the superset-excerpt form is now correctly deduped).

## Task Commits

1. **OOF evidence packaging: quote-primary + extended front-matter strip + bidirectional dedup** - `<hash>` (feat)

**Plan metadata:** `<hash>` (docs: SUMMARY + STATE/ROADMAP)

## Deviations from Plan

### Auto-resolved design decision (within the objective)

**1. [Rule 1/2 - faithful dedup direction] Bidirectional containment dedup chosen as the token-reduction lever**
- **Found during:** re-measurement -- a quote-first + always-keep-the-superset-excerpt reading produced a token INCREASE (+119 chars), failing the stated token-reduction goal, because the quote (a snippet OF its excerpt) was restated.
- **Resolution:** the objective's dedup rule ("include the excerpt ONLY if it adds content beyond the quote; drop if the quote already contains it OR vice-versa") is BIDIRECTIONAL. Implemented as: drop the excerpt when either string contains the other; emit it only when NEITHER does (genuinely distinct context). This yields the ~44% reduction while keeping the verified quote (the load-bearing fact) always present -> faithful (droppedNoEvidence unchanged).
- **Test impact:** several pre-existing tests put the factual sentence INSIDE the excerpt with a short quote (the superset form); under the bidirectional rule the redundant superset excerpt is deduped. Those tests were redesigned so the verified quote carries the load-bearing fact and the excerpt supplies DISTINCT secondary context -- which matches the real corpus (the quote is the precise verified snippet; the superset excerpt is vaguer surrounding prose).
- **Files modified:** eval/lz-eval-evidence-join.mjs, eval/lz-eval-evidence-join.test.mjs, eval/lz-eval-armA-native.test.mjs

## Constraints honored

- **ZERO model spend:** no `LZ_SPEND`, no `fetch`, no copilot/voter/probe dispatch; the join is a pure on-disk function. The dry-run + per-candidate measurement scripts live in the gitignored `eval/.cache/p20-live/` and dispatch nothing.
- **Frozen seams untouched:** `eval/lz-eval-live-cert.mjs` (blob `de71ec4b`) and `eval/lz-eval-oof-batch.mjs` (blob `bed7800a`) are byte-identical (verified via `git ls-files -s` + empty `git diff`). makeBatchedOofProbe / renderItem / runProbeConsensus / makeCopilotCallModel / the gold pair are not in the modified files.
- **ASCII-only, no BOM:** all three modified files verified ASCII-clean (a test in the suite also asserts the production module is strictly ASCII + carries no LZ_SPEND/fetch).
- **FILE-form tests (host quirk):** `node --test <file>` form used throughout (the directory form spuriously exits 1 on this host).
- **Staged by name:** files staged individually (never `git add .`).

## Test Results (FILE-form, all exit 0)

- `node --test eval/lz-eval-evidence-join.test.mjs` -> tests 20, pass 20, fail 0
- `node --test eval/lz-eval-armA-native.test.mjs` -> tests 26, pass 26, fail 0
- `node --test eval/lz-eval-harvest.test.mjs` -> tests 15, pass 15, fail 0
- `node --test eval/lz-eval-packaging-boundary.test.mjs` -> tests 2, pass 2, fail 0 (eval/plugin tree boundary intact)
