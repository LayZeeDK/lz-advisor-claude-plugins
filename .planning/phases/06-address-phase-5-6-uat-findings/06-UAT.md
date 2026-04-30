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
sessions:
  - skill: lz-advisor.plan
    log: c:/Users/LarsGyrupBrinkNielse/.claude/projects/D--projects-github-LayZeeDK-ngx-smart-components/a75fae2f-dc3f-45d2-a0aa-7d9e5f518b77.jsonl
    output: D:/projects/github/LayZeeDK/ngx-smart-components/plans/compodoc-storybook-setup.plan.md
    tests: 1-10
    status: complete
  - skill: lz-advisor.execute
    log: c:/Users/LarsGyrupBrinkNielse/.claude/projects/D--projects-github-LayZeeDK-ngx-smart-components/bf522c6e-1001-4a6a-9cfb-7885f9276386.jsonl
    output: 2 commits on testbed branch (feat + fix)
    tests: 11-17
    status: complete
started: 2026-04-30T09:07:30Z
updated: 2026-04-30T11:50:00Z
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

---

## Execute-Skill UAT (Tests 11-17)

**Load-bearing question:** Does Plan 06-05 G2 (trust-contract + ToolSearch-availability rule) flip behavior when input is the agent-generated plan file? Per 06-VERIFICATION.md amendment 5, the prior `uat-execute-skill-fixes-rerun` recorded FAIL: 0 web tools, 0 ToolSearch on plan-file input. This UAT runs against the fresh `plans/compodoc-storybook-setup.plan.md` produced by Tests 1-10 (which contains a verify-first hedge marker on Compodoc OUTPUT signal classification — a textbook Class-2 trigger for Pattern D).

**Execute session log:** `c:/Users/LarsGyrupBrinkNielse/.claude/projects/D--projects-github-LayZeeDK-ngx-smart-components/bf522c6e-1001-4a6a-9cfb-7885f9276386.jsonl` (142 lines, 285 KB)

### 11. Execute skill activation on canonical plan file
expected: In `D:/projects/github/LayZeeDK/ngx-smart-components` (branch `main`), invoke `/lz-advisor.execute` with `plans/compodoc-storybook-setup.plan.md` as the input. The lz-advisor.execute skill activates, executor begins the orient phase reading the plan file + project context, follows the execute SKILL.md workflow (orient → pre-execute consult → execute steps → final verification consult).
result: pass
evidence: 2 `Agent` (advisor) tool spawns observed: `description="Pre-execute advisor consultation for Compodoc + Storybook setup"` and `description="Final advisor review of Compodoc + Storybook integration"`. Workflow ran end-to-end: orient (10 plan-file references in session), pre-execute consult, execute steps (4 Write + 6 Edit + 6 Bash), final consult, 2 commits. Skill activation confirmed.

### 12. Hedge marker triggers ToolSearch / Pattern D in execute orient
expected: The plan input contains the verify-first hedge marker `verify the Docs tab renders the output (fall back to ... if Compodoc 1.2.1 still skips output())`. Per Plan 06-05 G2 ToolSearch-availability rule, the execute skill orient phase MUST invoke `ToolSearch select:WebSearch,WebFetch`. Visible: at least 1 `ToolSearch` tool_use block in the execute session JSONL.
result: issue
reported: "0 ToolSearch tool_use blocks in the execute session. Plan 06-05 G2 ToolSearch-availability rule did NOT fire on agent-generated plan-file input despite the verify-first hedge marker being present (count: 1 'fall back to' string + 1 'still skips output' string in session — marker WAS in context, but did not trigger the rule)."
severity: major
evidence: |
  - `rg -c '"name":"ToolSearch"'` on session JSONL returns 0.
  - The hedge marker is present in session: `verify the Docs tab renders the output (fall back to ... if Compodoc 1.2.1 still skips output())` — visible in plan input echo at multiple turns.
  - Same failure mode as 06-VERIFICATION.md amendment 5's `uat-execute-skill-fixes-rerun` on plugin 0.9.0: structural surface (sentinels in SKILL.md) present, but behavior unchanged from 0.8.9 baseline on this fixture class.
  - This is the load-bearing **G1+G2 empirical residual** that amendment 5 promoted to Phase 7 scope ("non-text steering mechanism — advisor refusal-pattern, hook, hard skill prefix — or stronger upstream trigger for the ToolSearch-availability rule").

