---
phase: 16-deterministic-off-model-aggregator-validation-fixture
plan: 01
subsystem: testing
tags: [node, esm, aggregator, deterministic, off-model, zero-dep, deep-research, node-test]

# Dependency graph
requires:
  - phase: 15-spike (plans/_spike)
    provides: "Spike A1 proven deterministic core (norm/jaccard/quoteInExcerpt/mergeClaims/recheck/tally) + immutable run-dir layout"
provides:
  - "Zero-dependency Node ESM aggregator at plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs"
  - "Exported pure functions: normalize, jaccard, mergeClusters, loadExcerpts, quoteOutcome, recheckClusters, rankClusters, enforceCeilings, tally, aggregate; plus stripBom, safeId, NUMWORDS, CEILINGS, ContractError"
  - "LOAD-BEARING survivors.json record shape (frozen by Phase 17): {id, claim, sources[], corroboration_lower_bound, quote_fidelity, confidence}"
  - "LOAD-BEARING run-dir input layout (frozen by Phase 17): claims/<worker-id>.json, excerpts/<excerpt-id>.txt, votes/<id>-<seat>.json"
  - "Deterministic counts-only stdout summary contract + exit-code semantics (0 ok / 2 contract violation)"
affects: [17-json-schema-verification-contract, 18-haiku-voter-eval, 19-search-extract-workers, 20-orchestrator-skill]

# Tech tracking
tech-stack:
  added: [node:test (carried for Plan 02; not authored here), node:url-fileURLToPath]
  patterns:
    - "Pure functions + thin CLI guarded by fileURLToPath(import.meta.url)===path.resolve(argv[1]) so import does not run the CLI"
    - "Off-model deterministic reduction over immutable on-disk files (zero model tokens)"
    - "Centralized normalize() comparison primitive (BOM strip + CRLF/CR->LF + number-word fold) used by both jaccard and quoteOutcome"
    - "Observability-as-contract: every drop/downgrade/cap surfaces as a count in deterministic stdout"

key-files:
  created:
    - plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs
  modified: []

key-decisions:
  - "survivor record field names FROZEN as {id, claim, sources, corroboration_lower_bound, quote_fidelity, confidence} (Phase 17 inherits verbatim)"
  - "confidence vocabulary: High | Medium | Low/Contested | Rejected | Unsupported (Unsupported added per RESEARCH guidance 6 for zero-readable-seats)"
  - "quote_fidelity vocabulary: verified | downgraded (dropped members are excluded before tally, never appear as a fidelity value)"
  - "Aggregator ACTIVELY enforces MAX_VERIFY_CLAIMS/VOTES_PER_CLAIM/SYNTH_CAP; CARRIES ANGLES/MAX_FETCH as shared contract (Phase-20 orchestrator enforces those)"
  - "Optional LZ_DR_* env override intentionally NOT wired (D-12): hardcoded CEILINGS defaults are the enforced contract this phase"
  - "BOM written in source only as the JS escape \\uFEFF, never a literal byte (ASCII-only source)"

patterns-established:
  - "Pure-functions-plus-guarded-CLI: the plugin's first bundled executable script and first node:test-targeted module"
  - "Distinct-source corroboration as a Set; corroboration_lower_bound = sources.size (a lower bound, D-09)"
  - "Three-way quote outcome upstream of vote tally (D-06/VERIF-04)"

requirements-completed: [AGG-01, AGG-02, AGG-06, VERIF-04]

# Metrics
duration: 24min
completed: 2026-06-15
---

# Phase 16 Plan 01: Deterministic off-model aggregator (pure functions + thin CLI) Summary

**Zero-dependency Node ESM aggregator hardening spike A1 into exported pure functions (normalize, jaccard, mergeClusters, quoteOutcome, enforceCeilings, tally, aggregate) + frozen CEILINGS behind a guarded thin CLI, with three-way quote re-check upstream of voting, distinct-source corroboration as a lower bound, and observable in-code ceiling caps.**

## Performance

- **Duration:** ~24 min
- **Started:** 2026-06-15T07:00Z (approx.)
- **Completed:** 2026-06-15
- **Tasks:** 2
- **Files modified:** 1 (created)

