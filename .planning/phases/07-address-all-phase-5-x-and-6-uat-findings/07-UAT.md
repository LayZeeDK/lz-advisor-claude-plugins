---
status: partial
phase: 07-address-all-phase-5-x-and-6-uat-findings
source:
  - 07-01-SUMMARY.md
  - 07-02-SUMMARY.md
  - 07-03-SUMMARY.md
  - 07-04-SUMMARY.md
  - 07-05-SUMMARY.md
  - 07-06-SUMMARY.md
  - 07-07-SUMMARY.md
  - 07-08-SUMMARY.md
started: 2026-05-01T22:56:29Z
updated: 2026-05-02T22:05:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Smoke fixture suite (5 NEW Phase 7 fixtures)
expected: |
  Each of the 5 NEW Phase 7 smoke fixtures (B-pv-validation, D-advisor-budget,
  D-reviewer-budget, D-security-reviewer-budget, E-verify-before-commit) exits 0
  with all [OK] assertions.
result: issue
severity: major
reported: |
  Ran B-pv-validation.sh on Windows arm64 Git Bash. Two distinct problems surfaced:

  (1) Git Bash POSIX path translation mangles `claude.exe -p "/lz-advisor.plan ..."`
      into `-p "C:/Program Files/Git/lz-advisor.plan ..."`, breaking the slash command.
      Workaround: invoke fixture with `MSYS_NO_PATHCONV=1 MSYS2_ARG_CONV_EXCL='*'`.
      With this env, claude.exe receives the prompt correctly and the agent runs.

  (2) Even with workaround applied, rg.exe assertions inside the fixture cannot read
      `$OUT="$SCRATCH/B-output.jsonl"` because $SCRATCH is `/tmp/lz-advisor-bpv-XXXX`
      (Git Bash POSIX path) but rg.exe is Windows-native and cannot resolve `/tmp/...`
      to its actual `C:\Users\...\AppData\Local\Temp\lz-advisor-bpv-XXXX\` location.
      Errors: `rg: /tmp/lz-advisor-bpv-XXXX/B-output.jsonl: Den angivne sti blev ikke
      fundet. (os error 3)`. Result: assertions 1 + 2 fire ERROR, assertion 5 fires
      SKIP, while the JSONL trace itself contains valid agent activity (4 WebSearch
      invocations + 2 ToolSearch invocations + structured trust-contract reasoning
      visible in thinking blocks).

  Counter-evidence (positive signal): the captured JSONL trace shows Plan 07-07's
  default-on ToolSearch rule firing as the FIRST Phase 1 action -- the agent emits
  `ToolSearch select:WebSearch,WebFetch` before any local-project read, which is
  the load-bearing Gap 1 closure behavior. The empirical fix landed structurally
  AND fires correctly; the smoke fixture's assertion layer just cannot see it on
  Windows.

  Net assessment: smoke-fixture infrastructure has a Windows-Git-Bash path-translation
  defect (pre-existing across all fixtures using rg.exe + mktemp -d, predates
  Phase 7 -- inherited from Phase 5.4 KCB-economics.sh canonical pattern). Phase 7
  deliverables are correct; the regression-gate infrastructure needs Windows-compat
  fixes (suggested: replace `mktemp -d -t lz-...-XXXX` with `mktemp -d` on
  `$LOCALAPPDATA\Temp` OR use `cygpath -w "$OUT"` before passing to rg.exe).

  Other 4 fixtures (D-{advisor,reviewer,security-reviewer}-budget.sh +
  E-verify-before-commit.sh) NOT run -- same env issue would block them. Defer to
  Linux/WSL run or follow-up phase that addresses Windows fixture compat.

### 2. Plan skill default-on ToolSearch (Plan 07-07 / Gap 1)
expected: |
  Invoke `/lz-advisor.plan` with input that contains agent-generated source material.
  The executor invokes `ToolSearch select:WebSearch,WebFetch` as its FIRST Phase 1
  action.
result: skipped
reason: Deferred to user's manual Compodoc UAT (per user instruction 2026-05-02).
        Smoke fixture trace shows the rule firing structurally — see Test 1 trace evidence.

### 3. Execute skill wip-discipline subject-prefix rule (Plan 07-08 / Gap 2)
expected: |
  Invoke `/lz-advisor.execute` on a long-running validation task. wip: subject prefix
  enforced when commit body contains `## Outstanding Verification`.
