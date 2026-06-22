# Architectural-parity write-up: built-in `/deep-research` vs `lz-deep-research`

> ARCHITECTURAL-parity track (Phase 22, D-02 track 1; requirement PAR-07). This is
> the documented complement to the MEASURED-parity track (Plans 22-04 / 22-05). It
> requires NO model runs and NO eval data -- it is prose grounded in published
> sources plus the shipped lz schema.

## docs-grounded disclaimer (read first)

Every statement in this document about Claude Code's built-in `/deep-research`
workflow is **docs-grounded**: it is inferred ONLY from Anthropic's published
documentation and engineering posts, never from source. The built-in
`/deep-research` source is **closed** -- it ships inside the Claude Code CLI
binary and was verified ABSENT from all public Anthropic repositories
(`anthropics/claude-code`, `anthropics/claude-plugins-official`, and
`anthropics/skills`, all updated to latest main on 2026-06-22; the claude-code
CHANGELOG reaches v2.1.185) per Phase-22 decision D-15. Because the source is
unavailable, the built-in side is a docs-grounded reconstruction, NOT a
source-verified account. Where this document describes built-in behavior, treat
it as "what the public docs support" and nothing more; it deliberately does NOT
overclaim mechanism, parameters, or internals beyond the published text. Each
built-in claim below is explicitly marked docs-grounded at its point of use.

The lz-deep-research side, by contrast, is sourced from the SHIPPED design in
this repository (`plugins/lz-advisor/references/lz-deep-research-schema.md` and
`plugins/lz-advisor/skills/lz-deep-research/SKILL.md`), which is open and
authoritative. The contrast below is therefore asymmetric by necessity:
docs-grounded inference on one side, shipped-source citation on the other.

## Sources

### Built-in `/deep-research` (closed source; docs-grounded)

- https://code.claude.com/docs/en/workflows -- `/deep-research` is a bundled
  dynamic workflow (Claude Code v2.1.154+); per the published docs it votes on
  claims, runs adversarial cross-review, and drops non-surviving claims; it runs
  under `claude -p` ("run starts immediately", no mid-run input). (docs-grounded)
- https://www.anthropic.com/engineering/built-multi-agent-research-system -- the
  older orchestrator + CitationAgent + LLM-judge pattern; the architectural
  precedent for the built-in (lead agent decomposes, subagents fetch in parallel,
  a citation pass attaches sources, an LLM judge grades the end state).
  (docs-grounded context)
- https://www.anthropic.com/engineering/multi-agent-research-system -- the
  multi-agent research methodology and the holistic LLM-as-judge eval (five
  rubric dimensions, 0.0-1.0 with a pass/fail, end-state grading, human
  calibration). (docs-grounded)

### Anthropic eval philosophy (methodological basis -- D-01)

- https://www.anthropic.com/engineering/multi-agent-research-system -- the
  five-dimension holistic rubric and the argument that a multi-agent research
  system is evaluated at the SYSTEM level on end-state quality, not by gating a
  single component's error rate.
- https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents --
  dimension-isolated judging, partial credit on atomic sub-claims, pairwise
  grading, and the "Unknown" escape hatch (Unknown is not a pass).

### lz-deep-research (shipped, open, authoritative)

- `plugins/lz-advisor/references/lz-deep-research-schema.md` -- the frozen data
  contract: the confidence enum, the tally rubric (downgrade-not-delete), the
  two structurally separate assurances, the canonical-URL source-independence key.
- `plugins/lz-advisor/skills/lz-deep-research/SKILL.md` -- the orchestrator: the
  verify wave, the two Opus advisor gates, the disconfirming-angle decomposition,
  and the first-class Contested / Unsupported report section.

## The substantive contrast: collapse uncertainty vs preserve uncertainty

The two systems share a surface architecture -- decompose a question, fetch
sources in parallel, extract claims, verify the key claims adversarially, and
synthesize a cited report. They diverge on the SINGLE decision that matters most
for research correctness: **what happens to a claim that does not cleanly
survive verification.**

- The built-in **collapses** uncertainty. It votes on claims and adversarially
  cross-reviews them, then **deletes the non-surviving claims** and presents the
  surviving set as settled. (docs-grounded)
- lz-deep-research **preserves** uncertainty as a first-class output signal. It
  NEVER deletes a claim on the strength of a vote; a contested or weakly
  supported claim is **downgraded and surfaced**, with the disagreement carried
  through to the report.

