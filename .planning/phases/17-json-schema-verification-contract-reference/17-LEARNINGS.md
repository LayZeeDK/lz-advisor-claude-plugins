---
phase: 17
phase_name: "json-schema-verification-contract-reference"
project: "lz-advisor"
generated: "2026-06-16"
counts:
  decisions: 8
  lessons: 5
  patterns: 5
  surprises: 4
missing_artifacts: ["17-UAT.md"]
---

# Phase 17 Learnings: json-schema-verification-contract-reference

## Decisions

### One canonical confidence enum, identical in code and contract
The confidence field is exactly `High | Medium | Low | Contested | Unsupported` -- one vocabulary, byte-identical in the aggregator code and the reference doc. The spike-inherited `Rejected` label is dropped and the fused `Low/Contested` token is un-fused. No second `report_confidence` field, no mapping table.

**Rationale:** Two vocabularies for one concept IS the drift the user rejected. `Rejected` was an un-deliberated spike artifact preserved verbatim by Phase 16 against Phase 16's own research (16-RESEARCH.md recommended the 4-label set without it), so it earned no deference.
**Source:** 17-CONTEXT.md (D-01), 17-DISCUSSION-LOG.md

### Contested is first-class, emitted by the per-claim tally on a voter split
The deterministic tally() emits `Contested` directly on a per-claim voter split (>=1 unrefuted AND >=1 refuted); Phase-20 synthesis MAY additionally promote cross-source contradictions to the same value -- one enum value, one meaning (Option I over the synthesis-only Option II).

**Rationale:** The durable `survivors.json` is the only artifact a reader sees pre-synthesis; under the synthesis-only Option II a genuine voter split would be mislabeled `Low` there, erasing dissent. The design assigns Contested at the per-claim tally (SESSION-DESIGN.md:93) and keys escalation on "ANY contested claim" (:167), so the enum value IS the VERIF-05 escalation signal.
**Source:** 17-CONTEXT.md (D-03), 17-DISCUSSION-LOG.md

### Downgrade-not-delete: the tally never removes a claim
A unanimous refutation (3/3 refuted, 0 uphold) resolves to `Low` AND the claim stays in survivors. The only claim-removal path is the quote-recheck `dropped` outcome (fabricated/absent quote). `Low` covers both thin support and actively-refuted-without-support.

**Rationale:** Makes "downgrade-not-delete" structural; refutation surfaces the claim at lower confidence rather than silently erasing it (the refuted-as-deletion anti-pattern, PITFALLS.md Pitfall 11).
**Source:** 17-CONTEXT.md (D-03b), 17-01-PLAN.md

### Option I tally branch order: the split test precedes the Medium test
The five ordered branches are: readableSeats===0 -> Unsupported; unrefuted===3 -> High; unrefuted>=1 && refuted>=1 -> Contested; unrefuted===2 -> Medium; otherwise -> Low. The Contested split branch MUST precede the Medium branch.

**Rationale:** A 2-unrefuted/1-refuted split silently returns `Medium` and erases the dissent if the Medium branch evaluates first (Pitfall 2). Branch order is the single CRITICAL invariant of the phase.
**Source:** 17-01-PLAN.md, 17-02-SUMMARY.md

### Two structurally separate, never-conflated assurance fields
Assurance 1 is `quote_fidelity` (verified|downgraded) -- mechanical, aggregator-owned, frozen from Phase 16. Assurance 2 is `claim_support` (supported|partial|unsupported|unassessed) -- judgment, voter/synthesis-owned (Phase 18/20), new. `claim_support` is never derived from `quote_fidelity`.

**Rationale:** A claim can be quote_fidelity: verified yet claim_support: unsupported (the quote is real and correctly attributed but does not entail the claim) -- exactly the conflation VERIF-06 exists to prevent. The doc states this orthogonality with a worked example.
**Source:** 17-CONTEXT.md (D-04, D-05), 17-02-SUMMARY.md

### Freeze-from-corrected-code (D-12 anti-drift), enforced by plan ordering
Plan 17-01 corrects the aggregator GREEN first; Plan 17-02 (depends_on 17-01) then freezes the corrected shapes into the reference doc verbatim with cited function names and line anchors. The aggregator source is authoritative; future shape changes update code + reference in lockstep.

**Rationale:** Freezing before the correction would immortalize the spike vocabulary (Pitfall 1). 17-02 explicitly verifies the precondition (`git grep "Rejected\|Low/Contested"` over the .mjs returns nothing) before starting.
**Source:** 17-CONTEXT.md (D-12), 17-02-PLAN.md, 17-02-SUMMARY.md

### Formal JSON Schema ($schema + ajv) is OUT; fail-closed parsing is the enforcement
No machine-enforced formal schema and no validator library. The aggregator's fail-closed JSON.parse + ContractError + WR-01/02/03 field guards + safeId() path guard ARE the runtime enforcement; the reference doc records this as the reason a formal validator is unnecessary.

**Rationale:** Preserves the zero-dependency ethos of the aggregator; a validator dependency would add no value the existing fail-closed guards do not already provide.
**Source:** 17-CONTEXT.md (deferred), 17-02-PLAN.md, 17-SECURITY.md (T-17-05)

