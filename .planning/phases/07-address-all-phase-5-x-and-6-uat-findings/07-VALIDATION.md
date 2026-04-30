---
phase: 07
slug: address-all-phase-5-x-and-6-uat-findings
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-30
---

# Phase 07 -- Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Bash + `rg` smoke fixtures + `claude -p` UAT replay (no JS test framework -- plugin is Markdown / YAML only) |
| **Config file** | none -- each smoke fixture is self-contained Bash script under `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/` |
| **Quick run command** | `bash .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/<fixture>.sh` (single fixture per invocation) |
| **Full suite command** | `for f in .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/*.sh; do bash "$f" || true; done` (planner may add a `run-all-smokes.sh` orchestrator) |
| **Estimated runtime** | smoke suite ~30-60s; UAT replay subset ~5-15min depending on session count |

---

## Sampling Rate

- **Per task commit:** Run the smoke fixture for the rule landing in that task (Plan 07-04 commits run `D-{advisor,reviewer,security-reviewer}-budget.sh`; Plan 07-02 commits run `E-verify-before-commit.sh`; Plan 07-01 commits run `B-pv-validation.sh`)
- **Per wave merge:** Full smoke suite (`for f in *.sh; do bash "$f"; done`) plus 1 UAT replay session on representative fixture
- **Phase gate (`/gsd-verify-work`):** Full smoke suite green AND full UAT replay subset green (minimum: plan-fixes + execute-fixes + security-review on plugin 0.10.0)
- **Max feedback latency:** smoke <60s; UAT replay session <15min

---

## Per-Task Verification Map

> Note: Phase 7 has no REQ-XX requirements mapped (none in REQUIREMENTS.md for this phase). The acceptance criteria source is CONTEXT.md decisions D-01..D-07 plus the 11 findings (A, B.1, B.2, C, D, E.1, E.2, F, G, H, silent-resolve) + 1 empirical gap (GAP-G1+G2) from RESEARCH.md. Task IDs below assume planner numbering `{plan}-{task}`; actual task IDs locked when PLAN.md files land.

