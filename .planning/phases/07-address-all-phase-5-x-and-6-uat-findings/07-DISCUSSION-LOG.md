# Phase 7: Address all Phase 5.x and 6 UAT findings - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-04-30
**Phase:** 07-address-all-phase-5-x-and-6-uat-findings
**Areas discussed:** Plan bundling & granularity, Word-budget strategy (D), Reviewer web tools (F), Verify-before-commit (E.1+E.2), Plugin version

---

## Plan bundling & granularity

| Option | Description | Selected |
|--------|-------------|----------|
| Themed plans | 5 themed plans + 1 verification: 07-01 pv-* synthesis discipline (B+H); 07-02 verify-skip discipline (A+E.1+E.2+G+silent-resolve); 07-03 confidence-laundering guards (C); 07-04 word-budget (D); 07-05 reviewer web tools (F); 07-06 smoke + UAT + version + VERIFICATION.md | YES |
| Single unified plan | One "verification chain integrity" plan touching all 3 agents + 4 SKILL.md + references atomically | |
| Per-finding plans | 8-10 plans, one per finding | |
| Themed but smaller bundles | Split Plan 07-02 (verify-skip) into A alone vs E+G paired | |

**User's choice:** Themed plans
**Notes:** Empirically anchored — 13-UAT clustering shows findings group by failure mechanism, not by component touched. Revert granularity stays acceptable (5 plans), each plan's narrative is self-contained.

---

## G1+G2 empirical residuals ownership

| Option | Description | Selected |
|--------|-------------|----------|
| Fold into Phase 7 | Plan 07-01 closes G1+G2 empirically through structural pv-* validation per Finding H root cause | YES |
| Keep as Phase 6 amendments | Phase 7 plans don't carry G1+G2 acceptance criteria | |
| Hybrid | Phase 7 closes G1+G2 mechanically; Phase 6 amendment cites Phase 7 | |

**User's choice:** Fold into Phase 7
**Notes:** Per Finding H (refined root cause from "rule miss" to "rule bypass via self-anchor"), Plan 07-01's structural pv-* validation rule directly addresses the residual. Phase 6 06-VERIFICATION.md will get amendment 6 written by Plan 07-06 downgrading PASS-with-caveat to PASS once Plan 07-01 verification passes.

---

## Word-budget strategy (Finding D)

| Option | Description | Selected |
|--------|-------------|----------|
| Hybrid: descriptive + sub-caps + smoke | Descriptive triggers + worked example + structural sub-caps (Findings <=80w each / Threat Patterns <=160w / Missed-surfaces <=30w / total <=300w for reviewer + security-reviewer; advisor stays 100w) + per-agent smoke fixtures | YES (research-backed) |
| Descriptive + smoke (no sub-caps) | Phase 5.4 D-08 style without structural sub-caps | |
| Cap re-evaluation only | Lift security-reviewer cap to 400w with sub-caps | |
| Hard-rules layer immediately | Move word-budget into agent prompt hard-rules section alongside tool_uses discipline | |

**Selection method:** Research-backed decision (no contention).
**Notes:** Anchored in Anthropic Claude 4 system prompt analysis (PromptHub) + Blockchain Council Output Control "firm budget + strict structure" + claudefa.st three-layer self-validating architecture. Hard-rules layer rejected per Anthropic's Apr 2026 ablation showing ~3% coding-quality drop from cap addition.

---

## Reviewer web-tool design (Finding F)

| Option | Description | Selected |
|--------|-------------|----------|
| Option 1+2 in tandem | Pre-emptive Class-2 scan in executor (Option 1) + reviewer escalation hook with structured `<verify_request>` block (Option 2) | YES (research-backed) |
| Option 1 only (pre-emptive scan) | Just the executor's Phase 1 pre-emptive Class-2 scan | |
| Option 2 only (escalation hook) | Just the reviewer's structured `<verify_request>` + executor re-invoke | |
| Option 3: extend reviewer tool grant | Add WebSearch/WebFetch/ToolSearch to reviewer agent's tools | REJECTED |

**Selection method:** Research-backed decision (no contention).
**Notes:** Anchored in Qwen Code production default + OWASP structured-output security control + InfoQ Least-Privilege AI Agent Gateway + Spotify Honk one-shot pass/fail. Option 3 explicitly rejected per OWASP AI Agent Cheat Sheet, arXiv 2601.11893, and Claude Code Issue #20264 on subagent privilege escalation. Reviewer tool grant stays `[Read, Glob]`.

---

## Verify-before-commit pattern (Finding E.1+E.2)