### 13. WebSearch / WebFetch fires on hedge-marker Class-2 question
expected: Following ToolSearch (or independently), the executor invokes WebSearch and/or WebFetch at least once on a question shape concerning the hedged claim. Total `WebSearch + WebFetch` call count >= 1 in the execute session. Closes the empirical residual flagged in amendment 5.
result: issue
reported: "0 WebSearch + 0 WebFetch tool_use blocks in execute session. Pattern D web-first prescription suppressed by plan-file authoritative-source treatment despite the verify-first hedge marker. Empirical residual on plugin 0.9.0 confirmed."
severity: major
evidence: |
  - `rg -c '"name":"WebSearch"'` returns 0; `rg -c '"name":"WebFetch"'` returns 0.
  - Advisor `web_search_requests` and `web_fetch_requests` aggregates both = 0 across all turns.
  - Bash invocations during orient: `npm install --save-dev @compodoc/compodoc@^1.2.1`, `git status`, `git diff --stat HEAD`, `git add ...`, `git commit ...`. No web-side verification of the Compodoc 1.2.1 signal `output()` claim.
  - This is the SAME root cause as Test 12: trust-contract carve-out classifies the plan as "agent-generated source" prose-wise but Sonnet 4.6 does not re-rank to web-first behaviorally on this input shape.

### 14. Hedge marker survives into pre-execute consultation
expected: The pre-execute advisor consultation prompt's `## Source Material > Plan Strategic Direction` block contains the verify-first hedge marker verbatim. The marker is NOT stripped, paraphrased, or promoted into a `## Pre-verified Claims` section as if resolved. Plan 06-05 hedge-marker preservation rule.
result: pass
evidence: |
  - `fall back to` appears 1+ times in session JSONL (in pre-execute consultation source material).
  - `still skips output` appears 1+ times in session.
  - The full hedge phrase "verify the Docs tab renders the output (fall back to `@Output() sampleOutput = new EventEmitter<void>()` if Compodoc 1.2.1 still skips `output()`)" is preserved verbatim in the consultation prompt's source material section.
  - The Plan 06-05 hedge-marker preservation rule works at the **prompt-construction layer** — the marker survived the carve-out into the consultation prompt unstripped. This is structural success.
  - Caveat: Test 14 PASS + Tests 12/13 FAIL = the prompt-layer preservation works but does not produce execution-layer steering. The hedge survived the prompt; the executor still chose the optimistic path (Test 15).

### 15. Implementation correctly handles signal output() classification
expected: After the executor runs Plan Step 6 (add JSDoc + signal input/output) and the build/storybook task (or a Compodoc dry run), the executor empirically determines whether Compodoc 1.2.1 classifies signal `output()` correctly. Either: (a) works → signal `output()` committed; OR (b) doesn't → fallback `@Output() new EventEmitter<void>()` committed. Test fails if the executor commits without verifying the assumption.
result: issue
reported: "Executor wrote 2-byte stub `documentation.json` ({}), never ran Compodoc to generate real JSON, never read documentation.json to inspect signal classification, then committed signal `output()` path WITHOUT empirical verification. Hedge marker explicitly required 'verify the Docs tab renders the output' before the fallback decision; the verify step was skipped."
severity: major
evidence: |
  - 1 Write to `documentation.json` with content length = 2 bytes (literal `{}`); this is the empty stub for TypeScript first-run resolution per plan line 121.
  - 0 Reads of `documentation.json` in the entire session — executor never inspected real Compodoc output.
  - 0 references to `outputsClass`, `propertiesClass`, `inputsClass`, `methodsClass` — executor never ran Compodoc to generate the real JSON, never inspected its structure.
  - 0 `compodoc` CLI invocations as Bash commands; 0 `nx run *:storybook` or `nx build-storybook` invocations.
  - Final commit `feat(storybook): integrate Compodoc for Docs tab with signal inputs/outputs` lists "Add JSDoc, sampleInput signal, and sampleOutput signal to NgxSmartComponents" — chose signal `output()` (not the EventEmitter fallback) without verification.
  - **This is the verify-first violation.** The hedge marker survived into the consultation prompt verbatim (Test 14 PASS), but the executor committed without running the verification the hedge required.
  - Pattern: the prompt-layer preservation works (Plan 06-05 succeeded structurally), but the execution-discipline layer is missing the corresponding "if hedged, MUST verify before committing" rule. This is adjacent to Phase 7 Finding A (silent apply-then-revert) but the failure mode is different: not "apply then silently revert" but "apply without ever verifying."

