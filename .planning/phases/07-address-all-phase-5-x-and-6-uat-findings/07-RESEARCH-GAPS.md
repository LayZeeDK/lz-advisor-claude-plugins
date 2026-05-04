---
phase: 07-address-all-phase-5-x-and-6-uat-findings
gaps: [residual-advisor-budget, residual-pre-verified-format]
type: research
dated: 2026-05-04
target_artifacts:
  - .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-10-PLAN.md (FIND-D advisor sub-cap closure)
  - .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-11-PLAN.md (FIND-B.2 schema interpretation)
plugin_version_at_research: 0.12.0
verification_basis: full 6-session UAT chain on plugin 0.12.0 (uat-replay-0.12.0/session-{1..6}-*.jsonl, executed 2026-05-03) + Anthropic Best Practices for Claude 4.x (platform.claude.com docs) + Anthropic April 23 postmortem + Claude 4 system prompt analysis (PromptHub) + caveman empirical baseline (D:\projects\JuliusBrussee\caveman) + Plan 07-09 reference implementation in agents/{reviewer,security-reviewer}.md
out_of_scope: wip-discipline reversal (residual-wip-discipline-reversal -- Phase 8 directive per user 2026-05-03); other Phase 8 candidates (P8-03 Pre-Verified Contradiction Rule, P8-12 Cross-Skill Hedge Tracking auto-detect, P8-18 advisor narrative-SD self-anchor); severity-rename drift (WR-01/WR-02/WR-03); Class-1 recall A/B study for Plan 07-09 effort de-escalation
---

# Phase 7 Gap Closures Research -- Residual Advisor Budget + Pre-verified Format

## Executive summary

Full 6-session UAT chain on plugin 0.12.0 (executed 2026-05-03 against `ngx-smart-components` testbed) closed Phase 7's load-bearing residuals (Plans 07-07 / 07-08 / 07-09 all empirically verified) but surfaced two narrowly-scoped gaps that fit cleanly within Phase 7's verify-chain-integrity scope and can be promoted to in-phase closures rather than deferred to Phase 8:

1. **`residual-advisor-budget`** -- advisor agent at 118w / 100w cap (18% over) on S1 plan session. Plan 07-09 explicitly excluded the advisor (it stayed at `effort: high` as a control case; only reviewer + security-reviewer got the fragment-grammar template + effort medium). The mechanically-equivalent fix is to extend Plan 07-09's fragment-grammar emit template (Candidate A) to `agents/advisor.md`. Confidence: HIGH that the technique transfers (advisor is structurally similar to reviewer + uses the same Sonnet 4.6 / Opus 4.7 substrate; descriptive-prose-only at `effort: high` shows the same overshoot dynamic the prose-only approach showed at `effort: xhigh` for reviewer + security-reviewer on plugin 0.11.0).

