---
phase: 07-address-all-phase-5-x-and-6-uat-findings
gaps:
  - residual-security-reviewer-budget-0_12_1 (UAT 2026-05-05; 326w aggregate / 300 cap; 8.7% over)
  - residual-severity-vocabulary-alignment (WR-01/02/03 from 07-REVIEW.md; cross-surface drift after Plan 07-09 rename)
type: research
dated: 2026-05-05
target_artifacts:
  - .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-12-PLAN.md (security-reviewer aggregate budget durability closure)
  - .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-13-PLAN.md (WR-01/02/03 cross-surface alignment + Class-2 Escalation Hook addition)
plugin_version_at_research: 0.12.1
plugin_version_target: 0.12.2 (PATCH; both gap closures are refinements of existing rules)
verification_basis: |
  - 07-UAT-REGRESSION-0.12.1.md autonomous regression-gate session 2026-05-05 (D-security-reviewer-budget.sh FAILED with 326w aggregate; full 8-session UAT chain on plugin 0.12.1)
  - 07-VERIFICATION.md empirical_subverification_2026_05_03 (plugin 0.12.0 baseline: D-security-reviewer-budget.sh PASSED with 285w aggregate; same canonical scenario)
  - 07-VERIFICATION.md empirical_subverification_2026_05_05 (S4 security-review = 314w; 4.7% over)
  - 07-RESEARCH-WORDBUDGET.md (Plan 07-09 fragment-grammar reference research; Anthropic Best Practices anchors)
  - 07-RESEARCH-GAPS.md (Plans 07-10 + 07-11 prior gap-closure pattern; Plan 07-09 reference implementation)
  - plugins/lz-advisor/agents/security-reviewer.md current state (Plan 07-09 fragment-grammar emit template + effort medium; UNCHANGED across 0.12.0 -> 0.12.1)
  - plugins/lz-advisor/agents/reviewer.md current state (sister agent baseline; 286w / 300 cap on plugin 0.12.1 same UAT chain)
  - Anthropic Claude 4 Best Practices (current docs verified 2026-05-05)
out_of_scope:
  - residual-wip-discipline-reversal (Phase 8 directive per user 2026-05-03)
  - P8-03 Pre-Verified Contradiction Rule
  - P8-12 Cross-Skill Hedge Tracking auto-detect
  - P8-18 advisor narrative-SD self-anchor leak
  - Class-1 recall A/B study for Plan 07-09 effort de-escalation
  - reviewer-side severity vocabulary (already aligned per Plan 07-09)
---

# Phase 7 Gap Closures Research 2 -- Security-Reviewer Budget Drift + Severity-Vocabulary Cross-Surface Alignment

## Executive summary

The 2026-05-05 autonomous regression-gate session re-evaluated Phase 7's sealing readiness on plugin 0.12.1 and surfaced TWO in-phase gaps that block final empirical sealing. Per ultrathink re-evaluation, both gaps are NOT-DEFINITIVELY-PHASE-8 and require in-phase closure plans before Phase 7 can be marked `passed_with_residual` against only the OUT-OF-SCOPE wip-discipline reversal.

**Gap 1: Security-reviewer aggregate budget regression on plugin 0.12.1.** The load-bearing smoke fixture `D-security-reviewer-budget.sh` FAILS on plugin 0.12.1 with aggregate 326 words / 300 cap (8.7% over). Per-section sub-caps held (Findings 7-line fragment-grammar with 1 acceptable outlier; Threat Patterns 115w / 160 cap; Missed surfaces 29w / 30 cap); the aggregate is the load-bearing failure. The UAT S4 surfaced the same drift earlier (314w / 300 cap; 4.7% over). Plugin 0.12.1 only modified `agents/advisor.md` (Plan 07-10) and `references/context-packaging.md` (Plan 07-11); `agents/security-reviewer.md` was UNCHANGED, yet the aggregate regressed 285w (0.12.0 baseline) -> 326w (0.12.1 = +14% drift). The sister agent `reviewer.md` on plugin 0.12.1 in the SAME UAT chain hit 286w / 300 cap (4.7% under). Reviewer is at parity; security-reviewer drifted.

**Gap 2: WR-01/02/03 severity-vocabulary cross-surface alignment.** Plan 07-09 renamed the security-reviewer severity ladder from `Critical / High / Medium` to `Critical / Important / Suggestion` (matching reviewer.md) at the agent-file level. Three downstream surfaces still reference the legacy ladder, surfaced by 07-REVIEW.md (commit 26d2899) as Warnings WR-01/02/03. WR-01 is mechanical (1 line in security-reviewer.md). WR-02 is mechanical (4 occurrences across 2 files: SKILL.md + context-packaging.md). WR-03 is structural (security-reviewer.md cross-references reviewer.md for `## Class-2 Escalation Hook`, but agents are stateless and cannot read sibling agent files at runtime; the section must be self-contained). All three were deferred to Phase 8 in 07-VERIFICATION.md, but per the 2026-05-05 re-evaluation they are within Phase 7's closure scope: Plan 07-09 introduced the divergence, so Plan 07-09's contract integrity is incomplete until the rename is propagated.

**Primary recommendations (ranked):**

1. **Gap 1 -- ship Plan 07-12 (Security-reviewer aggregate budget durability closure)** with two composable mechanisms:
   - **Primary mechanism (Direction 1A):** Tighten the security-reviewer holistic worked example from ~265-296w to a calibrated ~260w aggregate showing 5 findings + Threat Patterns + Missed surfaces, replacing the current 6-finding-with-CVE-carve-out example. The current worked example sits at the edge of the cap (~296w of the 300w cap = 1.3% headroom); Anthropic Best Practices "match prompt style to desired output" implies a worked example near the cap shows the agent the cap is reachable WITH MAX USAGE, not "this is the target." A tighter worked example (~260w; 13% headroom) anchors the agent to a sub-cap target.
   - **Secondary mechanism (Direction 1B; composes with 1A):** Re-balance per-section caps to make their sum mathematically compatible with the aggregate cap. Current sum is 250 + 160 + 30 = 440w (47% over the 300w aggregate cap); the per-section caps are mathematically incompatible with the aggregate per `07-RESEARCH-WORDBUDGET.md` Diagnostic. Reduce Findings cap from 250w to 200w (3 OWASP findings averaging 18-22w + 1 auto-clarity carve-out at ~50w fits 200w); reduce Threat Patterns cap from 160w to 100w; keep Missed surfaces at 30w. New sum = 330w; still 10% over but mathematically tractable. Both reductions are supported by the empirical 0.12.0 baseline (Threat Patterns 109w; Findings ~155-187w on canonical scenarios).
   - **Reject:** Direction 1C effort downshift medium -> low (would breach Plan 07-09 D-04 amendment 2026-05-02 reversion criterion; requires its own A/B study; Anthropic explicitly says low is for "short, scoped tasks and latency-sensitive workloads that are not intelligence-sensitive" -- security review is intelligence-sensitive).
   - **Reject:** Direction 1D fixture cap relaxation 300w -> 330w (treats the symptom not the cause; once the cap relaxes the empirical envelope continues drifting; cap relaxation is the "fight the model" pattern Plan 07-09 rejected for its predecessor).
   - **Reject (with reservation):** Direction 1E aggregate self-trim mechanism (instruct agent to count words and re-emit if over). Per Plan 07-09 research Candidate D, self-check is empirically untested for length on Sonnet 4.6 / Opus 4.7; risk of agent counting words inaccurately. Defer to Phase 8 if Directions 1A + 1B are insufficient on plugin 0.12.2.

2. **Gap 2 -- ship Plan 07-13 (WR-01/02/03 cross-surface alignment + Class-2 Escalation Hook addition)** with three deliverables:
   - **WR-01 (mechanical):** Replace `Severity: Medium` -> `Severity: Suggestion` and `premature high-severity classification` -> `premature important-severity classification` in `plugins/lz-advisor/agents/security-reviewer.md:284`.
   - **WR-02 (mechanical with one design decision):** Replace 4 occurrences of `Critical / High / Medium` -> `Critical / Important / Suggestion` across `plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md:126,164` + `plugins/lz-advisor/references/context-packaging.md:289,388`. The design decision is for context-packaging.md:388 (the `verify_request` severity attribute schema): the Anthropic-recommended approach is to use the renamed lexicon there too (full alignment), since the severity attribute is consumed by the executor's verify_request parsing flow which itself is internal to the plugin (no externally-facing API). No translation note needed. Justification: keeps a single canonical lexicon across the plugin's internal contract.
   - **WR-03 (structural):** Add a `## Class-2 Escalation Hook` section to `plugins/lz-advisor/agents/security-reviewer.md` (mirroring `agents/reviewer.md` lines 223-249 byte-identically except for security-specific adaptations: class value `2-S` instead of `2`; severity values from the renamed ladder; OWASP-specific anchor target naming convention `pv-cve-...`/`pv-advisory-...`). Replace the cross-file pointer on line 119 with a self-contained reference (`see ## Class-2 Escalation Hook below`). Update the line 129 carve-out enumeration to include `## Class-2 Escalation Hook`.

3. **Plugin SemVer:** 0.12.1 -> 0.12.2 PATCH. Both gap closures are refinements of existing rules (security-reviewer worked-example tightening + sub-cap re-balance; severity-vocabulary alignment of internal contract surfaces; Class-2 Escalation Hook addition mirroring an existing section in the sister agent). NEITHER changes the agent contract surface as observed by users (the verify_request severity attribute is internal; the per-finding severity prefix `crit:/imp:/sug:/q:` was already canonicalized in Plan 07-09). The `verify_request` severity attribute lexicon change is a contract-shape-internal alignment, not externally visible to plugin consumers.

**Both gap closures honor all locked CONTEXT.md decisions and the 2026-05-02 D-04 amendment binding reversion criterion.**

<user_constraints>
## User Constraints (from CONTEXT.md and user directives 2026-05-03)

### Locked Decisions (from CONTEXT.md unchanged)

- **D-03 phrasing style:** descriptive prose for non-safety rules; ALL-CAPS reserved for safety-critical only. Both gap closures use descriptive prose with worked examples; no new ALL-CAPS imperatives.
- **D-04 reviewer/security-reviewer tools:** stay `["Read", "Glob"]` -- principle of least privilege. Plan 07-12 + 07-13 do NOT touch tool grants.
- **D-04 amendment 2026-05-02 binding reversion criterion:** if reviewer/security-reviewer Class-1 recall drops more than 15% on plugin 0.12.0 vs xhigh baseline, REVERT effort medium to xhigh AND keep Plan 07-09 Candidate A alone. Plan 07-12 does NOT change effort levels; security-reviewer stays `effort: medium`. Reversion criterion preserved.
- **D-06 plugin version:** SemVer minor on contract-shape changes; SemVer patch on prompt-rule refinements. Plan 07-12 + 07-13 are refinements (worked-example calibration + cross-surface alignment + structural section addition mirroring sibling); 0.12.1 -> 0.12.2 PATCH is correct. If bundled with Phase 8 wip-discipline reversal -> 0.13.0 MINOR rolls both in.
- **Byte-identical 4-skill canon:** changes that touch the 4 SKILL.md `<context_trust_contract>` block must apply byte-identically. Plan 07-13 does NOT touch the canon block; it touches `lz-advisor.security-review/SKILL.md` Phase 1 prose (line 126) and Phase 3 prose (line 164) which are skill-specific, not byte-identical canon content.

### Claude's Discretion (this research's recommendations are guidance; planner may adjust)

