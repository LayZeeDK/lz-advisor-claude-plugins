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
- [ ] **Phase 12: Atomic grouped-grammar rewrite** - Both agents + both skill contracts + context-packaging sync rewritten to the grouped spelled-out shape in one unit, with lockstep fixture retarget and the 5-surface version bump
- [ ] **Phase 13: Empirical verification** - Headless `claude -p` UAT proves grouped spelled-out reports reach rendered output on both review skills; residue + history-preservation sweep

## Phase Details

### Phase 11: Fixture baseline
**Goal**: The two budget smoke fixtures exist as committed, tracked tests that pass green against the CURRENT shorthand grammar, establishing a regression baseline before any grammar change.
**Depends on**: Phase 10 (v1.0 milestone complete)
**Requirements**: GATE-01
**Success Criteria** (what must be TRUE):
  1. `D-reviewer-budget.sh` (3-slot `FRAGMENT_RE` for `crit`/`imp`/`sug`/`q`) and `D-security-reviewer-budget.sh` (4-slot, OWASP `[Axx]` bracket preserved) exist as committed files in the repo (they currently live nowhere on disk)
  2. Both fixtures exit 0 (green) when run against the current shorthand-grammar agent prompts
  3. Each fixture carries an anti-vacuous-pass assertion (`matched_count >= min`) that runs BEFORE the word-budget loop, so a regex matching zero findings fails instead of passing silently
  4. The fixtures match the documented 3-slot / 4-slot FRAGMENT_RE shape from the Phase 08 fixture decisions (parser extracts findings from the two-inline-code-span emission shape)
**Plans**: 2 plans
- [x] 11-01-PLAN.md -- Author tests/D-reviewer-budget.sh (3-slot reviewer budget smoke fixture, green on HEAD)
- [x] 11-02-PLAN.md -- Author tests/D-security-reviewer-budget.sh (4-slot OWASP security budget smoke fixture, 75w auto-clarity carve-out)

### Phase 12: Atomic grouped-grammar rewrite
**Goal**: Both review agents emit findings grouped under fully spelled-out severity headlines, every worked example agrees with the new grammar, the skill render-verbatim contract carries the new headers through intact, the fixtures retarget in lockstep, and the cross-surface vocabulary stays consistent -- all in one atomic unit with the version bump.
**Depends on**: Phase 11
**Requirements**: RPT-01, RPT-02, RPT-03, RPT-04, AGNT-01, AGNT-02, AGNT-03, SKILL-01, SYNC-01, SYNC-02
**Success Criteria** (what must be TRUE):
  1. The reviewer agent's Output Constraint grammar AND all worked examples emit findings under `### Critical` / `### Important` / `### Suggestions` / `### Questions` headlines with no `crit:`/`imp:`/`sug:`/`q:` shorthand and no `(formerly High)`/`(formerly Medium)` residue (RPT-01, AGNT-01)
  2. The security-reviewer agent emits findings under the same unified spelled-out headlines with per-finding OWASP `[Axx]` tags preserved, and findings carry stable continuous numbers across severity sections so ordinal cross-references in `Per-finding validation` / `Cross-Cutting Patterns` / `Threat Patterns` stay unambiguous (RPT-02, RPT-03)
  3. Empty severity sections render an explicit `(none)` marker; word-budget sub-caps are re-scoped coherently to the grouped section shape with aggregate budget intent unchanged (RPT-04, AGNT-02)
  4. Existing validated behaviors survive the regrouping: Hedge Marker Discipline frames, the Class-2 Escalation Hook, and `<verify_request>` blocks whose `severity=` attributes stay lowercase machine-lexicon; both skills' "Do NOT reformat into severity groups" clause is replaced by the new grouped headers as the literal verbatim headers that must reach the user, with render-verbatim preserved as absolute (AGNT-03, SKILL-01)
  5. `references/context-packaging.md` severity-vocab surfaces are aligned with the grouped grammar via a per-surface disposition table covering every `git grep` hit (change vs keep-as-history; `.planning/` history left untouched), the budget fixtures retarget to the full-word grammar in the same unit (RED on old shorthand, GREEN on new sample), and the version bump 1.0.0 -> 1.0.1 lands atomically across all 5 surfaces (SYNC-01, SYNC-02)
**Plans**: 4 plans
- [ ] 12-01-PLAN.md -- Rewrite reviewer.md to grouped grammar + retarget D-reviewer-budget.sh in lockstep (RPT-01/03/04, AGNT-01/02/03)
- [ ] 12-02-PLAN.md -- Rewrite security-reviewer.md (OWASP [Axx] + CVE carve-out + strip formerly-X) + retarget D-security-reviewer-budget.sh (RPT-02/03/04, AGNT-01/02/03)
- [ ] 12-03-PLAN.md -- Invert both skills' verbatim prohibition + align context-packaging.md disposition + execute/SKILL.md precision edit (SKILL-01, SYNC-01)
- [ ] 12-04-PLAN.md -- Atomic 5-surface 1.0.0 -> 1.0.1 bump + README changelog + phase-atomicity completeness gate (SYNC-02 + RPT-01/02, AGNT-01, SYNC-01 residue sweep)
**UI hint**: yes

### Phase 13: Empirical verification
**Goal**: Behavioral and budget evidence confirms the rewritten grammar actually reaches the rendered user-facing report on both review skills, the budget stays within cap on the new grammar, and no unintended shorthand residue or `.planning/` history corruption slipped in.
**Depends on**: Phase 12
**Requirements**: GATE-02
**Success Criteria** (what must be TRUE):
  1. A headless `claude -p /lz-advisor:review` run produces a rendered report containing the full grouped spelled-out severity headlines and zero `crit:`/`imp:`/`sug:`/`q:` shorthand
  2. A headless `claude -p /lz-advisor:security-review` run produces the same grouped spelled-out shape with OWASP `[Axx]` tags preserved and zero shorthand
  3. The ngx-smart-components UAT runs in a dedicated worktree branched from the `uat/pre-storybook-compodoc` checkpoint branch (exact name verified at plan time; that repo has active work in progress)
  4. An empirical n>=3 budget-gate run on the new grammar confirms both agents stay within the word-budget cap (measured, not reasoned from `wc -w` neutrality)
  5. A scoped `git grep` confirms no unintended `crit:|imp:|sug:|q:` residue anywhere in `plugins/lz-advisor/`, and the vocabulary sweep touches NO frozen v1.0 history artifacts (`.planning/milestones/`, archived phase summaries, UAT traces) -- historical shorthand references stay as accurate history per the Phase 9 precedent; new v1.0.1 planning artifacts (plans, summaries, STATE/ROADMAP updates) are exempt
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 11 -> 12 -> 13

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-10 (v1.0) | v1.0 MVP | 80/80 | Complete | 2026-06-01 |
| 11. Fixture baseline | v1.0.1 | 2/2 | Complete    | 2026-06-07 |
| 12. Atomic grouped-grammar rewrite | v1.0.1 | 0/4 | Planned | - |
| 13. Empirical verification | v1.0.1 | 0/TBD | Not started | - |

v1.0 shipped: 16 phases, 80 plans, plugin 1.0.0. See `.planning/MILESTONES.md` for the summary and `milestones/v1.0-ROADMAP.md` for full detail.
