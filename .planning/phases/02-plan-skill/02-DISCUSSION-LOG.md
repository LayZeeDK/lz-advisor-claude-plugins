# Phase 2: Plan Skill - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md -- this log preserves the alternatives considered.

**Date:** 2026-04-11
**Phase:** 02-plan-skill
**Mode:** discuss (--analyze)
**Areas discussed:** Plan artifact delivery, Advisor consultation count, Conciseness calibration, Plan detail level

---

## Plan Artifact Delivery

| Option | Description | Selected |
|--------|-------------|----------|
| Write to file | Durable markdown file, consumable by /lz-advisor.execute (IMPL-05), user can review/edit | [OK] |
| Display inline only | Show in conversation, zero file overhead, lost on session end | |
| Both -- file + summary | Write full plan to file AND display condensed summary inline | |

**User's choice:** Write to file (Recommended)
**Notes:** Aligns with IMPL-05 (execute skill accepts optional plan input) and advisor-timing.md emphasis on durable deliverables.

---

## Advisor Consultation Count

| Option | Description | Selected |
|--------|-------------|----------|
| Two calls | Direction before planning + validation of finished plan | |
| One call (direction only) | Lowest cost, advisor provides direction, executor plans unsupervised | [OK] |
| Conditional second call | Executor self-evaluates, calls advisor only if uncertain | |

**User's choice:** One call (direction only) -- after deep source analysis
**Notes:** User asked for ultrathink analysis grounded in all sources. Deep analysis showed one call is most aligned with: (1) Anthropic docs ("first call adds most value", final call for "file writes and test outputs" -- plan has neither), (2) blog (advisor returns "a plan" -- that IS the deliverable), (3) ARCHITECTURE.md (one-consult flow diagram), (4) plugin cost model (strategic consultations, not redundant validation), (5) workflow design (user reviews plan -- human quality gate, second Opus call reserved for execute skill Phase 3).

---

## Conciseness Calibration

| Option | Description | Selected |
|--------|-------------|----------|
| Scoped framing + measure | Skill scopes the question naturally; measure with real invocations; tune in Phase 5 if needed | [OK] |
| Strengthen agent prompt now | Add explicit word-count enforcement to advisor.md before testing | |
| Measure only, no changes | Follow ROADMAP.md literally, defer all tuning | |

**User's choice:** Scoped framing + measure (Recommended)
**Notes:** Root cause of Phase 1 UAT verbosity was broad open-ended manual invocation, not the conciseness instruction itself. Anthropic's instruction was validated with scoped interactions. Plan skill naturally constrains via packaged findings + specific ask.

---

## Plan Detail Level

| Option | Description | Selected |
|--------|-------------|----------|
| /plan parity + Opus strategy | Same granularity as /plan (steps, file paths, changes) enriched with Opus strategic direction | [OK] |
| Opus strategic outline only | Terse 5-10 bullet points, leaves specifics to executor | |
| Full implementation guide | Detailed steps with code patterns, function signatures, test expectations | |

**User's choice:** /plan parity + Opus strategy (Recommended)
**Notes:** User raised two reframing considerations: (1) Sonnet 4.6 prompt engineering patterns -- literal instruction following means plan format is fully controlled by skill prompt, and (2) /plan output as reference point -- the plan skill's differentiation is strategic quality, not detail level. Analysis showed the value-add is Opus-informed strategy at /plan-equivalent granularity. Preview format: Strategic Direction (from advisor) + Steps (numbered, file paths) + Key Decisions (approach rationale).

---

## Claude's Discretion

- Plan file naming convention and output location
- Orientation instruction specificity (goal-oriented vs prescriptive)
- Internal plan file structure (exact section headings/formatting)
- Skill prompt wording and section ordering

## Deferred Ideas

None -- discussion stayed within phase scope.