### Frozen core plus reserved additive-only envelope for the vote record
The aggregator-consumed core `{verdict: "unrefuted"|"refuted"}` is frozen hard (missing seat -> insufficient; seats 0-indexed, capped at VOTES_PER_CLAIM by file naming; cluster-id lookup first). Voter-authored companion fields (attack_mode, disconfirming_query, source-independence note) are forward-declared as a reserved additive-only envelope Phase 18 fills.

**Rationale:** The phase goal is that every downstream component agrees on identical shapes BEFORE any agent is authored; freezing only `{verdict}` would re-open the schema in Phase 18 (churn). Phase 18 MAY fill semantics and add fields but MUST NOT change verdict's consumed shape.
**Source:** 17-CONTEXT.md (D-09, D-10), 17-DISCUSSION-LOG.md

---

## Lessons

### A 1-unrefuted/1-refuted Contested fixture is tautological for the branch-ordering invariant
The code review (CR-01, BLOCKER) found the contested-split fixture encoded unrefuted=1/refuted=1, which classifies as Contested regardless of branch order -- a swapped Medium-first rubric would still pass the test. Only a 2-unrefuted/1-refuted tally makes the Medium branch evaluate true and thus discriminates the correct order from the buggy swapped order. The fixture was upgraded in place (cluster0-2.json added) to the discriminating 2/1 case.

**Context:** When a fixture exists to guard an ordering invariant, the fixture inputs must make the earlier-vs-later branches actually compete; pick the one input combination that fails under the bug. (Recurs for Phase 18-20 vote/voter fixtures.)
**Source:** 17-REVIEW.md (CR-01), 17-VERIFICATION.md (Truth 11)

### Co-present acceptance criteria can conflict; assemble forbidden tokens from fragments
Plan 17-01 required the test to assert `r.summary` does NOT include 'Low/Contested', while another acceptance criterion required `git grep "Low/Contested\|Rejected"` over the .test.mjs to return zero hits. A naive negative assertion with the literal string would trip the grep gate. Resolved by assembling the forbidden tokens (`Low` + `/` + `Contested`, `Reje` + `cted`) from string fragments at runtime, so the test checks the real behavior while the source file carries neither literal.

**Context:** When a behavior assertion and a source-hygiene grep gate target the same literal, build the literal at runtime rather than embedding it. The same descriptive-phrasing technique kept the reference doc's zero-hit gate clean ("terminal-delete tier", "fused low-or-contested token").
**Source:** 17-01-SUMMARY.md, 17-02-SUMMARY.md

### claims[].id is declared contract-required but is not fail-closed in code
The schema doc declares claims[].id as Required: yes, but mergeClusters fail-closes only on missing text/quote/source, not id. A missing id coerces to the string 'undefined' (safeId('undefined') passes the basename guard), so the member-fallback vote lookup silently searches for undefined-0.json. Masked at runtime only because the cluster-id lookup is tried first.

**Context:** A doc/code contract mismatch and a latent silent-misbehavior path (WR-01, WARNING). Not goal-blocking and left unaddressed as a quality follow-up; recorded so code and doc are reconciled later.
**Source:** 17-REVIEW.md (WR-01), 17-VERIFICATION.md

### GSD does not auto-invoke the post-completion audits; trigger them explicitly
Phase 17 ran the full post-completion sequence -- verify -> secure -> validate -> extract-learnings -- as explicit steps. SECURITY.md did not exist before the secure-phase run and was created by it; VALIDATION.md existed at plan-time draft state with all rows pending and both nyquist flags false.

**Context:** None of secure/validate/extract is wired into execute-phase; the verifier closes the requirements via the 3-source cross-reference, but the audits must be triggered after verification passes.
**Source:** 17-SECURITY.md, 17-VALIDATION.md

### A documentation phase still carries a real (if low) threat surface: ASCII/CRLF and doc-drift
With no network, auth, or untrusted runtime input, the honest threat surface reduced to two things: the Write tool injecting a U+FEFF BOM or CRLF on this Windows host (corrupting the pure-ASCII zero-dep invariant), and the doc documenting a shape WEAKER than the code (propagating drift downstream). Both were mitigated by a pre-commit pure-ASCII scan and verbatim-freeze discipline with cited anchors.

**Context:** Even a markdown-only phase needs the ASCII/CRLF hygiene gate and a byte-for-byte freeze check; the threat register is small but not empty.
**Source:** 17-SECURITY.md (T-17-02, T-17-06, T-17-07), 17-02-PLAN.md

---

## Patterns

### Repo-blind, multi-round cross-model consensus to re-decide a contested gray area
After the user rejected the `--auto`-selected answer, GA-1 was re-decided by three model families (Opus 4.8 / GPT-5.5 / Gemini 3.1 Pro) reasoning only on curated facts (no repo/web access, could ask the executor to verify). Round 1 split 1-2; after the executor supplied verified source facts, Round 2 converged unanimously on Option I.

