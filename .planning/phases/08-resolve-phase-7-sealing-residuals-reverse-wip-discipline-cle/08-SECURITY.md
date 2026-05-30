---
phase: 08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle
asvs_level: 1
block_on: high
threats_total: 9
threats_closed: 9
threats_open: 0
unregistered_flags: 0
audit_date: 2026-05-31
verdict: SECURED
---

# Phase 8 Security Audit

Threat-register verification for Phase 8 (resolve Phase 7 sealing residuals + wip-discipline reversal). Each threat declared in `<threat_model>` blocks of plans 08-01 through 08-07 verified against the implementation files. No implementation gaps; all dispositions honored.

## Configuration

- **ASVS level:** 1 (baseline input validation, output encoding, basic auth, error handling)
- **Block-on:** `high` (none of the declared threats reach this severity)
- **Attack surface:** Claude Code marketplace plugin (Markdown skill files + agent prompts + shell smoke fixtures). No runtime, no network listeners at plugin-load time, no privileged operations, no persistent state. Inputs are producer-controlled (model output, captured traces, plan prompts).

## Threat Verification Table

| Threat ID | Plan | Category | Disposition | Evidence | Verdict |
|-----------|------|----------|-------------|----------|---------|
| T-8-01-01 | 08-01 | tampering/repudiation (workflow contract removal) | accept | wip-discipline contract removed; `git grep -n "wip:" plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` returns exit 1. No security control was removed; rule was workflow hygiene, never a trust boundary. | CLOSED |
| T-8-02-01 | 08-02 | DoS/ReDoS | mitigate | D-reviewer-budget.sh:154 + D-security-reviewer-budget.sh:154 carry the new FRAGMENT_RE patterns. Structural review of both regexes confirms no catastrophic backtracking (see Section "ReDoS Structural Analysis" below). | CLOSED |
| T-8-02-02 | 08-02 | EoP (--from-trace path expansion) | accept | Existing bash `case` arg parsing preserved; trace content not shell-expanded. No code path modified. | CLOSED |
| T-8-03-01 | 08-03 | info disclosure (measurement) | accept | D-advisor-budget.sh extension adds boolean flag emission only (`[ITEM] frame=0/1 codeblock=0/1`). CODE_BLOCK_RE pattern bounded; non-network input (captured agent output). measurement-collator.mjs operates on producer-controlled log files. | CLOSED |
| T-8-04-01 | 08-04 | tampering (advisor.md template) | not_shipped/accept | Plan 08-04 did NOT ship per Plan 08-03 gate PASS verdict. `git diff plugins/lz-advisor/agents/advisor.md` returns empty for Phase 8. No surface modified. Audit trail in 08-04-SUMMARY.md (status: not_shipped). | CLOSED |
| T-8-05-01 | 08-05 | info disclosure (planning trail) | accept | Doc-only reconciliation; `git diff plugins/lz-advisor/` over Plan 05 commits returns 0 lines (verified in 08-05-SUMMARY.md "Closure Evidence" table). | CLOSED |
| T-8-06-01 | 08-06 | command injection (new shell fixture) | mitigate | G-advisor-narrative-sd-pv.sh present at expected path (executable, 9568 bytes). Uses standard `mktemp -d -t` + `trap 'rm -rf "$SCRATCH"' EXIT` cleanup pattern; ASCII-only output; `cygpath` + `MSYS_NO_PATHCONV=1` for Windows Git Bash compat. No network access at fixture-run time other than `claude -p` CLI invocation (already-trusted local tool). Mirrors D-* / B-* fixture patterns. | CLOSED |
| T-8-06-02 | 08-06 | info disclosure (Rule 5b extension) | accept | Doc-only sub-rule addition at plugins/lz-advisor/references/context-packaging.md:80 (verified via `git grep -nF "Advisor narrative SD self-anchor"`). No code path changes. | CLOSED |
| T-8-07-01 | 08-07 | malicious code execution (CVE prompt text) | mitigate | F-class-2-escalation.sh references CVE-2025-68154 / GHSA-wphj-fx3q-84ch as PROMPT TEXT and as a synthetic source-text fixture (vendored copy of the pre-patch pattern under `file:./vendor/internal-fs-helper`); never installs or invokes the vulnerable function. Per 08-07-SUMMARY.md "Threat Surface Scan": "seeds inert source text mimicking a known-CVE pattern but does NOT install or execute the vulnerable function." `claude -p /lz-advisor.security-review` performs Read-only scan. | CLOSED |
| T-8-07-02 | 08-07 | command injection (new shell fixture) | mitigate | F-class-2-escalation.sh present at expected path (executable, 10945 bytes). Standard `mktemp -d -t cve-trigger-XXXXX` outside parent repo, `trap` cleanup, `cygpath` Windows Git Bash compat, ASCII-only output. WebSearch/WebFetch are exercised inside the captured agent trace, not at fixture-launch time. Mirrors B-pv-validation.sh / D-security-reviewer-budget.sh patterns. | CLOSED |

## ReDoS Structural Analysis (T-8-02-01)

Implemented regex in D-reviewer-budget.sh:154:

```
/^`?[^:\s]+:\d+(?:-\d+)?:\s+(?:crit|imp|sug|q):`?\s+`?(.+?)`?$/gm
```