## Accomplishments

- Created the plugin's FIRST bundled executable script: `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs` (zero non-`node:` imports, no `package.json`, pure ASCII source verified by `rg -n "[^\x00-\x7F]"` returning nothing).
- Refactored the spike's proven core into exported PURE functions, runDir-parameterized, BOM/CRLF/path-safe, reproducible (sorted `readdirSync` + deterministic ranking tiebreak).
- Added the three locked extensions: three-way quote outcome (D-05) run UPSTREAM of tally (D-06), distinct-source corroboration as a lower bound (D-08/D-09), and in-code ceiling enforcement with observable caps (D-10/D-11).
- Wired the thin CLI behind a `fileURLToPath(import.meta.url) === path.resolve(process.argv[1])` guard so importing the module produces no CLI side-effect; CLI exits 0 on success, 2 on contract violation (missing/invalid run-dir, malformed worker JSON naming the bad file).

## Task Commits

Each task committed atomically (single-repo, normal commits with hooks, files staged by name):

1. **Task 1: Refactor spike core into exported pure functions + CEILINGS (CRLF/BOM/path safety)** - `4e140b2` (feat)
2. **Task 2: Add three-way quote outcome, ceiling enforcement, tally, aggregate(), thin CLI** - `f2dbc08` (feat)

**Plan metadata:** (final docs commit -- SUMMARY.md + STATE.md + ROADMAP.md)

_Note: This plan's frontmatter is `tdd="true"`, but per the plan's `<verification>` block the `node:test` fixture is owned by Plan 16-02. For THIS plan the per-task inline `node -e` smoke checks (plus an 11-check end-to-end validation run in a temp dir) are the executable gate. RED/GREEN were expressed via those smoke checks; no `*.test.mjs` was authored here (scope fence)._

## Files Created/Modified

- `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs` - The deterministic off-model aggregator: exported pure functions + frozen `CEILINGS` + guarded thin CLI.

## LOAD-BEARING Output Contract (for Plan 16-02 + Phase 17 to freeze verbatim)

> **SUPERSEDED IN PART by Phase 17 (GA-1, 2026-06-15).** The `confidence` vocabulary recorded below (`Rejected`, fused `Low/Contested`) is Phase 16's AS-SHIPPED output, retained for history. Phase 17 ratified a SINGLE enum `High | Medium | Low | Contested | Unsupported` -- `Rejected` dropped, `Low/Contested` un-fused, and the tally emits `Contested` on a per-claim voter split (>=1 unrefuted AND >=1 refuted) -- decided by unanimous repo-blind cross-model consensus. The aggregator `tally()` + the stdout summary line + the validation fixture are corrected in the Phase-17 plan (in lockstep). New authority for the frozen data contract: `plugins/lz-advisor/references/lz-deep-research-schema.md` (the Phase-17 reference doc, frozen verbatim from the corrected aggregator `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs` under the D-12 anti-drift rule); decision provenance in `.planning/phases/17-json-schema-verification-contract-reference/17-CONTEXT.md` (D-01..D-03c, D-12). Everything else in this contract (record field set, run-dir layout, quote-recheck, ceilings, stdout structure, exit codes) stands UNCHANGED.

### Exported surface (function/const names)

```
NUMWORDS              const   number-word fold map (verbatim from spike)
normalize(s)          fn      BOM strip + CRLF/CR->LF + lowercase + non-alnum->space + number-word fold + drop 'percent'
jaccard(a, b)         fn      token-set Jaccard over normalize(); 0 when union empty
CEILINGS              const   Object.freeze({ ANGLES:5, MAX_FETCH:15, MAX_VERIFY_CLAIMS:24, VOTES_PER_CLAIM:3, SYNTH_CAP:20 })
ContractError         class   Error subclass carrying .file (the offending path)
stripBom(s)           fn      drops a leading U+FEFF before JSON.parse
safeId(id)            fn      basename guard: rejects path separators / '.' / '..' (V12 path traversal)
mergeClusters(runDir) fn      read claims/*.json (sorted) -> dedup clusters; cluster.sources is a Set of distinct source ids
loadExcerpts(runDir)  fn      { byId: Map<excerpt_id, normalize(text)>, all: string[] }
quoteOutcome(member, excerptsById, allExcerpts)  fn   'verified' | 'downgraded' | 'dropped'
recheckClusters(clusters, excerpts)  fn   { kept, dropped }; drops 'dropped' members; cluster survives iff >=1 verified-or-downgraded
rankClusters(clusters)  fn    corroboration (sources.size) DESC, normalized-text lexical ASC tiebreak
enforceCeilings(rankedClusters)  fn   { kept, caps }; caps.claims = '<n>-><MAX_VERIFY_CLAIMS>' only when fired
tally(cl, runDir, capsOut)  fn   confidence label; reads <= VOTES_PER_CLAIM seats; counts extra seats into capsOut.votes_ignored
aggregate(runDir)     fn      { survivors, dropped, summary, caps }  -- the top-level pipeline
```

