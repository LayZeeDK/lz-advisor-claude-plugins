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

## Cross-Milestone Trends

(First milestone -- trends accumulate from v1.1 onward.)