**When to use:** A high-impact, hard-to-reverse decision the auto-pass got wrong, where supplying verified facts (not opinion) is what moves the models. Reserve for the trap quadrant (high-impact, low-confidence), not routine gray areas.
**Source:** 17-CONTEXT.md, 17-DISCUSSION-LOG.md

### Provenance investigation to strip deference from an inherited artifact
Before correcting the enum, the team traced `Rejected` to its origin (the throwaway spike tally()), confirmed it overrode Phase 16's own research, was never deliberated (Phase 16 discuss was --auto), and contradicted the converged design -- establishing it as an accidental artifact, not a reasoned choice, so a breaking correction was justified.

**When to use:** When deciding whether a "built/committed" value is load-bearing or just carried-forward. Trace where it came from and whether it was ever reasoned; "built" is not evidence it was chosen.
**Source:** 17-DISCUSSION-LOG.md, 17-CONTEXT.md

### Per-tier committed fixture trees differing only in votes/ seat verdicts
Each confidence tier gets one committed fixture tree (claims/w1.json + excerpts/e1.txt + votes/cluster0-<seat>.json) copying the near-duplicate template, isolating the vote-seat combination that maps to that tier. A missing seat file counts as 'insufficient'. The claim quote stays verbatim-present in the excerpt so the claim survives the upstream quote-recheck and reaches tally.

**When to use:** Exercising a deterministic decision function tier-by-tier: hold everything constant except the one input dimension under test (here, the votes/ seats).
**Source:** 17-01-PLAN.md, 17-01-SUMMARY.md

### Prose-contract reference that freezes code verbatim with cited function + line anchors
The fifth references/ file follows the sibling house style (H1 contract title, intent paragraph naming the anti-drift rule + the three downstream consumers, ## sections, fenced JSON shapes, mapping tables, a worked-example section, explicit caveat sections) and copies every field name/enum/rubric branch byte-for-byte from the source, citing exact functions and line anchors so a reader can verify the doc against the code.

**When to use:** Documenting a data contract that downstream components implement against, where the executable source already exists and must remain the single source of truth.
**Source:** 17-02-PLAN.md, 17-02-SUMMARY.md

### Lockstep code+fixture correction as a single dependency-gated wave before the freeze
The corrective code change (Plan 17-01, wave 1) and the contract freeze (Plan 17-02, wave 2, depends_on 17-01) were sequenced so the doc could only ever freeze the corrected shapes. 17-02 re-verified 17-01's GREEN precondition before starting.

**When to use:** Any documentation/freeze task that depends on a code correction landing first; gate the freeze plan on the correction plan and re-verify the precondition at the start of the dependent plan.
**Source:** 17-01-PLAN.md, 17-02-PLAN.md

---

## Surprises

### A documentation phase opened with a BLOCKER from code review
The contract-writing phase's most consequential finding was a test-coverage BLOCKER (CR-01) in the corrective code half, not a doc problem -- the safety net advertised as guarding the single CRITICAL invariant was non-functional because no committed fixture fed the discriminating 2-unrefuted/1-refuted tally.

**Impact:** Required a fixture upgrade (cluster0-2.json added) before verification could pass; resolved and independently re-verified (Truth 11). The test count stayed 19 -- the fixture content was corrected, not the count.
**Source:** 17-REVIEW.md (CR-01), 17-VERIFICATION.md

### The user overturned an --auto decision, escalating GA-1 out of autonomous mode
The phase ran `--auto --analyze --chain`, but the user challenged the auto-resolved two-field (confidence + report_confidence + mapping table) answer as code/contract drift, forcing GA-1 into an interactive human + cross-model re-decision while GA-2..GA-5 stayed auto-resolved.

**Impact:** A single gray area was carved out of the autonomous pass and re-decided by 3-model consensus; auto-advance to plan-phase was held pending user confirmation. Demonstrates the --auto trap quadrant (high-impact, low-confidence) in practice.
**Source:** 17-CONTEXT.md, 17-DISCUSSION-LOG.md

### Round-1 cross-model vote split, then unanimous reversal once facts were supplied
In Round 1 the three models split (Opus II / GPT I / Gemini II). After the executor verified and supplied four source facts (no synthesis code exists yet; no raw vote-count field on the record; Contested is not frozen as cross-source-only; survivors.json is the only pre-synthesis signal), two models changed their vote and all three converged on Option I.

**Impact:** Confirmed that the disagreement was about missing facts, not values; the verified-facts injection (not more argument) produced unanimity.
**Source:** 17-DISCUSSION-LOG.md

### Both plans landed fast with zero deviations despite the contested decision
Plan 17-01 executed in ~8 minutes and 17-02 in ~5 minutes, each with no deviations from the plan and no auto-fix rules invoked -- the heavy lifting (the GA-1 consensus) happened in discuss, so execution was mechanical.

**Impact:** The front-loaded decision work made execution near-trivial; the only execution-time nuance was the fragment-assembly technique for the forbidden-token assertions, which the plan's own co-present acceptance criteria forced rather than a deviation.
**Source:** 17-01-SUMMARY.md, 17-02-SUMMARY.md