result: skipped
reason: Deferred to user's manual Compodoc UAT. E-verify-before-commit.sh smoke fixture
        not run (same Windows env issue as Test 1).

### 4. Word-budget enforcement on agents (Plan 07-04)
expected: |
  D-{advisor,reviewer,security-reviewer}-budget.sh smoke fixtures all exit 0.
result: skipped
reason: Same Windows env issue as Test 1 (mktemp -d POSIX path + rg.exe Windows-native
        path resolution mismatch). Word-budget prose verified structurally via
        WR-01 fix in code-review (commit 8c00c3e); CI-level empirical verification
        deferred.

### 5. Reviewer Class-2 escalation hook (Plan 07-05)
expected: |
  /lz-advisor.review on a Class-2 question emits a structured `<verify_request>` block.
  Reviewer retains `tools: ["Read", "Glob"]` (no privilege escalation).
result: skipped
reason: Deferred to user's manual Compodoc UAT. Tool-grant least-privilege verified
        structurally in security audit (07-SECURITY.md T-07-05-01).

### 6. Confidence-laundering chain guards (Plan 07-03)
expected: |
  4 guards present across plugin: Hedge propagation rule, Version-qualifier anchoring,
  Cross-Skill Hedge Tracking, Verdict scope: marker.
result: pass
evidence: |
  - Hedge propagation rule: 1 occurrence in references/context-packaging.md
  - Version-qualifier anchoring: 1 occurrence in references/context-packaging.md
  - Cross-Skill Hedge Tracking: 1 occurrence in references/orient-exploration.md
  - Verdict scope: marker: present in all 4 SKILL.md (1 each in plan/review/security-review;
    5 in execute SKILL.md per Plan 07-08 wip-discipline carve-out additions)

### 7. Trust contract byte-identity across 4 SKILL.md
expected: |
  `<context_trust_contract>` and `<orient_exploration_ranking>` blocks byte-identical
  across plan/execute/review/security-review SKILL.md.
result: pass
evidence: |
  SHA256 cross-file diff:
  - <context_trust_contract>: 4abccf51224f980bb297f56de97ff4f6e37ce1465581ea1764dfb4628c0116e5
    (identical across all 4 SKILL.md)
  - <orient_exploration_ranking>: e40c7b3c0789a9780bf28d8bacb2eb9c0b436494f6476ad51a595b0380343a91
    (identical across all 4 SKILL.md)

### 8. Plugin version 0.11.0 across 5 surfaces (Plan 07-07)
expected: |
  Plugin version bump 0.10.0 -> 0.11.0 consistent across plugin.json + 4 SKILL.md
  frontmatter. Zero 0.10.0 remnants.
result: pass
evidence: |
  - plugins/lz-advisor/.claude-plugin/plugin.json: "version": "0.11.0"
  - plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md: version: 0.11.0
  - plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md: version: 0.11.0
  - plugins/lz-advisor/skills/lz-advisor.review/SKILL.md: version: 0.11.0
  - plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md: version: 0.11.0
  ASCII compliance verified (zero matches for em/en dashes, curly quotes, ellipsis).

## Summary

total: 8
passed: 3
issues: 1
pending: 0
skipped: 4
blocked: 0

## Gaps

- truth: Smoke fixture suite runs cleanly on operator's local environment (current operator: Windows arm64 + Git Bash)
  status: failed
  reason: Windows Git Bash POSIX path translation incompatibility with rg.exe Windows-native path resolution. Pre-existing infrastructure defect inherited from Phase 5.4 canonical fixture pattern (mktemp -d + rg.exe). Counter-evidence in JSONL trace shows Plan 07-07 + Plan 07-01 deliverables firing correctly at runtime.
  severity: major
  test: 1
  artifacts: []
  missing:
    - Windows-compat shim in smoke fixture infrastructure (cygpath -w wrapping for rg.exe path args, OR mktemp -d on $LOCALAPPDATA/Temp)
    - Or alternatively: documented requirement that fixture suite runs only under Linux/WSL/macOS, with CI matrix explicit
