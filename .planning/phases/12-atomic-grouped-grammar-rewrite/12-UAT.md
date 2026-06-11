---
status: complete
phase: 12-atomic-grouped-grammar-rewrite
source: [12-01-SUMMARY.md, 12-02-SUMMARY.md, 12-03-SUMMARY.md, 12-04-SUMMARY.md]
started: 2026-06-07T22:56:53Z
updated: 2026-06-07T22:56:53Z
mode: autonomous
---

## Current Test

[testing complete]

<!--
AUTONOMOUS UAT. Phase 12 is a zero-runtime Markdown/YAML plugin phase; its
user-observable outcome is the grouped spelled-out severity grammar
(### Critical / ### Important / ### Suggestions / ### Questions). Each test was
executed by the orchestrator from the repo root and graded against expected
behavior -- no manual confirmation. The empirical LIVE-RUN proof (grouped
headers reach rendered output through a real `claude -p /lz-advisor:review`
session against ngx-smart-components) is EXPLICITLY Phase 13's job (GATE-02),
per 12-CONTEXT.md domain boundary and 12-VERIFICATION.md deferred item 2. It is
NOT pulled forward here; doing so would be scope creep into the next phase. The
ngx-smart-components worktree was therefore not needed for this phase's UAT.
-->

## Tests

### 1. Reviewer agent emits the grouped grammar (GREEN on new)
expected: `bash tests/D-reviewer-budget.sh` self-extracts the reviewer agent's holistic worked example and parses findings grouped under `### Critical`/`### Important`/`### Suggestions`/`### Questions` + `### Cross-Cutting Patterns`; exits 0 with all per-section budget assertions passing.
result: pass
evidence: "exit 0; 7 findings parsed; 10/10 assertions PASS (anti-vacuous 7>=5, all per-finding <=28, Cross-Cutting 63<=160, Missed surfaces 17<=30)"

### 2. Reviewer fixture is RED on the old shorthand / empty input
expected: The retargeted header-tracking parser refuses the pre-rewrite grammar. `--self-test` (zero findings) exits 1; `--from-trace <old crit:/imp:/sug:/q: single-### Findings sample>` parses 0 findings and the anti-vacuous guard fires (exit 1).
result: pass
evidence: "--self-test exit 1; --from-trace old-shorthand sample => 0 findings parsed, anti-vacuous guard fired, exit 1"

### 3. Security-reviewer agent emits the grouped grammar + OWASP [Axx] + CVE carve-out (GREEN on new)
expected: `bash tests/D-security-reviewer-budget.sh` self-extracts the security holistic example, parses findings under the same four headers + `### Threat Patterns` with the OWASP `[Axx]` tag preserved after the location; the 75w CVE auto-clarity carve-out fires for the full-prose CVE finding; exits 0.
result: pass
evidence: "exit 0; 6 findings parsed; 9/9 assertions PASS; CVE carve-out fires (36<=75 under the 75w cap, would fail the 28w default); threat_patterns 62<=160; missed_surfaces 10<=30"

### 4. Security fixture is RED on old shorthand AND on [Axx]-missing findings
expected: `--self-test` exits 1; `--from-trace <old crit: [A02] sample>` parses 0 findings (exit 1); a NEW-grammar sample whose finding lines lack the `[Axx]` bracket also parses 0 findings (exit 1) -- proving the `\[[^]]+\]` bracket assertion in FINDING_RE is load-bearing.
result: pass
evidence: "--self-test exit 1; old-shorthand from-trace => 0 findings, exit 1; new-grammar-no-[Axx] from-trace => 0 findings, exit 1 (bracket assertion load-bearing)"

### 5. Zero inline-shorthand residue in the plugin tree
expected: `git grep -nE 'crit:|imp:|sug:|q:' -- plugins/lz-advisor/` returns NOTHING (exit 1). No half-converted surface survives to produce mixed runtime output (the WR-05 few-shot-drift scar).
result: pass
evidence: "git grep exit 1 (no match across plugins/lz-advisor/)"

### 6. Zero formerly-X residue in the plugin tree
expected: `git grep -nE 'formerly High|formerly Medium' -- plugins/lz-advisor/` returns NOTHING (exit 1). No third generation of `(formerly High)`/`(formerly Medium)` annotations (AGNT-01).
result: pass
evidence: "git grep exit 1 (no match)"

### 7. Both review skills name the grouped headers as the verbatim contract; prohibition inverted
expected: review/SKILL.md and security-review/SKILL.md name `### Critical`/`### Important`/`### Suggestions`/`### Questions` + the trailing analytical section (`### Cross-Cutting Patterns` for review, `### Threat Patterns` for security) as the protected literal headers that must reach the user; the standing "Reformat ... into severity groups" prohibition is gone (inverted).
result: pass
evidence: "review names ### Critical (3 hits) + Cross-Cutting Patterns (5); security names ### Critical (3) + Threat Patterns (5); old prohibition grep exit 1 (gone)"

### 8. Atomic 5-surface version bump 1.0.0 -> 1.0.1 + README changelog
expected: Exactly 5 surfaces (plugin.json + 4 SKILL.md `version:` fields) carry `1.0.1`; zero carry `1.0.0`; README has a `### 1.0.1` "What's New" entry. No split version ships.
result: pass
evidence: "5 hits at 1.0.1; 0 hits at 1.0.0; README has 1 `### 1.0.1` entry"

### 9. AGNT-03 protected behaviors survive byte-intact
expected: `## Class-2 Escalation Hook` (count 1 per agent), `## Hedge Marker Discipline` (count 1 per agent) present in both reviewer.md and security-reviewer.md; every `severity="..."` machine attribute across agents + context-packaging.md is lowercase (`critical|important|suggestion`), no Title-Case leak.
result: pass
evidence: "Class-2 = 1 in each agent; Hedge = 1 in each agent; severity= values only `<critical|important|suggestion>` (BNF) + `important` -- all lowercase"

### 10. Empty sections render (none); all four headers always emitted
expected: Both agents document the literal `(none)` empty-section marker and emit all four `### Critical`/`### Important`/`### Suggestions`/`### Questions` headers in fixed order even when a severity has zero findings (RPT-04).
result: pass
evidence: "(none) present in reviewer.md (10) + security-reviewer.md (11); all four severity headers present in both agents (incl. the security holistic example's Suggestions=(none))"

## Summary

total: 10
passed: 10
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none]

## Notes

- Mode: autonomous. All 10 tests are deterministic shell/grep gates executed by
  the orchestrator from the repo root; results recorded above are the real
  command outputs, not SUMMARY claims.
- The two budget fixtures (`tests/D-reviewer-budget.sh`,
  `tests/D-security-reviewer-budget.sh`) ARE the binding regression gates; both
  are GREEN-on-new and proven RED-on-old in lockstep (D-10/D-11).
- Deferred (Phase 13, GATE-02): empirical proof that grouped headers reach
  rendered user-facing output through a live `claude -p` skill run against
  ngx-smart-components. Correctly out of Phase 12 scope; not tested here.
- Deferred (out of Phase 12 scope, pre-existing): security-review/SKILL.md
  "Reviewer Escalation Hook" wiring (code-review WR-04). The render-verbatim
  path the agent emits into is intact; the escalation flow is the deferred
  wiring, not a Phase 12 regression.
