# Retrospective: lz-advisor

A living retrospective across milestones. Newest milestone first.

## Milestone: v1.0 -- MVP

**Shipped:** 2026-06-01 (plugin 1.0.0)
**Phases:** 16 (1-10, incl. 5.1-5.6) | **Plans:** 80

### What Was Built

A Claude Code marketplace plugin implementing the advisor strategy: 4 skills (`/plan`, `/execute`, `/review`, `/security-review`), each pairing a Sonnet executor with a dedicated Opus agent (`advisor`, `reviewer`, `security-reviewer`) via the native Agent tool -- zero external dependencies, pure Markdown/YAML. Core delivery was Phases 1-5; most of the value came from 9 UAT-driven hardening phases (5.1-9) that turned a working prototype into a field-robust plugin: verification-chain integrity, per-section output budgets, change-surface verify-target selection, pack-then-trust final consults, and the dotted->plain skill rename.

### What Worked

- **UAT-driven hardening loop.** Running the plugin headlessly against a real external repo (ngx-smart-components, Compodoc+Storybook) surfaced behavioral defects static review never would: advisor maxTurns exhaustion, a verify-target mismatch that hid a broken dev-server across 8 sessions, zero web-tool usage despite explicit ranking rules.
- **Empirical gates over assertions.** Smoke fixtures (`DEF-*`, `D-*-budget`, `B-pv-validation`, `F-class-2-escalation`) plus `--from-trace` replay made regressions catchable and findings provable rather than asserted.
- **Prompt-side fixes over budget increases.** The advisor maxTurns-exhaustion class was solved by packing context + a no-disk-hunting clause, not by raising budgets (memory: feedback_advisor_fix_approach).

### What Was Inefficient

- **Version churn.** Many SemVer bumps across the prerelease (0.1.0 -> 0.15.0) before 1.0.0; version numbers were explicitly non-load-bearing pre-release, but each bump still incurred 5-surface-sync overhead.
- **Requirement/doc drift.** Spec text (ADVR-04 maxTurns, ADVR-06 MUST-rule), the GAP-D budget definition, the README changelog, and the CLAUDE.md effort/budget table all drifted behind the shipped implementation; caught and reconciled only at milestone finalization (Phase 10 + the v1.0 finalization session).
- **Conditional-firing observability.** FIND-F (the Class-2 escalation hook) could never be naturally triggered because the executor's pre-emption discipline is robust; four scenarios (incl. a deliberate web-deprivation run) confirmed it's correct-by-design, but the firing path stayed empirically unexercised.

### Patterns Established

- Atomic 5-surface version bump (plugin.json + 4 SKILL.md).
- No cross-skill body references; shared knowledge lives in `references/*.md` (progressive disclosure).
- No `wip:` commits; long-running validations wait for completion.
- Byte-identical canon across the 4 SKILL.md for shared XML blocks (`<context_trust_contract>`, `<orient_exploration_ranking>`).
- Headless `claude -p` verification convention with documented gotchas (no `@file` in `-p`, `--permission-mode auto`, qualified skill names, shared usage pool).

### Key Lessons

- For a prompt-only plugin, "tests" are smoke fixtures + headless UAT traces; the nyquist-auditor's code-test generation does not apply, but coverage discipline still does.
- Definition/doc text drifts silently as the implementation evolves through many small decisions; sweep it at milestone boundaries, not continuously.
- A well-designed fallback (the Class-2 hook) can be impossible to trigger naturally precisely because the primary path is robust -- document by-design closure rather than chasing an artificial firing.

### Cost Observations

- Model mix: Opus for all three plugin agents + the GSD planning/verification/audit subagents; Sonnet as the executor session model.
- Heavy use of nested `claude -p` UATs against an external repo; these draw on the shared 5-hour usage pool and occasionally hit rate limits mid-run.

---

## Milestone: v1.0.1 -- No review report shorthands

**Shipped:** 2026-06-11 (plugin 1.0.1, PR #1 merged) | **Phases:** 3 (11-13) | **Plans:** 13

### What Was Built
Both review agents rewritten to emit findings grouped under fully spelled-out severity headlines (`### Critical` / `### Important` / `### Suggestions` / `### Questions`) instead of the `crit:`/`imp:`/`sug:`/`q:` fragment shorthands; both skills' render-verbatim contract inverted so the grouped shape IS the contracted output; two self-extracting budget regression fixtures committed; empirically verified via headless `claude -p` UAT (SHAPE 6/6, budget GREEN 6/6); atomic 5-surface 1.0.0 -> 1.0.1 bump.

### What Worked
- **Build-order discipline:** fixture baseline first (Phase 11, green on the OLD grammar) -> atomic rewrite (Phase 12, RED-on-old/GREEN-on-new lockstep) -> empirical verification (Phase 13). The regression gate existed before the change it guarded.
- **Self-extracting fixtures** coupled the budget gate to the agents' own worked examples, so a prompt edit that broke the grammar turned the fixture red automatically.
- **Honest empirical reporting:** SC-4 (first-ever live per-finding budget measurement) surfaced a pre-existing verbosity property; it was recorded faithfully and closed via genuine agent concision across two gap-closure iterations (2/6 -> 7/10 -> 6/6), never by loosening the gate.
- **`/code-review` + `/gsd-quick --validate` loop** post-merge: four review passes with monotonically decaying findings (real contradiction -> imperfect fixes -> narrow edge -> stale comments), each fix round verified before the next review.

### What Was Inefficient
- The first two fix rounds (c5l, ebt) each left residual imperfections the next review caught -- the pass-1 hedge-placement fix was a "note" the checker had already warned was insufficient, and the pass-2 PFV coverage fix had a multi-paragraph under-count + a singular/plural regression. Deeper-fix-first (not annotate-the-contradiction) would have saved a round.
- A transient external-repo isolation breach during Phase 13 (a seed-commit via a bare `--git-dir` landed a stray on the ngx live checkout) cost a surgical revert + a standing execution-hygiene rule.

### Patterns Established
- Render-verbatim "the grouped shape IS the contract" (inversion of a prohibition into a positive contract).
- Per-section word-budget gates replacing a single aggregate cap, asserted at the fixture's parser layer (agent caps never loosened).
- Multi-paragraph word accumulation in the budget fixtures (boundary = next entry prefix / `### ` / EOF flush, blanks as continuation).

### Key Lessons
- When a review flags a contradiction, fix it at the source (rewrite the offending example) rather than annotating it -- a reconciling note relocates the contradiction.
- External-repo UAT seed-commits MUST use the worktree's own git context, never a bare `--git-dir` that resolves against the main checkout.
- A budget gate added to close a coverage gap can itself have edge gaps (single-line -> first-paragraph -> multi-paragraph); verify the gate against the non-conformant shape it is meant to catch, not just the happy path.

### Cost Observations
- Model mix: orchestration on the session model; planner/executor/checker/verifier + advisor subagents on opus per the quality profile.
- Convergence cost: 4 review passes + 3 `--validate` fix rounds + 1 inline cleanup for a small product surface (11 files) -- diminishing returns were explicit by pass 4 (only stale comments). A maintainer could reasonably stop at pass 3.

---

## Cross-Milestone Trends

(Trends accumulate from v1.1 onward. Two milestones shipped to date: v1.0 MVP (16 phases / 80 plans, 2026-06-01) and v1.0.1 (3 phases / 13 plans, 2026-06-11). Early signal: heavy use of self-extracting regression fixtures + adversarial `/code-review` convergence loops as the quality mechanism for a prompt-engineering codebase.)
