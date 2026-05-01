---
phase: 07-address-all-phase-5-x-and-6-uat-findings
gap: 2
type: research
dated: 2026-05-01
plan_target: 07-08 (gap-closure for Plan 07-02 wip-discipline scope ambiguity)
confidence: HIGH (empirical anchor across 3 sessions; Conventional Commits convention verified; carve-out shape derives directly from observed executor reasoning)
---

# Gap 2 Research: wip-discipline Scope Ambiguity

**Researched:** 2026-05-01
**Domain:** Compliance-prompt language tightening for verify-before-commit cost-cliff allowance, with paired smoke-fixture extension for empirical detection
**Source artifacts:** 07-VERIFICATION.md (Gap 2 lines 67-80) + uat-replay/session-notes.md (sessions 2 + 5 + 8 + P8-13) + plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md `<verify_before_commit>` block + .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/E-verify-before-commit.sh path-c assertion

## Executive summary

The strict-text reading of Plan 07-02's cost-cliff allowance is correct: when a commit body contains a populated `## Outstanding Verification` section, the subject MUST use the `wip:` prefix. The empirical failure across sessions 2 + 5 is a pure language ambiguity, not a workflow disagreement -- the executor adopted a per-commit reading ("MY claim is verified, so MY subject can be `fix:`") that is internally consistent but defeats the rule's purpose, which is branch-state ("a wip parent or a still-pending Outstanding Verification entry forces follow-ups to remain wip until the entry clears"). Session 8 succeeded because the implementation was a single trivial edit with zero long-running validations -- the cost-cliff path was structurally absent, not because the executor reasoned correctly about it.

The fix lands in three coordinated surfaces: (1) tighten the SKILL.md text per the P8-13 hypothesis with a positive-framed "subject MUST be `wip:`-prefixed when Outstanding Verification is populated UNLESS this commit ONLY adds `Verified:` trailers for already-listed Outstanding items"; (2) add a paired correct + incorrect worked example following the Anthropic carve-out pattern (positive default, narrow enumerated exception, explicit "why"); (3) extend `E-verify-before-commit.sh` with a NEW dedicated path-c assertion that catches the empirical gap (`## Outstanding Verification` populated AND subject does NOT match `^wip(\(.+\))?:` AND commit changed files outside the `Verified:`-trailer-only carve-out). The smoke fixture extension is the load-bearing detection layer -- the SKILL.md text alone failed for sessions 2 + 5; outcome-based verification per `dev.to/moonrunnerkc` is required to break the per-commit reading deterministically.

**Primary recommendation:** Land all three surfaces in Plan 07-08 as a single atomic commit set. The contract language is the prevention layer; the worked example is the comprehension layer; the smoke fixture is the detection layer. Without all three, the gap will recur on the next UAT cycle (the per-commit reading is a structurally tempting interpretation that the executor will rediscover unless the smoke fixture forecloses it empirically).

## Empirical signal analysis

### Why sessions 2 + 5 failed and session 8 succeeded

**Session 2 commit `8c25c9e`** [VERIFIED: session-notes.md lines 73-74 + 95]:
- Parent commit `eb9107f` had subject `wip: set up Compodoc + Storybook integration with signal-based component API` and body section `## Outstanding Verification` listing `pnpm nx build-storybook` and `pnpm nx reset` as pending.
- Follow-up commit `8c25c9e` had subject `fix(storybook): add type declaration for generated documentation.json` and shipped while the parent's Outstanding Verification items had NOT run (transcript shows no `nx build-storybook` Bash invocation between L117 and L138, per session-notes.md line 95).
- The follow-up's body contained verification prose ("addon-docs is bundled in @storybook/angular 10.3.5 -- tags: ['autodocs'] is valid") confirming the executor DID verify a hedge -- but the verification was for a DIFFERENT claim than the parent's Outstanding Verification items.
- **Failure mode:** Per-commit reading. The executor reasoned "this commit's claim is verified" and shipped it as `fix:`, treating the parent's Outstanding Verification as orthogonal state.

**Session 5 commit `06af4cf`** [VERIFIED: session-notes.md lines 187 + 214]:
- Subject: `fix(storybook): apply Compodoc + Storybook review findings`.
- Body contained populated `## Outstanding Verification` section listing `npm exec nx build-storybook ngx-smart-components` as pending.
- **Identical failure mode to session 2.** Second empirical instance of `## Outstanding Verification` shipping in a non-`wip:` commit. Per session-notes.md line 214: "Same gap as session 2 commit 8c25c9e (the per-commit vs branch-state ambiguity in wip-discipline). Now the SECOND empirical instance of this exact gap."

**Session 8 commit `15d8fac`** [VERIFIED: session-notes.md lines 297-315]:
- Single atomic commit. Subject form not preserved verbatim in session-notes excerpt but session-notes line 309 confirms: "First commit `15d8fac` has formal `Verified: <claim>` trailer per spec... First fully-conformant Verified: trailer in a SINGLE-COMMIT session."
- Implementation scope: a single dependency-pin edit (`@compodoc/compodoc` `^1.2.1` -> `1.2.1`) plus regenerated lockfile. ALL validations ran pre-commit (npm install, npm ls, custom node lockfile-verify script).
- **No `## Outstanding Verification` section was needed** because there were no long-running async validations to defer. The cost-cliff path was structurally absent.

**Critical insight:** Session 8 succeeded by AVOIDING the cost-cliff path, not by RESOLVING it correctly. The wip-discipline scope ambiguity remains latent in any session where long-running validations exist. The success in session 8 cannot be cited as evidence that the SKILL.md text is operative -- the text was simply not exercised on the cost-cliff path.

### P8-13 hypothesis status: VALIDATED with refinement

The P8-13 candidate text [CITED: session-notes.md line 224 + 07-VERIFICATION.md line 76]:

> "When a commit body contains `## Outstanding Verification` section listing pending Run: directives, the commit subject MUST use `wip:` prefix UNLESS the commit ONLY records additional `Verified: <claim>` trailers for already-listed Outstanding items."

**Hypothesis validation:**
- The PRIMARY rule ("subject MUST use `wip:` when Outstanding Verification is populated") is empirically necessary -- it directly addresses the per-commit reading that broke sessions 2 + 5.
- The CARVE-OUT ("UNLESS the commit ONLY records additional `Verified:` trailers for already-listed Outstanding items") is empirically necessary -- without it, the rule would force ALL follow-up commits to remain `wip:` even when their entire purpose is closing out the parent's Outstanding Verification entries (the "convert wip to regular commit" path the existing SKILL.md describes at lines 212-213).

**Hypothesis refinement:** The carve-out's detection criterion ("the commit ONLY records additional Verified: trailers") is empirically thin. Sessions 2 + 5 both had file changes alongside their verification claims; a future commit might mix Verified: trailers with code edits and the executor will need a clear rule. The refinement: the carve-out applies when `git diff --stat HEAD~1..HEAD` shows ZERO file changes (the commit is a documentation-only / trailer-only follow-up). If file changes are present, the commit is NOT a trailer-only follow-up; subject MUST be `wip:` until ALL Outstanding Verification entries clear, OR a non-wip commit may ship if the body contains NO `## Outstanding Verification` section at all (the cost-cliff path was avoided this commit).

