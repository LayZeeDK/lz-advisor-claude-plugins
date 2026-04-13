---
phase: 04
slug: review-skills
status: verified
threats_open: 0
asvs_level: 1
created: 2026-04-13
---

# Phase 04 -- Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| User code -> reviewer agent prompt | Untrusted code snippets from the reviewed codebase are embedded in the Opus reviewer's prompt | Source code (potentially sensitive business logic) |
| User code -> security-reviewer agent prompt | Untrusted code snippets (potentially containing malicious payloads) embedded in the Opus security reviewer's prompt | Source code (potentially adversarial content) |
| User request -> skill execution | User-controlled review scope (file paths, directories) determines what executor reads | File paths and directory names |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-04-01 | Spoofing | agents/reviewer.md | accept | Agent invoked only by skill via `allowed-tools`; description states "not intended for direct invocation" | closed |
| T-04-02 | Tampering | skills/lz-advisor-review/SKILL.md | accept | Read-only Markdown file; no runtime mutation; plugin installation is user-initiated | closed |
| T-04-03 | Information Disclosure | agents/reviewer.md | mitigate | `maxTurns: 1` limits data exfiltration surface; "under 300 words" output budget; skill instructs "do not paste entire files" | closed |
| T-04-04 | Elevation of Privilege | agents/reviewer.md | mitigate | `tools: ["Read", "Glob"]` -- no Write, Edit, Bash, or mutation tools; `maxTurns: 1` prevents multi-step escalation | closed |
| T-04-05 | Injection | skills/lz-advisor-review/SKILL.md | accept | Malicious code in review targets is inherent to code review tooling; Opus has built-in prompt injection resistance; no additional mitigation for v1 | closed |
| T-04-06 | Spoofing | agents/security-reviewer.md | accept | Agent invoked only by skill via `allowed-tools`; description states "not intended for direct invocation" | closed |
| T-04-07 | Tampering | skills/lz-advisor-security-review/SKILL.md | accept | Read-only Markdown file; no runtime mutation; plugin installation is user-initiated | closed |
| T-04-08 | Information Disclosure | agents/security-reviewer.md | mitigate | `maxTurns: 1` limits scope; "under 300 words" output budget; findings stay in local session as console output (no file artifact, no network transmission) | closed |
| T-04-09 | Elevation of Privilege | agents/security-reviewer.md | mitigate | `tools: ["Read", "Glob"]` -- read-only; `maxTurns: 1` prevents multi-step escalation chains | closed |
| T-04-10 | Injection | skills/lz-advisor-security-review/SKILL.md | accept | Code under security review is inherently adversarial (may contain attack payloads); Opus has built-in resistance; risk accepted because not reviewing adversarial code defeats the skill's purpose | closed |

*Status: open / closed*
*Disposition: mitigate (implementation required) / accept (documented risk) / transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-04-01 | T-04-01 | Agent spoofing is low risk; `allowed-tools` gates invocation to skill-orchestrated paths only | gsd-secure-phase | 2026-04-13 |
| AR-04-02 | T-04-02 | Markdown files have no runtime mutation surface; installation is user-initiated trust decision | gsd-secure-phase | 2026-04-13 |
| AR-04-03 | T-04-05 | Prompt injection via reviewed code is inherent to any code review tool (human or AI); Opus model resistance is the primary defense | gsd-secure-phase | 2026-04-13 |
| AR-04-04 | T-04-06 | Same as AR-04-01 for security-reviewer agent | gsd-secure-phase | 2026-04-13 |
| AR-04-05 | T-04-07 | Same as AR-04-02 for security review skill | gsd-secure-phase | 2026-04-13 |
| AR-04-06 | T-04-10 | Higher injection risk than T-04-05 (adversarial code by design); accepted because the alternative -- not reviewing malicious code -- defeats the skill's purpose | gsd-secure-phase | 2026-04-13 |

*Accepted risks do not resurface in future audit runs.*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-04-13 | 10 | 10 | 0 | gsd-secure-phase |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-04-13
