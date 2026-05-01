---
status: gaps_found
phase: 07-address-all-phase-5-x-and-6-uat-findings
type: verification
plugin_version: 0.10.0
gate_verdict: GAPS_FOUND_within_phase
score: "structural plans landed (6/6); empirical residuals on 2 of 5 plans require gap-closure"
verification_basis: 8-session UAT replay on plugin 0.10.0 against ngx-smart-components testbed (Compodoc + Storybook 10 + Angular signals scenario)
session_notes: .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/uat-replay/session-notes.md
amendment_6: .planning/phases/06-address-phase-5-6-uat-findings/06-VERIFICATION.md (sixth amendment, dated 2026-05-01)
started: 2026-04-30
ended: 2026-05-01
---

# Phase 7 Verification -- 8-Session UAT Replay on Plugin 0.10.0

## Goal-backward verification

**Phase 7 goal:** Address all Phase 5.x and 6 UAT findings (Findings A, B.1+B.2, C, D, E, F, H + GAP-G1+G2-empirical from Phase 6 amendment 5).

**Empirical verification basis:** 8-session UAT replay chain against ngx-smart-components testbed on plugin 0.10.0:

| # | Skill | Session ID |
|---|-------|-----------|
| 1 | lz-advisor.plan | `f2d669f3-...` |
| 2 | lz-advisor.execute | `6276171a-...` |
| 3 | lz-advisor.review | `a1503efa-...` |
| 4 | lz-advisor.plan (plan-fixes) | `0d55118f-...` |
| 5 | lz-advisor.execute (execute-fixes) | `29db446f-...` |
| 6 | lz-advisor.security-review | `2b5f3ae5-...` |
| 7 | lz-advisor.plan (plan-fixes-2) | `bfa913fa-...` |
| 8 | lz-advisor.execute (execute-fixes-2) | `b614d3dd-...` |

Per-session evidence in `uat-replay/session-notes.md`. Smoke gate: 6 PASS, 3 FAIL (5 NEW Phase 7 fixtures all PASS; 3 pre-existing failures classified). Full closure narrative in `06-VERIFICATION.md` amendment 6.

## Verification verdict by plan

| Plan | Goal | Status | Evidence |
|------|------|--------|----------|
| 07-01 (pv-* validation + ToolSearch supplement) | GAP-G1+G2-empirical CLOSED at synthesis layer | **PASSED structurally + partial empirical** | B-pv-validation.sh PASS on 0.10.0 (4/4 assertions). 9 source-grounded pv-* blocks across sessions 1, 3, 6. ToolSearch precondition fired in 2 of 8 sessions (sessions 1 + 3) — first empirical confirmations across 8+ UAT cycles since Phase 5. **GAP: rule did not fire in 6 of 8 sessions** (see Within-Phase Gaps below) |
| 07-02 (verify-before-commit + hedge marker + silent-resolve + Finding A) | Plan-step shape rule (E.2) + hedge discipline (E.1) + silent-resolve sub-pattern + reconciliation extension | **PASSED on most surfaces, ambiguity on wip-discipline** | Hedge marker discipline empirically firing in 6 of 8 sessions. Silent-resolve sub-pattern CLOSED in BOTH plan-fixes UATs (sessions 4 + 7). Verify-before-commit progressively correct (sessions 2 → 5 → 8). Session 8 first conformant Verified: trailer in single-commit. **GAP: wip-discipline scope ambiguity** (see Within-Phase Gaps below) |
| 07-03 (4 confidence-laundering guards + scope-disambiguated provenance markers) | Finding C closure | **PASSED** | Verdict scope markers across all 8 sessions (5 api-correctness + 3 security-threats). Cross-axis verdict scope inheritance robust across plan + execute (sessions 7 + 8) |
| 07-04 (word-budget structural sub-caps + 3 D-*-budget smoke fixtures) | Finding D closure | **PASSED structurally** | All 3 D-*-budget smoke fixtures PASS on 0.10.0. Per-section sub-caps mostly enforced; aggregate cap exceeded on code-dense outputs across 4 of 8 sessions. Improvement trajectory (135w → 95w final advisor in session 8) |
| 07-05 (reviewer Class-2 escalation hook Option 1 + Option 2) | Finding F closure | **PASSED** | Pre-emptive Class-2/2-S scan fired in sessions 3 + 6. Reviewer accepted pv-* anchors in both. Zero `<verify_request>` escalations needed (Option 1 + Option 2 working in tandem) |
| 07-06 (plugin 0.10.0 + E-verify smoke + UAT replay + Amendment 6) | Verification stage | **PASSED** | All 5 tasks complete: plugin bumped 0.9.0 → 0.10.0 (5 surfaces), E-verify smoke fixture PASS, UAT replay infrastructure copied + extended, 8-session UAT chain executed, 06-VERIFICATION.md amendment 6 appended |

## Within-Phase Gaps (gap-closure plans needed BEFORE phase complete)

These two residuals are real Plan 07-01 / Plan 07-02 design defects empirically surfaced by the 8-session UAT chain. Both are within-Phase-7 scope (refining plans landed in Phase 7) and benefit from gap-closure plans before Phase 7 is sealed.

### Gap 1: Plan 07-01 ToolSearch precondition rule does not reliably fire

**Severity:** MAJOR (recurring across 6 of 8 UAT sessions)