**Empirical test of the refinement:** Session 2's `8c25c9e` had 1 file changed (`documentation.d.ts` added). Session 5's `06af4cf` had 5 files changed. Both fail the "zero file changes" detection. Session 8's `15d8fac` had 2 files changed but had NO `## Outstanding Verification` section in its body, so the carve-out is moot. The refinement correctly classifies all three sessions.

### Other legitimate non-wip-with-Outstanding cases (none found)

I considered three additional non-wip-with-Outstanding scenarios and rejected each:

| Scenario | Why rejected |
|----------|--------------|
| Commit closes the LAST Outstanding Verification entry and removes the section | Then the body has NO `## Outstanding Verification` section, so the rule doesn't trigger -- this isn't a separate carve-out, just normal behavior. |
| Commit converts wip-parent to non-wip via `git commit --amend` after Outstanding Verification clears | Amend rewrites history, doesn't add a new commit. The rule applies to commits as they exist; amend behavior is orthogonal. |
| Commit ships unrelated work in parallel while Outstanding Verification is pending | This is exactly the per-commit reading that broke sessions 2 + 5. NOT a legitimate carve-out -- it IS the failure mode. |

**Conclusion:** The P8-13 carve-out (trailer-only follow-up) is the COMPLETE set of legitimate non-wip-with-Outstanding cases. No additional carve-outs are needed.

## Solution candidates

Three fix surfaces are enumerated by 07-VERIFICATION.md. I recommend ALL THREE in tandem; partial implementation will not close the gap empirically.

### Candidate 1: Tighten SKILL.md text per P8-13 hypothesis

**Mechanism:** Replace the existing paragraph in `<verify_before_commit>` Phase 3.5's "Cost-cliff allowance" subsection (currently `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` lines 211-213) with a positive-framed compliance rule that states the primary rule and the trailer-only carve-out explicitly. Anchor the carve-out detection criterion in `git diff --stat` semantics.

**Evidence anchor:** [VERIFIED: session-notes.md lines 95 + 214] -- two empirical instances of the per-commit reading. [CITED: prompthub.us/blog/an-analysis-of-the-claude-4-system-prompt] -- Anthropic's own production prompt uses positive defaults followed by narrow enumerated exceptions, e.g., the "Claude does not decline... except in very extreme positions such as..." pattern. Sonnet 4.6 specifically rewards this structure per [CITED: docs.claude.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices] (clear and specific, with motivation behind the rule).

**Trade-off cost:** Adds approximately 80 words to the SKILL.md `<verify_before_commit>` block (current: ~620 words; post-fix: ~700 words). The block is already the longest XML container in the file; further growth marginal. No other surfaces affected.

**Implementation cost:** Single Edit to SKILL.md. No coordinated multi-file change.

**Residual risk:** Text-only fix is what failed in sessions 2 + 5. Without the smoke fixture (Candidate 3) and worked example (Candidate 2), the executor may rediscover the per-commit reading on a future cost-cliff path. Anthropic's own ablation [CITED: buildthisnow.com/blog/models/claude-code-quality-regression-2026, referenced in 07-CONTEXT.md] shows ~3% coding-quality drop from a single verbosity cap addition -- text rules alone have known empirical leak rates.

### Candidate 2: Add worked example pair (correct + incorrect shapes)

**Mechanism:** Insert a `### Worked example: wip subject + Outstanding Verification` subsection after the contract language. Show TWO concrete commit shapes: (a) the CORRECT shape (`wip:` subject + populated `## Outstanding Verification`) following the canonical 8th-UAT pattern; (b) the INCORRECT shape (`fix:` subject + populated `## Outstanding Verification`) annotated with "this is the per-commit reading that breaks branch-state semantics". A third shape (the trailer-only carve-out) shows the legitimate non-wip-with-Outstanding case.

**Evidence anchor:** [VERIFIED: project memory `reference_sonnet_46_prompt_steering.md`] -- "descriptive triggers + few-shot examples for tool-use steering on 4.x; reserve imperatives for compliance only." [CITED: dreamhost.com/blog/claude-prompt-engineering] -- "use positive and negative examples" is one of Claude's own recommended prompting practices. [CITED: docs.claude.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices] -- providing motivation alongside rules is more effective than rules alone for Claude 4.x. Existing precedent in the repo: `agents/advisor.md` lines 62-76 ship TWO `### Density example` blocks (full-context and thin-context) following exactly this pattern.

**Trade-off cost:** Adds approximately 200 words (three commit-shape blocks, each fenced; brief commentary). The block grows further. Marginal.

**Implementation cost:** Single Edit to SKILL.md (same surface as Candidate 1; can ship in same commit).

**Residual risk:** Worked examples are comprehension scaffolding. They reduce ambiguity but cannot DETECT violations -- only the smoke fixture can. Examples + text together cover prevention; the fixture covers detection.

### Candidate 3: Extend `E-verify-before-commit.sh` with dedicated path-c counter-example assertion

**Mechanism:** Path-c currently asserts a CONJUNCTION (subject matches `^wip:` AND body contains `## Outstanding Verification`). The fix needs an additional NEGATIVE assertion: when the body contains `## Outstanding Verification` AND the commit is NOT a trailer-only follow-up (`git diff --stat HEAD~1..HEAD` shows non-zero file changes), the subject MUST match `^wip(\(.+\))?:`. Failing this assertion is a NEW failure mode the existing path-c doesn't catch (path-c is currently a pass-path; the new assertion is a fail-path).

The fixture's seed scenario also needs extension: currently the fixture seeds a Run/Verify directive scenario that exercises the cheap-validation path. To exercise the cost-cliff path empirically, a second seeded scenario must include a long-running command name (e.g., `Run: nx storybook ngx-smart-components` per the SKILL.md cost-cliff override list at lines 193-195) that the executor must route to wip + Outstanding Verification. This second scenario is what the recurring session 2 + 5 gap actually tests.

**Evidence anchor:** [VERIFIED: E-verify-before-commit.sh lines 106-113] -- current path-c assertion is a CONJUNCTION; doesn't fire on the empirical session 2 + 5 gap (non-wip + Outstanding Verification). [CITED: dev.to/moonrunnerkc/ai-coding-agents-lie-about-their-work-outcome-based-verification-catches-it-12b4, referenced in 07-CONTEXT.md] -- "agent self-reports lie systematically; outcome-based verification is the architectural separation between agent narrative (untrusted) and empirical signal (trusted)." Without smoke detection of the gap, the SKILL.md text relies entirely on agent self-discipline, which the empirical signal explicitly rejects.

**Trade-off cost:** Smoke fixture grows by ~30 lines (negative assertion + seed scenario extension). Slight increase in fixture runtime (one additional `claude -p` invocation). The fixture is run per-release as a regression gate, not on every commit; runtime cost is negligible.

