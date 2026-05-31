# Phase 8 (gap closure): GAP-S9 + GAP-S10 - Research

**Researched:** 2026-05-31
**Domain:** lz-advisor plugin prompt/contract engineering (Claude Code skill + agent Markdown). Sonnet 4.6 executor steering; Opus advisor turn-budget discipline.
**Confidence:** HIGH (all findings grounded in the current plugin source + the natural-UAT record + load-bearing project memories; no external/library research required -- these are prompt-only fixes to files already in this repo)

## Summary

Two prompt-only gaps surfaced by the 2026-05-31 Compodoc natural UAT remain OPEN against plugin 0.14.0. Both are contract edits to `lz-advisor.execute` (Phase 3.5 and Phase 5) and one agent prompt (`advisor.md`); GAP-DEVSERVER is already CLOSED in the target repo (commit 5485eca) and is referenced only as the evidence that motivates GAP-S9.

**GAP-S9 (verify-target mismatch, confirmed 2x in Sessions 5 + 7b):** the executor's Phase 3.5 "Verify Before Commit" has cheap-vs-long-running validation guidance but NO rule that selects the verification target by the *change surface*. The executor ran `nx test` (unit) for Storybook/Nx-config changes, so a real `nx storybook` dev-server regression shipped undetected. The fix has two halves: (a) a general "match the verify target to the change surface" decision heuristic in execute Phase 3.5, AND (b) a plan-side rule in `lz-advisor.plan` that emits a change-surface-matched `Run:` verify step -- the empirically-observed mitigation (Session 8-9: when the plan named `Run: nx storybook`, the execute skill's existing E.2 rule fired and verified the right surface). A third sub-rule (sub-finding b) covers tooling-state freshness (stale Nx daemon gave a false verification result).

**GAP-S10 (final-advisor maxTurns exhaustion, recurrence):** in Session 5 consult #3 the final-review advisor burned its 3-turn budget hunting on disk (Glob/Read) for a component file whose content was already packed into the prompt, producing no numbered synthesis. The fix is prompt-side (per `feedback_advisor_fix_approach`): pack the post-change content into the Phase 5 consultation AND add a final-review-specific "synthesize from packed content; do not re-locate files on disk" instruction to `advisor.md`. `advisor.md` is verified at `maxTurns: 3` / `effort: high` -- the fix does NOT touch maxTurns.

**Primary recommendation:** Touch 3 plugin files -- `lz-advisor.execute/SKILL.md` (Phase 3.5 + Phase 5), `lz-advisor.plan/SKILL.md` (Steps template + a verify-step rule), and `advisor.md` (final-review trust-packed-context). Phrase all executor-facing edits as descriptive-trigger + few-shot per `reference_sonnet_46_prompt_steering` (no MUST/CRITICAL imperatives). GAP-S9 is NOT pure execute-only -- the plan skill must mirror the verify-target concept. GAP-S10 is execute-skill-only + advisor agent. Neither requires the full 4-skill symmetry canon.

## User Constraints (from project memories + ROADMAP, no CONTEXT.md present)

> No `CONTEXT.md` exists for this gap-closure. The binding constraints come from project memories (treated with locked-decision authority per the researcher role) and the ROADMAP "Phase 8 gaps" entries.

### Locked Decisions (from memory + ROADMAP, verbatim intent)

- **GAP-S10 fix is PROMPT-SIDE, NOT a maxTurns increase.** `feedback_advisor_fix_approach.md`: "Fix the advisor's maxTurns exhaustion by addressing the root cause in the advisor prompt, not by increasing maxTurns... modify the advisor.md system prompt -- do not change maxTurns from 3." [CITED: memory/feedback_advisor_fix_approach.md]
- **Both gaps are prompt/contract changes to the lz-advisor plugin, not runtime code.** [CITED: ROADMAP "Phase 8 gaps"; 08-NATURAL-UAT-COMPODOC.md AMENDMENT block]
- **GAP-DEVSERVER is CLOSED (commit 5485eca, target repo) -- do not plan it.** [CITED: ROADMAP; 08-NATURAL-UAT-COMPODOC.md Gaps + Dev-Server Fix Loop]
- **Do NOT re-plan the original Phase 8 requirements** (RES-WIP-DISCIPLINE-REVERSAL etc. -- all shipped at 0.14.0). [CITED: research prompt + ROADMAP Phase 8 plans 08-01..08-07 all `[x]`]
- **Executor/agent prompt steering for Sonnet 4.6: descriptive triggers + concrete when/how + 1-2 worked examples per case; reserve ALL-CAPS imperatives (MUST/CRITICAL/NEVER) for non-negotiable compliance rules only.** [CITED: memory/reference_sonnet_46_prompt_steering.md; ADVR-06]

### Claude's Discretion

