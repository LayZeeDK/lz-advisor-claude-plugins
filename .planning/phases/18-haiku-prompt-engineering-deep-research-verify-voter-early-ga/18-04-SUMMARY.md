---
phase: 18-haiku-prompt-engineering-deep-research-verify-voter-early-ga
plan: 04
subsystem: testing
tags: [eval, dataset, wice, hf-cli, sha256, label-remap, manifest, license-compliance, node-test]

# Dependency graph
requires:
  - phase: 18-02
    provides: "eval/ install surface (eval/package.json + committed eval/package-lock.json; eval/node_modules + eval/.cache gitignored) + the eval-tree CI gate that already references eval/lz-eval-dataset.test.mjs by path"
  - phase: 18-03
    provides: "eval/lz-eval-aggregate.mjs -- the sibling eval script whose house style + frozen EVAL_THRESHOLDS.STRATA fractions + cross-tree import idiom this loader mirrors"
  - phase: 16
    provides: "the SHIPPED runtime aggregator lz-deep-research-aggregate.mjs exporting ContractError/stripBom/safeId (imported cross-tree, one-directional eval -> runtime)"
  - phase: 17
    provides: "the frozen vote-record verdict enum (unrefuted|refuted) the loader remaps WiCE labels onto"
provides:
  - "eval/lz-eval-dataset.mjs: the zero-hand-authoring dataset loader -- remapLabel (D-02d), verifySha256 (fail-closed), preflightToken/resolveHfToken (gated-401 actionable, no retry), loadManifest (fail-closed parse), stratify (EVAL-01 fractions), fetchDataset (hf CLI, pinned revision, gitignored cache); exports remapLabel + STRATA_FRACTIONS + WICE_REVISION"
  - "eval/__fixtures__/lz-eval-manifest.json: the committed derived manifest (70 examples; WiCE rows vendored with per-file sha256 + revision 54f7976b...; AVeriTeC/LLM-AggreFact/ExpertQA fetch-only = IDs+labels+revision+sha256 ONLY, no corpus text)"
  - "eval/__fixtures__/wice-vendored/: 60 vendored real WiCE subclaim records + a NOTICE (ODC-BY/MIT attribution) -- the ONLY commit-safe corpus (D-04)"
  - "eval/lz-eval-dataset.test.mjs: 15 offline tests (no network, no HF_TOKEN) via the FILE-form gate, incl. the manifest/vendor drift gate that fails closed at Wave 2"
affects: [18-05, phase-18-staged-eval-run, phase-19-search-worker-tier-decision]

# Tech tracking
tech-stack:
  added: []  # no new npm dep; the hf CLI is a pre-existing eval-time TOOL dep (D-01b); jstat is unused here
  patterns:
    - "hf-CLI fetch at a PINNED revision into a gitignored eval/.cache/ + node:crypto sha256 verify against the committed manifest (fail-closed ContractError, never hash an HTML error page) -- the network path runs only at eval time (18-05), the unit suite is fully offline"
    - "WiCE label remap to the FROZEN verdict enum (D-02d): supported->unrefuted; partially_supported->refuted (tagged the SUBTLE substratum); not_supported->refuted; unknown label fails closed"
    - "License-compliant derived manifest (D-04): vendor ONLY WiCE (ODC-BY/MIT) with a NOTICE; commit only IDs+labels+revision+sha256 for the fetch-only (encumbered) corpora -- never the raw text"
    - "Vendored records ASCII-escaped (\\uXXXX) so the committed bytes are strictly ASCII yet JSON.parse reads back the identical record; the sha256 is over those ASCII bytes"
    - "Offline manifest/vendor drift gate: recompute sha256 over each vendored WiCE file + assert coverage (matched count == manifest uid count, no orphans) -- drift fails at Wave 2, not the costly live run"
    - "Cross-tree one-directional import (eval -> runtime) of ContractError/stripBom/safeId; readJson copied module-private using the imported primitives (no bare JSON.parse on untrusted data)"

key-files:
  created:
    - "eval/lz-eval-dataset.mjs"
    - "eval/lz-eval-dataset.test.mjs"
    - "eval/__fixtures__/lz-eval-manifest.json"
    - "eval/__fixtures__/wice-vendored/NOTICE"
    - "eval/__fixtures__/wice-vendored/records/ (60 vendored WiCE subclaim records)"
  modified: []

