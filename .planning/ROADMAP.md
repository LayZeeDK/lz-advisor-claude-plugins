# Roadmap: lz-advisor

## Milestones

- **[SHIPPED] v1.0 MVP** -- Phases 1-10 (incl. 5.1-5.6), shipped 2026-06-01 at plugin 1.0.0. Full detail: [milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md). Requirements: [milestones/v1.0-REQUIREMENTS.md](milestones/v1.0-REQUIREMENTS.md). Audit: [milestones/v1.0-MILESTONE-AUDIT.md](milestones/v1.0-MILESTONE-AUDIT.md).
- **[SHIPPED] v1.0.1 No review report shorthands** -- Phases 11-13, shipped 2026-06-11 at plugin 1.0.1 (PR #1 merged). Full detail: [milestones/v1.0.1-ROADMAP.md](milestones/v1.0.1-ROADMAP.md). Requirements: [milestones/v1.0.1-REQUIREMENTS.md](milestones/v1.0.1-REQUIREMENTS.md). Audit: [milestones/v1.0.1-MILESTONE-AUDIT.md](milestones/v1.0.1-MILESTONE-AUDIT.md).
- **[ACTIVE] v2.0.0 Prefixed skill names** -- Phases 14-15, plugin 1.0.1 -> 2.0.0. Breaking `lz-` skill rename (de-shadow built-in `/plan` / `/review` / `/security-review`) + release. Requirements: [REQUIREMENTS.md](REQUIREMENTS.md).

## Phases

### [ACTIVE] v2.0.0 Prefixed skill names (Phases 14-15) -- plugin 1.0.1 -> 2.0.0

**Goal:** Fix the critical built-in-command shadowing bug by prefixing all four skills with `lz-`, shipped as a breaking (MAJOR) release.

- [ ] **Phase 14: lz- skill rename** -- RENAME-01, RENAME-02, RENAME-03
- [ ] **Phase 15: v2.0.0 release & publication** -- REL-01, REL-02, REL-03

#### Phase 14: lz- skill rename
**Requirements:** RENAME-01, RENAME-02, RENAME-03
**Goal:** Rename all four skills (`plan` / `execute` / `review` / `security-review` -> `lz-*`) via `git mv` so they no longer shadow Claude Code built-ins, with every in-repo reference updated in lockstep.
**Success criteria:**
1. The four skill directories + `name:` frontmatter are `lz-`-prefixed via `git mv` (history preserved); skills load as `lz-advisor:lz-<skill>`.
2. `git grep` for the old bare skill names returns zero hits under `plugins/lz-advisor/` (lockstep sweep complete).
3. Doc references updated for accuracy: root + plugin README, CLAUDE.md (incl. the `claude -p` UAT examples), PROJECT.md.
4. [human_needed] Interactive command-picker confirms the built-in `/plan` / `/review` / `/security-review` are no longer shadowed by the plugin (headless `claude -p` probes are structurally blind to bare-form collisions).

**Plans:** 1 plan

Plans:
- [ ] 14-01-PLAN.md -- git mv the 4 skill dirs + name: fields, lockstep cross-reference accuracy sweep, closing 5-pattern git grep gate + RENAME-02 interactive-picker recipe (human_needed)

#### Phase 15: v2.0.0 release & publication
**Requirements:** REL-01, REL-02, REL-03
**Goal:** Ship the rename as v2.0.0 -- atomic version bump, CHANGELOG with migration table, git tag, and GitHub Release. Gated on Phase 14 verification.
**Success criteria:**
1. Plugin version is `2.0.0` across all 5 surfaces (`plugin.json` + the 4 SKILL.md `version:` fields), bumped atomically.
2. `CHANGELOG.md` `[2.0.0]` entry documents the breaking rename with an old->new migration table (bare + qualified forms) + a compare link; the plugin README "What's New" shows the 2.0.0 entry.
3. A `v2.0.0` git tag is pushed to origin and a GitHub Release is published with the `[2.0.0]` notes.

**Coverage:** 6/6 requirements mapped (RENAME-01..03 -> Phase 14; REL-01..03 -> Phase 15).

<details>
<summary>[SHIPPED] v1.0 MVP (Phases 1-10) -- 2026-06-01, plugin 1.0.0</summary>

- [x] Phase 1: Plugin Scaffold and Advisor Agent
- [x] Phase 2: Plan Skill
- [x] Phase 3: Execute Skill
- [x] Phase 4: Review Skills
- [x] Phase 5: Polish and Marketplace Readiness
- [x] Phase 5.1: Advisor consultation refinements (INSERTED)
- [x] Phase 5.2: Rename skills + advisor preamble waste (INSERTED)
- [x] Phase 5.3: Field-test findings + Opus 4.7 UAT items (INSERTED)
- [x] Phase 5.4: UAT findings A-K (INSERTED)
- [x] Phase 5.5: Test #5 pipeline + proactive web-research (INSERTED)
- [x] Phase 5.6: E-runtime regression + full Compodoc UAT (INSERTED)
- [x] Phase 6: Address Phase 5.6 UAT findings
- [x] Phase 7: Address all Phase 5.x + 6 UAT findings
- [x] Phase 8: Phase 7 residuals + wip-discipline reversal + GAP-S9/S10 gap-closure
- [x] Phase 9: Rename skills (dotted `lz-advisor.<skill>` -> plain `<skill>`)
- [x] Phase 10: Milestone v1.0 documentation-hygiene cleanup

Full phase details, requirements, success criteria, and plan breakdowns are archived in [milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md).

</details>

<details>
<summary>[SHIPPED] v1.0.1 No review report shorthands (Phases 11-13) -- 2026-06-11, plugin 1.0.1</summary>

**Goal:** Review and security-review reports present findings grouped under fully spelled-out severity headlines (`### Critical` / `### Important` / `### Suggestions` / `### Questions`) instead of the `crit:`/`imp:`/`sug:`/`q:` fragment-grammar shorthands, without breaking the render-verbatim contract or the word-budget regression gates.

- [x] Phase 11: Fixture baseline -- budget smoke fixtures re-authored as tracked regression tests, green on the current grammar (GATE-01) (completed 2026-06-07)
- [x] Phase 12: Atomic grouped-grammar rewrite -- both agents + both skill render-verbatim contracts + context-packaging sync rewritten to the grouped shape in one unit, with lockstep fixture retarget and the 5-surface 1.0.0 -> 1.0.1 bump (completed 2026-06-07)
- [x] Phase 13: Empirical verification -- headless `claude -p` UAT proves the grouped grammar reaches rendered output on both review skills; SC-4 budget gate GREEN 6/6 on the final re-measure; residue + history-preservation sweep clean (GATE-02) (completed 2026-06-08)

Full phase details, success criteria, and the gap-closure trail are archived in [milestones/v1.0.1-ROADMAP.md](milestones/v1.0.1-ROADMAP.md). Final status: all 12 requirements satisfied (see the audit); non-critical deferred items recorded in STATE.md.

</details>

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-10 (v1.0) | v1.0 MVP | 80/80 | Complete | 2026-06-01 |
| 11. Fixture baseline | v1.0.1 | 2/2 | Complete | 2026-06-07 |
| 12. Atomic grouped-grammar rewrite | v1.0.1 | 4/4 | Complete | 2026-06-07 |
| 13. Empirical verification | v1.0.1 | 7/7 | Complete | 2026-06-08 |
| 14. lz- skill rename | v2.0.0 | 0/1 | Planned | - |
| 15. v2.0.0 release & publication | v2.0.0 | -/- | Not started | - |

v1.0 + v1.0.1 shipped. **Active: v2.0.0 (Prefixed skill names)** -- 2 phases (14-15), continuing numbering from Phase 13. Next: `/gsd-plan-phase 14`. See `.planning/MILESTONES.md` for shipped-milestone summaries and `milestones/` for full detail.