- Exact wording and placement of the change-surface heuristic (decision heuristic vs checklist vs few-shot) -- recommended below, planner picks.
- Whether the tooling-state-freshness sub-rule lands in execute Phase 3.5 or in the context-packaging Common Contract -- recommended below.
- SemVer bump magnitude -- per `feedback_version_numbers_not_load_bearing_prerelease`, version numbers are not load-bearing in this pre-release; planner picks a coherent trail (PATCH or MINOR). Atomic 5-surface sync still required if any version string changes.

### Deferred Ideas (OUT OF SCOPE)

- All other natural-UAT sub-findings (S1 plan-file verbatim drift, S2 fetch-fallback, S3 orient tool volume, S6 reviewer word-budget overrun, S8 disposition taxonomy, S11 PowerShell-redirect) -- these are non-blocking and tracked separately; not part of GAP-S9/S10.
- GAP-DEVSERVER (closed).
- maxTurns increase for the advisor (explicitly rejected).

## Phase Requirements

> These are the two gap IDs from ROADMAP "Phase 8 gaps" (NOT in the original phase_req_ids; surfaced post-shipment by /gsd-verify-work 8).

| ID | Description | Research Support |
|----|-------------|------------------|
| GAP-S9 | execute-skill Phase 3.5 verify-target mismatch (confirmed 2x, Sessions 5 + 7b). Executor verified Storybook/Nx-config changes with `nx test` / no build instead of the affected target; a broken `nx storybook` dev-server shipped undetected. | Findings 1-5 below: exact Phase 3.5 text, general change-surface heuristic phrasing, plan-vs-execute placement, tooling-state-freshness sub-rule, symmetry scope. |
| GAP-S10 | final-advisor (Phase 5) maxTurns exhaustion (recurrence of `project_advisor_maxturns_exhaustion`). Final consult burned its 3-turn budget disk-hunting for a file already packed; no numbered synthesis. Prompt-side fix, NOT maxTurns. | Findings 6-8 below: exact Phase 5 packaging + advisor trust-context text, minimal high-leverage fix, maxTurns confirmation. |

---

## GAP-S9 Findings

### Finding 1: Exact current text of execute Phase 3.5 (targeted-edit anchors)

`plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` lines 173-221 contain the `<verify_before_commit>` block. The relevant subsections, quoted verbatim so the planner can edit surgically (not rewrite):

**`## Phase 3.5: Verify Before Commit` (line 174-176):**
> Before staging or committing changes (Phase 4), execute pending verification actions surfaced by upstream artifacts or by the advisor. This phase closes the gap between hedge-preservation at the prompt-construction layer (Phase 6 Plan 06-05) and verification-completion at the execute layer.

**`### Hedge marker resolution (E.1)` (lines 178-182):** [unchanged by GAP-S9 -- about verify-first sentinel markers, not target selection]

**`### Plan-step shape rule (E.2)` (lines 184-194)** -- the load-bearing mitigation rule, verbatim:
> When the plan input contains a numbered, executable plan step structured as:
> ```
> N. **Validate** (or Verify, Test, Confirm)
>    - Run: `<command>`
>    - Verify: <observable conditions>
> ```
> The `Run:` directive is an EXECUTOR-BOUND action, not a USER-FACING instruction. Execute the `<command>` as a Bash invocation BEFORE the commit that ships the related changes. The post-commit summary may surface the result to the user, but the verification itself runs pre-commit.

**`### Pre-commit validation scope` (lines 196-203)** -- verbatim:
> Cheap synchronous validations execute pre-commit:
> - `npm ls`, `npm install`, `git grep`, `git check-ignore`, `git status`, `lint`, `tsc --noEmit`, `tsc --noEmit --pretty`, `jest --bail`, focused test runs
> - Commands expected to complete in under 30 seconds on a warm dev machine
>
> For long-running async validations (`nx storybook`, `nx test`, `nx test-storybook`, `nx serve*`, `nx run-many` over many projects, full test suites lasting longer than 30 seconds, dev-server startup or watch-mode commands), wait for completion before committing. Do not commit before the validation finishes; the commit must reflect the actual verified state. Record completed verifications via `Verified:` trailers.

[VERIFIED: file read 2026-05-31, lines 173-221]

**The structural gap (root cause of GAP-S9):** the `Pre-commit validation scope` subsection classifies validations only by *duration* (cheap-synchronous vs long-running-async) and says *how* to run them (wait vs proceed). It never says *which* target to run as a function of *what changed*. E.2 only fires when the *plan* already names the `Run:` command. When no plan names it -- or the plan names the wrong target -- nothing selects the change-surface-matched target. In Session 5 the executor defaulted to `nx test` (a habitual unit-test default) for a Storybook-config change. [VERIFIED: 08-NATURAL-UAT-COMPODOC.md S9 + S9-RECURRENCE, lines 596-644, 822-833]

### Finding 2: General "match verify target to change surface" rule -- recommended phrasing

The rule must be framework-agnostic (not Nx-specific). Per `reference_sonnet_46_prompt_steering`, the highest-reliability shape for steering Sonnet 4.6 is **descriptive trigger + concrete when/how + 1-2 worked examples** -- NOT a MUST imperative (4.x literalism risks spurious target runs), NOT a soft ranking alone (empirically proven insufficient: Phase 5.6 UAT 6/6 zero-web-usage). [CITED: memory/reference_sonnet_46_prompt_steering.md]

