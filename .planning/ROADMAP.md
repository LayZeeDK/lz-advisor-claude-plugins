# Roadmap: lz-advisor

## Milestones

- **[SHIPPED] v1.0 MVP** -- Phases 1-10 (incl. 5.1-5.6), shipped 2026-06-01 at plugin 1.0.0. Full detail: [milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md). Requirements: [milestones/v1.0-REQUIREMENTS.md](milestones/v1.0-REQUIREMENTS.md). Audit: [milestones/v1.0-MILESTONE-AUDIT.md](milestones/v1.0-MILESTONE-AUDIT.md).
- **[ACTIVE] v1.0.1 No review report shorthands** -- Phases 11-13, plugin 1.0.0 -> 1.0.1. Review and security-review reports present findings under fully spelled-out severity headlines instead of the `crit:`/`imp:`/`sug:`/`q:` fragment-grammar shorthands.

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

### [ACTIVE] v1.0.1 No review report shorthands (Phases 11-13)

**Milestone Goal:** Review and security-review reports present findings grouped under fully spelled-out severity headlines (`### Critical` / `### Important` / `### Suggestions` / `### Questions`) instead of the `crit:`/`imp:`/`sug:`/`q:` fragment-grammar shorthands, so reports are clear to the user -- without breaking the render-verbatim contract or the word-budget regression gates.

**Locked decisions (from milestone questioning + research):** Route A (agents emit the grouped spelled-out shape directly; render-verbatim contract stays absolute); Section-per-severity layout with explicit `(none)` markers and continuous finding numbers; Unified Critical/Important/Suggestion/Question vocabulary across both skills (the decided Phase 7 lexicon); plugin version 1.0.0 -> 1.0.1.

- [x] **Phase 11: Fixture baseline** - Re-author the missing budget smoke fixtures as tracked tests, green on the CURRENT shorthand grammar (regression gate before any change) (completed 2026-06-07)
- [x] **Phase 12: Atomic grouped-grammar rewrite** - Both agents + both skill contracts + context-packaging sync rewritten to the grouped spelled-out shape in one unit, with lockstep fixture retarget and the 5-surface version bump (completed 2026-06-07)
- [ ] **Phase 13: Empirical verification** - Headless `claude -p` UAT proves grouped spelled-out reports reach rendered output on both review skills; residue + history-preservation sweep

## Phase Details

### Phase 13: Empirical verification
**Goal**: Behavioral and budget evidence confirms the rewritten grammar actually reaches the rendered user-facing report on both review skills, the budget stays within cap on the new grammar, and no unintended shorthand residue or `.planning/` history corruption slipped in.
**Depends on**: Phase 12
**Requirements**: GATE-02
**Success Criteria** (what must be TRUE):
  1. A headless `claude -p /lz-advisor:review` run produces a rendered report containing the full grouped spelled-out severity headlines and zero `crit:`/`imp:`/`sug:`/`q:` shorthand
  2. A headless `claude -p /lz-advisor:security-review` run produces the same grouped spelled-out shape with OWASP `[Axx]` tags preserved and zero shorthand
  3. The ngx-smart-components UAT runs in a dedicated worktree branched from the checkpoint branch (spec named `uat/pre-storybook-compodoc`, which does NOT exist; **plan-time-confirmed checkpoint: `lz-advisor-compodoc-storybook-uat-base` @ `019a26a`** -- worktree on a NEW throwaway branch `uat/phase-13-render`, never on ngx `main`)
  4. An empirical n>=3 budget-gate run on the new grammar confirms both agents stay within the word-budget cap (measured, not reasoned from `wc -w` neutrality)
  5. A scoped `git grep` confirms no unintended `crit:|imp:|sug:|q:` residue anywhere in `plugins/lz-advisor/`, and the vocabulary sweep touches NO frozen v1.0 history artifacts (`.planning/milestones/`, archived phase summaries, UAT traces) -- historical shorthand references stay as accurate history per the Phase 9 precedent; new v1.0.1 planning artifacts (plans, summaries, STATE/ROADMAP updates) are exempt
**Plans**: 5 plans (3 original + 2 gap-closure for GAP-13-BUDGET)
- [x] 13-01-PLAN.md -- Provision the dedicated ngx worktree off the confirmed checkpoint + seed reviewable slices + evidence dir (SC-3 substrate, Wave 0)
- [x] 13-02-PLAN.md -- Live `claude -p` captures + dual extraction (SHAPE/BUDGET) + per-run grading + Pass@k/Pass^k (SC-1, SC-2 PASS 6/6; SC-4 budget FAIL 4/6 over-cap -> gap-closure)
- [x] 13-03-PLAN.md -- Residue + formerly-X sweep (SC-5 PASS, exit 1) + worktree teardown (D-08) + consolidated 13-UAT.md (GATE-02 closeout; verdict MIXED -- SC-1/2/3/5 PASS, SC-4 FAIL = GAP-13-BUDGET)
- [x] 13-04-PLAN.md -- [gap-closure, wave 1] Atomic agent-contract concision tightening: FIX-1..4 to reviewer.md + security-reviewer.md (route severity-rationale to Per-finding validation, split-findings, reference-by-location, resolve auto-clarity carve-out scope); cap UNCHANGED; SHAPE + AGNT-03 byte-intact; both budget fixtures stay GREEN
- [ ] 13-05-PLAN.md -- [gap-closure, wave 2, depends_on 13-04] Re-measure SC-4 on live output: re-provision the deterministic UAT substrate, n>=3 `claude -p` captures per skill against the FIXED agents, `--from-trace` budget gate (expect GREEN), recompute Pass@k, teardown, update 13-UAT.md to SC-4 PASS (GATE-02 closeout)

**Phase 13 verdict (all 3 plans executed):** MIXED -- the milestone goal (no shorthands in user-facing reports) is EMPIRICALLY ACHIEVED (SHAPE 6/6, Pass^k=1.0; SC-1/SC-2/SC-3/SC-5 PASS). GATE-02 is **NOT yet green**: SC-4 FAILS (per-finding 28-word budget exceeded on live emission, 4/6 runs = GAP-13-BUDGET), routed to a Phase 12.x gap-closure REPLAN per D-10. Phase 13 remains **needs-review** pending GAP-13-BUDGET disposition + phase VERIFICATION + a user decision.

## Progress

**Execution Order:**
Phases execute in numeric order: 11 -> 12 -> 13

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-10 (v1.0) | v1.0 MVP | 80/80 | Complete | 2026-06-01 |
| 11. Fixture baseline | v1.0.1 | 2/2 | Complete    | 2026-06-07 |
| 12. Atomic grouped-grammar rewrite | v1.0.1 | 4/4 | Complete    | 2026-06-07 |
| 13. Empirical verification | v1.0.1 | 4/5 | In Progress|  |

v1.0 shipped: 16 phases, 80 plans, plugin 1.0.0. See `.planning/MILESTONES.md` for the summary and `milestones/v1.0-ROADMAP.md` for full detail.