key-decisions:
  - "WiCE subset = subclaim_dev split at the pinned revision 54f7976b...; deterministic stratified pick of 26 supported / 17 partially_supported (subtle) / 17 not_supported = 60 vendored WiCE rows; the manifest adds 6 AVeriTeC (open-book) + 4 LLM-AggreFact (stress) manifest-only rows = 70 examples (30 unrefuted ~42.9% / 40 refuted; 17 subtle = half the WiCE bad). Hits the EVAL-01 ~40/~60 ~half-subtle shape with real human gold labels (no hand-authoring)."
  - "Vendored records keep the FULL real WiCE record verbatim (label, claim, evidence, supporting_sentences, meta) -- ODC-BY annotations are commit-safe -- but every non-ASCII code point is escaped to its \\uXXXX JSON escape so the committed files satisfy the strict ASCII rule and still JSON.parse to the identical record."
  - "AVeriTeC/LLM-AggreFact/ExpertQA carry a PENDING revision + empty files[] in the manifest (revision + KS sha256 enumerated once authenticated at eval time, RESEARCH A4); their example rows carry ONLY uid/source/source_label/stratum/book/expected_verdict -- no corpus text (D-04 CC-BY-NC / CC-BY-ND compliance)."
  - "The drift-gate test was authored in the same single test file as the loader-behavior tests (the plan's Task 1 + Task 2 share eval/lz-eval-dataset.test.mjs); committed in the Task-2 commit alongside the vendored records so each commit's suite is green (Task 1 commit = 13 loader tests; Task 2 commit adds the 2 drift-gate tests + the records they assert)."

# Metrics
metrics:
  duration: ~13min
  tasks: 2
  files-created: 64  # loader + test + manifest + NOTICE + 60 vendored records
  completed: 2026-06-16
---

# Phase 18 Plan 04: Zero-hand-authoring dataset loader + committed derived manifest + vendored-WiCE Summary

Built the EVAL-01 dataset loader (`eval/lz-eval-dataset.mjs`): it fetches existing human-labeled
corpora via the `hf` CLI into a gitignored cache at a pinned revision, sha256-verifies fail-closed
against the committed manifest, remaps WiCE labels to the frozen `unrefuted|refuted` enum, and
stratifies programmatically to the EVAL-01 shape -- with WiCE vendored (the only commit-safe corpus)
and AVeriTeC/LLM-AggreFact fetch-only (manifest-only, no redistributed text). An offline drift gate
fails closed at Wave 2 if the manifest's WiCE uid set or per-file sha256 ever diverges from the
vendored records.

## What Was Built

### Task 1 -- the dataset loader + committed derived manifest (commit 3cc634e)

`eval/lz-eval-dataset.mjs` exports the pure, fail-closed building blocks:

- `remapLabel(wiceLabel)` -- the D-02d map (`supported -> unrefuted`; `partially_supported -> refuted`
  and tagged the `subtle` substratum; `not_supported -> refuted`); an unknown label throws
  `ContractError` (no silent default). The remap is discriminating: supported and partially_supported
  remap to DIFFERENT verdicts (the test proves the flip, not a tautology).
- `verifySha256(buf, expectedSha, file)` -- node:crypto sha256; fail-closed `ContractError`
  `/checksum mismatch/` naming the offending file (so a 401/HTML error body never silently verifies).
- `resolveHfToken` + `preflightToken(repo, {gated})` -- token resolution mirrors `huggingface_hub`
  (env `HF_TOKEN` -> `HF_TOKEN_PATH` -> `HF_HOME/token`). A gated repo with no token throws an
  ACTIONABLE error naming the dataset + `HF_TOKEN` + `hf auth login` and does NOT retry as transient;
  an ungated repo (WiCE) needs no token (the closed-book SUBTLE gate runs token-free).
- `loadManifest(path)` -- fail-closed parse + shape validation + a `uid -> row` lookup.
- `stratify(pool, n)` -- programmatic sampling to ~40% supported / ~60% bad / ~half-bad-SUBTLE; fails
  closed if a stratum cannot be satisfied (a degenerate all-supported sample is never silently
  returned -- Pitfall 3).
- `fetchDataset(repo, {revision, include, gated})` -- shells out to `hf download --revision <sha>
  --include <glob> --local-dir eval/.cache/<slug>` with a safeId-guarded cache basename; refuses a
  missing/`main` revision; the network path runs only at eval time (18-05), never in the unit suite.

