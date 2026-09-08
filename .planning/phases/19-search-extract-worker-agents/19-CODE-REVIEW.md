---
status: fixed
phase: 19
depth: deep
review_method: fan-out probe + adversarial source-verification (Workflow wf_55f31cf4-8d3)
files_reviewed: 14
findings:
  critical: 0
  warning: 6
  info: 5
  total: 11
disposition:
  fixed: 10
  deferred: 1
suite_after: 242 eval/aggregator tests green (201 eval-tree + 41 shipped aggregator), 0 fail
---

# Phase 19 -- gsd-code-review probe (complementary to the lz-review gate)

## Method

This is the cheap complementary one-pass probe the resume handoff scheduled AFTER
the full lz-review gate (groups A/B/C/D1/D2) had already reviewed every plan/wave
and all confirmed fixes were applied. To honor the standing BLOCKING CONSTRAINT
("triage EVERY finding against the ACTUAL source -- the reviewer reasons from
packaged excerpts and misdescribes code; do NOT batch-apply"), the probe was run
as a fan-out workflow where the orchestration ITSELF enforces source-verification:

- **Probe phase** -- 7 reviewer slices (`gsd-code-reviewer` agentType), each one
  OPENING and reading its real module + test together (no packaged excerpts), each
  fenced off from re-litigating the panel-settled design (percent-encoding
  filenames, verbatim store, candidates/ ownership, deferred Phase-20 normalizer).
- **Verify phase** -- every candidate finding faced 3 perspective-diverse skeptics
  (does-the-code-actually-do-this / is-this-settled-design / does-it-reproduce)
  that re-read the real source and DEFAULTED to refuted. Only findings >= 2/3
  skeptics confirmed reached this report.

Result: 7 slices, 11 candidate findings, **all 11 confirmed (0 refuted)** -- a high
confirm rate because the slices targeted unguarded edges + test-discrimination
gaps the gate's test-hardening pass did not reach. 40 agents, ~2.8M subagent
tokens. Each finding below was then re-triaged by the orchestrator against the
real file before any edit; none were misreads.

## Coverage

| Slice | Files (real, read in full) |
|-------|----------------------------|
| search-loop | `eval/lz-eval-search-loop.mjs` + `.test.mjs` |
| dataset | `eval/lz-eval-dataset.mjs` + `.test.mjs` |
| offline-read | `eval/lz-eval-offline-read.mjs` + `.test.mjs` |
| traps | `eval/lz-eval-traps.mjs` + `.test.mjs` |
| aggregate+readjson | `eval/lz-eval-aggregate.mjs` + `.test.mjs`, `eval/lz-eval-readjson.mjs` |
| worker-prompts | `plugins/lz-advisor/agents/research-extract-worker.md`, `research-search-worker.md`, `eval/lz-eval-worker-contract.test.mjs` |
| contracts | `eval/lz-eval-lock-rule.md`, `plugins/lz-advisor/references/lz-deep-research-schema.md` |

Known probe-bugs (from prior passes) re-confirmed fixed: canonicalizeUrl
trailing-slash (correct/intended), case-insensitive denylist, positive-int query
floor, date-range round-trip. No regressions; no Critical findings anywhere.

## Findings + dispositions

All severities below are the adversarial verifiers' corrected (majority) severity.

### FIXED (10)

**#1 [Warning] search-loop exhaustion branch checked only `minDocs`, not `minQueries`.**
`eval/lz-eval-search-loop.mjs`. The in-loop decisive-stop guard requires BOTH
minimums; the exhaustion branch re-checked only `trace.depth >= minDocs`. With a
guard-passing-but-self-contradictory config (`maxQueries < minQueries`, each an
independent positive integer) and `docsSeen >= minDocs`, it emitted an
uphold-adjacent `refuted-default`/`exhausted` when the query floor was structurally
unmeetable -- it should be `insufficient`/`min-not-met`. **Fix:** re-check both
minimums at exhaustion (`trace.queries.length >= minQueries && trace.depth >=
minDocs`); added a discriminating `minQueries:5 > maxQueries:3` test.

**#2 [Info] search-loop "stops AT minQueries" test did not isolate the query floor.**
`eval/lz-eval-search-loop.test.mjs`. The 2-docs/call cadence met `minDocs` and
`minQueries` at the same query, so a `minDocs`-only stub would also pass. **Fix:**
changed the adapter to 5 docs/call so `minDocs` is met at query 1 and stopping at
query 3 can only be the `minQueries` floor. (The dedicated floor test already
covered it; this makes the assertion honest.)

**#3 [Warning] dataset loadManifest never validated `stratum`/`book`.**
`eval/lz-eval-dataset.mjs`. The documented `uid -> {source, stratum, book,
expected_verdict}` contract was enforced only for `uid`+`expected_verdict`; the
test asserting `stratum`/`book` passed only because the committed fixture is
well-formed (tautological). **Fix:** fail-closed validation of `stratum`
(non-empty string) + `book` (`open|closed`) in the loader; added a test feeding
malformed rows to prove the LOADER (not the fixture) fails closed.

**#4 [Info] dataset loadManifest validated `sources[]` is an array but not its entries.**
`eval/lz-eval-dataset.mjs`. A `null`/non-object/missing-id source entry survived
load and would surface later as a native TypeError (e.g. `s.id` in the drift gate)
rather than a diagnosable `ContractError`. **Fix:** iterate `m.sources`, assert
each is a non-null object with a non-empty string `id`; added a test.

**#6 [Warning] traps leakageProbe miscounted an unparseable doc date as a post-cutoff leak.**
`eval/lz-eval-traps.mjs`. The date arm inferred "post-cutoff" from an empty
`dateFilter` result, but the lenient `safeParse` also returns null (-> empty) for
a present-but-unparseable date (`unknown`, a number, an ISO string, out-of-range).
So a malformed date produced a FALSE leak that flips `clean` to false, escalates
to the user, and blocks the manifest lock -- contradicting the function's own
"undated docs are not flagged" contract. **Fix:** exported `safeParse` from the
search-loop module; the date arm now flags ONLY a parseable date that is
`>= claim_date`, treating present-but-unparseable as undated. Added a test (with a
control proving the date arm still flags a genuinely post-cutoff parseable date).

**#7 [Warning] aggregate countFalseUpholds missing-gold guard bypassable by prototype-key vote ids.**
`eval/lz-eval-aggregate.mjs`. `const expected = goldLabels[id]; if (expected ==
null) throw` -- an id equal to an `Object.prototype` member name (`__proto__`,
`toString`, ...) resolves to the inherited member (not null), so the
fail-closed-on-missing-gold contract did NOT fire and the record was silently
skipped. `safeId` lets these ids through (no path separators). **Fix:**
`Object.hasOwn(goldLabels, id)` own-property check; added a `__proto__`/`toString`
test.

**#8 [Warning] SSOT gate did not check the EXTRACT prompt for a bare "SHA-256".**
`eval/lz-eval-worker-contract.test.mjs`. The bare `!/sha-?256/i` negative assertion
applied to SEARCH only; EXTRACT (the sole owner of the sources/ filename rule, the
most likely place for a SHA-256 regression) was checked only by the narrow
"hex"-adjacent form. **Fix:** added `!/sha-?256/i.test(EXTRACT)` (verified the
extract prompt has no SHA token today, so it strictly strengthens the gate).

**#9 [Info] search-loop module comments falsely stated the extract worker "invokes" the SHA-256 filename rule.**
`eval/lz-eval-search-loop.mjs`. Post-panel the shipped extract worker
percent-encodes; the module header/`canonicalizeUrl`/`sourceFilename`/CLI comments
still said the worker uses SHA-256 -- doc-drift against a settled decision that
could lure a maintainer into the exact regression #8 guards. **Fix:** corrected the
prose to state percent-encoding is the worker rule and `sourceFilename()` is a
dev-time hash utility (CLI demo + fixture), not the worker's filename rule. Function
body unchanged; CLI label relabeled `dev-sha256-hash:`.

**#10 [Info] schema's anti-drift self-claim was not enforced against the schema prose.**
`plugins/lz-advisor/references/lz-deep-research-schema.md` + the SSOT gate. The
schema claims the canonical-URL recipe is "kept byte-identical ... by a dev-time
test", but the only test read the two PROMPTS, never the schema -- a schema-only
edit would go uncaught. **Fix (option a, the stronger one):** extended the SSOT
gate to also read the schema and assert every `TRACKING_PARAMS` key + `utm_` +
case-insensitive appears in it -- making the schema's own claim true. (Pinning is
`.includes`-coverage, matching the existing prompt checks -- a pre-existing design
choice of this gate, not literal byte-diff.)

