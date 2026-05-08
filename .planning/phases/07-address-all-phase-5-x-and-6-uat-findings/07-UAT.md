---
status: complete
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
updated: 2026-05-08T11:30:00Z
note: Tests 2-5 originally `skipped` (deferred to manual Compodoc UAT) are now resolved by 07-UAT-REPLAY-0.13.1.md (2026-05-08 8-session UAT against ngx-smart-components on plugin 0.13.1; PASSED_WITH_RESIDUAL); see 07-VERIFICATION.md closure_amendment_2026_05_08_uat_replay_0_13_1 for the supersession block.
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
  status: resolved
  resolved_by: commit 6efd8c4 (fix(smoke) -- adds MSYS_NO_PATHCONV=1 + cygpath -w shim across all 5 fixtures; verified by re-runs all exiting 0/1/2 correctly)
  reason: Windows Git Bash POSIX path translation incompatibility with rg.exe Windows-native path resolution. Pre-existing infrastructure defect inherited from Phase 5.4 canonical fixture pattern (mktemp -d + rg.exe).
  severity: major
  test: 1
  artifacts: [plugins/lz-advisor/../smoke-tests/B-pv-validation.sh, D-advisor-budget.sh, D-reviewer-budget.sh, D-security-reviewer-budget.sh, E-verify-before-commit.sh]

- truth: Reviewer agent emits <=300 words aggregate across Findings + Cross-Cutting Patterns + Missed surfaces sections (Plan 07-04 sub-cap)
  status: failed
  reason: |
    Empirical baseline on plugin 0.11.0 with the now-fixed D-reviewer-budget.sh extraction:
    aggregate 396 words, 32% over the 300w cap. Per-entry caps hold (entries 52-63w each,
    well under 80w cap), Cross-Cutting Patterns 132w (under 160w cap), but the aggregate
    exceeds the cap by adding all section bodies together. Plan 07-04 landed structural
    sub-cap PROSE in agents/reviewer.md but the prose alone does not constrain Sonnet 4.6
    enough to meet the 300w aggregate. The vacuous-pass extraction defect (commit 0065425
    fixed it) had been masking this regression empirically since Plan 07-04 shipped.
    Matches the Plan 07-04 fixture-comment baseline (411w on plugin 0.9.0).
  severity: major
  test: 1
  artifacts:
    - plugins/lz-advisor/agents/reviewer.md (prose sub-caps)
    - .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-reviewer-budget.sh (now correctly enforces)
  missing:
    - Stronger compliance mechanism than descriptive prose (e.g., ALL-CAPS hard rule + worked example showing 300w-compliant output, or a different prompt structure)
    - Web research on Anthropic-recommended techniques for output-length constraints on Sonnet 4.6 / Opus 4.7

- truth: Security-reviewer agent emits <=300 words aggregate across Findings + Threat Patterns + Missed surfaces sections (Plan 07-04 sub-cap)
  status: failed
  reason: |
    Empirical baseline on plugin 0.11.0 with the now-fixed D-security-reviewer-budget.sh
    extraction: aggregate 414 words, 38% over the 300w cap. Per-entry caps hold (entries
    52-67w each), Threat Patterns 130w (under 160w cap), but the aggregate plus
    Missed surfaces (33w / 30w cap) compounds. Plan 07-04 noted security-reviewer is
    the "WORST regression among the 3 agents" (412-438w on 0.9.0); current 414w confirms
    the regression persists. Vacuous-pass masked this since Plan 07-04 shipped.
  severity: major
  test: 1
  artifacts:
    - plugins/lz-advisor/agents/security-reviewer.md (prose sub-caps + WORST-regression note)
    - .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-security-reviewer-budget.sh (now correctly enforces)
  missing:
    - Same as reviewer gap above plus security-reviewer-specific reinforcement
    - Possible model behaviour: Opus 4.7 effort xhigh may inherently emit more words in justification chains; investigate whether to lower effort for word-count-bound output OR introduce a post-emission self-trim pass

- truth: Security-reviewer "Missed surface:" inline section <=30 words
  status: failed
  reason: 33 words, 10% over the 30w cap (D-security-reviewer-budget.sh after extraction fix). Minor compared to aggregate but still a budget violation. The reviewer/security-reviewer agents emit Missed surfaces as inline `**Missed surface:**` bold prose rather than a `### Missed surfaces` heading -- the contract didn't anticipate this shape.
  severity: minor
  test: 1
  artifacts:
    - plugins/lz-advisor/agents/security-reviewer.md
  missing:
    - Tighter prose budget OR explicit "approximately 25 words" target with worked example

- truth: D-reviewer/D-security-reviewer-budget.sh extraction patterns correctly parse current reviewer output shape
  status: resolved
  resolved_by: commit 0065425 (fix(smoke) -- repair extraction patterns; awk ^$ replaced with explicit boundaries; per-entry split now accepts both `N. ` and `**Finding N:**` shapes; Missed-surface detection accepts inline bold marker)
  reason: Three defects were causing vacuous PASS verdicts -- awk ^$ terminator, per-entry regex shape mismatch, Missed-surface heading-vs-inline mismatch. Once fixed, the budget regressions above became visible.
  severity: major
  test: 1
  artifacts:
    - .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-reviewer-budget.sh
    - .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-security-reviewer-budget.sh
