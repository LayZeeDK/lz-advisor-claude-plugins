---
phase: 09
slug: rename-skills
status: verified
threats_open: 0
asvs_level: 1
created: 2026-06-01
---

# Phase 9 -- Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

This phase is a mechanical rename of the four plugin skills from the dotted
`lz-advisor.<skill>` convention to plain `<skill>`, plus the doc/eval/smoke-fixture
sweep and a headless resolution probe. It edits Markdown/YAML/shell-fixture files in a
pre-publication Claude Code plugin. There is no authentication, no data store, no network
boundary, and no new executable code path. Every assessed threat is an
integrity/correctness risk (STRIDE Tampering), with one usage-cost note (Information
disclosure). No `high`-severity (ASVS L1) threats were assessed in any of the three plans.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| (none operational) | Pure Markdown/YAML/shell-fixture rename + doc sweep + verification probe. No auth, no datastore, no network surface, no new executable code path. | None. The only "input" is the developer's edit; the only path exercised is Claude Code's skill-resolution lookup observed by the D-08 probe. |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-09-01 | Tampering (integrity) | Plugin SKILL.md / reference / agent / README surfaces | mitigate | Plan 01 Task 2 occurrence-based (`git grep -o`) zero-residual sweep incl. the `<` placeholder alternation. Verified EMPTY at HEAD. | closed |
| T-09-02 | Tampering (integrity) | `Agent(lz-advisor:advisor\|reviewer\|security-reviewer)` invariant lines (D-03) | mitigate | Rename regex targets DOT tokens only; colon Agent() refs untouched. Verified count == 4 at HEAD. | closed |
| T-09-03 | Tampering (integrity) | `@${CLAUDE_PLUGIN_ROOT}/references/*.md` skill `@`-load paths (D-04) | mitigate | D-04 invariant: only textual mentions changed, never load paths. Verified all four referenced files (advisor-timing, context-packaging, orient-exploration, verify-target-selection) exist on disk -- no broken `@`-load. | closed |
| T-09-04 | Tampering (integrity) | 5-surface version sync (plugin.json + 4 SKILL.md) (D-10) | mitigate | Atomic 0.14.2 -> 0.15.0 bump. Verified exactly 5 hits of 0.15.0 and zero 0.14.2 residue at HEAD. | closed |
| T-09-05 | Tampering (integrity) | Headless smoke-fixture `-p` invocation strings (built-in `/review` / `/security-review` collision) | mitigate | D-07 policy: all fixture `-p` strings use the qualified `/lz-advisor:<skill>` form. Verified 20 qualified-colon `-p` occurrences; D-08 probe (T-09-09) directly observed review/security-review resolving to the PLUGIN, not the built-in. | closed |
| T-09-06 | Tampering (integrity) | CLAUDE.md + eval prompt sweep | mitigate | Plan 02 Tasks 1-2 occurrence-based zero-residual checks incl. `<` placeholder and `lz-advisor:lz-advisor-` normalized-artifact alternations. Verified EMPTY (CLAUDE.md + evals) at HEAD; CLAUDE.md carries the clean qualified form and zero dotted `claude -p` strings. | closed |
| T-09-07 | Tampering (integrity) | Frozen historical `.planning/` artifacts (audit-trail / version-pinned reproductions) | mitigate | D-06 scope discipline; staging by name (never `git add -A`). Verified 371 frozen `.planning/` artifacts (outside the maintained smoke-tests dir) retain their accurate dotted history refs -- NOT swept. | closed |
| T-09-08 | Tampering (integrity) | Eval JSON filenames (hyphen plugin-prefix convention) | mitigate | RESEARCH Pitfall 5: content-only edit, files not renamed. Verified the 4 hyphenated `lz-advisor-<skill>-eval.json` filenames are intact. | closed |
| T-09-09 | Tampering (integrity) -- THE phase risk | Headless skill-resolution path | mitigate | Plan 03 Task 1 D-08 probe directly observed `<command-name>/lz-advisor:<skill></command-name>` for all 4 skills (recorded session transcripts), with the doubled-segment artifact absent and no Skill-TOOL `is_error` fallback. | closed |
| T-09-10 | Information disclosure (cost) | Nested `claude -p` D-08 probes draw on the shared 5-hour usage pool | accept | 4 trivial "say hello and stop" probes; documented `out_of_credits` (HTTP 429) resume path; no data exposure. Probe run completed with no 429 encountered. Usage-budget note, not an attack-class threat. See AR-09-01. | closed |

*Status: open, closed*
*Disposition: mitigate (implementation required), accept (documented risk), transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-09-01 | T-09-10 | Nested `claude -p` D-08 resolution probes consume the shared 5-hour usage pool. Scope is 4 trivial "say hello and stop" invocations with no sensitive data in the prompt and no data returned beyond the resolution event; a documented `out_of_credits` resume path exists. This is a usage-budget cost note, not a confidentiality/integrity threat. The probe run completed without hitting a 429. | Lars Gyrup Brink Nielsen | 2026-06-01 |

*Accepted risks do not resurface in future audit runs.*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-06-01 | 10 | 10 | 0 | gsd-secure-phase (orchestrator-verified against HEAD) |

Verification basis: the orchestrator re-ran the canonical static suite against the current
working tree (operational + smoke zero-residual EMPTY; invariant Agent() count == 4; all
four `@`-load reference files present; 5x 0.15.0 with zero 0.14.2 residue; 371 frozen
artifacts retain dotted refs; 4 hyphenated eval JSON filenames intact) and cross-referenced
the D-08 headless resolution probe outcomes recorded in 09-03-SUMMARY.md. No
gsd-security-auditor subagent spawn was required: `threats_open` was 0 with all mitigations
independently re-verified, so the workflow short-circuit (Step 3 -> Step 6) applied.

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-06-01
