---
phase: 17
slug: json-schema-verification-contract-reference
status: verified
threats_open: 0
asvs_level: 1
created: 2026-06-15
---

# Phase 17 -- Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

This phase is a documentation + offline-test correction phase for the deep-research
feature. Plan 17-01 corrected the aggregator tally() confidence enum (decision branches
only) and added node:test fixtures. Plan 17-02 authored references/lz-deep-research-schema.md
(the frozen data contract) and reconciled 16-01-SUMMARY.md. No network, no auth, no
secrets, no untrusted runtime input -- the only inputs are committed, author-controlled
test fixtures. The aggregator fail-closed JSON.parse + ContractError + WR-01/02/03 field
guards + safeId() path guard are FROZEN and untouched by this phase.

The threat register was authored at plan time (in the two PLAN <threat_model> blocks).
This audit VERIFIES each declared mitigation exists in the implementation; it does not
scan for new threats. No SECURITY.md existed before this run -- this file is created here,
and the three plan-time accept-disposition threats are recorded in the Accepted Risks Log.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| run-dir JSON files -> aggregator | The aggregator reads local claims/, excerpts/, votes/ files via JSON.parse. Produced by Phase-19 workers at runtime; in THIS phase the only inputs are committed test fixtures. | Trusted, author-controlled JSON/text fixtures. No network, no auth, no secrets. |
| committed source -> host (ASCII/CRLF invariant) | The Write tool can inject a U+FEFF BOM or CRLF on this Windows host, which would corrupt the pure-ASCII invariant the zero-dep fixture and downstream parsers rely on. | Source/markdown bytes. |
| reference doc -> downstream consumers | references/lz-deep-research-schema.md is the contract Phase 18/19/20 implement against. A shape documented WEAKER than the code would propagate drift. Documentation artifact; no runtime, no network, no untrusted input. | Frozen schema definitions. |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-17-01 | Tampering | tally() confidence-decision change | mitigate | Change confined to tally() decision block (mjs:487-503); validation, safeId() path-safety, and ContractError fail-closed paths untouched. Full node:test suite stays green as regression gate. | closed |
| T-17-02 | Tampering | BOM/CRLF injection into edited .mjs/.test.mjs/fixture files | mitigate | Pure-ASCII scan returns nothing on every edited/new file and fixture tree; no literal BOM (only U+FEFF as a JS escape on mjs:69). | closed |
| T-17-03 | Tampering | crafted fixture id triggering path traversal | accept | Fixture case names/ids are author-controlled safe basenames; the frozen safeId() basename-only guard (V12, mjs:144-154) remains in force and fixture-covered. No new untrusted id surface. | closed |
| T-17-04 | Information Disclosure | corrected stdout summary leaking source text | accept | Summary is a counts-only deterministic receipt (mjs:563-580); the 5-label change only renames/adds count terms. No new disclosure surface. | closed |
| T-17-05 | Tampering | doc documenting a shape that WEAKENS the aggregator fail-closed validation | mitigate | Doc records the fail-closed JSON.parse + ContractError + WR-01/02/03 guards + safeId() AS runtime enforcement (schema.md:55-61) and freezes shapes verbatim (D-12); no $schema/ajv stand-in; verbatim field names. | closed |
| T-17-06 | Tampering | drift between doc and code (second confidence vocabulary, paraphrased field names) | mitigate | Doc freezes from the CORRECTED code with cited anchors (D-12); single enum, no Rejected / Low-Contested / report_confidence; survivor field set, CEILINGS, and Option I branches match source byte-for-byte. | closed |
| T-17-07 | Tampering | BOM/CRLF injection into the new .md or the edited SUMMARY | mitigate | Pure-ASCII + CR scan returns nothing on schema.md and 16-01-SUMMARY.md. | closed |
| T-17-08 | Information Disclosure | the doc leaking secrets/credentials | accept | Doc describes data shapes only; no secrets, env vars, or credentials. LZ_DR_* override intentionally unwired (mjs:591-592). | closed |

*Status: open . closed*
*Disposition: mitigate (implementation required) . accept (documented risk) . transfer (third-party)*

---

## Mitigation Evidence (mitigate-disposition threats)

| Threat ID | Verification Method | Evidence |
|-----------|---------------------|----------|
| T-17-01 | node:test FILE-form run + guard presence | `node --test ...lz-deep-research-aggregate.test.mjs` -> tests 19, pass 19, fail 0, exit 0. ContractError class at mjs:128; safeId() at mjs:144-154 (invoked tally() mjs:438, loadExcerpts mjs:283, quoteOutcome mjs:311); fail-closed JSON.parse in readJson mjs:167-172; WR-01/02/03 guards mjs:64,217,226,230. tally() change isolated to mjs:487-503. |
| T-17-02 | non-ASCII + CR scan | `rg -ln "[^\x00-\x7F]"` over the .mjs, .test.mjs, and all five fixture trees returns nothing (exit 1). `rg -lU "\r"` returns nothing. Only U+FEFF reference is the JS escape at mjs:69. |
| T-17-05 | forbidden-token scan + positive statement | `git grep -e ajv -e report_confidence -e '$schema'` over schema.md returns nothing. schema.md:55-61 states the fail-closed JSON.parse / ContractError / WR-01/02/03 / safeId guards ARE the runtime enforcement and a formal validator is deliberately not used; schema.md:146,148,149,481 cite the WR guards. |
| T-17-06 | byte-for-byte freeze + forbidden-token scan | `git grep -e Rejected -e "Low/Contested"` over schema.md, the .mjs, and the .test.mjs returns nothing. Survivor field set {id, claim, sources, corroboration_lower_bound, quote_fidelity, confidence} schema.md:384-392 == mjs:531-538. CEILINGS schema.md:443-449 == mjs:115-121. Option I branches schema.md:273-277 == mjs:487-503 (split before Medium). |
| T-17-07 | non-ASCII + CR scan + reconciliation | `rg -ln "[^\x00-\x7F]"` over schema.md and 16-01-SUMMARY.md returns nothing; no CR bytes. 16-01-SUMMARY.md:89 points at references/lz-deep-research-schema.md as the new authority; the spike vocabulary appears only under a dated SUPERSEDED-IN-PART banner. |

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-17-01 | T-17-03 | Fixture case names and ids are author-controlled safe basenames; the frozen safeId() basename-only guard (V12, mjs:144-154) remains in force and is fixture-covered. No new untrusted id surface is introduced by this offline test-fixture phase. | Phase author (plan-time disposition, 17-01-PLAN) | 2026-06-15 |
| AR-17-02 | T-17-04 | The aggregator stdout summary is a counts-only deterministic receipt (mjs:563-580); it never emits raw source text. The 5-label confidence change only renames/adds count terms, introducing no new disclosure surface. | Phase author (plan-time disposition, 17-01-PLAN) | 2026-06-15 |
| AR-17-03 | T-17-08 | The reference doc describes data shapes only; no secrets, env vars, or credentials are present. The LZ_DR_* env override is intentionally unwired (mjs:591-592), so no credential surface exists. | Phase author (plan-time disposition, 17-02-PLAN) | 2026-06-15 |

*Accepted risks do not resurface in future audit runs.*

---

## Unregistered Flags

None. Neither 17-01-SUMMARY.md nor 17-02-SUMMARY.md contains a `## Threat Flags`
section; no new attack surface was declared during implementation. All eight
plan-time threats map to a disposition and resolve to closed.

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-06-15 | 8 | 8 | 0 | gsd-security-auditor |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-06-15