**Implementation cost:** Single Edit to `E-verify-before-commit.sh`. Optional: rename existing path-c to path-c-pass and add path-c-fail as separate exit-code path, OR keep path-c as-is and add a NEW path-d "violation detection" assertion that exits non-zero when the gap shape is observed. I recommend the latter (add path-d, leave existing path-a/b/c untouched) -- preserves existing pass-paths without introducing regression risk to other smoke fixtures that may invoke this fixture's exit semantics.

**Residual risk:** None empirical. The fixture either fires or it doesn't; if it fires on session 2 + 5 commit replays, the gap is detected. The risk is implementation correctness (regex patterns, `git diff --stat` parsing) -- but those are standard Bash + `rg` operations that match existing fixture patterns (KCB-economics.sh uses identical primitives).

### Candidates summary

| # | Surface | Mechanism | Layer | Required? |
|---|---------|-----------|-------|-----------|
| 1 | SKILL.md text | Compliance rule with positive default + carve-out | Prevention | YES (anchor) |
| 2 | SKILL.md worked example | Three commit-shape demonstrations (correct, incorrect, carve-out) | Comprehension | YES (Sonnet 4.6 best practice) |
| 3 | E-verify-before-commit.sh | New negative assertion (path-d) catching the gap shape empirically | Detection | YES (without it, gap recurs) |

**All three required.** The same paired-layer logic that justified Plan 07-02 itself (prompt + smoke + UAT) applies recursively to its own gap-closure: prompt-only fixes have empirical leak rates; smoke-only detection without prompt clarity creates whack-a-mole; both together with a comprehension scaffold close the gap deterministically.

## Recommended contract language

Replace the existing "Cost-cliff allowance for long-running async validations" subsection text in `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` (specifically the prose around line 211 onward, currently ending with "The conversion records the verification outcomes either as additional `Verified:` trailers OR as a new commit body section `## Verified Outstanding`.") with the following EXACT text:

```
### Cost-cliff allowance for long-running async validations

Cheap synchronous validations execute pre-commit:

- `npm ls`, `npm install`, `git grep`, `git check-ignore`, `git status`, `lint`, `tsc --noEmit`, `tsc --noEmit --pretty`, `jest --bail`, focused test runs
- Commands expected to complete in under 30 seconds on a warm dev machine

Long-running async validations move to a `wip:` prefixed commit + `## Outstanding Verification` section in the commit body listing the pending checks:

- `nx storybook`, `nx test`, `nx test-storybook`, `nx serve*`, `nx run-many` over many projects (more than 3)
- Full test suites lasting longer than 30 seconds
- Dev-server startup or watch-mode commands

`wip:` commit body shape:

```
wip: <subject describing partial deliverable>

<body explaining what is in and what is pending>

## Outstanding Verification

- Run: `nx storybook ngx-smart-components` -- verify Docs tab renders Compodoc descriptions
- Run: `nx test-storybook ngx-smart-components` -- verify play-test assertions pass

Verified: <any cheap-validation claim already executed>
```

### Subject-prefix discipline when Outstanding Verification is populated

When a commit body contains a `## Outstanding Verification` section listing one or more pending `Run:` directives, the commit subject MUST use the `wip:` prefix (canonical form `wip:` lowercase; `chore(wip):` and `wip(<scope>):` also accepted by the smoke fixture regex `^wip(\(.+\))?:`). This rule applies to every commit -- the parent commit that introduced the Outstanding Verification, AND every follow-up commit that ships while ANY entry in the section remains pending.

The rule's purpose is BRANCH-STATE preservation, not per-commit narrative. While even one Outstanding Verification entry remains pending, the branch is in a known-incomplete state regardless of whether your latest commit's own claim is verified. Shipping a non-`wip:` follow-up (e.g., `fix:` or `feat:`) while Outstanding Verification is populated masks the incomplete state from `git log --oneline` audit and from the `E-verify-before-commit.sh` smoke fixture's path-c gate.

Carve-out: when a follow-up commit ONLY records additional `Verified: <claim>` trailers for items already listed in the parent's Outstanding Verification section -- with ZERO file changes (`git diff --stat HEAD~1..HEAD` shows no files modified) -- the subject MAY drop the `wip:` prefix and use `docs(wip-resolve):` or simply close the wip parent via `git commit --amend` after the verification runs. A trailer-only follow-up is a documentation update of the parent's verification status, not new substantive work, so it does not extend the wip state.

Convert the `wip:` chain to a regular commit (or follow up with a non-wip commit body that omits the `## Outstanding Verification` section entirely) once ALL Outstanding Verification entries from the parent have been executed. The conversion records verification outcomes either as additional `Verified:` trailers OR as a new commit body section `## Verified Outstanding`.

The motivation: branch-state semantics ensure that a reviewer auditing `git log --oneline` can immediately see "the last 3 commits are still `wip:`, so the long-running validation hasn't completed yet" without reading every commit body. Per-commit semantics break this audit by allowing a `fix:` or `feat:` to appear mid-chain while Outstanding Verification is pending, falsely signaling completion.
```

**Why this language closes the gap (anchored in empirical and citation evidence):**

1. **Positive framing** [CITED: prompthub.us Anthropic Claude 4 system prompt analysis]: "MUST use the `wip:` prefix" states what to do, not what to avoid. The carve-out is a positive enumeration ("when... MAY drop the prefix"), not a negative prohibition.
2. **Branch-state vocabulary** [VERIFIED: session-notes.md line 95]: explicit "branch-state" framing was missing from the original SKILL.md text; the executor's per-commit reading filled the vacuum. Naming the alternative interpretation explicitly is what closes the ambiguity.
3. **Carve-out anchored in `git diff --stat` semantics** [Empirical refinement of P8-13]: zero-file-changes is a deterministic, agent-readable signal -- the executor can run `git diff --stat HEAD~1..HEAD` and observe the count, no judgment required.
4. **Motivation explicit at the end** [CITED: docs.claude.com Claude 4 best practices]: explaining WHY the rule exists ("audit reviewer can immediately see the wip chain") is more effective for Sonnet 4.6 than rule-without-motivation.
5. **Regex pattern `^wip(\(.+\))?:` documented in the SKILL.md text** [Smoke fixture coupling]: makes the smoke fixture's regex visible to the executor, eliminating divergence between what the SKILL.md says and what the fixture asserts.

## Recommended worked example

Insert the following block IMMEDIATELY AFTER the contract language above, BEFORE the existing `### Verified: trailer convention` subsection:

```
### Worked example: wip subject + Outstanding Verification

Three commit shapes in sequence, exercising the rule and its carve-out:

**Shape 1 (CORRECT): Parent wip commit with Outstanding Verification.**

```
wip: set up Compodoc + Storybook integration with signal-based component API

Implements pv-1 contract from the plan (`@storybook/angular@10.3.5` `compodoc: true` executor + signal-based label/clicked symbols on the demo component).

## Outstanding Verification

- Run: `nx build-storybook ngx-smart-components` -- verify documentation.json is generated and Storybook bundle includes it
- Run: `nx reset` -- verify Nx cache invalidation does not break the Compodoc target

