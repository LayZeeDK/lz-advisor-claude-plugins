---
phase: 23-judge-free-confidence-and-operating-envelope-for-lz-deep-res
plan: 03
subsystem: testing
tags: [env-04, citation-audit, canonicalization, ssrf-controls, resolvability, node-test, dry-run]

# Dependency graph
requires:
  - phase: 23-01
    provides: "the canonicalizeCitation thin slice, the three frozen normalization constants, and both validating q1 MANIFESTs"
  - phase: 23-02
    provides: "the frozen-constants + guarded-CLI module idiom and the four-deviation recording convention"
provides:
  - "the complete offline ENV-04 citation audit: token extraction, identifier canonicalization, quote normalization and match, structural citation-coverage counting, and a descriptive CLI"
  - "the ENV-04 live half as a separate injected-fetcher module carrying the eval tree's first outbound network controls"
  - "a published, explicitly not-bar-setting ENV-04 reading over the q1 pair, with the D-21 discrepancy recorded side by side"
  - "a third frozen-record correction for the 23-04 freeze: 69 markers / 13 unique marker VALUES / 18 unique canonical sources are three different measurements"
affects: [23-04, 23-07, 23-09]

actuals:
  tokens: 58680
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "the offline half's whole co-test runs with the global fetch replaced by a throwing stub, which is the reproducibility proof"
    - "network controls proven at each frozen limit AND one step either side, with a call-log assertion that a blocked target is never requested"
    - "commit ordering as a verifiable control: rules land before rates, checkable from git ancestry alone"

key-files:
  created:
    - eval/lz-eval-p23-resolvability.mjs
    - eval/lz-eval-p23-resolvability.test.mjs
    - eval/lz-eval-p23-citation-audit-q1-dryrun.md
  modified:
    - eval/lz-eval-p23-citation-audit.mjs
    - eval/lz-eval-p23-citation-audit.test.mjs
    - .github/workflows/ci.yml

key-decisions:
  - "The built-in q1 report audits to 18 unique canonical sources, not the 13 the plan predicted: 13 is 23-RESEARCH's count of unique surface MARKER VALUES, not of canonical identifiers. The frozen rule was implemented as written and the number was measured; the rule was NOT contorted to reach 13."
  - "The D-21 correction is therefore TWO corrections, recorded side by side and not reconciled: 26 markers -> 69 markers, and '13 unique sources' -> a mislabel of the marker-value column against 18 canonical sources."
  - "checkResolvability takes a fourth injected parameter (delay) beyond the plan's three, so the frozen 10000 ms deadline can be raced and asserted without a ten-second test. TIMEOUT_MS stays 10000 and the test asserts the raced value IS 10000."
  - "The frozen q1 quote population for the lz-only diagnostic is every double-quoted span of >= 4 chars in the lz report's sections (b) and (c); the legend (d) and bibliography (e) are excluded because (d)'s quoted strings are the report's own legend questions, not source quotes."
  - "The one-off dry-run driver is deliberately NOT committed: D-18 forbids designing in a permanent one-sided metric, and every figure it produced comes from the committed audit functions."

patterns-established:
  - "Pattern 1: a metric's frozen rules land in their own commit, and the first commit containing a computed rate lands strictly after, so freeze-before-measurement is checkable from git rather than asserted."
  - "Pattern 2: a structural count carries its own semantic disclaimer in its output (citationCoverage.label), so a downstream reader cannot relabel it as factual support."
  - "Pattern 3: the unmatched-token bucket is a REPORTED output, never a silent drop, because a silent drop is how a format-sensitive metric hides."

requirements-completed: []

