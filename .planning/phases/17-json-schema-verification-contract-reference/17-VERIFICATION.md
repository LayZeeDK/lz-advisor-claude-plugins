---
phase: 17-json-schema-verification-contract-reference
verified: 2026-06-15T00:00:00Z
status: passed
score: 11/11 must-haves verified
overrides_applied: 0
re_verification:
  previous_status: none
  previous_score: none
  note: "Initial verification. Code review (17-REVIEW.md) raised BLOCKER CR-01 prior to this run; CR-01 was resolved by the contested-split fixture upgrade (cluster0-2.json added, retargeting the fixture to 2-unrefuted/1-refuted). Verified independently here."
---

# Phase 17: JSON Schema / Verification Contract Reference Verification Report

**Phase Goal:** A single reference file freezes the JSON shapes (source / claim / vote / excerpt), the tally rubric that maps vote tallies to the confidence enum, the quote-recheck contract, the named ceilings as a contract, and the two distinct assurances -- so the aggregator, the Phase-18 eval harness, and all worker agents commit to identical shapes before any agent is authored.
**Verified:** 2026-06-15
**Status:** passed
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
| -- | ----- | ------ | -------- |
| 1  | (SC-1) `references/lz-deep-research-schema.md` exists and defines the JSON schemas for source, claim, vote, and stored-excerpt records, each consistent with what the Phase-16 aggregator reads and writes. | VERIFIED | File present (500 lines). Source record (lines 85-120), claim record (122-155), vote record (174-213), stored-excerpt (157-172). Cross-checked against the aggregator: run-dir reads in `mergeClusters`/`loadExcerpts`/`tally`, survivor map at `.mjs:531-538`. Field names snake_case byte-for-byte. |
| 2  | (SC-2) The tally rubric is written down and maps every possible vote tally to exactly one confidence level from the frozen enum, with refuted = downgrade-not-delete unless explicit refutation. | VERIFIED | Tally rubric (doc lines 263-302) renders the 5 ordered Option I branches + an 8-row truth table covering every readable tally. "Downgrade-not-delete" stated at doc:285-289; the tally NEVER removes a claim. Matches `.mjs` tally() lines 487-503. |
| 3  | (SC-3) The schema mandates that every claim record carries a confidence-level field. | VERIFIED | Survivor record `confidence` field (doc:402, "Mandated on every survivor record (SC-3)"); report claim record carries `confidence` (doc:435, "Every report claim record structurally carries a `confidence` field (SC-3)"). |
| 4  | (SC-4) The reference defines "quote verified verbatim" (`quote_fidelity`) and "claim supported by the quote" (`claim_support`) as two SEPARATE assurance fields. | VERIFIED | Two-assurances section (doc:326-377): Assurance 1 `quote_fidelity` (aggregator/mechanical), Assurance 2 `claim_support` (voter/judgment). Worked example (doc:359-370) shows `quote_fidelity: verified` coexisting with `claim_support: unsupported` in ONE record; orthogonality regex matches (1 hit). "NEVER conflated or derived one from the other" at doc:328-330, 347-349. |
| 5  | (focus) The aggregator `tally()` emits ONLY {High, Medium, Low, Contested, Unsupported}; 'Rejected' and 'Low/Contested' appear nowhere in the `.mjs` or `.test.mjs`. | VERIFIED | `git grep "Rejected"` and `git grep "Low/Contested"` over both files return zero. tally() returns only the five canonical strings (`.mjs:487-503`). |
| 6  | (focus) The Contested split branch (`unrefuted >= 1 && refuted >= 1`) is ordered BEFORE the `unrefuted === 2` Medium branch. | VERIFIED | `.mjs:495` (Contested split) precedes `.mjs:499` (Medium). Confirmed by line-number ordering via `git grep`. |
| 7  | (focus) A 3/3-refuted claim resolves to 'Low' AND remains in survivors (downgrade-not-delete, D-03b). | VERIFIED | `low-refuted-downgraded` fixture has 3x `{"verdict":"refuted"}` seats (0 uphold). Test at `.test.mjs:111-118` asserts `confidence === 'Low'` AND `survivors.length === 1`. Suite green. |
| 8  | (focus) The node:test suite passes (FILE form) with >=17 tests (target 19), 0 fail, each of the five tiers exercised. | VERIFIED | `node --test <file>` exit 0: tests 19, pass 19, fail 0. Per-tier assertions: Medium (`.test.mjs:96`), Low-thin (104), Low-refuted (111), Contested (120), Unsupported (131); High via SC5-4 (81). |
| 9  | (focus) Survivor record field set `{id, claim, sources, corroboration_lower_bound, quote_fidelity, confidence}` frozen byte-for-byte; VERIF-06 worked example present; no Rejected/Low-Contested/report_confidence/$schema/ajv; pure ASCII. | VERIFIED | Doc survivor record (lines 384-392, 395-402) matches aggregator survivor map (`.mjs:531-538`) byte-for-byte. Forbidden-token grep over the doc returns zero for Rejected/Low/Contested/report_confidence; `$schema`/`ajv` scan returns no matches. |
| 10 | (focus) All edited/new files are pure ASCII. | VERIFIED | `rg -n "[^\x00-\x7F]"` over the `.mjs`, `.test.mjs`, the five new fixture trees, the reference doc, and the reconciled `16-01-SUMMARY.md` returns no matches (exit 1). Fixture EOL is `i/lf w/lf`. |
| 11 | (focus / 17-REVIEW) BLOCKER CR-01 (contested-split fixture could not catch the branch-ordering regression) resolved by the fixture upgrade to 2-unrefuted/1-refuted. | VERIFIED | `contested-split/votes/`: cluster0-0 `unrefuted`, cluster0-1 `refuted`, cluster0-2 `unrefuted` (= 2 unrefuted / 1 refuted, the discriminating case). `cluster0-2.json` tracked LF. Test comment (`.test.mjs:120-129`) updated to state the 2/1 discriminating semantics. A swapped Medium-first rubric would now return Medium and fail this test. |

