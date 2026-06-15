---
phase: 16-deterministic-off-model-aggregator-validation-fixture
plan: 02
subsystem: testing
tags: [node-test, fixture, aggregator, deterministic, off-model, zero-dep, crlf-bom, deep-research]

# Dependency graph
requires:
  - phase: 16-01
    provides: "Zero-dep aggregator (aggregate, normalize, CEILINGS) + FROZEN survivors.json record shape + run-dir input layout"
provides:
  - "Committed node:test validation fixture at plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs asserting all 5 SC-5 behaviors + 4 hardening sub-assertions (9 named tests, exits 0)"
  - "Six committed immutable fixture run-dirs under __fixtures__/ (fabricated-quote-dropped, wrong-passage-downgraded, paraphrase-one-source, near-duplicate-merged, ceilings-enforced, crlf-bom-safe)"
  - "Phase regression gate: node --test <file> exits 0 (FILE form; the directory form false-fails on this host)"
affects: [17-json-schema-verification-contract, 18-haiku-voter-eval, 19-search-extract-workers, 20-orchestrator-skill]

# Tech tracking
tech-stack:
  added: [node:test, node:assert/strict, node:url-fileURLToPath]
  patterns:
    - "node:test fixture importing pure functions + driving aggregate(fixtureDir); zero-dep, no package.json"
    - "Test-file-relative fixture resolution via fileURLToPath(import.meta.url) -- never process.cwd() (T-16-05 cwd-drift safety)"
    - "Runtime-generated BOM/CRLF excerpt via String.fromCharCode(0xFEFF) -- no committed non-ASCII byte while still exercising Layer A+B"
    - "Precondition length guard (survivors.length === 1) before the corroboration assertion to close the vacuous-pass hole"

key-files:
  created:
    - plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs
    - plugins/lz-advisor/skills/lz-deep-research/scripts/__fixtures__/fabricated-quote-dropped/ (claims/w1.json, excerpts/e1.txt, votes/c1-0..2.json)
    - plugins/lz-advisor/skills/lz-deep-research/scripts/__fixtures__/wrong-passage-downgraded/ (claims/w1.json, excerpts/e1.txt, excerpts/e2.txt, votes/c1-0..2.json)
    - plugins/lz-advisor/skills/lz-deep-research/scripts/__fixtures__/paraphrase-one-source/ (claims/w1.json, excerpts/e1.txt, votes/cluster0-0..2.json)
    - plugins/lz-advisor/skills/lz-deep-research/scripts/__fixtures__/near-duplicate-merged/ (claims/w1.json, claims/w2.json, excerpts/e1.txt, excerpts/e2.txt, votes/cluster0-0..2.json)
    - plugins/lz-advisor/skills/lz-deep-research/scripts/__fixtures__/ceilings-enforced/ (31 claims + 31 excerpts + 6 vote seats)
    - plugins/lz-advisor/skills/lz-deep-research/scripts/__fixtures__/crlf-bom-safe/ (claims/w1.json, votes/c1-0..2.json; excerpt produced at runtime)
  modified: []

key-decisions:
  - "paraphrase-one-source uses the merging pair 'X reduces Y by 30%' / 'X reduces Y by thirty percent' (both normalize to {x,reduces,y,by,30}, Jaccard 1.0) -- NOT the RESEARCH-suggested 'X cuts Y thirty percent' (Jaccard 0.5, would not merge -> vacuous pass). The test asserts survivors.length === 1 BEFORE corroboration_lower_bound === 1."
  - "ceilings-enforced uses 31 distinct non-mergeable claims (max pairwise Jaccard 0.43 < 0.6) with distinct sources s01..s31 -> claims 31->24 cap fires observably (SYNTH_CAP 24->20 also fires, additional cap evidence)."
  - "The single BOM/CRLF excerpt is written at RUNTIME by the test into crlf-bom-safe/excerpts/e1.txt (bytes ef bb bf ... 0d 0a) so the committed-on-disk fixture bytes stay pure ASCII; the runtime excerpt stays untracked and is never staged."
  - "Zero-dep sub-assertion bounds the package.json walk at the repo root (dir containing .git) so a host package.json outside this repo cannot cause a false failure."