coverage:
  - id: D1
    description: "The complete offline ENV-04 citation audit: extraction with fenced-code stripping and bibliography marker resolution, format-agnostic canonicalization, quote normalization and matching, structural citation-coverage counting, and a descriptive CLI emitting raw integers only"
    requirement: "ENV-04"
    verification:
      - kind: unit
        ref: "eval/lz-eval-p23-citation-audit.test.mjs (29 cases)"
        status: pass
      - kind: unit
        ref: "node eval/lz-eval-p23-citation-audit.mjs eval/.cache/p22-baseline/builtin/qB1-run1.report.md -> exit 0"
        status: pass
    human_judgment: false
  - id: D2
    description: "The offline half is provably network-free: the entire co-test runs with the global fetch replaced by a throwing stub"
    requirement: "ENV-04"
    verification:
      - kind: unit
        ref: "eval/lz-eval-p23-citation-audit.test.mjs#ENV-04: the whole offline audit runs with the global fetch stubbed to throw (network-free proof)"
        status: pass
    human_judgment: false
  - id: D3
    description: "The format unification is asserted, not assumed: arxiv:2306.15595 is in the canonical identifier set of BOTH q1 reports, from a bare identifier in prose on one side and an inline URL on the other"
    requirement: "ENV-04"
    verification:
      - kind: unit
        ref: "eval/lz-eval-p23-citation-audit.test.mjs#D-13 UNIFICATION: arxiv:2306.15595 is in the canonical identifier set of BOTH q1 reports"
        status: pass
    human_judgment: false
  - id: D4
    description: "The unique-source count is the identifier-set cardinality and NOT a surface-marker count: pinned at 18, asserted not to equal the 69 total markers nor the 13 unique marker values"
    requirement: "ENV-04"
    verification:
      - kind: unit
        ref: "eval/lz-eval-p23-citation-audit.test.mjs#D-13/D-21 DISCRIMINATION: the built-in unique-source count is the identifier-set cardinality, NOT a surface-marker count"
        status: pass
    human_judgment: false
  - id: D5
    description: "The ENV-04 live half: a separate injected-fetcher module with a frozen http/https allowlist re-validated on every hop, a 3-hop cap, a 10000 ms raced deadline, a 262144-byte read cap, no credentials, and an exact five-key record"
    requirement: "ENV-04"
    verification:
      - kind: unit
        ref: "eval/lz-eval-p23-resolvability.test.mjs (14 cases, all against stub fetchers)"
        status: pass
    human_judgment: false
  - id: D6
    description: "Both ENV-04 test files run in CI in the explicit FILE form, exactly once each, with all prior entries kept and no coverage thresholds added"
    verification:
      - kind: other
        ref: "non-comment scan of .github/workflows/ci.yml asserting both entries appear exactly once and all 11 eval entries are present in order"
        status: pass
    human_judgment: false
  - id: D7
    description: "The published q1 dry run: per-system readings, the lz-only quote-match diagnostic, the dated resolvability breakdown, the D-21 correction side by side, the coverage-not-support labelling, and the full contamination disclosure"
    requirement: "ENV-04"
    verification:
      - kind: other
        ref: "rg -q -F -e '## Review record' -e '## Contamination disclosure' -e 'not-bar-setting' -e 'citation COVERAGE' eval/lz-eval-p23-citation-audit-q1-dryrun.md"
        status: pass
    human_judgment: true
    rationale: "The binding properties are WORDING properties -- one row per system with no combined rate, coverage never worded as support, resolvability never worded as source quality, not-bar-setting labelling, and the discrepancy shown rather than reconciled. A grep proves only that a particular word is absent. The record carries a ## Review record naming these four properties and has had ONLY executing-session review; the ENV-08 content review is the honest verification."

duration: 41 min
completed: 2026-09-07
status: complete
---

# Phase 23 Plan 03: ENV-04 Citation Audit and the q1 Dry Run Summary

**A deterministic, format-agnostic, provably network-free citation audit plus an isolated injected-fetcher resolvability module, proven on the real q1 pair and published as an explicitly not-bar-setting dry run that corrects a frozen record twice over.**

## Performance

- **Duration:** 41 min
- **Started:** 2026-09-07T12:05:00Z
- **Completed:** 2026-09-07T12:46:00Z
- **Tasks:** 3
- **Files modified:** 6 (3 created, 3 modified)

## Accomplishments