**Score:** 11/11 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | -------- | ------ | ------- |
| `plugins/lz-advisor/references/lz-deep-research-schema.md` | The frozen data-contract schema (all records + survivor + report claim, tally rubric, enum, two assurances, ceilings, quote-recheck, anti-drift) | VERIFIED | 500 lines, pure ASCII. Contains `claim_support` (12 hits) and `quote_fidelity` (14 hits). Fifth file in `references/`. All Plan 17-02 acceptance criteria met. |
| `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs` | Corrected tally() Option I rubric + 5-label stdout + updated doc-comment | VERIFIED | tally() emits the 5-tier enum (lines 487-503); Contested split precedes Medium; 5-label stdout (lines 569-579); doc-comment (lines 427-435) describes Option I. `return 'Contested'` present. |
| `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs` | Per-tier branch assertions + 5-label stdout assertion + corrected enum comment | VERIFIED | Enum comment corrected to `{High, Medium, Low, Contested, Unsupported}` (lines 11-12); per-tier tests + 5-label stdout test present; forbidden tokens assembled from fragments so the file is grep-clean. |
| `__fixtures__/contested-split/votes/cluster0-1.json` (+ cluster0-0, cluster0-2) | A refuted seat alongside unrefuted seats to exercise the Contested split | VERIFIED | cluster0-1 `refuted`, cluster0-0 + cluster0-2 `unrefuted`. The split is genuinely encoded at the discriminating 2/1 tally. |
| `.planning/phases/16-.../16-01-SUMMARY.md` | Forward-pointing note reconciled to corrected enum + new reference | VERIFIED | SUPERSEDED-IN-PART banner (line 89) names `High | Medium | Low | Contested | Unsupported`, cites `lz-deep-research-schema.md` as the new authority + the corrected aggregator; `Rejected`/`Low/Contested` framed only as dated as-shipped history. |

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | -- | --- | ------ | ------- |
| `.test.mjs` per-tier tests | `.mjs tally()` | `aggregate(fx(<tier>))` asserting `survivors[0].confidence` | WIRED | Each of the five tiers has a passing assertion against tally() output. Suite green at 19 tests. |
| tally() decision block | Contested split ordering | split branch placed BEFORE Medium branch | WIRED | `.mjs:495` precedes `.mjs:499`; verified by line ordering. |
| `lz-deep-research-schema.md` | aggregator (aggregate/tally/quoteOutcome/recheckClusters/CEILINGS) | verbatim freeze + cited functions + line anchors (D-12) | WIRED | Anti-drift section (doc:29-61) names all authoritative functions; CEILINGS copied verbatim (doc:442-449) matching `.mjs:115-121`; survivor record matches `.mjs:531-538`. |
| `lz-deep-research-schema.md` | VERIF-06 worked example | `quote_fidelity: verified` with `claim_support: unsupported` | WIRED | One record block (doc:359-370); orthogonality regex matches. |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| Aggregator test suite passes (the phase gate) | `node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs` | tests 19, pass 19, fail 0, exit 0 | PASS |
| No spike tokens in aggregator/test | `git grep "Rejected" / "Low/Contested"` over `.mjs` + `.test.mjs` | zero hits | PASS |
| Contested split precedes Medium | line-number ordering of the two branches in tally() | 495 < 499 | PASS |
| 3/3-refuted survives at Low | `low-refuted-downgraded` votes + test assertion | 3x refuted; `survivors.length === 1`, `confidence === 'Low'` | PASS |
| Reference doc has no forbidden tokens / validator | `git grep Rejected|Low/Contested|report_confidence` + `rg $schema|ajv` | zero hits | PASS |
| VERIF-06 orthogonality in one block | `rg -U "quote_fidelity...verified...claim_support...unsupported"` | 1 match | PASS |
| Pure ASCII across all edited/new files | `rg -n "[^\x00-\x7F]"` over .mjs, .test.mjs, 5 fixtures, doc, 16-01-SUMMARY | no matches | PASS |

