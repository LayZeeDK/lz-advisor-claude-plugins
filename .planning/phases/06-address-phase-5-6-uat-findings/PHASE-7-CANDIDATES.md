---
source: "06 UAT observations (execute-skill, review-skill, plan-fixes, execute-fixes, security-review manual UATs on plugin 0.8.9; plus 2026-04-30 fresh Compodoc+Storybook plan-skill + execute-skill UATs on plugin 0.9.0)"
captured: 2026-04-29
amended: 2026-04-30
type: phase-7-candidates
related_artifacts:
  - .planning/phases/06-address-phase-5-6-uat-findings/uat-execute-skill/session-notes.md
  - .planning/phases/06-address-phase-5-6-uat-findings/uat-review-skill/session-notes.md
  - .planning/phases/06-address-phase-5-6-uat-findings/uat-plan-skill-fixes/session-notes.md
  - .planning/phases/06-address-phase-5-6-uat-findings/uat-execute-skill-fixes/session-notes.md
  - .planning/phases/06-address-phase-5-6-uat-findings/uat-security-review-skill/session-notes.md
  - .planning/phases/06-address-phase-5-6-uat-findings/06-UAT.md
session_logs:
  - c:/Users/LarsGyrupBrinkNielse/.claude/projects/D--projects-github-LayZeeDK-ngx-smart-components/ff614de1-c25d-4e84-bee9-5de67de4b208.jsonl
  - c:/Users/LarsGyrupBrinkNielse/.claude/projects/D--projects-github-LayZeeDK-ngx-smart-components/5dbcc147-5119-439b-950e-f2bdac619598.jsonl
  - c:/Users/LarsGyrupBrinkNielse/.claude/projects/D--projects-github-LayZeeDK-ngx-smart-components/26868ae7-1f9a-4a71-a146-16e7781b74c6.jsonl
  - c:/Users/LarsGyrupBrinkNielse/.claude/projects/D--projects-github-LayZeeDK-ngx-smart-components/e4592a03-0cf4-4925-af93-fdf20c663a25.jsonl
  - c:/Users/LarsGyrupBrinkNielse/.claude/projects/D--projects-github-LayZeeDK-ngx-smart-components/2d388e98-1e6a-4978-8290-115852470529.jsonl
  - c:/Users/LarsGyrupBrinkNielse/.claude/projects/D--projects-github-LayZeeDK-ngx-smart-components/a75fae2f-dc3f-45d2-a0aa-7d9e5f518b77.jsonl
  - c:/Users/LarsGyrupBrinkNielse/.claude/projects/D--projects-github-LayZeeDK-ngx-smart-components/bf522c6e-1001-4a6a-9cfb-7885f9276386.jsonl
  - c:/Users/LarsGyrupBrinkNielse/.claude/projects/D--projects-github-LayZeeDK-ngx-smart-components/48bd9cc5-b1f0-4641-a4bc-8e7595f74758.jsonl
  - c:/Users/LarsGyrupBrinkNielse/.claude/projects/D--projects-github-LayZeeDK-ngx-smart-components/fc44ddc9-a7fb-4153-9cd4-755db416c1eb.jsonl
  - c:/Users/LarsGyrupBrinkNielse/.claude/projects/D--projects-github-LayZeeDK-ngx-smart-components/c28c99cb-82fb-438a-bae9-eafd7d4e66ec.jsonl
  - c:/Users/LarsGyrupBrinkNielse/.claude/projects/D--projects-github-LayZeeDK-ngx-smart-components/e01a5a7e-cbca-4c11-a907-b19232d34596.jsonl
---

# Phase 7 Candidates -- Advisor Consultation Discipline, Template Carry-Forward, and Confidence-Laundering Guards

