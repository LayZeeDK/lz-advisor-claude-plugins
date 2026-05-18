# Phase 8: Resolve Phase 7 sealing residuals + reverse wip-discipline + clear Phase 8 carry-forward backlog - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md -- this log preserves the alternatives considered.

**Date:** 2026-05-08
**Phase:** 08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle
**Areas discussed:** Plan bundling granularity, P2-ADVISOR structural redesign gate, Version bump cadence, P3 carry-forward scope in Phase 8

---

## Plan bundling granularity

### Q1: What plan structure do you want for Phase 8?

| Option | Description | Selected |
|--------|-------------|----------|
| Medium (5 plans, recommended) | P0 wip / P1 parser+PFV bundle / P2 measure / P2 structural conditional / P3 mechanical bundle. Honors SemVer cadence; conditional structural plan only ships if measurement triggers. | [x] |
| Tight (3 plans) | P0+P1 bundled / P2 measure / P3 bundle. Smallest changelog but loses SemVer fidelity. | |
| Loose (7+ plans) | Each priority surface own plan; P3 split per item. Maximum audit granularity but plan overhead heavy for 1-line P3 edits. | |
| Medium minus conditional | P0 wip / P1 parser+PFV / P2 measure-only / P3 mechanical (4 plans). P2 structural deferred to Phase 9. | |

**User's choice:** Medium (5 plans, recommended)
**Notes:** Plan 5 (P3 mechanical) was further refined in Q2.

### Q2: Where do WR-04 + WR-05 (legacy lexicon edits in context-packaging.md) belong?

| Option | Description | Selected |
|--------|-------------|----------|
| Standalone Plan 5 (recommended) | Dedicated plan, ~5 lines across 2 edits. Clean and atomic. | [x] |
| Bundle with Plan 1 (P0 wip) | Both touch documentation surfaces; reduces to 4 plans. | |
| Defer to Phase 9 | Out of scope; carry-forward continues. | |

**User's choice:** Standalone Plan 5 (recommended)

---

## P2-ADVISOR structural redesign gate

### Q1: What gate criterion triggers P2-ADVISOR structural redesign?

| Option | Description | Selected |
|--------|-------------|----------|
| Mean > 100w AND >=2/3 FAIL (initially recommended) | Robust to stochastic noise (Plan 07-12 precedent). | |
| Mean > 100w (any) | Simpler binary gate. | |
| Mean > 100w AND >=2/3 FAIL AND code-block items dominant | Strongest evidentiary bar. | |
| Code-block items only > cap (specialized) | Targets known failure mode. | |

**User asked to clarify Q1 then asked "How could we make 'Mean >100w AND >=2/3 FAIL AND code-block items dominant' less complex?"**

**Claude proposed 3 simplification approaches:**

| Variant | Predicate | Operationalization |
|---------|-----------|-------------------|
| A. Drop mean clause | "≥2/3 FAIL AND code-block items dominant" | 2 clauses; loses non-code-block aggregate coverage |
| B. Stratified mean | "Mean code-block-item word count > 22w" | 1 clause; eliminates dominance attribution step |
| C. Code-block-FAIL count | "≥2/3 runs code-block-FAIL" | 1 clause; mirrors Plan 07-12 precedent verbatim |

**Recommended at this stage: C** (cheapest, audit-clear, mirrors precedent).

**User asked: "Would C still cover mean word count and fail gate?"**

**Claude clarified: No -- C is narrower by design.** Misses pure prose-drift (aggregate >100w with all items <22w) and per-item outlier on prose-only items. Proposed 3 coverage-restoring variants:

| Variant | Predicate | Notes |
|---------|-----------|-------|
| C1. Compound OR-gate | "(≥2/3 code-block-FAIL) OR (mean aggregate >100w AND ≥2/3 aggregate FAIL)" | Restores full coverage |
| C2. Gate C + observability note | Single predicate; alternative findings captured separately | One predicate; explicit findings |
| C3. Gate C with prose-drift escape valve | Gate C closes P2 AND opens NEW residual on prose drift | One predicate + automatic handoff |

**Recommended at this stage: C2** (simplicity + observability).

**User asked: "What is the trade-off of Option C?"**

**Claude explained concrete trade-offs:**

- Pros: Single predicate, mirrors Plan 07-12 verbatim, directly tests structural redesign hypothesis, audit-clear
- Cons: Misses non-code-block drift (false-negative risk), observability loss without C2, inherits Plan 07-16 n=1 attribution bias
- Risk profile: Low false-positive risk (≥2/3 FAIL filters stochastic); medium false-negative risk if regression mode shifts; medium observability loss without C2

**User asked: "What would you recommend and why if going for highest quality?"**

**Claude recommended: Compound OR-gate + disposition rule + measurement artifact** with full design:

```
D1 (code-block disjunct): >=2/3 runs have >=1 code-block item over per-item outlier cap
D2 (aggregate disjunct): mean aggregate >100w AND >=2/3 runs have aggregate >100w

Disposition rule:
  - D1 alone -> fragment-grammar template extension to advisor.md
  - D2 alone -> density example audit in advisor.md
  - Both -> ship both atomically
  - Neither -> close P2 residual

Measurement artifact (08-MEASUREMENT.md):
  Per run: aggregate words, per-item words, per-item code-block flag, gate decision
```

**User confirmed: "Go for the highest quality choice."**

**User's final choice:** Compound OR-gate + disposition rule + measurement artifact (highest quality)

### Q2: Which heterogeneous scenarios for n>=3 measurement?

| Option | Description | Selected |
|--------|-------------|----------|
| Compodoc + feature + refactor (recommended) | n=3 fresh sessions; matches Plan 07-12 sample size; covers config-heavy / new-code / restructuring axes. | [x] |
| Compodoc + Storybook + Angular signals | n=3 but weakly heterogeneous (all public-library scenarios). | |
| Full spectrum (n=5) | Compodoc + feature + refactor + bug-fix + migration. ~1.5x cost. | |
| Compodoc + feature + refactor + 1 prose-only fixture | n=3 task-type + 1 dedicated prose-only scenario. | |

**User's choice:** Compodoc + feature + refactor (recommended)

### Q3 (post "Why are we doing this?" clarification on gate purpose)

**User asked: "Why are we doing this?" -- Claude offered three levels (discuss-phase ceremony / P2-ADVISOR elaboration / Phase 8 itself). User clarified: "I mean explain the P2-ADVISOR gate"**

**Claude explained:** The gate is the empirical-evidence threshold for committing engineering work on a residual where n=1 evidence (Plan 07-16) is ambiguous. Plan 07-12 precedent: a 326w security-reviewer aggregate looked like a real regression but reclassified as stochastic outlier after 3x re-run. Same reasoning applies here; gate distinguishes real regression (ship structural plan) from stochastic outlier (close residual).

**User confirmed: "We want the most complete, highest quality solution. No shortcuts."**

### Q4: D2 aggregate threshold structure?

| Option | Description | Selected |
|--------|-------------|----------|
| Hybrid: mean hard 100w + per-run +10% (recommended) | Mean across n=3 runs <=100w (hard cap); per-run aggregate has +10% tolerance (matches commit ef97e21 fixture-parser convention). D2 fires only when mean >100w AND >=2/3 runs have per-run aggregate >110w. | [x] |
| Hard 100w (no tolerance) | Strongest signal-detection but aggressive. | |
| 100w + 10% tolerance everywhere | Symmetric with fixture-parser layer convention. | |
| Wilson 95% CI lower bound >100w | Statistically principled at n>=10; underpowered at n=3. | |

**User's choice:** Hybrid: mean hard 100w + per-run +10% (recommended)

### Q5: Plan 4 conditional re-run policy?

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-extend on borderline (recommended) | Plan 3 outputs PASS / FAIL / INCONCLUSIVE with mechanical borderline band. INCONCLUSIVE auto-triggers Plan 3.5 (n=2 more, total n=5); re-evaluate at n=5. | [x] |
| Single-shot (no re-run) | n=3 is final. Borderline forced to binary outcome. | |
| Planner discretion | Plan 3 outputs measurement + recommendation; planner judges. | |
| Always extend to n=5 | Statistically strongest; 1.5x baseline cost upfront. | |

**User's choice:** Auto-extend on borderline (recommended)

### Q6: Per-item outlier cap structure for D-advisor-budget.sh?

**Claude corrected an earlier error:** previously quoted borderline band as `[22w, 25w]` -- that's reviewer/security-reviewer precedent. Advisor canon per Plan 07-10 is bimodal: 15w hard for fragment items / 22w hard for Assuming-frame items.

| Option | Description | Selected |
|--------|-------------|----------|
| Current canon + soft outlier band (recommended) | Fragment items: 15w/17w. Assuming-frame: 22w/25w. Aggregate: 100w/110w. D1 FAIL = item > hard cap. INCONCLUSIVE = item in soft outlier zone. Matches commit ef97e21 +10% convention. | [x] |
| Current canon (no soft band) | 15w/22w hard cap; D1 FAIL binary. Loses tri-state symmetry. | |
| Code-block carve-out (30w) | Different residual; resolves P2 via cap adjustment, not structural redesign. | |
| Uniform 22w (drop bimodal) | Simpler parser; loses Assuming-frame intent. | |

**User's choice:** Current canon + soft outlier band (recommended)

---

## Version bump cadence

### Q1: What's the version bump cadence for Phase 8?

| Option | Description | Selected |
|--------|-------------|----------|
| Tight multi-step, PATCH-first (recommended) | 0.13.1 -> 0.13.2 (P1) -> 0.13.3 (P5) -> 0.14.0 (P0 wip) -> 0.14.1 (P4 if ships). SemVer honored verbatim. | [x] |
| Grouped by SemVer class (2 publishes) | 0.13.1 -> 0.13.2 (PATCH bundle) -> 0.14.0 (MINOR bundle). Mixes plan boundaries with version boundaries. | |
| All-in single 0.14.0 MINOR | One publish after all 5 plans land. Loses SemVer fidelity. | |
| Atomic per-plan | 5 separate bumps. Maximum fidelity; heavy ceremony. | |