### Probe Execution

| Probe | Command | Result | Status |
| ----- | ------- | ------ | ------ |
| n/a | -- | This phase declares the node:test FILE-form suite as its gate, not a `scripts/*/tests/probe-*.sh` probe. The suite was executed above (Behavioral Spot-Checks). | N/A |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ----------- | ----------- | ------ | -------- |
| PIPE-07 | 17-01, 17-02 | Every reported claim carries a confidence level (High / Medium / Low / Contested / Unsupported). | SATISFIED | Aggregator tally() emits the 5-tier enum (`.mjs:487-503`); schema mandates `confidence` on every survivor + report claim record (doc:402, 435). REQUIREMENTS.md line 111 marks Phase 17 Complete. |
| VERIF-06 | 17-02 | The report distinguishes "quote verified verbatim" from "claim supported by the quote" as two separate assurances. | SATISFIED | Schema defines `quote_fidelity` (mechanical/aggregator) and `claim_support` (judgment/voter) as orthogonal fields with a worked example showing them coexisting (doc:326-377). REQUIREMENTS.md line 112 marks Phase 17 Complete. |

No orphaned requirements: REQUIREMENTS.md maps exactly {PIPE-07, VERIF-06} to Phase 17 (line 147), both declared in the PLAN frontmatter, both verified above.

### Data-Flow Trace (Level 4)