- The offline ENV-04 audit is complete and format-agnostic. `arxiv:2306.15595` lands in the canonical identifier set of BOTH q1 reports -- from a bare identifier in prose on the built-in side and an inline URL on the lz side -- which is the proof the canonicalization unifies the two formats rather than the hope that it will.
- The offline half is **provably network-free**: its entire co-test runs with the global fetch replaced by a throwing stub and still exits 0. That is the strongest available guarantee the offline rates are reproducible.
- The eval tree's first outbound network surface exists as a **separate** module with an injected fetcher, frozen limits proven at each boundary and one step either side, and an exact five-key record so no response body can reach the output.
- A real ENV-04 reading now exists on the q1 pair, published, labelled not-bar-setting in the title and the opening paragraph. The phase's floor is materially higher: this reading survives even if the ENV-05 spike never clears.
- A third frozen-record discrepancy is recorded rather than reconciled -- and it turned out to be **two** corrections, one of which the plan itself carried.
- 225/225 registered eval tests green (was 191/191; +34 new cases). Both ENV-04 test files run in CI.

## Task Commits

Each task was committed atomically, in the plan's order, which is itself the control:

1. **Task 1: Complete the offline citation audit on frozen normalization rules** - `2cb5133` (feat)
2. **Task 2: The live resolvability half with the tree's first network controls** - `fcc206c` (feat)
3. **Task 3: Run and publish the D-20 q1 dry run** - `3189239` (docs)

### Commit-ordering check (run explicitly, as required)

```
2cb513349c59bdb58f0e110f386f4616e5476689 2026-09-07T14:26:29+02:00 feat(23-03): complete the offline ENV-04 citation audit on frozen rules
fcc206c992ca91ccf46af96b69ca2e73bb561f6c 2026-09-07T14:30:59+02:00 feat(23-03): add the ENV-04 live resolvability half with the tree's first network controls
3189239ee7dd094e0a2bde3db418292a2e1b4750 2026-09-07T14:36:06+02:00 docs(23-03): publish the D-20 q1 citation-audit dry run, not-bar-setting
```

The rate-computing commit is strictly after both rule commits, so the frozen-before-any-rate claim is checkable from ancestry alone.

**One nuance 23-04 must state accurately rather than overstate.** What is provably absent before `3189239` is every RATIO -- citation coverage, quote match, resolvability. It is not every integer: the built-in's 18-unique-source figure is pinned in the Task-1 co-test, because Plan 23-03's own Task-1 acceptance criterion required that count to be asserted there ("The built-in q1 report audits to N unique canonical sources... assert the value is NOT 69"). The discrimination assertion cannot exist without the number. Claiming "no measured figure precedes the freeze" would be a stronger claim than git supports; claiming "no computed rate precedes it" is exactly true.

## Files Created/Modified

- `eval/lz-eval-p23-citation-audit.mjs` - Expanded from the 23-01 tracer to the full offline audit: `UNCITED`, `extractCitationTokens`, `normalizeForQuoteMatch`, `quoteMatches`, `countUncitedUnits`, `auditReport`, guarded CLI. `ARXIV_RE` and `DOI_RE` are now `Object.frozen` alongside `KEEP_PARAMS` and `UNCITED`. The 23-01 header, constants and `canonicalizeCitation` are unchanged.
- `eval/lz-eval-p23-citation-audit.test.mjs` - 29 cases, all under a throwing global-fetch stub.
- `eval/lz-eval-p23-resolvability.mjs` - The live half: `SCHEME_ALLOWLIST`, `RESOLVE_LIMITS`, `RESOLVE_OUTCOMES`, `checkResolvability`, guarded CLI writing a dated envelope.
- `eval/lz-eval-p23-resolvability.test.mjs` - 14 cases, every one driven by a stub fetcher; no real request.
- `eval/lz-eval-p23-citation-audit-q1-dryrun.md` - The committed D-20 dry-run record (279 lines).
- `.github/workflows/ci.yml` - Registers `eval/lz-eval-p23-resolvability.test.mjs`; the citation-audit entry was confirmed already present from Plan 23-01 rather than duplicated. Eleven eval entries, explicit FILE form, no coverage thresholds.

Written into gitignored `eval/.cache/p23-read/` (exactly three files, as required):
`citation-audit-q1-builtin.json`, `citation-audit-q1-lz.json` (carrying the frozen quote population and the excerpt-file list), `resolvability-q1.json` (the dated envelope). None contains excerpt or response-body text.