| Option | Description | Selected |
|--------|-------------|----------|
| Cost-cliff aware: 4-element pattern | (a) Advisor refuse-or-flag rule (E.1); (b) Plan-step-shape rule for Run/Verify directives (E.2); (c) Cost-cliff allowance with `wip:` commit + `## Outstanding Verification` for long-running async; (d) `Verified:` trailer paired with smoke fixture trace grep-check | YES (research-backed) |
| Strict: every hedge mandates verification | All hedges and all Run: directives must execute before commit, no cost-cliff allowance | |
| Cost-cliff aware MINUS Verified: trailer | Same as recommended but skip the Verified: trailer convention | |
| Advisor refuse-or-flag only (no E.2) | Only the advisor refuse-or-flag rule for hedge markers; skip plan-step-shape rule | |

**Selection method:** Research-backed decision (no contention).
**Notes:** Anchored in 8th UAT empirical pattern (advisor Critical-flag triggered verification; 3 of 4 cheap directives ran, 1 long-running skipped) + Cursor TDD anchor + outcome-based verification 5-check + Spotify Honk one-shot. Strict approach rejected because 8th UAT cost-cliff is empirically real; long-running validations would create false-positive commit blocks. `Verified:` trailer kept because outcome-based verification research treats it as a detection signal that pairs with smoke fixture trace grep-check (trailer alone is unreliable; tool_use event alone is unanchored; together they form the verifiable record).

---

## Plugin version bump

| Option | Description | Selected |
|--------|-------------|----------|
| 0.10.0 (minor) | Contract-shape changes match minor-bump convention; matches Phase 6 precedent (0.8.4 -> 0.9.0 minor for trust-contract rewrite) | YES (project convention) |
| 0.9.x (patch chain) | Each plan ships its own patch | |
| 1.0.0 (major) | Marketplace-readiness milestone cut | |

**Selection method:** Project-precedent decision (research thin on this question).
**Notes:** Phase 7's contract-shape changes (new pv-validation rule, new `<verify_before_commit>` block, new `<verify_request>` structured output, sub-caps in agent word-budget, scope-disambiguated provenance markers) match the existing project convention for minor bumps without breaking the skill invocation surface. 1.0.0 deferred until Phase 7 closes empirically AND a follow-up regression cycle confirms zero residuals.

---

## Research-backed selection method

For the three solution-design areas (Word-budget, Reviewer web tools, Verify-before-commit), the user requested research-backed decisions with escalation only on contention. All three resolved cleanly without contention; primary sources are cited in CONTEXT.md `<canonical_refs>` section and full research notes in `discuss-research/{area-2,area-3,area-4}-*.md`.

For the two project-shape areas (Plan bundling, G1+G2 ownership) and the convention-driven area (Plugin version), the decisions came from the user (bundling, G1+G2) or from project precedent (version). These are not research-backed claims; the empirical anchor is the 13-UAT clustering for bundling, the Finding H root-cause refinement for G1+G2, and Phase 6's 0.8.4 -> 0.9.0 minor convention for the version bump.

## Claude's Discretion

(Items where the user said "you decide" or deferred to Claude — see CONTEXT.md `<decisions>` "Claude's Discretion" subsection for the full list.)

- Cost-cliff threshold heuristic (timeout-based vs command-name pattern vs explicit plan annotation)
- Smoke fixture letter naming (suggested D-* for budget, E-* for verify-before-commit, B-* or H-* for pv-* validation)
- Sub-cap word-count thresholds (suggested 80w / 160w / 30w; planner may calibrate)
- `<verify_request>` schema details (suggested fields: question, class, anchor_target, optional severity)
- Reviewer re-invoke retry budget (suggested: one-shot only)
- WIP commit prefix convention (suggested: `wip:` lowercase)
- `Verified: <claim>` trailer format details
- UAT replay scope in Plan 07-06 (minimum: plan-fixes + execute-fixes + security-review)
- B/H pv-* validation smoke fixture design (XML-aware vs regex)
- Whether to extend KCB-economics.sh vs ship a new B-pv-validation.sh
- Plan ordering 07-04 / 07-05 vs 07-02 / 07-03 after Plan 07-01 lands

## Deferred Ideas

(See CONTEXT.md `<deferred>` section for the full list.)

- README "Recommended prompt shape" section (deferred again from 5.5 / 5.6 / 6)
- 1.0.0 marketplace-readiness cut
- Hard-rules layer for word-budget
- Reviewer tool grant extension (Option 3 of Finding F) - permanently deferred
- Strict verify-before-commit
- maxTurns cap removal / SendMessage-based bidirectional advisor
- Pro / Free plan tier UAT cross-tier verification
- Pattern D as `claude -p` linter / pre-flight check
- Fifth catch-all class in Pattern D
- Reviewer iterative re-invoke loop