Verified: @compodoc/compodoc 1.2.1 is present as a transitive dep (rg confirmed in node_modules)
Verified: documentation.json added to .gitignore before first build (per advisor Critical block)
```

**Shape 2 (INCORRECT, per-commit reading): Follow-up fix while parent's Outstanding Verification is still pending.**

```
fix(storybook): add type declaration for generated documentation.json

Adds a `documentation.d.ts` ambient declaration so the IDE stops flagging `import docJson from '../documentation.json'` as a TS2307 missing-module error.

## Outstanding Verification

- Run: `nx build-storybook ngx-smart-components` -- verify documentation.json is generated and Storybook bundle includes it
- Run: `nx reset` -- verify Nx cache invalidation does not break the Compodoc target

Verified: tsc --noEmit on .storybook/tsconfig.json exits clean after the .d.ts addition
```

This shape is the per-commit reading: the follow-up's OWN claim (the .d.ts addition) is verified, so the executor reasons "my subject can be `fix:`". The reading breaks branch-state semantics: a reviewer scanning `git log --oneline` sees `wip: ... / fix(storybook): ...` and infers the long-running validation completed between the two commits, when in fact `nx build-storybook` and `nx reset` are still pending. The `## Outstanding Verification` section is duplicated into the follow-up because the entries remain pending, but the subject lies about branch state.

The CORRECT subject for this commit is `wip(storybook): add type declaration for generated documentation.json` (or `wip: ...`). The body's Outstanding Verification section stays populated until the long-running validations actually run.

**Shape 3 (CORRECT carve-out): Trailer-only follow-up closes Outstanding Verification entries.**

```
docs(wip-resolve): record nx build-storybook + nx reset verifications

Verified: nx build-storybook ngx-smart-components produced documentation.json (4.2 KB) and Storybook bundle includes the Compodoc JSON load
Verified: nx reset cleared the Nx cache cleanly; subsequent build-storybook re-ran the Compodoc target without stale artifacts
```

This commit ships ZERO file changes (`git diff --stat HEAD~1..HEAD` returns no files); its sole content is two `Verified:` trailers closing out the parent's Outstanding Verification entries. The subject drops the `wip:` prefix per the carve-out: a trailer-only follow-up records the verification outcome but does not introduce new substantive work, so it does not extend the wip state. After this commit, a subsequent commit may use `fix:` or `feat:` because the Outstanding Verification entries have been documented as completed.

Equivalent alternative: amend the parent wip commit via `git commit --amend` to add the trailers and rewrite the subject from `wip:` to `feat:` or `fix:`. The amend approach loses the verification-outcome timestamp but consolidates the wip chain into a single final commit. Both approaches are acceptable; pick based on whether downstream consumers (CI, code review tooling) prefer a clean linear history (amend) or an auditable verification trail (separate trailer-only commit).
```

**Why this worked-example structure is correct:**

1. **Three shapes, not two** [CITED: dreamhost.com Claude prompt engineering] -- Claude's own recommendation is "positive and negative examples." Three shapes cover (positive correct, negative incorrect, positive carve-out) -- the carve-out is a SEPARATE positive shape, not an annotation on the incorrect shape, because conflating them would invite the executor to overgeneralize the carve-out into the per-commit reading.
2. **Concrete details ripped from session 2 transcript** [VERIFIED: session-notes.md lines 73-95] -- "set up Compodoc + Storybook integration", `nx build-storybook ngx-smart-components`, `documentation.d.ts`, etc. all match the empirical scenario the gap was discovered in. Sonnet 4.6 anchors more reliably on examples it can pattern-match against real session traces.
3. **Explicit annotation on Shape 2** ("This shape is the per-commit reading...") names the failure mode the executor exhibits, surfacing the model's likely (incorrect) reasoning so the executor can recognize and reject it. Per [CITED: docs.claude.com Claude 4 best practices], explicit motivation is more effective than implicit do-not framing.
4. **Carve-out detection criterion repeated** ("ZERO file changes... `git diff --stat HEAD~1..HEAD` returns no files") -- the executor sees the deterministic check both in the contract language AND in the worked example. Redundancy is intentional; few-shot examples should re-state load-bearing rules concretely.

## Smoke fixture extension design

Modify `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/E-verify-before-commit.sh` with TWO changes:

### Change 1: Replace single-scenario seed with TWO scenarios

The current fixture seeds ONE plan file (`plans/verify-before-commit-fixture.plan.md`) that exercises the cheap-validation path (path-b: `npm ls`, `git grep`). Add a second plan file that exercises the cost-cliff path explicitly so the new path-d assertion has empirical input to fire on.

**Insert after line 67 (after the existing `cat > plans/verify-before-commit-fixture.plan.md << 'EOF' ... EOF` block):**

```bash
# Seed a SECOND plan file that exercises the cost-cliff path:
# a long-running validation that the executor MUST route to wip + Outstanding Verification.
# This is the empirical scenario sessions 2 + 5 broke on.
cat > plans/cost-cliff-fixture.plan.md << 'EOF'
# Plan: Smoke fixture for cost-cliff allowance + wip-discipline scope

## Strategic Direction

Wire up Compodoc to Storybook's documentation pipeline. The integration MUST be verified end-to-end via `nx build-storybook` (long-running, > 30s on a warm dev machine), so the implementation commit should be `wip:` prefixed with an `## Outstanding Verification` section.

## Steps

1. **Add a placeholder symbol referencing the integration**
   - File: `src/compodoc-stub.ts`
   - Change: append `export const compodocReady = true;` to a new file
   - Rationale: trivial scaffolding; the fixture asserts on the COMMIT shape, not the code change

2. **Validate (long-running, cost-cliff path)** -- Run: `nx build-storybook ngx-smart-components` -- Verify: build emits documentation.json and Storybook bundle picks it up

## Key Decisions

- **Cost-cliff routing:** the `nx build-storybook` validation is on the cost-cliff override list per `lz-advisor.execute/SKILL.md` `<verify_before_commit>` Phase 3.5. The implementation commit MUST therefore use `wip:` prefix and ship the validation as an entry in `## Outstanding Verification`. A non-wip commit subject with a populated Outstanding Verification section is a wip-discipline scope violation.
EOF

git add plans/cost-cliff-fixture.plan.md
git commit -q -m "seed cost-cliff fixture"
```

### Change 2: Add path-d assertion (counter-example detection)

The current `E-verify-before-commit.sh` lines 106-113 implement path-c as a positive conjunction (subject `^wip:` AND body `## Outstanding Verification`). Path-c PASSES when both hold. The empirical gap is the inverse: subject does NOT match `^wip:` AND body DOES contain `## Outstanding Verification` AND commit changed files outside the trailer-only carve-out.

**Insert immediately AFTER the existing path-c assertion (after line 113, before the aggregate result block at line 115):**

