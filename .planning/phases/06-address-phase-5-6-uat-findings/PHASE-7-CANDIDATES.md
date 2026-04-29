---
source: "06 UAT observations (execute-skill, review-skill, plan-fixes, and execute-fixes manual UATs on plugin 0.8.9)"
captured: 2026-04-29
amended: 2026-04-29
type: phase-7-candidates
related_artifacts:
  - .planning/phases/06-address-phase-5-6-uat-findings/uat-execute-skill/session-notes.md
  - .planning/phases/06-address-phase-5-6-uat-findings/uat-review-skill/session-notes.md
  - .planning/phases/06-address-phase-5-6-uat-findings/uat-plan-skill-fixes/session-notes.md
  - .planning/phases/06-address-phase-5-6-uat-findings/uat-execute-skill-fixes/session-notes.md
session_logs:
  - c:/Users/LarsGyrupBrinkNielse/.claude/projects/D--projects-github-LayZeeDK-ngx-smart-components/ff614de1-c25d-4e84-bee9-5de67de4b208.jsonl
  - c:/Users/LarsGyrupBrinkNielse/.claude/projects/D--projects-github-LayZeeDK-ngx-smart-components/5dbcc147-5119-439b-950e-f2bdac619598.jsonl
  - c:/Users/LarsGyrupBrinkNielse/.claude/projects/D--projects-github-LayZeeDK-ngx-smart-components/26868ae7-1f9a-4a71-a146-16e7781b74c6.jsonl
  - c:/Users/LarsGyrupBrinkNielse/.claude/projects/D--projects-github-LayZeeDK-ngx-smart-components/e4592a03-0cf4-4925-af93-fdf20c663a25.jsonl
---

# Phase 7 Candidates -- Advisor Consultation Discipline, Template Carry-Forward, and Confidence-Laundering Guards