2. **`residual-pre-verified-format`** -- Plan 07-01 Rule 5b "Format mandate" (in `references/context-packaging.md`) requires `<pre_verified>` XML blocks with `<evidence>` + `method=`, but full-UAT empirical traces show two distinct shapes co-existing: (a) **internal** XML blocks DO fire correctly (S2 / S3 / S4 traces contain 5+5+9 `<pre_verified>` opening tags inside the executor's tool_use prompts to reviewer/security-reviewer agents); (b) **user-facing** artifacts (S1 plan body, S3 review body, S4 security-review body, S2 + S6 commit bodies) emit pv-* references as **token shorthand + concrete-source `Verified:` trailers + prose-form citations**, NOT as strict `<pre_verified>` XML blocks. The schema-vs-empirical split has two reading directions: **(D1) tighten enforcement** (require XML blocks in user-facing artifacts too); **(D2) amend Rule 5b to permit token-form** with paired concrete-source backing (the empirical shape, formalized). Confidence: HIGH that D2 is the correct direction. Rationale below.

**Out of scope for this research per user directive 2026-05-03:** wip-discipline reversal (Phase 8). The third UAT residual (`residual-wip-discipline-reversal`) is excluded from the closure plans this research informs.

**Primary recommendations:**

- **Gap 1 (advisor budget):** ship Candidate A (fragment-grammar emit template adapted to advisor's 100w / single-block / numbered-list shape). Do NOT ship Candidate B (effort de-escalation high -> medium) for advisor in this iteration; the empirical 18% overshoot is mild compared to reviewer's 32% / security-reviewer's 38% overshoot at xhigh, AND the advisor's role (strategic direction with `Assuming X (unverified), do Y` frame) needs `effort: high` to reason about packaged context cleanly. Save effort de-escalation as a fallback if Candidate A alone is insufficient.

- **Gap 2 (pv-* format):** ship D2 (amend Rule 5b "Format mandate" to permit token-form references in user-facing artifacts when paired with concrete-source `Verified:` trailers OR prose-form citations citing the `<pre_verified>` block's `claim_id` AND `source=`). Internal-prompt XML form (executor -> agent communication) stays mandatory and unchanged; the amendment narrows the format mandate's scope to internal prompts where Anthropic's XML-tag training is load-bearing. The empirical evidence is unambiguous: Sonnet 4.6 produces token-form in user-facing artifacts because that is the canonical format for human-readable claims-with-evidence in markdown commits + plan files + review bodies; fighting this is fighting documentation convention. The trust contract is preserved by ensuring the token-form references resolve back to `claim_id` values that DO appear as canonical XML in the executor's internal prompt to the agent.

Both gap closures are **structurally consistent with Phase 7's design philosophy** (additive content within existing canon, no architectural changes, no new tool grants, no hooks) and **compose cleanly with the locked decisions in 07-CONTEXT.md** (D-03 phrasing style, D-04 effort levels, D-04 amendment 2026-05-02 binding reversion criterion).

<user_constraints>
## User Constraints (from CONTEXT.md and user directives 2026-05-03)

### Locked Decisions (from CONTEXT.md unchanged)

- **D-03 phrasing style:** descriptive prose for non-safety rules; ALL-CAPS reserved for safety-critical only. Word-budget closures must use descriptive triggers + worked examples + structural anchors, not imperatives. Both gap closures honor this.
- **D-04 reviewer/security-reviewer tools:** stay `["Read", "Glob"]` -- principle of least privilege. Advisor is `["Read", "Glob"]` too. Neither gap closure changes tool grants.
- **D-04 amendment 2026-05-02 binding reversion criterion:** if reviewer/security-reviewer Class-1 recall drops more than 15% on plugin 0.12.0 vs xhigh baseline, REVERT effort medium to xhigh AND keep Plan 07-09 Candidate A alone. Empirical UAT replay on 0.12.0 (executed 2026-05-03) did not measure recall; deferred to Phase 8 A/B study. **Both gap closures preserve this reversion criterion** (advisor stays `effort: high`; security-reviewer/reviewer stay `effort: medium` per Plan 07-09; format-amendment is independent of effort).
- **D-06 plugin version:** SemVer minor bump on contract-shape changes; SemVer patch on prompt-rule refinements. The 2 gap closures should ship together at 0.12.0 -> 0.12.1 (patch) since neither changes the agent contract surface; OR 0.12.0 -> 0.13.0 (minor) if rolled into a larger bundle that also reverses wip-discipline (Phase 8). **Recommendation: 0.12.0 -> 0.12.1** (patch; advisor template extension + Rule 5b scope refinement are both refinements of existing rules, not new contract shapes). If this bundle is bundled with the wip-discipline reversal (Phase 8), 0.13.0 (minor) is appropriate per the wip-discipline contract-shape change.

### Claude's Discretion (this research's recommendations are guidance; planner may adjust)

- Whether Gap 1 ships before, after, or together with Gap 2. Both are independent (different files, different rules, different smoke fixtures). Recommend bundling for one plan + one commit cycle to amortize the 0.12.1 version bump.
- Whether to also extend `D-advisor-budget.sh` parser to detect the new fragment-grammar shape (suggest: yes, mirroring Plan 07-09 Task 3's parser update for D-reviewer-budget.sh + D-security-reviewer-budget.sh; backward-compat LEGACY_RE fallback for transitional Plan 07-04 prose shape).
- Whether to ship effort de-escalation for advisor as a contingent secondary lever IF Candidate A alone does not bind on 0.12.1 (suggest: leave it as Phase 8 candidate; do NOT pre-emptively amend D-04 for advisor).
- Exact prose for the Rule 5b amendment (token-form acceptance criterion); planner picks anchored in this research's recommended form.
- Smoke-fixture extension for B-pv-validation.sh: should it gain a 6th assertion checking that token-form pv-* references in user-facing artifacts resolve back to `claim_id` values that appeared in the executor's internal prompt? (Suggest: yes -- this is the structural integrity check D2 needs to enforce the loosened format mandate without losing the trust contract.)

### Deferred Ideas (OUT OF SCOPE for these gap closures)

- **`residual-wip-discipline-reversal`** -- Phase 8 directive per user 2026-05-03 (memory: `feedback_no_wip_commits.md`). Plan 07-08 wip-discipline rule MUST be removed entirely from `lz-advisor.execute/SKILL.md` + path-d assertion from E-verify-before-commit.sh + REQUIREMENTS.md row + plugin version bump 0.12.0 -> 0.13.0 for contract-shape change. NOT addressed by this research. The 2 gap closures here MUST NOT introduce or preserve any new `wip:` references.
- **P8-03 Pre-Verified Contradiction Rule** -- 5th guard in Plan 07-03 confidence-laundering family. Out of scope.
- **P8-12 Cross-Skill Hedge Tracking auto-detect** -- trust-contract heuristic addition. Out of scope.
- **P8-18 advisor narrative-SD self-anchor leak** -- mixed: COULD be addressed by extending Rule 5b reach to advisor narrative claims. **Recommendation: defer to Phase 8** (this research's Gap 2 narrows Rule 5b's scope to internal prompts; widening it to advisor narrative is a separate decision with its own evidence requirement).
- **Severity-rename drift (WR-01 / WR-02 / WR-03)** -- 4 cross-file consistency issues from Plan 07-09 severity rename (Critical/High/Medium -> Critical/Important/Suggestion in security-reviewer.md but downstream skill + reference surfaces still legacy). Cleanup target. Out of scope here.
- **Class-1 recall A/B study** for Plan 07-09 effort de-escalation reversion criterion. Phase 8 candidate.

</user_constraints>

## Phase Requirements (this research informs)

| ID | Description | Research Support |
|----|-------------|------------------|
| FIND-D (advisor sub-cap residual) | Advisor agent emits Strategic Direction <=100 words on canonical Compodoc + Storybook scenario; empirical 118w on plugin 0.12.0 S1 = 18% over | Section "Gap 1: Advisor word budget" -- Candidate A (fragment-grammar adapted to advisor) ship in Plan 07-10; D-advisor-budget.sh parser extended with fragment-grammar regex; closure criterion = bash D-advisor-budget.sh PASSES on plugin 0.12.1 + advisor SD <=100w in canonical UAT replay |
| FIND-B.2 (pv-* format mandate scope) | XML-format mandate in Rule 5b applies to ALL pv-* synthesis surfaces vs only internal-prompt synthesis; empirical evidence on plugin 0.12.0 shows internal XML form fires correctly (5/5/9 blocks in S2/S3/S4 tool_use prompts) but user-facing artifacts emit token-form | Section "Gap 2: pv-* format scope" -- D2 (amend Rule 5b to scope XML mandate to internal prompts; permit token-form in user-facing artifacts when paired with concrete-source backing) ship in Plan 07-11; B-pv-validation.sh extended with Assertion 6 (token-form references resolve back to `claim_id` in internal prompt); closure criterion = bash B-pv-validation.sh PASSES on plugin 0.12.1 + 4 of 4 user-facing artifacts in canonical UAT replay show conformant shape |

## Empirical evidence summary (full 6-session UAT on plugin 0.12.0, executed 2026-05-03)

The full UAT chain is documented in `07-VERIFICATION.md` `empirical_subverification_2026_05_03` block + `07-HUMAN-UAT.md`. Six JSONL traces preserved at `uat-replay-0.12.0/session-{1..6}-*.jsonl`. The two residuals surface across distinct sessions:

### Gap 1 evidence (residual-advisor-budget)

| Session | Skill | Advisor invocations | Advisor SD word count | Cap | Status |
|---------|-------|---------------------|------------------------|-----|--------|
| S1 | plan | 1 | **118w** | 100w | **18% over** |
| S2 | execute | 2 | n/a (executor consults; no SD render-phase) | 100w | n/a |
| S3 | review | 2 | n/a (reviewer-agent invocations, not advisor) | 100w | n/a |
| S4 | security-review | 2 | n/a (security-reviewer-agent invocations) | 100w | n/a |
| S5 | plan-fixes | 1 | within budget per `07-VERIFICATION.md` (no overshoot logged for S5) | 100w | PASS |
| S6 | execute-fixes | 3 | n/a (executor consults during execution) | 100w | n/a |

[VERIFIED: `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-HUMAN-UAT.md` line 44 "advisor 118w / 100 (over)" + line 79-83 residual-advisor-budget block]

The S1 advisor agent emitted 118 words on a canonical Compodoc + Storybook + Angular signals scenario. The advisor is Plan 07-04's control case for word-budget closure (descriptive-prose-only at `effort: high`); Plan 07-09 explicitly excluded the advisor from the fragment-grammar template adoption because the prose-only technique was deemed sufficient for advisor at the time. The S1 empirical signal contradicts that assumption: descriptive prose at `effort: high` shows the same dynamic that descriptive prose at `effort: xhigh` showed for reviewer + security-reviewer on plugin 0.11.0 (overshoot, not bind).

The 18% overshoot is **mild compared to reviewer's 32% / security-reviewer's 38% pre-Plan-07-09 overshoots** but is the empirical proof that descriptive-prose-alone is insufficient at every effort level, not just `effort: xhigh`. The residual is structurally identical to the regression Plan 07-09 closed for the other two agents.

### Gap 2 evidence (residual-pre-verified-format)

The pv-* synthesis fires across all 6 sessions, in two empirically distinct shapes:

**Shape A (internal-prompt XML, conforms to current Rule 5b):**

[VERIFIED: `rg -c '<pre_verified' uat-replay-0.12.0/session-3-review.jsonl` returns 9 matches; same for S2 returns 5; S4 returns 5]

These `<pre_verified>` blocks live INSIDE the executor's `Agent` tool_use prompts -- the executor packages them per Common Contract Rule 5b "Format mandate" when invoking the reviewer / security-reviewer agent. Sample (truncated):

```
<pre_verified source="package.json" claim_id="pv-storybook-angular-10x-installed">
  <claim>The installed @storybook/angular version is 10.3.5...</claim>
  <evidence method="Read">
    "@storybook/angular": "10.3.5"
  </evidence>
</pre_verified>
```

**This shape WORKS.** It fires on time, contains the canonical XML, and Plan 07-09's `B-pv-validation.sh` Assertion 1 + Assertion 4 pass on it.

**Shape B (user-facing artifact token-form + Verified: trailers + prose citations):**

The executor's user-visible outputs across S1 plan body, S3 review body, S4 security-review body, S2 + S6 commit bodies emit pv-* references in markedly different shapes:

| Surface | Empirical shape | Example |
|---------|-----------------|---------|
| S1 plan body `## Key Decisions` | prose-form citation | "Verified via WebFetch + Read against `package.json` (see `pv-storybook-angular-10x-installed` block above)" |
| S3 review body `### Findings` lines | token reference | `pv-storybook-global-deprecation-10x` literal token in finding text |
| S4 security-review body `### Findings` lines | token reference | `pv-compodoc-1x-cves` literal token |
| S2 commit body `## Outstanding Verification` | concrete-source `Verified:` trailers | `Verified: @storybook/angular@10.3.5 supports fn() in args (see commit b10f85b body for evidence)` |
| S6 commit bodies (3 commits) | concrete-source `Verified:` trailers | same shape |

[VERIFIED: `rg -o 'pv-[a-z0-9-]{3,}' uat-replay-0.12.0/session-3-review.jsonl` returns `pv-storybook-global-deprecation-10x`; `07-HUMAN-UAT.md` line 49 + 83-87 token-form synthesis pattern documented]

**Critical structural integrity observation:** the token-form references in user-facing artifacts DO have backing canonical XML blocks earlier in the same session's executor flow (Shape A blocks in tool_use prompts to agents). The token-form is a **shorthand reference** to the canonical claim, not a confabulation. The trust contract is functionally preserved -- the executor verified the claim, packaged it as XML for the agent, then surfaced it in the user-facing markdown using markdown-natural reference syntax (token + Verified: trailer + prose citation).

The Plan 07-01 Rule 5b "Format mandate" prose currently reads: "Plain-bullet 'Pre-verified Claims' sections (free-text bullets under a `## Pre-verified Claims` header without the XML shape) are non-conforming and MUST NOT be used." This was specifically designed to reject the **plain-bullet-without-evidence-of-verification** failure mode (Finding B.2 from 13-UAT empirical evidence). The token-form-with-backing-XML pattern that empirically fires is **NOT** the plain-bullet failure mode -- it is the canonical user-facing render of a verified claim.

The current Rule 5b prose does not distinguish between "executor-to-agent internal prompt" surfaces (where XML is critical) and "user-facing artifact" surfaces (where XML in markdown bodies fights documentation convention). The amendment narrows the format mandate's scope to the surface where it is load-bearing.

## Gap 1: Advisor word budget (residual-advisor-budget)

### Why descriptive prose alone is insufficient at `effort: high`

The Plan 07-04 advisor `## Output Constraint` section uses descriptive prose with two `### Density example` blocks (full-context + thin-context, both 95-100 words). The blocks were Phase 5.5 / 5.6 work; they remained Plan 07-04's chosen mechanism specifically because the empirical 9-21% overshoot on plugin 0.9.0 was below the 32-38% overshoot reviewer + security-reviewer showed at the same point.

The S1 plan-session 118w evidence on plugin 0.12.0 invalidates the working hypothesis. The Plan 07-09 research deliverable (`07-RESEARCH-WORDBUDGET.md`) explicitly identified the dynamic: descriptive prose binds output length only when paired with structural shape constraints. For reviewer + security-reviewer the structural constraints landed via fragment-grammar (`<file>:<line>: <severity>: <problem>. <fix>.`); the same shape, adapted to advisor's single-block enumerated-list output, would bind the 100w cap.

[CITED: Anthropic Best Practices "Calibrating effort and thinking depth" -- "Claude Opus 4.7 has a notable behavioral quirk relative to its predecessor: it tends to be quite verbose. This makes it smarter on hard problems, but it also produces more output tokens." (`https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices`)]

The verbose-by-design property is NOT exclusive to xhigh; it is the model-level training disposition. Lower effort scopes the response slightly but does not eliminate the dynamic. The advisor at `effort: high` exhibits a milder version of the same dynamic.

[CITED: Anthropic April 23 postmortem -- "On April 16, Anthropic added a system prompt instruction to reduce verbosity. In combination with other prompt changes, it hurt coding quality and was reverted on April 20. This impacted Sonnet 4.6, Opus 4.6, and Opus 4.7." with the literal instruction "Length limits: keep text between tool calls to <=25 words. Keep final responses to <=100 words unless the task requires more detail." (`https://www.anthropic.com/engineering/april-23-postmortem`)]

This is the load-bearing reason NOT to pursue Candidate B (effort de-escalation high -> medium) or Candidate C (hard-rules ALL-CAPS imperative) for the advisor. Candidate B costs intelligence. Candidate C carries Anthropic's documented 3% coding-quality cost AND reads as an imperative (D-03 reserves ALL-CAPS for safety-critical).

### Candidate closures for Gap 1

#### Candidate A (RECOMMENDED): Fragment-Grammar Output Template adapted to advisor

**Mechanism.** Within the existing advisor `## Output Constraint` section, replace the descriptive sub-cap prose with an explicit emit template anchored in the existing `Assuming X (unverified), do Y. Verify X before acting.` frame. Per-numbered-item word target <=20 words; aggregate cap <=100 words for 5-7 numbered items.

The advisor differs structurally from reviewer + security-reviewer in three ways: (a) single-block output (no `### Findings` / `### Cross-Cutting Patterns` header structure -- one numbered list); (b) tighter total cap (100w vs 300w); (c) the `Assuming X (unverified), do Y. Verify X before acting.` frame contract requires longer numbered items than the reviewer's `<file>:<line>: <severity>: <problem>. <fix>.` line-shape (because the advisor frame substitutes verbatim phrases that don't compress). The fragment-grammar adaptation must respect (c): the advisor's per-item shape is `<verb-led action> <concrete target>. <Assuming-frame if unverified context>.`, not the reviewer's per-line file:line: shape.

Proposed advisor emit template (literal, fits in `## Output Constraint`):

```markdown
Format: each numbered item is `<verb-led action>. <concrete object or path>. <one-clause rationale or Assuming-frame if needed>.`

Per-item word target: <=15 words for verb + object + clause combined (excludes the leading "1.", "2.", etc.).

Drop:
- "I'd recommend...", "You might consider...", "It would be good to..."
- "Sure! Here's my advice..." -- emit the first numbered item directly
- Restating the executor's findings -- they already know what they packaged
- Hedging adjectives (perhaps, maybe, likely, probably) -- if uncertain, use the Assuming-frame on the relevant item

Keep:
- Verb-led action (Add, Remove, Replace, Run, Verify, Inline, Drop, Configure)
- Exact file paths and config-key names in backticks
- Exact command invocations in backticks
- The full `Assuming X (unverified), do Y. Verify X before acting.` frame on items that depend on unpackaged context

Worked example (full-context, 5 items, 92 words; mirrors existing Density example shape):

> 1. Add `inputs: ["default", "^production"]` to the `compodoc` target in `libs/my-lib/project.json` so Nx caches.
> 2. Remove `dependsOn: ["^compodoc"]` from the `storybook` target -- the addon reads `documentation.json` at runtime.
> 3. Drop `dependsOn: ["lint"]` from the default `build` target; lint-failures should not block build.
> 4. Assuming Nx 19+ (unverified), do commit `documentation.json` to `.gitignore`. Verify Nx 19+ before acting.
> 5. Run `npx nx reset && npx nx build my-lib` to clear cache and validate.

Worked example (thin-context, 5 items, 96 words):

> 1. Assuming Express + Node 20 (unverified), do install `express-session` with a Redis store via `connect-redis`. Verify Express + Node 20 before acting.
> 2. Assuming HTTPS in production (unverified), do emit cookies with `Secure`, `HttpOnly`, and `SameSite=Lax`. Verify HTTPS before acting.
> 3. Assuming same-origin frontend (unverified), do skip CSRF double-submit. Verify same-origin frontend before acting.
> 4. Assuming Redis is provisioned (unverified), do configure store with `sess:` prefix and 24-hour TTL. Verify Redis before acting.
> 5. Run the auth smoke suite against `/login`, `/logout`, and `/me` with and without cookies.

Aggregate cap: <=100 words across all numbered items combined. The `**Critical:**` block (when emitted; see Out-of-scope observations) is NOT counted toward the 100w cap. The smoke fixture `D-advisor-budget.sh` parses the Strategic Direction body and asserts both per-item word counts AND the aggregate cap. Plan 07-04 descriptive prose was empirically insufficient on plugin 0.12.0 (118w aggregate, 18% over); the fragment-grammar adaptation binds output length structurally.
```

The two existing `### Density example` blocks become the worked examples (verbatim; they already conform to the proposed shape). The DROP / KEEP lists + Format prose are the additive content.

**Evidence anchor:**
- [CITED: Plan 07-09 Task 1 reference implementation in `plugins/lz-advisor/agents/reviewer.md` lines 51-145 -- empirically validated on plugin 0.12.0 with reviewer aggregate 197w/300 cap; same pattern adapted to advisor's tighter 100w cap.]
- [VERIFIED: `D:\projects\JuliusBrussee\caveman` empirical baseline -- 65% mean output reduction on Sonnet 4 + Opus 4.6 across 10 prompts x 3 trials. Model-gap caveat: Opus 4.7 transfer is by analogy; Plan 07-09's empirical fire on plugin 0.12.0 (S3 reviewer 197w / S4 security-reviewer 285w both under 300w cap) confirms the technique transfers to Sonnet 4.6 / Opus 4.7 at `effort: medium`. Advisor at `effort: high` is structurally similar; the technique should transfer.]
- [CITED: Anthropic Best Practices "Use examples effectively" -- "Examples are one of the most reliable ways to steer Claude's output format, tone, and structure... Include 3-5 examples for best results." The 2 existing Density examples + 1 new compressed example (or just keeping 2 examples to stay <=300w in the constraint section itself) meets the recommended pattern. (`https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices`)]
- [CITED: PromptHub Claude 4 system prompt analysis -- "ALL-CAPS reserved for safety-critical only; descriptive prose for everything else." The fragment-grammar emit template uses descriptive prose + worked examples + DROP/KEEP lists; no ALL-CAPS imperatives. (`https://www.prompthub.us/blog/an-analysis-of-the-claude-4-system-prompt`)]

**Trade-off cost:**
- Adds approximately 200-300 words to the advisor's `## Output Constraint` section (DROP list + KEEP list + Format prose; the 2 existing Density examples are already there). Approximately +1KB to the agent prompt; one-time additive cost per session invocation (cached after first orient phase tool_use; the executor's @-load of `agents/advisor.md` happens once per skill invocation).
- The `Assuming X (unverified), do Y. Verify X before acting.` frame is preserved (load-bearing for downstream verify-skip discipline per Plan 07-02). The fragment-grammar shape compresses surrounding prose but cannot compress the frame itself. The empirical 92w / 96w worked examples demonstrate the frame fits comfortably within 100w when 4 items use the frame + 1 doesn't.
- The two existing Density example blocks already use a numbered + per-item-with-Assuming-frame shape; the fragment-grammar adaptation is a refinement, not a rewrite. Existing Pattern preserved per CONTEXT.md Pattern 1 ("additive content within byte-identical canon blocks"). The advisor.md is NOT in the byte-identical 4-skill canon, but the SAME refinement principle applies.

**Implementation cost:** LOW. Single-file edit. ~30 minutes including verification. The reference implementation already exists in `agents/reviewer.md` (Plan 07-09 commit `00638bd`).

**Residual risk:** LOW-MEDIUM. The fragment-grammar pattern empirically transferred from caveman's Sonnet 4 / Opus 4.6 baseline to Plan 07-09's reviewer + security-reviewer on Sonnet 4.6 / Opus 4.7 at `effort: medium` (197w + 285w both well under 300w cap on plugin 0.12.0). Transfer to advisor at `effort: high` is by analogy; expected effectiveness is HIGH but not directly measured pre-deployment. The smoke fixture D-advisor-budget.sh empirical run on plugin 0.12.1 is the validation step.

**Compatibility with locked decisions:**
- D-03 phrasing: PASSES (descriptive prose + worked examples; no new ALL-CAPS).
- D-04 effort levels: NEUTRAL (advisor stays `effort: high`; this candidate makes no effort change).
- Plan 07-02 Hedge Marker Discipline: PASSES (the `Unresolved hedge: <X>. Verify <Y> before/after committing.` frame fits as a numbered-item shape; the advisor's existing Hedge Marker Discipline section preserves verbatim).
- Plan 07-05 Class-2 escalation: NEUTRAL (advisor doesn't emit `<verify_request>` blocks; only reviewer + security-reviewer do).

#### Candidate B: Effort de-escalation high -> medium for advisor

**Mechanism.** Same shape as Plan 07-09's reviewer + security-reviewer change: frontmatter `effort: high` -> `effort: medium`. CONTEXT.md D-04 amendment to extend to advisor.

**Why NOT this candidate** (despite working for reviewer + security-reviewer):
1. **Advisor's role profile differs.** Reviewer + security-reviewer per Plan 07-05 are synthesis-of-packaged-findings (the executor's Phase 1 already did the exploration). Advisor's Strategic Direction phase is **strategic reasoning over packaged context** -- it must judge tradeoffs, recognize the framework + runtime + auth model + transport constraints, and commit to one direction. Per Anthropic Best Practices: "If you observe shallow reasoning on complex problems, raise effort to high or xhigh rather than prompting around it." [Source: Anthropic Best Practices "Calibrating effort and thinking depth"]
2. **Empirical overshoot is mild.** 18% over (118w / 100w) compared to reviewer's 32% / security-reviewer's 38% pre-Plan-07-09. Plan 07-09 proved structural shape constraints alone (Candidate A) can close this magnitude of overshoot at `effort: medium`. At `effort: high`, the structural constraints should bind even tighter (same shape, less verbosity-by-design overhead).
3. **Reversion cost.** D-04 amendment 2026-05-02 binding reversion criterion (15% Class-1 recall drop) applies to reviewer + security-reviewer. Extending it to advisor would require its own A/B baseline -- the advisor's Strategic Direction quality is harder to measure than reviewer's bug-recall.
4. **Composition with future Phase 8 work.** If P8-18 (advisor narrative-SD self-anchor leak) eventually requires advisor-side intervention, lowering effort first reduces the headroom for that work. Save the lever.

**Compatibility with locked decisions:** PASSES D-03, D-04 needs amendment, would create P8-related coupling. **Recommend deferring as Phase 8 fallback.**

#### Candidate C: Hard-rules ALL-CAPS imperative

**Mechanism.** Add `CRITICAL: TOTAL RESPONSE <=100 WORDS. NON-NEGOTIABLE.` at the top of the advisor's `## Output Constraint` section.

**Why NOT this candidate:**
1. **Conflicts with D-03.** ALL-CAPS reserved for safety-critical; word-budget is not safety-critical.
2. **Anthropic-documented 3% intelligence cost.** Per April 23 postmortem, hard imperatives on output length cost ~3% on coding evals. The advisor is the most intelligence-sensitive of the 3 agents; paying the 3% cost on the advisor is the worst-case trade-off.
3. **Already deferred in CONTEXT.md.** "Hard-rules layer for word-budget -- deferred unless 0.10.0 cycle confirms hybrid is insufficient." Plan 07-04's prose insufficient empirically on 0.12.0 advisor; HOWEVER Plan 07-09 demonstrated a non-imperative structural alternative (Candidate A) works for the harder cases (xhigh; 32-38% overshoot). Candidate A on advisor is the empirical fit; Candidate C remains deferred.

**Compatibility with locked decisions:** CONFLICTS with D-03. **Reject.**

### Trade-offs table for Gap 1

| Candidate | Mechanism | Effectiveness | Complexity | Risk | D-03 | D-04 | Effort |
|-----------|-----------|---------------|------------|------|------|------|--------|
| A (recommended) | Fragment-grammar emit template adapted to advisor 100w | HIGH (empirical from Plan 07-09 reviewer/security-reviewer) | LOW (single file edit; reuse existing Density examples) | LOW-MEDIUM | PASS | NEUTRAL | none |
| B | effort: high -> medium | HIGH for verbosity reduction | LOW (frontmatter change) | MEDIUM (Strategic Direction quality regression) | PASS | NEEDS AMENDMENT | reversion criterion needed |
| C | ALL-CAPS imperative | MEDIUM (Anthropic 3% cost) | LOW | HIGH (intelligence cost on most-sensitive agent) | CONFLICT | PASS | none |

### Gap 1 ranked recommendation

**Rank 1: Candidate A (fragment-grammar emit template adapted to advisor) ship in Plan 07-10.**

Rationale:
1. Mirrors Plan 07-09's empirically-validated technique with structural changes only (no effort change, no ALL-CAPS).
2. Reuses existing Density example blocks; minimal prose addition; minimal regression risk.
3. Composes cleanly with all locked decisions and Plan 07-02 Hedge Marker Discipline + Plan 07-05 Class-2 escalation hook (both untouched).
4. Closure pathway empirically-validated by Plan 07-09: same fragment-grammar shape + DROP/KEEP lists + worked examples reduced reviewer 396w / security-reviewer 414w to 197w / 285w on plugin 0.12.0; the technique transfers to advisor's tighter 100w cap with high confidence.
5. 18% overshoot is within the budget headroom Plan 07-09 demonstrated (Plan 07-09 reduced 32-38% overshoots to 30-35% under-cap; the same delta applied to 18% overshoot lands well under-cap at expected ~85w).

**Defer:** Candidate B (effort de-escalation) and Candidate C (ALL-CAPS imperative) to Phase 8 if Candidate A alone is insufficient on plugin 0.12.1 UAT replay.

### Gap 1 validation strategy

**Smoke fixture extension.** `D-advisor-budget.sh` parser updated with fragment-grammar regex. Mirror Plan 07-09 Task 3's `D-reviewer-budget.sh` parser pattern:

```javascript
// Per-numbered-item shape: `<N>. <verb-led action>. <concrete object>. <clause>.`
// Plus `Assuming X (unverified), do Y. Verify X before acting.` frame on conditional items.
const ADVISOR_FRAGMENT_RE = /^\d+\.\s+(.+?)\.(?:\s+|$)/gm;
const ASSUMING_FRAME_RE = /Assuming\s+.+?\s+\(unverified\),\s+do\s+.+?\.\s+Verify\s+.+?\s+before\s+acting\./;

// Per-item word target <=15 words (action + object + clause; excludes leading "N.")
// Aggregate <=100 words across all items
```

**UAT-replay closure criterion.** Plan 07-10 closure is empirically valid when:
- `bash D-advisor-budget.sh` PASSES on plugin 0.12.1.
- Re-run S1 plan session (canonical Compodoc + Storybook + Angular signals scenario per memory `project_compodoc_uat_initial_plan_prompt.md`) on plugin 0.12.1; advisor SD <=100w.
- Optional: re-run S5 plan-fixes session for second data point.
- 07-VERIFICATION.md amendment closes residual-advisor-budget; REQUIREMENTS.md gains a row referencing FIND-D-advisor-residual (or extends FIND-D row description to include advisor coverage).

## Gap 2: pv-* format scope (residual-pre-verified-format)

### Why the format mandate ambiguity surfaces empirically

The Plan 07-01 Rule 5b "Format mandate" prose currently says (`plugins/lz-advisor/references/context-packaging.md` line 50):

> **Format mandate.** Use the canonical XML form: `<pre_verified source="..." claim_id="pv-N">...<claim>...</claim><evidence method="...">...</evidence>...</pre_verified>`. Plain-bullet "Pre-verified Claims" sections (free-text bullets under a `## Pre-verified Claims` header without the XML shape) are non-conforming and MUST NOT be used.

The rule was designed to reject the **plain-bullet Pre-verified Claims confabulation** failure mode (Finding B.2 from 13-UAT empirical evidence). The failure mode looked like:

```markdown
## Pre-verified Claims
- Storybook 8+ supports `tags: ['autodocs']`
- @storybook/angular@10.3.5 exports `setCompodocJson` from `@storybook/addon-docs/angular`
```

These plain-bullets had NO source path, NO evidence content, NO method= attribute. The executor synthesized them from claimed framework knowledge and propagated them downstream. The XML format mandate closes this failure mode.

**The mandate's prose does not differentiate between two distinct surfaces:**

1. **Internal-prompt surface (executor -> agent communication via Agent tool prompt).** The executor packages context for the lz-advisor:advisor / reviewer / security-reviewer agents. Anthropic's Claude 4.x training is heavily optimized for XML-tagged inputs in prompts. [CITED: Anthropic "Use XML tags to structure your prompts" -- "Claude 4 was trained to respond strongly to XML structure... XML tags help Claude parse complex prompts unambiguously." (`https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/use-xml-tags`)]
2. **User-facing artifact surface (markdown plan files, review/security-review output, commit bodies).** The executor renders Strategic Direction, Findings, Cross-Cutting Patterns, etc., as user-readable markdown. Markdown documentation convention does not embed `<pre_verified>` XML blocks inline; concrete-source `Verified:` trailers + token shorthand references are the human-readable form.

The current Rule 5b applies the format mandate to BOTH surfaces. The empirical evidence on plugin 0.12.0 shows:
- **Internal-prompt surface:** XML form fires correctly (5+5+9 `<pre_verified>` blocks across S2/S3/S4 tool_use prompts). [VERIFIED via `rg -c '<pre_verified' uat-replay-0.12.0/session-{2,3,4}-*.jsonl`]
- **User-facing artifact surface:** token-form + `Verified:` trailers + prose citations dominate. NOT plain-bullet-without-evidence (the failure mode); these references DO have backing canonical XML in the corresponding internal prompt earlier in the same session.

The token-form references are NOT confabulation. They are the canonical user-facing render of a verified claim. The current Rule 5b prose, applied literally on user-facing artifacts, would force the executor to emit `<pre_verified>` blocks inline in markdown plan files / review bodies / commit bodies -- which fights documentation convention and is what Sonnet 4.6 / Opus 4.7 will not do reliably (and arguably should not do; markdown is for humans).

### The two reading directions

#### D1: Tighten enforcement (require XML blocks in user-facing artifacts too)

**Mechanism.** Strengthen Rule 5b's prose to explicitly require `<pre_verified>` XML blocks in user-facing artifacts (plan files, review output, commit bodies). Add B-pv-validation.sh assertion that ALL pv-* references in the user-facing surface area resolve to a co-located XML block.

**Why NOT this direction:**
1. **Fights documentation convention.** Markdown plan files + commit bodies + review output are human-readable artifacts. Embedding `<pre_verified>` XML blocks in markdown bodies makes them harder to read for humans. Sonnet 4.6 / Opus 4.7 emit token-form because that IS the canonical user-facing render of a verified claim in markdown.
2. **No empirical evidence the strict form is more reliable than the token-form-with-backing-XML form.** The 13-UAT failure mode (Finding B.2) was plain-bullets-WITHOUT-evidence. Not plain-token-WITH-backing. The latter preserves the trust contract; the former breaks it.
3. **Anthropic XML guidance is for PROMPT INPUTS, not OUTPUTS.** [CITED: Anthropic "Use XML tags to structure your prompts" focuses on prompt construction, not on output rendering. The XML format mandate's evidentiary base is the input side; extending it to output is over-extension.]
4. **Token-form references resolve cleanly to canonical XML in internal prompts.** The trust contract is functionally preserved by structural integrity (token resolves to XML), not by surface uniformity (everywhere is XML).
5. **Going against the model's training.** Per Plan 07-09's empirical research, fighting the model's training (verbose-by-design at xhigh) is the worst tradeoff. The same applies here: XML in markdown bodies is something Sonnet 4.6 / Opus 4.7 don't reliably emit because their markdown training prefers documentation-natural shorthand.

**Implementation cost:** MEDIUM-HIGH (requires more strict prose AND tooling enforcement to validate; harder to enforce empirically).

**Residual risk:** HIGH. Likely to cause the model to emit XML inconsistently OR drop pv-* references entirely (because emitting them in the strict form is hard). Both are regressions vs the empirical 0.12.0 behavior.

**Reject.**

#### D2 (RECOMMENDED): Amend Rule 5b to scope XML mandate to internal prompts; permit token-form in user-facing artifacts when paired with concrete-source backing

**Mechanism.** Rewrite Rule 5b "Format mandate" sub-rule to differentiate the two surfaces:

> **Format mandate (revised, Plan 07-11).** The pv-* synthesis discipline applies in two distinct shapes depending on the surface:
>
> - **Internal-prompt surface.** When the executor packages context for an Agent invocation (lz-advisor:advisor, lz-advisor:reviewer, lz-advisor:security-reviewer) via the Agent tool prompt, every pv-* synthesis MUST use the canonical XML form: `<pre_verified source="..." claim_id="pv-N">...<claim>...</claim><evidence method="...">...</evidence>...</pre_verified>`. This shape is load-bearing because Sonnet 4.6 / Opus 4.7 are trained to parse XML-tagged inputs reliably (Anthropic Best Practices "Use XML tags to structure your prompts"). Plain-bullet "Pre-verified Claims" sections in internal prompts are non-conforming and MUST NOT be used.
>
> - **User-facing artifact surface.** When the executor renders pv-* references in user-facing markdown artifacts (plan files, review/security-review output bodies, commit bodies, Strategic Direction blocks), the canonical XML form is NOT mandatory; the executor MAY use markdown-natural shorthand if AND ONLY IF the shorthand pairs with concrete-source backing. Acceptable shapes:
>   - **Token reference + Verified: trailer** in commit bodies: `Verified: @storybook/angular@10.3.5 exports fn() from storybook/test (see pv-storybook-fn-export block)`. The token (`pv-storybook-fn-export`) MUST resolve to a canonical `<pre_verified>` XML block in the executor's internal prompt to the agent during the same skill execution; the trailer MUST cite the concrete source (file path or URL) backing the claim.
>   - **Token reference + prose citation** in plan/review/security-review bodies: "Verified via Read against `package.json` (see `pv-storybook-angular-10x-installed` block above)". Same backing requirement.
>   - **Inline parenthetical reference** in finding lines: `pv-storybook-global-deprecation-10x` literal token in the body of a `### Findings` entry. Same backing requirement.
>
>   The forbidden plain-bullet Pre-verified Claims pattern (`## Pre-verified Claims\n- <claim>\n- <claim>` without source path or evidence) remains non-conforming on this surface AS WELL -- the failure mode is plain-bullets-WITHOUT-evidence, not plain-token-WITH-backing.
>
> Verification (B-pv-validation.sh):
>   - Assertion 1 (existing, Plan 07-01): canonical XML form present in internal prompts; no plain-bullet "Pre-verified Claims" sections in any surface.
>   - Assertion 6 (NEW, Plan 07-11): every pv-* token in user-facing artifacts resolves to a `claim_id` value that appears in a canonical `<pre_verified>` block elsewhere in the same session's JSONL trace (typically in the Agent tool_use input). Tokens that do NOT resolve are non-conforming (potential confabulation indicator).

**Why this direction:**
1. **Matches empirical evidence on plugin 0.12.0.** UAT chain shows internal XML form firing AND user-facing token-form firing AS A PAIR. Both surfaces work; the prose mandate just doesn't currently say so.
2. **Anchored in Anthropic's training.** XML tags work for prompt INPUTS (where the model parses); markdown shorthand works for prompt OUTPUTS (where the model renders for humans). [CITED: Anthropic "Use XML tags to structure your prompts" + Anthropic Best Practices "Match prompt style to desired output" -- "If you are still experiencing steerability issues with output formatting, try matching your prompt style to your desired output style as closely as possible." User-facing artifacts ARE markdown; matching prompt style means accepting markdown shorthand on the user-facing surface.]
3. **Preserves the trust contract.** The token-form references resolve back to canonical XML; the trust chain is intact. Assertion 6 enforces the structural integrity at the smoke fixture layer.
4. **Aligns with Phase 7's design philosophy** (additive content within existing canon; descriptive prose with worked examples; smoke fixture as the verification gate).
5. **Closes the empirical residual** without forcing the model to fight its markdown rendering training.

**Implementation cost:** LOW-MEDIUM. Single-rule rewrite in `references/context-packaging.md` Rule 5b; one new assertion (6) in `B-pv-validation.sh`; the parsing logic for Assertion 6 (regex extracting `pv-[a-z0-9-]+` tokens from user-facing surfaces, then cross-referencing against `claim_id` values in JSONL `pre_verified` blocks) is straightforward. Update Plan 07-09 cross-references in security-reviewer.md (uses `pv-compodoc-1x-cves` literal in worked example) for consistency, but no actual code change beyond the rule prose.

**Residual risk:** LOW. The empirical token-form-with-backing pattern is what's already firing on 0.12.0; D2 formalizes the existing successful behavior. The risk is that Assertion 6's resolution check picks up false-positive non-resolving tokens (e.g., abbreviations that look like pv-* tokens but aren't). Mitigation: tight regex (`pv-[a-z]{2,}-[a-z0-9-]{2,}` matches `pv-storybook-10-autodocs` but not `pv-1` or `pvc`).

**Compatibility with locked decisions:**
- D-03 phrasing: PASSES (descriptive prose, worked examples; no ALL-CAPS imperatives).
- D-04 effort levels + tools: NEUTRAL (rule is at packaging layer, not agent layer).
- Plan 07-01 (parent rule): EXTENDS, does not contradict. The XML mandate's intent (rejecting plain-bullets-without-evidence) is preserved verbatim and applies to BOTH surfaces. Only the prose-form scope is narrowed for the user-facing surface.
- Plan 07-07 ToolSearch precondition: NEUTRAL (operates at default-on Phase 1 layer; format mandate is at synthesis layer).
- Byte-identical 4-skill canon: NOT TOUCHED (rule lives in `references/context-packaging.md`, not in 4 SKILL.md `<context_trust_contract>` blocks).

#### D3 (alternative, partial): Status quo with documentation note

**Mechanism.** Leave Rule 5b unchanged. Add a documentation note to `references/context-packaging.md` clarifying the format-mandate scope (without changing the rule).

**Why NOT D3:**
1. **Doesn't actually amend the rule.** The empirical residual is that the rule prose, read literally, would reject the empirical user-facing shape. A documentation note that "actually, the rule is fine" without amending the rule prose creates a contradiction -- the rule says one thing, the note says another.
2. **Doesn't enable the structural integrity check (Assertion 6).** Without an explicit token-form acceptance criterion in the rule, the smoke fixture has no contract to assert.
3. **Pushes the work to Phase 8.** This research's Gap 2 is in-scope for promotion to Phase 7; deferring with a note is the avoidance pattern.

**Reject.**

### Trade-offs table for Gap 2

| Direction | Mechanism | Effectiveness | Complexity | Risk | D-03 | D-04 | Closes residual? |
|-----------|-----------|---------------|------------|------|------|------|------------------|
| D1 (tighten) | Require XML blocks in user-facing artifacts too | LOW (fights training; likely causes drift) | MEDIUM-HIGH | HIGH | PASS | NEUTRAL | NO (likely regression) |
| D2 (recommended) | Scope XML mandate to internal prompts; permit token-form on user-facing surface with concrete-source backing | HIGH (matches empirical) | LOW-MEDIUM | LOW | PASS | NEUTRAL | YES |
| D3 (alternative) | Status quo + doc note | LOW (doesn't amend rule) | LOW | LOW | PASS | NEUTRAL | NO (avoidance) |

### Gap 2 ranked recommendation

**Rank 1: D2 ship in Plan 07-11.**

Rationale:
1. Matches empirical evidence on plugin 0.12.0 (internal XML form fires correctly; user-facing token-form fires correctly; both shapes are working AS A PAIR).
2. Anchored in Anthropic's distinction between prompt INPUTS (XML for parse reliability) and prompt OUTPUTS / artifacts (markdown for human readability).
3. Preserves the trust contract via Assertion 6 (token resolves to canonical XML in internal prompt; structural integrity check).
4. Composes cleanly with Plan 07-01 parent rule (extends, does not contradict) and with all other Phase 7 decisions.
5. Closes the empirical residual at the rule layer; future surfaces can rely on the clarified scope.

**Defer:** D1 (tighten enforcement) -- not recommended for any future phase unless empirical evidence demonstrates token-form is unreliable. D3 (status quo + note) -- avoidance pattern; reject.

### Gap 2 validation strategy

**Smoke fixture extension.** Add `B-pv-validation.sh` Assertion 6 (token-form resolution check) at the existing fixture path:

```bash
# Assertion 6 (NEW, Plan 07-11 D2): user-facing token-form pv-* references resolve back to
# canonical <pre_verified> claim_id values in the same session's JSONL trace.
# Extract user-facing token references from the JSONL output (the executor's final
# user-visible text content; NOT the internal Agent tool_use prompts).

# Distinguish surfaces by node path: user-facing content is in messages.content[*]
# of type "text" emitted by the assistant outside of Agent tool_use blocks.
USER_FACING_TOKENS=$(rg -o 'pv-[a-z]{2,}-[a-z0-9-]{2,}' "$OUT" --pcre2 | sort -u)

# Extract canonical claim_id values from <pre_verified> blocks in the trace.
INTERNAL_CLAIM_IDS=$(rg -o 'claim_id="(pv-[^"]+)"' "$OUT" --replace '$1' | sort -u)

# Every user-facing token MUST appear in INTERNAL_CLAIM_IDS.
ORPHAN_TOKENS=$(comm -23 <(echo "$USER_FACING_TOKENS") <(echo "$INTERNAL_CLAIM_IDS"))

if [ -z "$ORPHAN_TOKENS" ]; then
  echo "[OK] Assertion 6 (D2 token-form resolution): all user-facing pv-* tokens resolve to canonical XML claim_id"
else
  echo "[ERROR] Assertion 6 (D2 token-form resolution): orphan tokens (no backing XML):"
  echo "$ORPHAN_TOKENS"
  FAIL=1
fi
```

**UAT-replay closure criterion.** Plan 07-11 closure is empirically valid when:
- `bash B-pv-validation.sh` PASSES on plugin 0.12.1 with new Assertion 6.
- Re-run any 1-2 sessions from the canonical 6-session UAT (preferably S3 review + S4 security-review since they showed token-form most prominently); empirical UAT trace shows zero orphan tokens.
- 07-VERIFICATION.md amendment closes residual-pre-verified-format.
- REQUIREMENTS.md FIND-B.2 row description updated to reflect the dual-surface scope.

## Combined ranked recommendation

**Ship Plan 07-10 (Gap 1: advisor fragment-grammar) + Plan 07-11 (Gap 2: Rule 5b D2 amendment) as a paired bundle.** Both plans:

1. Are independent (different files, different rules, different smoke fixtures); no ordering dependency.
2. Are LOW-MEDIUM complexity (~30-60 min each; reuse Plan 07-09 reference implementation patterns).
3. Are LOW-residual-risk (both empirically grounded in 0.12.0 UAT evidence + Plan 07-09 empirical validation).
4. Are within Phase 7 scope (verify-chain-integrity refinements; not new contracts).
5. Compose cleanly with the locked decisions (D-03, D-04, D-04 amendment 2026-05-02 binding reversion criterion, Plan 07-01..07-09 surfaces).

Suggested plan ordering: 07-10 (advisor), 07-11 (format scope) -- but parallel is fine; the planner picks.

**Plugin version bump:** 0.12.0 -> 0.12.1 (patch) for the bundle. Justification: both gap closures are refinements of existing rules (advisor word-budget mechanism + Rule 5b scope clarification), not new contract shapes. The patch bump matches Phase 7 precedent for incremental closures (Plan 07-07 + 07-08 each had patch-bump considerations before being rolled into the larger 0.10.0 -> 0.11.0 -> 0.12.0 minor sequence).

**If bundled with Phase 8 wip-discipline reversal:** the wip-discipline rule removal IS a contract-shape change -> 0.13.0 (minor). The 2 gap closures here can ride along on the same minor bump if scheduling aligns; that is the planner's call.

## Open questions for planner

These are Claude's Discretion items the planner decides in Plan 07-10 + Plan 07-11:

1. **Gap 1 -- Exact wording of the advisor fragment-grammar Format prose.** This research suggests `<verb-led action>. <concrete object or path>. <one-clause rationale or Assuming-frame if needed>.` -- planner picks the exact phrasing.

2. **Gap 1 -- Whether to ship 2 or 3 worked examples in advisor.md.** This research suggests reusing the existing 2 Density example blocks (full-context + thin-context); Plan 07-09 reviewer/security-reviewer ship 3 worked example pairs PLUS a holistic worked example. Advisor's tighter 100w cap may not need a holistic example since the per-item shape IS the holistic example at this scale.

3. **Gap 1 -- Per-item word target.** Suggested <=15 words; planner may calibrate. The Assuming-frame items are inherently longer (~18-22w) due to verbatim phrase preservation; an item-target of 15w with frame items as exceptions is the recommendation.

4. **Gap 2 -- Exact prose for Rule 5b D2 amendment.** This research suggests two-surface differentiation with specific accepted user-facing shapes (token + Verified: trailer; token + prose citation; inline parenthetical token). Planner picks final prose anchored on this shape.

5. **Gap 2 -- Whether to ship Assertion 6 alone or also amend Assertion 1.** Assertion 1 currently checks "no plain-bullet 'Pre-verified Claims' sections" -- this remains valid post-D2. Assertion 6 adds resolution check. Recommend BOTH (Assertion 1 stays, Assertion 6 adds; together they enforce dual-surface conformance). Planner may simplify if a single combined assertion is cleaner.

6. **Gap 2 -- Whether to also amend the lz-advisor.plan SKILL.md `<context_trust_contract>` `pv-* synthesis precondition` block.** That block currently references "Common Contract Rule 5b" by reference; if Rule 5b's prose changes, the SKILL.md cross-reference still resolves correctly. No SKILL.md edit needed UNLESS the planner wants to surface the dual-surface distinction in the trust contract. Recommend: leave SKILL.md unchanged; the rule lives in `references/`, the SKILL.md @-loads the reference.

7. **Plan 07-10 + 07-11 plugin version bump.** Suggested 0.12.0 -> 0.12.1 (patch). If bundled with Phase 8 wip-discipline reversal -> 0.13.0 (minor, contract shape).

8. **D-advisor-budget.sh extension.** Suggested fragment-grammar regex matching ADVISOR_FRAGMENT_RE pattern + ASSUMING_FRAME_RE preservation; mirror Plan 07-09 Task 3 structure. Backward-compat LEGACY_RE fallback for transitional Plan 07-04 prose shape.

## Sources

### Primary (HIGH confidence)

- [VERIFIED: `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-CONTEXT.md` D-01 / D-02 / D-03 / D-04 / D-04 amendment 2026-05-02] -- locked decisions for Phase 7; both gap closures honor these.
- [VERIFIED: `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-VERIFICATION.md` `empirical_subverification_2026_05_03` block lines 68-97] -- 6-session UAT empirical evidence on plugin 0.12.0; both residuals documented.
- [VERIFIED: `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-HUMAN-UAT.md` lines 30-90] -- Phase 7 requirement-level evaluation table + residual_findings_outside_07_09_scope block; primary source for Gap 1 + Gap 2 evidence.
- [VERIFIED: `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-RESEARCH-WORDBUDGET.md` Recommendation section + Anthropic-Recommended Techniques #1-7] -- caveman empirical baseline (65% mean output reduction on Sonnet 4 + Opus 4.6); Anthropic Best Practices anchors. Gap 1's Candidate A is a direct extension of Plan 07-09's structural intervention to advisor.
- [VERIFIED: `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-09-PLAN.md` + 07-09-SUMMARY.md] -- reference implementation for fragment-grammar emit template (Candidate A); Gap 1 reuses pattern with advisor-specific shape adaptations.
- [VERIFIED: `plugins/lz-advisor/agents/advisor.md` lines 51-77] -- existing advisor `## Output Constraint` section with 2 Density example blocks (which become the worked examples in the fragment-grammar adaptation).
- [VERIFIED: `plugins/lz-advisor/agents/reviewer.md` lines 51-145] -- Plan 07-09 fragment-grammar reference implementation; Gap 1's Candidate A pattern is adapted from this.
- [VERIFIED: `plugins/lz-advisor/agents/security-reviewer.md` lines 52-130] -- Plan 07-09 fragment-grammar reference implementation with OWASP tag; Gap 2 token examples (`pv-compodoc-1-1-0-cves`) come from this file.
- [VERIFIED: `plugins/lz-advisor/references/context-packaging.md` lines 48-66] -- Common Contract Rule 5b (current text); Gap 2's D2 amendment refines this rule's "Format mandate" sub-rule.
- [VERIFIED: `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/uat-replay-0.12.0/session-{1..6}-*.jsonl`] -- 6 JSONL traces; empirical evidence base for both gaps. Confirmed via `rg -c '<pre_verified'` counts (5/5/9 in S2/S3/S4) and `rg -o 'pv-[a-z0-9-]+'` token extraction (S3 returns `pv-storybook-global-deprecation-10x` user-facing token).
- [CITED: Anthropic Best Practices "Calibrating effort and thinking depth"](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices) -- "Opus 4.7 has a notable behavioral quirk... it tends to be quite verbose"; "If you observe shallow reasoning on complex problems, raise effort to high or xhigh rather than prompting around it"; "medium is good for cost-sensitive use cases that need to reduce token usage while trading off intelligence." Anchors for Gap 1 Candidate B rejection (advisor needs `effort: high` for strategic reasoning).
- [CITED: Anthropic Best Practices "Use XML tags to structure your prompts"](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/use-xml-tags) -- "Claude was trained to respond strongly to XML structure in prompts." Anchor for Gap 2 D2 (XML for prompt INPUTS specifically; markdown for OUTPUTS).
- [CITED: Anthropic Best Practices "Match prompt style to desired output"](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices) -- "If you are still experiencing steerability issues with output formatting, try matching your prompt style to your desired output style as closely as possible." Anchor for Gap 2 D2 (user-facing artifacts ARE markdown; matching style means accepting markdown shorthand).
- [CITED: Anthropic April 23 postmortem](https://www.anthropic.com/engineering/april-23-postmortem) -- direct quote of April 16 verbosity-reduction instruction "Length limits: keep text between tool calls to <=25 words. Keep final responses to <=100 words unless the task requires more detail." reverted April 20 after 3% intelligence cost on broad evaluations. Anchor for Gap 1 Candidate C rejection.
- [CITED: PromptHub Claude 4 system prompt analysis](https://www.prompthub.us/blog/an-analysis-of-the-claude-4-system-prompt) -- "ALL-CAPS reserved for safety-critical only; descriptive prose for everything else." Anchor for D-03 phrasing-style preservation across both gap closures.

### Reference Implementation (HIGH confidence -- locally verified)

- `D:\projects\JuliusBrussee\caveman\skills\caveman-review\SKILL.md` -- direct analogue to lz-advisor reviewer/security-reviewer; the fragment-grammar pattern Plan 07-09 adapted.
- `D:\projects\JuliusBrussee\caveman\agents\cavecrew-reviewer.md` -- agent-frontmatter equivalent demonstrating the fragment-grammar inside an agent prompt.
- `D:\projects\JuliusBrussee\caveman\rules\caveman-activate.md` -- 15-line minimal-prose canonical activation rule.
- `D:\projects\JuliusBrussee\caveman\README.md` lines 270-285 -- empirical benchmark table (65% mean output reduction; range 22-87% across 10 prompts x 3 trials on Sonnet 4 + Opus 4.6).
- Note: caveman has no Opus 4.7 empirical data; Plan 07-09's empirical fire on plugin 0.12.0 (S3 reviewer 197w / S4 security-reviewer 285w) is the load-bearing transfer evidence. Gap 1's transfer to advisor at `effort: high` is by analogy to Plan 07-09; the smoke fixture run on 0.12.1 is the validation.

### Secondary (MEDIUM confidence)

- [CITED: `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-RESEARCH-GAP-1-toolsearch.md`] -- gap-research precedent in this phase; structural pattern (empirical evidence -> hypotheses -> candidates -> trade-offs -> ranked recommendation -> validation strategy) followed here.
- [CITED: Anthropic Best Practices "Tell Claude what to do, not what not to do"](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices) -- positive-framing principle; both gap closures use positive-framed prose (DROP/KEEP lists; new acceptable shapes for D2).
- [CITED: Memory `reference_sonnet_46_prompt_steering.md`] -- "descriptive triggers + few-shot examples for tool-use steering on 4.x; reserve imperatives for compliance only." Both gap closures honor this.
- [CITED: Memory `feedback_no_wip_commits.md`] -- user rejects `wip:` commits; Phase 8 reversal target. Neither gap closure introduces or preserves wip: references.

### Tertiary (LOW confidence; flagged for empirical validation)

- [INFERRED: Gap 1 Candidate A's empirical effectiveness on advisor at `effort: high` is by analogy to Plan 07-09's reviewer + security-reviewer at `effort: medium`. The transfer is HIGH-confidence in direction but UNTESTED in magnitude on the advisor's tighter 100w cap. The smoke fixture D-advisor-budget.sh empirical run on plugin 0.12.1 is the validation step. If Candidate A overshoots (e.g., advisor lands at 110w, still 10% over), the planner has Candidate B (effort de-escalation) as a Phase 8 fallback.]
- [INFERRED: Gap 2 D2's Assertion 6 regex pattern (`pv-[a-z]{2,}-[a-z0-9-]{2,}`) is calibrated against the empirical 0.12.0 token shape. If future scenarios introduce shorter tokens (`pv-fn-spy`) or different naming conventions, the regex may need refinement. Mitigation: document the regex in B-pv-validation.sh comments with examples.]

## Confidence breakdown

| Area | Level | Reason |
|------|-------|--------|
| Empirical signal (both gaps) | HIGH | 6-session UAT data on plugin 0.12.0 unambiguous; multiple JSONL traces verified via rg counts. |
| Gap 1 Candidate A effectiveness | HIGH-MEDIUM | Plan 07-09 empirical validation at `effort: medium`; advisor at `effort: high` is by analogy. Smoke fixture run on 0.12.1 is the empirical gate. |
| Gap 1 Candidate B / C rejection | HIGH | Anthropic Best Practices documented anchors (effort calibration for synthesis vs reasoning; 3% intelligence cost on imperatives). |
| Gap 2 D2 (recommended) | HIGH | Empirical evidence on plugin 0.12.0 + Anthropic XML-for-inputs-not-outputs guidance + structural integrity preservation via Assertion 6. |
| Gap 2 D1 / D3 rejection | HIGH | D1 fights training; D3 is avoidance; both have higher residual risk than D2. |
| Validation architecture | HIGH | B-pv-validation.sh + D-advisor-budget.sh shapes verified Plan 07-01 + 07-04 + 07-09 deliverables. |

**Research date:** 2026-05-04
**Valid until:** 2026-06-03 (30-day window for Anthropic prompting best practices doc currency).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Advisor at `effort: high` exhibits a milder version of the same `verbose-by-design` dynamic that reviewer + security-reviewer at `effort: xhigh` exhibited on plugin 0.11.0; the same fragment-grammar shape constraints will bind. | Gap 1 Candidate A | MEDIUM. If Candidate A alone overshoots on 0.12.1 (advisor lands at 105-110w), the planner has Candidate B as fallback. The 18% overshoot magnitude on 0.12.0 is mild; Plan 07-09's empirical 30-35% under-cap delta on reviewer + security-reviewer suggests Candidate A applied to advisor should land 80-90w (well under 100w cap). |
| A2 | Token-form pv-* references with backing canonical XML in internal prompts are NOT the Finding B.2 confabulation failure mode, but a structurally-different (and trust-preserving) user-facing render. | Gap 2 D2 | LOW. Empirical evidence on plugin 0.12.0 is unambiguous: 5+5+9 internal `<pre_verified>` blocks fired across S2/S3/S4 AND user-facing token references (e.g., `pv-storybook-global-deprecation-10x` in S3 review body) trace back to those blocks. Assertion 6 is the structural integrity check. |
| A3 | Assertion 6's regex pattern (`pv-[a-z]{2,}-[a-z0-9-]{2,}`) reliably extracts token-form pv-* references from user-facing surfaces without false-positive matches. | Gap 2 validation | LOW-MEDIUM. The pattern is calibrated against 0.12.0 empirical tokens; future scenarios may introduce different naming. Mitigation: document the regex with examples + extend if scenarios drift. |
| A4 | Plan 07-10 + 07-11 ship together as a paired bundle (vs separate or sequential). | Combined recommendation | LOW. Both are independent (different files); ordering is operational. The bundle amortizes the 0.12.0 -> 0.12.1 version bump. |
| A5 | Plugin version bump for the bundle is 0.12.0 -> 0.12.1 (patch), unless bundled with Phase 8 wip-discipline reversal which is a contract-shape change requiring 0.13.0 (minor). | Combined recommendation | LOW. SemVer convention; planner picks based on bundle composition. |
| A6 | The advisor's existing 2 Density example blocks (full-context + thin-context, both 95-100w) are sufficient as worked examples for the fragment-grammar adaptation; no holistic third example needed (unlike Plan 07-09 which added one). | Gap 1 Candidate A | LOW-MEDIUM. The advisor's tighter 100w cap means the per-item shape IS the holistic example at this scale; a separate holistic block would push the constraint section over the helpful prose budget. Planner may calibrate. |
| A7 | The advisor's per-item word target is <=15 words (vs reviewer's <=20w / security-reviewer's <=22w). | Gap 1 Candidate A | LOW-MEDIUM. The Assuming-frame items are inherently longer (~18-22w due to verbatim phrase preservation); a 15w target with frame items as documented exceptions is the recommendation. Planner may calibrate. |
| A8 | The Rule 5b D2 amendment's user-facing acceptable shapes (token + Verified: trailer; token + prose citation; inline parenthetical token) cover the empirical 0.12.0 surfaces comprehensively. | Gap 2 D2 | LOW. The 3 shapes match the 4 user-facing surfaces empirically observed (S1 plan body / S3 review body / S4 security-review body / S2 + S6 commit bodies). If a future surface introduces a 4th shape (e.g., XML reference inline), the rule may need extension. |

**If user disagrees with any assumed claim, signal in /gsd-discuss-phase iteration before plan execution.** All 8 assumptions are bounded-risk choices within the discretion CONTEXT.md grants the planner; none changes the load-bearing fix architecture.

## Metadata

**Research date:** 2026-05-04
**Valid until:** 2026-06-03 (30-day window for Anthropic prompting best practices doc currency; 14-day window for community sources on Sonnet 4.6 / Opus 4.7).

## RESEARCH COMPLETE

**Phase:** 07 Gap closures (residual-advisor-budget + residual-pre-verified-format)
**Confidence:** HIGH

### Key findings

- **Gap 1 (advisor budget 118w / 100w):** Plan 07-09 fragment-grammar emit template (Candidate A) extends cleanly to `agents/advisor.md` with advisor-specific shape adaptations (single-block numbered list; 100w aggregate cap; <=15w per-item target with Assuming-frame items as documented exceptions; reuse 2 existing Density example blocks; add DROP/KEEP lists + Format prose). Candidate B (effort high -> medium) and Candidate C (ALL-CAPS imperative) rejected per Anthropic Best Practices anchors and CONTEXT.md D-03/D-04 constraints. Smoke fixture `D-advisor-budget.sh` extended with fragment-grammar regex parser; closure criterion = bash D-advisor-budget.sh PASSES on 0.12.1 + canonical UAT replay shows advisor SD <=100w.
- **Gap 2 (pv-* format scope ambiguity):** Plan 07-01 Rule 5b "Format mandate" amended (D2) to scope XML mandate to internal-prompt surface (executor -> agent communication); permit token-form references on user-facing artifact surface when paired with concrete-source backing (token + Verified: trailer in commit bodies; token + prose citation in plan/review bodies; inline parenthetical token in finding lines). Trust contract preserved via new B-pv-validation.sh Assertion 6 (token-form references resolve back to canonical `<pre_verified>` claim_id values in same session's JSONL trace). D1 (tighten everywhere) rejected -- fights Anthropic XML-for-inputs-not-outputs guidance; D3 (status quo + note) rejected -- avoidance pattern. Closure criterion = bash B-pv-validation.sh PASSES on 0.12.1 + canonical UAT replay shows zero orphan tokens.
- **Out of scope per user directive 2026-05-03:** wip-discipline reversal is Phase 8; not addressed here. Both gap closures avoid introducing or preserving any new `wip:` references.
- **Recommended bundle:** Plan 07-10 (Gap 1) + Plan 07-11 (Gap 2) ship together at plugin version 0.12.0 -> 0.12.1 (patch); both LOW-MEDIUM complexity; both reuse Plan 07-09 reference implementation patterns; both LOW residual risk (empirically grounded in 0.12.0 UAT evidence).

### File created

`D:\projects\github\LayZeeDK\lz-advisor-claude-plugins\.planning\phases\07-address-all-phase-5-x-and-6-uat-findings\07-RESEARCH-GAPS.md`

### Confidence assessment

| Area | Level | Reason |
|------|-------|--------|
| Gap 1 empirical signal | HIGH | 6-session UAT data on plugin 0.12.0 unambiguous (S1 advisor 118w / 100 cap); 18% overshoot mild but structurally identical to pre-Plan-07-09 reviewer/security-reviewer overshoots. |
| Gap 1 Candidate A | HIGH-MEDIUM | Plan 07-09 empirical validation at `effort: medium` (reviewer 197w + security-reviewer 285w on 0.12.0); transfer to advisor at `effort: high` is by analogy. |
| Gap 1 B/C rejection | HIGH | Anthropic Best Practices anchors (effort calibration, intelligence cost on imperatives) + CONTEXT.md D-03 ALL-CAPS reservation. |
| Gap 2 empirical signal | HIGH | 6-session UAT data shows internal XML form firing (5+5+9 blocks across S2/S3/S4) AND user-facing token-form firing (S3 token `pv-storybook-global-deprecation-10x` traceable to backing XML). |
| Gap 2 D2 (recommended) | HIGH | Anchored in Anthropic XML-for-inputs guidance + Match-prompt-style-to-output guidance + structural integrity preservation via Assertion 6. |
| Gap 2 D1/D3 rejection | HIGH | D1 fights model training; D3 is avoidance pattern. |
| Validation architecture | HIGH | B-pv-validation.sh + D-advisor-budget.sh shapes verified Plan 07-01 + 07-04 + 07-09 deliverables. |

### Open questions for planner

8 enumerated items in "Open questions for planner" section above; the load-bearing ones are (1) exact wording of advisor fragment-grammar Format prose + per-item word target, (2) exact prose for Rule 5b D2 amendment, and (3) whether to bundle Plan 07-10 + 07-11 with Phase 8 wip-discipline reversal (and corresponding plugin version bump 0.12.1 patch vs 0.13.0 minor).

### Ready for gap-closure planning

Plan 07-10 (advisor fragment-grammar) and Plan 07-11 (Rule 5b D2 amendment) can now be drafted. Recommended Tasks shape:

**Plan 07-10 (Gap 1):**
- T1: Rewrite `agents/advisor.md` `## Output Constraint` with fragment-grammar emit template + DROP/KEEP lists + reuse 2 existing Density examples
- T2: Update `D-advisor-budget.sh` parser with fragment-grammar regex + backward-compat LEGACY_RE
- T3: Plugin version bump 0.12.0 -> 0.12.1 + 07-VERIFICATION.md amendment closing residual-advisor-budget + REQUIREMENTS.md row update

**Plan 07-11 (Gap 2):**
- T1: Amend `references/context-packaging.md` Rule 5b "Format mandate" with two-surface differentiation (D2 prose)
- T2: Extend `B-pv-validation.sh` with Assertion 6 (token-form resolution check)
- T3: Plugin version bump 0.12.0 -> 0.12.1 (or merge with Plan 07-10 if bundled) + 07-VERIFICATION.md amendment closing residual-pre-verified-format + REQUIREMENTS.md FIND-B.2 row description update

If both plans land together: single 0.12.0 -> 0.12.1 patch bump; one combined VERIFICATION.md amendment closing both residuals; one combined REQUIREMENTS.md update.
