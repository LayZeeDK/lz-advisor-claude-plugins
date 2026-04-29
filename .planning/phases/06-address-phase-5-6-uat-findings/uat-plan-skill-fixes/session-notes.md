---
status: pass-with-significant-observations
phase: 06-address-phase-5-6-uat-findings
type: manual-uat
skill: lz-advisor.plan
plugin_version: 0.8.9
testbed: D:/projects/github/LayZeeDK/ngx-smart-components
testbed_branch: uat/manual-s4-v089-compodoc
session_log: c:/Users/LarsGyrupBrinkNielse/.claude/projects/D--projects-github-LayZeeDK-ngx-smart-components/26868ae7-1f9a-4a71-a146-16e7781b74c6.jsonl
session_start: 2026-04-29T20:58:27Z
session_end: 2026-04-29T21:04:20Z
session_duration_min: 5.9
input_review_file: D:/projects/github/LayZeeDK/ngx-smart-components/plans/compodoc-storybook-angular-signals.review.md
output_plan_file: D:/projects/github/LayZeeDK/ngx-smart-components/plans/address-review-findings-compodoc-storybook.plan.md
plan_commit: 2173e39
verdict: PASS-with-significant-observations
---

# Phase 6 Plan-Fixes UAT -- Manual Verification on Plugin 0.8.9

The plan-fixes UAT exercises the plan skill on a "fix the review findings" task, with the prior review-skill UAT's findings written to `compodoc-storybook-angular-signals.review.md` as authoritative source. Tests whether plan skill resolves the contested fn() spy question via WebSearch, whether pv-* discipline holds when input is review output, and whether downstream artifacts preserve verification anchors.

## Workflow phase compliance

| Phase | SKILL.md expectation | Observed | Verdict |
|---|---|---|---|
| 1. Orient | Read scope, verify load-bearing claims, web-first on Class-2 vendor-API questions | 3 Reads (stories.ts, .gitignore offset, component.ts); ZERO WebSearch / WebFetch despite contested vendor-API question; review file content available via @-resolution | PARTIAL -- see Observation A |
| 2. Consult | Single advisor call with Proposal template | One Agent call to `lz-advisor:advisor`; 4595-char prompt; advisor `tool_uses: 0`, `total_tokens: 19535`, `duration_ms: 8318`; 5 numbered points + Critical block | PASS structurally |
| 3. Output | Render Strategic Direction with `--- Strategic Direction ---` markers; write plan; emit confirmation last | All three steps in correct order; markers exact; advisor numbering preserved; "Plan written to..." confirmation after the markers; plan committed at user direction (`2173e39`) | PASS |

## Empirical metrics

| Metric | Value | Note |
|---|---|---|
| Total Agent calls | 1 | Spec-compliant |
| Advisor `tool_uses` | 0 | Spec-compliant |
| Advisor word budget | ~115w numbered + ~50w Critical | Slightly over 100w cap on numbered points; Critical excluded |
| Executor tool calls | 7 (Read 3, Bash 2, Agent 1, Write 1) | |
| **WebSearch + WebFetch** | **0** | Pattern D did NOT fire (Observation A) |
| pv-* XML blocks in consultation | 0 | "Pre-verified Claims" section uses plain bullets, not canonical block format (Observation B) |
| pv-* XML blocks in plan output | 0 | Downstream execute-skill has no anchor (Observation C) |

## Observations

### A. NEW Phase 6 gap: Pattern D suppressed by review-file authoritative-source treatment

**What the executor did:** read three project files (stories.ts, .gitignore offset, component.ts), parsed the @-resolved review file as authoritative source via `<context_trust_contract>`, and packaged the consultation without invoking WebSearch / WebFetch. The contested fn() spy question is a textbook Class-2 (API currency) question about `@storybook/angular@10.3.5` signal-output behavior; Pattern D's worked example explicitly covers this shape.

**Why Pattern D didn't fire:** the review file's content is structurally similar to authoritative source material -- numbered findings, code blocks, recommendation paragraphs. The `<context_trust_contract>` does not currently distinguish between vendor-doc-derived authoritative source and **agent-generated source** (review output, prior plans, prior consultations). The executor treated the review file's recommendations as ground truth and skipped the WebSearch step that would normally resolve the contested empirical question.

**Critical detail:** the review file explicitly says **"Verify Storybook Angular version behavior before acting."** This is a verify-first caveat. The executor read the caveat and ignored it, packaging the recommendation as if verified. Authoritative-source treatment overrode the literal "verify before acting" instruction inside the source.

**Failure surface:** any future "fix the review findings" workflow on a contested empirical question will inherit the same loop -- review claims propagate forward, the verify-first caveat is dropped, the plan skill's web-first orient never fires.

### B. Phase 7 Finding B sharpened (B.2 new sub-issue): executor confabulates content under "Pre-verified Claims" header

**The "Pre-verified Claims" section in the consultation prompt (event 38, lines 126-131) contains four bullets**, paired with their actual review-file provenance:

