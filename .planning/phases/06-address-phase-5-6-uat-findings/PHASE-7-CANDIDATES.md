---
source: "06 UAT observations (execute-skill manual UAT on plugin 0.8.9)"
captured: 2026-04-29
type: phase-7-candidates
related_artifact: .planning/phases/06-address-phase-5-6-uat-findings/uat-execute-skill/session-notes.md
session_log: c:/Users/LarsGyrupBrinkNielse/.claude/projects/D--projects-github-LayZeeDK-ngx-smart-components/ff614de1-c25d-4e84-bee9-5de67de4b208.jsonl
---

# Phase 7 Candidates -- Advisor Consultation Discipline and Template Carry-Forward

Captured during the Phase 6 execute-skill UAT on plugin 0.8.9 (manual session against `ngx-smart-components`, plan input `compodoc-storybook-angular-signals.plan.md`, two commits `09a09d7` + `0cb8ae7`). The execute-skill workflow passed end-to-end, but two behavioral / packaging gaps surfaced that do not belong to Phase 6's Pattern D scope.

## Context

Phase 6 closed the Pattern D web-usage gate empirically on plugin 0.8.9 (06-VERIFICATION.md amendment 2026-04-29). The execute-skill UAT verified the executor-advisor loop end-to-end on the same plugin version with a realistic plan as input. Two new behavioral gaps surfaced from the trace:

1. The executor applied an advisor Critical, then silently reverted it inside the same Phase 6 step based on un-verified internal reasoning, with no reconciliation call.
2. The Verification template does not carry forward `<pre_verified>` (pv-*) blocks across consultations; the advisor produced a recommendation that directly contradicted the pre-execute pv-1 anchor.

Both are advisor-consultation-discipline / packaging concerns, orthogonal to Phase 6's question-class-aware orient ranking (Pattern D).

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

---

### B. pv-* blocks not carried forward into Verification template

**Observed (execute-skill UAT, event 188 final-consult prompt):**

The Verification template carried forward "Prior Strategic Direction" verbatim but did NOT carry forward the pre-execute pv-1 block. The advisor's call-2 point 2 ("Replace `(window as any).__STORYBOOK_COMPODOC_JSON__` with `setCompodocJson` from `@storybook/addon-docs/angular`") directly contradicted pv-1, which had been the empirical anchor in call 1.

The executor noticed the contradiction (event 192: "Point 2 contradicts my pre-verified pv-1") and rejected with reasoning. So the bad advice did not ship. But the underlying mechanism is fragile.

**Why it matters.** Across multi-consultation flows (pre-execute -> execute -> final-review, or any future mid-execution re-consult), pv-* blocks are the empirical anchors that protect against advisor drift between calls. Dropping them is exactly the regression mode that the Pre-Verified pattern was designed to prevent. Phase 5.4 Plan C ("context-packaging.md templates lack a Pre-Verified Package Behavior Claims section") added pv-* as a first-class template section. Carrying it forward is the natural completion.

**Proposed direction:** Update `references/context-packaging.md`:

- Verification template: add a `## Prior Pre-Verified Package Behavior Claims` section between `## Prior Strategic Direction` and `## Changes Made`. Executor reproduces all pv-* blocks from the pre-execute consult verbatim. New pv-* blocks introduced during execute (e.g., empirical findings from Phase 3) get appended.
- Proposal template (mid-execution re-consult variant): same -- pv-* blocks carry forward.
- Doc the executor responsibility: when a pv-* block was already supplied to the agent in this skill execution, re-pack it on every subsequent advisor / reviewer / security-reviewer call within the same skill run.

**Effort:** Low. Template-text edit in `references/context-packaging.md` + smoke test fixture that asserts pv-* block presence in the final-consult prompt when one was present in the pre-execute prompt.

---

## Out of scope (deliberate non-candidates)

- **RTK wrapping in `npm run` scripts** (events 168-174): `rtk npm run nx -- run ...` and `rtk npx nx run ...` both failed; executor dropped `rtk` and used plain `npx nx run` to succeed. RTK is a user-level wrapper, not part of the plugin. Not a skill defect.
- **Proactive `documentation.json` generation** (event 138): executor ran `npx compodoc -e json -d ... -p ...` ahead of TS compilation to ensure the JSON import resolves. Positive observation; no action needed.
- **Trivial unused-import correction** (events 144 -> 161): executor added `within` import in the stories file then removed it within 17 seconds. Trivial fix, correctly handled solo per Phase 3 ("Trivial fixes ... proceed solo").

## Cross-references

- Execute-skill UAT artifact: `.planning/phases/06-address-phase-5-6-uat-findings/uat-execute-skill/session-notes.md`
- Phase 6 verification: `.planning/phases/06-address-phase-5-6-uat-findings/06-VERIFICATION.md` (amendment 2026-04-29)
- Phase 5.4 candidates (precedent for pv-* template work): `.planning/phases/05.3-resolve-issues-identified-in-field-test-and-take-the-quick-2/PHASE-5.4-CANDIDATES.md` (Findings B, C)
