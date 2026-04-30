---
status: complete
phase: 06-address-phase-5-6-uat-findings
source:
  - 06-05-SUMMARY.md
  - 06-06-SUMMARY.md
  - 06-07-SUMMARY.md
plugin_version: 0.9.0
testbed: D:/projects/github/LayZeeDK/ngx-smart-components
testbed_branch: main
scenario: Compodoc + Storybook 10 + Angular signals integration (canonical D-04 UAT scenario, fresh on plugin 0.9.0)
session_log: c:/Users/LarsGyrupBrinkNielse/.claude/projects/D--projects-github-LayZeeDK-ngx-smart-components/a75fae2f-dc3f-45d2-a0aa-7d9e5f518b77.jsonl
plan_output: D:/projects/github/LayZeeDK/ngx-smart-components/plans/compodoc-storybook-setup.plan.md
started: 2026-04-30T09:07:30Z
updated: 2026-04-30T09:35:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Skill activation on Compodoc+Storybook setup prompt
expected: In a new Claude Code session in `D:/projects/github/LayZeeDK/ngx-smart-components` (branch `main`, no Compodoc pre-installed), invoke the plan skill on a Compodoc + Storybook + Angular signals integration prompt. The lz-advisor.plan skill activates, executor begins the orient phase, and follows the plan SKILL.md workflow (orient → consult advisor → write plan file).
result: pass
evidence: Session JSONL at line 4 contains the lz-advisor.plan SKILL.md `<consult>...</consult>` and `<produce>...</produce>` blocks loaded into context (Pattern D `## Phase 3: Produce the Plan` machinery active). One `Agent` (advisor) tool spawn observed (line ~261). Plan output written via Write tool (1 Write block) to `plans/compodoc-storybook-setup.plan.md`. Workflow ran end-to-end: orient → consult → render Strategic Direction → write plan.

### 2. WebSearch fires during orient (Pattern D Class 2/3)
expected: During the orient phase, the executor invokes `WebSearch` at least once on a version-aware Class-2/3 query shape. Tool call is visible in the live session.
result: pass
evidence: 3 WebSearch calls, all version-aware Class-2/3 shape:
  1. `Storybook 10 Compodoc Angular Nx setup docs tab JSDoc 2026`
  2. `Storybook 10 angular compodoc preview.ts STORYBOOK_COMPODOC_JSON window global setup 2026`
  3. `compodoc Angular signal input() output() support JSDoc 2025 2026`
All three include explicit version markers (`Storybook 10`, `1.2.1`, `2025`/`2026`) that match Pattern D Class-2 (API currency) and Class-3 (migration / deprecation) shape per `references/orient-exploration.md`.

### 3. WebFetch fires during orient (Pattern D Class 2/3)
expected: During the orient phase, the executor invokes `WebFetch` at least once against a vendor-doc URL. Combined with Test 2, total web tool count >= 1 satisfies the D-04 web-usage gate.
result: pass
evidence: 1 WebFetch call to `https://nx.dev/docs/technologies/test-tools/storybook/guides/angular-storybook-compodoc` (vendor authoritative source, prompt requested complete setup steps including `setCompodocJson` API). Combined web tool count: 4 (3 WebSearch + 1 WebFetch). D-04 web-usage gate (>=1) MET. Bonus: 1 `ToolSearch select:WebSearch,WebFetch` invocation — Plan 06-05 ToolSearch-availability rule fired structurally.

### 4. Pre-Verified Claims block in advisor consultation
expected: The advisor consultation prompt contains at least one `<pre_verified>` block synthesizing a vendor-API fact verified during orient. D-05 closure signal met.
result: pass
evidence: 15 `<pre_verified>` opening tags + 14 pv-* synthesizer references in session JSONL. The standout pv-* claim caught a vendor-API regression: `<claim>setCompodocJson is no longer exported from @storybook/addon-docs/angular in Storybook 10.3.5; a global-write path is required instead.</claim>` with `<evidence method=...>` empirical anchor. This is exactly the regression vector that plugin 0.8.7 missed and plugin 0.9.0 now catches via Pattern D's web-first orient. D-05 closure signal exceeds threshold (>=1) by 15x.

