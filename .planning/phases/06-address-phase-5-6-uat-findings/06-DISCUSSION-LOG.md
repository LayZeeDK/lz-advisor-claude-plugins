# Phase 6: Address Phase 5.6 UAT Findings - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in 06-CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-28
**Phase:** 06-address-phase-5-6-uat-findings
**Areas discussed:** Pattern D taxonomy, SKILL.md surface scope, Validation cost gate, KCB-economics treatment, Enforcement mechanism, Pattern D phrasing
**Mode:** discuss --analyze (interactive, with trade-off analysis preceding each question)

---

## Gray Area Selection

| Option | Description | Selected |
|--------|-------------|----------|
| Pattern D taxonomy | Question-class granularity (4-class proposed in roadmap vs 2-class binary vs other) and the spirit-vs-letter call on `.d.ts` reads for type-symbol existence | ✓ |
| SKILL.md surface scope | Whether Pattern D ships byte-identical across all 4 SKILL.md or only where orient phase is load-bearing | ✓ |
| Validation cost gate | How much to spend re-validating Phase 6 given Phase 5.6 just ran a 6-session UAT replay | ✓ |
| KCB-economics treatment | Pattern D shifts behavior; explicit taxonomy update; or both | ✓ |

**User's choice:** All four areas selected.

---

## Pattern D taxonomy

| Option | Description | Selected |
|--------|-------------|----------|
| A. 4-class, spirit-honoring (Recommended) | type-symbol existence (.d.ts first); API currency / configuration / recommended pattern (WebFetch first); migration / deprecation (WebFetch on release notes / migration guides first); language semantics (empirical compile/run OR WebFetch language spec). Matches roadmap proposal. | ✓ |
| B. 4-class, letter-tightening | Same 4 classes but .d.ts deprioritized everywhere; WebFetch first for type-symbol existence too. | |
| C. 2-class binary | Existence (locally verifiable, .d.ts allowed) vs currency / recommended (web-authoritative). Loses migration / deprecation distinction. | |
| D. 3-class (migration folded into currency) | Compromise: type-symbol existence; recommended-pattern / currency / migration combined; language semantics. | |

**User's choice:** A. 4-class, spirit-honoring.
**Notes:** "Consider whether any instructions can be shared by one or more skills through shared reference files in the plugin." — folded into the next gray area (SKILL.md surface scope) and resolved via D-02.

---

## SKILL.md surface scope

