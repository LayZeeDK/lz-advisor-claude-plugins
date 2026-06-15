---
phase: 17-json-schema-verification-contract-reference
plan: 02
subsystem: documentation
tags: [reference, schema, data-contract, deep-research, anti-drift, confidence-enum, two-assurances, freeze-from-code]

# Dependency graph
requires:
  - phase: 16-deterministic-off-model-aggregator-validation-fixture
    provides: "The aggregator's frozen survivor/dropped records, CEILINGS, quote-recheck, run-dir layout, stdout summary"
  - phase: 17-json-schema-verification-contract-reference (plan 01)
    provides: "The CORRECTED aggregator tally() (single D-01 enum; no Rejected / Low/Contested) + 19-test green fixture"
provides:
  - "plugins/lz-advisor/references/lz-deep-research-schema.md -- the single source of truth for the deep-research data contract (frozen verbatim from the corrected aggregator under D-12)"
  - "The frozen four input records (source/claim/vote/stored-excerpt) + the aggregator survivor record + the Phase-20 report claim record"
  - "The Option I tally rubric + truth table; the single 5-tier confidence enum (High | Medium | Low | Contested | Unsupported)"
  - "The two orthogonal assurances (quote_fidelity vs claim_support) with a worked example; the named-ceilings + quote-recheck contracts; the D-12 anti-drift rule"
affects: [18-haiku-voter-eval, 19-search-extract-workers, 20-orchestrator-skill]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Freeze-from-(corrected)-code: copy field names/enum values/rubric branches byte-for-byte from the aggregator source, cite functions + line anchors (D-12 anti-drift)"
    - "Prose-contract reference in references/ (the fifth file), sibling house style: H1 + intent paragraph + ## sections + fenced shapes + mapping tables + worked example + explicit caveat sections"
    - "Two structurally separate verification assurances, never conflated (mechanical quote_fidelity vs judgment claim_support)"

key-files:
  created:
    - plugins/lz-advisor/references/lz-deep-research-schema.md
  modified:
    - .planning/phases/16-deterministic-off-model-aggregator-validation-fixture/16-01-SUMMARY.md

key-decisions:
  - "Reference doc freezes the CORRECTED aggregator (post-17-01), never the spike vocabulary -- D-12 anti-drift, verbatim copy + cited functions/anchors"
  - "Forbidden tokens (Rejected / Low/Contested / report_confidence / schema-keyword / ajv) are absent from the reference doc by phrasing the superseded labels descriptively (terminal-delete tier / fused low-or-contested token), so the zero-hit gate stays clean"
  - "claim_support not-yet-judged state named 'unassessed' (Claude's discretion per D-04; reads as 'not yet judged' without colliding with null or pending)"
  - "Source-record forward-looking fields include fetched_at (Claude's discretion per D-07); consumers ignore unknown additive fields"
  - "16-01-SUMMARY superseded banner already named the corrected enum; minimal edit added the new reference doc + corrected aggregator as the contract authority, preserving the dated as-shipped historical record"

requirements-completed: [PIPE-07, VERIF-06]

# Metrics
duration: 5min
completed: 2026-06-15
---

# Phase 17 Plan 02: Deep-Research Data-Contract Schema Reference Summary

**Froze the entire deep-research data contract in one prose-contract reference (`references/lz-deep-research-schema.md`) -- all four input records plus the survivor and report claim records, the corrected Option I tally rubric + the single 5-tier confidence enum, the two orthogonal verification assurances with a worked example, and the named-ceilings + quote-recheck + D-12 anti-drift contracts -- copied byte-for-byte from the corrected aggregator, then re-pointed the Phase-16 SUMMARY's superseded banner at it.**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-06-15T11:51Z
- **Completed:** 2026-06-15
- **Tasks:** 2
- **Files:** 1 created, 1 modified

## Accomplishments

- Authored the FIFTH file in `plugins/lz-advisor/references/` -- `lz-deep-research-schema.md` (499 lines, pure ASCII / LF, sibling house style: H1 contract title, intent paragraph naming the anti-drift rule + the three downstream consumers, `##` major sections, fenced JSON shapes, mapping tables, a worked-example section, and explicit caveat sections).
- Froze every aggregator-consumed / aggregator-emitted shape VERBATIM from the corrected `lz-deep-research-aggregate.mjs` (D-12): the survivor record `{id, claim, sources[], corroboration_lower_bound, quote_fidelity, confidence}` byte-for-byte, the dropped record `{id, claim, reason: 'quote-not-in-any-excerpt'}` (the only claim-removal path), `CEILINGS` (ANGLES 5 / MAX_FETCH 15 / MAX_VERIFY_CLAIMS 24 / VOTES_PER_CLAIM 3 / SYNTH_CAP 20) with which stage enforces which, the three-way quote-recheck (verified | downgraded | dropped) + the normalize() pipeline + the WR-04 normalized-substring lower-bound caveat, the run-dir layout, and the 4-line stdout summary + exit codes.
- Documented the corrected Option I tally rubric (the 5 ordered branches with the split branch preceding Medium; downgrade-not-delete) and a truth table mapping every readable tally to exactly one of the 5 tiers; cited the exact authoritative functions (aggregate, tally, mergeClusters, quoteOutcome, recheckClusters, enforceCeilings, CEILINGS).
- Documented the single 5-tier confidence enum (`High | Medium | Low | Contested | Unsupported`) -- one vocabulary, byte-identical in code and contract; Contested first-class (PIPE-08), emitted on a per-claim voter split and additionally promotable by Phase-20 synthesis to the same value (the VERIF-05 escalation signal).
- Documented the two orthogonal assurances (VERIF-06): `quote_fidelity` (mechanical, aggregator-owned, frozen `verified|downgraded`) vs `claim_support` (judgment, voter/synthesis-owned, NEW, `supported|partial|unsupported|unassessed`), never derived one from the other, WITH a worked example where `quote_fidelity: verified` coexists with `claim_support: unsupported`.
- Froze both record stages (survivor stage 1 + report claim record stage 2 = survivor superset PLUS `claim_support` PLUS inline `citation`), the source record with the canonical-URL key rule (D-07/D-08, aggregator does NOT read it), the vote record's frozen consumed core `{verdict}` (D-09), and the voter-authored reserved additive-only envelope (attack_mode / disconfirming_query / source-independence note, D-10).
- Stated the D-12 anti-drift rule in-doc (the aggregator source is authoritative; the doc freezes verbatim; future shape changes update code + reference in lockstep) and recorded the aggregator's fail-closed JSON.parse + ContractError + WR-01/02/03 field guards + safeId path guard AS the runtime enforcement -- the reason a formal schema-keyword validator is unnecessary (no second confidence field, no validator library).
- Reconciled `16-01-SUMMARY.md`: the SUPERSEDED-IN-PART banner now names the corrected enum AND points the reader at the new `references/lz-deep-research-schema.md` (plus the corrected aggregator source) as the contract authority, with `17-CONTEXT.md` retained for decision provenance; the dated as-shipped historical record below the banner is preserved unchanged.

