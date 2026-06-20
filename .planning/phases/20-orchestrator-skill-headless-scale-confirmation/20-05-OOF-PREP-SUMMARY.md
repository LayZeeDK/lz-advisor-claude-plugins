---
phase: 20
plan: 20-05-oof-prep
subsystem: live-cert eval harness (arm-A OOF adjudication + shared evidence join)
tags: [eval, oof-prep, no-spend, evidence-cleaning, resumable-cache, arm-a, arm-b, credit-saving]
requires:
  - eval/lz-eval-evidence-join.mjs (joinClusterEvidence -- the shared join the cleaning runs inside)
  - eval/lz-eval-armA-native.mjs (adjudicateNativeRefutedGold -- the non-frozen layer the cache wraps)
  - plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs (ContractError, safeId)
provides:
  - eval/lz-eval-evidence-join.mjs joinClusterEvidence now FAITHFULLY cleans evidence (biblio-strip + quote/excerpt dedup) before emission
  - eval/lz-eval-armA-native.mjs adjudicateNativeRefutedGold now supports an optional resumable cacheDir (OFF by default)
affects:
  - the upcoming human-gated out-of-family (Copilot) OOF RETAIN sessions -- leaner evidence + resumable adjudication cut GitHub AI Credits
  - BOTH arms (arm A + arm B) consume the cleaner evidence via the shared join (counts byte-identical)
tech-stack:
  added: []
  patterns: [faithful-text-cleaning, case-insensitive-pattern-without-i-flag, skip-already-done-resumable-cache, uid-to-filename-sanitize, merge-cached-plus-fresh]
key-files:
  created:
    - .planning/phases/20-orchestrator-skill-headless-scale-confirmation/20-05-OOF-PREP-SUMMARY.md
  modified:
    - eval/lz-eval-evidence-join.mjs
    - eval/lz-eval-evidence-join.test.mjs
    - eval/lz-eval-armA-native.mjs
    - eval/lz-eval-armA-native.test.mjs
decisions:
  - Cleaning runs INSIDE the shared joinClusterEvidence (before any scored vote / freeze) so it is pre-registration-clean and applies to BOTH arms with one change.
  - Faithfulness is paramount: the cleaner removes ONLY metadata segments + normalizes whitespace; it never fabricates / paraphrases / removes a substantive factual sentence; the verbatim worker quote is never cleaned (it is the safety fallback).
  - Marker matching is case-insensitive WITHOUT the /i flag (built via an explicit [Aa]-class pattern) so the value-terminator [a-z]/[A-Z] classes stay case-SENSITIVE -- an author initial "Y." must not trip the sentence boundary.
  - The resumable cache lives at the NON-FROZEN adjudicateNativeRefutedGold layer (the frozen makeBatchedOofProbe.prepare is untouched); it mirrors the FROZEN persistDualRunVote / persistVote skip-already-done resumability (D-08).
  - The cache is OFF by default (cacheDir undefined) so existing tests + the current behavior are byte-identical; the cache changes nothing DECIDED -- only re-dispatch (re-pay) avoidance.
metrics:
  duration: ~50 min
  completed: 2026-06-20
  tests_added: 11 (6 evidence-cleaning + 5 resumable-cache)
  files_created: 1 (this SUMMARY; eval/.cache verdicts are gitignored runtime output)
  files_modified: 4
  evidence_chars_before: 155551
  evidence_chars_after: 135106
  evidence_chars_reduction_pct: 13.1
  avg_chars_per_candidate_before: 1329
  avg_chars_per_candidate_after: 1155
---

# Phase 20 Plan 20-05: OOF-PREP (Evidence Cleaning + Resumable Cache) Summary

NO-SPEND preparation that makes the upcoming out-of-family (Copilot) OOF RETAIN sessions cheaper and resumable for the live-cert arm-A path: a FAITHFUL evidence-cleaning pass strips bibliographic header noise + dedups the quote-vs-excerpt overlap (fewer tokens per candidate), and a resumable per-candidate verdict cache means a usage-limit interruption never re-pays for an already-adjudicated candidate. Both changes are at NON-FROZEN layers; every frozen seam is byte-identical and every test is a zero-spend deterministic stub.

## What was built

### Change 1 -- Faithful evidence cleaning (in the shared join)

`eval/lz-eval-evidence-join.mjs` `joinClusterEvidence` now cleans each evidence sentence BEFORE it is emitted (new `stripBibliographicMetadata` + `containmentKey` helpers, applied inside the matched-claim collection loop). Because the join is shared, the cleaning applies to BOTH arms (arm A `lz-eval-armA-native.mjs` candidates AND arm B `lz-eval-harvest.mjs` surfaced evidence). Counts are byte-identical; only the evidence TEXT gets leaner.

### Change 2 -- Resumable OOF verdict cache (non-frozen adjudication layer)

