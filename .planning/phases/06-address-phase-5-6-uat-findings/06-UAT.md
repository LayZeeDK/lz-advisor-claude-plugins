---
status: testing
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
  - skill: lz-advisor.review
    log: c:/Users/LarsGyrupBrinkNielse/.claude/projects/D--projects-github-LayZeeDK-ngx-smart-components/48bd9cc5-b1f0-4641-a4bc-8e7595f74758.jsonl
    output: 4 reviewer findings + Cross-Cutting Patterns (rendered to user)
    tests: 18-24
    status: complete
started: 2026-04-30T09:07:30Z
updated: 2026-04-30T13:10:00Z
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

---

## Review-Skill UAT (Tests 18-24)

**Load-bearing question:** Does the review-skill provide a safety net for Finding E (apply-without-verify) by catching the unverified signal `output()` claim shipped in execute commit `feat(storybook): integrate Compodoc...`? Plus: does Pattern D fire on review-side Class-2 questions (e.g., "Is `tags: ['autodocs']` correct for Storybook 10?"), and does the J-narrative-isolation contract hold (review scope from git, not narrative)?

**Review session log:** `c:/Users/LarsGyrupBrinkNielse/.claude/projects/D--projects-github-LayZeeDK-ngx-smart-components/48bd9cc5-b1f0-4641-a4bc-8e7595f74758.jsonl` (51 lines, 195 KB)

**Commit range reviewed:** `b5b09739^..32e13522` (covers the 2 execute-skill commits: feat(storybook) integration + fix(storybook) advisor-driven correction)

### 18. Review skill activation on testbed commits
expected: Review skill activates, executor begins scan phase reading commits via git diff, follows review SKILL.md workflow (scan → consult reviewer → output Findings + Cross-Cutting Patterns).
result: pass
evidence: 1 Agent (reviewer) tool spawn observed: `description="Code review consultation for Compodoc+Storybook integration"`. Workflow ran end-to-end: scan (4 git diff/log Bash invocations + 6 project file Reads), consult (1 reviewer Agent spawn), output (reviewer response with `### Findings` + `### Cross-Cutting Patterns` headers rendered verbatim with `## Review Summary` prepend per Phase 3 output shape).

### 19. Review scope derived from git, not narrative (J-narrative-isolation)
expected: The review-skill executor reads git diff to determine review scope. Visible: git diff/log Bash invocations against the commit range; corresponding file Reads via the diff-derived file list.
result: pass
evidence: All 4 Bash invocations are `rtk git log/diff` against the explicit commit range `b5b09739eb871e38ac65ed462818b48b9f7c9356^..32e13522c1a4ba46297937cd64bf777bf69bfe79`:
  1. `git log --oneline <range>` — identify commits in range
  2. `git diff <range> --name-only` — derive file list mechanically
  3. `git diff <range>` — full diff content
  4. `git diff <range> -- package.json .gitignore` — targeted file diffs
The 6 file Reads correspond to the diff-derived file list: preview.ts, tsconfig.doc.json, tsconfig.json, project.json, ngx-smart-components.stories.ts, ngx-smart-components.ts. Scope was derived mechanically from git per the J-narrative-isolation contract; no narrative-only files included.