**#11 [Info] search-worker prompt body contradicted its own candidates/ contract.**
`plugins/lz-advisor/agents/research-search-worker.md`. The "Your job" sentence said
"write each candidate as a **source record**", contradicting the description, both
`<example>` blocks, and the rest of the body (search writes `candidates/`, never
`sources/`). Stale pre-panel wording. **Fix:** body now reads "write each distinct
candidate to the run dir's candidates/ list". Per the agent-prompt constraint, the
description + both examples were checked and were already correct (body-only fix).
No SSOT assertion was added because a blanket `!/source record/i` would false-fail
on line 82's correct "authoritative source records" (the extract worker's records).

### DEFERRED (1) -- routed to 19-04 Task-2

**#5 [Warning] offline-read readDelta trusts `nPooled` without cross-checking the realized vote-dir population.**
`eval/lz-eval-offline-read.mjs`. `readDelta` computes `correct = nPooled -
falseUpholds` and feeds passAtK/passHatK; `countFalseUpholds` returns only the
false-uphold count, never the number of vote files actually read. The lone guard
catches only the superset direction (`falseUpholds > nPooled`); an UNDER-filled
vote dir (the normal mid-interruption state for this module's own
persistVote/resumability feature) silently inflates `correct` and over-reports
reliability over a pool the run never completed. **This IS the deferred input-
coherence guard (F3/F4 + D1-17)** the resume handoff explicitly routed to the 19-04
Task-2 gating-read author -- "their semantics live with the gating-read harness +
the realized vote files; not safe to add blindly." The probe independently
re-discovering it corroborates the deferral. NOT fixed here; implement it in the
19-04 harness (cross-validate `nPooled`/`reliableTrials` against the realized
per-seat vote files; D1-10 `persistVote` stop_reason enum alongside).

## Verification

- 242 tests green, 0 fail: 201 eval-tree (`node --test` file-form gate over all 9
  eval `.test.mjs`) + 41 shipped aggregator. +7 new discriminating tests added
  (search-loop exhaustion + safeParse; dataset stratum/book + sources entry;
  aggregate prototype-key; traps unparseable-date) -- each constructed to fail if
  its fix is reverted.
- No shipped runtime module changed behavior except the search-worker prompt body
  (a clarity/contract fix); the plugin tree stays zero-dep + ASCII (verified).
- SSOT worker-contract gate green after the prompt edit (per the agent-prompt
  reconciliation rule).

Full triaged candidate/verdict data: `eval/.cache/probe-result.json` (gitignored).
Workflow transcript: run `wf_55f31cf4-8d3`.
