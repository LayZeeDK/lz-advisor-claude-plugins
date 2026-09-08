---
phase: 16-deterministic-off-model-aggregator-validation-fixture
verified: 2026-06-15T00:00:00Z
status: passed
score: 15/15 must-haves verified
overrides_applied: 0
re_verification: null
---

# Phase 16: Deterministic off-model aggregator + validation fixture -- Verification Report

**Phase Goal:** A reproducible, auditable Node helper performs every dedup / ranking / vote-tally / quote-vs-stored-excerpt re-check off-model (zero model tokens), enforces the named ceilings in code, runs zero-dependency on Windows arm64 / Git Bash, and is locked down by a fixture asserting its load-bearing correctness behaviors.
**Verified:** 2026-06-15
**Status:** passed
**Re-verification:** No -- initial verification

## Goal Achievement

Every must-have was verified against the ACTUAL codebase, not SUMMARY claims. The phase gate
was run independently (file form, 13/13 green, exit 0). Each load-bearing behavior was ALSO
re-proven via the CLI on the committed fixtures and via direct import probes, so the verdict does
not rest on the test suite alone. All three post-review fix commits (94023db, 830b4bf) are present
and their fixes are confirmed observable.

### Observable Truths (ROADMAP Success Criteria -- the contract)

| #   | Truth (ROADMAP SC) | Status | Evidence |
| --- | ------------------ | ------ | -------- |
| SC-1 | Running the .mjs against a run-dir produces deterministic dedup/rank/tally/quote-recheck output, zero model tokens, zero npm deps (Node stdlib only) | VERIFIED | CLI on `near-duplicate-merged` exits 0 and writes a deterministic `survivors.json`; test `SC-1 aggregate is deterministic` deep-equals two runs; imports are exactly `node:fs`/`node:path`/`node:url`; no `package.json` tracked or on disk |
| SC-2 | CRLF- and path-safe on Windows arm64 / Git Bash: explicit UTF-8 + LF normalization, path.join, sorted readdirSync, no shell globbing | VERIFIED | `normalize(BOM+'Thirty percent\r\n') === '30'` (test pass); runtime BOM+CRLF excerpt (written to a tmpdir) still matches an LF quote -> `quote_fidelity 'verified'`; `safeId` rejects separators/`..`; `loadExcerpts`/`listJson` use `path.join` + `.sort()`; ran clean on the host (Node v24.13.0 / win32 / Git Bash) |
| SC-3 | A claim whose verbatim quote fails the re-check is dropped UPSTREAM of any vote-tally; the drop is observable before any voting | VERIFIED | `fabricated-quote-dropped` CLI: `quote-recheck: ... dropped 1`, `survivors: 0` despite THREE committed unrefuted vote seats (`c1-0/1/2.json` all `unrefuted`) -- the claim would tally `High` but never reaches `tally()` because `recheckClusters` runs before `rankClusters`/`enforceCeilings`/`tally` in `aggregate`. `wrong-passage-downgraded` is DOWNGRADED (kept, `downgraded 1`), not dropped, not upheld |
| SC-4 | Named ceilings enforced in code, not model discretion; over-ceiling input capped by the script | VERIFIED | `CEILINGS` is `Object.isFrozen === true` with exactly `{ANGLES:5, MAX_FETCH:15, MAX_VERIFY_CLAIMS:24, VOTES_PER_CLAIM:3, SYNTH_CAP:20}`; `ceilings-enforced` CLI prints `capped: claims 31->24 synth 24->20` (cap applied AFTER ranking, observable in stdout) |
| SC-5 | Committed fixture asserts each load-bearing behavior and passes: fabricated dropped, real-quote/wrong-passage downgraded, paraphrase pair NOT double-counted, near-duplicate merged, ceilings enforced | VERIFIED | 5 distinct named SC5-* tests pass; SC5-3 carries the `survivors.length === 1` precondition guard BEFORE `corroboration_lower_bound === 1` (not vacuous); each fixture genuinely exercises its behavior (verified via CLI + content inspection) |

**Score: 5/5 ROADMAP success criteria verified.**

### Observable Truths (PLAN must_have truths -- plan-specific detail)

