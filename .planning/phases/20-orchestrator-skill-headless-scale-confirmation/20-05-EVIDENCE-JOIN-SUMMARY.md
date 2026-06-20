---
phase: 20
plan: 20-05-evidence-join
subsystem: live-cert eval harness
tags: [eval, evidence-join, arm-a, arm-b, no-spend, blocking-bug]
requires:
  - eval/lz-eval-harvest.mjs (readRunDirClaims, listRunDirs, isSupportedClaim)
  - eval/lz-eval-readjson.mjs (readJson)
  - plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs (ContractError, safeId, listJson)
provides:
  - eval/lz-eval-evidence-join.mjs (joinClusterEvidence, resetEvidenceJoinCache, EXCERPT_CHAR_CAP, EVIDENCE_OVERLAP_JACCARD)
  - eval/lz-eval-armA-native.mjs harvestRefutedGoldCandidates now joins evidence TEXT + reports droppedNoEvidence
  - eval/lz-eval-harvest.mjs arm-B members carry additive evidence TEXT field
affects:
  - the human-gated Plan 20-05 OOF adjudication + Stage-2 verify-voting (they now judge against TEXT, not URLs)
tech-stack:
  added: []
  patterns: [shared-module-to-break-import-cycle, per-runDir-cache, exact-then-overlap-match, fail-closed-reads, ascii-safe-cap]
key-files:
  created:
    - eval/lz-eval-evidence-join.mjs
    - eval/lz-eval-evidence-join.test.mjs
  modified:
    - eval/lz-eval-armA-native.mjs
    - eval/lz-eval-armA-native.test.mjs
    - eval/lz-eval-harvest.mjs
    - eval/lz-eval-harvest.test.mjs
decisions:
  - Extracted the join into eval/lz-eval-evidence-join.mjs (its own module) to avoid a require cycle (arm A already imports the run-dir reader from arm B).
  - Match policy: EXACT normalized-text first (100% of the curated corpus), then a token-Jaccard >= 0.6 overlap fallback (the same under-merge Jaccard the aggregator uses for corroboration, D-07).
  - Per-excerpt passage cap = 1200 chars (the verbatim worker quote is emitted IN FULL separately so the cap never loses the decisive sentence).
  - Arm B keeps counts byte-identical: a no-match member carries evidence:[] (NEVER dropped); arm A DROPS a no-match candidate (it must not enter the cert with no evidence).
metrics:
  duration: ~12 min
  completed: 2026-06-20
  tests_added: 16 (5 arm-A + 2 arm-B + 9 join-module)
  files_created: 2
  files_modified: 4
---

# Phase 20 Plan 20-05: Live-Cert Evidence-Text Join Summary

NO-SPEND correctness fix that JOINs each harvested live-cert member to its REAL stored evidence TEXT (cluster -> claims -> excerpts) so the out-of-family entailment adjudication and the Stage-2 verify-voting judge against actual passage/quote text instead of bare URLs.

## What was built

The blocking bug: harvested refuted-gold members (arm A) and over-refusal control members (arm B) carried only the survivor cluster's SOURCE URLs as "evidence". The OOF probe and the Stage-2 voter ask "does this EVIDENCE entail the CLAIM?" -- a bare URL is not adjudicable, so the entire live cert would have judged against URLs.

The fix reconstructs evidence from the on-disk run dir:
- `survivors.json` cluster `{ claim, sources:[url...] }` -> the URL `sources` SCOPE the join only.
- `claims/<worker>.json` `{ source, claims:[{ id, text, quote, excerpt_id }] }` -> select worker claims whose `source` is in the cluster's sources AND whose `text` matches the cluster `claim` (EXACT first; else token-Jaccard >= 0.6 overlap).
- `excerpts/<excerpt_id>.txt` -> the fetched passage TEXT.

`joinClusterEvidence(runDir, cluster)` returns `{ evidence: [{ sentence: <text> }], matched, reason }`:
- the matched worker `quote` (verbatim snippet, in full) PLUS the referenced excerpt passage (ASCII-cleaned, capped at 1200 chars), de-duplicated;
- `matched:false` + an empty evidence array + a reason when no worker claim matches (no recoverable text).

### Arm A (`eval/lz-eval-armA-native.mjs`)
`harvestRefutedGoldCandidates` now sets `evidence: joinClusterEvidence(dir, rec).evidence` (the real text) and DROPS candidates whose evidence text could not be recovered, reporting `droppedNoEvidence` (count) + `dropped[]` (`{ uid, reason }`). The candidate shape is otherwise unchanged (uid, claim_id, source_id, claim, corroboration_lower_bound, source_run_dir, source_cluster, confidence).

### Arm B (`eval/lz-eval-harvest.mjs`)
The surfaced over-refusal control + dense-trap members now carry an ADDITIVE `evidence` field of `{ sentence }` objects via the same helper. `nCtrl`/`nTrap` counting and the two-arms-never-pooled discipline are byte-identical (regression-asserted): a no-match member carries `evidence:[]` and is NEVER dropped, so the selection/stratification/counts are unperturbed. The internal `__runDir` threading is stripped from the surfaced member.