`eval/lz-eval-armA-native.mjs` `adjudicateNativeRefutedGold` now takes an optional `cacheDir`. When set: BEFORE dispatching it loads any persisted per-candidate verdict and passes ONLY the un-cached candidates to `probe.prepare()` (the spend boundary); AFTER dispatch it persists each newly-resolved verdict (skip-already-done); the final retained/residue/excluded sets are computed by MERGING cached + fresh verdicts over the FULL candidate set. The frozen `makeBatchedOofProbe.prepare` is untouched.

## THE CLEANING RULE (pre-registration-relevant)

The evidence the OOF judges is the CLEANED substantive text. No substantive content is removed -- the cleaning is faithful by construction. Precise rule, applied to each excerpt passage (the verbatim worker quote is NEVER cleaned -- it is factual, not a header):

1. **Leading markdown heading** `# <doc title>`: when a bibliographic marker follows it, drop from the leading `#` up to the first marker; when no marker follows, drop only the `#`+spaces formatting token (keep the heading TEXT -- it may be a real sentence).
2. **Leading `--- SECTION ---` separator block**: when the span before the first `---` carries a bibliographic marker, drop the leading separator block (e.g. `--- ABSTRACT (from <url>) ---`) and keep the factual body verbatim. Only the LEADING block is a boundary, so a `---` inside prose is never a cut point.
3. **`<Marker>: <value>` runs**: strip each marker run where Marker is one of `Source URL` / `Source` / `Title` / `Authors` / `Author` / `Published` / `Submission Date` / `Submitted` / `Updated` / `Fetched` / `arXiv identifier` / `DOI` (case-insensitive). A marker value extends from the marker UP TO the earliest of: (i) the next marker, (ii) a sentence boundary `[.?!]` after a LOWERCASE letter followed by a real capitalized word (so an initial like `Y. Zhang` does NOT terminate an Authors value), (iii) a 4-digit-year boundary then a capitalized word (so `Submitted: April 19, 2024 AOT-compiled Wasm ...` terminates after the year), (iv) a markdown section `## ...` / a `---` separator, or (v) end of string.
4. **Bare-URL-only residue**: if after metadata removal the whole remaining text is a single `http(s)` URL, drop it (never emit a URL). A URL embedded mid-sentence is left intact.
5. **Faithfulness guard**: markers match only at a `<Marker>:` boundary, so a factual sentence that merely contains the WORD "source"/"title" mid-sentence is kept verbatim.

**Quote-vs-excerpt dedup**: if the verbatim quote text is a substring of the cleaned excerpt text (or vice versa) under a case/whitespace-insensitive containment check, only the LONGER substantive one is emitted (do not send both when one contains the other).

**Safety**: if cleaning would make a candidate's evidence EMPTY (the excerpt was only metadata), the verbatim quote is the fallback. Cleaning NEVER empties a candidate that had real evidence -- `droppedNoEvidence` cannot increase due to cleaning (verified on the real corpus: it stayed 0).

A subtle implementation note worth recording: the marker alternation is built case-insensitively via an explicit `[Aa]`-class pattern (`caseInsensitivePattern`) rather than the regex `/i` flag, because under `/i` the value-terminator `[a-z]`/`[A-Z]` classes would ALSO match the opposite case -- and that made an author initial `Y.` falsely trip the sentence boundary, splitting "Authors: Y. Zhang, M. Liu" into a leaked "Zhang, M. Liu". Dropping `/i` from the value-stripping regex (while keeping the markers case-insensitive) fixed it.

## Token reduction measured (no-spend live re-measure)

`node eval/.cache/p20-live/oof-dryrun.mjs` over the 117 real arm-A candidates:

| Metric | Before (pre-clean) | After (cleaned) | Reduction |
|--------|--------------------|-----------------|-----------|
| Total evidence chars (all candidates) | 155551 | 135106 | 20445 chars (13.1%) |
| Avg evidence chars / candidate | 1329 | 1155 | 174 chars (13.1%) |
| Avg evidence sentences / candidate | 2.0 | 1.5 | quote/excerpt dedup |
| `droppedNoEvidence` | 0 | 0 | unchanged (safety holds) |
| packets EMPTY / URL-only | 0 / 0 | 0 / 0 | unchanged |

Copilot pays per token AND per session, and the OOF round dispatches each packet to TWO models, so the ~20k-char (~5k-token) evidence reduction roughly halves into ~10k tokens saved across the round on evidence alone (before claims + framing).

## The resumable cache, end-to-end (no-spend, real corpus)

A no-spend end-to-end check ran the cache over all 117 real arm-A candidates with a deterministic stub callModel (NO Copilot, NO LZ_SPEND):