| #   | Truth (PLAN) | Status | Evidence |
| --- | ------------ | ------ | -------- |
| 1 | Spike core refactored into exported PURE functions (normalize, jaccard, quoteOutcome, mergeClusters, enforceCeilings, tally, aggregate) behind a thin CLI | VERIFIED | Import probe: all 7 are `typeof === 'function'`; CLI is guarded by `fileURLToPath(import.meta.url) === path.resolve(process.argv[1])` (importing the module yields no stdout) |
| 2 | CRLF/BOM/UTF-8 + path safe (explicit LF+BOM normalize inside normalize(), path.join, sorted readdirSync, no shell globbing) | VERIFIED | `normalize()` strips a leading U+FEFF (the JS escape, never a literal byte), folds `\r\n`/`\r` -> `\n` before lowercase; `stripBom` before every `JSON.parse`; `safeId` basename guard; `listJson`/`loadExcerpts` sort the readdir |
| 3 | Fabricated-quote claim DROPPED upstream of vote-tally; observable in stdout/result before any vote read | VERIFIED | See SC-3 above -- `fabricated-quote-dropped` drops with 3 unrefuted seats present |
| 4 | Real-quote/wrong-passage claim DOWNGRADED (kept, fidelity lowered), not dropped, not upheld | VERIFIED | `wrong-passage-downgraded`: survivor with `quote_fidelity === 'downgraded'`; `dropped.length === 0`; quote verbatim-present in a DIFFERENT committed excerpt (e2.txt) than the cited one (e1.txt) |
| 5 | Same-source paraphrase pair = corroboration 1 (not 2); different-source near-dups merge to corroboration = distinct-source count | VERIFIED | `paraphrase-one-source` (both claims `source: s1`) -> 1 cluster, `corroboration_lower_bound: 1`; `near-duplicate-merged` (`source: s1` + `source: s2`) -> 1 cluster, `corroboration_lower_bound: 2`, `confidence: High` |
| 6 | Five named ceilings in a single Object.freeze block, enforced in code; over-ceiling capped AFTER ranking, observable; LZ_DR_* override intentionally NOT wired | VERIFIED | See SC-4; no env override read anywhere in the .mjs (grep-confirmed; comment documents the deliberate omission per D-12) |
| 7 | survivors.json field shape {id, claim, sources, corroboration_lower_bound, quote_fidelity, confidence} is the Phase-17 frozen contract | VERIFIED | CLI-written `survivors.json` carries exactly these six keys in this shape |
| 8 | Committed node:test fixture asserts all 5 SC-5 behaviors and PASSES; aggregator+test+__fixtures__ co-located under scripts/ | VERIFIED | `node --test <file>` = 13 tests, 13 pass, 0 fail, exit 0; all artifacts under `plugins/lz-advisor/skills/lz-deep-research/scripts/` |
| 9 | Runtime-generated CRLF+BOM excerpt (never a committed byte) still matches an LF quote; zero committed non-ASCII bytes | VERIFIED | `rg -n "[^\x00-\x7F]" scripts/ -uu` returns nothing across .mjs + .test.mjs + all 97 committed fixture files; BOM excerpt is written to `os.tmpdir()` at runtime |
| 10 | Fixtures are REAL committed files (never self-seeded, never phantom) | VERIFIED | `git ls-files` lists 95 committed fixture files across 6 cases + 2 source files; contents inspected directly (claims/excerpts/votes are real) |

