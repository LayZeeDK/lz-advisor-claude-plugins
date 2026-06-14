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

## Milestone: v2.0.0 -- Prefixed skill names

**Shipped:** 2026-06-14 (plugin 2.0.0, PR #2 merged) | **Phases:** 4 (14, 14.1, 14.2, 15) | **Plans:** 4

### What Was Built
A breaking (MAJOR) release that prefixed all four skills with `lz-` (`lz-plan` / `lz-execute` / `lz-review` / `lz-security-review`) to fix the critical bug where the bare names silently shadowed Claude Code's built-in `/plan`, `/review`, `/security-review`. Two contract refinements were folded in via mid-milestone decimal inserts: security-review migrated to the canonical pentest 5-tier severity scale (14.1) and the verdict provenance-marker label was renamed `**Verdict scope:**` -> `**Verdict axis:**` (14.2). Shipped with an 8-row CHANGELOG migration table, a true merge commit, an annotated tag, and a GitHub Release (Latest). A surgical product change: plugin tree +148/-146 over 10 files.

### What Worked
- **Precedent reuse.** Phase 14 mirrored the Phase 9 rename methodology exactly -- `git mv` (history preserved) + lockstep cross-reference sweep + a pathspec-scoped identifier-form `git grep` regression gate -- making the rename mechanical and gate-provable rather than judgment-heavy.
- **Atomic WR-05 commit discipline.** Each contract change (the severity migration, the label rename) landed as ONE atomic commit, so the few-shot worked examples never went mixed-vocabulary between commits -- the documented few-shot-drift scar stayed closed.
- **Scope-fence proofs.** 14.1 changed security-review ONLY and proved it by an asymmetric fence (the reviewer surfaces absent from `git status`, the reviewer fixture still green); 14.2 renamed the display label while freezing the machine `scope:` token (count-unchanged gate). Both made "I didn't touch the frozen surface" a checkable assertion, not a claim.
- **Merge-commit-before-tag release.** Tagging the true merge commit (not the branch tip) with an identity guard (`assert tag == merge_sha` before push) produced a clean, Latest-marked Release on the first try.

### What Was Inefficient
- **Scope creep via inserts.** The milestone opened as a clean two-phase "rename + release" and grew to four phases through two mid-milestone inserts. Both were genuine improvements, but bundling three breaking/contract changes into one MAJOR widened the CHANGELOG and the audit surface. Decimal inserts are cheap mechanically; their cost is release-surface breadth.
- **Verification-artifact drift.** Phase 15's VALIDATION.md was left a stale draft (sign-off unticked, `nyquist_compliant:false`) even though every REL gate was independently verified green -- the audit could only score nyquist PARTIAL on artifact hygiene. The REQUIREMENTS.md traceability table likewise lagged (RENAME rows stuck at "Planned" while the checkboxes were `[x]`).
- **Un-automatable check.** RENAME-02 (bare-form de-shadow) is invisible to headless verification -- a `claude -p` probe resolves qualified names and cannot see a bare-form collision -- so it stayed `human_needed` until the interactive-picker check.

### Patterns Established
- Mechanical behavior-preserving rename: `git mv` + lockstep sweep + identifier-form `git grep` gate, pathspec-scoped to the plugin tree as the structural guard against sweeping frozen `.planning/` history.
- Scope-fence preservation: the frozen machine TOKEN vocabulary is distinct from the human display LABEL; a label rename must leave the token byte-intact, proven by a must-survive count gate.
- Per-surface taxonomy divergence: security uses the canonical pentest scale; review keeps the Conventional-Commits-derived lexicon -- divergence proven asymmetrically.
- Section-aware budget enforcement: a parallel `FINDING_SEVS` array lets the fixture apply a tier-specific cap (Informational denied the 75w auto-clarity escape).

### Key Lessons
- A bare-form command-shadowing collision is invisible to headless verification; only the interactive picker reveals it. Record such checks as `human_needed` with a precise recipe -- never substitute a structurally-blind probe and call it passed.
- When renaming a human-facing label that shares a word with a machine token, edit each site individually (never a blanket replace) and add a token-count must-survive gate so "the token was frozen" is provable, not asserted.
- Flip verification artifacts (VALIDATION.md sign-off, REQUIREMENTS traceability status) at phase close, not at milestone audit -- otherwise the audit scores PARTIAL on pure artifact hygiene while the work is actually done.
- Mid-milestone inserts are mechanically cheap but widen the release surface; decide deliberately whether a refinement belongs in the current MAJOR or a follow-up.

### Cost Observations
- Model mix: orchestration on the session model; planner / checker / executor / verifier + the three plugin agents on opus per the quality profile.
- Low-cost milestone relative to v1.0 / v1.0.1: four single-plan phases, surgical edits, and -- unlike both prior milestones -- no external-repo (`ngx-smart-components`) headless `claude -p` UAT, because the rename is statically gate-provable. The only human-in-the-loop step was the interactive-picker de-shadow check.

---

## Cross-Milestone Trends

(Three milestones shipped to date: v1.0 MVP (16 phases / 80 plans, 2026-06-01), v1.0.1 (3 phases / 13 plans, 2026-06-11), and v2.0.0 (4 phases / 4 plans, 2026-06-14). Signals: self-extracting regression fixtures + adversarial `/code-review` convergence loops as the quality mechanism for a prompt-engineering codebase (v1.0, v1.0.1); a shift toward statically gate-provable changes -- `git mv` + pathspec-scoped `git grep` gates + scope-fence count assertions -- that close without external-repo UAT (v2.0.0). Recurring friction across all three: verification/requirement-doc text drifts behind the implementation and gets reconciled at milestone boundaries. Release maturity climbed from "tag, do not push" (v1.0) to PR-merged true-merge-commit tag + GitHub Release Latest (v1.0.1 retro-tagged, v2.0.0 native).)