**Recommended form: a short decision heuristic that maps change-surface -> verify-target class, anchored by 2 worked examples.** Place it as a NEW subsection inside `<verify_before_commit>`, immediately BEFORE `### Pre-commit validation scope` (so target *selection* precedes the *cheap-vs-long-running* execution rule it feeds into). Draft phrasing (planner refines):

> ### Select the verify target by change surface (E.3)
>
> The verification that matters is the one that exercises the files you changed. Before choosing a verify command, identify the dominant change surface and run the target that actually loads it:
>
> - Source/library code changed -> the unit-test or type-check target for that code (`nx test`, `jest`, `tsc --noEmit`).
> - Build/bundler/packaging config changed (build target options, output config, packaging executor) -> the build target (`nx build`, `nx build-storybook`, `vite build`, `next build`).
> - Dev-server / tool-runtime config changed (a Storybook builder option, a dev-server target, a serve/watch executor's schema keys) -> the dev-server or tool-runtime target itself (`nx storybook`, `nx serve`, `vite dev`), because a build-time target and a dev-server target can read the same config through different schemas and diverge.
> - Lint/format config changed -> the lint target.
>
> A unit-test pass is not evidence a config change is correct -- it exercises the source, not the changed config surface. When in doubt, run the target whose executor reads the file you edited.
>
> Worked example (the GAP this rule closes): a change that removed a `browserTarget` key from a Storybook target verified clean under `nx test` (unit) -- but `nx test` never invokes the Storybook executor, so a dev-server regression that only `nx storybook` would surface shipped undetected. The change surface was Storybook-config; the matching target was `nx storybook` / `build-storybook`, not `nx test`.
>
> Worked example (correct selection): a change to a component's `@Input()` signal type verified under `nx test` -- correct, because the unit-test target compiles and exercises the component source that changed.

Rationale for "decision heuristic + 2 few-shot" over a pure checklist: the surface->target mapping needs *judgment* (which executor reads which file), and Sonnet 4.6 generalizes best from a worked example that shows the failure mode and its correct counterpart. The negative example must be paired with the positive (per the memory: use positive form, pair contrastive examples). [CITED: memory/reference_sonnet_46_prompt_steering.md]

### Finding 3: Fix belongs in BOTH execute Phase 3.5 AND plan skill (recommended: both)

The UAT gives a clean empirical signal on placement:

- **Execute-side (E.3 above) is necessary** because a free-form `/lz-advisor.execute <task>` (no plan, or a plan that omits a `Run:` step) has nothing to fall back on. Sessions 5 + 7b both ran without a change-surface-matched `Run:` directive and both under-verified. [VERIFIED: 08-NATURAL-UAT-COMPODOC.md S9, S9-RECURRENCE]

- **Plan-side is the proven mitigation** and should be added too. The Dev-Server Fix Loop (Sessions 8-9) showed: when the *plan* named an explicit `Run: nx storybook` verify step, the execute skill's existing E.2 plan-Run-directive rule fired correctly and verified the right surface. [VERIFIED: 08-NATURAL-UAT-COMPODOC.md `s9_mitigation_evidence` lines 965-970: "the execute skill verified the RIGHT target here (unlike Sessions 5 + 7b) BECAUSE the plan named it in an explicit `Run: nx storybook` step"]

**Recommendation: edit both files.** In `lz-advisor.plan/SKILL.md`, the `## Steps` section (lines 178-188) already has a step template but no convention that the plan SHOULD emit a change-surface-matched validation step. Add a short rule to the plan's `## Steps` guidance instructing the planner to include a final `**Validate**` step whose `Run:` command matches the change surface (using the same surface->target mapping as execute E.3). This makes the two skills compose: plan emits the right `Run:`, execute's E.2 executes it. The execute-side E.3 is the safety net for when the plan is absent or wrong.

This is a **defense-in-depth** design, not redundancy: plan-side sets the executor up to succeed via the already-working E.2 path; execute-side catches the no-plan / wrong-plan case. Both are cheap prose edits.

### Finding 4: Tooling-state-freshness sub-rule (sub-finding b)

Sub-finding (b): even the right target lies if tooling state is stale. In the UAT a stale Nx daemon served a cached project graph and gave a FALSE verification result, fooling the orchestrator into a twice-wrong causation claim. The hygiene rules are documented in `feedback_nx_uat_verification_hygiene.md`: use workspace-local CLI (`npm exec nx --`, not global `npx nx`); run `nx reset` between config-mutating runs; kill lingering continuous-task servers before reset. [CITED: memory/feedback_nx_uat_verification_hygiene.md; 08-NATURAL-UAT-COMPODOC.md "Nx-UAT methodology lessons" lines 988-1002]

**The general principle (framework-agnostic):** "A verification result is only trustworthy if the tool that produced it read the current state. Caching daemons, watch-mode servers, and incremental build caches can serve stale state and return a result that does not reflect your change. When a build orchestrator with a persistent daemon/cache is involved (Nx, Turborepo, Bazel, Gradle daemon, webpack watch), ensure fresh tooling state before trusting a config-change verification -- clear the cache/daemon between config-mutating runs and prefer the workspace-local CLI."

**Placement recommendation: execute Phase 3.5, as a short clause appended to E.3** (NOT the context-packaging Common Contract). Rationale:
- The Common Contract (`references/context-packaging.md`) governs *how the executor packages context for the advisor* -- it is about consultation-prompt construction, not about how the executor runs its own verification commands. Tooling-state freshness is an *executor verification-execution* concern, which is exactly what Phase 3.5 owns.
- Keeping it adjacent to E.3 (target selection) groups the two halves of "verify correctly": pick the right target (E.3 surface-match) AND ensure the tool reading it is fresh (E.3 freshness clause). The memory itself frames freshness as "the reliability complement... to the GAP-S9 verify-target-match finding -- 'right target' is necessary but not sufficient." [CITED: memory/feedback_nx_uat_verification_hygiene.md]

Phrase it descriptively (Sonnet steering style), e.g. a closing paragraph on E.3:

> A correct target still lies if the tool reading it serves stale state. Build orchestrators with a persistent daemon or cache (Nx, Turborepo, Gradle, watch-mode bundlers) can return a result from a cached graph that predates your change. When you verify a config change through such a tool, ensure the tooling state is fresh first -- clear the daemon/cache between config-mutating runs and prefer the workspace-local CLI over a globally-installed one. A stale-daemon result is not a verification.

This is execute-skill scope (a sub-rule of E.3), not a Common Contract rule.

### Finding 5: Symmetry-canon scope -- GAP-S9 is NOT a 4-skill mirror

Verified: the `<verify_before_commit>` / Phase 3.5 block exists ONLY in `lz-advisor.execute/SKILL.md`. A `git grep` for "Verify Before Commit", "Phase 3.5", "verify_before_commit" across `plugins/lz-advisor/skills/` returns only the execute SKILL.md. [VERIFIED: `git grep -l` 2026-05-31 -> single match: `lz-advisor.execute/SKILL.md`]

The plugin's byte-identical symmetry canon applies to the *shared* blocks (`<context_trust_contract>`, `<orient_exploration_ranking>`, the `@`-loaded references) that all 4 skills carry. Phase 3.5 and Phase 5 are execute-specific phases; review and security-review have their own non-mirrored phase structures. So:
- **The E.3 change-surface rule + freshness clause go ONLY in `lz-advisor.execute/SKILL.md`** (Phase 3.5). No mirror to plan/review/security-review's Phase 3.5 -- they don't have one.
- **The plan-side verify-step rule goes ONLY in `lz-advisor.plan/SKILL.md`** (`## Steps`). Review/security-review do not produce plan files with executable steps.

Net GAP-S9 touch set: 2 SKILL.md files (execute + plan), no symmetry-canon broadcast. [VERIFIED: per-skill structural inspection + git grep]

---

## GAP-S10 Findings

### Finding 6: Exact current Phase 5 packaging instructions + advisor trust-context guidance

**execute `## Phase 5: Final Advisor Consultation` (SKILL.md lines 239-264)**, verbatim:
> After committing, invoke the lz-advisor:advisor agent one more time. Package the final review consultation prompt per the Verification template in `@${CLAUDE_PLUGIN_ROOT}/references/context-packaging.md`. Include a summary of changes made, test results if applicable, and the commit reference.
>
> Adapt the template for the advisor's output shape. The Verification template's Findings-list structure (numbered findings with Severity / OWASP tags / code context) is shaped for the reviewer and security-reviewer agents; the advisor's Output Constraint requires a 100-word enumerated response beginning with `1.` and forbids Findings-list output. Skip the Findings-list scaffold for this call: package the summary block (changes made, test results, commit reference) plus a single targeted Request ("verify the approach is sound and flag any concerns"). Do not fabricate `### Findings` entries with severity tags -- the advisor does not produce that shape.

[VERIFIED: file read 2026-05-31, lines 239-256]

**The gap:** the Phase 5 instruction packages "a summary of changes made, test results, and the commit reference" -- a *summary*, NOT the post-change file *contents*. The Verification template (`context-packaging.md` lines 256-303) has a `## Findings` block with `Code context: [fenced block showing the relevant lines]` but the execute Phase 5 adaptation explicitly *skips the Findings-list scaffold* -- which is where code context would have lived. So the post-change component content is not reliably packed into the final consult. When the advisor wanted to see the component, it had nothing to read in-prompt and went disk-hunting. [VERIFIED: 08-NATURAL-UAT-COMPODOC.md S10 lines 618-644; consult_3_phase_5_final lines 572-585]

**advisor.md trust-context guidance (already present, lines 112-133)**, verbatim highlights:
> ## Context Trust Contract
> The executor packages context into your prompt... Trust what the executor packaged:
> - When a file's relevant contents are quoted in your prompt, you do not need to Read that file. The executor already did.
> ...
> Use Read and Glob only for facts NOT in your prompt. If you must verify multiple files, do it in a single turn with parallel tool calls... Your budget is 3 turns total.
> One-shot: if the prompt includes `.storybook/main.ts` contents and asks whether the `docs.autodocs: true` line is correct for Storybook 10, answer directly from the quoted contents. Do not Read `.storybook/main.ts` -- it is already in your prompt.

[VERIFIED: advisor.md lines 112-133]

The trust contract exists but (a) it is generic (not final-review-specific) and (b) it presumes the content IS packed. In the failure case the content was NOT packed, so "trust packed context" had nothing to bind to -- the advisor reasonably went looking. The root cause is therefore primarily a **packaging gap on the execute side**, with a secondary **agent-side reinforcement opportunity**.

### Finding 7: Concrete minimal high-leverage fix

Two complementary edits; the execute-side one is the higher-leverage of the two:

**(Primary) execute Phase 5: pack the post-change content.** Amend the Phase 5 packaging instruction so the final consult includes the post-change contents of the files the advisor would reasonably want to inspect -- the changed-file contents and/or the final diff -- not just a prose summary. Recommended: add a `## Relevant File Contents (post-change)` block to the Phase 5 prompt carrying the changed files' current contents (or `git show`/`git diff` of the commit). This removes the advisor's *reason* to Glob/Read: the thing it went hunting for is already in the prompt. This is the direct application of Common Contract Rule 1 ("Inline file contents for any file the advisor might need... every tool call burns one of its three turns") and Rule 4 ("Pack with turn-budget awareness... If your prompt is under-packaged, the advisor will spend 2-3 turns reading files and may exhaust its budget before synthesizing"). [CITED: context-packaging.md Common Contract Rules 1 + 4, lines 16-43]

Draft addition to Phase 5 (planner refines):
> Pack the post-change content the advisor would otherwise need to locate: include the changed files' current contents (or the commit's `git diff`) in a `## Relevant File Contents` block in the prompt. The advisor's budget is 3 turns; if it has to find the file you changed, it can exhaust that budget on disk before synthesizing. The thing you want it to review must be in the prompt, not just summarized.