Implemented regex in D-security-reviewer-budget.sh:154:

```
/^`?[^:\s]+:\d+(?:-\d+)?:\s+(?:crit|imp|sug|q):\s+\[[A-Za-z0-9\-]+\]`?\s+`?(.+?)`?$/gm
```

Note: the shipped regexes are **stricter** than the pattern declared in the threat register (two additional optional backticks at intra-token slots, per 08-02-SUMMARY.md auto-fix #1). The structural review still holds — none of the added slots introduce nested quantifiers.

Structural review for catastrophic-backtracking potential:

| Element | Property | ReDoS risk |
|---------|----------|------------|
| `^` ... `$` with `m` flag | Anchors bound each match to a single line | LOW — matches scoped to line length |
| `` `? `` (5 instances) | Single optional char; no quantifier inside | NONE |
| `[^:\s]+` | Greedy plus over negated char class; bounded by following literal `:` | LOW — no ambiguous boundary |
| `\d+(?:-\d+)?` | Digit greed + optional non-capturing group | LOW — disjoint character classes |
| `(?:crit\|imp\|sug\|q)` | Finite alternation over fixed-length literals | NONE |
| `\[[A-Za-z0-9\-]+\]` (security-reviewer only) | Bounded char class inside literal brackets | LOW |
| `(.+?)` | Lazy plus; anchored by `` `?$ `` line-end | LOW — lazy quantifier with hard right anchor |
| Nested quantifiers | NONE present | NONE |
| Alternation with overlapping branches | NONE — alternation set is `crit\|imp\|sug\|q` (disjoint prefixes) | NONE |

**Verdict:** Linear in input size on standard backtracking engines. Input is producer-controlled (captured `claude -p` stdout or pre-recorded traces in `.planning/.../traces/`), not network-supplied. Combined with bounded input length (single line via `m` flag), no DoS exposure.

Note that the `CODE_BLOCK_RE` added by Plan 08-03 (`/`[^`]+`|`{3,}|<code[\s>]|\n {4,}/`) was also structurally reviewed under T-8-03-01 disposition: bounded character classes, finite alternation, no nested quantifiers. Same linearity guarantee.

## Unregistered Threat Flags from SUMMARY.md

Per audit protocol, the `## Threat Flags` section of each SUMMARY.md was scanned for any flag without a matching threat ID in the plan's threat_model block.

| SUMMARY | Threat Flags content | Unregistered? |
|---------|---------------------|---------------|
| 08-01-SUMMARY.md | "None. Per the plan's `<threat_model>` (T-8-01-01 disposition: accept)" | No — explicitly maps to T-8-01-01 |
| 08-02-SUMMARY.md | (no explicit `## Threat Flags` section) | No new flags reported |
| 08-03-SUMMARY.md | (no explicit `## Threat Flags` section) | No new flags reported |
| 08-05-SUMMARY.md | "None. Doc-only reconciliation; no plugin surface modified..." | No flags |
| 08-06-SUMMARY.md | (no explicit `## Threat Flags` section) | No new flags reported |
| 08-07-SUMMARY.md | "Threat Surface Scan: No new threat surface introduced." | Maps to T-8-07-01 / T-8-07-02 |

**No unregistered flags detected.**

## Implementation Surface Coverage

Files declared in the threat register that were verified read-only by the auditor:

- `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` — wip-discipline section absent (grep returns exit 1)
- `plugins/lz-advisor/references/context-packaging.md:80` — Advisor narrative SD self-anchor sub-rule present
- `plugins/lz-advisor/agents/advisor.md` — unchanged (08-04 not_shipped)
- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-reviewer-budget.sh:154,238` — backtick-tolerant FRAGMENT_RE + 75w PFV cap
- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-security-reviewer-budget.sh:154,236` — backtick-tolerant FRAGMENT_RE with severity-bracket preserved + 75w PFV cap
- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/G-advisor-narrative-sd-pv.sh` — new fixture (executable; cleanup-traps verified)
- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/F-class-2-escalation.sh` — new fixture (executable; cleanup-traps verified; CVE prompt text only, no install)

No implementation surface was modified by this audit. Audit operations limited to `git grep`, `ls`, structural file read.

## Accepted Risks Log

Threats accepted (not mitigated by a code change, but explicitly recorded):

1. **T-8-01-01 / T-8-02-02 / T-8-03-01 / T-8-04-01 / T-8-05-01 / T-8-06-02:** Acceptance grounded in producer-controlled input, no new trust boundary, doc-only or audit-trail-only changes.
2. **Phase 8 plugin attack surface remains the same as Phase 7** — plugin is a collection of Markdown / YAML files invoked by Claude Code at user request. No runtime listeners, no persistent storage, no privileged operations. ASVS L1 baseline satisfied by Claude Code itself (input handling) and by the prompt-level constraints already in place across Plan 07-xx (Rule 5b pv-validation, Class-2 Escalation Hook, fragment-grammar emit template, severity allow-list).

## Verdict

**SECURED** — 9/9 threats CLOSED; 0 OPEN; 0 unregistered flags; ASVS L1 baseline met; no blocker (`block_on: high`) reached.

---

*Phase 8 security audit completed 2026-05-31.*