This is not a feature-list difference. It is a difference in what the report's
silence MEANS. Under a collapse design, a claim's ABSENCE from the report is
ambiguous: the claim might never have been found, or it might have been found,
contested, and then deleted -- the reader cannot tell which. Under a preserve
design, a contested claim is present in the report WITH its dissent attached, so
the reader sees the disagreement rather than inheriting a silently-resolved
verdict. Collapse optimizes for a clean, confident-looking surviving set;
preserve optimizes for an honest, calibrated map of what is known, contested, and
unsupported.

## The built-in `/deep-research` design (docs-grounded)

The following is the docs-grounded reconstruction. It rests on the published
dynamic-workflows documentation and Anthropic's multi-agent research engineering
posts; it is NOT source-verified.

- **Decompose and fan out.** (docs-grounded) Following the multi-agent research
  pattern, a lead/orchestrator agent decomposes the question and dispatches
  parallel subagents that search and fetch sources. The
  built-multi-agent-research-system post describes this orchestrator-plus-subagent
  shape with a dedicated citation pass.
- **Vote on claims.** (docs-grounded) Per the dynamic-workflows docs, the
  built-in `/deep-research` votes on claims -- a verification step that adjudicates
  whether a candidate claim holds.
- **Adversarial cross-review.** (docs-grounded) The docs describe adversarial
  cross-review of the claims, i.e. claims are challenged rather than accepted on
  first extraction.
- **Drop the non-survivors -> collapse uncertainty.** (docs-grounded) The
  decisive documented behavior: claims that do not survive the vote and
  cross-review are **dropped**, and the surviving set is presented as the result.
  The consequence -- and the load-bearing point of this whole contrast -- is that
  uncertainty is COLLAPSED at synthesis time: a dropped claim leaves no trace, so
  the report cannot distinguish "not found" from "found and rejected", and a
  claim that was genuinely contested is not surfaced AS contested; it is simply
  gone.
- **End-state, LLM-judged quality.** (docs-grounded) The system is evaluated
  holistically on the end-state report against a multi-dimension rubric (see the
  eval-philosophy section), not by certifying a per-component error rate.

What the docs do NOT support, and what this document therefore does NOT claim:
the exact vote tally thresholds, the number of cross-review rounds, the model
tiers used internally, or any internal data shape. Those are closed-source
internals; asserting them would be an overclaim.

## The lz-deep-research design (shipped, source-grounded)

lz-deep-research is the advisor strategy applied to research: Sonnet-default
worker waves (search / extract / verify) plus a deterministic off-model
aggregator, with the Opus advisor reused at exactly two read-only gates (scope,
synthesis). The verification design is built around PRESERVING uncertainty, and
every mechanism below is grounded in the shipped schema or SKILL.md.

- **Contested and Unsupported are first-class confidence tiers.** The single
  confidence enum is `High | Medium | Low | Contested | Unsupported`
  (lz-deep-research-schema.md, "The confidence enum"). `Contested` is first-class
  (PIPE-08): the deterministic tally emits it on any per-claim voter split (>= 1
  `unrefuted` AND >= 1 `refuted`), and the synthesis stage MAY additionally
  promote a cross-source contradiction to the SAME `Contested` value. The report
  carries a dedicated first-class Contested and Unsupported section
  (SKILL.md, Phase 6) that shows the dissent rather than hiding it.
- **downgrade-not-delete: the tally NEVER removes a claim.** The tally rubric
  (lz-deep-research-schema.md, "The tally rubric") maps every readable tally to a
  confidence tier and NEVER deletes a claim. A unanimous refutation (0 unrefuted /
  N refuted) returns `Low` -- downgraded and SURFACED, never deleted. The branch
  order is load-bearing: the `Contested` split branch precedes the `Medium`
  branch precisely so a 2-unrefuted / 1-refuted tally cannot silently erase its
  own dissent. This is the exact inverse of the built-in's documented drop: where
  the built-in deletes a non-survivor, lz downgrades it and keeps it visible. The
  ONLY removal path in the entire pipeline is the upstream quote-recheck
  `dropped` record (a fabricated quote absent from every stored excerpt) -- a
  mechanical fidelity check, not a verification verdict.
- **Non-unanimity routes to human abstention.** When the scope is underspecified
  the skill records explicit `Assuming <X> (unverified)` frames rather than
  silently guessing (SKILL.md, Phase 0); and the preserved Contested / Unsupported
  tiers hand a non-unanimous outcome BACK to the human as a surfaced disagreement
  to adjudicate, instead of the system resolving it by deletion. The contested
  split is also the deterministic re-vote escalation signal (`escalate`, computed
  off-model, never by model discretion).