### 16. Final commits match plan structure
expected: After execute completes, `git log` shows commits aligned with the plan's 7 Steps. Atomic-bundle commits with descriptive messages referencing plan steps are acceptable.
result: pass
evidence: |
  - 2 commits total in execute session:
    1. `feat(storybook): integrate Compodoc for Docs tab with signal inputs/outputs` — bundles plan Steps 1-7 into a single atomic feat commit. Commit body lists 8 distinct deliverables matching plan steps. Files: 8 (.gitignore, package.json, package-lock.json, .storybook/preview.ts, .storybook/tsconfig.json, .storybook/tsconfig.doc.json, project.json, ngx-smart-components.ts, ngx-smart-components.stories.ts).
    2. `fix(storybook): remove resolveJsonModule from tsconfig.doc.json, add documentation.json to outputs` — advisor-driven correction from final review consultation. Two-line rationale matching final-review feedback.
  - Atomic-bundle pattern is acceptable per execute SKILL.md (one feature commit + one fix commit driven by final consult). Plan structure traceable from commit messages.

### 17. Class 2-S does not fire in execute skill
expected: The execute skill's orient and execution phases do NOT invoke `npm audit` or fetch GitHub Security Advisories or run a CVE-currency check. 0 `npm audit` Bash invocations, 0 `github.com/advisories` URLs, 0 `pv-no-known-cves` blocks.
result: pass
evidence: |
  - `rg -c 'npm audit'` returns 4 — but ALL 4 matches are in the **standard `npm install` output text** ("Run `npm audit` for details"). NO executor-invoked `npm audit` Bash command. The Bash invocations history confirms: only `npm install --save-dev @compodoc/compodoc@^1.2.1` was run (which prints the standard advisory hint). 0 standalone `npm audit` Bash commands.
  - 0 `github.com/advisories` URL references.
  - 0 `Class 2-S` text references.
  - 0 `pv-no-known-cves` blocks.
  - Class 2-S correctly stayed scoped to security-review skill per Plan 06-06 cross-reference discipline. No scope-creep regression.

## Summary

total: 17
passed: 13
issues: 4
pending: 0
skipped: 0
blocked: 0

## Gaps