### 20. Pattern D fires on review-side Class-2 questions
expected: Class-2 review questions trigger Pattern D's web-first prescription. OR: if all questions are Class-1, 0 web tools is acceptable. Test FAILS if a clear Class-2 question is present in reviewer findings AND no web tool fired.
result: issue
reported: "Reviewer's Finding 4 raises a Class-2 question (Nx `continuous: true` cache behavior across Nx versions) WITH proper hedge frames ('Assuming continuous: true disables caching for this target (unverified against the installed Nx version) ... Verify cache behavior for continuous targets in node_modules/nx/PLUGIN.md or Nx docs before acting'). 0 WebSearch + 0 WebFetch + 0 ToolSearch in the entire review session. The Class-2 question is present in the reviewer output but no web-tool verification was performed anywhere in the skill execution."
severity: minor
evidence: |
  - 0 web tools / 0 ToolSearch in session.
  - Reviewer's Finding 4 verbatim: "More critically, `continuous: true` targets in Nx skip caching by default, which mitigates the staleness risk -- Assuming `continuous: true` disables caching for this target (unverified against the installed Nx version), the practical impact is limited to output tracking hygiene, do keep severity at Suggestion. Verify cache behavior for continuous targets in `node_modules/nx/PLUGIN.md` or Nx docs before acting."
  - This is a textbook Class-2 (API currency) question — Nx behavior depends on the installed version, which the reviewer correctly noted is unverified. The reviewer agent properly applied hedge frames per its system prompt ("Assuming X (unverified)" + "Verify ... before acting").
  - **Structural design constraint:** The reviewer agent has only `["Read", "Glob"]` tools per `agents/reviewer.md` and CLAUDE.md plugin design. It CANNOT invoke WebSearch/WebFetch directly. The web-side verification responsibility falls on the EXECUTOR during scan phase.
  - Executor's scan phase: 4 git Bash + 6 project file Reads + 0 web tools. The executor did NOT anticipate the Nx Class-2 question that the reviewer would surface; it scanned the diff for code-quality issues but did not pre-empt Class-2 surfaces with WebSearch.
  - Result: Class-2 question hedged in reviewer output, no verification action ever fired. Hedge survives but is not resolved.
  - **NOT a regression of Plan 06-05 G2** (this is not the agent-generated-source-input case); it is a NEW gap: review-skill orient phase cannot anticipate all Class-2 questions the reviewer will surface, AND the reviewer agent has no web-tool grant for self-verification.

### 21. Reviewer agent structural compliance (Findings + Cross-Cutting Patterns)
expected: Reviewer response contains both `### Findings` and `### Cross-Cutting Patterns` sections per Phase 5.4 Finding F.
result: pass
evidence: |
  - Reviewer response contains `### Findings` (with 4 finding entries: Finding 1 Important, Finding 2 Suggestion, Finding 3 Suggestion-borderline-Important, Finding 4 Important-revised-up) and `### Cross-Cutting Patterns` section (synthesizing Findings 1+4 root cause around documentation.json artifact lifecycle, plus Findings 2+3 as polish items).
  - Each finding includes: severity tag (Confirmed Important / Suggestion), validation note, technical reasoning, recommendation.
  - `Relevant files:` list trailing the response.
  - Phase 3 output shape preserved: `## Review Summary` scope line + reviewer verbatim block. F contract met.

### 22. Reviewer agent word budget (300w cap)
expected: Reviewer response stays at <= 300 words. **Note:** Phase 7 Finding D documents security-reviewer regressed to ~412w on plugin 0.8.9; this test measures the reviewer side on plugin 0.9.0.
result: issue
reported: "Reviewer response: ~411 words (excluding ## Review Summary scope prepend; including Findings 1-4 + Cross-Cutting Patterns + Relevant files trailer). 37% over 300w cap. Identical regression severity to Finding D's 412w security-reviewer measurement on plugin 0.8.9, but on a DIFFERENT agent (reviewer not security-reviewer) and DIFFERENT plugin version (0.9.0 not 0.8.9)."
severity: major
evidence: |
  - Word count breakdown (whitespace-split):
    - Finding 1: ~110 words (Important; documentation.json import resolution + IDE/CI failure mode + mitigation)
    - Finding 2: ~28 words (Suggestion; --disableSourceCode tradeoff)
    - Finding 3: ~67 words (Suggestion-borderline-Important; signal output unreachable from template)
    - Finding 4: ~83 words (Important-revised-up; Nx outputs declaration + continuous:true caching)
    - Cross-Cutting Patterns: ~123 words (artifact-lifecycle theme + polish items)
    - Total: ~411 words
  - Strong cross-evidence for Phase 7 Finding D: word-budget regression generalizes across (a) different agents (reviewer + security-reviewer) and (b) different plugin versions (0.8.9 + 0.9.0). Promotes Finding D's evidence base from n=1 single-agent to n=2 across both reviewer-class agents.
  - Same root surface as Finding D's cross-cutting note: descriptive ("aim for X words") rather than imperative budget directives in agents/reviewer.md and agents/security-reviewer.md. Output is structurally compliant + qualitatively useful, but exceeds the prescribed cap by a load-bearing margin.

