# Roadmap: lz-advisor

## Milestones

- **[SHIPPED] v1.0 MVP** -- Phases 1-10 (incl. 5.1-5.6), shipped 2026-06-01 at plugin 1.0.0. Full detail: [milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md). Requirements: [milestones/v1.0-REQUIREMENTS.md](milestones/v1.0-REQUIREMENTS.md). Audit: [milestones/v1.0-MILESTONE-AUDIT.md](milestones/v1.0-MILESTONE-AUDIT.md).
- **[SHIPPED] v1.0.1 No review report shorthands** -- Phases 11-13, shipped 2026-06-11 at plugin 1.0.1 (PR #1 merged). Full detail: [milestones/v1.0.1-ROADMAP.md](milestones/v1.0.1-ROADMAP.md). Requirements: [milestones/v1.0.1-REQUIREMENTS.md](milestones/v1.0.1-REQUIREMENTS.md). Audit: [milestones/v1.0.1-MILESTONE-AUDIT.md](milestones/v1.0.1-MILESTONE-AUDIT.md).
- **[SHIPPED] v2.0.0 Prefixed skill names** -- Phases 14-15 (incl. 14.1, 14.2), shipped 2026-06-14 at plugin 2.0.0 (PR #2 merged). Breaking `lz-` skill rename (de-shadow built-in `/plan` / `/review` / `/security-review`) + release. Full detail: [milestones/v2.0.0-ROADMAP.md](milestones/v2.0.0-ROADMAP.md). Requirements: [milestones/v2.0.0-REQUIREMENTS.md](milestones/v2.0.0-REQUIREMENTS.md). Audit: [milestones/v2.0.0-MILESTONE-AUDIT.md](milestones/v2.0.0-MILESTONE-AUDIT.md).

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

<details>
<summary>[SHIPPED] v2.0.0 Prefixed skill names (Phases 14-15, incl. 14.1, 14.2) -- 2026-06-14, plugin 2.0.0</summary>

**Goal:** Fix the critical built-in-command shadowing bug by prefixing all four skills with `lz-`, shipped as a breaking (MAJOR) release.

- [x] Phase 14: lz- skill rename -- all four skills `git mv`'d to the `lz-` prefix (history preserved), de-shadowing the built-in `/plan` / `/review` / `/security-review`; lockstep cross-ref sweep + GREEN `git grep` gate; bare-form de-shadow human picker-confirmed (RENAME-01..03) (completed 2026-06-13)
- [x] Phase 14.1: lz-security-review canonical severities (INSERTED) -- security-review migrated to the canonical pentest 5-tier scale Critical/High/Medium/Low/Informational + Open Questions (omit-when-empty), scoped to security-review only (SEV-AGNT-01..04, SEV-SKILL-01, SEV-FIX-01, SEV-DOC-01, SEV-SCOPE-01) (completed 2026-06-14)
- [x] Phase 14.2: Verdict scope marker label rename (INSERTED) -- `**Verdict scope:**` -> `**Verdict axis:**` across 5 surfaces, machine `scope:` token frozen byte-intact (VLABEL-01, VLABEL-02) (completed 2026-06-14)
- [x] Phase 15: v2.0.0 release & publication -- atomic 5-surface 1.0.1 -> 2.0.0 bump + CHANGELOG `[2.0.0]` migration table + README + PR #2 true merge commit + `v2.0.0` tag + GitHub Release (Latest) (REL-01..03) (completed 2026-06-14)

Full phase details, success criteria, and decision logs are archived in [milestones/v2.0.0-ROADMAP.md](milestones/v2.0.0-ROADMAP.md). Final status: all 8 in-scope + 8 inserted-scope requirements satisfied (see the audit); deferred items recorded in STATE.md.

</details>

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-10 (v1.0) | v1.0 MVP | 80/80 | Complete | 2026-06-01 |
| 11-13 (v1.0.1) | v1.0.1 | 13/13 | Complete | 2026-06-08 |
| 14-15 (v2.0.0, incl. 14.1, 14.2) | v2.0.0 | 4/4 | Complete | 2026-06-14 |

v1.0 + v1.0.1 + v2.0.0 shipped (plugin 2.0.0). **No active milestone** -- start the next cycle with `/gsd-new-milestone`. See `.planning/MILESTONES.md` for shipped-milestone summaries and `milestones/` for full detail.
