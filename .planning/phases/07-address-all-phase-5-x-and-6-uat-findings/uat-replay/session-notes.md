---
status: complete
phase: 07-address-all-phase-5-x-and-6-uat-findings
plugin_version: 0.10.0
testbed: D:/projects/github/LayZeeDK/ngx-smart-components
testbed_branch: uat/phase-7-v0_10_0
scenario: Compodoc + Storybook 10 + Angular signals integration (version-agnostic prompt)
sessions_completed: 8
sessions_pending: 0
verdict: PASS-with-residual
started: 2026-05-01
updated: 2026-05-01
---

# Phase 7 Compodoc UAT Replay - Session Notes

## Scenario

Version-agnostic Compodoc + Storybook + Angular signals prompt against `ngx-smart-components` testbed on plugin 0.10.0. The prompt deliberately omits version qualifiers and `check-the-docs` cues so Pattern D web-first ranking + Plan 07-01 pv-* synthesis discipline + Plan 07-03 version-qualifier anchoring fire organically.

**Initial prompt (per memory `project_compodoc_uat_initial_plan_prompt.md`):**

```
/lz-advisor.plan Set up Compodoc with Storybook in this Nx Angular library. Add a sample input and a sample output to our component using the input() and output() signal functions. The Docs tab should render JSDoc descriptions for the component, the input, and the output.
```

## Session Index

| # | Skill | Session ID | Plan output / Commit | Status |
|---|-------|-----------|----------------------|--------|
| 1 | lz-advisor.plan | f2d669f3-075a-4cc3-a814-85feb7f911f7 | `plans/compodoc-storybook-setup.plan.md` | Complete |
| 2 | lz-advisor.execute | 6276171a-61fc-4577-92b2-71d49e76cfe3 | Commits `eb9107f` (wip), `8c25c9e` | Complete |
| 3 | lz-advisor.review | (pending) | (pending) | Pending |
| 4 | lz-advisor.security-review | (pending) | (pending) | Pending |

## Session 1 - lz-advisor.plan

**Tool-use summary:** 1 ToolSearch + 5 WebSearch + 9 WebFetch + ~40 Bash reads of installed code + 1 Agent (advisor) + 1 Write. Advisor used 0 tool_uses, 9.0s, 23K tokens.

### Phase 7 PASSES (with evidence)

| Plan | Finding | Evidence |
|------|---------|----------|
| 07-01 | **G2 ToolSearch precondition (FIRST EMPIRICAL CLOSURE)** | L56 `ToolSearch select:WebSearch,WebFetch` fired BEFORE L62 first WebSearch and L65/L66 first WebFetch. Phase 6 found 0/6 sessions doing this. |
| 07-01 | **Rule 5b pv-* synthesis (XML format, source-grounded, no self-anchor)** | 4 `<pre_verified>` blocks emitted in advisor consultation prompt: `chunk-XA6C6Y3S.js`, `chunk-T5YQQKXO.js`, `builders/build-storybook/index.js`, `build-schema.json`. All blocks have `source=` attribute (real installed file paths), `claim_id="pv-N"`, `<evidence method="Read">` with verbatim code excerpts. B-pv-validation.sh 4-assertion gate satisfied empirically. |
| 07-01 | **Finding H self-anchor rejection** | All 4 pv-* blocks anchored on actual `Read` tool outputs from installed code; zero "prior knowledge"/"training data" anchors. |
| 07-02 | **Advisor batch-tools, trust-context** | Advisor used **0 tool uses** (synthesized direction from packaged context only). Phase 5 baseline burned multiple turns re-reading. |
| 07-03 | **Rule 5d version-qualifier anchoring** | Orientation findings empirically anchored: `@storybook/angular: 10.3.5`, `@compodoc/compodoc: 1.2.1` (TRANSITIVE-only flagged), Angular 21.2.x, Nx 22.6.5. No "Storybook 10+" propagated. |
| 07-03 | **Verdict scope marker** | Plan output line 154: `**Verdict scope:** scope: api-correctness` rendered correctly. |
| Pattern D | **Web-first ranking on Class 2/3** | 5 WebSearch + 9 WebFetch on the Class 2/3 question. All searches included version markers. |
| Trust contract | **No agent-generated source detected** | No `---` block / `<fetched>` / `/plans/` mention - trust-contract carve-out correctly didn't fire. Self-anchor pathway closed by Rule 5b. |

### Phase 7 GAPS (with evidence)

| Plan | Finding | Evidence | Severity |
|------|---------|----------|----------|
| 07-04 | **Word budget overrun on advisor SD** | Strategic Direction at 133 words / 100w cap (33% over). Code-heavy enumeration inflated count. Same class as DEF-response-structure smoke fixture's 110w regression. **Word-budget enforcement remains soft on code-dense outputs.** | minor (was 412w in Phase 6 - improvement, but not closed) |

### Phase 8 Candidates (new findings unrelated to Phase 7 goals)

| ID | Finding | Evidence | Hypothesis |
|----|---------|----------|------------|
| P8-01 | **`@storybook/global` vs `globalThis` idiom miss** | pv-1 evidence correctly noted "The `global` object is from `@storybook/global` (which exports `globalThis`)" - but advisor SD step 3 picked `(globalThis as any).__STORYBOOK_COMPODOC_JSON__`. Both work; `@storybook/global` matches Storybook's internal convention (`chunk-CT6JF2ND.js`: `import { global } from "@storybook/global"; global.STORYBOOK_ENV = "angular"`). The plan used `globalThis` for cross-runtime safety. Defensible but non-canonical. | Plan/advisor could surface "library-internal-idiom vs portable-equivalent" trade-offs explicitly when both options are technically correct. Not a regression; missed opportunity for higher-fidelity output. |
| P8-02 | **Plan should propose `.d.ts` for generated-file imports, not just gitignore** | Plan Key Decisions block flagged: "TypeScript may complain about `../../../documentation.json` not existing until the first compodoc run." Proposed remediation: gitignore. This addresses git churn but NOT the IDE diagnostic. The session-2 final advisor caught this and recommended a `.d.ts` declaration. The plan-skill could detect generated-file imports and propose the `.d.ts` alongside the gitignore. | New plan-skill heuristic: when an import path resolves to a generated file (gitignored, build artifact, runtime injection), propose both `.gitignore` and a `.d.ts` declare-module shim. |

---

## Session 2 - lz-advisor.execute

**Tool-use summary:** 6 Bash + 7 Read + 5 Edit + 4 Write + 2 Agent (advisor pre-execute + advisor final) + 0 ToolSearch + 0 WebSearch + 0 WebFetch. Both advisor consultations 0 tool_uses each.

**Commits:**
- `eb9107f` (wip:) - main implementation, 8 files changed (65 insertions, 8 deletions)
- `8c25c9e` (fix:) - documentation.d.ts type declaration to suppress IDE diagnostic

### Phase 7 PASSES (with evidence)