### 23. Class 2-S does not fire in review skill
expected: 0 npm audit invocations, 0 GHSA URL references, 0 Class 2-S text refs, 0 pv-no-known-cves blocks.
result: pass
evidence: 0 `npm audit` references (string OR command), 0 `github.com/advisories` URLs, 0 `Class 2-S` text refs, 0 `pv-no-known-cves` blocks. Class 2-S correctly stayed scoped to security-review skill per Plan 06-06 cross-reference discipline. No scope-creep regression.

### 24. Reviewer catches Finding E's unverified output() claim
expected: Reviewer flags the unverified signal `output()` decision OR performs empirical verification itself OR notes verify-before-commit pattern in Cross-Cutting Patterns. FAILS only if reviewer ships Findings without the load-bearing concern.
result: issue
reported: "Reviewer found 4 issues but did NOT flag the verify-before-commit gap from execute UAT (Test 15 / Finding E). Closest finding is Finding 3 (signal output unreachable from template) which is a different concern — about template event-binding, not about whether Compodoc 1.2.1 classifies signal `output()` correctly. The review skill found code-quality issues but did not provide a safety net for Finding E's verify-before-commit pattern."
severity: minor
evidence: |
  - Reviewer's 4 findings adjudicated against Finding E's surface:
    - Finding 1 (Important): TypeScript can't find documentation.json before first compodoc run → reviewer DID notice the empty-stub workaround (recommends "commit a stub documentation.json ({}) and let Compodoc overwrite it") but treats it as a TypeScript-compile-time concern, not as a verify-skip signal.
    - Finding 2 (Suggestion): --disableSourceCode tradeoff → unrelated to Finding E.
    - Finding 3 (Suggestion-borderline-Important): "The output is unreachable from the template" → about template event-binding (component template just renders `<p>NgxSmartComponents works!</p>` with no `(sampleOutput)="..."` binding), NOT about whether signal output() works in Compodoc 1.2.1. Adjacent topic; doesn't catch Finding E.
    - Finding 4 (Important): Nx outputs declaration + continuous:true caching → unrelated to Finding E (and is itself unverified per Test 20).
  - Cross-Cutting Patterns: artifact-lifecycle theme + polish items → no verify-before-commit pattern note.
  - **Reviewer agent does not have web tools (Test 20 evidence) AND was not given the execute session log** as input — only the commit range. The reviewer can detect the empty-stub `documentation.json` as a code-quality artifact, but cannot detect "the executor never ran Compodoc to verify the signal classification before committing" because that information lives in the execute session log, not in the diff or working tree.
  - The review skill IS supposed to provide a safety net per its scan criteria ("logic errors, bugs, clear correctness problems, edge cases not handled"), and an unverified claim shipped to a commit IS a correctness-edge-case, but the reviewer's mandate as currently scoped focuses on code shape rather than provenance/verification chain. **NEW gap: review skill does not inspect provenance / verification status of changed code.**

## Summary

total: 24
passed: 17
issues: 7
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