This phase delivers a markdown contract reference plus a deterministic aggregator correction. There is no dynamic data-rendering UI; the runnable artifact (the aggregator) is exercised end-to-end by the node:test suite, which feeds real committed fixture run-dirs through `aggregate()` and asserts the emitted survivor records. Data flow (claims/excerpts/votes -> mergeClusters -> recheckClusters -> tally -> survivor records) is confirmed FLOWING by the 19 passing assertions (no static/hollow returns; the summary is computed from real per-fixture inputs).

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| (none) | -- | No TBD/FIXME/XXX debt markers; no TODO/HACK/PLACEHOLDER; no stub returns in phase-17 files | -- | Clean. The grep matches for `return ''` / `return null` in normalize()/safeId are intentional fail-soft/fail-closed paths, not stubs (covered by the WR-* tests). |

### Code-Review Carry-Over (17-REVIEW.md)

The standard code review (17-REVIEW.md, status `issues_found`) raised one BLOCKER and four lower findings. Disposition verified here:

- **CR-01 (BLOCKER) -- RESOLVED.** The contested-split fixture was upgraded in place to 2-unrefuted/1-refuted (cluster0-2.json added), so the test now actively discriminates the branch-ordering invariant. Suite is 19 tests (was 19 already per 17-01-SUMMARY; the fixture content was corrected, not the count). Verified independently above (Truth 11).
- **WR-01 (WARNING) -- NOT addressed; not goal-blocking.** `claims[].id` is declared `Required: yes` in the schema (doc:147) but `mergeClusters` does not fail-closed on a missing id (only text/quote/source are guarded). The latent path is masked at runtime by the cluster-id-first vote lookup. This is a doc/code consistency nuance, not a Success-Criteria item; the four SCs and both requirements are independently satisfied. Recorded as a quality follow-up, not a phase gap.
- **WR-02 (WARNING) -- effectively addressed.** The CR-01 fixture upgrade made the "fires before the Medium branch" framing accurate (the fixture is now 2/1, so the Medium branch DOES evaluate and is overridden by the earlier Contested branch). The test comment at `.test.mjs:120-129` was rewritten to state the discriminating semantics.
- **IN-01 (INFO) -- NOT addressed; cosmetic.** The `recheckClusters` doc comment (`.mjs:335`) remains a garbled sentence ("verified unless ALL kept members are 'downgraded' is false"). The CODE is correct (`hasVerified ? 'verified' : 'downgraded'`, line 367); only the comment is awkward. No behavioral impact.
- **IN-02 (INFO) -- NOT addressed; optional.** Per-tier tests do not additionally assert `quote_fidelity === 'verified'`. The behavior is correct today and the upstream drop is covered by SC5-1. Optional hardening.

None of the unaddressed items (WR-01, IN-01, IN-02) block the phase goal: all four ROADMAP Success Criteria, both requirements, and every load-bearing focus must-have are independently VERIFIED against the codebase.

### Human Verification Required

None. The phase output is a deterministic aggregator plus a prose contract reference; both were verified programmatically (node:test FILE-form gate green at 19/19, all grep/ASCII/freeze gates pass). No visual, real-time, or external-service surface.

### Gaps Summary

No gaps. The corrected aggregator emits exactly the single 5-tier confidence enum with `Contested` first-class on a voter split (branch correctly ordered before Medium) and refutation as downgrade-not-delete; the node:test suite passes 19/19 via the FILE form with all five tiers exercised and the BLOCKER CR-01 fixture-discrimination defect resolved. The reference doc freezes all four input records plus the survivor and report claim records, the tally rubric + truth table, the single enum, the two orthogonal assurances with a VERIF-06 worked example, and the named-ceilings + quote-recheck + D-12 anti-drift contracts -- byte-for-byte against the corrected aggregator, pure ASCII, with no forbidden tokens or validator stand-in. Both PIPE-07 and VERIF-06 are satisfied at the contract level. The unaddressed code-review WARNING/INFO items are quality follow-ups outside the phase Success Criteria, not goal failures.

---

_Verified: 2026-06-15_
_Verifier: Claude (gsd-verifier)_