### 5. Plan output uses tags:['autodocs']
expected: The generated plan file recommends Storybook 10 autodocs via `tags: ['autodocs']` on the meta object. Does NOT use deprecated `parameters: { docs: { autodocs: true } }` shape or `@storybook/addon-docs` plugin install.
result: pass
evidence: `plans/compodoc-storybook-setup.plan.md` line 53: `tags: ['autodocs'],` inside the `Preview` config in `.storybook/preview.ts`. Step 5 rationale (line 58) explicitly notes this is the post-Storybook-8 mechanism. No `parameters.docs.autodocs` shape anywhere; no `@storybook/addon-docs` package install instruction.

### 6. Plan output omits @storybook/addon-docs
expected: The generated plan does NOT instruct the user to install `@storybook/addon-docs` as a separate package. Autodocs in Storybook 10 is built-in via the `tags: ['autodocs']` flag.
result: pass
evidence: Plan output does not list `@storybook/addon-docs` in any install/Step instruction. The single addon-docs reference in the session is in a pre-verified claim explicitly EXCLUDING it: `setCompodocJson is no longer exported from @storybook/addon-docs/angular in Storybook 10.3.5`. Plan Step 5 rationale (line 58) substitutes the global-write path: `(global as any).__STORYBOOK_COMPODOC_JSON__ = docJson;`. This is the exact regression vector flagged in 06-VERIFICATION.md amendment 1 (plugin 0.8.7 wrongly added addon-docs); plugin 0.9.0 correctly omits it via empirical verification rather than naive vendor-doc copy.

### 7. Plan catches Compodoc 1.2.1 signal-class gotcha
expected: The generated plan addresses the Compodoc 1.2.1 quirk for signal `input()` / `output()` classification, OR flags this as a known limitation with a workaround.
result: pass
evidence: Plan Step 6 rationale (line 91) addresses signal-class behavior via empirically-verified version claim and OUTPUT fallback: "Compodoc 1.2.1 supports `input()` signals (added in 1.1.24). `output()` support in Compodoc is unconfirmed as of 1.2.1 -- if the Docs tab shows `sampleOutput` as a property rather than an output, or omits it, fall back by replacing `output<void>()` with `new EventEmitter<void>()` and adding `@Output()` decorator." Key Decisions block (line 110) reaffirms the `output()` signal fallback as the safe path for verified Docs tab rendering. The plan does not use `argTypes.<name>.table.category` overrides because Compodoc 1.2.1 input-side classification is empirically claimed correct (verifiable at execution); the OUTPUT-side gotcha is explicitly hedged with a fallback. PASS with caveat: input-side claim must be verified at execute time per the test's "verify ... renders the output" step.

### 8. Advisor Strategic Direction within word budget
expected: The advisor's Strategic Direction is concise (<= 100 words) and enumerated. Hedge markers survive verbatim.
result: issue
reported: "Word count: 120 words (5 enumerated steps + Critical line). Exceeds 100-word cap by 20 words (~20% over)."
severity: minor
evidence: Strategic Direction (session line 263 + plan output lines 5-11):
  - 5 numbered steps (12 + 21 + 17 + 22 + 30 = 102 words)
  - 1 `**Critical:**` line (17 words)
  - Total: 120 words
Hedge markers DO survive: `verify the Docs tab renders the output (fall back to ... if Compodoc 1.2.1 still skips output())` is the verify-first frame for an unconfirmed claim. The advisor structure is correct (enumerated, hedge-preserving); the only failure is word count vs the 100-word cap.

### 9. Class 2-S does not fire in plan skill
expected: The plan skill's orient phase does NOT invoke `npm audit` or fetch GitHub Security Advisories or run a CVE-currency check. Class 2-S is scoped to lz-advisor.security-review per amendment 4.
result: pass
evidence: 0 `npm audit` references, 0 `github.com/advisories` URL refs, 0 `Class 2-S` text refs, 0 `pv-no-known-cves` blocks in the entire plan-skill session JSONL. Class 2-S correctly stayed scoped to security-review skill per Plan 06-06 cross-reference discipline. No scope-creep regression.

