# Phase 20: Orchestrator skill + headless scale confirmation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md -- this log preserves the alternatives considered.

**Date:** 2026-06-19
**Phase:** 20-orchestrator-skill-headless-scale-confirmation
**Mode:** `--analyze --auto --chain` with the user-directed decision methodology (cross-family board for high-impact/hard-to-reverse; Opus panel for lower-impact). Two pre-discussion research passes fed the board/panel.
**Areas discussed:** LIVE-cert: positives source (Q1), adjudicator (Q2), no-traffic shadow/canary (Q3), flip-vs-defer (Q4), spend structure (Q5); Orchestrator: wave-batching (GA-6), scope-clarify (GA-7), allowed-tools/tier-dispatch (GA-8), report structure (GA-9), VERIF-05 escalation (GA-10), scale-spike (GA-11), run-id/layout (GA-12); + integration constraints (R1/R3/R4/R5/R7/contract-closure).

---

## Decision method

Per the user's command directive: hard-to-reverse, high-impact decisions went to a **de-identified, fact-only cross-family board** -- 2 Opus lenses (eval-validity ARCHITECT + validity SKEPTIC, via the Agent tool) + Copilot **GPT-5.5** + **Gemini-3.1-pro-preview** (out-of-family). Lower-impact orchestrator HOW-decisions went to a **panel of Opus Agents** (design-synthesizer + risk/integration-checker). The board was fed facts with no leading phrases and converged in ONE round (no R2 needed). Board credits: ~10.7 Copilot AI Credits (GPT-5.5 5.17 + Gemini 5.52). Transcripts gitignored in `eval/.cache/p20-board/`.

---

## LIVE certification methodology (cross-family board, Cluster 1)

### Q1 -- Source of the live "adjudicated production-distribution SUPPORTED claims"

| Option | Description | Selected |
|--------|-------------|----------|
| (a) Run S on real questions, harvest its SUPPORTED claims, re-adjudicate | On-distribution; difficulty derived from S itself | YES (all 4) |
| (b) Draw positives from an external labeled benchmark | Off-distribution for THIS pipeline; misranks the judge | no (sanity-check only) |
| (c) Hybrid | (a) primary + (b) as a difficulty cross-check | partial |

**Board consensus:** (a) primary, difficulty-stratified to oversample dense/contested claims; (b) at most a calibration sanity check. **N:** do NOT certify at the 24 floor -- target N_ctrl 40 (floor 30), a SEPARATE N_trap ~34-40 for the false-uphold monitor (the arithmetic: 0/24 clears 0.15 only at exactly zero AND fails the 0.10 gate). -> CONTEXT D-02, D-03.

### Q2 -- Adjudicator identity

| Option | Description | Selected |
|--------|-------------|----------|
| Frozen OOF all-agree pair only | Cheap, de-biased, but an unvalidated oracle | no (alone) |
| Human only (2-3 annotators + adjudication) | Textbook ideal; not solo-buildable at scale | no |
| Hybrid: OOF primary, human resolves residue | OOF bulk + human on split/response-set/indeterminate | YES (all 4) |

**Board consensus:** hybrid; response-set elicitation (Guerdan) -- indeterminate items excluded from the binary denominator + routed to human; adjudicator stays out-of-family; add an OOF-vs-human calibration subset. -> CONTEXT D-04.

### Q3 -- "shadow -> canary -> Tier-1" with NO production traffic

| Option | Description | Selected |
|--------|-------------|----------|
| Literal staged operational rollout | Theatre -- no traffic to shadow/canary; certifies the generator not the evaluator | REJECTED (mis-framed) |
| Offline acceptance battery (dual-run + audit) | "Shadow" = dual-run CHEAP vs STRONG on frozen bundles; guard = load-bearing escalation + unanimous-uphold audit | YES (synthesis) |
| Opt-in dogfood beta | CHEAP behind an OFF flag; maintainer dogfoods; unanimous upholds logged for periodic audit | YES (the honest "canary") |

**Board consensus (reconciled):** drop the literal rollout vocabulary; honest substitute = offline dual-run + correlated-blind-spot guard (census audit of unanimous upholds on load-bearing claims) + an opt-in dogfood beta as the ongoing accrual. "Rollback" = the flag stays OFF. -> CONTEXT D-05.

### Q4 -- Flip the CHEAP tier ON now, or defer

| Option | Description | Selected |
|--------|-------------|----------|
| Flip CHEAP ON now (if it certifies) | Captures cost savings immediately | no |
| Ship STRONG default + gated mechanism + rollback; DEFER the flip | Conservative-correct; cost-asymmetry decisive | YES (all 4) |