**Surface:** `plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md`, `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md`, `plugins/lz-advisor/skills/lz-advisor.review/SKILL.md`, `plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md` (byte-identical `<context_trust_contract>` block, ToolSearch availability rule)

**Evidence:** Sessions 2 (execute), 4 (plan-fixes), 5 (execute-fixes), 6 (security-review), 7 (plan-fixes-2), 8 (execute-fixes-2) all skipped ToolSearch despite agent-generated source material on Class 2/3/4 questions. Sessions 1 (plan) + 3 (review) fired correctly. The strict-text reading of the rule ("ToolSearch precondition fires regardless of whether the orient ranking has classified the question yet") isn't holding empirically.

**Possible fix surfaces** (for gap-closure plan to research):
- Rephrase the rule with more concrete trigger language and a worked example
- Convert from precondition (text-steered) to default-on Phase 1 action whenever any agent-generated source material is detected
- Add hook-based enforcement (PreToolUse on Agent invocation) that auto-invokes ToolSearch when agent-generated source is detected
- Add a non-text steering mechanism (advisor refusal-pattern, hard skill-prefix, or reference-doc cue)

**Reference:** session-notes.md Phase 7 GAPS sections (sessions 2, 4, 5, 6, 7, 8) + `06-VERIFICATION.md` amendment 6 residual #1.

### Gap 2: Plan 07-02 wip-discipline scope ambiguity

**Severity:** MAJOR (2 empirical instances: sessions 2 + 5; session 8 got it right)

**Surface:** `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` `<verify_before_commit>` Phase 3.5 section, specifically the "Cost-cliff allowance for long-running async validations" subsection

**Evidence:** Session 2 commit `8c25c9e` and session 5 commit `06af4cf` both shipped non-wip commits with populated `## Outstanding Verification` sections. Per Plan 07-02 cost-cliff allowance: *"Long-running async validations move to a `wip:` prefixed commit + `## Outstanding Verification` section in the commit body listing the pending checks."* The executor's interpretation: "this commit's own claims are verified, so non-wip is fine even if some other concern is pending". Strict text reading: when `## Outstanding Verification` is present, subject MUST be `wip:`-prefixed.

**Possible fix surfaces** (for gap-closure plan to research):
- Tighten Plan 07-02 SKILL.md text per P8-13 hypothesis: *"When a commit body contains `## Outstanding Verification` section listing pending Run: directives, the commit subject MUST use `wip:` prefix UNLESS the commit ONLY records additional `Verified: <claim>` trailers for already-listed Outstanding items."*
- Update `E-verify-before-commit.sh` smoke fixture path-c to require the wip + Outstanding Verification conjunction (catches the gap empirically)
- Add a worked example to the SKILL.md showing both correct (wip: with Outstanding Verification) and incorrect (non-wip with Outstanding Verification) shapes

**Reference:** session-notes.md Session 2 + Session 5 GAPS rows + P8-13 candidate + `06-VERIFICATION.md` amendment 6 residual #2.

## Out-of-Phase Residuals (defer to Phase 8 or accept as PASS-with-residual)

These three MAJOR residuals + 22 Phase 8 candidates are NOT in-phase Plan 07-01..07-05 design defects. They are either:

- Capability extensions beyond Phase 7's documented scope (e.g., P8-03 Pre-Verified Contradiction Rule would be a 5th confidence-laundering guard; Plan 07-03 had 4)
- New patterns/heuristics surfaced by the empirical chain (e.g., P8-12 plan-fixes auto-detection from review file path)
- Cross-skill workflow concerns (P8-19 + P8-21 cross-axis scope inheritance)
- Positive observations validating existing design (P8-11, P8-14, P8-16)

| # | Residual | Phase 8 candidate ID | Why deferred |
|---|----------|----------------------|--------------|
| 3 | Cross-Skill Hedge Tracking gap (session 5 input mismatch) | P8-12 | Trust-contract heuristic addition (auto-detect plan-fixes plan from review file path); not a defect of any landed Plan 07-01..07-05, more of a NEW capability |
| 4 | Reconciliation rule NOT invoked when advisor reframes a packaged claim (sessions 2 + 7) | P8-03 (strongest Phase 8 candidate) | Pre-Verified Contradiction Rule would be a 5th confidence-laundering guard. Plan 07-03 had 4; this is a new guard, not a refinement |
| 5 | Self-anchor pattern (Finding H) leaks through advisor narrative SD prose | P8-18 | Plan 07-01 Rule 5b applies to `<pre_verified>` XML blocks; advisor narrative claims aren't pv-* shaped. Mixed: could refine Rule 5b OR add new rule. Defer until empirical investigation of advisor narrative-SD self-anchor frequency |

Plus 4 MINOR residuals (word-budget aggregate, Verified: format inconsistency in early commits, Class 2-S step-1-sufficient short-circuit, Phase 2 pre-execute consult skip in session 8) and 19 Phase 8 candidates spanning capability extensions, positive observations, and design-tradeoff documentation tasks.

Full Phase 8 candidate list: `uat-replay/session-notes.md` Phase 7 Closure Verdict section.

## Recommended next action

Run `/gsd-plan-phase 7 --gaps` to create gap-closure plans for the two within-Phase-7 gaps (07-07 ToolSearch rule strengthening, 07-08 wip-discipline language tightening). After gap closure, mark Phase 7 complete (PASS-with-residual; residuals 3, 4, 5 + 22 candidates handed off to hypothetical Phase 8).