```yaml
- truth: "Advisor Strategic Direction stays within 100-word cap"
  status: failed
  reason: "Word count 120 words; 20-word overrun. Enumeration + hedge markers correct, only word count fails."
  severity: minor
  test: 8
  skill: lz-advisor.plan
  artifacts:
    - "plugins/lz-advisor/agents/advisor.md (advisor system prompt; word-budget directive)"
    - "D:/projects/github/LayZeeDK/ngx-smart-components/plans/compodoc-storybook-setup.plan.md (Strategic Direction body, 120 words)"
  missing: []
  diagnosis_pre_existing: |
    Same word-budget regression already captured in 06-VERIFICATION.md (Stage 1: 111 words; Amendment 1: orthogonal follow-up; Amendment 5: residual Phase 7 Finding D-parallel). Plugin 0.9.0 confirms regression persists (120 words).
  routing: |
    Already tracked under residual Phase 7 scope per amendment 5. No new fix plan needed.

- truth: "Plan 06-05 G2 ToolSearch-availability rule fires on agent-generated plan-file input with hedge marker"
  status: failed
  reason: "0 ToolSearch tool_use blocks in execute session despite verify-first hedge marker present in plan input. Trust-contract carve-out classifies the plan file as agent-generated source PROSE-WISE in SKILL.md but does not BEHAVIORALLY produce the ToolSearch invocation."
  severity: major
  test: 12
  skill: lz-advisor.execute
  artifacts:
    - "plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md (<context_trust_contract> ToolSearch-availability rule prose)"
    - "c:/Users/LarsGyrupBrinkNielse/.claude/projects/D--projects-github-LayZeeDK-ngx-smart-components/bf522c6e-1001-4a6a-9cfb-7885f9276386.jsonl (execute session, 0 ToolSearch)"
  missing:
    - "Non-text steering mechanism (advisor refusal-pattern, hook, hard skill prefix) per amendment 5 residual scope"
    - "Stronger upstream trigger for ToolSearch-availability rule (e.g., path-heuristic-only, not classification-gated)"
  diagnosis_pre_existing: |
    Same failure mode as 06-VERIFICATION.md amendment 5's `uat-execute-skill-fixes-rerun` on plugin 0.9.0. Amendment 5 explicitly promoted this to Phase 7 scope as the "G1+G2 empirical residual" with two interpretations (under-matching path heuristic; classification-gated short-circuit). This UAT confirms the residual on a NEW fixture (canonical Compodoc+Storybook plan, not the original plan-fixes input).
  routing: |
    Already tracked under residual Phase 7 scope per amendment 5 ("G1+G2 empirical residual"). This UAT extends the empirical evidence base from 1 fixture to 2 fixtures — the failure is robust across plan-file inputs, not specific to one prompt. Phase 7 must address.

- truth: "Pattern D web-first prescription fires on hedge-marker Class-2 question in execute skill"
  status: failed
  reason: "0 WebSearch + 0 WebFetch in execute session; advisor server_tool_use aggregates web_search_requests:0, web_fetch_requests:0. Same root cause as Test 12: Sonnet 4.6 does not behaviorally re-rank to web-first when input is agent-generated source despite the SKILL.md prose prescription."
  severity: major
  test: 13
  skill: lz-advisor.execute
  artifacts: (same as Test 12)
  missing: (same as Test 12)
  diagnosis_pre_existing: |
    Tests 12 and 13 are the same defect surface (Pattern D suppression on agent-generated plan-file input). They are listed as separate gaps because the test contracts are independent (ToolSearch availability vs web tool invocation) but a single fix in Phase 7 closes both.
  routing: |
    Already tracked under residual Phase 7 scope per amendment 5. Same fix surface as Test 12.

- truth: "Executor empirically verifies hedged claim before committing"
  status: failed
  reason: "Executor wrote 2-byte stub documentation.json ({}) per plan's first-run convention, but never ran Compodoc to generate real documentation.json, never read the JSON to inspect signal output() classification (0 references to outputsClass / propertiesClass / inputsClass / methodsClass in session), and committed the signal output() path WITHOUT empirical verification. The hedge marker explicitly required 'verify the Docs tab renders the output' before the fallback decision; verification was skipped."
  severity: major
  test: 15
  skill: lz-advisor.execute
  artifacts:
    - "plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md (execute workflow; verify-before-commit discipline)"
    - "c:/Users/LarsGyrupBrinkNielse/.claude/projects/D--projects-github-LayZeeDK-ngx-smart-components/bf522c6e-1001-4a6a-9cfb-7885f9276386.jsonl (0 documentation.json reads, 0 compodoc CLI invocations, 0 storybook build invocations)"
    - "D:/projects/github/LayZeeDK/ngx-smart-components/packages/ngx-smart-components/src/lib/ngx-smart-components/ngx-smart-components.ts (committed with signal output() not the EventEmitter fallback)"
  missing:
    - "Execute SKILL.md: verify-before-commit discipline rule for surviving hedge markers (if pre-execute consultation source material contains 'Verify ... before acting' or 'fall back to ... if ...', the corresponding verification action MUST be performed before the related commit; verification result MUST be added to the commit body or a follow-up commit)"
    - "Adjacent to but distinct from Phase 7 Finding A (silent apply-then-revert): this is 'apply without ever verifying'. May share a fix surface with Finding A's verify-before-revert-or-keep contract."
  diagnosis_new: |
    NEW finding from this UAT — not previously enumerated in 06-VERIFICATION.md amendments or PHASE-7-CANDIDATES.md.
    
    Pattern observed:
    1. Plan 06-05 hedge-marker preservation rule worked (Test 14 PASS): the marker survived into the pre-execute consultation prompt verbatim.
    2. The pre-execute advisor consultation saw the hedge but did not refuse to advise without verification.
    3. The executor proceeded with the optimistic path (signal output() instead of @Output() EventEmitter fallback) without running Compodoc to verify.
    4. The final advisor review consultation caught a different issue (resolveJsonModule misplacement) but did NOT challenge the unverified signal output() claim.
    5. Two commits landed; neither verified the hedged claim.
    
    Root surface: execute SKILL.md lacks an explicit "verify-before-commit discipline" rule for surviving hedge markers. The trust-contract + ToolSearch-availability rule are orient-phase prescriptions; this gap is at the execute-phase verify-before-commit layer.
  routing: |
    NEW Phase 7 candidate. Recommend adding to PHASE-7-CANDIDATES.md as Finding E (or merging with Finding A as a sub-pattern if Finding A's scope can be broadened from "apply-then-revert" to "apply without verify"). Fix surface is `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` execute-phase prose, plus possibly the advisor system prompt to make the advisor refuse-or-flag when source material contains unresolved hedges.
```