### 10. Trust-contract provenance classification visible in SKILL.md load
expected: The plan SKILL.md loaded into the session contains the new `<context_trust_contract>` block with `Vendor-doc authoritative source` and `Agent-generated source material` provenance classification.
result: pass
evidence: `git grep -c` against `plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md` returns 1 match each for: `Vendor-doc authoritative source`, `Agent-generated source material`, `ToolSearch select:WebSearch,WebFetch`. All 3 Plan 06-05 sentinels present. The session log at line 4 includes the consultation prompt context that loaded this SKILL.md region (the executor's behavior — invoking `ToolSearch select:WebSearch,WebFetch` then 3 WebSearch + 1 WebFetch — empirically demonstrates the trust-contract + ToolSearch-availability rule wired through to runtime steering on a fresh-context Class-2/3 question (not agent-generated input)).

## Summary

total: 10
passed: 9
issues: 1
pending: 0
skipped: 0
blocked: 0

## Gaps

```yaml
- truth: "Advisor Strategic Direction stays within 100-word cap"
  status: failed
  reason: "User reported: Word count 120 words; 20-word overrun. Enumeration + hedge markers correct, only word count fails."
  severity: minor
  test: 8
  artifacts:
    - "plugins/lz-advisor/agents/advisor.md (advisor system prompt; word-budget directive)"
    - "D:/projects/github/LayZeeDK/ngx-smart-components/plans/compodoc-storybook-setup.plan.md (Strategic Direction body, 120 words)"
  missing: []
  diagnosis_pre_existing: |
    This is the SAME word-budget regression already captured in 06-VERIFICATION.md:
    - Stage 1 KCB-economics smoke (DEF-response-structure.sh) recorded "Word-budget: advisor Strategic Direction 111 words (>100 cap)" on plugin 0.8.5.
    - Amendment 1 (2026-04-29) classified it as "FAIL (orthogonal; separate follow-up)".
    - Amendment 5 final residual scope lists the word-budget concern under Phase 7 Finding D (security-reviewer specifically; the advisor-side regression is the parallel surface).
    Plugin 0.9.0 confirms the regression persists (120 words, slight increase from 0.8.5's 111 words).
    Root surface: `plugins/lz-advisor/agents/advisor.md` system prompt's word-budget directive is descriptive ("aim for 100 words") rather than enforcing; on Compodoc+Storybook prompts the advisor synthesizes 5-step plans with code snippets that organically exceed 100 words.
    Fix surface candidates: (a) tighten advisor.md word-budget directive to imperative cap with example of clipping; (b) add a post-render trim step in the plan SKILL.md `## Phase 3` `<produce>` block; (c) accept 120 words as the practical cap for code-snippet-laden Strategic Directions and update the directive to match.
  routing: |
    Out of scope for this UAT's gap-closure. Already tracked under residual Phase 7 scope per 06-VERIFICATION.md amendment 5. No new fix plan needed; recommend folding into Phase 7's word-budget surface alongside Finding D (security-reviewer agent word-budget regression) for unified treatment.
```

## Phase 6 Empirical Result on Canonical D-04 Scenario (plugin 0.9.0)

This UAT is a fresh end-to-end Compodoc + Storybook setup test on plugin 0.9.0 against the canonical D-04 scenario (`ngx-smart-components` on `main`, no Compodoc pre-installed). It is distinct from the 3 narrow regression-replay UATs (`uat-plan-skill-fixes-rerun`, `uat-execute-skill-fixes-rerun`, `uat-security-review-skill-rerun`) recorded in 06-VERIFICATION.md amendment 5; those replayed agent-generated-input fixtures that suppress Pattern D, while this UAT exercises a fresh user prompt that Pattern D should steer.

### Empirical contrast vs prior runs

| Metric | Plugin 0.8.5 (Stage 1, KCB-synth) | Plugin 0.8.9 (amendment 1, Compodoc) | Plugin 0.9.0 (this UAT) |
|--------|------------------------------------|----------------------------------------|-------------------------|
| WebSearch calls | 0 | 2 | 3 |
| WebFetch calls | 0 | 5 | 1 |
| Total web tools | 0 | 7 | 4 |
| ToolSearch invocations | n/a | n/a | 1 (Plan 06-05 rule fired) |
| `<pre_verified>` blocks | 0 | 4 | 15 |
| pv-* synthesizers | 0 | 4 | 14 |
| `tags:['autodocs']` correct | n/a | yes | yes |
| `@storybook/addon-docs` wrongly added | n/a | no | no |
| Compodoc signal-class gotcha caught | no | yes | yes |
| Word-budget compliance | 111w (FAIL) | not measured | 120w (FAIL) |

### Verdict on Phase 6 deliverables (this UAT)

| Deliverable | Verdict | Evidence |
|-------------|---------|----------|
| Plan 06-05 (G1+G2 trust-contract + ToolSearch-availability rule) | **PASS-empirical** on net-new vendor-API question | ToolSearch invoked once; 3 WebSearch + 1 WebFetch fired; trust-contract sentinels present and behaviorally selected on fresh-context Class-2/3 prompt. Note: empirical residual on agent-generated-input fixtures (per amendment 5) is unchanged; this UAT does not contradict that finding because the input shape is different (fresh prompt, not @-mention to plan/review file). |
| Plan 06-06 (G3 Class 2-S taxonomy + cross-reference) | **PASS** scope discipline | 0 Class 2-S sentinels in plan-skill session; correctly NOT firing outside security-review. |
| Plan 06-07 (version 0.9.0 bump + replay) | **PASS** | Plugin 0.9.0 surfaces all present in session; trust-contract + Class 2-S structurally landed. |
| D-04 web-usage gate (`web_uses >= 1`) | **PASS** | 4 web tool calls (3 WebSearch + 1 WebFetch). |
| D-05 closure-signal contract (Pre-Verified) | **PASS** | 15 `<pre_verified>` blocks (>>1 threshold). |
| User directive: "We must see WebSearch+WebFetch usage" | **PASS** | Both fired; no Bash substitutes. |
| Strict first-action compliance | **CAVEAT** (not a regression) | First tool calls are local Bash/Read; web tools fire after orientation. Per amendment 1: this is consistent with Sonnet 4.6 calibration; descriptive ranking dampens but does not eliminate local-first bias. Plan output reflects real vendor research regardless. |
| DEF Word-budget regression | **FAIL** (pre-existing residual) | 120 words vs 100 cap; tracked under Phase 7 Finding D-parallel. |

### Notable plan quality signals (qualitative)

The plan caught a vendor-API regression that pure vendor-doc reading would have missed: the nx.dev guide instructs `import { setCompodocJson } from '@storybook/addon-docs/angular'`, but the executor's empirical Read of `node_modules/@storybook/addon-docs/angular/package.json` (verifiable in session) confirmed `setCompodocJson` is no longer exported in `@storybook/angular@10.3.5`. The pv-* claim block synthesized this as `<claim>setCompodocJson is no longer exported from @storybook/addon-docs/angular in Storybook 10.3.5; a global-write path is required instead.</claim>` with empirical evidence anchor. The plan's Step 5 rationale (line 58) propagates this correctly: "`setCompodocJson` is not exported from `@storybook/angular` v10.3.5 dist (verified). The compodoc JSON is consumed by the framework via `global.__STORYBOOK_COMPODOC_JSON__`." This is exactly the Pattern D + Pre-Verified Claims contract working as designed: vendor-doc was authoritative on macro-shape but stale on micro-API; empirical Read closed the gap.

The plan also correctly hedges the OUTPUT signal classification with a fallback path (`@Output() new EventEmitter<void>()` if Compodoc 1.2.1 skips signal `output()`), preserving the verify-first marker into the consultation prompt verbatim per the Plan 06-05 hedge-marker preservation rule.

### Closure status

Phase 6's PARTIAL gate verdict (06-VERIFICATION.md amendment 5) stands. This UAT confirms:
- The empirical PASS on net-new vendor-API questions (amendment 1's primary finding) is preserved on plugin 0.9.0.
- The structural improvements from Plans 06-05/06/07 do not regress runtime behavior on the canonical scenario.
- The DEF word-budget regression persists; tracked under residual Phase 7 scope. No new fix plan required.

This UAT is informational; the single issue surfaced is already in the residual backlog. No `/gsd-execute-phase --gaps-only` follow-up is required for this session.