- truth: "Reviewer agent verifies Class-2 questions it surfaces (web-tool grant or escalation back to executor)"
  status: failed
  reason: "Reviewer agent surfaced a Class-2 question (Nx continuous:true cache behavior) WITH proper hedge frames per its system prompt, but reviewer agent has only [Read, Glob] tools and cannot invoke WebSearch/WebFetch. Executor's scan phase didn't anticipate this Class-2 question (read project files only). Result: Class-2 hedge present in reviewer output, no verification action ever fires within the skill execution."
  severity: minor
  test: 20
  skill: lz-advisor.review
  artifacts:
    - "plugins/lz-advisor/agents/reviewer.md (tool grant: [Read, Glob]; no web tools)"
    - "plugins/lz-advisor/skills/lz-advisor.review/SKILL.md (scan phase orient ranking)"
    - "c:/Users/LarsGyrupBrinkNielse/.claude/projects/D--projects-github-LayZeeDK-ngx-smart-components/48bd9cc5-b1f0-4641-a4bc-8e7595f74758.jsonl (0 web tools, Class-2 hedge in Finding 4)"
  missing:
    - "Mechanism for reviewer agent to escalate Class-2 questions back to executor for web-tool verification (e.g., reviewer emits a `## Verification Requested` block; review skill Phase 3 detects and re-runs scan with WebSearch on those questions before final output)"
    - "Alternative: extend reviewer agent tool grant to include WebSearch/WebFetch (changes principle-of-least-privilege design but enables self-verification)"
    - "Alternative: executor's scan phase pre-empts likely Class-2 surfaces (Nx version, framework version, library version) with WebSearch BEFORE consulting the reviewer"
  diagnosis_new: |
    NEW Phase 7 candidate. Distinct design gap: review-skill orient phase cannot anticipate all Class-2 questions the reviewer will surface, AND the reviewer agent has no web-tool grant for self-verification. The reviewer agent properly applied hedge frames ("Assuming X (unverified)" + "Verify Y before acting") per its system prompt — the structural-discipline side works. But there is no mechanism within the skill to RESOLVE the hedge before the review output reaches the user.
    
    Different from Finding C's chain-of-custody (cross-skill) and Finding E's verify-before-commit (execute-skill): Finding F (this) is review-skill-internal — the verification gap is between the reviewer's findings and the skill's user-visible output. Adjacent to Finding E in that both leave hedges unresolved at skill boundaries.
  routing: |
    NEW Phase 7 candidate (Finding F or merge into E). Recommend adding to PHASE-7-CANDIDATES.md. Fix surface candidates: (a) review-skill Phase 3 escalation hook for `## Verification Requested` blocks emitted by reviewer; (b) reviewer agent tool grant extension; (c) executor scan-phase Class-2 pre-emption. Choice depends on principle-of-least-privilege tradeoff vs round-trip cost.

- truth: "Reviewer agent stays within 300-word cap"
  status: failed
  reason: "Reviewer response: ~411 words against 300-word cap — 37% over. Identical regression severity to Finding D's 412w security-reviewer measurement on plugin 0.8.9, but on a DIFFERENT agent (reviewer not security-reviewer) and DIFFERENT plugin version (0.9.0)."
  severity: major
  test: 22
  skill: lz-advisor.review
  artifacts:
    - "plugins/lz-advisor/agents/reviewer.md (word-budget directive)"
    - "c:/Users/LarsGyrupBrinkNielse/.claude/projects/D--projects-github-LayZeeDK-ngx-smart-components/48bd9cc5-b1f0-4641-a4bc-8e7595f74758.jsonl (reviewer response 411 words)"
  missing: []
  diagnosis_pre_existing: |
    Strong cross-evidence for Phase 7 Finding D. Promotes Finding D's evidence base from "n=1 single agent (security-reviewer) on plugin 0.8.9" to "n=2 across both reviewer-class agents on different plugin versions":
    - security-reviewer on plugin 0.8.9: 412w / 300w cap = ~37% over (Finding D primary observation)
    - reviewer on plugin 0.9.0 (THIS UAT): 411w / 300w cap = ~37% over
    - advisor on plugin 0.8.5: 111w / 100w cap = ~11% over
    - advisor on plugin 0.9.0 (this UAT plan-skill): 120w / 100w cap = ~20% over
    Pattern: word-budget regressions are pervasive across all 3 agents (advisor + reviewer + security-reviewer) on at least 3 plugin versions (0.8.5 + 0.8.9 + 0.9.0). The 37% overrun on the 300w cap is consistent across both reviewer agents; the regression severity is class-level, not agent-specific.
    
    Root surface remains as Finding D's primary observation: descriptive ("aim for X words") rather than imperative budget directives. Outputs are structurally compliant + qualitatively useful, but exceed cap by load-bearing margins.
  routing: |
    Already tracked under Finding D in PHASE-7-CANDIDATES.md. This UAT significantly reinforces the evidence base. Recommend Finding D in Phase 7 plan addresses ALL three agent prompts (advisor + reviewer + security-reviewer) in a single edit pass — the failure mode is class-level, not agent-specific.