**(Secondary) advisor.md: a final-review-specific trust clause.** Add one sentence to the Context Trust Contract (or the Consultation Awareness section) covering the completed-work/final-review framing specifically:
> For a final-review consultation (the executor's prompt summarizes completed, committed work and asks you to verify the approach), synthesize your answer from the packaged summary and the post-change contents in the prompt. Do not re-locate changed files on disk; if a file's name does not match a convention you expect (e.g., a component not named `*.component.ts`), the executor has already packaged what you need -- answer from the prompt rather than searching for it.

This directly addresses the observed failure: the advisor went hunting under a `.component.ts` glob (Angular convention) for a file actually named `ngx-smart-components.ts`. The clause names that exact trap. [VERIFIED: 08-NATURAL-UAT-COMPODOC.md S10 lines 622-624: "hunting on disk for the component file (glob mismatch on `.component.ts`)"]

**Highest-leverage single change if forced to pick one:** the execute-side packing (Primary). The agent-side clause is reinforcement; packing the content removes the trigger entirely. Recommend shipping both -- they are both short and address the same failure from the two sides (supply the content; instruct trust of it). This mirrors the "Both layers are necessary" pattern already used for hedge markers in Common Contract Rule 5c. [CITED: context-packaging.md Rule 5c, lines 84-91]

Phrase both per Sonnet/Opus steering style (descriptive, with the concrete `.component.ts` trap as the worked anchor) -- the advisor.md already uses a "One-shot:" worked example in its trust contract, so the new clause should match that house style. [CITED: memory/reference_sonnet_46_prompt_steering.md; advisor.md lines 130-133]

### Finding 8: maxTurns confirmation (fix does NOT touch it)

`plugins/lz-advisor/agents/advisor.md` frontmatter: `effort: high` (line 43), `maxTurns: 3` (line 45). No config drift. [VERIFIED: file read + `git grep -n "maxTurns\|effort:"` 2026-05-31]

The UAT's own corrected analysis confirms the fix is prompt-side: "advisor.md is configured maxTurns:3 (VERIFIED -- no config drift). tool_uses:4 is consistent with parallel tool calls within <=3 turns, not a 4th turn. The finding is NOT 'maxTurns too low' -- it is 'advisor spent its 3-turn budget on disk investigation instead of synthesizing from packed context.' This REINFORCES feedback_advisor_fix_approach: the fix is prompt-side (trust packed context / pack the content), NOT a maxTurns increase." [VERIFIED: 08-NATURAL-UAT-COMPODOC.md S10 lines 638-644]

**GAP-S10 touch set: `advisor.md` (trust clause) + `lz-advisor.execute/SKILL.md` (Phase 5 packing). maxTurns stays 3. effort stays high.**

---

## Recommended File-Touch Set (both gaps)

| File | Gap | Change | Symmetry mirror? |
|------|-----|--------|------------------|
| `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` | S9 | Add `### Select the verify target by change surface (E.3)` subsection in `<verify_before_commit>` before `### Pre-commit validation scope` (lines ~196); decision heuristic + 2 worked examples + tooling-freshness closing clause | No -- execute-only phase |
| `plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md` | S9 | Add a short rule in `## Steps` (lines ~178-188) instructing the plan to emit a final `**Validate**` step whose `Run:` matches the change surface | No -- plan-only artifact shape |
| `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` | S10 | Amend `## Phase 5` (lines ~239-256) to pack post-change file contents / commit diff into the final consult | No -- execute-only phase |
| `plugins/lz-advisor/agents/advisor.md` | S10 | Add a final-review-specific "synthesize from packed content; do not re-locate files on disk" clause to Context Trust Contract / Consultation Awareness (lines ~112-156). maxTurns/effort UNCHANGED | No -- advisor agent is single, shared |

Plus version sync IF the planner bumps the version: atomic across all 5 surfaces (`plugin.json` + 4 SKILL.md frontmatter). Note that only 2 of the 4 SKILL.md (execute, plan) are content-edited; review + security-review SKILL.md change ONLY if the version string is bumped. [CITED: memory/feedback_version_numbers_not_load_bearing_prerelease.md]

## Architecture Patterns

### Pattern: Defense-in-depth across plan + execute (GAP-S9)
**What:** Plan-side emits the change-surface-matched `Run:` step; execute-side E.2 already executes any plan `Run:` step; execute-side E.3 selects the target when no plan step exists.
**When to use:** Whenever a verification gap can be closed either by upstream setup (plan) or downstream safety net (execute). The UAT proved the plan-side path works (Sessions 8-9) and the execute-side default fails (Sessions 5, 7b) -- so ship both.

### Pattern: Pack-then-trust (GAP-S10)
**What:** Executor packs the content the agent needs (removes the trigger to search) + agent prompt instructs trusting packed content (reinforces). Mirrors the existing two-layer hedge-marker design (Common Contract 5c + agent Hedge Marker Discipline).
**When to use:** Any agent turn-budget exhaustion caused by the agent re-fetching context the executor already has.

### Anti-Patterns to Avoid
- **MUST/CRITICAL imperatives for the change-surface rule.** Sonnet 4.x literalism turns "MUST run the affected target" into spurious target runs on borderline changes. Use descriptive trigger + few-shot. [CITED: reference_sonnet_46_prompt_steering]
- **Raising maxTurns to "fix" S10.** Explicitly rejected; masks the packaging gap and adds cost. [CITED: feedback_advisor_fix_approach]
- **Broadcasting Phase 3.5 / Phase 5 edits to all 4 skills.** Those phases are execute-only; mirroring would be incoherent.
- **Making the change-surface rule Nx-specific.** The fix must generalize (build/unit/dev-server/lint surfaces across any framework); Nx is the worked example, not the rule.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Final-consult content delivery | A new "fetch component for advisor" tool flow | Pack contents into the Phase 5 prompt (Common Contract Rule 1) | The contract already mandates inlining; the gap is that Phase 5 skipped it |
| Plan-step verify execution | A new execute mechanism | The existing E.2 plan-Run-directive rule | E.2 already fires correctly when the plan names the target (Sessions 8-9 proof) |
| Agent turn-budget enforcement | maxTurns tuning | Packaging discipline + trust clause | Per feedback_advisor_fix_approach, root-cause is prompt-side |

## Common Pitfalls

### Pitfall 1: Phrasing the change-surface rule as a closed enumeration
**What goes wrong:** A fixed list (`nx test`->source, `nx build`->build) reads as exhaustive; Sonnet then fails to generalize to a target not in the list.
**How to avoid:** Frame as a *surface-class -> target-class* mapping with "when in doubt, run the target whose executor reads the file you edited," plus the contrastive worked example. The illustrative-not-exhaustive framing is already used elsewhere in these skills (e.g., the Nx/Angular/Next.js framework list at execute SKILL.md line 106). [VERIFIED: execute SKILL.md line 106]

### Pitfall 2: Packing a summary instead of contents in Phase 5
**What goes wrong:** Re-stating "added input()/output() with JSDoc" is a summary, not content; the advisor still can't *see* the component and goes hunting.
**How to avoid:** Pack the actual changed-file text or `git diff`, per Common Contract Rule 1's "include concrete file contents... not just file paths."

### Pitfall 3: Editing only execute for GAP-S9 and missing the plan-side mitigation
**What goes wrong:** Execute-side E.3 alone helps the no-plan case, but the *proven* fix path (plan emits `Run:`, E.2 executes) stays unwired, so plan-driven runs still depend on the planner happening to name the right target.
**How to avoid:** Edit both plan and execute (Finding 3).

## State of the Art

No external state-of-the-art shift applies -- these are internal prompt-contract fixes. The only "old vs new" is internal:

| Old (0.14.0 shipped) | New (this gap-closure) | Impact |
|----------------------|------------------------|--------|
| Phase 3.5 classifies validations by duration only | Phase 3.5 also selects target by change surface (E.3) + freshness clause | Config changes verified by the target that exercises them |
| Phase 5 packs a prose summary | Phase 5 packs post-change contents/diff | Advisor synthesizes instead of disk-hunting |
| Plan `## Steps` has no verify-step convention | Plan emits a change-surface-matched `**Validate**` step | E.2 fires on the right target for plan-driven runs |
| advisor.md trust contract is generic | + final-review-specific no-disk-hunting clause | Reinforces pack-then-trust for the Phase 5 call site |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | A decision-heuristic + 2 few-shot examples will steer Sonnet 4.6 to select the right verify target more reliably than a checklist | Finding 2 | If insufficient, may need the n>=3 fixture-grade re-run protocol (like the advisor fragment-grammar measurement in Plan 08-03) before declaring closed. Grounded in reference_sonnet_46_prompt_steering but not yet empirically re-measured for THIS rule. |
| A2 | Packing post-change contents into Phase 5 removes the advisor's reason to disk-hunt | Finding 7 | Low risk -- directly follows Common Contract Rules 1 + 4 and the observed root cause. But unverified until a re-run UAT shows the advisor synthesizing instead of searching. |

**These are the two decisions worth a quick user/planner confirmation before locking.** Everything else (file anchors, maxTurns value, symmetry scope, the closed-vs-open list of which files exist) is VERIFIED against current source.

## Open Questions

1. **Should GAP-S9 closure include an empirical re-run gate, or ship-and-watch?**
   - What we know: prior advisor-behavior fixes in this plugin (fragment-grammar, hedge-frame) used n>=3 fixture-grade re-runs before declaring closed (Plans 07-09, 08-03). The UAT was natural, not fixture-grade.
   - What's unclear: whether the planner wants a smoke fixture for the E.3 target-selection rule (analogous to E-verify-before-commit.sh) or treats the next natural UAT as the gate.
   - Recommendation: a lightweight fixture asserting "for a config-only change, the verify command run pre-commit is NOT a pure unit-test target" would give a durable regression vehicle, but it is optional for this gap-closure. Surface to user.

2. **Does the existing E-verify-before-commit.sh smoke fixture need updating for E.3?**
   - What we know: E-verify-before-commit.sh checks the `Verified:` trailer + tool_use dual-signal (execute SKILL.md line 209). It does not check target-vs-surface match.
   - Recommendation: out of scope unless the planner wants the regression vehicle from Q1.

## Environment Availability

> Skipped material dependencies: this is a code/prompt-only change to Markdown files in this repo. No external runtime is exercised by the gap-closure itself. (The Nx/Storybook tooling referenced in the rules lives in the *target* repo ngx-smart-components, not here; it is the subject of the rules, not a dependency of editing them.)

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| git | version sync, commit | yes (repo is git) | - | - |
| (no external tool needed to edit Markdown) | - | - | - | - |

## Validation Architecture

> `.planning/config.json` was not located in this research pass; treating nyquist_validation as enabled (absent = enabled). This plugin's "tests" are bash smoke fixtures, not a unit-test framework.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Bash smoke fixtures under the plugin's test harness (e.g., `D-advisor-budget.sh`, `E-verify-before-commit.sh`, `B-pv-validation.sh`, `F-class-2-escalation.sh`, `G-advisor-narrative-sd-pv.sh`) + UAT replay runners |
| Config file | none -- per-fixture bash scripts; `bash -n` syntax-check is the lint gate |
| Quick run command | `bash <fixture>.sh` (or `--from-trace <trace>` for captured-trace replay) |
| Full suite command | run all smoke fixtures + (optionally) a Compodoc UAT replay |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GAP-S9 | Config-only change verified by a non-unit target | smoke (optional new fixture) + natural UAT | (new) `bash E3-verify-target-match.sh --from-trace <trace>` | Wave 0 (optional) |
| GAP-S9 | Plan emits change-surface-matched `Run:` step | manual/UAT inspection of a generated plan | review plan-file `## Steps` for a `**Validate**` step | manual |
| GAP-S10 | Final consult packs post-change content; advisor synthesizes (no disk-hunt, numbered output) | UAT replay assertion (advisor consult #3 produces numbered synthesis, tool_uses do not exceed budget hunting) | Compodoc UAT replay + trace inspection of Phase 5 consult | manual/UAT |

### Sampling Rate
- **Per task commit:** `bash -n` on any edited fixture; re-read edited SKILL/agent prose.
- **Per gap-closure:** if a fixture is added, run it; otherwise a Compodoc execute UAT replay exercising Phase 3.5 + Phase 5.
- **Phase gate:** the next natural/replay UAT shows (a) a config change verified by the matching target and (b) the final advisor consult producing a numbered synthesis without disk-hunting.

### Wave 0 Gaps
- [ ] (OPTIONAL) `E3-verify-target-match.sh` -- asserts a config-only change's pre-commit verify command is not a pure unit-test target. Surface to user (Open Question 1).
- [ ] No framework install needed -- bash + the existing harness cover it.

*(If the planner declines the optional fixture: "None -- existing UAT replay infrastructure + manual trace inspection cover both gaps.")*

## Security Domain

> `security_enforcement` config not located this pass (absent = enabled). However, this gap-closure is a prompt-contract edit to Markdown files with no new code paths, no input handling, no auth/session/crypto surface, and no dependency changes.

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | n/a -- no auth surface |
| V3 Session Management | no | n/a |
| V4 Access Control | no | n/a |
| V5 Input Validation | no | the edits add no input-handling code; the advisor/executor already treat fetched content as untrusted via Common Contract 5a (unchanged here) |
| V6 Cryptography | no | n/a |

No ASVS category is engaged by editing skill/agent Markdown prose. The plugin's existing least-privilege posture is untouched: `advisor.md` tools stay `["Read", "Glob"]`, maxTurns stays 3, and no tool grant is added. [VERIFIED: advisor.md frontmatter]

### Known Threat Patterns for this change
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Prompt-injection via packed post-change content (S10 packs file contents/diff into the advisor prompt) | Tampering | The advisor already treats packaged content as evidence-not-instructions; fetched/untrusted content uses the `<fetched trust="untrusted">` wrapper per Common Contract 5a. Post-change content is the executor's own committed work (first-party), lower risk than fetched web content. No new mitigation required, but the planner should keep the packed diff inside the existing structured-prompt conventions. [CITED: context-packaging.md Rule 5a] |

## Sources

### Primary (HIGH confidence -- read this session)
- `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` (full) -- Phase 3.5 lines 173-221, Phase 5 lines 239-264
- `plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md` (full) -- `## Steps` template lines 178-188
- `plugins/lz-advisor/agents/advisor.md` (full) -- Context Trust Contract lines 112-133, frontmatter maxTurns:3/effort:high lines 41-45
- `plugins/lz-advisor/references/context-packaging.md` (full) -- Common Contract Rules 1/4/5a/5c, Verification template lines 256-303
- `plugins/lz-advisor/references/advisor-timing.md` (full)
- `.planning/phases/08-.../08-NATURAL-UAT-COMPODOC.md` (full, 1015 lines) -- AMENDMENT block, S9 (lines 596-617), S9-RECURRENCE (822-833), S10 (618-644), Session 5 consult #3 (572-585), Dev-Server Fix Loop + s9_mitigation_evidence (941-970), Nx-UAT methodology lessons (988-1002)
- `.planning/ROADMAP.md` -- Phase 8 gaps (lines 263-268)
- `.planning/STATE.md` -- Roadmap Evolution Phase-8-reopened note (line 136)
- `.planning/phases/08-.../08-HUMAN-UAT.md` (full)
- `git grep -l "Verify Before Commit|Phase 3.5|verify_before_commit"` -> single match (execute SKILL.md) confirming non-mirrored scope
- `git grep -n "maxTurns|effort:"` advisor.md -> maxTurns:3, effort:high

### Project memories (locked-decision authority)
- `feedback_advisor_fix_approach.md` -- prompt-side fix, not maxTurns (GAP-S10)
- `project_advisor_maxturns_exhaustion.md` -- the original exhaustion pattern GAP-S10 recurs
- `feedback_nx_uat_verification_hygiene.md` -- tooling-state-freshness sub-rule (GAP-S9 sub-finding b)
- `reference_sonnet_46_prompt_steering.md` -- descriptive-trigger + few-shot phrasing style (both gaps)
- `project_executor_orientation_overinvestigation.md` -- related executor over-investigation context
- `feedback_version_numbers_not_load_bearing_prerelease.md` -- version cadence discretion

### Secondary / Tertiary
- None. No external web research required; this is an internal prompt-contract gap-closure with all evidence in-repo.

## Metadata

**Confidence breakdown:**
- Exact source anchors (Phase 3.5, Phase 5, advisor trust contract, maxTurns): HIGH -- read verbatim from current source with line numbers.
- Placement/scope recommendations (execute-only Phase 3.5, plan+execute for S9, no symmetry broadcast): HIGH -- verified by git grep that the phases are non-mirrored.
- Phrasing approach (decision heuristic + few-shot, no imperatives): HIGH on the style rule (cited memory), MEDIUM on whether THIS specific rule will steer reliably without re-measurement (A1).
- Pack-then-trust fix for S10: HIGH on root-cause + mechanism; MEDIUM on empirical confirmation pending a re-run (A2).

**Research date:** 2026-05-31
**Valid until:** 2026-06-30 (stable -- internal prompt contracts; no fast-moving external dependency). Re-confirm if the plugin version or the execute/plan/advisor files change before planning.