Captured during Phase 6 follow-up UATs on plugin 0.8.9 (cycle complete 2026-04-30): execute-skill against the Compodoc + Storybook implementation, review-skill against the resulting commits `09a09d7^..0cb8ae7`, plan-fixes (plan skill called on the review's findings as input), execute-fixes (execute skill called on the plan-fixes plan as input), and security-review (security-review skill called on the post-fix commit range `09a09d7^..05ea109`). All five UATs passed mechanically; together they surface three core advisor-consultation-discipline gaps (Findings A, B, C) plus a new fourth candidate (Finding D, word-budget regression on security-reviewer agent). The execute-fixes UAT extended Finding C's chain from 5 hops (claim in plan file) to 7 hops (claim in committed source code); the security-review UAT bifurcated the chain across question-class axes, making C the highest-priority candidate with a refined fourth proposed guard.

## Context

Phase 6 closed the Pattern D web-usage gate empirically on plugin 0.8.9 (06-VERIFICATION.md amendment 2026-04-29). The follow-up UATs verified the four-skill loop end-to-end. Findings:

1. **Finding A:** Execute-skill executor silently reverted an advisor Critical block without a reconciliation call or empirical verification (execute-skill UAT events 208 -> 219). Strengthened by review-skill and plan-fixes UATs both recommending the same `fn()` spy approach -- the executor was the lone dissent and was un-grounded. **Execute-fixes UAT (n=1) added the first in-skill data point on the override-acceptance pathway: when an advisor explicitly overrode a prior plan direction, the executor accepted, applied, and attributed the override -- no silent revert.** Finding A remains in scope as "single-trial empirical confirmation; needs n>=3 across heterogeneous override scenarios".
2. **Finding B:** pv-* discipline is broken in three distinct ways (was two). **B.1:** pv-* XML blocks are not carried forward across consultations within a skill (execute-skill final-consult lost pv-1) or across skill invocations within a workflow (plan-skill produced 4 anchored claims; downstream review-skill, plan-fixes, and execute-fixes consultations carried 0). **B.1 broadened by execute-fixes UAT:** even when the canonical pv-* template is attached at session start (`references/context-packaging.md` was loaded into context), the executor does NOT synthesize pv-* blocks for orient-phase empirical findings (3 obvious candidates skipped: `git grep` result, file Read confirmations, post-impl test pass). **B.2 (NEW from plan-fixes):** the plan-fixes executor packaged 4 plain bullets under a "Pre-verified Claims" header without doing any verification work, and one of the bullets was a confabulated symbol (non-existent `haiku` import).
3. **Finding C (extended by execute-fixes):** **7-hop** confidence-laundering chain across review -> executor -> advisor -> plan output -> execute consultation -> commit. Each hop strips a verify-first hedge or adds a confidence layer; the plan-skill advisor introduced a "Storybook 8+" version qualifier that exists in none of the upstream sources and contradicts the testbed's installed version (10.3.5). The chain now reaches committed source code (commit `05ea109` on testbed branch `uat/manual-s4-v089-compodoc`); the implementation works empirically (tests pass) but on unverified provenance, which is the most dangerous failure mode: positive feedback trains future executors to skip verification.

All three are advisor-consultation-discipline gaps orthogonal to Phase 6's question-class-aware orient ranking (Pattern D), though Finding C interacts with Pattern D's web-first orient (its absence enables the chain).

Two separate Phase 6 gaps surfaced from the plan-fixes and execute-fixes UATs:

- **Second amendment to 06-VERIFICATION.md (from plan-fixes UAT):** Pattern D suppression on review-file authoritative-source treatment.
- **Third amendment to 06-VERIFICATION.md (from execute-fixes UAT):** the carve-out scope extends to plan-file input, AND the suppression operates at the ToolSearch loading layer (executor never invokes `ToolSearch select:WebSearch,WebFetch`, so web tools are structurally unavailable when ranking runs). The fix surface should classify by source provenance (vendor-doc vs agent-generated) rather than by structural shape.

Both Phase 6 gaps are captured in `06-VERIFICATION.md`, not in this file.

## Update 2026-04-30 -- Fresh Compodoc+Storybook UAT on plugin 0.9.0

A fresh end-to-end Compodoc + Storybook + Angular signals integration UAT was run on plugin 0.9.0 against `ngx-smart-components` on `main` (no Compodoc pre-installed), exercising plan-skill (session `a75fae2f-...`, plan output `compodoc-storybook-setup.plan.md`), execute-skill (session `bf522c6e-...`, 2 commits on testbed branch), and review-skill (session `48bd9cc5-...`, 4 reviewer findings on commit range `b5b09739^..32e13522`) end-to-end. Results captured in `06-UAT.md` Tests 1-24. Net effect on this candidates file:

| Finding | Cross-evidence type | Verdict |
|---|---|---|
| A (silent apply-then-revert) | No new override-acceptance scenarios surfaced; all 3 UATs ran straight-through. | n=1 unchanged; still needs n>=3 trials. |
| B.1 (pv-* synthesis mandate) | **Plan-skill: 15 pv-* synthesized fresh (D-05 closure exceeded 15x).** Execute-skill: 7 pv-* present (carried from plan input); 0 synthesized fresh from execute-phase empirical work. **Review-skill: 6 pv-* synthesized in reviewer consultation** (positive evidence on review-skill side). | Plan-skill + review-skill: positive evidence on 0.9.0. Execute-skill: B.1's "synthesis mandate" sub-issue confirmed on 2nd fixture. |
| C (cross-skill confidence-laundering chain) | **Plan-skill broke a vendor-API laundering attempt empirically:** nx.dev guide recommended `import { setCompodocJson } from '@storybook/addon-docs/angular'`; empirical Read of `node_modules/@storybook/addon-docs/angular/package.json` confirmed `setCompodocJson` is no longer exported in `@storybook/angular@10.3.5`; pv-* claim block synthesized with `<evidence>` anchor; plan correctly omitted the deprecated import. **Review-skill DID NOT extend the chain (positive on broken-chain axis) but DID NOT catch Finding E's verify-skip** (negative on safety-net axis — see Finding G). | Mixed: Pattern D + pv-* synthesis breaks the chain when Pattern D fires (positive); review-skill currently does not detect verify-skip patterns in changed code (gap, see Finding G). |
| D (word-budget regression) | **Plan-skill advisor SD: 120w/100w cap on 0.9.0 (~20% over).** **Review-skill reviewer: ~411w/300w cap on 0.9.0 (~37% over -- IDENTICAL severity to security-reviewer's 412w on 0.8.9).** | **Strong reinforcement.** Evidence base promoted from "n=1 single agent (security-reviewer) on plugin 0.8.9" to "n=2 across both reviewer-class agents on different plugin versions"; the 37% overrun on 300w cap is consistent across reviewer + security-reviewer; advisor (100w cap) sees ~11-20% overrun. Class-level regression confirmed across all 3 agents. |
| **E (NEW): apply-without-verify on surviving hedge markers** | Execute-skill: Plan 06-05 hedge-marker preservation rule WORKS at the prompt layer (marker survived verbatim into pre-execute consultation) BUT the executor proceeded past the unresolved hedge into commits without performing the verification action. | NEW failure mode; see Finding E below. Adjacent to A and C but distinct fix surface. |
| **F (NEW): reviewer agent has no web-tool grant for self-verification** | Review-skill: reviewer's Finding 4 raised a Class-2 question (Nx `continuous: true` cache behavior) WITH proper hedge frames per system prompt, but reviewer agent has only `[Read, Glob]` tools and cannot invoke WebSearch/WebFetch. Executor's scan didn't anticipate the Class-2 surface (read project files only). 0 web tools in entire review session. | NEW design gap; see Finding F below. Distinct from A/B/C/D/E surfaces. |
| **G (NEW): review skill does not provide safety net for verify-before-commit gaps** | Review-skill ran 4 findings on the execute commits but did NOT flag Finding E's verify-before-commit gap. Reviewer noticed the empty-stub `documentation.json` workaround (Finding 1) as a TypeScript-compile-time concern but did not connect it to a verify-skip pattern. Cross-Cutting Patterns covered artifact lifecycle + polish; no provenance / verification-status note. | NEW gap; see Finding G below. Tightly coupled with Finding E (downstream safety net for upstream prevention). |

## Update 2026-04-30 (continued) -- Plan-fixes UAT on review findings (3rd plan-fixes fixture)

A 4th UAT in the Compodoc+Storybook chain ran the plan-skill against the reviewer's findings as input (session `fc44ddc9-a7fb-4153-9cd4-755db416c1eb.jsonl`, plan output `address-compodoc-review-findings.plan.md`). This is the 3rd plan-fixes fixture overall (after `uat-plan-skill-fixes` 0.8.9 + `uat-plan-skill-fixes-rerun` 0.9.0) and produces a NEW empirical observation that QUALITATIVELY refines the G1+G2 empirical residual interpretation.

| Finding | Cross-evidence type | Verdict |
|---|---|---|
| B.2 (confabulation under Pre-verified header) | **Plan-fixes synthesized a `<pre_verified>` block on `continuous: true` non-cacheability with `<evidence method="...">` referring to "Nx semantics" rather than empirical verification.** Strongest direct B.2 instance to date. | **Strong reinforcement.** B.2's mitigation (every pv-* MUST cite source path + tool-output excerpt) is empirically validated as necessary. |
| C (cross-skill confidence laundering) | **Review→plan boundary stripped the hedge.** Reviewer hedged: "Assuming X (unverified) ... Verify before acting"; plan asserts: "continuous: true makes the storybook target non-cacheable" as Key Decision. | **Strong reinforcement on a NEW boundary.** Different from amendments 2/3 (which targeted review→plan with plan-file shape and execute consultation source) — this is the same boundary but the failure mechanism is self-confabulation, not "treat as authoritative." |
| D (word-budget regression) | **Plan-fixes advisor SD: 109w/100w cap (~9% over).** Mild reinforcement on plugin 0.9.0; 4th data point. | Class-level regression confirmed across 3 agents (advisor 100w cap: 111w + 120w + 109w; reviewer 300w cap: 411w; security-reviewer 300w cap: 412w). |
| E (advisor refuse-or-flag on unresolved hedges) | **Plan-fixes advisor consultation accepted the framing without flagging the unresolved hedge.** Hedge marker visible in source material context (`unverified` 4 hits, `Assuming` 1 hit, `before acting` 2 hits) but advisor's Strategic Direction did not contain "Unresolved hedge: X" frame. | **First in-skill instance of E's advisor-side gap.** Reinforces E's proposed direction (advisor refuse-or-flag rule). |
| G1+G2 empirical residual | **3rd plan-fixes fixture FAIL** with QUALITATIVELY DIFFERENT failure mechanism: trust-contract carve-out FIRED correctly (executor explicitly classified review as agent-generated) but ToolSearch availability rule still didn't fire because executor self-anchored on "Nx semantics" knowledge. | **Refined root cause.** Prior interpretations ("rule miss") were empirically wrong; the residual root cause is "executor bypasses the rule via self-confabulation." See Finding H below. |
| **H (NEW): Trust-contract carve-out fires but executor self-confabulates pv-* anchor from claimed knowledge** | Executor's orient verbatim: "I'll mark this as pre-verified from Nx semantics." Synthesized pv-* block on `continuous: true` non-cacheability with no empirical evidence. Carve-out routed away from "trust agent-generated source" but did NOT route toward "do empirical verification" — executor had a third path (self-anchor on framework knowledge) that the carve-out doesn't close. | NEW failure mode; see Finding H below. Distinct from B.2 (packaging discipline), G1+G2 (rule miss), and E (advisor side). |

## Update 2026-04-30 (continued, 5th UAT) -- Execute-fixes UAT on plan-fixes plan

A 5th UAT in the Compodoc+Storybook chain ran the execute-skill against the plan-fixes plan as input (session `c28c99cb-82fb-438a-bae9-eafd7d4e66ec.jsonl`, 1 commit `18728dd`). This is the 4th plan-file fixture for execute-skill (after the original execute-skill UAT against plan-skill output) and produces strong reinforcement evidence for Findings E + H + C and a NEW empirical observation refining Finding E's failure surface scope.

| Finding | Cross-evidence type | Verdict |
|---|---|---|
| C (cross-skill confidence laundering) | **NEW 5-hop within-skill chain** documented: review hedged Class-2 → plan-fixes stripped+confabulated pv-* (Finding H) → execute-fixes pre-execute consultation INHERITED confabulation verbatim → execute-fixes implementation committed without verification → execute-fixes final advisor accepted framing. Different from original 7-hop cross-skill chain on `fn()` spy: this chain is mostly within-skill (plan-fixes → execute-fixes) with confabulated pv-* anchor as the load-bearing transmission mechanism. | **Strong reinforcement on a NEW chain pattern.** Confirms confidence laundering can compound within-skill, not just cross-skill. |
| **E (apply-without-verify) — REFINED FAILURE SURFACE** | Plan-fixes plan structured Step 4 as `**Validate** - Run: pnpm nx storybook ngx-smart-components - Verify: Storybook starts without TypeScript errors; the Docs tab renders Compodoc descriptions; clicking "Emit" fires the output in Actions panel.` This is NOT a hedge marker buried in rationale — it is a NUMBERED, EXPLICIT, EXECUTABLE plan step. **Executor STILL skipped it.** Final summary verbatim: "Next step: Run pnpm nx storybook ngx-smart-components and click Emit to confirm..." (post-commit user-facing reframe). | **Significantly EXPANDS Finding E's failure surface scope.** Original Finding E targeted "hedge markers in plan rationale"; refined scope: ANY plan step structured as `Run: <command>` + `Verify: <conditions>` MUST be executed before commit. |
| G1+G2 empirical residual + H | **4th plan-file fixture FAILing same surface.** 0 ToolSearch + 0 web tools in execute-fixes despite trust-contract sentinels present and plan input containing the confabulated `continuous: true` claim. Executor inherited the confabulation verbatim into its own consultation prompt. | Reinforces Finding H interpretation: rule bypass via self-anchor on claimed knowledge, not rule miss. Same failure mechanism reaches plan-skill + execute-skill on plan-file inputs, 4 fixtures total. |
| Word-budget (D) | Execute-fixes advisor word count not extracted (final advisor used different output shape — no Strategic Direction header detected by analysis script). 5th data point pending. | Inconclusive on this UAT; D's evidence base unchanged from prior 4 data points. |

## Update 2026-04-30 (continued, 6th UAT) -- Security-review UAT on testbed commits

A 6th UAT in the Compodoc+Storybook chain ran the security-review skill on the 3 testbed commits (range `b5b09739^..18728dd`) on plugin 0.9.0 (session `e01a5a7e-...`). This UAT closes the 6-skill sweep started 2026-04-30. Net effect:

| Finding | Cross-evidence type | Verdict |
|---|---|---|
| **Phase 6 Plan 06-06 (Class 2-S)** | **EMPIRICALLY CONFIRMED on a fresh fixture.** 10 npm audit invocations + 4 GHSA URL refs + 6 GHSA-* IDs surfaced + 1 pv-no-known-cves block + 1 pv-cve-list block. Stronger signal than amendment 5's replay (which had 5 npm audit invocations on the same plugin version). | **Strong positive evidence.** Plan 06-06 deliverable is reproducible across question-shapes, not just the amendment 5 replay fixture. |
| **D (word-budget regression)** | **Security-reviewer on 0.9.0: 438 words / 300w cap = 46% over.** WORSE than 0.8.9's 412w (37% over). Regression worsening on the SAME agent across plugin versions: +26 words / +9 percentage points. | **Strongest D reinforcement to date.** Pattern: regressions are pervasive AND worsening on security-reviewer specifically. Phase 7 plan should ELEVATE security-reviewer word-budget enforcement priority within Finding D's scope. |
| C (cross-skill confidence laundering) | Security-review properly stayed scoped (no engagement with the upstream confabulated `continuous: true` claim or signal output() unverified claim — those are non-security questions). Per amendment 4 of 06-VERIFICATION.md ("chain stalled but NOT broken on this axis | No change") this is correct behavior, NOT a Finding C extension. | No change to Finding C's evidence base. |
| Plan 06-05 hedge-marker preservation | Security-reviewer's Finding 1 ends with "Verify CI install command before acting" — the agent correctly applied the Plan 06-05 hedge-marker pattern in its OWN findings, not just preserved it from upstream. | **Positive evidence on plugin 0.9.0:** Plan 06-05 hedge-marker pattern is empirically applied by the security-reviewer agent without being prompted. |
| **No new Findings introduced.** This UAT's primary contributions are: (a) STRONG empirical confirmation of Plan 06-06 on a fresh fixture; (b) STRONGEST Finding D reinforcement on security-reviewer side specifically. | | |

## Candidate Findings

### A. Silent apply-then-revert of advisor Critical without reconciliation call

**Observed (execute-skill UAT, events 208 -> 219, ~25 seconds elapsed):**

Final-review advisor's Critical block: use `fn()` from `storybook/test` as `args.dismissed` so the play function's `toHaveBeenCalled()` assertion works.

Executor sequence:

1. Stated intent to apply Critical (event 192).
2. Edited two files to apply (events 208, 212).
3. Reasoned for one sentence: "signal outputs are wired via `argTypes.action`, not passable as `args`. Reverting."
4. Reverted both edits (events 219, 223).

No reconciliation call was issued. No empirical verification of the revert reasoning (no `rg` against `@storybook/angular`, no minimal repro, no docs lookup). The shipped state matches pre-Critical state.

**Why it matters.** SKILL.md Phase 3 `### Reconciliation` says: "If findings point one way and the advisor points another, do not silently switch. Surface the conflict in one more advisor call: 'I found X, you suggested Y -- which constraint breaks the tie?'"

The block is worded for Phase 3 mid-execution conflicts (findings-vs-advisor). It does not literally cover Phase 6 apply-then-revert flows on Critical blocks. But the spirit clearly applies: silent override of an advisor primary-signal block based on un-grounded internal reasoning is exactly the mode the policy is meant to prevent.

**Failure surface.** A future executor with weaker self-verification, or under context pressure, could silently revert correct advisor Critical content based on confident-but-wrong reasoning. The current SKILL.md provides no explicit checkpoint.

**Proposed direction:** Extend the Reconciliation policy to cover the apply-then-revert flow. Two candidate phrasings:

- Option 1 (Phase 5 / `<final>` block): "If you applied an advisor Critical block then conclude during Phase 6 that it does not apply, do not revert silently. Either (a) verify the contradicting evidence empirically (compile, run, or read the relevant source) and document the verification in the commit message, or (b) issue a reconciliation call: 'Applied your Critical X, then found Y contradicts it. Which is correct?'"
- Option 2 (Phase 3 / Reconciliation block, broaden scope): "Reconciliation also applies in Phase 6 when reverting an advisor Critical: do not silently switch off Critical content."

Pick whichever lands cleanest in the SKILL.md flow. The xhigh advisor cost ($0.04 per reconciliation call at typical packaging size) is cheap insurance against Critical-content silent loss.

**Effort:** Low. SKILL.md text edit + smoke test fixture that synthesizes an apply-then-revert temptation and asserts a reconciliation call fires.

**Cross-evidence -- consensus across consultations on `fn()` spy (updated 2026-04-29 with plan-fixes + execute-fixes UATs):**

| Consultation | Position |
|---|---|
| Original plan skill UAT (advisor) | `argTypes.action: 'dismissed'` (no `fn()`) -- per session `6cba971a-...` |
| Execute-skill final advisor (Critical) | Use `fn()` from `storybook/test` -- per session `ff614de1-...` event 190 |
| Execute-skill executor (silent revert) | Rejected -- "doesn't apply to Angular Storybook" -- session `ff614de1-...` event 218 |
| Review-skill reviewer (Important finding) | Use `fn()` from `storybook/test` -- session `5dbcc147-...` event 56 |
| Plan-fixes plan-skill advisor (Strategic Direction step 1 + Critical) | Add `dismissed: fn()` to `Heading` args -- session `26868ae7-...` event 39 |
| Execute-fixes pre-execute advisor (override) | Add `dismissed: fn()` to BOTH `Primary.args` AND `Heading.args` -- session `e4592a03-...` event 13 |
| Execute-fixes executor (override accepted) | Applied verbatim; commit `05ea109` ships fn() on both stories; tests 2/2 PASS -- session `e4592a03-...` events 17, 33 |
| Execute-fixes final advisor (verification) | "Approach is sound; ship it." -- session `e4592a03-...` event 33 |

**Six of seven consultations recommend `fn()` spy. The execute-skill executor's silent revert (in the original execute-skill UAT) remains the lone dissent and remains un-grounded** (no source verification, no WebSearch, no minimal repro, no Storybook bundle inspection across any session). The execute-fixes UAT added the first in-skill data point on the override-acceptance pathway: when an advisor explicitly overrode a prior plan direction with self-contained reasoning, the executor accepted, applied, and attributed the override -- no silent revert.

**Status update on Finding A.** This is one (n=1) successful in-skill confirmation of the override-acceptance pathway. It is NOT yet sufficient evidence to declare the silent-revert mode behaviorally absent. Promoting Finding A to "resolved" requires n>=3 trials across heterogeneous override scenarios (different question classes, different override strengths, different tool-availability contexts). Until then, Finding A remains in Phase 7 scope as "single-trial empirical confirmation; needs more trials".

---

### B. pv-* discipline is broken in two distinct ways

**B.1: pv-* blocks not carried forward across consultations within / across skills (original Finding B).**

**B.2 (NEW): executor confabulates content under "Pre-verified Claims" header without any verification step.**

These two sub-issues share a root cause -- pv-* discipline is incompletely specified -- but the fix surfaces are different. Capturing them under one Finding because the proposed remediation should land together (template + executor responsibility specs in `references/context-packaging.md`).

#### B.1 -- Carry-forward gap

**Observed (execute-skill UAT, event 188 final-consult prompt):**

The Verification template carried forward "Prior Strategic Direction" verbatim but did NOT carry forward the pre-execute pv-1 block. The advisor's call-2 point 2 ("Replace `(window as any).__STORYBOOK_COMPODOC_JSON__` with `setCompodocJson` from `@storybook/addon-docs/angular`") directly contradicted pv-1, which had been the empirical anchor in call 1.

The executor noticed the contradiction (event 192: "Point 2 contradicts my pre-verified pv-1") and rejected with reasoning. So the bad advice did not ship. But the underlying mechanism is fragile.

**Cross-skill pv-* application (across all four follow-up UATs):**

| UAT step | pv-* XML blocks in consultation prompt | pv-* blocks in artifact output | Notes |
|---|---|---|---|
| Original plan skill UAT (06-VERIFICATION amendment) | 4 | 4 (in PLAN.md) | Plan skill packaged + emitted 4 anchored claims |
| Execute skill UAT pre-execute consult | 1 (pv-1) | n/a | pv-1 carried from plan file |
| Execute skill UAT final consult | 0 | n/a | pv-1 dropped between calls (B.1 trigger) |
| Review skill UAT consultation | 0 | n/a | No pv-* packaged at all |
| Plan-fixes plan-skill UAT consultation | 0 (4 plain bullets, not XML) | 0 (in PLAN.md) | See B.2 below |
| Execute-fixes pre-execute consult | 0 | n/a | Plan input had 0 pv-*; executor synthesized 0 despite running `git grep` + 2 file reads that all could anchor pv-* claims |
| Execute-fixes final consult | 0 | n/a | No pv-* synthesized for the empirically-verified test-pass result |
| Security-review consult (NEW) | 0 | n/a | Input was 3 commit SHAs; executor ran 3 git diffs + 2 Reads that all could anchor pv-* claims (window assignment line, compodoc version, gitignore entry); 0 synthesized despite `context-packaging.md` attached at session start |

Finding B.1: pv-* discipline must apply at THREE layers, not two. Within a skill (pre -> mid -> final consult). Across skill invocations within the same workflow (plan -> execute -> review -> security-review). **AND: synthesized de novo for empirical anchors verified during the current skill's orient phase, not just propagated from upstream sources.**

**The execute-fixes UAT broadens the failure mode.** Even when `references/context-packaging.md` is attached at session start with full canonical XML templates, the executor does NOT synthesize pv-* blocks for orient-phase empirical findings. Three obvious pv-* candidates were skipped:

- `pv-gitignore-line-54`: `git grep -n "documentation.json"` confirmed only `.storybook/preview.ts` and the plan files reference the symbol -- a one-line empirical anchor.
- `pv-stories-imports-current`: file Read of `ngx-smart-components.stories.ts` confirmed `expect, userEvent` import signature -- the literal content the plan's step 3 modifies.
- `pv-fn-spy-tests-pass`: post-implementation `nx run ngx-smart-components:test-storybook` returned 2/2 PASS; the final-consult prompt includes the test result text but not as a pv-* anchor.

**Proposed direction (B.1, broadened):** Update `references/context-packaging.md`:

- Verification template: add a `## Prior Pre-Verified Package Behavior Claims` section between `## Prior Strategic Direction` and `## Changes Made`. Executor reproduces all pv-* blocks from the pre-execute consult verbatim. New pv-* blocks introduced during execute (e.g., empirical findings from Phase 3) get appended.
- Proposal template (mid-execution re-consult variant): same -- pv-* blocks carry forward.
- Common Contract: when the user input or workflow context already contains pv-* blocks (from a prior skill in the same task), the current skill's consultation MUST carry those blocks forward into its first consult, in addition to any new pv-* the current skill verifies.
- Plan-output convention: plan skill's PLAN.md output should preserve pv-* blocks in a recognizable section so downstream skills can extract them mechanically when a plan file is mentioned.
- **NEW: Synthesis mandate.** Common Contract Rule 5: every Read or Bash output that produces a load-bearing empirical fact (file content matching plan claims, command output confirming or contradicting plan assertions, test results) MUST be packaged as a pv-* block in the next consultation prompt. Inferred-but-not-Read claims and generic API knowledge MUST NOT be packaged as pv-*; they belong in `## Source Material` or `## Orientation Findings`.

**Effort (B.1):** Low to Medium. Template-text edit in `references/context-packaging.md` + smoke test fixture that asserts pv-* block presence in the final-consult prompt when one was present in the pre-execute prompt, AND that the executor synthesizes >=1 pv-* block per material Read or Bash invocation in the orient phase.

#### B.2 -- "Pre-verified Claims" header confabulation (NEW)

**Observed (plan-fixes UAT, event 38 consultation prompt):**

The plan-skill executor packaged a `## Pre-verified Claims` section with 4 plain-bullet entries (not the canonical XML format). One bullet is a hallucinated import:

> "`haiku` import already present in stories file -- no new imports needed for `userEvent` or `expect`; only `fn` needs to be added to the import."

Stories file actually imports `expect, userEvent` from `storybook/test`. There is no `haiku` import (confirmed in event 31 file read). The executor invented a non-existent symbol and packaged it as pre-verified fact.

The other three bullets are assertions without evidence; one paraphrases the input review file's content while stripping the review's own verify-first caveat ("Verify Storybook Angular version behavior before acting" -- present in the input review file, absent from the executor's "Pre-verified Claims" section).

**Why it matters.** The "Pre-verified Claims" header is a load-bearing trust signal in the advisor's Context Trust Contract (`references/context-packaging.md` Common Contract Rule 5). Mislabeling unverified content under that header is the most direct way to launder confidence: the advisor's trust contract instructs it to treat pre-verified content as ground truth. If the executor labels confabulated or unverified content as pre-verified, the advisor inherits the false confidence and propagates it (see Finding C).

**Failure surface.** Any executor under context pressure can promote unverified content into the "Pre-verified Claims" header without any external check. The current SKILL.md and `references/context-packaging.md` describe what pv-* blocks should look like but do not prohibit non-XML "Pre-verified Claims" sections, and do not require an evidence step before a claim is labeled pre-verified.

**Proposed direction (B.2):** Update `references/context-packaging.md` Common Contract Rule 5:

- Make the canonical `<pre_verified source="..." claim_id="..."><claim>...</claim><evidence method="...">...</evidence></pre_verified>` XML block format mandatory. Plain-bullet "Pre-verified Claims" sections are non-conforming and MUST NOT be used.
- Add an executor responsibility: every pv-* block MUST cite (a) a source path or URL the executor read during this skill execution, and (b) a tool-output excerpt as evidence. Inferred claims, paraphrases, and generic API knowledge MUST NOT be packaged as pv-*.
- When an upstream artifact (review file, plan file) contains a verify-first caveat ("verify before acting", "(unverified)", "confirm X by..."), the executor MUST either resolve the caveat empirically OR carry it forward verbatim into the consultation prompt; it MUST NOT strip the caveat.

**Effort (B.2):** Medium. References doc edit + smoke test fixture that asserts pv-* sections use the XML format AND include source + evidence fields. Possibly a `references/orient-exploration.md` cross-reference noting that "verify before acting" markers in source materials block the orient phase from short-circuiting.

---

### C. NEW: 7-hop confidence-laundering chain across skill boundaries reaching committed source code

**Observed (execute -> review -> plan-fixes -> execute-fixes UAT chain on the same fn() spy + Storybook version question):**

| Hop | Source | Framing | Confidence level |
|---|---|---|---|
| 1 | Review-skill reviewer (session `5dbcc147-...` event 56) | "Assuming Storybook 8.x with `@storybook/angular` (unverified), do confirm signal-output action wiring..." | Hedge: "(unverified)" |
| 2 | User-written review file (`compodoc-storybook-angular-signals.review.md`) | "Verify Storybook Angular version behavior before acting." | Hedge: "Verify before acting" |
| 3 | Plan-fixes executor's "Pre-verified Claims" section (session `26868ae7-...` event 38) | OutputEmitterRef behavior asserted without "verify" caveat; mislabeled "Pre-verified" | Hedge stripped (B.2) |
| 4 | Plan-fixes advisor's Critical block (event 39) | "**which Finding 2 establishes** is broken for `OutputEmitterRef`" | Cited as established fact |
| 5 | Plan output PLAN.md (event 42, committed `2173e39`) | "the canonical Storybook 8+ pattern" -- new version qualifier introduced; testbed runs Storybook 10.3.5 | Confident assertion in durable artifact |
| **6** | **Execute-fixes consultation prompts (session `e4592a03-...` events 11 + 32)** | Plan SD quoted verbatim into pre-execute prompt's `## Source Material > Plan Strategic Direction` block; final-verification prompt restates the change rationale without re-anchoring | Qualifier propagates into both advisor call sites |
| **7** | **Commit `05ea109` on testbed branch `uat/manual-s4-v089-compodoc`** | Implementation matches the unverified pattern; tests pass empirically (luck or correct API); rationale lives in plan-input chain | **Durable source code with unverified provenance** |
| **8a (NEW, API-correctness axis)** | **Security-review skill UAT (session `2d388e98-...`)** | Reviewer never engaged with fn() spy or Storybook 8+ qualifier (out of scope for security review); chain stalled but NOT broken on this axis | No change |
| **8b (NEW, security-clearance axis)** | **Security-review skill UAT away_summary + final output** | "Two low-severity and one medium-severity finding around supply chain risk and XSS in the docs site" -- security imprimatur attached to commits that include the unverified API claim | **Imprimatur added on a different axis** |

Each hop strips a hedge or adds a confidence layer. By hop 7, an originally-flagged unverified claim has been laundered into committed source code with passing tests. **Seven agents/artifacts, zero empirical verification.**

The advisor specifically introduced "Storybook 8+" -- a version qualifier present in **none** of the upstream sources. This is a training-data injection on a question where the testbed runs `@storybook/angular@10.3.5` (verified `package.json`). The new version qualifier is not just unverified; it is positively wrong if the chain were to migrate to a Storybook version where the API was different (e.g., 7.x or earlier).

**Empirical fact: the implementation works.** Storybook 10.3.5 supports `fn()` in args (the API shape is consistent with Storybook 8+ but was not verified for 10.3.5 in the chain). Tests passing at the play-test layer doesn't validate the API rationale -- only the surface behavior. The chain shipped a correct answer through unverified provenance, which is the most dangerous failure mode: the chain provides positive feedback (tests pass) that the verification skip was harmless, training future executors to skip verification on similar questions.

**Why it matters.** Confidence laundering across skill boundaries is the meta-pattern that Findings A and B together point at. Finding A (silent apply-then-revert) is the executor-side failure mode; Finding B.2 ("Pre-verified Claims" confabulation) is the prompt-construction-side failure mode; Finding C is the chain-of-custody failure mode that makes both A and B more dangerous. Without a propagation guardrail, every additional hop in a multi-skill workflow is a compounding error opportunity. The execute-fixes UAT confirms the chain reaches durable source code; this is the load-bearing reason to prioritize C.

Pattern D's web-first orient is specifically designed to break this chain by forcing empirical verification on Class-2 questions. When Pattern D is suppressed (per the Phase 6 amendments 2 and 3), the chain runs end-to-end without a verification anchor. The execute-fixes UAT showed Pattern D suppression operates at the ToolSearch loading layer (executor never invoked `ToolSearch select:WebSearch,WebFetch`), making the chain harder to break than amendment 2 suggested.

**Proposed direction (C):** Four complementary guards (was three):

- **Hedge propagation rule** (in `references/context-packaging.md` Common Contract): when source material contains a verify-first marker (regex shapes: `\b(unverified)\b`, `\bverify .+ before acting\b`, `\bAssuming .+ \(unverified\)\b`, `\bconfirm .+ before\b`), the executor MUST either: (a) perform the verification step (WebSearch, Read, Bash) and replace the marker with an evidence citation; or (b) carry the marker verbatim into the consultation prompt's `## Source Material` section, forbidden from packaging the same content under `## Pre-verified Claims`.
- **Cross-skill hedge tracking** (in `references/orient-exploration.md`): a workflow-level note that successive skills MUST NOT strip verify-first markers introduced by upstream skills. If upstream review flags content as "verify before acting", downstream plan / execute must either resolve or propagate the hedge.
- **Version-qualifier anchoring rule** (in `references/context-packaging.md` Common Contract): when an upstream artifact introduces a version qualifier for a vendor library (e.g., "Storybook 8+", "Angular 17+", "TypeScript 5+"), the executor MUST verify the qualifier against the installed version before propagating into the consultation prompt. Mechanism: read the relevant `package.json` (or equivalent dependency manifest) for the actual installed version; either confirm the qualifier matches and synthesize a `pv-version-anchor` block, or strip the qualifier and replace with the empirically observed version. This rule is necessary because version-qualifier injection is the most common training-data bleed pattern observed across the chain.
- **NEW: Scope-disambiguated provenance markers on verdicts** (in `references/context-packaging.md` Common Contract + each SKILL.md output template): when a skill issues a verdict (PASS-with-observations, security-cleared, review-approved, etc.), the verdict MUST be tagged with the question-class scope it covers. Example tag set: `scope: api-correctness`, `scope: security-threats`, `scope: performance`, `scope: accessibility`. Downstream skills reading the verdict MUST check scope-match before treating it as authoritative for the question they are answering. Necessary because the security-review UAT (session `2d388e98-...`) demonstrated the chain bifurcates: the security-review broke the API-correctness chain (out of scope) but extended a different axis (security-clearance) by attaching its imprimatur to commits that ship unverified API claims. Without scope tags, downstream consumers (humans or agents) might conflate "security-cleared" with "API-correctness-verified".

**Effort (C):** Medium-high. Requires text edits across multiple references docs + a workflow-level smoke test that synthesizes a chain (review -> plan -> execute -> security-review) on a fixture with a verify-first marker, a version qualifier, AND a question-class boundary and asserts: (a) markers survive or are empirically resolved; (b) version qualifier is anchored to installed version; (c) verdicts carry scope tags; (d) downstream skills do not conflate scopes. Worth the effort: this is the meta-pattern that makes individual A/B failures dangerous in compound workflows, and the execute-fixes + security-review UATs confirmed the chain reaches durable source code AND bifurcates across question-class axes -- the highest-stakes failure surface.

---

### D. NEW: word-budget regression on security-reviewer agent

**Observed (security-review UAT, session `2d388e98-...` event 14, advisor response):**

The security-reviewer's response runs ~412 words against the **300-word cap** specified in `agents/security-reviewer.md` and CLAUDE.md ("reviewer and security-reviewer use `effort: xhigh` ... Word budget 300 words"). ~37% over budget.

**Breakdown (approximate):**

| Section | Words |
|---|---|
| Findings header + 3 finding blocks | 233 |
| Missed surfaces note | 28 |
| Threat Patterns | 140 |
| Headers / labels | 11 |
| **Total** | **~412** |

The output is structurally compliant (Findings + Threat Patterns sections present, file:line citations, OWASP categorization, severity revisions with rationale, hedge marker preserved on Finding 1) and qualitatively useful. The over-run is concentrated in the Threat Patterns section's extended chain articulation -- valuable content but exceeding the prescribed cap.

**Comparison to prior word-budget regression** (06-VERIFICATION.md original Stage 1 DEF, advisor SD 111w against 100w cap, ~11% over): this case is materially worse (~37% over a higher cap), suggesting the security-reviewer's word-budget contract is not load-bearing in the agent prompt the way the advisor's is. Plan-fixes UAT also showed advisor SD slightly over at ~115w numbered + ~50w Critical (above 100w cap). Pattern: word-budget regressions are pervasive across agents but currently treated as orthogonal follow-up scope.

**Why it matters.** Word-budget caps exist to control marketplace cost (advisor consultations should be strategic, not exhaustive) and to discourage the agent from re-deriving context the executor already has. ~37% over budget on every security-reviewer call multiplies cost across multi-skill workflows; cost discipline is a Plan 5.5 explicit goal that this regression undermines.

**Proposed direction (D):** Three options, prioritized by effort:

- **Option 1 (low effort):** tighten `agents/security-reviewer.md` word-budget enforcement language. Phase 5.4 D-08 verbose-prompt nudge style: descriptive triggers + worked example of a 300w response shape. Anthropic prompt-engineering doc warns against imperative escalation; descriptive triggers + few-shot examples are the recommended pattern.
- **Option 2 (low-medium effort):** add a smoke test fixture to `uat-pattern-d-replay/` (or a new `agent-budget-replay/` infrastructure) that runs the security-reviewer agent on a representative scan input and asserts response stays at <=300w. Run gates per-release like the existing closure-signal smokes.
- **Option 3 (medium effort, requires advisor input):** re-evaluate whether 300w is the right cap for security-review. Threat Patterns sections are inherently multi-finding-spanning narratives; perhaps 400w is the right cap with stricter Findings-section discipline (e.g., "each Finding block <= 80w; Threat Patterns <= 160w; Missed surfaces <= 30w; total <= 400w").

**Effort (D):** Low to medium. Recommend Option 1 + Option 2 in tandem -- the prompt change is cheap, and the smoke test prevents future regressions. Option 3 is a separate consideration about the contract itself.

**Cross-cutting note.** Word-budget regressions across multiple agents (advisor SD, security-reviewer) suggest a class-level gap: the agents do not currently treat word-budget as a hard constraint the way they treat structural section presence. A Phase 7 / Phase 6.1 plan should consider whether word-budget belongs in the agent prompt's hard-rules layer (alongside `tool_uses` discipline) rather than the soft-style layer.

**2026-04-30 cross-evidence (plan-skill UAT on plugin 0.9.0, session `a75fae2f-...`):** Advisor Strategic Direction on the canonical Compodoc+Storybook setup task ran 120 words against the 100-word cap (~20% over). 5 enumerated steps (~102w) + Critical line (~17w) = ~119-120w. Slight regression vs the 0.8.5 Stage 1 KCB-economics measurement (111w, ~11% over). Pattern: advisor-side word-budget regression persists across plugin versions on code-snippet-laden Strategic Directions. The 300w security-reviewer regression (Finding D primary observation) and the 100w advisor regression are likely shared root surface (descriptive vs imperative budget directives in the agent prompts).

**2026-04-30 cumulative evidence base (after 6 fresh UATs in the Compodoc+Storybook chain):** Word-budget regressions are pervasive across all 3 agents AND worsening on security-reviewer specifically. **Cumulative data points:**

| Agent | Plugin version | Cap | Actual | % over | UAT |
|---|---|---|---|---|---|
| security-reviewer | 0.8.9 | 300w | 412w | 37% | Finding D primary observation |
| **security-reviewer** | **0.9.0** | **300w** | **438w** | **46%** | **Test 46 — REGRESSION WORSENING** |
| reviewer | 0.9.0 | 300w | 411w | 37% | Test 22 |
| advisor | 0.8.5 | 100w | 111w | 11% | Stage 1 KCB-economics |
| advisor | 0.9.0 plan-skill | 100w | 120w | 20% | Test 8 |
| advisor | 0.9.0 plan-fixes | 100w | 109w | 9% | Test 30 (side observation) |

**Refined direction.** With 6 data points across 3 agents and 3 plugin versions, the original cross-cutting note is empirically validated: word-budget regressions are class-level. Recommended Phase 7 priority order:

1. **security-reviewer** — strongest regression (+46% over), worsening across versions (+9 percentage points 0.8.9 → 0.9.0). Highest-leverage target.
2. **reviewer** — same severity as security-reviewer's prior baseline (+37% over). Same fix surface (300w cap, similar agent prompt structure).
3. **advisor** — milder regression (+9-20% over depending on task) but more frequent invocations per workflow. Lower per-call savings but higher total cost impact.

Bundling all 3 agents in a single Phase 7 plan is more efficient than per-agent plans since the fix surface is consistent (descriptive → imperative + worked example + smoke fixture).

---

### E. NEW: Apply-without-verify on surviving hedge markers in execute skill (2026-04-30)

**Observed (execute-skill UAT 2026-04-30 on plugin 0.9.0, session `bf522c6e-1001-4a6a-9cfb-7885f9276386.jsonl`):**

The plan input (`compodoc-storybook-setup.plan.md`) contained an explicit verify-first hedge marker:

> "verify the Docs tab renders the output (fall back to `@Output() sampleOutput = new EventEmitter<void>()` if Compodoc 1.2.1 still skips `output()`)"

This marker is exactly the shape Plan 06-05's hedge-marker preservation rule was designed to handle.

Empirical sequence:

1. **Plan 06-05 prompt-layer rule WORKED:** hedge marker survived verbatim into pre-execute consultation source material. (`fall back to` and `still skips output` both grep-positive in session JSONL; the pre-execute consultation prompt's `## Source Material > Plan Strategic Direction` block contains the marker unstripped.)
2. **Pre-execute advisor saw the hedge but did NOT refuse-or-flag.** No literal "Unresolved hedge: X" frame in the advisor response; no "Verify before committing" instruction added to the Strategic Direction.
3. **Executor wrote 2-byte stub `documentation.json` (`{}`)** per the plan's first-run TypeScript-import-resolution convention (plan line 121).
4. **Executor never ran Compodoc.** 0 `compodoc` CLI Bash invocations; 0 `nx run *:storybook` or `nx build-storybook` invocations.
5. **Executor never read `documentation.json`.** 0 Reads of `documentation.json` in the session.
6. **Executor never inspected JSON for signal classification.** 0 references to `outputsClass`, `propertiesClass`, `inputsClass`, `methodsClass` in the session.
7. **Executor committed signal `output()` path** (commit `feat(storybook): integrate Compodoc for Docs tab with signal inputs/outputs`) without verification. Commit body lists "Add JSDoc, sampleInput signal, and sampleOutput signal to NgxSmartComponents" -- chose signal `output()` (not the `@Output() EventEmitter` fallback).
8. **Final advisor review caught a different issue** (`resolveJsonModule` misplacement on `tsconfig.doc.json`) but did NOT challenge the unverified signal `output()` claim, even though the same pre-execute hedge marker was visible in the consultation context.

The hedge required "verify the Docs tab renders the output before committing"; the verification action was skipped, and the commit shipped the un-verified optimistic path.

**Why it matters.** Phase 6's Plan 06-05 introduced the hedge-marker preservation rule at the **prompt layer**. The rule WORKS: markers survive into the consultation prompt, unstripped. But there is no corresponding **execute-phase rule** that says "if a hedge marker survived into source material, the corresponding verification action MUST be performed before the related commit." Result: prompt-layer preservation succeeds, but the executor still ships unverified work. The contract has two layers; only one is implemented.

**Relationship to existing Findings.**

- **Adjacent to Finding A** (silent apply-then-revert) but distinct failure mode:
  - Finding A: applied -> reverted silently -> no verify (silent rollback of advisor Critical content)
  - Finding E: applied -> committed -> never reverted -> still no verify (verify-first hedge ignored, optimistic path shipped)
  - Both are "verify-skip" patterns; A's root surface is reconciliation policy on Critical content, E's root surface is execute-phase verify-before-commit discipline on surviving hedges. Could be merged in Phase 7 under a unified "verify-skip discipline" finding, or kept separate to preserve the distinct fix surfaces.

- **Adjacent to Finding C** (7-hop confidence-laundering chain) but more localized:
  - Finding C: cross-skill chain (review -> plan -> execute -> security-review) launders confidence via hedge stripping at skill boundaries
  - Finding E: within-skill (execute) accepts an upstream hedge into its own consultation prompt verbatim (so C's "Hedge propagation rule" is satisfied), but then commits without resolving the hedge (so the verification anchor that should break the chain is absent)
  - Finding C's "Hedge propagation rule" handles the prompt-construction side; Finding E's "verify-before-commit" rule handles the execute-side completion. Both rules are necessary.

- **Reinforces Finding B.1's synthesis mandate.** The execute-skill UAT had 0 pv-* synthesis from execute-phase empirical work (npm install success, package.json grep, git status). Even a `pv-package-installed` block citing the npm install output would have anchored an empirical fact. The synthesis-mandate sub-issue of B.1 covers this; Finding E's verify-action requirement extends it: not only synthesize pv-* for empirical work that was done, but also DO the empirical work the surviving hedge requires.

**Failure surface (REFINED 2026-04-30 by execute-fixes UAT).** Two distinct sub-patterns:

**E.1 -- Hedge markers in plan rationale (original Finding E surface).** Any execute-skill invocation where the plan input contains a verify-first hedge marker on a load-bearing implementation choice. The pattern is general (not specific to Compodoc/Storybook):

- Plan: "use signal X (fall back to decorator Y if signal X doesn't work in version Z)"
- Plan: "Verify the build passes after step N before committing"
- Plan: "Assuming API behavior is unchanged in version V (unverified), do the implementation; verify before merging"

**E.2 -- EXPLICIT validation steps in plan Steps section (NEW from execute-fixes UAT 2026-04-30).** Any execute-skill invocation where the plan input contains a numbered, executable plan step structured as:

```
N. **Validate** (or Verify, Test, Confirm)
   - Run: `<command>`
   - Verify: <observable conditions>
```

Empirical example from execute-fixes UAT (session `c28c99cb-...`, commit `18728dd`):
- Plan-fixes plan Step 4: `**Validate** - Run: pnpm nx storybook ngx-smart-components - Verify: Storybook starts without TypeScript errors; the Docs tab renders Compodoc descriptions for sampleInput and sampleOutput; clicking "Emit" in the rendered component fires the output in the Actions panel.`
- Executor's behavior: 0 Bash invocations of `pnpm nx`, `nx run`, `nx storybook`. Final summary verbatim: "**Next step:** Run `pnpm nx storybook ngx-smart-components` and click Emit to confirm..." — treats the plan's numbered validation step as USER-FACING instructions rather than EXECUTOR-BOUND action items, defers it to post-commit.
- Net effect: the commit shipped 4 changes (3 code + 1 stub file) without ANY of the verification gates the plan structured into Step 4 actually firing.

In both E.1 and E.2 cases, the current execute SKILL.md has no rule that requires the executor to perform the verification before the commit lands. The advisor consultation can see the hedge or validation step but is not instructed to flag it. The executor can choose the optimistic path silently.

**Why E.2 matters more than E.1.** E.1 is about hedges (uncertain claims that need resolution); E.2 is about explicit, structured validation steps the plan author already decided are necessary. E.2 is the stronger failure mode because the plan has explicitly stated "this step is the load-bearing validation" and the executor still skipped it. The fix surface for E.2 is execute SKILL.md prose directing the executor to ALWAYS execute `Run:` directives in Steps section as Bash invocations, not user-facing instructions.

**Proposed direction:** Two complementary surfaces:

- **Execute SKILL.md `<verify_before_commit>` block (NEW):** "When source material in your consultation prompt contains a verify-first marker (`Verify .+ before acting`, `Assuming .+ \(unverified\)`, `confirm .+ before`, `fall back to .+ if .+`, or similar shapes), and the marker concerns a load-bearing implementation choice, you MUST perform the verification action (run the relevant build/test, read the produced artifact, inspect output) BEFORE the commit that ships the choice. The verification result MUST be added to the commit body as a `Verified: <claim>` trailer OR a follow-up commit must record the verification with empirical evidence. If verification is impossible in the current session (missing tools, missing infrastructure), the commit MUST be marked WIP and a `## Outstanding Verification` section MUST be appended to the consultation's `<final>` output."

- **Advisor agent prompt rule (refuse-or-flag):** Update `agents/advisor.md` (and possibly `agents/reviewer.md`, `agents/security-reviewer.md`) so that when consultation source material contains an unresolved verify-first marker on a load-bearing implementation choice, the advisor's Strategic Direction (or Critical block) MUST flag the unresolved hedge with a literal frame: "Unresolved hedge: <marker text>. Verify <action> before/after committing." This is the second-line guard: the advisor either trusts the executor performed verification (executor adds `Verified:` trailer), or the advisor signals the gap.

**Effort:** Medium. Execute SKILL.md text edit (~30 lines for `<verify_before_commit>` block + smoke test) + advisor agent prompt edit (~10 lines for refuse-or-flag rule) + smoke test fixture in `uat-pattern-d-replay/` (or a new `verify-before-commit-replay/` infrastructure) that synthesizes a hedge-marker survival scenario and asserts: (a) the executor performs the verification action AND adds a `Verified:` trailer to the commit body, OR (b) the advisor flags the unresolved hedge with the canonical frame, OR (c) the executor produces a WIP commit + `## Outstanding Verification` section. Cost: roughly equivalent to Finding A's reconciliation-policy edit + smoke test.

**Cross-evidence with Phase 6 Plan 06-05.** Plan 06-05's hedge-marker preservation rule is documented in 4 SKILL.md `<context_trust_contract>` blocks (sentinels: `Verify .+ before acting`, `Assuming .+ \(unverified\)`, `confirm .+ before`). The rule is structured as a **negative constraint** ("MUST NOT strip hedge markers from source material; MUST NOT promote them into Pre-verified Claims"). This UAT shows the negative constraint is necessary but NOT sufficient: it preserves the marker into the prompt but does not produce verification action downstream. Finding E adds the **positive counterpart**: not only "don't strip" but "if present, do the verification."

**Empirical fact: implementation may have shipped correctly.** Compodoc 1.2.1 likely supports signal `output()` correctly (the executor's optimistic path was probably right; npm package metadata for `@compodoc/compodoc@1.2.1` mentions signal-input support added in 1.1.24, with output support implied by some changelog entries). Tests passing or storybook generating documentation.json correctly would confirm. But **the executor shipped the choice without verifying**, which is the failure mode regardless of whether the optimistic path happens to work. Same dynamic as Finding C: positive feedback (commit lands, no immediate failure) trains future executors to skip verification on similar questions.

**Priority vs other findings.** Finding E is a NEW failure surface that compounds Findings A (verify-skip on Critical revert) and C (hedge stripping across skill boundaries). It is the within-skill complement to C's cross-skill chain, and the apply-and-keep complement to A's apply-and-revert. **Recommended priority: high** -- the fix surface is well-localized (one block in execute SKILL.md + one rule in advisor agent prompt + one smoke fixture), and the failure mode is general (any execute-skill invocation on a hedged plan).

**Open question for Phase 7 design:** should Findings A + E be merged into a single "verify-skip discipline" finding with two sub-patterns? Pro: cleaner Phase 7 plan, single fix surface (execute SKILL.md verify-before-commit + advisor refuse-or-flag covers both). Con: the original Finding A surface (Reconciliation policy in Phase 3 / Phase 5 of execute SKILL.md) is structurally distinct from Finding E's surface (Phase 6 commit gate). Recommend: keep separate in candidates, merge into a single Phase 7 plan if a unified `<verify_skip_discipline>` block makes sense in the SKILL.md flow.

---

### F. NEW: Reviewer agent has no web-tool grant; Class-2 questions surfaced by reviewer cannot be self-verified (2026-04-30)

**Observed (review-skill UAT 2026-04-30 on plugin 0.9.0, session `48bd9cc5-b1f0-4641-a4bc-8e7595f74758.jsonl`):**

The reviewer agent's Finding 4 raised a Class-2 (API currency) question with proper hedge frames per the agent system prompt:

> "More critically, `continuous: true` targets in Nx skip caching by default, which mitigates the staleness risk -- Assuming `continuous: true` disables caching for this target (unverified against the installed Nx version), the practical impact is limited to output tracking hygiene, do keep severity at Suggestion. Verify cache behavior for continuous targets in `node_modules/nx/PLUGIN.md` or Nx docs before acting."

The hedge frames (`Assuming X (unverified)` + `Verify Y before acting`) are the canonical Plan 06-05 / agent-prompt patterns, properly applied. The reviewer agent's structural-discipline side works correctly. But:

1. **Reviewer agent has only `["Read", "Glob"]` tools** per `agents/reviewer.md` and CLAUDE.md plugin design. It cannot invoke `WebSearch`, `WebFetch`, or `Bash` directly. Web-side verification is structurally impossible from within the reviewer agent.
2. **Executor's scan phase** had 4 git Bash + 6 project file Reads + 0 web tools. The executor did NOT anticipate the Nx Class-2 question that the reviewer would surface — the executor scanned the diff for code-quality issues but did not pre-empt likely Class-2 surfaces (Nx version, framework version, library version) with WebSearch.
3. **Net effect:** Class-2 hedge survives into the reviewer's output unstripped (positive — Plan 06-05 hedge-marker preservation works in review skill too) but no verification action ever fires within the skill execution. The user receives a hedged finding without the verification that would resolve the hedge.

**Why it matters.** The review skill is designed as an independent quality check on completed work. When the reviewer surfaces a Class-2 question with proper hedge frames, the user receives information that is ACTIONABLE-but-UNRESOLVED. Compared to the plan-skill (which fires Pattern D in orient phase and synthesizes pv-* blocks before consulting the advisor), the review-skill has no equivalent verification phase. The reviewer's hedge propagates to the user as an open question rather than as a closed finding with empirical anchor.

**Distinct from Findings C and E.**

- **Finding C** (chain-of-custody) is cross-skill: hedge stripping at skill boundaries.
- **Finding E** (apply-without-verify) is execute-skill-internal: verify-before-commit on hedged claims.
- **Finding F** (this) is review-skill-internal: verify-before-output on hedged claims surfaced by the reviewer agent itself.

All three address verification gaps but at different skill points. F's surface is uniquely "the reviewer agent surfaces a Class-2 question that the executor's scan did not anticipate."

**Failure surface.** Any review-skill invocation where the reviewer's findings include Class-2 questions about library versions, framework behavior, or vendor APIs that the executor's scan-phase project-file reads cannot answer. Common patterns:

- "Assuming `<framework feature>` works in `<installed version>` (unverified)..."
- "Verify cache behavior / lifecycle / API shape in `<vendor docs>` before acting"
- Nx version-conditional behavior (caching, executors, target dependencies)
- Framework version-conditional behavior (Storybook 8 vs 10 patterns, Angular 17+ signals)
- Library version-conditional API surfaces (any `package@version` API question)

**Proposed direction:** Three options, prioritized by minimal change:

- **Option 1 (low effort, low round-trip cost):** **Pre-emptive Class-2 scan in executor.** Update `lz-advisor.review/SKILL.md` Phase 1 (Scan) to add an explicit pre-emption step: "Before consulting the reviewer, identify likely Class-2 surfaces in the changed code (vendor library imports, framework version-conditional patterns, build-tool target configs) and pre-empt them with WebSearch / WebFetch + pv-* synthesis. The pre-empted answers anchor the reviewer's findings; the reviewer can then close hedges that the pre-emption resolved." Cost: 1-3 extra WebSearch calls per review invocation; benefits: most hedges resolved before reviewer even sees them.

- **Option 2 (medium effort, requires re-architect):** **Reviewer escalation hook.** Update `agents/reviewer.md` system prompt to emit a structured `## Verification Requested` block (e.g., `<verify_request question="..." class="2" anchor_target="pv-..." />`) when the reviewer cannot resolve a Class-2 question. Update `lz-advisor.review/SKILL.md` Phase 3 (Output) to detect these blocks before final user output: if present, the executor performs the requested verification (WebSearch / WebFetch), synthesizes pv-* blocks, and re-invokes the reviewer ONCE with the new anchors so the reviewer can close the hedge. Cost: 2-3 SKILL.md edits + reviewer agent prompt edit + smoke test fixture; benefits: surgical — only fires when reviewer surfaces an unresolved Class-2.

- **Option 3 (re-architecture):** **Extend reviewer agent tool grant** to include WebSearch + WebFetch + ToolSearch. Cost: changes principle-of-least-privilege design (reviewer was scoped to read-only by intent); benefits: simplest mechanism — reviewer self-verifies its own Class-2 questions inline.

**Effort:** Low to Medium. Recommend Option 1 + Option 2 in tandem: Option 1 catches predictable Class-2 surfaces upfront; Option 2 handles the long tail of reviewer-surfaced surprises. Option 3 is held in reserve if Options 1+2 prove insufficient.

**Cross-evidence.** This UAT is the first review-skill data point where a Class-2 question with hedge frames was surfaced by the reviewer (prior review-skill UAT in `uat-review-skill/session-notes.md` on plugin 0.8.9 produced a different finding mix). One data point; needs n>=2-3 trials to confirm pattern is robust across different review scenarios. But the structural design constraint (reviewer agent has no web tools by intent) is permanent under current plugin design and applies generally.

**Priority vs other findings.** Finding F is a discrete design gap with well-localized fix surface. Lower load-bearing than E (which directly compromises commit correctness) but higher than D (which is cosmetic budget overrun). Recommend medium-high priority in Phase 7 plan; can be bundled with Findings A + E + G under a unified "verify-skip discipline" plan since all four address the same core concern (verification is missing at skill boundaries).

---

### G. NEW: Review skill does not provide safety net for verify-before-commit gaps in changed code (2026-04-30)

**Observed (review-skill UAT 2026-04-30, same session `48bd9cc5-...` reviewing the execute-skill commits from session `bf522c6e-...`):**

The execute-skill UAT shipped a verify-before-commit gap (Finding E): the executor committed signal `output()` path without empirically verifying Compodoc 1.2.1 supports it, despite a verify-first hedge marker preserved in the consultation prompt. The review skill was then run on the resulting commit range to test whether it would catch this verify-skip pattern as a downstream safety net.

**Reviewer's 4 findings adjudicated against the verify-skip surface:**

| Finding | Topic | Catches Finding E gap? |
|---|---|---|
| 1 (Important) | TypeScript can't find documentation.json before first compodoc run; recommend stub `{}` workaround | NO -- treats empty stub as a TypeScript-compile-time concern; misses that the stub IS the verify-skip signal |
| 2 (Suggestion) | --disableSourceCode tradeoff | NO -- unrelated topic |
| 3 (Suggestion-borderline-Important) | "The output is unreachable from the template" | ADJACENT -- about template event-binding (component template just has `<p>NgxSmartComponents works!</p>` with no `(sampleOutput)="..."` handler), NOT about whether Compodoc 1.2.1 supports signal `output()`. Doesn't catch Finding E. |
| 4 (Important-revised-up) | Nx outputs declaration + continuous:true caching | NO -- unrelated topic; itself unverified per Finding F |

The Cross-Cutting Patterns section synthesized findings 1+4 around `documentation.json` artifact lifecycle and findings 2+3 as polish items. **No verify-before-commit pattern note. No provenance / verification-status flag on the changed code.**

**Why the review-skill missed it.**

Two structural constraints prevent the review-skill from catching verify-skip patterns:

1. **The reviewer does not have access to the execute session log** — it only sees the commit range. Information like "the executor never ran Compodoc to inspect signal classification" lives in the execute session JSONL, not in the diff or working tree. The reviewer can detect the empty-stub `documentation.json` as a code-shape signal (and Finding 1 did identify the TypeScript implication), but cannot trace the provenance back to a verify-skip.

2. **The reviewer's mandate as currently scoped** focuses on code-shape concerns: logic errors, bugs, CLAUDE.md violations, security issues, correctness problems, edge cases not handled. "Did the upstream skill verify this hedged claim before committing?" is a provenance question, not a code-shape question; it falls outside the current scan criteria.

**Why it matters.** Finding G is the downstream safety-net for Finding E's upstream prevention. Finding E says "executor must verify before commit"; Finding G says "reviewer should catch unverified commits as a safety net when E's prevention fails." Both rules are necessary because:

- Even with Finding E's verify-before-commit rule, executors under context pressure or with weaker self-discipline may still skip verification (the failure mode that produced Finding E in the first place is exactly this).
- Without Finding G's safety net, verify-skip commits flow through review-skill un-flagged, creating false confidence in the review pass.
- The compounding effect (E + G both failing) is the same pattern as Finding C's cross-skill confidence laundering: unverified content propagates with positive feedback (review approved) at each hop.

**Failure surface.** Any review-skill invocation where the changed code implements a hedged plan claim and the implementation lacks a corresponding verification commit / `Verified:` trailer / pv-* anchor in the commit body. The pattern is general:

- Plan: "use signal `output()` (fall back to decorator if version Z doesn't support it)" → execute commits signal `output()` without verifying → review must flag the missing verification.
- Plan: "Assuming feature flag X is on (unverified), do Y" → execute commits Y assuming X → review must flag the missing flag-state verification.
- Plan: "Verify build passes after step N before committing" → execute commits without running build → review must flag the missing build-verification.

**Proposed direction:** Three complementary surfaces:

- **Review SKILL.md scan criteria entry (NEW):** Add to `lz-advisor.review/SKILL.md` Phase 1 (Scan) scan-criteria list:
  > "**Verification gaps in implementation of hedged claims.** When changed code implements a load-bearing claim that an upstream artifact (plan, prior consultation) marked as hedged (`Assuming X (unverified)`, `Verify Y before acting`, `fall back to ... if ...`), check the commit body and any follow-up commits for a verification record (`Verified: <claim>` trailer, pv-* anchor, or empirical evidence). Flag the absence as a finding: 'Hedged claim X was implemented without verification record.'"

- **Reviewer agent system prompt directive (NEW):** Add to `agents/reviewer.md`:
  > "When the executor packages findings on changed code that implements a hedged upstream claim (visible in `## Source Material` or `## Prior Strategic Direction` blocks), and the commit body lacks a `Verified:` trailer or pv-* anchor for the hedged claim, surface the verification gap as an Important finding."

- **Optional escalation: review skill takes execute session log as input.** When `/lz-advisor.review` is invoked with both a commit range AND an execute session log path, the executor scans the session log for unresolved hedges that did not receive a verification action before commit. This is the strongest mechanism but adds operational complexity (session log discovery + parsing). Recommend as a Phase 7+ enhancement, not a Phase 7 minimum.

**Effort:** Low to Medium. Review SKILL.md text edit (~10 lines for new scan criterion) + reviewer agent prompt edit (~5 lines for new directive) + smoke test fixture that synthesizes a hedge-marker commit lacking a verification record and asserts the reviewer flags it. Bundling cost with Finding E (upstream prevention) makes a clean Phase 7 plan: "verify-before-commit + safety-net" as paired rules.

**Relationship to Finding E.** Findings E and G are tightly coupled: E is upstream prevention, G is downstream detection. They should be designed and shipped together — addressing only E without G leaves the safety-net side unprotected; addressing only G without E forces the safety net to compensate for an upstream gap that the executor could close cheaply. Recommend: in Phase 7, plan E + G as a single multi-skill plan that touches `agents/advisor.md` (refuse-or-flag), `skills/lz-advisor.execute/SKILL.md` (verify-before-commit), `agents/reviewer.md` (catch-verify-skip), and `skills/lz-advisor.review/SKILL.md` (scan criterion). Smoke fixture exercises the full chain.

**Priority vs other findings.** Lower individually than E (which directly compromises commit correctness) but the E + G pair is significantly more robust than E alone. Recommend grouping in Phase 7 as a unified "verification chain integrity" plan covering execute prevention + review detection.

---

### H. NEW: Executor self-confabulates pv-* anchor from claimed framework knowledge despite trust-contract carve-out firing (2026-04-30)

**Observed (plan-fixes UAT 2026-04-30 on plugin 0.9.0, session `fc44ddc9-a7fb-4153-9cd4-755db416c1eb.jsonl`):**

This UAT is the 3rd plan-fixes fixture in the Compodoc+Storybook chain (after `uat-plan-skill-fixes` 0.8.9 + `uat-plan-skill-fixes-rerun` 0.9.0). Both prior runs FAILED on the G1+G2 empirical residual surface; the conventional interpretation (per amendment 5) was that the trust-contract carve-out was structurally landed but not behaviorally selected — a "rule miss" pattern. This UAT empirically refutes that interpretation:

1. **Trust-contract carve-out FIRED correctly.** All 3 Plan 06-05 sentinels are present in session context (`Vendor-doc authoritative source`, `Agent-generated source material`, `ToolSearch select:WebSearch,WebFetch`). The executor's orient phase reasoning explicitly classified the review input as agent-generated source. Verbatim from session:
   > "...so I proceed with verification. One framework-convention claim to note: `continuous: true` in Nx means the target is not cacheable (continuous targets run indefinitely as dev servers, so Nx never caches their output). I'll mark this as pre-verified from Nx semantics."

2. **ToolSearch + web tools STILL did not fire.** 0 ToolSearch + 0 WebSearch + 0 WebFetch in the session, despite the carve-out firing.

3. **Executor synthesized a pv-* anchor from claimed knowledge.** The advisor consultation prompt contains:
   > `<claim>continuous: true on an Nx target marks it as a long-running process (dev server); Nx does not cache continuous targets and never replays their output from cache.</claim>`
   > `<evidence method="...">...</evidence>`
   
   The `<evidence method="">` field cites "Nx semantics" rather than a Read of `node_modules/nx/PLUGIN.md`, a WebFetch of Nx docs, or a Bash invocation against an actual continuous target.

4. **Plan stripped the hedge.** Reviewer's hedge marker (`Assuming X (unverified) ... Verify Y before acting`) survived into the consultation source material verbatim (Test 29 PASS — Plan 06-05 prompt-construction layer rule works), but the plan output strips it: Strategic Direction asserts "continuous: true neutralizes Finding 4"; Key Decision asserts "continuous: true makes the storybook target non-cacheable (Nx never replays continuous targets from cache)."

**Why it matters.** Plan 06-05's `<context_trust_contract>` block was designed with a binary routing assumption: when the input is agent-generated source, the carve-out routes the executor away from "trust the source" and toward "do empirical verification." This UAT shows the routing is NOT binary — there is a **third path the carve-out doesn't close**: the executor self-anchors on claimed framework knowledge ("I know how Nx semantics work") and synthesizes a pv-* block from that claim, bypassing both the source AND the verification step.

The G1+G2 empirical residual root cause (per amendment 5) is therefore NOT "ToolSearch-availability rule doesn't fire because the trust-contract carve-out short-circuits ranking" — it is "the executor's self-anchor pathway is faster than ranking, so neither the carve-out nor the rule changes behavior on inputs where the executor already feels confident."

**Relationship to existing findings.**

- **Finding B.2** (confabulation under Pre-verified header) is the closest existing surface. B.2's proposed mitigation in `references/context-packaging.md` Common Contract Rule 5 says: "every pv-* block MUST cite (a) a source path or URL the executor read during this skill execution, and (b) a tool-output excerpt as evidence. Inferred claims, paraphrases, and generic API knowledge MUST NOT be packaged as pv-*."
  - **B.2's mitigation, if enforced structurally, would block this UAT's confabulation.** The pv-* block on `continuous: true` would fail validation: no Read tool output, no WebFetch source, no Bash output excerpt — only "Nx semantics" claimed knowledge.
  - **Finding H is empirical evidence that B.2's mitigation is necessary.** B.2 was previously a "could happen" surface; H is "did happen, on plugin 0.9.0, 3rd plan-fixes fixture, with detailed mechanism."
  - **Finding H is also distinct from B.2 in failure mechanism.** B.2's primary symptom is structural (plain-bullet "Pre-verified Claims" sections instead of XML); H's symptom is structural-XML-compliant but EVIDENCE-FREE. B.2 + H together cover both ends of the confabulation spectrum.

- **Finding C** (cross-skill confidence laundering) is reinforced. The chain in this UAT: review hedges Class-2 → plan-fixes consultation prompt preserves hedge (positive) → plan-fixes executor self-anchors on claimed knowledge → advisor accepts framing → plan output strips hedge. Same chain pattern as amendments 2 + 3 of 06-VERIFICATION.md but with self-confabulation as the laundering mechanism instead of "treat as authoritative."

- **Finding E** (advisor refuse-or-flag) is reinforced. The plan-fixes advisor consultation source material had the hedge marker visible (`unverified` 4 hits, `Assuming` 1 hit, `before acting` 2 hits in session). The advisor's Strategic Direction did NOT contain "Unresolved hedge: X. Verify Y before acting" frame — it accepted the executor's confabulated pv-* claim without flagging. This is the first in-skill instance of E's advisor-side gap.

- **G1+G2 empirical residual** interpretation is REFINED, not contradicted. The residual is real (3 fixtures FAIL) but the root-cause analysis must change: the failure is not "rule miss" but "rule bypass via self-anchor."

**Failure surface.** Any plan-skill or execute-skill invocation where:
- (a) input contains agent-generated source on a Class-2/3/4 question (trust-contract carve-out trigger);
- (b) the question is in a domain where the executor has high confidence in claimed knowledge (Nx semantics, Storybook semantics, Angular framework conventions, common JS/TS patterns);
- (c) the carve-out fires correctly (executor explicitly classifies the source as agent-generated);
- (d) but the executor self-synthesizes a pv-* block from claimed knowledge instead of invoking ToolSearch / WebSearch / WebFetch.

The pattern is general: any well-known framework topic where the executor's training-data confidence exceeds its calibration threshold for "needs verification" can produce this failure.

**Proposed direction.** Two complementary surfaces (recommend bundling with B.2):

- **Strengthen B.2's pv-* validation rule (in `references/context-packaging.md` Common Contract Rule 5):** make the "evidence MUST cite source path or URL the executor read AND tool-output excerpt" requirement structural, not advisory. Add a smoke-test fixture that fails the consultation packaging if any pv-* block has empty/claimed-knowledge `<evidence>` field. Specifically:
  > "The `<evidence>` element of any `<pre_verified>` block MUST contain (a) a `source=` attribute referencing a file path read in the current skill execution OR a URL fetched in the current skill execution, AND (b) literal tool-output text content (the excerpt the executor extracted from the Read or WebFetch result). Empty `<evidence>` elements, `<evidence method='claimed knowledge'>` patterns, or `<evidence method='X semantics'>` patterns are non-conforming and MUST be rejected."

- **Plan 06-05 G2 supplement (in 4 SKILL.md `<context_trust_contract>` blocks):** when the executor proposes a pv-* synthesis on a Class-2/3/4 question, the ToolSearch-availability rule MUST trigger BEFORE the synthesis lands in the consultation prompt. Currently the rule fires "before ranking" per the contract prose, but in practice the executor's self-anchor pathway is faster than ranking. New trigger: "Before packaging any pv-* block on a Class-2/3/4 question, verify either (a) the block's `<evidence>` field cites a Read or WebFetch tool output from this skill execution, OR (b) ToolSearch availability has been invoked. If neither, the synthesis is non-conforming."

**Effort:** Medium. References doc edit + 4 SKILL.md edits (byte-identical canon contract) + smoke test fixture. Possibly merge with B.2's existing proposed direction into a single "pv-* discipline" plan in Phase 7. Estimated cost: bundles cleanly with B.2 + E + Finding G into a unified Phase 7 plan covering execute discipline + verification anchors + advisor refuse-or-flag.

**Cross-evidence.** This is the FIRST UAT to demonstrate the trust-contract carve-out firing correctly while the executor still bypasses verification. Prior plan-fixes UATs (0.8.9 + 0.9.0 rerun) had the carve-out either not present (0.8.9) or not behaviorally selected (0.9.0 rerun). This UAT confirms the carve-out's prose-classification step works AND identifies the self-anchor pathway as the actual residual root cause.

**Priority vs other findings.** **High.** Finding H is the empirical refutation of amendment 5's "rule miss" interpretation. Without H, Phase 7 plans for the G1+G2 residual could fixate on the wrong mechanism (e.g., moving the rule earlier in SKILL.md prose). With H, Phase 7 has the correct target: the self-anchor pathway + B.2's pv-* validation. This is the highest-leverage finding from this UAT cycle.

**Open question for Phase 7 design.** Should B.2 + H be merged into a single "pv-* synthesis discipline" finding? Pro: cleaner plan, single fix surface (Common Contract Rule 5 strengthening covers both). Con: B.2's primary symptom (plain-bullet vs XML) is structural-shape; H's primary symptom (XML-compliant but evidence-free) is content-shape. They share root cause but distinct symptoms; keep separate in candidates, merge into a single Phase 7 plan if a unified `<pv_synthesis_discipline>` block makes sense.

---

## Out of scope (deliberate non-candidates)

- **RTK wrapping in `npm run` scripts** (execute-skill UAT events 168-174): user-level wrapper, not a skill defect.
- **Proactive `documentation.json` generation** (execute-skill UAT event 138): positive observation; no action needed.
- **Trivial unused-import correction** (execute-skill UAT events 144 -> 161): correctly handled solo per Phase 3 ("Trivial fixes ... proceed solo").
- **Plan-fixes UAT first-invocation no-args double-tap** (events 6 and 17): user input artifact, not a skill defect.
- **Execute-fixes UAT recovery loop on test runner** (events 20 -> 27): graceful Phase 1 failure recovery (failed `nx run ... test-storybook` -> background Storybook -> 30s wait -> retry); behaves correctly per `references/context-packaging.md` "recover gracefully from tool-use failure". Inflated Bash count (7) but no skill defect.
- **Security-review UAT em-dash usage in agent output** (Opus reviewer's natural style): user CLAUDE.md prohibits em dashes for the user's local environment; marketplace-plugin agent output has different conventions and em dashes are acceptable. Not a skill defect.

## Cross-references

- Execute-skill UAT artifact: `.planning/phases/06-address-phase-5-6-uat-findings/uat-execute-skill/session-notes.md`
- Review-skill UAT artifact: `.planning/phases/06-address-phase-5-6-uat-findings/uat-review-skill/session-notes.md`
- Plan-fixes UAT artifact: `.planning/phases/06-address-phase-5-6-uat-findings/uat-plan-skill-fixes/session-notes.md`
- Execute-fixes UAT artifact: `.planning/phases/06-address-phase-5-6-uat-findings/uat-execute-skill-fixes/session-notes.md`
- Security-review UAT artifact: `.planning/phases/06-address-phase-5-6-uat-findings/uat-security-review-skill/session-notes.md`
- Phase 6 verification: `.planning/phases/06-address-phase-5-6-uat-findings/06-VERIFICATION.md` (amendment 1 = PASS-with-caveat on plan-skill UAT 2026-04-29; amendment 2 = Pattern D / review-file authoritative-source gap; amendment 3 = Pattern D / plan-file input + ToolSearch-layer suppression; amendment 4 = security-embedded Class-2 patterns missing from question-class taxonomy)
- Phase 5.4 candidates (precedent for pv-* template work): `.planning/phases/05.3-resolve-issues-identified-in-field-test-and-take-the-quick-2/PHASE-5.4-CANDIDATES.md` (Findings B, C)