## The measured readings

### Audit CLI output, verbatim

```
$ node eval/lz-eval-p23-citation-audit.mjs eval/.cache/p22-baseline/builtin/qB1-run1.report.md
sources=18 unmatched=3 markers=69/13 uncited-units=19/43

$ node eval/lz-eval-p23-citation-audit.mjs eval/.cache/p22-baseline/lz/qB1-run1.report.md
sources=12 unmatched=0 markers=0/0 uncited-units=30/64
```

Both exit 0.

### Per system, never averaged

| Metric | built-in q1 | lz q1 |
|---|---|---|
| Unique canonical sources | 18 | 12 |
| Unmatched tokens (reported bucket) | 3 (`marker:[16]`, `marker:[17]`, `marker:[19]`) | 0 |
| Surface `[n]` markers (total / unique values) | 69 / 13 | 0 / 0 |
| Uncited text units (citation COVERAGE, not support) | 19 of 43 | 30 of 64 |
| Verbatim-quote match | not computable (no retained corpus) | 3 of 5 -- SINGLE-SYSTEM diagnostic |

### The 13-versus-69 discrimination result

The plan asked for a discrimination proof that the unique-source count is not the surface-marker count. The implementation returns **18** unique canonical sources against **69** total surface markers and **13** unique marker values, and the co-test asserts all three plus the two inequalities. Observed numbers, all recorded as required:

- 69 -- total `[n]`-shaped surface markers in the built-in report
- 13 -- distinct marker VALUES (`[1]`-`[10]` plus `[16]`, `[17]`, `[19]`)
- 10 -- bibliography entries, i.e. markers that resolve to an identifier
- 18 -- cardinality of the canonical identifier set (16 arXiv identifiers plus two URL identifiers)

### Resolvability, checked 2026-09-07T12:33:22.655Z

One live run over the 26-identifier union of both reports' canonical sets (the two sets share 4 identifiers). This was the plan's only network access.

| Outcome | Union (26) | built-in (18) | lz (12) |
|---|---|---|---|
| resolvable | 23 | 17 | 10 |
| oversize | 3 | 1 | 2 |
| dead / timeout / scheme-blocked / redirect-limit / network-error | 0 | 0 | 0 |

The three oversize outcomes are a PDF (`attention-survey.github.io/files/Attention_Survey.pdf`), a GitHub repo page and `trychroma.com/research/context-rot` -- the 262,144-byte read cap firing, **not** dead links. Two identifiers were reached through a redirect, each hop re-validated. The named limitation (this check does not distinguish never-existed from died-since) travels in the envelope's `limitation` field and is on the record.

## Discrimination proofs (run, with failure output recorded)

Per the project convention: a green test alone proves nothing; the fix must be disabled and the test must fail.