## Phase 6 Empirical Result on Canonical D-04 Scenario (plugin 0.9.0)

This UAT is a fresh end-to-end Compodoc + Storybook setup test on plugin 0.9.0 against the canonical D-04 scenario (`ngx-smart-components` on `main`, no Compodoc pre-installed). It is distinct from the 3 narrow regression-replay UATs (`uat-plan-skill-fixes-rerun`, `uat-execute-skill-fixes-rerun`, `uat-security-review-skill-rerun`) recorded in 06-VERIFICATION.md amendment 5; those replayed agent-generated-input fixtures that suppress Pattern D, while this UAT exercises a fresh user prompt that Pattern D should steer.

### Empirical contrast vs prior runs (PLAN-skill session)

| Metric | Plugin 0.8.5 (Stage 1, KCB-synth) | Plugin 0.8.9 (amendment 1, Compodoc) | Plugin 0.9.0 (this UAT, plan-skill) |
|--------|------------------------------------|----------------------------------------|-------------------------------------|
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

### Empirical contrast vs prior runs (EXECUTE-skill session)

| Metric | Plugin 0.8.9 (amendment 3, execute-fixes) | Plugin 0.9.0 amendment 5 (execute-fixes-rerun) | Plugin 0.9.0 (this UAT, execute-skill) |
|--------|--------------------------------------------|-------------------------------------------------|----------------------------------------|
| WebSearch calls | 0 | 0 | 0 |
| WebFetch calls | 0 | 0 | 0 |
| Total web tools | 0 | 0 | 0 |
| ToolSearch invocations | 0 | 0 | 0 |
| `<pre_verified>` blocks (carried from plan input) | n/a | 0 | 7 |
| pv-* synthesizers | 0 | 0 | 6 (carried from plan input) |
| Hedge marker survived to consultation | n/a | n/a | yes (Test 14 PASS) |
| Hedge marker triggered verification before commit | n/a | n/a | **no** (Test 15 FAIL — NEW finding) |

The execute-skill column on plugin 0.9.0 confirms the G1+G2 empirical residual flagged in amendment 5: the trust-contract rewrite + ToolSearch-availability rule did not produce ToolSearch / web-tool invocations on a NEW agent-generated plan-file input (different from the original execute-fixes fixture). The residual is robust across input fixtures, not specific to one prompt.

### Verdict on Phase 6 deliverables (this UAT, both sessions)