**Score: 10/10 PLAN must_have truths verified. Combined: 15/15.**

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | -------- | ------ | ------- |
| `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs` | Off-model deterministic aggregator: 7 pure fns + CEILINGS + thin CLI (min 120 lines, contains `export function aggregate`) | VERIFIED | 603 lines; `export function aggregate` present; imports only node:*; pure ASCII; guarded CLI |
| `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs` | node:test fixture covering SC-1..SC-5 + hardening, importing Plan-01 fns (min 60 lines, contains `node:test`) | VERIFIED | 268 lines; imports `node:test`/`node:assert/strict` + `./lz-deep-research-aggregate.mjs`; 13 named tests; resolves fixtures via `fileURLToPath(import.meta.url)` |
| `__fixtures__/near-duplicate-merged/claims/w1.json` (+ 5 other cases) | Committed immutable fixture run-dirs (contains `excerpt_id`) | VERIFIED | All 6 cases committed: fabricated-quote-dropped, wrong-passage-downgraded, paraphrase-one-source, near-duplicate-merged, ceilings-enforced, crlf-bom-safe; each matches the D-02 claims/excerpts/votes layout (crlf-bom-safe ships claims/+votes/ only, excerpt generated at runtime by design) |

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | --- | --- | ------ | ------- |
| `aggregate(runDir)` | claims/*.json, excerpts/*.txt, votes/*.json | `fs.readdirSync` + `path.join` (sorted, no glob) | WIRED | `listJson` sorts; `mergeClusters`/`loadExcerpts`/`tally` all use `path.join`; no shell globbing |
| `quoteOutcome` (re-check) | `tally` (vote counting) | re-check UPSTREAM of tally | WIRED | In `aggregate`: `recheckClusters` -> `rankClusters` -> `enforceCeilings` -> `tally`; dropped members excluded before any vote read (proven by fabricated-quote-dropped) |
| CLI guard | `aggregate()` | `fileURLToPath(import.meta.url) === path.resolve(process.argv[1])` | WIRED | Module import produces no stdout; CLI runs only when invoked directly; exit 0 success / 2 contract violation |
| `lz-deep-research-aggregate.test.mjs` | aggregate, normalize, CEILINGS | plain ESM import `from './lz-deep-research-aggregate.mjs'` | WIRED | Import present at test line 30; functions exercised in all 13 tests |
| the test | `__fixtures__/<case>` | `fileURLToPath(import.meta.url)` resolution (never process.cwd()) | WIRED | `HERE = path.dirname(fileURLToPath(import.meta.url))`, `fx()` joins under `__fixtures__` |

### Data-Flow Trace (Level 4)

The aggregator is a file reducer (no UI/dynamic render). Data flow was traced end-to-end via the
CLI on every committed fixture: real claim/excerpt/vote files flow through merge -> recheck -> rank
-> cap -> tally and produce a populated `survivors.json` + a counts-only summary. The data is real
(committed fixture content inspected), not hardcoded.

| Artifact | Data | Source | Produces Real Data | Status |
| -------- | ---- | ------ | ------------------ | ------ |
| `survivors.json` (CLI output) | survivor records | committed fixture run-dirs read via fs | Yes -- e.g. near-duplicate-merged yields a real cluster with sources [s1,s2], corroboration 2, High | FLOWING |
| stdout summary | counts (raw/clusters/merged/recheck/caps/survivors) | computed from the real pipeline | Yes -- merge receipt `raw: 2 -> clusters: 1 (merged: 1)` reflects true pre-merge total | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| Phase gate (file form) | `node --test .../lz-deep-research-aggregate.test.mjs` | tests 13, pass 13, fail 0, EXIT=0 | PASS |
| CR-01 merge receipt | CLI on `near-duplicate-merged` | `raw: 2 -> clusters: 1 (merged: 1)` | PASS |
| Ceiling cap observable | CLI on `ceilings-enforced` | `capped: claims 31->24 synth 24->20` | PASS |
| Drop upstream of vote | CLI on `fabricated-quote-dropped` | `dropped 1`, `survivors: 0` (3 unrefuted seats present) | PASS |
| Downgrade not drop | CLI on `wrong-passage-downgraded` | `downgraded 1`, 1 survivor | PASS |
| CEILINGS frozen | import probe | `Object.isFrozen === true`, exact 5 values | PASS |
| Malformed-input fail-closed | import probe (missing text/quote/source) | All three THROW ContractError naming the field | PASS |
| Zero-dep imports | grep + import-spec test | only node:fs/node:path/node:url | PASS |
| ASCII purity | `rg -n "[^\x00-\x7F]" scripts/ -uu` | no matches (97 committed files) | PASS |
| WR-05 clean tree | test run then `git status --porcelain` | empty (no untracked artifact) | PASS |

### Probe Execution

No conventional `scripts/*/tests/probe-*.sh` exist for this phase. The phase's declared gate IS the
node:test suite, which was executed independently above (the verifier ran it in its own process; the
result is not taken from SUMMARY). MISSING_PROBE does not apply -- the node:test gate is the phase's
runnable check and it passed (exit 0).

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ----------- | ----------- | ------ | -------- |
| AGG-01 | 16-01 | Off-model deterministic Node aggregator in scripts/ (zero model tokens, reproducible, auditable) | SATISFIED | .mjs runs off-model on files; SC-1 determinism test deep-equals two runs; CLI reproducible |
| AGG-02 | 16-01, 16-02 | Zero external dependencies (Node stdlib only); CRLF/path-safe on Windows arm64 / Git Bash | SATISFIED | node:* imports only; no package.json; normalize() LF+BOM fold; safeId; ran clean on host |
| AGG-04 | 16-02 | Validation fixture asserts load-bearing behaviors (fabricated dropped, wrong-passage downgraded, paraphrase not double-counted, near-dup merged, ceilings enforced) | SATISFIED | 5 distinct SC5-* named tests pass with genuine (non-vacuous) assertions |
| AGG-06 | 16-01 | Named ceilings (5/15/24/3/20) enforced in code, not model discretion | SATISFIED | frozen CEILINGS; cap fires observably (`claims 31->24 synth 24->20`) |
| VERIF-04 | 16-01, 16-02 | Each claim's verbatim quote re-checked vs stored excerpt; failures dropped UPSTREAM of all voting | SATISFIED | recheck precedes tally in aggregate; fabricated-quote-dropped drops despite 3 unrefuted seats |

All 5 requirement IDs from PLAN frontmatter (AGG-01, AGG-02, AGG-04, AGG-06, VERIF-04) are
accounted for. REQUIREMENTS.md maps exactly these 5 IDs to Phase 16 (rows 106-110) and no others --
no orphaned requirements. Per-phase count in REQUIREMENTS.md line 147 confirms "Phase 16 = 5".

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| (none) | -- | No TBD/FIXME/XXX/HACK/PLACEHOLDER/TODO in either source file | -- | -- |

The `return ''` in `normalize()` and the early returns in `quoteOutcome`/`tally` are intentional
control flow (fail-soft type guard, three-way outcome, rubric), not stub placeholders -- each is on
a populated code path with real downstream effect. `caps = {}` / `const all = []` are legitimate
accumulators populated by the pipeline, not hardcoded empty render data. No stub or hollow patterns.

### Post-Review Fix Verification (commits 94023db + 830b4bf)

| Review finding | Fix landed | Status | Evidence |
| -------------- | ---------- | ------ | -------- |
| CR-01: summary merged pinned to 0, raw = post-merge count | 94023db | FIXED | `mergeClusters` returns `{clusters, rawClaimCount}`; CLI prints `raw: 2 -> clusters: 1 (merged: 1)` on near-duplicate-merged; regression test asserts it |
| WR-01/WR-02/WR-03: malformed claims silently corrupt frozen shape | 94023db | FIXED | `normalize` non-string guard returns ''; `mergeClusters` throws ContractError on missing non-empty text/quote/source (probe confirms all three throw) |
| WR-04: substring quote-match over-verifies | 94023db | DOCUMENTED (accepted) | Explicit comment in `quoteOutcome` frames it as an accepted lower-bound fidelity property frozen for Phase 17; no behavior change (intentional) |
| WR-05: test writes untracked artifact into committed __fixtures__ | 830b4bf | FIXED | BOM excerpt assembled in `os.tmpdir()`; `git status` is clean after a full test run |

### Scope Fence

VERIFIED. Across the entire phase (commits 628abb8..830b4bf), every non-`.planning/` file touched
is under `plugins/lz-advisor/skills/lz-deep-research/scripts/` (the aggregator .mjs, the test .mjs,
and the 6 fixture run-dirs). No SKILL.md, no .gitignore, no Phase 17/18/19/20 artifacts, nothing
outside that directory + .planning/ was modified. The working tree is clean.

### Human Verification Required

None. This phase is fully machine-verifiable and was verified mechanically end-to-end (gate run,
CLI on all fixtures, import probes, byte-scan, git-status, scope-fence diff).

### Gaps Summary

No gaps. The phase goal is genuinely achieved in the codebase, not merely claimed in the SUMMARY:

- The aggregator performs dedup/ranking/vote-tally/quote-recheck off-model with zero model tokens
  and zero npm dependencies (Node stdlib only), reproducibly.
- It is CRLF/BOM/UTF-8/path-safe on the actual host (Node v24.13.0 / win32 / Git Bash).
- The three-way quote re-check runs UPSTREAM of the vote tally (a fabricated quote with 3 unrefuted
  votes is dropped before any vote is read; a real-quote/wrong-passage claim is downgraded).
- The five named ceilings live in a single frozen block and are enforced in code with observable caps.
- The committed node:test fixture asserts all 5 load-bearing behaviors as distinct, genuine (non-
  vacuous) tests and passes (13/13, exit 0).
- All three post-review fix commits are present and their fixes are confirmed observable.
- The scope fence holds; the working tree is clean; zero committed non-ASCII bytes.

The output shapes (survivors.json record + stdout summary) are ready for Phase 17 to freeze verbatim.

---

_Verified: 2026-06-15_
_Verifier: Claude (gsd-verifier)_