**Board consensus:** DEFER. CHEAP flips ON only after a future run clears both CP gates + clean unanimous audit + a real cost win, at a human checkpoint. Optional compromise: CHEAP-with-STRONG-backstop for non-load-bearing claims, still gated behind the cert. -> CONTEXT D-06.

### Q5 -- Spend structure

| Option | Description | Selected |
|--------|-------------|----------|
| One pre-registered blocking run | Anti-p-hacking; SKEPTIC's preference | merged |
| Staged (harvest+freeze -> score -> audit) | GPT-5.5 + Gemini staging; [HUMAN BLOCK] between | merged |
| Incremental add-until-pass | Optional-stopping / p-hacking | REJECTED |

**Board consensus (reconciled):** staged + pre-registered + blocking. Stage 1 harvest + adjudicate + FREEZE gold/N/ceilings/estimator `[HUMAN BLOCK]`; Stage 2 dual-run over frozen artifacts in ONE scored pass; Stage 3 unanimous-uphold audit. No add-until-pass. -> CONTEXT D-07.

**Board top uncertainties (recorded as pre-flight checks, not blockers):** (1) whether S can emit >= 30 difficulty-representative dense positives (-> D-19 harvest feasibility probe); (2) whether the frozen OOF pair is validated vs human gold (-> D-04 calibration subset); (3) maintainer-curated prompts may not match a future user distribution (-> named limit in the report).

---

## Orchestrator skill HOW-decisions (Opus panel, Cluster 2)

Decided by the design-synthesizer + risk/integration-checker, grounded in the verified Claude Code v2.1.x research. Most were research-RESOLVED (not genuinely open), so committed directly:

| Area | Decision | CONTEXT |
|------|----------|---------|
| GA-6 wave-batching | Foreground spawns + hard counted instruction (<=5/turn, wait, split >5 into sub-waves) | D-08 |
| GA-7 scope-clarify | Attempt AskUserQuestion; fall back to Assuming-frames (no headless-detect signal) | D-09 |
| GA-8 allowed-tools + tier | Declare as doc; rely on auto-mode; pass `model` per Agent-invocation (frontmatter model INERT); Bash(node:*); ${CLAUDE_PLUGIN_ROOT} not ${CLAUDE_SKILL_DIR} | D-10 |
| GA-9 report structure | Question&Scope / Key Findings (inline cite + confidence + two-assurance) / Contested&Unsupported first-class / legend / Sources | D-11 |
| GA-10 VERIF-05 escalation | Deterministic in the aggregator (additive `escalate` flag: Contested OR load_bearing OR hash-audit-sample); claim_support produced by synthesis | D-12 |
| GA-11 scale spike SC-5 | Packaged `claude -p` run; trace asserts max-in-flight <=5 across >=3 waves + host stable + reproducible survivors.json | D-13 |
| GA-12 run-id + layout | Session-generated timestamp+slug id; aggregator takes run-dir as argv; gitignore .lz-research/; retain run dir | D-14 |

### Integration constraints surfaced by the risk/integration-checker (decide-now)

| Constraint | CONTEXT |
|------------|---------|
| Plugin-agent frontmatter `model:` is INERT -> orchestrator passes model per-invocation (most load-bearing) | D-10 |
| Vote files keyed by aggregator stage-1 CLUSTER id; aggregate->dispatch->aggregate order load-bearing | D-15 |
| Cap dispatched workers at MAX_FETCH=15 / ANGLES~5 before spawning; aggregator fail-closes (exit 2); report treats non-zero exit as run failure | D-16 |
| Citation provenance guard: synthesis reads sources/<key>.json, fails loudly; canonical-URL recipe byte-identical (dev test) | D-17 |
| COST-01 exactly 2 Opus gates; research-verify-voter-opus is EVAL-ONLY; reconcile SESSION-DESIGN Gate-1b | D-18 |

---

## Claude's Discretion

- The curated research-question set for harvesting positives; the precise audit-sample % within 15-20%; the exact receipt char cap; the SKILL.md prose + references/ split; the report Markdown micro-format; the run-id slug derivation. Planner finalizes within the frozen contracts.

## Deferred Ideas

- The Haiku-first FLIP itself (post-certification, future run); the owner escaped-error budget (ratified at the live-cert plan review); release/publication REL-01..03 (`/gsd-complete-milestone`); v2 backlog (SCALE-01/02/03, AGGX-01); larger-N corpus + SPC monitoring (post-release).
- Reviewed-not-folded: RTK command suitability research (~0.6, orthogonal; stays on the backlog).