## Task Commits

Each task committed atomically (single-repo, normal commits with hooks, files staged by exact name, on `feat/deep-research`):

1. **Task 1: Write references/lz-deep-research-schema.md (freeze all records, tally rubric + enum, two assurances + worked example, ceilings + quote-recheck + anti-drift)** -- `cb91550` (docs)
2. **Task 2: Reconcile the 16-01-SUMMARY.md forward-pointing note to the corrected enum + the new reference** -- `36ffeaa` (docs)

## Files Created/Modified

- `plugins/lz-advisor/references/lz-deep-research-schema.md` (created) -- the frozen deep-research data-contract schema; the single source of truth for source/claim/vote/excerpt + survivor + report claim records, the tally rubric + confidence enum, the two assurances, and the named-ceilings + quote-recheck + anti-drift contracts.
- `.planning/phases/16-deterministic-off-model-aggregator-validation-fixture/16-01-SUMMARY.md` (modified) -- the superseded banner now points at the new reference doc + the corrected aggregator as the authority; historical as-shipped record preserved.

## Deviations from Plan

**None - plan executed exactly as written.** Both tasks executed in order against the corrected aggregator (Plan 17-01 dependency precondition verified GREEN before starting: `git grep "Rejected\|Low/Contested"` over the aggregator source returned nothing).

One author-time discipline note (not a deviation from the plan -- it is the plan's explicit anti-pattern guard): the reference doc's intent is to DESCRIBE that the spike labels (`Rejected`, fused `Low/Contested`) and a second `report_confidence` field and a schema-keyword/ajv validator are all absent from the contract. To keep the closing zero-hit gate clean (`rg "Rejected|Low/Contested|report_confidence|$schema"` must return nothing over the reference doc), those superseded concepts are phrased descriptively in the doc ("a terminal-delete tier", "a fused low-or-contested token", "no second per-report confidence field", "a schema-keyword document plus a runtime validator library"), never by writing the literal forbidden tokens. This matches the Phase 17 Plan 01 STATE note ("Forbidden Low/Contested + Rejected tokens assembled from fragments so the closing git grep zero-hit gate stays clean").

## Claude's Discretion choices recorded

- `claim_support` not-yet-judged state name: `unassessed` (per D-04 / Research Open Question 2 recommendation).
- Source-record forward-looking field beyond `{id, url, title}`: `fetched_at` (per D-07).
- Section ordering follows the 17-RESEARCH "Recommended doc structure" with the two assurances + worked example placed immediately after the confidence enum, and the named-ceilings + stdout/exit + stage-ownership sections at the end.
- JSON rendering: fenced ```json shapes paired with field tables (name/type/allowed-values/owner/notes) so every field is unambiguous.

## Self-Check: PASSED

- FOUND: `plugins/lz-advisor/references/lz-deep-research-schema.md` (499 lines, min 120; contains `claim_support` + `quote_fidelity`; pure ASCII, 0 CR bytes)
- VERIFIED: `rg "Rejected|Low/Contested|report_confidence|$schema"` over the reference doc returns nothing; `ajv` returns nothing; the worked-example orthogonality regex (`quote_fidelity ... verified ... claim_support ... unsupported`) matches
- VERIFIED: frozen shapes match the corrected aggregator byte-for-byte (survivor field set lines 535-537; dropped reason line 360; CEILINGS lines 116-120; Option I branches lines 488-503; 5-label stdout lines 575-577)
- FOUND: `16-01-SUMMARY.md` references `lz-deep-research-schema.md`; pure ASCII; historical `Rejected`/`Low/Contested` mentions all sit under the dated SUPERSEDED banner (lines 131/148/152/165/174/187, after the line-89 banner)
- FOUND commit `cb91550` (Task 1)
- FOUND commit `36ffeaa` (Task 2)

## Next Phase Readiness

- The deep-research data contract is now frozen in one reference doc -- Phase 18 (eval/voter), Phase 19 (search/extract workers), and Phase 20 (orchestrator/synthesis) all implement against it. PIPE-07 + VERIF-06 are satisfied at the contract level (the aggregator emits the 5-tier enum; the doc defines the two assurances with the worked example; `claim_support` is voter/synthesis-owned and populated in Phase 18/20).
- No blockers. Phase 17 is the last contract phase before the schema's consumers are authored.

---
*Phase: 17-json-schema-verification-contract-reference*
*Completed: 2026-06-15*