- Whether Plan 07-12 ships before, after, or together with Plan 07-13. Both are independent (different files, different rules, different smoke fixtures); recommend bundling for one plan + one commit cycle to amortize the 0.12.2 version bump.
- Exact target word count for the new tighter security-reviewer worked example (suggested ~260w; planner may calibrate ~250-275w based on representative scenario).
- Exact per-section cap reductions in Direction 1B (suggested Findings 250 -> 200; Threat Patterns 160 -> 100; Missed surfaces unchanged at 30; planner may calibrate based on canonical scenario empirical distribution).
- Whether to preserve a backward-compat note in `references/context-packaging.md:388` mapping the renamed severity attribute lexicon (`Critical / Important / Suggestion`) to the prior lexicon (`Critical / High / Medium`) for any in-flight consumer. Recommend NO note: the verify_request severity attribute is internal to plugin invocation flow; backward-compat for an internal contract creates technical debt without consumers.
- Whether to extend the `## Class-2 Escalation Hook` section in security-reviewer.md with a Class 2-S-specific worked example (suggested YES, mirroring the reviewer.md storybook example shape but with `class="2-S"` + CVE/advisory question; planner may keep the section minimal if mirror-byte-identical preferred).
- Whether to re-run the autonomous regression-gate session on plugin 0.12.2 after Plan 07-12 + 07-13 land (suggested YES; D-security-reviewer-budget.sh + D-reviewer-budget.sh + B-pv-validation.sh + canonical UAT S4 minimum).

### Deferred Ideas (OUT OF SCOPE for these gap closures)

- **`residual-wip-discipline-reversal`** (Phase 8 directive per user 2026-05-03; memory `feedback_no_wip_commits.md`).
- **Self-trim mechanism (Direction 1E)** -- defer to Phase 8 if Directions 1A + 1B are insufficient on 0.12.2 empirical regression-gate.
- **Class-1 recall A/B study** for Plan 07-09 effort de-escalation (Phase 8 candidate per `empirical_subverification_2026_05_03`).
- **P8-03 Pre-Verified Contradiction Rule** -- 5th confidence-laundering guard. Out of scope.
- **P8-12 Cross-Skill Hedge Tracking auto-detect** -- trust-contract heuristic. Out of scope.
- **P8-18 advisor narrative-SD self-anchor leak.** Out of scope.
- **Reviewer-side severity vocabulary** -- already aligned per Plan 07-09 (reviewer.md uses Critical/Important/Suggestion). Reviewer-touched surfaces (`lz-advisor.review/SKILL.md`, `references/context-packaging.md` reviewer-side) are NOT part of WR-01/02/03 scope.
- **Tokenizer change between Opus 4.6 and 4.7** (1.0-1.35x more tokens per text per community sources) -- noted as background; not actionable in either gap closure.

</user_constraints>

## Phase Requirements (this research informs)

| ID | Description | Research Support |
|----|-------------|------------------|
| FIND-D + GAP-D-budget-empirical | Reviewer + security-reviewer agents emit aggregate output <=300 words across Findings + Cross-Cutting Patterns / Threat Patterns + Missed surfaces sections on canonical D-reviewer-budget.sh / D-security-reviewer-budget.sh scenarios. Empirically REGRESSED on plugin 0.12.1: D-security-reviewer-budget.sh FAILS at 326w aggregate. | Section "Gap 1: Security-reviewer aggregate budget durability" -- Direction 1A (worked-example tightening) + Direction 1B (per-section cap re-balance) compose to restore empirical compliance. Closure criterion = bash D-security-reviewer-budget.sh PASSES on plugin 0.12.2 + canonical UAT S4 replay shows aggregate <=300w. |
| Plan 07-09 contract integrity (severity-vocabulary alignment) | Plan 07-09 renamed security-reviewer severity ladder Critical/High/Medium -> Critical/Important/Suggestion at agent-file level; 4 downstream surfaces still reference legacy ladder; security-reviewer.md cross-references reviewer.md for Class-2 Escalation Hook section that does NOT exist self-contained in security-reviewer.md. | Section "Gap 2: WR-01/02/03 cross-surface alignment + Class-2 Escalation Hook addition" -- mechanical text replacement (WR-01 + WR-02) + structural section addition mirroring reviewer.md (WR-03). Closure criterion = git grep -F "Critical / High / Medium" plugins/lz-advisor/ AND plugins/lz-advisor/references/ returns 0 matches; agents/security-reviewer.md contains `## Class-2 Escalation Hook` section; no cross-file pointer to reviewer.md remains. |

---

## Empirical evidence summary (autonomous regression-gate 2026-05-05 + UAT chain)

### Gap 1 evidence (security-reviewer aggregate budget regression)

| Surface | Plugin 0.12.0 (baseline) | Plugin 0.12.1 (current) | Drift |
|---------|--------------------------|--------------------------|-------|
| D-security-reviewer-budget.sh smoke fixture aggregate | 285w / 300 cap = PASS (95% of cap) | 326w / 300 cap = FAIL (108.7% of cap) | +41w / +14.4% |
| Canonical UAT S4 security-review (4 OWASP findings; supply-chain scenario) | n/a -- 0.12.0 baseline used different scenario | 314w / 300 cap = 4.7% over | n/a |
| D-reviewer-budget.sh smoke fixture aggregate (sister agent comparison) | 275w / 300 cap = PASS (91.7% of cap) | 286w / 300 cap = PASS (95.3% of cap) | +11w / +4.0% |
| Reviewer canonical UAT S3 (sister agent comparison) | 197w / 300 cap = PASS (65.7%) | 286w / 300 cap = PASS (95.3% of cap) | +89w / +45.2% |

[VERIFIED: `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/regression-gate-0.12.1/D-security-reviewer-budget.log` lines 1-13 (failure evidence); `07-VERIFICATION.md` empirical_subverification_2026_05_03 line 100 d_security_reviewer_budget_fixture: PASSED on 0.12.0; `07-VERIFICATION.md` empirical_subverification_2026_05_05 session_4 line 200 (314w S4 result)]

**Critical observation: `agents/security-reviewer.md` was NOT modified between 0.12.0 and 0.12.1.** The 5 plugin surfaces touched by 0.12.0 -> 0.12.1 PATCH:

1. `agents/advisor.md` -- Plan 07-10 fragment-grammar template (commits a11834d + cd4e49b)
2. `references/context-packaging.md` -- Plan 07-11 Rule 5b dual-surface differentiation (commit fb872d9)
3. `D-advisor-budget.sh` -- Plan 07-10 parser update (commit cd4e49b)
4. `B-pv-validation.sh` -- Plan 07-11 Assertion 6 token-form resolution check (commit 3e03ed0)
5. `REQUIREMENTS.md` -- Plan 07-11 FIND-B.2-format-scope row (commit 3ef407d) + plugin.json + 4 SKILL.md frontmatter version bump 0.12.0 -> 0.12.1 (commit bf8a8db)

[VERIFIED: 07-VERIFICATION.md closure_amendment_2026_05_04 closure_commits list]

**Sister-agent comparison:**

The smoke fixture for the SISTER agent (`D-reviewer-budget.sh`) shows minimal drift on plugin 0.12.1: 286w / 300 cap (95.3% of cap; 4.7% under). The reviewer agent received the SAME Plan 07-09 fragment-grammar treatment as security-reviewer; same `effort: medium`; same `[Read, Glob]` tools. The structural fix is shared. The drift asymmetry between reviewer (+4.0% on smoke; +45.2% on UAT but stays under cap) and security-reviewer (+14.4% on smoke; UAT also over cap) suggests the issue is security-reviewer-specific.

### Gap 2 evidence (severity-vocabulary cross-surface alignment)

[VERIFIED via `git grep -F "Critical / High / Medium" plugins/` and `git grep -F "Critical/High/Medium" plugins/`]:

| File:Line | Surface | Current text | Required text | Class |
|-----------|---------|--------------|---------------|-------|
| plugins/lz-advisor/agents/security-reviewer.md:284 | Hedge Marker Discipline -- security-clearance carve-out | `Severity: Medium pending verification of <hedge action>` + `premature high-severity classification` | `Severity: Suggestion pending verification of <hedge action>` + `premature important-severity classification` | WR-01 mechanical |
| plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md:126 | Phase 1 Scan -- "include initial severity assessment" | `Critical / High / Medium` | `Critical / Important / Suggestion` | WR-02 mechanical |
| plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md:164 | Phase 3 Output -- "do NOT reformat into severity groups" | `Critical / High / Medium` | `Critical / Important / Suggestion` | WR-02 mechanical |
| plugins/lz-advisor/references/context-packaging.md:289 | Verification template -- "Severity (initial)" | `Critical/High/Medium for security-review` | `Critical/Important/Suggestion for security-review` | WR-02 mechanical |
| plugins/lz-advisor/references/context-packaging.md:388 | Verify Request Schema -- severity attribute optional values | `Critical / High / Medium for security-reviewer` | `Critical / Important / Suggestion for security-reviewer` | WR-02 design-bearing |
| plugins/lz-advisor/agents/security-reviewer.md:119 + 129 | Cross-file reference to reviewer.md `## Class-2 Escalation Hook` + carve-out enumeration omits the section | `see ## Class-2 Escalation Hook in reviewer.md and adapted here for Class 2-S security questions` | self-contained `## Class-2 Escalation Hook` section IN security-reviewer.md (mirroring reviewer.md but Class 2-S adapted) | WR-03 structural |

[VERIFIED: 07-UAT-REGRESSION-0.12.1.md Gap 2 block lines 396-439]

**Reviewer.md sister agent reference:** `plugins/lz-advisor/agents/reviewer.md` ALREADY has a self-contained `## Class-2 Escalation Hook` section (lines 223-249) which serves as the canonical structure. The reviewer-side section uses `class="2"` for API currency / configuration / recommended pattern questions and `class="3"` for migration / deprecation; the security-reviewer-side adaptation needs `class="2-S"` for security currency / CVE / advisory questions. The schema, anchor_target convention, severity attribute, executor parsing flow, and one-shot re-invocation expectation are SHARED across both agents per `references/context-packaging.md` "Verify Request Schema" section.

---

## Gap 1: Security-reviewer aggregate budget durability (residual-security-reviewer-budget-0_12_1)

### Diagnosis: hypotheses ranked by likelihood and evidence

The drift is empirical and load-bearing (smoke fixture FAILS, not just UAT minor over-cap). The agent file was NOT modified. Hypotheses to investigate:

#### Hypothesis 1 (HIGH confidence): The current worked example sits at the cap edge

**Evidence:**
- `agents/security-reviewer.md` lines 131-151 contains a "Holistic worked example (~296 words aggregate; demonstrates 6 findings...)" with a documented breakdown: "Findings ~155w (6 findings averaging 18w each + 1 verify_request line at ~22w + 1 auto-clarity full-prose CVE finding at ~50w), Threat Patterns ~90w, Missed surfaces ~20w; aggregate ~265w."
- The 296w / 265w envelope is 12-1.3% headroom under the 300w cap. Per Anthropic Best Practices "match prompt style to desired output," a worked example near the cap shows the agent the cap is REACHABLE WITH MAX USAGE, not "this is the target."
- Empirical 0.12.0 baseline of 285w (95% of cap) confirms the agent reads the worked example as a target zone, not a budget ceiling.
- Plugin 0.12.0 -> 0.12.1 introduced cross-prompt-system context pressure (the 4 SKILL.md `<context_trust_contract>` blocks gained Plan 07-11 dual-surface differentiation language; Plan 07-10 added fragment-grammar to advisor.md). The security-reviewer's natural output spread, already pre-stressed at 285w / 300 cap, may have crossed into 326w under the additional system-prompt complexity context that biases toward longer justifications.
- Sister agent reviewer.md has a similar worked example (~296w aggregate per line 144 breakdown: "Findings ~110w + CCP ~85w + Missed ~25w = ~220w") but its baseline was 197w / 300 cap (65.7%). Reviewer's headroom is wider; security-reviewer's headroom is tighter; the same drift pressure pushes only security-reviewer over the cap.