**User's choice:** Tight multi-step, PATCH-first (recommended)

### Q2: Plan 4 conditional version classification?

**User declined the question and asked for clarification.**

**Claude offered clarification points** (fragment-grammar vs per-section XML structural difference; PATCH vs MINOR signal; escalation trigger; disposition rule interaction; whether version classification matters here).

**User responded: "You know what, version numbers don't matter. This is still a prerelease plugin only used and tested by myself."**

**This SUPERSEDED Q1 of this area.** The "Tight multi-step PATCH-first" choice from Q1 collapses to "planner picks any coherent trail." D-04 in CONTEXT.md records this; feedback memory `feedback_version_numbers_not_load_bearing_prerelease.md` created to persist across sessions. Atomic 5-surface sync (`plugin.json` + 4 SKILL.md frontmatter `version:` fields) preserved as hard constraint.

---

## P3 carry-forward scope in Phase 8

### Q1: What's the P3 carry-forward scope in Phase 8?

| Option | Description | Selected |
|--------|-------------|----------|
| Evidence-weighted: P8-18 + FIND-F obs (recommended) | Total 7 plans. Plan 6 = P8-18 self-anchor through advisor narrative SD prose (empirical Phase 7 closure evidence). Plan 7 = FIND-F Class-2 Escalation Hook observability (Plan 07-13 PARTIAL; designed trigger fixture). P8-03 + P8-12 defer to Phase 9. | [x] |
| All P3 (kitchen sink) | Total 9 plans. Includes P8-03 + P8-12 + P8-18 + FIND-F obs. Ships defensive rules without empirical evidence. | |
| Mechanical only | Total 5 plans. P8-18 deferred despite empirical evidence. | |
| Evidence + 1 defensive (P8-12 piggyback) | Total 8 plans. P8-18 + FIND-F obs + P8-12 (has Plan 07-03 D-07 structural foundation). P8-03 still defers. | |

**User's choice:** Evidence-weighted: P8-18 + FIND-F obs (recommended)
**Notes:** Phase 8 final plan count: 7 plans (5 from D-01 medium bundling + 2 from evidence-weighted P3).

---

## Claude's Discretion

- PFV outlier_soft_cap target value in Plan 2: 75w vs 80w on D-security-reviewer-budget.sh
- Symmetric vs asymmetric PFV cap raise (D-reviewer also or D-security-reviewer only)
- Feature implementation + refactor prompt composition for Plan 3 (Compodoc prompt is locked; other two need composition)
- Code-block detection regex in Plan 3 parser (backtick-fenced vs inline `<code>` vs indented)
- Plan 7 fixture extension vs standalone (extend E-verify-before-commit.sh path-e vs new F-class-2-escalation.sh)
- Plan 6 sub-rule placement (Common Contract Rule 5b extension vs new Rule 5c)
- Plan 1 ordering relative to other plans (independent; planner picks)
- Plan 4 version classification IF it ships (PATCH default; MINOR if escalation path triggers; D-04 makes this documentation-grade)
- All version trail decisions (D-04 collapses to planner discretion)

## Deferred Ideas

- P8-03 Pre-Verified Contradiction Rule -- Phase 9 (no empirical evidence)
- P8-12 Cross-Skill Hedge Tracking auto-detect -- Phase 9 (no empirical evidence)
- Per-section `<output_constraints>` XML extension to advisor.md -- only ships in Plan 4 IF escalation path triggers; otherwise carries to Phase 9 as available structural alternative
- n=10 statistical gate (Wilson 95% CI) for P2-ADVISOR -- reserved for "still INCONCLUSIVE at n=5" worst case (Plan 3.6 conditional)
- 1.0.0 marketplace-readiness cut -- after carry-forward backlog clears
- Reviewer + security-reviewer per-section XML contract changes -- Plan 07-14 canon preserved
- Hard-rules layer for word-budget -- Phase 7 D-03 deferred unless hybrid insufficient
- maxTurns cap removal or SendMessage-based bidirectional advisor -- architectural; deferred since Phase 5.3+
- README "Recommended prompt shape" section -- polish phase
- Pattern D as claude -p linter / pre-flight check -- Phase 6 deferred
- Plugin README update for Phase 8 contract changes -- polish phase
- TeammateIdle hook analog -- "no hooks for v1"
- Reviewer iterative re-invoke loop -- Spotify Honk one-shot principle
- Pro / Free plan tier UAT cross-tier verification -- structurally impossible from Team subscription
- Todo `research-rtk-command-suitability-for-skills-and-agents` -- reviewed; out of Phase 8 scope (token-saving wrapper unrelated to verify-chain-integrity sealing residuals)