```bash
# Path (d): wip-discipline scope ambiguity DETECTION (negative assertion).
# Fires when the executor used the per-commit reading: shipped a non-wip commit
# that has a populated `## Outstanding Verification` section AND changed files
# outside the trailer-only carve-out. This is the empirical session 2 + 5 gap.
PATH_D_VIOLATION=0
if [ "$OUTSTANDING_PRESENT" -ge 1 ] && [ "$WIP_PRESENT" -eq 0 ]; then
  # Outstanding Verification is populated AND subject is NOT wip-prefixed.
  # Check the carve-out: is this a trailer-only follow-up (zero file changes)?
  FILE_CHANGES=$(git -C "$SCRATCH" diff --stat HEAD~1..HEAD 2>/dev/null | rg -c '^\s*\S+\s+\|\s+\d+' || echo 0)
  if [ "$FILE_CHANGES" -ge 1 ]; then
    # Non-zero file changes outside the trailer-only carve-out: this is a violation.
    PATH_D_VIOLATION=1
    echo "[ERROR] Path (d) wip-discipline violation: subject does not match '^wip(\(.+\))?:' BUT body contains '## Outstanding Verification' AND $FILE_CHANGES file(s) changed (outside trailer-only carve-out)"
    echo "  Subject: $LAST_COMMIT_SUBJECT"
    echo "  This is the empirical session 2 + 5 wip-discipline scope ambiguity gap (Plan 07-02 Gap 2 / P8-13)."
    echo "  Per <verify_before_commit>: subject MUST use 'wip:' prefix when Outstanding Verification is populated, UNLESS the commit ONLY records additional Verified: trailers for already-listed Outstanding items (zero file changes)."
  else
    # Zero file changes: trailer-only follow-up carve-out; not a violation.
    echo "[OK] Path (d) carve-out: subject is non-wip AND body has Outstanding Verification, but commit is trailer-only (zero file changes) -- carve-out applies"
  fi
fi
```

**Insert into the aggregate result logic at lines 115-134 (extend the FAIL message and exit logic):**

```bash
# Aggregate result: at least one positive path AND no negative violation
TOTAL_PATHS=$((PATH_A + PATH_B + PATH_C))
if [ "$PATH_D_VIOLATION" -eq 1 ]; then
  echo "[ERROR] E-verify-before-commit.sh: Path (d) wip-discipline violation detected -- gap-2 empirical signal"
  echo "  Path (a) hedge-flag: PATH_A=$PATH_A"
  echo "  Path (b) verify-trailer: PATH_B=$PATH_B"
  echo "  Path (c) wip-commit: PATH_C=$PATH_C"
  echo "  Path (d) violation: PATH_D_VIOLATION=1 (THIS IS THE GAP)"
  echo "--- Last commit subject ---"
  printf '%s\n' "$LAST_COMMIT_SUBJECT"
  echo "--- Last commit body ---"
  printf '%s\n' "$LAST_COMMIT_BODY"
  echo "--- git diff --stat HEAD~1..HEAD ---"
  git -C "$SCRATCH" diff --stat HEAD~1..HEAD 2>/dev/null || echo "(empty)"
  exit 2
elif [ "$TOTAL_PATHS" -ge 1 ]; then
  echo "[SUCCESS] E-verify-before-commit.sh: $TOTAL_PATHS of 3 paths satisfied (path a=$PATH_A, b=$PATH_B, c=$PATH_C); no wip-discipline violation"
  exit 0
else
  echo "[ERROR] E-verify-before-commit.sh: NONE of 3 positive paths satisfied AND no wip-discipline violation"
  echo "  Path (a) hedge-flag: PATH_A=0"
  echo "  Path (b) verify-trailer: PATH_B=0 (TRAILER_PRESENT=$TRAILER_PRESENT, TOOL_USE_PRESENT=$TOOL_USE_PRESENT)"
  echo "  Path (c) wip-commit: PATH_C=0 (WIP_PRESENT=$WIP_PRESENT, OUTSTANDING_PRESENT=$OUTSTANDING_PRESENT)"
  echo "--- advisor Strategic Direction ---"
  cat "$SD_FILE" 2>/dev/null || echo "(empty)"
  echo "--- Last commit subject ---"
  printf '%s\n' "$LAST_COMMIT_SUBJECT"
  echo "--- Last commit body ---"
  printf '%s\n' "$LAST_COMMIT_BODY"
  echo "--- JSONL trace tail (last 100 lines) ---"
  tail -n 100 "$OUT_JSONL"
  exit 1
fi
```

**Implementation notes (mandatory):**

- **Three exit codes:** `0` = pass, `1` = no path satisfied (existing failure mode), `2` = wip-discipline violation detected (NEW failure mode). Distinguishing exit 2 from exit 1 lets the per-release regression dashboard categorize gap-2 violations separately from generic failures.
- **`WIP_PRESENT` regex must accept all three Conventional Commits-compatible wip prefixes:** `^wip:`, `^wip(<scope>):`, and `^chore(wip):`. Update the existing regex on line 108 from `^wip:` to `^wip(\(.+\))?:|^chore\(wip\):` so the fixture aligns with the SKILL.md text's documented forms.
- **Second `claude -p` invocation:** the cost-cliff scenario requires a separate execute-skill invocation against `cost-cliff-fixture.plan.md`. Insert the second invocation after line 77 (the existing single invocation), capturing its output to `$OUT_JSONL_2` and its commit subject/body to a SECOND set of variables (`LAST_COMMIT_SUBJECT_2`, `LAST_COMMIT_BODY_2`). The path-d assertion runs against the SECOND scenario's commit (the cost-cliff path) -- the first scenario's commit exercises path-b (cheap validation) and remains untouched.
- **Empirical replay capability:** the fixture should be runnable against the historical session 2 + 5 commits as a regression test. Add a `--replay <commit-sha>` flag that, instead of running `claude -p`, reads `git show --format='%s' <sha>` and `git show --format='%B' <sha>` directly, then runs the path-d assertion. This lets future Phase 7+ verification re-check that commits `8c25c9e` and `06af4cf` would now FAIL the fixture (exit 2) under the tightened contract.

### Smoke fixture extension: empirical replay against historical commits

The strongest validation of the fix is replaying the smoke fixture against the actual session 2 + 5 commits and confirming exit 2 (violation detected). Pseudocode for the replay logic:

```bash
# Replay mode: re-check historical commits against the new path-d assertion.
# Usage: ./E-verify-before-commit.sh --replay 8c25c9e
# Expected: exit 2 (path-d violation detected)
if [ "${1:-}" = "--replay" ]; then
  REPLAY_SHA="${2:?--replay requires a commit SHA}"
  cd "$REPO_ROOT"
  LAST_COMMIT_SUBJECT=$(git show --format='%s' --no-patch "$REPLAY_SHA")
  LAST_COMMIT_BODY=$(git show --format='%B' --no-patch "$REPLAY_SHA")
  WIP_PRESENT=$(printf '%s\n' "$LAST_COMMIT_SUBJECT" | rg -c '^wip(\(.+\))?:|^chore\(wip\):' || echo 0)
  OUTSTANDING_PRESENT=$(printf '%s\n' "$LAST_COMMIT_BODY" | rg -c '^## Outstanding Verification' || echo 0)
  FILE_CHANGES=$(git diff --stat "${REPLAY_SHA}~1..${REPLAY_SHA}" 2>/dev/null | rg -c '^\s*\S+\s+\|\s+\d+' || echo 0)
  # ... run path-d assertion as above; exit 2 on violation