**Probability: HIGH (~70%).** The empirical envelope analysis is direct and quantitative. Anthropic's "match prompt style" guidance plus the sister-agent comparison strongly support this hypothesis.

#### Hypothesis 2 (MEDIUM confidence): Per-section caps mathematically incompatible with aggregate cap

**Evidence:**
- Per `07-RESEARCH-WORDBUDGET.md` Diagnostic section (lines 481-503): the per-section caps in security-reviewer.md sum to 250 + 160 + 30 = 440w; the aggregate cap is 300w. Maximum-usage-per-section response is 47% over the aggregate cap.
- The current prose attempts to resolve this by saying the per-section caps are "loose upper bounds" and the aggregate constrains usage. This relies on the agent doing real-time arithmetic during emission, which Opus 4.7 interprets literally and does NOT consistently do (per Anthropic Best Practices "More literal instruction following").
- Empirical 0.12.1 distribution (per UAT S4 + smoke fixture): Findings 187w (under 250 cap), Threat Patterns 115-101w (under 160 cap), Missed surfaces 26-29w (under 30 cap). Each section "behaves" relative to its per-section cap; the aggregate is the casualty.
- Plan 07-09's intent was structural fragment-grammar + per-section caps + aggregate cap, which is the hybrid architecture. The empirical evidence suggests the per-section caps are operative and the aggregate is descriptive, exactly as the prior 07-RESEARCH-WORDBUDGET.md diagnosed.

**Probability: MEDIUM (~50%).** The arithmetic incompatibility is real and not contestable; whether it is THE cause vs ONE OF THE CAUSES requires per-section ablation. The sister agent reviewer.md has the same arithmetic incompatibility but stays under the aggregate cap because its baseline distribution leaves more headroom. This suggests cap arithmetic alone is not sufficient explanation; it composes with hypothesis 1.

#### Hypothesis 3 (MEDIUM-LOW confidence): Cross-surface bleed from Plan 07-11 dual-surface differentiation

**Evidence:**
- Plan 07-11 amended `references/context-packaging.md` Rule 5b "Format mandate" with dual-surface differentiation prose (~50 lines added).
- The security-reviewer agent reads the consultation prompt packaged by the executor; the consultation prompt uses the Verification template from `context-packaging.md`; the template was not directly amended by Plan 07-11, but the surrounding rules were.
- Per Anthropic Best Practices "Long context prompting": longer system prompts cause the model to think more often and produce longer responses. The Plan 07-11 amendment increased the executor's prompt-construction guidance complexity, which propagates downstream as longer agent prompts (the executor reads more guidance, packages more context, the agent receives more context).
- Counter-evidence: the same change applies to reviewer.md consultations, but reviewer.md drifted only +4% on smoke fixture vs security-reviewer's +14%. If cross-surface bleed were dominant, both agents should drift similarly.

**Probability: MEDIUM-LOW (~25%).** Plausible but not strongly supported. May contribute as a small additive factor.

#### Hypothesis 4 (LOW confidence): Sonnet 4.6 / Opus 4.7 stochastic sampling spread

**Evidence:**
- Both the smoke fixture (326w) and UAT S4 (314w) overshot the cap; two independent samples agree on direction. If stochastic, we would expect at least one to land under cap.
- Sonnet 4.6 / Opus 4.7 are non-deterministic; same prompt produces different outputs across runs. Some variation is expected.
- Plugin 0.12.0 baseline was 285w; same UAT chain shape on different scenario shows 25-40w spread is plausible empirically.
- Counter-evidence: the empirical_subverification_2026_05_03 smoke fixture on 0.12.0 PASSED with aggregate well under 300w; the empirical_subverification_2026_05_05 smoke fixture on 0.12.1 FAILS with 326w. The drift is reproducible across the smoke fixture (which is hermetic) and the UAT (which is realistic). Both show the same direction. If sampling-only, we would expect at least one to PASS in repeat runs.

**Probability: LOW (~15%).** Some stochastic component exists, but the evidence indicates this is NOT the dominant factor. Recommendation: re-run D-security-reviewer-budget.sh 3 times on plugin 0.12.1 BEFORE shipping a fix to confirm reproducibility (cheap empirical check; low cost).

#### Hypothesis 5 (LOW confidence): OWASP A0X taxonomy carries more rationale verbosity than non-OWASP findings

