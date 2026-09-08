---
phase: 16
slug: deterministic-off-model-aggregator-validation-fixture
status: verified
threats_open: 0
asvs_level: 1
created: 2026-06-15
---

# Phase 16 -- Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

**Verdict:** SECURED (7/7 closed) -- `register_authored_at_plan_time: true`. This audit verifies each
declared mitigation is present in the implemented code; it does not scan for new vulnerabilities.
`block_on: high` (default); no HIGH threats exist for this surface.

Implementation files audited (READ-ONLY -- never modified):

- `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs` (602 lines)
- `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs` (268 lines)
- `plugins/lz-advisor/skills/lz-deep-research/scripts/__fixtures__/` (6 committed run-dirs)

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Phase-19 worker files -> aggregator | Untrusted file CONTENT (claims/*.json, excerpts/*.txt, votes/*.json) written into a gitignored scratch dir crosses into JSON.parse + substring matching. Treated as DATA only, never executed. | Synthetic claim/excerpt/vote text (no secrets) |
| caller-supplied `<run-dir>` arg -> filesystem | The single positional path arg; the script reads within it and writes survivors.json into it. No network, no auth, no eval, no SQL, no web surface. | A filesystem path |
| committed fixture files -> aggregator under test | Test run-dirs the executor authored; exercise the aggregator's untrusted-input handling deterministically. | Author-controlled synthetic test data |
| `node --test` runner -> filesystem | Test reads committed `__fixtures__` and writes ONE excerpt at runtime into the crlf-bom-safe dir; all paths resolved test-file-relative via fileURLToPath, never cwd. | Test fixture bytes |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-16-01 | Tampering | excerpt_id / worker-id -> filename mapping (path.join) | mitigate | `safeId()` (`lz-deep-research-aggregate.mjs:144-154`) rejects `/[\\/]/`, `.`, `..`, `..`-substring, non-string/empty; applied at every content-derived id site (`:283`, `:311`, `:431`, `:432`). Verified: rejects `../etc/passwd`, `a/b`, `a\b`, `..`, `.`, `x..y`, `''`, `null`, `42`; accepts basenames. | closed |
| T-16-02 | Denial of Service | JSON.parse over malformed/oversized worker JSON | mitigate | `readJson()` wraps `JSON.parse` in try/catch (`:167-171`) -> `ContractError` naming the bad file; CLI try/catch (`:592-601`) maps to `process.exit(2)` with stderr + offending file. Output bounded by frozen `MAX_VERIFY_CLAIMS` (`:411-413`) and `SYNTH_CAP` (`:536-538`). Tests WR-01/02/03 (`test:118-155`) assert fail-closed. | closed |
| T-16-03 | Information Disclosure | stdout receipt | mitigate | Summary assembled from counts only (`:548-571`); no raw `quote`/excerpt text interpolated. Verified: `aggregate(near-duplicate-merged).summary` contains none of the raw excerpt phrases. | closed |
| T-16-04 | Tampering (supply chain) | dependency installs | mitigate | Aggregator imports ONLY `node:fs`, `node:path`, `node:url` (`:22-24`); zero `package.json` repo-wide -- no install surface. | closed |
| T-16-05 | Tampering | fixture path resolution | mitigate | Test resolves `__fixtures__` via `path.dirname(fileURLToPath(import.meta.url))` (`test:34`), never `process.cwd()` -- cwd-drift safe under GSD worktrees / headless `claude -p`. | closed |
| T-16-06 | Tampering (supply chain, test) | dependency installs (test) | mitigate | Test imports ONLY `node:test`/`node:assert/strict`/`node:fs`/`node:os`/`node:path`/`node:url` + the relative module (`test:23-30`). Active zero-dep sub-assertion (`test:226-268`) asserts every import specifier is `node:`/`./`/`../` AND walks scripts-dir-to-repo-root asserting no `package.json`. Passes. | closed |
| T-16-07 | Information Disclosure | committed fixture content + assertions | accept | See Accepted Risks Log. Synthetic study-style data only; secret/PII scan returns zero matches. | closed |

*Status: open / closed*
*Disposition: mitigate (implementation required) / accept (documented risk) / transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-16-01 | T-16-07 | Six committed fixture run-dirs contain only synthetic study-style placeholder text using abstract tokens (`X`/`Y`/`Z`, source ids `s1`/`s2`/`s01`..`s31`). No secrets/credentials/PII. Secret/PII pattern scan over the full `__fixtures__/` tree (`password|secret|token|api[_-]?key|BEGIN (RSA|PRIVATE)|SSN|bearer|aws_|AKIA`) returns zero matches. Test assertions read only counts and frozen field values, never write to an external sink. Author-controlled test data. | Lars Gyrup Brink Nielsen | 2026-06-15 |

*Accepted risks do not resurface in future audit runs.*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-06-15 | 7 | 7 | 0 | gsd-security-auditor (Opus) |

**Verification notes:**
- Full suite green at audit time: `node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs` -> tests 13 | pass 13 | fail 0. The declared mitigation assertions (WR-01/02/03 fail-closed, zero-dep, fileURLToPath fixture resolution, CRLF/BOM) are genuine executed tests -- not phantom.
- Neither `16-01-SUMMARY.md` nor `16-02-SUMMARY.md` contains a `## Threat Flags` section; no unregistered attack surface (dependency / network / eval / `package.json`) appeared during implementation.

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-06-15
