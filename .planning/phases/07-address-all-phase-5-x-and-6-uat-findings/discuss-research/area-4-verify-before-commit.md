# Area 4 Research: Verify-before-commit (Finding E.1+E.2)

## Research questions

1. What's the canonical pattern for verification gates in coding agents (commit-time, pre-commit, post-implementation)?
2. How do production agents handle the cost-cliff at long-running validations (test suites, build, dev server startup)?
3. What's the empirical evidence on plan-step-shape rules ("Run: command + Verify: condition" must execute)?
4. How effective is the "Verified:" trailer convention or alternative empirical-anchor patterns?

## Findings

### Stop-hook verification gate (canonical Claude Code pattern)

From the claudefa.st three-layer architecture:

> "Macro validation fires when the agent tries to stop. Stop hooks check that the full output meets structural requirements: required files exist, exports are present, tests pass. The agent cannot declare 'done' until the checks pass."

Critical implementation detail:

> "Without checking stop_hook_active, the hook blocks every stop attempt. Claude fixes the tests, tries to stop, gets blocked again, fixes more, tries to stop, gets blocked again. Infinite loop. Always check this field."

Source: <https://claudefa.st/blog/tools/hooks/self-validating-agents>

**Constraint for lz-advisor:** PROJECT.md locks "No hooks for v1." Phase 7 must implement the verification-gate semantics in **prompt-layer prose** + **smoke fixture** + **subagent UAT replay**, not in Stop hooks. The mechanism shifts from runtime enforcement to prompt-construction enforcement.

### Three-layer architecture maps to lz-advisor

| Layer | Hooks-based | lz-advisor (prompt-layer) |
|---|---|---|
| Micro | PostToolUse linter/typecheck | Each SKILL.md `<verify_before_commit>` block + agent Output Constraint |
| Macro | Stop hook structural requirements | Smoke fixture (`E-verify-before-commit.sh` + DEF assertions) |
| Team | Read-only validator agent | UAT replay subagent (existing harness) + reviewer-as-safety-net (Finding G) |

The 3-layer pattern is preserved; only the enforcement mechanism shifts from hooks to prose+fixtures.

### Outcome-based verification (don't trust agent self-reports)

From the AI coding agents lie about their work analysis:

> "Check what actually happened instead of what the agent said happened."

Five-check verification:
- `git_diff` — detect file changes (failure: no modifications)
- `build_exec` — compile (failure: non-zero exit)
- `test_exec` — run test suite (failure: non-zero exit)
- `file_existence` — confirm expected outputs (failure: missing files)
- `transcript` — parse agent claims (demoted to `required: false`)

Failure classification taxonomy: build failure / test failure / missing files / no changes. Each triggers targeted repair strategies.

> "On final retry, the system shifts priority: 'get something working over getting something complete' — scope reduction protects correctness."

Source: <https://dev.to/moonrunnerkc/ai-coding-agents-lie-about-their-work-outcome-based-verification-catches-it-12b4>

**Direct relevance to E.2 (plan-step-shape rule):** the 8th UAT showed "executor STILL skipped" plan Step 4's `Run: pnpm nx storybook` directive. Outcome-based verification would catch this — if the plan-step-shape rule is implemented in the smoke fixture, it grep-checks the trace for the corresponding Bash invocation and fails if absent.

### TDD anchor as empirical-verification pattern

From Cursor's coding best practices (echoed in MIT's Missing Semester agentic-coding lecture):

> "A reliable agentic workflow is to separate test writing from implementation. The moment you mix them, agents will 'helpfully' change tests to match their implementation, losing the signal. First ask the agent to write tests based on explicit input and output pairs, and insist it does not write implementation. Run the tests and confirm they fail for the right reason. Commit the tests. Ask the agent to implement until the tests pass, and tell it not to modify the tests."

Source: <https://cursor.com/blog/agent-best-practices>

**Direct relevance to E.1 (hedge marker resolution):** "Verify X before acting" hedges are essentially un-anchored claims. The TDD pattern provides the anchoring mechanism — convert the hedge into an executable test that fails until verified, then verify.

For lz-advisor, the equivalent mechanism would be:
- Hedge marker in plan/source material → advisor's refuse-or-flag rule fires Critical block → executor performs verification action (Read/WebSearch/Bash) → synthesizes pv-* anchor block → commits with Verified: trailer.

### Cost-cliff at long-running validations (empirical, 8th UAT)

The 8th UAT's STRONG POSITIVE evidence:

- 1 of 4 Step 6 directives skipped (`npx nx storybook` — long-running async)
- 3 of 4 ran (`npm install`, `git status`, `git check-ignore` — cheap synchronous)
- Critical-flag mechanism worked when triggered (advisor flagged Husky as Critical → executor ran `npm ls husky` + `git grep postinstall`)

This matches the broader pattern: agents follow short cheap directives reliably, defer expensive ones.

### WIP commit + Outstanding Verification pattern

From the outcome-based verification analysis (and consistent with conventional commits practice):

> "On final retry, the system shifts priority: 'get something working over getting something complete'"

For lz-advisor, the analog is:
- Long-running validations (`nx storybook`, full test suites, dev server startup) → commit marked `wip:` + `## Outstanding Verification` section in commit body listing pending checks
- Cheap synchronous validations (`npm ls`, `git grep`, `git check-ignore`, lint) → execute before commit, add `Verified:` trailer

This matches the empirical 8th UAT pattern AND the Cursor/Honk one-shot pattern: separate the verifier signal from the agent's narrative.

### Detection vs verification (commit metadata)

From the agentic-coding GitHub commit-trace research:

> "Coding agents often leave visible traces of their use, in the form of a specific pattern in commit messages or metadata. Heuristics aren't perfect, they don't produce many false positives."

