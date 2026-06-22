# Phase 22: Deep-research skill eval and parity baseline - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md -- this log preserves the alternatives considered.

**Date:** 2026-06-22
**Phase:** 22-deep-research-skill-eval-and-parity-baseline-with-built-in-d
**Areas discussed:** Rubric & parity bar, LLM-judge design, Built-in baseline capture, Gold anchoring
**Mode:** `--analyze --auto --chain` with a directive to research before discuss + `--research` in plan-phase. Most gray areas were pre-decided by the ROADMAP goal/constraints; the two high-impact open forks (gold anchoring, judge tier) were escalated to the user (trap-quadrant) and resolved via a research wave + Opus panels + a cross-family board.

---

## Rubric & parity bar
(Research-settled; not escalated.)

| Option | Description | Selected |
|--------|-------------|----------|
| Single-judge 0-1 + pass/fail (Anthropic's 5 dims) | Mirrors Anthropic's shipped eval; absolute quality floor | partial |
| Dimension-isolated + partial credit + "Unknown" | Per "Demystifying evals"; strongest calibration | partial |
| Both-orderings pairwise win/tie/loss | Directly answers parity; conservative at n=2-3 | partial |
| Likert mean + non-inferiority margin / CIs | False rigor at n=2-3; contradicts locked "no statistical cert" | |

**Choice:** Two-layer = absolute floor (Anthropic 5 dims, 0-1 + pass/fail + "Unknown") + both-orderings pairwise parity verdict; NO CIs/margins at n=2-3 (D-04..D-07).
**Notes:** Grounded in Anthropic's multi-agent-research-system + demystifying-evals posts (both fetched/verified) + small-n LLM-judge literature.

---

## LLM-judge design (escalated; user-ratified)

| Option | Description | Selected |
|--------|-------------|----------|
| A. Single Opus judge | Stronger than the Sonnet candidate; most neutral; blind+swap+gold-anchor+multi-sample | ✓ |
| B. Advisor-strategy judge (Sonnet bulk + Opus at gates) | Mirrors the skill ethos; near-lineage worst case; biases toward our own system | |
| C. Hybrid (Opus on bias-critical dims) | Budget fallback only | (fallback) |

**User's choice:** Option A. "The skill eval's judge can be Opus. The advisor strategy applies to the skill at runtime, not necessarily for development or development tooling."
**Notes:** Re-adjusted 5-lens Opus panel was UNANIMOUS (5-0) for A. Key reasoning: the eval is a measurement instrument, not the product; a Sonnet judge grading a Sonnet-driven candidate biases TOWARD our own system, whereas an Opus judge's residual family bias is common-mode and runs against our parity win. Recorded as a generalizable project principle (memory: advisor-strategy-runtime-not-eval-tooling).

---

## Built-in baseline capture
(Research-settled; not escalated.)

| Option | Description | Selected |
|--------|-------------|----------|
| Headless `claude -p` + stream-json + tee | Reproducible, provenance-complete; workflow runs headless | ✓ |
| Interactive + /workflows TUI + copy | Manual; not reproducible | |
| json \| jq '.result' only | Companion for cost only | (companion) |
| json --json-schema coerced | Distorts the free-form report | |

**Choice:** Headless stream-json capture; n=2-3 questions x k=2 runs; report spread; end-state grading (D-15/D-16).
**Notes:** Verified the built-in is a closed-source bundled dynamic workflow (v2.1.154+) absent from all public Anthropic repos -- the architectural-parity track is documented from docs/blog, the built-in is a black box for measured parity.

---

## Gold anchoring (escalated; resolved via Opus panel + cross-family board)

| Option | Description | Selected |
|--------|-------------|----------|
| 1. Two-slice (commit now) | AVeriTeC deterministic slice + natural judge-graded slice; strongest anchor, most effort | |
| 2. Lean (natural-only) | Gold calibrates the judge only; cheapest; transfer gap on actual reports | |
| 3. Lock two-slice, gate feasibility downstream | Option 1 default + pre-registered feasibility gate + calibration-probe fallback | ✓ (synthesized) |
| (rejected) Hybrid-construct questions | Natural-yet-gold-pinned; INFEASIBLE at n=2-3 (cherry-picking) | |

**User's choice:** Option 3, accepted as a board-converged synthesis: feasibility-gated two-slice + the claim-extraction bridge.
**Notes:** Opus panel round 1 = 4-1 Option 3 (the 1 dissent was Option 1 with a refined fallback). Cross-family board (Opus + GPT-5.5 + Gemini-3.1-pro, identical briefing) = 2-1 feasibility-gated Option 3; Gemini dissented toward lean + a claim-extraction bridge and raised AVeriTeC ecological-validity. Synthesis adopts the bridge (D-12) + an ecological-representativeness criterion in the feasibility gate + a pre-frozen fallback (D-14). OOF board spend: 17.92 GitHub AI Credits.

---

## Claude's Discretion
- PAR-* requirement family derivation (plan-phase).
- Slice B question topics, final k (3-5), pass threshold (default 0.7).
- skill-creator integration: not adopted for grading (bespoke `eval/` harness); available for trigger tuning only.

## Deferred Ideas
- lz-deep-research workflow re-architecture (later milestone).
- Release/publication (handled at `/gsd-complete-milestone`).
- Reviewed-not-folded todos: relocate-non-distributable-test-fixtures (packaging backlog); research-rtk-command-suitability (unrelated backlog).