1. **Remove the bare-arXiv-in-prose scanner from the body scan** (the built-in's only citation form): `27 pass / 2 fail` -- the 18-source discrimination case fails. The unification case still passed on this cut, because the bibliography resolver reaches the same identifier by a second path.
2. **Also remove bare-arXiv handling from the bibliography resolver** (a fully URL-counting-shaped, format-sensitive implementation): `23 pass / 6 fail` -- the both-reports unification case now fails too. A format-sensitive implementation cannot pass the file.
3. **Weaken the network controls** (validate-after-fetch, hop cap +1, byte cap +1): `11 pass / 3 fail` -- the scheme-blocked-never-fetched call-log assertion, the redirect-hop boundary and the byte-cap boundary all fail.

All three cuts were reverted and the suites re-run green before committing.

## Verification

| Check | Result |
|---|---|
| `node --test eval/lz-eval-p23-citation-audit.test.mjs eval/lz-eval-p23-resolvability.test.mjs` | 43/43 pass, exit 0 |
| Citation-audit file passes with the global fetch stubbed to throw | pass (the stub is installed for the whole file) |
| `node --test eval/lz-eval-packaging-boundary.test.mjs` | 2/2 pass |
| Full registered eval suite (11 files, explicit FILE form) | 225/225 pass, exit 0 |
| `git log` shows the module commit strictly before the record commit | confirmed (14:26:29 -> 14:36:06) |
| `.planning/notes/phase-22-diagnosis-two-root-causes.md` unmodified | confirmed, `git status` clean for that path |
| `git diff .planning/config.json .planning/STATE.md` empty before staging | confirmed before every task commit |
| ASCII / LF / no BOM on all four source files and the record | confirmed (0 non-ASCII bytes; every Unicode fold character written as an escape) |
| `eval/.cache/p23-read/` holds exactly the three required outputs | confirmed |
| ci.yml registers both ENV-04 files exactly once, 11 entries, FILE form, no thresholds | confirmed by a non-comment scan |

## Decisions Made

- **18, not 13.** The frozen rule was implemented as 23-RESEARCH states it and the count was then measured. Bending the extraction to reach the plan's predicted 13 would have been precisely the rule-tuned-to-a-number the phase's whole commit-ordering control exists to prevent.
- **The one-off dry-run driver is not committed.** D-18 says not to design in a permanent one-sided metric; a committed lz-only quote-match driver would be exactly that. Every figure came from the committed `auditReport`; the driver only selected inputs.
- **Quote population frozen and stated on the artifact.** Sections (b) and (c) only. Including the legend's own quoted questions would have depressed the figure by a definitional artifact rather than a measurement.
- **Any non-2xx is `dead`, including 5xx.** ENV-04 needs "did a request come back"; splitting server errors from client errors would add an outcome nothing consumes.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug in the plan's asserted ground truth] The 13-unique-canonical-sources acceptance criterion is factually wrong**

- **Found during:** Task 1 (offline audit), at first measurement
- **Issue:** The plan's Task-1 acceptance criterion and truth list both state the built-in q1 report "audits to 13 unique canonical sources", and D-21 in 23-CONTEXT.md words the same figure as "69 markers / 13 unique sources". On disk, 13 is the count of unique surface MARKER VALUES -- 23-RESEARCH's own table labels that column "numbered ref markers `[n]` (total / unique)". No principled rule yields 13 canonical identifiers: resolving markers through the bibliography gives 10, and adding the report's own "Consulted (fetched...)" bare arXiv identifiers gives 18. 13 is not reachable, and it is not a source count.
- **Fix:** Implemented the frozen rule as 23-RESEARCH states it, measured 18, and recorded the discrepancy in three places rather than reconciling it -- the co-test (with a comment naming the mislabel), the committed dry-run record (side by side with the diagnosis note's superseded 26/10), and this SUMMARY. The discrimination intent is preserved and strengthened: the count is asserted NOT to equal 69 AND NOT to equal 13, which is a stricter check than the plan asked for.
- **Files modified:** eval/lz-eval-p23-citation-audit.test.mjs, eval/lz-eval-p23-citation-audit-q1-dryrun.md
- **Verification:** 29/29 pass; the two inequality assertions fail on both format-sensitivity cuts above
- **Committed in:** `2cb5133` (Task 1) and `3189239` (Task 3)

**2. [Rule 3 - Blocking] `checkResolvability` needed a fourth injected parameter to make the frozen deadline testable**

- **Found during:** Task 2 (live resolvability)
- **Issue:** The plan specifies `checkResolvability({ identifiers, fetchImpl, now })` and an acceptance criterion requiring a stub that never settles to time out at `TIMEOUT_MS`. With the deadline hard-wired to a real timer, that single case takes 10 seconds in CI, and the only alternatives were weakening the frozen constant or accepting an untested timeout.
- **Fix:** Added `delay` as a fourth injected parameter defaulting to an unreferenced `setTimeout`. `RESOLVE_LIMITS.TIMEOUT_MS` stays frozen at 10000, and the test asserts the value actually raced IS 10000 -- a stronger assertion than a wall-clock wait, which would only have shown that something eventually fired.
- **Files modified:** eval/lz-eval-p23-resolvability.mjs, eval/lz-eval-p23-resolvability.test.mjs
- **Verification:** 14/14 pass; `deadlines` deep-equals `[10000]`
- **Committed in:** `fcc206c` (Task 2)

---

**Total deviations:** 2 auto-fixed (1 plan-ground-truth correction, 1 blocking testability fix)
**Impact on plan:** No scope change and no scope reduction. Every artifact, export and acceptance property the plan named was delivered; one predicted VALUE was wrong and is recorded rather than reconciled, and one signature gained a fourth injected parameter of the same dependency-injection kind as the three the plan specified.

## Issues Encountered

- **A test assertion I wrote was wrong about its own boundary.** The 4-redirect case asserts how many requests are issued; I wrote 3 and the correct answer is 4 (hops 0-3 are requested, and the FOURTH redirect's target is never fetched). Corrected with an added assertion pinning the last URL requested, which is the property that actually matters.
- **The Unicode fold characters reached the source as literals** through the editing tool despite being intended as escapes. Caught by a byte scan, converted with a small non-committed script, and re-verified: 0 non-ASCII bytes across all four source files and the record. The project's ASCII rule needs a byte check, not an intention.
- **`gsd-tools` shim resolution.** `gsd-core/bin/gsd-tools.cjs` does not exist in this repo; the user-scope path works. `roadmap.update-plan-progress 23` was clean for the third consecutive wave and `state.update-progress` was deliberately never called.

## Review record status (project review-before-publish MUST)

`eval/lz-eval-p23-citation-audit-q1-dryrun.md` carries a `## Review record` section naming four content properties it must be reviewed against: per-system-only with no combined rate, coverage-never-worded-as-support (and resolvability never as source quality), not-bar-setting labelling in title and opening paragraph, and the D-21 discrepancy shown side by side.

**Status: OPEN.** Reviewed for content by the executing session only; no independent review. Reviewer and date to be recorded here when the ENV-08 content review completes. The two new `.mjs` modules and both co-tests are scripts under the same rule and have likewise had only executing-session review.

## User Setup Required

None - no external service configuration required. The one live network run is complete and dated.

## Next Phase Readiness

Wave 4 (`23-04`, the ENV-01 freeze) is the next plan and remains the hard gate: blocking-human, exactly 3 files, its own timestamped commit, and no capture, vote or score before it lands. From this wave it must record:

- The frozen normalization constants (`ARXIV_RE`, `DOI_RE`, `KEEP_PARAMS`, `UNCITED`) and the frozen network limits (`SCHEME_ALLOWLIST`, `RESOLVE_LIMITS` = 10000 / 262144 / 3).
- The realized dry-run figures: 18 and 12 unique canonical sources, 19-of-43 and 30-of-64 uncited units, the lz-only 3-of-5 quote match, and the dated resolvability breakdown (23 resolvable / 3 oversize / 0 dead as of 2026-09-07T12:33:22.655Z).
- **The 69 / 13 / 18 correction, quoting 18 and NOT 13**, with the mislabel called out and the diagnosis note's superseded 26 / 10 shown beside it.
- The rate-free-ancestry nuance stated accurately: no computed RATE precedes the freeze; the 18-source integer is pinned in `2cb5133` because the plan's own Task-1 criterion put it there.

Open items carried forward, none blocking this plan:

- The dry-run record's independent content review (ENV-08).
- The 23-02 voter prompt template still needs quoting or sha256-pinning in 23-04; untouched here as instructed.
- `requirements-completed` is deliberately empty: ENV-04's bar is set on the fresh q2 pair in 23-07, and this dry run explicitly does not set it.

## Self-Check: PASSED

- All 7 tracked key-files present on disk (`[ -f ]` each), plus the three required outputs in `eval/.cache/p23-read/`.
- All four commits resolve in `git log --all`: `2cb5133`, `fcc206c`, `3189239`, `ba293b0`.
- Every task `<acceptance_criteria>` re-run and passing; plan-level `<verification>` block re-run in full (see the Verification table).
- `.planning/notes/phase-22-diagnosis-two-root-causes.md` clean; `git diff .planning/config.json` empty.
- One open item appended to the cross-phase defect ledger `.planning/WINDOWS.md` (kind `deviation`): the independent content review of the dry-run record and the two new modules.

---
*Phase: 23-judge-free-confidence-and-operating-envelope-for-lz-deep-res*
*Completed: 2026-09-07*