- truth: "Review skill provides a safety net for verify-before-commit gaps in changed code (Finding E surface)"
  status: failed
  reason: "Reviewer ran 4 findings on the execute commits but did NOT flag the verify-before-commit gap from execute UAT (Test 15 / Finding E). The reviewer noticed the empty-stub documentation.json workaround as a TypeScript-compile-time concern (Finding 1) but did not connect it to a verify-skip pattern. Cross-Cutting Patterns covered artifact-lifecycle theme + polish items; no verify-before-commit pattern note."
  severity: minor
  test: 24
  skill: lz-advisor.review
  artifacts:
    - "plugins/lz-advisor/skills/lz-advisor.review/SKILL.md (scan criteria; what counts as a finding)"
    - "plugins/lz-advisor/agents/reviewer.md (reviewer mandate)"
    - "c:/Users/LarsGyrupBrinkNielse/.claude/projects/D--projects-github-LayZeeDK-ngx-smart-components/48bd9cc5-b1f0-4641-a4bc-8e7595f74758.jsonl (review session, 4 findings, no verify-before-commit flag)"
    - "c:/Users/LarsGyrupBrinkNielse/.claude/projects/D--projects-github-LayZeeDK-ngx-smart-components/bf522c6e-1001-4a6a-9cfb-7885f9276386.jsonl (execute session showing the gap)"
  missing:
    - "Review skill scan criteria entry: 'Provenance / verification status of changed code -- if a hedged plan claim was implemented (e.g., signal output() in a library where output classification is hedged), verify the implementation has a corresponding verification commit / Verified: trailer / pv-* anchor in commit body'"
    - "Reviewer agent system prompt directive: 'When changed code implements a hedged claim from upstream artifacts, flag the absence of empirical verification as a finding'"
    - "Alternative: review skill takes execute session log as optional input; if provided, scan for unresolved hedges in the consultation prompt that did not receive a verification action before commit"
  diagnosis_new: |
    NEW Phase 7 candidate (or extension of Finding E). The reviewer agent does NOT have access to the execute session log — only the commit range — so it cannot detect "the executor never ran Compodoc to verify the signal classification before committing" purely from the diff. The empty-stub `{}` documentation.json IS a code-shape signal that the reviewer could weight as suspicious (and Finding 1 did identify the TypeScript implication), but the reviewer's mandate as currently scoped focuses on code shape rather than provenance.
    
    Adjacent to Finding E (verify-before-commit) but on a different surface: Finding E is "executor must verify before commit"; this finding is "reviewer should catch unverified commits as a safety net." Finding E owns the upstream prevention; this owns the downstream detection.
  routing: |
    NEW Phase 7 candidate; recommend extending Finding E with a "downstream safety net" sub-section in PHASE-7-CANDIDATES.md, OR adding a separate Finding G (review-skill safety net for verify-skip patterns). Fix surface = review SKILL.md scan criteria + reviewer agent prompt directive. Cleaner if folded under Finding E since both surfaces address the same load-bearing concern (verify-before-commit shipping unverified work).
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
