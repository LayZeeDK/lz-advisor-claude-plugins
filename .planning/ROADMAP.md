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
- [x] **Phase 13: Empirical verification** - Headless `claude -p` UAT proves grouped spelled-out reports reach rendered output on both review skills; residue + history-preservation sweep (completed 2026-06-08)

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
**Plans**: 7 plans (3 original + 4 gap-closure: 2 for GAP-13-BUDGET, 2 for GAP-13-BUDGET-R2)
- [x] 13-01-PLAN.md -- Provision the dedicated ngx worktree off the confirmed checkpoint + seed reviewable slices + evidence dir (SC-3 substrate, Wave 0)
- [x] 13-02-PLAN.md -- Live `claude -p` captures + dual extraction (SHAPE/BUDGET) + per-run grading + Pass@k/Pass^k (SC-1, SC-2 PASS 6/6; SC-4 budget FAIL 4/6 over-cap -> gap-closure)
- [x] 13-03-PLAN.md -- Residue + formerly-X sweep (SC-5 PASS, exit 1) + worktree teardown (D-08) + consolidated 13-UAT.md (GATE-02 closeout; verdict MIXED -- SC-1/2/3/5 PASS, SC-4 FAIL = GAP-13-BUDGET)
- [x] 13-04-PLAN.md -- [gap-closure, wave 1] Atomic agent-contract concision tightening: FIX-1..4 to reviewer.md + security-reviewer.md (route severity-rationale to Per-finding validation, split-findings, reference-by-location, resolve auto-clarity carve-out scope); cap UNCHANGED; SHAPE + AGNT-03 byte-intact; both budget fixtures stay GREEN
- [x] 13-05-PLAN.md -- [gap-closure, wave 2, depends_on 13-04] Re-measured SC-4 on live output (n=5 per skill against the FIXED agents, R2 worktree off 019a26a): combined fully-passing c=2/6 -> 7/10 (LARGE improvement; security half 0/3 -> 4/5; worst overshoot 46w -> 33w) but SC-4 NOT fully GREEN -- 3/10 runs retain a residual over-cap (GAP-13-BUDGET-R2). Pass@k recomputed; R2 worktree torn down (D-08); 13-UAT.md updated. SC-4 stays issue (D-10 honest), NOT marked PASS.
- [x] 13-06-PLAN.md -- [gap-closure, wave 1, GAP-13-BUDGET-R2] Atomic iteration-2 concision fix LANDED: FIX-R2-A (reviewer Question elaboration -> existing 60w `### Per-finding validation`, NO new carve-out, per 13-GAP-RESEARCH Q3 option (b)) + FIX-R2-B (security fix/remediation clause reference-by-shape -- name the safe API, drop the call expression + second clause) + FIX-R2-C (reviewer causal-chain terseness nudge). WRONG->RIGHT worked examples modeled on r2-review-4 (45w->24w + 45w PFV), r2-review-3 (29w->15w + consequence to Cross-Cutting), r2-security-1 (33w->27w). Caps (22/28/75/60) UNCHANGED; fixtures UNMODIFIED (`git status --porcelain tests/` empty -- the close is genuine, the gate is not gamed); SHAPE + AGNT-03 byte-intact; reviewer has NO 75w carve-out. WR-05 atomicity gate GREEN. FIX-R2-D (gate tolerance band) recorded as a flagged DEFERRED product-contract decision, NOT done here. (completed 2026-06-08)
- [x] 13-07-PLAN.md -- [gap-closure, wave 2, depends_on 13-06, GAP-13-BUDGET-R2] Third SC-4 live re-measure (GATE-02 closeout): re-provision a fresh worktree off 019a26a on `uat/phase-13-render-r3`, recover seeds byte-identical from dangling commit 4fa7fd7, run n>=3 `claude -p` captures per skill against the 13-06 FIXED agents, run `tests/D-*-budget.sh --from-trace` under the UNCHANGED hard gate (EXPECT exit 0), recompute Pass@k, write evidence before teardown (D-08), update 13-UAT.md. HONEST-REPORTING: a residual stray is recorded faithfully (it is itself the evidence for the deferred FIX-R2-D gate-structure question), never re-worded or gamed.

**Phase 13 verdict (5 plans executed; 2 gap-closure plans queued):** MIXED -- the milestone goal (no shorthands in user-facing reports) is EMPIRICALLY ACHIEVED (SHAPE 10/10 on the R2 re-measure, Pass^k=1.0; SC-1/SC-2/SC-3/SC-5 PASS). GATE-02 is **STILL NOT green**: the 13-04 concision fix + 13-05 re-measure IMPROVED SC-4 from 2/6 to 7/10 LIVE fully-passing, but 3/10 runs retained a residual over-cap (GAP-13-BUDGET-R2: reviewer multi-clause Question with no carve-out 45w; verbose security FIX-clause prose 30-33w; marginal reviewer deref-chain 29w). The iteration-2 close is now planned: 13-06 (FIX-R2-A/B/C atomic concision fix, fixtures unchanged) + 13-07 (third live re-measure). FIX-R2-D (the 13-GAP-RESEARCH gate-tolerance-band recommendation) is recorded as a flagged DEFERRED product-contract decision for the user to settle deliberately, NOT implemented in this close. Phase 13 stays **needs-review** until the third re-measure is GREEN on every run (or an honest residual is recorded and the FIX-R2-D decision is surfaced).

## Progress

**Execution Order:**
Phases execute in numeric order: 11 -> 12 -> 13

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-10 (v1.0) | v1.0 MVP | 80/80 | Complete | 2026-06-01 |
| 11. Fixture baseline | v1.0.1 | 2/2 | Complete    | 2026-06-07 |
| 12. Atomic grouped-grammar rewrite | v1.0.1 | 4/4 | Complete    | 2026-06-07 |
| 13. Empirical verification | v1.0.1 | 7/7 | Complete   | 2026-06-08 |

v1.0 shipped: 16 phases, 80 plans, plugin 1.0.0. See `.planning/MILESTONES.md` for the summary and `milestones/v1.0-ROADMAP.md` for full detail.