patterns-established:
  - "First node:test fixture in the repo (no prior .test.mjs); net-new node --test precedent"
  - "Distinct named test per load-bearing behavior, each genuinely exercising it (no tautology); contrast pairs (paraphrase-one-source vs near-duplicate-merged) lock the distinct-source corroboration semantics"

requirements-completed: [AGG-04, AGG-02, VERIF-04]

# Metrics
duration: 7min
completed: 2026-06-15
---

# Phase 16 Plan 02: Aggregator validation fixture (node:test + committed __fixtures__) Summary

**A committed zero-dependency `node:test` fixture that locks down the Plan-16-01 aggregator: nine named tests (five SC-5 load-bearing behaviors plus CRLF/BOM, determinism, and zero-dep hardening) driving six immutable committed fixture run-dirs, with the BOM/CRLF excerpt generated at runtime so no non-ASCII byte is ever committed.**

## Performance

- **Duration:** ~7 min
- **Started:** 2026-06-15T07:18Z
- **Completed:** 2026-06-15T07:25Z
- **Tasks:** 3
- **Files created:** 98 tracked (1 test + 97 committed fixture files across 6 cases) + 1 runtime-generated untracked excerpt

## Accomplishments

- Authored six committed, immutable, pure-ASCII fixture run-dirs under `__fixtures__/`, each matching the FROZEN D-02 run-dir layout (claims/excerpts/votes), seeded from `plans/_spike/run/` where applicable and authored fresh for the new behaviors. No phantom references -- every fixture is a real committed file.
- Wrote the plugin's FIRST `node:test` fixture: 9 named tests importing the Plan-16-01 pure functions (`aggregate`, `normalize`, `CEILINGS`) via a plain relative ESM import, resolving fixtures test-file-relative via `fileURLToPath(import.meta.url)` (never `process.cwd()`).
- Proved the CRLF+BOM normalization (Layer A+B) on the actual host by writing the BOM/CRLF excerpt at runtime via `String.fromCharCode(0xFEFF)` + CRLF newlines -- so the committed bytes stay pure ASCII while the test still exercises the BOM-strip + CRLF->LF fold path.
- Closed the vacuous-pass trap the plan-checker had flagged: `paraphrase-one-source` uses a pair that genuinely merges (Jaccard 1.0), and the test asserts `survivors.length === 1` BEFORE asserting `corroboration_lower_bound === 1`.

## Task Commits

Each task committed atomically (single-repo, normal commits with hooks, files staged by name):

1. **Task 1: Four spike-seeded + new fixture run-dirs (drop, downgrade, paraphrase-one-source, near-dup-merge)** - `879eafa` (test)
2. **Task 2: ceilings-enforced fixture + node:test asserting all 5 SC-5 behaviors** - `d40cd11` (test)
3. **Task 3: crlf-bom-safe case + CRLF/BOM/determinism/zero-dep hardening** - `ae500e1` (test)

**Plan metadata:** (final docs commit -- SUMMARY.md + STATE.md + ROADMAP.md)

## Fixture cases and the SC behavior each asserts

| Case | SC | Behavior asserted | Key assertion |
|------|----|-------------------|---------------|
| fabricated-quote-dropped | SC-3 / VERIF-04 / SC5-1 | Quote absent from all excerpts -> dropped UPSTREAM of voting (has 3 unrefuted seats, would pass votes, but never reaches tally) | `dropped.length === 1`, summary `dropped 1`, fabricated claim absent from survivors |
| wrong-passage-downgraded | SC-3 / D-05 / SC5-2 | Quote absent from cited excerpt but present in another committed excerpt -> kept, fidelity lowered | a survivor with `quote_fidelity === 'downgraded'` |
| paraphrase-one-source | SC-5 / D-08 / SC5-3 | Two same-source paraphrases merge into ONE cluster, NOT double-counted | `survivors.length === 1` (precondition guard) THEN `corroboration_lower_bound === 1` |
| near-duplicate-merged | SC-5 / D-08 / SC5-4 | Two distinct-source paraphrases merge -> corroboration 2 (spike baseline) | one cluster, `corroboration_lower_bound === 2`, `confidence === 'High'` |
| ceilings-enforced | SC-4 / AGG-06 / SC5-5 | 31 distinct non-mergeable clusters -> MAX_VERIFY_CLAIMS cap fires observably | `/claims \d+->24/` in summary, `Object.isFrozen(CEILINGS)`, `CEILINGS.MAX_VERIFY_CLAIMS === 24` |
| crlf-bom-safe | SC-2 / AGG-02 / D-04 | Runtime BOM+CRLF excerpt still matches an LF quote (Layer A+B) | survivor `quote_fidelity === 'verified'` after runtime-writing the BOM/CRLF excerpt |