Captured during Phase 6 UATs on plugin 0.8.9: execute-skill against the Compodoc + Storybook implementation, review-skill against the resulting commits `09a09d7^..0cb8ae7`, plan-fixes (plan skill called on the review's findings as input), and execute-fixes (execute skill called on the plan-fixes plan as input). All four UATs passed mechanically; together they surface three distinct advisor-consultation-discipline gaps that warrant a dedicated follow-up phase. The execute-fixes UAT extended Finding C's chain from 5 hops (claim in plan file) to 7 hops (claim in committed source code), making C the highest-priority candidate.

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
| **6 (NEW)** | **Execute-fixes consultation prompts (session `e4592a03-...` events 11 + 32)** | Plan SD quoted verbatim into pre-execute prompt's `## Source Material > Plan Strategic Direction` block; final-verification prompt restates the change rationale without re-anchoring | Qualifier propagates into both advisor call sites |
| **7 (NEW)** | **Commit `05ea109` on testbed branch `uat/manual-s4-v089-compodoc`** | Implementation matches the unverified pattern; tests pass empirically (luck or correct API); rationale lives in plan-input chain | **Durable source code with unverified provenance** |

Each hop strips a hedge or adds a confidence layer. By hop 7, an originally-flagged unverified claim has been laundered into committed source code with passing tests. **Seven agents/artifacts, zero empirical verification.**

The advisor specifically introduced "Storybook 8+" -- a version qualifier present in **none** of the upstream sources. This is a training-data injection on a question where the testbed runs `@storybook/angular@10.3.5` (verified `package.json`). The new version qualifier is not just unverified; it is positively wrong if the chain were to migrate to a Storybook version where the API was different (e.g., 7.x or earlier).

**Empirical fact: the implementation works.** Storybook 10.3.5 supports `fn()` in args (the API shape is consistent with Storybook 8+ but was not verified for 10.3.5 in the chain). Tests passing at the play-test layer doesn't validate the API rationale -- only the surface behavior. The chain shipped a correct answer through unverified provenance, which is the most dangerous failure mode: the chain provides positive feedback (tests pass) that the verification skip was harmless, training future executors to skip verification on similar questions.

**Why it matters.** Confidence laundering across skill boundaries is the meta-pattern that Findings A and B together point at. Finding A (silent apply-then-revert) is the executor-side failure mode; Finding B.2 ("Pre-verified Claims" confabulation) is the prompt-construction-side failure mode; Finding C is the chain-of-custody failure mode that makes both A and B more dangerous. Without a propagation guardrail, every additional hop in a multi-skill workflow is a compounding error opportunity. The execute-fixes UAT confirms the chain reaches durable source code; this is the load-bearing reason to prioritize C.

Pattern D's web-first orient is specifically designed to break this chain by forcing empirical verification on Class-2 questions. When Pattern D is suppressed (per the Phase 6 amendments 2 and 3), the chain runs end-to-end without a verification anchor. The execute-fixes UAT showed Pattern D suppression operates at the ToolSearch loading layer (executor never invoked `ToolSearch select:WebSearch,WebFetch`), making the chain harder to break than amendment 2 suggested.

**Proposed direction (C):** Three complementary guards (was two):

- **Hedge propagation rule** (in `references/context-packaging.md` Common Contract): when source material contains a verify-first marker (regex shapes: `\b(unverified)\b`, `\bverify .+ before acting\b`, `\bAssuming .+ \(unverified\)\b`, `\bconfirm .+ before\b`), the executor MUST either: (a) perform the verification step (WebSearch, Read, Bash) and replace the marker with an evidence citation; or (b) carry the marker verbatim into the consultation prompt's `## Source Material` section, forbidden from packaging the same content under `## Pre-verified Claims`.
- **Cross-skill hedge tracking** (in `references/orient-exploration.md`): a workflow-level note that successive skills MUST NOT strip verify-first markers introduced by upstream skills. If upstream review flags content as "verify before acting", downstream plan / execute must either resolve or propagate the hedge.
- **NEW: Version-qualifier anchoring rule** (in `references/context-packaging.md` Common Contract): when an upstream artifact introduces a version qualifier for a vendor library (e.g., "Storybook 8+", "Angular 17+", "TypeScript 5+"), the executor MUST verify the qualifier against the installed version before propagating into the consultation prompt. Mechanism: read the relevant `package.json` (or equivalent dependency manifest) for the actual installed version; either confirm the qualifier matches and synthesize a `pv-version-anchor` block, or strip the qualifier and replace with the empirically observed version. This rule is necessary because version-qualifier injection is the most common training-data bleed pattern observed across the chain.

**Effort (C):** Medium-high. Requires text edits across multiple references docs + a workflow-level smoke test that synthesizes a chain (review -> plan -> execute) on a fixture with a verify-first marker AND a version qualifier and asserts both survive or are empirically resolved. Worth the effort: this is the meta-pattern that makes individual A/B failures dangerous in compound workflows, and the execute-fixes UAT confirmed the chain reaches durable source code -- the highest-stakes failure surface.

---

## Out of scope (deliberate non-candidates)

- **RTK wrapping in `npm run` scripts** (execute-skill UAT events 168-174): user-level wrapper, not a skill defect.
- **Proactive `documentation.json` generation** (execute-skill UAT event 138): positive observation; no action needed.
- **Trivial unused-import correction** (execute-skill UAT events 144 -> 161): correctly handled solo per Phase 3 ("Trivial fixes ... proceed solo").
- **Plan-fixes UAT first-invocation no-args double-tap** (events 6 and 17): user input artifact, not a skill defect.
- **Execute-fixes UAT recovery loop on test runner** (events 20 -> 27): graceful Phase 1 failure recovery (failed `nx run ... test-storybook` -> background Storybook -> 30s wait -> retry); behaves correctly per `references/context-packaging.md` "recover gracefully from tool-use failure". Inflated Bash count (7) but no skill defect.

## Cross-references

- Execute-skill UAT artifact: `.planning/phases/06-address-phase-5-6-uat-findings/uat-execute-skill/session-notes.md`
- Review-skill UAT artifact: `.planning/phases/06-address-phase-5-6-uat-findings/uat-review-skill/session-notes.md`
- Plan-fixes UAT artifact: `.planning/phases/06-address-phase-5-6-uat-findings/uat-plan-skill-fixes/session-notes.md`
- Execute-fixes UAT artifact: `.planning/phases/06-address-phase-5-6-uat-findings/uat-execute-skill-fixes/session-notes.md`
- Phase 6 verification: `.planning/phases/06-address-phase-5-6-uat-findings/06-VERIFICATION.md` (amendment 2026-04-29 PASS-with-caveat; second amendment captures Pattern D / review-file authoritative-source gap; third amendment captures Pattern D / plan-file input + ToolSearch-layer suppression)
- Phase 5.4 candidates (precedent for pv-* template work): `.planning/phases/05.3-resolve-issues-identified-in-field-test-and-take-the-quick-2/PHASE-5.4-CANDIDATES.md` (Findings B, C)