Source: <https://arxiv.org/html/2601.18341v1>

**Caveat:** commit-message trailers like `Verified: <claim>` are **detection signals**, not **verification mechanisms**. The trailer asserts the agent ran the check; the smoke fixture validates that the trace shows the corresponding Bash/Read tool use.

> "Don't trust agent self-reports in commit messages or transcripts as verification. Instead, anchor to empirical signals — running tests, type checkers, linters, build systems — and use commit-message trailers/metadata only as detection signals."

This means a `Verified: <claim>` trailer needs paired smoke-fixture support (grep the trace for the corresponding tool_use), otherwise it's just another agent self-report.

### TeammateIdle hook (relevant analog despite no-hooks constraint)

From Claude Code Hooks reference:

> "Runs when an agent team teammate is about to go idle after finishing its turn. Use this to enforce quality gates before a teammate stops working, such as requiring passing lint checks or verifying that output files exist. When a TeammateIdle hook exits with code 2, the teammate receives the stderr message as feedback and continues working instead of going idle."

Source: <https://code.claude.com/docs/en/hooks>

**Lz-advisor analog:** advisor agent's refuse-or-flag rule. When the executor's final-consult prompt contains a hedge marker without resolution, advisor's Strategic Direction returns: "Unresolved hedge: X. Verify Y before/after committing." The executor must respond — same effect as TeammateIdle exit code 2, achieved at prompt layer.

### Verification bottleneck (industry caveat)

From the augmentcode analysis:

> "Recent survey data suggests a 'verification bottleneck' has emerged: only 48% of developers consistently check AI-assisted code before committing it, even though 38% find that reviewing AI-generated logic actually requires more effort than reviewing human-written code."

Source: <https://www.augmentcode.com/blog/best-practices-for-using-ai-coding-agents>

**Implication for Phase 7 priority:** Finding E + Finding G as a paired plan is empirically warranted — upstream prevention (E) closes ~half the gap; downstream detection (G) closes more.

## Synthesis

The research converges on a 4-element pattern for lz-advisor:

1. **Advisor refuse-or-flag** (E.1's primary mechanism) — when hedge markers survive into source material, advisor's Strategic Direction returns "Unresolved hedge: X. Verify Y before/after committing." Empirically validated by 8th UAT (Critical-flag triggered verification).
2. **Plan-step-shape rule** (E.2's primary mechanism) — `Run: <command>` + `Verify: <conditions>` in numbered plan steps MUST execute as Bash before commit. Smoke fixture grep-checks the trace.
3. **Cost-cliff handling** — cheap synchronous validations execute pre-commit; long-running async go to `wip:` commit + `## Outstanding Verification` section. Matches 8th UAT empirical pattern (3 of 4 cheap directives ran; the long-running one didn't).
4. **`Verified:` trailer + smoke-fixture pairing** — trailer is a detection signal; the fixture validates the trace shows the corresponding tool_use. NOT trusted as standalone verification.

For Finding G (downstream safety-net), the parallel pattern is:
5. **Reviewer scan criterion: "Verification gaps in implementation of hedged claims"** — reviewer flags commits implementing hedged upstream claims without `Verified:` trailer or pv-* anchor. Anchored in Spotify Honk's one-shot pass/fail principle.

## Updated trade-off table for the user

### E.1 (hedge markers in plan rationale)

| Approach | Empirical anchor | Pros | Cons |
|---|---|---|---|
| **Strict: every hedge → mandatory verification** | TDD anchor pattern (Cursor, MIT) | Closes E.1 deterministically; prevents shipping unverified work | Costs the +3% quality drop Anthropic measured on length caps; long-running validations create false-positive rejections |
| **Cost-cliff aware: advisor refuse-or-flag + WIP commit pattern** | 8th UAT STRONG POSITIVE (Critical-flag triggered verification); Spotify Honk one-shot pass/fail; outcome-based verification 5-check model | Matches empirical 8th UAT pattern (cheap synchronous Run directives DO run when advisor flags Critical); preserves long-running validations as Outstanding Verification | Two-tier mechanism (trigger threshold + WIP fallback) is more code than strict approach |
| **No-op (rely on existing Plan 06-05 hedge-marker preservation)** | Phase 6 Plan 06-05 prompt-layer rule (validated by 8 UATs) | Zero additional code | 8 UATs show prompt-layer preservation works but doesn't trigger verification — empirical gap |

### E.2 (explicit Run/Verify directives in plan steps)

| Approach | Empirical anchor | Pros | Cons |
|---|---|---|---|
| **Plan-step-shape rule: `Run:` directives MUST execute as Bash** | Outcome-based verification 5-check model (`build_exec`/`test_exec`); Cursor TDD anchor | Closes E.2 deterministically; smoke fixture grep-checks the trace | May force long-running validations to block commit (cost-cliff conflict) |
| **Plan-step-shape rule + cost-cliff allowance** | 8th UAT empirical pattern (3 of 4 cheap directives ran; long-running 1 of 4 didn't); WIP-commit pattern | Matches empirical pattern; cheap directives execute pre-commit; long-running go to Outstanding Verification | Two-tier; threshold for "cheap vs long-running" needs heuristic (timeout-based? command-name pattern?) |

### Both E.1 + E.2 (recommended bundling)

| Approach | Empirical anchor | Pros | Cons |
|---|---|---|---|
| **Paired: advisor refuse-or-flag + plan-step-shape rule + cost-cliff allowance + Verified: trailer convention** | All four research findings converge: 8th UAT, Cursor TDD, outcome-based verification, Spotify Honk | Closes E.1 + E.2 together with consistent mechanism; smoke fixture exercises full chain | Most surface area but each rule is small; bundles cleanly with Finding G safety net |