### Shared module (`eval/lz-eval-evidence-join.mjs`)
The join was extracted into its own module so BOTH arms import it WITHOUT a cycle (arm A already imports the run-dir reader from arm B, so re-importing the join from arm A into arm B would form a cycle). One-directional: both arms -> the join -> the runtime hardening primitives (ContractError / safeId / listJson, cross-tree eval -> runtime).

## Post-fix arm-A pool size (for the orchestrator, before the OOF spend)

```
nCandidates    = 97   (Contested: 76, Low: 21; Unsupported: 0)
droppedNoEvidence = 0  (all 97 refuted-gold clusters recovered evidence text via EXACT match)
run dirs       = 7
within-run source-doc clusters = 97
evidence sentences/candidate = 2 (the worker quote + the excerpt passage)
```

The whole curated corpus matched on the EXACT-text path (the synthesized cluster claim is a verbatim copy of a worker claim `text` in 100% of cases). The OVERLAP fallback is exercised by the test suite for any future paraphrased synthesis.

NOTE for the maintainer: the excerpt passage text legitimately contains a `Source: <url>` header line (it is the real fetched document text). That URL is incidental document metadata WITHIN the passage, not a substitute for evidence -- the critical bug (evidence being ONLY a bare URL with no text) is fixed; the first evidence sentence is the verbatim quote and the second is the real passage.

## Tests (FILE-form, zero spend, deterministic)

- `eval/lz-eval-evidence-join.test.mjs` (9 NEW): exact-match, overlap-match, no-eligible-source drop, eligible-but-no-match drop, 1200-cap + non-ASCII strip, fail-closed (bad run dir / null cluster / malformed worker file), ASCII+no-LZ_SPEND source invariant.
- `eval/lz-eval-armA-native.test.mjs` (5 NEW, 21 total): joinClusterEvidence exact + overlap + no-match-flag, harvest drops + counts droppedNoEvidence (never a URL), cap/ASCII. The 16 pre-existing tests still pass (the corpus helper now also writes claims/excerpts so the join recovers text).
- `eval/lz-eval-harvest.test.mjs` (2 NEW, 15 total): arm-B members carry joined evidence TEXT; nCtrl/nTrap + member uids byte-identical WITH vs WITHOUT the evidence join (regression). The 13 pre-existing tests still pass.

Verification commands run (all exit 0):
```
node --test eval/lz-eval-armA-native.test.mjs      -> 21/21
node --test eval/lz-eval-harvest.test.mjs          -> 15/15
node --test eval/lz-eval-evidence-join.test.mjs    ->  9/9
node --test eval/lz-eval-live-cert.test.mjs        -> 27/27 (dependent, no regression)
node --test eval/lz-eval-contrastive-authoring.test.mjs -> 14/14 (dependent)
node --test eval/lz-eval-contrastive-screen.test.mjs    ->  9/9 (dependent)
full eval suite                                    -> 521/521
```

Live spot-check (NO spend):
```
node -e "import('./eval/lz-eval-armA-native.mjs').then(m=>{const r=m.harvestRefutedGoldCandidates({corpusDir:'.lz-research/'});const c=r.candidates[0];console.log('evidence0:', JSON.stringify(c.evidence).slice(0,300)); console.log('nCandidates', r.nCandidates, 'droppedNoEvidence', r.droppedNoEvidence)})"
-> evidence0 is the worker QUOTE + excerpt passage TEXT (not a bare URL); nCandidates 97, droppedNoEvidence 0
```

## Deviations from Plan

None of the Rule 1-4 auto-fixes were triggered. One design decision the plan left to the executor ("your call, but keep it cohesive"): the join was placed in its OWN module (`lz-eval-evidence-join.mjs`) rather than inline in arm A, because inlining it in arm A and importing into arm B would create an import cycle (arm A imports the run-dir reader FROM arm B). The plan anticipated this option ("If cleaner, export the helper from one module and import it in the other (one-directional, no cycle)") -- the dedicated module is the one-directional, cycle-free realization. Arm A re-exports `joinClusterEvidence`/`resetEvidenceJoinCache` so the existing entry point is preserved.

## Known Stubs

None. The join is wired to real on-disk data; the test stubs are deterministic in-process fixtures (no model dispatch), which is the plan's NO-SPEND contract, not a placeholder.

## Frozen seams + discipline preserved

- No `LZ_SPEND` set anywhere; no real OOF/voter/Copilot dispatch; no network I/O in the join.
- Two arms never pooled (arm-B counts byte-identical, regression-asserted; no combined-N field).
- All changed/new files strictly ASCII, no BOM.
- Files staged by name; `git add .` never used. `.planning/config.json` (a pre-existing, unrelated single-line change) was left unstaged.

## Self-Check: PASSED

- eval/lz-eval-evidence-join.mjs: FOUND
- eval/lz-eval-evidence-join.test.mjs: FOUND
- eval/lz-eval-armA-native.mjs: FOUND (modified)
- eval/lz-eval-harvest.mjs: FOUND (modified)
- commit b1a3134: FOUND