`eval/__fixtures__/lz-eval-manifest.json` -- 70 examples (30 unrefuted ~42.9% / 40 refuted; 17
subtle). The WiCE rows carry uids + remapped labels + the pinned revision `54f7976b...` and the
WiCE `sources[]` entry carries the per-vendored-file sha256. AVeriTeC, LLM-AggreFact, and ExpertQA
are manifest-only: `vendored:false`, a PENDING revision (enumerated at eval time, A4), empty
`files[]`, and example rows that carry only IDs + remapped labels (no corpus text).

The loader imports `ContractError`/`stripBom`/`safeId` cross-tree from the shipped runtime aggregator
(one-directional eval -> runtime); the only `JSON.parse` is inside the fail-closed `readJson`.

### Task 2 -- vendor WiCE + NOTICE + the manifest/vendor drift gate (commit 7d262f7)

`eval/__fixtures__/wice-vendored/records/` -- 60 real WiCE subclaim records (subclaim_dev split at
the pinned revision), vendored verbatim (ODC-BY annotations / MIT code), with non-ASCII escaped to
`\uXXXX` so the committed files are strictly ASCII and still parse to the identical record. Basenames
are the WiCE `meta.id`.

`eval/__fixtures__/wice-vendored/NOTICE` -- ODC-BY/MIT attribution citing `jon-tow/wice`, EMNLP 2023
(Kamoi et al.), the `ryokamoi/wice` GitHub repo, and the pinned revision; states plainly that
AVeriTeC (CC-BY-NC) and LLM-AggreFact (CC-BY-ND) are fetch-only and never vendored.

The drift-gate test cases (appended to `eval/lz-eval-dataset.test.mjs`): assert COVERAGE (every
manifest WiCE uid has a matching vendored record; matched count == uid count; no orphans) and sha256
MATCH (recompute over each vendored file, fail-closed on divergence). A discriminating sibling case
proves a single tampered byte fails the gate.

## Verification

- `node --test eval/lz-eval-dataset.test.mjs` -> 15 tests pass via the explicit FILE form (no network,
  no HF_TOKEN). The full eval-tree gate (`dataset` + `aggregate` + `packaging-boundary`) -> 32 pass.
- The plugin-tree runtime aggregator test (the cross-tree import source) -> 39 pass (import-clean,
  one-directional boundary intact via the packaging-boundary test).
- Manifest: 70 examples, 30 unrefuted (42.9%, within the ~40% band), >= 60 total.
- ASCII-only: the loader, test, manifest, NOTICE, and all 60 vendored records contain zero non-ASCII
  code points. No AVeriTeC/LLM-AggreFact corpus text is committed anywhere under `eval/` (the only
  match for those names is the NOTICE's license-compliance explanation).

## Deviations from Plan

None - plan executed exactly as written. (The plan's TDD Task 1 and Task 2 both target the single
file `eval/lz-eval-dataset.test.mjs`; the loader-behavior tests landed in the Task-1 commit and the
two drift-gate tests landed in the Task-2 commit alongside the vendored records they assert, so each
commit's suite is green -- this is the intended split, not a deviation.)

## Authentication Gates

None encountered. WiCE is ungated, so vendoring its records via `hf download` needed no `HF_TOKEN`.
The gated-401 path (LLM-AggreFact / AVeriTeC) is exercised only as an offline simulated pre-flight in
the unit suite; the live fetch of the gated open-book/stress arms happens at eval time (18-05) and
will require an `HF_TOKEN` then -- the loader surfaces the actionable message if it is absent.

## Known Stubs

The AVeriTeC / LLM-AggreFact / ExpertQA `sources[]` rows carry `revision: PENDING_ENUMERATE_AT_EVAL_TIME`
and empty `files[]` BY DESIGN (D-04 / RESEARCH A4): the gated repos' exact pinned revision and the KS
sha256 cannot be enumerated without an authenticated `HF_TOKEN` and accepted terms, which is an
eval-time step (Plan 18-05). These are intentional, license-compliant placeholders -- the manifest must
NOT carry the raw corpus text. The WiCE closed-book SUBTLE gate (the sole hard gate) is fully
populated and self-contained from the vendored records, so 18-05's SUBTLE-first stage is unblocked.

## Self-Check: PASSED

- Created files verified present: `eval/lz-eval-dataset.mjs`, `eval/lz-eval-dataset.test.mjs`,
  `eval/__fixtures__/lz-eval-manifest.json`, `eval/__fixtures__/wice-vendored/NOTICE`,
  `eval/__fixtures__/wice-vendored/records/` (60 files), and this SUMMARY.
- Commits verified present: `3cc634e` (Task 1 loader + manifest + test), `7d262f7` (Task 2 vendored
  WiCE + NOTICE + drift gate).