- **Disconfirming search (VERIF-02).** Decomposition deliberately includes at
  least one disconfirming angle that searches the NEGATION of the likely answer
  (SKILL.md, Phase 1), and the verify-voter envelope reserves a
  `disconfirming_query` field for the per-seat disconfirming search
  (lz-deep-research-schema.md, "Reserved voter envelope"). Verification actively
  hunts for refutation rather than only confirming.
- **Source-independence weighting (VERIF-03).** Corroboration is a distinct-source
  lower bound (`corroboration_lower_bound`), computed over a Set of CANONICAL
  source keys so that N syndicated copies of one source count as ONE
  (lz-deep-research-schema.md, "The source record" canonical-URL key rule, and the
  corroboration caveat). Confidence is weighted by source INDEPENDENCE, not by raw
  citation count, so a claim echoed across mirror sites is not laundered into
  false corroboration.
- **The two assurances are never conflated (VERIF-06).** A reported claim carries
  TWO structurally separate verification assurances that answer different
  questions and have different owners (lz-deep-research-schema.md, "The two
  assurances"): `quote_fidelity` (`verified | downgraded`) is the MECHANICAL,
  off-model check of whether the quote is a verbatim match against its cited
  stored excerpt, owned by the aggregator; `claim_support`
  (`supported | partial | unsupported | unassessed`) is the JUDGMENT of whether
  the quoted text actually entails the claim, owned by the voter / synthesis.
  `claim_support` is NEVER derived from or collapsed into `quote_fidelity` -- a
  quote can be a perfect verbatim match and still fail to support the claim.
  Collapsing the two would let a verbatim match launder an unsupported claim into
  looking verified, which is exactly the conflation VERIF-06 exists to prevent.

## Methodological basis: Anthropic's holistic-eval philosophy (D-01)

This whole architectural-parity track, and the Phase-22 reframe it belongs to,
rest on Anthropic's published holistic-eval philosophy. Anthropic's engineering
posts argue that a multi-agent research system is evaluated at the SYSTEM level on
end-state report quality against a multi-dimension rubric -- factual /
groundedness accuracy, citation accuracy, completeness / coverage, source quality,
and tool / process efficiency, each scored 0.0-1.0 with a pass/fail and an
"Unknown" escape hatch, with dimension-isolated judging and partial credit on
atomic sub-claims
(https://www.anthropic.com/engineering/multi-agent-research-system;
https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents). It is
NOT a per-component statistical certification of an internal error rate.

That philosophy is the methodological justification for trusting the multi-agent
ARCHITECTURE as the correctness mechanism rather than gating it on a component
error rate (D-01). It applies symmetrically here: the built-in is a holistically
judged multi-agent system, and lz-deep-research is judged the same way in the
MEASURED-parity track. The architectural contrast in this document explains WHY a
holistic verdict is the right instrument -- because the two systems make a
different, system-level design choice about uncertainty that only an end-state,
whole-report evaluation can see. A component-level error-rate gate would miss it
entirely: it would never observe that one system's report SILENTLY drops its
contested claims while the other's report SURFACES them.

## Summary

| Axis | Built-in `/deep-research` (docs-grounded) | lz-deep-research (shipped) |
|------|-------------------------------------------|----------------------------|
| Verification | votes on claims + adversarial cross-review | Sonnet voter seats + deterministic tally + disconfirming search |
| Non-survivor handling | DROPS / deletes the claim | downgrade-not-delete: downgraded and surfaced |
| Uncertainty | COLLAPSED (surviving set presented as settled) | PRESERVED (Contested / Unsupported first-class) |
| Non-unanimity | resolved by deletion (docs-grounded) | routed to human abstention; surfaced as dissent |
| Corroboration | not documented at this granularity | source-INDEPENDENCE lower bound, canonical-key deduped |
| Quote vs claim | not documented at this granularity | two never-conflated assurances (quote_fidelity vs claim_support) |
| Source availability | CLOSED (docs-grounded inference only) | OPEN (schema + SKILL.md authoritative) |
| Eval basis (D-01) | holistic end-state LLM-judge | holistic end-state LLM-judge (same instrument) |

The defensible architectural claim is narrow and honest: on the docs-grounded
account, the built-in `/deep-research` collapses uncertainty by deleting
non-surviving claims, while lz-deep-research preserves uncertainty as a
first-class, surfaced signal. Both are holistically eval-able multi-agent
research systems per Anthropic's own eval philosophy (D-01); the MEASURED-parity
track grades them against that shared rubric.