Plus three non-fixture hardening sub-assertions: `normalize(BOM + 'Thirty percent\r\n') === '30'` (SC-2); `aggregate` deep-equals a second call (SC-1 determinism / AGG-01); aggregator imports only `node:`/relative and no `package.json` exists from the scripts dir up to the repo root (SC-2 zero-dep / T-16-06).

## Phase gate (exit-0 result)

```
node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs
-> tests 9 | pass 9 | fail 0 ; EXIT=0
```

FILE form used deliberately: on this host (Node v24.13.0 / Windows arm64 / Git Bash) the directory form `node --test <dir>` spuriously exits 1 even when every real test passes; the suite is one file, so the file form is the equivalent reliable gate.

CLI integration (plan verification line 2) also confirmed: `node "...lz-deep-research-aggregate.mjs" "...__fixtures__/near-duplicate-merged"` exits 0 and writes `survivors.json` (the generated `survivors.json` was removed after the check -- it is a CLI output artifact, not a committed fixture file).

## Zero committed non-ASCII bytes

Repo-wide raw-byte scan of all 97 committed phase files (the 16-01 aggregator + the test + all six committed fixture cases) returns zero bytes > 0x7F. The ONLY BOM/CRLF byte sequence in the phase (`ef bb bf ... 0d 0a`) lives in `crlf-bom-safe/excerpts/e1.txt`, which is written at RUNTIME by the test and never staged/committed (verified it remains untracked, `??`).

## Field-name differences honored from 16-01-SUMMARY.md

None required beyond confirmation: the test asserts against the exact FROZEN field names recorded in 16-01-SUMMARY.md -- `corroboration_lower_bound`, `quote_fidelity` in `{verified, downgraded}`, `confidence` in `{High, Medium, Low/Contested, Rejected, Unsupported}`, and the summary line `dropped N` / `claims N->24` format. The RESEARCH skeleton's `survivors[0].corroboration_lower_bound` shape matched the frozen contract verbatim; no rename was needed. The RESEARCH-suggested paraphrase pair (`X cuts Y thirty percent`, Jaccard 0.5) was NOT used -- the 16-01 SUMMARY note and the plan both flagged it as a vacuous-pass risk, so the genuinely-merging pair was used instead.

## Deviations from Plan

None - plan executed exactly as written. All three tasks executed in order; the load-bearing fixture-correctness constraints (the merging paraphrase pair, the survivors.length guard, distinct named tests per behavior) were honored; the scope fence was respected (no aggregator edit, no SKILL.md, no .gitignore, no Phase 17+ artifact).

_Note: the runtime BOM/CRLF excerpt and the CLI-generated `survivors.json` are deterministic regenerated test artifacts left untracked (not gitignored, since .gitignore authoring is out of scope per the scope fence and belongs to a later phase's run-dir gitignore concern). Both stay out of every commit._

## Self-Check: PASSED

- FOUND: `lz-deep-research-aggregate.test.mjs` (9 named tests; node --test exits 0)
- FOUND: all six committed fixture cases (fabricated-quote-dropped, wrong-passage-downgraded, paraphrase-one-source, near-duplicate-merged, ceilings-enforced, crlf-bom-safe)
- FOUND commit `879eafa` (Task 1), `d40cd11` (Task 2), `ae500e1` (Task 3)
- Repo-wide raw-byte scan: all 97 committed phase files are pure ASCII (no committed BOM byte)
- Phase gate `node --test <file>` exits 0 (9/9 green); CLI integration on near-duplicate-merged exits 0 + writes survivors.json

## Next Phase Readiness

- The committed fixture is the phase regression gate every downstream phase (17 schema, 18 eval, 19 workers, 20 orchestrator) relies on. It pins the FROZEN survivors.json record shape + summary contract against drift.
- Phase 17 can freeze the schema against both the proven aggregator (16-01) and this passing fixture.
- No blockers.

---
*Phase: 16-deterministic-off-model-aggregator-validation-fixture*
*Completed: 2026-06-15*