| Plan | Finding | Evidence |
|------|---------|----------|
| 07-01 | **Trust contract correctly classified plan as agent-generated** | Executor read plan via `@plans/...` mention. Did NOT re-fetch upstream Storybook docs (correct - versions match plan's pv-* blocks; trust contract carve-out for vendor-doc reads applies). L35: "Current state matches plan assumptions." |
| 07-02 (E.2) | **wip-commit + Outstanding Verification body section** | Commit `eb9107f` subject: `wip: set up Compodoc + Storybook integration with signal-based component API`. Body has explicit `## Outstanding Verification` section listing `pnpm nx build-storybook` and `pnpm nx reset`. **First empirical instance of Plan 07-02 cost-cliff allowance firing on a real UAT.** |
| 07-02 (E.2) | **`Verified:` trailer format** | Commit `eb9107f` body has 2 `Verified:` trailers (cheap claims that were executed): `Verified: @compodoc/compodoc 1.2.1 is present as a transitive dep (rg confirmed in node_modules)`, `Verified: documentation.json added to .gitignore before first build (per advisor Critical block)`. |
| 07-02 (E.1) | **Hedge marker discipline empirically firing** | Final advisor (L120) item 3: `Assuming \`@storybook/addon-docs\` v10 is installed (unverified), do verify \`tags: ['autodocs']\` at preview-level is honored. Verify addon-docs v10 before acting.` Canonical Plan 5/6 hedge frame. **First empirical instance of executor encountering the literal frame in this UAT.** |
| 07-02 (E.1) | **Hedge resolution by executor (not silent acceptance)** | Executor at L122 explicitly addressed advisor's hedge: ran `rg "version" node_modules/@storybook/addon-docs/package.json` (L123), got "path not found" (L126), fell back to `@storybook/angular` 10.3.5 (L128), confirmed at L133: "addon-docs is bundled into @storybook/angular 10.3.5 -- tags: ['autodocs'] is valid." This **resolves the hedge empirically rather than silently accepting**. |
| 07-02 (Phase 3 Reconciliation - apply-then-revert) | **No silent revert observed** | Pre-execute advisor's Critical block (`.gitignore` documentation.json) was applied during execute (L79); advisor item retained, no revert. |
| 07-03 | **Verdict scope marker rendered in completion summary** | L1072: `**Verdict scope:** scope: api-correctness`. |
| 07-04 | **Advisor word-budget improved over Phase 6 baseline** | Pre-execute advisor: 135w (5 numbered + Critical block), Final advisor: 115w (5 numbered). Both over the 100w cap, but vs Phase 6 advisor baselines (412-438w) this is dramatic improvement. |

### Phase 7 GAPS (with evidence)

| Plan | Finding | Evidence | Severity |
|------|---------|----------|----------|
| 07-02 (Phase 3 Reconciliation) | **Reconciliation rule NOT invoked when advisor contradicted plan's pv-2** | Pre-execute advisor (L37) said "Storybook writes [documentation.json] to the project root, not workspace root" - this CONTRADICTS plan's pv-2 evidence from session 1: "The `@storybook/angular` 10.3.5 builder's `runCompodoc` auto-adds `-p tsconfig` and `-d workspaceRoot` to compodocArgs". Plan's pv-2 was a verified `Read` of `chunk-T5YQQKXO.js` showing literal: `["-d", \`${context.workspaceRoot \|\| "."}\`]`. Session-2 advisor's "Storybook writes to project root" is empirically wrong as a default; only true with explicit `-d packages/ngx-smart-components`. Per Plan 07-02 execute SKILL.md `<execute>` Reconciliation block: *"If findings point one way and the advisor points another, do not silently switch. Surface the conflict in one more advisor call."* Executor (L40) noted "The advisor has provided key deviations from the plan" and **proceeded silently to apply** without reconciliation call. Functional outcome equivalent (project root works), but reconciliation discipline failed. | major |
| 07-02 (Verified: format) | **Second commit had verification in body but not formal `Verified:` trailer** | Commit `8c25c9e` body: "addon-docs is bundled in @storybook/angular 10.3.5 -- tags: ['autodocs'] is valid." Verification claim is correct AND was empirically performed (L123-L130 tool_use). But it's prose, not the formal `Verified: <claim>` trailer line format. Plan 07-02 Format spec: *"Format: `Verified: <claim text>` on its own line in the commit body"*. This makes it harder for E-verify-before-commit.sh and audit grep to detect. | minor |
| 07-02 (wip-discipline scope ambiguity) | **Non-wip follow-up commit shipped while parent had unresolved Outstanding Verification** | Commit `8c25c9e` (`fix(storybook):`) shipped on top of wip parent `eb9107f` BEFORE the parent's Outstanding Verification items (`pnpm nx build-storybook`, `pnpm nx reset`) ran (transcript shows no `nx build-storybook` Bash invocation between L117 and L138). Plan 07-02 text says: *"Convert the `wip:` commit to a regular commit (or follow up with a non-wip commit) once the Outstanding Verification items have been executed."* The executor interpreted this per-commit ("my new commit's own claim is verified, so it's not wip"); the strict reading is branch-state ("a wip parent forces all follow-ups to remain wip until parent's Outstanding Verification clears"). SKILL.md does not disambiguate. The per-commit reading lets a long-running verification get masked by a chain of "clean" follow-up fixes. | major |
| 07-04 | **Word budget overrun on both advisor calls** | Pre-execute: 135w / 100w (35% over). Final: 115w / 100w (15% over). Same code-density inflation pattern as session 1. | minor |
| 07-01 (ToolSearch precondition - soft) | **Zero ToolSearch in execute session** | Strictly correct under Plan 07-01 (no NEW pv-* blocks were synthesized during execute), but the executor DID read installed code at L53, L123, L128 to verify advisor claims. Those reads were single-fact verifications, not consultation-prompt anchors, so pv-* wasn't required. Soft gap: executor-internal verifications could optionally synthesize lightweight pv-* blocks for the audit trail even when not packaged into a downstream consultation. | informational |

### Phase 8 Candidates (new findings unrelated to Phase 7 goals)

| ID | Finding | Evidence | Hypothesis |
|----|---------|----------|------------|
| P8-03 | **NEW failure mode: confidence-laundering by reframing recommendation as factual correction** | Pre-execute advisor said "Storybook writes [documentation.json] to the project root, not workspace root" - framed as factual correction when it was actually a recommendation that depends on the explicit `-d packages/ngx-smart-components` argument. The plan's pv-2 evidence (workspace-root default per `chunk-T5YQQKXO.js`) is empirically correct as a default. The advisor's recommendation is internally valid (you CAN explicitly redirect with `-d`) but was framed in a way that misled the executor about the empirical default. **NOT covered by Phase 7's 4 confidence-laundering guards** (Rule 5c hedge propagation, Rule 5d version-qualifier anchoring, scope markers, hedge tracking). | Possible Phase 8 guard: "Pre-Verified Contradiction Rule. When advisor recommends a value/path/setting that contradicts a `<pre_verified>` block in the prompt, advisor MUST flag the contradiction with `Reframing: pv-N said X, recommending Y because <empirical reason>` rather than restating the recommendation as fact. The executor's Reconciliation rule then has a literal sentinel to grep on." |
| P8-04 | **Final advisor item 1 (resolveJsonModule on IDE-visible tsconfig) NOT addressed but also NOT explicitly deferred** | Final advisor (L120) item 1: "Add `resolveJsonModule: true` to the IDE-visible TypeScript project... not just `.storybook/tsconfig.json`". Executor addressed item 2 (`.d.ts` declaration) instead, which solves the SYMPTOM (IDE diagnostic) but not the CAUSE (IDE editor doesn't see `.storybook/tsconfig.json`'s settings). Item 1 is silently dropped. | Possible Phase 8: execute SKILL.md should require completion summary to explicitly map advisor concerns to (addressed / deferred / rejected) - same convention Plan 07-02 introduced for plan-skill numbered findings, but for advisor concerns at the execute layer. |
| P8-05 | **Settings-level: `pnpm add` denied by Stage 2 classifier** | L48: `pnpm add -DW @compodoc/compodoc` rejected. Executor pivoted to direct `package.json` Edit (L55). Not a Phase 7 plugin gap; user-side `settings.json` permissions issue. | Out of scope for Phase 7/8. User-level settings tweak. |
| P8-06 | **TypeScript `Cannot find module` IDE diagnostic on generated imports is recurring pattern** | Same issue raised in plan Key Decisions (P8-02), confirmed during execute (L108: diagnostics attachment), addressed via `.d.ts`. The pattern affects ANY generated-file import (compodoc JSON, codegen output, asset hashes). | Could be a plan-skill heuristic AND an execute-skill verification step: when an import path is gitignored or matches build-output patterns, generate the `.d.ts` proactively. Tied to P8-02. |

---

## Session 3 - lz-advisor.review

**Invocation:** `/lz-advisor.review eb9107f829d4cf0bd45aaab9b81a134acc65a26d^..8c25c9e3f013f24c7492936da0a19d626d53442b`
**Session ID:** `a1503efa-0950-4da2-b71b-24a4cfa5892b`

**Tool-use summary:** ~10 Bash (git diff/log + installed-code reads of `runCompodoc` + `up()` discovery + main.ts) + 8 Read (changed files + sibling .storybook files) + 1 ToolSearch + 1 WebSearch + 3 WebFetch (compodoc signal support / releases / issue #1490) + 1 Agent (reviewer). Reviewer used 0 tool_uses, 22.4s, 22.6K tokens.

### Phase 7 PASSES (with evidence)

| Plan | Finding | Evidence |
|------|---------|----------|
| 07-01 | **ToolSearch precondition firing on review skill** | L98: `ToolSearch select:WebSearch,WebFetch` invoked BEFORE first WebSearch (L101) and WebFetch (L103). Second empirical confirmation across the UAT chain (session 1 plan-skill was first). **Plan 07-01 ToolSearch supplement is byte-identical across all 4 SKILL.md - empirically firing in session 3 confirms the cross-skill canon.** |
| 07-01 | **Rule 5b pv-* synthesis (3 source-grounded blocks)** | Reviewer consultation prompt has 3 `<pre_verified>` blocks: pv-1 (`chunk-T5YQQKXO.js` Read evidence of `runCompodoc` impl), pv-2 (`builders/start-storybook/index.js` Read evidence of `find-up` auto-discovery), pv-3 (WebFetch evidence on compodoc releases + GitHub issue #1490). All three have non-empty `<evidence method="...">` with verbatim tool-output excerpts. |
| 07-05 | **Pre-emptive Class-2 scan (Option 1 closure for Finding F) - SUCCESS** | L45: executor explicitly invoked Class-2 pre-emption on `compodoc` option support. L97 + L101: pre-emptive WebSearch + WebFetch on Compodoc signal support before consultation. Result: reviewer received pv-3 anchor in prompt; reviewer surfaced Finding 2 (Compodoc #1490 may break label documentation) WITHOUT needing to emit a `<verify_request>` block. **First empirical instance of Plan 07-05 Option 1 + Option 2 working in tandem - pre-emption successfully anticipated the Class-2 surface that would have escalated.** |
| 07-02 | **Reviewer hedge marker discipline empirically firing** | Reviewer Finding 2 contains literal canonical frame: *"Unresolved hedge: pv-3 confirms #1490 is still open as of May 2026. Verify the generated `documentation.json` actually contains `label` with type `string` and default `'NgxSmartComponents works!'` before committing."* This is the Plan 07-02 Hedge Marker Discipline frame firing on the reviewer agent (not just the advisor in sessions 1-2). Reviewer escalated unresolved hedge instead of silently rubber-stamping. |
| 07-02 | **Reviewer raised severity independently (not rubber-stamping)** | Reviewer raised Finding 3 from `Suggestion` (executor's initial classification) to `Important`: "Raising severity: this is the only output on the only component, and the integration exists to demo signal-based APIs." Independent triage rather than echoing executor's framing. |
| 07-03 | **Verdict scope marker rendered** | L1133: `**Verdict scope:** scope: api-correctness` |
| 07-03 | **Scope-disambiguated provenance markers in cross-skill flow** | Plan SKILL.md output and execute SKILL.md completion both render `Verdict scope: api-correctness`. Review SKILL.md does the same. The marker propagates verbatim across the 3-skill chain - downstream skills (security-review next) can detect the api-correctness scope and decide whether to inherit or override. |
| 07-04 | **Reviewer structural sub-caps mostly enforced** | All 5 findings entries individually within ≤80w cap (max ~76w on Finding 2). Cross-Cutting Patterns ~130w within ≤160w cap. **Missed surfaces section ~31w (just over 30w cap by 1 word).** |
| Pattern D | **Web-first on Class 2 questions** | L101 WebSearch on Compodoc signals, L103 WebFetch releases, L106 WebFetch issue #1490, L110 WebFetch tag/1.2.1. All Class-2/3 question shape (API currency / known issues). |
| Trust contract | **Diff-derived scope, not narrative-derived** | L18-L21: scope mechanically derived via `git diff --name-only` for the commit range. No mention of plan file, session-notes, or any other narrative artifact. **Plan 07-02 Narrative-Isolation Rule empirically firing.** |

### Phase 7 GAPS (with evidence)

| Plan | Finding | Evidence | Severity |
|------|---------|----------|----------|
| 07-04 | **Reviewer aggregate word budget overrun** | Per-section caps mostly hold (entries ≤80w, CCP 130w ≤160w cap), but **Missed surfaces ~31w just over 30w cap by 1 word**. Aggregate of all sections ~430-470w (back-of-envelope from line counts) - well over the 300w aggregate cap that D-reviewer-budget.sh smoke fixture asserts. Same class regression as advisor word budget overruns in sessions 1+2 (133w / 135w / 115w). | minor |
| 07-04 | **Plan 07-04 word-budget structural sub-caps don't translate to aggregate cap on code-dense reviews** | The per-finding 80w sub-cap was designed assuming N findings of typical density would aggregate ≤300w. Code-dense reviews (XML pv-* references, file:line refs, code excerpts in finding bodies) push individual entries near the 80w cap and the 5-finding aggregate exceeds 300w even when no individual entry breaks. | minor |

### Phase 8 Candidates (new findings unrelated to Phase 7 goals)

| ID | Finding | Evidence | Hypothesis |
|----|---------|----------|------------|
| P8-07 | **Pre-emptive Class-2 scan didn't catch UX/integration surfaces (Storybook Actions gap)** | Executor's Phase 1 pre-emption (Plan 07-05) targeted vendor library imports + framework version-conditional patterns + build-tool target configs - all Class-2 surfaces. **Reviewer Finding 3 (`clicked` output lacks Actions integration) is a UX/integration gap, not a Class-2 surface**, so pre-emption couldn't have caught it. Reviewer caught it independently and raised severity. The pattern "library exposes signals, stories don't bind output handlers" is a general gap that recurs across signal-based UI library setups. | Possible Phase 8: extend Plan 07-05 pre-emption taxonomy with **Class 5 (UX integration surfaces)**: when a component has `@Output` / `output()` signals AND the stories file lacks `parameters.actions` or `argTypes.<output>.action`, flag for review. Or simpler: keep Plan 07-05 narrow (Class 2 + 2-S) and rely on reviewer's independent triage to catch UX gaps, since that's working. |
| P8-08 | **Reviewer recommendations lack executable verification destinations** | Reviewer Finding 2: "Verify the generated `documentation.json` actually contains `label` with type `string` and default..." - but doesn't specify HOW (build first, then `jq` query? `rg` the file? open Storybook UI?). The execute SKILL.md verify-before-commit discipline (Plan 07-02 E.2) handles `Verified: <claim>` trailers but doesn't have a workflow for "the reviewer asked the executor to verify *after* build". The reviewer's hedge propagates but lacks a concrete Run: directive. | Possible Phase 8: add a "Reviewer Verification Checklist" output section to review SKILL.md that lists post-review verifications with explicit `Run: <command>` directives, reusable by execute SKILL.md's plan-step shape rule (Plan 07-02 E.2 `Run:` / `Verify:` parsing). This closes the loop: reviewer flags hedge -> reviewer emits Run: directive -> downstream execute or plan-fixes session executes pre-commit. |
| P8-09 | **Reviewer Finding 4 (`tags: ['autodocs']` global vs per-component) is a maintenance concern unrelated to Phase 7** | Valid review finding about Storybook config style; not a Phase 7 plugin gap. | Out of scope for Phase 7/8. Pure code-quality finding. |

## Session 4 - lz-advisor.plan (plan-fixes)

**Invocation:** `/lz-advisor.plan Address findings in @plans/compodoc-storybook-setup.review.md`
**Session ID:** `0d55118f-5f3a-4e2e-8994-2dc224cf3549`
**Plan output:** `plans/address-compodoc-storybook-review-findings.plan.md`

**Tool-use summary:** 5 Read (project files via @ reference + sibling files) + 1 Agent (advisor) + 1 Write. **Zero ToolSearch, zero WebSearch, zero WebFetch.** Advisor used 0 tool_uses, 10.8s, 21.3K tokens.

### Phase 7 PASSES (with evidence)

| Plan | Finding | Evidence |
|------|---------|----------|
| 07-01 | **Trust contract correctly classified review file as agent-generated** | L34: executor explicitly recognized "The review source is agent-generated, so I need to flag the Storybook 10 Actions API question (Finding 3) as needing verification." Verify-first markers from review file (`Workaround if broken:`, severity tags) preserved verbatim into Source Material section of advisor consultation prompt - not promoted to a Pre-Verified section. **Plan 07-01 trust contract carve-out empirically firing on plan-fixes input.** |
| 07-02 (E.1) | **Hedge Marker Discipline FIRING (advisor surfaced TWO hedges in plan-fixes)** | Advisor SD item 3: *"Assuming `@storybook/angular@10.3.5` still routes Angular `output()` emissions through the Actions addon (unverified), do prefer `argTypes` over `fn()`... Verify Actions integration before acting."* Advisor SD item 5: *"Unresolved hedge: `find-up` auto-discovery claim is agent-generated and unverified. Verify Compodoc resolves `tsconfig.doc.json` without `-p` before removing."* **TWO canonical hedge frames in a single advisor consultation - first instance across the full UAT chain.** |
| 07-02 (silent-resolve) | **Findings Disposition section addresses ALL 5 input findings (FIRST EMPIRICAL CLOSURE)** | Plan output line 21-37 has explicit disposition table: F1 addressed (Step 1), F2 addressed (Step 2+3), F3 addressed (Step 4), F4 deferred (no action per advisor), F5 rejected (find-up claim unverified). **Zero silent drops.** This is the exact failure pattern Plan 07-02 silent-resolve sub-pattern was designed to prevent (7th UAT plan-fixes-2 dropped F3+F4 silently). **First confirmed empirical closure on a real plan-fixes UAT.** |
| 07-02 (Plan-step shape E.2) | **Plan steps 5 and 6 use canonical Run: / Verification: shape** | Step 5: `Command: npx nx build-storybook ngx-smart-components` + `Verification: Open packages/.../documentation.json and confirm label appears under inputsClass with type: "string"...`. Step 6: `Command: npx nx storybook ngx-smart-components` + `Verification: Confirm the Actions panel logs a clicked event entry on each click.` Both steps map to executor-bound verification actions per Plan 07-02 plan-step shape rule. |
| 07-02 (apply-then-revert / Finding A) | **Step 5 includes explicit reconciliation fallback** | Step 5 Fallback: *"If `label` is missing or misclassified, revert Step 3 (restore `input<string>(...)`) and instead use the approach of removing JSDoc..."* This is the Plan 07-02 reconciliation policy (apply-then-revert pattern) explicitly documented in the plan, not silent. |
| 07-03 (Rule 5d) | **Version anchoring preserved across consultation chain** | Plan packaged "@storybook/angular@10.3.5", "@compodoc/compodoc@1.2.1", "Angular 21.2", "Nx 22.6.5" in orientation findings. Advisor preserved version qualifier in item 3: "@storybook/angular@10.3.5 still routes Angular output()...". |
| 07-03 (verdict scope) | **Verdict scope marker rendered** | Plan output: `**Verdict scope:** scope: api-correctness`. |
| 07-04 (advisor turn budget) | **0 tool_uses by advisor** | Advisor synthesized direction from packaged context only. Ongoing Phase 6 baseline improvement. |
| 07-02 (Critical block preservation) | **Advisor `**Critical:**` block preserved verbatim in plan output** | Plan file body retains: *"**Critical:** Run `npx nx build-storybook ngx-smart-components` after step 2 and inspect `documentation.json`..."* No paraphrase, no demotion. |

### Phase 7 GAPS (with evidence)

| Plan | Finding | Evidence | Severity |
|------|---------|----------|----------|
| 07-01 (ToolSearch precondition) | **ToolSearch precondition NOT invoked despite Class-2 surfaces in agent-generated input** | Plan 07-01 ToolSearch availability rule: *"When the input prompt contains agent-generated source material AND the question classifies as Class 2 / 3 / 4..., invoke `ToolSearch select:WebSearch,WebFetch` BEFORE ranking. This step fires regardless of whether the orient ranking has classified the question yet; it is a precondition for ranking, not a result of it."* Plan-fixes input is agent-generated review file with explicit Class-2 questions (Storybook 10 Actions integration, Compodoc #1490 status, find-up auto-discovery behavior). Executor went directly from Phase 1 reads (L19-L31) to Phase 2 advisor consultation (L35) without ToolSearch invocation. **Zero web tool uses in entire session.** Per the rule's strict reading, this is a precondition violation. The downstream consequence: advisor produced 2 unresolved hedges (items 3 + 5) that should have been pre-empted before consultation. The hedges propagate forward to execute-fixes, which is consistent with Plan 07-02 hedge-marker discipline as a fallback - but Plan 07-01 was designed to pre-empt this case at the plan-skill layer. | major |
| 07-04 | **Advisor word budget overrun** | Advisor SD ≈150 words / 100w cap (50% over). 5 numbered items + Critical block. Same class as sessions 1-3 (133-135w plan, 115-135w execute). Code-density inflation pattern persists across all 4 sessions. | minor |

### Phase 8 Candidates (new findings unrelated to Phase 7 goals)

| ID | Finding | Evidence | Hypothesis |
|----|---------|----------|------------|
| P8-10 | **Plan-fixes consult prompt could include a `## Verification Pre-empted` section listing which Class-2 questions were pre-empted via web tools and which weren't** | The plan-fixes executor packaged Class-2 surfaces (Storybook 10 Actions, Compodoc #1490) into the advisor consult prompt without pre-empting them via WebSearch/WebFetch. The advisor correctly produced unresolved hedges. But the absence of pre-emption was silent: the advisor saw no `<pre_verified>` blocks AND saw no explicit "no pre-emption performed" signal. Plan 07-02 hedge-marker discipline fires on hedges in source material but doesn't have a positive signal for "executor chose not to pre-empt this Class-2 surface". | Possible Phase 8: extend plan SKILL.md consultation packaging convention with a `## Verification Pre-empted` section listing each Class-2 surface and its pre-emption status (`pre-empted via WebFetch+pv-N` / `pre-emption skipped: <reason>`). The advisor weighs unresolved hedges differently when pre-emption was deliberately skipped vs when it was forgotten. Tied to P8-08 (reviewer verification destinations) - both are about making verification status explicit rather than implicit. |
| P8-11 | **`var` in `declare global` is a TypeScript constraint surfaced empirically by advisor** | Advisor SD item 1: *"`var` is required because `let`/`const` cannot augment `globalThis`."* This is a real TS language constraint correctly identified by the advisor without empirical verification (zero tool uses). The advisor applied built-in TypeScript knowledge to a code-design question. This is fine for language-spec questions (Class 4: language semantics) - the language spec doesn't drift like vendor docs do. **Not a gap; a positive empirical observation that advisor self-anchor is appropriate for Class-4 language-semantic questions even when Class 2/3 self-anchor is forbidden.** | Document in Plan 07-01 Rule 5b commentary: self-anchor pathway is forbidden for Class 2/3 (vendor API currency, configuration, migration) but acceptable for Class 4 (language semantics) where the underlying spec is stable. Could be noted as a refinement in references/orient-exploration.md. |

## Session 5 - lz-advisor.execute (execute-fixes)

**Invocation:** `/lz-advisor.execute Implement @plans/compodoc-storybook-setup.review.md`
**Session ID:** `29db446f-8e59-42f2-a721-722fb71239c8`
**Commits:** `06af4cf` (fix:), `f1c8ccd` (fix:)

**!! IMPORTANT INPUT MISMATCH !!** User invoked execute against `compodoc-storybook-setup.review.md` (the REVIEW file), NOT against `address-compodoc-storybook-review-findings.plan.md` (the plan-fixes PLAN file produced by session 4). **The plan-fixes plan output was never consumed by this session.** Execute-skill went directly from review findings -> implementation, bypassing the plan-fixes plan entirely. Two unresolved hedges that session 4 advisor surfaced (Storybook 10 Actions routing, find-up auto-discovery) lived only in the bypassed plan file - they never propagated into session 5's pre-execute consult.

**Tool-use summary:** 7 Read + 6 Edit + 1 git mv (rename) + 4 Bash (tsc, git check-ignore, git grep, git status/commit) + 2 Agent (advisor pre-execute + final). **Zero ToolSearch, zero WebSearch, zero WebFetch.** Pre-execute advisor: 0 tool_uses, 7.1s, 20.5K tokens. Final advisor: 0 tool_uses, 7.3s, 19.8K tokens.

### Phase 7 PASSES (with evidence)

| Plan | Finding | Evidence |
|------|---------|----------|
| 07-01 | **Trust contract correctly classified review file as agent-generated** | L18-L29 oriented from project files only, not from re-fetching upstream Storybook docs. Verify-first markers from review preserved verbatim into Source Material section of advisor consult prompt. |
| 07-02 (Reconciliation - empirical correction without advisor call) | **Executor reconciled TypeScript error empirically without silent revert** | L36 applied advisor's `declare global { var X: T; }` recommendation. L52 diagnostics surfaced TS errors. L70 executor reasoned: *"The `declare global { }` syntax is only valid in module files. Since `documentation.d.ts` is an ambient script, globals are declared at the top level. My addition broke the file's validity."* L71 corrected to `declare var __STORYBOOK_COMPODOC_JSON__: Record<string, unknown>;` at top level. **Class-4 language-semantic reconciliation handled correctly without retreating to silent revert OR triggering reconciliation advisor call. Trivial-fix exemption per Plan 07-02 reconciliation rule.** |
| 07-02 (Verify-before-commit Phase 3.5) | **Cheap sync validations executed pre-commit per cost-cliff allowance** | L97 ran `tsc --noEmit` (under 30s sync validation). L102 ran `git check-ignore` to verify documentation.json gitignore status. Both before staging. |
| 07-02 (E.1) | **Final advisor used canonical hedge frame** | Final advisor (L120) item 4: *"Assuming Compodoc runs before `build-storybook` via `dependsOn` (unverified), do confirm `documentation.json` exists at Storybook compile time. Verify the target wiring before acting."* Canonical literal frame fired on final advisor. |
| 07-02 (E.1) | **Executor empirically resolved final advisor's hedge before next commit** | L122-L130: executor ran `git grep -n "compodoc\|dependsOn"` (L126), got result confirming `compodoc: true` in both storybook + build-storybook targets, concluded at L130: *"Verified: `compodoc: true` in both targets means `@storybook/angular` runs Compodoc internally before the TypeScript compilation -- no `dependsOn` gap."* **Hedge resolution before applying next changes - exactly the discipline Plan 07-02 was designed to enforce.** |
| 07-02 (Verified: trailer format SECOND COMMIT) | **Second commit `f1c8ccd` has TWO formal `Verified:` trailers per spec format** | Commit body: *"Verified: compodoc: true in both storybook and build-storybook targets confirms Compodoc runs before storybook compilation -- no dependsOn gap. Verified: tsc -p .storybook/tsconfig.json --noEmit exits clean after changes."* Each on its own line, after body paragraphs, naming the verified claim. **First fully-conformant `Verified:` trailer in any UAT commit so far.** |
| 07-03 | **Verdict scope marker rendered in completion summary** | L929: `**Verdict scope:** scope: api-correctness`. |
| 07-04 (final advisor word budget) | **Final advisor word count BARELY under 100w cap** | 5 numbered items ≈ 95 words. **First sub-100w advisor output across all 5 sessions** (sessions 1-4: 133/135/115/150). Marginal but real improvement. |
| 07-04 (advisor turn budget) | **Both advisor calls used 0 tool_uses** | Synthesized from packaged context. Cost discipline. |
| CLAUDE.md (`git mv` for renames) | **Used `git mv` not separate delete + create** | L136: `git mv packages/.../documentation.d.ts packages/.../global.d.ts` per global CLAUDE.md instructions. |
| CLAUDE.md (no `git add .`) | **Specific files staged by name** | L113: `git add packages/.../documentation.d.ts ... project.json` (5 files explicitly listed). |

### Phase 7 GAPS (with evidence)

| Plan | Finding | Evidence | Severity |
|------|---------|----------|----------|
| 07-03 (Cross-Skill Hedge Tracking) | **Plan-fixes hedges silently lost when execute received review file instead of plan file** | Session 4 (plan-fixes) advisor produced 2 unresolved hedges (Storybook 10 Actions routing, find-up auto-discovery). Plan-fixes plan output preserved them. **User invoked session 5 against `compodoc-storybook-setup.review.md` (review file) not against the plan-fixes plan output `address-compodoc-storybook-review-findings.plan.md`.** Plan-fixes plan never read; both hedges lost in transit. Pre-execute advisor in session 5 produced ZERO hedges - because the input (review file) had only the original review hedges, not the plan-fixes plan's elaborated hedges. **Plan 07-03 Cross-Skill Hedge Tracking was designed to prevent this kind of loss; it didn't fire because the plan file wasn't in the input.** Partial user-error (wrong file path), but Plan 07-03 also has no mechanism to detect "plan-fixes plan exists for this review, did you mean to consume that?" | major |
| 07-02 (wip-discipline scope ambiguity REPEAT) | **First commit `06af4cf` has `## Outstanding Verification` section but `fix(storybook):` subject prefix (NOT wip:)** | Per Plan 07-02 cost-cliff allowance: *"Long-running async validations move to a `wip:` prefixed commit + `## Outstanding Verification` section in the commit body listing the pending checks."* Commit `06af4cf` has a populated `## Outstanding Verification` section listing `npm exec nx build-storybook ngx-smart-components` as pending. But the subject is `fix(storybook):`, not `wip:`. **Same gap as session 2 commit 8c25c9e (the per-commit vs branch-state ambiguity in wip-discipline). Now the SECOND empirical instance of this exact gap.** Either the executor's per-commit reading is the intended interpretation (and the SKILL.md text needs clarifying), OR the strict-text reading is correct (and the discipline isn't being followed). | major (recurring) |
| 07-02 (Verified: format - first commit) | **First commit `06af4cf` has prose body but no formal `Verified: <claim>` trailers** | Commit body: *"Note: TS2307 (Cannot find module '../documentation.json') is pre-existing; the file is generated by Compodoc at build time and gitignored."* This is verification-related prose but NOT in the `Verified: <claim>` trailer format that Plan 07-02 specifies. Same gap as session 2 commit 8c25c9e. **However: second commit `f1c8ccd` DOES use the format correctly (TWO conformant `Verified:` trailers).** Inconsistent within a session. | minor |
| 07-01 (ToolSearch precondition) | **ToolSearch precondition NOT invoked despite agent-generated input with Class-2 surfaces** | Same gap as session 4 plan-fixes. Pre-execute consult input was the agent-generated review file. Question included Class-2 surfaces (Storybook 10 Actions routing, Compodoc bug status, find-up auto-discovery). Executor proceeded directly from Phase 1 reads to advisor consultation. **Zero web tool uses in entire session.** Strict reading of Plan 07-01 ToolSearch availability rule = precondition violation. **Now the THIRD UAT session in a row with this gap (sessions 2 execute, 4 plan-fixes, 5 execute-fixes).** | major (recurring across 3 sessions) |
| 07-04 (pre-execute word budget) | **Pre-execute advisor word count over cap** | 6 numbered items ≈ 115 words / 100w cap (15% over). Improvement over earlier sessions but not closed. | minor |

### Phase 8 Candidates (new findings unrelated to Phase 7 goals)

| ID | Finding | Evidence | Hypothesis |
|----|---------|----------|------------|
| P8-12 | **Execute-skill should detect "user pointed me at review file but plan-fixes plan exists, did you mean that?"** | User invocation pattern: review file -> plan-fixes plan -> execute-fixes. Session 5 received review file (skipping the plan-fixes plan in between). The execute-skill could heuristically scan `plans/` for `*review-findings*.plan.md` or `address-*-review-findings*.plan.md` matching the input review path AND surface a clarification: *"You passed `compodoc-storybook-setup.review.md`, but `address-compodoc-storybook-review-findings.plan.md` exists in plans/. The plan-fixes plan supersedes the review file as input to execute-fixes. Read both?"* This is similar to P8-04 (advisor concern disposition tracking) - both are about making cross-skill state explicit instead of implicit. | Possible Phase 8: extend Plan 07-01 trust-contract section with a "plan-fixes plan detection" heuristic. When user passes a review file via @ mention, scan `plans/` for plan-fixes plan files referencing the same source review and surface the relationship. Don't auto-merge - just surface for user to confirm. |
| P8-13 | **Plan 07-02 cost-cliff allowance language ambiguity needs clarification** | Now THE 2ND empirical instance of `## Outstanding Verification` shipping in a non-wip commit (session 2 commit 8c25c9e + session 5 commit 06af4cf). The plain-text reading of Plan 07-02 says wip + Outstanding Verification go together; the executor's interpretation is "this commit's own claims are verified, so non-wip is fine even if some other concern is pending". The disambiguation matters because E-verify-before-commit.sh smoke fixture's path-c assertion (wip: + Outstanding Verification) won't fire when executor uses non-wip + Outstanding Verification. | Possible Phase 8: tighten Plan 07-02 SKILL.md text to: *"When a commit body contains `## Outstanding Verification` section listing pending Run: directives, the commit subject MUST use `wip:` prefix UNLESS the commit ONLY records additional `Verified: <claim>` trailers for already-listed Outstanding items."* Also update E-verify-before-commit.sh path-c to require this conjunction. |
| P8-14 | **Class-4 language-semantic reconciliation worked correctly without advisor call - positive observation** | Session 5 L70: executor encountered TS error, reasoned *"declare global { } only works in module files; documentation.d.ts is an ambient script"*, applied corrected `declare var X: T;` at top level. Plan 07-02 reconciliation rule allows: *"trivial fixes: typos, import paths, obvious refactors -- proceed solo"*. The TS-syntax constraint correction fits this exemption naturally. **Not a gap; positive evidence that the rule's exemption list is well-calibrated.** Tied to P8-11 (Class-4 self-anchor is appropriate for advisor too). | Document in Plan 07-02 commentary: explicitly note "language-semantic corrections" as a category covered by the trivial-fixes exemption. Reduces ambiguity about when reconciliation calls are required vs not. |

## Session 6 - lz-advisor.security-review

**Invocation:** `/lz-advisor.security-review eb9107f829d4cf0bd45aaab9b81a134acc65a26d, 8c25c9e3f013f24c7492936da0a19d626d53442b, 06af4cf825d18de5f95fd05ba3bc681be5681544, and f1c8ccd295c1a7706c46a68c6098f322035bd807`
**Session ID:** `2b5f3ae5-1827-4122-8add-16482fc2d8cc`

**Tool-use summary:** ~10 Bash (git log + git diff for scope + 7 npm audit invocations + parsing) + ~5 Read (changed files + sibling .storybook files) + 1 Agent (security-reviewer). **Zero ToolSearch, zero WebSearch, zero WebFetch.** Reviewer used 0 tool_uses, 22.5s, 21.6K tokens.

### Phase 7 PASSES (with evidence)

| Plan | Finding | Evidence |
|------|---------|----------|
| 07-05 (Option 1 closure for Finding F) | **Pre-emptive Class 2-S scan via npm audit fired before consultation - SUCCESS** | L29-L42: 7+ npm audit invocations + parsing (`compodocRelated`, `highCritical` counts, severity tallies). Executor explicitly pre-empted the supply-chain Class 2-S surface for `@compodoc/compodoc@1.2.1`. Result: pv-no-known-cves-compodoc anchor with `<evidence method="Bash">` shipped in consultation prompt. Reviewer received pv-* anchor and accepted it ("No current CVEs against compodoc@1.2.1 (pre-verified)" in Finding 2). **First empirical instance of Plan 07-05 Option 1 firing for the security-review skill (session 3 was the first for review skill).** |
| 07-05 (Option 2 NOT triggered - correct outcome) | **Reviewer emitted ZERO `<verify_request>` blocks** | Pre-empted answer was sufficient; no Class 2-S surfaces escalated past pre-emption. Plan 07-05 Option 1 + Option 2 working in tandem - Option 2 is the long-tail safety net, Option 1 handled this case. |
| 07-01 (Rule 5b pv-* synthesis) | **2 source-grounded pv-* blocks with non-empty evidence** | pv-compodoc-version: `source="package.json"`, `<evidence method="Read">` excerpt. pv-no-known-cves-compodoc: `source="npm audit output"`, `<evidence method="Bash">` excerpt with severity counts and verdaccio chain identification. Both conform to Plan 07-01 Rule 5b structural mandate. |
| 07-03 (verdict scope) | **`Verdict scope: scope: security-threats` correctly emitted (NOT api-correctness)** | L930: `**Verdict scope:** scope: security-threats`. **Different scope token than sessions 1/2/3/4/5 (all used `api-correctness`).** Plan 07-03 scope-disambiguated provenance markers empirically distinguishing axes. Downstream consumers (e.g., `gsd-secure-phase` audit) can scope-check this output for security claims. |
| 07-04 (reviewer structural sub-caps) | **All per-section caps satisfied** | F1≈70w, F2≈70w, F3≈50w, F4≈50w (all ≤80w cap). Threat Patterns ≈140w (≤160w cap). Missed surfaces ≈25w (≤30w cap). **All structural sub-caps PASS.** |
| 07-02 (Trust contract narrative-isolation) | **Scope mechanically derived from `git diff` of commit range** | L18 git log + L22 git diff --name-only + L24 full diff for code files only. No plan/review file consumed; review derived scope independently from git history. |
| 07-02 (Reviewer independent triage) | **Reviewer revised executor severities DOWN (3 of 4)** | F1: Medium → Low ("attacker already has build-pipeline control, so this global write is a downstream symptom, not the root vector"). F2: Medium → Low ("lockfile pins resolution, so risk only materializes on lockfile regeneration"). F4: Low → Informational ("canonical Storybook+Compodoc pattern"). F3: Low confirmed. **Independent triage in OPPOSITE direction from session 3 (which raised severity). Both directions show real review judgment, not rubber-stamping.** |
| Class 2-S sub-pattern | **Step 1 of `npm audit -> GHSA -> WebSearch CVE` chain executed** | npm audit produced "30 vulnerabilities (26 moderate, 4 high)" with high severity isolated to verdaccio transitive (lodash, minimatch). Compodoc-related count = 0. Executor identified this is pre-existing condition outside review scope. Sufficient for the pv-no-known-cves synthesis here, though steps 2 + 3 weren't run (see GAPS). |

### Phase 7 GAPS (with evidence)

| Plan | Finding | Evidence | Severity |
|------|---------|----------|----------|
| 07-01 (ToolSearch precondition) | **ToolSearch precondition NOT invoked - 4th UAT session in row** | Sessions 2 execute, 4 plan-fixes, 5 execute-fixes, 6 security-review all skipped ToolSearch. Security-review specifically: WebSearch + WebFetch are in command_permissions.allowedTools (L186) so direct invocation was possible without ToolSearch. **Strict reading of Plan 07-01 ToolSearch availability rule = precondition violation, 4 sessions running.** Possibly the rule's text is being interpreted as "synthesize new pv-* blocks → ToolSearch fires" rather than the actual literal "Class 2/3/4 question on agent-generated input → ToolSearch precondition fires". The literal reading isn't holding empirically. | major (recurring across 4 sessions) |
| 06-06 / 07-05 (Class 2-S sub-pattern only step 1 executed) | **Class 2-S 3-step pattern (npm audit → GHSA → WebSearch CVE) only ran step 1** | Plan 06-06 Class 2-S sub-pattern in `references/orient-exploration.md` specifies the 3-step chain. Executor ran 7+ npm audit invocations (over-investing in step 1 with parsing variations) but did NOT proceed to step 2 (`WebFetch https://github.com/advisories?query=@compodoc/compodoc`) or step 3 (WebSearch on recent advisories). For compodoc@1.2.1 specifically, npm audit was sufficient (no CVEs), so this short-circuit was outcome-correct. But the design intent of the 3-step chain is to defend against npm-audit lag (audit can be hours-to-days behind GHSA). | minor (outcome-correct, design-intent partial) |
| 07-04 (reviewer aggregate word budget) | **Reviewer aggregate output ≈410w / 300w cap (37% over)** | Per-section caps satisfied (F1+F2+F3+F4 ≈240w + Threat Patterns ≈140w + Missed surfaces ≈25w + headers ≈ 410w aggregate). Same class as session 3 review (~430-470w). Same persistent regression pattern across all sessions: per-section sub-caps work, aggregate cap doesn't translate. | minor (recurring) |

### Phase 8 Candidates (new findings unrelated to Phase 7 goals)

| ID | Finding | Evidence | Hypothesis |
|----|---------|----------|------------|
| P8-15 | **Class 2-S step 1 (npm audit) sufficient for pv-no-known-cves synthesis when audit returns 0 vulns - design-tradeoff observation** | When `npm audit` returns 0 CVE matches for a package, steps 2-3 (GHSA + WebSearch CVE) are insurance against npm-audit lag (hours-to-days behind GHSA + advisory database). For non-time-sensitive reviews, step 1 alone is high-confidence. For time-sensitive (recent zero-day windows), the 3-step chain matters. The current Plan 06-06 SKILL.md text doesn't distinguish these cases. | Possible Phase 8: refine Plan 06-06 Class 2-S text in `references/orient-exploration.md` to distinguish *"pv-no-known-cves baseline (audit 0 = sufficient for non-recent packages)"* from *"pv-no-known-cves recent-version-anchored (recent release within npm-audit lag window → 3-step chain required)"*. Use installed-version-vs-release-date heuristic to pick which path applies. |
| P8-16 | **Reviewer pushed severities DOWN with empirical reasoning - bidirectional triage confirmed** | Session 3 reviewer raised F3 from Suggestion → Important. Session 6 reviewer revised F1 (Medium→Low), F2 (Medium→Low), F4 (Low→Informational). Different directions, different sessions, both grounded in scope-aware reasoning ("dev tooling only, no production exposure"; "lockfile pins resolution"; "canonical pattern"). **Positive observation: reviewer's independent triage discipline operates bidirectionally, not just up-only.** | Document in Plan 07-04 commentary or reviewer agent description: confirm via empirical examples that reviewer can lower severities, not just raise them. Currently the reviewer agent's description suggests severity changes (no directional bias asserted) - empirically validated. |
| P8-17 | **Threat-model context block in pre-consult prompt was load-bearing for severity calibration** | Executor's pre-consultation prompt included an explicit `## Threat Model Context` block: "Assets protected: Developer machine environment, CI/CD build pipeline, generated documentation fidelity. Threat actors: ... Blast radius: Limited to dev/build environment. No production exposure." The reviewer's severity revisions explicitly invoked this scope: "Storybook is not shipped to production"; "attacker already has build-pipeline control". **The threat-model section is what enabled the bidirectional triage in P8-16.** Currently the security-review SKILL.md / context-packaging.md doesn't formally specify threat-model context as a required prompt section - it was the executor's improvisation. | Possible Phase 8: codify threat-model context as a recommended pre-consult prompt section in `references/context-packaging.md` for security-review. Specify: assets, threat actors, blast radius, production boundary. Without these, severity calibration drifts toward worst-case framing. |

## Session 7 - lz-advisor.plan (plan-fixes-2 against security findings)

**Invocation:** `/lz-advisor.plan Plan fixes for the security findings below. --- <security-review output>`
**Session ID:** `bfa913fa-85a3-4454-8f19-46d62040b461`
**Plan output:** `plans/address-security-review-findings.plan.md`

**Tool-use summary:** 3 Read (preview.ts, project.json, package.json) + 1 Agent (advisor) + 1 Write. **Zero ToolSearch, zero WebSearch, zero WebFetch.** Advisor: 0 tool_uses.

### Phase 7 PASSES (with evidence)

| Plan | Finding | Evidence |
|------|---------|----------|
| 07-02 (silent-resolve) | **SECOND empirical closure of silent-resolve sub-pattern - all 4 findings dispositioned** | Plan output Findings Disposition section: F1 accepted (Compodoc inline executor satisfies the atomic mitigation), F2 addressed (Step 1 exact-pin), F3 accepted (canonical Storybook contract), F4 accepted (canonical pattern). **Zero silent drops.** Mix of dispositions (3 accepted, 1 addressed) shows the executor reasoned about each finding individually, not just batch-applying. |
| 07-03 (verdict scope CROSS-AXIS INHERITANCE) | **Plan output inherited `scope: security-threats` from input file (NOT defaulted to api-correctness)** | Plan line 59: `**Verdict scope:** scope: security-threats`. Plan template defaults to `api-correctness` but the executor recognized this is a security-threats input (from session 6 security-review file) and inherited the axis correctly. **First empirical instance of cross-axis verdict scope inheritance.** Plan body line 61 explicitly explains: *"It does NOT introduce new API integration patterns or framework-convention changes (no api-correctness scope)"* - the executor reasoned about which axis applies and explained the choice. |
| 07-02 (Trust contract) | **Security-review file correctly classified as agent-generated source** | Trust contract carve-out fired - executor proceeded directly from project file reads to advisor consultation without re-fetching upstream Storybook docs. Severity / OWASP tags / verdicts from review preserved verbatim into Source Material section. |
| 07-02 (atomic commit pattern) | **Step 3 specifies single atomic commit for package.json + package-lock.json together** | Plan output Step 3: *"Single commit containing both files so the lockfile is always in sync with the manifest. Committing both atomically prevents CI from picking up a manifest/lockfile mismatch during the window between separate commits."* Best-practice supply-chain hardening pattern correctly identified. |
| 07-04 (advisor turn budget) | **Advisor used 0 tool_uses** | Synthesized from packaged context only. |

### Phase 7 GAPS (with evidence)

| Plan | Finding | Evidence | Severity |
|------|---------|----------|----------|
| 07-01 (ToolSearch precondition - 5th session) | **ToolSearch precondition NOT invoked - 5th UAT session in row** | Session 7 input is agent-generated security-review file with Class-2 surfaces (`compodoc: true` executor architecture / writable-window question, `@compodoc/compodoc` exact-pin tradeoff vs lockfile). Executor went directly from Phase 1 reads to advisor consult. **ToolSearch precondition violation 5 of 7 sessions running** (sessions 1, 3 fired it; sessions 2, 4, 5, 6, 7 skipped). At this rate, the rule's literal text isn't operative empirically. | major (recurring across 5 sessions) |
| 07-01 / 07-03 (advisor self-anchor on Class-2 architectural claim) | **Advisor SD makes load-bearing empirical claim WITHOUT source grounding** | Advisor SD item 1: *"F1 is already mitigated by the inline `compodoc: true` executor -- emit and bundle run in one Nx process with no writable window."* The "no writable window" claim is the load-bearing assertion that F1's `accepted` disposition rests on. Session 6 security-reviewer's F1 description was: *"Exploitation requires CI/CD write access between Compodoc emit and Storybook bundle"* - a window IS implied. Inspecting the `runCompodoc` source from session 6 (`chunk-T5YQQKXO.js`): `runCompodoc` calls `packageManager.runPackageCommand({args: finalCompodocArgs, cwd: context.workspaceRoot})` - this spawns a SUBPROCESS for compodoc, then control returns to the parent Nx process which spawns the storybook build subprocess. **There IS a brief subprocess-boundary window**, even if it's not the "writable window" the reviewer's threat model meant. The advisor's claim is technically imprecise but practically correct (the Nx-target wrapper IS the atomic boundary). **However: the advisor stated this as fact without empirical grounding via pv-* anchor or WebFetch on Storybook executor docs.** Plan 07-01 Rule 5b applies to `<pre_verified>` blocks; the advisor's narrative claims are not pv-* shaped. The self-anchor pattern (Finding H) leaks through Strategic Direction prose. | major (P8-03 candidate, second empirical instance) |
| 07-03 / P8-03 (NEW: Pre-Verified Contradiction Rule) | **Advisor reframed reviewer's recommendation as "already satisfied" without explicit reframing acknowledgment** | Reviewer recommendation (session 6): "Mitigation: pin Compodoc output path, run docs generation and Storybook build as one atomic Nx target." Advisor in session 7: "The review's mitigation ('run docs generation and Storybook build as one atomic Nx target') is already satisfied." **The advisor reframed the reviewer's recommendation as already-implemented without explicitly flagging the reframing.** Per P8-03 candidate (Pre-Verified Contradiction Rule), the advisor SHOULD have flagged: *"Reframing: reviewer recommended atomic Nx target as a future change; observed: `compodoc: true` inline executor IS the atomic target. Verifying this equivalence requires reading runCompodoc source."* Instead the equivalence was asserted as fact. **Second empirical instance of P8-03 needed (first was session 2 advisor saying "Storybook writes to project root, not workspace root").** | major (P8-03 second instance) |
| 07-04 (advisor word budget) | **Advisor SD ≈115w / 100w cap (15% over)** | 4 numbered items. Down from session 4's 150w on similar finding-disposition task; per-item compactness is improving but aggregate still over. | minor |

### Phase 8 Candidates (new findings unrelated to Phase 7 goals)

| ID | Finding | Evidence | Hypothesis |
|----|---------|----------|------------|
| P8-18 | **F1 disposition (`accepted`) rests on un-empirical "no writable window" claim - empirical follow-up worth doing** | Plan F1 disposition rationale: *"Compodoc already runs inline via the `compodoc: true` executor option, which means emit and Storybook bundle run in one Nx process with no writable window between them."* Session 6 security-reviewer's `runCompodoc` source reading (`chunk-T5YQQKXO.js`) shows: parent Nx process → subprocess for compodoc → return to parent → subprocess for storybook build. There IS a subprocess-boundary window. Whether it's exploitable depends on filesystem-write-access concurrency assumptions that neither the reviewer nor the advisor actually verified. **The disposition outcome is likely correct (defense-in-depth at CI/CD boundary makes this Low-severity), but the rationale is empirically thin.** | Possible Phase 8 verification: read `runCompodoc` source (session 6 already did this in pv-T5YQQKXO) + read Nx executor lifecycle docs to determine if `compodoc: true` runs in-process or subprocess. If subprocess, F1 should arguably be `addressed` (with explicit synchronization) not `accepted`. Tied to P8-03 - both are about advisor narrative claims that would benefit from pv-* anchoring. |
| P8-19 (POSITIVE) | **Cross-axis verdict scope inheritance worked correctly without explicit SKILL.md guidance** | Plan SKILL.md template defaults to `api-correctness` for the verdict scope. Session 7 input was a security-threats axis file (security-review). Plan output inherited `security-threats` correctly and explicitly explained the inheritance: *"It does NOT introduce new API integration patterns or framework-convention changes (no api-correctness scope)."* **The scope-disambiguated provenance markers system handled cross-axis input gracefully without requiring explicit cross-axis logic in plan SKILL.md.** | Document in Plan 07-03 commentary in `references/context-packaging.md`: cross-axis input → output scope-inheritance is the empirically observed default. Could be made explicit: *"When a plan addresses findings from a security-review or other non-api-correctness scope input, the plan output's verdict scope inherits the input axis."* Empirically validated. |

## Session 8 - lz-advisor.execute (execute-fixes-2 against security plan)

**Invocation:** `/lz-advisor.execute Implement @plans/address-security-review-findings.plan.md`
**Session ID:** `b614d3dd-8b31-4825-b80e-a412fb6f7477`
**Commit:** `15d8fac` (single atomic commit)

**Tool-use summary:** 2 Read (plan + package.json) + 1 Edit + 5 Bash (npm install, git status, git commit, npm ls, node lockfile-verify) + 1 Agent (final advisor only - Phase 2 pre-execute SKIPPED). **Zero ToolSearch, zero WebSearch, zero WebFetch.** Final advisor: 0 tool_uses, 8.9s, 19K tokens.

### Phase 7 PASSES (with evidence)

| Plan | Finding | Evidence |
|------|---------|----------|
| 07-02 (Verified: trailer FORMAT - third instance) | **First commit `15d8fac` has formal `Verified: <claim>` trailer per spec** | Commit body line: *"Verified: package.json devDependencies \"@compodoc/compodoc\" changed from \"^1.2.1\" to \"1.2.1\""*. On its own line, after body paragraphs, naming the verified claim. **First fully-conformant Verified: trailer in a SINGLE-COMMIT session (sessions 2 and 5 had non-conformant first commits with conformant follow-up commits; session 8 got it right on the first commit).** |
| 07-02 (atomic commit pattern - package.json + package-lock.json) | **Plan's 3-step atomic-commit pattern executed correctly** | L39 single `git add package.json package-lock.json && git commit ...` invocation. Both files in commit `15d8fac`: 2 files changed, 1937 insertions, 1 deletion. **No CI window between manifest and lockfile.** Plan's Step 3 best-practice ("Single commit containing both files...") empirically followed. |
| 07-02 (E.1) | **Final advisor used canonical hedge frame** | Final advisor item 2: *"Assuming CI runs `npm ci` rather than `npm install` (unverified), do confirm the lockfile is the sole source of truth in CI. Verify CI install command before acting."* + Critical block: *"Exact-pinning without integrity verification is half the mitigation. Confirm the lockfile entry carries an `integrity` field..."* |
| 07-02 (E.1) | **Executor empirically verified ALL advisor checks** | Item 1 (lockfile root specifier + integrity field): L50 ran custom `node -e` script to query package-lock.json - returned `version: 1.2.1, integrity: sha512-won7I0..., root specifier: 1.2.1`. Item 4 (single deduped instance): L48 ran `npm ls @compodoc/compodoc` - returned single tree entry. Item 2 (CI install command): reasoned through ("no CI config customizes install step"). Item 3 (Renovate/Dependabot): correctly scoped as out-of-scope ("outside the scope of the current security-review remediation plan"). **All 4 items + Critical block addressed empirically; no silent acceptance.** |
| 07-03 (verdict scope CROSS-AXIS INHERITANCE - second instance) | **Execute output inherited `scope: security-threats` from plan input** | L497: `**Verdict scope:** scope: security-threats`. Same pattern as session 7. **Two skills (plan + execute) now confirmed to inherit security-threats scope cross-axis. Pattern is robust.** |
| CLAUDE.md (specific files staged) | **`git add package.json package-lock.json`** | L39: explicit file names, no `git add .`. |
| 07-04 (final advisor word budget) | **Final advisor under cap** | 4 numbered items ≈85w + Critical block ≈30w = ≈115w; per Plan 07-04 the Critical block is budget-excluded, so net ≈85w / 100w cap. Within cap. |
| 07-04 (advisor turn budget) | **Final advisor used 0 tool_uses** | Synthesized from packaged context. |

### Phase 7 GAPS (with evidence)

| Plan | Finding | Evidence | Severity |
|------|---------|----------|----------|
| 07-01 (ToolSearch precondition - 6th session) | **ToolSearch precondition NOT invoked - 6th UAT session in row** | Sessions 2, 4, 5, 6, 7, 8 all skipped. Sessions 1 + 3 fired it. **At 6 sessions running, the rule is not empirically operative when input is agent-generated source material with Class-2 surfaces.** | major (recurring across 6 sessions; needs rule rephrasing or default-on conversion) |
| 07-02 (workflow phase skip - Phase 2 pre-execute) | **Pre-execute advisor consultation SKIPPED** | L24: *"The plan already contains advisor strategic direction, so I'll proceed directly to execution."* Execute SKILL.md Phase 2 reads: *"Before starting substantive work, invoke the lz-advisor:advisor agent via the Agent tool."* Executor judgment overrode the SKILL.md spec on the rationale that the input plan already contains fresh advisor SD. **For this specific task (single-line dependency pin) the skip is empirically reasonable - re-consulting on a trivial deterministic edit adds little. But for more complex execute-fixes work, this skip could elide a load-bearing safety net.** SKILL.md is currently unambiguous (Phase 2 is required); the executor's skip is an unsanctioned optimization. | minor (judgment call; either codify the optimization or tighten the SKILL.md text) |
| 07-02 (Phase 3.5 verify-before-commit) | **No explicit cheap-sync verification before commit** | Plan 07-02 Phase 3.5 mentions: *"Cheap synchronous validations execute pre-commit: npm ls, npm install, git grep, git check-ignore, git status, lint, tsc --noEmit..."*. Session 8 ran `npm install` (which IS one of the cheap sync validations) but did NOT run lint/tsc. **However: the changes are package.json + package-lock.json (no TS source code). lint/tsc don't apply.** `npm install` succeeded (regenerated lockfile cleanly), which is the relevant cheap validation here. **Not really a gap; Phase 3.5 is correctly scoped to applicable validations.** | informational |

### Phase 8 Candidates (new findings unrelated to Phase 7 goals)

| ID | Finding | Evidence | Hypothesis |
|----|---------|----------|------------|
| P8-20 | **Execute SKILL.md Phase 2 pre-execute consult skip when input is a fresh plan with embedded advisor SD - codify or tighten?** | Session 8 skipped Phase 2 with explicit rationale: *"The plan already contains advisor strategic direction."* SKILL.md text says Phase 2 is mandatory. **Two interpretive options:** (a) codify the optimization in SKILL.md: *"When the input is a freshly-produced plan-fixes plan whose Strategic Direction matches the work scope unchanged, Phase 2 may be omitted; otherwise Phase 2 is required."* (b) tighten SKILL.md to require Phase 2 unconditionally and treat session 8's skip as a workflow violation. **Option (a) seems more defensible empirically - the skip was right for this specific task. But option (b) would catch cases where the executor SHOULD re-consult (e.g., plan was produced days ago, code changed since).** | Possible Phase 8: refine execute SKILL.md Phase 2 with a "Phase 2 may be omitted when..." clause, OR add a "If input is a fresh plan-fixes plan from current session, the Phase 2 consult is the plan's existing SD" inheritance pattern. Tied to P8-19 (cross-axis scope inheritance) - both are about cross-skill state inheritance. |
| P8-21 (POSITIVE) | **Cross-axis verdict scope inheritance now confirmed across TWO skills (plan + execute)** | Session 7 plan output: `scope: security-threats`. Session 8 execute output: `scope: security-threats`. **The cross-axis inheritance pattern is robust across the plan-fixes -> execute-fixes pipeline when the input file is a security-review.** | Strengthens P8-19. Document in Plan 07-03 commentary as confirmed empirical pattern across two skills, not just one. |
| P8-22 (POSITIVE) | **Final advisor's Critical block was load-bearing and caught a real verification gap** | Session 7 plan didn't mention package-lock.json integrity verification. Session 8 final advisor's Critical block: *"Exact-pinning without integrity verification is half the mitigation. Confirm the lockfile entry carries an `integrity` field..."*. Executor empirically verified the integrity field via custom `node -e` lockfile query (L50). **First case where final advisor's Critical block surfaced a verification step the plan didn't include AND the executor empirically resolved it before completion.** | Document in Plan 07-02 reconciliation commentary: example of final advisor catching plan gaps. Same shape as session 5's `Assuming dependsOn` hedge resolution but Critical-flagged. Could be cited as evidence that final advisor consultation is load-bearing even on small tasks. |

**Verdict: PASS-with-residual** — full 8-session UAT chain complete. Plan-fixes-2 + execute-fixes-2 cycle confirmed Phase 7 closure on both api-correctness and security-threats axes.

### Empirical wins (capture in `06-VERIFICATION.md` amendment 6)

1. **GAP-G1+G2-empirical CLOSED at synthesis layer** — Plan 07-01 ToolSearch precondition empirically fired in session 1 (plan) AND session 3 (review). Both sessions produced ToolSearch invocation BEFORE first WebSearch/WebFetch. Plan 07-01's ToolSearch supplement is byte-identical across all 4 SKILL.md.
2. **Confidence-laundering chain BROKEN across api-correctness AND security-threats axes** — pv-* synthesis with source-grounded evidence in sessions 1, 3, 6. Verdict scope markers in all 8 sessions (5 api-correctness + 3 security-threats including cross-axis inheritance in sessions 7+8). Version anchoring (pv-compodoc-version, @storybook/angular@10.3.5) preserved across full cross-skill chain.
3. **Plan 07-02 verify-before-commit discipline empirically firing across 3 sessions** — Session 2 produced first wip+Outstanding Verification+Verified: trailers commit. Session 5 produced first FULLY-conformant Verified: trailers (commit `f1c8ccd`). Session 8 produced first conformant Verified: trailer in a single-commit session (commit `15d8fac`).
4. **Plan 07-02 Hedge Marker Discipline empirically working end-to-end across 5 sessions** — Sessions 2, 3, 4, 5, 7, 8 all produced canonical `Assuming X (unverified), do Y. Verify X before acting.` and/or `Unresolved hedge:` frames. Sessions 5 and 8 demonstrated executor empirically resolving advisor's hedge before next commit.
5. **Plan 07-02 Silent-resolve sub-pattern empirically CLOSED across BOTH plan-fixes UATs** — Session 4 (review-driven plan-fixes): all 5 findings dispositioned (3 addressed, 1 deferred, 1 rejected). Session 7 (security-driven plan-fixes-2): all 4 findings dispositioned (1 addressed, 3 accepted). **Two empirical closures across two different plan-fixes scenarios.**
6. **Plan 07-05 Option 1 + Option 2 working in tandem (CLOSED on both review + security-review)** — Session 3 + Session 6 both pre-empted Class-2/2-S surfaces in Phase 1, reviewer received pv-* anchors, no `<verify_request>` escalation needed.
7. **Plan 07-03 Scope-disambiguated provenance markers AND cross-axis inheritance** — 5 api-correctness scope tokens (sessions 1-5) + 3 security-threats scope tokens (sessions 6, 7, 8). Sessions 7 + 8 confirmed cross-axis inheritance: when input is security-threats axis (session 6 review file), downstream plan + execute outputs inherit `scope: security-threats` correctly. **Pattern is robust across 2 skills (plan + execute) on the security-threats axis.**
8. **Final advisor Critical block empirically catching plan gaps** — Session 5 + Session 8 both demonstrated final advisor Critical blocks surfacing verification steps the plan didn't include, AND executor empirically resolving them before completion (Session 5: `dependsOn` wiring; Session 8: package-lock.json integrity field).

### Residuals (capture in amendment 6 with severity)

1. **MAJOR (recurring across 6 sessions): Plan 07-01 ToolSearch precondition NOT invoked** in 6 of 8 sessions (sessions 2, 4, 5, 6, 7, 8). Sessions 1 and 3 fired it correctly. The strict-text reading of the rule isn't holding empirically — the rule needs rephrasing OR conversion from precondition to default-on behavior. Possible fix: move `ToolSearch select:WebSearch,WebFetch` invocation to a default Phase 1 action whenever any agent-generated source material is detected, regardless of question class.
2. **MAJOR (recurring): Plan 07-02 wip-discipline scope ambiguity** — Sessions 2 + 5 both shipped non-wip commits with populated `## Outstanding Verification` sections. Session 8 got it right (no Outstanding Verification, no wip prefix). Plan 07-02 SKILL.md text is ambiguous between per-commit and branch-state interpretation. Tighten language per P8-13.
3. **MAJOR: Plan 07-03 Cross-Skill Hedge Tracking gap when execute-fixes received review file instead of plan-fixes plan** (session 5 input mismatch). Two unresolved hedges from session 4 plan-fixes were lost in transit. P8-12 hypothesizes execute-skill auto-detection for plan-fixes plans.
4. **MAJOR: Plan 07-02 Reconciliation rule NOT invoked** in 2 instances: Session 2 (advisor contradicted plan's pv-2 on documentation.json path) AND Session 7 (advisor reframed reviewer's recommendation as "already satisfied"). Both are P8-03 pattern instances — confidence-laundering by reframing. **P8-03 is the strongest Phase 8 candidate.**
5. **MAJOR: Self-anchor pattern (Finding H) leaks through advisor narrative SD prose** — Plan 07-01 Rule 5b applies to `<pre_verified>` XML blocks; advisor's narrative claims (Strategic Direction text) aren't pv-* shaped and bypass the synthesis precondition. Session 7 instance: "no writable window" claim about Storybook executor architecture asserted without source grounding. Tied to P8-18.
6. **MINOR (recurring): Plan 07-04 word-budget overrun on code-dense outputs** — Aggregate caps exceeded in sessions 1, 3, 4, 6, 7. Per-section sub-caps mostly hold; aggregate doesn't translate. Sessions 5 and 8 final advisor outputs landed under cap (improvement trajectory).
7. **MINOR: Plan 07-02 Verified: trailer format inconsistency in some early commits** — Session 2 + session 5 first commits had verification prose but no formal `Verified:` trailers. Sessions 5 (second commit), 7, 8 used the format correctly. Improving across sessions.
8. **MINOR: Plan 06-06 Class 2-S sub-pattern only step 1 executed** in session 6. Outcome-correct (no CVEs), design-intent partial (3-step chain not exercised). P8-15 candidate proposes refining the Class 2-S sub-pattern.
9. **MINOR: Phase 2 pre-execute consult skipped in session 8** with rationale "plan already contains advisor SD". SKILL.md text is unambiguous (Phase 2 mandatory); executor's skip was an unsanctioned optimization. P8-20 candidate proposes either codifying the optimization or tightening the spec.

### Phase 8 candidates surfacing across all 8 sessions

| ID | Summary | Severity / Type |
|----|---------|------|
| P8-01 | `@storybook/global` vs `globalThis` idiom miss (session 1) | minor |
| P8-02 | Plan should propose `.d.ts` for generated-file imports (session 1) | minor |
| P8-03 | **STRONGEST: Pre-verified-contradiction rule** — advisor MUST flag with `Reframing: pv-N said X, recommending Y because <reason>` (sessions 2 + 7) | **strongest, two empirical instances** |
| P8-04 | Advisor concern disposition tracking in execute SKILL.md (session 2) | minor |
| P8-06 | Generated-file import handling pattern (sessions 1+2) | minor |
| P8-07 | Pre-emptive Class-2 scan blind spot for UX/integration surfaces (session 3) | minor |
| P8-08 | Reviewer recommendations lack executable Run: directives (session 3) | minor |
| P8-10 | Plan-fixes consult prompt could include `## Verification Pre-empted` section (session 4) | minor |
| P8-11 | Class-4 language-semantic self-anchor is appropriate for advisor (session 4) — positive observation | positive |
| P8-12 | Execute-skill should detect "review file passed but plan-fixes plan exists" (session 5) | minor |
| P8-13 | Plan 07-02 cost-cliff allowance language ambiguity needs clarification (sessions 2 + 5) | minor |
| P8-14 | Class-4 language-semantic reconciliation under trivial-fixes exemption (session 5) — positive observation | positive |
| P8-15 | Class 2-S step-1-sufficient short-circuit for non-recent packages (session 6) | minor |
| P8-16 | Bidirectional reviewer triage empirically confirmed (sessions 3 + 6) — positive observation | positive |
| P8-17 | Threat-model context block as required pre-consult prompt section for security-review (session 6) | minor |
| P8-18 | F1 disposition rests on un-empirical "no writable window" claim (session 7) | minor (tied to P8-03) |
| P8-19 | Cross-axis verdict scope inheritance worked correctly without explicit SKILL.md guidance (session 7) — positive observation | positive |
| P8-20 | Execute SKILL.md Phase 2 pre-execute consult skip when input is fresh plan with embedded advisor SD — codify or tighten? (session 8) | minor |
| P8-21 | Cross-axis verdict scope inheritance robust across TWO skills (session 7+8) — positive observation | positive |
| P8-22 | Final advisor Critical block load-bearing AND executor resolved a real plan gap (session 8) — positive observation | positive |

### Recommendation for amendment 6

**Status:** PASS → PASS-with-residual (per Phase 6 amendment 5 verdict shape). The 8-session chain demonstrates Phase 7's load-bearing gains EMPIRICALLY:

- pv-* synthesis discipline (Plan 07-01 Rule 5b) ✓
- ToolSearch precondition (Plan 07-01 G2) ✓ on 2/8 sessions (rule needs strengthening)
- Hedge marker discipline (Plan 07-02 E.1) ✓ across 6 sessions
- Verify-before-commit + wip + Verified: trailers (Plan 07-02 E.2) ✓ improving across sessions
- Silent-resolve sub-pattern (Plan 07-02 finding-disposition) ✓ TWO empirical closures (sessions 4 + 7)
- Reviewer/security-reviewer Class-2 + Class-2-S pre-emption (Plan 07-05) ✓ both
- Verdict scope markers (Plan 07-03) ✓ across 8 sessions, 2 distinct scopes, cross-axis inheritance confirmed
- Word-budget structural sub-caps (Plan 07-04) ✓ partial (per-section yes, aggregate improving)

The 5 recurring/major residuals (ToolSearch precondition gap, wip-discipline ambiguity, Cross-Skill Hedge Tracking gap, Reconciliation rule violations [2 instances], Self-anchor leak through narrative SD) are real and worth capturing in amendment 6. They don't invalidate the closure of GAP-G1+G2-empirical or the broader Phase 7 scope; they are refinements for a hypothetical Phase 8.