- Run 1: `dispatched=117 cacheHits=0 retained=117` (30 batched stub calls); 117 `:`-free verdict JSONs persisted.
- Run 2 (same candidates, cache present, FRESH stub): `dispatched=0 cacheHits=117 retained=117` with **0** stub calls -- ZERO new dispatch -> never re-pays. Same retained set as Run 1.

At spend time the orchestrator passes `cacheDir = eval/.cache/p20-live/oof-verdicts/` (under the gitignored `eval/.cache/`). A re-run after a usage-limit interruption re-loads the cache and dispatches only the still-un-adjudicated candidates.

## How the frozen seams stayed untouched

`adjudicateNativeRefutedGold` composes `makeBatchedOofProbe` / `runProbeConsensus` / `makeOofAdjudicator` / `FROZEN_OOF_PAIR` BYTE-IDENTICAL -- the cache wraps the dispatch decision (which candidates reach `probe.prepare`) and the merge (cached + fresh verdicts), not the probe internals. `git diff` confirms no change to `lz-eval-oof-batch.mjs`, `lz-eval-trap-assembler.mjs`, `lz-eval-live-cert.mjs`, `lz-eval-baseline-guard.mjs`, `lz-eval-difficulty-proxy.mjs`, or `lz-eval-mcc.mjs`. The verdict record persisted is the SAME verdict the probe would produce; the cache changes nothing about WHAT the all-agree consensus decides, only whether an already-decided candidate is re-dispatched.

## Tests (FILE-form, ZERO spend, deterministic stubs)

Host quirk honored: `node --test eval/<file>.test.mjs` (the explicit FILE form; the directory form spuriously exits 1 on this host).

Evidence cleaning (`lz-eval-evidence-join.test.mjs`, +6, now 15 total):
- strips a `Source:/Title:/Authors:/Published:` header, keeps the factual sentence;
- strips a leading `# <title>` heading + its bibliographic block, keeps the factual sentence;
- dedups a quote that is a substring of the excerpt -> ONE longer sentence;
- dedups the other direction (excerpt substring of quote) -> ONE longer sentence;
- SAFE: a metadata-only excerpt falls back to the verbatim quote (never empty, not dropped);
- FAITHFUL: a sentence that merely mentions "source"/"title" mid-sentence is kept verbatim.

Resumable cache (`lz-eval-armA-native.test.mjs`, +5, now 26 total):
- a cacheDir PERSISTS one `:`-free verdict JSON per candidate uid;
- a full RE-RUN from cache dispatches ZERO new probe calls (asserts the stub callModel is NOT invoked) and returns the SAME retained/residue;
- a PARTIAL cache dispatches ONLY the uncached candidate(s);
- a RESIDUE (split) verdict is cached too -> a re-run reproduces the same exclusion without re-dispatch;
- OFF by default (no cacheDir) -> nothing persisted, all candidates dispatched.

Full dependent suite green (all FILE-form, 0 failures): evidence-join 15, armA-native 26, harvest 15, live-cert 27, oof-batch 11, trap-assembler 34, baseline-guard 10, difficulty-proxy 8, prescale-probe 8.

## Deviations from Plan

None of the Rule-4 (architectural) kind. One Rule-3 (blocking) detail was resolved inline during implementation: the first cut of the metadata cleaner used a single `/i`-flagged regex, which made the value-terminator character classes case-insensitive and leaked author initials (`Authors: Y. Zhang, M. Liu` -> "Zhang, M. Liu") and dropped a trailing factual sentence. Fixed by building the marker alternation case-insensitively WITHOUT the `/i` flag (`caseInsensitivePattern`) so the terminator classes stay case-sensitive, and by adding a 4-digit-year value-terminator for date-valued markers (`Submitted:`/`Published:`/etc.) that abut prose with no punctuation. The fix is fully covered by the cleaning tests (the markdown-heading + biblio-header tests would fail without it). No scope expansion.

## Known Stubs

None. The two changes ship behind real tests; the only deterministic stubs are the test-injected callModels (zero spend by design, exactly as the plan mandates). The resumable cache is OFF by default and the real OOF transport remains hard-guarded behind `requireSpend('callOof')`.

## Self-Check: PASSED

- `eval/lz-eval-evidence-join.mjs` modified (stripBibliographicMetadata present): FOUND
- `eval/lz-eval-armA-native.mjs` modified (cacheDir / adjudicateNativeRefutedGold resumable): FOUND
- `eval/lz-eval-evidence-join.test.mjs` +6 cleaning tests: FOUND
- `eval/lz-eval-armA-native.test.mjs` +5 cache tests: FOUND
- commit a76512e (Change 1, evidence cleaning): FOUND
- commit 4da001f (Change 2, resumable cache): FOUND
- frozen seams byte-identical (oof-batch / trap-assembler / live-cert / baseline-guard / difficulty-proxy / mcc): VERIFIED via git diff (no changes)
- droppedNoEvidence unchanged at 0; token reduction 155551 -> 135106 (13.1%): MEASURED