| Deliverable | Plan-skill verdict | Execute-skill verdict | Evidence |
|-------------|--------------------|----------------------|----------|
| Plan 06-05 G1+G2 trust-contract (provenance classification) | **PASS-empirical** on net-new vendor-API question | **FAIL-empirical** on agent-generated plan-file input (Tests 12, 13) | Plan-skill: ToolSearch fired + 4 web tool calls. Execute-skill: 0 ToolSearch + 0 web tools despite hedge marker present. Confirms amendment 5 residual on a 2nd fixture. |
| Plan 06-05 hedge-marker preservation rule | n/a | **PASS** prompt-construction layer (Test 14) | Hedge marker `verify the Docs tab renders the output (fall back to ... if Compodoc 1.2.1 still skips output())` survived verbatim into pre-execute consultation source material. |
| Plan 06-06 (G3 Class 2-S taxonomy + scope discipline) | **PASS** | **PASS** | 0 Class 2-S sentinels in either plan-skill or execute-skill session; correctly NOT firing outside security-review. |
| Plan 06-07 (version 0.9.0 bump) | **PASS** | **PASS** | Plugin 0.9.0 surfaces all present in both sessions. |
| D-04 web-usage gate (`web_uses >= 1`) | **PASS** | **FAIL** | Plan-skill: 4 calls. Execute-skill: 0 calls. Per-skill threshold for execute is unsatisfied. |
| D-05 closure-signal contract (Pre-Verified) | **PASS** | **PASS** (carried from input) | Plan-skill: 15 pv blocks. Execute-skill: 7 pv blocks (carried from plan input, not synthesized fresh). |
| Word-budget regression | **FAIL** (pre-existing) | n/a (single advisor consultation, not measured) | Plan-skill: 120w; tracked under residual scope. |
| Verify-before-commit discipline (NEW) | n/a | **FAIL-empirical** (Test 15) | Executor wrote 2-byte stub documentation.json, never ran Compodoc, never read JSON to inspect signal classification, committed without verification. NEW finding. |

### Notable plan quality signals (qualitative)

**Plan-skill session:** The plan caught a vendor-API regression that pure vendor-doc reading would have missed: the nx.dev guide instructs `import { setCompodocJson } from '@storybook/addon-docs/angular'`, but the executor's empirical Read of `node_modules/@storybook/addon-docs/angular/package.json` confirmed `setCompodocJson` is no longer exported in `@storybook/angular@10.3.5`. The pv-* claim block synthesized this as `<claim>setCompodocJson is no longer exported from @storybook/addon-docs/angular in Storybook 10.3.5; a global-write path is required instead.</claim>` with empirical evidence anchor. The plan correctly hedged the OUTPUT signal classification with a fallback path, preserving the verify-first marker per Plan 06-05's preservation rule.

**Execute-skill session:** The hedge marker survived into the pre-execute consultation prompt as designed (Plan 06-05 prompt-layer rule worked). However, the executor proceeded with the optimistic signal `output()` path without ever running Compodoc to verify the assumption. This is a NEW execute-discipline gap: the prompt-layer preservation works, but there is no execute-phase rule that says "if a hedge marker survives into source material, the corresponding verification action MUST be performed before the related commit." The advisor's pre-execute and final-review consultations also did not refuse-or-flag the unverified claim. Two commits landed: a feat commit (8 files, plan Steps 1-7 bundled) and a fix commit (advisor-driven correction on `resolveJsonModule` placement). The signal `output()` path was committed assuming Compodoc 1.2.1 supports it; this assumption was never tested in-session.

### Closure status

Phase 6's PARTIAL gate verdict (06-VERIFICATION.md amendment 5) stands and is reinforced by this UAT:

1. **Plan-skill empirical PASS preserved.** Plugin 0.9.0 retains amendment 1's empirical PASS on net-new vendor-API questions (D-04 + D-05 contracts met).
2. **Execute-skill G1+G2 residual confirmed on a 2nd fixture.** The amendment 5 residual is not specific to the original execute-fixes input; it reproduces on the canonical Compodoc+Storybook plan input. Phase 7 must address (non-text steering or stronger upstream trigger).
3. **NEW execute-discipline gap surfaced (Test 15).** Verify-before-commit discipline missing for surviving hedge markers. Recommend adding to PHASE-7-CANDIDATES.md as a new finding (or merging with Finding A's broader scope).
4. **Word-budget regression persists.** Already in residual scope.

This UAT produces 3 actionable Phase 7 surfaces: (a) reinforce existing G1+G2 residual evidence base; (b) NEW Finding E candidate (verify-before-commit discipline); (c) confirm word-budget residual. No `/gsd-execute-phase --gaps-only` follow-up is required for THIS phase since all 4 issues map to existing or recommended Phase 7 scope; the appropriate next step is `/gsd-new-milestone` or `/gsd-add-phase` for Phase 7.