| Option | Description | Selected |
|--------|-------------|----------|
| A. Shared reference + @-load from 4 SKILL.md (Recommended) | New `references/orient-exploration.md` containing Pattern D. 4 SKILL.md gain a one-line @-load. context-packaging.md Rule 5 mirrors via cross-reference. Smallest diff; lowest drift risk; matches existing references/* pattern. | ✓ |
| B. Inline byte-identical in all 4 SKILL.md | Plan 06/07 canon continued. Largest diff (~750w). 4x duplication. | |
| C. Plan + execute SKILL.md only | Pattern D inline in 2 SKILL.md (orient-phase load-bearing). | |
| D. Retroactive: extract Pattern A + B + D all to shared reference | Cleanest end-state but retroactively undoes Phase 5.6's settled inline canon. Out of Phase 6 scope. | |

**User's choice:** A. Shared reference + @-load from 4 SKILL.md.
**Notes:** Resolves the "consider shared reference files" annotation from the prior question. Pattern D is the only new content; Patterns A / B stay inline (no retroactive churn).

---

## Validation cost gate

| Option | Description | Selected |
|--------|-------------|----------|
| C. Smoke + 2-3 curated sessions (Recommended) | All existing smoke tests plus 2-3 Phase 5.6 prompts that exercised the gaps. ~$5-6 total. Highest signal-per-dollar. | |
| A. Smoke only | DEF + KCB + HIA + J smoke tests only. ~$3. Misses Pattern D's actual effect. | |
| B. Smoke + synthetic Pattern-D fixture | New KCB-style synthetic prompt. ~$4-5. Synthetic-prompt artifact issues. | |
| D. Full 6-session UAT replay | Phase 5.6 Plan 07 pattern under plugin 0.8.5. ~$8-10. Most rigorous. | ✓ |

**User's choice:** D. Full 6-session UAT replay.
**Notes:** User explicitly chose maximum coverage over the recommendation. Phase 5.6 Plan 07 found 2 gaps despite the broader UAT passing — the full UAT has demonstrated discovery value. Cost is acceptable.

---

## Enforcement mechanism (folded in after KCB-economics question)

User interjected during KCB-economics analysis with the directive: **"We must see WebSearch+WebFetch usage"**. This resolved KCB-economics treatment directly (don't loosen assertions; ensure Pattern D + UAT actually produce web-tool usage so Finding K passes) and surfaced a follow-up gray area on enforcement.

| Option | Description | Selected |
|--------|-------------|----------|
| C. Imperative phrasing + validation gate (Recommended) | Pattern D uses imperative phrasing (WebFetch REQUIRED; .d.ts is corroborating evidence only). UAT replay adds per-skill web-usage gate. Belt-and-suspenders. | |
| A. Imperative phrasing only | Pattern D ranking becomes imperative. No validation gate change. | |
| B. Validation gate only | Pattern D stays soft ranking; UAT gate empirically enforces. | |
| D. Revisit spirit-honoring; switch to letter-tightening | Re-open Pattern D taxonomy decision. | |

**User's choice (free text):** "Shape the Compodoc Storybook UAT using prompts that are expected to use WebSearch+WebFetch"
**Notes:** User declined all four pre-defined options and proposed a different enforcement mechanism: reshape the existing UAT prompts so they unambiguously hit Pattern D's web-first classes by construction. Pattern D's classification mechanism is tested on prompts where the right answer is unambiguous, rather than over-tightening Pattern D's phrasing or adding gate logic.

---

## Replace, supplement, or reshape UAT prompts

Plain-text follow-up to the user's free-text enforcement mechanism choice:

| Option | Description | Selected |
|--------|-------------|----------|
| (a) Reshape existing 6 prompts in place | Keep the Compodoc/Storybook scenario; rewrite question framing to hit web-first classes. | ✓ |
| (b) Author a new 6-session fixture | Different scenario, designed from scratch for Pattern D classification coverage. | |
| (c) Supplement | Phase 5.4 6 prompts as regression baseline + 2-3 new web-first sessions. | |

**User's choice:** (a) Reshape in place.
**Notes:** Preserves the 5-phase regression-coverage scenario (Compodoc + Storybook + Nx Angular library) while letting Phase 6 measure Pattern D's specific behavior empirically.

---

## Pattern D phrasing — research-backed

User's directive on phrasing: "Since skills are expected to run on Sonnet with medium/high effort, research what works best for Sonnet 4.6 in Claude docs, Anthropic blogs, web search, community blog posts, and industry papers."

A general-purpose research subagent was dispatched with the question: should Pattern D ship with imperative phrasing ("WebFetch is REQUIRED..."), descriptive ranking ("WebFetch ranked first..."), or some other shape?

**Research findings (cited inline; full sources in 06-CONTEXT.md `<canonical_refs>` and `<research_directives>`):**

1. Anthropic's official "Prompting best practices" (single canonical 4.x doc) recommends explicit trigger conditions and concrete when/how guidance for tool-use steering. Quote: "if you find that the model is not using your web search tools, clearly describe why and how it should."
2. The Claude 4.x family interprets prompts more literally than 3.x; soft rankings get under-weighted (the Pattern B failure mode), but imperatives risk satisfying-the-rule spurious tool use.
3. Anthropic's own production system prompt for Claude 4 family uses descriptive triggers for steering and reserves ALL-CAPS imperatives ("MUST", "NEVER", "CRITICAL") for compliance rules (copyright). Source: Simon Willison's leaked-system-prompt analysis.
4. Positive instruction outperforms negative.
5. Examples beat both rankings and imperatives for tool selection — Anthropic's "Writing effective tools for AI agents" recommends clear when/why descriptions + few-shot examples over directive force.

**Recommendation accepted:** ship Pattern D as concrete classification + explicit triggers + 1-2 worked examples per class + single positive directive. NOT MUST/REQUIRED imperatives. NOT soft rankings alone (Pattern B already proved that insufficient).

---

## Claude's Discretion

- Exact word-budget per Pattern D class block in `references/orient-exploration.md`
- Exact wording of trigger conditions and 1-2 worked examples per class
- Exact reshaped text for each S1..S6 prompt
- Smoke-test letter naming for any new web-usage assertion
- UAT trace web-usage gate threshold (default `>= 1 web tool call in >= 4 of 6 sessions`)
- Whether to extend `tally.mjs` with a `web_uses` metric column
- Whether `references/orient-exploration.md` includes a fifth catch-all class
- Whether `references/context-packaging.md` Rule 5 cross-reference is one-liner or paragraph mirror
- Commit granularity (one commit per plan vs finer)

---

## Deferred Ideas

- Pattern D as a `claude -p` linter / pre-flight check (out of Phase 6 scope)
- Fifth catch-all class in Pattern D (defer unless reshaped prompts reveal misfits)
- Per-class smoke-test assertions (defer unless aggregate web-usage gate proves insufficient)
- Retroactive extraction of Pattern A + B to shared reference (defer to a future polish phase)
- README "Recommended prompt shape" section (deferred from Phase 5.5 / 5.6)
- KCB-economics.sh extension for `.d.ts` reads as Pre-Verified Claim source (D-05 chose not to loosen)
- Plugin README update for Pattern D (out of Phase 6 scope)
- `maxTurns` cap removal or SendMessage-based bidirectional advisor (architectural; defer)
- Pro / Free plan tier UAT cross-tier verification (structurally impossible from Team subscription)