### `survivors.json` record shape (array, top <= SYNTH_CAP) -- FROZEN BY PHASE 17

```json
[
  {
    "id": "cluster0",
    "claim": "X reduces Y by 30%",
    "sources": ["s1", "s2"],
    "corroboration_lower_bound": 2,
    "quote_fidelity": "verified",
    "confidence": "High"
  }
]
```

- `id` (string): cluster id (`cluster<N>` by first-seen order).
- `claim` (string): the cluster's representative claim text (first member's text).
- `sources` (string[]): distinct source ids, sorted ascending. Verbatim evidence only; no raw excerpt text.
- `corroboration_lower_bound` (integer): `cluster.sources.size` -- a LOWER bound (D-09), never an exact independence count.
- `quote_fidelity` (`'verified' | 'downgraded'`): `'verified'` when >=1 kept member's quote is in its CITED excerpt; `'downgraded'` when no kept member is verified but >=1 is present in some OTHER excerpt.
- `confidence` (`'High' | 'Medium' | 'Low/Contested' | 'Rejected' | 'Unsupported'`): vote-tally rubric result.
- Written as 2-space pretty JSON. Phase 17 may ADD a second-assurance (entailment) field -- it was deliberately NOT added here (scope fence).

### Run-dir INPUT layout the aggregator reads (D-02) -- FROZEN BY PHASE 17

```
<run-dir>/claims/<worker-id>.json   -> {"worker": "...", "source": "...", "claims": [{"id","text","quote","excerpt_id"}]}
<run-dir>/excerpts/<excerpt-id>.txt -> plain UTF-8 text (CRLF or LF; BOM tolerated)
<run-dir>/votes/<id>-<seat>.json    -> {"verdict": "unrefuted" | "refuted"}  (missing seat -> "insufficient")
```

- Vote-file lookup per seat: cluster id first (`<clusterId>-<seat>.json`), then first-member claim id (`<memberId>-<seat>.json`).
- `worker-id` / `excerpt-id` are filename basenames; ids derived from file content are run through `safeId`.

### Tally rubric (PRESERVED from spike; Unsupported added)

```
refuted >= 2        -> 'Rejected'
unrefuted === 3     -> 'High'
unrefuted === 2     -> 'Medium'
zero readable seats -> 'Unsupported'
otherwise           -> 'Low/Contested'
```

Seats are capped at `VOTES_PER_CLAIM` (3); a 4th+ seat file is ignored deterministically and counted into `caps.votes_ignored`.

### stdout summary -- deterministic, counts-only (D-03), 4 lines

Exact format produced by `aggregate()`:

```
raw: <rawClusterCount> -> clusters: <survived+dropped> (merged: <K>)
quote-recheck: verified <A> | downgraded <B> | dropped <C>
capped: <none | claims X->24 [synth Y->20] [votes_ignored N]>
survivors: <Z> (High <h>, Medium <m>, Low/Contested <l>, Unsupported <u>)
```

Real output on the committed spike run-dir (`plans/_spike/run/`):

```
raw: 2 -> clusters: 2 (merged: 0)
quote-recheck: verified 1 | downgraded 0 | dropped 1
capped: none
survivors: 1 (High 1, Medium 0, Low/Contested 0, Unsupported 0)
```

