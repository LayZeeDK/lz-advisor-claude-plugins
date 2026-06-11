# Roadmap: lz-advisor

## Milestones

- **[SHIPPED] v1.0 MVP** -- Phases 1-10 (incl. 5.1-5.6), shipped 2026-06-01 at plugin 1.0.0. Full detail: [milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md). Requirements: [milestones/v1.0-REQUIREMENTS.md](milestones/v1.0-REQUIREMENTS.md). Audit: [milestones/v1.0-MILESTONE-AUDIT.md](milestones/v1.0-MILESTONE-AUDIT.md).
- **[SHIPPED] v1.0.1 No review report shorthands** -- Phases 11-13, shipped 2026-06-11 at plugin 1.0.1 (PR #1 merged). Full detail: [milestones/v1.0.1-ROADMAP.md](milestones/v1.0.1-ROADMAP.md). Requirements: [milestones/v1.0.1-REQUIREMENTS.md](milestones/v1.0.1-REQUIREMENTS.md). Audit: [milestones/v1.0.1-MILESTONE-AUDIT.md](milestones/v1.0.1-MILESTONE-AUDIT.md).

## Phases

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

Both milestones shipped. v1.0: 16 phases, 80 plans, plugin 1.0.0. v1.0.1: 3 phases, 13 plans, plugin 1.0.1 (merged via PR #1, 2026-06-11). No active milestone -- run `/gsd:new-milestone` to begin the next one. See `.planning/MILESTONES.md` for summaries and `milestones/` for full detail.