fi
```

This replay capability is what Plan 07-08 should use to prove gap closure: the new fixture, run with `--replay 8c25c9e` and `--replay 06af4cf`, MUST exit 2 on both. If it exits 0 or 1, the contract language and/or the path-d regex needs further refinement.

## Open questions for planner

The following items are explicitly **Claude's Discretion** for the Plan 07-08 planner. None of them block research closure; each represents a valid design choice with empirical or convention anchors.

### OQ-1: wip prefix style choice

The SKILL.md regex `^wip(\(.+\))?:|^chore\(wip\):` accepts all three documented forms: `wip:`, `wip(<scope>):`, `chore(wip):`. The 07-CONTEXT.md Claude's Discretion entry says "wip: lowercase prefix; alternative chore(wip):; planner picks aligned with existing project conventional-commits style."

**Empirical anchor [VERIFIED: session-notes.md line 73]:** session 2's wip commit used `wip: set up Compodoc + Storybook integration with signal-based component API` -- bare `wip:` prefix, no scope. The empirical pattern aligns with the FlowingCode convention [CITED: github.com/FlowingCode/DevelopmentConventions/blob/main/conventional-commits.md] of `WIP: <type>: <subject>` (uppercase `WIP:`) but the lz-advisor convention has been lowercase `wip:` since Phase 5.

**Recommendation:** Standardize on lowercase `wip:` and `wip(<scope>):` as primary forms; accept `chore(wip):` as a Conventional-Commits-strict alternative for projects that linter their commit type prefixes against an exact whitelist. The smoke fixture regex MUST accept all three. The worked example in Shape 1 uses bare `wip:` for clarity; Shape 2 (incorrect) uses the same canonical form to make the violation easy to spot.

**Open:** does the planner want to pin a single canonical form (e.g., bare `wip:` only) and reject `wip(scope):` and `chore(wip):` as non-canonical? Empirically, sessions 2 + 5 + 8 only used the bare `wip:` form, so a single-form rule has empirical support. The trade-off is restricting projects whose existing Conventional Commits config requires the `chore(wip):` form for type whitelist compliance. **My recommendation:** accept all three forms; the rule's load-bearing axis is "subject IS prefixed with some flavor of wip", not "subject matches an exact regex." Conformance is positive (the subject expresses wip-state), not formal.

### OQ-2: Verified: trailer regex shape

The smoke fixture currently greps for `^Verified:` (line 97). The contract text and worked example use `Verified: <claim text>` on its own line in the commit body. The carve-out depends on detecting "this commit ONLY records additional Verified: trailers" -- which requires the trailer detection to be both inclusive (catch all forms) and exclusive (not match `Verified-by:` or other related conventions).

**Empirical anchor [VERIFIED: session 5 commit `f1c8ccd` per session-notes.md line 202]:** the conformant trailer form is exactly `Verified: <claim text>` on its own line, after body paragraphs. Multiple trailers are allowed.

**Recommendation:** Tighten the regex from `^Verified:` to `^Verified: \S+` (one space, then at least one non-whitespace character) to exclude empty `Verified:` lines and `Verified-by:` (which has a hyphen, doesn't match the space). Document the regex in the SKILL.md text alongside the format spec so the executor knows what the smoke fixture is looking for.

**Open:** does the planner want to support `Verified-by: <tool_use_id>` as a SECOND trailer family for trace cross-reference (per 07-CONTEXT.md Claude's Discretion)? My recommendation per existing CONTEXT.md deferred-ideas list: keep `Verified-by:` deferred until trailer parsing complexity is empirically demanded; the path-d carve-out doesn't need it.

### OQ-3: Threshold for "ONLY records Verified: trailers" detection

The carve-out fires when `git diff --stat HEAD~1..HEAD` shows ZERO file changes. This is a conservative threshold: it means a trailer-only commit cannot also contain unrelated metadata edits (e.g., a typo fix in the body of the parent commit message via amend).

**Alternative threshold candidates:**

- **Stricter:** also require commit body to contain ONLY `Verified:` lines (no prose paragraphs, no other content). This catches edge cases where the executor adds explanatory prose alongside the trailers, but forecloses legitimate narrative ("Closing out the long-running validations: Verified: ... Verified: ...") that a human reviewer would consider a valid trailer-only commit.
- **Looser:** require zero source-code file changes but allow documentation-only changes (e.g., README updates that accompany the verification trailers). Detection: `git diff --stat HEAD~1..HEAD | rg -v '\.(md|txt|MD)\s+\|'` returns empty.

**Recommendation:** START with the conservative "ZERO file changes" threshold per the contract language above. It is the most empirically detectable signal (a single Bash invocation, single grep). If a future UAT cycle surfaces a legitimate trailer-only commit that ALSO touches a doc file (e.g., updating CHANGELOG.md alongside the trailers), refine the threshold to "zero source-code changes" then. Don't pre-optimize -- the conservative threshold has zero false-negative risk on the empirical session 2 + 5 commits (both have non-zero file changes; both correctly fail under conservative threshold).

**Open:** does the planner want to ship the looser threshold from the start to handle the README-update-alongside-trailers case proactively? My recommendation: NO. Conservative threshold first; refine only if empirical demand surfaces.

## Sources

### Primary (HIGH confidence)

- `D:\projects\github\LayZeeDK\lz-advisor-claude-plugins\.planning\phases\07-address-all-phase-5-x-and-6-uat-findings\07-VERIFICATION.md` -- Gap 2 statement (lines 67-80), severity classification, possible fix surfaces enumeration. **Authoritative source for gap scope and P8-13 hypothesis text.**
- `D:\projects\github\LayZeeDK\lz-advisor-claude-plugins\.planning\phases\07-address-all-phase-5-x-and-6-uat-findings\uat-replay\session-notes.md` -- empirical evidence for sessions 2 (lines 73-95), 5 (lines 187-216), 8 (lines 297-315), and P8-13 candidate (line 224). **Authoritative source for empirical failure / success patterns and the per-commit-vs-branch-state interpretive ambiguity.**
- `D:\projects\github\LayZeeDK\lz-advisor-claude-plugins\plugins\lz-advisor\skills\lz-advisor.execute\SKILL.md` -- current `<verify_before_commit>` block (lines 161-230), specifically the cost-cliff allowance subsection (lines 184-213) that needs tightening. **Authoritative source for current contract text.**
- `D:\projects\github\LayZeeDK\lz-advisor-claude-plugins\.planning\phases\05.4-address-uat-findings-a-k\smoke-tests\E-verify-before-commit.sh` -- current path-c assertion (lines 106-113) that needs supplementing. **Authoritative source for current smoke fixture shape.**
- `D:\projects\github\LayZeeDK\lz-advisor-claude-plugins\.planning\phases\07-address-all-phase-5-x-and-6-uat-findings\07-CONTEXT.md` -- D-05 4-element pattern (lines 86-93) and Claude's Discretion items (lines 110-122) including wip prefix convention guidance. **Authoritative source for design intent.**
- `D:\projects\github\LayZeeDK\lz-advisor-claude-plugins\.planning\phases\07-address-all-phase-5-x-and-6-uat-findings\07-RESEARCH.md` -- Phase 7 baseline research; this Gap 2 research builds on it without re-litigating decisions D-01..D-07.
- `D:\projects\github\LayZeeDK\lz-advisor-claude-plugins\plugins\lz-advisor\agents\advisor.md` -- existing two-density-example precedent (lines 62-76) anchoring the worked-example structural pattern recommended in Candidate 2.

### Secondary (MEDIUM confidence -- official Anthropic / community documentation)

- [Conventional Commits specification v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) -- canonical spec; confirms `wip` is NOT an officially defined type but the spec explicitly allows custom types ("types other than feat and fix MAY be used in your commit messages"). Authoritative for the regex form `^wip(\(.+\))?:` being a Conventional-Commits-compatible custom type.
- [PromptHub: Analysis of the Claude 4 System Prompt](https://www.prompthub.us/blog/an-analysis-of-the-claude-4-system-prompt) -- Anthropic's own production prompt uses positive defaults followed by narrow enumerated exceptions. Anchors Candidate 1's contract-language structure.
- [Claude 4 Best Practices (docs.claude.com)](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices) -- "Provide motivation, not just rules"; "use positive and negative examples." Anchors Candidates 1 + 2.
- [Outcome-based verification catches AI agent self-reports](https://dev.to/moonrunnerkc/ai-coding-agents-lie-about-their-work-outcome-based-verification-catches-it-12b4) -- 5-check model; agents lie systematically; transcript-only verification structurally insufficient. Anchors Candidate 3 (smoke fixture as outcome-based detection layer).
- [DEV Community: Standardizing Git Commit Messages -- the Role of Tags like wip and Beyond](https://dev.to/robinncode/standardizing-git-commit-messages-the-role-of-tags-like-wip-and-beyond-lpe) -- "wip is a temporary marker indicating that the commit includes unfinished work... wip commits should be temporary and squashed/rewritten before merging." Anchors the contract's "convert wip chain to regular commit once Outstanding Verification clears" language.
- [FlowingCode Conventional Commits convention (GitHub)](https://github.com/FlowingCode/DevelopmentConventions/blob/main/conventional-commits.md) -- documents "WIP: Incomplete changes... WIP commits are necessarily not atomical... expected to be replaced by a final logically atomic commit." Anchors the wip-discipline branch-state semantics (uppercase WIP in their convention; lz-advisor uses lowercase per Phase 5 convention).
- [Trunk-Based Development WIP commits technique](https://www.dmitriydubson.com/post/trunk-dev-wip-commits/) -- additional context for wip as a trunk-based-development pattern; not load-bearing for the gap closure but corroborates the wip-as-temporary-state convention.

### Tertiary (LOW confidence -- not directly load-bearing but referenced for completeness)

- [Conventional Commits Issue #38: WIP commits](https://github.com/conventional-commits/conventionalcommits.org/issues/38) -- spec maintainers' position: WIP is not in scope for the spec; users may define custom types.
- [Conventional Commits Issue #137: WIP for trunk-based development](https://github.com/conventional-commits/conventionalcommits.org/issues/137) -- additional discussion confirming wip is a community convention, not spec.
- [Taito CLI version control conventions](https://taitounited.github.io/taito-cli/tutorial/03-version-control/) -- "wip: Work-in-progress (small commits that will be squashed later)." Confirms the squash-before-merge pattern is industry-standard.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The session 2 + 5 failures were caused by language ambiguity, not a deeper workflow disagreement (e.g., the executor knowingly violating the rule for performance reasons) | Empirical signal analysis | LOW -- session-notes.md line 95 explicitly classifies it as "the per-commit reading" interpretive ambiguity; the executor was reasoning about the rule's scope, not bypassing it. If wrong, the fix would need behavioral incentives (e.g., advisor refuse-or-flag rule extension), not just language tightening. |
| A2 | Sonnet 4.6 will reliably interpret the tightened contract language correctly when it includes both positive default and explicit carve-out plus motivation | Recommended contract language | MEDIUM -- Anthropic's own production prompts use this exact structure successfully [CITED: prompthub.us], but Sonnet 4.6 has known empirical leak rates on similar compliance rules (~3% per [CITED: buildthisnow.com]). The smoke fixture (Candidate 3) is the load-bearing detection layer that compensates for the residual leak rate. |
| A3 | `git diff --stat HEAD~1..HEAD` is a deterministic, agent-readable signal for the trailer-only carve-out detection | Recommended contract language + Smoke fixture extension design | LOW -- standard Git invocation, exit code 0 + parseable output. Implementation risk is the regex parse of the stat output; mitigated by following the existing fixture's regex patterns. |
| A4 | Path-d violation should exit 2 (not 1) so the per-release regression dashboard can categorize gap-2 violations separately from generic smoke-fixture failures | Smoke fixture extension design | LOW -- Bash exit-code semantics; planner may pick alternative codes if existing fixtures use exit 2 for other purposes. |
| A5 | The historical session 2 + 5 commits will FAIL the new path-d assertion in `--replay` mode under the tightened contract, validating that the fix would have caught the gap if landed earlier | Smoke fixture extension design (replay capability) | LOW -- I have not actually run the proposed fixture against the commits in this research session; the assumption is based on reading the commit subjects and bodies. Plan 07-08 should empirically run the replay as part of acceptance criteria. |
| A6 | The carve-out's "ONLY records additional Verified: trailers" criterion is correctly captured by "ZERO file changes" detection | Recommended contract language | LOW -- semantic equivalence: a trailer is a commit message body line; if no files changed, the only thing the commit added is in the message body; if Verified: trailers are present, they ARE the only addition. The conservative threshold has no known false negatives on the empirical commits. |

**Status:** All A-claims are LOW or MEDIUM risk; none are blocking for Plan 07-08 to proceed. A2 is the main residual risk, and Candidate 3 (smoke fixture) is specifically architected to compensate for it.

## Open Questions

1. **Replay validation timing:** When in Plan 07-08's task ordering should the `--replay 8c25c9e` and `--replay 06af4cf` empirical replay land? Suggestion: as the LAST task, after both contract language and smoke fixture extension are in place. The replay confirms the fix would have caught the historical gap; if it doesn't, contract or fixture needs refinement.
   - What we know: the new path-d assertion is designed to detect the empirical pattern (non-wip + Outstanding Verification + non-zero file changes).
   - What's unclear: whether the regex `^wip(\(.+\))?:|^chore\(wip\):` exactly matches the desired wip-prefix forms (the planner may prefer a tighter or looser form per OQ-1).
   - Recommendation: Plan 07-08 ships the replay as an acceptance-criteria task; if exit 2 is observed on both commits, gap is closed structurally. UAT-cycle empirical confirmation lands later.

2. **Coordination with 07-VERIFICATION.md amendment:** Plan 07-08 closes Gap 2; does it also need to update 07-VERIFICATION.md to mark Gap 2 as CLOSED (or does that fall to a future Phase 7 sealing audit)?
   - Recommendation: Plan 07-08 SHOULD update 07-VERIFICATION.md (similar to how 06-VERIFICATION.md gets amended by Plan 07-06). Adds an "Amendment 1: Gap 2 closed" section recording the contract language landed, the smoke fixture extension, and the empirical replay results.

3. **Co-landing with Gap 1 (07-07):** Both gap-closure plans (07-07 ToolSearch precondition strengthening, 07-08 wip-discipline language tightening) are independent of each other. Should they be sequenced or run in parallel?
   - Recommendation: Independent. Plan 07-07 modifies `<context_trust_contract>` byte-identical canon across 4 SKILL.md files; Plan 07-08 modifies a single block in `lz-advisor.execute/SKILL.md` `<verify_before_commit>`. No file overlap; can ship in either order or in parallel via separate worktrees.

## Environment Availability

This research is text-only (analysis of existing artifacts + web search for documentation). No external dependencies required. Plan 07-08 implementation will require:

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Git Bash on Windows arm64 | Smoke fixture execution | yes (verified per 07-RESEARCH.md project constraints) | bundled with Git for Windows | none needed |
| `rg` (ripgrep) | Smoke fixture grep operations | yes (verified per CLAUDE.md content-search section) | Chocolatey x86_64 | `git grep` for tracked files |
| `claude` CLI (Claude Code) | UAT replay invocations | yes (project depends on it for UAT replay) | per global CLAUDE.md | none |
| Node.js (for `extract-advisor-sd.mjs`) | Existing fixture infrastructure | yes (verified per 07-RESEARCH.md Validation Architecture) | FNM-managed | none |

No new external dependencies introduced by the gap-2 fix.

## Validation Architecture

Per `.planning/config.json` workflow.nyquist_validation (treating absent as enabled per gsd-phase-researcher contract).

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Bash + `rg` smoke fixtures (existing) + `claude -p` UAT replay (existing) |
| Config file | none -- fixtures are standalone shell scripts |
| Quick run command | `bash .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/E-verify-before-commit.sh` |
| Full suite command | `bash .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/run-all.sh` (existing convention from Phase 5.4) |

### Gap-2 Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GAP-2-REQ-1 | SKILL.md text states subject MUST use wip: prefix when Outstanding Verification populated | structural | `git grep -c -F "subject MUST use the \`wip:\` prefix" plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` (expect >=1) | Plan 07-08 will land this |
| GAP-2-REQ-2 | SKILL.md worked example contains all three shapes (correct wip, incorrect non-wip, carve-out trailer-only) | structural | `git grep -c -F "Worked example: wip subject + Outstanding Verification" plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` (expect >=1) AND `git grep -c -F "Shape 1 (CORRECT)"` (expect >=1) AND `git grep -c -F "Shape 2 (INCORRECT"` (expect >=1) AND `git grep -c -F "Shape 3 (CORRECT carve-out)"` (expect >=1) | Plan 07-08 will land this |
| GAP-2-REQ-3 | Smoke fixture E-verify-before-commit.sh contains path-d assertion | structural | `git grep -c -F "PATH_D_VIOLATION" .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/E-verify-before-commit.sh` (expect >=1) | Plan 07-08 will land this |
| GAP-2-REQ-4 | Smoke fixture exit codes are differentiated (0 pass / 1 no-path / 2 violation) | behavioral | `bash E-verify-before-commit.sh; echo $?` reports 0, 1, or 2 depending on synthesized scenario | Plan 07-08 will land this |
| GAP-2-REQ-5 | Empirical replay against commits 8c25c9e and 06af4cf exits 2 (violation detected) | empirical | `bash E-verify-before-commit.sh --replay 8c25c9e; echo $?` AND `bash E-verify-before-commit.sh --replay 06af4cf; echo $?` BOTH report 2 | Plan 07-08 will land this |

### Sampling Rate

- **Per task commit (Plan 07-08):** `bash E-verify-before-commit.sh` (verifies the fixture itself runs without syntax errors after extension)
- **Per wave merge:** Full smoke suite via `run-all.sh`
- **Phase gate (07-08 closure):** Empirical replay against historical commits per GAP-2-REQ-5

### Wave 0 Gaps

- [ ] None -- existing test infrastructure (Bash + `rg` + `claude -p`) covers all gap-2 requirements. Plan 07-08 extends existing fixture, does not create new framework.

## Security Domain

Per `.planning/config.json` security_enforcement (assumed enabled).

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | not applicable to commit-message contract |
| V3 Session Management | no | not applicable |
| V4 Access Control | no | not applicable |
| V5 Input Validation | yes | smoke fixture parses commit subjects/bodies via `rg` regex; regex must reject malformed inputs gracefully (existing fixture pattern handles this) |
| V6 Cryptography | no | no cryptography in scope |

### Known Threat Patterns for {bash + git fixture stack}

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Untrusted commit subject containing shell metacharacters | Tampering | Use `printf '%s\n'` (existing fixture pattern at lines 86, 108) instead of `echo` -- already in place |
| Replay flag accepting arbitrary SHA reference | Tampering | `git show --no-patch` is read-only; SHA is consumed by Git as ref-spec (no shell expansion); existing fixture treats Git refs safely. Validate SHA format with `rg '^[0-9a-f]{6,40}$'` before passing to `git show` (defense-in-depth) |
| Smoke fixture writing to `$SCRATCH` accepting external path | Information Disclosure | `mktemp -d` per existing fixture line 13 generates unique temp directories; cleaned up via trap. Already mitigated. |

No new security surfaces introduced by gap-2 fix. The replay capability adds a single new external input (the SHA flag), mitigated by Git's read-only `git show` semantics.

## Metadata

**Confidence breakdown:**
- Empirical signal analysis: HIGH -- direct quotes from session-notes.md commits 8c25c9e + 06af4cf + 15d8fac
- P8-13 hypothesis validation: HIGH -- empirical refinement of detection criterion (`git diff --stat`) is deterministic
- Recommended contract language: MEDIUM-HIGH -- structure follows Anthropic's own pattern [CITED: prompthub.us], but Sonnet 4.6 leak rates [CITED: buildthisnow.com] are non-zero residual
- Recommended worked example: HIGH -- repo precedent (advisor.md two density examples) and Claude best practices [CITED: dreamhost.com] both anchor the three-shape pattern
- Smoke fixture extension design: HIGH -- existing fixture patterns + standard Bash/Git primitives + empirical replay validation
- Open questions: MEDIUM -- design choices that don't block research closure but warrant planner judgment

**Research date:** 2026-05-01
**Valid until:** 2026-05-31 (30 days for stable; the underlying `<verify_before_commit>` block, smoke-fixture pattern, and Conventional Commits convention are stable; only Sonnet 4.6 model behavior could shift, which would not invalidate the contract language but would shift the empirical leak rate)

## RESEARCH COMPLETE