- `caps` object keys (when fired): `claims` (`'<n>->24'`), `synth` (`'<n>->20'`), `votes_ignored` (integer).
- `dropped` record shape: `{ id, claim, reason: 'quote-not-in-any-excerpt' }`.

### Exit-code semantics (CLI)

- `0` on success (writes `survivors.json` into the run dir, prints the summary to stdout).
- `2` on contract violation: missing/non-directory `<run-dir>`, or any `ContractError` (malformed JSON, missing `claims[]`, unsafe id) -- stderr message names the offending file.

## Decisions Made

- **Confidence vocabulary extended with `Unsupported`** (RESEARCH guidance 6) for clusters with zero readable vote seats. The four spike labels (`High`/`Medium`/`Low/Contested`/`Rejected`) are preserved verbatim.
- **`corroboration_lower_bound` and `quote_fidelity`** chosen as the load-bearing field names per RESEARCH guidance 6 / A3 (flagged as deliberate, since Phase 17 freezes them).
- **`ANGLES`/`MAX_FETCH` carried but not actively enforced** by the aggregator (documented in a code comment); the Phase-20 orchestrator enforces those at wave dispatch. The aggregator actively enforces `MAX_VERIFY_CLAIMS`/`VOTES_PER_CLAIM`/`SYNTH_CAP`.
- **`LZ_DR_*` env override omitted** (D-12 / Claude's Discretion): hardcoded `CEILINGS` are the enforced contract for this phase.
- **Ranking tiebreak = normalized-text lexical order** (deterministic reproducibility for AGG-01); `aggregate()` deep-equals itself across runs (verified).

## Deviations from Plan

None - plan executed exactly as written. All locked decisions (D-01..D-16) honored; the three extensions added exactly as itemized; scope fence respected (no test fixture, no `__fixtures__`, no SKILL.md, no `.gitignore` entry -- those are Plan 16-02 / later phases).

_Note on the RESEARCH.md illustrative paraphrase pair: RESEARCH guidance 4 / D-15 case 3 suggested `"X reduces Y by 30%"` vs `"X cuts Y thirty percent"` as a same-source paraphrase pair. Empirically these normalize to `x reduces y by 30` vs `x cuts y 30` -> jaccard 0.5 (below the 0.6 merge threshold), so they correctly stay SEPARATE under the locked UNDER-merge bias (D-07). The distinct-source corroboration mechanism (corroboration counts distinct sources, never claim count) holds regardless of whether such a pair merges: this is a note for Plan 16-02's fixture authoring (use a pair that actually merges at >= 0.6, e.g. `"X reduces Y by 30%"` vs `"X reduces Y by thirty percent"` (jaccard 1.0), sharing one source, to assert `corroboration_lower_bound === 1`). NOT a code change._

## Issues Encountered

- The Write tool inserted literal U+FEFF (BOM) bytes where the source needed the JS escape (backslash-u-F-E-F-F). Resolved by a one-off Node fixer (run, then deleted) that replaced literal BOM chars with the 6-char ASCII escape; confirmed pure-ASCII via the non-ASCII byte scan returning nothing before each commit.

## Self-Check: PASSED

- FOUND: `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs` (553 lines, min 120; contains `export function aggregate`)
- FOUND commit `4e140b2` (Task 1)
- FOUND commit `f2dbc08` (Task 2)
- Zero non-`node:` imports; no `package.json` anywhere in repo; aggregator source is pure ASCII (non-ASCII byte scan returns nothing)
- All per-task `node -e` smoke checks (`TASK1 OK`, `TASK2 OK`) + the 11-check end-to-end validation passed

## Next Phase Readiness

- The output contract above is ready for Phase 17 to freeze verbatim and for Plan 16-02 to assert against via `node:test`.
- Plan 16-02 must author the `node:test` fixture (`lz-deep-research-aggregate.test.mjs`) + committed `__fixtures__/<case>/{claims,excerpts,votes}/` data, including at least one deliberate-CRLF excerpt and a same-source merging paraphrase pair (see the note above). Per the host quirk, run the test via the explicit FILE form (`node --test <file>`), not the directory form.
- No blockers.

---
*Phase: 16-deterministic-off-model-aggregator-validation-fixture*
*Completed: 2026-06-15*
