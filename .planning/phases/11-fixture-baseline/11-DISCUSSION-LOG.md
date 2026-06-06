# Phase 11: Fixture baseline - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md -- this log preserves the alternatives considered.

**Date:** 2026-06-07
**Phase:** 11-Fixture baseline
**Areas discussed:** Baseline input source, Anti-vacuous enforcement depth, Budget-cap fidelity, Script conventions & structure
**Mode:** `--analyze --auto` (trade-off tables logged; recommended option auto-selected for every question; no interactive prompts)

---

## Baseline input source

| Option | Description | Selected |
|--------|-------------|----------|
| Self-extract worked example from agent files at runtime | Strip `> ` blockquote framing, parse the holistic example; ROADMAP criterion 2 says "green when run against the current shorthand-grammar agent prompts"; Phase 12 example rewrite auto-flips fixtures RED (lockstep coupling for free) | x (primary) |
| Frozen committed sample response files | Deterministic but decoupled from agent files; Phase 12 must remember to update samples (drift risk) | x (as `--from-trace <file>` secondary mode) |
| Live `claude -p` capture at fixture runtime | Tests real behavior but expensive/stochastic; that is Phase 13's job (GATE-02 n>=3) | |

**Auto-selected:** Self-extracting primary mode + `--from-trace <file>` secondary mode; no live invocation inside fixtures.
**Notes:** Phase 08 `--from-trace` replay precedent preserved so Phase 13 reuses the same parser against captured live output.

---

## Anti-vacuous enforcement depth

| Option | Description | Selected |
|--------|-------------|----------|
| Runtime `matched_count >= min` only | Satisfies ROADMAP criterion 3 minimally; fail-loudly behavior never proven | |
| Runtime assertion + built-in `--self-test` zero-finding mode | PITFALLS.md "Looks Done But Isn't" requires verifying the fixture FAILS on zero-finding input; reproducible proof | x |
| Separate negative-sample files | Explicit but more files to keep honest | |

**Auto-selected:** `matched_count >= 5` before the budget loop + `--self-test` mode asserting non-zero exit on zero-finding input + verbose parsed-finding count in output.
**Notes:** min 5 per PITFALLS.md recommendation; both holistic examples carry 7 findings.

---

## Budget-cap fidelity

| Option | Description | Selected |
|--------|-------------|----------|
| Strict 1:1 copy of agent `<output_constraints>` | Simple, but discards the paid-for Phase 7/8 tolerance decisions; would re-trip 08-02 PFV false positives | |
| Phase 08 final parser state (canonical targets + parser-layer tolerances) | Backtick-tolerant SHAPE regex (RES-SHAPE-REGRESSION-PARSER), PFV outlier cap 75w on security fixture (RES-PFV-OUTLIER-CAP), +10% ef97e21 precedent; mandated by ROADMAP criterion 4 ("Phase 08 fixture decisions") | x |
| matched-count only, defer budgets to Phase 13 | Cheapest but guts GATE-01 ("budget fixtures" without budgets) | |

**Auto-selected:** Phase 08 final parser state.
**Notes:** Agents stay aimed at canonical word targets; all slack at the fixture-parser layer only (recorded Phase 7 precedent).

---

## Script conventions & structure

| Option | Description | Selected |
|--------|-------------|----------|
| Two standalone scripts, validate-phase-*.sh house style | Zero-dependency, independently runnable, matches the only committed test convention | x |
| Shared sourced helper lib | DRY but a new abstraction for exactly 2 consumers | |
| One parameterized script | Contradicts ROADMAP's two literally-named files | |

**Auto-selected:** Two standalone scripts following `tests/validate-phase-03.sh` / `tests/validate-phase-04.sh` conventions ([PASS]/[FAIL] counters, `set -euo pipefail`, ASCII-only, repo-root relative, exit non-zero on any FAIL).
**Notes:** File names locked by ROADMAP success criterion 1: `D-reviewer-budget.sh`, `D-security-reviewer-budget.sh` under `tests/`.

---

## Claude's Discretion

- Exact regex spelling, blockquote-stripping mechanics, `--self-test` zero-finding input synthesis.
- Parser treatment of `<verify_request>` XML blocks inside `### Findings` (recover Phase 08 precedent if documented; otherwise simplest correct treatment).
- Security auto-clarity carve-out handling (full-prose CVE finding absorbs volume under `per_finding_validation`; must not flag as a per-entry violation).

## Deferred Ideas

- **Research RTK command suitability for skills and agents** (pending todo, match score 0.2 -- below the 0.4 auto-fold threshold): plugin-tooling research unrelated to fixture authoring; stays pending.
- Phase 12 decisions (grouped grammar, vocabulary, version bump) intentionally not pulled forward.