| # | Bullet text | Source |
|---|---|---|
| 1 | "`fn` is importable from `storybook/test` (the file already imports `expect` and `userEvent` from `storybook/test`)." | Inferred; not in review file. No empirical check (e.g., `rg "from 'storybook/test'"` against installed package). |
| 2 | "`toBeInTheDocument()` is from `@testing-library/jest-dom` matchers, which are loaded globally in Storybook Angular's test runner." | Not in review file. Assertion without evidence. |
| 3 | "Angular's `output()` returns `OutputEmitterRef` ... reassignment by Storybook's argType action wiring would fail or no-op." | Paraphrased from review file's Finding 2 -- which was itself flagged "Verify Storybook Angular version behavior before acting." |
| 4 | "**`haiku` import already present in stories file** -- no new imports needed for `userEvent` or `expect`; only `fn` needs to be added to the import." | **HALLUCINATION.** The stories file (event 31) imports `expect, userEvent` from `storybook/test`. There is no `haiku` import. |

**Three issues compound here:**

1. None use the canonical `<pre_verified source="..." claim_id="..."><claim>...</claim><evidence method="...">...</evidence></pre_verified>` XML format required by `references/context-packaging.md` Common Contract Rule 5.
2. The executor promoted content explicitly flagged "Verify before acting" into a "Pre-verified Claims" header without doing any verification work.
3. Bullet 4 is a confabulated import -- the executor invented a non-existent symbol and packaged it as pre-verified fact.

**Distinguishing B.1 from B.2:**

- **B.1 (original Finding B):** pv-* XML blocks not carried forward across consultations within and across skills. Confirmed in this UAT (zero pv-* in consultation prompt, zero in plan output).
- **B.2 (NEW):** Executor MUST NOT promote unverified content into a "Pre-verified Claims" header. The header itself is a load-bearing trust signal in the advisor's Context Trust Contract; mislabeling unverified content as "pre-verified" is the most direct way to launder confidence.

### C. NEW finding: 4-hop confidence-laundering chain across review -> exec -> advisor -> plan

The unverified-claim chain across this UAT and the prior review-skill UAT:

| Hop | Source | Framing | Confidence level |
|---|---|---|---|
| 1 | Review-skill reviewer (event 56 of session `5dbcc147-...`) | "Assuming Storybook 8.x with `@storybook/angular` (unverified), do confirm signal-output action wiring..." | Hedge: "(unverified)" |
| 2 | User-written review file (`compodoc-storybook-angular-signals.review.md`) | "Verify Storybook Angular version behavior before acting." | Hedge: "Verify before acting" |
| 3 | Plan-skill executor's "Pre-verified Claims" section (event 38 of session `26868ae7-...`) | OutputEmitterRef behavior asserted without "verify" caveat; mislabeled "Pre-verified" | Hedge stripped |
| 4 | Plan-skill advisor's Critical block (event 39) | "**which Finding 2 establishes** is broken for `OutputEmitterRef`" | Cited as established fact |
| 5 | Plan output PLAN.md (event 42, committed `2173e39`) | "the canonical Storybook 8+ pattern" -- new version qualifier introduced; testbed runs Storybook 10.3.5 | Confident assertion in durable artifact |

Each hop strips a hedge or adds a confidence layer. By hop 5, an originally-flagged unverified claim has been laundered into a "canonical" pattern in a committed plan file. **Five agents/artifacts, zero empirical verification.**

The advisor specifically introduced "Storybook 8+" -- a version qualifier present in **none** of the upstream sources. This is a training-data injection on a question where the testbed runs 10.3.5. The new version qualifier is not just unverified; it is positively wrong (or at least inapplicable to the installed version).

**Cross-cutting pattern:** Pattern D's web-first orient is specifically designed to break this chain by forcing empirical verification on Class-2 questions. When Pattern D is suppressed by review-file authoritative-source treatment (Observation A), the chain runs end-to-end without a verification anchor.

## Phase 6 / Phase 7 classification

- **NEW Phase 6 gap (Observation A):** `<context_trust_contract>` should explicitly distinguish vendor-doc authoritative source from agent-generated authoritative source. Web-first must fire on Class-2 vendor-API questions even when the user prompt contains a review-output-shaped block, AND when the agent-generated source itself flags content as "verify before acting".
- **Phase 7 Finding B sharpened (Observation B):** add B.2 sub-issue (executor must not promote unverified content into "Pre-verified Claims" header).
- **NEW Phase 7 candidate (Observation C):** confidence-laundering propagation chain across review -> exec -> advisor -> plan. Closely related to Findings A and B but worth its own write-up; the fix surface spans multiple skill boundaries.
- **Phase 7 Finding A status:** not testable yet (executor hasn't run). The execute-fixes UAT will exercise it.

## Phase 6 verdict for plan-fixes UAT

**PASS** mechanically (workflow phases ran, plan committed `2173e39`, output shape Phase-3-compliant), with significant observations: one new Phase 6 gap (Pattern D suppression on review-output input), one Phase 7 Finding sharpened (B.2 sub-issue on Pre-verified Claims confabulation), and one new Phase 7 candidate (4-hop confidence-laundering chain).

The plan output is shippable for the execute-fixes UAT iteration -- the contested fn() spy recommendation is documented and committed, and the execute-fixes UAT will test whether the executor catches the unanchored "Storybook 8+" reference and the broader chain-of-custody gap during its own orient + final-consult phases.
