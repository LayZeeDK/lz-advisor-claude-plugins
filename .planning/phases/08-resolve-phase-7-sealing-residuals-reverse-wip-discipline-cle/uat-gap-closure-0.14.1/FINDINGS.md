# UAT Gap-Closure 0.14.1 - FINDINGS

**Verdict: GAP-S9 and GAP-S10 behaviorally PROVEN on plugin lz-advisor 0.14.1.** All 8 assertions PASS.

- Target: `D:/projects/github/LayZeeDK/ngx-smart-components` @ branch `uat/gap-closure-v0_14_1` (off `main` 019a26a)
- Plugin under test: lz-advisor 0.14.1 (`--plugin-dir` absolute); executor Sonnet, advisor Opus
- Scenario: canonical version-agnostic Compodoc+Storybook signal-docs prompt (memory `project_compodoc_uat_initial_plan_prompt`)
- Date: 2026-05-31

## Why this scenario tests the generic fix (not domain logic)

The plugin contains **no ngx-smart-components/Compodoc behavior logic** -- the fixes are generic prompt rules (E.3 change-surface -> verify-target; Phase 5 pack-then-trust). Compodoc/Storybook appear only as illustrative examples. This scenario was chosen because it naturally instantiates BOTH failure conditions: (a) a Storybook/Nx-config change surface (GAP-S9), and (b) a component file named `ngx-smart-components.ts` -- NOT `*.component.ts`, the exact glob trap that broke the advisor (GAP-S10). The UAT proves the generic rule yields correct domain-specific behavior via runtime derivation.

## Grade

| # | Assertion | Source | Verdict |
|---|-----------|--------|---------|
| S9-P1 | Plan emits a final Validate step | S1 plan step 9 | PASS |
| S9-P2 | Validate `Run:` targets `build-storybook`, not `nx test` | S1 plan: `npm exec nx build-storybook ngx-smart-components` | PASS |
| S9-E1 | Executor verifies with `nx build-storybook`, not `nx test` | S2d Bash: `rtk npm exec nx build-storybook ngx-smart-components` | PASS |
| S9-E2 | Stale-tooling freshness awareness | S2d: `rm -f documentation.json` before rebuild + `npm exec nx` (workspace-local) + grep regenerated JSON | PASS |
| S10-1 | Phase 5 consult packs `## Relevant File Contents` (post-change content, not prose) | S2d advisor consult #2 prompt sections: Review Scope / Prior Advisor Guidance / Changes Made (commit a31ba83) / Verification Result / **Relevant File Contents** / Request | PASS |
| S10-2 | Advisor returns numbered synthesis | S2d advisor output #2: numbered 1-4 + Critical block | PASS |
| S10-3 | Advisor synthesizes from packed content, no glob-trap disk-hunt | advisor subagent JSONL: 3 tool calls = Glob `.storybook/tsconfig.json`, Read `.storybook/tsconfig.json`, Read `tsconfig.lib.json` (targeted config verification). Did NOT glob for `ngx-smart-components.ts` (packed). maxTurns=3 used, full synthesis produced. | PASS |
| Smoke | Committed state builds clean | `nx build-storybook` exit 0; `documentation.json` has `sampleInput`+`sampleOutput`; static build at `dist/storybook/ngx-smart-components` | PASS |

S2d committed the work in 2 commits (`a31ba83`, `1e09c25`) -- 10 files, matching the plan. Advisor maxTurns stayed 3 / effort high (no regression).

## Run history (4 execute attempts; 1 valid)

| Session | Mode | Outcome | Cause |
|---------|------|---------|-------|
| S1 plan | default | VALID | Produced plan; advisor consulted; web research fired (1 WebSearch + 1 WebFetch). $1.32, 41 turns. |
| S2 execute | acceptEdits | INVALID | `/lz-advisor.execute @plans/...` -- the `@` mention broke slash-command recognition; model fell back to the Skill TOOL (`lz-advisor:lz-advisor-execute`, correct name) which returned is_error under acceptEdits (launch denial); manual fallback applied edits, then blocked on `nx` permission. |
| S2b execute | acceptEdits | STOPPED | Manually stopped to switch permission mode. |
| S2c execute | dangerously-skip-permissions | INVALID | Approach working (made edits, began Phase 5 reads) but hit the **5-hour session usage limit** (HTTP 429, out_of_credits) at turn 15. |
| S2d execute | **auto** | **VALID** | Full 6-phase run; 2 advisor consults; built storybook; committed. $1.71, 45 turns, ~6.7 min. |

## Operational learnings (reusable for future headless UAT)

1. **`@file` mention breaks `/skill` slash-command recognition in `claude -p`.** Use a prose path (`/lz-advisor.execute Implement the plan in plans/x.plan.md`); the skill Reads it during orient. The `@` is fine interactively but not in `-p`.
2. **Use `--permission-mode auto` for headless skill UAT.** `acceptEdits` denies the Skill-tool launch (returns is_error); `--dangerously-skip-permissions` works but auto (classifier-gated) is preferred and sufficient.
3. **Nested `claude -p` draws from the same 5-hour session usage pool.** A multi-session UAT can exhaust it mid-run (S2c). Budget accordingly or stage across windows.
4. Skill fully-qualified name normalizes dot->hyphen: `lz-advisor.execute` -> `lz-advisor:lz-advisor-execute`.

## Caveat (honest)

Same-scenario example-priming: Compodoc/Storybook is both the in-plugin teaching example and this UAT scenario. E.3 states the rule generically (lists vite/next/jest/tsc) and the `*.component.ts` framing is convention-generic, but the strongest generality proof would be a DIFFERENT ecosystem the plugin never uses as an example (e.g., a Vite/webpack config change, or a Cargo/Gradle build-config change). Recommended as an optional follow-up.

## Cost

Approx claude usage: S1 $1.32 + S2 $0.42 + S2c $0.28 + S2d $1.71 (+ S2b partial) ~= $3.7. Independent smoke = nx only (no claude usage).
