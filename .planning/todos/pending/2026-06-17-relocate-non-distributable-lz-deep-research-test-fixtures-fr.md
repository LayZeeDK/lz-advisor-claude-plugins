---
created: 2026-06-17T22:04:18.206Z
title: Relocate non-distributable lz-deep-research test fixtures from plugin tree
area: packaging
files:
  - plugins/lz-advisor/skills/lz-deep-research/scripts/__fixtures__/ (large dev-only fixture tree -- claims/excerpts/votes run-dirs for ~12+ aggregator test scenarios)
  - plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs (dev-only test)
  - plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs (the ONLY runtime file in scripts/ that should ship)
  - eval/lz-eval-packaging-boundary.test.mjs (the D-11 boundary test -- candidate to extend)
---

## Problem

The distributed `lz-advisor` plugin tree ships dev-only test artifacts under
`plugins/lz-advisor/skills/lz-deep-research/scripts/`:

- `__fixtures__/` -- a large tree of test fixtures (claims/excerpts/votes run-dirs for ~12+ scenarios:
  fabricated-quote-dropped, wrong-passage-downgraded, paraphrase-one-source, near-duplicate-merged,
  ceilings-enforced [31 claims + 31 excerpts], crlf-bom-safe, medium-two-unrefuted, low-thin-support,
  low-refuted-downgraded, contested-split, unsupported-no-votes, worker-output-roundtrip, ...).
- `lz-deep-research-aggregate.test.mjs` -- the co-located node:test suite that consumes those fixtures.

These are consumed ONLY by the plugin-tree aggregator test in dev/CI; they are NOT runtime resources of
the `lz-deep-research` skill. The single runtime file in `scripts/` that the skill actually invokes is
`lz-deep-research-aggregate.mjs`. When a user installs `lz-advisor` from the marketplace, the whole plugin
subtree is copied, so the fixtures + the `.test.mjs` get shipped to end users -- bloat + dev-artifact leakage
in the distributed package.

The existing D-11 packaging boundary (Phase 18-02) only forbids `package.json`/`node_modules` under the
plugin tree and forbids `eval/ -> runtime` imports; it did NOT address `*.test.mjs` / `__fixtures__/`
shipping inside the plugin tree. So this is an uncovered packaging gap, not a regression of D-11.

## Solution

Review `scripts/` and decide a relocation/exclusion strategy that (a) keeps the aggregator test runnable
in dev + CI, (b) keeps the runtime `lz-deep-research-aggregate.mjs` shipping in `scripts/`, and (c) keeps
the fixtures + `.test.mjs` OUT of the distributed/installed plugin.

OPEN QUESTION (resolve FIRST, via claude-code-guide / live docs): does the Claude Code marketplace plugin
install copy the ENTIRE plugin subtree (incl. `__fixtures__/` + `*.test.mjs`), and is there a SUPPORTED
per-file/per-glob exclusion mechanism (an ignore file, a manifest `files`/`exclude` field, etc.)? The
answer picks the approach:

- If NO supported exclusion exists -> RELOCATE: move the `.test.mjs` + `__fixtures__/` to a dev-only
  location OUTSIDE the plugin tree (e.g., a repo-level test dir, mirroring how `eval/` is dev-only). Caveat:
  the test imports `lz-deep-research-aggregate.mjs` by relative path and CI runs it by explicit FILE path
  (`node --test plugins/.../lz-deep-research-aggregate.test.mjs`); a move needs the import path + the
  ci.yml / test-act.yml path updated in lockstep, and the fixtures' relative resolution (test-file-relative
  HERE) preserved. Confirm the plugin-tree zero-dep test (Phase-16 SC-2) + the cross-tree boundary still hold.
- If a supported exclusion EXISTS -> keep co-located but wire the exclusion + document it.

Either way: extend `eval/lz-eval-packaging-boundary.test.mjs` (the D-11 boundary test) to assert NO
`*.test.mjs` and NO `__fixtures__/` ship under `plugins/lz-advisor/` (a one-directional, discriminating
guard so this cannot silently recur), and record the decision (relocate vs supported-exclude) as a D-NN.

Note: this is a packaging/distribution concern, NOT a build-phase blocker for v2.1.0 -- it can be a
quick-task or folded into the milestone-completion packaging pass. Surfaced 2026-06-17 during the 19-04
artifact review (alongside the dispatch C1 finding). Relates to [[plugin-helper-script-location]] +
[[phase18-eval-zero-dep-relaxed]] (the D-11 packaging-boundary discipline).

## Solution status

TBD -- captured for later; resolve the OPEN QUESTION before choosing relocate-vs-exclude.