**Evidence:**
- The S4 UAT and smoke fixture each produced 4 + 7 OWASP-tagged findings; reviewer's S3 produced findings without OWASP tags.
- OWASP tags add prefix length (e.g., `[A03]` is 4 chars; `[A06]` is 4 chars; `[CVE-2025-1234]` is ~17 chars) but per-finding word target is calculated EXCLUDING the prefix.
- Counter-evidence: the per-finding fragment-grammar already accounts for OWASP-tag length variance via the 22-word target (vs reviewer's 20-word target). Per Plan 07-09 design, the 2-word delta on the target was sufficient envelope.

**Probability: LOW (~10%).** Possible micro-contributor but small relative to hypotheses 1-2.

### Synthesis of diagnosis

**Hypotheses 1 + 2 compose to explain the empirical regression.** The worked example near the cap (Hypothesis 1) sets a "this is reachable" anchor; the per-section caps mathematically incompatible with the aggregate cap (Hypothesis 2) lets the agent fill each section to its per-section cap without arithmetic enforcement. Together they explain why the aggregate creeps over: each section behaves correctly per its sub-cap, but the sum exceeds the aggregate.

The 0.12.0 -> 0.12.1 drift is the result of the worked-example anchor + per-section cap arithmetic being already at the edge; any system-prompt complexity addition (Plan 07-11 dual-surface; Plan 07-10 advisor fragment-grammar; sampling spread; Hypothesis 3 minor contribution) tips it over. The structural fix targets the underlying incompatibility, not the proximate trigger.

### Candidate remediation directions for Gap 1

#### Direction 1A (RECOMMENDED PRIMARY): Tighten the worked example to ~260w aggregate

**Mechanism.** Replace the current `agents/security-reviewer.md` Holistic worked example (lines 131-151; ~265-296w with documented 6-finding-with-CVE-carve-out shape) with a calibrated ~260w aggregate worked example showing 5 findings + Threat Patterns + Missed surfaces, including 1 auto-clarity CVE carve-out at ~40-45w and 4 standard fragment-grammar findings at ~15-20w each.

Suggested target distribution (aggregate ~260w, 13% headroom under 300w cap):
- Findings ~165w: 4 standard findings averaging 18w each (~72w) + 1 verify_request line at ~22w + 1 auto-clarity CVE finding at ~45w + structural overhead at ~26w (header line + spacing)
- Threat Patterns ~75w: 2-3 sentences naming chains across findings
- Missed surfaces ~20w: 1 short sentence

**Why this works:**
- Per Anthropic Best Practices "match prompt style to desired output," the worked example is the strongest steering anchor. A 260w worked example demonstrates that the cap is REACHABLE with substantial headroom; the agent calibrates to "the target is 260w, the cap is 300w" rather than "the target is 300w and I have 4w headroom."
- Per Plan 07-09 research Anthropic-Recommended Techniques #1 (HIGH confidence): "Positive examples showing how Claude can communicate with the appropriate level of concision tend to be more effective than negative examples or instructions that tell the model what not to do."
- The CVE auto-clarity carve-out is preserved (one finding at ~45w demonstrates the carve-out; the 4 standard findings demonstrate the fragment-grammar shape; together they convey "fragment-grammar is the default, full-prose is the carve-out for security advisories").
- Reviewer-side comparison: reviewer.md's worked example is ~220w aggregate (per line 144 breakdown) and reviewer's empirical envelope on 0.12.1 is 286w. Security-reviewer's worked example at ~260w should yield a similar 65-70% of cap empirical baseline (=200-210w empirical), well under 300w.

**Implementation cost:** LOW. Single-file edit on lines 131-151; ~30 minutes including word-count calibration + smoke-fixture re-run on 0.12.2.

**Residual risk:** LOW-MEDIUM. The technique transfer is by analogy to reviewer.md's narrower envelope; empirical UAT on 0.12.2 is the validation. If 1A alone reaches the cap, ship 1A only.

**Compatibility with locked decisions:**
- D-03 phrasing: PASSES (descriptive prose + worked example; no ALL-CAPS).
- D-04 effort levels: NEUTRAL (security-reviewer stays `effort: medium`).
- D-04 reviewer-side parity: PRESERVED (reviewer.md unchanged; no asymmetric divergence introduced).
- Plan 07-09 fragment-grammar emit template: REFINED, does not contradict. Per-finding shape preserved; only the holistic worked example calibration changes.
- Byte-identical 4-skill canon: NOT TOUCHED (change is in agents/, not skills/).

**Evidence anchors:**
- [CITED: Anthropic Best Practices "Use examples effectively" -- "Examples are one of the most reliable ways to steer Claude's output format... Include 3-5 examples for best results." (`https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices`)]
- [CITED: Anthropic Best Practices "Match prompt style to desired output" -- "If you are still experiencing steerability issues with output formatting, try matching your prompt style to your desired output style as closely as possible."]
- [VERIFIED: `plugins/lz-advisor/agents/reviewer.md` lines 123-144 -- ~220w worked example on the sister agent that empirically fires under cap on plugin 0.12.1 (286w / 300 cap; 4.7% under)]

#### Direction 1B (RECOMMENDED SECONDARY; composes additively with 1A): Per-section cap re-balance

**Mechanism.** Reduce per-section caps so their sum is closer to the aggregate cap:
- Findings cap: 250w -> 200w (rationale: 4 standard fragment-grammar findings at 18-22w + 1 auto-clarity carve-out at ~45w = ~120-130w; 200w cap leaves headroom for 5-6 findings without enabling unbounded section growth)
- Threat Patterns cap: 160w -> 100w (rationale: 0.12.0 empirical baseline was 109w; 0.12.1 empirical is 101-115w; 100w cap is at the empirical envelope, providing tighter discipline)
- Missed surfaces cap: 30w UNCHANGED (already binding empirically; 26-29w on 0.12.1)
- New per-section sum: 200 + 100 + 30 = 330w; still 10% over 300w aggregate but much closer
- Aggregate cap: 300w UNCHANGED (the load-bearing constraint)

**Why this works:**
- The 250 + 160 + 30 = 440w sum is 47% over the 300w aggregate. The new 330w sum is 10% over. Per Plan 07-09 research Open Question 6 (`07-RESEARCH-WORDBUDGET.md` line 830): "Does the absence of an aggregate cap in the new template create a regression risk? Removing the 300w aggregate from the prose may allow over-budget output via 'just one more finding' drift. Resolution: smoke fixture asserts both per-line shape AND aggregate <=300w; the smoke is the empirical gate even if the prose doesn't say it."
- Tighter per-section caps reduce the "fill each section to its sub-cap" failure mode. The agent treats per-section caps as operative; tighter caps = tighter operative budget.
- The 0.12.0 empirical baseline was Findings 155w + Threat Patterns 109w + Missed surfaces 21w = 285w aggregate. The proposed reduced caps (200 / 100 / 30) preserve headroom above this baseline (Findings +45w; Threat Patterns -9w bound; Missed surfaces unchanged) without forcing scope reduction.
- Reviewer-side parity: reviewer.md per-section caps are also 250 + 160 + 30 = 440w. If Direction 1B works for security-reviewer, it should be applied symmetrically to reviewer.md too (reviewer.md is currently at 95% of cap on plugin 0.12.1; the same drift pressure could push it over with future system-prompt complexity additions).

**Implementation cost:** LOW. Single-section prose edit in security-reviewer.md `## Output Constraint`; mirror to reviewer.md if planner chooses symmetric application; ~20 minutes per file.

**Residual risk:** LOW-MEDIUM. Risk: the tighter caps cause the agent to drop findings or compress threat-pattern analysis below useful detail. Mitigation: empirical UAT on 0.12.2 confirms quality is preserved (number of findings + verify_request emission rate + threat-pattern correctness). Reviewer-side parity application is OPTIONAL (planner discretion based on whether reviewer's empirical envelope warrants the same tightening).

**Compatibility with locked decisions:**
- D-03 phrasing: PASSES.
- D-04 effort: NEUTRAL.
- Byte-identical canon: NOT TOUCHED.
- Plan 07-09 sub-cap structure: REFINED, does not contradict. Sub-cap values change; structure preserved.

**Evidence anchors:**
- [VERIFIED: `07-RESEARCH-WORDBUDGET.md` Diagnostic section lines 481-503 -- per-section vs aggregate cap arithmetic incompatibility]
- [VERIFIED: 07-VERIFICATION.md empirical_subverification_2026_05_03 line 100 -- 0.12.0 baseline distribution per section]
- [VERIFIED: regression-gate-0.12.1/D-security-reviewer-budget.log -- 0.12.1 distribution: Findings 7 lines, Threat Patterns 115w, Missed surfaces 29w]

#### Direction 1C (REJECT): Effort downshift medium -> low

**Mechanism.** Frontmatter `effort: medium` -> `effort: low` for security-reviewer.md.

**Why NOT this direction:**
1. **Anthropic-documented misuse.** Per Anthropic Best Practices "Calibrating effort and thinking depth": "low: Reserve for short, scoped tasks and latency-sensitive workloads that are not intelligence-sensitive." Security review is intelligence-sensitive.
2. **Breaches D-04 amendment 2026-05-02 binding reversion criterion.** The criterion specifies medium as the LOWER bound; lower than medium would require its own A/B study + amendment.
3. **Risk of structural degradation.** Per Anthropic: "At low and medium, the model scopes its work to what was asked rather than going above and beyond." Low may scope so tightly that the agent drops valid findings or skips threat-modeling synthesis.
4. **Plan 07-09 already moved security-reviewer xhigh -> medium and validated the reversion criterion implicitly via 0.12.0 empirical UAT.** Going further down breaks the implicit validation.

**Compatibility with locked decisions:** CONFLICTS with D-04 amendment binding reversion criterion. **Reject.**

#### Direction 1D (REJECT): Smoke fixture cap relaxation 300w -> 330w

**Mechanism.** Edit `D-security-reviewer-budget.sh` line 178 to change `if [ "$AGG_WC" -le 300 ]; then` to `if [ "$AGG_WC" -le 330 ]; then`.

**Why NOT this direction:**
1. **Treats the symptom not the cause.** The fixture cap is the contract. Once relaxed, the agent's empirical envelope continues drifting; future plugin changes would require further cap relaxations. This is the "fight the model" pattern Plan 07-09 explicitly rejected for its predecessor.
2. **Inconsistent with reviewer.md cap.** The reviewer-side fixture cap is also 300w. Asymmetric caps create maintenance burden and signal that the security-reviewer is "looser" than the reviewer, contradicting Plan 07-09's contract-shape parity.
3. **Loses the empirical gate.** The 300w cap was calibrated against caveman empirical baseline + Anthropic 4.7 verbose-by-design + sister-agent envelope. Relaxing it loses the calibration anchor.
4. **Violates Plan 07-09 closure criterion.** Plan 07-09 closed FIND-D + GAP-D-budget-empirical specifically with aggregate 300w. Relaxing the cap re-opens the closure.

**Compatibility with locked decisions:** PASSES D-03 / D-04 mechanically (no agent-side change), but BREAKS Plan 07-09 closure contract. **Reject.**

#### Direction 1E (REJECT WITH RESERVATION): Aggregate self-trim mechanism

**Mechanism.** Add a directive to the END of `## Output Constraint` instructing the agent to count words and rewrite if over-budget:

```
Before emitting your final response, count the words across Findings + Threat Patterns + Missed surfaces. If over 300 words, rewrite to fit under 300. Do this once; if your second draft is still over, prioritize Findings, drop Missed surfaces, then trim Threat Patterns to its minimum (one sentence).
```

**Why NOT this direction (with reservation):**
1. **Empirically untested for length on Sonnet 4.6 / Opus 4.7.** Per Plan 07-09 research Candidate D: "Self-check requires the agent to perform meta-cognition during emission. Opus 4.7's literal interpretation may execute the rewrite step (good) or may execute it inaccurately (bad). Empirical evidence on self-trim for Sonnet 4.6 / Opus 4.7 specifically is not present in the research sources."
2. **Adds complexity without empirical anchor.** The Plan 07-09 research deferred this candidate as Phase 8 fallback; nothing has changed empirically since to elevate it.
3. **Reservation:** if Directions 1A + 1B together still leave aggregate over 300w on plugin 0.12.2 empirical regression-gate, Direction 1E becomes a viable Phase 8 candidate. Defer until empirical evidence demands it.

**Compatibility with locked decisions:** PASSES all D-03 / D-04 / Plan 07-05 / Plan 07-02 constraints. **Defer to Phase 8 unless 1A + 1B insufficient.**

### Trade-offs table for Gap 1

| Direction | Mechanism | Effectiveness | Complexity | Risk | D-03 | D-04 | Closes residual? |
|-----------|-----------|---------------|------------|------|------|------|------------------|
| 1A (RECOMMENDED PRIMARY) | Tighten worked example to ~260w | HIGH (empirical anchor; reviewer-side comparison) | LOW (single-file edit ~30 min) | LOW-MEDIUM | PASS | NEUTRAL | YES (likely; empirical validation on 0.12.2) |
| 1B (RECOMMENDED SECONDARY; composes with 1A) | Per-section cap re-balance 250/160/30 -> 200/100/30 | MEDIUM (addresses arithmetic incompatibility) | LOW (prose edit; optional reviewer-side mirror) | LOW-MEDIUM | PASS | NEUTRAL | YES (composes with 1A) |
| 1C (REJECT) | Effort medium -> low | UNTESTED | LOW | HIGH (intelligence cost) | PASS | CONFLICT | UNKNOWN |
| 1D (REJECT) | Fixture cap 300 -> 330 | NEGATIVE (treats symptom) | TRIVIAL | HIGH (re-opens closure) | PASS | NEUTRAL | NO (relaxes contract) |
| 1E (DEFER) | Aggregate self-trim | UNTESTED | LOW | MEDIUM | PASS | NEUTRAL | UNKNOWN |

### Gap 1 ranked recommendation

**Rank 1 (PRIMARY): Direction 1A (worked-example tightening).** Ship in Plan 07-12 Task 1.

Rationale:
1. Strongest empirical anchor (sister-agent reviewer.md comparison; Anthropic Best Practices "match prompt style"; positive-example steering).
2. Lowest implementation cost (~30 min single-file edit).
3. Lowest risk (worked-example calibration is reversible; smoke fixture is the empirical gate).
4. Composes additively with Direction 1B if needed.

**Rank 2 (SECONDARY; composes with Rank 1): Direction 1B (per-section cap re-balance).** Ship in Plan 07-12 Task 2.

Rationale:
1. Addresses the underlying per-section / aggregate arithmetic incompatibility identified in 07-RESEARCH-WORDBUDGET.md.
2. Tightens operative budget at the section level where the agent currently treats caps as operative.
3. Optional reviewer-side mirror (Plan 07-12 may extend to reviewer.md; planner picks based on reviewer empirical envelope tightening preference).

**Rank 3 (FALLBACK if 1A + 1B insufficient): Direction 1E deferred.** Phase 8 candidate.

**Reject:** Direction 1C (effort downshift) -- breaches D-04 amendment. Direction 1D (cap relaxation) -- breaks closure contract.

### Gap 1 validation strategy

**Smoke fixture verification.** No parser changes needed; existing `D-security-reviewer-budget.sh` already enforces aggregate 300w cap. The fixture is the empirical gate.

**Pre-deployment empirical confirmation (cheap):** re-run `bash D-security-reviewer-budget.sh` 3 times on plugin 0.12.1 BEFORE shipping fix to confirm 326w is reproducible (rules out Hypothesis 4 stochastic-only). Cost: ~15 min total.

**UAT-replay closure criterion.** Plan 07-12 closure is empirically valid when:
- `bash D-security-reviewer-budget.sh` PASSES on plugin 0.12.2 (aggregate <=300w).
- Re-run S4 security-review session (canonical Compodoc + supply-chain scenario per memory `project_compodoc_uat_initial_plan_prompt.md`); aggregate <=300w.
- 07-VERIFICATION.md amendment closes residual-security-reviewer-budget-0_12_1.
- REQUIREMENTS.md GAP-D-budget-empirical row description updated to reference plugin 0.12.2 empirical confirmation across the 0.12.0 -> 0.12.1 -> 0.12.2 progression.

**Optional secondary check:** if planner extends Direction 1B to reviewer.md symmetric, also run `bash D-reviewer-budget.sh` on plugin 0.12.2 to confirm reviewer's tighter caps don't degrade quality.

---

## Gap 2: WR-01/02/03 cross-surface alignment + Class-2 Escalation Hook addition (residual-severity-vocabulary-alignment)

### Diagnosis: scope of each WR item + dependency analysis

#### WR-01 (mechanical, no design decision)

**Surface:** `plugins/lz-advisor/agents/security-reviewer.md:284`

**Current text** (within `## Hedge Marker Discipline` section, security-clearance carve-out):
> When the unresolved hedge concerns a security-clearance question (CVE / supply-chain / advisory / authentication / authorization), the frame attaches to the corresponding `### Findings` entry as a severity downgrade rationale: 'Severity: Medium pending verification of <hedge action>.' Severity escalates if verification confirms the threat; until then, the hedge prevents premature high-severity classification.

**Required change:** `Medium` -> `Suggestion`; `high-severity` -> `important-severity`.

**Dependency analysis:**
- WR-01 is internal to security-reviewer.md; no cross-file dependencies.
- The renamed lexicon was already applied to per-finding severity prefixes (`crit:/imp:/sug:/q:`) on lines 65-68 (line 67 explicitly says `sug:` is "Suggestion (formerly Medium)"). The `## Hedge Marker Discipline` section was missed by Plan 07-09's rename pass.
- Risk if not changed: agent reads conflicting vocabulary (line 67 says "Suggestion (formerly Medium)" + line 284 says "Severity: Medium"); literal interpretation may produce mixed output (e.g., per-finding prefix `sug:` paired with downgrade prose using `Medium`).

**Implementation cost:** TRIVIAL. Two text replacements; ~5 minutes.

**Risk:** LOW.

#### WR-02 (mechanical with one design decision in references/context-packaging.md:388)

**Surfaces:**

1. `plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md:126` -- Phase 1 Scan: "For each finding, include an initial severity assessment (Critical / High / Medium)."
2. `plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md:164` -- Phase 3 Output: "Do NOT: Reformat the security-reviewer's response into severity groups (Critical / High / Medium)..."
3. `plugins/lz-advisor/references/context-packaging.md:289` -- Verification template severity field: "Severity (initial): [Critical/Important/Suggestion for review; Critical/High/Medium for security-review]"
4. `plugins/lz-advisor/references/context-packaging.md:388` -- Verify Request Schema severity attribute: "(Critical / Important / Suggestion for reviewer; Critical / High / Medium for security-reviewer)"

**Required changes:** All 4 occurrences `Critical / High / Medium` -> `Critical / Important / Suggestion`.

**Dependency analysis:**
- Surface 1 (SKILL.md:126) is read by the executor during Phase 1 Scan to determine the severity-assessment vocabulary used when packaging findings for the security-reviewer agent. Mismatch between SKILL.md vocabulary and agent vocabulary causes the executor to package findings in legacy lexicon, then the agent processes them with renamed lexicon, then the agent emits findings with renamed prefixes -- empirically observed in 0.12.1 UAT S4 (4 findings emitted with `crit:/imp:/sug:` prefixes per the fragment-grammar template; legacy `Medium` prose nowhere visible in user-facing output). The mismatch is asymptomatic at runtime (executor and agent both handle the cross-lexicon mapping silently) but the contract is internally inconsistent.
- Surface 2 (SKILL.md:164) is the Phase 3 output template's "do NOT reformat" rule. The legacy lexicon here means the rule names categories that the agent does not actually emit (agent emits `crit:/imp:/sug:/q:` per Plan 07-09 fragment-grammar). Internally inconsistent.
- Surface 3 (context-packaging.md:289) is the Verification template's severity guidance. Read by the executor when constructing security-review consultation prompts. Same mismatch as Surface 1.
- Surface 4 (context-packaging.md:388) is the Verify Request Schema. **Design decision here:** the verify_request severity attribute is consumed by the executor's Phase 3 detection logic in `lz-advisor.review/SKILL.md` (parses `<verify_request>` blocks emitted by the reviewer/security-reviewer agents) per Plan 07-05 D-04. The schema is internal to plugin invocation flow; no external consumer.

**Design decision for Surface 4 (verify_request severity attribute lexicon):**

| Option | Description | Recommendation |
|--------|-------------|----------------|
| Option A: Use renamed lexicon (`Critical / Important / Suggestion`) | Single canonical lexicon; full alignment | RECOMMENDED |
| Option B: Keep legacy lexicon with translation note | Backward-compat; allows in-flight verify_request consumers | NOT RECOMMENDED |
| Option C: Differentiate per-agent (reviewer = Critical/Important/Suggestion; security-reviewer = Critical/High/Medium) | Status quo; preserves divergence | NOT RECOMMENDED |

**Recommendation: Option A.**

Rationale:
1. **No external consumer exists.** The verify_request severity attribute is parsed by `lz-advisor.review/SKILL.md` Phase 3 + `lz-advisor.security-review/SKILL.md` Phase 3 (both internal to the plugin). No marketplace plugin or external tool consumes it.
2. **Backward-compat for an internal contract creates technical debt without benefit.** Option B introduces a translation layer that future plugin maintainers must understand; Option A is simpler.
3. **Keeps a single canonical lexicon across the plugin's internal contract.** Plan 07-09's intent was to align security-reviewer with reviewer; Option A completes the alignment.
4. **Per Anthropic Best Practices "Be clear and direct":** the prompt should be unambiguous; using two lexicons in the same schema attribute (Critical / Important / Suggestion for reviewer; Critical / High / Medium for security-reviewer) is ambiguous and harder to read.

**Implementation cost:** TRIVIAL. Four text replacements across 2 files; ~10 minutes.

**Risk:** LOW. Internal contract change; no external consumers.

**Side observation:** The reviewer-side severity vocabulary (Critical / Important / Suggestion) is already canonical in surface 3 (context-packaging.md:289 first half: "Critical/Important/Suggestion for review"). Plan 07-09 successfully aligned reviewer-side; security-reviewer-side surfaces were missed.

#### WR-03 (structural; section addition mirroring sister agent)

**Surface:** `plugins/lz-advisor/agents/security-reviewer.md` (cross-file reference on line 119; missing self-contained section; carve-out enumeration on line 129 omits the missing section)

**Current state:**

Line 119:
> The `<verify_request>` block (Plan 07-05 Class-2 escalation hook, see `## Class-2 Escalation Hook` in reviewer.md and adapted here for Class 2-S security questions) trails the affected finding line as a separate line, as shown in example 3 above.

Line 129:
> This carve-out preserves the existing `## OWASP Top 10 Lens` section, `## Context Trust Contract`, `## Threat Modeling`, `## Hedge Marker Discipline`, and `## Boundaries` sections byte-identically; the carve-out applies only to the per-finding emit shape inside `### Findings`.

**Issue:** Agents are stateless; security-reviewer cannot read reviewer.md at runtime. The cross-file reference on line 119 is structurally invalid -- the agent has no mechanism to follow it. The line 129 enumeration omits `## Class-2 Escalation Hook` (which does not exist in security-reviewer.md). Together, these create a contract gap: the agent is told to emit `<verify_request>` blocks (per line 117 example 3 + line 119 cross-file pointer), but has no canonical section explaining when to emit them, where to place them inside `### Findings`, what classes (2-S vs 3) are valid, or the one-shot re-invocation expectation.

**Required change:** Add a `## Class-2 Escalation Hook` section to `agents/security-reviewer.md` mirroring `agents/reviewer.md` lines 223-249 byte-identically except for security-specific adaptations:

| Field | reviewer.md | security-reviewer.md adaptation |
|-------|-------------|----------------------------------|
| Class values | "2" / "3" / "2-S" (with "2-S" noted as security-reviewer-only) | "2-S" (primary) / "2" / "3" (secondary; for security-reviewer that surfaces a code-quality dimension or migration-class advisory) |
| Severity attribute values | "critical|important|suggestion" | "critical|important|suggestion" (renamed lexicon per WR-02 Option A) |
| anchor_target convention | "kebab-case identifier like `pv-storybook-10-args-fn-spy`" | "kebab-case identifier like `pv-cve-2025-1234`, `pv-advisory-ghsa-...`, or `pv-compodoc-1-1-0-cves`" (security-specific examples) |
| Worked example | `pv-storybook-10-args-fn-spy` Storybook example | `pv-compodoc-1-1-0-cves` security-advisory example (mirroring the existing security-reviewer.md line 117 example) |
| Schema reference | "per `references/context-packaging.md` 'Verify Request Schema' section" | same; the schema is shared |

**Cross-reference replacement on line 119:**

Replace:
> see `## Class-2 Escalation Hook` in reviewer.md and adapted here for Class 2-S security questions

With:
> see `## Class-2 Escalation Hook` below

**Carve-out enumeration update on line 129:**

Replace:
> This carve-out preserves the existing `## OWASP Top 10 Lens` section, `## Context Trust Contract`, `## Threat Modeling`, `## Hedge Marker Discipline`, and `## Boundaries` sections byte-identically; the carve-out applies only to the per-finding emit shape inside `### Findings`.

With:
> This carve-out preserves the existing `## OWASP Top 10 Lens`, `## Context Trust Contract`, `## Threat Modeling`, `## Class-2 Escalation Hook`, `## Hedge Marker Discipline`, and `## Boundaries` sections byte-identically; the carve-out applies only to the per-finding emit shape inside `### Findings`.

**Section placement.** Place the new `## Class-2 Escalation Hook` section in security-reviewer.md after `## Threat Modeling` and before `## Final Response Discipline` (matching reviewer.md's section ordering: `## Severity Classification`, `## Context Trust Contract`, `## Review Process`, `## Review Focus`, `## Final Response Discipline`, `## Class-2 Escalation Hook`, `## Edge Cases`, `## Hedge Marker Discipline`, `## Boundaries`). Adapted for security-reviewer's section structure: place after `## Threat Modeling`, before `## Final Response Discipline`.

**Implementation cost:** LOW. Section addition (~30 lines mirroring reviewer.md lines 223-249); two text replacements (lines 119 + 129); ~30 minutes including byte-identical adaptation.

**Risk:** LOW. The reviewer.md `## Class-2 Escalation Hook` section is empirically validated on plugin 0.12.0 + 0.12.1 (S3 review reports demonstrated reviewer agent emitting `<verify_request>` blocks correctly per `references/context-packaging.md` "Verify Request Schema" section). The mirroring-with-security-adaptations transfers this empirical validation to security-reviewer with high confidence.

**Compatibility with locked decisions:**
- D-03 phrasing: PASSES (descriptive prose; mirrors reviewer.md style).
- D-04 effort + tools: NEUTRAL.
- Plan 07-05 Class-2 escalation hook: COMPLETES (Plan 07-05 D-04 specifies `<verify_request>` block emission; the missing section in security-reviewer.md is a Plan 07-05 closure gap that Plan 07-09 indirectly surfaced via the cross-file reference but did not close).
- Byte-identical 4-skill canon: NOT TOUCHED (change is in agents/, not skills/).

### Candidate remediation directions for Gap 2

#### Direction 2A (RECOMMENDED): Bundle WR-01 + WR-02 + WR-03 in a single Plan 07-13

**Mechanism.** All three closures ship together as one plan, one commit cycle, one summary. Three task structure:

- Task 1: Apply WR-01 mechanical text replacement in security-reviewer.md:284
- Task 2: Apply WR-02 mechanical text replacements across SKILL.md:126,164 + context-packaging.md:289,388 (with WR-02 Surface 4 design decision = Option A)
- Task 3: Apply WR-03 structural section addition in security-reviewer.md (new `## Class-2 Escalation Hook` section + cross-reference replacement on line 119 + carve-out enumeration update on line 129)
- Task 4: Plugin version bump 0.12.1 -> 0.12.2 + 07-VERIFICATION.md amendment closing residual-severity-vocabulary-alignment + 07-REVIEW.md amendment marking WR-01/02/03 RESOLVED

**Why this works:**
1. All three WR items are scoped to Plan 07-09 contract integrity (severity-vocabulary alignment + Class-2 Escalation Hook completion).
2. Bundling amortizes the version bump and verification amendment cost.
3. Independent files; no ordering dependency between tasks.
4. Mechanical changes (WR-01 + WR-02) compose cleanly with structural change (WR-03).

**Implementation cost:** LOW. Three task types; ~75 minutes total (5 + 10 + 30 + 30 = 75).

**Risk:** LOW.

**Compatibility with locked decisions:** PASSES all D-03 / D-04 / Plan 07-05 / Plan 07-09 constraints; COMPLETES Plan 07-09 contract integrity.

#### Direction 2B (REJECT): Separate Plan 07-13 for WR-01 + WR-02; defer WR-03 to Phase 8

**Why NOT this direction:**
1. **WR-03 is structural and Phase-7-scoped.** The cross-file reference on security-reviewer.md:119 is invalid (agents are stateless); the missing section is a Plan 07-09 closure gap. Deferring WR-03 to Phase 8 leaves Plan 07-09 contract integrity incomplete.
2. **Empirical risk.** Without the self-contained `## Class-2 Escalation Hook` section, the security-reviewer agent has no canonical instructions on Class 2-S `<verify_request>` emission. Empirical 0.12.1 UAT S4 shows the agent produced 4 OWASP-tagged findings but ZERO `<verify_request>` blocks (the agent never escalated even though F1 [A06 CVE deps] is exactly the surface where Class 2-S would fire). This may be a false negative (agent had sufficient context) or it may indicate the agent silently dropped the escalation due to missing canonical instructions. Either way, WR-03 closure de-risks the empirical surface.
3. **Bundling cost is amortized in Direction 2A; separating loses the amortization without benefit.**

**Compatibility:** PASSES locked decisions but produces 2 follow-up plans for ONE Plan 07-09 contract-integrity issue. **Reject.**

#### Direction 2C (REJECT): Status quo with documentation note in 07-VERIFICATION.md

**Why NOT this direction:**
1. **Doesn't fix the contract gap.** WR-01 internal-vocabulary mismatch and WR-03 invalid cross-file reference are real defects; deferring them documents the defect without closing it.
2. **Empirical risk preserved.** Same as Direction 2B point 2.
3. **Avoidance pattern.** The 2026-05-05 re-evaluation explicitly classifies these as NOT-DEFINITIVELY-PHASE-8; the avoidance pattern contradicts the re-evaluation.

**Reject.**

### Trade-offs table for Gap 2

| Direction | Mechanism | Effectiveness | Complexity | Risk | D-03 | D-04 | Closes residual? |
|-----------|-----------|---------------|------------|------|------|------|------------------|
| 2A (RECOMMENDED) | Bundle WR-01 + WR-02 + WR-03 in Plan 07-13 | HIGH | LOW (~75 min total) | LOW | PASS | NEUTRAL | YES (full Plan 07-09 contract integrity) |
| 2B (REJECT) | Separate WR-01+02; defer WR-03 to Phase 8 | PARTIAL | MEDIUM (2 plans) | MEDIUM (Plan 07-09 contract incomplete) | PASS | NEUTRAL | NO (WR-03 deferred) |
| 2C (REJECT) | Status quo + note | LOW | LOW | MEDIUM (defects preserved) | PASS | NEUTRAL | NO (avoidance) |

### Gap 2 ranked recommendation

**Rank 1: Direction 2A (bundle WR-01 + WR-02 + WR-03 in Plan 07-13).**

Rationale:
1. Closes Plan 07-09 contract integrity completely.
2. Lowest total complexity (single plan, single commit cycle).
3. De-risks empirical Class-2 Escalation Hook surface for security-reviewer.
4. Composes cleanly with Plan 07-12 (Gap 1) for paired 0.12.1 -> 0.12.2 PATCH bundle.

**Reject:** Directions 2B and 2C.

### Gap 2 validation strategy

**Mechanical verification (after edit):**
- `git grep -F "Critical / High / Medium" plugins/` returns 0 matches
- `git grep -F "Critical/High/Medium" plugins/` returns 0 matches
- `git grep -F "Severity: Medium pending" plugins/` returns 0 matches
- `git grep -F "premature high-severity" plugins/` returns 0 matches
- `git grep -F "see ## Class-2 Escalation Hook in reviewer.md" plugins/` returns 0 matches
- `git grep "^## Class-2 Escalation Hook" plugins/lz-advisor/agents/security-reviewer.md` returns 1 match

**Structural verification:**
- `bash -n` PASS on all touched files
- `agents/security-reviewer.md` line-count delta = approximately +30 lines (new section) - 2 lines (replacements net zero) = +30 lines net

**Empirical verification (cheap):** re-run `bash D-security-reviewer-budget.sh` on plugin 0.12.2 (verifies the new `## Class-2 Escalation Hook` section addition to the agent prompt does not push security-reviewer over the 300w aggregate cap; validates Direction 2A composes cleanly with Plan 07-12 Direction 1A + 1B).

**UAT-replay closure criterion (optional):** re-run S4 security-review session on plugin 0.12.2 against the canonical Compodoc + supply-chain scenario; verify zero legacy-vocabulary text in the user-facing output (e.g., zero `Severity: Medium` strings); verify the agent emits `<verify_request>` blocks correctly when Class 2-S surfaces are present in the scenario (S4 already exercises Class 2-S via the F1 [A06 CVE deps] finding -- empirical UAT replay should produce at least 1 `<verify_request class="2-S"/>` block).

---

## Plan-level recommendations

### Plan 07-12 (Gap 1: Security-reviewer aggregate budget durability closure)

**Scope:** Restore D-security-reviewer-budget.sh PASS on plugin 0.12.2 + UAT S4 aggregate <=300w.

**Tasks:**
- T1: Replace the holistic worked example in `agents/security-reviewer.md` lines 131-151 with a calibrated ~260w aggregate worked example (Direction 1A).
- T2: Re-balance per-section caps in `agents/security-reviewer.md` Output Constraint section: Findings 250 -> 200, Threat Patterns 160 -> 100, Missed surfaces unchanged at 30 (Direction 1B).
- T3 (optional, planner picks): Mirror Direction 1B to `agents/reviewer.md` (per-section cap re-balance) for symmetric application.
- T4: 07-VERIFICATION.md amendment closing residual-security-reviewer-budget-0_12_1; REQUIREMENTS.md GAP-D-budget-empirical row description updated to reference plugin 0.12.2 empirical confirmation across the version progression.

**Verification:**
- Empirical pre-deployment confirmation (3x re-run of D-security-reviewer-budget.sh on 0.12.1 to confirm 326w reproducibility; rules out Hypothesis 4 stochastic-only)
- bash D-security-reviewer-budget.sh PASS on 0.12.2
- Optional: S4 UAT replay aggregate <=300w on 0.12.2

**Cost:** ~90 minutes including pre-deployment confirmation + post-deployment empirical regression-gate.

### Plan 07-13 (Gap 2: WR-01/02/03 cross-surface alignment + Class-2 Escalation Hook addition)

**Scope:** Complete Plan 07-09 contract integrity (severity-vocabulary cross-surface alignment + Class-2 Escalation Hook self-contained in security-reviewer.md).

**Tasks:**
- T1: Apply WR-01 in security-reviewer.md:284 (mechanical replacement: Medium -> Suggestion; high-severity -> important-severity).
- T2: Apply WR-02 across 4 surfaces (SKILL.md:126 + 164, context-packaging.md:289 + 388; design decision Option A: full alignment, no translation note).
- T3: Apply WR-03 in security-reviewer.md (new `## Class-2 Escalation Hook` section mirroring reviewer.md lines 223-249 with security-specific adaptations; cross-reference replacement on line 119; carve-out enumeration update on line 129).
- T4: 07-VERIFICATION.md amendment closing residual-severity-vocabulary-alignment + 07-REVIEW.md amendment marking WR-01/02/03 RESOLVED.

**Verification:**
- git grep mechanical checks (5 search patterns, all return 0 matches except `## Class-2 Escalation Hook` which returns 1 match)
- bash -n PASS on all touched files
- Optional: S4 UAT replay verifies <verify_request class="2-S"/> emission on 0.12.2

**Cost:** ~75 minutes.

### Sequencing

**Recommend:** Plan 07-12 + Plan 07-13 ship together in a single 0.12.1 -> 0.12.2 PATCH bundle (mirrors the 0.12.0 -> 0.12.1 paired bundle pattern from Plans 07-10 + 07-11).

Rationale:
- Both plans are independent (different files, different mechanisms).
- Bundle amortizes version bump + 07-VERIFICATION.md amendment.
- Combined post-deployment empirical regression-gate (re-run D-security-reviewer-budget.sh + UAT S4) covers both closures in one session.

**Alternative:** Plan 07-12 ships first (highest empirical urgency: smoke fixture FAIL); Plan 07-13 follows (lower urgency: contract integrity, no empirical breakage). The planner picks based on commit-cycle preference.

---

## Plugin SemVer impact

**Recommended: 0.12.1 -> 0.12.2 PATCH.**

Justification:

| Plan | Surfaces touched | Contract-shape change? | SemVer classification |
|------|------------------|------------------------|----------------------|
| 07-12 | `agents/security-reviewer.md` Output Constraint section (worked-example calibration + sub-cap re-balance prose) | NO. Per-finding fragment-grammar shape preserved; aggregate cap preserved at 300w; severity prefixes preserved. Internal prose refinement. | PATCH |
| 07-13 (WR-01) | `agents/security-reviewer.md` line 284 hedge-discipline carve-out (mechanical text replacement) | NO. Severity vocabulary already canonicalized in agent file lines 65-68 per Plan 07-09; this aligns the prose with the agent's per-finding emit lexicon. Internal contract-internal cleanup. | PATCH |
| 07-13 (WR-02) | `lz-advisor.security-review/SKILL.md:126,164` + `references/context-packaging.md:289,388` (mechanical text replacement) | NO for surfaces 1-3 (executor-side guidance; internal). DEBATABLE for surface 4 (verify_request severity attribute schema). | PATCH (with discretion: if planner classifies verify_request severity attribute as externally-visible contract-shape, MINOR) |
| 07-13 (WR-03) | `agents/security-reviewer.md` new `## Class-2 Escalation Hook` section mirroring reviewer.md (additive structural section; cross-reference fix; enumeration update) | NO. Section additive; mirrors existing reviewer.md structure (no new contract surface; existing reviewer.md section is canonical for the schema). The cross-reference fix corrects a structurally-invalid pointer (cross-file pointer in stateless agent). | PATCH |

**The verify_request severity attribute design decision (WR-02 Surface 4) is the only debatable surface.** Per the analysis above:
- If treated as internal contract (Option A; recommended): PATCH.
- If treated as externally-visible contract (would require Option B/C with translation note): MINOR.

The verify_request schema is documented in `references/context-packaging.md` "Verify Request Schema" section, which is internal to the plugin's invocation flow. No external consumer parses verify_request blocks (the executor's Phase 3 detection logic does, internally). PATCH is the correct classification.

**Alternative scenario:** If Plan 07-12 + Plan 07-13 are bundled with the Phase 8 `residual-wip-discipline-reversal` (a contract-shape change per user directive 2026-05-03), the bundle becomes 0.12.1 -> 0.13.0 MINOR. The wip-discipline reversal carries the MINOR bump; Plan 07-12 + Plan 07-13 ride along without changing the SemVer classification.

---

## Open questions for the planner

These are Claude's Discretion items the planner decides in Plan 07-12 + Plan 07-13:

1. **Plan 07-12 -- Exact target word count for the new tighter security-reviewer worked example.** Suggested ~260w aggregate; planner may calibrate ~250-275w based on canonical Compodoc + supply-chain scenario empirical distribution. The 260w target is anchored on reviewer.md's ~220w worked example envelope translated to security-reviewer's higher per-finding word target (22w vs 20w).

2. **Plan 07-12 -- Exact per-section cap reductions in Direction 1B.** Suggested Findings 250 -> 200, Threat Patterns 160 -> 100, Missed surfaces unchanged at 30; planner may calibrate based on canonical scenario empirical distribution (0.12.0 baseline: Findings 155w + Threat Patterns 109w + Missed surfaces 21w = 285w; new caps preserve headroom above this).

3. **Plan 07-12 -- Whether to mirror Direction 1B to reviewer.md.** Suggested OPTIONAL; reviewer's 0.12.1 envelope is 286w / 300 cap (95% of cap); same drift pressure could push reviewer over with future system-prompt complexity additions. Symmetric application is conservative; asymmetric (security-reviewer-only) is minimal-change.

4. **Plan 07-12 -- Whether to add a self-trim mechanism (Direction 1E) as a contingent secondary lever IF Directions 1A + 1B are insufficient on plugin 0.12.2.** Suggested: leave it as Phase 8 candidate; do NOT pre-emptively add. The smoke-fixture pre-deployment confirmation + post-deployment regression-gate is the empirical gate.

5. **Plan 07-13 -- Whether to extend the new `## Class-2 Escalation Hook` section in security-reviewer.md with a Class 2-S-specific worked example.** Suggested YES (1 example mirroring the reviewer.md storybook example shape but with `class="2-S"` + CVE/advisory question; uses the existing `pv-compodoc-1-1-0-cves` example from line 117 for byte-identical re-use). Planner may keep the section minimal if mirror-byte-identical preferred (acceptable; the reviewer.md section is the canonical schema reference).

6. **Plan 07-13 -- Whether to preserve a backward-compat note in `references/context-packaging.md:388` mapping the renamed severity attribute lexicon.** Suggested NO: verify_request severity is internal to plugin invocation flow; no external consumer; backward-compat creates technical debt.

7. **Plan 07-12 + Plan 07-13 sequencing.** Recommend bundling for one plan + one commit cycle to amortize version bump (mirrors Plan 07-10 + Plan 07-11 pattern). Alternative: Plan 07-12 first (smoke fixture FAIL has highest empirical urgency); Plan 07-13 follows.

8. **Plugin version bump.** Suggested 0.12.1 -> 0.12.2 PATCH for the bundle. If bundled with Phase 8 wip-discipline reversal -> 0.13.0 MINOR (contract-shape change carries the minor bump).

9. **Pre-deployment empirical confirmation.** Suggested: re-run `bash D-security-reviewer-budget.sh` 3 times on plugin 0.12.1 BEFORE shipping fix to confirm 326w is reproducible (rules out Hypothesis 4 stochastic-only). Cost: ~15 min.

10. **Whether to extend `B-pv-validation.sh` with an additional assertion checking that severity attribute values in any user-facing surface (plan body, review/security-review body, commit body) match the canonical lexicon (`crit:/imp:/sug:/q:` for per-finding prefix; `Critical/Important/Suggestion` for prose form).** Suggested NO for Plan 07-13 (out of scope; would shift WR-02 from "mechanical text replacement" to "lexicon-policed surface assertion"); flag as Phase 8 candidate.

---

## Sources

### Primary (HIGH confidence)

- [VERIFIED: `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-UAT-REGRESSION-0.12.1.md` Test 6 + Gaps blocks lines 170-198 + 360-440] -- 2026-05-05 autonomous regression-gate session; primary source for Gap 1 + Gap 2 evidence.
- [VERIFIED: `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-VERIFICATION.md` empirical_subverification_2026_05_03 + closure_amendment_2026_05_04 + empirical_subverification_2026_05_05] -- plugin 0.12.0 baseline (S4 285w / 300 cap PASS) + 0.12.1 milestone trail + 2026-05-05 empirical confirmation.
- [VERIFIED: `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/regression-gate-0.12.1/D-security-reviewer-budget.log` lines 1-13] -- direct empirical evidence of smoke fixture FAILURE on 0.12.1 (326w aggregate / 300 cap; per-section sub-caps held).
- [VERIFIED: `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-RESEARCH-WORDBUDGET.md` Diagnostic section lines 481-503 + Anthropic-Recommended Techniques #1-7] -- per-section vs aggregate cap arithmetic incompatibility; Anthropic Best Practices anchors. Direct re-use of prior research.
- [VERIFIED: `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-RESEARCH-GAPS.md` Plans 07-10 + 07-11 ranked recommendation pattern] -- gap-research precedent in this phase; structural pattern (empirical evidence -> hypotheses -> candidates -> trade-offs -> ranked recommendation -> validation strategy) followed here.
- [VERIFIED: `plugins/lz-advisor/agents/security-reviewer.md` lines 52-130 (Output Constraint + Worked example) + line 119 (cross-file reference) + line 129 (carve-out enumeration) + line 284 (Hedge Marker Discipline security-clearance carve-out)] -- direct file content for Gap 1 + Gap 2 surface analysis.
- [VERIFIED: `plugins/lz-advisor/agents/reviewer.md` lines 51-145 (Plan 07-09 fragment-grammar reference implementation) + lines 223-249 (`## Class-2 Escalation Hook` section -- canonical structure for WR-03 mirroring)] -- sister agent baseline + canonical Class-2 Escalation Hook section template.
- [VERIFIED: `plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md` lines 126 + 164 (WR-02 surfaces)] -- direct file content for WR-02 mechanical replacement.
- [VERIFIED: `plugins/lz-advisor/references/context-packaging.md` lines 289 + 388 (WR-02 surfaces) + lines 369-399 (Verify Request Schema)] -- direct file content for WR-02 mechanical replacement + verify_request schema design decision.
- [VERIFIED: `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-security-reviewer-budget.sh`] -- smoke fixture parser logic; aggregate <=300 assertion at line 178.
- [CITED: Anthropic Best Practices "Calibrating effort and thinking depth"](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices) -- "Opus 4.7 has a notable behavioral quirk... it tends to be quite verbose"; "low: Reserve for short, scoped tasks and latency-sensitive workloads that are not intelligence-sensitive." Anchors for Direction 1C rejection (medium -> low would breach D-04 amendment + lower than Anthropic-recommended floor for intelligence-sensitive use cases).
- [CITED: Anthropic Best Practices "Use examples effectively"](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices) -- "Examples are one of the most reliable ways to steer Claude's output format... Include 3-5 examples for best results." Anchor for Direction 1A worked-example tightening.
- [CITED: Anthropic Best Practices "Match prompt style to desired output"](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices) -- "If you are still experiencing steerability issues with output formatting, try matching your prompt style to your desired output style as closely as possible." Anchor for Direction 1A.
- [CITED: Anthropic Best Practices "Code review harnesses"](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices) -- "Report every issue you find, including ones you are uncertain about or consider low-severity. Do not filter for importance or confidence at this stage." Background context for security-reviewer's role (synthesis-and-validation per Plan 07-05 D-04, NOT discovery-stage; the "report every issue" guidance applies to discovery; lz-advisor security-reviewer fragment-grammar is the synthesis-stage fit).
- [CITED: Anthropic Best Practices "More literal instruction following"](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices) -- "Claude Opus 4.7 interprets prompts more literally and explicitly than Claude Opus 4.6, particularly at lower effort levels. It will not silently generalize an instruction from one item to another." Anchor for Hypothesis 2 (per-section caps treated as operative; aggregate cap as descriptive).
- [CITED: Anthropic April 23 postmortem](https://www.anthropic.com/engineering/april-23-postmortem) -- direct quote of April 16 verbosity-reduction instruction reverted at 3% intelligence cost. Anchor for Direction 1E deferral (self-trim mechanism is similar in intent to the April 16 instruction; defer until empirical evidence demands it).

### Reference Implementation (HIGH confidence -- locally verified)

- `plugins/lz-advisor/agents/reviewer.md` lines 223-249 -- canonical `## Class-2 Escalation Hook` section structure for WR-03 mirroring.
- `plugins/lz-advisor/agents/reviewer.md` lines 51-145 -- canonical Plan 07-09 fragment-grammar implementation; sister-agent envelope reference.
- `plugins/lz-advisor/agents/security-reviewer.md` -- target file for Plan 07-12 + Plan 07-13 modifications; current state captured at plugin 0.12.1.

### Secondary (MEDIUM confidence)

- [CITED: `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-09-PLAN.md` + 07-09-SUMMARY.md] -- Plan 07-09 reference implementation: fragment-grammar emit template + effort medium + severity rename. Plan 07-12 + Plan 07-13 are refinements of Plan 07-09's contract-integrity surface.
- [CITED: `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-REVIEW.md` Warnings WR-01/02/03 (commit 26d2899)] -- original surfacing of Gap 2; deferred to Phase 8 in 07-VERIFICATION.md but re-evaluated as in-phase per 2026-05-05 ultrathink.
- [CITED: Memory `feedback_no_wip_commits.md`] -- user directive 2026-05-03; Phase 8 wip-discipline reversal target. Plan 07-12 + Plan 07-13 do NOT introduce or preserve any new `wip:` references.
- [CITED: Memory `reference_sonnet_46_prompt_steering.md`] -- "descriptive triggers + few-shot examples for tool-use steering on 4.x; reserve imperatives for compliance only." Both gap closures honor this.

### Tertiary (LOW confidence; flagged for empirical validation)

- [INFERRED: Direction 1A worked-example tightening empirical effectiveness on plugin 0.12.2 is by analogy to Plan 07-09 reviewer.md ~220w worked example landing reviewer at 197-286w empirical envelope. Transfer to security-reviewer at ~260w worked example is HIGH-confidence direction, MEDIUM-confidence magnitude. Empirical regression-gate on 0.12.2 is the validation step.]
- [INFERRED: Direction 1B per-section cap reductions (250/160/30 -> 200/100/30) are calibrated against the 0.12.0 empirical baseline distribution (155/109/21 = 285); the new caps preserve headroom above the empirical distribution. If the 0.12.2 distribution shifts (more findings, longer threat patterns), the caps may be too tight. Mitigation: empirical UAT replay confirms quality is preserved.]
- [INFERRED: WR-02 Option A (full alignment of verify_request severity attribute lexicon) assumes no external consumer of the verify_request schema. The schema lives in `references/context-packaging.md` which is loaded via @-reference by the SKILL.md files; no marketplace-level external API exposes the schema. If a future plugin extension or external consumer parses verify_request blocks, Option A may need backward-compat. LOW risk.]

---

## Confidence breakdown

| Area | Level | Reason |
|------|-------|--------|
| Empirical signal (Gap 1) | HIGH | 2026-05-05 regression-gate session: smoke fixture FAIL with 326w + UAT S4 314w; both samples agree on direction. 0.12.0 baseline at 285w on same scenario shape provides clean comparator. |
| Gap 1 Hypothesis 1 (worked example near cap) | HIGH | Direct envelope analysis (~265-296w worked example vs 300w cap = 1-12% headroom); sister-agent comparison (reviewer.md ~220w worked example landing at 65-95% of cap empirically). |
| Gap 1 Hypothesis 2 (per-section vs aggregate arithmetic) | HIGH | Direct math: 250+160+30 = 440 vs 300 aggregate; 47% over. Anthropic-documented "literal instruction following" supports the agent treating per-section caps as operative. |
| Gap 1 Direction 1A | HIGH-MEDIUM | Plan 07-09 + reviewer.md empirical validation; Anthropic Best Practices "match prompt style to desired output" anchor. Transfer magnitude on 0.12.2 is the empirical gate. |
| Gap 1 Direction 1B | MEDIUM-HIGH | Addresses arithmetic incompatibility; calibrated against 0.12.0 baseline distribution. Empirical validation via 0.12.2 regression-gate. |
| Gap 1 Direction 1C / 1D / 1E rejection | HIGH | Anthropic Best Practices anchors (low effort wrong tier; cap relaxation breaks closure contract; self-trim untested). |
| Empirical signal (Gap 2) | HIGH | git grep verifications show all 5 + 1 surfaces + 1 missing section; mechanical evidence non-contestable. |
| Gap 2 Direction 2A (bundle WR-01/02/03) | HIGH | Mechanical replacements + structural section addition mirroring sister agent; reviewer.md provides empirically-validated canonical structure. |
| Gap 2 WR-02 Surface 4 design decision (Option A) | HIGH | No external consumer of verify_request schema; full alignment is simpler than backward-compat. |
| Plugin SemVer 0.12.1 -> 0.12.2 PATCH | HIGH | All surfaces are refinements of existing rules; no contract-shape change visible to plugin consumers. |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Direction 1A (worked-example tightening to ~260w) + Direction 1B (per-section cap re-balance 200/100/30) compose to bring security-reviewer aggregate under 300w on plugin 0.12.2. | Gap 1 ranked recommendation | MEDIUM. If 1A + 1B are insufficient on 0.12.2 empirical regression-gate, planner has Direction 1E (self-trim) as Phase 8 fallback. The 0.12.0 empirical baseline (285w) shows the cap is reachable; 1A + 1B should restore that baseline plus headroom. |
| A2 | Hypothesis 1 (worked-example near cap edge) is the dominant cause of the 0.12.0 -> 0.12.1 regression vs Hypothesis 4 (stochastic spread). | Gap 1 diagnosis | LOW-MEDIUM. Pre-deployment 3x re-run of D-security-reviewer-budget.sh on 0.12.1 confirms reproducibility (rules out stochastic-only); cheap empirical check. If reproducibility is mixed, the diagnosis shifts toward stochastic and Direction 1A is less impactful. |
| A3 | The reviewer.md `## Class-2 Escalation Hook` section structure (lines 223-249) is the canonical template for WR-03 mirroring; security-reviewer-specific adaptations (class="2-S"; severity values from renamed lexicon; security-specific anchor_target conventions) preserve byte-identical structure. | Gap 2 WR-03 | LOW. The reviewer.md section is empirically validated on 0.12.0 + 0.12.1 (S3 review demonstrates reviewer agent emitting `<verify_request>` blocks correctly). Adaptation is mechanical; risk is minimal. |
| A4 | The verify_request severity attribute schema (`references/context-packaging.md:388`) has no external consumer; Option A (full alignment, no backward-compat) is correct. | Gap 2 WR-02 Surface 4 | LOW. The schema is internal to plugin invocation flow; no marketplace-level API exposes it. If a future external consumer emerges, backward-compat can be added then. |
| A5 | Plan 07-12 + Plan 07-13 ship together as a paired bundle (vs separate or sequential). | Plan-level recommendations | LOW. Both are independent (different files, different mechanisms); ordering is operational. The bundle amortizes the 0.12.1 -> 0.12.2 version bump. Planner may unbundle if commit-cycle preference dictates. |
| A6 | Plugin SemVer for the bundle is 0.12.1 -> 0.12.2 (PATCH); if rolled into Phase 8 wip-discipline reversal, becomes 0.13.0 (MINOR). | Plugin SemVer impact | LOW. SemVer convention; planner picks based on bundle composition. The verify_request severity attribute change is the most debatable surface; Option A (recommended) keeps it PATCH. |
| A7 | Direction 1B per-section cap reductions (250/160/30 -> 200/100/30) preserve quality without forcing scope reduction. | Gap 1 Direction 1B | LOW-MEDIUM. The 0.12.0 empirical baseline distribution (155/109/21) leaves 45/-9/9w headroom under the new caps. If 0.12.2 distribution shifts (more findings; longer threat patterns), the caps may be too tight. Mitigation: empirical UAT replay confirms findings count + threat-pattern correctness preserved. |
| A8 | Pre-deployment 3x re-run of D-security-reviewer-budget.sh on plugin 0.12.1 will show reproducible 326w (or close to it) -- ruling out Hypothesis 4 stochastic-only. | Gap 1 validation strategy | LOW. The smoke fixture spawns its own claude.exe with a fixed canonical scenario; same prompt across runs. Spread of 25-40w is plausible empirically per 0.12.0 baseline (285w one run; UAT shape 285-314w on 0.12.0 vs 0.12.1). 3 reproducible over-cap samples (e.g., 326, 318, 332) confirm reproducibility. |

**If user disagrees with any assumed claim, signal in /gsd-discuss-phase iteration before plan execution.** All 8 assumptions are bounded-risk choices within the discretion CONTEXT.md grants the planner; none changes the load-bearing fix architecture.

---

## Metadata

**Research date:** 2026-05-05
**Valid until:** 2026-06-04 (30-day window for Anthropic prompting best practices doc currency; 14-day window for community sources on Sonnet 4.6 / Opus 4.7).

## RESEARCH COMPLETE

**Phase:** 07 Gap closures 2 (residual-security-reviewer-budget-0_12_1 + residual-severity-vocabulary-alignment)
**Confidence:** HIGH

### Key findings

- **Gap 1 (security-reviewer aggregate 326w / 300 cap on plugin 0.12.1):** Direction 1A (tighten worked example from ~265-296w to ~260w aggregate) + Direction 1B (per-section cap re-balance 250/160/30 -> 200/100/30) compose to restore empirical compliance. Direction 1A is the structural change (worked-example anchor); Direction 1B is the arithmetic-incompatibility fix. Direction 1C effort downshift rejected per D-04 amendment binding reversion criterion. Direction 1D fixture cap relaxation rejected per Plan 07-09 closure contract. Direction 1E aggregate self-trim deferred as Phase 8 fallback. Smoke fixture `D-security-reviewer-budget.sh` is the empirical gate; closure criterion = bash D-security-reviewer-budget.sh PASSES on plugin 0.12.2 + canonical UAT S4 replay shows aggregate <=300w.
- **Gap 2 (WR-01/02/03 cross-surface alignment):** Direction 2A (bundle WR-01 + WR-02 + WR-03 in single Plan 07-13) is the recommended approach. WR-01 + WR-02 are mechanical text replacements (5 surfaces; ~15 minutes); WR-03 is a structural section addition (`## Class-2 Escalation Hook` mirroring reviewer.md lines 223-249 byte-identically except for security-specific adaptations: class="2-S"; renamed severity lexicon; security-specific anchor_target conventions). WR-02 Surface 4 (verify_request severity attribute schema) design decision: Option A (full alignment of internal contract; no backward-compat note) is recommended since no external consumer parses the schema. Closure criterion = git grep mechanical checks return 0 matches for legacy patterns; bash -n PASS on touched files; optional UAT S4 verifies <verify_request class="2-S"/> emission.
- **Plugin SemVer:** 0.12.1 -> 0.12.2 PATCH for the bundle (both plans are refinements of existing rules; no contract-shape change visible to plugin consumers). If bundled with Phase 8 wip-discipline reversal: 0.13.0 MINOR.
- **Out of scope (preserved):** wip-discipline reversal (Phase 8 directive per user 2026-05-03); P8-03 Pre-Verified Contradiction Rule; P8-12 Cross-Skill Hedge Tracking auto-detect; P8-18 advisor narrative-SD self-anchor leak; Class-1 recall A/B study; reviewer-side severity vocabulary (already aligned).

### File created

`D:\projects\github\LayZeeDK\lz-advisor-claude-plugins\.planning\phases\07-address-all-phase-5-x-and-6-uat-findings\07-RESEARCH-GAPS-2.md`

### Confidence assessment

| Area | Level | Reason |
|------|-------|--------|
| Gap 1 empirical signal | HIGH | 2026-05-05 regression-gate session: smoke fixture FAIL with 326w + UAT S4 314w; both samples agree on direction; 0.12.0 baseline at 285w on same scenario shape; sister-agent reviewer.md at 286w stays under cap. |
| Gap 1 Direction 1A + 1B | HIGH-MEDIUM | Plan 07-09 + reviewer.md empirical validation; Anthropic Best Practices anchors. Transfer magnitude on 0.12.2 is the empirical gate. |
| Gap 1 Direction 1C / 1D / 1E rejection | HIGH | Anthropic Best Practices anchors + Plan 07-09 closure contract preservation. |
| Gap 2 empirical signal | HIGH | git grep verifications show all 5+1 surfaces + 1 missing section; mechanical evidence non-contestable. |
| Gap 2 Direction 2A | HIGH | Mechanical replacements + structural section addition mirroring sister agent; reviewer.md provides empirically-validated canonical structure. |
| Gap 2 WR-02 Surface 4 design decision (Option A) | HIGH | No external consumer of verify_request schema; full alignment is simpler than backward-compat. |
| Plugin SemVer 0.12.1 -> 0.12.2 PATCH | HIGH | All surfaces are refinements of existing rules; no contract-shape change visible to plugin consumers. |

### Open questions for planner

10 enumerated items in "Open questions for the planner" section above; the load-bearing ones are:

1. Plan 07-12 worked example word-count target (suggested ~260w; planner calibrates ~250-275w) and per-section cap reductions (suggested 200/100/30; planner calibrates).
2. Plan 07-12 Direction 1B reviewer-side mirror (suggested OPTIONAL; symmetric vs asymmetric application).
3. Plan 07-13 WR-02 Surface 4 lexicon decision (suggested Option A full alignment; planner picks).
4. Plan 07-13 Class-2 Escalation Hook worked example inclusion (suggested YES; planner picks).
5. Pre-deployment 3x reproducibility check on plugin 0.12.1 BEFORE shipping fix (suggested YES; cheap; rules out Hypothesis 4 stochastic-only).
6. Plan 07-12 + Plan 07-13 sequencing (suggested bundle in 0.12.1 -> 0.12.2 PATCH; planner may unbundle).

### Ready for gap-closure planning

Plan 07-12 (Gap 1: security-reviewer aggregate budget durability closure) and Plan 07-13 (Gap 2: WR-01/02/03 cross-surface alignment + Class-2 Escalation Hook addition) can now be drafted. Recommended Tasks shape:

**Plan 07-12 (Gap 1):**
- T1: Replace `agents/security-reviewer.md` lines 131-151 holistic worked example with calibrated ~260w aggregate (Direction 1A)
- T2: Re-balance per-section caps in Output Constraint section (Direction 1B): Findings 250 -> 200, Threat Patterns 160 -> 100, Missed surfaces unchanged at 30
- T3 (optional): Mirror Direction 1B to reviewer.md for symmetric application
- T4: Plugin version bump 0.12.1 -> 0.12.2 + 07-VERIFICATION.md amendment closing residual-security-reviewer-budget-0_12_1 + REQUIREMENTS.md GAP-D-budget-empirical row update

**Plan 07-13 (Gap 2):**
- T1: WR-01 mechanical replacement in security-reviewer.md:284 (Medium -> Suggestion; high-severity -> important-severity)
- T2: WR-02 mechanical replacements across 4 surfaces (SKILL.md:126,164 + context-packaging.md:289,388) with Option A full alignment
- T3: WR-03 structural section addition in security-reviewer.md (`## Class-2 Escalation Hook` mirroring reviewer.md lines 223-249 with security-specific adaptations) + cross-reference replacement on line 119 + carve-out enumeration update on line 129
- T4: Plugin version bump 0.12.1 -> 0.12.2 (or merge with Plan 07-12 if bundled) + 07-VERIFICATION.md amendment closing residual-severity-vocabulary-alignment + 07-REVIEW.md amendment marking WR-01/02/03 RESOLVED

If both plans land together: single 0.12.1 -> 0.12.2 PATCH bump; one combined VERIFICATION.md amendment closing both residuals; one combined REVIEW.md amendment marking WR-01/02/03 RESOLVED.

**Result: PASSED.** Research complete; structured returns to orchestrator follow.