| Finding | Plan | Wave | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|------------|-----------------|-----------|-------------------|-------------|--------|
| FIND-A | 07-02 | 1 | -- | Reconciliation policy fires on apply-then-revert flow | UAT replay | execute-fixes UAT scenario with override + applied-then-reverted setup | partial -- existing `uat-pattern-d-replay/` infra; Plan 07-06 adapts | pending |
| FIND-B.1 | 07-01 | 1 | -- | pv-* synthesis fires for orient-phase empirical findings (>=1 per material Read or WebFetch) | smoke + UAT | `bash B-pv-validation.sh` (Assertion 2) + UAT replay | NO -- B-pv-validation.sh NEW (Plan 07-01 + 07-06) | pending |
| FIND-B.2 | 07-01 | 1 | -- | pv-* uses canonical XML format (no plain-bullet "Pre-verified Claims" sections) | smoke + UAT | `bash B-pv-validation.sh` (Assertion 1) | NO -- new | pending |
| FIND-C | 07-03 | 2 | T-confidence-laundering / Tampering | 4 confidence-laundering guards present in Common Contract; cross-skill hedge tracking; version-qualifier rule fires; scope-disambiguated provenance markers | smoke + UAT replay | `git grep -l "Hedge propagation" plugins/lz-advisor/` + UAT replay multi-hop chain fixture | partial -- structural assertion via `git grep`; UAT via Plan 07-06 | pending |
| FIND-D | 07-04 | 2 | -- | advisor SD <=100w; reviewer Findings <=80w each, CCP <=160w, Missed-surfaces <=30w, total <=300w; security-reviewer same shape | smoke (3 fixtures) | `bash D-advisor-budget.sh && bash D-reviewer-budget.sh && bash D-security-reviewer-budget.sh` | NO -- 3 NEW fixtures (Plan 07-04) | pending |
| FIND-E.1 | 07-02 | 1 | T-verify-skip / Tampering | Advisor refuse-or-flag rule fires; literal "Unresolved hedge: X. Verify Y..." frame in advisor SD on hedge-marker source material | smoke + UAT | `bash E-verify-before-commit.sh` (Assertion a) | NO -- new | pending |
| FIND-E.2 | 07-02 | 1 | T-verify-skip / Tampering | Plan-step-shape rule executes Run: directives as Bash before commit; cost-cliff allowance for long-running async (wip: + Outstanding Verification) | smoke + UAT | `bash E-verify-before-commit.sh` (Assertions b + c) | NO -- new | pending |
| FIND-F | 07-05 | 2 | T-subagent-privilege / Elevation of Privilege | Reviewer escalation hook emits structured `<verify_request>` block; executor parses + re-invokes one-shot (no tool-grant extension) | smoke + UAT | UAT replay review-skill scenario with Class-2 question; `rg '<verify_request question="' OUT_F` | partial -- DEF-response-structure.sh F slot; Plan 07-05 extends | pending |
| FIND-G | 07-02 | 1 | -- | Review-skill scan criterion flags hedged claims without `Verified:` trailer or pv-* anchor | smoke + UAT | UAT replay review-skill scenario with hedged input + missing trailer fixture | partial -- new criterion in lz-advisor.review/SKILL.md; UAT validates | pending |
| FIND-H | 07-01 | 1 | T-self-anchor / Repudiation | pv-* `<evidence>` cites session-grounded source; no self-anchor evidence (`method="prior knowledge"`, etc.) | smoke + UAT | `bash B-pv-validation.sh` (Assertion 3) | NO -- new | pending |
| FIND-silent-resolve | 07-02 | 1 | -- | Plan-skill output addresses ALL numbered input findings (explicit disposition for each) | smoke + UAT | UAT replay plan-fixes scenario with N-finding input; assert `## Findings Disposition` section enumerates N items | partial -- new convention in lz-advisor.plan/SKILL.md output template; UAT validates | pending |
| GAP-G1+G2-empirical | 07-01 + 07-06 | 1 + 3 | -- | Plan-fixes + execute-fixes UAT replay on plugin 0.10.0 produces EITHER non-zero ToolSearch invocation OR pv-* synthesis with session-grounded `<evidence>` on plan-file Class-2/3/4 input | UAT replay | UAT replay subset (per Phase 6 amendment 5 precedent); custom assertion in `tally.mjs` | partial -- existing `uat-pattern-d-replay/` infra; Plan 07-06 adapts | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-advisor-budget.sh` -- covers FIND-D (advisor side); asserts advisor SD <=100w on representative Compodoc+Storybook scenario (Plan 07-04)
- [ ] `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-reviewer-budget.sh` -- covers FIND-D (reviewer side); parses by section header; asserts each Findings <=80w, CCP <=160w, Missed-surfaces <=30w, total <=300w (Plan 07-04)
- [ ] `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-security-reviewer-budget.sh` -- covers FIND-D (security-reviewer side); same shape as D-reviewer-budget.sh (Plan 07-04)
- [ ] `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/E-verify-before-commit.sh` -- covers FIND-E.1 + FIND-E.2 (3 paths: hedge-flag, verify-trailer, wip-commit) (Plan 07-02 + 07-06)
- [ ] `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/B-pv-validation.sh` (NEW) OR extension of `KCB-economics.sh` (planner picks per CONTEXT.md Claude's Discretion) -- covers FIND-B.1 + FIND-B.2 + FIND-H (Plan 07-01 + 07-06)
- [ ] `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/uat-replay/runners/` -- copy `run-all.sh`, `run-session.sh`, `tally.mjs` from Phase 6 `uat-pattern-d-replay/runners/`; extend `tally.mjs` with `verified_trailer_count` + `wip_commit_count` columns (Plan 07-06)
- [ ] `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/uat-replay/prompts/` -- session-{1..N}-<skill>.txt (planner picks scope; minimum: plan-fixes + execute-fixes + security-review per Phase 6 amendment 5 precedent) (Plan 07-06)
- Framework install: none -- existing toolchain (Bash + `rg` + `claude` CLI + Node.js + Git Bash) already in place

---

## Manual-Only Verifications

| Behavior | Finding | Why Manual | Test Instructions |
|----------|---------|------------|-------------------|
| 06-VERIFICATION.md amendment 6 -- downgrade PASS-with-caveat to PASS once Plan 07-01 verification passes | GAP-G1+G2-empirical | Cross-phase document amendment; not automatable from smoke fixtures | Plan 07-06 writes amendment 6 in `.planning/phases/06-address-phase-5-6-uat-findings/06-VERIFICATION.md` after Plan 07-01 verification passes; `/gsd-audit-milestone` cross-references the amendment |
| 07-VERIFICATION.md gate verdict captured by gsd-verifier | Phase 7 closure | Standard GSD verification path; produced after `/gsd-execute-phase 7` runs the verifier subagent | Run `/gsd-execute-phase 7` to completion; `gsd-verifier` produces `07-VERIFICATION.md` with goal-backward analysis; surface any `human_needed` items |
| ROADMAP.md / STATE.md updated to reflect Phase 6 + Phase 7 closure | Milestone audit | Documentation sync; not automated by smoke fixtures | After 07-VERIFICATION.md is PASS: run `/gsd-audit-milestone` to verify both phases close cleanly; `gsd-tools state` updates |

---

## Tier coverage matrix (per finding -> which tier validates -> per-tier acceptance criteria)

| Finding | Tier 1 (smoke) | Tier 2 (UAT replay) | Tier 3 (manual closure) |
|---------|----------------|---------------------|--------------------------|
| A | -- (no smoke fixture; behavioral) | execute-fixes scenario; n>=3 trials needed | -- |
| B.1 | B-pv-validation.sh Assertion 2 (synthesis count >=1) | plan + execute UAT (>=1 pv-* synthesized per material Read/WebFetch) | -- |
| B.2 | B-pv-validation.sh Assertion 1 (XML format) | plan-fixes UAT (no plain-bullet "Pre-verified Claims") | -- |
| C | KCB-economics + B-pv-validation + structural git grep for Common Contract sentinels | multi-hop chain UAT (review -> plan-fixes -> execute-fixes -> security-review) | -- |
| D | D-{advisor,reviewer,security-reviewer}-budget.sh (3 fixtures) | UAT replay observed word counts <=cap | -- |
| E.1 | E-verify-before-commit.sh Assertion (a) | execute-fixes UAT with hedge-marker source material | -- |
| E.2 | E-verify-before-commit.sh Assertions (b) + (c) | execute-fixes UAT with explicit Run/Verify directives | -- |
| F | DEF F slot + UAT-side `rg '<verify_request question="'` | review-skill UAT with Class-2 question | -- |
| G | -- (behavioral; no atomic smoke) | review-skill UAT on commits with hedged claims missing Verified: trailer | -- |
| H | B-pv-validation.sh Assertion 3 (no self-anchor) + Assertion 4 (no empty evidence) | plan-fixes + execute-fixes UAT | -- |
| silent-resolve | -- (behavioral) | plan-fixes UAT with N-finding input; assert disposition for all N | -- |
| GAP-G1+G2-empirical | -- (regression-only; smoke is structural at-rest) | plan-fixes + execute-fixes UAT subset on plugin 0.10.0 | 06-VERIFICATION.md amendment 6 (Plan 07-06): downgrade PASS-with-caveat -> PASS once Plan 07-01 verification passes |

---

## Tier 1 (smoke fixtures) acceptance criteria

All fixtures exit code 0 on plugin 0.10.0:

- `KCB-economics.sh`: K + C + B all `[OK]`
- `DEF-response-structure.sh`: D + E + F + G+H + I + Word-budget all `[OK]`
- `HIA-discipline.sh`: H + A + I all `[OK]`
- `J-narrative-isolation.sh`: J `[OK]`
- `D-advisor-budget.sh`: advisor SD <=100w on representative Compodoc+Storybook scenario `[OK]`
- `D-reviewer-budget.sh`: each Findings <=80w, CCP <=160w, Missed-surfaces <=30w, total <=300w `[OK]`
- `D-security-reviewer-budget.sh`: each Findings <=80w, Threat Patterns <=160w, Missed-surfaces <=30w, total <=300w `[OK]`
- `E-verify-before-commit.sh`: at least one of (a) hedge-flag path OR (b) verify-trailer path OR (c) wip-commit path satisfied `[OK]`
- `B-pv-validation.sh`: Assertions 1-4 all `[OK]` (XML format + synthesis >=1 + no self-anchor + no empty evidence)

## Tier 2 (UAT replay) acceptance criteria

UAT replay subset on plugin 0.10.0 (per Phase 6 amendment 5 precedent: minimum plan-fixes + execute-fixes + security-review):

- Multi-hop chain (review -> plan-fixes -> execute-fixes -> security-review) on representative Compodoc+Storybook scenario produces:
  - At least one of (i) ToolSearch invocation on plan-file Class-2/3/4 input OR (ii) pv-* synthesis with session-grounded `<evidence>` on plan-file input -- closes GAP-G1+G2-empirical
  - Hedge markers from upstream skills survive into downstream consultation prompts (Plan 06-05 hedge-marker preservation regression coverage)
  - Plan-fixes output addresses all N input findings with explicit disposition (silent-resolve sub-pattern closure)
  - Execute-fixes either (a) advisor flags unresolved hedge OR (b) executor performs verification + Verified: trailer OR (c) wip:-commit + Outstanding Verification (E.1/E.2 closure)
  - Reviewer emits `<verify_request>` for unresolved Class-2 question; executor re-invokes one-shot (F closure via Option 2)
- Word-budget observed values: advisor <=100w, reviewer / security-reviewer <=300w aggregate per their sub-cap structure (D closure)

## Tier 3 (manual closure) acceptance criteria

- 06-VERIFICATION.md amendment 6 written by Plan 07-06: downgrade PASS-with-caveat to PASS once Plan 07-01 verification passes (closes GAP-G1+G2-empirical at the milestone-audit layer)
- 07-VERIFICATION.md produced by gsd-verifier: Phase 7 gate verdict captured; any human_needed items surfaced
- ROADMAP.md / STATE.md updated to reflect Phase 6 closure + Phase 7 closure

---

## Validation Sign-Off

- [ ] All findings mapped to Tier 1 / Tier 2 / Tier 3 with explicit acceptance criteria
- [ ] Sampling continuity: every fix plan (07-01..07-05) has paired smoke fixture in 07-06; no plan ships without a smoke gate
- [ ] Wave 0 covers all MISSING references (5 NEW smoke fixtures + 1 UAT replay infrastructure)
- [ ] No watch-mode flags (Bash + `rg` synchronous; no daemon dependencies)
- [ ] Feedback latency < 60s for smoke; < 15min per UAT replay session
- [ ] `nyquist_compliant: true` set in frontmatter once Wave 0 deliverables land

**Approval:** pending
